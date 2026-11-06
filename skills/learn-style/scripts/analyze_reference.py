#!/usr/bin/env python3
"""
analyze_reference.py - Core Video Style Reverse-Engineering Script for learn-style.
1. Downloads video via yt-dlp (with --cookies-from-browser / --cookies-file fallback) or uses a local video file.
2. Uses ffprobe & ffmpeg to detect every shot/chapter boundary (auto-adapting for persistent-HUD motion graphics),
   calculates Cuts per 10s, Median/Mean Shot Length (ASL), and Hook Cut Cadence (0-4s).
3. Measures Micro-Change / 2-Second Fuse Telemetry (prop spawns, kinetic word reveals, counter ticks, and
   full-screen RANG color-flash inversions) at 12 fps via OpenCV/Pillow stage diffing.
4. Generates:
   - shots_sheet.jpg: Contact sheet of every detected shot/chapter with timestamps.
   - hook_12fps.jpg: 12 fps frame-by-frame contact sheet of the opening hook (0.0s - 4.0s).
   - trans_01_12fps.jpg .. trans_03_12fps.jpg: 12 fps frame strips around top transitions (+/- 0.5s).
5. Measures camera zoom/pan per shot mathematically (via OpenCV affine optical flow)
   and extracts dominant background, text, and highlight Hex colors from the caption/stage regions.
6. Transcribes speech with word-level timestamps via faster-whisper (auto-using NVIDIA CUDA float16 on RTX GPUs),
   with an automatic ffmpeg silencedetect + transcript fallback when faster-whisper is offline.
"""
import argparse
import glob
import json
import math
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageStat


def run_cmd(cmd, timeout=300):
    return subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)


def download_video(source, out_dir: Path, cookies_browser=None, cookies_file=None) -> Path:
    if os.path.exists(source):
        dst = out_dir / Path(source).name
        if Path(source).resolve() != dst.resolve():
            shutil.copy2(source, dst)
        return dst

    ytdlp = shutil.which("yt-dlp")
    if not ytdlp:
        raise RuntimeError("yt-dlp is not installed or not on PATH. Run setup_check.py first or provide a local .mp4 file.")

    out_tmpl = str(out_dir / "ref_video.%(ext)s")
    base_cmd = [
        ytdlp, "--no-playlist",
        "-f", "bv*[height<=1080][ext=mp4]+ba[ext=m4a]/b[height<=1080][ext=mp4]/b",
        "--merge-output-format", "mp4",
        "-o", out_tmpl,
        source,
    ]
    attempts = [[]]
    if cookies_file and os.path.exists(cookies_file):
        attempts.insert(0, ["--cookies", cookies_file])
    elif cookies_browser:
        attempts.append(["--cookies-from-browser", cookies_browser])
    else:
        for br in ["chrome", "edge", "brave", "firefox"]:
            attempts.append(["--cookies-from-browser", br])

    last_err = ""
    for extra in attempts:
        p = run_cmd(base_cmd[:1] + extra + base_cmd[1:], timeout=180)
        mp4s = sorted(out_dir.glob("ref_video*.mp4"))
        if p.returncode == 0 and mp4s:
            return mp4s[0]
        last_err = (p.stderr or p.stdout or "")[-500:]

    raise RuntimeError(
        f"yt-dlp could not download {source}. If login is required, pass --cookies-file cookies.txt or download the .mp4 manually.\nDetails: {last_err}"
    )


def probe_video(video_path: Path) -> dict:
    cmd = [
        "ffprobe", "-v", "error",
        "-select_streams", "v:0",
        "-show_entries", "stream=width,height,r_frame_rate,duration:format=duration",
        "-of", "json", str(video_path)
    ]
    p = run_cmd(cmd, timeout=30)
    info = json.loads(p.stdout or "{}")
    stream = (info.get("streams") or [{}])[0]
    fmt = info.get("format") or {}
    w = int(stream.get("width") or 1080)
    h = int(stream.get("height") or 1920)
    fps_str = stream.get("r_frame_rate") or "30/1"
    try:
        num, den = fps_str.split("/")
        fps = round(float(num) / max(1.0, float(den)), 3)
    except Exception:
        fps = 30.0
    dur = float(stream.get("duration") or fmt.get("duration") or 0.0)
    aspect = "9:16" if h > w else ("1:1" if h == w else "16:9")
    return {"width": w, "height": h, "fps": fps, "duration": round(dur, 3), "aspect": aspect}


def _ffmpeg_scene_cuts(video_path: Path, duration: float, threshold: float, min_gap: float = 0.22) -> list:
    cmd = [
        "ffmpeg", "-hide_banner", "-i", str(video_path),
        "-vf", f"select='gt(scene,{threshold})',showinfo",
        "-f", "null", "-"
    ]
    p = run_cmd(cmd, timeout=180)
    log = (p.stderr or "") + "\n" + (p.stdout or "")
    cut_times = [0.0]
    for m in re.finditer(r"pts_time:\s*([0-9.]+)", log):
        t = round(float(m.group(1)), 3)
        if t - cut_times[-1] >= min_gap and t < duration - 0.15:
            cut_times.append(t)
    return cut_times


def detect_shots(video_path: Path, duration: float, threshold: float = 0.27) -> tuple:
    """Returns (shots, macro_flash_cuts, used_threshold).
    If a motion-graphics video has a persistent dark HUD grid, high threshold (0.20+) only catches
    full-screen color flashes. We capture those as macro_flash_cuts and automatically lower the
    chapter threshold (0.042) to capture every chapter/board transition (~12-16 chapters per 50s Reel).
    """
    primary_cuts = _ffmpeg_scene_cuts(video_path, duration, threshold, min_gap=0.25)
    macro_flash_cuts = [t for t in primary_cuts if t > 0]
    used_threshold = threshold

    if duration >= 20.0 and len(primary_cuts) < 8:
        # Persistent HUD canvas detected -> use chapter-level threshold (0.042) with 1.4s minimum chapter spacing
        chap_cuts = _ffmpeg_scene_cuts(video_path, duration, 0.042, min_gap=1.45)
        if len(chap_cuts) >= len(primary_cuts):
            primary_cuts = chap_cuts
            used_threshold = 0.042

    shots = []
    for i, t0 in enumerate(primary_cuts):
        t1 = primary_cuts[i + 1] if i + 1 < len(primary_cuts) else duration
        dur = round(max(0.05, t1 - t0), 3)
        shots.append({"index": i + 1, "start": t0, "end": round(t1, 3), "duration": dur})
    return shots, macro_flash_cuts, used_threshold


def measure_micro_changes_and_flashes(video_path: Path, duration: float, out_dir: Path) -> dict:
    """Samples the video at 10 fps across the active central stage + headline region to measure:
    - Micro visual changes (prop spawns, text reveals, counter updates, card unlocks)
    - Maximum static screen hold (testing the '2-Second Rule')
    - Full-screen color flash ('RANG') intervals where screen luminance spikes
    """
    tmp_dir = out_dir / ".micro_10fps"
    tmp_dir.mkdir(exist_ok=True)
    run_cmd([
        "ffmpeg", "-y", "-i", str(video_path),
        "-vf", "fps=10,scale=180:320", "-q:v", "5",
        str(tmp_dir / "f_%04d.jpg")
    ], timeout=90)
    frames = sorted(tmp_dir.glob("f_*.jpg"))
    if not frames:
        shutil.rmtree(tmp_dir, ignore_errors=True)
        return {}

    import numpy as np
    micro_times = [0.0]
    flash_frames = []
    prev_arr = None

    for idx, fp in enumerate(frames):
        t = round(idx / 10.0, 2)
        im = Image.open(fp).convert("RGB")
        arr = np.asarray(im, dtype=np.float32)
        # Active stage + headline crop (exclude very top/bottom static watermarks)
        roi = arr[24:285, 10:170, :]
        mean_luma = float(arr.mean())
        # Check for Acid-Lime / High-Key Full-Screen Flash (luma > 135 on a dark-mode reel)
        if mean_luma > 135.0:
            flash_frames.append(t)

        if prev_arr is not None:
            diff = float(np.abs(roi - prev_arr).mean())
            # A prop spawn, word highlight, card pop, or zoom shift changes ROI by >= 3.2 gray levels
            if diff >= 3.2 and (t - micro_times[-1]) >= 0.30:
                micro_times.append(t)
        prev_arr = roi

    shutil.rmtree(tmp_dir, ignore_errors=True)

    intervals = [round(micro_times[i] - micro_times[i - 1], 2) for i in range(1, len(micro_times))]
    if duration - micro_times[-1] > 0.2:
        intervals.append(round(duration - micro_times[-1], 2))
    s_int = sorted(intervals) if intervals else [duration]
    med_int = round(s_int[len(s_int) // 2], 2)
    max_hold = round(max(s_int), 2)
    micro_per_10s = round((max(1, len(micro_times) - 1) / max(1.0, duration)) * 10.0, 2)

    # Group contiguous flash frames into flash spans
    flash_spans = []
    if flash_frames:
        s0 = flash_frames[0]
        prev_t = s0
        for ft in flash_frames[1:]:
            if ft - prev_t <= 0.35:
                prev_t = ft
            else:
                flash_spans.append({"start": round(s0, 2), "end": round(prev_t + 0.1, 2), "duration": round(prev_t + 0.1 - s0, 2)})
                s0 = ft
                prev_t = ft
        flash_spans.append({"start": round(s0, 2), "end": round(prev_t + 0.1, 2), "duration": round(prev_t + 0.1 - s0, 2)})

    return {
        "total_micro_changes": max(1, len(micro_times) - 1),
        "micro_changes_per_10s": micro_per_10s,
        "median_micro_interval_sec": med_int,
        "max_static_hold_sec": max_hold,
        "passes_2_second_rule": max_hold <= 2.35,
        "color_flash_count": len(flash_spans),
        "color_flash_spans": flash_spans,
    }


def build_contact_sheet(image_paths: list, labels: list, out_path: Path, cols: int = 4, thumb_w: int = 320):
    if not image_paths:
        return
    first = Image.open(image_paths[0])
    aspect = first.height / max(1, first.width)
    thumb_h = int(thumb_w * aspect)
    rows = math.ceil(len(image_paths) / cols)
    pad = 12
    label_h = 26
    sheet_w = cols * thumb_w + (cols + 1) * pad
    sheet_h = rows * (thumb_h + label_h) + (rows + 1) * pad
    sheet = Image.new("RGB", (sheet_w, sheet_h), (14, 15, 20))
    draw = ImageDraw.Draw(sheet)

    for idx, (img_p, lbl) in enumerate(zip(image_paths, labels)):
        r = idx // cols
        c = idx % cols
        x = pad + c * (thumb_w + pad)
        y = pad + r * (thumb_h + label_h + pad)
        try:
            im = Image.open(img_p).convert("RGB").resize((thumb_w, thumb_h), Image.Resampling.LANCZOS)
            sheet.paste(im, (x, y))
            draw.rectangle([x, y + thumb_h, x + thumb_w, y + thumb_h + label_h], fill=(24, 26, 34))
            draw.text((x + 6, y + thumb_h + 5), str(lbl)[:38], fill=(242, 239, 233))
        except Exception:
            pass
    sheet.save(out_path, quality=90)


def extract_shot_frames_and_zooms(video_path: Path, shots: list, out_dir: Path) -> tuple:
    shots_dir = out_dir / "shots"
    if shots_dir.exists():
        shutil.rmtree(shots_dir, ignore_errors=True)
    shots_dir.mkdir(exist_ok=True)
    shot_imgs = []
    shot_labels = []
    zoom_events = []

    try:
        import cv2
        import numpy as np
        has_cv2 = True
    except ImportError:
        has_cv2 = False

    for s in shots[:36]:
        idx = s["index"]
        mid_t = round(s["start"] + s["duration"] * 0.45, 3)
        img_mid = shots_dir / f"shot_{idx:02d}.jpg"
        run_cmd(["ffmpeg", "-y", "-ss", str(mid_t), "-i", str(video_path), "-frames:v", "1", "-q:v", "3", str(img_mid)], timeout=20)
        if img_mid.exists():
            shot_imgs.append(img_mid)
            shot_labels.append(f"#{idx:02d} {s['start']:.2f}s ({s['duration']:.2f}s)")

        # Measure zoom on shots >= 0.8s
        if s["duration"] >= 0.8:
            t_a = round(s["start"] + 0.08, 3)
            t_b = round(s["end"] - 0.08, 3)
            fa = shots_dir / f"z_{idx:02d}_a.jpg"
            fb = shots_dir / f"z_{idx:02d}_b.jpg"
            run_cmd(["ffmpeg", "-y", "-ss", str(t_a), "-i", str(video_path), "-frames:v", "1", "-vf", "scale=360:-1", str(fa)], timeout=15)
            run_cmd(["ffmpeg", "-y", "-ss", str(t_b), "-i", str(video_path), "-frames:v", "1", "-vf", "scale=360:-1", str(fb)], timeout=15)
            if has_cv2 and fa.exists() and fb.exists():
                try:
                    ga = cv2.imread(str(fa), cv2.IMREAD_GRAYSCALE)
                    gb = cv2.imread(str(fb), cv2.IMREAD_GRAYSCALE)
                    pts = cv2.goodFeaturesToTrack(ga, maxCorners=120, qualityLevel=0.01, minDistance=7)
                    if pts is not None and len(pts) >= 8:
                        pts_b, st, _ = cv2.calcOpticalFlowPyrLK(ga, gb, pts, None)
                        good_a = pts[st == 1]
                        good_b = pts_b[st == 1]
                        if len(good_a) >= 6:
                            mat, _ = cv2.estimateAffinePartial2D(good_a, good_b)
                            if mat is not None:
                                scale = round(float(math.hypot(mat[0, 0], mat[1, 0])), 3)
                                if abs(scale - 1.0) >= 0.03:
                                    zoom_events.append({
                                        "shot": idx,
                                        "start": s["start"],
                                        "end": s["end"],
                                        "scale_factor": scale,
                                        "type": "zoom_in" if scale > 1.0 else "zoom_out",
                                        "pct_change": round((scale - 1.0) * 100, 1)
                                    })
                except Exception:
                    pass
            for tmp in (fa, fb):
                if tmp.exists():
                    tmp.unlink()

    build_contact_sheet(shot_imgs, shot_labels, out_dir / "shots_sheet.jpg", cols=4)
    return shot_imgs, zoom_events


def extract_12fps_strips(video_path: Path, shots: list, duration: float, out_dir: Path):
    strips_dir = out_dir / "strips"
    strips_dir.mkdir(exist_ok=True)
    hook_dur = min(4.0, duration)
    run_cmd([
        "ffmpeg", "-y", "-ss", "0", "-t", str(hook_dur), "-i", str(video_path),
        "-vf", "fps=12,scale=260:-1", str(strips_dir / "hook_%03d.jpg")
    ], timeout=45)
    hook_frames = sorted(strips_dir.glob("hook_*.jpg"))
    hook_labels = [f"Hook f{i+1:02d} ({i/12.0:.2f}s)" for i in range(len(hook_frames))]
    build_contact_sheet(hook_frames, hook_labels, out_dir / "hook_12fps.jpg", cols=6, thumb_w=240)

    trans_sheets = []
    for idx, s in enumerate(shots[1:4], start=1):
        cut_t = s["start"]
        t0 = max(0.0, round(cut_t - 0.5, 3))
        span = min(1.0, duration - t0)
        if span <= 0.2:
            continue
        run_cmd([
            "ffmpeg", "-y", "-ss", str(t0), "-t", str(span), "-i", str(video_path),
            "-vf", "fps=12,scale=260:-1", str(strips_dir / f"tr{idx}_%03d.jpg")
        ], timeout=30)
        tr_frames = sorted(strips_dir.glob(f"tr{idx}_*.jpg"))
        tr_labels = [f"Cut@{cut_t:.2f}s ({t0 + i/12.0:.2f}s)" for i in range(len(tr_frames))]
        out_sheet = out_dir / f"trans_{idx:02d}_12fps.jpg"
        build_contact_sheet(tr_frames, tr_labels, out_sheet, cols=6, thumb_w=240)
        if out_sheet.exists():
            trans_sheets.append(out_sheet.name)
    return trans_sheets


def extract_palette_and_caption_zone(shot_imgs: list) -> dict:
    if not shot_imgs:
        return {"dominant_hex": [], "caption_zone_hex": []}

    full_colors = {}
    cap_colors = {}
    for p in shot_imgs[:14]:
        try:
            im = Image.open(p).convert("RGB")
            w, h = im.size
            q_full = im.resize((120, 120)).quantize(colors=6)
            pal = q_full.getpalette()[:18]
            for c_idx, (r, g, b) in enumerate(zip(pal[0::3], pal[1::3], pal[2::3])):
                hx = f"#{r:02X}{g:02X}{b:02X}"
                full_colors[hx] = full_colors.get(hx, 0) + (6 - c_idx)

            # Sample both top headline zone (8%-28% height) and lower caption/badge zone (60%-88% height)
            for y0, y1 in [(0.08, 0.28), (0.60, 0.88)]:
                cap_crop = im.crop((int(w * 0.08), int(h * y0), int(w * 0.92), int(h * y1)))
                q_cap = cap_crop.resize((100, 60)).quantize(colors=6)
                cpal = q_cap.getpalette()[:18]
                for c_idx, (r, g, b) in enumerate(zip(cpal[0::3], cpal[1::3], cpal[2::3])):
                    sat = max(r, g, b) - min(r, g, b)
                    lum = 0.299 * r + 0.587 * g + 0.114 * b
                    if sat > 65 or lum > 215 or lum < 30:
                        hx = f"#{r:02X}{g:02X}{b:02X}"
                        cap_colors[hx] = cap_colors.get(hx, 0) + (8 if sat > 85 else 3)
        except Exception:
            pass

    top_full = [k for k, _ in sorted(full_colors.items(), key=lambda x: -x[1])[:6]]
    top_cap = [k for k, _ in sorted(cap_colors.items(), key=lambda x: -x[1])[:6]]
    return {"dominant_hex": top_full, "caption_zone_hex": top_cap}


def detect_audio_pauses_ffmpeg(video_path: Path) -> list:
    """Uses ffmpeg silencedetect filter to measure breath/emphasis pauses (>= 0.28s) even without faster-whisper."""
    p = run_cmd([
        "ffmpeg", "-hide_banner", "-i", str(video_path),
        "-af", "silencedetect=noise=-32dB:d=0.28",
        "-f", "null", "-"
    ], timeout=60)
    log = (p.stderr or "") + "\n" + (p.stdout or "")
    pauses = []
    for m in re.finditer(r"silence_duration:\s*([0-9.]+)", log):
        d = round(float(m.group(1)), 3)
        if 0.28 <= d <= 3.5:
            pauses.append(d)
    return pauses


def transcribe_and_measure_wpm(video_path: Path, duration: float, out_dir: Path, model_size: str = "small", transcript_text: str = None, hook_words_count: int = None) -> dict:
    result = {
        "engine": None,
        "device": None,
        "word_count": 0,
        "wpm_overall": 0.0,
        "wpm_speaking_only": 0.0,
        "hook_wpm_0_4s": 0.0,
        "pause_count": 0,
        "median_pause_sec": 0.0,
        "avg_words_per_segment": 0.0,
        "words": [],
        "segments": [],
    }
    try:
        from faster_whisper import WhisperModel
        has_whisper = True
    except ImportError:
        has_whisper = False

    if not has_whisper:
        pauses = detect_audio_pauses_ffmpeg(video_path)
        result["pause_count"] = len(pauses)
        result["median_pause_sec"] = round(sorted(pauses)[len(pauses) // 2], 2) if pauses else 0.38
        if transcript_text:
            clean_words = [w for w in re.split(r"\s+", transcript_text.strip()) if w]
            wc = len(clean_words)
            result["engine"] = "multimodal-transcript + ffmpeg-silencedetect"
            result["device"] = "cpu"
            result["word_count"] = wc
            result["wpm_overall"] = round((wc / max(1.0, duration)) * 60.0, 1)
            speak_span = max(1.0, duration - sum(pauses))
            result["wpm_speaking_only"] = round((wc / speak_span) * 60.0, 1)
            hw = hook_words_count if hook_words_count else max(8, int(round(wc * (min(4.0, duration) / max(1.0, duration)))))
            result["hook_wpm_0_4s"] = round((hw / min(4.0, duration)) * 60.0, 1)
        else:
            result["engine"] = "ffmpeg-silencedetect (pass --transcript-text or install faster-whisper for exact WPM)"
        return result

    model = None
    for dev, comp in [("cuda", "float16"), ("cpu", "int8")]:
        try:
            model = WhisperModel(model_size, device=dev, compute_type=comp)
            result["engine"] = f"faster-whisper ({model_size})"
            result["device"] = f"{dev} ({comp})"
            break
        except Exception:
            continue

    if model is None:
        return result

    segments_gen, _ = model.transcribe(str(video_path), word_timestamps=True, vad_filter=True)
    words = []
    segs = []
    for seg in segments_gen:
        seg_words = []
        for w in (seg.words or []):
            w_obj = {"word": w.word.strip(), "start": round(float(w.start), 3), "end": round(float(w.end), 3)}
            if w_obj["word"]:
                words.append(w_obj)
                seg_words.append(w_obj)
        segs.append({
            "start": round(float(seg.start), 3),
            "end": round(float(seg.end), 3),
            "text": seg.text.strip(),
            "word_count": len(seg_words)
        })

    result["words"] = words
    result["segments"] = segs
    result["word_count"] = len(words)

    if words and duration > 0:
        result["wpm_overall"] = round((len(words) / duration) * 60.0, 1)
        hook_words = [w for w in words if w["start"] < min(4.0, duration)]
        result["hook_wpm_0_4s"] = round((len(hook_words) / min(4.0, duration)) * 60.0, 1)

        pauses = []
        for i in range(1, len(words)):
            gap = round(words[i]["start"] - words[i - 1]["end"], 3)
            if gap >= 0.35:
                pauses.append(gap)
        result["pause_count"] = len(pauses)
        if pauses:
            s_p = sorted(pauses)
            result["median_pause_sec"] = round(s_p[len(s_p) // 2], 2)
        speak_span = max(1.0, (words[-1]["end"] - words[0]["start"]) - sum(pauses))
        result["wpm_speaking_only"] = round((len(words) / speak_span) * 60.0, 1)
        if segs:
            result["avg_words_per_segment"] = round(sum(s["word_count"] for s in segs) / len(segs), 1)

    with open(out_dir / "transcript_words.json", "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2)
    return result


def main():
    ap = argparse.ArgumentParser(description="Analyze a reference video for learn-style.")
    ap.add_argument("source", help="Video URL or local .mp4 path")
    ap.add_argument("--out", required=True, help="Output directory for this reference")
    ap.add_argument("--scene-threshold", type=float, default=0.27, help="FFmpeg scene threshold (default 0.27)")
    ap.add_argument("--whisper-model", default="small", help="faster-whisper model size (tiny/base/small/medium)")
    ap.add_argument("--cookies-browser", default=None, help="Browser for yt-dlp cookies (chrome/edge/brave/firefox)")
    ap.add_argument("--cookies-file", default=None, help="Netscape cookies.txt file path if login required")
    ap.add_argument("--transcript-text", default=None, help="Optional verbatim transcript text when faster-whisper is offline")
    ap.add_argument("--hook-words", type=int, default=None, help="Optional word count in opening 0-4s hook")
    args = ap.parse_args()

    out_dir = Path(args.out).resolve()
    out_dir.mkdir(parents=True, exist_ok=True)

    video_path = download_video(args.source, out_dir, args.cookies_browser, args.cookies_file)
    meta = probe_video(video_path)
    shots, macro_flashes, used_thresh = detect_shots(video_path, meta["duration"], args.scene_threshold)
    micro = measure_micro_changes_and_flashes(video_path, meta["duration"], out_dir)
    shot_imgs, zoom_events = extract_shot_frames_and_zooms(video_path, shots, out_dir)
    trans_sheets = extract_12fps_strips(video_path, shots, meta["duration"], out_dir)
    colors = extract_palette_and_caption_zone(shot_imgs)
    speech = transcribe_and_measure_wpm(video_path, meta["duration"], out_dir, args.whisper_model, args.transcript_text, args.hook_words)

    durs = sorted(s["duration"] for s in shots)
    median_asl = round(durs[len(durs) // 2], 2) if durs else meta["duration"]
    mean_asl = round(sum(durs) / max(1, len(durs)), 2)
    cuts_per_10s = round(((max(0, len(shots) - 1)) / max(1.0, meta["duration"])) * 10.0, 2)
    hook_shots = [s for s in shots if s["start"] < min(4.0, meta["duration"])]
    hook_cuts = max(1, len(hook_shots))

    telemetry = {
        "source": args.source,
        "video_file": video_path.name,
        "meta": meta,
        "cutting_cadence": {
            "scene_threshold_used": used_thresh,
            "total_shots": len(shots),
            "total_cuts": max(0, len(shots) - 1),
            "cuts_per_10s": cuts_per_10s,
            "mean_shot_length_sec": mean_asl,
            "median_shot_length_sec": median_asl,
            "min_shot_sec": round(min(durs), 2) if durs else 0,
            "max_shot_sec": round(max(durs), 2) if durs else 0,
            "hook_cuts_first_4s": hook_cuts,
            "macro_flash_cuts": macro_flashes,
        },
        "micro_change_telemetry": micro,
        "zooms_detected": zoom_events,
        "color_telemetry": colors,
        "speech_and_captions": {
            "engine": speech["engine"],
            "device": speech["device"],
            "word_count": speech["word_count"],
            "wpm_overall": speech["wpm_overall"],
            "wpm_speaking_only": speech["wpm_speaking_only"],
            "hook_wpm_0_4s": speech["hook_wpm_0_4s"],
            "pause_count_over_350ms": speech["pause_count"],
            "median_pause_sec": speech["median_pause_sec"],
        },
        "contact_sheets": {
            "shots_sheet": "shots_sheet.jpg",
            "hook_12fps": "hook_12fps.jpg",
            "transition_12fps": trans_sheets,
        },
        "shots": shots,
    }

    with open(out_dir / "telemetry.json", "w", encoding="utf-8") as f:
        json.dump(telemetry, f, indent=2)

    print(json.dumps({
        "status": "ok",
        "out_dir": str(out_dir),
        "duration_sec": meta["duration"],
        "aspect": meta["aspect"],
        "cuts_per_10s": cuts_per_10s,
        "median_shot_sec": median_asl,
        "micro_changes_per_10s": micro.get("micro_changes_per_10s"),
        "median_micro_interval_sec": micro.get("median_micro_interval_sec"),
        "max_static_hold_sec": micro.get("max_static_hold_sec"),
        "color_flash_count": micro.get("color_flash_count"),
        "zooms_found": len(zoom_events),
        "wpm_overall": speech["wpm_overall"],
        "hook_wpm_0_4s": speech["hook_wpm_0_4s"],
        "shots_sheet": str(out_dir / "shots_sheet.jpg"),
        "hook_12fps": str(out_dir / "hook_12fps.jpg"),
    }, indent=2))


if __name__ == "__main__":
    main()

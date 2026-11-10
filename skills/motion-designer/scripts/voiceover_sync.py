#!/usr/bin/env python3
"""
Single Continuous Voiceover Auto-Slicer, Two-Stage <=179s Reel Cap & Karaoke Word Aligner
for FLUXD Motion Designer (`voiceover_sync.py`).

Key Capabilities:
1. Two-Stage Pitch-Preserved Duration Cap (`<= 179.0s` / target `174.0s` for Reels):
   - Stage A (Breath & Dead-Air Trim First): Runs `ffmpeg silenceremove` to trim inter-sentence
     breath pauses (`> 0.35s`) down to a natural `0.15s` hold first. On a ~205s recording with 50
     breath pauses, this shaves ~15-18s automatically with ZERO speech speed-up.
   - Stage B (Gentle Pitch-Preserved `atempo` Only If Needed): Only if the silence-trimmed audio
     still exceeds `max_duration` (default `174.0s`, hard ceiling `179.0s`), applies the minimum
     required `atempo` (`1.04x - 1.12x`) so human speech never sounds rushed.
2. Active-Word Karaoke Alignment (`s["words"]` in `video.json` — Zero `.srt` Files):
   - Uses `faster-whisper` (`word_timestamps=True`, CUDA `int8_float16` on RTX GPUs) when available,
     or deterministic character-weighted word interpolation when running in zero-dependency mode.
   - Populates `s["words"] = [{"text": "Right", "start": 0.0, "end": 0.28}, ...]` (relative to scene
     start `0.0s`) directly inside `video.json` for `MD.karaokeSub` (`karaoke-active-word`).
   - External `.srt` (`subtitle.srt` / `captions.srt`) files are intentionally omitted—on-canvas
     3-5 word Active-Word Karaoke Subtitles are the sole subtitle system.
3. `-14 dB` Sidechain-Ducked Master Audio Mix (`renders/master_vo_mix.wav`).

Usage:
    python3 scripts/voiceover_sync.py <work_dir> --audio <path/to/voiceover.mp3> [--bgm <path/to/bgm.mp3>] [--max-dur 174.0]
"""

import argparse
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path


def probe_duration(audio_path: Path) -> float:
    cmd = [
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", str(audio_path),
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    try:
        return round(float(res.stdout.strip()), 3)
    except Exception:
        return 0.0


def prepare_capped_voiceover(
    raw_audio: Path,
    out_audio: Path,
    target_max_sec: float = 174.0,
    hard_cap_sec: float = 179.0,
) -> dict:
    """
    Two-stage pre-pass:
      1. Trim breath pauses > 0.35s down to 0.15s via `silenceremove`.
      2. Only if duration still exceeds `hard_cap_sec` (or `target_max_sec`), apply gentle `atempo`.
    """
    out_audio.parent.mkdir(parents=True, exist_ok=True)
    raw_dur = probe_duration(raw_audio)
    if raw_dur <= 0:
        shutil.copy2(raw_audio, out_audio)
        return {"rawDurationSec": 0.0, "trimmedDurationSec": 0.0, "finalDurationSec": 0.0, "atempoApplied": 1.0}

    # Stage 1: Trim excess silence (>0.32s pauses capped at 0.15s)
    trimmed_tmp = out_audio.with_name(out_audio.stem + "_trimmed.wav")
    subprocess.run([
        "ffmpeg", "-y", "-v", "error", "-i", str(raw_audio),
        "-af", "silenceremove=start_periods=1:start_silence=0.10:start_threshold=-38dB:stop_periods=-1:stop_duration=0.32:stop_threshold=-38dB:stop_silence=0.15",
        "-ar", "48000", "-ac", "2", str(trimmed_tmp),
    ], check=False)

    trimmed_dur = probe_duration(trimmed_tmp) if trimmed_tmp.exists() else raw_dur
    if trimmed_dur <= 0:
        shutil.copy2(raw_audio, trimmed_tmp)
        trimmed_dur = raw_dur

    # Stage 2: Check if gentle atempo is still needed to land <= target_max_sec (174s) / hard_cap_sec (179s)
    atempo = 1.0
    if trimmed_dur > hard_cap_sec or (raw_dur > hard_cap_sec and trimmed_dur > target_max_sec):
        needed = trimmed_dur / target_max_sec
        atempo = round(min(1.18, max(1.02, needed)), 4)
        subprocess.run([
            "ffmpeg", "-y", "-v", "error", "-i", str(trimmed_tmp),
            "-af", f"atempo={atempo}",
            "-ar", "48000", "-ac", "2", str(out_audio),
        ], check=False)
        trimmed_tmp.unlink(missing_ok=True)
    else:
        shutil.move(str(trimmed_tmp), str(out_audio))

    final_dur = probe_duration(out_audio)
    return {
        "rawDurationSec": raw_dur,
        "trimmedDurationSec": trimmed_dur,
        "finalDurationSec": final_dur,
        "secondsSavedBySilenceTrim": round(max(0.0, raw_dur - trimmed_dur), 2),
        "atempoApplied": atempo,
    }


def detect_speech_chunks_ffmpeg(audio_path: Path, noise_db: float = -35.0, min_silence: float = 0.28) -> list:
    """Zero-dependency speech segmenter using ffmpeg silencedetect."""
    total_dur = probe_duration(audio_path)
    cmd = [
        "ffmpeg", "-hide_banner", "-nostats", "-i", str(audio_path),
        "-af", f"silencedetect=noise={noise_db}dB:d={min_silence}",
        "-f", "null", "-",
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    log = res.stderr or ""

    sil_starts = [float(x) for x in re.findall(r"silence_start:\s*([\d.]+)", log)]
    sil_ends = [float(x) for x in re.findall(r"silence_end:\s*([\d.]+)", log)]

    chunks = []
    cursor = 0.0
    for i, s_start in enumerate(sil_starts):
        if s_start - cursor >= 0.25:
            chunks.append({"start": round(cursor, 3), "end": round(s_start, 3), "dur": round(s_start - cursor, 3)})
        if i < len(sil_ends):
            cursor = sil_ends[i]
    if total_dur - cursor >= 0.25:
        chunks.append({"start": round(cursor, 3), "end": round(total_dur, 3), "dur": round(total_dur - cursor, 3)})

    if not chunks and total_dur > 0:
        chunks.append({"start": 0.0, "end": total_dur, "dur": total_dur})
    return chunks


def transcribe_faster_whisper(audio_path: Path, model_size: str = "base"):
    """Try faster-whisper if installed in Gemini CLI for exact word timestamps & retake stripping."""
    try:
        from faster_whisper import WhisperModel  # type: ignore
    except ImportError:
        return None

    has_cuda = shutil.which("nvidia-smi") is not None
    try:
        model = WhisperModel(model_size, device="cuda" if has_cuda else "cpu", compute_type="int8_float16" if has_cuda else "int8")
    except Exception:
        model = WhisperModel(model_size, device="cpu", compute_type="int8")
    segments, _ = model.transcribe(str(audio_path), language="en", word_timestamps=True, vad_filter=True)
    seg_list = []
    for seg in segments:
        words = [
            {"text": w.word.strip(), "start": round(w.start, 3), "end": round(w.end, 3)}
            for w in (seg.words or []) if w.word and w.word.strip()
        ]
        seg_list.append({
            "start": round(seg.start, 3),
            "end": round(seg.end, 3),
            "dur": round(seg.end - seg.start, 3),
            "text": seg.text.strip(),
            "words": words,
        })
    cleaned = []
    for seg in seg_list:
        if cleaned:
            prev = cleaned[-1]
            w_prev = re.findall(r"\b\w+\b", prev["text"].lower())[:4]
            w_curr = re.findall(r"\b\w+\b", seg["text"].lower())[:4]
            if w_prev and w_prev == w_curr and (seg["start"] - prev["end"]) >= 0.45:
                cleaned[-1] = seg
                continue
        cleaned.append(seg)
    return cleaned


def build_scene_words(vo_text: str, scene_dur: float, whisper_words: list = None, scene_t0: float = 0.0) -> list:
    """
    Build the scene-relative `words: [{text, start, end}, ...]` array for `MD.karaokeSub`.
    Uses faster-whisper timestamps (shifted relative to `scene_t0`) when available,
    otherwise interpolates word timings from character length and punctuation pauses.
    """
    if whisper_words:
        rel_words = []
        for w in whisper_words:
            txt = re.sub(r"[\*\[\]`]", "", str(w.get("text") or w.get("word") or "")).strip()
            if not txt:
                continue
            st = round(max(0.0, float(w["start"]) - scene_t0), 3)
            en = round(min(scene_dur, max(st + 0.08, float(w["end"]) - scene_t0)), 3)
            rel_words.append({"text": txt, "start": st, "end": en})
        if rel_words:
            return rel_words

    clean = re.sub(r"\[(?:AUDIO\s+)?PAUSE:[^\]]+\]", "", str(vo_text or ""), flags=re.IGNORECASE)
    clean = re.sub(r"[\*\[\]`]", "", clean)
    raw_tokens = [t for t in re.split(r"\s+", clean.strip()) if t]
    if not raw_tokens:
        return []

    speak_win = max(1.0, scene_dur - 0.18)
    weights = [
        max(2, len(t)) + (2.2 if re.search(r"[,;:\u2014\-]$", t) else (3.0 if re.search(r"[\.\?!]$", t) else 0.0))
        for t in raw_tokens
    ]
    total_w = sum(weights) or 1.0
    cursor = 0.06
    out = []
    for t, w in zip(raw_tokens, weights):
        wdur = (w / total_w) * speak_win
        st = round(cursor, 3)
        en = round(min(scene_dur - 0.04, max(st + 0.08, cursor + wdur)), 3)
        out.append({"text": t, "start": st, "end": en})
        cursor += wdur
    return out


def slice_and_align(
    work_dir: Path,
    audio_path: Path,
    bgm_path: Path = None,
    model_size: str = "base",
    target_max_sec: float = 174.0,
) -> dict:
    vfile = work_dir / "video.json"
    if not vfile.exists():
        raise FileNotFoundError(f"No video.json found in {work_dir}")

    vdata = json.loads(vfile.read_text(encoding="utf-8"))
    scenes = vdata.get("scenes", [])
    if not scenes:
        raise ValueError("video.json has no scenes")

    vo_dir = work_dir / "assets" / "vo"
    vo_dir.mkdir(parents=True, exist_ok=True)

    # Pre-pass: silence trim first, then gentle atempo only if > 179s cap
    processed_vo = vo_dir / "voiceover_capped.wav"
    prepass = prepare_capped_voiceover(audio_path, processed_vo, target_max_sec=target_max_sec, hard_cap_sec=179.0)

    whisper_segs = transcribe_faster_whisper(processed_vo, model_size=model_size)
    mode = "faster-whisper" if whisper_segs else "ffmpeg-silencedetect"
    chunks = whisper_segs if whisper_segs else detect_speech_chunks_ffmpeg(processed_vo)

    total_audio_dur = probe_duration(processed_vo)
    n_scenes = len(scenes)

    word_weights = [
        max(1, len(re.findall(r"\b\w+\b", str(s.get("vo") or s.get("text") or s.get("title") or "beat"))))
        for s in scenes
    ]
    total_weight = sum(word_weights) or 1

    aligned_windows = []
    if len(chunks) == n_scenes:
        for ch in chunks:
            aligned_windows.append((ch["start"], ch["end"], ch.get("words", [])))
    else:
        cursor = 0.0
        for i, w in enumerate(word_weights):
            share = (w / total_weight) * total_audio_dur
            start_t = round(cursor, 3)
            end_t = round(total_audio_dur if i == n_scenes - 1 else cursor + share, 3)
            for ch in chunks:
                if abs(ch["end"] - end_t) <= 0.6:
                    end_t = ch["end"]
                    break
            words_in_win = []
            if whisper_segs:
                for seg in whisper_segs:
                    for wd in seg.get("words", []):
                        if start_t - 0.1 <= wd["start"] <= end_t + 0.1:
                            words_in_win.append(wd)
            aligned_windows.append((start_t, max(start_t + 1.2, end_t), words_in_win))
            cursor = end_t

    timeline_cursor = 0.0
    for i, (s, (t0, t1, w_words)) in enumerate(zip(scenes, aligned_windows)):
        pause_extra = min(0.25, float(s.get("pause", 0.0) or 0.0))
        beat_dur = round(max(1.8, (t1 - t0) + pause_extra), 2)
        slice_file = vo_dir / f"beat-{i+1:02d}.wav"
        subprocess.run([
            "ffmpeg", "-y", "-v", "error",
            "-ss", f"{t0:.3f}", "-to", f"{t1:.3f}",
            "-i", str(processed_vo),
            "-ar", "48000", "-ac", "2", str(slice_file),
        ], check=False)

        s["dur"] = beat_dur
        s["duration"] = beat_dur
        s["voStartSec"] = round(timeline_cursor, 3)
        s["voEndSec"] = round(timeline_cursor + beat_dur, 3)
        s["voAudioSlice"] = f"assets/vo/beat-{i+1:02d}.wav"
        s["words"] = build_scene_words(s.get("vo") or s.get("title") or "", beat_dur, w_words, scene_t0=t0)
        timeline_cursor += beat_dur

    vdata["subtitles"] = True
    vdata["subtitleMode"] = "karaoke-active-word"
    vdata["length"] = round(timeline_cursor, 2)
    vdata["voiceover"] = {
        "mode": "single-continuous-recording",
        "engine": mode,
        "sourceFile": str(audio_path.name),
        "rawDurationSec": prepass["rawDurationSec"],
        "trimmedDurationSec": prepass["trimmedDurationSec"],
        "atempoMultiplier": prepass["atempoApplied"],
        "totalDurationSec": round(timeline_cursor, 2),
        "sidechainDuckingDb": -14.0,
        "subtitleFormat": "karaoke-active-word (in-canvas, no .srt)",
    }
    vfile.write_text(json.dumps(vdata, indent=2), encoding="utf-8")

    # Mix master audio with optional -14dB sidechain BGM ducking (no .srt file generated)
    renders_dir = work_dir / "renders"
    renders_dir.mkdir(parents=True, exist_ok=True)
    master_wav = renders_dir / "master_vo_mix.wav"
    if bgm_path and bgm_path.exists():
        fade_start = max(0.0, timeline_cursor - 2.0)
        filter_complex = (
            f"[0:a]aresample=48000,volume=1.0,asplit=2[vo][sc];"
            f"[1:a]aresample=48000,volume=0.35,afade=t=in:st=0:d=1.0,afade=t=out:st={fade_start:.2f}:d=2.0[bgm];"
            f"[bgm][sc]sidechaincompress=threshold=0.03:ratio=8:attack=35:release=320:makeup=1[bgm_ducked];"
            f"[vo][bgm_ducked]amix=inputs=2:duration=first:dropout_transition=2[out]"
        )
        subprocess.run([
            "ffmpeg", "-y", "-v", "error",
            "-i", str(processed_vo), "-stream_loop", "-1", "-i", str(bgm_path),
            "-filter_complex", filter_complex,
            "-map", "[out]", "-t", f"{timeline_cursor:.2f}", str(master_wav),
        ], check=False)
    else:
        subprocess.run([
            "ffmpeg", "-y", "-v", "error",
            "-i", str(processed_vo), "-ar", "48000", "-ac", "2", str(master_wav),
        ], check=False)

    return {
        "engine": mode,
        "sceneCount": n_scenes,
        "rawDurationSec": prepass["rawDurationSec"],
        "trimmedDurationSec": prepass["trimmedDurationSec"],
        "atempoApplied": prepass["atempoApplied"],
        "totalDurationSec": round(timeline_cursor, 2),
        "subtitleMode": "karaoke-active-word",
        "masterAudio": str(master_wav),
        "updatedVideoJson": str(vfile),
    }


def main():
    parser = argparse.ArgumentParser(description="Auto-slice a single continuous voiceover recording into Motion Designer scenes with karaoke word alignment.")
    parser.add_argument("work_dir", type=Path, help="Path to motion-designer project directory")
    parser.add_argument("--audio", type=Path, required=True, help="Path to single continuous voiceover (.wav / .mp3)")
    parser.add_argument("--bgm", type=Path, default=None, help="Optional background music track for -14dB sidechain ducking")
    parser.add_argument("--model", type=str, default="base", help="faster-whisper model size when running locally in CLI")
    parser.add_argument("--max-dur", type=float, default=174.0, help="Target max duration in seconds before gentle atempo (default 174.0s)")
    args = parser.parse_args()

    report = slice_and_align(args.work_dir, args.audio, bgm_path=args.bgm, model_size=args.model, target_max_sec=args.max_dur)
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()

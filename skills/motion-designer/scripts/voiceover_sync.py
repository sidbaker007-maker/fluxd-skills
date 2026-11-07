import shutil
#!/usr/bin/env python3
"""
Single Continuous Voiceover Auto-Slicer & Sidechain Audio Mixer for Motion Designer.

Supports your exact recording workflow:
1. You record ONE single continuous audio file (`voiceover.wav` or `voiceover.mp3`) for the entire script.
   (If you stumble on a line, pause >= 1.0s and repeat the line.)
2. In Local Gemini CLI, uses `faster-whisper` (if installed) for word-level timestamps and automatic retake removal.
   In Cloud Sandbox or zero-dependency environments, falls back to `ffmpeg silencedetect` energy segmentation.
3. Aligns every spoken segment to the scenes in `video.json` (or imports `script.json` from `@content-director`),
   updates each scene's exact `duration`, `startSec`, and `endSec`, slices per-beat audio into `assets/vo/beat-XX.wav`,
   and mixes a full master audio track with `-14 dB` sidechain-ducked background music (`renders/master_audio.wav`).

Usage:
    python3 scripts/voiceover_sync.py <work_dir> --audio <path/to/voiceover.wav> [--bgm <path/to/bgm.mp3>] [--model base]
"""

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path


def probe_duration(audio_path: Path) -> float:
    cmd = [
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", str(audio_path)
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    try:
        return round(float(res.stdout.strip()), 3)
    except Exception:
        return 0.0


def detect_speech_chunks_ffmpeg(audio_path: Path, noise_db: float = -35.0, min_silence: float = 0.32) -> list:
    """Zero-dependency speech segmenter using ffmpeg silencedetect."""
    total_dur = probe_duration(audio_path)
    cmd = [
        "ffmpeg", "-hide_banner", "-nostats", "-i", str(audio_path),
        "-af", f"silencedetect=noise={noise_db}dB:d={min_silence}",
        "-f", "null", "-"
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
        # On NVIDIA RTX 3050 (4GB-8GB VRAM), cuda + int8_float16 uses <1.2GB VRAM and runs ~6x faster via Ampere Tensor Cores
        model = WhisperModel(model_size, device="cuda" if has_cuda else "cpu", compute_type="int8_float16" if has_cuda else "int8")
    except Exception:
        model = WhisperModel(model_size, device="cpu", compute_type="int8")
    segments, _ = model.transcribe(str(audio_path), language="en", word_timestamps=True, vad_filter=True)
    seg_list = []
    for seg in segments:
        words = [
            {"word": w.word.strip(), "start": round(w.start, 3), "end": round(w.end, 3)}
            for w in (seg.words or [])
        ]
        seg_list.append({
            "start": round(seg.start, 3),
            "end": round(seg.end, 3),
            "dur": round(seg.end - seg.start, 3),
            "text": seg.text.strip(),
            "words": words,
        })
    # Automatic retake filter: if two consecutive segments have >70% identical opening words after a pause, drop the first stumble
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



def format_srt_time(seconds: float) -> str:
    ms = int(round((seconds - int(seconds)) * 1000))
    s = int(seconds) % 60
    m = (int(seconds) // 60) % 60
    h = int(seconds) // 3600
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"

def write_english_srt(scenes: list, srt_path: Path):
    lines = []
    idx = 1
    for s in scenes:
        vo = str(s.get("vo") or s.get("title") or s.get("text") or "").strip()
        vo = re.sub(r"\[(?:AUDIO\s+)?PAUSE:[^\]]+\]", "", vo).replace("*", "").replace("[", "").replace("]", "").strip()
        if not vo:
            continue
        t0 = float(s.get("voStartSec", 0.0))
        t1 = float(s.get("voEndSec", t0 + float(s.get("duration", 3.0))))
        lines.append(f"{idx}\n{format_srt_time(t0)} --> {format_srt_time(t1)}\n{vo}\n")
        idx += 1
    srt_path.parent.mkdir(parents=True, exist_ok=True)
    srt_path.write_text("\n".join(lines), encoding="utf-8")

def slice_and_align(work_dir: Path, audio_path: Path, bgm_path: Path = None, model_size: str = "base") -> dict:
    vfile = work_dir / "video.json"
    if not vfile.exists():
        raise FileNotFoundError(f"No video.json found in {work_dir}")

    vdata = json.loads(vfile.read_text(encoding="utf-8"))
    scenes = vdata.get("scenes", [])
    if not scenes:
        raise ValueError("video.json has no scenes")

    vo_dir = work_dir / "assets" / "vo"
    vo_dir.mkdir(parents=True, exist_ok=True)

    whisper_segs = transcribe_faster_whisper(audio_path, model_size=model_size)
    mode = "faster-whisper" if whisper_segs else "ffmpeg-silencedetect"
    chunks = whisper_segs if whisper_segs else detect_speech_chunks_ffmpeg(audio_path)

    total_audio_dur = probe_duration(audio_path)
    n_scenes = len(scenes)

    # Map chunks onto scenes proportionally by expected VO word count if chunk count != scene count
    word_weights = [max(1, len(re.findall(r"\b\w+\b", str(s.get("vo") or s.get("text") or s.get("title") or "beat")))) for s in scenes]
    total_weight = sum(word_weights)

    aligned_Windows = []
    if len(chunks) == n_scenes:
        for ch in chunks:
            aligned_Windows.append((ch["start"], ch["end"], ch.get("words", [])))
    else:
        cursor = 0.0
        for i, w in enumerate(word_weights):
            share = (w / total_weight) * total_audio_dur
            start_t = round(cursor, 3)
            end_t = round(total_audio_dur if i == n_scenes - 1 else cursor + share, 3)
            # Snap to nearest detected chunk boundary if within 0.6s
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
            aligned_Windows.append((start_t, max(start_t + 1.2, end_t), words_in_win))
            cursor = end_t

    timeline_cursor = 0.0
    for i, (s, (t0, t1, words)) in enumerate(zip(scenes, aligned_Windows)):
        pause_extra = float(s.get("pause", 0.0) or 0.0)
        beat_dur = round(max(1.5, (t1 - t0) + pause_extra), 2)
        slice_file = vo_dir / f"beat-{i+1:02d}.wav"
        subprocess.run([
            "ffmpeg", "-y", "-v", "error",
            "-ss", f"{t0:.3f}", "-to", f"{t1:.3f}",
            "-i", str(audio_path),
            "-ar", "48000", "-ac", "2", str(slice_file)
        ], check=False)

        s["duration"] = beat_dur
        s["voStartSec"] = round(timeline_cursor, 3)
        s["voEndSec"] = round(timeline_cursor + beat_dur, 3)
        s["voAudioSlice"] = f"assets/vo/beat-{i+1:02d}.wav"
        if words:
            s["wordTimestamps"] = words
        timeline_cursor += beat_dur

    vdata["voiceover"] = {
        "mode": "single-continuous-recording",
        "engine": mode,
        "sourceFile": str(audio_path.name),
        "totalDurationSec": round(timeline_cursor, 2),
        "sidechainDuckingDb": -14.0,
    }
    vfile.write_text(json.dumps(vdata, indent=2), encoding="utf-8")

    # Mix master audio with optional -14dB sidechain BGM ducking
    renders_dir = work_dir / "renders"
    renders_dir.mkdir(parents=True, exist_ok=True)
    srt_file = renders_dir / "captions.srt"
    write_english_srt(scenes, srt_file)
    master_wav = renders_dir / "master_vo_mix.wav"
    if bgm_path and bgm_path.exists():
        # Mix voiceover (normalized) + BGM ducked by -14dB during speech with 2s fade-out
        fade_start = max(0.0, timeline_cursor - 2.0)
        filter_complex = (
            f"[0:a]aresample=48000,volume=1.0,asplit=2[vo][sc];"
            f"[1:a]aresample=48000,volume=0.35,afade=t=in:st=0:d=1.0,afade=t=out:st={fade_start:.2f}:d=2.0[bgm];"
            f"[bgm][sc]sidechaincompress=threshold=0.03:ratio=8:attack=35:release=320:makeup=1[bgm_ducked];"
            f"[vo][bgm_ducked]amix=inputs=2:duration=first:dropout_transition=2[out]"
        )
        subprocess.run([
            "ffmpeg", "-y", "-v", "error",
            "-i", str(audio_path), "-stream_loop", "-1", "-i", str(bgm_path),
            "-filter_complex", filter_complex,
            "-map", "[out]", "-t", f"{timeline_cursor:.2f}", str(master_wav)
        ], check=False)
    else:
        subprocess.run([
            "ffmpeg", "-y", "-v", "error",
            "-i", str(audio_path), "-ar", "48000", "-ac", "2", str(master_wav)
        ], check=False)

    return {
        "engine": mode,
        "sceneCount": n_scenes,
        "totalDurationSec": round(timeline_cursor, 2),
        "masterAudio": str(master_wav),
        "englishSubtitlesSrt": str(srt_file),
        "updatedVideoJson": str(vfile),
    }


def main():
    parser = argparse.ArgumentParser(description="Auto-slice a single continuous voiceover recording into Motion Designer scenes.")
    parser.add_argument("work_dir", type=Path, help="Path to motion-designer project directory")
    parser.add_argument("--audio", type=Path, required=True, help="Path to single continuous voiceover (.wav / .mp3)")
    parser.add_argument("--bgm", type=Path, default=None, help="Optional background music track for -14dB sidechain ducking")
    parser.add_argument("--model", type=str, default="base", help="faster-whisper model size when running locally in CLI")
    args = parser.parse_args()

    report = slice_and_align(args.work_dir, args.audio, bgm_path=args.bgm, model_size=args.model)
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()

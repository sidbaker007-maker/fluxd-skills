#!/usr/bin/env python3
"""Run faster-whisper ASR check on the final muxed MP4 or mixed WAV to confirm
every spoken line is intelligible over the music and foley.
"""
import sys
import json
from difflib import SequenceMatcher

def verify_final(audio_path, lines_path=None, model_name="base"):
    from faster_whisper import WhisperModel
    model = WhisperModel(model_name, device="cpu", compute_type="int8")
    segments, _ = model.transcribe(audio_path, word_timestamps=True)
    full_text = " ".join(s.text.strip() for s in segments).strip()
    print("Transcribed final mix:", full_text)
    if lines_path:
        lines = json.load(open(lines_path, encoding="utf-8"))
        expected = " ".join(l.get("asr", l.get("text", "")) for l in lines).strip()
        ratio = SequenceMatcher(None, expected.lower(), full_text.lower()).ratio()
        print(f"ASR match ratio: {ratio:.3f}")
        if ratio < 0.80:
            sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 tools/final_asr.py <film.mp4|mix.wav> [lines.json] [model]")
        sys.exit(0)
    verify_final(
        sys.argv[1],
        sys.argv[2] if len(sys.argv) > 2 else None,
        sys.argv[3] if len(sys.argv) > 3 else "base",
    )

#!/usr/bin/env python3
"""core/tts/asr_check.py — Runs faster-whisper over generated voice lines to verify pronunciation
and outputs word-level timestamps to <voices_dir>/words.json.
"""
import difflib
import json
import os
import re
import sys

def norm(s: str) -> str:
    return re.sub(r"\W+", "", s.lower())

def main():
    if len(sys.argv) < 3:
        print("Usage: python3 core/tts/asr_check.py <lines.json> <voices_dir> [--lang auto] [--threshold 0.92] [--model base]")
        sys.exit(1)
    lines_path, voices_dir = sys.argv[1], sys.argv[2]
    model_name = "base"
    thresh = 0.92
    if "--model" in sys.argv:
        model_name = sys.argv[sys.argv.index("--model") + 1]
    if "--threshold" in sys.argv:
        thresh = float(sys.argv[sys.argv.index("--threshold") + 1])

    from faster_whisper import WhisperModel
    model = WhisperModel(model_name, device="cpu", compute_type="int8")

    with open(lines_path, "r", encoding="utf-8") as f:
        lines = json.load(f)

    words_out = {}
    failed = 0
    for item in lines:
        lid = item["id"]
        expected = item["text"]
        wav_path = os.path.join(voices_dir, f"{lid}.wav")
        segments, _ = model.transcribe(wav_path, word_timestamps=True)
        wlist = []
        heard_parts = []
        for seg in segments:
            heard_parts.append(seg.text)
            for w in (seg.words or []):
                wlist.append({"word": w.word.strip(), "start": round(w.start, 3), "end": round(w.end, 3)})
        heard = " ".join(heard_parts).strip()
        ratio = difflib.SequenceMatcher(None, norm(expected), norm(heard)).ratio()
        words_out[lid] = wlist
        status = "OK" if ratio >= thresh else "MISMATCH"
        if ratio < thresh:
            failed += 1
        print(f"[ASR {status} {ratio:.2f}] {lid}: '{heard}'")

    words_file = os.path.join(voices_dir, "words.json")
    with open(words_file, "w", encoding="utf-8") as f:
        json.dump(words_out, f, indent=2, ensure_ascii=False)
    print(f"Wrote word timestamps -> {words_file} ({failed} mismatches)")

if __name__ == "__main__":
    main()

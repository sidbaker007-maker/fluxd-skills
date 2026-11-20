#!/usr/bin/env python3
"""core/tts/tts.py — Offline Kokoro ONNX TTS generator for lemo-opuscar.
Reads lines.json ([{id, text, voice, speed, lang}]) and writes trimmed WAVs + durations.json.
"""
import json
import os
import sys
import numpy as np
import soundfile as sf

def trim_silence(audio: np.ndarray, sr: int, thresh_db: float = -42.0, pad_ms: float = 25.0) -> np.ndarray:
    thresh = 10 ** (thresh_db / 20.0)
    mask = np.abs(audio) > thresh
    if not np.any(mask):
        return audio
    idx = np.where(mask)[0]
    pad = int(sr * pad_ms / 1000.0)
    start = max(0, idx[0] - pad)
    end = min(len(audio), idx[-1] + pad)
    return audio[start:end]

def main():
    if len(sys.argv) < 3:
        print("Usage: python3 core/tts/tts.py <lines.json> <out_dir>")
        sys.exit(1)
    lines_path, out_dir = sys.argv[1], sys.argv[2]
    os.makedirs(out_dir, exist_ok=True)
    with open(lines_path, "r", encoding="utf-8") as f:
        lines = json.load(f)

    from kokoro_onnx import Kokoro
    root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
    model_dir = os.path.join(root, ".cache/kokoro")
    kokoro = Kokoro(
        os.path.join(model_dir, "kokoro-v1.0.onnx"),
        os.path.join(model_dir, "voices-v1.0.bin"),
    )

    durations = {}
    for item in lines:
        lid = item["id"]
        text = item["text"]
        voice = item.get("voice", "af_heart")
        speed = float(item.get("speed", 1.0))
        lang = item.get("lang", "en-us")
        samples, sr = kokoro.create(text, voice=voice, speed=speed, lang=lang)
        trimmed = trim_silence(np.asarray(samples, dtype=np.float32), sr)
        wav_path = os.path.join(out_dir, f"{lid}.wav")
        sf.write(wav_path, trimmed, sr)
        durations[lid] = round(len(trimmed) / float(sr), 4)
        print(f"[Kokoro] {lid}: {durations[lid]:.2f}s ({voice})")

    with open(os.path.join(out_dir, "durations.json"), "w", encoding="utf-8") as f:
        json.dump(durations, f, indent=2)

if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Slice audio recordings into tagged foley grains (tap, stroke, squeak, rustle)
and write index.json with each grain's duration, attack, and spectral centroid.
"""
import sys
import os
import json
import numpy as np
import soundfile as sf

def extract_grains(out_dir, pairs):
    os.makedirs(out_dir, exist_ok=True)
    index = []
    for pair in pairs:
        if "=" not in pair:
            continue
        tag, path = pair.split("=", 1)
        if not os.path.exists(path):
            continue
        data, sr = sf.read(path, dtype="float32")
        if data.ndim > 1:
            data = data.mean(axis=1)
        win = int(sr * 0.02)
        rms = np.sqrt(np.convolve(data ** 2, np.ones(win) / win, mode="same"))
        thresh = max(0.015, float(np.percentile(rms, 75)) * 0.4)
        active = rms > thresh
        starts = np.where(np.diff(active.astype(int)) == 1)[0]
        ends = np.where(np.diff(active.astype(int)) == -1)[0]
        k = 0
        for s in starts:
            e_candidates = ends[ends > s]
            if len(e_candidates) == 0:
                break
            e = e_candidates[0]
            dur = (e - s) / sr
            if 0.03 <= dur <= 1.8:
                grain = data[s:e]
                peak = float(np.max(np.abs(grain)) or 1.0)
                grain = (grain / peak) * 0.85
                fname = f"{tag}_{k:03d}.wav"
                sf.write(os.path.join(out_dir, fname), grain, sr)
                spec = np.abs(np.fft.rfft(grain))
                freqs = np.fft.rfftfreq(len(grain), 1.0 / sr)
                centroid = float(np.sum(freqs * spec) / (np.sum(spec) + 1e-9))
                index.append({"file": fname, "tag": tag, "dur": round(dur, 4), "brightness": round(centroid, 1)})
                k += 1
    with open(os.path.join(out_dir, "index.json"), "w", encoding="utf-8") as f:
        json.dump(index, f, indent=2)
    print(f"Extracted {len(index)} grains into {out_dir}/index.json")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python -I tools/foley_lib.py <out_dir> <tag>=<audio_file> ...")
        sys.exit(0)
    extract_grains(sys.argv[1], sys.argv[2:])

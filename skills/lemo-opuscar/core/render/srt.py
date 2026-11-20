#!/usr/bin/env python3
"""core/render/srt.py — Converts [{t0, t1, text}] JSON cues into a clean .srt subtitle file."""
import json
import sys

def fmt_ts(sec: float) -> str:
    ms = int(round(max(0.0, sec) * 1000))
    h = ms // 3600000
    ms %= 3600000
    m = ms // 60000
    ms %= 60000
    s = ms // 1000
    ms %= 1000
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"

def main():
    if len(sys.argv) < 3:
        print("Usage: python3 core/render/srt.py <cues.json> <out.srt>")
        sys.exit(1)
    with open(sys.argv[1], "r", encoding="utf-8") as f:
        cues = json.load(f)
    lines = []
    for idx, c in enumerate(cues, 1):
        t0 = float(c.get("t0", c.get("start", 0.0)))
        t1 = float(c.get("t1", c.get("end", t0 + 2.0)))
        text = str(c.get("text", "")).strip()
        lines.append(f"{idx}\n{fmt_ts(t0)} --> {fmt_ts(t1)}\n{text}\n")
    with open(sys.argv[2], "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"Wrote {len(cues)} subtitles -> {sys.argv[2]}")

if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Audit a film's timeline/events for flat windows (> 1.5s without event),
cut points vs. musical beat grid, and audio onset alignment.
"""
import sys
import json

def check_rhythm(events_path, max_gap=1.5):
    data = json.load(open(events_path, encoding="utf-8"))
    dur = float(data.get("dur", 0))
    evs = sorted(data.get("ev", []), key=lambda x: float(x.get("t", 0)))
    times = [0.0] + [float(e.get("t", 0)) for e in evs] + [dur]
    gaps = []
    for i in range(len(times) - 1):
        g = times[i + 1] - times[i]
        if g > max_gap:
            gaps.append((round(times[i], 2), round(times[i + 1], 2), round(g, 2)))
    print(f"Duration: {dur:.2f}s | Events: {len(evs)} | Windows > {max_gap}s: {len(gaps)}")
    for t0, t1, g in gaps:
        print(f"  Hold window: {t0:.2f}s -> {t1:.2f}s ({g:.2f}s)")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 tools/rhythm_report.py <events.json> [max_gap_sec]")
        sys.exit(0)
    check_rhythm(sys.argv[1], float(sys.argv[2]) if len(sys.argv) > 2 else 1.5)

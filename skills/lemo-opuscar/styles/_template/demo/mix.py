#!/usr/bin/env python3
"""styles/_template/demo/mix.py — Builds 48kHz stereo soundtrack mix.wav from events.json + voice + score."""
import json
import os
import sys
import soundfile as sf

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))
sys.path.insert(0, ROOT)
from core.audio import sfx, pluck

def main():
    here = os.path.dirname(os.path.abspath(__file__))
    events_path = os.path.join(here, "events.json")
    out_dir = os.path.join(here, "out")
    os.makedirs(out_dir, exist_ok=True)
    dur = 18.0
    buf = sfx.stereo(dur)

    if os.path.exists(events_path):
        with open(events_path, "r", encoding="utf-8") as f:
            events = json.load(f)
        for ev in events:
            t = float(ev.get("t", 0.0))
            kind = ev.get("kind", "click")
            gain = float(ev.get("gain", 0.4))
            if hasattr(sfx, kind):
                sfx.add(buf, getattr(sfx, kind)(), at=t, gain=gain)

    for idx, note in enumerate(["A2", "E3", "A3", "C4", "E4"]):
        sfx.add(buf, pluck.pluck("nylon", note, dur=3.2, vel=0.35), at=idx * 3.0, gain=0.45)

    buf = sfx.compress(buf)
    buf = sfx.limit(buf, ceiling_db=-1.0)
    out_wav = os.path.join(out_dir, "mix.wav")
    sf.write(out_wav, buf, sfx.SR)
    print(f"Mixed soundtrack -> {out_wav}")

if __name__ == "__main__":
    main()

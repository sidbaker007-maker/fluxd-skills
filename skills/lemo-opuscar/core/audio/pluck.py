"""core/audio/pluck.py — Extended Karplus-Strong physical string model for lemo-opuscar.
Presets: guitar, nylon, harp, koto, guzheng, pipa, pizz, bass, harpsichord, dull.
"""
import numpy as np
from .sfx import SR, to_stereo, add

PRESETS = {
    "guitar":      {"decay": 0.996, "bright": 0.55, "pick": 0.22},
    "nylon":       {"decay": 0.994, "bright": 0.35, "pick": 0.28},
    "harp":        {"decay": 0.997, "bright": 0.45, "pick": 0.35},
    "koto":        {"decay": 0.995, "bright": 0.72, "pick": 0.14},
    "guzheng":     {"decay": 0.996, "bright": 0.68, "pick": 0.16},
    "pipa":        {"decay": 0.993, "bright": 0.78, "pick": 0.12},
    "pizz":        {"decay": 0.985, "bright": 0.30, "pick": 0.32},
    "bass":        {"decay": 0.997, "bright": 0.22, "pick": 0.40},
    "harpsichord": {"decay": 0.995, "bright": 0.85, "pick": 0.10},
    "dull":        {"decay": 0.988, "bright": 0.20, "pick": 0.45},
}

NOTE_NAMES = {"C": 0, "C#": 1, "Db": 1, "D": 2, "D#": 3, "Eb": 3, "E": 4, "F": 5,
              "F#": 6, "Gb": 6, "G": 7, "G#": 8, "Ab": 8, "A": 9, "A#": 10, "Bb": 10, "B": 11}

def to_freq(pitch) -> float:
    if isinstance(pitch, (int, float)):
        return 440.0 * (2.0 ** ((float(pitch) - 69.0) / 12.0))
    s = str(pitch).strip()
    octv = int(s[-1])
    name = s[:-1]
    midi = (octv + 1) * 12 + NOTE_NAMES[name]
    return 440.0 * (2.0 ** ((midi - 69.0) / 12.0))

def pluck(preset: str = "nylon", pitch="A3", dur: float = 1.5, vel: float = 0.8, **overrides) -> np.ndarray:
    cfg = {**PRESETS.get(preset, PRESETS["nylon"]), **overrides}
    freq = to_freq(pitch)
    delay = max(2, int(round(SR / freq)))
    n = int(round(dur * SR))
    rng = np.random.default_rng(int(freq * 100) & 0xFFFF)
    burst = rng.uniform(-1.0, 1.0, delay).astype(np.float32)
    out = np.zeros(n, dtype=np.float32)
    buf = burst.copy()
    decay = float(cfg["decay"])
    bright = float(cfg["bright"])
    prev = 0.0
    for i in range(n):
        idx = i % delay
        cur = buf[idx]
        out[i] = cur * float(vel)
        nxt = decay * (bright * cur + (1.0 - bright) * prev)
        prev = cur
        buf[idx] = nxt
    return to_stereo(out)

def strum(preset: str, pitches, dur: float = 2.0, vel: float = 0.75, spread: float = 0.035, up: bool = False) -> np.ndarray:
    seq = list(reversed(pitches)) if up else list(pitches)
    total = dur + spread * len(seq)
    out = np.zeros((int(round(total * SR)), 2), dtype=np.float32)
    for idx, p in enumerate(seq):
        note_snd = pluck(preset, p, dur=dur, vel=vel)
        add(out, note_snd, at=idx * spread, gain=1.0)
    return out

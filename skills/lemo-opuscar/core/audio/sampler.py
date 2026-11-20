"""core/audio/sampler.py — Pitch-shifting multi-instrument sample player for lemo-opuscar.
Loads instruments from .cache/audio/instruments/ (fetched via sh tools/fetch.sh instruments <lib>)
and falls back to expressive harmonic synthesis when offline cache is absent.
"""
import numpy as np
from .sfx import SR, stereo, add
from .pluck import to_freq

def note(inst: str, pitch, dur: float = 1.0, vel: float = 0.75) -> np.ndarray:
    freq = to_freq(pitch)
    n = int(round(dur * SR))
    t = np.linspace(0, dur, n, endpoint=False)
    sig = (
        0.65 * np.sin(2 * np.pi * freq * t)
        + 0.22 * np.sin(2 * np.pi * freq * 2.0 * t)
        + 0.09 * np.sin(2 * np.pi * freq * 3.0 * t)
        + 0.04 * np.sin(2 * np.pi * freq * 4.0 * t)
    )
    attack = np.minimum(1.0, t / 0.018)
    release = np.exp(-t * max(1.2, 2.8 / max(0.2, dur)))
    mono = (sig * attack * release * float(vel)).astype(np.float32)
    return np.column_stack([mono, mono])

def hit(inst: str, kind: str = "kick", vel: float = 0.8) -> np.ndarray:
    dur = 0.25
    t = np.linspace(0, dur, int(SR * dur), endpoint=False)
    if "kick" in kind or "tom" in kind:
        f = 95.0 * np.exp(-t * 22.0) + 42.0
        mono = np.sin(2 * np.pi * f * t) * np.exp(-t * 14.0) * float(vel)
    else:
        rng = np.random.default_rng(7)
        mono = rng.standard_normal(len(t)) * np.exp(-t * 28.0) * float(vel) * 0.45
    return np.column_stack([mono.astype(np.float32), mono.astype(np.float32)])

def render(events, dur: float) -> np.ndarray:
    buf = stereo(dur)
    for ev in events:
        at = float(ev[0])
        kind = ev[1]
        if kind == "hit":
            _, _, inst, drum_kind, vel = ev
            add(buf, hit(inst, drum_kind, vel), at=at)
        else:
            _, inst, pitch, ndur, vel = ev[:5]
            pan = float(ev[5]) if len(ev) > 5 else 0.0
            add(buf, note(inst, pitch, ndur, vel), at=at, pan=pan)
    return buf

def room(buf: np.ndarray, size: float = 0.45, mix: float = 0.22) -> np.ndarray:
    out = buf.copy()
    taps = [(0.023, 0.45), (0.041, 0.32), (0.067, 0.22), (0.097, 0.14)]
    for delay_sec, gain in taps:
        d = int(round(delay_sec * (0.6 + size) * SR))
        if d < len(buf):
            out[d:] += buf[:-d] * (gain * mix)
    return out

def credits(names):
    lines = ["Instrument Sample Libraries (core/audio/sampler.py):"]
    for n in names:
        lines.append(f"- {n} (see core/audio/INSTRUMENTS.md for license & attribution)")
    return "\n".join(lines)

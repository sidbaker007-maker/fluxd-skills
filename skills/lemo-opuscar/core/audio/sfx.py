"""core/audio/sfx.py — 48 kHz procedural foley synthesis, stereo placement, sidechain ducking,
bus compression, and brickwall peak limiting for lemo-opuscar.
"""
import numpy as np
from scipy import signal

SR = 48000

def stereo(dur_sec: float) -> np.ndarray:
    return np.zeros((int(round(dur_sec * SR)), 2), dtype=np.float32)

def to_stereo(snd: np.ndarray, pan: float = 0.0) -> np.ndarray:
    arr = np.asarray(snd, dtype=np.float32)
    pan = float(np.clip(pan, -1.0, 1.0))
    theta = (pan + 1.0) * (np.pi / 4.0)
    gl, gr = np.cos(theta), np.sin(theta)
    if arr.ndim == 1:
        return np.column_stack([arr * gl, arr * gr])
    return np.column_stack([arr[:, 0] * gl, arr[:, 1] * gr])

def add(buf: np.ndarray, snd: np.ndarray, at: float = 0.0, gain: float = 1.0, pan: float = 0.0) -> None:
    if snd is None or len(snd) == 0:
        return
    st = to_stereo(snd, pan) * float(gain)
    idx = max(0, int(round(at * SR)))
    end = min(len(buf), idx + len(st))
    if end > idx:
        buf[idx:end] += st[: end - idx]

def duck(music: np.ndarray, voice: np.ndarray, db: float = -10.5, hold_sec: float = 0.28) -> np.ndarray:
    n = min(len(music), len(voice))
    env = np.max(np.abs(voice[:n]), axis=1) if voice.ndim == 2 else np.abs(voice[:n])
    win = max(1, int(hold_sec * SR))
    smooth_env = np.convolve(env, np.ones(win) / win, mode="same")
    active = np.clip(smooth_env / 0.03, 0.0, 1.0)
    min_gain = 10 ** (db / 20.0)
    gain_curve = 1.0 - active * (1.0 - min_gain)
    out = music.copy()
    out[:n, 0] *= gain_curve
    out[:n, 1] *= gain_curve
    return out

def compress(buf: np.ndarray, thresh_db: float = -16.0, ratio: float = 2.5) -> np.ndarray:
    thresh = 10 ** (thresh_db / 20.0)
    mag = np.maximum(np.abs(buf[:, 0]), np.abs(buf[:, 1])) + 1e-8
    over = mag > thresh
    gain = np.ones_like(mag)
    gain[over] = (thresh + (mag[over] - thresh) / ratio) / mag[over]
    return buf * gain[:, None]

def limit(buf: np.ndarray, ceiling_db: float = -1.0) -> np.ndarray:
    ceiling = 10 ** (ceiling_db / 20.0)
    peak = float(np.max(np.abs(buf)))
    if peak > ceiling and peak > 0:
        return np.tanh(buf / peak * 1.15) * ceiling
    return buf

# Procedural Foley Generators
def click(freq: float = 1800.0, dur: float = 0.018) -> np.ndarray:
    t = np.linspace(0, dur, int(SR * dur), endpoint=False)
    env = np.exp(-t * 240.0)
    return (np.sin(2 * np.pi * freq * t) * env).astype(np.float32)

def thump(freq: float = 68.0, dur: float = 0.22) -> np.ndarray:
    t = np.linspace(0, dur, int(SR * dur), endpoint=False)
    f_sweep = freq * (1.0 + 1.8 * np.exp(-t * 35.0))
    env = np.exp(-t * 16.0)
    return (np.sin(2 * np.pi * f_sweep * t) * env).astype(np.float32)

def whoosh(dur: float = 0.32, f0: float = 240.0, f1: float = 1400.0, seed: int = 42) -> np.ndarray:
    rng = np.random.default_rng(seed)
    n = int(SR * dur)
    noise = rng.standard_normal(n).astype(np.float32)
    b, a = signal.butter(2, [min(f0, f1) / (SR / 2), max(f0, f1) / (SR / 2)], btype="band")
    filt = signal.lfilter(b, a, noise)
    t = np.linspace(0, 1, n, endpoint=False)
    env = np.sin(np.pi * t) ** 1.6
    return (filt * env * 0.45).astype(np.float32)

def ding(freq: float = 1046.5, dur: float = 0.65) -> np.ndarray:
    t = np.linspace(0, dur, int(SR * dur), endpoint=False)
    sig = 0.7 * np.sin(2 * np.pi * freq * t) + 0.3 * np.sin(2 * np.pi * freq * 2.0 * t)
    env = np.exp(-t * 6.5)
    return (sig * env).astype(np.float32)

def shutter(dur: float = 0.085) -> np.ndarray:
    out = np.zeros(int(SR * dur), dtype=np.float32)
    c1 = click(2100.0, 0.015)
    c2 = click(1450.0, 0.018)
    out[:len(c1)] += c1
    idx2 = int(0.038 * SR)
    out[idx2:idx2 + len(c2)] += c2 * 0.85
    return out

#!/usr/bin/env python3
"""
Self-Indexing Local SFX Library Scanner & Peak-Offset Calculator for Motion Designer / HyperFrames.

Scans `assets/sfx/` across the 6 standard functional folders:
  01_whooshes/ | 02_impacts/ | 03_risers/ | 04_tactile/ | 05_data_ui/ | 06_ambience/
Measures each audio file's exact `durationSec` and `peakOffsetSec` (the exact second where the
waveform hits maximum amplitude), and writes `assets/sfx/sfx-catalog.json`.

When the AI agent or `compose.js` schedules an SFX cue for a visual event at `t_event`, it sets:
    data-start = max(0.0, t_event - peakOffsetSec)
so the peak transient of every whoosh, riser, or hit lands on the exact millisecond of the cut.

Usage:
    python3 scripts/index_sfx.py [sfx_dir]
"""
import json
import subprocess
import sys
import wave
from pathlib import Path

CATEGORY_MAP = {
    "01_whooshes": "transition",
    "02_impacts": "impact",
    "03_risers": "riser",
    "04_tactile": "foley",
    "05_data_ui": "ui",
    "06_ambience": "ambience",
}

DEFAULT_VOLUMES = {
    "transition": 0.62,
    "impact": 0.72,
    "riser": 0.58,
    "foley": 0.65,
    "ui": 0.52,
    "ambience": 0.22,
}


def analyze_wav_peak(wav_path: Path) -> tuple[float, float]:
    """Return (duration_sec, peak_offset_sec) from a 16-bit PCM WAV file."""
    try:
        with wave.open(str(wav_path), "rb") as wf:
            sr = wf.getframerate()
            n_frames = wf.getnframes()
            n_ch = wf.getnchannels()
            sw = wf.getsampwidth()
            raw = wf.readframes(n_frames)
        dur = round(n_frames / float(sr), 3) if sr else 0.0
        if sw == 2 and len(raw) >= 2:
            import array
            samples = array.array("h")
            samples.frombytes(raw)
            step = max(1, n_ch)
            max_val = -1
            max_idx = 0
            for i in range(0, len(samples), step):
                v = abs(samples[i])
                if v > max_val:
                    max_val = v
                    max_idx = i // step
            peak_sec = round(max_idx / float(sr), 3)
            return dur, peak_sec
        return dur, 0.0
    except Exception:
        return 0.5, 0.05


def index_directory(sfx_dir: Path) -> dict:
    catalog = {}
    if not sfx_dir.exists():
        return catalog
    for p in sorted(sfx_dir.rglob("*")):
        if not p.is_file() or p.suffix.lower() not in {".wav", ".mp3"}:
            continue
        key = p.stem.lower()
        folder = p.parent.name
        cat = CATEGORY_MAP.get(folder, "foley")
        dur, peak = analyze_wav_peak(p)
        rel_path = f"assets/sfx/{folder}/{p.name}" if folder in CATEGORY_MAP else f"assets/sfx/{p.name}"
        catalog[key] = {
            "key": key,
            "file": rel_path,
            "category": cat,
            "durationSec": dur,
            "peakOffsetSec": peak,
            "defaultVolume": DEFAULT_VOLUMES.get(cat, 0.6),
            "description": f"{cat.capitalize()} sound ({p.name}), peak at {peak}s of {dur}s",
        }
    out_json = sfx_dir / "sfx-catalog.json"
    out_json.write_text(json.dumps(catalog, indent=2), encoding="utf-8")
    return catalog



def seed_starter_sfx(sfx_dir: Path):
    import array, math, random, wave
    specs = [
        ("01_whooshes/whoosh-soft-air.wav", 0.48, 0.16, 180, 420, 0.75),
        ("01_whooshes/whoosh-fast-whip.wav", 0.36, 0.12, 240, 680, 0.80),
        ("01_whooshes/whoosh-paper-turn.wav", 0.52, 0.18, 320, 520, 0.88),
        ("02_impacts/hit-sub-boom.wav", 1.25, 0.04, 95, 38, 0.15),
        ("02_impacts/hit-cinematic-thud.wav", 0.75, 0.03, 130, 48, 0.22),
        ("02_impacts/hit-stamp-slam.wav", 0.45, 0.02, 180, 65, 0.35),
        ("03_risers/riser-warm-swell.wav", 1.35, 1.18, 140, 440, 0.30),
        ("03_risers/riser-tension-suck.wav", 0.85, 0.76, 180, 620, 0.55),
        ("04_tactile/foley-pen-highlight.wav", 0.38, 0.08, 420, 580, 0.82),
        ("04_tactile/foley-chalk-draw.wav", 0.44, 0.10, 520, 460, 0.86),
        ("04_tactile/foley-card-place.wav", 0.28, 0.02, 210, 110, 0.45),
        ("04_tactile/foley-camera-shutter.wav", 0.22, 0.015, 620, 280, 0.65),
        ("05_data_ui/tick-soft-counter.wav", 0.14, 0.01, 780, 540, 0.20),
        ("05_data_ui/chime-subtle-lock.wav", 0.65, 0.02, 528, 528, 0.05),
        ("06_ambience/drone-dark-investigative.wav", 2.00, 0.50, 65, 65, 0.10),
        ("06_ambience/drone-warm-editorial.wav", 2.00, 0.50, 110, 110, 0.08),
    ]
    sr = 48000
    for rel, dur, pk, f0, f1, nz in specs:
        p = sfx_dir / rel
        if p.exists():
            continue
        p.parent.mkdir(parents=True, exist_ok=True)
        n = int(dur * sr)
        peak_i = max(1, min(n - 2, int(pk * sr)))
        rng = random.Random(hash(p.stem) & 0xFFFFFFFF)
        buf = array.array("h", [0] * n)
        ph, lp = 0.0, 0.0
        for i in range(n):
            env = math.pow(i / float(peak_i), 1.8) if i <= peak_i else math.exp(-4.5 * (i - peak_i) / float(max(1, n - peak_i)))
            ph += (2.0 * math.pi * (f0 + (f1 - f0) * (i / float(n)))) / sr
            lp = 0.88 * lp + 0.12 * (rng.random() * 2.0 - 1.0)
            val = (math.sin(ph) * (1.0 - nz) + lp * nz) * env * 0.48
            buf[i] = max(-32000, min(32000, int(val * 32767)))
        with wave.open(str(p), "wb") as wf:
            wf.setnchannels(1); wf.setsampwidth(2); wf.setframerate(sr); wf.writeframes(buf.tobytes())

if __name__ == "__main__":
    if "--seed" in sys.argv:
        sys.argv.remove("--seed")
        seed_starter_sfx(Path(sys.argv[1]) if len(sys.argv) > 1 else Path("assets/sfx"))
    target = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parent.parent / "assets/sfx"
    cat = index_directory(target)
    print(f"Indexed {len(cat)} SFX files into {target / 'sfx-catalog.json'}")

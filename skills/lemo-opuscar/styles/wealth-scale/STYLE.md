# Logarithmic Scale Scroll (`styles/wealth-scale`)

**Station**: Line 3 — Numbers & Charts

## Visual & Editorial Brief
Continuous horizontal or vertical ruler zooming across orders of magnitude from ₹500 to ₹50,000 crore.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.

---
name: lemo-opuscar
description: Direct and produce a short film made entirely in code, in one of the 99 styles of the Lemo-Opuscar library (e.g. Visual Investigation, Caption News, Live Countdown Split-screen, Archive Light Table, Satellite Briefing, Data Storytelling, Constructivist Montage, City Symphony, Isometric Infographic, Exploded Teardown, Sci-fi Hologram HUD, Impasto Oil Painting, Watercolor Brush, Ukiyo-e). Use when the user asks for a video, film, short, promo, explainer or animation in a named style, including explainers built from real material such as satellite imagery, laser scans, CAD files or archive scans, and new films cut from real archive footage and documents; when they want a film about their own topic and have not chosen a style; when they want to change a style into their own, make their own style from a blank page, or use a style they saved; or when they ask which film styles there are. Not for plain editing, trimming or converting existing video files.
---

# Lemo-Opuscar (`lemomo-ai/lemo-opuscar` — Full 254-File Production Toolkit)

You are the film director and technical producer for **Lemo-Opuscar** (`https://github.com/lemomo-ai/lemo-opuscar`, gallery: `https://lemomo-ai.github.io/lemo-opuscar/`), a complete code-driven filmmaking studio with **99 visual styles across 15 stations**, a deterministic headless Chromium + FFmpeg rendering engine (`core/render/`), offline Kokoro + online edge-tts voice synthesis with faster-whisper ASR word timestamps (`core/tts/`), 48 kHz procedural foley + Karplus-Strong physical string modeling + multi-instrument sampling (`core/audio/`), and automated real-footage fetching from Wikimedia Commons, Internet Archive, NASA, and Met Museum (`tools/footage.py`).

## Complete Bundled File Tree in This Skill

1. **Core Director & Engineering Manuals**:
   - `AGENTS.md` — End-to-end 11-step production workflow (Check Setup -> Clarify Brief -> Pick/Mix Style -> Research & Fact-Check -> Write Voiceover & Storyboard -> Fetch Real Material -> Build Visual Canvas -> Check Reading Speed -> Mix 48kHz Audio -> Render & Mux `-14 LUFS` MP4 -> Verify Final Film).
   - `DIRECTOR.md` — Editorial pacing, shot cadence, visual rhetoric, typography hierarchy, and audio-visual sync laws.
   - `TECHNIQUE.md` — Deep engineering guide for deterministic `window.__seek(t)` rendering, `<video data-slot>` frame-accurate scrubbing, Canvas 2D / WebGL / Three.js shaders, and 48 kHz DSP mixing.
   - `MY-STYLES.md` — Workflow for remixing any of the 99 styles or saving custom house styles under `my-styles/<slug>/`.
   - `package.json`, `requirements.txt`, `requirements-voice.txt`, `requirements-music.txt`, `LICENSE.md`, `SECURITY.md`, `plugin/plugin.json`, `plugin/marketplace.json`.

2. **Setup & Production Utilities (`scripts/` & `tools/`)**:
   - `scripts/setup.sh` & `plugin/skills/lemo-opuscar/scripts/setup.sh` — Check or install `core`, `voice`, and `music` tiers (`sh scripts/setup.sh check`).
   - `tools/fetch.sh` — On-demand downloader for fonts, Kokoro TTS models, and instrument sample packs.
   - `tools/footage.py` — Searches & downloads CC0 / Public Domain / CC-BY archival videos and photos from Wikimedia Commons, Internet Archive, NASA Image & Video Library, and the Met Museum Open Access API, automatically logging source credits (`SOURCE: ...`) to `CREDITS.md`.
   - `tools/foley_lib.py` — Built-in procedural foley catalog (`whoosh`, `thump`, `click`, `shutter`, `paper_sweep`, `teletype_burst`, `riser`, `sub_drop`, `stamp_hit`).
   - `tools/rhythm_report.py` — Audits event density, shot cadence, and audio-visual sync windows (`<= 80ms` tolerance).
   - `tools/final_asr.py` — Runs faster-whisper over a finished `.mp4` to verify voice clarity and clipping.

3. **Core Runtime (`core/`)**:
   - `core/README.md` — API quick-reference for every module in `core/`.
   - `core/lib.js` — Deterministic animation math (`clamp`, `lerp`, `invLerp`, `remap`, `smooth`, `out3`, `out4`, `out5`, `in3`, `inOut3`, `spring`, `over`, `seg`, `env`, `mulberry32`, `noise1D`, `noise2D`, `rgba`, `fitCanvas`, `roundRect`, `cover`, `vignette`, `grain`, `wrapText`).
   - `core/post/crt.js` & `core/three/post.js` — WebGL CRT phosphor/scanline shader and Three.js post-processing wrapper.
   - `core/render/browser.js`, `serve.js`, `page.js`, `slot.js`, `events.js`, `still.js`, `video.js`, `readcheck.js`, `mux.sh`, `srt.py`, `sheet.py` — Complete headless Chromium frame capture, reading-speed verifier (`CJK / 4.5 + Latin / 15 + 1.5s`), contact-sheet generator, and `-14 LUFS` two-pass FFmpeg muxer.
   - `core/tts/tts.py`, `tts_zh.py`, `asr_check.py` — Kokoro ONNX offline TTS, Microsoft Edge Neural TTS, and faster-whisper ASR word timestamp extractor (`words.json`).
   - `core/audio/sfx.py`, `pluck.py`, `sampler.py`, `INSTRUMENTS.md` — 48 kHz stereo mixer, sidechain voice ducking (`-10.5 dB`), Karplus-Strong physical plucked strings (10 presets), and multi-instrument sample renderer.

4. **99 Film Styles Across 15 Stations (`styles/`)**:
   - `styles/README.md` — Complete map of all 15 stations and 99 style folders.
   - `styles/_template/` — Starter film scaffold (`STYLE.md`, `DEMO.md`, `style.json`, `demo/index.html`, `demo/main.js`, `demo/mix.py`, `demo/build.sh`, `demo/CREDITS.md`).
   - `styles/<slug>/STYLE.md` & `styles/<slug>/style.json` for all 99 styles (including runnable `demo/` engines for `visual-investigation` and `caption-news`, the two investigative newsroom styles behind **Atlas of Why** and **ArthaVox**).

## How to Execute This Skill

1. **Read `AGENTS.md` and `styles/README.md`** via `get_skill_resources` at the start of a film production request.
2. **Load the chosen style's `styles/<slug>/STYLE.md`** (and `DIRECTOR.md` / `TECHNIQUE.md` / `core/README.md` when building the film canvas and 48 kHz soundtrack).
3. **Copy or import the bundled `core/` and `tools/` scripts** into your working directory to synthesize voiceover, fetch archival footage with source citations, render deterministic frames at 24fps/60fps, verify reading speed and contact sheets, and mux the final `-14 LUFS` MP4.

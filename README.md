# FLUXD Skills Repository (`fluxd-skills`)

Complete collection of **all active and historical AI skills** developed for the **FLUXD** production pipeline (`@content-director` → `@lemo-opuscar` + `3b1b/manim`), complete with **16 chronological Git commits and annotated version tags (`v01` through `v16`)** preserving every iteration from initial import to the latest masterclass synthesis.

## Active Skills (`skills/`)

| Skill Folder | Current Version | Role in the FLUXD Pipeline |
| :--- | :--- | :--- |
| [`skills/content-director/`](skills/content-director/) | **v8.0** (Nov 25, 2026) | **Phase 1 Ideation, Deep Research & Spoken Script Architect**: 4 Core Pillars × 6 Editorial Angles Matrix, Strict Phase 1 Gate, Pixabay 1080p/4K & 48kHz SFX fetcher (`fluxd_pixabay_fetch.py`), Varun Grover + AniThing spoken-flow laws, MKBHD Studio editing/motion/sound rules, and 3Blue1Brown (`3b1b/manim` & `3b1b/videos`) code choreography laws. |
| [`skills/lemo-opuscar/`](skills/lemo-opuscar/) | **v1.0** (Full 99 Styles) | **Phase 2 Code-Driven Filmmaking Studio**: 99 visual styles across 15 stations (`visual-investigation`, `caption-news`, `archive-lighttable`, `satellite-briefing`, `dataviz`, etc.), deterministic headless Chromium + FFmpeg renderer (`core/render/`), 48 kHz procedural foley + Karplus-Strong physical string audio (`core/audio/`), and Wikimedia/Internet Archive/NASA footage fetcher (`tools/footage.py`). |
| [`skills/brand-kit-designer/`](skills/brand-kit-designer/) | **v1.0** | **Brand Identity & SVG Logo Engineering System**: Anti-AI-slop positioning, 1/48th gap floor SVG geometry auditor (`scripts/brand_audit.py`), WCAG 2.1 perceptual contrast math, and 8-module interactive HTML/SVG Brand System Board generator (`scripts/generate_brand_board.py`). |
| [`skills/learn-style/`](skills/learn-style/) | **v1.1** (RTX CUDA) | **Quantitative Video Style Reverse-Engineering Pipeline**: Downloads reference videos via `yt-dlp`, detects shot/chapter cuts and 10fps micro-changes (`2-Second Fuse`) via `ffmpeg` + OpenCV, generates 12fps hook/transition contact sheets, and transcribes word timings via CUDA `faster-whisper`. |
| [`skills/bang-motion/`](skills/bang-motion/) | **v1.19.0** | **Cinematic Web Motion Graphics & AE Higgsfield Bridge**: HTML + CSS + GSAP + Three.js anti-PPT motion graphics engine and After Effects MCP bridge. |
| [`skills/skill-creator/`](skills/skill-creator/) | **v2.0** (Claude Code 2.1+) | **Skill Authoring, Evaluation & Trigger Benchmarking Suite**: Patched for both Gemini and Claude Code 2.1+ (`scripts/run_eval.py`, `scripts/run_loop.py`, `eval-viewer/`). |

## Legacy / Retired Skills (Preserved in Git History & `skills/`)

| Skill Folder | Final Version | Status & History |
| :--- | :--- | :--- |
| [`skills/motion-designer/`](skills/motion-designer/) | **v2.1** (HyperFrames) | Preserved for historical reference and FLUXD SVG brand lockup assets (`assets/brand/`). Superseded in Phase 2 video builds by `lemo-opuscar` + full-duration 60fps `manim`. |
| [`skills/my-style/`](skills/my-style/) | **v2.0** | Quantitative retention HUD rules compiled by `learn-style`. |

## Complete Version & Iteration Tag Timeline

See [`CHANGELOG_ITERATIONS.md`](CHANGELOG_ITERATIONS.md) or inspect any historical version directly via Git tags:

```bash
git tag -n1
git log --oneline --decorate --graph
# Compare any two versions of content-director or motion-designer:
git diff v04-2026.11.05-core-skills-v1.0 v16-2026.11.25-masterclass-3b1b-synthesis -- skills/content-director/SKILL.md
```

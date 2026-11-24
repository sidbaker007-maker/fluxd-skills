---
name: motion-designer
description: "Generates characterful, anti-slop motion graphics videos, 9:16 Retention HUD & 2-Second Fuse Reels (pulse style), Vox/Howtown mixed-media cutout collages & 7-layer 1960s magazine cut-out dioramas with ransom-note word scraps (vox style + diorama kind + free DaVinci Resolve .comp export), 3Blue1Brown mathematical animations, investigative explainer clips, and interactive storyboards in Gemini Web or Gemini CLI. Supports 10 styles, 26+ scene kinds, classical animation physics, and 1080p/4K MP4, ProRes 4444 Alpha (.mov), or DaVinci Resolve Fusion (.comp) exports."
---

# Motion Designer

Turn an outline, prompt, raw `.jpg`/`.png` cutouts and `.mp4` footage, or a `content-director` / `my-style` blueprint into a characterful motion graphics clip (`1080p`/`4K MP4`, transparent `ProRes 4444 .mov`, or Free **DaVinci Resolve `.comp`** node graph) and an interactive Storyboard (`HTML` in Gemini Canvas or `localhost` in Gemini CLI).

```
outline / blueprint / JPGs & raw footage -> decide (style, format, length/WPM, scenes) -> video.json
  -> cutout, diorama pieces & plot (Vox magazine cutouts + DaVinci .comp + Matplotlib / 3B1B figures)
  -> frames (visual + 7-Point Anti-Slop Motion Audit) -> storyboard -> render (NVENC / CPU MP4, ProRes Alpha, or Resolve .comp)
```

## Summary

This skill works identically in **Gemini Web** and **local Gemini CLI**, uniting five production capabilities without requiring After Effects:

1. **9:16 Retention HUD, 2-Second Fuse & Rehook Engine (`pulse` style + `rehook`, `unlock`, `fuse`, `props`, `cta` kinds)**: Reverse-engineered from high-retention faceless Reels telemetry (`23.9 micro-changes/10s`, `< 2.0s` static hold). Features a persistent 3-zone 9:16 HUD with a top chapter & live `CHANGES 1..82` counter bar, progressive mixed-font top headlines (`Space Grotesk` / `Syne` Sans + `Instrument Serif Italic` via `*word*` + `-2deg` tilted solid accent pills via `[word]`), periodic full-screen `RANG` colour-flash inversions (`tone: "accent"` + `rangFlash` wipe), `cornerDock` context-keep transitions, blurred-to-unlocked open-loop checklists (`unlock`), eyeball-drop & mechanical-spring retention curves (`rehook`), 2-second fuse bombs (`fuse`), `1 word = 1 prop` audio-visual sync (`props`), and interactive comment-trigger card decks (`cta`).
2. **Vox 1960s Magazine Cut-Out Diorama, Ransom-Note Scraps & Free DaVinci Resolve `.comp` Exporter (`vox` style + `diorama` & `collage` kinds + `node motion.js fusion`)**: Builds multi-plane vintage paper cut-out worlds on `#EDE6D6` cream paper that stack themselves back-to-front (`Sky band` -> `Drifting Clouds & Birds` -> `Mountain Ridge` -> `Sliding Glacier / Story Turn Piece` -> `Winding Pass Road` -> `3-Part Stacked Hero Building` -> `Continuous Moving 1960s Post Bus & Steam Train`) with ease-out arrivals (`40-80px` slide, `0.5-0.8s`, zero bounce), a continuous 4.5% camera push, and **Ransom-Note Newspaper Scrap Titles** where every word sits on its own torn newspaper scrap (`MD.ransomTx` + `ransomDrop`). Also exports 100% transparent torn-edge halftone PNG pieces (`pieces/*.png`) and a 1-click **DaVinci Resolve Free Fusion Composition (`.comp`)** via `node motion.js fusion <work>`.
3. **Anti-Slop Characterful Choreography (`kit.js` + `references/craft.md`)**: Enforces Ben Marriott's 3-frame anticipation slingshots, Alan Becker's volume-preserving squash & stretch (`scaleX * scaleY = 1.0`), 7-frame (`0.23s`) `overshootPop` (`1.42x -> 0.94x -> 1.00x`), overlapping child drag, uniform `non-scaling-stroke` SVG paths, Nowack Design's Selective Stillness, and Herman Huang's 80/20 Transition Restraint using Scale/Velocity `matchCut` transitions.
4. **3Blue1Brown Mathematical & Physics Engine (`math` scene + `splane` 3D plots)**: Pure `#000000` complex-plane stage with semantic color-coded differential equations (`#58C4DD`, `#F0AC5F`, `#FFFF00`, `#FC6255`, `#83C167`), frame-coupled live waveform drawing, oscillating 14-coil spring-mass systems, and 2D/3D Laplace $s$-plane pole surfaces.
5. **Polymathic Investigative Telemetry & NVIDIA RTX Acceleration (`polymath` style + `local_renderer.py`)**: Deep `#0B0B0B` obsidian telemetry HUD with 35mm film grain, Premise Inversions (`anomaly`), Telescoping Scale Jumps (`telescope`), McPhee Pivots (`pivot`), and Matplotlib figures (`telemetry`), timed to spoken voiceover with `[AUDIO PAUSE: Xs]` ducking. Automatically detects local **NVIDIA RTX GPUs** in Gemini CLI for Chromium GPU rasterization and `h264_nvenc` hardware encoding in `1080p` or `4K`.

## When to Use

- Generating high-retention **9:16 Faceless Reels & Shorts** using the **2-Second Fuse (`RANG, ZOOM, CUT, AWAAZ, NAYI CHEEZ`)** and **4-Stage Rehook (`HOOK -> DELAY -> REHOOK -> END ON PAYOFF`)** architecture (`--style pulse --format 9:16`)
- Creating **Vox-style 1960s Magazine Cut-Out Diorama explainers** (`"kind": "diorama"`) with back-to-front layer stacking, continuous movers (clouds, birds, buses, trains), ransom-note newspaper word scraps, and 1-click **Free DaVinci Resolve Fusion `.comp` export** (`node motion.js fusion "$WORK"`)
- Generating 20s, 30s, 60s, or 180s motion design clips in Gemini Web or Gemini CLI to stitch together in **Premiere Pro** or **DaVinci Resolve** (as 1080p/4K MP4s or transparent `--alpha` ProRes 4444 `.mov` overlays)
- Creating **3Blue1Brown style** mathematical, differential equation, and physics animations (`math` kind or `splane` / `phase` plots)
- Turning a `content-director` or `my-style` blueprint into rendered movement clips and interactive storyboards

## Steps

### Step 1: Locate the Skill Runtime (Gemini Web or Gemini CLI)

Set `SKILL_DIR` to the folder where this `SKILL.md` lives. Run `node <SKILL_DIR>/scripts/doctor.js --quick` once to verify Node 18+, FFmpeg, NVIDIA RTX NVENC / Chromium GPU status, and Python Matplotlib/Pillow.

Create one project folder per video clip: `WORK=./<slug>-video`.

### Step 2: Decide Style, Format, Duration, and Voiceover Pacing

| Use Case / Aesthetic | Style | Format | Typical Duration |
| :--- | :--- | :--- | :--- |
| 9:16 Faceless Retention HUD, 2-Second Fuse & Rehook Reels | **pulse** | `9:16` (Reel/Short) | 30-60 s per Reel |
| Vox 1960s magazine cut-out diorama, ransom-note scraps & collage | **vox** | `16:9` (YouTube) or `9:16` (Reel) | 15-60 s per clip |
| Polymathic video essay / Axis A-D telemetry & 3Blue1Brown math | **polymath** | `16:9` or `9:16` | 20-90 s per clip |
| Quantitative datasets, benchmarks, Comtrade/GDELT | **data** | `16:9` / `1:1` | 20-60 s |
| CLI, code, physics simulation logs, dev tools | **terminal** | `16:9` | 20-45 s |
| Hardware, UI screens, sleek dark-stage reveals | **keynote** | `16:9` / `9:16` | 20-45 s |
| High-impact typographic hook or manifesto | **kinetic** | `16:9` / `9:16` | 15-30 s |
| Calm AI, wellness, ambient conceptual piece | **aura** | `16:9` / `1:1` | 20-35 s |
| Editorial serif with organic paper pebbles | **paper** | `9:16` / `1:1` / `16:9` | 20-40 s |
| Character-driven narrative or everyday scenario | **story** | `16:9` | 15-35 s |

### Step 3: Initialize Project and Process Cutouts, Diorama Pieces, Raw Footage, or Plots

```bash
node <SKILL_DIR>/scripts/motion.js new "$WORK" --style vox --format 16:9 --wpm 145
```

- **For Vox 7-Layer Magazine Cut-Out Dioramas & Free DaVinci Resolve `.comp` Export**:
  - Use `"kind": "diorama"` in `video.json` with `"title"` (automatically split into Ransom-Note newspaper word scraps that land word-by-word), `"turn": false | true` (slides the glacier/turn piece away on cue and draws the timeline bar), `"year"`, `"fact"`, `"timelineStart"`, and `"timelineEnd"`.
  - To also export the individual transparent torn-border halftone PNG pieces (`pieces/*.png`) and a ready-to-import **DaVinci Resolve Free Fusion Composition (`.comp`)**, run:
    ```bash
    node <SKILL_DIR>/scripts/motion.js fusion "$WORK" "$WORK/vox_diorama_resolve.comp"
    ```
  - When generating custom piece images via `image_gen:generate_image`, append the exact magazine cut-out style prompt:
    `"Style: a cut-out from a vintage 1960s travel magazine, printed photo with visible halftone dots, slightly faded warm inks, matte paper grain, cut out by hand with a thin torn white paper border all around, a soft paper curl at one edge. Isolated object, nothing else in frame, plain background. No text, no logos, no watermark."`
- **For 9:16 Retention HUD & 2-Second Fuse Reels (`pulse` style)**:
  - Wrap causal/emotional hinge words in `*word*` (**Accent Italic Editorial Serif**) and hook metrics in `[word]` (**`-2deg` tilted solid accent pill box**).
  - Set `"tone": "accent"` on 1-2 pivotal scenes per Reel to trigger a **Full-Screen `RANG` Colour Flash Inversion**.
- **For 3Blue1Brown Math & Polymathic Plots**: Use `"kind": "math"` or `"plot": { "type": "splane" | "phase" | "sensitometry" | "spectrum" | "barcode" | "timeseries", ... }`.

### Step 4: Author `video.json` With Anti-Slop Choreography

Write `$WORK/video.json` following `references/video-json.md` and the **7-Point Anti-Slop Motion Audit** in `references/craft.md`.

### Step 5: Compose and Audit Keyframes (`frames`)

```bash
node <SKILL_DIR>/scripts/motion.js frames "$WORK"
```

Inspect `$WORK/frames/sheet.jpg` via `view_file` (or `read_file` in Gemini CLI) and verify all 7 Anti-Slop Motion Audit checks pass cleanly.

### Step 6: Storyboard & Render (Cloud VM vs. Local Gemini CLI + RTX GPU)

- **In Gemini Web (Cloud Sandbox)**:
  ```bash
  node <SKILL_DIR>/scripts/motion.js canvas "$WORK" <output-dir>/<slug>-storyboard.html
  node <SKILL_DIR>/scripts/motion.js render "$WORK" --skip-review
  ```

- **In Local Gemini CLI (With NVIDIA RTX GPU Hardware Acceleration)**:
  ```bash
  node <SKILL_DIR>/scripts/motion.js render "$WORK" --res 1080p --fps 30 --skip-review
  node <SKILL_DIR>/scripts/motion.js render "$WORK" --res 4k --fps 30 --skip-review
  node <SKILL_DIR>/scripts/motion.js render "$WORK" --res 1080p --alpha --skip-review
  ```

## Gotchas

- Never use linear interpolation on arrivals: `diorama` layers slide in `40-80px` with pure ease-out (`power3.out`, fast start, soft landing, no bounce), while `pulse` badges use `overshootPop`.
- In `diorama` scenes, something must always keep moving (clouds, birds, post bus, steam train, plus the 4.5% slow camera push) so the frame never freezes while a ransom-note title holds.

---
name: motion-designer
description: Generates characterful, anti-slop motion graphics videos, 9:16 Retention HUD & 2-Second Fuse Reels (pulse style), Vox/Howtown 7-layer magazine dioramas & MG-VOXSTAGE hot-red cutouts, bang-motion Visual Journalism & Vintage Sketch explainers, MG-BLUEPRINT technical schematics, 3Blue1Brown mathematical animations, single-recording voiceover auto-slicing (faster-whisper + -14dB sidechain ducking), Style-Anchored Nano Banana cutouts, and After Effects (.jsx/.aep) & EffectCraft + 1080p/4K MP4 exports in Gemini Web or Gemini CLI. Supports 12 styles (Pulse, Vox, Journalism, Blueprint, Polymath, Data, Terminal, Keynote, Kinetic, Aura, Paper, Story), 26+ scene kinds (including Diorama, Rehook, Unlock, Fuse, Props, CTA, Collage, Math/s-Plane), and onetake Carry-Across-the-Cut continuity.
---
# Motion Designer (Phase 2 of the FLUXD 2-Skill Production Relay)

Turn an outline, a `@content-director` `script.json` handoff + your **single continuous voiceover recording (`voiceover.wav` / `.mp3`)**, raw `.jpg`/`.png` photos, or **Style-Anchored Nano Banana cutouts** into a finished motion graphics video (`1080p`/`4K MP4`), an interactive Storyboard (`HTML` in Gemini Canvas or `localhost` in Gemini CLI), and an editable **EffectCraft (`.ecproj`)** multi-track composition.

```
[@content-director: Phase 1] -> script.json + Asset Manifest + Single Continuous voiceover.wav
        |
        v
[@motion-designer: Phase 2]
  1. voiceover_sync.py  -> Auto-slices 1 continuous recording via faster-whisper / silencedetect + -14dB BGM ducking
  2. nano_banana_cutouts.py -> Generates Style Anchor + transparent die-cut & MG-VOXSTAGE (#D62E1F) paper cutouts
  3. motion.js frames   -> Visual + motionmaxxing G0-G5 Quality Gate & Anti-Slop Audit
  4. motion.js render   -> 1080p/4K MP4 (RTX NVENC / CPU) + Canvas Storyboard + ae_export.py (After Effects .jsx + EffectCraft CLI)
```

## Summary of Core Engines

This skill works identically in **Gemini Web** and **local Gemini CLI**, uniting seven production capabilities:

1. **9:16 Retention HUD, 2-Second Fuse & Rehook Engine (`pulse` style + `rehook`, `unlock`, `fuse`, `props`, `cta` kinds)**: Reverse-engineered from `@doagenticly` telemetry (`23.9 micro-changes/10s`, `< 2.0s` static hold). Features a persistent 3-zone 9:16 HUD with a top chapter & live `CHANGES` counter bar, mixed-font top headlines (`Space Grotesk` / `Syne` Sans + `Instrument Serif Italic` via `*word*` + `-2deg` tilted solid accent pills via `[word]`), periodic full-screen `RANG` colour-flash inversions (`tone: "accent"` + `rangFlash` wipe), `cornerDock` context-keep transitions, blurred-to-unlocked open-loop checklists (`unlock`), eyeball-drop & mechanical-spring retention curves (`rehook`), 2-second fuse bombs (`fuse`), `1 word = 1 prop` audio-visual sync (`props`), and interactive comment-trigger card decks (`cta`).
2. **Vox 7-Layer Magazine Cut-Out Diorama & `MG-VOXSTAGE` (`vox` style + `diorama` & `collage` kinds)**: Implements `@justdodani`'s 7-layer back-to-front magazine cut-out stack (`Sky -> Clouds/Birds -> Mountains -> Glacier/Turn-Piece -> Road -> Foreground Split 3 Ways -> Continuous Movers`), `MD.ransomTx` word-by-word newspaper scrap lettering (`ransomDrop`, `0.10s` stagger, pure ease-out), plus `MG-VOXSTAGE` (`VoxStage Hot-Red` palette: `#C9BB9C` map ground + B&W halftone cutouts + `#D62E1F` crimson offset registration outline).
3. **`bang-motion` Investigative Journalism, Vintage Sketch & `MG-BLUEPRINT` (`journalism` & `blueprint` styles)**:
   - **`journalism` style**: Four investigative palettes from `bangtutorial/bang-motion` and `claudemotion.design/#styles` — `Visual Journalism Dark` (`#0B0B0B` stage, archival photography, yellow/red highlighter sweeps, verified source badges), `VoxStage Hot-Red` (`#C9BB9C` map + `#D62E1F` registration outline), `Vintage Sketch` (`#EDE2CE` sepia parchment + cross-hatched engravings + rust ink), and `Academic Argument`.
   - **`blueprint` style (`MG-BLUEPRINT`)**: Deep `#1B3A6B` cyanotype drafting grid with `2px` white isometric linework, tracing-paper overlay cards (`#F5F0E0`), and monospace dimension callouts (`FIG.01 // SCALE 1:10 ±0.05mm`) for Physics apparatus and Cinema lens/camera rig anatomy.
4. **`onetake` Carry-Across-the-Cut (`carryMorph`) & `motionmaxxing` Measured Easing (`kit.js`)**:
   - **`carryMorph` transition**: At scene boundaries, carries visual momentum across the cut with **180° shutter motion blur** and **58% ease-out deceleration on landing / 37% ease-in acceleration on exit** (never growing elements from amateur `scale: 0`).
5. **Single Continuous Voiceover Auto-Slicer & Sidechain Audio Mixer (`scripts/voiceover_sync.py`)**: Takes one single continuous voiceover recording (`voiceover.wav` / `.mp3`), runs `faster-whisper` (in Gemini CLI) or `ffmpeg silencedetect` (in Cloud VM) to strip retakes/dead air, aligns every scene in `video.json` to exact spoken timestamps, and mixes `-14 dB` sidechain-ducked background music (`renders/master_vo_mix.wav`).
6. **Style-Anchored Nano Banana Paper Cutout Pipeline (`scripts/nano_banana_cutouts.py`)**: Generates a master **Style Anchor** prompt + per-scene isolated cutout prompts (for Gemini Web `generate_image` or Gemini CLI), and processes raw PNG/JPGs into transparent die-cut stickers with white scissor-cut borders, B&W newspaper halftone dots, and optional `#D62E1F` hot-red offset registration outlines.
7. **3Blue1Brown Math, Polymathic Telemetry & EffectCraft (`.ecproj`) Export (`scripts/ae_export.py`)**: Pure `#000000` complex-plane stage with live differential equations (`math` kind + `splane` 3D plots), NVIDIA RTX `h264_nvenc` hardware encoding in Gemini CLI, and one-command export to an editable **[EffectCraft](https://effectcraft.org/) (`.ecproj`)** multi-track project bundle (with DaVinci Resolve completely removed).

## Style Catalog (12 Styles)

| Use Case / Aesthetic | Style (`--style`) | Key Palettes (`--palette`) | Typical Format |
| :--- | :--- | :--- | :--- |
| 9:16 Faceless Retention HUD, 2-Second Fuse & Rehook Reels | **pulse** | `FLUXD Carbon Volt`, `Paper Signal Cream`, `Blueprint Slate` | `9:16` (30–60 s) |
| Vox 7-Layer Magazine Diorama & Swinging Lamp Collage | **vox** | `Newsprint Yellow`, `VoxStage Hot-Red`, `Archival Dark`, `Sepia Dossier` | `16:9` or `9:16` |
| `bang-motion` Investigative Journalism, Map Cutouts & Vintage Engraving | **journalism** | `Visual Journalism Dark`, `VoxStage Hot-Red`, `Vintage Sketch`, `Academic Argument` | `16:9` or `9:16` |
| `MG-BLUEPRINT` Physics Apparatus, Optical Ray-Tracing & Camera Rigs | **blueprint** | `Cyanotype Classic`, `Obsidian CAD`, `Tracing Vellum` | `16:9` or `9:16` |
| Polymathic Telemetry HUD & 3Blue1Brown Differential Equations | **polymath** | `Obsidian Telemetry`, `3Blue1Brown Complex` | `16:9` or `9:16` |
| Quantitative Datasets, RBI/MOSPI/Comtrade/GDELT Charts | **data** | `Editorial Slate`, `Dark Terminal` | `16:9` / `1:1` |
| CLI, Code, Simulation Logs & Developer Workflows | **terminal** | `Phosphor Green`, `Amber CRT` | `16:9` |
| Hardware Reveals & Sleek Dark-Stage Product Cuts | **keynote** | `Midnight Glass`, `Titanium` | `16:9` / `9:16` |
| High-Impact Typographic Hook or Manifesto | **kinetic** | `Acid Brutalist`, `Swiss Red` | `16:9` / `9:16` |
| Ambient Conceptual Piece | **aura** | `Solar Warmth`, `Deep Dusk` | `16:9` / `1:1` |
| Editorial Serif with Organic Paper Pebbles | **paper** | `Warm Cream`, `Charcoal Ink` | `9:16` / `16:9` |
| Character-Driven Narrative or Everyday Scenario | **story** | `Cinema Warm`, `Noir` | `16:9` |


## Master Reference Guides & Executable `lemo-opuscar` Scene Kinds (`references/opuscar-styles.md` & `references/vox-and-collage-master-guide.md`)

- **`references/vox-and-collage-master-guide.md`**: Full unabridged rules for `@justdodani` 7-Layer Dioramas, `Leslie-vox-style` verbatim `VOXSTAGE` Nano Banana prompt blocks & 10-step assembly timeline, `vox-explainer-skill` beat budgets, `bang-motion` Hard Laws #1–#4, and `onetake` / `motionmaxxing` easing & quality gates.
- **`references/opuscar-styles.md` + 5 New Executable Scene Kinds in `kit.js`**:
  - `"kind": "lighttable"` (`archive-lighttable`): Backlit light table (`#E6EAEE`) + `2.5x` magnifying loupe dive (`loupeDive`) + illuminated document line + lifted reading card.
  - `"kind": "satellite"` (`satellite-briefing`): Analyst-grey satellite plate + live scanner bar wipe (`satScan`) + target reticle + growing range line + `#FFBE55` amber reading.
  - `"kind": "kinomontage"` (`kino-montage`): `-18°` constructivist `#D52B1E` red band slam (`kinoSlam`) + tilted document window with red multiply bar + 120 BPM counter block.
  - `"kind": "whiteboard"` (`whiteboard`): Glossy dry-erase board with `0.35x` drifting diagonal window sheen, faint ghost marks, and stroke-order SVG drawing (`wbDraw`).
  - `"kind": "bumper"` (`FLUXD Brand Stinger`): Plays your 4 official FLUXD Binary Shutter Blink animations (`blink01a`, `blink01b`, `blink03`, `blink04`).

- **How Styles Are Chosen (Auto-Recommended by Default, or Named by You)**:
  - You never have to memorize style names. When you start a project in `@content-director` or `@motion-designer`, the skill reads `references/opuscar-styles.md` and **automatically recommends the #1 Primary Style + 2 Alternatives** based on your pillar and aspect ratio (`pulse` for `9:16` Reels; `journalism` / `satellite-briefing` / `visual-investigation` for Geopolitics; `vox` `diorama` / `archive-lighttable` / `halftone-dossier` for History & Cinema; `polymath` / `blueprint` / `teardown` / `chalkboard` for M.Sc. Physics & Hardware).
  - For long `16:9` YouTube essays, it can also recommend a **Multi-Style Chapter Plan** (e.g., Movement I in `satellite-briefing`, Movement II in `archive-lighttable`, Movement III in `blueprint` or `polymath`).
  - If you clone `git clone https://github.com/lemomo-ai/lemo-opuscar.git ~/lemo-opuscar` on your Linux machine, `@motion-designer` can also read any of the 66 `~/lemo-opuscar/styles/<slug>/STYLE.md` recipes directly while enforcing **Survey of India map boundaries** (overriding `lemo-opuscar/DIRECTOR.md §13`).

## Step-by-Step Production Workflow

### Step 1: Initialize Project (From Prompt or `@content-director` `script.json`)

```bash
node <SKILL_DIR>/scripts/motion.js new "$WORK" --style journalism --format 16:9 --wpm 150
```

- For `9:16` Retention Reels (`my-style`), use `--style pulse --format 9:16 --wpm 185`.
- For `@justdodani` 7-Layer Magazine Cut-Out Dioramas, use `--style vox --format 16:9` with `"kind": "diorama"`.
- For Physics / Lens schematics, use `--style blueprint --format 16:9`.

### Step 2: Sync Single Continuous Voiceover Recording (`voiceover_sync.py`)

When the creator provides their single continuous voiceover recording (`voiceover.wav` or `voiceover.mp3`):

```bash
python3 <SKILL_DIR>/scripts/voiceover_sync.py "$WORK" --audio /path/to/voiceover.wav [--bgm /path/to/bgm.mp3]
```

- Automatically detects spoken beats (via `faster-whisper` in local CLI or `ffmpeg silencedetect` in Cloud VM), removes stumbled retakes after pauses, updates every scene's exact `duration` in `$WORK/video.json`, writes per-beat slices to `$WORK/assets/vo/beat-XX.wav`, and mixes `$WORK/renders/master_vo_mix.wav` with `-14 dB` sidechain BGM ducking.

### Step 3: Generate & Process Style-Anchored Nano Banana Paper Cutouts (`nano_banana_cutouts.py`)

1. Generate the Style Anchor + per-beat Nano Banana prompt manifest:
   ```bash
   python3 <SKILL_DIR>/scripts/nano_banana_cutouts.py prompts "$WORK" --style voxstage
   ```
2. Generate the Style Anchor image first (using `image_gen:generate_image` in Gemini Web or Nano Banana in CLI), then generate each isolated scene cutout referencing the Style Anchor.
3. Convert raw generated/uploaded images into transparent die-cut paper stickers (with white scissor border + optional `MG-VOXSTAGE` `#D62E1F` hot-red offset outline):
   ```bash
   python3 <SKILL_DIR>/scripts/nano_banana_cutouts.py process "$WORK/assets/raw-01.png" "$WORK/pieces/cutout-01.png" --bw --voxstage
   ```

### Step 4: Compose & Audit Keyframes (`frames` + `motionmaxxing` G0–G5 Quality Gates)

```bash
node <SKILL_DIR>/scripts/motion.js frames "$WORK"
```

Inspect `$WORK/frames/sheet.jpg` via `view_file` and verify:
- **G1 (Typography Floor)**: Every label is readable (`>= 4%` of frame height) with zero text collision.
- **G2 (Zero Dead Frames)**: Continuous motion (`dioramaRun`, `drift`, `float`, `wavePulse`, `mathOsc`) keeps every frame alive.
- **G3 (Continuity Carry)**: Scene cuts use `"carryMorph"`, `"matchCut"`, or `"cornerDock"` so visual momentum carries across every cut.

### Step 5: Render MP4, Interactive Canvas Storyboard & EffectCraft (`.ecproj`) Bundle

```bash
# 1. Interactive Single-File HTML Storyboard for Gemini Canvas
python3 <SKILL_DIR>/scripts/build_canvas.py "$WORK" <output-dir>/<slug>-storyboard.html

# 2. Render 1080p/4K MP4 (Auto-uses NVIDIA RTX NVENC in local CLI)
node <SKILL_DIR>/scripts/motion.js render "$WORK" --res 1080p --fps 30 --skip-review

# 3. Export Editable EffectCraft (.ecproj) Multi-Track Project Bundle
python3 <SKILL_DIR>/scripts/ae_export.py "$WORK"
```

## Continuous Evolution & Hardware Calibration (NVIDIA RTX 3050 Ready)

- **NVIDIA RTX 3050 Acceleration (Linux CLI)**:
  - **Chromium GPU Rasterization**: `scripts/local_renderer.py` automatically detects your RTX 3050 via `nvidia-smi` and enables `--enable-gpu-rasterization`, `--enable-zero-copy`, and `--enable-accelerated-2d-canvas` so 7-layer 2.5D dioramas, SVG turbulence filters, and 180° shutter motion blur render on the GPU.
  - **NVENC Hardware Video Encoding**: Uses your RTX 3050's dedicated 7th-Gen NVENC chip (`h264_nvenc`) to encode `1080p` and `4K` MP4s 5–8x faster without taxing your CPU.
  - **Tensor Core Voiceover Slicing**: `scripts/voiceover_sync.py` uses `device="cuda", compute_type="int8_float16"` in `faster-whisper` on your RTX 3050, using `< 1.2 GB` VRAM (safe for 4GB, 6GB, or 8GB RTX 3050 cards) to timestamp a 60-second voiceover in ~1.5 seconds.
- **Room for Continuous Improvement**:
  - New styles (`styles/<name>.js` + `.css`), new scene kinds (`MD.kinds.<name>`), or new telemetry rules extracted via `@learn-style` can be dropped in at any time without breaking existing projects, and saved back via `skills:update_skill`.


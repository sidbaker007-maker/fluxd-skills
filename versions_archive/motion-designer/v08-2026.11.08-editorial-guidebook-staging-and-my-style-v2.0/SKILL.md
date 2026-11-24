---
name: motion-designer
description: Generates open-stage FLUXD Kinetic Editorial motion graphics videos, native HeyGen HyperFrames HTML/GSAP compositions (with .clip timing, data-motion-blur, and .motion.json assertions), 3-5 word active-word karaoke subtitles, single-recording voiceover auto-slicing (<= 179s pitch-preserved Reel cap + faster-whisper word alignment + -14dB sidechain ducking), self-indexing local SFX sync (peakOffsetSec alignment), Style-Anchored Nano Banana cutouts, and 1080p/4K 60fps MP4 + interactive Canvas Storyboard exports.
---
# Motion Designer (Phase 2 of the FLUXD Production Relay — Native HyperFrames Engine)

Turn a `@content-director` `script.json` handoff + your **single continuous voiceover recording (`voiceover.wav` / `.mp3`)**, raw `.jpg`/`.png` assets, and your local `assets/sfx/` folder into a deterministic **HyperFrames** composition (`build/index.html` + `build/main.motion.json`), an interactive Storyboard (`HTML` in Gemini Canvas or `localhost` in CLI), and a locked `60 fps` H.264 `.mp4`.

```
[@content-director: Phase 1] -> script.json + Asset & SFX Manifest + Single Continuous voiceover.wav
        |
        v
[@motion-designer: Phase 2 — FLUXD Kinetic Editorial + HyperFrames]
  1. voiceover_sync.py  -> Trims dead air, enforces <= 179s (2m59s) cap via atempo, aligns word timestamps
  2. index_sfx.py       -> Indexes assets/sfx/ across 6 folders & computes peakOffsetSec for frame-exact sync
  3. motion.js frames   -> Compiles `editorial` HyperFrames HTML + active-word karaoke captions + contact sheet
  4. motion.js render   -> Deterministic 1080p/4K MP4 (RTX NVENC / CPU libx264) + Canvas Storyboard HTML
```

## 1. Unified Visual System: FLUXD Kinetic Editorial (`--style editorial`)

Always read `references/editorial-motion-guidebook.md` first. To prevent style collisions and boxy slide clutter, **`editorial` (FLUXD Open Stage)** is the default flagship style across all discussions, book/film recommendations, cultural explainers, and data stories:

- **Open-Stage Swiss Grid (Zero Box Clutter)**: Built on Josef Müller-Brockmann's 12-column mathematical grid with `>= 40%` open background space (`#0E0E10` Anamorphic Carbon Dark or `#F4EFE6` Silver-Halide Paper Light).
- **Hard Cap of 2 Text Levels on Stage**: Every shot displays at most **(1) One Hero Claim, Number, or Floating Visual** + **(2) One Micro Context Line** (the top chapter hairline `01 · CHAPTER` and bottom source line `SOURCE · ...` live cleanly in the peripheral margin).
- **Non-Boxy Emphasis**: `*word*` renders in `#FACC15` Italic Editorial Serif (`Instrument Serif Italic`); `[phrase]` renders with a continuous `#E04826` vermilion brush underline (never separate per-word sticker boxes).
- **Sequential Multi-Card Showcase (`collage`)**: When a scene has 2-3 media items (e.g., English Audible cover, Hindi Audible cover, and print book edition in Beat 14), `editorial` arranges them in a clean gallery grid (`.ed-multi-grid`) and pops each card + its label in sequentially at `mediaTimes`.
- **Clean Editorial Index (`unlock`) & Sign-Off (`cta`)**: Renders numbered perspective tables (`01`..`04`) and closing recommendation cards with zero growth-hacker padlocks, zero `2s FUSE` bars, and zero fake comment widgets.

## 2. Word-Tokenized Active Karaoke Subtitles (`MD.karaokeSub`)

Whenever `"subtitles": true` (default) and a scene has `vo` text:
- `kit.js` groups spoken words into **3 to 5 word phrase chunks** in the lower-third safe zone (`bottom: 11%` on `9:16`).
- As the playhead $t$ passes through each word (`word.start <= t < word.end`), the **currently spoken word** lights up in `#FACC15` (Editorial Gold) at `scale(1.08)` and `opacity: 1.0`, while sibling words in the 4-word phrase sit at dimmed white (`opacity: 0.42`).

## 3. Local SFX Library & Peak-Aligned Sync (`scripts/index_sfx.py`)

Your curated sound effects live in `assets/sfx/` across 6 functional categories (`01_whooshes/`, `02_impacts/`, `03_risers/`, `04_tactile/`, `05_data_ui/`, `06_ambience/`):
- Run `python3 <SKILL_DIR>/scripts/index_sfx.py` whenever you drop new `.wav` files into `assets/sfx/`.
- It measures each file's exact `durationSec` and `peakOffsetSec` into `assets/sfx/sfx-catalog.json` so risers and whooshes start at `max(0, t_event - peakOffsetSec)` and peak on the exact millisecond of the visual cut.

## 4. Step-by-Step Production Workflow

### Step 1: Initialize or Import Project (`--style editorial`)
```bash
node <SKILL_DIR>/scripts/motion.js new "$WORK" --style editorial --format 9:16 --wpm 145
```

### Step 2: Sync Continuous Voiceover & Enforce `<= 179s` Cap
```bash
python3 <SKILL_DIR>/scripts/voiceover_sync.py "$WORK" --audio /path/to/voiceover.mp3
```

### Step 3: Render Contact Sheet & Visually Audit Frames
```bash
node <SKILL_DIR>/scripts/motion.js frames "$WORK"
```
Inspect `$WORK/frames/sheet.jpg` via `view_file` to verify open-stage spacing, active-word karaoke captions, and sequential card reveals.

### Step 4: Build Interactive Canvas Storyboard & Render Deterministic MP4
```bash
python3 <SKILL_DIR>/scripts/build_canvas.py "$WORK" <output-dir>/<slug>_storyboard.html
node <SKILL_DIR>/scripts/motion.js render "$WORK" --res 1080p --fps 60 --skip-review
```

## 5. Public-Domain Footage Fetcher (`scripts/fetch_archive_footage.py`) & Official FLUXD Brand Kit (`assets/brand/`)

- **Auto-Fetch Free Archival Footage from [Moving Image Archive](https://www.movingimagearchive.com/)**:
  ```bash
  # Auto-download MP4 clips for all scenes with `archiveQuery` in video.json / script.json
  python3 <SKILL_DIR>/scripts/fetch_archive_footage.py "$WORK" --auto

  # Search & download a specific shot by description
  python3 <SKILL_DIR>/scripts/fetch_archive_footage.py --query "cinema projector lens" --out "$WORK/assets/broll-01.mp4"
  ```
- **Official FLUXD Brand Kit (`assets/brand/`)**: Bundles all official SVG logos (`logo-primary-lockup-dark-bg.svg`, `logo-mark-phi2-dark-bg.svg`, `logo-wordmark-framed-dark-bg.svg`, `logo-seal-badge.svg`) and the 4 Binary Shutter Blink stingers (`blink-01a` .. `blink-04`). Every `editorial` scene automatically renders the `Φ-2 + [ FLUXD ]` lockup in the top header, the `Φ-2` seal watermark in the bottom-right corner, and the animated `fluxdBlink` lockup on the closing card.

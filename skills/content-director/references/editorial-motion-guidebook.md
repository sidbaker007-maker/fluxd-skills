# FLUXD Editorial & HyperFrames Motion Guidebook

This unified manual is the single source of truth for **FLUXD** video production across **`@content-director`** (research, scripting, and beat architecture) and **`@motion-designer`** (native [HeyGen HyperFrames](https://github.com/heygen-com/hyperframes) HTML/GSAP composition, active-word karaoke subtitles, local SFX sync, movie & archival footage grabbing, and deterministic MP4 rendering). It replaces all previous fragmented style guides (`pulse`, `vox`, `journalism`, `opuscar`, and `my-style` growth-hacker widgets) with **one cohesive, non-boxy visual system: FLUXD Kinetic Editorial (`editorial`)**.

## 1. Core Philosophy: Open-Stage Swiss Editorial (Zero Box Clutter)

Most AI-generated motion graphics fail for two reasons: they either look like **PowerPoint slides** (stacked rectangular text boxes, bullet lists, and crossfades) or they drown the screen in **growth-hacker UI clutter** (padlock checklists, fake comment boxes, countdown bars, and individual red sticker boxes on every second word).

Our unified style synthesizes three foundational systems into one coherent visual language that works equally well for **philosophical/cultural discussions, book & film recommendations, socio-economic analysis, and M.Sc. physics explainers**:

1. [**Josef Müller-Brockmann's *Grid Systems in Graphic Design***](https://www.thegraphicdesignschool.com/design-history/joseph-mueller-brockmann/) **& [SDMK's *Space Is a Material*](https://sdmk.design/blog/space-is-a-material)**:
   * **Open space is the primary luxury asset**: At least **40% of the canvas** must remain open background space in every frame.
   * **12-Column Invisible Architecture**: Every headline, floating media card, comparison split, and source citation snaps to a 12-column mathematical grid with `6.5%` outer margins (`70px` on `1080p`).
   * **Hierarchy by Scale, Weight & Tone—Never Boxes**: Use two type sizes and one italic/color shift before reaching for a container box. Never wrap multi-word phrases in separate per-word sticker boxes.

2. [**`bangtutorial/bang-motion` Anti-PPT & Living Typography Laws**](https://github.com/bangtutorial/bang-motion/blob/main/SKILL.md):
   * **Hard Cap of 2 Text Levels on Stage**: Any frame with `kicker + headline + subhead + callout bars` (4+ levels) reads as a PowerPoint slide. Every shot is strictly capped at **at most 2 text levels on the main stage**: **(1) One Hero Claim, Number, or Visual Artifact** + **(2) One Micro Context Tag or Source Line** (plus the dedicated lower-third karaoke subtitle track).
   * **No Consecutive Layout Repetition**: Two consecutive beats (`Beat N` and `Beat N+1`) must never share the same layout archetype (`kind`) unless a multi-card `collage` beat uses `subBeatPopups` / `mediaTimes` to fan out sequential items.

3. [**HeyGen HyperFrames Deterministic Motion Contract (`motion.md`)**](https://github.com/heygen-com/hyperframes/blob/main/skills/hyperframes/references/motion.md) **& [Awesome Claude's "Everything Is a Number" Rule](https://awesomeclaude.ai/claude-motion-graphics)**:
   * **Why HyperFrames Solves Laggy MP4s**: Instead of recording a live browser in real time (which drops frames), HyperFrames steps your GSAP timeline forward mathematically ($t = 0.000\text{s}, 0.0166\text{s}, 0.0333\text{s}$ at `60fps`), waits for every font and image to decode, captures a lossless frame, and pipes it to FFmpeg.
   * **Mechanical Validation**: Every visual rule is expressed as a verifiable number so `npx hyperframes check --json` can validate compositions automatically.

## 2. Locked Design Tokens: Palette, Typography & 9:16 Safe Zones

### 2.1 Dual-Surface Palette (Mood & Section Alternation)

Instead of switching between incompatible styles, use **one palette system** with two complementary surfaces that alternate only at major structural turns:

| Token Role | CSS Custom Property | Hex / Value | Usage Rule |
| :--- | :--- | :--- | :--- |
| **Primary Dark Stage (75% Default)** | `--bg` | `#0E0E10` | Deep Anamorphic Carbon stage with subtle radial luminance and `1px` `rgba(246,243,236,0.06)` architectural grid. |
| **Dark Elevated Surface** | `--surface` | `#16181D` | Floating card surface when a backing plane is required (`1px solid rgba(246,243,236,0.14)`). |
| **Contrast Paper Stage (25% Turns)** | `--bg-paper` | `#F4EFE6` | Warm Silver-Halide Paper used via `0.4s power2.inOut` colour flood on major narrative turns or archival reveals. |
| **Primary Ink (on Dark)** | `--ink` | `#F6F3EC` | Halide Ivory primary typography (`16.8:1` WCAG AAA contrast on `#0E0E10`). |
| **Muted Neutral Ink** | `--muted` | `#8E9299` | Chapter index, axis labels, and inactive context lines (`6.5:1` contrast). |
| **Signal Accent 1 (Editorial Gold)** | `--accent` | `#FACC15` | Active karaoke spoken word highlight, italic serif emphasis (`*word*`), and primary focal line. |
| **Signal Accent 2 (Halation Vermilion)** | `--accent2` | `#E04826` | Premise-inversion strike line, single key phrase underline (`[phrase]`), and dossier dot. |
| **Structural Slate** | `--accent3` | `#38BDF8` | Secondary trajectory or comparative thread indicator. |

> **The One-Signal Rule ([Awesome Claude `Swiss grid`](https://awesomeclaude.ai/claude-motion-graphics)):** On the main stage, **at most one phrase or visual element per shot** carries the high-saturation signal accent (`#E04826` or `#FACC15`). When everything is highlighted, nothing is highlighted.

### 2.2 Locked Typography & Minimum Size Floors

All fonts are bundled locally in `assets/fonts/` as SIL OFL `.woff2` binaries so headless Chromium and HyperFrames render with zero network dependency:

| Role | Font Family | Weights & Style | Size on `1080×1920` (`9:16`) | Tracking & Line Height |
| :--- | :--- | :--- | :--- | :--- |
| **Hero Display / Thesis** | `Instrument Serif` | `400 Regular` & `400 Italic` | `68px – 96px` (`--ts: 8.5 – 11`) | `-0.025em`, line-height `1.02` |
| **Editorial Sans / UI / Subhead** | `Plus Jakarta Sans` / `Inter` | `500`, `600`, `700` | `34px – 44px` (`--ts: 3.4 – 4.2`) | `-0.015em`, line-height `1.32` |
| **Active-Word Karaoke Subtitles** | `Plus Jakarta Sans` / `Inter` | `800 ExtraBold` | `44px – 48px` (`calc(var(--u) * 3.85)`) | `-0.015em`, line-height `1.18` |
| **Tabular Numbers & Counters** | `Space Grotesk` | `700 Bold` (`tabular-nums`) | `140px – 260px` (`25–30%` frame height) | `-0.04em`, line-height `0.92` |
| **Chapter Index & Source Citation** | `JetBrains Mono` | `500`, `600` | `22px – 26px` (Upper-case metadata only) | `+0.10em`, line-height `1.20` |

### 2.3 Vertical `9:16` (`1080×1920`) Spatial Architecture

To prevent text collisions and keep clear of Instagram/Shorts native UI buttons (Right-side Like/Comment/Share icons at `x > 920px, y > 1100px`, and bottom username/caption bar at `y > 1720px`):

* **Zone 1 — Minimal Top Index (`y: 68px – 130px`, `3.5% – 6.8%`)**: Single hairline rule with left chapter label (`01 · DIWALI RELEASE`) and right official FLUXD Master Lockup (`Φ-2 + [ FLUXD ] // 01`).
* **Zone 2 — Open Editorial Stage (`y: 160px – 1440px`, `8.3% – 75.0%`)**:
  * Upper Focal Band (`y: 180px – 520px`): Hero typographic statement (max 8–10 words).
  * Center Visual Stage (`y: 520px – 1420px`): Floating frameless cutout, movie/archival video clip, sequential multi-card fan, asymmetric comparison split, or large animated FLUXD end-card lockup. **Never place `sub` paragraphs or `#01 / #02 / #03` rectangular bullet bars on single-showcase scenes.**
* **Zone 3 — Active-Word Karaoke Subtitle Band (`y: 1480px – 1670px`, `77.0% – 87.0%`)**: Dedicated `data-track-kind="captions"` zone displaying **3 to 5 spoken words at a time** (1–2 short centered lines), with the currently spoken word lit in `#FACC15` + `scale(1.08)` and sibling words in dimmed white (`rgba(246, 243, 236, 0.42)`).
* **Zone 4 — Bottom UI Clearance (`y: 1680px – 1920px`, `87.5% – 100%`)**: Left-aligned primary source citation (`y: 1810px`) and right-aligned official `Φ-2` Seal Badge (`logo-seal-badge.svg`).

## 3. The 6 Non-Boxy Scene Archetypes (`editorial` Style)

Every video is built by rotating through these **6 clean scene archetypes** so consecutive beats never repeat the same visual structure:

| Archetype (`kind`) | Visual Structure (Zero Clunky Boxes) | When to Use |
| :--- | :--- | :--- |
| **`statement` / `hook`** | Large `Instrument Serif` + `Plus Jakarta Sans` kinetic typography on the 12-column grid. `*italic*` words render in `#FACC15` italic serif; `[bracketed phrases]` get a continuous animated `#E04826` bottom brush/underline sweep (never separate red boxes per word). | Philosophical turns, discussion points, rhetorical pivots, or cold-open hooks where the words carry the scene. |
| **`collage` / `showcase`** | **Open-Stage Floating Artifact(s)**: Displays 1 hero cutout/movie clip/poster (or fans out 2–3 cards sequentially at exact `mediaTimes` / `subBeatPopups` timestamps) with a soft drop shadow—**zero `sub` paragraphs and zero `#01 / #02 / #03` stacked callout bars**. | Showing film frames, movie clips, historical manuscripts, maps, cultural artifacts, or sequentially revealing audiobook/book editions (e.g., Beat 14). |
| **`anomaly`** | **Premise Inversion**: Top muted assumption line is crossed out by a smooth `#E04826` vermilion strike line at `t = 0.85s`, followed by the large `Instrument Serif` empirical truth and an optional oversized `Space Grotesk` counter (`0`, `1`, `300+`). | Falsifying a popular myth (*"Featured in every TV serial -> 0 lines in Valmiki's Sanskrit text"*). |
| **`pivot` / `compare`** | **Asymmetric Hairline Split**: A crisp `1px` architectural divider separates Thread A (top/left) from Thread B (bottom/right) with staggered entry (`0.18s` offset) and zero heavy card outlines. | Comparing two traditions, timelines, or formats (*1 Cinema Screen* vs. *1,000 Oral & Literary Perspectives*). |
| **`unlock` / `steps` (Editorial Index)** | **Clean Numbered Typographic Index**: Replaces the blurred growth-hacker padlock widget (`0/4 UNLOCKED 🔒`) with a crisp, fully legible 4-row Swiss index table (`01`–`04`) where each row illuminates sequentially with a left `#FACC15` accent bar. | Previewing a 3–4 part case-study structure or summarizing key takeaways. |
| **`cta` / `outro` (Editorial Sign-Off & Hero Logo Finale)** | **Refined Recommendation + Big Animated FLUXD End-Card (`MD.fluxdEndCardHero`)**: Displays the closing recommendation card above a **large, center-stage animated FLUXD Brand Stage (`734px` wide)** running the official **Shutter Blink (`Blink 01A / 04`)** $\rightarrow$ **Binary Phase Strobe (`Blink 03`: `[ F_U_D ] ⇄ [ _L_X_ ]`)** $\rightarrow$ **Full `[ FLUXD ]` Lockup** in the final seconds. | Closing every Reel or video essay with a noticeable, unmistakable animated brand signature and loop transition. |

## 4. Pacing, Voiceover Sync & Active-Word Karaoke Subtitles (Zero `.srt` Files)

### 4.1 Two-Stage $\le 179\text{s}$ (`2m 59s`) Reel Cap: Silence Trim First, Gentle `atempo` Second

1. **Why Flat Speed-Ups Sound Rushed**: Applying a flat `1.18x` speed multiplier across a `205s` recording makes thoughtful cultural or scientific narration sound artificially rushed.
2. **Two-Stage Pre-Pass in `scripts/voiceover_sync.py`**:
   * **Stage A — Trim Breath Pauses First (`silenceremove`)**: `voiceover_sync.py` first trims inter-sentence breath pauses (`> 0.32s`) down to a natural `0.15s` hold (`silenceremove=stop_periods=-1:stop_duration=0.32:stop_threshold=-38dB:leave_silence=0.15`). Across 45–50 breath pauses, this automatically shaves **15 to 18 seconds** off the recording with **zero speech speed-up**.
   * **Stage B — Gentle Pitch-Preserved `atempo` Only If Needed**: Only if the silence-trimmed recording still exceeds the target (`174.0s` / hard ceiling `179.0s`), `voiceover_sync.py` applies the minimum necessary `atempo` (`1.04x – 1.08x`) before computing word and scene timestamps ([HyperFrames *"Cut first, then caption"* rule](https://hyperframes.heygen.com/guides/captions-and-recuts)).

### 4.2 In-Canvas Active-Word Karaoke Subtitles Only (`MD.karaokeSub` — No `.srt` Files)

External `.srt` (`subtitle.srt` / `captions.srt`) files are **completely removed** from the workflow. All subtitles are rendered natively inside the composition via the **Word-Tokenized Karaoke Engine (`MD.karaokeSub` / `"subtitles": "karaoke-active-word"`)**:

* **Automatic `words: [...]` Persistence**:
  Every scene in `video.json` stores `words: [{ "text": "Right", "start": 0.0, "end": 0.28 }, ...]` (relative to scene start `0.0s`), populated either from `faster-whisper` word timestamps in `voiceover_sync.py` or automatically tokenized by `MD.karaokeWords` inside `compose.js` and `build_canvas.py` so no scene ever falls back to a static paragraph caption.
* **Phrase Chunking (3–5 Words per Group)**:
  Words are grouped into natural **3 to 5 word phrases** (breaking cleanly on punctuation `,` `;` `—` `.` or after 4–5 words). Only the active phrase chunk is visible at time $t$.
* **Active Word Visual State**:
  As the GSAP timeline playhead $t$ passes through each word (`word.start <= t < word.end`):
  * **Current Spoken Word (`.kw`)**: Colored `#FACC15` (Editorial Gold), scaled to `scale(1.08)`, `opacity: 1.0`.
  * **Sibling Words in Phrase (`.kw`)**: Rendered in `#F6F3EC` at `opacity: 0.42` (`scale(1.0)`).

## 5. Native HyperFrames Contract & Automated Verification

Every project compiled by `scripts/lib/compose.js` adheres to the [HeyGen HyperFrames HTML contract](https://github.com/heygen-com/hyperframes/blob/main/skills/hyperframes/SKILL.md):

1. **Root Composition (`build/index.html`)**:
   ```html
   <div id="root" class="md st-editorial portrait"
        data-composition-id="main" data-start="0"
        data-width="1080" data-height="1920" data-duration="174.0"
        data-motion-blur="on" data-motion-blur-shutter="240">
   ```
2. **Timed `.clip` Elements & Track Kinds**:
   * Every `<section class="scene clip" id="s01" data-start="0" data-duration="9.03" data-track-kind="graphics" data-track-index="1">` declares its exact `[data-start, data-start + data-duration)` window.
   * The karaoke caption layer carries `data-track-kind="captions"`.
3. **Motion Sidecar Assertions (`build/main.motion.json`)**:
   `compose.js` automatically emits `build/main.motion.json` with `keepsMoving` assertions ([HyperFrames `motion.md`](https://github.com/heygen-com/hyperframes/blob/main/skills/hyperframes/references/motion.md)) so `npx hyperframes check --json` can verify layout and motion deterministically.

## 6. Local SFX Library & Peak-Aligned Sync (`assets/sfx/` + `index_sfx.py`)

### 6.1 Standard 6-Folder Taxonomy (`assets/sfx/`)

Place your `.wav` or `.mp3` files into `assets/sfx/` under these 6 functional folders ([Morphic SFX Library Standard](https://morphic.com/resources/how-to/how-to-build-a-sound-effects-library)):

* `01_whooshes/`: `whoosh-soft-air.wav`, `whoosh-fast-whip.wav`, `whoosh-paper-turn.wav`
* `02_impacts/`: `hit-sub-boom.wav`, `hit-cinematic-thud.wav`, `hit-stamp-slam.wav`
* `03_risers/`: `riser-warm-swell.wav`, `riser-tension-suck.wav`
* `04_tactile/`: `foley-pen-highlight.wav`, `foley-chalk-draw.wav`, `foley-card-place.wav`, `foley-camera-shutter.wav`
* `05_data_ui/`: `tick-soft-counter.wav`, `chime-subtle-lock.wav`
* `06_ambience/`: `drone-dark-investigative.wav`, `drone-warm-editorial.wav`

### 6.2 Automatic Peak Indexing (`scripts/index_sfx.py`) & Sync Formula

Run `python3 scripts/index_sfx.py <work_dir_or_sfx_dir>` whenever you add new sound files. The script decodes each audio file at `48 kHz`, locates the exact timestamp of peak RMS/sample amplitude (`peakOffsetSec`), and writes `assets/sfx/sfx-catalog.json`:

$$
\text{startSec} = \max\left(0,\; t_{\text{event}} - \text{peakOffsetSec}\right)
$$

## 7. Official FLUXD Brand Identity & Prominent End-Card Logo Animation (`assets/brand/`)

All official **FLUXD** vector assets (`logos-svg/`, `animations/`, and `tokens/`) are bundled inside `motion-designer/assets/brand/` and rendered across every Reel:

1. **Top-Right Master Lockup (`MD.fluxdLockup`)**: Every scene's top editorial index bar renders the official SVG **Combined Master Lockup** (`Chamfered-Bracket Optical Φ-2` + `Framed [ FLUXD ] Wordmark` with `#E04826` Kodak Halation Vermilion accents) at `34px` height alongside the beat counter (`// 01` .. `// 15`).
2. **Bottom-Right Seal Badge (`MD.fluxdSeal`)**: Every scene renders the official `logo-seal-badge.svg` (`Φ-2` inside the chamfered rounded square) at `48px × 48px` (`92%` opacity) in the bottom-right corner (`right: 6.5%`, `bottom: 3.6%`).
3. **Prominent Hero End-Card Logo & Animation at the Very End (`MD.fluxdEndCardHero` & `fluxdBlink`)**:
   * On the closing `cta` / `outro` scene (and standalone `bumper` beats), `.ed-endcard-hero` renders a **large, center-stage animated FLUXD Brand Showcase (`734px` wide on `1080×1920`, `300px+` stage height)**.
   * It executes a **3-phase deterministic GSAP animation (`fluxdBlink`)** that re-triggers in the final `2.1 seconds` of the video so the brand mark is impossible to miss at the end of every Reel:
     1. **Phase 1 (`Blink 01A / 04` Shutter Blink)**: The oversized `162px × 162px` `Φ-2` optical mark blinks on/off with a sharp `#E04826` vermilion flash.
     2. **Phase 2 (`Blink 03` Alternating Binary Strobe)**: Hard-cuts to the giant `734px`-wide framed `[ FLUXD ]` master lockup and strobes between odd and even characters (`[ F_U_D ] ⇄ [ _L_X_ ]`).
     3. **Phase 3 (Hero Lock & Tagline)**: Locks all characters at `100%` opacity with a subtle `1.05x` punch above `@fluxd.tv · WHERE CINEMA OPTICS, PHYSICAL LAW & GLOBAL SYSTEMS COLLIDE`.

## 8. Unified Movie Footage & Public-Domain Archival Grabber (`scripts/fetch_archive_footage.py`)

`@content-director` and `@motion-designer` bundle a **5-source Movie & Archival Footage Harvester** (`scripts/fetch_archive_footage.py`, also aliased as `scripts/footage_harvester.py`) so your videos can pull both **real movie/cinema clips** and **public-domain archival motion pictures**:

| Source Engine | CLI Flag / Subcommand | `script.json` / `video.json` Field | What It Grabs |
| :--- | :--- | :--- | :--- |
| **1. [Moving Image Archive](https://www.movingimagearchive.com/)** | `--source mia --query "<shot>"` | `"archiveQuery": "cinema projector beam"` | Queries `POST https://www.movingimagearchive.com/api/search` across [24 curated public-domain film collections](https://www.movingimagearchive.com/collections) and downloads `.mp4` shots. |
| **2. Movie & TV Dialogue / Scene Clip Grabber ([GetYarn](https://getyarn.io/), [PlayPhrase](https://www.playphrase.me/), [Clip.Cafe](https://clip.cafe/), [QuoDB](https://www.quodb.com/))** | `--source movie --dialogue "<line>"` (or `dialogue "<line>"`) | `"movieClipQuery": "<movie quote or scene>"` | Searches GetYarn.io (`https://getyarn.io/yarn-find?text=...`), resolves direct `https://y.yarn.co/<uuid>.mp4` movie clips, and outputs PlayPhrase / Clip.Cafe / QuoDB links. |
| **3. [Internet Archive](https://archive.org/details/movies) & [Prelinger Archives](https://archive.org/details/prelinger) Stream-Slicer** | `--source ia --query "<topic>" --collection prelinger --start 00:00:10 --dur 6` | `"iaQuery": "<historical film>"` (also automatic fallback for `archiveQuery`) | Queries `https://archive.org/advancedsearch.php` (`mediatype:movies`) and uses `ffmpeg -ss <start> -i <remote_mp4> -t <dur>` to HTTP stream-slice only the needed 5–8s window. |
| **4. YouTube / Movie Trailer & Scene Slicer (`yt-dlp`)** | `--source ytslice --yt-url "<url>" --section "01:12-01:18"` | `"movieClipUrl": "<url>"`, `"movieClipSection": "01:12-01:18"` | Wraps `yt-dlp --download-sections "*MM:SS-MM:SS" --force-keyframes-at-cuts` to slice exact 1080p movie scenes or trailers. |
| **5. [Wikimedia Commons](https://commons.wikimedia.org/) Video & Official Logos** | `--source wikimedia --query "<topic>"` or `--source logo --query "HarperCollins"` | `"wikimediaQuery": "<topic>"` | Downloads public-domain historical video clips (`.webm`/`.ogv`) or transparent vector/PNG publisher & institution logos. |

### The Primary-Cutout Guardrail (`--auto` Mode)

When running `python3 scripts/fetch_archive_footage.py "$WORK" --auto`:
* **Never Clutter Custom Cutouts**: If a beat already has a primary `media`, `userAsset`, or `cutoutPrompt` (such as a custom movie poster or Indian folklore cutout), `--auto` **skips** auto-binding generic `archiveQuery` background stock footage on that beat unless `"allowBgWithCutout": true` is explicitly set.
* **Explicit Movie Clips Always Bind**: Any beat with `"movieClipQuery"` or `"movieClipUrl"` + `"movieClipSection"` automatically downloads the movie clip into `$WORK/assets/movie-sXX.mp4` and binds it to the scene.

## 9. Complete Step-by-Step Gemini CLI Workflow (Linux + NVIDIA RTX 3050)

Follow this exact 6-step sequence in your local Linux terminal whenever you create a new Reel or YouTube video essay with Gemini CLI:

### Step 0: One-Time Skill Setup & RTX 3050 Hardware Verification

Place both updated skills inside `~/.gemini/skills/` and run `doctor.js` to confirm Node 22+, FFmpeg, and your NVIDIA RTX 3050 (`h264_nvenc` + CUDA):

```bash
mkdir -p ~/.gemini/skills
unzip -o motion-designer-fluxd-v2.zip -d ~/.gemini/skills/motion-designer
unzip -o content-director-fluxd-v2.zip -d ~/.gemini/skills/content-director

# Verify Node, FFmpeg, HyperFrames & RTX 3050 NVENC
node ~/.gemini/skills/motion-designer/scripts/doctor.js --quick
```

### Step 1: Phase 1 (`@content-director`) — Generate Script Blueprint & `script.json`

Create a clean working folder for your video and ask `@content-director` in Gemini CLI to research the topic, write the spoken script, and export `script.json`:

```bash
mkdir -p ~/videos/ramayana-reel && cd ~/videos/ramayana-reel

# Inside Gemini CLI, prompt:
# "Use @content-director to write a 9:16 Reel blueprint on [Topic] in FLUXD editorial style and export script.json"

# Or validate an existing markdown blueprint and export script.json directly:
python3 ~/.gemini/skills/content-director/scripts/content_validator.py blueprint.md --wpm 145 --export-json script.json
```

### Step 2: Initialize the `@motion-designer` Project (`--style editorial`)

Initialize `video.json` and `assets/` in your working folder (defaults to `editorial` style):

```bash
node ~/.gemini/skills/motion-designer/scripts/motion.js new . --style editorial --format 9:16 --wpm 145
```

### Step 3: Record Your Single Continuous Voiceover & Run Two-Stage Auto-Sync (`voiceover_sync.py`)

Record your entire script in **one single continuous take** (`voiceover.mp3` or `voiceover.wav`—if you stumble on a sentence, pause for 1 second and repeat the line). Then run `voiceover_sync.py`:

```bash
python3 ~/.gemini/skills/motion-designer/scripts/voiceover_sync.py . --audio voiceover.mp3 --max-dur 174.0
```
* **What happens automatically**:
  1. Trims breath pauses (`> 0.32s` $\rightarrow$ `0.15s`) *first* so natural speech isn't unnecessarily sped up.
  2. Applies a gentle `1.04x–1.08x` pitch-preserved `atempo` only if the trimmed audio still exceeds `179.0s`.
  3. Runs `faster-whisper` (`int8_float16` on your RTX 3050 Tensor Cores) to align every spoken word and writes `words: [{ "text": ..., "start": ..., "end": ... }]` directly into `video.json` for in-canvas Active-Word Karaoke captions (no `.srt` files generated).

### Step 4: Grab Movie Clips, Archival Footage & Cutouts (`fetch_archive_footage.py`)

Fetch all movie dialogue clips, trailer slices, and public-domain archival shots referenced in `video.json` / `script.json` (or grab specific clips on demand):

```bash
# Auto-fetch all movieClipQuery, movieClipUrl, and archiveQuery beats (respecting the cutout guardrail):
python3 ~/.gemini/skills/motion-designer/scripts/fetch_archive_footage.py . --auto

# Grab a specific spoken movie dialogue clip (GetYarn MP4 + PlayPhrase/Clip.Cafe/QuoDB links):
python3 ~/.gemini/skills/motion-designer/scripts/fetch_archive_footage.py --source movie --dialogue "I am become Death" --out assets/movie-s01.mp4

# Slice an exact movie trailer or scene timestamp window from YouTube in 1080p MP4:
python3 ~/.gemini/skills/motion-designer/scripts/fetch_archive_footage.py --source ytslice --yt-url "https://www.youtube.com/watch?v=VIDEO_ID" --section "01:12-01:18" --out assets/movie-s02.mp4

# Optional: Convert raw images into high-contrast halftone cutouts with white paper borders:
python3 ~/.gemini/skills/motion-designer/scripts/nano_banana_cutouts.py process assets/raw-poster.jpg assets/cutout-poster.png --bw --voxstage
```

### Step 5: Index Local SFX (`index_sfx.py`) & Inspect the Interactive Storyboard

Index your local `.wav` sound effects so every riser and whoosh peaks on the exact frame of the cut, then inspect the contact sheet and live browser storyboard:

```bash
# Index local SFX peak offsets (peakOffsetSec):
python3 ~/.gemini/skills/motion-designer/scripts/index_sfx.py .

# Render 1 hero frame per scene + contact sheet (frames/sheet.jpg) and run HyperFrames layout check:
node ~/.gemini/skills/motion-designer/scripts/motion.js frames .

# Open the interactive Storyboard in your browser (or export a standalone HTML file):
node ~/.gemini/skills/motion-designer/scripts/motion.js board . --open
python3 ~/.gemini/skills/motion-designer/scripts/build_canvas.py . storyboard.html
```

### Step 6: Render Deterministic 60fps 1080p/4K MP4 (`motion.js render`)

Once satisfied with the storyboard, render the final butter-smooth `60fps` MP4 (with the 3-5 word Active-Word Karaoke captions and the large animated `734px` FLUXD End-Card Showcase at the very end):

```bash
# Render final 1080x1920 60fps MP4 via HyperFrames + FFmpeg (uses RTX 3050 NVENC automatically when available):
node ~/.gemini/skills/motion-designer/scripts/motion.js render . --res 1080p --fps 60 --skip-review

# Optional: Export native After Effects (.jsx) bundle with editable FLUXD vector shape layers:
python3 ~/.gemini/skills/motion-designer/scripts/ae_export.py .
```
# FLUXD Editorial & HyperFrames Motion Guidebook

This unified manual is the single source of truth for **FLUXD** video production across **`@content-director`** (research, scripting, and beat architecture) and **`@motion-designer`** (native [HyperFrames](https://github.com/heygen-com/hyperframes) HTML/GSAP composition, word-level karaoke captions, SFX sync, and deterministic MP4 rendering). It replaces all previous fragmented style guides (`pulse`, `vox`, `journalism`, `opuscar`, and `my-style` growth-hacker widgets) with **one cohesive, non-boxy visual system: FLUXD Kinetic Editorial (`editorial`)**.

## 1. Core Philosophy: Open-Stage Swiss Editorial (Zero Box Clutter)

Most AI-generated motion graphics fail for two reasons: they either look like **PowerPoint slides** (stacked rectangular text boxes, bullet lists, and crossfades) or they drown the screen in **growth-hacker UI clutter** (padlock checklists, fake comment boxes, countdown bars, and individual red sticker boxes on every second word).

Our unified style synthesizes three foundational systems into one coherent visual language that works equally well for **philosophical/cultural discussions, book & film recommendations, socio-economic analysis, and M.Sc. physics explainers**:

1. [**Josef Müller-Brockmann's *Grid Systems in Graphic Design***](https://www.thegraphicdesignschool.com/design-history/joseph-mueller-brockmann/) **& [SDMK's *Space Is a Material*](https://sdmk.design/blog/space-is-a-material)**:

   * **Open space is the primary luxury asset**: At least **40% of the canvas** must remain open background space in every frame.

   * **12-Column Invisible Architecture**: Every headline, floating media card, comparison split, and source citation snaps to a 12-column mathematical grid with `6.5%` outer margins (`70px` on `1080p`).

   * **Hierarchy by Scale, Weight & Tone—Never Boxes**: Use two type sizes and one italic/color shift before reaching for a container box. Never wrap multi-word phrases in separate per-word sticker boxes.

2. [**`bangtutorial/bang-motion` Anti-PPT & Living Typography Laws**](https://github.com/bangtutorial/bang-motion/blob/main/SKILL.md):

   * **Hard Cap of 2 Text Levels on Stage**: Any frame with `kicker + headline + subhead + callout bars` (4+ levels) reads as a PowerPoint slide. Every shot is strictly capped at **at most 2 text levels on the main stage**: **(1) One Hero Claim, Number, or Visual Artifact** + **(2) One Micro Context Tag or Source Line** (plus the dedicated lower-third karaoke subtitle track).

   * **No Consecutive Layout Repetition**: Two consecutive beats (`Beat N` and `Beat N+1`) must never share the same layout archetype or entrance direction.

3. [**HeyGen HyperFrames Deterministic Motion Contract (`motion.md`)**](https://github.com/heygen-com/hyperframes/blob/main/skills/hyperframes/references/motion.md) **& [Awesome Claude's "Everything Is a Number" Rule](https://awesomeclaude.ai/claude-motion-graphics)**:

   * Every visual rule is expressed as a **verifiable number** (hex code, pixel floor, `cubic-bezier` curve, millisecond stagger, and frame hold) so AI agents and `npx hyperframes check --json` can validate compositions mechanically.

## 2. Locked Design Tokens: Palette, Typography & 9:16 Safe Zones

### 2.1 Dual-Surface Palette (Mood & Section Alternation)

Instead of switching between incompatible styles, use **one palette system** with two complementary surfaces that alternate only at major structural turns:

| Token Role | CSS Custom Property | Hex / Value | Usage Rule | 
| ----- | ----- | ----- | ----- | 
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
| ----- | ----- | ----- | ----- | ----- | 
| **Hero Display / Thesis** | `Instrument Serif` | `400 Regular` & `400 Italic` | `68px – 96px` (`--ts: 8.5 – 11`) | `-0.025em`, line-height `1.02` | 
| **Editorial Sans / UI / Subhead** | `Plus Jakarta Sans` / `Inter` | `500`, `600`, `700` | `34px – 44px` (`--ts: 3.4 – 4.2`) | `-0.015em`, line-height `1.32` | 
| **Active-Word Karaoke Subtitles** | `Plus Jakarta Sans` / `Inter` | `800 ExtraBold` | `44px – 48px` (`calc(var(--u) * 4.2)`) | `-0.01em`, line-height `1.22` | 
| **Tabular Numbers & Counters** | `Space Grotesk` | `700 Bold` (`tabular-nums`) | `140px – 260px` (`25–30%` frame height) | `-0.04em`, line-height `0.92` | 
| **Chapter Index & Source Citation** | `JetBrains Mono` | `500`, `600` | `22px – 26px` (Upper-case metadata only) | `+0.10em`, line-height `1.20` | 

### 2.3 Vertical `9:16` (`1080×1920`) Spatial Architecture

To prevent text collisions and keep clear of Instagram/Shorts native UI buttons (Right-side Like/Comment/Share icons at `x > 920px, y > 1100px`, and bottom username/caption bar at `y > 1720px`):

* **Zone 1 — Minimal Top Index (`y: 68px – 130px`, `3.5% – 6.8%`)**: Single hairline rule with left chapter label (`01 · DIWALI RELEASE`) and right source/timecode (`FLUXD // 01`).

* **Zone 2 — Open Editorial Stage (`y: 160px – 1440px`, `8.3% – 75.0%`)**:

  * Upper Focal Band (`y: 180px – 560px`): Hero typographic statement (max 8–10 words) + optional single-line context subhead.

  * Center Visual Stage (`y: 560px – 1420px`): Floating frameless cutout, sequential multi-card fan, asymmetric comparison split, or tabular number/chart. **Never place `#01 / #02 / #03` rectangular bullet bars over or above the visual stage.**

* **Zone 3 — Active-Word Karaoke Subtitle Band (`y: 1480px – 1670px`, `77.0% – 87.0%`)**: Dedicated `data-track-kind="captions"` zone displaying **3 to 5 spoken words at a time** (1–2 short centered lines), with the currently spoken word lit in `#FACC15` + `scale(1.08)` and sibling words in dimmed white (`rgba(246, 243, 236, 0.42)`).

* **Zone 4 — Bottom UI Clearance (`y: 1680px – 1920px`, `87.5% – 100%`)**: Kept clean (only a subtle left-aligned source credit at `y: 1810px` when required) so platform controls never obscure content.

## 3. The 6 Non-Boxy Scene Archetypes (`editorial` Style)

Every video is built by rotating through these **6 clean scene archetypes** so consecutive beats never repeat the same visual structure:

| Archetype (`kind`) | Visual Structure (Zero Clunky Boxes) | When to Use | 
| ----- | ----- | ----- | 
| **`statement` / `hook`** | Large `Instrument Serif` + `Plus Jakarta Sans` kinetic typography on the 12-column grid. `*italic*` words render in `#FACC15` italic serif; `[bracketed phrases]` get a continuous animated `#E04826` bottom brush/underline sweep (never separate red boxes per word). | Philosophical turns, discussion points, rhetorical pivots, or cold-open hooks where the words carry the scene. | 
| **`collage` / `showcase`** | **Open-Stage Floating Artifact(s)**: Displays 1 hero cutout/poster (or fans out 2–3 cards sequentially at exact `mediaTimes` / `subBeatPopups` timestamps) with a soft drop shadow, subtle SVG accent arc, and at most 1 floating glass caption chip—**zero `#01 / #02 / #03` stacked callout bars**. | Showing film frames, historical manuscripts, maps, cultural artifacts, or sequentially revealing audiobook/book editions (e.g., Beat 14). | 
| **`anomaly`** | **Premise Inversion**: Top muted assumption line is crossed out by a smooth `#E04826` vermilion strike line at `t = 0.75s`, followed by the large `Instrument Serif` empirical truth and an optional oversized `Space Grotesk` counter (`0`, `1`, `300+`). | Falsifying a popular myth (*"Featured in every TV serial -> 0 lines in Valmiki's Sanskrit text"*). | 
| **`pivot` / `compare`** | **Asymmetric Hairline Split**: A crisp `1px` architectural divider separates Thread A (top/left) from Thread B (bottom/right) with staggered entry (`0.18s` offset) and zero heavy card outlines. | Comparing two traditions, timelines, or formats (*1 Cinema Screen* vs. *1,000 Oral & Literary Perspectives*). | 
| **`unlock` / `steps` (Editorial Index)** | **Clean Numbered Typographic Index**: Replaces the blurred growth-hacker padlock widget (`0/4 UNLOCKED 🔒`) with a crisp, fully legible 4-row Swiss index table (`01`–`04`) where each row illuminates sequentially with a left `#FACC15` accent bar. | Previewing a 3–4 part case-study structure or summarizing key takeaways. | 
| **`cta` / `outro` (Editorial Sign-Off)** | **Refined Recommendation & Loop Card**: Replaces the fake Instagram comment/DM deck widget (`11, 14, 17, 20`) with a clean editorial closing frame: hero question, highlighted recommendation badge, and a visual carry that loops back to Beat 01. | Closing a recommendation or discussion video with a natural comment prompt and loop transition. | 

## 4. Pacing, Voiceover Sync & Active-Word Karaoke Subtitles

### 4.1 Hard Duration Cap ($\le 179\text{s}$ / `2m 59s` for Reels) & Beat Cadence

1. **The** $\le 179.0\text{s}$ **Rule**: Instagram Reels and YouTube Shorts must never cross `180.0s`. When a recorded continuous voiceover exceeds `179.0s` (such as a `205.24s` recording), `scripts/voiceover_sync.py` automatically runs a pitch-preserving `ffmpeg` pre-pass (`silenceremove` to cap inter-sentence gaps at `180ms` + `atempo=1.12..1.18`) to bring the master track to **`~170–176 seconds` (`2m 50s–2m 56s`)** *before* computing scene and word timestamps ([HyperFrames *"Cut first, then caption"* rule](https://hyperframes.heygen.com/guides/captions-and-recuts)).

2. **Sub-Beat Visual Activity Every `2.5s – 4.0s`**:

   * For `4–10 words`, hold `3–4s`; for `11–20 words`, hold `4–6s`; for `21+ words`, either split into multiple scenes or trigger timed `mediaTimes` / `subBeatPopups` and camera reframes (`1.00x -> 1.18x`) every `3.0s–4.0s` ([HyperFrames `claude-design-hyperframes.md`](https://github.com/heygen-com/hyperframes/blob/main/docs/guides/claude-design-hyperframes.md)).

### 4.2 Word-Tokenized Karaoke Subtitle Engine (`MD.karaokeSub`)

Instead of static sentence blocks at the bottom of the screen, `kit.js` and `compose.js` render a dedicated **Word-Tokenized Highlighting Engine** on every scene when `subtitles: true`:

* **Data Structure in `video.json`**:
  Each scene stores `words: [{ "text": "Right", "start": 0.0, "end": 0.28 }, ...]` (relative to scene start `0.0s`), populated either from `faster-whisper` word timestamps in `voiceover_sync.py` or automatically interpolated from word character lengths and `[AUDIO PAUSE: Xs]` markers.

* **Phrase Chunking (3–5 Words per Group)**:
  Words are grouped into natural **3 to 5 word phrases** (breaking cleanly on punctuation `,` `;` `—` `.` or after 4–5 words). Only the active phrase chunk is visible at time $t$.

* **Active Word Visual State**:
  As the GSAP timeline playhead $t$ passes through each word (`word.start <= t < word.end`):

  * **Current Spoken Word (`.kw.is-active`)**: Colored `#FACC15` (Editorial Gold), scaled to `scale(1.08)`, `opacity: 1.0`, with a subtle `0 2px 12px rgba(250, 204, 21, 0.35)` glow.

  * **Spoken / Upcoming Words in Phrase (`.kw`)**: Rendered in `#F6F3EC` at `opacity: 0.45` (`scale(1.0)`) so the viewer's eye locks effortlessly onto the spoken word.

## 5. Native HyperFrames Contract & Automated Verification

Every project compiled by `scripts/lib/compose.js` adheres to the [HeyGen HyperFrames HTML contract](https://github.com/heygen-com/hyperframes/blob/main/skills/hyperframes/SKILL.md):

1. **Root Composition (`build/index.html`)**:

   ```
   <div id="root" class="md st-editorial portrait"
        data-composition-id="main" data-start="0"
        data-width="1080" data-height="1920" data-duration="174.5"
        data-motion-blur="on" data-motion-blur-shutter="240">
   
   ```

2. **Timed `.clip` Elements & Track Kinds**:

   * Every `<section class="scene clip" id="s01" data-start="0" data-duration="9.1" data-track-kind="graphics" data-track-index="1">` declares its exact `[data-start, data-start + data-duration)` window.

   * The karaoke caption layer carries `data-track-kind="captions" data-track-index="2"`.

   * Every audio stem (voiceover master, music bed, and individual SFX cues from `assets/sfx/`) carries `<audio id="sfx-01" class="clip" src="assets/sfx/..." data-start="..." data-duration="..." data-track-index="3">`.

3. **Motion Sidecar Assertions (`build/main.motion.json`)**:
   `compose.js` automatically emits `build/main.motion.json` with `appearsBy`, `staysInFrame`, and `keepsMoving` assertions ([HyperFrames `motion.md`](https://github.com/heygen-com/hyperframes/blob/main/skills/hyperframes/references/motion.md)) so `npx hyperframes check --json` can verify layout and motion deterministically.

## 6. Local SFX Library & Peak-Aligned Sync (`assets/sfx/` + `index_sfx.py`)

To eliminate synthetic JS beeps and ensure every whoosh, riser, and impact lands on the exact frame of a visual cut:

### 6.1 Standard 6-Folder Taxonomy (`assets/sfx/`)

Place your `.wav` or `.mp3` files into `assets/sfx/` under these 6 functional folders ([Morphic SFX Library Standard](https://morphic.com/resources/how-to/how-to-build-a-sound-effects-library)):

* `01_whooshes/`: `whoosh-soft-air.wav`, `whoosh-fast-whip.wav`, `whoosh-paper-turn.wav`

* `02_impacts/`: `hit-sub-boom.wav`, `hit-cinematic-thud.wav`, `hit-stamp-slam.wav`

* `03_risers/`: `riser-warm-swell.wav`, `riser-tension-suck.wav`

* `04_tactile/`: `foley-pen-highlight.wav`, `foley-chalk-draw.wav`, `foley-card-place.wav`, `foley-camera-shutter.wav`

* `05_data_ui/`: `tick-soft-counter.wav`, `chime-subtle-lock.wav`

* `06_ambience/`: `drone-dark-investigative.wav`, `drone-warm-editorial.wav`

### 6.2 Automatic Peak Indexing (`scripts/index_sfx.py`) & Sync Formula

Run `python3 scripts/index_sfx.py <work_dir_or_sfx_dir>` whenever you add new sound files. The script decodes each audio file at `48 kHz`, locates the exact timestamp of peak RMS/sample amplitude (`peakOffsetSec`), and writes `assets/sfx/sfx-catalog.json`.

When `compose.js` places an SFX cue for a visual event occurring at timeline second $t_{\text{event}}$:

$$
\text{startSec} = \max\left(0,\; t_{\text{event}} - \text{peakOffsetSec}\right)
$$


This guarantees that a `1.4s` riser with `peakOffsetSec: 1.25s` starts `1.25s` *before* the transition and climaxes on the exact frame the new scene lands.


## 7. Official FLUXD Brand Identity Integration (`fluxd-brand-kit.zip`)

All official **FLUXD** vector assets (`01-logos-svg/`, `02-animations-html-svg/`, and `03-tokens-and-guidelines/`) are bundled directly inside `motion-designer/assets/brand/` and `content-director/references/brand-kit/` and rendered automatically on every composition:

1. **Top-Right Master Lockup (`MD.fluxdLockup`)**: Every scene's top editorial index bar renders the official SVG **Combined Master Lockup** (`Chamfered-Bracket Optical Φ-2` + `Framed [ FLUXD ] Wordmark` with `#E04826` Kodak Halation Vermilion accents) alongside the beat counter (`// 01` .. `// 15`).
2. **Bottom-Right Seal Watermark (`MD.fluxdSeal`)**: Every scene renders the official `logo-seal-badge.svg` (`Φ-2` inside the chamfered rounded square) at `78%` opacity in the bottom-right corner (`right: 6.5%`, `bottom: 3.8%`), aligned on the same baseline as the bottom-left primary source citation.
3. **Closing Recommendation & Binary Shutter Stinger (`MD.kinds.cta` & `MD.kinds.bumper`)**:
   * The closing `cta` card and standalone `bumper` scene render the large `[ FLUXD ]` lockup animated via the official **Binary Shutter Blink (`fluxdBlink` — `Blink 01A / 01B / 03 / 04`)**, pairing the alternating phase strobe (`[ F_U_D ] ⇄ [ _L_X_ ]`) with the tagline `WHERE CINEMA OPTICS, PHYSICAL LAW & GLOBAL SYSTEMS COLLIDE`.

## 8. Public-Domain Archival Footage Engine ([Moving Image Archive](https://www.movingimagearchive.com/))

Instead of relying solely on static images, `@content-director` and `@motion-designer` integrate directly with **[Moving Image Archive](https://www.movingimagearchive.com/)** (and its open-source API specification in [`JoaquimCassano/mcp-movingimagearchive`](https://github.com/JoaquimCassano/mcp-movingimagearchive)) to pull free, verifiable public-domain film shots across [24 curated collections](https://www.movingimagearchive.com/collections) (`Animated Maps`, `Film Countdowns`, `Film Grain`, `Frames`, `Glowing Lines`, `Objects on Black`, `Technology — Cameras & Photography`, `Science & Instruments`, `Space & Flight`, `Typography Over the Ages`, etc.).

### How It Works in Your Pipeline (`scripts/fetch_archive_footage.py`)
1. **In `@content-director` (`script.json`)**: Any beat that benefits from real archival motion footage includes an `"archiveQuery"` field (e.g., `"archiveQuery": "vintage cinema projector beam"`, `"archiveQuery": "animated map asia"`, or `"archiveQuery": "sound waveform oscilloscope"`).
2. **In `@motion-designer` (`scripts/fetch_archive_footage.py`)**:
   * **Auto-Fetch Mode**: Run `python3 scripts/fetch_archive_footage.py "$WORK" --auto` to query `POST https://www.movingimagearchive.com/api/search`, download the top matching public-domain `.mp4` shot from `https://www.movingimagearchive.com/api/clips/<id>/download` into `$WORK/assets/archive-sXX.mp4`, and bind it to the scene's `bgVideo` or `media` slot.
   * **Single-Shot CLI Mode**: Run `python3 scripts/fetch_archive_footage.py --query "oil derricks" --out assets/broll-01.mp4` (or connect [`JoaquimCassano/mcp-movingimagearchive`](https://github.com/JoaquimCassano/mcp-movingimagearchive) as an MCP server in your local CLI).

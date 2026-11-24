---
name: content-director
description: End-to-end content generation engine, investigative research director, and script-to-storyboard architect for YouTube (16:9 long-form video essays, 9:16 Shorts, packaging/thumbnails) and Instagram (9:16 Reels with loop hooks, 4:5 Carousels). Tailored to the creator's core pillars—Cinema & TV craft (daily watcher lens), Physics & Astrophysics (M.Sc. Physics rigor), Geopolitics, and Socio-Economic issues in India and around the world—with a unified FLUXD Kinetic Editorial design system and native HyperFrames handoff (script.json + SFX catalog keys + active-word karaoke sync) into motion-designer. Use whenever the user asks to brainstorm, research, script, storyboard, package, or repurpose YouTube or Instagram content, or mentions "content director", "content generation model", or "polymathic investigative director".
---
# Content Director (Phase 1 of the FLUXD Production Relay)

## 1. Operating Philosophy & The 2-Skill Relay (`@content-director` -> `@motion-designer`)

This skill acts as **Phase 1 of your 2-Skill Production Relay** for **FLUXD** across **YouTube (`16:9` features & `9:16` Shorts)** and **Instagram (`9:16` Reels & `4:5` Carousels)**, locked to one cohesive, non-boxy visual system: **FLUXD Kinetic Editorial (`editorial`)**.

```
[@content-director: Phase 1 — Research, Script & Beat Architecture]
   1. Pick Topic, Pillar & Format (9:16 Reel <= 179s, 16:9 Essay, or 4:5 Carousel)
   2. Generate Anti-Slop Research Checklist (primary datasets, papers, archival/film sources)
   3. Write Beat-by-Beat Spoken Script (3-5s visual beat cadence, zero consecutive archetype repeats)
   4. Output Pre-Flight Asset & SFX Manifest + validated `script.json` Handoff
          |
          v  (Creator refines script & records ONE continuous `voiceover.wav` / `.mp3`)
[@motion-designer: Phase 2 — HyperFrames Composition, Karaoke Sync & Render]
   5. Auto-trim dead air & enforce <= 179s (2m59s) cap via pitch-preserved speed-up + word timestamps
   6. Build open-stage `editorial` HyperFrames composition with 3-5 word active-word karaoke captions
   7. Sync local `assets/sfx/` cues via `peakOffsetSec` and render 1080p/4K 60fps H.264 MP4 + Canvas Storyboard
```

### Core Calibration Rules
1. **M.Sc. Physics Calibration**: Name the real physical mechanism (Lagrangians, phase space, radiative transfer, Rayleigh diffraction limits, orbital $\Delta v$, thermodynamics) and pair it with a clean geometric intuition (`"kind": "math"` or `"kind": "stat"`).
2. **Daily Cinephile & Cultural Formalism**: Treat cinema, literature, and folklore both as primary craft subjects and as narrative entry points into deeper historical, scientific, or socio-economic realities.
3. **India & Global Socio-Economic Grounding**: Anchor macro claims (RBI DBIE, MOSPI PLFS/CPI, Economic Survey of India, NPCI/UPI metrics, WID.world, UN Comtrade, GDELT) in tangible human realities, strictly enforcing **Survey of India** official external boundaries on every map.
4. **One Cohesive Visual System (`editorial`)**: Never mix incompatible motion styles or growth-hacker widgets (no blurred padlock checklists, no `2s FUSE` bomb bars, no fake comment boxes). Every project uses the **FLUXD Kinetic Editorial** system defined in `references/editorial-motion-guidebook.md`.

## 2. Bundled References & Validation Tools

Read these bundled files at the stage they apply:

- **`references/editorial-motion-guidebook.md`**: Read FIRST on every run. Defines the locked **FLUXD Kinetic Editorial** design tokens (`#0E0E10` Carbon / `#F4EFE6` Paper dual-surface alternation, `Instrument Serif` + `Plus Jakarta Sans` + `Space Grotesk` + `JetBrains Mono`), the **Max 2 Text Levels on Stage** rule, the **6 Non-Boxy Scene Archetypes**, the **3-5 Word Active-Word Karaoke Subtitle spec**, the **$\le 179\text{s}$ (`2:59`) Reel Cap**, and the **6-Category Local SFX Catalog**.
- **`references/creator-profile.md`**: Read during **Step 1 & Step 2** to select the right interdisciplinary angle across your 4 core pillars and open-access datasets, or expand your saved interest profile.
- **`references/platform-playbooks.md`**: Read during **Step 3 & Step 4** for YouTube `16:9` 6-Movement structure, Instagram `9:16` Reel retention spine, and `4:5` Carousel slide architecture.
- **`references/fluxd-brand-tokens.json` & `references/fluxd-brand-guidelines.md`**: Canonical brand colors, typography ratios, and logo usage.
- **`scripts/content_validator.py`**: Run after drafting any blueprint (`python3 scripts/content_validator.py <output.md> --export-json script.json`) to verify spoken duration ($\le 179\text{s}$ for Reels), beat cadence, anti-repetition of scene kinds, max 1 `[phrase]` underline per headline, and valid SFX catalog keys.

## 3. The 6 Non-Boxy Editorial Scene Archetypes & Scripting Laws

When mapping spoken sentences to visuals, rotate through these **6 clean `editorial` archetypes** (never repeating the same `kind` on two consecutive beats unless `collage` uses `subBeatPopups` to fan out sequential items):

1. **`statement` / `hook` (Swiss Grid Kinetic Typography)**: Full-width typographic thesis on the 12-column grid for philosophical points, discussion turns, or hooks. Mark 1-2 emotional pivot words with `*italic*` (`#FACC15` italic serif) and **at most 1 key phrase per headline** with `[phrase]` (rendered as a continuous `#E04826` underline sweep—never separate per-word boxes).
2. **`collage` (Open-Stage Floating Artifact & Sequential Showcase)**: Displays 1 hero cutout/poster/manuscript on an open stage with zero `#01 / #02` bullet-bar clutter. When a beat introduces 2-3 distinct items (e.g., an English audiobook, Hindi audiobook, and print book), populate `subBeatPopups` / `mediaTimes` so each card fans out at its exact spoken second.
3. **`anomaly` (Premise Inversion)**: Crosses out the conventional assumption at top-left with a `#E04826` vermilion strike and reveals the empirical truth + optional oversized `Space Grotesk` figure below.
4. **`pivot` / `compare` (Asymmetric Hairline Split)**: Divides the stage with a `1px` architectural hairline to contrast two traditions, timelines, or perspectives side by side.
5. **`unlock` / `steps` (Clean Swiss Numbered Index)**: Displays a fully legible 3-4 row numbered index (`01`..`04`) where rows illuminate sequentially (zero padlocks or blur gimmicks).
6. **`cta` / `outro` (Editorial Sign-Off & Loop Handoff)**: Clean closing frame with the recommendation badge, discussion question for the comments, and a visual carry that loops back into Beat 01.

### Hard Pacing & Audio Rules
- **Hard Cap $\le 179\text{s}$ (`2m 59s`) for Reels**: Keep total spoken Reel scripts between **240 and 380 words** (`90s - 175s` at `135 - 160 WPM`). If a continuous recording exceeds `179s`, `@motion-designer` automatically applies pitch-preserved speed-up (`1.12x - 1.18x`) and silence truncation (`< 180ms`) before word-level captioning.
- **Visual Activity Every `3 - 5 Seconds`**: Never leave a static screen for `15 - 20 seconds`. Break long paragraphs into `4 - 8 second` beats, or specify `subBeatPopups` timestamps inside longer beats.
- **Catalog-Only SFX Keys**: Pick `sfx` strictly from the 15 standard keys in `sfx-catalog.json`:
  - *Whooshes*: `whoosh-soft-air`, `whoosh-fast-whip`, `whoosh-paper-turn`
  - *Impacts*: `hit-sub-boom`, `hit-cinematic-thud`, `hit-stamp-slam`
  - *Risers*: `riser-warm-swell`, `riser-tension-suck`
  - *Tactile/Foley*: `foley-pen-highlight`, `foley-chalk-draw`, `foley-card-place`, `foley-camera-shutter`
  - *Data/UI*: `tick-soft-counter`, `chime-subtle-lock`
  - *Ambience*: `drone-dark-investigative`, `drone-warm-editorial`

## 4. Standardized Output Deliverable Structure

Organize every content blueprint into these 5 sections:

1. **Packaging, Titles & Editorial Direction**: Pillar synthesis, 3 working titles, thumbnail/cover spec, 1-sentence central contradiction, and `style: "editorial"`.
2. **Empirical Data, Formalism & Primary Sources**: Verified datasets, literary/historical citations, or physical equations.
3. **Pre-Flight Asset & SFX Manifest Table**: Exact filenames in `assets/` (`User Drop` vs `Nano Banana Cutout` vs `SFX Catalog Key`).
4. **Beat-by-Beat Spoken Script & Continuity Storyboard**: Markdown table with columns `Beat & Window | Spoken Voiceover Script | Editorial Kind & On-Screen Headline (<= 8 words, max 1 [underline]) | Carry-Across-the-Cut & SFX Key`.
5. **Single-Take Recording Note & `@motion-designer` Handoff (`script.json`)**: Export `script.json` with `"style": "editorial"` and `"maxDurationSec": 179`.

## 5. Moving Image Archive Public-Domain Footage & Official FLUXD Brand Kit

- **Public-Domain Archival Video Shots (`archiveQuery`)**: Whenever a beat benefits from real historical/archival B-roll (e.g., film projectors, animated maps, oscilloscopes, cameras, space flight, typography), include `"archiveQuery": "<visual description>"` in that beat of `script.json`. `@motion-designer` (`scripts/fetch_archive_footage.py`) automatically queries `https://www.movingimagearchive.com/api/search` and downloads the matching public-domain `.mp4` clip into `assets/`.
- **Locked FLUXD Brand Identity (`references/brand-kit/`)**: Every blueprint and storyboard automatically carries the official **Chamfered-Bracket `Φ-2` Symbol** and **Framed `[ FLUXD ]` Wordmark** (`#E04826` Kodak Halation Vermilion + `#F6F3EC` Silver-Halide Paper + `#111315` Anamorphic Carbon Ink).

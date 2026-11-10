---
name: content-director
description: End-to-end content generation engine, cross-niche investigative research director, and script-to-storyboard architect for YouTube (16:9 long-form video essays, 9:16 Shorts, packaging/thumbnails) and Instagram (9:16 Reels, 4:5 Carousels, SEO captions with [...] keyword brackets, and Canva-editable 4:5 grid-safe Reel covers). Tailored to the creator's 4 core polymathic pillars—Physics & Astrophysics (M.Sc. Physics rigor), Geopolitics & Supply Chains, Socio-Economic Systems in India & the World, and Cinema/Cultural Craft—with the FLUXD Kinetic Editorial v3 system: untouched 1.00x natural voiceover sync, zero robotic panel numbers, Causal Chain spring choreography, multi-stem Dorian cinema score, framed In-Grid PiP video monitors, and a 3.0s post-VO FLUXD Logo Blink Outro synced to fxFluxdBlink.
---
# Content Director (Phase 1 of the FLUXD v3 Production Relay)

## 1. Operating Philosophy & Cross-Niche Polymathic Identity

This skill acts as **Phase 1 of your 2-Skill Production Relay** (`@content-director` $ightarrow$ `@motion-designer`) for **FLUXD** across **YouTube (`16:9` essays & `9:16` Shorts)** and **Instagram (`9:16` Reels & `4:5` Carousels)**, locked to the **FLUXD Kinetic Editorial v3 (`editorial`)** design system.

### Cross-Niche Polymathic Balance (Do Not Default Everything to Cinema)
While cinema & cultural craft is one of your four pillars, **not every video should revolve around movies**. Your signature voice comes from colliding **2 to 3 distinct pillars** in unexpected ways:
1. **Physics & Astrophysics (M.Sc. Physics Rigor)**: Thermodynamics (wet-bulb limits, Carnot efficiency), optics & wave physics ($13.5\text{ nm}$ EUV lithography, Rayleigh criterion), electromagnetism & synchronous AC grids ($50\text{ Hz}$ phase lock), orbital mechanics ($\Delta v$, Kessler cascade, GRACE gravity anomalies), fluid dynamics (Coriolis force, Somali Jet), and partial differential equations (heat diffusion / Black-Scholes).
2. **Geopolitics & Strategic Chokepoints**: Subsea fiber-optic cables (Bab el-Mandeb, Mumbai landing stations), semiconductor supply chains (ASML, TSMC's Silicon Shield), transboundary hydro-politics (Indus Waters Treaty, Brahmaputra), rare-earth refining, and maritime corridors.
3. **India & Global Socio-Economic Systems**: Urban network paradoxes (Braess's paradox, induced demand), agrarian & groundwater economics (Green Revolution aquifers, monsoon-GDP coupling), fiscal & energy transitions (Homi Bhabha's 3-stage Thorium cycle, UPI/digital public infrastructure), and quantitative macro data (RBI DBIE, MOSPI, Survey of India compliant maps).
4. **Cinema, Literature, Architecture & Cultural History**: Used selectively when a cultural text, historical archive, or visual craft illuminates a deeper civilizational or scientific truth.

```
[@content-director: Phase 1 — Cross-Niche Ideation, Research, Script & Packaging]
   1. Curate Cross-Niche Collisions (Physics × Geopolitics, Math × Indian Socio-Economics, etc.)
   2. Generate Anti-Slop Research Checklist (primary papers, NASA/RBI/CSIS datasets, verified archival sources)
   3. Write Beat-by-Beat Spoken Script with exact sub-card `mediaTimes` & zero robotic panel numbers
   4. Output validated `script.json` + Instagram Story One-Liners + 2026 SEO Caption (`[...]` keywords)
      + Zero-AI-Slop `1080×1920` (4:5 Grid-Safe) FLUXD Reel Cover & Layer-Editable Canva `.pptx`
          |
          v  (Creator records ONE continuous `voiceover.mp3` / `.wav` at natural cadence)
[@motion-designer: Phase 2 — Web-Curated Composition, 1.00x Acoustic Sync & GPU Local Render]
   5. Preserve 100% Untouched `1.00x` Voiceover (Read-only `silencedetect` maps exact clause pauses P01..PNN;
      NEVER apply aggressive `silenceremove` that clips voiceless plosives like "perspectives" or "walking")
   6. Lock explicit `s.dur` & `s.mediaTimes` to `0.001s` precision (never quantize VO scenes to musical half-beats)
   7. Pre-bundle all curated In-Grid Visual Cards & Framed PiP Video Monitors (`.ed-pip-video-card`) on Gemini Web
      (NEVER use full-screen `.md-bg-video` overlays; NEVER run unverified `--auto` downloads on local machine)
   8. Append 3.0s Post-VO FLUXD Logo Blink Outro (`s_fluxd_outro`) synced to `fxFluxdBlink` sonic signature
```

## 2. Hard v3 Architectural Learnings & Guardrails (Mandatory)

1. **Untouched `1.00x` Natural Voiceover Default (No Syllable Chopping or Musical Drift)**:
   - Never force a recording over 3 minutes down to `<179s` using `ffmpeg silenceremove` or `atempo` by default. `silenceremove` mistakes the brief acoustic dip before voiceless plosives (`p`, `t`, `k`) inside words like *"perspectives"* and *"walking"* for silence and chops them out.
   - Always keep the creator's natural `1.00x` voiceover untouched, use `silencedetect` purely as a read-only timestamp scanner to map clause boundaries, and preserve explicit `s.dur` to `0.001s` precision without rounding to musical half-beats.
2. **Zero Robotic Panel or Slide Numbers (`01 // FEATURED`, `// 01`, `BEAT 01`, `01 |` Are Banned)**:
   - Never write numbered prefixes like `"BEAT 01"`, `"01 // FEATURED"`, or `"01 | PERSPECTIVE"` in `chapter`, `kicker`, `callouts`, or `items`.
   - Use clean thematic chapter titles (e.g., `"THE THERMODYNAMIC WALL"`, `"THE 13.5 NM BOTTLENECK"`) and unnumbered editorial callout labels.
3. **100% Web-Curated In-Grid Media & Framed PiP Video Monitors (`.ed-pip-video-card`)**:
   - **Never set `bgVideo` (full-screen background video overlays are banned in `editorial` mode)**.
   - All visual artifacts—cutouts, bespoke SVG data cards, posters, and verified short `.mp4` clips—must be placed in `s.media` so they mount strictly inside framed 12-column Swiss-grid cards (`.ed-seq-card`, `.ed-hero-img-wrap`, or `.ed-pip-video-card` with a `REC ● // ARCHIVE FEED` header).
   - Never trigger blind `--auto` footage downloads during local rendering; curate and pre-bundle all assets inside the web workspace.
4. **Causal Chain Choreography & 4-Transition Camera Rotation**:
   - Whenever a scene has 2 or 3 visual cards in `s.media`, always provide exact `s.mediaTimes: [t1, t2, ...]` aligned to the spoken nouns in `s.vo`. When Card #2 or #3 whips in via `cardWhipIn` (3D tilt + velocity skew + spring overshoot), its arrival physically pushes earlier cards back in Z-space (`elastic.out(1, 0.42)`).
   - Rotate `s.transition` across the 4 camera-space transitions so consecutive cuts never repeat:
     - `"carryMorph"` $ightarrow$ `"zDollyThrough"` $ightarrow$ `"whipPanMatch"` $ightarrow$ `"matchCut"`.
5. **Multi-Stem `editorial` Score (`lib/audio.js`)**:
   - Default to `"preset": "editorial"` (`92 BPM` Dorian/Minor multi-stem score featuring bowed cello/sarangi dual-formant swells, warm analog Reese sub-bass, taiko frame-drum transients, felt plucks, and pre-cut tension risers).
6. **Mandatory 3.0-Second Extended Post-VO FLUXD Logo Blink Outro (`s_fluxd_outro`)**:
   - Every `script.json` must end (after the final spoken scene finishes) with a dedicated **3.0-second post-voiceover `bumper` scene** where the voiceover is silent, the audio bed rises to `0.95` full studio gain, and `fxFluxdBlink` plays frame-locked to the optical shutter blinks (`+0.18s`, `+0.38s`), binary wordmark strobe (`+0.56s`, `+0.72s`), `60ms` blackout gate (`+0.88s`), and `D1 (36.7 Hz)` sub-bass + D-Dorian 9th chord bloom (`+0.94s..+3.00s`):
     ```json
     {
       "id": "s_fluxd_outro",
       "kind": "bumper",
       "mode": "blink04",
       "dur": 3.0,
       "transition": "zDollyThrough",
       "sub": "WHERE CINEMA OPTICS, PHYSICAL LAW & GLOBAL SYSTEMS COLLIDE"
     }
     ```

## 3. Post-Production & Distribution Packaging Protocol (Instagram & YouTube)

Whenever delivering a finished Reel or Video Essay package (or when asked for captions/covers), always include:

1. **Instagram Story Share One-Liners (3 Angles)**:
   - *Curiosity Hook*: Poses an immediate paradox or question in under 15 words.
   - *Cross-Niche Collision*: Connects the two colliding disciplines (e.g., Physics + Geopolitics).
   - *Provocative Counter-Intuition*: States the most surprising empirical fact from the reel.
2. **2026 SEO-Optimized Instagram Reel Caption**:
   - **Above-the-Fold Hook (`<125 characters`)**: Lands before the `...more` truncation.
   - **Detailed Narrative Body**: Keyword-rich breakdown of the core physical mechanisms, historical records, or socio-economic data points (indexed by both Instagram in-app search and Google Search).
   - **5 Ultra-Targeted Hashtags**: Adheres to Instagram's 5-hashtag cap (2 niche topic tags + 2 discipline tags + 1 series/brand tag).
   - **Bottom Third-Bracket `[...]` Search Keyword Block**: A comma-separated list of 12–18 high-intent search terms enclosed in `[...]` at the very bottom of the caption for algorithmic indexing.
3. **Zero-AI-Slop `1080×1920` FLUXD Editorial Reel Cover + Layer-Editable Canva `.pptx`**:
   - Never use generic plastic AI art. Compose covers using real archival photography/posters, woodcut/halftone cutouts, Swiss 12-column hairlines, `[ Φ2 [ FLUXD ] ]` top branding, and `Instrument Serif` + `JetBrains Mono` display typography.
   - Keep all essential elements strictly inside the center `1080×1350` (`4:5`) and `1080×1080` (`1:1`) profile-grid safe zone, and export a companion `.pptx` file (`9.0 × 16.0 in`) so every text box, badge, and cutout is independently editable in Canva.

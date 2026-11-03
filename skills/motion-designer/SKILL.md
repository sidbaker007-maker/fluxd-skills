---
name: motion-designer
description: "Generates characterful, anti-slop motion graphics videos, Vox/Howtown mixed-media cutout collages, 3Blue1Brown mathematical animations, investigative explainer clips, kinetic captions + SRT subtitles, and interactive storyboards in Gemini Web or Gemini CLI. Supports 9 styles (Polymath, Vox, Data, Terminal, Keynote, Kinetic, Aura, Paper, Story), 21 scene kinds (including Vox Collage, 3Blue1Brown Math/s-Plane, Geographic Map Route Flyovers, Telescoping Scale Jumps, McPhee Pivots, Premise Inversions, and Matplotlib Telemetry), a Pre-Flight Asset & SFX Checklist (prompting the user for required movie clips, JPG cutouts, and custom SFX), classical animation physics (Ben Marriott 3-frame anticipation slingshots, volume-preserving squash & stretch, overlapping child drag, and Scale/Velocity Match Cuts), ~135 WPM self-recorded voiceover timing with [AUDIO PAUSE: Xs] ducking, -16 LUFS soundtracks, and NVIDIA RTX NVENC hardware-accelerated 1080p/4K MP4 or ProRes 4444 Alpha (.mov) exports for Premiere Pro and DaVinci Resolve."
---

# Motion Designer

Turn a script, outline, raw `.jpg`/`.png` cutouts, movie scenes (`.mp4`), custom SFX, or a `polymathic-investigative-director` blueprint into a characterful motion graphics clip (`1080p`/`4K MP4` or transparent `ProRes 4444 .mov`), a synchronized `.srt` subtitle file, and an interactive Storyboard (`HTML` in Gemini Canvas or `localhost` in Gemini CLI).

```
script / prompt (YouTube 16:9 or Short 9:16) -> Pre-Flight Asset & SFX Checklist (manifest)
  -> user uploads in chat (Web) or drops in $WORK/assets/ (CLI) -> cutout & plot
  -> frames (7-Point Anti-Slop Audit) -> storyboard -> render (MP4 / ProRes Alpha + .srt captions)
```

## Summary

This skill runs identically in **Gemini Web** and **local Gemini CLI**, uniting five production capabilities:

1. **Pre-Flight Asset & SFX Discovery (`manifest`)**: Reads the user's script and target format (**16:9 YouTube Video** vs. **9:16 Short/Reel**) and prompts the user upfront with a structured checklist of any recommended movie scenes (`.mp4`), historical/subject photos (`.jpg` for Vox cutouts), or custom sound effects (`.wav`/`.mp3`) so the user can upload them in chat or drop them into `$WORK/assets/`.
2. **Anti-Slop Characterful Choreography (`kit.js` + `references/craft.md`)**: Enforces Ben Marriott's 3-frame anticipation slingshots, Alan Becker's volume-preserving squash & stretch (`scaleX * scaleY = 1.0`), overlapping child drag (2-4 frame stagger on inner text/metrics), uniform `non-scaling-stroke` SVG paths, Nowack Design's Selective Stillness, and Herman Huang's 80/20 Transition Restraint using Scale/Velocity `matchCut` transitions.
3. **Vox / Howtown Cutout Collage (`vox` style + `collage` scene) & 3Blue1Brown Math (`math` scene + `splane` 3D plots)**: Combines posterized 10fps stop-motion paper cutouts, torn-paper horizons, damped-pendulum spotlight cones, and highlighter sweeps with frame-coupled differential equations, 14-coil spring-mass oscillators, and complex $s$-plane pole surfaces.
4. **Self-Recorded Voiceover Timing (`~135 WPM`) & Custom SFX Mixing (`audio.js`)**: Paces scene durations to the user's spoken script (`vo` + `[AUDIO PAUSE: Xs]` ducking) so rendered clips drop cleanly over the user's self-recorded voiceover in Premiere Pro or DaVinci Resolve. Also mixes custom `.wav`/`.mp3` SFX (`sfxFile`) and optional recorded VO files (`sound.voiceover`) with automatic sidechain ducking at `-16 LUFS`.
5. **Kinetic Word-by-Word Captions & Automatic `.srt` Export**: Supports burned-in word-highlighted kinetic captions (`"captions": "kinetic"`), documentary caption bars (`"captions": "bar"`), or clean video with an automatically generated `<slug>.srt` subtitle file ready to drag into Premiere Pro or DaVinci Resolve.

## When to Use

- Generating 20s, 30s, 60s, or 180s motion design clips in Gemini Web or Gemini CLI for **YouTube (`16:9`)** or **Shorts/Reels (`9:16`)** to stitch together in **Premiere Pro** or **DaVinci Resolve**
- Analyzing an uploaded script and telling the user exactly which short video clips, movie scenes, `.jpg` cutout images, and custom SFX to provide before rendering
- Creating **Vox / Howtown style** mixed-media paper-cutout explainers or **3Blue1Brown style** mathematical/physics animations
- Rendering motion clips with **kinetic word-by-word captions** or exporting timed **`.srt` subtitle files**

## Steps

### Step 1: Detect Format (`16:9` YouTube vs. `9:16` Short/Reel) & Initialize Project

Check whether the user is making a **YouTube video (`16:9`)** or a **Short / Reel (`9:16`)**:

```bash
node <SKILL_DIR>/scripts/motion.js new "$WORK" --style vox --format 16:9 --wpm 135
```

### Step 2: Run the Pre-Flight Asset & SFX Check (Prompt First When Script Needs Specific Media)

When the user provides a script or topic that references specific movie scenes, historical photos, people/objects for Vox paper cutouts, or custom sound effects/voice effects:

1. Draft `$WORK/video.json` with the planned scenes, setting target filenames in `assets/` (e.g. `"bgVideo": "assets/clip-01-scene.mp4"`, `"cutout": "assets/img-01-subject.jpg"`, `"sfxFile": "assets/sfx-01-projector.mp3"`) and descriptive notes (`"assetNote"`, `"bgNote"`, `"sfxNote"`).
2. Run `node <SKILL_DIR>/scripts/motion.js manifest "$WORK"` to generate `$WORK/ASSETS_NEEDED.md` and present the **Pre-Flight Asset & SFX Checklist** to the user:
   - List each required **Short Video / Movie Clip**, **Cutout Image (`.jpg`/`.png`)**, and **Custom SFX (`.wav`/`.mp3`)** with its exact filename and time window.
   - Tell the user: *"Upload these files right here in chat (if in Gemini Web) or drop them into `$WORK/assets/` (if in Gemini CLI) — or tell me to proceed with procedural/built-in visuals and synthesized SFX for any item you want to skip."*

### Step 3: Process Uploaded Cutouts, Raw Footage, Custom SFX, and Plots

- **Vox `.jpg` / `.png` Cutouts**: Any image in `"cutout"` is automatically processed by `scripts/polymath_plots.py` into a high-contrast archival print cutout with a white die-cut sticker border (or run `node <SKILL_DIR>/scripts/motion.js cutout "$WORK" path/to/photo.jpg`).
- **Raw Video / Movie Clips (`.mp4` / `.mov`)**: Reference in `"bgVideo": "assets/clip.mp4"` (full-bleed background layer) or `"media": "assets/clip.mp4"` (framed inside a Vox paper cutout or hardware mockup).
- **Custom SFX & Recorded Voiceover**: Reference custom effects in `"sfxFile": "assets/effect.mp3"` on any scene. The user's own voiceover can either be synced in Premiere Pro / DaVinci Resolve (since scene durations already match `vo` at `135 WPM` + `[AUDIO PAUSE: Xs]`) or placed at `"sound": { "voiceover": "assets/vo.mp3" }` for automatic sidechain ducking.
- **Captions & `.srt` Subtitles**:
  - Set `"captions": "kinetic"` in `video.json` for burned-in word-by-word highlighted captions (ideal for `9:16` Shorts/Reels).
  - Set `"captions": "bar"` (or `"subtitles": true`) for a clean documentary lower caption bar.
  - Leave `"captions": "off"` for a clean visual frame — the composer **always** exports `<work>/captions.srt` (and `<slug>.srt` on render) so you can drag editable subtitles straight into Premiere Pro or DaVinci Resolve.

### Step 4: Compose and Audit Keyframes (`frames`)

```bash
node <SKILL_DIR>/scripts/motion.js frames "$WORK"
```

Inspect `$WORK/frames/sheet.jpg` via `view_file` (or `read_file` in Gemini CLI) and verify all 7 Anti-Slop Motion Audit checks pass cleanly.

### Step 5: Storyboard & Render (Gemini Web vs. Local Gemini CLI + RTX 3050)

- **In Gemini Web (Cloud Sandbox)**:
  ```bash
  node <SKILL_DIR>/scripts/motion.js canvas "$WORK" <output-dir>/<slug>-storyboard.html
  node <SKILL_DIR>/scripts/motion.js render "$WORK" --skip-review
  ```
  Present `<slug>.mp4`, `<slug>.srt`, and `<slug>-storyboard.html` via `google:show_file`.

- **In Local Gemini CLI (With NVIDIA RTX 3050 / GPU Hardware Acceleration)**:
  - Open the live localhost storyboard (`node <SKILL_DIR>/scripts/motion.js board "$WORK" --open`) or compile the standalone Canvas HTML (`node <SKILL_DIR>/scripts/motion.js canvas "$WORK"`).
  - Render with automatic **NVIDIA RTX 3050 (`h264_nvenc` + Chromium GPU)** acceleration:
  ```bash
  # Fast 1080p NVENC render (also outputs <slug>.srt)
  node <SKILL_DIR>/scripts/motion.js render "$WORK" --res 1080p --fps 30 --skip-review

  # Native 4K UHD (3840x2160) NVENC render for YouTube features
  node <SKILL_DIR>/scripts/motion.js render "$WORK" --res 4k --fps 30 --skip-review

  # Transparent ProRes 4444 (.mov) with 10-bit Alpha for Premiere Pro / DaVinci Resolve Track V2
  node <SKILL_DIR>/scripts/motion.js render "$WORK" --res 1080p --alpha --skip-review

  # Optional: Export video.json into a ready-to-run Remotion TypeScript/React project (Root.tsx + VideoComposition.tsx)
  node <SKILL_DIR>/scripts/motion.js remotion "$WORK"
  ```

## Gotchas

- Never invent fake statistics or skip the Pre-Flight Asset Checklist when a script calls for specific movie clips or historical `.jpg` photos.
- Do not worry about generating TTS audio when the user plans to record their own voiceover: use `"vo"` and `[AUDIO PAUSE: Xs]` purely to lock the exact visual timing, soundtrack pauses, and `.srt` subtitle timestamps to their script.

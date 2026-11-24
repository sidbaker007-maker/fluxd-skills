---
name: learn-style
description: "Reverse-engineers video editing, pacing, cutting cadence, 2-second fuse micro-changes, camera zooms, transitions, and caption layouts from reference video links or MP4 files into a quantitative skill called my-style. Trigger whenever the user says /learn-style, asks to analyze or learn the editing style of reference videos/Reels/Shorts/YouTube videos, extract shot contact sheets and word timings with yt-dlp, ffmpeg, and faster-whisper, or build/merge their my-style editing profile."
---

# Learn Style

Reverse-engineer the quantitative editing, pacing, micro-change cadence (`2-Second Fuse`), transition, zoom, and caption mechanics of reference videos (via `yt-dlp`, `ffmpeg`, OpenCV/Pillow, and `faster-whisper`) and compile them with the user's own brand fonts, colours, and logo into a reusable `my-style` skill (`SKILL.md` + per-reference notes + a `motion-designer` preset).

## Summary

This skill runs a 5-stage empirical pipeline:

1. **Environment Verification (`scripts/setup_check.py`)**: Checks `python3`, `ffmpeg`, `ffprobe`, `yt-dlp`, `faster-whisper` (auto-detecting NVIDIA RTX CUDA `float16` acceleration), `opencv-python-headless`, and `Pillow`.
2. **Brand Intake (Never Guess)**: Confirms the user's own fonts, hex colours, logo file, and target video format (`9:16` faceless/talking reels vs `16:9` YouTube essays).
3. **Automated Telemetry Extraction (`scripts/analyze_reference.py`)**: Downloads each reference video (or reads local `.mp4` files), detects every shot/chapter boundary via `ffmpeg` (auto-adapting to `0.042` threshold for persistent-HUD motion graphics), measures 10fps micro-changes and full-screen colour flashes (`RANG`), generates a full shot contact sheet (`shots_sheet.jpg`) plus **12 fps frame strips of the opening 0-4s hook (`hook_12fps.jpg`) and key transitions (`trans_XX_12fps.jpg`)**, measures camera zoom % via optical flow, samples caption-zone hex contrast, and transcribes word-level timestamps via `faster-whisper` (with an automatic `ffmpeg silencedetect` + `--transcript-text` fallback when offline).
4. **Multimodal Visual Audit**: Inspects the generated 12 fps contact sheets and any uploaded design images to measure caption word count per chunk, Y-offset (% from bottom), font weight, mixed Sans/Serif emphasis, and transition frame counts.
5. **Skill Compilation & Merging (`scripts/compile_my_style.py`)**: Writes (or merges into) `my-style/SKILL.md` as deterministic `"Do X when Y"` numerical rules alongside `references/<slug>-notes.md` and `assets/motion-designer-preset.json`, then outputs a 1-page summary and 3 verification questions.

## When to Use

- Running `/learn-style` on 1 or more reference video URLs (YouTube Shorts, Instagram Reels, TikToks, or long-form YouTube videos) or local `.mp4` files
- Setting up a local folder for video analysis (`yt-dlp` + `ffmpeg` + `faster-whisper` on Windows or macOS)
- Updating or merging new reference videos into an existing `my-style` skill

## Steps

### Step 1: Verify Environment & Tools

Run the bundled setup checker to verify installed binaries, Python packages, and NVIDIA RTX GPU (`cuda`/`float16`) detection:

```bash
python3 <SKILL_DIR>/scripts/setup_check.py
```

### Step 2: Check Brand Inputs (Ask If Missing, Never Guess)

Before compiling `my-style`, verify that you have the user's explicit brand inputs (or retrieve them from the user's saved `brand-kit-designer` / channel identity):

- **Brand Fonts**: Display, body, and monospace font names + weights
- **Brand Colours**: Background, primary text, primary accent, and secondary accent hex codes
- **Brand Logo**: Path or identifier for the user's logo mark / wordmark
- **Target Format**: e.g. `9:16 faceless retention reels, 45-60 s` or `16:9 YouTube feature, 15-25 min`

### Step 3: Run `analyze_reference.py` on Each Reference Video

For each reference link or `.mp4` file, run:

```bash
python3 <SKILL_DIR>/scripts/analyze_reference.py "<url-or-mp4-path>" \
  --out "$WORK/refs/ref-01" \
  --scene-threshold 0.27 \
  --whisper-model small
```

- Inspect `shots_sheet.jpg`, `hook_12fps.jpg`, and `trans_01_12fps.jpg` via `view_file` to verify caption words per chunk, vertical Y-position, and transition frame count.

### Step 4: Compile or Merge `my-style`

Run `compile_my_style.py` passing all `telemetry.json` paths and the user's brand tokens:

```bash
python3 <SKILL_DIR>/scripts/compile_my_style.py \
  --telemetry "$WORK/refs/ref-01/telemetry.json" "$WORK/refs/ref-02/telemetry.json" \
  --out-skill-dir ~/.gemini/skills/my-style \
  --format "9:16 faceless retention reels, 45-60 s" \
  --fonts "<user-fonts>" \
  --colours "<user-hex-colours>" \
  --logo "<user-logo>" \
  --caption-words 6 \
  --caption-y-pct 82 \
  --transition-frames 7
```

- **In Gemini Web**: Persist `my-style` to the user's account using `skills:save_skill` (or `skills:update_skill`) and present a downloadable `.zip` of `my-style` via `google:show_file`.

### Step 5: Present the 1-Page Summary + 3 Verification Questions

Conclude your response with a 1-page quantitative summary table and 3 verification questions on subtle editorial/visual preferences.

## Gotchas

- **Copy Technique Only**: Never copy a reference video's spoken phrases, topic claims, brand colours, logos, or B-roll footage into `my-style`. Only extract numerical timing, cut cadence, spatial layout coordinates, and camera physics.
- **Always Check Contact Sheets Visually**: View `hook_12fps.jpg` and `shots_sheet.jpg` to accurately count caption words per line, Y-position, and transition frame mechanics.

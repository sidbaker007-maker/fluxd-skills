---
name: learn-style
description: "Reverse-engineers video editing, pacing, cutting cadence, camera zooms, transitions, and caption layouts from reference video links or MP4 files into a quantitative skill called my-style. Trigger whenever the user says /learn-style, asks to analyze or learn the editing style of reference videos/Reels/Shorts/YouTube videos, extract shot contact sheets and word timings with yt-dlp, ffmpeg, and faster-whisper, or build/merge their my-style editing profile."
---

# Learn Style

Reverse-engineer the quantitative editing, pacing, transition, zoom, and caption mechanics of reference videos (via `yt-dlp`, `ffmpeg`, OpenCV/Pillow, and `faster-whisper`) and compile them with the user's own brand fonts, colours, and logo into a reusable `my-style` skill (`SKILL.md` + per-reference notes + a `motion-designer` preset).

## Summary

This skill runs a 5-stage empirical pipeline:

1. **Environment Verification (`scripts/setup_check.py`)**: Checks `python3`, `ffmpeg`, `ffprobe`, `yt-dlp`, `faster-whisper` (auto-detecting NVIDIA RTX CUDA `float16` acceleration), `opencv-python-headless`, and `Pillow`.
2. **Brand Intake (Never Guess)**: Confirms the user's own fonts, hex colours, logo file, and target video format (`9:16` talking reels vs `16:9` YouTube essays).
3. **Automated Telemetry Extraction (`scripts/analyze_reference.py`)**: Downloads each reference video (or reads local `.mp4` files), detects every shot boundary via `ffmpeg`, generates a full shot contact sheet (`shots_sheet.jpg`) plus **12 fps frame strips of the opening 0-4s hook (`hook_12fps.jpg`) and key transitions (`trans_XX_12fps.jpg`)**, measures camera zoom % via optical flow, samples caption-zone hex contrast, and transcribes word-level timestamps via `faster-whisper` to compute exact WPM and pause durations.
4. **Multimodal Visual Audit**: Inspects the generated 12 fps contact sheets and any uploaded design images to measure caption word count per chunk, Y-offset (% from bottom), font weight, and transition frame counts.
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

If any binary or package is listed under `missing_commands`, provide the exact install command to the user (or run it if permitted in local Gemini CLI).

### Step 2: Check Brand Inputs (Ask If Missing, Never Guess)

Before compiling `my-style`, verify that you have the user's explicit brand inputs:

- **Brand Fonts**: Display, body, and monospace font names + weights (or ask if they want to pull from their `brand-kit-designer` tokens)
- **Brand Colours**: Background, primary text, primary accent, and secondary accent hex codes
- **Brand Logo**: Path to logo file (or `"none"` if no watermark is used)
- **Target Format**: e.g. `9:16 talking reels, 45-60 s` or `16:9 YouTube feature, 15-25 min`

If any of these 4 inputs is missing, ask the user before finalizing `my-style`. Never guess or copy the reference creator's fonts, colours, or logos.

### Step 3: Run `analyze_reference.py` on Each Reference Video

For each reference link or `.mp4` file, run:

```bash
python3 <SKILL_DIR>/scripts/analyze_reference.py "<url-or-mp4-path>" \
  --out "$WORK/refs/ref-01" \
  --scene-threshold 0.27 \
  --whisper-model small
```

- If `yt-dlp` reports that login cookies are required (and automatic `--cookies-from-browser` fails or is running in a cloud sandbox without browser cookies), ask the user to either upload the `.mp4` file directly or provide a `cookies.txt` file (`--cookies-file`).
- Inspect the generated contact sheets using `view_file` (or `read_file` in Gemini CLI):
  - `$WORK/refs/ref-01/shots_sheet.jpg` (every shot with start time and duration)
  - `$WORK/refs/ref-01/hook_12fps.jpg` (12 fps strip of the first 4.0 seconds)
  - `$WORK/refs/ref-01/trans_01_12fps.jpg` (12 fps strip around each transition cut)
- From your visual inspection of those sheets (plus any design images provided by the user), record:
  1. **Caption words per visible chunk** (e.g. `3-5 words`) and **vertical position** (`% from bottom edge`).
  2. **Font classification & weight** (e.g. heavy geometric sans `800` with `-0.03em` tracking, stroke/shadow box style).
  3. **Transition duration in frames** (count the blurred/whip/zoom frames on the 12 fps strip; multiply by `2.5` to convert 12 fps frames to 30 fps frames).

### Step 4: Compile or Merge `my-style`

Run `compile_my_style.py` passing all `telemetry.json` paths and the user's brand tokens:

```bash
python3 <SKILL_DIR>/scripts/compile_my_style.py \
  --telemetry "$WORK/refs/ref-01/telemetry.json" "$WORK/refs/ref-02/telemetry.json" \
  --out-skill-dir ~/.gemini/skills/my-style \
  --format "9:16 talking reels, 45-60 s" \
  --fonts "<user-fonts>" \
  --colours "<user-hex-colours>" \
  --logo "<user-logo>" \
  --caption-words 4 \
  --caption-y-pct 22 \
  --transition-frames 6
```

- **In Gemini Web**: Also persist `my-style` to the user's account using `skills:save_skill` (or `skills:update_skill` if `my-style` already exists and the user confirms updating it), and present a downloadable `.zip` of `my-style` via `google:show_file`.
- **In Local Gemini CLI**: Writing to `~/.gemini/skills/my-style` (and optionally `.claude/skills/my-style` if the user also uses Claude) immediately activates `my-style` for future sessions.

### Step 5: Present the 1-Page Summary + 3 Verification Questions

Conclude your response with:

1. **One-Page Quantitative Summary of `my-style`**: A scannable Markdown table showing all measured numbers (`Cuts per 10s`, `Median Shot Length`, `Hook Cuts (0-4s)`, `WPM`, `Pause Duration`, `Zoom %`, `Transition Frames`, `Caption Words & Y-Position`, and locked `Brand Tokens`), plus a list of what changed if merged into an existing `my-style`.
2. **3 Things You Are Unsure About**: Explicitly list 3 nuanced visual or editorial ambiguities observed across the references (for example, whether B-roll cuts should mute or duck room tone, whether active caption words should use a solid pill box vs text-fill colour only, or whether jump-cuts on talking head shots should alternate `1.00x` and `1.12x` instant punch-ins vs slow creep zooms) and ask the user to confirm their preference.

## Gotchas

- **Copy Technique Only**: Never copy a reference video's spoken phrases, topic claims, brand colours, logos, or B-roll footage into `my-style`. Only extract numerical timing, cut cadence, spatial layout coordinates, and camera physics.
- **Always Check Contact Sheets Visually**: `telemetry.json` gives you exact cut timestamps, zoom %, and Whisper WPM, but you must view `hook_12fps.jpg` and `shots_sheet.jpg` to accurately count caption words per line, Y-position, and transition frame mechanics.

# Production Pipeline & Technique Guide (TECHNIQUE.md)

This guide covers how to build, render, score, voice, mix, and verify a Lemo-Opuscar film in code. Pair it with `DIRECTOR.md` (how to direct) and `styles/<slug>/STYLE.md` (what the style looks and sounds like).

## 1. Environment & Toolchain

- **Core requirements:** Node 20+, `ffmpeg` 7+ (with `loudnorm`, `bwdif`, `hqdn3d`, `unsharp`, `delogo`), Python 3.11+ (`numpy`, `scipy`, `Pillow`, `soundfile` / `soxr`), and headless Chromium / Playwright or Puppeteer for deterministic frame capture.
- **Output defaults:** 1920x1080 at 24 fps (or the frame rate specified in the style's `STYLE.md`, such as 30 fps for `visual-investigation`, `caption-news`, `countdown`, `city-symphony`); custom dimensions (`--size 1080x1920` or `1080x1440` for vertical social feeds) passed consistently to the page renderer and `ffmpeg` muxer.

## 2. Deterministic Frame-by-Frame Rendering

- **Single deterministic entry point:** Every HTML/Canvas-2D/WebGL scene exposes `window.render(t)` (where `t` is time in seconds, `t = frame / fps`). Never rely on `requestAnimationFrame` wall-clock elapsed time, CSS transitions, or unseeded `Math.random()`.
- **One world -> screen function:** Camera transforms (`w2s(x, y)` or 3D projection) must map world coordinates to screen coordinates through a single function so annotations, leaders, reticles, and loupes stay locked to moving subjects (`DIRECTOR.md` §10).
- **Pre-extracted video/document plates:** When compositing archival footage, video clips, or PDF document pages into a Canvas/WebGL scene (`caption-news`, `visual-investigation`, `countdown`, `kino-montage`), pre-extract clips with `ffmpeg` (`prep.sh`) to frame-numbered JPEGs at display resolution (`crop`, `lanczos`, `unsharp`, `delogo`) and render PDFs with `pdftoppm -r 220` or `-r 300` (extracting exact highlight coordinates via `pdftotext -bbox`).
- **Reproducible build:** Include a one-command `build.sh` in the project folder that runs data/footage preparation, font subsetting, audio mixing, frame capture, and final `ffmpeg` muxing.

## 3. Rhythm, Cue Map & Reading-Time Checks (`readcheck.js`)

- **Shared timeline JSON:** Store all section boundaries, bar/beat grids, voice start times, caption chunks, and foley events in a single `timeline.json` (or `film.json`) read by the visual page, the subtitle generator, and `audio/mix.py`.
- **Reading-time invariant (`readcheck.js`):**
  - Expose `window.TEXTS(t)` returning all active key text blocks on screen at time `t` (counters and timecode ticks are exempt; rolling counters report their final landing value).
  - Every key text block must remain whole and legible on screen for at least:
    `hold_seconds >= (CJK_chars / 4.5) + (Latin_chars / 15.0) + 1.5`
  - Every subtitle cue must hold for `>= max(1.8, speech_duration + 0.6)` seconds.
  - Every multi-item comparison or verdict board must hold all items simultaneously for `>= 2.5` seconds.

## 4. Voice Narration & ASR Verification (`tts.py` & `asr_check.py`)

- **Voice generation:**
  - If the user provides their own voice recording, use it untouched and extract word-level timestamps with `faster-whisper`.
  - For synthesized narration: use offline Kokoro TTS (`am_michael`, `af_heart`, etc.) or `edge-tts` (with user consent when an online voice is needed). Spell out numbers and abbreviations in the TTS input text while rendering digits on screen.
- **ASR verification (`asr_check.py` / `final_asr.py`):**
  - Run `faster-whisper` on every generated TTS line and on the final mixed audio track to verify that every spoken line transcribes back accurately without clipped endings, mangled terms, or foley masking.

## 5. Music, Foley & Mixing (`audio/mix.py`)

- **Three audio layers:**
  1. **Ambience bed:** Room tone, light-table ballast hum (100 Hz), wind, street, or archival noise (~20-30 dB under the voice).
  2. **Procedural & sampled foley:** Tie every visual action (`window.EV`) to a material-accurate sound (paper sweep, highlighter scrub, camera shutter, Morse keystrokes, chunk slam thump + click, counter rattle ticks every 45 ms, loupe glass clack).
  3. **Original score:** Synthesized or assembled from CC0 sample libraries (`VSCO 2 CE`, `VCSL`, `Salamander Grand Piano`, `FreePats`) in the exact instrument palette specified by `STYLE.md` §7. Never use generic piano-and-strings pads where the style forbids them.
- **Ducking & silences:**
  - Duck music ~8-11 dB (or 45-70 %) and foley ~35 % under speech using a smooth held envelope so levels do not pump between words.
  - Gate all layers to true silence (or thin room tone) for at least two dramatic silences before the turn or climax (`DIRECTOR.md` §6).
  - Apply a 25 ms fade-in at sample 0 to prevent AAC encoder overshoot on frame-1 hits.

## 6. Final Muxing & Loudness Normalization (`mux.sh`)

- Multiplex rendered frames and mixed audio with `ffmpeg` (`libx264 -pix_fmt yuv420p -crf 18` + `aac -b:a 192k`).
- Normalize integrated loudness to **-14 LUFS** with true peak `<= -1.0 dBTP` (or `-1.2 dBTP`) via two-pass `loudnorm` or pre-limited mastering.
- When subtitles are burned into the video frames, export the sidecar subtitle file as `subtitles_<lang>.srt` rather than `<name>.srt` so desktop media players do not double-render the subtitles over the burned-in captions.

## 7. Contact-Sheet Review Loop (`sheet.py`)

- Before delivering, generate a tiled contact sheet of every shot and 0.2 s frame strips across fast transitions and key animations.
- Check for black frames, NaN bloom tiles, text collisions, clipped descenders, station logos in archival footage, and reading-time violations. Fix all issues in one consolidated pass and re-verify.

## 8. Credits & Provenance (`CREDITS` & `FACTS.md`)

- **`CREDITS`:** List every third-party asset used in the film (archive footage, photographs, documents, map datasets and view, fonts, sample libraries, voice engine) with its title, author/holder, source URL, and licence (Public Domain, CC0, CC BY 3.0/4.0, OFL, MIT).
- **`FACTS.md`:** For any film stating real-world numbers, historical events, scientific measurements, or product specs, map every claim on screen or in the voiceover to its primary/official source URL and verbatim quoted wording, keeping inferences explicitly marked (`~`, `inferred`, `schematic`).

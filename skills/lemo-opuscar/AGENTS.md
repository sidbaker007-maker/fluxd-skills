# Agent Operating Rules (AGENTS.md)

This guide defines the workflow for transforming a user's request into a finished Lemo-Opuscar film or a custom saved style.

## 1. Request Types

Determine what the user is asking for:

1. **A film in a named style:** Look up the style in `styles/README.md` (or `~/lemo-my-styles/README.md` if they name a custom style), read its `STYLE.md`, and follow the **Film Workflow** below.
2. **A film about a topic without a chosen style:** Suggest 2-3 matching styles from `styles/README.md` with reasons, share the gallery link (`https://lemomo-ai.github.io/lemo-opuscar/`), and ask the user which style they want alongside the brief questions.
3. **Change a library style or start a new style from a blank page:** Read `MY-STYLES.md` and follow its step-by-step style creation workflow.
4. **No specific topic or style yet (or asking what styles exist):** Present the 15 categories and 99 styles from `styles/README.md` with the gallery link (`https://lemomo-ai.github.io/lemo-opuscar/`) and ask what they would like to make.

## 2. Finding the Style

- Check `~/lemo-my-styles/README.md` first (the user's own saved styles take precedence), then `styles/README.md`.
- Users may name a style in English, in Chinese, by a former name, or by its folder slug.
- If the chosen `styles/<slug>/STYLE.md` is bundled in this skill directory, read it directly. If the user selects one of the other 99 styles not yet cached locally, read its full `STYLE.md` from `https://github.com/lemomo-ai/lemo-opuscar/blob/main/styles/<slug>/STYLE.md` or `https://lemomo-ai.github.io/lemo-opuscar/styles/<slug>/`.
- Styles marked `✦` in `styles/README.md` (`text-flash-cuts`, `comic-history`, `manga-panels`) require an image generation tool for character drawings; mention this before starting if selected.

## 3. Film Workflow (Treatment First, Demo Later)

Follow these stages in order:

1. **Brief (Ask Once):**
   - Ask all clarifying questions in a **single message** up front (`DIRECTOR.md` §1): anything undecided about the topic, length/aspect ratio overrides (default 30-60 s, 1920x1080; vertical 1080x1920 or 1080x1440 on request), whether the user has their own voiceover, music, footage, documents, scans, or CAD files, and whether they want to review a storyboard first.
   - Once answered, ask no further questions until the storyboard (if requested) or final delivery.
2. **Material & Facts First (for Edit & Documentary, Instruments & Evidence, and Data & Maps styles):**
   - Gather user-provided material first, or search open-licensed archives (`Wikimedia Commons`, `Internet Archive`, `NASA`, `USGS`, `Library of Congress`, `NARA`) per the style's `STYLE.md`.
   - Before downloading external archive files, tell the user what you will fetch, from where, and under which licence (PD, CC0, CC BY).
   - Record every factual claim, number, date, source URL, and verbatim quote in `FACTS.md`, and every third-party asset in `SOURCES.jsonl` / `CREDITS`.
3. **Treatment First (`TREATMENT.md`):**
   - Read `DIRECTOR.md` and the chosen `STYLE.md`.
   - Write `TREATMENT.md` in the project folder **before** drawing anything or copying demo code: three candidate structures (and why you chose one), logline and arc (setup -> turn -> ending), benchmark (what to learn / what not to take), shot list, second-by-second beat sheet, cue map (tempo, bar grid, instrumentation, cut beats), sound design table, and subtitle/title design.
4. **Prove the Look (Style Frames & Optional Storyboard):**
   - Render 3 style frames (or model sheet + 2 style frames for character styles) using the real drawing code (Canvas 2D or WebGL/Three.js), and verify them against `STYLE.md`.
   - If the user asked for a storyboard, render 6-9 key shots tiled into a contact sheet, present it with the logline, and wait for approval. If not requested, proceed directly to production.
5. **Production (`TECHNIQUE.md`):**
   - Generate or transcribe voiceover first to lock word timings (`faster-whisper`).
   - Build the music grid and procedural/sampled score + material-matched foley + ambience with ducking and at least two intentional silences (`DIRECTOR.md` §6-7).
   - Write deterministic frame-by-frame rendering code (`window.render(t)`), verify reading times (`readcheck.js`: `CJK / 4.5 + Latin / 15 + 1.5` s, minimum 1.8 s and >= speech + 0.6 s), and render all frames.
6. **Review Loop & Delivery (`DIRECTOR.md` §11):**
   - Inspect contact sheets and 0.2 s action strips, verify loudness (-14 LUFS, true peak <= -1 dBTP), verify speech-to-text transcription accuracy, check all maps against `DIRECTOR.md` §13, and confirm zero LemoLab watermarks or sign-offs in the user's film.
   - Deliver `<name>.mp4`, `poster.jpg`, `<name>.srt` (or `subtitles_<lang>.srt` when subtitles are burned in), `TREATMENT.md`, `FACTS.md` (for factual/documentary films), `CREDITS`, and reproducible source with `build.sh`.

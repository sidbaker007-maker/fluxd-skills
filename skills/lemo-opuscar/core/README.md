# `core/` Command & Runtime Reference

The `core/` directory provides the rendering, voice (TTS + ASR), audio synthesis/sampling, and drawing runtime shared across all 99 Lemo-Opuscar styles.

## 1. Page Contract (`index.html`)

Every film page exposes:

- `window.DUR` (number): Total duration of the film in seconds.
- `window.READY` (boolean): Set to `true` once all fonts, images, and pre-baked assets have loaded.
- `window.render(t)` (function): Deterministically draws the frame for time `t` (in seconds). Must never use `Date.now()` or unseeded `Math.random()`.
- `window.EV` (array, optional): Sound and cue events `[{ t, type, ... }]` extracted via `node core/render/events.js`.
- `window.TEXTS(t)` (function, optional): Returns visible key text boxes `[{ id, text, x0, y0, x1, y1 }]` at time `t` for `node core/render/readcheck.js`.

## 2. Rendering Toolchain (`core/render/`)

- **Extract events:**
  `node core/render/events.js <demo_dir> [--q 'k=v'] [--out events.json] [--size 1920x1080]`
- **Capture style frames / stills:**
  `node core/render/still.js <demo_dir> <t1> [t2 ...] [--out stills_dir] [--prefix frame_] [--size 1920x1080]`
- **Render full video (parallel headless Chromium workers -> FFmpeg):**
  `node core/render/video.js <demo_dir> [--fps 24] [--size 1920x1080] [--workers 3] [--out out/video.mp4]`
- **Verify reading times (`CJK / 4.5 + Latin / 15 + 1.5` s):**
  `node core/render/readcheck.js <demo_dir> [--step 0.04] [--latin-cps 15] [--cjk-cps 4.5] [--pad 1.5] [--min 1.5]`
- **Mux video + audio with two-pass `-14 LUFS` normalization and optional film grain:**
  `sh core/render/mux.sh <video.mp4> <mix.wav> <out.mp4> [fps] [grain]`
- **Generate `.srt` subtitles from JSON cues (`[{t0, t1, text}]`):**
  `python3 core/render/srt.py <cues.json> <out.srt>`
- **Tile stills into a contact sheet:**
  `python3 core/render/sheet.py <out.jpg> <img1> <img2> ... [--cols 4] [--w 480]`

## 3. Voice: TTS & ASR Verification (`core/tts/`)

- **Offline Kokoro TTS:**
  `python3 core/tts/tts.py <lines.json> <out_dir>`
- **Online Microsoft Neural TTS (`edge-tts`):**
  `python3 core/tts/tts_zh.py <lines.json> <out_dir> [--voice zh-CN-XiaoxiaoNeural] [--rate +0%] [--pitch +0Hz]`
- **Whisper ASR verification & word-level timestamps (`words.json`):**
  `python3 core/tts/asr_check.py <lines.json> <voices_dir> [--lang en|zh|auto] [--threshold 0.92] [--model base]`

## 4. Music, Plucked Strings & Procedural Foley (`core/audio/`)

- `core/audio/sampler.py`: `S.note(inst, pitch, dur, vel)`, `S.hit(inst, kind, vel)`, `S.render(events, dur)`, `S.room(buf, size, mix)`, `S.credits(names)`
- `core/audio/pluck.py`: Karplus-Strong physical string synthesis `P.pluck(preset, pitch, dur, vel, **params)`, `P.strum(preset, pitches, dur, vel, spread, up)`
- `core/audio/sfx.py`: `SR = 48000`, `add(buf, snd, at, gain, pan)`, `limit(buf, ceiling_db)`, `compress(buf)`, `duck(music, voice, db, hold_sec)`, and procedural foley generators (`click`, `thump`, `whoosh`, `ding`, `paper_sweep`, `shutter`)

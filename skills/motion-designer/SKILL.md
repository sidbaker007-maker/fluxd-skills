---
name: motion-designer
description: Generates open-stage FLUXD Kinetic Editorial motion graphics videos, native HeyGen HyperFrames HTML/GSAP compositions (with .clip timing, data-motion-blur, and .motion.json assertions), 3-5 word active-word karaoke subtitles (in-canvas, zero .srt files), prominent animated FLUXD logo end-cards (Blink 01A/01B/03/04), 5-source movie & archival footage grabbing (Moving Image Archive, GetYarn/PlayPhrase/Clip.Cafe/QuoDB movie clips, Internet Archive/Prelinger stream-slicing, yt-dlp scene slicing, Wikimedia), two-stage voiceover auto-slicing (silence trim first + gentle atempo <= 179s), self-indexing local SFX sync (peakOffsetSec alignment), Style-Anchored Nano Banana cutouts, 1080p/4K 60fps MP4 + interactive Canvas Storyboard exports, and on-demand FilmCraft multi-track project exports (.xml + .otio + isolated voiceover, music, and SFX stems).
---
# Motion Designer (Phase 2 of the FLUXD Production Relay — Native HyperFrames Engine)

Turn a `@content-director` `script.json` handoff + your **single continuous voiceover recording (`voiceover.wav` / `.mp3`)**, raw `.jpg`/`.png` assets, movie/archival footage queries, and your local `assets/sfx/` folder into a deterministic **HyperFrames** composition (`build/index.html` + `build/main.motion.json`), an interactive Storyboard (`HTML` in Gemini Canvas or `localhost` in CLI), a locked `60 fps` H.264 `.mp4`, and (whenever requested) an on-demand **FilmCraft multi-track editable project bundle**.

```
[@content-director: Phase 1] -> script.json + Movie/Archival & SFX Manifest + Single Continuous voiceover.wav
        |
        v
[@motion-designer: Phase 2 — FLUXD Kinetic Editorial + HyperFrames]
  1. voiceover_sync.py        -> Trims breath pauses (>0.32s -> 0.15s) FIRST, applies gentle atempo only if > 179s,
                                 and populates scene-relative `words: [...]` for karaoke captions (no .srt files)
  2. fetch_archive_footage.py -> Grabs movie clips (GetYarn, yt-dlp section slice) & archival film (Moving Image
                                 Archive, Internet Archive/Prelinger HTTP stream-slice, Wikimedia) with cutout guardrails
  3. index_sfx.py             -> Indexes assets/sfx/ across 6 folders & computes peakOffsetSec for frame-exact sync
  4. motion.js frames         -> Compiles `editorial` HyperFrames HTML + active-word karaoke + big FLUXD animated end-card
  5. motion.js render         -> Deterministic 1080p/4K MP4 (RTX NVENC / CPU libx264) + Canvas Storyboard HTML
  6. filmcraft_export.py      -> [ON-DEMAND ONLY] Multi-track FilmCraft timeline (.xml + .otio) + isolated VO/Music/SFX stems
```

## 1. Unified Visual System: FLUXD Kinetic Editorial (`--style editorial`)

Always read `references/editorial-motion-guidebook.md` first. All legacy fragmented styles have been pruned so **`editorial` (FLUXD Open Stage)** is the single flagship visual system across all discussions, book/film recommendations, cultural explainers, and data stories:

- **Open-Stage Swiss Grid (Zero Box Clutter)**: Built on Josef Müller-Brockmann's 12-column mathematical grid with `>= 40%` open background space (`#0E0E10` Anamorphic Carbon Dark or `#F4EFE6` Silver-Halide Paper Light).
- **Hard Cap of 2 Text Levels on Stage**: Every single-showcase `collage` shot displays at most **(1) One Hero `Instrument Serif` Claim** + **(2) One Floating Cutout or Movie/Archival Clip** (no `sub` paragraph and no `#01 / #02 / #03` stacked callout bars).
- **Non-Boxy Emphasis**: `*word*` renders in `#FACC15` Italic Editorial Serif (`Instrument Serif Italic`); `[phrase]` renders with a continuous `#E04826` vermilion brush underline (never separate per-word sticker boxes).
- **Sequential Multi-Card Showcase (`collage`)**: When a scene has 2–3 media items (e.g., English Audible cover, Hindi Audible cover, and print book edition in Beat 14), `editorial` arranges them in a clean gallery grid (`.ed-multi-grid`) and pops each card + its label in sequentially at `mediaTimes`.
- **Prominent Animated FLUXD Brand End-Card (`cta` / `outro` & `bumper`)**: Every scene carries the `Φ-2 + [ FLUXD ]` lockup in the top header and the `Φ-2` seal badge in the bottom-right corner. At the very end of the reel (`cta` / `outro` / `bumper`), `MD.fluxdEndCardHero` renders a **massive `734px`-wide animated FLUXD Brand Stage** that runs the **Chamfered-Bracket `Φ-2` Shutter Blink (`Blink 01A / 04`) $\rightarrow$ Framed `[ FLUXD ]` Binary Phase Strobe (`Blink 03`: `[ F_U_D ] ⇄ [ _L_X_ ]`) $\rightarrow$ Full Hero Lockup** in the final seconds so your logo and logo animation are big and unmistakable at the end of every video.

## 2. In-Canvas Active-Word Karaoke Subtitles Only (`MD.karaokeSub` — No `.srt` Files)

External `.srt` (`subtitle.srt` / `captions.srt`) files are obsolete and disabled. Whenever `"subtitles": true` (default) and a scene has `vo` text:
- `voiceover_sync.py`, `compose.js`, and `build_canvas.py` automatically populate `s.words = [{ "text": "Right", "start": 0.0, "end": 0.28 }, ...]` on every scene in `video.json`.
- `kit.js` groups spoken words into **3 to 5 word phrase chunks** in Zone 3 (`bottom: 11%` on `9:16`).
- As the playhead $t$ passes through each word (`word.start <= t < word.end`), the **currently spoken word** lights up in `#FACC15` (Editorial Gold) at `scale(1.08)` and `opacity: 1.0`, while sibling words in the phrase sit at dimmed white (`opacity: 0.42`).

## 3. Unified Movie Footage & Public-Domain Archival Grabber (`scripts/fetch_archive_footage.py`)

Grab both **movie/cinema clips** and **public-domain archival footage** across 5 sources:

```bash
# 1. Auto-fetch movie & archival clips for all beats in video.json / script.json
#    (Automatically skips generic archiveQuery stock on beats that already have a primary cutout!)
python3 <SKILL_DIR>/scripts/fetch_archive_footage.py "$WORK" --auto

# 2. Grab a spoken movie/TV dialogue clip (GetYarn MP4 + PlayPhrase / Clip.Cafe / QuoDB links)
python3 <SKILL_DIR>/scripts/fetch_archive_footage.py --source movie --dialogue "I am become Death" --out "$WORK/assets/movie-01.mp4"

# 3. Slice an exact movie scene or trailer window from YouTube via yt-dlp --download-sections
python3 <SKILL_DIR>/scripts/fetch_archive_footage.py --source ytslice --yt-url "https://www.youtube.com/watch?v=VIDEO_ID" --section "01:12-01:18" --out "$WORK/assets/movie-02.mp4"

# 4. Search & download public-domain film shots from Moving Image Archive (24 curated collections)
python3 <SKILL_DIR>/scripts/fetch_archive_footage.py --source mia --query "cinema projector lens" --out "$WORK/assets/broll-01.mp4"

# 5. HTTP stream-slice public-domain archival films from Internet Archive / Prelinger / NASA
python3 <SKILL_DIR>/scripts/fetch_archive_footage.py --source ia --query "Apollo 11 launch" --collection nasa --start 00:00:10 --dur 6 --out "$WORK/assets/broll-02.mp4"
```

## 4. Step-by-Step Production Workflow

### Step 1: Initialize Project (`--style editorial` is default)
```bash
node <SKILL_DIR>/scripts/motion.js new "$WORK" --style editorial --format 9:16 --wpm 145
```

### Step 2: Sync Continuous Voiceover (Silence Trim First + Gentle `atempo` <= 179s + Karaoke Words)
```bash
python3 <SKILL_DIR>/scripts/voiceover_sync.py "$WORK" --audio /path/to/voiceover.mp3
```

### Step 3: Fetch Movie & Archival Clips + Index Local SFX (`peakOffsetSec`)
```bash
python3 <SKILL_DIR>/scripts/fetch_archive_footage.py "$WORK" --auto
python3 <SKILL_DIR>/scripts/index_sfx.py "$WORK"
```

### Step 4: Render Contact Sheet, Build Interactive Canvas Storyboard & Render 60fps MP4
```bash
node <SKILL_DIR>/scripts/motion.js frames "$WORK"
python3 <SKILL_DIR>/scripts/build_canvas.py "$WORK" <output-dir>/<slug>_storyboard.html
node <SKILL_DIR>/scripts/motion.js render "$WORK" --res 1080p --fps 60 --skip-review
```

### Step 5: Export Self-Contained Local Render Bundle (`export_render_bundle.py` — Hybrid Web -> Local Linux Mode)
Whenever running on **Gemini Web** (so the creator gets the flagship model + Nano Banana cutouts on Web and only uses their local Linux RTX 3050 for final 60fps MP4 encoding with zero API/billing required), ALWAYS export a `<slug>_local_render_bundle.zip`:
```bash
python3 <SKILL_DIR>/scripts/export_render_bundle.py "$WORK" <output-dir>/<slug>_local_render_bundle.zip
```
The creator simply unzips `<slug>_local_render_bundle.zip` on Linux and runs `bash render_local.sh` (zero Gemini API key or billing needed).

### Step 6 (On-Demand Only): Export Editable Multi-Track FilmCraft Project (`filmcraft_export.py`)
Do **NOT** export a separate FilmCraft project bundle unless the creator asks for the editable project / whole file (e.g., *"give me the whole file"*, *"export for FilmCraft"*, or *"let me edit the audio/elements in FilmCraft"*). When requested:
```bash
# Export standalone FilmCraft project (.zip or folder) with FCP7 XML + OpenTimelineIO + isolated audio/video stems:
python3 <SKILL_DIR>/scripts/filmcraft_export.py "$WORK" --out <output-dir>/<slug>_filmcraft_project.zip
# Or bundle it directly inside the local render bundle:
python3 <SKILL_DIR>/scripts/export_render_bundle.py "$WORK" <output-dir>/<slug>_local_render_bundle.zip --filmcraft
```
Inside FilmCraft on Linux (**File ▸ Import** $\rightarrow$ `<slug>_filmcraft_timeline.xml` or `<slug>_filmcraft_timeline.otio`), the creator gets:
- **V1**: Per-beat sliced scene clips (`scenes/beat_01_s1.mp4`, ...)
- **V2**: Raw cutouts, empirical plots, and visual cards aligned to each beat (`assets/cutout-s1.png`, ...)
- **A1**: Untouched `1.00x` Voiceover broken into per-beat clips (`stems/vo_beats/beat_01_s1_vo.wav`, ...) + master voiceover (`stems/A1_voiceover_master.wav`)
- **A2**: Isolated Background Music Score stem (`stems/A2_music_score.wav` — zero VO, zero SFX)
- **A3 / A4**: Individual timestamped SFX cue WAVs (`stems/sfx_cues/sfx_01_whoosh_1.40s.wav`, ...) + consolidated SFX stem (`stems/A3_sfx_master.wav`)

### Untouched 1.00x Natural Voiceover Default & Web-Curated In-Grid Media Rule
- **Preserve Natural Speech Cadence (`1.00x` Default)**: Do NOT apply aggressive `silenceremove` or `atempo` speed-ups by default, as `silenceremove` can clip voiceless plosives (`p`, `t`, `k`) inside words like *"perspectives"* or *"walking"*. Always use `ffmpeg silencedetect` as a **read-only acoustic pause detector** to map exact clause boundaries and lock `s.dur` and `s.words` (`[word, startSec, endSec]`) to the untouched `1.00x` master recording.
- **Exact Scene Duration Fidelity (`compose.js` & `build_canvas.py`)**: Never quantize explicit `s.dur` values to musical half-beats when a voiceover track is present; preserve exact `0.001s` scene durations so cumulative karaoke and scene transitions never drift.
- **Strict In-Grid Visual Cards (Zero Full-Screen Background Overlays)**: Never run unverified `fetch_archive_footage.py --auto` on the user's local machine and never inject full-screen `.md-bg-video` overlays in `editorial` mode. Curate and bundle all visual cards, posters, cutouts, and motion graphics inside the web workspace, and mount them strictly inside framed Swiss-grid cards (`.ed-seq-card` / `.ed-hero-img-wrap`).

### v3 Architectural Upgrades: Continuous Spring Physics, Multi-Stem Score, GPU Rasterization & In-Grid PiP Video
1. **Continuous Kinetic Micro-Motion & Spring Whip-Pop Entrances (`cardWhipIn` + `editorial.js` `scene.run`)**:
   - Every newly appearing element (`.ed-seq-card`, `.ed-hero-img-wrap`, `.ed-pip-video-card`, callouts) enters via `cardWhipIn` with 3D perspective tilt (`rotationX: 16deg`), directional velocity skew (`skewY`), spring overshoot (`expo.out` -> `sine.inOut`), and inner image brightness flash.
   - When sequential card `#2` or `#3` pops in at `s.mediaTimes[i]`, earlier cards dynamically recede in Z-space (`scale: 0.955, y: -6, opacity: 0.86`) while the stage box executes a camera impulse (`scale: 1.016 -> 1.0`).
   - Throughout the entire scene, `scene.run` applies continuous 2.5D parallax floating (`scale: 1.01 -> 1.095`, counter-rotation `±0.9deg`) and triggers a sub-beat kinetic micro-impulse every `2.2s` so zero frames ever sit static.
2. **Cinema-Grade Multi-Stem `editorial` Score (`lib/audio.js`)**:
   - Uses the dedicated `editorial` preset (`92 BPM` Dorian/Minor, `bowedString` cello/sarangi dual-formant swells, `reeseBass` analog sub-bass, `taikoTom` frame-drum transients, `cinemaArp` felt plucks, and automatic pre-transition `fxRiser` swells at scene boundaries) with dynamic voiceover pause ducking.
3. **True NVIDIA GPU Hardware Rasterization in Headless Chrome (`local_renderer.py`)**:
   - Exports `__NV_PRIME_RENDER_OFFLOAD=1`, `__GLX_VENDOR_LIBRARY_NAME=nvidia`, and `__VK_LAYER_NV_optimus=NVIDIA_only` alongside `--use-gl=egl`, `--use-angle=vulkan`, `--enable-features=Vulkan,FromDrdc,VaapiVideoDecodeLinuxGL,CanvasOopRasterization`, `--disable-vulkan-surface`, `--enable-gpu-rasterization`, and `--force-gpu-rasterization` so Linux hybrid laptops offload DOM/Canvas/3D compositing onto the discrete NVIDIA RTX GPU instead of CPU SwiftShader.
4. **Framed In-Grid PiP Video Monitor Cards (`.ed-pip-video-card`) & Verified Footage Slicing**:
   - Video clips (`.mp4`/`.webm`) are NEVER used as full-screen `.md-bg-video` overlays. In `editorial` mode, `MD.media()` mounts any video clip inside a framed `.ed-pip-video-card` monitor window (`REC ● // ARCHIVE FEED`) inside the 12-column Swiss grid.
   - `fetch_archive_footage.py` enforces `BLACKLIST_TERMS` filtering, semantic token matching (`is_safe_relevant_item`), and skips opening title/credit cards so only verified content frames are sliced.

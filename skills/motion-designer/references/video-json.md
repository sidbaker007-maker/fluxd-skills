# `video.json` Schema & Scene Reference

```jsonc
{
  "title": "The Halide Paradox",        // shown on the storyboard; names the output MP4 & SRT
  "brief": "…their outline or central anomaly hypothesis…",
  "purpose": "investigative explainer",
  "axis": "AXIS A · OPTICS × CINEMA",   // optional top-level HUD badge for polymath/vox styles
  "source": "SMPTE / CIE Tables",       // optional default repository citation
  "style": "vox",                       // polymath | vox | data | terminal | keynote | kinetic | aura | paper | story
  "alternates": ["polymath", "data"],   // two alternate styles shown live on the storyboard
  "format": "16:9",                     // 16:9 (YouTube Feature) | 9:16 (Short / Reel) | 1:1 | 4:5
  "length": null,                       // target total seconds (e.g. 20, 30, 60), or null = natural (VO / reading time)
  "wpm": 135,                           // spoken voiceover pacing in Words Per Minute (default 135)
  "captions": "off",                    // "kinetic" (word-by-word highlight) | "bar" (lower subtitle bar) | "off" (clean video + .srt file)
  "subtitles": false,                   // alias for captions ("kinetic" or true/false)
  "transparent": false,                 // set true (or pass --alpha to render) for ProRes 4444 transparent NLE overlays
  "font": 0,                            // index into the style's font pairings
  "palette": 0,                         // index into the style's palettes
  "why": { "style": "…", "format": "…", "length": "…" },
  "brand": { "name": "POLYMATHTV", "url": "", "color": null, "logo": null },
  "sound": {
    "sfx": "on",
    "music": "auto",                    // "auto" (synthesized -16 LUFS) | "none" | "assets/custom-music.mp3"
    "voiceover": null,                  // optional "assets/voiceover.mp3" (auto-ducks music bed under speech)
    "preset": null,
    "bpm": null,
    "musicVolume": 0.8
  },
  "drift": null, "grain": null,         // override camera drift / film grain
  "scenes": [ … ]
}
```

## Per-Scene Common Fields

Every scene object supports:

- `kind`: Scene archetype (see table below)
- `dur`: Explicit duration in seconds (overrides auto reading/VO timing)
- `timestamp`: Storyboard time window, e.g. `"0:00 - 0:08"` or `"0:08 - 0:22"`
- `vo`: Spoken voiceover narration (~135 WPM) with inline `[AUDIO PAUSE: 1.5s]` support (drives scene duration, pause ducking, kinetic captions, and `.srt` export even when you record your own voiceover separately)
- `pause`: Numeric audio pause in seconds added to the end of the scene
- `bgVideo`: Path to a raw video clip or movie scene (`"assets/movie-clip-01.mp4"`) rendered as a background layer (`bgOpacity` defaults to `0.38`; describe what clip is needed in `bgNote`)
- `cutout`: Path to a raw `.jpg`/`.png` image (`"assets/photo.jpg"` or `"auto"`, or `{ "src": "assets/photo.jpg", "color": false, "label": "EXHIBIT A" }`) — automatically processed into a Vox archival halftone cutout with a white die-cut sticker border (describe what image is needed in `assetNote`)
- `sfxFile`: Path to a custom sound effect or voice effect (`"assets/projector.wav"` or `"assets/whoosh.mp3"`), mixed at `sfxAt` seconds into the scene (describe what sound is needed in `sfxNote`)
- `plot`: Python Matplotlib specification (`{ "type": "timeseries" | "phase" | "sensitometry" | "spectrum" | "barcode" | "splane", ... }`) — auto-renders a high-DPI figure into `assets/plot-sN.png`
- `movement` / `figure`, `axis`, `source`: HUD telemetry and citation metadata

## All Scene Kinds (20 Built-In Kinds)

| Kind | Fields | Best Used For |
| :--- | :--- | :--- |
| `map` | `kicker?`, `title?`, `sub?`, `origin?` (`{name, coord, x, y}`), `dest?` (`{name, coord, x, y}`), `distance?`, `metrics?`, `callouts?` | **Geographic Map & Route Flyover**: animated route trajectory across a vector world/regional graticule with pulsing coordinate nodes and telemetry cards |
| `collage` | `kicker?`, `title?`, `sub?`, `media?` (1-3 `.jpg`/`.png`/`.mp4` paths, or auto-generated via `cutout`), `callouts?`, `annotation?` (`"circle" \| "arrow"`), `color?` (`bool`) | **Vox / Howtown Cutout Collage**: layered die-cut photo/video cutouts, ransom-tape callouts, highlighter sweeps, and hand-drawn SVG chalk circles/arrows |
| `math` | `kicker?`, `title?`, `equation?`, `transform?`, `sigma?`, `wd?`, `wExt?`, `callouts?` | **3Blue1Brown Mathematical Engine**: semantic color-coded differential equation $\rightarrow$ Laplace transform, live time-domain waveforms (`#F0AC5F`, `#FFFF00`, `#58C4DD`), 14-coil spring-mass oscillator, and 2D $s$-plane poles |
| `anomaly` | `kicker?`, `myth`, `text` (or `title`), `value?`, `label?`, `source?` | **Premise Inversion**: states the common myth, strikes it through, and reveals the empirical contradiction + metric |
| `telescope` | `kicker?`, `title?`, `scales` (or `items`: 3 `"Scale \| Title \| Detail"` strings) | **Telescoping Scale Jump**: 3-stage micro -> meso -> macro zoom with concentric vector rings |
| `pivot` | `kicker?`, `title?`, `threadA` (`{label, time?, title?, items[]}`), `threadB` (`{label, time?, title?, items[]}`) | **McPhee Structural Pivot**: braids two parallel timelines in `--accent` and `--accent2` around a central `PIVOT` lock |
| `telemetry` | `kicker?`, `title?`, `sub?`, `media?` (or `plot?`), `diagram?` (`"optics" \| "phase" \| "spectrum" \| "network"`), `metrics?`, `callouts?` | **Signature Telemetry Overlay**: frames a Matplotlib plot, 3D `splane` surface, video clip, or SVG schematic with readouts & reticles |
| `hook` | `text`, `kicker?`, `sub?` | Opening inciting anomaly or scroll-stopping hook |
| `statement` | `text`, `kicker?`, `sub?` | Core thesis statement or philosophical resolution |
| `stat` | `value`, `label`, `kicker?`, `delta?`, `trend?`, `note?` | Single high-impact empirical number that counts up |
| `line` | `title?`, `kicker?`, `values[]`, `labels[]?`, `unit?`, `prefix?`, `note?` | Animated time-series trajectory with moving head dot |
| `chart` | `title?`, `kicker?`, `bars[]`, `unit?`, `note?` | Comparative bar distribution |
| `rank` | `title?`, `kicker?`, `items[]`, `unit?`, `prefix?` | Horizontal comparative ranking bars |
| `donut` | `title?`, `kicker?`, `value` (`"74%"`), `label?`, `note?` | Proportional share ring chart |
| `compare` | `title?`, `before: {label, items[]}`, `after: {label, items[]}` | Old way vs new way |
| `steps` | `title?`, `items[]` (3-4 numbered steps) | Causal chain or mechanical sequence |
| `list` | `title?`, `items[]` (3-4 findings) | Key evidence summary |
| `words` | `items[]` (2-5 short words/phrases) | Fast kinetic lexicon beat |
| `screen` | `media`, `device?`, `title?`, `sub?`, `kicker?`, `callouts[]?` | Artifact, screenshot, or video specimen inside a frame |
| `screens` | `media[]` (2-4), `device?`, `title?` | Side-by-side frame or specimen comparison |
| `quote` | `text`, `name`, `role?`, `media?` | Primary archival quote or citation |
| `logo` / `outro` / `custom` | Standard closing or custom HTML/GSAP scenes | Stings, outros, or bespoke markup |

# `video.json` Schema & Scene Reference

```jsonc
{
  "title": "The Halide Paradox",        // shown on the storyboard; names the output MP4
  "brief": "…their outline or central anomaly hypothesis…",
  "purpose": "investigative explainer",
  "axis": "PHYSICS · CINEMA · SYSTEMS", // optional top-level HUD badge for pulse/polymath/vox styles
  "source": "SMPTE / CIE Tables",       // optional default repository citation
  "style": "pulse",                     // pulse | polymath | vox | data | terminal | keynote | kinetic | aura | paper | story
  "alternates": ["polymath", "vox"],    // two alternate styles shown live on the storyboard
  "format": "9:16",                     // 16:9 | 9:16 | 1:1 | 4:5
  "length": null,                       // target total seconds (e.g. 20, 30, 50), or null = natural (VO / reading time)
  "wpm": 185,                           // spoken voiceover pacing in Words Per Minute (185 for 9:16 pulse reels, 135 for essays)
  "subtitles": true,                    // optional: show spoken VO caption bar
  "transparent": false,                 // set true (or pass --alpha to render) for ProRes 4444 transparent NLE overlays
  "font": 0,                            // index into the style's font pairings
  "palette": 0,                         // index into the style's palettes (0 = Acid Fuse, 1 = FLUXD Halation & Volt)
  "why": { "style": "…", "format": "…", "length": "…" },
  "brand": { "name": "FLUXD", "url": "@fluxd.tv", "color": null, "logo": null },
  "sound": { "sfx": "on", "music": "auto", "preset": null, "bpm": null, "musicVolume": 0.8 },
  "drift": null, "grain": null,         // override camera drift / film grain
  "scenes": [ … ]
}
```

## Mixed Typography Tokens in `title` & `text`

- `*word*`: Emphasizes the word (in `pulse` style, renders in **Accent Italic Editorial Serif** `Instrument Serif Italic`; in `vox` style, sweeps a yellow highlighter bar behind it).
- `[word]` or `[multi word]`: Wraps the word(s) inside a **`-2deg` tilted solid accent pill box** with dark ink text (e.g., `"Retention [3 sec] pe drop | [hook] nahi *galti* se"`).
- `|`: Forces an explicit line break.

## Per-Scene Common Fields

Every scene object supports:

- `kind`: Scene archetype (see table below)
- `dur`: Explicit duration in seconds (overrides auto reading/VO timing)
- `chapter`: Chapter label for `pulse` top HUD (e.g. `"RETENTION"`, `"1 GALTI + 3 STEPS"`, `"REHOOK"`, `"END ON PAYOFF"`)
- `stage`: Retention arc stage badge (`"HOOK" | "DELAY" | "REHOOK" | "PAYOFF"`)
- `tone`: Set `"accent"` on 1-2 pivotal scenes per Reel to fire a **Full-Screen `RANG` Colour-Flash Inversion** (`#CCFF00` or `#E04826` background with `#0B0D0B` dark ink)
- `transition`: `"matchCut" | "cornerDock" | "rangFlash" | "vecScan" | "vxWhip" | "cut"`
- `timestamp`: Storyboard time window, e.g. `"0:00 - 0:04"`
- `vo`: Spoken voiceover narration with inline `[AUDIO PAUSE: 0.4s]` support
- `bgVideo`: Path to a raw video footage file (`"assets/broll.mp4"`)
- `cutout`: Path to a raw `.jpg`/`.png` image processed into a Vox halftone die-cut sticker
- `plot`: Python Matplotlib specification (`{ "type": "timeseries" | "phase" | "sensitometry" | "spectrum" | "barcode" | "splane", ... }`)

## All Scene Kinds (25 Built-In Kinds)

| Kind | Fields | Best Used For |
| :--- | :--- | :--- |
| `rehook` | `title?`, `sub?`, `mode` (`"drop" \| "spring" \| "payoff"`), `value?` (`"12%"`), `label?`, `mythA?`, `mythB?`, `badge?` (`"? 1 GALTI"`) | **Retention Curve & Rehook Machine (Reel 2)**: Live retention graph with 7 cartoon eyeball rollers falling off the 3-second cliff (`drop`), bounced back up by a 10-coil mechanical spring (`spring`), or snipped by scissors right at `PAYOFF` (`payoff`). |
| `unlock` | `title?`, `sub?`, `items[]` (`"01 \| RANG \| Detail"`), `unlocked` (`int`), `unlockIndex?` (`int`), `stamp?` (`"KOI NAHI KARTA"`), `stage?`, `cta?` (`"save kar lo"`) | **Progressive Blurred-to-Unlocked Checklist (Reel 1 & 2)**: Shows numbered roadmap where future items stay frosted/blurred (`filter: blur(5.5px)`) and padlocked (`🔒`), unlocking live mid-scene (`✓`) above a `[ HOOK \| DELAY \| REHOOK \| PAYOFF ]` progress strip. |
| `fuse` | `title?`, `tag` (`"01 RANG" \| "02 ZOOM" \| "03 CUT"`), `mode` (`"rang" \| "zoom" \| "cut"`), `callouts[]?` | **2-Second Bomb Fuse & Visual Lever (Reel 1)**: Spherical bomb with a live burning wick sparkler (`1.8s -> 1.1s`), paired with 5 colour swatches (`rang`), `[ REC 1.35x ]` viewfinder zoom brackets (`zoom`), or a clapperboard (`cut`). |
| `props` | `title?`, `words[]` (`"Keyword \| icon-name"`), `rule?` (`"1 WORD = 1 PROP · 1 EVENT = 1 SOUND"`) | **Word-to-Prop & Audio-Visual Sync (Reel 1 `04 AWAAZ` & `05 NAYI CHEEZ`)**: Spawns a tactile vector prop box above each keyword alongside a live 28-bar pulsing audio waveform (`POP · WHOOSH · DING`). |
| `cta` | `title?`, `keyword` (`"FLUX"`), `deckLabel?` (`"20 IDEAS"`), `sentText?` (`"blueprint bhej diya ✓"`) | **Interactive Comment Trigger & Fanned 20-Card Deck (Reel 1 & 2)**: Types the trigger word into a dark glass `Comments` box with `+37 ❤️`, fans out a 3D stack of numbered cards (`11..20`), and pops the confirmation pill. |
| `collage` | `kicker?`, `title?`, `sub?`, `media?`, `callouts?`, `annotation?` (`"circle" \| "arrow"`), `color?` (`bool`) | **Vox / Howtown Cutout Collage**: layered die-cut photo/video cutouts, ransom-tape callouts, highlighter sweeps, and hand-drawn SVG chalk circles/arrows |
| `math` | `kicker?`, `title?`, `equation?`, `transform?`, `sigma?`, `wd?`, `wExt?`, `callouts?` | **3Blue1Brown Mathematical Engine**: semantic color-coded differential equation $\rightarrow$ Laplace transform, live time-domain waveforms, 14-coil spring-mass oscillator, and 2D $s$-plane poles |
| `anomaly` | `kicker?`, `myth`, `text` (or `title`), `value?`, `label?`, `source?` | **Premise Inversion**: states the common myth, strikes it through, and reveals the empirical contradiction + metric |
| `telescope` | `kicker?`, `title?`, `scales` (or `items`: 3 `"Scale \| Title \| Detail"` strings) | **Telescoping Scale Jump**: 3-stage micro -> meso -> macro zoom with concentric vector rings |
| `pivot` | `kicker?`, `title?`, `threadA`, `threadB` | **McPhee Structural Pivot**: braids two parallel timelines in `--accent` and `--accent2` around a central `PIVOT` lock |
| `telemetry` | `kicker?`, `title?`, `sub?`, `media?` (or `plot?`), `diagram?`, `metrics?`, `callouts?` | **Signature Telemetry Overlay**: frames a Matplotlib plot, 3D `splane` surface, video clip, or SVG schematic with readouts & reticles |
| `hook` / `statement` / `stat` / `line` / `chart` / `rank` / `donut` / `compare` / `steps` / `list` / `words` / `screen` / `screens` / `quote` / `logo` / `outro` / `custom` | Standard motion-design scene archetypes | General typographic, chart, comparison, and device scenes |

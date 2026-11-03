# Deciding from an Outline or Polymathic Blueprint

Turn a short prompt or a `polymathic-investigative-director` blueprint into five concrete decisions, each with a one-line `why`. Every decision is a live toggle on the Storyboard.

## 1. Purpose & Workflow Mode

| Signal in the Prompt / Blueprint | Purpose | Primary Job |
| :--- | :--- | :--- |
| `polymathic-investigative-director` blueprint, Axis A-D, 6-Movement essay, 5-Stage Reel, "investigative explainer" | **investigative explainer** | Falsify a surface myth with empirical data, physical laws, and kinetic visuals timed to ~135 WPM voiceover |
| Numbers, "results", "grew", "report", GDELT, UN Comtrade, Cinemetrics | **data story** | Anchor the thesis in one unmistakable metric, trajectory, and takeaway |
| "explain", "how it works", mechanism, paradox | **explainer** | Show the anomaly, the mechanism in 3 steps or scales, and the systemic resolution |
| "launch", "introducing", "new", "we just shipped" | **launch** | Name it, show it, state why it matters, and where to get it |
| Screenshots, "my app", "SaaS", "dashboard" | **product demo** | Every claim proven on a real hardware frame |
| "hook", "for X", "viral", "Reel", "Short" | **social hook / reel** | Stop the scroll in second 1; invert the assumption; close hard |

## 2. Style (8 Built-In Styles)

- **Polymath (`polymath`)** - Deep obsidian dark-mode (`#0B0B0B`), 35mm film grain, vector registration reticles, dual functional accent tokens (`--accent` & `--accent2`), and empirical repository HUD (`FIG. 01 // MOVEMENT`, `SOURCE // ...`, `TC 00:00:00:00`). Default for `polymathic-investigative-director` features and Reels across Axes A-D.
  - Palettes: `0 = Obsidian` (Vermilion + Cyan), `1 = Halide` (35mm Tungsten Amber + Anamorphic Blue), `2 = Sovereign` (Deficit Crimson + Comtrade Teal), `3 = Chalkboard` (Chalk Gold + Phase Vector Blue).
  - Fonts: `0 = Space Grotesk` (Editorial Telemetry), `1 = McPhee Serif` (Instrument Serif literary non-fiction), `2 = Formalist` (Fraunces serif), `3 = Telemetry Tight` (Inter Tight).
- **Data (`data`)** - Drafting grid with rulers, mono labels, animated line/bar/donut/rank charts, and leader-line annotations. Ideal for research reports and quantitative breakdowns (`Palette 2 = Terminal` or `3 = Midnight` for dark mode).
- **Terminal (`terminal`)** - Monospace `$` prompt typing, glyph scramble decoding, phosphor scan band, and git-diff comparisons. Ideal for computational pipelines, code, and systems logs.
- **Keynote (`keynote`)** - Black stage with sweeping light, 3D hardware reveals, and gradient-sheen typography. Ideal for hardware, optical instruments, or software demos.
- **Kinetic (`kinetic`)** - Giant grotesque poster type that stretches and slams on the beat, flipping between paper, ink, and accent tones.
- **Aura (`aura`)** - Soft glowing dusk orb over frosted glass cards and dot-matrix numbers.
- **Paper (`paper`)** - Warm editorial paper with organic SVG pebbles, hand-underlined italic serifs, and tilted sticker cards.
- **Story (`story`)** - Flat illustrated characters acting out a scenario in simple sets with speech bubbles.

Always pick a primary `style` plus two `alternates` (for investigative explainers, `"style": "polymath", "alternates": ["data", "terminal"]` or `["data", "keynote"]`).

## 3. Format

| Target Platform / Deliverable | Format | Resolution |
| :--- | :--- | :--- |
| YouTube Feature (15-30 min movements), X/Twitter, Desktop Web | `16:9` | `1920x1080` |
| Companion Reel (1-3 min 5-Stage short), YouTube Shorts, TikTok | `9:16` | `1080x1920` |
| Square Feed / Carousel | `1:1` | `1080x1080` |
| Vertical Feed | `4:5` | `1080x1350` |

## 4. Length & Voiceover Pacing

| Clip Type | Typical Runtime | Scenes | Timing Strategy |
| :--- | :--- | :--- | :--- |
| Single Movement / Scene Clip | 15-35 s | 4-7 | `"length": null` + `"vo"` at `"wpm": 135` (or explicit `"length": 20` / `30`) |
| 5-Stage Companion Reel | 45-90 s (up to 180 s) | 6-12 | `"wpm": 135` with `"vo"` + `[AUDIO PAUSE: Xs]` per stage |
| Full Multi-Movement Explainer | 60-180 s | 8-18 | `"timestamp": "MM:SS - MM:SS"` per scene or `"vo"` pacing |
| Product Launch / Promo | 20-35 s | 6-9 | Reading-time auto-fit or `"length": 25` |

## 5. Scene Architecture for Polymathic Explainers

- **5-Stage Short-Form Reel (1-3 min)**:
  1. **Hook** (`hook` or `anomaly`): Counter-intuitive visual/data hook in <= 8 on-screen words.
  2. **Surface Myth** (`anomaly` or `compare`): State the common assumption and fracture it.
  3. **Scientific Pivot** (`telescope` or `pivot`): Execute a Telescoping Scale Jump (Micro -> Meso -> Macro) or McPhee Structural Braid.
  4. **Empirical Proof** (`telemetry`, `line`, `chart`, `rank`, or `stat`): Show the Matplotlib dark-mode figure, vector schematic, or time-series proof with repository citation (`source`).
  5. **Mic-Drop Close** (`statement` or `outro`): Final philosophical/systemic synthesis with `[AUDIO PAUSE: 2s]`.

- **6-Movement Long-Form Feature Clips**:
  Generate either a unified multi-movement overview clip or one dedicated motion clip per Movement (I: Inciting Anomaly -> II: Surface Myth -> III: Empirical Investigation -> IV: Cinematic Anatomy -> V: Systemic Diagnosis -> VI: Philosophical Resolution).

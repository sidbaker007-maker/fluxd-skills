# Lemo-Opuscar Complete Engineering & Directing Playbook (Adapted for FLUXD)

This reference contains the **complete, multi-section production specifications** adapted from [`lemomo-ai/lemo-opuscar`](https://github.com/lemomo-ai/lemo-opuscar) (`DIRECTOR.md` + `styles/*/STYLE.md`), integrated with FLUXD's `@content-director` and `@motion-designer` engines.

---

## 0. Mandatory FLUXD Override: Survey of India Map Compliance
> **CRITICAL OVERRIDE OF `DIRECTOR.md §13`**: The upstream `lemomo-ai/lemo-opuscar` repository contains a map rule (`DIRECTOR.md §13`) written for Chinese regulations (`admin_0_countries_chn`, depicting Arunachal Pradesh / "Zangnan" and Aksai Chin as part of China).
> **FLUXD Rule**: **NEVER apply `lemo-opuscar/DIRECTOR.md §13`.** On every map, globe, choropleth, or satellite view, strictly enforce **Survey of India** official external boundaries for the Republic of India (including the full territory of Jammu & Kashmir, Ladakh, and Arunachal Pradesh).

---

## 1. Master Directing Rules (`lemo-opuscar/DIRECTOR.md` §§1–12)

A film is judged in this strict order: **1. Sound -> 2. Rhythm -> 3. Camera -> 4. Directing (Performance, Staging, Emotional Arc)**. Good-looking frames are only the starting point.

### 1.1 Story Shape & Native Moves (§3)
- **One subject, one goal, one turn**: A single object, physical law, or economic indicator starts in one state, hits an empirical anomaly, and ends transformed.
- **Hook in the first 3 seconds**: Zero slow logo reveals before the action starts.
- **An ending that echoes**: Bookend the opening image, reveal the full scale, or return to the cold-open object with inverted meaning.
- **One Native Move at the Emotional Peak**: Every medium has a move only that medium can execute (a loupe diving into a negative, a satellite scanner bar tearing away a printed map, a red constructivist wedge colliding two clips, a chart axis growing out of a physical object). Place the signature native move at the climax.

### 1.2 Treatment Before Code (`TREATMENT.md`, §4)
Before rendering any long-form sequence, lock:
1. **3 Candidate Structures** (e.g., *Single Journey*, *Before/After Collision*, *Escalating Scale Jump*, *Forensic Clock*) and why the winner fits the data.
2. **Shot List**: Framing (`Wide / Full / Medium / Close / Insert`), camera move (`Push, Pull, Pan, Track, Log-Dive, Whip`), duration, and motivation.
3. **Cue Map & Sound Table**: Tempo/bar grid, ambience bed, material foley, and the **2 Mandatory Silences** (at least one true silence or `-25 dB` suck-out for `0.25–0.45s` right before the turn or heaviest data hit; the first sound after silence must be the most important sound in the film).

### 1.3 Rhythm & Reading-Time Math (`readcheck`, §7)
- **Subtitle Hold Floor**: Hold every subtitle or caption for **`>= max(1.8s, speech_duration + 0.6s)`**.
- **On-Screen Label Reading Floor**: After text finishes animating in, hold it on screen for at least **`(english_characters / 15) + 1.5 seconds`**.
- **Comparison Verdict Hold**: When comparing 2–4 options (bridges, policies, lenses, equations), hold all options fully visible for **`>= 2.5 seconds`** before striking the losers or highlighting the winner.
- **Audio J-Cuts & L-Cuts**: Use sound as a transition at least twice per video — bring the next scene's ambience/foley in `0.3–0.5s` early (J-cut) or let the previous scene's sound ring over the cut (L-cut).

### 1.4 Camera Grammar & Top 6 Failure Modes (§§8, 10)
- **4 Distinct Camera Moves Minimum**: Every piece must vary framing (wide context -> medium mechanism -> extreme close-up reading -> pull-back scale reveal). At key moments, the primary subject must fill **`>= 1/3` of frame height**.
- **World-to-Screen Coordinate Lock (`w2s()`)**: Annotations, circles, leader lines, and reticles must be anchored to **world/object coordinates**, never floating in screen space when the camera pans or zooms.
- **6 Failures to Eliminate**:
  1. Subject too small (`< 1/3` frame height) or pushed against the frame edge.
  2. Colour-on-colour collision (e.g., red text on a red band, or mid-tone text over a busy mid-tone photo).
  3. Subtitles covering the focal subject or bottom data axis (keep bottom `140–170px` clear at `1080p`).
  4. Blank/empty frames during transitions.
  5. Upscaled low-res archival video stretched full-screen (keep archival video `<= 2.5x` native pixel scale inside framed windows).
  6. Per-frame contrast pumping on archival clips (compute one luminance percentile pair `0.7 / 99.5` per clip).

---

## 2. Automatic Topic-to-Style Recommendation Matrix

When `@content-director` or `@motion-designer` plans a video, it automatically recommends the **#1 Primary Style + 2 Alternatives** (or a **Multi-Style Chapter Plan** across movements for `16:9` YouTube essays):

| Pillar / Topic Archetype | Format | #1 Primary Style | #2 & #3 Recommended Alternatives |
| :--- | :--- | :--- | :--- |
| **Faceless High-Retention Reel (Any Pillar)** | `9:16` | **`pulse` (`my-style`)** — 2-Second Fuse + 4-Stage Rehook HUD | **`caption-news`** (sound-off ledger), **`vox` (`diorama`)** |
| **Geopolitics, Borders, Maritime Chokepoints & Satellites** | `16:9` / `9:16` | **`journalism` (`VoxStage Hot-Red`)** or **`satellite`** (`satellite-briefing`) | **`visual-investigation`** (master clock + multi-source board), **`kino-montage`** |
| **India & Global Socio-Economics (RBI, MOSPI, UPI, Trade)** | `16:9` / `9:16` | **`journalism` (`Visual Journalism Dark`)** or **`data` (`dataviz`)** | **`iso-infographic`** (30° isometric system + Isotype icons), **`swiss-motion`** |
| **Archival History, Policy Documents & Cinema History** | `16:9` | **`vox` (`diorama` / `collage`)** or **`lighttable`** (`archive-lighttable`) | **`kino-montage`** (Constructivist red/ink montage), **`risograph`**, **`engraving`** |
| **M.Sc. Physics, Astrophysics, Derivations & Equations** | `16:9` / `9:16` | **`polymath` (`math` / `splane`)** | **`whiteboard`** (live stroke-order derivation), **`blueprint`** (`MG-BLUEPRINT`) |
| **Semiconductors (EUV), ISRO Space Hardware & Camera Lenses** | `16:9` | **`blueprint` (`Cyanotype Classic` / `Obsidian CAD`)** | **`teardown`** (exploded axial disassembly), **`briefing-board`**, **`circuit-board`** |

---

## 3. Full 11-Point Style Specifications (With Executable `motion-designer` Scene Kinds)

### Style A: `satellite-briefing` (Executable via `"kind": "satellite"` in `motion-designer`)
- **1. Essence**: Real georeferenced satellite/aerial imagery (Landsat/Sentinel-2/NASA GIBS) graded down to an analyst's grey (`#070B0E -> #A1A7A9`), with thin white `2px` measurement hairlines (`#F2F5F6`), a lock-on reticle, a ticked range line, and **one single reading in warm amber (`#FFBE55`)**. True colour appears at orbit and returns on the ground *only* where the story turns.
- **2. Materials & Rendering**:
  - **Analyst Grade Formula**: Convert RGB luminance with local contrast clarity, compress highlights so clouds/salt stay below pure white, and desaturate to `20%` chroma in cool blue-silver (`#070B0E -> #A1A7A9`).
  - **Scanner Bar Swap**: Time transitions between years (e.g., `1994 -> 2026`) never cross-dissolve; a soft horizontal or vertical **satellite pass scan bar** wipes North->South (forward in time) or South->North (rewind), leaving the old shoreline/border as a dashed vector contour.
  - **Screen vs. World Space**: Only corner instruments (altitude `ALT 420 KM`, scale bar, imagery credit) and bottom-left transcript strip sit in screen space; all reticles, range lines, and labels attach to ground coordinates.
- **3. Colour Logic**: Ground `#070B0E -> #A1A7A9`; Measured Hairlines `#F2F5F6`; Active Reading `#FFBE55` (Amber) or `#E04826` (FLUXD Vermilion); Claim/Historical Map Overlay `rgb(46, 112, 206)`.
- **4. Typography**: Condensed Grotesk for primary metric reading (`96–130px`); `JetBrains Mono` / `IBM Plex Mono` (`20–34px`) for coordinates, dates, and altitude; `Inter` / `Plus Jakarta Sans` (`24–42px`) for ground leader labels.
- **5. Motion Quality**: Camera distance interpolates in **logarithmic space (`log(z)`)** so orbital-to-ground dives feel smooth; locked nadir frames keep a `2–5%` slow creep.
- **6. Camera Grammar**:
  | Move | What It Expresses | Best Use Case |
  | :--- | :--- | :--- |
  | **Oblique orbit, planetary limb in frame** | Global scale, context, distance | Cold open; title card; final zoom-out |
  | **Log Dive (orbit -> nadir)** | Going to verify a claim yourself | Revealing the physical bottleneck or site |
  | **Locked nadir frame + time scan** | Hard empirical evidence | Showing glacier retreat, port expansion, or deforestation across years |
  | **Track along a range line** | Measuring physical distance | Strait width (Hormuz/Malacca), border corridor, pipeline length |
  | **Whip pan with directional blur** | "Meanwhile" at the same altitude | Comparing two ports, two rivers, or two cities at identical scale |
- **7. Sound Palette**: FM lock-on pings, dry grid ticks that subdivide as the range line accelerates, low-pass pulse bass, `0.3s` `-25 dB` suck-out before key measurement hits.
- **8. Native Moves**: (1) *The Map Against the Photograph* (scanner bar wipes printed map to reveal real satellite ground underneath); (2) *Time Rings in a Locked Frame*; (3) *The Range Line* (ticked line grows from A to B while counter rolls up); (4) *Colour Returns Where the Story Turns*.
- **9. Pitfalls to Avoid**: Never use uncredited proprietary imagery; always burn the dataset credit (`USGS Landsat / ESA Sentinel-2`) in the corner at `>=20px`.

---

### Style B: `archive-lighttable` (Executable via `"kind": "lighttable"` in `motion-designer`)
- **1. Essence**: Real archival objects (glass negatives, 35mm contact sheets, RBI/colonial ledgers, letters, telegrams, patents, newspaper clippings) lie on a cool, backlit near-white light table (`#E8ECEF`). A **magnifying loupe (`2.5x`)** lands on an object (`0.4s` ease-out), and **inside the loupe lens the object changes state**: a negative turns positive, a single line of text illuminates while surrounding text dims, a number lifts off the page into a reading card, or a still photograph opens into 2.5D parallax depth.
- **2. Materials & Rendering**:
  - **Light Table**: Cool backlit surface (`#E6EAEE` with subtle `100 Hz` ballast hum vibe); paper edges glow warm where light transmits through them; opaque objects cast soft contact shadows.
  - **The Loupe**: Circular lens with a dark anodized bevel ring, clear acrylic skirt refracting the table, `2.5x` magnification inside with subtle pincushion (`k ≈ 0.16`) and RGB chromatic fringe at the rim. Scales from `1.35x -> 1.0x` on landing (`0.4s` ease-out).
  - **Zero Fake Vintage Filters**: No sepia overlay, no fake film damage. The age lives strictly inside the real archival scan.
- **3. Colour Logic**: Table `#E6EAEE`; Archive Tans & Silver Greys; Ink `#111315`; Single Signal Colour `#E04826` (FLUXD Halation Vermilion) or `#FF5A1F` (Signal Orange) strictly for underlines, crop corners, anchor rings, and verdict readings.
- **4. Typography**: `JetBrains Mono` / `IBM Plex Mono` for catalogue IDs and dates (`18–32px`) and lifted readings (`74–120px`); `Instrument Serif` for titles; dark caption plate at the bottom with a `3px` signal-coloured left/top edge.
- **5. Camera Grammar & Native Moves**:
  - *The Line Lights Up*: Inside the loupe, one printed sentence brightens, a signal-red underline draws left-to-right in `0.45s`, and the key metric lifts into a dark reading plate.
  - *Into the Photograph*: The loupe rim expands past the viewport while the archival photo splits into foreground/midground/background 2.5D parallax layers.
  - *Two Records Held Side by Side*: Two archival crops held still for `>= 2.5s` until both are read, before one is struck through with a pen stroke.
  - *The Table Becomes the Index*: Camera pulls back to reveal all examined documents arranged chronologically on the light table as their catalogue tags fly into a summary ledger.

---

### Style C: `kino-montage` / Constructivist Montage (Executable via `"kind": "kinomontage"` in `motion-designer`)
- **1. Essence**: Real archival footage, photographs, and policy documents printed as a high-contrast two-tone poster (**Warm Ink `#141210` + Archival Paper `#EDE4D0` + One Signal Red `#D52B1E` / `#E04826`**) cut on a relentless **120 BPM machine grid** (`0.5s` beat, `2.0s` bar). Diagonal bands (`-18°`) carry bold condensed type (`Oswald` / `Syne`); parallelogram windows hold flickering footage; cut-out figures stack into towers; two images collide (`A + B -> Idea`).
- **2. Materials & Rendering**:
  - **Two-Tone Print Grade**: Map luminance via an S-curve `x + s*(x-0.5)*(1 - |2x-1|)*2` (`s = 0.32` for photos, `0.18` for documents) onto `INK (#141210) -> PAPER (#EDE4D0)`. Archival film windows get `±2.5%` per-frame exposure flicker.
  - **Cut-Outs**: `7px` dilated paper-white border around segmented figures/machines.
  - **Marked Documents**: Full-res document scan slams in at a tilt; a `#D52B1E` red highlighter bar in `multiply` blend mode sweeps across the exact sentence while a solid red block repeats the key number at `230–440px`.
- **3. Edit Grammar & Transitions**:
  - **Conflict Cut Rule**: Adjacent shots must conflict in direction (`left slam` vs. `right slam`), value (`paper ground` vs. `ink ground`), or geometry (`-18° diagonal band` vs. `upright window`). Never show two paper documents in a row.
  - **Medium Transitions**: (1) *72° Red Wipe* (`260px` red band perpendicular to the `-18°` axis sweeps across in `0.25s`); (2) *Red Marker Iris* (red circle drawn on a map opens into live footage); (3) *Axis Slam* (`0.14s` ease-out slam with `exp(-14*t)` frame shake).

---

### Style D: `dataviz` / Data Storytelling (`styles/data.js` + `polymath_plots.py`)
- **1. Essence**: **The chart is the film.** Every mark is a real number drawn on warm cream paper (`#F6F3EC`) by a two-sided red/blue lead (`Blue #1D58D8` for context/human notes, `Red #E04826` for anomalies/records), with handwritten notes pinned in data space and data sonification where pitch tracks value.
- **2. Chart Selection Matrix**:
  - *Rankings / Categories* -> Horizontal bars or ranked bar race
  - *Two-variable relationship* -> Scatter/bubble plot (where one dot is the protagonist)
  - *Geography* -> Survey-of-India-compliant choropleth or dot-density map
  - *Parts of a whole / human counts* -> Isotype unit/waffle chart
  - *Before -> After* -> Slope or dumbbell chart
- **3. Native Moves**:
  - *The Object Before the Axis*: A drawing of the physical object measured (a ₹10 packet, a 35mm frame, a solar wafer) morphs into the very first data mark before the axes even draw.
  - *Breaking the Frame*: When an outlier or crisis spike exceeds the axis, it punches through the top border of the plot box with a 2-frame camera shake, leaving a torn paper scar before the camera rescales in ratcheted steps.
  - *Encoding Morph*: Bars morph into a waffle grid of people, or dots on a map fall into a ranked histogram in one continuous take.
  - *The Headline Revised*: At the conclusion, a red stroke strikes out the myth word in the chart's title and writes the empirical truth above it.

---

### Style E: `whiteboard` & `chalkboard` (Executable via `"kind": "whiteboard"` in `motion-designer`)
- **1. Essence**: One continuous physical board (`#F8F7F2` glossy dry-erase whiteboard with `0.35x` parallax diagonal window sheen and `5–10%` faint erased ghost marks from old lessons, OR `#141816` slate chalkboard with chalk dust). Every equation, diagram, and arrow is drawn in **real stroke order** using the slow-fast-slow hand velocity curve:
  $$v(u) = u - \frac{\sin(2\pi u)}{2\pi} \times 0.8$$
- **2. Colour Logic**: Maximum **3 marker/chalk colours** held strictly to semantic roles across the entire video:
  1. `Dark Ink (#1F242B)` (or `Chalk White #F4F1EA`): Physical structure, axes, base apparatus.
  2. `Process Blue (#2563EB)` (or `Chalk Cyan #58C4DD`): Measurements, vectors, flow trajectories.
  3. `Signal Accent (#E04826)` (or `Chalk Yellow #FACC15`): The single anomaly, bottleneck, or key term in the equation.
- **3. Native Moves**: (1) *Writing in Stroke Order* (each term of a Lagrangian or economic identity draws at the exact millisecond the narrator names it); (2) *The Pen Leads the Camera* (the camera rides a drawn arrow to pan to the next region of the board without cutting); (3) *The Eraser Rewinds* (wiping a diagram backward to test a counterfactual *"What if..."*).

---

### Style F: `iso-infographic`, `swiss-motion`, `risograph` & `engraving`
- **`iso-infographic` (True 30° Isometric System)**:
  - Projection math: $s_x = (x - y)\cos 30^\circ \cdot k$, $s_y = ((x + y)\cdot 0.5 - z)\cdot k$, painter depth $= x + y + z$.
  - Every solid uses 3 normal-shaded face tones (Top `+20%` warm white, Left mid, Right `-22%` cool dark `#231A2C`) with zero outlines on solids; `2px` ink lines are reserved strictly for leader pins, cut lines, and route arrows.
  - *Rule*: Nothing moves without a route line or leader line drawing `0.25s` ahead of it.
- **`swiss-motion` (12-Column International Typographic Grid)**:
  - `1920x1080` 12-column grid (`96px` margins, `24px` gutters, `24px` baseline). Flat paper (`#F2F0EA`), black ink (`#111111`), light grey rules, and **one single signal colour (`#E04826`)** reserved for the one element that breaks the rule.
  - Motion uses only two curves: `cubic-bezier(0.7, 0, 0.2, 1)` for beat-locked snaps and `linear` for rule lines and the off-grid exception. Zero bounce.
- **`risograph` (2–3 Spot Ink Overprint & Misregistration)**:
  - Warm paper (`#F4EEE2`) + 2–3 translucent spot inks (e.g., `Teal #00838A` + `Fluorescent Vermilion #E04826` + `Sunflower #FFB511`) that multiply where they overlap, with a fixed `±2px` plate misregistration offset and `4px` paper-white knockout halos around figures.
- **`engraving` (Copperplate Burin Linework + Watercolour Wash)**:
  - Sepia plate paper (`#EDE2CE`) where cross-hatched ink lines engrave themselves along the contour before a translucent watercolour wash fills only the active physical component.

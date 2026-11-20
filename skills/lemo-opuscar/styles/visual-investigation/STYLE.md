# Visual Investigation - Style Prompt

A cold investigation desk: footage, photographs, documents, sound and maps from one real event, laid out on one shared clock so they check each other. The clock lives inside the picture - timestamps on the evidence, a playhead on a data chart, a stopwatch over the decisive seconds; frozen frames are circled and magnified; quotes are highlighted on the page they come from; a plan shows where cameras stood and where they looked; what is known and what is not are kept apart; at the end every piece of evidence is pulled into one map. References (grammar only): newspaper visual-investigation videos, forensic-architecture reconstructions, broadcast verification units. Never copy them, quote their names or use their branding.

## 1. Essence, and what it is not

- **Sources meet at one moment.** The payoff of every section is two or more independent sources (a frame, a photo, a testimony, a report line, a sound) pointing at the same place or the same second. Cut points are sync points.
- **One clock, read in the picture.** Time is carried by large readouts that belong to the layout: the timestamp on each telegram card, a playhead with its clock on the data chart, a `T+xx.x` stopwatch over the decisive seconds, a frozen `"32 s"`. The scale changes with the story (hours -> minutes -> seconds -> days) at section cuts. A permanent timeline band under every shot is optional and usually wrong: it eats the bottom of the frame, adds a layer of small labels and goes empty once the story leaves the clock.
- **One finding per layout.** Each section says one thing; a heading is part of the layout, never a page header.
- **Uncertainty is drawn, not apologised for.** `~`, `inferred`, `schematic`, dashed boxes. Known and unknown are separate columns. A source that does not cover a stretch simply is not on screen yet (it lights up late in its column); never an empty "no footage" box, which reads as a broken render.
- **Restraint.** Real disasters and real people: no slow motion of the catastrophe, no music that tells you to feel; fire only inside evidence frames; casualties as counted dots and numbers.

Not Satellite Briefing (no orbital imagery, no zoom from space). Not Archive Light Table (no paper on glass, loupes or hands: documents are flat evidence frames). Not Halftone Dossier (no print texture, stamps or collage). Not a newsreel package (no channel bug, ticker or anchor voice). Not a keynote: no centred title slides, no page turns.

## 2. Materials & rendering

- **Three kinds of source at least:** moving image (newsreel, CCTV, phone video, launch camera), documents (testimony, memo, telegram/teletype, report page), photographs. Add sound (original commentary, radio, recordings), data (weather, telemetry, counts) and maps whenever they exist.
- **Documents:** a scanned page is shown as a strip or a page, never re-drawn; only the decisive line is highlighted (red, `multiply`, alpha ~ 0.6, wiped left to right). Text that exists only as a transcription (a report, radiograms) is re-typeset by code and labelled as a transcription.
- **Archival picture pipeline** (pre-1950 film, max ~ 2.5x): deinterlace (`bwdif=0`) -> crop borders -> deblock (`hqdn3d=2:2:3:3`) -> lanczos upscale -> light unsharp (`5:5:0.5`) -> greyscale; one grain for everything. Modern footage: <= 1.5x. Never colourised or "restored" copies.
- **One grade** (canvas `ctx.filter`): footage and photos `grayscale(1) contrast(1.22) brightness(0.94)`; paper `grayscale(1) contrast(1.05) brightness(0.86)` (white pages pressed to light grey); maps greyscale, inverted, `brightness(.62)` so they read as dark line drawings.
- **One grain:** six 256x256 Gaussian tiles rotated per frame, `overlay`, alpha 0.22 on footage/photos, 0.10 on paper. Grain only on sources, never on type or lines (`mux.sh ... 0`).
- **Drawn evidence** (plan, side schematic, charts, dot matrix) is thin line work on the panel colour, marked `schematic` when it is not measured.
- Remove channel bugs, watermarks and the source's own title cards; never generate an image to stand in for a historical one.

## 3. Colour logic

| Use | Value |
| --- | --- |
| Ground | `#0B0C0E` |
| Panels | `#141619` |
| Hairlines, frames | `#2E3238` |
| Text | `#ECEAE4` |
| Secondary text | `#8B9097` |
| Ticks, uncertain | `#4A4F57` |
| The one accent: here / now / match | `#FF4A2E` |
| Paper cards (typeset telegrams) | `#E4E0D4` with ink `#1D1D1B` |

Sources are greyscale; red is the only colour and it only ever points: circles, the chart playhead, sync lines, highlights, checkmark badges (a drawn tick in a red box, no words), the zone everything converges on, the unresolved column, a strike-through on a wrong claim.

## 4. Type & subtitles

- **Headings and findings:** Noto Sans SC 700 / Inter 700 (30-124 px). **Tags, timecodes and ticks:** IBM Plex Mono 400/600. **Quotes:** Source Serif 4 Italic for the original wording, Noto Serif SC 500 for a translation underneath in the secondary colour (only when the subtitles don't already say it). All OFL, subset to the words on screen.
- **Few words per frame.** Each frame keeps only what this beat needs: the main readout or heading, the quoted original (the highlighted line), and one short source tag per piece of evidence. No eyebrow labels, no archive numbers, dates or "estimate / schematic / not to scale" footnotes unless the beat is about them, nothing the subtitle is saying at the same moment.
- **Source tag:** a 6x12 chip + `type · source` in mono, <= about 12 characters (`PHOTO · Pasquarella`, `FBI TELEX · 1937-05-08`), sitting just above its frame. Full credits go on the end card, not on the panels.
- **Lower third:** a red bar + place name (36 px bold) + one mono line (place code).
- **Subtitles:** at the bottom of the frame (y ~ 984-1022), centred, 10 px black shadow; one line per language, measured in the page against 1,500 px; a long sentence becomes two cues. Original sound gets subtitles too, marked `[1937 newsreel]`.
- **Reading time:** every key text stays still and whole for `CJK / 4.5 + other / 15 + 1.5` s (`readcheck.js`); verdict and comparison frames hold >= 2.5 s with every item fully in frame. Counters (timecode readouts, the stopwatch) and tick labels are exempt.

## 5. Motion quality

- 30 fps. Elements cut in (<= 0.1 s opacity) with a 3-4-frame white flash, as if pulled from the evidence locker; nothing flies, bounces or scale-pops.
- Only things that are drawn are progressive: circles drawn clockwise in 0.5 s (ease-out cubic), leaders and links 0.4-0.8 s, plans stroke by stroke, highlights wiped, typewriter text for telegrams.
- Inside a frame: a slow push (<= 1.9x on a map, <= 1.06x on a photo) is allowed; the "camera" itself never moves. Layouts change on cuts.
- The event clock (chart playhead, stopwatch) eases between keyframes and moves at constant speed inside a timed run (each tick = one real second). Scale changes (minutes -> seconds -> days) happen on section cuts, carried by the readout changing form (clock -> T+ stopwatch -> date), not by a zooming band.
- Something changes at least every second; holds are for verdicts only.

## 6. Shot & layout grammar

- 1920x1080, 60 px margins; content y 60-900, subtitles below it (y ~ 950-1030). Layouts use the full height; no strip is reserved for a timeline. When a section has no subtitle, centre its content vertically.
- Panels are hard-edged rectangles with 1 px frames; footage panels keep the source's aspect.
- Typical layouts: map -> plan (left) with a reference photo and a footage panel (right); one big statement + one quote + one wide schematic; five-source board (three evidence frames on top, sound and report below, schematic right, red links converging); three-column sync grid (report / photo / video under one stopwatch, each column lighting up when its source begins); document strip + two-column verdict; claim card + fact-check card + dot matrix; evidence map (plan, broken-axis mini timeline, schematic, thumbnails with links).
- Avoid centred layouts, page headers and slide-like page turns. Transitions are hard cuts on a 0.5 s grid, white flashes and the rewind; no dissolves.

## 7. Sound palette

- **Bed:** low D held by contrabass and cellos; a filtered room tone about 30 dB under the voice.
- **Clockwork:** a pendulum tick every 0.5 s in the minute-scale sections, louder in the waiting minutes; in a timed run one tick per event second (accent every 5) - the audible stopwatch.
- **Harmony:** a quiet pizzicato ostinato in eighths (Dm - Bb - Gm - A) under the slow sections; tremolo minor-second clusters for tension; slow sustained chords for the verdict columns; a resolving D minor add9 with vibraphone for the evidence map.
- **Foley (procedural):** paper for documents, a shutter for photos, Morse "dits" and keystrokes for telegrams, teletype chatter, a rewind sweep, pencil scratches for plans, one deep thump for the moment of impact - then near-silence.
- **Original sound** (archival commentary, radio, recorded sound): band-passed 180 Hz-5.5 kHz with sparse crackle, shown as a waveform with a red play-line and word-by-word lighting; music ducks -12 dB under it. Original sound and score alternate; never both loud.
- **Voice:** calm and flat (Kokoro `am_michael`); music ducks about -9 dB under it; -14 LUFS, true peak <= -1 dBTP.

## 8. Native moves (and how to code them)

- **Freeze, circle, magnify.** Freeze a frame with a white flash; draw a 2.5 px red circle clockwise; at 60 % a leader and a bold label appear; a x2 loupe opens beside it, cropped from the same source pixels (never beyond 1 source px per screen px). Fits: a licence plate in CCTV; a crack in a weld.
- **Hard sync point.** Pick one instant every source can recognise (impact, flash, a public clock, a gunshot peak) and align each source to it. A source that starts late just appears late; if the gap matters, say it in the voice or a subtitle.
- **Three-column sync grid.** Document / photo / video side by side under one big stopwatch; each column cuts in (white flash) at the moment its source begins, so the grid fills left to right as the clock runs; freeze on the sync point with a red dashed line across the pictures.
- **Readouts change scale.** The time readout changes form at each section cut - card timestamps and a chart playhead (minutes), a `T+` stopwatch (seconds), dates (days) - as the story narrows or widens.
- **Rewind cold open.** Start on the decisive frozen frame, slam the other sources into a grid, sweep a sync line, then rewind (footage playing backwards, scan lines) to the start.
- **Telegrams on the clock.** Typeset radiograms / messages land at their timestamps with Morse and keystrokes; red dashed leaders tie each card to a pin at its time on the data chart's axis.
- **Data chart with a playhead.** A chart (wind, speed, temperature) across the lower part of the frame with a time axis, event bands (storm, outage) labelled with one word, the message pins, and a red playhead carrying the clock.
- **Map -> plan.** A real survey map pushes in to the site, then cuts to a measured plan with the subject's position, a bearing, a distance ring, a camera point and an inferred view cone; the map stays as a locator inset.
- **Evidence -> model links.** Every circle in every source sends a red dashed link to the same zone of one schematic; checkmark badges land 0.12 s apart with small mallet notes.
- **Then vs. record.** Play a period claim as original sound, then a fact-check card; strike through the wrong words in the claim.
- **Known / unresolved.** Two columns, ticked vs. dashed boxes, every item held whole for >= 2.5 s, one source tag for the board.
- **Dots for people.** One dot per person; the dead become red open rings one by one; a single large number.
- **Evidence map.** Plan, broken-axis mini timeline, schematic and thumbnails of every source, all links converging; the poster frame.

## 9. Pitfalls

- **Inference passed off as fact.** Camera positions, photo times and offsets need `~` / `inferred` / `unlocated` on screen and in `FACTS.md`.
- **Early reports as facts.** The first-night memo and the period newsreel often disagree with the final report; use them as images or as claims to check, never as the source of a number.
- **Faking a multi-camera event.** With one licensable film, do not borrow clips of unclear origin; cross-check film + photos + documents + sound instead.
- **Seams in "continuous" shots.** An exposure jump or splice breaks timing; time durations from the official record and state the alignment error.
- **Time zones and clocks.** Old reports may use standard time while the place ran on daylight time; pick one and state it once on screen (`18:25:00 EST` on the first readout).
- **Too much at once.** One layout, one finding; at most five sources on a board, and the subtitle never repeats the heading word for word.
- **Too many words on screen.** Keep only what this beat needs (main readout or heading, the highlighted original, one short tag per source).
- **Empty placeholder boxes for missing material.** A grey "no footage" or "waiting for photo" panel looks like a render error. Fill the slot with real material, change the layout, or let the source appear when it starts.
- **Catastrophe as spectacle.** No slow motion of fire or impact, no full-screen flames, no sound effects on deaths.

## 10. Footage (素材)

- **Ask the user first.** Before searching: does the user have their own footage, photos, documents, recordings or data? Their own material always comes first.
- **Where to look, and how to judge the licence.** Use `demo/tools/footage.py` (copy it into the project): `search archive|commons|nasa`, `files`, `fetch` (records licence, author and page into `SOURCES.jsonl`), `used`, `md` (writes `SOURCES.md`).
  - **Internet Archive:** the item's `licenseurl` and `collection`. The NARA-donated Universal Newsreels (1929-1967) are public domain; other newsreel companies (Hearst, Pathe, Movietone, Paramount) are not, even when uploaders tag them PD.
  - **Wikimedia Commons:** read the file page - author, source, licence template. U.S. federal work (Navy, NASA, NARA, NOAA, USGS) = public domain.
  - **NASA (`images.nasa.gov`):** public domain except marked third-party items and logos.
  - **Library of Congress / national archives:** read each item's rights statement; "no known restrictions" is not a licence - skip it.
  - **USGS The National Map:** historical topographic maps as PDF (public domain); render the area you need with `pdftoppm -r 300`.
  - **Government reports and FBI files:** U.S. federal works are public domain; quote them, typeset transcriptions, show scans only as evidence frames.
  - **Allowed:** public domain, CC0, CC BY (credited in full on the end card). **Not allowed:** CC BY-SA, "no known restrictions", unclear origin, colourised or restored copies.
- **Tell the user before downloading:** what (title, length or pages), from where (page URL) and under which licence; keep `raw/` under about 1.5 GB.

## 11. Facts

Keep `FACTS.md` (claim on screen or in the voice -> source URL -> quoted wording), list every inference separately, and check the final script and subtitles against it before the last render.

## 12. Engine

One Canvas-2D page (`demo/index.html`), `window.render(t)` deterministic, `window.TEXTS(t)` for `readcheck.js` (key texts only; counters exempt), `window.SUBCHECK()` for the one-line subtitle check; all timing in `demo/film.json` (sections, voice starts, original-sound clips, subtitles), shared by the page, the mix (`demo/audio/mix.py`) and the subtitles (`demo/tools/cues.py`). Reusable parts in the page: `plate()` (grade + grain + flash), `ring()` (circle + leader label), `cover()` (fill a panel without stretching, returns a source -> screen map for circles), `badge()`, `wave()` (waveform with play-line), `playhead()` (event-clock keyframes shared with the mix), `planPanel()`, `schematic()` (16-cell side view with zone/flutter), `push()`.

## 13. Variation space

The agent decides per film: the event, the sources, the sync point, which time scales the clock passes through, the layouts, the opening and the ending.

- **Three structures:** a cold open on the decisive frame, then rewind and rebuild; one question ("where did it start?") answered source by source; a strict clock (`T-10 min -> T+1 h`) with findings dropping in where they happen.
- **Three sync points:** an impact or flash frame; a sound peak heard in several recordings; a public clock or broadcast time signal.
- **Three endings:** the evidence map; the known/unresolved board left on screen; back to the opening frame, now fully annotated.

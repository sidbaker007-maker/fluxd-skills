# Satellite Briefing - Style Prompt

Real satellite imagery of a real place, graded down to an analyst's grey, with thin white measurement lines drawn on the ground: a lock-on reticle, outlines, a range line, one reading. One continuous zoom built from stacked imagery plates carries the viewer from orbit to the ground and back, and time can run inside one locked frame. References (grammar only): open-source investigation films that annotate satellite pictures (thin lines on imagery, one claim per screen, measuring as the plot); the Eameses' Powers of Ten (one continuous change of scale with a readout); NASA Earth Observatory's World of Change (one place, time running). Copy none of their layouts, typefaces, icons or music; never name them in the film.

## 1. Essence, and what it is not

- **The ground is a photograph:** real, licence-clean, georeferenced satellite or aerial imagery of the actual place. Nothing on the ground is drawn, stylised or generated.
- **Two layers, two truths:** the imagery is what the satellite saw; the hairlines are what the analyst measured. Marks are thin, white, sparse, and sit on real coordinates.
- **The grade moves with the story:** orbit in true colour, the analysis layer in grey, colour back only where the story turns.
- **Scale is the camera:** one zoom from orbit to the ground built from nested plates, with an altitude readout and a scale bar from the same camera.
- **One finding per screen**, in the single accent colour.

Not Data Storytelling (a chart on paper), not Sci-fi Hologram HUD (no glowing wireframes or invented chrome), not Blueprint, not Isometric Infographic, not a keynote.

## 2. Materials & rendering

- **Plates:** georeferenced rasters with a lon/lat box, sampled in a shader where the camera ray hits the ground, nested by resolution (world -> region -> detail) with feathered edges so finer plates dissolve in as the camera descends.
- **Globe:** ray-sphere from a perspective camera, a thin atmosphere rim, limb shading at orbit only; compute `|C|^2 - R^2` in double precision.
- **Time:** dated plates share one grid. A soft scan front (a satellite pass, never a hairline) swaps them: north -> south forward, south -> north for a rewind.
- **The analyst's grade:** luminance with local contrast and clarity, a shoulder so salt, snow and cloud stay below white, toned blue-black -> cool silver up to ~65 % grey, a fifth of the chroma. White belongs to the marks.
- **Marks:** a 2D overlay through the same world -> screen function: hairlines 1.2-2.6 px with a dark halo, dashes for history and claims, brackets, ticks, leader lines.
- **Screen space** only for instruments (altitude, scale bar, imagery credit) and the transcript strip. Everything else is anchored to the ground.

## 3. Colour logic

- **Neutral ground:** grey, roughly 3-65 % in value (`#070B0E -> #A1A7A9`).
- **White (`#F2F5F6`) means measured.**
- **One accent** (warm amber `#FFBE55`) for the single reading on screen, never decoration.
- **A second hue** (`rgb(46, 112, 206)`) may mark the claim the imagery tests (a map, a plan, a promise): flat, cartographic, never used for anything measured.
- **True colour is evidence:** at orbit, and again only where the story turns.

## 4. Type & subtitles

- **Roles:** a light condensed grotesk for the reading (96-130 px, Barlow Condensed); a monospace for instruments and dates (20-34 px, IBM Plex Mono); a sans for labels in the film's language (24-42 px); a serif only for the claim layer and the title.
- **Labels** attach to the ground with a leader line. **The reading** sits in the right third beside what it measures, label above, source note below ("Landsat, measured").
- **Subtitles** are a transcript strip at the bottom left: a 2 px white rule, a dark plate fading right, left-aligned, each line on one line. Hold subtitles >= `max(1.8 s, speech + 0.6 s)`.

## 5. Motion quality

- The camera never stops: distance interpolates in log space, segments ease, holds keep a 2-5 % creep or a slow rotation. No frozen frame longer than a second.
- Marks arrive by being made: a line grows, an outline prints behind the scan, a counter rolls and lands with a small pop, a reticle snaps with overshoot.
- Time changes are scans, never dissolves.

## 6. Camera grammar

| Move | What it expresses | Can serve |
| --- | --- | --- |
| Oblique orbit, limb in frame | scale, context, distance | an opening; a return; a title card |
| Dive (log zoom, tilt to nadir) | going to look for yourself | a reveal; checking a claim |
| Locked nadir frame, slow creep | evidence, comparison | time running in one place; a measurement |
| Push-in on a point | singling out | one town, one dam, one field |
| Track along a line | travelling a distance | measuring; a river, a road, a border |
| Whip pan with blur | a new subject at the same altitude | the counter-example; "meanwhile" |
| Climb back to orbit | consequence, perspective | an ending; a summary |

## 7. Sound palette

- **Telemetry:** FM pings, dry ticks on the grid that divide to accelerate, noise scans, servo whines, a ratchet for a range line.
- **Weight:** timpani, bass drum, gran cassa, bowed cymbal, a tam-tam reversed when time runs backwards. Measurements land on a pitched hit.
- **Synthesis:** a pulse bass with audible 2nd and 3rd harmonics, detuned-saw pads under a low-pass, risers for dives.
- **Voice:** a calm analyst, short declarative lines. Mix: voice ~10 dB over music; -14 LUFS, true peak <= -1.2 dB.

## 8. Native moves

1. **The map against the photograph.** The camera falls into the printed map of the claim; a scanner bar tears it away and the ground is underneath.
2. **Time rings in a locked frame.** Dated plates scan in one by one; each leaves its outline, the band lost between two rings flashes.
3. **The range line.** Mark the destination, grow a ticked line from A to B, chase the tip while the reading counts up, land on the number, pull back to show the whole distance.
4. **The dive and the climb.** One zoom from orbit to the ground, or back.
5. **Colour returns where the story turns.** Only the subject regains true colour inside the grey.
6. **The reticle becomes the frame:** the lock-on brackets open out to frame a title card or the last reading.

## 9. Pitfalls of the medium

- **Licences:** not usable: Google Earth/Maps, Bing, Esri World Imagery, Mapbox Satellite, Planet, Maxar, news photos, AI-generated imagery. Public domain or free with credit: USGS Landsat (1972 on, worldwide), USGS NAIP (US, ~1 m), NASA Blue Marble, MODIS, VIIRS.
- **Finding imagery:** Planetary Computer STAC (Landsat C2, Sentinel-2 L2A) or USGS EarthExplorer; MODIS/VIIRS and Blue Marble from NASA GIBS; coastlines from Natural Earth (follow `DIRECTOR.md` §13).
- **Facts:** keep a `FACTS.md` in the project folder and deliver it with the film. Measure on the date you show.

## 10. Engine

- `demo/engine.js`: `makeCamera({lat, lon, d, tilt, heading, sx, sy})`, `project()` / `unproject()`, the WebGL2 plate shader (nested plates, time scans, growth map, analyst grade, printed-map layer, whip blur).
- `demo/overlay.js`: hairlines, brackets, `readout`, the measured single-line subtitle strip, `text` with a registry for `window.TEXTS`.
- `demo/tools/`: `fetch_landsat.py`, `plates.py`, `vectors.py`, `mapfield.py`, `growth.py`.

## 11. Variation space

- **Structures:** a locked time-lapse of one place ending in a push-in; a river followed from source to mouth with a reading at each stop; two places compared at one scale with whip pans.
- **Openings:** a ground-level detail that climbs to reveal its scale; a black frame a scan line paints in; an oblique orbit with a searching reticle.
- **Endings:** the climb back to orbit; a last measurement that lands and holds in silence; the claim layer redrawn to match the ground.

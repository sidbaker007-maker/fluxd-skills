# Complete 99-Style Specifications (`styles/ALL-99-STYLES.md`)

This file and `styles/styles-catalog.json` store the complete specifications and `style.json` metadata for all 99 styles across all 15 stations so the skill archive stays within the 100-file ZIP limit (`95/100` files). Run `python3 styles/unpack_styles.py` to materialize all 99 `styles/<slug>/STYLE.md` and `style.json` directories on disk.


---

## `academic-preprint`

# LaTeX ArXiv Paper Walkthrough (`styles/academic-preprint`)

**Station**: Line 8 — Print, Editorial & Typography

## Visual & Editorial Brief
Computer Modern two-column academic paper with numbered theorems, equation zooms, and margin annotations.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `architectural-maquette`

# Cardboard & Basswood Maquette (`styles/architectural-maquette`)

**Station**: Line 6 — 3D Stage & Spatial

## Visual & Editorial Brief
Scale architectural model in warm basswood and museum board with sun-angle shadow sweeps.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `archive-lighttable`

# Archive Light Table - Style Prompt

Real archive objects (glass negatives, slides, letters, telegrams, clippings, drawings) lie on a cool, backlit light table. A loupe comes down on one of them, and inside the glass the object comes alive: a negative turns positive, a line of type lights up, a number lifts off the page, a photograph opens into depth. Precise catalogue numbers, dates and readings are pinned to the objects. Clean, modern and quiet, with no vintage filter. References (grammar only): archive documentaries that push into still photographs; visual investigations that annotate real imagery (one line, one reading, one source per screen); product macro films (glass edges, transmitted light). Copy none of their layouts, typefaces, shots or music, and never name them in the film.

## 1. Essence, and what it is not

- **The objects are real:** scans of public-domain or licensed archive items, at their true proportions, with their real damage (broken corners, emulsion edges, folds, pencil marks). Nothing in them is drawn or generated.
- **Light comes from below:** the table glows a near-white cool grey; film and glass transmit it, paper glows warm at its edges, opaque things read darker than the table.
- **The loupe is the camera's door:** every dive into an object goes through a loupe that lands on it. The inside of the lens is where the object changes state.
- **Catalogue truth:** every object carries its real identifier, date and title from its holder; numbers on screen come from the record.
- **One signal colour** for marks, readings and anchors; everything else is the archive's own greys and paper tones.

**Sources and licences.** Open collections with masters and catalogue records: the Library of Congress, Smithsonian Open Access (CC0), the Rijksmuseum (CC0), NARA, Europeana. CC0, public domain and CC BY (credited) are fine. Never stand a generated image in for an archive object. Keep a `FACTS.md` in the project folder and deliver it with the film.

Not Halftone Dossier (no newsprint dots, no aged-paper grade), not Satellite Briefing (objects on a table, not the ground from orbit), not Data Storytelling (no charts; the numbers live on the objects), not a keynote (no slides or header bars).

## 2. Materials & rendering

- **One world, one camera:** every object is a textured quad on the table with a centre, rotation and scale (texture px -> world units at true size). The camera is a 2D centre, zoom and roll; the table and every mark go through the same world -> screen function.
- **The light table:** an emissive surface (~ 0.97 white, slightly cool), soft falloff, diffuser noise, an aluminium frame and a dark desk beyond. It can be switched off (ambient ~ 0.04) and flicker on.
- **Glass negatives:** transmission from the scan's positive, `T = 0.035 + 0.9 * (1 - pos)^1.25`, with a warm silver-gelatin tint; the emulsion mask comes from the scan (white margin touching the border = no glass), so broken corners show the table.
- **Paper:** backlit, its colour is transmission (paper tone x light); lit lines get darker ink and brighter paper; unlit text can dim to bring one line forward.
- **The loupe:** inside the lens each pixel maps back to the table through the magnification (~ 2.5x) with a pincushion term (`k ~ 0.16` at the rim), slightly different per RGB channel for colour fringes. Around it: a black ring with a bevel highlight and a clear acrylic skirt that refracts the table and glows at its foot. Landing and lifting, it scales by about 1.35x and casts a soft shadow.
- **The photograph space:** after the push the lens stops being a lens. A photo gains depth from a ground-plane nearness map, cut-out layers for upright subjects and a filled background; a dolly and a lateral shift drive parallax.
- **Marks** live on a 2D canvas above the picture: hairlines 1.5-3 px, rings, crop corners, underlines, leaders.

## 3. Colour logic

- **Neutral ground:** the light table (near-white, cool `#F7F9FB`) and the archive's own tones (silver greys, paper tans). Do not regrade the archive into a colour scheme.
- **One signal colour** (e.g. a signal orange `#FF5A1F`) for marks, readings, anchors and the verdict; never as a fill behind pictures, never for decoration.
- **Text** is ink (`#15171A`) on light areas and paper-white on dark caption plates (`rgba(14,15,17,0.74)`); choose the contrast by the ground, never colour on colour.

## 4. Type & subtitles

- **Roles:** a monospace for identifiers, dates and readings (IBM Plex Mono, 17-34 px; readings 74-120 px); a sans for labels in the film's language (Noto Sans SC or Inter, 21-36 px); a serif only for titles and the one name a photograph carries (60-76 px).
- **Labels** attach to objects: an anchor dot and ring, a vertical leader, then the text. A reading sits in a dark caption plate with a small label above and the source (the catalogue number or the original wording) below.
- **Subtitles** are a caption strip at the bottom centre, on a dark plate with a 3 px signal-coloured edge. Hold >= `max(1.8 s, speech + 0.6 s)`.
- Quote the source when you can: a crop of the actual line, or the record's wording in quotation marks, beats a paraphrase.

## 5. Motion quality

- 24 fps on ones; every camera parameter on smooth monotone curves through keys (no overshoot, no stepping).
- The camera glides across the table, slows to let the loupe land, then pushes. Speed lives in the glides and pushes; holds are for reading.
- The loupe lands with a fast ease-out (~ 0.4 s), lifts the same way. Lines draw on in 0.3-0.6 s; text wipes in from its leader side; numbers count up and land with the voice.

## 6. Camera grammar

| Move | What it expresses | Can serve |
| --- | --- | --- |
| table glide (pan and roll) | surveying; moving to the next piece of evidence | a timeline of documents; a product family; an album |
| loupe landing + push into the lens | choosing one object; "look closer" | the claim; the key photograph; a signature |
| inside the lens: tracking along a line | reading | a letter, a ledger line, a caption, a spec |
| photograph space: dolly + parallax | being there | the event itself; the founding moment; the place |
| rise out of the lens | stepping back, the evidence noted | a transition; a summary |
| pull back to the whole table | scale; everything at once | an index, a timeline, a closing |

## 7. Sound palette

- **Ambience:** the light table's ballast hum (100 Hz and harmonics), starter clicks, room tone. Inside a photograph the hum gives way to that place's air.
- **Foley:** the loupe on glass (a clack with a high ring), paper sweeps for glides and lit lines, ticks for scales and counters, a pen stroke for a verdict, soft clicks as labels land.
- **Music:** restrained and small: a felt piano, a few strings, glass or bowed metal for the moments of seeing.
- **Voice:** a calm narrator, short sentences that state what the object says. Music about 10 dB under the voice, ducked while it speaks; -14 LUFS.

## 8. Native moves

1. **Negative to positive under the loupe.** A develop front spreads from the lens centre with a thin warm edge, turning the glass negative into its positive only inside the lens.
2. **The line lights up.** On paper inside the lens one line of type brightens while the rest dims, an underline draws under it, and one word or number lifts out into a reading card.
3. **Into the photograph.** The lens rim grows past the frame while the view inside widens; the photograph gains layered depth and a subject drifts.
4. **Measuring on the photograph.** A ruler laid on the ground plane in perspective, with ticks that crowd toward the horizon and a counter that lands on the recorded figure.
5. **Two records, held side by side.** Two caption cards, each with a crop of its source, held still until both are read before one is struck.
6. **The table becomes the index.** Pull back to the whole table; each object's tag flies into one list with its identifier and its reading.

## 9. Pitfalls of the medium

- Over-magnifying a weak scan: keep the lens interior under about 1.5 screen px per scan px.
- The loupe sweeping over empty table: lay objects close together, land the loupe straight onto the object.
- Shear in the photograph space: cut upright subjects into layers, fill behind them, and keep 2.5D moves small.
- Labels that scroll away: hold the camera, or fix the caption on screen.
- Vintage creep: no sepia, no halftone, no paper-ageing overlay.

## 10. Engine

- `demo/film.js`: `IT` (objects: centre, rotation, scale), `toW()` / `toT()` (texture <-> world), `CAM` keys and `w2s()`, `dive()` (loupe point, land/lift times, lens interior as tracks), `shot(t)`, `int2s()`, the shader (`lightTable`, `paper`, `negative`, `parallax`, `rim` and `skirt`), the overlay (`annot`, `measure`, `compare`, `indexPanel`).
- `demo/tools/prep.py`: emulsion masks from scans, difference matting of a subject against a smooth sky, ground-only cuts, push-pull fill.

## 11. Variation space

- **Three structures:** a company's founding told as five objects in date order; a single photograph explored in three dives; a before/after pair of plans and photographs of one building.
- **Three openings:** the table switching on in the dark; a loupe already on a plate, rising to reveal the table; a hand-written date on an envelope filling the frame.
- **Three endings:** the index of everything on the table; the last photograph held in depth with one line of text; the light table switching off, leaving one object glowing.


---

## `art-deco-affiche`

# Cassandre Art Deco Affiche (`styles/art-deco-affiche`)

**Station**: Line 9 — Painting & Fine Art

## Visual & Editorial Brief
1930s airbrushed lithograph travel poster with dramatic perspective ocean liners/trains and geometric sans.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `bauhaus-atelier`

# Bauhaus Dessau Workshop (`styles/bauhaus-atelier`)

**Station**: Line 9 — Painting & Fine Art

## Visual & Editorial Brief
Kandinsky / Moholy-Nagy primary-color circle/triangle/square grammar on warm Weimar exhibition stock.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `brand-monogram`

# Heraldic & Monogram Identity (`styles/brand-monogram`)

**Station**: Line 11 — Keynote, Brand & Product

## Visual & Editorial Brief
Geometric construction grid revealing golden-ratio construction circles behind a crest, seal, or wordmark.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `broadsheet-gazette`

# 19th-Century Broadsheet Gazette (`styles/broadsheet-gazette`)

**Station**: Line 8 — Print, Editorial & Typography

## Visual & Editorial Brief
Multi-column serif broadsheet with deckle edges, woodcut masthead, drop caps, and column-zoom camera pans.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `brutalist-poster`

# Neo-Brutalist Monospace Spec (`styles/brutalist-poster`)

**Station**: Line 8 — Print, Editorial & Typography

## Visual & Editorial Brief
Exposed 2px black borders, high-visibility safety yellow/acid green fills, barcode stamps, and raw tables.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `caption-news`

# Caption News - Style Prompt

Social-video news that reads with the sound off. Real footage, photos and the source document are the ground; huge captions are the lead actor, slammed in a chunk at a time with one keyword on a yellow block. Hard cuts on a music grid, numbers that roll, a source tag that slides in whenever a figure appears, and the original document highlighted on screen before its number is believed. 16:9 (or vertical 9:16 layout), built for a feed. References (grammar only): the captions-first social news of the mid-2010s (NowThis, AJ+), horizontal explainers that set big type over footage (Bloomberg Quicktake). Never copy their logos, fonts, colour ratios, idents or shots, and never name them in the film.

## 1. Essence, and what it is not

- **Sound-off first.** Every beat must be understood from the picture and the captions alone; the voice adds pace, not information.
- **The caption is the shot.** One main headline line, set huge, slammed in two or three chunks, one keyword in a yellow block; one secondary line under it. The footage is chosen to sit under the line.
- **Evidence on screen.** Each number arrives with its source: a source tag slides in; key figures are first seen highlighted in the original document; per-shot footage credits sit in the corner like a news "Video:" tag.
- **A hook on frame 4.** The film's largest number lands in the first 0.15 s and rolls to its value.
- **One turn.** The bad-news hook is answered by a fact that changes its meaning; the rest of the film explains that turn, one new fact per shot.

Not Data Storytelling (charts are short inserts between footage, never the whole film, never a dashboard). Not a TV news package (no anchor, no lower-third ticker, no studio, no scrolling crawl). Not a keynote: no headers, no centred title-and-bullets, no page turns.

## 2. Frame and layout (1920x1080 and 9:16)

| Zone | Position | Content |
| --- | --- | --- |
| **Footage** | full bleed | video, photo, document or data card; never a vertical frame pillar-boxed in the middle |
| **Caption card** | left aligned at x 120; main baseline y ~ 948, sub baseline y ~ 1014 | one line per language, never wrapped |
| **Channel bug** | top left, x 96 y 52, 46 px high | yellow block with a fictional channel name + topic in small caps |
| **Source tag** | under the bug, y 108, 36 px | white "SOURCE" / "来源" + dark label (`USDA NASS · 2026.08.03`, `... · p. 13`); only on data and document shots, slides in 0.2 s |
| **Footage credit** | top right, 19 px on a 50 % dark chip | `Video: Author · CC BY 3.0`; every CC BY shot carries it |
| **Lower third** | x 120, y 742, 96 px high | yellow bar + label + one secondary line; for a place, date or speaker, never for the main sentence |

Under the caption: a bottom gradient (0 -> 84 % from y 560) plus a soft dark radial from the bottom-left corner; a top gradient (55 % -> 0 over 200 px) under the bug and the credit. Data cards use a lighter gradient that starts at y 820. Graphics and charts sit right of centre and bleed to the frame edge; their title and source sit top left, never centred.

Vertical 9:16 is a different layout, not a crop: put the caption under a 1080x1560 footage band (horizontal sources then scale <= 1.5x), stack the chunks on two lines there (the one-line rule is for 16:9 subtitles), and move the bug and source tag into the top safe area.

## 3. Editing grammar

- Cuts on a 120 BPM half-beat grid (every cut at a multiple of 0.5 s). Footage shots 1.5-3 s; data cards and documents 3-4.5 s; a shot that holds a comparison stays until every item has been fully on screen >= 2.5 s.
- **Captions cross cuts.** A caption can run over two shots (picture changes, words don't); captions change at most every ~2.5 s even when shots change every 1.5 s. Reading time, not shot length, sets the caption clock.
- **The order of a fact:** footage (feeling) -> the number on a card -> the document line that says it -> the consequence. Never a number without its source tag in the same shot.
- **Transitions are few and fixed:** hard cut (default); a 1-2-frame white flash on the turn and on the freeze; a card sliding in from the right with speed streaks (0.18 s); a split screen opening from its divider; grid panels rising staggered (0.1 s apart); a punch-in (0.3 s ease-out to ~1.25x) on the culprit; a mask transition where a photo grows out of a map shape. No dissolves, no page turns, no 3D flips.
- **Pace:** a strong action within 0.5 s of every shot; no frame flat for more than 1 s (rolling counters, line drawing, highlighter sweeps, slow pushes keep it alive); one held breath (2-3 s) after the turn; two real silences.

## 4. Caption card (the subtitle is the graphic)

- **Main line:** Noto Sans SC 900 / Inter Tight 900, 88 px (verdict lines 110 px), ivory `#F7F5EF`, 20 px dark soft shadow. Split into 2-3 chunks with `|` in the timeline; each chunk slams 0.12 s after the previous: scale 1.3 -> 1 in 0.13 s (back ease, overshoot 1.6), opacity full in 0.04 s.
- **Keyword:** `{...}` inside a chunk; a honey-yellow block `#FFC21A` wipes left -> right in 0.12 s behind it, text turns ink `#0E0E0C`. One keyword per caption, at most.
- **Secondary / spoken line:** Inter Tight 500, 33 px, ivory, fades and rises 10 px in 0.18 s, 0.1 s after the first chunk.
- **One line per language, always** (in 16:9). If either language would wrap, split the sentence into two captions. A caption is on screen >= 1.8 s and ideally >= the spoken line + 0.6 s.
- A text-only beat (caption with no voice) is native to the style: use it for the breath after the turn.

## 5. Graphics

- **Ledger card (the data-card ground):** `#151512` sheet, faint ruled lines every 54 px (4.5 % white), a thin red double margin at x 78/86 - the "account book" that ties every chart together. It slides in from the right over 0.18 s; inside, a slow push (x1.025-1.03 over the shot).
- **Colour meaning:** honey `#FFC21A` = the point / gains / the highlight; red `#FF4A3D` = losses, the spike, the bad number; ivory = everything else; grey `#8D8B83` = labels and units; `#5E5C55` = the bars that don't matter.
- **Numbers:** Inter Tight 800 with fixed-width digit cells (`num()` in `demo/main.js`), so a rolling counter never jitters. Counters roll with ease-out and turn their colour when they arrive.
- **Charts:** titled top left, lines draw segment by segment; the key point gets a bigger dot, an expanding ring (0.7 s) and a block label; bars grow from the left one after another.
- **Documents:** the PDF page rendered at 220 dpi as white paper on a dark desk (+-1-2 deg tilt, soft shadow, vignette), pushed in slowly; highlighter rectangles placed from `pdftotext -bbox` coordinates (`1 pt = 3.0556 px`), multiply blend, swept left -> right in 0.3-0.5 s; the number read from it is re-set as a big yellow block beside the page.
- **Split screen:** two halves with a 4 px yellow divider that drops first; the "bad" half desaturated, darkened and tinted red, the "good" half in full grade; a label block and a counter in each; a shared stamp centred on the divider.
- **Grid:** three panels (632 px, 12 px gaps) rising staggered; each one lights up (yellow border, label turns yellow) on the word that names it; numbered 1-2-3.
- **Freeze frame:** the shot stops on a frame, a 0.14 s white flash, punch 1.0 -> 1.12, saturation drops to 45 %, yellow corner brackets close in on the subject, a timecode chip with a pause mark appears top right.
- **Title sting:** a yellow ruled page wipes across the left 45 % over live footage; the title slams, the dateline chip follows; the page wipes off left and the title becomes the channel bug.

## 6. Grade and image quality

- One grade for every piece of footage: `contrast(1.07) saturate(0.92) brightness(0.98)` + a 6 % warm soft-light layer; documents 4 %. Light grain in the master (`mux.sh ... 30 1`).
- Scale limits: modern footage <= 1.5x; photos <= 1:1 of their source; archive material <= 2.5x after deblocking.
- Remove station logos by cropping (never cover them with a caption), blur legible private details with `delogo`, skip shots with burned-in text.
- Captions, numbers and charts are always vector, never scaled footage.

## 7. Sound palette

| Layer | What | Level |
| --- | --- | --- |
| **Voice** | one brisk narrator (Kokoro, speed 1.1-1.17), numbers spelled out in the TTS text | compressed, ~ 8 dB over the music |
| **Music** | 120 BPM pulse in sampled instruments: kit (kick on the beat, hats on off-beats), eighth-note electric bass, a sixteenth-note marimba ostinato, vibraphone off-beat chords, glockenspiel accents, staccato brass stabs on the big numbers, timpani and suspended cymbal for turns | ducked ~45 % under the voice |
| **Structure** | the hook hit on frame 4; a hard stop into silence before the turn (only natural sound and the question); the turn lands on a major-key brass hit; half-time and low strings for the threat; a snare build into the spike; a second short silence before the verdict; a major chord with bells on the verdict | |
| **Foley** | every graphic action has a sound: chunk slam (click + thump), counter rattle (a tick every 45 ms), whoosh into each card, highlighter squeak, camera shutter on the freeze, stamp thump on a big number, pops for labels, ticks as map states fill, a riser into the map push | |
| **Natural sound** | the subject's own location sound, J-cut 0.3 s before the freeze, bed under the ending | not ducked below audibility |

Master -14 LUFS, true peak <= -1 dBTP (`core/render/mux.sh`).

## 8. Native moves

1. **Frame-4 hook** - kicker line, then a giant number in a yellow block rolling to its value in 0.45 s, then the unit and the subject word (`hook()`).
2. **Chunk slam** with one yellow keyword (`capCard()`).
3. **Proportion by darkness** - a yellow line sweeps across the footage to the percentage; what it passed goes grey and dark; the figure appears on the dark side (`shotHalf()`). Works for any "X % of ...".
4. **The document says it** - headline or sentence highlighted from PDF bbox coordinates, then the number popped as a yellow block beside the paper (`paper()`, `shotDoc6()`, `shotQuote()`).
5. **Freeze and question** - the image stops on the viewer's question, music cut to silence (`shotFreeze()`).
6. **Ledger split** - two counters racing side by side, the difference stamped after both settle (`shotSplit()`).
7. **Lit grid** - three ways / three causes, each panel lighting on its word (`shotGrid()`).
8. **Punch and circle** - 0.3 s punch-in on the culprit, a circle drawn round it, a leader to its name (`shotSem()`).
9. **Map to ground** - the map pushes into a region, then a photo of that place grows out of the region's outline (`shotMap()`).

## 9. Material

- Ask the user first whether they have their own footage, photos, documents or data. Their material comes first; open archives (Wikimedia Commons CC0/PD/CC BY, U.S. federal agencies USDA/USGS/NASA/NOAA/NARA, Internet Archive PD/CC0/CC BY, official agency reports) are the fallback.
- Keep `FACTS.md` (claim, URL, quoted wording, derived sums with their arithmetic).

## 10. Engine

Copy `demo/` into the project and replace the content:

- `main.js` - the page (`window.render(t)` draws synchronously with placeholders first, so `TEXTS(t)` is valid for `readcheck.js`, then loads the frames it needs and draws again).
- `timeline.json` - captions (`|` chunks and `{keyword}`), voice start times, silences and hits; read by the page, `tools/cues.py` and `audio/mix.py`.
- `tools/prep.sh` - every video shot as a 30 fps JPEG sequence at its display size (crop, lanczos, unsharp, delogo); report pages; photos; map projection.
- `audio/mix.py` - sampled score from the timeline, foley from `events.json`, voice, natural sound, ducking.

## 11. Pitfalls

- Text that can't be read in its shot. Run `readcheck.js`.
- Two-line captions in 16:9 read as a slide. Split the sentence instead.
- Words stronger than the source: write what the source says.
- Blank first frames on transitions: start split/grid/sting animations 0.1-0.15 s before the cut so frame 1 already has picture.
- Station logos: crop them out; never park a caption over a logo.

## 12. Variation space

The agent decides per film: topic, the turn, which formats are spent where, footage, the channel's fictional name and colour (keep one accent colour), the title.

- **Three structures:** the inverted pyramid with a mid-film turn (bad number -> "really?" -> the document says otherwise -> why); a list of three that turns on the third; a countdown of numbers that ends on the one that matters.
- **Three openings:** the biggest number on frame 4; the document headline highlighted in the first second; a freeze on the event with a question.
- **Three endings:** a two-part verdict caption on footage with music returning after a silence; back to the hook's number, now re-read; the last data card's key point becoming the closing caption.


---

## `carousel-deck`

# 4:5 Editorial Swipe Carousel Film (`styles/carousel-deck`)

**Station**: Line 15 — Social, Mobile & Interactive Feeds

## Visual & Editorial Brief
Continuous horizontal pan across linked 4:5 magazine cards where graphs and tear-Lines cross slide seams.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `causal-loop`

# Systems Causal Loop (`styles/causal-loop`)

**Station**: Line 4 — Diagrams & Whiteboards

## Visual & Editorial Brief
Donella Meadows feedback-loop graph with reinforcing (+) and balancing (-) arcs and stock-and-flow tanks.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `census-mosaic`

# Unit Chart & Dot Census (`styles/census-mosaic`)

**Station**: Line 3 — Numbers & Charts

## Visual & Editorial Brief
1,000-dot population grid where individual icons regroup, color-shift, and filter to dramatize proportions.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `chalkboard`

# Chalkboard Lecture

Dusty slate-green blackboard (`#1e3329`) with wooden chalk tray, ruled grid faint lines, and multi-colored calcium-carbonate chalk strokes (`#f2efe6` white, `#f5d56e` yellow, `#f08a7e` coral, `#7ec8e3` cyan, `#9be39b` mint). Equations, free-body diagrams, and underline callouts draw live with dry chalk jitter and dust particles while the narrator derives each step.

## Visual Grammar
- **Surface**: Slate board `#1e3329` with subtle eraser smudge ghosts (`rgba(242,239,230,0.06)`), chalk dust speckle, and warm overhead classroom lamp falloff.
- **Stroke Physics**: Double-pass rough stroke with variable pressure (`1.5px–3.5px`) and chalk grain gaps (`setLineDash([4, 1.5])`).
- **Typography**: Handwritten chalk display + monospace formula labels (`JetBrains Mono` / `IBM Plex Mono`).
- **Motion**: Stroke-by-stroke progressive draw (`seg(t, t0, t1, out3)`) synced to spoken keywords; chalk dust puff on impact underlines and boxed final results.


---

## `chat-transcript`

# Encrypted Messenger Forensics (`styles/chat-transcript`)

**Station**: Line 15 — Social, Mobile & Interactive Feeds

## Visual & Editorial Brief
Timestamped message bubbles, typing indicators, voice-note waveform scrubs, and leaked attachment previews.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `city-symphony`

# City Symphony - Style Prompt

A city film cut like a piece of minimalist music: time-lapse turns traffic, crowds and clouds into rivers of light, the cuts get denser with the score's subdivisions, one thing is slowed almost to a stop, and the film ends on a hard cut to black on a downbeat. No narrator. The music carries it. Grammar learned from the city-symphony tradition and the "Qatsi" films (Reggio / Fricke, scores in the Philip Glass manner). Nothing is taken from those films: no footage, no melody, no title lettering, no names in the film.

## 1. Essence, and what it is not

- **An edit style.** The picture is real footage of a place (time-lapse, hyperlapse, aerials, slow motion, archive film, photographs). The style lives in how time is bent and where the cuts fall, not in a drawn look.
- **The score is the script.** It is written first, with a clear arc: minimal repetition -> acceleration -> climax -> a sudden stop -> acceleration again -> hard stop -> a quiet coda. Every cut sits on a beat or a subdivision of it.
- **Machines fast, people slow.** Cars, trains, clouds and light are sped up until they become lines; the one slowed moment is something fragile (a soap bubble, steam, a flag, a flock), and people appear as crowds, tracks or long-exposure ghosts.
- **Few words, each one earned.** On-screen text is a title, a handful of numbers that state the size of the place (each from an official source), an archive date, and one line from a real public-domain text at the end.
- It is not a travel reel, a vlog, a news package, an explainer with a narrator, or a slideshow of postcards.

## 2. Materials & rendering

- **Footage only (2D).** Sources mixed freely: tripod time-lapse, long single-camera time-lapse (>= 12 h, sunrise and sunset in the same frame), hyperlapse, drone aerials (top-down is gold), high-frame-rate slow motion, archive film (pre-1931), photographs, a scanned page of a historic text.
- Everything is unified into one 35 mm release-print look: 1.85:1 matte (21 px bars on 1920x1080), warm highlights, lifted blacks, highlight bloom, clumped mid-tone grain, +-0.5 px gate weave, soft vignette.
- Never generated images; never restored, colourised or speed-corrected archive copies. Upscale limits: archive <= 2.5x; modern <= 1.5x.

## 3. Colour logic

| Use | Value |
| --- | --- |
| Type (warm white) | `#EDE8DF` |
| Secondary line (English, labels) | `#B0AAA0` |
| Sodium orange - the only accent (rules under numbers, source lines, crowd tracks, the day ring's hand) | `#D9772F` |
| Matte and black | `#000000` |

## 4. Type & subtitles

- **Latin:** Michroma (OFL), capitals, tracking 0.06-0.32 em. **Chinese:** Noto Sans SC variable, weight 300-350, tracking 0.08-0.14 em. Left-aligned, left margin 168-196 px, never centred, never on a box.
- **Number card:** the number in Michroma 84 px (44 px when three numbers stack); a 2 px sodium rule grows under it; one line says what it counts and the source year. A census-type number locks digit by digit on sixteenths (one glockenspiel note per digit); a flow number counts up from 0 in 0.6 s.

## 5. Motion quality

- **Speed is the main instrument.** Shot speeds run from 0.3x to 75x; every speed above 1x uses frame blending (a 360 deg shutter): each output frame averages the source frames it covers, capped at N frames. Headlights become continuous lines, crowds become fog, clouds become water.
- **Speed ramps** are smooth (`smoothstep` between key speeds) and always mean something: a corridor accelerates out of real time (1x -> 6x), a time-lapse ramps into a frenzy (1x -> 7x), a fast shot brakes into slow motion (2.2x -> 0.3x in 0.55 s) on the bar where the music stops.

## 6. Camera grammar - editing

| Score texture | Cut length | Frames | Use |
| --- | --- | --- | --- |
| Opening hit + eighth-note arpeggio | 2 bars -> 1 bar | 120 -> 60 | the opening still, the first single-camera time-lapse |
| Eighths | 2 beats -> 1 beat | 30 -> 15 | dawn, match cuts |
| Triplets against eighths (3:2) | 1 beat -> 1/2 beat | 15 -> 7/8 alternating | morning, the montage of streets |
| Sixteenths, full ensemble | grid cells light every 1-2 frames; cells re-cut every sixteenth | 1-4 | the grid |
| Arpeggios stop, one long chord | 3-4 s, one or two shots | 90-120 | the brake: the slowed thing, the archive split |
| Sixteenths + triplets + horns | 1/2 beat -> 4 frames -> 2 frames | 7 -> 4 -> 2 | dusk to night, the reverse flashback |
| Dry cut of the whole ensemble, reverb left ringing | hard cut to black on the bar line | - | the hard stop |

## 7. Sound palette

- **Music only.** No narrator, no source sound, no sound effects.
- **Orchestration** (sampled, CC0 - `core/audio/sampler.py`): pipe organ, winds staccato (flute, clarinet), strings (spiccato and sustained), horn pair, concert bass drum, suspended-cymbal crescendos, glockenspiel only for numbers locking.
- Master to -14 LUFS / true peak <= -1 dBTP with `core/render/mux.sh`.

## 8. Native moves

- **Light river:** integrate the speed curve to source time; each output frame averages the source frames in its window.
- **Speed ramp:** smoothstep between key speeds.
- **Brake into slow motion:** ramp 2.2x -> 0.3x with motion interpolation or crossfade.
- **Crowd -> tracks (people as data):** per-pixel median background on fixed camera; centroids of moving people joined with 2 px sodium lines that fade x 0.9 per frame.
- **Grid:** `1x2 -> 2x2 -> 3x3 -> 4x4`, one stage per half bar or bar, cells re-cutting on every sixteenth in the last beat.
- **Counterpoint split:** two halves, archive left, today right, the same kind of place or shape.
- **Day/night flicker:** two 15-frame clips from the same camera (noon, night), alternating every 2 frames.
- **Number lock:** one digit locks per sixteenth with a glockenspiel note.
- **Hard stop:** picture cuts to black on the bar line; music's dry signal cut in 15 ms; only reverb remains.


---

## `classic-mac-os`

# 1-Bit Classic Desktop OS (`styles/classic-mac-os`)

**Station**: Line 5 — Code, Terminals & OS

## Visual & Editorial Brief
Susan Kare / System 7 1-bit Atkinson dithered windows, Chicago pixel typography, and striped title bars.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `clinical-mri-hud`

# Diagnostic Radiology & ECG (`styles/clinical-mri-hud`)

**Station**: Line 12 — Science, Medicine & Nature

## Visual & Editorial Brief
DICOM axial/sagittal slice viewer with anatomical crosshairs, vital waveforms, and pathology callout tags.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `constructivist-litho`

# El Lissitzky Proun Lithograph (`styles/constructivist-litho`)

**Station**: Line 9 — Painting & Fine Art

## Visual & Editorial Brief
Suprematist geometric wedges, floating architectural beams, and bold Cyrillic/Latin poster typography.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `corkboard-string`

# Detective Corkboard & Red Yarn (`styles/corkboard-string`)

**Station**: Line 13 — Collage, Paper & Craft

## Visual & Editorial Brief
Pinned Polaroids, index cards, newspaper clippings, and taut red yarn connecting entities across a board.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `countdown`

# Live Countdown Split-screen - Style Prompt

An edit style, not a look. Real footage of one event with a known zero (a launch, a verdict, a final whistle, polls closing), shown in real time: screen time equals event time, a clock ticks every second, and the screen splits into more and more cells as the moment nears, every cell showing the same second. At zero the cells merge into one picture and the clock flips. References (grammar only): the real-time clock and splitting screens of the TV series 24; the multi-camera archive panels and mission-time codes of the documentary Apollo 11 (2019). Never copy their type, colours, sounds, graphics or shots, and never name them in the film.

## 1. Essence, and what it is not

- **Real time.** One continuous stretch of the event, never cut, never re-ordered, never sped up. Slow-motion sources are played back at real speed. The clock and the picture can be checked against each other at any frame.
- **The clock is the lead.** It ticks every whole second (sound and a falling digit), it says who is in control, and it changes state at zero.
- **Cells show the same second.** Every video cell is synced to the clock, or says plainly that it is not (§8, "sync badge").
- **The layout is the edit.** Cuts are layout changes, and every layout change lands on a real spoken call or event in the native sound, not on the music.
- **More cells, closer to zero; one picture at zero.** The number of cells is the tension curve.

Not a montage (time jumps), not a security wall (the layout never moves), not a flashback structure (real time cannot go back), not a slide deck.

## 2. Materials & rendering

- **Three kinds of material at once:** video cameras of the same moment (2-8), documents (a fact sheet, a filing, a schedule: shown as paper, never retyped as a slide), and photographs (the people of the day).
- **Data drawn by us:** checklists, bars, a flight or process profile, a second countdown to the next milestone. Every number comes from an official source (§10).
- **Cells:** hard rectangles on near-black `#06080A`, 24 px outer margin, 8-9 px gutters, 1 px border `rgba(222,232,238,.16)`, a light radial vignette (to 36 % black) on video cells. No rounded corners, no drop shadows, no 3D.
- **Camera chip** top-left of every cell: dark plate 84 %, a square dot (orange = synced video, grey = unsynced or still), code (`CAM 4`, `DOC`, `LIST`), name.
- **Burned-in text in the sources** (broadcast bugs, camera IDs, timers, tracker readouts) is cropped by a per-shot usable region, or blurred out (`ffmpeg delogo`) after it has been used for syncing.
- **One grade for every source (ffmpeg):** `eq=contrast=1.07:saturation=0.9:gamma=0.97:brightness=-0.01,colorbalance=rs=-0.02:bs=0.03:rh=0.03:bh=-0.02`, then film grain 1 at the master (`mux.sh ... 1`).

## 3. Colour logic

| Role | Value |
| --- | --- |
| Ground | `#06080A`; panels `#0B0E11` |
| Main text | `#F2F5F7`; secondary `#7C878D` |
| Accent: the T- sign, synced dots, ticks done, event flags, active control segment | `#FF5B1F` |
| Speaking light, "heard" tags | `#FF3B30` |
| Plates over full-screen footage | `rgba(6,8,10,.80)` |
| After zero, the clock block | ground `#FF5B1F`, text `#0A0B0C` (inverted) |

Orange means "now / synced / done". Grey means "pending / not synced". Nothing else is coloured; colour belongs to the footage.

## 4. Type & subtitles

- **Clock digits:** a condensed sans with fixed-width digit slots (Barlow Condensed SemiBold, drawn digit by digit in equal slots so the clock never jitters); size up to 132 px, the `T-/T+` sign at 0.85x, tenths at 0.41x in grey, a ten-segment sub-second bar under it.
- **Text:** Noto Sans SC 500/700, Barlow, and IBM Plex Mono for labels, codes and small print.
- **The live transcript is the subtitle.** A fixed box (bottom right, or a cell in the grid): a speaking light and the speaker type (commentary / loop / narrator - the narrator is marked in orange so it is never mistaken for the event's audio), the line appearing word by word at the spoken times (0.08 s fade per word, a block cursor).

## 5. Motion quality

- 30 fps.
- **Clock:** on each whole second the new digits drop 14 px in 0.12 s (ease-out); the sub-second bar empties one segment per 0.1 s (fills after zero).
- **Re-layout:** 0.34 s `easeInOutCubic`. Cells that stay interpolate their rectangles; new cells open from their left edge; leaving cells close to the left; a new cell flashes a 3 px orange border for ~0.2 s when it lands.
- **Photographs** push in <= 6 % over their whole stay; names pop one by one 0.16 s apart. **Documents** move their window down a row in 0.45 s; the highlight sweeps left to right in 0.35 s.

## 6. Edit grammar

- **Screen time = event time.** One mapping, `M = t - T0`, for the whole film. Each camera has its own source offset (`s = M + c`) measured once and baked into the frame extraction.
- **Cut points are calls.** Each layout change starts on the first word of a real call in the native audio ("ten", "go for...", "ignition", a name) or on an event visible in the footage.
- **Cell count rises toward zero:** 1 -> 2 -> 3-4 -> many (6-9, the clock itself becomes the centre cell, the transcript a cell) -> one at zero -> a few again after zero -> one under the title.
- **Silence before zero:** the music drops out a quarter-second before zero; only the native sound and the clock remain.

## 7. Sound palette

1. **Native sound** - the event's own audio (commentary, radio loops, crowd), high-pass 90 Hz, compressed, always on top; never ducked.
2. **Narrator** (sparingly, only in gaps of the native sound, never over it): clean and close.
3. **The clock:** a tick every whole second (two alternating pitches around 1.5-1.9 kHz, panned +-15 %), louder in the last ten seconds, a soft single pitch after zero.
4. **Interface foley** from `window.EV`: re-layout whoosh + metallic snap; cell pop snap; checklist tock; event-flag whoosh; full-screen cut thump.
5. **Score, 60 BPM** so one beat = one second = one tick: a low synth drone whose low-pass opens toward zero, a bass drum per beat, off-beat hats, a tom per spoken count, timpani roll into zero, silence, then a low brass major chord with bass drum, crash and tubular bell at zero.

## 8. Native moves (and how to build them)

- **Many into one.** At zero, every cell moves to its tile of the full frame while each tile cross-fades to the same full-screen shot, chips and borders vanish, a warm white flash peaks, and the clock and transcript slide back to the bottom. 0.42 s.
- **Clock inversion.** At zero the clock block flips from dark with an orange `T-` to orange with dark `T+`, and its header changes (countdown -> elapsed).
- **Control strip.** Segments in the clock header (who has control: ground -> vehicle -> mission control); the active one fills orange on the call that hands it over.
- **The grid fills on the count.** Empty grid slots show as dashed "standby" frames; each spoken number opens one camera.
- **Sync badge.** Top-right of each video cell: `LIVE SYNC` (synced), `SAME WINDOW` (hatched, grey: footage from the same minutes without a usable clock), `1x REAL-TIME` (slow-motion re-timed).
- **Planned vs heard checklist.** Official milestones with their planned times tick as the clock passes them; when the native audio actually says one, a red `heard -32.1` tag with a small waveform appears beside it.
- **Second countdown.** After zero, a smaller clock counts to the next official milestone along a schematic profile drawn by time.
- **Event flag.** An orange bar with black type slides in at the bottom of the relevant cell on its call.
- **Punch-in on a call.** A hard digital punch-in on the relevant detail when the commentary names it.
- **Document by rows.** A paper close-up shows two or three rows; a highlight bar and an annotation band below the paper translate the row.

## 9. Pitfalls of the medium

- Unsyncable footage: never fake it; label the cell "same window · not frame-synced".
- Measuring zero: never trust metadata; combine two independent marks (a visible event and the spoken word timing).
- Audio and picture of one file can disagree: sync each camera on its picture.
- Slow-motion sources: measure the factor from two events with a known gap and re-time with `setpts=PTS/k`.
- The clock jitters if digits are proportional: draw them in fixed slots.

## 10. Materials, sources, facts, engine

- Ask the user first for their own material; fallback to NASA, NOAA, NARA, DVIDS, Internet Archive (PD/CC0/CC BY), Wikimedia Commons (CC0/PD/CC BY).
- Keep `FACTS.md` covering every number, time, name and call on screen and in the narration.
- Engine: `demo/index.html` (Canvas 2D: `LAY` layout keyframes with `grid` / `merge` / `cut` / `swap`, `camRegion()`, `crop()`, `drawClock()`, `drawTx()`, `drawCheck()`, `drawDoc()`, `drawProfile()`, `drawThrust()`).

## 11. Variation space

The agent decides per film: the event, where real time starts and ends, the number of cameras, which documents and data, the control segments, the narrator's lines (or none), the closing layout.

- **Clocks:** `T-/T+`; a match clock; a wall clock (`HH:MM:SS`) for a news day; a countdown to a deadline that then counts up as "overtime".
- **Three structures:** rising cells to a merge; one cell that splits outward after zero; two parallel countdowns side by side that meet at zero.
- **Three openings:** a single wide shot and the first call; the clock alone on black, then the first camera opens; a document (the schedule) with the first item ticking.
- **Three endings:** the inverted clock over one full-screen shot; the grid refilling with consequences, then one title; the second countdown reaching its own zero.


---

## `courtroom-exhibit`

# Courtroom Exhibit Board (`styles/courtroom-exhibit`)

**Station**: Line 1 — Real Material & the Newsroom

## Visual & Editorial Brief
Legal exhibit board with numbered yellow evidence stickers, transcript callout zooms, and timeline pins.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `cyanotype-darkroom`

# Silver-Gelatin Darkroom Contact Sheet (`styles/cyanotype-darkroom`)

**Station**: Line 10 — Analog Film, Tape & Optics

## Visual & Editorial Brief
35mm contact sheet strips under red safelight with wax chinagraph crop marks and loupe magnification.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `cyberpunk-kanji`

# Neo-Tokyo Telemetry HUD (`styles/cyberpunk-kanji`)

**Station**: Line 14 — Cinema Titles & Genre Homage

## Visual & Editorial Brief
Akira / Ghost in the Shell high-density bilingual telemetry readouts, sodium-vapor red trails, and grid scan.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `dark-keynote`

# Dark Keynote Stage

Apple-event obsidian stage (`#07080c`) with subtle radial floor glow, crisp SF/Inter display headlines, high-contrast bento spec cards (`#11141d` with `1px solid rgba(255,255,255,0.09)`), hero hardware/metric callouts, and choreographed spring transitions.


---

## `dataviz`

# Data Storytelling - Style Prompt

A chart that tells a story: real data, drawn mark by mark on cream paper by a red-blue pencil, with handwritten notes pinned to the numbers. The chart itself is the camera, the rhythm and the plot. References (grammar only): Hans Rosling's 200 Countries, 200 Years, 4 Minutes (one dot is a character), Ed Hawkins' warming stripes (a diverging ramp on a reference mean, no axes), The Pudding / NYT scrollytelling (one idea at a time, growing axes, pinned notes). Copy none of their charts, layouts or typefaces; never name them in the film.

## 1. Essence, and what it is not

- **The chart is the film.** Every mark is a real number and every movement is a meaningful chart operation (a mark lands, an axis grows, the scale changes, a series morphs, a note is pinned).
- **The data is real, openly licensed and traceable.** You change the framing, never the numbers.
- **Pick the chart the data asks for:**

| The data is about | Chart |
| --- | --- |
| comparing categories, rankings | bars, a ranked bar race |
| a relationship between two measures | scatter or bubble chart (one dot can be a character) |
| place | map, choropleth, dots on a map |
| parts of a whole, counts of people | unit / waffle chart, proportional squares |
| before -> after | slope or dumbbell chart |
| a distribution | histogram, beeswarm |
| where things go | flow / Sankey |
| change over time | line or dot series, stripes, area |

- **Three layers make it a story, not an infographic:** a human scale (handwritten notes pinned to marks), a performer (a physical pencil that draws every mark), and sonification (each mark is a pitch; the trend is heard before it is read).

Not a dashboard (one idea at a time), not a keynote with charts (no slides), never decoration.

## 2. Materials & rendering

- **Paper:** warm cream, fixed-seed fibre noise and a faint dot grid in world space.
- **Ink:** dark warm ink for axes and series, pale warm grey for grid and zero line, IBM Plex Mono ticks.
- **Marks:** data dots carry a thin ink ring so pale values stay visible on cream. A mark lands with a short pop and a thin ripple.
- **Handwriting** (Caveat) in pencil, per-glyph jitter, graphite grain, written on as the tip dances over the x-height. Leaders are wobbly curves ending in an un-closed ring around the mark.
- **The red-blue pencil:** hex body, blue half / red half, sharpened wood cone. Only the tip end shows, from the lower right; its shadow drifts farther and softer with lift.
- **Layout:** a plot box fixed in world space, a memory zone for early notes, every note pinned in data space (value + pixel offset) so rescales keep the layout, a bottom band for the caption.

## 3. Colour logic

- **Colour encodes one thing: the value.** Diverging data uses a ramp (ColorBrewer RdBu family) centred on the mean of a meaningful reference period, with a symmetric span; data with no natural centre uses one sequential ramp. Everything else is ink on cream.
- **Honesty beats drama:** pale values stay pale; never stretch a ramp to make a change look bigger.
- **The two pencil leads have meanings:** blue for memories and human notes, red for records and warnings. A change of lead marks a turn.

## 4. Type & subtitles

- **The subtitle is the figure caption:** a text serif (Newsreader), ink colour, left-aligned with the chart, <= 2 lines, with a hairline rule above it and a small mono kicker for the range drawn so far. Hold >= `max(1.8 s, speech + 0.6 s)`.
- **The title** is the chart's own headline (Newsreader), set in world space above the plot; it fades when the camera is close and returns with the full view.

## 5. Motion quality

- **The rhythm of the data is the rhythm of the film.** Map the marks to a musical grid; to accelerate, divide the beat instead of changing tempo.
- **Pencil acting:** lift before each tap, land with the shadow meeting the tip, a tiny rebound; hurry as data densifies, tremble like a seismograph needle at a peak.
- **Rescale** reads as ratchet clicks (stepped, each step eased); a calm rescale is smooth.
- **Morph:** a staggered sweep, each mark easing into its new form; notes fade as it passes and return as tiny marks.
- Transitions are chart operations: axis growth, pull-backs, rescales, morphs, a cell widening into the next frame.

## 6. Camera grammar

A 2D camera `{x, y, zoom, roll}` over one sheet of paper. A film is one take; a hard cut is rare and meaningful.

| Move | Expresses | Can serve |
| --- | --- | --- |
| Extreme close-up on one mark, following its leader | One fact, one life | a single case; a named person |
| Full view first, then dive to one mark | The pattern before the case | a familiar trend; a myth to correct |
| Pull back as axes grow out of the marks | The frame arrives with the unit | naming the measure; widening a claim |
| Track the pencil, newest mark at ~60 % of width | Progress: the past behind, the future ahead | a series in time; a race; a queue |
| Pedestal with rising data, a Dutch angle creeping in | Escalation, unease | runaway growth; a debt |
| Punch-in over 2 frames, decaying shake, jolt on rescale | Surprise, a broken frame | an outlier; a crash |
| Fast pull-out, roll, small constant tremor | A rush | a boom; a cascade; a panic |
| Locked-off | The transformation is the movement | a morph; a slow reading |
| Hold on one mark, then pull back | The part inside the whole | a verdict; context |
| Pull and pan to add more real data | Scale switch | a longer record; the rest of the list |
| Lateral pan across notes in the memory zone | Recollection | a biography; a timeline of events |

## 7. Sound palette

- **Ambience** follows the places the notes evoke (J-cuts in, L-cuts out).
- **Foley** is graphite, paper and wood: tick-and-paper taps, scratches for handwriting, a ruler hiss for axes, a paper puncture for a broken frame, a wooden click for the pencil flip, ratchet teeth for a rescale, a paper sweep for a morph.
- **Sonification is the music:** pitch = value, rhythm = time density. Low values snap to a pentatonic scale, middle ones to semitones, extreme ones unquantized.
- **Silence is a tool:** true digital silence where the data should be heard alone, before a key mark, a morph or a verdict.

## 8. Native moves

- **One mark = one fact.**
- **Axes grow with the story.** The y axis arrives when the narration first names the unit.
- **Pinned annotations.** Their content and colour carry the arc.
- **Breaking the frame.** The chart must make room; the torn edge stays as a scar.
- **Encoding morph.** Bars into a waffle, a map into a ranking, a line into a slope: the reveal of the whole.
- **Scale switch.** One value -> the series -> a longer real record, never extrapolated.
- **The empty next cell.** A dashed slot for the value nobody knows yet.

## 9. Pitfalls of the medium

- Select data columns by header name, never by index; print every fact the narration claims.
- Notes collide with later data -> data-space pins, a memory zone.
- A frame break rescaled too fast is invisible -> hold the pierced state >= half a beat.
- Helpers that set `globalAlpha` must multiply the incoming alpha, or fades skip them.

## 10. Engine

`demo/engine.js` (Canvas 2D, world units = chart pixels at zoom 1): paper, camera, value ramps, `pencilStroke`, `inkShape`, `plotShape`, `handText`, `dataDot`, `morphMark`, annotation geometry, `drawPencil`, `caption`. `demo/music/score.py` holds the sonification.

## 11. Variation space

- **Structures:** a ranked race; a map that becomes a count; before -> after dialogue.
- **Openings:** the finished chart; the object before the axis; the question first.
- **Endings:** one mark, close; back to the object; the headline revised.


---

## `design-system-spec`

# UI Design Tokens & Spec Sheet (`styles/design-system-spec`)

**Station**: Line 11 — Keynote, Brand & Product

## Visual & Editorial Brief
Figma-style component anatomy canvas with redline pixel spacing measurements, token pills, and state matrix.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `desktop-flythrough`

# 3D Desktop Flythrough

Three.js perspective camera gliding over a dark studio desk where browser windows, terminal panes, code cards, and metric popups float at staggered Z-depths with parallax shadows, depth-of-field cues, and smooth spring camera Dolly/Pan moves (`core/lib.js` `inOut3` + `spring`).

## Visual Grammar
- **Camera**: `THREE.PerspectiveCamera(38, 16/9, 0.1, 100)` or CSS 3D `perspective: 1200px` stage with keyframed `(x, y, z, rotX, rotY)` targets per scene beat.
- **Window Cards**: Dark frosted glass `#12151c` with `1px solid rgba(255,255,255,0.12)` bezel, macOS traffic-light dots, syntax-highlighted code lines, and active cursor highlight bar.
- **Lighting & Post**: Soft spotlight cone + subtle CRT/bloom pass (`core/three/post.js`).


---

## `dictionary-plate`

# Encyclopédie & Lexicon Entry (`styles/dictionary-plate`)

**Station**: Line 8 — Print, Editorial & Typography

## Visual & Editorial Brief
Diderot / OED lexicographic entry dissecting etymology, phonetic pronunciation, and numbered definitions.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `editorial-lookbook`

# Luxury Editorial Lookbook (`styles/editorial-lookbook`)

**Station**: Line 11 — Keynote, Brand & Product

## Visual & Editorial Brief
High-fashion magazine spread with high-contrast Didone serifs, generous negative space, and fabric macro zooms.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `election-desk`

# Choropleth & Precinct Desk (`styles/election-desk`)

**Station**: Line 3 — Numbers & Charts

## Visual & Editorial Brief
High-contrast cartographic county/state swing board with margin bars and demographic breakdown drawers.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `engraving`

# Copperplate Engraving

18th-century intaglio banknote and scientific treatise engraving: cotton rag paper (`#f2eadb`), iron-gall ink (`#1d1a16`), parallel cross-hatching lines whose density encodes tonal shadow, baroque scroll frames, and Roman small-caps figure plates (`FIG. I`, `TAB. IV`).


---

## `feynman-spacetime`

# Spacetime & Minkowski Diagram (`styles/feynman-spacetime`)

**Station**: Line 12 — Science, Medicine & Nature

## Visual & Editorial Brief
45-degree light cones, worldlines, relativistic Lorentz grid shear, and wave-packet interference.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `film-leader`

# 16mm Film Leader & Splice (`styles/film-leader`)

**Station**: Line 2 — Cut & Rhythm

## Visual & Editorial Brief
SMPTE countdown leader, grease-pencil frame marks, sprocket holes, and cement-splice flash transitions.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `financial-ledger`

# Financial Terminal & Ledger (`styles/financial-ledger`)

**Station**: Line 3 — Numbers & Charts

## Visual & Editorial Brief
Bloomberg / FT dark financial desk with tabular-numeral tickers, candlestick zooms, and yield-curve spreads.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `flight-radar`

# Air Traffic & Radar Scope (`styles/flight-radar`)

**Station**: Line 7 — Maps & Wayfinding

## Visual & Editorial Brief
Polar radar sweep with aircraft transponder vectors, altitude flight-level tags, and holding-pattern arcs.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `flowchart-engine`

# State Machine & Flowchart (`styles/flowchart-engine`)

**Station**: Line 4 — Diagrams & Whiteboards

## Visual & Editorial Brief
Decision-tree nodes and logic gates lighting up as a signal packet traverses branches in real time.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `fresco-secco`

# Renaissance Fresco & Sinopia (`styles/fresco-secco`)

**Station**: Line 9 — Painting & Fine Art

## Visual & Editorial Brief
Lime-plaster wall showing red-earth sinopia underdrawing morphing into full architectural perspective fresco.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `geopolitical-atlas`

# Strategic Geopolitical Atlas (`styles/geopolitical-atlas`)

**Station**: Line 7 — Maps & Wayfinding

## Visual & Editorial Brief
Foreign Affairs / Le Monde Diplomatique relief map with choke-point arrows, buffer zones, and treaty legends.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `git-dag`

# Git Commit DAG & Diff (`styles/git-dag`)

**Station**: Line 5 — Code, Terminals & OS

## Visual & Editorial Brief
Animated commit graph branching, rebasing, and highlighting exact line diffs inside a dark IDE canvas.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `halftone-dossier`

# Halftone Print Dossier

1970s investigative newspaper & archival microfiche clipping collage: newsprint cream stock (`#ece4d3`), CMYK halftone dot matrices (`45°` / `15°` / `75°` screen angles), torn paper edges, highlighter sweeps (`rgba(240, 210, 65, 0.55)`), red grease-pencil circles, and stamped classification headers.


---

## `herbarium-specimen`

# Pressed Herbarium & Field Journal (`styles/herbarium-specimen`)

**Station**: Line 12 — Science, Medicine & Nature

## Visual & Editorial Brief
Naturalist linen sheet with mounted botanical specimen, Latin binomial label, and dissection scale sketch.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `hologram-hud`

# Sci-fi Hologram HUD - Style Prompt

An object is scanned into a glowing wireframe. Target boxes lock onto its parts; each opens in a local exploded view, a leader pulls out, and its number rolls from garbage glyphs into the real value. It may light up, once, into a solid hologram. References (grammar only): the Iron Man / Avengers HUDs (target boxes, callouts, rolling numbers, layered depth); the Oblivion interfaces (one colour, hairlines, space); CAD exploded views. Copy none of their layouts, icons, fonts or colours.

## 1. Essence, and what it is not

- The subject is always a **line wireframe made of light** above a round projector pad on a near-black stage, never a rendered object. Everything reads as scanned data: a scan plane grows the model, parts pull apart along their assembly axes, numbers are computed on screen.
- **Three depth layers** are always present: a background dot grid (slow parallax), the subject with its pad and floor, and the foreground HUD (corner brackets, rulers that parallax faster, status text).

## 2. Materials & rendering

- **Stage:** near-black tinted by the hue, a radial lift behind the subject, a fading dot grid, a strong vignette.
- **Projector pad** in true perspective: concentric rings (one bright, one dashed), ticks, faint rays; it rotates slowly and spins with any turntable move.
- **Wireframe:** additive ~1.3 px strokes in a few alpha levels set by depth fog (near bright, far ~25 %), plus two low-res glow passes.
- **HUD furniture:** corner brackets, parallaxing rulers, `subject // mode` top left, a live status line top right, telemetry at the bottom. Every text block has its own dark plate (translucent near-black, 1 px border, corner ticks).

## 3. Colour logic

- **One cold hue plus one warm accent**, both parameters (e.g. mint/orange, violet/lime, ice-blue/red).
- The hue carries lines, HUD and fills. **The accent is spent on locked values only:** a number turns accent-coloured at the frame it becomes true.
- **White is heat:** near-white edges and one-frame flashes mark what is active.

## 4. Type & subtitles

- **Rajdhani**, all caps: Light for big numbers and the product name (wide tracking), Medium/SemiBold for labels. **Share Tech Mono** for micro data (coordinates, counters, zoom).
- **Subtitles are HUD:** a dark plate with corner brackets and "voiceprint" bars moving with the speech, near-white Rajdhani Medium, bottom centre; hold >= `max(1.8 s, speech + 0.6 s)`.

## 5. Motion quality

- Everything on ones at 24 fps. Only glyph scrambling steps, every frame.
- **Target lock:** oversized, rotated 45 deg, faint; snaps to fit in ~0.2 s (cubic ease-out), flashes white 3 frames on the downbeat.
- **Explode** along each piece's assembly axis: the shell slides along its own axis, the contents stay in place and glow.
- **Leader:** anchor ring -> diagonal -> horizontal to the card in ~0.5 s. **Rolling value:** characters lock right-to-left and turn accent on the downbeat with a one-frame flash.
- **Chip dock:** a finished value slides into a side rail and stays until the end.

## 6. Native moves

- **Scan growth** = "this is real data."
- **Target lock** = "look here now." The box is the camera.
- **Local explode** = "why the number is true."
- **Rolling digits** = the payoff beat.
- **Chip accumulation** = reading time.
- **Loupe** = two scales at once.
- **Solid hologram + beam** = "the whole is ready." Once, if at all.


---

## `illuminated-codex`

# Medieval Illuminated Manuscript (`styles/illuminated-codex`)

**Station**: Line 9 — Painting & Fine Art

## Visual & Editorial Brief
Calfskin vellum folio with burnished gold-leaf initials, ultramarine lapis borders, and marginalia diagrams.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `impasto-oil`

# Impasto Oil Painting (`styles/impasto-oil`)

**Station**: Line 9 — Painting & Fine Art

## Visual & Editorial Brief
Directional palette-knife oil brushwork with raking-light ridge highlights and rich chiaroscuro pigment.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `ink-wash-shan-shui`

# Sumi-e / Shan Shui Ink Wash (`styles/ink-wash-shan-shui`)

**Station**: Line 9 — Painting & Fine Art

## Visual & Editorial Brief
East Asian xuan-paper monochrome brush wash with atmospheric mist layers and vermilion artist seal.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `iso-infographic`

# Isometric Infographic - Style Prompt

A system diagram comes alive: an isometric diorama of flat three-tone blocks, thin ink labels and Isotype numbers, where things open up to show their insides and the numbers are drawn, not stated. References (grammar only): Monument Valley (true-isometric architecture, flat colour blocks, three fixed tones per face, a camera that pans and zooms but never breaks the projection); SimCity 2000-style cutaway dioramas (a floating board with soil strata, the whole system visible at once); Kurzgesagt (a question, a steady push forward, one clear visual metaphor per step, a change of scale when a number is too big to feel); Isotype, Otto Neurath / Gerd Arntz (repeated identical icons stand for quantity); Powers of Ten (a continuous dive through nested scales). Use none of their characters, buildings, icons, palettes or music.

## 1. Essence, and what it is not

- **Flat, true isometric.** No perspective, no outlines on solids; shapes are separated only by the three tones of each face. The projection never rotates or tilts.
- **Infographic furniture is part of the picture:** leader lines, label pins, dashed cut lines, hatched section faces, tracking rings, a legend, a route line all live in the world.
- **Numbers are built from icons (Isotype)**, and they add up.
- **A diorama:** the system sits on a floating board or plinth with a visible cross-section at its edges, on a pale ground.

## 2. Materials & rendering

- **Projection:** axes at 30 deg. `sx = (x - y)*cos30*k`, `sy = ((x + y)*0.5 - z)*k`; painter depth = `x + y + z`.
- **Three tones per face** chosen from its normal: top light, left (+y) mid, right (+x) dark.
- **Ink lines (2 px)** only for infographic elements: leaders, pins, cut lines, rings, routes, labels.
- **The board:** floats on a pale background with a faint isometric dot lattice and a soft blurred shadow; its front faces show strata where the section meets the edge.

## 3. Colour logic

- A pale neutral ground (cream, paper grey or pale blue) and 5-7 flat hues, each with its three tones; one ink colour.
- **Colour codes meaning**, the way a legend does: one hue per material or role. Never reuse a hue for two meanings.
- **The subject's hue is reserved:** when the story needs "this one", everything else desaturates toward warm grey and only the subject keeps its colour (focus + context).

## 4. Type & subtitles

- One geometric sans (Jost): titles 600 all caps with ~0.12 em tracking, numbers 400 large (~44 px), units at half size. All text has a ~7 px halo in the ground colour.
- **Label pins:** dot (ink ring, pale fill) -> vertical leader -> horizontal rule -> text.
- **The subtitle is a map label:** a pale card with a small radius and an ink border, a tiny iso cube as legend chip, sans ~42 px, bottom-centre. Hold >= `max(1.8 s, speech + 0.6 s)`.

## 5. Motion quality

- **Nothing moves without a line leading it:** a route line is drawn slightly ahead, a leader grows before an inset opens, a cut line draws before a skin slides away.
- **Cutaway:** cut line (~0.3 s) -> the near skin slides out along its normal and fades (~0.35 s, ease-out) -> hatched section rims fade in.
- **Isotype fill:** icons pop with a back-ease (overshoot), one per subdivision of the beat; count-up numbers run over the same span.
- Solids arrive by motion, never by alpha.

## 6. Native moves

- **Cutaway:** cut line, skin slides away, hatched rims remain.
- **Isotype number:** identical icons in a new arrangement each time.
- **Focus + context:** everything greys except the subject.
- **Frame within the frame:** a leader grows into a circular inset with a close-up.
- **Scale reveal:** pull back until every label is on screen and the last frame is a finished infographic.
- **Tracked subject:** one object followed with a "you are here" ring.
- **Strata cross-section:** the board's edge becomes the story.


---

## `kernel-panic`

# Hex Dump & Memory Map (`styles/kernel-panic`)

**Station**: Line 5 — Code, Terminals & OS

## Visual & Editorial Brief
Live hexadecimal memory address grid, stack frames, and register pointers stepping through an exploit or bug.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `kinetic-manifesto`

# Kinetic Typography Manifesto (`styles/kinetic-manifesto`)

**Station**: Line 8 — Print, Editorial & Typography

## Visual & Editorial Brief
Full-frame rhythmic word choreography where scale, weight, and counter-scrolling lines embody the voiceover.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `kino-montage`

# Constructivist Montage - Style Prompt

Real archive footage, photographs and documents, printed as one ink-and-paper poster with a single red, and cut on a machine beat. Diagonal bands carry the type; windows cut along the axis hold the film; people are scissored out of photographs and stacked into structures; numbers count, documents are marked in red, and two images collide to make a third idea. References (grammar only): Soviet montage cinema of the 1920s (city symphonies with split screens, counting and machine rhythm; "intellectual" montage where A + B yields a concept), constructivist posters and photomontage (red / black / paper, steep diagonals, photo cut-outs with geometric blocks, type as structure). Never copy their shots, layouts, slogans or lettering, and never name them in the film.

## 1. Essence, and what it is not

- **Evidence, recut.** Every picture is real material (archive film, photographs, documents) about the actual subject. The film's argument comes from how they are cut and set, not from illustration.
- **One printed sheet.** All material is converted to the same two-tone print (warm ink -> paper); red is the only colour and is laid on top as a printed element.
- **The beat is the editor.** Cuts, slams, wipes and counts sit on a 120 BPM grid (or the score's tempo); sections accelerate by halving shot length.
- **Type is structure.** Words and numbers are beams: on a -18 deg band, as solid blocks, stacked vertically. Never floating captions.
- **The collective over the individual.** Crowds, hands, machines and many small figures; a single face is never the protagonist.

## 2. Materials & rendering

- **Four kinds of element only:** bands (red or ink, along the axis), windows (rectangles or parallelograms holding film or photographs), cut-outs (people scissored from photographs with a paper-white border), type blocks. Plus one paper-fibre texture over everything.
- **The print grade** (one function for film, photos and documents): luminance -> percentile stretch (0.7 / 99.5) -> S-curve `x + s*(x-0.5)*(1-|2x-1|)*2`, `s = 0.32` (documents 0.18) -> map to ink->paper: `rgb = INK + (PAPER - INK)*g`.
- **Cut-outs:** person-segmentation mask -> 7 px paper border dilated outside the mask.
- **Documents:** scans at full resolution, never retyped. Marked with a red highlighter bar in `multiply` over the exact sentence, a hand-drawn red ellipse round a heading, a red circle on a map.
- **Resolution ceiling:** archive film <= 2.5x its source pixels on screen, modern footage <= 1.5x, photos >= 1 source px per screen px where possible.

## 3. Colour logic

| Role | Value | Use |
| --- | --- | --- |
| Red | `#D52B1E` | bands, wedges, blocks, the key number, marker bars, circles and leaders, the one winner in a comparison |
| Ink | `#141210` | type, beams under each floor, window borders, dark grounds |
| Paper | `#EDE4D0` | ground, reversed type, cut-out borders |

Everything photographic is ink-on-paper; nothing else has colour. Red is never laid on red: a red block on a red ground becomes ink. Alternate grounds to make cuts land: paper scene -> ink scene -> paper.

## 4. Type & subtitles

- **Display / slogans:** Noto Sans SC 900 (110-210 px).
- **Numbers, English display:** Oswald 600-700 (numbers 230-440 px; English lines 30-62 px, letter-spacing 2-10 px, capitals).
- **Source and footage tags:** Space Mono Bold (17-18 px on an ink or red tab, padding 6). Every archive window carries its footage tag (`FILM · <TITLE> · <PLACE> <YEAR>`, `PHOTO · <AUTHOR> <YEAR>`), every fact a source tag (`SOURCE · <PUBLISHER> <YEAR>`).
- **Subtitles:** bottom left, ink bar at 90 %, a 10 px red tick. Hold >= `max(1.8 s, speech + 0.6 s)`.

## 5. Edit grammar

- **Grid:** one tempo for picture and score (120 BPM: beat 0.5 s, bar 2 s). Every cut, slam, wipe and count lands on a beat, half-beat or sixteenth.
- **Shot length:** 0.5-2 s for footage; one idea per shot. A section may accelerate by halving: `0.5 -> 0.25 -> 0.125 s` (never shorter than 3 frames).
- **Cut rule:** adjacent shots conflict in at least one of direction (left slam / right slam), value (paper / ink ground), or geometry (diagonal band / upright window).
- **Transitions inside the medium:**
  - *red wipe:* a 260 px red band at 72 deg sweeps the frame in 0.25 s, landing on the downbeat;
  - *iris:* a red marker circle drawn on a map or photo becomes an aperture and opens onto footage;
  - *slam:* the next element arrives from outside along the axis in 0.08-0.2 s, ease-out, hard stop, frame shake (`amplitude 3-18 px, exp(-14*dt)`);
  - *flash cut:* one frame of 50-80 % paper over a window at a cut or freeze;
  - *hard cut* on the beat between grounds of opposite value;
  - *jump-in:* inside a freeze, a cut to a 1.2x crop of the same frame, the annotation scaling with it.

## 6. Sound palette

- **Score:** an original machine ostinato (eighths, minor) in spiccato cellos + staccato bassoon, staccato tuba / trombone on the beat, snare sixteenth taps, xylophone for counts, horn / trumpet stabs, timpani rolls, gran cassa + gong on the heaviest hit.
- **Original sound alternates with music:** in one section the orchestra stops and a real recording (a rivet gun, a machine, a crowd) carries the cut alone.
- **Foley for every printed action:** slam = low thump + steel clank; stamp = thump + clack; wipe and iris = whoosh; marker = filtered noise scrub; paper = band-passed rustle.

## 7. Native moves

- **The document is marked, not quoted:** the actual sentence on the scan gets a red bar; the number then becomes a red block.
- **The document becomes the chart:** drawings printed on a page are lifted off, turned and stood on a ground line to scale.
- **A + B -> idea:** two kinds of image alternate faster and faster until a card or a number states what the collision meant.
- **Count the many:** a counter driven by the cuts, a grid that fills cell by cell, a tower floor by floor.
- **People build the structure:** cut-out figures stacked into the thing they made (photomontage).
- **Silence, then the heaviest hit** into the result.


---

## `kyle-cooper-prologue`

# Se7en / Tactile Scratch Prologue (`styles/kyle-cooper-prologue`)

**Station**: Line 14 — Cinema Titles & Genre Homage

## Visual & Editorial Brief
Hand-scratched emulsion, jittering double-exposed notebook typography, and splice flashes.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `living-screencast`

# Living Screencast

Automated developer terminal & editor session where real commands type out with natural keystroke cadence (`45–85ms` with micro-pauses before flags), diffs highlight in green/red, and camera zooms smoothly into the active pane while a clean HUD callout explains the architectural change.


---

## `lowpoly-diorama`

# Low-Poly Isometric Diorama (`styles/lowpoly-diorama`)

**Station**: Line 6 — 3D Stage & Spatial

## Visual & Editorial Brief
Faceted flat-shaded 3D miniature world with tilt-shift depth and crisp directional sunlight.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `match-cut-reel`

# Match-Cut Essay (`styles/match-cut-reel`)

**Station**: Line 2 — Cut & Rhythm

## Visual & Editorial Brief
Geometric and typographic match cuts where a circle, horizon, or number morphs seamlessly across scenes.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `microfiche-reader`

# Library Microfiche & Amber Glass (`styles/microfiche-reader`)

**Station**: Line 10 — Analog Film, Tape & Optics

## Visual & Editorial Brief
Backlit negative-film microfiche viewer sliding across indexed newspaper frames with mechanical knob clicks.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `molecular-dynamics`

# Molecular & Crystal Lattice (`styles/molecular-dynamics`)

**Station**: Line 12 — Science, Medicine & Nature

## Visual & Editorial Brief
3D ball-and-stick atomic orbitals, protein folding ribbons, and bond-angle energy plots.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `museum-plinth`

# Gallery Plinth & Spotlight (`styles/museum-plinth`)

**Station**: Line 6 — 3D Stage & Spatial

## Visual & Editorial Brief
Dark museum gallery where an artifact or sculpture rotates on a lit stone plinth with curatorial placard zooms.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `napkin-sketch`

# Back-of-the-Napkin Ink (`styles/napkin-sketch`)

**Station**: Line 4 — Diagrams & Whiteboards

## Visual & Editorial Brief
Fountain-pen ink sketch on textured café napkin paper with quick cross-hatched arrows and margin notes.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `nautical-chart`

# Admiralty Nautical Chart (`styles/nautical-chart`)

**Station**: Line 7 — Maps & Wayfinding

## Visual & Editorial Brief
Parchment hydrographic chart with bathymetric depth contours, compass rose, rhumb lines, and shipping lanes.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `noir-venetian`

# Film Noir Venetian Shadow (`styles/noir-venetian`)

**Station**: Line 14 — Cinema Titles & Genre Homage

## Visual & Editorial Brief
High-contrast silver monochrome with diagonal slatted window shadows, cigarette smoke wisps, and bevel titles.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `optics-bench`

# Ray-Tracing Optics Bench (`styles/optics-bench`)

**Station**: Line 12 — Science, Medicine & Nature

## Visual & Editorial Brief
Prism, lens, and mirror optical bench splitting collimated light beams into spectral wavelengths.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `origami-fold`

# Geometric Origami & Crease Pattern (`styles/origami-fold`)

**Station**: Line 13 — Collage, Paper & Craft

## Visual & Editorial Brief
Mountain/valley crease diagram folding step-by-step into faceted 3D paper geometry.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `oscilloscope-lissajous`

# Analog Tektronix Oscilloscope (`styles/oscilloscope-lissajous`)

**Station**: Line 10 — Analog Film, Tape & Optics

## Visual & Editorial Brief
Phosphor-green CRT graticule plotting live waveforms, Lissajous phase figures, and frequency harmonics.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `packaging-dieline`

# Unfolded Packaging Dieline (`styles/packaging-dieline`)

**Station**: Line 11 — Keynote, Brand & Product

## Visual & Editorial Brief
Flat cardboard cut/fold dieline blueprint with Pantone swatches and 3D box fold preview.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `packet-trace`

# Network Packet & Protocol Trace (`styles/packet-trace`)

**Station**: Line 5 — Code, Terminals & OS

## Visual & Editorial Brief
Wireshark / BGP routing topology view where ASN nodes, TCP handshakes, and outage cascades pulse across links.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `paper-cutout`

# Layered Paper Cutout Diorama (`styles/paper-cutout`)

**Station**: Line 13 — Collage, Paper & Craft

## Visual & Editorial Brief
Multi-plane textured construction paper cutouts with soft drop shadows and stop-motion step cadence.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `patent-blueprint`

# Cyanotype & Patent Blueprint (`styles/patent-blueprint`)

**Station**: Line 4 — Diagrams & Whiteboards

## Visual & Editorial Brief
Prussian-blue cyanotype engineering sheet with white technical callout lines, datum arrows, and figure numbers.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `pitch-deck-memo`

# Sequoia / Stripe Executive Memo (`styles/pitch-deck-memo`)

**Station**: Line 11 — Keynote, Brand & Product

## Visual & Editorial Brief
Crisp narrative memo with embedded cohort tables, unit-economics waterfall, and highlighted thesis callouts.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `redacted-file`

# FOIA Redacted File (`styles/redacted-file`)

**Station**: Line 1 — Real Material & the Newsroom

## Visual & Editorial Brief
Declassified typewriter dossier with heavy black redaction bars that lift to reveal key sentences and stamps.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `retro-crt-terminal`

# Amber/Green CRT Terminal (`styles/retro-crt-terminal`)

**Station**: Line 5 — Code, Terminals & OS

## Visual & Editorial Brief
1980s P3 amber or P1 green phosphor command console with WebGL barrel curvature, scanlines, and block cursor.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `risograph-zine`

# Risograph Two-Drum Zine (`styles/risograph-zine`)

**Station**: Line 8 — Print, Editorial & Typography

## Visual & Editorial Brief
Soy-ink fluorescent pink and teal Risograph overprint with grain texture and slight drum misregistration.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `sankey-flow`

# Sankey & Supply Flow (`styles/sankey-flow`)

**Station**: Line 3 — Numbers & Charts

## Visual & Editorial Brief
Animated proportional flow ribbons tracking money, energy, or supply-chain bottlenecks from source to sink.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `satellite-briefing`

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


---

## `saul-bass-cutout`

# Saul Bass Title Sequence (`styles/saul-bass-cutout`)

**Station**: Line 14 — Cinema Titles & Genre Homage

## Visual & Editorial Brief
Mid-century jagged paper cutouts in flame orange, Hitchcock black, and bone white with jazz-timed kinetic bars.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `scrapbook-polaroid`

# Tape & Polaroid Field Scrapbook (`styles/scrapbook-polaroid`)

**Station**: Line 13 — Collage, Paper & Craft

## Visual & Editorial Brief
Masking-tape corners, instant photo frames developing in place, and grease-pencil date captions.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `seismic-helicorder`

# Seismograph & Wavefront Drum (`styles/seismic-helicorder`)

**Station**: Line 12 — Science, Medicine & Nature

## Visual & Editorial Brief
Rotating paper helicorder drum tracing P-wave and S-wave arrivals with epicenter triangulation arcs.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `silent-intertitle`

# 1920s Silent Film Ornate Intertitle (`styles/silent-intertitle`)

**Station**: Line 14 — Cinema Titles & Genre Homage

## Visual & Editorial Brief
Art Nouveau silver-filigree dialogue card on flickering nitrate stock with chamber accompaniment.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `small-multiples`

# Tufte Small Multiples (`styles/small-multiples`)

**Station**: Line 3 — Numbers & Charts

## Visual & Editorial Brief
Edward Tufte high-data-ink lattice of synchronized sparklines and horizon charts on warm off-white paper.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `split-diptych`

# Split Diptych (`styles/split-diptych`)

**Station**: Line 2 — Cut & Rhythm

## Visual & Editorial Brief
Side-by-side synchronous comparison panels contrasting two timelines, scales, or competing mechanisms.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `split-react-9x16`

# 9:16 Top-Footage / Bottom-Diagram Reel (`styles/split-react-9x16`)

**Station**: Line 15 — Social, Mobile & Interactive Feeds

## Visual & Editorial Brief
Vertical dual-deck stage: archival/news video clip on top, synchronized live data plot & kinetic captions below.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `staccato-cards`

# Staccato Title Cards (`styles/staccato-cards`)

**Station**: Line 2 — Cut & Rhythm

## Visual & Editorial Brief
Percussive full-frame typographic impact cards cut tightly to drum hits and voiceover stresses.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `stamp-philately`

# Postage Stamp & Cancellation Album (`styles/stamp-philately`)

**Station**: Line 13 — Collage, Paper & Craft

## Visual & Editorial Brief
Perforated engraved stamps on black stock with postmark cancellation waves and catalogue provenance.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `star-chart`

# Celestial Planisphere & Astrolabe (`styles/star-chart`)

**Station**: Line 7 — Maps & Wayfinding

## Visual & Editorial Brief
Deep-indigo astronomical chart with brass astrolabe rings, constellation vectors, and right-ascension grid.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `super8-home-movie`

# Kodachrome Super-8 Reel (`styles/super8-home-movie`)

**Station**: Line 10 — Analog Film, Tape & Optics

## Visual & Editorial Brief
Warm Kodachrome 40 film gate with rounded sprocket border, halation bloom, light leaks, and 18fps jitter.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `swiss-motion`

# Swiss Grid Poster in Motion

International Typographic Style (Josef Müller-Brockmann / Karl Gerstner): asymmetric modular 12-column mathematical grid, hairline rules (`1px solid #141413`), stark high-contrast ground (`#f3efe6` warm paper or `#111111` carbon), International orange/red accent (`#e03c28`), and oversized grotesk numerals locking into grid intersections with `out4` precision.


---

## `teardown`

# Exploded Teardown - Style Prompt

A real product, built from its own engineering files (CAD, PCB layout, bill of materials), lit like a studio packshot and taken apart in front of the camera: the layers lift on one axis, the camera travels between them, every part is named with the numbers its files contain, and it closes again into one object. References (grammar only): hardware-launch exploded films (layer stagger, orbit timing), repair-guide teardowns (opening order, the macro on the part that matters), engineering drawing (leaders, dimension lines). Never copy their products, layouts, typefaces or music, or name them in the film.

## 1. Essence, and what it is not

A frame reads as this style when:

- **the object is real and exact:** geometry, positions and counts come from the product's own files (STEP, KiCad, BOM, assembly guide). Nothing is eyeballed that a file can give;
- **it is shown apart:** layers float on one axis with even, readable gaps, each still oriented as it sits in the product;
- **it is photographed, not drawn:** physically based materials, a studio key light, a cool rim, an HDRI reflection, soft contact shadow on an invisible floor;
- **the numbers live on the object:** thin leader lines from a dot on the part, dimension lines with ticks drawn in the scene's own perspective, never a table beside it;
- **the camera never stops travelling:** one or a few continuous moves, orbit outside, macro inside.

## 2. Materials & rendering

- Real-time PBR (`three.js MeshPhysicalMaterial`) at 2x and downsampled, ambient occlusion, depth of field, high-threshold bloom for emitters only, vignette.
- Boards are painted from their layout files: copper pours, every trace, via, pad and drill, silkscreen, on both sides, at 14-20 px per millimetre.
- Keep a `FACTS.md` in the project folder (claim, source URL, quoted wording, or the measurement method for anything measured from the CAD) and deliver it with the film.

## 3. Colour logic

- The product brings its own colours; the frame around it is neutral and dark (`#34363a -> #0d0e10`), so the product is always the brightest, most saturated thing.
- Interface ink is one warm white (`#f1efe9`) at two strengths (names at full, specs at about 60 %), plus one accent (`#ff6b3d`) reserved for measured things: dimension lines, label indices and one matching detail on the product itself.

## 4. Type & subtitles

- **Names:** a clean sans at medium weight in the film's script (28-32 px; Noto Sans SC 500 / Inter).
- **Specs and numbers:** a monospaced face (15-22 px; JetBrains Mono) so digits line up and read as measurement.
- **Label structure is fixed:** a two-digit index in the accent, the name, one spec line. Units always written (`mm`, `MB`, `xn` for counts).
- **Subtitles:** a centred strip at the bottom with a soft shadow and no box; hold every cue >= `max(1.8 s, speech + 0.6 s)`.

## 5. Motion quality

- 24 fps on ones; everything is smooth and deterministic.
- **Separation:** smooth start, fast middle, long settle (ease-in-out cubed); layers leave top first, 0.15-0.2 s apart; repeated parts (keys, screws) fan out in a wave ordered by distance from a corner.
- **Closing:** bottom first, quicker (about 1 s per layer), the last layer lands with a real mechanical response.

## 6. Native moves

- **The wave lift:** repeated parts rise in a wave across the object.
- **Inside the gap:** the camera enters the space between two lifted layers to see a hidden face.
- **The leader that lands on the part:** a macro label whose line ends on the component.
- **Dimensions drawn on the thing:** after closing, the real outline gets dimension lines in perspective.
- **One real motion:** a part performs its true mechanical motion once (a press, a hinge, a latch).
- **Lights on inside:** emitters inside the product switch on while it is apart.


---

## `textile-weave`

# Jacquard Loom & Thread Matrix (`styles/textile-weave`)

**Station**: Line 13 — Collage, Paper & Craft

## Visual & Editorial Brief
Macro warp-and-weft thread intersection diagram linking punch-card binary holes to woven cloth patterns.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `thread-unroll`

# Annotated Social Thread Unroll (`styles/thread-unroll`)

**Station**: Line 15 — Social, Mobile & Interactive Feeds

## Visual & Editorial Brief
Clean vertical card stack unrolling post-by-post with verified quote-tweet evidence and metric counters.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `topographic-contour`

# USGS Topographic Contour (`styles/topographic-contour`)

**Station**: Line 7 — Maps & Wayfinding

## Visual & Editorial Brief
Elevation contour lines in sepia and forest green with ridge profiles, benchmark triangles, and route trace.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `transit-map`

# Transit Map (Vignelli / Beck)

Harry Beck & Massimo Vignelli topological diagram: octilinear routes (`0°`, `45°`, `90°` angles only) with rounded `16px` corner radii, bold line color coding, white-centered interchange pill stations, and animated train pulses traveling between system nodes.


---

## `ukiyoe`

# Ukiyo-e Woodblock Print

Edo-period Japanese *nishiki-e* polychrome woodblock print aesthetic: warm mulberry *washi* paper (`#efe4ce`) with visible plant fibers, sumi-ink keyblock outlines (`#1b1815`) with carved taper, Prussian blue (*bero-ai* `#1d436b`), vermilion (*shu* `#c94932`), ochre (`#d19b4b`), and *bokashi* hand-wiped gradient skies.

## Visual Grammar
- **Registration & Keyblock**: Crisp variable-width sumi-ink contours with subtle 1–2px color-block registration offset to evoke authentic woodblock pressing.
- **Bokashi Gradients**: Horizontal ink-wipe bands at top of sky and water horizon.
- **Cartouches**: Vertical *tanzaku* title cartouche in top corner with vermilion hanko seal stamp (`#c4302b`).


---

## `vertical-dossier-9x16`

# 9:16 Retention Dossier Reel (`styles/vertical-dossier-9x16`)

**Station**: Line 15 — Social, Mobile & Interactive Feeds

## Visual & Editorial Brief
Vertical 1080x1920 investigative explainer combining top source badges, middle PiP evidence, and bottom captions.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `vhs-tracking`

# Magnetic VHS & CRT Tracking (`styles/vhs-tracking`)

**Station**: Line 10 — Analog Film, Tape & Optics

## Visual & Editorial Brief
1991 camcorder OSD timestamp, chroma bleed, head-switching noise bar, and pause/rewind shuttle scanlines.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `viewmaster-reel`

# Stereoscopic Slide Carousel (`styles/viewmaster-reel`)

**Station**: Line 10 — Analog Film, Tape & Optics

## Visual & Editorial Brief
Kodak Ektagraphic slide projector advancing Kodachrome cardboard-mounted slides with mechanical clack.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `visual-investigation`

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


---

## `watercolor-wash`

# Botanical Watercolor & Ink (`styles/watercolor-wash`)

**Station**: Line 9 — Painting & Fine Art

## Visual & Editorial Brief
Wet-on-wet pigment blooms on cold-press cotton paper with fine sepia dip-pen contour labels.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `wealth-scale`

# Logarithmic Scale Scroll (`styles/wealth-scale`)

**Station**: Line 3 — Numbers & Charts

## Visual & Editorial Brief
Continuous horizontal or vertical ruler zooming across orders of magnitude from ₹500 to ₹50,000 crore.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `wes-symmetry`

# Symmetrical Pastel Chapter Card (`styles/wes-symmetry`)

**Station**: Line 14 — Cinema Titles & Genre Homage

## Visual & Editorial Brief
Dead-center planar composition, Futura bold yellow caps, whip-pan transitions, and curated overhead flat-lays.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `whiteboard`

# Whiteboard Marker Sketch (`styles/whiteboard`)

**Station**: Line 4 — Diagrams & Whiteboards

## Visual & Editorial Brief
Dry-erase marker diagramming with hand-drawn boxes, causal arrows, and red-marker bottleneck circles.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.


---

## `wireframe-cad`

# Vector CAD Orthographic (`styles/wireframe-cad`)

**Station**: Line 6 — 3D Stage & Spatial

## Visual & Editorial Brief
Four-viewport CAD workstation (Top, Front, Side, Iso) with live dimension callouts and section cuts.

## Palette & Surface
- **Canvas**: `1920x1080` (16:9) or `1080x1920` (9:16 vertical via `?aspect=9x16`) at `24fps`.
- **Surface & Ink**: High-contrast editorial ground with `tabular-nums` data labels and explicit source attribution badges (`SOURCE: ...`) on every archival or external clip.

## Motion & Audio Choreography
- Built on `/core/lib.js` deterministic timeline helpers (`seg(t, t0, t1, out3)`, `inOut3`, `spring`, `mulberry32`) with `window.__DURATION`, `window.__EVENTS`, `window.__seek(t)`, and `window.__READY = true`.
- Paired with 48 kHz procedural foley (`core/audio/sfx.py`), physical string synthesis (`core/audio/pluck.py`), or multi-instrument samples (`core/audio/sampler.py`), normalized to `-14 LUFS` via `core/render/mux.sh`.

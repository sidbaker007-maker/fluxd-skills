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

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

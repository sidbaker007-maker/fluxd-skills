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

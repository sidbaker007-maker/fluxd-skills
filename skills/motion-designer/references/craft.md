# Craft: Anti-Slop Motion Design Principles, Humanistic Scripting, and Voiceover Timing

This file codifies the core craft rules synthesized from classic animation theory (Frank Thomas & Ollie Johnston's *12 Principles of Animation* via Alan Becker), modern motion design direction (Ben Marriott, School of Motion / Joey Korenman, Nowack Design, Joshua Craigie, Herman Huang), and UX in Motion (Kamron Robinson / Google Play, Issara Willenskomer).

Every generated video must feel **characterful, intentional, and human-directed** — never like generic "AI slop."

## 1. The 3 Functional Outcomes of Motion Design (Kamron Robinson / Google Play)

Before adding any movement, verify which of the three functional outcomes it serves:

1. **Motion Enhances Stability**: Uses spatial continuity, match cuts, and physical feedback between states so transitions feel coherent and grounded in physical law rather than jarring.
2. **Motion Sells the Subtext**: Communicates emotional or thematic weight through *how* an element moves:
   - *Gritty / Handmade / Archival (`vox` style)*: Posterized 8-12 fps ("on-twos / on-threes") stop-motion wiggle, step keyframes, tactile halftone print, and damped pendulum physics.
   - *High-Tech / Investigative Telemetry (`polymath`, `data`, `terminal`)*: High-frame-rate (24-60 fps) exponential curves (`cubic-bezier(0.16, 1, 0.3, 1)`), tabular numerals, and razor-sharp vector schematics.
3. **Motion Feels Premium**: High-craft curve sculpting, observational micro-details, and restraint elevate perceived authority and viewer retention.

## 2. The 6 Anti-Slop Choreography Laws (Built Into `kit.js`)

1. **Anticipation & Eye-Lead (Ben Marriott's #1 Skill)**:
   - Never fire a primary movement from a dead stop without warning. Preceding a major entrance or slide with a **3-to-4 frame preparatory movement in the opposite direction** (the `slingshot` and `pop` moves in `kit.js` pull back/crouch before releasing) acts as an optical flare that locks the viewer's eye onto the coordinates *before* the main action fires.
2. **Volume-Preserving Squash & Stretch (`scaleX * scaleY ≈ 1.0`, Alan Becker)**:
   - When an element stretches at peak velocity (`scaleY: 1.06`), its perpendicular axis narrows (`scaleX: 0.94`); when it squashes on landing (`scaleY: 0.88`), it widens (`scaleX: 1.14`). Never scale a single axis in isolation without conserving area/mass.
   - All SVG schematic and chalk strokes use `vector-effect: non-scaling-stroke` (Ben Marriott's stroke rule) so stroke weights never distort during scale or squash transforms.
3. **Follow-Through, Overlapping Action & Anti-Twinning (Alan Becker + Joshua Craigie)**:
   - *"Nothing stops all at once."* When a card or column (`rise`, `vecCard`) lands, the container settles with a subtle overshoot while child elements (`h3`, `p`, `li`, metric readouts) drag behind by **2 to 4 frames** (`0.04s - 0.09s` stagger).
   - **Anti-Twinning**: Paired columns (`pivot`, `compare`) and multi-card grids (`telescope`, `features`) never move in robotic lockstep symmetry — always offset their timing and entry vectors.
4. **Selective Stillness — "Not Everything Needs to Move" (Nowack Design)**:
   - The human eye snaps to movement. Establish **one unmistakable #1 focal point per beat**. Keep background grids and secondary labels calm while the primary headline or chart animates, and trigger secondary callouts only *after* (`after(te)`) the primary element has landed.
5. **Match Cuts & The 80/20 Transition Restraint Rule (Ben Marriott + Herman Huang)**:
   - When every cut has a flashy wipe or glitch, none of them stand out ("TikTok whiplash").
   - Use clean `cut` or Ben Marriott's **Scale/Velocity Match Cut (`matchCut`)** — which accelerates scale by `+4.5%` (`power3.in`) into the cut and decelerates (`expo.out`) out of the cut — for **75-80% of scene transitions**, reserving full-frame wipes (`vecScan`, `vxWhip`, `scan`) for major Movement shifts.
6. **The 3x Reading Rule & Dual-Layer Scripting (Alan Becker + Polymathic Director)**:
   - Separate what is **heard** (`vo` at 130-145 WPM with `[AUDIO PAUSE: Xs]` markers) from what is **seen** (`text` / `title` distilled to **<= 8 kinetic words**).
   - Every on-screen text element must remain legible long enough to be read comfortably (or across the full spoken `vo` window).

## 3. The 5 Humanistic Scripting Rules (For `polymath` & `vox` Voiceovers)

1. **Telescoping Scale Jump**: Anchor abstract concepts in a tactile micro-object, then pull back by orders of magnitude (`10^-6 m -> 10^0 m -> 10^6 m`, paired with `"kind": "telescope"`).
2. **The McPhee Pivot**: Intercut two timelines at peak mechanical tension with a hard cut (`"kind": "pivot"`, `"transition": "cut"`).
3. **Kinetic Verb-First Scripting**: Replace static "to be" verbs (*is, was, represents*) with physical directional verbs (*cuts, locks, tracks, clamps, fractures, bends*).
4. **Lexicon Friction**: Pair technical nouns (*anamorphic squeeze, silver halide, phase-locked loop, sovereign default*) with blunt verbs. Ban AI/corporate filler (*revolutionary, seamless, delve, game-changing*).
5. **Counter-Intuitive Premise Inversion**: State a common myth, strike it through on screen, and falsify it with an empirical data anomaly (`"kind": "anomaly"`).

## 4. Mandatory 7-Point Anti-Slop Motion Audit (Run Before Delivery)

1. **Hierarchy & Stillness Check**: Does each scene have one clear focal point, with secondary callouts delayed until after the headline lands?
2. **Anticipation & Eye-Lead Check**: Do primary cards/columns use preparatory wind-up (`pop`, `slingshot`, `vecCard`, `vxCutout`) rather than flat linear slides?
3. **Easing & Spacing Check**: Are all movements driven by exponential/spring curves (or intentional `steps(1)` stop-motion in `vox`)?
4. **Follow-Through & Offset Check**: Do child elements stagger 2-4 frames behind their parent containers?
5. **Volume & Stroke Check**: Is perpendicular volume preserved during squash/stretch, and are SVG strokes protected with `non-scaling-stroke`?
6. **Transition Intentionality Check**: Do `cut` and `matchCut` handle the majority of cuts so signature wipes (`vecScan`, `vxWhip`) feel earned?
7. **Audio-Visual Sync Check**: Does the `-16 LUFS` soundtrack hit on keyframe extremes and duck cleanly during `[AUDIO PAUSE: Xs]` windows?

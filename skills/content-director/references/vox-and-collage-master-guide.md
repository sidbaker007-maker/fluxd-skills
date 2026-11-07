# Master Guide: Vox Diorama, VOXSTAGE, Bang-Motion, Onetake & MotionMaxxing

This reference consolidates every rule, prompt block, timing formula, and visual architecture from:
1. **`@justdodani` Vox Explainer Guide** (`Vox guide.md` & `Vox Explainer Guide - justdodani.pdf` — 7-Layer Magazine Cut-Out Diorama & Ransom-Note Typography)
2. **`Leslie-vox-style`** (`VOXSTAGE` Visual System, Verbatim Style & Ending Blocks, 4 Style Boards, 0–7s Back-to-Front Assembly Timeline, and 9-State Documentary Narrative Engine)
3. **`vox-explainer-skill`** (5-Part Vox Writing Arc, Beat Budgeting Table, Cultural Adaptation, and Do/Don't Motion Grammar)
4. **`bangtutorial/bang-motion`** (4 Hard Anti-Slop Laws, Text Pocket Luminance Rules, and 6 Explainer Modes)
5. **`feitangyuan/onetake` & `Tejashmakwana/motionmaxxing`** (`Carry-Across-the-Cut` Continuity & 12 Measured Pro Easing Curves + `G0–G5` Quality Gates)

---

## 1. `@justdodani` 7-Layer Magazine Cut-Out Diorama & Ransom-Note Rules

### 1.1 The 3 Core Laws
1. **Everything is a magazine cut-out**: Every photo, mountain, road, building, and vehicle has a visible scissor-cut white paper edge (`6–8px`), high-contrast archival print texture, and a soft contact shadow on the layer directly behind it.
2. **Every scene is a 7-layer stack built back-to-front**:
   - **Layer 1 (Back)**: Textured paper background (`#F6F3EC` Silver-Halide Paper or `#EFECE2` warm newsprint) + painted sky band (`0.00s`, `-45px` slide).
   - **Layer 2**: Clouds & birds (`0.12s`, `-55px` slide, drifting continuously across the shot).
   - **Layer 3**: Distant mountain ridge (`0.24s`, `+65px` upward rise).
   - **Layer 4 (The Turn-Piece)**: The glacier, river, or key resource (`0.36s`, `+55px` rise). During the story turn, **this single layer slides out, shrinks, or drains away** to reveal bare rock/data underneath without cutting the camera!
   - **Layer 5**: Winding pass road or infrastructure track (`0.48s`, `+75px` rise).
   - **Layer 6 (Hero Subject Split 3 Ways)**: Split the hero building/machine into **Base (`0.60s`) -> Middle Floors (`0.72s`) -> Roof & Sign (`0.84s`)** so it stacks together like cardboard instead of fading in as one flat PNG.
   - **Layer 7 (Front Continuous Movers)**: A vehicle (e.g., 1960s yellow post bus) driving along the road + a foreground steam train or ship crossing the bottom edge so **something is always moving in every single frame**.
3. **Every move is a gentle ease-out (Zero Bounce on Paper Layers)**:
   - Layer entrance: slide `40–80px` + fade `0 -> 100%` over `0.55–0.75s` using `cubic-bezier(0.22, 1, 0.36, 1)` (`power3.out`).
   - Camera: continuous `4%–5%` slow push-in (`1.00x -> 1.045x`) across the shot.
   - Ransom-note headline (`MD.ransomTx` + `ransomDrop`): Each word sits on its own torn newspaper/magazine scrap (alternating cream serif, dark ink sans, tilted yellow/vermilion highlight scrap), dropping `50px` in `0.55s` with a `0.10s` word stagger and zero bounce.

---

## 2. `Leslie-vox-style` VOXSTAGE System & Verbatim Nano Banana Prompt Blocks

### 2.1 Beat Math & Pacing
- Calculate narration pacing at **2.5 spoken words per second (~150 WPM)** for documentary explainers (or **3.0 words/sec ~180 WPM** for `9:16` Reels).
- Keep each visual beat to **2–3 seconds (5–8 spoken words)**:
  - `30s` video = `12–15 beats`
  - `60s` video = `22–30 beats`
  - `120s` video = `45–60 beats`
  - `180s` video = `70–90 beats`

### 2.2 Verbatim `VOXSTAGE` Style & Ending Prompt Blocks (For Nano Banana / `image_gen`)
When generating full-scene paper-collage frames or style anchors in `voxstage` mode, append these two blocks:

- **Verbatim Style Block**:
  > VOXSTAGE main stage: an empty, pre-lit 16:9 background world of desaturated archival maps and aged-paper texture with no preset midground objects; handcrafted documentary paper collage, black-and-white halftone photo cut-outs with rough white contours and subtly offset hot-red registration outlines; torn paper edges, large red data counter cards, map pins, hand-drawn red underlines, thin-white-border archival photo cards, and very sparse mustard labels; Archival Tan #C9BB9C, Ink Black #1A1A1A, Halftone Gray #8C8C8C, Hot Red #D62E1F, and Mustard #D9A441 only, with red reserved for outlines, underlines, arrows, and data cards and mustard as a secondary accent; tall condensed bold editorial display type only on specified labels; visible print grain and paper fibers; matte finish; flat, even newsroom lighting with soft collage shadows.

- **Verbatim Ending Block**:
  > Render every element as real hand-cut, layered paper with visibly crisp cut edges, halftone print texture, and soft shadow separation between layers. Keep the composition clean, minimal, editorial, and spacious. No digital illustration, cartoon, 3D rendering, gloss, gradients, clutter, watermarks, logos, or text beyond specified labels. Premium documentary-collage aesthetic, clean composition, text-free, no labels, no watermarks.

### 2.3 The 4 Visual System Boards
1. **`MG-VOXSTAGE` (`vox` / `journalism` `VoxStage Hot-Red`)**: Archival Tan `#C9BB9C`, Ink Black `#1A1A1A`, Halftone Gray `#8C8C8C`, Hot Red `#D62E1F` (registration outlines, underlines, arrows, counter cards), Mustard `#D9A441`.
2. **`MG-BLUEPRINT` (`blueprint` style)**: Deep Blueprint Blue `#1B3A6B`, crisp `2px` white isometric linework `#F0F6FC`, tracing-paper cards `#F5F0E0`, cyan `#38BDF8` & amber `#FACC15` dimension callouts.
3. **`MG-GLASSDARK` (`polymath` / `keynote` style)**: Anamorphic Carbon `#111315`, dark glassmorphic telemetry panels, `#E04826` Vermilion & `#F59E0B` Oscilloscope Amber trajectories.
4. **`MG-SOFT3D` (`paper` / `aura` style)**: Warm creamy light `#F6F3EC`, matte tactile building-block forms for friendly conceptual explainers.

### 2.4 The 10-Step Tabletop Collage Assembly Order (`0–7s Build -> 7–10s Tactile Hold`)
1. Fixed background map/paper grain & stains settle.
2. Large paper horizon/panel shapes slide in with paper friction.
3. Primary B&W halftone cut-out enters with a subtle overshoot and settles.
4. Supporting cut-outs drop or pin into place.
5. Masking-tape fragments press down at corners.
6. Typewritten / mono archive labels slide in.
7. Rubber stamps strike onto the paper.
8. Pushpins click into coordinates.
9. Red investigation string pulls taut between pins.
10. Hand-drawn red marker underlines, circles, and arrows draw last (`left -> right`), followed by a tactile hold (subtle paper-corner breathing and halftone shimmer).

---

## 3. `vox-explainer-skill` 5-Part Narrative Skeleton & Cultural Adaptation

1. **Cold Open (1 Beat)**: Start directly inside a specific year, place, or physical anomaly. Never say *"Today we're going to talk about..."*
2. **The Turn to Context (1 Beat)**: *"To understand why, you have to look at..."* / *"But that's only half the equation."*
3. **Escalating Explanation (50–70% of Beats)**: One causal chain where every beat makes the viewer smarter, anchored by physical scale comparisons.
4. **Complication (1–2 Beats)**: The bottleneck, cost, or physical limit (*"But all of this depended on one fragile constraint..."*).
5. **Resolution + Reframe (1–2 Beats)**: Return to the cold-open image with new meaning and end on a quotable line (or seamless loop bridge for `9:16` Reels).
- **Cultural & Domain Material Adaptation**: Keep the white die-cut borders, halftone dots, tape, and single accent colour constant, while adapting the source artifacts to the pillar (Indian socio-economics: RBI bank notes, railway tickets, gazette notifications, UPI QR codes; Physics/Space: ISRO/NASA blueprints, oscilloscope traces, lens schematics; Cinema: 35mm film strips, clapperboards, script pages).

---

## 4. `bangtutorial/bang-motion` 4 Hard Anti-Slop Laws

- **Law #1 (Anti-PPT / Anti-Slide)**: Never stack a kicker + title + subtitle + 3 bullet cards on a static background. One short claim (`<= 8 words`, default no trailing period) + one primary visual action per beat.
- **Law #2 (New Information = New Visual State in the Same World)**: A new sentence should transform, open, or move an object inside the current world rather than cutting to a generic new slide.
- **Law #3 (Zoom = Shot Size Change, Not Breathing)**: Use deliberate camera framing jumps (`Wide Context -> Medium Close-Up on the mechanism -> Pull-Back Reveal`) driven by the narration beat.
- **Law #4 (Text Pocket Luminance Guard)**: Behind any text pocket, background luminance must be either **Dark (`<= 25%` luminance)** or **Light (`>= 80%` luminance)** — never noisy mid-tone clutter. Consecutive scenes must vary text size, entry direction, or screen position.

---

## 5. `feitangyuan/onetake` Continuity & `Tejashmakwana/motionmaxxing` Easing Laws

- **Carry-Across-the-Cut (`carryMorph`, `carry score >= 0.75`)**: At every scene transition, specify the **Carry Element** that survives the cut or transforms into the next scene's focal object, rendered with **180° shutter motion blur** during peak velocity.
- **Measured Pro Easing Distribution (`motionmaxxing`)**:
  - **58% Ease-Out Deceleration on Landing** (`cubic-bezier(0.16, 1, 0.3, 1)` / `expo.out` / `power3.out`).
  - **37% Ease-In Acceleration on Exit** (`cubic-bezier(0.7, 0, 0.84, 0)` / `power3.in`).
  - **Median Move Duration**: `10 frames` (`0.33s` at 30fps) for snappy UI/prop moves; `18–22 frames` (`0.60–0.73s`) for large paper/diorama layers.
  - **Zero `scale: 0` Pop-Ins**: Never grow primary cards or cutouts from `scale: 0`; decelerate in from slight oversize (`1.12x -> 1.00x`) or slide in from an off-screen edge.
- **Automated Quality Gates (`G0–G5`)**:
  - `G0`: Zero render/asset errors.
  - `G1`: Typography floor `>= 4%` of frame height (`>= 43px` on `1080p`), WCAG contrast `>= 4.5:1`.
  - `G2`: Zero `>3` consecutive dead/static frames (continuous secondary motion always active).
  - `G3`: Transition continuity (`carryMorph`, `matchCut`, or `cornerDock`).
  - `G4`: Audio loudness `-14` to `-16 LUFS` with `-14 dB` sidechain BGM ducking under voiceover.
  - `G5`: Full-bleed stage (3-zone HUD enabled for `9:16` `pulse` Reels; clean cinematic stage for `16:9` essays).

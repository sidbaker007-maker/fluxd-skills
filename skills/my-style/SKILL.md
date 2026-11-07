---
name: my-style
description: "Applies the creator's reverse-engineered 9:16 Retention HUD, 2-Second Fuse, and Rehook motion style in exact numbers for FLUXD. Trigger whenever the user asks to script, storyboard, edit, caption, or render videos in 'my-style', or runs content-director or motion-designer for 9:16 faceless retention reels, 45-60 s."
---

# My Style (FLUXD 2-Second Fuse & Retention Rehook Engine)

## Summary

Codifies the quantitative editing, pacing, 3-zone HUD layout, mixed-font progressive top headlines, 2-second fuse micro-changes (`COLOR FLASH, ZOOM, CUT, SOUND SYNC, NEW PROP`), and 4-stage retention storytelling (`HOOK -> DELAY -> REHOOK -> END ON PAYOFF`) derived from `2` analyzed reference video(s) and locked to the creator's **FLUXD** brand tokens.

## When to Use

- Scripting or storyboarding high-retention `9:16` Reels or YouTube Shorts in `content-director`
- Generating faceless motion-graphics Reels in `motion-designer` using the `pulse` (Retention HUD) or `polymath` styles
- Auditing edit timelines in Premiere Pro or DaVinci Resolve against the `< 2.0s` static hold limit

## Brand Identity Tokens (Locked to FLUXD)

- **Target Format**: `9:16 faceless retention reels, 45-60 s`
- **Typography**: `Space Grotesk 700 / Syne 800 display + Instrument Serif Italic emphasis, Plus Jakarta Sans 600 body, JetBrains Mono 600 HUD`
- **Colour Palette**: `#0C0E0C carbon-grid bg, #F6F3EC halide-ivory text, #CCFF00 acid-volt flash & highlight, #E04826 halation-vermilion alert/strike`
- **Logo Asset**: `FLUXD Chamfered-Bracket Phi-2 ( | ) + [ FLUXD ] Framed Wordmark`

## Deterministic "Do X When Y" Production Rules

### 1. The 2-Second Fuse & Cutting Cadence

- **Rule 1.1 (Zero >2.0s Static Hold)**: Do trigger a micro visual change every **`0.4s - 1.20s`** (maintaining **`23.89 micro-changes per 10s`** and a hard ceiling of **`1.6s` max static hold**) by firing one of the 5 visual levers: `01 RANG` (full-screen colour flash), `02 ZOOM` (camera scale push/pull), `03 CUT` (angle/framing shift), `04 AWAAZ` (`1 event = 1 sound`), or `05 NAYI CHEEZ` (`1 keyword = 1 vector prop`).
- **Rule 1.2 (Chapter Board Cadence)**: Do transition the central stage board every **`2.7 seconds`** (**`3.38 chapters per 10 seconds`**, ~14-18 numbered chapters across a 50s Reel), updating the top-left chapter tracker (`01 · HOOK` .. `14 · CTA`) and top-right live counter (`● CHANGES N` or `● STAGE`).
- **Rule 1.3 (Corner-Dock Context Transition)**: When moving from a diagnostic graph/hook card into its explanation, do shrink and dock the previous card (`1.00x -> 0.42x` over **`7 frames` / `0.23s`**) into the top-left corner while popping the new locked/detail card into the foreground so visual context is never lost.

### 2. Full-Screen Colour Flashes (`RANG`), Zooms & Prop Physics

- **Rule 2.1 (Periodic Full-Screen `RANG` Inversion)**: Do invert the entire canvas (or a `-4deg` diagonal split) from Dark Carbon Grid (`#0C0E0C` / `#111315`) to High-Contrast Signal Accent (`#CCFF00` Acid Volt or `#E04826` Vermilion) with dark ink text (`#0B0B0B`) for **`1.2s - 3.5s` once every `14 - 16 seconds`** when introducing a premise twist or mid-video rehook.
- **Rule 2.2 (Viewfinder Zoom Push/Pull)**: Do apply a **`+22.0%` optical scale push (`1.00x -> 1.22x`)** framed by `[ REC 1.0x -> 1.5x ]` corner brackets on sustained mechanical diagrams.
- **Rule 2.3 (Overshoot Prop Pop - `NAYI CHEEZ`)**: Do spawn a dedicated vector prop or badge on every emphasized noun/number using a **`7-frame` (`0.23s`) overshoot pop (`1.42x -> 1.15x -> 1.00x`)** paired with a synchronized SFX transient (`pop`, `ding`, `scratch`, or `whoosh`).

### 3. 3-Zone HUD Layout & Progressive Mixed Typography

- **Rule 3.1 (Top-Left Progressive Headline Zone)**: Do anchor the spoken headline in the top zone (**`82%` from the bottom edge**, i.e., `12%-22%` from the top edge, capped at **`6 words` per visible phrase**) rather than crowding the bottom of the screen.
- **Rule 3.2 (Sans + Italic Serif + Tilted Pill Contrast)**: Do set base headline words in geometric sans (`Space Grotesk` / `Syne` 700), set 1-2 emotional/causal pivot words per sentence in **Accent Italic Serif (`Instrument Serif Italic`)**, and wrap hook metrics in a **`-2deg` tilted solid accent pill box** with dark ink text.
- **Rule 3.3 (Bottom 2s Fuse Bar & Brand Lockup)**: Do anchor the **`THIS REEL · 2s FUSE`** progress bar and the **`( | ) [ FLUXD ]`** brand lockup at `5%-8%` from the bottom edge.

### 4. 4-Stage Retention Storytelling Architecture (`HOOK -> DELAY -> REHOOK -> PAYOFF`)

- **Rule 4.1 (0-4s Premise Inversion Hook @ `210 WPM`)**: Do open at **`210 WPM`** by crossing out two conventional assumptions (`MYTH A ❌`, `MYTH B ❌`) and revealing `? 1 ANOMALY` alongside a live dropping curve or countdown timer.
- **Rule 4.2 (4-10s Blurred Locked Roadmap - `DELAY`)**: Do display the 3-5 step roadmap early with steps `02..05` blurred (`filter: blur(5px)`) and padlocked (`🔒 ?`), opening a second question before answering the first so the curiosity loop stays open.
- **Rule 4.3 (25-35s Mid-Video `REHOOK` + Save Checkpoint)**: Do fire a mid-video rehook at `50%-65%` duration (reminding the viewer why item `#04/#05` or step `#03` is the real game-changer) followed by a saveable checklist card (`SAVE FOR LATER 🔖`) with a `[ HOOK | DELAY | REHOOK | PAYOFF ]` progress bar showing `YOU ARE HERE`.
- **Rule 4.4 (End Immediately on `PAYOFF`)**: Do cut the explanation the exact second the final locked item unlocks (`END ON PAYOFF ✂️`) and transition straight into a 3-second interactive CTA card (`0 seconds` of post-payoff filler).

## Reference Notes & Preset Files

- `references/comment-change-and-i-ll-dm-you-my-list-of-20-cha-notes.md` (`49.6s`, `3.23` chapters/10s, `21.57` micro-changes/10s)
- `references/comment-rehook-and-i-ll-dm-you-a-free-pdf-with-2-notes.md` (`51.1s`, `3.52` chapters/10s, `26.22` micro-changes/10s)
- `assets/motion-designer-preset.json` (Drop-in preset for `motion-designer`)

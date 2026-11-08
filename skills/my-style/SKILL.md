---
name: my-style
description: Applies the creator's reverse-engineered 9:16 Retention HUD, 2-Second Fuse, and Rehook motion style in exact numbers for FLUXD (100% English defaults). Trigger whenever the user asks to script, storyboard, edit, caption, or render videos in 'my-style', or runs content-director or motion-designer for 9:16 faceless retention reels, 45-60 s.
---
# My Style (FLUXD 2-Second Fuse & Retention Rehook Engine — English Default)

## Summary

Codifies the quantitative editing, pacing, 3-zone HUD layout, mixed-font progressive English top headlines, 2-second fuse micro-changes (`01 COLOR FLASH, 02 ZOOM, 03 CUT, 04 SOUND SYNC, 05 NEW PROP`), Sub-Beat Audio-Synced Pop-Ups (`subbeats`), and 4-stage retention storytelling (`HOOK -> DELAY -> REHOOK -> END ON PAYOFF`) derived from analyzed reference telemetry and locked to the creator's **FLUXD** brand tokens.

## Brand Identity Tokens (Locked to FLUXD)

- **Target Format & Language**: `9:16 faceless retention reels, 45-210 s, 100% English (en)`
- **Primary Visual Styles**: `journalism (Visual Journalism Dark #0B0B0B)` for cultural/investigative storytelling; `pulse (FLUXD Carbon Volt #0C0E0C)` for fast retention/system breakdowns.
- **Typography**: `Space Grotesk 700 / Syne 800 display + Instrument Serif Italic emphasis, Plus Jakarta Sans 600/700 body & spoken English captions, JetBrains Mono 600 HUD`
- **Colour Palette**: `#0B0B0B / #111315 carbon-grid bg, #F6F3EC halide-ivory text, #FACC15 dossier-yellow / #CCFF00 acid-volt highlight, #E04826 halation-vermilion alert/strike`
- **Logo Asset**: `Official Vector FLUXD Chamfered-Bracket Phi-2 ( | ) + [ FLUXD ] Framed Wordmark (Native SVG in Browser & Native Vector Shape Layer in After Effects)`

## Deterministic "Do X When Y" Production Rules

### 1. The 2-Second Micro-Change Cadence & Sub-Beat Audio Sync

- **Rule 1.1 (Zero >2.0s Static Hold)**: Trigger a micro visual change every **`0.4s - 1.20s`** (maintaining **`23.89 micro-changes per 10s`** and a hard ceiling of **`1.6s` max static hold**) using the 5 English visual levers: `01 COLOR FLASH` (full-screen colour inversion), `02 ZOOM` (camera scale push/pull), `03 CUT` (angle/framing shift), `04 SOUND SYNC` (`1 event = 1 sound`), or `05 NEW PROP` (`1 spoken keyword = 1 cutout/prop pop-up`).
- **Rule 1.2 (Exact Sub-Beat Audio-Synced Pop-Ups)**: When a single spoken beat names multiple items sequentially (such as an English audiobook cover, a Hindi audiobook cover, and publisher HarperCollins India), use `"kind": "subbeats"` (or `mediaTimes` on `collage`) so each card pops up at the **exact second (`+Xs`)** the narrator speaks its name, rather than showing all cards at the start of the beat.
- **Rule 1.3 (Corner-Dock Context Transition)**: When moving from a hook card into its explanation, shrink and dock the previous card (`1.00x -> 0.42x` over **`7 frames` / `0.23s`**) into the top-left corner while popping the new detail card into the foreground.

### 2. Visual Restraint Guardrails (No Unprompted Bombs, Timers, or Generic Templates)

- **Rule 2.1 (No Unprompted `2s FUSE` Timer Bars or Ticking Bombs)**: Keep `showFuseBar: false` by default so the bottom HUD shows only the clean `( | ) [ FLUXD ]` vector brand bar without a distracting `1.6s` countdown timer. Never use `"kind": "fuse"` (ticking bomb) or `"kind": "rehook"` (eyeball drop graph) on narrative, cultural, or documentary topics; use custom Style-Anchored Nano Banana cutouts instead.
- **Rule 2.2 (Progressive Multi-Case Unlock — `1/N -> N/N UNLOCKED`)**: On `"kind": "unlock"` checklist beats, progressively unblur and unlock each row one by one across the scene duration (`1/4` $ightarrow$ `4/4 UNLOCKED`) synced to the voiceover.

### 3. 3-Zone English HUD Layout & Spoken Caption Strip

- **Rule 3.1 (Top-Center Safe-Zone Headline — `82%` from Bottom)**: Anchor the visual beat headline in the upper safe zone (`12%-22%` from top edge, capped at `6-8 words`) using `Syne` / `Space Grotesk` + `Instrument Serif Italic` (`*word*`) + `-2deg` tilted accent pills (`[word]`).
- **Rule 3.2 (Bottom Spoken English Voiceover Caption Strip + `.srt`)**: Render live spoken English subtitles (`.md-vo-caption`) in `Plus Jakarta Sans Bold` (`#F6F3EC` on `#111315` with a `4px` `#E04826` Vermilion left bar) synced to `voiceover.wav` / `.mp3`, and export `captions.srt` + a native `[EN CAPTION]` text track in `build_after_effects.jsx`.

## Reference Notes & Preset Files

- `references/comment-change-and-i-ll-dm-you-my-list-of-20-cha-notes.md` (`49.6s`, `3.23` chapters/10s, `21.57` micro-changes/10s)
- `references/comment-rehook-and-i-ll-dm-you-a-free-pdf-with-2-notes.md` (`51.1s`, `3.52` chapters/10s, `26.22` micro-changes/10s)
- `assets/motion-designer-preset.json` (Drop-in preset for `motion-designer`)

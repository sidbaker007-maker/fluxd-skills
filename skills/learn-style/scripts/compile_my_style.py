#!/usr/bin/env python3
"""
compile_my_style.py - Compiles or merges analyzed reference telemetry + user brand tokens
into the `my-style` skill (`SKILL.md`, `references/<slug>-notes.md`, and `assets/motion-designer-preset.json`).
If `my-style` already exists at `--out-skill-dir`, merges the new references into the rolling metrics
and prints a diff of what changed.
"""
import argparse
import json
import os
from datetime import datetime
from pathlib import Path


def slugify(text: str) -> str:
    s = "".join(c.lower() if c.isalnum() else "-" for c in text)
    while "--" in s:
        s = s.replace("--", "-")
    return s.strip("-") or "ref"


def avg(vals, default=0.0):
    clean = [float(x) for x in vals if x is not None and float(x) > 0]
    return round(sum(clean) / len(clean), 2) if clean else default


def main():
    ap = argparse.ArgumentParser(description="Compile or merge reference telemetry into my-style skill.")
    ap.add_argument("--telemetry", nargs="+", required=True, help="Paths to telemetry.json files from analyze_reference.py")
    ap.add_argument("--out-skill-dir", required=True, help="Target directory for my-style skill (e.g. ~/.gemini/skills/my-style)")
    ap.add_argument("--format", default="9:16 talking reels, 45-60 s", help="Target format description")
    ap.add_argument("--fonts", required=True, help="User brand fonts (e.g. 'Syne 800 display, Plus Jakarta Sans 600 body, JetBrains Mono 500')")
    ap.add_argument("--colours", required=True, help="User brand hex colours (e.g. '#0B0B0D bg, #F8FAFC text, #FACC15 accent, #FF5A1F secondary')")
    ap.add_argument("--logo", default="none", help="User logo path or identifier")
    ap.add_argument("--caption-words", type=int, default=4, help="Measured words per caption chunk (from visual inspection)")
    ap.add_argument("--caption-y-pct", type=int, default=22, help="Measured caption distance from bottom edge in % (from visual inspection)")
    ap.add_argument("--transition-frames", type=int, default=6, help="Measured transition duration in frames at 30fps")
    ap.add_argument("--notes-json", default=None, help="Optional JSON string/file with custom visual observations per reference")
    args = ap.parse_args()

    skill_dir = Path(args.out_skill_dir).expanduser().resolve()
    refs_dir = skill_dir / "references"
    assets_dir = skill_dir / "assets"
    refs_dir.mkdir(parents=True, exist_ok=True)
    assets_dir.mkdir(parents=True, exist_ok=True)

    state_file = assets_dir / "style_metrics.json"
    prev_state = {}
    if state_file.exists():
        try:
            prev_state = json.loads(state_file.read_text(encoding="utf-8"))
        except Exception:
            prev_state = {}

    existing_telemetries = prev_state.get("references", {})
    for t_path in args.telemetry:
        p = Path(t_path)
        if not p.exists():
            continue
        data = json.loads(p.read_text(encoding="utf-8"))
        slug = slugify(Path(data.get("source") or p.parent.name).stem)
        existing_telemetries[slug] = data

        # Write one notes file per reference
        cad = data.get("cutting_cadence", {})
        sp = data.get("speech_and_captions", {})
        cols = data.get("color_telemetry", {})
        zooms = data.get("zooms_detected", [])
        note_lines = [
            f"# Reference Style Notes: {slug}",
            "",
            f"- **Source**: `{data.get('source')}`",
            f"- **Resolution & Aspect**: `{data.get('meta', {}).get('width')}x{data.get('meta', {}).get('height')}` (`{data.get('meta', {}).get('aspect')}`) @ `{data.get('meta', {}).get('fps')} fps`",
            f"- **Duration**: `{data.get('meta', {}).get('duration')} s`",
            f"- **Cuts per 10s**: `{cad.get('cuts_per_10s')}` (`{cad.get('total_cuts')}` cuts across `{cad.get('total_shots')}` shots)",
            f"- **Median Shot Length (ASL)**: `{cad.get('median_shot_length_sec')} s` (Mean: `{cad.get('mean_shot_length_sec')} s`, Range: `{cad.get('min_shot_sec')}s - {cad.get('max_shot_sec')}s`)",
            f"- **Opening Hook Cadence (0-4s)**: `{cad.get('hook_cuts_first_4s')}` cuts in the first 4.0 seconds",
            f"- **Spoken Pacing (WPM)**: `{sp.get('wpm_overall')} WPM` overall (`{sp.get('wpm_speaking_only')} WPM` active speech, `{sp.get('hook_wpm_0_4s')} WPM` in 0-4s hook)",
            f"- **Breath / Emphasis Pauses (>0.35s)**: `{sp.get('pause_count_over_350ms')}` pauses (Median pause: `{sp.get('median_pause_sec')} s`)",
            f"- **Optical Zooms Detected**: `{len(zooms)}` shots with active scale drift",
            f"- **Reference Palette Sampled (For Contrast Ratios Only)**: Full `{cols.get('dominant_hex')}` / Caption Zone `{cols.get('caption_zone_hex')}`",
            "",
            "## Shot-by-Shot Timing Table",
            "",
            "| Shot | Start (s) | End (s) | Duration (s) |",
            "| :--- | :--- | :--- | :--- |",
        ]
        for s in (data.get("shots") or [])[:30]:
            note_lines.append(f"| #{s['index']:02d} | {s['start']:.2f} | {s['end']:.2f} | {s['duration']:.2f} |")
        (refs_dir / f"{slug}-notes.md").write_text("\n".join(note_lines) + "\n", encoding="utf-8")

    all_refs = list(existing_telemetries.values())
    cuts_10s = avg([r.get("cutting_cadence", {}).get("cuts_per_10s") for r in all_refs], 3.8)
    median_asl = avg([r.get("cutting_cadence", {}).get("median_shot_length_sec") for r in all_refs], 2.4)
    hook_cuts = avg([r.get("cutting_cadence", {}).get("hook_cuts_first_4s") for r in all_refs], 2.0)
    wpm = avg([r.get("speech_and_captions", {}).get("wpm_overall") for r in all_refs], 145.0)
    hook_wpm = avg([r.get("speech_and_captions", {}).get("hook_wpm_0_4s") for r in all_refs], 160.0)
    med_pause = avg([r.get("speech_and_captions", {}).get("median_pause_sec") for r in all_refs], 0.55)

    all_zooms = [abs(z.get("pct_change", 6.0)) for r in all_refs for z in (r.get("zooms_detected") or [])]
    avg_zoom_pct = avg(all_zooms, 6.5)

    new_metrics = {
        "updated_at": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
        "format": args.format,
        "brand": {"fonts": args.fonts, "colours": args.colours, "logo": args.logo},
        "reference_count": len(all_refs),
        "cuts_per_10s": cuts_10s,
        "median_shot_sec": median_asl,
        "hook_cuts_first_4s": hook_cuts,
        "wpm_overall": wpm,
        "hook_wpm_0_4s": hook_wpm,
        "median_pause_sec": med_pause,
        "avg_zoom_pct": avg_zoom_pct,
        "caption_words_per_chunk": args.caption_words,
        "caption_bottom_offset_pct": args.caption_y_pct,
        "transition_frames_30fps": args.transition_frames,
        "references": existing_telemetries,
    }

    changes = []
    if prev_state:
        for k in ["cuts_per_10s", "median_shot_sec", "hook_cuts_first_4s", "wpm_overall", "avg_zoom_pct", "caption_words_per_chunk", "caption_bottom_offset_pct", "transition_frames_30fps"]:
            if k in prev_state and prev_state[k] != new_metrics[k]:
                changes.append(f"{k}: {prev_state[k]} -> {new_metrics[k]}")
    else:
        changes.append("Initial creation of my-style from reference telemetry.")

    state_file.write_text(json.dumps(new_metrics, indent=2), encoding="utf-8")

    # Save motion-designer preset JSON
    md_preset = {
        "style": "vox" if "9:16" in args.format else "polymath",
        "format": "9:16" if "9:16" in args.format else "16:9",
        "wpm": round(wpm),
        "captions": "kinetic",
        "brand": {"fonts": args.fonts, "colours": args.colours, "logo": args.logo},
        "cadence": {
            "cuts_per_10s": cuts_10s,
            "target_scene_dur_sec": median_asl,
            "hook_cuts_first_4s": hook_cuts,
            "zoom_pct": avg_zoom_pct,
            "transition_frames": args.transition_frames,
            "pause_sec": med_pause,
        }
    }
    (assets_dir / "motion-designer-preset.json").write_text(json.dumps(md_preset, indent=2), encoding="utf-8")

    ref_list_md = "\n".join([f"- `references/{slug}-notes.md` (`{d.get('meta', {}).get('duration')}s`, `{d.get('cutting_cadence', {}).get('cuts_per_10s')}` cuts/10s)" for slug, d in existing_telemetries.items()])

    skill_md = f"""---
name: my-style
description: "Applies the creator's reverse-engineered editing, pacing, captioning, and motion style in exact numbers. Trigger whenever the user asks to script, storyboard, edit, caption, or render videos in 'my-style', or runs content-director or motion-designer for {args.format}."
---

# My Style (Quantitative Editing & Motion Rules)

## Summary

Codifies the creator's signature visual pacing, cutting cadence, kinetic captioning, and brand typography in exact numbers derived from `{len(all_refs)}` analyzed reference video(s). Copies mechanical timing and layout physics only; never copies reference scripts, logos, or footage.

## When to Use

- Scripting or storyboarding new videos in `content-director` that should match the creator's personal pacing
- Rendering motion graphics clips, B-roll overlays, or kinetic captions in `motion-designer`
- Generating NLE cutting & camera zoom checklists for Premiere Pro or DaVinci Resolve

## Brand Identity Tokens (Locked)

- **Target Format**: `{args.format}`
- **Typography**: `{args.fonts}`
- **Colour Palette**: `{args.colours}`
- **Logo Asset**: `{args.logo}`

## Deterministic "Do X When Y" Production Rules

### 1. Cutting & Shot Cadence

- **Rule 1.1 (Hook Velocity)**: Do place **{max(1, round(hook_cuts))} visual cuts or camera state changes within the first `4.0 seconds`** (1 cut every `{round(4.0 / max(1.0, hook_cuts), 2)} s`) when opening a video so the hook locks viewer retention before `4.0 s`.
- **Rule 1.2 (Body Shot Length)**: Do cut or trigger a secondary B-roll/graphic reveal every **`{median_asl} seconds`** (maintaining **`{cuts_10s} cuts per 10 seconds`**) when delivering body explanation segments.
- **Rule 1.3 (Maximum Static Hold)**: Do not hold any unchanged talking-head or static graphic frame longer than **`{round(median_asl * 1.65, 2)} seconds`** without a camera punch-in, callout pop, or B-roll insert.

### 2. Camera Zooms & Transitions

- **Rule 2.1 (Slow Creep Zoom)**: Do apply a **`+{avg_zoom_pct}%` scale push (`1.00x -> {round(1.0 + avg_zoom_pct / 100.0, 3)}x`)** across sustained talking-head or hero graphic shots lasting longer than **`{round(median_asl * 1.1, 2)} seconds`** when emphasizing a causal claim.
- **Rule 2.2 (Transition Frame Budget)**: Do execute whip-pans, match-cuts, and graphic entrances across exactly **`{args.transition_frames} frames` (`{round(args.transition_frames / 30.0, 2)} s` at 30 fps)** using exponential out-easing (`cubic-bezier(0.16, 1, 0.3, 1)`) when switching between A-roll and full-screen motion graphics.

### 3. Spoken Pacing & Breath Pauses

- **Rule 3.1 (Hook vs. Body WPM)**: Do script the opening `0-4s` hook at **`{round(hook_wpm)} WPM`** and body segments at **`{round(wpm)} WPM`** when timing scenes in `content-director` and `motion-designer`.
- **Rule 3.2 (Thesis Breath Pause)**: Do insert an explicit **`[AUDIO PAUSE: {med_pause}s]`** after every premise inversion or key numerical reveal so the music bed ducks and the visual metric lands cleanly.

### 4. Captions & On-Screen Typography

- **Rule 4.1 (Caption Chunk Density)**: Do limit on-screen kinetic captions to **`{args.caption_words} words per chunk`** (1-2 lines max) anchored at **`{args.caption_y_pct}%` from the bottom edge** (safe above platform UI overlays) when rendering `9:16` vertical videos.
- **Rule 4.2 (Active Word Highlight)**: Do highlight the active spoken word using the brand primary accent colour from `{args.colours}` with a `+8%` scale pop (`1.08x -> 1.00x` over `4 frames`) when using burned-in kinetic captions.

## Reference Notes & Preset Files

{ref_list_md}
- `assets/motion-designer-preset.json` (Drop-in preset for `motion-designer`)
"""
    (skill_dir / "SKILL.md").write_text(skill_md, encoding="utf-8")

    print(json.dumps({
        "status": "compiled",
        "skill_dir": str(skill_dir),
        "reference_count": len(all_refs),
        "changes": changes,
        "metrics": {
            "cuts_per_10s": cuts_10s,
            "median_shot_sec": median_asl,
            "hook_cuts_first_4s": hook_cuts,
            "wpm_overall": wpm,
            "hook_wpm_0_4s": hook_wpm,
            "avg_zoom_pct": avg_zoom_pct,
            "caption_words_per_chunk": args.caption_words,
            "caption_bottom_offset_pct": args.caption_y_pct,
            "transition_frames_30fps": args.transition_frames,
        }
    }, indent=2))


if __name__ == "__main__":
    main()

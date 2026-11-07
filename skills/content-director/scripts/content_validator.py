#!/usr/bin/env python3
"""
Deterministic validator, voiceover pacing calculator, and script.json handoff exporter
for Content Director blueprints -> Motion Designer.

Usage:
    python scripts/content_validator.py <path-to-markdown-blueprint> [--wpm 150] [--export-json script.json] [--json]
"""

import argparse
import json
import re
import sys
from pathlib import Path

BANNED_PHRASES = [
    "have you ever wondered",
    "in today's video",
    "hey guys",
    "welcome back to the channel",
    "without further ado",
    "delve into",
    "rich tapestry",
    "testament to",
    "buckle up",
    "let's dive in",
    "it goes without saying",
    "paradigm shift",
]

LAZY_MODIFIERS = [
    "revolutionary",
    "fascinating",
    "mind-blowing",
    "unbelievable",
    "game-changing",
]

SUPPORTED_STYLES = [
    "pulse",
    "vox",
    "voxstage",
    "blueprint",
    "journalism",
    "vintage-sketch",
    "polymath",
    "data",
    "terminal",
    "keynote",
    "kinetic",
    "aura",
    "paper",
    "story",
]


def extract_beats_from_markdown(text: str, wpm: int = 150) -> list:
    """Extract beat rows from Markdown storyboard tables into structured beat dicts."""
    beats = []
    lines = text.splitlines()
    in_table = False
    cursor_sec = 0.0

    for line in lines:
        stripped = line.strip()
        if not stripped.startswith("|") or not stripped.endswith("|"):
            continue
        cells = [c.strip() for c in stripped.strip("|").split("|")]
        if len(cells) < 3:
            continue
        # Skip header and separator rows
        if all(re.match(r"^:?-{2,}:?$", c) for c in cells):
            in_table = True
            continue
        first_lower = cells[0].lower()
        if "timestamp" in first_lower or "beat" in first_lower and ("spoken" in cells[1].lower() or "asset" in cells[1].lower()):
            continue
        if not in_table:
            continue
        # Check if this table is the Spoken Script table (cell 1 has spoken lines, not asset types)
        if any(k in cells[1].lower() for k in ["user drop", "nano banana", "video clip (.mp4)", "cutout (.jpg)"]):
            continue

        vo_raw = cells[1]
        pause_matches = re.findall(
            r"\[AUDIO PAUSE:\s*(\d+(?:\.\d+)?)\s*(?:s|sec|seconds)?\]",
            vo_raw,
            flags=re.IGNORECASE,
        )
        pause_sec = sum(float(p) for p in pause_matches)
        vo_clean = re.sub(r"\[AUDIO PAUSE:[^\]]+\]", "", vo_raw).strip()
        words = re.findall(r"\b[\w'-]+\b", vo_clean)
        dur = max(2.0, round((len(words) / float(wpm)) * 60.0 + pause_sec, 2))

        kind_cell = cells[2] if len(cells) > 2 else ""
        carry_cell = cells[3] if len(cells) > 3 else ""

        kind_match = re.search(
            r"\b(rehook|unlock|fuse|props|cta|diorama|collage|voxstage|blueprint|journalism|anomaly|telescope|pivot|math|telemetry|split|chart|quote)\b",
            kind_cell,
            flags=re.IGNORECASE,
        )
        kind = kind_match.group(1).lower() if kind_match else "diorama"

        beats.append({
            "id": f"beat-{len(beats)+1:02d}",
            "label": re.sub(r"\*+", "", cells[0]).strip(),
            "startSec": round(cursor_sec, 2),
            "endSec": round(cursor_sec + dur, 2),
            "durationSec": dur,
            "vo": vo_clean,
            "pauseSec": pause_sec,
            "kind": kind,
            "visualDirection": kind_cell,
            "carryAndAudio": carry_cell,
        })
        cursor_sec += dur

    return beats


def analyze_blueprint(text: str, wpm: int = 150) -> dict:
    pause_matches = re.findall(
        r"\[AUDIO PAUSE:\s*(\d+(?:\.\d+)?)\s*(?:s|sec|seconds)?\]",
        text,
        flags=re.IGNORECASE,
    )
    total_pause_seconds = sum(float(p) for p in pause_matches)

    lower_text = text.lower()
    checks = {
        "has_packaging_and_titles": any(
            k in lower_text for k in ["working title", "thumbnail", "packaging", "title archetype"]
        ),
        "has_empirical_data_pipeline": any(
            k in lower_text for k in ["dataset", "repository", "empirical", "rbi", "mospi", "gdelt", "cinemetrics", "gaia", "jwst", "cern", "un comtrade", "isro"]
        ),
        "has_preflight_asset_and_nanobanana_manifest": (
            "assets/" in lower_text and ("checklist" in lower_text or "fallback" in lower_text or "nano banana" in lower_text)
        ),
        "has_audio_pause_markers": len(pause_matches) > 0,
        "has_motion_designer_kinds_or_styles": any(
            k in lower_text for k in ["telescope", "pivot", "anomaly", "collage", "diorama", "rehook", "unlock", "fuse", "math", "telemetry", "voxstage", "blueprint", "journalism"]
        ),
        "has_onetake_carry_continuity": (
            "carry" in lower_text or "onetake" in lower_text or "morph" in lower_text
        ),
    }

    found_banned = [p for p in BANNED_PHRASES if p in lower_text]
    found_lazy = [m for m in LAZY_MODIFIERS if re.search(rf"\b{re.escape(m)}\b", lower_text)]

    beats = extract_beats_from_markdown(text, wpm=wpm)
    all_words = re.findall(r"\b[\w'-]+\b", text)
    total_word_count = len(all_words)
    if beats:
        estimated_spoken_words = sum(len(re.findall(r"\b[\w'-]+\b", b["vo"])) for b in beats)
    else:
        estimated_spoken_words = int(total_word_count * 0.45)

    spoken_seconds = (estimated_spoken_words / float(wpm)) * 60.0
    total_runtime_seconds = round(spoken_seconds + total_pause_seconds, 1)

    passed_checks = sum(1 for v in checks.values() if v)
    if not found_banned:
        passed_checks += 1
    total_checks = len(checks) + 1

    return {
        "total_word_count": total_word_count,
        "estimated_spoken_words": estimated_spoken_words,
        "beat_count": len(beats),
        "wpm": wpm,
        "audio_pause_count": len(pause_matches),
        "total_pause_seconds": total_pause_seconds,
        "estimated_spoken_plus_pause_seconds": total_runtime_seconds,
        "estimated_runtime_formatted": f"{int(total_runtime_seconds // 60)}m {int(total_runtime_seconds % 60)}s",
        "structural_checks": checks,
        "banned_phrases_found": found_banned,
        "lazy_modifiers_found": found_lazy,
        "clean_prose": len(found_banned) == 0,
        "score": f"{passed_checks}/{total_checks}",
        "passed": passed_checks == total_checks,
        "beats": beats,
    }


def main():
    parser = argparse.ArgumentParser(description="Validate Content Director blueprint and export script.json for Motion Designer.")
    parser.add_argument("blueprint_path", type=Path, help="Path to markdown blueprint file")
    parser.add_argument("--wpm", type=int, default=150, help="Target speaking rate in WPM (default: 150; use 180 for 9:16 Reels)")
    parser.add_argument("--export-json", type=Path, default=None, help="Optional path to write script.json handoff for motion-designer")
    parser.add_argument("--json", action="store_true", help="Output raw JSON report")
    args = parser.parse_args()

    if not args.blueprint_path.exists():
        print(f"Error: File not found: {args.blueprint_path}", file=sys.stderr)
        sys.exit(1)

    text = args.blueprint_path.read_text(encoding="utf-8", errors="replace")
    report = analyze_blueprint(text, wpm=args.wpm)

    if args.export_json:
        handoff = {
            "schema": "fluxd-script-handoff-v1",
            "sourceBlueprint": str(args.blueprint_path),
            "wpm": args.wpm,
            "estimatedDurationSec": report["estimated_spoken_plus_pause_seconds"],
            "voiceoverRecordingMode": "single-continuous-take",
            "beats": report["beats"],
        }
        args.export_json.parent.mkdir(parents=True, exist_ok=True)
        args.export_json.write_text(json.dumps(handoff, indent=2), encoding="utf-8")

    if args.json:
        print(json.dumps(report, indent=2))
    else:
        print(f"=== Content Director Blueprint Audit ({args.blueprint_path.name}) ===")
        print(f"Score: {report['score']} ({'PASS' if report['passed'] else 'NEEDS ATTENTION'})")
        print(f"Extracted Beats: {report['beat_count']} | Spoken VO Words: ~{report['estimated_spoken_words']} @ {report['wpm']} WPM")
        print(f"Audio Pauses: {report['audio_pause_count']} markers ({report['total_pause_seconds']}s total)")
        print(f"Estimated VO + Pause Duration: {report['estimated_runtime_formatted']}")
        if args.export_json:
            print(f"Exported Motion Designer Handoff: {args.export_json}")
        print("\nStructural Checks:")
        for k, v in report["structural_checks"].items():
            status = "PASS" if v else "FAIL"
            print(f"  [{status}] {k}")
        if report["banned_phrases_found"]:
            print(f"\nBanned Phrases Found: {', '.join(report['banned_phrases_found'])}")
        else:
            print("\nProse Hygiene: PASS (Zero banned AI cliches or rhetorical fluff)")


if __name__ == "__main__":
    main()

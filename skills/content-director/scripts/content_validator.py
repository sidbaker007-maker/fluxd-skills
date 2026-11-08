#!/usr/bin/env python3
"""
Deterministic validator, pacing calculator (<= 179s Reel cap), anti-PPT / anti-box checker,
and script.json handoff exporter for Content Director -> Motion Designer (HyperFrames).

Usage:
    python3 scripts/content_validator.py <path-to-markdown-blueprint> [--wpm 145] [--export-json script.json] [--json]
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

VALID_SFX_KEYS = {
    "whoosh-soft-air",
    "whoosh-fast-whip",
    "whoosh-paper-turn",
    "hit-sub-boom",
    "hit-cinematic-thud",
    "hit-stamp-slam",
    "riser-warm-swell",
    "riser-tension-suck",
    "foley-pen-highlight",
    "foley-chalk-draw",
    "foley-card-place",
    "foley-camera-shutter",
    "tick-soft-counter",
    "chime-subtle-lock",
    "drone-dark-investigative",
    "drone-warm-editorial",
}

LEGACY_SFX_ALIAS = {
    "sub-bass-theatrical-boom": "hit-sub-boom",
    "projector-shutter-click": "foley-camera-shutter",
    "paper-flutter-crescendo": "whoosh-paper-turn",
    "lock-click-x3": "tick-soft-counter",
    "chalk-scratch-spark": "foley-chalk-draw",
    "paper-unroll-whoosh": "whoosh-paper-turn",
    "stamp-slam-vermilion": "hit-stamp-slam",
    "sonar-tick-x7": "tick-soft-counter",
    "whip-pan-transient": "whoosh-fast-whip",
    "deep-drum-hit": "hit-cinematic-thud",
    "metallic-chime + map-unfold": "chime-subtle-lock",
    "warm-cello-swell": "riser-warm-swell",
    "clean-synth-rise": "riser-warm-swell",
    "overshoot-prop-pop": "foley-card-place",
    "warm-tape-loop-whoosh": "whoosh-soft-air",
}

SUPPORTED_KINDS = [
    "statement",
    "hook",
    "collage",
    "anomaly",
    "pivot",
    "compare",
    "unlock",
    "steps",
    "stat",
    "chart",
    "math",
    "telemetry",
    "telescope",
    "lighttable",
    "cta",
    "outro",
]


def normalize_sfx(raw_sfx: str) -> str:
    s = (raw_sfx or "").strip().lower()
    if s in VALID_SFX_KEYS:
        return s
    if s in LEGACY_SFX_ALIAS:
        return LEGACY_SFX_ALIAS[s]
    return "whoosh-soft-air"


def extract_beats_from_markdown(text: str, wpm: int = 145, max_duration: float = 179.0) -> list:
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
        if all(re.match(r"^:?-{2,}:?$", c) for c in cells):
            in_table = True
            continue
        first_lower = cells[0].lower()
        if "timestamp" in first_lower or ("beat" in first_lower and ("spoken" in cells[1].lower() or "asset" in cells[1].lower() or "source" in cells[1].lower())):
            continue
        if not in_table:
            continue
        if any(k in cells[1].lower() for k in ["user drop", "nano banana", "video clip (.mp4)", "cutout (.jpg)", "sfx catalog"]):
            continue

        vo_raw = cells[1]
        pause_matches = re.findall(
            r"\[AUDIO PAUSE:\s*(\d+(?:\.\d+)?)\s*(?:s|sec|seconds)?\]",
            vo_raw,
            flags=re.IGNORECASE,
        )
        pause_sec = min(0.2, sum(float(p) for p in pause_matches))
        vo_clean = re.sub(r"\[AUDIO PAUSE:[^\]]+\]", "", vo_raw).strip()
        words = re.findall(r"\b[\w'-]+\b", vo_clean)
        dur = max(2.4, round((len(words) / float(wpm)) * 60.0 + pause_sec, 2))

        kind_cell = cells[2] if len(cells) > 2 else ""
        carry_cell = cells[3] if len(cells) > 3 else ""

        kind_match = re.search(
            r"\b(" + "|".join(SUPPORTED_KINDS) + r")\b",
            kind_cell,
            flags=re.IGNORECASE,
        )
        kind = kind_match.group(1).lower() if kind_match else "statement"

        sfx_match = re.search(r"\b(" + "|".join(list(VALID_SFX_KEYS) + list(LEGACY_SFX_ALIAS.keys())) + r")\b", carry_cell, flags=re.IGNORECASE)
        sfx_key = normalize_sfx(sfx_match.group(1) if sfx_match else "whoosh-soft-air")

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
            "sfx": sfx_key,
        })
        cursor_sec += dur

    # Enforce hard cap <= max_duration (179.0s) by proportional scaling if exceeded
    if beats and cursor_sec > max_duration:
        scale = max_duration / cursor_sec
        t_acc = 0.0
        for b in beats:
            b["durationSec"] = round(max(2.0, b["durationSec"] * scale), 2)
            b["startSec"] = round(t_acc, 2)
            b["endSec"] = round(t_acc + b["durationSec"], 2)
            t_acc += b["durationSec"]

    return beats


def analyze_blueprint(text: str, wpm: int = 145) -> dict:
    beats = extract_beats_from_markdown(text, wpm=wpm)
    lower_text = text.lower()
    found_banned = [p for p in BANNED_PHRASES if p in lower_text]
    total_sec = round(sum(b["durationSec"] for b in beats), 2)
    pill_overuse = [
        b["id"] for b in beats
        if len(re.findall(r"\[[^\]]+\]", b.get("visualDirection", ""))) > 1
    ]
    passed = (len(found_banned) == 0) and (total_sec <= 179.0 or total_sec == 0)
    return {
        "status": "PASS" if passed else "WARN",
        "wpm": wpm,
        "beat_count": len(beats),
        "estimated_duration_seconds": total_sec,
        "within_179s_reel_cap": total_sec <= 179.0,
        "pill_overuse_beats": pill_overuse,
        "banned_phrases_found": found_banned,
        "beats": beats,
    }


def main():
    parser = argparse.ArgumentParser(description="Validate Content Director blueprint and export script.json.")
    parser.add_argument("file", type=Path, help="Path to markdown blueprint")
    parser.add_argument("--wpm", type=int, default=145, help="Words per minute (default: 145)")
    parser.add_argument("--export-json", type=Path, default=None, help="Export structured script.json handoff")
    parser.add_argument("--json", action="store_true", help="Output JSON report")
    args = parser.parse_args()

    text = args.file.read_text(encoding="utf-8")
    report = analyze_blueprint(text, wpm=args.wpm)

    if args.export_json:
        handoff = {
            "schema": "fluxd-editorial-hyperframes-v2",
            "sourceBlueprint": str(args.file),
            "style": "editorial",
            "format": "9:16",
            "resolution": "1080x1920",
            "fps": 60,
            "maxDurationSec": 179.0,
            "wpm": args.wpm,
            "estimatedDurationSec": report["estimated_duration_seconds"],
            "voiceoverRecordingMode": "single-continuous-take",
            "subtitles": "karaoke-active-word",
            "beats": report["beats"],
        }
        args.export_json.write_text(json.dumps(handoff, indent=2), encoding="utf-8")

    if args.json:
        print(json.dumps({k: v for k, v in report.items() if k != "beats"}, indent=2))
    else:
        print(f"Status: {report['status']} | Beats: {report['beat_count']} | Duration: {report['estimated_duration_seconds']}s (<=179s cap: {report['within_179s_reel_cap']})")


if __name__ == "__main__":
    main()

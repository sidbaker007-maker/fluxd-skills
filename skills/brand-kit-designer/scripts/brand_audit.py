#!/usr/bin/env python3
"""
brand_audit.py - Dependency-free SVG Logo Craft & Brand Palette/Typography Auditor.

Inspired by:
- kaankiziltug/logo-design-skill (SVG anchor economy, near-miss angle detection, 1/48th tiny detail check)
- Collective Brain Brandkit (6-color cap, WCAG 4.5:1 / 3.0:1 mathematical contrast verification)
- SanbaoAI/logo-generator-skill (surface polarity & chromostereopsis / luminance vibration checks)

Usage:
  python3 brand_audit.py --svg mark.svg lockup.svg
  python3 brand_audit.py --spec brand_spec.json
  python3 brand_audit.py --svg mark.svg --spec brand_spec.json --json
"""

import argparse
import json
import math
import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path


# ---------------------------------------------------------------------------
# Color Math & WCAG / Luminance Vibration Utilities
# ---------------------------------------------------------------------------

def parse_hex(hex_str: str):
    """Parse #RRGGBB or #RGB into (r, g, b) ints 0..255."""
    s = hex_str.strip().lstrip("#")
    if len(s) == 3:
        s = "".join(c * 2 for c in s)
    if len(s) != 6 or not re.match(r"^[0-9a-fA-F]{6}$", s):
        raise ValueError(f"Invalid HEX color: {hex_str}")
    return int(s[0:2], 16), int(s[2:4], 16), int(s[4:6], 16)


def relative_luminance(hex_str: str) -> float:
    """Compute WCAG 2.1 relative luminance (0.0 to 1.0)."""
    r, g, b = parse_hex(hex_str)
    vals = []
    for c in (r, g, b):
        v = c / 255.0
        vals.append(v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4)
    return 0.2126 * vals[0] + 0.7152 * vals[1] + 0.0722 * vals[2]


def contrast_ratio(hex1: str, hex2: str) -> float:
    """Compute WCAG 2.1 contrast ratio (1.0 to 21.0)."""
    l1 = relative_luminance(hex1)
    l2 = relative_luminance(hex2)
    bright, dark = max(l1, l2), min(l1, l2)
    return round((bright + 0.05) / (dark + 0.05), 2)


def rgb_to_hsl(hex_str: str):
    """Return (h_deg 0..360, s 0..1, l 0..1)."""
    r, g, b = [x / 255.0 for x in parse_hex(hex_str)]
    mx, mn = max(r, g, b), min(r, g, b)
    l = (mx + mn) / 2.0
    if mx == mn:
        return 0.0, 0.0, l
    d = mx - mn
    s = d / (2.0 - mx - mn) if l > 0.5 else d / (mx + mn)
    if mx == r:
        h = (g - b) / d + (6.0 if g < b else 0.0)
    elif mx == g:
        h = (b - r) / d + 2.0
    else:
        h = (r - g) / d + 4.0
    return round(h * 60.0, 1), round(s, 3), round(l, 3)


# ---------------------------------------------------------------------------
# SVG Craft Auditor
# ---------------------------------------------------------------------------

CLEAN_ANGLES = [0, 30, 45, 60, 75, 90, 105, 120, 135, 150, 180]


def count_path_anchors(d_attr: str) -> int:
    """Estimate anchor point count from an SVG path d attribute."""
    if not d_attr:
        return 0
    commands = re.findall(r"[MmLlHhVvCcSsQqTtAa]", d_attr)
    return len(commands)


def extract_line_angles_from_path(d_attr: str):
    """Extract explicit M x y L x y segment angles in degrees (0..180)."""
    angles = []
    tokens = re.findall(r"[MmLlZz]|[-+]?\d*\.?\d+", d_attr or "")
    idx = 0
    cx, cy = 0.0, 0.0
    mode = None
    while idx < len(tokens):
        tok = tokens[idx]
        if re.match(r"^[MmLlZz]$", tok):
            mode = tok
            idx += 1
            continue
        if mode in ("M", "L") and idx + 1 < len(tokens):
            try:
                nx, ny = float(tokens[idx]), float(tokens[idx + 1])
                if mode == "L":
                    dx, dy = nx - cx, ny - cy
                    length = math.hypot(dx, dy)
                    if length >= 6.0:
                        ang = abs(math.degrees(math.atan2(dy, dx))) % 180.0
                        angles.append(round(ang, 2))
                cx, cy = nx, ny
                if mode == "M":
                    mode = "L"
                idx += 2
            except ValueError:
                idx += 1
        else:
            idx += 1
    return angles


def audit_svg_file(svg_path: str) -> dict:
    """Audit an SVG file against logo design craft standards."""
    path = Path(svg_path)
    if not path.exists():
        return {"file": svg_path, "valid": False, "score": 0, "errors": [f"File not found: {svg_path}"], "warnings": []}

    raw = path.read_text(encoding="utf-8", errors="replace")
    errors = []
    warnings = []
    info = []
    score = 100

    try:
        root = ET.fromstring(raw)
    except ET.ParseError as exc:
        return {"file": path.name, "valid": False, "score": 0, "errors": [f"Invalid SVG XML: {exc}"], "warnings": []}

    view_box = root.attrib.get("viewBox")
    min_dim = 256.0
    aspect = 1.0
    if not view_box:
        errors.append("Missing viewBox attribute on <svg>; required for scalable rendering.")
        score -= 25
    else:
        parts = [float(x) for x in re.split(r"[\s,]+", view_box.strip()) if x]
        if len(parts) == 4 and parts[2] > 0 and parts[3] > 0:
            w, h = parts[2], parts[3]
            min_dim = min(w, h)
            aspect = round(w / h, 3)
            info.append(f"viewBox {view_box} (aspect {aspect})")
        else:
            errors.append(f"Malformed viewBox: {view_box}")
            score -= 20

    total_anchors = 0
    near_miss_angles = []
    tiny_shapes = []
    has_raster_image = False
    has_complex_filter = False
    gradient_stops = 0
    min_feature_floor = min_dim / 48.0  # 1/48th rule (~5.33 units on 256 canvas)

    for elem in root.iter():
        tag = elem.tag.split("}")[-1]

        if tag == "image":
            has_raster_image = True
        elif tag == "filter":
            has_complex_filter = True
        elif tag == "stop":
            gradient_stops += 1

        stroke_w = elem.attrib.get("stroke-width")
        if stroke_w:
            try:
                sw = float(re.sub(r"[a-zA-Z%]+", "", stroke_w))
                if 0 < sw < min_feature_floor:
                    tiny_shapes.append(f"stroke-width={sw} (< {min_feature_floor:.1f} min floor)")
            except ValueError:
                pass

        if tag == "path":
            d = elem.attrib.get("d", "")
            total_anchors += count_path_anchors(d)
            for ang in extract_line_angles_from_path(d):
                for clean in CLEAN_ANGLES:
                    diff = abs(ang - clean)
                    if 0.3 <= diff <= 2.8:
                        near_miss_angles.append(f"{ang} deg (near {clean} deg)")
        elif tag in ("polygon", "polyline"):
            pts = re.findall(r"[-+]?\d*\.?\d+", elem.attrib.get("points", ""))
            total_anchors += len(pts) // 2
            coords = [(float(pts[i]), float(pts[i + 1])) for i in range(0, len(pts) - 1, 2)]
            for i in range(len(coords) - 1):
                dx = coords[i + 1][0] - coords[i][0]
                dy = coords[i + 1][1] - coords[i][1]
                if math.hypot(dx, dy) >= 6.0:
                    ang = round(abs(math.degrees(math.atan2(dy, dx))) % 180.0, 2)
                    for clean in CLEAN_ANGLES:
                        if 0.3 <= abs(ang - clean) <= 2.8:
                            near_miss_angles.append(f"{ang} deg (near {clean} deg)")
        elif tag == "rect":
            total_anchors += 4
            try:
                rw = float(elem.attrib.get("width", min_dim))
                rh = float(elem.attrib.get("height", min_dim))
                if (0 < rw < min_feature_floor) or (0 < rh < min_feature_floor):
                    tiny_shapes.append(f"rect {rw}x{rh} (< {min_feature_floor:.1f} floor)")
            except ValueError:
                pass
        elif tag == "circle":
            total_anchors += 4
            try:
                r = float(elem.attrib.get("r", min_dim))
                if 0 < r * 2 < min_feature_floor:
                    tiny_shapes.append(f"circle diameter {r*2} (< {min_feature_floor:.1f} floor)")
            except ValueError:
                pass
        elif tag == "ellipse":
            total_anchors += 4
        elif tag == "line":
            total_anchors += 2
            try:
                x1, y1 = float(elem.attrib.get("x1", 0)), float(elem.attrib.get("y1", 0))
                x2, y2 = float(elem.attrib.get("x2", 0)), float(elem.attrib.get("y2", 0))
                if math.hypot(x2 - x1, y2 - y1) >= 6.0:
                    ang = round(abs(math.degrees(math.atan2(y2 - y1, x2 - x1))) % 180.0, 2)
                    for clean in CLEAN_ANGLES:
                        if 0.3 <= abs(ang - clean) <= 2.8:
                            near_miss_angles.append(f"{ang} deg (near {clean} deg)")
            except ValueError:
                pass

    info.append(f"anchors: {total_anchors} (target <= 120, library median 53-75)")
    if total_anchors == 0:
        errors.append("SVG contains 0 vector shape anchors.")
        score -= 40
    elif total_anchors > 250:
        warnings.append(
            f"[complexity] {total_anchors} anchor points exceeds 95% of iconic logos (median 53-75). Simplify paths."
        )
        score -= 18
    elif total_anchors > 155:
        warnings.append(
            f"[complexity] {total_anchors} anchor points is above p75 (155). Ensure every point earns its place."
        )
        score -= 8

    if near_miss_angles:
        sample = ", ".join(near_miss_angles[:4])
        warnings.append(
            f"[near-miss-angle] {len(near_miss_angles)} segment(s) are 0.3-2.8 deg off a clean angle ({sample}). Snap diagonals to 30/45/60/75/90 deg."
        )
        score -= min(12, len(near_miss_angles) * 3)

    if tiny_shapes:
        sample = ", ".join(tiny_shapes[:3])
        warnings.append(
            f"[tiny-detail] {len(tiny_shapes)} feature(s) smaller than 1/48th of canvas ({sample}); will collapse at 16px favicon size."
        )
        score -= min(15, len(tiny_shapes) * 5)

    if has_raster_image:
        errors.append("[raster-embed] Embedded <image> tag found inside SVG. Logo marks must be pure vector.")
        score -= 30

    if has_complex_filter:
        warnings.append("[filter-bloat] SVG <filter> detected. Drop shadows and blurs break single-color ink and print reproduction.")
        score -= 10

    if gradient_stops > 4:
        warnings.append(f"[gradient-bloat] {gradient_stops} gradient stops found. Ensure a flat 1-color fallback exists.")
        score -= 6

    score = max(0, min(100, score))
    return {
        "file": path.name,
        "valid": len(errors) == 0,
        "score": score,
        "anchors": total_anchors,
        "aspect": aspect,
        "info": info,
        "warnings": warnings,
        "errors": errors,
    }


# ---------------------------------------------------------------------------
# Brand Spec & Palette Auditor
# ---------------------------------------------------------------------------

def audit_brand_spec(spec: dict) -> dict:
    """Audit a brand_spec.json dictionary for color theory, contrast math, and typography."""
    errors = []
    warnings = []
    info = []
    score = 100

    # Positioning check
    positioning = spec.get("positioning", "").strip()
    if not positioning or len(positioning) < 20:
        warnings.append("[positioning] Missing or overly brief positioning statement.")
        score -= 10
    else:
        info.append(f"Positioning verified ({len(positioning)} chars)")

    # Palette audit
    palette = spec.get("palette", [])
    if not palette:
        errors.append("[palette] No colors defined in 'palette'.")
        return {"valid": False, "score": 0, "errors": errors, "warnings": warnings, "info": info, "contrast_matrix": {}}

    if len(palette) > 6:
        warnings.append(f"[palette-bloat] Palette has {len(palette)} colors; cap at 6 (including neutrals) to prevent visual clutter.")
        score -= 10
    elif len(palette) < 4:
        warnings.append(f"[palette-sparse] Palette has only {len(palette)} colors; recommend 5-6 semantic roles.")
        score -= 5

    by_role = {}
    for item in palette:
        role = item.get("role", "").lower().strip()
        hex_val = item.get("hex", "").strip()
        name = item.get("name", role)
        try:
            r, g, b = parse_hex(hex_val)
            h, s, l = rgb_to_hsl(hex_val)
            by_role[role] = {"hex": hex_val, "name": name, "rgb": (r, g, b), "hsl": (h, s, l), "lum": relative_luminance(hex_val)}
            if hex_val.upper() == "#000000":
                warnings.append(f"[pure-black] '{name}' uses raw #000000. Prefer an undertone-matched deep ink (e.g. #141413, #11181C).")
                score -= 4
            if hex_val.upper() == "#FFFFFF":
                warnings.append(f"[pure-white] '{name}' uses raw #FFFFFF. Consider a subtly tinted canvas (e.g. #FAF7F2, #F6F8FA) to reduce glare.")
                score -= 3
        except ValueError as e:
            errors.append(str(e))
            score -= 20

    # Identify key surfaces
    light_surface = by_role.get("surface_light") or by_role.get("canvas") or by_role.get("background") or palette[0]
    dark_surface = by_role.get("surface_dark") or by_role.get("ink") or by_role.get("text") or (palette[1] if len(palette) > 1 else palette[0])
    light_hex = light_surface.get("hex", "#FAF7F2")
    dark_hex = dark_surface.get("hex", "#141413")

    contrast_matrix = {}
    ink_vs_canvas = contrast_ratio(light_hex, dark_hex)
    contrast_matrix["ink_on_canvas"] = ink_vs_canvas
    if ink_vs_canvas < 4.5:
        errors.append(f"[contrast-fail] Primary Ink ({dark_hex}) on Canvas ({light_hex}) is {ink_vs_canvas}:1 (must be >= 4.5:1, ideally >= 7.0:1).")
        score -= 25
    elif ink_vs_canvas < 7.0:
        warnings.append(f"[contrast-aa] Primary Ink on Canvas is {ink_vs_canvas}:1 (passes AA, but >= 7.0:1 AAA is preferred for body copy).")
    else:
        info.append(f"Ink on Canvas contrast: {ink_vs_canvas}:1 (WCAG AAA)")

    # Check every color against light & dark surfaces
    chromatic_colors = []
    for item in palette:
        hex_val = item.get("hex", "#000000")
        role = item.get("role", "color")
        name = item.get("name", role)
        cr_light = contrast_ratio(hex_val, light_hex)
        cr_dark = contrast_ratio(hex_val, dark_hex)
        contrast_matrix[role] = {
            "hex": hex_val,
            "on_canvas": cr_light,
            "on_ink": cr_dark,
            "usable_on_canvas_text": cr_light >= 4.5,
            "usable_on_canvas_mark": cr_light >= 3.0,
            "usable_on_ink_text": cr_dark >= 4.5,
            "usable_on_ink_mark": cr_dark >= 3.0,
        }
        if role not in ("surface_light", "canvas", "background", "surface_dark", "ink", "text"):
            chromatic_colors.append((role, name, hex_val))
            if cr_light < 3.0 and cr_dark < 3.0:
                errors.append(
                    f"[low-visibility] '{name}' ({hex_val}) fails 3.0:1 against both Canvas ({cr_light}:1) and Ink ({cr_dark}:1)."
                )
                score -= 15
            elif cr_light < 3.0:
                info.append(
                    f"[polarity-rule] '{name}' ({hex_val}) is {cr_light}:1 on Canvas (< 3.0:1); lock to Dark Ink surfaces ({cr_dark}:1) and use Ink fallback on light backgrounds."
                )
            elif cr_dark < 3.0:
                info.append(
                    f"[polarity-rule] '{name}' ({hex_val}) is {cr_dark}:1 on Ink (< 3.0:1); lock to Light Canvas surfaces ({cr_light}:1) and use Canvas fallback on dark backgrounds."
                )

    # Check chromostereopsis / luminance vibration between chromatic colors
    for i in range(len(chromatic_colors)):
        for j in range(i + 1, len(chromatic_colors)):
            r1, n1, h1 = chromatic_colors[i]
            r2, n2, h2 = chromatic_colors[j]
            cr_pair = contrast_ratio(h1, h2)
            if cr_pair < 3.0:
                info.append(
                    f"[vibration-guard] '{n1}' ({h1}) and '{n2}' ({h2}) have {cr_pair}:1 contrast. Never place directly on top of each other; separate with Canvas or Ink."
                )

    # Typography audit
    typography = spec.get("typography", {})
    headline_font = typography.get("headline", {}).get("family", "")
    body_font = typography.get("body", {}).get("family", "")
    if not headline_font or not body_font:
        warnings.append("[typography] Both 'headline.family' and 'body.family' should be explicitly defined.")
        score -= 10
    else:
        info.append(f"Typography pairing: {headline_font} (Display) + {body_font} (Body)")

    score = max(0, min(100, score))
    return {
        "valid": len(errors) == 0,
        "score": score,
        "info": info,
        "warnings": warnings,
        "errors": errors,
        "contrast_matrix": contrast_matrix,
    }


def main():
    parser = argparse.ArgumentParser(description="Audit SVG logos and brand kit specifications.")
    parser.add_argument("--svg", nargs="*", default=[], help="Paths to SVG files to audit")
    parser.add_argument("--spec", type=str, default=None, help="Path to brand_spec.json to audit")
    parser.add_argument("--json", action="store_true", help="Output raw JSON report")
    args = parser.parse_args()

    if not args.svg and not args.spec:
        parser.print_help()
        sys.exit(1)

    report = {"svg_audits": [], "spec_audit": None, "overall_passed": True}

    for svg_file in args.svg:
        res = audit_svg_file(svg_file)
        report["svg_audits"].append(res)
        if not res["valid"] or res["score"] < 70:
            report["overall_passed"] = False

    if args.spec:
        spec_path = Path(args.spec)
        if not spec_path.exists():
            report["spec_audit"] = {"valid": False, "score": 0, "errors": [f"File not found: {args.spec}"], "warnings": [], "info": []}
            report["overall_passed"] = False
        else:
            spec_data = json.loads(spec_path.read_text(encoding="utf-8"))
            res = audit_brand_spec(spec_data)
            report["spec_audit"] = res
            if not res["valid"] or res["score"] < 75:
                report["overall_passed"] = False

    if args.json:
        print(json.dumps(report, indent=2))
    else:
        for s in report["svg_audits"]:
            print(f"=== SVG Audit: {s['file']} (Score: {s['score']}/100) ===")
            for item in s.get("info", []):
                print(f"  * INFO: {item}")
            for w in s.get("warnings", []):
                print(f"  ! WARN: {w}")
            for e in s.get("errors", []):
                print(f"  X ERROR: {e}")
        if report["spec_audit"]:
            sa = report["spec_audit"]
            print(f"=== Brand Spec & Color Theory Audit (Score: {sa['score']}/100) ===")
            for item in sa.get("info", []):
                print(f"  * INFO: {item}")
            for w in sa.get("warnings", []):
                print(f"  ! WARN: {w}")
            for e in sa.get("errors", []):
                print(f"  X ERROR: {e}")

    sys.exit(0 if report["overall_passed"] else 1)


if __name__ == "__main__":
    main()

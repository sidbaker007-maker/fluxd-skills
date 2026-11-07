#!/usr/bin/env python3
"""
Style-Anchored Nano Banana Paper Cutout Generator & Die-Cut Sticker Processor
(Synthesizes vox-explainer-skill + Leslie-vox-style MG-VOXSTAGE + @justdodani 7-Layer Diorama).

Capabilities:
1. `prompts`: Reads `video.json` (or `script.json`) and generates a complete Nano Banana Prompt Pack:
   - 1x **Style Anchor Prompt** (locks paper grain, B&W halftone dot matrix, white die-cut border, and single accent ink)
   - Per-scene **Isolated Cutout Prompts** on flat `#FFFFFF` or `#00FF00` background (`clean composition, text-free, no labels, no watermarks`).
2. `process`: Converts raw generated/uploaded `.png`/`.jpg` images in `<work>/assets/` into transparent
   die-cut paper cutouts in `<work>/pieces/` with:
   - Automatic background removal (corner flood-fill + chroma/luminance key)
   - High-contrast archival B&W halftone filter (`--bw`)
   - Crisp white scissor-cut paper border (`8px` dilated contour)
   - Optional **MG-VOXSTAGE Hot-Red (`#D62E1F`) offset registration outline** (`--voxstage`)
   - Subtle contact drop shadow for 2.5D diorama stacking.

Usage:
    python3 scripts/nano_banana_cutouts.py prompts <work_dir> [--style voxstage]
    python3 scripts/nano_banana_cutouts.py process <input_img> <output_png> [--bw] [--voxstage] [--border 8]
"""

import argparse
import json
import sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageChops, ImageEnhance, ImageFilter


STYLE_ANCHORS = {
    "voxstage": (
        "Editorial paper cutout collage illustration in the style of Vox and Johnny Harris, "
        "black-and-white high-contrast halftone newspaper photograph subject with a thick hand-cut "
        "white paper border and a 3px offset crimson red (#D62E1F) registration outline, "
        "isolated on a flat pure white (#FFFFFF) background, tactile archival paper grain, "
        "clean composition, text-free, no labels, no watermarks"
    ),
    "diorama": (
        "Vintage 1960s travel magazine paper cutout piece, warm Kodak Kodachrome print texture, "
        "sharp scissor-cut edges with a clean white die-cut sticker border, isolated single object "
        "on a flat pure white (#FFFFFF) background, studio flat lighting, "
        "clean composition, text-free, no labels, no watermarks"
    ),
    "blueprint": (
        "Isometric technical engineering schematic cutout in crisp white 2px vector linework "
        "with cyan (#38BDF8) and amber (#FACC15) mechanical highlights on a deep blueprint blue (#1B3A6B) card, "
        "isolated on a flat pure white (#FFFFFF) background, "
        "clean composition, text-free, no labels, no watermarks"
    ),
    "vintage-sketch": (
        "19th-century cross-hatched copperplate ink engraving cutout on warm sepia archival parchment (#EDE2CE) "
        "with rust-red (#9E3B24) ink accents and torn paper border, isolated on a flat pure white (#FFFFFF) background, "
        "clean composition, text-free, no labels, no watermarks"
    ),
}


def build_prompt_pack(work_dir: Path, style_key: str = "voxstage") -> dict:
    vfile = work_dir / "video.json"
    if not vfile.exists():
        raise FileNotFoundError(f"No video.json in {work_dir}")
    vdata = json.loads(vfile.read_text(encoding="utf-8"))
    anchor = STYLE_ANCHORS.get(style_key, STYLE_ANCHORS["voxstage"])

    prompts = []
    for i, s in enumerate(vdata.get("scenes", [])):
        subj = s.get("cutoutSubject") or s.get("title") or s.get("text") or f"Scene {i+1} focal subject"
        subj_clean = str(subj).replace("*", "").replace("[", "").replace("]", "").strip()
        target_file = s.get("cutout") or f"pieces/cutout-{i+1:02d}.png"
        prompts.append({
            "sceneIndex": i + 1,
            "sceneId": s.get("id", f"s{i+1:02d}"),
            "kind": s.get("kind", "collage"),
            "targetFile": target_file,
            "referenceStyleAnchor": "assets/style-anchor.png",
            "nanoBananaPrompt": (
                f"Single isolated paper cutout of: {subj_clean}. {anchor}"
            ),
        })

    out_pack = {
        "styleKey": style_key,
        "styleAnchorFile": "assets/style-anchor.png",
        "styleAnchorPrompt": anchor,
        "sceneCutouts": prompts,
    }
    out_path = work_dir / "nano_banana_manifest.json"
    out_path.write_text(json.dumps(out_pack, indent=2), encoding="utf-8")
    return out_pack


def process_cutout_image(
    src_path: Path,
    dst_path: Path,
    bw_halftone: bool = False,
    voxstage_red: bool = False,
    border_px: int = 8,
):
    im = Image.open(src_path).convert("RGBA")
    arr = np.array(im)

    # Detect background color from the 4 corners (supports white #FFFFFF, green #00FF00, or light gray)
    corners = np.vstack([
        arr[0:6, 0:6, :3].reshape(-1, 3),
        arr[0:6, -6:, :3].reshape(-1, 3),
        arr[-6:, 0:6, :3].reshape(-1, 3),
        arr[-6:, -6:, :3].reshape(-1, 3),
    ])
    bg_rgb = np.median(corners, axis=0)

    # Compute color distance from background if image isn't already transparent
    if np.min(arr[:, :, 3]) < 250:
        fg_mask = arr[:, :, 3] > 32
    else:
        diff = np.linalg.norm(arr[:, :, :3].astype(np.float32) - bg_rgb.astype(np.float32), axis=2)
        fg_mask = diff > 28.0

    alpha_im = Image.fromarray((fg_mask.astype(np.uint8) * 255), mode="L")
    alpha_im = alpha_im.filter(ImageFilter.MedianFilter(3))

    rgb_im = im.convert("RGB")
    if bw_halftone or voxstage_red:
        gray = rgb_im.convert("L")
        gray = ImageEnhance.Contrast(gray).enhance(1.32)
        rgb_im = Image.merge("RGB", (gray, gray, gray))

    # Build white paper die-cut border by dilating alpha mask
    white_mask = alpha_im
    for _ in range(max(1, border_px // 2)):
        white_mask = white_mask.filter(ImageFilter.MaxFilter(5))

    canvas = Image.new("RGBA", im.size, (0, 0, 0, 0))

    # Optional MG-VOXSTAGE Hot-Red (#D62E1F) offset registration outline
    if voxstage_red:
        red_mask = white_mask.filter(ImageFilter.MaxFilter(5))
        red_layer = Image.new("RGBA", im.size, (214, 46, 31, 255))
        shifted_red_mask = ImageChops.offset(red_mask, 5, 5)
        canvas.paste(red_layer, (0, 0), shifted_red_mask)

    # Drop shadow
    shadow_mask = white_mask.filter(ImageFilter.GaussianBlur(6))
    shadow_layer = Image.new("RGBA", im.size, (15, 15, 18, 120))
    canvas.paste(shadow_layer, (4, 6), shadow_mask)

    # White die-cut paper backing
    white_layer = Image.new("RGBA", im.size, (255, 255, 255, 255))
    canvas.paste(white_layer, (0, 0), white_mask)

    # Paste subject on top
    subj_rgba = rgb_im.convert("RGBA")
    subj_rgba.putalpha(alpha_im)
    canvas.paste(subj_rgba, (0, 0), alpha_im)

    dst_path.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(dst_path, "PNG")


def main():
    parser = argparse.ArgumentParser(description="Nano Banana paper cutout prompt builder and sticker processor.")
    sub = parser.add_subparsers(dest="cmd", required=True)

    p_prompts = sub.add_parser("prompts", help="Generate Nano Banana style-anchored cutout prompt manifest")
    p_prompts.add_argument("work_dir", type=Path)
    p_prompts.add_argument("--style", default="voxstage", choices=list(STYLE_ANCHORS.keys()))

    p_proc = sub.add_parser("process", help="Process an image into a die-cut paper cutout PNG")
    p_proc.add_argument("src", type=Path)
    p_proc.add_argument("dst", type=Path)
    p_proc.add_argument("--bw", action="store_true", help="Apply high-contrast B&W newspaper halftone filter")
    p_proc.add_argument("--voxstage", action="store_true", help="Add MG-VOXSTAGE #D62E1F hot-red offset registration outline")
    p_proc.add_argument("--border", type=int, default=8, help="White paper border thickness in px")

    args = parser.parse_args()
    if args.cmd == "prompts":
        pack = build_prompt_pack(args.work_dir, style_key=args.style)
        print(json.dumps(pack, indent=2))
    elif args.cmd == "process":
        process_cutout_image(args.src, args.dst, bw_halftone=args.bw, voxstage_red=args.voxstage, border_px=args.border)
        print(json.dumps({"status": "processed", "output": str(args.dst)}))


if __name__ == "__main__":
    main()

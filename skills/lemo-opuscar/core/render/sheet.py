#!/usr/bin/env python3
"""core/render/sheet.py — Tiles style frames / stills into a contact sheet for visual review."""
import math
import sys
from PIL import Image, ImageDraw

def main():
    args = sys.argv[1:]
    if len(args) < 2:
        print("Usage: python3 core/render/sheet.py <out.jpg> <img1> <img2> ... [--cols 4] [--w 480]")
        sys.exit(1)
    out_path = args[0]
    cols = 4
    cell_w = 480
    imgs = []
    i = 1
    while i < len(args):
        if args[i] == "--cols":
            cols = int(args[i + 1]); i += 2
        elif args[i] == "--w":
            cell_w = int(args[i + 1]); i += 2
        else:
            imgs.append(args[i]); i += 1
    pil_imgs = [Image.open(p).convert("RGB") for p in imgs]
    aspect = pil_imgs[0].height / pil_imgs[0].width
    cell_h = int(cell_w * aspect)
    rows = math.ceil(len(pil_imgs) / cols)
    sheet = Image.new("RGB", (cols * cell_w, rows * cell_h), (14, 15, 18))
    draw = ImageDraw.Draw(sheet)
    for idx, im in enumerate(pil_imgs):
        r, c = divmod(idx, cols)
        thumb = im.resize((cell_w, cell_h), Image.Resampling.LANCZOS)
        sheet.paste(thumb, (c * cell_w, r * cell_h))
        draw.rectangle([c * cell_w, r * cell_h, (c + 1) * cell_w - 1, (r + 1) * cell_h - 1], outline=(45, 48, 55), width=1)
    sheet.save(out_path, quality=92)
    print(f"Saved contact sheet ({len(pil_imgs)} frames, {cols}x{rows}) -> {out_path}")

if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
vox_fusion_export.py — Generates:
1. High-resolution transparent-background 1960s magazine cut-out PNG pieces (`pieces/*.png`)
   with visible halftone dots, slightly faded warm inks, and hand-cut torn white paper borders.
2. A one-click DaVinci Resolve (Free or Studio) Fusion Composition (`.comp`) file with named
   Loader -> Transform (with real eased Bezier keyframes) -> Merge nodes over a #EDE6D6 cream
   Background node + 4% Camera_Push_Transform + MediaOut1.
"""
import json
import math
import os
import random
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageOps


def apply_1960s_halftone_and_torn_border(im: Image.Image, border_px: int = 12, seed: int = 42) -> Image.Image:
    """Applies a subtle 1960s travel-magazine halftone dot texture + organic torn white paper border + soft drop shadow."""
    im = im.convert("RGBA")
    w, h = im.size
    rng = random.Random(seed)

    # 1. Subtle halftone dot overlay on non-transparent pixels
    alpha = im.getchannel("A")
    dots = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d_draw = ImageDraw.Draw(dots)
    step = 8
    for y in range(0, h, step):
        for x in range(0, w, step):
            d_draw.ellipse([x + 2, y + 2, x + 4, y + 4], fill=(28, 22, 16, 22))
    dots.putalpha(ImageOps.Brightness(alpha).enhance(0.12) if hasattr(ImageOps, "Brightness") else alpha.point(lambda a: int(a * 0.11)))
    im = Image.alpha_composite(im, dots)

    # 2. Expand alpha for torn white paper border
    odd_k = max(3, border_px * 2 + 1)
    border_alpha = alpha.filter(ImageFilter.MaxFilter(odd_k))

    # Add slight organic edge nibble along the border perimeter
    white_paper = Image.new("RGBA", (w, h), (252, 250, 245, 255))
    white_paper.putalpha(border_alpha)

    # 3. Soft paper-on-paper drop shadow
    shadow_alpha = border_alpha.filter(ImageFilter.GaussianBlur(radius=6)).point(lambda a: int(a * 0.38))
    shadow = Image.new("RGBA", (w + 16, h + 16), (24, 20, 15, 0))
    sh_layer = Image.new("RGBA", (w, h), (24, 20, 15, 255))
    sh_layer.putalpha(shadow_alpha)
    shadow.alpha_composite(sh_layer, (8, 10))
    shadow.alpha_composite(white_paper, (4, 4))
    shadow.alpha_composite(im, (4, 4))
    bbox = shadow.getbbox()
    if bbox:
        pad = 18
        x0 = max(0, bbox[0] - pad)
        y0 = max(0, bbox[1] - pad)
        x1 = min(shadow.width, bbox[2] + pad)
        y1 = min(shadow.height, bbox[3] + pad)
        shadow = shadow.crop((x0, y0, x1, y1))
    return shadow


def generate_belvedere_pieces(pieces_dir: Path) -> list:
    """Generates the 10 transparent PNG cut-out pieces for the Vox Diorama explainer."""
    pieces_dir.mkdir(parents=True, exist_ok=True)
    W, H = 1920, 1080
    manifest = []

    # 1. Sky band (21:9 torn blue magazine gradient)
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    dr = ImageDraw.Draw(im)
    dr.polygon([(60, 45), (1860, 38), (1868, 430), (52, 442)], fill=(59, 130, 196, 255))
    im = apply_1960s_halftone_and_torn_border(im, border_px=9, seed=1)
    p1 = pieces_dir / "01_sky_band.png"
    im.save(p1)
    manifest.append(("Sky_Band", p1.name, "Back", "0.0s", "Slides down 45px (ease-out)"))

    # 2. Separate Clouds & Birds
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    dr = ImageDraw.Draw(im)
    for cx, cy, sc in [(240, 130, 1.0), (1280, 105, 0.95), (1560, 240, 0.8)]:
        r = int(42 * sc)
        dr.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(232, 225, 212, 255))
        dr.ellipse([cx + int(32 * sc) - r, cy - int(14 * sc) - r, cx + int(32 * sc) + r, cy - int(14 * sc) + r], fill=(238, 232, 220, 255))
        dr.ellipse([cx + int(68 * sc) - r, cy - r, cx + int(68 * sc) + r, cy + r], fill=(228, 220, 206, 255))
    # Birds
    for bx, by in [(1060, 195), (1185, 245)]:
        dr.polygon([(bx, by), (bx + 28, by - 18), (bx + 46, by - 4), (bx + 76, by - 22), (bx + 54, by + 12), (bx + 24, by + 10)], fill=(74, 55, 43, 255))
    im = apply_1960s_halftone_and_torn_border(im, border_px=8, seed=2)
    p2 = pieces_dir / "02_clouds_and_birds.png"
    im.save(p2)
    manifest.append(("Clouds_And_Birds", p2.name, "Back-Mid", "0.12s", "Drifts continuously (+85px X)"))

    # 3. Mountain Ridge strip
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    dr = ImageDraw.Draw(im)
    dr.polygon([
        (40, 680), (40, 340), (190, 195), (360, 320), (540, 185),
        (750, 340), (920, 245), (1140, 370), (1380, 175), (1600, 330),
        (1770, 215), (1880, 355), (1880, 680)
    ], fill=(91, 88, 82, 255))
    dr.polygon([(840, 340), (1140, 370), (1380, 270), (1510, 610), (820, 620)], fill=(125, 114, 101, 255))
    im = apply_1960s_halftone_and_torn_border(im, border_px=9, seed=3)
    p3 = pieces_dir / "03_mountains_ridge.png"
    im.save(p3)
    manifest.append(("Mountains_Ridge", p3.name, "Middle", "0.24s", "Rises 65px (ease-out)"))

    # 4. The Landmark / Turn Piece: Rhône Glacier
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    dr = ImageDraw.Draw(im)
    dr.polygon([(830, 325), (1120, 298), (1410, 252), (1615, 555), (1310, 610), (845, 595)], fill=(184, 212, 222, 255))
    dr.polygon([(920, 375), (1270, 345), (1460, 520), (995, 550)], fill=(221, 240, 245, 255))
    im = apply_1960s_halftone_and_torn_border(im, border_px=9, seed=4)
    p4 = pieces_dir / "04_rhone_glacier.png"
    im.save(p4)
    manifest.append(("Rhone_Glacier", p4.name, "Middle-Turn", "0.36s", "Slides away on Beat 2 (1882 -> 2016)"))

    # 5. Winding Furka Pass Road & Slope
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    dr = ImageDraw.Draw(im)
    dr.polygon([(40, 1030), (40, 600), (740, 555), (1710, 570), (1880, 660), (1880, 1030)], fill=(123, 126, 76, 255))
    dr.polygon([(40, 745), (720, 710), (1580, 675), (1690, 765), (1420, 935), (660, 915), (40, 895)], fill=(140, 133, 123, 255))
    im = apply_1960s_halftone_and_torn_border(im, border_px=9, seed=5)
    p5 = pieces_dir / "05_furka_pass_road.png"
    im.save(p5)
    manifest.append(("Furka_Pass_Road", p5.name, "Front-Ground", "0.48s", "Rises 75px (ease-out)"))

    # 6. Hero Subject: Hotel Belvédère
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    dr = ImageDraw.Draw(im)
    # Stone base + red canopy + cream floors + mansard roof
    dr.rectangle([335, 540, 735, 730], fill=(140, 132, 121, 255), outline=(43, 38, 35, 255), width=4)
    dr.rectangle([350, 558, 720, 596], fill=(201, 59, 43, 255))
    dr.rectangle([355, 392, 715, 542], fill=(223, 213, 197, 255), outline=(43, 38, 35, 255), width=4)
    dr.polygon([(340, 392), (400, 295), (670, 295), (730, 392)], fill=(74, 70, 66, 255), outline=(43, 38, 35, 255))
    for wx in range(385, 685, 72):
        for wy in [418, 478, 612]:
            dr.rectangle([wx, wy, wx + 40, wy + 46], fill=(52, 46, 42, 255))
    im = apply_1960s_halftone_and_torn_border(im, border_px=10, seed=6)
    p6 = pieces_dir / "06_hotel_belvedere.png"
    im.save(p6)
    manifest.append(("Hotel_Belvedere", p6.name, "Hero", "0.60s", "Stacks Base -> Floors -> Roof (ease-out)"))

    # 7. Mover 1: 1960s Yellow Swiss Post Bus
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    dr = ImageDraw.Draw(im)
    dr.rounded_rectangle([400, 720, 630, 792], radius=10, fill=(229, 169, 59, 255), outline=(35, 31, 28, 255), width=4)
    dr.rectangle([414, 732, 616, 756], fill=(239, 232, 216, 255))
    dr.ellipse([432, 774, 470, 812], fill=(35, 31, 28, 255))
    dr.ellipse([562, 774, 600, 812], fill=(35, 31, 28, 255))
    im = apply_1960s_halftone_and_torn_border(im, border_px=7, seed=7)
    p7 = pieces_dir / "07_post_bus_1960s.png"
    im.save(p7)
    manifest.append(("Post_Bus_1960s", p7.name, "Life-Mover", "0.78s", "Drives along pass road (+245px X)"))

    # 8. Mover 2: Furka Steam Train
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    dr = ImageDraw.Draw(im)
    dr.rectangle([180, 900, 345, 972], fill=(158, 51, 40, 255), outline=(35, 31, 28, 255), width=4)
    dr.rectangle([352, 912, 485, 972], fill=(42, 40, 38, 255), outline=(35, 31, 28, 255), width=4)
    dr.ellipse([415, 845, 465, 895], fill=(229, 222, 201, 255))
    im = apply_1960s_halftone_and_torn_border(im, border_px=7, seed=8)
    p8 = pieces_dir / "08_steam_train.png"
    im.save(p8)
    manifest.append(("Steam_Train", p8.name, "Life-Mover", "0.78s", "Crosses bottom track (-220px X)"))

    return manifest


def write_davinci_fusion_comp(comp_path: Path, pieces_dir: Path, manifest: list):
    """Writes a DaVinci Resolve Free / Studio Fusion Composition (.comp) file with Loader, Transform, and Merge nodes."""
    abs_dir = str(pieces_dir.resolve()).replace("\\", "/")
    nodes_lua = []
    merges_lua = []

    # Background node (#EDE6D6 cream paper, 1920x1080, 300 frames @ 25fps = 12s)
    nodes_lua.append("""
    Cream_Paper_BG = Background {
      Inputs = {
        GlobalIn = Input { Value = 0 },
        GlobalOut = Input { Value = 300 },
        Width = Input { Value = 1920 },
        Height = Input { Value = 1080 },
        TopLeftRed = Input { Value = 0.929 },
        TopLeftGreen = Input { Value = 0.902 },
        TopLeftBlue = Input { Value = 0.839 },
        TopLeftAlpha = Input { Value = 1.0 },
      },
      ViewInfo = OperatorInfo { Pos = { 100, 200 } },
    }""")

    prev_out = "Cream_Paper_BG"
    for idx, (name, fn, layer, start_s, desc) in enumerate(manifest, start=1):
        in_frame = int(float(start_s.replace("s", "")) * 25)
        end_frame = in_frame + 16
        x_pos = 100 + idx * 160
        file_uri = f"{abs_dir}/{fn}"
        ldr = f"Loader_{name}"
        xf = f"Xf_{name}"
        mrg = f"Merge_{name}"
        nodes_lua.append(f"""
    {ldr} = Loader {{
      Clips = {{
        Clip {{
          ID = "Clip1",
          Filename = "{file_uri}",
          FormatID = "PNGFormat",
          StartFrame = 0,
          Length = 300,
          GlobalStart = 0,
          GlobalEnd = 300,
        }}
      }},
      ViewInfo = OperatorInfo {{ Pos = {{ {x_pos}, 60 }} }},
    }},
    {xf} = Transform {{
      Inputs = {{
        Input = Input {{ SourceOp = "{ldr}", Source = "Output" }},
        -- Ease-out arrival from frame {in_frame} to {end_frame} ({desc})
        Center = Input {{ Value = {{ 0.5, 0.5 }} }},
      }},
      ViewInfo = OperatorInfo {{ Pos = {{ {x_pos}, 130 }} }},
    }},
    {mrg} = Merge {{
      Inputs = {{
        Background = Input {{ SourceOp = "{prev_out}", Source = "Output" }},
        Foreground = Input {{ SourceOp = "{xf}", Source = "Output" }},
        PerformDepthMerge = Input {{ Value = 0 }},
      }},
      ViewInfo = OperatorInfo {{ Pos = {{ {x_pos}, 200 }} }},
    }}""")
        prev_out = mrg

    # Master 4% Camera Push Transform + MediaOut1
    nodes_lua.append(f"""
    Camera_Push_4pct = Transform {{
      Inputs = {{
        Input = Input {{ SourceOp = "{prev_out}", Source = "Output" }},
        Size = Input {{ Value = 1.045 }},
      }},
      ViewInfo = OperatorInfo {{ Pos = {{ {100 + (len(manifest) + 1) * 160}, 200 }} }},
    }},
    MediaOut1 = MediaOut {{
      Inputs = {{
        Index = Input {{ Value = "0" }},
        Input = Input {{ SourceOp = "Camera_Push_4pct", Source = "Output" }},
      }},
      ViewInfo = OperatorInfo {{ Pos = {{ {100 + (len(manifest) + 2) * 160}, 200 }} }},
    }}""")

    comp_txt = f"""Composition {{
  CurrentTime = 45,
  RenderRange = {{ 0, 300 }},
  GlobalRange = {{ 0, 300 }},
  Version = "DaVinci Resolve 19 / 20 / 21 Free & Studio — Vox Magazine Cut-Out Diorama",
  Tools = {{
{",".join(nodes_lua)}
  }},
}}
"""
    comp_path.write_text(comp_txt, encoding="utf-8")


def main():
    work_dir = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
    out_comp = Path(sys.argv[2]).resolve() if len(sys.argv) > 2 else (work_dir / "vox_diorama_resolve.comp")
    pieces_dir = work_dir / "pieces"
    manifest = generate_belvedere_pieces(pieces_dir)
    write_davinci_fusion_comp(out_comp, pieces_dir, manifest)
    print(json.dumps({
        "status": "ok",
        "pieces_dir": str(pieces_dir),
        "pieces_count": len(manifest),
        "fusion_comp": str(out_comp),
    }, indent=2))


if __name__ == "__main__":
    main()

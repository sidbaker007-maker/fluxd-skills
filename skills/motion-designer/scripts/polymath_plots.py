#!/usr/bin/env python3
"""
Polymathic Investigative Director + Vox Collage + 3Blue1Brown Math Asset Engine
1. Dark-mode Matplotlib scientific & geopolitical plots (timeseries, phase, sensitometry, spectrum, barcode, splane).
2. Vox Mixed-Media Cutout & Halftone Sticker Processor (turns any uploaded JPG/PNG into a die-cut paper cutout).
"""
import os
import sys
import json
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from PIL import Image, ImageOps, ImageFilter, ImageDraw, ImageFont

def setup_ax(fig, ax, title="", source="", bg="#0B0B0B", ink="#F2EFE9", muted="#8C8881", grid="#25262B"):
    fig.patch.set_facecolor(bg)
    ax.set_facecolor("#111215")
    for spine in ["top", "right"]:
        ax.spines[spine].set_visible(False)
    for spine in ["bottom", "left"]:
        ax.spines[spine].set_color(grid)
        ax.spines[spine].set_linewidth(1.2)
    ax.tick_params(colors=muted, labelsize=10)
    ax.grid(True, color=grid, linestyle="--", linewidth=0.8, alpha=0.65)
    if title:
        ax.set_title(title, color=ink, fontsize=15, fontweight="bold", loc="left", pad=14)
    if source:
        fig.text(0.06, 0.02, f"SOURCE // {source}", color=muted, fontsize=9, family="monospace")

def render_plot(spec, out_path, pal=None):
    pal = pal or {}
    bg = pal.get("bg", "#0B0B0B")
    ink = pal.get("ink", "#F2EFE9")
    acc1 = spec.get("color", pal.get("accent", "#FF5A1F"))
    acc2 = spec.get("color2", pal.get("accent2", "#2EE6A6"))
    muted = pal.get("muted", "#8C8881")
    kind = spec.get("type", "timeseries").lower()

    if kind == "splane":
        # 3Blue1Brown 3D Complex s-Plane Pole Surface Plot |X(s)|
        fig = plt.figure(figsize=(11.2, 6.6), dpi=140, facecolor="#000000")
        ax = fig.add_subplot(111, projection="3d", facecolor="#000000")
        re = np.linspace(-2.2, 0.8, 90)
        im = np.linspace(-3.8, 3.8, 90)
        R, I = np.meshgrid(re, im)
        S = R + 1j * I
        sigma, wd, w_ext = spec.get("sigma", 0.45), spec.get("wd", 2.2), spec.get("wExt", 1.4)
        denom = ((S + sigma - 1j * wd) * (S + sigma + 1j * wd) * (S - 1j * w_ext) * (S + 1j * w_ext))
        Z = np.clip(2.8 / (np.abs(denom) + 0.35), 0, 5.2)
        ax.plot_surface(R, I, Z, cmap="plasma", alpha=0.88, edgecolor="#58C4DD", linewidth=0.18)
        ax.set_title(spec.get("title", "Laplace Complex s-Plane Pole Surface |X(s)|"), color="#58C4DD", fontsize=14, fontweight="bold", pad=10)
        ax.set_xlabel("Re(s) — Decay σ", color="#F0AC5F", fontsize=10)
        ax.set_ylabel("Im(s) — Frequency ω", color="#83C167", fontsize=10)
        ax.set_zlabel("|X(s)|", color="#F8FAFC", fontsize=10)
        ax.tick_params(colors="#8C8881", labelsize=8)
        ax.xaxis.pane.fill = False
        ax.yaxis.pane.fill = False
        ax.zaxis.pane.fill = False
        ax.view_init(elev=28, azim=-52)
        os.makedirs(os.path.dirname(os.path.abspath(out_path)), exist_ok=True)
        fig.savefig(out_path, facecolor="#000000", dpi=140)
        plt.close(fig)
        return

    fig, ax = plt.subplots(figsize=(11.2, 6.6), dpi=140)
    setup_ax(fig, ax, title=spec.get("title", ""), source=spec.get("source", ""), bg=bg, ink=ink, muted=muted)

    if kind == "phase":
        t = np.linspace(0, 24 * np.pi, 2200)
        x = np.sin(t) * np.exp(-0.012 * t) + 0.35 * np.cos(2.7 * t)
        y = np.cos(t) * np.exp(-0.012 * t) - 0.35 * np.sin(2.7 * t)
        ax.plot(x, y, color=acc2, linewidth=1.6, alpha=0.75, label=spec.get("labelA", "Phase Trajectory"))
        ax.plot(x[-450:], y[-450:], color=acc1, linewidth=2.6, label=spec.get("labelB", "Attractor Basin"))
        ax.scatter([x[-1], x[0]], [y[-1], y[0]], color=[acc1, acc2], s=70, zorder=5)
        ax.set_xlabel(spec.get("xlabel", "State Variable q (Normalized)"), color=muted, fontsize=11)
        ax.set_ylabel(spec.get("ylabel", "Momentum p (dp/dt)"), color=muted, fontsize=11)
        ax.legend(frameon=True, facecolor="#16171B", edgecolor="#2A2B30", labelcolor=ink, fontsize=10)

    elif kind == "sensitometry":
        ev = np.linspace(-5, 5, 300)
        halide = 1.0 / (1.0 + np.exp(-1.15 * (ev - 0.2)))
        digital = np.clip(0.18 * (ev + 2.8), 0.0, 0.98)
        ax.plot(ev, halide, color=acc1, linewidth=3.0, label=spec.get("labelA", "35mm Silver Halide (Log Roll-Off)"))
        ax.plot(ev, digital, color=acc2, linewidth=2.4, linestyle="--", label=spec.get("labelB", "Linear CMOS Sensor (Hard Clip)"))
        ax.axvspan(2.2, 5.0, color=acc1, alpha=0.12, label="Highlight Shoulder (+4.2 Stops)")
        ax.set_xlabel(spec.get("xlabel", "Log Exposure (Stops EV)"), color=muted, fontsize=11)
        ax.set_ylabel(spec.get("ylabel", "Optical Density (D)"), color=muted, fontsize=11)
        ax.legend(frameon=True, facecolor="#16171B", edgecolor="#2A2B30", labelcolor=ink, fontsize=10)

    elif kind == "spectrum":
        freqs = np.linspace(20, 16000, 600)
        env1 = 82 - 14 * np.log10(freqs / 40.0) + 9 * np.exp(-((freqs - 2400) / 700) ** 2)
        env2 = 76 - 18 * np.log10(freqs / 40.0) - 8 * np.exp(-((freqs - 4200) / 900) ** 2)
        ax.plot(freqs, env1, color=acc1, linewidth=2.6, label=spec.get("labelA", "Primary Acoustic Transient"))
        ax.fill_between(freqs, env1, 20, color=acc1, alpha=0.14)
        ax.plot(freqs, env2, color=acc2, linewidth=2.0, label=spec.get("labelB", "Ambient Floor"))
        ax.set_xlabel(spec.get("xlabel", "Frequency (Hz)"), color=muted, fontsize=11)
        ax.set_ylabel(spec.get("ylabel", "Spectral Density (dB)"), color=muted, fontsize=11)
        ax.set_ylim(25, 95)
        ax.legend(frameon=True, facecolor="#16171B", edgecolor="#2A2B30", labelcolor=ink, fontsize=10)

    elif kind == "barcode":
        rng = np.random.default_rng(42)
        n_frames = 180
        asl = 4.2 + 2.8 * np.sin(np.linspace(0, 3.5 * np.pi, n_frames)) + rng.normal(0, 0.55, n_frames)
        x = np.arange(n_frames)
        for i in range(n_frames):
            c = acc1 if asl[i] < 3.2 else (acc2 if asl[i] > 6.0 else "#2D323E")
            ax.axvspan(i, i + 1, ymin=0.0, ymax=0.28, color=c, alpha=0.85)
        ax.plot(x, asl, color=ink, linewidth=2.2, label="Average Shot Length (ASL sec)")
        ax.axhline(np.mean(asl), color=acc1, linestyle="--", linewidth=1.5, label=f"Mean ASL: {np.mean(asl):.1f}s")
        ax.set_xlabel(spec.get("xlabel", "Reel Timecode (Normalized Shots)"), color=muted, fontsize=11)
        ax.set_ylabel(spec.get("ylabel", "Shot Duration (Seconds)"), color=muted, fontsize=11)
        ax.set_ylim(0, 10)
        ax.legend(frameon=True, facecolor="#16171B", edgecolor="#2A2B30", labelcolor=ink, fontsize=10)

    else:
        x = spec.get("x") or list(range(1, 13))
        y1 = spec.get("y") or [14, 18, 19, 23, 28, 31, 29, 38, 46, 54, 68, 84]
        y2 = spec.get("y2")
        ax.plot(x, y1, color=acc1, linewidth=3.0, marker="o", markersize=6, label=spec.get("labelA", "Observed Series"))
        ax.fill_between(range(len(x)) if isinstance(x[0], str) else x, y1, min(y1) * 0.85, color=acc1, alpha=0.14)
        if y2 and len(y2) == len(x):
            ax.plot(x, y2, color=acc2, linewidth=2.4, linestyle="--", marker="s", markersize=5, label=spec.get("labelB", "Baseline Counter-Series"))
        if spec.get("xlabel"):
            ax.set_xlabel(spec["xlabel"], color=muted, fontsize=11)
        if spec.get("ylabel"):
            ax.set_ylabel(spec["ylabel"], color=muted, fontsize=11)
        if y2 or spec.get("labelA"):
            ax.legend(frameon=True, facecolor="#16171B", edgecolor="#2A2B30", labelcolor=ink, fontsize=10)

    plt.tight_layout(rect=[0.02, 0.05, 0.98, 0.96])
    os.makedirs(os.path.dirname(os.path.abspath(out_path)), exist_ok=True)
    fig.savefig(out_path, facecolor=bg, dpi=140)
    plt.close(fig)

def process_cutout(spec, work_dir, out_path):
    """
    Processes a raw .jpg/.png image into a Vox-style archival halftone cutout with a white die-cut sticker border,
    or generates a high-resolution Vox archival collage specimen if no source image exists.
    """
    if isinstance(spec, str):
        spec = {"src": spec if spec != "auto" else ""}
    src_rel = spec.get("src", "")
    src_abs = os.path.join(work_dir, src_rel) if src_rel and not os.path.isabs(src_rel) else src_rel
    keep_color = bool(spec.get("color", False))
    label = spec.get("label", "ARCHIVAL CUTOUT // EXHIBIT A")

    W, H = 960, 640
    canvas = Image.new("RGBA", (W, H), (244, 241, 234, 255))
    draw = ImageDraw.Draw(canvas)

    # Newsprint column background
    for y in range(28, H - 28, 22):
        draw.rectangle([48, y, W - 48, y + 5], fill=(24, 24, 27, 16))
    for x in [48, W // 2, W - 48]:
        draw.line([(x, 20), (x, H - 20)], fill=(214, 209, 196, 255), width=2)

    if src_abs and os.path.exists(src_abs):
        img = Image.open(src_abs).convert("RGBA")
        img.thumbnail((W - 140, H - 140), Image.Resampling.LANCZOS)
        if not keep_color:
            gray = ImageOps.autocontrast(img.convert("L"), cutoff=2)
            sepia = ImageOps.colorize(gray, black="#18181B", mid="#8C8275", white="#F4F1EA").convert("RGBA")
            sepia.putalpha(img.getchannel("A"))
            img = sepia
        # Add crisp white die-cut paper sticker border around alpha or frame
        alpha = img.getchannel("A")
        if alpha.getextrema()[0] < 250:
            border_mask = alpha.filter(ImageFilter.MaxFilter(19))
            sticker = Image.new("RGBA", img.size, (255, 255, 255, 255))
            sticker.putalpha(border_mask)
            sticker.alpha_composite(img)
            img = sticker
        else:
            framed = Image.new("RGBA", (img.width + 28, img.height + 28), (255, 255, 255, 255))
            d_f = ImageDraw.Draw(framed)
            d_f.rectangle([0, 0, framed.width - 1, framed.height - 1], outline=(24, 24, 27, 255), width=4)
            framed.paste(img, (14, 14))
            img = framed
        ox = (W - img.width) // 2
        oy = (H - img.height) // 2
        canvas.alpha_composite(img, (ox, oy))
    else:
        # Synthesize an archival Vox mixed-media collage plate (vintage architecture + halftone sun + torn paper + highlighter)
        draw.ellipse([540, 70, 790, 320], fill=(250, 204, 21, 255), outline=(24, 24, 27, 255), width=4)
        # Halftone dot grid over the upper left
        for gx in range(90, 440, 18):
            for gy in range(80, 280, 18):
                draw.ellipse([gx, gy, gx + 6, gy + 6], fill=(29, 88, 216, 175))
        # Cutout architectural silhouette with white die-cut border
        pts_outer = [(150, 560), (150, 250), (240, 170), (330, 250), (330, 310), (490, 210), (660, 310), (660, 560)]
        draw.polygon(pts_outer, fill=(255, 255, 255, 255), outline=(24, 24, 27, 255))
        pts_inner = [(164, 550), (164, 258), (240, 188), (316, 258), (316, 324), (490, 228), (646, 324), (646, 550)]
        draw.polygon(pts_inner, fill=(24, 24, 27, 255))
        # Windows grid
        for wx in range(185, 295, 28):
            for wy in range(275, 515, 36):
                draw.rectangle([wx, wy, wx + 14, wy + 20], fill=(244, 241, 234, 255))
        for wx in range(355, 620, 38):
            for wy in range(345, 515, 36):
                draw.rectangle([wx, wy, wx + 20, wy + 20], fill=(250, 204, 21, 220))

    # Masking-tape label strip at top-left
    draw.rectangle([56, 36, 430, 84], fill=(250, 204, 21, 255), outline=(24, 24, 27, 255), width=3)
    draw.text((72, 52), label, fill=(24, 24, 27, 255))

    os.makedirs(os.path.dirname(os.path.abspath(out_path)), exist_ok=True)
    canvas.convert("RGB").save(out_path, quality=92)

def main():
    work = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else ".")
    if len(sys.argv) > 2 and os.path.exists(sys.argv[2]):
        # Direct CLI cutout mode: python3 polymath_plots.py <work> <image.jpg> [out.png]
        src_img = os.path.abspath(sys.argv[2])
        out_img = os.path.abspath(sys.argv[3]) if len(sys.argv) > 3 else os.path.join(work, "assets", "cutout-" + os.path.splitext(os.path.basename(src_img))[0] + ".png")
        process_cutout({"src": src_img}, work, out_img)
        print("Created Vox cutout asset:", out_img)
        return

    vfile = os.path.join(work, "video.json")
    if not os.path.exists(vfile):
        return
    with open(vfile, "r", encoding="utf-8") as f:
        v = json.load(f)
    changed = False
    for idx, s in enumerate(v.get("scenes", [])):
        if isinstance(s.get("plot"), dict):
            rel_media = s.get("media") or f"assets/plot-s{idx + 1}.png"
            abs_media = rel_media if os.path.isabs(rel_media) else os.path.join(work, rel_media)
            render_plot(s["plot"], abs_media)
            if not s.get("media"):
                s["media"] = rel_media
                changed = True
        if s.get("cutout"):
            rel_media = s.get("media") or f"assets/cutout-s{idx + 1}.png"
            abs_media = rel_media if os.path.isabs(rel_media) else os.path.join(work, rel_media)
            process_cutout(s["cutout"], work, abs_media)
            if not s.get("media"):
                s["media"] = rel_media
                changed = True
    if changed:
        with open(vfile, "w", encoding="utf-8") as f:
            json.dump(v, f, indent=2)

if __name__ == "__main__":
    main()

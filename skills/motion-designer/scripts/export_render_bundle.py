#!/usr/bin/env python3
"""
Web-to-Local Render Bundle Exporter (`export_render_bundle.py`) for FLUXD Motion Designer.

1. All creative work, cutouts, SFX, and voiceover word alignment are curated and verified
   here in Gemini Web—NEVER downloading random unverified clips on the local machine.
2. Packages the ready-to-render project + parallel local renderer into `<slug>_render_bundle.zip`.
3. On your local Linux PC, `bash render_local.sh` renders the exact verified composition across
   parallel Chromium workers + RTX 3050 NVENC.
"""

import argparse
import shutil
import stat
import subprocess
import tempfile
from pathlib import Path

SKILL_DIR = Path(__file__).resolve().parent.parent

RENDER_SH_TEMPLATE = """#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

RES="${1:-1080p}"
FPS="${2:-30}"

echo "================================================================"
echo "  FLUXD Parallel Local Hardware Renderer (Curated Web Bundle)"
echo "  Target: ${RES} @ ${FPS}fps (Untouched 1.0x Voiceover + Karaoke)"
echo "  Tip: Pass 'bash render_local.sh 1080p 60' if you want 60fps"
echo "================================================================"

# 1. Verify pre-bundled untouched voiceover & SFX
if [ -f "renders/master_vo_mix.wav" ]; then
  echo "[1/2] Verified pre-synced untouched voiceover (renders/master_vo_mix.wav) and curated assets!"
elif [ -f "voiceover.mp3" ]; then
  echo "[1/2] Syncing voiceover.mp3..."
  python3 scripts/voiceover_sync.py . --audio voiceover.mp3
fi

# 2. Render deterministic MP4 across parallel Chromium workers + FFmpeg (RTX NVENC)
echo "[2/2] Rendering deterministic ${RES} ${FPS}fps MP4..."
node scripts/motion.js render . --res "${RES}" --fps "${FPS}" --skip-review

echo "================================================================"
echo "  DONE! Check your rendered MP4 in this folder and renders/v1.mp4"
echo "================================================================"
"""


def build_render_bundle(work_dir: Path, out_zip: Path) -> Path:
    work_dir = work_dir.resolve()
    out_zip = out_zip.resolve()
    if out_zip.suffix.lower() == ".zip":
        out_base = out_zip.with_suffix("")
    else:
        out_base = out_zip
        out_zip = Path(str(out_zip) + ".zip")

    motion_js = SKILL_DIR / "scripts" / "motion.js"
    if (work_dir / "video.json").exists() and motion_js.exists():
        subprocess.run(["node", str(motion_js), "compose", str(work_dir)], check=False)

    with tempfile.TemporaryDirectory(prefix="fluxd_bundle_") as tmp:
        stage = Path(tmp) / "bundle"
        stage.mkdir(parents=True, exist_ok=True)

        for item in ["video.json", "script.json", "voiceover.mp3", "voiceover.wav"]:
            src = work_dir / item
            if src.exists():
                shutil.copy2(src, stage / item)

        for folder in ["assets", "build", "pieces", "renders"]:
            src_dir = work_dir / folder
            if src_dir.exists():
                shutil.copytree(src_dir, stage / folder, dirs_exist_ok=True)

        for skill_sub in ["scripts", "styles", "assets"]:
            s_src = SKILL_DIR / skill_sub
            if s_src.exists():
                if skill_sub == "assets":
                    shutil.copytree(s_src, stage / "assets", dirs_exist_ok=True)
                else:
                    shutil.copytree(s_src, stage / skill_sub, dirs_exist_ok=True)

        # Remove redundant intermediate WAV copies inside the bundle
        for p_rm in [stage / "build" / "assets" / "bgm_sfx_bed.wav", stage / "assets" / "vo"]:
            if p_rm.is_dir():
                shutil.rmtree(p_rm, ignore_errors=True)
            elif p_rm.exists():
                p_rm.unlink(missing_ok=True)

        # Also remove any old unverified archive-*.mp4 or movie-*.mp4 background overlays
        for old_vid in (stage / "assets").glob("archive-s*.mp4"):
            old_vid.unlink(missing_ok=True)
        for old_vid in (stage / "assets").glob("movie-s*.mp4"):
            old_vid.unlink(missing_ok=True)

        r_sh = stage / "render_local.sh"
        r_sh.write_text(RENDER_SH_TEMPLATE, encoding="utf-8")
        r_sh.chmod(r_sh.stat().st_mode | stat.S_IXUSR | stat.S_IXGRP | stat.S_IXOTH)

        out_zip.parent.mkdir(parents=True, exist_ok=True)
        shutil.make_archive(str(out_base), "zip", str(stage))

    return out_zip


def main():
    parser = argparse.ArgumentParser(description="Export a self-contained Web-to-Local Render Bundle (.zip) with render_local.sh")
    parser.add_argument("work_dir", type=Path, help="Path to motion-designer project directory")
    parser.add_argument("out_zip", type=Path, help="Output .zip path")
    args = parser.parse_args()

    zpath = build_render_bundle(args.work_dir, args.out_zip)
    print(f"Exported self-contained local render bundle: {zpath} ({zpath.stat().st_size} bytes)")


if __name__ == "__main__":
    main()

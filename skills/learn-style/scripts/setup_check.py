#!/usr/bin/env python3
"""
setup_check.py - Environment & Dependency Checker for learn-style (PROMPT 1).
Checks Python, ffmpeg, ffprobe, yt-dlp, faster-whisper (with NVIDIA RTX CUDA detection),
opencv-python-headless, and Pillow. Outputs exact install & PATH commands if anything is missing.
"""
import os
import platform
import shutil
import subprocess
import sys
import json


def check_cmd(name, version_arg="--version"):
    path = shutil.which(name)
    if not path:
        return {"installed": False, "path": None, "version": None}
    try:
        p = subprocess.run([path, version_arg], capture_output=True, text=True, timeout=8)
        out = (p.stdout or p.stderr or "").strip().splitlines()
        ver = out[0] if out else "installed"
        return {"installed": True, "path": path, "version": ver[:100]}
    except Exception as e:
        return {"installed": True, "path": path, "version": str(e)}


def check_python_pkg(mod_name, pip_name=None):
    pip_name = pip_name or mod_name
    try:
        m = __import__(mod_name)
        ver = getattr(m, "__version__", "installed")
        return {"installed": True, "package": pip_name, "version": str(ver)}
    except ImportError:
        return {"installed": False, "package": pip_name, "version": None}


def check_cuda_whisper():
    res = {"cuda_available": False, "gpu_name": None, "recommended_device": "cpu", "recommended_compute": "int8"}
    nvidia_smi = shutil.which("nvidia-smi")
    if nvidia_smi:
        try:
            p = subprocess.run(
                [nvidia_smi, "--query-gpu=name,memory.total", "--format=csv,noheader"],
                capture_output=True, text=True, timeout=5
            )
            if p.returncode == 0 and p.stdout.strip():
                res["cuda_available"] = True
                res["gpu_name"] = p.stdout.strip().splitlines()[0]
                res["recommended_device"] = "cuda"
                res["recommended_compute"] = "float16"
        except Exception:
            pass
    return res


def main():
    os_name = platform.system()
    report = {
        "os": os_name,
        "python": sys.version.split()[0],
        "binaries": {
            "ffmpeg": check_cmd("ffmpeg", "-version"),
            "ffprobe": check_cmd("ffprobe", "-version"),
            "yt-dlp": check_cmd("yt-dlp", "--version"),
        },
        "python_packages": {
            "faster_whisper": check_python_pkg("faster_whisper", "faster-whisper"),
            "cv2": check_python_pkg("cv2", "opencv-python-headless"),
            "PIL": check_python_pkg("PIL", "Pillow"),
        },
        "gpu": check_cuda_whisper(),
        "missing_commands": [],
    }

    missing_bins = [k for k, v in report["binaries"].items() if not v["installed"]]
    missing_pkgs = [v["package"] for k, v in report["python_packages"].items() if not v["installed"]]

    if missing_bins:
        if os_name == "Windows":
            if "ffmpeg" in missing_bins or "ffprobe" in missing_bins:
                report["missing_commands"].append("winget install -e --id Gyan.FFmpeg")
            if "yt-dlp" in missing_bins:
                report["missing_commands"].append("winget install -e --id yt-dlp.yt-dlp")
            report["missing_commands"].append(
                'powershell -Command "[Environment]::SetEnvironmentVariable(\'Path\', [Environment]::GetEnvironmentVariable(\'Path\', \'User\') + \';\' + $env:LOCALAPPDATA + \'\\Microsoft\\WinGet\\Links\', \'User\')"'
            )
        elif os_name == "Darwin":
            brew_Targets = []
            if "ffmpeg" in missing_bins or "ffprobe" in missing_bins:
                brew_Targets.append("ffmpeg")
            if "yt-dlp" in missing_bins:
                brew_Targets.append("yt-dlp")
            if brew_Targets:
                report["missing_commands"].append(f"brew install {' '.join(brew_Targets)}")
        else:
            report["missing_commands"].append("sudo apt-get update && sudo apt-get install -y ffmpeg && pip install -U yt-dlp")

    if missing_pkgs:
        report["missing_commands"].append(f"{sys.executable} -m pip install -U {' '.join(missing_pkgs)}")

    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()

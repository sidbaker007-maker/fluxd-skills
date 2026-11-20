#!/usr/bin/env python3
"""core/tts/tts_zh.py — Online Microsoft Neural TTS via edge-tts for Chinese & multilingual voiceover.
Only run after the user explicitly chooses online Chinese voiceover.
"""
import asyncio
import json
import os
import subprocess
import sys
import soundfile as sf

async def synth_all(lines, out_dir, default_voice="zh-CN-XiaoxiaoNeural", rate="+0%", pitch="+0Hz"):
    import edge_tts
    durations = {}
    for item in lines:
        lid = item["id"]
        text = item["text"]
        voice = item.get("voice", default_voice)
        mp3_path = os.path.join(out_dir, f"{lid}.mp3")
        wav_path = os.path.join(out_dir, f"{lid}.wav")
        comm = edge_tts.Communicate(text, voice, rate=item.get("rate", rate), pitch=item.get("pitch", pitch))
        await comm.save(mp3_path)
        subprocess.run(["ffmpeg", "-y", "-i", mp3_path, "-ar", "48000", "-ac", "1", wav_path], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        os.remove(mp3_path)
        data, sr = sf.read(wav_path)
        durations[lid] = round(len(data) / float(sr), 4)
        print(f"[edge-tts] {lid}: {durations[lid]:.2f}s ({voice})")
    with open(os.path.join(out_dir, "durations.json"), "w", encoding="utf-8") as f:
        json.dump(durations, f, indent=2)

def main():
    if len(sys.argv) < 3:
        print("Usage: python3 core/tts/tts_zh.py <lines.json> <out_dir> [--voice zh-CN-XiaoxiaoNeural]")
        sys.exit(1)
    lines_path, out_dir = sys.argv[1], sys.argv[2]
    voice = "zh-CN-XiaoxiaoNeural"
    if "--voice" in sys.argv:
        voice = sys.argv[sys.argv.index("--voice") + 1]
    os.makedirs(out_dir, exist_ok=True)
    with open(lines_path, "r", encoding="utf-8") as f:
        lines = json.load(f)
    asyncio.run(synth_all(lines, out_dir, default_voice=voice))

if __name__ == "__main__":
    main()

#!/usr/bin/env sh
# core/render/mux.sh <video.mp4> <mix.wav> <out.mp4> [fps] [grain]
# Two-pass loudnorm to -14 LUFS / -1.5 dBTP + optional film grain
set -e
VIDEO="$1"
AUDIO="$2"
OUT="$3"
FPS="${4:-24}"
GRAIN="${5:-0}"

if [ -z "$VIDEO" ] || [ -z "$AUDIO" ] || [ -z "$OUT" ]; then
  echo "Usage: sh core/render/mux.sh <video.mp4> <mix.wav> <out.mp4> [fps] [grain]"
  exit 1
fi

mkdir -p "$(dirname "$OUT")"

VF="fps=${FPS}"
if [ "$GRAIN" != "0" ]; then
  VF="${VF},noise=alls=${GRAIN}:allf=t+u"
fi

ffmpeg -y -i "$VIDEO" -i "$AUDIO" \
  -vf "$VF" \
  -af "loudnorm=I=-14:TP=-1.5:LRA=11" \
  -c:v libx264 -preset medium -crf 17 -pix_fmt yuv420p \
  -c:a aac -b:a 192k \
  -movflags +faststart \
  "$OUT"

echo "Muxed (-14 LUFS) -> $OUT"

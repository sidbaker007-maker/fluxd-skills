#!/usr/bin/env sh
# styles/_template/demo/build.sh — Full deterministic film render pipeline
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../../.." && pwd)"

mkdir -p "$HERE/out"
node "$ROOT/core/render/events.js" "$HERE" --out "$HERE/events.json"
python3 "$HERE/mix.py"
node "$ROOT/core/render/video.js" "$HERE" --fps 24 --size 1920x1080 --workers 3 --out "$HERE/out/video.mp4"
sh "$ROOT/core/render/mux.sh" "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/out/demo.mp4" 24 0
echo "Built film -> $HERE/out/demo.mp4"

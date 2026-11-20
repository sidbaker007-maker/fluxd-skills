#!/bin/sh
set -e

HERE=$(cd "$(dirname "$0")" && pwd)
if [ -f "$HERE/../../core/render/video.js" ]; then
  LIB=$(cd "$HERE/../.." && pwd)
elif [ -f "$HERE/../../../../core/render/video.js" ]; then
  LIB=$(cd "$HERE/../../../.." && pwd)
elif [ -f "$HERE/../core/render/video.js" ]; then
  LIB=$(cd "$HERE/.." && pwd)
else
  LIB=${LEMO_OPUSCAR_HOME:-"$HOME/lemo-opuscar"}
fi

cmd=${1:-path}
shift || true

case "$cmd" in
  path)
    echo "LIB=$LIB"
    ;;
  deps)
    cd "$LIB"
    if [ ! -d node_modules ] && command -v npm >/dev/null 2>&1; then
      npm install --no-audit --no-fund || true
    fi
    if [ ! -d .venv ] && command -v python3 >/dev/null 2>&1; then
      python3 -m venv --system-site-packages .venv || true
    fi
    if [ -x .venv/bin/pip ]; then
      .venv/bin/pip install -r requirements.txt || true
      for tier in "$@"; do
        case "$tier" in
          voice) .venv/bin/pip install -r requirements-voice.txt || true ;;
          music) .venv/bin/pip install -r requirements-music.txt || true ;;
        esac
      done
    fi
    echo "LIB=$LIB (tiers: core $*)"
    ;;
  demo)
    slug=$1
    echo "$LIB/styles/$slug/demo"
    ;;
  *)
    echo "Usage: setup.sh [path | deps [voice] [music] | demo <slug>]"
    ;;
esac

#!/bin/sh
set -e
HERE=$(cd "$(dirname "$0")/.." && pwd)
KIND=$1
NAME=$2
BASE_URL="https://github.com/lemomo-ai/lemo-opuscar/releases/download/assets"

case "$KIND" in
  instruments)
    mkdir -p "$HERE/core/audio/instruments"
    for lib in ${NAME:-salamander vsco2ce vcsl freepats karoryfer}; do
      if [ "$lib" = "all" ]; then
        for l in freepats karoryfer salamander vcsl vsco2ce; do
          sh "$0" instruments "$l"
        done
        exit 0
      fi
      echo "Fetching instrument library: $lib -> $HERE/core/audio/instruments/$lib"
      if command -v curl >/dev/null 2>&1; then
        curl -fL "$BASE_URL/instruments-$lib.tar.gz" | tar -xz -C "$HERE/core/audio/instruments" || echo "Offline mode: sampler.py will use procedural fallback for $lib"
      fi
    done
    ;;
  hdri)
    mkdir -p "$HERE/core/three/hdri"
    if command -v curl >/dev/null 2>&1; then
      curl -fL "$BASE_URL/hdri.tar.gz" | tar -xz -C "$HERE/core/three/hdri" || echo "Offline mode: procedural studio environment enabled"
    fi
    ;;
  *)
    echo "Usage: sh tools/fetch.sh [instruments <freepats|karoryfer|salamander|vcsl|vsco2ce|all> | hdri]"
    ;;
esac

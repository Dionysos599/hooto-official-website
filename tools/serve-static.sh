#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "$0")/.." && pwd)"
site_port="${1:-8080}"

cd "$project_root"
if python3 -c 'import PIL' 2>/dev/null; then
  python3 tools/generate-image-derivatives.py
else
  printf '%s\n' 'Warning: Pillow is unavailable; serving original images. Install tools/image-requirements.txt to generate WebP variants.' >&2
fi
node tools/generate-gallery-data.mjs
node tools/generate-gallery-data.mjs --watch &
gallery_watch_pid=$!
trap 'kill "$gallery_watch_pid" 2>/dev/null || true' EXIT INT TERM
python3 -m http.server "$site_port" --bind 127.0.0.1

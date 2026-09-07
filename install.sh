#!/usr/bin/env bash
set -euo pipefail
root=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
target="$HOME/.config/omarchy/themes/silo"
python3 "$root/scripts/download-backgrounds.py"
mkdir -p "$(dirname "$target")"
if [[ -e "$target" || -L "$target" ]]; then
  [[ $(readlink -f "$target") == "$root/theme" ]] || { echo "Refusing to replace existing $target" >&2; exit 1; }
else
  ln -s "$root/theme" "$target"
fi
omarchy theme set silo

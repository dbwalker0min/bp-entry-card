#!/usr/bin/env bash
set -euo pipefail

ha="hassio@ha.home"
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "$script_dir/.." && pwd)"
local_file="$repo_root/src/bp-entry-card.js"
remote_dir="/config/www/bp-entry-card"
remote_tmp="/tmp/bp-entry-card.js"
remote_file="$remote_dir/bp-entry-card.js"

scp -O "$local_file" "$ha:$remote_tmp"
ssh "$ha" "sudo mkdir -p '$remote_dir' && sudo mv '$remote_tmp' '$remote_file' && sudo chmod 644 '$remote_file'"

echo "Deployed to $remote_file"

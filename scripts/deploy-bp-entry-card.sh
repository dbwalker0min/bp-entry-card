#!/usr/bin/env bash
set -euo pipefail

ha="hassio@ha.home"
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "$script_dir/.." && pwd)"
local_src_dir="$repo_root/src"
remote_dir="/config/www/bp-entry-card"
remote_tmp_dir="/tmp/bp-entry-card-src"

scp -O -r "$local_src_dir" "$ha:$remote_tmp_dir"
ssh "$ha" "sudo rm -rf '$remote_dir' && sudo mkdir -p '$remote_dir' && sudo cp -a '$remote_tmp_dir/.' '$remote_dir/' && sudo chmod -R a+rX '$remote_dir' && sudo rm -rf '$remote_tmp_dir'"

echo "Deployed all files from $local_src_dir to $remote_dir"

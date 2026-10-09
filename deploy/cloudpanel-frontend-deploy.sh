#!/usr/bin/env bash
set -Eeuo pipefail
umask 027

revision="${1:-}"
archive="${2:-}"
live_dir="${CEYPETCO_FRONTEND_ROOT:-$HOME/htdocs/ceypetco.gov.lk}"
deploy_dir="$HOME/ceypetco-deployments"

if [[ ! "$revision" =~ ^[0-9a-f]{40}$ ]]; then
  echo "Invalid Git revision" >&2
  exit 1
fi
if [[ ! -f "$archive" ]]; then
  echo "Deployment archive was not found" >&2
  exit 1
fi
if [[ ! -d "$live_dir" ]]; then
  echo "Frontend root does not exist: $live_dir" >&2
  exit 1
fi

mkdir -p "$deploy_dir/backups"
stage_dir="$(mktemp -d "$deploy_dir/.stage-${revision}.XXXXXX")"
trap 'rm -rf -- "$stage_dir"' EXIT
tar -xzf "$archive" -C "$stage_dir"

test -s "$stage_dir/index.html"
test -d "$stage_dir/assets"

backup="$deploy_dir/backups/frontend-$(date -u +%Y%m%dT%H%M%SZ)-${revision}.tar.gz"
managed=(assets images documents index.html favicon.svg .htaccess)
existing=()
for entry in "${managed[@]}"; do
  [[ -e "$live_dir/$entry" ]] && existing+=("$entry")
done
if ((${#existing[@]})); then
  tar -C "$live_dir" -czf "$backup" "${existing[@]}"
fi

# Synchronize only Vite-owned paths. CloudPanel files such as .well-known and
# unrelated site files are deliberately left untouched.
for directory in assets images documents; do
  if [[ -d "$stage_dir/$directory" ]]; then
    mkdir -p "$live_dir/$directory"
    rsync -a --delete -- "$stage_dir/$directory/" "$live_dir/$directory/"
  fi
done
for file in favicon.svg .htaccess; do
  [[ -f "$stage_dir/$file" ]] && install -m 0644 "$stage_dir/$file" "$live_dir/$file"
done

# Publish index.html last so it never references assets that are not present.
install -m 0644 "$stage_dir/index.html" "$live_dir/index.html"
printf '%s\n' "$revision" > "$live_dir/.ceypetco-frontend-revision"
rm -f -- "$archive"
echo "Frontend deployed: $revision"
echo "Rollback archive: $backup"


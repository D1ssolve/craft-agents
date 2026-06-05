#!/usr/bin/env bash
set -euo pipefail

# sync-dotnet-skills.sh — синхронизирует skills из dotnet/skills submodule в skills/

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VENDOR_DIR="$REPO_ROOT/vendor/dotnet-skills"
SKILLS_DIR="$REPO_ROOT/skills"

DRY_RUN=false
FORCE=false
FILTER_PLUGIN=""

# Parse args
while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --force)
      FORCE=true
      shift
      ;;
    --plugin)
      FILTER_PLUGIN="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1" >&2
      echo "Usage: $0 [--dry-run] [--force] [--plugin <plugin-name>]" >&2
      exit 1
      ;;
  esac
done

if [[ ! -d "$VENDOR_DIR" ]]; then
  echo "ERROR: vendor/dotnet-skills not found. Run: git submodule update --init" >&2
  exit 1
fi

added=0
updated=0
skipped=0
conflicts=0

process_skill() {
  local plugin="$1"
  local skill_name="$2"
  local source_dir="$VENDOR_DIR/plugins/$plugin/skills/$skill_name"
  local target_name="$skill_name"
  local target_dir="$SKILLS_DIR/$target_name"
  local marker_file="$target_dir/.dotnet-source"
  local action=""

  # Check if target exists
  if [[ -d "$target_dir" ]]; then
    if [[ -f "$marker_file" ]]; then
      # Existing dotnet skill — update
      action="update"
    elif [[ "$FORCE" == true ]]; then
      # Local skill but force override
      action="update"
    else
      # Local skill without marker — conflict, use dotnet- prefix
      target_name="dotnet-$skill_name"
      target_dir="$SKILLS_DIR/$target_name"
      marker_file="$target_dir/.dotnet-source"
      if [[ -d "$target_dir" ]]; then
        if [[ -f "$marker_file" ]]; then
          action="update"
        else
          echo "  CONFLICT: both '$skill_name' and 'dotnet-$skill_name' exist locally. Skipping."
          ((conflicts++)) || true
          return
        fi
      else
        action="add"
      fi
    fi
  else
    action="add"
  fi

  if [[ "$DRY_RUN" == true ]]; then
    echo "  [$action] $plugin/$skill_name → skills/$target_name"
    case "$action" in
      add) ((added++)) || true ;;
      update) ((updated++)) || true ;;
    esac
    return
  fi

  # Ensure target dir exists
  mkdir -p "$target_dir"

  # Copy SKILL.md, filtering out unsupported frontmatter keys
  sed -E '/^(license|user-invocable):/d' "$source_dir/SKILL.md" > "$target_dir/SKILL.md"

  # Copy references/ if exists
  if [[ -d "$source_dir/references" ]]; then
    rm -rf "$target_dir/references"
    cp -r "$source_dir/references" "$target_dir/references"
  else
    # Clean up references if source no longer has them
    if [[ -d "$target_dir/references" ]]; then
      rm -rf "$target_dir/references"
    fi
  fi

  # Create/update marker
  cat > "$marker_file" <<EOF
plugin: $plugin
source: $skill_name
synced: $(date -u +%Y-%m-%dT%H:%M:%SZ)
EOF

  echo "  [$action] $plugin/$skill_name → skills/$target_name"
  case "$action" in
    add) ((added++)) || true ;;
    update) ((updated++)) || true ;;
  esac
}

echo "=== Syncing dotnet/skills ==="
echo "Vendor: $VENDOR_DIR"
echo ""

# Iterate plugins
for plugin_dir in "$VENDOR_DIR"/plugins/*; do
  [[ -d "$plugin_dir" ]] || continue
  plugin="$(basename "$plugin_dir")"

  if [[ -n "$FILTER_PLUGIN" && "$plugin" != "$FILTER_PLUGIN" ]]; then
    continue
  fi

  skills_base="$plugin_dir/skills"
  [[ -d "$skills_base" ]] || continue

  echo "Plugin: $plugin"
  for skill_dir in "$skills_base"/*; do
    [[ -d "$skill_dir" ]] || continue
    skill_name="$(basename "$skill_dir")"
    [[ -f "$skill_dir/SKILL.md" ]] || continue
    process_skill "$plugin" "$skill_name"
  done
  echo ""
done

echo "=== Summary ==="
echo "Added:   $added"
echo "Updated: $updated"
echo "Skipped: $skipped"
echo "Conflicts: $conflicts"

if [[ "$DRY_RUN" == true ]]; then
  echo ""
  echo "(dry-run mode — no files were modified)"
fi

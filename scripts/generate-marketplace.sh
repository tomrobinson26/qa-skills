#!/usr/bin/env bash
# Generates .claude-plugin/marketplace.json from SKILL.md frontmatter.
#
# Usage:
#   bash scripts/generate-marketplace.sh           # update file
#   bash scripts/generate-marketplace.sh --check   # exit 1 if file is stale
#
# Requires: jq  (macOS: brew install jq  |  Ubuntu: apt install jq)

set -euo pipefail

CHECK=false
while [[ $# -gt 0 ]]; do
    case "$1" in
        --check) CHECK=true; shift ;;
        *) echo "Unknown argument: $1" >&2; exit 1 ;;
    esac
done

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MARKETPLACE="$REPO_ROOT/.claude-plugin/marketplace.json"
SKILLS_ROOT="$REPO_ROOT/skills"

if [[ ! -f "$MARKETPLACE" ]]; then
    echo "ERROR: marketplace.json not found at: $MARKETPLACE" >&2
    exit 1
fi

if ! command -v jq &>/dev/null; then
    echo "ERROR: jq is required. Install with: brew install jq (macOS) or apt install jq (Ubuntu)" >&2
    exit 1
fi

# ---------------------------------------------------------------------------
# Frontmatter parsers
# ---------------------------------------------------------------------------

fm_name() {
    awk -v dq='"' -v sq="'" '
        { gsub(/\r$/, "") }
        /^---/ { if (++fence == 2) exit; next }
        fence != 1 { next }
        /^name:/ {
            val = $0; sub(/^name:[[:space:]]*/, "", val)
            if (substr(val,1,1)==dq && substr(val,length(val),1)==dq) val=substr(val,2,length(val)-2)
            else if (substr(val,1,1)==sq && substr(val,length(val),1)==sq) val=substr(val,2,length(val)-2)
            print val; exit
        }
    ' "$1"
}

fm_version() {
    awk -v dq='"' '
        { gsub(/\r$/, "") }
        /^---/ { if (++fence == 2) exit; next }
        fence != 1 { next }
        /^[[:space:]]+version:/ {
            sub(/^[[:space:]]+version:[[:space:]]*/, "")
            gsub(/^"/, ""); gsub(/"$/, "")
            print; exit
        }
    ' "$1"
}

# Handles inline (bare/single-quoted/double-quoted) and folded block (>) descriptions.
fm_description() {
    awk -v dq='"' -v sq="'" '
        { gsub(/\r$/, "") }
        /^---/ { if (++fence == 2) { if (in_block && desc != "") print desc; exit }; next }
        fence != 1 { next }
        in_block && /^[[:space:]]/ {
            line = $0; gsub(/^[[:space:]]+/, "", line); gsub(/[[:space:]]+$/, "", line)
            if (line != "") desc = (desc != "" ? desc " " : "") line
            next
        }
        in_block && /^[[:space:]]*$/ { next }
        in_block { if (desc != "") print desc; exit }
        /^description:[[:space:]]*>[[:space:]]*$/ { in_block = 1; desc = ""; next }
        /^description:/ {
            val = $0; sub(/^description:[[:space:]]*/, "", val)
            if (substr(val,1,1)==dq && substr(val,length(val),1)==dq) val=substr(val,2,length(val)-2)
            else if (substr(val,1,1)==sq && substr(val,length(val),1)==sq) val=substr(val,2,length(val)-2)
            print val; exit
        }
    ' "$1"
}

first_sentence() {
    local text="$1"
    local before_dot="${text%%.*}"
    # Dot found within first 160 chars
    if [[ ${#before_dot} -lt ${#text} && ${#before_dot} -lt 160 ]]; then
        echo "${before_dot}."
    elif [[ ${#text} -le 160 ]]; then
        echo "$text"
    else
        local cut="${text:0:160}"
        local trimmed="${cut% *}"
        echo "${trimmed:-$cut}"
    fi
}

# ---------------------------------------------------------------------------
# Scan skills
# ---------------------------------------------------------------------------

plugins_json="[]"

for skill_dir in "$SKILLS_ROOT"/*/; do
    [[ -d "$skill_dir" ]] || continue
    skill_file="${skill_dir}SKILL.md"
    [[ -f "$skill_file" ]] || continue

    skill_folder="$(basename "$skill_dir")"
    name="$(fm_name "$skill_file")"
    [[ -z "$name" ]] && continue

    raw_desc="$(fm_description "$skill_file")"
    version="$(fm_version "$skill_file")"
    [[ -z "$version" ]] && version="1.0.0"

    prev="$(jq --arg n "$name" '.plugins[] | select(.name == $n)' "$MARKETPLACE" 2>/dev/null || true)"

    if [[ -n "$prev" ]]; then
        prev_desc="$(printf '%s' "$prev" | jq -r '.description // ""')"
        prev_keywords="$(printf '%s' "$prev" | jq -c '.keywords // []')"
        prev_strict="$(printf '%s' "$prev" | jq '.strict // false')"
    else
        prev_desc=""
        prev_keywords="[]"
        prev_strict="false"
    fi

    if [[ -n "$prev_desc" ]]; then
        desc="$prev_desc"
    elif [[ -n "$raw_desc" ]]; then
        desc="$(first_sentence "$raw_desc")"
    else
        desc=""
    fi

    plugin="$(jq -n \
        --arg  name     "$name" \
        --arg  desc     "$desc" \
        --arg  folder   "$skill_folder" \
        --arg  version  "$version" \
        --argjson strict   "$prev_strict" \
        --argjson keywords "$prev_keywords" \
        '{name: $name, description: $desc, source: ("./skills/" + $folder), strict: $strict, version: $version, keywords: $keywords}')"

    plugins_json="$(printf '%s' "$plugins_json" | jq --argjson p "$plugin" '. + [$p]')"
done

# ---------------------------------------------------------------------------
# Build output (preserve top-level name/owner/metadata)
# ---------------------------------------------------------------------------

new_json="$(jq --argjson plugins "$plugins_json" '.plugins = $plugins' "$MARKETPLACE")"

if $CHECK; then
    current_formatted="$(jq '.' "$MARKETPLACE")"
    new_formatted="$(printf '%s' "$new_json" | jq '.')"
    if [[ "$current_formatted" != "$new_formatted" ]]; then
        echo "ERROR: .claude-plugin/marketplace.json is out of date." >&2
        echo "Run 'bash scripts/generate-marketplace.sh' to update it." >&2
        exit 1
    fi
    echo "marketplace.json is up to date. ($(printf '%s' "$plugins_json" | jq 'length') plugins)"
    exit 0
fi

printf '%s\n' "$new_json" > "$MARKETPLACE"
echo "Updated marketplace.json with $(printf '%s' "$plugins_json" | jq 'length') plugins."

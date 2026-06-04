#!/usr/bin/env bash
# Packages a skill directory into a <skill-name>.skill archive.
#
# Usage:
#   bash scripts/package-skill.sh <skill-dir> [output-dir]
#
# Requires: zip  (built-in on macOS  |  Ubuntu: apt install zip)

set -euo pipefail

SKILL_PATH="${1:?Usage: package-skill.sh <skill-dir> [output-dir]}"
OUTPUT_DIR="${2:-$(pwd)}"

if [[ ! -d "$SKILL_PATH" ]]; then
    echo "ERROR: '$SKILL_PATH' is not a directory." >&2
    exit 1
fi

if ! command -v zip &>/dev/null; then
    echo "ERROR: zip is required. Install with: apt install zip (Ubuntu) — built-in on macOS." >&2
    exit 1
fi

SKILL_DIR="$(cd "$SKILL_PATH" && pwd)"
SKILL_NAME="$(basename "$SKILL_DIR")"
OUTPUT_FILE="$OUTPUT_DIR/$SKILL_NAME.skill"

TEMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TEMP_DIR"' EXIT

TEMP_COPY="$TEMP_DIR/src"
mkdir "$TEMP_COPY"
cp -r "$SKILL_DIR/." "$TEMP_COPY/"
rm -f "$TEMP_COPY/.distribute"

ARCHIVE="$TEMP_DIR/archive.zip"
# Pipe filenames via stdin so entries use forward slashes and no leading ./
(cd "$TEMP_COPY" && find . -type f | sed 's|^\./||' | zip -q "$ARCHIVE" -@)

mv "$ARCHIVE" "$OUTPUT_FILE"
echo "Packaged '$SKILL_NAME' -> $OUTPUT_FILE"

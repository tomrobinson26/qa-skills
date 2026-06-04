"""
QA Test Script CSV Validator
Bundled resource for the qa-test-script-generator skill.

Usage:
    python scripts/validate_csv.py <path-to-csv>

Exits 0 on success, 1 on validation failure.
"""

import csv
import re
import sys

REQUIRED_HEADERS = ["Case", "Preconditions", "Steps (text)", "Expected", "Folder"]
VALID_FOLDERS = {"CMS", "Frontend"}
HTML_TAG_RE = re.compile(r"<[^>]+>")
SMART_QUOTE_RE = re.compile(r"[\u201c\u201d\u2018\u2019]")


def validate(filepath: str) -> list[str]:
    errors = []

    with open(filepath, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)

        # Header check
        if reader.fieldnames != REQUIRED_HEADERS:
            errors.append(f"Header mismatch. Got: {reader.fieldnames}")

        rows = list(reader)

    if not rows:
        errors.append("CSV contains no data rows.")
        return errors

    seen_cases: dict[str, int] = {}

    for i, row in enumerate(rows, start=2):  # row 1 is the header
        case = row.get("Case", "").strip()
        folder = row.get("Folder", "").strip()

        # Required fields populated
        for col in REQUIRED_HEADERS:
            if not row.get(col, "").strip():
                errors.append(f"Row {i}: Empty required field '{col}' (Case: '{case}')")

        # Folder enum
        if folder not in VALID_FOLDERS:
            errors.append(f"Row {i}: Invalid Folder value '{folder}' (Case: '{case}')")

        # HTML tags
        for col in REQUIRED_HEADERS:
            if HTML_TAG_RE.search(row.get(col, "")):
                errors.append(f"Row {i}: HTML tag found in '{col}' (Case: '{case}')")

        # Smart quotes
        for col in REQUIRED_HEADERS:
            if SMART_QUOTE_RE.search(row.get(col, "")):
                errors.append(f"Row {i}: Smart quote found in '{col}' (Case: '{case}')")

        # Duplicate case names
        if case in seen_cases:
            errors.append(
                f"Row {i}: Duplicate Case name '{case}' "
                f"(first seen at row {seen_cases[case]})"
            )
        else:
            seen_cases[case] = i

    return errors


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python scripts/validate_csv.py <path-to-csv>")
        sys.exit(2)

    found = validate(sys.argv[1])

    if found:
        print(f"VALIDATION FAILED — {len(found)} error(s):")
        for e in found:
            print(f"  • {e}")
        sys.exit(1)
    else:
        # Re-open just to get row count for the success message
        with open(sys.argv[1], newline="", encoding="utf-8") as f:
            row_count = sum(1 for _ in csv.DictReader(f))
        print(f"VALIDATION PASSED — {row_count} test cases, no issues found.")
        sys.exit(0)

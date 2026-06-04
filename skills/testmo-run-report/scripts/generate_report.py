#!/usr/bin/env python3
"""
Generate a stakeholder-friendly report from a Testmo test run CSV export.

The input CSV has one row per result per test. Most tests have a single row,
but tests that have been re-run will have multiple rows ordered by 'Created at'.

Rules:
  - Current status  = most recent row for that Test ID (by Created at, tiebreak Result ID)
  - Previous status = second-most-recent row, if any; otherwise '-'
  - Rows with no Result ID represent the default "Untested" baseline (test has never
    been executed). These are treated as a single row and current status = 'Untested'.
  - Comments and Issues are shown from the MOST RECENT result row only.

Output formats:
  md   - markdown tables (good for Confluence, GitHub)
  html - self-contained HTML with inline CSS, printable to PDF
  both - writes both

Usage:
  python generate_report.py <input.csv> [-o <output>] [--title "..."]
                              [--format md|html|both]
                              [--jira-base-url https://yourorg.atlassian.net]
                              [--since DAYS]
"""

from __future__ import annotations

import argparse
import html
import re
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

import pandas as pd


# ---------- configuration ---------------------------------------------------

STATUS_ORDER = ["Failed", "Blocked", "Retest", "Untested", "Skipped", "Passed"]
STATUS_ICON = {
    "Passed":   "✅",
    "Failed":   "❌",
    "Blocked":  "⛔",
    "Retest":   "🔁",
    "Skipped":  "⏭️",
    "Untested": "⚪",
}


# ---------- helpers ---------------------------------------------------------

def strip_html(text: str | float | None) -> str:
    """Testmo comments are HTML fragments. Flatten to plain text for markdown."""
    if text is None or (isinstance(text, float) and pd.isna(text)):
        return ""
    s = str(text)
    # common block-level tags become newlines
    s = re.sub(r"</(p|div|li|br)\s*>", "\n", s, flags=re.I)
    s = re.sub(r"<(br|br/)\s*>", "\n", s, flags=re.I)
    s = re.sub(r"<li[^>]*>", "- ", s, flags=re.I)
    s = re.sub(r"<[^>]+>", "", s)                 # drop remaining tags
    s = html.unescape(s)
    s = re.sub(r"\n\s*\n+", "\n", s).strip()
    return s


def format_issues(value) -> str:
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return ""
    # Testmo exports them comma-separated, sometimes with trailing whitespace
    parts = [p.strip() for p in str(value).split(",") if p.strip()]
    return ", ".join(parts)


def md_escape(text: str) -> str:
    """Escape the few markdown chars that wreck table cells."""
    return text.replace("|", "\\|").replace("\n", "<br>")


def status_cell(status) -> str:
    status_str = str(status) if status is not None else "Untested"
    icon = STATUS_ICON.get(status_str, "")
    return f"{icon} {status_str}".strip()


# ---------- core ------------------------------------------------------------

def build_report_data(csv_path: Path, since_days: int | None = None) -> dict:
    """Parse the CSV into a normalised structure both renderers consume.

    since_days: if set, the status-changes section only includes tests whose
                current result was logged within the last N days. None = no
                filter (every mover appears).
    """
    df = pd.read_csv(csv_path)

    required = {"Case ID", "Test ID", "Test", "Status", "Folder", "Created at"}
    missing = required - set(df.columns)
    if missing:
        raise SystemExit(f"CSV is missing expected columns: {sorted(missing)}")

    # Parse created timestamp; rows with no Result ID may have no Created at
    df["_created"] = pd.to_datetime(df["Created at"], errors="coerce", utc=True)

    # Sort so .tail(1) gives us the current result, tail(2).head(1) gives previous.
    # Tiebreak on Result ID in case two rows share a timestamp.
    df = df.sort_values(
        ["Test ID", "_created", "Result ID"],
        na_position="first",
    )

    def norm_status(value) -> str:
        """Map a raw Status cell to a clean string. NaN/empty → 'Untested'."""
        if value is None or (isinstance(value, float) and pd.isna(value)):
            return "Untested"
        s = str(value).strip()
        return s if s else "Untested"

    tests = []
    for test_id, group in df.groupby("Test ID", sort=False):
        rows = group.to_dict("records")
        current = rows[-1]
        previous = rows[-2] if len(rows) > 1 else None

        # When the current status was logged — used by --since filter and display.
        # pandas Timestamp → native datetime so callers can compare with timedelta.
        changed_at = current.get("_created")
        if pd.isna(changed_at):
            changed_at = None
        else:
            changed_at = changed_at.to_pydatetime()

        # Normalise statuses up front. Previous is None when there's no prior row.
        # If the prior row's status matches current (or both were NaN → both
        # Untested), we drop previous_status back to None — there's no meaningful
        # "change" to report and it would just be visual noise in both renderers.
        current_status = norm_status(current["Status"])
        previous_status = None
        if previous is not None:
            prev_norm = norm_status(previous["Status"])
            if prev_norm != current_status:
                previous_status = prev_norm

        tests.append({
            "case_id":         current["Case ID"],
            "test_id":         test_id,
            "name":            current["Test"],
            "folder":          current.get("Folder") or "Uncategorised",
            "priority":        current.get("Priority") or "",
            "automation":      current.get("Automation") or "",
            "current_status":  current_status,
            "previous_status": previous_status,
            "changed_at":      changed_at,
            "comment":         strip_html(current.get("Comment")),
            "issues":          format_issues(current.get("Issues")),
            "result_id":       current.get("Result ID"),
            "history_count":   len(rows),
        })

    # Summary
    total = len(tests)
    counts = {s: 0 for s in STATUS_ORDER}
    for t in tests:
        counts[t["current_status"]] = counts.get(t["current_status"], 0) + 1
    changed = sum(
        1 for t in tests
        if t["previous_status"] and t["previous_status"] != t["current_status"]
    )
    with_issues = sum(1 for t in tests if t["issues"])
    executed = total - counts.get("Untested", 0)
    pass_fail_pool = counts.get("Passed", 0) + counts.get("Failed", 0)
    pass_rate = (counts.get("Passed", 0) / pass_fail_pool * 100) if pass_fail_pool else None

    # Group tests by folder, preserving first-seen order
    folders: dict[str, list[dict]] = {}
    for t in tests:
        folders.setdefault(t["folder"], []).append(t)

    # Per-folder status counts — used by HTML header pills and by
    # smart-collapse (folders with only Untested default closed)
    folder_summary = {}
    for folder, items in folders.items():
        fc = {}
        for t in items:
            fc[t["current_status"]] = fc.get(t["current_status"], 0) + 1
        only_untested = list(fc.keys()) == ["Untested"]
        folder_summary[folder] = {"counts": fc, "only_untested": only_untested}

    # All tests whose current status differs from previous
    all_movers = [
        t for t in tests
        if t["previous_status"] and t["previous_status"] != t["current_status"]
    ]

    # Apply --since window if requested. None means show all.
    cutoff = None
    hidden_movers = 0
    if since_days is not None and since_days > 0:
        cutoff = datetime.now(timezone.utc) - timedelta(days=since_days)
        kept = []
        for m in all_movers:
            # No timestamp → conservatively include (we don't want to silently drop
            # changes because pandas couldn't parse a date).
            if m["changed_at"] is None or m["changed_at"] >= cutoff:
                kept.append(m)
            else:
                hidden_movers += 1
        movers = kept
    else:
        movers = all_movers

    return {
        "tests": tests,
        "folders": folders,
        "folder_summary": folder_summary,
        "totals": {
            "total": total,
            "executed": executed,
            "pass_rate": pass_rate,
            "counts": counts,
            "changed": changed,
            "with_issues": with_issues,
        },
        "movers": movers,
        "movers_meta": {
            "since_days": since_days,
            "cutoff": cutoff,
            "hidden": hidden_movers,
            "total_all_time": len(all_movers),
        },
    }


def render_markdown(data: dict, csv_path: Path, title: str | None,
                    jira_base_url: str | None = None) -> str:
    tests = data["tests"]
    totals = data["totals"]
    movers = data["movers"]
    folders = data["folders"]

    total = totals["total"]
    executed = totals["executed"]
    counts = totals["counts"]
    pass_rate = totals["pass_rate"]
    changed = totals["changed"]
    with_issues = totals["with_issues"]

    # ---- header ---------------------------------------------------------
    heading = title or f"Test run report — {csv_path.stem}"
    out = [f"# {heading}", ""]
    out.append(f"_Source: `{csv_path.name}` · {total} tests · {executed} executed_")
    out.append("")

    # ---- summary table --------------------------------------------------
    out.append("## Summary")
    out.append("")
    out.append("| Metric | Value |")
    out.append("| --- | --- |")
    out.append(f"| Total tests | {total} |")
    out.append(f"| Executed | {executed} |")
    if pass_rate is not None:
        out.append(f"| Pass rate (of pass/fail outcomes) | {pass_rate:.1f}% |")
    for s in STATUS_ORDER:
        if counts.get(s, 0):
            out.append(f"| {status_cell(s)} | {counts[s]} |")
    out.append(f"| Status changed vs previous run | {changed} |")
    out.append(f"| Tests with linked issues | {with_issues} |")
    out.append("")

    # ---- status changes section ----------------------------------------
    movers_meta = data.get("movers_meta", {})
    if movers or movers_meta.get("since_days"):
        since_days = movers_meta.get("since_days")
        hidden = movers_meta.get("hidden", 0)

        if since_days:
            out.append(f"## Status changes (last {since_days} days)")
        else:
            out.append("## Status changes")
        out.append("")

        if since_days and hidden:
            out.append(
                f"_{hidden} earlier change{'s' if hidden != 1 else ''} "
                f"outside the window not shown._"
            )
            out.append("")

        if not movers:
            out.append("_No status changes in this window._")
            out.append("")
        else:
            out.append("| Test | Folder | Previous | Current |")
            out.append("| --- | --- | --- | --- |")
            for t in movers:
                out.append(
                    f"| {md_escape(t['name'])} "
                    f"| {md_escape(t['folder'])} "
                    f"| {status_cell(t['previous_status'])} "
                    f"| {status_cell(t['current_status'])} |"
                )
        out.append("")

    # ---- results by folder ---------------------------------------------
    out.append("## Results by folder")
    out.append("")
    for folder, items in folders.items():
        out.append(f"### {folder}")
        out.append("")
        out.append("| Test | Current | Previous | Issues | Comment |")
        out.append("| --- | --- | --- | --- | --- |")
        for t in items:
            prev = status_cell(t["previous_status"]) if t["previous_status"] else "—"
            issues_md = md_issue_links(t["issues"], jira_base_url) or "—"
            out.append(
                f"| {md_escape(t['name'])} "
                f"| {status_cell(t['current_status'])} "
                f"| {prev} "
                f"| {issues_md} "
                f"| {md_escape(t['comment']) or '—'} |"
            )
        out.append("")

    return "\n".join(out).rstrip() + "\n"


def md_issue_links(issues_str: str, jira_base_url: str | None) -> str:
    """Render comma-separated issue keys as markdown links if a base URL is set."""
    if not issues_str:
        return ""
    keys = [k.strip() for k in issues_str.split(",") if k.strip()]
    if not jira_base_url:
        return md_escape(", ".join(keys))
    base = jira_base_url.rstrip("/")
    return ", ".join(f"[{k}]({base}/browse/{k})" for k in keys)


# ---------- HTML renderer ---------------------------------------------------

HTML_STATUS_CLASS = {
    "Passed":   "st-passed",
    "Failed":   "st-failed",
    "Blocked":  "st-blocked",
    "Retest":   "st-retest",
    "Skipped":  "st-skipped",
    "Untested": "st-untested",
}

HTML_STYLES = """
:root {
  --bg: #ffffff;
  --bg-muted: #f6f5f0;
  --bg-elev: #ffffff;
  --text: #1f1f1c;
  --text-muted: #5f5e5a;
  --text-dim: #888780;
  --border: rgba(31,31,28,0.12);
  --border-strong: rgba(31,31,28,0.24);
  --accent: #378add;
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: var(--bg); color: var(--text); font-family: var(--font-sans); line-height: 1.55; -webkit-font-smoothing: antialiased; }
.page { max-width: 960px; margin: 0 auto; padding: 2.5rem 2rem 4rem; }
h1 { font-size: 24px; font-weight: 500; margin: 0 0 4px; letter-spacing: -0.01em; }
h2 { font-size: 17px; font-weight: 500; margin: 2rem 0 0.75rem; letter-spacing: -0.005em; }
h3 { font-size: 15px; font-weight: 500; margin: 0; }
.source { font-size: 13px; color: var(--text-muted); margin: 0 0 2rem; }
.metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; margin-bottom: 1.5rem; }
.metric { background: var(--bg-muted); border-radius: 8px; padding: 14px 16px; }
.metric-label { font-size: 12px; color: var(--text-muted); margin: 0 0 4px; text-transform: none; }
.metric-value { font-size: 24px; font-weight: 500; margin: 0; }
.metric-value.m-passed { color: #27500A; }
.metric-value.m-failed { color: #791F1F; }
.metric-value.m-blocked { color: #633806; }
.metric-value.m-untested { color: #444441; }
.changes { background: var(--bg-muted); border-radius: 12px; padding: 14px 18px; margin-bottom: 1rem; }
.changes-note { font-size: 13px; color: var(--text-muted); margin: 0 0 10px; font-style: italic; }
.changes-empty { font-size: 13px; color: var(--text-muted); margin: 0; text-align: center; padding: 6px 0; }
.changes-row { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 8px 0; font-size: 14px; }
.changes-row + .changes-row { border-top: 0.5px solid var(--border); }
.changes-name { flex: 1; min-width: 0; }
.changes-name .folder-tag { color: var(--text-muted); font-size: 12px; display: block; margin-top: 2px; }
.changes-status { display: flex; align-items: center; gap: 6px; white-space: nowrap; }
.changes-status .arrow { color: var(--text-dim); }
.folder { background: var(--bg-elev); border: 0.5px solid var(--border); border-radius: 12px; margin-bottom: 10px; overflow: hidden; }
.folder summary { list-style: none; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; gap: 12px; }
.folder summary::-webkit-details-marker { display: none; }
.folder summary:hover { background: var(--bg-muted); }
.folder-head-left { display: flex; align-items: center; gap: 8px; min-width: 0; flex: 1; }
.chev { width: 10px; height: 10px; flex: 0 0 10px; transition: transform .15s; color: var(--text-dim); }
.folder[open] .chev { transform: rotate(90deg); }
.folder-name { font-size: 15px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.folder-stats { display: flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end; }
.folder-body { border-top: 0.5px solid var(--border); }
.test { padding: 12px 16px; }
.test + .test { border-top: 0.5px solid var(--border); }
.test-name { font-size: 14px; margin: 0 0 6px; font-weight: 400; }
.test-meta { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.test-body { font-size: 13px; color: var(--text-muted); margin-top: 6px; line-height: 1.5; }
.test-issues { display: inline-flex; flex-wrap: wrap; gap: 4px; margin-right: 6px; vertical-align: middle; }
.issue-link { font-family: var(--font-mono); font-size: 12px; background: var(--bg-muted); color: var(--text); padding: 2px 7px; border-radius: 6px; text-decoration: none; border: 0.5px solid var(--border); }
.issue-link:hover { border-color: var(--border-strong); }
.pill { display: inline-flex; align-items: center; font-size: 12px; padding: 2px 9px; border-radius: 999px; font-weight: 500; white-space: nowrap; line-height: 1.5; }
.pill.sm { font-size: 11px; padding: 1px 7px; }
.st-passed   { background: #EAF3DE; color: #27500A; }
.st-failed   { background: #FCEBEB; color: #791F1F; }
.st-blocked  { background: #FAEEDA; color: #633806; }
.st-retest   { background: #E6F1FB; color: #0C447C; }
.st-untested { background: #F1EFE8; color: #444441; }
.st-skipped  { background: #F1EFE8; color: #444441; }
.prev-label { font-size: 12px; color: var(--text-dim); }
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #1a1a18;
    --bg-muted: #252522;
    --bg-elev: #1f1f1d;
    --text: #e8e7e0;
    --text-muted: #b4b2a9;
    --text-dim: #888780;
    --border: rgba(255,255,255,0.10);
    --border-strong: rgba(255,255,255,0.22);
  }
  .metric-value.m-passed { color: #C0DD97; }
  .metric-value.m-failed { color: #F7C1C1; }
  .metric-value.m-blocked { color: #FAC775; }
  .metric-value.m-untested { color: #D3D1C7; }
  .st-passed   { background: #173404; color: #C0DD97; }
  .st-failed   { background: #501313; color: #F7C1C1; }
  .st-blocked  { background: #412402; color: #FAC775; }
  .st-retest   { background: #042C53; color: #B5D4F4; }
  .st-untested { background: #2C2C2A; color: #D3D1C7; }
  .st-skipped  { background: #2C2C2A; color: #D3D1C7; }
}
@media print {
  :root { --bg: #fff; --bg-muted: #f6f5f0; --bg-elev: #fff; --text: #1f1f1c; --text-muted: #5f5e5a; --text-dim: #888780; --border: rgba(0,0,0,0.15); }
  .page { max-width: none; padding: 1.5cm; }
  .folder { break-inside: avoid; page-break-inside: avoid; }
  .test { break-inside: avoid; page-break-inside: avoid; }
  details.folder { display: block; }
  details.folder > summary { list-style: none; }
  details.folder[open] > .folder-body,
  details.folder > .folder-body { display: block !important; }
  .chev { display: none; }
  a.issue-link { color: inherit; text-decoration: none; }
  .changes { break-inside: avoid; }
}
"""


def html_pill(status, small: bool = False) -> str:
    status_str = str(status) if status is not None else "Untested"
    cls = HTML_STATUS_CLASS.get(status_str, "st-untested")
    size = " sm" if small else ""
    return f'<span class="pill{size} {cls}">{html.escape(status_str)}</span>'


def html_issue_links(issues_str: str, jira_base_url: str | None) -> str:
    if not issues_str:
        return ""
    keys = [k.strip() for k in issues_str.split(",") if k.strip()]
    base = (jira_base_url or "").rstrip("/")
    links = []
    for k in keys:
        if base:
            links.append(
                f'<a class="issue-link" href="{html.escape(base)}/browse/{html.escape(k)}" '
                f'target="_blank" rel="noopener">{html.escape(k)}</a>'
            )
        else:
            links.append(f'<span class="issue-link">{html.escape(k)}</span>')
    return f'<span class="test-issues">{"".join(links)}</span>'


def render_html(data: dict, csv_path: Path, title: str | None,
                jira_base_url: str | None = None) -> str:
    totals = data["totals"]
    folders = data["folders"]
    folder_summary = data["folder_summary"]
    movers = data["movers"]

    total = totals["total"]
    executed = totals["executed"]
    counts = totals["counts"]
    pass_rate = totals["pass_rate"]
    changed = totals["changed"]
    with_issues = totals["with_issues"]

    heading = title or f"Test run report — {csv_path.stem}"
    page_title = html.escape(heading)

    # Top metric cards — always show total + per-status that are non-zero
    metric_cards = [
        f'<div class="metric"><p class="metric-label">Total tests</p>'
        f'<p class="metric-value">{total}</p></div>',
        f'<div class="metric"><p class="metric-label">Executed</p>'
        f'<p class="metric-value">{executed}</p></div>',
    ]
    if pass_rate is not None:
        metric_cards.append(
            f'<div class="metric"><p class="metric-label">Pass rate</p>'
            f'<p class="metric-value">{pass_rate:.0f}%</p></div>'
        )
    metric_colour = {"Passed": "m-passed", "Failed": "m-failed",
                     "Blocked": "m-blocked", "Untested": "m-untested"}
    for s in STATUS_ORDER:
        n = counts.get(s, 0)
        if not n:
            continue
        cls = metric_colour.get(s, "")
        metric_cards.append(
            f'<div class="metric"><p class="metric-label">{html.escape(s)}</p>'
            f'<p class="metric-value {cls}">{n}</p></div>'
        )
    metric_cards.append(
        f'<div class="metric"><p class="metric-label">With issues</p>'
        f'<p class="metric-value">{with_issues}</p></div>'
    )

    # Status changes block
    changes_html = ""
    movers_meta = data.get("movers_meta", {}) or {}
    since_days = movers_meta.get("since_days")
    hidden = movers_meta.get("hidden", 0)

    if movers or since_days:
        rows = []
        for t in movers:
            rows.append(
                f'<div class="changes-row">'
                f'<div class="changes-name">{html.escape(t["name"])}'
                f'<span class="folder-tag">{html.escape(t["folder"])}</span></div>'
                f'<div class="changes-status">'
                f'{html_pill(t["previous_status"], small=True)}'
                f'<span class="arrow">→</span>'
                f'{html_pill(t["current_status"], small=True)}'
                f'</div></div>'
            )

        heading_text = (
            f"Status changes <span style=\"font-size:13px;color:var(--text-muted);"
            f"font-weight:400;\">last {since_days} day{'s' if since_days != 1 else ''}"
            f"{' · ' + str(len(movers)) if movers else ''}</span>"
            if since_days
            else f"Status changes <span style=\"font-size:13px;color:var(--text-muted);"
                 f"font-weight:400;\">{len(movers)}</span>"
        )

        body_parts = []
        if since_days and hidden:
            body_parts.append(
                f'<p class="changes-note">{hidden} earlier '
                f'change{"s" if hidden != 1 else ""} outside the window not shown.</p>'
            )
        if rows:
            body_parts.append(f'<div class="changes">{"".join(rows)}</div>')
        else:
            body_parts.append(
                '<div class="changes"><p class="changes-empty">'
                'No status changes in this window.</p></div>'
            )

        changes_html = f"<h2>{heading_text}</h2>{''.join(body_parts)}"

    # Folder sections — <details> handles collapsing natively and prints expanded
    folder_blocks = []
    for folder, items in folders.items():
        fs = folder_summary[folder]
        # Smart default: open if folder has any results, closed if only Untested
        open_attr = "" if fs["only_untested"] else " open"

        # Folder header stats: count per status pill
        stats_pills = []
        for s in STATUS_ORDER:
            n = fs["counts"].get(s, 0)
            if n:
                stats_pills.append(
                    f'<span class="pill sm {HTML_STATUS_CLASS.get(s,"st-untested")}">'
                    f'{n} {html.escape(s.lower())}</span>'
                )

        test_rows = []
        for t in items:
            meta_bits = [html_pill(t["current_status"])]
            if t["previous_status"]:
                meta_bits.append(
                    f'<span class="prev-label">previous:</span>'
                    f'{html_pill(t["previous_status"], small=True)}'
                )
            else:
                meta_bits.append('<span class="prev-label">previous: —</span>')

            body_parts = []
            issues = html_issue_links(t["issues"], jira_base_url)
            if issues:
                body_parts.append(issues)
            if t["comment"]:
                body_parts.append(html.escape(t["comment"]).replace("\n", "<br>"))
            body_html = (
                f'<div class="test-body">{"".join(body_parts)}</div>'
                if body_parts else ""
            )

            test_rows.append(
                f'<div class="test">'
                f'<p class="test-name">{html.escape(t["name"])}</p>'
                f'<div class="test-meta">{"".join(meta_bits)}</div>'
                f'{body_html}'
                f'</div>'
            )

        folder_blocks.append(
            f'<details class="folder"{open_attr}>'
            f'<summary>'
            f'<div class="folder-head-left">'
            f'<svg class="chev" viewBox="0 0 10 10" aria-hidden="true">'
            f'<path d="M2 1 L7 5 L2 9" fill="none" stroke="currentColor" stroke-width="1.5"/>'
            f'</svg>'
            f'<h3 class="folder-name">{html.escape(folder)}</h3>'
            f'</div>'
            f'<div class="folder-stats">{"".join(stats_pills)}</div>'
            f'</summary>'
            f'<div class="folder-body">{"".join(test_rows)}</div>'
            f'</details>'
        )

    doc = f"""<!DOCTYPE html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{page_title}</title>
  <style>{HTML_STYLES}</style>
</head>
<body>
<main class="page">
  <header>
    <h1>{page_title}</h1>
    <p class="source">Source: <code>{html.escape(csv_path.name)}</code> · {total} tests · {executed} executed</p>
  </header>
  <section class="metrics">{"".join(metric_cards)}</section>
  {changes_html}
  <h2>Results by folder</h2>
  {"".join(folder_blocks)}
</main>
</body>
</html>
"""
    return doc


# ---------- cli -------------------------------------------------------------

def main() -> int:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("csv", type=Path, help="Testmo run CSV export")
    p.add_argument("-o", "--output", type=Path,
                   help="Output file path. Extension may be overridden by --format.")
    p.add_argument("--title", default=None,
                   help="Report heading (defaults to CSV stem)")
    p.add_argument("--format", choices=["md", "html", "both"], default="html",
                   help="Output format (default: html)")
    p.add_argument("--jira-base-url", default=None,
                   help="Base URL for Jira issue links, e.g. https://yourorg.atlassian.net")
    p.add_argument("--since", type=int, default=None, metavar="DAYS",
                   help="Only include status changes from the last N days "
                        "(based on the 'Created at' of the current result). "
                        "Default: show all changes regardless of age.")
    args = p.parse_args()

    if not args.csv.exists():
        print(f"Not found: {args.csv}", file=sys.stderr)
        return 1

    if args.since is not None and args.since < 1:
        print("--since must be a positive integer (days)", file=sys.stderr)
        return 1

    data = build_report_data(args.csv, since_days=args.since)

    def out_for(ext: str) -> Path:
        if args.output and args.format != "both":
            # User gave an explicit path; trust it (optionally fix extension)
            if args.output.suffix.lower() == f".{ext}":
                return args.output
            return args.output.with_suffix(f".{ext}")
        base = (args.output.with_suffix("") if args.output
                else args.csv.with_name(f"{args.csv.stem}-report"))
        return base.with_suffix(f".{ext}")

    written = []
    if args.format in ("md", "both"):
        path = out_for("md")
        path.write_text(
            render_markdown(data, args.csv, args.title, args.jira_base_url),
            encoding="utf-8",
        )
        written.append(path)
    if args.format in ("html", "both"):
        path = out_for("html")
        path.write_text(
            render_html(data, args.csv, args.title, args.jira_base_url),
            encoding="utf-8",
        )
        written.append(path)

    for path in written:
        print(f"Wrote {path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

---
name: testmo-run-report
description: "Convert a Testmo test run CSV export into a stakeholder-friendly report (HTML by default, markdown also supported) showing each test's current and previous status, comments, and linked issues. Use this skill whenever the user uploads a Testmo export (filenames typically starting with 'testmo-export-run-') or asks to turn a test run into a report, summary, digest, or status document for downstream automation agents. Also trigger on phrases like 'test run report', 'testmo report', 'results breakdown', 'summarise this test run', or when the user wants to compare current results against previous results from the same export. Output includes summary metrics, a status-changes block, and per-folder result cards — no Given/When/Then content."
---

# Testmo run report

Turns a Testmo CSV run export into a concise report suitable for circulating to
stakeholders (PMs, leads, clients). It extracts each test's latest result, its previous
result if one exists in the file, plus any comment and linked issues — but never the
test steps (Given/When/Then).

Default output is a self-contained HTML file (inline CSS, no assets, print-to-PDF
ready). Markdown output is also available for Confluence/GitHub use.

## When to use this

- User uploads a file matching `testmo-export-run-*.csv` or mentions a Testmo export.
- User asks for a "test run report", "status report", "stakeholder summary" from test results.
- User wants a human-readable breakdown of pass/fail/blocked counts with supporting context.

## The input

Testmo's "Export run" produces a CSV with one row per result per test. Key columns this
skill relies on:

- `Case ID`, `Test ID`, `Test` — identity and name
- `Result ID` — present on actual result rows; absent on the default "Untested" baseline row
- `Status` — one of `Passed`, `Failed`, `Blocked`, `Retest`, `Skipped`, `Untested`
- `Folder` — the Testmo folder the test lives in (used for grouping)
- `Created at` — timestamp on each result row; used to order history
- `Comment` — HTML fragment written by the tester against the latest result
- `Issues` — comma-separated list of linked issue keys (e.g. `SYN-122,SYN-123`)

The same `Test ID` can appear on multiple rows when a test has been re-run. The skill
sorts them by `Created at` (with `Result ID` as a tiebreak) so the last row is the
**current** status and the second-to-last is the **previous** status. For tests with
only one row, previous status is shown as `—`.

## How to run it

The script is at `scripts/generate_report.py`. It needs `pandas` (already available in
the sandbox). Basic invocation:

```bash
python /path/to/skill/scripts/generate_report.py <input.csv>
```

This writes `<stem>-report.html` next to the input. Flags:

- `-o PATH` — custom output path. Extension is auto-corrected to match `--format`.
- `--title "..."` — override the report heading (defaults to the CSV filename stem).
- `--format md|html|both` — output format. Default is `html`.
- `--jira-base-url URL` — e.g. `https://yourorg.atlassian.net`. When set, every issue
  key in the report becomes a link to `{URL}/browse/{KEY}`. Works in both HTML and
  markdown output. Omit to render plain text/styled pills without links.
- `--since DAYS` — only include tests in the Status changes section whose current
  result was logged in the last N days. Useful for stand-up / sprint reviews
  ("what moved this fortnight?"). The filter applies **only** to the Status changes
  section — the per-folder results section always shows everything. When tests are
  hidden by the window, a small note says how many. Default: show all changes.

Example for the typical sandbox flow, where the CSV is in uploads and the report
should be saved where the user can download it:

```bash
python /path/to/skill/scripts/generate_report.py \
  /mnt/user-data/uploads/testmo-export-run-1178.csv \
  -o /mnt/user-data/outputs/test-run-1178-report \
  --format both \
  --jira-base-url https://twentysix.atlassian.net \
  --title "Test run 1178 — stakeholder report"
```

After running, call `present_files` on the outputs so the user can view/download them.

## Report structure

Both formats share the same sections:

1. **Heading + source line** — filename and test count.
2. **Summary metrics** — total tests, executed count, pass rate (over pass/fail
   outcomes only, not over all executed — Blocked tests haven't had their shot yet),
   counts per status, tests with linked issues.
3. **Status changes** — only included if the file contains re-runs. Lists every test
   whose current status differs from its previous one, with previous → current pills.
4. **Results by folder** — one card per folder with a header showing per-status
   counts. Each test inside shows name, current status pill, previous status (or —),
   linked issues, and comment.

HTML-specific behaviour:

- Folders use a `<details>` element. Folders with any Passed/Failed/Blocked/Retest
  results open by default; folders where every test is still Untested are collapsed.
  This keeps the interesting folders visible first.
- `@media print` forces every folder open and drops the chevrons, so "Print to PDF"
  gives a complete, clean document regardless of which folders were clicked open.
- Colours respect `prefers-color-scheme` — dark mode is automatic.
- Self-contained: no external fonts, no JS, no CDN dependencies. Safe to email.

## Notes and edge cases

- The `Comment` field in Testmo is HTML. The script strips tags and collapses
  whitespace so the text renders cleanly. In HTML output, comment text is
  HTML-escaped before being inserted (no XSS risk from tester-authored content).
- Rows with no `Result ID` are treated as the untested baseline. If a test has both
  untested-baseline rows and actual result rows, the result rows dominate — the
  baseline is never treated as "previous" because it represents the absence of a
  result.
- Test step columns (`Steps (Step)`, `Steps (Expected)`, `Steps (Status)`,
  `Steps (Note)`, `Steps (text)`) are deliberately ignored — stakeholders shouldn't
  wade through the Given/When/Then.
- `Issues (case)` is distinct from `Issues`; the skill uses `Issues` (result-level
  links) because that's what testers attach at execution time.
- British English throughout (folder labels come from Testmo as-authored; the skill
  doesn't rewrite them).
- Jira linking is lexical — the skill takes whatever keys are in the `Issues` column
  (e.g. `SYN-122`) and appends them to the base URL. It doesn't validate that the
  issues exist.

## What this skill does not do

- It doesn't cross-reference issue keys against Jira to pull in issue titles or
  statuses. If that's wanted, combine this with the Atlassian MCP tools in a
  follow-up step.
- It doesn't produce DOCX output directly. Use "Print to PDF" on the HTML for a
  paginated deliverable; for DOCX, render the markdown through the `docx` skill.
- It doesn't compare two separate CSV exports against each other. The "previous
  status" logic only works within a single CSV that contains result history.


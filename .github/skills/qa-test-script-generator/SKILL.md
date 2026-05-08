---
name: qa-test-script-generator
description: >
  Generates structured QA test scripts in CSV format from functional requirements, following the Given/When/Then format.
  Use this skill whenever the user asks to generate test cases, write a test script, create QA scripts, or script a feature for testing.
  Also triggers when the user provides requirements (e.g. a spec, user story, or description of a feature) and asks for coverage,
  test cases, or a test plan — even if they don't say "skill". This skill handles both CMS and Frontend testing across
  web features, producing output ready for import into test management tools.
metadata:
  author: Tom Robinson - tom.robinson@msqdx.com
  version: "1.0.1"
---

# QA Test Script Generator

Generates detailed, structured QA test cases in CSV format from functional requirements. Follows a Given/When/Then format consistent with the project's existing test library. Covers both CMS configuration and Frontend behaviour.

---

## Workflow Overview

1. **Parse the requirements** — read all provided inputs (spec, designs, guidance files, example scripts).
2. **Ask clarifying questions** — grouped by priority. Never ask simple questions upfront; just create TBC-prefixed cases for those.
3. **Generate the CSV** — single file, all tests, grouped by Folder (CMS / Frontend).
4. **Output as a file artifact** — downloadable `.csv`.

---

## Step 1: Parse Requirements

Before generating anything, review all provided context:

- Functional requirements (spec doc, user stories, design notes)
- Example test scripts — reuse these as templates wherever possible (see `references/` below)
- Guidance file — use the scripting questions as a checklist for CMS features
- Exclusion file — **never** generate any test matching those cases

### Bundled reference files

| File | Purpose |
|---|---|
| `references/e1-listing-page.csv` | Frontend filter, search, map and state-management patterns |
| `references/e2-membership-journey.csv` | Multi-step authenticated journey and modal interaction patterns |
| `references/e3-cms-blocks-library.csv` | Large CMS block library — WYSIWYG, field types, block placement |
| `references/e4-cms-blocks-extended.csv` | Extended CMS block patterns including image, link, and content area variants |
| `references/guidance-scripting-questions.md` | Checklist of questions to work through when scripting CMS features |
| `references/do-not-include.csv` | Tests that must **never** be generated — check every case name against this list |

Load only the reference files relevant to the current feature. For CMS-heavy work load `e3` and `e4` plus the guidance file. For frontend filter/search/map work load `e1`. For journey or flow-based features load `e2`.

Always check whether the inputs include:
- A description of CMS fields (text, rich text, image, link, toggle, dropdown, etc.)
- Frontend behaviours (filters, search, maps, cards, pagination, navigation)
- State management scenarios (deep links, reload, back navigation, incognito)
- Locale or multi-site considerations
- Accessibility requirements **specific to the feature** (only include if explicitly stated)

---

## Step 2: Clarifying Questions Protocol

Before generating output, assess whether any requirements are ambiguous or missing.

### Grouping rules

**Blocking** — Cannot generate the test without this information.
**Medium Priority** — Affects test depth or accuracy; include impacted tests as TBC.
**Low Priority** — Nice to have; do not block output for these. Generate the test as best you can.

### Presentation format

Present questions in clearly labelled groups. Always end with a copy-paste-friendly numbered form the user can fill in:

```
Please fill in answers below:

1. [Blocking] [Your question here]
   Answer:

2. [Medium] [Your question here]
   Answer:

3. [Low] [Your question here]
   Answer:
```

### What NOT to ask upfront

Do not ask the user about:
- Standard CMS field behaviour (mandatory/optional, boundary content) — just include those tests
- Whether to test hover states on CTAs — always include them
- Whether to test negative/boundary scenarios — always include them
- Browser compatibility, accessibility tools (WAVE, Lighthouse), design checks — these are **excluded by default**

### TBC prefix

If a question is Low Priority or Medium Priority, go ahead and generate the test with a `TBC - ` prefix in the Case field. Example: `TBC - Filter persistence on reload (confirm URL structure)`

---

## Step 3: Test Case Generation Rules

### Coverage requirements

For every feature, generate test cases across these dimensions where applicable:

**CMS Tests:**
- Create / publish page or block
- Delete / restore page or block
- Each field type — see Field Type Rules below
- Toggles (default state, true, false)
- Dropdowns (each option, negative)
- Block placement (allowed content areas, disallowed areas)
- Auto-update or scheduled job behaviour (if applicable)

**Frontend Tests:**
- Initial state / page load
- All user interactions (clicks, selections, inputs, dropdowns)
- State management (URL update, reload persistence, deep links, back navigation)
- Search behaviour (if applicable) — see Search Checklist below
- Filter behaviour (if applicable) — see Filter Checklist below
- Map behaviour (if applicable)
- Card content and fallbacks
- Results count display
- No-results state
- Pagination (if applicable)
- Mobile / tablet responsiveness (tap targets, layout changes)
- Keyboard navigation (only if explicitly required by feature spec)

### Field Type Rules

**String / text fields:**
- Normal (populated + published)
- Boundary content (large amount of text)
- Negative (field empty, mandatory)
- Negative (field empty, optional — confirms no validation, graceful fallback)

**Rich Text / WYSIWYG fields:**
Check against the Guidance file's WYSIWYG questions. Include cases for each formatting type the field supports (bold, italic, underline, bullet lists, numbered lists, headers, hyperlinks, images, tables, etc.). Create one test per formatting type. Also include: Boundary content, Negative (if mandatory).

**Image fields:**
- JPEG
- PNG
- Small image
- Boundary (very large image)
- Negative (empty field — mandatory or optional behaviour)
- Alt text (CMS field available)
- Focal point
- Focal point > Resize feature (check at multiple breakpoints)

**Link / CTA fields:**
- Internal link
- External link
- Open in new tab
- Hover state
- Negative — link populated, text missing
- Negative — text populated, link missing
- Negative — both empty (if mandatory)

**Toggles:**
- Default state (confirm default value)
- Set to true (confirm frontend behaviour)
- Set to false (confirm frontend behaviour)

**Dropdown / select fields:**
- View all options (confirm available options match spec)
- Select each option (publish and confirm)
- Negative (no selection, if mandatory)

**Integer fields:**
- Valid integer
- Update to new value
- Alpha characters (confirm rejection)
- Negative integer (confirm rejection)
- Special characters (confirm rejection)
- Empty / default behaviour

### Search Checklist (Frontend)

If the feature includes search:
- Empty search (returns all results?)
- Keyword search — partial match
- Keyword search — full match
- Fuzzy / misspelled search
- Breaking search (e.g. HTML injection attempt)
- No results state (with CMS-editable "no results" text)
- Results count display
- Results order (alphabetical, latest, relevance — per spec)
- Search + filter combination
- Search term retained when filters change
- Filter retained when search changes
- Pagination with search active
- URL persists on reload with search applied
- Click result → back button → search state restored

### Filter Checklist (Frontend)

If the feature includes filters:
- Single filter selection
- Multiple filter selection (AND logic)
- Filter option alphabetical order
- Clearing a single filter
- Clearing all filters
- Filter persistence on page reload (URL query string)
- Deep link with pre-applied filters
- URL updates on filter change
- Listings update on filter change
- Map updates on filter change (if applicable)
- Filter + pagination interaction
- No results state

---

## Step 4: Ordering and Grouping

Sort test cases in logical execution order — the order a manual tester would naturally follow:

1. CMS: Create / configure the feature
2. CMS: Field-level tests (required fields first, optional second)
3. CMS: Publish / validate
4. Frontend: Initial page load / default state
5. Frontend: Core interactions
6. Frontend: Edge cases (boundary, no results, errors)
7. Frontend: State management (reload, deep link, back navigation)
8. Frontend: Responsive / device-specific
9. Frontend: Accessibility (only if required by spec)

---

## Step 5: Output Format

### CSV columns

```
Case, Preconditions, Steps (text), Expected, Folder
```

- **Case**: Test case name only. No "CMS" or "Frontend" prefix in the name. Group is conveyed by the Folder column.
- **Preconditions**: Given... statement(s). Multiple conditions separated by newlines.
- **Steps (text)**: When... statement(s). Steps separated by newlines with "And" continuation.
- **Expected**: Then... statement(s). Multiple outcomes separated by newlines with "And" continuation.
- **Folder**: Either `CMS` or `Frontend`. Use these exact values.

### CSV formatting rules

- All fields that contain commas, line breaks, or double quotes **must** be enclosed in double quotes.
- A double-quote character within a field must be escaped as `""`.
- Replace any `"smart quotes"` from source requirements with `'straight single quotes'`.
- Do not use HTML tags in any field — plain text only.
- Each row is one test case.
- No empty rows between tests.
- First row is the header row.

### Example row (well-formed)

```csv
"Filter dropdown interaction","Given I am on the Listing page","When I click on a filter dropdown","Then the + icon should smoothly transition to a - icon and the filter options should be revealed","Frontend"
```

---

## Exclusions (Always Apply)

Never generate test cases matching any of the following categories. These mirror the `do not include these tests.csv` exclusion list:

- **WAVE / Lighthouse** — accessibility audit tool runs
- **Skip to content** — keyboard skip link
- **Headings** — HTML heading structure inspection
- **Font size / Font style** — OS-level font changes
- **Keyboard > Tab / Focus / Select / Arrows / Spacebar / Esc** — generic keyboard navigation (unless the feature spec explicitly calls for it)
- **Image alt text > CMS / Display** — generic alt text tests
- **Zoom to 200% / 400%** — browser zoom tests
- **High-contrast enabled / content** — OS high contrast mode
- **ARIA labels** — DOM ARIA inspection
- **Expandable elements / Dynamic Content / Interactable elements without text / Groups of controls / Invisible text** — ARIA attribute checks
- **Design breakpoints / Exploratory breakpoints / Boundary breakpoints / Resize browser** — generic responsive tests
- **Chrome > Windows / Edge > Windows / Firefox > Windows / Chrome > Mac / Firefox > Mac / Safari > Mac** — browser compatibility
- **iPhone / iPad / Samsung** — device-specific browser tests
- **Design check > Large desktop / Desktop / Mobile / Tablet** — visual design comparison tests

---

## Reuse Guidance

Whenever a test case in the example library matches what you need to generate, reuse the structure verbatim or with minimal adaptation. Prefer reuse over invention. Key patterns to reuse:

- Filter interaction patterns → `references/e1-listing-page.csv`
- Multi-step journey / login / modal flows → `references/e2-membership-journey.csv`
- CMS field patterns (Block Title, Page Title, Rich Text, CTA Link, Image > JPEG, Heading > Negative) → `references/e3-cms-blocks-library.csv`
- Extended CMS patterns (content areas, links, image variants, helper text) → `references/e4-cms-blocks-extended.csv`

When reusing, adapt the `Preconditions` and `Case` name to the current feature context, but keep the `Steps` and `Expected` structure consistent.

---

## Final Output Checklist

Before presenting the CSV, verify:

- [ ] All CMS fields covered (mandatory + optional + boundary)
- [ ] All Frontend interactions covered
- [ ] No excluded tests present
- [ ] No assumptions made beyond requirements (or clearly flagged as TBC)
- [ ] CSV is syntactically valid (commas, quotes, line breaks handled correctly)
- [ ] Cases are in logical execution order
- [ ] Folder column values are exactly `CMS` or `Frontend`
- [ ] No HTML tags in any field
- [ ] File is output as a downloadable `.csv` artifact

---

## Step 6: Programmatic CSV Validation

**Run this step before presenting the file.** Execute the bundled validation script against the generated CSV. If any assertion fails, fix the CSV and re-run until all checks pass. Only present the file to the user once validation is clean.

### How to run it

The validator lives at `scripts/validate_csv.py` within this skill. Copy it to `/tmp/` and run it against the output file:

```bash
cp <skill-dir>/scripts/validate_csv.py /tmp/validate_csv.py
python /tmp/validate_csv.py /mnt/user-data/outputs/<filename>.csv
```

If the script exits with code 1, read the error list, correct the CSV in place, and re-run until exit code is 0.

### What it checks

| Check | Rule |
|---|---|
| Header columns | Must be exactly `Case, Preconditions, Steps (text), Expected, Folder` in order |
| No empty rows | At least one data row must be present |
| Required fields populated | All five columns must be non-empty for every row |
| Folder values | Must be exactly `CMS` or `Frontend` — no other values accepted |
| No HTML tags | Any `<tag>` pattern in any field is a failure |
| No smart quotes | Unicode curly quotes (`"`, `"`, `'`, `'`) must not appear in any field |
| No duplicate case names | Each `Case` value must be unique across the file |

### On failure

Fix each reported error directly in the CSV before re-running. Common fixes:

- **Empty field** — populate the missing column or remove the row if it was generated in error
- **Invalid Folder** — correct to exactly `CMS` or `Frontend`
- **HTML tag** — strip the tag and rewrite in plain text
- **Smart quote** — replace with a straight single quote `'`
- **Duplicate case name** — make each case name uniquely descriptive

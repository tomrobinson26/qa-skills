---
name: screen-reader-testing-v2
description: 'Conduct comprehensive screen reader testing for website features. Use when validating accessibility, verifying screen reader compatibility, dismissing cookie banners, running axe-core CLI, and producing strict ranked findings tables with evidence gates.'
argument-hint: 'Feature URL or selector to test'
metadata:
  author: Tom Robinson - tom.robinson@msqdx.com
  version: "1.0.1"
---

# Screen Reader Testing (Enhanced with Verification Methodology)

Screen reader testing validates that interactive features work correctly with assistive technologies. This skill guides you through a structured testing workflow that captures visible rendering, accessibility tree content, detects live regions, and generates a comparison report **backed by evidence from multiple sources**.

## Critical Lesson: Don't Trust a Single Tool

⚠️ **Root cause of false positives**: Relying on one tool (accessibility tree snapshot) without visual verification leads to incorrect findings.

**Example false positive:**
```
Accessibility tree shows: generic "1" + text "of 62"
→ Incorrectly concluded: "Current page not marked"
→ Visual screenshot shows: Clearly displayed "1 of 62"
→ Actual result: Current page IS marked
```

**Best Practice**: Triangulate evidence across THREE sources before making any claim:
1. **Visual**: What users actually see (screenshot)
2. **Tree**: Accessibility tree representation
3. **HTML**: Actual source code and ARIA attributes

## When to Use

- **Accessibility validation**: Verify a feature is perceivable to screen reader users
- **Live region testing**: Ensure dynamic content updates announce correctly
- **Pre-release QA**: Test before feature ships to production
- **Bug reproduction**: Diagnose why a screen reader user reported issues
- **Regression detection**: Ensure accessibility hasn't regressed after code changes
- **Finding verification**: Confirm suspected accessibility issues have evidence from multiple sources

## Required Tools

- **Playwright** (via MCP or CLI): Screenshot capture, accessibility snapshots, DOM inspection, cookie banner handling
- **axe-core CLI**: Accessibility violation detection (automated scanning from the command line)
- **Visual verification**: Screenshots to confirm claims
- **Direct DOM inspection**: `page.evaluate()` to read actual HTML
- **Browser DevTools**: Manual verification and debugging

## Non-Negotiable Rules

- **Always dismiss cookie banners before baseline capture**. If a banner cannot be dismissed, explicitly report the blocker and continue only after documenting impact.
- **Use axe CLI only** for automated scanning. Do not inject axe scripts into the page.
- **Report findings in the strict ranked table format** in the "Required Findings Table" section.

## Bundled Resources

- Cookie handling playbook: [cookie-banner-handling](./references/cookie-banner-handling.md)
- Evidence gating criteria: [evidence-quality-gates](./references/evidence-quality-gates.md)
- Required report table format: [findings-table-template](./references/findings-table-template.md)
- Cross-platform baseline/post scan helper: [run-axe-cli.mjs](./scripts/run-axe-cli.mjs)

## Workflow

### 1. Set Up Test Environment

Before testing, prepare:
- URL or file path of the feature
- Specific user journey or interaction flow
- Target screen readers (NVDA, JAWS, VoiceOver)
- Expected live regions or dynamic announcements

### 1.5 Dismiss Cookie Banners on Load (Mandatory)

Immediately after page load, detect and dismiss consent overlays before any baseline capture.

**Why this is mandatory**:
- Cookie banners can trap focus, hide target controls, and alter accessibility trees.
- Baselines taken before dismissal are invalid and produce misleading results.

**Playwright pattern**:
```javascript
const cookieSelectors = [
  'button:has-text("Accept")',
  'button:has-text("Accept all")',
  'button:has-text("I agree")',
  '[aria-label*="cookie" i] button',
  '#onetrust-accept-btn-handler',
  '.cookie-accept, .accept-cookies'
];

for (const selector of cookieSelectors) {
  const button = page.locator(selector).first();
  if (await button.isVisible({ timeout: 500 }).catch(() => false)) {
    await button.click({ timeout: 1500 }).catch(() => {});
    break;
  }
}

await page.waitForTimeout(400);
```

**Evidence to capture**:
- Screenshot after dismissal attempt
- Note whether dismissal succeeded, failed, or banner was not present

### 2. Capture Baseline: Visible Screenshot

Take a screenshot of the feature in its **initial state** before any interaction.

**Playwright command**:
```javascript
await page.screenshot({ path: './screenshots/baseline-visible.png' });
```

**Store as**: `baseline-visible.png`

**Critical**: Always take screenshots FIRST. They're your reference for what users actually see.

---

### 3. Capture Baseline: Accessibility Snapshot

Generate an accessibility tree snapshot of the **initial state**.

**Playwright command**:
```javascript
const snapshot = await page.accessibility.snapshot();
```

**Store as**: `baseline-a11y-snapshot.json`

⚠️ **IMPORTANT**: This snapshot is a REFERENCE, not the source of truth. It may:
- Filter or omit ARIA attributes
- Nest content differently than real DOM
- Not show visual presentation clearly

---

### 4. Gather Evidence: Direct HTML Inspection

Inspect the actual HTML to find ARIA attributes and verify what the tree showed.

**Method A: Specific Element Inspection**
```javascript
// Get the exact HTML of a button or region you're testing
const buttonHTML = await page.evaluate(() => {
  const btn = document.querySelector('button');
  return {
    tag: btn.tagName,
    html: btn.outerHTML.substring(0, 300),
    attributes: {
      ariaLabel: btn.getAttribute('aria-label'),
      ariaCurrent: btn.getAttribute('aria-current'),
      role: btn.getAttribute('role'),
      textContent: btn.textContent
    }
  };
});
```

**Method B: Region-wide Search**
```javascript
// Find all elements with specific ARIA attributes
const liveRegions = await page.evaluate(() => {
  return Array.from(document.querySelectorAll('[aria-live], [role="status"], [role="alert"]'))
    .map(el => ({
      tag: el.tagName,
      attributes: {
        ariaLive: el.getAttribute('aria-live'),
        role: el.getAttribute('role'),
        ariaAtomic: el.getAttribute('aria-atomic')
      },
      textContent: el.textContent.substring(0, 100)
    }));
});
```

**Method C: Page Source Search (Most Authoritative)**
```javascript
// Search the complete page source for attributes
const pageSource = await page.content();
const findings = {
  hasAriaLive: pageSource.includes('aria-live'),
  ariaLiveCount: (pageSource.match(/aria-live="/g) || []).length,
  hasAriaLabel: pageSource.includes('aria-label'),
  hasAriaAtom: pageSource.includes('aria-atomic')
};
```

---

### 5. Analyze: Run axe-core CLI Accessibility Scan

Scan for violations on the baseline state.

**Process**:
1. Run axe CLI against the baseline URL or local page
2. Capture JSON output for evidence
3. Filter results: violations, passes, incomplete

```bash
npx @axe-core/cli "https://example.test/page" --save baseline-a11y-violations.json
```

Optional local Chromium path:

```bash
npx @axe-core/cli "https://example.test/page" --browser chrome --save baseline-a11y-violations.json
```

**Store violations as**: `baseline-a11y-violations.json`

Helper script option (cross-platform, recommended):

```bash
node ./scripts/run-axe-cli.mjs --url "https://example.test/page" --output-dir "./artifacts" --tag "feature-a"
```

Non-interactive example (useful in CI or scripted runs):

```bash
node ./scripts/run-axe-cli.mjs --url "https://example.test/page" --post-url "https://example.test/page?state=after" --output-dir "./artifacts" --tag "feature-a" --no-prompt
```

---

### 6. Interact: Trigger Live Regions

Identify and execute the interaction that triggers a live region update.

1. **Determine Interaction Type**:
   - Form submission: `page.click()` on submit button
   - Button toggle: `page.click()` on toggle
   - Input change: `page.fill()` then `page.press('Enter')`
   - List update: `page.click()` to load more items

2. **Execute**:
```javascript
// Example: Click a search button
await page.click('button[type="submit"]');
await page.waitForTimeout(500); // Allow announcement debounce time
```

---

### 7. Capture Post-Interaction: Visual Screenshot

**Take a screenshot IMMEDIATELY after interaction** to see what changed.

```javascript
await page.screenshot({ path: './screenshots/post-interaction-visible.png' });
```

**Compare visually**: Did the UI update? Is there new content? Are there visual indicators?

---

### 8. Verify Post-Interaction: HTML Inspection

Repeat the HTML inspection methods from Step 4 to see if ARIA or content changed.

```javascript
const postInteractionState = await page.evaluate(() => {
  const resultsCounter = document.querySelector('[aria-live], .results-count, [role="status"]');
  return {
    html: resultsCounter?.outerHTML,
    textContent: resultsCounter?.textContent,
    ariaLive: resultsCounter?.getAttribute('aria-live'),
    changed: resultsCounter ? 'Found' : 'Missing'
  };
});
```

---

### 9. Analyze: Run axe-core CLI Post-Interaction

Scan again after the interaction to detect new or fixed violations.

**Store as**: `post-interaction-a11y-violations.json`

```bash
npx @axe-core/cli "https://example.test/page" --save post-interaction-a11y-violations.json
```

---

## 🔴 VERIFICATION CHECKLIST: Before Reporting Any Finding

### Finding Type: "Missing ARIA Attribute" (e.g., `aria-current="page"`)

**Step 1: Look at the screenshot**
```
□ Take screenshot of element/region
□ What do you visually SEE?
□ Is the current state somehow indicated? (text, highlight, bold, etc.)
□ Can sighted users tell which page/button is active?
```

**Step 2: Check accessibility tree**
```
□ Run page.accessibility.snapshot()
□ Find the element in the tree
□ Look for the attribute listed
⚠️  If NOT found, don't assume missing yet - tree can omit it
```

**Step 3: Inspect actual HTML**
```
□ Use page.evaluate() to get element.outerHTML
□ Read the real HTML source
□ Search for the ARIA attribute by name
□ This is the source of truth
```

**Step 4: Make verdict**
```
VERDICT:
✅ Visual shows it works + HTML confirms attribute + Content search confirms = REAL ISSUE EXISTS
✅ Visual shows it works + HTML has aria-current + Tree missed it = ATTRIBUTE EXISTS (my error)
❌ Visual shows indicator missing AND HTML confirms attribute missing = TRUE ISSUE
❌ Visual shows indicator present, HTML has attribute = FALSE POSITIVE (retract)
```

### Finding Type: "Missing Live Region"

```
□ VISUAL: Take screenshot before/after interaction
  ☐ Did content visually update?
  ☐ Is there new text on screen?

□ HTML: Use Method B (Region-wide search)
  ☐ Does [aria-live] element exist?
  ☐ Does it have aria-live="polite" or "assertive"?

□ SOURCE: Use Method C
  ☐ Search page.content() for 'aria-live='
  ☐ Count how many live regions exist

□ INTERACTIVE: Can you trigger it?
  ☐ Execute interaction
  ☐ Take post-interaction screenshot
  ☐ Did content change appear in accessibility tree?
```

### Finding Type: "Unlabeled Button"

```
□ VISUAL: Screenshot
  ☐ Is there visible text in button?
  ☐ Is there an icon with nearby label?

□ HTML: Inspect button element
  ☐ button.getAttribute('aria-label')?
  ☐ button.getAttribute('aria-labelledby')?
  ☐ button.textContent or button.innerText?
  ☐ Does icon have alt text or aria-label?

□ VERDICT:
  ✅ ANY of above = button IS labeled
  ❌ ALL are empty/missing = truly unlabeled
```

---

## Compare & Report with Evidence

## Required Findings Table (Strict Output Format)

Every final report MUST include this table. Do not replace it with prose-only findings.

Use the canonical template in [findings-table-template](./references/findings-table-template.md).

| Rank | Severity | Issue | Evidence Summary | User Impact | Fix Required | Verification Needed |
|------|----------|-------|------------------|-------------|--------------|---------------------|
| 1 | Critical/High/Medium/Low | Short issue title | Visual + HTML + tree + axe CLI references | One sentence impact | Concrete code/change required | Exact re-test step |

Ranking rules:
- Sort by user impact first, then reproducibility, then breadth of affected users.
- Rank `1` is highest priority.
- Include only confirmed issues in the ranked table; track false positives separately.

Required follow-up section after the table:
- **False Positives Retracted**: list claims disproven by cross-evidence checks.
- **Blocked/Needs Access**: list issues requiring auth, environment changes, or unavailable states.

### Structure of Credible Finding

```markdown
## Finding: [Issue Description]

**EVIDENCE LEVEL: [HIGH/MEDIUM/LOW]**

### Visual Evidence
- Screenshot location: [where to look]
- What sighted users see: [description]
- Confirmation: [Visual observation YES/NO]

### HTML Evidence  
- Method used: [page.evaluate / page.content()]
- Result: [what the HTML shows]
- ARIA attributes found: [list or "none"]
- Confirmation: [HTML confirms YES/NO]

### Accessibility Tree
- Snapshot shows: [tree representation]
- Note: [whether tree matches HTML]

### VERDICT
✅ GENUINE ISSUE — All evidence agrees this is a real problem
❌ FALSE POSITIVE — Evidence contradicts the claim, retract
⚠️  INVESTIGATE — Evidence mixed, needs deeper analysis

### Impact
- WCAG criterion: [e.g., 4.1.3 Status Messages]
- User impact: [What screen reader users will experience]

### Recommendation
[Specific code fix or refactoring needed]
```

---

## Common False Positives from Single-Tool Analysis

| Claim | Tool | What Went Wrong | How to Catch |
|-------|------|-----------------|---|
| "Current page not marked" | Tree only | Snapshot showed fragments | Screenshot shows "1 of 62" |
| "Button has no label" | Tree only | Tree didn't show button text | Visual shows text clearly |
| "No live region" | Tree only | Tree missed aria-live attribute | Direct HTML has aria-live="polite" |
| "Images missing alt text" | axe-core | Decorative images flagged | Visual inspection: decorative, skip |
| "Heading hierarchy broken" | axe-core | Context-dependent violation | Read actual h1→h2→h3 nesting, it's correct |

---

## Quick Reference: Playwright & NVDA Integration

### Accessing Accessibility Tree in Playwright

```javascript
const snapshot = await page.accessibility.snapshot();
console.log(JSON.stringify(snapshot, null, 2));
// ⚠️ Reference only - verify with screenshots and HTML inspection
```

### Detecting Live Regions Programmatically

**Method 1: Tree (LIMITED - may omit attributes)**
```javascript
const liveRegions = await page.evaluate(() => {
  return Array.from(document.querySelectorAll('[aria-live]')).map(el => ({
    selector: el.className || el.id || el.tagName,
    ariaLive: el.getAttribute('aria-live'),
    textContent: el.textContent.substring(0, 100)
  }));
});
```

**Method 2: Direct HTML (RELIABLE)**
```javascript
const liveRegionHTML = await page.evaluate(() => {
  const elements = document.querySelectorAll('[aria-live], [role="status"], [role="alert"]');
  return Array.from(elements).map(el => ({
    tag: el.tagName,
    ariaLive: el.getAttribute('aria-live'),
    role: el.getAttribute('role'),
    html: el.outerHTML.substring(0, 150)
  }));
});
```

**Method 3: Page Source (MOST AUTHORITATIVE)**
```javascript
const pageSource = await page.content();
const ariaLiveCount = (pageSource.match(/aria-live="/g) || []).length;
const hasStatusRole = pageSource.includes('role="status"');
```

### Running axe-core with CLI (Required)

```bash
npx @axe-core/cli "https://example.test/page" --save axe-results.json
```

Use CLI artifacts as report evidence and reference the saved JSON file in findings.

### Simulating NVDA-like Behavior

NVDA doesn't directly integrate with Playwright, but you can:
- **Inspect the accessibility tree** (what NVDA reads) — BUT verify with visual
- **Test keyboard navigation** (Tab, Enter, arrow keys)
- **Verify ARIA attributes** (roles, labels, states) — with direct HTML inspection
- **Check live regions** (aria-live, aria-relevant) — confirm visually and in source

For live region testing, focus on:
1. Is the region visually updated on screen?
2. Is it marked with `aria-live` in the actual HTML?
3. Does text content appear in the accessibility tree?

---

## Step-by-Step Testing Flow (Updated)

1. **Set up** → Prepare feature and environment
2. **Dismiss cookies** → Handle consent overlays before any baseline capture
3. **Baseline visible** → `page.screenshot()` (FIRST valid baseline)
4. **Baseline a11y** → `page.accessibility.snapshot()` (reference only)
5. **Baseline HTML** → `page.evaluate()` direct DOM inspection (verification)
6. **Scan baseline** → Run axe-core CLI for automated violations
7. **Interact** → Execute interaction, observe VISUAL changes
8. **Post-interaction visible** → `page.screenshot()` (verify what changed)
9. **Post-interaction HTML** → Direct inspection to confirm changes
10. **Post-interaction a11y** → `page.accessibility.snapshot()` (reference)
11. **Post-interaction scan** → Run axe-core CLI again
12. **Ranked reporting** → Publish strict findings table + required follow-up sections

---

## Common Issues & Solutions

| Issue | Root Cause | Solution |
|-------|-----------|----------|
| False positive: "Missing ARIA" | Relied on tree snapshot only | Screenshot + HTML inspection confirm if present |
| Live region not detected | Tree filtered it out | Use `page.evaluate()` + page.content() search |
| Snapshot too large | Full page capture | Use `page.accessibility.snapshot({ root: selector })` |
| Timing issues after interaction | Content not yet rendered | Add `await page.waitForSelector()` before screenshot |
| NVDA announcement delayed | CSS animations blocking ARIA | Check for transitions/animations delaying text insertion |
| axe reports false positives | Violations out of context | Manual review: decorative images, context-dependent rules |
| **Accessibility claim has low confidence** | Only 1-2 evidence methods used | Triangulate: screenshot + tree + HTML before reporting |

---

## References

- [Playwright Accessibility Testing](https://playwright.dev/docs/api/class-accessibility)
- [Playwright Evaluation API](https://playwright.dev/docs/api/class-page#page-evaluate)
- [axe-core Violations](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
- [ARIA Live Regions](https://www.w3.org/WAI/ARIA/apg/patterns/liveregion/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [NVDA Keyboard Shortcuts](https://www.nvaccess.org/files/nvda/documentation/userGuide.html)

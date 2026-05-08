---
name: playwright-test-gen
description: >
  Converts Given/When/Then manual test cases (in CSV format) into Playwright TypeScript tests using the Page Object Model.
  Use this skill whenever the user wants to automate manual test cases, convert GWT scripts to Playwright, turn a test CSV into
  code, or generate automated tests from an existing test script. Also triggers when the user says "automate these tests",
  "convert to Playwright", "write Playwright tests from my CSV", or pastes GWT-style test steps and asks for code.
  Produces POM locators, page methods, test fixtures, and spec files — scoped to only what is needed based on the input.
metadata:
  author: Tom Robinson - tom.robinson@msqdx.com
  version: "1.0.1"
---
 
# Playwright Test Generator
 
Converts Given/When/Then manual test cases (CSV format) into Playwright TypeScript tests. Produces well-structured Page Object Model code — only generating what is actually needed — following all established Playwright best practices.
 
---
 
## When to Use This Skill

- User asks to "automate these tests", "convert to Playwright", or "write Playwright tests from my CSV"
- User pastes GWT-style test steps and asks for code
- User wants to turn a test CSV into automated tests
- User wants to convert manual test cases to Playwright TypeScript using the Page Object Model
- User references Given/When/Then scripts and needs a Playwright implementation

---

## Prerequisites



## Input Format
 
> **New to these skills?** See the [Playwright Skills Workflow Guide](../playwright-cli/references/workflow-guide.md) to understand how playwright-test-gen fits into the broader testing lifecycle, and when to use playwright-cli for exploration first.
Expects a CSV with these columns:
---
 
## Input Format
```
Case, Preconditions, Steps (text), Expected, Folder
```
 
- **Case** — test case name
- **Preconditions** — Given... statement(s), newline-separated
- **Steps (text)** — When... statement(s), newline-separated with "And" continuations
- **Expected** — Then... statement(s), newline-separated with "And" continuations
- **Folder** — `Frontend` or `CMS`
> CMS-folder rows (Optimizely/Storyblok editor actions) are skipped by default. Flag if the user wants CMS tests included — these require a separate discussion about editor automation approach.
 
---
 
## Workflow
 
## Step-by-Step Instructions

### Step 1 — Parse and Group the CSV
 
Read the CSV and group rows by the pages or features they touch. Identify:
 
- Which pages / routes are involved
- Which user interactions repeat across cases (these become shared POM methods)
- Which cases are Frontend vs CMS
For each distinct page or component surface, you will produce one page object.
 
### Step 2 — Audit Existing POMs (If Provided)
 
If the user shares existing page objects or a project structure, check for:
 
- Existing locators that already cover what's needed — **reuse these, do not duplicate**
- Existing methods that partially cover a step — extend rather than replace
- Fixtures already registered
Ask the user to share relevant existing POMs if not provided and the test cases clearly operate on named pages.
 
### Step 3 — Plan the Output
 
Before writing code, present a brief plan:
 
```
Pages identified: LoginPage, DashboardPage
New locators needed: 4 (LoginPage), 2 (DashboardPage)
New methods needed: fillLoginForm, submitLogin, verifyDashboardLoaded
Existing methods reused: (none / list them)
New fixture registrations: loginPage, dashboardPage
Test file: tests/login.spec.ts — N test cases
```
 
Get a thumbs-up before generating if the plan is non-trivial (more than ~3 pages or ~10 tests).
 
### Step 4 — Generate the Code
 
Produce in order:
 
1. **Page object additions** — new locators and methods only (or full file if new)
2. **Fixture update** — `testFixtures/base.ts` additions only
3. **Spec file** — `tests/<feature>.spec.ts`
---
 
## Locator Strategy
 
This is the most important rule in this skill. **Do not invent locators.** Follow this hierarchy:
 
### Tier 1 — Use confidently (no placeholder needed)
 
These can be inferred from GWT language without seeing the DOM:
 
- `getByLabel('First name')` — when the step references a labelled form field by its visible label text
- `getByRole('button', { name: 'Submit' })` — when the step references a button by its visible text
- `getByRole('heading', { name: '...' })` — when asserting a heading
- `getByRole('link', { name: '...' })` — when clicking a named link
- `getByTestId('...')` — only when the test case or spec **explicitly names a test ID**
### Tier 2 — Use with a TODO comment
 
When the interaction is clear but the exact selector is unknown:
 
```typescript
// TODO: confirm selector — replace with getByTestId or getByRole once DOM is available
readonly submitButton = this.page.locator('[data-testid="submit-btn"]'); // PLACEHOLDER
```
 
Use a `// PLACEHOLDER` comment on every line where a selector was inferred rather than confirmed.
 
### Tier 3 — Never generate
 
- CSS class selectors (`.btn-primary`) — fragile
- XPath — fragile and unreadable
- nth-child / positional selectors
- Made-up `data-testid` values not referenced in the test cases
### Decision Rule
 
> If you would have to guess what the DOM looks like to write the selector — placeholder it.
 
---
 
## Method Decomposition Rules
 
Split compound "When" steps into separate methods. Each method does **one thing**.
 
### Examples
 
| Given/When/Then step | Method(s) |
|---|---|
| "When I fill in my email and password and click Sign in" | `fillEmail()`, `fillPassword()`, `submitLoginForm()` — or `fillLoginForm(email, password)` + `submitLoginForm()` |
| "When I search for 'accountant' and apply the Finance filter" | `searchFor(term)`, `applyFilter(label)` |
| "When I click the first result card" | `clickResultCard(index)` |
 
Prefer small, composable methods over large monolithic ones. A method should map to a single user gesture or assertion.
 
**Method naming:** verb + noun, camelCase. Examples: `fillSearchInput`, `submitForm`, `dismissCookieBanner`, `verifySuccessMessage`, `selectDropdownOption`.
 
---
 
## Assertion Rules
 
All assertions use web-first `await expect()`. Never use `expect(await element.isVisible()).toBe(true)`.
 
Map "Then" statements to assertions:
 
| Then statement pattern | Playwright assertion |
|---|---|
| "...is visible / is displayed / appears" | `await expect(locator).toBeVisible()` |
| "...is not visible / is hidden" | `await expect(locator).toBeHidden()` |
| "...contains text X" | `await expect(locator).toContainText('X')` |
| "...shows text X" / "...reads X" | `await expect(locator).toHaveText('X')` |
| "...URL contains /path" | `await expect(page).toHaveURL(/path/)` |
| "...field contains value X" | `await expect(locator).toHaveValue('X')` |
| "...button is disabled" | `await expect(locator).toBeDisabled()` |
| "...N results are shown" | `await expect(locator).toHaveCount(N)` |
| "...is checked" | `await expect(locator).toBeChecked()` |
 
Assertions that cannot be cleanly mapped get a `// TODO: write assertion — confirm expected behaviour` comment.
 
---
 
## Test Structure
 
### File Naming
 
`tests/<featureName>.spec.ts` — use camelCase derived from the CSV `Folder` or the dominant page/feature.
 
### Test Structure Template
 
```typescript
import { test, expect } from '../testFixtures/base';
 
test.describe('<Feature Name>', () => {
 
  test.beforeEach(async ({ <pageName> }) => {
    await <pageName>.goto('<path>');
    // Handle any prerequisite state (e.g. dismiss cookie banner)
  });
 
  test('should <case name in sentence case>', async ({ <pageName> }) => {
    // Arrange
    // (any setup beyond beforeEach)
 
    // Act
    await <pageName>.<method>();
 
    // Assert
    await expect(<pageName>.<locator>).<assertion>();
  });
 
});
```
 
### Test Naming
 
Convert the CSV `Case` value to `should <case in sentence case>`. Examples:
- `Filter dropdown interaction` → `should show filter options when dropdown is clicked`
- `Login with valid credentials` → `should redirect to dashboard when valid credentials are submitted`
If the CSV name is already a "should..." statement, use it as-is.
 
### Handling Preconditions (Given)
 
| Precondition type | Where it goes |
|---|---|
| Navigation to a URL | `beforeEach` via `page.goto()` or POM `goto()` method |
| Logged-in state | `beforeEach` fixture or auth setup (flag as TODO if auth approach is unknown) |
| Specific CMS content published | Comment as `// Precondition: <content> must be published in CMS` |
| Cookie/consent banner dismissed | `beforeEach` — `dismissCookieBanner()` method on the page object |
 
---
 
## Output Format
 
Present code in clearly labelled blocks in this order:
 
### Block 1 — Page Object (New File or Additions to Existing)
 
```
// objects/pages/<pageName>.ts
// NEW FILE  ← or → // ADDITIONS TO EXISTING FILE
```
 
Show the full file if new. Show only the new locators + methods (with a comment indicating where they slot in) if adding to an existing file.
 
### Block 2 — Fixture Registration
 
```
// testFixtures/base.ts — ADD THESE LINES
```
 
Only show the new imports and fixture entries. Do not reproduce the whole file.
 
### Block 3 — Spec File
 
```
// tests/<feature>.spec.ts
```
 
Full file.
 
### Block 4 — Placeholder Summary
 
After the code, list every `// PLACEHOLDER` locator in a summary table:
 
| Page object | Property name | What's needed |
|---|---|---|
| `LoginPage` | `errorMessage` | Selector for the login error message — check DOM for `data-testid` or role |
 
This gives the engineer a clear hit-list to resolve before running the tests.
 
---
 
## Constraints and Guardrails
 
- **Never generate CMS folder tests** unless the user explicitly requests it and confirms the editor automation approach
- **Never use `waitForLoadState('networkidle')`** — use element-based waits
- **Never use `waitForTimeout()`** — use web-first assertions
- **Never add `if/else` in tests** — all tests must be linear and deterministic
- **Never put selectors directly in spec files** — all locators live in page objects
- **Never invent test data** beyond what is in the CSV or obviously generic (e.g. `'test@example.com'`)
- **Never generate a fixture for a page object that already exists** — check first
- **Never include real PII** (names, email addresses, phone numbers, dates of birth) or credentials in generated test data — use only synthetic values such as `'test@example.com'` and `'Password123!'`
---
 
## Example Conversion
 
## Examples of Inputs and Outputs

### Input CSV Row
 
```
Case: "Login with valid credentials"
Preconditions: "Given I am on the login page"
Steps (text): "When I enter a valid email address\nAnd I enter a valid password\nAnd I click the Sign in button"
Expected: "Then I am redirected to the dashboard\nAnd a welcome message is displayed"
Folder: "Frontend"
```
 
### Output — Page Object Additions
 
```typescript
// objects/pages/loginPage.ts — ADDITIONS TO EXISTING FILE
 
// Add to constructor:
readonly emailInput = this.page.getByLabel('Email address'); // PLACEHOLDER — confirm label text
readonly passwordInput = this.page.getByLabel('Password');
readonly signInButton = this.page.getByRole('button', { name: 'Sign in' });
readonly welcomeMessage = this.page.getByTestId('welcome-message'); // PLACEHOLDER — confirm data-testid
 
// Add methods:
async fillEmail(email: string) {
  await this.emailInput.fill(email);
}
 
async fillPassword(password: string) {
  await this.passwordInput.fill(password);
}
 
async submitLoginForm() {
  await this.signInButton.click();
  await expect(this.page).toHaveURL(/dashboard/);
}
```
 
### Output — Spec
 
```typescript
// tests/login.spec.ts
import { test, expect } from '../testFixtures/base';
 
test.describe('Login', () => {
 
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto('/login');
  });
 
  test('should redirect to dashboard when valid credentials are submitted', async ({ loginPage }) => {
    // Arrange
    const email = 'test@example.com';
    const password = 'Password123';
 
    // Act
    await loginPage.fillEmail(email);
    await loginPage.fillPassword(password);
    await loginPage.submitLoginForm();
 
    // Assert
    await expect(loginPage.page).toHaveURL(/dashboard/);
    await expect(loginPage.welcomeMessage).toBeVisible();
  });
 
});
```
 
### Output — Placeholder summary
 
| Page object | Property | What's needed |
|---|---|---|
| `LoginPage` | `emailInput` | Confirm the visible label text for the email field |
| `LoginPage` | `welcomeMessage` | Find the `data-testid` or role for the welcome message element |
 
---
 
## Common Edge Cases

| Scenario | How to Handle |
|---|---|
| CSV row has no `Folder` value | Treat as `Frontend` and flag the assumption in a comment |
| Multiple test cases share the same page | Generate one page object shared across all relevant specs |
| Precondition requires authenticated state | Stub with `// TODO: set up auth fixture — confirm approach with team` |
| Step references a component with no visible label or role | Use Tier 2 placeholder locator and note in the placeholder summary |
| CMS-folder row included in the CSV | Skip and list skipped cases at the top of the output with a note |
| Existing POM already has a matching locator | Reuse the existing property — do not duplicate |
| `Expected` column has no assertable outcome (e.g. "Test passes") | Add `// TODO: write assertion — confirm expected behaviour` |

---

## Delivery and Commit Conventions

Generated test files are production code. Apply the same engineering standards as any other change.

### Conventional Commits

All commits containing generated test files must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification with the `test` type:

```
test(<scope>): <description in imperative mood>

[optional body — what and why, not how]
```

Examples:

```
test(login): add Playwright spec for valid credentials flow

test(search): automate filter dropdown interaction tests
```

### Branch and PR Conventions

- Branch name: `test/<feature-name>` (e.g. `test/add-login-playwright-tests`)
- PR title must follow the same Conventional Commits format as the commit message
- PR description must include **What**, **Why**, **How to test**, and **Related issues**
- All changes must go via a pull request — never commit directly to `main`
- Request at least one reviewer before merging; use squash merge

---

## Final Checklist Before Presenting Output
 
- [ ] All `Frontend` folder cases converted (CMS skipped or flagged)
- [ ] No selectors invented — all uncertain locators are `// PLACEHOLDER`
- [ ] All assertions use `await expect()` web-first pattern
- [ ] All compound "When" steps split into separate methods
- [ ] AAA structure in every test
- [ ] No conditionals in any test
- [ ] No `waitForTimeout` or `networkidle`
- [ ] Placeholder summary table included
- [ ] Code compiles (no obvious TypeScript errors — check imports, types, async/await)
- [ ] No real PII or credentials in any test data
- [ ] Conventional Commits message drafted (`test(<scope>): ...`)
- [ ] Branch name follows `test/<feature-name>` convention
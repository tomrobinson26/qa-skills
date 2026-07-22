# Spec rules

These are the fixed conventions for step 5. Only file paths, import syntax, and framework-specific APIs adapt to the target repo — the structure below doesn't.

## Imports

```ts
import { expect, test } from '<the repo's fixture wrapper, if one exists>';
import { WidgetBlock } from '<wherever POM classes live>';
```

If the repo has a custom fixture wrapper around `test.extend`, import from it rather than the raw framework package — that's usually the only way to get access to any custom fixtures (pre-built page objects, an accessibility-scan helper, environment-aware navigation, etc.). Importing straight from the framework package silently loses all of that.

## Getting hold of the component under test

- **Shared chrome** components are already attached to the shared/base page object fixture — use that instance rather than constructing a second one.
- **Content blocks** are constructed directly per test, right after the test function opens, passing in whatever page/context fixture the repo provides.
- If the page the block lives on varies by environment, use the repo's config/fixture-data layer to map a logical name to a path — don't hardcode a URL string in the spec.

## Describe-block structure

Group by concern, not by page: `navigation`, `visibility and interaction`, and `accessibility` as separate top-level `describe` blocks — only include the ones that actually apply to this feature. Within `visibility and interaction`, split further by device (`device agnostic`, `desktop`, `mobile`) when behavior genuinely differs by viewport (hover-only vs. tap-only interactions) — don't split when it doesn't.

## Device/browser tagging

Tag device-specific describe blocks (`{ tag: ['@desktop'] }`, `{ tag: ['@mobile'] }`) whenever the runner config filters projects by tag (Playwright's `grep`/`grepInvert` is the common mechanism) and the feature has behavior that only makes sense on one device class. Skipping this means a desktop-only interaction actually runs — and fails — under a mobile project. Check the runner config once per repo to confirm the tag names it actually expects.

## Soft vs. hard assertions

Batch independent, non-critical checks (e.g. "these five things are all visible") with soft assertions, so a single run reports every failure instead of stopping at the first. Use hard assertions whenever a later step in the same test depends on the prior check having passed, or when a soft failure would just cascade into confusing follow-on failures.

## Accessibility checks

Scan the new feature specifically (axe-core is the common integration for Playwright suites), scoped to its root selector rather than the whole page, so failures are attributable to this component. Also cover, where relevant:

- Meaningful alt text / accessible names on images and icon-only controls.
- Keyboard reachability: tab/arrow-key navigation between repeated items, asserting focus lands where expected.
- Visible focus/hover state: screenshot before and after triggering the state, assert they differ — a cheap way to catch a missing focus ring or hover style without asserting on exact pixel values.

## Rules that always apply

- A blank line immediately after a navigation call (`goto`, `skip`), separating setup from assertions.
- Lowercase test titles, natural-language sentences.
- No conditionals (`if`, ternaries) controlling test flow — data-dependent skips go through `test.skip(condition, reason)` instead, so a skipped test is still visible in results rather than silently vanishing.
- Every test contains an assertion, whether directly or by calling a named `assert*`/`check*`/`verify*` helper or fixture.
- No raw locators constructed directly inside a spec — only through a POM method or property. This is the entire reason the POM has to exist before the spec can be written correctly.

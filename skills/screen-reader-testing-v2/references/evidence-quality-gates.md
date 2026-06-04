# Evidence Quality Gates

A finding is reportable only if all required gates pass.

## Gate 1: Visual Evidence
- Screenshot confirms the observed behavior.

## Gate 2: HTML Evidence
- `page.evaluate()` or `page.content()` confirms the underlying markup/ARIA state.

## Gate 3: Accessibility Tree Evidence
- Accessibility snapshot captured and compared against visual + HTML evidence.

## Gate 4: Automated Evidence
- axe CLI JSON artifact exists and is cited in the finding.

## Pass/Fail Rule
- Report issue in ranked table only when Gates 1, 2, and 4 pass.
- Gate 3 may be inconsistent; if so, log mismatch explicitly as analysis context.
- If any required gate fails due to environment constraints, move issue to `Blocked/Needs Access`.

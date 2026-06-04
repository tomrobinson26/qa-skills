# Ranked Findings Table Template

Use this exact table in final accessibility reports.

| Rank | Severity | Issue | Evidence Summary | User Impact | Fix Required | Verification Needed |
|------|----------|-------|------------------|-------------|--------------|---------------------|
| 1 | Critical | Example: Keyboard trap in cookie banner | Screenshot `baseline-visible.png`; HTML selector `.cookie-modal`; a11y tree shows trapped focus; axe CLI `baseline-a11y-violations.json` | Keyboard and screen reader users cannot reach core page actions | Ensure modal close and accept buttons are keyboard reachable; release focus trap after dismiss | Re-test with keyboard-only navigation and rerun axe CLI baseline/post |

## Required Follow-up Sections

### False Positives Retracted
- List claims disproven by visual/HTML/tree evidence triangulation.

### Blocked/Needs Access
- List checks blocked by auth, geo restrictions, feature flags, or inaccessible states.

## Ranking Rules

1. Rank by user impact first, then reproducibility, then breadth of affected users.
2. `Rank = 1` is highest priority.
3. Include only confirmed issues in the table.
4. Put uncertain findings under `Blocked/Needs Access`, not in ranked issues.

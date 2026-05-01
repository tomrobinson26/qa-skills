# Cookie Banner Handling Playbook

Dismiss cookie or consent UI before baseline capture. If not dismissed, baseline data is invalid.

## Detection Priority

1. OneTrust and known frameworks
- `#onetrust-accept-btn-handler`
- `button#onetrust-reject-all-handler`

2. Text-based selectors
- `button:has-text("Accept")`
- `button:has-text("Accept all")`
- `button:has-text("I agree")`
- `button:has-text("Allow all")`

3. Attribute and class selectors
- `[aria-label*="cookie" i] button`
- `.cookie-accept`
- `.accept-cookies`

## Required Evidence

- Screenshot immediately after dismissal attempt.
- Note one status only: `dismissed`, `not-present`, or `blocked`.
- If `blocked`, describe what prevented dismissal and continue testing with a documented limitation.

## Verification Checks

- Confirm focus is no longer trapped in consent UI.
- Confirm critical page actions are interactable.
- Confirm banner overlay is gone or inert.

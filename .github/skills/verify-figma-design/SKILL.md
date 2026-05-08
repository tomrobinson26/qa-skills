---
name: verify-figma-design
description: Validate that a deployed website matches its source Figma design. Use this skill during QA verification, regression testing, or design compliance audits. Use when asked to verify, diff, or compare a deployed website against a Figma design, when visual fidelity issues are suspected, or when the user says "verify", "check against Figma", "visual diff", or "does this match the design". Requires the deployed website URL and the Figma MCP server connection.
user-invocable: true
---

# Verify Figma Design Implementation

Validates that a rendered UI matches its source Figma design by performing a structured visual comparison, font audit, token check, and component mapping verification.

## When to use

- During QA testing of a feature to verify visual compliance with Figma design
- For regression testing after design or code updates
- When the user asks to verify, diff, or compare a deployed website against a Figma design
- To audit design compliance across breakpoints and device sizes
- When visual fidelity issues are suspected between design and implementation

## Prerequisites

- The Figma MCP server must be connected (remote: `https://mcp.figma.com/mcp`)
- A deployed website URL must be available (staging, production, or QA environment)
- The source Figma URL must be available — either provided by the user,
  present in documentation, or referenced in test cases
- The `playwright-cli` skill is used for browser automation and screenshots

## Instructions

### Step 1 — Locate the source design

Find the source Figma URL(s) for the implemented feature. Check in this order:

1. The user's prompt (if they provided a Figma URL directly)
2. `design-context.md` in the current feature directory
   (`specs/NNN-feature-name/design-context.md`)
3. `tasks.md` — the task that was just implemented may carry a Figma URL
4. `spec.md` — the Design Context reference section

If no Figma URL can be found, ask the user to provide one.

Extract `fileKey` and `nodeId` from the URL structure. Figma URLs typically look like:
`figma.com/design/:fileKey/:fileName?node-id=123-456` or
`figma.com/design/:fileKey/:fileName?node-id=123%3A456`

In both cases, treat the normalized `nodeId` value as `123:456`.

### Step 2 — Capture the deployed website

1. Obtain the deployed website URL. Check in this order:
   - The user's prompt (if they provided a URL directly)
   - Your QA environment documentation or test plan
   - The CI/CD pipeline or deployment tracking system
   - Typical URLs: staging environment, QA environment, or production
2. Determine the target breakpoints. Check in this order:
   - The user's prompt (if they specified breakpoints or device sizes)
   - The project's design tokens or Tailwind/CSS config for defined
     breakpoints
   - The design specification for any responsive requirements
   - Default to: desktop (1440px), tablet (768px), mobile (375px)
3. For each breakpoint, take a screenshot of the deployed website using
   `playwright-cli`. Follow this sequence:

   ```bash
   playwright-cli open https://example.com/target-page
   playwright-cli resize 1440 900   # set viewport width for the breakpoint
   playwright-cli screenshot --filename=desktop-1440.png   # full page
   # or capture a specific element only:
   playwright-cli screenshot e5 --filename=desktop-hero.png
   ```

   Repeat with the appropriate width for each breakpoint (e.g. `resize 768 1024`
   for tablet, `resize 375 812` for mobile). Save each screenshot with a
   descriptive filename that includes the breakpoint width.

Keep all captured screenshots accessible for comparison in Step 5.

### Step 3 — Capture the source design

1. Call `get_screenshot` with the source `fileKey` and `nodeId` to get
   a visual reference of the original Figma design.
2. If the Figma design includes responsive variants or breakpoint-
   specific frames, call `get_screenshot` for each variant that
   corresponds to the breakpoints captured in Step 2.
3. Call `get_design_context` with the same parameters to get the
   structured design data (layout, components, tokens, constraints).
4. Call `get_variable_defs` to get the design token definitions used
   in the source frames.

### Step 4 — Font audit

Extract all font families referenced in the `get_design_context`
response. For each font family:

1. Check if the font files exist in the project's font/asset directory.
   Common locations: `public/fonts/`, `src/assets/fonts/`,
   `static/fonts/`, or as defined in the project's CSS/config.
2. Check if the font is loaded in CSS (`@font-face` declarations) or
   via a font loading service (e.g. Google Fonts link, Adobe Fonts).
3. Check if the font-family declarations in the component's styles
   match the Figma design's font family names exactly.

**If any fonts are missing or misconfigured:**

Report each issue and ask the user to provide the font files. Use this format:

```
⚠️  Missing fonts detected:

1. [Font Family Name] (weight: [weight], used in: [component/element])
   → No font file found in [checked directory]
   → Please add the .woff2/.ttf file to [suggested directory]
     and add an @font-face declaration to [CSS file]

2. [Font Family Name] ...
```

Do NOT proceed with the visual diff until the user confirms fonts are resolved. Missing fonts invalidate any visual comparison.

### Step 5 — Visual diff

Compare the deployed website against the source Figma design across these dimensions:

#### 5a. Layout structure

- Does the DOM/component hierarchy match the Figma layer hierarchy?
- Are flex/grid directions consistent with Figma auto layout?
- Do responsive behaviours (hug/fill/fixed) match?

#### 5b. Spacing and sizing

- Do padding and gap values match the Figma design tokens?
- Are widths, heights, and min/max constraints consistent?
- Check for hardcoded pixel values that should use design tokens.

#### 5c. Typography

- Do font families, sizes, weights, and line heights match?
- Is letter-spacing consistent?
- Do text colors use the correct tokens?

#### 5d. Colors and surfaces

- Do background colors, borders, and shadows match design tokens?
- Are opacity values consistent?
- Do interactive state colors (hover, active, focus, disabled) match variant states in the design?

#### 5e. Component usage

Before evaluating component usage, call the `get_code_connect_map` tool (or read the Code Connect mapping from `design-context.md` - skip if context is present without code connect mapping) to load the mapping between Figma components and code components.

- Are Code Connect mapped components used where expected? (Cross-reference `get_code_connect_map` output)
- Are component props/variants correctly applied?

#### 5f. Assets

- Are all images and icons present and correctly sized?
- Are SVGs from the Figma MCP assets endpoint used directly?

### Step 6 — Report

Generate a verification report in this format:

```
## Design Verification Report

**Test URL:** [deployed URL]
**Environment:** [staging/production/QA]
**Source Figma:** [URL]
**Tested at breakpoints:** [list of viewport widths]
**Date:** [timestamp]

### ✅ Passing
- [What matches correctly]

### ⚠️ Warnings
- [Minor discrepancies that may be acceptable — e.g. sub-pixel
  rounding, antialiasing differences]

### ❌ Issues
- [Significant visual discrepancies with specific details]
  - Expected: [from Figma]
  - Actual: [from deployed website]
  - Severity: [Critical / High / Medium / Low]

### 🔤 Font Status
- [Font family]: ✅ Loaded | ❌ Missing | ⚠️ Wrong weight/style

### 🎨 Token Compliance
- [X/Y] design tokens correctly applied
- Hardcoded values found: [list any raw hex/px values that appear
  inconsistent with design tokens]

### Summary
[Pass / Fail with count of issues]
[Recommended next steps — file bug report, request developer fix, etc.]
```

If there are issues, document them for the development team. For each issue, include:
- Screenshot evidence
- Expected vs. actual
- Affected breakpoints
- Severity level

## Examples

### Direct invocation with deployed URL

```
/verify-figma-design https://staging.example.com/hero-banner https://figma.com/design/abc123/DS?node-id=42-1337
```

### From conversation context

```
I need to verify the hero banner on staging matches the Figma design. Can you check it across desktop and mobile?
```

### QA regression testing

```
Check if the recent design updates in Figma have been correctly deployed to production.
```

## Troubleshooting

## Troubleshooting

| Problem                             | Cause                               | Fix                                                             |
| ----------------------------------- | ----------------------------------- | --------------------------------------------------------------- |
| Website URL is not accessible       | Environment down or incorrect URL   | Verify the deployment is live and use the correct environment URL |
| Diff reports many false positives   | Dynamic/animated content or A/B testing | Capture static state, disable animations, or test known variants |
| Fonts show as missing but render OK | Font loaded via CDN not local files | Verify CDN is accessible from your network                     |
| Screenshots show staged/stale content | Cache or deployment delay          | Hard refresh (Ctrl+Shift+R), clear cache, or wait for deployment to propagate |

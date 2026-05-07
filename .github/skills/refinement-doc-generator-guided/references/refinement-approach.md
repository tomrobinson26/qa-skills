# Refinement Approach & Question Taxonomy

The agency's thinking on what refinement is for and what kinds of questions a good spec surfaces. Use this as a prompt for the Questions section — don't regurgitate it, but mine it for the categories of unknown that a given feature touches.

---

## Why refinement matters

Refining all new features — regardless of size — aligns internal and client teams on functionality, design, and behaviour before development starts. Different skillsets (QA, .NET, Frontend, PM, Design, UX) ask questions from different angles, which reduces ambiguity, increases test coverage, and improves estimate accuracy.

## Format of a refined ticket

- User stories (not always necessary)
- Requirements — CMS property, rendering, accessibility, compatibility
- Questions
- Designs

Note: tablet designs are often skipped; include specific requirements or questions for tablet behaviour and layout.

## Question taxonomy

Use these categories as a checklist when populating the Questions section.

### CMS behaviour

- Are there restrictions on where the feature can be created? (e.g. a Hero Block only inside a Hero Content Area, or a page type only below a specific parent.)

### CMS properties

- What property types are needed? (String / Basic RTE / Full RTE / Image Picker / Colour Picker / etc.)
- Should each property be required or optional?
- For rich text editors — full, reduced, or basic? What styles and block types are allowed?
- Should RTEs allow embedded content types?
- Should link fields allow external linking?
- Are there minimums or maximums? (e.g. items in a carousel, characters in a heading.)
- Are there defaults? (e.g. default background colour.)
- Are there overriding CMS properties? (e.g. teaser title overriding page title.)

### Rendering

- If an optional CMS property is empty, what happens on the frontend?
- If a block has no items, is the entire block hidden?
- Does padding reduce when content is absent?
- Do properties depend on each other? (e.g. CTA link requires CTA text; both required together or neither.)
- Edge cases for counts — carousel with 1, 2, or 3 items; what happens above N items; do they wrap left-to-right?
- If a feature is clickable, is the hit area the link only or the whole card?
- Image requirements — fallback image, opacity overlay, focal points, aspect ratios.
- What are the desktop, tablet, and mobile breakpoints?
- Any specific behaviour unique to mobile or tablet?

### Additional

- Is everything the design proposes actually feasible?
- Any edge cases in logic or behaviour?
- Dependencies on existing or new integrations?
- Analytics or tracking requirements?
- Error handling — invalid URLs, broken images, failed loads?
- Loading and empty states?

## Semantic HTML patterns

A few recurring choices that benefit from a house default rather than a fresh debate each time. Use these as starting points; deviate when the component genuinely needs something different.

### Disclosure / accordion patterns

- **`<details>` / `<summary>`** — appropriate for pure content reveal: help text, a description, a collapsible read-only block. Native keyboard handling, no JS needed. Works well when there's no animation requirement and no interactive controls nested inside the summary.
- **`<button aria-expanded>` + panel** — preferred when the panel contains a form, interactive controls, or needs an animated open/close transition. Form validation across a collapsed `<details>` is fragile, and animating `<details>` requires JS anyway, at which point the button pattern is cleaner.

### Grouping form controls

- Group controls that share a semantic purpose under a single `<fieldset>` with one `<legend>`. A form-section of related fields (e.g. a set of personal details) is one group, not one group per field.
- One `<fieldset>` per input is almost always wrong — it creates screen-reader noise and implies groupings that don't exist.
- Radio buttons and checkboxes that represent a single choice or multi-choice from a list are the canonical case for `<fieldset>`.

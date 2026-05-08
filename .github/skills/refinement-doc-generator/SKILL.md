---
name: refinement-doc-generator
description: Generate dev-ready refinement documents (functional requirements specs) for CMS-based web components. Produces a structured markdown artifact with Description, CMS Properties table, Requirements, Performance, a standard Accessibility block, Questions, and Designs sections. Only use this skill when the user explicitly invokes it by name — e.g. "use the refinement-doc-generator skill" or "run the refinement doc skill". Do not trigger automatically from topic alone.
distribute: true
---

# Refinement Doc Generator

Generate dev-ready refinement documents for CMS components and features. The team uses these docs as the single source of truth for development and testing, and they get reviewed in refinement meetings where the Questions section is the primary collaboration tool.

The user works in QA/quality engineering at a digital agency building CMS-driven sites (Optimizely, Kentico, etc.). They speak fluent technical language — don't dumb anything down. British English throughout.

## The core workflow

**Generate the full document immediately. Do not ask the user clarifying questions conversationally before producing it.** The document itself is the collaboration tool — but it's a collaboration tool that makes assertions, not one that hands the meeting a blank. Refinement docs that punt every decision to Questions waste the meeting's time; refinement docs that assert reasonable defaults let the meeting focus on the things that actually need a decision.

1. Read the references below before drafting (they're short).
2. Analyse the input — bullets, design screenshot, acceptance criteria, user story, or combination.
3. Produce the complete document as a markdown artifact.
4. **Default to asserting.** Where a reasonable engineering or UX default exists, write it as a requirement and let refinement push back. Semantic HTML choices, keyboard and focus behaviour, button enable/disable rules, API timing relative to user actions, error location on forms, responsive patterns that follow site conventions — these are faster to assert and correct than to ask. The cost of an assertion the meeting rejects is a one-line edit; the cost of under-specifying is a longer meeting.
5. **TBC for the genuinely unknowable**: use `**TBC: [specifics]**` markers inline only where the input genuinely forecloses a decision — exact character limits, copy strings for empty states, client-specific integration behaviour, validation rules that depend on business logic, breakpoints the design doesn't show.
6. Mirror every TBC marker in the Questions section. Add questions beyond TBCs only where the meeting genuinely has to decide something you couldn't reasonably assert.

### Lifecycle note

These documents are living, not one-shot. Expect them to be edited in the refinement meeting: Questions get resolved by moving the answer into Requirements or CMS Properties and deleting the question; TBCs get replaced with concrete values. Write the draft knowing this — the first version's Questions section is the meeting agenda, not a permanent fixture.

## Reference files

Read these before you start drafting. They are short and together they define the house style.

- **`references/template.md`** — The canonical blank template. Your output's section order, table structure, and accessibility block must match this exactly.
- **`references/example-hero-block.md`** — A fully worked example showing how a finished spec looks, including how TBC-style gaps get framed as Questions.
- **`references/example-hero-block-alt.md`** — A second worked example for the same feature with different design decisions, useful for seeing how the same component shape accommodates different answers.
- **`references/refinement-approach.md`** — The agency's thinking on why refinement matters, the kinds of questions to ask, and the house view on CMS behaviour, property types, rendering edge cases, and responsive design.

When the input involves something covered in the approach guide (e.g. rich text editors, carousels, optional CTAs, responsive behaviour), lift the relevant categories of question directly into the Questions section — don't reinvent them.

## Output structure

Produce a single markdown artifact with this structure. The section order is fixed.

```markdown
# [Component/Feature Name]

Signed off for development: @[Name] [Date]

Description:
[1–2 paragraphs on what the component is and its purpose.]

## CMS Properties:

### Content tab

| Property Name | Property Type | Required | Property/Validation Info | CMS Helper Text |
|---------------|---------------|----------|--------------------------|-----------------|
| [Field] | [Type] | Yes/No | [Constraints or **TBC**] | "[Editor-facing helper text]" |

[Add Settings tab, Styling tab, etc. only if the input suggests they're needed.]

## Requirements:

1. [Atomic, testable, numbered requirement with technical detail.]
2. ...

## Performance Considerations:

[Optional. Include only when there's a feature-specific performance concern — image-heavy components, video, large carousels, third-party embeds, deferred rendering. Omit entirely for components where the only candidates would be generic boilerplate (e.g. "async save"). Generic boilerplate weakens the doc.]

1. [Specific, feature-relevant performance concern.]
2. ...

## Accessibility Requirements:

[The standard block — see below. Include verbatim, every time.]

## Questions:

1. [Specific, focused question for the refinement meeting.]
2. ...

## Designs:

[Link to Figma or screenshot. Note any missing states or discrepancies.]
```

### The Accessibility Requirements block (standard, verbatim)

This block is the same on every refinement doc. Include it exactly as written, unchanged. It's not feature-specific — any feature-specific accessibility concerns go in Questions.

```markdown
- All interactive elements must be accessible via tab key and have a clear focus state.
- All links, buttons and selectable elements to be fully accessible via keyboard functionality only, e.g. by Enter or Space keys.
- Tabbing order must be logical and be appropriate to the feature, e.g. modals, carousels.
- All images to have CMS fields for alt text and have the alt text correctly rendered on the frontend.
- All icons to have alt text hard-coded to prevent issues when using assistive technologies.
- All font must allow dynamic font sizes and styles, and any changes must not cause loss to functionality or legibility.
- All features must be accessible up to 200% zoom level without any loss to functionality or content.
- All features must be accessible up to 400% zoom level without any loss to functionality or content; a horizontal scroll bar should not be present.
- Any features with auto play or moving animation should have an option to pause/stop.
- Any auto-playing content/animations should only play when within the user's viewport.
- All features should be error-free when WAVE Chrome extension tool is applied.
- Any expandable elements should be decorated with an aria-expanded label that updates to true or false when open and closed.
- Any elements that update their content without reloading the page should be decorated with an aria-live label.
- aria-label, aria-labelledby & aria-describedby labels should be used to provide invisible labels where a visible label isn't present, e.g., on Icons or buttons.
- `<fieldset>` and `<legend>` should be used to group form controls, input fields and checkboxes.
- Content that is not visible or shouldn't be read by a screen reader should be decorated with an aria-hidden label.
```

## How to write good requirements

Each requirement should be:

- **Specific** — unambiguous where possible; use `**TBC**` where it isn't.
- **Testable** — a QA engineer can verify it. If you can't imagine the test case, the requirement isn't concrete enough yet.
- **Atomic** — one concept per numbered item. Don't pack layout, behaviour, and validation into one bullet.
- **Technical** — call out HTML semantics (e.g. "renders with an `<H1>` tag"), DOM behaviour, breakpoints, conditional rendering.

Cover, at minimum: layout and structure, responsive behaviour (desktop / tablet / mobile), conditional rendering when optional properties are empty, validation, default values, interaction behaviour, and any overrides.

For responsive behaviour specifically: always mention desktop and mobile; if tablet isn't in the design, flag it in Questions (per the approach guide, tablet designs are often skipped and need explicit clarification).

## How to write good CMS properties

- Choose the right type: String, Basic Rich Text / Full Rich Text, Image Picker, Video URL (String with validation), Colour Picker, Checkbox, Dropdown / Select One, Content Area, Content Reference.
- Be explicit about `Required` — use `Yes`, `No`, or `**TBC**`. Don't leave blank.
- Validation info should cover: accepted file types (JPEG, PNG, SVG), URL format requirements (e.g. "Must be a valid Vimeo URL"), min/max item counts, character limits, allowed RTE styles, colour swatch options.
- Helper text is editor-facing — write it how a CMS editor would want to read it, in sentence case, with a full stop. Keep it short.
- If Settings or Styling tabs are needed (theme toggles, layout variants), add them as separate `###` tables.

## How to write good Questions

Questions are the point of the document. They drive the refinement meeting. Aim for focused and specific — quality over volume.

Cover: character limits, optional-vs-required decisions, validation rules, error states, empty states, loading states, edge cases (e.g. carousel with one item, long text overflow), analytics/tracking, third-party integration behaviour, tablet behaviour if designs don't show it, animation/transition specifics, and any contradictions in the input.

Group related questions together when it helps readability. Number them — the team will reference them by number in the meeting.

Every `**TBC**` marker in the body should have a matching question. The inverse isn't required — some questions are about things that wouldn't appear as TBC (e.g. "do we need analytics tracking for video plays?").

## Input patterns

**Bullet points** — Infer structure aggressively from the listed elements. Each bullet usually maps to a CMS property or a requirement. Where the bullets don't specify validation, limits, or responsive detail, assert a reasonable default if one exists and mark genuine unknowns (copy strings, business-rule-specific limits) as TBC.

**Design screenshot** — Identify every visible component, text field, image area, interactive element, and colour choice. Infer CMS properties from what an editor would need to change. Assert house defaults for focus states, hover states, and keyboard behaviour. Raise questions for states genuinely not determinable from the design (error copy, loading behaviour, empty-state strings) and breakpoints not shown (typically tablet).

**Acceptance criteria (Given/When/Then or checkbox)** — Expand each criterion into its underlying CMS properties plus rendering requirements. AC tends to be thin, but thin input isn't licence to generate a big Questions section — assert reasonable defaults for everything the AC implies but doesn't state, and reserve questions for things the meeting has to genuinely decide.

**User story** — Extract the feature, the user type, and the goal. Build outward from there, asserting engineering and UX defaults for the specifics the story doesn't cover.

**Hybrid** — Treat each input type with its own pattern, then reconcile. If the design shows something the bullets don't mention (or vice versa), flag the discrepancy in Questions — contradictions are a genuine meeting topic.

## Style and tone

- British English throughout — `colour`, `behaviour`, `customise`, `optimise`, `centre`.
- Technical language is fine and expected. No explaining what an H1 tag is.
- Sentence case for requirement content; full stops at the end of each numbered item.
- Double quotes for CMS helper text (matches the examples).
- The `Signed off for development` line stays as `@[Name] [Date]` unless the user provides their name or date — don't invent either.

## Before you finish

Quick mental pass:

- All sections present, in the right order (Performance is optional — omit if there's nothing feature-specific to say).
- Accessibility block included verbatim.
- Every `**TBC**` has a corresponding question.
- Responsive behaviour stated or flagged for desktop and mobile at minimum.
- CMS properties have types and a Required value (even if `**TBC**`).
- Requirements assert reasonable defaults for things like save/discard behaviour, semantic HTML, keyboard handling — rather than punting them to Questions.
- Questions are focused, not a dump — cut anything that could reasonably have been asserted as a requirement instead.
- British English.

If in doubt about whether to assume or ask: prefer to assert a reasonable default and let refinement challenge it. Reserve TBCs and Questions for specifics that genuinely can't be decided from the input — copy strings, exact limits tied to design or business rules, client-specific integration behaviour.

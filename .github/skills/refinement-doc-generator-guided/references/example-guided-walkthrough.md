# Guided Walkthrough Example: Call-to-Action Banner

This example shows a complete guided session from start to finish — the question asked at each phase, a realistic answer from a non-technical team member, and the section that was generated as a result.

Use this to understand:

- What good answers look like at each phase
- How answers directly shape the output
- When to assert a default vs when to mark something TBC
- What the final assembled document should look like

---

## Phase 0 — Input triage

> **Question:** What is this component or feature called?

**Answer:** Call-to-Action Banner

> **Question:** What do you have to work from?

**Answer:** Figma designs and some notes from a meeting with the client.

_The user shares screenshots of the designs in the chat._

---

## Phase 1 — Description

> **Teaching note:** The description is the first thing a developer reads. It should answer 'what is this and where does it live?' rather than list every feature — think of it as the one-paragraph pitch for the component.
>
> **Question:** In one or two sentences, what does this component do and where does it appear on the page?

**Answer:** "It's a full-width coloured banner that sits between sections of a page. It has a headline, some text underneath, and a button that links somewhere."

> **Teaching note:** Knowing whether a component is always visible or only appears sometimes shapes the requirements — conditional components need an explicit requirement that spells out when they show and when they don't.
>
> **Question:** Is this component always visible on the page, or does it only appear under certain conditions?

**Answer:** Always visible — when an editor adds it to the page, it's always shown.

**Generated section:**

```
Description:
A full-width promotional banner designed to sit between content sections on a page. The
banner displays a headline, optional supporting text, and an optional call-to-action button
that links to an internal or external URL. It is always rendered when added to a page.
```

> **Why it looks like this:** The description stays high-level — it explains what the component is and what it contains, without listing every CMS field or requirement. That detail comes later. The phrase "always rendered when added to a page" is included because you told us it's always visible; if it were conditional, this sentence would describe the condition instead.

---

## Phase 2 — CMS Properties

_The wizard loops through each property one at a time. This example shows all five._

---

### Property 1: Headline

> **Question:** What is this field called?

**Answer:** Headline

> **Teaching note:** The field type determines what an editor can enter and what validation is possible. Pick the closest match — we can always adjust.
>
> **Question:** What kind of content does this field hold?

**Answer:** Short text — it's just a single line of text.

> **Teaching note:** Only choose 'Not sure' if a stakeholder genuinely needs to make this call. If the design always shows this field filled in, it's probably required.
>
> **Question:** Can an editor leave this field blank, or is it always needed?

**Answer:** Always required — the banner wouldn't make sense without a headline.

> **Teaching note:** If nothing has been specified, make a reasonable call. We'd rather assert a sensible default and let the meeting challenge it.
>
> **Question:** Are there any rules or limits for this field?

**Answer:** The designs don't say, but I'd guess it shouldn't be too long.

_Good answer. The user isn't sure, so we assert a sensible default (80 characters) and flag it in Questions._

> **Question:** What would you write next to this field to help a content editor use it correctly?

**Answer:** Something like "Enter the main headline for the banner."

---

### Property 2: Body Text

> **Question:** What is this field called?

**Answer:** Body Text

> **Question:** What kind of content does this field hold?

**Answer:** A paragraph or two — just text, no special formatting needed.

_"Just text, no special formatting" = Basic Rich Text. We assert this._

> **Question:** Can an editor leave this field blank, or is it always needed?

**Answer:** Optional — the designs show it with and without body text.

> **Question:** Are there any rules or limits for this field?

**Answer:** No, nothing specific.

> **Question:** What would you write next to this field to help a content editor use it correctly?

**Answer:** "Optional supporting text that displays below the headline."

---

### Property 3: Background Colour

> **Question:** What is this field called?

**Answer:** Background Colour

> **Question:** What kind of content does this field hold?

**Answer:** The editor picks from a list of brand colours — Navy, Teal, White, and Coral.

_"Pick from a list" = Dropdown._

> **Question:** Can an editor leave this field blank, or is it always needed?

**Answer:** Always required — every banner must have a background colour.

> **Question:** Are there any rules or limits for this field?

**Answer:** The four colours from the brand: Navy, Teal, White, Coral.

> **Question:** What would you write next to this field to help a content editor use it correctly?

**Answer:** "Select the background colour for the banner."

---

### Property 4: CTA Label

> **Question:** What is this field called?

**Answer:** CTA Label

> **Question:** What kind of content does this field hold?

**Answer:** Short text — it's the button label.

> **Question:** Can an editor leave this field blank, or is it always needed?

**Answer:** Optional — not every banner needs a button.

> **Question:** Are there any rules or limits for this field?

**Answer:** Probably shouldn't be too long for a button — maybe 50 characters?

> **Question:** What would you write next to this field to help a content editor use it correctly?

**Answer:** "The label for the call-to-action button. Required if a CTA URL is provided."

---

### Property 5: CTA URL

> **Question:** What is this field called?

**Answer:** CTA URL

> **Question:** What kind of content does this field hold?

**Answer:** A link to a page — could be internal or external.

_A link field = String with URL validation._

> **Question:** Can an editor leave this field blank, or is it always needed?

**Answer:** Optional — goes with the CTA Label.

> **Question:** Are there any rules or limits for this field?

**Answer:** It should be a valid URL.

> **Question:** What would you write next to this field to help a content editor use it correctly?

**Answer:** "The URL the CTA button links to. Required if a CTA label is provided."

---

**Generated section:**

```
## CMS Properties:

### Content tab

| Property Name    | Property Type    | Required | Translatable | Property/Validation Info                          | CMS Helper Text                                                                   |
|------------------|------------------|----------|--------------|---------------------------------------------------|-----------------------------------------------------------------------------------|
| Headline         | String           | Yes      | Yes          | Maximum 80 characters (**TBC**)                   | "Enter the main headline for the banner."                                         |
| Body Text        | Basic Rich Text  | No       | Yes          |                                                   | "Optional supporting text that displays below the headline."                      |
| Background Colour| Dropdown         | Yes      | No           | Options: Navy, Teal, White, Coral                 | "Select the background colour for the banner."                                    |
| CTA Label        | String           | No       | Yes          | Maximum 50 characters                             | "The label for the call-to-action button. Required if a CTA URL is provided."     |
| CTA URL          | String           | No       | No           | Must be a valid internal or external URL          | "The URL the CTA button links to. Required if a CTA label is provided."           |
```

> **Why it looks like this:** A few things to notice:
>
> - **Headline has a TBC** on the character limit because you said the designs don't specify it. We asserted 80 characters as a sensible default, but the meeting needs to confirm it. Every TBC gets a matching question.
> - **Body Text has no validation info** — that cell is blank, not TBC. You told us there are no specific constraints, so there's nothing to flag. Blank means "no constraint", not "we forgot to fill this in".
> - **Background Colour is Dropdown** because the editor picks from a fixed list. The four colour options are listed in Validation Info so developers know exactly what to implement.
> - **CTA Label and CTA URL are both optional** — they go together. The helper text on each field makes this dependency clear to the editor without needing a separate requirement.
> - **Translatable** is Yes for text fields (Headline, Body Text, CTA Label) and No for structural fields (Background Colour, CTA URL) — text changes per language, but URLs and colour choices typically don't.

---

## Phase 3 — Requirements

> **Teaching note:** Starting with layout helps developers understand the structure before they think about styling or behaviour.
>
> **Question:** Describe the layout — what's in this component and roughly where?

**Answer:** "Full width background. Headline at the top, body text below that, then the button at the bottom. Everything's centred."

> **Teaching note:** Responsive requirements are the most commonly missed. If mobile designs aren't available, we flag it as a question rather than guessing.
>
> **Question:** Do you have designs showing both desktop and mobile views?

**Answer:** Desktop only — the mobile design wasn't in the Figma file.

_Mobile is missing — we flag this in Questions and assert a sensible stacking default in Requirements._

> **Teaching note:** Every optional field needs a requirement describing what the component looks like without it.
>
> **Question:** For any optional fields — what happens if an editor leaves them blank?

**Answer:** "If there's no body text, the button should still appear. If there's no button, it just ends at the headline or body text."

> **Question:** Are there any interactions in this component?

**Answer:** No, it's static — just text and a button.

> **Question:** Are there any edge case states to consider?

**Answer:** I don't think so, it's pretty simple.

**Generated section:**

```
## Requirements:

1. The banner renders full-width with no maximum width constraint.
2. The Headline renders as an `<h2>` tag.
3. Content (Headline, Body Text, CTA button) is horizontally centred within the banner.
4. The background renders in the colour selected from the CMS — Navy, Teal, White, or Coral.
5. Text colour automatically inverts for legibility: white text on Navy and Teal backgrounds; dark text on White and Coral backgrounds. (**TBC**: confirm text colour logic with design.)
6. If Body Text is not provided, the CTA button (if present) renders directly below the Headline.
7. If CTA Label and CTA URL are both provided, a button renders below the Body Text (or Headline if Body Text is absent).
8. If either CTA Label or CTA URL is absent, the button is not rendered.
9. On desktop, the layout stacks vertically: Headline, then Body Text, then CTA button.
10. On mobile, the layout remains the same vertical stack with reduced horizontal padding. (**TBC**: confirm mobile layout with design.)
11. The CTA button uses the site's default primary button styles.
```

> **Why it looks like this:**
>
> - **Requirement 2 asserts `<h2>`** without asking you — that's a technical default. A banner sitting between sections of a page shouldn't use an H1 (there should only be one per page). This is the kind of thing the wizard handles automatically.
> - **Requirement 5 is TBC** because the text colour inversion logic is a business/design decision. We asserted the most likely behaviour, but the meeting needs to confirm it.
> - **Requirements 7 and 8 together** cover the CTA dependency — both fields present means show the button; either missing means hide it. This came directly from your description.
> - **Requirement 10 is TBC** because you only had desktop designs. We described a sensible default (same vertical stack, less padding) but the meeting should confirm this or provide mobile designs.

---

## Phase 4 — Questions

_The wizard compiles TBCs from Phases 1–3 and presents them._

> Compiled TBCs:
>
> - Headline character limit (asserted 80 — confirm?)
> - Text colour logic (white on dark, dark on light — confirm?)
> - Mobile layout (asserted vertical stack — need designs to confirm)

> **Question:** Do these look right? Anything to remove or add?

**Answer:** Those all look right. I'd also add — should we track button clicks for analytics?

> **Question:** Is there anything genuinely unknown about analytics, third-party integrations, or error handling?

**Answer:** Just the analytics question I mentioned.

**Generated section:**

```
## Questions:

1. What is the character limit for the Headline? We've asserted 80 characters as a default.
2. Should text colour automatically invert based on the selected background colour (white text on Navy/Teal, dark text on White/Coral), or should there be a separate Text Colour CMS property?
3. Mobile designs were not included in the Figma file — please provide mobile designs or confirm that the component stacks vertically with reduced padding on mobile.
4. Are there any analytics or tracking requirements for CTA button clicks?
```

> **Why it looks like this:** Four questions — one per genuine unknown. None of these could be worked out from the input or asserted as a confident default:
>
> - Q1: The character limit is a design/business rule, not a general convention.
> - Q2: The colour inversion logic needs a design decision, not just a technical one.
> - Q3: Missing designs can't be guessed.
> - Q4: Analytics requirements come from the client, not from us.
>
> Notice there are no questions like "should the button have a hover state?" — that's an engineering default we've already asserted, not something the meeting needs to decide.

---

## Phase 5 — Designs

> **Question:** Do you have a Figma link for this component?

**Answer:** Yes — https://www.figma.com/file/abc123/project-name?node-id=42

> **Question:** Are there any states or scenarios the designs don't show?

**Answer:** No mobile view, as mentioned. Otherwise I think the designs are fairly complete.

**Generated section:**

```
## Designs:

[Figma](https://www.figma.com/file/abc123/project-name?node-id=42)

**Missing from designs:**
- Mobile layout — flagged in Questions (Q3).
```

---

## Final assembled document

```markdown
# Call-to-Action Banner

Description:
A full-width promotional banner designed to sit between content sections on a page. The
banner displays a headline, optional supporting text, and an optional call-to-action button
that links to an internal or external URL. It is always rendered when added to a page.

## CMS Properties:

### Content tab

| Property Name     | Property Type   | Required | Translatable | Property/Validation Info                 | CMS Helper Text                                                               |
| ----------------- | --------------- | -------- | ------------ | ---------------------------------------- | ----------------------------------------------------------------------------- |
| Headline          | String          | Yes      | Yes          | Maximum 80 characters (**TBC**)          | "Enter the main headline for the banner."                                     |
| Body Text         | Basic Rich Text | No       | Yes          |                                          | "Optional supporting text that displays below the headline."                  |
| Background Colour | Dropdown        | Yes      | No           | Options: Navy, Teal, White, Coral        | "Select the background colour for the banner."                                |
| CTA Label         | String          | No       | Yes          | Maximum 50 characters                    | "The label for the call-to-action button. Required if a CTA URL is provided." |
| CTA URL           | String          | No       | No           | Must be a valid internal or external URL | "The URL the CTA button links to. Required if a CTA label is provided."       |

## Requirements:

1. The banner renders full-width with no maximum width constraint.
2. The Headline renders as an `<h2>` tag.
3. Content (Headline, Body Text, CTA button) is horizontally centred within the banner.
4. The background renders in the colour selected from the CMS — Navy, Teal, White, or Coral.
5. Text colour automatically inverts for legibility: white text on Navy and Teal backgrounds; dark text on White and Coral backgrounds. (**TBC**: confirm text colour logic with design.)
6. If Body Text is not provided, the CTA button (if present) renders directly below the Headline.
7. If CTA Label and CTA URL are both provided, a button renders below the Body Text (or Headline if Body Text is absent).
8. If either CTA Label or CTA URL is absent, the button is not rendered.
9. On desktop, the layout stacks vertically: Headline, then Body Text, then CTA button.
10. On mobile, the layout remains the same vertical stack with reduced horizontal padding. (**TBC**: confirm mobile layout with design.)
11. The CTA button uses the site's default primary button styles.

## Accessibility Requirements:

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

## Questions:

1. What is the character limit for the Headline? We've asserted 80 characters as a default.
2. Should text colour automatically invert based on the selected background colour (white text on Navy/Teal, dark text on White/Coral), or should there be a separate Text Colour CMS property?
3. Mobile designs were not included in the Figma file — please provide mobile designs or confirm that the component stacks vertically with reduced padding on mobile.
4. Are there any analytics or tracking requirements for CTA button clicks?

## Designs:

[Figma](https://www.figma.com/file/abc123/project-name?node-id=42)

**Missing from designs:**

- Mobile layout — flagged in Questions (Q3).
```

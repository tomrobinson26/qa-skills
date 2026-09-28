---
name: accessibility-tree-mockup
description: >
  Generates a pre-development accessibility tree mockup (roles, accessible names, descriptions,
  states and hierarchy as a browser's accessibility inspector or screen reader would expose them)
  from a design screenshot, Figma frame, wireframe, content model, refinement doc or UI description.
  Built for CMS features: marks each accessible string as an editor field, site dictionary string or
  computed value, and flags where the CMS needs NEW text (alt text, iframe titles, region labels,
  link context, captions). Covers landmarks, content blocks, navigation, forms and errors, tables,
  dialogs, tabs, accordions, carousels, comboboxes, live regions and focus. Use whenever the user asks
  for an "accessibility tree", "a11y tree", "ARIA tree", "what a screen reader would get", semantic
  structure for a design, name/role/state gaps, or accessibility input to refinement or content
  modelling, even without the exact term.
metadata:
  author: Tom Robinson - tom.robinson@msqdx.com
  version: "1.0.0"
---

# Accessibility tree mockup

This skill turns a visual design into the structure that actually reaches a screen reader user.
That's not what the design looks like, but what it _announces_. The point is to catch gaps before
they're built: missing or duplicate accessible names, headings at the wrong level, live regions that
would stay silent or spam, decorative content that shouldn't be announced, and, on CMS builds, text
the tree needs that nobody has given a home in the content model.

The team uses it in **pre-development**, to model components in an accessible-first way. Its output feeds the refinement meeting,
the content model, test scripts, development and Playwright locators.

## Reference files

Read the ones that apply **before** drafting. Getting these details right from memory is
where trees go subtly wrong.

| File                                  | Read when                                                                                                                                                                                    |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `references/naming-and-roles.md`      | Always. It covers how names and descriptions are computed, the HTML to role mappings that catch people out, children-presentational roles, naming-prohibited roles, and inspector vocabulary |
| `references/cms-text.md`              | Always for CMS features. It covers the four text sources, the triggers for new CMS fields, rich text risks and the Accessible text requirements table format                                 |
| `references/patterns.md`              | When the design contains any component beyond plain headings and text: cards, navigation, forms, tables, dialogs, disclosure widgets, carousels, media, messaging                            |
| `references/dynamic-content.md`       | When anything changes after load: filtering, validation, loading, expand/collapse, dialogs, toasts, timers, carousels                                                                        |
| `references/example-card-carousel.md` | A worked example of the full output. Skim it the first time you use the skill, to calibrate the level of detail                                                                              |

## The core discipline: function first, then markup

Design tools describe things by appearance ("green banner", "level 2 header", "orange button"). None
of that is what matters here. For every distinct element, ask:

1. **What is it for**, in a screen reader user's terms? A heading that introduces the block, a
   control that submits or navigates, a status message, a decorative flourish.
2. **Is it always present**, or conditional on data or state? Optional CMS fields, validation
   errors, expanded panels, breakpoints.
3. **Does it change after load** without a page reload? If so, how is the change conveyed: a
   state attribute, a focus move, or a live announcement? And how often, without becoming noise?
4. **Is it decorative?** If removing it would lose no information, it doesn't appear in the tree at
   all.
5. **Where does its text come from?** An editor field, a site dictionary string, a computed value,
   or nowhere yet. The last one is a finding.

Resist the pull to describe the tree the way the screenshot looks. A purple heading on white is
visual information; `heading "Latest news" [level 2]` is what's actually in the tree.

Prefer native HTML semantics. The first rule of ARIA is that a native element beats an ARIA role,
and a tree full of custom roles is a red flag. Recommend the native element unless there's a reason
not to (`<button>`, `<a href>`, `<dialog>`, `<details>`, `<fieldset>`, `<table>`, `<select>`).

## Workflow

**Produce the full mockup straight away.** Assert reasonable defaults and flag them. Don't hold
back the whole output for questions. Ask first only when the answer would change the tree's
_shape_ ("is this one field or three?", "is this a page or a block?"), and then ask just that.
Anything else becomes an assumption in the Context line or a question in Risks.

1. **Gather the inputs.** Get the design (every state and breakpoint provided) and the content
   model or refinement doc if there is one. If a content-modelling skill for the platform is
   available and no model exists yet, use it to derive property names rather than inventing them
   (see _Field-driven trees_ below).
2. **Establish the placement context.** This decides heading levels and landmark names:
   - Is it a page template, or a block in a content area?
   - Can it appear more than once on a page?
   - What heading level is it likely to sit under? Default: a block in the main content area takes
     `h2` for its own heading, configurable if it can be placed deeper.
   - Is the site multilingual?
     State these as assumptions in the Context line.
3. **Inventory by function** using the core discipline. Watch for icon-only controls, disabled
   states, grouping conveyed only by spacing, and visual order that differs from sensible reading
   order.
4. **Build the default-state tree** using the notation below and the pattern reference.
5. **Add variants** only where the tree differs:
   - optional fields empty
   - expanded or selected states
   - error state
   - loading or empty results
   - a mobile layout that changes structure (tabs becoming an accordion, a nav becoming a menu
     button)
6. **Describe the behaviour** for anything dynamic: the trigger, the tree change, where focus goes,
   and what's announced.
7. **Classify every string** as an editor field, dictionary string or computed value, and produce the
   Accessible text requirements table. Flag each **NEW** field or string the CMS or dictionary needs.
8. **Write the risks and decisions.** These are real findings only.

## Output format

````markdown
# Accessibility tree: [Feature name]

**Context:** [placement and heading-level assumptions · multiple instances? · multilingual? · input
used (design / content model / description) · vocabulary: ARIA/Chrome]

## Tree: default state

```
[tree]
```

## Variants

### [State name, e.g. "Optional fields empty", "Expanded", "Error", "Mobile < 768px"]

```
[only the part of the tree that differs, with enough parent context to locate it]
```

## Behaviour

| Trigger | Tree change | Focus | Announcement |
| ------- | ----------- | ----- | ------------ |

## Accessible text requirements

[table per references/cms-text.md §5, or one line: "No additional CMS text required: every
accessible name comes from an existing visible field or a standard dictionary string."]

## Risks and decisions

1. **[Dev | Content | Design | Refinement]** [the finding, why it matters, the WCAG SC if relevant,
   and the recommendation]
````

- Omit **Variants** or **Behaviour** entirely when there's nothing to put in them. Don't leave
  empty headings.
- Keep the whole thing scannable. The tree is the product; the tables and risks are the
  annotations.

### Tree notation

Use the shape Chrome DevTools' accessibility tree uses: indentation for containment, the role
first, the accessible name in quotes, then states and properties.

```
role "accessible name" [state, property=value] — note
```

- Use `├─` / `└─` / `│` connectors for hierarchy.
- **Roles** use the ARIA/Chrome vocabulary (`heading`, `link`, `button`, `navigation`, `region`,
  `image`, `list`, `listitem`, `textbox`, `combobox`, `group`, `dialog`, `status`), not Firefox's
  platform names. This keeps the tree mappable to `getByRole` and axe.
- **States and properties** use Chrome's names: `level 2`, `expanded=false`, `selected`,
  `checked=mixed`, `pressed=false`, `current=page`, `required`, `invalid=true`, `disabled`,
  `modal=true`, `haspopup=menu`, `valuetext="…"`, `live=polite`, `busy`. Put a description on its
  own line beneath the node as `description: "…"` when it matters. `disabled` covers both
  mechanisms, so add a note saying which: native `disabled` (removed from the tab order) or
  `aria-disabled` (stays focusable).
- **Text sources** use the markers from `cms-text.md`: `{{Editor field}}`, `[[dictionary.key]]`,
  `‹computed: …›`. Literal text in quotes means real copy from the design that is fixed (rare on a
  CMS build: say why it's fixed).
- **Omit** decorative elements and unnamed `generic` wrappers. If a decision to hide something is
  itself important (a decorative image, a hidden duplicate link), add a one-line parenthetical note
  rather than a node, e.g. `(card image: alt="", decorative — heading carries meaning)`.
- **Conditions** go in trailing notes: `— only if {{Strapline}} filled`, `— hidden while collapsed`,
  `— while validation error exists`.
- **Never nest** headings, links or lists inside children-presentational roles (`button`, `tab`,
  `checkbox`, `radio`, `switch`, `option`, `img`…). The browser flattens them, and the tree must
  show what the user actually gets.
- **Name vs content.** A quoted string after the role is the accessible **name**. If a role can't
  be named (`paragraph`, `caption`, `generic`, `strong`, `time`…) or its meaningful text isn't its
  name (`status`, `alert`, `log`, `blockquote`), show its text **content** after a colon instead:
  `paragraph: "{{Intro}}"`, `status: "‹computed: [[search.resultsCount]]›"`. This matters
  downstream: `getByRole('paragraph', { name })` never matches, but `getByRole('status')` with
  `toHaveText` does.
- Keep names short and realistic. When working from real copy, use it; otherwise use field markers.

### Behaviour table

Include this for any dynamic feature. Follow `dynamic-content.md`:

- **Decide focus vs announcement vs neither.** Never both for the same change.
- **Announcements come from a live region that already exists and is empty.** Name it in the tree
  (`status — empty until results update`).
- **Say where focus goes on open, and where it returns on close.**
- **Say how noisy updates are throttled** (debounce, milestones only, off while auto-rotating).

### Accessible text requirements

This section is what makes the skill useful on CMS builds. It answers: **does this tree need text
that the CMS doesn't have yet?**

- **List every string the tree needs that isn't already a visible, existing editor field.** Typical
  entries: alt text and decorative flags, embed titles, captions and transcripts, table captions,
  region and landmark labels, visually-hidden link context, heading-level settings, form hints and
  error messages, and dictionary strings for component chrome ("Next slide", "Close", "opens in a
  new tab").
- **Mark each one** `Editor field — NEW`, `Dictionary — NEW`, `Computed`, or `existing`. Lead with
  the NEW items. They're the flag.
- **Keep dictionary strings out of block properties.** Component chrome that's identical on every
  instance is a translatable dictionary string, not a block property. This matches the
  `optimizely-content-modelling` rule on design-system constants.
- **Computed strings still need dictionary templates.** For example, "{x} of {y}" and
  "{count} results", with plural forms.
- **When no additional CMS text is needed**, say so in one line. That's a useful result too.

### Risks and decisions

Flag the things a build ticket, content guide or refinement meeting actually needs. Tag each with
the audience:

- **Dev**: markup, focus, live region, or support risks. Examples: `aria-roledescription` support,
  Safari list semantics, `display: contents`, `aria-errormessage`.
- **Content**: governance risks the CMS allows but can't prevent. Examples: duplicate or generic
  CTA labels, alt text left generic, skipped heading levels in rich text, optional fields whose
  absence removes a name.
- **Design**: the design itself creates the problem. Examples: an image of text, an icon-only
  control with no visible label, meaning conveyed by colour alone, a hover-only reveal, a sticky
  layer that will obscure focus, a hidden heading the design should really show.
- **Refinement**: a decision the team has to make. Examples: the heading level setting vs a
  computed level, the fallback when the optional heading is empty, moving focus vs announcing on
  "Load more".

Cite the WCAG 2.2 success criterion where one applies (e.g. 2.5.3 Label in Name, 4.1.3 Status
Messages). The target is WCAG 2.2 AA.

If nothing is genuinely at risk, say so briefly. Don't manufacture findings or restate the tree.

## Field-driven trees (CMS/data-backed content)

When the tree should reflect what an editor or system populates rather than literal design copy:

1. **Derive the property names from a content model.** If this session has a content-modelling skill
   for the platform (e.g. `optimizely-content-modelling`) and no model exists yet, use it first. If a
   refinement doc or content model was provided, use its property names exactly.
2. **Substitute field markers for the literal design text.** Use `{{Property name}}` in place of the
   copy.
3. **Keep editor values and system values distinct.** A countdown, a result count, a slide position
   or a file size is never a CMS field, and presenting it as one misleads whoever builds from the
   model.
4. **Model the empty cases.** For every optional field, check what else depends on it. If an
   optional heading also names the region and parents the card headings, its absence changes the
   tree. Show that variant and flag the fallback decision.
5. **Carry forward editor-created risks.** Two free-text CTA fields mean an editor _can_ enter the
   same label twice, even though the schema doesn't force a collision. Flag this as a content
   governance or QA check, not a dev fix.
6. **Rich text is constrained, not mocked.** State what the RTE must allow and forbid, and show a
   representative fragment marked as such (`cms-text.md` §4).

## Handing off to other pre-development skills

When the user is also producing a refinement doc or content model, or asks to feed the tree into
one:

- **`refinement-doc-generator`**
  - **NEW editor fields** become rows in its CMS Properties table, using its columns: Property
    Name, Property Type, Required, Property/Validation Info, and CMS Helper Text. Map types to its
    vocabulary (String, Basic Rich Text, Checkbox, Image Picker, Dropdown / Select One). Required
    is Yes, No or **TBC**, with conditional rules in Validation Info. Helper text goes in double
    quotes.
  - **Risks tagged Refinement** become numbered Questions. That skill says feature-specific
    accessibility concerns go in Questions.
  - **Settled Dev points** can become Requirements, under its assert-reasonable-defaults rule, when
    they're unambiguous assertions. For example: "The carousel's slide wrapper has
    `aria-live="off"` while auto-rotating."
  - **Never edit its verbatim Accessibility Requirements block.**
- **`optimizely-content-modelling`**
  - **NEW editor fields** become rows in its table format: Property name, Field type, Required,
    Translatable, Rules and limits, and Helper text shown to editors. Helper text is unquoted.
    Conditionally required fields are `No`, with the dependency explained in the helper text.
  - **Dictionary strings** are listed separately as translation keys, never as properties.
- **`content-model-test-data`**: suggest edge-case records that exercise the tree. Examples: optional
  heading empty, very long alt text, a duplicate CTA label, one carousel slide.
- **`qa-test-script-generator` / `playwright-test-writer`**: each `role "name"` node is a
  testable assertion and a `getByRole` locator. Each Behaviour row is a Given/When/Then.

Only do the hand-off when asked, or when the other skill is clearly part of the same task. Otherwise,
mention in one line that it's available.

## Working from an upload, Figma or a description

- **Screenshots and exports.** Look closely before mapping. Icon-only controls, greyed-out disabled
  states, carousel dots, visually hidden-looking text, and grouping conveyed only by spacing are
  easy to miss on a skim. If only one state is shown, assume the others exist, and list the missing
  states in Risks (tagged Design).
- **Figma links.** If Figma tools are available, pull the frame screenshot and layer structure. Layer
  names and component names hint at intent ("Card / Featured", "Accordion item"), but they aren't
  semantics. Follow the Figma skill's prerequisites before calling its tools.
- **Written descriptions.** Ask for missing structural detail only when it would change the tree's
  shape. Don't stall on cosmetic ambiguity.
- **Multiple breakpoints.** If mobile and desktop differ in _structure_, not just layout, show the
  mobile tree as a variant.

## Before you finish

A quick pass:

- **Names.** Every interactive node and every naming-required role has a name. No role words in
  names. No names on naming-prohibited roles.
- **Label in Name (2.5.3).** Wherever a visible label exists, the accessible name contains it,
  ideally at the start.
- **Headings.** Levels are hierarchical within the stated context. Card headings sit one level below
  the block heading.
- **Nesting.** Nothing is nested inside a children-presentational role.
- **Landmarks.** Every page-level section a user would jump to is a named landmark (a `main` with
  nothing inside it is a gap). Sub-parts of components aren't landmarks. Duplicates are uniquely
  labelled. Regions named by optional headings have a fallback.
- **Coverage.** Every conditional element carries its condition. Every dynamic change has a
  Behaviour row.
- **Text sources.** Every string is marked editor, dictionary or computed. NEW items are listed in
  the Accessible text requirements table.
- **Risks.** They are real, tagged, and point to a specific decision or action.

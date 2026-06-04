---
name: optimizely-content-modelling
description: Produces a structured content model table for Optimizely blocks, pages, or components from a design screenshot, wireframe, or bullet-point brief. Use this skill whenever the user asks for a "content model", "property list", "block model", "block properties", "page type schema", or wants to translate a design into Optimizely fields — including when they drop in a screenshot, Figma export, or rough list of elements and expect field types, required flags, and editor guidance back. Also trigger when the user mentions Optimizely field types (XhtmlString, ContentArea, ContentReference, SelectOne, etc.), asks to "model this block", "define the properties for", or wants editor helper text written for CMS properties. The skill covers both Optimizely CMS PaaS (CMS 12, .NET attributes) and SaaS / Visual Builder, and flags where the two differ.
metadata:
  author: "Tom Robinson - tom.robinson@msqdx.com"
  version: "1.0.1"
---

# Optimizely content modelling

Turn a design (screenshot, wireframe, or bullet-point brief) into a proposed Optimizely content model, expressed as a single table that an editor, developer, and analyst can all read without translation.

## What the user wants

When someone asks for a content model, they want the bridge between a visual design and the properties a developer will actually create. The table is that bridge. It needs to be:

- **Unambiguous for the developer** — the field type maps to a real Optimizely property type.
- **Honest about constraints** — max lengths, allowed content types in a ContentArea, option lists for a SelectOne.
- **Useful for the editor** — the helper text explains what the field is *for*, not just what it is.
- **Translatable-aware** — multi-language sites live or die by this flag being right.

Output nothing except the table (and, when warranted, a short note above or below it explaining a PaaS/SaaS divergence or a judgement call). No preamble, no section headers, no "here's your content model" throat-clearing.

## The output format

Always use exactly this table structure:

```
| Property name | Field type | Required | Translatable | Rules and limits | Helper text shown to editors |
|---------------|------------|----------|--------------|------------------|------------------------------|
| Heading       | Plain text | Yes      | Yes          | Max 80 characters | Shown as the block's main heading. |
```

Column rules:

- **Property name** — sentence case, as an editor would read it in the CMS UI (e.g. "CTA label", not `ctaLabel` or `CtaLabel`). One property per row. No developer-style camelCase unless the user has explicitly asked for the internal name.
- **Field type** — use the names from the field type reference below. Default to the platform-agnostic name; if the user has specified PaaS or SaaS, use that flavour's naming.
- **Required** — `Yes` / `No`. Default to `No` unless the field is genuinely load-bearing (a heading on a hero, the image on an image block, the target URL on a CTA). Over-requiring is a common editor pain point.
- **Translatable** — `Yes` / `No`. Default to `Yes` for any human-readable text. Default to `No` for structural choices (toggles, variant selectors, image references, content references, dates, colours). See the translatable defaults section below.
- **Rules and limits** — character limits, item counts, allowed content types, value lists, aspect ratio guidance, file size caps. Be specific ("Max 80 characters" not "keep it short"). Omit a character limit when the text is structural/labelling and the design doesn't require a specific count — see the character-limit guidance below.
- **Helper text shown to editors** — one sentence, written *to the editor*, explaining what the field does and any non-obvious constraint. Avoid "Enter the heading here" style tautology — say something useful like "Appears above the block; keep it action-oriented."

## Field types

The table below lists field types in platform-agnostic language (what to use by default), with the PaaS and SaaS equivalents in brackets. Use the agnostic name unless the user has said which flavour they're targeting.

### Text
- **Plain text** (PaaS: `String` / SaaS: `String`) — single-line text. Use for headings, labels, short captions. Set a character limit when the text affects layout (see the character-limit guidance below for when to omit).
- **Long text** (PaaS: `LongString` / SaaS: `LongString`) — multi-line plain text. Use for short paragraphs, SEO descriptions, image alt text that might run long.
- **Rich text** (PaaS: `XhtmlString` / SaaS: `XhtmlString` or `RichText`) — formatted text with inline links, bold, lists. Use for body copy. Always specify which toolbar/formatting is allowed in rules (e.g. "Bold, italic, links only — no headings").
- **URL** (PaaS: `Url` / SaaS: `Url`) — a URL, internal or external. Prefer `ContentReference` for internal links where possible — it survives page moves.

### Choice
- **Single select** (PaaS: `[SelectOne]` attribute / SaaS: `SelectOne`) — one option from a fixed list. Use for variant pickers, layout switches, theme choices. List the options in rules.
- **Multi select** (PaaS: `[SelectMany]` / SaaS: `SelectMany`) — several options from a fixed list. Use sparingly — if editors need this often, consider a tag or category field instead.
- **Toggle** (PaaS: `Boolean` / SaaS: `Boolean`) — yes/no switch. Name it so the "on" state reads naturally ("Show author byline", not "Author byline visibility").
- **Number** (PaaS: `Number` or `FloatNumber` / SaaS: `Integer` or `Float`) — a numeric value. Always give a min/max in rules — "Max number of items: between 1 and 12".

### References
- **Content reference** (PaaS: `ContentReference` / SaaS: `ContentReference`) — a link to a single piece of content. Specify the allowed types in rules ("Articles only", "Any page").
- **Content area** (PaaS: `ContentArea` / SaaS: `ContentArea`) — a list of content items, usually blocks. Specify allowed types and a max item count. This is the workhorse of Optimizely composition — use it for featured content, card lists, anything with "up to N items".
- **Media reference** (PaaS: `ContentReference` with `UIHint = "image"` / SaaS: `ContentReference` with image allowed types) — a reference to an image, video, or document in Media. Specify allowed media types and aspect ratio guidance.

### Dates and structured values
- **Date** (PaaS: `DateTime` / SaaS: `DateTime`) — a date, with or without time. Say which in rules.
- **Colour** (PaaS: custom property with `UIHint` / SaaS: `String` with selection factory) — a colour value. Prefer a fixed palette (single select of tokens) over a free colour picker — it keeps brand consistency.

### Visual Builder / SaaS specifics
- **Sections** (SaaS only) — Visual Builder sections expose their own slots and styles. If the design is clearly a VB page, note this above the table rather than trying to cram section composition into property rows.
- **Styles** (SaaS: `Style` / PaaS: approximate with `SelectOne`) — presentation variants attached to a component. In SaaS these are first-class; in PaaS they're conventionally modelled as a "Display variant" single select. If the design shows multiple visual treatments of the same block, flag this as a Styles candidate in SaaS or a variant select in PaaS.

## Translatable defaults

Getting this column right is the difference between a localisation team that thanks you and one that raises three tickets a week. Default reasoning:

- **Translatable = Yes** for: any property whose value is human-readable text shown on the page (headings, body copy, labels, alt text, CTA text, SEO title/description).
- **Translatable = No** for: structural choices (display variant, layout toggle, number of items), references (ContentReference, ContentArea — the referenced content carries its own language), media references (the image is the image in every locale), dates, colours, URLs to external sites, boolean toggles.
- **Consider carefully**: an internal URL override — usually No, but if the site has different internal link targets per market, Yes.

When in doubt, state the assumption in the helper text so the editor knows.

## Rules-of-thumb character limits

Unless the user gives you limits, default to these and mention them in the helper text so editors know:

- **Heading / title**: 60–80 characters
- **Subheading / strapline**: 120 characters
- **Short description / card summary**: 160 characters (fits a meta description too)
- **CTA label**: 25 characters
- **Long description / intro copy**: 500 characters, or use rich text if formatting is needed
- **SEO title**: 60 characters
- **SEO description**: 160 characters
- **Alt text**: 125 characters

### When to omit the limit

Character limits matter for text that affects layout on the page — headings, straplines, card summaries, CTA buttons. For **structural or label text** — field labels on a form, section headings on a profile tab, small UI strings whose length the design constrains visually — omit the limit unless the design actually has a specific breakpoint at a specific count. Writing a number where the design doesn't require one invites a refinement debate ("why 40 and not 50?") that doesn't matter. State the default value in rules instead, and trust the design system.

## Is this a CMS property or a design-system constant?

Before adding a property, ask: would the value be identical on every instance of this component across the site? If yes, it's a design-system constant (a hard-coded string, a design token, a component prop), not a CMS property. Modelling constants as properties creates maintenance surface for no editor benefit — editors get a field they'll never change, and any change has to be made in N places instead of one.

Common false positives:

- **Icon choices** where the icon is fixed by the component's identity — a search icon on a search field, a lock icon on a login form. The icon is the component, not a configuration.
- **Alt text / aria-labels on icons that are part of the component chrome** — these should be hard-coded (and translated via the site's string catalogue), not editor-set. Contrast with alt text on content imagery, which is always editor-set.
- **Toggles that exist "in case" someone wants them** — default-on toggles that no one will ever change. If there's no concrete reason an editor would flip it, don't model it.
- **Explanatory copy that's the same wherever the component appears** — helper text, legal boilerplate, microcopy that's uniform across instances. Belongs in the design or a shared string catalogue, not as a property on every instance.

When in doubt, ask: has the design or the brief shown this varying across pages? If not, don't model it.

## Required-field restraint

Editors hate aggressive required flags, especially on blocks used across many pages where a field only applies sometimes. Default posture:

- **Required**: the one or two fields without which the block is visually broken or semantically meaningless (the heading on a hero, the image on an image block, the target on a CTA, the article list source on a feed).
- **Not required**: everything else, including fields that "should usually" be filled. Use helper text to nudge instead.

If a field's presence depends on another field's value (e.g. "Description" only matters when "Show description" is on), mark it Not required and explain the dependency in helper text.

## Reading the input

### Screenshots and wireframes

Identify each distinct editable element — text, image, CTA, list of items, variant/layout choice. For each, ask:

1. What is this, in editor language? (Not "h2", but "Section heading".)
2. Is it one value, a choice from a set, or a list?
3. Is it always there, or does the design show it as optional / conditionally shown?
4. Is it human-readable text (likely translatable) or a structural choice (likely not)?

A repeated card pattern is almost always a ContentArea of a smaller block, not N sets of fields on the parent. Call this out — it's the single most common modelling improvement.

### Bullet-point briefs

Take the user's names as a starting point but fix them to editor-friendly sentence case. If the brief says "heading text", the property name is "Heading". If the brief includes obvious technical shorthand ("CTA", "RTE", "CA for featured items"), expand it in the property name and preserve the intent.

If the brief lists toggles like "truncate headings [toggle]" — those are Boolean fields, Not required, Not translatable, with helper text explaining what the toggle controls on the rendered page.

## Judgement calls to flag

Add a one-line note *above* the table when any of these apply:

- The design implies a repeating pattern that should be modelled as a child block in a ContentArea rather than as flat properties. State the parent block and the child block names.
- The input is clearly a Visual Builder page rather than a single block — suggest it be split into a page type with sections.
- PaaS and SaaS would model something materially differently (e.g. Styles vs display variant).
- A field in the input looks like it should be a Category or Tag rather than a SelectOne on the block.

Keep notes short — one line each. Don't lecture.

## Examples

### Example 1: Simple hero block from a screenshot

Input: screenshot of a hero with a heading, short strapline, a CTA button, and a background image.

Output:

| Property name | Field type | Required | Translatable | Rules and limits | Helper text shown to editors |
|---|---|---|---|---|---|
| Heading | Plain text | Yes | Yes | Max 80 characters | The main hero heading. Keep it punchy and action-oriented. |
| Strapline | Plain text | No | Yes | Max 120 characters | Supporting line below the heading. Leave blank to hide. |
| CTA label | Plain text | No | Yes | Max 25 characters | Button text. Use a verb — "Get started", "Book a demo". |
| CTA link | Content reference | No | No | Any page or external URL | Where the button goes. Leave blank to hide the button. |
| Background image | Media reference | Yes | No | Image only. Landscape, min 1920×800px. | Full-width background. Avoid busy imagery behind the text area. |

### Example 2: A refactored multi-variant article block (from a bullet brief)

Input: bullet list covering a "Featured articles carousel", "Most popular leaderboard", "Topic carousel" — all with similar fields but some variant-specific.

Output:

> Modelled as a single block with a variant selector. Where a field only applies to some variants, the helper text says so.

| Property name | Field type | Required | Translatable | Rules and limits | Helper text shown to editors |
|---|---|---|---|---|---|
| Display variant | Single select | Yes | No | Options: Latest news grid, Featured carousel, Most popular leaderboard, Topic carousel, Specialism segment | Controls the block's layout and how articles are sourced. |
| Heading | Plain text | No | Yes | Max 80 characters | Heading shown above the article list. Leave blank to hide. |
| Description | Rich text | No | Yes | Bold, italic, links only. Max 300 characters. | Intro copy below the heading. Not shown on "Latest news grid". |
| Featured articles | Content area | No | No | Article pages only. Max 8 items. | Used by Featured, Most popular, and Specialism variants when the source is manual. |
| Category | Content reference | No | No | Category taxonomy only | Used by Topic carousel and Specialism variant when sourcing articles by category. |
| Max items to load | Number | No | No | Between 3 and 12. Defaults to 6. | How many articles the block shows. Ignored by Most popular leaderboard. |
| Show "View all" button | Toggle | No | No | — | Adds a link to the category or listing page below the articles. |
| Show author images | Toggle | No | No | — | Displays author avatars on each article card. |
| Truncate headings | Toggle | No | No | — | Cuts long article headings to one line on the card. |
| Truncate descriptions | Toggle | No | No | — | Cuts long article summaries to two lines on the card. |

### Example 3: What not to do

Don't do this:

| Property | Type | Req | Trans | Notes | Help |
|---|---|---|---|---|---|

Stick to the full column headings. They map to real CMS concepts and shorthand loses that.

Don't do this either:

| Heading | String | true | true | none | Enter the heading. |

"String" is internal. "Enter the heading" is worthless. "None" in rules is often a missed opportunity — set a character limit when the text affects layout (headings, straplines, card summaries, CTAs), an item count for lists, and an allowed-types list for references. For structural/label text where the design doesn't require a specific count, it's fine to leave the limit off and state the default value instead.

## Scope of a single response

One model per response. If the input clearly contains multiple distinct blocks or a page composed of several blocks, either:

- Ask the user which block they want modelled first, or
- Produce one table per block, each with its own one-line heading naming the block.

Don't invent extra blocks beyond what the input shows. If the input is a hero, model the hero — not the hero, the card grid below it, and the footer.

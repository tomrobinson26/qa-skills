# Accessible text in a CMS: where every string comes from

Most features built with this skill are CMS blocks or pages whose visible text is editor-authored. The accessibility tree, though, often needs text that **isn't visible in the design** — alt text, an iframe title, a region label, the "about {article}" context on a Read more link, "Slide 2 of 5". Every one of those strings has to come from somewhere. If nobody decides where, it's hard-coded in English, or it's missing.

This reference covers how to classify each piece of accessible text, what to propose when the CMS needs a new field, and the triggers that most often call for one.

Sources: ATAG 2.0 Part B (https://www.w3.org/TR/ATAG20/, https://www.w3.org/TR/IMPLEMENTING-ATAG20/), WCAG 2.2 Understanding docs, the WAI images/tables/forms/carousels tutorials, GOV.UK Design System and GOV.UK content guidance.

---

## 1. The four sources

Classify every quoted name, description and announcement in the tree into exactly one of these:

| Source | What it is | Where it lives | Translatable | Marker in tree |
| --- | --- | --- | --- | --- |
| **Editor field** | Varies per instance of the block/page | A CMS property on the block, page, or media asset | Yes (culture-specific) | `{{Property name}}` |
| **Site dictionary** | Identical wherever the component appears — component "chrome" | Localised string catalogue: Optimizely `LocalizationService` / language XML or a site-settings labels block; Kentico resource strings; Umbraco Dictionary; Storyblok datasource; or the front-end i18n bundle | Yes (per language, set once) | `[[dictionary.key]]` |
| **Computed** | Derived at render time from data or state | Template / JS | Composed from dictionary templates + data | `‹computed: description›` |
| **Author-fixed** | Not language text at all: roles, states, relationships, `alt=""` on decorative chrome | Markup | n/a | not quoted |

Use the markers consistently in the tree so a reader can see at a glance where every string comes from, for example:

```
region "{{Heading}}"
├─ heading "{{Heading}}" [level ‹computed: from Heading level setting›]
├─ link "{{CTA label}} [[a11y.opensInNewTab]]" — suffix only when {{Open in new tab}} is on
└─ status: "‹computed: [[search.resultsCount]] with n›"
```

### Deciding editor field vs dictionary

Ask: **would this string be the same on every instance of the component across the site, in a given language?**

- **Yes** → dictionary. Examples: "Next slide", "Close", "Main" (nav label), "Skip to main content", "opens in a new tab", "Required", "Error:", "Show all sections", "Breadcrumb", "Page {n}". Icon labels and component chrome are design-system constants, not per-instance properties. Don't model them as block properties.
- **No, it depends on the content** → editor field. Examples: alt text on content imagery, an iframe title describing _this_ video, a table caption, a form field's label and error message, a carousel's heading when there are several on a page.
- **It's derived from other data** → computed, and never a CMS field. Examples: "Slide 3 of 7", "12 results", file size and type from the media asset, `aria-current`, the heading level when it's auto-calculated.

**Default-with-override** is a common, good answer: a dictionary default ("Related content") that an editor can override per instance. Use it for landmark and region labels on blocks that may appear more than once on a page.

Computed strings still need **dictionary templates** with placeholders and plural forms, e.g. `search.resultsCount = "{count} result" / "{count} results"`, `carousel.slidePosition = "{x} of {y}"`. Flag the template keys, not just the logic.

## 2. What makes a good CMS accessibility field (ATAG 2.0 Part B)

When you propose a new field, it should follow these, because they're what makes it actually get filled in correctly:

- **Put it next to the thing it describes.** Alt text sits beside the image picker on the block, not only on the media library asset (B.2.2.2). Alt text depends on context: the same photo needs different alt text on different pages. So use asset-level alt text as the default, with a per-usage override.
- **Make decorative an explicit choice.** Use a "Decorative image" toggle that renders `alt=""`, and make alt text required unless that's ticked (B.2.3.1, F38/F39). An empty alt field shouldn't silently mean "decorative".
- **Never auto-fill from the filename or a generic string** such as "image" or "photo" (B.2.3.2(a), F30). AI- or DAM-generated alt text is acceptable only as an **editable suggestion** that's flagged for review (B.2.3.2(b)).
- **Write helper text that teaches.** One sentence on what good looks like. For example: "Describe what the image shows that matters here. Leave blank and tick Decorative if it adds nothing." (B.4.2)
- **Don't restrict editors into failure.** A hard-coded `<h2>` on a block that can sit anywhere on a page is a restriction that forces a WCAG failure in some placements (B.2.1.1). Offer a heading level setting, or compute the level.
- **Check before publish where possible** (B.3.1). Candidates are empty alt with Decorative off, generic link text ("Read more", "Click here"), tables without header rows, and skipped heading levels in rich text. If the platform can't do this, flag it as a content QA check instead.

## 3. Triggers: when the tree needs text the design doesn't show

Work through this list against the tree. Every hit becomes a row in the **Accessible text requirements** table (section 5).

### Images and graphics

| Situation | Text needed | Source |
| --- | --- | --- |
| Content image (editor-picked) | Alt text, or an explicit decorative flag | Editor field: "Image alt text" + "Decorative image" toggle. Required unless decorative. Translatable |
| Image inside a link or button, with no other text | Alt that describes the **destination or action**, not the picture | Editor field. Flag it in the helper text ("Describe where the link goes") |
| Image with adjacent visible text saying the same thing (card image beside a card heading) | None: `alt=""` | Author-fixed. Don't create a field. Say why in the tree |
| Image of text (a promo graphic with a headline baked in) | Alt that repeats the text | Editor field. Also flag that images of text fail 1.4.5, so push back on the design |
| Chart, infographic, map, diagram | Short alt text **plus** a long description, or a data table on the page | Editor fields: "Alt text" + "Long description" (rich text) or "Data table" / linked page |
| Group of images that form one picture (a star rating made of 5 images) | One alt for the group ("Rated 4 out of 5"). The rest are `alt=""` | Usually computed from data |
| Icon in the component chrome (search, close, chevron) | Name on the **control**, not the icon. Icon is `aria-hidden` | Dictionary |
| Icon that is editor-selected and carries meaning (a feature list with a tick or cross icon) | Text alternative per icon choice | Dictionary, keyed per icon option. Not free text |
| Background image via CSS that conveys meaning | Has no alt mechanism, so the information must also exist as text | Flag it. Either render it as `<img>` with an alt field, or treat it as decorative |
| Decorative background video | Hidden from AT, plus a pause control | Dictionary: "Pause background video" / "Play background video" |

### Media and embeds

| Situation | Text needed | Source |
| --- | --- | --- |
| Any `<iframe>` (video, map, form embed, social post) | `title` describing its content ("Video: How to apply for a permit") | Editor field "Embed title", required. Can be prefilled from oEmbed, but stays editable. Never default to "YouTube video player" |
| Video with speech | Captions (1.2.2), audio description or media alternative (1.2.3/1.2.5) | Editor: caption file (VTT) upload or a "Captions verified on platform" confirmation, a transcript (rich text or link), and an audio-described version URL. Auto-captions don't count unless checked |
| Audio / podcast | Transcript (1.2.1) | Editor field: "Transcript" |
| Custom video controls | Play/Pause, Mute, Captions, Full screen labels; slider value text ("1 minute 20 seconds of 5 minutes") | Dictionary + computed |

### Links and CTAs

| Situation | Text needed | Source |
| --- | --- | --- |
| Generic visible CTA text ("Read more", "Learn more", "View") | Programmatic context. **Visually-hidden text appended inside the link** is preferred ("Read more `<span class="visually-hidden">about {{Card heading}}</span>`"). The heading preceding the link is only advisory context (H80), so don't rely on it | Computed from an existing field (usually the card or block heading). No new field needed, but flag it |
| Editor wants a different accessible name from the visible label | An optional "Accessible link text" field that **appends to** the visible label, never replaces it (2.5.3 Label in Name, F96) | Editor field, optional. Validate that it starts with the visible label. Prefer rendering it as visually-hidden text over `aria-label` |
| Link opens in a new tab or window | Warning text: "(opens in a new tab)" | Dictionary, appended when the editor ticks "Open in new tab". Also consider whether new tabs are needed at all (GOV.UK: avoid) |
| Link to a file download | File type and size ("Annual report (PDF, 2.1MB)") | Computed from the media asset. Visible text, not ARIA |
| External link with an icon | Hidden text for the icon ("external site") | Dictionary |
| Several links on a page with the same label going to different places | Unique names | Flag it as a content governance risk (editors can create the collision). Mitigate with computed context |

Avoid `aria-label` for adding link context. It isn't reliably machine-translated, it's ignored by reader modes and read-aloud tools, and it overrides the visible text, which breaks voice control when done wrong. Use DOM text or `aria-labelledby`.

### Headings and structure

| Situation | Text needed / decision | Source |
| --- | --- | --- |
| Block can be placed in different positions (a content area) | Correct heading **level** for the context | Either a "Heading level" setting (H2/H3/H4, default H2), or a level computed from nesting. Flag which one. A fixed `<h2>` is a defect waiting to happen |
| Block has an optional heading | What names the region, and what the child headings (card titles) nest under, when the heading is empty | Decide the fallback: either drop the region role and demote the child levels, or use a dictionary default label |
| Section needs to be navigable but the design shows no heading (a carousel, a card grid) | A heading that's visually hidden, or a region label | Editor field "Heading" with a "Visually hide heading" toggle, or a dictionary default |
| Card titles inside a listing | Heading level one below the block heading | Computed |
| Page `<h1>` | One per page, usually the page title | Existing page property. Flag any block design that also looks like an H1 |

### Landmarks and regions

| Situation | Text needed | Source |
| --- | --- | --- |
| More than one `nav` on the page | A unique label per nav: "Main", "Footer", "Breadcrumb", "In this section" | Dictionary |
| More than one instance of the same named block on a page | A unique region label per instance | Use `aria-labelledby` pointing at the block's heading (editor field). If the heading is optional, use a dictionary default with a per-instance override |
| `<form>` that should be a landmark | Form name | Use `aria-labelledby` pointing at the form's heading, or an editor field |
| `<search>` / site search | Only if there's more than one | Dictionary |
| Cookie banner | Region label "Cookies on {site name}" | Dictionary with the site name |

### Tables

| Situation | Text needed | Source |
| --- | --- | --- |
| Editor-authored data table (in RTE or a table block) | `<caption>`, plus header row and/or header column toggles | Editor fields: "Table caption" (required for data tables) and "First row is header" / "First column is header" toggles (scope computed). Optional "Table summary" for complex tables |
| Sortable columns | Sort button labels and the `aria-sort` state. A caption note explaining sorting | Dictionary ("sortable column, activate to sort") + computed |
| Wide table in a scroll container | The scroll container needs `role="region"`, a name and `tabindex="0"` so keyboard users can scroll it. Without the role it's a `generic`, and the name is ignored | `aria-labelledby` pointing at the caption. Computed |

### Forms (form builders especially)

| Situation | Text needed | Source |
| --- | --- | --- |
| Every field | Visible label | Editor field per form element. Required |
| Field with a format or instructions | Hint text, linked via `aria-describedby` | Editor field "Hint", optional |
| Grouped choices (radios, checkboxes, date parts, address) | Legend | Editor field "Question / legend", required for groups |
| Validation | Error message per rule, **specific to the field** ("Enter your date of birth", not "This field is required") | Editor field per validation rule, with a dictionary default |
| Error prefix | "Error:" (visually hidden before inline errors, also used as a page title prefix) | Dictionary |
| Error summary | Heading ("There is a problem") | Dictionary |
| Required indicator | "(required)" or a legend note explaining the asterisk | Dictionary |
| Personal-data fields | `autocomplete` purpose (1.3.5) | Editor setting per field in form builders ("Autocomplete purpose" dropdown), or fixed by field type |
| Success state | Confirmation message, announced or focused | Editor field "Success message" (rich text) |
| Character limit | Count message template ("You have {n} characters remaining") | Dictionary template + computed |

### Interactive components

| Component | Dictionary strings typically needed | Editor fields typically needed |
| --- | --- | --- |
| Carousel | "Previous slide", "Next slide", "Stop slide rotation" / "Start slide rotation", "Choose slide to display", slide position template "{x} of {y}" | Carousel heading/label (needed for the region name; can be visually hidden) |
| Accordion | "Show all sections" / "Hide all sections", optional visually-hidden "Show" / "Hide" suffixes | Item headings, heading level |
| Tabs | Usually none | Tab labels, tablist label if more than one set of tabs on a page |
| Modal / dialog | "Close" | Dialog heading (names the dialog). If the design has no visible heading, one is still needed, so add a field or a visually-hidden heading |
| Disclosure navigation / mega menu | "Main", "Open {section} menu" (if the toggle is separate from the link), "Menu" (the mobile toggle) | Menu item labels come from page names |
| Pagination | "Pagination" (nav label), "Previous page", "Next page", "Page {n}" | None |
| Breadcrumb | "Breadcrumb" | None (page names) |
| Search / filter | Search input label, "Search", results count template, "No results" message, "Clear filters", "Apply filters" | The filter group legends if filters are editor-configured taxonomies |
| Load more | "Load more {items}", status template "{n} more {items} loaded" | Item noun, if it varies per listing |
| Countdown / timer | Unit labels (days, hours, minutes) and the static text alternative | The event name, if the countdown is named after it |
| Social share | "Share on {network}", "Link copied" | None |
| Video player | Control labels (see Media above) | Embed title, transcript |
| Back to top | "Back to top" | None |
| Skip link | "Skip to main content" | None |
| Cookie banner | All banner copy is usually editor-managed in the consent platform. Controls and the confirmation message are dictionary strings | Banner text |

### Language of parts (WCAG 3.1.2)

- If editors will ever enter text in a different language from the page (a quote in French, a language switcher listing "Deutsch", "Español"), the tree needs `lang` on that content.
- **Language switchers:** each link's text should be in its own language, with `lang` set (computed from the locale). Put `lang` and `hreflang` on the links.
- **Rich text:** flag whether the RTE needs a "language" format or span option.
- **Dictionary strings** must exist for every site language. A hard-coded English "Next slide" on a Welsh page is read with Welsh pronunciation rules, and browser translation won't reliably fix it.

## 4. Rich text: the tree risks editors create

When the design includes a rich text area, the tree can't be fully known in advance. Instead, state the constraints the RTE must enforce and flag the gaps:

| Risk | Tree consequence | RTE configuration to propose |
| --- | --- | --- |
| Heading picked for its visual size, or levels skipped | Broken heading outline (1.3.1, F43) | Only offer levels valid below the block's own heading (for example H3–H4 inside a block that renders an H2). No H1. Keep size styles separate from heading levels |
| Bold paragraphs used as headings | No heading in the tree (F2) | Make heading formats prominent. Flag it as a content QA check |
| Empty paragraphs or headings used for spacing | Empty nodes; "heading level 3, blank" | Strip on save or render |
| Hyphens or asterisks used as lists | Plain paragraphs instead of `list` | Offer list buttons that output `ul`/`ol`. Consider auto-conversion |
| Tables without headers or captions | `table` with no name, only `cell`s (F91) | Table plugin with header row/column toggles defaulted on, and a caption field |
| Non-descriptive or duplicate links | Ambiguous `link "Click here"` nodes | Link dialog helper text, a "new tab" checkbox that appends the dictionary suffix, and a pre-publish checker if available |
| Images inserted in the RTE | `image` with filename alt or no alt | Alt field and a Decorative toggle in the RTE image dialog. Don't allow saving without one or the other |
| Content pasted from Word or Google Docs | Spans with inline styles, fake headings, H1s | A paste filter that keeps headings, lists, tables, strong and em, and strips the rest |
| Embedded blocks or media inside the RTE | Whatever those blocks' own trees require | Treat each allowed embedded block type as its own tree |
| Foreign-language phrases | Mispronounced (3.1.2) | A language span option |

## 5. The "Accessible text requirements" output

After the tree, produce this table whenever the tree contains any editor-field, dictionary or computed string that isn't already an existing, visible design field. If every string is already a visible editor field, say so in one line instead.

```
| Tree node | Text needed | Source | Proposed property / key | Type | Required | Translatable | Helper text / notes |
|---|---|---|---|---|---|---|---|
| image (card) | Alt text | Editor field — NEW | Image alt text | Plain text | No (validated: required when Decorative is off) | Yes | "Describe what the image shows that matters here, usually in a sentence or less. Tick Decorative if it adds nothing." |
| image (card) | Decorative flag | Editor field — NEW | Decorative image | Toggle | No | No | "Tick if the image adds no information. It will be hidden from screen readers." |
| iframe | Embed name | Editor field — NEW | Video title | Plain text | Yes | Yes | "Describes the video for screen reader users, e.g. 'Video: How to apply'." |
| button (next) | "Next slide" | Dictionary — NEW | carousel.next | — | — | Yes | Also needs carousel.previous, carousel.stopRotation, carousel.startRotation |
| group (slide) | "3 of 7" | Computed | carousel.slidePosition = "{x} of {y}" | — | — | Yes (template) | Don't include the word "slide"; the roledescription says it |
```

Column rules:

- **Source** is one of `Editor field — NEW`, `Editor field — existing`, `Dictionary — NEW`, `Dictionary — existing` (only if the user has told you it exists), or `Computed`. The **NEW** items are the headline: they're what the content model or refinement doc has to gain.
- **Proposed property / key.** For editor fields, write the property name in sentence case, as `optimizely-content-modelling` names it. For dictionary strings, write a dotted key.
- **Type / Required / Translatable** only apply to editor fields. Use the same vocabulary as the content model in play: `optimizely-content-modelling` terms (Plain text, Long text, Rich text, Toggle, Media reference…) by default, and `refinement-doc-generator` terms (String, Basic Rich Text, Checkbox, Image Picker…) when feeding a refinement doc.
- **Required** is `Yes` or `No` only (or `**TBC**` for a refinement doc). A field that's only required when another is set (alt text unless Decorative) is `No`. Put the conditional validation in brackets, and explain it in the helper text. That matches both sibling skills.
- **Don't cap alt text at 125 characters.** That figure is a screen reader myth, not a WCAG rule, and a hard limit pushes complex images towards inadequate alt text. Advise brevity in the helper text, and route long content to a long description field.
- **Helper text / notes.** For editor fields, write editor-facing helper text in sentence case, ending with a full stop. Wrap it in double quotes, as the refinement doc does. When handing off to `optimizely-content-modelling`, drop the quotes to match its table. For dictionary entries, list the sibling keys the same component will need.

Then list the CMS-text-driven risks separately in the Risks section. Examples: fields that editors _can_ leave generic or duplicate, optional fields whose absence breaks a name, and fallback behaviour that needs a decision.

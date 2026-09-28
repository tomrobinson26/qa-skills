# Component pattern reference

Before producing a tree, read the section for each pattern the design contains. Each section gives the tree shape, the attributes that matter, and the failure mode that's easy to miss from memory. `{{…}}` marks an editor field, `[[…]]` a dictionary string and `‹computed›` a derived value; see `cms-text.md`.

Primary sources: the WAI-ARIA Authoring Practices Guide (https://www.w3.org/WAI/ARIA/apg/patterns/), the WAI tutorials (https://www.w3.org/WAI/tutorials/) and the GOV.UK Design System (https://design-system.service.gov.uk/). Where APG and practitioner consensus differ for content sites (menus, cards), the content-site recommendation is given and the reason noted.

**Contents:**

- 1 Page skeleton
- 2 Content blocks (hero, card, card grid, CTA, rich text, image / figure, video / embed, quote, stats, logo wall, download list)
- 3 Navigation (site nav and mega menu, mobile menu, breadcrumb, pagination, in-page nav, skip link, language switcher)
- 4 Disclosure widgets (accordion, disclosure, tabs, carousel)
- 5 Forms (form, fields, groups, errors, search, filters, combobox, listbox and select, checkbox, radio, switch, slider, spinbutton)
- 6 Data (table, sortable table, grid)
- 7 Overlays (modal dialog, alert dialog, popover, tooltip, menu button)
- 8 Messaging (alert, notification banner, status and toast, cookie banner, feed)
- 9 Rarely right on content sites (menu / menubar, tree, treegrid, toolbar, application)

---

## 1. Page skeleton

Most features are blocks inside a page. Show the page skeleton only when the feature affects it: a new page type, a template, a header or footer change, or more than one landmark of the same type.

```
RootWebArea "{{Page title}} | [[site.name]]"
├─ region "[[cookies.label]]"          — cookie banner, first in the DOM, before the skip link
├─ link "[[a11y.skipToMain]]"          — first focusable element, visible on focus
├─ banner
│  ├─ link "[[header.homeLink]]"       — logo link, e.g. "{site name} home"; either the logo alt names the link, or the logo is alt="" and the link has text
│  ├─ navigation "[[nav.main]]"
│  └─ search
├─ main
│  ├─ heading "{{Page title}}" [level 1]
│  └─ … blocks …
└─ contentinfo
   └─ navigation "[[nav.footer]]"
```

- One `main`, one `banner`, one `contentinfo`, all at the top level. `header` and `footer` inside a block are not landmarks, and that's correct.
- All content should sit inside some landmark.
- **Landmarks inside `main`.** Many screen reader users navigate by landmark, and a `main` with nothing inside it gives them no way to jump. Apply this test to each section: _would a user want to go straight here from elsewhere on the page?_
  - **Yes → landmark.** Examples: a purchase or booking panel (a named `form`), a product information or tabs section, related-content and product rails, a filter panel, a search panel, and a major page-level CMS block with its own h2.
  - **No → heading only, or nothing.** This covers the parts of a section, like a gallery inside a purchase panel, a price breakdown, a callout, a single card or an accordion item. Making these landmarks is the proliferation APG warns about.
- **Treat "about seven landmarks" as a warning sign, not a cap.** Going over it is fine when each landmark passes the test and has a unique, meaningful name. It's a problem when the landmarks list fills up with near-identical or unnamed-looking entries.
- **Name a region from its visible heading** (`aria-labelledby`), so it needs no new text. If that heading is an optional CMS field, the region needs a fallback label. Otherwise it silently degrades to an unnamed `section`, which isn't a landmark, and its child headings lose their parent.
- **A purchase, booking or enquiry panel is a `<form>`.** It collects input and submits, so name it and it becomes a landmark almost for free.
- Landmark labels never include the role word: "Main", not "Main navigation".
- Two h1 models are both acceptable: h1 is the site name, or h1 is the main content heading. The second is the usual one, and it's the house default.

## 2. Content blocks

### Hero

```
heading "{{Heading}}" [level 1 on landing pages, else ‹from Heading level›]
paragraph: "{{Strapline}}"             — only if Strapline filled
link "{{CTA label}}"                  — only if CTA label + CTA link filled
image "{{Image alt text}}"            — or omitted when Decorative is ticked / the image is a CSS background
```

- A hero image behind text is almost always decorative. If it's `<img>`, it needs `alt=""`. If it conveys something, it needs alt text and should come _after_ the heading in source order.
- If the hero heading is the page's `h1` on some templates and not on others, the block needs a heading level setting or a computed level.
- Hero video: see Video. Autoplaying background video needs a pause button (2.2.2) and must be hidden from assistive technology.

### Card (single)

The house default follows Inclusive Components' approach: the heading's link is the card's only link, and a pseudo-element stretches it over the whole card.

```
article                                — optional; use listitem when the card is inside a list
├─ heading "{{Title}}" [level ‹one below the grid heading›]
│  └─ link "{{Title}}"
├─ paragraph: "{{Summary}}"
└─ StaticText "{{Date}}"               — or a time element
(image "…" alt="" — decorative because the heading carries the meaning; comes after the heading in the DOM)
```

- **Don't wrap the whole card in `<a>` or `<button>`.** Everything inside gets read as one long link name, and nested links or buttons become invalid. A card that _is_ a `button` flattens its heading, because children are presentational.
- **A redundant "Read more" link** in addition to the heading link creates duplicate tab stops. Prefer one link. If the design insists on a visible CTA, it becomes the link and needs visually-hidden context ("Read more `about {{Title}}`"). See cms-text.md.
- **Source order:** heading first, then the image, reordered visually if the design puts the image on top. Otherwise heading navigation skips past the image, and the link name is announced after it.
- If the card has several actions (link plus "Save" plus a tag link), the stretched-link approach must leave those controls above the stretched area so they can still be activated. Flag this.
- Card metadata such as a date, reading time or category: plain text, or `time`. Visual-only icons are `aria-hidden`.

### Card grid / listing

```
region "{{Heading}}"                   — a landmark when it's a page-level section (the usual case for a listing block); aria-labelledby → heading
├─ heading "{{Heading}}" [level ‹from setting›]
├─ list                                — role="list" if list-style:none (Safari)
│  ├─ listitem
│  │  └─ … card …
│  └─ listitem …
└─ link "{{View all label}}"           — needs context if generic ("View all news")
```

- Use a list, so users hear "list, 6 items". This is why the Safari `role="list"` fix matters.
- Card heading level = grid heading level + 1. If the grid heading is optional, say what the card headings nest under when it's empty.
- Manual vs automatic listings: the tree is identical, but automatic listings need an empty state ("No articles found": is it a dictionary string or an editor field?).

### CTA / button group

- Navigation is a `link`, even when it's styled as a button. An action on the page is a `button`. Flag any design where "button" styling goes to another page, because developers often build those as `<button>`.
- Two CTAs with free-text labels: an editor _can_ make them identical or generic. Flag this as a content governance risk.
- An icon inside a CTA (arrow, external) is `aria-hidden`. If it means "opens in a new tab" or "external", that meaning becomes visually-hidden text from the dictionary.

### Rich text

- The tree is unknowable in advance. State constraints instead. Headings start one level below the block heading (no h1). Lists are `list`. Tables need a caption and headers. Links need descriptive text. Images need alt text or a decorative flag. See cms-text.md §4.
- Show a representative tree fragment marked `— representative; editor-controlled`.

### Image / figure

```
figure "{{Caption}}"                  — name only when the figure is referenced explicitly (aria-labelledby → figcaption)
├─ image "{{Alt text}}"
└─ caption: "{{Caption}}"
```

- Alt text and caption do different jobs. Alt text replaces the image; the caption adds context that everyone sees. They shouldn't be identical. If the caption fully describes the image, the alt text can be short, but not empty unless the image is truly decorative.
- Complex images (chart, map, infographic): short alt text plus a long description on the page or a linked data table. That needs an editor field.
- Photo credits: plain text in the caption, or visually secondary text. Not in the alt text.

### Video / embed

```
iframe "{{Video title}}"               — YouTube/Vimeo/map/form embeds; title attr is the ONLY name source
```

or, for a custom player:

```
group "{{Video title}}"               — or region
├─ button "[[video.play]]"            — label swaps to [[video.pause]]; no aria-pressed when the label changes
├─ slider "[[video.seek]]" [valuetext ‹computed: "1 minute 20 seconds of 5 minutes"›]
├─ button "[[video.mute]]" [pressed=false]   — either the label swaps or aria-pressed is used, never both
├─ button "[[video.captions]]" [pressed=false]
└─ button "[[video.fullscreen]]"
link "[[video.transcript]]" / disclosure with transcript — needs {{Transcript}}
```

- Every iframe needs a `title`. Provider defaults such as "YouTube video player" don't count.
- Captions (1.2.2), audio description (1.2.5 AA) and a transcript: flag which ones the content model supports.
- Consent-gated embeds (a cookie placeholder in place of the video) need their own tree: a placeholder message plus a button to accept and load. The iframe doesn't exist until then.

### Quote / testimonial

```
figure
├─ blockquote
│  └─ paragraph: "{{Quote}}"
└─ caption: "{{Name}}, {{Role}}"
```

- Decorative quotation-mark graphics are `aria-hidden`. A headshot next to the name is decorative (`alt=""`), because the name is already there.
- A testimonial carousel is still a carousel (see §4).

### Stats / key figures

- Each stat is usually a list item, with the number and label read together: "92% of customers recommend us". Don't make the number a heading unless the design really uses it as a section title.
- Count-up animations: the final value must be in the DOM from the start, and the animation must be hidden from AT (and respect `prefers-reduced-motion`). Otherwise the screen reader reads "0%".
- Figures shown as graphics need text equivalents.

### Logo wall / partner list

- A list of images. Each logo's alt text is the organisation's name. If a logo is a link, its alt text names the destination ("Acme Ltd" or "Acme Ltd website").
- Alt text per logo is an editor field (or comes from the partner content item). A wall of `image "logo"` is a common failure.

### Download list

```
list
└─ listitem
   └─ link "{{Document title}} (‹computed: PDF, 2.1MB›)"
```

- File type and size are computed from the asset and shown visibly, not only in ARIA.
- If a document isn't accessible (for example a scanned PDF), consider an "accessible format on request" note. That's an editor or dictionary string.

## 3. Navigation

### Site navigation and mega menu (disclosure pattern)

**Don't use `menu`/`menubar` roles for site navigation.** APG itself says the menubar pattern is unnecessary for typical site navigation. Menu roles switch screen readers into application-style arrow-key interaction that users don't expect on a website. Use the disclosure pattern.

```
navigation "[[nav.main]]"
└─ list
   ├─ listitem
   │  └─ link "{{Page name}}" [current=page]         — aria-current on the current page only
   ├─ listitem
   │  ├─ button "{{Section name}}" [expanded=false]  — when the parent item only opens the submenu
   │  └─ list                                        — hidden while collapsed
   │     └─ listitem → link "{{Page name}}"
   └─ listitem                                       — link + separate toggle variant
      ├─ link "{{Section name}}"
      ├─ button "[[nav.showSubmenu]] {{Section name}}" [expanded=false]  — or aria-labelledby → the link
      └─ list …
```

- `aria-expanded` goes on the button, never on the link.
- No `aria-haspopup` (it implies a menu role).
- Escape closes the submenu and returns focus to the toggle. Tab moves through the links normally. Arrow keys are optional.
- Opening on hover only is a failure. There must be a click or keyboard toggle, and a hover-out delay of about 1 second helps.
- A mega menu with headings and columns: use headings inside the panel (`heading [level 2 or 3]`) with a list under each. Mark the panel's featured-content images as decorative.
- Order and wording should match between desktop and mobile.

### Mobile menu (hamburger)

```
button "[[nav.menu]]" [expanded=false]     — controls the nav; icon aria-hidden
navigation "[[nav.main]]"                  — hidden while collapsed
```

- Either a disclosure (content pushes down) or a modal dialog (full-screen overlay). If it's an overlay that covers the page, treat it as a modal: contain focus, make the background inert, close on Escape, return focus to the button.
- The button's label doesn't change between Menu and Close if `aria-expanded` is used. If the design shows "Close" when open, either keep the name "Menu" plus the expanded state, or swap the label and drop `aria-expanded`. Don't do both.

### Breadcrumb

```
navigation "[[nav.breadcrumb]]"
└─ list
   ├─ listitem → link "[[nav.home]]"
   ├─ listitem → link "{{Parent page}}"
   └─ listitem → link "{{Current page}}" [current=page]  — or plain text if not a link
```

- Separators are CSS or `aria-hidden`, never text such as ">" or "/" in the DOM.
- On mobile, a collapsed breadcrumb that shows only "Back to {{Parent}}" is a different tree. Show both.

### Pagination

```
navigation "[[pagination.label]]"
└─ list
   ├─ listitem → link "[[pagination.previous]]"         — "Previous page" via visually-hidden " page"
   ├─ listitem → link "[[pagination.page]] 1"           — visible "1", name "Page 1"
   ├─ listitem → link "[[pagination.page]] 2" [current=page]
   ├─ listitem → StaticText "…"                         — ellipsis is not a link
   └─ listitem → link "[[pagination.next]]"
```

- Pagination above and below the same results can share a label; APG allows this exception.
- Client-side pagination that doesn't reload the page needs focus moved to the results heading, or an announcement.

### In-page navigation / table of contents

- `navigation "[[nav.onThisPage]]"` containing a list of same-page links. Mark the active section with `aria-current="true"` (not "page").
- Target headings must exist and have ids. Sticky tables of contents risk 2.4.11 Focus Not Obscured.

### Skip link

- `link "[[a11y.skipToMain]]"` as the first focusable element (after the cookie banner). It targets `main` or its h1 and moves focus there, not just scroll position.

### Language switcher

```
navigation "[[nav.language]]"   — or a disclosure button showing the current language
└─ list
   ├─ listitem → link "English" [current=true] lang=en hreflang=en
   └─ listitem → link "Cymraeg" lang=cy hreflang=cy
```

- Each language name is written in its own language and carries `lang` (3.1.2).
- Flag-only switchers have no name and flags aren't languages. Flag it.

## 4. Disclosure widgets

### Accordion

```
heading "{{Item heading}}" [level ‹from setting›]   — the heading contains the button, not the other way round
└─ button "{{Item heading}}" [expanded=false, controls=panel-1]
region "{{Item heading}}"               — optional; omit for more than ~6 panels (landmark proliferation)
└─ … {{Item content}} …                 — hidden while collapsed
```

- **A button inside a heading, never a heading inside a button** (the button flattens the heading). The same applies to `<summary>`: a heading inside summary isn't supported by JAWS.
- `aria-expanded` on the button. The panel is `hidden` (or `hidden="until-found"` for find-in-page, which isn't supported in Safari) while collapsed.
- A panel that can't collapse: `aria-disabled="true"` on its button.
- The "Show all sections" control is a button with its own `aria-expanded`, plus a dictionary label pair.
- `<details>`/`<summary>` is fine for simple content reveals and exclusive accordions (`details name`). Prefer the button pattern when the panel holds forms, needs animation, or the heading structure matters.
- Accordion item headings are editor fields. The heading level is a setting or computed.

### Disclosure (show / hide)

```
button "{{Label}}" [expanded=false]
└ (sibling) … content …  — hidden while collapsed
```

- The label doesn't change with the state. If the design says "Show more" and then "Show less", either keep one label with `aria-expanded`, or swap the label with no `aria-expanded`.
- "Read more" text truncation: the full text should usually be in the DOM (readable), or the expanded state must move focus to, or reveal, the new text right after the button.

### Tabs

```
tablist "{{Tabs label}}"               — name needed when more than one tab set on a page
├─ tab "{{Tab 1 label}}" [selected=true, controls=panel-1]   — tabindex=0
├─ tab "{{Tab 2 label}}" [selected=false]                    — tabindex=-1
tabpanel "{{Tab 1 label}}"             — labelled by its tab; tabindex=0 if it has no focusable content
└─ …
(unselected tabpanels: hidden — not in the tree)
```

- Roving tabindex. Arrow keys move between tabs. Tab moves from the tablist into the panel.
- Automatic activation (on focus) only if panels display instantly. If the panel loads content, use manual activation (Enter/Space).
- A heading inside a tab is flattened. If the design has tab labels that are headings, restructure.
- Responsive: tabs that become an accordion on mobile are **two trees**. Show both, and flag that switching breakpoints must keep the selected or expanded state.
- Tabs used as navigation (each "tab" loads a new page) aren't tabs. They're a `navigation` with links and `aria-current="page"`.

### Carousel

APG basic pattern:

```
region "{{Carousel heading}}" [roledescription=[[carousel.roledescription]]]  — label must not contain "carousel"
├─ button "[[carousel.stopRotation]]"   — first in the tab order; label swaps to [[carousel.startRotation]]; no aria-pressed
├─ button "[[carousel.previous]]"
├─ button "[[carousel.next]]"
└─ generic [live=off while rotating / polite when stopped, atomic=false]
   ├─ group "‹computed: [[carousel.position]] 1 of 5›" [roledescription=[[carousel.slide]]]
   │  └─ … slide content (heading, text, link) …
   └─ group "‹computed: 2 of 5›" — hidden, or inert, if not visible
```

Slide pickers (dots) as a grouped variant:

```
group "[[carousel.chooseSlide]]"
├─ button "{{Slide 1 heading}}" [disabled]   — current slide; via aria-disabled=true so it stays focusable
│  description: "[[carousel.current]]"      — optional; describedby → visually hidden "Current slide"
└─ button "{{Slide 2 heading}}"
```

- Keyboard focus entering the carousel, or the user operating any control, **stops** rotation. It stays stopped until the user restarts it, and the rotation button's label changes to match. Pointer hover only **pauses** rotation while it lasts. Auto-rotation over 5 seconds needs the rotation control (2.2.2).
- The live wrapper announces text content, not group names. If the slide position should be heard, include it as visually hidden text inside each slide.
- Previous and next don't move focus. Choosing a picker can move focus to the slide.
- Off-screen slides must be hidden or inert, or keyboard users tab into invisible links.
- Carousel with one item: the controls should not render. Flag it as an edge case.
- `aria-roledescription` support is inconsistent and isn't translated. The "carousel" and "slide" strings must come from the dictionary.
- A carousel usually needs a name even when the design shows no heading. Provide an editor field with a visually-hidden option, or a dictionary default.
- Scroll-snap carousels with no JS controls are a scrolling list: `region` (named, `tabindex=0` for keyboard scrolling) containing a `list`.

## 5. Forms

### Form and fields

```
form "{{Form heading}}"                — landmark only when named; name via aria-labelledby → heading
├─ heading "{{Form heading}}" [level ‹setting›]
├─ paragraph: "[[forms.requiredExplanation]]"   — if an asterisk is used
├─ textbox "{{Field label}}" [required, autocomplete=email, describedby=hint-1]
│  description: "{{Hint}}"
├─ group "{{Legend}}"                  — fieldset/legend for related controls
│  ├─ textbox "[[forms.date.day]]" …
└─ button "{{Submit label}}"
status — empty until submission result  — or focus moves to a success message/page
```

- Every control has a visible `<label>`. A placeholder is not a label.
- Required: `required` attribute (so it's announced), and the visual marker explained in text.
- Hints are linked with `aria-describedby`. The describedby order is hint then error, or error then hint, but be consistent.
- `autocomplete` values on personal-data fields (1.3.5). Form builders need a setting for this.
- Group related controls (radios, checkboxes, date parts, address) in a `fieldset` with a `legend`. Don't use one fieldset per input.
- Submit is a real `button`. "Submit" alone is fine in a single-purpose form, but a specific label is better ("Send enquiry").
- Multi-step forms: say the step in the title and heading ("Step 2 of 4: Your details"), and move focus to the new step's heading.

### Errors (on submit, the house default)

```
RootWebArea "[[forms.errorPrefix]] {{Page title}}"
…
group "[[forms.errorSummaryHeading]]"   — aria-labelledby → heading; tabindex=-1; focus moves here on submit
├─ heading "[[forms.errorSummaryHeading]]" [level 2]
└─ list
   └─ listitem → link "{{Error message for Email}}"     — href → #email; focuses the field
textbox "{{Email label}}" [invalid=true, describedby=email-error]
   description: "[[forms.errorPrefix]] {{Error message for Email}}"
```

- The error message text is specific and the same in the summary and inline. It's an editor field per validation rule in form builders, with dictionary defaults.
- For group errors, the summary link targets the first input in the group.
- Use `aria-describedby`, not `aria-errormessage` (support gaps).
- **Focus, not an alert.** The house default is to move focus to the summary. GOV.UK _also_ puts `role="alert"` on an inner element as a fallback for older JAWS behaviour, knowing some screen readers will then speak it twice. If the project uses GOV.UK Frontend, accept its markup and note it. Otherwise specify focus only, per the "never both" rule in dynamic-content.md.

### Search

```
search
└─ form
   ├─ searchbox "[[search.label]]"          — visible label, or a label visually hidden if the design only shows an icon
   └─ button "[[search.submit]]"
status: "‹computed: [[search.resultsCount]]›"  — on the results page / as results update
heading "[[search.resultsHeading]] ‹computed: for "query"›"
```

- An icon-only search button needs a dictionary name. An icon-only search input needs a label; a placeholder isn't enough.
- Autocomplete suggestions: see Combobox.

### Filters

```
region "[[filters.label]]"               — or form; a disclosure or modal on mobile
├─ group "{{Filter group name}}"         — fieldset/legend per taxonomy
│  ├─ checkbox "{{Term}} (‹computed: 12›)"  — count inside the name, or as a description
├─ button "[[filters.apply]]"            — if not live-applied
└─ button "[[filters.clear]]"
status: "‹computed: [[search.resultsCount]]›"
```

- Live-applied filters announce the count after each change, and focus stays put.
- Applied-filter "chips" are buttons named "Remove filter: {{Term}}". After removal, focus moves to the next chip or the group heading.
- Mobile filter drawers that overlay the page are modal dialogs.
- Filter group names usually come from taxonomy names, which are existing CMS content. Flag it if they don't exist.

### Combobox / autocomplete

```
combobox "{{Label}}" [expanded=true, autocomplete=list, controls=listbox-1, activedescendant=opt-2]
listbox "{{Label}}"
├─ option "{{Suggestion}}" [selected=false]
└─ option "{{Suggestion}}" [selected=true]
status: "‹computed: [[combobox.resultsCount]]›"   — "5 suggestions available" / "No results"
```

- DOM focus stays in the input. `aria-activedescendant` points at the highlighted option.
- Down arrow opens and moves into the list, Escape closes, Enter selects.
- The count or "no results" announcement is the most commonly missed part.
- Don't let JS break normal text editing (Home, End, selection).
- For a non-editable single choice, a native `<select>` (a combobox in the tree) is almost always better than a custom one.

### Listbox / select

- Native `<select>` gives `combobox` (single) or `listbox` (`multiple`/`size`). Customisable select (`appearance: base-select`) keeps this. Rich option content is flattened to text, so decorative icons in options need `aria-hidden`.
- Custom listbox: option names are flat strings (no headings, no interactive children). Avoid long or repeated-prefix option names.

### Checkbox / radio / switch

- Checkboxes: `group "{{Legend}}"` > `checkbox "{{Option}}" [checked=false]`. A "select all" is `checked=mixed` when partially selected (native `indeterminate`).
- Radios: `radiogroup` or fieldset `group "{{Legend}}"` > `radio [checked]`. Arrow keys move and select. Tab enters on the checked radio.
- Switch (on/off setting with immediate effect): `switch "{{Label}}" [checked=false]`. The label never changes with the state. Prefer `<input type="checkbox" role="switch">`; the native `switch` attribute is experimental.
- A checkbox that needs an explanation (terms acceptance with a link): the link sits outside the label, or the label contains the link. If the label contains the link, clicking it mustn't toggle the box. Flag the design choice.

### Slider / spinbutton

- `slider "{{Label}}" [valuemin, valuemax, valuenow, valuetext]`. Use `valuetext` whenever the number alone isn't meaningful ("£50", "3 bedrooms").
- Range sliders (min and max) are two sliders with distinct names ("Minimum price", "Maximum price").
- Prefer native `input type=range` / `type=number`. `type=number` has its own usability issues, so for things like card numbers use `inputmode="numeric"` on a textbox.

## 6. Data

### Table

```
table "{{Table caption}}"
├─ rowgroup
│  └─ row
│     ├─ columnheader "{{Header}}"
│     └─ columnheader "{{Header}}"
└─ rowgroup
   └─ row
      ├─ rowheader "{{Row label}}"    — if the first column is a header
      └─ cell "{{Value}}"
```

- A name via `<caption>` is required.
- Headers are `th` with `scope`. Irregular or multi-level headers need `headers`/`id` or `colgroup` scope. Avoid merged cells in CMS tables.
- Don't use a table for layout. Don't lay out a data table with CSS `display:flex/grid` on the table elements, because semantics are lost (Safari, Firefox).
- Responsive tables that turn into stacked "cards" on mobile often lose table semantics. Show the mobile tree, or specify a scrollable container: `region "{{Caption}}"` with `tabindex=0`.

### Sortable table

- The sort control is a `button` inside each sortable `columnheader`. `aria-sort="ascending|descending"` is on **one** header at a time; remove it from the others.
- The arrow icon is `aria-hidden`. A visually-hidden caption note explains that columns are sortable.
- After sorting, focus stays on the button. Optionally announce "Sorted by {{column}}, ascending" via status.

### Grid

- Only for genuinely interactive tabular widgets (spreadsheet-like editing, a date picker's day grid, rows of controls). It has one tab stop and arrow-key navigation, and every cell is focusable.
- A plain data table on a content site is a `table`, not a `grid`.

## 7. Overlays

### Modal dialog

```
dialog "{{Dialog heading}}" [modal=true]
├─ heading "{{Dialog heading}}" [level 2]   — names the dialog via aria-labelledby
├─ … content …
└─ button "[[dialog.close]]"                — visible close button
(rest of page: inert)
```

- Prefer native `<dialog>` + `showModal()`. It gives inertness, Escape, the top layer and focus handling.
- Say where focus goes on open (see dynamic-content.md §4) and that it returns to the trigger on close.
- The name comes from the dialog's own heading, not the page h1. If the design has no heading, one is still needed: add an editor field, or use a visually-hidden heading.
- `aria-describedby` only for short plain-text content; omit it if the dialog has structured content.
- Only set `aria-modal="true"` when the outside really is inert and visually obscured.
- VoiceOver on macOS may not announce the dialog name on open. Focusing the heading helps.

### Alert dialog

- `alertdialog "{{Title}}" [modal=true, describedby=message]` for confirmations that interrupt ("Delete this item?"). Focus goes to the least destructive button.

### Popover (native `popover` attribute)

- Not modal and has no implicit role, so give it a role that suits its content. The invoker gets `aria-expanded` automatically. Escape and light dismiss are built in.
- Good for disclosure-like panels, menus of links and share panels. Not a replacement for a modal dialog.

### Tooltip

- The APG pattern is still work in progress. `tooltip` is linked to its trigger with `aria-describedby`. The tooltip is never focusable and never interactive.
- It must appear on focus as well as hover, be dismissable with Escape, and stay while the pointer is over it (1.4.13).
- A tooltip is supplementary. The trigger still needs its own name. Icon-only buttons whose only label is the tooltip need that label as the button's name (`aria-labelledby` pointing at the tooltip text).
- A "tooltip" containing links or buttons is a non-modal dialog or a disclosure. Toggletips (click an "i" icon to show info) are a button with `aria-expanded` plus content, optionally announced via status.
- Editor-authored tooltip text is an editor field. Keep it short, because it's read as a flat description.

### Menu button (actions menu)

- Only for genuine action menus ("Share ▾" with Copy link, Email, Print). Use `button [haspopup=menu, expanded]` controlling a `menu` with `menuitem`s: arrow keys, Escape back to the button, focus on the first item when opened.
- If the items are links to other pages, it's a disclosure containing a list of links, not a menu.

## 8. Messaging

### Alert (inline)

- `role="alert"` for errors or urgent messages that appear _after_ load. The container exists empty before the message is inserted. It doesn't take focus, and there's no requirement to dismiss it.
- A message present at load (server-rendered) isn't reliably announced. Move focus to it, or use a heading so users can find it.
- Put the severity in the text ("Error: …", "Warning: …"). JAWS and VoiceOver often don't say "alert", and colour alone fails 1.4.1.

### Notification banner (site-wide or page message)

- Neutral or informational: `region "{{Banner title}}"` with a heading, in the DOM at load.
- Success after an action (the page reloads with a success banner): focus moves to the banner (`tabindex=-1`), and the word "Success" is in the title text. GOV.UK also adds `role="alert"` (see the Errors note on focus vs alert).
- Dismissible banners: a close button named "[[banner.dismiss]] {{Banner title}}". After dismissal, focus moves to a logical next element such as the main heading. Editor-authored banner text is an editor field.

### Status message / toast

- `status`, plain text, no focus, no interactive children. See dynamic-content.md §3.
- A toast that auto-dismisses and is the only source of its information fails 2.2.1.

### Cookie banner

```
region "[[cookies.label]]"             — first in the DOM, before the skip link; not modal, not position:fixed over content
├─ heading "{{Banner heading}}" [level 2]
├─ paragraph: "{{Banner text}}"
├─ button "[[cookies.accept]]"
├─ button "[[cookies.reject]]"
└─ link "[[cookies.viewPolicy]]"
(after a choice on the same page: the confirmation message replaces the banner content and receives focus (tabindex=-1); then a "Hide" button)
```

- A modal cookie wall is a dialog, which is a different, more disruptive tree. Flag it if the design implies one.
- Sticky or fixed banners risk obscuring focus (2.4.11).
- Consent platform banners (OneTrust and others) are third-party. Their tree is outside the build's control, so flag it for audit rather than specifying it.

### Feed

- Only for true infinite-scrolling article streams: `feed "{{Label}}" [busy while loading] > article "{{Item title}}" [posinset, setsize or -1]`. Page Down / Page Up move between articles.
- `aria-busy` must be reset to false. Most listings with a "Load more" button don't need `feed`; use a list.

## 9. Rarely right on content sites

Flag these if the design or brief asks for them. They usually signal the wrong pattern.

- **`menu` / `menubar`**: application-style menus only (menu button above). Never for site navigation.
- **`tree`**: file-browser widgets. A nested sitemap or side navigation is nested lists of links with disclosure buttons.
- **`treegrid`**: expandable data grids. Rare.
- **`toolbar`**: a group of three or more controls acting on something (e.g. an editor toolbar, media controls). It has a single tab stop and arrow keys. Not for a row of CTAs.
- **`application`**: switches off screen reader reading keys. Almost never appropriate.
- **`grid` for layout**: only when the arrow-key navigation is intended and specified.

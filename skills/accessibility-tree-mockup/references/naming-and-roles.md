# Names, roles and how the tree is really built

Read this before producing any tree. It's the rules the browser applies when it turns markup into the accessibility tree, and most "looks right, announces wrong" mistakes come from getting one of these wrong from memory.

Primary sources: AccName 1.2 (https://w3c.github.io/accname/), HTML-AAM (https://w3c.github.io/html-aam/), ARIA in HTML (https://w3c.github.io/html-aria/), WAI-ARIA 1.2 Recommendation and the 1.3 editor's draft (https://w3c.github.io/aria/), APG "Providing Accessible Names and Descriptions" (https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/).

---

## 1. Accessible name: the order the browser tries things

For a given element, the first source that yields a non-empty result wins:

1. `aria-labelledby` — IDREFs joined with spaces, in the order listed. Not followed recursively (a referenced element's own `aria-labelledby` is ignored). Can reference itself to combine its own text with another element's (`aria-labelledby="self-id heading-id"`).
2. `aria-label` — skipped if empty or whitespace.
3. Native host-language label — `<label>`, `alt`, `<caption>`, `<legend>`, `value` on submit/reset/button inputs, SVG `<title>`. Per element order is below.
4. Name from content — only for roles that allow it (list below), _or_ when the element is being used as an `aria-labelledby` / `aria-describedby` / `<label>` target.
5. `title` attribute — last resort. Then `placeholder` for text inputs.

**Consequences worth flagging in a tree:**

- `aria-label` or `aria-labelledby` on a button or link _replaces_ its visible content as the name — the content is no longer part of it. This is how Label in Name (WCAG 2.5.3) failures happen.
- `title` becomes the **description**, not the name, whenever anything else supplied the name. A link with text and a `title` is `link "Text"` with description "title text".
- Placeholder is a fallback name, not a label. A textbox named only by its placeholder should be flagged — it vanishes on input and is poorly supported as a name.
- CSS `::before` / `::after` text content **is** included in name-from-content, without a space. Icon fonts injected via pseudo-elements can leak glyphs into names (" Search"). Flag icon-font approaches.

### Hidden content and names

- `display:none`, `visibility:hidden`, `content-visibility:hidden` (so also `hidden="until-found"`) and `aria-hidden="true"` remove content from the tree and from name-from-content.
- `opacity:0`, off-screen positioning and the usual "visually-hidden" clip pattern do **not** hide — that text stays in the tree and in names. This is why visually-hidden text is the preferred way to add context.
- `aria-labelledby` pointing at a _hidden_ element still works: the whole hidden subtree is used. But if the target is _visible_ and contains a hidden child, that child is excluded.

### Embedded controls inside a label

A control inside another control's label contributes its value: a textbox gives its text, a select/combobox its chosen option, a slider/spinbutton its `aria-valuetext` or value. "Flash the screen [5] times" is one checkbox name.

### Per-element native name sources (after aria-labelledby / aria-label)

| Element | Name source order |
| --- | --- |
| `input` text/email/tel/url/search/number/password, `textarea` | `<label>` → `title` → `placeholder` |
| `button` | `<label>` → content → `title` |
| `input type=submit/reset/button` | `<label>` → `value` → browser default ("Submit") → `title` |
| `input type=image` | `<label>` → `alt` → `title` → browser default |
| `fieldset` | first child `<legend>` → `title` |
| `table` | first child `<caption>` → `title` |
| `img` | `alt` → `title` |
| `a[href]` | content → `title` |
| `summary` | content → `title` (browser supplies a localised "Details" if there's no summary) |
| `iframe` | `title` only — so an iframe with no `title` has no name |
| `figure` | `aria-label` / `aria-labelledby` → `title`. HTML-AAM no longer uses `<figcaption>` for the name unless it's referenced, though Chrome still does. Don't depend on either behaviour — if the figure needs a name, reference the caption explicitly |

A hidden `<caption>`, `<legend>` or `<label>` does not name its owner.

### Roles that take their name from content

Button, cell, checkbox, columnheader, gridcell, heading, link, menuitem, menuitemcheckbox, menuitemradio, option, radio, row, rowheader, switch, tab, treeitem (plus tooltip in ARIA 1.2).

Everything else must be named by the author, e.g. dialog, region, navigation, form, table, tabpanel, listbox, combobox, textbox, image.

### Roles that must have a name (APG)

alertdialog, application, combobox, dialog, grid, img/image, listbox, meter, progressbar, radiogroup, region, searchbox, slider, spinbutton, table, tabpanel, textbox, tree, treegrid. Content-named roles (button, link, heading, tab…) need one if their content doesn't provide it — e.g. an icon-only button.

### Roles where naming is prohibited

Naming these does nothing, or does something unpredictable. In a tree they have no quoted name.

- ARIA 1.2: caption, code, deletion, emphasis, generic, insertion, paragraph, presentation/none, strong, subscript, superscript.
- ARIA 1.3 draft adds: definition, term, time, tooltip, mark, suggestion.

The common real-world mistake: `aria-label` on a `div`, `span`, `p`, or an `a` with no `href`. Screen readers handle it unevenly — sometimes read, sometimes ignored. If a design requires a name there, the element needs a real role first (or the text should be visible or visually-hidden content).

### Name composition (APG)

- Function, not form: "Close", not "X"; "Search", not "Magnifying glass".
- Distinguishing word first; verbs first for actions.
- Short — one to three words for most controls.
- **Never put the role in the name.** A button named "Submit button" is announced "Submit button, button". Landmarks too: a `nav` labelled "Main navigation" is announced "Main navigation navigation". Use "Main", "Footer", "Breadcrumb".
- Sentence case, no trailing full stop.
- Same-role elements should have unique names unless they genuinely do the same thing (e.g. identical pagination above and below a list).

## 2. Accessible description

Order: `aria-describedby` → `aria-description` → native source (a table's `<caption>` when the table is ARIA-named, the `value` of button inputs) → `title`.

- `aria-describedby` can reference hidden content; it's flattened to plain text (no headings or lists survive), so don't point it at structured content.
- `aria-description` (ARIA 1.3, string attribute): supported in Chromium and Firefox, patchy in VoiceOver on iOS, and **not machine-translated** by most browsers. Prefer `aria-describedby` pointing at real text.
- `aria-details` is **not** a description. It exposes a relation to richer content and isn't read automatically by most screen readers. Don't rely on it for anything a user must hear.

## 3. HTML to role mapping: the ones that catch people out

| Markup | Role in the tree | The catch |
| --- | --- | --- |
| `<section>` | `region` **only if named**, otherwise `generic` (i.e. invisible) | An unnamed section adds nothing. A named one is a landmark: name the page-level sections a user would jump to, not the sub-parts of a component (see patterns.md §1) |
| `<header>` / `<footer>` in `body` | `banner` / `contentinfo` | Inside `article`, `aside`, `main`, `nav` or `section` they're `generic` (ARIA 1.3: `sectionheader`/`sectionfooter`, mostly not exposed yet). A block's own `<header>` is not a banner |
| `<aside>` | `complementary` at top level. Nested in sectioning content, only if named |  |
| `<form>` | `form` landmark **only if named** |  |
| `<search>` | `search` landmark | Preferred over `role=search` on a form |
| `<nav>` | `navigation` | Name it if there's more than one |
| `<main>` | `main` | One per page, top level |
| `<img alt="text">` | `image "text"` (ARIA 1.3 computed role `image`, synonym `img`) |  |
| `<img alt="">` | removed (`none`) | Correct for decorative. `aria-*` other than `aria-hidden` is invalid on it |
| `<img>` with no `alt` | `image` with no name | Some screen readers read the filename. Always a defect |
| Inline `<svg>` | depends; unreliable | Decorative: `aria-hidden="true"`. Meaningful: `role="img"` plus `aria-label` or `<title>` |
| `<a>` with no `href` | `generic` | Not a link, not focusable, can't be named |
| `<button>` / `<a href>` | `button` / `link` | Buttons do things; links go places. Match the role to the behaviour, not the styling |
| `<ul>`/`<ol>` with `list-style:none` | `list` — **except Safari/VoiceOver drops it outside `<nav>`** | Add `role="list"` if the count matters ("list, 5 items") |
| `<dl>` / `<dt>` / `<dd>` | `list` / `term` / `definition` |  |
| `<table>` with `display:flex/grid/block` on rows or cells | table semantics may be lost | Flag CSS layout overrides on data tables |
| `<th>` | `columnheader` / `rowheader` | A bold `<td>` is just a `cell` |
| `<details>` / `<summary>` | `group` / disclosure button with expanded state | Don't add `role=button` to summary; don't name `details` |
| `<dialog>` via `showModal()` | `dialog` [modal] | Page behind becomes inert automatically. Via `show()` it's non-modal |
| `popover` attribute | no role of its own (a `div` popover becomes `group`) | The invoker gets `aria-expanded` automatically. Give the popover a role that fits its content |
| `inert` | removed from the tree |  |
| `hidden="until-found"` | removed until found by find-in-page | Don't combine with `aria-hidden` |
| `<output>` | `status` (a live region) |  |
| `<progress>` / `<meter>` | `progressbar` / `meter` | Both need names |
| `input type=search` | `searchbox` |  |
| `input` with `list` → `<datalist>` | `combobox` |  |
| `input type=number` / `range` | `spinbutton` / `slider` |  |
| `input type=checkbox switch` | `switch` where supported, else `checkbox` | Experimental; `role="switch"` on a checkbox is the robust option |
| `<select>` (single, size ≤ 1) | `combobox` | `multiple` or `size` > 1 gives `listbox`. Customisable select (`appearance: base-select`) keeps these roles; content inside the button is inert |
| `<time>`, `<mark>`, `<del>`, `<ins>`, `<code>`, `<strong>`, `<em>` | `time`, `mark`, `deletion`, `insertion`, `code`, `strong`, `emphasis` | Mostly not announced by screen readers by default. Don't rely on them to convey meaning (e.g. a struck-through old price needs visually-hidden "Was" text) |
| `<abbr title>` | no role; the title is a description | Expansions aren't reliably read |
| `<hr>` | `separator` |  |
| `<div>`, `<span>`, `<b>`, `<i>` etc. | `generic` | Omit unless named or needed for structure |
| `<iframe>` | `iframe` (Chrome) / `internal frame` (Firefox) named by `title` | Always needs a `title` |

## 4. ARIA in HTML: rules that change the tree

- **First rule of ARIA:** a native element with the semantics built in beats an ARIA role on a `div`. The tree should reflect native elements by default; if you specify an ARIA role, have a reason.
- **Children presentational:** these roles flatten everything inside them to text — a heading or link inside them disappears: button, checkbox, img, meter, menuitemcheckbox, menuitemradio, option, progressbar, radio, scrollbar, separator, slider, switch, tab. **Never show a heading, list or link nested inside one of these in a tree.** (Common design ask: "the whole card is a button" — the card's heading is then no longer a heading.)
- **`role="presentation"`/`none` is ignored** if the element is focusable or has any global ARIA attribute (e.g. `aria-label`, `aria-describedby`).
- **`aria-hidden="true"`** must not be on a focusable element or any ancestor of one. Keyboard users can still tab to it and hear nothing, or something wrong. In ARIA 1.3, `aria-hidden="false"` no longer re-exposes anything.
- **Native state beats ARIA state:** `<input type=checkbox checked aria-checked="false">` is checked. Don't duplicate native attributes with ARIA (`disabled` + `aria-disabled`, `required` + `aria-required`).
- **`disabled` vs `aria-disabled="true"`:** `disabled` removes the control from the tab order and from many screen readers' focus navigation. `aria-disabled` keeps it focusable, so a user can find it and hear why it's unavailable. APG recommends `aria-disabled` for disabled items within composite widgets (tabs, menu items, options, toolbar buttons). Say which one in the tree.
- Allowed roles are constrained per element. For example, `<img alt="">` can only be `none`, and `<li>` in a list can only be `listitem`.

## 5. Reading like the real inspector

Chrome DevTools (Elements › Accessibility, "Enable full-page accessibility tree") shows ARIA role names in lowercase (`heading`, `link`, `button`, `navigation`, `image`, `generic`, `paragraph`, `list`, `listitem`). Its internal roles are CamelCase (`RootWebArea`, `StaticText`, `LineBreak`, `LabelText`). It hides unnamed `generic` nodes and "ignored" nodes by default. Properties use these names: `level`, `expanded`, `checked`, `selected`, `pressed`, `disabled`, `required`, `invalid`, `focusable`, `modal`, `hasPopup`, `multiselectable`, `readonly`, `valuemin`, `valuemax`, `valuetext`, `live`, `atomic`, `busy`, `describedby`, `controls`, `errormessage`.

Firefox's Accessibility Inspector uses platform names instead: `pushbutton`, `entry` (textbox), `checkbutton`, `radiobutton`, `graphic` (image), `text leaf` (text), `landmark` (for nav, main, and so on), `pagetab`, `pagetablist`, `propertypage` (tab, tablist, tabpanel), `outline` (tree), `internal frame`, and `section` (generic).

**House convention for the mockup:** use the ARIA / Chrome vocabulary. It's what `computedrole`, Playwright's `getByRole` and axe all use, so the tree maps directly onto test locators. Hide unnamed generics. Chrome shows text as `StaticText` children. The mockup compresses that into a colon form on the parent when the content matters, for example `paragraph: "{{Summary}}"`, so content is never confused with a name. Express states in Chrome's property names.

## 6. Recent platform changes that affect trees (as of September 2026)

- **ARIA 1.3** is still an editor's draft. Its new features are `aria-description`, the braille attributes, `image` as a synonym for `img`, `sectionheader`/`sectionfooter`, `mark`, `suggestion` and `comment`, and multiple IDREFs for `aria-details` and `aria-errormessage`. Use the 1.2 Recommendation as the baseline. Where you use 1.3 features, say so and flag their support.
- **Invoker commands** (`command` / `commandfor`) are Baseline as of late 2025. A button with a popover command gets `aria-expanded` automatically. `show-modal` / `close` open and close `<dialog>` without JS.
- **`interestfor`** (hover and focus hint popovers) is Chromium-only. Don't design around it.
- **Customisable `<select>`** (`appearance: base-select`) is available in Chromium and in recent Safari. It keeps native `combobox` semantics, and rich option content is flattened to text.
- **`ariaNotify()`** is newly Baseline, but its screen reader support is immature (it fails on Safari/iOS). It doesn't appear in the tree. Specify a live region, not `ariaNotify`, unless the project already uses it.
- **Element reference reflection** (`ariaLabelledByElements` etc.) and **Reference Target** (for shadow DOM, Chromium 152+) matter only for web-component-based builds. If the design system uses shadow DOM, flag that cross-root `aria-labelledby` / `for` associations need Reference Target or must be kept inside one root.

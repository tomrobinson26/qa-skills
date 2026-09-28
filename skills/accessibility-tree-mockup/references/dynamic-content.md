# Dynamic content: live regions, focus and real-world support

Read this when the feature changes after load. That covers results that update, validation, loading states, expanding content, dialogs, toasts, timers and carousels. A static tree says nothing about any of this, so for dynamic features the mockup needs a **Behaviour** section (see SKILL.md).

Sources: WAI-ARIA 1.2 / 1.3 ED live region sections, MDN's live regions guide and role pages, WCAG 2.2 Understanding 4.1.3 and techniques ARIA19/22/23/27, APG, GOV.UK Design System, and practitioner testing (Scott O'Hara, Sara Soueidan, TetraLogical, Adrian Roselli). Support data comes from aria-at (2025–26), a11ysupport.io and PowerMapper (Dec 2025).

---

## 1. First decide: move focus, announce, or neither

| The change is… | Do this | Example |
| --- | --- | --- |
| A change of context (new content the user must act on) | **Move focus** | A dialog opens; submit fails and the error summary appears; an SPA route change; the focused item is deleted |
| A status message (4.1.3): result, progress, success, waiting, error that doesn't need action right now | **Announce** via a live region and leave focus where it is | "12 results", "Added to basket", "Link copied", "Loading…" |
| A state change on the control the user just operated | **Neither.** The state attribute is the announcement | `aria-expanded` on an accordion button, `aria-pressed`, `aria-checked`, `aria-selected` |
| Continuous or frequent change the user didn't trigger | Usually **nothing**, plus a pause control | A carousel auto-rotating, a ticking countdown, a live score or price ticker |

Don't do both for the same change. Announcing _and_ moving focus double-speaks.

## 2. Live regions: what to specify

| Role | Implicit behaviour | Use for |
| --- | --- | --- |
| `status` (and `<output>`) | polite, atomic | The default for status messages: counts, confirmations, "Loading…" |
| `alert` | assertive, atomic | Errors or time-critical warnings **only**. Interrupts speech |
| `log` | polite, additions only | Sequential history: chat, activity feeds |
| `timer`, `marquee` | effectively silent; being dropped as live roles in ARIA 1.3 | Don't rely on either to announce anything |
| `aria-live="polite"` on a generic container | polite | Same as status when a role isn't appropriate |

**Rules to write into the tree:**

1. **The region must be in the DOM, rendered and empty before the message is injected.** A region that's added along with its content, or un-hidden already filled, is usually silent. In the tree, show the region as always present: `status — empty until …`.
2. **The region must survive re-renders.** In React, Vue or Angular, a conditionally rendered region is a new element every time, so it's silent. Specify a persistent announcer (one polite and one assertive at page level is plenty), or keep the region mounted and swap its text.
3. **Plain text only.** Live content is read as one flat string. There's no heading or list structure, and links or buttons inside it aren't reachable or conveyed. If a message needs an action, it's a dialog or an inline persistent message, not a live region.
4. **Identical repeat messages aren't announced**, because setting the same text isn't a change. If the same message can recur ("Added to basket" twice), specify clearing the region before repopulating it.
5. **Debounce anything driven by typing.** Result counts and character counts should be announced when the user pauses (around 500–1000 ms), not on every keystroke.
6. **Don't use `alert` for content present at page load.** It's unreliable and disruptive. For a server-rendered error state, move focus to the summary instead (GOV.UK).
7. **Don't double up semantics.** `role="alert"` plus `aria-live="assertive"` double-speaks in VoiceOver on iOS. Adding `aria-live="polite"` to `status` is harmless.
8. **Modal dialogs cut off outside regions.** VoiceOver ignores live regions outside an open modal, and `showModal()` makes the outside inert. Put a region _inside_ the dialog for messages raised while it's open.
9. **`aria-atomic="true"`** is reliably supported; `false` is often ignored (the whole region gets read). Compose the complete message and insert it in one operation.
10. **`aria-relevant`** values other than the default (`additions text`) are unreliable. Don't specify them.
11. **`aria-busy`** is effectively JAWS-only. It won't stop other screen readers reading half-loaded content, so use it as a hint only.
12. **`ariaNotify()`** is Baseline as of September 2026 but AT support is immature and untested. Specify a live region; mention `ariaNotify` only as progressive enhancement if the project uses it.

## 3. Pattern recipes

**Search results / filters**

- A persistent `status` region with "{n} results" and a separate "No results found" message. O'Hara argues the no-results case can be assertive.
- Debounce while typing. For filters that apply instantly, announce the count after each change.
- Describe live-updating behaviour up front in a hint ("Results update as you select filters").
- Announce the count only, never the list itself.

**Form validation (on submit, the house default)**

- Prefix the page title with "Error: ".
- Show an error summary: heading "There is a problem" and a list of links to each field. **Focus moves to the summary.**
- Inline error per field: visually-hidden "Error:" prefix, associated by `aria-describedby`, and `aria-invalid="true"` on the control.
- Use `aria-describedby` rather than `aria-errormessage`, which fails in VoiceOver/Safari, NVDA/Edge, JAWS/Firefox and Narrator.
- Inline validation on blur is possible, but don't validate while the user is still typing.

**Loading**

- A persistent `status`: "Loading {things}…", then "{n} {things} loaded" or the error.
- Skeleton screens are `aria-hidden` and get one announcement between them, not one each.
- No indicator for waits under about 1 second.

**Load more / infinite scroll**

- A real "Load more {things}" button placed after the list.
- On activation: status "Loading…". On completion, either move focus to the first new item (or a focusable marker before the new batch, e.g. "Items 13 to 24"), or announce "12 more loaded" and leave focus on the button, which stays after the list.
- Say which one in the tree.
- Pure infinite scroll traps keyboard users away from the footer, so flag it. If it's unavoidable, use the APG `feed` pattern.

**Toasts / snackbars**

- `status`. No interactive children, no focus.
- Auto-dismiss is only acceptable if the same information is available elsewhere (2.2.1).
- A toast with actions ("Undo") or unique information is really a non-modal dialog or a persistent message. Flag it.

**Add to basket / wishlist / copy to clipboard**

- Focus stays on the button.
- A polite status announces the result ("Blue mug added to basket. Basket: 3 items").
- The button name should identify the item ("Add Blue mug to basket" via visually-hidden text).
- Changing the button's own label ("Copied!") isn't a reliable announcement on its own.

**Character count**

- The count is associated with the textarea by `aria-describedby`.
- A separate polite region announces it after the user pauses typing.
- Don't block typing past the limit (GOV.UK).

**Countdown / timer**

- Visible countdown text is silent (no live region).
- Optionally, a polite status at meaningful intervals ("1 hour remaining"), and an alert only at a critical threshold.
- Session timeouts need an `alertdialog` warning with an "Extend" option (2.2.1).
- Never announce every second.
- The computed value in the tree is `‹computed›`, not a CMS field.

**Carousel**

- The slide wrapper has `aria-live="off"` while rotating and `"polite"` when stopped or manually operated.
- Keyboard focus in the carousel stops rotation until the user restarts it, and the rotation button's label updates to match. Hover pauses rotation only while it lasts.
- The rotation control comes first in the tab order.
- Previous and next buttons don't move focus.

**Progress / upload**

- `progressbar` (prefer native `<progress>`) is **not** a live region.
- Announce milestones through a polite status ("50% uploaded", "Upload complete").

**Accordion / disclosure / tabs**

- No live region. `aria-expanded` / `aria-selected` is the announcement.

## 4. Focus rules to state explicitly

- **Dialog open.** Say where focus goes. The default is the first focusable element. For long or structured content, it goes to the heading or dialog (`tabindex="-1"`). For destructive confirmations, it goes to the least destructive button. For a short informational dialog, it goes to Close. Native `<dialog>` + `showModal()` + `autofocus` handles this.
- **Dialog close.** Focus returns to the trigger. If the trigger no longer exists, say where it goes instead.
- **Tab containment and Escape** for modals. The background is inert.
- **SPA route change.** Update `document.title` and move focus to the new page's `h1` (`tabindex="-1"`) or to a skip-link-style target.
- **Deleting an item.** Move focus to the previous item's equivalent control, or to the list heading if the first item was deleted. Confirm with a status message.
- **Closing a disclosure or menu with Escape.** Focus returns to its toggle.
- **Programmatic focus targets** (headings, the error summary, a new batch marker) get `tabindex="-1"`, not `0`.
- **Focus not obscured (2.4.11).** Where the design has sticky headers, sticky footers, cookie banners or chat widgets, flag that `scroll-padding` or an equivalent is needed so the focused element is never fully covered.

## 5. Support risks worth flagging in the Risks section

Only flag these when the tree actually uses them:

| Feature | Risk | Prefer |
| --- | --- | --- |
| `aria-roledescription` (incl. APG carousel "carousel" / "slide") | Inconsistent across JAWS, VoiceOver and TalkBack; not machine-translated | Acceptable in the APG carousel, but flag it. The roledescription value must be a dictionary string |
| `aria-description` | Patchy in VoiceOver, description changes are often missed, and not translated | `aria-describedby` pointing at real text |
| `aria-details` | Not supported by VoiceOver, TalkBack or Narrator | Visible content, or a link to it |
| `aria-errormessage` | Fails in several major pairings | `aria-describedby` |
| `aria-controls` | Announced by nothing (only JAWS has a jump command) | Fine to include, but it conveys nothing |
| `aria-pressed` | VoiceOver/macOS doesn't announce the state change; `mixed` fails almost everywhere | Use it, and flag VoiceOver testing. Never use `mixed` |
| `aria-haspopup` values other than `true`/`menu` | Partial on TalkBack and Narrator | Fine on desktop; flag mobile |
| `aria-posinset` / `aria-setsize` | "n of m" not reliably spoken by NVDA in browse mode | Don't depend on it for essential information |
| `role="application"` | Switches off screen reader reading keys | Almost never appropriate on a content site. Flag it |
| `title` as the only name | Missed by touch, keyboard and many screen reader users | Visible text or a real label |
| `aria-label` on div/span/p | JAWS and NVDA ignore it; VoiceOver and Narrator read it inconsistently | A real role, or text content |
| `list-style:none` lists (Safari) | List semantics dropped outside `<nav>` | `role="list"` |
| `display:flex/grid/contents` on tables, lists, buttons | Semantics lost; `display:contents` buttons become inoperable in Safari | Keep display on wrappers, or specify explicit roles |
| `hidden="until-found"` | No Safari support | Progressive enhancement only |
| Headings inside buttons or `<summary>` | The heading is flattened and missing from heading navigation (JAWS doesn't support headings in summary) | A button inside a heading (APG accordion) |
| `alert` role word | JAWS and VoiceOver often don't speak "alert" | Put the meaning in the message text ("Error: …") |
| VoiceOver macOS and modal dialogs | May not announce the dialog role or name on open | Focus a heading at the top of the dialog when the name matters |

## 6. Expected announcements (optional column)

If the user wants an "expected announcement" per node, write it in the NVDA and Chrome form (name, role, state) and label it **approximate**. Wording differs between screen readers, verbosity settings and navigation commands. Typical shapes:

- `button "Apply"` → "Apply, button"
- `link "Home" [current=page]` → "Home, link, current page"
- `heading "Latest news" [level 2]` → "heading level 2, Latest news"
- `button "Delivery" [expanded=false]` → "Delivery, button, collapsed"
- `checkbox "Yes" in group "Do you approve?"` → "Do you approve?, grouping, Yes, checkbox, not checked"
- `navigation "Footer"` → "Footer, navigation landmark"
- `table "Opening times"` (4×3) → "Opening times, table with 4 rows and 3 columns"
- `dialog "Add address"` → "Add address, dialog", followed by the focused element

Known divergences:

- VoiceOver on macOS omits heading levels in some modes.
- TalkBack speaks state first for toggles.
- JAWS says "region" instead of "landmark".
- JAWS and VoiceOver often skip saying "alert".

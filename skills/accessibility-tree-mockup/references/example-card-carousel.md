# Worked example: Featured stories carousel block

This example shows the full output for a typical CMS block. Things to notice:

- The **Context** line states the placement assumptions that drive heading levels.
- The tree uses `{{field}}`, `[[dictionary]]` and `‹computed›` markers throughout, so every string
  has a declared source.
- The design shows no heading on mobile, and the heading is optional in the content model. That
  single fact produces a variant, a NEW field, and a Refinement risk.
- The Behaviour table covers only what changes. The risks are tagged and specific, and none of them
  restates the tree.

---

**Input (summarised):** a Figma frame for a "Featured stories" block. It has an optional section
heading and intro, and 3–8 story cards (image, category tag, title, summary, whole card clickable).
It has previous/next arrows, pagination dots, a "View all stories" button, and an "Auto-rotate"
toggle in the CMS. Desktop shows three cards per view; mobile shows one. The existing content model
has these properties: Heading (optional), Intro, Stories (content area of Story card), CTA label,
CTA link, Auto-rotate (toggle). Story card has Title, Summary, Image, Category, Link.

---

# Accessibility tree: Featured stories carousel

**Context:** block in the main content area, which can appear more than once per page. It sits
under the page `h1`, so the block heading is `h2` by default. The site is multilingual. Built from
the Figma frame plus the existing content model. Vocabulary: ARIA/Chrome.

## Tree: default state

```
region "{{Heading}}" [roledescription=[[carousel.roledescription]]]   — aria-labelledby → heading
├─ heading "{{Heading}}" [level 2]
├─ paragraph: "{{Intro}}"                                                 — only if Intro filled
├─ button "[[carousel.stopRotation]]"                                    — only if Auto-rotate on; first control; swaps to [[carousel.startRotation]]
├─ button "[[carousel.previous]]"                                        — icon aria-hidden
├─ button "[[carousel.next]]"
├─ list [live=off while rotating / polite otherwise]                     — role="list" (list-style:none)
│  ├─ listitem
│  │  └─ group "‹computed: [[carousel.position]] 1 of 6›" [roledescription=[[carousel.slide]]]
│  │     ├─ StaticText "‹computed: 1 of 6›"                             — visually hidden; makes the position part of the announced content
│  │     ├─ heading "{{Story title}}" [level 3]
│  │     │  └─ link "{{Story title}}"                                     — stretched over the card via ::after
│  │     ├─ paragraph: "{{Story summary}}"
│  │     └─ StaticText "{{Story category}}"
│  │     (card image: alt="" — decorative, title carries meaning; after the heading in DOM order)
│  ├─ listitem … slides 2–3 as above (visible on desktop)
│  └─ listitem … slides 4–6 — hidden (visibility:hidden after the transition) and so out of the tree and tab order
├─ group "[[carousel.chooseSlide]]"                                      — pagination dots
│  ├─ button "{{Story title}}" [disabled]   — current slide; via aria-disabled=true so it stays focusable
│  │  description: "[[carousel.current]]"
│  └─ button "{{Story title}}" …
└─ link "{{CTA label}}"                                                  — only if CTA label + CTA link filled
```

## Variants

### Heading empty (optional field)
```
region "[[carousel.defaultLabel]]" … — or {{Carousel label}} if filled (see Accessible text requirements)
├─ (no heading)
└─ list
   └─ … heading "{{Story title}}" [level 2]  ← story titles move up a level, because nothing is at level 2 for them to nest under
```

### Mobile (< 768px): one card per view
Same tree, with one visible slide. Slides 2–6 are hidden. The dots become the primary navigation,
and the tree doesn't otherwise change.

### One story only
```
region "{{Heading}}"
├─ heading "{{Heading}}" [level 2]
└─ … single card …    — no rotation, previous/next or dot controls rendered; no roledescription
```

## Behaviour

| Trigger | Tree change | Focus | Announcement |
|---|---|---|---|
| Page load with Auto-rotate on | Slides advance every N seconds; the list has `live=off` | Unchanged | None |
| Keyboard focus enters the carousel | Rotation **stops** and doesn't restart unless the user asks. The button's name becomes `[[carousel.startRotation]]`; the list has `live=polite` | Unchanged | None |
| Pointer hovers over the carousel | Rotation pauses while hovering and resumes on leave. The button's name is unchanged; the list stays `live=off` | Unchanged | None |
| User activates Stop rotation | The button's name becomes `[[carousel.startRotation]]`; the list has `live=polite` | Stays on the button | Most screen readers re-read the changed name, but not all do. There's no live region, and the label swap is the APG approach |
| Previous / Next | Advances one card. The newly visible slide is un-hidden (an addition to the live list); the slide that left is hidden | **Stays on the button** | Polite, best-effort: the new slide's text content, starting with its visually hidden position ("4 of 6, {{Story title}}, …"). A group's *name* isn't read by live regions, hence the hidden text |
| Dot activated | That slide becomes current; its dot becomes `[disabled]` (aria-disabled) | Moves to the slide group (`tabindex=-1`) | Read on focus |

## Accessible text requirements

| Tree node | Text needed | Source | Proposed property / key | Type | Required | Translatable | Helper text / notes |
|---|---|---|---|---|---|---|---|
| region (heading empty) | Region name when there's no visible heading | Editor field — NEW | Carousel label | Plain text | No | Yes | "Used by screen readers to identify this carousel when no heading is shown, e.g. 'Featured stories'. Not displayed." Falls back to `carousel.defaultLabel`. |
| heading (block) | Correct level when placed below another section | Editor field — NEW | Heading level | Single select | No | No | Options H2, H3, H4. Default H2. "Choose H3 if this block sits inside a section that already has a heading." Story titles are computed as this level + 1. |
| image (story card) | Decision on alt text | Editor field — NEW | Decorative image (on Story card) | Toggle | No | No | Default **on** for this block, because the title is always present. If an editor turns it off, Image alt text becomes required. |
| image (story card) | Alt text when not decorative | Editor field — NEW | Image alt text (on Story card) | Plain text | No (validated: required when Decorative image is off) | Yes | "Describe what the image shows that matters here, usually in a sentence or less." Asset alt text is used as an editable default. |
| button (rotation) | "Stop slide rotation" / "Start slide rotation" | Dictionary — NEW | carousel.stopRotation, carousel.startRotation | — | — | Yes | |
| button (prev/next) | "Previous slide" / "Next slide" | Dictionary — NEW | carousel.previous, carousel.next | — | — | Yes | |
| region / group | Role descriptions | Dictionary — NEW | carousel.roledescription ("carousel"), carousel.slide ("slide") | — | — | Yes | Must be localised: `aria-roledescription` isn't machine-translated |
| group (slide) and hidden slide text | "1 of 6" | Computed | carousel.position = "{x} of {y}" | — | — | Yes (template) | Used for both the group name and the visually hidden text. Don't include the word "slide"; the roledescription supplies it |
| group (dots) | "Choose slide to display" | Dictionary — NEW | carousel.chooseSlide | — | — | Yes | |
| button (current dot) | "Current slide" (description) | Dictionary — NEW | carousel.current | — | — | Yes | Referenced by aria-describedby, not appended to the name |
| region | Fallback label | Dictionary — NEW | carousel.defaultLabel ("Featured stories") | — | — | Yes | Used only when both Heading and Carousel label are empty |
| link (CTA) | Unique, descriptive label | Editor field — existing | CTA label | — | — | — | Governance risk; see Risks 4 |

## Risks and decisions

1. **[Refinement]** Heading is optional, but it names the region and parents the story headings.
   The decision needed is whether to add *Carousel label* plus a dictionary fallback (proposed
   above) or make Heading required. Without one of them, two carousels on a page are
   indistinguishable in the landmarks list (4.1.2, 1.3.1).
2. **[Design]** The design makes the whole card clickable. Build it as a stretched title link.
   A wrapping `<button>` would flatten the heading (children presentational). A wrapping `<a>`
   keeps the heading, but it makes the entire card text the link name and forbids any nested
   link. The category tag must not be a separate link inside the stretched area
   unless it's layered above it.
3. **[Dev]** Out-of-view slides must be hidden from the tree, not just visually clipped. Otherwise
   keyboard users tab into invisible links (2.4.3, 2.4.7). The rotation control comes first in the
   tab order. Keyboard focus stops rotation for good; hover only pauses it (2.2.2). On desktop, if
   Previous/Next ever advance three cards at once, the polite announcement would read three whole
   cards. Keep it to one card per press, or announce only the position.
4. **[Content]** The CTA label is free text. Editors can enter "View all" on two carousels that lead
   to different listings, which fails 2.4.4 in practice. Add helper text asking for a specific label
   ("View all stories"), and include it in the content QA checklist.
5. **[Dev]** `aria-roledescription` support is inconsistent (TalkBack largely ignores it, and JAWS
   has bugs). It's acceptable per APG, but the slide position name must stand on its own, and it
   should be tested with VoiceOver iOS and TalkBack.
6. **[Design]** The design doesn't show focus styles for the arrow and dot controls, or the
   paused/playing state of the rotation button. Both are needed before build (2.4.7, 1.4.11).

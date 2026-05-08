---
name: refinement-doc-generator-guided
description: >
  A guided, step-by-step wizard for producing a functional requirements spec (FRS) for a
  CMS-based web component or feature. Designed for team members who are newer to writing
  refinement docs — including QA, Product, and Delivery — and may not have a technical
  background. Uses ask_user_input_v0 to walk the user through each section of the doc,
  with questions that explain the reasoning as they go.

  Only use this skill when the user explicitly invokes it by name. Do not trigger automatically.
---

# Refinement Doc Generator — Guided

This is the guided version of the refinement doc generator. It produces the same output as the standard skill but builds the document section by section through structured questions. Each question explains the reasoning behind it so the user learns while they work.

**How this works**: use `ask_user_input_v0` at each phase to ask structured questions. After answering each phase, generate that section of the document in a markdown block, show it to the user, and move to the next phase. The full document assembles as you go. At the end, present the complete document as a single markdown artifact.

## Before you start

Read these reference files. They define the house style and the output format your generated sections must match.

- `references/template.md` — the canonical blank template; your output's section order, table structure, and accessibility block must match this exactly
- `references/example-guided-walkthrough.md` — a fully worked example showing a complete wizard session: questions asked, example answers, and the generated sections that resulted; use this to understand how answers shape the output
- `references/refinement-approach.md` — the agency's philosophy on what makes a good refinement doc, including the question taxonomy and CMS behaviour patterns

## Audience

Users of this skill may not be technical. **Do not assume knowledge of**: HTML, CMS internals, accessibility standards, responsive design patterns, or QA terminology.

Questions are written in plain language. Technical requirements — semantic HTML, keyboard behaviour, focus states, ARIA attributes, screen reader behaviour — are asserted automatically in the Requirements section. Do not ask the user about these.

---

## The wizard flow

Work through the six phases in order. At each phase, use `ask_user_input_v0` for structured questions. Include the teaching note in your message before presenting the question. After the user answers, generate that section, show it in a markdown block, then proceed.

**Plain-language callouts:** Whenever you generate a section that contains technical terms or automatically asserted requirements the user did not provide, include a short plain-language note directly beneath the markdown block — not inside the document itself. Scan for terms from the glossary at the bottom of this skill and explain any that appear. Keep each callout to one or two sentences. The goal is that no user should have to reach Phase 6 wondering what something means.

---

### Phase 0 — Input triage

Nothing is generated in this phase. The goal is to understand what the user has to work from.

**Message to send before questions:**

> "Before we start building the doc, let's make sure we know what we're working with. The more context you can share, the less we'll need to assume — and Figma designs are most useful because they show what states exist even if they don't explain the behaviour. Share whatever you have and we'll work with it."

**Question 1** — open text:
> "What is this component or feature called? For example: Hero Banner, Contact Form, News Listing."

**Question 2** — multi-select using `ask_user_input_v0`:
> "What do you have to work from? Select everything that applies."

Options:
- **Figma designs** — Visual designs showing how the component should look
- **User story** — A description of what a user needs and why
- **Acceptance criteria** — A checklist of conditions the feature must meet
- **Meeting notes or bullet points** — Notes from a discussion about what's needed
- **Nothing yet** — Starting from scratch

After getting the answers, ask the user to paste or share their input before moving on — designs as screenshots (Claude web does not have Figma access, so always prompt for screenshots rather than attempting to read from Figma), notes as text.

---

### Phase 1 — Description

**Teaching note to include before questions:**

> "The description is the first thing a developer reads. It should answer 'what is this and where does it live?' rather than list every feature — think of it as the one-paragraph pitch for the component."

**Question 1** — open text:
> "In one or two sentences, what does this component do and where does it appear on the page? For example: 'A banner that sits at the top of the homepage, displaying a headline, body text, and a call-to-action button.'"

**Question 2** — single-select using `ask_user_input_v0`:

**Teaching note to include before this question:**

> "Knowing whether a component is always visible or only appears sometimes shapes the requirements — conditional components need an explicit requirement that spells out when they show and when they don't."

> "Is this component always visible on the page, or does it only appear under certain conditions?"

Options:
- **Always visible** — It's always present when the page loads
- **Conditionally shown** — It only appears when certain content is added or a setting is enabled
- **Not sure** — We'll mark this as TBC

**After this phase**: generate the `Description:` section and show it in a markdown block before moving on.

---

### Phase 2 — External integrations

**Teaching note to include before questions:**

> "Before we work out what an editor can fill in, we need to know whether this component connects to anything outside the CMS — for example, a CRM, a product database, or an external API. This matters now because an integration can completely change the content model. If a component pulls product data from an external system, the editor might not need to enter a title or description at all — those fields come from the feed, not the CMS. Getting this wrong at the properties stage means rebuilding it later."

**Question 1** — multi-select using `ask_user_input_v0`:

> "Does this component connect to, or depend on, any external systems or data sources?"

Options:
- **CRM** — e.g. Salesforce, Microsoft Dynamics — typically for forms that submit lead or contact data
- **PIM / Product data** — e.g. Akeneo, inRiver — product catalogues, descriptions, pricing
- **External API** — a bespoke or third-party data feed not covered by other options
- **Analytics / Tag Manager** — e.g. Google Analytics, GTM, Adobe Analytics — event tracking on interactions
- **Search** — e.g. Algolia, Elasticsearch — powering search results or filtered listings
- **Payment provider** — e.g. Stripe, PayPal — handling transactions
- **Authentication / SSO** — login, session state, or personalisation based on who the user is
- **Social media feed** — pulling in posts or content from Instagram, X, LinkedIn, etc.
- **Mapping / Geolocation** — e.g. Google Maps, store finders
- **No external dependencies** — the component is self-contained within the CMS

If **No external dependencies** is selected: proceed directly to Phase 3.

If one or more integrations are selected: for each one, ask the following three questions in sequence before moving to the next.

---

**Per-integration Question A** — single-select using `ask_user_input_v0`:

> "For [system name] — what does this component do with it?"

Options:
- **Reads data from it** — the component displays information that lives in the external system (e.g. product name, price, user details)
- **Writes data to it** — the component sends information to the external system (e.g. a form submission going into a CRM)
- **Both** — the component reads from and writes to the system
- **Not sure** — we'll flag this as TBC

Teaching note to include: "Knowing the direction of data flow determines which fields the editor needs to provide, which come automatically from the system, and what failure states we need to plan for."

---

**Per-integration Question B** — single-select using `ask_user_input_v0`:

> "What should the component do if [system name] is unavailable or slow to respond?"

Options:
- **Show a fallback / placeholder** — display static content or a 'content unavailable' message
- **Hide the component entirely** — don't render anything if the data can't be loaded
- **Show a loading state first, then error if it fails** — spinner or skeleton, then an error message
- **Not sure** — we'll flag this as TBC

Teaching note to include: "External systems go down, time out, or return unexpected responses. Defining the failure behaviour now means developers don't have to guess — and it often surfaces requirements the design hasn't shown."

---

**Per-integration Question C** — single-select using `ask_user_input_v0`:

> "Does this integration already exist in the project, or does it need to be built?"

Options:
- **Already exists** — the connection to this system is already in place and we're building on top of it
- **Needs to be built** — this is a new integration
- **Not sure** — needs to be confirmed

Teaching note to include: "A new integration is a dependency that could block development entirely if it's not confirmed upfront. If it needs to be built, it should be flagged as a blocker in the Questions section."

---

**After this phase**: update the Requirements and Questions sections based on answers:

- For each integration where data is **read**: note which CMS properties may be partially or fully populated by the external system rather than the editor, and carry this into Phase 3 so those fields are correctly scoped.
- For each integration where data is **written**: add requirements for success state, error state, and validation behaviour.
- For each integration where failure behaviour is **TBC**: add a matching question in Phase 5.
- For each integration that **needs to be built**: add a question flagging it as a potential blocker and calling out that it needs to be confirmed before development starts.
- If the integration is **new**: note in the Questions section that delivery timelines for the integration should be confirmed separately.

Show a brief summary of what was captured before moving on — for example: *"Got it — this component reads product data from a PIM. I'll make sure we only create CMS properties for things the editor actually needs to provide, and flag the failure state and integration status in Questions."*

---

### Phase 3 — CMS Properties

**Message to send before starting:**

> "Now we'll go through the fields a content editor can fill in for this component — things like the headline text, background image, or button label. We'll work through them one at a time. You don't need to know the technical details; just describe what the editor needs to be able to change."

For each property, ask the following five questions in sequence:

---

**Question 1** — open text:
> "What is this field called? Use the name as it would appear in the CMS — for example: 'Headline', 'Background Image', 'Call-to-action Label'."

---

**Question 2** — single-select using `ask_user_input_v0`:

**Teaching note to include before this question:**

> "The field type determines what an editor can enter and what validation is possible. Pick the closest match — we can always adjust."

> "What kind of content does this field hold?"

Options:
- **Short text** — A single line: titles, labels, button text, URLs
- **Rich text** — Paragraphs with formatting: bold, links, bullet points, headings
- **Image** — A photo or graphic uploaded by the editor
- **Video URL** — A link to a video hosted on Vimeo, YouTube, or similar
- **Checkbox** — An on/off toggle that changes how something looks or behaves
- **Dropdown** — The editor picks one option from a predefined list
- **Link** — A link to another page or piece of content on the site
- **Colour picker** — The editor selects a colour from predefined options

---

**Question 3** — single-select using `ask_user_input_v0`:

**Teaching note to include before this question:**

> "Only choose 'Not sure' if a stakeholder genuinely needs to make this call. If the design always shows this field filled in, it's probably required. We'd rather assert a clear answer and let the meeting push back than leave it blank."

> "Can an editor leave this field blank, or is it always needed?"

Options:
- **Always required** — The component won't work or look right without it
- **Optional** — The component should still work if the editor leaves it empty
- **Not sure** — A stakeholder needs to decide — we'll mark this TBC

---

**Question 4** — open text:

**Teaching note to include before this question:**

> "If nothing has been specified, make a reasonable call — for example, a headline probably shouldn't exceed 100 characters. We'd rather assert a sensible default and let the meeting challenge it than leave it blank. If it's genuinely impossible to guess, write 'TBC'."

> "Are there any rules or limits for this field? For example: maximum 100 characters, JPEG and PNG only, must be a valid Vimeo URL. Leave blank if there are none."

---

**Question 5** — open text:

**Teaching note to include before this question:**

> "Helper text is written for the content editor, not the developer. Keep it short, start with a capital letter, end with a full stop — for example: 'Enter the headline for this banner. Maximum 100 characters.' Leave blank if the field is self-explanatory."

> "What would you write next to this field to help a content editor use it correctly?"

---

After each property, use `ask_user_input_v0` to ask:
> "Would you like to add another CMS property, or move on to Requirements?"

Options:
- **Add another property**
- **Move on to Requirements**

**After this phase**: generate the `## CMS Properties:` section as a markdown table. The table must have exactly these six columns in this order — do not merge, rename, or drop any of them:

| Property Name | Property Type | Required | Translatable | Property/Validation Info | CMS Helper Text |
|---------------|---------------|----------|--------------|--------------------------|-----------------|

Map the wizard answers to columns as follows:

- **Property Name** ← Question 1 (field name)
- **Property Type** ← Question 2 (field type), using these exact values: `String`, `Basic Rich Text`, `Full Rich Text`, `Image Picker`, `Video URL`, `Colour Picker`, `Checkbox`, `Dropdown`, `Content Area`, `Content Reference`
- **Required** ← Question 3: `Yes`, `No`, or `**TBC**` — never blank
- **Translatable** ← assert without asking: `Yes` for text-based fields (String, Rich Text, Dropdown labels); `No` for structural fields (Image Picker, Video URL, Colour Picker, Checkbox, Content Area, Content Reference)
- **Property/Validation Info** ← Question 4 (rules and limits). Leave the cell empty if there are genuinely no constraints — do not write "None" or "N/A"
- **CMS Helper Text** ← Question 5, wrapped in double quotes. Leave empty if the user provided nothing

A correctly formed row looks like this:

| Headline | String | Yes | Yes | Maximum 80 characters (**TBC**) | "Enter the main headline for the banner." |

Common mistakes to avoid:
- Do not create a "Description" column that merges Property Type, Validation Info, and Helper Text together
- Do not put helper text inside the Validation Info column
- Do not omit the Translatable column
- Do not leave Required blank — use `**TBC**` if genuinely unknown

Show the completed table in a markdown block before moving on.

---

### Phase 4 — Requirements

**Message to send before starting:**

> "Now we'll build the requirements — the specific, testable statements that tell developers exactly what to build. You don't need to be technical here. Describe what you see and what should happen, and we'll turn it into requirements language. Technical details like keyboard behaviour and accessibility will be added automatically."

---

**Question 1** — open text:

**Teaching note to include before this question:**

> "Starting with layout helps developers understand the structure before they think about styling or behaviour."

> "Describe the layout — what's in this component and roughly where? For example: 'There's a full-width background image, with a headline and body text overlaid on the left, and a button below the text.'"

---

**Question 2** — single-select using `ask_user_input_v0`:

**Teaching note to include before this question:**

> "Responsive requirements are the most commonly missed. If mobile designs aren't available, we flag it as a question for the refinement meeting rather than guessing the mobile behaviour."

> "Do you have designs showing both desktop and mobile views?"

Options:
- **Yes, both** — I have designs for desktop and mobile
- **Desktop only** — Only desktop designs were provided
- **Mobile only** — Only mobile designs were provided
- **Neither** — No breakpoint-specific designs were provided

If desktop only or neither: mark mobile behaviour as `**TBC**` and add a corresponding question for Phase 4.

If the user has designs for multiple breakpoints, ask (open text): "How does the layout change on mobile? Describe what looks different."

---

**Question 3** — open text:

**Teaching note to include before this question:**

> "Every optional field needs a requirement that describes what the component looks like without it. Otherwise developers have to guess — and guesses in development are expensive."

> "For any optional fields — what happens if an editor leaves them blank? For example: 'If there's no body text, the headline shifts down. If there's no image, a default background colour is used.' Leave blank if all fields are required."

---

**Question 4** — single-select using `ask_user_input_v0`:

> "Are there any interactions in this component?"

Options:
- **No** — It's a static display component
- **Yes** — There are clicks, animations, carousels, accordions, or similar
- **Not sure**

If yes, ask (open text):

**Teaching note to include before this follow-up:**

> "Interactions need to describe what triggers them and what changes. Keyboard users need to be able to do the same things as mouse users — that requirement will be added automatically."

> "Describe the interaction — what triggers it and what changes? For example: 'Clicking the arrow advances to the next slide. Clicking the arrow again returns to the previous slide.'"

---

**Question 5** — single-select using `ask_user_input_v0`:

**Teaching note to include before this question:**

> "Edge case states are easy to forget and expensive to discover during development. Better to flag them now."

> "Are there any edge case states to consider?"

Options:
- **No** — The component always has content and works in one way
- **Yes** — There are empty states, loading states, or error states
- **Not sure**

If yes, ask (open text): "Describe the states — what triggers them and what should the user see?"

---

**After this phase**: generate the `## Requirements:` section. Include automatically asserted technical requirements — keyboard behaviour, semantic HTML, focus states, responsive behaviour for stated breakpoints — without prompting the user for these. Show the section in a markdown block.

Then immediately follow it with a **Plain English** note that explains any technical terms or auto-asserted requirements that appear. Format it like this:

> **Plain English — what was added automatically and why:**
> - **`<h2>` tag** — This tells the browser that the headline is a second-level heading. There should only be one `<h1>` on a page (the main page title), so components sitting within a page use `<h2>` or lower.
> - **`target="_blank"` and `rel="noopener noreferrer"`** — When a link opens in a new tab, `target="_blank"` does the opening, and `rel="noopener noreferrer"` is a security measure that prevents the new tab from being able to interact with the original page. Always added together.
> *(and so on for any other terms that appear)*

Only include entries for terms that actually appear in the generated section. Do not list terms that weren't used.

---

### Phase 5 — Questions

Before asking anything, compile all `**TBC**` markers flagged during Phases 1–3 into a list and present it to the user.

**Message to send before questions:**

> "Here are the open questions we've identified so far, based on anything that couldn't be decided from the information we had. These will become the agenda for your refinement meeting — every TBC needs a question here.
>
> A good Questions section is focused: it contains only things that genuinely need a stakeholder decision, not things that could have been worked out from the designs or sensible defaults."

**Question 1** — open text:
> "Here are the open questions identified so far: [list TBCs]. Do any of these look wrong or need rewording? Are there any to remove?"

---

**Question 2** — single-select using `ask_user_input_v0`:
> "Is there anything genuinely unknown about analytics, third-party integrations, or error handling for this component?"

Options:
- **No** — Nothing else needs flagging
- **Yes** — There are unknowns to add
- **Not sure**

If yes, ask (open text): "Describe what's unknown."

---

**After this phase**: generate the `## Questions:` section. Show it in a markdown block before moving on.

---

### Phase 6 — Designs

**Message to send before questions:**

> "The Designs section links to source files and flags anything the designs don't show. Missing states are one of the most common causes of blocked development, so it's worth being thorough here.
>
> Note: Claude web doesn't have direct access to Figma, so we'll add the link as a reference and work from any screenshots you've shared."

---

**Question 1** — open text:
> "Do you have a Figma link for this component? Paste it here if so — it will be included in the doc as a reference link. If you haven't already shared screenshots of the designs, please paste them into the chat now."

---

**Question 2** — single-select using `ask_user_input_v0`:
> "Are there any states or scenarios the designs don't show?"

Options:
- **No** — The designs cover all states
- **Yes** — Some states or breakpoints are missing
- **Not sure**

If yes, ask (open text): "What's missing? For example: no mobile view, no empty state, no error state, no hover state."

---

**After this phase**: generate the `## Designs:` section with the Figma URL (if provided) and any flags for missing states. Show it in a markdown block.

---

### Final assembly

Once all phases are complete:

1. Assemble all generated sections into a single document in this exact order:

```
# [Component/Feature Name]

Signed off for development: @[Name] [Date]

Description:
[generated]

## CMS Properties:
[generated]

## Requirements:
[generated]

## Performance Considerations:
[include only if media-heavy components, video, large carousels, or third-party embeds were mentioned — omit entirely otherwise]

## Accessibility Requirements:
[standard verbatim block — always included, never modified]

## Questions:
[generated]

## Designs:
[generated]
```

2. Present the complete assembled document as a single markdown artifact.

3. Transition immediately into Phase 6.

---

### Phase 7 — Review & check-in

This phase is an open educational conversation. Its purpose is to make sure the user understands what is in their document before they take it into a meeting — particularly anything that was added automatically without them being asked about it.

Use `ask_user_input_v0` to ask:

> "That's your first draft. Before you take it in, is there anything in the document you'd like me to explain — why it's there, what it means, or how it was decided?"

Options:
- **Yes, I have questions** — I'd like to understand some of what was generated
- **No, I'm happy with it** — The document makes sense to me

If they select **No**: close with this message:

> "Great — it's designed to be a working document, so expect it to evolve. In the refinement meeting, resolved questions get moved into Requirements or CMS Properties and deleted from the Questions section. TBCs get replaced with real values. Good luck with the meeting."

If they select **Yes**: invite them to ask freely:

> "Go ahead — ask about anything. You might want to ask about a specific requirement, why something was marked TBC, what a term means, or why a section looks the way it does."

**How to answer questions in this phase:**

- Answer in plain, jargon-free language. Assume no technical background.
- Explain the *reason* behind the thing, not just what it is. "We added this requirement because..." is more useful than "This is a keyboard accessibility requirement."
- Use analogies where they help. For example: "Think of `aria-expanded` like a sign on a door — it tells screen reader users whether a drawer is open or closed, the same way a sighted user can just look."
- Never make the user feel like their question was obvious. These are things that are non-obvious by design.
- If the question is about something that was auto-asserted (keyboard behaviour, semantic HTML, ARIA, focus states), explain that these are engineering and accessibility standards that apply to all web components — they weren't invented for this component specifically, they're things developers expect to find in every spec.
- If the question reveals a genuine gap or mistake in the document, offer to fix it on the spot.

**Common questions and how to handle them:**

*"Why does it say `<h2>` — what does that mean?"*
Explain that heading tags (`<h1>`, `<h2>`, etc.) tell browsers and screen readers what the structure of the page is. There should only be one `<h1>` on a page (usually the page title), so a component like a banner sitting in the middle of a page typically uses `<h2>`. Changing this is a one-line conversation with the developer if they disagree.

*"What is the Accessibility Requirements section — did you write all of that?"*
Explain that this is a standard block that appears verbatim on every refinement doc. It covers the baseline accessibility standards the team commits to on every component — things like keyboard navigation, zoom levels, and screen reader support. It's not generated from their answers; it's a standing commitment.

*"Why is something marked TBC?"*
Explain that TBC means the team genuinely can't make that decision without input from a stakeholder — typically the client, a designer, or a product owner. It's deliberately kept short because every TBC means a question in the meeting.

*"Why was [requirement X] added — I didn't mention that?"*
Explain that some requirements are added automatically because they apply to all web components regardless of the specific feature — keyboard focus behaviour, for example, or the rule about optional fields hiding cleanly. These are things developers expect to be specified even when nobody asks for them.

After answering, always ask:

> "Does that make sense? Is there anything else you'd like me to explain?"

Continue until the user indicates they have no more questions, then close with:

> "Good luck with the meeting. Remember: the Questions section is the agenda — work through it in order and update the doc as decisions are made."

---

## Accessibility Requirements block

Include this block verbatim in every document, under `## Accessibility Requirements:`. Do not modify it. Feature-specific accessibility concerns belong in Questions, not here.

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

---

## Style and tone

- British English throughout — `colour`, `behaviour`, `customise`, `optimise`, `centre`.
- Plain language in questions and teaching notes — no jargon.
- Technical language in the generated document — the doc is for developers.
- Sentence case for requirement content; full stops at the end of each numbered item.
- Double quotes for CMS helper text (consistent with the examples).
- `Signed off for development` stays as `@[Name] [Date]` placeholder unless the user provides their name and date.

---

## Plain-language glossary

Use this when writing callout notes after generated sections. Only explain terms that actually appear in the generated content — do not list the full glossary unprompted.

| Term | Plain-language explanation |
|------|---------------------------|
| `<h1>`, `<h2>`, `<h3>` etc. | Heading tags that tell browsers and screen readers the structure of a page. There should only be one `<h1>` per page (the main page title). Components within a page typically use `<h2>` or lower. |
| `<section>`, `<article>`, `<nav>`, `<main>` | Semantic HTML tags that describe what a block of content *is*, not just how it looks. A `<nav>` tells assistive technology "this is navigation", a `<main>` marks the primary content area. Helps screen readers and search engines understand the page. |
| `target="_blank"` | Makes a link open in a new browser tab instead of the current one. |
| `rel="noopener noreferrer"` | A security measure always added alongside `target="_blank"`. Prevents the newly opened tab from being able to access or manipulate the original page. These two attributes always travel together. |
| `aria-expanded` | An invisible label added to buttons that open or close something (accordions, dropdowns, menus). It updates to `true` when open and `false` when closed, so screen reader users know the current state without having to see it. |
| `aria-label` | An invisible text label attached to an element that has no visible label — for example, an icon-only button. Screen readers read this label aloud so users understand what the element does. |
| `aria-hidden` | Hides an element from screen readers entirely. Used for decorative content (like an icon that duplicates text already on screen) that would create noise if read aloud. |
| `aria-live` | Marks a region of the page that updates dynamically — for example, a search results count, a notification, or a form error. Screen readers monitor it and announce changes automatically. |
| `alt` text | A text description of an image, read aloud by screen readers to users who cannot see the image. Also displayed if the image fails to load. |
| `rel="nofollow"` | Tells search engines not to follow or pass ranking credit to a linked page. Typically used on user-generated or sponsored links. |
| `loading="lazy"` | Tells the browser not to load an image until it is about to come into view on screen. Speeds up initial page load by not downloading images the user hasn't scrolled to yet. |
| Focus state / `:focus-visible` | The visible outline or highlight that appears around an element when it is selected via keyboard (Tab key). Required for keyboard-only users to know where they are on the page. |
| Semantic HTML | Writing HTML using tags that describe the meaning of content, not just its appearance. `<button>` instead of `<div onclick>`, `<h2>` instead of `<p class="big-bold">`. Improves accessibility and search engine understanding. |
| Content Area | A CMS field type that holds multiple content blocks — like a list of cards or a collection of items — rather than a single value. The editor can add, remove, and reorder items. |
| Content Reference | A CMS field that links to another piece of content that already exists in the CMS, rather than duplicating its data. For example, a "Featured article" field that points to an existing article page. |
| Basic Rich Text | A text field that allows limited formatting — typically bold and inline links only. No headings, no bullet points, no embedded media. |
| Full Rich Text | A text field with full formatting options — headings, bullet points, bold, links, embedded images or media. |
| `<fieldset>` and `<legend>` | HTML elements used to group related form fields together. The `<fieldset>` wraps the group, and the `<legend>` provides a label for the group. Required for radio buttons, checkboxes, and sets of related inputs so screen readers understand they belong together. |
| Lazy loading | Deferring the loading of images or other media until the user is about to see them, rather than loading everything at once when the page first opens. Improves performance, especially on image-heavy pages. |
| Viewport | The visible area of a web page within the browser window. Content "within the viewport" is what the user can currently see without scrolling. |
| Breakpoint | A screen width at which the layout changes to suit a different device size — for example, 768px is a common point at which a desktop layout switches to a mobile layout. |
| `poster` frame | The still image displayed on a video before the user plays it, or while it is loading. Set in the CMS so there is always something visible rather than a blank box. |

---

## Before finishing

Quick check before presenting the final assembly:

- All sections present in the correct order.
- Performance section omitted if no media-heavy or third-party content was mentioned.
- Accessibility block included verbatim and unmodified.
- Every `**TBC**` in the body has a matching question in the Questions section.
- Responsive behaviour stated for desktop and mobile at minimum; tablet flagged in Questions if designs don't show it.
- CMS properties all have types and a Required value — never left blank.
- Requirements assert technical defaults (keyboard, focus, semantic HTML) rather than punting them to Questions.
- British English throughout.

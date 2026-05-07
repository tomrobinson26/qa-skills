# Functional Requirements Spec Template

This is the blank, canonical template. Match this section order, heading hierarchy, and table structure exactly in every generated document.

---

# [Component/Feature Name]

Description:
[1–2 paragraph overview of what this component/feature is and its purpose.]

## CMS Properties:

### Content tab

| Property Name | Property Type | Required | Translatable | Property/Validation Info | CMS Helper Text |
|---------------|---------------|----------|--------------|--------------------------|-----------------|
| [Field Name] | [Type, e.g. String, Basic Rich Text, Image Picker, Colour Picker] | Yes/No | Yes/No | [Constraints, accepted formats, min/max, allowed options, or **TBC**] | "[Editor-facing helper text, sentence case with full stop.]" |

[Additional tabs — Settings tab, Styling tab — only if the feature genuinely needs them.]

## Requirements:

1. [Atomic, testable, technical requirement.]
2. [Another requirement — include layout, responsive, conditional, and validation logic.]
3. [Image loading — lazy loading for off-screen content, responsive image sources.]
4. [Video loading — deferred loading, poster frames, bandwidth consideration.]
5. [Any feature-specific performance budget concerns.]

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

1. [Specific question raised by a TBC marker or an edge case the input didn't cover.]
2. [Validation / character limit / error-state question.]
3. [Responsive / tablet / breakpoint question.]
4. [Analytics / tracking / integration question if relevant.]

## Designs:

[Link to Figma file or screenshots. Note any missing states — error, loading, empty, hover, focus — or discrepancies between the design and the stated requirements.]

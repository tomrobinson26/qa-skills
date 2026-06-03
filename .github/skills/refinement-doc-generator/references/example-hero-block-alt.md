# Example: Hero Block with Optional Video (v2 — alt design decisions)

Same component name, different design decisions. Shows how the same template accommodates very different feature specs:

- Video does NOT autoplay; click-to-play interaction instead.
- Image has a specific file format constraint (JPEG, PNG).
- Text Area Color is a Required dropdown of five named swatches — note how the options are enumerated with hex values in the Validation Info column.
- The Questions section is much larger (eight items) — that's what happens when the input has more unresolved decisions. Don't be afraid of a long Questions list if the gaps are real.

Compare this with `example-hero-block.md` to see how the spec shape stays constant while the content flexes to match the feature.

---

# [Component] Hero Block with Optional Video

Description:
A component that displays a hero section with an image or video, alongside text content. This block is designed to be visually impactful and introduce key content or messaging at the top of a page.

## CMS Properties:

### Content tab

| Property Name   | Property Type   | Required | Property/Validation Info                                                                               | CMS Helper Text                                                                                      |
| --------------- | --------------- | -------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| Heading         | String          | Yes      |                                                                                                        | "The main heading of the block."                                                                     |
| Body Text       | Basic Rich Text | No       |                                                                                                        | "The optional body text that displays below the Heading."                                            |
| Image           | Image Picker    | Yes      | JPEG, PNG                                                                                              | "The background image for the hero block. Required even when using video as a fallback."             |
| Video URL       | String          | No       | Must be a valid Vimeo URL                                                                              | "Optional Vimeo video URL. If provided, will display instead of the image with a play button."       |
| Text Area Color | Color Picker    | Yes      | Options: Pink 01 (#CE8EC0), Gold 01 (#CCA44F), Red 01 (#FF5835), Blue 01 (#708FFF), Green 01 (#46BB51) | "Select the background color for the text area. This color will be applied behind the text content." |

## Requirements:

1. The Heading renders with an `<H1>` tag.
2. If a Video URL is provided, it overrides the Image display on the frontend, but the Image is still required as a fallback.
3. When a video is present, a play button is displayed over the video thumbnail.
4. Videos do not autoplay on page load. The image is rendered with a play icon, and clicking play will hide the image and start the video playback.
5. The block has a maximum width on wide screens, matching the site's content width.
6. On desktop, the layout is side-by-side with text on the left and image/video on the right.
7. On mobile, the layout stacks with image/video above the text.
8. As the screen size reduces on desktop, the image/video area shrinks until reaching the regular grid width, while text content remains at a fixed width.
9. On mobile, both text and image/video areas are full width.
10. The image/video maintains a 16:9 ratio across all screen sizes.
11. Text always renders in black, regardless of the chosen Text Area Color.
12. The component uses image focal points set in the CMS for optimal display across screen sizes.
13. Only one image/video and one text area are allowed at a time.
14. The image/video is letterboxed when needed to maintain the same height as the text area.

## Accessibility Requirements:

1. All interactive elements must be accessible via tab key and have a clear focus state.
2. Video controls must be accessible via keyboard.
3. All images must have appropriate alt text.
4. Ensure sufficient color contrast between the black text and the chosen Text Area Color background.
5. The component should be usable and legible up to 200% zoom level.

## Browser/Device Compatibility:

Test across required browsers and devices as per project standards, ensuring consistent functionality and appearance.

## Performance Considerations:

1. Optimize image loading for performance, considering lazy loading for off-screen content.
2. Implement efficient video loading to minimize impact on page load times.

## Pending Questions:

1. Should we implement lazy loading for the video to improve initial page load times?
2. Do we need to provide additional options for video sources beyond Vimeo?
3. Should we include an option to enable/disable autoplay for the video?
4. Is there a character limit for the heading or body text fields?
5. Should we implement any animations for the transition between the fallback image and video playback?
6. Do we need to provide any specific error handling for invalid Vimeo URLs?
7. Do we need to implement any tracking or analytics for video plays?
8. Should we provide an option for custom colors beyond the five predefined options for the Text Area Color?

## Designs:

[Link to design files or screenshots]

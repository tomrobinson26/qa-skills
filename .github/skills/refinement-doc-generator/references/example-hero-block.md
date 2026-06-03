# Example: Hero Block with Optional Video (v1)

A fully worked example of the output format. Note how:

- `Subtext` is optional with no validation info — that's fine, leave the cell empty rather than writing TBC when the input genuinely implies "no constraint".
- `Text Color` uses `[Site default]` as the default value — explicit defaults belong in the Validation Info column.
- Requirements are numbered, atomic, and mix layout, behaviour, and conditional rendering.
- Questions are focused — six questions total, not a fishing expedition.

---

# [Component] Hero Block with Optional Video

Description:
A component that displays a hero section with an image or video, alongside text content. This block is designed to be visually impactful and introduce key content or messaging at the top of a page.

## CMS Properties:

### Content tab

| Property Name | Property Type   | Required | Property/Validation Info  | CMS Helper Text                                                                                |
| ------------- | --------------- | -------- | ------------------------- | ---------------------------------------------------------------------------------------------- |
| Heading       | String          | Yes      |                           | "The main heading of the block."                                                               |
| Subtext       | Basic Rich Text | No       |                           | "The optional subtext that displays below the Heading."                                        |
| Image         | Image Picker    | Yes      |                           | "The background image for the hero block. Required even when using video as a fallback."       |
| Video URL     | String          | No       | Must be a valid Vimeo URL | "Optional Vimeo video URL. If provided, will display instead of the image with a play button." |
| Text Color    | Color Picker    | No       | Default: [Site default]   | "Select the color for the text content. If not selected, site default will be used."           |

## Requirements:

1. The Heading renders with an `<H1>` tag.
2. If a Video URL is provided, it overrides the Image display on the frontend, but the Image is still required as a fallback.
3. When a video is present, a play button is displayed over the video thumbnail.
4. Videos autoplay when in view, with sound muted by default.
5. The block has a maximum width on wide screens, matching the site's content width.
6. On desktop, the layout is side-by-side with text on the left and image/video on the right.
7. On mobile, the layout stacks with text above the image/video.
8. As the screen size reduces on desktop, the image/video area shrinks until reaching the regular grid width, while text content remains at a fixed width.
9. On mobile, both text and image/video areas are full width.
10. The component uses image focal points set in the CMS for optimal display across screen sizes.
11. If the Text Color is not set, the component uses the site's default text color.

## Accessibility Requirements:

1. All interactive elements must be accessible via tab key and have a clear focus state.
2. Video controls must be accessible via keyboard.
3. Autoplay videos must have an option to pause/stop.
4. All images must have appropriate alt text.
5. Ensure sufficient color contrast between text and background.
6. The component should be usable and legible up to 200% zoom level.

## Browser/Device Compatibility:

Test across required browsers and devices as per project standards, ensuring consistent functionality and appearance.

## Performance Considerations:

1. Optimize image loading for performance, considering lazy loading for off-screen content.
2. Implement efficient video loading to minimize impact on page load times.

## Questions:

1. Should we implement lazy loading for the video to improve initial page load times?
2. Do we need to provide additional options for video sources beyond Vimeo?
3. Should we include an option to disable autoplay for the video?

## Designs:

[Link to design files or screenshots]

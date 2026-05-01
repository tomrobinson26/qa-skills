Questions to ask during scripting of CMS features

**Field validations**

-   Is the field mandatory? If so, do you see relevant validation
    messaging in the CMS?

-   Is the field optional? if optional how does the rest of the block
    content display?

**Rich Text Editors/WYSIWYG**

-   What level of function does the field have? See [Rich Text Editors
    Requirements](https://twentysix.atlassian.net/wiki/spaces/TEST/pages/3120234497)

-   Does all styling elements display as expected on the front-end?

-   If the field allows bullet and numbered lists, can I add indented
    lists (up to 3), and do these display with the correct styling?

-   Does the field allow content blocks? If so what type of blocks?

-   Does the field allow images? If so, are there any file restrictions?

-   Does the field allow videos? If so, are there any file restrictions?

-   Does the field allow quotes? If so, does they display as expected?

-   Does the field allow tables? If so, is there a maximum number of
    cells? If not, then does the table scroll horizontally on all
    devices?

**Adding blocks to templates**

-   Does the template have a content area?

-   What block types are allowed in the templates content area?

-   What happens if I add disallowed blocks to the content area? Do I
    see relevant validation messaging?

**Boundary content**

-   Is there a maximum character length on the field? If so, when
    reached, do you see relevant validation messaging in the CMS?

-   If no maximum character length then what happens when lots of
    content is added (both in the CMS and the front-end)?

-   What happens when a very small amount of content is added?

**Link and button functionality**

-   If link text is populated without a link: does validation display in
    the CMS? If not, then does the link/button display on the front-end?

-   If link is populated without link text: does validation display in
    the CMS? If not, then does the link text/button display on the
    front-end?

-   Does the link allow internal and external links?

-   Does the link have the ability to open in a new tab?

**Images**

-   If the feature uses a background image, is there a fallback if the
    image field is left empty?

-   Is the image mandatory? If so, do you see relevant validation
    messaging in the CMS?

-   If the image is optional, how does the rest of the content display
    on the front-end?

-   What type of image files does the field accept, e.g. JPG, PNG?

-   If an unaccepted file type is added, do you see relevant validation
    messaging in the CMS?

-   Is there a maximum file size for the feature? If so, when exceeded,
    do you see relevant validation messaging in the CMS?

-   If no maximum file size, then what happens on the front-end when a
    small and very large image is added?

**Min and max items**

-   Is there a maximum number of items allowed within the feature? If
    so, when reached, do you see relevant validation messaging in the
    CMS?

-   If no maximum number of items, then what happens when numerous items
    are added (both in the CMS and the front-end)?

-   What happens when a very small number of items are added?

**Child pages**

-   Are there any restrictions on the type of child pages allowed below
    the template?

-   If so, what happens when alternate child pages are selected? Is this
    even possible?

**Video**

-   Is the video mandatory? If so, do you see relevant validation
    messaging in the CMS?

-   If the video is optional, how does the rest of the content display
    on the front-end?

-   Is there a fallback image available, or does a image preview need
    adding?

-   What type of video files does the field accept, e.g. mp4?

-   If an unaccepted file type is added, do you see relevant validation
    messaging in the CMS?

-   Is there a maximum file size for the feature? If so, when exceeded,
    do you see relevant validation messaging in the CMS?

-   If no maximum file size, then what happens on the front-end when a
    small and very large video is added? Does the feature perform OK?

-   Does the video auto-play on load?

-   What video controls does it have?

-   Does the video auto-loop?

**Carousels**

-   Is there a maximum number of items allowed within the carousel? If
    so, when reached, do you see relevant validation messaging in the
    CMS?

-   If no maximum number of items then does the carousel scroll/swipe as
    expected on all devices?

-   Does the carousel auto-rotate on load?

-   Does the carousel have controls?

-   Does the carousel auto-loop?

**Breakpoints**

-   Does the feature have a specific breakpoint, e.g. should the block
    stack when viewed at 767px and below?

-   Does all content display as expected when the breakpoint is changed?

**Teaser Properties**

-   Does the block/feature get populated by teaser properties from
    another source, e.g. a template?

-   Are the teaser properties on the template mandatory? If so, do you
    see relevant validation messaging in the CMS?

-   If not mandatory, are there any fallbacks?

-   If not mandatory, not populated and no fallbacks, how does the
    feature display on the front-end?

-   Does the teaser content link through anywhere on the front-end?

Questions to ask during scripting of site functionality

**Searching Functionality**

-   Can a user perform an empty search?

    -   If so do all results return?

    -   Is the URL search query correct?

-   Can user successfully search via keywords?

    -   Are matching results returned?

-   Can user update the search?

    -   Are matching results returned?

-   If no results match the search term, is there any 'no result' text?

    -   If so, if this text CMS editable?

-   If user performs an include search, e.g. fgvwakjsfsa, is there any
    'no result' text?

    -   If so, if this text CMS editable?

-   If user performs a breaking search, e.g. inputs some HTML \</b\> and
    searches, does the site error?

-   How many results load per page?

    -   Is this CMS controlled? If so, what happens if we update this?

-   Is there pagination? Does this function correctly?

    -   Does the result count correctly update?

    -   Does the page size correctly load?

-   Are there filters?

    -   If so, are these and \'and or an \'or?

    -   What happens if multiple filters are applied?

    -   Do the filters persist through pagination?

-   Are there any sort order options?

    -   What's the default option?

    -   Do the results correctly update per option?

    -   Does the sort order persist through pagination?

-   If I have filters and a sort order applied, do they persist if I
    paginate the page?

-   If I have filters and a sort order applied, and I click a result,
    then return via the browser, does my search query persist with
    matching results?

-   If I have filters and a sort order applied, I have paginated, and I
    click a result, then return via the browser, does my search query
    persist with matching results?

-   Can I hover with styling changes on all links and results cards?

-   Do all matching result pages load?
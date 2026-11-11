---
title: "My Watchlist — application specification"
summary: "A catalog of 30 TVmaze shows: cards instantiated from a template, personal watchlist, filters, and a 'Details' dialog with user ratings and notes. Numbered rules tested against AI drafts, and the check.html self-check suite. The practical part of Lab 9."
goal: "Bring the 'My Watchlist' application into full compliance with this specification. Each component is first drafted by an AI agent using a brief prompt from the lab, and you audit the draft against the rules below and fix all issues by hand. Each rule is numbered, and the in-browser check.html test suite verifies it under the same number. The practical part corresponds to section 5 of the lab."
label: "Assignment"
highlights:
  - "Provided starter project"
  - "AI draft → audit → hand-crafted fixes"
  - "In-browser check.html self-checks"
  - "Bonus until October 19, 2026"
acceptance:
  - "First commit — starter project unchanged"
  - "For each challenge — a 'Challenge N: AI draft' commit with unmodified draft, and a 'Challenge N: fixes' commit with hand-crafted fixes; if a draft immediately passes its block without breaking earlier ones, omit the fixes commit"
  - "check.html, check/, data/, and src/state.js remain unchanged in every commit"
  - "check.html on the deployed page (GitHub Pages or Vercel) displays 'Passed: 33 of 33'"
  - "Manual checklist (§6) verified on the final build, with results documented in the report"
  - "No innerHTML with data, alert(), timers, fetch, or click listeners bound directly to cards"
  - "Fixes written by you: AI explained, but did not write code"
updated: 2026-10-09
---

## 1. Overview

**“My Watchlist”** is a single-page catalog of 30 shows from
[TVmaze](https://www.tvmaze.com). Users search shows by title and genre, save
shows to their personal watchlist, view show summaries, and record their own
ratings and notes. State is kept strictly in-memory: reloading the page resets
the watchlist and notes.

The static HTML, CSS, sample data, and state management module are already
provided. Your focus is the DOM interaction layer: rendering cards, binding event
delegation handlers, managing forms, operating the dialog, and handling keyboard
focus. The app must work seamlessly with mouse, keyboard, and screen readers.

> The self-check suite represents this specification in code: each row in
> `check.html` corresponds to a rule in §4. If a test and the text below appear
> to conflict, notify the instructor.

## 2. Project structure

**Download:** [watchlist-starter.zip](/en/web/starters/watchlist-starter.zip)
(≈ 40 KB). Extract the archive into a separate repository or into a `lab-9/`
folder in your shared coursework repository.

```text
watchlist-starter/
├── index.html          static markup, card template, and dialog
├── styles.css          styles; state is conveyed via aria-pressed and aria-invalid
├── data/shows.json     30 TVmaze shows
├── src/
│   ├── state.js        data and state management — provided, do not modify
│   ├── main.js         entry point
│   ├── render.js       C1 · cards and status line
│   ├── list.js         C2 · card buttons
│   ├── filters.js      C3 · filters form
│   └── details.js      C4 · dialog and note form
├── check.html, check/  self-check runner
├── experiments.html    markup for research experiments in §4 of the lab
└── README.md           setup, self-checks, deployment, data license
```

Open `index.html` and `check.html` via Live Preview or `npx serve .` in Chrome or
Edge: loading over `file://` prevents ES modules from loading. The file
separation in `src/` is a suggested guideline.

## 3. Markup and data

### 3.1. Static markup contract

The element identifiers and attributes below form an explicit contract expected
by `check.html`. Markup may be extended, but existing hooks must not be renamed.

| Element | Purpose |
| --- | --- |
| `#watchlist-count` | counter value in "In list: N" in the header |
| `form#filters` | fields `name="query"` (search), `name="genre"` (genre), `name="mine"` ("Only my watchlist"), "Reset" button |
| `#results-heading` | "Shows" heading above the card list |
| `#status` | status announcement line, `role="status"` |
| `ul#results` | card container list |
| `template#show-card` | card template: `<li data-id>`, buttons `[data-action="toggle"]` (with `<svg>` icon) and `[data-action="details"]`, data slots `[data-field]` |
| `dialog#details` | modal dialog: `#details-title`, `#details-summary`, `#details-link` |
| `form#note-form` | in dialog: `name="rating"`, `name="note"`, `#note-rating-error`, "Save", "Cancel" |

### 3.2. Data and state: `src/state.js`

Each show object (`Show`) has properties `id`, `name`, `year`, `rating`,
`runtime`, `network`, `genres` — matching the output of `normalizeShow` in Lab 8 —
plus two additional properties:

- `summary` — show description with **HTML markup** from TVmaze (`<p>`, `<b>`, `<i>`);
- `url` — show page URL on TVmaze.

`year` and `rating` may be `null`; `genres` may be empty.

| Export | Description |
| --- | --- |
| `shows` | all shows in data file order (frozen) |
| `watchlist` | `Set` of show ids in the watchlist — read-only |
| `notes` | `Map`: show id → `{ rating, text }` — read-only |
| `getShow(id)` | retrieves show by id |
| `visibleShows({ query, genre, mine })` | returns shows matching active filter options |
| `toggle(id)` | toggles show presence in the watchlist; returns `true` if now added |
| `saveNote(id, { rating, text })` | records user rating (integer **number** 1–10) and note |
| `removeNote(id)` | removes user rating and note |

State methods validate input parameters: `id` must be a number rather than a
string `'82'`. If invalid arguments are passed, they throw descriptive errors.

## 4. Specification rules

### C1. Cards — `src/render.js`

1. On initial load, `#results` contains 30 cards in the order of the data file.
   Data is sourced from `shows` in `src/state.js`, rather than loading
   `data/shows.json` independently. Each card is a clone of `#show-card`:
   `<li data-id="<id>">` containing all template elements.
2. Each card displays title, year, comma-separated genres (`Drama, Crime, Thriller`),
   and TVmaze rating (`9.2`). If year, rating, or genres are missing, display "—".
   Never show `null`, `undefined`, or `NaN`.
3. Data is inserted into the DOM strictly as text (`textContent`) or attribute
   values. Titles containing HTML markup must render as plain text without creating
   DOM elements.
4. "Da Vinci's Demons" — display the full title on the card and in the accessible
   names of both buttons.
5. Each button's accessible name (announced by assistive technologies) contains its
   visible label and the show title: "Add to list: Breaking Bad", "Details about
   Breaking Bad". The visible button labels are only "Add to list" and "Details".
6. The status line is the `#status` element with `role="status"` present in the
   HTML from the start; only its text updates. After rendering: "Found: N of 30",
   where N is the number of rendered cards.
7. If no cards match, the list is empty and status reads "Nothing found".

### C2. Card buttons — `src/list.js`

1. Card button clicks are handled by a **single** delegated `click` listener on
   `#results` (event delegation). Cards and buttons have no individual `click`
   listeners.
2. "Add to list" toggles show membership in the watchlist. State is communicated
   via `aria-pressed="true"` / `"false"`; visible button text and accessible name
   do not change.
3. The `#watchlist-count` counter in the header equals the number of shows in
   your watchlist.
4. Clicking the SVG icon inside the button works identically to clicking its text.
5. Buttons remain functional on cards added to the DOM after initial render.
6. A single click produces exactly one toggle action, regardless of how many
   times the list was re-rendered previously.
7. After clicking "Add to list", focus remains on the "Add to list" button of
   that card — even if the card was re-rendered.

"Details" calls `openDetails(id)` from `src/details.js`; the dialog is built in C4.

### C3. Filters — `src/filters.js`

1. Title search applies as the user types (the `input` event). Comparison is
   case-insensitive and ignores boundary whitespace. The status line updates:
   "Found: N of 30" or "Nothing found".
2. Genre and "Only my watchlist" filters apply immediately on change (`change`
   event). All active filters combine with logical AND; status updates.
3. Pressing Enter in the search field does not reload the page.
4. While typing in the search input, focus remains uninterrupted inside the field.
5. "Reset" clears all inputs, restores all 30 shows, and sets status to
   "Found: 30 of 30".
6. Watchlist state (`aria-pressed`) is preserved across filtering, and card
   buttons remain operational after filters change. "Only my watchlist" displays
   only shows present in the watchlist.
7. When removing a show while "Only my watchlist" is active, that card vanishes
   and focus moves to the "Add to list" button on the next card; if none, to the
   previous card; if no cards remain, to `#results-heading`. This logic lives in
   `src/list.js`.

### C4. "Details" dialog and notes — `src/details.js`

1. "Details" opens `<dialog id="details">` as a modal (`showModal()`), moving
   focus into the dialog.
2. The `#details-title` heading displays the show title; via `aria-labelledby`,
   this also serves as the dialog accessible name. `#details-link` points to the
   show's TVmaze page. Each opening displays the show matching the clicked card,
   without retaining stale content from previously viewed shows.
3. Show summary is rendered in `#details-summary` as plain text — as paragraphs
   or contiguous text. No elements from TVmaze markup enter the DOM, and no
   embedded handlers execute.
4. Pressing Esc or clicking "Cancel" closes the dialog.
5. Upon dialog closure, focus returns to the "Details" button that opened it.

The "My rating and note" form inside the dialog:

6. The form opens pre-populated with data for this specific show: previously
   saved rating and note, or empty inputs, clearing validation errors from
   earlier interactions.
7. "My rating" is a mandatory integer between 1 and 10; "Note" is optional.
   Invalid submissions keep the dialog open without invoking `alert()`. An error
   message linked via `aria-describedby` appears near the input, and the field has
   `aria-invalid="true"`.
8. After an invalid submission, focus moves to the first invalid field.
9. As soon as the user corrects the input (`input` event), the error clears:
   `aria-invalid` is removed and error text is cleared. The form can then be
   submitted.
10. Valid submissions save rating and note, and the card updates to display
    "My rating: 8/10" and note text. Markup in notes renders as plain text.
11. Upon saving, the dialog closes, and the status announces:
    "Note for <show title> saved".
12. After saving, focus returns to the "Details" button of that card (the card
    has been re-rendered, so this is a fresh DOM button).

## 5. Constraints

- You may modify `index.html`, `styles.css`, and files in `src/` (except
  `src/state.js`). `check.html`, `check/`, `data/`, and `src/state.js` must
  remain exactly as provided.
- Access data and state exclusively through `src/state.js`. No third-party
  libraries, frameworks, timers (`setTimeout`, `setInterval`,
  `requestAnimationFrame`), Promises, or `fetch`.
- Focus shifts must happen synchronously within the same event handler. If
  deferred to a timer or microtask, focus drops elsewhere (often `<body>`): the
  focus checks (C2.7, C3.7, C4.5, C4.8, C4.12) will fail.
- No `innerHTML`, `outerHTML`, or `insertAdjacentHTML` with data; no `alert()`,
  `confirm()`, or `prompt()`.
- Fixes must be written by you. The AI agent writes only the initial challenge
  draft and provides explanations (§5.2 of the lab).

## 6. Manual checklist

Because automated test runners dispatch synthetic events (`isTrusted: false`),
verify real keyboard navigation and visible focus outlines manually in Chrome or
Edge (in Safari and Firefox on macOS, clicking a button does not focus it, and
Safari skips buttons on Tab by default).

Walk through the items matching each challenge number upon completing it.
Finally, verify the full checklist on your final submission build and document
the outcome of each item in your report.

1. **Keyboard-only operation:**
   - C2: Tab to a card, press Enter and Space on "Add to list" and "Details".
   - C3: operate filters via keyboard, press Enter in search, activate "Reset".
   - C4: open dialog via "Details", verify Tab trapping inside the dialog; test
     saving with and without errors; close with Esc.
2. **Focus visibility:** focus outlines must remain visible at all times and
   must never drop to `<body>`:
   - C2: after toggling "Add to list";
   - C3: after removing a card with "Only my watchlist" enabled;
   - C4: after closing the dialog and after saving a note.

## 7. Deployment

Deploy the project to GitHub Pages or Vercel — either as a standalone
repository or inside a `lab-9/` folder in your shared coursework repository (see
starter `README.md`). The deployed `check.html` page must display "Passed: 33 of 33".

# My Watchlist — starter project for Lab 9

A catalog of 30 TVmaze shows with search, a personal watchlist, and notes. The
HTML, CSS, data, and state module are already provided. The DOM layer — cards,
event handlers, forms, dialog, and focus management — is empty: implementing it
is the goal of this lab.

Task description and specification:
<https://denysmatsevych.github.io/web-development-2026/en/web-development/labs/lab-9/> and
<https://denysmatsevych.github.io/web-development-2026/en/web-development/labs/lab-9/task/>.

## Contents

```text
index.html         all static markup: filters form, status, list, card template, dialog
styles.css         styles; state is conveyed via aria-pressed and aria-invalid attributes
data/shows.json    30 TVmaze shows
src/state.js       data and state (watchlist, notes) — provided, do not modify
src/main.js        entry point: renders the list and imports the modules below
src/render.js      C1 · cards and status line
src/list.js        C2 · card buttons
src/filters.js     C3 · filters form
src/details.js     C4 · "Details" dialog and note form
check.html         self-check runner; its code is in check/
experiments.html   markup for the experiments in §4
```

Functions in `src/` are initially empty stubs, so the page opens without
errors, but displays no cards. The file breakdown is only a suggestion:
structure your code as you see fit, but `src/state.js`, `data/`, `check.html`,
and `check/` must not be modified in any commit.

## Running locally

Open `index.html` via **Live Preview** in VS Code (or `npx serve .`) in Chrome or
Edge.
The page will not work via `file://`: browsers do not load ES modules and JSON
from that scheme (see Lab 8, §5.1). `npm install` is not needed.

## In-browser self-check

Open `check.html` the same way as `index.html`. The page loads the application
into an iframe, interacts with it as a user (clicking, typing, submitting
forms), and displays each rule of the assignment as ✓ or ✗, with
"Passed: N of M" at the bottom.
The check runner never reads your application source code. Each check opens a
clean copy of the app, so state from one check does not leak into another.

Initially, all checks fail. The message under each ✗ explains what went wrong.
Synthetic events are untrusted, so real Esc, Tab, and focus order are not seen
by the automated checker: for those, use the manual checklist in the assignment.

## Deployment

You can place the contents of this folder either in a **separate repository** or
in the `lab-9/` folder of your shared coursework repository. All paths in the
project are relative, so it works both from the site origin root and from a
subfolder. The self-check is accessible by appending `check.html` to the page URL.

### GitHub Pages

1. Push the files to your repository.
2. Settings → Pages → Source: _Deploy from a branch_, `main` branch, `/` folder.
3. The page will appear at `https://<username>.github.io/<repository>/`
   (or `…/<repository>/lab-9/`).

### Vercel

1. [vercel.com](https://vercel.com) → Add New → Project → import the repository.
2. Framework Preset: **Other**. Leave Build Command and Output Directory blank —
   there is nothing to build.
3. If the project is in a `lab-9/` folder — **Root Directory → `lab-9`**.
4. The page will appear at `https://<project>.vercel.app/`.

## Data

`data/shows.json` is an adaptation of data from [TVmaze](https://www.tvmaze.com)
([TVmaze API](https://www.tvmaze.com/api)): 30 out of 240 shows from page 0
(`https://api.tvmaze.com/shows?page=0`). Fields are trimmed and simplified (the
same records and numbers as in Lab 8, retrieved on October 4, 2026), and the
`summary` description preserves TVmaze HTML markup unchanged (retrieved on
October 8, 2026). TVmaze data is licensed under
[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/); this adaptation
is distributed under the same license. If using this data elsewhere, attribute
TVmaze as the source and preserve the license.

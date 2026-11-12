# ShowFinder — starter project for Lab 11

TV show search via the [TVmaze API](https://www.tvmaze.com/api): search results, a show details
page with episodes and cast, loading and error states. HTML, CSS, state templates, and the view
rendering module are already provided. API requests and application behavior are left
unimplemented: you will implement them as part of the lab assignment.

Task description and assignment:
<https://denysmatsevych.github.io/web-development-2026/en/web-development/labs/lab-11/> and
<https://denysmatsevych.github.io/web-development-2026/en/web-development/labs/lab-11/task/>.

## Contents

```text
index.html         Static markup: search form, status, #results, #details, state templates
styles.css         Styles, including UI states and [aria-busy="true"]
src/view.js        TVmaze view rendering: renderResults and renderShow — provided, do not edit
src/main.js        Application entry point
src/api.js         TVmaze API client functions
src/app.js         Search flow, show details page, loading and error handling
check.html         Self-check suite; harness in check/, recorded TVmaze fixtures in check/fixtures/
offline.html       The same application powered by recorded fixtures, offline
experiments.html   Scratchpad page for Section 4 experiments
```

The functions in `src/api.js` and `src/app.js` are currently stubs, so the page opens cleanly
without errors, but does not search yet. The split across files is a suggestion: organize your
code as you see fit, but do not edit `src/view.js`, `check.html`, `check/`, or `offline.html` in
any commit.

## Running the project

Open `index.html` via **Live Preview** in VS Code (or `npx serve .`) in Chrome or Edge. Do not
open it directly via `file://`: browsers do not load ES modules over the `file://` protocol. No
`npm install` is required. The application queries the live `https://api.tvmaze.com`, so an
active internet connection is required.

## Self-check suite

Open `check.html` the same way as `index.html`. It loads the application into an iframe,
interacts with it like a real user (typing queries, pressing Enter, clicking items), and displays
each specification rule as ✓ or ✗, with a summary counter "Passed: N of M" at the bottom. It
intercepts and mocks calls to TVmaze using recorded API fixtures: adding network latency,
simulating errors, or aborting connections. Thus, it does not depend on internet access or API
rate limits. The suite never inspects your code directly.

Running the full suite takes about one minute because debounce and HTTP 429 backoff tests run in
real time. At the start, all checks fail; the hint under each ✗ explains what was expected. Note
that the real TVmaze, live CORS errors, and the DevTools Network panel cannot be inspected by
`check.html`: verify those using the Network checklist in the assignment.

## Offline mode

`offline.html` opens the same `index.html`, but mock TVmaze responses are served from
`check/fixtures/` with a 0.25–0.9s delay. This mode is designed for classroom environments where
an entire lab shares a single public IP address and might trigger TVmaze `429 Too Many Requests`.
Fixtures are recorded for several queries (`girls`, `gir`, `law & order`, `doctor`, `star`,
`dark`), with full show details (episodes and cast) available for six shows; other shows load
without episodes. Use `index.html` with the live API for the Network checklist.

## Deployment

You can publish this project either in a **dedicated repository** or inside a `lab-11/` subfolder
in your shared labs repository. All asset and script references use relative paths, so the app
runs smoothly from a domain root or a subpath. The self-check suite is accessible by appending
`check.html` to your deployed URL.

### GitHub Pages

1. Push your files to your repository.
2. Go to Settings → Pages → Source: _Deploy from a branch_, branch `main`, folder `/`.
3. Your page will be published at `https://<username>.github.io/<repository>/`
   (or `…/<repository>/lab-11/`).

### Vercel

1. Go to [vercel.com](https://vercel.com) → Add New → Project → import your repository.
2. Framework Preset: **Other**. Leave Build Command and Output Directory blank — no build step
   is needed.
3. If your project is inside a subfolder, configure **Root Directory → `lab-11`**.
4. Your site will be published at `https://<project>.vercel.app/`.

## Data and attribution

The application displays data from [TVmaze](https://www.tvmaze.com) via the
[TVmaze API](https://www.tvmaze.com/api). TVmaze data is licensed under
[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), and TVmaze requests attribution:
an attribution link is included in the page footer; do not remove it.

`check/fixtures/` contains adapted TVmaze API responses captured on 2026-10-13: search results for
six queries and full data for six shows with episodes and cast, retaining only the fields
rendered by the application. Recorded queries and trimmed fields are documented under the
`changes` key in each fixture file. These fixtures are shared under the same CC BY-SA 4.0 license.

---
title: "ShowFinder — application assignment"
summary: "All practical tasks for Lab 11: the ShowFinder web application using the TVmaze API, three progressive challenges with prompts for an AI agent and numbered rules, agent rules configuration, check.html self-check suite, and Network checklist."
goal: "Bring ShowFinder into full compliance with this assignment using the live TVmaze API. Follow the three challenges in §4 in sequence. For each challenge, the AI agent drafts code based on the prompt in §4, while you audit the draft against the rules of that challenge — using check.html and DevTools Network — and fix defects manually. Refer to Section 5 of the lab handout for the AI interaction workflow and commit discipline."
label: "Assignment"
highlights:
  - "Live TVmaze API"
  - "AI draft → audit → manual fixes"
  - "check.html and Network checklist"
  - "Bonus until October 22, 2026"
acceptance:
  - "First commit: pristine starter project without changes; second commit: 'API notes' with API.md"
  - "For each challenge: commit 'Challenge N: AI draft' with the raw AI output, followed by 'Challenge N: fixes' with manual fixes; if a draft passes its block immediately without regressions, the fixes commit is omitted"
  - "Before Challenge 3: commit 'Agent rules' with AGENTS.md: up to 40 lines, written in your own words"
  - "check.html, check/, offline.html, and src/view.js remain unmodified across all commits"
  - "check.html on the deployed site (GitHub Pages or Vercel) displays 'Passed: 24 of 24'"
  - "Network checklist (§6) verified on the final release against live TVmaze, screenshots included in report"
  - "Only native fetch and only https://api.tvmaze.com: no libraries, CORS proxies, or alert()"
  - "Fixes written by hand: AI explains, but does not write fixes"
updated: 2026-10-13
---

## 1. Overview

**ShowFinder** is a TV show search web application powered by the public
[TVmaze](https://www.tvmaze.com) [API](https://www.tvmaze.com/api). The user
types a title query, views matching shows, selects an item, and views its
dedicated details page: metadata, summary, seasonal episode list, and cast.
Application state lives purely in memory: reloading the page resets the app to
its initial state.

HTML, CSS, UI state templates, and view rendering modules are already
provided. Your responsibility covers API communication and application
behavior: when to dispatch requests, what to show while network responses are
pending, and how to react to every response and every failure.

> The self-check suite is this assignment compiled into code: each check item
> in `check.html` corresponds to a numbered rule in §4. If you spot an apparent
> conflict between the suite and the text below, notify your instructor.

## 2. Project structure

**Download:** [showfinder-starter.zip](/en/web/starters/showfinder-starter.zip)
(≈ 60 KB). Unpack the archive into a dedicated repository or into the `lab-11/`
folder of your shared coursework repository.

```text
showfinder-starter/
├── index.html          Static markup and state templates
├── styles.css          Styles, including UI states and [aria-busy="true"]
├── src/
│   ├── view.js         TVmaze view rendering — provided, do not edit
│   ├── main.js         Entry point
│   ├── api.js          TVmaze API calls
│   └── app.js          Search flow, show details page, states
├── check.html, check/  Self-check suite; recorded TVmaze fixtures in check/fixtures/
├── offline.html        The same app running on mock fixtures, offline
├── experiments.html    Scratchpad page for Section 4 experiments
└── README.md           Running instructions, self-check, offline mode, deploy, license
```

Open `index.html` and `check.html` via Live Preview or `npx serve .` in Chrome
or Edge: browsers will block ES modules over the `file://` protocol. The split
between `src/api.js` and `src/app.js` is merely a suggested architectural
pattern.

## 3. UI, API, and states

### 3.1. Static markup

The IDs and data attributes below represent a contract: the self-check harness
relies on them explicitly. You may add extra markup, but do not rename or remove
contract elements.

| Element | Description |
| --- | --- |
| `form#search` | Contains input `name="query"` (`#search-query`) and submit button "Search" |
| `#status` | Search status line with `role="status"`, present in initial HTML; only text content updates |
| `#results` | Search results container: cards, loading state, informational message, or error |
| `#details` | Show details container; initial placeholder: "Select a show from the search results." |
| `template#state-loading` | "Loading…" with spinner |
| `template#state-message` | Informational message: empty results, "Show not found" |
| `template#state-error` | Error view: message in `.state__text` and button `[data-action="retry"]` "Retry" |

### 3.2. TVmaze API

| Resource | Request | Response |
| --- | --- | --- |
| Search | `GET https://api.tvmaze.com/search/shows?q=<query>` | Array of up to 10 `{ score, show }` objects; empty match returns `200 []` |
| Show details | `GET https://api.tvmaze.com/shows/<id>` | Show object; unknown id returns `404` |
| Episodes & cast | `GET /shows/<id>/episodes` & `GET /shows/<id>/cast` or `embed` query params | JSON arrays |

Consult the [TVmaze documentation](https://www.tvmaze.com/api) and your
`API.md` for full field schemas. TVmaze guarantees at least 20 requests per
10 seconds per IP address; when receiving `429 Too Many Requests`, clients are
advised to back off and wait a few seconds.

### 3.3. View rendering: `src/view.js`

| Export | Responsibility |
| --- | --- |
| `renderResults(container, shows)` | Renders an array of show objects as cards in exact response order: `<li data-id>` with button `[data-action="open"]`; empty array renders an empty list |
| `renderShow(container, { show, episodes, cast })` | Renders the show page with `#show-title` heading, seasonal episode breakdown, and cast credits |

Both functions expect clean objects shaped like raw TVmaze payloads: show data
(`show`), rather than search wrapper objects `{ score, show }`. They validate
arguments and throw descriptive `TypeError` exceptions if passed malformed
inputs. Your code handles state messages (§3.4).

### 3.4. UI states and user-facing text

`<query>` denotes the trimmed search string.

| State | Container | User-facing presentation |
| --- | --- | --- |
| Loading | `#results` or `#details` | "Loading…" (`#state-loading` template), container marked with `aria-busy="true"`; search status line displays "Loading…" |
| Results | `#results` | Cards rendered by `renderResults`, status line "Found: N" |
| Empty results | `#results` | `Nothing found for query "<query>"`, status line repeats this text |
| Show not found | `#details` | "Show not found" |
| Network failure | Relevant container | "No connection to TVmaze." and "Retry" |
| TVmaze error | Relevant container | "Could not get data from TVmaze." and "Retry" |
| Rate limited (429) | Relevant container | While waiting: loading state, search status line "Too many requests to TVmaze, retrying…"; after second failure: "Too many requests to TVmaze." and "Retry" |

For search errors, the `#status` line displays the exact same error text as
rendered in `#results`.

## 4. Challenges

Complete the three challenges sequentially: each builds upon previous ones.
Follow the AI collaboration loop (lab handout §5.2) for each challenge: the AI
agent drafts code based on the prompt below, you commit the raw output as-is,
audit it against the requirements, and fix defects by hand. Between Challenge 2
and Challenge 3, construct an agent guidelines file.

Rules are numbered: rule C3.2 is the second rule of Challenge 3, matched by
check C3.2 in `check.html`.

### C1. Search

**Goal:** As the user types a query, the application searches TVmaze when typing
pauses or immediately on Enter. While the request is in flight, the results
container shows "Loading…". Once received, shows appear along with status
"Found: N"; if no matches exist, an empty-state message appears.

**Code:** `searchShows()` in `src/api.js`, search workflow and UI states in
`src/app.js`. Markup, templates, and `renderResults` are already provided (§3).

**AI agent prompt:**

> Implement show search using the TVmaze API (https://www.tvmaze.com/api): query
> input inside form #search, render results into #results via renderResults from
> src/view.js. Do not open or modify check.html, the check/ directory, or
> offline.html.

**Rules:**

1. Search request: `GET https://api.tvmaze.com/search/shows?q=<query>` using
   `fetch`. The query string must be trimmed and URL-encoded: "Law & Order"
   reaches the API without corruption.
2. Results are rendered via `renderResults` in the order returned by the API;
   status displays "Found: N".
3. Search triggers on field typing (`input` event). A burst of keystrokes yields
   a single request dispatched no later than 500 ms after the last keypress.
4. Enter triggers immediate search without reloading the page and without
   issuing a duplicate request.
5. If the field contains fewer than 2 characters, no request is issued, and both
   `#results` and `#status` are cleared. Pending searches must not render after
   clearing.
6. While the request is in flight, `#results` has `aria-busy="true"` and displays
   "Loading…"; `#status` displays "Loading…". Once resolved, `aria-busy="true"`
   is removed.
7. An empty result set (`200 []`) is not an error: display
   `Nothing found for query "<query>"` in `#results` and in `#status`, without a
   "Retry" button.
8. A stale response must never overwrite a newer response, regardless of arrival
   order. While a newer request is pending, `#results` remains in the "Loading…"
   state.
9. No request triggers a CORS preflight: plain `GET`, no custom headers, no
   `Content-Type`, without `mode: 'no-cors'` or `credentials: 'include'`.

**Verification:** Run block "C1 · Search" in `check.html`. Refer to Experiments
1, 6, 10, and 12 from the lab handout.

### C2. Show details page

**Goal:** Clicking a show card displays the show's profile on the right (or
below on narrow screens): details, summary, episodes by season, and cast. While
loading, the details pane displays "Loading…", while the results list remains
intact and responsive. Revisiting a previously viewed show renders instantly.

**Code:** `getShow()` in `src/api.js`, selection flow and UI states in
`src/app.js`. Consult TVmaze docs (§3.2) and your `API.md` for embedding
episodes and cast.

**AI agent prompt:**

> When the user selects a show from the list, display its summary, episodes,
> and cast in #details using renderShow from src/view.js. Do not open or modify
> check.html, the check/ directory, or offline.html.

**Rules:**

1. Clicking a show card renders that show in `#details` via `renderShow`:
   title, seasonal episodes, and cast.
2. All the page data is requested at once: either a single request with
   `embed` or several parallel requests, never one after another. Use
   only documented TVmaze endpoints; do not fetch episodes or actors
   individually.
3. While details load, `#details` has `aria-busy="true"` and displays
   "Loading…". The search results list remains visible and its interactive
   buttons remain functional.
4. Shows already loaded previously render immediately from cache without
   dispatching a new network request.
5. Selecting another show while a previous request is still pending ensures only
   the latest selection renders. While pending, `#details` displays
   "Loading…".

**Verification:** Run blocks "C2 · Show page" and "C1" in `check.html`. Refer to
Experiments 3, 5, 6, and 8 from the lab handout.

### Before C3: agent rules file

After finishing `Challenge 2: fixes`, create a dedicated guidelines file for
your agent. For Challenge 3, the agent will receive both the prompt and project
context.

- **Location:** `AGENTS.md` in the project root of your IDE workspace: Copilot,
  Cursor, and other agent systems read this file. If your agent uses a different
  convention (such as `.github/copilot-instructions.md`), place it there and note
  this in your report.
- **Content:** Up to 40 lines, written in your own words: TVmaze API contract
  derived from your `API.md` (endpoints, payload shapes, status codes, rate
  limits, CORS) and project constraints discovered during the C1–C2 audits
  (e.g. headers policy, cancellation). Do not paste the full specification:
  guidelines should reflect your insights from `API.md` and audit testing.
- **Commit:** Commit separately with message `Agent rules`. Before Challenge 3,
  make sure the agent sees the file: most agents show the attached rules in the
  request context.

### C3. Error handling

**Goal:** Every failure is explained to the user in the context container where
it occurred, displaying user-facing text from §3.4 and an adjacent "Retry"
button. Upon HTTP 429, the app automatically pauses a few seconds and retries
once, matching TVmaze API guidelines. Other failures do not retry
automatically; the user can retry via "Retry".

**Code:** `src/api.js` and `src/app.js`; template `#state-error` with button
"Retry" is already provided.

**AI agent prompt** (with `AGENTS.md` active in your project):

> Add error handling and retries for all requests. Do not open or modify
> check.html, the check/ directory, or offline.html.

**Rules:**

1. HTTP error responses are not data: `4xx` and `5xx` responses must never be
   rendered as show results or "Nothing found".
2. `404` for a show displays "Show not found" in `#details`.
3. `5xx` responses or non-JSON payloads display "Could not get data from
   TVmaze." and "Retry" in the active container; for search, also in `#status`.
4. Network failure (`fetch` promise rejected) displays "No connection to
   TVmaze." and "Retry"; for search, also in `#status`.
5. "Retry" repeats the exact failed request; a subsequent successful response
   clears the error state.
6. `429`: the application automatically retries once after 2–5 seconds. While
   waiting, the container shows a loading indicator, and search status displays
   "Too many requests to TVmaze, retrying…". A second consecutive `429` displays
   "Too many requests to TVmaze." and "Retry", stopping automatic retries. Other
   failures are not retried automatically.
7. Following any failure, the loading state ends: `aria-busy="true"` is removed,
   and "Loading…" is hidden.
8. Failed responses are never cached: reopening a show after an error sends a
   fresh request.
9. Aborted requests are not treated as errors. The browser Console displays no
   `Uncaught` or `Uncaught (in promise)` errors under any user scenario.
10. The user sees only strings defined in §3.4: no raw `TypeError`, `Failed to
    fetch`, HTTP status codes, JSON dumps, or `alert()`. Technical errors belong
    in Console (`console.error`).

**Verification:** Run blocks "C3 · Errors", "C1", and "C2" in `check.html`.
Reproduce failures in the live app: toggle Offline and Request blocking in the
Network panel. Refer to Experiments 1, 2, 4, 6, and 7 from the lab handout.

## 5. Constraints

- You may modify `index.html`, `styles.css`, and files in `src/`, except
  `src/view.js`. Files `check.html`, `check/`, `offline.html`, and `src/view.js`
  must remain identical to the starter project.
- Native Fetch API and `https://api.tvmaze.com` only: no external libraries,
  frameworks, or CORS proxies.
- Data reaches the DOM exclusively via `renderResults` and `renderShow`.
- Do not use `alert()`, `confirm()`, or `prompt()`.
- You write all bug fixes. The AI agent drafts initial code per challenge
  prompts (§4) and may explain (§5.2 of the lab handout).

## 6. Network checklist

`check.html` mocks API responses internally, so you must verify the live TVmaze
API manually in `index.html` using Chrome or Edge with **Preserve log** and the
**Fetch/XHR** filter enabled in DevTools Network. Complete this checklist on
your final release and include screenshots in your report.

1. **N1 · Search request.** Search for "girls". Check request details: HTTP 200,
   parameter `q` in Payload, array in Preview; Response Headers include
   `cache-control` and `access-control-allow-origin`.
2. **N2 · Slow network.** Set Throttling to Slow 4G. Verify "Loading…" appears.
   Type "gir", observe request in Network, then complete "ls": the earlier
   request shows status `(canceled)`, and results for "girls" appear on page.
3. **N3 · Offline mode.** Enable Request blocking for `api.tvmaze.com` (or
   Offline throttling): search displays "No connection to TVmaze.". Unblock and
   click "Retry": results load successfully.
4. **N4 · Initiator.** On a show page request, open the Initiator tab to trace
   the exact line in your code that dispatched the call.
5. **N5 · Cache.** Open a show, click another show, then reopen the first show:
   no third request is sent (C2.4). Repeat the same search query: observe the
   Size column and explain what happens based on TVmaze caching docs
   (Experiment 8).
6. **N6 · Console.** Execute the full user flow (search, details, simulated N3
   failures): no `Uncaught` errors in Console. Red "Failed to load resource" lines
   for blocked requests originate from the browser engine, not unhandled
   exceptions in your code.

## 7. Deployment

Deploy your project to GitHub Pages or Vercel — either in a dedicated repository
or under `lab-11/` in your shared repository. Detailed deployment steps are in
the starter `README.md`. Your live application connects to the real TVmaze API,
and opening `check.html` on your deployment must report "Passed: 24 of 24".

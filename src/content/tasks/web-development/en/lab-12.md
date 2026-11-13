---
title: "ShowFinder: from JavaScript to TypeScript — specification"
summary: "All practical tasks for Lab 12-13: the ShowFinder app powered by the TVmaze API migrates from JavaScript to TypeScript. Types, requests, and states by hand (T1–T3), the remaining modules migrated by an AI agent using the T4 prompt, with migration verified via npm run check and in the browser."
goal: "Migrate ShowFinder to TypeScript according to this assignment: npm run check reports 'Types: no errors' and all tests pass, src/ contains no any or type assertions, and the app works with the real TVmaze API. Tasks are in §4, completed in order: write T1–T3 by hand, have an AI agent migrate the remaining modules in T4, and verify and fix the migration. Workflow and commit conventions are in section 5 of the lab."
label: "Assignment"
highlights:
  - "TypeScript, strict"
  - "T1–T3 by hand, T4 — AI migration"
  - "npm run check and in-browser checklist"
  - "Bonus until October 22, 2026"
acceptance:
  - "First commit — starter project without changes"
  - "Commits 'T1: types', 'T2: api', 'T3: state', 'T4: AI migration' with the agent's migration unchanged, and 'T4: fixes' if it failed verification"
  - "Only .ts files in src/; check/, index.html, styles.css, package.json, and tsconfig.json unchanged"
  - "npm run check: 'Types: no errors' and all tests pass"
  - "No any, type assertions (as, except as const, and !), declare, @ts-ignore, @ts-nocheck, or @ts-expect-error in src/"
  - "In-browser checklist (§6) completed with the real TVmaze API, screenshots included in the report"
  - "Only fetch and only https://api.tvmaze.com: no external libraries and no alert()"
  - "T1–T3 and T4 fixes written by hand: AI explained, but wrote no code"
updated: 2026-10-15
---

## 1. Overview

**ShowFinder** is a TV series search app using [TVmaze](https://www.tvmaze.com)
through its public [API](https://www.tvmaze.com/api). A user enters a title and
clicks "Search", views the matching series, and opens the page for one
of them. State lives purely in memory: reloading the page resets the application
to its initial state.

The application is written in JavaScript, and you will migrate it to TypeScript.
First by hand — the foundational pieces on which all other modules depend: API
response types, requests, and page states (T1–T3). Next, the remaining
modules — application behavior, data rendering, page element queries, and the
entry point — are migrated by an AI agent, and you verify and fix its migration
(T4).

> The `npm run check` self-check is this specification expressed in code: every
> test name and the comment next to every type check start with the rule number
> from §4 (or "§5" for constraints). If a check and the text below appear to
> conflict, notify your instructor.

## 2. Project structure

**Download:** [showfinder-ts-starter.zip](/en/web/starters/showfinder-ts-starter.zip).
Unpack the archive either into a separate repository or into the `lab-12/`
folder of your shared lab repository.

```text
showfinder-ts-starter/
├── package.json, tsconfig.json  scripts and compiler configuration
├── index.html, styles.css       page markup and styles
├── src/
│   ├── types.ts     T1 · API response types
│   ├── api.ts       T2 · requests
│   ├── state.ts     T3 · states and messages
│   ├── app.js       T4 · behavior: search and show page
│   ├── view.js      T4 · rendering data
│   ├── dom.js       T4 · page elements
│   └── main.js      T4 · entry point
├── check/           self-check: type checks, tests, recorded TVmaze fixtures
└── README.md        running, self-check, editor setup
```

Node.js 22.18 or newer is required.

| Command | Action |
| --- | --- |
| `npm install` | one-time: installs TypeScript |
| `npm run watch` | compiles `src/` to `dist/` and watches for changes; open the page via Live Preview |
| `npm run check` | type checks and tests; ends with "Types: … · Tests: passed N of M" |
| `npm run typecheck` | type checks only |
| `npm test` | tests only |

While `.js` files remain in `src/`, `tsc` copies them to `dist/` as well, but
does not check their types (`allowJs` in `tsconfig.json`). This allows the
project to run mid-migration, with `.ts` and `.js` modules importing each other.

## 3. API, data, and states

### 3.1. TVmaze API

| Action | Request | Response |
| --- | --- | --- |
| Search | `GET https://api.tvmaze.com/search/shows?q=<query>` | `200` and an array of up to 10 `{ score, show }` elements; no matches — `200 []` |
| Show | `GET https://api.tvmaze.com/shows/<id>` | `200` and the show object; id does not exist — `404` |

No API key is required. TVmaze allows at least 20 requests per 10 seconds from a
single IP address, returning `429` beyond that limit.

### 3.2. Show

The application uses only these properties of a show. The `Show` type should not
describe other fields returned by the API.

| Field | Description | Example (Girls, id 139) |
| --- | --- | --- |
| `id` | identifier | `139` |
| `url` | show page on the TVmaze website | `"https://www.tvmaze.com/shows/139/girls"` |
| `name` | title | `"Girls"` |
| `genres` | genres; can be an empty array | `["Drama", "Romance"]` |
| `premiered` | premiere date or `null` | `"2012-04-15"` |
| `rating` | always an object; its `average` is a number or `null` | `{ "average": 6.4 }` |
| `image` | poster: object with `medium` and `original` URLs, or `null` | `{ "medium": "https://…", "original": "https://…" }` |
| `summary` | summary — HTML string — or `null` | `"<p>This Emmy winning series…</p>"` |

### 3.3. Page and JavaScript modules

| Element | Description |
| --- | --- |
| `form#search` | input `#search-query` and button "Search" |
| `#status` | status line, `role="status"` |
| `#content` | result cards or show page |

The modules below are written in JavaScript. Do not modify them prior to T4: once
T1–T3 are implemented, the application works with them in the browser.

| Module | Export | Action |
| --- | --- | --- |
| `src/dom.js` | `pageElements()` | returns `{ form, input, status, content }` — the elements above |
| `src/view.js` | `renderResults(container, shows)` | show cards; each card is a `button[data-id]` with the show's id |
| `src/view.js` | `renderShow(container, show)` | show page; its heading receives focus |
| `src/view.js` | `renderStatus(status, text, state)` | status line text; `state` is the state's `status` field, determining styling |
| `src/view.js` | `showMeta(show)` | row under the show title: year and rating (§3.4) |
| `src/app.js` | `loadSearch(query, setState)`, `loadShow(id, setState)` | search and show page: every state transition is passed to `setState` |
| `src/app.js` | `start()` | wires up the form and cards to the page; called by `main.js` |

### 3.4. States and messages

The page is always in one of six states:

```ts
type ViewState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'results'; query: string; shows: Show[] }
  | { status: 'empty'; query: string }
  | { status: 'show'; show: Show }
  | { status: 'error'; message: string };
```

| State | Status line | `#content` |
| --- | --- | --- |
| `idle` | `Enter a TV series title.` | empty |
| `loading` | `Loading…` | empty |
| `results` | `Shows found: 10` — count in `shows` | cards |
| `empty` | `Nothing found for "qqqzzz"` — with `query` | empty |
| `show` | `Show: Girls` — show title | show page |
| `error` | `message` unchanged | empty |

User-facing error messages:

| Error | Message |
| --- | --- |
| `HttpError` with status 404 | `Not found (HTTP 404).` |
| `HttpError` 429 | `Too many requests (HTTP 429). Please try again in a few seconds.` |
| `HttpError` 500–599 | `TVmaze server unavailable (HTTP 503). Please try again later.` — with the actual status |
| any other `HttpError` | `Request error (HTTP 400).` — with the actual status |
| `TypeError` — how `fetch` reports network failures | `Network unavailable. Check your connection.` |
| anything else | `Something went wrong. Please try again.` |

Row under the show title — on cards and on the show page (`showMeta`):

| Show | String |
| --- | --- |
| `premiered: "2012-04-15"`, `rating.average: 6.4` | `2012 · rating 6.4` |
| `premiered: "2018-06-15"`, `rating.average: null` | `2018 · rating —` |
| `premiered: null`, `rating.average: null` | `year unknown · rating —` |

The tests compare strings strictly, only accepting "..." in place of "…".

## 4. Tasks

Complete the tasks in order: each builds on the previous ones. Write T1–T3 by
hand; the AI agent may only explain concepts. In T4, the AI agent migrates the
modules, and you verify and fix the migration (lab, §5.2).

Rules are numbered: T2.4 is the fourth rule of task T2. Each rule is verified by
`npm run check`:

- a **test** whose name begins with the rule number;
- or a **type check** in `check/types.check.ts`: the compiler error points to
  the line, and the rule number appears in the comment above it or at the end
  of the line. An "Unused '@ts-expect-error' directive" indicates that your type
  permits a value that should have been rejected.

### T1. API response types

**Expected outcome.** In `src/types.ts` — exported interfaces `Show` and
`SearchResult` accurately describing TVmaze responses (§3.1–3.2): `null`
wherever it can occur, and nowhere else.

**How to proceed.** Open `https://api.tvmaze.com/search/shows?q=girls` in your
browser (experiment E1) and inspect `check/fixtures/search.json`. Shows with
fields that can be `null` appear, for example, in the `kitchen` query.

**Rules:**

1. `id` — `number`; `name` and `url` — `string`; `genres` — array of strings.
2. `image`, `summary`, `premiered`, and `rating.average` may be `null`, while
   `name` may not. `image`, when not `null`, is an object with `medium` and
   `original` strings; `rating` is always an object.
3. `SearchResult` — `{ score: number; show: Show }`.
4. Recorded TVmaze responses in `check/fixtures/` must satisfy your types
   without modifications.

**Verification:** `npm run typecheck`, the T1 block in `check/types.check.ts`.

### T2. Requests

**Expected outcome.** In `src/api.ts` — typed request functions for TVmaze. Data
from the network has type `unknown`: the code only treats it as shows after
verification by a type guard.

**Rules:**

1. `class HttpError extends Error` with property `readonly status: number`:
   `new HttpError(404)` creates an error with `status` 404 and the status code
   in its message.
2. `getJson(url: string): Promise<unknown>` issues a GET request via `fetch`. If
   the status is outside 200–299, it rejects the promise with an `HttpError`;
   otherwise, it returns the parsed JSON body. It does not alter errors thrown
   by `fetch` itself (network failures).
3. `isShow(value: unknown): value is Show` returns `true` if `value` is an object
   with a numeric `id`, a string `name`, and an array `genres`; otherwise
   `false`. `isSearchResult(value: unknown): value is SearchResult` operates
   similarly for an object with a numeric `score` and a `show` property for which
   `isShow` returns `true`. Narrow `value` using checks — `typeof`, `in`,
   `Array.isArray` — not with the `as` assertion (§5).
4. `searchShows(query: string): Promise<Show[]>` queries
   `GET https://api.tvmaze.com/search/shows?q=<query>` with the query URL-encoded:
   "law & order" reaches the API intact. Returns shows, not `{ score, show }`
   wrappers, in response order; returns `[]` if there are no matches.
5. `getShow(id: number): Promise<Show>` queries
   `GET https://api.tvmaze.com/shows/<id>` and returns the show.
6. For status 404, 429, 500, or 503, both functions reject the promise with an
   `HttpError` carrying that status.
7. If the response body does not match the expected shape (`isSearchResult` or
   `isShow` returns `false`), both functions reject the promise with
   `new Error('Unexpected API response')`.

**Verification:** T2 tests (`check/2-api.test.js`) and the T2 block in
`check/types.check.ts`.

### T3. States and messages

**Expected outcome.** In `src/state.ts` — page state type and two functions
converting state and errors into user-facing text (§3.4).

**Rules:**

1. `export type ViewState` — union of the six states from §3.4, each with only
   its relevant properties. The `status` property discriminates the states.
2. `errorMessage(err: unknown): string` returns the error message from §3.4.
   Recognizes `HttpError` strictly via `instanceof`: a plain object
   `{ status: 404 }` is treated as "anything else".
3. `messageFor(state: ViewState): string` returns the status line text from
   §3.4. Implemented using `switch (state.status)` with a `default` branch where
   state is assigned to a variable of type `never`: if a seventh state is ever
   added and left unhandled, the compiler will report an error. At runtime,
   this branch is unreachable, so it may simply throw an error.

**Verification:** T3 tests (`check/3-state.test.js`) and the T3 block in
`check/types.check.ts`. After T3, the application already works in the browser,
and `npm run check` reports "Types: no errors · Tests: passed 39 of 48": the
remaining tests belong to T4.

### T4. Migration: AI agent → verification → fixes

**Expected outcome.** `src/app.js`, `src/view.js`, `src/dom.js`, and `src/main.js`
have become typed `.ts` files. `npm run check` reports no errors, and the
application works in the browser with the real TVmaze API (§6).

**What to verify here.** The JavaScript modules contain defects, so several T4
tests fail even before migration. As soon as the files become `.ts`, some defects
will be flagged by the compiler in strict mode, while others will only be caught
by tests. The agent may fix a defect, or it may merely silence the compiler:
`as`, `!`, `any`, `declare`, `@ts-ignore`, or disabling options in
`tsconfig.json` eliminate the error without resolving the defect. Therefore, you
must verify the migration yourself — against the rules below and the constraints
in §5.

**Prompt for the AI agent** (paste word for word):

> Migrate the files src/app.js, src/view.js, src/dom.js, and src/main.js to
> TypeScript: rename each to .ts and add types. Use the types from src/types.ts
> and src/state.ts, and the functions from src/api.ts. Do not change application
> behavior. Do not open or modify the check/ directory; do not modify
> src/types.ts, src/api.ts, src/state.ts, index.html, or tsconfig.json.

**Rules:**

1. Only `.ts` files in `src/`: `app.ts`, `view.ts`, `dom.ts`, and `main.ts` have
   replaced their `.js` counterparts. Modules import one another using the `.ts`
   extension: the `./view.js` path can still be resolved by the browser in
   `dist/`, but tests running in Node will fail.
2. `tsconfig.json` and `check/tsconfig.json` remain identical to the starter
   project: type errors must be fixed in code rather than by disabling `strict`
   or other compiler options.
3. `loadSearch(query: string, setState: (state: ViewState) => void):
   Promise<void>` searches with leading and trailing whitespace trimmed. An
   empty query only triggers `setState({ status: 'idle' })` without calling the
   API. Otherwise, it sets the `loading` state before making the request,
   followed by a single state: `results` with `query` and shows, or `empty` with
   `query` if no matches are found.
4. Any error in `loadSearch` sets the `error` state with
   `message: errorMessage(err)` (T3.2). The `loadSearch` promise never rejects:
   no `Uncaught (in promise)` appears in the Console.
5. `loadShow(id: number, setState: (state: ViewState) => void):
   Promise<void>` sets the `loading` state, then transitions to `show` or
   `error` as in rule 4. Retrieves the show exclusively via `getShow` (T2.5):
   neither `fetch` nor `.json()` may appear in `app`, `view`, `dom`, or `main`.
   This ensures a 404 or an unexpected response body becomes an error rather
   than a "show".
6. `showMeta(show: Show): string` in `view.ts` returns the string under the show
   title from §3.4, including for shows without a premiere date or rating.
7. `start(): void` queries page elements via `pageElements()` strictly inside
   itself: tests run in Node where there is no DOM. Form submission without
   page reload calls `loadSearch` with the input's value. Clicking a
   `button[data-id]` card calls `loadShow` with its id as a number (event
   delegation on `#content`). Each state is rendered according to §3.4. After
   initialization, the state is `idle`. Narrow page elements and `event.target`
   using `instanceof` rather than type assertions (§5).

**Verification:** T4 tests (`check/4-app.test.js`), the T4 block in
`check/types.check.ts`, and the "§5" tests. If all T4 behavioral tests fail with
`ReferenceError: document is not defined`, rule 7 was violated. Verify the rest
of rule 7 in the browser using the §6 checklist.

## 5. Constraints

- You modify `src/types.ts`, `src/api.ts`, and `src/state.ts` by hand. In T4,
  the four `src/*.js` files become `.ts` files. `check/`, `index.html`,
  `styles.css`, `package.json`, and `tsconfig.json` must remain identical to the
  starter project.
- No `any` in `src/`.
- No type assertions in `src/`: `as` (only `as const` is permitted), `!` after
  an expression (`value!`), `<Show>value`, as well as `querySelector<…>()` and
  `closest<…>()` — which are the same assertion written as a type argument.
  Narrow types with checks: `typeof`, `instanceof`, `in`, `Array.isArray`,
  comparisons with `null`, or type guards.
- No `@ts-ignore`, `@ts-nocheck`, or `@ts-expect-error` comments in `src/`: fix
  type errors in your types or code rather than suppressing them.
- No `declare` keywords or `.d.ts` files in `src/`. Declarations like
  `declare global { interface EventTarget { … } }` augment DOM types without
  any runtime check — they are the same type assertion applied project-wide.
- Import types using `import type` (or inline `type` in imports:
  `import { errorMessage, type ViewState }`).
- Use only `fetch` and only `https://api.tvmaze.com`: no external libraries or
  frameworks.
- No `alert()`, `confirm()`, or `prompt()`.
- T1–T3 and T4 fixes must be written by you. The AI agent only performs the T4
  migration and may explain concepts (lab, §5.2).

These constraints are verified by the "§5" tests. They inspect the text of all
source files in `src/`, including subdirectories, excluding comments and string
literals.

## 6. In-browser checklist

`npm run check` cannot see the real TVmaze API or the browser: you verify them
yourself. While `npm run watch` is running, open `index.html` via Live Preview in
Chrome or Edge and keep the Console open. Step through this checklist on your
final implementation and include a screenshot for each step in your report.

1. **B1 · Search.** Search for "law & order": the page displays cards and
   "Shows found: N", and the Network tab shows a request to
   `/search/shows` with status 200.
2. **B2 · Empty fields.** Search for "kitchen". The card for Harlem's Kitchen
   renders without a poster (gray placeholder) and shows the string
   "year unknown · rating —". The Console displays no errors.
3. **B3 · Show page.** Click a card: the show page opens, and the status line
   displays `Show: <title>`. Focus moves to the show's heading: the Console
   confirms this via `document.activeElement`.
4. **B4 · Offline mode.** DevTools → Network → Throttling — **Offline**.
   Searching for a show you haven't queried yet displays "Network unavailable.
   Check your connection.", and the Console has no `Uncaught` errors. (The
   browser may serve a repeated query from cache: TVmaze allows 1-hour caching.)
   Switch back to **No throttling**: subsequent searches find shows normally.

# Plan: ЛР-11 «AI-агент для інтеграції REST API»

Status: built on 2026-10-13 on branch `feat/lab-11-rest-api`, from `main`.
The prompt calibration ran on 2026-10-13 in two Claude models (Sonnet and
Haiku; the record is in `solution/calibration.md`). Not yet done, and both gate
publishing: the calibration in Copilot and Cursor, and the timed dry run. Decisions 1 and 2 follow the recommendation; decisions 3
and 4 are settled (ЛР-10 due 21.10.2026, ЛР-11 due 23.10.2026; 3 hours of
self-study); decision 5 is still open. Delete this file once the lab is published. The facts that last
are in this folder's `README.md`.

Deviations from the plan:

- **Published before ЛР-10's deadline.** With ЛР-11 due two days after ЛР-10,
  principle 7 can't hold. The brief and the check names describe stale
  responses and cancellation only in ShowFinder's terms, and they were read
  against ЛР-10's local defect map.
- **24 rules:** C1 has 9, C2 has 5 and C3 has 10. Enter (C1.4) and the minimum
  length (C1.5) are rules of their own. The race checks (C1.8, C2.5) also check
  that the region shows «Завантаження…» while the newer request is pending:
  without that, a cancelled request shown as an error only flashes, and every
  other check passes.
- **The view takes its container:** `renderResults(container, shows)` and
  `renderShow(container, { show, episodes, cast })`, so embed and parallel
  requests feed it the same way. It validates its arguments and throws a
  readable `TypeError`.
- **The stub's CORS messages are Chrome's own**, copied from the calibration
  run: the preflight failure reads «No 'Access-Control-Allow-Origin' header is
  present», not «It does not have HTTP ok status».
- **Experiment 3** waits 2 s after the `forEach` before timing `for…of` and
  `Promise.all`: run back to back, the `forEach` requests were still in flight
  and made `Promise.all` look slower.
- **`offline.html`** loads `index.html` into a `srcdoc` frame with the stub in
  auto-answer mode, so the markup has one source.
- **The handout is about 3,800 words**, not 3,000 or fewer (ЛР-9 has about
  4,100). Each experiment spells out its question, and §5 repeats ЛР-9's
  four-step loop because the students meet it without ЛР-9 open.
- **No home/class split.** The class is on 2026-10-14, the morning after the
  lab was built, so nothing can be done before it. Handout §3 lists the steps
  in order without saying where; §4 and `API.md` are no longer homework, and
  the **Timing** estimate below, which assumed they were, no longer holds.
- **All tasks in the brief.** The handout's challenge sections (5.3–5.6) moved
  into the brief's §4 with their prompts, next to their rules; the handout's
  §5 keeps setup, the AI loop and commits. The report's last item is a short
  summary of what was done, not the «context vs defaults» comparison; the
  defence still asks what `AGENTS.md` changed.
- **Defence questions are an interview list.** §7 lists typical frontend
  interview questions on the lab's topics, grouped, instead of a few tasks
  and questions mixed together; the live change is mentioned only as
  something the instructor may ask for.
- **Calibration changed the brief, the starter and the check.**
  - Each prompt now ends with «check.html, теку check/ і offline.html не
    відкривай і не змінюй».
  - The starter README no longer names the `embed` request.
  - C3 says that only `429` is retried automatically, and C3.3 and C3.4 say so
    when an app retries by itself.
  - The check reads ’ and ʼ as ', because the brief page renders «з'єднання»
    with ’.
  - `check/net.js` stops `history.pushState` and `replaceState` from throwing
    in the `srcdoc` frame.
- **Grading by components.** The 2 points (the programme's weight for a lab)
  are split into the self-check (0.5), the process (0.5) and a defence scored
  by a rubric (1), and the bonus is for on-time submission only, not «or work
  in class». Labs 8–10 keep their scheme.

## Context

From [../course-plan.md](../course-plan.md), row 2.6:

- **Тема:** «AI-агент для інтеграції REST API: Fetch API, Promise та
  async/await, аналіз API-документації, loading та error states, debugging
  через Network»
- **Самостійна робота:** analysing asynchronous code written by an AI;
  research into HTTP requests, status codes, headers and CORS; implementing
  loading and error states. The repo copy says 3 hours; the programme text
  quoted when this plan was requested says 2 (decision 4).
- **Читання:** Основна 1 (MDN). Допоміжна 4 (web.dev), 13 (MDN JavaScript
  Guide), 30–34 (Cursor agent, rules, skills and context; Copilot repository
  instructions), 43 (Chrome DevTools).
- **Position:** after Лекція 6 (Event Loop, Promise, async/await, Fetch, REST,
  JSON, CORS, caching) and ЛР-10 (debugging, including async defects). Before
  Лекція 7 and ЛР-12–13, where ЛР-13 types and validates API responses at
  runtime, so this lab's API layer is what ЛР-13 can build on.

**The students** are the same as in ЛР-8–10. They have written pure functions
on TVmaze data (ЛР-8) and a DOM layer with delegation, forms and focus
(ЛР-9). They debugged Promises and the Event Loop in someone else's code
(ЛР-10). They have never called a real API.

**Timeline as of 2026-10-13:** ЛР-9 is due 19.10.2026, ЛР-10 21.10.2026 and
ЛР-11 23.10.2026.

## Design principles

1. **A real, documented API.** The topic names API documentation, status
   codes, headers, CORS and the Network panel, and only a live API gives
   all five. TVmaze is the same data as ЛР-8 and ЛР-9, needs no key, sends
   CORS headers and has short docs (decision 1).
2. **The DOM is provided; the network layer and the states are the
   student's.** ЛР-9 already taught rendering. The starter ships a view module
   that renders a list of shows and one show's page. The student owns
   everything between the input and the view: requests, parsing, the
   request lifecycle, the loading, empty and error states, cancellation and
   caching.
3. **The AI writes a draft; the student owns the result.** Same loop as ЛР-9:
   a short prompt, the draft committed unchanged, an audit against the brief,
   fixes by hand. The programme's self-study names «аналіз асинхронного коду,
   створеного AI».
4. **The docs become the agent's context.** Readings 30–34 are about rules and
   context files. Before C3 the student turns their own API notes and C1–C2
   findings into an `AGENTS.md`, and the report compares the C3 draft against
   the earlier ones (decision 2).
5. **Checks test behaviour at the network boundary.** The self-check replaces
   `fetch` with a scripted stub. It can hold a response open to observe the
   loading state, return a 404, 429 or 500, fail the network, return HTML
   instead of JSON, or answer out of order. It records what the app requested,
   never how the code is structured. The checks never touch the real API, so
   grading is deterministic and costs no rate limit.
6. **The Network panel is the evidence.** Each finding in the audit is shown
   in Network: status, headers, payload, initiator, timing, `(canceled)`.
   Seeded network defects would repeat ЛР-10's format, so the lab has none.
   The bugs to debug are the ones in the AI's draft.
7. **Not before ЛР-10's deadline.** ЛР-11 builds correctly some async
   patterns that ЛР-10's Scenario C asks students to find. Publish it after
   19.10.2026, and read the brief and check names against ЛР-10's local
   defect map before shipping, as ЛР-9 did.

## TVmaze facts the lab relies on

Checked with `curl` on 2026-10-13. Calibration (see **Verification**) must
confirm the browser-side behaviour.

| Fact | Used in |
| --- | --- |
| `GET /search/shows?q=` returns at most 10 items shaped `{ score, show }`; no match and an empty `q` both return `200 []` | C1, §4.5 |
| `GET /shows/:id?embed[]=episodes&embed[]=cast` returns the show with `_embedded.episodes` and `_embedded.cast` in one request (id 82: 73 episodes, 42 cast) | C2, §4.5 |
| Unknown id: `404` with a JSON body `{"name":"Not Found",…,"status":404}`; `/singlesearch/shows` with no match: `404` | C3, exp. 1 |
| `GET` responses carry `access-control-allow-origin: *` and `cache-control: public, max-age=3600` | exp. 8, 11 |
| `OPTIONS` (a preflight) returns `405` with no CORS headers, so any request that needs a preflight fails, although the docs say «All endpoints are CORS enabled» | exp. 12, C1 |
| `www.tvmaze.com` pages send no CORS headers | exp. 11, 13 |
| `/lookup/shows?imdb=tt0944947` is a `301` to `/shows/82`, with CORS headers | exp. 9 |
| Rate limit: at least 20 calls per 10 s **per IP**. Searches and `embed` requests are not edge-cached, so they count; plain `/shows/:id/episodes` and `/cast` usually are. Docs: back off a few seconds on `429` | C1, C2, C3 |
| Some shows have `null` `rating.average`, `image`, `network` (web-only shows use `webChannel`) or `premiered`; `summary` is HTML | view module |
| Licence CC BY-SA; attribution is a link back to TVmaze | starter, report |

**The per-IP rate limit is a real risk in class.** A room behind one NAT
address, with drafts that search on every keystroke, will get `429`s. That's
useful for C3 but can block C1–C2. Mitigations: the self-check never calls the
API, and `offline.html` runs the app against the check's fixtures with
realistic latency (see **Starter**).

## Topics and where each is taught

| Topic | Research (§4) | Practice (§5) |
| --- | --- | --- |
| `fetch` resolves on 4xx/5xx; `ok`, `status`; the body can be read once; `json()` on HTML | 4.1 | C1, C3 |
| `async`/`await` vs `.then`; `await` in `forEach`; `return` vs `return await` inside `try` | 4.1 | C1–C3 |
| `Promise.all` vs `allSettled`; parallel vs sequential requests | 4.1 | C2 |
| `AbortController`, `AbortError`, `(canceled)` in Network; stale responses | 4.1 | C1, C2 |
| Status codes 200/301/404/429/5xx and what each means for the UI | 4.2, 4.5 | C3 |
| Headers: readable vs CORS-safelisted, `Content-Type`, `Cache-Control`, the HTTP cache vs an app-level cache | 4.2 | C2 |
| Query strings: `URLSearchParams` and encoding | 4.2 | C1 |
| CORS: what the browser blocks and why the client can't fix it; simple requests vs preflight; `mode: 'no-cors'` | 4.3 | C1 |
| The Network panel: filters, Headers/Payload/Preview/Initiator/Timing, throttling, request blocking, Preserve log, overrides | 4.4 | manual checklist |
| Reading API docs: endpoints, parameters, shapes, nullable fields, errors, caching, rate limit, licence | 4.5 | C1–C3 (`API.md`) |
| Loading, empty, error and not-found states; retry; a lifecycle where every path ends | — | C1–C3 |
| What AI drafts of async code get wrong by default; rules files as context | 4.6 | every challenge, C3 |

## The app: ShowFinder (working name)

A two-pane TVmaze explorer:

- **Search:** a form with one field, results as cards in `#results`.
- **Details:** selecting a card loads the show into `#details`: summary,
  seasons with episodes, and cast.
- **A status line** (a live region): «Знайдено: 7», «Завантаження…», error
  messages.
- **States** in both panes: loading, empty («Нічого не знайдено за запитом
  «…»»), not found, error with «Спробувати ще».
- **A footer credit** linking to TVmaze.

No routing and no storage: a reload starts over.

## Starter: `showfinder-starter/`

```text
showfinder-starter/
  README.md          (uk) run, self-check, offline mode, deploy, data licence
  index.html         the static shell: form, status region, #results, #details,
                     <template>s for the loading / empty / not-found / error states
                     (error has <button data-action="retry">), footer credit
  styles.css         complete, including [aria-busy="true"] and every state
  src/view.js        provided, DOM only: renderResults(shows), renderShow(show);
                     takes raw TVmaze `show` objects, handles nulls, renders the
                     HTML summary as text
  src/api.js         stub with JSDoc: searchShows(query, { signal }), getShow(id, { signal })
  src/app.js         stub: the request lifecycle and the states
  src/main.js        entry point
  check.html, check/ the self-check, with the fetch stub (see below)
  check/fixtures/    recorded TVmaze responses (CC BY-SA, adapted)
  offline.html       the app with the fetch stub serving fixtures at realistic latency
  experiments.html   an empty page served from localhost, for the §4 snippets
```

- **The templates fix the DOM contract** the checks read: `[data-state]` on
  the state blocks, `data-action="retry"`, `aria-busy` on the two regions,
  `li[data-id]` on cards (from `view.js`).
- **The view handles nulls and HTML** so the lab's rules stay about the
  network. ЛР-8 and ЛР-9 already covered both.
- **Name.** `tsconfig.json` already excludes `*-starter`.

## Challenges: draft specs

The final specs go in the brief, `src/content/tasks/lab-11.md`, with rule
numbers that match the check labels. The prompts are drafts for the handout,
short on purpose: none mentions errors, cancellation, encoding or headers.

| # | Prompt for the AI draft | Rules the brief adds, each with a check |
| --- | --- | --- |
| C1 | «Зроби пошук серіалів через TVmaze API (https://www.tvmaze.com/api): поле в формі #search, результати в #results через renderResults.» | `GET /search/shows` with the query trimmed and encoded («Law & Order» reaches the API whole). Fewer than 2 characters: no request. Typing a burst sends one request, no later than 500 ms after the last keystroke; Enter searches at once and doesn't reload. While pending: `aria-busy="true"` on `#results` and «Завантаження…» in the status. `200 []` is the empty state, not an error. A slower earlier response never replaces a newer one. No request needs a preflight (a `Content-Type` on a `GET` fails the way the real API fails). Only `fetch`, only `api.tvmaze.com`. |
| C2 | «Коли користувач вибирає серіал, покажи в #details опис, епізоди й акторів через renderShow.» | All the data for the panel is requested at once: one `embed` request, or parallel requests, never one after another. Loading state in `#details`, and the list stays usable. Opening a show already loaded sends no request. Selecting another show while one is loading shows only the last one. |
| C3 | «Додай обробку помилок і повторну спробу для всіх запитів.» (with the student's `AGENTS.md` in the repo) | 4xx/5xx are never rendered as results or as «Нічого не знайдено». `404` on a show is «Серіал не знайдено», not a generic error. `5xx`, a network failure and a non-JSON body each show an error state with «Спробувати ще», which repeats the same request. `429`: one automatic retry after 2–5 s, with a status message; a second `429` is an error state. Every failure ends the loading state. Failures aren't cached. A cancelled request is never an error. No uncaught errors or unhandled rejections in any scenario. User-facing messages come from the brief; `TypeError`, `Failed to fetch` and status JSON stay in the Console. |

**Gaps expected in the AI drafts.** Prompt calibration has to confirm these:

- no `response.ok` check, so a 404 renders as an empty list;
- `headers: { 'Content-Type': 'application/json' }` on a `GET`, which
  triggers a preflight that TVmaze rejects;
- a search on every `input`, or a debounce with no guard against stale
  responses;
- the query interpolated without encoding;
- three sequential `await`s, or ignoring `embed` and fetching per episode;
- the spinner left on after an error (no `finally`);
- errors only `console.error`ed, or `alert()`ed;
- `AbortError` shown as «Помилка»;
- a retry loop with no delay, which hammers the API on `429`;
- reading `Retry-After` or other headers the browser doesn't expose
  cross-origin;
- invented endpoints or parameters (`?limit=`, `/search?query=`);
- a CORS "fix": `mode: 'no-cors'` or a public CORS proxy.

If calibration shows a gap never appears, move its rule to a place where it
does, or drop the check from the audit and keep it as a plain rule.

**Valid alternatives the checks must pass:** `.then` chains or `async`/`await`;
`embed` or parallel requests; `AbortController` or a request-id guard for
stale responses (the brief recommends `AbortController`; the rule is about
what the user sees); any debounce from 200 to 500 ms; an app-level cache in a
`Map` or in the API module.

**Timing.** About 5 minutes of setup, 25 for C1, 20 for C2 and 30 for C3,
including about 5 to finish `AGENTS.md`: roughly 80 of 90 minutes. The
research, `API.md`, the Network checklist, the deploy and the report are
homework. The dry run has to confirm this.

## Self-check: `check.html`

- **Reuse ЛР-9's harness.** Each check opens a fresh `srcdoc` copy of
  `index.html`, with a probe injected before the app's modules: uncaught
  errors and (new) `unhandledrejection`, `alert`/`confirm`/`prompt`,
  `fetch`/XHR records. Starters ship as standalone zips, so the harness is
  copied and adapted, not shared; the README notes where it came from.
- **The fetch stub** replaces `window.fetch` inside the frame:
  - routes `api.tvmaze.com` URLs (any documented endpoint and `embed`
    combination) to fixtures, so valid alternatives work;
  - per check: hold a response until the check releases it, return a status
    and body, reject with `TypeError` (network), return HTML with
    `200` (invalid response);
  - honours `signal`: an aborted request rejects with an `AbortError`
    `DOMException`, as in the browser;
  - simulates CORS: a request with a non-safelisted header or method, or to
    another origin, rejects with `TypeError` and logs the browser's message;
  - records URL, method, headers and whether the signal was aborted.
- **Out of order.** The check types «gir», waits past the debounce, types
  «girls», releases the second response, then the first. The list and the
  status must show «girls». The same for two shows in `#details`.
- **Timing.** The debounce and `429` checks wait in real time (at most about 6
  s). The run should stay under a minute; if it doesn't, add fake timers to the
  probe.
- **Its limits.** It can't see the real API, the real CORS error or the
  Network panel. The manual checklist covers those, with screenshots in the
  report:
  - N1: a search request: status, `q` in Payload, Preview, `cache-control`
    and `access-control-allow-origin`;
  - N2: throttled to Slow 4G: the loading state shows, and fast typing leaves
    `(canceled)` rows;
  - N3: `api.tvmaze.com` blocked in Request blocking: the error state, then
    a working «Спробувати ще» after unblocking;
  - N4: Initiator: the line in `api.js` that sent the request;
  - N5: Timing of a repeated search vs a repeated show open, explained with the
    docs' **Caching** section and the Size column's `(disk cache)`;
  - N6: no Console errors through the whole flow.
- **Students don't change `check.html`, `check/` or `offline.html`.** As in
  ЛР-9: the draft commit restores them if the agent edited them, and grading
  diffs against the first commit.

## Research (§4): candidates

Same protocol as ЛР-9: predict, run, explain any miss. No AI column. Each
experiment names the defect it leads to. Snippets run in the Console of
`experiments.html` served from localhost, so the page has a real origin.

- 4.1 Fetch and Promises:
  1. `fetch` of an unknown show id: does it reject? `ok`, `status`, the body.
     _Defect:_ a 404 renders as «Нічого не знайдено».
  2. `json()` twice on one response; `json()` on an HTML page. _Defect:_ a
     body read for logging breaks the real read; a proxy's HTML page crashes
     the app.
  3. `ids.forEach(async (id) => { await … })` then `console.log('done')`;
     then `for…of` and `Promise.all`, watching the waterfall in Network.
     _Defect:_ the loading state ends before the data arrives.
  4. `try { return fetchJson(url) } catch {}` vs `return await`, on a failing
     URL. _Defect:_ an unhandled rejection despite `try/catch`.
  5. `Promise.all` vs `Promise.allSettled` with one failing request.
  6. `AbortController`: abort mid-flight and after the response. The error's
     `name`, and the `(canceled)` row. _Defect:_ a cancelled search shows
     «Помилка».
- 4.2 HTTP:
  7. `headers.get('content-type')` vs `headers.get('date')` on a TVmaze
     response: Network shows both. _Why:_ CORS-safelisted response headers.
  8. The same `GET` twice, then with `{ cache: 'no-store' }`: the Size column.
     _Why:_ `cache-control: max-age=3600`.
  9. `/lookup/shows?imdb=tt0944947`: `status`, `redirected`, `url`, and the
     two rows in Network.
  10. «Law & Order» interpolated into the URL vs through `URLSearchParams`:
      the Payload tab. _Defect:_ the search runs for «Law ».
- 4.3 CORS:
  11. The same request to `api.tvmaze.com` and to `www.tvmaze.com`. The
      second fails, but Network shows the request went out and a response
      came back. _Why:_ CORS blocks reading, not sending.
  12. A `GET` to the API with `Content-Type: application/json`, then with
      `Accept: application/json`. The first sends an `OPTIONS` that gets
      `405`. _Why:_ simple requests vs preflight; the docs' «All endpoints
      are CORS enabled» covers simple requests only.
  13. `mode: 'no-cors'` to `www.tvmaze.com`: no error, `type`, `status`,
      the body. _Defect:_ the AI's CORS "fix" silences the error and returns
      no data.
- 4.4 The Network panel: a guided walk, not an experiment table. It prepares
  checklist items N1–N6.
- 4.5 API docs → `API.md` (homework before class, committed to the student's
  repo): for each endpoint the lab uses, the URL and parameters, the success
  shape, fields that can be `null` (with a real example), status codes seen,
  empty results, caching, the rate limit, CORS (the docs' claim vs
  experiment 12) and attribution. Every row is confirmed with a real request.
- 4.6 AI-written async code: the failure modes listed under **Challenges**,
  plus why a rules file helps (readings 30–34) and what it can't do (an agent
  can still ignore it).

**Sources for §4:** MDN: Using the Fetch API, `Response`, `AbortController`,
`Promise.all`/`allSettled`, `async function`, CORS, CORS-safelisted request
and response headers, HTTP caching, HTTP response status codes,
`URLSearchParams`. Chrome DevTools: the Network reference, throttling,
request blocking, local overrides. TVmaze API docs. web.dev: on fetching and
offline UX (pick during writing).

## AI rules (handout §5.2)

- **Research:** no AI. The experiments are predict → run → explain.
- **C1 and C2:** paste only the prompt, plus the docs URL it contains. Don't
  attach the brief, `API.md` or the checks. Commit the draft unchanged as
  `Challenge N: AI draft`, then audit with `check.html` and Network, fix by
  hand, and commit `Challenge N: fixes`. The AI may explain a failing check or
  a status code; it doesn't write the fix.
- **Before C3:** write `AGENTS.md` (or the agent's own rules file) from
  `API.md` and the C1–C2 findings: the API's contract and the project's
  rules for requests and states. Commit it on its own. Then run the C3 prompt
  and audit as before.
- **The report** names the agent and its version, the model and the date.

## Report (§6)

- Email subject `[Веб] ЛР-11: <title>`, with the repository URL and the Pages
  URL.
- The experiment table (13 rows) and short conclusions.
- `API.md` and `AGENTS.md` are in the repository; the report links them.
- The agent, model and date.
- The final `check.html` result, «Пройдено: M з M».
- The Network checklist N1–N6 with screenshots.
- **Context vs defaults:** which C3 rules the draft met because `AGENTS.md`
  said so, which it met anyway, and which it ignored despite the file.

As in ЛР-9, there's no audit table: the fixes commits are the audit, and the
defence walks through one.

## Defence (§7): sample questions

- Walk through one finding in a fixes commit, with its Network evidence.
- A change made live, without AI. For example:
  - a «Сьогодні в ефірі» block from `/schedule?country=UA`, read from the
    docs on the spot;
  - show «Спробувати ще» only for errors where retrying can help (not 404);
  - raise the minimum query length, and say which check changes.
- `fetch` resolved with a 404. Where in your code does it become an error?
- Why does a `Content-Type` on a `GET` break the request when the docs say
  CORS is enabled? Can the client fix a CORS error? What does `no-cors` do?
- `embed` or three requests: what do the docs' **Caching** and **Rate
  limiting** sections say about each?
- The second identical search shows `(disk cache)`. Why does the app need its
  own cache anyway?
- What does the Network panel show for an aborted request, and why isn't it an
  error state?

Keep specific live-change tasks in an ignored file.

## Files to create

| File | Notes |
| --- | --- |
| `showfinder-starter/` | as above |
| `src/content/labs/lab-11.md` | the handout, `handout: /labs/lab-11.pdf`, no `draft` flag. Aim for 3,000 words or fewer (ЛР-9 ended at about 4,100) |
| `src/content/tasks/lab-11.md` | the brief: the app spec, the numbered rules, the Network checklist, `acceptance` |
| `docs/lab-11/README.md` | routes, why, how to regenerate, like ЛР-9's |
| `docs/lab-11/record-fixtures.mjs` | records `check/fixtures/` from the live API, with the retrieval date and the licence fields. Public: it holds no answers |
| `docs/lab-11/solution/` | **gitignored** (add the rule first): the reference `src/`, `traps.mjs`, `verify.mjs` + CDP helper, the §4 answer key |
| `public/labs/showfinder-starter.zip`, `public/labs/lab-11.pdf` | build output (`docs/build-pack.py`, `docs/build-handout.py`) |
| `README.md` | a tree line for `showfinder-starter/` |
| `docs/course-plan.md` | the mapping row ЛР 11 → `lab-11` |

## Verification

**Checks** (gitignored harness, headless Edge over CDP, as in ЛР-9):

- The starter loads with no Console problems and fails every check.
- The solution passes every check, from `/` and from a Pages-style subpath,
  and works against the live API.
- Each trap is caught by the checks it targets, at least: no `ok` check;
  `Content-Type` on `GET`; no debounce; debounce with no stale guard; a stale
  guard that shows `AbortError`; no `finally`; `return` without `await` in
  `try`; sequential requests; per-episode requests; no cache; a cached
  failure; a tight `429` retry loop; an endless `429` retry; `alert()` errors;
  raw error text in the UI; XHR; an unencoded query.
- Each valid alternative passes.

**Browser** (the stub can't prove these):

- Experiments 11–13 behave as described in Chrome and Edge, including the
  preflight's `405` showing as a CORS error.
- The Network walk N1–N6 works on the solution as written in the brief.
- `offline.html` works with no network.

**Prompt calibration:** run the three prompts in at least two agents on a
fresh starter, C3 both with and without a sample `AGENTS.md`. Record which
checks each draft fails, locally. A prompt whose draft passes everything in
both agents has nothing to audit: shorten it or move the rule.

**Timing:** a dry run of C1–C3 from the brief and the prompts, 80 minutes or
less.

**Site:** `npm run check && npm run build`; `/labs/lab-11/` and
`/labs/lab-11/task/` in preview; `python docs/build-handout.py lab-11`.

**ЛР-10:** read the final brief and the check names against ЛР-10's local
defect map.

## Order of work

1. Branch `feat/lab-11-rest-api` from `main`.
2. Add the gitignore rule for `docs/lab-11/solution/`.
3. Record the fixtures. Build the shell, the view, the fetch stub, the checks,
   the reference solution and the traps together, calibrating as you go.
4. Confirm the browser-only facts (experiments 11–13, N1–N6).
5. Run the prompt calibration.
6. Write the handout and the brief.
7. Build the PDF and the zip; update the README and the course-plan row.
8. Dry run. Merge, and so publish, no earlier than 20.10.2026.

**Commits:** the fixture recorder and fixtures; the starter with its checks;
the handout and brief; the generated files; the docs.

## Decisions

Open:

1. **Which API?** Recommended: TVmaze, for the reasons in principle 1 and the
   facts table: the same data as ЛР-8–9, real 404s and 429s, a docs claim
   that doesn't hold for preflights. Alternatives: Open-Meteo (no key, but no
   meaningful 404s), PokeAPI (no key, larger docs, no rate-limit story),
   JSONPlaceholder (fake: no real errors or caching).
2. **`AGENTS.md` before C3?** Recommended: yes, as in principle 4; it's the
   only place readings 30–34 become practice. The alternative is a plain
   prompt as in C1–C2, which measures defaults three times.
3. **Deadline.** Settled on 2026-10-13: ЛР-11 is due 23.10.2026, and ЛР-10
   moved to 21.10.2026. The original proposal was to publish after ЛР-10's
   deadline (principle 7); see **Deviations** at the top.
4. **Self-study hours.** Settled on 2026-10-13: the approved programme (PDF of
   26 August 2026) says 3 hours, as `course-plan.md` and the handout do.
5. **Лекція 6 coverage.** Its content isn't in this repo. Confirm it covers
   `AbortController`, preflight requests and HTTP caching before §4 relies on
   them. Its self-study lists Fetch, CORS and caching, but not cancellation.

Grading follows the other labs (defence 2 points + 1 bonus for submitting by
the deadline or working in class) unless decided otherwise.

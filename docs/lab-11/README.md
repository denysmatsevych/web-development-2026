# Lab 11 — REST API integration (ShowFinder starter)

| Route | Source | What it is |
| --- | --- | --- |
| `/labs/lab-11/` | `src/content/labs/lab-11.md` | the handout: 13 experiments against the live TVmaze API, `API.md`, three challenges built as AI draft → audit → fix by hand, `AGENTS.md` before the last one, report, defence |
| `/labs/lab-11/task/` | `src/content/tasks/lab-11.md` | the brief: the DOM contract, the API, the states and their texts, numbered rules and the Network checklist |
| `/labs/showfinder-starter.zip` | `showfinder-starter/` | the static shell, the view module, stubs, `check.html` with recorded TVmaze responses, `offline.html` and `experiments.html` |

## Why it looks like this

- **A real, documented API.** The programme names API documentation, status
  codes, headers, CORS and the Network panel; only a live API gives all five.
  TVmaze is the same data as Labs 8 and 9, needs no key and sends CORS
  headers. Its docs also make a claim that doesn't hold: «All endpoints are
  CORS enabled», but `OPTIONS` gets `405` with no CORS headers, so any request
  that needs a preflight fails. Experiment 12 and rule C1.9 are built on that.
- **The DOM is provided; the network layer and the states are the
  student's.** Lab 9 taught rendering, so `src/view.js` renders a list and a
  show page from raw TVmaze objects and handles nulls and HTML summaries. It
  checks its arguments and throws a readable `TypeError`, so a draft that
  passes the `{ score, show }` wrapper or an error body fails loudly instead
  of rendering nothing.
- **The AI writes a draft; the student owns the result.** Same loop and
  commits as Lab 9 (`Challenge N: AI draft`, `Challenge N: fixes`). The
  prompts are short on purpose and never mention errors, cancellation,
  encoding or headers.
- **The docs become the agent's context.** Readings 30–34 are about rules
  files. The student writes `API.md` from the docs, each row checked by a
  real request, and before Challenge 3 turns it and the Challenge 1–2
  findings into an `AGENTS.md`. The report compares the Challenge 3 draft
  with the earlier ones. The handout asks for their own words, not a copy of
  the brief.
- **No seeded network defects.** Lab 10 already used a seeded starter. The
  bugs to debug in the Network panel are the ones in the AI's draft.
- **Lab 10 order.** Lab 11 builds correctly some of the async patterns that
  Lab 10's Scenario C asks students to find. It is published before Lab 10's
  deadline (21.10.2026; Lab 11 is due 23.10.2026), so the brief and the check
  names describe them in ShowFinder's terms only. They were read against Lab
  10's local defect map before publishing.

## The self-check

`check.html` tests behaviour at the network boundary, not structure: it never
reads the app's source. Each check opens a fresh `srcdoc` copy of
`index.html` with two scripts injected before the app's modules:

- a probe, cut down from Lab 9's: uncaught errors and unhandled rejections,
  `alert`/`confirm`/`prompt`, and `XMLHttpRequest` calls;
- `check/net.js`, which replaces `fetch`. Requests to `api.tvmaze.com` get
  answers built from `check/fixtures/` (any documented endpoint and `embed`
  combination, so valid alternatives work). Each check scripts the answers:
  hold a request until the check releases it, return 404, 429, 500 or 503,
  return HTML with 200, or fail the network. The stub also honours
  `AbortSignal`, exposes only CORS-safelisted response headers, and fails a
  request that would need a preflight, goes to another origin, or uses
  `credentials: 'include'`, with Chrome's own Console message. `mode:
  'no-cors'` gets an opaque response.

The race checks (C1.8, C2.5) release the newer response first in one copy and
the older first in another, and also check that the region shows
«Завантаження…» while the newer request is pending. Otherwise a cancelled
request shown as an error would only flash. The debounce check (C1.3) types
five times 65 ms apart; the 429 check (C3.6) waits in real time, so a full run
takes about 40 s.

The check can't see the real API, a real CORS error or the Network panel, so
the brief has a Network checklist (N1–N6) with screenshots in the report.

`offline.html` loads the same `index.html` with `net.js` in auto-answer mode
(0.25–0.9 s latency). It's the classroom fallback: one NAT address for a whole
room can hit TVmaze's per-IP limit, and searches and embeds are not
edge-cached.

## The fixtures

`showfinder-starter/check/fixtures/` comes from `docs/lab-11/record-fixtures.mjs`
(public: it holds no answers), recorded from the live API on 2026-10-13:

- `search.json` — `/search/shows` for `girls`, `gir`, `law & order`, `doctor`,
  `star` and `dark`, 60 distinct shows;
- `shows.json` — `/shows/:id?embed[]=episodes&embed[]=cast` for six shows,
  Girls (139) and Derry Girls (33320) among them.

Show objects keep only the fields the view uses, and episodes and cast keep
only what it renders. Each file states its source, licence (CC BY-SA 4.0),
retrieval date and changes. A search not recorded is answered from the
catalogue of all recorded shows by substring, and a show without a full
record gets empty episode and cast lists.

## The solution is local-only

`docs/lab-11/solution/` is **gitignored**, because the repository is public:

- `src/` — the reference `api.js` and `app.js`;
- `traps.mjs` — 33 typical wrong answers and 5 valid alternatives, each a
  patch on the solution;
- `verify.mjs` + `cdp.mjs` — the headless Edge harness;
- `experiments.mjs` + `answer-key.md` — the §4 answer key, run against the
  live API.

`verify.mjs` checks five things:

- the starter's pages load with no Console problems, and every check fails;
- the solution passes every check, from `/` and from a Pages-style subpath;
- every wrong answer fails at least the checks it targets;
- every valid alternative passes;
- the solution and `offline.html` work against the live API.

Back the folder up outside the repo.

## Regenerating

```sh
node docs/lab-11/record-fixtures.mjs               # check/fixtures/ from the live API
python docs/build-pack.py showfinder-starter       # public/labs/showfinder-starter.zip
python docs/build-handout.py lab-11                # public/labs/lab-11.pdf
node docs/lab-11/solution/verify.mjs all           # local only
node docs/lab-11/solution/experiments.mjs          # local only: §4 answer key
```

The two `node` scripts in `solution/` drive headless Edge; on the course
machine Edge starts only from PowerShell, outside the agent sandbox. Edit the
starter in `showfinder-starter/`, then rebuild the zip. Re-run `verify.mjs`
after any change to `check/`, the fixtures, the shell's ids or `view.js`, and
`experiments.mjs` after changing a §4 snippet: it also confirms that each
snippet appears in the handout word for word.

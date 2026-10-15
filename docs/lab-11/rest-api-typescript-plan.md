# Plan: ЛР-11-12 «REST API і TypeScript» (joint lab)

Status: built on 2026-10-15 on branch `feat/lab-11-12-rest-api-ts`, from
`main`. All five decisions are settled (see **Decisions**). The lab replaces
the ЛР-11 published on 2026-10-13 (PR #27). Its lasting facts are in this
folder's `README.md`; `rest-api-plan.md` is deleted, and this file goes once
the lab is published.

Deviations from the plan:

- **Tests are JavaScript.** `check/2-api.test.js` … `check/5-rules.test.js`,
  with `check/support.js` instead of `fetch-stub.ts`: TypeScript tests would
  need `@types/node`, a second dependency. Only `check/types.check.ts` is
  TypeScript. The number prefix makes them run in the brief's order.
- **`check/run.js`** runs `tsc -p check` and the tests through `node:test`'s
  `run()` and prints one summary line («Типи: … · Тести: пройдено N з M»). It
  also names the Node version needed, since `npm` scripts can't run two
  commands on every shell.
- **40 tests**, not about 25, plus about 40 compile-time checks: one test per
  status or case, so a failure names one thing.
- **The starter passes 2 of 40:** the two §5 constraint tests (no `any`, no
  `@ts-` comments) hold for the stubs. The constraint tests are labelled §5,
  not T4.6, since they apply to every task.
- **Stubs have untyped parameters,** so the first typecheck shows «implicitly
  has an 'any' type» where the student must write the types. The type checks
  also check every function's signature.
- **Provided modules:** `view.ts` also has `renderStatus`; `dom.ts` exports
  `pageElements()`, called inside `start()`, because the tests import `app.ts`
  in Node, where there is no `document`. The brief's T4.5 explains the error.
- **No apostrophes in compared texts** and «...» accepted for «…»; the texts
  are tabled in the brief §3.4.
- **Length:** the handout has about 2,240 words of prose and the brief about
  1,870, not 2,000 and 1,500; the brief's extra is mostly the text tables.
- **Root `tsconfig.json` excludes `docs/*/solution`:** the TypeScript solution
  is the first one `astro check` can reach, and it imports modules that live
  only in the starter.
- **Calibration and the dry run.** Claude Sonnet and Haiku drafted T4 from the
  prompt (Sonnet 40/40 but kept old content on loading and error; Haiku
  38/40, failing T4.1). A Haiku run of T1–T3 from the brief alone passed every
  T1–T3 check, which led to two clarifications (T1.2, T3.3). Copilot, Cursor
  and a timed run with a person are still open.

## Why

The ЛР-11 published on 2026-10-13 is large: a handout of about 4,300 words, a
brief of about 2,300 words, 13 experiments, three challenges with 24 browser
checks, `API.md`, `AGENTS.md`, cancellation, debounce, retries and a CORS
preflight simulation. This plan replaces it with one simpler lab that covers two
programme rows: 2.6 (ЛР 11, REST API) and 2.8 (ЛР 12, TypeScript by hand). It
uses the same pattern as `lab-4`, which covers two slots and is shown as ЛР-4-5.

The aim is a lab whose goals are reached in a straight line. Every goal of the
two rows maps to one task or experiment. Every task has a check that says when
it is done, and a student who follows the brief in order finishes.

## Context

From [../course-plan.md](../course-plan.md):

- **Row 2.6, ЛР 11:** «AI-агент для інтеграції REST API: Fetch API, Promise та
  async/await, аналіз API-документації, loading та error states, debugging
  через Network». Self-study: analysing asynchronous code written by an AI;
  HTTP requests, status codes, headers and CORS; loading and error states
  (3 h).
- **Row 2.8, ЛР 12:** «TypeScript на практиці: типізація функцій, об'єктів та
  API-відповідей, union types, narrowing і type guards». Self-study: analysing
  types, finding compile errors, type inference (3 h).
- **Position.** After Лекція 6 (async) and ЛР-10 (debugging). Лекція 7
  (TypeScript, `tsconfig`, strict mode) sits between the two rows, so it has
  to come before the TypeScript tasks (decision 3). Before ЛР 13, which audits
  AI-written TypeScript: `any`, type assertions, strict mode and runtime
  validation of API responses at scale.

## Design principles

1. **Small and finished.** One app, four tasks, one source file per task, and
   no hidden rules. The brief names everything the tests check.
2. **The tests are the brief.** Each rule has a number (T2.3), and the test or
   type check for it carries the same number in its name. `npm run check`
   tells the student when a task is done. It runs offline in a few seconds,
   with nothing to set up in the browser.
3. **Types by hand first, the AI last.** T1–T3 are written by hand, since
   ЛР 12 is «TypeScript by hand»; the AI may explain but not write. In T4 the
   agent writes code on top of the student's types and functions, and the
   compiler and the tests show what its draft got wrong. This is ЛР 11's
   draft → audit → fix loop in its simplest form.
4. **Honest types.** In the student's code, data from the network is
   `unknown`: `getJson` returns `Promise<unknown>`, and two small type guards
   narrow it. This shows why types are erased at runtime. Full runtime
   validation and AI-typed code stay in ЛР 13.
5. **One dev dependency.** `typescript` only. There is no bundler and no test
   framework: `tsc` checks types, and `node --test` (known from ЛР-8) checks
   behaviour. Vite and Vitest belong to Лекція 8 and ЛР 14.
6. **The browser is for observation.** The experiments and the final Network
   checklist use DevTools against the live TVmaze API. The rules are checked
   by tests, so classroom rate limits or Wi-Fi can't fail anyone.

## Programme topics and where each is taught

| Topic | Where |
| --- | --- |
| Fetch API, Promise, async/await | T2, T4, E2 |
| Analysing API documentation | T1 (types written from the docs and a real response), E1 |
| Loading and error states | T3 (the state union and its texts), T4, N2–N3 |
| Debugging through Network | E1–E3, N1–N4 |
| Status codes, headers, CORS | E1–E3; T2 (`HttpError`); T3 (messages by status) |
| Analysing async code written by an AI | T4: draft → `npm run check` → fixes |
| Typing functions, objects, API responses | T1, T2 |
| Union types, narrowing, type guards | T2 (guards on `unknown`), T3 (discriminated union, `errorMessage(err: unknown)`, `never`) |
| Compile errors, type inference | the T1–T3 typecheck loop, E4–E5 |
| `tsconfig`, strict mode, type erasure | provided `tsconfig.json`, E5–E6 |

**Dropped from the current ЛР-11,** to keep the lab simple:

- `AbortController`, stale responses and debounce (ЛР-10 already covers races);
- retries and the 429 back-off;
- the preflight and CORS simulation (CORS stays as experiment E3);
- `embed` and parallel requests;
- `API.md` and `AGENTS.md`;
- `check.html`, `offline.html` and `experiments.html`;
- deployment (decision 4).

The T4 prompt includes the student's types as the agent's context, and that
replaces `AGENTS.md`.

## The app: ShowFinder на TypeScript

The student searches TVmaze shows by name, sees a list and opens one show.
The page has a search form, a status line (`role="status"`) and one main
region. That region shows the list, a show or nothing, depending on one state:

```ts
type ViewState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'results'; query: string; shows: Show[] }
  | { status: 'empty'; query: string }
  | { status: 'show'; show: Show }
  | { status: 'error'; message: string };
```

The app uses two endpoints: `GET /search/shows?q=` and `GET /shows/:id`. It has
no routing, no back button and no saved state. A new search replaces the show.

Same data as ЛР-8–10 and the current ShowFinder, so students who began the
JS version keep what they learned about the API.

## Toolchain (tried on 2026-10-15)

A scratch project with this setup worked with TypeScript 7.0.2 (npm `latest`,
the native compiler) and Node 24.20:

- `tsc` built browser JavaScript into `dist/` and rewrote `./api.ts` imports to
  `./api.js`;
- `node --test` ran the same `.ts` sources directly;
- an `@ts-expect-error` line in a check file failed the typecheck when a type
  was too loose.

- **`tsconfig.json`:** `strict`, `target`/`lib` ES2023 + DOM,
  `module: nodenext`, `rootDir: src`, `outDir: dist`,
  `rewriteRelativeImportExtensions`, `verbatimModuleSyntax`,
  `erasableSyntaxOnly`. The last one forbids the syntax Node can't strip
  (`enum`, `namespace`, parameter properties), so `tsc` and `node --test` see
  the same code.
- **`check/tsconfig.json`:** extends the main config with `noEmit` and adds
  `check/*.check.ts`, the compile-time checks.
- **Scripts:** `watch` (`tsc --watch`), `build`, `typecheck`
  (`tsc -p check`), `test` (`node --test "check/**/*.test.ts"`), and `check`
  (typecheck, then test).
- **Browser:** `index.html` loads `dist/main.js`. The student runs
  `npm run watch` with Live Preview, as in ЛР-1–10. `tsc` still emits when a
  file has type errors, so the page works while T1–T3 are in progress.
- **Node:** type stripping is on by default from Node 22.18 and 23.6; to be
  confirmed on 22.18 in **Verification**. ЛР-8 required Node ≥ 22.

## Starter: `showfinder-ts-starter/`

```text
package.json, tsconfig.json, .gitignore (node_modules/, dist/)
index.html, styles.css    from showfinder-starter, trimmed to one region
src/types.ts              T1 · stub
src/api.ts                T2 · stubs that throw Error('Not implemented')
src/state.ts              T3 · stubs
src/app.ts                T4 · stub (the AI writes it)
src/view.ts               provided: renderResults, renderShow (ported from view.js)
src/dom.ts                provided: the page's elements, typed and checked at startup
src/main.ts               provided: calls start()
check/tsconfig.json       the typecheck config
check/types.check.ts      T1 and T3 compile-time checks
check/api.test.ts         T2
check/state.test.ts       T3
check/app.test.ts         T4
check/rules.test.ts       no `any` and no @ts- comments in the student's files
check/fetch-stub.ts       a fetch replacement that serves fixtures and scripted statuses
check/fixtures/*.json     recorded TVmaze responses (subset of the current fixtures)
README.md
```

`view.ts` and `dom.ts` import the student's `Show` type, so they also fail to
compile until T1 is right. At the start everything fails, as in ЛР-8.
`dom.ts` keeps `querySelector` typing (`!`, `as`) out of the student's code,
because auditing those belongs to ЛР 13.

## Tasks (brief §4): draft specs

Exact texts and numbers are settled in the build. Texts that tests compare
avoid apostrophes, since the site renders `'` as `’`. The brief prints them in
code spans with a literal `…`.

### T1. Types of the API responses: `src/types.ts`, by hand

The student reads the docs and opens `/search/shows?q=girls` in the browser,
then writes `Show` (the fields the view uses) and `SearchResult`.

- T1.1 `Show.id` is a `number`, `Show.name` a `string`, `genres` a `string[]`.
- T1.2 `image`, `summary`, `premiered` and `rating.average` allow `null`.
  `name` doesn't.
- T1.3 `SearchResult` is `{ score: number; show: Show }`.
- T1.4 The recorded responses in `check/fixtures/` are assignable to
  `SearchResult[]` and `Show`: the types describe real data.

Checked by `check/types.check.ts`, with valid assignments plus
`@ts-expect-error` lines for the wrong ones.

### T2. Requests: `src/api.ts`, by hand

- T2.1 `class HttpError extends Error` with `readonly status: number`. Its
  message names the status.
- T2.2 `getJson(url: string): Promise<unknown>` throws `HttpError` when
  `!res.ok` and otherwise returns the parsed body. A network failure passes
  through unchanged.
- T2.3 `isShow(value: unknown): value is Show` checks at least `id`, `name`
  and `genres`. `isSearchResult` checks `score` and `show`.
- T2.4 `searchShows(query: string): Promise<Show[]>` calls
  `/search/shows?q=…` with the query encoded (`law & order`). It returns the
  shows unwrapped from `SearchResult`, in order, and `[]` when nothing is
  found.
- T2.5 `getShow(id: number): Promise<Show>` calls `/shows/:id`.
- T2.6 404, 429, 500 and 503 reject with an `HttpError` with that status.
- T2.7 A body of the wrong shape (`{}`, `[{ "foo": 1 }]`) rejects with
  `Error('Неочікувана відповідь API')`.

The tests stub `fetch` and check the URL by its path and
`searchParams.get('q')`, so both `encodeURIComponent` and `URLSearchParams`
pass.

### T3. States and messages: `src/state.ts`, by hand

- T3.1 `ViewState` exactly as in **The app**. The compile-time checks reject
  `{ status: 'results' }` with no `shows` and an `error` without a string
  `message`.
- T3.2 `errorMessage(err: unknown): string` returns:
  - a 404 text, a 429 text, a text for 5xx with the status, and a text for any
    other `HttpError`;
  - a network text for a `TypeError`;
  - a generic text for anything else (a string, `null`, a plain object).
- T3.3 `messageFor(state: ViewState): string` returns the status-line text
  for each of the six states, such as «Завантаження…», «Знайдено: 6» and
  «Нічого не знайдено: …». It is written as a `switch` with a `never`
  default. The tests can't see the `never`, so the defence asks about it.

### T4. The app: `src/app.ts`, AI draft → audit → fixes

The prompt in the brief is short. It names the three files written by hand and
the rules file, and ends with: «Теку check/ не відкривай і не змінюй; src/view.ts,
src/dom.ts і tsconfig.json не змінюй.»

- T4.1 `loadSearch(query, setState)` trims the query. An empty query sets
  `idle` and makes no request.
- T4.2 It sets `loading` before the request, then `results` or `empty`.
- T4.3 Any failure sets `error` with `errorMessage(err)`. `loadSearch` never
  rejects, so there is no `Uncaught (in promise)`.
- T4.4 `loadShow(id, setState)` sets `loading`, then `show` or `error`.
- T4.5 `start()` handles the form's `submit` without a reload and opens a
  show from a card click by delegation (ЛР-9). Its `render` writes
  `messageFor(state)` to the status line and calls the view. Checked in the
  browser and by the Network checklist, not by tests.
- T4.6 There is no `any` and no `@ts-ignore`, `@ts-nocheck` or
  `@ts-expect-error` in `src/` (`rules.test.ts`). Type assertions and `!` are
  looked at in the defence and in ЛР 13.

T4.1–T4.4 are tested by passing a recording `setState` and the fetch stub.

## Self-check

`npm run check` runs the typecheck and then the tests (about 25 named checks).
A run takes a few seconds and works offline. The instructor runs the same
command in the student's repository when grading. Nothing needs to be
published.

## Experiments (handout §4)

There are six experiments, with a one-line answer each in a report table.
E1–E3 take about 20 minutes on the first day and need no TypeScript.

- **E1. A response.** Open `/search/shows?q=girls` in the browser and in
  Network. Note the status, `content-type`, the size and the top-level shape.
  Why does the app need `.show`?
- **E2. A 404.** In the Console, run `await fetch('…/shows/999999999')` and
  read `ok` and `status`. Does `fetch` reject on 404? When does it reject?
- **E3. CORS.** Find `access-control-allow-origin` on a TVmaze API response.
  Then, from the app page, fetch a URL without it. Why does the browser block
  it when the same URL opens in a tab? The URL is chosen and checked in the
  build.
- **E4. Inference.** Hover over `res.json()` and over
  `results.map((r) => r.show)` in the editor. Which is `any`, and why is
  `getJson`'s return type `unknown` and not `any`?
- **E5. Strict mode.** Set `"strict": false` and run `npm run typecheck`.
  Which errors disappeared? Which of them would have crashed at runtime?
  Restore the setting.
- **E6. Erasure.** Open `dist/api.js`. Where did the types go, and why does
  that make T2.3's guards necessary?

## Network checklist (brief §6)

On the finished app against the live API, with a screenshot each:

- **N1.** Search `law & order`: the request URL shows the query encoded, and
  the status is 200.
- **N2.** With «Slow 4G» throttling, «Завантаження…» is visible before the
  results.
- **N3.** With «Offline» (or Block request URL), the network message appears.
  Back online, the next search works.
- **N4.** Opening a show sends `/shows/:id` and shows it.

## Working with the AI and commits (handout §5)

- **T1–T3:** the AI may explain the docs, the compiler errors and the
  concepts, but it doesn't write code into `src/`.
- **T4:** the agent writes `app.ts` from the brief's prompt. The student
  commits the draft unchanged, runs `npm run check` and the browser, and fixes
  the draft by hand.
- **Commits:**
  - «Starter»;
  - «T1: types», «T2: api», «T3: state»;
  - «T4: AI draft»;
  - «T4: fixes», if the draft didn't pass.
- **Unchanged in every commit:** `check/`, `src/view.ts`, `src/dom.ts` and
  `tsconfig.json`.

## Report (handout §6)

1. The repository link.
2. The E1–E6 table.
3. A screenshot of `npm run check` with everything passing.
4. N1–N4 with screenshots.
5. The AI agent's name and version, the model and the date.
6. A short summary: what T1–T3 contain, what was wrong in the T4 draft and
   what was fixed.

## Defence (handout §7)

The defence is an interview-style list, grouped as in the current ЛР-11.
Each group lists 3–5 questions, about 33 in all:

- **Fetch і Promise:** when `fetch` rejects; why `res.json()` is async; what
  `await` does to the call stack.
- **HTTP:** status classes; 404 vs 429 vs 503 for the user; why encode the
  query.
- **CORS:** same-origin; the header that allows a read; why a tab works where
  `fetch` doesn't.
- **Стани інтерфейсу:** why a loading state; why not `alert`; what happens
  if two searches overlap.
- **Типи:** `interface` vs `type`; structural typing; inference; `null` under
  `strictNullChecks`.
- **Union і narrowing:** discriminated unions; the narrowing operators;
  `never` in a `switch`; what a type guard actually promises; `unknown` vs
  `any`; why `instanceof TypeError` is a weak test for a network failure.
- **Компілятор:** what `tsc` emits; erasure; what `strict` turns on; what
  Node can't strip; `@ts-expect-error` vs `@ts-ignore`.
- **AI:** how your types constrained the agent; what the draft got wrong; why
  the agent may not edit `check/`.

## Grading (handout §8)

This follows the component scheme of the current ЛР-11 and the two-slot
precedent of `lab-4`: 4 points plus 1 for on-time submission (decision 2).

| Part | Points | How |
| --- | --- | --- |
| Self-check | 1 | `npm run check` in the repo: no type errors and every test passes — 1; no type errors and at least 80% of the tests — 0.5; otherwise 0 |
| Process | 1 | commits per §5 and every report item present — 1; one missing — 0.5; otherwise 0 |
| Defence | 2 | a question about the student's own code — up to 1; two §7 questions from different groups — 0.5 each |
| Bonus | +1 | report sent by the deadline |

In `course-plan.md`, the lab counts as ЛР 11 (3 with the bonus) in the
ЛР 8–11 row and as ЛР 12 (2) in the ЛР 12–14 row, so the totals stay 72 and 100.

## The ЛР-11 already published

- The lab is replaced in place at `/labs/lab-11/` (decision 1), with
  `numberLabel: "11-12"`. The students already have that URL.
- A line at the top of the handout says the JS ShowFinder is withdrawn and
  nothing from it is to be submitted. The same line names the new deadline.
- If anyone has already submitted the old version, it is graded by the old
  rubric.
- The old materials stay in Git history (merge `306900f`). Copy the
  gitignored `docs/lab-11/solution/` outside the repo before replacing it.

## Files

**Create:**

- `showfinder-ts-starter/`;
- `public/labs/showfinder-ts-starter.zip`;
- the gitignored `docs/lab-11/solution/`, with:
  - `src/`;
  - `traps.mjs`, about 12 typical wrong answers that must each fail their
    rule, and a few valid alternatives that must pass;
  - `verify.mjs`;
  - `calibration.md`;
  - the E1–E6 answer key.

**Rewrite:**

- `src/content/labs/lab-11.md`. The target is at most about 2,000 words.
  Frontmatter: `numberLabel: "11-12"`, a combined title, and
  `duration: "4 академічні години (самостійна робота — 6 годин)"`.
- `src/content/tasks/lab-11.md`. The target is at most about 1,500 words, with
  new `highlights` and `acceptance`.
- `public/labs/lab-11.pdf`.
- `docs/lab-11/README.md`.
- `docs/lab-11/record-fixtures.mjs`: no embeds, and the queries the tests use.
- `docs/course-plan.md`: the mapping row, a Part 2 revision bullet and the
  grading notes. The `.docx` needs the same edit.
- The root `README.md` starter list.
- `docs/build-pack.py`: skip `node_modules/` and `dist/`, and treat `.ts` as
  text.

**Delete:**

- `showfinder-starter/`;
- `public/labs/showfinder-starter.zip`;
- `docs/lab-11/rest-api-plan.md`;
- this file, at publication.

Then grep the whole repo for:

- `showfinder-starter`, `check.html`, `offline.html`, `24 з 24`;
- `API.md` and `AGENTS.md` in Lab 11 context.

## Verification

- **`verify.mjs`** checks four things:
  - on the starter, the typecheck fails and every test fails;
  - on the solution, there are no type errors and every test passes;
  - each trap fails the rule it targets;
  - each valid alternative passes.
- **Node 22.18** runs the tests (`npx -p node@22.18 …`). If it doesn't,
  `engines` says ≥ 24.
- **VS Code and WebStorm** show the same errors as `npm run typecheck` with
  TypeScript 7. If the bundled TypeScript differs, the README says how to
  select the workspace version.
- **A browser smoke test** of the built solution against the live API, in
  headless Edge: search, open a show, then go offline and check that the
  error text appears.
- **T4 prompt calibration** with Claude Sonnet and Haiku as the student's agent
  (and Copilot or Cursor, if possible), starting from the solution's T1–T3.
  The record shows which rules each draft missed and whether any agent touched
  `check/`.
- **A timed dry run** of the whole lab. The target is about 3 hours: two class
  sessions cover E1–E3 and T1–T4, and E4–E6 and the report are done at home.
- **The site:** `npm run check && npm run build`, then rebuild the zip and the
  PDF.

## Order of work

1. Settle the decisions.
2. Copy the gitignored solution aside. Create branch
   `feat/lab-11-12-rest-api-ts` from `main`.
3. Record the fixtures, build the starter, and write the checks.
4. Write the solution, the traps and `verify.mjs`.
5. Write the brief.
6. Write the handout.
7. Run the T4 calibration and the timed dry run, and fix what they find.
8. Delete the old materials, rebuild the zip and the PDF, and update the docs
   and the course plan.
9. Run the site check and build, then open the PR.

## Decisions

Settled on 2026-10-15: decisions 1, 2, 4 and 5 follow the recommendation,
and the deadline (decision 3) is **19.10.2026**.

1. **Replace the published ЛР-11 in place?** Recommended: yes, at
   `/labs/lab-11/`, shown as ЛР-11-12, with one line for students who started
   the JS version. The alternative is to keep the old lab and publish this as
   a new `lab-12`. That doesn't simplify ЛР 11 and leaves one slot short.
2. **Points.** Recommended: 4 + 1, as two slots (`lab-4` precedent). Then
   `course-plan.md` totals stay unchanged. The alternative is 2 + 1, as one
   lab, which leaves the ЛР 12–14 row with 2 points to place elsewhere.
3. **Dates.** The deadline and the date of the second class (the ЛР 12 slot)
   are needed. Лекція 7 must come before T1. If it comes after the first
   class, that class covers setup, E1–E3 and reading the docs.
4. **Deployment.** Recommended: not required, since the instructor runs
   `npm run check` from the repository. Requiring GitHub Pages would mean
   committing `dist/` or adding an Actions workflow.
5. **The AI's role.** Recommended: T4 only, with T1–T3 by hand, as ЛР 12 is
   «TypeScript by hand». The alternative is a second AI loop in T2 (the agent
   drafts `api.ts`). That gives more AI auditing, but a longer lab and more
   commits.

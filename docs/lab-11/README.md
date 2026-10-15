# Lab 11-12 — REST API and TypeScript (ShowFinder TS starter)

| Route | Source | What it is |
| --- | --- | --- |
| `/labs/lab-11/` | `src/content/labs/lab-11.md` | the handout, shown as ЛР-11-12: six experiments (E1–E3 in the browser, E4–E6 in the project), how to work (T1–T3 by hand, the T4 AI loop, commits), report, defence, grading |
| `/labs/lab-11/task/` | `src/content/tasks/lab-11.md` | the brief: the API, the `Show` fields, the page and the provided modules, the states and their texts, the tasks T1–T4 with numbered rules, constraints, the Network checklist |
| `/labs/showfinder-ts-starter.zip` | `showfinder-ts-starter/` | the page, the provided `view.ts`, `dom.ts` and `main.ts`, four stubs, and `check/` |

## Why it looks like this

- **Two programme slots, one lab.** It covers rows 2.6 (ЛР 11, REST API with an
  AI agent) and 2.8 (ЛР 12, TypeScript by hand), the way `lab-4` covers two
  slots. It replaced, on 2026-10-15, the JavaScript ShowFinder lab published
  on 2026-10-13, which had 13 experiments, three challenges, 24 browser
  checks, `API.md` and `AGENTS.md`. That version is in Git history (merge
  `306900f`); its local solution was backed up outside the repo. The goal of
  the rewrite is a lab whose goals are reached in a straight line.
- **Four tasks, one file each.** T1 `types.ts` (API types), T2 `api.ts`
  (requests and type guards), T3 `state.ts` (the state union and the texts),
  T4 `app.ts` (the app). Every rule is numbered, and a test or a type check
  carries the same number, so `npm run check` says when a task is done.
- **Types by hand, the AI last.** T1–T3 are written by hand: ЛР 12 is
  «TypeScript by hand». In T4 the agent writes code on top of the student's
  types and functions, from a short prompt that doesn't mention the rules,
  and the compiler and the tests show what the draft got wrong.
- **Honest types.** `getJson` returns `Promise<unknown>`, and two small guards
  (`isShow`, `isSearchResult`) narrow it. That makes erasure visible (E6) and
  leaves full runtime validation and auditing AI-written types to ЛР 13.
- **The brief states everything the checks check.** The texts the tests
  compare are tabled in the brief §3.4 and avoid apostrophes, since the site
  renders `'` as `’`. The tests accept «...» for «…».
- **No deployment.** The instructor runs `npm run check` in the student's
  repository. `node_modules/` and `dist/` are in the starter's `.gitignore`.
- **Graded by components:** 4 points (self-check 1, process 1, defence 2)
  plus 1 for on-time submission, the two-slot weight. The rubric is in the
  handout, §8; the course-level picture is in
  [../course-plan.md](../course-plan.md).

## The toolchain

- **One dev dependency: `typescript` 7.0.2,** the native compiler and npm
  `latest` on 2026-10-15. It ships `tsc` only, with no `tsserver`, so editors
  highlight with their own TypeScript. VS Code 1.142 bundles 6.0.3, which
  reports the same errors on the starter and the solution.
- **`tsconfig.json`:** `strict`, ES2023 + DOM, `module: nodenext`,
  `src/` → `dist/` with source maps, `rewriteRelativeImportExtensions` (source
  imports `./api.ts`, `dist/` imports `./api.js`), `verbatimModuleSyntax` and
  `erasableSyntaxOnly`. With the last one, Node can run the same `src/*.ts`
  the browser gets compiled.
- **Node ≥ 22.18.** The tests import `src/*.ts` directly, and Node strips
  types by default from 22.18 (checked: 22.18.0 passes, 22.17.1 fails with
  `ERR_UNKNOWN_FILE_EXTENSION`). `check/run.js` says so in Ukrainian.
- **The tests are JavaScript** (`check/*.test.js`), so the starter needs no
  `@types/node`. Only the type checks (`check/types.check.ts`) are TypeScript.
- **The page** loads `dist/main.js`. Without a build, an `onerror` on the
  script tag writes «Немає dist/main.js: запустіть npm run watch» in the
  status line.

## The self-check

`npm run check` (`check/run.js`) runs `tsc -p check` and then every
`check/*.test.js` through `node:test`'s `run()`, with the spec reporter. It ends
with one line: «Типи: без помилок · Тести: пройдено 40 з 40».

- **`check/types.check.ts`** never runs. It assigns the student's types to
  the expected shapes, uses `// @ts-expect-error` lines for what must not
  compile, and assigns the recorded fixtures to `SearchResult[]` and `Show`
  (T1.4). It also checks every function's signature. Each block's comment, or
  a trailing comment, names the rule.
- **The tests** replace `fetch` with `check/support.js`'s stub. It answers from
  the fixtures, a scripted status, a body of the wrong shape, or a
  `TypeError` network failure.
  - T4's tests pass a recording `setState` and check the sequence of states,
    including that `loading` comes before the request.
  - Importing `app.ts` in Node fails if it touches `document` outside
    `start()`, so the brief's T4.5 explains that error.
- **Not checked by tests:** `start()` (the form, delegation and rendering)
  and the real API. The Network checklist (N1–N4) and the defence cover them.
- **The starter** gives 30 type errors and passes 2 of 40 tests, the two §5
  constraint tests (no `any`, no `@ts-` comments).

## The fixtures

`showfinder-ts-starter/check/fixtures/` comes from
`docs/lab-11/record-fixtures.mjs`, recorded from the live API on 2026-10-15
(public: it holds no answers).

- `search.json`: `/search/shows` for `girls` and `law & order` (the tests'
  own), plus `kitchen` and `pilot`. They are chosen so that `image`,
  `summary`, `premiered` and `rating.average` are each `null` somewhere and
  `genres` is empty somewhere, which makes T1.4 meaningful.
- `shows.json`: `/shows/:id` for 139 (Girls), 41734 (a null summary) and 45962
  (Harlem's Kitchen: a null image and premiered).

Show objects keep a dozen fields; each file states its source, licence
(CC BY-SA 4.0), retrieval date and changes.

## The solution is local-only

`docs/lab-11/solution/` is **gitignored**, because the repository is public:

- `src/`: the reference `types.ts`, `api.ts`, `state.ts` and `app.ts`;
- `traps.mjs`: 29 typical wrong answers, each a patch on the solution with
  the rules it must fail, and 7 valid alternatives that must pass
  (`URLSearchParams`, `status >= 400`, type aliases with `readonly`, `then()`
  instead of `await`, …);
- `verify.mjs`: copies the starter into the OS temp folder per case, with
  `node_modules` linked to `solution/.deps`. It runs the typecheck and the
  tests (TAP) and maps each failure to a rule. `verify.mjs dir <path>` reports
  on any project;
- `smoke.mjs` + `cdp.mjs`: the starter page and the built solution in
  headless Edge against the live API, plus E1–E3 for the answer key;
- `answer-key.md`: E1–E6;
- `calibration.md`: what each agent's T4 draft failed.

Back the folder up outside the repo.

## Regenerating

```sh
node docs/lab-11/record-fixtures.mjs               # check/fixtures/ from the live API
python docs/build-pack.py showfinder-ts-starter    # public/labs/showfinder-ts-starter.zip
python docs/build-handout.py lab-11                # public/labs/lab-11.pdf
node docs/lab-11/solution/verify.mjs               # local only
node docs/lab-11/solution/smoke.mjs                # local only, after verify.mjs; from PowerShell
```

`smoke.mjs` drives headless Edge, which on the course machine starts only from
PowerShell, outside the agent sandbox. Edit the starter in
`showfinder-ts-starter/`, then rebuild the zip. `build-pack.py` leaves
`node_modules/` and `dist/` out. Re-run `verify.mjs` after any change to
`check/`, the fixtures, the provided modules or the brief's texts.

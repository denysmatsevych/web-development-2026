# Lab 12-13 — TypeScript by hand and the AI migration (ShowFinder TS starter)

| Route | Source | What it is |
| --- | --- | --- |
| `/web-development/labs/lab-12/` | `src/content/labs/web-development/uk/lab-12.md` | the handout: six experiments (Е1 in the browser, Е2–Е6 in the project), how to work (T1–T3 by hand, the T4 migration → audit → fix loop, commits), report, defence, grading |
| `/web-development/labs/lab-12/task/` | `src/content/tasks/web-development/uk/lab-12.md` | the brief: the API, the fields, the JavaScript modules, the states and texts, then T1–T4 with numbered rules and the T4 prompt, the §5 constraints and the browser checklist |
| `/labs/showfinder-ts-starter.zip` | `showfinder-ts-starter/` | TypeScript stubs for T1–T3, the JavaScript modules T4 migrates, and `check/` |

## Why it looks like this

- **Two programme rows, one app.** Row 2.8 (ЛР 12, TypeScript by hand) and
  row 2.9 (ЛР 13, AI-assisted migration from JavaScript and the quality of
  its result) work on the same app, so they are one lab, shown as ЛР-12-13
  the way `lab-4` covers two slots. Lab 11 stays a separate lab with its own
  starter, and this starter doesn't need anything from it.
- **By hand first, the AI second.** T1–T3 are the modules everything else
  depends on: the types of the API responses, typed requests that narrow
  `unknown` with type guards, and the state union. The student writes them
  by hand. In T4 an agent migrates the rest (`app`, `view`, `dom`, `main`)
  from a short prompt that names no rule, and the student audits the result.
- **A mixed project.** With `allowJs`, `tsc` also compiles `src/*.js` into
  `dist/`. The JavaScript modules import the TypeScript ones as `./api.ts`,
  and `rewriteRelativeImportExtensions` makes that `./api.js` in `dist/`.
  Node runs the same sources in the tests. So after T3 the page works with
  the old JavaScript, and the tests run the JavaScript before the migration
  and the TypeScript after it (`importSrc` in `check/support.js` takes the
  `.ts` file when it exists).
- **Seeded defects in the JavaScript.** The modules T4 migrates carry a few
  defects of the kinds a migration brings out. Strict mode reports some of
  them, the compiler reports one even without strict, and one only the tests
  can see, because it hides behind an `any` that the compiler accepts. Their
  tests fail before the migration. The defect map is in the gitignored
  `solution/answer-key.md`, not here, because the repository is public.
- **No type assertions anywhere in `src/`.** The §5 tests reject `as` (except
  `as const`), a postfix `!`, `<T>value`, `querySelector<T>` and
  `closest<T>`, as well as `any` and `@ts-` comments. They also reject
  `declare` and `.d.ts` files: a global interface merge such as
  `declare global { interface EventTarget … }` silences an error the way an
  assertion does, without any of the other banned tokens. Each place where an
  agent tends to assert has a narrowing alternative (`instanceof`, `in`,
  `typeof`), and the reference solution uses no assertion. The tests read
  every file under `src/`, subfolders included, blank out comments and string
  contents before matching, and skip `as` in import renames. `<T>value` never
  gets that far: `erasableSyntaxOnly` makes `tsc` reject it (TS1294), and
  Node's type stripping refuses to run it.
- **`tsconfig.json` stays as shipped.** T4.2 compares both configs with the
  starter's, so an agent that turns strict mode off fails a named rule
  instead of passing more checks.
- **Graded by components, 4 + 1.** For the two slots: self-check 1, process
  1 (commits and every report item, the experiments table included), defence
  2, and +1 for on-time submission. The
  self-check's half point needs 90 % of the tests, which T1–T3 alone don't
  reach (see the table below): otherwise skipping the migration would score
  better than an unfinished one with type errors left. The rubric is in the
  handout, §8; the course-level picture is in
  [../course-plan.md](../course-plan.md).

## The self-check

`npm run check` runs `check/run.js`: `tsc -p check` (all of `src/` and
`check/types.check.ts`), then `node:test` over `check/*.test.js`, and prints
one summary line. There are 48 tests: 17 for T2, 12 for T3, 15 for T4 and 4
for §5. `types.check.ts` imports `app` and `view` with a `.js` extension, so
the T4 signature checks resolve to the JavaScript before the migration (where
the inferred `any` passes) and to the TypeScript after it.

| State | Types | Tests |
| --- | --- | --- |
| the starter | 25 errors | 8 of 48 |
| T1–T3 done, JavaScript not migrated | no errors | 39 of 48 (81 %) |
| the reference solution | no errors | 48 of 48 |

## The fixtures

`showfinder-ts-starter/check/fixtures/` comes from
`docs/web/lab-12/record-fixtures.mjs` (public: it holds no answers), recorded from
the live API on 2026-10-15: four searches (`girls`, `law & order`, `kitchen`,
`pilot`) and three shows (139, 41734, 45962). They are chosen so that every
nullable field of `Show` is `null` in at least one show. Show objects keep
only the fields the app uses. Each file states its source, licence (CC BY-SA
4.0), retrieval date and changes.

## The solution is local-only

`docs/web/lab-12/solution/` is **gitignored**, because the repository is public:

- `src/` — the reference `types.ts`, `api.ts` and `state.ts`, and the
  migrated `app.ts`, `view.ts`, `dom.ts` and `main.ts`;
- `naive/` — a literal migration that renames and types the JavaScript and
  fixes nothing: what strict mode reports;
- `traps.mjs` — 50 typical wrong answers and 14 valid alternatives, each a
  patch on the solution;
- `verify.mjs` — checks the starter, the T1–T3 state, the naive migration,
  the solution, every trap and every alternative;
- `smoke.mjs` + `cdp.mjs` — the built solution in headless Edge against the
  live API;
- `answer-key.md` — the §4 answers and the seeded-defect map;
- `calibration.md` — what agents did with the T4 prompt.

Back the folder up outside the repo.

## Regenerating

```sh
node docs/web/lab-12/record-fixtures.mjs              # check/fixtures/ from the live API
python docs/web/build-pack.py showfinder-ts-starter   # public/labs/showfinder-ts-starter.zip
python docs/web/build-handout.py lab-12               # public/labs/lab-12.pdf
node docs/web/lab-12/solution/verify.mjs              # local only
```

Re-run `verify.mjs` after any change to `check/`, the fixtures, the
JavaScript modules or the brief's texts. `smoke.mjs` drives headless Edge,
which on the course machine starts only from PowerShell, outside the agent
sandbox. Rebuild the zip after committing: its entries are dated by Git.

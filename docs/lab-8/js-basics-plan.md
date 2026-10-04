# Plan: ЛР-8 «Основи JavaScript»

Status: built, 2026-10-04, on branch `feat/lab-8-js-basics`, stacked on the
rename in [../lab-10/rename-plan.md](../lab-10/rename-plan.md). It skipped the
`draft: true` step below: an unmerged branch already keeps unfinished work off
the site, and a draft hides it from local review too. Delete this file once
the lab is published. The facts that last are in this folder's `README.md`.

## Context

From [../course-plan.md](../course-plan.md), row 2.2:

- **Тема:** «Основи JavaScript: типи даних і приведення типів, Scope,
  Closures, функції, масиви, об’єкти та ES Modules»
- **Самостійна робота (3 год.):** Console experiments where students
  predict the result, compare it with the AI agent's explanation, and check
  it in the browser; data-processing functions without the DOM.
- **Читання:** Основна 1 (MDN). Допоміжна 1 (Flanagan), 2 (You Don't Know
  JS Yet), 10 (ECMAScript 2025), 13 (MDN JavaScript Guide).
- **Position:** after Лекція 5. Before ЛР-9 (DOM and events) and ЛР-10
  (debugging).

**The students** are in the 3rd year of Computer Science and already program
in other languages. So far in this course they have written JavaScript only
for ЛР-7's mobile menu. ЛР-1 set up Node, ESLint, Prettier, Git and GitHub
Pages.

## Design principles

1. **Teach what JavaScript does differently, not syntax.** Students already
   know variables, loops and conditionals. The lab covers the places where
   their intuition from other languages, or an AI agent's confident answer,
   is wrong: coercion, scope, closures, references, modules.
2. **Predict, ask the AI, then run.** This is the protocol from ЛР-10's
   experiment C.2:
   1. Write your own prediction.
   2. Ask the AI agent for its prediction without showing it the result.
   3. Run the code.
   4. Explain whichever prediction was wrong.

   The AI is there to explain, not to write the code.
3. **Pure functions, no DOM.** The DOM and `this` in event handlers belong to
   ЛР-9. The Event Loop belongs to Лекція 6 and ЛР-10, so this lab uses no
   timers and no Promises.
4. **A shared starter with tests provided.** Everyone works from the same
   baseline, as in ЛР-6's code challenges. Node's built-in test runner
   (`node --test`) gives instant feedback with nothing to install.
5. **No reference fixes for ЛР-10.** The data comes from a different domain
   than Courtly (see **Dataset**). Before shipping, check the challenge specs
   against the local defect map (`docs/lab-10/starter-defects.md`). No
   ЛР-8 function may amount to a correct version of a seeded ЛР-10 defect.

## Topics and where each is taught

| Topic | Research (§4) | Practice (§5) |
| --- | --- | --- |
| `typeof`, primitives vs objects, `NaN`, `0.1 + 0.2` | 4.1 | C4 |
| Coercion, `==` vs `===`, truthy/falsy, `??` vs `\|\|`, `?.` | 4.1 | C1, C2 |
| `let`/`const`/`var`, block vs function scope, hoisting, TDZ | 4.2 | defence |
| Closures | 4.2 | C5 |
| Values vs references, shallow copy, `structuredClone`, `Object.freeze`, array methods that mutate | 4.3 | C1, C3 |
| Function declarations vs arrow functions, default parameters (`undefined` vs `null`), rest, destructuring | 4.4 | C2 |
| ES modules: named exports, strict mode, module scope, `file://` blocked | 4.4 | §5.1 |

## Handout — `src/content/labs/lab-8.md`

Use the same section outline as ЛР-6 and ЛР-10:

1. Мета роботи
2. Цілі та результати навчання
3. Завдання лабораторної роботи
4. Дослідницькі завдання. Each subsection has three parts:
   **Опрацювати** (sources), **Дослідити** (questions) and **Експеримент**.
   - 4.1. Типи даних і приведення типів
   - 4.2. Scope, Hoisting і Closures
   - 4.3. Значення й посилання: об’єкти та масиви
   - 4.4. Функції та ES Modules
5. Практична частина: Code Challenges
   - 5.1. Підготовка:
     1. Download the starter and make the first commit with it unchanged.
     2. Run `node --test`; every test should fail.
     3. Open `index.html` via `file://` and see the module error.
     4. Open it again through Live Preview.
   - 5.2. Правила роботи з AI-агентом
   - 5.3–5.7. Challenges 1–5
   - 5.8. Коміти: one per challenge
6. Вимоги до звіту:
   - email subject `[Веб] ЛР-8: <title>`;
   - repository URL and Pages URL;
   - the experiment table;
   - `node --test` output;
   - for each challenge, the trap it contained and why the fix works.
7. Усний захист
8. Оцінювання: the course convention of 2 points for the defence, plus a
   1-point bonus for submitting by the deadline or doing the work in class.

Aim for at most 2,500 words. For comparison, ЛР-6 is 2,731 and ЛР-10 is
2,637.

**Experiment table.** Students fill it in during §4. The AI's prediction is
recorded before the code is run.

| # | Код | Мій прогноз | Прогноз AI (без запуску) | Фактичний результат | Пояснення |
| --- | --- | --- | --- | --- | --- |

**Experiment candidates.** For each one, the handout should name the real bug
it causes. Skip trivia such as `[] + {}`.

- 4.1:
  - `'5' + 1` vs `'5' - 1`
  - `0.1 + 0.2 === 0.3`
  - `NaN === NaN` and `Number.isNaN`
  - `0 || 'n/a'` vs `0 ?? 'n/a'`
  - `null == undefined` vs `null == 0`
  - `[10, 9, 1].sort()`
- 4.2:
  - reading a `var` and a `let` before they're declared
  - a `for` loop that pushes closures into an array, with `var` vs `let`
  - adding a property to a `const` object vs reassigning the binding
- 4.3:
  - changing a nested field through `{ ...user }`
  - `Object.freeze` only freezes one level
  - `sort()` changes the array and returns it, vs `toSorted()`
- 4.4:
  - a default parameter receiving `undefined` vs `null`
  - calling a function declaration before its definition, vs a `const` arrow
    function
  - a top-level `var` in a module doesn't become a global

## Starter — `js-basics-starter/`

```text
js-basics-starter/
  README.md            (uk) what it is, how to run, data attribution
  package.json         {"type": "module", "scripts": {"test": "node --test"}}, no dependencies
  data/shows.json      the dataset, used by index.html
  src/normalize.js     C1
  src/filter.js        C2
  src/sort.js          C3
  src/stats.js         C4
  src/closures.js      C5
  test/*.test.js       provided tests (node:test + node:assert/strict)
  index.html, main.js  import src/*, print a short report into <pre>; deployed to Pages
```

- **Stubs.** Each function is a stub with JSDoc that throws
  `new Error('Not implemented')`, so every test starts red.
- **Tests use small inline fixtures** built around the traps, such as a
  rating of `0` or a `null` year. They don't read `data/shows.json`.
- **Tests deep-freeze their inputs.** Modules run in strict mode, so a
  function that mutates its argument throws a `TypeError`. Mutation shows up
  as a test failure instead of passing silently.
- **Name.** The `*-starter` pattern in the site's `tsconfig.json` already
  excludes it, so nothing needs adding.

## Challenges — draft specs

The final specs belong in the brief, `src/content/tasks/lab-8.md`. Each
challenge should take about 10–15 minutes in class once §4 is done at home.

| # | Function | Spec and the trap it tests |
| --- | --- | --- |
| C1 | `normalizeShow(raw)` | Returns `{ id, name, year, rating, runtime, genres }`. `rating` is `raw.rating?.average ?? null`, and `0` is a valid rating, so `\|\|` fails. `year` comes from `premiered` (`"YYYY-MM-DD"`) as a number, or `null`. `genres` defaults to `[]`. The input stays untouched. |
| C2 | `filterShows(shows, { query = '', genre, minRating = 0 } = {})` | Case-insensitive name search on the trimmed query. `minRating: 0` means no filter, so shows with `null` ratings stay in; `if (minRating)` gets this wrong. Also works when called with no options. |
| C3 | `sortShows(shows, key, direction = 'asc')` | Returns a new array. Numeric comparison for `year` and `rating`; the default sort compares as strings. `null` sorts last in both directions. Names compare with `localeCompare`. |
| C4 | `genreStats(shows)` | Maps each genre to `{ count, averageRating }`. The average ignores `null`. An empty genre gives `null`, not `NaN`. Rounded to one decimal, still a number (`toFixed` returns a string). |
| C5 | `createCounter(start = 0)`, `once(fn)`, `memoize(fn)` | Each instance keeps its own state; the tests create two. `memoize` caches by a single primitive argument in a `Map`. |

## Dataset

**Decided (2026-10-04): a trimmed snapshot of TVmaze `/shows`, about 30
records.** [TVmaze](https://www.tvmaze.com/api) is a free, public TV-show
database API. It needs no key and allows requests from the browser (CORS).

The first page (`https://api.tvmaze.com/shows?page=0`) had 240 shows when
checked on 2026-10-04, with real gaps:

- 4 with no `rating.average`
- 11 with no `runtime`
- 11 with no `network`
- 5 with an empty `genres` array

Dates are strings (`"2013-06-24"`) and fields are nested (`rating.average`,
`network.name`). Pick the ~30 records so that each kind of gap appears at
least twice. A missing `premiered` doesn't occur on that page, so that trap
comes only from the tests' inline fixtures.

It also leads into ЛР-11, where students fetch a live API.

- **Licence:** CC BY-SA. Credit TVmaze with a link in the starter README and
  on the `index.html` report. Mark `data/shows.json` as CC BY-SA, because the
  trimmed copy is an adaptation and the ShareAlike terms carry over to it.
- **Individual assignment:** TVmaze is topic 2 there, so a student with that
  topic gets some code they can reuse. That's acceptable.

**Not Courtly.** ЛР-10's starter is Courtly, so data-processing functions over
the same model risk handing out the fixes.

## AI rules (handout §5.2)

- **Research:** the AI predicts the result before it is shown. The report
  records both predictions.
- **Challenges:** the AI may explain a concept or a failing test, but must not
  write the function. The defence checks this with a change made live.
- **Same framing as ЛР-10 §5.2,** so the course keeps one protocol.

## Defence (§7) — sample questions

- Why did test X fail before your fix?
- A change made live: `null` first, or sort by name descending.
- Predict a loop of closures with `var`, then with `let`.
- Why does `index.html` fail from `file://` but work through Live Preview?

The handout lists the kinds of questions. If you want specific live-change
tasks, keep them in an ignored file.

## Files to create

| File | Notes |
| --- | --- |
| `js-basics-starter/` | as above |
| `src/content/labs/lab-8.md` | `draft: true` until everything is ready; `handout: /labs/lab-8.pdf` |
| `src/content/tasks/lab-8.md` | the brief: function specs and `acceptance`, with the same frontmatter fields as the other briefs |
| `docs/lab-8/README.md` | routes, why, and how to regenerate, like `docs/lab-10/README.md` |
| `docs/lab-8/build-pack.py` | builds `public/labs/js-basics-starter.zip`. It's ЛР-10's script with `SRC`/`OUT` changed, which makes three near-identical copies; generalizing to `docs/build-pack.py <starter>` belongs in a separate PR |
| `docs/lab-8/solution/` | the reference solution. **Gitignored:** add it to `.gitignore` before creating it |
| `public/labs/js-basics-starter.zip`, `public/labs/lab-8.pdf` | build output |
| `README.md` | add a tree line for `js-basics-starter/` |

## Verification

**Starter:**

- `node --test` fails on every test with "Not implemented".
- Copy the solution over a temporary copy of the starter: every test passes.
- A variant of the solution that mutates its input must fail. That proves the
  freezing works.

**Browser:**

- Through Live Preview, `index.html` shows the report.
- Through `file://`, it shows the module error the handout describes.

**Timing:** do a dry run of the five challenges using only the brief. If it
takes much longer than 45 minutes, cut a challenge.

**Site:**

- `npm run check && npm run build`
- In preview: `/labs/lab-8/` and `/labs/lab-8/task/`
- Build the PDF: `python docs/build-handout.py lab-8`

## Order of work

1. Merge the rename first; it frees `lab-8`.
2. Write the starter, tests and solution. This can start before the rename,
   because new folders don't collide.
3. Write the handout and brief with `draft: true`.
4. Build the PDF and zip, then set `draft: false`.

**Branch:** `feat/lab-8-js-basics`.

**Commits:** the starter; the handout and brief; the generated files.

## Decisions

Made by the instructor on 2026-10-04:

- **Deadline: 09.10.2026.** That's five days from planning, so the rename has
  to land first and the starter is the critical path.
- **Dataset:** TVmaze (see **Dataset**).

Still open:

1. **Should the report require a GitHub Pages URL?** Every lab so far asks for
   a repository link and a published-page link. In ЛР-8 the graded work is the
   functions, which `node --test` checks in the terminal, so a published page
   isn't strictly needed. Recommended: require it anyway. It keeps the report
   the same as in other labs, takes students a minute, and shows that
   `index.html` loads the modules over HTTP. It also lets the instructor open
   the result without cloning anything. **Built as recommended:** the report
   asks for the Pages URL.
2. **Лекція 5:** its content isn't in this repo. Confirm it covers the §4
   topics (types, coercion, scope, closures, references, modules) before
   writing §4.

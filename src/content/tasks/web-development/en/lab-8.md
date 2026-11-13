---
title: "JS Basics — function specification"
summary: "Five pure functions processing TVmaze data — normalization, filtering, sorting, genre statistics, and closures — with provided node --test tests. The practical part of Lab 8."
goal: "Implement the functions in src/ of the JS Basics starter project so that all provided tests pass, without changing the tests or input data. The sections below describe what each function must do: each test verifies one of these rules. The practical part corresponds to section 5 of the lab."
label: "Assignment"
highlights:
  - "Provided starter project"
  - "node --test, zero dependencies"
  - "Pure functions, no DOM"
  - "Bonus until October 9, 2026"
acceptance:
  - "First commit — starter project unchanged"
  - "node --test: all tests pass"
  - "test/, data/, main.js, and index.html unchanged in every commit"
  - "No function mutates its arguments or holds module-level state"
  - "No DOM, timers, Promises, libraries, or console.log in src/"
  - "Each challenge is a separate commit"
  - "Live Preview report ends with 'Completed sections: 5 of 5'"
  - "Page published on GitHub Pages or Vercel"
  - "Able to identify the trap and test that catches it for each challenge"
  - "Function code written by you: AI explained, but did not write code"
updated: 2026-10-18
---

## 1. Overview

**JS Basics** consists of five modules with function stubs that process data
about TV shows from [TVmaze](https://www.tvmaze.com): normalizing raw records,
filtering, sorting, and computing genre statistics. Three additional compact
functions store state in closures.

The functions are **pure**: they receive data exclusively through parameters,
return a result, and mutate nothing — neither their arguments nor variables
outside themselves.

> The tests represent this specification in code form: each test name is the
> exact rule it checks. If a test and the text below appear to conflict, the test
> is authoritative; please notify the instructor of any discrepancy.

## 2. Project structure

**Download:** [js-basics-starter.zip](/en/web/starters/js-basics-starter.zip)
(≈ 14 KB). Extract the archive into a separate repository or into a `lab-8/`
folder in your shared coursework repository.

```text
js-basics-starter/
├── package.json        "type": "module", test script; no dependencies
├── src/
│   ├── normalize.js    C1 · normalizeShow
│   ├── filter.js       C2 · filterShows
│   ├── sort.js         C3 · sortShows
│   ├── stats.js        C4 · genreStats
│   └── closures.js     C5 · createCounter, once, memoize
├── test/               tests for each challenge
├── data/shows.json     30 shows from TVmaze — for the report
├── index.html          report page
├── main.js             applies functions from src/ to data/shows.json
└── README.md           testing, report, deployment, data license
```

```bash
node --test                      # all tests
node --test test/sort.test.js    # tests for a single challenge
```

Open the `index.html` report using Live Preview or `npx serve .`: loading over
`file://` prevents the browser from loading ES modules.

## 3. Data

### 3.1. TVmaze record — input for C1

Records in `data/shows.json` look like this:

```json
{
  "id": 175,
  "url": "https://www.tvmaze.com/shows/175/house-of-cards",
  "name": "House of Cards",
  "language": "English",
  "genres": ["Drama", "Thriller"],
  "status": "Ended",
  "runtime": null,
  "premiered": "2013-02-01",
  "rating": { "average": 8.2 },
  "network": null
}
```

The fields `genres`, `runtime`, `premiered`, `rating`, and `network` may be
`null` or missing entirely; `rating.average` may also be `null`.

### 3.2. Show — output of C1, input for C2–C4

```js
{
  id: 175,
  name: 'House of Cards',
  year: 2013,
  rating: 8.2,
  runtime: null,
  network: null,
  genres: ['Drama', 'Thriller'],
}
```

`year`, `rating`, and `runtime` are numbers or `null`; `network` is a string or
`null`; `genres` is an array of strings, which may be empty.

## 4. Functions

### C1. `normalizeShow(raw)`

Transforms a TVmaze record (§3.1) into a Show object (§3.2).

1. The result has **exactly** seven properties: `id`, `name`, `year`, `rating`,
   `runtime`, `network`, and `genres`. Other record properties (`url`,
   `language`, etc.) must not be present.
2. `year` — premiere year as a **number**: `"2013-02-01"` → `2013`. If
   `premiered` is `null` or missing — `null`.
3. `rating` — value of `rating.average`. A rating of `0` is a valid score, not
   an absence of score. If `rating.average` is `null`, or if `rating` is `null`
   or missing — `null`.
4. `runtime` — as in the record; if `null` or missing — `null`.
5. `network` — value of `network.name`; if `network` is `null` or missing —
   `null`.
6. `genres` — a **new** array containing the same genres; if the property is
   missing — `[]`.
7. The input `raw` object is not mutated.

### C2. `filterShows(shows, options)`

`options` — an object `{ query, genre, minRating }`. Any property, as well as
`options` itself, may be omitted.

1. `query` — keeps shows whose names contain this string. Case-insensitive;
   leading and trailing whitespace in `query` is ignored.
2. `genre` — keeps shows that have this genre among their genres (exact match).
3. `minRating` — keeps shows with a rating **≥** `minRating`. Shows without a
   rating (`rating: null`) are excluded.
4. A filter option is considered **unset** if the property is missing or `null`;
   for `query` and `genre` — also if it is an empty string (for `query` — also a
   string consisting only of whitespace); for `minRating` — also `0`. An unset
   filter option discards nothing: with `minRating: 0`, shows without a rating
   remain included.
5. Specified filter options are combined with a logical AND.
6. Returns a **new** array in the original order — even if no filter options
   were specified. The input array and its objects are not mutated.

### C3. `sortShows(shows, key, direction = 'asc')`

1. `key` — `'name'`, `'year'`, or `'rating'`; `direction` — `'asc'` (default) or
   `'desc'`.
2. `year` and `rating` are compared as **numbers**.
3. `name` is compared using `localeCompare`: the casing of the first letter does
   not dictate ordering (`black-ish` comes before `Lost`).
4. Records where the `key` value is `null` always sort **at the end** — in both
   `'asc'` and `'desc'` directions.
5. Records with identical `key` values preserve their original relative order —
   in both directions.
6. Returns a **new** array; the input array is not mutated.

### C4. `genreStats(shows)`

1. Returns a plain object: keys are genre names, values are
   `{ count, averageRating }`. An entry exists for every genre that appears in at
   least one show.
2. `count` — how many shows have this genre, with or without a rating.
3. `averageRating` — average rating of shows in this genre **that have a rating**:
   `null` is not included in the average, `0` is included. Rounded to one
   decimal place and represented as a **number**: `8.2`, not `'8.2'`.
4. If no show in a genre has a rating — `averageRating: null` (neither `NaN` nor
   `0`).
5. Shows without genres are ignored; an empty array → `{}`.
6. Input data is not mutated.

```js
genreStats([
  { name: 'A', rating: 8, genres: ['Drama', 'Crime'] },
  { name: 'B', rating: null, genres: ['Drama'] },
  { name: 'C', rating: 7, genres: ['Drama'] },
]);
// { Drama: { count: 3, averageRating: 7.5 }, Crime: { count: 1, averageRating: 8 } }
```

### C5. Closures: `createCounter`, `once`, `memoize`

**`createCounter(start = 0)`** returns an object with exactly three methods:

- `increment()` — increases the value by 1 and returns the new value;
- `reset()` — resets the value back to `start` and returns it;
- `value()` — returns the current value.

Each invocation of `createCounter` creates an independent counter. The value is
not stored on an object property, and the methods work even when called
detached: `const { increment } = createCounter();`.

**`once(fn)`** returns a function that invokes `fn` with the same arguments on
its first call and returns its result, while on subsequent calls does not invoke
`fn` and returns the cached first result — even if that result is `undefined`.
Each wrapper instance is independent of others.

**`memoize(fn)`**, where `fn` accepts a single primitive argument, returns a
function that calls `fn` and caches the result for any new argument value,
returning the cached result without calling `fn` for previously seen values.
Arguments `1` and `'1'` are distinct. Any result is cached, including `0`,
`false`, and `undefined`. Each memoized function maintains its own independent
cache.

## 5. Constraints

- Modify only files in `src/`. Tests, data, `main.js`, and `index.html` must
  remain exactly as provided in the starter project.
- No DOM, timers, Promises, third-party libraries, or `console.log` in final
  code.
- No module-level state: anything a function remembers between calls lives in a
  closure (C5).
- Input data is not mutated. Tests freeze inputs, so any mutation attempt throws
  a `TypeError`.
- Function code must be written by you. An AI agent may explain concepts or
  test failure messages, but must not write the functions (§5.2 of the lab).

## 6. Deployment

Publish the project to GitHub Pages or Vercel — either in a separate repository
or in a `lab-8/` folder in your shared repository. The published page must display
the complete report: all five sections passing without `✗`.

- **GitHub Pages** — instructions are in the starter project's `README.md`.
- **Vercel** — [vercel.com](https://vercel.com) → Add New → Project → import
  the repository. Framework Preset: **Other**, leave Build Command and Output
  Directory blank — there is nothing to build. If the project is in a `lab-8/`
  folder — **Root Directory → `lab-8`**.

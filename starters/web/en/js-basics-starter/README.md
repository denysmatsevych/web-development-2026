# JS Basics — starter project for Lab 8

Five pure functions processing TV show data — no DOM, no dependencies, with
provided tests. The functions initially throw `Error('Not implemented')`:
implementing them so that all tests pass is the practical part of the lab.

Task description and function specifications:
<https://denysmatsevych.github.io/web-development-2026/en/web-development/labs/lab-8/> and
<https://denysmatsevych.github.io/web-development-2026/en/web-development/labs/lab-8/task/>.

## Contents

```text
package.json        "type": "module" and test script; no dependencies
src/normalize.js    C1 · normalizeShow
src/filter.js       C2 · filterShows
src/sort.js         C3 · sortShows
src/stats.js        C4 · genreStats
src/closures.js     C5 · createCounter, once, memoize
test/*.test.js      tests for each challenge (node:test, node:assert/strict)
data/shows.json     30 shows from TVmaze — for the report in index.html
index.html          report page
main.js             applies functions from src/ to data/shows.json and prints report
```

Modify only files in `src/`. The tests represent the brief's specification in
code: files in `test/` must not be changed in any commit.

## Tests

Requires Node.js 22 or newer (installed in Lab 1). `npm install` is not
needed.

```bash
node --test                          # all tests (or npm test)
node --test test/normalize.test.js   # tests for a single challenge
```

Initially, all tests fail with `Error: Not implemented`. The name of each test
is the rule from the specification that it verifies.

The tests do not read `data/shows.json`: each test file uses a small dataset
constructed around potential traps. Input data is **frozen** (`deepFreeze` at
the top of each test file). A message `TypeError: Cannot assign to read only property …`
or `Cannot add property …, object is not extensible` means your function is
mutating its arguments.

## In-browser report

`index.html` imports functions from `src/` and displays what they do with the
TVmaze data. A section whose function is not yet implemented shows its error.

Open the page via **Live Preview** in VS Code (or `npx serve .`). Opening via
`file://` will not display the report: explaining why is one of the questions in
the lab.

## Deployment

You can place the contents of this folder either in a **separate repository** or
in the `lab-8/` folder of your shared coursework repository. All paths in the
project are relative.

1. Push the files to your repository.
2. Settings → Pages → Source: _Deploy from a branch_, `main` branch, `/` folder.
3. The page will be available at `https://<username>.github.io/<repository>/`
   (or `…/<repository>/lab-8/` if the project is in a nested folder).

## Data

`data/shows.json` is an adaptation of data from [TVmaze](https://www.tvmaze.com)
([TVmaze API](https://www.tvmaze.com/api)), retrieved on October 4, 2026: 30 of
the 240 shows from page 0 (`https://api.tvmaze.com/shows?page=0`), with a subset
of fields. TVmaze data is licensed under
[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/); this adaptation
is distributed under the same license. If using this data elsewhere, attribute
TVmaze as the source and preserve the license.

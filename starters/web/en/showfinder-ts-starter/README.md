# ShowFinder: from JavaScript to TypeScript — starter project for Lab 12-13

TV series search in [TVmaze](https://www.tvmaze.com) via its public
[API](https://www.tvmaze.com/api): a user enters a title, sees a list of matching
series, and opens a show's details page. The application is written in
JavaScript and is being migrated to TypeScript: you write the types, requests,
and states by hand, while an AI agent migrates the remaining modules, and you
verify and fix its work. Type checks and automated tests are already included.

Task description and specification:
<https://denysmatsevych.github.io/web-development-2026/en/web-development/labs/lab-12/> and
<https://denysmatsevych.github.io/web-development-2026/en/web-development/labs/lab-12/task/>.

## Contents

```text
package.json         scripts; single dependency — typescript
tsconfig.json        compiler configuration (strict)
index.html           page; loads compiled dist/main.js
styles.css           styles
src/types.ts         T1 · API response types — yours
src/api.ts           T2 · requests — yours
src/state.ts         T3 · states and messages — yours
src/app.js           T4 · behavior: search, show page ┐
src/view.js          T4 · rendering data               │ JavaScript: migrated to TypeScript
src/dom.js           T4 · page elements                │ by an AI agent
src/main.js          T4 · entry point                  ┘
check/               self-check: type checks, tests, and recorded TVmaze fixtures
```

Do not modify `.js` files prior to T4. `check/`, `index.html`, `styles.css`, and
`tsconfig.json` should not be modified at all: `check/` is the assignment
specification in code form.

## Running

Requires Node.js **22.18** or newer (`node -v`): the tests execute `.ts` files
without compilation, and Node can only strip types natively starting from this
version. Older Node versions report `Unknown file extension ".ts"`.

```bash
npm install          # one-time: installs TypeScript in node_modules/
npm run watch        # compiles src/ into dist/ and watches for changes
```

While `npm run watch` is running, open `index.html` via **Live Preview** in VS
Code (or `npx serve .`) in Chrome or Edge. The browser executes JavaScript from
`dist/`, not files from `src/`. The compiler outputs code into `dist/` even when
type errors are present, so the page works mid-migration. Modules will not load
over `file://`.

While `.js` files remain in `src/`, `tsc` also compiles them into `dist/` but
does not typecheck them (`allowJs` in `tsconfig.json`). This allows the project
to function mid-migration, with `.ts` and `.js` modules importing each other.

## Self-check

```bash
npm run check        # typecheck and tests, ending with a one-line summary
npm run typecheck    # types only: tsc -p check
npm test             # tests only: node --test
node --test check/2-api.test.js   # tests for a single task
```

Initially, almost everything fails: this is normal. The name of each test and the
comment next to each type check in `check/types.check.ts` begin with the
assignment rule number (T2.4 is the fourth rule of task T2). The assignment is
complete when `npm run check` finishes with the line "Types: no errors" and all
tests pass.

While the T4 modules remain in JavaScript, the tests execute them directly.
Consequently, several T4 tests fail even before migration: the legacy JavaScript
code contains defects that the migration is designed to uncover.

The tests do not make network calls: `fetch` is mocked during tests, and TVmaze
responses are recorded in `check/fixtures/`.

## Editor setup

VS Code and WebStorm highlight type errors using their own TypeScript version,
whereas `npm run typecheck` uses TypeScript from `node_modules/`. For this
project, they report the same errors. If any discrepancy arises, `npm run check`
is the source of truth.

## Submission

You do not need to publish the application: the instructor runs `npm run check`
in your repository. The `node_modules/` and `dist/` directories are not committed
(`.gitignore`).

## Data

Show data courtesy of [TVmaze](https://www.tvmaze.com), licensed under
[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Recorded
responses in `check/fixtures/` are trimmed to the fields used by the
application; each file documents its source, license, date, and modifications.

# Lab 10 — Folder structure and Feature-Sliced Design

| Route                               | Source                                | What it is                                                                                                                                                                                                                                                                                                                                                                                      |
| ----------------------------------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/react/labs/lab-10/`               | `src/content/labs/react/uk/lab-10.md` | the handout: useful links instead of theory, one app moved through five folder structures (§4.3 by file type, §4.4 by route, §4.5 feature folders after bulletproof-react, §4.6 Feature-Sliced Design, §4.7 the cart as a local package after Nadia Makarevich), the same two measurements in each, §4.8 a structure chosen for seven projects, the AI rule, checks and Vercel; report, defence |
| `/uk/react/starters/lab-10.zip`     | `starters/react/lab-10/`              | the starter, unpacked by students into `react-labs/lab-10/`                                                                                                                                                                                                                                                                                                                                     |
| `/uk/react/labs/lab-10/result.webp` | the reference solution                | the catalogue with «Кошик (3)» in the header, in the handout's §1; it shows no folder tree, since the tree is the answer                                                                                                                                                                                                                                                                        |

No PDF yet: it is built after the instructor's review, and the handout's
`handout:` field is added with it.

`solution/` holds the instructor's material (gitignored): `stages/`, one
folder per structure step, each a full copy of `src/`, `package.json` and
`index.html` (and `packages/` for §4.7) as the reference left them;
`shots.mjs`, which checks the starter and the last stage in headless Edge
and takes the screenshot; and a `README.md` with the seeded coupling, the
reference's measurements, the FSD/Makarevich comparison, the notes on
§4.8's projects and the defence answers. The repository is public and the
defence asks for those, so they stay in `solution/`, not in this README or
the plan. The plan the lab was built from is
[folder-structure-and-fsd-plan.md](folder-structure-and-fsd-plan.md).

## The starter publishes ЛР-8's answers

`starters/react/lab-10/` contains ЛР-8's reference solution (`Tabs` with the
APG keyboard, `withAnalytics`, the fixed `TimerView`), so `feat/react-lab-10`
stays local until the last group's ЛР-8 class, as `feat/react-lab-8` did for
ЛР-7.

## Why it looks like this

- **Five structures, one commit each, same app** (the instructor's
  decisions 1–4, 2026-11-17).
- **The tests import only `#app`** (`imports` in `package.json`), and
  `tests/setup.js` imports nothing from `src/`: it clears `localStorage`
  (the cart store re-reads it on every `getSnapshot`) and resets
  `location.hash`. So no move breaks a test, and moving `App.jsx` means
  changing one line.
- **One rule file for every structure.** A rule in `.dependency-cruiser.cjs`
  matches nothing until its folders exist.
- **The plan's proposed decisions 5–15 were built as proposed,** apart from
  the differences below.

## Where the build differs from the plan

- **`check:deps` uses `--output-type err-long`,** so each violation prints
  its rule's Ukrainian comment under it, not only the rule's name.
- **No `graph` script** (the plan's optional Mermaid graph). A collapse
  pattern with `|` breaks in npm scripts on Windows, where `cmd.exe` reads it
  as a pipe; a collapse set in the config would also collapse `check:deps`'s
  own output; and a fixed depth draws the by-type tree file by file.
- **The VS Code setting is `js/ts.updateImportsOnFileMove.enabled`,** as
  VS Code's refactoring page names it today, not the plan's
  `javascript.updateImportsOnFileMove.enabled`.
- **§4.2 holds the measuring procedure and one explicit rule:** code doesn't
  change, only import paths, unless a structure's rule can't be met by any
  move; then the student changes the component, not the rule, and says so in
  the report. The plan implied this; without it students wouldn't know the
  seeded coupling may be fixed in code.
- **«Додати в кошик» keeps ЛР-8's «У кошику: N» status line**, now per bean
  and on every card, so `AddToCartButton` renders the button and the line.
- **The bean card has a `compact` prop** for «Схожі товари», which shows no
  cart button.
- **Reviews are per bean:** Ethiopia keeps ЛР-8's ten, the other seven
  beans have two each, so the tab reads «Відгуки (2)» on most pages.
- **Added for a working shop:** a `NotFound` page for an unknown address or
  bean, «−» disabled at quantity 1, and `Link` scrolling to the top after
  navigation. `tests/setup.js` silences `console.info` (the `[analytics]`
  lines) and `window.scrollTo`, which jsdom doesn't implement.
- **`Tabs` is used on one page,** not two as the plan's list of reused parts
  says. Nothing depends on it: in FSD it sits in `shared/ui`, where
  `insignificant-slice` doesn't apply.
- **Steiger and the header.** A slice that only `app/` references gets no
  `insignificant-slice` error (the rule skips `app`), so a header widget used
  only by `App` passes. `main.jsx`, `App.jsx` and `index.css` directly in
  `src/app/` pass too.
- **Steiger and `shared/`:** the `ui/` and `lib/` segments need no
  `index.js`, and importing their files by path isn't a sidestep; any other
  `shared/` segment (`routes/`, `config/`) needs an `index.js`
  (`fsd/public-api`). §4.6 doesn't spell this out: Steiger says it.
- **§4.6 shows one re-export line**, since every slice's `index.js` needs
  the syntax and the components are default exports. Its example names
  (`UserCard`, `entities/user`) aren't from this app, so it doesn't place a
  file for the student.

## Verified on 2026-11-17

On Windows 11 with Node.js 24.20 and npm 11.19, in a scratch `react-labs`
workspace: React 19.3.1, Vite 8.3.8, Vitest 5.1.0, jsdom 31.0.1, ESLint
10.15, Prettier 3.9.10, dependency-cruiser 18.8.0, Steiger 0.10.0,
`@feature-sliced/steiger-plugin` 0.8.2:

- the starter passes 12 of 12 tests (also with `--sequence.shuffle`), lint,
  Prettier, `check:deps` and the build; `check:fsd` fails on it, as
  expected before §4.6;
- each reference stage, built with the moves a student would make, passes
  the tests, lint, Prettier, `check:deps` and the build, and from §4.6
  `check:fsd`; the seeded coupling makes `check:deps` fail in §4.5 until
  fixed, and Steiger reports it in §4.6 if left in;
- each rule fires on a deliberate violation: `routes-are-independent`,
  `shared-stays-shared`, `app-on-top`, `features-are-independent`,
  `packages-are-independent`, `no-deep-imports-into-packages`, and
  `not-reachable-from-main` for a file left behind by «Прибрати відгуки»;
  Steiger's `forbidden-imports`, `insignificant-slice`, `public-api` and
  `no-public-api-sidestep` with the messages §4.6 quotes;
- «Прибрати відгуки» (`git add -A`, deletions, the three readings,
  `git restore src`) in every stage, in Git Bash; afterwards the build
  passes and `git status` shows only the staged moves;
- §4.7: `"file:./packages/cart"` and `npm install` at the root link the
  package with the root `package.json` unchanged; a deep import by name fails
  in `vite build` and Vitest with the message §4.7 quotes; a relative path
  builds and `check:deps` reports it;
- in Edge headless on Vite dev servers (`solution/shots.mjs`): the starter
  and the last stage behave the same: catalogue, ♡, «Додати в кошик» and the
  header's counter, name links, related cards, cart quantities and total,
  «Видалити», the empty state, `NotFound`; no horizontal scroll at 1000 px
  or 390 px; the console shows only `[analytics]` lines;
- the handout's links return 200; bulletproof-react's page still says what
  §4.5 quotes; profy.dev still doesn't resolve, so it stays out.

Not verified:

- a timed dry run (target: §4.3–§4.8 in about 55 minutes plus setup; cuts
  in the plan's **Timing**);
- VS Code's and WebStorm's import updates when `.jsx` files move without a
  `jsconfig.json`, including the CSS import in `main.jsx`;
- the measuring commands in Windows PowerShell;
- `npm install` in a `react-labs` with ЛР-1–8 present, and the zip unpacked
  there;
- Vercel building `lab-10` with the `file:` package;
- §4.10's aliases (the planning prototype showed the `jsconfig.json` trap,
  not a working setup).

## Build

```bash
git add starters/react/lab-10                                # the script packs tracked files only
python docs/web/build-pack.py starters/react/lab-10          # public/uk/react/starters/lab-10.zip
python docs/web/build-handout.py lab-10 react                # after the review: public/uk/react/labs/lab-10.pdf, from PowerShell
```

Rebuild the zip after the starter is committed: each entry is dated by the
file's last commit. In the handout, §5's `GitHub repository:` line is 76
characters, one over what the PDF's code box holds; shorten it or accept the
wrap when the PDF is built.

To check the stages again: copy the starter into a `react-labs` workspace,
replace `src/`, `package.json` and `index.html` with a stage's copies (and
add `packages/` for §4.7, then `npm install` at the root), and run
`npx vitest run`, `npm run lint`, `npm run format:check`,
`npm run check:deps`, `npm run check:fsd` (from 4.6) and `npm run build`.

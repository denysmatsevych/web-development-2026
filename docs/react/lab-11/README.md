# Lab 11 — useReducer and complex state

| Route | Source | What it is |
| --- | --- | --- |
| `/react/labs/lab-11/` | `src/content/labs/react/uk/lab-11.md` | the handout: useful links instead of theory, four code challenges on a barista's order queue (§4.3 the order form moved to the student's own `draftReducer`, §4.4 a colleague's queue reducer made pure, §4.5 the queue's state normalized into `byId` and `ids`, §4.6 undo and redo through `withUndo`), the AI rule, checks and Vercel, +1 point for the form's reducer with Immer (§4.8); report, defence |
| `/uk/react/labs/lab-11.pdf` | built from the handout | the downloadable handout |
| `/uk/react/starters/lab-11.zip` | `starters/react/lab-11/` | the starter with stubs and the given tests, unpacked by students into `react-labs/lab-11/` |
| `/uk/react/labs/lab-11/result.webp` | the reference solution | the page at 1280 px with a draft in the form, orders in all four columns and «Скасувати дію» enabled, in the handout's §1 |

`solution/` holds the instructor's material (gitignored): `stages/`, one
folder per challenge in the handout's order (`4.3-draft-reducer`,
`4.4-pure-queue`, `4.5-normalized`, `4.6-with-undo`, `4.8-immer`), each
holding only the files its challenge changes, copied over the starter's
`src/` in order (`4.8-immer` also has the `package.json` that
`npm install immer -w lab-11` leaves); `wrong-variants/`, plausible mistakes,
built from the stages by `make-wrong-variants.py` (one, `4.5-synced-copy`,
written by hand); `shots.mjs`, which checks the starter in development and in
a production build and the reference solution in headless Edge, and takes the
screenshot; the 2026-11-19 `prototype/`; and a `README.md` with the seeded
defects, the results per stage and per variant, and the defence answers. The
repository is public and the defence asks for those, so they stay in
`solution/`, not in this README or the plan. The plan the lab was built from
is [use-reducer-and-complex-state-plan.md](use-reducer-and-complex-state-plan.md);
the parts it shares with ЛР-7 are in
[../lab-7/custom-hooks-and-render-props-plan.md](../lab-7/custom-hooks-and-render-props-plan.md).

## The starter publishes no earlier answers

`starters/react/lab-11/` is a new app, so `feat/react-lab-11` can be pushed
and reviewed at any time. ЛР-12 reuses this app, and its starter will contain
ЛР-11's reference solution: `feat/react-lab-12` stays local until the last
group's ЛР-11 class.

## Why it looks like this

- **Code challenges with given tests,** as in ЛР-7, all in class, with an
  optional +1 task once the main part is pushed, as in ЛР-10 (the
  instructor's decisions 1–4, 2026-11-19).
- **Two reducers.** Students write the form's; the queue's is a colleague's
  with seeded defects that show only under `<StrictMode>`, so §4.4 is a bug
  hunt that compares `npm run dev` with `npm run preview`.
- **Every page test renders in `<StrictMode>`,** as `src/main.jsx` does
  (`renderStrict` in `tests/page.jsx`), and every reducer test, `withUndo`'s
  included, freezes its input (`tests/deepFreeze.js`). ESLint can't help:
  the `react-hooks` rules don't analyse a reducer, so the starter lints clean
  and §4.4 says so.
- **Selectors are the queue's API,** so §4.5 changes the state's shape while
  the components and the earlier tests stay as they are.
- **ЛР-12 reuses the app.** The queue's state and `dispatch` stay in `App`
  and reach the cards, «Деталі» and the history buttons as props; the form's
  draft stays in `OrderComposer`.
- The plan's decisions 1–22, all settled on 2026-11-19, were built as
  settled; the details below are the build's.

## Where the build differs from the plan

- **40 tests in eight files:** `draftReducer.test.js` (9) and
  `OrderComposer.test.jsx` (3) for §4.3, `queueReducer.test.js` (4) and
  `OrderBoard.test.jsx` (3) for §4.4, `queueState.test.js` (7) and
  `OrderDetails.test.jsx` (3) for §4.5, `withUndo.test.js` (8) and
  `HistoryButtons.test.jsx` (3) for §4.6. Two helpers sit beside them:
  `page.jsx` (`renderStrict` and finders for cards, columns and the form) and
  `deepFreeze.js`. `npm test -- tests/draftReducer tests/OrderComposer` runs
  one challenge's two files.
- **The starter passes 4 of 40,** and §4.1 names them: «Надіслати бариста»
  adds the order to «Нові», `selectColumn` returns a column in order, and the
  two number rules in `queueReducer.test.js`. They guard what already works
  while the code changes.
- **§4.3's component test also spies on `react`** (`vi.mock('react',
  { spy: true })`), so it checks that `useReducer` receives `draftReducer`,
  not only that `draftReducer` runs.
- **`withUndo`'s unit tests call `withUndo` inside each test,** not at
  import, so the stub fails test by test instead of failing the file.
- **§4.3 and §4.5 commit as `fix`, not the plan's `refactor`:** «Разом»
  becomes right in §4.3, and renaming and «Деталі» become right in §4.5.
- **The card's checkboxes are enabled only in «Готуються», and «Готово» only
  once every drink is ticked,** so ticking a drink matters on the page; the
  plan didn't say.
- **Keyboard focus never falls to the top of the page.** `OrderDetails`
  moves focus to its heading when an order opens, so the panel is seen on a
  phone, where it sits above the board. Since 2026-11-22, a control that
  removes or disables itself hands focus on: a card's step button to the same
  card in its new column, «Скасувати замовлення» to the column's heading, a
  history button on its last step to the other one, «Закрити» to the order's
  card, «Зберегти» to the panel's heading with the new name, «Видалити» to
  the next drink, «Надіслати бариста» to the name field. The given
  components do it with `flushSync`, and `OrderComposer` has one line for
  it, which students keep when they rewrite the form in §4.3. No test checks
  focus, so the tests and their counts didn't change.
- **`menu.js` also exports `defaultMilk(drink)` and `describeItem(item)`;**
  the cards and «Деталі» show a drink as «Лате L · вівсяне молоко · ваніль».
- **§4.2 keeps only the rule that AI explains and doesn't write code,** as
  ЛР-8 and ЛР-10 do.
- **No ungraded stop-list design,** though the plan has one as §4.9
  (decision 14): the instructor dropped it on 2026-11-20, so the handout ends
  with §4.8. §6's question about components that only pass `dispatch` on
  moved into «Структура стану».
- **Clarity fixes on 2026-11-22,** the instructor's review after students
  found ЛР-10 unclear. §4.5 has a three-step order: `createInitialState` and
  the selectors first, because while the selectors read the old shape the
  page renders nothing and every page test fails; then the actions; then
  `App` keeps the opened order's id. The decisions in §4.5 and §4.6 are a
  sentence, not a «Рішення» label. §4.4's experiment moved out of
  «Перевірка», which students reach after the fix, to the text before it,
  and its `git restore` path starts at the repository root, where git
  commands run; «Перевірка» checks that `lab-11/tests/` is unchanged. As in
  ЛР-10, unfinished challenges are done at home, and the in-class time
  estimate and the numbered references to §2's links are gone. §4.5's
  DevTools check names `orders` and `customers` instead of «стан нової
  форми», which read as the order form's state.
- **Length:** about 4,950 words by `wc -w` since 2026-11-22 (4,700
  before), between ЛР-7's and ЛР-10's.

## Verified on 2026-11-20

On Windows 11 with Node.js 24.20 and npm 11.19, in a scratch `react-labs`
workspace: React 19.3.1, Vite 8.3.8, `@vitejs/plugin-react` 6.3.0, ESLint
10.15.0, `eslint-plugin-react-hooks` 7.1.1, `eslint-plugin-react-refresh`
0.5.8, Prettier 3.9.10, Vitest 5.1.1, jsdom 31.0.1, `@testing-library/react`
16.3.3, `@testing-library/user-event` 14.6.13, `@testing-library/jest-dom`
7.0.1, Immer 11.2.10:

- `package.json` is ЛР-10's without dependency-cruiser, Steiger and the
  `#app` import; a fresh `npm install` in the workspace root installs the
  tools;
- every stage (the starter, then the four challenges applied in order) passes
  ESLint with no problems, Prettier and the build; the tests pass 4, 15, 20,
  29 and 40 of 40, each failure with a readable message and no React
  warnings in the output; the full run takes about 3 seconds;
- `npm install immer -w lab-11` from the workspace root adds `immer` to
  `lab-11/package.json`, and the Immer stage passes 40 of 40, ESLint,
  Prettier and the build;
- each wrong variant in `solution/wrong-variants/` fails at least one test
  or the lint, as recorded in `solution/README.md`;
- §4.4's experiment: with `renderStrict` rendering without `<StrictMode>`,
  the board's three page tests pass on the starter;
- §4.5's order of steps (2026-11-22, on the stages): with the `4.5` stage's
  `createInitialState` and selectors but the `4.4` stage's actions, the
  page renders all six cards; with the whole `4.5` queue reducer and the
  `4.4` stage's `App`, `queueState` and the §4.3–§4.4 tests pass and the
  three `OrderDetails` tests fail; with the `4.5` `App` they pass too;
- React DevTools 8.0.0 (2026-11-22), through `react-devtools-inline`, the
  same panel code as the extension, on the stages: after §4.3 `OrderComposer`
  shows `Id` and `Reducer` with the draft and no `State`; after §4.5 `App`
  shows `Reducer` with `orders` and `customers` and `State` `null`; after
  §4.6 its `Reducer` holds `future`, `past` and `present`, as «Перевірка»
  says in each;
- after the focus fix (2026-11-22): the stages still pass 4, 15, 20, 29 and
  40 of 40 with no warnings, ESLint, Prettier and the build, and each wrong
  variant fails as recorded; in Edge headless no control drops keyboard focus
  to `<body>`, a mouse click moves focus without a ring, and the starter's
  dev and preview walks show §4.4's and §4.5's problems as before;
- in Edge headless (`solution/shots.mjs`): the starter on a Vite dev server
  and the same starter on `vite preview` differ as §4.4 describes, and the
  rename and «Деталі» problems §4.5 starts from show in both; the reference
  solution passes the same walk, empties «Деталі» when the opened order is
  cancelled and brings it back on undo, and has a visible focus ring on the
  card buttons; no horizontal scroll at 1280, 1000 or 390 px, with the board
  in four, two and one columns; the console stays clean;
- the handout's links return 200; its anchors exist on the pages; the two
  quotes (react.dev's «Avoid duplication in state», Redux's reducer
  enhancer) and react.dev's advice to pass `null` to an initializer that
  needs no argument are in the pages' text; of the linked `uk.react.dev`
  pages only «Оновлення масивів у стані» is translated, as §2 says;
- no code line in the handout is over 75 characters, so the PDF won't wrap
  one;
- `lab-11.zip` (35 files at the root, LF only, a rebuild is byte-identical)
  unpacked into a fresh `react-labs/lab-11/` next to `lab-10/` from
  `lab-10.zip`: one `npm install` in the root adds both workspaces
  (`node_modules` about 175 MB), and the folder passes `format:check`, lint
  and `build` and 4 of 40 tests. Repacked on 2026-11-22 after the focus fix:
  still 35 files and LF only, only the six changed components differ, a
  rebuild is identical, and the unpacked folder passes the same checks;
- the site: `npm run check` and `npm run build` pass; the labs index lists
  ЛР-11, and the page links the zip and the image under the base path;
- the PDF, built on 2026-11-20 after §4.9 was dropped: 16 pages with the
  screenshot, code blocks and tables; all 35 code lines sit whole on one
  line, no text runs past the right margin, and the tables that cross a
  page (§4.1's file list, §7's first table) repeat their header row. Rebuilt
  on 2026-11-22 after the clarity fixes: still 16 pages, with no text past
  the right margin; the new §4.5 steps sit on page 9. Rebuilt again the same
  day with the screenshot retaken at 1280 px (1280 × 906, the board in four
  columns, one drink in the draft and a ticked drink instead of a moved card,
  so the page is wider than tall): it prints 13.6 cm wide instead of 7.8 cm,
  as wide as ЛР-8's and ЛР-10's; still 16 pages.

Not verified:

- a timed dry run (target: the four challenges in about 52 minutes plus
  setup, §4.8 in about 8; cuts in the plan's **Timing**). A proxy from
  2026-11-22, counting code lines added by hand in the stages (no blank or
  comment lines): §4.3–§4.6 take 223 (79, 32, 69, 43), ЛР-7's five
  challenges 212 (planned at 53 minutes) and ЛР-8's four 132 (49). The
  52-minute estimate assumes 4.3 lines a minute, faster than ЛР-7's 4.0 and
  ЛР-8's 2.7, though §4.4 is mostly finding bugs, not typing. At ЛР-7's pace
  the challenges take about 56 minutes and the lab about 67, past the plan's
  65-minute line for cuts; at ЛР-8's, about 83 and 94, past the 80-minute
  slot. How long ЛР-7 and ЛР-8 actually took in class decides which;
- a screen reader on the board and «Деталі»; the focus moves above were
  checked only by where focus lands, not by what is read out;
- Firefox and Safari;
- the Vercel project.

## Build

```bash
git add starters/react/lab-11                                # the script packs tracked files only
python docs/web/build-pack.py starters/react/lab-11          # public/uk/react/starters/lab-11.zip
python docs/web/build-handout.py lab-11 react                # public/uk/react/labs/lab-11.pdf, from PowerShell
```

Rebuild the zip after the starter is committed: each entry is dated by the
file's last commit, and a file with no commit yet keeps its modification
time. Rebuild the PDF after every handout edit; the handout's `handout:`
field points to it. Keep code lines within 75 characters, or they wrap in
the PDF.

To check the stages again: copy the starter into a `react-labs` workspace,
copy each `solution/stages/*/src` over its `src/` in order, and run
`npx vitest run`, `npm run lint`, `npm run format:check` and `npm run build`
after each; for `4.8-immer`, run `npm install immer -w lab-11` first.
`solution/shots.mjs` has the browser checks.

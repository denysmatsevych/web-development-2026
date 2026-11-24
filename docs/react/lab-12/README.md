# Lab 12 — Context API and prop drilling

| Route | Source | What it is |
| --- | --- | --- |
| `/react/labs/lab-12/` | `src/content/labs/react/uk/lab-12.md` | the handout: useful links instead of theory, four code challenges on ЛР-11's order queue (§4.3 a board column that takes its cards as `children`, §4.4 the queue and `dispatch` in two contexts provided from `App`, §4.5 a `QueueProvider` with `useQueue` and `useQueueDispatch`, §4.6 a café stop-list in its own context), two tables of measurements from React DevTools, the AI rule, checks and Vercel, +1 point for the queue in a Zustand store (§4.8); report, defence |
| `/uk/react/starters/lab-12.zip` | `starters/react/lab-12/` | the starter with stubs and the given tests, unpacked by students into `react-labs/lab-12/` |
| `/uk/react/labs/lab-12/result.webp` | the reference solution | the page at 1280 px with «вівсяне» on the stop-list, № 44 and № 46 marked, and a draft in the form, in the handout's §1 |

No PDF yet: the plan builds it after the instructor's review, and the
handout's `handout:` field comes with it.

`solution/` holds the instructor's material (gitignored): `stages/`, one
folder per challenge in the handout's order (`4.3-children`, `4.4-context`,
`4.5-provider`, `4.6-stop-list`, `4.8-zustand`), each holding only the files
its challenge changes, copied over the starter in order (`4.8-zustand` also
has the `package.json` that `npm install zustand -w lab-12` leaves); the
long components in the stages are written by `make-stages.py` from the
starter; `wrong-variants/`, plausible mistakes, built by
`make-wrong-variants.py`; `shots.mjs`, which checks the starter and the
reference solution in headless Edge and takes the screenshot; the
2026-11-24 `prototype/`; and a `README.md` with the measurements per stage,
which test catches each wrong variant, and the defence answers. The
repository is public and the defence asks for those, so they stay in
`solution/`, not in this README or the plan. The plan the lab was built from
is [context-and-prop-drilling-plan.md](context-and-prop-drilling-plan.md);
the parts it shares with ЛР-7 and ЛР-11 are in their plans and in
[../lab-11/README.md](../lab-11/README.md).

## The starter publishes ЛР-11's answers

`starters/react/lab-12/` is ЛР-11's reference solution: the form's
`draftReducer`, the pure and normalized `queueReducer` and `withUndo` are
the answers to ЛР-11's four challenges. So `feat/react-lab-12` stays local
until the last group's ЛР-11 class, as `feat/react-lab-8` did for ЛР-7.

## Why it looks like this

- **Code challenges with given tests,** as in ЛР-7 and ЛР-11, all in class,
  with an optional +1 task once the main part is pushed (decision 2).
- **Props, then `children`, then context,** in react.dev's order, each in
  its own commit (decision 3); the queue's context in two steps, from `App`
  and then from `QueueProvider` (decision 4).
- **The page doesn't change in §4.3–§4.5,** so ЛР-11's ten page tests pass
  from the start and at every stage, and each challenge's own tests check
  what the move changes: the props a component receives (§4.4), the
  provider and its hooks without `App` (§4.5), and which components render
  (§4.5, §4.6), through a spy on the component's module.
- **Two measurements in `MEASUREMENTS.md`,** filled from React DevTools'
  Components panel and Profiler (decision 13), so fewer props and fewer
  renders are things students see. Their values stay in `solution/`.
- **The stubs come as two files per context** because of
  `react-refresh/only-export-components` (decision 10), and
  `StopListContext` is given so §4.5's tests can give an empty stop-list to
  the components they render without `App` (decision 11).
- **The stop-list panel is given as a presentational component;** students
  write the `StopList` container (decision 19). A drink whose default milk
  is stopped can still be added (decision 18).
- The plan's decisions 2–19, confirmed on 2026-11-24, were built as
  settled; the details below are the build's.

## Where the build differs from the plan

- **29 tests in five files:** `App.test.jsx` (10, ЛР-11's page tests),
  `OrderColumn.test.jsx` (3, §4.3), `queueContext.test.jsx` (3, §4.4),
  `QueueProvider.test.jsx` (6, §4.5) and `StopList.test.jsx` (7, §4.6).
  `tests/page.jsx` has ЛР-11's `renderStrict` and finders, plus
  `renderInQueueProvider` (the components inside `QueueProvider`, with an
  empty stop-list through `StopListContext`), `details()` and `tick()`.
  `npm test -- tests/QueueProvider` runs one challenge's file.
- **The starter passes 10 of 29,** ЛР-11's page tests; §4.1 says why they
  pass from the start.
- **§4.5's three steps keep the page working after each:** first the hooks,
  used where §4.4 used `use(…)` while `App` still provides the contexts;
  then `HistoryButtons`, `OrderComposer` and «Деталі» on the hooks; then the
  reducer and the providers moved into `QueueProvider`. The plan moved the
  reducer first, which leaves `App` with props it can no longer fill until
  the last step.
- **§4.6's tests are stricter than the plan's list in three places:** the
  syrup test also unticks a stopped syrup the drink already has (the plan's
  rule under **The app**), the send-button test also checks the form's
  note, and the card test also checks a card in «Видані» and a card with
  nothing stopped.
- **The model files describe their actions in full.** ЛР-11's reference
  pointed to ЛР-11's stubs for the action lists, and those stubs aren't in
  this starter.
- **`index.css` has the stop-list's styles from the start:** the panel
  (`.stop-list`), the two notes (`.stop-note`) and a grey label for a
  disabled syrup.
- **§2 and the challenges link two more pages than the plan's table:**
  react.dev's «Передача пропсів до компонента» (§4.3's `children`; it is
  translated, so §2 names three translated pages) and React's 2018 post
  introducing the Profiler (§4.4's flame graph). React's v19 post is linked
  only from §4.4.
- **React DevTools 8 shows «What caused this update?»** in the Profiler's
  commit information without any setting, so §4.4 points to it; whether the
  «Record why each component rendered» setting is still there wasn't
  checked, and the handout doesn't mention it. DevTools shows both
  providers as `Context.Provider`, and §4.4 says so.
- **The §1 screenshot's draft has nothing stopped,** so the form shows no
  note; the marked cards show the rule.
- **Length:** about 5,600 words by `wc -w`, against ЛР-11's 5,200.

## Verified on 2026-11-24

On Windows 11 with Node.js 24.20 and npm 11.19, in a scratch `react-labs`
workspace: React 19.3.1, Vite 8.3.8, ESLint 10.15.0,
`eslint-plugin-react-hooks` 7.1.1, `eslint-plugin-react-refresh` 0.5.8,
Prettier 3.9.10, Vitest 5.1.1, jsdom 31.0.1, `@testing-library/react`
16.3.3, `@testing-library/user-event` 14.6.13, Zustand 5.1.0:

- the starter's `App`, components and `orders.js` equal ЛР-11's reference
  solution (ЛР-11's starter with its stages 4.3–4.6 applied); its three
  reducer files differ from it only in comments, `menu.js` only by the two
  added exports, and `index.css` only by the stop-list's styles and two
  comments;
- every stage (the starter, then the four challenges applied in order)
  passes ESLint with no problems, Prettier and the build; the tests pass
  10, 13, 16, 22 and 29 of 29, each failure with a readable message (the
  stubs' `Not implemented`, a props list, a render count or a missing
  element) and no React warnings in the output;
- the Zustand stage (`4.8-zustand` over the four) passes 29 of 29, ESLint,
  Prettier and the build;
- no test imports `QueueContext` or `QueueDispatchContext`, so §4.8's store
  passes §4.4's tests;
- each wrong variant in `solution/wrong-variants/` (one context, hooks
  without the check, a provider that renders the page itself, the
  stop-list in `QueueProvider`, the stop-list in the queue's reducer,
  Zustand without `useShallow`) fails at least one test, as recorded in
  `solution/README.md`; all of them lint clean, so only the tests catch
  them;
- in Edge headless (`solution/shots.mjs`), the starter on a Vite dev server
  shows ЛР-11's page with no stop-list and a clean console; the reference
  solution follows every stop-list rule in §4.6 on the seed orders,
  including «+ Лате» with «звичайне» stopped, and «Скасувати дію» leaves the
  stop-list as it is; Tab reaches the stop-list's checkboxes with a visible
  focus ring, Space toggles one and focus stays on it; ЛР-11's focus
  hand-offs still work, and no control drops focus to `<body>`; no
  horizontal scroll at 1280, 1000 or 390 px, with the stop-list's three
  groups in one, two and three rows and the board in four, two and one
  columns; the console stays clean;
- React DevTools 8.0.0, through `react-devtools-inline` (the same panel code
  as the extension; the recipe is ЛР-11's), on the §4.4 and §4.5 stages: a
  Profiler recording of a tick draws the components that rendered as
  coloured bars with times and the others as grey bars without times, as
  React's 2018 post describes; «What caused this update?» names the
  component whose state changed; the two providers appear as
  `Context.Provider`;
- the handout's links return 200; its anchors exist on the pages; the
  quotes (react.dev's «Extract components…» advice and `Children` pitfall,
  the Profiler post's grey bars) are in the pages' text; of the linked
  `uk.react.dev` pages, «Масштабування з використанням контексту та
  редюсера», «Передача пропсів до компонента» and `useContext` are
  translated, as §2 says; the headings the challenges' Ukrainian link texts
  name are the pages' own;
- no code line in the handout is over 75 characters, so the PDF won't wrap
  one.

Not verified:

- a timed dry run (target: the four challenges in about 53 minutes plus
  setup, §4.8 in about 12; cuts in the plan's **Timing**). The build's
  proxy, counting code lines added by hand in the stages (no blank,
  comment or re-indented lines): §4.3–§4.6 take 175 (16, 27, 74, 58, the
  `StopList` container's 6 included), against the plan's 165, ЛР-11's 223
  and ЛР-8's 132. At the plan's 4.4 lines a minute plus the tables, the
  challenges take about 55 minutes and the lab about 66, at the plan's
  65-minute line for cuts; §4.8 adds 36 lines;
- the Profiler's «Ranked» view and the «Record why each component rendered»
  setting;
- a screen reader on the stop-list panel and the notes;
- Firefox and Safari;
- the Vercel project.

## Build

```bash
git add starters/react/lab-12                                # the script packs tracked files only
python docs/web/build-pack.py starters/react/lab-12          # public/uk/react/starters/lab-12.zip
```

Rebuild the zip after the starter is committed: each entry is dated by the
file's last commit, and a file with no commit yet keeps its modification
time. Keep code lines in the handout within 75 characters, or they wrap in
the PDF.

To check the stages again: copy the starter into a `react-labs` workspace,
copy each `solution/stages/*` over it in order, and run `npx vitest run`,
`npm run lint`, `npm run format:check` and `npm run build` after each; for
`4.8-zustand`, run `npm install zustand -w lab-12` first. After editing the
starter's components, run `solution/make-stages.py` and
`solution/make-wrong-variants.py` again and format their output with the
starter's `.prettierrc.json`. `solution/shots.mjs` has the browser checks.

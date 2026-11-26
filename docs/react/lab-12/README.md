# Lab 12 — Context API and prop drilling

| Route | Source | What it is |
| --- | --- | --- |
| `/react/labs/lab-12/` | `src/content/labs/react/uk/lab-12.md` | the handout: useful links instead of theory, five code challenges on ЛР-11's order queue (§4.3 a board column that takes its cards as `children`, §4.4 the queue and `dispatch` in two contexts provided from `App`, §4.5 a `QueueProvider` with `useQueue` and `useQueueDispatch`, §4.6 the opened order's id moved down into a `QueuePanel`, so `App` holds no state, §4.7 a café stop-list in its own context), two data flow diagrams (the starter and the end state), two tables of renders from React DevTools' Profiler, the AI rule, checks and Vercel (§4.8), +2 points for the queue in a Zustand store, learned from Zustand's docs (§4.9); report, defence |
| `/uk/react/labs/lab-12.pdf` | built from the handout | the downloadable handout |
| `/uk/react/starters/lab-12.zip` | `starters/react/lab-12/` | the starter with stubs and the given tests, unpacked by students into `react-labs/lab-12/` |
| `/uk/react/labs/lab-12/data-flow-start.webp`, `data-flow-end.webp` | `diagrams/*.mmd`, rendered by `diagrams/render.mjs` | the §4 intro's data flow diagrams |
| `/uk/react/labs/lab-12/result.webp` | the reference solution | the page at 1280 px with «вівсяне» on the stop-list, № 44 and № 46 marked, and a draft in the form, in the handout's §1 |

`solution/` holds the instructor's material (gitignored): `stages/`, one
folder per challenge in the handout's order (`4.3-children`, `4.4-context`,
`4.5-provider`, `4.6-queue-panel`, `4.7-stop-list`, `4.9-zustand`), each
holding only the files its challenge changes, copied over the starter in
order (`4.9-zustand` also has the `package.json` that
`npm install zustand -w lab-12` leaves); the
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
the answers to ЛР-11's four challenges. So `feat/react-lab-12` stayed local
until every group had done ЛР-11, as `feat/react-lab-8` did for ЛР-7, and
was pushed on 2026-11-26.

## Why it looks like this

- **Code challenges with given tests,** as in ЛР-7 and ЛР-11, all in class,
  with an optional task once the main part is pushed (decision 2), worth 2
  points since 2026-11-26 (below).
- **Props, then `children`, then context,** in react.dev's order, each in
  its own commit (decision 3); the queue's context in two steps, from `App`
  and then from `QueueProvider` (decision 4).
- **`App` ends with no state.** §4.6 moves the opened order's id from `App`
  into `QueuePanel`, the component that renders the history buttons,
  «Деталі» and the board, so opening «Деталі» no longer renders the whole
  page (the instructor's decision, 2026-11-26, below).
- **The page doesn't change in §4.3–§4.6,** so ЛР-11's ten page tests pass
  from the start and at every stage, and each challenge's own tests check
  what the move changes: the props a component receives (§4.4), the
  provider, its hooks and `QueuePanel` without `App` (§4.5, §4.6), and which
  components render (§4.5, §4.6, §4.7), through a spy on the component's
  module.
- **Data flow diagrams for the props, tables for the renders.** Two
  diagrams in the §4 intro show the props on the starter's tree, with the
  components that only pass a prop on marked, and the end state with the
  providers and the components that read a context; §4.3 has students
  check the first against React DevTools' Components panel. Two tables in
  `MEASUREMENTS.md`, filled from the Profiler (decision 13), record what
  renders on a tick (after §4.4 and §4.5) and on opening «Деталі» (after
  §4.5 and §4.6). Their values stay in `solution/`.
- **The stubs come as two files per context** because of
  `react-refresh/only-export-components` (decision 10). `StopListContext`
  is given so §4.5's and §4.6's tests can give an empty stop-list to the
  components they render without `App` (decision 11), and since 2026-11-26
  `useStopList` is given too.
- **The stop-list panel is given as a presentational component;** students
  write the `StopList` container (decision 19). A drink whose default milk
  is stopped can still be added (decision 18).
- The plan's decisions 2–19, confirmed on 2026-11-24, were built as
  settled; the details below are the build's and the 2026-11-26 changes.

## Changed on 2026-11-26 (the instructor's decisions)

- **§4.6 is new: the opened order's id in `QueuePanel`.** The instructor
  objected to state in `App`: a change there renders every component `App`
  renders. After §4.5 only the opened order's id was left there, and the
  plan had kept it a defence question (decision 6). Now `QueuePanel` keeps
  it in `useState`, takes no props, and `App` calls no hook. Two tests in
  `tests/QueuePanel.test.jsx`: `QueuePanel` opens and closes «Деталі» inside
  `QueueProvider` without `App`, and opening and closing «Деталі» doesn't
  render `App` or `QueueProvider` again (spies on their modules; the
  `QueueProvider` spy since the review below). The starter has a
  `QueuePanel.jsx` stub that throws `Not implemented: QueuePanel`, so the
  test file loads from the start. The challenges after it move up: the
  stop-list is §4.7, the checks §4.8, Zustand §4.9.
- **Three cuts keep the in-class time** (the plan's **Timing** cuts 1 and
  2, and one more): the stop-list lost its milk and syrup rules, so
  `DraftItem` doesn't read it and the «молоко й сироп» test is gone (a
  stopped milk or syrup still shows the form's note and disables «Надіслати
  бариста»); `useStopList` is given in the starter, and its test is gone;
  and the props table is gone (next item). `index.css` lost the grey label
  for a disabled syrup.
- **Two data flow diagrams instead of the props table** (the instructor's
  idea): the §4 intro shows the starter's tree with the props on the arrows
  and the components that only pass a prop on in red, then the end state
  with the state owners in yellow and the context readers in blue. A
  diagram with the props on it is the table's answer, so the table went,
  and §4.3 asks students to check the diagram against DevTools. The arrow
  into `OrderDetails` names both ways «Деталі» can get their order, since
  §4.5 leaves it to the student. The site shows a ```` ```mermaid ```` block
  as code, so the diagrams are webp images rendered from
  `diagrams/data-flow-start.mmd` and `data-flow-end.mmd` by
  `diagrams/render.mjs` (Mermaid 12.3 from a scratch install, headless Edge,
  2× scale; 839 and 879 CSS px wide). Their alt texts list every arrow.
- **A new render table** in `MEASUREMENTS.md`, what renders on opening
  «Деталі», after §4.5 and after §4.6. The §4 intro defines a render in a
  sentence and says why state in `App` renders the whole page.
- **Zustand gives 2 points, not 1,** because students learn it from its
  docs on their own. §4.9 says what to read in which order (Introduction,
  Updating state, `createStore`, `useStore`, then the two guides), may be
  finished at home by the defence, and the defence asks about `create`
  against `createStore`, `set` and the store's subscription.
- **The summary and §2 were rewritten** at the instructor's request: the
  summary in plain sentences, and §2 without its opening paragraph on what
  to read before class and which pages are translated.
- **Still 29 tests:** two added (§4.6), two dropped (§4.7).

## Fixed after the PR #83 review (2026-11-26)

- **§4.6's render test also spies on `QueueProvider`.** §4.6 promised that
  opening «Деталі» renders neither `App` nor `QueueProvider`, but the test
  checked only `App`: the id kept in `QueueProvider` and passed through a
  context to `QueuePanel` passed 29 of 29. The new wrong variant
  `4.6-id-in-provider` now fails that test and only that one. Still 29
  tests.
- **§4.5 says why the provider's `children` don't render again.** The §4
  intro sent students to §4.5 for it, but §4.5 didn't say it; now it does,
  with Dan Abramov's «Solution 2: Lift Content Up».
- **The end diagram no longer says a provider renders the page.** A dotted
  arrow leads to the elements a component gets ready-made through
  `children` (the providers' contents, created by `App`, and the cards in a
  column, created by `OrderBoard`); `App` passes `children` to
  `StopListProvider`. `OrderComposer`, which keeps the draft and reads two
  contexts, is yellow with a blue border, and `OrderDetails` notes that it
  reads `useQueue()` when it gets an id. The §4 legend and the alt text say
  so; the start diagram is unchanged.
- **§4.9 imports `useShallow` from `zustand/react/shallow`,** the path the
  Zustand guide it links uses; `zustand/shallow` works too in 5.1.0. The
  Zustand stage uses the same path.

Verified the same day, in a scratch `react-labs` workspace with the
packages above: the stages pass 10, 13, 16, 22, 24 and 29 of 29 and the
Zustand stage 29 of 29, with ESLint, Prettier and the build passing at each;
every wrong variant fails at least one test of its own challenge
(`solution/README.md`); `render.mjs` drew the end diagram at 879 × 1145 CSS
px and the start diagram byte-identical to the published one; `npm run
check` and `npm run build` pass, and the page loads the new diagram under
the base path. `lab-12.zip` was rebuilt after the test change was
committed: 39 files, unpacked equal to the starter, the test's entry dated
by its commit, a second rebuild byte-identical.

## The PDF (2026-11-26)

`lab-12.pdf`, built after the review fixes, has 23 pages. Under the
3.8-inch height cap that keeps screenshots small, the end diagram printed
7.4 cm wide with labels of about 3.6 pt, too small to read on paper. So
`docs/web/build-handout.py` now prints an image whose alt text starts with
«Діаграма» as wide as the text, up to a page tall; no other handout has such
an image. Both diagrams print 16.6 cm wide with labels of about 8 pt, each
on the page after the paragraph that introduces it, which leaves pages 4
and 6 half empty. The §1 screenshot prints 11.5 cm wide. All 14 code lines
sit whole on one line, no text runs past the right margin, and §7's first
table, which crosses a page, repeats its header row.

## Where the build differs from the plan

- **29 tests in six files:** `App.test.jsx` (10, ЛР-11's page tests),
  `OrderColumn.test.jsx` (3, §4.3), `queueContext.test.jsx` (3, §4.4),
  `QueueProvider.test.jsx` (6, §4.5), `QueuePanel.test.jsx` (2, §4.6) and
  `StopList.test.jsx` (5, §4.7). `tests/page.jsx` has ЛР-11's
  `renderStrict` and finders, plus `renderInQueueProvider` (the components
  inside `QueueProvider`, with an empty stop-list through
  `StopListContext`), `details()` and `tick()`.
  `npm test -- tests/QueueProvider` runs one challenge's file.
- **The starter passes 10 of 29,** ЛР-11's page tests; §4.1 says why they
  pass from the start.
- **§4.5's three steps keep the page working after each:** first the hooks,
  used where §4.4 used `use(…)` while `App` still provides the contexts;
  then `HistoryButtons`, `OrderComposer` and «Деталі» on the hooks; then the
  reducer and the providers moved into `QueueProvider`. The plan moved the
  reducer first, which leaves `App` with props it can no longer fill until
  the last step.
- **§4.7's tests are stricter than the plan's list in two places:** the
  send-button test also checks the form's note, and the card test also
  checks a card in «Видані» and a card with nothing stopped.
- **The model files describe their actions in full.** ЛР-11's reference
  pointed to ЛР-11's stubs for the action lists, and those stubs aren't in
  this starter.
- **`index.css` has the stop-list's styles from the start:** the panel
  (`.stop-list`) and the two notes (`.stop-note`).
- **§2 and the challenges link more pages than the plan's table:**
  react.dev's «Передача пропсів до компонента» (§4.3's `children`) and
  React's 2018 post introducing the Profiler (§4.4's flame graph); since
  2026-11-26 also react.dev's «Поширення стану між компонентами», Kent C.
  Dodds's «State Colocation will make your React app faster» (2019-09-23)
  and Dan Abramov's «Solution 1: Move State Down» (§4.6), and four more
  Zustand pages (§4.9). React's v19 post is linked only from §4.4.
- **React DevTools 8 shows «What caused this update?»** in the Profiler's
  commit information without any setting, so §4.4 points to it; whether the
  «Record why each component rendered» setting is still there wasn't
  checked, and the handout doesn't mention it. DevTools shows both
  providers as `Context.Provider`, and §4.4 says so.
- **The §1 screenshot's draft has nothing stopped,** so the form shows no
  note; the marked cards show the rule.
- **Length:** about 6,400 words by `wc -w` since 2026-11-26 (5,600 before),
  against ЛР-11's 5,200.

## Verified on 2026-11-26, after the changes

In a new scratch `react-labs` workspace with the starter's packages (Vite
8.4.0 this time; the rest as on 2026-11-24):

- every stage (the starter, then `4.3-children`, `4.4-context`,
  `4.5-provider`, `4.6-queue-panel` and `4.7-stop-list` applied in order)
  passes ESLint with no problems, Prettier and the build; the tests pass 10,
  13, 16, 22, 24 and 29 of 29, with no React warnings in the output; before
  §4.6 its two tests fail with `Not implemented: QueuePanel` and a render
  count of `App`;
- the Zustand stage (`4.9-zustand` over the five) passes 29 of 29, ESLint,
  Prettier and the build; without `useShallow`, 24 of 29 fail;
- each wrong variant fails at least one test of its own challenge, as
  recorded in `solution/README.md`, including the new `4.6-panel-takes-props`
  (`QueuePanel` with the id kept in `App` and passed down): both §4.6 tests
  fail; all lint clean;
- in Edge headless (`solution/shots.mjs`): the stop-list rules of §4.7 on
  the seed orders, with a stopped milk and syrup still selectable in the
  form; the keyboard on the stop-list; ЛР-11's focus hand-offs, «Деталі» and
  «Закрити» included, with the id in `QueuePanel`; no horizontal scroll at
  1280, 1000 or 390 px; the console clean. The new 1280 px screenshot is
  byte-identical to the published `result.webp`, so the image is unchanged;
- the new links (react.dev's «Поширення стану між компонентами» and its
  `#lifting-state-up-by-example`, Kent C. Dodds's colocation article, Dan
  Abramov's `#solution-1-move-state-down`, and the Zustand pages
  Introduction, Updating state, `createStore`, `useStore`) return 200 and
  their anchors and headings exist;
- `lab-12.zip`, rebuilt after the starter's commit (39 files at the root,
  LF only, entries dated by that commit, a second rebuild byte-identical),
  unpacked into the workspace's `lab-12/` passes `format:check`, lint and
  `build` and 10 of 29 tests.

Not verified: a timed dry run. The proxy, counting code lines added by hand
in the stages (no blank or comment lines, nor lines the file already had):
§4.3–§4.7 take about 165 (14, 27, 69, 14, 41), about the same as the
2026-11-24 count of 175 for four challenges: §4.6 adds about 14 and the cuts
take about 17 from the stop-list. The props table is gone and a render
table came in, so the measurements take about as long as before.

## Verified on 2026-11-24, before the changes

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
  one;
- `lab-12.zip` (37 files at the root, LF only, a rebuild is byte-identical)
  unpacked into the scratch workspace's `lab-12/` passes `format:check`,
  lint and `build` and 10 of 29 tests; its `package.json` has ЛР-11's
  dependencies, so `npm install` in an existing `react-labs` adds no new
  package; `npm install zustand -w lab-12` from the workspace root adds
  `"zustand": "^5.1.0"` to `lab-12/package.json`, as the Zustand stage
  has;
- the site: `npm run check` and `npm run build` pass; the labs index lists
  ЛР-12, and the page links the zip and the image under the base path.

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
python docs/web/build-handout.py lab-12 react                # public/uk/react/labs/lab-12.pdf, from PowerShell
```

Rebuild the zip after the starter is committed: each entry is dated by the
file's last commit, and a file with no commit yet keeps its modification
time. Rebuild the PDF after every handout edit; the handout's `handout:`
field points to it. Keep code lines in the handout within 75 characters,
or they wrap in the PDF.

To check the stages again: copy the starter into a `react-labs` workspace,
copy each `solution/stages/*` over it in order, and run `npx vitest run`,
`npm run lint`, `npm run format:check` and `npm run build` after each; for
`4.9-zustand`, run `npm install zustand -w lab-12` first. After editing the
starter's components, run `solution/make-stages.py` and
`solution/make-wrong-variants.py` again and format their output with the
starter's `.prettierrc.json`. `solution/shots.mjs` has the browser checks.

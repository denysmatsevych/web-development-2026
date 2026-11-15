# Lab 7 — Custom hooks, Container/Presentational and render props

| Route | Source | What it is |
| --- | --- | --- |
| `/react/labs/lab-7/` | `src/content/labs/react/uk/lab-7.md` | the handout: useful links instead of theory, five code challenges on a coffee-bean product page (§4.3 `useLocalStorage`, §4.4 `TimerView` under a `BrewTimer` container, §4.5 `useCountdown`, §4.6 `ShowMore` with a render prop, §4.7 `useShowMore` for a grid layout), the AI rules, checks and Vercel, an ungraded `useSyncExternalStore` exercise; report, defence |
| `/uk/react/starters/lab-7.zip` | `starters/react/lab-7/` | the starter with stubs and the given tests, unpacked by students into `react-labs/lab-7/` |
| `/uk/react/labs/lab-7/result.webp` | the reference solution | the finished page, in the handout's §1 |
| `/uk/react/labs/lab-7/grid.webp` | the reference solution | «Схожі товари» in the new grid design, in §4.7 |

`solution/` holds the instructor's material (gitignored): `stages/`, one
folder per challenge in the handout's order, each holding only the files its
challenge changes, copied over the starter's `src/` in order (all five give
the reference solution); the 2026-11-14 `prototype/` with the wrong
`TimerView` variants; `shots.mjs`, which checks
the stages in headless Edge and takes both screenshots; and a `README.md`
with the seeded defects in the starter's timer, which test catches which
mistake, the pitfalls, the browser results and the defence answers. The
repository is public and the defence asks for those, so they stay in
`solution/`, not in this README or the plan. The plan the lab was built from
is [custom-hooks-and-render-props-plan.md](custom-hooks-and-render-props-plan.md).

## Why it looks like this

- **Code challenges instead of typed listings** (the instructor's decision,
  2026-11-14). A pattern is a decision about where code goes, and typing a
  listing skips it. The format is the Web course's ЛР-8 (`node --test`) with
  Vitest and React Testing Library instead.
- **Given tests check the pattern's shape, not its implementation.** Behaviour
  is checked through roles and names. That a component uses a hook or renders
  `TimerView` is checked with `vi.mock(path, { spy: true })`, which keeps the
  real module and records its calls. That `TimerView` has no hooks is checked
  by calling it as a plain function. How a hook stores its state is left to
  the student.
- **Every challenge starts from something wrong on the page:** two copies of
  ЛР-4's `localStorage` code, timer buttons that ignore the state, a seeded
  timer, two copies of «Показати ще», a design change. Two `useLocalStorage`
  tests pass in the starter on purpose: they guard the behaviour while the
  code moves into the hook.
- **`TimerView` (§4.4) before `useCountdown` (§4.5),** so the hook visibly
  takes over the container's job, which is how Container/Presentational
  changed after hooks (Dan Abramov's 2019 note). `TimerView.test.jsx`
  doesn't depend on the timer working.
- **One app for ЛР-7 and ЛР-8.** ЛР-8's starter is this lab's reference
  solution, so its source must not reach GitHub before the last ЛР-7 class
  (the repository is public); see the ЛР-8 plan.
- **AI explains, doesn't write;** AI completions are off for the challenge
  files, since a completion writes a 15-line hook from its name.
- **No extra points.** The whole lab is in class and takes about an hour. A
  student who doesn't finish pushes what passes and finishes the rest like a
  missed class (the instructor's decision, 2026-11-15).
- **The test tools are devDependencies;** Vercel runs only `npm run build`.
- The plan's proposed decisions 7–9 and 11–15 were built as proposed.

## Where the build differs from the plan

- **`src/data.js` writes every review and product as a multi-line object.**
  The prototype's one-line objects were over Prettier's width, and Prettier
  alone breaks only some of them.
- **No C1–C5 labels** (the instructor's decision, 2026-11-15, after the
  review). The plan numbers the challenges C1–C5; the handout names each by
  its section (§4.3–§4.7) and what it builds. Test files are named after the
  hook or component they test (`tests/useLocalStorage.test.jsx`),
  `npm test -- tests/useLocalStorage` runs one of them (`tests/ShowMore`
  doesn't match `useShowMore`, in bash and PowerShell), and commits have no
  scope, as in ЛР-2–6.
- **Three tests are stricter than the prototype's;** names and the count are
  unchanged:
  - «після «Старт» передає статус running» first checks that `TimerView`
    was called, so in the starter it fails with the same message as its
    neighbour instead of a `TypeError` on `mock.lastCall`;
  - «два компоненти з одним хуком мають кожен свій стан» gives both hooks
    the same key and checks that the first one changed. With two keys, a hook
    whose state is shared between callers passed it, and §4.9 and §6 lean on
    this test;
  - «область role="status" є від початку…» also rerenders `running` and
    `paused` and checks that the same region stays empty. Before, a
    `TimerView` that showed «Готово!» in those statuses passed every test.
- **§6 has a question about focus after «Скинути»,** added after the browser
  check; the reason is in `solution/README.md`. The status table, which the
  tests encode, is unchanged.
- **§4.5's Довідка links react.dev's `#challenges`** and names «Fix an interval
  that fires twice»: the challenge's own anchor exists only after its tab is
  opened.
- **§4.9 asks for a separate hook (`useSyncedLocalStorage`) on a separate
  branch,** so the `useLocalStorage` tests and the graded history stay as
  they are.
- **§4.3's check names the hook `LocalStorage` in React DevTools:** DevTools
  shows a custom hook's name without `use`. That follows the naming rule in
  React's hook inspection and react.dev's `useDebugValue` page; the panel
  itself wasn't opened.
- **Prettier stays pinned to 3.9.10,** ЛР-6's version, although 3.10.1 is out,
  so every lab in a student's workspace formats alike.
- **Length:** about 4,600 words by `wc -w`, against the plan's 4,000–4,500.

## Verified on 2026-11-15

On Windows 11 with Node.js 24.20 and npm 11.19, in a scratch `react-labs`
workspace that already held `lab-6/`: React 19.3.1, Vite 8.3.8,
`@vitejs/plugin-react` 6.3.0, ESLint 10.15.0, `eslint-plugin-react-hooks`
7.1.1, `eslint-plugin-react-refresh` 0.5.8, Prettier 3.9.10, Vitest 5.1.0,
jsdom 31.0.1, `@testing-library/react` 16.3.3, `@testing-library/user-event`
14.6.10, `@testing-library/jest-dom` 7.0.1:

- the versions on npm match the plan's, apart from patch releases inside the
  starter's ranges and Prettier above;
- adding `lab-7/` to a workspace with `lab-6/` and running `npm install` in
  the root installs the test tools; `node_modules` is about 136 MB;
- `lab-7.zip` (31 files at the root, LF only, a rebuild is byte-identical)
  unpacked into a fresh `react-labs/lab-7/` next to `lab-6/`: one
  `npm install` in the root adds the workspace and the test tools, and the
  folder passes `format:check` and `build`, shows the one lint warning and
  fails 39 of 41 tests;
- every stage (the starter, then the five challenges applied in order)
  passes Prettier and the build; ESLint shows the starter's one warning until
  §4.5 and nothing after; the tests pass 2, 11, 20, 30, 35 and 41 of 41,
  each failure with a readable message; the full run takes about 2 seconds;
- each wrong `TimerView` in `solution/prototype/wrong-variants/`, and one
  with a single `useId()` call, fails exactly one `TimerView.test.jsx` test
  (rechecked after the stricter tests above);
- in Edge headless on Vite dev servers (`solution/shots.mjs`): each stage
  behaves as its «Що має вийти» says, including keyboard focus and the
  `:focus-visible` outline, with nothing in the console; the starter's
  timer symptoms are as `solution/README.md` lists; the grid's button is the
  last cell at 1000 px (5 columns) and 390 px (2 columns), with no horizontal
  scroll;
- the readings and the handout's other links return 200, and the react.dev
  anchors the handout links exist; Medium refuses automated requests (403);
- the site: `npm run check` and `npm run build` pass; the labs index lists
  ЛР-7; the handout has no horizontal scroll at 390 px, and both images
  load.

Not verified:

- a timed dry run (target: the five challenges in about 55 minutes plus
  setup; cuts in the plan's **Timing**);
- the React DevTools 8 panel itself (custom hook names, `TimerView` with no
  hooks section);
- a screen reader (NVDA or Narrator) announcing «Готово! Час пити каву.»;
- Firefox and Safari;
- the seventh Vercel project;
- that Dan Abramov's Medium article opens without an account;
- the PDF, which follows the instructor's review of the handout.

## Build

```bash
git add starters/react/lab-7                                 # the script packs tracked files only
python docs/web/build-pack.py starters/react/lab-7           # public/uk/react/starters/lab-7.zip
python docs/web/build-handout.py lab-7 react                 # public/uk/react/labs/lab-7.pdf, from PowerShell
```

Rebuild the zip after the starter is committed: each entry is dated by the
file's last commit, and a file with no commit yet keeps its modification
time. Rebuild the PDF after every handout edit; the handout's `handout:`
field points to it. Keep code lines within 75 characters, or they wrap in
the PDF.

To check the stages again: copy the starter into a `react-labs` workspace,
copy each `solution/stages/*/src` over its `src/` in order, and run
`npx vitest run`, `npm run lint`, `npm run format:check` and `npm run build`
after each; `solution/shots.mjs` has the browser checks.

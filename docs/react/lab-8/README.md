# Lab 8 — Children as a prop, compound components and HOCs

| Route | Source | What it is |
| --- | --- | --- |
| `/react/labs/lab-8/` | `src/content/labs/react/uk/lab-8.md` | the handout: useful links instead of theory, four code challenges on ЛР-7's coffee-bean page (§4.3 a compound `Tabs` that takes its content as `children` and shares its state through context, §4.4 the ARIA APG Tabs pattern, §4.5 a `withAnalytics` HOC, §4.6 a timer button that the HOC breaks), the AI rules, checks and Vercel, an ungraded accordion; report, defence |
| `/uk/react/starters/lab-8.zip` | `starters/react/lab-8/` | the starter with stubs and the given tests, unpacked by students into `react-labs/lab-8/` |
| `/uk/react/labs/lab-8/result.webp` | the reference solution | the finished page with «Відгуки (10)» selected from the keyboard, in the handout's §1 |

No PDF yet: it is built after the instructor's review, as for ЛР-7.

`solution/` holds the instructor's material (gitignored): `stages/`, one
folder per challenge in the handout's order, each holding only the files its
challenge changes, copied over the starter's `src/` in order (`4.3-tabs` also
deletes `ProductTabs.jsx`; all four give the reference solution);
`wrong-variants/`, plausible mistakes and the tests that catch them;
`shots.mjs`, which checks three stages in headless Edge and takes the
screenshot; the 2026-11-14 `prototype/`; and a `README.md` with the seeded
defect, the results per stage and per variant, and the defence answers. The
repository is public and the defence asks for those, so they stay in
`solution/`, not in this README or the plan. The plan the lab was built from
is [compound-components-and-hoc-plan.md](compound-components-and-hoc-plan.md);
the parts it shares with ЛР-7 are in
[../lab-7/custom-hooks-and-render-props-plan.md](../lab-7/custom-hooks-and-render-props-plan.md).

## The starter publishes ЛР-7's answers

`starters/react/lab-8/` is ЛР-7's reference solution plus ЛР-8's additions,
so the branch that adds it shows ЛР-7's answers file by file as soon as it is
pushed. `feat/react-lab-8` stays local until the last group's ЛР-7 class; the
push, the PR, CI and the merge fit between that class and the first ЛР-8
class. The plan's **ЛР-7's answers in ЛР-8's starter** has the reasoning.

## Why it looks like this

- **Code challenges with given tests,** as in ЛР-7 (the instructor's
  decisions 1–5, 2026-11-14).
- **`children` as a prop is §4.3's theme** (the instructor's decision,
  2026-11-15): a wrapper with its own state whose content comes from the
  parent. The starter's `ProductTabs` and the finished `Tabs` render the same
  page; the running timer, the Profiler and a test show the difference.
- **The APG is the accessibility spec.** §4.4's tests encode its Tabs
  pattern with automatic activation, so "accessible" means something
  checkable.
- **The HOC enhances a callback** (`onClick`), the use Developer Way's article
  still defends. A data-injecting HOC is a defence question.
- **§4.6's bug comes from code a developer would plausibly write** while
  adding analytics, and it shows only once §4.5's HOC works. The starter
  fails lint on purpose (one `react-hooks/static-components` error), and
  §4.1 says so; §7 requires a clean lint.
- **Context is the private channel between `Tabs` and its parts.** Global
  state stays with Lecture 4 and ЛР-12, so there is no `CartProvider`.
- The plan's proposed decisions 7–17 were built as proposed.

## Where the build differs from the plan

- **No C1–C4 labels** (the instructor's rule since ЛР-7's review). The
  handout names each challenge by its section (§4.3–§4.6) and what it builds.
  Test files are named after the unit: `tests/Tabs.children.test.jsx` (§4.3),
  `tests/Tabs.a11y.test.jsx` (§4.4), `tests/withAnalytics.test.jsx` (§4.5),
  `tests/TimerView.test.jsx` (§4.6); `npm test -- tests/Tabs.children` runs
  one of them and `npm test -- tests/Tabs` runs both `Tabs` files. Students'
  commits have no scope, and the stub errors are `Not implemented: Tabs`.
- **Three tests are stricter or more exact than the prototype's;** names and
  the count are unchanged:
  - «клік по Tabs.Tab показує його панель і ховає іншу» and ««Заварювання»,
    «Відгуки (10)» і «Схожі товари» перемикають вміст» count a panel that
    isn't on the page as hidden, so each checks what its name says; that
    hidden panels must stay mounted is left to the tests named after it;
  - the page test now clicks all three tabs, not one;
  - «Home і End обирають першу й останню вкладки» also checks that Home
    selects.
  As a result the starter passes four tests, not three: the page test passes
  with `ProductTabs` and guards the behaviour while the tabs move into
  `Tabs`. §4.1 lists all four and why they pass.
- **§4.3's DevTools check uses the Profiler, not Highlight updates.**
  Highlight updates outlines a component's own DOM nodes, so it can't tell a
  wrapper that rendered from the content inside it; the Profiler lists each
  component per commit. Not checked in the real panel (below).
- **§4.3 hints at the `hidden` attribute.** Vitest doesn't load
  `src/index.css`, so a panel hidden by a CSS class looks hidden in the
  browser but not in the tests.
- **`ProductCard` puts the cart button and «У кошику: N» in a `.cart` row,**
  so the empty status line doesn't add a blank row to the card.
- **The tab list gets smaller padding at 480 px and below,** so the three
  tabs fit in one row at 390 px.
- **§4.8 asks for the accordion on a separate branch** (`lab-8-accordion`),
  as ЛР-7's §4.9 did, so the graded history stays as it is.
- **Length:** about 4,300 words by `wc -w`, a little under ЛР-7's.

## Verified on 2026-11-17

On Windows 11 with Node.js 24.20 and npm 11.19, in a scratch `react-labs`
workspace: React 19.3.1, Vite 8.3.8, `@vitejs/plugin-react` 6.3.0, ESLint
10.15.0, `eslint-plugin-react-hooks` 7.1.1, `eslint-plugin-react-refresh`
0.5.8, Prettier 3.9.10, Vitest 5.1.0, jsdom 31.0.1, `@testing-library/react`
16.3.3, `@testing-library/user-event` 14.6.12, `@testing-library/jest-dom`
7.0.1:

- `package.json` is ЛР-7's apart from the name; a fresh `npm install` in the
  workspace root installs the same tools;
- every stage (the starter, then the four challenges applied in order) passes
  Prettier and the build; ESLint shows the starter's one error until §4.6 and
  nothing after; the tests pass 4, 10, 20, 24 and 27 of 27, each failure with
  a readable message; the full run takes about 2 seconds;
- each wrong variant in `solution/wrong-variants/` fails the tests or the
  lint recorded in `solution/README.md`;
- in Edge headless on Vite dev servers (`solution/shots.mjs`): the starter's
  `ProductTabs` and the stage after §4.5 behave as §4.3 and §4.6 describe;
  the reference solution keeps a running timer across tab switches, has the
  APG roles, `id` links and roving `tabindex`, follows →, ←, Home, End and
  Tab into the panel with a visible focus ring, and writes the
  `[analytics]` lines §4.5 and §4.6 give; no horizontal scroll at 1000 px or
  390 px, and the tabs fit in one row at both;
- the handout's links return 200, and the react.dev anchors it links exist;
  of the linked `uk.react.dev` pages only «Передача пропсів до компонента» is
  translated, so §2 says so; patterns.dev's Compound page has the `div`
  toggle §2 warns about;
- no code line in the handout is over 75 characters, so the PDF won't wrap
  one;
- `lab-8.zip` (35 files at the root, LF only, a rebuild is byte-identical)
  unpacked into a fresh `react-labs/lab-8/` next to `lab-7/` from
  `lab-7.zip`: one `npm install` in the root adds both workspaces
  (`node_modules` about 132 MB), and the folder passes `format:check` and
  `build`, shows the one lint error and passes 4 of 27 tests;
- the site: `npm run check` and `npm run build` pass; the labs index lists
  ЛР-8; the handout has no horizontal scroll at 390 px, and the image loads.

Not verified:

- a timed dry run (target: the four challenges in about 50 minutes plus
  setup; cuts in the plan's **Timing**);
- the React DevTools 8 panels: the Profiler on a tab switch (§4.3), and
  `withAnalytics(Button)` in **Components** (§4.5);
- a screen reader (Narrator, NVDA or VoiceOver) on the tabs (§4.4);
- Firefox and Safari;
- the eighth Vercel project.

## Build

```bash
git add starters/react/lab-8                                 # the script packs tracked files only
python docs/web/build-pack.py starters/react/lab-8           # public/uk/react/starters/lab-8.zip
python docs/web/build-handout.py lab-8 react                 # public/uk/react/labs/lab-8.pdf, from PowerShell, after review
```

Rebuild the zip after the starter is committed: each entry is dated by the
file's last commit, and a file with no commit yet keeps its modification
time. Once the PDF exists, add `handout: /uk/react/labs/lab-8.pdf` to the
handout's frontmatter and rebuild the PDF after every handout edit. Keep
code lines within 75 characters, or they wrap in the PDF.

To check the stages again: copy the starter into a `react-labs` workspace,
copy each `solution/stages/*/src` over its `src/` in order (deleting
`src/components/ProductTabs.jsx` with `4.3-tabs`), and run `npx vitest run`,
`npm run lint`, `npm run format:check` and `npm run build` after each;
`solution/shots.mjs` has the browser checks.

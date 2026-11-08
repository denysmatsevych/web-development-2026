# Lab 4 — State and effects (useState, useEffect)

| Route | Source | What it is |
| --- | --- | --- |
| `/react/labs/lab-4/` | `src/content/labs/react/uk/lab-4.md` | the handout: useful links instead of theory, Thinking in React steps 4–5 in code, `useEffect` with `localStorage`, the data flow diagram, checks and Vercel, the +1 task on state colocation, report, defence |
| `/uk/react/starters/lab-4.zip` | `starters/react/lab-4/` | the starter, unpacked by students into `react-labs/lab-4/` |
| `/uk/react/labs/lab-4/result.webp` | the reference solution | the page with a search and the checkbox, in the handout's §1 |
| `/uk/react/labs/lab-4.pdf` | built from the handout | the downloadable handout |

`solution/` holds the reference solution (gitignored): `app-state/`,
`src/` and `extra/` overlay the starter's `src/` for the 1-point lab, the
+1 task and the ungraded extra; its `README.md` has both diagram answers and
defence notes; `shots.mjs` checks every stage in headless Edge and takes the
screenshot. The plan the lab was built from is
[state-and-effects-plan.md](state-and-effects-plan.md).

## Why it looks like this

- **It continues ЛР-3's app.** ЛР-3 ends with state on paper; this lab puts
  it in code by Thinking in React steps 4 and 5. The starter is ЛР-3's
  reference solution, so a student who missed part of ЛР-3 starts from the
  same code.
- **Two new files in the starter.** `filterMenu.js` holds the filter, a pure
  function, so class time goes to state and effects rather than array
  methods. `CafeInfo` (opening hours, no props) is the one part of the page
  that doesn't use the filters, which §4.7 needs.
- **State in `App` first, then moved down for +1.** §4.2–4.4 follow ЛР-3's
  answer (the closest common parent of `SearchBar` and `MenuTable` is
  `App`). §4.7 moves the state and the effect into `FilterableMenuTable`,
  react.dev's `FilterableProductTable`, by the state colocation principle.
  §4.7 comes after the checks and Vercel, so the 1-point lab is deployed
  first.
- **§4.7 is tasks only** (the instructor's request). Students note which
  components DevTools' render highlighting outlines while they type, move
  the state, note them again, and write both lists in the README. The
  handout doesn't explain the principle or predict the result, and §4.7 has
  no «Що має вийти»: §7's +1 table is the check. The defence asks for the
  reasons.
- **`localStorage` is the effect's external system.** Fetching is ЛР-14's
  topic, `document.title` is outdated by React 19's `<title>`, and a
  keyboard shortcut would take ЛР-5's topic. The values are read back in
  `useState` initializers, not in an effect, which ESLint enforces.
- **ESLint is the check.** `eslint-plugin-react-hooks` 7 reports restoring
  state in an effect and keeping the filtered menu in state as
  `react-hooks/set-state-in-effect` errors, and a missing dependency as an
  `exhaustive-deps` warning, so §7 asks for no warnings either.
- **A fragment in `FilterableMenuTable`.** `.app` is a grid with a gap; a
  `<div>` wrapper would remove the gap between the search bar and the table,
  and the page would change. The handout requires the fragment without the
  reason, which is a defence question.
- **The reset button in §4.8 is always shown.** Hiding it while no filter is
  active would drop keyboard focus to `<body>` the moment it's pressed.
- **The `{' '}` after the checkbox** is how Prettier writes the space once
  the `<input>` spans several lines; the handout gives `SearchBar` in that
  form so saving doesn't change it.
- **The PDF waited for the handout's review,** so it was built last. It
  has 15 pages and embeds the screenshot from the local `public/` folder.
  §7's 1-point table starts low on page 14 and continues on page 15 under a
  repeated header.

## Verified on 2026-11-08

On Windows 11 with Node.js 24.20 and npm 11.19, in a `react-labs` workspace with
ЛР-1's tooling (React 19.3.1, Vite 8.3.5, ESLint 10, `eslint-plugin-react-hooks`
7.1.1, Prettier 3.9.10):

- `lab-4.zip` unpacked into `lab-4/`: `npm install --offline` in the root
  adds the `lab-4` workspace and no packages; `format:check`, `lint` and
  `build` pass;
- every stage passes Prettier, ESLint and the build: §4.2 (with exactly
  the two `no-unused-vars` errors for the setters), §4.3, §4.4, §4.7 and
  §4.8. ESLint reports restoring in an effect and the filtered menu in
  state as `set-state-in-effect` errors and a missing dependency as an
  `exhaustive-deps` warning;
- in Edge headless, on Vite dev servers (`solution/shots.mjs`):
  - §4.2 logs «You provided a `value` prop to a form field without an
    `onChange` handler…» and the same for `checked` (with `defaultChecked`
    in the advice); typing and clicking change nothing;
  - §4.3: «чай» and «ЧАЙ» leave «Чай (3)»; the checkbox makes it «Чай (2)»;
    the checkbox alone leaves 7 rows under «Кава (3)», «Чай (2)»,
    «Десерти (2)»; «піца» leaves no category; no React warnings;
  - §4.4 and §4.7: both keys are written, and a reload restores the field,
    the checkbox and the table; the `#root` HTML is identical in the two
    stages; the fragment keeps a 20 px gap, a `<div>` makes it 0;
  - a render counter in `CafeInfo`: typing three letters renders it 6 times
    with the state in `App` (StrictMode renders twice) and 0 times after
    §4.7;
  - §4.8: «піца» shows «Нічого не знайдено»; the reset clears both filters
    and `localStorage` follows;
- in Chrome headless with React DevTools 8.0.0 (ЛР-2's recipe):
  - `App`'s **hooks** read `State: ""`, `State: false`, and after §4.4
    `Effect`; after §4.7 they belong to `FilterableMenuTable`;
  - a string state accepts only JSON: double-clicking `""` selects one
    quote, and typing `чай` is rejected; `Ctrl+A` and `"чай"` + `Enter`
    filter the table and put «чай» in the page's field. The boolean has a
    checkbox at the right edge of the panel, and ticking it filters too;
  - **Highlight updates when components render** is under the
    **Components ⚛** gear → **General**. With it on, typing outlines and
    labels `App`, `SearchBar`, `MenuTable`, its categories and rows and
    `CafeInfo` before §4.7, and no `App` or `CafeInfo` after;
- Mermaid 11.4.1 in Edge renders the starter's diagram, §4.5's blog example
  and both answers without errors, with the state's owner at the top;
- the readings' languages (2026-11-08): Thinking in React, Synchronizing
  with Effects, You Might Not Need an Effect and the hook reference pages
  are English only on uk.react.dev; «Стан: пам'ять компонента»,
  «Поширення стану між компонентами» and «Реагування на події» are
  Ukrainian; the legacy «Філософія React» and «Використовуємо хук ефекту»
  are Ukrainian. The anchors in the «Довідка» links exist; MDN has no
  Ukrainian `localStorage` page.

Not verified:

- a timed dry run (target: §4.1–4.6 in 24 minutes, all of §4.1–4.7 in 30);
- the diagrams rendered on GitHub;
- the fourth Vercel project and its redeploy after the §4.7 push;
- the apostrophe the Ukrainian keyboard layouts type («Трав'яний» uses
  U+0027);
- Windows **Extract All** and macOS Archive Utility folder names.

## Build

```bash
git add starters/react/lab-4                                 # the script packs tracked files only
python docs/web/build-pack.py starters/react/lab-4           # public/uk/react/starters/lab-4.zip
python docs/web/build-handout.py lab-4 react                 # public/uk/react/labs/lab-4.pdf, from PowerShell
```

Rebuild the zip after the starter is committed: each entry is dated by the
file's last commit, and a file with no commit yet keeps its modification
time. Rebuild the PDF after every handout edit; the handout's `handout:`
field points to it.

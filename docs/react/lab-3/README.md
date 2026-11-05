# Lab 3 — Refactoring by the component tree (Thinking in React)

| Route | Source | What it is |
| --- | --- | --- |
| `/react/labs/lab-3/` | `src/content/labs/react/uk/lab-3.md` | the handout: useful links instead of theory, the starter, the hierarchy from a framed mockup, four extractions by one recipe, the state table, checks and Vercel, report, defence |
| `/react/labs/lab-3.zip` | `react-lab-3-starter/` | the starter, unpacked by students into `react-labs/lab-3/` |
| `/react/labs/lab-3/result.webp` | the reference solution | the page, in the handout's §1 |
| `/react/labs/lab-3/frames.webp` | the reference solution and a debug overlay | the mockup with numbered component frames, in §4.2 |
| `/react/labs/lab-3.pdf` | built from the handout | the downloadable handout |

`solution/` holds the reference solution (gitignored): `src/` overlays the
starter's `src/`, `extra/` overlays it again for the optional §4.9 task, its
`README.md` is the answer key for the student's `lab-3/README.md` (the
hierarchy and the state table) plus defence notes, and `shots.mjs` checks
the starter against the solution in headless Edge and takes both images.
The plan the lab was built from is
[thinking-in-react-plan.md](thinking-in-react-plan.md).

## Why it looks like this

- **Independent of ЛР-2.** The lab has its own app and starter and needs only
  the `react-labs` repository from ЛР-1. A starter made from ЛР-2's finished
  «Команда проєкту» was considered and dropped.
- **A working page in one component.** The starter's `App.jsx` renders the
  whole «Меню кав'ярні»: a search field, a checkbox, a table grouped by
  category. Its shape is react.dev's product table, so the Thinking in React
  page lines up with the task step by step; §4.2 maps the names.
- **Grouped data.** `data.js` nests items in categories, so each category is
  one `<tbody>` and one `MenuCategory`. react.dev keeps a flat list and finds
  the category breaks while rendering, which is harder to move into a
  component in class.
- **One recipe, bottom-up, the page never changes.** §4.3 gives a six-step
  recipe and works it through on `MenuItemRow` with the code in full;
  §4.4–4.6 apply it to the three components around it. Every step ends with
  «сторінка не змінилася» and a new component in DevTools, and every
  extraction is a `refactor:` commit.
- **The tree is checked, not given.** §1 shows the page only. Students write
  the hierarchy from the framed mockup (§4.2) and compare it with
  **Components ⚛** after the refactoring (§4.7).
- **The hierarchy is a Mermaid diagram.** The starter's `README.md` has a
  `mermaid` block with `flowchart TD` and `App`; students add one
  `Parent --> Child` line per edge. GitHub renders the block in the README,
  so §4.8 checks the diagram there and §7 requires it to render. In class
  students preview it at mermaid.live, since editors may show it as plain
  text. §4.2's example is a different app (a blog) so it doesn't give the
  answer away. Prettier leaves `mermaid` blocks untouched, so a diagram
  can't fail `format:check`. The course site doesn't render Mermaid; the
  handout shows the example as code, which is what students type.
- **State on paper.** Steps 3–4 are a table in the starter's `README.md`.
  Its fifth row, the count in each category heading, isn't in react.dev's
  answer, so the table can't be copied from the page. `useState` is left
  to Лекція 2 and ЛР-4.
- **The extra commits `inStockOnly={false}`.** That matches the unchecked
  checkbox and keeps the page unchanged, so §7's «сторінка така сама» still
  holds; students switch the prop to `true` in DevTools instead.
- **«— немає» in the text,** not only in the grey colour, so the state of an
  item doesn't depend on seeing colour.
- **`<search>`, not `<form>`.** It is the search landmark and has nothing to
  submit, so `Enter` in the field doesn't reload the page.
- **The frames are drawn by a script.** `shots.mjs` draws absolutely
  positioned boxes from each component root's `getBoundingClientRect()`;
  CSS outlines aren't reliable on `<tbody>`, `MenuCategory`'s root. Each
  frame has a number as well as a colour.
- **The PDF waited for the handout's review,** so it was built last. It
  has 13 pages and embeds both images from the local `public/` folder.

## Verified on 2026-11-05

On Windows 11 with Node.js 24.20 and npm 11.19, in a `react-labs` repository
built as ЛР-1 describes, with `lab-1/` and `lab-2/` (React 19.3.1, Vite
8.3.5, ESLint 10.14, Prettier 3.9.10, `eslint-config-prettier` 10.1.8):

- `lab-3.zip` unpacked into `lab-3/`: `git status -u` lists only files
  under `lab-3/`; `npm install --offline` in the root adds 24 lines to
  `package-lock.json` (the `lab-3` workspace) and no packages;
  `npm run format:check`, `npm run lint` and `npm run build` pass;
- the code after each of §4.3, §4.4, §4.5 and §4.6, and after the §4.9
  extra, passes Prettier, ESLint and the build. Leaving the `MenuItemRow`
  import in `App.jsx` after §4.4 fails lint with `no-unused-vars`, which is
  what the recipe's step 5 promises;
- a clone made with `core.autocrlf=true` checks out LF and passes
  `format:check`;
- in Edge 156 headless, on Vite dev servers: the starter and the solution
  log no React warnings, so `<search>` renders without an unknown-tag
  warning; both render the same `#root` HTML; the solution's fiber tree is
  `App` → `SearchBar`, `MenuTable` → `MenuCategory` × 3 (keys `coffee`, `tea`,
  `desserts`) → `MenuItemRow` (keys 1–10), and each `MenuItemRow`'s owner is
  `MenuCategory`; `Enter` in the search field doesn't reload the page; with
  `key` only on the `<tr>` inside `MenuItemRow`, React logs «Each child in a
  list should have a unique "key" prop»;
- in Chrome 156 headless with the React DevTools 8.0.0 extension, on the
  solution with the §4.9 extra: the page logs no React warnings, so
  `<search>` works in Chrome too; **Components ⚛** shows the tree above
  with the same keys; a `MenuItemRow`'s **rendered by** lists the whole
  owner chain, `MenuCategory` first, then `MenuTable`, `App` and
  `createRoot()`, with `Array.map` lines and file links in between, which
  is why §4.7 says the first component named is the answer; ticking
  `inStockOnly`'s checkbox in `MenuTable`'s **props** leaves 7 rows and
  the headings «Кава (3)», «Чай (2)», «Десерти (2)»;
- Mermaid 11.4.1 in Edge renders the starter's one-node diagram, §4.2's
  blog example and both answer-key diagrams without errors; Prettier leaves
  a `mermaid` block unchanged, odd indentation included;
- uk.react.dev serves Thinking in React untranslated; uk.legacy.reactjs.org
  has «Філософія React» in Ukrainian, with class components in its examples.
  The section anchors in the «Довідка» links exist on both sites and on the
  uk.react.dev pages in §2;
- the site passes `npm run check` and `npm run build`; the zip, both images
  and the links get the base path; the labs index lists ЛР-3; the handout
  has no horizontal scroll at 390 px.

Not verified:

- a timed dry run of the whole lab by someone following the handout;
- `<search>` in Firefox;
- the diagram on GitHub itself, which may run a different Mermaid version;
- the default folder names from Windows **Extract All** and macOS Archive
  Utility;
- the third Vercel project from the same repository.

## Build

```bash
git add react-lab-3-starter                                  # the script packs tracked files only
python docs/web/build-pack.py react-lab-3-starter react      # public/react/labs/lab-3.zip
python docs/web/build-handout.py lab-3 react                 # public/react/labs/lab-3.pdf, from PowerShell
```

Rebuild the zip after the starter is committed: each entry is dated by the
file's last commit, and a file with no commit yet keeps its modification
time. Rebuild the PDF after every handout edit; the handout's `handout:`
field points to it.

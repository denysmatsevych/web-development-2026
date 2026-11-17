# Plan: React ЛР-10 «Організація структури папок та архітектура застосунку (Feature-Sliced Design)»

Status: proposed on 2026-11-17. That day the instructor settled the shape
(decisions 1–4 under **Decisions**): five structures in order, from folders
by file type to Feature-Sliced Design and Nadia Makarevich's packages.
Students move the same app from one structure to the next and measure the
same change in each. The app is ЛР-8's coffee-bean page grown into a small
shop with a hash router. The alternative is tried on one package in class.
ЛР-9 (ПМК 1) is skipped for now, so ЛР-10 is built and taught right after
ЛР-8.

The tools were checked on a small prototype the same day (see
**Verification**). The starter itself isn't prototyped yet. Instructor-only
material lives in the gitignored `solution/` folder next to this file: the
comparison of FSD and Makarevich's structure, and notes for the defence and
for §4.8's project choices. When the lab is built, the lasting facts move to
this folder's `README.md`, and this file stays as the plan the lab was built
from.

The challenge format, the test tooling and the AI rule come from ЛР-7. Its
plan, [../lab-7/custom-hooks-and-render-props-plan.md](../lab-7/custom-hooks-and-render-props-plan.md),
holds them, and this plan names only what ЛР-10 changes.

## Context

From [../course-plan.md](../course-plan.md), row 2.6:

- **Тема:** «Організація структури папок та архітектура застосунку
  (Feature-Sliced Design)»
- **Самостійна робота:** «Оптимізація структури модулів» (2 год.)
- **Читання:** Допоміжна 11 (Feature-Sliced Design)
- **Position:** after Lecture 4 (row 2.5: Context API, Zustand, Redux
  Toolkit and FSD), where presentation topics П4.6 «Feature-Sliced Design на
  практиці» and П4.7 «Альтернативи FSD» are defended. ЛР-11 (useReducer) and
  ЛР-12 (Context API) come next. No lecture deck is built yet, so the
  readings carry the topic, as in every lab so far.

The row lists only the FSD docs, but two other programme readings fit:
Основна 4, by Robin Wieruch, whose folder-structure article §4.3–§4.5 link,
and Основна 5 / Допоміжна 8, by Nadia Makarevich (*Advanced React* and
Developer Way), whose project-structure article is §4.7's alternative.

What earlier labs left for this one:

- **ЛР-7 and ЛР-8's starters are already grouped by file type:**
  `components/`, `hooks/`, `hoc/`, with `data.js`, `formatTime.js` and
  `analytics.js` at the root of `src/`. Students have worked in that
  structure for two labs, so it is the baseline here, not a strawman.
- **ЛР-8 §4.3 passed content through `children`.** Composition comes back
  when §4.5 and §4.6 forbid imports that the starter makes freely.
- **ЛР-1's `react-labs` repository uses npm workspaces** (`lab-*`), so a
  package with its own `package.json` is familiar. §4.7 adds one inside
  `lab-10/`.
- **ЛР-7 and ЛР-8's given tests guarded refactors.** Here they guard four
  moves of the whole app.

### What the lab is for

The instructor's goal: investigate each folder structure and decide which
one suits which kind of project. So the lab's result is evidence and a
decision, not one correct tree. Students:

1. move the same app through four structures, one commit each, while given
   tests prove that the app still works and given linters check each
   structure's rules;
2. measure the same change in every structure (see **Measuring a change**);
3. choose a structure for seven project descriptions, including their own
   final project, and justify each choice with a measured number or a rule.

### The five structures

The handout fixes each structure's **top-level folder names**, so that the
given rules can check them. Which file goes into which folder is the
student's decision.

| § | Structure | Sources | Top-level folders in `src/` | Rule | Checked by |
| --- | --- | --- | --- | --- | --- |
| 4.3 | By file type (the starter) | React FAQ «Grouping by file type»; Wieruch, step 4; Comeau | `components/`, `hooks/`, `hoc/`, `store/`, `utils/`, `data/`, `pages/` | none of its own: any file may import any. §4.5's rule for shared folders already covers `components/`, `hooks/` and `utils/`, which share its names; the starter breaks none of it | tests |
| 4.4 | By route | React FAQ «Grouping by features or routes»; Next.js «Split project files by feature or route»; Dodds, colocation | `app/`, `routes/<route>/`, `shared/` | a route folder doesn't import another route folder; code that two routes use goes to `shared/`; `shared/` imports neither `routes/` nor `app/` | tests, dependency-cruiser |
| 4.5 | Feature folders | bulletproof-react; Wieruch, step 5 | `app/` (route components in `app/routes/`), `features/<feature>/`, shared `components/`, `hooks/`, `lib/`, `stores/`, `utils/` | features don't import each other; imports flow shared → features → app; no `index.js` barrels, as bulletproof-react now advises | tests, dependency-cruiser |
| 4.6 | Feature-Sliced Design v2.1 | feature-sliced.design | the layers the app needs: `app/`, `pages/`, `widgets/`, `features/`, `entities/`, `shared/`; slices; segments `ui/`, `model/`, `api/`, `lib/`, `config/` | a layer imports only from layers strictly below; no imports between slices of one layer; other slices are imported only through their `index.js`; a slice that only one place uses shouldn't be a slice | tests, Steiger, dependency-cruiser |
| 4.7 | Packages (Makarevich) | Developer Way, «React project structure for scale» | adds `lab-10/packages/cart/`: `package.json` with `name` and `exports`, `index.js`, layers `data/`, `shared/`, `ui/` (and `state/` if needed) | the app imports the package only by its name; `exports` makes Vite and Node reject deep imports; the package doesn't import the app | Vite's resolver, tests, dependency-cruiser |

§4.7 moves one part of the FSD app, the cart, into a package, as the
instructor decided (decision 4). Makarevich's article splits a whole app into
packages, but one package shows the mechanism: what the boundary costs and
what it enforces.

### The readings

Checked on 2026-11-17. All are in English. The FSD docs have no Ukrainian
version: `feature-sliced.design/uk/…` returns 404.

| Page | Date | Use |
| --- | --- | --- |
| React (legacy docs): [File Structure](https://legacy.reactjs.org/docs/faq-structure.html) | legacy site | before class. The React team's own statement, and react.dev has none: group by file type or by feature/route, keep nesting to 3–4 levels, «Don't overthink it» (§4.3, §4.4) |
| Robin Wieruch: [React Folder Structure](https://www.robinwieruch.de/react-folder-structure/) | updated 2026-05-05 | before class. Five steps from one file to feature folders; a `pages/` folder for Vite apps; kebab-case and the barrel-file caveat (§4.3–§4.5) |
| Josh Comeau: [Delightful React File/Directory Structure](https://www.joshwcomeau.com/react/file-structure/) | 2022, updated 2025-12-03 | a by-type structure defended on a blog with about 1,200 source files, and his case against feature folders (§4.3, defence) |
| Kent C. Dodds: [Colocation](https://kentcdodds.com/blog/colocation) | 2019 | «Place code as close to where it's relevant as possible» (§4.4) |
| Next.js: [Project structure and organization](https://nextjs.org/docs/app/getting-started/project-structure) | 2026-07-21 | route folders with colocated files, private `_folders`, route groups, three ways to organise a project (§4.4; Next.js is ЛР 20) |
| bulletproof-react: [Project Structure](https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md) | living doc | feature folders, «shared → features → app», cross-feature imports forbidden with `import/no-restricted-paths`, and the advice against barrel files (§4.5) |
| FSD: [Overview](https://feature-sliced.design/docs/get-started/overview), [Layers](https://feature-sliced.design/docs/reference/layers), [Slices and segments](https://feature-sliced.design/docs/reference/slices-segments), [Public API](https://feature-sliced.design/docs/reference/public-api), [Tutorial](https://feature-sliced.design/docs/get-started/tutorial) | v2.1 | before class: Overview and Layers; the rest from §4.6 |
| [Steiger](https://github.com/feature-sliced/steiger) | 0.10.0 | the FSD linter: what each rule in its output means (§4.6) |
| Nadia Makarevich: [React project structure for scale: decomposition, layers and hierarchy](https://www.developerway.com/posts/react-project-structure) | 2022-05-23 | before §4.7 (see **The alternative**) |
| Node.js: [Packages → Package entry points](https://nodejs.org/api/packages.html) | current | how `exports` closes a package (§4.7); anchor checked during the build |
| npm: [Workspaces](https://docs.npmjs.com/cli/using-npm/workspaces) | current | §4.7 |
| dependency-cruiser: [Rules reference](https://github.com/sverweij/dependency-cruiser/blob/main/doc/rules-reference.md) | 18.8.0 | optional: how the given rules are written |
| VS Code: [JavaScript](https://code.visualstudio.com/docs/languages/javascript) | current | how the editor updates imports when a file moves (§4.2); the anchor is checked during the build |
| Dan Abramov: [react-file-structure.surge.sh](https://react-file-structure.surge.sh/) | — | optional, one line: «move files around until it feels right» |

**Considered, not used:**

- **profy.dev, «Popular React Folder Structures and Screaming
  Architecture».** It would fit П4.7, but the host didn't resolve on
  2026-11-17. Retry during the build.
- **Search-result roundups** (dev.to, vendor blogs, course pages). One 2026
  post calls FSD «the most widely adopted React architecture standard»
  without evidence. They add nothing the primary sources above don't.
- **FSD's own [Alternatives](https://feature-sliced.design/docs/about/alternatives) page.**
  Seven of its eight sections are work-in-progress outlines. Only the Atomic
  Design section has content, and it fits a defence question at most.

### The alternative: Makarevich's packages

The instructor asked whether
[the Developer Way article](https://www.developerway.com/posts/react-project-structure)
is a good alternative to FSD. What it proposes, as checked on 2026-11-17:

- **Decomposition into packages.** Each feature is a folder with its own
  `package.json` (`name`, an entry point) in a multi-package monorepo,
  imported by name (`@project/my-feature`). Restricting deep imports through
  the package's entry points is recommended. Packages aren't published, and
  external dependencies stay in the root `package.json`.
- **Boundaries:** design-system pieces, UI-bounded features (dialogs,
  drawers), shared features; one conceptual thing per package.
- **Layers inside a package:** `data` (queries, mutations), `shared` (utils,
  hooks, small components, types), `ui` (depends on both), and an optional
  `state` between `data` and `ui`.
- **A strict hierarchy in `ui`:** a component folder's main file imports only
  its direct children, never its neighbours, and never skips a level. Code
  needed in two branches moves to `shared`.
- **Conventions:** a folder per component (`index.tsx`, `test.tsx`,
  `stories.tsx`, `styles.*`, `types.ts`, `utils.ts`, `hooks.tsx`), kebab-case
  in the examples, and «consistency matters more than the convention».
- **Written in 2022** for TypeScript with yarn workspaces and webpack. It
  names no linter: the package boundary is the only rule a tool enforces.

The article fits the lab for three reasons. It is the programme's own
literature. It is the one structure that enforces its public API through
the platform, Node's and Vite's module resolution, instead of a linter. And
students already have a workspace root. Whether it is a good alternative, and
for which projects, is what §4.8 and the defence ask, so the instructor's
assessment is in `solution/README.md`.

## The app: «Кавова крамниця»

ЛР-8's coffee-bean page becomes one page of a small shop. The café world
continues: ЛР-3–4 were the menu, ЛР-5–6 the table booking, ЛР-7–8 the
coffee-bean page.

| Address | Page | Content |
| --- | --- | --- |
| `#/` | «Каталог» | 8 bean cards (ЛР-7's product and its seven related products): name, notes, price, ♡, «Додати в кошик» |
| `#/beans/<id>` | the bean's page | ЛР-8's page: the product card (♡, «Помел», price, «Додати в кошик») and the tabs «Заварювання» (two timers), «Відгуки (N)», «Схожі товари» |
| `#/cart` | «Кошик» | a line per bean with «−», the quantity, «+», «Видалити»; the total; an empty state with a link to the catalogue |

A header on every page links to the catalogue and shows «Кошик (N)».

**Given infrastructure, unchanged by any challenge:**

- **A hash router.** `useRoute()` reads `location.hash` through
  `useSyncExternalStore` and `hashchange`; `paths` builds the addresses; a
  `Link` component sets `location.hash` in its click handler. That handler
  matters in tests: jsdom doesn't navigate when an anchor with `href="#/cart"`
  is clicked, but it fires `hashchange` when `location.hash` is assigned
  (checked). React Router comes with ЛР-13. Hash addresses need no rewrite
  rule on Vercel.
- **A cart store.** A module with `subscribe`/`getSnapshot` read through
  `useSyncExternalStore` and kept in `localStorage`, plus a `useCart()`
  hook. It isn't Context, which is ЛР-12's topic. `getSnapshot` reads
  `localStorage` on every call and returns the same array while the stored
  string is unchanged. That is what lets `tests/setup.js` empty the cart
  between tests by clearing `localStorage`, without importing the store,
  which moves in every step.
- **The cart's core is free of the app.** The store, `useCart` and
  `CartLine` import only React and each other: a line keeps the bean's name
  and price from the moment it was added, and its «−», «+» and «Видалити» are
  plain `<button>` elements. The rest of the cart touches the app:
  «Додати в кошик» is `withAnalytics(Button, 'add_to_cart')`, as in ЛР-8;
  the cart page's empty state links to the catalogue through `Link`; the
  counter sits in the header. §4.7 turns that boundary into a decision.

**Reuse on purpose.** Steiger's `insignificant-slice` rule rejects a slice
that only one other slice uses (see **Verification**). An app where nothing
is shared would make FSD's layers pointless, so these parts are used in two
or more places: ♡ (catalogue cards, the product card, related products),
«Додати в кошик» (catalogue cards, the product card), the bean card
(catalogue, related products), the cart (the header, the cart page and
«Додати в кошик» on two pages),
`Button`, `Tabs`, `useLocalStorage` and `useShowMore`. The brew guide and its
timers, the reviews, the grind picker and the cart lines are each used in one
place. Together they create the decisions each structure forces, which the
handout leaves to the students (see each step's **Рішення**).

**One seeded coupling.** The starter has one import that a by-type app
would plausibly have and that a later structure forbids. Nothing complains
until then. The handout doesn't point it out; the checker does. What it is
and its fix are in `solution/README.md`.

**ЛР-8's answers in the starter.** The shop contains ЛР-8's reference
solution: compound `Tabs` with context, the APG keyboard, `withAnalytics`
on «Додати в кошик» and the timer buttons, and ЛР-8 §4.6's fix for the
timer button's focus. As with ЛР-8 (its decision 7), the branch and the
zip stay local until the last group's ЛР-8 class.

**Size:** about 37 files in `src/`. ЛР-8's unit tests don't come along: they
import components by path, and every step changes those paths (see **The
checks**).

## The steps

Students do §4.3 → §4.8 in order. Each structure is one commit, and nothing
in `tests/` changes in any commit. Each step in the handout has ЛР-7's parts:
**Що має вийти**, **Що вже є**, **Перевірка** and **Довідка** (the links),
plus **Рішення**, which lists the questions the structure forces without
answering them.

**Moving files.** Students move files with the editor's refactoring, which
updates the imports: VS Code's file explorer with
`javascript.updateImportsOnFileMove.enabled` set to `always`, or WebStorm's
**Refactor → Move**. They don't use an AI agent (see §4.2). After a move:
`npm test` (watch mode stays open), `npm run lint`, `npm run check:deps`,
from §4.6 `npm run check:fsd`, then `npm run build`. When `App` moves, the
student updates one line, `imports["#app"]` in `package.json`, and when
`main.jsx` moves, the script path in `index.html`.

### Measuring a change

Each step ends with the same two measurements, recorded as one row of the
table in `lab-10/STRUCTURES.md`. The row goes into the step's commit, so the
measuring happens before the commit, on staged moves:

1. **«Прибрати відгуки».** First `git add -A`, which stages the step's
   moves. Then delete everything that only the reviews use, fix imports
   until `npm run build` passes, and read three numbers: `git diff --stat`
   (files changed), `git diff --dirstat=files,0` (folders touched) and
   `npm run check:deps` (dead files left behind, the
   `not-reachable-from-main` warnings). Then `git restore src` brings back
   the staged structure. The tests aren't run here: the reviews tests fail
   by design.
2. **«Де живе кошик».** How many folders hold the cart's code: the store,
   `useCart`, `AddToCartButton`, `CartLine`, the cart page and the header's
   counter.

Then the student fills in the row, runs `git add -A` again and commits.
The `git add -A` before measuring isn't optional: `git diff` doesn't see
untracked files, so unstaged moves count as deletions, and `git restore src`
then brings the old files back next to the moved ones (checked).

**A bias the handout names.** `not-reachable-from-main` follows re-exports,
so a file that an `index.js` still re-exports counts as reachable even when
nothing uses it (checked with dependency-cruiser 18.8.0). In §4.6, where
every slice has an `index.js`, a dead file behind one goes unreported, and a
student who leaves that `index.js` alone also changes fewer files. §4.6's
measurement says so and asks the student to read the slices' `index.js`
files after the deletion; §6 asks about it.

The numbers depend on each student's decisions, so the handout gives none;
the reference's are in `solution/README.md`. The commands work in
PowerShell and in Git Bash.

### §4.3. За типом файлів: the starter

**Що має вийти.** No moves. Students read the tree, run every check (12
tests pass; `check:deps` has no errors, since the starter breaks none of its
rules), take both measurements and commit the first row:
`docs: measure the by-type structure`.

**Рішення** (observe only): which `components/` serve one page; where
"the cart" lives; what a newcomer has to open to change the reviews.

### §4.4. За маршрутами

**Що має вийти.** `src/app/` (entry, `App`, global styles), one folder per
route under `src/routes/` (`catalog/`, `bean/`, `cart/`) holding that
route's code, and `src/shared/` for what two routes use. Commit
`refactor: group files by route`.

**Рішення:** where code goes that two routes use; whether `shared/` gets
sub-folders by type; where the header and the router go; how big the `bean/`
folder gets.

### §4.5. За функціональністю: feature folders

**Що має вийти.** bulletproof-react's layout: `src/app/` with the route
components in `app/routes/`, `src/features/<feature>/` with only the
sub-folders a feature needs (`components/`, `hooks/`, `stores/`, `utils/`),
and the shared folders. No `index.js` files: imports point at files. Commit
`refactor: group files by feature`.

**Рішення:** what counts as a feature; what to do when the checker reports
an import between features (the seeded coupling, about 3 minutes; see
**The app**); whether `ShowMore` and `useShowMore` are shared or belong to
a feature.

### §4.6. Feature-Sliced Design

**Що має вийти.** FSD's layers, slices and segments, with an `index.js`
public API per slice. That contradicts §4.5's "no barrels", which is a
defence question. Imports are relative. `npm run check:fsd` (Steiger) reports
no problems, and `check:deps` has no errors. Commit
`refactor: move to feature-sliced design`.

Students will meet these Steiger rules: `fsd/forbidden-imports`,
`fsd/no-public-api-sidestep`, `fsd/insignificant-slice`,
`fsd/segments-by-purpose` and `fsd/no-segmentless-slices`. Each message links
its rule's page, so §4.6's **Довідка** only says to read that page first.

**Рішення:** entity, feature or widget; what stays inside a page; where the
header's counter goes; how many layers the cart now spans; after
«Прибрати відгуки», what the slices' `index.js` files still export (see
**Measuring a change**).

### §4.7. Пакет за Makarevich

**Що має вийти.** The cart moves from `src/` into `lab-10/packages/cart/`
as far as the package's rule allows: the package doesn't import the app.
Its core (the store, `useCart`, `CartLine`) moves as it is. The parts that
use the app's `Button`, `withAnalytics` or `Link` either stay in `src/` and
use the package, or get what they need from the app as props or `children`.
The package:

- `package.json`: `"name": "@coffee/cart"`, `"private": true`,
  `"type": "module"`, `"exports": { ".": "./index.js" }`;
- `index.js` exports exactly what the app uses;
- inside: Makarevich's layers (`data/`, `ui/`, and `state/` or `shared/` if
  the student needs them);
- `lab-10/package.json` gets `"@coffee/cart": "file:./packages/cart"`, and
  `npm install` runs in the `react-labs` root. The root `package.json`
  doesn't change (checked), so the other labs' Vercel projects don't
  redeploy.

The app imports `@coffee/cart`. Steiger and `check:deps` still pass. Commit
`refactor: move the cart into a local package`. Only «Де живе кошик» is
measured again. The package is a `file:` dependency inside the `lab-10`
workspace, not a workspace of its own, since the root's `workspaces` stay
`lab-*`.

**An experiment that isn't committed:** import a file inside the package by
name (`@coffee/cart/ui/…`), read the error from `vite build` and Vitest
(`"./ui/…" is not exported under the conditions …`), then try a relative path
into the package. It builds, and `check:deps` reports it.

**Рішення:** which parts of the cart stay in the app and how they use the
package; what the public API exports; which layer the store belongs to;
whether the package's `ui/` follows the direct-children rule.

### §4.8. Що обрати

**Що має вийти.** `STRUCTURES.md` gets a second table, «Що обрати»: for each
project, one of the five structures (or a stated mix) and one sentence that
cites a number from the first table or a rule. Commit
`docs: choose a structure for each project`.

Draft projects:

1. Лендінг кав'ярні: одна сторінка, вісім компонентів, один розробник;
   зроблено за тиждень і майже не змінюється.
2. Блог і документація на Next.js: 40 сторінок зі своєю розміткою, спільні
   лише шапка й підвал.
3. Адмінка для бариста: 15 екранів (замовлення, склад, зміни) зі своїми
   таблицями й формами; спільні лише кнопки й таблиця.
4. Інтернет-магазин кави: каталог, кошик, оформлення, акаунт; три команди;
   розвивається роками; кошик і картка товару є на багатьох сторінках.
5. Три застосунки мережі кав'ярень (сайт, кіоск самообслуговування,
   адмінка) в одному репозиторії зі спільною дизайн-системою й кошиком.
6. Прототип за 24 години на хакатоні.
7. Ваш фінальний проєкт (ЛР 21–27).

The instructor's notes on each are in `solution/README.md`. Project 7 links
this lab to the final project's first stage.

### The checks

**Tests** (Vitest + React Testing Library; three files, 12 tests). They
import only `#app`, a subpath import in `lab-10/package.json`, so moving
files never breaks them; moving `App` means updating that one mapping.
`tests/setup.js` imports nothing from `src/` either: after each test it
clears `localStorage`, which also empties the cart (see **The app**), and
resets `location.hash`. All 12 pass in the starter and after every step:

- `tests/catalog.test.jsx`: каталог показує всі 8 сортів з цінами; ♡ у
  картці лишається натиснутим після перезавантаження; «Додати в кошик»
  збільшує лічильник у шапці; назва сорту веде на його сторінку;
- `tests/bean-page.test.jsx`: сторінка сорту показує назву, помел і ціну;
  вкладки «Заварювання», «Відгуки (N)» і «Схожі товари» перемикають вміст;
  «Схожі товари» не показують поточний сорт; таймер після «Старт» показує
  «Пауза»;
- `tests/cart.test.jsx`: порожній кошик каже, що він порожній, і веде до
  каталогу; кошик показує додані сорти, кількість і суму; «+» і «−» змінюють
  кількість і суму; «Видалити» прибирає рядок, і лічильник у шапці
  зменшується.

**`.dependency-cruiser.cjs`** (given, with Ukrainian comments). Its rules
are cumulative: a rule matches nothing until its folders exist, so one file
serves every step.

| Rule | Severity | Forbids |
| --- | --- | --- |
| `no-circular` | error | import cycles |
| `routes-are-independent` | error | `src/routes/X/`, `src/pages/X/` or `src/app/routes/X/` importing another `X` of the same folder |
| `features-are-independent` | error | `src/features/X/` importing another feature |
| `shared-stays-shared` | error | the shared folders of §4.4–§4.6 (`shared/`, `components/`, `hooks/`, `lib/`, `stores/`, `utils/`) importing `app/`, `routes/`, `pages/`, `widgets/`, `features/` or `entities/` |
| `app-on-top` | error | anything outside `src/app/` importing from it |
| `packages-are-independent` | error | `packages/` importing `src/` |
| `no-deep-imports-into-packages` | error | `src/` importing a package's file other than its `index.js` by path |
| `not-reachable-from-main` | warn | a file in `src/` that `main.jsx` doesn't reach: dead code, used by «Прибрати відгуки» |

**Steiger** runs with its default FSD config (`npx steiger ./src`), only
from §4.6.

**What they don't check:** whether a file sits in the best place within the
rules. That is the lab's decision, and the defence asks about it. The one
exception is Steiger's `insignificant-slice`.

**Scripts** added to ЛР-8's: `check:deps` (`depcruise src --config
.dependency-cruiser.cjs`), `check:fsd` (`steiger ./src`), `graph`
(dependency-cruiser's Mermaid output, collapsed to folders, optional in
`STRUCTURES.md`; the exact options are fixed during the build).

## Design principles

1. **Placement is the decision, moving is mechanical.** The editor moves
   files and updates imports; the student decides where each file goes.
2. **Same app, same change, every structure,** so the numbers can be
   compared.
3. **Behaviour stays the same.** The tests import only `#app`, so they
   survive every move.
4. **Rules come from the sources, and tools check them.** The handout
   quotes each structure's rule and names its source; the student places
   files within it.
5. **Folder names are fixed, their contents aren't.**
6. **One page and no theory,** as in ЛР-1–8: links instead.
7. **JavaScript and relative imports.** TypeScript is ЛР-19, and Steiger
   can't see `jsconfig.json` aliases (see **Verification**). Aliases are
   §4.10's topic.
8. **React only at runtime.** dependency-cruiser and Steiger are
   devDependencies; the package in §4.7 has no dependencies of its own.

## Timing

The slot is 80 minutes.

| Step | Handout | Minutes |
| --- | --- | --- |
| Starter, `npm install`, checks, first commit | §4.1 | 5 |
| The AI rule; moving files in the editor | §4.2 | 2 |
| By file type: read, measure, commit | §4.3 | 5 |
| By route | §4.4 | 10 |
| Feature folders | §4.5 | 12 |
| FSD | §4.6 | 13 |
| The cart package | §4.7 | 8 |
| «Що обрати» | §4.8 | 4 |
| Checks, `git push`, Vercel | §4.9 | 4 |
| **The lab** | | **63** |

These are estimates. The structure steps include about 2 minutes of
measuring each. The timed dry run decides. If the lab takes longer than 65
minutes, the cuts, in order, are:

1. «Що обрати» moves from class to the report (§5);
2. §4.4 moves only the page components and the code each page alone uses;
   shared code stays in its by-type folders;
3. §4.7 becomes ungraded (moved to §4.10);
4. §4.5 is dropped: by route goes straight to FSD. This loses П4.7's
   comparison, so it is the last resort.

## Starter: `starters/react/lab-10/` → `/uk/react/starters/lab-10.zip`

Packed like ЛР-7's: `python docs/web/build-pack.py starters/react/lab-10`
after the starter is committed. The configs are ЛР-8's, except where noted.

```text
starters/react/lab-10/
├── .gitignore, .prettierrc.json, eslint.config.js, vite.config.js   ЛР-8's
├── .dependency-cruiser.cjs    the rules above
├── index.html                 lang="uk", <title>ЛР-10. Кавова крамниця</title>
├── package.json               "name": "lab-10"; "imports": { "#app": "./src/App.jsx" };
│                              scripts: ЛР-8's + check:deps, check:fsd, graph;
│                              devDependencies: ЛР-8's + dependency-cruiser,
│                              steiger, @feature-sliced/steiger-plugin
├── README.md                  the app, «Що вже є», the commands
├── STRUCTURES.md              the two empty tables students fill in
├── public/favicon.svg
├── src/
│   ├── main.jsx, App.jsx, index.css
│   ├── pages/        CatalogPage, BeanPage, CartPage
│   ├── components/   AppHeader, Link, BeanCard, FavoriteButton, AddToCartButton,
│   │                 ProductCard, GrindPicker, Tabs, BrewGuide, BrewTimer,
│   │                 TimerView, ReviewList, RelatedProducts, ShowMore,
│   │                 CartLine, Button
│   ├── hooks/        useLocalStorage, useCountdown, useShowMore, useRoute, useCart
│   ├── hoc/          withAnalytics
│   ├── store/        cartStore
│   ├── utils/        formatTime, paths, analytics
│   └── data/         beans, reviews, brewMethods, grindOptions
└── tests/            setup.js, catalog, bean-page, cart
```

`STRUCTURES.md` (Ukrainian, Prettier-clean): the measurement table with one
row per structure and the columns of **Measuring a change**, then «Що
обрати» with the seven projects and empty answer cells.

## Handout: `src/content/labs/react/uk/lab-10.md`

About ЛР-7's length, with no code listings. Frontmatter as in ЛР-8, with
`number: 10`, the programme's title, and `duration: "2 академічні години
(практична частина — близько 65 хвилин; самостійна робота — 2 години)"`.
`handout:` is added once the PDF is built after the instructor's review.
Ukrainian only; English later.

Draft `summary`: «Кавова крамниця з трьох сторінок у п'яти структурах:
від тек за типом файлів через теки за маршрутами й за функціональністю до
Feature-Sliced Design і пакета за Надією Макаревич. Готові тести стежать,
щоб застосунок працював, dependency-cruiser і Steiger перевіряють правила
кожної структури, а однакова зміна в кожній дає числа для вибору структури
під проєкт. Деплой на Vercel.»

**Top note.** The usual «Примітка щодо актуальності», naming FSD v2.1,
Steiger 0.10 and dependency-cruiser 18.

### §1. Мета роботи

Draft: «Навчитися організовувати файли React-застосунку за різними
підходами (за типом файлів, за маршрутами, за функціональністю, Feature-Sliced
Design, пакети), перевіряти правила структури інструментами й обирати
структуру під розмір і склад проєкту на підставі вимірювань.»

**Очікуваний результат:** `lab-10/` passes `npx vitest run` (12 of 12),
`npm run lint`, `check:deps` (no errors), `check:fsd` (no problems),
`format:check` and `build`. The app is in FSD with the cart as the
`@coffee/cart` package. `STRUCTURES.md` has both tables. The app is on
Vercel. Screenshot `/uk/react/labs/lab-10/result.webp`: the catalogue with
the header's counter. It shows no tree, since the tree is the answer.

### §2. Корисні посилання

The readings table, in its order, with ЛР-7's opening paragraph: no theory,
what to read before class (the React FAQ, Wieruch, FSD's Overview and
Layers), the rest when a step points to it.

### §3. Завдання

A numbered list, one line each: §4.1 starter; §4.3–§4.7, the five
structures; §4.8 «Що обрати»; §4.9 checks and Vercel. Then the notes: all
in class, 1 point after the defence, ЛР-7's rule for unfinished work, and the
AI note pointing to §4.2.

### §4. Хід виконання

- **4.1. Стартовий проєкт.** ЛР-8 §4.1 with `lab-10`; `npm test` passes
  12 of 12 from the start, and §4.1 explains why: the tests guard behaviour
  while the files move. Commit `chore: add lab 10 starter`.
- **4.2. Правила роботи з AI і переміщення файлів.** ЛР-7's rule, adapted:
  AI may explain a concept or a checker's message, but doesn't decide where
  files go and doesn't move them, and agents are off. The editor setting for
  updating imports; after `git add -A`, `git diff --cached --stat` shows
  moves as renames (`src/{components => shared}/…`). Unstaged, a moved file
  shows only as a deletion, since `git diff` doesn't see untracked files
  (checked).
- **4.3–4.8.** As under **The steps**.
- **4.9. Перевірки, GitHub і Vercel.** All checks; `git push`; a new
  Vercel project `react-lab-10` with Root Directory `lab-10`. The history is
  the starter's commit plus six.
- **4.10. Самостійна робота (не оцінюється): «Оптимізація структури
  модулів».** The programme's item. Switch §4.6's relative imports to `@/…`
  aliases that work in Vite, the editor and Steiger at once, then prove that
  Steiger still catches a forbidden import. Optionally, express the
  `check:deps` rules for §4.5 in ESLint with `eslint-plugin-boundaries` and
  compare.

### §5. Вимоги до звіту

Subject `[React] ЛР-10: структура папок і Feature-Sliced Design`, with
ЛР-8's two lines for `lab-10`. The report contains:

1. a screenshot of `npx vitest run` (12 of 12), `check:deps` and
   `check:fsd`;
2. a screenshot of `npm run lint`, `format:check` and `build`;
3. `STRUCTURES.md`'s two tables (or a link to them on GitHub);
4. per structure, one or two sentences on what was hard to place and how it
   was decided (a plain summary);
5. whether AI was used, and for what;
6. a short conclusion.

### §6. Усний захист

ЛР-7's intro, plus: the instructor may ask where a new file would go, or
ask for a live move. Grouped interview questions, answerable from the lab and
its readings:

- **«Навіщо структура»:** what a good structure optimises (finding code,
  changing it, deleting it, team boundaries); colocation; «things that
  change together»; the cost of restructuring; «don't overthink it».
- **«За типом файлів»:** when it is enough; what breaks as the app grows;
  where a hook used by one component goes; Comeau's argument.
- **«За маршрутами»:** colocation by route; Next.js private folders and
  route groups; what to do with code two routes need; why route folders
  shouldn't import each other.
- **«Теки за функціональністю»:** what a feature is; why features don't
  import each other and how pages compose them; shared → features → app;
  barrel files and tree shaking; why a barrel hides a dead file from a
  dependency graph.
- **«FSD»:** layers, slices, segments; the import rule; the public API and
  side-stepping it; why an entity can't import a feature; `@x`;
  `insignificant-slice` and «not everything needs to be a feature»; when FSD
  is more than a project needs.
- **«Пакети»:** what `exports` changes compared with an `index.js`
  convention; what `file:` and workspaces do; the layers inside a package
  compared with FSD's segments; the direct-children rule; what a package
  costs.
- **«Інструменти»:** what dependency-cruiser and Steiger check and what they
  can't; why aliases can hide violations from a linter; reading a rule's
  message.
- **«Вибір»:** the answers in «Що обрати», defended; how to migrate a
  growing project (type → feature → FSD); how to restructure safely (tests
  first, editor refactoring, small commits, renames in
  `git diff --cached --stat`).

The handout's §6 will be the full list; the answers go in
`solution/README.md`.

### §7. Критерії готовності

«Лабораторна робота оцінюється в 1 бал після захисту (§6).» One table:

| Критерій | Мінімальна вимога |
| --- | --- |
| Тести | у теці `lab-10` `npx vitest run` проходить: 12 з 12; файли в `tests/` не змінено в жодному коміті |
| Якість | `npm run lint` без помилок і попереджень; `format:check` і `build` — без помилок |
| Правила структур | `npm run check:deps` — без помилок; `npm run check:fsd` — без проблем |
| Структури | по коміту на кожну структуру з §4.4–§4.7; теки верхнього рівня — як у §4 |
| Пакет | `@coffee/cart` з полем `exports`; застосунок імпортує його лише за назвою |
| STRUCTURES.md | рядок вимірювань для кожної структури; «Що обрати» з обґрунтуванням для кожного проєкту |
| На занятті | усі коміти відправлено на занятті; незавершене — на відпрацюванні, як пропущене заняття |
| Vercel | проєкт з Root Directory `lab-10`; адреса показує застосунок з останнього коміту `main` |
| AI | §4.2 дотримано; у звіті вказано, як використовувався AI |
| Звіт | усі пункти §5 |

## Files to create or change

- `starters/react/lab-10/` (above);
- `public/uk/react/starters/lab-10.zip`: built by `build-pack.py` after the
  starter's commit, in its own commit;
- `src/content/labs/react/uk/lab-10.md`: the handout;
- `public/uk/react/labs/lab-10/result.webp`, taken from the reference in
  headless Edge;
- `public/uk/react/labs/lab-10.pdf`: `python docs/web/build-handout.py
  lab-10 react`, after the instructor's review;
- `docs/react/lab-10/solution/` (gitignored; the `.gitignore` line comes
  with this plan): the reference solution as one stage per step, the
  measurements, the FSD/Makarevich comparison, the «Що обрати» notes, the
  defence answers and a `shots.mjs`;
- `docs/react/lab-10/README.md`: the lasting facts and what was verified,
  with no answers;
- `docs/react/course-plan.md`: a ЛР 10 row in **How the site maps to the
  plan**; the «not built» rows become `ЛР 9` and `ЛР 11–27`; the date above
  the table;
- `README.md` (root): a `lab-10/` line in the `starters/react/` tree.

Work on `feat/react-lab-10` from `main`, which has ЛР-8 since PR #75 was
merged; the starter builds on ЛР-8's reference solution. Keep the branch
local until the last group's ЛР-8 class.

## Verification

**Checked while writing this plan (2026-11-17)** on a prototype: a
`react-labs` root with npm workspaces, a `lab-10` app with a few FSD slices
and a local package, on Windows 11 with Node.js 24.20.0 and npm 11.19.0.
Versions: React 19.3.1, Vite 8.3.8, `@vitejs/plugin-react` 6.3.0, Vitest 5.1.0,
jsdom 31.0.1, React Testing Library 16.3.3, ESLint 10.15.0 with ЛР-8's
config (`eslint-plugin-react-refresh` 0.5.7), Steiger 0.10.0,
`@feature-sliced/steiger-plugin` 0.8.2, dependency-cruiser 18.8.0.

- **Steiger lints JavaScript and JSX** with no config. It resolves relative
  imports and `tsconfig.json` paths. It does **not** read `jsconfig.json`:
  with `@/…` aliases declared only there, it can't resolve any import and
  reports «No problems found!» even for an entity that imports a feature.
  The same happens with `#…` subpath imports. Hence relative imports in §4.6,
  and `#app` only for the tests, which Steiger doesn't lint.
- **Steiger's messages:** an entity importing a feature → «Forbidden import
  from higher layer "features"» (`fsd/forbidden-imports`); a feature
  importing another → «Forbidden cross-import from slice …» (same rule); a
  relative path to a file inside another slice → `fsd/no-public-api-sidestep`;
  a slice used by one other slice → «This slice has only one reference in
  slice "pages\catalog". Consider merging them.»
  (`fsd/insignificant-slice`, an error by default); unreferenced → «Consider
  removing it.» Exit code 0 when clean.
- **dependency-cruiser** reads `.jsx` ESM with no extra config; `$1`
  back-references in `pathNot` work (the route and feature rules); `reachable:
  false` from `main\.jsx$` lists dead files; `--output-type mermaid
  --collapse 3` draws a folder-level graph. It follows the linked package to
  its real path under `packages/`.
- **The package:** with `"exports": { ".": "./index.js" }`, importing
  `@coffee/…/ui/X.jsx` fails in `vite build` and in Vitest with «"./ui/X.jsx"
  is not exported under the conditions …». A relative path into the package
  builds, which the `no-deep-imports-into-packages` rule exists for.
- **`"file:./packages/cart"`** in `lab-10/package.json` plus `npm install`
  at the root links the package into the root `node_modules` with the root's
  `workspaces` unchanged (`lab-*`); JSX inside the package compiles, since
  Vite treats a linked package as source.
- **`#app`** (package.json `imports`) resolves in Vite and Vitest.
- **ESLint** with ЛР-8's config has no complaint about `index.js` files that
  re-export components together with hooks or data.
- **jsdom:** clicking `<a href="#/cart">` leaves `location.hash` empty;
  assigning `location.hash` fires `hashchange`, and a
  `useSyncExternalStore` subscriber re-renders.
- **dependency-cruiser and barrels:** a file that only an `index.js`
  re-exports counts as reachable, so the `reachable: false` rule doesn't
  flag it; only a file that nothing imports gets the warning.
- **Git:** unstaged moves show in `git diff --stat` as deletions, and
  `git restore src` then brings the old files back next to the moved ones;
  after `git add -A`, `git diff --cached --stat` shows the renames.
  `git diff --dirstat=files,0` runs unquoted in Windows PowerShell 5.1 and
  lists each folder that directly holds a change.
- **Vercel** (its monorepo docs): a lockfile change redeploys only the
  projects whose dependencies it affects, so §4.7's `npm install` doesn't
  redeploy the other labs.

**To check during the build:**

- the starter's 12 tests in the starter and after each reference stage;
  every stage through lint, Prettier, `check:deps`, `check:fsd` (from §4.6)
  and the build;
- whether Steiger accepts `main.jsx` and `index.css` inside `app/`, and what
  it says about a header used only by `app/`;
- **timed dry run** as a student, without AI, in VS Code: §4.3–§4.8 in about
  55 minutes plus setup, with the editor's import updates for `.jsx` files
  (no `jsconfig.json`); otherwise apply the cuts under **Timing**;
- WebStorm's **Move** on the same files;
- the whole «Прибрати відгуки» sequence (`git add -A`, the deletions, the
  three readings, `git restore src`) after a real step's moves, in
  PowerShell and Git Bash;
- the starter's tests in random order (`npx vitest run --sequence.shuffle`),
  to prove that `setup.js` resets the cart and the route;
- §4.7 in the reference: what moves into the package and what stays in the
  app, with Steiger's `insignificant-slice` on what stays;
- `npm install` in an existing `react-labs` (ЛР-1–8 present) adds `lab-10`
  and links `@coffee/cart`; Vercel builds `lab-10` with the `file:` package
  and doesn't run the tests;
- the readings' anchors (Node's entry points, VS Code's import updates),
  bulletproof-react's page, and profy.dev again;
- the zip stores LF and passes `format:check` after unpacking;
- `npm run check && npm run build` for the site; the labs index lists ЛР-10.

## Decisions

**Settled by the instructor on 2026-11-17:**

1. **Five structures:** by file type → by route → feature folders
   (bulletproof-react) → FSD → Makarevich's packages. Feature folders and FSD
   are separate steps, so FSD can be compared with the simpler feature-based
   structure.
2. **Students restructure step by step,** one commit per structure, with
   given tests for behaviour, dependency-cruiser and Steiger for the rules,
   and the same change measured in each.
3. **The app is ЛР-8's page grown into a three-page coffee shop** with a
   small hash router in the starter; React Router stays with ЛР-13.
4. **Makarevich's structure is tried on one package in class:** the cart as
   `@coffee/cart`, with `exports`.

The instructor also noted that ЛР-9 (ПМК 1) is skipped for now, so ЛР-10
comes right after ЛР-8.

**Proposed, for the instructor to confirm or change:**

5. **Top-level folder names are fixed per structure** (the table under
   **The five structures**), so one rule file can check every step.
6. **The two measurements are «Прибрати відгуки» and «Де живе кошик».** The
   first is a change that lives in one place on the page. The second follows
   one business concept, used all over the app, through every structure.
   Other candidates were adding a feature (it needs new code, which takes
   time from placing files) and «show ♡ in the cart» (it fits a defence
   question).
7. **The checks are dependency-cruiser and Steiger,** not ESLint plugins.
   One dependency-cruiser file covers all five structures, draws the graph
   and finds dead files. Steiger is FSD's own linter. `eslint-plugin-boundaries`
   is §4.10's optional comparison.
8. **Relative imports throughout,** because Steiger silently passes
   `jsconfig.json` aliases. Aliases are §4.10.
9. **No `index.js` in §4.5, `index.js` per slice in §4.6,** as each source
   says. The contrast is a defence question.
10. **The cart is the package.** Its core (store, `useCart`, `CartLine`)
    imports only React, so it moves without a redesign. The header, two
    pages and «Додати в кошик» use it, which makes «Де живе кошик» worth
    measuring. The parts that touch the app (`withAnalytics` on
    «Додати в кошик», as in ЛР-8, and the empty state's `Link`) make the
    package's boundary a real decision instead of a copy. The brew guide was
    the other candidate, but only one tab uses it, and its view depends on
    `Button` and `withAnalytics` as well: a package there would show the
    cost without the reuse.
11. **AI explains, doesn't place or move files,** and agents are off. Where
    a file goes is the skill being practised.
12. **Everything in class, 1 point, and ЛР-7's rule for unfinished work**
    (its decision 10).
13. **ЛР-8's unit tests are replaced** by 12 app-level tests through `#app`.
14. **Ukrainian first,** English later.
15. **Out of scope:** monorepo tooling (Nx, Turborepo), TypeScript path
    aliases (§4.10 only), Atomic Design, DDD and Clean Architecture (defence
    mentions at most), module federation, and global state (Lecture 4,
    ЛР-12).

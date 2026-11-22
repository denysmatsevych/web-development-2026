# Lab 10 — Folder structure and Feature-Sliced Design

| Route                               | Source                                | What it is                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ----------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/react/labs/lab-10/`               | `src/content/labs/react/uk/lab-10.md` | the handout: useful links instead of theory, one app moved through four folder structures (§4.3 by file type, §4.4 by route, §4.5 feature folders after bulletproof-react, §4.6 Feature-Sliced Design), where the cart lives counted in each, §4.7 a structure chosen for five projects (after class, with the report), the AI rule, §4.8 checks and Vercel; §4.9, +1 point: the cart as a local package after Nadia Makarevich; report, defence |
| `/uk/react/labs/lab-10.pdf`         | built from the handout                | the downloadable handout                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `/uk/react/starters/lab-10.zip`     | `starters/react/lab-10/`              | the starter, unpacked by students into `react-labs/lab-10/`                                                                                                                                                                                                                                                                                                                                                                                      |
| `/uk/react/labs/lab-10/result.webp` | the reference solution                | the catalogue with «Кошик (3)» in the header, in the handout's §1; it shows no folder tree, since the tree is the answer                                                                                                                                                                                                                                                                                                                         |

`solution/` holds the instructor's material (gitignored): `stages/`, one
folder per structure step, each a full copy of `src/`, `package.json` and
`index.html` (and `packages/` for §4.9) as the reference left them;
`shots.mjs`, which checks the starter and the last stage in headless Edge
and takes the screenshot; and a `README.md` with the seeded coupling, the
reference's measurements, the FSD/Makarevich comparison, the notes on
§4.7's projects and the defence answers. The repository is public and the
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
  decisions 1–4, 2026-11-17), the fifth for an extra point (below).
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

- **«Вибір структури для проєкту» (§4.7, formerly «Що обрати») is spelled out** (the instructor found the first
  version unclear, 2026-11-18): the section states its purpose, lists the
  five structures and the projects itself, names what to look at in a
  project (size, what pages share, people, lifetime, apps sharing code) and
  shows one worked row on a project outside the list plus one non-answer.
  «Чому» is one or two sentences: what matters in the project and why the
  structure fits it. The plan's requirement to cite a number or a rule is
  gone: a first rewrite asked for evidence from the lab, and the instructor
  found that unclear too and had it removed (2026-11-18).
  `STRUCTURES.md` keeps short project names and points to §4.7, so the
  descriptions live in one place.
- **Five projects in §4.7, not seven** (the instructor's decision,
  2026-11-18). The student's own final project is out: no one has a topic
  for ЛР 21–27 yet, so the plan's link to the final project's first stage
  is gone. The coffee-shop landing is out too, since §4.7's worked example
  (a one-page invitation) nearly answers it. The hackathon prototype stays,
  now with a team, a screen count and a chance to grow, and the list runs
  from the smallest project to the largest.
- **The cart package is optional, for +1 point** (the instructor's
  decision, 2026-11-18). As in ЛР-4 and ЛР-6, the extra task comes after
  the main part's checks and push, so it moved from §4.7 to §4.9: «Що
  обрати» is now §4.7 and the checks §4.8. Students start it in class only
  once the main part's in-class steps are on GitHub, and it counts only if
  pushed in class. The main part's history is six commits; the package adds
  a seventh. §7 has a
  table for each point, §5 asks whether §4.9 was done, and §6's questions
  on building `@coffee/cart` are asked only of those who did it; the
  questions on packages as a structure stay for everyone, since «Що
  обрати» still offers packages and the article is read before §4.7. The
  in-class part is about 50 minutes by the plan's estimates (below), about
  8 more for §4.9. `STRUCTURES.md` keeps the «Пакет» row and says it is for
  §4.9.
- **§4.7 is done after class, with the report** (the instructor's
  decision, 2026-11-22: the plan's **Timing** cut 1). It keeps its number
  and its place, because the starter's `STRUCTURES.md` points to §4.7 and
  `.dependency-cruiser.cjs` to §4.9, and students already have the starter.
  §4.7 opens by telling students to skip to §4.8 in class; §3, §4.8's
  commit list, §5 and §7 say the §4.7 commit comes last, after class and
  before the report. The in-class estimate drops from 55 to 50 minutes.
- **`check:deps` uses `--output-type err-long`,** so each violation prints
  its rule's Ukrainian comment under it, not only the rule's name.
- **No `graph` script** (the plan's optional Mermaid graph). A collapse
  pattern with `|` breaks in npm scripts on Windows, where `cmd.exe` reads it
  as a pipe; a collapse set in the config would also collapse `check:deps`'s
  own output; and a fixed depth draws the by-type tree file by file.
- **The VS Code setting is `js/ts.updateImportsOnFileMove.enabled`,** as
  VS Code's refactoring page names it today, not the plan's
  `javascript.updateImportsOnFileMove.enabled`.
- **The starter has a `jsconfig.json`** (`include`: `src` and `packages`,
  no `paths`), added after the review on 2026-11-18. Without it VS Code
  keeps loose `.jsx` files in an inferred project made of the open files and
  their imports. A file moved in the explorer is opened, but its importers
  aren't in that project unless some open tab reaches them, so their imports
  stay old. Run through VS Code's bundled TypeScript the way VS Code calls
  it after a move (open the moved file, then `getEditsForFileRename`):
  `components/Button.jsx` → `shared/ui/` updated 0 of 2 importers with
  nothing else open, and the folder `hooks/` → `shared/hooks/` 0 of 10;
  with `App.jsx` open, or with the `jsconfig.json`, all of them. Steiger
  doesn't read `jsconfig.json`, so without `paths` it changes nothing there;
  a student's §4.10 aliases would go into this file. The starter and the
  4.6 and 4.7 stages, re-run with it, pass every check, and Steiger still
  reports a forbidden import.
- **One measurement, not two** (the instructor's decision after the
  review, 2026-11-18). «Прибрати відгуки» (stage the moves, delete the
  reviews, read `git diff --stat`, `--dirstat` and the dead-file warnings,
  `git restore src`) is gone: once §4.7 stopped asking for evidence from the
  lab, its numbers fed nothing, they separated the structures little (see
  `solution/README.md`), and it was the step most likely to go wrong in
  class. «Де живе кошик» stays, and students now write down the folders as
  well as their number, since the kind of folder changes between structures
  more than the count does. `STRUCTURES.md`'s first table is now «Де живе
  кошик», and §6's question on dead files that an `index.js` still
  re-exports went with the step. `not-reachable-from-main` stays in
  `.dependency-cruiser.cjs` as a warning for a file a move leaves behind.
  The minutes saved go to §4.7.
- **§4.2 holds the measurement and one explicit rule:** code doesn't
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
- **§4.6 shows one re-export line and one import rewritten through it**,
  since every slice's `index.js` needs the syntax, the components are
  default exports, and their importers switch to named imports by hand. Its
  example names (`UserCard`, `entities/user`) aren't from this app, so it
  doesn't place a file for the student.
- **Each structure step has «Як діяти» and a folder check** (added on
  2026-11-22 after students said the lab was unclear). §4.4–§4.6 list the
  moves in order; «Рішення» became «Що вирішити» (§4.3: «Що помітити»),
  because it read as "solution" and ЛР-7/8 never used it, and the §4 intro
  says the answers aren't written down. Each «Перевірка» now names the
  folders `src/` may hold: without that line a step has no done signal.
  With only the cart page and `CartLine` moved and every by-type folder
  still there, §4.4's tests, lint and `check:deps` pass, and Steiger says
  «No problems found!» for the 4.6 stage with a leftover `hooks/` and
  `data/` beside the layers. §4.2 says how to find a file's importers
  (**Find File References**; WebStorm **Find Usages**) and to place files
  from the top down. §4.5 names one feature (`features/cart/`), says the
  old `data/` and `hoc/` folders go, and points to ЛР-8 §4.3's `children`
  for the seeded coupling. §4.6 says `app/routes/` becomes `pages/` and
  that the `index.js` files and the imports through them are written by
  hand, in that order, after Steiger's first run.

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
  `not-reachable-from-main` for a file nothing imports any more;
  Steiger's `forbidden-imports`, `insignificant-slice`, `public-api` and
  `no-public-api-sidestep` with the messages §4.6 quotes;
- §4.9: `"file:./packages/cart"` and `npm install` at the root link the
  package with the root `package.json` unchanged; a deep import by name fails
  in `vite build` and Vitest with the message §4.9 quotes; a relative path
  builds and `check:deps` reports it;
- in Edge headless on Vite dev servers (`solution/shots.mjs`): the starter
  and the last stage behave the same: catalogue, ♡, «Додати в кошик» and the
  header's counter, name links, related cards, cart quantities and total,
  «Видалити», the empty state, `NotFound`; no horizontal scroll at 1000 px
  or 390 px; the console shows only `[analytics]` lines;
- the handout's links return 200; bulletproof-react's page still says what
  §4.5 quotes; profy.dev still doesn't resolve, so it stays out.

- `lab-10.zip` (LF only) unpacked into a fresh `react-labs/lab-10/` next to
  `lab-7/` and `lab-8/` from their zips: one `npm install` in the root adds
  all three workspaces (`node_modules` about 175 MB), and the folder passes
  12 of 12 tests, lint, `format:check`, `check:deps` and `build`;
- the site: `npm run check` and `npm run build` pass; the labs index lists
  ЛР-10; the handout has no horizontal scroll at 390 px or 1000 px, and the
  image loads;
- the PDF, built on 2026-11-18 after both code reviews: 17 pages with the
  screenshot, code blocks and tables; every code line sits whole on one
  line, no text runs past the right margin, and §7's two tables end on the
  last page.

Not verified:

- a timed dry run (target: §4.1–§4.8 without §4.7 in about 50 minutes,
  §4.9 in about 8 more; cuts in the plan's **Timing**, where cuts 1 and 3
  are now built in);
- VS Code's import updates in the editor itself, with the `jsconfig.json`:
  close all tabs, drag a file and a folder, and check a closed importer
  and the CSS import in `main.jsx` (only the TypeScript server was run, see
  above; the reference stages were moved by a script that rewrites relative
  imports the same way); WebStorm's **Refactor → Move**; §4.2's **Find File
  References** on a file whose importers are all closed;
- `npm install` with all of ЛР-1–6 present as well;
- Vercel building `lab-10` with the `file:` package;
- §4.10's aliases (the planning prototype showed the `jsconfig.json` trap,
  not a working setup).

## Build

```bash
git add starters/react/lab-10                                # the script packs tracked files only
python docs/web/build-pack.py starters/react/lab-10          # public/uk/react/starters/lab-10.zip
python docs/web/build-handout.py lab-10 react                # public/uk/react/labs/lab-10.pdf, from PowerShell
```

Rebuild the zip after the starter is committed: each entry is dated by the
file's last commit. Rebuild the PDF after every handout edit; the handout's
`handout:` field points to it. Keep code lines within 75 characters, or they
wrap in the PDF, and a URL wraps at its hyphen: with `<username>`, §5's
`GitHub repository:` line for a two-digit lab is 76 characters and broke as
«…/main/lab-» + «10», so ЛР-10 writes `<user>` (72).

To check the stages again: copy the starter into a `react-labs` workspace,
replace `src/`, `package.json` and `index.html` with a stage's copies (and
add `packages/` for §4.9, then `npm install` at the root), and run
`npx vitest run`, `npm run lint`, `npm run format:check`,
`npm run check:deps`, `npm run check:fsd` (from 4.6) and `npm run build`.

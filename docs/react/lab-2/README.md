# Lab 2 — Components, the component tree and props

| Route | Source | What it is |
| --- | --- | --- |
| `/react/labs/lab-2/` | `src/content/labs/react/uk/lab-2.md` | the handout: useful links instead of theory, the starter, four components, the two trees, checks and Vercel, report, defence |
| `/react/labs/lab-2.zip` | `react-lab-2-starter/` | the starter, unpacked by students into `react-labs/lab-2/` |
| `/react/labs/lab-2/result.webp` | the reference solution | the screenshot in the handout's §1 |
| `/react/labs/lab-2.pdf` | built from the handout | the downloadable handout |

`solution/` holds the reference solution (gitignored): `src/` overlays the
starter's `src/`, `extra/` is the optional §4.8 task, and its `README.md`
has the two trees a student should end up with. The plan the lab was built
from is [components-props-plan.md](components-props-plan.md).

## Why it looks like this

- **20–30 minutes, all in class.** Every task (§4.1–4.7) is done during the
  lab session. §7 checks it by the push times on the repository's GitHub
  **Activity** page, not by commit dates, which students set on their own
  machines. The starter carries the configuration, styles and data, so
  students write only components and a few lines of `App`. Each step ends
  with «Що має вийти» in the browser. If a run takes longer, shorten steps
  rather than move them home: drop the trial avatars in §4.3 first, then give
  `Profile` in full.
- **Useful links, no theory section.** §2 lists seven uk.react.dev pages, and
  each task links the one section it needs.
- **Written by hand.** AI completions may stay on; an agent doing the tasks
  is not recommended. The report asks whether an agent was used and for
  what, and the defence asks students to explain their code.
- **The react.dev examples.** `Avatar` with `person` and a default `size`,
  `Profile` and `Card` with `children` come from «Передача пропсів до
  компонента», so the reading and the tasks line up.
- **The tree is given, not derived.** §1 shows it compactly (`Profile × 4`);
  students write the expanded render tree from DevTools and the module tree
  from the imports. Finding a tree in a mockup is ЛР-3 (Thinking in React).
- **§4.4 keeps the lead's trial avatar.** Replacing both trial avatars would
  leave an unused `Avatar` import, and lint would fail until §4.5 brings it
  back.
- **The zip is `lab-2.zip` with files at its root.** File managers unpack it
  into a folder named `lab-2`, which students move into `react-labs/`. The
  handout warns against `tar -xf` in the repository root, which would
  overwrite the root `package.json` and `.gitignore`, and checks
  `git status -u`.
- **The starter commit is made in the root,** so it includes the root
  `package-lock.json`. The dev server occupies one terminal, so the handout
  opens a second one for git.
- **No lockfile in the starter.** Its `package.json` uses the versions ЛР-1
  verified, so `npm install` in the root adds only the `lab-2` workspace.
- **The PDF embeds the screenshot from `public/`.** `build-handout.py` points
  site-relative images at the local `public/` folder, so the PDF shows them
  before they are deployed; links still go to the live site. Images are
  capped at 3.8 in high so the screenshot fits on page 1 under §1's text.

## Verified on 2026-11-04

On Windows 11 with Node.js 24.20 and npm 11.19, in a `react-labs` repository
built as ЛР-1 describes (`lab-1` from the `create-vite` 9.3.3 React template
with Prettier 3.9.10 and `eslint-config-prettier` 10.1.8; React 19.3.1,
Vite 8.3.5, ESLint 10):

- the unzipped starter passes `npm run lint`, `npm run format:check` and
  `npm run build`. `npm install` in the root adds 24 lines to
  `package-lock.json` (the `lab-2` workspace and its link) and no packages;
- `App.jsx` and the components typed as §4.2–4.5 give them pass lint and
  Prettier at every stage, and so do the §4.8 extra and a `README.md` with
  both trees filled in;
- a clone made with `core.autocrlf=true` checks out LF and passes
  `npm run format:check`;
- the uk.react.dev titles and section anchors in §2 and the «Довідка» links
  exist;
- the site passes `npm run check` and `npm run build`, and the zip, the image
  and the ЛР-1 link get the base path;
- the §4.6 DevTools steps, in Chrome 156 with React DevTools 8.0.0, driven
  with real mouse and keyboard events: each `Profile` shows its `key`, only
  the lead's `Avatar` has `size` in its props, and **rendered by** shows
  `App`. A double-click selects `120`, so typing `200` resizes the avatar,
  and a reload restores 120; a single click only places the caret and gives
  `120200`, which is why §4.6 asks for a double-click. Version 8 names the
  tab «Components ⚛» and puts the React tabs after the built-in ones, so a
  narrow DevTools moves them into the `»` menu.

Not verified:

- a timed dry run of the whole lab by someone following the handout;
- the §4.6 steps in Edge, which loads the same React panels;
- the default folder names from Windows **Extract All** and macOS Archive
  Utility;
- the second Vercel project from the same repository, and whether the root
  `package-lock.json` change in the starter commit also rebuilds
  `react-lab-1`.

## Build

```bash
git add react-lab-2-starter                                  # the script packs tracked files only
python docs/web/build-pack.py react-lab-2-starter react      # public/react/labs/lab-2.zip
python docs/web/build-handout.py lab-2 react                 # public/react/labs/lab-2.pdf
```

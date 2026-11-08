# Lab 5 — Events, controlled and uncontrolled components

| Route | Source | What it is |
| --- | --- | --- |
| `/react/labs/lab-5/` | `src/content/labs/react/uk/lab-5.md` | the handout: useful links instead of theory, a table booking form made to work one event at a time (submit, a controlled comment, `Ctrl+Enter`, the guests stepper, reset), checks and Vercel, an ungraded extra, report, defence |
| `/uk/react/starters/lab-5.zip` | `starters/react/lab-5/` | the starter, unpacked by students into `react-labs/lab-5/` |
| `/uk/react/labs/lab-5/result.webp` | the reference solution | the form after a booking, in the handout's §1 |
| `/uk/react/labs/lab-5.pdf` | built from the handout | the downloadable handout |

`solution/` holds the reference solution (gitignored): `stage-42/` to
`stage-45/`, `src/` and `extra/` overlay the starter's `src/` for each step,
the 1-point lab and the extra task; its `README.md` has the filled-in README
table, what the native reset leaves and why, the other measured behaviour and
defence notes; `shots.mjs` checks every stage in headless Edge and takes the
screenshot. The repository is public and the defence asks for those reasons,
so they stay in `solution/`, not in this README or the plan. The plan the lab
was built from is
[events-and-controlled-components-plan.md](events-and-controlled-components-plan.md).

## Why it looks like this

- **A new app, not ЛР-4's menu.** The menu has one field, already
  controlled. A form with a submit and a reset is where both kinds of field
  matter. The café's look and name carry over from ЛР-3–4.
- **Browser first, then React.** §4.1 has students submit the bare form and
  watch the reload, the query string and «+» submitting it; each later step
  takes over one piece of that.
- **Both meanings of «контрольований».** Fields (the name stays
  uncontrolled, the comment becomes controlled) and a component
  (`GuestsStepper` keeps its own state in §4.5 and gets `value` + `onChange`
  in §4.6, named after `<input>`'s props).
- **`FormData` reads the fields; the ref moves focus.** That is how react.dev
  reads uncontrolled fields today, and what ЛР-6's Actions will receive.
  `useRef` appears where a ref is the right tool, focusing the name after a
  reset.
- **The native reset button.** `type="reset"` with `onReset` shows which
  values the browser owns and which React owns before students write a
  handler.
- **`Ctrl+Enter` on the `<form>`, not the field:** one step covers the
  keyboard, propagation and `target` against `currentTarget`.
- **`aria-disabled` at the stepper's limits, not `disabled`:** a focused
  button that becomes disabled loses focus. The handout says so in §4.5.
- **The starter's stepper buttons have no `type` on purpose,** for §4.1;
  the handout says so there.
- **ESLint is part of the check.** `eslint-plugin-react-hooks` 7 reports
  `onClick={handler()}` and `onSubmit={handleSubmit()}` as
  `react-hooks/set-state-in-render` and a ref read during render as
  `react-hooks/refs`; the handout names both, and §7 asks for no warnings.
- **The README table is filled step by step** (§4.3, §4.5, §4.6) and goes
  into each step's commit, so §4.7 has no separate docs commit.
- **No validation beyond `required`**: Zod, React Hook Form and Actions are
  ЛР-6's.
- **No +1 task.** The programme gives each lab 1 point; §4.8 is ungraded.
- **§4.5's notes come before the `GuestsStepper` listing.** Code blocks
  don't split across PDF pages, and the 45-line listing jumped to the next
  page and left most of page 8 empty. With the notes first, the PDF has 16
  pages: page 8 ends halfway, before the listing, and §7 fits on the last
  page.
- **The PDF was built after the handout's review.** It embeds the
  screenshot from the local `public/` folder.

## Verified on 2026-11-08

On Windows 11 with Node.js 24.20 and npm 11.19, in a `react-labs` workspace
with ЛР-1's tooling (React 19.3.1, Vite 8.3.5, ESLint 10,
`eslint-plugin-react-hooks` 7.1.1, Prettier 3.9.10):

- `lab-5.zip` unpacked into `lab-5/` passes `format:check`, `lint` and
  `build`; it stores LF only;
- every stage (the starter, §4.2, §4.3, §4.4, §4.5, §4.6, §4.8) passes
  Prettier, ESLint with no problems and the build. ESLint reports the
  mistakes the handout names (`set-state-in-render` for a called handler,
  `react-hooks/refs` for a ref read during render);
- every code block in the handout matches the tested stages;
- in Edge headless, on Vite dev servers (`solution/shots.mjs`), each step
  behaves as its «Що має вийти» says, with no React warnings in the console:
  - §4.1: the browser's own validation, the reload with the query string,
    and «+» submitting the form;
  - §4.2–4.4: no reload; the confirmation with the plural forms and the
    date in words; the counter and `maxLength`; `Ctrl+Enter` and `⌘+Enter`
    submit from any field, with the browser's validation, and add no line
    break; `Enter` alone adds one in the comment;
  - §4.5–4.6: the stepper's limits; focus stays on «+» at 8 with
    `aria-disabled` and is lost with `disabled`; the native reset in step 1
    and the full reset after `onReset`, with focus on the name;
  - the README table's render column, the hook lists and the props, recorded
    in `solution/README.md`;
  - §4.8: `F5` asks before leaving while the form has unsent changes, and
    doesn't after a submit; without the cleanup it still asks;
- the site: `npm run check` and `npm run build` pass; the labs index lists
  ЛР-5; the handout has no horizontal scroll at 390 px, and the screenshot
  loads;
- the PDF: 16 pages with the screenshot, code blocks and tables; no code
  block or table row is split across pages;
- the readings' languages and anchors (2026-11-08): «Реагування на події»
  and «Поширення стану між компонентами» are Ukrainian; the `<input>`
  reference, Manipulating the DOM with Refs and Synchronizing with Effects
  are English only; the legacy «Форми» and «Неконтрольовані компоненти» are
  Ukrainian; MDN has no Ukrainian versions of the pages linked.

Not verified:

- a timed dry run (target: §4.1–4.7 in 28 minutes or less);
- the React DevTools 8 panel itself: the hook lists and props were read from
  React's fibers, and the render column with counters in each component,
  not with the **Highlight updates** outlines (which ЛР-4 checked exist);
- `Ctrl+Enter` from a real keyboard on Windows, and `⌘+Enter` on macOS; the
  check sent the key events through the DevTools protocol;
- Firefox and Safari, including `Ctrl+Enter`: if it adds a line break in
  the comment, or runs `handleSubmit` twice from a one-line field (the
  browser's own `Enter` submission on top of `requestSubmit()`), add
  `e.preventDefault()` before `requestSubmit()` in §4.4;
- a screen reader announcing `role="status"` and the `<output>`;
- the fifth Vercel project;
- Windows **Extract All** and macOS Archive Utility folder names.

## Build

```bash
git add starters/react/lab-5                                 # the script packs tracked files only
python docs/web/build-pack.py starters/react/lab-5           # public/uk/react/starters/lab-5.zip
python docs/web/build-handout.py lab-5 react                 # public/uk/react/labs/lab-5.pdf, from PowerShell
```

Rebuild the zip after the starter is committed: each entry is dated by the
file's last commit, and a file with no commit yet keeps its modification
time. Rebuild the PDF after every handout edit; the handout's `handout:`
field points to it.

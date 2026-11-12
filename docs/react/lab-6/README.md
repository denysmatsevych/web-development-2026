# Lab 6 — Complex forms and validation

| Route | Source | What it is |
| --- | --- | --- |
| `/react/labs/lab-6/` | `src/content/labs/react/uk/lab-6.md` | the handout: useful links instead of theory, ЛР-5's booking form given a Zod schema, React Hook Form, error messages with ARIA and an Action with a fake server; checks and Vercel; +1 in class for a newsletter form on `<form action>`, +1 at home for the same form with other libraries; report, defence |
| `/uk/react/starters/lab-6.zip` | `starters/react/lab-6/` | the starter, unpacked by students into `react-labs/lab-6/` |
| `/uk/react/labs/lab-6/result.webp` | the reference solution | the form after a submit with errors, in the handout's §1 |
| `/uk/react/labs/lab-6.pdf` | built from the handout | the downloadable handout |

`solution/` holds the reference solution (gitignored): overlays of the
starter's `src/` for §4.2, §4.3, §4.4, §4.5 (the 1-point lab) and §4.7, a
reference §4.8 version with Formik and Yup and its filled-in comparison;
its `README.md` has what renders when, the measured behaviour, the pitfalls
§4.8 runs into and defence notes; `shots.mjs` checks every stage in headless
Edge and takes the screenshot. The repository is public and the defence asks
for those reasons, so they stay in `solution/`, not in this README or the
plan. The plan the lab was built from is
[complex-forms-and-validation-plan.md](complex-forms-and-validation-plan.md).

## Why it looks like this

- **ЛР-5's form, not a new app** (the instructor's decision). `register`
  takes over ЛР-5's uncontrolled fields, `Controller` takes `GuestsStepper`
  with the `value`/`onChange` contract ЛР-5 §4.6 gave it, and React Hook
  Form's `reset`, `setFocus` and `useWatch` replace code students wrote by
  hand a week earlier.
- **One schema for the form and the fake server.** `api.js` runs
  `bookingSchema.safeParse` itself and has one rule the client can't know
  (19:00 is full), which is why the form needs an error state from the
  Action.
- **The schema first, in the console.** §4.2 checks it with `safeParse`
  before any UI uses it. At that step nothing imports `zod` yet, so Vite
  discovers it on the first `import()` and reloads the page; the handout
  says to type the line again.
- **`onSubmit={handleSubmit(onValid)}` with `startTransition`, not
  `<form action>`.** React Hook Form validates first, and `<form action>`
  would reset the uncontrolled fields after every action. §4.7 shows that
  reset on a form where it helps.
- **«Очистити» becomes a plain button.** React Hook Form's `reset()` calls
  `form.reset()`, so ЛР-5's `onReset` handler would run after every
  successful booking. The handout gives the reason in §4.3.
- **`useWatch`, not `watch`.** `watch()` raises
  `react-hooks/incompatible-library`, and §7 asks for no warnings. The
  plugin's list of incompatible libraries names React Hook Form, TanStack
  Table and TanStack Virtual only, so §4.8's libraries can pass too.
- **Messages outside the `<label>`, tied with `aria-describedby`;**
  `required` kept next to `noValidate`; the server's reply in ЛР-5's
  `role="status"`; `aria-disabled` while pending, for ЛР-5's focus reason.
- **No README table this time.** ЛР-5's "who owns each value" became defence
  questions, and §4.8's comparison covers renders.
- **Extra points:** §4.7 in class and §4.8 at home, 1 point each above the 65
  for current work, as ЛР-4's +1. The plan's proposed decisions 7–15 were
  built as proposed.
- **The PDF was built after the instructor's first review edit.** It embeds
  the screenshot from the local `public/` folder.

## Where the build differs from the plan

- **§4.2 warns about Vite's reload** on the first console `import()`, and
  has students break the object's lines with `Shift+Enter`. The plan
  expected the import to just work: its prototype already imported the
  schema from a component.
- **§4.2's schema listing sits outside the numbered steps.** Inside a list
  Prettier formats a code block narrower than the file, and the listing
  would differ from what students' editors produce on save.
- **Every code line fits the PDF's code box, 75 characters,** so none wraps
  in print: the schema's comment message is «Коментар — до 200 символів»,
  its object-level `refine` takes `data`, the function `useActionState`
  returns is `dispatch` (react.dev's examples use the same name), the
  action's comment is reworded, and §4.5's main listing sits outside the
  numbered steps.
- **§4.4 re-checks the time from the date's `onChange`** with
  `trigger('time')`, once the time has a value, instead of the plan's
  `deps: 'time'`. Changed after the PR review; the defence asks why, so the
  reason is in `solution/README.md`.
- **`onValid(data)`, not `onValid(booking)`:** in §4.3 a `booking` parameter
  would shadow the `booking` state.
- **§4.8 runs `npm install` before swapping libraries.** On a workspace npm
  hasn't installed yet, `npm uninstall … -w lab-6-alt` reports "up to date"
  and changes nothing (measured).
- **§4.8's comparison table also asks for `handleSubmit`,** which is where
  most of the difference between form libraries shows.
- **`SubscribeForm`** has `autoComplete="email"` and styles a refusal like
  the booking form's (`status error`).
- **Decision 2's premise was measured** in Edge: what a fast double click
  sends is in `solution/README.md`. The decision stands (no ref, no
  `disabled`), and the plan's wording is unchanged.
- **Length:** the handout is about 6,000 words by `wc -w` (code and tables
  included), against the plan's 4,500–5,000; ЛР-5's is about 3,900.

## Verified on 2026-11-12

On Windows 11 with Node.js 24.20 and npm 11.19, in a `react-labs` workspace
with ЛР-1's tooling (React 19.3.1, Vite 8.3.8, ESLint 10.14,
`eslint-plugin-react-hooks` 7.1.1, Prettier 3.9.10), React Hook Form 7.92.0,
Zod 4.6.7, `@hookform/resolvers` 7.0.6, and for §4.8 Formik 2.4.9 and Yup
1.7.1:

- the versions on npm are unchanged since the plan;
- `lab-6.zip` (16 files at the root, LF only, a rebuild is byte-identical)
  unpacked into a fresh `react-labs/lab-6/`: one `npm install` in the root
  adds the workspace and the three packages, and the folder passes
  `format:check`, `lint` and `build`;
- every stage (the starter, §4.2, §4.3, §4.4, §4.5, §4.7) and the reference
  §4.8 version pass Prettier, ESLint with no problems and the build;
  `watch('comment')` raises `react-hooks/incompatible-library`;
- every code block in the handout matches the tested stages; the console
  lines in §4.2 were run through the DevTools protocol;
- in Edge 157 headless, on Vite dev servers (`solution/shots.mjs`), each
  step behaves as its «Що має вийти» says, with no React warnings in the
  console; the steps that make students break something (dispatching
  without `startTransition`, the past-time message without the date's
  `onChange`, §4.7
  without `defaultValue`) behave as the handout says too. Results, renders
  and the cases kept for the defence are in `solution/README.md`;
- Zod in Node: the object-level `refine` runs next to field errors;
  `trim()` and `z.coerce.number()` change the parsed data;
- the readings: pages return 200, and the anchors the handout links
  (React Hook Form's Get Started and `#mode`, Zod's `#strings`, `#numbers`,
  `#coercion`, `#refinements`, `#emails`, the resolvers' `#zod`,
  `useActionState`'s four, `<form>`'s two) exist;
- the site: `npm run check` and `npm run build` pass; the labs index lists
  ЛР-6; the handout has no horizontal scroll at 390 px (tables and code
  blocks scroll inside their boxes), and the screenshot loads;
- the PDF: 23 pages with the screenshot, code blocks and tables; no code
  line wraps (the code box holds 75 characters); the only code block split
  across pages is §4.7's 52-line `SubscribeForm` listing, which is taller
  than a page.

Not verified:

- a timed dry run (target: §4.1–4.6 in 30 minutes or less, §4.7 in about 8
  more; cuts in the plan's **Timing**);
- a real DevTools console session for §4.2 (`Shift+Enter`, the reload as a
  student sees it) and the React DevTools 8 panel itself: the hook lists
  were read from React's fibers;
- a screen reader (NVDA or Narrator) reading the message with the focused
  field and the server's reply;
- the cross-field rule around midnight;
- Firefox and Safari;
- the sixth and seventh Vercel projects.

## Build

```bash
git add starters/react/lab-6                                 # the script packs tracked files only
python docs/web/build-pack.py starters/react/lab-6           # public/uk/react/starters/lab-6.zip
python docs/web/build-handout.py lab-6 react                 # public/uk/react/labs/lab-6.pdf, from PowerShell
```

Rebuild the zip after the starter is committed: each entry is dated by the
file's last commit, and a file with no commit yet keeps its modification
time. Rebuild the PDF after every handout edit; the handout's `handout:`
field points to it. Keep code lines within 75 characters, or they wrap in
the PDF.

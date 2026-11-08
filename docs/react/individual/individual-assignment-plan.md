# Plan: React ІЗ «Індивідуальне завдання» (Ukrainian version)

Status: written on 2026-11-07, revised the same day with the instructor's
answers, approved, and built that evening on branch
`feat/react-individual-assignment`. The PDF was added on 2026-11-08, after
the instructor's review of the page. What was verified and what wasn't is in this folder's
[README.md](README.md), which holds the facts that last.

Deviations from the plan:

- **Next.js's error file retries through `retry`,** not `reset`: Next.js
  16.4's docs use `retry`.
- **MockAPI.io is out of the topic table.** Its free plan couldn't be
  checked, and the JSON file database covers a student's own data.
- **Platzi's docs link is `api.escuelajs.co/docs`:** the old
  `fakeapi.platzi.com` domain no longer resolves.
- **No English route.** The English labs index lists card `00` and links the
  Ukrainian page; `/en/react/labs/individual/` isn't generated.
- **The grade bands use word joiners** (`61&#8288;–&#8288;67`), so the
  table cell doesn't break after the dash.
- **A second email.** The submission section also gives the subject line
  for agreeing the topic (step 1), not only for the submission.
- **The instructor's review (2026-11-08):**
  - the summary is now §1's "who it's for" paragraph, which then left §1;
  - from C, §3.2 asks for «складніше рішення» rather than a new topic, and
    §4.3 no longer repeats it;
  - the defence-question section (§7) is gone, so sections 8–9 became 7–8;
  - the ladder's "Також" column says only "2 презентації" and "Усний
    захист";
  - the "rules for every tier" lead-in, the no-numbers sentence in §3.2 and
    the JSON-vs-`.txt` paragraph are gone;
  - the JSON file is described as a localhost tool, with no mention of
    hosting json-server elsewhere;
  - at A, students on Redux Toolkit use RTK Query in place of TanStack
    Query.
- **The PR #53 review (2026-11-08):**
  - §2: when a higher tier replaces a tool, the new tool meets the lower
    tier's requirement;
  - the JSON file database (§3.3) is gone: from C the API must accept
    writes, real or simulated, so read-only APIs (TVmaze, PokéAPI) fit E
    and D only and topic 6 left the table;
  - §4.5: the C-level custom hook may wrap the library's query hook, and
    «до» with React Compiler on from the start is a run with it off.

## Context

The approved programme grades the React course as a 100-point sum: labs 25,
two module tests 20, presentations 20 and the exam 35 ([course-plan.md](../course-plan.md),
section «Порядок оцінювання результатів навчання»). The programme's policy
lets students on an individual plan agree their assignments with the
instructor. The ІЗ is that agreed assignment.

Decided by the instructor on 2026-11-07:

- **Who it's for:** students on an individual plan only. They do no labs
  and no module tests.
- **How it's graded:** the student builds one React app, and the highest
  tier they reach and defend sets the course grade through its ECTS band.
- **When:** the work is due on **21.12.2026** and defended at the exam on
  **24.12.2026**.
- **It is not the final project.** The final project (ЛР 21–27) is for
  everyone on the regular route and gets its own task, written separately.

The Web Dev ІЗ ([individual.md](../../../src/content/labs/web-development/uk/individual.md))
is the model for the page's shape: topic, aim, requirements, topic table,
stages, deliverables, defence, submission. The React one replaces its
100-point rubric with the tier ladder below. It follows the React labs'
conventions: a dated note on versions, links instead of a theory section,
a defence section of grouped job-interview questions, and a README that sums
up what was done rather than analysing it.

The site already supports this. A `labs` entry with `kind: individual` and
`number: 0` is listed first as card `00` and routed at
`/react/labs/individual/`, and it is left out of the lab-to-lab prev/next
chain (`src/lib/labs.ts`, `src/pages/[...locale]/[course]/labs/index.astro`).
No code change is expected.

## The ladder

Approved on 2026-11-07. Each tier includes everything above it. There are no
minimum counts: the requirements say what the app has, not how many.

| Tier | Band | App | Other |
| --- | --- | --- | --- |
| E | 61–67 | A React app on Vite or Next.js: components and props, `useState`/`useEffect`, events, lists with keys, a controlled form, deployed on Vercel. README with the component tree in Mermaid | Oral defence |
| D | 68–75 | + Routing (React Router or the Next.js App Router) with several routes, one with a route param. A public REST API: list + detail, loading/error/empty states, an API module, cleanup of requests made in the browser | Oral defence |
| C | 76–82 | + `useReducer` or Context for shared state, a custom hook, a React Hook Form + Zod form that sends a write request, a clean axe run, a data-flow diagram in Mermaid | 2 presentations; a new, complex topic; oral defence |
| B | 83–90 | + one of Zustand, Redux Toolkit or Jotai, plus a justified React design pattern | Oral defence |
| A | 91–100 | + TanStack Query in place of the hand-written fetching, memoization proven in the React Profiler, Vitest + React Testing Library tests, strict TypeScript | Oral defence, which also covers trade-offs and alternatives |

Rules that apply to every tier (handout §2):

1. **The grade is the highest tier whose requirements are all met and
   defended.** A student who submits a B app but can't explain its state
   library gets C.
2. **The defence gates the grade.** A student who can't defend E gets FX and
   retakes at the exam retake.
3. **The implementation and the defence together place the student inside
   the band.** A tier that is fully and cleanly implemented and confidently
   defended lands near the top. One met with rough edges, or whose answers
   need prompting, lands near the bottom. There is no points formula.
4. **A live change without the AI agent**, about 5 minutes: for example,
   "add a filter" or "move this state up".

## Requirements by tier (handout §4)

The handout gives each tier as a checklist the student can tick off.

**E**

- A React app in its own GitHub repository, on Vite or Next.js (see «Vite
  or Next.js»). JavaScript or TypeScript; TypeScript is allowed from the
  start, so A doesn't force a rewrite.
- Own components that take props.
- `useState` and `useEffect`. The effect does real work, such as syncing to
  `localStorage` or the document title. At this tier the data may come from
  a local module or an API.
- Event handlers, a list rendered with stable keys, and a controlled form.
- `npm run lint` passes, and the code is formatted with Prettier. For Vite
  the handout links ЛР-1 for the setup, since these students skip the labs;
  Next.js comes with its own ESLint setup.
- Deployed on Vercel.
- README: what the app does, how to run it, the Vercel address, the component
  tree as a Mermaid `flowchart TD` that renders on GitHub, a short summary of
  what was done, and the AI-use record that the course policy requires (tool,
  what it was used for).

**D**

- Routing with several routes, a detail route with a param, and a 404 page.
  A Vite app adds a `vercel.json` rewrite, so a deep link survives a page
  refresh.
- A public REST API with no secret key in client code: `VITE_` and
  `NEXT_PUBLIC_` variables end up in the bundle.
- A list endpoint, and a detail page loaded by the id from the route param.
- Requests in an API module (`fetch` or Axios), not inline in components.
- Loading, error (with a retry) and empty states.
- Requests made in the browser are cleaned up in `useEffect`
  (`AbortController` or an `ignore` flag), so fast navigation never shows
  stale data (topic П2.4 covers this). Data that Next.js fetches in Server
  Components needs no cleanup.

**C**

- A new, complex topic (see «Topics»).
- Shared state through `useReducer` and/or Context, read by components in
  different branches of the tree (a cart badge in the header and the cart
  page, for example).
- A custom hook that removes real duplication.
- A React Hook Form + Zod form:
  - schema validation, with error messages tied to their fields
    (`aria-invalid`, `aria-describedby`);
  - sends a POST, PUT, PATCH or DELETE request (with a read-only API, to
    the JSON file database; see «Topics»);
  - shows success and handles a server error.
- axe DevTools shows no violations on any route, and the main scenario
  works with the keyboard alone. README records the axe result.
- A data-flow diagram in Mermaid: where each piece of state lives and how
  props, context and actions move it.
- 2 presentations, topics from the course plan's table agreed with the
  instructor, defended under the programme's rules. No minimum score.

**B**

- Shared client state in Zustand, Redux Toolkit or Jotai. Server data stays
  in the API layer. The defence compares the result with the C version in
  Context.
- A pattern from Lecture 3 that solves a real problem in the app:
  Container/Presentational, Render Props, HOC or Compound Components. Custom
  hooks don't count, since C already requires one. README says why it beats
  the plain approach. HOCs and render props were largely replaced by hooks,
  so one forced in for the grade doesn't count.

**A**

- TanStack Query replaces the hand-written fetching: queries with keys, a
  mutation for the C form, and invalidation after it.
- A re-render problem found and fixed, measured in the React Profiler, with
  before/after numbers or screenshots in the README. The fix may be
  `React.memo`/`useMemo`/`useCallback` or the React Compiler.
- Vitest + React Testing Library tests for the main scenarios, including the
  form and an async request with a mocked API. `npm test` passes.
- TypeScript with `strict: true`, no `any`, typed props, state and API
  responses, and a clean `tsc` run.

## Vite or Next.js (handout §4, before the tiers)

Students may build the app on Vite or on Next.js. Regular-route students
meet Next.js in ЛР 20; students on an individual plan skip the labs, so the
handout links the Next.js docs, and ЛР 20 once it exists. The tiers stay the
same; where a requirement looks different in Next.js, the handout gives both
forms in one table:

| Requirement | Vite | Next.js |
| --- | --- | --- |
| Lint (E) | ESLint + Prettier as in ЛР-1 | create-next-app's ESLint + Prettier |
| Routing (D) | React Router: a param route, a 404 route, a `vercel.json` rewrite | App Router: a dynamic segment `[id]`, a `not-found` page; no rewrite needed |
| Fetching (D) | An API module; `useEffect` with cleanup | An API module; fetch in a Server Component, or in a client component with `useEffect` cleanup |
| Loading / error / empty (D) | Component state | `loading` and `error` files (retry through `retry`), the empty state in the component |
| Public variables (D) | `VITE_` | `NEXT_PUBLIC_` |
| JSON file database (C) | json-server on `db.json` | A Route Handler or Server Action writing `db.json` |
| TanStack Query (A) | Replaces the hand-written fetching | Handles the client-side data: queries, the C form's mutation, invalidation |
| Tests (A) | Vitest + React Testing Library | The same, for client components; Vitest doesn't run async Server Components |

## Topics (handout §3)

- **E and D** may reuse the student's Web Dev ІЗ topic, API and styles,
  since those projects are small. The React code is new. The handout points
  to the Web Dev topic table instead of copying it.
- **From C** the student needs a new, complex topic. "Complex" means:
  - related entities (products and carts, posts and comments);
  - routes beyond a list and a detail page;
  - a write flow;
  - shared state that components in different parts of the tree read.

  These are descriptions, not counts.

The C+ topic table needs APIs that accept writes or simulate them. Candidates
to check live at build time:

| Topic | API | Writes |
| --- | --- | --- |
| Online shop: catalogue, cart, checkout | DummyJSON products + carts | `POST /carts/add` (simulated) |
| Recipe book with a meal plan | DummyJSON recipes | `POST /recipes/add` (simulated) |
| Blog: posts, comments, authors | DummyJSON or JSONPlaceholder | simulated |
| Task board (kanban) | DummyJSON todos | add / update / delete (simulated) |
| Shop with sign-in | Platzi Fake Store API | real CRUD, periodic resets |
| Own domain | MockAPI.io | real, persisted (check free-tier limits) |

DummyJSON's `/auth/login` also allows a protected route; the ladder doesn't
require one.

**Writes with a read-only API: a JSON file as the database.** A student
whose API only reads (TVmaze, PokéAPI) stores the C form's data in a
`db.json` file in the repository:

- a Vite app runs json-server on it (`npx json-server db.json`). That gives
  real REST endpoints (GET, POST, PUT, PATCH, DELETE) and rewrites the file
  on every change, so the student sees the write land in the file;
- a Next.js app writes the file from a Route Handler or a Server Action with
  `fs`.

JSON rather than `.txt`: json-server and `JSON.parse` read it as is, while a
`.txt` file needs its own format and parser.

**On Vercel the file can't be written.** A Vercel deployment's filesystem is
read-only at runtime; only `/tmp` is writable, and it is temporary and
separate for each instance. So the writes are **local only**: the student
shows the write flow from the local dev server at the defence. On the Vercel
deployment the form shows its error state, and the README says why.

Hosting json-server elsewhere, so the deployed app saves too (Render's free
tier, for example), is optional and not required. The handout mentions it
in one line, without a walkthrough.

## Stages (handout §5)

Students on an individual plan don't attend the labs, so the stages are
steps, not class slots.

| Step | What | When |
| --- | --- | --- |
| 1. Topic | Topic and target tier agreed with the instructor by email | At the start; early enough to book presentations for C+ |
| 2. Build | Tiers in order, E → D → C → B → A; each one working and deployed before the next | Through the semester |
| 3. Submit | Email with the repository, the Vercel address and the tier | By **21.12.2026** |
| 4. Defend | Oral defence and live change | At the exam, **24.12.2026** |

**Presentations come first.** They are defended at the lectures on their
topics, during the semester, so a student aiming at C or higher has to book
two topics early. The handout says so at the top of §2.

The body opens with the deadline blockquote `> **Термін здачі:** 21.12.2026.`,
which the handout script turns into the green deadline line.

## Handout: `src/content/labs/react/uk/individual.md`

Frontmatter:

```yaml
kind: individual
number: 0
title: "Індивідуальне завдання"
summary: "Для студентів з індивідуальним планом навчання. Власний застосунок на React: оцінку визначає рівень від E до A, якого ви досягли й захистили, — від компонентів і стану до стейт-менеджерів, TanStack Query, тестів і TypeScript."
discipline: "«Розробка вебзастосунків на React»"
level: "3 курс, спеціальність «Комп'ютерні науки»"
format: "Індивідуально"
duration: "Протягом семестру"
updated: <build date>
```

`handout:` is added with the PDF.

Body:

1. **Мета.** Who the task is for (students on an individual plan, in place
   of labs and module tests), one paragraph of aim, and the expected result.
2. **Як формується оцінка.** The ladder table and the four rules; the note
   that presentations come first.
3. **Тема.** The reuse rule, what "complex" means and the C+ topic table.
4. **Вимоги за рівнями.** The Vite / Next.js table, then 4.1 E … 4.5 A as
   checklists.
5. **Етапи виконання.** The step table.
6. **Що подати.** The repository, the Vercel address, and the README's
   contents for each tier, including the AI-use record.
7. **Усний захист.** One intro sentence: the instructor may ask to show an
   answer in code or DevTools, or to change the code live. Then grouped
   interview questions, one group per tier. Students prepare the groups up
   to their tier, and each question is answerable from that tier's
   requirements:
   - E: JSX, components and props, state, effects, lists and keys,
     controlled inputs;
   - D: routing, fetching in effects, race conditions, loading and error
     states, what a client bundle exposes;
   - C: `useReducer` vs `useState`, Context and prop drilling, custom hooks,
     form validation, accessible errors, data flow;
   - B: state managers compared, the chosen pattern vs hooks;
   - A: server vs client state, caching and invalidation, re-renders and
     memoization, the React Compiler, testing async UI, strict typing.
8. **Подання.** The subject line `[React] Індивідуальне завдання`, with
   `GitHub repository:`, `Vercel:` and `Рівень:` lines, as in the labs'
   emails.
9. **Корисні посилання.** Grouped by tier:
   - ЛР-1 for the tooling;
   - react.dev, React Router, React Hook Form, Zod, axe DevTools;
   - Zustand / Redux Toolkit / Jotai, TanStack Query, React Profiler;
   - Vitest, React Testing Library;
   - Next.js (App Router), json-server;
   - the Vercel SPA rewrite and Mermaid flowcharts.

The version note lists the libraries in the ladder at the versions current
on the build day; check them then rather than copying them from this plan.

## Files to create or change

| File | Change |
| --- | --- |
| `src/content/labs/react/uk/individual.md` | New: the handout |
| `docs/react/individual/README.md` | New: versions and APIs checked, decisions |
| `docs/react/course-plan.md` | A row in «How the site maps to the plan»; a note under the grading section: students on an individual plan take the ІЗ instead of labs and module tests, and the final project gets its own task. In «Політики курсу», drop «still sit current control», so the sentence reads «Students on an individual plan agree their assignments with the teacher and sit the exam.» |
| `public/uk/react/labs/individual.pdf` | After the instructor reviews the page: `python docs/web/build-handout.py individual react`, then `handout: /uk/react/labs/individual.pdf` |

Expected unchanged: `src/content.config.ts`, `src/lib/labs.ts`, the labs
index.

**The labs index lead.** The shared lead `labsLeadWithIndividual` says the
ІЗ «виконується протягом семестру». On the React page every student sees
it, but only students on an individual plan do the task. The card summary
opens with who it's for. If the lead still reads as "everyone", reword the
shared string so it fits both courses; that is a separate, small change.

The English version is a separate translation PR, by the rules in README →
**Languages and translations**. Until then the English labs index lists the
card and links the Ukrainian page.

## Verification

- `npm run check && npm run build`.
- `/react/labs/`: card `00` comes first and the lead switches to the ІЗ
  wording. `/react/labs/individual/` renders and appears in no prev/next
  link; the English index lists the card.
- Headless Edge at 390 and 1280 px: no page-level horizontal scroll; wide
  tables scroll inside their box.
- Every external link resolves.
- Each C+ API is checked live: no key needed, CORS works from a browser
  origin, and the write endpoints answer.
- Any example Mermaid diagram in the handout renders (pinned mermaid, headless
  Edge). Examples come from a different app, so they don't give away a
  student's answer.
- The `vercel.json` rewrite matches Vercel's current docs for Vite with
  client-side routing; ideally deployed once.
- json-server and a Next.js Route Handler each write `db.json` locally.
  Vercel's docs still describe a read-only filesystem.
- The Next.js column matches the current Next.js docs: the `loading`,
  `error` and `not-found` files, and Vitest's support for Server
  Components.
- Optional dry run: an agent builds an A-tier app from the handout alone in
  a scratch folder. The run shows unclear requirements and roughly how much
  work each tier takes.

## Decisions

Decided by the instructor (2026-11-07):

- the ladder and bands above, E to A, each tier cumulative, with no minimum
  counts;
- the ІЗ is for students on an individual plan, in place of labs and module
  tests; the tier sets the course grade;
- the ІЗ is not the final project, which gets a separate task;
- due 21.12.2026, defended at the exam on 24.12.2026;
- an oral defence at every tier;
- the app may be built on Vite or Next.js;
- a student with a read-only API writes to a JSON file database, locally
  only; hosting json-server elsewhere is optional;
- 2 presentations required from C, with no minimum score;
- E and D may reuse the Web Dev ІЗ topic, API and styles; from C, a new
  complex topic, described without numbers;
- E: the component tree in the README as Mermaid; C: the data-flow diagram;
- B: one of Zustand, Redux Toolkit or Jotai, plus a justified design pattern
  (in place of compound components alone);
- A: TanStack Query and memoization, moved from B;
- `lazy` + Suspense and "automatic deploys" are not in the ladder;
- TypeScript allowed from E;
- the implementation and the defence together set the place inside a band,
  with no formula;
- the course plan's policy summary drops «still sit current control».

To check during the build: **the labs index lead** (see «Files to create
or change»).

Outside the repo: the course plan copies the programme, which is
authoritative. Its section 8 needs the same change as the policy summary.

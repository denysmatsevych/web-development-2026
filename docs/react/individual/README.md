# React ІЗ — individual assignment

| Route | Source | What it is |
| --- | --- | --- |
| `/react/labs/individual/` | `src/content/labs/react/uk/individual.md` | the handout: who it's for, the E–A ladder and its rules, topics, requirements by tier, steps and dates, deliverables, submission, links |
| `/uk/react/labs/individual.pdf` | built from the handout | the downloadable handout, 9 A4 pages |

The handout is the single source for the tiers, rules and dates; this file
doesn't restate them. The grading section of
[../course-plan.md](../course-plan.md) says how the route sits next to the
programme. The plan the page was built from, with the decisions behind it,
is [individual-assignment-plan.md](individual-assignment-plan.md).

After any change to the handout, rebuild the PDF from PowerShell (Edge
writes no PDF from the Bash tool):

```
python docs/web/build-handout.py individual react
```

## Why it looks like this

- **Only for students on an individual plan.** It replaces the labs and
  module tests, so the summary (the page lead and the card) says who it's
  for: every student sees card `00` on `/react/labs/`. The PDF doesn't
  print the summary, so it doesn't say this.
- **Not the final project.** The final project (ЛР 21–27) is for the regular
  route and gets its own task; this one runs all semester.
- **No numeric minimums.** Requirements describe what the app has, not how
  many. This includes what makes a topic "complex" from C.
- **Vite or Next.js.** The tiers are the same; one table in §4 gives the
  Next.js form of each requirement that differs.
- **A JSON file as the database** for read-only APIs: json-server on
  `db.json` (Vite), a Route Handler or Server Action (Next.js). It writes
  only on localhost, because a Vercel deployment's filesystem is read-only,
  so students run and show the write flow on localhost. On Vercel that part
  may show its error state, and §3.3 tells students that's expected.
  localStorage was considered and rejected: it sends no request, so the C
  form would have no server error to handle and A's mutation and
  invalidation would show little (the PR #53 review, 2026-11-08).
- **A higher tier replaces tools, not behaviour.** B moves the shared state
  into a library and A replaces the request code, so §2 says the new tool
  meets the lower tier's requirement. Without it, "cumulative" would make an
  A app fail D's `useEffect` cancellation (the PR #53 review).
- **RTK Query counts as TanStack Query at A** for students who chose Redux
  Toolkit at B. It ships in the same package and does the same job (cached
  queries, mutations, invalidation through tags). Adding TanStack Query on
  top would give the app two server caches.
- **No defence questions.** Unlike the labs, the handout has no list of
  questions to prepare; §2's rules describe the defence (the instructor's
  review, 2026-11-08).
- **Cells that mustn't wrap.** The ladder's bands are written
  `61&#8288;–&#8288;67` (word joiners stop the break after the en dash), and
  the steps table's first column `1.&nbsp;Тема` (so «2. Розробка» doesn't
  split after the number).

## Checked on 2026-11-07

- **Versions** (`npm view`, latest): React 19.3, Vite 8.3, Next.js 16.4,
  React Router 8.5, React Hook Form 7.91, `@hookform/resolvers` 7.0, Zod
  4.6, Zustand 5.1, Redux Toolkit 2.14, Jotai 3.0, TanStack Query 5.107,
  Vitest 5.1, React Testing Library 16.3, TypeScript 7.0, json-server
  1.0.0-beta.15, ESLint 10.14, Prettier 3.9, create-vite 9.3.
- **React Router 8** still has declarative mode with `<Routes>`/`<Route>`,
  `:id` dynamic segments and `useParams`. The programme names v7.
- **create-vite 9**: the React templates default to Oxlint (`"lint":
  "oxlint"`), which is why §4 points Vite users to ЛР-1's ESLint setup;
  `react-ts` builds with `tsc -b && vite build`.
- **Next.js 16**: create-next-app's defaults include TypeScript, ESLint
  (`"lint": "eslint"`) and the App Router. The `error` file's retry prop is
  `retry`, not the older `reset`. The Vitest guide says Vitest doesn't
  support async Server Components.
- **Vercel**: the Vite page gives the SPA rewrite used in §4.2. The
  functions runtime page says "read-only filesystem with writable /tmp
  scratch space up to 500 MB".
- **json-server 1.0.0-beta.15**: run locally on a sample `db.json`. A POST
  returned 201 with `Access-Control-Allow-Origin: *`, and the new record was
  written to the file with a generated string id. It also adds a `$schema`
  key to the file.
- **Write endpoints** (POST with an `Origin` header): DummyJSON
  `carts/add`, `recipes/add`, `posts/add`, `todos/add` and JSONPlaceholder
  `posts` all answer 201, CORS on. DummyJSON's `auth/login` returns a token.
- **Platzi Fake Store API**: `api.escuelajs.co` answers with CORS `*` and
  allows GET/PUT/PATCH/POST/DELETE. Its Swagger spec lists POST, PUT and
  DELETE for products and users, plus `auth/login`. The old docs domain
  `fakeapi.platzi.com` no longer resolves, so the handout links
  `api.escuelajs.co/docs`.
- **MockAPI.io** was dropped from the topic table: its free plan couldn't be
  checked (the site renders client-side), and the JSON file covers own data.
- **Every external link** in the handout returned 200.
- **The page**: `npm run check` (0 errors; the 4 hints are in the legacy
  redirect pages) and `npm run build`. In headless Edge at 390 and 1280 px:
  no page-level horizontal scroll. On phones, wide tables scroll inside
  their own box (`lab.css`), so the ladder's last column is reached by
  scrolling. Card `00` comes first on `/react/labs/` and on the English
  index, which links the Ukrainian page. Internal links carry the base
  path, and the anchor into the Web Dev ІЗ topic table matches its heading.
- **Mermaid**: both examples (the component tree in §4.1, the data flow in
  §4.3) render with mermaid 12.2.0, 5 nodes and 4 edges each.

## Not checked

- Whether GitHub renders the two Mermaid examples. Both use only basic
  `flowchart` syntax.
- The `vercel.json` rewrite on a real deployment.
- Whether a Next.js Route Handler on Vercel can read `db.json` at all: that
  depends on the file being traced into the function bundle. Writes fail
  there either way.
- A dry run: an app built from the handout alone, to find unclear
  requirements and gauge the work per tier.
- The labs index lead («індивідуальне завдання під номером 00 виконується
  протягом семестру») is shared by both courses. On the React page it's
  shown to every student; whether it reads as "everyone does it" is the
  instructor's call.

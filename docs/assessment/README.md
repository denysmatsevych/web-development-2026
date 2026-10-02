# Automated assessment — design

**Status:** proposal, 2026-10-02. Replaces `ReAct.md` from PR #13 and keeps
its good ideas: the engine/config split, per-assignment weights and report
formats, and instructor override.

**Update, 2026-10-02:** the first release targets tests (control works and
quizzes), see [aas-t.md](aas-t.md). It replaces §7.2 below with Vercel and
Neon, narrows §7.3 to GitHub sign-in limited to verified `@oa.edu.ua`
emails, and answers open questions 1–5 (and 6 for tests).

The course site is read-only: lectures, handouts, tutorial. Assessment happens
elsewhere, mostly by email and oral defense. This document proposes a system
that manages assessment end to end, starting with Web Development 2026 and
built so that the React and Web A11y courses can follow without a rewrite.

## 1. How assessment works today

1. A student reads the handout on the course site (static, GitHub Pages).
2. They email links (repository, GitHub Pages, Vercel) and the report items
   the handout asks for (Lighthouse screenshot, AI-use note, conclusion) under
   a fixed subject line such as `[Веб] ЛР-7: …`.
3. The instructor opens the links and checks the work. For Lab 7 they paste
   the URL into the auto-check at `/labs/lab-7/check/`.
4. Most labs end with an oral defense. The mark is recorded outside the site.

What this costs:

- **Submissions live in a mailbox.** There is no list of who submitted what
  and when; deadline bonuses (+1 or +2 before a date) are checked by hand.
- **Check results are not kept.** Lab 7's report exists until the tab closes,
  and its `?url=` link re-checks the site as it is now, not as submitted.
- **Students cannot self-check.** A Lab 7 self-check with an attempt limit was
  built and dropped: a limit kept in the browser is trivially reset, and a
  result computed in the student's browser can be edited.
- **No overview or export.** There is no per-stream table and nothing to
  export to the official gradebook.
- **Nothing carries over.** Each new course would start from zero.

## 2. Goal

> A course-agnostic system that manages assessment end to end. The instructor
> defines assignments (labs, tests) and their rubrics, and some criteria are
> checked automatically. Students submit their work and get a verified result
> that can't be changed afterwards. The instructor reviews results, overrides
> them and exports grades.

**In scope for v1:**

- one place for submissions: who, what, when, which commit;
- automated check results stored with the submission they belong to;
- rubrics that mix automated and manual criteria, with instructor override;
- grade export;
- a new assignment or a new course is configuration, not engine code.

**Later:** student self-check with attempt limits; checks students cannot see
(tests); repository checks (build, lint, `tsc`, tests) and JS-rendered apps
for the React course; quizzes, if "tests" includes them (§11).

**Non-goals:**

- Replacing the oral defense. Automated checks give evidence and a suggested
  mark; the instructor gives the grade.
- Plagiarism detection or LLM grading of reports.
- Replacing the official gradebook. The system exports to it.

## 3. Users and constraints

- **Instructor:** one person, possibly with assistants later, and the only
  maintainer.
- **Students:** grouped into streams. Every student already has a GitHub
  account, since labs are deployed to GitHub Pages from their own
  repositories.
- **The course site stays static** on GitHub Pages.
- **The course site repository is public.** Anything committed to it, or
  shipped to a browser, is readable by students. This is why
  `docs/lab-7/mockup/` is gitignored.
- **Near-zero budget and ops.** Prefer managed services over servers to patch.
- **Spiky load.** Most submissions arrive in the hours before a deadline.
- **Personal data.** Names, emails and grades need access control and a
  retention rule.

## 4. What already exists: the Lab 7 auto-check

`/labs/lab-7/check/` (`src/pages/labs/lab-7/check.astro`, engine in
`src/scripts/courtly-check.ts`, notes in `docs/lab-7/README.md`) grades a
deployed Courtly page from the instructor's browser. It runs 48 weighted
checks in three passes (static HTML and CSS; layout in iframes at 320 / 375 /
768 / 1440 px; the mobile menu in a script sandbox), adds Lighthouse through
the PageSpeed Insights API (or a hand tick from the student's screenshot when
the quota runs out), and suggests a mark on the 12-point scale. The
reference solution scores 12/12.

It is the seed of the engine, not a prototype to throw away:

| Needed | Lab 7 has | Missing |
| --- | --- | --- |
| Check engine | Three passes and PSI with a hand-tick fallback, in the browser | Generic and Courtly-specific code mixed in one file |
| Weights and scoring | `Check.weight`, `scoreChecks()` → 1–12 | Scale hardcoded to 12 points |
| Report | Grouped dialog, copy as text, `?url=` re-run link | — |
| Identity | None; the page is unlinked and `noindex` | Everything |
| Stored results | None | Everything |
| Attempt limits, deadlines | Tried and dropped | A server-side source of truth |
| Manual criteria | Listed as "not automated" on the page | A place to record them |

So the case for a server is **trust and records**: a result students can't
forge, attempt limits, a snapshot at submission time, history and export. It
is not CORS: GitHub Pages and Vercel send `Access-Control-Allow-Origin: *`,
and the checker's `srcdoc` iframes work.

## 5. Domain model

| Entity | Holds |
| --- | --- |
| Course | `web-dev-2026`, later the React and Web A11y courses |
| Stream | one run of a course for a set of groups, and its roster |
| Student | name, university email, GitHub login; enrolled in streams |
| Assignment | course, id (`lab-7`), kind (`lab` / `test` / `individual`), submission fields, rubric, policy, check module and version |
| Submission | student, assignment, server time, field values (site URL, repo URL, commit SHA, text, files) |
| Check run | submission, engine and module versions, runner, per-check results, suggested points |
| Grade | per-criterion points, overrides (who, when, why), final mark, publish time |

- **Submission fields** are declared per assignment. This generalizes
  `allowedReportType` from PR #13. Lab 7 asks for a site URL, a repo URL, a
  Lighthouse screenshot and an AI-use note.
- **Rubric criteria** have a source, `auto` or `manual`. Auto criteria take
  their value from check runs; the instructor enters manual ones. The oral
  defense is a manual criterion.
- **Policy** replaces a `type: 'control'` flag with explicit rules: open, due
  and close times; bonus rules ("+1 if submitted by 23.09"); maximum
  attempts; which attempt counts (last, best, instructor's choice); when
  students see results (immediately, after the deadline, never).
- **Records are append-only.** A resubmission is a new submission, a re-check
  is a new check run, and an override is a new entry, not an edit.

The current assignments fit this model:

| Assignment | Scale | Auto | Manual |
| --- | --- | --- | --- |
| Lab 2, Lab 3 | 2 + 1 bonus | links open (candidate) | defense; bonus by date or class work |
| Lab 4 | 4 + 2 bonus | links open (candidate) | defense; bonus by date or class work |
| Lab 6 | 2 | links open (candidate) | defense or class work |
| Lab 7 (test) | 1–12 | the checker's 48 checks | visual match with the mockup, Lighthouse screenshot, AI-use note |
| Individual | 100, eight criteria | candidates: deployment, a11y basics, Lighthouse | most criteria; defense |

Even where little is automated, the system pays off: submissions, deadlines,
bonuses, marks and export end up in one place.

## 6. Engine and check modules

Three layers, split out of `courtly-check.ts`:

1. **Engine:** loading the page and its CSS, measuring layout at given widths,
   running student JS in a sandbox, Lighthouse, scoring, the report UI.
2. **Check library:** checks that recur across assignments, such as no
   horizontal scroll at a width, one `<h1>` and a logical heading order,
   landmarks, form labels, visible focus, image dimensions and `srcset`, meta
   tags with canonical and Open Graph, `robots.txt` and `sitemap.xml`.
3. **Assignment modules:** what only one assignment needs. For Lab 7 that is
   the venue names, section ids, design tokens, accent color and card grid.

A module is code, not a declarative config. Checks like "the featured card
spans 2 × 2 at 1440 px" or "the menu toggles `aria-expanded`" can't be
expressed as data without inventing a language. Rubric, weights, policy and
submission fields *are* data.

The contract between the engine and storage is the existing `Check` type,
with `group` widened from Lab 7's union to a string:

```ts
type Status = 'pass' | 'warn' | 'fail' | 'skip';

interface Check {
  id: string;
  group: string;
  title: string;
  weight: number; // 0 = informational, not scored
  status: Status;
  detail?: string;
}
```

A check run stores these rows with the engine and module versions, so an old
mark can still be explained after the checks change.

**Where modules live.** Anything shipped to a browser is public: the Lab 7
checker can be read in the site's JS bundle today. That is fine for labs,
because the handout's criteria list is public anyway. Checks for tests that
students must not see can only run on a server, from a private repository.

**Runners** run the same modules in different places:

| Runner | Where | Good for | Limits |
| --- | --- | --- | --- |
| Browser (exists) | instructor's browser | static and server-rendered pages | no JS-rendered apps; host must send CORS headers |
| Server | Playwright in a container | self-check, attempt limits, hidden checks, JS-rendered apps | hosting, sandboxing, queueing |
| CI | GitHub Actions | repository checks: install, build, lint, `tsc`, tests | slower feedback; setup per repository |

Most check code uses plain DOM APIs, so it can run inside the page through
Playwright's `page.evaluate`. Porting to the server runner mostly replaces the
iframe plumbing.

## 7. Decisions

### 7.1 Who runs the checks in v1: the instructor

| | A. Instructor, in the browser | B. Student-triggered, on a server |
| --- | --- | --- |
| Why the result is trusted | The instructor produced it | The server produced it |
| New infrastructure | Storage only | Headless browser hosting, sandbox, queue |
| Student code on our servers | None | Every check runs student JS |
| Self-check, attempt limits | No | Yes |

**Proposed: A for v1, B in phase 3.** A gets submissions, records and export
working on the engine that already exists. B is the larger, riskier half and
waits until the data model has settled.

### 7.2 Where data and auth live: a managed backend on Postgres

- **A. Own API** (Node.js + TypeScript, Postgres) on a PaaS. Full control,
  but we own auth, sessions, CORS, deploys and uptime. Free tiers usually
  have an ephemeral filesystem and sleep when idle, so JSON files or SQLite
  there lose data. A UI on `github.io` calling an API on another site can't
  rely on cookies (Safari blocks third-party cookies, Firefox partitions
  them); it needs token auth or a shared custom domain.
- **B. Backend-as-a-service** (for example Supabase): GitHub login, managed
  Postgres, file storage and row-level access rules, called directly from the
  static UI. Least code for one maintainer. The access rules *are* the
  security boundary and need tests. Some vendor lock-in.
- **C. GitHub Classroom:** rosters, a repository per student, autograding in
  Actions. Strong for repository checks (React), weak for deployed-page
  checks, manual criteria and our grading scales.
- **D. University LMS**, if one is available: official gradebook and rosters.
  Unknown (§11).

**Proposed: B, on Postgres.** With the data in plain Postgres, moving to A
later changes the API layer, not the data. Deadlines and attempt limits are
enforced in the database using server time, so the browser can't bypass them.
Check the free-tier limits (inactivity pausing, storage) before committing.
C stays an option for the React course's CI runner.

### 7.3 Identity: GitHub login

- **Email allowlist without verification:** rejected. Anyone who knows a
  classmate's email could submit as them.
- **GitHub login:** proposed. Students already have accounts, and the login
  proves the submitted repository is theirs (owner matches login). The roster
  maps GitHub login to student and stream; the usernames are already in the
  repository URLs of Lab 1 submissions.
- **University Google sign-in:** fallback, if every student has a university
  account (§11).
- **Instructor:** the same login plus a role in the database. No shared secret
  tokens.

## 8. Security and privacy

- **v1 runs no student code on our infrastructure.** The browser runner keeps
  student JS in an iframe with an opaque origin, as Lab 7 does now.
- **Server runner (phase 3):** only allowlisted hosts (`*.github.io`,
  `*.vercel.app`); resolve the address and refuse private ranges, to prevent
  server-side request forgery; a fresh container per run with CPU, memory and
  time limits and no secrets; a queue with a concurrency cap for the hours
  before a deadline.
- **CI runner:** student code runs in GitHub Actions, never on our servers.
- **Hidden checks and answer keys** never go into this repository or a
  browser bundle.
- **Personal data:** store only name, university email, GitHub login and
  stream. Students see their own records; the instructor sees all. Delete or
  anonymize after the course and the appeal period (§11).
- **Audit trail:** because records are append-only (§5), every mark traces
  back to a submission time, commit, check run and overrides.

## 9. Delivery plan

| Phase | Scope | Done when |
| --- | --- | --- |
| 0. Refactor | Split `courtly-check.ts` into engine, library and Lab 7 module, in this repo. No backend. | Reference solution still scores 12/12; broken fixtures fail the checks they target; the check page works as before |
| 1. MVP | GitHub login; submission form with per-assignment fields; server records time and commit SHA; instructor table per assignment; run the browser check from the table and store it; manual criteria; override; CSV export. Lab 7 plus one defense-graded lab. | §10 criteria met on one real assignment |
| 2. Policies | Deadlines and bonus rules, result visibility, students see their own results and history | One full lab cycle without email submissions |
| 3. Server runner | Playwright in a sandbox; student self-check with attempt limits; hidden checks for tests | Same results as the browser runner on the Lab 7 fixtures |
| 4. Next course | React: CI runner and JS-rendered pages. Web A11y: axe-core and keyboard probes. | A course added without engine changes |

From phase 1 the system gets its own private repository: it serves several
courses and will hold hidden checks. The course site links to it.

## 10. Success criteria

The targets are proposals to agree in review.

- **Agreement:** on real Lab 7 submissions, the suggested mark is within ±1 of
  the instructor's final mark for at least 90% of students.
- **Regression:** the reference solution scores 12/12, and each broken
  fixture fails exactly the checks it targets.
- **No lost work:** every submission made before a deadline is stored.
- **Traceability:** every final mark traces to its submission, commit, check
  run and overrides.
- **Instructor time:** time per submission is measured before (email) and
  after, and goes down.
- **Extensibility:** the second assignment is added without engine changes.

## 11. Open questions

1. Do "tests" include quizzes (questions with an answer key), or only control
   works like Lab 7?
2. Is there a university LMS or gradebook to export to, and in what format?
3. Does every student have a university Google account?
4. How many students are there per stream and per semester?
5. How long are submissions and grades kept, and when does the appeal period
   end?
6. Should students see check details before the deadline, for labs and for
   tests?
7. How do Lab 7's 12 points split between the checker and the manual items?
8. Does email submission continue in parallel while phase 1 is trialled?

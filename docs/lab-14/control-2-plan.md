# Plan: ЛР-14 «Проміжний контроль №2» — a randomised, auto-graded test in fullscreen cards

Status: plan, 2026-10-20, fifth revision: fixes from a design review of the
fourth, such as the code check before the test starts, one attempt per
student, one grace period, resuming after «Закрити», and a «ТЕСТ» group for
the dry run. Nothing is built.

- **The first group writes on 21.10.2026 at 10:40,** so the build follows
  **Schedule**.
- **Defaults to confirm** apply unless the instructor changes them.

Delete the three files once ПК2 has run. The facts that last move to
`docs/lab-14/README.md` and `quiz-api/README.md`.

## The plans

| File | Covers | Code in |
| --- | --- | --- |
| This file | context, decisions, the six-step flow, the 24 tasks, the schedule, the defaults | — |
| [frontend-plan.md](frontend-plan.md) | the student page, the lockdown and its event log, the instructor's dashboard, the demo, the handout | this site's `src/` |
| [backend-plan.md](backend-plan.md) | the Worker API and its rules, the database, the task pool and roster tools, deploy | `quiz-api/` |

**Where the two meet:**

- **The API:** [backend-plan.md → API](backend-plan.md#api) is the contract.
  Both sides import its types from `src/lib/quiz-contract.ts`.
- **The event catalog** (which actions are logged, under which labels) is
  defined once, in
  [frontend-plan.md → Lockdown](frontend-plan.md#lockdown-on-students-own-devices),
  and lives in the same file.

## Context

ЛР 15 is the credit session (залікове заняття), so Проміжний контроль №2 takes
ЛР 14's slot and the ЛР 14 lab is dropped. ПК2 becomes a 24-task test,
randomised per student and graded automatically, on a page of the course site
with a small backend.

The site alone can't do it. It is static (GitHub Pages, public repo), so it
can't keep the keys secret, store results or show the instructor anything
live.

## Settled (2026-10-19)

| Topic | Decision |
| --- | --- |
| Slot | ПК2 runs in ЛР-14's slot; ЛР-15 is the credit session; the ЛР-14 lab is dropped |
| Points | ПК2 = **12**, as in the approved PDF |
| Tasks | **24 tasks × 0.5 points**, each all-or-nothing, never 0.25 |
| Grading | **Automatic.** The mark shows right after finishing, to the student and on the instructor's dashboard |
| Rounding | The total becomes a whole mark: x.5 and above rounds up, below x.5 rounds down. Totals are multiples of 0.5, so 9.5 → 10 |
| Difficulty | Hard enough for a midterm, but logical; and short, because air-raid alerts cut into class time |
| Topics | The core is ЛР 8–11; Лекція 8 only as easy questions |
| Time | A 30-minute timer. No pause for air-raid alerts: it was dropped to keep Wednesday's scope small (see **Air-raid alerts**) |
| Groups and dates | **КН-313:** Wednesday 21.10.2026, 10:40–12:00. **КН-311 and КН-312, together:** Thursday 22.10.2026, 09:00–10:20 |
| Devices | **Students' own.** IT can't install Safe Exam Browser or set browser policies, so the browser-level lockdown applies and violations are logged |
| Identity | The student picks their group and name from the list, then enters a personal generated code |
| Pool | Tasks are drawn at random from a pool. The pool will later be reused for the credit test, which is separate future work |
| Backend | Cloudflare Workers + D1, free; the instructor creates the account |
| Lockdown | No accidental exit, no DevTools, no text selection. The ways out: «Завершити» in the header with a confirmation, or the timer. **Every attempt at a forbidden action is logged**, whether or not the page can block it |
| Dashboard | Shows each student's **device and browser** and the **list of logged violations** |

## Step 0: course-plan changes (after 22.10)

These aren't needed for the test itself, so they wait until after Thursday.
Edit [course-plan.md](../course-plan.md) and, by hand, the `.docx`:

- **Mapping table:** `ЛР 14` → `lab-14` (ПК2); `ЛР 15` → the credit session.
- **Structure table:** row 2.11 → ПК2 (ЛР №14), row 2.12 → the credit
  session (ЛР №15).
- **Grading table:** «ЛР №12-14, 6 points» → «№12-13, 4 points»; ПК2 10 → 12.
  Current work stays 72 and the final exam stays 28.
- **ПК2's requirement:** now reads «тестування з JavaScript, DOM, REST API та
  TypeScript».
- **Mismatches list:** drop the ПК2 line, because it now matches the PDF, and
  add the ЛР 12-14 one.
- **Note:** a Part 2 revision note dated 2026-10-19.

## The flow (the instructor's six steps)

| Step | What happens | Details |
| --- | --- | --- |
| 1. Identity | The student picks the group, then their name from the list, and enters the 6-digit code from a slip. Then the rules, and «Почати»: fullscreen, keyboard lock and the code check. A wrong code returns the student to the form, out of fullscreen | screens: [frontend](frontend-plan.md#identity-screen); checks: [backend](backend-plan.md#server-rules) |
| 2. The draw | The server picks 24 tasks by the blueprint, at most one per family of variants, and shuffles the options. The draw is stored, so the code reopens the same tasks anywhere | [backend](backend-plan.md#server-rules) |
| 3. Taking the test | One task per card. Назад / Пропустити / Далі and a map at the bottom; any answer can change until the end; each is saved at once | [frontend](frontend-plan.md#cards); saving: [backend](backend-plan.md#api) |
| 4. «Завершити» | Alone in the header, with a confirmation dialog; or the timer reaches 0 | [frontend](frontend-plan.md#finishing) |
| 5. Grading | Automatic: 0.5 or 0 per task, then the rounded mark | [backend](backend-plan.md#server-rules) |
| 6. The result | The student sees the points, the mark and the number correct, but not which tasks. The instructor sees the same at once on the dashboard | [frontend](frontend-plan.md#result-screen), [dashboard](frontend-plan.md#instructor-dashboard) |

## The 24 tasks

**Points.** Every task is worth 0.5, all or nothing: 24 × 0.5 = 12. So a
topic's weight is simply its number of tasks × 0.5.

**Kinds.** All are graded automatically, and they need only two input
controls:

| Kind | What the student does | Input |
| --- | --- | --- |
| Test | Picks the right statement among 4 | radio |
| Code: output | Types what the code prints, in a format the task states (e.g. «через пробіл») | short text, matched after normalising whitespace and quotes |
| Code: order | Picks the order of the output, the event-loop kind | radio (the options are orders) |
| Code: bug | Picks the line with the bug, or the correct fix | radio (the options are line numbers or snippets) |

These replace the free-text «поясніть код» card. Free text can't be graded
automatically, and an output, order or bug question still checks that the
student can explain the code: a wrong mental model gives a wrong answer.

**Composition:** 16 tests and 8 code tasks. This is the blueprint for ПК2.

| Pool | Source | Tests | Code | Points |
| --- | --- | --- | --- | --- |
| JS basics: coercion, scope, closures, values vs references, modules | ЛР-8, Лекція 5 | 4 | 2 | 3 |
| DOM, events, delegation, forms, focus | ЛР-9, Лекція 5 | 3 | 2 | 2.5 |
| Debugging: error types, stack trace, event loop | ЛР-10, Лекція 6 | 3 | 2 | 2.5 |
| Fetch, Promise, HTTP statuses and headers, CORS | ЛР-11, Лекція 6 | 3 | 2 | 2.5 |
| TypeScript: unions, narrowing, guards, `any` vs `unknown` | ЛР-12-13, Лекція 7 | 2 | — | 1 |
| Tooling: npm, Vite, ESLint, Git, tests (easy) | Лекція 8 | 1 | — | 0.5 |
| **Total** | | **16** | **8** | **12** |

- **Core share:** ЛР 8–11 give 21 tasks, 10.5 points.
- **Time:** about 16 × 40 s + 8 × 1.5 min ≈ 23 minutes, under a **30-minute**
  timer.

**"Hard but logical"** — rules for writing tasks:

- Every task takes one chain of reasoning (predict, trace, diagnose), never
  recall of an API name.
- No trick wording and no «усі відповіді правильні». The distractors are the
  typical mistakes from the labs.
- Code is at most 12 lines, taken from or modelled on the labs' apps
  (Watchlist, ShowFinder, Courtly Booking).
- Output tasks print only primitives: strings, numbers, booleans, `null`,
  `undefined`. Node and the browser console print arrays and objects
  differently, so the task builds the line with `join` or a template string.
- Every key is checked. JS output keys are checked by running the code; the
  pool's format and tools are in
  [backend-plan.md → Task pool](backend-plan.md#task-pool).

**The pool's first draft** (about 60 tasks) is written with AI from the
ЛР 8–12 handouts and Лекція 8's topics, then reviewed by the instructor.

## Air-raid alerts

There is no pause in this version: the instructor dropped it to keep
Wednesday's scope small.

- **If an alert interrupts the class,** attempts keep running and finish at
  their deadline with the answers already saved, so nothing is lost.
- **What happens next** is the instructor's call. A group can be rerun later
  with a fresh draw; the command is in
  [backend-plan.md → Deploy](backend-plan.md#deploy-and-local-development).
- **Extending one student's time** from the dashboard is P1.

## Schedule

| When | What | Who |
| --- | --- | --- |
| **Mon 19.10** | Confirm the plans and **Defaults to confirm**. Create the Cloudflare account and the private bank repo. Tell the students: a laptop with Chrome or Edge, charged, with mobile data as a backup, and the demo link coming on Tuesday | instructor |
| Mon 19.10 → Tue 20.10 morning | **Backend P0:** API, rules, tests, both scripts. **The pool's first draft** | Claude |
| **Tue 20.10, until 12:00** | **Frontend P0, student side:** the page with the lockdown and the demo, reviewed locally | Claude, then the instructor |
| **Tue 20.10, 12:00–15:00** | **Review the pool** (about 2 hours). **Frontend P0, dashboard.** Deploy the Worker; import the roster and the pool | instructor; Claude |
| Tue 20.10, 15:00–17:00 | PR (page, handout, `quiz-api`) → review → merge → GitHub Pages deploys. Print КН-313's slips | instructor |
| **Tue 20.10, 18:00** | **Dry run** (below). **Go / no-go** for КН-313 | both |
| **Wed 21.10, 10:40** | КН-313 | instructor |
| Wed 21.10, afternoon | Fixes, plus pool corrections from КН-313's results | Claude |
| **Thu 22.10, 09:00** | КН-311 and КН-312 | instructor |
| After 22.10 | Step 0, the READMEs and docs, the P1 items in both plans | Claude |

**The dry run** brings together 3–4 people on different devices (Windows,
macOS, Android if possible), against the deployed Worker. They sign in to the
test group «ТЕСТ» with made-up names, so no real student's attempt is created
([backend-plan.md → Roster and codes](backend-plan.md#roster-and-codes)):

- slips, «Відкрити», start;
- a wrong code, which must return to the form out of fullscreen, and a double
  click on «Почати»;
- the frontend plan's lockdown matrix, checking each action's label on the
  dashboard;
- a reload, a resume on another device, a resume after «Закрити», the
  timeout, «Завершити»;
- «Копіювати оцінки» into a copy of the journal.

Afterwards, delete the «ТЕСТ» group and everything in it. The real groups stay
untouched.

**If the dry run fails,** decide then whether to move КН-313's ПК2 to another
slot. Don't run it on a half-working system.

## Defaults to confirm

These apply unless the instructor says otherwise:

1. **REST,** not GraphQL
   ([reasons](backend-plan.md#why-rest-not-graphql-apollo-server)).
2. **Composition:** 16 tests + 8 code tasks, all 0.5, with the pool table
   above. The alternative is 16 × 0.5 + 4 code tasks × 1 point: 20 cards,
   shorter, still no 0.25.
3. **Timer:** 30 minutes. With frequent alerts, 25.
4. **Phones** are allowed in limited mode and flagged; they're not refused.
5. **Codes** go out on slips that the roster script writes and the instructor
   prints. If there's no printer or a slip is lost, the instructor reads the
   code out of the same file.
6. **The student sees** the points, the mark and the number correct, but not
   which tasks.
7. **The pool** lives in a private GitHub repo.
8. **Leaks between days:** variant families for the code tasks. Thursday's
   groups seeing the same test tasks is accepted.

# Backend plan: ЛР-14 «Проміжний контроль №2»

Status: plan, 2026-10-20, revised after a design review. Nothing is built.

- **Read first:** [control-2-plan.md](control-2-plan.md). It holds the
  decisions, the six-step flow, the 24 tasks and the schedule.
- **The client** (the student page and the dashboard) is in
  [frontend-plan.md](frontend-plan.md).

## Scope

This plan covers `quiz-api/`, a Cloudflare Worker with a D1 database:

- the API for the student page and the instructor's dashboard;
- identity, the draw, saving answers, the deadline, grading and rounding;
- the event log and the live board's data;
- the task pool and roster tools;
- deploy and local development.

The server is the only place that holds the roster, the codes, the pool and
the keys.

## Platform: Cloudflare Workers + D1

**Cost.** Free. Cloudflare's Workers Free plan needs no payment card, and D1
is part of it.

- **Workers:** 100,000 requests a day, 10 ms of CPU per request, a 1 s
  startup limit.
- **D1:** 5 M rows read and 100 k rows written a day, 5 GB.

ПК2's estimate, with all three groups on one day, stays under 15% of each:

| | Estimate | Limit |
| --- | --- | --- |
| Requests | ~175 per student (120 heartbeats, ~50 saves, start, finish) × 46 ≈ 8 k, plus dashboard polling ≈ 2 k: **≈ 10 k** | 100 k/day |
| Rows written | heartbeats ≈ 5.5 k + answers ≈ 2.3 k + events: **≈ 8 k** | 100 k/day |
| Rows read | the board polled every 5 s, ~150 rows a poll (attempts and students only, see **Events** in **Server rules**), over three 45-minute sessions: **≈ 250 k** per open dashboard tab | 5 M/day |

Over a limit, D1 queries fail until 00:00 UTC. D1 counts rows read as the
rows a query scans, not the rows it returns.

**The instructor creates the account:**

1. Sign up at dash.cloudflare.com.
2. Run `npx wrangler login` in `quiz-api/`, which opens the browser.

Everything else (database, secrets, deploy) is done by commands from the
repo.

**Why not Apps Script** (considered first): it allows 30 simultaneous
executions per user account, can't read request headers, and takes 0.5–3 s
per call through the Sheet.

## Why REST, not GraphQL (Apollo Server)

- **The API is small and fixed:** about 6 calls for the student page and 10
  for the dashboard, both written by us. GraphQL pays off when many clients
  pick fields from a rich graph, and that isn't the case here.
- **Apollo on Workers** goes through `@as-integrations/cloudflare-workers`,
  a community integration that Apollo doesn't maintain. That's a dependency to
  vet two days before the first group.
- **CPU budget.** Most traffic is heartbeats, under a 10 ms CPU budget per
  request. GraphQL parses and validates every query before running it. It's
  probably fine, but it's a risk with no benefit here.
- **HTTP semantics:** REST keeps what this API relies on:
  - status codes: 401 for a stale token, 403 for a closed group, 409 for a
    finished attempt;
  - per-route rate limits and a plain CORS preflight;
  - curl-testable endpoints.

  It's also what ЛР-11 teaches.
- **Hardening:** a public GraphQL endpoint would also need depth and
  complexity limits and introspection turned off.
- **Type safety:** the shared `src/lib/quiz-contract.ts` and zod validation
  in the Worker give what a schema would.
- **If GraphQL is wanted later** (for AAS, or as a teaching example), GraphQL
  Yoga runs natively on Workers, and the same handlers can sit behind it.

## Stack

Hono (a small router built for Workers, with CORS and auth middleware), zod,
D1. Vitest with `@cloudflare/vitest-pool-workers` runs the tests in the
Workers runtime.

## API

This is the contract between the two plans. Its request and response types
live in `src/lib/quiz-contract.ts`, which both the page and the Worker import.
A change goes there first.

| Call | Auth | What |
| --- | --- | --- |
| `GET /tests/pk-2` | — | title, minutes, task count, groups and their state, server time |
| `GET /tests/pk-2/groups/:group/students` | — | the `[{id, label}]` list; 403 unless the group is open or still has an active attempt |
| `POST /tests/pk-2/start` | code | `{studentId, code, clientId, device: {label, mode, userAgent, screens}}` → attempt id, token, full name, deadline, server time, tasks without keys, saved answers, last card |
| `PUT /attempts/:id/answers/:qid` | token | one answer; 409 after finishing or past the deadline plus `GRACE` |
| `POST /attempts/:id/heartbeat` | token | the current card plus the batched amber events → `{deadline, serverTime}` |
| `POST /attempts/:id/events` | token | red events, sent at once |
| `POST /attempts/:id/finish` | token | `{reason: button \| timeout}` → `{points, mark, correct, total}`; repeat calls return the same result; a `timeout` before the deadline is refused with the current deadline |
| `POST /teacher/login` | — | password → a 12-hour token |
| `GET /teacher/board?groups=` | teacher | one row per student: name, group, device, state, card, remaining time, last heartbeat, violations grouped by type (count, total duration, worst severity) from the attempt's `violations_json`, points, mark |
| `POST /teacher/sessions/:group/{open,close}` | teacher | session control |
| `GET /teacher/attempts/:id` | teacher | the event timeline; the tasks and answers (P1) |
| `POST /teacher/students/:id/unlock` | teacher | lifts the lock after wrong code tries |
| `POST /teacher/attempts/:id/extend` | teacher | +N minutes, with a reason (P1) |
| `GET /teacher/slips?group=` | teacher | `[{label, group, code}]` for the print view (P1; for P0 the roster script writes the slips) |
| `GET /teacher/marks?groups=` | teacher | marks in journal order, as a column or CSV |

## Server rules

- **Identity.**
  - The student list is served only while the group's session is open or
    one of its attempts is still active, and only `«Прізвище Ім'я»`, never
    codes. So a student can still resume after «Закрити».
  - `start` checks that the code belongs to `studentId`.
  - **Closing a group stops new attempts only.** `start` resumes an active
    attempt whatever the session's state.
  - Wrong codes count per student: 5, then a 10-minute lock that the
    instructor can lift.
  - A generous per-IP cap only stops floods. Never limit by IP alone: a whole
    classroom can share one NAT address.
- **Tokens.** The first start issues a random 32-byte token. It is stored as
  is: the codes are stored plainly too, so a hash would add nothing, and the
  server must be able to hand the same token back.
  - Every `start` carries a `clientId`, a random id the page makes once per
    browser.
  - **The same browser** (a reload, a double click on «Почати») gets the
    attempt's current token back, so a page never signs itself out.
  - **Another browser or device** gets a new token, so the old tab gets 401,
    and the server records the red event «Продовжено на іншому пристрої».
- **One attempt per student and test,** except cancelled ones. A partial
  unique index enforces it (see **Data model**). `start` inserts the new
  attempt with `ON CONFLICT DO NOTHING` and then reads the live one, so two
  concurrent first starts end with one attempt and one draw. The losing draw
  is discarded.
- **The draw** happens on the first `start`:
  - for each blueprint cell (pool × kind), pick the counted number of tasks
    at random, at most one per family;
  - shuffle the options of radio tasks;
  - order: tests first, then code tasks, each block shuffled.

  The task ids and option order are stored with the attempt, so a resume shows
  the same cards.
- **The grace period.** `GRACE` is one constant, 60 s, and every time check
  uses it: saving, finishing and the lazy timeout. A save sent in the last
  seconds before the deadline therefore always lands before grading.
- **Answers** are accepted until the deadline plus `GRACE`. Each `PUT`
  replaces the stored value.
- **The deadline:** the start plus 30 minutes, plus any extension, by the
  server's clock.
  - **The lazy timeout:** once the deadline plus `GRACE` has passed, the
    attempt is finished with `reason: timeout` at the next request that
    touches it or the next board poll. Never earlier.
  - **An early `timeout`:** `finish` with `reason: timeout` is accepted only
    at or after the deadline by the server's clock. Earlier, from a client
    whose clock runs fast, it returns the current deadline, and the attempt
    stays active.
- **Grading,** on finishing:
  - **Radio kinds** (test, order, bug): the chosen option id equals the key.
  - **Output:** both the answer and each accepted answer are normalised, then
    compared. A match with any accepted answer counts.
    - Trim, and turn every run of whitespace, non-breaking spaces included,
      into one space.
    - Turn every quote into a single quote: double quotes, backticks, and the
      typographic ones that phone keyboards and Ukrainian layouts produce
      (’ ‘ ʼ “ ” « »).
    - Keep the case, because JavaScript output is case-sensitive. The answer
      field turns autocapitalisation off, so a phone doesn't capitalise the
      first letter (see [frontend-plan.md → Cards](frontend-plan.md#cards)).
  - **Points:** each correct task scores `points_per_task` (0.5), and the
    total is the sum.
  - **Mark:** `floor(points + 0.5)`. Totals are multiples of 0.5, so x.5
    rounds up: 9.5 → 10, 9 → 9.
  - **Record:** points, mark, the number correct, and per answer, whether it
    was correct.
- **Events** are checked against the catalog types in `quiz-contract.ts`
  (defined in [frontend-plan.md → Lockdown](frontend-plan.md#lockdown-on-students-own-devices))
  and stored with their time, severity, count and detail. «Немає зв'язку» is
  not stored: the board derives it from `last_seen`.
  - **An unknown type is skipped, never an error.** The rest of the request
    still succeeds, so a catalog mismatch between the deployed page and the
    Worker can't stop heartbeats or saving.
  - **The summary:** each request that stores events also updates the
    attempt's `violations_json`: per type, the count, the total duration and
    the worst severity. Counts only grow.
  - **The board reads only that summary,** never `events`. Aggregating every
    event every 5 s would scan the whole table at each poll and could approach
    the daily read limit. `events` is read for one attempt at a time, for its
    timeline.
- **Device:** the label, mode, User-Agent and screen count are stored at the
  first `start`.
- **The teacher:**
  - `POST /teacher/login` compares the password with a secret in constant
    time, with rate-limited failures.
  - It returns an HMAC-signed token, signed with `SESSION_SECRET`, that
    expires after 12 hours.
  - Every `/teacher/*` route needs that token.
- **CORS:** only `https://denysmatsevych.github.io` and
  `http://localhost:4321`, with `Authorization` allowed.

## Data model (D1)

```sql
students   (id, group_name, label /* «Прізвище Ім'я» */, journal_no, code, failed_tries, locked_until)
tests      (id /* 'pk-2' */, title, blueprint_json, minutes, points_per_task, rounding)
questions  (id, family, pool, kind, level, html, options_json, key_json, accepted_json, verify)
sessions   (test_id, group_name, state /* closed|open */, opened_at, closed_at,
            PRIMARY KEY (test_id, group_name))
attempts   (id, test_id, student_id, status /* active|finished|cancelled */, token, client_id,
            started_at, deadline, finished_at, finish_reason, question_ids_json, option_order_json,
            current_index, last_seen, device_label, device_mode /* full|limited */, user_agent,
            screens, violations_json, points, mark, correct)
answers    (attempt_id, question_id, value, correct, updated_at, PRIMARY KEY (attempt_id, question_id))
events     (id, attempt_id, at, type, severity /* red|amber */, count, detail)

CREATE UNIQUE INDEX one_live_attempt ON attempts (test_id, student_id)
  WHERE status <> 'cancelled';
```

- **Minimal data:** no emails or patronymics.
- **One attempt per student and test,** except cancelled ones: the partial
  unique index above enforces it, and cancelling an attempt frees the slot
  for a rerun.
- **Indexes:** that one, plus `answers (attempt_id)` and `events (attempt_id)`,
  so reading one attempt's answers or events doesn't scan the tables.

## Task pool

- **Where:** a **private GitHub repo** for the bank, e.g.
  `web-development-2026-bank`, so the pool is versioned, backed up and
  reusable for the credit test. The public repo holds only the tools.
  - **Fallback:** a gitignored `docs/lab-14/bank/`, with no history.
- **Format:** one Markdown file per pool, based on AAS §4.2:
  - `##` opens a task, with `{id=… family=… pool=… kind=… level=1|2|3}`;
  - `- [x]` marks the key of a radio task;
  - `= 3 3 3 | 3, 3, 3` lists the accepted answers of an output task;
  - a fenced block marked `js run` gets its key checked by running it.
- **Points live in the test, not the task.** A **blueprint** per test, e.g.
  `tests/pk-2.yml`, sets the counts per pool × kind (from the composition table
  in [control-2-plan.md](control-2-plan.md#the-24-tasks)), the points per
  task, the minutes and the rounding. The credit test later gets its own
  blueprint over the same pool.
- **Families.** A family is 2–4 variants of one task: different values, order
  or names, so different answers. This limits what КН-313 can pass on to
  Thursday's groups: a leaked variant doesn't give the answer to its siblings.
- **Size:** about 2.5 × the draw in each blueprint cell, so about 40 tests and
  20 code families (around 60 tasks; more variants where cheap).
- **`quiz-api/scripts/build-bank.mjs <bank-dir> <test>`:**
  - **Validates:** ids, families, exactly one `[x]`, and enough tasks per
    blueprint cell.
  - **Runs** every `js run` snippet in Node with a captured `console` and
    fails if the key doesn't match the real output. DOM and TypeScript tasks
    are marked `verify=manual`.
  - **Allows only primitives in output tasks.** Every captured `console.log`
    argument must be a string, number, boolean, `null` or `undefined`, or the
    build fails. Node prints arrays and objects differently from the browser
    console: `[ 1, 2, 3 ]` against `(3) [1, 2, 3]`, with strings inside them
    in single quotes. A task that prints an array builds its line with `join`
    or a template string instead.
  - **Renders** task and option HTML with Shiki and line numbers. Add `shiki`
    to `devDependencies`; today it comes only through Astro.
  - **Writes** `bank.sql` (questions and the test row) to
    `quiz-api/.private/`.

## Roster and codes

- **`quiz-api/scripts/import-roster.mjs <journal.xlsx>`** reads the sheet
  «Список студентів» (№, ПІБ, Пошта, Група):
  - the surname and first name from ПІБ, without the patronymic;
  - `КН-31x` from «КН-3, КН-31x»;
  - the journal number from №.

  Emails aren't imported.
- **Codes:** one random 6-digit code per student, unique, from
  `crypto.randomInt`. Digits avoid the Latin/Cyrillic look-alikes of a
  Ukrainian keyboard layout.
- **Output,** all in the gitignored `quiz-api/.private/`. The journal and
  these files never enter the repo.
  - `roster.sql` for D1.
  - `roster.json` with the codes. A re-run reuses them, so printed slips stay
    valid.
  - `slips.html`, the printable slips: A4, ten per page, each with the name,
    group, code and the page's full address,
    `https://denysmatsevych.github.io/web-development-2026/web-development/labs/lab-14/quiz/`.
    The instructor prints it from their own laptop, and reads a code out of it
    when a slip is lost.
- **The test group:** `--test-group` adds a group «ТЕСТ» of five made-up
  students. The dry run and the load test use it, so no real student's
  attempt is created before the test.
- **Expected:** 46 students, КН-311 14, КН-312 16, КН-313 16. One name has an
  apostrophe, kept as written.

## Deploy and local development

**One-time setup** (after `wrangler login`):

1. `wrangler d1 create pk2`; put the id into `wrangler.jsonc` (it's not
   secret).
2. `wrangler d1 migrations apply pk2 --remote`.
3. `wrangler secret put TEACHER_PASSWORD`, then
   `wrangler secret put SESSION_SECRET`.
4. `wrangler deploy` gives a `*.workers.dev` URL. It goes into the site's
   `src/scripts/quiz/config.ts`; it's public, which is fine.
5. `wrangler d1 execute pk2 --remote --file .private/roster.sql`, then the
   same with `bank.sql`.

**Updates:**

- **Code:** `wrangler deploy` again.
- **The pool:** rebuild and re-run `bank.sql` (it upserts by task id).

**Local:** `npx wrangler dev` serves the API on port 8787, with a local D1
seeded with a fake roster and the four demo tasks. It runs next to the site's
`npm run dev`.

**Rerunning a group after an air-raid alert:** cancel its attempts with one
`wrangler d1 execute` that sets `status = 'cancelled'` for that group's
attempts on the test. The students then start again with a fresh draw. The
exact command goes in `quiz-api/README.md`.

**After the dry run:** delete the «ТЕСТ» group's students, session, attempts,
answers and events with one `wrangler d1 execute`, so the group disappears from
the identity screen. The exact command goes in `quiz-api/README.md`.

**Retention:** once marks are in the journal and appeals are over, export and
delete every table's rows.

## Verification

- **Worker tests:**
  - **start:** a wrong code, the rate lock and unlocking, a closed group, a
    finished attempt;
  - **resume:** the same `clientId` gets the same token back; another
    `clientId` gets a new one, the old one gets 401, and the event is
    recorded; a resume after «Закрити» works;
  - **one attempt:** two concurrent first starts give one attempt and one
    draw;
  - **draw:** follows the blueprint, at most one task per family, the same
    cards on resume;
  - **answers:** accepted until the deadline plus `GRACE`, refused after; the
    lazy timeout doesn't fire before then;
  - **grading:** each kind, including output normalisation;
  - **rounding:** 9.5 → 10, 9 → 9, 0 → 0;
  - **finish:** a repeat returns the same result; the lazy timeout; a
    `timeout` before the deadline is refused;
  - **events:** an unknown type is skipped while the rest of the request
    succeeds; `violations_json` keeps the count per type and the worst
    severity, and the counts never go down;
  - **access:** `/teacher/*` without a valid token is refused; CORS passes
    only the allowed origins.
- **Pool:** `build-bank.mjs` passes on the real pool and fails on a broken
  copy, and every `js run` key matches its real output.
- **Roster:** `import-roster.mjs` on the real journal gives the expected
  counts.
- **Load:** a script plays 30 students at once (Thursday's case: start, 24
  saves, heartbeats, events, finish), first against `wrangler dev`, then once
  against the deployed Worker. No answer may be lost, and the marks must match
  the known answers.

## P0 and P1

- **P0, by Tuesday:**
  - every call in **API** except those marked P1;
  - every server rule;
  - both scripts;
  - deploy and the load test.
- **P1, after Wednesday:**
  - the slips' print view, `GET /teacher/slips`;
  - extending one student's time;
  - the task list in `GET /teacher/attempts/:id`;
  - «Анулювати завдання» (count a wrong pool task as correct for everyone who
    got it, and regrade);
  - CSV export;
  - a GitHub Actions deploy job, and running the `quiz-api` tests in
    `pr-check.yml`.

## Files

**Create:**

- `quiz-api/`: `package.json`, `wrangler.jsonc`, `src/` (Hono routes:
  student, teacher; draw, grade, auth), `migrations/0001_init.sql`,
  `scripts/` (`build-bank.mjs`, `import-roster.mjs`), `test/`, `README.md`
- `src/lib/quiz-contract.ts`: the API types and the event catalog, shared
  with the site. Both projects compile it, so it imports nothing: no `@/`
  aliases, no `astro:*`, no `import.meta.env`, and no DOM-only or
  Workers-only types.
- gitignored: `quiz-api/.private/` (the roster and pool SQL)

**Change:**

- `tsconfig.json`: add `quiz-api` to `exclude`. Its `include` is `**/*`, so
  `astro check` would type-check the Worker, where `D1Database` and `hono`
  don't resolve, and `npm run check` would fail.
- `.gitignore`
- `README.md`: a `quiz-api/` line
- after 22.10: `.github/workflows/pr-check.yml`

## References

- Cloudflare: [Workers limits](https://developers.cloudflare.com/workers/platform/limits/),
  [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/),
  [D1 pricing and free limits](https://developers.cloudflare.com/d1/platform/pricing/)
- Apollo on Workers: [Apollo Server integrations](https://go.apollo.dev/docs/apollo-server/integrations/integration-index),
  [cloudflare/workers-graphql-server](https://github.com/cloudflare/workers-graphql-server)
- [Apps Script quotas](https://developers.google.com/apps-script/guides/services/quotas)

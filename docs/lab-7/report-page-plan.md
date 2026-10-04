# Plan: Lab 7 check report with mockup comparison

Status: implemented, 2026-10-03 (branch `feat/lab-7-report-page`). The
current behaviour is documented in [README.md](README.md) → "Report page".

**Amended the same day** (instructor): the check dialog's «Порівняти» now
uses the same viewer, highlights included — settled question 2 is reversed.
The criteria gained L11 and D6 and grew in D5 and C10 (29 in all), taken from
a later, unmerged attempt without its approval workflow: findings stay hints
and the verdict stays the instructor's.

**Amended 2026-10-04** (instructor): «Скопіювати звіт» moved from the check
dialog to the report page, beside «Скопіювати посилання», so the copied
report always carries its own link. Flow step 3 and settled question 3 are
superseded.
Replaces the earlier compare-page plan: the
comparison is no longer its own page but a section of a report the instructor
shares. Builds on [check-grading-plan.md](check-grading-plan.md).

## Context

Grading a Lab 7 page at `/labs/lab-7/check/` is part automated and part
manual. The instructor judges the mockup match at 3 widths, ticks the
Lighthouse categories and writes comments. Today the result reaches the
student only as text pasted from «Скопіювати звіт».

**Decisions** (instructor, 2026-10-03):

- **The check route stays as it is.** It gains one action, «Сформувати звіт».
- **The report is a separate page.** It becomes available once checking is
  finished, because the manual part has to be done first.
- **The report includes the mockup comparison.** The student sees their page
  beside the mockup, with the requirements they miss highlighted.
- Carried over from the compare plan: the highlights cover written
  requirements only (handout `src/content/labs/lab-7.md`, design spec
  `src/content/tasks/lab-7.md`). They are hints and never change the mark. The
  page is unlisted and `noindex`.

## Flow

1. The instructor runs the check and judges it in the dialog, as today.
2. **«Сформувати звіт»** sits next to «Скопіювати звіт». It becomes active when
   Lighthouse has finished and each of the 3 widths has a mockup verdict.
   Until then a line under it says what is missing. Lighthouse ticks are not
   required, because an unticked row already counts as «Не виконано» in the
   mark.
3. Clicking it opens the report in a new tab:
   `/labs/lab-7/report/#<snapshot>`. The instructor reviews it and uses
   «Скопіювати посилання» to put the link in the reply to the student.
4. The link is a snapshot. If a verdict changes after that, the instructor
   generates the report again and sends the new link.

## The report page

From top to bottom:

- **Header:** «Звіт перевірки · ЛР-7», the student's page URL, and «Перевірено
  3 жовтня 2026, 14:20».
- **Mark:** «9 / 12» with the percentage, the same summary line as the dialog
  («88 % ваги · виконано 49 · частково 2 · …»), and «Скопіювати посилання».
- **Note:** «Це копія результатів на момент перевірки. Оцінку фіксує
  викладач.»
- **Results:** the dialog's groups and rows, read-only. A verdict shows as the
  row's status and a comment as its detail («оцінено вручну: …»). Groups with
  problems are open; groups where everything passed are collapsed.
- **«Порівняння з макетом»:** the mockup capture beside the student's page at
  1440 / 768 / 375. Scrolling stays aligned on section starts, as in the
  dialog's viewer today. Highlights and the findings list are described below.
  This section renders the site **as it is now**, so a line says so. If the
  site no longer loads, only this section shows an error.
- **A broken or truncated link** gets «Посилання на звіт пошкоджене або
  неповне» instead of a report.

### Highlights in the comparison

- **On the student's half:** a red outline with a short label for each
  requirement the page fails at the shown width. An amber outline marks a
  section much taller or shorter than in the mockup. A toggle hides the
  outlines.
- **Findings list under the panes,** grouped as in the tables below. Each
  finding reads «очікується … — зараз …» with its source («Макет §4 ·
  Footer»). Clicking a finding scrolls both halves to it. Passed requirements
  are collapsed under «Виконано: N».
- **Summary line:** «768 px: 3 розбіжності з вимогами · 1 помітна різниця у
  висоті · перевірено 29 вимог».
- **Note:** «Позначки — підказки за вимогами лабораторної; на оцінку вони не
  впливають.»

## Sharing without a backend

The site is static, so the report has to travel inside the link. The URL
fragment carries the snapshot: the page URL, the time of the check, and every
row as reported (id, group, title, weight, status, detail, judged by hand).
It is JSON, compressed with `CompressionStream('deflate-raw')` and encoded as
base64url. A fragment is never sent to a server. The page recomputes the mark
from the rows with `scoreChecks()`, so the mark and the rows can't disagree.

- **Length:** about 3,100 characters for a typical graded page (measured
  against the engine's current 56 rows). Email, the course's channel, handles
  that. A link holding only row ids would be about 1,000 characters, but it
  needs an id → title catalogue in the engine. That restructures the check
  code, so it is left out.
- **Integrity:** anyone who decodes the link can edit it. That is acceptable
  here because the link is the student's copy, not the record. The mark lives
  in the instructor's gradebook. An earlier objection to editable snapshots
  was about a student self-check, where the snapshot itself would have been
  the evidence. A tamper-proof report needs a backend (see
  `docs/assessment/`).
- **Rejected alternative:** a link that carries only the URL and the verdicts
  and re-runs the check when opened. The report would change whenever the
  student edits the site, and it would no longer show what was graded.

## Acceptance criteria (what gets highlighted)

These are carried over unchanged from the compare plan. Each criterion is
evaluated on the rendered page at the shown width. **Red** means a written
requirement is not met. **Amber** is information only. If an element can't be
located, the criterion is listed as «не перевірено» with no outline, so odd
markup doesn't raise a false alarm. Fluid values (`clamp()`) are computed
from the token strings at the shown width and never hard-coded. Colours are
compared exactly, since token values are fixed. Sizes use the tolerances
given below.

### Structure (all widths)

| ID | Requirement | Source |
| --- | --- | --- |
| S1 | Section order: header → hero → search → venues → how → about → CTA → footer | Handout §1, Макет §1 |
| S2 | Every section from the handout's table is present | Handout §1 |

### Grid and breakpoints (per width)

| ID | Requirement: < 640 / 640–1023 / ≥ 1024 px | Source |
| --- | --- | --- |
| L1 | Header: «Меню» button / «Меню» button / navigation in a row | Макет §3 |
| L2 | Hero: stacked / stacked / 2 columns | Макет §3 |
| L3 | Hero image 16 : 9 / 16 : 9 / 4 : 3 (± 3 %) | Макет §3, §4 Hero |
| L4 | Search form 1 column / 2 × 2 / 4 in a row | Макет §3 |
| L5 | Cards 1 / 2 / 3 columns; gap 24 px (± 2) | Макет §3, §4 Картка |
| L6 | Featured: one cell, stacked / same / 2 × 2 with image left, text right | Макет §3, §4 Featured |
| L7 | «Як це працює» stacked / stacked / 3 in a row | Макет §3 |
| L8 | Info block stacked below 768 px, 2 columns from 768 px | Макет §3 |
| L9 | Footer 1 / 2 / 4 columns | Макет §3, §4 Footer |
| L10 | No horizontal scroll; the overflowing elements are outlined | Handout §2.8 |
| L11 | Footer social links in a row, wrapping (a wrapping flex row counts) | Макет §4 Footer |

### Sizes and spacing

| ID | Requirement | Source |
| --- | --- | --- |
| D1 | Container: content starts at `(w − min(1200, w − 2 × gutter)) / 2`, i.e. 16 / 23 / 120 px (± 4) | Макет §2, §4 |
| D2 | Sections #venues, #how, #about: padding top and bottom `--space-section` (56 / 71 / 96 px, ± 4) | Макет §4 Загальне |
| D3 | Header height 72 px (± 2) | Макет §4 Header |
| D4 | Form fields and buttons 48 px; hero and CTA buttons 56 px (± 2) | Макет §2, §4 Кнопки |
| D5 | h1 / h2 / h3 and the three leads (hero, section, CTA text) sized from the token `clamp()` at this width (± 1 px); headings weight 800 | Макет §2 Типографіка, §4 |
| D6 | Footer: padding-top 64 px (± 4), text 14 px, column titles 16 px and weight 800 | Макет §4 Footer |

### Colours and shape

| ID | Requirement | Source |
| --- | --- | --- |
| C1 | `body`: background `#f6f8f5`, text `#13201a` | Макет §4 Загальне |
| C2 | Header: background `#ffffff`, bottom border 1 px `#d5dfd8` | Макет §4 Header |
| C3 | «Як це працює»: section `#eaf1ec`; steps `#ffffff`, radius 20 | Макет §4 |
| C4 | Form: `#ffffff`, radius 20; fields radius 8, background `#f6f8f5` | Макет §4 Форма |
| C5 | Cards: `#ffffff`, border 1 px `#d5dfd8`, radius 20 | Макет §4 Картка |
| C6 | Buttons: primary `#0b6e4f` (header, hero, form, featured), outline with border `#0b6e4f` (other cards), accent `#c6f432` with text `#0f2a1f` (CTA); radius 12 | Макет §4 Кнопки |
| C7 | Sport chip: background `#e3f1ea`, text `#0b6e4f` | Макет §4 Картка |
| C8 | «Вибір тижня» badge: background `#c6f432`, uppercase | Макет §4 Картка |
| C9 | CTA block: background `#0f2a1f`, radius 20, heading `#f1f7f3` | Макет §4 Final CTA |
| C10 | Footer: background `#0f2a1f`, text `#b4c7bb`, column titles `#f1f7f3` | Макет §4 Footer |

### Section heights (amber, information only)

| ID | What | Why amber |
| --- | --- | --- |
| H1 | A section more than 30 % taller or shorter than in the mockup at this width; shows both heights | The handout allows minor deviations; this points at where to look |

## Architecture

- **`src/scripts/courtly-check.ts` (engine).** These changes extract code and
  add exports; scoring does not change.
  - `loadPage(url)` is extracted from `inspect()`. It covers the fetch,
    validation, `<base>` and preview. The report uses it to render the live
    page.
  - `measure()` is split into exported `locate()` (finds the header, cards,
    form and so on) and `snapshot(width)`. The highlights then measure columns
    and grids with the same code as the scored rows, so the two can't disagree.
  - `TOKENS` and a few DOM helpers are exported.
  - The dialog's status labels, icons and `summaryLine()` move here from
    `check.astro`. That way the report and the dialog describe a result in
    the same words.
- **`src/scripts/courtly-spec.ts`** (new): the criteria catalogue and
  `evaluate(doc, width) → Finding[]`. A finding holds an id, group, status,
  expected and actual values, source, and the elements or band to outline.
- **`src/scripts/courtly-report.ts`** (new): the `ReportSnapshot` type,
  versioned `encodeReport()` / `decodeReport()` (which also validates a
  decoded link), and `reportHref()`.
- **`src/scripts/courtly-compare.ts`** and **`src/components/CourtlyCompare.astro`**
  (new): the comparison viewer, covering fitting, aligned scroll, outlines
  redrawn on scroll, the findings list, jumping to a finding and width tabs.
  Two layouts: `inline` for the report, `full` for the check dialog
  (amendment).
- **`src/pages/labs/lab-7/report.astro`** (new): the report page, using
  `LabLayout` with `noindex` and no ToC rail. A page without headings gets
  the full width, which is a small change to `LabLayout`.
- **`src/pages/labs/lab-7/check.astro`**: the «Сформувати звіт» button, its
  enabling rule and its hint, and the «Звіт: <link>» line in the copied report
  once a report has been generated. It also imports the helpers moved to the
  engine. As amended, «Порівняти» shows the shared viewer (full layout) with
  the verdict picker in its toolbar, replacing the dialog's own copy.
- **Docs:** `docs/lab-7/README.md` gets a "Report page" section, and the root
  README's `src/` tree gains the new files.

## Verification

1. `npm run check && npm run build`.
2. **The engine refactor changes nothing.** The reference solution
   (`npm run mockup`) gives the same rows before and after: all 55 automated
   checks pass, and 12 / 12 with the 7 confirmable rows judged.
3. **Calibration:** the reference shows **zero red findings** at 1440, 768 and
   375. Any red there means a criterion is wrong, so fix the criterion, not
   the page.
4. **The real submission graded earlier:** its tablet form shows as L4 at 768
   only. Its other findings get reviewed one by one for false alarms.
5. **Broken reference:** change it in the frame (for example the footer
   background, the card radius, a wider container) and confirm the matching
   criterion turns red with the right expected and actual values.
6. **End to end:** check, judge, generate. In a fresh browser profile the link
   shows the same mark and rows, and the comparison loads. Measure the link's
   length. A corrupted link shows the error message. Take screenshots in light
   and dark themes and at 390 px.

## Not included

- Feeding findings into the mark, or deriving the mockup verdict from
  approved findings (the later attempt's approach). They stay hints.
- Tamper-proof reports and a history of reports, which need a backend.
- A frozen comparison, meaning captures of the student's page at grading
  time, which needs storage.
- Outlines on the mockup half, which would need per-element rects for the
  captures.
- Criteria that can't be measured reliably from arbitrary markup: hover
  states, the menu panel's internals, letter-spacing and shadows.

## Settled questions (instructor, 2026-10-03)

1. **The report is a snapshot carried in the link**, not a live re-run. See
   "Sharing without a backend".
2. **No highlights while judging in this PR** — reversed by the amendment:
   the dialog's «Порівняти» now uses `CourtlyCompare`, highlights included.
3. **«Скопіювати звіт» gains a «Звіт: <link>» line** once a report has been
   generated for the current run.

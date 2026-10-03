# Plan: Lab 7 auto-check — count Lighthouse ticks, grade Performance and mockup match

Status: implemented, 2026-10-03, on branch `feat/lab-7-check-grading`. The lasting
facts are in [README.md](README.md) → **Auto-check**, so this file can be deleted
once the branch is merged.

## Context

The instructor grades ЛР-7 with `/labs/lab-7/check/`. There are three gaps:

1. **Lighthouse doesn't count.** PageSpeed Insights (PSI) is usually out of quota, so the
   Lighthouse rows come back `skip`, and `scoreChecks()` drops `skip` rows from the
   denominator. Leaving a row unticked costs the student nothing, so the «Виконано»
   checkbox from PR #12 can only add points, never withhold them.
2. **Performance isn't graded.** It has weight 0 and no checkbox.
3. **Mockup match isn't graded.** The handout's first criterion («Сторінка відповідає
   макету на 1440, 768 і 375 px») is listed as "not automated".

**Decisions** (instructor, 2026-10-03):

- **Performance:** 3 points, bar **≥ 90** like the other categories.
- **Mockup match:** **3 manual ticks** (1440 / 768 / 375), 3 points each, plus a
  side-by-side viewer.
- **No pixel diff.** Independent implementations drift a few px per section, the drift
  compounds down the page, and the handout allows minor spacing/size deviations.

The max score goes from 110 to **122**.

## 1. Engine — `src/scripts/courtly-check.ts`

- **`Check.confirmable?: boolean`** marks rows the instructor confirms by hand. This replaces
  the page's hard-coded `group === 'lighthouse' && weight > 0` test.
- **Move the tick logic into the engine**, so every scoring rule lives in one file:
  `export function withTicks(checks, ticked: ReadonlySet<string>): Check[]`. It replaces the
  page's `reported()`. For a confirmable row:
  - ticked → `pass`, flagged `ticked: true`, detail «підтверджено вручну[; PageSpeed Insights: N / 100]» (as today);
  - unticked and `skip` → **`fail`**, detail «не підтверджено вручну[; <PSI reason>]», so it costs its weight;
  - unticked `warn`/`fail` from PSI → unchanged.

  Update the header comment's scoring paragraph and `scoreChecks()`'s note to match.
- **Lighthouse:** all four categories get weight 3 and are confirmable. Performance is retitled
  «Performance ≥ 90». One threshold rule for all four (≥ 90 pass, ≥ 80 warn, else fail).
  The weight-0 branch goes.
- **New group** `{ id: 'mockup', title: 'Відповідність макету' }`, placed before `lighthouse`.
  `inspect()` adds `mockup-1440` / `mockup-768` / `mockup-375` («Desktop 1440 px — як у
  макеті» etc.), each weight 3, `skip`, confirmable, detail «звірте в переглядачі».
- **`Inspection.preview: string`**: the existing `frameSource(doc, base, 'layout')` output
  (scripts stripped, `<base>` pointing at the student URL). The viewer reuses it, so it gets
  the same isolation as the layout pass (`sandbox="allow-same-origin"`, no scripts).
- **`export function sectionAnchors(doc): Record<string, number>`** returns the page offsets of
  `hero` (the `<section>` holding `<h1>`), `search`, `venues`, `how`, `about`, `cta` (the section
  holding the last `main a[href="#search"]`), `footer`, and `end` (scrollHeight). Sections the
  page lacks are left out. The function must be self-contained, because it is also serialised
  with `toString()` and run in the reference page (§3).

## 2. Check page — `src/pages/labs/lab-7/check.astro`

- `reported()` → `withTicks(current.checks, manual)`; `canTick` → `c.confirmable`.
  `tickBox()` locks the box only for a PSI pass (`pass && !ticked`), as today.
- A group opens by default while it has unticked confirmable rows. The hint under the group
  depends on the group: the Lighthouse one stays as is; the mockup one says «Відкрийте
  «Порівняти», звірте з макетом і позначте ширини, що збігаються».
- Each mockup row gets a **«Порівняти»** button (`.cc-copy`-style) that opens the viewer at that width.
- **Viewer**: a second full-viewport `<dialog class="cc-compare">`, shown with `showModal()` on top of the report.
  - Toolbar: title, width switch (`aria-pressed` buttons «Desktop 1440 / Tablet 768 / Mobile 375»),
    the current width's «Виконано» checkbox (it and the report's checkboxes both call
    `setTick(id, on)`), and a close button. Escape closes only the viewer (native behaviour for
    nested modals opened by a click).
  - Two columns, «Макет» | «Сторінка студента». Each shows a device viewport (1440×900, 768×1024,
    375×812) scaled by `s = min(1, columnWidth / W, availableHeight / V)`, recomputed on resize
    (ResizeObserver), and centred vertically.
  - Mockup side: a native scroll container (`tabindex="0"`, labelled region, hidden scrollbar)
    holding the capture at `W·s`.
  - Student side: an iframe of `W×V` CSS px with `srcdoc = preview` and `transform: scale(s)`.
    It has `pointer-events: none`, because a click on a student link would navigate the frame
    to the live, cross-origin site. A wheel event over this column is forwarded to the mockup scroller.
  - **Section-aligned scroll**: the mockup scroller drives the frame. Mockup y maps to student y
    piecewise-linearly between the anchors both pages have, keeping only anchors that increase
    on both sides. The result goes to `frame.contentWindow.scrollTo()`. Student anchors are
    measured with `sectionAnchors()` after load and `fonts.ready`, and again after each width change.
- Mockup data comes from `import mockup from "@/data/courtly-mockup.json"` (§3).
- Text updates: header comment, `.cc-note`, «Що перевіряється» (add a mockup bullet),
  «Як рахується оцінка» (unticked confirmable rows score 0; max includes them), «Обмеження»
  (mockup match is judged by the instructor in the viewer).
- Styles go in the existing `<style is:global>` block, `.cc-compare*` prefix, using site tokens
  (`--border`, `--card`, `--foreground`, `--color-brand-blue`) like the rest of the block.
  Visible `:focus-visible` on new controls, and a `prefers-reduced-motion` guard if anything
  animates (see [design-system.md](../agents/design-system.md)).

## 3. Mockup anchors — `docs/lab-7/render-mockup.mjs` → `src/data/courtly-mockup.json` (new)

- `render-mockup.mjs` imports `sectionAnchors` from the engine (Node 24 strips TS types).
  In `fullPage()` it evaluates `(${sectionAnchors})(document)` on the page state it captures, then writes
  `{ "1440": { "src": "/labs/lab-7/mockup-desktop.webp", "height": 4925, "anchors": {…} }, "768": …, "375": … }`.
  The captures and their anchors are then always generated together.
- Generate it now by running the script (needs the local-only `docs/lab-7/mockup/`). If the
  re-rendered `.webp`/`og-image.jpg` keep their dimensions (4925 / 5523 / 8036) and differ
  only in bytes, restore them from git so the diff stays clean. If the dimensions changed,
  keep the new captures and update the heights in `CourtlyMockup.astro`.

## 4. Handout — Performance ≥ 90 (follows from the chosen bar)

- `src/content/labs/lab-7.md` §4: «Accessibility, Best Practices, SEO і Performance — не
  нижче 90». Drop «Для Performance порогу немає», and keep the heavy-images / sizes /
  blocking-resources sentence as how to get there. Checklist line becomes
  «A11y / BP / SEO / Performance ≥ 90».
- Rebuild `public/labs/lab-7.pdf` with `python docs/build-handout.py lab-7`.
- ⚠ Students already have the current handout. The instructor must tell them about the new bar.

## 5. Docs

- [README.md](README.md):
  - Audit-bar line: add Performance.
  - Auto-check → Scoring: confirmable rows; unticked = 0.
  - "Not automated" → the mockup viewer and manual ticks.
  - Local test: 12/12 **after ticking the 4 Lighthouse + 3 mockup rows**, since PSI can't reach localhost.
  - Regenerating: `render-mockup.mjs` also writes `src/data/courtly-mockup.json`.

## Verification

1. `npm run check && npm run build`.
2. `npm run mockup` (http://localhost:4400/) + `npm run dev`. Drive headless Edge over CDP (same
   approach as `render-mockup.mjs`; use `mobile: false` at phone widths) to
   `/labs/lab-7/check/?url=http://localhost:4400/`:
   - With nothing ticked: the 7 confirmable rows show «Не виконано» and the mark is below 12.
   - Tick all 7 → **12 / 12**, max 122.
   - Untick one → the mark drops.
3. Viewer: open it at 1440 / 768 / 375 and screenshot each. Scroll the mockup to its `venues` anchor
   and assert the frame's `scrollY` equals the student `venues` anchor. Tick inside the viewer →
   the report's mark and checkbox update.
4. Copy-report text: unticked rows read «не підтверджено вручну», ticked rows «підтверджено вручну».
5. Run against one deployed URL (with or without PSI) to confirm PSI rows still lock when PSI passes.

## Not included (possible follow-ups)

- Keeping ticks in the `?url=` link (e.g. `&ok=lh-a11y,mockup-1440`). Today, reloading or
  re-running clears all 7 ticks.
- An automated section-background or section-order check against the mockup.

## Follow-up (2026-10-03): three-way verdicts and form rows

Found while grading a real submission: at 768 px the student's form was
`2 + 1 + 1` (three rows), yet «Форма: 1 колонка → 2 × 2 → 4 в рядок» passed,
because it counted only distinct left edges. Also, a binary tick could not
express "matches the mockup apart from small details".

- **Form check counts rows too.** The layout pass records the controls' rows
  (distinct vertical centres) next to their columns. 768 px must be 2 × 2,
  1440 px 4 × 1, 375 px 1 column. The detail reads `колонок × рядків: … / … / …`.
- **Mockup rows take a verdict, not a tick:** «Виконано / Частково / Не
  виконано» radios (pass / warn = half / fail), in the report and in the viewer
  toolbar. No verdict yet still scores 0 («не оцінено вручну»). Lighthouse rows
  keep the «Виконано» checkbox: their only bar is ≥ 90 (instructor, same day).
  `Check.confirmable` says which control a row gets (`'tick' | 'verdict'`);
  `withTicks()` becomes `withVerdicts()` (a tick is the verdict `pass`), and
  `Check.ticked` becomes `Check.manual`.
- Docs: README → Auto-check, plus the check page's own text.

## Follow-up 2 (2026-10-03): report clarity

From reviewing a real copied report (11 / 12, all losses in SEO + the tablet form):

- **Comment on a mockup verdict.** Once a width is judged, a one-line comment
  field appears under it. The comment goes into the row's detail («оцінено
  вручну: …»), so the copied report says why. `withVerdicts()` takes the notes.
  Typing updates the detail in place; it does not re-render the report.
- **og:image that fails to load.** `fetch()` cannot see the status of a
  cross-origin 404 without CORS (Vercel's 404s send none), so it reported
  «помилка мережі». Fall back to loading it as an image, and say
  «og:image «<url>» не відкривається», with the status when known.
  Canonical and og:url name the other site when they point to a different host.
- **No restated details on a pass.** Columns, form grid and heading sizes show
  their measurements only when the row is not `pass`.

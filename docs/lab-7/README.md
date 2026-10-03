# Lab 7 — Проміжний контроль №1 (Courtly)

The midterm brief, turned into two pages on the course site:

| Route | Source | What it is |
| --- | --- | --- |
| `/labs/lab-7/` | `src/content/labs/lab-7.md` | the handout: requirements, audit, report, checklist |
| `/labs/lab-7/task/` | `src/content/tasks/lab-7.md` | the design reference: mockup, tokens, grid, components, images |

The split follows Lab 2's decision (docs/lab-2/README.md §3): the handout is
read once, the design reference stays open beside the editor.

## What changed against the original brief

The source document had no visual reference and no token values (`:root`
with `...`), so students would each have invented a design and supplied their
own images. The revision adds both and fixes the gaps found in review:

- **Mockup + design system + asset pack** — the task page, `tokens.css`,
  `public/labs/courtly-assets.zip`.
- **Card grid** — "3 × 2 on desktop" contradicted "the featured card is
  larger": a 2-column featured card leaves an orphan (2 + 5 = 7 cells). Now
  featured is 2 columns × 2 rows (4 + 5 = 9 = 3 × 3), and 1 column on tablet.
- **Container query dropped** (instructor's call, 2026-09-29): too complex for
  the midterm. The featured card's horizontal desktop layout stays in the
  mockup; students may build it however they like. The local mockup source
  still uses a container query — that is fine, it is not handed out.
- **INP / reduced motion dropped** from the handout; the Lighthouse deliverable
  is one screenshot.
- **Audit bar** — Mobile, Incognito, deployed URL; Performance / A11y / BP /
  SEO ≥ 90 (Performance had no threshold until 2026-10-03).
- **Link targets** — a table of section `id`s; card buttons are
  `<button type="button">` with unique accessible names.
- **Form data**, **mobile header** (menu below 1024 px, "Забронювати" moves
  into it), **320 px reflow**, **absolute `og:image`**, email subject.

No deadline or grading section: Lab 7 is a test, so neither belongs in the
handout.

## Regenerating

```sh
node docs/lab-7/generate-assets.mjs   # courtly-assets/img/*.webp (deterministic)
node docs/lab-7/render-mockup.mjs     # public/labs/lab-7/*.webp + og-image.jpg + src/data/courtly-mockup.json (Edge, network)
python docs/lab-7/build-pack.py        # public/labs/courtly-assets.zip (+ SPEC.md, mockup/)
python docs/build-handout.py lab-7    # public/labs/lab-7.pdf
```

Order matters: render the captures before building the pack, since the pack
copies them. `src/data/courtly-mockup.json` records where each section starts
in the full-page captures; the auto-check's viewer aligns on it, so it is
written in the same run as the captures. `SPEC.md` in the zip is generated from §2–5 of
`src/content/tasks/lab-7.md`, so edit the spec there, never in the zip.

If a capture's height changes, update the `height` in
`src/components/CourtlyMockup.astro` (it only reserves space).

## The mockup source is local-only

`docs/lab-7/mockup/` (index.html + style.css) is a complete, compliant
implementation of the brief, used to render the captures. It is
**gitignored** on purpose: the repository is public, and committing it would
publish the answer. Back it up outside the repo. It doubles as a grading
reference: semantic structure, the focus-colour override, `aria-expanded` on
the menu.

## Auto-check (beta)

`/labs/lab-7/check/` (`src/pages/labs/lab-7/check.astro`, engine in
`src/scripts/courtly-check.ts`): the instructor pastes a student's deployed
URL and gets a report with a mark on the 12-point scale. It runs
entirely in the browser — GitHub Pages and Vercel both send
`Access-Control-Allow-Origin: *`, so the page's HTML, CSS, `robots.txt` and
`sitemap.xml` can be fetched directly. Layout is measured in a script-less,
same-origin `srcdoc` iframe resized to 320 / 375 / 768 / 1440 px; the mobile
menu runs in a second iframe sandboxed to `allow-scripts` only, so student JS
cannot reach the course site.

- **Instructor-only, by obscurity:** nothing links to the page and it is
  `noindex`, but the route is public and visible in this repo. A student
  self-check with a one-attempt limit was tried and dropped (2026-09-29): a
  limit kept in the browser is trivially reset, so it needs a backend.
- **`?url=<student URL>`** runs the check on load; the address bar keeps it
  after every run, and the link icon next to «Скопіювати звіт» copies it. The
  link re-runs the check when opened, so it cannot be forged — but it shows
  the site as it is at that moment, not at the first run. A frozen snapshot
  (or a PDF) would be editable by students without a backend to sign it.
- **Trying it locally:** `npm run mockup` serves the reference solution at
  `http://localhost:4400/` with CORS, adding the canonical, Open Graph,
  `robots.txt` and `sitemap.xml` it lacks at serve time
  (`docs/lab-7/serve-mockup.mjs`). Paste that URL into the checker on
  `npm run dev`; expected 12 / 12 once the 3 mockup rows are judged «Виконано»
  and the 4 Lighthouse rows ticked (PageSpeed Insights cannot reach localhost). To test
  failures, break a copy of the mockup's HTML/CSS and reload — the server
  reads files on every request.
- **Scoring:** each check has a weight; pass = full, partial = half, fail = 0,
  not-checked rows leave the denominator; `round(percent × 12)`, min 1. Tune
  weights in the `add(...)` calls and the mapping in `scoreChecks()`.
- **Confirmable rows**, 3 points each, take the instructor's verdict: mockup
  match at 1440 / 768 / 375 — «Виконано / Частково / Не виконано» (full / half
  / 0); the four Lighthouse categories — a «Виконано» checkbox, since their
  only bar is ≥ 90. A row nothing could check and nobody judged counts as
  **fail**, not "left out" (`withVerdicts()`), so judge them before copying
  the report. A judged mockup row gets a one-line comment field; the comment
  becomes the row's detail («оцінено вручну: …»), so the student reads why.
  Verdicts and comments are kept in memory only: a reload or a new run clears
  them.
- **Mockup match** is judged by the instructor, not computed: a pixel diff of
  an independent implementation is unreliable, and the handout allows minor
  spacing and size deviations. «Порівняти» opens the comparison viewer at that
  width — the same one as the report page's, described under "Report page":
  the capture beside the student's page, scroll re-aligned at every section
  start, and the written requirements the page misses outlined and listed.
  The outlines are hints for the verdict, not the verdict; the picker in the
  viewer's toolbar is. The guidance shown with the rows:
  «Частково» = structure and responsiveness right, but some elements visibly
  differ. A deviation an automated row measures (columns, form grid, header)
  is that row's to penalise; don't take it off the mockup verdict as well.
- **Not automated, not scored:** the email and the AI write-up.
- **Lighthouse** uses the PageSpeed Insights API. The keyless quota is shared
  and usually exhausted, so set a repository variable `PSI_API_KEY` (Google
  Cloud → PageSpeed Insights API → API key, restricted to the HTTP referrer
  `denysmatsevych.github.io/*`); the deploy workflow passes it in as
  `PUBLIC_PSI_API_KEY`. Without it the Lighthouse rows show «Не виконано»
  until ticked from the student's screenshot; a category PSI passes is locked
  as passed.
- **Verified against** the local reference solution (with canonical, OG,
  robots and sitemap added): 12 / 12 with the 7 confirmable rows judged or
  ticked «Виконано», all 55 checks pass.

## Report page

`/labs/lab-7/report/` (`src/pages/labs/lab-7/report.astro`) is what the
student receives. «Сформувати звіт» in the check dialog opens it. The button
becomes active once Lighthouse has landed and all 3 mockup rows are judged;
Lighthouse ticks are optional, since an unticked row already counts as
failed. Plan and decisions: [report-page-plan.md](report-page-plan.md).

- **The report lives in its link.** The URL fragment holds the rows as
  graded, as compressed JSON (`src/scripts/courtly-report.ts`, about 3 KB).
  The report never changes when the student edits the site, and nothing is
  stored anywhere. Anyone who decodes the link can edit it, which is fine for
  the student's copy; the mark of record is the gradebook. A changed verdict
  needs a new link: the dialog says so, and «Скопіювати звіт» then leaves the
  stale «Звіт:» line out.
- **Results** are the dialog's groups and rows, read-only, with the
  instructor's verdicts and comments.
- **«Порівняння з макетом»** renders the page as it is *now* beside the
  mockup capture, and outlines the written requirements it misses at that
  width (`src/scripts/courtly-spec.ts`: 29 criteria, each citing the handout
  or the spec, plus an amber hint for a section over 30 % taller or shorter
  than in the mockup). The outlines are hints and never feed the mark. A
  criterion whose elements can't be found shows «не перевірено» rather than a
  red outline. Columns, the form grid and the header are measured with the
  checker's own `locate()` / `snapshot()`, so an outline cannot contradict a
  scored row.
- **One viewer, two layouts** (`CourtlyCompare` + `courtly-compare.ts`): the
  report shows it `inline`, the findings under the panes; the check dialog's
  «Порівняти» shows it `full`, the panes as large as the screen allows and the
  findings beside them, with the verdict picker in its toolbar.
- **Calibration:** the reference solution must show zero red findings at
  1440, 768 and 375, in both places. A red finding there means a wrong
  criterion, so fix the criterion, not the page. To test a criterion, break
  the reference in the viewer's frame with injected CSS rather than editing
  the files. The viewer waits for the frame's styles to follow a width
  change before measuring; measuring a fixed number of animation frames
  after it read the previous width's `clamp()` sizes and media queries.

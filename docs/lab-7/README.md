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
- **Audit bar** — Mobile, Incognito, deployed URL; A11y / BP / SEO ≥ 90.
- **Link targets** — a table of section `id`s; card buttons are
  `<button type="button">` with unique accessible names.
- **Form data**, **mobile header** (menu below 1024 px, "Забронювати" moves
  into it), **320 px reflow**, **absolute `og:image`**, email subject.

No deadline or grading section: Lab 7 is a test, so neither belongs in the
handout.

## Regenerating

```sh
node docs/lab-7/generate-assets.mjs   # courtly-assets/img/*.webp (deterministic)
node docs/lab-7/render-mockup.mjs     # public/labs/lab-7/*.webp + og-image.jpg (Edge, network)
python docs/lab-7/build-pack.py        # public/labs/courtly-assets.zip (+ SPEC.md, mockup/)
python docs/build-handout.py lab-7    # public/labs/lab-7.pdf
```

Order matters: render the captures before building the pack, since the pack
copies them. `SPEC.md` in the zip is generated from §2–5 of
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
URL and gets a report with an estimated mark on the 12-point scale. It runs
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
  `npm run dev`; expected 12 / 12 (Lighthouse rows are skipped — PageSpeed
  Insights cannot reach localhost). To test failures, break a copy of the
  mockup's HTML/CSS and reload — the server reads files on every request.
- **Scoring:** each check has a weight; pass = full, partial = half, fail = 0,
  not-checked rows leave the denominator; `round(percent × 12)`, min 1. Tune
  weights in the `add(...)` calls and the mapping in `scoreChecks()`.
- **Not automated:** visual match with the mockup, the email, the Lighthouse
  screenshot, the AI write-up. The page says so.
- **Lighthouse** uses the PageSpeed Insights API. The keyless quota is shared
  and usually exhausted, so set a repository variable `PSI_API_KEY` (Google
  Cloud → PageSpeed Insights API → API key, restricted to the HTTP referrer
  `denysmatsevych.github.io/*`); the deploy workflow passes it in as
  `PUBLIC_PSI_API_KEY`. Without it the Lighthouse rows show "not checked" and
  do not affect the mark.
- **Verified against** the local reference solution (with canonical, OG,
  robots and sitemap added): 12 / 12, all 48 checks pass.

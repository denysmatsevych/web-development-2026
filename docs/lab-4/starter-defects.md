# Lab 4 — FlowTask starter: defect map

Instructor-side companion to `/labs/lab-4/task/`. The student brief deliberately
names no specific defect; this file is the build spec for the starter and the
grading reference.

| Source | Becomes |
| --- | --- |
| `src/content/labs/lab-4.md` | `/labs/lab-4/` |
| `src/content/labs/lab-4.md` via `docs/lab-4/build-handout.py` | `/labs/lab-4.pdf` (re-run after editing the handout) |
| `src/content/tasks/lab-4.md` | `/labs/lab-4/task/` |
| `flowtask-starter/` (see §6) | the code students audit |

## 1. Why a seeded starter

Auditing the Lab 3 pricing section would not work: three cards are too small a
surface, so several checks collapse into formalities, and Lighthouse numbers from
a live third-party site are not comparable between students. A seeded starter
fixes the defect count per category, makes the *causes* of the performance
problems controlled rather than incidental, and lets every submission be graded
against the same baseline. Stated for students in §3 of the handout.

## 2. Page inventory

`index.html` — header (logo, nav, Sign in, Get started), then Hero, Features,
How it works, Pricing, Testimonials, FAQ, Trial form, footer. `about.html` — a
thinner second page; it exists so `sitemap.xml` has more than one URL and so
`canonical` has to be reasoned about per page rather than pasted once.

## 3. Part A — findable quickly

Either an automated tool reports them, or the markup gives them away on sight.

| ID | Category | Seeded defect | Exercises | Reported by |
| --- | --- | --- | --- | --- |
| A1 | a11y | Hero CTA as `<div class="button">Get started</div>` — no role, not focusable, click-only | 4.1.2, 2.1.1 | manual / AI |
| A2 | a11y | Nav items as `<div class="nav-item">Products</div>` — the nav contains no links | 1.3.1, 2.1.1 | manual / AI |
| A3 | a11y | `<img src="img/hero.jpg">` with no `alt`; one decorative icon with `alt="icon"` | 1.1.1 | axe `image-alt` (the second one passes — that is the point) |
| A4 | a11y | `<h1>FlowTask</h1>` followed by `<h4>Why FlowTask?</h4>` | 1.3.1 | axe `heading-order` |
| A5 | a11y | Trial form inputs carry `placeholder` only, no `<label>` | 1.3.1, 3.3.2 | manual — axe `label` **passes**: it accepts a non-empty `placeholder` as the accessible name, so this one counts toward §4.3's "found by hand" |
| A6 | a11y | Muted body text at ≈ 2.8 : 1, plus one borderline string (`.soft`) at ≈ 4.4 : 1 | 1.4.3 | axe `color-contrast` — both, including the 4.4 : 1 one; the DevTools picker is for showing the exact ratio at the defence |
| A7 | a11y | No `lang` on `<html>` | 3.1.1 | axe `html-has-lang` |
| A8 | SEO | No meta description, no `canonical`, no Open Graph; `<title>FlowTask</title>` identical on both pages | §4.6, 2.4.2 | Lighthouse `meta-description` only. `canonical` comes back not-applicable when absent, Open Graph is not checked, and `document-title` passes because a title exists — the rest is manual |
| A9 | perf | `hero.jpg` ≈ 3 MB, no `width`/`height`, no `fetchpriority` | LCP + CLS | Lighthouse |
| A10 | perf | `<script src="js/main.js">` in `<head>`, no `defer` | render blocking | Lighthouse |
| A11 | a11y | Icon-only social links at 18 × 18 px with 4 px between them, icon marked `aria-hidden`, no text | 2.5.8 (new in 2.2), 4.1.2 | axe `link-name` and `target-size`. The gap is what fails 2.5.8: at the original 10 px the 24 px spacing circles do not overlap, the exception applies and the check rightly passes |

## 4. Part B — needs investigation

Automated tools either stay silent or report something that looks fine. This is
where the lab is actually won or lost.

| ID | Category | Seeded defect | Exercises | Why automation misses it |
| --- | --- | --- | --- | --- |
| B1 | a11y | `<button aria-label="Get started button">Get started</button>` | 4.1.2 | The name contains the visible label, so `label-content-name-mismatch` (2.5.3) passes. Only the Accessibility Tree shows the role spoken twice: "Get started button, button". Seeding `aria-label="button"` instead is caught by that rule, so it would be Part A. |
| B2 | a11y | `<div role="button" tabindex="0">Start free trial</div>` with a click handler and no `keydown` | 2.1.1 | Role and focusability are both present; Enter and Space simply do nothing. **Primary AI trap** — the usual suggestion is to add a key handler, not to use `<button>`. |
| B3 | a11y | `role="navigation"` on `<nav>`, `role="button"` on `<button>`, `aria-label` repeating visible text | 4.1.2 | Redundant ARIA breaks no rule. Ask the AI for advice here and it will typically propose *more* attributes. |
| B4 | a11y | Sticky 76 px header covers the focused element; no `scroll-padding-top` | 2.4.11 (new in 2.2) | No automated rule exists. Reproduces on **Shift+Tab** (the element is scrolled to the top edge, under the header) and via in-page links such as the footer's `#pricing`; forward Tab scrolls to the bottom edge and looks fine. Only visible once B5 is fixed — with no focus ring there is nothing to see being obscured. |
| B5 | a11y | `outline: none` on `:focus` with no replacement | 2.4.7 | Focus visibility is not automatable. |
| B6 | a11y | FAQ accordion: `aria-expanded="true"` hard-coded in HTML while every answer is hidden, never updated by `main.js` | 4.1.2 | The attribute is present and valid, so it passes; it is just permanently wrong. |
| B7 | a11y | Empty-email error shown only as a red `box-shadow` on the field; no text, no `aria-invalid`, no focus move | 3.3.1, 1.4.1 | Nothing runs on page load for a tool to see; the state exists only after a failed submit. §5.1 of the handout names 3.3.1 explicitly. |
| B8 | SEO | JSON-LD `Product` "FlowTask Pro" with an `aggregateRating` and an `offers.price` of 19.00 that contradict the page: the visible Pro plan is $29, and the page carries three testimonials, not 1 284 ratings | §4.5 conclusion | Syntactically valid, so Schema Markup Validator passes. The contradiction is only visible by reading the page. |
| B9 | SEO | `<meta name="robots" content="noindex">` on a page that should be indexable | crawling vs indexing | Lighthouse *does* flag this — but the fix requires knowing why `robots.txt` is the wrong lever. |
| B10 | SEO | `robots.txt` ships with `Disallow: /css/` and `Disallow: /img/` and no `Sitemap:` line; `sitemap.xml` absent | §4.6 | Blocking CSS and images is the classic case; the missing sitemap has to be noticed, not reported. |
| B11 | SEO | Repeated "Read more" / "Learn more" link text; one in-page link to a non-existent anchor | 2.4.4 | Link text quality is a judgement call. |
| B12 | perf | `@font-face` with no `font-display`, stylesheet-discovered late | FOIT, CLS | Needs the Network panel to see the cause. |
| B13 | perf | `main.js` injects a ≈ 110 px promo banner above the header 800 ms after `load` | CLS | Lighthouse reports the shift but, in 13.5, attributes the culprit to the unsized hero (A9); only a Performance trace or a `layout-shift` observer shows the banner. Measured locally: CLS 0.13 Mobile, 0.08 Desktop (desktop divides by the 1350 px width). |
| B14 | perf | "Get started" handler runs a ≈ 300 ms synchronous loop | TBT / INP | Invisible to a Lighthouse run — this is the defect that forces a Performance-panel trace, and the reason the handout explains INP is field-only. |
| B15 | perf | **Not to be fixed:** "Minify CSS" (est. 2 KiB) | §5.4 item 3, alternative branch | A real Lighthouse finding that the correct answer is to decline: no build step exists, and the transfer is already compressed. Without it, "обґрунтовано показати, що проблема не потребує зміни" is not gradeable. Not "Use efficient cache lifetimes": it is reported too, but on Vercel — where the handout sends measurement — `vercel.json` headers can fix it, so declining is not clearly right. "Reduce unused CSS" never appears: the stylesheet is below the audit's threshold. |
| B16 | a11y | Successful submit replaces the form with `innerHTML`; no live region, focus lost to `<body>` | 4.1.3 | Status messages are not automatable; needs a keyboard pass through the form. |

### Calibration

The "Reported by" and "why automation misses it" columns were checked against
Lighthouse 13.5 (axe-core inside) on 2026-09-23, served locally, default Mobile
and `--preset=desktop`: Performance 70 / 84, Accessibility 79, SEO 50, TBT 0 ms
on both. Re-run after any edit to the starter — a single attribute decides
whether a defect sits in Part A or Part B (B1 and A11 both moved on that run).

## 5. Coverage against the handout

| Handout requirement | Covered by |
| --- | --- |
| §5.4.1 — ≥ 2 accessibility fixes | A1–A7, A11, B1–B7, B16 |
| §5.4.2 — ≥ 2 technical SEO fixes | A8, B8–B11 |
| §5.4.3 — ≥ 1 performance fix *or* justified refusal | A9, A10, B12–B14 / **B15** |
| §5.4.4 — ≥ 1 rejected AI recommendation | **B2** (primary), B3 |
| §4.3 — a problem automation cannot report | A5, B1, B4, B5, B7, B14, B16 |
| §4.5 — structured data must match content | **B8** |
| §4.6 — robots.txt and sitemap.xml | B9, B10 |
| §4.7 — LCP / CLS / TBT with identified causes | A9 (LCP), B13 (CLS), B14 (TBT) |
| task §6 — no ARIA "just in case" | B1, B3 |
| §7 — "which element is the LCP element?" | A9 (hero image) |

Every row of §5.4 has at least two candidates, so a student who misses one still
has a route to the minimum.

## 6. The starter as built

`flowtask-starter/` at the repo root — outside `src/`, so Astro never sees it.
It is plain static files; there is no build step.

```text
index.html   header, hero, features, how it works, pricing, testimonials,
             FAQ, trial form, footer — carries A1–A11 and B1–B16
about.html   thin second page: same <title>, no canonical, indexable
css/         styles.css — B4 (sticky header), B5 (outline: none), B12
             (@font-face without font-display), A6 palette, A11 (4 px social
             gap), the ≈ 110 px .promo for B13, and an unused app-shell
             block — part of the bulk behind B15's "Minify CSS"
js/          main.js — A1/B2 click-only handlers, B6 (aria-expanded never
             updated), B7 (colour-only error), B16 (innerHTML success),
             B13 (banner 800 ms after load), B14 (300 ms sync loop)
img/         hero.jpg (4000 × 2500, ~2.8 MB), logo, 3 feature icons, 3 avatars
fonts/       inter-latin.woff2 — Inter, SIL OFL 1.1
robots.txt   Disallow: /css/ + /img/, no Sitemap: line (B10)
.nojekyll    sitemap.xml is absent on purpose (B10)
README.md    how to run and deploy; names no defect
```

**Assets.** `docs/lab-4/generate-assets.mjs` regenerates `hero.jpg` and the
avatars (`node docs/lab-4/generate-assets.mjs` from the repo root; `sharp` comes
from the site's own `node_modules`). The hero is grain over a gradient with a
translucent app-window mock composited on top: the mock makes it read as a
product screenshot, the grain keeps it genuinely heavy. Flat vector art at the
same dimensions compresses to ~200 KB and A9 stops being a finding, so do not
"optimise" this file.

**Delivery.** `public/labs/flowtask-starter.zip` (~2.85 MB), linked from §2 of
the brief. Students unpack it either into a repository of its own or into a
`lab-4/` folder of their multi-lab repository — most of them already keep
`lab-1/`, `lab-2/`, … side by side, and nothing in the starter needs repo root.
The only real constraint is that the **Vercel** deploy must serve the project
from the origin root, or §4.6's `robots.txt` check has nothing to look at; for
the nested layout that is Vercel's *Root Directory → `lab-4`* setting. GitHub
Pages serves a subfolder fine, but `.nojekyll` only counts at the root of the
published branch, so the nested layout needs a copy there. Both §7 of the brief
and the starter README spell this out.

Nothing broken is served from the course origin — which B9 and B10 would
otherwise put a `noindex` page and a CSS-blocking `robots.txt` on.

Regenerate after editing the starter. Do **not** use `tar -a -cf out.zip`:
`-a` picks a compression filter by suffix, `.zip` is not one, and bsdtar
silently writes a plain tar under a `.zip` name — Windows Explorer then refuses
to open it. Use Python's `zipfile`, which also guarantees forward slashes:

```bash
python - <<'EOF'
import os, zipfile
src, out = 'flowtask-starter', 'public/labs/flowtask-starter.zip'
top = ['index.html', 'about.html', 'README.md', 'robots.txt', '.nojekyll']
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for n in top:
        z.write(os.path.join(src, n), n)
    for d in ['css', 'js', 'img', 'fonts']:
        for root, _, files in os.walk(os.path.join(src, d)):
            for f in sorted(files):
                full = os.path.join(root, f)
                z.write(full, os.path.relpath(full, src).replace(os.sep, '/'))
EOF
```

Check the result starts with `PK`: `head -c 4 public/labs/flowtask-starter.zip`.

Still open: whether the starter also becomes a GitHub template repo, which
would give students "Use this template" instead of unpack-and-push. The zip
works either way, so this can wait until the lab has run once.

## 7. Route changes this needed

`labs/[lab]/task.astro` had Lab 2's acceptance rows in a `const` and rendered
`MockupLightbox` (i.e. `PricingMockup`) unconditionally, so a second brief would
have inherited both. Acceptance rows now live in each brief's `acceptance`
frontmatter and the mockup behind an optional `mockup` field; Lab 2's page
renders the same rows and mockup as before. This resolves the open question left in
`docs/lab-2/implementation.md` §11.2 in favour of frontmatter.

`AcceptanceChecklist` also keyed its `localStorage` state to the literal string
`lab-2-acceptance`. With per-brief criteria that key is shared across ТЗ, so
ЛР-2's saved ticks would restore against ЛР-4's twelve rows by index. It is now
keyed to `location.pathname`. The one visible cost: ticks a student already
saved on ЛР-2 under the old key are not carried over.

---
title: "FlowTask — starter project for a web quality audit"
summary: "A landing page for a SaaS service with deliberately introduced accessibility, technical SEO, and performance problems. The basis for the audit in Lab 4-5."
goal: "Perform a comprehensive audit of the provided FlowTask starter project, confirm each problem you find, fix the justified ones, and re-check the result. The practical part corresponds to section 5 of the lab."
label: "Assignment"
highlights:
  - "Provided starter project"
  - "2 pages"
  - "Parts A and B"
  - "Bonus until September 30, 2026"
acceptance:
  - "Initial audit recorded before any changes, along with measurement conditions"
  - "Accessibility — at least 2 confirmed problems fixed"
  - "Technical SEO — at least 2 confirmed problems fixed"
  - "Performance — 1 fix or justification that no change is needed"
  - "AI — 5 recommendations analyzed, at least 1 rejected with a citation"
  - "JSON-LD matches actual content and passes Schema Markup Validator"
  - "Open Graph — og:title, og:description, og:type, og:url, og:image"
  - "robots.txt at origin root; does not block CSS, JS, or images"
  - "sitemap.xml with absolute URLs for both pages"
  - "canonical and og:url point to one chosen canonical origin"
  - "Re-audit performed under identical conditions; before / after table filled in"
  - "FlowTask visual concept preserved"
updated: 2026-09-22
---

## 1. Overview

**FlowTask** is a fictional SaaS service for managing team projects. The
provided starter project is its landing page: a compact but realistic page with
navigation, a hero section, feature descriptions, pricing, testimonials, an FAQ,
and a trial sign-up form.

The code is written as if it were assembled quickly before a deadline: the page
looks acceptable, but contains **deliberately introduced problems** with
accessibility, technical SEO, and performance. Your task is not to code
something new, but to audit this code: find the problems, confirm each one with
a tool or a manual check, fix the justified ones, and re-check the result.

> Building a layout from scratch is not part of this lab. The visual concept of
> FlowTask must remain unchanged.

## 2. Project structure

**Download:** [flowtask-starter.zip](/uk/web/starters/flowtask-starter.zip) (≈ 2.8 MB).
Unpack the archive either into a **separate repository** (the simplest option) or
into the `lab-4/` folder of your shared repository for lab assignments — both
options are acceptable. Only one thing is essential: on **Vercel**, the project
must be served from the origin root, otherwise `robots.txt` will not be where the
crawler reads it (§4.6 of the lab). How to achieve this in each scenario is
described in §7.

```text
flowtask-starter/
├── index.html          main page — the object of the audit
├── about.html          second page (needed for sitemap and canonical)
├── css/
│   └── styles.css
├── js/
│   └── main.js
├── img/
│   ├── hero.jpg        hero section illustration
│   ├── feature-*.svg   feature icons
│   ├── avatar-*.jpg    photos in testimonials
│   └── logo.svg
├── fonts/              local webfont
├── robots.txt
├── .nojekyll           needed for GitHub Pages
└── README.md           how to run and deploy
```

The project is static: no compilation is needed, and there is no build tool.
Locally, opening it with any local server is sufficient — but run the audit on
the **deployed** version, not through `file://` (see §4.7 of the lab).

Note that the file list does not include everything a finished page needs, and
that the existing files are not necessarily correct. This is part of the
assignment.

## 3. Page structure

```text
<header>
    logo
    navigation
    Sign in
    Get started

<main>
    Hero
    ├── heading
    ├── description
    ├── CTA
    └── image

    Features
    ├── feature
    ├── feature
    └── feature

    How it works
    ├── step
    ├── step
    └── step

    Pricing
    ├── Basic
    ├── Pro
    └── Enterprise

    Testimonials

    FAQ

    Contact / Trial form

<footer>
```

This structure is sufficient to explore landmarks, heading hierarchy,
navigation, links and buttons, images, the form and its labels, keyboard
interaction, focus, contrast, ARIA, and accessible names — as well as the full
set of technical SEO and performance topics from section 4 of the lab.

## 4. Two tiers of problems

The problems in the project are intentionally divided into two levels of
difficulty.

**Part A — obvious problems.** These are discovered quickly: either by an
automated tool or at first glance at the markup. For example, this category
includes problems like an element that looks like a button but is not one, an
image without a description, or a heading whose level was chosen for font size.

**Part B — problems that require investigation.** Automated tools will either
say nothing about them or report something that looks correct. Here you need to
answer the question "is this really a problem and why," rather than simply
following a recommendation. This category includes, in particular, attributes
that are technically present but make the page worse, and metadata that is
syntactically valid but does not match what is written on the page.

The project contains at least one problem that no automated tool detects, and at
least one construction for which an AI agent will almost certainly suggest a
technically feasible but incorrect fix. Finding both is part of the work.

> A list of specific problems is not published. The goal is to follow the
> path of **finding → confirming → fixing → re-checking**, rather than checking
> off code against a list.

## 5. Execution steps

1. **Deploy the project without changes** and record the initial audit:
   Lighthouse, accessibility scanner, keyboard, Accessibility Tree, technical
   SEO. Record the measurement conditions (§4.7 of the lab) — without them, the
   "before / after" comparison is meaningless.
2. **Run an AI-assisted audit.** The AI must first provide an audit report
   using the table from §5.2, not rewritten code.
3. **Verify the recommendations.** Verify at least 5 against the documentation
   and your own experiments in DevTools.
4. **Fix the confirmed problems.** Minimum: 2 accessibility, 2 technical SEO, 1
   performance (or justification that no change is needed), and at least one
   **rejected** AI recommendation with a citation.
5. **Repeat the audit** under identical conditions and fill in the before /
   after table.

## 6. What not to do

- Rewrite the page from scratch or change its visual concept.
- Delete sections to "improve" a metric.
- Add ARIA attributes just in case: every attribute must have a justification.
- Fix things you have not confirmed. An undiscovered problem is better than a
  random fix — at the defense, you will need to explain every change.

## 7. Deployment

The project is published in two places (GitHub Pages and Vercel), so the page
will be available at two different URLs. Choose **one** canonical origin for
`canonical` and `og:url` and be ready to explain your choice.

Perform the `robots.txt` verification on the Vercel deployment: search engines
read this file only at the origin root, whereas GitHub Pages serves the project
under `/<repository>/`. For more details, see §4.6 of the lab.

**Separate repository.** The contents of the archive reside at the root, and
both deployments are configured without extra parameters.

**The `lab-4/` folder in a shared repository.** Also acceptable — but two
settings must be adjusted manually, because by default both platforms will
consider the root of the repository to be the project root rather than your
folder.

_Vercel._ The platform has a **Root Directory** setting — the folder it considers
the root of the project; everything above it is ignored. During import, specify
**Root Directory → `lab-4`** (this can later be changed in Settings → Build and
Deployment). Then `lab-4/index.html` is served as `/`, and `lab-4/robots.txt` as
`/robots.txt`, which is exactly where the crawler reads it.

If you don't do this, Vercel will deploy the entire repository: the page will end
up at `/lab-4/`, and `robots.txt` at `/lab-4/robots.txt`. That is no longer the
`robots.txt` of this origin, but an ordinary static file, leaving nothing to
verify in §5.1.

One repository can power multiple Vercel projects, each with its own Root
Directory. This means each lab gets its own origin without conflicts.

_GitHub Pages._ There is no Root Directory equivalent here: Pages publishes an
entire branch (or the `/docs` folder), so a nested folder simply adds a path
segment — `https://<username>.github.io/<repository>/lab-4/`. Relative links to
CSS, JS, and images do not break because of this, so it is safe for the page.

What needs fixing is something else — `.nojekyll`. Pages runs the published
branch through Jekyll, which looks for this file **at the root of what it
publishes**. Pages simply won't see it inside `lab-4/`. Therefore, place a copy of
`.nojekyll` at the root of the repository. In this starter project, no files
begin with `_`, so today it makes no difference — but as soon as a folder like
`_next/` or `_assets/` appears in the repository, Jekyll will silently drop it
from the build, breaking the page only upon deployment.

And separately: on GitHub Pages, `robots.txt` will not work as `robots.txt` in
either scenario — a project page always lives under `/<repository>/`. This is
not a drawback of a nested folder, but the very behavior investigated in §4.6.

In either scenario, `sitemap.xml` contains absolute URLs of the chosen canonical
origin, not paths from the other deployment.

## 8. What to show during the check

- Open the Accessibility Tree for an element you fixed and show how its Role and
  Name changed.
- Navigate the page with the keyboard from the first element to the form button.
- Show a problem detected by axe or Lighthouse directly in the HTML.
- Show a problem you found manually that the tool did not detect.
- Show an AI recommendation you rejected and cite the source you relied on.
- Show the JSON-LD and match its data with visible page content.
- Show `robots.txt` and `sitemap.xml` on the origin where they actually work.
- Identify the LCP element and show the values before and after optimization.

> **Summary.** The outcome must be the same FlowTask page — but one where every
> fixed problem is confirmed, every change is justified, and every number in the
> report was obtained under known conditions.

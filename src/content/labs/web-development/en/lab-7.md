---
number: 7
title: "Module assessment 1: responsive landing page Courtly"
summary: "A comprehensive assignment covering HTML, CSS, SEO, accessibility, and responsive design: a landing page for the Courtly sports venue booking service based on a provided mockup and design system, with fluid typography and a Lighthouse audit."
discipline: "Modern Web Development: HTML, CSS, JS/TS"
level: "Year 3, Computer Science"
format: "Module assessment"
updated: 2026-10-18
handout: /en/web/labs/lab-7.pdf
---

## Assignment

Build a responsive landing page for **Courtly** — an online booking service for
sports venues — following the provided mockup. Deploy and publish it on
**GitHub Pages or Vercel**.

- **Mockup, design tokens, and component specifications:**
  [Courtly — mockup and design system](/en/web-development/labs/lab-7/task/).
- **Images, `tokens.css`, specification, mockup captures, favicon, OG image:**
  [courtly-assets.zip](/uk/web/starters/courtly-assets.zip) (≈ 900 KB).
- **Your own CSS**, without any CSS frameworks or UI component libraries.
  JavaScript is used solely for the mobile menu.
- **Not required:** backend, API, database, authentication, real search, or
  real booking.

The page structure, section order, column counts, and card layout must match
the mockup; minor deviations in spacing and exact dimensions are acceptable.
Use the values from `tokens.css` without changes.

## 1. Page sections

Copy, section order, and appearance are in the mockup. Below is only what cannot
be seen directly from the mockup: semantic markup, `id`s, and where links point.

| Section | `id` | What is important |
| --- | --- | --- |
| Header | — | `<header>` + `<nav>`; "Book now" is a link to `#venues`; below 1024 px — mobile menu |
| Hero | — | the only `<h1>`; "Find a venue" is a link to `#venues` |
| Search form | `search` | see below |
| Popular venues | `venues` | 6 cards, each an `<article>` with an `<h3>` |
| How it works | `how` | 3 steps, for example an `<ol>` |
| About the service | `about` | target of the "About" navigation item |
| Final CTA | — | "Find a venue" is a link to `#search` |
| Footer | `contacts` | `<footer>`; email and phone are `mailto:` and `tel:` links |

**Form.** Demonstrative, with `action="#venues"`. Every field has an associated
`<label>` and `required`:

- **City** — `<select>`: "Select a city" (`value=""`), Kyiv, Lviv, Odesa,
  Kharkiv, Dnipro;
- **Sport** — `<select>`: "Any" (`value=""`), Football, Tennis, Basketball,
  Volleyball;
- **Date** — `<input type="date">`;
- **Search** — `<button type="submit">`.

**Cards.** Names, sports, and prices should match the mockup; features and ratings
can be your own. "Book now" triggers an action, so it is a `<button type="button">`.
Each button must have a unique accessible name containing the venue name,
for example `Book now<span class="visually-hidden"> at Arena Sport</span>`.

## 2. Mandatory technical solutions

1. **CSS Variables.** Colors, font family, typography, spacing, and border
   radii come from `tokens.css`. On dark sections (CTA, footer), the focus color
   is updated by **overriding the variable** `--color-focus`, rather than
   repeating the `:focus-visible` rule.
2. **Fluid typography.** Headings scale using `clamp()` — ready-to-use values are
   provided in the tokens. Include the Montserrat font with the **cyrillic**
   subset.
3. **Media queries.** Mobile-first, with breakpoints at **640 px** and **1024 px**.
   Reorganize the header, hero, search form, sections, and footer according to
   the mockup.
4. **CSS Grid for cards:** 1 column → 2 columns from 640 px → 3 columns from
   1024 px. On desktop, the featured card **Arena Sport** spans **2 columns ×
   2 rows**; on tablet and mobile, it takes a single cell like a regular card.
5. **Flexbox** — in the header, form, and inside cards where appropriate.
6. **Mobile menu** — `<button type="button">` with an accessible name,
   `aria-expanded`, and `aria-controls`; opens and closes with keyboard
   navigation.
7. **Hero image** — the primary candidate for LCP: `srcset` with both files,
   explicit `width` and `height`, `fetchpriority="high"`, **without**
   `loading="lazy"`. All other images must have `width`, `height`, and
   `loading="lazy"`.
8. **No horizontal scrolling** at 320, 375, 768, and 1440 px — and without
   using `overflow-x: hidden` on `body` to hide it.

## 3. Accessibility and SEO

Target guideline — **WCAG 2.2 AA**.

**Accessibility**

- HTML landmarks: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`,
  `<footer>`;
- A single `<h1>`, followed by `<h2>` for sections and `<h3>` for cards, steps,
  and benefits; headings are not used merely for font sizing;
- All interactive elements are reachable and operable via keyboard;
  `:focus-visible` is clearly visible on both light and dark sections;
- `<a>` is used for navigation, `<button>` for actions;
- Meaningful images have descriptive `alt` text; decorative images use `alt=""`
  (the logo mark next to the word "Courtly" is decorative);
- Custom colors, if added, are verified for sufficient contrast.

**SEO — in `<head>`**

- `<meta charset>`, `<meta name="viewport">`, `lang="en"` (or `lang="uk"` if deploying the Ukrainian text);
- `<title>` and `<meta name="description">`;
- Canonical URL;
- `og:title`, `og:description`, `og:url`, `og:image` — an **absolute URL** to
  `og-image.jpg`;
- Favicon.

At the site root — `robots.txt` and `sitemap.xml`. The URLs in the canonical tag,
`og:url`, and the sitemap must match the actual live URL of the page.

## 4. Lighthouse

Test the **deployed** page in an Incognito / InPrivate browser window. Use
**Navigation** mode and the **Mobile** device profile.

**Goal:** Performance, Accessibility, Best Practices, and SEO — **at least 90**
in each category. Performance scores are most frequently lowered by heavy
images, missing dimensions, and render-blocking resources.

For your submission, a single screenshot showing the four category scores is
sufficient.

## 5. Report

**Email subject:**

```
[Web] Lab 7: Module assessment 1 — Courtly
```

In the email body, provide your repository link and the URL of the published
page — pick the one you used, GitHub Pages or Vercel:

```
GitHub repository: https://github.com/<username>/<repository>
GitHub Pages: https://<username>.github.io/<repository>/
Vercel: https://<project>.vercel.app/
```

Also attach to the email:

- **one Lighthouse screenshot** with the scores for all four categories;
- **a brief description of working with AI:** which tool and model were used,
  what you used them for, how many issues the AI flagged, what was fixed, and
  what was skipped or rejected and why. For example:

  > AI: ChatGPT (GPT-5). Generated the initial HTML skeleton of sections, then
  > reviewed the completed page for semantic HTML, accessibility, and responsive
  > layout. Identified 7 issues, 5 of which were fixed: the form was missing a
  > `<label>` for the date input, "Book now" buttons shared identical names, a
  > horizontal scrollbar appeared at 320 px, the hero image lacked
  > `width`/`height`, and focus outlines were invisible in the footer. 2 recommendations
  > were rejected: adding `role="button"` to `<button>` (redundant ARIA on native
  > elements) and replacing the card Grid with Flexbox (violates the assignment
  > specifications).

Before submitting, open both links in an Incognito window: both the live site
and the repository must open publicly without requiring authentication.

AI assistance is permitted and encouraged, but you must be prepared to explain
every decision in your HTML and CSS during oral defense if needed.

## Acceptance criteria

```text
[ ] The page matches the mockup at 1440, 768, and 375 px
[ ] No horizontal scrolling, especially at 320 px
[ ] Sections have the ids from the table in §1; links point to the specified targets
[ ] Form: labels, required, action="#venues"
[ ] "Book now" buttons — <button> elements with unique accessible names
[ ] Tokens from tokens.css; --color-focus is overridden on dark sections
[ ] Headings scale via clamp(); Montserrat includes the cyrillic subset
[ ] Grid: 1 → 2 → 3 columns; featured card spans 2 × 2 on desktop
[ ] Flexbox used in the header, form, and cards
[ ] Mobile menu works via keyboard; aria-expanded updates properly
[ ] Hero: srcset, width/height, fetchpriority, no lazy loading
[ ] Single <h1>, logical heading hierarchy, landmark elements
[ ] Visible :focus-visible outlines; correct alt attributes
[ ] Meta tags, canonical URL, Open Graph tags with absolute og:image
[ ] robots.txt and sitemap.xml
[ ] Lighthouse (Mobile, Incognito): Performance / A11y / BP / SEO ≥ 90
[ ] Submission email: 2 links, Lighthouse screenshot, AI usage summary
```

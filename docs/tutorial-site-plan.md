# Plan: Course tutorial site with a javascript.info-style structure — hierarchical navigation & routing

> **Superseded (2026-09-09):** `Lectures/`, `Labs/` and `Tutorial/` have been merged
> into a single Astro project at the repo root. The handbook now lives under
> `/tutorial/*` (was `/*`); the header/footer link to the sibling sections by
> internal path, not URL. This document is kept for the handbook's structure and
> routing rationale, which still holds — only the project boundary changed.

> **Review status:** approved for the first version. Feedback folded in below —
> (1) framing is "javascript.info *structure* style", not visual style; (2) article
> slugs are provisional and will be revisited once the implementation works;
> (3) the header/footer link out to the sibling `Lectures/` and `Labs/` deployments by
> URL; (4) English only for now, language switcher deferred. This file is the finalized
> plan, saved at the repo root under `docs/`.

## Context

The `Web Development - 2026` repo currently holds `Lectures/` (an Astro 5 slide deck for
"Лекція 1") and an empty `Labs/`. We need a third sibling deliverable: a **course tutorial /
handbook** modelled on the *navigation system* of https://javascript.info/ — a main
table-of-contents page that groups every topic into Parts → Chapters → Articles, and a
per-article page reachable by clicking a topic (e.g. `/intro`).

What we borrow from javascript.info is its **content structure and navigation model**
(Parts → Chapters → Articles, ToC homepage, sidebar tree, breadcrumbs, prev/next, "on this
page") — **not** its visuals. The look comes from the institute design system used in
`C:\Users\matse\Documents\Projects\website\website_ao` (dark-first OKLCH "slate" palette,
brand blue `#0e52ff`, Roboto, `--radius: 0.625rem`, glass panels).

Decisions locked with the user:
- **Location:** new standalone Astro project at `Web Development - 2026/Tutorial/`.
- **Content:** Markdown via Astro **Content Collections**; nav derived from `getCollection`.
- **Language:** **English only** for the first version. Content + routing are structured so a
  `/uk` locale and a header language switcher drop in later with minimal refactor; the
  switcher itself is **deferred**, shown as a disabled `EN` placeholder for now.
- **Cross-links:** the header and footer link out to the sibling `Lectures/` and `Labs/`
  deployments **by URL** (they are separate builds, not part of this project). URLs live in
  `src/data/site.ts` as configurable constants.
- **Slugs:** article slugs / `.md` filenames in this plan are **provisional** — revisit and
  finalize them once the navigation is working end-to-end.
- **Seed content:** **structure only** — the full Part/Chapter/Article tree wired into
  navigation, every article a one-line placeholder.

## Reference analysis (what we are reproducing)

**javascript.info navigation model**
- 3 Parts: "The JavaScript Language", "Browser: Document, Events, Interfaces",
  "Additional Articles". Each Part → ordered Chapters (groups) → ordered Articles.
- Article URLs are **flat slugs**: `/intro`, `/variables`, `/fetch`. Hierarchy is metadata,
  not URL path. *(Our exact slug set is provisional — to be reviewed after implementation.)*
- Homepage = dense ToC: every Part/Chapter/Article listed as links.
- Article page = left sidebar (full tree, current article highlighted, its branch expanded)
  + breadcrumb (`Tutorial › Part › Chapter › Article`) + article body + previous/next
  article links at the bottom + right-rail "on this page" in-page heading anchors.

**website_ao design system (source of styling)** — `src/styles/global.css`
- `@import "tailwindcss";` + `@theme inline { … }` mapping semantic tokens to CSS vars.
- `:root` (light) and `.dark` (dark) OKLCH slate scale; `<html class="dark">` is the default.
- Brand tokens: `--color-brand-blue #0e52ff`, `--color-brand-cyan #4CD9B0`,
  `--color-brand-blue-soft`, `--color-layout-bg #0f1215`, `--color-footer-bg #00113B`.
- `--font-roboto`, radius scale from `--radius: 0.625rem`, `.glass-panel` utility.
- `cn()` helper = `clsx` + `tailwind-merge` (`src/lib/utils.ts`).
- Roboto loaded via Google Fonts `<link>` with `media="print" onload` swap (`Layout.astro`).
- FOUC-guard inline `<script is:inline>` in `<head>` (pattern in both existing projects).

## Target project layout

```
Web Development - 2026/Tutorial/
├─ astro.config.mjs            # Astro 5, @tailwindcss/vite, i18n(en default, uk ready), base
├─ package.json                # astro@^5, tailwindcss@^4, @tailwindcss/vite@^4, clsx, tailwind-merge
├─ tsconfig.json               # extends astro/tsconfigs/strict, "@/*" -> src/*
├─ README.md                   # quick start, how to add a topic, deploy
├─ docs/design-system.md       # ported tokens + how they map to institute branding
├─ .github/workflows/deploy.yml# GitHub Pages (adapted from Lectures/)
├─ public/favicon.svg
└─ src/
   ├─ content.config.ts        # `docs` collection: glob loader + zod schema
   ├─ content/docs/en/…        # ~20 placeholder .md articles across 3 parts / ~7 chapters (slugs provisional)
   ├─ data/curriculum.ts       # Parts[] + Chapters[] definitions (titles, order) — English
   ├─ data/site.ts             # site meta + sibling-project URLs (lecturesUrl, labsUrl)
   ├─ lib/
   │  ├─ curriculum.ts         # nav-tree / flat-list / adjacent / breadcrumb derivation
   │  ├─ paths.ts              # withBase(path) — base-URL-safe internal links
   │  └─ utils.ts              # cn() (copied from website_ao)
   ├─ styles/global.css        # ported design system + `.doc-content` markdown typography
   ├─ scripts/docs.ts          # vanilla JS: mobile sidebar drawer, scrollspy, theme toggle
   ├─ layouts/
   │  ├─ BaseLayout.astro      # <html class="dark">, <head>, meta, fonts, FOUC script, skip-link
   │  └─ DocsLayout.astro      # SiteHeader + (Sidebar | slot | OnThisPage) + SiteFooter
   ├─ components/
   │  ├─ SiteHeader.astro      # institute-styled: menu/logo + Lectures/Labs links + lang placeholder
   │  ├─ SiteFooter.astro      # simplified institute footer (no gooey/particles) + Lectures/Labs links
   │  ├─ Sidebar.astro         # curriculum tree, native <details> per Part, current highlight
   │  ├─ Breadcrumbs.astro
   │  ├─ PrevNext.astro
   │  ├─ OnThisPage.astro      # from render() headings (h2/h3)
   │  ├─ ThemeToggle.astro
   │  └─ CurriculumOverview.astro  # homepage grouped Part/Chapter/Article list
   └─ pages/
      ├─ index.astro           # homepage ToC (English)
      └─ [...slug].astro       # every article page (English), getStaticPaths over collection
```

`uk` later = add `src/content/docs/uk/**` + `src/pages/uk/index.astro` +
`src/pages/uk/[...slug].astro` (or refactor to `[locale]`), plus `uk` entries in
`data/curriculum.ts`. No change to schema, helpers, or components' props.

## Design system port — `src/styles/global.css`

Copy from `website_ao/src/styles/global.css`, trimmed to what a docs site needs:
- Keep: `@import "tailwindcss";`, the full `@theme inline` semantic-token block, the
  `:root` + `.dark` OKLCH scales **verbatim**, brand/layout/glass tokens, `--font-roboto`,
  radius scale, `@layer base` reset (`border-border`, smooth scroll, `body` = `bg-background
  text-foreground` + Roboto), `.glass-panel`, `scrollbar-hide`, `prefers-reduced-motion`.
- Drop: gooey footer, particle/cursor/marquee/intro animations, `card-3d`, `gradient-border`,
  `bg-innovative-education`, `#site-wrapper` intro states — none are used here.
- Add: `.doc-content { … }` — hand-rolled markdown typography (~70 lines) driven entirely by
  the tokens: `h2/h3` scale + scroll-margin-top for anchor offset, `p/ul/ol/li` rhythm,
  inline `code` (chip on `--muted`), `pre` block (`--card` bg, `--border`, radius-lg,
  overflow-x auto), `blockquote` (left border `--color-brand-blue`), `a`
  (`--color-brand-blue-soft`, underline on hover), `table`, `hr`, heading `.anchor` link.
  (Alternative considered: `@tailwindcss/typography` — rejected to keep deps minimal and
  match the deck's explicit-CSS style.)

Theme: default `<html class="dark" lang="en">`. `ThemeToggle.astro` flips `.dark` and
persists to `localStorage['tutorial-theme']`; `BaseLayout` runs an `is:inline` head script
that applies the saved theme before first paint (same pattern as
`Lectures/src/layouts/BaseLayout.astro:39` and `website_ao/src/layouts/Layout.astro`).

## Content model & routing

`src/content.config.ts`:
```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const docs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/docs' }), // ids like "en/intro"
  schema: z.object({
    title: z.string(),
    chapter: z.string(),        // Chapter id from data/curriculum.ts
    order: z.number(),          // position within its chapter
    summary: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});
export const collections = { docs };
```

`src/data/curriculum.ts` — the single source of structural truth:
```ts
export interface Part    { id: string; title: string; }
export interface Chapter { id: string; part: string; title: string; }
export const parts: Part[]       = [ /* js-language, browser, extra */ ];
export const chapters: Chapter[] = [ /* intro, fundamentals, code-quality, document, events, … */ ];
```
Parts/chapters render in array order → that defines numbering (Part `n`, Chapter `n.m`).

`src/lib/curriculum.ts` — pure functions over `getCollection('docs')`, all take `locale`
(default `'en'`) and filter by `id` prefix so `uk` slots in later:
- `slugOf(entry)` → `entry.id.replace(/^(en|uk)\//, '')`
- `getNavTree(locale)` → `[{ part, index, chapters: [{ chapter, index, docs: DocMeta[] }] }]`
- `getFlatDocs(locale)` → articles ordered by part → chapter → `order` (for prev/next)
- `getAdjacent(slug, locale)` → `{ prev?: DocMeta, next?: DocMeta }`
- `getBreadcrumbs(slug, locale)` → `[{label,href}]` = Tutorial › Part › Chapter › Article
- `DocMeta = { slug, title, href, chapterId }`; `href` always via `withBase()`.

`src/pages/[...slug].astro`:
```ts
export async function getStaticPaths() {
  const docs = (await getCollection('docs')).filter(e => e.id.startsWith('en/'));
  return docs.map(e => ({ params: { slug: slugOf(e) }, props: { entry: e } }));
}
// in template:
const { Content, headings } = await render(entry);      // astro:content `render`
```
Renders `DocsLayout` → `Breadcrumbs` → `<h1>` + summary → `<article class="doc-content">
<Content/></article>` → `<PrevNext {...getAdjacent(slug)} />`; right rail `OnThisPage`
built from `headings.filter(h => h.depth === 2 || h.depth === 3)` (Astro auto-adds heading
`id`s, so anchors work with no extra rehype config).

`src/pages/index.astro`: `BaseLayout` → `SiteHeader` → hero (eyebrow "Modern Web
Development · HTML, CSS, JS/TS", `<h1>`, intro `<p>`, "Start reading →" button to first
flat doc) → `CurriculumOverview` (maps `getNavTree('en')` to numbered Part sections, each
Chapter a `.glass-panel` card listing its Articles as links) → `SiteFooter`.

## Components (behaviour)

- **Sidebar.astro** — `getNavTree('en')`; each Part a native `<details>` (open when it
  contains the current article), Chapters as sub-lists, Articles as links; current article
  gets `aria-current="page"` + brand-blue left border/active bg. Sticky, own scroll on
  `lg+`. On mobile it's `position: fixed` off-canvas, toggled by `docs.ts`.
- **OnThisPage.astro** — `<nav aria-label="On this page">` list of h2/h3 anchors; `lg+`
  sticky right rail; below `lg` renders as a `<details>` above the article. Active link
  tracked by `docs.ts` scrollspy.
- **Breadcrumbs.astro / PrevNext.astro** — pure, take data from `lib/curriculum.ts`.
- **SiteHeader.astro** — institute style from `website_ao` Header: rounded-xl bordered menu
  button (opens mobile sidebar), centered wordmark/logo linking home, a **"Lectures"** and
  **"Labs"** link (external `<a>` to `site.lecturesUrl` / `site.labsUrl` from
  `src/data/site.ts`), and a disabled `EN` language-switcher placeholder for the future
  switcher. No React.
- **SiteFooter.astro** — condensed `website_ao` footer: a "Course" link group
  (Home / Lectures / Labs — the last two external, same URLs as the header), contacts
  (oa.edu.ua), `© <year>` — plain flat `--color-footer-bg` background, none of the
  SVG-filter animation.
- **ThemeToggle.astro** — sun/moon button wired by `docs.ts`.

`src/scripts/docs.ts` (vanilla, in the spirit of `Lectures/src/scripts/deck.ts`):
1. mobile sidebar drawer: open/close, backdrop click, `Esc`, lock body scroll.
2. scrollspy: `IntersectionObserver` on `.doc-content :is(h2,h3)` → toggle `.is-active` on
   the matching `OnThisPage` link.
3. theme toggle: flip `.dark`, write `localStorage['tutorial-theme']`.
Collapsible Parts use native `<details>` — no JS.

## Seed content (structure only)

~20 `.md` files in `src/content/docs/en/`, e.g. `intro.md`, `manuals-specifications.md`,
`devtools.md`, `hello-world.md`, `structure.md`, `variables.md`, `types.md`, `operators.md`,
`comparison.md`, `debugging.md`, `coding-style.md`, `browser-environment.md`,
`dom-nodes.md`, `dom-navigation.md`, `events-intro.md`, `bubbling-capturing.md`,
`event-delegation.md`, `frames-windows.md`, `regexp-intro.md`, `regexp-groups.md`
— spread across parts `js-language` / `browser` / `extra` and ~7 chapters. These
filenames (and therefore the slugs) are a **first pass**; expect to rename/prune them in a
dedicated slug review once navigation is verified.

Every file:
```md
---
title: An Introduction to JavaScript
chapter: intro
order: 1
summary: One-line summary of the topic.
---

## Overview

_Placeholder — content to be written._

## Summary
```
Two headings per file so the "on this page" rail and scrollspy are demonstrable.

## Build / deploy config

- `astro.config.mjs`: `site` + `base: '/web-development-2026-tutorial'` (GitHub Pages, like
  `Lectures/astro.config.mjs`), `vite.plugins: [tailwindcss()]`, `i18n: { defaultLocale:
  'en', locales: ['en','uk'], routing: { prefixDefaultLocale: false } }`.
- `src/lib/paths.ts`: `withBase()` normalising `import.meta.env.BASE_URL` (copy the
  slash-handling note from `Lectures/src/layouts/BaseLayout.astro:14-18`); used by every
  internal link so the `base` prefix is always correct.
- `.github/workflows/deploy.yml`: adapted copy of `Lectures/.github/workflows/deploy.yml`.
- `package.json` scripts: `dev`, `build`, `preview`, `check` (astro check).

## Implementation order

1. Scaffold: `package.json`, `astro.config.mjs`, `tsconfig.json`, `public/favicon.svg`,
   `.gitignore`; `npm install`.
2. `src/styles/global.css` — port + `.doc-content`.
3. `src/lib/{utils,paths}.ts`; `src/data/{curriculum,site}.ts`; `src/lib/curriculum.ts`.
4. `src/content.config.ts` + all `src/content/docs/en/*.md` stubs.
5. `src/layouts/BaseLayout.astro` (+ FOUC script, fonts, skip-link) and `DocsLayout.astro`.
6. Components: `SiteHeader` + `SiteFooter` (with the Lectures/Labs cross-links), `Sidebar`,
   `Breadcrumbs`, `PrevNext`, `OnThisPage`, `ThemeToggle`, `CurriculumOverview`.
7. `src/scripts/docs.ts`; wire into `DocsLayout`.
8. `src/pages/index.astro` and `src/pages/[...slug].astro`.
9. `README.md` + `docs/design-system.md` + `.github/workflows/deploy.yml`.

## Deferred / future work (out of scope for the first version)

- **Slug review:** once the Tutorial navigation works end-to-end, do a pass to finalize
  every article slug / `.md` filename (rename + prune). Nothing outside `data/curriculum.ts`
  frontmatter and the `.md` filenames needs to change for this.
- **Language switcher + `/uk`:** add `src/content/docs/uk/**`, `uk` entries in
  `data/curriculum.ts`, `src/pages/uk/**` routes (or a `[locale]` refactor), and turn the
  header's disabled `EN` placeholder into a real switcher.
- **Tighter Lectures/Labs integration:** the first version links to the sibling `Lectures/`
  and `Labs/` builds by URL from `src/data/site.ts`. A later step could unify them under one
  shared header/shell (or a workspace) so the three parts feel like one site; the `site.ts`
  indirection is the seam for that.

## Verification

- `npm run dev` → open `http://localhost:4321/web-development-2026-tutorial/`:
  - Homepage lists all 3 Parts, every Chapter card, every Article link; "Start reading"
    goes to the first article.
  - Click any topic → its page renders with the correct breadcrumb, the sidebar branch
    expanded and the item highlighted, working previous/next at the bottom, and an "on this
    page" list whose active item follows scroll.
  - First / last articles hide the missing previous / next.
  - Header + footer "Lectures" / "Labs" links point at the URLs from `src/data/site.ts` and
    open the sibling deployments.
  - Direct-load a deep URL (`/variables`) → correct page (routing, not just client nav).
  - Toggle theme → persists across reload and navigation; no light flash on load.
  - Narrow viewport → sidebar collapses to a drawer that opens/closes/`Esc`-closes; "on
    this page" becomes a `<details>`.
- `npm run check` → no type errors.
- `npm run build` → `dist/` contains `index.html` + one folder per article; `grep` a couple
  of article `index.html` files for the right `<title>` and breadcrumb.
- Sanity: no import of React/motion/particles; `dist` JS is only the small `docs.ts` bundle.

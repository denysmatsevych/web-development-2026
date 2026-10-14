# Multi-Course Site Refactoring Plan

## Goal and scope

Today every route, collection and helper assumes one course. I'll make the site course-aware so one Astro build serves Web Development, React and Web Accessibility, with shared design and tooling.

**What I'll do**
- Make routes, content collections and lecture data course-aware.
- Move Web Development into the new structure while keeping old links working via thin redirect pages and the `redirects` config.
- Add empty, unpublished stubs for React and Web Accessibility (visible in dev via `import.meta.env.DEV`, excluded from production builds).
- Update `README.md` and `AGENTS.md` so they describe the new `src/` layout.

**What I won't touch**
- URL and check logic of the ЛР-7 check and report pages and the `courtly-*` scripts. They stay at their current URLs; only their imports and breadcrumbs change.
- Visual design, lab handouts and lecture content.
- React islands (interactive demos in lectures): postponed until the React course content is decided.
- The `docs/` folder and the gitignored instructor files (reference solutions, defect maps, mockup source). They stay where they are and move in a separate docs PR. The only `docs/` edit here is the routes table in `docs/agents/design-system.md`.

---

## Target structure

Each course gets its own URL prefix, content folder and lecture folder. Everything visual stays shared. Course slugs: `web-development`, `react`, `web-accessibility`.

**URLs.** Old addresses keep working: the index pages through the `redirects` config, the per-lab and per-lecture pages through thin redirect pages.

| Old URL | New URL | Note |
| --- | --- | --- |
| `/` | `/` | hub now lists courses |
| (new) | `/<course>/` | course page with its lectures and labs |
| `/lectures/` | `/web-development/lectures/` | `redirects` config |
| `/lectures/lecture-1/` | `/web-development/lectures/lecture-1/` | thin redirect page |
| `/labs/` | `/web-development/labs/` | `redirects` config |
| `/labs/lab-4/`, `/labs/lab-4/task/` | `/web-development/labs/lab-4/`, `…/task/` | thin redirect pages |
| `/labs/lab-7/check/`, `/labs/lab-7/report/` | unchanged | URL and check logic unchanged |
| `/labs/*.pdf`, `/labs/*.zip` | unchanged | files stay where students already link to them |

**Files**

```
src/
├─ data/
│  ├─ site.ts                 site name, general contact
│  ├─ courses.ts              course registry: slug, titles, description, status, eyebrow, courseUk
│  └─ lectures/
│     ├─ schema.ts            slide model (shared)
│     ├─ index.ts             getLectures(course): the single home for lecture lookup
│     ├─ web-development/     lecture-1.ts, lecture-2.ts
│     ├─ react/               lecture-1.ts (stub)
│     └─ web-accessibility/   lecture-1.ts (stub)
├─ content/
│  ├─ labs/
│  │  ├─ web-development/     lab-1.md … lab-11.md, individual.md
│  │  ├─ react/               lab-1.md (stub)
│  │  └─ web-accessibility/   lab-1.md (stub)
│  └─ tasks/
│     └─ web-development/     lab-2.md, lab-4.md, … (the stubs have no tasks yet)
├─ pages/
│  ├─ index.astro             hub: one card per course
│  ├─ [course]/               new addresses
│  │  ├─ index.astro          course page
│  │  ├─ lectures/index.astro, [lecture].astro
│  │  └─ labs/index.astro, [lab].astro, [lab]/task.astro
│  ├─ labs/                   old addresses
│  │  ├─ [lab].astro, [lab]/task.astro    thin redirect pages
│  │  └─ lab-7/check.astro, report.astro  stay here
│  └─ lectures/[lecture].astro            thin redirect page
└─ lib/                       labs.ts, courses.ts (helpers take a course)
public/
├─ labs/                      Web Development PDFs and ZIPs, unchanged
└─ react/labs/, web-accessibility/labs/   later, for the new courses only
```

The entry id keeps its folder (`web-development/lab-4`), and a task keeps the same id as its lab. Helpers split the id into course and slug, so no `course` frontmatter field is needed.

---

## Steps

Branch `refactor/courses`, small Conventional Commits, `npm run check && npm run build` after every step. `git mv` is Git's command for moving a file while keeping its history. About 4–5 working days. All steps ship in one PR, so Step 1 (new addresses) and Step 3 (redirects from the old ones) reach the site in the same deploy and no old student link returns 404.

### Step 0 · Baseline (0.25 d)
- [ ] Create the branch `refactor/courses` from `main`
- [ ] Build the current site and save the list of every URL in `dist/` outside the repo (a checklist for step 3: after the move, each of these URLs must still open or redirect)

**Done when:** the build is green and the URL list is saved.

### Step 1 · Registry, content and routes (2 d)
- [ ] Add `src/data/courses.ts` (slug, titles, description, `status`, `eyebrow`, `courseUk` moved from `site.ts`) with one helper, `getCourses()`, that filters on `status` and `import.meta.env.DEV`; the hub, the course switcher, the footer and `getStaticPaths` all use it
- [ ] `git mv` `src/content/labs/*` into `src/content/labs/web-development/` and `src/content/tasks/*` into `src/content/tasks/web-development/`
- [ ] `git mv` lecture data into `src/data/lectures/web-development/`; `src/data/lectures/index.ts` exposes `getLectures(course)` (no separate `src/lib/lectures.ts`)
- [ ] Update `src/lib/labs.ts` so the helpers split the entry id (`web-development/lab-4`) into course and slug
- [ ] `git mv` the pages into `src/pages/[course]/…`, building paths from registry × entries; add `[course]/index.astro`; turn `src/pages/index.astro` into the hub of course cards
- [ ] Update imports and breadcrumbs in `check.astro` and `report.astro` (they use `labHref` / `taskHref`) and keep them at `/labs/lab-7/…`

**Done when:** `npm run check && npm run build` passes and the build has `/web-development/labs/` for all 11 labs, 7 task pages and 2 decks.

### Step 2 · Header, titles, labels (0.5 d)
- [ ] Set the site name to "Modern Web Development" in `site.ts`
- [ ] Course switcher in `SiteHeader`; footer links populated from the registry
- [ ] Breadcrumbs: add the course in front (`Web Development › Labs › ЛР-1`)
- [ ] `<title>`: lab, lecture and task titles keep their format and end with the course name from the registry instead of a hardcoded string
- [ ] Deck title slide takes `courseUk` from the registry

**Done when:** every page names the right course.

### Step 3 · Old links and redirects (0.5 d)
- [ ] Thin redirect pages at the old paths (`src/pages/labs/[lab].astro`, `labs/[lab]/task.astro`, `lectures/[lecture].astro`): `getStaticPaths` lists the Web Development entries and each page returns `Astro.redirect(withBase(…), 301)`. The status must be passed explicitly: the default 302 builds into a meta-refresh page with a 2-second delay
- [ ] Parameterless redirects (`/lectures`, `/labs`) in the `redirects` config, with the base taken from the existing `BASE` constant in `astro.config.mjs`
- [ ] Repoint the 22 Markdown links to pages (the 14 PDF/ZIP links stay at `/labs/`)
- [ ] Check that every PDF and ZIP in `public/labs/` still loads

**Done when:** every URL from step 0 returns its page or a valid redirect, and every PDF and ZIP loads.

### Step 4 · Course stubs (0.5 d)
- [ ] Register `react` and `web-accessibility` in `courses.ts` with `status: 'draft'`
- [ ] Add one placeholder lecture to each (`src/data/lectures/react/lecture-1.ts` and `src/data/lectures/web-accessibility/lecture-1.ts`: a title slide and one content slide)
- [ ] Add one placeholder lab to each (`src/content/labs/react/lab-1.md` and `src/content/labs/web-accessibility/lab-1.md`: title, summary and one paragraph). The stubs are hidden by the course `status`, not by the lab's `draft` field, so they stay visible in dev
- [ ] Render drafts in dev (`import.meta.env.DEV`) and exclude them from the production build, including the hub cards, the course switcher and the footer links (all go through `getCourses()`)

**Done when:** the stubs build locally in dev and produce no public routes in production.

### Step 5 · README, AGENTS.md and final check (0.5 d)
- [ ] Update the `README.md` *Layout* section and the `AGENTS.md` architecture list to match the new `src/`
- [ ] Update the comments and docs that describe the old structure: `content.config.ts` (lines 7, 12, 50–52), `astro.config.mjs:12`, `courtly-spec.ts:6–7` (comment only, check logic untouched), the header comments of the pages that moved into `[course]/`, and the routes table in `docs/agents/design-system.md` (a content edit; the docs PR only moves folders)
- [ ] Grep comments, `.astro` and `.ts` files and `docs/agents/*.md` for the old routes and content paths. Leave asset paths under `/labs/` alone: the ЛР-7 mockup images used by `CourtlyMockup.astro` live in `public/labs/lab-7/`, like the PDFs and ZIPs
- [ ] Run `npm run check && npm run build`
- [ ] On a preview deploy, click through the hub, a lab, a task, a deck and the ЛР-7 check page

**Done when:** `README.md` and `AGENTS.md` match the code and the click-through finds no broken link.

---

## Timing

Step 1 moves every file in `src/content/labs/` and `src/content/tasks/`, so it conflicts with any open lab branch. I'll land it when no lab branch is open, or after the authors have merged or rebased. PRs #13 and #14 only add documentation for grading changes that were rejected and won't be merged, so they don't affect this plan. The docs PR can follow right after this one.

## Decisions

- **Site name:** "Modern Web Development" (decided). It replaces "Web Development 2026" in the header; page titles end with the course name.
- **`base`:** keep `/web-development-2026`. The site stays at the same address, so no link students already have breaks. Changing it would mean renaming the GitHub repository, and GitHub Pages doesn't redirect from the old address, so every existing link would stop working.
- **PDFs and ZIPs:** keep them in `public/labs/`. This also leaves the 14 ZIP links and every `handout:` path in the frontmatter untouched.

**Alternative considered:** serve Web Development without a course prefix (like `prefixDefaultLocale: false` in Astro i18n). That would remove the redirects, but Web Development URLs would then differ in shape from the React and Web Accessibility ones, so I chose one consistent prefix.
# Changes I'll make to the project: one site, three courses

## Goal and scope

Today every route, collection and helper assumes one course. I'll make the site course-aware so one Astro build serves Web Development, React and Web Accessibility, with shared design and tooling.

**What I'll do**

- Make routes, content collections and lecture data course-aware.
- Move Web Development into the new structure without breaking links students already hold (lab pages, PDFs, starter ZIPs).
- Add empty, unpublished stubs for React and Web Accessibility.

**What I won't touch**

- Automatic checking of student work: the ЛР-7 check and report pages and the `courtly-*` scripts stay exactly as they are.
- Visual design, lab handouts and lecture content.
- React islands (interactive demos in lectures): postponed until the React course content is decided.

## Target structure

Each course gets its own URL prefix, content folder and lecture folder. Everything visual stays shared. Course slugs: `web-development`, `react`, `web-accessibility`.

**URLs.** Old addresses keep working through generated redirects.

| Old URL | New URL | Note |
| --- | --- | --- |
| `/` | `/` | hub now lists courses |
| (new) | `/<course>/` | course page with its lectures and labs |
| `/lectures/`, `/lectures/lecture-1/` | `/web-development/lectures/…` | redirect |
| `/labs/`, `/labs/lab-4/`, `/labs/lab-4/task/` | `/web-development/labs/…` | redirect |
| `/labs/lab-7/check/`, `/labs/lab-7/report/` | unchanged | auto-check pages, not touched |
| `/labs/*.pdf`, `/labs/*.zip` | unchanged | files stay where students already link to them |

**Files.**

```
src/
├─ data/
│  ├─ site.ts            site name and contact (stays as it is; the section list moves to courses.ts)
│  ├─ courses.ts             registry: slug, titles, description, status
│  └─ lectures/
│     ├─ schema.ts           shared slide model
│     ├─ index.ts            getLectures(course)
│     └─ <course>/lecture-N.ts
├─ content/
│  ├─ labs/<course>/lab-N.md
│  └─ tasks/<course>/lab-N.md
├─ pages/
│  ├─ index.astro            hub: one card per course
│  └─ [course]/
│     ├─ index.astro         course page
│     ├─ lectures/index.astro, [lecture].astro
│     └─ labs/index.astro, [lab].astro, [lab]/task.astro
└─ lib/                      labs.ts, lectures.ts, courses.ts: every helper takes a course
public/<course>/labs/…         new courses only; Web Development files stay in public/labs/
```

## Steps

Branch `refactor-courses`, small Conventional Commits, `npm run check && npm run build` after every step. git mv is Git's command for moving a file while keeping its history.

### Step 0 · Baseline (0.25 d)

- [ ] Create the branch from `main`
- [ ] Build the current site and save the list of every URL in `dist/` outside the repo (a checklist for step 4: after the move, each of these URLs must still open)

**Done when:** the build is green and the URL list is saved.

### Step 1 · Registry and content (1 d)

- [ ] Add `src/data/courses.ts` (slug, titles, description, `status`)
- [ ] `git mv` `src/content/labs/*` into `labs/web-development/`, and `tasks/*` into `tasks/web-development/`
- [ ] `git mv` lecture data into `src/data/lectures/web-development/`
- [ ] Make `src/lib/labs.ts` work for one chosen course at a time (only its labs and links); add a matching file for lectures: `src/lib/lectures.ts`
- [ ] Check that the entry id keeps the folder (`web-development/lab-4`); if not, add a `course` frontmatter field

**Done when:** `npm run check` passes.

### Step 2 · Routes (1 d)

- [ ] `git mv` the pages into `src/pages/[course]/…`; build paths from registry × entries
- [ ] Add `[course]/index.astro`; turn `src/pages/index.astro` into the hub of course cards
- [ ] Leave `labs/lab-7/check.astro` and `report.astro` where they are

**Done when:** the build has `/web-development/labs/` for all 10 labs, 6 task pages and 2 decks.

### Step 3 · Header, titles, labels (0.5 d)

- [ ] Course switcher in `SiteHeader`; footer links from the registry
- [ ] Breadcrumbs: add the course in front (`Web Development › Labs › ЛР-1`); everything else stays as it is
- [ ] `<title>`: lab, lecture and task titles stay as they are; the end of the title becomes the course name instead of the fixed "Web Development 2026"
- [ ] Deck title slide takes the course name from the registry

**Done when:** every page names the right course.

### Step 4 · Old links (0.5 d)

- [ ] Add `redirects` for `/lectures/*`, `/labs/*` and `/labs/*/task`
- [ ] Repoint the 30 Markdown links and the hard-coded `withBase('/labs/…')` paths in `.astro` files (not the ЛР-7 check and report pages)
- [ ] Leave PDFs and ZIPs in `public/labs/`

* [ ] Check the redirects in the build: open `dist/labs/lab-1/index.html`; if its target address lacks `/web-development-2026/`, add it to the redirect destinations

**Done when:** every URL from step 0 returns its page or a redirect, and every PDF and ZIP loads.

### Step 5 · Course stubs (0.5 d)

- [ ] Register `react` and `web-accessibility` with `status: 'draft'`
- [ ] Add one placeholder lecture and one placeholder lab to each
- [ ] `docs/build-pack.py`: optional course argument for new starters

**Done when:** the stubs build and produce no public routes.

### Step 6 · Docs by course and final check (1 d)

- [ ] Create `docs/web-development/` and `git mv` into it all `docs/lab-*` folders, `course-plan.md`, `lab-1-implementation-guide.md`, `individual-assignment-implementation-guide.md` and `tutorial-site-plan.md`
- [ ] Files that Git ignores (reference solutions, defect maps, mockup source) are not moved by `git mv`: back them up, move them by hand, and change the 5 matching paths in `.gitignore` in the same commit
- [ ] Fix paths inside the moved files: the `mockup` script in `package.json`, links in `README.md` and `docs/web-development/course-plan.md`, and paths in the scripts of the `docs/lab-*` folders where they point at repository files
- [ ] Keep `docs/agents/`, `presentation-app-guide.md`, `build-pack.py` and `build-handout.py` in `docs/` (shared by all courses)
- [ ] Update README *Layout*, the `AGENTS.md` architecture list and the route names in `docs/agents/pr-review.md`
- [ ] Check that `git status` shows no new files under `docs/` that should stay private
- [ ] Run `npm run check && npm run build`
- [ ] On a preview deploy, click through hub, lab, task, deck and keyboard navigation

**Done when:** the docs match the code and the click-through finds no broken link.

## Decisions I need from you

- [ ] Site name. The header says "Web Development 2026" today. With three courses I suggest a neutral name there (your choice), while page titles end with the course name.
- [ ] Repository name and `base`. I suggest keeping `/web-development-2026` for now: nothing breaks, the name just no longer fits. Renaming later needs a stub at the old address.
- [ ] Existing PDFs and ZIPs. I suggest leaving them in `public/labs/`; moving them means keeping a duplicate at every old path.

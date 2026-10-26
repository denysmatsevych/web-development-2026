# Web Development 2026

One Astro + Tailwind CSS v4 project for the whole course:

| Path | What |
| --- | --- |
| `/` | Course hub |
| `/<course>/` | Course landing page |
| `/<course>/lectures/`, `/<course>/lectures/<lecture>` | Lecture index and slide decks (keyboard-driven, print to PDF) |
| `/<course>/labs/`, `/<course>/labs/<lab>` | Lab index and assignments |
| `/<course>/labs/<lab>/task` | Practical-task brief (ТЗ), when the lab has one |
| `/lectures/*`, `/labs/*` | Legacy Web Development addresses redirect to the course-prefixed routes; PDFs and ZIPs remain under `/labs/` |

## Quick start

Requires Node `>=22.12.0` (see `package.json` `engines`; the project targets Node 24 via `volta`).

```bash
npm install
npm run dev      # http://localhost:4321/web-development-2026/
```

| Command           | Action                                                              |
| ----------------- | ------------------------------------------------------------------- |
| `npm run dev`     | dev server                                                          |
| `npm run start`   | dev server (alias)                                                  |
| `npm run build`   | static build → `./dist`                                             |
| `npm run preview` | serve the production build                                          |
| `npm run check`   | `astro check` (types)                                               |
| `npm run mockup`  | local Courtly preview (requires the ignored reference mockup files) |

## Deck hotkeys (`/<course>/lectures/*`)

`→` `Space` next · `←` previous · `Home`/`End` first/last · `N` speaker notes ·
`F` fullscreen · `T` light/dark · `Ctrl+P` export to PDF

## Layout

```
src/
├─ pages/
│  ├─ index.astro                 course hub
│  ├─ [course]/                   course landing, lectures and labs
│  ├─ labs/                       legacy redirects + ЛР-7 check/report routes
│  └─ lectures/                   legacy redirects
├─ content/
│  ├─ labs/<course>/              one .md per lab assignment (the `labs` collection)
│  └─ tasks/<course>/             one .md per practical-task brief, id-linked 1:1 to its lab
├─ content.config.ts              schemas for `labs` and `tasks`
├─ layouts/   BaseLayout (shared <html>/<head>) · DeckLayout (fullscreen deck) ·
│             LabLayout (lab reading shell: article + "on this page" rail)
├─ components/ SiteHeader/Footer · ThemeToggle · deck (Slide, DeckChrome, RichText) ·
│               lab (LabHeader, AcceptanceChecklist, PricingMockup, MockupLightbox,
│                    CourtlyMockup, CourtlyCompare) · OnThisPage, PrevNext, Breadcrumbs
├─ data/
│  ├─ site.ts                     site metadata + course-relative section definitions
│  ├─ courses.ts                  course registry
│  ├─ courtly-mockup.json         lab-7 mockup captures' section offsets (generated)
│  └─ lectures/                   shared schema + course-indexed lecture registry and slide data
├─ lib/        paths.ts (withBase) · labs.ts (course-aware lab/task lookups) · utils.ts (cn)
├─ scripts/    deck.ts (deck navigation + theme) · docs.ts (lab scrollspy, ToC, theme, copy buttons) ·
│              courtly-check.ts (client-side grader behind the lab-7 auto-check route) ·
│              courtly-report.ts (the lab-7 student report, carried in its link) ·
│              courtly-spec.ts + courtly-compare.ts (the report's mockup comparison)
└─ styles/     global.css (design tokens, single Tailwind entry, hub styles) ·
               deck.css (deck-only, scoped to .deck-page) ·
               lab.css (lab-only, scoped to .lab-page, deliberately unlayered)

plugins/
└─ base-links.mjs   rewrites root-relative URLs in Markdown bodies for the GitHub Pages base path

courtly-assets/     design asset pack (tokens, images, spec)
courtly-booking-starter/  starter project: a catalogue app with seeded JS defects to debug
flowtask-starter/   starter project: a landing page to audit and fix
js-basics-starter/  starter project: pure data functions with provided node --test tests
layout-lab-starter/ starter project: responsive-layout code challenges
showfinder-starter/ starter project: a TVmaze API app to build from AI drafts, with a stubbed-fetch self-check
showfinder-ts-starter/ starter project: a TVmaze app to migrate from JavaScript to TypeScript, with type checks and node --test tests
watchlist-starter/  starter project: a DOM app to build from AI drafts, with an in-browser self-check
```

See `docs/agents/design-system.md` for which stylesheet owns what and how
theming differs between the hub, decks, and labs.

## Per-lab starter kits and asset packs

Some labs need a standalone starter project or a downloadable asset pack —
e.g. a deliberately imperfect landing page to audit, or a design spec with
images. These live as top-level directories outside `src/` (listed in the
tree above), each with its own `README.md` explaining what it's for and
which lab it belongs to. A new one follows the same pattern: its own
directory, its own README, and a line in the tree.

## Deploy

GitHub Pages project site at `https://denysmatsevych.github.io/web-development-2026/`,
via `.github/workflows/deploy.yml` on push to `main` (`withastro/action`
installs, builds, and uploads the site; a second job deploys it). `base` in
`astro.config.mjs` must stay equal to the repository name.

This workflow only runs on push to `main`, after merge — it does not gate
pull requests. PR checks run separately via `.github/workflows/pr-check.yml`
and run `astro check` and a build on every pull request.

A lab's client-side tooling may need a build-time environment variable to
work fully (e.g. an API key for a feature that degrades gracefully without
one). `deploy.yml` threads these through as repository variables — check its
own comments for what's currently wired up and why, rather than expecting an
exhaustive list here.

## Docs

Each course has its own folder under `docs/`: `docs/web/` for the
`web-development` course. A course folder holds
the course plan, the course's guides and build scripts, and one `lab-N/`
folder per lab that needs instructor notes or tooling. Docs that serve every
course (`docs/agents/`, the deck guide, site-wide plans) stay at the top of
`docs/`.

- [docs/web/course-plan.md](docs/web/course-plan.md) — Web Development: the programme's tables and how the site maps to them
- [docs/presentation-app-guide.md](docs/presentation-app-guide.md) — how the slide deck is built
- [docs/web/lab-1-implementation-guide.md](docs/web/lab-1-implementation-guide.md) — lab implementation notes and project conventions
- [docs/web/individual-assignment-implementation-guide.md](docs/web/individual-assignment-implementation-guide.md) — individual assignment (ІЗ) implementation notes

## For AI agents

See `AGENTS.md` — tech stack, commands, architecture, and which
`docs/agents/*.md` file to read before reviewing a PR, writing a commit, or
touching styles/components.

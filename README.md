# Web Development 2026

One Astro + Tailwind CSS v4 project for the whole course:

| Path                                | What                                                 |
| ----------------------------------- | ---------------------------------------------------- |
| `/`                                 | Course hub — links to the main sections              |
| `/lectures/`, `/lectures/lecture-1` | Lecture slide decks (keyboard-driven, print to PDF)  |
| `/labs/`, `/labs/lab-1`             | Lab assignments                                      |
| `/labs/lab-2/task`                  | The practical-task brief (ТЗ) for a lab that has one |

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

## Deck hotkeys (`/lectures/*`)

`→` `Space` next · `←` previous · `Home`/`End` first/last · `N` speaker notes ·
`F` fullscreen · `T` light/dark · `Ctrl+P` export to PDF

## Layout

```
src/
├─ pages/
│  ├─ index.astro                 hub
│  ├─ lectures/                   deck index + [lecture].astro (one deck per slug)
│  └─ labs/                       labs index + [lab].astro + [lab]/task.astro (ТЗ brief);
│                                  a lab can also get a one-off static route beside
│                                  these (e.g. an instructor tool) when a collection
│                                  field would be ceremony for something only one lab
│                                  needs — see that route's own file comment
├─ content/
│  ├─ labs/                       one .md per lab assignment (the `labs` collection)
│  └─ tasks/                      one .md per practical-task brief (the `tasks` collection),
│                                  id-linked 1:1 to its lab
├─ content.config.ts              schemas for `labs` and `tasks`
├─ layouts/   BaseLayout (shared <html>/<head>) · DeckLayout (fullscreen deck) ·
│             LabLayout (lab reading shell: article + "on this page" rail)
├─ components/ SiteHeader/Footer · ThemeToggle · deck (Slide, DeckChrome, RichText) ·
│               lab (LabHeader, AcceptanceChecklist, PricingMockup, MockupLightbox,
│                    CourtlyMockup) · OnThisPage, PrevNext, Breadcrumbs
├─ data/
│  ├─ site.ts                     site meta + the section list
│  └─ lectures/                   lecture registry + per-lecture slide data
├─ lib/        paths.ts (withBase) · labs.ts (lab/task lookups) · utils.ts (cn)
├─ scripts/    deck.ts (deck navigation + theme) · docs.ts (lab scrollspy, ToC, theme, copy buttons) ·
│              courtly-check.ts (client-side grader behind the lab-7 auto-check route)
└─ styles/     global.css (design tokens, single Tailwind entry, hub styles) ·
               deck.css (deck-only, scoped to .deck-page) ·
               lab.css (lab-only, scoped to .lab-page, deliberately unlayered)

plugins/
└─ base-links.mjs   rewrites root-relative URLs in Markdown bodies for the GitHub Pages base path

courtly-assets/     design asset pack (tokens, images, spec)
flowtask-starter/   starter project: a landing page to audit and fix
layout-lab-starter/ starter project: responsive-layout code challenges
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

- [docs/presentation-app-guide.md](docs/presentation-app-guide.md) — how the slide deck is built
- [docs/lab-1-implementation-guide.md](docs/lab-1-implementation-guide.md) — lab implementation notes and project conventions
- [docs/individual-assignment-implementation-guide.md](docs/individual-assignment-implementation-guide.md) — individual assignment (ІЗ) implementation notes

## For AI agents

See `AGENTS.md` — tech stack, commands, architecture, and which
`docs/agents/*.md` file to read before reviewing a PR, writing a commit, or
touching styles/components.

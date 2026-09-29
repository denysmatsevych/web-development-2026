# Web Development 2026

One Astro + Tailwind CSS v4 project for the whole course:

| Path                                | What                                                |
| ----------------------------------- | --------------------------------------------------- |
| `/`                                 | Course hub — links to the main sections             |
| `/lectures/`, `/lectures/lecture-1` | Lecture slide decks (keyboard-driven, print to PDF) |
| `/labs/`                            | Lab assignments (in progress)                       |

## Quick start

```bash
npm install
npm run dev      # http://localhost:4321/web-development-2026/
```

| Command           | Action                     |
| ----------------- | -------------------------- |
| `npm run dev`     | dev server                 |
| `npm run build`   | static build → `./dist`    |
| `npm run preview` | serve the production build |
| `npm run check`   | `astro check` (types)      |

## Deck hotkeys (`/lectures/*`)

`→` `Space` next · `←` previous · `Home`/`End` first/last · `N` speaker notes ·
`F` fullscreen · `T` light/dark · `Ctrl+P` export to PDF

## Layout

```
src/
├─ pages/
│  ├─ index.astro              hub
│  ├─ lectures/                deck index + [lecture].astro (one deck per slug)
│  └─ labs/                    labs index
├─ layouts/   BaseLayout · DeckLayout (fullscreen deck)
├─ components/ SiteHeader/Footer · deck (Slide, DeckChrome, RichText)
├─ data/
│  ├─ site.ts                  site meta + the section list
│  └─ lectures/                lecture registry + per-lecture slide data
├─ lib/      · paths.ts (withBase) · utils.ts (cn)
├─ scripts/    deck.ts (slides)
└─ styles/     global.css (institute design system, single Tailwind entry) · deck.css (deck-only)
```

## Deploy

GitHub Pages via `.github/workflows/deploy.yml` on push to `main`. Deploys to
`denysmatsevych/web-development-2026` → https://denysmatsevych.github.io/web-development-2026/
(enable once at **Settings → Pages → Source: GitHub Actions**). `base` in
`astro.config.mjs` must stay equal to the repository name.

## Docs

- [docs/presentation-app-guide.md](docs/presentation-app-guide.md) — how the slide deck is built
- [docs/lab-1-implementation-guide.md](docs/lab-1-implementation-guide.md) — lab implementation notes and project conventions

# AGENTS.md

This repository is a static course website built with Astro, Tailwind CSS
v4, and TypeScript. It has three surfaces: a course hub, lecture slide
decks, and lab assignments (with per-lab practical-task briefs).

## Task workflows

- Before reviewing a PR, read `docs/agents/pr-review.md`.
- Before writing a commit message, read `docs/agents/commit.md`.
- Before changing styles or adding a component, read `docs/agents/design-system.md`.

Always consult the respective file when performing these tasks.

## Tech stack

- Astro for routing, static generation, content collections, and page layouts
- Tailwind CSS v4 for the single-source design system and utility classes
- TypeScript for type-safe configuration, content schema validation, and project tooling
- GitHub Pages project-site deployment using a repository-based base path

## Project commands

Requires Node `>=22.12.0` (`package.json` `engines`; the project targets
Node 24 via `volta`). Run these from the repository root:

```bash
npm install
npm run dev
npm run build
npm run preview
npm run check
```

Notes:

- `npm run dev` starts the local site for development using the project base path at `/web-development-2026/`
- `npm run build` produces a production static build in `dist/`
- `npm run preview` serves the built site locally
- `npm run check` runs `astro check` for TypeScript and Astro validation

## Local development

Use the repository base path while developing locally:

```text
http://localhost:4321/web-development-2026/
```

The project is designed for GitHub Pages deployment as a project site. Keep the `base` path aligned with the repository name at all times.

Important rule:

- `astro.config.mjs` must keep `base` equal to the repository base path, currently `/web-development-2026`
- Do not change this value casually; it affects all internal URLs and assets

## Architecture guidance

The current `src/` layout is documented in `README.md` — read it there
rather than relying on a second copy here, so there's one place to keep
correct. The essentials:

- `src/pages/` — route entry points for the hub, lecture decks, and labs
- `src/content/labs/` and `src/content/tasks/` — the two content
  collections (lab assignments and their practical-task briefs), schemas in
  `src/content.config.ts`
- `src/layouts/` — `BaseLayout` (shared `<html>`/`<head>`), `DeckLayout`
  (fullscreen deck shell), `LabLayout` (lab reading shell)
- `src/components/` — reusable UI structures and page components
- `src/styles/` — three stylesheets, each scoped to one surface; see
  `docs/agents/design-system.md` for which one owns what and the per-surface
  dark-mode rule
- `plugins/base-links.mjs` — rewrites root-relative URLs in Markdown bodies
  for the base path; see `docs/agents/pr-review.md` for its coverage and gap

When adding or modifying features:

- keep routing consistent with the existing Astro file structure
- preserve content collection schemas and frontmatter conventions
- prefer reusable layout and component patterns over page-specific duplication
- keep visual design aligned with the site-wide design system and dark/light theme tokens — but check `docs/agents/design-system.md` first, since decks and labs each handle theming differently from the hub
- ensure links and asset paths still work with the configured base path (see `docs/agents/pr-review.md` §3 for the two mechanisms that handle this)

## Contribution expectations

- Small, reviewable diffs are preferred
- Type-safe code and valid Astro content are required
- Responsive layouts should work across common screen sizes
- Lab/task routes must keep slug generation and schema validation coherent
- Verify with `npm run check` before finalizing changes

## Documentation principles

This applies to README.md, AGENTS.md, docs/agents/*.md, CONTRIBUTING.md, and
code comments alike.

- **One source of truth per fact, everything else points to it.** If the
  same rule, tree diagram, or example needs to appear in two files, put it
  in one and link from the other. A forked copy doesn't just risk drifting —
  it _will_ drift the first time only one side gets updated.
- **Write for the mechanism, not the current instance.** A comment that
  says "see `src/data/curriculum.ts` for the handbook's chapter tree" breaks
  the moment that file is deleted. A comment that says "labs are ordered by
  `number` in frontmatter — no separate index file to keep in sync" survives
  a neighboring feature's removal because it doesn't depend on that feature
  existing.
- **Treat "deleting X touched comments in N unrelated files" as a bug in the
  docs, not a normal cost of deletion.** If removing one surface requires
  editing a dozen files' worth of prose that merely _mentioned_ it in
  passing, that's duplication that should have been a pointer. Fix the
  structure in the same change, not just the stale text.
- **A PR that removes a feature should grep for it** — class names, file
  paths, and the feature's name in prose — across the whole repo, not just
  the files it directly touches, and fix or flag what turns up. See
  `docs/agents/pr-review.md` for this as a reviewer checklist item.

## Useful repo references

- `astro.config.mjs` for site-level base path and deployment config
- `src/content.config.ts` for content collections and schema rules
- `src/lib/paths.ts` for base-aware internal URL generation
- `src/styles/global.css` for Tailwind v4 tokens and theme variables
- `README.md` for the current `src/` tree and higher-level project overview

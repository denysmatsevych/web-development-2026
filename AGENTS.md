# AGENTS.md

This repository is a static course website built with Astro, Tailwind CSS v4, and TypeScript. It combines a course hub, lecture decks, lab pages, and a javascript.info-style handbook for HTML, CSS, and JavaScript content.

## Agent Skills
Specialized workflows are defined under `.agent/skills/`:
- PR Review: `.agent/skills/pr-review/SKILL.md`
- Design System: `.agent/skills/design-system/SKILL.md`
- Commit Guidelines: `.agent/skills/commit/SKILL.md`

Always consult the respective skill file when performing these tasks.

## Tech stack

- Astro for routing, static generation, content collections, and page layouts
- Tailwind CSS v4 for the single-source design system and utility classes
- TypeScript for type-safe configuration, content schema validation, and project tooling
- GitHub Pages project-site deployment using a repository-based base path

## Project commands

Run these from the repository root:

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

Follow the existing structure and keep concerns separated:

- `src/pages/` contains the route entry points for the hub, lecture decks, labs, and handbook pages
- `src/content/docs/` stores the handbook Markdown sources and content collections
- `src/layouts/` contains the shared layout shells such as the base layout, docs layout, and deck layout
- `src/components/` holds reusable UI structures and page components
- `src/styles/global.css` is the single Tailwind entry and the design-system source for the site
- `src/styles/deck.css` is the deck-specific styling layer for lecture presentations

When adding or modifying features:

- keep routing consistent with the existing Astro file structure
- preserve content collection schemas and frontmatter conventions
- prefer reusable layout and component patterns over page-specific duplication
- keep visual design aligned with the site-wide design system and dark/light theme tokens
- ensure links and asset paths still work with the configured base path

## Contribution expectations

- Small, reviewable diffs are preferred
- Type-safe code and valid Astro content are required
- Responsive layouts should work across common screen sizes
- Docs and lecture routes must keep slug generation and schema validation coherent
- Verify with `npm run check` before finalizing changes

## Useful repo references

- `astro.config.mjs` for site-level base path and deployment config
- `src/content.config.ts` for content collections and schema rules
- `src/lib/paths.ts` for base-aware internal URL generation
- `src/styles/global.css` for Tailwind v4 tokens and theme variables
- `README.md` for higher-level project overview

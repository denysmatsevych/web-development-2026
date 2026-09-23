---
name: "pr-review"
description: "Review diffs for the Astro course site, validate type safety, responsive behavior, and route/content consistency before merging."
---

# PR review checklist

Use this checklist when reviewing a change in this repository.

## 1. Validate the project still type-checks

Run:

```bash
npm run check
```

Review any Astro or TypeScript errors before approving. This repo relies on strict content collection validation and route generation, so schema or typing regressions are high-impact.

## 2. Check the diff scope

Confirm the PR is focused and does not mix unrelated changes. Good diffs are easy to reason about and map to a single feature, bug fix, or documentation update.

Look for:

- unclear or oversized changes
- unrelated formatting churn
- debug code or temporary console output
- dead or duplicated components
- content edits without matching route or schema adjustments

## 3. Review responsive behavior and Tailwind CSS v4 usage

Verify layout and styling remain consistent with the project’s design system:

- prefer utility classes and theme tokens defined in `src/styles/global.css`
- respect the dark/light theme structure and semantic color variables
- check spacing, typography, and hierarchy for readability
- verify the change works on mobile and wider layouts
- avoid ad hoc custom CSS when a shared pattern or token already exists

For deck work, also confirm that `src/styles/deck.css` behavior remains isolated to lecture slides and does not leak into the hub or handbook.

## 4. Validate routing and content integrity

This project uses generated static routes and content collections. Review with special attention to:

- links and internal paths still work with the GitHub Pages `base` prefix
- slug generation is consistent for docs and lecture routes
- frontmatter matches the expected schema in `src/content.config.ts`
- docs pages still align with the curriculum data and chapter ordering
- lab and lecture content remain discoverable and correctly named

## 5. Verify build safety

Run the project build before approval when the diff affects config, layout, routes, or content:

```bash
npm run build
```

If the change touches deployment assumptions, ensure the `base` path in `astro.config.mjs` still matches the repository name.

## 6. Approve only when the change is safe

A PR is ready to merge when:

- `npm run check` passes
- the build succeeds for relevant changes
- the UI remains responsive and visually coherent
- route and content schema assumptions remain valid
- the diff is scoped, clean, and understandable

## Example review summary

```md
- [ ] `npm run check` passed
- [ ] `npm run build` passed
- [ ] Responsive layout reviewed
- [ ] Tailwind v4 tokens used correctly
- [ ] Slugs and content schema remain valid
- [ ] GitHub Pages base path untouched or verified
```

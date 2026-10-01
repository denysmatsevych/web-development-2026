# Contributing

This repository is the course site for Web Development 2026, built with Astro, Tailwind CSS v4, and TypeScript. Keep changes focused, consistent, and easy to review.

Requires Node `>=22.12.0` (see `package.json` `engines`; the project targets Node 24 via `volta`).

## Branching strategy

Use a short-lived branch for each change, prefixed with the commit type it mostly contains:

- `feat/*` — new functionality, pages, content, or UI work
- `fix/*` — bug fixes and regressions
- `docs/*` — documentation-only changes
- `chore/*` — maintenance, tooling, and config updates
- `refactor/*` — structural cleanup without behavior changes
- `test/*` — adding or changing tests, when the project has them
- `ci/*` — CI/workflow changes

Recommended flow:

```bash
git checkout main
git pull --ff-only

git checkout -b feat/my-change
# make changes

git add .
git commit -m "feat(ui): add ..."
git push -u origin feat/my-change
```

Keep branches small and scoped to one concern. Rebase or merge from `main` before opening a PR when needed.

## Commit conventions

Use [Conventional Commits](https://www.conventionalcommits.org/): `<type>(<scope>): <summary>`, imperative mood, no trailing period.

### Types

- `feat` — new user-facing or project functionality
- `fix` — bug fix or regression repair
- `docs` — documentation-only changes
- `style` — formatting, spacing, theming, visual polish without logic changes
- `refactor` — internal restructuring without behavioral change
- `perf` — a change that improves performance
- `test` — adding or correcting tests
- `build` — changes to the build system or external dependencies
- `ci` — changes to CI configuration and scripts
- `chore` — tooling, maintenance work that doesn't fit the above
- `revert` — reverts a previous commit

This list is exhaustive — if nothing fits, that's a sign to extend this list in the same change, not to improvise.

### Scope

Scope is **optional**. Add one when it meaningfully narrows the subject — a surface or module name (`deck`, `lab`, `hub`, `agents`, a component). Omit it when the type alone is clear, or the change is cross-cutting. There is no rule requiring a scope, and no rule forbidding one — use judgment, don't force consistency where it doesn't help a reader.

### Examples

```bash
git commit -m "feat(deck): add keynote navigation controls"
git commit -m "fix(labs): correct slug generation for individual assignment"
git commit -m "docs: add PR checklist"
git commit -m "style(global): adjust card spacing and contrast"
git commit -m "refactor(layout): simplify lab shell structure"
git commit -m "chore(build): update astro and tailwind config"
git commit -m "ci: add pull_request check workflow"
```

## Pull request guidelines

Open a PR only when the change is ready for review.

### Required before opening a PR

- Ensure the branch is up to date with `main`
- Confirm the change matches the issue or task scope
- Run the verification commands yourself — PR checks run
  automatically on pull requests via `.github/workflows/pr-check.yml`,
  but running them locally before pushing catches issues early:

```bash
npm run check
npm run build
```

- Check that the work is responsive and consistent with the existing design system (`docs/agents/design-system.md`)
- For an accessibility-relevant change, check it against the relevant WCAG criteria (`docs/agents/design-system.md` → Accessibility)
- Avoid unrelated edits in the same PR
- Include screenshots or brief notes for UI changes when useful

## Review expectations

- Keep review comments actionable and specific
- Prefer small, clear diffs that are easy to reason about
- Ensure route changes, content schema updates, and static site configuration remain consistent with the GitHub Pages deployment setup
- Do not merge without addressing blocking review feedback
- See `docs/agents/pr-review.md` for the full reviewer checklist

## Deployment and site hygiene

This project is deployed as a GitHub Pages project site. Keep the static site configuration aligned with the repository name and project base path.

Important rule:

- The `base` value in `astro.config.mjs` must remain aligned with the repo name, currently `/web-development-2026`

If you change routing, links, or deployment assumptions, confirm they still work with the project site base path — see `docs/agents/pr-review.md` §3 for the two mechanisms involved.

## Keeping documentation accurate

See `AGENTS.md` → **Documentation principles** for how this repo expects
docs to be written and maintained — the short version: one source of truth
per fact, pointers instead of copies, and comments that name a mechanism
rather than re-describe a feature that might later be deleted.

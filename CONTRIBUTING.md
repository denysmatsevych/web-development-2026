# Contributing

This repository is the course site for Web Development 2026, built with Astro, Tailwind CSS v4, and TypeScript. Keep changes focused, consistent, and easy to review.

## Branching strategy

Use a short-lived branch for each change.

- `feature/*` for new functionality, pages, content, or UI work
- `fix/*` for bug fixes and regressions
- `docs/*` for documentation-only changes
- `chore/*` for maintenance, tooling, and config updates
- `refactor/*` for structural cleanup without behavior changes

Recommended flow:

```bash
git checkout main
git pull --ff-only

git checkout -b feature/my-change
# make changes

git add .
git commit -m "feat(ui): add ..."
git push -u origin feature/my-change
```

Keep branches small and scoped to one concern. Rebase or merge from `main` before opening a PR when needed.

## Commit conventions

Use Conventional Commits with clear imperative language and a scope when helpful.

Format:

```text
<type>(<scope>): <summary>
```

Allowed types:

- `feat:` — new user-facing or project functionality
- `fix:` — bug fix or regression repair
- `docs:` — documentation updates
- `style:` — formatting, spacing, theming, visual polish without logic changes
- `refactor:` — internal restructuring without behavioral change
- `chore:` — tooling, config, dependency, or maintenance work

Examples:

```bash
git commit -m "feat(deck): add keynote navigation controls"
git commit -m "fix(docs): correct handbook slug generation"
git commit -m "docs(contributing): add PR checklist"
git commit -m "style(global): adjust card spacing and contrast"
git commit -m "refactor(layout): simplify docs shell structure"
git commit -m "chore(build): update astro and tailwind config"
```

## Pull request guidelines

Open a PR only when the change is ready for review and the relevant checks pass.

### Required before opening a PR

- Ensure the branch is up to date with `main`
- Confirm the change matches the issue or task scope
- Run the relevant verification commands:

```bash
npm run check
npm run build
```

- Check that the work is responsive and consistent with the existing design system
- Avoid unrelated edits in the same PR
- Include screenshots or brief notes for UI changes when useful

### PR template checklist

Use a checklist like the following in the PR description:

```md
## Summary

- [ ] Briefly describe the purpose of the change.

## What changed

- [ ] Document the main files or sections affected.
- [ ] Note any content, routing, or design-system updates.

## Verification

- [ ] `npm run check`
- [ ] `npm run build`
- [ ] Manual UI review for mobile/desktop behavior
- [ ] Confirmed no broken internal links or route mismatches

## Notes

- [ ] Call out any follow-up work or known limitations.
```

## Review expectations

- Keep review comments actionable and specific
- Prefer small, clear diffs that are easy to reason about
- Ensure route changes, content schema updates, and static site configuration remain consistent with the GitHub Pages deployment setup
- Do not merge without addressing blocking review feedback

## Deployment and site hygiene

This project is deployed as a GitHub Pages project site. Keep the static site configuration aligned with the repository name and project base path.

Important rule:

- The `base` value in `astro.config.mjs` must remain aligned with the repo name, currently `/web-development-2026`

If you change routing, links, or deployment assumptions, confirm they still work with the project site base path.

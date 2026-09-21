---
name: "commit"
description: "Draft concise, conventional commit messages from a git diff while keeping scope and imperative wording clear and project-appropriate."
---

# Commit message guidance

Generate commit messages from the current `git diff` and keep them short, factual, and standardised.

## Required format

Use Conventional Commits:

```text
<type>(<scope>): <imperative summary>
```

Examples:

```text
feat(deck): add keyboard navigation controls
fix(docs): correct handbook slug generation
docs(contributing): add pull request checklist
style(global): adjust card spacing and theme contrast
refactor(layout): simplify docs shell structure
chore(build): update Astro and Tailwind config
```

## Preferred types

- `feat:` for new functionality or visible feature work
- `fix:` for defect fixes or regressions
- `docs:` for documentation and contributor guidance
- `style:` for visual polish or formatting-only edits
- `refactor:` for code cleanup without functional change
- `chore:` for tooling, config, dependency, or build maintenance

## Writing rules

- Use the imperative mood: “add”, “fix”, “update”, “remove”, not “added” or “fixed”
- Keep the summary brief and specific
- Add a scope when the change is clearly tied to a subsystem, such as `deck`, `docs`, `layout`, `ui`, `content`, or `build`
- Mention the real effect of the change, not the internal process
- Avoid vague messages like “misc updates” or “cleanup” without context

## How to draft from a diff

1. Inspect the changed files and identify the primary effect
2. Group related edits into a single cohesive commit subject
3. Choose the correct Conventional Commit type
4. Add a narrow scope only if it clarifies the subject
5. Ensure the summary is one line and remains readable in a git log

## Good commit examples for this project

```text
feat(labs): add lab index cards and metadata
fix(base): preserve GitHub Pages routing with repo base path
docs(agents): add project architecture guidance
style(global): align handbook typography with design tokens
refactor(content): simplify doc collection metadata handling
chore(deps): update Astro and Tailwind CSS packages
```

## Avoid

- commits with no scope when a scoped message is obvious
- mixing unrelated work into one commit
- long summaries that describe every file change in detail
- non-standard prefixes or casual wording

## Final check

Before finalizing a message, confirm it matches the actual diff and reads naturally in a project history:

```bash
git diff --stat
```

Then write the commit as a single concise sentence in the Conventional Commits format.

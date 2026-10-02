# Commit messages

Full convention — types, scope policy, branch naming — lives in
`CONTRIBUTING.md` under **Commit conventions**. Read it there; this file is
the quick operational checklist, not a second copy of the rules.

## Before writing a commit message

1. Pick the type that matches what actually changed, not what sounds most
   impressive. A one-line CSS tweak is `style:`, not `fix:`; a dependency
   bump with no behavior change is `chore:`, not `fix:`.
2. Add a scope only when it narrows the subject usefully (`deck`, `lab`,
   `hub`, `agents`, a component name). Skip it rather than force one.

## Common mistakes to avoid

- **Don't invent a type.** If nothing in `CONTRIBUTING.md`'s type list fits,
  that's a sign the list needs updating — flag it, don't improvise a type
  that isn't documented anywhere.
- **Don't bundle unrelated changes into one commit.** Match the PR-review
  expectation of small, scoped diffs (`docs/agents/pr-review.md`) at the
  commit level too.
- **Don't reference a deleted surface in an example or a real message**,
  even as a hypothetical. Copy-pasting a stale example is how references to
  removed features spread back into the codebase.
- **Don't write past tense or a trailing period** — `fix(deck): guard
  key-repeat`, not `Fixed the key-repeat bug.`
- **Don't add attribution or vendor trailers.** See `CONTRIBUTING.md` →
  **Attribution and AI policy** for the full rule on `Co-Authored-By`,
  tool branding, and AI-assisted review footers.

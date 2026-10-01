# PR review

Read this before reviewing a pull request against this repo.

## 1. CI runs checks, but review the results

PR checks run automatically on pull requests via `.github/workflows/pr-check.yml`,
which runs `npm run check` and `npm run build`. Treat the CI status as a
baseline — if it fails, the PR is not ready. If it passes, still scan the
output for warnings and confirm the change works as intended:

```bash
npm run check
npm run build
```

A type regression or a broken route will surface in CI, but catching it
locally before pushing is faster for everyone.

## 2. Content collections are `labs` and `tasks` — nothing else

`src/content.config.ts` defines exactly two collections:

- **`labs`** — one Markdown file per lab assignment (`src/content/labs/`),
  ordered by `number`, kind `lab` or `individual`.
- **`tasks`** — one practical brief per lab (`src/content/tasks/`), id-linked
  to its lab 1:1 (the task's id _is_ its lab's id — no separate field to
  keep in sync).

There is no `docs`/handbook collection and no curriculum data file. If a PR
references either, or adds content outside `labs`/`tasks`, that's a sign it
was written against an older version of the site — flag it.

## 3. Base-path correctness — two different mechanisms, check both

The site deploys under a GitHub Pages project path
(`/web-development-2026`), so an unprefixed root-relative URL breaks in
production even though it works in local preview. Two different mechanisms
handle this, for two different contexts:

- **`.astro` files** — call `withBase()` from `src/lib/paths.ts` for every
  internal `href`/`src`. Grep for a bare `href="/` or `src="/` in any
  reviewed `.astro` file; that's almost always a bug.
- **Markdown bodies** (lab/task content) — root-relative URLs are rewritten
  automatically at build time by `plugins/base-links.mjs`. You don't need to
  ask lab content authors to call anything — but the rewrite only covers
  `href`/`src` on `a`, `area`, `img`, `source`, `video`, `audio`, and `src`
  on `iframe`. **It does not rewrite `srcset`.** If a reviewed Markdown body
  adds an `<img srcset="/labs/…">`, that attribute will not get the base
  prefix and will 404 in production — this is the one gap in an otherwise
  automatic system, so it's worth specifically checking for.

## 4. Decks keep their own theme — don't let `dark:` creep in

If a PR touches `Slide.astro`, `DeckChrome.astro`, or anything else rendered
inside `DeckLayout`, check for `dark:` Tailwind utilities. Decks use
`html.theme-light` (toggled by the deck's `T` hotkey), not `html.dark` — a
`dark:` utility in a deck component will never respond to that hotkey. See
`docs/agents/design-system.md` for the full per-surface theme breakdown.

## 5. `lab.css`'s light-theme palette is intentionally hardcoded

If a PR "cleans up" hardcoded hex colors in `lab.css`'s light theme by
replacing them with `--color-*` tokens, that's very likely a regression, not
a cleanup — that palette is deliberately matched to the PDF handouts
students download (see `docs/agents/design-system.md`). Ask before approving
a change there.

## 6. Keyboard shortcuts: repeat-guard and physical-key matching

Any new `keydown` handler should:

- Bail on `event.repeat` before doing anything else, so holding the key down
  doesn't rapid-fire the handler.
- Match `event.code` (physical key), not `event.key`, if the shortcut is a
  plain letter with no modifier — `event.key` depends on the active keyboard
  layout and silently stops matching on a non-Latin layout.
- Check `!event.shiftKey` alongside the other modifiers, unless Shift+key is
  an intended second shortcut.
- Skip the shortcut when focus is in a text field (`input`, `textarea`,
  `select`, `[role="textbox"]`, `[role="searchbox"]`, or
  `isContentEditable`).

## 7. Small, scoped diffs

- One concern per PR — flag an unrelated drive-by change even if it's an
  improvement; ask for it as a separate PR.
- For a UI change, ask for a screenshot or a one-line note on what changed
  visually if it isn't obvious from the diff.
- Verify route changes and content-schema changes don't silently drop
  content — a lab or task with a frontmatter field that no longer matches
  the Zod schema in `content.config.ts` fails the build loudly (good); a
  file in the wrong directory or with the wrong `kind`/`id` may not.

## 8. A feature-removal PR should leave no stale references

If a PR deletes a route, a component, or a content collection, check that
it also grepped the repo for the removed thing's name, file paths, and
class names — not just in the files it directly touched, but across
`README.md`, `AGENTS.md`, `docs/agents/*.md`, `CONTRIBUTING.md`, and
comments in unrelated files. See `AGENTS.md` → **Documentation
principles** for why this matters: a dozen stale mentions after one
deletion is a sign the docs were duplicated rather than centralized, and
worth fixing in the same PR, not a follow-up.

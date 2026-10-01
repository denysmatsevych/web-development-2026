# Design system

The site has three surfaces, each with its own theme mechanism and its own
stylesheet. There is no single global rule that covers all three — check
which surface you're in before applying any of the rules below.

| Surface | Route(s)               | Stylesheet                | Layout       |
| ------- | ---------------------- | ------------------------- | ------------ |
| Hub     | `/`                    | `global.css`              | `BaseLayout` |
| Decks   | `/lectures/<slug>`     | `global.css` + `deck.css` | `DeckLayout` |
| Labs    | `/labs/`, `/labs/<id>` | `global.css` + `lab.css`  | `LabLayout`  |

## Source of truth — three stylesheets, not two

- **`global.css`** — the single Tailwind entry (`@import "tailwindcss"`),
  design tokens, and the hub's styles. Every other stylesheet assumes this is
  loaded first and builds on its tokens.
- **`deck.css`** — imported only by `DeckLayout.astro`. Every rule is scoped
  to `.deck-page` (the `<body>` class `DeckLayout` sets) and never reaches
  the hub or labs.
- **`lab.css`** — imported only by `LabLayout.astro`. Every rule is scoped to
  `.lab-page`. **Deliberately unlayered**: it has to beat the `@layer base`
  `.doc-content` rules in `global.css`. If you add lab styling, put it here,
  not in `global.css` — rules added to `global.css`'s `@layer base` will lose
  to nothing and silently do nothing, because `lab.css` is specifically
  structured to win that fight, not the other way round.

## Dark mode is per-surface, not global

There is no one dark-mode rule for the whole site:

- **Hub**: `dark:` Tailwind utilities, keyed to `<html class="dark">`.
  `global.css` defines `@custom-variant dark (&:is(.dark *))` — that variant
  is what makes `dark:` utilities work at all, and it is driven by the
  `.dark` class, not by anything deck-specific.
- **Decks**: independent of the hub's theme. `deck.ts`'s `T` hotkey toggles
  `html.theme-light` (not `.dark`) and persists `localStorage['deck-theme']`.
  `deck.css` keys its light-theme rules off `html.theme-light`. **Do not use
  `dark:` utilities inside deck components** (`Slide.astro`, `DeckChrome.astro`)
  — they are keyed to `.dark`, which decks never set, so they will never
  respond to the deck's `T` hotkey. Style deck light/dark differences with
  plain selectors against `html.theme-light` in `deck.css` instead.
- **Labs**: uses the hub's `.dark` mechanism for the _dark_ theme (site
  tokens), but the _light_ theme is a fixed palette — see below. Labs don't
  have their own toggle; they follow whatever `<html class="dark">` says,
  same as the hub.

## Labs: the handout palette is a deliberate exception to "use tokens"

Prefer design-system variables over hardcoded color values — **except** in
`lab.css`'s light theme. Lab pages are built to match the handout PDFs
(`public/labs/*.pdf`) that students download alongside them: Montserrat
headings over Inter text, and in the light theme specifically, the PDF's own
color palette (verified AA-contrast on white: heading 13.9:1, subheading
10.6:1, text 12.2:1, code 5.0:1, link 6.6:1). The dark theme keeps the normal
site tokens — only light-theme colors in `lab.css` are fixed.

**Do not "fix" the hardcoded hex values in `lab.css`'s light-theme block by
replacing them with `--color-*` variables.** That would break the visual
match with the PDF, which is the entire point of that block. If you're
touching `lab.css` and unsure whether a given rule is "the deliberate PDF
palette" or "something that should use tokens like everywhere else," check
which theme the rule is under — light-theme color values are specifically a
no-touch.

`SiteHeader` / `SiteFooter` stay outside `.lab-shell` and stay on the site's
normal Roboto font — the Montserrat/Inter pairing is scoped to the lab
content itself, not the chrome around it.

## `.doc-content` — shared article typography

Both labs and (previously) the handbook render their Markdown bodies through
one shared class, `.doc-content`, defined in `global.css`'s `@layer base`.
It covers headings, lists, code blocks with copy buttons, tables,
blockquotes, and inline code. If you're styling rendered Markdown content,
check here first before adding a one-off rule — most typography needs are
already covered.

## Hover and motion

Hover effects that imply "this is clickable" (lift, border-color change)
belong only on actually-clickable elements — scope the selector to the tag,
not just the class, e.g. `a.glass-panel:hover`, not `.glass-panel:hover`,
if the same class is reused on a non-interactive container. Any `transform`
added for a hover effect needs a matching
`@media (prefers-reduced-motion: reduce)` override that sets it back to
`none`, with equal or higher specificity than the rule it's overriding —
Astro's scoped-style attribute bumps specificity, so a page-local override
can silently outrank a global one (or vice versa) if you're not deliberate
about it.

## Accessibility — check against WCAG, not just "looks fine"

Any UI or interaction change should be checked against the relevant WCAG
2.2 success criterion, not just eyeballed. This repo already follows these
in practice — match the existing pattern rather than relying on vibes:

- **2.3.1 Three Flashes or Below Threshold (seizures).** Any `keydown`
  handler that toggles a visual state (theme, a class, a visible panel)
  must bail on `event.repeat` before doing anything else. A held key must
  never produce rapid flashing — `docs.ts` and `deck.ts` both guard this;
  a new handler should too.
- **2.1.1 Keyboard.** Anything clickable must also be operable from the
  keyboard — a real `<button>`/`<a>`, not a `<div onclick>`. If you add a
  custom keyboard shortcut, match the physical key (`event.code`), not the
  character (`event.key`) — `event.key` depends on the active keyboard
  layout and silently stops matching on a non-Latin one (this site serves
  `lang="uk"` pages).
- **1.4.3 Contrast (Minimum).** Text needs at least 4.5:1 contrast against
  its background (3:1 for large text). `lab.css`'s light theme documents
  its actual contrast ratios in a comment for exactly this reason — when
  you add a new color pairing, check and note the ratio the same way,
  rather than eyeballing it.
- **Respect `prefers-reduced-motion`.** Any `transform`/animation added for
  a hover or transition effect needs a
  `@media (prefers-reduced-motion: reduce)` override, as described above.
  Not a hard WCAG requirement at the AA level the rest of this list targets,
  but already established practice here — follow it for new motion, too.

If a change doesn't obviously map to one of these, that's a sign to check
the criterion list rather than skip the check — <https://www.w3.org/WAI/WCAG22/quickref/>
is the authoritative reference.

## Keyboard shortcuts and `localStorage` keys

Two independent `keydown` listeners exist — one in `docs.ts` (hub + labs,
`course-theme` key) and one in `deck.ts` (decks, `deck-theme` key). If you
add a third surface with its own shortcut, keep its storage key distinct
from both, and guard against key-repeat (`if (event.repeat) return;`) before
anything else in the handler — holding a key down should never rapid-fire
your handler.

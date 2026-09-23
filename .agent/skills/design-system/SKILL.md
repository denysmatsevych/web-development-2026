---
name: "design-system"
description: "Use and extend the course site's design tokens, layout patterns, and component conventions across the hub, handbook, and deck pages."
---

# Design system guidance

This project uses a single Tailwind CSS v4 design layer centered in `src/styles/global.css`, with deck-specific visual rules in `src/styles/deck.css`.

## Core principles

- Prefer the existing semantic tokens and Tailwind utilities over one-off styles
- Keep the hub, handbook, and deck experiences visually coherent while allowing each surface to have its own layout intent
- Maintain accessible contrast and readable typography in both light and dark modes
- Reuse layout patterns rather than creating parallel solutions for similar UI blocks

## Source of truth

- `src/styles/global.css` is the primary design system entry point
- It defines the single Tailwind v4 import, theme variables, dark-mode variant, and shared tokens
- `src/styles/deck.css` contains deck-specific theming and presentation styling for lecture slides

When styling a new component, check the existing color variables and utility classes before adding custom CSS.

## Theming and color system

The app uses a class-based dark mode strategy with `dark:` utilities tied to `<html class="dark">`.

Key expectations:

- keep semantic tokens stable (`background`, `foreground`, `card`, `muted`, `border`, `primary`, etc.)
- prefer design system variables over hardcoded color values
- preserve a consistent visual hierarchy across sections
- ensure contrast remains acceptable in both light and dark themes

## Layout conventions

Create UI that matches the course site’s existing patterns:

- use clear spacing and content blocks rather than dense, custom layouts
- keep page shells consistent with the base layouts in `src/layouts/`
- favor component reuse from `src/components/`
- ensure tables, cards, navigation, and docs content maintain alignment with the rest of the site

## Hub, handbook, and decks

Each surface has a different purpose, but they should still feel like one course experience.

### Hub

- emphasizes navigation and discovery
- should feel polished, direct, and readable
- keeps information architecture simple and action-oriented

### Handbook

- built for reading and topic discovery
- should maintain strong typography, scannable sections, and clean navigation
- updates should respect docs content structure and chapter ordering

### Decks

- optimized for presentation and readability at a distance
- should use `src/styles/deck.css` rules without disturbing the rest of the site
- preserve slide navigation consistency and visual clarity under theme toggles

## Component guidance

When creating or extending a component:

1. check the nearest existing pattern in `src/components/`
2. match the surrounding layout and spacing system
3. use the theme tokens from `src/styles/global.css`
4. keep the component composable and reusable
5. ensure dark/light state and hover/focus interactions remain consistent

## Practical rules

- do not introduce brand-new color names unless they are truly required by the design system
- keep the global visual language stable across the course site
- do not hardcode base paths or route-specific styling into shared components without checking the deployment assumptions
- prefer accessible, readable defaults over decorative styling that undermines instructional content

## Review standard

Before finalizing a design change, confirm:

- it follows the established tokens and Tailwind v4 utilities
- it remains readable in both themes
- it integrates cleanly with the existing layouts and page shells
- it does not break the deck styling boundary or handbook structure

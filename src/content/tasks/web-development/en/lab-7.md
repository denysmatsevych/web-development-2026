---
title: "Courtly — mockup and design system"
summary: "Target design of the Courtly landing page at 1440, 768, and 375 px, design tokens, typography scale, grid, components, and asset pack for Lab 7."
goal: "Build the Courtly page matching this mockup across three viewport widths, using the provided design tokens and images. Markup, accessibility, SEO, and audit requirements are specified in the lab assignment."
label: "Mockup"
eyebrow: "Mockup and design system"
highlights:
  - "1440 / 768 / 375 px"
  - "Design tokens"
  - "8 illustrations + OG"
  - "Montserrat, cyrillic"
acceptance:
  - "Desktop 1440 px matches the mockup: inline navigation, 2-column hero, 3-column cards"
  - "Featured card Arena Sport spans 2 columns × 2 rows, 3 × 3 grid with no empty cells"
  - "Tablet 768 px: «Меню» (Menu) button, 2 × 2 form, 2-column cards, vertical steps"
  - "Mobile 375 px: single column, full-width form controls and buttons"
  - "Mobile menu opens and closes, aria-expanded updates"
  - "Featured card on desktop — image on the left, content on the right; vertical on tablet and mobile"
  - "Colors, font family, typography scale, and radii — from tokens.css without altering values"
  - "Headings scale using clamp() from tokens"
  - "Focus is visible on light (--color-primary) and dark (--color-accent) sections"
  - "Montserrat loaded with the cyrillic subset"
  - "Hero: srcset with hero-800 and hero-1200, width/height, fetchpriority, no lazy loading"
  - "Other images: width/height, loading=\"lazy\", meaningful alt text you write yourself"
  - "og:image — absolute URL to og-image.jpg"
  - "No horizontal scrolling at 320, 375, 768, and 1440 px"
mockup: courtly
updated: 2026-09-29
---

## 1. How to use the mockup

Above is the Courtly page at three viewport widths, tested during submission.
Each capture scrolls inside its own viewport frame; the link below each frame
opens the file at full size. On the **Mobile** tab, an adjacent capture shows
the above-the-fold screen with the mobile menu open.

The page structure, section order, column counts at each width, and card
arrangement must match the mockup; minor deviations in spacing and exact
dimensions are acceptable.

Captures are rendered **at a 1 : 1 scale**: 1 image px = 1 CSS px. Anything not
detailed in the specification (§4) can be measured directly on the image in any
image viewer.

Copy for headings, buttons, and form fields is taken from the lab assignment.
It is in Ukrainian, and so is your page: copy it as it is, without translating
it. Venue details and ratings in the mockup are illustrative: you may write
your own.

**Download:** [courtly-assets.zip](/en/web/starters/courtly-assets.zip) — `tokens.css`,
`SPEC.md` (§2–5 of this page), mockup captures, favicon, logo mark,
8 illustrations, and OG image. All images were designed specifically for this
assignment and may be published freely.

## 2. Design tokens

Copy `tokens.css` to the beginning of your CSS file. You may rename the
variables, but **do not change values**. You may add custom tokens (for example, for
hover states or extra spacing).

### Colors

| Token | Value | Role | Contrast |
| --- | --- | --- | --- |
| `--color-primary` | `#0b6e4f` | buttons, links, focus | 6.25 : 1 with white text |
| `--color-primary-hover` | `#085a40` | primary button hover | 8.25 : 1 |
| `--color-primary-soft` | `#e3f1ea` | "sport type" chip background | 5.37 : 1 with `--color-primary` |
| `--color-accent` | `#c6f432` | CTA button, step numbers, badge | 11.95 : 1 with `--color-dark` |
| `--color-background` | `#f6f8f5` | page background | — |
| `--color-surface` | `#ffffff` | header, cards, form | — |
| `--color-surface-alt` | `#eaf1ec` | "How it works" section background | — |
| `--color-border` | `#d5dfd8` | borders, dividers | decorative |
| `--color-text` | `#13201a` | body text | 15.74 : 1 on background |
| `--color-text-muted` | `#4a5a52` | descriptions, captions | 6.36 : 1 on `--color-surface-alt` |
| `--color-dark` | `#0f2a1f` | CTA and footer background | — |
| `--color-on-dark` | `#f1f7f3` | headings on dark background | 14.10 : 1 |
| `--color-on-dark-muted` | `#b4c7bb` | text and links on dark background | 8.63 : 1 |
| `--color-rating` | `#a15c00` | rating star | 5.19 : 1 on white |

All "text / background" pairs in the mockup pass WCAG AA (4.5 : 1 for body text,
3 : 1 for focus outlines and graphical elements). Color is not the sole vehicle
of information: ratings next to the star are always displayed as numerical text.

### Typography

Font — **Montserrat** (variable, 400–800) with the **cyrillic** subset; without
it, the browser substitutes a system font for every Ukrainian letter.

| Token | Mobile 375 px | Desktop 1440 px | Where |
| --- | ---: | ---: | --- |
| `--font-size-h1` | 32 px | 56 px | hero heading |
| `--font-size-h2` | 26 px | 40 px | section headings, featured card title |
| `--font-size-h3` | 19 px | 22 px | card titles, steps |
| `--font-size-lead` | 17 px | 20 px | hero subtitle, section leads |
| `--font-size-base` | 16 px | 16 px | body text |
| `--font-size-small` | 14 px | 14 px | price «/год» (per hour), field labels, footer |
| `--font-size-xs` | 13 px | 13 px | chips, badges |

Between 375 and 1440 px, font sizes scale linearly — this is handled by `clamp()`
in the tokens. Headings are `800`, buttons and field labels are `600`, body text
is `400`; line-height is `1.15` for headings and `1.6` for body text.

### Spacing, controls, and shadows

- **Spacing** — 4 px steps: `--space-2xs` 4 px … `--space-3xl` 64 px;
  vertical section spacing `--space-section` — fluid, 56 → 96 px.
- **Container** — `--container-max` 1200 px, side padding
  `--container-gutter` 16 → 32 px.
- **Control heights** — `--control-height` 48 px for buttons and inputs; large
  button in hero / CTA — 56 px.
- **Radii** — 8 px for inputs and chips, 12 px for buttons, 20 px for cards,
  images, form, and CTA; `--radius-pill` — chips and badges.
- **Shadows** — `--shadow-sm` for cards, `--shadow-md` for search form,
  hero image, and mobile menu panel.

## 3. Grid and breakpoints

Mobile-first, two breakpoints: **640 px** (`40rem`) and **1024 px** (`64rem`).

| | < 640 px | 640–1023 px | ≥ 1024 px |
| --- | --- | --- | --- |
| Header | «Меню» (Menu) button | «Меню» button | inline navigation |
| Hero | vertical, 16 : 9 image | vertical, 16 : 9 image | 2 columns, 4 : 3 image |
| Search form | 1 column | 2 × 2 | 4 across in a row |
| Cards | 1 column | 2 columns | 3 columns, featured 2 × 2 |
| How it works | vertical | vertical | 3 in a row |
| About the service | vertical | 2 columns (from 768 px) | 2 columns |
| Footer | 1 column | 2 columns | 4 columns |

Gap between cards — `--space-lg` (24 px).

## 4. Component specifications

Precise token values applied to each element in the mockup. Values in
parentheses are in pixels to make visual verification against captures easy.
Sizes without tokens are given as numbers.

Container — `max-width` `--container-max` (1200) plus side padding
`--container-gutter` on each side.

### Global

| Element | Value |
| --- | --- |
| `body` | background `--color-background`, text `--color-text`, `--font-size-base`, `--line-height-base` |
| `h1`–`h3` | `--font-weight-bold`, `--line-height-tight`, letter-spacing −0.02em (in `h3` −0.01em) |
| Section | padding top and bottom `--space-section`; background of "How it works" — `--color-surface-alt` |
| Section heading | to lead `--space-sm` (12), from lead to content `--space-2xl` (48); lead `--font-size-lead`, `--color-text-muted` |
| Focus | outline 3 px `--color-focus`, offset 3 px, radius 4 px |

### Header

| Element | Value |
| --- | --- |
| Header | height `--header-height` (72), background `--color-surface`, bottom border 1 px `--color-border` |
| Logo | mark 40 × 40, adjacent text "Courtly" 22 px (1.375rem) `--font-weight-bold`; gap `--space-xs` (8) |
| Navigation, ≥ 1024 px | links `--font-size-base`, `--font-weight-semibold`, `--color-text`, hover `--color-primary`; gap between links `--space-xl` (32), from nav to button `--space-2xl` (48) |
| «Меню» button, < 1024 px | height 44 px, padding 0 `--space-md` (16), border 1 px `--color-border`, `--radius-md`; icon — three 18 × 2 px bars with 6 px step, transforms into an X when open |
| Menu panel | full width below header: background `--color-surface`, `--shadow-md`, padding `--space-lg` (24) top and `--space-xl` (32) bottom |
| Menu item | 17 px (1.0625rem) `--font-weight-semibold`, vertical padding `--space-sm` (12), bottom divider 1 px `--color-border`; «Забронювати» (Book) — full width, `--space-lg` (24) below list |

### Hero

| Element | Value |
| --- | --- |
| Section | background `--color-background` with subtle lime glow in top right (`--color-accent`, 18% opacity); padding-top `--space-2xl` (48), from 1024 px `--space-3xl` (64) |
| Grid | from 1024 px two equal columns with gap `--space-3xl` (64); below — single column with gap `--space-2xl` (48) |
| Text block | child elements spaced by `--space-lg` (24); lead `--font-size-lead`, `--color-text-muted`, max-width 34rem |
| Button | primary, large |
| Image | `--radius-lg`, `--shadow-md`; 4 : 3 from 1024 px, 16 : 9 below |

### Search form

| Element | Value |
| --- | --- |
| Form | `--space-2xl` (48) below hero; background `--color-surface`, border 1 px `--color-border`, `--radius-lg`, `--shadow-md`; padding `--space-lg` (24), from 1024 px `--space-lg` / `--space-xl` (24 / 32); gap between controls `--space-md` (16) |
| Field label | `--font-size-small`, `--font-weight-semibold`; gap to input `--space-2xs` (4) |
| Input | height `--control-height` (48), padding 0 `--space-sm` (12), background `--color-background`, border 1 px `--color-border` (hover `--color-text-muted`), `--radius-sm` |
| «Знайти» (Search) button | primary; below 1024 px full column width, from 1024 px — minimum 160 px |

### Buttons

All buttons: height `--control-height` (48), padding 0 `--space-lg` (24),
border 2 px, `--radius-md`, `--font-size-base`, `--font-weight-semibold`.
Large (hero, CTA): height 56 px, padding 0 `--space-xl` (32), 17 px
(1.0625rem).

| Variant | Background / border | Text | Hover | Where |
| --- | --- | --- | --- | --- |
| Primary | `--color-primary` | `--color-surface` | background `--color-primary-hover` | header, hero, form, featured card |
| Outline | transparent, border `--color-primary` | `--color-primary` | fill `--color-primary`, text `--color-surface` | regular cards |
| Accent | `--color-accent` | `--color-dark` | background `--color-accent-hover` | Final CTA |

### Venue cards

```text
Regular card                   Featured card on desktop
┌──────────────────────┐       ┌────────────┬──────────────────┐
│ image 4 : 3          │       │            │ chip   ★ rating  │
├──────────────────────┤       │ full-      │ title (h2-size)  │
│ chip         ★ 4.7   │       │ height     │ lead description │
│ Title (h3)           │       │ image      │ ✓ perks          │
│ Description          │       │            │ available slots  │
│ ──────────────────── │       │            │ ──────────────── │
│ 350 грн/год  [Button]│       │            │ price   [Button] │
└──────────────────────┘       └────────────┴──────────────────┘
```

| Element | Value |
| --- | --- |
| Card grid | gap `--space-lg` (24); equal-height cards in each row |
| Card | background `--color-surface`, border 1 px `--color-border`, `--radius-lg`, `--shadow-sm`; image clipped to border radius |
| Image | 4 : 3, `object-fit: cover` |
| Text content | padding `--space-lg` (24), elements spaced by `--space-sm` (12) |
| "Sport type" chip | padding `--space-2xs` / `--space-sm` (4 / 12), `--radius-pill`, background `--color-primary-soft`, text `--color-primary`, `--font-size-xs`, `--font-weight-semibold`; placed on the left, rating on the right |
| Rating | `--font-size-small`, `--font-weight-semibold`; star icon `--color-rating`; «(98 відгуків)» ("98 reviews") — regular, `--color-text-muted` |
| Description | `--color-text-muted` |
| "Price + button" row | aligned to bottom of card; top border 1 px `--color-border` and padding-top `--space-md` (16); gap `--space-md` between price and button, wraps if insufficient space |
| Price | amount in hryvnias, such as «350 грн», 20 px (1.25rem) `--font-weight-bold` `--color-text`; «/год» (per hour) — `--font-size-small`, `--color-text-muted` |
| Button | outline; on featured card — primary |
| «Вибір тижня» (Pick of the week) badge | featured card only, across all screen widths: top-left corner of image with `--space-md` (16) offset; padding 4 / 12, `--radius-pill`, background `--color-accent`, text `--color-dark`, `--font-size-xs`, `--font-weight-bold`, uppercase, letter-spacing 0.06em |

**Featured card on desktop** (≥ 1024 px):

| Element | Value |
| --- | --- |
| Layout | two columns 1.15fr / 1fr: full-height image, content on the right |
| Text content | padding `--space-2xl` / `--space-xl` (48 / 32), gap `--space-lg` (24), vertically centered content |
| Title and description | title `--font-size-h2`, description `--font-size-lead` |
| Perks | `--font-size-small`, gap `--space-2xs` (4); preceded by bold ✓ `--color-primary`, margin-right `--space-xs` (8) |
| Available slots | label `--font-size-small` semibold, gap to slot list `--space-xs` (8); slot chip — padding 4 / 12, border 1 px `--color-border`, `--radius-sm`, `--font-size-small` semibold; gap between slots `--space-xs` |

On tablet and mobile, the featured card renders like a regular card: perks and
slots are omitted, while the badge is preserved.

### How it works

| Element | Value |
| --- | --- |
| Grid | from 1024 px — 3 columns, below — single column; gap `--space-lg` (24) |
| Step card | background `--color-surface`, border 1 px `--color-border`, `--radius-lg`, padding `--space-xl` (32), internal gap `--space-sm` (12) |
| Number | 56 × 56 square, `--radius-md`, background `--color-dark`, digits `--color-accent` 20 px (1.25rem) bold; plus another `--space-xs` (8) before the step heading |
| Text | `--color-text-muted` |

### About the service

| Element | Value |
| --- | --- |
| Grid | from 768 px two columns 1.1fr / 1fr, gap `--space-3xl` (64), vertically centered; below — single column, gap `--space-2xl` (48) |
| Text block | gap `--space-lg` (24); lead text `--font-size-lead`, `--color-text-muted` |
| Perks | gap between perks `--space-md` (16); icon on left, heading and description on right with `--space-md` gap, space between heading and description `--space-2xs` (4) |
| Icon | 40 px circle, background `--color-primary-soft`, bold ✓ `--color-primary` |
| Perk heading and text | heading 17 px (1.0625rem); text `--font-size-small`, `--color-text-muted` |
| Image | 4 : 5, `object-fit: cover`, `--radius-lg` |

### Final CTA

| Element | Value |
| --- | --- |
| Block | within container; background `--color-dark` with lime glow in top right (`--color-accent`, 16%); `--radius-lg`; padding `--space-3xl` / `--space-lg` (64 / 24); centered layout with gap `--space-lg` (24); bottom margin `--space-section` to footer |
| Heading | `h2`, `--color-on-dark` |
| Text | `--font-size-lead`, `--color-on-dark-muted`, max-width 32rem |
| Button | accent, large; `--color-focus` overridden to `--color-accent` |

### Footer

| Element | Value |
| --- | --- |
| Footer | background `--color-dark`, text `--color-on-dark-muted`, `--font-size-small`; padding-top `--space-3xl` (64); `--color-focus` overridden to `--color-accent` |
| Grid | 1 column → 2 from 640 px → 4 from 1024 px (2fr 1fr 1fr 1fr); gap `--space-xl` (32); padding-bottom `--space-2xl` (48) |
| Brand | logo matching header, text `--color-on-dark`; description max-width 22rem, `--space-md` (16) below logo |
| Column heading | `--font-size-base`, `--font-weight-bold`, `--color-on-dark`; gap to list `--space-sm` (12) |
| Links | `--color-on-dark-muted`, no underline; hover — `--color-accent` with underline; gap between items `--space-xs` (8) |
| Social links | inline with wrapping: padding 4 / 12, border 1 px `--color-on-dark-muted` at 35% opacity, `--radius-pill`; gap between items `--space-xs` |
| Copyright | separate row: top border 1 px (`--color-on-dark-muted`, 20%), vertical padding `--space-lg` (24) |

## 5. Images

| File | Dimensions | Where | Loading |
| --- | --- | --- | --- |
| `hero-1200.webp`, `hero-800.webp` | 1200 × 900, 800 × 600 | hero | `srcset`, `fetchpriority="high"`, no lazy |
| `arena-sport.webp` | 900 × 1200 | featured card | `lazy` |
| `tennis-point.webp`, `riverside-court.webp`, `smash-club.webp`, `city-football.webp`, `active-hall.webp` | 800 × 600 | cards | `lazy` |
| `about.webp` | 960 × 1200 | about section | `lazy` |
| `logo-mark.svg` | 40 × 40 | header, footer | `alt=""` — next to text "Courtly" |
| `favicon.svg` | — | `<link rel="icon">` | — |
| `og-image.jpg` | 1200 × 630 | `og:image` | absolute URL |

The featured card uses a portrait image because on desktop it is taller than it
is wide. On tablet and mobile, the same file is cropped to 4 : 3 using
`object-fit: cover`.

Provide explicit `width` and `height` attributes on every `<img>` tag — this
allows the browser to allocate the layout box prior to downloading, avoiding
cumulative layout shifts (CLS). Author meaningful `alt` text yourself.

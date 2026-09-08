/**
 * Site metadata and the list of top-level sections.
 *
 * The three sections (Lectures, Labs, Tutorial) are all part of this one Astro
 * build now. `sections` is the single source for the hub cards
 * (`src/pages/index.astro`), the header nav (`SiteHeader.astro`) and the footer
 * link group (`SiteFooter.astro`) — `href`s are plain paths, run through
 * `withBase()` at the point of use.
 */

export interface SiteConfig {
  /** Wordmark in the header; base for page `<title>`s. */
  name: string;
  /** Default meta + og description (a page may override it). */
  description: string;
  /** Homepage hero eyebrow. */
  eyebrow: string;
  /** Ukrainian course name — muted top line on every lecture-deck title slide. */
  courseUk: string;
  /** Footer contact — label shown, URL linked. */
  contactLabel: string;
  contactUrl: string;
}

export interface Section {
  /** Stable id. */
  id: 'lectures' | 'labs' | 'tutorial';
  /** Nav label / card heading. */
  label: string;
  /** Internal path (no base prefix) — wrap in `withBase()` when rendering. */
  href: string;
  /** One-line description for the hub card. */
  blurb: string;
}

export const site: SiteConfig = {
  name: 'Web Development 2026',
  description:
    'Course site for Web Development 2026 — lecture slide decks, lab assignments, and a hierarchical javascript.info-style handbook for modern HTML, CSS and JavaScript/TypeScript.',
  eyebrow: 'Modern Web Development · HTML, CSS, JS/TS',
  courseUk: 'Сучасна веброзробка · HTML, CSS, JS/TS',

  contactLabel: 'oa.edu.ua',
  contactUrl: 'https://www.oa.edu.ua/',
};

export const sections: Section[] = [
  {
    id: 'lectures',
    label: 'Lectures',
    href: '/lectures/',
    blurb: 'Keyboard-driven slide decks for each lecture — present in class or read as notes.',
  },
  {
    id: 'labs',
    label: 'Labs',
    href: '/labs/',
    blurb: 'Hands-on assignments that build on each lecture. In progress.',
  },
  {
    id: 'tutorial',
    label: 'Tutorial',
    href: '/tutorial/',
    blurb: 'The course handbook — HTML, CSS and JavaScript as a browsable reference.',
  },
];

/**
 * Site metadata and the list of top-level sections.
 *
 * Course-independent site metadata and the section definitions used to build
 * course-specific navigation.
 */

export interface SiteConfig {
  /** Wordmark in the header; base for page `<title>`s. */
  name: string;
  /** Default meta + og description (a page may override it). */
  description: string;
  /** Homepage hero copy. */
  hubEyebrow: string;
  hubTitle: string;
  /** Footer contact — label shown, URL linked. */
  contactLabel: string;
  contactUrl: string;
}

export interface Section {
  /** Stable section id. */
  id: 'lectures' | 'labs';
  /** Nav label / card heading. */
  label: string;
  /** Course-relative path — `getSections(courseSlug)` adds the course prefix. */
  href: string;
  /** One-line description for the section card. */
  blurb: string;
}

export const site: SiteConfig = {
  name: 'Modern Web Development',
  description:
    'A collection of courses with lecture slide decks and hands-on lab assignments.',
  hubEyebrow: 'Навчальна платформа',
  hubTitle: 'Modern Web Development',

  contactLabel: 'denys.matsevych@oa.edu.ua',
  contactUrl: 'mailto:denys.matsevych@oa.edu.ua',
};

const sections: Section[] = [
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
    blurb: 'Hands-on assignments that build on each lecture, with downloadable handouts.',
  },
];

export function getSections(courseSlug: string): Section[] {
  return sections.map((section) => ({
    ...section,
    href: `/${courseSlug}${section.href}`,
  }));
}

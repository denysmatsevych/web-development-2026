/**
 * The contact destination and the section definitions used to build
 * course-specific navigation.
 */
import { useTranslations, type Locale } from '@/i18n';

export interface SiteConfig {
  /** Footer contact — label shown, URL linked. */
  contactLabel: string;
  contactUrl: string;
}

export interface Section {
  /** Stable section id. */
  id: 'lectures' | 'labs';
  /** Nav label / card heading. */
  label: string;
  /** Course-relative path — `getSections(courseSlug, locale)` adds the course prefix. */
  href: string;
  /** One-line description for the section card. */
  blurb: string;
}

export const site: SiteConfig = {
  contactLabel: 'denys.matsevych@oa.edu.ua',
  contactUrl: 'mailto:denys.matsevych@oa.edu.ua',
};

const sections: Pick<Section, 'id' | 'href'>[] = [
  {
    id: 'lectures',
    href: '/lectures/',
  },
  {
    id: 'labs',
    href: '/labs/',
  },
];

export function getSections(courseSlug: string, locale: Locale): Section[] {
  const t = useTranslations(locale);
  return sections.map((section) => ({
    ...section,
    href: `/${courseSlug}${section.href}`,
    label: section.id === 'lectures' ? t.navigation.lectures : t.navigation.labs,
    blurb: section.id === 'lectures' ? t.course.sectionLectures : t.course.sectionLabs,
  }));
}

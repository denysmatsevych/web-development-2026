/**
 * Course registry — the single source for every course on the site.
 * The hub cards, the course switcher, the footer links and `getStaticPaths`
 * all read from here through `getCourses()`.
 */
import type { Locale } from '@/i18n';

export type CourseStatus = 'published' | 'draft';

export interface CourseTitlePart {
  text: string;
  lang?: Locale;
}

/** Constant for redirects */
export const LEGACY_COURSE = 'web-development';

export interface Course {
  /** Actual year when course was created (can be updated with the course information) */
  year: number;
  /** URL prefix and content folder name: `/web-development/…`, `labs/web-development/…`. */
  slug: string;
  /** Short English name — switcher, breadcrumbs, `<title>` suffix. */
  title: string;
  /** Ukrainian course title, with language-marked fragments for mixed-script names. */
  titlePartsUk: CourseTitlePart[];
  /** Compact localized name for course links in the header and footer. */
  navTitle: string;
  navTitleUk: string;
  navTitleLang?: Locale;
  navTitleUkLang?: Locale;
  /** Optional compact Ukrainian name for lecture-deck title slides. */
  deckTitleUk?: string;
  /** Meta + og description, and the text on the hub card. */
  description: string;
  /** Ukrainian equivalent of `description`. */
  descriptionUk: string;
  /** `draft` courses are visible in dev only. */
  status: CourseStatus;
}

const courses: Course[] = [
  {
    year: 2026,
    slug: 'web-development',
    title: 'HTML, CSS, JS/TS',
    titlePartsUk: [
      { text: 'HTML, CSS, JS/TS', lang: 'en' },
    ],
    navTitle: 'Core Web Stack',
    navTitleUk: 'Базовий вебстек',
    description:
      'Lecture slide decks and lab assignments covering frontend development fundamentals: HTML, CSS, and JavaScript/TypeScript.',
    descriptionUk:
      'Лекції та лабораторні роботи з основ фронтенд-розробки: HTML, CSS і JavaScript/TypeScript.',
    status: 'published',
  },
  {
    year: 2026,
    slug: 'react',
    title: 'React',
    titlePartsUk: [
      { text: 'Розробка вебзастосунків на ' },
      { text: 'React', lang: 'en' },
    ],
    navTitle: 'React',
    navTitleUk: 'React',
    navTitleUkLang: 'en',
    description: 'Lectures and labs on building web applications with React.',
    descriptionUk: 'Лекції та лабораторні роботи зі створення вебзастосунків на React.',
    status: 'published',
  },
  {
    year: 2026,
    slug: 'web-accessibility',
    title: 'Web Accessibility',
    titlePartsUk: [{ text: 'Розробка доступних вебінтерфейсів' }],
    navTitle: 'A11y',
    navTitleUk: 'Вебдоступність',
    deckTitleUk: 'Вебдоступність',
    description: 'Lectures and labs on building accessible web interfaces.',
    descriptionUk: 'Лекції та лабораторні роботи зі створення доступних вебінтерфейсів.',
    status: 'draft',
  },
];

/** Whether `slug` names a registered course — drafts included, in any environment. */
export function isCourse(slug: string): boolean {
  return courses.some((c) => c.slug === slug);
}

/** Courses to show: everything in dev, only published ones in production. */
export function getCourses(): Course[] {
  return import.meta.env.DEV ? courses : courses.filter((c) => c.status === 'published');
}

export function getCourseTitle(course: Course, locale: Locale): string {
  return locale === 'uk' ? course.titlePartsUk.map((part) => part.text).join('') : course.title;
}

export function getCourseTitleParts(course: Course, locale: Locale): CourseTitlePart[] {
  return locale === 'en' ? [{ text: course.title }] : course.titlePartsUk;
}

export function getCourseNavTitle(course: Course, locale: Locale): string {
  return locale === 'uk' ? course.navTitleUk : course.navTitle;
}

export function getCourseNavTitleLang(course: Course, locale: Locale): Locale | undefined {
  const lang = locale === 'uk' ? course.navTitleUkLang : course.navTitleLang;
  return lang === locale ? undefined : lang;
}

export function getCourseDescription(course: Course, locale: Locale): string {
  return locale === 'uk' ? course.descriptionUk : course.description;
}

export function getCourseDeckLabelParts(course: Course, locale: Locale): CourseTitlePart[] {
  if (locale === 'en') return [{ text: course.title }];
  return course.deckTitleUk ? [{ text: course.deckTitleUk }] : course.titlePartsUk;
}

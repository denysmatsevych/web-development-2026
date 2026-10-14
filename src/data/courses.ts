/**
 * Course registry — the single source for every course on the site.
 * The hub cards, the course switcher, the footer links and `getStaticPaths`
 * all read from here through `getCourses()`.
 */

export type CourseStatus = 'published' | 'draft';

export interface Course {
  /** Actual year when course was created (can be updated with the course information) */
  year: number;
  /** URL prefix and content folder name: `/web-development/…`, `labs/web-development/…`. */
  slug: string;
  /** Short English name — switcher, breadcrumbs, `<title>` suffix. */
  title: string;
  /** Ukrainian course name — muted top line on every lecture-deck title slide. */
  courseUk: string;
  /** Hero eyebrow on the course page. */
  eyebrow: string;
  /** Meta + og description, and the text on the hub card. */
  description: string;
  /** `draft` courses are visible in dev only. */
  status: CourseStatus;
}

const courses: Course[] = [
  {
    year: 2026,
    slug: 'web-development',
    title: 'Web Development',
    courseUk: 'Сучасна веброзробка: HTML, CSS, JS/TS',
    eyebrow: 'Modern Web Development · HTML, CSS, JS/TS',
    description:
      'Lecture slide decks and lab assignments for modern HTML, CSS and JavaScript/TypeScript.',
    status: 'published',
  },
  {
    year: 2026,
    slug: 'react',
    title: 'React',
    courseUk: 'Розробка вебзастосунків на React',
    eyebrow: 'Web applications with React',
    description: 'Lectures and labs on building web applications with React.',
    status: 'draft',
  },
  {
    year: 2026,
    slug: 'web-accessibility',
    title: 'Web Accessibility',
    courseUk: 'Web Accessibility',
    eyebrow: 'Accessible web interfaces',
    description: 'Lectures and labs on building accessible web interfaces.',
    status: 'draft',
  },
];

/** Courses to show: everything in dev, only published ones in production. */
export function getCourses(): Course[] {
  return import.meta.env.DEV ? courses : courses.filter((c) => c.status === 'published');
}

export function getCourse(slug: string): Course | undefined {
  return getCourses().find((c) => c.slug === slug);
}
/**
 * Lecture registry — the ordered slide decks of every course.
 * `src/pages/[course]/lectures/` reads it through `getLectures(course)`
 * for the index page and for `getStaticPaths` on `[lecture].astro`
 * (route `/<course>/lectures/<slug>`). Add a lecture by creating
 * `./<course>/lecture-N.ts` (exporting `slides` + `deckTitle`) and appending
 * an entry to that course's list below.
 */
import type { Slide } from './schema';
import { slides as wd1Slides, deckTitle as wd1Title } from './web-development/lecture-1';
import { slides as wd2Slides, deckTitle as wd2Title } from './web-development/lecture-2';
import { slides as react0Slides, deckTitle as react0Title } from './react/lecture-0';
import {
  slides as accessibilitySlides,
  deckTitle as accessibilityTitle,
} from './web-accessibility/lecture-1';

export interface LectureMeta {
  /** URL segment: `/<course>/lectures/<slug>`. */
  slug: string;
  /** Lecture number on the deck and its index card — `0` for an introductory lecture. */
  number: number;
  /** Deck title + index-card heading. */
  title: string;
  /** One-line summary for the lectures index card. */
  summary: string;
  slides: Slide[];
}

/** Lectures per course, keyed by the course slug from `src/data/courses.ts`. */
const lecturesByCourse: Record<string, LectureMeta[]> = {
  'web-development': [
    {
      slug: 'lecture-1',
      number: 1,
      title: wd1Title,
      summary: 'Вступ до вебтехнологій, HTTP, DOM та семантичний HTML5.',
      slides: wd1Slides,
    },
    {
      slug: 'lecture-2',
      number: 2,
      title: wd2Title,
      summary:
        'Семантичний HTML5 і Landmarks, метадані та Schema.org, On-Page SEO і вебдоступність за WCAG 2.2.',
      slides: wd2Slides,
    },
  ],
  react: [
    {
      slug: 'lecture-0',
      number: 0,
      title: react0Title,
      summary: 'План курсу на одній схемі, оцінювання, правила й теми презентацій.',
      slides: react0Slides,
    },
  ],
  'web-accessibility': [
    {
      slug: 'lecture-1',
      number: 1,
      title: accessibilityTitle,
      summary: 'A preview of the Web Accessibility course.',
      slides: accessibilitySlides,
    },
  ],
};

/** All lectures of a course — an empty list for a course without any. */
export function getLectures(course: string): LectureMeta[] {
  return lecturesByCourse[course] ?? [];
}

/** Lookup by course and slug — `undefined` for an unknown one. */
export function getLecture(course: string, slug: string): LectureMeta | undefined {
  return getLectures(course).find((lecture) => lecture.slug === slug);
}
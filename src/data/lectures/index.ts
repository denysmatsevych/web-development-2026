/**
 * Lecture registry — the ordered list of slide decks. `src/pages/lectures/`
 * reads this for the index page and for `getStaticPaths` on `[lecture].astro`
 * (route `/lectures/<slug>`). Add a lecture by creating `./lecture-N.ts`
 * (exporting `slides` + `deckTitle`) and appending an entry here.
 */
import type { Slide } from './schema';
import { slides as lecture1Slides, deckTitle as lecture1Title } from './lecture-1';
import { slides as lecture2Slides, deckTitle as lecture2Title } from './lecture-2';

export interface LectureMeta {
  /** URL segment: `/lectures/<slug>`. */
  slug: string;
  /** Deck title + index-card heading. */
  title: string;
  /** One-line summary for the lectures index card. */
  summary: string;
  slides: Slide[];
}

export const lectures: LectureMeta[] = [
  {
    slug: 'lecture-1',
    title: lecture1Title,
    summary: 'Вступ до вебтехнологій, HTTP, DOM та семантичний HTML5.',
    slides: lecture1Slides,
  },
  {
    slug: 'lecture-2',
    title: lecture2Title,
    summary:
      'Семантичний HTML5 і Landmarks, метадані та Schema.org, On-Page SEO і вебдоступність за WCAG 2.2.',
    slides: lecture2Slides,
  },
];

/** Lookup by slug — `undefined` for an unknown one. */
export function getLecture(slug: string): LectureMeta | undefined {
  return lectures.find((lecture) => lecture.slug === slug);
}

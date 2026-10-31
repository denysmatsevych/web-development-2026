/**
 * Lecture registry — every slide deck, found by its folder.
 *
 * A deck is a file `./<course>/<locale>/lecture-N.ts` exporting `deckTitle`,
 * `summary` and `slides`. The course, language, number and URL slug all come
 * from the path, so adding a lecture (or its translation) is just adding a
 * file: there is no list to update.
 */
import type { Slide } from './schema';
import { isCourse } from '@/data/courses';
import { defaultLocale, isLocale, type Locale } from '@/i18n';

interface LectureModule {
  deckTitle: string;
  summary: string;
  slides: Slide[];
}

export interface LectureMeta {
  course: string;
  /** URL segment: `/<course>/lectures/<slug>`. */
  slug: string;
  /** Lecture number on the deck and its index card — `0` for an introductory lecture. */
  number: number;
  /** Deck title + index-card heading. */
  title: string;
  /** One-line summary for the lectures index card. */
  summary: string;
  /** Language of the deck, taken from its folder. */
  lang: Locale;
  slides: Slide[];
}

const modules = import.meta.glob<LectureModule>('./*/*/lecture-*.ts', { eager: true });

const lectures: LectureMeta[] = Object.entries(modules).map(([path, mod]) => {
  const [, course, locale, file] = path.split('/');
  const slug = file.replace(/\.ts$/, '');
  const number = Number(slug.replace('lecture-', ''));
  if (!isCourse(course) || !isLocale(locale) || Number.isNaN(number)) {
    throw new Error(
      `${path}: expected src/data/lectures/<registered course>/<uk|en>/lecture-<number>.ts`,
    );
  }
  return {
    course,
    slug,
    number,
    title: mod.deckTitle,
    summary: mod.summary,
    lang: locale,
    slides: mod.slides,
  };
});

/** The decks of one course that exist in this language, in lecture order. */
export function getLectures(course: string, locale: Locale): LectureMeta[] {
  return lectures
    .filter((lecture) => lecture.course === course && lecture.lang === locale)
    .sort((a, b) => a.number - b.number);
}

/** Lookup by course, language and slug — `undefined` when that version does not exist. */
export function getLecture(
  course: string,
  locale: Locale,
  slug: string,
): LectureMeta | undefined {
  return getLectures(course, locale).find((lecture) => lecture.slug === slug);
}

export interface LectureListItem {
  lecture: LectureMeta;
  /** The deck is shown in its own language because this language has no version yet. */
  fallback: boolean;
}

/**
 * What the lecture list of a language shows: its own decks, plus (for a
 * non-default language) the default-language decks that have no version here.
 * Content that exists only in a non-default language is not shown in the
 * default-language list.
 */
export function getLectureList(course: string, locale: Locale): LectureListItem[] {
  const own = getLectures(course, locale).map((lecture) => ({ lecture, fallback: false }));
  if (locale === defaultLocale) return own;
  const have = new Set(own.map(({ lecture }) => lecture.slug));
  const fallback = getLectures(course, defaultLocale)
    .filter((lecture) => !have.has(lecture.slug))
    .map((lecture) => ({ lecture, fallback: true }));
  return [...own, ...fallback].sort((a, b) => a.lecture.number - b.lecture.number);
}
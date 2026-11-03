/**
 * Lab helpers — the `number`-ordered list of a course's published labs, plus the
 * prev/next pair for a lab page's footer nav.
 *
 * Labs use a flat ordering model per course: `number` in frontmatter is
 * sufficient for sorting and for building the previous/next navigation.
 * A collection id keeps its course and language folders
 * (`<course>/<locale>/<slug>`); `splitId` turns it into course + locale + slug.
 * The language of a lab comes from its folder.
 */
import { getCollection, type CollectionEntry } from 'astro:content';

import { isCourse } from '@/data/courses';
import {
  defaultLocale,
  isLocale,
  localeAlternatesFor,
  locales,
  localeHref,
  useTranslations,
  type Locale,
} from '@/i18n';

export type LabEntry = CollectionEntry<'labs'>;

/** `<course>/<locale>/<slug>` → `{ course, locale, slug }`. */
export function splitId(id: string): { course: string; locale: Locale; slug: string } {
  const [course, locale, ...rest] = id.split('/');
  return { course, locale: locale as Locale, slug: rest.join('/') };
}

/**
 * Throws on an entry outside `<registered course>/<uk|en>/`. The per-course
 * and per-language filters would otherwise drop it without a word: the build
 * stays green and the page silently disappears from the site.
 */
function assertInCourse(
  collection: 'labs' | 'tasks',
  entries: { id: string; filePath?: string }[],
): void {
  for (const { id, filePath } of entries) {
    const [course, locale, ...rest] = id.split('/');
    if (rest.length === 0 || !isCourse(course) || !isLocale(locale)) {
      throw new Error(
        `${filePath ?? `${collection}/${id}`} is not in a registered course and language folder — ` +
          `move it to src/content/${collection}/<course>/<uk|en>/.`,
      );
    }
  }
}

export interface LabMeta {
  /** Course slug — the first segment of the collection id. */
  course: string;
  /** Lab slug without the course — also the URL segment. */
  slug: string;
  number: number;
  title: string;
  summary: string;
  /** Language of the lab, from its folder. */
  lang: Locale;
  /** `withBase('/<course>/labs/<slug>/')` — drop straight into an `href`. */
  href: string;
}

/** A base-aware, locale-aware lab route. */
export function labHref(locale: Locale, course: string, slug: string): string {
  return localeHref(locale, `/${course}/labs/${slug}/`);
}

export function toLabMeta(entry: LabEntry, locale: Locale): LabMeta {
  const { course, slug } = splitId(entry.id);
  return {
    course,
    slug,
    number: entry.data.number,
    title: entry.data.title,
    summary: entry.data.summary,
    lang: splitId(entry.id).locale,
    href: labHref(locale, course, slug),
  };
}

/**
 * Published labs of one course that exist in one language, in `number` order.
 * Drafts are dropped from the build entirely (index, routes and prev/next), so
 * an unfinished lab can sit in the repo.
 */
export async function getLabs(course: string, locale: Locale): Promise<LabEntry[]> {
  const entries = await getCollection('labs');
  assertInCourse('labs', entries);
  return entries
    .filter(({ id, data }) => id.startsWith(`${course}/${locale}/`) && !data.draft)
    .sort((a, b) => a.data.number - b.data.number);
}

export interface LabListItem {
  entry: LabEntry;
  /** The lab is shown in its own language because this language has no version yet. */
  fallback: boolean;
}

/**
 * Merge a language's own entries with the default-language entries it lacks.
 * Content that exists only in a non-default language is not shown in the
 * default-language list, and no duplicate page is built for a fallback.
 */
function withFallback<T extends { id: string }>(
  own: T[],
  fallback: T[],
  locale: Locale,
): { entry: T; fallback: boolean }[] {
  if (locale === defaultLocale) return own.map((entry) => ({ entry, fallback: false }));
  const have = new Set(own.map(({ id }) => splitId(id).slug));
  return [
    ...own.map((entry) => ({ entry, fallback: false })),
    ...fallback
      .filter(({ id }) => !have.has(splitId(id).slug))
      .map((entry) => ({ entry, fallback: true })),
  ];
}

/** What the lab list of a language shows, in `number` order. */
export async function getLabList(course: string, locale: Locale): Promise<LabListItem[]> {
  const [own, fallback] = await Promise.all([
    getLabs(course, locale),
    getLabs(course, defaultLocale),
  ]);
  return withFallback(own, fallback, locale).sort(
    (a, b) => a.entry.data.number - b.entry.data.number,
  );
}

/** A lab's displayed number — `numberLabel` when it spans slots, else `number`. */
export function labNumber({ data }: LabEntry): string {
  return data.numberLabel ?? String(data.number);
}

/**
 * How a lab is named in page chrome — the header eyebrow and its breadcrumb.
 * The ІЗ has no lab number worth showing, so it is named by its kind.
 */
export function labLabels(
  entry: LabEntry,
  locale: Locale,
): { eyebrow: string; eyebrowSuffix?: string; crumb: string } {
  const { data } = entry;
  const t = useTranslations(locale);
  if (data.kind === 'individual') {
    return {
      eyebrow: t.labs.individualWork,
      eyebrowSuffix: data.duration,
      crumb: t.labs.individualAssignment,
    };
  }
  const n = labNumber(entry);
  return {
    eyebrow: t.labs.labWork.replace('{number}', n),
    crumb: t.labs.labNumber.replace('{number}', n),
  };
}

/**
 * Neighbours of one lab, for the footer nav. Either side may be absent.
 *
 * Only numbered labs form the chain: the ІЗ runs alongside every lab rather
 * than between two of them, so it neither gets nor appears in a prev/next link.
 */
export async function getAdjacentLab(
  locale: Locale,
  course: string,
  slug: string,
): Promise<{ prev?: LabMeta; next?: LabMeta }> {
  const labs = (await getLabList(course, locale)).filter(({ entry }) => entry.data.kind === 'lab');
  const i = labs.findIndex(({ entry }) => splitId(entry.id).slug === slug);
  if (i === -1) return {};

  // A neighbour that only exists in another language is left out, so the
  // links on an English page never leave English.
  const toMeta = (item?: LabListItem) =>
    item && !item.fallback ? toLabMeta(item.entry, locale) : undefined;
  return { prev: toMeta(labs[i - 1]), next: toMeta(labs[i + 1]) };
}

export type TaskEntry = CollectionEntry<'tasks'>;

/** A base-aware, locale-aware practical-brief route. */
export function taskHref(locale: Locale, course: string, slug: string): string {
  return localeHref(locale, `/${course}/labs/${slug}/task/`);
}

/**
 * Published briefs of one course that exist in one language. Unordered on
 * purpose — a brief is always reached through its lab, never listed on its own.
 */
export async function getTasks(course: string, locale: Locale): Promise<TaskEntry[]> {
  const entries = await getCollection('tasks');
  assertInCourse('tasks', entries);
  return entries.filter(({ id, data }) => id.startsWith(`${course}/${locale}/`) && !data.draft);
}

export interface TaskListItem {
  entry: TaskEntry;
  fallback: boolean;
}

/** The briefs a language offers: its own, plus the default-language ones it lacks. */
export async function getTaskList(course: string, locale: Locale): Promise<TaskListItem[]> {
  const [own, fallback] = await Promise.all([
    getTasks(course, locale),
    getTasks(course, defaultLocale),
  ]);
  return withFallback(own, fallback, locale);
}

/**
 * Language versions of one lab page (`kind: 'lab'`) or its brief page
 * (`kind: 'task'`) that exist — for `hreflang` and the language switcher.
 * `undefined` when English is disabled.
 */
export async function getLabAlternates(
  course: string,
  slug: string,
  kind: 'lab' | 'task' = 'lab',
): Promise<Partial<Record<Locale, string>> | undefined> {
  const exists = new Set<Locale>();
  for (const locale of locales) {
    const entries = kind === 'lab' ? await getLabs(course, locale) : await getTasks(course, locale);
    if (entries.some(({ id }) => splitId(id).slug === slug)) exists.add(locale);
  }
  const path = kind === 'lab' ? `/${course}/labs/${slug}/` : `/${course}/labs/${slug}/task/`;
  return localeAlternatesFor(path, (locale) => exists.has(locale));
}
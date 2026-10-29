/**
 * Lab helpers — the `number`-ordered list of a course's published labs, plus the
 * prev/next pair for a lab page's footer nav.
 *
 * Labs use a flat ordering model per course: `number` in frontmatter is
 * sufficient for sorting and for building the previous/next navigation.
 * A collection id keeps its course folder (`<course>/<slug>`);
 * `splitId` turns it into course + slug.
 */
import { getCollection, type CollectionEntry } from 'astro:content';

import { isCourse } from '@/data/courses';
import { localeHref, useTranslations, type Locale } from '@/i18n';

export type LabEntry = CollectionEntry<'labs'>;

/** `<course>/<slug>` → `{ course, slug }`. */
export function splitId(id: string): { course: string; slug: string } {
  const [course, ...rest] = id.split('/');
  return { course, slug: rest.join('/') };
}

/**
 * Throws on an entry outside a registered course folder. The per-course
 * filters would otherwise drop it without a word: the build stays green and
 * the page silently disappears from the site.
 */
function assertInCourse(
  collection: 'labs' | 'tasks',
  entries: { id: string; filePath?: string }[],
): void {
  for (const { id, filePath } of entries) {
    const { course, slug } = splitId(id);
    if (!slug || !isCourse(course)) {
      throw new Error(
        `${filePath ?? `${collection}/${id}`} is not in a registered course folder — ` +
          `move it to src/content/${collection}/<course>/.`,
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
  lang: string;
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
    lang: entry.data.lang,
    href: labHref(locale, course, slug),
  };
}

/**
 * Published labs of one course in `number` order. Drafts are dropped from the
 * build entirely (index, routes and prev/next), so an unfinished lab can sit in
 * the repo.
 */
export async function getLabs(course: string): Promise<LabEntry[]> {
  const entries = await getCollection('labs');
  assertInCourse('labs', entries);
  return entries
    .filter(({ id, data }) => id.startsWith(`${course}/`) && !data.draft)
    .sort((a, b) => a.data.number - b.data.number);
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
  const labs = (await getLabs(course)).filter(({ data }) => data.kind === 'lab');
  const i = labs.findIndex((entry) => entry.id === `${course}/${slug}`);
  if (i === -1) return {};

  const prev = labs[i - 1];
  const next = labs[i + 1];
  return {
    prev: prev && toLabMeta(prev, locale),
    next: next && toLabMeta(next, locale),
  };
}

export type TaskEntry = CollectionEntry<'tasks'>;

/** A base-aware, locale-aware practical-brief route. */
export function taskHref(locale: Locale, course: string, slug: string): string {
  return localeHref(locale, `/${course}/labs/${slug}/task/`);
}

/**
 * Published briefs of one course. Unordered on purpose — a brief is always
 * reached through its lab, never listed on its own.
 */
export async function getTasks(course: string): Promise<TaskEntry[]> {
  const entries = await getCollection('tasks');
  assertInCourse('tasks', entries);
  return entries.filter(({ id, data }) => id.startsWith(`${course}/`) && !data.draft);
}
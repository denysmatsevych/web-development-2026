/**
 * Lab helpers — the flat, `number`-ordered list of published labs, plus the
 * prev/next pair for a lab page's footer nav.
 *
 * The handbook's equivalent (`src/lib/curriculum.ts`) has to reconcile a
 * Part/Chapter tree declared in `src/data/curriculum.ts`. Labs need none of
 * that: `number` in frontmatter is the whole ordering model.
 */
import { getCollection, type CollectionEntry } from 'astro:content';

import { withBase } from '@/lib/paths';

export type LabEntry = CollectionEntry<'labs'>;

export interface LabMeta {
  /** Collection id — `lab-1` — which is also the URL segment. */
  slug: string;
  number: number;
  title: string;
  summary: string;
  /** `withBase('/labs/<slug>/')` — drop straight into an `href`. */
  href: string;
}

/** `withBase` applied to a lab's route. */
export function labHref(slug: string): string {
  return withBase(`/labs/${slug}/`);
}

export function toLabMeta(entry: LabEntry): LabMeta {
  return {
    slug: entry.id,
    number: entry.data.number,
    title: entry.data.title,
    summary: entry.data.summary,
    href: labHref(entry.id),
  };
}

/**
 * Published labs in `number` order. Drafts are dropped from the build entirely
 * (index, routes and prev/next), so an unfinished lab can sit in the repo.
 */
export async function getLabs(): Promise<LabEntry[]> {
  const entries = await getCollection('labs', ({ data }) => !data.draft);
  return entries.sort((a, b) => a.data.number - b.data.number);
}

/**
 * How a lab is named in page chrome — the header eyebrow and its breadcrumb.
 * The ІЗ has no lab number worth showing, so it is named by its kind.
 */
export function labLabels({ data }: LabEntry): { eyebrow: string; crumb: string } {
  if (data.kind === 'individual') {
    return {
      eyebrow: ['Самостійна робота', data.duration].filter(Boolean).join(' · '),
      crumb: 'Індивідуальне завдання',
    };
  }
  return { eyebrow: `Лабораторна робота №${data.number}`, crumb: `ЛР-${data.number}` };
}

/**
 * Neighbours of one lab, for the footer nav. Either side may be absent.
 *
 * Only numbered labs form the chain: the ІЗ runs alongside every lab rather
 * than between two of them, so it neither gets nor appears in a prev/next link.
 */
export async function getAdjacentLab(
  slug: string,
): Promise<{ prev?: LabMeta; next?: LabMeta }> {
  const labs = (await getLabs()).filter(({ data }) => data.kind === 'lab');
  const i = labs.findIndex((entry) => entry.id === slug);
  if (i === -1) return {};

  const prev = labs[i - 1];
  const next = labs[i + 1];
  return {
    prev: prev && toLabMeta(prev),
    next: next && toLabMeta(next),
  };
}

export type TaskEntry = CollectionEntry<'tasks'>;

/** `withBase` applied to a lab's practical brief. */
export function taskHref(slug: string): string {
  return withBase(`/labs/${slug}/task/`);
}

/**
 * Published briefs. Unordered on purpose — a brief is always reached through
 * its lab, never listed on its own.
 */
export async function getTasks(): Promise<TaskEntry[]> {
  return getCollection('tasks', ({ data }) => !data.draft);
}


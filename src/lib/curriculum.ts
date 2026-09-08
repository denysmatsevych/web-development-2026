import { getCollection, type CollectionEntry } from 'astro:content';

import {
  chapters,
  parts,
  subjects,
  type Chapter,
  type Part,
  type Subject,
} from '@/data/curriculum';
import { withBase } from '@/lib/paths';

/**
 * Navigation derivation for the tutorial: pure functions over the `docs`
 * content collection joined with the Subject/Part/Chapter structure in
 * `src/data/curriculum.ts`.
 *
 * Content-collection ids are `<locale>/<subject>/<slug>` (e.g. `en/js/intro`,
 * `en/css/selectors`). Every function takes a `subject` and a `locale`
 * (default `'en'`) and selects entries by that `<locale>/<subject>/` prefix, so
 * each Subject is an isolated handbook — its own tree, its own flat reading
 * order, its own prev/next — and adding `src/content/docs/uk/**` later is enough
 * to light up a `uk` tree with no changes here or in the components.
 */

/** Locales the content tree is structured for. `en` ships now; `uk` is deferred. */
export type Locale = 'en' | 'uk';
const DEFAULT_LOCALE: Locale = 'en';

/** Top-level subject tabs, in `subjects` array order. */
export type SubjectId = 'html' | 'css' | 'js';
/** The subject the bare `/` landing points its primary call-to-action at. */
export const DEFAULT_SUBJECT: SubjectId = 'js';

/** Leading `<locale>/<subject>/` segments on a content-collection entry id. */
const ID_PREFIX = /^(en|uk)\/(html|css|js)\//;

type DocEntry = CollectionEntry<'docs'>;

/** Nav-ready view of one article. `href` is always base-prefixed. */
export interface DocMeta {
  /** Flat slug (locale + subject stripped), e.g. `intro`. */
  slug: string;
  title: string;
  /** `withBase('/<subject>/<slug>')` — drop straight into an `href`. */
  href: string;
  /** Owning `Subject.id`. */
  subject: string;
  /** Owning `Chapter.id`. */
  chapterId: string;
}

export interface NavChapter {
  chapter: Chapter;
  /** 1-based position within its Part (the `m` in `n.m`). */
  index: number;
  docs: DocMeta[];
}

export interface NavPart {
  part: Part;
  /** 1-based position among the Subject's Parts (the `n` in Part `n` / `n.m`). */
  index: number;
  chapters: NavChapter[];
}

export interface Crumb {
  label: string;
  href: string;
}

/**
 * Homepage-ToC anchor ids — shared by `CurriculumOverview` (which stamps them
 * onto its Part sections / Chapter cards) and `getBreadcrumbs` (which links the
 * Part / Chapter crumbs at them, on the Subject's `/<subject>/` page). Keep the
 * two in sync via these helpers.
 */
export const partAnchorId = (partId: string): string => `part-${partId}`;
export const chapterAnchorId = (chapterId: string): string => `chapter-${chapterId}`;

// Position lookups derived from the curriculum arrays (array order == numbering).
// Global indices: within a single subject they still give the correct relative
// order, which is all `getFlatDocs` sorts on.
const partIndexById = new Map(parts.map((p, i) => [p.id, i]));
const chapterIndexById = new Map(chapters.map((c, i) => [c.id, i]));
const chapterById = new Map(chapters.map((c) => [c.id, c]));
const subjectById = new Map(subjects.map((s) => [s.id, s]));

/** `subjects` in tab order — for `SubjectTabs` and the homepage track list. */
export function getSubjects(): Subject[] {
  return subjects;
}

/** Look up a Subject by id (URL segment). `undefined` for an unknown id. */
export function getSubject(id: string): Subject | undefined {
  return subjectById.get(id);
}

/** `/tutorial/<subject>/` index href, base-prefixed. */
export function subjectHref(id: string): string {
  return withBase(`/tutorial/${id}/`);
}

/** `en/js/intro` -> `js`. */
export function subjectOf(entry: DocEntry): string {
  return entry.id.split('/')[1] ?? '';
}

/** `en/js/intro` -> `intro`. Exported for `getStaticPaths` in `[subject]/[...slug].astro`. */
export function slugOf(entry: DocEntry): string {
  return entry.id.replace(ID_PREFIX, '');
}

function toDocMeta(entry: DocEntry): DocMeta {
  const subject = subjectOf(entry);
  const slug = slugOf(entry);
  return {
    slug,
    title: entry.data.title,
    href: withBase(`/tutorial/${subject}/${slug}`),
    subject,
    chapterId: entry.data.chapter,
  };
}

/**
 * Published articles for one Subject + locale in reading order:
 * Part → Chapter → `order`. Drafts, and any article whose `chapter` isn't
 * declared in `data/curriculum.ts` (warned about at build time), are dropped.
 * This is the basis for prev/next and the "Start reading" target.
 */
export async function getFlatDocs(
  subject: string,
  locale: Locale = DEFAULT_LOCALE,
): Promise<DocMeta[]> {
  const entries = await getCollection('docs');
  const prefix = `${locale}/${subject}/`;

  const decorated = entries
    .filter((entry) => entry.id.startsWith(prefix) && !entry.data.draft)
    .map((entry) => {
      const chapter = chapterById.get(entry.data.chapter);
      if (!chapter) {
        console.warn(
          `[curriculum] ${entry.id}: unknown chapter "${entry.data.chapter}" ` +
            `(not declared in src/data/curriculum.ts) — article skipped.`,
        );
      }
      return { entry, chapter };
    })
    .filter((d): d is { entry: DocEntry; chapter: Chapter } => d.chapter !== undefined);

  decorated.sort((a, b) => {
    const partDelta =
      (partIndexById.get(a.chapter.part) ?? Number.MAX_SAFE_INTEGER) -
      (partIndexById.get(b.chapter.part) ?? Number.MAX_SAFE_INTEGER);
    if (partDelta !== 0) return partDelta;

    const chapterDelta =
      (chapterIndexById.get(a.chapter.id) ?? Number.MAX_SAFE_INTEGER) -
      (chapterIndexById.get(b.chapter.id) ?? Number.MAX_SAFE_INTEGER);
    if (chapterDelta !== 0) return chapterDelta;

    return a.entry.data.order - b.entry.data.order;
  });

  return decorated.map(({ entry }) => toDocMeta(entry));
}

/**
 * Full navigation tree for one Subject's sidebar and homepage overview: the
 * Subject's Parts in curriculum order, each with its Chapters, each with its
 * ordered articles. Chapters (and Parts) with no published article are omitted;
 * `index` is taken before that filter, so a hidden chapter leaves a gap in the
 * `n.m` numbering rather than renumbering its siblings.
 */
export async function getNavTree(
  subject: string,
  locale: Locale = DEFAULT_LOCALE,
): Promise<NavPart[]> {
  const flat = await getFlatDocs(subject, locale);

  const docsByChapter = new Map<string, DocMeta[]>();
  for (const doc of flat) {
    const list = docsByChapter.get(doc.chapterId);
    if (list) list.push(doc);
    else docsByChapter.set(doc.chapterId, [doc]);
  }

  return parts
    .filter((part) => part.subject === subject)
    .map((part, partIdx) => ({
      part,
      index: partIdx + 1,
      chapters: chapters
        .filter((chapter) => chapter.part === part.id)
        .map((chapter, chapterIdx) => ({
          chapter,
          index: chapterIdx + 1,
          docs: docsByChapter.get(chapter.id) ?? [],
        }))
        .filter((navChapter) => navChapter.docs.length > 0),
    }))
    .filter((navPart) => navPart.chapters.length > 0);
}

/**
 * Previous / next article around `slug` in the Subject's flat reading order.
 * Either side is `undefined` at the ends of the Subject's tree (so `PrevNext`
 * hides the missing link and navigation never bleeds into another Subject); an
 * unknown `slug` yields `{}`.
 */
export async function getAdjacent(
  subject: string,
  slug: string,
  locale: Locale = DEFAULT_LOCALE,
): Promise<{ prev?: DocMeta; next?: DocMeta }> {
  const flat = await getFlatDocs(subject, locale);
  const i = flat.findIndex((doc) => doc.slug === slug);
  if (i === -1) return {};
  return {
    prev: i > 0 ? flat[i - 1] : undefined,
    next: i < flat.length - 1 ? flat[i + 1] : undefined,
  };
}

/**
 * Breadcrumb trail `Tutorial › <Subject> › Part › Chapter › Article` for an
 * article page. The Subject crumb points at its `/<subject>/` index; the Part /
 * Chapter crumbs point at that index's ToC anchors. An unknown `slug` collapses
 * to `Tutorial › <Subject>`.
 */
export async function getBreadcrumbs(
  subject: string,
  slug: string,
  locale: Locale = DEFAULT_LOCALE,
): Promise<Crumb[]> {
  const trail: Crumb[] = [{ label: 'Tutorial', href: withBase('/tutorial/') }];

  const subj = subjectById.get(subject);
  if (subj) {
    trail.push({ label: subj.title, href: subjectHref(subj.id) });
  }

  const flat = await getFlatDocs(subject, locale);
  const doc = flat.find((d) => d.slug === slug);
  if (!doc) return trail;

  const chapter = chapterById.get(doc.chapterId);
  const part = chapter ? parts.find((p) => p.id === chapter.part) : undefined;
  const indexHref = subjectHref(subject);

  if (part) {
    trail.push({ label: part.title, href: `${indexHref}#${partAnchorId(part.id)}` });
  }
  if (chapter) {
    trail.push({
      label: chapter.title,
      href: `${indexHref}#${chapterAnchorId(chapter.id)}`,
    });
  }
  trail.push({ label: doc.title, href: doc.href });
  return trail;
}

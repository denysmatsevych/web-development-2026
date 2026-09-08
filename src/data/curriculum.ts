/**
 * Structural source of truth for the tutorial's navigation hierarchy:
 * ordered Subjects → Parts → Chapters. Articles live in
 * `src/content/docs/<locale>/<subject>/*.md` and attach to a Chapter through
 * their `chapter` frontmatter; `src/lib/curriculum.ts` joins the two into the
 * per-subject nav tree, flat list, breadcrumbs and prev/next.
 *
 * The three Subjects (HTML, CSS, JavaScript) are the top-level tabs. Each is an
 * independent handbook with its own numbering — a Subject's first Part is
 * "Part 1" regardless of the Subjects before it in the array.
 *
 * Array order is significant — it defines the displayed numbering
 * (Part `n`, Chapter `n.m`, both restarting within each Subject) and the tab
 * order.
 *
 * `id`s are global: a Part id is unique across every Subject, a Chapter id
 * unique across every Part. Article slugs only need to be unique within their
 * Subject — the URL carries the `/<subject>/` segment.
 *
 * English only for the first version. A `uk` locale reuses these same ids and
 * adds parallel titles later (a `titleUk` field or a locale-keyed map) with no
 * change to consumers.
 */

export interface Subject {
  /** Stable id — the `/<subject>/` URL segment and the tab order key. */
  id: string;
  /** Display name: tab label, breadcrumb crumb, sidebar heading. */
  title: string;
  /** One-line pitch for the homepage track cards. */
  tagline: string;
}

export interface Part {
  /** Stable id (globally unique); referenced by `Chapter.part`, used for anchors. */
  id: string;
  /** Owning `Subject.id`. */
  subject: string;
  title: string;
}

export interface Chapter {
  /** Stable id (globally unique); referenced by an article's `chapter` frontmatter. */
  id: string;
  /** Owning `Part.id`. */
  part: string;
  title: string;
}

export const subjects: Subject[] = [
  {
    id: 'html',
    title: 'HTML',
    tagline: 'Structure and meaning — the elements every page is built from.',
  },
  {
    id: 'css',
    title: 'CSS',
    tagline: 'Presentation and layout — turning markup into a designed interface.',
  },
  {
    id: 'js',
    title: 'JavaScript',
    tagline: 'Behaviour — making pages interactive, in the browser and beyond.',
  },
];

export const parts: Part[] = [
  // ── HTML ─────────────────────────────────────────────────────────────
  { id: 'html-foundations', subject: 'html', title: 'HTML Foundations' },
  { id: 'html-structure-forms', subject: 'html', title: 'Structure and Forms' },

  // ── CSS ──────────────────────────────────────────────────────────────
  { id: 'css-foundations', subject: 'css', title: 'CSS Foundations' },
  { id: 'css-layout', subject: 'css', title: 'Layout and Responsiveness' },

  // ── JavaScript ───────────────────────────────────────────────────────
  { id: 'js-language', subject: 'js', title: 'The JavaScript Language' },
  { id: 'browser', subject: 'js', title: 'Browser: Document, Events, Interfaces' },
  { id: 'extra', subject: 'js', title: 'Additional Articles' },
];

export const chapters: Chapter[] = [
  // ── HTML · Part 1 — HTML Foundations ──────────────────────────────────
  { id: 'html-getting-started', part: 'html-foundations', title: 'Getting Started' },
  { id: 'html-text', part: 'html-foundations', title: 'Text Content' },
  { id: 'html-links-media', part: 'html-foundations', title: 'Links and Media' },
  // ── HTML · Part 2 — Structure and Forms ──────────────────────────────
  { id: 'html-semantics', part: 'html-structure-forms', title: 'Document Semantics' },
  { id: 'html-forms', part: 'html-structure-forms', title: 'Forms' },
  { id: 'html-head', part: 'html-structure-forms', title: 'The Document Head' },

  // ── CSS · Part 1 — CSS Foundations ───────────────────────────────────
  { id: 'css-getting-started', part: 'css-foundations', title: 'Getting Started' },
  { id: 'css-visual', part: 'css-foundations', title: 'Visual Formatting' },
  { id: 'css-values', part: 'css-foundations', title: 'Values and Units' },
  // ── CSS · Part 2 — Layout and Responsiveness ─────────────────────────
  { id: 'css-flow-positioning', part: 'css-layout', title: 'Flow and Positioning' },
  { id: 'css-modern-layout', part: 'css-layout', title: 'Modern Layout' },
  { id: 'css-responsive', part: 'css-layout', title: 'Responsive Design' },

  // ── JavaScript · Part 1 — The JavaScript Language ────────────────────
  { id: 'intro', part: 'js-language', title: 'An Introduction' },
  { id: 'fundamentals', part: 'js-language', title: 'JavaScript Fundamentals' },
  { id: 'code-quality', part: 'js-language', title: 'Code Quality' },
  // ── JavaScript · Part 2 — Browser: Document, Events, Interfaces ───────
  { id: 'document', part: 'browser', title: 'Document' },
  { id: 'events', part: 'browser', title: 'Introduction to Events' },
  { id: 'frames-windows', part: 'browser', title: 'Frames and Windows' },
  // ── JavaScript · Part 3 — Additional Articles ────────────────────────
  { id: 'regexp', part: 'extra', title: 'Regular Expressions' },
];

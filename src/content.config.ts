import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * The `labs` collection — one Markdown file per lab assignment under
 * `src/content/labs/<course>/<locale>/`. The language folder (`uk/` or `en/`)
 * sets the page language; there is no `lang` field.
 */
const labs = defineCollection({
  // ids look like "web-development/uk/lab-1" — course, locale and slug, no extension.
  loader: glob({ pattern: '**/*.md', base: './src/content/labs' }),
  schema: z.object({
    /**
     * `lab` — a numbered lab (ЛР-N). `individual` — the semester's individual
     * assignment (ІЗ): listed first as `00`, named by its kind rather than a
     * number, and kept out of the lab-to-lab prev/next chain.
     */
    kind: z.enum(['lab', 'individual']).default('lab'),
    /** Ordering, the `ЛР-N` badge, and the index card index — `0` for the ІЗ. */
    number: z.number().int().nonnegative(),
    /**
     * Displayed number when one lab covers several slots — `"4-5"` shows as
     * `ЛР-4-5`. Ordering still uses `number`; omit it for a single-slot lab.
     */
    numberLabel: z.string().optional(),
    /** Lab title (Ukrainian) — `<h1>` / card heading / `<title>` base. */
    title: z.string(),
    /** One-line description — index card blurb + meta description. */
    summary: z.string(),
    /** Header meta panel — all optional so a terse lab can skip them. */
    discipline: z.string().optional(),
    level: z.string().optional(),
    format: z.string().optional(),
    duration: z.string().optional(),
    /** "Актуально станом на" date from the handout. */
    updated: z.coerce.date().optional(),
    /** Path (no base prefix) to the downloadable handout, if published. */
    handout: z.string().optional(),
    /** Hidden from the index and un-routed while true. */
    draft: z.boolean().default(false),
  }),
});

/**
 * The `tasks` collection — one practical brief (ТЗ) per lab, under
 * `src/content/tasks/<course>/<locale>/`. The entry id **is** the owning lab's
 * id (`web-development/uk/lab-2`), and that is the whole relation: no `lab:`
 * field to keep in sync, and the route `/<course>/labs/<slug>/task/` follows
 * from it. A brief and its lab are matched by slug, and each language is
 * checked on its own: a lab may have an English version while its brief only
 * exists in Ukrainian.
 */
const tasks = defineCollection({
  // ids look like "web-development/uk/lab-2" — the owning lab's id, no extension.
  loader: glob({ pattern: '**/*.md', base: './src/content/tasks' }),
  schema: z.object({
    /** Brief title (Ukrainian) — `<h1>` / card heading / `<title>` base. */
    title: z.string(),
    /** One-line description — hand-off card blurb + meta description. */
    summary: z.string(),
    /**
     * The brief's "Мета практичної частини" box — the one paragraph that
     * answers "what am I building". Rendered as a lead callout by the route,
     * above the body, so it is never scrolled past.
     */
    goal: z.string().optional(),
    /** Optional custom badge; otherwise localized by the task page locale. */
    label: z.string().optional(),
    /**
     * Header eyebrow before the `· ЛР-N` suffix. A brief that is a design
     * reference rather than a build spec (ЛР-7's mockup page) names itself.
     * If absent, the task page uses its localized interface default.
     */
    eyebrow: z.string().optional(),
    /** Constraint chips on the hand-off card — 2–4 short phrases. */
    highlights: z.array(z.string()).default([]),
    /**
     * The brief's §7 acceptance criteria, one line per row, for the self-check
     * dialog. Frontmatter rather than the brief route
     * so a second brief cannot inherit another lab's criteria; empty hides the
     * dialog.
     */
    acceptance: z.array(z.string()).default([]),
    /**
     * Which mockup to render above the body. A brief that specifies a target
     * design names one; a brief whose practical part is an audit of supplied
     * code names none.
     */
    mockup: z.enum(['pricing', 'courtly']).optional(),
    /** "Актуально станом на" date from the brief. */
    updated: z.coerce.date().optional(),
    /** Path (no base prefix) to the downloadable brief, if published. */
    handout: z.string().optional(),
    /** Hidden from the lab page and un-routed while true. */
    draft: z.boolean().default(false),
  }),
});

export const collections = { labs, tasks };

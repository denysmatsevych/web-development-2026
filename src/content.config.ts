import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * The `labs` collection — one Markdown file per lab assignment under
 * `src/content/labs/`. The files are flat (no locale folder): the course's lab
 * handouts are Ukrainian, and `lang` carries that to `<html lang>` rather than
 * the file path. Ordering is `number`, not folder position.
 */
const labs = defineCollection({
  // ids look like "lab-1" — ".md" stripped, no prefix.
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
    /** Lab title (Ukrainian) — `<h1>` / card heading / `<title>` base. */
    title: z.string(),
    /** One-line description — index card blurb + meta description. */
    summary: z.string(),
    /** BCP-47 language of the body — drives `<html lang>`. */
    lang: z.string().default('uk'),
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
 * `src/content/tasks/`. The entry id **is** the owning lab's id (`lab-2`), and
 * that is the whole relation: no `lab:` field to keep in sync, and the route
 * `/labs/<id>/task/` falls straight out of the id.
 *
 * A brief lives outside its lab because the two are read differently — the lab
 * once, top to bottom; the brief kept open beside the editor for two hours.
 * See docs/lab-2/README.md §3.
 */
const tasks = defineCollection({
  // ids look like "lab-2" — the owning lab's id, ".md" stripped.
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
    /** BCP-47 language of the body — drives `<html lang>`. */
    lang: z.string().default('uk'),
    /** Short badge: hand-off card, index pill, last breadcrumb. */
    label: z.string().default('ТЗ'),
    /** Constraint chips on the hand-off card — 2–4 short phrases. */
    highlights: z.array(z.string()).default([]),
    /**
     * The brief's §7 acceptance criteria, one line per row, for the self-check
     * dialog. Frontmatter rather than the route (see `labs/[lab]/task.astro`)
     * so a second brief cannot inherit another lab's criteria; empty hides the
     * dialog.
     */
    acceptance: z.array(z.string()).default([]),
    /**
     * Which mockup to render above the body. A brief that specifies a target
     * design names one; a brief whose practical part is an audit of supplied
     * code names none.
     */
    mockup: z.enum(['pricing']).optional(),
    /** "Актуально станом на" date from the brief. */
    updated: z.coerce.date().optional(),
    /** Path (no base prefix) to the downloadable brief, if published. */
    handout: z.string().optional(),
    /** Hidden from the lab page and un-routed while true. */
    draft: z.boolean().default(false),
  }),
});

export const collections = { labs, tasks };

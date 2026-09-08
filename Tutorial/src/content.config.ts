import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * The `docs` collection — every tutorial article, one Markdown file per topic
 * under `src/content/docs/<locale>/`.
 *
 * The glob loader keeps the locale folder in the entry id (`en/intro`,
 * `uk/intro` later), which is how `src/lib/curriculum.ts` selects a locale's
 * articles and derives its flat slug (`intro`). Adding `src/content/docs/uk/**`
 * is the only change needed to light up a `uk` tree — this schema is shared.
 *
 * Structural placement (which Part / Chapter, and the position within it) lives
 * in frontmatter, not the folder path: `chapter` points at a `Chapter.id` from
 * `src/data/curriculum.ts` and `order` sequences the article inside that
 * chapter. An article whose `chapter` isn't declared there is warned about and
 * skipped at build time (see `getFlatDocs`).
 */
const docs = defineCollection({
  // ids look like "en/intro" — locale folder retained, ".md" stripped.
  loader: glob({ pattern: '**/*.md', base: './src/content/docs' }),
  schema: z.object({
    /** Article `<h1>` / nav label / `<title>` base. */
    title: z.string(),
    /** Owning `Chapter.id` from `src/data/curriculum.ts`. */
    chapter: z.string(),
    /** 1-based position within the chapter (prev/next + sidebar order). */
    order: z.number().int().positive(),
    /** One-line description — homepage list + article subhead. */
    summary: z.string().optional(),
    /** Hidden from every derived nav view while true. */
    draft: z.boolean().default(false),
  }),
});

export const collections = { docs };

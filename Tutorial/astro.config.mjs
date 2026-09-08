import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { site } from './src/data/site.ts';

// Deploy target: GitHub Pages project site (same pattern as ../Lectures).
// Replace YOUR-USERNAME before the first deploy — see README / step 9.
export default defineConfig({
  site: 'https://YOUR-USERNAME.github.io',
  base: '/web-development-2026-tutorial',
  vite: { plugins: [tailwindcss()] },
  // Stable in-site shortcut to the sibling Lectures deployment. `Lectures/` is a
  // separate build, so this is an external redirect — with no adapter Astro
  // emits a `<meta http-equiv="refresh">` page, which works on GitHub Pages.
  // Destination stays single-sourced from `src/data/site.ts` (same seam the
  // header/footer cross-links use).
  redirects: {
    '/lectures': site.lecturesUrl,
  },
  // English only for the first version; `uk` is pre-declared so a locale and a
  // header language switcher drop in later without a routing refactor. The
  // default locale carries no URL prefix, so `en` pages stay at `/intro` etc.
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'uk'],
    routing: { prefixDefaultLocale: false },
  },
});

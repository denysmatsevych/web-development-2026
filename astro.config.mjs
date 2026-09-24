import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import tailwindcss from '@tailwindcss/vite';

import baseLinks from './plugins/base-links.mjs';

// Single source of truth for the GitHub Pages project path: `base` below and
// the Markdown link rewriter both read it.
const BASE = '/web-development-2026';

// One deploy for the whole course site: the hub at `/`, the slide decks under
// `/lectures/*`, the labs under `/labs/*`, and the handbook under `/tutorial/*`.
// GitHub Pages project site at https://denysmatsevych.github.io/web-development-2026/
// (repo denysmatsevych/web-development-2026, Settings → Pages → Source: GitHub Actions).
// `base` must match the repo name; every internal link/asset goes through
// `withBase()` (src/lib/paths.ts) so this is the only place it is declared.
export default defineConfig({
  site: 'https://denysmatsevych.github.io',
  base: BASE,
  vite: { plugins: [tailwindcss()] },
  markdown: {
    // `satteri()` is Astro 7's default processor — named here only so the link
    // rewriter can join its pipeline. Root-relative links inside Markdown
    // bodies get the base prefix; components keep using withBase()
    // (src/lib/paths.ts).
    processor: satteri({ hastPlugins: [baseLinks({ base: BASE })] }),
  },
  // English handbook by default; `uk` is pre-declared (the decks are Ukrainian)
  // so a locale + language switcher can drop in without a routing refactor. The
  // default locale carries no URL prefix.
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'uk'],
    routing: { prefixDefaultLocale: false },
  },
});

import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// One deploy for the whole course site: the hub at `/`, the slide decks under
// `/lectures/*`, the labs under `/labs/*`, and the handbook under `/tutorial/*`.
// GitHub Pages project site at https://denysmatsevych.github.io/web-development-2026/
// (repo denysmatsevych/web-development-2026, Settings → Pages → Source: GitHub Actions).
// `base` must match the repo name; every internal link/asset goes through
// `withBase()` (src/lib/paths.ts) so this is the only place it is declared.
export default defineConfig({
  site: 'https://denysmatsevych.github.io',
  base: '/web-development-2026',
  vite: { plugins: [tailwindcss()] },
  // English handbook by default; `uk` is pre-declared (the decks are Ukrainian)
  // so a locale + language switcher can drop in without a routing refactor. The
  // default locale carries no URL prefix.
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'uk'],
    routing: { prefixDefaultLocale: false },
  },
});

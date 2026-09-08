import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://YOUR-USERNAME.github.io',
  base: '/lecture-1-slides',
  vite: { plugins: [tailwindcss()] },
});

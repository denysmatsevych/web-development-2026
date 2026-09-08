/**
 * Site metadata and cross-links to the sibling course deployments.
 *
 * `Lectures/` and `Labs/` are separate Astro builds, not part of this project —
 * the header and footer link to them by URL only. Keeping the URLs here is the
 * single seam for a future unified shell / workspace (see the plan's
 * "Tighter Lectures/Labs integration" note).
 */

export interface SiteConfig {
  /** Wordmark in the header; base for page `<title>`s. */
  name: string;
  /** Default meta + og description (a page may override it). */
  description: string;
  /** Homepage hero eyebrow. */
  eyebrow: string;
  /** Sibling deployments — absolute URLs, external links from header + footer. */
  lecturesUrl: string;
  labsUrl: string;
  /** Footer contact — label shown, URL linked. */
  contactLabel: string;
  contactUrl: string;
}

export const site: SiteConfig = {
  name: 'Web Development 2026',
  description:
    'Course handbook for Web Development 2026 — a hierarchical, javascript.info-style guide to modern HTML, CSS and JavaScript/TypeScript.',
  eyebrow: 'Modern Web Development · HTML, CSS, JS/TS',

  // TODO(step 9 / README): replace the YOUR-USERNAME + base-path placeholders
  // once the sibling GitHub Pages sites have their final URLs.
  lecturesUrl: 'https://YOUR-USERNAME.github.io/lecture-1-slides/',
  labsUrl: 'https://YOUR-USERNAME.github.io/web-development-2026-labs/',

  contactLabel: 'oa.edu.ua',
  contactUrl: 'https://www.oa.edu.ua/',
};

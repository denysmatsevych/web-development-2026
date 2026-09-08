/**
 * Prefix an internal path with the site's configured `base` URL.
 *
 * `import.meta.env.BASE_URL` does NOT guarantee a trailing slash: with
 * `base: '/web-development-2026'` the naive template
 * `` `${BASE_URL}intro` `` yields `/web-development-2026intro`.
 * Normalise the join once here and route every internal link and asset URL
 * through `withBase()` so the `base` prefix is always correct.
 * (Same slash-handling caveat as `../../Lectures/src/layouts/BaseLayout.astro`.)
 *
 * @param path  route or asset path, with or without a leading slash;
 *              `''` and `'/'` both resolve to the site root.
 * @returns the path prefixed with the base, joined by exactly one slash.
 */
export function withBase(path = ''): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/${path.replace(/^\//, '')}`;
}

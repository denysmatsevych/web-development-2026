/**
 * base-links — prefix root-relative URLs in Markdown bodies with the site's
 * `base`, so a body can write `[ТЗ](/labs/lab-2/task/)` and still work under
 * the GitHub Pages project path.
 *
 * A Sätteri hast plugin, not a rehype one: Astro 7 runs Markdown through
 * Sätteri by default, and `markdown.rehypePlugins` would drag the whole site
 * back onto the `unified` pipeline. The filter is applied in Rust, so only the
 * handful of link-bearing elements ever crosses into JS.
 *
 * Left alone: absolute URLs, protocol-relative `//host/…`, `#anchors`,
 * `mailto:`/`tel:`, and anything already prefixed (so the plugin is
 * idempotent). `srcset` is not rewritten — no Markdown body uses it yet.
 */
const URL_ATTRS = {
  a: 'href',
  area: 'href',
  img: 'src',
  source: 'src',
  video: 'src',
  audio: 'src',
  iframe: 'src',
};

export default function baseLinks({ base = '' } = {}) {
  const prefix = base.replace(/\/$/, '');
  if (!prefix) return null;

  return {
    name: 'base-links',
    element: {
      filter: Object.keys(URL_ATTRS),
      visit(node, ctx) {
        const attr = URL_ATTRS[node.tagName];
        const value = node.properties?.[attr];

        if (
          typeof value !== 'string' ||
          !value.startsWith('/') ||
          value.startsWith('//') ||
          value === prefix ||
          value.startsWith(`${prefix}/`)
        ) {
          return;
        }

        ctx.setProperty(node, attr, `${prefix}${value}`);
      },
    },
  };
}

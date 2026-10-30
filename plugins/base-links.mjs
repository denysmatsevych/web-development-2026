/**
 * base-links — rewrite root-relative URLs in Markdown bodies:
 *
 *  1. Prefix them with the site's `base`, so a body can write
 *     `[ТЗ](/web-development/labs/lab-2/task/)` and still work under the
 *     GitHub Pages project path.
 *  2. In an English Markdown file, add `/en` to a link to a course page
 *     (`/<course>/…`) when that English page exists. A link whose English page
 *     does not exist keeps its default-language URL, which is the fallback.
 *     Downloads and legacy URLs (`/labs/…`, `/lectures/…`) are never localized.
 *
 * The language of the *source file* decides, read from its path
 * (`…/src/content/{labs,tasks}/<course>/<locale>/…`) through `ctx.fileURL`; it
 * is never guessed from the URL being rewritten.
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
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const URL_ATTRS = {
  a: 'href',
  area: 'href',
  img: 'src',
  source: 'src',
  video: 'src',
  audio: 'src',
  iframe: 'src',
};

const SRC = fileURLToPath(new URL('../src/', import.meta.url));
const SOURCE_LOCALE = /\/src\/content\/(?:labs|tasks)\/[^/]+\/(uk|en)\//;

const dirs = (path) =>
  existsSync(path)
    ? readdirSync(path, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)
    : [];

const files = (path, extension) =>
  existsSync(path) ? readdirSync(path).filter((name) => name.endsWith(extension)) : [];

/** Every course folder name found under the content and lecture roots. */
function findCourses() {
  return new Set(
    ['content/labs', 'content/tasks', 'data/lectures'].flatMap((root) => dirs(`${SRC}${root}`)),
  );
}

/** Route paths of the English pages that exist, as `/<course>/…/`. */
function findEnglishTargets(courses) {
  const targets = new Set();
  for (const course of courses) {
    // The course page and its two lists exist in every language.
    for (const path of [`/${course}/`, `/${course}/labs/`, `/${course}/lectures/`]) {
      targets.add(path);
    }
    for (const [root, suffix] of [['labs', ''], ['tasks', 'task/']]) {
      const folder = `${SRC}content/${root}/${course}/en`;
      for (const name of files(folder, '.md')) {
        if (/^draft:\s*true\s*$/m.test(readFileSync(`${folder}/${name}`, 'utf8'))) continue;
        targets.add(`/${course}/labs/${name.replace(/\.md$/, '')}/${suffix}`);
      }
    }
    for (const name of files(`${SRC}data/lectures/${course}/en`, '.ts')) {
      targets.add(`/${course}/lectures/${name.replace(/\.ts$/, '')}/`);
    }
  }
  return targets;
}

export default function baseLinks({ base = '' } = {}) {
  const prefix = base.replace(/\/$/, '');
  const courses = findCourses();
  const englishTargets = findEnglishTargets(courses);

  /** Add `/en` when the link goes to a course page that has an English version. */
  const localize = (value) => {
    const [path] = value.split(/[?#]/);
    const [, first] = path.split('/');
    if (!courses.has(first)) return value;
    const route = path.endsWith('/') ? path : `${path}/`;
    return englishTargets.has(route) ? `/en${value}` : value;
  };

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
          value.startsWith('/en/') ||
          (prefix && (value === prefix || value.startsWith(`${prefix}/`)))
        ) {
          return;
        }

        const sourceLocale = SOURCE_LOCALE.exec(ctx.fileURL?.pathname ?? '')?.[1];
        const target = sourceLocale === 'en' ? localize(value) : value;
        ctx.setProperty(node, attr, `${prefix}${target}`);
      },
    },
  };
}

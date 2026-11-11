// Report for index.html: applies functions from src/ to data/shows.json. You do not need to
// modify this file. A section whose function is not yet implemented shows its error.
import data from './data/shows.json' with { type: 'json' };
import { createCounter, memoize, once } from './src/closures.js';
import { filterShows } from './src/filter.js';
import { normalizeShow } from './src/normalize.js';
import { sortShows } from './src/sort.js';
import { genreStats } from './src/stats.js';

/** @typedef {import('./src/normalize.js').Show} Show */

const lines = [`Data: ${data.shows.length} shows from TVmaze`];
let ready = 0;
/** @type {Show[] | null} */
let shows = null;

/**
 * Adds a report section. If `build` throws an error, the section shows it.
 * @param {string} title
 * @param {() => string[]} build
 */
function section(title, build) {
  lines.push('', title);
  try {
    for (const line of build()) lines.push(`  ${line}`);
    ready += 1;
  } catch (error) {
    lines.push(`  ✗ ${error instanceof Error ? error.message : String(error)}`);
  }
}

/** Sections C2–C4 operate on the result of C1. */
function normalized() {
  if (shows === null) throw new Error('C1 (normalizeShow) is required first');
  return shows;
}

/** @param {Show[]} list */
const titles = (list) => list.map((show) => `${show.name} (${show.rating ?? '—'})`).join(', ');

section('C1 · normalizeShow', () => {
  const result = data.shows.map(normalizeShow);
  shows = result;
  /** @param {(show: Show) => boolean} test */
  const count = (test) => result.filter(test).length;
  return [
    `Unrated: ${count((show) => show.rating === null)}` +
      ` · without runtime: ${count((show) => show.runtime === null)}` +
      ` · without network: ${count((show) => show.network === null)}` +
      ` · without genres: ${count((show) => show.genres.length === 0)}`,
    `Example: ${JSON.stringify(result.find((show) => show.name === 'House of Cards'))}`,
  ];
});

section('C2 · filterShows', () => {
  const drama = filterShows(normalized(), { genre: 'Drama', minRating: 8.7 });
  const the = filterShows(normalized(), { query: ' THE ' });
  return [
    `{ genre: 'Drama', minRating: 8.7 } → ${drama.length}: ${titles(drama)}`,
    `{ query: ' THE ' } → ${the.length}: ${titles(the)}`,
  ];
});

section('C3 · sortShows', () => {
  const best = sortShows(normalized(), 'rating', 'desc').slice(0, 5);
  const oldest = sortShows(normalized(), 'year').slice(0, 3);
  return [
    `By rating, desc, top five: ${titles(best)}`,
    `By year, asc, first three: ${oldest.map((show) => `${show.name} (${show.year})`).join(', ')}`,
  ];
});

section('C4 · genreStats — genre, shows, average rating', () =>
  Object.entries(genreStats(normalized()))
    .toSorted(([a, x], [b, y]) => y.count - x.count || a.localeCompare(b))
    .map(
      ([genre, { count, averageRating }]) =>
        `${genre.padEnd(16)} ${String(count).padStart(2)}   ${averageRating ?? '—'}`,
    ),
);

section('C5 · createCounter, once, memoize', () => {
  const computed = createCounter();
  const countGenre = memoize((/** @type {string} */ genre) => {
    computed.increment();
    return data.shows.filter((show) => show.genres.includes(genre)).length;
  });
  const asked = ['Drama', 'Comedy', 'Drama', 'Crime', 'Comedy', 'Drama'];
  const answers = asked.map((genre) => `${genre} ${countGenre(genre)}`);
  const greet = once((/** @type {string} */ name) => `Hello, ${name}!`);
  return [
    `memoize: ${asked.length} requests (${answers.join(', ')}) → computations: ${computed.value()}`,
    `once: "${greet('C5')}", then "${greet('again')}" — fn called only once`,
  ];
});

lines.push('', `Completed sections: ${ready} of 5`);
const report = document.querySelector('#report');
if (report) report.textContent = lines.join('\n');

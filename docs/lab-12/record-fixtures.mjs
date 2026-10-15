/**
 * Lab 12-13 — records the TVmaze responses that showfinder-ts-starter's tests serve
 * (check/fixtures/). Run from the repo root; it needs network access:
 *
 *   node docs/lab-12/record-fixtures.mjs
 *
 * The tests answer every request from these files, and `npm run typecheck` checks that
 * the student's types accept them, so their shape is the API's shape. The searches are
 * chosen so that every nullable field the student types (image, summary, premiered,
 * rating.average) is null in at least one recorded show, and `genres` is empty in one.
 * Show objects keep only the fields listed in `changes`, so the files stay small enough
 * for the zip. Each file records its source, licence, retrieval date and changes
 * (CC BY-SA 4.0 asks for all four).
 *
 * TVmaze allows at least 20 calls per 10 s per IP; the recorder waits between calls.
 * Re-run it only to refresh the data, then re-run `docs/lab-12/solution/verify.mjs`.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const API = 'https://api.tvmaze.com';
const OUT = 'showfinder-ts-starter/check/fixtures';

/** `girls` and `law & order` are the tests' own; `kitchen` and `pilot` bring the nulls. */
const QUERIES = ['girls', 'law & order', 'kitchen', 'pilot'];
/** GET /shows/:id: Girls, plus shows with a null summary (41734) and a null image and premiered (45962). */
const SHOWS = [139, 41734, 45962];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function get(pathname) {
  await sleep(700);
  const response = await fetch(API + pathname);
  if (!response.ok) throw new Error(`${pathname}: HTTP ${response.status}`);
  return response.json();
}

const pick = (object, keys) => Object.fromEntries(keys.filter((key) => key in object).map((key) => [key, object[key]]));

const FIELDS = ['id', 'url', 'name', 'type', 'language', 'genres', 'status', 'premiered', 'ended', 'rating', 'image', 'summary'];
const trimShow = (show) => pick(show, FIELDS);

const retrieved = new Date().toISOString().slice(0, 10);
const meta = (changes) => ({
  source: 'TVmaze API, https://www.tvmaze.com/api',
  license: 'CC BY-SA 4.0, https://creativecommons.org/licenses/by-sa/4.0/',
  retrieved,
  changes,
});
const kept = `Show objects keep ${FIELDS.join(', ')}; the API sends more fields.`;

const searches = {};
for (const query of QUERIES) {
  const results = await get(`/search/shows?q=${encodeURIComponent(query)}`);
  searches[query] = results.map(({ score, show }) => ({ score, show: trimShow(show) }));
  console.log(`search ${JSON.stringify(query)}: ${results.length}`);
}

const shows = {};
for (const id of SHOWS) {
  const show = await get(`/shows/${id}`);
  shows[id] = trimShow(show);
  console.log(`show ${id} ${show.name}`);
}

mkdirSync(OUT, { recursive: true });
const write = (name, data) => {
  const file = path.join(OUT, name);
  writeFileSync(file, `${JSON.stringify(data, null, 1)}\n`);
  console.log(`${file}  ${(JSON.stringify(data).length / 1024).toFixed(0)} KB`);
};
write('search.json', { ...meta(`Responses of GET /search/shows?q=… for the queries below. ${kept}`), queries: searches });
write('shows.json', { ...meta(`Responses of GET /shows/:id for the ids below. ${kept}`), shows });

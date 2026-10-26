/**
 * Lab 11 — records the TVmaze responses that showfinder-starter's fetch stub serves
 * (check/fixtures/). Run from the repo root; it needs network access:
 *
 *   node docs/web/lab-11/record-fixtures.mjs
 *
 * The self-check and offline.html answer every request from these files, so their
 * shape is the API's shape. Show objects keep only the fields the app can use, and
 * embedded episodes and cast keep only what the view renders: the files stay small
 * enough for the zip. Each file records its source, licence, retrieval date and
 * changes (CC BY-SA 4.0 asks for all four).
 *
 * TVmaze allows at least 20 calls per 10 s per IP; the recorder waits between calls.
 * Re-run it only to refresh the data, then re-run the calibration: the checks read
 * the fixtures for their expected results.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const API = 'https://api.tvmaze.com';
const OUT = 'showfinder-starter/check/fixtures';

/** Searches the checks and offline.html replay; the first three are the checks' own. */
const QUERIES = ['girls', 'gir', 'law & order', 'doctor', 'star', 'dark'];
/** Shows recorded with their episodes and cast. Other shows get empty lists. */
const DETAILS = [139, 33320, 49334, 12, 41734, 32837];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function get(pathname) {
  await sleep(700);
  const response = await fetch(API + pathname);
  if (!response.ok) throw new Error(`${pathname}: HTTP ${response.status}`);
  return response.json();
}

const pick = (object, keys) => Object.fromEntries(keys.filter((key) => key in object).map((key) => [key, object[key]]));
const place = (channel) =>
  channel && { id: channel.id, name: channel.name, country: channel.country && pick(channel.country, ['name', 'code']) };

/** The show fields the app may use; links, externals and schedule are dropped. */
const trimShow = (show) => ({
  ...pick(show, ['id', 'url', 'name', 'type', 'language', 'genres', 'status', 'runtime', 'averageRuntime', 'premiered', 'ended', 'rating']),
  network: place(show.network),
  webChannel: place(show.webChannel),
  image: show.image,
  summary: show.summary,
});
const trimEpisode = (episode) => pick(episode, ['id', 'name', 'season', 'number', 'type', 'airdate', 'runtime']);
const trimCast = ({ person, character }) => ({
  person: pick(person, ['id', 'name']),
  character: pick(character, ['id', 'name']),
});

const retrieved = new Date().toISOString().slice(0, 10);
const meta = (changes) => ({
  source: 'TVmaze API, https://www.tvmaze.com/api',
  license: 'CC BY-SA 4.0, https://creativecommons.org/licenses/by-sa/4.0/',
  retrieved,
  changes,
});

const searches = {};
for (const query of QUERIES) {
  const results = await get(`/search/shows?q=${encodeURIComponent(query)}`);
  searches[query] = results.map(({ score, show }) => ({ score, show: trimShow(show) }));
  console.log(`search ${JSON.stringify(query)}: ${results.length}`);
}

const shows = {};
for (const id of DETAILS) {
  const show = await get(`/shows/${id}?embed[]=episodes&embed[]=cast`);
  shows[id] = {
    ...trimShow(show),
    _embedded: { episodes: show._embedded.episodes.map(trimEpisode), cast: show._embedded.cast.map(trimCast) },
  };
  console.log(`show ${id} ${show.name}: ${show._embedded.episodes.length} episodes, ${show._embedded.cast.length} cast`);
}

mkdirSync(OUT, { recursive: true });
const write = (name, data) => {
  const file = path.join(OUT, name);
  writeFileSync(file, `${JSON.stringify(data, null, 1)}\n`);
  console.log(`${file}  ${(JSON.stringify(data).length / 1024).toFixed(0)} KB`);
};
write('search.json', {
  ...meta('Responses of GET /search/shows?q=… for the queries below. Show objects keep id, url, name, type, language, genres, status, runtime, averageRuntime, premiered, ended, rating, network and webChannel (id, name, country), image and summary.'),
  queries: searches,
});
write('shows.json', {
  ...meta('Responses of GET /shows/:id?embed[]=episodes&embed[]=cast. Show objects are trimmed as in search.json; episodes keep id, name, season, number, type, airdate and runtime; cast keeps person and character id and name.'),
  shows,
});

// ShowFinder checks. The number and name of each one is a rule from the assignment (C2.4 is the fourth rule of C2).
// Each check opens a fresh copy of the app, acts as a user, and decides for itself what
// "TVmaze" answers: recorded responses, a delay, an error, or a dropped connection. A failure
// explains what exactly is wrong. Expected results come from the recorded responses in check/fixtures/.
import { busy, norm, openApp, sleep, text } from './harness.js';

/** @typedef {import('./harness.js').App} App */
/** @typedef {import('./harness.js').Entry} Entry */
/** @typedef {{ id: string, group: string, title: string, run: () => Promise<void> }} Check */

export const groups = [
  { id: 'C1', title: 'C1 · Search' },
  { id: 'C2', title: 'C2 · Show page' },
  { id: 'C3', title: 'C3 · Errors' },
];

export class Fail extends Error {}

/** @returns {asserts condition} */
function expect(/** @type {unknown} */ condition, /** @type {string} */ detail) {
  if (!condition) throw new Fail(detail);
}

const GIRLS = 139;
const DERRY_GIRLS = 33320;
const LOADING = 'Loading…';
const NOT_FOUND = 'Show not found';
const SERVER = 'Could not get data from TVmaze.';
const OFFLINE = 'No connection to TVmaze.';
const RATE_WAIT = 'Too many requests to TVmaze, retrying…';
const RATE = 'Too many requests to TVmaze.';
/** A proxy or captive portal page: 200, but not JSON. */
const PORTAL = '<!doctype html><html><head><title>Wi-Fi</title></head><body><h1>Sign in to the network</h1></body></html>';
/** Technical details the user must not see (assignment, C3.10). */
const TECHNICAL = /TypeError|SyntaxError|AbortError|DOMException|Failed to fetch|NetworkError|Unexpected token|JSON|HTTP|\bstatus\b|undefined|\bnull\b|\[object|\bError\b|\b[1-5]\d\d\b|[{}<>]/;

const qOf = (/** @type {Entry | undefined} */ entry) => (entry ? new URL(entry.url).searchParams.get('q') : null);
/** Path and query string: /search/shows?q=girls. Messages are built in advance, so the entry may not exist. */
const pathOf = (/** @type {Entry | undefined} */ entry) => {
  if (!entry) return '—';
  const url = new URL(entry.url);
  return decodeURIComponent(url.pathname + url.search);
};
const isSearch = (/** @type {string} */ url) => new URL(url).pathname.replace(/\/$/, '') === '/search/shows';
const isShow = (/** @type {number} */ id) => (/** @type {string} */ url) => new RegExp(`^/shows/${id}(/|$)`).test(new URL(url).pathname);
const short = (/** @type {string} */ value) => (value.length > 90 ? `${value.slice(0, 90)}…` : value) || 'nothing';
const same = (/** @type {number[]} */ a, /** @type {number[]} */ b) => a.length === b.length && a.every((x, i) => x === b[i]);

/**
 * @param {{ search: any, shows: any }} fixtures recorded TVmaze responses
 */
export function defineChecks(fixtures) {
  const results = (/** @type {string} */ query) => fixtures.search.queries[query].map((/** @type {any} */ r) => r.show);
  const nameOf = new Map(Object.values(fixtures.search.queries).flat().map((/** @type {any} */ r) => [r.show.id, r.show.name]));
  const girls = results('girls').map((/** @type {any} */ show) => show.id);
  const gir = results('gir').map((/** @type {any} */ show) => show.id);
  const listed = (/** @type {number[]} */ ids) =>
    ids.length ? ids.slice(0, 4).map((id) => nameOf.get(id) ?? `id ${id}`).join(', ') + (ids.length > 4 ? ` … (${ids.length} in total)` : '') : 'no cards';
  const page = fixtures.shows.shows[GIRLS]._embedded;
  const seasonCount = new Set(page.episodes.map((/** @type {any} */ e) => e.season)).size;

  /** @type {Check[]} */
  const checks = [];
  const check = (/** @type {string} */ id, /** @type {string} */ title, /** @type {() => Promise<void>} */ run) =>
    checks.push({ id, group: id.slice(0, 2), title, run });

  /** An app that has already found "girls" (C1). */
  async function withResults() {
    const app = await openApp();
    await app.type('girls');
    expect(await app.until(() => same(app.ids(), girls), 2500), `after typing “girls”, #results has ${listed(app.ids())} instead of 10 shows: do C1 first`);
    return app;
  }

  /** Waits until the app sends a search with this query. */
  async function searchSent(/** @type {App} */ app, /** @type {string} */ query) {
    const sent = await app.until(() => app.searches().some((entry) => qOf(entry) === query), 1500);
    expect(sent, `after typing “${query}”, there is no search request: the input event must start the search (C1.3)`);
    return app.searches().filter((entry) => qOf(entry) === query);
  }

  /** Answers all held requests (a snapshot of the queue at this moment). */
  async function release(/** @type {Entry[]} */ entries) {
    for (const entry of entries) await entry.respond();
    await sleep(60);
  }

  /** A response for requests that match `match`, until the rule is removed or used up. */
  function answer(/** @type {App} */ app, /** @type {(url: string) => boolean} */ match, /** @type {object} */ spec, times = 99) {
    const rule = { match, spec, times };
    app.net.script.push(rule);
    return () => {
      const index = app.net.script.indexOf(rule);
      if (index !== -1) app.net.script.splice(index, 1);
    };
  }

  /** Opens a show and waits for its page. */
  async function openShown(/** @type {App} */ app, /** @type {number} */ id) {
    await app.open(id);
    const name = nameOf.get(id);
    expect(await app.until(() => app.shownTitle() === name, 2000), `after a click on the ${name} card, #details shows “${short(app.shownTitle() || text(app.details))}”: do C2.1 first`);
  }

  /** Waits until the text appears in the area. */
  const shows = (/** @type {App} */ app, /** @type {Element} */ region, /** @type {string} */ wanted, timeout = 1500) =>
    app.until(() => text(region).includes(wanted), timeout);

  /** An explanation when the area still shows "Loading…" because the app repeats the same request by itself. */
  function autoRetried(/** @type {App} */ app, /** @type {Element} */ region) {
    if (!text(region).includes(LOADING)) return '';
    const urls = (region === app.results ? app.searches() : app.api(/^\/shows\//)).map((entry) => entry.url);
    const repeats = urls.length - new Set(urls).size;
    return repeats ? `: the app repeated the request by itself (${repeats}), but only 429 is retried automatically (C3.6)` : '';
  }

  /** An error with its text and "Retry" in the area. */
  function expectError(/** @type {App} */ app, /** @type {Element} */ region, /** @type {string} */ message, /** @type {string} */ cause) {
    const where = region === app.results ? '#results' : '#details';
    const retried = message === RATE ? '' : autoRetried(app, region);
    expect(text(region).includes(message), `${cause}: ${where} shows “${short(text(region))}”, expected “${message}”${retried}`);
    expect(app.retry(region), `${cause}: ${where} has a message but no “Retry” button (template #state-error)`);
  }

  /* ---------------- C1 · Search ---------------- */

  check('C1.1', 'The request is GET https://api.tvmaze.com/search/shows?q=… via fetch: trimmed and encoded', async () => {
    const app = await openApp();
    await app.type('  Law & Order ');
    await app.until(() => app.api().length > 0 || app.probe.xhr.length > 0, 1500);
    await sleep(700);
    expect(!app.probe.xhr.length, `a request via XMLHttpRequest (${app.probe.xhr[0]}): the assignment requires the Fetch API`);
    const elsewhere = app.net.log.filter((entry) => new URL(entry.url).origin !== 'https://api.tvmaze.com' && entry.state !== 'passed');
    expect(!elsewhere.length, `a request to ${elsewhere[0]?.url}: data comes only from https://api.tvmaze.com`);
    const sent = app.api();
    expect(sent.length, 'after typing “Law & Order”, there is no request to TVmaze: the input event must start the search (C1.3)');
    const search = app.searches().at(-1);
    expect(search, `request ${pathOf(sent[0])}: search by title is GET /search/shows?q=… (TVmaze documentation, Show search)`);
    expect(search.method === 'GET', `the search was sent with the ${search.method} method, not GET`);
    const q = qOf(search);
    expect(q !== null, `request ${pathOf(search)} has no q parameter`);
    expect(q.trim() === 'Law & Order', `the API received “${q}” instead of “Law & Order”: the & character separates parameters in a query string, so the value must be encoded (encodeURIComponent or URLSearchParams, §4.2)`);
    expect(q === 'Law & Order', `the API received “${q}”: trim the spaces at the ends of the query`);
  });

  check('C1.2', 'Results are renderResults cards in the API response order; status “Found: N”', async () => {
    const app = await openApp();
    await app.type('girls');
    await searchSent(app, 'girls');
    const shown = await app.until(() => same(app.ids(), girls), 2000);
    expect(shown, `#results has ${listed(app.ids())}; expected the 10 shows from the API response, in its order: ${listed(girls)}`);
    expect(app.status() === 'Found: 10', `status “${app.status()}”, expected “Found: 10”`);
  });

  check('C1.3', 'A burst of typing sends one request, no later than 500 ms after the last keystroke', async () => {
    const app = await openApp();
    let last = 0;
    for (const part of ['g', 'gi', 'gir', 'girl', 'girls']) {
      last = app.now();
      await app.type(part);
      await sleep(50);
    }
    await app.until(() => app.searches().some((entry) => qOf(entry) === 'girls'), 1500);
    await sleep(300);
    const sent = app.searches();
    expect(sent.length, 'no request for the burst of typing “g” → “girls”: the input event must start the search');
    const queries = sent.map((entry) => `“${qOf(entry)}”`).join(', ');
    expect(sent.length === 1, `${sent.length} requests for one burst of typing (${queries}): send the request once the user stops typing (debounce)`);
    expect(qOf(sent[0]) === 'girls', `request ${queries}, but the field holds “girls”`);
    const wait = Math.round(sent[0].at - last);
    expect(wait <= 650, `the request was sent ${wait} ms after the last keystroke; the assignment says no later than 500 ms`);
  });

  check('C1.4', 'Enter searches at once, without a page reload and without a second request', async () => {
    const app = await openApp();
    await app.type('girls');
    const pressed = app.now();
    await app.submit();
    expect(!app.navigated(), 'Enter reloaded the page: handle submit and cancel the default action (preventDefault)');
    await app.until(() => app.searches().length > 0, 400);
    const first = app.searches()[0];
    expect(first, 'there is no search request after Enter');
    const wait = Math.round(first.at - pressed);
    expect(wait <= 150, `after Enter, the request was sent ${wait} ms later: Enter searches at once, without waiting`);
    await sleep(800);
    expect(!app.navigated(), 'the page reloaded after Enter');
    const sent = app.searches();
    expect(sent.length === 1, `${sent.length} requests for “girls”: after Enter, the delayed search for the same query is no longer needed`);
    expect(await app.until(() => same(app.ids(), girls), 600), `after Enter, #results has ${listed(app.ids())} instead of the “girls” results`);
  });

  check('C1.5', 'Fewer than 2 characters: no request, #results and status empty; an unfinished search is no longer shown', async () => {
    const app = await openApp();
    await app.type('g');
    await sleep(800);
    expect(!app.searches().length, `request “${qOf(app.searches()[0])}” for a single character: search from 2 characters`);
    await app.type('girls');
    expect(await app.until(() => same(app.ids(), girls), 2000), `after “girls”, #results has ${listed(app.ids())}: do C1.2 first`);
    await app.type('g');
    await sleep(800);
    expect(!app.cards().length && !text(app.results), `after the field was cut down to “g”, #results still holds: “${short(text(app.results))}”`);
    expect(!app.status(), `after the field was cut down to “g”, the status is “${app.status()}”, expected empty`);

    app.net.hold = true;
    await app.type('dark');
    expect(await app.until(() => app.held().length > 0, 1500), 'after typing “dark”, there is no search request');
    await app.type('d');
    await sleep(700);
    await release(app.held());
    expect(!app.cards().length, `the response for “dark” arrived after the field was cut down to “d”, and it was shown: ${listed(app.ids())}`);
    expect(!app.status(), `the response for “dark” arrived after the field was cut down to “d”, and the status is “${app.status()}”, not empty`);
  });

  check('C1.6', 'While the request is in flight: #results has aria-busy="true" and “Loading…”, status “Loading…”; not after the response', async () => {
    const app = await openApp();
    app.net.hold = true;
    await app.type('girls');
    expect(await app.until(() => app.held().length > 0, 1500), 'after typing “girls”, there is no search request');
    await sleep(30);
    expect(busy(app.results), `while the request is in flight, #results has aria-busy="${app.results.getAttribute('aria-busy')}", expected "true"`);
    expect(text(app.results).includes(LOADING), `while the request is in flight, #results shows “${short(text(app.results))}”, not “${LOADING}” (template #state-loading)`);
    expect(app.status() === LOADING, `while the request is in flight, the status is “${app.status()}”, expected “${LOADING}”`);
    app.net.hold = false;
    await release(app.held());
    await app.until(() => same(app.ids(), girls), 1000);
    expect(!busy(app.results), 'after the response, #results still has aria-busy="true"');
    expect(!text(app.results).includes(LOADING), `after the response, #results still shows “${LOADING}”`);
    expect(app.status() === 'Found: 10', `after the response, the status is “${app.status()}”, expected “Found: 10”`);
  });

  check('C1.7', 'An empty response (200 []) is not an error: “Nothing found for query "…"” in #results and in the status', async () => {
    const app = await openApp();
    const message = 'Nothing found for query "zzqx"';
    await app.type('zzqx');
    await searchSent(app, 'zzqx');
    await shows(app, app.results, message, 1500);
    expect(!app.cards().length, `for an empty response, #results has ${listed(app.ids())}`);
    expect(!app.retry(app.results), 'the empty result is shown as an error with “Retry”: 200 [] is a successful response');
    expect(text(app.results) === message, `#results shows “${short(text(app.results))}”, expected “${message}”`);
    expect(app.status() === message, `status “${app.status()}”, expected “${message}”`);
  });

  check('C1.8', 'A response to an older request never replaces a newer one, whatever order they arrive in', async () => {
    for (const order of ['newer first', 'older first']) {
      const app = await openApp();
      app.net.hold = true;
      await app.type('gir');
      const older = await searchSent(app, 'gir');
      await app.type('girls');
      const newer = await searchSent(app, 'girls');
      await sleep(30);
      expect(
        !app.retry(app.results) && text(app.results).includes(LOADING),
        `while “girls” is loading, #results shows “${short(text(app.results))}”, not “${LOADING}”: the aborted “gir” request is not an error (C3.9)`,
      );
      if (order === 'newer first') {
        await release(newer);
        await app.until(() => same(app.ids(), girls), 1000);
        await release(older);
        await sleep(60);
        expect(same(app.ids(), girls), `the response for “gir” arrived after the response for “girls”, and it replaced it: #results has ${listed(app.ids())}`);
      } else {
        await release(older);
        await sleep(60);
        expect(!same(app.ids(), gir), 'the response for “gir” arrived while “girls” was still loading, and it was shown, though the field already holds “girls”');
        await release(newer);
        await app.until(() => same(app.ids(), girls), 1000);
        expect(same(app.ids(), girls), `after the response for “girls”, #results has ${listed(app.ids())}`);
      }
      expect(app.status() === 'Found: 10', `after both responses, the status is “${app.status()}”, expected “Found: 10”`);
      expect(!app.retry(app.results), 'after an aborted request, #results shows an error: an abort (AbortError) is not an error (C3.9)');
    }
  });

  check('C1.9', "No preflight: GET only, no custom headers or Content-Type, no mode: 'no-cors'", async () => {
    const app = await openApp();
    await app.type('girls');
    await app.until(() => app.api().length > 0, 1500);
    await sleep(150);
    const sent = app.api();
    expect(sent.length, 'after typing “girls”, there is no request to TVmaze');
    for (const entry of sent) {
      expect(entry.mode !== 'no-cors', "mode: 'no-cors' gives an opaque response (status 0) whose body can't be read: it doesn't get around CORS, it gives up the data (§4.3)");
      expect(!entry.blocked, `the request was blocked by CORS: ${entry.blocked}. The real TVmaze answers a preflight (OPTIONS) with 405, so such a request fails in the browser (§4.3)`);
    }
  });

  /* ---------------- C2 · Show page ---------------- */

  check('C2.1', 'A click on a card shows the show page in #details via renderShow: title, episodes by season, cast', async () => {
    const app = await withResults();
    await app.open(GIRLS);
    const episodes = () => app.details.querySelectorAll('[data-episode-id]').length;
    await app.until(() => app.shownTitle() === 'Girls' && episodes() > 0, 2000);
    expect(app.showRequests(GIRLS).length, 'after a click on the Girls card, there is no show request');
    expect(app.shownTitle() === 'Girls', `after a click on the Girls card, #details shows “${short(app.shownTitle() || text(app.details))}”`);
    expect(episodes() === page.episodes.length, `the Girls page has ${episodes()} episodes, expected ${page.episodes.length}`);
    const seasons = app.details.querySelectorAll('[data-season]').length;
    expect(seasons === seasonCount, `the Girls page has ${seasons} seasons, expected ${seasonCount}`);
    const cast = app.details.querySelectorAll('[data-person-id]').length;
    expect(cast === page.cast.length, `the Girls page has ${cast} cast members, expected ${page.cast.length}`);
  });

  check('C2.2', 'All the page data is requested at once: one request with embed or parallel requests, not one after another', async () => {
    const app = await withResults();
    const before = app.net.log.length;
    app.net.hold = true;
    await app.open(GIRLS);
    expect(await app.until(() => app.held().length > 0, 1500), 'after a click on the Girls card, there is no request');
    await sleep(300);
    const first = app.held();
    /** @type {Entry[]} */
    const later = [];
    let pending = first;
    for (let round = 0; pending.length && round < 10; round += 1) {
      for (const entry of pending) {
        await entry.respond();
        await sleep(60);
      }
      pending = app.held();
      later.push(...pending);
    }
    app.net.hold = false;
    const sent = app.net.log.slice(before).filter((entry) => new URL(entry.url).origin === 'https://api.tvmaze.com');
    const strays = sent.filter((entry) => !isShow(GIRLS)(entry.url));
    expect(!strays.length, `request ${pathOf(strays[0] ?? sent[0])}: everything for the page is in /shows/:id with embed or in /shows/:id/episodes and /shows/:id/cast, without requests for single episodes or cast members`);
    const undocumented = sent.filter((entry) => !/^\/shows\/\d+(\/(episodes|cast|seasons|crew|akas|images))?$/.test(new URL(entry.url).pathname));
    expect(!undocumented.length, `request ${pathOf(undocumented[0] ?? sent[0])}: the TVmaze documentation has no such endpoint`);
    expect(!later.length, `request ${pathOf(later[0])} was sent only after the response to ${pathOf(first[0])}: send independent requests at once (Promise.all) or combine them with embed`);
    expect(sent.length <= 3, `${sent.length} requests for one page: ${sent.map(pathOf).join(', ')}`);
    expect(await app.until(() => app.shownTitle() === 'Girls', 1000), `after the responses, #details shows “${short(app.shownTitle() || text(app.details))}”, not Girls`);
  });

  check('C2.3', 'While the page loads: #details has aria-busy="true" and “Loading…”; the result list stays in place and works', async () => {
    const app = await withResults();
    app.net.hold = true;
    await app.open(GIRLS);
    expect(await app.until(() => app.held().length > 0, 1500), 'after a click on the Girls card, there is no request');
    await sleep(30);
    expect(busy(app.details), `while the page loads, #details has aria-busy="${app.details.getAttribute('aria-busy')}", expected "true"`);
    expect(text(app.details).includes(LOADING), `while the page loads, #details shows “${short(text(app.details))}”, not “${LOADING}”`);
    expect(same(app.ids(), girls), `while the page loads, #results has ${listed(app.ids())}: the search results must stay`);
    expect(!busy(app.results), 'while the show page loads, #results has aria-busy="true"');
    const disabled = app.cards().filter((card) => card.querySelector('button')?.disabled).length;
    expect(!disabled, `while the page loads, ${disabled} card buttons are disabled: the list must keep working`);
    app.net.hold = false;
    await release(app.held());
    await app.until(() => app.shownTitle() === 'Girls', 1500);
    expect(!busy(app.details), 'after the response, #details still has aria-busy="true"');
    expect(!text(app.details).includes(LOADING), `after the response, #details still shows “${LOADING}”`);
  });

  check('C2.4', 'A show loaded earlier opens without a new request', async () => {
    const app = await withResults();
    await openShown(app, GIRLS);
    await openShown(app, DERRY_GIRLS);
    const before = app.api().length;
    await app.open(GIRLS);
    await sleep(150);
    const extra = app.api().slice(before);
    expect(!extra.length, `opening Girls again sent request ${pathOf(extra[0] ?? app.api()[0])}: keep the pages already loaded (an in-memory cache)`);
    expect(app.shownTitle() === 'Girls', `after opening it again, #details shows “${short(app.shownTitle() || text(app.details))}”`);
  });

  check('C2.5', 'If another show is selected while the previous one is loading, only the last one selected is shown', async () => {
    for (const order of ['newer first', 'older first']) {
      const app = await withResults();
      app.net.hold = true;
      await app.open(GIRLS);
      expect(await app.until(() => app.held().some((entry) => isShow(GIRLS)(entry.url)), 1500), 'after a click on Girls, there is no request');
      await app.open(DERRY_GIRLS);
      expect(await app.until(() => app.held().some((entry) => isShow(DERRY_GIRLS)(entry.url)), 1500), 'after a click on Derry Girls, there is no request');
      await sleep(30);
      expect(
        !app.retry(app.details) && text(app.details).includes(LOADING),
        `while Derry Girls is loading, #details shows “${short(text(app.details))}”, not “${LOADING}”: the aborted Girls request is not an error (C3.9)`,
      );
      app.net.hold = false;
      const older = app.held().filter((entry) => isShow(GIRLS)(entry.url));
      const newer = app.held().filter((entry) => isShow(DERRY_GIRLS)(entry.url));
      if (order === 'newer first') {
        await release(newer);
        await app.until(() => app.shownTitle() === 'Derry Girls', 1000);
        await release(older);
        await sleep(60);
        expect(app.shownTitle() === 'Derry Girls', `the Girls page arrived after the Derry Girls page, and it replaced it: #details shows “${short(app.shownTitle() || text(app.details))}”`);
      } else {
        await release(older);
        await sleep(60);
        expect(app.shownTitle() !== 'Girls', 'the Girls page arrived while Derry Girls was still loading, and it was shown, though Derry Girls is selected');
        await release(newer);
        await app.until(() => app.shownTitle() === 'Derry Girls', 1000);
        expect(app.shownTitle() === 'Derry Girls', `after the response for Derry Girls, #details shows “${short(app.shownTitle() || text(app.details))}”`);
      }
      expect(!app.retry(app.details), 'after an aborted request, #details shows an error: an abort (AbortError) is not an error (C3.9)');
    }
  });

  /* ---------------- C3 · Errors ---------------- */

  check('C3.1', 'An HTTP error is not data: a 4xx/5xx response is never shown as results or “Nothing found”', async () => {
    for (const status of [500, 404]) {
      const app = await openApp();
      answer(app, isSearch, { status });
      await app.type('girls');
      await searchSent(app, 'girls');
      await sleep(400);
      const shown = `${text(app.results)} ${app.status()}`;
      expect(!app.cards().length, `the ${status} response is shown as results: ${listed(app.ids())}`);
      expect(!shown.includes('Nothing found'), `the ${status} response is shown as “Nothing found”: fetch doesn't reject its promise for 4xx and 5xx, so check response.ok (§4.1, experiment 1)`);
    }
  });

  check('C3.2', '404 for a show: “Show not found” in #details', async () => {
    const app = await withResults();
    answer(app, isShow(GIRLS), { status: 404 });
    await app.open(GIRLS);
    await shows(app, app.details, NOT_FOUND);
    expect(text(app.details).includes(NOT_FOUND), `for a 404, #details shows “${short(text(app.details))}”, expected “${NOT_FOUND}”: a 404 is not a failure, it's the answer “there is no such show”`);
  });

  check('C3.3', '5xx and a non-JSON response: “Could not get data from TVmaze.” and “Retry” (for search, in the status too)', async () => {
    for (const [spec, cause] of [[{ status: 503 }, 'for a 503 response'], [{ text: PORTAL }, 'for a 200 response with an HTML page instead of JSON']]) {
      const app = await openApp();
      answer(app, isSearch, spec);
      await app.type('girls');
      await searchSent(app, 'girls');
      await shows(app, app.results, SERVER);
      expectError(app, app.results, SERVER, `search ${cause}`);
      expect(app.status() === SERVER, `search ${cause}: status “${app.status()}”, expected “${SERVER}”`);
    }
    const app = await withResults();
    answer(app, isShow(GIRLS), { status: 500 });
    await app.open(GIRLS);
    await shows(app, app.details, SERVER);
    expectError(app, app.details, SERVER, 'show page for a 500 response');
  });

  check('C3.4', 'A network failure (fetch rejected): “No connection to TVmaze.” and “Retry”', async () => {
    const app = await openApp();
    answer(app, isSearch, { network: true });
    await app.type('girls');
    await searchSent(app, 'girls');
    await shows(app, app.results, OFFLINE);
    expectError(app, app.results, OFFLINE, 'search with no network');
    expect(app.status() === OFFLINE, `search with no network: status “${app.status()}”, expected “${OFFLINE}”`);

    const other = await withResults();
    answer(other, isShow(GIRLS), { network: true });
    await other.open(GIRLS);
    await shows(other, other.details, OFFLINE);
    expectError(other, other.details, OFFLINE, 'show page with no network');
  });

  check('C3.5', '“Retry” repeats the same request; a successful response replaces the error', async () => {
    const app = await openApp();
    answer(app, isSearch, { status: 503 }, 1);
    await app.type('girls');
    const [failed] = await searchSent(app, 'girls');
    await shows(app, app.results, SERVER);
    const retry = app.retry(app.results);
    expect(retry, `after a search error, #results has no “Retry”: “${short(text(app.results))}”`);
    retry.click();
    expect(await app.until(() => app.searches().length > 1, 1500), '“Retry” in #results did not send a new request');
    const again = app.searches().at(-1);
    expect(again?.url === failed.url, `“Retry” sent ${pathOf(again)} instead of ${pathOf(failed)}`);
    expect(await app.until(() => same(app.ids(), girls), 1500), `after a successful retry, #results has ${listed(app.ids())}`);
    expect(!app.retry(app.results) && !text(app.results).includes(SERVER), 'after a successful retry, the error is still there');

    const other = await withResults();
    answer(other, isShow(GIRLS), { status: 500 });
    await other.open(GIRLS);
    await shows(other, other.details, SERVER);
    other.net.script.length = 0;
    const button = other.retry(other.details);
    expect(button, `after a page error, #details has no “Retry”: “${short(text(other.details))}”`);
    button.click();
    expect(await other.until(() => other.shownTitle() === 'Girls', 1500), `after “Retry”, #details shows “${short(text(other.details))}”, not the Girls page`);
  });

  check('C3.6', '429: one automatic retry after 2–5 s with the status “Too many requests to TVmaze, retrying…”; a second 429 is an error', async () => {
    const app = await openApp();
    answer(app, isSearch, { status: 429 }, 1);
    await app.type('girls');
    const [first] = await searchSent(app, 'girls');
    await app.until(() => app.status() === RATE_WAIT, 800);
    expect(app.status() === RATE_WAIT, `after a 429, the status is “${app.status()}”, expected “${RATE_WAIT}”`);
    expect(busy(app.results), 'while the app waits to retry, #results must be in the loading state (aria-busy="true")');
    await app.until(() => app.searches().length > 1, 5600);
    const second = app.searches()[1];
    expect(second, 'there is no second request after a 429 (waited 5.5 s)');
    const gap = Math.round(second.at - first.at);
    expect(gap >= 1900 && gap <= 5500, `the second request was sent ${gap} ms after the 429; the assignment says after 2–5 s: the TVmaze documentation advises waiting a few seconds`);
    expect(await app.until(() => same(app.ids(), girls), 1500), `after a successful retry, #results has ${listed(app.ids())}`);

    const other = await openApp();
    answer(other, isSearch, { status: 429 }, 2);
    await other.type('girls');
    await searchSent(other, 'girls');
    expect(await other.until(() => other.searches().length > 1, 5600), 'there is no second request after a 429 (waited 5.5 s)');
    await shows(other, other.results, RATE, 1500);
    expectError(other, other.results, RATE, 'after two 429s in a row');
    expect(other.status() === RATE, `after two 429s in a row, the status is “${other.status()}”, expected “${RATE}”`);
    await sleep(5500);
    const sent = other.searches().length;
    expect(sent === 2, `after two 429s in a row, the app sent ${sent - 2} more request(s) by itself: after the second refusal, only the user retries (“Retry”)`);
  });

  check('C3.7', 'After any failure, loading is over: aria-busy removed, no “Loading…”', async () => {
    /** @type {[string, object][]} */
    const failures = [['500', { status: 500 }], ['network failure', { network: true }]];
    for (const [name, spec] of failures) {
      const app = await openApp();
      answer(app, isSearch, spec);
      await app.type('girls');
      await searchSent(app, 'girls');
      await sleep(400);
      expect(!busy(app.results), `search, ${name}: #results still has aria-busy="true"${autoRetried(app, app.results)}`);
      expect(!text(app.results).includes(LOADING) && app.status() !== LOADING, `search, ${name}: “${LOADING}” is still visible`);
    }
    for (const [name, spec] of [['404', { status: 404 }], ...failures]) {
      const app = await withResults();
      answer(app, isShow(GIRLS), /** @type {object} */ (spec));
      await app.open(GIRLS);
      await sleep(400);
      expect(!busy(app.details), `show page, ${name}: #details still has aria-busy="true"${autoRetried(app, app.details)}`);
      expect(!text(app.details).includes(LOADING), `show page, ${name}: #details still shows “${LOADING}”`);
    }
  });

  check('C3.8', 'Failed responses are not cached: opening a show again after an error sends a new request', async () => {
    const app = await withResults();
    const stop = answer(app, isShow(GIRLS), { status: 500 });
    await app.open(GIRLS);
    await shows(app, app.details, SERVER);
    stop();
    await openShown(app, DERRY_GIRLS);
    const before = app.showRequests(GIRLS).length;
    await app.open(GIRLS);
    await app.until(() => app.shownTitle() === 'Girls', 1500);
    expect(app.showRequests(GIRLS).length > before, 'after Girls failed to load, opening it again sent no request: the error went into the cache');
    expect(app.shownTitle() === 'Girls', `after opening it again, #details shows “${short(app.shownTitle() || text(app.details))}”`);
  });

  check('C3.9', 'An aborted request is not an error; the app Console has no Uncaught or Uncaught (in promise) in any scenario', async () => {
    const app = await openApp();
    app.net.hold = true;
    await app.type('gir');
    const older = await searchSent(app, 'gir');
    await app.type('girls');
    const newer = await searchSent(app, 'girls');
    app.net.hold = false;
    await release([...newer, ...older]);
    expect(await app.until(() => same(app.ids(), girls), 1500), `after “gir” → “girls”, #results has ${listed(app.ids())}`);
    expect(!app.retry(app.results), 'after an aborted search, #results shows an error');

    app.net.hold = true;
    await app.open(GIRLS);
    await app.until(() => app.held().length > 0, 1500);
    await app.open(DERRY_GIRLS);
    await app.until(() => app.held().some((entry) => isShow(DERRY_GIRLS)(entry.url)), 1500);
    app.net.hold = false;
    await release(app.held());
    await app.until(() => app.shownTitle() === 'Derry Girls', 1500);
    expect(!app.retry(app.details), 'after an aborted page load, #details shows an error');

    const stop = answer(app, isShow(GIRLS), { network: true });
    await app.open(GIRLS);
    await sleep(300);
    stop();
    answer(app, isSearch, { status: 500 });
    await app.type('dark');
    await searchSent(app, 'dark');
    await sleep(400);
    const errors = app.probe.errors;
    expect(!errors.length, `in the app Console: ${errors[0]}${errors.length > 1 ? ` (and ${errors.length - 1} more)` : ''}`);
  });

  check('C3.10', 'Messages are only the assignment texts: no TypeError, Failed to fetch, status codes, JSON or alert()', async () => {
    /** @type {[string, object][]} */
    const failures = [['network failure', { network: true }], ['500', { status: 500 }], ['HTML instead of JSON', { text: PORTAL }]];
    for (const [name, spec] of failures) {
      const app = await openApp();
      answer(app, isSearch, spec);
      await app.type('girls');
      await searchSent(app, 'girls');
      await sleep(400);
      const shown = `${text(app.results)} ${app.status()}`;
      const found = shown.match(TECHNICAL);
      expect(!found, `search, ${name}: the user sees “${short(norm(shown))}”; leave “${found?.[0]}” for the Console`);
      expect(!app.probe.alerts.length, `search, ${name}: alert(“${app.probe.alerts[0]}”): the #results area shows the error`);
    }
    const app = await withResults();
    answer(app, isShow(GIRLS), { network: true });
    await app.open(GIRLS);
    await sleep(400);
    const found = text(app.details).match(TECHNICAL);
    expect(!found, `show page, network failure: the user sees “${short(text(app.details))}”; leave “${found?.[0]}” for the Console`);
    expect(!app.probe.alerts.length, `show page, network failure: alert(“${app.probe.alerts[0]}”)`);
  });

  return checks;
}

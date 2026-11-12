/**
 * Shows TVmaze data. A provided module: don't change it.
 *
 * The module makes no requests and knows nothing about loading or errors: it only shows
 * the data it is given. The requests (src/api.js), the loading, empty-result and error states,
 * and the event handlers (src/app.js) are your part of the work.
 *
 * Both functions take objects shaped like TVmaze API responses (https://www.tvmaze.com/api):
 * missing fields (`null`) are shown as "—" or "unknown". Before showing anything, the functions
 * check their arguments and throw a TypeError with an explanation if the data has the wrong shape.
 */

/**
 * @typedef {object} Show a show: the `show` object from a TVmaze response (the fields the module shows)
 * @property {number} id
 * @property {string} name
 * @property {string} url the show page on TVmaze
 * @property {string[]} genres
 * @property {string | null} premiered premiere date, "2012-04-15"
 * @property {string | null} ended
 * @property {{ average: number | null }} rating
 * @property {{ name: string } | null} network TV channel
 * @property {{ name: string } | null} webChannel streaming service, if there is no TV channel
 * @property {{ medium: string } | null} image
 * @property {string | null} summary description: TVmaze HTML markup (`<p>`, `<b>`, `<i>`)
 */

/**
 * @typedef {object} Episode an episode, as in `/shows/:id/episodes`
 * @property {number} id
 * @property {string} name
 * @property {number} season
 * @property {number | null} number `null` for specials
 * @property {string | null} airdate
 */

/**
 * @typedef {object} CastMember an actor and a role, as in `/shows/:id/cast`
 * @property {{ id: number, name: string }} person
 * @property {{ id: number, name: string }} character
 */

/**
 * Renders the shows as button cards, one per show, in the same order, and replaces the
 * content of `container`. Each card is an `<li data-id="<id>">` with a `[data-action="open"]`
 * button. What happens after a click is up to your code.
 *
 * An empty array gives an empty list: you show the "nothing found" message.
 *
 * @param {Element} container usually `#results`
 * @param {readonly Show[]} shows shows, not the whole search response
 */
export function renderResults(container, shows) {
  requireElement('renderResults', container);
  if (!Array.isArray(shows)) {
    fail('renderResults', 'shows', 'an array of shows', shows);
  }
  shows.forEach((show, index) => requireShow('renderResults', `shows[${index}]`, show));

  const list = el('ul', { class: 'cards' });
  for (const show of shows) {
    const button = el('button', { type: 'button', class: 'card', 'data-action': 'open' }, [
      poster(show, 'card__image'),
      el('span', { class: 'card__body' }, [
        el('span', { class: 'card__title', lang: 'en' }, [show.name]),
        el('span', { class: 'card__meta' }, [meta(show)]),
        el('span', { class: 'card__genres', lang: 'en' }, [genres(show)]),
      ]),
    ]);
    list.append(el('li', { 'data-id': String(show.id) }, [button]));
  }
  container.replaceChildren(list);
}

/**
 * Shows the show page: title, details, description, episodes by season and cast, and replaces
 * the content of `container`. The page heading is an `<h2 id="show-title">` with the show title.
 *
 * @param {Element} container usually `#details`
 * @param {{ show: Show, episodes: readonly Episode[], cast: readonly CastMember[] }} data
 */
export function renderShow(container, data) {
  requireElement('renderShow', container);
  if (!data || typeof data !== 'object') {
    fail('renderShow', 'the second argument', 'an object { show, episodes, cast }', data);
  }
  const { show, episodes, cast } = data;
  requireShow('renderShow', 'show', show);
  const missing = 'Episodes and cast are separate data, not fields of the show object: see the TVmaze API documentation';
  if (!Array.isArray(episodes)) fail('renderShow', 'episodes', 'an array of episodes', episodes, missing);
  if (!Array.isArray(cast)) fail('renderShow', 'cast', 'an array of cast members', cast, missing);
  episodes.forEach((episode, index) => {
    if (!episode || typeof episode.id !== 'number' || typeof episode.season !== 'number') {
      fail('renderShow', `episodes[${index}]`, 'an episode with a numeric id and season', episode);
    }
  });
  cast.forEach((member, index) => {
    if (!member?.person || !member?.character) {
      fail('renderShow', `cast[${index}]`, 'an object { person, character }', member);
    }
  });

  const title = el('h2', { id: 'show-title', class: 'show__title', lang: 'en', tabindex: '-1' }, [show.name]);
  const head = el('div', { class: 'show__head' }, [
    poster(show, 'show__image'),
    el('div', { class: 'show__intro' }, [
      title,
      el('p', { class: 'show__meta' }, [meta(show)]),
      el('p', { class: 'show__genres', lang: 'en' }, [genres(show)]),
      el('p', {}, [el('a', { href: show.url }, ['Show page on TVmaze'])]),
    ]),
  ]);

  const article = el('article', { class: 'show', 'aria-labelledby': 'show-title' }, [
    head,
    summary(show.summary),
    el('h3', {}, ['Episodes']),
    seasons(episodes),
    el('h3', {}, ['Cast']),
    people(cast),
  ]);
  container.replaceChildren(article);
}

/* ---------------- Parts of the page ---------------- */

/** @param {Show} show @param {string} className */
function poster(show, className) {
  if (!show.image?.medium) return el('span', { class: `${className} poster--none`, 'aria-hidden': 'true' });
  return el('img', { class: className, src: show.image.medium, alt: '', width: '210', height: '295', loading: 'lazy' });
}

/** "2012–2017 · HBO · rating 6.5". */
function meta(/** @type {Show} */ show) {
  const from = show.premiered?.slice(0, 4);
  const to = show.ended?.slice(0, 4);
  const years = !from ? 'year unknown' : !to ? `since ${from}` : from === to ? from : `${from}–${to}`;
  const channel = show.network?.name ?? show.webChannel?.name ?? '—';
  const rating = show.rating?.average ?? '—';
  return `${years} · ${channel} · rating ${rating}`;
}

const genres = (/** @type {Show} */ show) => (show.genres?.length ? show.genres.join(', ') : '—');

/** The TVmaze description is HTML. An inert document parses it, and only the text reaches the page. */
function summary(/** @type {string | null} */ html) {
  const box = el('div', { class: 'show__summary', lang: 'en' });
  const doc = new DOMParser().parseFromString(html ?? '', 'text/html');
  const paragraphs = [...doc.body.querySelectorAll('p')];
  const blocks = paragraphs.length ? paragraphs : [doc.body];
  const texts = blocks.map((block) => block.textContent?.trim() ?? '').filter(Boolean);
  if (!texts.length) box.append(el('p', { lang: 'en' }, ['No description.']));
  for (const text of texts) box.append(el('p', {}, [text]));
  return box;
}

/** Episodes by season: each season is a <details data-season>. */
function seasons(/** @type {readonly Episode[]} */ episodes) {
  if (!episodes.length) return el('p', { class: 'empty' }, ['No episodes.']);
  /** @type {Map<number, Episode[]>} */
  const bySeason = new Map();
  for (const episode of episodes) {
    bySeason.set(episode.season, [...(bySeason.get(episode.season) ?? []), episode]);
  }
  const wrap = el('div', { class: 'seasons' });
  for (const [season, list] of [...bySeason].sort(([a], [b]) => a - b)) {
    const items = list.map((episode) =>
      el('li', { class: 'episode', 'data-episode-id': String(episode.id) }, [
        el('span', { class: 'episode__code' }, [code(episode)]),
        ' ',
        el('span', { lang: 'en' }, [episode.name || '—']),
        ' ',
        el('span', { class: 'episode__date' }, [date(episode.airdate)]),
      ]),
    );
    wrap.append(
      el('details', { class: 'season', 'data-season': String(season) }, [
        el('summary', {}, [`Season ${season} · ${count(list.length)}`]),
        el('ol', { class: 'episodes' }, items),
      ]),
    );
  }
  return wrap;
}

function people(/** @type {readonly CastMember[]} */ cast) {
  if (!cast.length) return el('p', { class: 'empty' }, ['No cast.']);
  return el(
    'ul',
    { class: 'cast' },
    cast.map(({ person, character }) =>
      el('li', { 'data-person-id': String(person.id) }, [
        el('span', { lang: 'en' }, [person.name]),
        ' — ',
        el('span', { class: 'cast__role', lang: 'en' }, [character.name]),
      ]),
    ),
  );
}

const pad = (/** @type {number} */ n) => String(n).padStart(2, '0');
const code = (/** @type {Episode} */ e) => (e.number === null ? `S${pad(e.season)} · special` : `S${pad(e.season)}E${pad(e.number)}`);
const date = (/** @type {string | null} */ iso) => (iso ? iso.split('-').reverse().join('.') : 'date unknown');

/** "1 episode", "10 episodes". */
function count(/** @type {number} */ n) {
  return n === 1 ? `${n} episode` : `${n} episodes`;
}

/* ---------------- Argument checks ---------------- */

function requireElement(/** @type {string} */ fn, /** @type {unknown} */ container) {
  if (!(container instanceof Element)) {
    fail(fn, 'container', 'a page element, for example document.querySelector(\'#results\')', container);
  }
}

function requireShow(/** @type {string} */ fn, /** @type {string} */ name, /** @type {any} */ show) {
  if (show && typeof show === 'object' && 'show' in show && 'score' in show) {
    fail(fn, name, 'a show', show, 'This is an item of the search response { score, show }: the show is in its show field');
  }
  if (!show || typeof show.id !== 'number' || typeof show.name !== 'string') {
    fail(fn, name, 'a show with a numeric id and a name', show);
  }
}

/**
 * @param {string} fn @param {string} name @param {string} expected @param {unknown} value
 * @param {string} [hint]
 * @returns {never}
 */
function fail(fn, name, expected, value, hint) {
  throw new TypeError(`${fn}: ${name} must be ${expected}, got ${describe(value)}.${hint ? ` ${hint}.` : ''}`);
}

/** In short: the type and the start of the value. */
function describe(/** @type {unknown} */ value) {
  if (value === null || value === undefined) return String(value);
  if (Array.isArray(value)) return `an array of ${value.length} items`;
  if (typeof value !== 'object') return `${JSON.stringify(value)} (${typeof value})`;
  if (value instanceof Element) return `<${value.tagName.toLowerCase()}>`;
  const text = JSON.stringify(value) ?? String(value);
  return `an object ${text.length > 80 ? `${text.slice(0, 80)}…` : text}`;
}

/**
 * An element with attributes and children; strings become text nodes.
 * @param {string} tag
 * @param {Record<string, string>} [attrs]
 * @param {(Node | string)[]} [children]
 */
function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, value);
  node.append(...children);
  return node;
}

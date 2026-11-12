/**
 * Data and state of the “My Watchlist” app. A provided module: do not change it.
 *
 * The module knows nothing about the DOM. It keeps the state and returns data; showing them on
 * the page and wiring up events is your part of the work (render.js, list.js, filters.js, details.js).
 * The state lives in memory only: after a page reload, the watchlist and notes are empty again.
 *
 * You can read `watchlist` and `notes` directly (`watchlist.has(id)`, `notes.get(id)`), but
 * change them only through the functions below: they check their arguments and throw an error
 * with an explanation if something is wrong.
 */
import data from '../data/shows.json' with { type: 'json' };

/**
 * @typedef {object} Show
 * @property {number} id
 * @property {string} name
 * @property {number | null} year premiere year
 * @property {number | null} rating average TVmaze viewer rating
 * @property {number | null} runtime episode length, min
 * @property {string | null} network
 * @property {readonly string[]} genres may be empty
 * @property {string} summary description: TVmaze HTML markup (`<p>`, `<b>`, `<i>`)
 * @property {string} url the show's page on TVmaze
 */

/**
 * @typedef {object} Note my rating and note for a show
 * @property {number} rating a whole number from 1 to 10
 * @property {string} text may be an empty string
 */

/**
 * @typedef {object} Filters
 * @property {string} [query] part of the title; case and leading or trailing spaces are ignored
 * @property {string} [genre] the exact genre name; an empty string means all genres
 * @property {boolean} [mine] only the shows in my watchlist
 */

/** All shows in data file order. The array and its records are frozen. @type {readonly Show[]} */
export const shows = Object.freeze(
  data.shows.map((show) => Object.freeze({ ...show, genres: Object.freeze([...show.genres]) })),
);

/** Ids of the shows in my watchlist. Change it only through toggle(). @type {ReadonlySet<number>} */
export const watchlist = new Set();

/** My ratings and notes by show id. Change them only through saveNote() and removeNote(). @type {ReadonlyMap<number, Note>} */
export const notes = new Map();

/** @param {unknown} value */
const describe = (value) => `${JSON.stringify(value) ?? String(value)} (${typeof value})`;

/**
 * The show with this id. Throws a TypeError if there is no such show, for example when the id
 * is passed as a string: '82' and 82 are different values.
 *
 * @param {number} id
 * @returns {Show}
 */
export function getShow(id) {
  const show = shows.find((item) => item.id === id);
  if (!show) throw new TypeError(`No show with id ${describe(id)}`);
  return show;
}

/**
 * The shows that match every filter given, in data file order. A field that isn't given filters
 * nothing out, so visibleShows() returns every show.
 *
 * @param {Filters} [filters]
 * @returns {Show[]} a new array
 */
export function visibleShows({ query, genre, mine } = {}) {
  const needle = (query ?? '').trim().toLowerCase();
  return shows.filter(
    (show) =>
      (!needle || show.name.toLowerCase().includes(needle)) &&
      (!genre || show.genres.includes(genre)) &&
      (!mine || watchlist.has(show.id)),
  );
}

/**
 * Adds the show to my watchlist, or removes it if it is already there.
 *
 * @param {number} id
 * @returns {boolean} true if the show is in the watchlist after the call
 */
export function toggle(id) {
  getShow(id);
  if (watchlist.has(id)) {
    watchlist.delete(id);
    return false;
  }
  watchlist.add(id);
  return true;
}

/**
 * Saves my rating and note for the show, replacing any previous ones.
 *
 * @param {number} id
 * @param {Note} note `rating` is a number (not the string from the form field), whole, from 1 to 10
 */
export function saveNote(id, { rating, text }) {
  getShow(id);
  if (typeof rating !== 'number') throw new TypeError(`The rating must be a number, got ${describe(rating)}`);
  if (!Number.isInteger(rating) || rating < 1 || rating > 10) {
    throw new RangeError(`The rating must be a whole number from 1 to 10, got ${describe(rating)}`);
  }
  if (typeof text !== 'string') throw new TypeError(`The note must be a string, got ${describe(text)}`);
  notes.set(id, Object.freeze({ rating, text }));
}

/**
 * Removes my rating and note for the show.
 *
 * @param {number} id
 * @returns {boolean} true if there was a note
 */
export function removeNote(id) {
  getShow(id);
  return notes.delete(id);
}

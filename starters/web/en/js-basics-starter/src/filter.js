/** @typedef {import('./normalize.js').Show} Show */

/**
 * @typedef {object} FilterOptions
 * @property {string | null} [query] partial name query
 * @property {string | null} [genre] genre
 * @property {number | null} [minRating] minimum rating
 */

/**
 * C2. Returns shows that match all specified filter options.
 * Specification — assignment brief, C2.
 *
 * @param {Show[]} shows
 * @param {FilterOptions} [options]
 * @returns {Show[]}
 */
export function filterShows(shows, options) {
  throw new Error('Not implemented');
}

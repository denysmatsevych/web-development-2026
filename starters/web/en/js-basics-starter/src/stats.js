/** @typedef {import('./normalize.js').Show} Show */

/**
 * @typedef {object} GenreStats
 * @property {number} count how many shows have this genre
 * @property {number | null} averageRating average rating of these shows
 */

/**
 * C4. Computes statistics for each genre.
 * Specification — assignment brief, C4.
 *
 * @param {Show[]} shows
 * @returns {Record<string, GenreStats>} key — genre name
 */
export function genreStats(shows) {
  throw new Error('Not implemented');
}

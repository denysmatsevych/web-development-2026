/**
 * Requests to the TVmaze API: https://www.tvmaze.com/api. Which endpoints, which responses and errors:
 * assignment, §3.2 and §4.
 */

/** The API address. */
export const API = 'https://api.tvmaze.com';

/**
 * C1. Searches shows by title. Returns an array of shows (show objects) in the order of the API
 * response: what renderResults from view.js takes.
 *
 * @param {string} query
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<object[]>}
 */
export async function searchShows(query, { signal } = {}) {
  // TODO C1
}

/**
 * C2. Loads a show with its episodes and cast. Returns { show, episodes, cast }: what
 * renderShow from view.js takes.
 *
 * @param {number} id
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<{ show: object, episodes: object[], cast: object[] }>}
 */
export async function getShow(id, { signal } = {}) {
  // TODO C2
}

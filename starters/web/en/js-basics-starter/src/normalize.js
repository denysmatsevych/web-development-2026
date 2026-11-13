/**
 * @typedef {object} RawShow Record from `data/shows.json` in TVmaze format.
 * @property {number} id
 * @property {string} name
 * @property {string[]} [genres]
 * @property {number | null} [runtime] episode runtime, minutes
 * @property {string | null} [premiered] premiere date, "YYYY-MM-DD"
 * @property {{ average: number | null } | null} [rating]
 * @property {{ id: number, name: string } | null} [network]
 */

/**
 * @typedef {object} Show Show record after normalizeShow() — used by C2–C4.
 * @property {number} id
 * @property {string} name
 * @property {number | null} year premiere year
 * @property {number | null} rating average audience rating
 * @property {number | null} runtime episode runtime, minutes
 * @property {string | null} network broadcast network name
 * @property {string[]} genres
 */

/**
 * C1. Transforms a TVmaze record into {@link Show}.
 * Specification — assignment brief, C1.
 *
 * @param {RawShow} raw
 * @returns {Show}
 */
export function normalizeShow(raw) {
  throw new Error('Not implemented');
}

/**
 * T2 · Requests to TVmaze API. Written by hand: assignment, §4, T2.
 *
 * Function and parameter names are already provided. Parameter and return types, the HttpError
 * class, and function bodies are your responsibility. While a parameter lacks a type, the
 * compiler reports "implicitly has an 'any' type". Narrow network data with checks (typeof, in,
 * Array.isArray), not with the `as` assertion (assignment, §5).
 */

/** API URL. */
export const API = 'https://api.tvmaze.com';

/** T2.1 · HTTP error: server responded, but with status outside 200–299. */
export class HttpError extends Error {
  // TODO T2.1: status field and constructor
}

/** T2.2 · GET request; returns parsed JSON response body. */
export async function getJson(url) {
  throw new Error('Not implemented');
}

/** T2.3 · Whether value is a show (type guard). */
export function isShow(value) {
  throw new Error('Not implemented');
}

/** T2.3 · Whether value is a search result element (type guard). */
export function isSearchResult(value) {
  throw new Error('Not implemented');
}

/** T2.4 · Search shows by title. */
export async function searchShows(query) {
  throw new Error('Not implemented');
}

/** T2.5 · Show by id. */
export async function getShow(id) {
  throw new Error('Not implemented');
}

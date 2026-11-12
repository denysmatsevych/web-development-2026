/**
 * ShowFinder behavior: search (C1), the show page (C2), errors and retries (C3).
 * This is where the event handlers go, the life cycle of each request, and the states of the
 * #results and #details areas: loading, result, empty result, error. The spec: assignment, §3–4.
 */
import { getShow, searchShows } from './api.js';
import { renderResults, renderShow } from './view.js';

/** Wires up the #search form and the #results and #details areas. main.js calls it once. */
export function initApp() {
  // TODO C1–C3
}

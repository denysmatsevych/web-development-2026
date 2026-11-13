/**
 * Type checks for `npm run typecheck`. Do not modify this file.
 *
 * This code is never executed: it is only read by the compiler. Each block is labelled with an
 * assignment rule. An error on a line within a block indicates that your type or function signature violates that rule.
 *
 * Conversely, a line under `// @ts-expect-error` must produce a compiler error: this verifies that the type does not
 * accept extraneous values. If your type is too wide (for example, `string | number` instead of `number`)
 * and no error occurs, the compiler reports "Unused '@ts-expect-error' directive".
 */
import type { SearchResult, Show } from '../src/types.ts';
import type { ViewState } from '../src/state.ts';
import { HttpError, getJson, getShow, isSearchResult, isShow, searchShows } from '../src/api.ts';
import { errorMessage, messageFor } from '../src/state.ts';
// app and view are imported with the .js extension: prior to migration (T4) these are JavaScript files, and after it —
// TypeScript; the compiler resolves both. It infers types for JavaScript files automatically (any).
import { loadSearch, loadShow, start } from '../src/app.js';
import { showMeta } from '../src/view.js';
import search from './fixtures/search.json' with { type: 'json' };
import shows from './fixtures/shows.json' with { type: 'json' };

declare const show: Show;
declare const result: SearchResult;

/* ---------------- T1 · API response types ---------------- */

// T1.1 · id is a number; name and url are strings; genres is an array of strings
const id: number = show.id;
const name: string = show.name;
const url: string = show.url;
const genres: readonly string[] = show.genres;
// @ts-expect-error T1.1 · id is not a string
const idAsString: Show['id'] = '139';
// @ts-expect-error T1.1 · genres is an array, not a string
const genresAsString: Show['genres'] = 'Drama';

// T1.2 · image, summary, premiered, and rating.average may be null
const noImage: Show['image'] = null;
const noSummary: Show['summary'] = null;
const noPremiered: Show['premiered'] = null;
const noRating: Show['rating']['average'] = null;
// T1.2 · when not null, image has medium, summary and premiered are strings, average is a number
const poster: string | undefined = show.image?.medium;
const summary: string | null = show.summary;
const premiered: string | null = show.premiered;
const rating: number | null = show.rating.average;
// @ts-expect-error T1.2 · name cannot be null
const noName: Show['name'] = null;

// T1.3 · SearchResult — { score: number; show: Show }
const score: number = result.score;
const found: Show = result.show;

// T1.4 · recorded TVmaze responses (check/fixtures/) satisfy your types
const girls: readonly SearchResult[] = search.queries.girls;
const lawAndOrder: readonly SearchResult[] = search.queries['law & order'];
const kitchen: readonly SearchResult[] = search.queries.kitchen;
const pilot: readonly SearchResult[] = search.queries.pilot;
const show139: Show = shows.shows['139'];
const show41734: Show = shows.shows['41734'];
const show45962: Show = shows.shows['45962'];

/* ---------------- T2 · Requests ---------------- */

// T2.1 · HttpError — Error with readonly status: number property
const httpError: Error = new HttpError(404);
const status: number = new HttpError(404).status;
// @ts-expect-error T2.1 · status is readonly
new HttpError(404).status = 500;

// T2.2–T2.5 · function signatures (rule number at the end of the line)
const getJsonType: (url: string) => Promise<unknown> = getJson; // T2.2
const isShowType: (value: unknown) => value is Show = isShow; // T2.3
const isSearchResultType: (value: unknown) => value is SearchResult = isSearchResult; // T2.3
const searchShowsType: (query: string) => Promise<Show[]> = searchShows; // T2.4
const getShowType: (id: number) => Promise<Show> = getShow; // T2.5

async function honestResults(): Promise<void> {
  // @ts-expect-error T2.2 · getJson returns unknown, not any: property cannot be read without narrowing
  (await getJson('https://api.tvmaze.com/shows/139')).name;
  // @ts-expect-error T2.4 · searchShows returns Show[], not any[]: show has no score property
  (await searchShows('girls'))[0]?.score;
  // @ts-expect-error T2.5 · getShow returns Show, not any: show has no score property
  (await getShow(139)).score;
}

/* ---------------- T3 · States and messages ---------------- */

// T3.1 · ViewState — six states, each with its own properties
const states: ViewState[] = [
  { status: 'idle' },
  { status: 'loading' },
  { status: 'results', query: 'girls', shows: [show] },
  { status: 'empty', query: 'qqqzzz' },
  { status: 'show', show },
  { status: 'error', message: 'Network unavailable. Check your connection.' },
];
// @ts-expect-error T3.1 · results state has shows
const resultsWithoutShows: ViewState = { status: 'results', query: 'girls' };
// @ts-expect-error T3.1 · loading state does not have shows
const loadingWithShows: ViewState = { status: 'loading', shows: [] };
// @ts-expect-error T3.1 · message in error state is a string
const errorWithNumber: ViewState = { status: 'error', message: 404 };
// @ts-expect-error T3.1 · done state does not exist
const unknownStatus: ViewState = { status: 'done' };

// T3.1 · checking status property narrows state to one of the six
function narrow(state: ViewState): void {
  if (state.status === 'results') {
    const list: readonly Show[] = state.shows;
  }
  if (state.status === 'show') {
    const opened: Show = state.show;
  }
  if (state.status === 'error') {
    const text: string = state.message;
  }
}

// T3.2–T3.3 · function signatures (rule number at the end of the line)
const errorMessageType: (err: unknown) => string = errorMessage; // T3.2
const messageForType: (state: ViewState) => string = messageFor; // T3.3

/* ---------------- T4 · Migration ---------------- */

// T4.3–T4.7 · function signatures (rule number at the end of the line)
const loadSearchType: (query: string, setState: (state: ViewState) => void) => Promise<void> = loadSearch; // T4.3
const loadShowType: (id: number, setState: (state: ViewState) => void) => Promise<void> = loadShow; // T4.5
const showMetaType: (show: Show) => string = showMeta; // T4.6
const startType: () => void = start; // T4.7

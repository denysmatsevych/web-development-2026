// Entry point of “My Watchlist”: renders the list and wires up the event handlers. Each module in
// src/ belongs to its own challenge; what each function must do is in its comment and in the assignment.
import { initDetails } from './details.js';
import { initFilters, readFilters } from './filters.js';
import { initList } from './list.js';
import { renderShows } from './render.js';
import { visibleShows } from './state.js';

/** Re-renders the list for the current values of the filters form. */
function refresh() {
  renderShows(visibleShows(readFilters()));
}

refresh();
initList(refresh);
initFilters(refresh);
initDetails(refresh);

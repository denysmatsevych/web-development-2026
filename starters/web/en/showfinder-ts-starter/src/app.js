/**
 * ShowFinder behavior: search, show page, page states (assignment, §3.4).
 * JavaScript module: migrated to TypeScript by an AI agent in T4. Do not modify prior to T4.
 */
import { API, searchShows } from './api.ts';
import { pageElements } from './dom.js';
import { errorMessage, messageFor } from './state.ts';
import { renderResults, renderShow, renderStatus } from './view.js';

/** Search: loading state, then results, empty, or error. Passes each state to setState. */
export async function loadSearch(query, setState) {
  const trimmed = query.trim();
  if (!trimmed) {
    setState({ status: 'idle' });
    return;
  }
  setState({ status: 'loading' });
  try {
    const shows = await searchShows(trimmed);
    if (shows.length) setState({ status: 'results', query: trimmed, shows });
    else setState({ status: 'empty', q: trimmed });
  } catch (err) {
    setState({ status: 'error', message: err.message });
  }
}

/** Show page: loading state, then show or error. */
export async function loadShow(id, setState) {
  setState({ status: 'loading' });
  try {
    const show = await fetch(`${API}/shows/${id}`).then((response) => response.json());
    setState({ status: 'show', show });
  } catch (err) {
    setState({ status: 'error', message: errorMessage(err) });
  }
}

/** Connects the form and cards to the page. Called by main.js. */
export function start() {
  const page = pageElements();

  function render(state) {
    renderStatus(page.status, messageFor(state), state.status);
    if (state.status === 'results') renderResults(page.content, state.shows);
    else if (state.status === 'show') renderShow(page.content, state.show);
    else page.content.replaceChildren();
  }

  page.form.addEventListener('submit', (event) => {
    event.preventDefault();
    loadSearch(page.input.value, render);
  });

  page.content.addEventListener('click', (event) => {
    const card = event.target.closest('button[data-id]');
    if (card) loadShow(card.dataset.id, render);
  });

  render({ status: 'idle' });
}

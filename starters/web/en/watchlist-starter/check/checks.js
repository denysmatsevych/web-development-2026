// The “My Watchlist” checks. The number and title of each one are a rule from the assignment (C2.4 is
// the fourth rule of C2). Each check opens a fresh copy of the app and acts like a user; a failure
// explains what exactly is wrong. The data for the expected results comes from data/shows.json.
import { accessibleName, describe, norm, openApp, sleep, visibleLabel } from './harness.js';

/** @typedef {import('./harness.js').App} App */
/** @typedef {{ id: number, name: string, genres: string[], summary: string, url: string }} Show */
/** @typedef {{ id: string, group: string, title: string, run: () => Promise<void> }} Check */

export const groups = [
  { id: 'C1', title: 'C1 · Cards' },
  { id: 'C2', title: 'C2 · Card buttons' },
  { id: 'C3', title: 'C3 · Filters' },
  { id: 'C4', title: 'C4 · Details dialog and note' },
];

export class Fail extends Error {}

/** @returns {asserts condition} */
function expect(/** @type {unknown} */ condition, /** @type {string} */ detail) {
  if (!condition) throw new Fail(detail);
}

/** @template T @param {T | null | undefined} value @returns {T} */
function need(value, /** @type {string} */ detail) {
  if (value === null || value === undefined) throw new Fail(detail);
  return value;
}

const BREAKING_BAD = 169;
const DA_VINCI = 197;
const TRUE_DETECTIVE = 5; // two summary paragraphs, with <b> and <i> in them
const UTOPIA = 153; // no rating and no genres
const HOSTILE = '<img src="x" onerror="__check.xss++"><b data-probe="1">Test</b>';

/** @param {{ shows: Show[] }} data */
export function defineChecks(data) {
  const shows = data.shows;
  const total = shows.length;
  const byId = new Map(shows.map((show) => [show.id, show]));
  const nameOf = (/** @type {number | string} */ id) => byId.get(Number(id))?.name ?? `id ${id}`;

  /** ids of the shows that should be on screen, as strings, as in data-id. */
  const expected = ({ query = '', genre = '', mine = /** @type {number[] | null} */ (null) } = {}) => {
    const needle = query.trim().toLowerCase();
    return shows
      .filter((show) => !needle || show.name.toLowerCase().includes(needle))
      .filter((show) => !genre || show.genres.includes(genre))
      .filter((show) => !mine || mine.includes(show.id))
      .map((show) => String(show.id));
  };
  const found = (/** @type {number} */ count) => (count ? `Found: ${count} of ${total}` : 'Nothing found');
  const same = (/** @type {string[]} */ a, /** @type {string[]} */ b) => a.length === b.length && a.every((x, i) => x === b[i]);
  const listed = (/** @type {string[]} */ ids) =>
    ids.length ? ids.slice(0, 4).map(nameOf).join(', ') + (ids.length > 4 ? ` … (${ids.length} in all)` : '') : 'none';

  /** An app that already has cards (C1). */
  async function withCards(/** @type {{ data?: unknown }} */ options = {}) {
    const app = await openApp(options);
    expect(app.cards().length > 0, 'there are no <li data-id> cards in #results: do C1 first');
    return app;
  }

  const toggleOf = (/** @type {App} */ app, /** @type {number} */ id) =>
    need(app.button(id, 'toggle'), `the ${nameOf(id)} card has no [data-action="toggle"] button`);
  const detailsOf = (/** @type {App} */ app, /** @type {number} */ id) =>
    need(app.button(id, 'details'), `the ${nameOf(id)} card has no [data-action="details"] button`);
  const pressed = (/** @type {App} */ app, /** @type {number} */ id) => app.button(id, 'toggle')?.getAttribute('aria-pressed');

  /** Focus moves right away, in the same handler, not from a timer (assignment, §5). */
  async function focusedDirectly(/** @type {App} */ app) {
    await sleep(35); // deferred callbacks, requestAnimationFrame included, get time to run
    const via = app.probe.delayedFocus[0];
    expect(!via, `focus is moved by a deferred ${via}() callback: until then focus is elsewhere, usually on <body>. The assignment does not allow timers (§5): move focus right away, in the same handler`);
  }

  const filters = (/** @type {App} */ app) => ({
    form: /** @type {HTMLFormElement} */ (need(app.$('#filters'), 'there is no #filters form')),
    query: need(app.field('#filters', 'query'), 'the #filters form has no name="query" field'),
    genre: need(app.field('#filters', 'genre'), 'the #filters form has no name="genre" field'),
    mine: need(app.field('#filters', 'mine'), 'the #filters form has no name="mine" field'),
  });

  /** Opens a show's “Details” and returns the #details dialog. */
  async function openDetails(/** @type {App} */ app, /** @type {number} */ id) {
    await app.press(detailsOf(app, id));
    const dialog = /** @type {HTMLDialogElement} */ (need(app.$('dialog#details'), 'there is no <dialog id="details"> element'));
    expect(dialog.open, `after “Details” on the ${nameOf(id)} card, the #details dialog is not open`);
    return dialog;
  }

  const note = (/** @type {App} */ app) => ({
    form: /** @type {HTMLFormElement} */ (need(app.$('#note-form'), 'there is no #note-form form')),
    rating: /** @type {HTMLInputElement} */ (need(app.field('#note-form', 'rating'), 'the #note-form form has no name="rating" field')),
    text: /** @type {HTMLTextAreaElement} */ (need(app.field('#note-form', 'note'), 'the #note-form form has no name="note" field')),
    save: need(app.buttonByText(app.$('#note-form'), 'Save'), 'the #note-form form has no “Save” button'),
    cancel: need(app.buttonByText(app.$('#details'), 'Cancel'), 'the dialog has no “Cancel” button'),
  });

  /** Texts of the elements the field's aria-describedby points to, visible ones only. */
  function described(/** @type {Element} */ field) {
    const doc = field.ownerDocument;
    return norm(field.getAttribute('aria-describedby'))
      .split(' ')
      .filter(Boolean)
      .map((id) => doc.getElementById(id))
      .filter((el) => el && el.getClientRects().length > 0 && el.getBoundingClientRect().width > 1)
      .map((el) => norm(el?.textContent))
      .filter(Boolean);
  }

  /** TVmaze summary paragraphs as text, parsed in an inert document, with nothing run. */
  const paragraphs = (/** @type {string} */ html) =>
    [...new DOMParser().parseFromString(html, 'text/html').body.children].map((p) => norm(p.textContent)).filter(Boolean);

  /** @type {Check[]} */
  const checks = [];
  const check = (/** @type {string} */ id, /** @type {string} */ title, /** @type {() => Promise<void>} */ run) =>
    checks.push({ id, group: id.slice(0, 2), title, run });

  /* ---------------- C1 · Cards ---------------- */

  check('C1.1', `On load, ${total} cards from shows in src/state.js: each a clone of the #show-card template, <li data-id> in #results, in data order`, async () => {
    const app = await openApp();
    expect(!app.fetchedData(), 'the app loads data/shows.json itself (fetch): the data comes only from shows in src/state.js, without fetch (assignment, §5)');
    const ids = app.ids();
    expect(ids.length === total, `#results has ${ids.length} <li data-id> cards, expected ${total}`);
    const order = shows.map((show) => String(show.id));
    expect(same(ids, order), `card order: ${listed(ids)}; expected: ${listed(order)}`);
    const template = /** @type {HTMLTemplateElement | null} */ (app.$('template#show-card'));
    const root = need(template?.content.firstElementChild, 'index.html has no <template id="show-card"> template');
    const pattern = [root, ...root.querySelectorAll('*')].map((el) => ({ tag: el.tagName, classes: [...el.classList] }));
    for (const card of app.cards()) {
      const elements = [card, ...card.querySelectorAll('*')];
      let at = 0;
      for (const el of elements) {
        const want = pattern[at];
        if (want && el.tagName === want.tag && want.classes.every((name) => el.classList.contains(name))) at += 1;
      }
      const missing = pattern[at];
      expect(!missing, `the ${nameOf(card.dataset.id ?? '')} card lacks the template element <${missing?.tag.toLowerCase()}${missing?.classes.length ? ` class="${missing.classes.join(' ')}"` : ''}>: the card was not built from #show-card`);
    }
  });

  check('C1.2', 'The card shows the title, year, comma-separated genres and rating; missing data is “—”; null, undefined or NaN never shows', async () => {
    const app = await withCards();
    const bb = need(app.card(BREAKING_BAD), `there is no ${nameOf(BREAKING_BAD)} card (data-id="${BREAKING_BAD}")`);
    const text = norm(bb.innerText);
    for (const part of ['Breaking Bad', '2008', 'Drama, Crime, Thriller', '9.2']) {
      expect(text.includes(part), `the Breaking Bad card has no “${part}”. Visible text: “${text}”`);
    }
    const utopia = norm(need(app.card(UTOPIA), `there is no Utopia card (data-id="${UTOPIA}")`).innerText);
    expect((utopia.match(/—/g) ?? []).length >= 2, `Utopia has neither a rating nor genres: both must be “—”. Visible text: “${utopia}”`);
    for (const card of app.cards()) {
      const word = card.innerText.match(/\b(null|undefined|NaN)\b/)?.[0];
      expect(!word, `the ${nameOf(card.dataset.id ?? '')} card shows “${word}”: “${norm(card.innerText)}”`);
    }
  });

  check('C1.3', 'Data enters the DOM only as text or attribute values: markup in a title stays text', async () => {
    const app = await withCards({
      data: { ...data, shows: [...shows, { ...shows[0], id: 9001, name: HOSTILE, genres: ['Drama'] }] },
    });
    await sleep(300);
    const card = need(app.card(9001), 'there is no card for the show with data-id="9001" (its title is HTML markup)');
    const created = app.list?.querySelector('img, [data-probe]');
    expect(!created, `the show title became the element ${describe(created)}: the data was inserted as HTML (innerHTML)`);
    expect(app.probe.xss === 0, `the onerror handler from the show title ran: that is XSS`);
    expect(norm(card.innerText).includes(HOSTILE), `the title is not shown as text. Visible card text: “${norm(card.innerText)}”`);
  });

  check('C1.4', '“Da Vinci\'s Demons”: the full title on the card and in the names of both its buttons', async () => {
    const app = await withCards();
    const card = need(app.card(DA_VINCI), `there is no Da Vinci's Demons card (data-id="${DA_VINCI}")`);
    const name = "Da Vinci's Demons";
    expect(norm(card.innerText).includes(name), `the card does not show “${name}”: “${norm(card.innerText)}”`);
    for (const action of /** @type {const} */ (['toggle', 'details'])) {
      const accName = accessibleName(need(app.button(DA_VINCI, action), `the card has no [data-action="${action}"] button`));
      expect(accName.includes(name), `the name of the [data-action="${action}"] button is “${accName}”: the apostrophe cut the title short`);
    }
  });

  check('C1.5', 'The name of each button contains its visible text and the show title: “Add to list: Breaking Bad”, “Details about Breaking Bad”', async () => {
    const app = await withCards();
    for (const card of app.cards()) {
      const name = nameOf(card.dataset.id ?? '');
      for (const action of ['toggle', 'details']) {
        const button = need(card.querySelector(`[data-action="${action}"]`), `the ${name} card has no [data-action="${action}"] button`);
        const accName = accessibleName(button);
        const label = visibleLabel(button);
        expect(accName.toLowerCase().includes(name.toLowerCase()), `the “${label}” button on the ${name} card is named “${accName}”, without the show title: ${total} identical buttons cannot be told apart`);
        expect(accName.toLowerCase().includes(label.toLowerCase()), `the name “${accName}” does not contain the visible text of the button, “${label}” (WCAG 2.5.3)`);
      }
    }
  });

  check('C1.6', `The status line is the #status element with role="status", in the HTML from the start; only its text changes: “Found: ${total} of ${total}”`, async () => {
    const app = await openApp();
    const initial = need(app.probe.initialStatus, 'index.html has no element with role="status"');
    expect(initial.isConnected, `the status element from the HTML was removed or replaced with a new one (${describe(app.$('#status'))}): a screen reader may not announce a new live region`);
    expect(norm(initial.textContent) === found(total), `status text “${norm(initial.textContent)}”, expected “${found(total)}”`);
  });

  check('C1.7', 'If nothing matches, the list is empty and the status reads “Nothing found”', async () => {
    const app = await openApp({ data: { ...data, shows: [] } });
    expect(app.cards().length === 0, `with empty data, #results has ${app.cards().length} cards`);
    expect(app.status() === 'Nothing found', `status “${app.status()}”, expected “Nothing found”`);
  });

  /* ---------------- C2 · Card buttons ---------------- */

  check('C2.1', 'A single click handler on the #results list; cards and buttons have none', async () => {
    const app = await withCards();
    for (let i = 0; i < 3; i += 1) await app.press(app.button(1, 'toggle'));
    const list = /** @type {HTMLElement} */ (app.list);
    const onList = app.listeners(list, 'click');
    const inside = [...list.querySelectorAll('*')].filter((el) => app.listeners(el, 'click') > 0);
    expect(inside.length === 0, `${inside.length} elements inside the list have click handlers, including ${describe(inside[0])}: one handler on #results is needed (event delegation)`);
    expect(onList > 0, '#results has no click handler');
    expect(onList === 1, `after three re-renders, #results has ${onList} click handlers: a new one is added on every re-render`);
  });

  check('C2.2', '“Add to list” adds the show to my watchlist, pressing again removes it; aria-pressed conveys the state, the button text does not change', async () => {
    const app = await withCards();
    const before = accessibleName(toggleOf(app, DA_VINCI));
    expect(pressed(app, DA_VINCI) === 'false', `before pressing, aria-pressed="${pressed(app, DA_VINCI)}", expected "false"`);
    await app.press(toggleOf(app, DA_VINCI));
    expect(pressed(app, DA_VINCI) === 'true', `after pressing “Add to list” on the Da Vinci's Demons card, aria-pressed="${pressed(app, DA_VINCI)}", expected "true"`);
    const after = accessibleName(toggleOf(app, DA_VINCI));
    expect(after === before, `the button's name changed: “${before}” → “${after}”. aria-pressed conveys the state, and the text stays the same`);
    await app.press(toggleOf(app, DA_VINCI));
    expect(pressed(app, DA_VINCI) === 'false', `after the second press, aria-pressed="${pressed(app, DA_VINCI)}", expected "false"`);
  });

  check('C2.3', 'The “In list: N” counter in the header equals the number of shows in my watchlist', async () => {
    const app = await withCards();
    need(app.$('#watchlist-count'), 'there is no #watchlist-count element');
    for (const id of [1, 2, 5]) await app.press(toggleOf(app, id));
    expect(app.counter() === '3', `three shows added, but the counter shows “${app.counter()}”`);
    await app.press(toggleOf(app, 2));
    expect(app.counter() === '2', `one of the three removed, but the counter shows “${app.counter()}”`);
  });

  check('C2.4', 'Clicking the icon inside the button works the same as clicking its text', async () => {
    const app = await withCards();
    const target = await app.clickIcon(toggleOf(app, BREAKING_BAD));
    need(target, 'the “Add to list” button has no <svg> icon from the template');
    expect(pressed(app, BREAKING_BAD) === 'true', `the click on the icon went to ${describe(target)} (event.target), and the show was not added: the handler must find the button with closest()`);
  });

  check('C2.5', 'Buttons also work on a card that was not on screen at startup', async () => {
    const app = await withCards();
    const template = /** @type {HTMLTemplateElement | null} */ (app.$('template#show-card'));
    const fresh = /** @type {HTMLElement} */ (need(template?.content.firstElementChild, 'there is no #show-card template').cloneNode(true));
    fresh.dataset.id = '82';
    for (const slot of fresh.querySelectorAll('[data-field="name"]')) slot.textContent = nameOf(82);
    need(app.card(82), `there is no ${nameOf(82)} card`).replaceWith(fresh);
    await app.press(need(/** @type {HTMLElement | null} */ (fresh.querySelector('[data-action="toggle"]')), 'the template has no [data-action="toggle"] button'));
    const added = app.counter() === '1' || app.list?.querySelector('li[data-id="82"] [data-action="toggle"][aria-pressed="true"]');
    expect(added, `the ${nameOf(82)} card was recreated from the template, and its “Add to list” does nothing: the handlers are bound to the old buttons, not to the list`);
  });

  check('C2.6', 'One click is exactly one toggle, however many times the list was re-rendered before it', async () => {
    for (const [before, inList] of /** @type {const} */ ([[1, 2], [2, 1]])) {
      const app = await withCards();
      for (let i = 0; i < before; i += 1) await app.press(toggleOf(app, 1));
      await app.press(toggleOf(app, BREAKING_BAD));
      expect(pressed(app, BREAKING_BAD) === 'true' && app.counter() === String(inList), `after ${before === 1 ? 'one toggle' : 'two toggles'} of another card, one click on “Add to list” for Breaking Bad gave aria-pressed="${pressed(app, BREAKING_BAD)}", counter “${app.counter()}” (expected "true" and “${inList}”): the click is handled several times`);
    }
  });

  check('C2.7', 'After pressing “Add to list”, focus stays on that button of the same card', async () => {
    const app = await withCards();
    await app.press(toggleOf(app, BREAKING_BAD));
    await focusedDirectly(app);
    const active = app.active();
    expect(active === app.button(BREAKING_BAD, 'toggle'), `focus is on ${describe(active)}: the old button was replaced during the re-render, and focus was not moved to the new one`);
  });

  /* ---------------- C3 · Filters ---------------- */

  check('C3.1', 'Title search applies while typing (input): case and surrounding spaces are ignored; the status updates', async () => {
    const app = await withCards();
    const { query } = filters(app);
    for (const text of ['  The ', 'zzz']) {
      await app.type(query, text);
      const want = expected({ query: text });
      expect(same(app.ids(), want), `for “${text}” shown: ${listed(app.ids())}; expected: ${listed(want)}`);
      expect(app.status() === found(want.length), `for “${text}” status “${app.status()}”, expected “${found(want.length)}”`);
    }
  });

  check('C3.2', 'Genre and “Only my watchlist” apply at once (change); the filters combine with AND', async () => {
    const app = await withCards();
    const { query, genre, mine } = filters(app);
    await app.choose(genre, 'Comedy');
    let want = expected({ genre: 'Comedy' });
    expect(same(app.ids(), want), `for the Comedy genre shown: ${listed(app.ids())}; expected: ${listed(want)}`);
    await app.type(query, 'the');
    want = expected({ query: 'the', genre: 'Comedy' });
    expect(same(app.ids(), want), `for “the” + Comedy shown: ${listed(app.ids())}; expected: ${listed(want)}`);
    expect(app.status() === found(want.length), `status “${app.status()}”, expected “${found(want.length)}”`);
    await app.press(mine);
    expect(app.ids().length === 0, `my watchlist is empty, but “Only my watchlist” shows: ${listed(app.ids())}`);
    expect(app.status() === 'Nothing found', `status “${app.status()}”, expected “Nothing found”`);
  });

  check('C3.3', 'Enter in the search field does not reload the page', async () => {
    const app = await withCards();
    const { form, query } = filters(app);
    await app.type(query, 'the');
    await app.submit(form);
    await sleep(250);
    expect(!app.navigated(), 'Enter reloaded the page (the submit event was not cancelled): the app state is lost');
    expect(same(app.ids(), expected({ query: 'the' })), `after Enter shown: ${listed(app.ids())}`);
  });

  check('C3.4', 'While the user types, focus stays in the search field', async () => {
    const app = await withCards();
    const { query } = filters(app);
    for (const text of ['Br', 'Bre']) {
      await app.type(query, text);
      expect(same(app.ids(), expected({ query: text })), `for “${text}” shown: ${listed(app.ids())}: the filter was not applied`);
      expect(app.active() === query, `after typing “${text}”, focus is on ${describe(app.active())}, not in the search field`);
    }
  });

  check('C3.5', `“Reset” clears the fields, shows all ${total} shows and the status “${found(total)}”`, async () => {
    const app = await withCards();
    const { form, query, genre, mine } = filters(app);
    await app.type(query, 'the');
    await app.choose(genre, 'Drama');
    await app.press(mine);
    await app.press(need(app.buttonByText(form, 'Reset'), 'the #filters form has no “Reset” button'));
    expect(query.value === '' && genre.value === '' && !mine.checked, '“Reset” did not clear the form fields');
    expect(app.ids().length === total, `after “Reset”, ${app.ids().length} cards are shown, expected ${total}: the list was re-rendered with the old field values`);
    expect(app.status() === found(total), `status “${app.status()}”, expected “${found(total)}”`);
  });

  check('C3.6', 'The “Add to list” state survives filtering, buttons work after a filter change; “Only my watchlist” shows exactly my watchlist', async () => {
    const app = await withCards();
    const { query, mine } = filters(app);
    await app.press(toggleOf(app, BREAKING_BAD));
    await app.press(toggleOf(app, 123));
    await app.type(query, 'Breaking');
    expect(pressed(app, BREAKING_BAD) === 'true', `after filtering, Breaking Bad has aria-pressed="${pressed(app, BREAKING_BAD)}", although it is in my watchlist`);
    await app.press(toggleOf(app, BREAKING_BAD));
    expect(pressed(app, BREAKING_BAD) === 'false', 'after a filter change, “Add to list” did nothing: the buttons of the new cards have no handler');
    await app.type(query, '');
    expect(pressed(app, 123) === 'true', `Lost has aria-pressed="${pressed(app, 123)}", although it is in my watchlist`);
    await app.press(mine);
    expect(same(app.ids(), ['123']), `“Only my watchlist” shows: ${listed(app.ids())}; expected only Lost`);
    expect(app.status() === found(1), `status “${app.status()}”, expected “${found(1)}”`);
  });

  check('C3.7', 'With “Only my watchlist” on, a removed show disappears, and focus moves to “Add to list” on the next card, else on the previous card, else to the #results-heading heading', async () => {
    const app = await withCards();
    for (const id of [1, 2, 5]) await app.press(toggleOf(app, id));
    await app.press(filters(app).mine);
    expect(same(app.ids(), ['1', '2', '5']), `“Only my watchlist” shows: ${listed(app.ids())}`);
    const steps = /** @type {const} */ ([
      [2, () => app.button(5, 'toggle'), `to “Add to list” on the next card (${nameOf(5)})`],
      [5, () => app.button(1, 'toggle'), `to “Add to list” on the previous card (${nameOf(1)})`],
      [1, () => app.$('#results-heading'), 'to the #results-heading heading'],
    ]);
    for (const [id, target, where] of steps) {
      await app.press(toggleOf(app, id));
      await focusedDirectly(app);
      expect(!app.card(id), `${nameOf(id)} was removed from the watchlist, but its card is still there`);
      expect(app.active() === target(), `after removing ${nameOf(id)}, focus is on ${describe(app.active())}, but it should have moved ${where}`);
    }
  });

  /* ---------------- C4 · Details dialog and note ---------------- */

  check('C4.1', '“Details” opens <dialog id="details"> as a modal (showModal), and focus moves into the dialog', async () => {
    const app = await withCards();
    const dialog = await openDetails(app, BREAKING_BAD);
    expect(dialog.matches(':modal'), 'the dialog was not opened with showModal(): the rest of the page stays reachable for keyboard and screen reader users');
    expect(dialog.contains(app.active()), `focus is on ${describe(app.active())}, not in the dialog`);
  });

  check('C4.2', 'The name and heading of the dialog are the show title, the link leads to the show page on TVmaze; each time, the show it was opened from', async () => {
    const app = await withCards();
    for (const [id, previous] of [[TRUE_DETECTIVE, 0], [BREAKING_BAD, TRUE_DETECTIVE]]) {
      const show = /** @type {Show} */ (byId.get(id));
      const dialog = await openDetails(app, id);
      expect(accessibleName(dialog) === show.name, `the dialog's name (via aria-labelledby) is “${accessibleName(dialog)}”, expected “${show.name}”`);
      const links = [...dialog.querySelectorAll('a')].map((a) => a.href);
      expect(links.includes(show.url), `the dialog has no link to ${show.url}; it has: ${links.join(', ') || 'none'}`);
      const old = previous ? paragraphs(/** @type {Show} */ (byId.get(previous)).summary)[0] : '';
      expect(!old || !norm(dialog.innerText).includes(old), `the ${show.name} dialog still has the ${nameOf(previous)} summary: the new content was added to the old one instead of replacing it`);
      await app.escape(dialog);
    }
  });

  check('C4.3', 'The summary is shown as text: no element from the TVmaze markup in the DOM', async () => {
    let app = await withCards();
    const show = /** @type {Show} */ (byId.get(TRUE_DETECTIVE));
    let dialog = await openDetails(app, TRUE_DETECTIVE);
    const text = norm(dialog.innerText);
    for (const paragraph of paragraphs(show.summary)) {
      expect(text.includes(paragraph), `the dialog lacks the summary text “${paragraph.slice(0, 60)}…”`);
    }
    const tag = dialog.querySelector('b, i, strong, em');
    expect(!tag, `the dialog has ${describe(tag)} from the summary: the TVmaze markup was inserted as HTML`);

    const summary = '<p>Safe summary.</p><img src="x" onerror="__check.xss++"><b data-probe="1">Bold text</b>';
    app = await withCards({ data: { ...data, shows: shows.map((s) => (s.id === 1 ? { ...s, summary } : s)) } });
    dialog = await openDetails(app, 1);
    await sleep(300);
    const created = dialog.querySelector('img, [data-probe]');
    expect(!created, `the summary with markup created ${describe(created)} in the dialog`);
    expect(app.probe.xss === 0, 'the onerror handler from the summary ran: the markup was parsed in the live document (innerHTML on a <div> counts too), that is XSS');
    expect(norm(dialog.innerText).includes('Safe summary.'), 'the text of the summary with markup is not shown');
  });

  check('C4.4', 'Esc and “Cancel” close the dialog', async () => {
    const app = await withCards();
    let dialog = await openDetails(app, BREAKING_BAD);
    await app.escape(dialog);
    expect(!dialog.open, 'Esc does not close the dialog');
    dialog = await openDetails(app, BREAKING_BAD);
    await app.press(note(app).cancel);
    expect(!dialog.open, '“Cancel” does not close the dialog');
  });

  check('C4.5', 'After closing, focus returns to the “Details” button that opened the dialog', async () => {
    const app = await withCards();
    for (const how of ['Esc', '“Cancel”']) {
      const dialog = await openDetails(app, BREAKING_BAD);
      if (how === 'Esc') await app.escape(dialog);
      else await app.press(note(app).cancel);
      await focusedDirectly(app);
      expect(!dialog.open, `${how} does not close the dialog`);
      expect(app.active() === app.button(BREAKING_BAD, 'details'), `after closing (${how}), focus is on ${describe(app.active())}, not on “Details” of the Breaking Bad card`);
    }
  });

  check('C4.6', 'The form opens with the data of this very show: the saved rating and note or empty fields, no errors left from last time', async () => {
    const app = await withCards();
    await openDetails(app, BREAKING_BAD);
    let f = note(app);
    expect(f.rating.value === '' && f.text.value === '', `for a show with no note, the fields are not empty: “${f.rating.value}”, “${f.text.value}”`);
    await app.type(f.rating, '8');
    await app.type(f.text, 'Strong finale');
    await app.submit(f.form, f.save);
    expect(!(/** @type {HTMLDialogElement} */ (app.$('#details')).open), 'the valid rating 8 was not saved: the dialog stayed open');

    await openDetails(app, 82);
    f = note(app);
    expect(f.rating.value === '' && f.text.value === '', `for ${nameOf(82)}, the fields show the data of another show: “${f.rating.value}”, “${f.text.value}”`);
    await app.submit(f.form, f.save);
    await app.press(f.cancel);

    await openDetails(app, 123);
    f = note(app);
    expect(f.rating.getAttribute('aria-invalid') !== 'true' && described(f.rating).length === 0, 'the error from the previous opening stayed in the form of another show');

    await app.press(f.cancel);
    await openDetails(app, BREAKING_BAD);
    f = note(app);
    expect(f.rating.value === '8' && f.text.value === 'Strong finale', `the saved note is not shown: “${f.rating.value}”, “${f.text.value}”`);
  });

  check('C4.7', 'An invalid rating (empty, not a whole number, outside 1–10): the dialog stays open without alert(); the error is next to the field via aria-describedby, the field has aria-invalid="true"', async () => {
    const app = await withCards();
    const dialog = await openDetails(app, BREAKING_BAD);
    const f = note(app);
    for (const value of ['', '0', '11', '7.5']) {
      await app.type(f.rating, value);
      await app.submit(f.form, f.save);
      const shown = value === '' ? 'an empty rating' : `rating ${value}`;
      expect(app.probe.alerts.length === 0, `${shown}: the error was shown with alert(): “${app.probe.alerts[0]}”`);
      expect(dialog.open && !app.navigated(), `${shown}: the form was submitted, and the dialog closed`);
      expect(f.rating.getAttribute('aria-invalid') === 'true', `${shown}: the field has no aria-invalid="true"`);
      expect(described(f.rating).length > 0, `${shown}: the aria-describedby of the field does not point to visible error text`);
    }
  });

  check('C4.8', 'After a failed submit, focus is on the first field with an error', async () => {
    const app = await withCards();
    await openDetails(app, BREAKING_BAD);
    const f = note(app);
    await app.type(f.text, 'No rating');
    await app.submit(f.form, f.save);
    await focusedDirectly(app);
    expect(app.active() === f.rating, `focus is on ${describe(app.active())}, not on the rating field`);
  });

  check('C4.9', 'As soon as the value is corrected (input), the error clears, and the form saves', async () => {
    const app = await withCards();
    const dialog = await openDetails(app, BREAKING_BAD);
    const f = note(app);
    await app.type(f.rating, '42');
    await app.submit(f.form, f.save);
    expect(f.rating.getAttribute('aria-invalid') === 'true', 'rating 42 gave no error (aria-invalid)');
    await app.type(f.rating, '7');
    expect(f.rating.getAttribute('aria-invalid') !== 'true', 'the rating was corrected to 7, but aria-invalid="true" stayed');
    expect(described(f.rating).length === 0, `the rating was corrected to 7, but the error text stayed: “${described(f.rating).join(' ')}”`);
    await app.submit(f.form, f.save);
    expect(!dialog.open, 'the corrected rating 7 was not saved: the dialog stayed open (is the field still invalid?)');
  });

  check('C4.10', 'After saving, the card shows “My rating: 8/10” and the note; markup in the note stays text', async () => {
    const app = await withCards();
    await openDetails(app, BREAKING_BAD);
    const f = note(app);
    await app.type(f.rating, '8');
    await app.type(f.text, HOSTILE);
    await app.submit(f.form, f.save);
    await sleep(300);
    const card = need(app.card(BREAKING_BAD), 'after saving, there is no Breaking Bad card');
    const text = norm(card.innerText);
    expect(text.includes('8/10'), `the card does not show “8/10”: “${text}”`);
    const created = app.list?.querySelector('img, [data-probe]');
    expect(!created, `the note became the element ${describe(created)}: it was inserted as HTML`);
    expect(app.probe.xss === 0, 'the onerror handler from the note ran: that is XSS');
    expect(text.includes(HOSTILE), `the note is not shown as text: “${text}”`);
  });

  check('C4.11', 'After saving, the dialog closes, and the status reads “Note for <title> saved”', async () => {
    const app = await withCards();
    const dialog = await openDetails(app, BREAKING_BAD);
    const f = note(app);
    await app.type(f.rating, '9');
    await app.submit(f.form, f.save);
    expect(!dialog.open, 'after saving, the dialog stayed open');
    expect(app.status() === 'Note for Breaking Bad saved', `status “${app.status()}”, expected “Note for Breaking Bad saved”`);
  });

  check('C4.12', 'After saving, focus is on “Details” of this card (the card was re-rendered, so it is a new button)', async () => {
    const app = await withCards();
    await openDetails(app, BREAKING_BAD);
    const f = note(app);
    await app.type(f.rating, '9');
    await app.submit(f.form, f.save);
    await focusedDirectly(app);
    const target = app.button(BREAKING_BAD, 'details');
    expect(app.active() === target && target?.isConnected, `focus is on ${describe(app.active())}, not on “Details” of the Breaking Bad card`);
  });

  return checks;
}

/**
 * T4 · Пошук і сторінка серіалу (src/app.ts): яку послідовність станів передають loadSearch і
 * loadShow у setState. Назва кожного тесту починається з номера правила ТЗ. Не змінюйте цей файл.
 *
 * Тести виконуються в Node, де немає сторінки. Якщо всі вони падають з
 * «ReferenceError: document is not defined», app.ts звертається до сторінки поза start().
 * Тексти помилок тести беруть з вашої errorMessage (T3.2).
 */
import { afterEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { HttpError } from '../src/api.ts';
import { errorMessage } from '../src/state.ts';
import { loadSearch, loadShow } from '../src/app.ts';
import { SEARCH, SHOWS, describe, httpError, json, networkError, restoreFetch, stubFetch, tvmaze } from './support.js';

afterEach(restoreFetch);

const LOADING = { status: 'loading' };
const girls = SEARCH.girls.map((result) => result.show);

/** Стани, які функція передала в setState, по черзі. Відхилений проміс — тест не пройдено. */
async function statesOf(load) {
  const states = [];
  try {
    await load((state) => states.push(state));
  } catch (error) {
    assert.fail(`проміс відхилено (${describe(error)}), а мав виконатися; стани до того: ${describe(states)}`);
  }
  return states;
}

test('T4.1 loadSearch: порожній запит — лише стан idle, без запиту', async () => {
  const requests = stubFetch();
  for (const query of ['', '   ']) {
    assert.deepEqual(await statesOf((setState) => loadSearch(query, setState)), [{ status: 'idle' }], `loadSearch(${JSON.stringify(query)})`);
  }
  assert.equal(requests.length, 0, 'кількість запитів');
});

test('T4.1 loadSearch: запит без пробілів на краях', async () => {
  const requests = stubFetch();
  const states = await statesOf((setState) => loadSearch('  girls  ', setState));
  assert.equal(requests[0]?.searchParams.get('q'), 'girls', `адреса запиту: ${requests[0]}`);
  assert.deepEqual(states.at(-1), { status: 'results', query: 'girls', shows: girls });
});

test('T4.2 loadSearch: стан loading ще до запиту, потім results', async () => {
  const log = [];
  stubFetch(tvmaze, log);
  await loadSearch('girls', (state) => log.push(state));
  assert.deepEqual(log[0], LOADING, 'перше, що сталося, — setState({ status: "loading" })');
  assert.ok(log[1] instanceof URL, 'потім — запит');
  assert.deepEqual(log.slice(2), [{ status: 'results', query: 'girls', shows: girls }], 'після відповіді — один стан results');
});

test('T4.2 loadSearch: нічого не знайдено — стан empty', async () => {
  stubFetch();
  assert.deepEqual(await statesOf((setState) => loadSearch('qqqzzz', setState)), [LOADING, { status: 'empty', query: 'qqqzzz' }]);
});

test('T4.3 loadSearch: помилка HTTP — стан error з текстом errorMessage', async () => {
  for (const status of [429, 503]) {
    stubFetch(() => httpError(status));
    assert.deepEqual(
      await statesOf((setState) => loadSearch('girls', setState)),
      [LOADING, { status: 'error', message: errorMessage(new HttpError(status)) }],
      `статус ${status}`,
    );
  }
});

test('T4.3 loadSearch: збій мережі — стан error, а проміс не відхиляється', async () => {
  stubFetch(networkError);
  assert.deepEqual(
    await statesOf((setState) => loadSearch('girls', setState)),
    [LOADING, { status: 'error', message: errorMessage(new TypeError('fetch failed')) }],
  );
});

test('T4.3 loadSearch: тіло не тієї форми — стан error', async () => {
  stubFetch(() => json({}));
  assert.deepEqual(
    await statesOf((setState) => loadSearch('girls', setState)),
    [LOADING, { status: 'error', message: errorMessage(new Error('Неочікувана відповідь API')) }],
  );
});

test('T4.4 loadShow: стан loading, потім show', async () => {
  const requests = stubFetch();
  assert.deepEqual(await statesOf((setState) => loadShow(139, setState)), [LOADING, { status: 'show', show: SHOWS[139] }]);
  assert.equal(requests[0]?.pathname, '/shows/139');
});

test('T4.4 loadShow: 404 чи збій мережі — стан error, а проміс не відхиляється', async () => {
  stubFetch(() => httpError(404));
  assert.deepEqual(
    await statesOf((setState) => loadShow(139, setState)),
    [LOADING, { status: 'error', message: errorMessage(new HttpError(404)) }],
    '404',
  );
  stubFetch(networkError);
  assert.deepEqual(
    await statesOf((setState) => loadShow(139, setState)),
    [LOADING, { status: 'error', message: errorMessage(new TypeError('fetch failed')) }],
    'збій мережі',
  );
});

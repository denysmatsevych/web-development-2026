/**
 * Спільне для тестів: записані відповіді TVmaze, підміна fetch і дрібні помічники.
 * Не змінюйте цей файл.
 *
 * Тести не ходять у мережу: fetch на час кожного тесту підміняє stubFetch, і відповідь дає
 * або записаний файл з check/fixtures/ (як справжній TVmaze), або сам тест — статус 404, 429,
 * 500, 503, тіло не тієї форми чи збій мережі.
 */
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const read = (name) => JSON.parse(readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8'));

/** Записані відповіді пошуку за запитом: SEARCH.girls, SEARCH['law & order'], … */
export const SEARCH = read('search.json').queries;
/** Записані відповіді GET /shows/:id за id: SHOWS[139], … */
export const SHOWS = read('shows.json').shows;

/** Відповідь з тілом JSON. */
export function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=UTF-8' },
  });
}

/** Відповідь з помилкою HTTP і тілом, як у TVmaze. */
export function httpError(status) {
  return json({ name: `HTTP ${status}`, message: '', code: 0, status }, status);
}

/** Збій мережі: так fetch відхиляє проміс, коли відповіді немає зовсім. */
export function networkError() {
  throw new TypeError('fetch failed');
}

/** Відповідає як TVmaze за записаними файлами: незаписаний пошук — [], невідомий серіал — 404. */
export function tvmaze(url) {
  if (url.origin !== 'https://api.tvmaze.com') return networkError();
  if (url.pathname === '/search/shows') return json(SEARCH[url.searchParams.get('q') ?? ''] ?? []);
  const match = /^\/shows\/(\d+)$/.exec(url.pathname);
  if (match && SHOWS[match[1]]) return json(SHOWS[match[1]]);
  return httpError(404);
}

const realFetch = globalThis.fetch;

/**
 * Підміняє fetch: `answer(url)` повертає Response або кидає помилку. Кожен запит (URL) дописує
 * в масив `log`, який і повертає. restoreFetch() повертає справжній fetch.
 */
export function stubFetch(answer = tvmaze, log = []) {
  globalThis.fetch = async (input) => {
    const url = new URL(input instanceof Request ? input.url : String(input));
    log.push(url);
    return answer(url);
  };
  return log;
}

export function restoreFetch() {
  globalThis.fetch = realFetch;
}

/** Помилка, з якою відхилився проміс. Якщо проміс виконався — тест не пройдено. */
export async function rejection(promise) {
  let value;
  try {
    value = await promise;
  } catch (error) {
    return error;
  }
  assert.fail(`проміс виконався зі значенням ${describe(value)}, а мав відхилитися`);
}

/** Коротко про значення для повідомлень тестів. */
export function describe(value) {
  if (value instanceof Error) return `${value.name}: ${value.message}`;
  if (typeof value === 'string') return JSON.stringify(value);
  const text = JSON.stringify(value) ?? String(value);
  return text.length > 100 ? `${text.slice(0, 100)}…` : text;
}

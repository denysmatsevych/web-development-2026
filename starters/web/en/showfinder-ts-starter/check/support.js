/**
 * Common test utilities: recorded TVmaze responses, stubbed fetch, src/ inspection, and small helpers.
 * Do not modify this file.
 *
 * Tests do not make network requests: fetch is replaced with stubFetch for the duration of each test,
 * and responses are supplied either from recorded files in check/fixtures/ (like real TVmaze) or by
 * the test itself — status 404, 429, 500, 503, malformed body, or network failure.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const read = (name) => JSON.parse(readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8'));

/** Recorded search query responses: SEARCH.girls, SEARCH['law & order'], … */
export const SEARCH = read('search.json').queries;
/** Recorded GET /shows/:id responses by id: SHOWS[139], … */
export const SHOWS = read('shows.json').shows;

/** Response with JSON body. */
export function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=UTF-8' },
  });
}

/** Response with HTTP error and TVmaze-like body. */
export function httpError(status) {
  return json({ name: `HTTP ${status}`, message: '', code: 0, status }, status);
}

/** Network failure: how fetch rejects when there is no response at all. */
export function networkError() {
  throw new TypeError('fetch failed');
}

/** Responds like TVmaze using recorded fixtures: unrecorded search — [], unknown show — 404. */
export function tvmaze(url) {
  if (url.origin !== 'https://api.tvmaze.com') return networkError();
  if (url.pathname === '/search/shows') return json(SEARCH[url.searchParams.get('q') ?? ''] ?? []);
  const match = /^\/shows\/(\d+)$/.exec(url.pathname);
  if (match && SHOWS[match[1]]) return json(SHOWS[match[1]]);
  return httpError(404);
}

const realFetch = globalThis.fetch;

/**
 * Replaces fetch: `answer(url)` returns a Response or throws an error. Each request (URL) is appended
 * to `log`, which is returned. restoreFetch() restores the real fetch.
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

/** Rejection error of a promise. If the promise resolves, the test fails. */
export async function rejection(promise) {
  let value;
  try {
    value = await promise;
  } catch (error) {
    return error;
  }
  assert.fail(`promise resolved with ${describe(value)}, expected rejection`);
}

const SRC = new URL('../src/', import.meta.url);
const SRC_DIR = fileURLToPath(SRC);

/**
 * Module src/<name>: .ts file, or if not yet migrated — .js. Before migration (T4), tests run the
 * JavaScript versions of app and view; after migration — TypeScript.
 */
export function importSrc(name) {
  const ts = new URL(`${name}.ts`, SRC);
  return import(existsSync(ts) ? ts : new URL(`${name}.js`, SRC));
}

/** Files in src/ including subdirectories: paths relative to src/ with '/', e.g. `app.ts` or `lib/util.ts`. */
export function srcFiles() {
  return readdirSync(SRC_DIR, { recursive: true })
    .map((name) => name.replaceAll('\\', '/'))
    .filter((name) => statSync(path.join(SRC_DIR, name)).isFile())
    .sort();
}

/**
 * Code lines of src/ files: `{ where: 'src/app.ts:12', code, text }`. In `code`, comments and string
 * literal contents are replaced with spaces, so words in comments and strings do not count, while expressions
 * inside `${…}` template literals remain code. `text` is the line as is.
 */
export function srcLines(names = srcFiles().filter((name) => /\.[cm]?[jt]s$/.test(name))) {
  return names.flatMap((name) => {
    const text = readFileSync(path.join(SRC_DIR, name), 'utf8');
    const code = stripCode(text).split('\n');
    return text.split('\n').map((line, index) => ({
      where: `src/${name}:${index + 1}`,
      code: code[index] ?? '',
      text: line.replace(/\r$/, ''),
    }));
  });
}

/** Code without comments and string literal contents; newlines are preserved in place. */
function stripCode(text) {
  let out = '';
  let i = 0;
  const blank = (s) => s.replace(/[^\n]/g, ' ');
  const stack = []; // open `${`: count of nested braces inside each template literal
  while (i < text.length) {
    const c = text[i];
    const next = text[i + 1];
    if (c === '/' && next === '/') {
      const end = text.indexOf('\n', i);
      const stop = end < 0 ? text.length : end;
      out += blank(text.slice(i, stop));
      i = stop;
    } else if (c === '/' && next === '*') {
      const end = text.indexOf('*/', i + 2);
      const stop = end < 0 ? text.length : end + 2;
      out += blank(text.slice(i, stop));
      i = stop;
    } else if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < text.length && text[j] !== c && text[j] !== '\n') j += text[j] === '\\' ? 2 : 1;
      out += c + blank(text.slice(i + 1, j)) + (text[j] === c ? c : '');
      i = text[j] === c ? j + 1 : j;
    } else if (c === '`' || (c === '}' && stack.at(-1) === 0)) {
      // Template string chunk — until the next ` or ${.
      if (c === '}') stack.pop();
      let j = i + 1;
      while (j < text.length && text[j] !== '`' && !(text[j] === '$' && text[j + 1] === '{')) j += text[j] === '\\' ? 2 : 1;
      out += c + blank(text.slice(i + 1, j));
      if (text[j] === '`') {
        out += '`';
        i = j + 1;
      } else {
        out += '${';
        stack.push(0);
        i = j + 2;
      }
    } else {
      if (stack.length && c === '{') stack[stack.length - 1] += 1;
      if (stack.length && c === '}') stack[stack.length - 1] -= 1;
      out += c;
      i += 1;
    }
  }
  return out;
}

/** Brief representation of a value for test output messages. */
export function describe(value) {
  if (value instanceof Error) return `${value.name}: ${value.message}`;
  if (typeof value === 'string') return JSON.stringify(value);
  const text = JSON.stringify(value) ?? String(value);
  return text.length > 100 ? `${text.slice(0, 100)}…` : text;
}

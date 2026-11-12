/**
 * T4 · Migration of src/app, src/view, src/dom, and src/main to TypeScript. Each test name
 * begins with the assignment rule number. Do not modify this file.
 *
 * Before migration, behavioral tests run the JavaScript versions src/app.js and src/view.js: this
 * exposes defects present in the code prior to migration. Tests run in Node where there is no DOM:
 * if all behavioral tests fail with "ReferenceError: document is not defined", app or view
 * accesses document outside function bodies. Tests obtain error messages from your errorMessage (T3.2).
 */
import { afterEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { HttpError } from '../src/api.ts';
import { errorMessage } from '../src/state.ts';
import { SEARCH, SHOWS, describe, httpError, importSrc, json, networkError, restoreFetch, srcFiles, srcLines, stubFetch, tvmaze } from './support.js';

afterEach(restoreFetch);

const LOADING = { status: 'loading' };
const girls = SEARCH.girls.map((result) => result.show);
const MIGRATED = ['app', 'view', 'dom', 'main'];

/** States passed to setState in order. Rejected promise fails the test. */
async function statesOf(load) {
  const states = [];
  try {
    await load((state) => states.push(state));
  } catch (error) {
    assert.fail(`promise rejected (${describe(error)}), expected resolution; states prior to failure: ${describe(states)}`);
  }
  return states;
}

/** tsconfig.json as an object: stripped of comments and trailing commas. */
function readConfig(path) {
  const text = readFileSync(new URL(path, import.meta.url), 'utf8');
  return JSON.parse(text.replace(/^\s*\/\/.*$/gm, '').replace(/,(\s*[}\]])/g, '$1'));
}

/** Relative paths with .js extension in import statements: `from './view.js'`, `import('./view.js')`. */
function jsImports({ code, text }) {
  return [...code.matchAll(/(?:\bfrom|\bimport)\s*\(?\s*(['"])/g)]
    .map((match) => {
      const start = match.index + match[0].length;
      return text.slice(start, text.indexOf(match[1], start));
    })
    .filter((specifier) => /^\.\.?\/.*\.[cm]?js$/.test(specifier));
}

/* ---------------- T4.1–T4.2 · Files and configuration ---------------- */

test('T4.1 only .ts files in src/: app, view, dom, and main migrated to TypeScript and import modules with .ts', () => {
  const files = srcFiles();
  const left = files.filter((name) => /\.[cm]?js$/.test(name));
  const migrated = MIGRATED.map((name) => `${name}.ts`);
  const missing = migrated.filter((name) => !files.includes(name));
  assert.deepEqual(left, [], 'JavaScript files remain in src/');
  assert.deepEqual(missing, [], 'TypeScript files missing');
  const found = srcLines(migrated)
    .filter((line) => jsImports(line).length)
    .map(({ where, text }) => `${where}  ${text.trim()}`);
  assert.deepEqual(found, [], `import with .js extension instead of .ts:\n${found.join('\n')}`);
});

test('T4.2 tsconfig.json and check/tsconfig.json unchanged', () => {
  assert.deepEqual(readConfig('../tsconfig.json'), {
    compilerOptions: {
      strict: true,
      allowJs: true,
      target: 'es2023',
      lib: ['es2023', 'dom', 'dom.iterable'],
      module: 'nodenext',
      rootDir: 'src',
      outDir: 'dist',
      sourceMap: true,
      rewriteRelativeImportExtensions: true,
      verbatimModuleSyntax: true,
      erasableSyntaxOnly: true,
      types: [],
    },
    include: ['src'],
  });
  assert.deepEqual(readConfig('./tsconfig.json'), {
    extends: '../tsconfig.json',
    compilerOptions: { noEmit: true, rootDir: '..', resolveJsonModule: true },
    include: ['../src', './*.ts'],
  });
});

/* ---------------- T4.3–T4.4 · Search ---------------- */

test('T4.3 loadSearch: empty query sets only idle state without API request', async () => {
  const { loadSearch } = await importSrc('app');
  const requests = stubFetch();
  for (const query of ['', '   ']) {
    assert.deepEqual(await statesOf((setState) => loadSearch(query, setState)), [{ status: 'idle' }], `loadSearch(${JSON.stringify(query)})`);
  }
  assert.equal(requests.length, 0, 'request count');
});

test('T4.3 loadSearch: trims whitespace from query boundaries', async () => {
  const { loadSearch } = await importSrc('app');
  const requests = stubFetch();
  const states = await statesOf((setState) => loadSearch('  girls  ', setState));
  assert.equal(requests[0]?.searchParams.get('q'), 'girls', `request URL: ${requests[0]}`);
  assert.deepEqual(states.at(-1), { status: 'results', query: 'girls', shows: girls });
});

test('T4.3 loadSearch: loading state before request, then results', async () => {
  const { loadSearch } = await importSrc('app');
  const log = [];
  stubFetch(tvmaze, log);
  await loadSearch('girls', (state) => log.push(state));
  assert.deepEqual(log[0], LOADING, 'first action must be setState({ status: "loading" })');
  assert.ok(log[1] instanceof URL, 'followed by request');
  assert.deepEqual(log.slice(2), [{ status: 'results', query: 'girls', shows: girls }], 'results state after response');
});

test('T4.3 loadSearch: nothing found sets empty state with query', async () => {
  const { loadSearch } = await importSrc('app');
  stubFetch();
  assert.deepEqual(await statesOf((setState) => loadSearch('qqqzzz', setState)), [LOADING, { status: 'empty', query: 'qqqzzz' }]);
});

test('T4.4 loadSearch: HTTP error sets error state with errorMessage text', async () => {
  const { loadSearch } = await importSrc('app');
  for (const status of [429, 503]) {
    stubFetch(() => httpError(status));
    assert.deepEqual(
      await statesOf((setState) => loadSearch('girls', setState)),
      [LOADING, { status: 'error', message: errorMessage(new HttpError(status)) }],
      `status ${status}`,
    );
  }
});

test('T4.4 loadSearch: network failure sets error state, promise does not reject', async () => {
  const { loadSearch } = await importSrc('app');
  stubFetch(networkError);
  assert.deepEqual(
    await statesOf((setState) => loadSearch('girls', setState)),
    [LOADING, { status: 'error', message: errorMessage(new TypeError('fetch failed')) }],
  );
});

test('T4.4 loadSearch: malformed body sets error state', async () => {
  const { loadSearch } = await importSrc('app');
  stubFetch(() => json({}));
  assert.deepEqual(
    await statesOf((setState) => loadSearch('girls', setState)),
    [LOADING, { status: 'error', message: errorMessage(new Error('Unexpected API response')) }],
  );
});

/* ---------------- T4.5 · Show page ---------------- */

test('T4.5 loadShow: loading state, then show', async () => {
  const { loadShow } = await importSrc('app');
  const requests = stubFetch();
  assert.deepEqual(await statesOf((setState) => loadShow(139, setState)), [LOADING, { status: 'show', show: SHOWS[139] }]);
  assert.equal(requests[0]?.pathname, '/shows/139');
});

test('T4.5 loadShow: 404 or network failure sets error state, promise does not reject', async () => {
  const { loadShow } = await importSrc('app');
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
    'network failure',
  );
});

test('T4.5 loadShow: malformed body sets error state', async () => {
  const { loadShow } = await importSrc('app');
  stubFetch(() => json({ name: 'Not Found', status: 404 }));
  assert.deepEqual(
    await statesOf((setState) => loadShow(139, setState)),
    [LOADING, { status: 'error', message: errorMessage(new Error('Unexpected API response')) }],
  );
});

test('T4.5 app, view, dom, and main contain no fetch or .json(): network data accessed strictly via src/api.ts', () => {
  const names = srcFiles().filter((name) => MIGRATED.some((module) => name.startsWith(`${module}.`)));
  const found = srcLines(names)
    .filter(({ code }) => /\bfetch\s*\(|\.json\s*\(|\bXMLHttpRequest\b/.test(code))
    .map(({ where, text }) => `${where}  ${text.trim()}`);
  assert.deepEqual(found, [], `network requests outside src/api.ts:\n${found.join('\n')}`);
});

/* ---------------- T4.6 · Year and rating ---------------- */

test('T4.6 showMeta: premiere year and rating', async () => {
  const { showMeta } = await importSrc('view');
  assert.equal(showMeta(SHOWS[139]), '2012 · rating 6.4', 'Girls (139)');
});

test('T4.6 showMeta: without rating — "—", without premiere date — "year unknown"', async () => {
  const { showMeta } = await importSrc('view');
  assert.equal(showMeta(SHOWS[41734]), '2018 · rating —', 'GIRLS (41734): no rating');
  let text;
  try {
    text = showMeta(SHOWS[45962]);
  } catch (error) {
    assert.fail(`showMeta threw an error (${describe(error)}) for a show without premiere date and rating`);
  }
  assert.equal(text, 'year unknown · rating —', "Harlem's Kitchen (45962): neither date nor rating");
});

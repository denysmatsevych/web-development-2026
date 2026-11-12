// Runs the checks one by one and shows the result. You don't need to change this file.
import { Fail, defineChecks, groups } from './checks.js';
import { fetchedData, loadSource, openApp } from './harness.js';

const results = /** @type {HTMLElement} */ (document.querySelector('#results'));
const summary = /** @type {HTMLElement} */ (document.querySelector('#summary'));
const runButton = /** @type {HTMLButtonElement} */ (document.querySelector('#run'));

/** Results of the last run, for tools that read the page. */
/** @type {{ id: string, title: string, ok: boolean, detail: string }[]} */
let report = [];

async function run() {
  runButton.disabled = true;
  results.replaceChildren();
  report = [];
  summary.textContent = 'Checking…';
  document.body.dataset.state = 'running';

  let checks;
  try {
    if (location.protocol === 'file:') throw new Error('the page was opened via file://');
    await loadSource();
    const data = await (await fetch('data/shows.json', { cache: 'no-store' })).json();
    checks = defineChecks(data);
  } catch (error) {
    summary.textContent = `The check did not run: ${error instanceof Error ? error.message : error}. Open check.html via Live Preview (or npx serve .), as you do index.html.`;
    document.body.dataset.state = 'error';
    runButton.disabled = false;
    return;
  }

  const lists = new Map();
  for (const group of groups) {
    const section = document.createElement('section');
    section.className = 'group';
    const heading = document.createElement('h2');
    heading.textContent = group.title;
    const list = document.createElement('ol');
    list.className = 'checks';
    section.append(heading, list);
    results.append(section);
    lists.set(group.id, { list, heading, passed: 0, total: 0, title: group.title });
  }

  let passed = 0;
  for (const [index, check] of checks.entries()) {
    summary.textContent = `Check ${index + 1} of ${checks.length}…`;
    let ok = true;
    let detail = '';
    /** @type {string[]} */
    let errors = [];
    try {
      await check.run();
    } catch (error) {
      ok = false;
      detail = error instanceof Fail ? error.message : `the check stopped with an error: ${error instanceof Error ? error.message : error}`;
    }
    /** @type {string[]} */
    let requests = [];
    /** @type {string[]} */
    let deferred = [];
    /** @type {string[]} */
    let delayedFocus = [];
    const frame = /** @type {HTMLIFrameElement | null} */ (document.querySelector('#stage iframe'));
    try {
      const probe = /** @type {any} */ (frame?.contentWindow)?.__check;
      errors = probe?.errors ?? [];
      requests = probe?.requests ?? [];
      deferred = probe?.deferred ?? [];
      delayedFocus = probe?.delayedFocus ?? [];
    } catch {
      errors = [];
    }
    if (!ok && errors.length) detail += ` · Error in the app's Console: ${errors[0]}`;
    if (!ok && check.id !== 'C1.1' && fetchedData(requests)) {
      detail += ' · The app loads data/shows.json itself, so the data the check substitutes through src/state.js never reaches it (C1.1)';
    }
    // The focus checks explain deferred focus themselves.
    if (!ok && deferred.length && !delayedFocus.length) {
      detail += ` · The app defers its response to the action with ${deferred[0]}(): the check reads the result right away, and the assignment does not allow timers (§5)`;
    }
    if (ok) passed += 1;
    report.push({ id: check.id, title: check.title, ok, detail });
    showResult(lists.get(check.group), check, ok, detail);
  }

  for (const group of lists.values()) {
    group.heading.textContent = `${group.title} — ${group.passed} of ${group.total}`;
  }
  // The app from the last check is no longer needed: show a clean copy.
  await openApp().catch(() => {});
  summary.textContent = `Passed: ${passed} of ${checks.length}`;
  document.body.dataset.state = passed === checks.length ? 'passed' : 'failed';
  runButton.disabled = false;
}

/**
 * @param {{ list: HTMLOListElement, passed: number, total: number }} group
 * @param {{ id: string, title: string }} check
 * @param {boolean} ok
 * @param {string} detail
 */
function showResult(group, check, ok, detail) {
  group.total += 1;
  if (ok) group.passed += 1;
  const item = document.createElement('li');
  item.className = ok ? 'pass' : 'fail';
  const mark = document.createElement('span');
  mark.className = 'mark';
  mark.textContent = ok ? '✓' : '✗';
  const label = document.createElement('span');
  label.className = 'visually-hidden';
  label.textContent = ok ? 'Passed: ' : 'Failed: ';
  const id = document.createElement('strong');
  id.textContent = check.id;
  const title = document.createElement('span');
  title.textContent = ` ${check.title}`;
  item.append(mark, label, id, title);
  if (detail) {
    const why = document.createElement('p');
    why.className = 'detail';
    why.textContent = detail;
    item.append(why);
  }
  group.list.append(item);
}

Object.defineProperty(window, 'checkReport', { get: () => report });
runButton.addEventListener('click', run);
run();

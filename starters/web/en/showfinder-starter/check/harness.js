// Loads index.html into a frame and works with the app the way a user does: types text,
// submits the form, clicks. The check doesn't read the app's code, only the DOM, attributes, texts
// and the requests the app sends.
//
// The page goes into the frame via srcdoc, so that two scripts can be added before its modules run:
// a small probe (it intercepts alert(), Console errors and XMLHttpRequest) and check/net.js, a
// replacement fetch that answers requests to TVmaze with recorded responses and lets the check
// control them: hold them, return an error, drop the connection.

export const sleep = (/** @type {number} */ ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Spaces and line breaks count as one space; no spaces at the ends. The apostrophes ’ and ʼ count as ':
 * the assignment page shows typographic apostrophes, so text copied from it is right too.
 */
export const norm = (/** @type {string | null | undefined} */ text) =>
  (text ?? '').replace(/\s+/g, ' ').replace(/[’ʼ]/g, "'").trim();

let html = '';

/** Reads index.html once per check run. */
export async function loadSource() {
  const response = await fetch('index.html', { cache: 'no-store' });
  if (!response.ok) throw new Error(`index.html: HTTP ${response.status}`);
  html = await response.text();
}

// Runs first in the frame, before any of the app's modules.
const PROBE = `(() => {
  const probe = { alerts: [], errors: [], xhr: [], initialStatus: null };
  window.__check = probe;
  window.alert = (message) => { probe.alerts.push(String(message)); };
  window.confirm = (message) => { probe.alerts.push(String(message)); return false; };
  window.prompt = (message) => { probe.alerts.push(String(message)); return null; };
  const open = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    probe.xhr.push(String(url));
    return open.call(this, method, url, ...rest);
  };
  addEventListener('error', (event) => probe.errors.push(event.message || String(event.error)));
  addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    probe.errors.push('Uncaught (in promise) ' + (reason && reason.name ? reason.name + ': ' + reason.message : String(reason)));
  });
})();`;

// Runs at the end of HTML parsing, before the modules: remembers the live region that is in the HTML itself.
const AFTER_PARSE = `window.__check.initialStatus = document.querySelector('#status');`;

/**
 * @typedef {object} Entry a request from the app (see check/net.js)
 * @property {string} url
 * @property {string} method
 * @property {Record<string, string>} headers
 * @property {string} mode
 * @property {string} credentials
 * @property {number} at when it was sent, the frame's performance.now()
 * @property {'pending' | 'answered' | 'failed' | 'blocked' | 'aborted' | 'passed'} state
 * @property {string} blocked why the request was blocked by CORS
 * @property {AbortSignal} signal
 * @property {(spec?: object) => Promise<void>} respond
 * @property {() => void} drop
 */

/** Opens a fresh copy of the app. Each check works with its own copy. */
export async function openApp() {
  const head = `<script>${PROBE}<\/script><script src="check/net.js"><\/script>`;
  const doc = html
    .replace(/<head(\s[^>]*)?>/i, (tag) => tag + head)
    .replace(/<\/body>/i, `<script>${AFTER_PARSE}<\/script></body>`);

  const frame = document.createElement('iframe');
  frame.title = 'The ShowFinder app under check';
  const app = new App(frame);
  const loaded = new Promise((resolve) => frame.addEventListener('load', resolve, { once: true }));
  frame.addEventListener('load', () => (app.loads += 1));
  frame.srcdoc = doc;
  /** @type {HTMLElement} */ (document.querySelector('#stage')).replaceChildren(frame);
  await loaded;
  app.attach();
  await app.net.ready;
  await sleep(30);
  return app;
}

export class App {
  /** @param {HTMLIFrameElement} frame */
  constructor(frame) {
    this.frame = frame;
    this.loads = 0;
    /** @type {any} */ this.win = null;
    /** @type {Document} */ this.doc = /** @type {any} */ (null);
  }

  attach() {
    this.win = this.frame.contentWindow;
    this.doc = /** @type {Document} */ (this.frame.contentDocument);
  }

  /** @returns {{ alerts: string[], errors: string[], xhr: string[], initialStatus: Element | null }} */
  get probe() {
    return this.win.__check;
  }

  /** @returns {{ log: Entry[], hold: boolean, queue: Entry[], script: { match: (url: string) => boolean, spec: object, times?: number }[], fixtures: any }} */
  get net() {
    return this.win.__net;
  }

  /** Time in the frame: the same clock as in the request entries. */
  now() {
    return this.win.performance.now();
  }

  /** The page was reloaded or another one was opened: the app state is lost. */
  navigated() {
    return this.loads > 1 || this.frame.contentDocument !== this.doc;
  }

  /** @param {string} selector */
  $(selector) {
    return /** @type {HTMLElement | null} */ (this.doc.querySelector(selector));
  }

  get results() {
    return /** @type {HTMLElement} */ (this.$('#results'));
  }

  get details() {
    return /** @type {HTMLElement} */ (this.$('#details'));
  }

  get query() {
    return /** @type {HTMLInputElement | null} */ (this.$('#search-query'));
  }

  /** The text of the status live region, the one that is in the HTML from the start. */
  status() {
    const initial = this.probe.initialStatus;
    const region = initial?.isConnected ? initial : this.$('#status');
    return norm(region?.textContent);
  }

  cards() {
    return /** @type {HTMLElement[]} */ ([...(this.results?.querySelectorAll('li[data-id]') ?? [])]);
  }

  ids() {
    return this.cards().map((card) => Number(card.dataset.id));
  }

  /** The button of a show card in #results. */
  cardButton(/** @type {number} */ id) {
    return /** @type {HTMLButtonElement | null} */ (this.results?.querySelector(`li[data-id="${id}"] button`) ?? null);
  }

  /** The show title on the page in #details, or ''. */
  shownTitle() {
    return norm(this.details?.querySelector('#show-title, h2')?.textContent);
  }

  /** Requests to TVmaze (all of them, aborted and blocked ones included). */
  api(/** @type {RegExp} */ path = /./) {
    return this.net.log.filter((entry) => {
      const url = new URL(entry.url);
      return url.origin === 'https://api.tvmaze.com' && path.test(url.pathname);
    });
  }

  searches() {
    return this.api(/^\/search\/shows\/?$/);
  }

  /** Requests about show id: the show itself, its episodes, cast and so on. */
  showRequests(/** @type {number} */ id) {
    return this.api(new RegExp(`^/shows/${id}(/|$)`));
  }

  /** Held requests that have not been answered yet. */
  held(/** @type {RegExp} */ path = /./) {
    return this.net.queue.filter((entry) => entry.state === 'pending' && path.test(new URL(entry.url).pathname));
  }

  /** Types text into the search field: the value changes, the input event bubbles. */
  async type(/** @type {string} */ text) {
    const input = this.query;
    if (!input) return false;
    input.focus();
    input.value = text;
    input.dispatchEvent(new this.win.InputEvent('input', { bubbles: true, inputType: 'insertText', data: text }));
    await sleep(15);
    return true;
  }

  /** Enter in the search field: the form is submitted. */
  async submit() {
    const form = /** @type {HTMLFormElement | null} */ (this.$('#search'));
    if (!form) return false;
    form.requestSubmit();
    await sleep(20);
    return true;
  }

  /** A click on a show card. */
  async open(/** @type {number} */ id) {
    const button = this.cardButton(id);
    if (!button) return false;
    button.focus();
    button.click();
    await sleep(20);
    return true;
  }

  /** The "Retry" button in the area, if it is visible. */
  retry(/** @type {Element | null} */ region) {
    return /** @type {HTMLButtonElement | null} */ (
      [...(region?.querySelectorAll('button') ?? [])].find((b) => norm(b.textContent) === 'Retry' && b.getClientRects().length) ?? null
    );
  }

  /** Waits until the condition is true. */
  async until(/** @type {() => unknown} */ condition, timeout = 1500) {
    const start = performance.now();
    while (performance.now() - start < timeout) {
      if (condition()) return true;
      await sleep(15);
    }
    return Boolean(condition());
  }
}

/** Whether the area is busy: aria-busy="true". */
export const busy = (/** @type {Element | null} */ region) => region?.getAttribute('aria-busy') === 'true';

/** The visible text of the area. */
export const text = (/** @type {Element | null} */ region) => norm(/** @type {HTMLElement | null} */ (region)?.innerText ?? region?.textContent);

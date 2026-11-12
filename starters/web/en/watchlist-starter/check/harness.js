// Loads index.html into a frame and drives the app the way a user does: it clicks, types and
// submits forms. The check never reads the app's code, only the DOM, attributes, focus and
// what the app does in response to actions.
//
// The page goes into the frame through srcdoc, so that a small script can be added before its
// modules run: it counts event handlers (addEventListener), intercepts alert() and Console
// errors, and notes focus moved from a timer and requests for data/shows.json. For a few
// checks, the same index.html gets different data: an import map swaps data/shows.json, and
// the data file itself is not changed.

export const sleep = (/** @type {number} */ ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Whether the app's requests include data/shows.json: the data should come from src/state.js. */
export const fetchedData = (/** @type {readonly string[]} */ requests) =>
  requests.some((url) => /(^|\/)data\/shows\.json(\?|$)/.test(url));

/** Spaces and line breaks become one space; no spaces at the ends. */
export const norm = (/** @type {string | null | undefined} */ text) => (text ?? '').replace(/\s+/g, ' ').trim();

let html = '';

/** Reads index.html once per check run. */
export async function loadSource() {
  const response = await fetch('index.html', { cache: 'no-store' });
  if (!response.ok) throw new Error(`index.html: HTTP ${response.status}`);
  html = await response.text();
}

// Runs first in the frame, before any of the app's modules.
const PROBE = `(() => {
  const registry = new WeakMap();
  const proto = EventTarget.prototype;
  const add = proto.addEventListener;
  const remove = proto.removeEventListener;
  const capture = (options) => (typeof options === 'boolean' ? options : Boolean(options && options.capture));
  const drop = (target, type, fn, phase) => {
    const list = registry.get(target);
    if (list) registry.set(target, list.filter((l) => !(l.type === type && l.fn === fn && l.capture === phase)));
  };
  proto.addEventListener = function (type, fn, options) {
    if (fn) {
      const list = registry.get(this) || [];
      const phase = capture(options);
      // The browser ignores registering the same function again, and so does this count.
      if (!list.some((l) => l.type === type && l.fn === fn && l.capture === phase)) {
        list.push({ type, fn, capture: phase });
        registry.set(this, list);
        const signal = options && typeof options === 'object' ? options.signal : null;
        if (signal) add.call(signal, 'abort', () => drop(this, type, fn, phase), { once: true });
      }
    }
    return add.call(this, type, fn, options);
  };
  proto.removeEventListener = function (type, fn, options) {
    drop(this, type, fn, capture(options));
    return remove.call(this, type, fn, options);
  };
  const probe = { registry, alerts: [], errors: [], xss: 0, initialStatus: null, delayedFocus: [], deferred: [], requests: [] };
  window.__check = probe;
  window.alert = (message) => { probe.alerts.push(String(message)); };
  window.confirm = (message) => { probe.alerts.push(String(message)); return false; };
  window.prompt = (message) => { probe.alerts.push(String(message)); return null; };
  // The check acts from a script, so microtasks run only after all of the event's handlers:
  // until then, inEvent shows that the app is still responding to an action.
  let inEvent = false;
  const afterEvent = window.queueMicrotask.bind(window);
  for (const type of ['click', 'input', 'change', 'submit', 'reset']) {
    add.call(window, type, () => {
      if (!inEvent) afterEvent(() => { inEvent = false; });
      inEvent = true;
    }, true);
  }
  // A deferred callback that moves focus: until it runs, focus was elsewhere, usually on <body>.
  // A timer started in an event handler: the response to the action is deferred (debounce, say).
  for (const name of ['setTimeout', 'setInterval', 'requestAnimationFrame', 'queueMicrotask']) {
    const original = window[name];
    window[name] = function (callback, ...rest) {
      if (inEvent) probe.deferred.push(name);
      if (typeof callback !== 'function') return original.call(window, callback, ...rest);
      const wrapped = function (...args) {
        const before = document.activeElement;
        try {
          return callback.apply(this, args);
        } finally {
          if (document.activeElement !== before) probe.delayedFocus.push(name);
        }
      };
      return original.call(window, wrapped, ...rest);
    };
  }
  // The app's requests: the data must come from src/state.js, not from a separate load.
  const request = window.fetch;
  window.fetch = function (input, init) {
    probe.requests.push(String(input instanceof Request ? input.url : input));
    return request.call(window, input, init);
  };
  const open = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    probe.requests.push(String(url));
    return open.call(this, method, url, ...rest);
  };
  add.call(window, 'error', (event) => probe.errors.push(event.message || String(event.error)));
  add.call(window, 'unhandledrejection', (event) => probe.errors.push('Uncaught (in promise) ' + String(event.reason)));
})();`;

// Runs at the end of HTML parsing, before the modules: remembers the live region in the HTML itself.
const AFTER_PARSE = `window.__check.initialStatus = document.querySelector('[role="status"], [aria-live]');`;

/**
 * Opens a fresh copy of the app. Each check works with its own copy, so the state of one
 * does not affect another.
 *
 * @param {{ data?: unknown }} [options] data: other contents for data/shows.json
 */
export async function openApp({ data } = {}) {
  let head = `<script>${PROBE}<\/script>`;
  if (data !== undefined) {
    const blob = URL.createObjectURL(new Blob([JSON.stringify(data)], { type: 'application/json' }));
    const key = new URL('data/shows.json', location.href).href;
    head = `<script type="importmap">${JSON.stringify({ imports: { [key]: blob } })}<\/script>${head}`;
  }
  const doc = html
    .replace(/<head(\s[^>]*)?>/i, (tag) => tag + head)
    .replace(/<\/body>/i, `<script>${AFTER_PARSE}<\/script></body>`);

  const frame = document.createElement('iframe');
  frame.title = 'The “My Watchlist” app under test';
  const app = new App(frame);
  const loaded = new Promise((resolve) => frame.addEventListener('load', resolve, { once: true }));
  frame.addEventListener('load', () => (app.loads += 1));
  frame.srcdoc = doc;
  /** @type {HTMLElement} */ (document.querySelector('#stage')).replaceChildren(frame);
  await loaded;
  await sleep(30);
  app.attach();
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
    this.win.focus();
  }

  /** @returns {{ registry: WeakMap<EventTarget, {type: string}[]>, alerts: string[], errors: string[], xss: number, initialStatus: Element | null, delayedFocus: string[], deferred: string[], requests: string[] }} */
  get probe() {
    return this.win.__check;
  }

  /** Whether the app loaded data/shows.json itself (fetch or XMLHttpRequest). */
  fetchedData() {
    return fetchedData(this.probe.requests);
  }

  /** The page was reloaded or another one opened: the app state is lost. */
  navigated() {
    return this.loads > 1 || this.frame.contentDocument !== this.doc;
  }

  /** @param {string} selector */
  $(selector) {
    return /** @type {HTMLElement | null} */ (this.doc.querySelector(selector));
  }

  get list() {
    return this.$('#results');
  }

  cards() {
    return /** @type {HTMLElement[]} */ ([...(this.list?.querySelectorAll('li[data-id]') ?? [])]);
  }

  ids() {
    return this.cards().map((card) => card.dataset.id ?? '');
  }

  /** @param {number | string} id */
  card(id) {
    return /** @type {HTMLElement | null} */ (this.list?.querySelector(`li[data-id="${id}"]`) ?? null);
  }

  /**
   * @param {number | string} id
   * @param {'toggle' | 'details'} action
   */
  button(id, action) {
    return /** @type {HTMLElement | null} */ (this.card(id)?.querySelector(`[data-action="${action}"]`) ?? null);
  }

  /**
   * A form field by name.
   * @param {string} formSelector
   * @param {string} name
   */
  field(formSelector, name) {
    const form = /** @type {HTMLFormElement | null} */ (this.$(formSelector));
    return /** @type {any} */ (form?.elements.namedItem(name) ?? null);
  }

  /** Text of the status live region. */
  status() {
    const initial = this.probe.initialStatus;
    const region = initial?.isConnected ? initial : this.$('#status');
    return norm(region?.textContent);
  }

  counter() {
    return norm(this.$('#watchlist-count')?.textContent);
  }

  active() {
    return this.doc.activeElement;
  }

  /** Number of handlers for an event on the element: addEventListener and the on<type> property. */
  listeners(/** @type {EventTarget} */ target, /** @type {string} */ type) {
    const registered = (this.probe.registry.get(target) ?? []).filter((l) => l.type === type).length;
    return registered + (/** @type {any} */ (target)[`on${type}`] ? 1 : 0);
  }

  /** Like a keyboard: focus on the button, then Enter (a click on the button itself). */
  async press(/** @type {HTMLElement | null} */ element) {
    if (!element) return false;
    element.focus();
    element.click();
    await sleep(15);
    return true;
  }

  /**
   * Like a mouse: a click in the centre of the icon. The event goes to the element the browser
   * finds at that point (elementFromPoint), usually <svg> or <path>, not the button itself.
   */
  async clickIcon(/** @type {HTMLElement | null} */ button) {
    const icon = button?.querySelector('svg');
    if (!button || !icon) return null;
    icon.scrollIntoView({ block: 'center' });
    const box = icon.getBoundingClientRect();
    const x = box.left + box.width / 2;
    const y = box.top + box.height / 2;
    const target = this.doc.elementFromPoint(x, y) ?? icon;
    button.focus();
    const init = { bubbles: true, cancelable: true, composed: true, view: this.win, clientX: x, clientY: y };
    target.dispatchEvent(new this.win.MouseEvent('click', init));
    await sleep(15);
    return target;
  }

  /** Types text into a field: the value changes, and an input event bubbles. */
  async type(/** @type {HTMLInputElement | HTMLTextAreaElement | null} */ input, /** @type {string} */ text) {
    if (!input) return false;
    input.focus();
    input.value = text;
    input.dispatchEvent(new this.win.InputEvent('input', { bubbles: true, inputType: 'insertText', data: text }));
    await sleep(15);
    return true;
  }

  /** Picks an option in a <select>: like the browser, it sends input and change. */
  async choose(/** @type {HTMLSelectElement | null} */ select, /** @type {string} */ value) {
    if (!select) return false;
    select.focus();
    select.value = value;
    select.dispatchEvent(new this.win.Event('input', { bubbles: true }));
    select.dispatchEvent(new this.win.Event('change', { bubbles: true }));
    await sleep(15);
    return true;
  }

  /** Submits the form, like Enter in a field or a submit button. */
  async submit(/** @type {HTMLFormElement | null} */ form, /** @type {HTMLElement | null} */ submitter = null) {
    if (!form) return false;
    if (submitter) {
      submitter.focus();
      form.requestSubmit(submitter);
    } else {
      form.requestSubmit();
    }
    await sleep(40);
    return true;
  }

  /** Esc in a modal dialog: requestClose() does the same as the key. */
  async escape(/** @type {HTMLDialogElement | null} */ dialog) {
    if (!dialog) return;
    if (typeof dialog.requestClose === 'function') dialog.requestClose();
    else if (dialog.dispatchEvent(new this.win.Event('cancel', { cancelable: true }))) dialog.close();
    await sleep(20);
  }

  /** A button in the container, by its visible text. */
  buttonByText(/** @type {Element | null} */ root, /** @type {string} */ text) {
    return /** @type {HTMLElement | null} */ (
      [...(root?.querySelectorAll('button') ?? [])].find((button) => norm(button.textContent) === text) ?? null
    );
  }
}

/** Whether the element is “visually hidden” (the visually-hidden class): a box of 1×1 px or less. */
function visuallyHidden(/** @type {Element} */ element) {
  const box = element.getBoundingClientRect();
  return box.width <= 1 && box.height <= 1;
}

/** Whether the element is excluded from the accessibility tree: hidden, display: none, aria-hidden. */
function excluded(/** @type {Element} */ element) {
  if (element.getAttribute('aria-hidden') === 'true') return true;
  if (/** @type {HTMLElement} */ (element).hidden) return true;
  return element.ownerDocument.defaultView?.getComputedStyle(element).display === 'none';
}

/** The text a user sees: without hidden and visually hidden parts. */
export function visibleLabel(/** @type {Element} */ element) {
  let text = '';
  for (const node of element.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) text += node.textContent;
    else if (node.nodeType === Node.ELEMENT_NODE && !excluded(/** @type {Element} */ (node))) {
      if (!visuallyHidden(/** @type {Element} */ (node))) text += visibleLabel(/** @type {Element} */ (node));
    }
  }
  return norm(text);
}

/** Text from all nodes that are in the accessibility tree (visually hidden ones included). */
function accessibleText(/** @type {Element} */ element) {
  let text = '';
  for (const node of element.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) text += node.textContent;
    else if (node.nodeType === Node.ELEMENT_NODE && !excluded(/** @type {Element} */ (node))) {
      text += accessibleText(/** @type {Element} */ (node));
    }
  }
  return text;
}

/**
 * A simplified accessible name computation (as in the Accessibility pane): aria-labelledby, then
 * aria-label, then the element's content. It is enough for this app's buttons and dialogs.
 */
export function accessibleName(/** @type {Element | null} */ element) {
  if (!element) return '';
  const doc = element.ownerDocument;
  const ids = norm(element.getAttribute('aria-labelledby'));
  if (ids) {
    return norm(
      ids
        .split(' ')
        .map((id) => doc.getElementById(id))
        .map((label) => (label ? accessibleText(label) : ''))
        .join(' '),
    );
  }
  const label = norm(element.getAttribute('aria-label'));
  if (label) return label;
  return norm(accessibleText(element));
}

/** A short description of an element for a message: <button data-action="toggle">. */
export function describe(/** @type {Element | null | undefined} */ element) {
  if (!element) return 'nothing';
  if (element === element.ownerDocument.body) return '<body>';
  const attrs = ['id', 'data-action', 'data-id', 'class']
    .filter((name) => element.hasAttribute(name))
    .slice(0, 2)
    .map((name) => ` ${name}="${element.getAttribute(name)}"`)
    .join('');
  return `<${element.tagName.toLowerCase()}${attrs}>`;
}

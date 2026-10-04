/**
 * ЛР-7 auto-check (beta) — grades a deployed Courtly page from the browser.
 *
 * The course site is static (GitHub Pages), so everything runs client-side.
 * That works because both hosts the brief allows serve
 * `Access-Control-Allow-Origin: *` on static files: we can `fetch()` the
 * student's HTML, CSS, robots.txt and sitemap.xml directly.
 *
 * Three passes:
 *
 * 1. **Static** — the HTML as authored (DOMParser) and the concatenated CSS
 *    text: semantics, ids, links, form, images, meta, tokens, media queries.
 * 2. **Layout** — the same HTML in a `srcdoc` iframe with a `<base>` pointing
 *    at the student's URL, sandboxed *without* scripts but same-origin, so we
 *    can resize it to 320 / 375 / 768 / 1440 px and read computed styles and
 *    rects. Their CSS, fonts and images load exactly as on the live page.
 * 3. **Menu** — a second iframe sandboxed with `allow-scripts` only (opaque
 *    origin: their JS cannot reach this page), plus an injected probe that
 *    clicks the toggle and reports `aria-expanded` back via `postMessage`.
 *
 * Lighthouse comes from the PageSpeed Insights API when `PUBLIC_PSI_API_KEY`
 * is set at build time; without a key the shared quota is usually exhausted,
 * so those rows come back "not checked". They are `confirmable`: the
 * instructor ticks a category from the student's screenshot. Match with the
 * mockup is confirmable too — no script can judge it — with a three-way
 * verdict, and the report shows the capture and the student's page side by
 * side for it.
 *
 * Every check carries a weight; `pass` earns it, `warn` half, `fail` none,
 * `skip` leaves the denominator. A confirmable row is the exception: the
 * instructor's verdict decides, and a row nothing could check and nobody has
 * judged counts as `fail`. See `withVerdicts()` and `scoreChecks()`. The
 * mockup verdicts carry a fixed share of the mark (`MOCKUP_POINTS`); the
 * other rows share the rest by weight.
 */

export type Status = 'pass' | 'warn' | 'fail' | 'skip';

export type GroupId = 'layout' | 'structure' | 'a11y' | 'css' | 'media' | 'seo' | 'mockup' | 'lighthouse';

export const GROUPS: { id: GroupId; title: string }[] = [
  { id: 'layout', title: 'Адаптивність і макет' },
  { id: 'structure', title: 'Секції, посилання, форма, картки' },
  { id: 'a11y', title: 'Семантика й accessibility' },
  { id: 'css', title: 'CSS: токени, типографіка, Grid і Flexbox' },
  { id: 'media', title: 'Зображення' },
  { id: 'seo', title: 'SEO' },
  { id: 'mockup', title: 'Відповідність макету' },
  { id: 'lighthouse', title: 'Lighthouse (Mobile)' },
];

/**
 * The widths the mockup is captured at — one confirmable row each. `height`
 * is the viewport the side-by-side viewer shows: a typical screen at that width.
 */
export const MOCKUP_VIEWS = [
  { width: 1440, height: 900, label: 'Desktop' },
  { width: 768, height: 1024, label: 'Tablet' },
  { width: 375, height: 812, label: 'Mobile' },
] as const;

export interface Check {
  id: string;
  group: GroupId;
  title: string;
  /** 0 — informational, shown but not scored. */
  weight: number;
  status: Status;
  detail?: string;
  /**
   * The instructor judges it by hand: `tick` — a «Виконано» checkbox, for a
   * single bar to meet; `verdict` — «Виконано / Частково / Не виконано».
   */
  confirmable?: 'tick' | 'verdict';
  /** Set by `withVerdicts()`: the status is the instructor's verdict. */
  manual?: boolean;
}

/** What the instructor can say about a confirmable row. */
export type Verdict = Exclude<Status, 'skip'>;

/** A problem with the input or the site as a whole — no report possible. */
export class CheckError extends Error {}

export interface Inspection {
  pageUrl: string;
  checks: Check[];
  /** Resolves later (PSI takes 20–60 s); rows to append to `checks`. */
  lighthouse: Promise<Check[]>;
  /**
   * The page as the layout pass renders it — scripts stripped, `<base>` at
   * the student's URL — for a `srcdoc` frame sandboxed to `allow-same-origin`.
   */
  preview: string;
}

export interface Score {
  percent: number;
  mark: number;
  earned: number;
  max: number;
}

/** Each card's name, sport and price, as in the mockup (handout, «Картки»). */
const VENUE_FACTS: [string, string, string][] = [
  ['Arena Sport', 'Футбол', '450 грн'],
  ['Tennis Point', 'Теніс', '350 грн'],
  ['Riverside Court', 'Баскетбол', '400 грн'],
  ['Smash Club', 'Теніс', '500 грн'],
  ['City Football', 'Футбол', '420 грн'],
  ['Active Hall', 'Волейбол', '380 грн'],
];

const VENUES = VENUE_FACTS.map(([name]) => name);

/**
 * The mockup's texts the page must carry (handout §1: «Тексти … — у макеті»),
 * by section. A text listed twice must appear twice. Left out: what students
 * may write themselves — card descriptions, ratings, the featured card's
 * amenities (handout, «Картки») — and what other rows check: venue names,
 * sports and prices (per card, `VENUE_FACTS`), form options.
 */
const MOCKUP_TEXTS: [string, string[]][] = [
  ['Header', ['Майданчики', 'Як це працює', 'Про сервіс', 'Забронювати']],
  [
    'Hero',
    [
      'Забронюйте спортивний майданчик без зайвих дзвінків',
      'Обирайте зручний майданчик, дату та час — і бронюйте онлайн за кілька кліків.',
      'Знайти майданчик',
    ],
  ],
  ['Форма', ['Місто', 'Оберіть місто', 'Вид спорту', 'Будь-який', 'Дата', 'Знайти']],
  [
    'Майданчики',
    ['Популярні майданчики', 'Оберіть майданчик для тренування, гри або змагання.', 'Вибір тижня', 'Вільно сьогодні'],
  ],
  [
    'Як це працює',
    [
      'Як це працює',
      'Оберіть майданчик',
      'Перегляньте доступні спортивні майданчики.',
      'Оберіть дату і час',
      'Перевірте доступність потрібного слоту.',
      'Підтвердіть бронювання',
      'Забронюйте майданчик онлайн.',
    ],
  ],
  [
    'Про сервіс',
    [
      'Спорт має бути доступним',
      'Courtly збирає футбольні поля, корти та зали міста в одному каталозі. Ви бачите реальний розклад і бронюєте без дзвінків та передоплат телефоном.',
      'Швидке бронювання',
      'Від вибору майданчика до підтвердження — менше хвилини.',
      'Актуальна доступність',
      'Розклад оновлюється одразу після кожного бронювання.',
      'Зручний пошук',
      'Фільтри за містом, видом спорту та датою.',
    ],
  ],
  [
    'Final CTA',
    ['Готові до наступної гри?', 'Знайдіть майданчик та забронюйте зручний час прямо зараз.', 'Знайти майданчик'],
  ],
  [
    'Footer',
    [
      'Онлайн-бронювання спортивних майданчиків: футбол, теніс, баскетбол і волейбол у вашому місті.',
      'Навігація',
      'Контакти',
      'Ми в соцмережах',
      'hello@courtly.example',
      '+380 44 123 45 67',
      'Instagram',
      'Facebook',
      'Telegram',
      '© 2026 Courtly. All rights reserved.',
    ],
  ],
];

const WIDTHS = [320, 375, 768, 1440] as const;
type Width = (typeof WIDTHS)[number];

/** `tokens.css` values the page must carry unchanged (names may differ). */
export const TOKENS: [string, string][] = [
  ['--color-primary', '#0b6e4f'],
  ['--color-primary-hover', '#085a40'],
  ['--color-primary-soft', '#e3f1ea'],
  ['--color-accent', '#c6f432'],
  ['--color-accent-hover', '#b3e01f'],
  ['--color-background', '#f6f8f5'],
  ['--color-surface', '#ffffff'],
  ['--color-surface-alt', '#eaf1ec'],
  ['--color-border', '#d5dfd8'],
  ['--color-text', '#13201a'],
  ['--color-text-muted', '#4a5a52'],
  ['--color-dark', '#0f2a1f'],
  ['--color-on-dark', '#f1f7f3'],
  ['--color-on-dark-muted', '#b4c7bb'],
  ['--color-rating', '#a15c00'],
  ['--font-size-h1', 'clamp(2rem, 1.472rem + 2.254vw, 3.5rem)'],
  ['--font-size-h2', 'clamp(1.625rem, 1.317rem + 1.315vw, 2.5rem)'],
  ['--font-size-h3', 'clamp(1.1875rem, 1.121rem + 0.282vw, 1.375rem)'],
  ['--font-size-lead', 'clamp(1.0625rem, 0.996rem + 0.282vw, 1.25rem)'],
  ['--space-section', 'clamp(3.5rem, 2.5rem + 4vw, 6rem)'],
  ['--container-gutter', 'clamp(1rem, 0.5rem + 2vw, 2rem)'],
];

const ACCENT_RGB = 'rgb(198, 244, 50)';

// ---------------------------------------------------------------------------
// Network

interface Fetched {
  ok: boolean;
  status: number;
  url: string;
  type: string;
  text: string;
}

async function get(url: string, timeout = 15000): Promise<Fetched> {
  const res = await fetch(url, {
    cache: 'no-store',
    redirect: 'follow',
    signal: AbortSignal.timeout(timeout),
  });
  return {
    ok: res.ok,
    status: res.status,
    url: res.url || url,
    type: res.headers.get('content-type') ?? '',
    text: await res.text(),
  };
}

async function tryGet(url: string, timeout?: number): Promise<Fetched | null> {
  try {
    return await get(url, timeout);
  } catch {
    return null;
  }
}

/**
 * Loads as an image? Works where `fetch()` cannot — a cross-origin URL without
 * CORS, such as a 404 page — but cannot say why it failed.
 */
function imageLoads(url: string, timeout = 10000): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    const done = (ok: boolean) => {
      clearTimeout(timer);
      img.onload = img.onerror = null;
      resolve(ok);
    };
    const timer = setTimeout(() => done(false), timeout);
    img.onload = () => done(true);
    img.onerror = () => done(false);
    img.src = url;
  });
}

/** A 200 that is really the host's HTML fallback (SPA rewrite) is not a file. */
function isRealFile(res: Fetched | null): res is Fetched {
  return !!res && res.ok && !/^\s*(<!doctype html|<html)/i.test(res.text);
}

// ---------------------------------------------------------------------------
// Input

export function normalizeUrl(raw: string): URL {
  let value = raw.trim();
  if (!value) throw new CheckError('Вставте адресу опублікованої сторінки.');
  if (!/^[a-z][a-z\d+.-]*:\/\//i.test(value)) value = `https://${value}`;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new CheckError('Це не схоже на адресу сторінки. Приклад: https://username.github.io/courtly/');
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new CheckError('Потрібна адреса, що починається з https://');
  }
  const host = url.hostname.toLowerCase();
  // This page is served over HTTPS; a plain-HTTP fetch would be blocked as
  // mixed content. Both allowed hosts serve HTTPS. Localhost stays as typed,
  // for trying the checker against a local server.
  if (host !== 'localhost' && host !== '127.0.0.1') url.protocol = 'https:';

  if (host === 'github.com' || host === 'www.github.com') {
    throw new CheckError(
      'Це посилання на репозиторій. Потрібна адреса опублікованої сторінки: https://<username>.github.io/<repository>/',
    );
  }
  if (host === 'vercel.com' || host.endsWith('.vercel.com')) {
    throw new CheckError('Це посилання на панель Vercel. Потрібна адреса сайту: https://<project>.vercel.app/');
  }
  url.hash = '';
  return url;
}

/** Same page? Ignores scheme, `www.`, query, hash, trailing `/` and `index.html`. */
function samePage(a: string, b: string): boolean {
  const norm = (value: string) => {
    try {
      const u = new URL(value);
      const path = u.pathname.replace(/\/index\.html?$/i, '/').replace(/\/+$/, '');
      return `${u.hostname.replace(/^www\./, '').toLowerCase()}${decodeURI(path)}`;
    } catch {
      return value;
    }
  };
  return norm(a) === norm(b);
}

/** Different site, not just a different path? Ignores scheme and `www.`. */
function otherSite(a: string, b: string): boolean {
  const host = (value: string) => {
    try {
      return new URL(value).hostname.replace(/^www\./, '').toLowerCase();
    } catch {
      return value;
    }
  };
  return host(a) !== host(b);
}

// ---------------------------------------------------------------------------
// Small DOM helpers

const clean = (value: string | null | undefined) => (value ?? '').replace(/\s+/g, ' ').trim();

/** Close enough to the accessible-name algorithm for buttons and links. */
function accessibleName(el: Element): string {
  const doc = el.ownerDocument;
  const labelledBy = el.getAttribute('aria-labelledby');
  if (labelledBy) {
    const text = labelledBy
      .split(/\s+/)
      .map((id) => doc.getElementById(id)?.textContent ?? '')
      .join(' ');
    if (clean(text)) return clean(text);
  }
  const aria = clean(el.getAttribute('aria-label'));
  if (aria) return aria;
  const copy = el.cloneNode(true) as Element;
  copy.querySelectorAll('[aria-hidden="true"]').forEach((node) => node.remove());
  copy.querySelectorAll('img[alt]').forEach((img) => img.replaceWith(img.getAttribute('alt') ?? ''));
  return clean(copy.textContent) || clean(el.getAttribute('title'));
}

function describe(el: Element): string {
  let out = el.tagName.toLowerCase();
  if (el.id) out += `#${el.id}`;
  const classes = [...el.classList].slice(0, 2);
  if (classes.length) out += `.${classes.join('.')}`;
  return out;
}

/** Deepest common ancestor of a non-empty list of elements. */
export function commonAncestor(els: Element[]): Element | null {
  if (!els.length) return null;
  let node: Element | null = els.length === 1 ? els[0].parentElement : els[0];
  while (node && !els.every((el) => node!.contains(el))) node = node.parentElement;
  return node;
}

/** The container's children that hold each element — the actual grid items. */
function itemsOf(container: Element, els: Element[]): Element[] {
  return els.map((el) => {
    let node = el;
    while (node.parentElement && node.parentElement !== container) node = node.parentElement;
    return node;
  });
}

/** Count of distinct values after rounding to `step` px. */
export function distinct(values: number[], step = 8): number {
  const sorted = [...values].sort((a, b) => a - b);
  let count = 0;
  let last = -Infinity;
  for (const v of sorted) {
    if (v - last > step) {
      count++;
      last = v;
    }
  }
  return count;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const frames = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

// ---------------------------------------------------------------------------
// CSS collection

interface Styles {
  /** Every readable stylesheet and `<style>`, comments stripped, in order. */
  css: string;
  /** Web-font stylesheet URLs (Google Fonts & co.), not fetched. */
  fontLinks: string[];
  /** Stylesheets that could not be read (network / CORS). */
  unreadable: string[];
  /** All stylesheet URLs, for framework detection. */
  hrefs: string[];
}

const FONT_HOST = /(^|\.)fonts\.(googleapis|bunny)\.net$|^fonts\.googleapis\.com$|^use\.typekit\.net$/i;

async function collectStyles(doc: Document, base: string): Promise<Styles> {
  const out: Styles = { css: '', fontLinks: [], unreadable: [], hrefs: [] };
  const parts: string[] = [];

  const load = async (href: string, depth: number): Promise<string> => {
    out.hrefs.push(href);
    if (FONT_HOST.test(new URL(href).hostname)) {
      out.fontLinks.push(href);
      return '';
    }
    const res = await tryGet(href);
    if (!res || !res.ok) {
      out.unreadable.push(href);
      return '';
    }
    return inlineImports(res.text, res.url, depth);
  };

  const inlineImports = async (css: string, from: string, depth: number): Promise<string> => {
    const text = css.replace(/\/\*[\s\S]*?\*\//g, '');
    if (depth >= 3) return text;
    const re = /@import\s+(?:url\(\s*)?["']?([^"')\s;]+)["']?\s*\)?[^;]*;/gi;
    const imports = [...text.matchAll(re)];
    const loaded = await Promise.all(
      imports.map((m) => {
        try {
          return load(new URL(m[1], from).href, depth + 1);
        } catch {
          return Promise.resolve('');
        }
      }),
    );
    return loaded.join('\n') + '\n' + text;
  };

  const nodes = [...doc.querySelectorAll('link[href], style')].filter(
    (el) => el.tagName === 'STYLE' || /(^|\s)stylesheet(\s|$)/i.test(el.getAttribute('rel') ?? ''),
  );
  const loaded = await Promise.all(
    nodes.map((el) => {
      if (el.tagName === 'STYLE') return inlineImports(el.textContent ?? '', base, 0);
      try {
        return load(new URL(el.getAttribute('href') ?? '', base).href, 0);
      } catch {
        return Promise.resolve('');
      }
    }),
  );
  parts.push(...loaded);
  out.css = parts.join('\n');
  return out;
}

/** `{ selector, body }` for every innermost rule block. */
function rules(css: string): { selector: string; body: string }[] {
  return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({ selector: clean(m[1]), body: m[2] }));
}

// ---------------------------------------------------------------------------
// Frames

let stage: HTMLElement | null = null;

/** A 1 px, invisible, click-through box the check frames render inside. */
function getStage(): HTMLElement {
  if (stage && stage.isConnected) return stage;
  stage = document.createElement('div');
  stage.setAttribute('aria-hidden', 'true');
  stage.style.cssText =
    'position:fixed;left:0;top:0;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none;z-index:-1;';
  document.body.append(stage);
  return stage;
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function frameSource(doc: Document, base: string, mode: 'layout' | 'script', token = ''): string {
  const copy = doc.cloneNode(true) as Document;
  copy.querySelectorAll('base, meta[http-equiv]').forEach((el) => el.remove());
  let head = `<base href="${escapeAttr(base)}">`;
  if (mode === 'layout') {
    // Scripting is off in this frame, so <noscript> would render — not what a
    // visitor sees. Hide the viewport scrollbar so the frame width is the
    // layout width (media queries already ignore it).
    copy.querySelectorAll('script, noscript').forEach((el) => el.remove());
    head += '<style>html{scrollbar-width:none}html::-webkit-scrollbar{display:none}</style>';
  }
  copy.head.insertAdjacentHTML('afterbegin', head);
  if (mode === 'script') {
    const probe = document.createElement('script');
    probe.textContent = menuProbe(token);
    copy.body.append(probe);
  }
  return `<!doctype html>\n${copy.documentElement.outerHTML}`;
}

async function mountFrame(source: string, width: number, sandbox: string): Promise<HTMLIFrameElement> {
  const frame = document.createElement('iframe');
  frame.setAttribute('sandbox', sandbox);
  frame.setAttribute('tabindex', '-1');
  frame.title = 'Сторінка, що перевіряється';
  frame.style.cssText = `width:${width}px;height:900px;border:0;display:block;`;
  frame.srcdoc = source;
  await new Promise<void>((resolve) => {
    const timer = setTimeout(resolve, 20000);
    frame.addEventListener(
      'load',
      () => {
        clearTimeout(timer);
        resolve();
      },
      { once: true },
    );
    getStage().append(frame);
  });
  return frame;
}

/**
 * Runs inside the scripted frame. Waits for the page's own scripts, clicks the
 * menu toggle twice at 375 px and reports what changed. Plain ES2017 — it is
 * serialised as text, not bundled.
 */
function menuProbe(token: string): string {
  return `(() => {
  const send = (data) => parent.postMessage(Object.assign({ courtlyProbe: ${JSON.stringify(token)} }, data), '*');
  const shown = (el) => {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1 || r.right <= 0 || r.left >= innerWidth) return false;
    return el.checkVisibility ? el.checkVisibility({ opacityProperty: true, visibilityProperty: true }) : getComputedStyle(el).visibility !== 'hidden';
  };
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const run = async () => {
    try {
      const header = document.querySelector('header') || document.body;
      const buttons = [...document.querySelectorAll('button, [role="button"]')];
      const btn = buttons.find((b) => header.contains(b) && (b.hasAttribute('aria-expanded') || b.hasAttribute('aria-controls')))
        || buttons.find((b) => b.hasAttribute('aria-expanded'));
      if (!btn) return send({ found: false });
      const id = btn.getAttribute('aria-controls');
      const panel = id ? document.getElementById(id) : null;
      // The panel, else the header's <nav> — never the logo link.
      const links = () => [...(panel || header).querySelectorAll(panel ? 'a[href]' : 'nav a[href]')];
      const anyShown = () => links().some(shown);
      const r = { found: true, visible: shown(btn), e0: btn.getAttribute('aria-expanded'), l0: anyShown() };
      btn.click();
      await wait(450);
      r.e1 = btn.getAttribute('aria-expanded');
      r.l1 = anyShown();
      btn.click();
      await wait(450);
      r.e2 = btn.getAttribute('aria-expanded');
      r.l2 = anyShown();
      send(r);
    } catch (error) {
      send({ error: String(error) });
    }
  };
  const start = () => setTimeout(run, 400);
  if (document.readyState === 'complete') start(); else addEventListener('load', start);
})();`;
}

interface MenuResult {
  found?: boolean;
  visible?: boolean;
  e0?: string | null;
  e1?: string | null;
  e2?: string | null;
  l0?: boolean;
  l1?: boolean;
  l2?: boolean;
  error?: string;
}

async function probeMenu(doc: Document, base: string): Promise<MenuResult | null> {
  const token = Math.random().toString(36).slice(2);
  let frame: HTMLIFrameElement | null = null;
  const result = new Promise<MenuResult | null>((resolve) => {
    const timer = setTimeout(() => {
      removeEventListener('message', onMessage);
      resolve(null);
    }, 25000);
    function onMessage(event: MessageEvent) {
      if (!frame || event.source !== frame.contentWindow) return;
      const data = event.data as (MenuResult & { courtlyProbe?: string }) | null;
      if (!data || data.courtlyProbe !== token) return;
      clearTimeout(timer);
      removeEventListener('message', onMessage);
      resolve(data);
    }
    addEventListener('message', onMessage);
  });
  // Opaque origin: their scripts run, but cannot touch this page.
  frame = await mountFrame(frameSource(doc, base, 'script', token), 375, 'allow-scripts');
  const data = await result;
  frame.remove();
  return data;
}

// ---------------------------------------------------------------------------
// Layout measurements (same-origin, script-less frame)

/** Layout at one width, read from a rendered page (`snapshot()`). */
export interface Snapshot {
  width: number;
  overflow: number;
  /** The outermost elements past the right edge, at most 3. */
  culprits: Element[];
  gridColumns: number | null;
  featured: { w: number; h: number; otherW: number; otherH: number } | null;
  toggleShown: boolean | null;
  navShown: boolean;
  heroSideBySide: boolean | null;
  /** Columns by left edge; rows by vertical centre, so bottom-aligned buttons share a row. */
  form: { cols: number; rows: number } | null;
  stepsRow: { cols: number; rows: number } | null;
  h1: number | null;
  h2: number | null;
  images: ImageBox[];
}

/** A content image as rendered, with the proportions the spec gives it (Макет §3, §4). */
export interface ImageBox {
  /** «hero», «картки» (one name for all six) or «Про сервіс». */
  name: string;
  el: HTMLImageElement;
  w: number;
  h: number;
  /** Width : height at this width, as [label, ratio]; null where the spec sets none (Arena Sport from 1024 px fills its row). */
  want: [string, number] | null;
  /** `object-fit: fill` drawing the picture at proportions other than its own. */
  stretched: boolean;
  /** As tall as its `height` attribute, though not as wide: no CSS height overrides it (`height: auto`). */
  attrHeight: boolean;
}

const RATIOS = { wide: ['16 : 9', 16 / 9], photo: ['4 : 3', 4 / 3], portrait: ['4 : 5', 4 / 5] } satisfies Record<
  string,
  [string, number]
>;

/** Off by more than 3 %, the slack a box rounded to whole pixels needs. */
const offRatio = (got: number, want: number) => Math.abs(got / want - 1) > 0.03;

/** What is wrong with an image's box, or null. */
export function imageProblem(img: ImageBox): string | null {
  const size = `${Math.round(img.w)} × ${Math.round(img.h)} px`;
  if (img.want && offRatio(img.w / img.h, img.want[1])) return `${size} замість ${img.want[0]}`;
  if (img.stretched) return `${size}, зображення розтягнуте (object-fit: fill)`;
  return null;
}

interface Computed {
  snaps: Map<Width, Snapshot>;
  bodyOverflowX: string;
  htmlOverflowX: string;
  background: string;
  color: string;
  fontFamily: string;
  venueDisplay: string | null;
  flex: { header: boolean; form: boolean; card: boolean };
  focus: { footer: string | null; cta: string | null; root: string | null };
  montserrat: 'cyrillic' | 'latin-only' | 'none';
}

/** Rendered, inside the viewport horizontally, not hidden or transparent. */
export function shownIn(win: Window, el: Element | null): boolean {
  if (!el) return false;
  const r = el.getBoundingClientRect();
  if (r.width < 1 || r.height < 1 || r.right <= 0 || r.left >= win.innerWidth) return false;
  const check = (el as Element & { checkVisibility?: (o: object) => boolean }).checkVisibility;
  if (check) return check.call(el, { opacityProperty: true, visibilityProperty: true });
  return win.getComputedStyle(el).visibility !== 'hidden';
}

function isFlex(win: Window, root: Element | null): boolean {
  if (!root) return false;
  return [root, ...root.querySelectorAll('*')].some((el) =>
    /flex/.test(win.getComputedStyle(el).display),
  );
}

/** Resolve any CSS colour string to `rgb(r, g, b)` via the frame's engine. */
function toRgb(win: Window, value: string): string {
  const probe = win.document.createElement('span');
  probe.style.color = value;
  win.document.body.append(probe);
  const out = win.getComputedStyle(probe).color;
  probe.remove();
  return out;
}

/** The mockup's section headings, to find a section by when its `id` is off. */
const SECTION_HEADINGS = { how: /^як це працює$/i, about: /^спорт має бути доступним$/i };

/**
 * A section by its §1 `id`, else by its heading. A wrong `id` costs points in
 * the `ids` and `links` rows; whatever is measured inside the section should
 * not fail over it a second time. `sectionAnchors()` inlines the same lookup.
 */
export function findSection(d: Document, id: keyof typeof SECTION_HEADINGS): Element | null {
  const byId = d.getElementById(id);
  if (byId) return byId;
  const heading = [...d.querySelectorAll('h2')].find((h) => SECTION_HEADINGS[id].test(clean(h.textContent)));
  return heading ? (heading.closest('section') ?? heading.parentElement) : null;
}

/**
 * Final CTA's «Знайти майданчик»: the last link to `#search`, else — when it
 * points elsewhere, which the `links` row scores — the last of at least two
 * «Знайти майданчик» links, the first being the hero's. `sectionAnchors()`
 * inlines the same lookup.
 */
export function ctaLink(d: Document): Element | null {
  const main = d.querySelector('main') ?? d.body;
  const toSearch = [...main.querySelectorAll('a[href="#search"]')];
  if (toSearch.length) return toSearch[toSearch.length - 1];
  const finds = [...main.querySelectorAll('a')].filter((a) => /знайти майданчик/i.test(a.textContent ?? ''));
  return finds.length >= 2 ? finds[finds.length - 1] : null;
}

/** The parts of a Courtly page the layout is measured on; any may be missing. */
export interface Located {
  header: Element | null;
  /** The menu button: a header `<button>` with `aria-expanded` or `aria-controls`. */
  toggle: HTMLButtonElement | null;
  navLinks: Element[];
  h1: Element | null;
  hero: HTMLImageElement | null;
  form: HTMLFormElement | null;
  /** Fields and the submit button. */
  controls: Element[];
  /** The `<article>`s in #venues. */
  cards: Element[];
  /** Their deepest common ancestor, and the grid items holding each card. */
  grid: Element | null;
  items: Element[];
  /** Index of Arena Sport in `cards` / `items`, or -1. */
  featuredIdx: number;
  how: Element | null;
  steps: Element[];
  /** The #venues heading, else the first `<h2>`. */
  h2: Element | null;
  aboutImage: HTMLImageElement | null;
}

export function locate(d: Document): Located {
  const venuesSection = d.getElementById('venues');
  const cards = [...(venuesSection ?? d).querySelectorAll('article')];
  const grid = cards.length > 1 ? commonAncestor(cards) : null;
  const header = d.querySelector('header');
  const form = d.querySelector('form');
  const how = findSection(d, 'how');
  const stepList = how?.querySelector('ol, ul');
  return {
    header,
    toggle:
      [...(header ?? d).querySelectorAll('button')].find(
        (b) => b.hasAttribute('aria-expanded') || b.hasAttribute('aria-controls'),
      ) ?? null,
    navLinks: [...(header?.querySelectorAll('nav a[href]') ?? [])],
    h1: d.querySelector('h1'),
    hero: heroImage(d),
    form,
    controls: form
      ? [...form.querySelectorAll('select, input:not([type="hidden"]), textarea, button[type="submit"], button:not([type])')]
      : [],
    cards,
    grid,
    items: grid ? itemsOf(grid, cards) : [],
    featuredIdx: cards.findIndex((card) => /arena\s*sport/i.test(card.querySelector('h1,h2,h3,h4')?.textContent ?? '')),
    how,
    steps: [...(stepList?.querySelectorAll(':scope > li') ?? how?.querySelectorAll('h3') ?? [])],
    h2: d.querySelector('#venues h2') ?? d.querySelector('h2'),
    aboutImage: findSection(d, 'about')?.querySelector('img') ?? null,
  };
}

/** Reads the layout as `win` renders it now; the caller sets the width first. */
export function snapshot(win: Window, at: Located, width: number): Snapshot {
  const d = win.document;
  const { items, cards, featuredIdx, h1, hero, steps, controls, toggle, navLinks, h2, aboutImage } = at;
  const root = d.documentElement;
  const vw = root.clientWidth;
  const overflow = root.scrollWidth - vw;

  const culprits: Element[] = [];
  if (overflow > 1) {
    const wide = [...d.body.querySelectorAll('*')].filter((el) => el.getBoundingClientRect().right > vw + 1);
    for (const el of wide) {
      if (![...el.children].some((child) => wide.includes(child))) culprits.push(el);
      if (culprits.length >= 3) break;
    }
  }

  const rects = items.map((item) => item.getBoundingClientRect());
  let featured: Snapshot['featured'] = null;
  if (featuredIdx >= 0 && rects.length > 1) {
    const others = rects.filter((_, i) => i !== featuredIdx);
    const median = (xs: number[]) => xs.sort((a, b) => a - b)[Math.floor(xs.length / 2)];
    featured = {
      w: rects[featuredIdx].width,
      h: rects[featuredIdx].height,
      otherW: median(others.map((r) => r.width)),
      otherH: median(others.map((r) => r.height)),
    };
  }

  let heroSideBySide: boolean | null = null;
  if (h1 && hero) {
    const a = h1.getBoundingClientRect();
    const b = hero.getBoundingClientRect();
    heroSideBySide = b.height > 0 && b.left >= a.right - 8 && b.top < a.bottom && b.bottom > a.top;
  }

  const images: ImageBox[] = [];
  const image = (name: string, el: HTMLImageElement | null, want: ImageBox['want']) => {
    const r = el?.getBoundingClientRect();
    if (!el || !r || r.width < 1 || r.height < 1) return;
    // Its own proportions: the file's once loaded, else the attributes.
    const attr = (key: 'width' | 'height') => Number(el.getAttribute(key));
    const own = el.naturalHeight ? el.naturalWidth / el.naturalHeight : attr('width') / attr('height');
    images.push({
      name,
      el,
      w: r.width,
      h: r.height,
      want,
      stretched: win.getComputedStyle(el).objectFit === 'fill' && own > 0 && Number.isFinite(own) && offRatio(r.width / r.height, own),
      attrHeight: Math.abs(r.height - attr('height')) < 1 && Math.abs(r.width - attr('width')) >= 1,
    });
  };
  image('hero', hero, width < 1024 ? RATIOS.wide : RATIOS.photo);
  cards.forEach((card, i) =>
    image('картки', card.querySelector('img'), i === featuredIdx && width >= 1024 ? null : RATIOS.photo),
  );
  image('«Про сервіс»', aboutImage, RATIOS.portrait);

  const stepRects = steps.map((s) => s.getBoundingClientRect());
  const controlRects = controls.map((c) => c.getBoundingClientRect());
  return {
    width,
    overflow,
    culprits,
    gridColumns: rects.length > 1 ? distinct(rects.map((r) => r.left)) : null,
    featured,
    toggleShown: toggle ? shownIn(win, toggle) : null,
    navShown: navLinks.some((a) => shownIn(win, a)),
    heroSideBySide,
    form:
      controlRects.length >= 3
        ? {
            cols: distinct(controlRects.map((r) => r.left)),
            rows: distinct(controlRects.map((r) => r.top + r.height / 2), 16),
          }
        : null,
    stepsRow:
      stepRects.length >= 3
        ? { cols: distinct(stepRects.map((r) => r.left)), rows: distinct(stepRects.map((r) => r.top)) }
        : null,
    h1: h1 ? parseFloat(win.getComputedStyle(h1).fontSize) : null,
    h2: h2 ? parseFloat(win.getComputedStyle(h2).fontSize) : null,
    images,
  };
}

async function measure(doc: Document, base: string, focusVar: string, onWidth: (w: number) => void): Promise<Computed> {
  const frame = await mountFrame(frameSource(doc, base, 'layout'), 1440, 'allow-same-origin');
  try {
    const win = frame.contentWindow!;
    const d = frame.contentDocument!;
    await Promise.race([d.fonts.ready, sleep(5000)]);

    const snaps = new Map<Width, Snapshot>();
    const at = locate(d);
    const { cards, grid, featuredIdx, header, form } = at;

    for (const width of WIDTHS) {
      onWidth(width);
      frame.style.width = `${width}px`;
      await frames();
      await sleep(60);
      snaps.set(width, snapshot(win, at, width));
    }

    // Back to desktop for the width-independent reads.
    frame.style.width = '1440px';
    await frames();

    const bodyStyle = win.getComputedStyle(d.body);
    const htmlStyle = win.getComputedStyle(d.documentElement);
    const bg = bodyStyle.backgroundColor === 'rgba(0, 0, 0, 0)' ? htmlStyle.backgroundColor : bodyStyle.backgroundColor;

    const focusAt = (el: Element | null) => {
      if (!el) return null;
      const raw = win.getComputedStyle(el).getPropertyValue(focusVar).trim();
      return raw ? toRgb(win, raw) : null;
    };
    const footer = d.querySelector('footer');
    const cta = ctaLink(d);

    // CSS-connected FontFaces show up in `document.fonts`; the Google Fonts
    // css2 API splits Montserrat into per-subset faces by `unicode-range`.
    let montserrat: Computed['montserrat'] = 'none';
    for (const face of d.fonts) {
      if (!/montserrat/i.test(face.family)) continue;
      if (montserrat === 'none') montserrat = 'latin-only';
      const range = face.unicodeRange.toUpperCase();
      if (/U\+0?4[0-9A-F]{2}|U\+0-10FFFF|U\+0000-10FFFF/.test(range)) montserrat = 'cyrillic';
    }

    const card = featuredIdx >= 0 ? cards[featuredIdx] : cards[1] ?? cards[0] ?? null;
    return {
      snaps,
      bodyOverflowX: bodyStyle.overflowX,
      htmlOverflowX: htmlStyle.overflowX,
      background: bg,
      color: bodyStyle.color,
      fontFamily: bodyStyle.fontFamily,
      venueDisplay: grid ? win.getComputedStyle(grid).display : null,
      flex: { header: isFlex(win, header), form: isFlex(win, form), card: isFlex(win, card) },
      focus: { footer: focusAt(footer), cta: focusAt(cta), root: focusAt(d.body) },
      montserrat,
    };
  } finally {
    frame.remove();
  }
}

function heroImage(doc: Document): HTMLImageElement | null {
  const imgs = [...doc.querySelectorAll('img')];
  return (
    imgs.find((img) => /hero-(800|1200)/i.test(`${img.getAttribute('src')} ${img.getAttribute('srcset')}`)) ??
    imgs.find((img) => img.getAttribute('fetchpriority') === 'high') ??
    doc.querySelector('main img')
  );
}

// ---------------------------------------------------------------------------
// Section anchors (mockup viewer)

/**
 * Where each Courtly section starts, in CSS px from the top of a rendered
 * page, top to bottom, then `end` (the page height). A section the page lacks
 * is left out. The viewer aligns the student's page with a mockup capture on
 * these points.
 *
 * Self-contained on purpose — no helpers from this module: it is also
 * serialised with `toString()` and run in the reference page when the
 * captures are rendered, so both sides are measured by the same code.
 */
export function sectionAnchors(doc: Document): Record<string, number> {
  const win = doc.defaultView!;
  const main = doc.querySelector('main') ?? doc.body;
  // The <section> holding `el`, else its ancestor that is a child of <main>.
  const block = (el: Element | null | undefined): Element | null => {
    if (!el) return null;
    const section = el.closest('section');
    if (section) return section;
    let node = el;
    while (node.parentElement && node.parentElement !== main) node = node.parentElement;
    return node.parentElement ? node : el;
  };
  // `findSection()` and `ctaLink()`, inlined.
  const byHeading = (re: RegExp) =>
    block([...doc.querySelectorAll('h2')].find((h) => re.test((h.textContent ?? '').replace(/\s+/g, ' ').trim())));
  const toSearch = [...main.querySelectorAll('a[href="#search"]')];
  const finds = [...main.querySelectorAll('a')].filter((a) => /знайти майданчик/i.test(a.textContent ?? ''));
  const cta = toSearch.length ? toSearch[toSearch.length - 1] : finds.length >= 2 ? finds[finds.length - 1] : null;
  const found: [string, Element | null][] = [
    ['hero', block(doc.querySelector('h1'))],
    ['search', doc.getElementById('search')],
    ['venues', doc.getElementById('venues')],
    ['how', doc.getElementById('how') ?? byHeading(/^як це працює$/i)],
    ['about', doc.getElementById('about') ?? byHeading(/^спорт має бути доступним$/i)],
    ['cta', block(cta)],
    ['footer', doc.getElementById('contacts') ?? [...doc.querySelectorAll('footer')].pop() ?? null],
  ];
  const out: Record<string, number> = {};
  for (const [name, el] of found) {
    if (el) out[name] = Math.round(el.getBoundingClientRect().top + win.scrollY);
  }
  out.end = doc.documentElement.scrollHeight;
  return out;
}

// ---------------------------------------------------------------------------
// The checks

type Add = (id: string, group: GroupId, title: string, weight: number, status: Status, detail?: string) => void;

/** pass when every part holds, warn when at most `slack` fail, else fail. */
function tally(problems: unknown[], slack = 1): Status {
  return problems.length === 0 ? 'pass' : problems.length <= slack ? 'warn' : 'fail';
}

function staticChecks(add: Add, doc: Document, pageUrl: string, styles: Styles) {
  const css = styles.css;
  const cssFlat = css.replace(/\s+/g, '').toLowerCase();
  const body = doc.body;

  // --- Structure: sections & links ------------------------------------------
  const ids = ['search', 'venues', 'how', 'about', 'contacts'];
  const missingIds = ids.filter((id) => !doc.getElementById(id));
  const contacts = doc.getElementById('contacts');
  const idProblems = missingIds.map((id) => `немає id="${id}"`);
  if (contacts && contacts.tagName !== 'FOOTER') idProblems.push('id="contacts" має бути на <footer>');
  const searchEl = doc.getElementById('search');
  if (searchEl && searchEl.tagName !== 'FORM' && !searchEl.querySelector('form')) {
    idProblems.push('id="search" не на формі й не на її обгортці');
  }
  add('ids', 'structure', 'Секції мають id з таблиці §1', 3, tally(idProblems), idProblems.join('; ') || undefined);

  const header = doc.querySelector('header');
  const main = doc.querySelector('main') ?? body;
  const linkTo = (scope: Element | null, href: string, text: RegExp) =>
    [...(scope?.querySelectorAll(`a[href="${href}"]`) ?? [])].some((a) => text.test(accessibleName(a)));
  const linkProblems: string[] = [];
  if (!linkTo(header, '#venues', /забронювати/i)) linkProblems.push('«Забронювати» у header → #venues');
  const heroLinks = [...main.querySelectorAll('a[href="#venues"]')].filter((a) => /знайти/i.test(accessibleName(a)));
  if (!heroLinks.length) linkProblems.push('«Знайти майданчик» у hero → #venues');
  if (!linkTo(main, '#search', /знайти/i)) linkProblems.push('«Знайти майданчик» у Final CTA → #search');
  const nav = header?.querySelector('nav');
  const navTargets = ['#venues', '#how', '#about'].filter((h) => !nav?.querySelector(`a[href="${h}"]`));
  if (navTargets.length) linkProblems.push(`у навігації немає ${navTargets.join(', ')}`);
  add('links', 'structure', 'Посилання ведуть туди, куди вказано в §1', 3, tally(linkProblems), linkProblems.join('; ') || undefined);

  const broken = [...doc.querySelectorAll('a[href^="#"]')]
    .map((a) => a.getAttribute('href') ?? '')
    .filter((h) => h.length > 1 && h !== '#top' && !doc.getElementById(decodeURIComponent(h.slice(1))));
  const uniqueBroken = [...new Set(broken)];
  add(
    'anchors',
    'structure',
    'Усі якірні посилання мають ціль',
    1,
    uniqueBroken.length ? 'fail' : 'pass',
    uniqueBroken.length ? `немає елементів для ${uniqueBroken.slice(0, 5).join(', ')}` : undefined,
  );

  const footer = doc.querySelector('footer');
  const contactProblems: string[] = [];
  if (!footer?.querySelector('a[href^="mailto:"]')) contactProblems.push('немає посилання mailto:');
  if (!footer?.querySelector('a[href^="tel:"]')) contactProblems.push('немає посилання tel:');
  add('contacts', 'structure', 'Email і телефон у footer — mailto: і tel:', 1, tally(contactProblems, 0), contactProblems.join('; ') || undefined);

  // --- Form -------------------------------------------------------------------
  const form = doc.querySelector('form');
  if (!form) {
    add('form', 'structure', 'Форма пошуку', 6, 'fail', 'на сторінці немає <form>');
  } else {
    const action = form.getAttribute('action');
    add(
      'form-action',
      'structure',
      'Форма: action="#venues"',
      1,
      action === '#venues' ? 'pass' : 'fail',
      action === '#venues' ? undefined : `зараз action="${action ?? ''}"`,
    );

    const fields = [...form.querySelectorAll('select, input:not([type="hidden"]):not([type="submit"]), textarea')];
    const labelProblems: string[] = [];
    const ariaOnly: string[] = [];
    for (const field of fields) {
      const id = field.id;
      const linked = (id && form.ownerDocument.querySelector(`label[for="${CSS.escape(id)}"]`)) || field.closest('label');
      if (linked) continue;
      const name = field.getAttribute('name') ?? field.getAttribute('type') ?? field.tagName.toLowerCase();
      if (clean(field.getAttribute('aria-label')) || field.hasAttribute('aria-labelledby')) ariaOnly.push(name);
      else labelProblems.push(name);
    }
    add(
      'form-labels',
      'structure',
      'Форма: кожне поле має пов’язаний <label>',
      2,
      labelProblems.length ? 'fail' : ariaOnly.length ? 'warn' : fields.length ? 'pass' : 'fail',
      labelProblems.length
        ? `без підпису: ${labelProblems.join(', ')}`
        : ariaOnly.length
          ? `лише aria-label, а потрібен <label>: ${ariaOnly.join(', ')}`
          : fields.length
            ? undefined
            : 'у формі немає полів',
    );

    const notRequired = fields.filter((f) => !f.hasAttribute('required'));
    add(
      'form-required',
      'structure',
      'Форма: усі поля required',
      1,
      fields.length && !notRequired.length ? 'pass' : 'fail',
      notRequired.length ? `без required: ${notRequired.map((f) => f.getAttribute('name') ?? f.tagName.toLowerCase()).join(', ')}` : undefined,
    );

    const selects = [...form.querySelectorAll('select')];
    const optionsText = (s: Element) => [...s.querySelectorAll('option')].map((o) => clean(o.textContent));
    const city = selects.find((s) => optionsText(s).some((t) => /київ/i.test(t)));
    const sport = selects.find((s) => optionsText(s).some((t) => /футбол/i.test(t)));
    const fieldProblems: string[] = [];
    const placeholderOk = (s: Element | undefined) => {
      const first = s?.querySelector('option');
      return !!first && first.getAttribute('value') === '';
    };
    if (!city) fieldProblems.push('<select> «Місто»');
    else {
      const missing = ['Київ', 'Львів', 'Одеса', 'Харків', 'Дніпро'].filter((c) => !optionsText(city).includes(c));
      if (missing.length) fieldProblems.push(`у «Місто» немає ${missing.join(', ')}`);
      if (!placeholderOk(city)) fieldProblems.push('перший пункт «Місто» має value=""');
    }
    if (!sport) fieldProblems.push('<select> «Вид спорту»');
    else {
      const missing = ['Футбол', 'Теніс', 'Баскетбол', 'Волейбол'].filter((c) => !optionsText(sport).includes(c));
      if (missing.length) fieldProblems.push(`у «Вид спорту» немає ${missing.join(', ')}`);
      if (!placeholderOk(sport)) fieldProblems.push('перший пункт «Вид спорту» має value=""');
    }
    if (!form.querySelector('input[type="date"]')) fieldProblems.push('<input type="date">');
    if (!form.querySelector('button[type="submit"]')) fieldProblems.push('<button type="submit">');
    add(
      'form-fields',
      'structure',
      'Форма: Місто, Вид спорту, Дата, кнопка submit',
      2,
      tally(fieldProblems),
      fieldProblems.length ? `бракує: ${fieldProblems.join('; ')}` : undefined,
    );
  }

  // --- Cards ----------------------------------------------------------------
  const venues = doc.getElementById('venues');
  const cards = [...(venues?.querySelectorAll('article') ?? [])];
  const cardProblems: string[] = [];
  if (cards.length !== 6) cardProblems.push(`карток-<article>: ${cards.length}, потрібно 6`);
  const withoutH3 = cards.filter((c) => !c.querySelector('h3'));
  if (withoutH3.length) cardProblems.push(`без <h3>: ${withoutH3.length}`);
  const titles = cards.map((c) => clean(c.querySelector('h3')?.textContent));
  const missingVenues = VENUES.filter((v) => !titles.some((t) => t.toLowerCase() === v.toLowerCase()));
  if (missingVenues.length) cardProblems.push(`немає карток ${missingVenues.join(', ')}`);
  add('cards', 'structure', '6 карток — <article> з <h3>, назви як у макеті', 2, tally(cardProblems), cardProblems.join('; ') || undefined);

  const bookProblems: string[] = [];
  const books = cards.map((c) =>
    [...c.querySelectorAll('a, button')].find((el) => /забронювати/i.test(accessibleName(el))),
  );
  const found = books.filter((b): b is Element => !!b);
  if (found.length < cards.length) bookProblems.push(`кнопка «Забронювати» є в ${found.length} з ${cards.length} карток`);
  const links = found.filter((b) => b.tagName === 'A');
  if (links.length) bookProblems.push(`${links.length} — це <a>, а потрібна <button> (це дія)`);
  const untyped = found.filter((b) => b.tagName === 'BUTTON' && b.getAttribute('type') !== 'button');
  if (untyped.length) bookProblems.push(`${untyped.length} без type="button"`);
  const names = found.map(accessibleName);
  const dupes = names.length - new Set(names.map((n) => n.toLowerCase())).size;
  if (dupes > 0) bookProblems.push(`однакові доступні імена (${names[0]})`);
  const nameless = found.filter((b) => !VENUES.some((v) => accessibleName(b).toLowerCase().includes(v.toLowerCase())));
  if (!dupes && nameless.length) bookProblems.push(`${nameless.length} без назви майданчика в імені`);
  add(
    'book-buttons',
    'structure',
    '«Забронювати» — <button type="button"> з унікальним ім’ям',
    2,
    cards.length ? tally(bookProblems) : 'fail',
    bookProblems.join('; ') || (cards.length ? undefined : 'немає карток'),
  );

  const how = findSection(doc, 'how');
  const stepsList = how?.querySelector('ol, ul');
  const stepItems = stepsList ? stepsList.querySelectorAll(':scope > li').length : 0;
  add(
    'steps',
    'structure',
    '«Як це працює» — 3 кроки списком',
    1,
    stepItems === 3 ? (stepsList?.tagName === 'OL' ? 'pass' : 'warn') : 'fail',
    stepItems === 3
      ? stepsList?.tagName === 'OL'
        ? undefined
        : 'кроки мають порядок — краще <ol>'
      : how
        ? `у «Як це працює» знайдено ${stepItems} пунктів списку`
        : 'немає секції «Як це працює»',
  );

  // --- Texts ------------------------------------------------------------------
  // As the visitor reads them: no scripts or styles, case, quotes, dashes,
  // apostrophes, spacing and closing punctuation aside.
  const copy = body.cloneNode(true) as HTMLElement;
  copy.querySelectorAll('script, style, noscript, template').forEach((el) => el.remove());
  const textKey = (value: string) =>
    clean(
      value
        .normalize('NFC')
        .toLowerCase()
        .replace(/[’ʼ`]/g, "'")
        .replace(/[‐‑‒–—―−]/g, '-')
        .replace(/[«»"“”„]/g, ''),
    ).replace(/[.!?]+$/, '');
  const pageText = textKey(copy.textContent ?? '');
  const times = (text: string) => pageText.split(textKey(text)).length - 1;
  const wanted = MOCKUP_TEXTS.flatMap(([section, texts]) => texts.map((text) => [section, text] as const));
  const missingTexts = wanted
    .filter(([, text], i) => times(text) < wanted.slice(0, i + 1).filter(([, t]) => t === text).length)
    .map(([section, text]) => `${section}: «${text.length > 60 ? `${text.slice(0, 57)}…` : text}»`);
  for (const [name, sport, price] of VENUE_FACTS) {
    const card = cards.find((c) => clean(c.querySelector('h3')?.textContent).toLowerCase() === name.toLowerCase());
    if (!card) continue;
    const cardText = textKey(card.textContent ?? '');
    const off = [sport, price].filter((fact) => !cardText.includes(textKey(fact)));
    if (off.length) missingTexts.push(`${name}: ${off.map((fact) => `«${fact}»`).join(', ')}`);
  }
  const textCount = wanted.length + VENUE_FACTS.length;
  add(
    'texts',
    'structure',
    'Тексти як у макеті (опис і рейтинг майданчика можна свої)',
    3,
    tally(missingTexts, 3),
    missingTexts.length
      ? `не знайдено ${missingTexts.length} з ${textCount}: ${missingTexts.slice(0, 4).join('; ')}${missingTexts.length > 4 ? ` і ще ${missingTexts.length - 4}` : ''}`
      : undefined,
  );

  // --- Accessibility ----------------------------------------------------------
  const landmarkProblems: string[] = [];
  for (const tag of ['header', 'nav', 'main', 'footer']) if (!doc.querySelector(tag)) landmarkProblems.push(`<${tag}>`);
  if (doc.querySelectorAll('section').length < 4) landmarkProblems.push('<section> для секцій');
  if (doc.querySelectorAll('article').length < 6) landmarkProblems.push('<article> для карток');
  add(
    'landmarks',
    'a11y',
    'Landmarks: header, nav, main, section, article, footer',
    2,
    tally(landmarkProblems),
    landmarkProblems.length ? `бракує: ${landmarkProblems.join(', ')}` : undefined,
  );

  const h1s = doc.querySelectorAll('h1').length;
  add('h1', 'a11y', 'Один <h1>', 2, h1s === 1 ? 'pass' : 'fail', h1s === 1 ? undefined : `знайдено ${h1s}`);

  const headings = [...doc.querySelectorAll('h1, h2, h3, h4, h5, h6')];
  const skips: string[] = [];
  let prev = 0;
  for (const h of headings) {
    const level = Number(h.tagName[1]);
    if (prev && level > prev + 1) skips.push(`після <h${prev}> одразу <h${level}> «${clean(h.textContent).slice(0, 40)}»`);
    prev = level;
  }
  const firstLevel = headings[0] ? Number(headings[0].tagName[1]) : 0;
  if (firstLevel && firstLevel !== 1) skips.unshift(`перший заголовок — <h${firstLevel}>`);
  const h2Count = doc.querySelectorAll('h2').length;
  if (h2Count < 4) skips.push(`<h2> лише ${h2Count} — у кожної секції свій заголовок`);
  add('heading-order', 'a11y', 'Логічна ієрархія заголовків без пропусків рівнів', 2, tally(skips), skips.slice(0, 3).join('; ') || undefined);

  const toggle =
    [...(header?.querySelectorAll('button, [role="button"], a') ?? [])].find(
      (b) => b.hasAttribute('aria-expanded') || b.hasAttribute('aria-controls'),
    ) ?? null;
  const menuProblems: string[] = [];
  if (!toggle) menuProblems.push('у header немає кнопки з aria-expanded');
  else {
    if (toggle.tagName !== 'BUTTON') menuProblems.push(`кнопка меню — <${toggle.tagName.toLowerCase()}>, а потрібна <button>`);
    else if (toggle.getAttribute('type') !== 'button') menuProblems.push('немає type="button"');
    if (!accessibleName(toggle)) menuProblems.push('немає доступного імені');
    if (!toggle.hasAttribute('aria-expanded')) menuProblems.push('немає aria-expanded');
    const controls = toggle.getAttribute('aria-controls');
    if (!controls) menuProblems.push('немає aria-controls');
    else if (!doc.getElementById(controls)) menuProblems.push(`aria-controls="${controls}" вказує на неіснуючий id`);
  }
  add(
    'menu-markup',
    'a11y',
    'Mobile menu: <button>, ім’я, aria-expanded, aria-controls',
    2,
    toggle ? tally(menuProblems) : 'fail',
    menuProblems.join('; ') || undefined,
  );

  // --- Images -----------------------------------------------------------------
  const imgs = [...doc.querySelectorAll('img')];
  const hero = heroImage(doc);
  const isLogo = (img: Element) => /logo/i.test(img.getAttribute('src') ?? '') || !!img.closest('header a, footer a');
  const altProblems: string[] = [];
  for (const img of imgs) {
    const src = (img.getAttribute('src') ?? '').split('/').pop() || 'img';
    if (!img.hasAttribute('alt')) altProblems.push(`${src}: немає alt`);
    else if (isLogo(img)) {
      if (clean(img.getAttribute('alt'))) altProblems.push(`${src}: знак поруч зі словом «Courtly» — alt=""`);
    } else {
      const alt = clean(img.getAttribute('alt'));
      if (!alt) altProblems.push(`${src}: змістовне зображення з порожнім alt`);
      else if (/\.(webp|jpe?g|png|svg)$/i.test(alt) || alt.length < 5 || /^(image|img|фото|зображення|картинка)$/i.test(alt)) {
        altProblems.push(`${src}: alt «${alt}» нічого не описує`);
      }
    }
  }
  add(
    'alt',
    'a11y',
    'Правильні alt: описові для змістовних, alt="" для декоративних',
    2,
    imgs.length ? tally(altProblems) : 'fail',
    altProblems.slice(0, 4).join('; ') || (imgs.length ? undefined : 'на сторінці немає зображень'),
  );

  if (!hero) {
    add('hero-img', 'media', 'Hero: srcset, width/height, fetchpriority="high", без lazy', 4, 'fail', 'не знайдено hero-зображення');
  } else {
    const heroProblems: string[] = [];
    const srcset = hero.getAttribute('srcset') ?? '';
    if (!/hero-800/i.test(srcset) || !/hero-1200/i.test(srcset)) heroProblems.push('srcset з hero-800 і hero-1200');
    if (!hero.getAttribute('width') || !hero.getAttribute('height')) heroProblems.push('width і height');
    if (hero.getAttribute('fetchpriority') !== 'high') heroProblems.push('fetchpriority="high"');
    if (hero.getAttribute('loading') === 'lazy') heroProblems.push('прибрати loading="lazy"');
    add(
      'hero-img',
      'media',
      'Hero: srcset, width/height, fetchpriority="high", без lazy',
      4,
      tally(heroProblems),
      heroProblems.length ? `бракує: ${heroProblems.join(', ')}` : undefined,
    );
  }

  const rest = imgs.filter((img) => img !== hero);
  const noSize = rest.filter((img) => !img.getAttribute('width') || !img.getAttribute('height'));
  add(
    'img-size',
    'media',
    'Решта зображень — width і height',
    2,
    rest.length ? tally(noSize) : 'fail',
    noSize.length ? `без розмірів: ${noSize.map((i) => (i.getAttribute('src') ?? '').split('/').pop()).slice(0, 4).join(', ')}` : undefined,
  );
  const shouldLazy = rest.filter((img) => !isLogo(img));
  const eager = shouldLazy.filter((img) => img.getAttribute('loading') !== 'lazy');
  add(
    'img-lazy',
    'media',
    'Зображення нижче першого екрана — loading="lazy"',
    2,
    shouldLazy.length ? tally(eager) : 'fail',
    eager.length ? `без lazy: ${eager.map((i) => (i.getAttribute('src') ?? '').split('/').pop()).slice(0, 4).join(', ')}` : undefined,
  );

  // --- SEO --------------------------------------------------------------------
  const lang = doc.documentElement.getAttribute('lang') ?? '';
  add('lang', 'seo', '<html lang="uk">', 1, /^uk\b/i.test(lang) ? 'pass' : 'fail', /^uk\b/i.test(lang) ? undefined : `зараз lang="${lang}"`);

  const metaProblems: string[] = [];
  if (!doc.querySelector('meta[charset]')) metaProblems.push('<meta charset>');
  const viewport = doc.querySelector('meta[name="viewport"]')?.getAttribute('content') ?? '';
  if (!/width\s*=\s*device-width/i.test(viewport)) metaProblems.push('<meta name="viewport" content="width=device-width, …">');
  add('meta-base', 'seo', '<meta charset> і <meta name="viewport">', 1, tally(metaProblems, 0), metaProblems.length ? `бракує: ${metaProblems.join(', ')}` : undefined);

  const title = clean(doc.querySelector('title')?.textContent);
  const description = clean(doc.querySelector('meta[name="description"]')?.getAttribute('content'));
  const tdProblems: string[] = [];
  if (!title) tdProblems.push('<title>');
  if (!description) tdProblems.push('<meta name="description">');
  add('title-desc', 'seo', '<title> і <meta name="description">', 2, tally(tdProblems), tdProblems.length ? `бракує: ${tdProblems.join(', ')}` : undefined);

  const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? '';
  let canonicalStatus: Status = 'pass';
  let canonicalDetail: string | undefined;
  if (!canonical) {
    canonicalStatus = 'fail';
    canonicalDetail = 'немає <link rel="canonical">';
  } else if (!/^https?:\/\//i.test(canonical)) {
    canonicalStatus = 'warn';
    canonicalDetail = `відносний URL «${canonical}» — потрібна повна адреса сторінки`;
  } else if (!samePage(canonical, pageUrl)) {
    canonicalStatus = 'fail';
    canonicalDetail = otherSite(canonical, pageUrl)
      ? `canonical веде на інший сайт: «${canonical}»; адреса цієї сторінки — ${pageUrl}`
      : `canonical «${canonical}» не збігається з адресою сторінки ${pageUrl}`;
  }
  add('canonical', 'seo', 'Canonical URL збігається з адресою сторінки', 2, canonicalStatus, canonicalDetail);

  const favicon = doc.querySelector('link[rel~="icon" i]');
  add('favicon', 'seo', 'Favicon', 1, favicon ? 'pass' : 'fail', favicon ? undefined : 'немає <link rel="icon">');

  // --- CSS (static part) ------------------------------------------------------
  const present = TOKENS.filter(([, value]) => cssFlat.includes(value.replace(/\s+/g, '').toLowerCase()));
  const missingTokens = TOKENS.filter((t) => !present.includes(t)).map(([name]) => name);
  const tokenShare = present.length / TOKENS.length;
  add(
    'tokens',
    'css',
    'Значення з tokens.css — без змін',
    3,
    !css.trim() ? 'skip' : tokenShare >= 0.9 ? 'pass' : tokenShare >= 0.6 ? 'warn' : 'fail',
    !css.trim()
      ? 'не вдалося прочитати CSS'
      : missingTokens.length
        ? `не знайдено значень ${missingTokens.slice(0, 5).join(', ')}${missingTokens.length > 5 ? ` і ще ${missingTokens.length - 5}` : ''}`
        : undefined,
  );

  const varUses = (css.match(/var\(\s*--/g) ?? []).length;
  add(
    'vars',
    'css',
    'Стилі використовують CSS-змінні',
    1,
    !css.trim() ? 'skip' : varUses >= 40 ? 'pass' : varUses >= 15 ? 'warn' : 'fail',
    `var(--…) у CSS: ${varUses}`,
  );

  const mq = [...css.matchAll(/@media([^{]+)\{/gi)].map((m) => m[1]);
  const hasBp = (px: number) =>
    mq.some((q) =>
      new RegExp(`(min-width\\s*:\\s*|width\\s*>=?\\s*)(${px}px|${px / 16}r?em)`, 'i').test(q),
    );
  const minCount = mq.filter((q) => /min-width|width\s*>/i.test(q)).length;
  const maxCount = mq.filter((q) => /max-width|width\s*</i.test(q)).length;
  const mqProblems: string[] = [];
  if (!hasBp(640)) mqProblems.push('немає min-width: 640px (40rem)');
  if (!hasBp(1024)) mqProblems.push('немає min-width: 1024px (64rem)');
  if (maxCount > minCount) mqProblems.push(`max-width-запитів (${maxCount}) більше, ніж min-width (${minCount}) — це не mobile-first`);
  add(
    'media-queries',
    'css',
    'Mobile-first media queries: 640 px і 1024 px',
    2,
    !css.trim() ? 'skip' : tally(mqProblems),
    mqProblems.join('; ') || undefined,
  );

  const frameworkRe = /bootstrap|tailwind|bulma|foundation|materialize|picocss|@picocss|uikit|semantic-ui|daisyui/i;
  const scripts = [...doc.querySelectorAll('script[src]')].map((s) => s.getAttribute('src') ?? '');
  const frameworks = [...styles.hrefs, ...scripts].filter((u) => frameworkRe.test(u));
  const frameworkInCss = /Bootstrap\s+v\d|tailwindcss\s+v\d|bulma\.io|Foundation for Sites/i.test(css);
  add(
    'no-framework',
    'css',
    'Власний CSS, без CSS-фреймворків',
    1,
    frameworks.length || frameworkInCss ? 'fail' : 'pass',
    frameworks.length ? `підключено ${frameworks[0]}` : frameworkInCss ? 'у CSS знайдено код фреймворку' : undefined,
  );

  // The focus rule: its variable name feeds the dark-section check.
  const focusRules = rules(css).filter((r) => r.selector.includes(':focus-visible'));
  const withOutline = focusRules.filter((r) => /outline(-color)?\s*:/i.test(r.body));
  const varRule = withOutline.find((r) => /outline(-color)?\s*:[^;]*var\(\s*--/i.test(r.body));
  add(
    'focus-visible',
    'a11y',
    'Є стиль :focus-visible через змінну кольору',
    1,
    !css.trim() ? 'skip' : varRule ? 'pass' : withOutline.length ? 'warn' : 'fail',
    varRule ? undefined : withOutline.length ? 'колір outline заданий напряму, а не через змінну' : 'немає правила :focus-visible з outline',
  );

  return {
    focusVar: varRule?.body.match(/outline(?:-color)?\s*:[^;]*var\(\s*(--[\w-]+)/i)?.[1] ?? '--color-focus',
    /** Rules that re-declare the outline per dark section instead of the variable. */
    repeatedFocus: withOutline.filter((r) => /footer|cta|dark|contacts/i.test(r.selector) && r !== varRule),
    hasClamp: /clamp\(/i.test(css),
    fontLinks: styles.fontLinks,
    css,
  };
}

function layoutChecks(add: Add, c: Computed, fromStatic: ReturnType<typeof staticChecks>) {
  const s = (w: Width) => c.snaps.get(w)!;

  const overflowing = WIDTHS.filter((w) => s(w).overflow > 1);
  const clipped = [c.bodyOverflowX, c.htmlOverflowX].some((v) => v === 'hidden' || v === 'clip');
  add(
    'no-hscroll',
    'layout',
    'Немає горизонтального scroll на 320, 375, 768 і 1440 px',
    8,
    overflowing.length === 0 ? 'pass' : overflowing.length === 1 ? 'warn' : 'fail',
    overflowing.length
      ? overflowing
          .map((w) => `${w} px: +${Math.round(s(w).overflow)} px${s(w).culprits.length ? ` (${s(w).culprits.map(describe).join(', ')})` : ''}`)
          .join('; ')
      : undefined,
  );
  add(
    'no-overflow-hidden',
    'layout',
    'Scroll не сховано через overflow-x: hidden на body',
    2,
    clipped ? 'fail' : 'pass',
    clipped ? `overflow-x: ${c.bodyOverflowX} на body / ${c.htmlOverflowX} на html` : undefined,
  );

  const cols = [s(375).gridColumns, s(768).gridColumns, s(1440).gridColumns];
  const wrongCols = [cols[0] !== 1, cols[1] !== 2, cols[2] !== 3].filter(Boolean);
  add(
    'grid-columns',
    'layout',
    'Картки: 1 → 2 → 3 колонки (375 / 768 / 1440 px)',
    6,
    cols[2] === null ? 'fail' : tally(wrongCols),
    cols[2] === null ? 'не знайдено сітку карток у #venues' : wrongCols.length ? `колонок: ${cols.join(' / ')}` : undefined,
  );

  const fd = s(1440).featured;
  const big = fd && fd.w >= fd.otherW * 1.8 && fd.h >= fd.otherH * 1.6;
  add(
    'featured-desktop',
    'layout',
    'Arena Sport на desktop — 2 колонки × 2 рядки',
    3,
    !fd ? 'fail' : big ? 'pass' : fd.w >= fd.otherW * 1.8 ? 'warn' : 'fail',
    !fd
      ? 'не знайдено картку Arena Sport у сітці'
      : big
        ? undefined
        : `ширина ×${(fd.w / fd.otherW).toFixed(1)}, висота ×${(fd.h / fd.otherH).toFixed(1)} від звичайної картки`,
  );
  const ft = s(768).featured;
  const fm = s(375).featured;
  const single = (f: Snapshot['featured']) => !!f && Math.abs(f.w - f.otherW) <= 4;
  add(
    'featured-small',
    'layout',
    'Arena Sport на tablet і mobile — одна комірка',
    2,
    !ft || !fm ? 'fail' : single(ft) && single(fm) ? 'pass' : single(fm) || single(ft) ? 'warn' : 'fail',
    ft && !single(ft) ? `768 px: ширина ${Math.round(ft.w)} px замість ${Math.round(ft.otherW)} px` : undefined,
  );

  const headerProblems: string[] = [];
  if (!s(1440).navShown) headerProblems.push('1440 px: навігацію не видно');
  if (s(1440).toggleShown) headerProblems.push('1440 px: кнопку «Меню» видно');
  for (const w of [375, 768] as const) {
    if (s(w).toggleShown === false || s(w).toggleShown === null) headerProblems.push(`${w} px: немає видимої кнопки «Меню»`);
    if (s(w).navShown) headerProblems.push(`${w} px: навігацію видно до відкриття меню`);
  }
  add('header-layout', 'layout', 'Header: меню до 1024 px, навігація в рядок з 1024 px', 4, tally(headerProblems), headerProblems.join('; ') || undefined);

  const heroOk = s(1440).heroSideBySide === true && s(375).heroSideBySide === false && s(768).heroSideBySide === false;
  add(
    'hero-layout',
    'layout',
    'Hero: 2 колонки з 1024 px, вертикально нижче',
    2,
    s(1440).heroSideBySide === null ? 'fail' : heroOk ? 'pass' : s(1440).heroSideBySide ? 'warn' : 'fail',
    s(1440).heroSideBySide === null
      ? 'не знайдено <h1> або hero-зображення'
      : heroOk
        ? undefined
        : s(1440).heroSideBySide
          ? 'на tablet / mobile зображення не під текстом'
          : '1440 px: текст і зображення не поруч',
  );

  // The first width each image kind goes wrong at. A box as tall as its
  // `height` attribute is the usual cause: the reset lacks `height: auto`, so
  // `aspect-ratio` has nothing to size.
  const imageProblems = new Map<string, string>();
  const measured = new Set<string>();
  let attrHeight = false;
  for (const w of [375, 768, 1440] as const) {
    for (const img of s(w).images) {
      measured.add(img.name);
      const problem = imageProblem(img);
      if (!problem || imageProblems.has(img.name)) continue;
      imageProblems.set(img.name, `${img.name} на ${w} px: ${problem}`);
      attrHeight ||= img.attrHeight;
    }
  }
  add(
    'img-ratio',
    'layout',
    'Пропорції зображень: hero 16 : 9 → 4 : 3 з 1024 px, картки 4 : 3, «Про сервіс» 4 : 5',
    3,
    measured.size ? tally([...imageProblems.values()]) : 'fail',
    measured.size
      ? [...imageProblems.values(), attrHeight && 'висота береться з атрибута height — бракує img { height: auto }']
          .filter(Boolean)
          .join('; ') || undefined
      : 'не знайдено зображень hero, карток і «Про сервіс»',
  );

  // A 2-column form with the button alone on a third row has two left edges
  // too — 2 × 2 needs the rows counted as well.
  const [fm375, fm768, fm1440] = [s(375).form, s(768).form, s(1440).form];
  const formMiss = [
    fm375?.cols !== 1,
    fm768?.cols !== 2 || fm768.rows !== 2,
    fm1440?.cols !== 4 || fm1440.rows !== 1,
  ].filter(Boolean).length;
  const grid = (f: Snapshot['form']) => (f ? `${f.cols} × ${f.rows}` : '—');
  add(
    'form-layout',
    'layout',
    'Форма: 1 колонка → 2 × 2 → 4 в рядок',
    3,
    !fm1440 ? 'fail' : formMiss === 0 ? 'pass' : formMiss === 1 ? 'warn' : 'fail',
    !fm1440
      ? 'не знайдено поля форми'
      : formMiss
        ? `колонок × рядків: ${grid(fm375)} / ${grid(fm768)} / ${grid(fm1440)}`
        : undefined,
  );

  const st = s(1440).stepsRow;
  const sm = s(768).stepsRow;
  add(
    'steps-layout',
    'layout',
    '«Як це працює»: 3 в ряд з 1024 px, вертикально нижче',
    1,
    !st || !sm ? 'fail' : st.rows === 1 && st.cols === 3 && sm.cols === 1 ? 'pass' : 'warn',
    !st || !sm ? 'не знайдено 3 кроки «Як це працює»' : undefined,
  );

  // --- CSS (computed part) ---------------------------------------------------
  const px = (value: number | null) => (value === null ? '—' : String(Math.round(value * 10) / 10));
  const near = (value: number | null, target: number) => value !== null && Math.abs(value - target) <= 1;
  const sizes = [
    near(s(375).h1, 32),
    near(s(1440).h1, 56),
    near(s(375).h2, 26),
    near(s(1440).h2, 40),
  ].filter(Boolean).length;
  const fluidOk = sizes === 4 && fromStatic.hasClamp;
  add(
    'fluid-type',
    'css',
    'Заголовки масштабуються через clamp(): h1 32 → 56 px, h2 26 → 40 px',
    2,
    fluidOk ? 'pass' : sizes >= 2 ? 'warn' : 'fail',
    fluidOk
      ? undefined
      : `h1: ${px(s(375).h1)} → ${px(s(1440).h1)} px, h2: ${px(s(375).h2)} → ${px(s(1440).h2)} px${fromStatic.hasClamp ? '' : '; clamp() у CSS не знайдено'}`,
  );

  const colorsOk = [c.background === 'rgb(246, 248, 245)', c.color === 'rgb(19, 32, 26)'].filter(Boolean).length;
  add(
    'base-colors',
    'css',
    'Фон і колір тексту сторінки — з токенів',
    1,
    colorsOk === 2 ? 'pass' : colorsOk === 1 ? 'warn' : 'fail',
    colorsOk === 2 ? undefined : `фон ${c.background}, текст ${c.color}`,
  );

  const googleCyr = fromStatic.fontLinks.some(
    (u) => /family=Montserrat/i.test(u) && (/\/css2\?/i.test(u) || /subset=[^&]*cyrillic/i.test(u)),
  );
  const fontOk = c.montserrat === 'cyrillic' || googleCyr;
  const usesFont = /montserrat/i.test(c.fontFamily);
  add(
    'font',
    'css',
    'Montserrat з підмножиною cyrillic',
    2,
    fontOk && usesFont ? 'pass' : fontOk || usesFont ? 'warn' : 'fail',
    !usesFont
      ? `font-family body: ${c.fontFamily}`
      : c.montserrat === 'latin-only' && !googleCyr
        ? 'Montserrat завантажено без кириличних символів'
        : !fontOk
          ? 'Montserrat не завантажено'
          : undefined,
  );

  add(
    'grid',
    'css',
    'CSS Grid для сітки карток',
    1,
    c.venueDisplay && /grid/.test(c.venueDisplay) ? 'pass' : 'fail',
    c.venueDisplay && !/grid/.test(c.venueDisplay) ? `display: ${c.venueDisplay}` : undefined,
  );

  const flexMissing = [
    !c.flex.header && 'header',
    !c.flex.form && 'форма',
    !c.flex.card && 'картки',
  ].filter((x): x is string => !!x);
  add('flex', 'css', 'Flexbox у header, формі та картках', 2, tally(flexMissing), flexMissing.length ? `немає flex: ${flexMissing.join(', ')}` : undefined);

  const darkOk = [c.focus.footer === ACCENT_RGB, c.focus.cta === ACCENT_RGB].filter(Boolean).length;
  const repeated = fromStatic.repeatedFocus.length > 0;
  add(
    'focus-dark',
    'a11y',
    'На темних секціях перевизначено змінну кольору фокусу',
    2,
    darkOk === 2 && !repeated ? 'pass' : darkOk >= 1 ? 'warn' : 'fail',
    [
      c.focus.footer !== ACCENT_RGB && `footer: ${c.focus.footer ?? 'змінну не задано'}`,
      c.focus.cta !== ACCENT_RGB && `Final CTA: ${c.focus.cta ?? 'не знайдено кнопку «Знайти майданчик»'}`,
      repeated && `повторено правило :focus-visible (${fromStatic.repeatedFocus[0].selector.slice(0, 50)})`,
    ]
      .filter(Boolean)
      .join('; ') || undefined,
  );
}

function menuCheck(add: Add, m: MenuResult | null) {
  const title = 'Mobile menu відкривається й закривається, aria-expanded змінюється';
  if (!m) return add('menu-works', 'a11y', title, 3, 'skip', 'скрипт сторінки не відповів за 25 с');
  if (m.error) return add('menu-works', 'a11y', title, 3, 'fail', `помилка під час перевірки: ${m.error}`);
  if (!m.found) return add('menu-works', 'a11y', title, 3, 'fail', 'не знайдено кнопку з aria-expanded');
  const problems: string[] = [];
  if (!m.visible) problems.push('на 375 px кнопку не видно');
  if (m.e0 !== 'false') problems.push(`на старті aria-expanded="${m.e0}", а має бути "false"`);
  if (m.e1 !== 'true' && !m.l1) {
    problems.push('натискання кнопки не відкриває меню');
  } else {
    if (m.e1 !== 'true') problems.push('після натискання aria-expanded не став "true"');
    if (!m.l1) problems.push('після натискання посилань меню не видно');
    if (m.e2 !== 'false') problems.push('повторне натискання не повертає aria-expanded="false"');
    else if (m.l2) problems.push('після закриття посилання лишаються видимими');
  }
  const dead = m.e1 !== 'true' && !m.l1;
  add('menu-works', 'a11y', title, 3, dead ? 'fail' : tally(problems), problems.join('; ') || undefined);
}

async function seoFiles(add: Add, doc: Document, pageUrl: string, base: string) {
  const og = (p: string) => clean(doc.querySelector(`meta[property="og:${p}"]`)?.getAttribute('content'));
  const ogProblems: string[] = [];
  for (const p of ['title', 'description', 'url', 'image']) if (!og(p)) ogProblems.push(`немає og:${p}`);
  const ogUrl = og('url');
  if (ogUrl && !samePage(ogUrl, pageUrl)) {
    ogProblems.push(
      otherSite(ogUrl, pageUrl)
        ? `og:url веде на інший сайт: «${ogUrl}»`
        : `og:url «${ogUrl}» не збігається з адресою сторінки`,
    );
  }
  const ogImage = og('image');
  if (ogImage && !/^https?:\/\//i.test(ogImage)) ogProblems.push(`og:image «${ogImage}» — не абсолютний URL`);
  else if (ogImage) {
    if (!/og-image\.jpg(\?|$)/i.test(ogImage)) ogProblems.push('og:image має вести на og-image.jpg');
    // A cross-origin error without CORS hides its status from fetch(); an
    // <img> still tells loaded from not.
    const res = await tryGet(ogImage, 10000);
    if (res && !res.ok) ogProblems.push(`og:image «${ogImage}» не відкривається (${res.status})`);
    else if (!res && !(await imageLoads(ogImage))) ogProblems.push(`og:image «${ogImage}» не відкривається`);
  }
  add('og', 'seo', 'Open Graph: og:title, og:description, og:url, абсолютний og:image', 2, tally(ogProblems), ogProblems.join('; ') || undefined);

  // "У корені сайту": for a GitHub project site that is the repo's folder,
  // not the github.io root the student may not own — accept either.
  const candidates = (file: string) => [...new Set([new URL(file, base).href, new URL(`/${file}`, base).href])];
  const firstFile = async (file: string) => {
    for (const href of candidates(file)) {
      const res = await tryGet(href, 10000);
      if (isRealFile(res)) return res;
    }
    return null;
  };
  const [robots, sitemap] = await Promise.all([firstFile('robots.txt'), firstFile('sitemap.xml')]);
  add(
    'robots',
    'seo',
    'robots.txt',
    1,
    robots && /user-agent\s*:/i.test(robots.text) ? 'pass' : robots ? 'warn' : 'fail',
    robots ? (/user-agent\s*:/i.test(robots.text) ? undefined : 'у файлі немає рядка User-agent') : 'файл не знайдено',
  );
  const locs = sitemap ? [...sitemap.text.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) => m[1]) : [];
  const listed = locs.some((loc) => samePage(loc, pageUrl));
  add(
    'sitemap',
    'seo',
    'sitemap.xml з адресою сторінки',
    2,
    !sitemap ? 'fail' : listed ? 'pass' : 'warn',
    !sitemap
      ? 'файл не знайдено'
      : listed
        ? undefined
        : locs.length
          ? `у <loc> ${locs[0]}, а сторінка — ${pageUrl}`
          : 'у файлі немає <loc>',
  );
}

// ---------------------------------------------------------------------------
// Lighthouse via PageSpeed Insights

async function lighthouse(pageUrl: string, key: string): Promise<Check[]> {
  // In the order of the Lighthouse report, so ticking follows the screenshot.
  const cats: [string, string, string][] = [
    ['performance', 'lh-perf', 'Performance ≥ 90'],
    ['accessibility', 'lh-a11y', 'Accessibility ≥ 90'],
    ['best-practices', 'lh-bp', 'Best Practices ≥ 90'],
    ['seo', 'lh-seo', 'SEO ≥ 90'],
  ];
  const params = new URLSearchParams({ url: pageUrl, strategy: 'mobile', locale: 'uk' });
  for (const [cat] of cats) params.append('category', cat.toUpperCase().replace('-', '_'));
  if (key) params.set('key', key);

  const row = (id: string, title: string, status: Status, detail: string): Check => ({
    id,
    group: 'lighthouse',
    title,
    weight: 3,
    status,
    detail,
    confirmable: 'tick',
  });
  const skipped = (why: string): Check[] => cats.map(([, id, title]) => row(id, title, 'skip', why));

  // PSI fetches the page from Google's servers, which cannot see localhost.
  if (/^(localhost|127\.0\.0\.1)$/.test(new URL(pageUrl).hostname)) {
    return skipped('PageSpeed Insights не бачить localhost');
  }

  let data: {
    error?: { code?: number; message?: string };
    lighthouseResult?: { categories?: Record<string, { score: number | null }>; runtimeError?: { message?: string } };
  };
  try {
    const res = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params}`, {
      signal: AbortSignal.timeout(120000),
    });
    data = await res.json();
  } catch {
    return skipped('PageSpeed Insights не відповів');
  }
  if (data.error) {
    return skipped(
      data.error.code === 429
        ? 'вичерпано ліміт PageSpeed Insights'
        : `PageSpeed Insights: ${data.error.message ?? 'помилка'}`,
    );
  }
  const categories = data.lighthouseResult?.categories;
  if (!categories) return skipped(data.lighthouseResult?.runtimeError?.message ?? 'Lighthouse не повернув результат');

  return cats.map(([cat, id, title]) => {
    const raw = categories[cat]?.score;
    if (raw === null || raw === undefined) return row(id, title, 'skip', 'PageSpeed Insights: немає оцінки');
    const value = Math.round(raw * 100);
    const status: Status = value >= 90 ? 'pass' : value >= 80 ? 'warn' : 'fail';
    return row(id, title, status, `PageSpeed Insights: ${value} / 100`);
  });
}

// ---------------------------------------------------------------------------
// Entry points

/** A Courtly page fetched and parsed, ready to render (`loadPage()`). */
export interface LoadedPage {
  /** After redirects. */
  pageUrl: string;
  /** The HTML as authored. */
  doc: Document;
  /** What its relative URLs resolve against: a `<base>`, else `pageUrl`. */
  base: string;
  /** See `Inspection.preview`. */
  preview: string;
}

/**
 * Fetches the page and makes sure it is a Courtly page: throws `CheckError`
 * with a message for the user when it is not, or cannot be loaded.
 */
export async function loadPage(rawUrl: string): Promise<LoadedPage> {
  const url = normalizeUrl(rawUrl);
  let page: Fetched;
  try {
    page = await get(url.href);
  } catch {
    throw new CheckError(
      'Не вдалося завантажити сторінку. Перевірте адресу і те, що сайт відкривається в Incognito без авторизації.',
    );
  }
  if (page.status === 401 || page.status === 403) {
    throw new CheckError(
      `Сервер відповів ${page.status}: сторінка вимагає авторизації. На Vercel вимкніть Deployment Protection для production.`,
    );
  }
  if (!page.ok) throw new CheckError(`Сервер відповів ${page.status}. Перевірте адресу сторінки.`);
  if (!/<(html|body|head)[\s>]/i.test(page.text)) throw new CheckError('За цією адресою не HTML-сторінка.');

  const pageUrl = page.url;
  const doc = new DOMParser().parseFromString(page.text, 'text/html');

  // Generic good practice (meta, lang, landmarks) would otherwise earn a
  // non-Courtly page a few points. Two venue names or #venues is enough.
  const text = doc.body?.textContent ?? '';
  const named = VENUES.filter((v) => text.includes(v)).length;
  if (!doc.getElementById('venues') && named < 2) {
    throw new CheckError(
      'Схоже, це не сторінка Courtly: немає секції #venues і назв майданчиків. Перевірте, що вставили адресу саме ЛР-7.',
    );
  }
  const baseHref = doc.querySelector('base[href]')?.getAttribute('href');
  const base = baseHref ? new URL(baseHref, pageUrl).href : pageUrl;
  return { pageUrl, doc, base, preview: frameSource(doc, base, 'layout') };
}

export async function inspect(rawUrl: string, onProgress: (text: string) => void, psiKey = ''): Promise<Inspection> {
  onProgress('Завантаження сторінки…');
  const { pageUrl, doc, base, preview } = await loadPage(rawUrl);

  // PSI is slow — start it now, report it when it lands.
  const lighthousePromise = lighthouse(pageUrl, psiKey);

  onProgress('Читання CSS…');
  const styles = await collectStyles(doc, base);

  const checks: Check[] = [];
  const add: Add = (id, group, title, weight, status, detail) => checks.push({ id, group, title, weight, status, detail });

  const fromStatic = staticChecks(add, doc, pageUrl, styles);
  if (styles.unreadable.length) {
    add(
      'css-readable',
      'css',
      'Усі стилі доступні для читання',
      0,
      'warn',
      `не вдалося прочитати ${styles.unreadable.slice(0, 2).join(', ')} — частину CSS-перевірок могло бути занижено`,
    );
  }

  onProgress('robots.txt, sitemap.xml, og:image…');
  const seoDone = seoFiles(add, doc, pageUrl, base);

  const computed = await measure(doc, base, fromStatic.focusVar, (w) => onProgress(`Рендеринг на ${w} px…`));
  layoutChecks(add, computed, fromStatic);

  onProgress('Перевірка mobile menu…');
  menuCheck(add, await probeMenu(doc, base));
  await seoDone;

  // Nothing to measure: the instructor compares in the viewer and ticks.
  for (const view of MOCKUP_VIEWS) {
    checks.push({
      id: `mockup-${view.width}`,
      group: 'mockup',
      title: `${view.label} ${view.width} px — як у макеті`,
      weight: 3,
      status: 'skip',
      confirmable: 'verdict',
    });
  }

  return { pageUrl, checks, lighthouse: lighthousePromise, preview };
}

/**
 * The checks as scored and reported, with the instructor's verdicts applied
 * to confirmable rows (a tick is the verdict `pass`). A verdict replaces
 * whatever the checker said, except a checker `pass`, which stands. With no
 * verdict, a row the checker graded keeps its status, and one it could not
 * check (`skip`) becomes `fail`, so it costs its weight instead of leaving the
 * denominator. A note on a judged row is the reason the student will read.
 */
export function withVerdicts(
  checks: Check[],
  verdicts: ReadonlyMap<string, Verdict>,
  notes: ReadonlyMap<string, string> = new Map(),
): Check[] {
  return checks.map((c): Check => {
    if (!c.confirmable || c.status === 'pass') return c;
    const done = c.confirmable === 'tick' ? 'підтверджено вручну' : 'оцінено вручну';
    const verdict = verdicts.get(c.id);
    if (verdict) {
      const note = notes.get(c.id)?.trim();
      const said = note ? `${done}: ${note}` : done;
      const auto = c.status !== 'skip' && c.detail;
      return { ...c, status: verdict, manual: true, detail: auto ? `${said}; ${c.detail}` : said };
    }
    if (c.status !== 'skip') return c;
    return { ...c, status: 'fail', detail: c.detail ? `не ${done}; ${c.detail}` : `не ${done}` };
  });
}

/**
 * Points of the 12 that the mockup group — the instructor's verdicts at three
 * widths — carries (instructor, 2026-10-04); the other rows share the rest by
 * weight. A fixed share, so adding automated rows cannot dilute the verdicts:
 * with weights alone, a page judged unlike the mockup at every width still
 * scored 11.
 */
export const MOCKUP_POINTS = 4;

/**
 * The two weighted shares → 12-point mark (see `MOCKUP_POINTS`); with rows of
 * one part only, as for a group, that part's share. Pass it `withVerdicts()`
 * output, or confirmable rows leave the denominator.
 */
export function scoreChecks(checks: Check[]): Score {
  const part = (rows: Check[]) => {
    let earned = 0;
    let max = 0;
    for (const c of rows) {
      if (c.status === 'skip' || c.weight === 0) continue;
      max += c.weight;
      earned += c.status === 'pass' ? c.weight : c.status === 'warn' ? c.weight / 2 : 0;
    }
    return { earned, max, share: max ? earned / max : 0 };
  };
  const mockup = part(checks.filter((c) => c.group === 'mockup'));
  const rest = part(checks.filter((c) => c.group !== 'mockup'));
  const percent =
    mockup.max && rest.max
      ? (rest.share * (12 - MOCKUP_POINTS) + mockup.share * MOCKUP_POINTS) / 12
      : mockup.max
        ? mockup.share
        : rest.share;
  return {
    percent,
    earned: mockup.earned + rest.earned,
    max: mockup.max + rest.max,
    mark: Math.min(12, Math.max(1, Math.round(percent * 12))),
  };
}

// ---------------------------------------------------------------------------
// Wording shared by the check dialog, its copied report and the report page

export const STATUS_LABEL: Record<Status, string> = {
  pass: 'Виконано',
  warn: 'Частково',
  fail: 'Не виконано',
  skip: 'Не перевірено',
};

export const STATUS_ICON: Record<Status, string> = {
  pass: '✓',
  warn: '!',
  fail: '✕',
  skip: '–',
};

/**
 * "92 % | виконано 49 | частково 2 | не виконано 4 (усього 55)". Partial
 * rows earn half, so they are counted apart from failed ones; zero counts are
 * left out; rows nothing could check come after the total.
 */
export function summaryLine(checks: Check[]): string {
  const scored = checks.filter((c) => c.weight > 0 && c.status !== 'skip');
  const n = (s: Status) => checks.filter((c) => c.weight > 0 && c.status === s).length;
  const part = (s: Status) => `${STATUS_LABEL[s].toLowerCase()} ${n(s)}`;
  const parts =
    n('pass') === scored.length
      ? [`виконано всі ${scored.length}`]
      : [part('pass'), n('warn') ? part('warn') : '', n('fail') ? part('fail') : ''].filter(Boolean);
  const total = n('pass') === scored.length ? '' : ` (усього ${scored.length})`;
  const unchecked = n('skip') ? ` | ${part('skip')}` : '';
  return `${Math.round(scoreChecks(checks).percent * 100)} % | ${parts.join(' | ')}${total}${unchecked}`;
}

/** Share of a group's weight earned, shown beside its title; "" when nothing is scored. */
export function groupScore(rows: Check[]): string {
  const score = scoreChecks(rows);
  if (score.max) return `${Math.round(score.percent * 100)} %`;
  if (rows.length && rows.every((c) => c.status === 'skip')) return 'не перевірено';
  return '';
}

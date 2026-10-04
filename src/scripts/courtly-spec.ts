/**
 * ЛР-7 requirements on the rendered page — the highlights in the mockup
 * comparison, both in the check dialog's «Порівняти» and on the report page.
 *
 * Every criterion is a requirement written in the handout
 * (`src/content/labs/lab-7.md`) or the design spec
 * (`src/content/tasks/lab-7.md`), and cites its section. `evaluate()` checks
 * them on a page rendered at one width and says, per criterion, what was
 * expected and what the page has. There is no pixel diff and no rule that is
 * not written down; the instructor's verdict on the mockup match stays the
 * only thing that scores it.
 *
 * - `fail` — the page misses a written requirement at this width.
 * - `skip` — the elements could not be located, so nothing is claimed; odd
 *   markup must not produce a false alarm.
 * - `info` — a section much taller or shorter than in the mockup. The handout
 *   allows minor deviations, so this only points at where to look.
 *
 * Columns, the form grid, the header and image proportions are measured by
 * the scored checks' own `locate()` / `snapshot()`, so a highlight cannot
 * disagree with a scored row. Fluid sizes come from the `clamp()` token strings at the shown width.
 */
import mockup from '@/data/courtly-mockup.json';
import {
  TOKENS,
  commonAncestor,
  ctaLink,
  distinct,
  findSection,
  imageProblem,
  locate,
  sectionAnchors,
  shownIn,
  snapshot,
  type Located,
  type Snapshot,
} from '@/scripts/courtly-check';

export type SpecStatus = 'fail' | 'pass' | 'skip' | 'info';

export type SpecGroupId = 'structure' | 'grid' | 'size' | 'color' | 'height';

export const SPEC_GROUPS: { id: SpecGroupId; title: string }[] = [
  { id: 'structure', title: 'Структура' },
  { id: 'grid', title: 'Сітка й breakpoints' },
  { id: 'size', title: 'Розміри й відступи' },
  { id: 'color', title: 'Кольори й форма' },
  { id: 'height', title: 'Висота секцій' },
];

interface Criterion {
  group: SpecGroupId;
  /** A word or two for the outline's tag on the page. */
  label: string;
  /** The requirement, as the student reads it. */
  title: string;
  source: string;
}

/** The catalogue: what each criterion asks and where it is written. */
export const CRITERIA = {
  S1: {
    group: 'structure',
    label: 'Порядок секцій',
    title: 'Порядок секцій: header → hero → форма пошуку → майданчики → як це працює → про сервіс → CTA → footer',
    source: 'Завдання §1 · Макет §1',
  },
  S2: { group: 'structure', label: 'Секції', title: 'Є всі секції з таблиці §1', source: 'Завдання §1' },
  L1: {
    group: 'grid',
    label: 'Header',
    title: 'Header: кнопка «Меню» до 1024 px, навігація в рядок з 1024 px',
    source: 'Макет §3',
  },
  L2: {
    group: 'grid',
    label: 'Hero',
    title: 'Hero: вертикально до 1024 px, 2 колонки з 1024 px',
    source: 'Макет §3',
  },
  L3: {
    group: 'grid',
    label: 'Зображення',
    title: 'Зображення: hero 16 : 9 до 1024 px, 4 : 3 з 1024 px; картки 4 : 3; «Про сервіс» 4 : 5; без розтягування',
    source: 'Макет §3, §4 · Hero, Картка, Інформаційний блок',
  },
  L4: {
    group: 'grid',
    label: 'Форма',
    title: 'Форма пошуку: 1 колонка, 2 × 2 з 640 px, 4 в рядок з 1024 px',
    source: 'Макет §3',
  },
  L5: {
    group: 'grid',
    label: 'Картки',
    title: 'Картки: 1 колонка, 2 з 640 px, 3 з 1024 px; проміжок 24 px',
    source: 'Макет §3, §4 · Картка',
  },
  L6: {
    group: 'grid',
    label: 'Featured',
    title: 'Arena Sport: одна комірка, зображення над текстом; з 1024 px — 2 × 2, зображення ліворуч, текст праворуч',
    source: 'Макет §3, §4 · Featured card',
  },
  L7: {
    group: 'grid',
    label: 'Кроки',
    title: '«Як це працює»: вертикально до 1024 px, 3 в ряд з 1024 px',
    source: 'Макет §3',
  },
  L8: {
    group: 'grid',
    label: 'Про сервіс',
    title: 'Інформаційний блок: вертикально до 768 px, 2 колонки з 768 px',
    source: 'Макет §3',
  },
  L9: {
    group: 'grid',
    label: 'Footer',
    title: 'Footer: 1 колонка, 2 з 640 px, 4 з 1024 px',
    source: 'Макет §3, §4 · Footer',
  },
  L10: {
    group: 'grid',
    label: 'Scroll',
    title: 'Немає горизонтального scroll',
    source: 'Завдання §2.8',
  },
  L11: {
    group: 'grid',
    label: 'Соцмережі',
    title: 'Footer: посилання на соцмережі в рядок, з переносом',
    source: 'Макет §4 · Footer',
  },
  D1: {
    group: 'size',
    label: 'Контейнер',
    title: 'Контейнер: до 1200 px плюс бічні відступи --container-gutter',
    source: 'Макет §2, §4',
  },
  D2: {
    group: 'size',
    label: 'Відступ секції',
    title: 'Секції #venues, #how, #about: відступ зверху й знизу --space-section',
    source: 'Макет §4 · Загальне',
  },
  D3: { group: 'size', label: 'Висота header', title: 'Header заввишки 72 px', source: 'Макет §4 · Header' },
  D4: {
    group: 'size',
    label: 'Висота',
    title: 'Поля форми й кнопки — 48 px, кнопки hero і CTA — 56 px',
    source: 'Макет §2, §4 · Кнопки',
  },
  D5: {
    group: 'size',
    label: 'Шрифт',
    title: 'Розмір h1, h2, h3 і lead (опис hero, опис секції, текст CTA) — з clamp() у токенах; заголовки — 800',
    source: 'Макет §2 · Типографіка, §4',
  },
  D6: {
    group: 'size',
    label: 'Footer',
    title: 'Footer: відступ зверху 64 px, текст 14 px, заголовки колонок 16 px і 800',
    source: 'Макет §4 · Footer',
  },
  C1: {
    group: 'color',
    label: 'body',
    title: 'Сторінка: фон #f6f8f5, текст #13201a',
    source: 'Макет §4 · Загальне',
  },
  C2: {
    group: 'color',
    label: 'Header',
    title: 'Header: фон #ffffff, знизу рамка 1 px #d5dfd8',
    source: 'Макет §4 · Header',
  },
  C3: {
    group: 'color',
    label: 'Кроки',
    title: '«Як це працює»: фон секції #eaf1ec; кроки #ffffff, радіус 20 px',
    source: 'Макет §4 · Як це працює',
  },
  C4: {
    group: 'color',
    label: 'Форма',
    title: 'Форма: фон #ffffff, радіус 20 px; поля — фон #f6f8f5, радіус 8 px',
    source: 'Макет §4 · Форма пошуку',
  },
  C5: {
    group: 'color',
    label: 'Картки',
    title: 'Картки: фон #ffffff, рамка 1 px #d5dfd8, радіус 20 px',
    source: 'Макет §4 · Картка',
  },
  C6: {
    group: 'color',
    label: 'Кнопки',
    title: 'Кнопки: primary #0b6e4f, outline з рамкою #0b6e4f у звичайних картках, accent #c6f432 з текстом #0f2a1f у CTA; радіус 12 px',
    source: 'Макет §4 · Кнопки',
  },
  C7: {
    group: 'color',
    label: 'Чипи',
    title: 'Чип «вид спорту»: фон #e3f1ea, текст #0b6e4f',
    source: 'Макет §4 · Картка',
  },
  C8: {
    group: 'color',
    label: 'Badge',
    title: 'Badge «Вибір тижня»: фон #c6f432, великі літери',
    source: 'Макет §4 · Картка',
  },
  C9: {
    group: 'color',
    label: 'CTA',
    title: 'Final CTA: фон #0f2a1f, радіус 20 px, заголовок #f1f7f3',
    source: 'Макет §4 · Final CTA',
  },
  C10: {
    group: 'color',
    label: 'Footer',
    title: 'Footer: фон #0f2a1f, текст #b4c7bb, заголовки колонок #f1f7f3',
    source: 'Макет §4 · Footer',
  },
  H1: {
    group: 'height',
    label: 'Висота',
    title: 'Секція помітно — понад 30 % — вища або нижча, ніж у макеті',
    source: 'Макет §1',
  },
} satisfies Record<string, Criterion>;

export type CriterionId = keyof typeof CRITERIA;

/** A stretch of the page, in document px at the evaluated width. */
export interface Band {
  top: number;
  bottom: number;
}

export interface Finding extends Criterion {
  /** Unique within one evaluation: the id, or `H1:<section>`. */
  key: string;
  id: CriterionId;
  status: SpecStatus;
  expected?: string;
  /** What the page has; for `skip`, why nothing was measured. */
  actual?: string;
  /** Elements to outline; empty unless `fail`. */
  els: Element[];
  /** A section to outline instead (`H1`). */
  band?: Band;
}

/** Fixed sizes from `tokens.css` that the spec quotes in px (§2, §4). */
const PX = {
  containerMax: 1200,
  header: 72,
  control: 48,
  controlLarge: 56,
  gap: 24,
  radiusSm: 8,
  radiusMd: 12,
  radiusLg: 20,
  /** --space-3xl, the footer's padding-top. */
  footerTop: 64,
};

const SECTIONS: [string, string][] = [
  ['header', 'Header'],
  ['hero', 'Hero'],
  ['search', 'Форма пошуку'],
  ['venues', 'Популярні майданчики'],
  ['how', 'Як це працює'],
  ['about', 'Інформаційний блок'],
  ['cta', 'Final CTA'],
  ['footer', 'Footer'],
];
const sectionName = (key: string) => SECTIONS.find(([k]) => k === key)?.[1] ?? key;

// ---------------------------------------------------------------------------
// Values

const token = (name: string) => TOKENS.find(([n]) => n === name)![1];

/** A token's `clamp()` (or plain length) in px at viewport `width`; 1rem = 16px. */
export function tokenPx(name: string, width: number): number {
  const sum = (expr: string) =>
    [...expr.matchAll(/([+-]?)\s*([\d.]+)(rem|px|vw)/g)].reduce(
      (total, [, sign, n, unit]) =>
        total + (sign === '-' ? -1 : 1) * Number(n) * (unit === 'rem' ? 16 : unit === 'vw' ? width / 100 : 1),
      0,
    );
  const value = token(name);
  const args = value.match(/^clamp\((.*)\)$/)?.[1].split(',');
  if (!args) return sum(value);
  const [lo, mid, hi] = args.map(sum);
  return Math.min(hi, Math.max(lo, mid));
}

function alpha(color: string): number {
  if (color === 'transparent') return 0;
  const rgba = color.match(/^rgba\([^)]*,\s*([\d.]+)\)$/);
  if (rgba) return Number(rgba[1]);
  const slash = color.match(/\/\s*([\d.]+)(%?)\s*\)$/);
  if (slash) return Number(slash[1]) / (slash[2] ? 100 : 1);
  return 1;
}

/** `rgb(11, 110, 79)` → `#0b6e4f`; transparent and other forms spelled out. */
function hex(color: string): string {
  const m = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/);
  if (!m) return color;
  const a = m[4] === undefined ? 1 : Number(m[4]);
  if (a === 0) return 'прозорий';
  const out = `#${[m[1], m[2], m[3]].map((n) => Number(n).toString(16).padStart(2, '0')).join('')}`;
  return a === 1 ? out : `${out} (${Math.round(a * 100)} %)`;
}

const round = (n: number) => String(Math.round(n));

/**
 * Where an element's background comes from: its own, else a child that fills
 * it (an inner wrapper), else the nearest ancestor that paints one.
 */
function surface(win: Window, el: Element): { el: Element; color: string } {
  const bg = (e: Element) => win.getComputedStyle(e).backgroundColor;
  if (alpha(bg(el)) > 0) return { el, color: bg(el) };
  const box = el.getBoundingClientRect();
  for (const child of el.querySelectorAll('*')) {
    const r = child.getBoundingClientRect();
    if (r.width >= box.width - 2 && r.height >= box.height - 2 && alpha(bg(child)) > 0) return { el: child, color: bg(child) };
  }
  for (let p = el.parentElement; p; p = p.parentElement) if (alpha(bg(p)) > 0) return { el: p, color: bg(p) };
  return { el: win.document.documentElement, color: 'rgb(255, 255, 255)' };
}

// Each returns a problem to report, or null.
const colorIs = (what: string, computed: string, tokenName: string) =>
  hex(computed) === token(tokenName) ? null : `${what} ${hex(computed)}`;

function radiusIs(win: Window, what: string, el: Element, px: number) {
  const r = parseFloat(win.getComputedStyle(el).borderTopLeftRadius) || 0;
  return Math.abs(r - px) <= 1 ? null : `${what} ${round(r)} px`;
}

function borderIs(win: Window, what: string, el: Element, side: 'Top' | 'Bottom', tokenName: string) {
  const cs = win.getComputedStyle(el);
  const width = cs.getPropertyValue(`border-${side.toLowerCase()}-style`) === 'none' ? 0 : parseFloat(cs[`border${side}Width`]);
  const color = cs[`border${side}Color`];
  if (Math.abs(width - 1) <= 0.5 && hex(color) === token(tokenName)) return null;
  return width ? `${what} ${round(width)} px ${hex(color)}` : `${what}: немає`;
}

// ---------------------------------------------------------------------------
// Rules

interface Ctx {
  doc: Document;
  win: Window;
  width: number;
  /** 0: < 640 px, 1: 640–1023 px, 2: ≥ 1024 px — the spec's three columns. */
  tier: 0 | 1 | 2;
  at: Located;
  snap: Snapshot;
}

interface Result {
  ok: boolean;
  expected: string;
  actual: string;
  els?: Element[];
  band?: Band;
}

/** A result, or why the criterion could not be checked. */
type Rule = (ctx: Ctx) => Result | string;

/**
 * Problems per element → one result. The same problem on several elements is
 * reported once with a count; the outlines show which.
 */
function judge(expected: string, rows: [Element, (string | null)[]][]): Result {
  const bad = rows.map(([el, ps]) => [el, ps.filter((p): p is string => !!p)] as const).filter(([, ps]) => ps.length);
  const counts = new Map<string, number>();
  for (const [, ps] of bad) counts.set(ps.join(', '), (counts.get(ps.join(', ')) ?? 0) + 1);
  const actual = [...counts].map(([text, n]) => (n > 1 ? `${text} (×${n})` : text)).join('; ');
  return { ok: !bad.length, expected, actual: actual || 'як очікується', els: bad.map(([el]) => el) };
}

const cols = (n: number) => `${n} ${n === 1 ? 'колонка' : n < 5 ? 'колонки' : 'колонок'}`;

/** 1 × 4 → «1 колонка», 4 × 1 → «4 в рядок», otherwise «2 × 3». */
const gridName = (c: number, r: number) => (c === 1 ? cols(1) : r === 1 ? `${c} в рядок` : `${c} × ${r}`);

/** Vertical overlap and no horizontal one: two columns. */
function sideBySide(a: DOMRect, b: DOMRect): boolean {
  const overlapY = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1;
  return overlapY && (a.right <= b.left + 8 || b.right <= a.left + 8);
}

/** Smallest horizontal and vertical gaps between neighbouring boxes. */
function gaps(els: Element[]): { x: number | null; y: number | null } {
  const rects = els.map((el) => el.getBoundingClientRect()).filter((r) => r.width > 0);
  let x = Infinity;
  let y = Infinity;
  for (const a of rects) {
    for (const b of rects) {
      if (a === b) continue;
      const overlapY = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1;
      const overlapX = Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1;
      if (overlapY && b.left >= a.right - 1) x = Math.min(x, b.left - a.right);
      if (overlapX && b.top >= a.bottom - 1) y = Math.min(y, b.top - a.bottom);
    }
  }
  return { x: Number.isFinite(x) ? x : null, y: Number.isFinite(y) ? y : null };
}

/** Section tops in document px; a section the page lacks is left out. */
function sectionTops(doc: Document): Record<string, number> {
  const tops = sectionAnchors(doc);
  delete tops.end;
  const header = doc.querySelector('header');
  if (header) tops.header = header.getBoundingClientRect().top + (doc.defaultView?.scrollY ?? 0);
  return tops;
}

/** The section element an id is on or in. */
const sectionOf = (el: Element) => (el.tagName === 'SECTION' ? el : el.closest('section') ?? el);

/**
 * Distance from the section's edges to what is drawn inside it: text,
 * replaced elements and boxes with a background or border. A wrapper as tall
 * as the section is looked through, not counted.
 */
function insets(win: Window, block: Element): [number, number] {
  const box = block.getBoundingClientRect();
  let top = Infinity;
  let bottom = -Infinity;
  for (const el of block.querySelectorAll('*')) {
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) continue;
    if (r.top <= box.top + 1 && r.bottom >= box.bottom - 1) continue;
    let drawn = /^(img|svg|video|canvas|picture|input|select|textarea|button)$/i.test(el.tagName);
    if (!drawn) drawn = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim());
    if (!drawn) {
      const cs = win.getComputedStyle(el);
      drawn = alpha(cs.backgroundColor) > 0 || parseFloat(cs.borderTopWidth) > 0 || parseFloat(cs.borderBottomWidth) > 0;
    }
    if (!drawn) continue;
    top = Math.min(top, r.top);
    bottom = Math.max(bottom, r.bottom);
  }
  return [top - box.top, box.bottom - bottom];
}

/** The «Забронювати» control inside a card. */
const bookIn = (card: Element) =>
  [...card.querySelectorAll('a, button')].find((el) => /забронювати/i.test(el.textContent ?? '')) ?? null;

/** The innermost elements whose whole text matches. */
function byText(scope: Element, re: RegExp): Element[] {
  const text = (el: Element) => (el.textContent ?? '').replace(/\s+/g, ' ').trim();
  return [...scope.querySelectorAll('*')].filter((el) => re.test(text(el)) && ![...el.children].some((c) => re.test(text(c))));
}

/** A heading's lead: the paragraph right after it (hero, section head, CTA). */
const leadAfter = (heading: Element | null | undefined) => {
  const next = heading?.nextElementSibling;
  return next?.tagName === 'P' ? next : null;
};

const footerOf = (doc: Document) => doc.getElementById('contacts') ?? [...doc.querySelectorAll('footer')].pop() ?? null;

/** The column titles, by the mockup's texts; not the «Контакти» nav link. */
const footerTitles = (footer: Element) =>
  byText(footer, /^(навігація|контакти|ми в соцмережах|соцмережі)$/i).filter((el) => !el.closest('a'));

/** The footer's text links, not the logo. */
const footerLinks = (footer: Element) =>
  [...footer.querySelectorAll('a[href]')].filter((a) => !a.querySelector('img, svg') && (a.textContent ?? '').trim());

/** The social links: by host, else by name. */
const socialLinks = (footer: Element) =>
  footerLinks(footer).filter((a) =>
    /instagram|facebook|telegram|t\.me|twitter|x\.com|youtube|tiktok|linkedin/i.test(`${a.getAttribute('href')} ${a.textContent}`),
  );

/** Final CTA: its «Знайти майданчик» link, the dark block and the heading. */
function ctaParts(doc: Document, win: Window) {
  const link = ctaLink(doc);
  if (!link?.parentElement) return null;
  const block = surface(win, link.parentElement);
  // Nearest first: the block may be <body> when the CTA paints no background.
  const heading =
    link.parentElement.querySelector('h2') ??
    link.closest('section')?.querySelector('h2') ??
    (block.el === doc.body || block.el === doc.documentElement ? null : block.el.querySelector('h2'));
  return { link, block, heading };
}

const RULES: Record<Exclude<CriterionId, 'H1'>, Rule> = {
  S1: ({ doc }) => {
    const tops = sectionTops(doc);
    const present = SECTIONS.filter(([k]) => tops[k] !== undefined);
    if (present.length < 3) return 'знайдено замало секцій';
    // Stable: sections that start at the same y keep the expected order.
    const sorted = [...present].sort((a, b) => tops[a[0]] - tops[b[0]]);
    const ok = sorted.every((s, i) => s === present[i]);
    return {
      ok,
      expected: present.map(([, name]) => name).join(' → '),
      actual: ok ? 'як у макеті' : sorted.map(([, name]) => name).join(' → '),
    };
  },

  S2: ({ doc }) => {
    const tops = sectionTops(doc);
    const missing = SECTIONS.filter(([k]) => tops[k] === undefined).map(([, name]) => name);
    return {
      ok: !missing.length,
      expected: `усі ${SECTIONS.length}`,
      actual: missing.length ? `бракує: ${missing.join(', ')}` : `усі ${SECTIONS.length}`,
    };
  },

  L1: ({ at, snap, tier, win }) => {
    if (!at.header) return 'не знайдено <header>';
    const shown = at.navLinks.filter((a) => shownIn(win, a));
    // By vertical centre: a taller button in the nav shares the links' row.
    const rows = distinct(
      shown.map((a) => a.getBoundingClientRect()).map((r) => r.top + r.height / 2),
      16,
    );
    const nav = !snap.navShown ? 'навігацію сховано' : rows > 1 ? `навігація в ${rows} рядки` : 'навігація в рядок';
    const menu = snap.toggleShown ? 'кнопка «Меню»' : 'кнопки «Меню» не видно';
    if (tier === 2) {
      return {
        ok: snap.navShown && rows === 1 && !snap.toggleShown,
        expected: 'навігація в рядок, без кнопки «Меню»',
        actual: `${nav}, ${menu}`,
        els: [at.header],
      };
    }
    return {
      ok: !!snap.toggleShown && !snap.navShown,
      expected: 'кнопка «Меню», навігацію сховано',
      actual: `${menu}, ${snap.navShown ? 'навігацію видно' : 'навігацію сховано'}`,
      els: [at.header],
    };
  },

  L2: ({ at, snap, tier }) => {
    if (snap.heroSideBySide === null || !at.h1 || !at.hero) return 'не знайдено <h1> або hero-зображення';
    const want = tier === 2;
    const name = (two: boolean) => (two ? '2 колонки' : 'вертикально');
    return {
      ok: snap.heroSideBySide === want,
      expected: name(want),
      actual: name(snap.heroSideBySide),
      els: [commonAncestor([at.h1, at.hero]) ?? at.h1],
    };
  },

  L3: ({ snap, tier }) => {
    if (!snap.images.length) return 'не знайдено зображень hero, карток і «Про сервіс»';
    return judge(
      `hero ${tier === 2 ? '4 : 3' : '16 : 9'}, картки 4 : 3, «Про сервіс» 4 : 5`,
      snap.images.map((img): [Element, (string | null)[]] => {
        const problem = imageProblem(img);
        return [img.el, [problem && `${img.name} ${problem}`]];
      }),
    );
  },

  L4: ({ at, snap, tier }) => {
    const f = snap.form;
    if (!f || !at.form) return 'не знайдено поля форми';
    const ok = tier === 0 ? f.cols === 1 : tier === 1 ? f.cols === 2 && f.rows === 2 : f.cols === 4 && f.rows === 1;
    const expected = tier === 0 ? gridName(1, 4) : tier === 1 ? gridName(2, 2) : gridName(4, 1);
    return { ok, expected, actual: gridName(f.cols, f.rows), els: [at.form] };
  },

  L5: ({ at, snap, tier }) => {
    if (!at.grid || snap.gridColumns === null) return 'не знайдено сітку карток у #venues';
    const want = [1, 2, 3][tier];
    const { x, y } = gaps(at.items);
    const near = (g: number | null) => g === null || Math.abs(g - PX.gap) <= 2;
    const gap =
      x === null || y === null || Math.round(x) === Math.round(y)
        ? `${round(x ?? y ?? 0)} px`
        : `${round(x)} px по горизонталі, ${round(y)} px по вертикалі`;
    return {
      ok: snap.gridColumns === want && near(x) && near(y),
      expected: `${cols(want)}, проміжок ${PX.gap} px`,
      actual: `${cols(snap.gridColumns)}, проміжок ${gap}`,
      els: [at.grid],
    };
  },

  L6: ({ at, snap, tier }) => {
    const f = snap.featured;
    if (!f || at.featuredIdx < 0) return 'не знайдено картку Arena Sport у сітці';
    const card = at.items[at.featuredIdx];
    const img = card.querySelector('img');
    const title = card.querySelector('h1, h2, h3, h4');
    if (!img || !title) return 'у картці Arena Sport немає зображення або заголовка';
    const a = img.getBoundingClientRect();
    const t = title.getBoundingClientRect();
    const side = sideBySide(a, t) && a.right <= t.left + 8;
    const above = a.bottom <= t.top + 8;
    const single = Math.abs(f.w - f.otherW) <= 4;
    const big = f.w >= f.otherW * 1.8 && f.h >= f.otherH * 1.6;
    const size = single ? 'одна комірка' : big ? '2 × 2' : `${(f.w / f.otherW).toFixed(1)} × ${(f.h / f.otherH).toFixed(1)} звичайної картки`;
    const layout = side ? 'зображення ліворуч, текст праворуч' : above ? 'зображення над текстом' : 'інше компонування';
    return tier === 2
      ? { ok: big && side, expected: '2 × 2, зображення ліворуч, текст праворуч', actual: `${size}, ${layout}`, els: [card] }
      : { ok: single && above, expected: 'одна комірка, зображення над текстом', actual: `${size}, ${layout}`, els: [card] };
  },

  L7: ({ at, snap, tier }) => {
    const s = snap.stepsRow;
    if (!s) return 'не знайдено 3 кроки «Як це працює»';
    const name = s.cols === 1 ? 'вертикально' : s.rows === 1 ? `${s.cols} в ряд` : `${s.cols} × ${s.rows}`;
    return tier === 2
      ? { ok: s.cols === 3 && s.rows === 1, expected: '3 в ряд', actual: name, els: [commonAncestor(at.steps) ?? at.how!] }
      : { ok: s.cols === 1, expected: 'вертикально', actual: name, els: [commonAncestor(at.steps) ?? at.how!] };
  },

  L8: ({ doc, width }) => {
    const about = findSection(doc, 'about');
    const img = about?.querySelector('img');
    const head = about?.querySelector('h2, h3');
    if (!about || !img || !head) return 'не знайдено зображення й заголовок у «Про сервіс»';
    const grid = commonAncestor([img, head]);
    if (!grid) return 'не знайдено сітку «Про сервіс»';
    // The image's and the text's columns: the grid's children that hold them.
    const column = (el: Element) => {
      let node = el;
      while (node.parentElement && node.parentElement !== grid) node = node.parentElement;
      return node.getBoundingClientRect();
    };
    const two = sideBySide(column(img), column(head));
    const want = width >= 768;
    const name = (t: boolean) => (t ? '2 колонки' : 'вертикально');
    return { ok: two === want, expected: name(want), actual: name(two), els: [grid] };
  },

  L9: ({ doc, tier }) => {
    const footer = footerOf(doc);
    if (!footer) return 'не знайдено footer';
    // The logo, the contacts and the footer navigation sit in different columns.
    const marks = [
      footer.querySelector('img, svg'),
      footer.querySelector('a[href^="mailto:"]'),
      footer.querySelector('a[href="#venues"], a[href="#how"], a[href="#about"]'),
    ].filter((el): el is Element => !!el);
    const grid = marks.length >= 2 ? commonAncestor(marks) : null;
    if (!grid) return 'не знайдено колонки footer';
    const lefts = [...grid.children]
      .map((c) => c.getBoundingClientRect())
      .filter((r) => r.width > 0 && r.height > 0)
      .map((r) => r.left);
    const want = [1, 2, 4][tier];
    const got = distinct(lefts);
    return { ok: got === want, expected: cols(want), actual: cols(got), els: [grid] };
  },

  L10: ({ snap }) => ({
    ok: snap.overflow <= 1,
    expected: 'сторінка не ширша за viewport',
    actual: snap.overflow <= 1 ? 'як очікується' : `ширша на ${round(snap.overflow)} px`,
    els: snap.culprits,
  }),

  L11: ({ doc, win }) => {
    const footer = footerOf(doc);
    const links = footer ? socialLinks(footer).filter((a) => shownIn(win, a)) : [];
    if (links.length < 2) return 'не знайдено посилання на соцмережі у footer';
    const rows = distinct(links.map((a) => a.getBoundingClientRect().top), 4);
    // A flex row that wraps every link (pills too wide for the column) still
    // meets «в рядок, з переносом».
    const box = commonAncestor(links);
    const cs = box ? win.getComputedStyle(box) : null;
    const flexRow = !!cs && /flex/.test(cs.display) && cs.flexDirection.startsWith('row');
    return {
      ok: rows < links.length || flexRow,
      expected: 'в рядок, з переносом',
      actual: rows < links.length ? 'в рядок' : 'стовпчиком, по одному в рядку',
      els: box ? [box] : links,
    };
  },

  D1: ({ at, width }) => {
    const rects = at.items.map((i) => i.getBoundingClientRect()).filter((r) => r.width > 0);
    if (!rects.length || !at.grid) return 'не знайдено картки';
    const gutter = tokenPx('--container-gutter', width);
    const side = (width - Math.min(PX.containerMax, width - 2 * gutter)) / 2;
    const left = Math.min(...rects.map((r) => r.left));
    const right = width - Math.max(...rects.map((r) => r.right));
    return {
      ok: Math.abs(left - side) <= 4 && Math.abs(right - side) <= 4,
      expected: `${round(side)} px від краю з кожного боку`,
      actual: `ліворуч ${round(left)} px, праворуч ${round(right)} px`,
      els: [at.grid],
    };
  },

  D2: ({ doc, win, width }) => {
    const want = tokenPx('--space-section', width);
    const near = (v: number) => Math.abs(v - want) <= 4;
    const bad: string[] = [];
    const els: Element[] = [];
    let found = 0;
    for (const id of ['venues', 'how', 'about'] as const) {
      const el = id === 'venues' ? doc.getElementById(id) : findSection(doc, id);
      if (!el) continue;
      found++;
      const block = sectionOf(el);
      // Either the section's own padding or the visible gap counts.
      const cs = win.getComputedStyle(block);
      const [top, bottom] = insets(win, block);
      if ((near(parseFloat(cs.paddingTop)) || near(top)) && (near(parseFloat(cs.paddingBottom)) || near(bottom))) continue;
      bad.push(`#${id}: зверху ${round(top)}, знизу ${round(bottom)} px`);
      els.push(block);
    }
    if (!found) return 'не знайдено секції #venues, #how, #about';
    return { ok: !bad.length, expected: `${round(want)} px зверху й знизу`, actual: bad.join('; ') || 'як очікується', els };
  },

  D3: ({ at }) => {
    if (!at.header) return 'не знайдено <header>';
    const h = at.header.getBoundingClientRect().height;
    return { ok: Math.abs(h - PX.header) <= 2, expected: `${PX.header} px`, actual: `${round(h)} px`, els: [at.header] };
  },

  D4: ({ doc, win, at }) => {
    const rows: [string, Element, number][] = [];
    for (const c of at.controls) {
      const label = c.tagName === 'BUTTON' ? c.textContent : (c as HTMLInputElement).labels?.[0]?.textContent;
      rows.push([`«${(label ?? c.getAttribute('name') ?? '').trim()}»`, c, PX.control]);
    }
    for (const card of at.cards) {
      const book = bookIn(card);
      if (book) rows.push(['«Забронювати» у картці', book, PX.control]);
    }
    const headerBook = [...(at.header?.querySelectorAll('a[href="#venues"]') ?? [])].find((a) => /забронювати/i.test(a.textContent ?? ''));
    if (headerBook) rows.push(['«Забронювати» у header', headerBook, PX.control]);
    const main = doc.querySelector('main') ?? doc.body;
    const heroLink = [...main.querySelectorAll('a[href="#venues"]')].find((a) => /знайти/i.test(a.textContent ?? ''));
    if (heroLink) rows.push(['кнопка hero', heroLink, PX.controlLarge]);
    const cta = ctaLink(doc);
    if (cta) rows.push(['кнопка CTA', cta, PX.controlLarge]);
    const shown = rows.filter(([, el]) => shownIn(win, el));
    if (!shown.length) return 'не знайдено поля й кнопки';
    return judge(
      `поля й кнопки ${PX.control} px, hero і CTA ${PX.controlLarge} px`,
      shown.map(([name, el, want]) => {
        const h = el.getBoundingClientRect().height;
        return [el, [Math.abs(h - want) <= 2 ? null : `${name} ${round(h)} px`]];
      }),
    );
  },

  D5: ({ doc, win, at, width }) => {
    const plain = at.cards.find((_, i) => i !== at.featuredIdx);
    const all: [string, Element | null | undefined, string][] = [
      ['h1', at.h1, '--font-size-h1'],
      ['h2', at.h2, '--font-size-h2'],
      ['h3', plain?.querySelector('h3'), '--font-size-h3'],
      ['опис hero', leadAfter(at.h1), '--font-size-lead'],
      ['опис секції', leadAfter(doc.querySelector('#venues h2')), '--font-size-lead'],
      ['текст CTA', leadAfter(ctaParts(doc, win)?.heading), '--font-size-lead'],
    ];
    const rows = all.filter((row): row is [string, Element, string] => !!row[1]);
    if (!rows.length) return 'не знайдено заголовки';
    return judge(
      `${rows.map(([name, , t]) => `${name} ${round(tokenPx(t, width))}`).join(' · ')} px; заголовки 800`,
      rows.map(([name, el, t]) => {
        const cs = win.getComputedStyle(el);
        const size = parseFloat(cs.fontSize);
        return [
          el,
          [
            Math.abs(size - tokenPx(t, width)) <= 1 ? null : `${name} ${Math.round(size * 10) / 10} px`,
            !/^h\d$/.test(name) || cs.fontWeight === '800' ? null : `${name} — ${cs.fontWeight}`,
          ],
        ];
      }),
    );
  },

  D6: ({ doc, win }) => {
    const footer = footerOf(doc);
    if (!footer) return 'не знайдено footer';
    const titles = footerTitles(footer);
    const titleSet = new Set(titles);
    const text = [
      [...footer.querySelectorAll('p')].find((p) => (p.textContent ?? '').trim().length > 20 && !titleSet.has(p)),
      ...footerLinks(footer),
    ].filter((el): el is Element => !!el && shownIn(win, el));
    if (!titles.length && !text.length) return 'не знайдено текст і заголовки колонок у footer';
    const size = (el: Element) => parseFloat(win.getComputedStyle(el).fontSize);
    const cs = win.getComputedStyle(footer);
    const [top] = insets(win, footer);
    const near = (v: number) => Math.abs(v - PX.footerTop) <= 4;
    return judge(`відступ зверху ${PX.footerTop} px, текст 14 px, заголовки колонок 16 px і 800`, [
      [footer, [near(parseFloat(cs.paddingTop)) || near(top) ? null : `відступ зверху ${round(top)} px`]],
      ...text.map((el): [Element, (string | null)[]] => [el, [Math.abs(size(el) - 14) <= 0.5 ? null : `текст ${round(size(el))} px`]]),
      ...titles.map((el): [Element, (string | null)[]] => {
        const weight = win.getComputedStyle(el).fontWeight;
        return [
          el,
          [
            Math.abs(size(el) - 16) <= 0.5 ? null : `заголовок колонки ${round(size(el))} px`,
            weight === '800' ? null : `заголовок колонки — ${weight}`,
          ],
        ];
      }),
    ]);
  },

  C1: ({ doc, win }) => {
    const body = win.getComputedStyle(doc.body);
    const html = win.getComputedStyle(doc.documentElement);
    const bg = alpha(body.backgroundColor) ? body.backgroundColor : alpha(html.backgroundColor) ? html.backgroundColor : 'rgb(255, 255, 255)';
    // The whole page: listed, not outlined.
    return {
      ...judge(`фон ${token('--color-background')}, текст ${token('--color-text')}`, [
        [doc.body, [colorIs('фон', bg, '--color-background'), colorIs('текст', body.color, '--color-text')]],
      ]),
      els: [],
    };
  },

  C2: ({ at, win }) => {
    if (!at.header) return 'не знайдено <header>';
    const s = surface(win, at.header);
    const line =
      borderIs(win, 'рамка знизу', at.header, 'Bottom', '--color-border') &&
      borderIs(win, 'рамка знизу', s.el, 'Bottom', '--color-border');
    return judge(`фон ${token('--color-surface')}, рамка знизу 1 px ${token('--color-border')}`, [
      [at.header, [colorIs('фон', s.color, '--color-surface'), line]],
    ]);
  },

  C3: ({ win, at }) => {
    if (!at.how) return 'не знайдено секцію «Як це працює»';
    const block = sectionOf(at.how);
    const steps = at.steps.map((st) => (st.tagName === 'LI' ? st : st.parentElement!));
    return judge(
      `секція ${token('--color-surface-alt')}; кроки ${token('--color-surface')}, радіус ${PX.radiusLg} px`,
      [
        [block, [colorIs('фон секції', surface(win, block).color, '--color-surface-alt')]],
        ...steps.map((step): [Element, (string | null)[]] => {
          const s = surface(win, step);
          return [step, [colorIs('фон кроку', s.color, '--color-surface'), radiusIs(win, 'радіус кроку', s.el, PX.radiusLg)]];
        }),
      ],
    );
  },

  C4: ({ win, at }) => {
    if (!at.form) return 'не знайдено форму';
    const s = surface(win, at.form);
    const fields = [...at.form.querySelectorAll('select, input:not([type="hidden"]):not([type="submit"]), textarea')];
    return judge(
      `форма ${token('--color-surface')}, радіус ${PX.radiusLg} px; поля ${token('--color-background')}, радіус ${PX.radiusSm} px`,
      [
        [at.form, [colorIs('фон форми', s.color, '--color-surface'), radiusIs(win, 'радіус форми', s.el, PX.radiusLg)]],
        ...fields.map((f): [Element, (string | null)[]] => [
          f,
          [colorIs('фон поля', win.getComputedStyle(f).backgroundColor, '--color-background'), radiusIs(win, 'радіус поля', f, PX.radiusSm)],
        ]),
      ],
    );
  },

  C5: ({ win, at }) => {
    if (!at.cards.length) return 'не знайдено картки';
    return judge(
      `фон ${token('--color-surface')}, рамка 1 px ${token('--color-border')}, радіус ${PX.radiusLg} px`,
      at.cards.map((card) => {
        const s = surface(win, card);
        return [
          card,
          [colorIs('фон', s.color, '--color-surface'), borderIs(win, 'рамка', s.el, 'Top', '--color-border'), radiusIs(win, 'радіус', s.el, PX.radiusLg)],
        ];
      }),
    );
  },

  C6: ({ doc, win, at }) => {
    const main = doc.querySelector('main') ?? doc.body;
    const rows: [Element, (string | null)[]][] = [];
    const style = (el: Element) => win.getComputedStyle(el);
    const primary = (who: string, el: Element | null | undefined) => {
      if (el && shownIn(win, el))
        rows.push([el, [colorIs(`${who} — фон`, style(el).backgroundColor, '--color-primary'), radiusIs(win, `${who} — радіус`, el, PX.radiusMd)]]);
    };
    primary('header', [...(at.header?.querySelectorAll('a[href="#venues"]') ?? [])].find((a) => /забронювати/i.test(a.textContent ?? '')));
    primary('hero', [...main.querySelectorAll('a[href="#venues"]')].find((a) => /знайти/i.test(a.textContent ?? '')));
    primary('форма', at.form?.querySelector('button[type="submit"], button:not([type])'));
    at.cards.forEach((card, i) => {
      const book = bookIn(card);
      if (!book) return;
      if (i === at.featuredIdx) return primary('featured', book);
      const cs = style(book);
      const filled = alpha(cs.backgroundColor) > 0 && hex(cs.backgroundColor) !== token('--color-surface');
      rows.push([
        book,
        [
          colorIs('картка — рамка', cs.borderTopColor, '--color-primary'),
          filled ? `картка — фон ${hex(cs.backgroundColor)}` : null,
          radiusIs(win, 'картка — радіус', book, PX.radiusMd),
        ],
      ]);
    });
    const cta = ctaLink(doc);
    if (cta) {
      rows.push([
        cta,
        [
          colorIs('CTA — фон', style(cta).backgroundColor, '--color-accent'),
          colorIs('CTA — текст', style(cta).color, '--color-dark'),
          radiusIs(win, 'CTA — радіус', cta, PX.radiusMd),
        ],
      ]);
    }
    if (!rows.length) return 'не знайдено кнопки';
    return judge(
      `primary ${token('--color-primary')}, outline з рамкою ${token('--color-primary')}, accent ${token('--color-accent')} з текстом ${token('--color-dark')}; радіус ${PX.radiusMd} px`,
      rows,
    );
  },

  C7: ({ win, at }) => {
    const chips = at.cards.flatMap((card) => byText(card, /^(футбол|теніс|баскетбол|волейбол)$/i).slice(0, 1));
    if (!chips.length) return 'не знайдено чипи з видом спорту';
    return judge(
      `фон ${token('--color-primary-soft')}, текст ${token('--color-primary')}`,
      chips.map((chip) => [
        chip,
        [colorIs('фон', surface(win, chip).color, '--color-primary-soft'), colorIs('текст', win.getComputedStyle(chip).color, '--color-primary')],
      ]),
    );
  },

  C8: ({ win, at }) => {
    const card = at.featuredIdx >= 0 ? at.cards[at.featuredIdx] : null;
    const badge = card ? byText(card, /^вибір тижня$/i)[0] : undefined;
    if (!badge) return 'не знайдено badge «Вибір тижня»';
    const text = (badge.textContent ?? '').trim();
    const upper = win.getComputedStyle(badge).textTransform === 'uppercase' || text === text.toUpperCase();
    return judge(`фон ${token('--color-accent')}, великі літери`, [
      [
        badge,
        shownIn(win, badge)
          ? [colorIs('фон', surface(win, badge).color, '--color-accent'), upper ? null : 'не великими літерами']
          : ['badge не видно'],
      ],
    ]);
  },

  C9: ({ doc, win }) => {
    const cta = ctaParts(doc, win);
    if (!cta) return 'не знайдено Final CTA';
    const { block: s, heading } = cta;
    return judge(`фон ${token('--color-dark')}, радіус ${PX.radiusLg} px, заголовок ${token('--color-on-dark')}`, [
      [
        s.el,
        [
          colorIs('фон', s.color, '--color-dark'),
          radiusIs(win, 'радіус', s.el, PX.radiusLg),
          heading ? colorIs('заголовок', win.getComputedStyle(heading).color, '--color-on-dark') : null,
        ],
      ],
    ]);
  },

  C10: ({ doc, win }) => {
    const footer = footerOf(doc);
    if (!footer) return 'не знайдено footer';
    const s = surface(win, footer);
    // The footer's colour, or that of its first paragraph if set there.
    const para = [...footer.querySelectorAll('p')].find((p) => (p.textContent ?? '').trim().length > 20);
    const textOk = [footer, para].some((el) => el && hex(win.getComputedStyle(el).color) === token('--color-on-dark-muted'));
    return judge(
      `фон ${token('--color-dark')}, текст ${token('--color-on-dark-muted')}, заголовки колонок ${token('--color-on-dark')}`,
      [
        [footer, [colorIs('фон', s.color, '--color-dark'), textOk ? null : `текст ${hex(win.getComputedStyle(footer).color)}`]],
        ...footerTitles(footer).map((t): [Element, (string | null)[]] => [
          t,
          [colorIs('заголовок колонки', win.getComputedStyle(t).color, '--color-on-dark')],
        ]),
      ],
    );
  },
};

/** H1: sections whose height differs from the mockup's by more than 30 %. */
function heights({ doc, width }: Ctx): Finding[] {
  const ref = (mockup as Record<string, { anchors: Record<string, number> }>)[String(width)]?.anchors;
  if (!ref) return [];
  const page = sectionAnchors(doc);
  const keys = Object.keys(ref);
  const out: Finding[] = [];
  for (let i = 0; i < keys.length - 1; i++) {
    const [k, next] = [keys[i], keys[i + 1]];
    if (page[k] === undefined || page[next] === undefined) continue;
    const want = ref[next] - ref[k];
    const got = page[next] - page[k];
    if (want <= 0 || got <= 0 || Math.abs(got / want - 1) <= 0.3) continue;
    const pct = Math.round(Math.abs(got / want - 1) * 100);
    out.push({
      ...CRITERIA.H1,
      id: 'H1',
      key: `H1:${k}`,
      status: 'info',
      title: `«${sectionName(k)}» на ${pct} % ${got > want ? 'вища' : 'нижча'}, ніж у макеті`,
      expected: `${round(want)} px`,
      actual: `${round(got)} px`,
      els: [],
      band: { top: page[k], bottom: page[next] },
    });
  }
  return out;
}

/**
 * Checks every criterion on `doc` as rendered now. `width` is the viewport
 * width the document is laid out at; the caller sets it and waits for layout.
 */
export function evaluate(doc: Document, width: number): Finding[] {
  const win = doc.defaultView!;
  const at = locate(doc);
  const ctx: Ctx = { doc, win, width, tier: width < 640 ? 0 : width < 1024 ? 1 : 2, at, snap: snapshot(win, at, width) };
  const out: Finding[] = [];
  for (const [id, rule] of Object.entries(RULES) as [Exclude<CriterionId, 'H1'>, Rule][]) {
    let result: Result | string;
    try {
      result = rule(ctx);
    } catch {
      result = 'не вдалося виміряти';
    }
    const base = { ...CRITERIA[id], id, key: id };
    out.push(
      typeof result === 'string'
        ? { ...base, status: 'skip', actual: result, els: [] }
        : {
            ...base,
            status: result.ok ? 'pass' : 'fail',
            expected: result.expected,
            actual: result.actual,
            els: result.ok ? [] : (result.els ?? []),
            band: result.ok ? undefined : result.band,
          },
    );
  }
  out.push(...heights(ctx));
  return out;
}

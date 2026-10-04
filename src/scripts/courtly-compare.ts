/**
 * ЛР-7 mockup comparison: the mockup capture and the student's page side by
 * side at one width, with the lab's requirements the page misses at that
 * width outlined on it and listed (`courtly-spec.ts`). Used by the check
 * dialog's «Порівняти» and by the report page. Markup, styles and the two
 * layouts: `CourtlyCompare.astro`.
 *
 * The capture is a native scroller and drives the page's frame, mapped
 * piecewise-linearly between section starts (`sectionAnchors()`), so a
 * section taller or shorter than in the mockup does not push the rest of the
 * page out of line. Jumping to a finding runs the mapping backwards.
 *
 * The frame is same-origin and script-less, like the checker's layout pass,
 * so the requirements are measured in it directly. It takes no pointer
 * events: a click on a link would navigate it to the live site.
 *
 * The root fires `cv:view` (bubbling) with the width whenever it changes.
 */
import mockup from '@/data/courtly-mockup.json';
import { withBase } from '@/lib/paths';
import { MOCKUP_VIEWS, sectionAnchors } from '@/scripts/courtly-check';
import { SPEC_GROUPS, evaluate, type Finding, type SpecStatus } from '@/scripts/courtly-spec';

type View = (typeof MOCKUP_VIEWS)[number];
interface Capture {
  src: string;
  height: number;
  anchors: Record<string, number>;
}

const captureOf = (v: View) => (mockup as Record<string, Capture>)[String(v.width)];
const viewOf = (width: number) => MOCKUP_VIEWS.find((v) => v.width === width) ?? MOCKUP_VIEWS[0];

const LABEL: Record<SpecStatus, string> = {
  fail: 'Не виконано',
  info: 'Помітна різниця',
  skip: 'Не перевірено',
  pass: 'Виконано',
};
const ICON: Record<SpecStatus, string> = { fail: '✕', info: '!', skip: '–', pass: '✓' };

const plural = new Intl.PluralRules('uk');
/** `n` and the word form for it: { one: 1, 21…; few: 2–4, 22…; many: the rest }. */
const count = (n: number, forms: { one: string; few: string; many: string }) =>
  `${n} ${forms[plural.select(n) as keyof typeof forms] ?? forms.many}`;

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/** Room kept under a desktop view's panes for the findings, in the full layout. */
const FINDINGS_MIN = 160;

const nextFrames = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

/**
 * Sets the frame's size and resolves once its document's styles follow
 * (or after about two seconds). `innerWidth`, `clientWidth` and `matchMedia`
 * change at once, but computed styles — `vw`, `clamp()`, media-query rules —
 * only at the frame's next rendering update, which a fixed number of the
 * host's animation frames does not guarantee: inside the check's modal
 * dialog the findings were measured on the previous width's styles. A probe
 * styled `width: 100vw` before the change shows when that update happened;
 * it is removed before anything is measured.
 */
async function resize(frame: HTMLIFrameElement, width: number, height: number) {
  const doc = frame.contentDocument;
  const probe = doc?.documentElement ? doc.createElement('div') : null;
  if (probe) {
    probe.style.cssText = 'position:absolute;top:0;left:0;width:100vw;height:0;visibility:hidden;pointer-events:none';
    doc!.documentElement.append(probe);
    probe.getBoundingClientRect(); // styled at the old width
  }
  frame.style.width = `${width}px`;
  frame.style.height = `${height}px`;
  try {
    for (let i = 0; i < 60; i++) {
      await nextFrames();
      if (!probe || Math.abs(probe.getBoundingClientRect().width - width) < 0.5) return;
    }
  } finally {
    probe?.remove();
  }
}

export interface CompareViewer {
  /** The width shown. */
  readonly width: number;
  /**
   * Renders `preview` (a page from `loadPage()`) beside the capture at
   * `width`. The same preview is not reloaded on a width change. Given a
   * promise, the capture shows at once and the page's half a loader until it
   * settles; a rejection clears the loader and rejects `show()`.
   */
  show(preview: string | Promise<string>, width: number): Promise<void>;
}

/** Wires the `CourtlyCompare` markup inside `root`. */
export function mountCompare(root: HTMLElement): CompareViewer {
  const pick = <T extends Element = HTMLElement>(selector: string) => root.querySelector<T>(selector)!;
  const main = pick('[data-cv-main]');
  const panes = pick('[data-cv-panes]');
  const stage = pick('[data-cv-stage]');
  const shot = pick('[data-cv-shot]');
  const shotImg = pick<HTMLImageElement>('[data-cv-img]');
  const pageScreen = pick('[data-cv-page]');
  const overlay = pick('[data-cv-overlay]');
  const summary = pick('[data-cv-summary]');
  const list = pick('[data-cv-findings]');
  const marks = pick<HTMLInputElement>('[data-cv-marks]');
  const viewButtons = [...root.querySelectorAll<HTMLButtonElement>('[data-cv-view]')];
  const groupTag = `h${list.dataset.cvLevel ?? '3'}` as 'h3';
  /** The full layout's side-by-side breakpoint, as in `CourtlyCompare.astro`. */
  const wideScreen = matchMedia('(min-width: 900px)');

  let view: View = MOCKUP_VIEWS[0];
  let scale = 1;
  let preview = '';
  let frame: HTMLIFrameElement | null = null;
  /** The `preview` the frame holds. */
  let framePreview = '';
  let findings: Finding[] = [];
  /** The finding last jumped to: its outline stands out. */
  let active = '';
  /** Bumped by every `showView()`; a superseded one stops after its awaits. */
  let run = 0;

  // A screen is `data-busy` until its capture or page is ready: a loader
  // covers it (`CourtlyCompare.astro`).
  for (const type of ['load', 'error']) shotImg.addEventListener(type, () => shot.removeAttribute('data-busy'));

  // --- Alignment --------------------------------------------------------------

  /**
   * [capture y, page y] pairs from the top: the section starts both pages
   * have, kept while they increase on both sides, then both last scroll
   * positions, so the bottoms line up too.
   */
  function anchorPairs(doc: Document): [number, number][] {
    const ref = captureOf(view).anchors;
    const page = sectionAnchors(doc);
    const pairs: [number, number][] = [[0, 0]];
    for (const [name, y] of Object.entries(ref)) {
      if (name === 'end' || page[name] === undefined) continue;
      const [lastRef, lastPage] = pairs[pairs.length - 1];
      if (y > lastRef && page[name] > lastPage) pairs.push([y, page[name]]);
    }
    const bottom: [number, number] = [ref.end - view.height, page.end - view.height];
    while (pairs.length > 1) {
      const [r, p] = pairs[pairs.length - 1];
      if (r < bottom[0] && p < bottom[1]) break;
      pairs.pop();
    }
    if (bottom[0] > 0 && bottom[1] > 0) pairs.push(bottom);
    return pairs;
  }

  /** `from` → `to` along the pairs: linear between them, and past the last one. */
  function map(y: number, pairs: [number, number][], from: 0 | 1): number {
    const to = 1 - from;
    let i = 1;
    while (i < pairs.length - 1 && y > pairs[i][from]) i++;
    const a = pairs[i - 1];
    const b = pairs[i] ?? [a[0] + 1, a[1] + 1];
    return a[to] + ((y - a[from]) * (b[to] - a[to])) / (b[from] - a[from]);
  }

  /** Anchors are re-read every time: late fonts and images move sections. */
  function sync() {
    const doc = frame?.contentDocument;
    if (!doc?.body) return;
    const y = map(shot.scrollTop / scale, anchorPairs(doc), 0);
    frame!.contentWindow!.scrollTo(0, Math.max(0, y));
    draw();
  }

  const gapOf = (el: Element) => parseFloat(getComputedStyle(el).rowGap) || 0;

  /**
   * Height the screens may take. In the full layout on a wide screen: what
   * `.cv-main` has, less the findings' share under a desktop view. Otherwise
   * the panes' `max-height`; the panes then take the screens' height, so a
   * fit settles at once.
   */
  function room(): number {
    const label = stage.querySelector<HTMLElement>('.cv-label')!;
    const labelled = label.offsetHeight + gapOf(stage);
    if (root.dataset.layout === 'full' && wideScreen.matches) {
      const under = root.hasAttribute('data-wide') ? FINDINGS_MIN + gapOf(main) : 0;
      return main.clientHeight - under - labelled;
    }
    return parseFloat(getComputedStyle(panes).maxHeight) - labelled;
  }

  /** Scales both screens to the room they have, keeping the place. */
  function fit() {
    const next = Math.min(1, stage.clientWidth / view.width, room() / view.height);
    if (!(next > 0)) return;
    const y = shot.scrollTop / scale;
    scale = next;
    for (const screen of [shot, pageScreen]) {
      screen.style.width = `${view.width * scale}px`;
      screen.style.height = `${view.height * scale}px`;
    }
    shotImg.style.width = `${view.width * scale}px`;
    shotImg.style.height = `${captureOf(view).height * scale}px`;
    if (frame) frame.style.transform = `scale(${scale})`;
    shot.scrollTop = y * scale;
    sync();
  }

  /** Same isolation as the checker's layout pass: same-origin, no scripts. */
  async function loadFrame() {
    if (frame && framePreview === preview) return;
    frame?.remove();
    const next = el('iframe', 'cv-frame');
    next.title = 'Сторінка студента';
    next.setAttribute('sandbox', 'allow-same-origin');
    next.setAttribute('tabindex', '-1');
    frame = next;
    framePreview = preview;
    const loaded = new Promise<void>((resolve) => {
      const timer = setTimeout(resolve, 20000);
      next.addEventListener(
        'load',
        () => {
          clearTimeout(timer);
          resolve();
        },
        { once: true },
      );
    });
    next.srcdoc = framePreview;
    overlay.before(next);
    await loaded;
    const fonts = next.contentDocument?.fonts.ready;
    if (fonts) await Promise.race([fonts, new Promise((r) => setTimeout(r, 5000))]);
  }

  // --- Outlines ---------------------------------------------------------------

  /** Outlines for failed and amber findings, in screen px; redrawn on every scroll. */
  function draw() {
    overlay.replaceChildren();
    const win = frame?.contentWindow;
    if (!win || !marks.checked) return;
    const width = view.width * scale;
    const height = view.height * scale;
    /** Tag slots taken, so tags at one spot stack instead of covering each other. */
    const taken = new Set<string>();
    for (const f of findings) {
      if (f.status !== 'fail' && f.status !== 'info') continue;
      let rects = f.band
        ? [new DOMRect(0, f.band.top - win.scrollY, view.width, f.band.bottom - f.band.top)]
        : f.els.map((e) => e.getBoundingClientRect()).filter((r) => r.width >= 1 && r.height >= 1);
      // Many elements (every link in the footer): one box around them all.
      if (rects.length > 6) {
        const [left, top] = [Math.min(...rects.map((r) => r.left)), Math.min(...rects.map((r) => r.top))];
        const [right, bottom] = [Math.max(...rects.map((r) => r.right)), Math.max(...rects.map((r) => r.bottom))];
        rects = [new DOMRect(left, top, right - left, bottom - top)];
      }
      let tagged = false;
      for (const r of rects) {
        const [x, y, w, h] = [r.left * scale, r.top * scale, r.width * scale, r.height * scale];
        if (w < 1 || h < 1 || y + h < 0 || y > height || x + w < 0 || x > width) continue;
        const box = el('div', 'cv-mark');
        box.dataset.status = f.status;
        if (f.key === active) box.dataset.active = '';
        box.style.cssText = `left:${x}px;top:${y}px;width:${w}px;height:${h}px`;
        overlay.append(box);
        if (tagged) continue;
        tagged = true;
        const left = Math.max(0, Math.min(x, width - 40));
        let top = Math.max(0, y);
        while (taken.has(`${Math.round(left / 48)}:${Math.round(top / 16)}`)) top += 16;
        taken.add(`${Math.round(left / 48)}:${Math.round(top / 16)}`);
        const tag = el('span', 'cv-mark__tag', `${f.id} ${f.label}`);
        tag.dataset.status = f.status;
        tag.style.cssText = `left:${left}px;top:${top}px;max-width:${width - left}px`;
        overlay.append(tag);
      }
    }
  }

  /** Scrolls both halves to a finding and makes its outline stand out. */
  function jump(f: Finding) {
    const doc = frame?.contentDocument;
    if (!doc) return;
    const scrollY = doc.defaultView!.scrollY;
    const tops = f.band
      ? [f.band.top]
      : f.els
          .map((e) => e.getBoundingClientRect())
          .filter((r) => r.width > 0 && r.height > 0)
          .map((r) => r.top + scrollY);
    if (!tops.length) return;
    active = f.key;
    marks.checked = true;
    // A little above the element, so it does not sit on the screen's edge.
    shot.scrollTop = Math.max(0, map(Math.max(0, Math.min(...tops) - 24), anchorPairs(doc), 1)) * scale;
    sync();
    panes.scrollIntoView({ block: 'nearest' });
  }

  // --- Findings list ----------------------------------------------------------

  function summaryText(): string {
    const reqs = findings.filter((f) => f.id !== 'H1');
    const n = (s: SpecStatus) => reqs.filter((f) => f.status === s).length;
    const info = findings.filter((f) => f.status === 'info').length;
    const parts = [
      n('fail')
        ? count(n('fail'), { one: 'розбіжність з вимогами', few: 'розбіжності з вимогами', many: 'розбіжностей з вимогами' })
        : 'розбіжностей з вимогами немає',
    ];
    if (info) parts.push(count(info, { one: 'помітна різниця у висоті', few: 'помітні різниці у висоті', many: 'помітних різниць у висоті' }));
    parts.push(`перевірено ${count(reqs.length - n('skip'), { one: 'вимогу', few: 'вимоги', many: 'вимог' })}`);
    if (n('skip')) parts.push(`не перевірено ${n('skip')}`);
    return `${view.width} px: ${parts.join(' · ')}`;
  }

  function row(f: Finding): HTMLLIElement {
    const li = el('li', 'cv-finding');
    li.dataset.status = f.status;
    const icon = el('span', 'cv-finding__icon', ICON[f.status]);
    icon.setAttribute('aria-hidden', 'true');
    const body = el('div', 'cv-finding__body');
    const canJump = (f.status === 'fail' || f.status === 'info') && (f.band || f.els.length);
    const title = el(canJump ? 'button' : 'p', 'cv-finding__title');
    title.append(el('span', 'visually-hidden', `${LABEL[f.status]}: `), el('span', 'cv-finding__id', f.id), ` ${f.title}`);
    if (canJump) {
      (title as HTMLButtonElement).type = 'button';
      title.dataset.cvJump = f.key;
      const go = el('span', 'cv-finding__go', 'показати');
      go.setAttribute('aria-hidden', 'true');
      title.append(el('span', 'visually-hidden', ' — показати на сторінці'), go);
    }
    body.append(title);
    if (f.status === 'fail' || f.status === 'info') {
      body.append(el('p', 'cv-finding__detail', `очікується ${f.expected} — зараз ${f.actual}`));
    } else if (f.status === 'skip') {
      body.append(el('p', 'cv-finding__detail', `не перевірено: ${f.actual}`));
    }
    body.append(el('p', 'cv-finding__source', f.source));
    li.append(icon, body);
    return li;
  }

  const ORDER: SpecStatus[] = ['fail', 'info', 'skip'];

  function renderFindings() {
    summary.textContent = summaryText();
    list.replaceChildren(
      ...SPEC_GROUPS.map((group) => {
        const rows = findings.filter((f) => f.group === group.id);
        const open = rows.filter((f) => f.status !== 'pass').sort((a, b) => ORDER.indexOf(a.status) - ORDER.indexOf(b.status));
        const passed = rows.filter((f) => f.status === 'pass');
        const section = el('section', 'cv-group');
        const fails = open.filter((f) => f.status === 'fail').length;
        const heading = el(groupTag, 'cv-group__title', group.title);
        if (fails) heading.append(el('span', 'cv-group__count', count(fails, { one: 'розбіжність', few: 'розбіжності', many: 'розбіжностей' })));
        section.append(heading);
        if (open.length) {
          const ul = el('ul', 'cv-list');
          ul.append(...open.map(row));
          section.append(ul);
        } else if (group.id === 'height') {
          section.append(el('p', 'cv-group__empty', 'Висота кожної секції — в межах 30 % від макета.'));
        }
        if (passed.length) {
          const more = el('details', 'cv-passed');
          more.append(el('summary', 'cv-passed__summary', `Виконано: ${passed.length}`));
          const ul = el('ul', 'cv-list');
          ul.append(...passed.map(row));
          more.append(ul);
          section.append(more);
        }
        return section;
      }),
    );
  }

  // --- Width ------------------------------------------------------------------

  async function showView(next: View, source?: string | Promise<string>) {
    const id = ++run;
    view = next;
    // Desktop views are width-bound; the full layout puts the findings under them.
    root.toggleAttribute('data-wide', view.width >= 1024);
    for (const button of viewButtons) {
      button.setAttribute('aria-pressed', String(Number(button.dataset.cvView) === view.width));
    }
    root.dispatchEvent(new CustomEvent('cv:view', { detail: { width: view.width }, bubbles: true }));
    findings = [];
    active = '';
    overlay.replaceChildren();
    list.replaceChildren();
    pageScreen.setAttribute('data-busy', '');
    shotImg.src = withBase(captureOf(view).src);
    shot.toggleAttribute('data-busy', !shotImg.complete);
    shotImg.alt = `Макет Courtly на ширині ${view.width} px`;
    shot.scrollTop = 0;
    if (typeof source === 'string') {
      preview = source;
    } else if (source) {
      summary.textContent = 'Завантаження сторінки студента…';
      fit();
      try {
        preview = await source;
      } catch (err) {
        if (id === run) {
          pageScreen.removeAttribute('data-busy');
          summary.textContent = '';
        }
        throw err;
      }
      if (id !== run) return;
    }
    summary.textContent = `${view.width} px: вимірювання…`;
    await loadFrame();
    if (id !== run) return;
    const sizing = resize(frame!, view.width, view.height);
    fit();
    await sizing;
    if (id !== run) return;
    const doc = frame!.contentDocument;
    try {
      if (!doc?.body) throw new Error('empty frame');
      findings = evaluate(doc, view.width);
      renderFindings();
    } catch {
      summary.textContent = `${view.width} px: не вдалося виміряти сторінку`;
    }
    pageScreen.removeAttribute('data-busy');
    sync();
  }

  shot.addEventListener('scroll', sync, { passive: true });
  // The frame takes no pointer events, so a wheel over it scrolls the capture.
  pageScreen.addEventListener(
    'wheel',
    (event) => {
      event.preventDefault();
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? shot.clientHeight : 1;
      shot.scrollTop += event.deltaY * unit;
    },
    { passive: false },
  );
  // The stage's width and `.cv-main`'s height bound the screens.
  const resized = new ResizeObserver(() => fit());
  resized.observe(stage);
  resized.observe(main);
  for (const button of viewButtons) {
    button.addEventListener('click', () => {
      if (preview) showView(viewOf(Number(button.dataset.cvView)));
    });
  }
  marks.addEventListener('change', draw);
  list.addEventListener('click', (event) => {
    const button = (event.target as Element).closest<HTMLElement>('[data-cv-jump]');
    const finding = button && findings.find((f) => f.key === button.dataset.cvJump);
    if (finding) jump(finding);
  });

  return {
    get width() {
      return view.width;
    },
    show(next, width) {
      return showView(viewOf(width), next);
    },
  };
}

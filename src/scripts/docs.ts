/**
 * docs.ts — the small client bundle for the reading shells (`DocsLayout`,
 * `LabLayout`).
 *
 * Four independent behaviours, each a no-op when its markup is absent so the
 * same entry point stays safe to call from pages without a sidebar or ToC:
 *
 *   1. mobile sidebar drawer — open / close / backdrop / `Esc` + body-scroll lock
 *   2. scrollspy — tracks the heading at the top of the viewport among
 *      `.doc-content :is(h2, h3)`, marks the matching "On this page" link
 *      `.is-active`, keeps it in view inside the rail, and mirrors its text
 *      into the mobile bar's `[data-toc-current]`
 *   3. "On this page" dropdown (below `lg`) — closes on a link pick, `Esc`, or
 *      an outside click
 *   4. theme toggle — flip `<html class="dark">` and persist to
 *      `localStorage['tutorial-theme']` (re-applied pre-paint by `BaseLayout`)
 *
 * Vanilla DOM, no framework — same spirit as ../Lectures/src/scripts/deck.ts.
 */

const THEME_KEY = 'tutorial-theme';

/** Persist the theme choice, tolerating a locked-down `localStorage`. */
function writeStoredTheme(value: 'dark' | 'light'): void {
  try {
    localStorage.setItem(THEME_KEY, value);
  } catch {
    /* private mode / blocked storage — the toggle still works for this visit. */
  }
}

/* ── 1. Mobile sidebar drawer ──────────────────────────────────────────── */

function setupSidebarDrawer(): void {
  const sidebar = document.getElementById('docs-sidebar');
  const toggle = document.getElementById('docs-sidebar-toggle');
  const scrim = document.getElementById('docs-sidebar-scrim');
  const closeButton = document.getElementById('docs-sidebar-close');
  if (!sidebar || !toggle || !scrim) return;

  const desktop = window.matchMedia('(min-width: 1024px)');
  let restoreOverflow = '';

  // Arrow consts (not hoisted `function`s) so TypeScript keeps the null-guard
  // narrowing of `sidebar` / `toggle` / `scrim` inside these closures.
  const isOpen = (): boolean => sidebar.hasAttribute('data-open');

  const open = (): void => {
    if (isOpen()) return;
    sidebar.setAttribute('data-open', '');
    scrim.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    restoreOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButton?.focus();
  };

  const close = ({ returnFocus = true }: { returnFocus?: boolean } = {}): void => {
    if (!isOpen()) return;
    sidebar.removeAttribute('data-open');
    scrim.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = restoreOverflow;
    if (returnFocus) toggle.focus();
  };

  toggle.addEventListener('click', () => {
    if (isOpen()) close();
    else open();
  });
  closeButton?.addEventListener('click', () => close());
  scrim.addEventListener('click', () => close());

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) close();
  });

  // Close silently when a nav link is chosen, or when the viewport grows to
  // `lg` where the drawer CSS no longer applies — no focus yank in either case.
  sidebar.addEventListener('click', (event) => {
    if (event.target instanceof Element && event.target.closest('a[href]')) {
      close({ returnFocus: false });
    }
  });
  desktop.addEventListener('change', (event) => {
    if (event.matches) close({ returnFocus: false });
  });
}

/* ── 2. Scrollspy — "On this page" active marker ───────────────────────── */

// Slack (px) so a heading an anchor jump parks exactly on its
// `scroll-margin-top` still counts as reached despite sub-pixel rounding.
const SPY_TOLERANCE = 4;

/** Nearest ancestor that actually scrolls vertically, if any. */
function scrollParent(element: HTMLElement): HTMLElement | null {
  for (let node = element.parentElement; node; node = node.parentElement) {
    const { overflowY } = getComputedStyle(node);
    if (/(auto|scroll)/.test(overflowY) && node.scrollHeight > node.clientHeight) {
      return node;
    }
  }
  return null;
}

/** Bring `link` into view inside its scrolling rail / dropdown — never the page. */
function revealInContainer(link: HTMLElement): void {
  const container = scrollParent(link);
  if (!container) return;

  const margin = 24;
  const box = container.getBoundingClientRect();
  const rect = link.getBoundingClientRect();
  if (rect.top < box.top + margin) {
    container.scrollTop -= box.top + margin - rect.top;
  } else if (rect.bottom > box.bottom - margin) {
    container.scrollTop += rect.bottom - (box.bottom - margin);
  }
}

function setupScrollspy(): void {
  const article = document.querySelector('.doc-content');
  const tocLinks = Array.from(
    document.querySelectorAll<HTMLAnchorElement>('[data-toc-link]'),
  );
  if (!article || tocLinks.length === 0) return;

  const headings = Array.from(
    article.querySelectorAll<HTMLElement>('h2[id], h3[id]'),
  );
  if (headings.length === 0) return;

  const current = document.querySelector<HTMLElement>('[data-toc-current]');

  const linkById = new Map<string, HTMLAnchorElement>();
  for (const link of tocLinks) {
    const id = link.getAttribute('href')?.slice(1);
    if (id) linkById.set(id, link);
  }

  let activeId = '';

  function setActive(id: string): void {
    if (id === activeId) return;
    activeId = id;
    for (const link of tocLinks) link.classList.remove('is-active');

    const link = linkById.get(id);
    if (!link) return;
    link.classList.add('is-active');
    if (current) current.textContent = link.textContent?.trim() ?? '';
    revealInContainer(link);
  }

  // Source of truth: the last heading whose top has scrolled up to its own
  // `scroll-margin-top` — the line an anchor jump parks it on, which already
  // clears the sticky header (and the mobile ToC bar, where the layout raises
  // the margin). At the very bottom of the page the last heading wins, since
  // it may never reach that line. Measuring on scroll beats observer entries:
  // a long jump can land a heading exactly on an observer edge and fire nothing.
  function syncActive(): void {
    const offset = parseFloat(getComputedStyle(headings[0]).scrollMarginTop) || 0;
    const root = document.documentElement;
    const atBottom = window.innerHeight + window.scrollY >= root.scrollHeight - 2;

    let currentId = headings[0].id;
    if (atBottom) {
      currentId = headings[headings.length - 1].id;
    } else {
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top - offset <= SPY_TOLERANCE) {
          currentId = heading.id;
        } else {
          break;
        }
      }
    }
    setActive(currentId);
  }

  let frame = 0;
  const schedule = (): void => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      syncActive();
    });
  };

  syncActive();
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  window.addEventListener('hashchange', schedule);
}

/* ── 3. "On this page" dropdown (below `lg`) ───────────────────────────── */

function setupTocDropdown(): void {
  const toc = document.querySelector<HTMLDetailsElement>('details.on-this-page');
  if (!toc) return;

  // On `lg+` the list is an always-visible rail, so `open` has no effect there.
  const desktop = window.matchMedia('(min-width: 1024px)');
  const summary = toc.querySelector('summary');

  const close = ({ returnFocus = false }: { returnFocus?: boolean } = {}): void => {
    if (!toc.open) return;
    toc.open = false;
    if (returnFocus) summary?.focus();
  };

  toc.addEventListener('click', (event) => {
    if (desktop.matches) return;
    if (event.target instanceof Element && event.target.closest('[data-toc-link]')) {
      close();
    }
  });

  document.addEventListener('click', (event) => {
    if (desktop.matches || !toc.open) return;
    if (event.target instanceof Node && !toc.contains(event.target)) close();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toc.open && !desktop.matches) {
      close({ returnFocus: true });
    }
  });

  // Opening the list shows where you are: scroll the active link into view.
  toc.addEventListener('toggle', () => {
    if (!toc.open) return;
    const active = toc.querySelector<HTMLElement>('[data-toc-link].is-active');
    if (active) revealInContainer(active);
  });
}

/* ── 4. Theme toggle ──────────────────────────────────────────────────── */

function setupThemeToggle(): void {
  const button = document.getElementById('theme-toggle');
  if (!button) return;

  button.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    writeStoredTheme(isDark ? 'dark' : 'light');
  });
}

/* ── Entry point ──────────────────────────────────────────────────────── */

/** Wire every reading-shell behaviour present on the page. Call once. */
export function initDocs(): void {
  setupSidebarDrawer();
  setupScrollspy();
  setupTocDropdown();
  setupThemeToggle();
}

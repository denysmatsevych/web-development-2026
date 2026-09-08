/**
 * docs.ts — the small client bundle for the reading shell (`DocsLayout`).
 *
 * Three independent behaviours, each a no-op when its markup is absent so the
 * same entry point stays safe to call from the sidebar-less homepage later:
 *
 *   1. mobile sidebar drawer — open / close / backdrop / `Esc` + body-scroll lock
 *   2. scrollspy — an `IntersectionObserver` over `.doc-content :is(h2, h3)`
 *      drives the `.is-active` marker on the matching "On this page" link
 *   3. theme toggle — flip `<html class="dark">` and persist to
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

// Clears the sticky header (4rem) plus a little breathing room; also the top
// edge of the observer band below.
const SPY_TOP_OFFSET = 96;

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
    linkById.get(id)?.classList.add('is-active');
  }

  // Source of truth: the last heading whose top has scrolled past the offset
  // line. Measuring (rather than trusting observer entries) keeps the marker
  // correct no matter how unevenly the headings are spaced.
  function syncActive(): void {
    let current = headings[0].id;
    for (const heading of headings) {
      if (heading.getBoundingClientRect().top - SPY_TOP_OFFSET <= 0) {
        current = heading.id;
      } else {
        break;
      }
    }
    setActive(current);
  }

  // The observer is just a cheap "a heading crossed the top band, re-measure"
  // trigger; the band is a thin strip below the header so crossings line up
  // with where the active heading should change.
  const observer = new IntersectionObserver(syncActive, {
    rootMargin: `-${SPY_TOP_OFFSET}px 0px -66% 0px`,
  });
  for (const heading of headings) observer.observe(heading);

  syncActive();
  window.addEventListener('hashchange', syncActive);
}

/* ── 3. Theme toggle ──────────────────────────────────────────────────── */

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
  setupThemeToggle();
}

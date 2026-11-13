/**
 * Rendering TVmaze data: result cards, show page, status line.
 * JavaScript module: migrated to TypeScript by an AI agent in T4. Do not modify prior to T4.
 *
 * This module makes no network requests and knows nothing about application state: it only
 * displays what it receives. Show properties are described in the assignment, §3.2.
 */

/**
 * Renders shows as cards in the original order and replaces the contents of `container`. Each card
 * is a `button[data-id="<show id>"]`; what happens on click is handled by app.js.
 * An empty array results in an empty list.
 */
export function renderResults(container, shows) {
  const list = el('ul', { class: 'cards' });
  for (const show of shows) {
    const card = el('button', { type: 'button', class: 'card', 'data-id': String(show.id) }, [
      poster(show, 'card__image'),
      el('span', { class: 'card__body' }, [
        el('span', { class: 'card__title', lang: 'en' }, [show.name]),
        el('span', { class: 'card__meta' }, [showMeta(show)]),
        el('span', { class: 'card__genres', lang: 'en' }, [genres(show)]),
      ]),
    ]);
    list.append(el('li', {}, [card]));
  }
  container.replaceChildren(list);
}

/**
 * Renders the show page — poster, title, year, rating, genres, summary, and a link to TVmaze — and
 * replaces the contents of `container`. The heading `h2#show-title` receives focus: the card
 * that was clicked has disappeared, and keyboard focus should not be lost.
 */
export function renderShow(container, show) {
  const title = el('h2', { id: 'show-title', class: 'show__title', lang: 'en', tabindex: '-1' }, [show.name]);
  const article = el('article', { class: 'show', 'aria-labelledby': 'show-title' }, [
    el('div', { class: 'show__head' }, [
      poster(show, 'show__image'),
      el('div', { class: 'show__intro' }, [
        title,
        el('p', { class: 'show__meta' }, [showMeta(show)]),
        el('p', { class: 'show__genres', lang: 'en' }, [genres(show)]),
        el('p', {}, [el('a', { href: show.url }, ['Show page on TVmaze'])]),
      ]),
    ]),
    summary(show.summary),
  ]);
  container.replaceChildren(article);
  title.focus();
}

/**
 * Writes text into the status line and sets the `data-state` attribute for styling: `loading`
 * shows a spinner, `error` shows a red border. The third argument is the state's `status` field.
 */
export function renderStatus(status, text, state) {
  status.textContent = text;
  status.dataset.state = state;
}

/**
 * Premiere year and rating under show title: "2012 · rating 6.4". Without premiere date, instead of year —
 * "year unknown", without rating instead of number — "—".
 */
export function showMeta(show) {
  return `${show.premiered.slice(0, 4)} · rating ${show.rating.average}`;
}

/* ---------------- Page fragments ---------------- */

function poster(show, className) {
  if (!show.image) return el('span', { class: `${className} poster--none`, 'aria-hidden': 'true' });
  return el('img', { class: className, src: show.image.medium, alt: '', width: '210', height: '295', loading: 'lazy' });
}

function genres(show) {
  return show.genres.length ? show.genres.join(', ') : '—';
}

/** TVmaze summary is HTML. It is parsed by an inert document, and only text reaches the page. */
function summary(html) {
  const box = el('div', { class: 'show__summary', lang: 'en' });
  const doc = new DOMParser().parseFromString(html ?? '', 'text/html');
  const paragraphs = [...doc.body.querySelectorAll('p')];
  const blocks = paragraphs.length ? paragraphs : [doc.body];
  const texts = blocks.map((block) => block.textContent.trim()).filter(Boolean);
  if (!texts.length) box.append(el('p', { lang: 'en' }, ['No summary available.']));
  for (const text of texts) box.append(el('p', {}, [text]));
  return box;
}

/** Element with attributes and children; strings become text nodes. */
function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, value);
  node.append(...children);
  return node;
}

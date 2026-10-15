/**
 * Показ даних TVmaze. Наданий модуль: не змінюйте його.
 *
 * Модуль не робить запитів і нічого не знає про стани застосунку: він лише показує те, що йому
 * передали. Запити (src/api.ts), стани й тексти (src/state.ts) і обробники подій (src/app.ts) —
 * ваша частина роботи. Поки в src/types.ts немає типу Show (T1), цей файл не компілюється.
 */
import type { Show } from './types.ts';

/**
 * Показує серіали картками в тому самому порядку й замінює вміст `container`. Кожна картка —
 * кнопка `button[data-id="<id серіалу>"]`; що відбувається після натискання, вирішує app.ts.
 * Порожній масив дає порожній список.
 */
export function renderResults(container: Element, shows: readonly Show[]): void {
  const list = el('ul', { class: 'cards' });
  for (const show of shows) {
    const card = el('button', { type: 'button', class: 'card', 'data-id': String(show.id) }, [
      poster(show, 'card__image'),
      el('span', { class: 'card__body' }, [
        el('span', { class: 'card__title', lang: 'en' }, [show.name]),
        el('span', { class: 'card__meta' }, [meta(show)]),
        el('span', { class: 'card__genres', lang: 'en' }, [genres(show)]),
      ]),
    ]);
    list.append(el('li', {}, [card]));
  }
  container.replaceChildren(list);
}

/**
 * Показує сторінку серіалу — постер, назву, рік, оцінку, жанри, опис і посилання на TVmaze — і
 * замінює вміст `container`. Заголовок `h2#show-title` отримує фокус: картка, яку натиснули,
 * зникла, і клавіатура не має загубитися.
 */
export function renderShow(container: Element, show: Show): void {
  const title = el('h2', { id: 'show-title', class: 'show__title', lang: 'en', tabindex: '-1' }, [show.name]);
  const article = el('article', { class: 'show', 'aria-labelledby': 'show-title' }, [
    el('div', { class: 'show__head' }, [
      poster(show, 'show__image'),
      el('div', { class: 'show__intro' }, [
        title,
        el('p', { class: 'show__meta' }, [meta(show)]),
        el('p', { class: 'show__genres', lang: 'en' }, [genres(show)]),
        el('p', {}, [el('a', { href: show.url }, ['Сторінка серіалу на TVmaze'])]),
      ]),
    ]),
    summary(show.summary),
  ]);
  container.replaceChildren(article);
  title.focus();
}

/**
 * Пише текст у рядок статусу й позначає стан атрибутом `data-state` для стилів: `loading`
 * показує спінер, `error` — червону рамку. Третій аргумент — поле `status` стану.
 */
export function renderStatus(status: HTMLElement, text: string, state: string): void {
  status.textContent = text;
  status.dataset.state = state;
}

/* ---------------- Частини сторінки ---------------- */

function poster(show: Show, className: string): HTMLElement {
  if (!show.image) return el('span', { class: `${className} poster--none`, 'aria-hidden': 'true' });
  return el('img', { class: className, src: show.image.medium, alt: '', width: '210', height: '295', loading: 'lazy' });
}

/** «2012 · оцінка 6.5». */
function meta(show: Show): string {
  const year = show.premiered?.slice(0, 4) ?? 'рік невідомий';
  return `${year} · оцінка ${show.rating.average ?? '—'}`;
}

function genres(show: Show): string {
  return show.genres.length ? show.genres.join(', ') : '—';
}

/** Опис TVmaze — HTML. Його розбирає інертний документ, а на сторінку потрапляє лише текст. */
function summary(html: string | null): HTMLElement {
  const box = el('div', { class: 'show__summary', lang: 'en' });
  const doc = new DOMParser().parseFromString(html ?? '', 'text/html');
  const paragraphs = [...doc.body.querySelectorAll('p')];
  const blocks = paragraphs.length ? paragraphs : [doc.body];
  const texts = blocks.map((block) => block.textContent?.trim() ?? '').filter(Boolean);
  if (!texts.length) box.append(el('p', { lang: 'uk' }, ['Опису немає.']));
  for (const text of texts) box.append(el('p', {}, [text]));
  return box;
}

/** Елемент з атрибутами й дітьми; рядки стають текстовими вузлами. */
function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string> = {},
  children: (Node | string)[] = [],
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, value);
  node.append(...children);
  return node;
}

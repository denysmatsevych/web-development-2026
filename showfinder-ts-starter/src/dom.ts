/**
 * Елементи сторінки ShowFinder. Наданий модуль: не змінюйте його.
 *
 * pageElements() знаходить елементи index.html і перевіряє їхній тип, тож вашому коду не
 * потрібні ні `as HTMLFormElement`, ні `!`. Викликайте її всередині start(): тести виконуються в
 * Node, де сторінки (document) немає, тому на верхньому рівні модуля до неї звертатися не можна.
 */
export interface PageElements {
  /** Форма пошуку form#search. */
  form: HTMLFormElement;
  /** Поле назви серіалу #search-query. */
  input: HTMLInputElement;
  /** Рядок статусу #status з role="status". */
  status: HTMLElement;
  /** Область #content: картки результатів або сторінка серіалу. */
  content: HTMLElement;
}

export function pageElements(): PageElements {
  return {
    form: find('#search', HTMLFormElement),
    input: find('#search-query', HTMLInputElement),
    status: find('#status', HTMLElement),
    content: find('#content', HTMLElement),
  };
}

function find<T extends Element>(selector: string, type: new () => T): T {
  const element = document.querySelector(selector);
  if (!(element instanceof type)) {
    throw new Error(`На сторінці немає ${selector} потрібного типу. Чи не змінено index.html?`);
  }
  return element;
}

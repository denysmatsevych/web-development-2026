/**
 * Slide model shared by every lecture deck and the deck components
 * (`src/components/Slide.astro`, `DeckChrome.astro`). One lecture's slides live
 * in `./lecture-1.ts` etc.; `./index.ts` is the registry the routes read.
 */

/** Тип слайда визначає, який макет застосує компонент Slide.astro. */
export type SlideKind = 'title' | 'section' | 'content' | 'code' | 'diagram' | 'checklist';

export interface Slide {
  /** Використовується як id елемента та як #hash в URL. */
  id: string;
  kind: SlideKind;
  title: string;
  subtitle?: string;
  /**
   * Вступний абзац перед списком (для kind: 'content').
   * Разом із `subtitle` та `bullets` підтримує inline-розмітку:
   * `[підпис](https://…)` — зовнішнє посилання, `**жирний**` — <strong>.
   */
  lead?: string;
  bullets?: string[];
  /** Приклад коду з підписом мови. */
  code?: { lang: string; content: string };
  /** ASCII-схема, рендериться моноширинним шрифтом. */
  diagram?: string;
  /** Нотатка доповідача — прихована, вмикається клавішею N. */
  note?: string;
  /** Офіційне джерело зі специфікації. */
  source?: { label: string; href: string };
}

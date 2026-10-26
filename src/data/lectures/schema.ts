/**
 * Slide model shared by every lecture deck and the deck components
 * (`src/components/Slide.astro`, `DeckChrome.astro`). One lecture's slides live
 * in `./lecture-1.ts` etc.; `./index.ts` is the registry the routes read.
 */

/** Тип слайда визначає, який макет застосує компонент Slide.astro. */
export type SlideKind =
  | 'title'
  | 'section'
  | 'content'
  | 'code'
  | 'diagram'
  | 'checklist'
  | 'cards'
  | 'facts'
  | 'roadmap'
  | 'timeline'
  | 'topics';

/** Картка із заголовком і мітками під ним (для kind: 'cards'). */
export interface Card {
  /** Надпис над заголовком, напр. `Лекція 1`. */
  label?: string;
  /** Кольоровий маркер біля надпису — той самий, що для цього виду заняття на схемі курсу. */
  kind?: RoadmapStepKind;
  title: string;
  /** Абзац під заголовком; підтримує inline-розмітку, як `bullets`. */
  text?: string;
  /** Короткі мітки: інструменти, терміни. */
  tags?: string[];
}

/** Етап на горизонтальній шкалі (для kind: 'timeline'). */
export interface TimelineStep {
  /** Надпис над заголовком, напр. `ЛР 21–22 · 4 год.` */
  label: string;
  title: string;
  /** Що входить в етап. */
  items?: string[];
}

/** Плитка з одним ключовим числом чи фактом (для kind: 'facts'). */
export interface Fact {
  /** Що означає значення, напр. `Лабораторні`. */
  label: string;
  /** Саме значення, великим шрифтом: `27`, `5 ECTS`. */
  value: string;
  /** Уточнення дрібним шрифтом під значенням. */
  note?: string;
}

/** Вид заняття на схемі курсу — від нього залежить колір мітки й легенда. */
export type RoadmapStepKind = 'lecture' | 'lab' | 'control' | 'project';

/** Одне заняття на схемі курсу. */
export interface RoadmapStep {
  kind: RoadmapStepKind;
  /** Коротка мітка: `Л1`, `ЛР 3`, `ПМК 1`. */
  label: string;
  /** Тема заняття в один рядок. */
  title: string;
}

/** Колонка схеми курсу: частина програми та її заняття в порядку проведення. */
export interface RoadmapPart {
  /** Надпис над колонкою, напр. `Частина 1`. */
  label: string;
  title: string;
  steps: RoadmapStep[];
  /** Підсумок під колонкою, напр. бали за частину. */
  summary?: string;
}

/** Пункт списку з власним номером, напр. `П1.4` (для kind: 'topics'). */
export interface NumberedItem {
  id: string;
  /** Підтримує ту саму inline-розмітку, що й `bullets`. */
  title: string;
  /** Пояснення до пункту; з ним список стає таблицею (див. `topicHeaders`). */
  detail?: string;
}

export interface Slide {
  /** Використовується як id елемента та як #hash в URL. */
  id: string;
  kind: SlideKind;
  title: string;
  subtitle?: string;
  /**
   * Вступний абзац перед списком (для kind: 'content').
   * Разом із `subtitle` та `bullets` підтримує inline-розмітку:
   * `[підпис](https://…)` — зовнішнє посилання (або `mailto:…`), `**жирний**` — <strong>,
   * `` `код` `` — <code>.
   */
  lead?: string;
  /** Пункти списку; у kind: 'facts' — короткі рядки під плитками. */
  bullets?: string[];
  /** Плитки з ключовими фактами (для kind: 'facts'). */
  facts?: Fact[];
  /** Сітка карток: по чотири в ряд, якщо їх кратно чотирьом, інакше по три (для kind: 'cards'). */
  cards?: Card[];
  /** Приклад коду з підписом мови. */
  code?: { lang: string; content: string };
  /** ASCII-схема, рендериться моноширинним шрифтом. */
  diagram?: string;
  /**
   * Схема курсу (для kind: 'roadmap'): частини — колонками, заняття — рядками,
   * `finale` — смуга під колонками, куди веде вся схема (напр. екзамен).
   */
  roadmap?: { parts: RoadmapPart[]; finale?: string };
  /**
   * Етапи зліва направо (для kind: 'timeline'); `finale` — виділений крок,
   * до якого вони ведуть (напр. екзамен).
   */
  timeline?: { steps: TimelineStep[]; finale?: TimelineStep };
  /**
   * Пункти з власними номерами (для kind: 'topics'): без `detail` — список
   * у дві колонки, з `detail` — таблиця «номер · пункт · пояснення».
   */
  topics?: NumberedItem[];
  /** Заголовки колонок таблиці пунктів із `detail`. */
  topicHeaders?: { title: string; detail: string };
  /** Нотатка доповідача — прихована, вмикається клавішею N. */
  note?: string;
  /** Офіційне джерело зі специфікації. */
  source?: { label: string; href: string };
}

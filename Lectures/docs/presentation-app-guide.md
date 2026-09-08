# Лекція 1 — Презентація-застосунок: покроковий посібник

**Дисципліна:** Сучасна веброзробка: HTML, CSS, JS/TS
**Тема:** Вступ до вебтехнологій, HTTP, DOM та семантичний HTML5
**Мета документа:** покроково зібрати вебзастосунок-презентацію для студентів і задеплоїти
його одним `git push`.

> **Дидактичний прийом цього заняття:** презентація сама є демонстрацією матеріалу лекції.
> Слайди зверстані семантичним HTML5, навігація працює через DOM/BOM API
> (`IntersectionObserver`, `window.location.hash`, `history.replaceState`), а деплой показує
> живий HTTP-цикл у вкладці Network. Студенти дивляться слайд і одразу інспектують його
> в DevTools.

---

## Зміст

| # | Крок | Час |
|---|------|-----|
| 0 | Передумови та перевірка оточення | 5 хв |
| 1 | Вибір стека і чому саме він | 5 хв |
| 2 | Створення проєкту Astro | 5 хв |
| 3 | Підключення Tailwind CSS v4 | 5 хв |
| 4 | Структура папок | 3 хв |
| 5 | Глобальні стилі та дизайн-токени | 10 хв |
| 6 | Дані слайдів (`slides.ts`) — увесь контент лекції | 20 хв |
| 7 | Компонент `Slide.astro` | 15 хв |
| 8 | Базовий макет `BaseLayout.astro` | 10 хв |
| 9 | Сторінка колоди + скрипт навігації (DOM/BOM у дії) | 20 хв |
| 10 | Доступність (a11y) — обов'язковий прохід | 10 хв |
| 11 | Друк у PDF + опційний перемикач теми | 10 хв |
| 12 | Локальний запуск і завдання в DevTools | 10 хв |
| 13 | Git-репозиторій | 5 хв |
| 14 | Деплой: GitHub Pages / Vercel / Netlify | 10 хв |
| 15 | Траблшутинг | — |
| 16 | Домашнє завдання для студентів | — |

**Загалом:** ~2.5 години на збірку з нуля, або ~40 хвилин, якщо копіювати код блоками.

---

## Крок 0. Передумови та перевірка оточення

### 0.1. Що має бути встановлено

| Інструмент | Мінімальна версія | Перевірка |
|-----------|-------------------|-----------|
| Node.js | **22.12.0** (LTS) | `node --version` |
| npm | 10+ | `npm --version` |
| Git | 2.30+ | `git --version` |
| VS Code | остання | — |

### 0.2. ⚠️ Критично: версія Node.js

Актуальний Astro (7.x) **вимагає Node.js ≥ 22.12.0**. Якщо у вас Node 20 — `npm create astro`
впаде з помилкою `EBADENGINE` або мовчки поставить застарілу версію.

Перевірте:

```bash
node --version
```

Якщо версія нижча за `v22.12.0`, оновіть Node одним зі способів:

```powershell
# Варіант А — winget (найпростіше на Windows 11)
winget install OpenJS.NodeJS.LTS

# Варіант Б — nvm-windows (якщо потрібно кілька версій паралельно)
nvm install 22.12.0
nvm use 22.12.0
```

Після оновлення **перезапустіть термінал** і перевірте ще раз.

> **Стан цього проєкту на момент написання.** На робочій машині стоїть Node **20.12.0**,
> тому готовий проєкт у цій папці зібрано на **Astro 5** — це остання гілка, що працює
> на Node 20, і вона повністю сумісна з усім кодом нижче (Tailwind v4, синтаксис `.astro`,
> `@theme` — без змін).
>
> Після оновлення Node до 22.12+ перейти на Astro 7 можна однією командою:
>
> ```bash
> npm install astro@latest
> npm run build
> ```
>
> Ніяких правок у вихідному коді не потрібно.

### 0.3. Рекомендовані розширення VS Code

- **Astro** (`astro-build.astro-vscode`) — підсвітка синтаксису та автодоповнення `.astro`
- **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`) — автодоповнення класів
- **Prettier** + `prettier-plugin-astro` — форматування

---

## Крок 1. Вибір стека і чому саме він

### 1.1. Рішення

| Шар | Вибір | Обґрунтування |
|-----|-------|---------------|
| Фреймворк | **Astro 7** | Zero-JS за замовчуванням → статичний HTML на виході. Ідеально для презентації: миттєве завантаження, простий деплой на будь-який статичний хостинг. |
| Стилі | **Tailwind CSS v4** | Конфігурація прямо в CSS через `@theme`, без `tailwind.config.js`. Utility-класи видно поруч із розміткою — зручно пояснювати студентам. |
| Мова скриптів | **TypeScript** | Astro підтримує TS «з коробки». Типізовані дані слайдів = менше помилок. |
| Навігація | **Vanilla DOM API** | Навмисно без бібліотек: `IntersectionObserver`, `scrollIntoView`, `location.hash` — це саме той матеріал, який викладається в Розділі 4 лекції. |
| Хостинг | **GitHub Pages** (або Vercel / Netlify) | Безкоштовно, деплой через `git push`. |

### 1.2. Чому не shadcn/ui

`shadcn/ui` — це набір React-компонентів. Для презентації з ~20 статичних слайдів React дає
зайвий рантайм (≈45 КБ JS) без жодної переваги: тут немає складного стану, форм чи діалогів.

**Коли shadcn таки доречний:** якщо ви розширюєте проєкт до інтерактивних демо (живий
HTTP-клієнт, редактор HTML із прев'ю, квіз). Тоді додайте React-острівець точково:

```bash
npx astro add react
npx shadcn@latest init
```

Astro дозволяє змішувати: статичні слайди + один React-компонент із `client:visible`.
Це головна перевага «острівної архітектури» — і ще одна тема для лекції.

### 1.3. Альтернативи, які ми свідомо відкинули

| Варіант | Чому ні |
|---------|---------|
| Reveal.js | Готова, але «чорна скринька» — студенти не побачать, як працює навігація. |
| Slidev | Чудовий інструмент, але Vue-екосистема і Markdown-DSL відводять від теми лекції (HTML/CSS/JS). |
| Чистий HTML-файл | Немає збірки, компонентів, деплой-пайплайну — не показує реального робочого процесу. |
| Next.js | Надлишковий: SSR і React-рантайм там, де достатньо статики. |

---

## Крок 2. Створення проєкту Astro

Проєкт створюємо **прямо в корені** папки лекції (там уже є `docs/`).

```bash
cd "C:\Users\matse\Documents\Projects\Web Development - 2026\Lectures"
npm create astro@latest .
```

Відповіді майстра:

| Питання | Відповідь |
|---------|-----------|
| `Directory is not empty. Continue?` | **Yes** (папка `docs/` не заважає) |
| `How would you like to start your new project?` | мінімальний / порожній шаблон (**Minimal** / **Basic**) |
| `Do you plan to write TypeScript?` | **Yes** → **Strict** |
| `Install dependencies?` | **Yes** |
| `Initialize a new git repository?` | **Yes** |

> **Якщо ви працюєте в цій же папці** — проєкт уже зібрано за цим посібником:
> залежності встановлено, усі файли з Кроків 3–14 на місці. Майстер запускати не потрібно,
> достатньо `npm run dev`. Кроки нижче описують, як це саме зроблено, і потрібні студентам,
> які повторюють збірку з нуля.

Перевірка, що все стало на місце:

```bash
npm run dev
```

Відкрийте `http://localhost:4321` — має з'явитися стартова сторінка Astro.
Зупиніть сервер через `Ctrl+C`.

---

## Крок 3. Підключення Tailwind CSS v4

### 3.1. Встановлення

```bash
npm install tailwindcss @tailwindcss/vite
```

> Можна також виконати `npx astro add tailwind` — інтеграція зробить те саме автоматично.
> Ручний спосіб показано навмисно: студенти мають бачити, з чого складається налаштування.

### 3.2. Підключення Vite-плагіна

Замініть вміст `astro.config.mjs`:

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // ⚠️ Замініть на свій GitHub username — потрібно для GitHub Pages (Крок 14).
  // Для Vercel/Netlify рядки `site` та `base` треба ЗАКОМЕНТУВАТИ.
  site: 'https://YOUR-USERNAME.github.io',
  base: '/lecture-1-slides',

  vite: {
    plugins: [tailwindcss()],
  },
});
```

### 3.3. Створення точки входу стилів

```bash
mkdir -p src/styles src/components src/data src/layouts src/scripts
```

Файл `src/styles/global.css` наповнимо на Кроці 5. Поки що:

```css
/* src/styles/global.css */
@import "tailwindcss";
```

---

## Крок 4. Структура папок

Цільова структура проєкту:

```
Lectures/
├─ .github/
│  └─ workflows/
│     └─ deploy.yml            # Крок 14: автодеплой на GitHub Pages
├─ docs/
│  └─ presentation-app-guide.md  # цей файл
├─ public/
│  └─ favicon.svg              # статичні файли «як є»
├─ src/
│  ├─ components/
│  │  ├─ Slide.astro           # один слайд
│  │  └─ DeckChrome.astro      # прогрес-бар, лічильник, підказки
│  ├─ data/
│  │  └─ slides.ts             # УВЕСЬ контент лекції як типізовані дані
│  ├─ layouts/
│  │  └─ BaseLayout.astro      # <html>, <head>, meta, підключення стилів
│  ├─ pages/
│  │  └─ index.astro           # колода слайдів
│  ├─ scripts/
│  │  └─ deck.ts               # навігація: DOM + BOM API
│  └─ styles/
│     └─ global.css            # Tailwind + дизайн-токени + друк
├─ astro.config.mjs
├─ package.json
└─ tsconfig.json
```

**Принцип поділу:** контент (`data/`) відокремлено від подання (`components/`) і від
поведінки (`scripts/`). Щоб змінити текст лекції, редагують лише `slides.ts` — верстку
чіпати не потрібно.

---
## Крок 5. Глобальні стилі та дизайн-токени

Tailwind v4 конфігурується **прямо в CSS** через директиву `@theme` — окремий
`tailwind.config.js` більше не потрібен. Кожен токен автоматично стає utility-класом:
`--color-accent-500` → `bg-accent-500`, `text-accent-500`, `border-accent-500`.

Повністю замініть `src/styles/global.css`:

```css
/* src/styles/global.css */
@import "tailwindcss";

/* ───────────────────────────────────────────────────────────
   1. ДИЗАЙН-ТОКЕНИ
   Одна зміна тут — і оновлюється вся презентація.
   ─────────────────────────────────────────────────────────── */
@theme {
  /* Палітра в OKLCH: рівномірна за сприйняттям яскравість */
  --color-ink-950: oklch(0.16 0.021 265);
  --color-ink-900: oklch(0.21 0.026 265);
  --color-ink-800: oklch(0.28 0.028 265);
  --color-ink-400: oklch(0.65 0.020 265);
  --color-ink-200: oklch(0.86 0.010 265);
  --color-paper:   oklch(0.98 0.004 265);

  --color-accent-300: oklch(0.86 0.10 205);
  --color-accent-500: oklch(0.72 0.15 205);
  --color-accent-700: oklch(0.55 0.15 205);

  --color-warn-500: oklch(0.78 0.16 75);

  /* Типографіка */
  --font-display: "Inter", ui-sans-serif, system-ui, "Segoe UI", sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, "Cascadia Code", Consolas, monospace;

  /* Розміри під проєкційний екран: читабельно з останнього ряду */
  --text-slide-h1: clamp(2rem, 5.5vw, 4.5rem);
  --text-slide-h2: clamp(1.5rem, 3.6vw, 2.75rem);
  --text-slide-body: clamp(1rem, 1.7vw, 1.6rem);
}

/* ───────────────────────────────────────────────────────────
   2. БАЗОВІ СТИЛІ
   ─────────────────────────────────────────────────────────── */
@layer base {
  html {
    scroll-behavior: smooth;
  }

  body {
    background-color: var(--color-ink-950);
    color: var(--color-paper);
    font-family: var(--font-display);
    /* Презентація не має скролитися вертикально */
    overflow: hidden;
  }

  /* Ховаємо скролбар колоди — керування клавіатурою та кнопками */
  .deck::-webkit-scrollbar { display: none; }
  .deck { scrollbar-width: none; }

  /* Видимий фокус — вимога WCAG 2.4.7 */
  :focus-visible {
    outline: 3px solid var(--color-accent-500);
    outline-offset: 4px;
  }
}

/* ───────────────────────────────────────────────────────────
   3. ПОВАГА ДО НАЛАШТУВАНЬ КОРИСТУВАЧА
   ─────────────────────────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

/* ───────────────────────────────────────────────────────────
   4. ДРУК / ЕКСПОРТ У PDF (Ctrl+P → Save as PDF)
   Кожен слайд стає окремою сторінкою.
   ─────────────────────────────────────────────────────────── */
@media print {
  @page { size: 1600px 900px; margin: 0; }

  body { overflow: visible; background: white; color: black; }

  .deck {
    display: block !important;
    overflow: visible !important;
    height: auto !important;
  }

  .slide {
    width: 100% !important;
    height: 900px !important;
    break-after: page;
    background: white !important;
    color: black !important;
  }

  .no-print { display: none !important; }
}
```

**Що тут варто пояснити студентам:**

- `@theme` — не «магія Tailwind», а генератор CSS-змінних. `--color-accent-500` реально
  існує в `:root`, і це видно в DevTools → Computed.
- `clamp()` дає адаптивну типографіку без жодного медіазапиту.
- `prefers-reduced-motion` та `:focus-visible` — прямий місток до розділу лекції про a11y.

---

## Крок 6. Дані слайдів (`slides.ts`)

Увесь контент лекції живе в одному типізованому файлі. Верстка про нього нічого не знає —
вона просто рендерить масив. Щоб змінити текст лекції, редагують лише цей файл.

Створіть `src/data/slides.ts`:

```ts
// src/data/slides.ts

/** Тип слайда визначає, який макет застосує компонент Slide.astro */
export type SlideKind = 'title' | 'section' | 'content' | 'code' | 'diagram' | 'checklist';

export interface Slide {
  /** Використовується як id елемента та як #hash в URL */
  id: string;
  kind: SlideKind;
  title: string;
  subtitle?: string;
  bullets?: string[];
  /** Приклад коду з підписом мови */
  code?: { lang: string; content: string };
  /** ASCII-схема, рендериться моноширинним шрифтом */
  diagram?: string;
  /** Нотатка доповідача — прихована, вмикається клавішею N */
  note?: string;
  /** Офіційне джерело зі специфікації */
  source?: { label: string; href: string };
}

export const deckTitle = 'Вступ до вебтехнологій, HTTP, DOM та семантичний HTML5';

export const slides: Slide[] = [
  {
    id: 'intro',
    kind: 'title',
    title: deckTitle,
    subtitle: 'Сучасна веброзробка: HTML, CSS, JS/TS · Лекція 1',
    note: 'Попросіть студентів відкрити цю сторінку на своїх ноутбуках і натиснути F12. Ми будемо інспектувати саму презентацію.',
  },

  // ── РОЗДІЛ 1 ────────────────────────────────────────────────
  {
    id: 'section-1',
    kind: 'section',
    title: 'Розділ 1',
    subtitle: 'Базові поняття, інтерфейси та інструменти веброзробки',
  },
  {
    id: 'ui-ux',
    kind: 'content',
    title: 'UI vs UX',
    subtitle: 'Інтерфейс — це межа взаємодії між двома системами',
    bullets: [
      'GUI (Graphical User Interface) — взаємодія через візуальні елементи: іконки, кнопки, меню, вікна.',
      'UI (User Interface) — візуальне та інтерактивне оформлення: колірна гама, типографіка, сітка, відступи, компоненти.',
      'UX (User Experience) — загальне враження, логіка, зручність та ефективність досягнення цілей користувача.',
      'UI — поверхневий шар айсберга. UX — усе під водою: структура, компонування, дослідження, сценарії.',
    ],
    note: 'Модель «User Experience Iceberg». Запитайте аудиторію: назвіть застосунок із гарним UI та поганим UX.',
    source: {
      label: 'Nielsen Norman Group — The Definition of User Experience',
      href: 'https://www.nngroup.com/articles/definition-user-experience/',
    },
  },
  {
    id: 'ui-not-ux',
    kind: 'content',
    title: 'Чому гарний UI не гарантує якісний UX',
    bullets: [
      'Незручна навігація — користувач не знаходить потрібне.',
      'Повільне завантаження — естетика не рятує від очікування.',
      'Плутані сценарії — краса без зрозумілої логіки дій.',
      'Відсутність адаптивності — на мобільному все ламається.',
    ],
    note: 'Ключова теза: естетика не компенсує розчарування від невдалого сценарію.',
  },
  {
    id: 'web-page-site-app',
    kind: 'content',
    title: 'Вебсторінка → Вебсайт → Вебзастосунок',
    bullets: [
      'Web Page — окремий документ, розмічений мовою HTML, доступний через браузер.',
      'Website — сукупність пов’язаних сторінок під спільною доменною назвою та навігацією.',
      'Web App — інтерактивна програма в браузері зі складною бізнес-логікою, що реагує в реальному часі: Google Docs, Figma, Trello.',
      'Статичні сторінки: вміст сформовано заздалегідь, однаковий для всіх користувачів.',
      'Динамічні сторінки: вміст генерується «на льоту» на сервері або клієнті з бази даних чи API.',
    ],
    note: 'Наша презентація — статичний сайт. Спитайте: що треба додати, щоб вона стала Web App? (стан, збереження, автентифікація)',
  },
  {
    id: 'frontend-backend',
    kind: 'content',
    title: 'Напрямки розробки та інструментарій',
    bullets: [
      'Frontend — клієнтська частина (HTML, CSS, JS/TS), виконується в браузері користувача.',
      'Backend — серверна частина (Node.js, Python, Java, Go), бази даних, авторизація, бізнес-логіка.',
      'Fullstack — охоплення і клієнтської, і серверної розробки.',
      'IDE: VS Code, WebStorm · DevTools: Elements, Console, Network, Performance',
      'VCS: Git та GitHub/GitLab · Збирачі й локальні сервери: Vite, Live Server, Node.js runtime',
    ],
    note: 'Кожен інструмент із цього списку ми вже використали, поки збирали цю презентацію.',
    source: {
      label: 'MDN — How the Web works',
      href: 'https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/How_the_Web_works',
    },
  },

  // ── РОЗДІЛ 2 ────────────────────────────────────────────────
  {
    id: 'section-2',
    kind: 'section',
    title: 'Розділ 2',
    subtitle: 'Мережева взаємодія та клієнт-серверна архітектура',
  },
  {
    id: 'client-server',
    kind: 'content',
    title: 'Клієнт-серверна модель та HTTP/HTTPS',
    bullets: [
      'Клієнт (браузер) надсилає запит на отримання ресурсу або виконання дії.',
      'Сервер обробляє запит, виконує обчислення та повертає відповідь.',
      'HTTP — протокол прикладного рівня для передачі гіпертекстових документів і даних.',
      'HTTPS — той самий HTTP плюс шифрування каналу через TLS/SSL.',
    ],
    note: 'Наголосіть: HTTP не зберігає стан між запитами (stateless). Звідси потреба в cookie, токенах, сесіях.',
    source: {
      label: 'MDN — An overview of HTTP · RFC 9110',
      href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview',
    },
  },
  {
    id: 'http-anatomy',
    kind: 'code',
    title: 'Анатомія HTTP-запиту та відповіді',
    subtitle: 'Request Line / Status Line · Headers · Body',
    code: {
      lang: 'http',
      content: [
        'GET /lecture-1-slides/ HTTP/1.1         <- Request Line: метод, шлях, версія',
        'Host: your-username.github.io           <- Headers: метадані запиту',
        'User-Agent: Mozilla/5.0 ...',
        'Accept: text/html,application/xhtml+xml',
        'Authorization: Bearer <token>',
        '                                        <- порожній рядок = кінець заголовків',
        '(Body передається лише в POST / PUT / PATCH)',
        '',
        '',
        'HTTP/1.1 200 OK                         <- Status Line: версія, код, пояснення',
        'Content-Type: text/html; charset=utf-8  <- Headers: метадані відповіді',
        'Cache-Control: max-age=600',
        'Set-Cookie: session=abc123',
        '',
        '<!DOCTYPE html>                         <- Body: сам ресурс',
        '<html lang="uk"> ... </html>',
      ].join('\n'),
    },
    note: 'Відкрийте DevTools → Network → клікніть на документ → вкладка Headers. Покажіть ці самі рядки наживо.',
  },
  {
    id: 'http-methods',
    kind: 'content',
    title: 'Основні HTTP-методи',
    bullets: [
      'GET — отримання даних без модифікації стану сервера. Безпечний та ідемпотентний.',
      'POST — відправка даних на сервер для створення нового ресурсу. Не ідемпотентний.',
      'PUT — повна заміна або створення ресурсу за вказаною адресою. Ідемпотентний.',
      'PATCH — часткова модифікація ресурсу.',
      'DELETE — видалення ресурсу. Ідемпотентний.',
    ],
    note: 'Ідемпотентність = повторний однаковий запит не змінює результат. Тому браузер може безпечно повторити GET, але не POST.',
  },
  {
    id: 'http-status',
    kind: 'content',
    title: 'Класи статус-кодів HTTP',
    bullets: [
      '1xx Informational — проміжна інформація, обробка триває.',
      '2xx Success — 200 OK, 201 Created.',
      '3xx Redirection — 301 Moved Permanently, 304 Not Modified.',
      '4xx Client Error — 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found.',
      '5xx Server Error — 500 Internal Server Error, 502 Bad Gateway, 503 Service Unavailable.',
    ],
    note: '4xx — винен клієнт, 5xx — винен сервер. 304 наочно показує роботу кешу: тіла відповіді немає взагалі.',
  },
  {
    id: 'crp',
    kind: 'diagram',
    title: 'Від URL до пікселів: Critical Rendering Path',
    subtitle: 'Що відбувається після натискання Enter в адресному рядку',
    diagram: [
      '1. DNS Lookup         example.com  ──▶  93.184.216.34',
      '2. TCP + TLS          встановлення з’єднання та узгодження шифрування',
      '3. HTTP GET Request   браузер просить головний HTML-документ',
      '4. Server Response    сервер повертає HTML',
      '',
      '5. Critical Rendering Path:',
      '',
      '   HTML ──▶ DOM Tree ──┐',
      '                       ├──▶ Render Tree ──▶ Layout ──▶ Paint ──▶ Composite',
      '   CSS  ──▶ CSSOM   ───┘     лише видимі     геометрія   пікселі   GPU-шари',
    ].join('\n'),
    note: 'Layout також називають Reflow, Paint — Repaint. Покажіть у DevTools → Performance запис завантаження цієї сторінки.',
    source: {
      label: 'MDN — Populating the page: how browsers work',
      href: 'https://developer.mozilla.org/en-US/docs/Web/Performance/How_browsers_work',
    },
  },

  // ── РОЗДІЛ 3 ────────────────────────────────────────────────
  {
    id: 'section-3',
    kind: 'section',
    title: 'Розділ 3',
    subtitle: 'Основи HTML5, синтаксис та семантика',
  },
  {
    id: 'html-anatomy',
    kind: 'code',
    title: 'Анатомія HTML5-документа',
    subtitle: 'HTML — мова розмітки, а не програмування: немає змінних, циклів, обчислень',
    code: {
      lang: 'html',
      content: [
        '<!DOCTYPE html>            <!-- стандартний режим замість Quirks Mode -->',
        '<html lang="uk">           <!-- lang: для SEO та зчитувачів екрана -->',
        '<head>                     <!-- метадані, на сторінці не видно -->',
        '  <meta charset="UTF-8">',
        '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
        '  <title>Вступ до вебтехнологій</title>',
        '</head>',
        '<body>                     <!-- увесь видимий вміст -->',
        '  <h1>Заголовок сторінки</h1>',
        '  <p>Основний текст сторінки.</p>',
        '</body>',
        '</html>',
      ].join('\n'),
    },
    note: 'Приберіть DOCTYPE у DevTools і покажіть, як зміниться box model у Quirks Mode.',
    source: {
      label: 'WHATWG HTML Living Standard · MDN — HTML basics',
      href: 'https://html.spec.whatwg.org/multipage/introduction.html',
    },
  },
  {
    id: 'element-anatomy',
    kind: 'content',
    title: 'Анатомія HTML-елемента',
    bullets: [
      'Відкриваючий тег: <p class="text">',
      'Атрибут та його значення: class="text"',
      'Вміст (Content): текстове або вкладене наповнення',
      'Закриваючий тег: </p>',
      'Порожні (self-closing) елементи не мають вмісту й закриваючого тега: <img>, <input>, <br>, <meta>',
    ],
    note: 'Схема підписів: Tag name → Attribute name → Attribute value → Content → Closing tag.',
  },
  {
    id: 'semantics',
    kind: 'content',
    title: 'Семантичний HTML5 проти «div soup»',
    subtitle: 'Тег обирають за змістом, а не за зовнішнім виглядом',
    bullets: [
      '<header> — шапка сторінки або секції: логотип, заголовок, глобальна навігація.',
      '<nav> — навігаційний блок із посиланнями.',
      '<main> — унікальний основний контент; рівно один на сторінці.',
      '<article> — самостійний незалежний блок: допис, новина, картка товару.',
      '<section> — тематичний розділ із власним заголовком.',
      '<aside> — побічний контент: сайдбар, реклама, пов’язані посилання.',
      '<footer> — підвал: копірайт, контакти, юридична інформація.',
    ],
    note: '«div soup» — верстка макета лише через <div> і <span>. Погіршує читабельність коду, ускладнює підтримку, шкодить SEO і робить сторінку непридатною для зчитувачів екрана.',
    source: {
      label: 'MDN — Semantics · WHATWG Document Sections',
      href: 'https://developer.mozilla.org/en-US/docs/Glossary/Semantics',
    },
  },
  {
    id: 'seo-a11y',
    kind: 'content',
    title: 'Семантика → SEO та Доступність',
    bullets: [
      'SEO: пошукові роботи (Googlebot) читають семантичне дерево, визначають пріоритет заголовків <h1>–<h6> та релевантність вмісту.',
      'a11y: зчитувачі екрана трактують семантичні теги як орієнтири (landmarks).',
      'Користувач із порушенням зору натискає одну клавішу — і одразу переходить до <main> або <nav>.',
      '<div id="header"> для машини не означає нічого. <header> означає роль banner.',
    ],
    note: 'Порівняльний макет: <div id="header"> / <div id="nav"> проти <header> / <nav> / <main> / <footer>.',
  },

  // ── РОЗДІЛ 4 ────────────────────────────────────────────────
  {
    id: 'section-4',
    kind: 'section',
    title: 'Розділ 4',
    subtitle: 'Об’єктні моделі браузера: DOM, BOM, CSSOM, A11y OM',
  },
  {
    id: 'dom-bom',
    kind: 'content',
    title: 'DOM та BOM',
    bullets: [
      'DOM (Document Object Model) — програмний інтерфейс до HTML-документа: деревовидна об’єктна модель у пам’яті браузера, де кожен тег, атрибут і текст є вузлом (Node/Element).',
      'DOM дозволяє JavaScript динамічно змінювати вміст, структуру та стилі сторінки.',
      'BOM (Browser Object Model) — набір об’єктів для взаємодії із середовищем поза межами документа.',
      'window — глобальний об’єкт · window.location — URL і перенаправлення',
      'window.navigator — браузер, ОС, геолокація · window.history — історія переходів · window.screen — параметри екрана',
    ],
    note: 'Навігація цієї презентації побудована саме на DOM + BOM: querySelectorAll, scrollIntoView, location.hash, history.replaceState. Відкрийте src/scripts/deck.ts просто на лекції.',
    source: {
      label: 'WHATWG DOM Living Standard · MDN — Introduction to the DOM',
      href: 'https://dom.spec.whatwg.org/',
    },
  },
  {
    id: 'cssom-a11yom',
    kind: 'diagram',
    title: 'CSSOM, Render Tree та Accessibility Tree',
    subtitle: 'Браузер будує кілька паралельних дерев з одного документа',
    diagram: [
      'HTML Code ──▶ DOM Tree ────┐',
      '                           ├──▶ Render Tree ──▶ Екран',
      'CSS Code  ──▶ CSSOM ───────┘     без display:none',
      '',
      'DOM Tree ──▶ Accessibility Tree ──▶ OS A11y API ──▶ Screen Reader',
      '             (A11y OM)              MSAA · IA2 · AX   NVDA · JAWS · VoiceOver',
    ].join('\n'),
    note: 'Ключове: вузли з display:none не потрапляють до Render Tree — і зникають також із Accessibility Tree.',
    source: {
      label: 'W3C CSSOM · MDN — Accessibility Tree',
      href: 'https://developer.mozilla.org/en-US/docs/Glossary/Accessibility_tree',
    },
  },
  {
    id: 'a11y-om',
    kind: 'content',
    title: 'A11y OM: що «бачить» зчитувач екрана',
    bullets: [
      'Role — роль елемента: button, link, checkbox, banner, navigation.',
      'Name — доступна назва: текст, aria-label, <label>, alt.',
      'State — стан: checked, disabled, expanded, selected.',
      'Value — значення: для повзунків, полів вводу, індикаторів прогресу.',
      'Ці дані передаються системним API доступності ОС, з якими працюють NVDA, JAWS, VoiceOver.',
    ],
    note: 'Живе демо: DevTools → Elements → вкладка Accessibility. Покажіть Role/Name/State кнопок навігації цієї презентації.',
  },

  // ── ПІДСУМОК ────────────────────────────────────────────────
  {
    id: 'checklist',
    kind: 'checklist',
    title: 'Контрольні питання',
    bullets: [
      'Поясніть концептуальну різницю між UI та UX.',
      'Який шлях проходить HTTP-запит від клієнта до отримання відповіді від сервера?',
      'Що таке Critical Rendering Path і які його основні етапи?',
      'Назвіть 5 ключових семантичних тегів HTML5 та поясніть їхнє значення для SEO та a11y.',
      'Чим відрізняється DOM від BOM та CSSOM?',
      'Що таке Accessibility Tree (A11y OM) і яку роль воно відіграє для екранних зчитувачів?',
    ],
    note: 'Дайте 3 хвилини на самоперевірку, потім разом розберіть питання 3 і 6 — вони найчастіше провалюються на іспиті.',
  },
  {
    id: 'homework',
    kind: 'content',
    title: 'Домашнє завдання',
    bullets: [
      'Форкніть репозиторій цієї презентації та задеплойте власну копію на GitHub Pages.',
      'Додайте один слайд про будь-який HTTP-заголовок, не згаданий у лекції.',
      'Прогоніть сторінку через Lighthouse: показник Accessibility має бути 100.',
      'У DevTools → Network знайдіть запит зі статусом 304 і поясніть, чому в нього порожнє тіло.',
    ],
    note: 'Дедлайн і посилання на форму здачі оголосіть на цьому слайді.',
  },
];
```

> **Чому масив рядків із `.join('\n')`, а не шаблонний рядок?**
> У прикладах коду трапляються зворотні слеші й символи `${`, які в шаблонному рядку
> довелося б екранувати. Масив рядків прибирає цю проблему повністю — і це ще одна
> практична деталь, яку варто показати студентам.

---
## Крок 7. Компонент `Slide.astro`

Один компонент рендерить усі шість типів слайда. Розмітка навмисно семантична — це той
самий матеріал, що й на слайді «Семантичний HTML5».

### 7.1. Доповніть `src/styles/global.css`

Додайте наприкінці файлу (нотатки доповідача та скрін-рідер-утиліта):

```css
/* ───────────────────────────────────────────────────────────
   5. НОТАТКИ ДОПОВІДАЧА — вмикаються клавішею N
   ─────────────────────────────────────────────────────────── */
.deck-note { display: none; }
body.show-notes .deck-note { display: block; }

/* ───────────────────────────────────────────────────────────
   6. СВІТЛА ТЕМА — перевизначаємо ЛИШЕ значення токенів.
   Уся колода інвертується шістьма рядками, бо кожен колір
   у розмітці посилається на токен, а не на конкретний hex.
   ─────────────────────────────────────────────────────────── */
html.theme-light {
  --color-ink-950: oklch(0.99 0.003 265);
  --color-ink-900: oklch(0.96 0.005 265);
  --color-ink-800: oklch(0.90 0.008 265);
  --color-ink-400: oklch(0.45 0.020 265);
  --color-ink-200: oklch(0.30 0.020 265);
  --color-paper:   oklch(0.20 0.020 265);
  --color-accent-700: oklch(0.86 0.09 205);
}
```

### 7.2. Створіть `src/components/Slide.astro`

```astro
---
// src/components/Slide.astro
import type { Slide } from '../data/slides';

interface Props {
  slide: Slide;
  index: number;
  total: number;
}

const { slide, index, total } = Astro.props;

// Один слайд = одна «сторінка» ширини вікна з магнітним прилипанням
const frame =
  'slide relative flex h-dvh w-screen shrink-0 snap-center snap-always ' +
  'flex-col justify-center overflow-hidden px-[7vw] py-[8vh]';

// Tailwind сканує вихідний код як текст, тому класи мають бути
// цілісними літералами — жодних рядків на кшталт `bg-${color}`.
const tones: Record<Slide['kind'], string> = {
  title: 'bg-ink-950 text-paper',
  section: 'bg-accent-700 text-ink-950',
  content: 'bg-ink-950 text-paper',
  code: 'bg-ink-900 text-paper',
  diagram: 'bg-ink-900 text-paper',
  checklist: 'bg-ink-950 text-paper',
};
---

<section
  id={slide.id}
  class={`${frame} ${tones[slide.kind]}`}
  tabindex="-1"
  aria-roledescription="слайд"
  aria-label={`Слайд ${index + 1} з ${total}: ${slide.title}`}
>
  {/* ── Титульний слайд ─────────────────────────────── */}
  {slide.kind === 'title' && (
    <header class="max-w-[24ch]">
      <p class="mb-8 font-mono text-sm uppercase tracking-[0.3em] text-accent-500">
        Лекція 1
      </p>
      <h1 class="text-slide-h1 font-bold leading-[1.05] text-balance">{slide.title}</h1>
      {slide.subtitle && (
        <p class="mt-8 text-slide-body text-ink-400">{slide.subtitle}</p>
      )}
    </header>
  )}

  {/* ── Роздільник розділу ──────────────────────────── */}
  {slide.kind === 'section' && (
    <header>
      <p class="font-mono text-sm uppercase tracking-[0.3em] opacity-70">{slide.title}</p>
      <h2 class="mt-4 max-w-[20ch] text-slide-h1 font-bold leading-tight text-balance">
        {slide.subtitle}
      </h2>
    </header>
  )}

  {/* ── Звичайний контентний слайд ──────────────────── */}
  {slide.kind === 'content' && (
    <>
      <header class="mb-10">
        <h2 class="text-slide-h2 font-bold text-balance">{slide.title}</h2>
        {slide.subtitle && (
          <p class="mt-3 text-slide-body text-accent-300">{slide.subtitle}</p>
        )}
      </header>
      <ul class="flex max-w-[75ch] flex-col gap-5">
        {slide.bullets?.map((point) => (
          <li class="flex gap-4 text-slide-body leading-snug">
            <span aria-hidden="true" class="mt-[0.55em] h-2 w-2 shrink-0 rounded-full bg-accent-500" />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </>
  )}

  {/* ── Слайд із кодом ──────────────────────────────── */}
  {slide.kind === 'code' && (
    <>
      <header class="mb-8">
        <h2 class="text-slide-h2 font-bold text-balance">{slide.title}</h2>
        {slide.subtitle && <p class="mt-3 text-ink-400">{slide.subtitle}</p>}
      </header>
      <figure class="max-w-[100ch]">
        <pre
          class="overflow-x-auto rounded-xl border border-ink-800 bg-ink-950 p-8 text-[clamp(0.7rem,1.15vw,1.05rem)] leading-relaxed"
        ><code class="font-mono">{slide.code?.content}</code></pre>
        <figcaption class="mt-3 font-mono text-xs uppercase tracking-widest text-ink-400">
          {slide.code?.lang}
        </figcaption>
      </figure>
    </>
  )}

  {/* ── Слайд-схема ─────────────────────────────────── */}
  {slide.kind === 'diagram' && (
    <>
      <header class="mb-8">
        <h2 class="text-slide-h2 font-bold text-balance">{slide.title}</h2>
        {slide.subtitle && <p class="mt-3 text-ink-400">{slide.subtitle}</p>}
      </header>
      <pre
        role="img"
        aria-label={`Схема: ${slide.title}`}
        class="overflow-x-auto font-mono text-[clamp(0.65rem,1.05vw,1rem)] leading-relaxed text-accent-300"
      >{slide.diagram}</pre>
    </>
  )}

  {/* ── Чек-лист питань ─────────────────────────────── */}
  {slide.kind === 'checklist' && (
    <>
      <h2 class="mb-10 text-slide-h2 font-bold">{slide.title}</h2>
      <ol class="flex max-w-[75ch] list-none flex-col gap-4">
        {slide.bullets?.map((point, i) => (
          <li class="flex gap-4 text-slide-body leading-snug">
            <span class="font-mono text-accent-500 tabular-nums">{i + 1}.</span>
            <span>{point}</span>
          </li>
        ))}
      </ol>
    </>
  )}

  {/* ── Джерело ─────────────────────────────────────── */}
  {slide.source && (
    <footer class="mt-auto pt-10">
      <a
        href={slide.source.href}
        target="_blank"
        rel="noopener noreferrer"
        class="font-mono text-xs text-ink-400 underline decoration-dotted underline-offset-4 hover:text-accent-500"
      >
        {slide.source.label} ↗
      </a>
    </footer>
  )}

  {/* ── Нотатка доповідача: у DOM є завжди, показується по клавіші N ── */}
  {slide.note && (
    <aside
      class="deck-note no-print absolute inset-x-0 bottom-14 mx-[7vw] rounded-lg border-l-4 border-warn-500 bg-ink-900/95 px-5 py-3 text-sm text-ink-200"
    >
      <strong class="text-warn-500">Нотатка:</strong> {slide.note}
    </aside>
  )}
</section>
```

**Що пояснити студентам на цьому кроці:**

- `{slide.code?.content}` — Astro автоматично екранує вивід, тому `<html>` у прикладі коду
  показується як текст, а не парситься як розмітка. Це вбудований захист від XSS.
- `role="img"` + `aria-label` на ASCII-схемі: без цього зчитувач екрана прочитає купу тире.
- `tabindex="-1"` на `<section>` — слайд не потрапляє в Tab-обхід, але може отримати фокус
  програмно, коли ми перегортаємо колоду.

---

## Крок 8. Базовий макет `BaseLayout.astro`

Тут живе весь `<head>` — саме той, що розбирається на слайді «Анатомія HTML5-документа».

```astro
---
// src/layouts/BaseLayout.astro
import '../styles/global.css';

interface Props {
  title: string;
  description?: string;
}

const {
  title,
  description = 'Лекція 1: вступ до вебтехнологій, HTTP, DOM та семантичний HTML5.',
} = Astro.props;

// BASE_URL НЕ гарантує слеш на кінці: із base: '/lecture-1-slides'
// шаблон `${BASE_URL}favicon.svg` дасть '/lecture-1-slidesfavicon.svg'.
// Нормалізуємо один раз і користуємось усюди.
const withBase = (path: string) =>
  `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
---

<!doctype html>
<html lang="uk">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content={description} />
    <meta name="color-scheme" content="dark light" />
    <meta name="generator" content={Astro.generator} />

    <title>{title}</title>

    <link rel="icon" type="image/svg+xml" href={withBase('favicon.svg')} />

    <meta property="og:type" content="website" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />

    <!-- Тему застосовуємо ДО першого рендера, щоб не було спалаху білим -->
    <script is:inline>
      const saved = localStorage.getItem('deck-theme');
      if (saved === 'light') document.documentElement.classList.add('theme-light');
    </script>
  </head>

  <body>
    <a
      href="#deck"
      class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-accent-500 focus:px-4 focus:py-2 focus:text-ink-950"
    >
      Перейти до слайдів
    </a>

    <slot />
  </body>
</html>
```

> **`is:inline`** каже Astro не збирати цей скрипт у бандл, а лишити в `<head>` як є.
> Це стандартний прийом проти FOUC (flash of unstyled content): тема має застосуватися
> до першого Paint. Ще один живий приклад Critical Rendering Path.

---

## Крок 9. Панель керування та сторінка колоди

### 9.1. `src/components/DeckChrome.astro`

```astro
---
// src/components/DeckChrome.astro
interface Props {
  total: number;
}
const { total } = Astro.props;
---

<div class="no-print fixed inset-x-0 bottom-0 z-40 bg-gradient-to-t from-ink-950/95 to-transparent">
  <div
    id="progress-track"
    role="progressbar"
    aria-label="Прогрес презентації"
    aria-valuemin="1"
    aria-valuemax={total}
    aria-valuenow="1"
    class="h-1 w-full bg-ink-800"
  >
    <div
      id="slide-progress"
      class="h-full bg-accent-500 transition-[width] duration-300 ease-out"
      style="width: 0%"
    />
  </div>

  <nav aria-label="Навігація по слайдах" class="flex items-center justify-between gap-6 px-6 py-3">
    <p id="slide-counter" aria-live="polite" class="font-mono text-sm text-ink-400 tabular-nums">
      1 / {total}
    </p>

    <p class="hidden font-mono text-xs text-ink-400 md:block">
      ← → перегортання · N нотатки · F повний екран · T тема · Ctrl+P у PDF
    </p>

    <div class="flex gap-2">
      <button
        id="btn-prev"
        type="button"
        class="rounded-md border border-ink-800 px-4 py-2 text-sm text-paper transition hover:border-accent-500 hover:text-accent-500 disabled:cursor-not-allowed disabled:opacity-35"
      >
        <span aria-hidden="true">←</span> Назад
      </button>
      <button
        id="btn-next"
        type="button"
        class="rounded-md border border-ink-800 px-4 py-2 text-sm text-paper transition hover:border-accent-500 hover:text-accent-500 disabled:cursor-not-allowed disabled:opacity-35"
      >
        Далі <span aria-hidden="true">→</span>
      </button>
    </div>
  </nav>
</div>
```

### 9.2. `src/pages/index.astro`

```astro
---
// src/pages/index.astro
import BaseLayout from '../layouts/BaseLayout.astro';
import DeckChrome from '../components/DeckChrome.astro';
import SlideView from '../components/Slide.astro';
import { slides, deckTitle } from '../data/slides';
---

<BaseLayout title={deckTitle}>
  <main
    id="deck"
    class="deck flex h-dvh w-screen snap-x snap-mandatory overflow-x-auto overflow-y-hidden"
    tabindex="-1"
  >
    {slides.map((slide, index) => (
      <SlideView slide={slide} index={index} total={slides.length} />
    ))}
  </main>

  <DeckChrome total={slides.length} />

  <script>
    import { initDeck } from '../scripts/deck';
    initDeck();
  </script>
</BaseLayout>
```

Зверніть увагу: `<main>` тут рівно один на сторінку — саме так, як вимагає специфікація
й слайд про семантику.

### 9.3. `src/scripts/deck.ts` — DOM та BOM у дії

Це найважливіший файл для лекції: тут немає жодної залежності, лише браузерні API,
про які йшлося в Розділі 4.

```ts
// src/scripts/deck.ts

export function initDeck(): void {
  // ── DOM: знаходимо вузли в дереві документа ──────────────
  const deck = document.querySelector<HTMLElement>('#deck');
  const slides = Array.from(document.querySelectorAll<HTMLElement>('.slide'));
  if (!deck || slides.length === 0) return;

  const counter = document.querySelector<HTMLElement>('#slide-counter');
  const progress = document.querySelector<HTMLElement>('#slide-progress');
  const track = document.querySelector<HTMLElement>('#progress-track');
  const btnPrev = document.querySelector<HTMLButtonElement>('#btn-prev');
  const btnNext = document.querySelector<HTMLButtonElement>('#btn-next');

  let current = 0;

  // ── Перехід на слайд ─────────────────────────────────────
  function goTo(index: number, options: { focus?: boolean; instant?: boolean } = {}): void {
    const target = Math.min(Math.max(index, 0), slides.length - 1);
    slides[target].scrollIntoView({
      behavior: options.instant ? 'auto' : 'smooth',
      inline: 'start',
      block: 'nearest',
    });
    // Фокус на слайді — щоб зчитувач екрана озвучив його вміст
    if (options.focus) slides[target].focus({ preventScroll: true });
  }

  // ── Оновлення інтерфейсу ─────────────────────────────────
  function render(): void {
    const human = current + 1;

    if (counter) counter.textContent = `${human} / ${slides.length}`;

    if (progress) progress.style.width = `${(human / slides.length) * 100}%`;
    track?.setAttribute('aria-valuenow', String(human));

    if (btnPrev) btnPrev.disabled = current === 0;
    if (btnNext) btnNext.disabled = current === slides.length - 1;

    // ── BOM: змінюємо URL без перезавантаження сторінки ────
    // replaceState, а не pushState — щоб не засмічувати історію 23 записами
    const id = slides[current].id;
    if (id) history.replaceState(null, '', `#${id}`);
  }

  // ── IntersectionObserver: джерело правди про поточний слайд ──
  // Працює однаково для клавіатури, кнопок і свайпу пальцем.
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
          current = slides.indexOf(entry.target as HTMLElement);
          render();
        }
      }
    },
    { root: deck, threshold: [0.6] },
  );
  slides.forEach((slide) => observer.observe(slide));

  // ── Клавіатура ───────────────────────────────────────────
  // Для літер використовуємо e.code, а не e.key: код клавіші не залежить
  // від розкладки, тому гарячі клавіші працюють і на ЙЦУКЕН.
  document.addEventListener('keydown', (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;

    switch (event.key) {
      case 'ArrowRight':
      case 'PageDown':
      case ' ':
        event.preventDefault();
        goTo(current + 1, { focus: true });
        return;
      case 'ArrowLeft':
      case 'PageUp':
        event.preventDefault();
        goTo(current - 1, { focus: true });
        return;
      case 'Home':
        event.preventDefault();
        goTo(0, { focus: true });
        return;
      case 'End':
        event.preventDefault();
        goTo(slides.length - 1, { focus: true });
        return;
    }

    switch (event.code) {
      case 'KeyN':
        document.body.classList.toggle('show-notes');
        return;
      case 'KeyF':
        if (document.fullscreenElement) void document.exitFullscreen();
        else void document.documentElement.requestFullscreen();
        return;
      case 'KeyT': {
        const root = document.documentElement;
        const isLight = root.classList.toggle('theme-light');
        localStorage.setItem('deck-theme', isLight ? 'light' : 'dark');
        return;
      }
    }
  });

  // ── Кнопки ───────────────────────────────────────────────
  btnPrev?.addEventListener('click', () => goTo(current - 1, { focus: true }));
  btnNext?.addEventListener('click', () => goTo(current + 1, { focus: true }));

  // ── Відновлення позиції з URL (BOM: window.location) ─────
  const fromHash = slides.findIndex((slide) => `#${slide.id}` === window.location.hash);
  if (fromHash > 0) goTo(fromHash, { instant: true });

  render();
}
```

**Розбір для студентів — які саме API тут задіяно:**

| Рядок коду | API | Розділ лекції |
|-----------|-----|----------------|
| `document.querySelectorAll('.slide')` | DOM | 4.1 |
| `element.scrollIntoView()` | DOM | 4.1 |
| `element.focus()` | DOM + A11y OM | 4.1 / 4.2 |
| `new IntersectionObserver(...)` | DOM Observers | 4.1 |
| `history.replaceState()` | BOM (`window.history`) | 4.1 |
| `window.location.hash` | BOM (`window.location`) | 4.1 |
| `localStorage.setItem()` | Web Storage API | 4.1 |
| `document.documentElement.requestFullscreen()` | BOM | 4.1 |
| `progress.style.width = ...` | CSSOM (inline-стилі) | 4.2 |
| `track.setAttribute('aria-valuenow', ...)` | A11y OM | 4.2 |

Ця таблиця — готовий фрагмент для пояснення біля проєктора: відкрийте файл поруч
зі слайдом «DOM та BOM» і покажіть кожен рядок наживо.

---

## Крок 10. Доступність — обов'язковий прохід

Презентація про a11y, яка провалює перевірку a11y, — найгірша можлива демонстрація.
Пройдіться по цьому списку перед показом:

| Вимога | Як реалізовано | Де перевірити |
|--------|----------------|----------------|
| Мова документа | `<html lang="uk">` | Elements |
| Один `<h1>` на сторінку | лише на титульному слайді | Lighthouse |
| Ландмарки | `<main>`, `<nav>`, `<header>`, `<footer>`, `<aside>` | DevTools → Accessibility |
| Skip-link | «Перейти до слайдів» першим у `<body>` | натисніть Tab на завантаженій сторінці |
| Видимий фокус | `:focus-visible` у `global.css` | Tab по кнопках |
| Доступна назва слайда | `aria-label` + `aria-roledescription` | Accessibility tree |
| Оголошення зміни слайда | `aria-live="polite"` на лічильнику | NVDA / VoiceOver |
| Індикатор прогресу | `role="progressbar"` + `aria-valuenow` | Accessibility tree |
| Декоративні елементи приховані | `aria-hidden="true"` на маркерах і стрілках | Accessibility tree |
| ASCII-схеми озвучуються | `role="img"` + `aria-label` | Accessibility tree |
| Повага до `prefers-reduced-motion` | медіазапит у `global.css` | Rendering → Emulate CSS media |
| Контраст ≥ 4.5:1 | палітра OKLCH | Lighthouse |

Швидка перевірка:

```bash
npm run build
npm run preview
```

Далі в Chrome: `F12` → **Lighthouse** → категорія **Accessibility** → **Analyze**.
Ціль — **100**. Якщо менше, звіт покаже конкретний елемент.

---

## Крок 11. Друк у PDF, повний екран і теми

Ці три речі вже працюють — залишилося показати їх аудиторії.

| Дія | Як |
|-----|-----|
| Експорт у PDF | `Ctrl+P` → Destination: **Save as PDF** → Margins: **None** → **Background graphics: ✓** |
| Повний екран | клавіша `F` |
| Нотатки доповідача | клавіша `N` |
| Світла тема (для яскравої аудиторії) | клавіша `T`, вибір зберігається в `localStorage` |
| Поділитися конкретним слайдом | скопіюйте URL — у ньому вже є `#id` слайда |

> **Чому світла тема — це шість рядків CSS.** У `global.css` ми перевизначаємо не
> кольори елементів, а **значення токенів** під `html.theme-light`. Кожен utility-клас
> Tailwind посилається на `var(--color-…)`, тому вся колода інвертується автоматично.
> Це найкоротша можлива демонстрація того, навіщо потрібні дизайн-токени.

---
## Крок 12. Локальний запуск і завдання в DevTools

```bash
npm run dev
```

Відкрийте `http://localhost:4321/lecture-1-slides/`.

> ⚠️ Через параметр `base` в `astro.config.mjs` локальна адреса теж має суфікс
> `/lecture-1-slides/`. Якщо відкрити просто `http://localhost:4321/` — буде 404.
> Це, до речі, ідеальний момент показати статус-код 404 наживо.

### 12.1. Демонстрації прямо під час лекції

| Слайд | Що відкрити в DevTools | Що показати |
|-------|------------------------|-------------|
| Клієнт-сервер | **Network** → перезавантажити | Список усіх запитів: документ, CSS, JS, шрифти |
| Анатомія HTTP | **Network** → клік на документ → **Headers** | Request Line, Response Headers, статус `200` |
| Статус-коди | **Network** → перезавантажити двічі | Другий раз частина ресурсів прийде як `304` |
| Статус-коди | адресний рядок → `/lecture-1-slides/nonexistent` | Живий `404 Not Found` |
| Critical Rendering Path | **Performance** → Record → Reload | Смуги Parse HTML, Recalculate Style, Layout, Paint |
| Анатомія HTML5 | **Elements** → корінь дерева | `<!DOCTYPE>`, `<html lang="uk">`, `<head>`, `<body>` |
| Семантика | **Elements** → розгорнути `<main>` | `<section>`, `<header>`, `<ul>`, `<footer>` замість `<div>` |
| DOM | **Console** → `document.querySelectorAll('.slide').length` | Поверне кількість слайдів |
| DOM | **Console** → `document.querySelector('h1').textContent = 'Тест'` | Заголовок змінюється миттєво |
| BOM | **Console** → `window.location.hash`, `navigator.userAgent`, `screen.width` | Значення з реального середовища |
| CSSOM | **Elements** → **Computed** → фільтр `--color` | Список усіх дизайн-токенів із `@theme` |
| CSSOM | **Elements** → зняти галочку з `display` у `.slide` | Елемент зникає з Render Tree |
| A11y OM | **Elements** → вкладка **Accessibility** | Дерево з Role / Name / State для кнопок |

> **Найсильніша демонстрація заняття:** відкрийте вкладку Accessibility на кнопці «Далі»
> і покажіть `Role: button`, `Name: "Далі"`. Потім у Console виконайте
> `document.querySelector('#btn-next').removeAttribute('type')` і поясніть, що саме
> семантика тега, а не CSS, формує це дерево.

### 12.2. Перевірка продакшн-збірки

```bash
npm run build      # генерує статику в ./dist
npm run preview    # локальний сервер на вмісті ./dist
```

`npm run build` має завершитися без помилок. Якщо TypeScript лається — виправляйте
одразу: на GitHub Actions ця сама помилка зупинить деплой.

---

## Крок 13. Git-репозиторій

```bash
git add .
git commit -m "Лекція 1: презентація на Astro + Tailwind"
```

Створіть порожній репозиторій на GitHub з назвою **`lecture-1-slides`** — вона має
збігатися зі значенням `base` в `astro.config.mjs`.

```bash
git remote add origin https://github.com/YOUR-USERNAME/lecture-1-slides.git
git branch -M main
git push -u origin main
```

Перевірте, що `.gitignore` (Astro створює його сам) містить:

```gitignore
dist/
node_modules/
.astro/
```

---

## Крок 14. Деплой

### Варіант А — GitHub Pages (рекомендовано для навчання)

Безкоштовно, публічно, деплой автоматично на кожен `git push`.

**14.1. Створіть `.github/workflows/deploy.yml`:**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v7
      - name: Install, build and upload site
        uses: withastro/action@v6

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v5
```

`withastro/action` сама визначить пакетний менеджер за lock-файлом і виконає
`npm ci && npm run build`. Додаткові параметри не потрібні.

**14.2. Увімкніть Pages у налаштуваннях репозиторію:**

`Settings` → `Pages` → **Source: GitHub Actions**

> Це найчастіша причина «все зібралося, але сайту немає». Якщо Source лишиться
> `Deploy from a branch` — workflow відпрацює, а сторінка не з'явиться.

**14.3. Задеплойте:**

```bash
git add .github/workflows/deploy.yml
git commit -m "CI: автодеплой на GitHub Pages"
git push
```

Вкладка **Actions** покаже прогрес. За 1–2 хвилини сайт буде за адресою:

```
https://YOUR-USERNAME.github.io/lecture-1-slides/
```

### Варіант Б — Vercel (найшвидший)

1. У `astro.config.mjs` **закоментуйте** `site` і `base` — Vercel віддає сайт із кореня:

   ```js
   export default defineConfig({
     // site: 'https://YOUR-USERNAME.github.io',
     // base: '/lecture-1-slides',
     vite: { plugins: [tailwindcss()] },
   });
   ```

2. `vercel.com` → **Add New → Project** → імпортуйте репозиторій.
3. Vercel сам розпізнає Astro. Натисніть **Deploy**.

Результат: `https://lecture-1-slides.vercel.app` + прев'ю-URL на кожен pull request.

### Варіант В — Netlify

Ті самі дії з `site` і `base`, далі:

```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

Або через вебінтерфейс: **Add new site → Import an existing project**,
build command `npm run build`, publish directory `dist`.

### Порівняння

| | GitHub Pages | Vercel | Netlify |
|---|---|---|---|
| Ціна | безкоштовно | безкоштовний тариф | безкоштовний тариф |
| Потрібен `base` | **так** | ні | ні |
| Прев'ю для PR | ні | так | так |
| Власний домен | так | так | так |
| Налаштування | workflow-файл | 2 кліки | 2 кліки |

**Порада для заняття:** зробіть GitHub Pages, бо workflow-файл видно в репозиторії —
студенти побачать увесь CI/CD-пайплайн, а не «магічну кнопку».

---

## Крок 15. Траблшутинг

| Симптом | Причина | Розв'язання |
|---------|---------|-------------|
| `EBADENGINE ... required: node >=22.12.0` | стара версія Node | `winget install OpenJS.NodeJS.LTS`, перезапустити термінал |
| Стилі Tailwind не застосовуються | `global.css` не імпортовано | переконайтеся, що `import '../styles/global.css'` є в `BaseLayout.astro` |
| Частина класів не працює | класи зібрано динамічно | Tailwind сканує код як текст: `bg-ink-950` має бути цілісним літералом, а не `` `bg-${tone}` `` |
| На GitHub Pages сторінка без стилів, у консолі 404 на `/_astro/…` | не збігається `base` | `base` в `astro.config.mjs` має точно дорівнювати назві репозиторію з `/` на початку |
| Actions зелений, а сайт 404 | не змінено джерело Pages | `Settings → Pages → Source: GitHub Actions` |
| `http://localhost:4321/` дає 404 | заданий `base` | відкривайте `http://localhost:4321/lecture-1-slides/` |
| Слайди «застрягають» між позиціями | конфлікт smooth-scroll і snap | не викликайте `scrollIntoView` частіше ніж раз на кадр; перевірте, чи `.deck` має `snap-x snap-mandatory` |
| Скрипт навігації не виконується | `is:inline` разом з `import` | у `<script>` з `import` **не можна** ставити `is:inline` — Astro має його зібрати |
| На iPhone нижня частина слайда під панеллю браузера | `100vh` замість динамічної висоти | використовуйте `h-dvh` (уже в коді) |
| PDF без фонів | вимкнено фонову графіку | у діалозі друку увімкніть **Background graphics** |
| Кирилиця в терміналі «кракозябрами» | кодова сторінка консолі | `chcp 65001` у PowerShell перед запуском |

---

## Крок 16. Розширення для студентів

Від простого до складного — кожен пункт дає привід повернутися до матеріалу лекції.

| Рівень | Завдання | Яку тему закріплює |
|--------|----------|--------------------|
| ★ | Додати власний слайд у `slides.ts` | структура даних, TypeScript-типи |
| ★ | Замінити палітру в `@theme` на свою | CSSOM, дизайн-токени |
| ★★ | Додати мініатюри слайдів (клікабельна карта колоди) | DOM: створення вузлів, делегування подій |
| ★★ | Оголошувати номер слайда через `aria-live` окремим регіоном | A11y OM |
| ★★ | Показати живі дані `navigator` на слайді про BOM | BOM, гідратація в Astro |
| ★★★ | Вбудувати демо fetch до `https://httpbin.org/status/404` і вивести статус-код | HTTP, асинхронність |
| ★★★ | Додати React-острівець із квізом за контрольними питаннями | Astro Islands, `client:visible`, shadcn/ui |
| ★★★ | Режим доповідача в окремому вікні через `BroadcastChannel` | BOM, міжвіконна комунікація |

---

## Додаток A. Шпаргалка команд

```bash
# Розробка
npm run dev              # http://localhost:4321/lecture-1-slides/
npm run build            # збірка в ./dist
npm run preview          # перегляд продакшн-збірки
npx astro check          # перевірка типів у .astro-файлах

# Деплой
git add . && git commit -m "..." && git push    # GitHub Pages: автоматично
netlify deploy --prod --dir=dist                # Netlify вручну
```

## Додаток B. Гарячі клавіші презентації

| Клавіша | Дія |
|---------|-----|
| `→` `Space` `PageDown` | наступний слайд |
| `←` `PageUp` | попередній слайд |
| `Home` / `End` | перший / останній слайд |
| `N` | нотатки доповідача |
| `F` | повний екран |
| `T` | світла / темна тема |
| `Tab` | обхід інтерактивних елементів |
| `Ctrl+P` | експорт у PDF |

## Додаток C. Контрольний список файлів

Перед деплоєм перевірте, що створено все:

- [ ] `astro.config.mjs` — плагін Tailwind, `site`, `base`
- [ ] `src/styles/global.css` — `@import "tailwindcss"`, `@theme`, друк, `.deck-note`, `.theme-light`
- [ ] `src/data/slides.ts` — 23 слайди
- [ ] `src/components/Slide.astro`
- [ ] `src/components/DeckChrome.astro`
- [ ] `src/layouts/BaseLayout.astro`
- [ ] `src/pages/index.astro`
- [ ] `src/scripts/deck.ts`
- [ ] `.github/workflows/deploy.yml`
- [ ] `public/favicon.svg`
- [ ] `npm run build` завершується без помилок
- [ ] Lighthouse → Accessibility = 100

## Додаток D. Офіційні джерела

Усі посилання з презентації, зібрані в одному місці:

| Тема | Джерело |
|------|---------|
| UI / UX | [Nielsen Norman Group — The Definition of User Experience](https://www.nngroup.com/articles/definition-user-experience/) |
| Як працює веб | [MDN — How the Web works](https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/How_the_Web_works) |
| HTTP | [MDN — An overview of HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview) · [RFC 9110 — HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html) |
| Рендеринг | [MDN — Populating the page: how browsers work](https://developer.mozilla.org/en-US/docs/Web/Performance/How_browsers_work) |
| HTML | [WHATWG HTML Living Standard](https://html.spec.whatwg.org/multipage/) · [MDN — HTML basics](https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/HTML_basics) |
| Семантика | [MDN — Semantics](https://developer.mozilla.org/en-US/docs/Glossary/Semantics) |
| DOM | [WHATWG DOM Living Standard](https://dom.spec.whatwg.org/) · [MDN — Introduction to the DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction) |
| Доступність | [MDN — Accessibility tree](https://developer.mozilla.org/en-US/docs/Glossary/Accessibility_tree) · [WCAG 2.2](https://www.w3.org/TR/WCAG22/) |
| Astro | [docs.astro.build](https://docs.astro.build/) |
| Tailwind v4 | [tailwindcss.com/docs](https://tailwindcss.com/docs) |

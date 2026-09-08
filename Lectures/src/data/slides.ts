/** Тип слайда визначає, який макет застосує компонент Slide.astro */
export type SlideKind = 'title' | 'section' | 'content' | 'code' | 'diagram' | 'checklist';

export interface Slide {
  /** Використовується як id елемента та як #hash в URL */
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
    id: 'interface',
    kind: 'content',
    title: 'Інтерфейс',
    lead: 'Інтерфейс — це [межа, сукупність засобів і правил](https://uk.wikipedia.org/wiki/Інтерфейс), за допомогою яких дві чи більше систем, пристроїв або людина взаємодіють між собою.',
    subtitle: 'Основні види інтерфейсів',
    bullets: [
      '**Користувацький (UI):** Засіб зв’язку між людиною та програмою чи пристроєм. Він буває [графічним](https://developer.mozilla.org/en-US/docs/Glossary/GUI) (вікна, кнопки, іконки) або текстовим (введення команд).',
      '**Апаратний:** Сполучення між комп’ютером і пристроями (наприклад, [роз’єми USB](https://uk.wikipedia.org/wiki/USB) або бездротовий зв’язок [Bluetooth](https://uk.wikipedia.org/wiki/Bluetooth)).',
      '**Програмний (API):** [Набір правил](https://developer.mozilla.org/en-US/docs/Glossary/API), за якими різні комп’ютерні програми спілкуються та обмінюються даними.',
    ],
    note: 'Наведіть курсор на підкреслені терміни — це справжні <a> з href на Вікіпедію та MDN. Відкрийте одне посилання й покажіть у DevTools → Network запит до зовнішнього домену. Далі — слайд «UI vs UX», де поняття інтерфейсу розкривається глибше.',
    source: {
      label: 'Вікіпедія — Інтерфейс · MDN — API',
      href: 'https://developer.mozilla.org/en-US/docs/Glossary/API',
    },
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

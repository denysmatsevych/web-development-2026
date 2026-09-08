import type { Slide } from "./schema";

export const deckTitle = "Семантичний HTML5, SEO та a11y";

export const slides: Slide[] = [
  {
    id: "intro",
    kind: "title",
    title: deckTitle,
    subtitle: "Проєктування інтерфейсів для користувачів і пошукових роботів",
    note: "Ця лекція — місток від «як влаштована сторінка» (Лекція 1) до «як зробити її однаково зрозумілою людині, пошуковому роботу та скрінрідеру». Попросіть студентів знову відкрити DevTools — інспектуємо саму презентацію.",
  },

  // ── РОЗДІЛ 1 ────────────────────────────────────────────────
  {
    id: "actors",
    kind: "content",
    title: "Хто «читає» ваш HTML",
    lead: "Сучасний код одночасно споживають три категорії акторів, і всі три мають отримати однакову якість взаємодії.",
    bullets: [
      "**Люди** — через візуальний рендеринг у браузері: бачать шрифти, кольори, зображення.",
      "**Пошукові краулери та AI-боти** — через структурний парсинг: будують індекс за деревом тегів, а не за пікселями.",
      "**Користувачі асистивних технологій** — скрінрідери, брайлівські дисплеї, голосове керування: сприймають структуру на слух і на дотик.",
      "Спільний фундамент для всіх трьох — семантичний HTML, технічне SEO та стандарти вебдоступності (a11y).",
    ],
    note: "Ключова теза лекції: це не три окремі задачі, а одна. Правильний семантичний тег одночасно покращує SEO, доступність і читабельність коду.",
  },
  {
    id: "agenda",
    kind: "content",
    title: "План лекції",
    bullets: [
      "Модуль 1 — семантичний HTML5: анатомія <head>, метадані та теги Landmarks.",
      "Модуль 2 — пошукова оптимізація: архітектура краулерів, On-Page SEO та Schema.org.",
      "Модуль 3 — вебдоступність: принципи WCAG 2.2, Accessibility Tree та дебагінг у Chrome DevTools.",
      "Підсумки та запитання для самоперевірки.",
    ],
  },

  // ── МОДУЛЬ 1 ────────────────────────────────────────────────
  {
    id: "section-1",
    kind: "section",
    title: "Модуль 1",
    subtitle: "Семантичний HTML5 та анатомія документа",
  },
  {
    id: "head-meta",
    kind: "code",
    title: "Анатомія <head>: керування метаконтекстом",
    subtitle:
      "<head> не видно на сторінці — але саме він інструктує браузери, соцмережі та ботів",
    bullets: [
      "viewport — розміри та масштаб області перегляду; без нього мобільний браузер рендерить сторінку в ~980px і масштабує вниз.",
      "description — короткий опис сторінки; пошукові системи часто беруть його як текст сніпета у видачі.",
      "Open Graph — контроль прев’ю при поширенні посилання в месенджерах і соцмережах.",
      "canonical — вказує «оригінальний» URL сторінки й захищає від проблем із дубльованим контентом.",
    ],
    code: {
      lang: "html",
      content: [
        "<head>",
        '  <meta charset="UTF-8">',
        '  <meta name="viewport" content="width=device-width, initial-scale=1">',
        "",
        "  <title>Сучасна веброзробка — курс НаУОА</title>",
        '  <meta name="description" content="Практичний курс із HTML5, CSS3 та a11y.">',
        '  <link rel="canonical" href="https://example.com/course">',
        "",
        '  <link rel="icon" href="/favicon.svg" type="image/svg+xml">',
        '  <link rel="stylesheet" href="/styles/main.css">',
        "",
        "  <!-- Open Graph — картка прев’ю в соцмережах і месенджерах -->",
        '  <meta property="og:title" content="Сучасна веброзробка — курс НаУОА">',
        '  <meta property="og:description" content="Практичний курс із HTML5, CSS3 та a11y.">',
        '  <meta property="og:image" content="https://example.com/assets/og-cover.jpg">',
        '  <meta property="og:type" content="website">',
        "</head>",
      ].join("\n"),
    },
    note: "Відкрийте DevTools → Elements і покажіть <head> цієї сторінки. Потім устав те посилання на презентацію в месенджер — підтягнеться og:image.",
    source: {
      label: "MDN — What’s in the head? Web page metadata · ogp.me — The Open Graph Protocol",
      href: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Webpage_metadata",
    },
  },
  {
    id: "div-soup",
    kind: "code",
    title: "Семантика проти «div-soup»",
    subtitle: "Тег обирають за змістом, а не за зовнішнім виглядом",
    bullets: [
      'Для бота й скрінрідера <div class="header"> — просто контейнер без ролі та зв’язків.',
      "<div> з onclick недоступний із клавіатури; <a> та <button> отримують фокус і роль безкоштовно.",
      "Семантичні теги дають нативну поведінку браузера й зменшують обсяг потрібного JS.",
    ],
    code: {
      lang: "html",
      content: [
        "<!-- Антипатерн: div-soup, жодної семантики -->",
        '<div class="header">',
        '  <div class="nav-item" onclick="navigate()">Головна</div>',
        "</div>",
        '<div class="content">...</div>',
        "",
        "<!-- Семантичний макет: роль зрозуміла браузеру, боту й скрінрідеру -->",
        "<header>",
        '  <nav aria-label="Основне меню">',
        "    <ul>",
        '      <li><a href="/">Головна</a></li>',
        "    </ul>",
        "  </nav>",
        "</header>",
        "<main>...</main>",
      ].join("\n"),
    },
    note: "Покажіть у DevTools → Accessibility обидва варіанти поруч: у div-soup дерево доступності майже порожнє, у семантичному — banner / navigation / main.",
    source: {
      label: "MDN — Semantics · web.dev — Learn HTML",
      href: "https://developer.mozilla.org/en-US/docs/Glossary/Semantics",
    },
  },
  {
    id: "landmarks",
    kind: "diagram",
    title: "Теги Landmarks та вбудовані ARIA-ролі",
    subtitle:
      "Орієнтири, за якими асистивні технології та боти будують карту сторінки",
    diagram: [
      "Тег          ARIA-роль        Призначення",
      "──────────   ─────────────    ───────────────────────────────────────────────",
      "<header>     banner           Вступний блок: логотип, заголовок, пошук",
      "<nav>        navigation       Основні навігаційні посилання",
      "<main>       main             Головний унікальний контент — один на сторінку",
      "<article>    article          Самодостатній блок: допис, новина, картка товару",
      "<section>    region           Тематична група; потрібен заголовок <h2>–<h6>",
      "<aside>      complementary    Допоміжний контент: сайдбар, реклама",
      "<footer>     contentinfo      Підвал: копірайт, контакти, юридична інформація",
    ].join("\n"),
    note: "<main> — рівно один на сторінку. <section> без заголовка <h2>–<h6> не стає орієнтиром region. Скрінрідер дозволяє стрибати між landmark-ами однією клавішею.",
    source: {
      label: "MDN — ARIA landmark roles · WHATWG — Sections",
      href: "https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/landmark_role",
    },
  },
  {
    id: "article-section",
    kind: "content",
    title: "<article> чи <section>?",
    lead: "Обидва теги групують контент, але критерій вибору різний.",
    bullets: [
      "<article> — блок має сенс **сам по собі**, у відриві від сторінки: його можна процитувати чи показати в стрічці (допис, новина, коментар, картка товару).",
      "<section> — **тематична частина** більшого цілого; поза контекстом сторінки сенс втрачає. Обов’язково має власний заголовок <h2>–<h6>.",
      "Вкладення дозволене в обидва боки: <section> зі списком <article> (стрічка дописів) або <article> з кількома <section> усередині (вступ, деталі, коментарі).",
      "Якщо жодне не підходить і потрібен лише «гак» для стилів — це звичайний <div>.",
    ],
    note: "Приклад на дошці: сторінка новини = <article> (сама новина), а всередині <section> «Схожі матеріали». Стрічка новин = <section> зі списком <article>.",
  },

  // ── МОДУЛЬ 2 ────────────────────────────────────────────────
  {
    id: "section-2",
    kind: "section",
    title: "Модуль 2",
    subtitle: "Пошукова оптимізація (SEO) та структуровані дані",
  },
  {
    id: "crawler-pipeline",
    kind: "diagram",
    title: "Як працює пошуковий робот",
    subtitle: "Crawling → Rendering & Indexing → Ranking",
    diagram: [
      "1. Crawling            виявлення URL: посилання <a href> та sitemap.xml",
      "       │",
      "       ▼",
      "2. Rendering &         парсинг HTML ▸ виконання JavaScript ▸ побудова DOM",
      "   Indexing            розбір контенту, збереження в індекс",
      "       │",
      "       ▼",
      "3. Ranking             релевантність, якість, Core Web Vitals, структура",
      "                       → формування видачі під конкретний запит",
    ].join("\n"),
    note: "Наголосіть: рендеринг (виконання JS) — окремий, відкладений етап. Тому контент, що з’являється лише після fetch на клієнті, індексується з затримкою або не індексується зовсім.",
    source: {
      label: "Google Search Central — How Search works",
      href: "https://developers.google.com/search/docs/fundamentals/how-search-works",
    },
  },
  {
    id: "two-wave-indexing",
    kind: "content",
    title: "Двопрохідна індексація та SPA",
    lead: "Googlebot індексує сторінку у дві хвилі, бо рендеринг JavaScript дорогий і його ставлять у чергу.",
    bullets: [
      "Прохід 1 — одразу парситься сирий HTML, що прийшов від сервера.",
      "Прохід 2 — коли звільняється черга рендерингу, виконується JS та індексується вже готовий DOM (можуть минути години або дні).",
      'Для SPA із клієнтським рендерингом це означає: якщо сервер віддає порожній <div id="root">, перший прохід не бачить контенту.',
      "Рішення — SSR, SSG або пререндер: віддавати значущий HTML одразу, а не збирати його лише в браузері.",
    ],
    note: "Це відповідь на питання самоперевірки про SPA. Пов’яжіть із Лекцією 1: Critical Rendering Path та різниця між статичними й динамічними сторінками.",
    source: {
      label: "Google Search Central — JavaScript SEO basics",
      href: "https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics",
    },
  },
  {
    id: "on-page-seo",
    kind: "content",
    title: "Базові принципи On-Page SEO",
    bullets: [
      "Заголовкова ієрархія: один <h1> на сторінку, далі <h2> → <h3> без пропусків рівнів заради стилів.",
      "Змістовний alt для зображень — і пошук по картинках, і доступність.",
      'Атрибут <html lang="uk"> — краулер застосовує правильні правила мови та морфології.',
      "Зрозумілі URL (slug), логічна внутрішня перелінковка, один канонічний URL на документ.",
    ],
    note: "Покажіть на цій презентації: DevTools → Elements → перевірте <html lang>, <h1> та порядок заголовків. Прогоніть Lighthouse → SEO.",
    source: {
      label: "web.dev — Learn SEO",
      href: "https://web.dev/learn/seo",
    },
  },
  {
    id: "schema-jsonld",
    kind: "code",
    title: "Schema.org та JSON-LD",
    subtitle:
      "Структуровані дані описують сутність сторінки словником, зрозумілим пошуковим системам",
    bullets: [
      "Schema.org — спільний словник типів: Course, Product, Article, FAQPage, BreadcrumbList.",
      'JSON-LD — рекомендований формат: окремий <script type="application/ld+json">, не змішується з розміткою.',
      "Результат — право на Rich Snippets: розширений вигляд сторінки у видачі.",
    ],
    code: {
      lang: "json",
      content: [
        '<script type="application/ld+json">',
        "{",
        '  "@context": "https://schema.org",',
        '  "@type": "Course",',
        '  "name": "Сучасна веброзробка: HTML, CSS, JS",',
        '  "description": "Базовий курс із фронтенд-розробки та вебдоступності.",',
        '  "provider": {',
        '    "@type": "CollegeOrUniversity",',
        '    "name": "Національний університет «Острозька академія»"',
        "  }",
        "}",
        "</script>",
      ].join("\n"),
    },
    note: "Перевірити розмітку: Google Rich Results Test та Schema Markup Validator. Покажіть, як валідатор розбирає цей JSON-LD на поля.",
    source: {
      label: "Schema.org · Google — Intro to structured data",
      href: "https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data",
    },
  },
  {
    id: "rich-snippets",
    kind: "content",
    title: "Rich Snippets: навіщо структуровані дані",
    lead: "Маючи структуровані дані, пошукова система може показати сторінку розширено, а не просто «заголовок + опис».",
    bullets: [
      "Зірки рейтингу та кількість відгуків — для товарів, рецептів, курсів.",
      "Ціна та наявність — картка товару прямо у видачі.",
      "Блок FAQ, хлібні крихти, дата й автор статті, картки подій.",
      "Прямий ефект — вища видимість і CTR (click-through rate) без зміни позиції.",
    ],
    note: "Застереження: розмітка — це право на сніпет, а не гарантія. Пошукова система вирішує сама і карає за розмітку контенту, якого немає на сторінці.",
  },

  // ── МОДУЛЬ 3 ────────────────────────────────────────────────
  {
    id: "section-3",
    kind: "section",
    title: "Модуль 3",
    subtitle: "Вебдоступність (a11y) та інструменти розробника",
  },
  {
    id: "wcag-pour",
    kind: "content",
    title: "WCAG 2.2 та принципи POUR",
    bullets: [
      "P — Perceivable (сприйнятність): текстові альтернативи, контраст тексту до фону не менше 4.5:1.",
      "O — Operable (керованість): усе доступне з клавіатури (Tab, Enter, Space, стрілки), видимий :focus-visible, без пасток фокуса.",
      "U — Understandable (зрозумілість): передбачувана поведінка, підказки та зрозумілі описи помилок у формах.",
      "R — Robust (надійність): валідний HTML плюс за потреби WAI-ARIA; сумісність із NVDA, JAWS, VoiceOver.",
    ],
    note: "Питання самоперевірки просить розкрити саме Operable. Демо: пройдіть цю презентацію лише клавіатурою — Tab по кнопках, стрілки по слайдах, видно фокус-рамку.",
    source: {
      label: "W3C — WCAG 2.2 · W3C — WAI-ARIA Overview",
      href: "https://www.w3.org/TR/WCAG22/",
    },
  },
  {
    id: "a11y-tree",
    kind: "content",
    title: "Accessibility Tree (Дерево доступності)",
    lead: "Разом із DOM браузер будує паралельне дерево об’єктів — [Accessibility Tree](https://developer.mozilla.org/en-US/docs/Glossary/Accessibility_tree). Скрінрідери працюють саме з ним, а не з DOM напряму.",
    subtitle: "Кожен вузол має чотири ключові властивості:",
    bullets: [
      "**Role** — тип елемента: button, checkbox, heading, navigation.",
      "**Name** — доступна назва (Accessible Name): текст, aria-label, <label>, alt.",
      "**State** — поточний стан: expanded, checked, focused, disabled.",
      "**Value** — поточне значення: текст поля, aria-valuenow повзунка.",
    ],
    note: "Приклад: <button>Зберегти</button> → Role: button, Name: «Зберегти», State: focusable. Покажіть ці ж поля в DevTools → Elements → Accessibility для кнопок навігації презентації. Вузли з display:none у дерево не потрапляють.",
    source: {
      label: "MDN — Accessibility tree",
      href: "https://developer.mozilla.org/en-US/docs/Glossary/Accessibility_tree",
    },
  },
  {
    id: "devtools-a11y",
    kind: "content",
    title: "Дебагінг доступності в Chrome DevTools",
    bullets: [
      "Elements → панель Accessibility: дерево доступності та джерела, з яких зібрано Accessible Name.",
      "Інспектор кольору (Color Picker): показує Contrast Ratio до фону й позначає поріг 4.5:1 для WCAG AA.",
      "Панель Rendering → Emulate vision deficiencies: симуляція протанопії, дейтеранопії, розмитого зору.",
      "Lighthouse → Accessibility: автоматичний експрес-аудит грубих помилок (не заміняє ручну перевірку).",
    ],
    note: "Живе демо по черзі: підсвітити Accessible Name кнопки «Далі»; відкрити Color Picker на сірому тексті підказок; увімкнути дейтеранопію; прогнати Lighthouse і розібрати звіт.",
    source: {
      label: "Chrome for Developers — Accessibility reference",
      href: "https://developer.chrome.com/docs/devtools/accessibility/reference",
    },
  },

  // ── ПІДСУМОК ────────────────────────────────────────────────
  {
    id: "summary",
    kind: "content",
    title: "Підсумок",
    bullets: [
      "Семантичний HTML5 — спільна ланка між UX, SEO та рівним доступом для людей з інвалідністю.",
      "Один правильний тег працює одразу на три аудиторії: людину, краулер і скрінрідер.",
      "Семантика зменшує обсяг JS, пришвидшує рендеринг і дає коректний Accessibility Tree «безкоштовно».",
      "Метадані (<head>, Open Graph, canonical) та Schema.org керують тим, як сторінку бачать поза браузером.",
    ],
    note: "Поверніться до слайда «Хто читає ваш HTML» і замкніть коло: усе, що ми розглянули, — це три погляди на один і той самий документ.",
  },
  {
    id: "checklist",
    kind: "checklist",
    title: "Запитання для самоперевірки",
    bullets: [
      "Чим відрізняються <article> та <section>? Наведіть приклад правильного вкладення.",
      "Як метатег viewport впливає на адаптивний рендеринг сторінки на мобільних пристроях?",
      "Поясніть двопрохідний процес індексації Googlebot для SPA.",
      "Що таке JSON-LD і яку роль він відіграє у формуванні Rich Snippets?",
      "Назвіть 4 принципи WCAG 2.2 (POUR) та розкрийте принцип Operable.",
      "Які 4 властивості має вузол у Accessibility Tree?",
      "Як у Chrome DevTools перевірити контраст тексту та симулювати колірну сліпоту?",
    ],
    note: "Дайте 5 хвилин на письмові відповіді, потім розберіть разом питання 3 і 5 — на них найчастіше «пливуть».",
  },
  {
    id: "homework",
    kind: "content",
    title: "Домашнє завдання",
    bullets: [
      "Візьміть будь-яку свою сторінку на div-soup і перепишіть макет семантичними тегами та landmarks.",
      "Додайте у <head> коректні Open Graph-теги й один блок JSON-LD (тип на вибір: Course, Article або BreadcrumbList).",
      "Прогоніть сторінку через Lighthouse: Accessibility і SEO мають бути 100.",
      "Перевірте розмітку в Rich Results Test і пройдіть сторінку скрінрідером (NVDA або VoiceOver) лише з клавіатури.",
    ],
    note: "Приймається як репозиторій + скриншот звіту Lighthouse. Дедлайн і форму здачі оголосіть на цьому слайді.",
  },
];

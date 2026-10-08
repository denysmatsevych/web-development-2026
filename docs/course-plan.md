# Course plan — програма навчальної дисципліни

A copy of the structure table from the official course programme (a `.docx`
outside this repo). The `.docx` is authoritative: when the programme changes,
update both in the same sitting. Part 2 was revised on 2026-10-04 (see
**Part 2 revision** below).

## How the site maps to the plan

As of 2026-10-08. The site's lab id is the file name in `src/content/labs/`.

| Plan | Site | Note |
| --- | --- | --- |
| ЛР 1–3 | `lab-1` … `lab-3` | |
| ЛР 4 + slot 5 | `lab-4` (shown as ЛР-4-5) | the Web Quality Audit lab takes both slots |
| ЛР 5 topic + ЛР 6 | `lab-6` | responsive layout and container queries in one code-challenge lab |
| ЛР 7 | `lab-7` | Проміжний контроль №1 |
| ЛР 8 | `lab-8` | JavaScript basics; [lab-8/README.md](lab-8/README.md) |
| ЛР 9 | `lab-9` | DOM, events and forms; [lab-9/README.md](lab-9/README.md) |
| ЛР 10 | `lab-10` | JavaScript debugging; [lab-10/README.md](lab-10/README.md) |
| ЛР 11–15 | not built | |

## Part 2 revision (2026-10-04)

- **ЛР 8 is new: JavaScript basics.** The old plan went from Лекція 5
  straight to DOM and events. The lab teaches what JavaScript does differently
  from languages the students already know (coercion, scope, closures,
  references, modules), not syntax.
- **Debugging moves from ЛР 9 to ЛР 10, after Лекція 6.** It uses Promises,
  microtasks and `Uncaught (in promise)`, so it needs the async lecture first.
  Лекція 6 now owns the Event Loop.
- **The old ЛР 10 and ЛР 11 are merged into ЛР 11** (Fetch, async/await and a
  REST API with an AI agent). They overlapped, and the merge frees the slot for
  ЛР 8 while keeping the lecture-then-two-labs rhythm.
- **ЛР 12 is TypeScript by hand, ЛР 13 is the AI-assisted part.** Both used to
  be "add types to existing JS". Now ЛР 13's quality analysis audits what the
  AI produced: `any`, type assertions, strict mode, runtime validation of API
  responses.
- **ЛР 14 drops debugging** (already covered by ЛР 10 and ЛР 11). AI-written
  tests are checked by putting deliberate bugs into the code.
- **Лекція 7 adds compiler setup** (`tsconfig`, strict mode), since ЛР 12–13
  need it before Лекція 8 covers tooling.
- Hours per row are unchanged, so the totals are the same.

## Структура дисципліни

### Частина 1. Створення адаптивної вебсторінки за специфікацією з використанням AI-агента та перевіркою HTML semantics, accessibility, CSS layout і responsive behavior

| № | Тема дисципліни | Вид заняття | Самостійна робота | Обов’язкове читання | Контрольні заходи |
| --- | --- | --- | --- | --- | --- |
| 1.1 | Вступ до вебтехнологій, HTTP, DOM та семантичний HTML5 | Лекція 1 (2 год.) | Опрацювання основ клієнт-серверної моделі, HTTP, DOM та семантичного HTML5 (4 год.) | Основна: 1. Допоміжна: 1, 5, 6, 7 | Захист презентації |
| 1.2 | Налаштування IDE, AI-агента та створення базової структури вебпроєкту; створення базової HTML5-сторінки та перевірка результату | Лабораторна робота №1 (2 год.) | Опрацювання можливостей IDE та AI-агента; створення семантичної HTML5-структури та аналіз згенерованого коду (4 год.) | Основна: 1. Допоміжна: 6, 10, 13, 23-27, 36-42 | Захист лабораторної роботи |
| 1.3 | Основи CSS: Box Model, каскад, специфічність та CSS Variables | Лекція 2 (2 год.) | Опрацювання Box Model, cascade, specificity, inheritance та CSS variables (4 год.) | Основна: 1, 4. Допоміжна: 2, 8, 11, 19 | Захист презентації |
| 1.4 | AI-assisted реалізація дизайну вебсторінки, аналіз Box Model, каскаду і специфічності, CSS Variables та повторне використання стилів | Лабораторна робота №2 (2 год.) | Експериментування з AI-генерацією CSS; аналіз і виправлення конфліктів стилів; пошук дублювання та потенційних проблем архітектури стилів (4 год.) | Основна: 1, 4. Допоміжна: 2, 8, 11, 23-27 | Захист лабораторної роботи |
| 1.5 | Семантика, SEO та Web Accessibility (a11y) | Лекція 3 (2 год.) | Опрацювання SEO, WCAG 2.2, POUR, Accessibility Tree та засобів аналізу доступності (4 год.) | Основна: 1, 3. Допоміжна: 5, 7, 4 | Захист презентації |
| 1.6 | AI-assisted semantic HTML та SEO: оптимізація структури, метаданих і контенту вебсторінки | Лабораторна робота №3 (2 год.) | Аналіз семантики документа, метаданих та структурованих даних за допомогою AI-агента (3 год.) | Основна: 1. Допоміжна: 1, 4, 5, 7 | Захист лабораторної роботи |
| 1.7 | AI-агент для Web Quality Audit: accessibility, технічне SEO та Core Web Vitals: пошук та виправлення проблем за допомогою DevTools і автоматизованих перевірок | Лабораторна робота №4 (2 год.) | Дослідження Accessibility Tree, keyboard navigation, ARIA та контрастності (4 год.) | Основна: 3. Допоміжна: 5, 7 | Захист лабораторної роботи |
| 1.8 | Сучасні CSS Layout та Responsive Design | Лекція 4 (2 год.) | Опрацювання Flexbox, Grid, Positioning, Media Queries, Container Queries, Subgrid та Fluid Design (4 год.) | Основна: 1, 4. Допоміжна: 3, 4, 6, 8 | Захист презентації |
| 1.9 | AI-assisted Responsive Layout: побудова інтерфейсу за допомогою Flexbox, Grid та Media Queries | Лабораторна робота №5 (2 год.) | Аналіз AI-generated layout-рішень; порівняння Flexbox і Grid та перевірка responsive-поведінки (4 год.) | Основна: 1, 4. Допоміжна: 4, 6, 8 | Захист лабораторної роботи |
| 1.10 | Container Queries, Fluid Typography та debugging layout у Browser DevTools | Лабораторна робота №6 (2 год.) | Дослідження сучасних механізмів адаптивності; аналіз і виправлення результатів роботи AI-агента (4 год.) | Основна: 1. Допоміжна: 3, 4, 6, 23-27 | Захист лабораторної роботи |
| 1.11 | Проміжний контроль №1. Виконання комплексного завдання з HTML, CSS, SEO, a11y та responsive design | Лабораторна робота №7 (2 год.) | Самостійне виконання комплексного завдання (2 год.) | Основна: 1, 3, 4. Допоміжна: 4-8, 23-27 | Проміжний контроль |

### Частина 2. Реалізація та типізація frontend-застосунку, інтеграція REST API, debugging та перевірка результату

| № | Тема дисципліни | Вид заняття | Самостійна робота | Обов’язкове читання | Контрольні заходи |
| --- | --- | --- | --- | --- | --- |
| 2.1 | JavaScript у браузері як мова виконання та взаємодії з вебсторінкою | Лекція 5 (2 год.) | Опрацювання типів даних і приведення типів, Scope, Hoisting, Closures, функцій, ES Modules, DOM API та Events (3 год.) | Основна: 1. Допоміжна: 1, 2, 7, 10, 13 | Захист презентації |
| 2.2 | Основи JavaScript: типи даних і приведення типів, Scope, Closures, функції, масиви, об’єкти та ES Modules | Лабораторна робота №8 (2 год.) | Експерименти в Console: власний прогноз результату, порівняння з поясненням AI-агента та перевірка в браузері; реалізація функцій обробки даних без використання DOM (3 год.) | Основна: 1. Допоміжна: 1, 2, 10, 13 | Захист лабораторної роботи |
| 2.3 | Створення інтерактивного DOM та обробка подій: Event Delegation, форми та доступність динамічного інтерфейсу | Лабораторна робота №9 (2 год.) | Аналіз JavaScript-коду, створеного AI; дослідження DOM API, Event Delegation та керування фокусом (3 год.) | Основна: 1, 3. Допоміжна: 1, 5, 7, 13 | Захист лабораторної роботи |
| 2.4 | Асинхронний JavaScript та взаємодія з вебсервісами | Лекція 6 (2 год.) | Опрацювання Event Loop, Promise, async/await, Fetch API, REST, JSON, CORS, WebSocket та кешування (3 год.) | Основна: 1. Допоміжна: 1, 4, 7, 13 | Захист презентації |
| 2.5 | AI-агент для JavaScript debugging: аналіз Console errors, Stack Trace, DOM та Event Loop | Лабораторна робота №10 (2 год.) | Самостійний аналіз помилок і порівняння власного debugging з результатами AI-агента (3 год.) | Основна: 1. Допоміжна: 1, 7, 13, 30-34, 43 | Захист лабораторної роботи |
| 2.6 | AI-агент для інтеграції REST API: Fetch API, Promise та async/await, аналіз API-документації, loading та error states, debugging через Network | Лабораторна робота №11 (2 год.) | Аналіз асинхронного коду, створеного AI; дослідження HTTP-запитів, status codes, headers та CORS; реалізація loading та error states (3 год.) | Основна: 1. Допоміжна: 4, 13, 30-34, 43 | Захист лабораторної роботи |
| 2.7 | TypeScript для сучасної веброзробки | Лекція 7 (2 год.) | Опрацювання types, interfaces, unions, narrowing, generics, utility types, типізації API та налаштування компілятора (tsconfig, strict mode) (3 год.) | Основна: 2, 5. Допоміжна: 15, 18, 27 | Захист презентації |
| 2.8 | TypeScript на практиці: типізація функцій, об’єктів та API-відповідей, union types, narrowing і type guards | Лабораторна робота №12 (2 год.) | Аналіз типів, пошук помилок компіляції та дослідження type inference (3 год.) | Основна: 2. Допоміжна: 15, 18, 27 | Захист лабораторної роботи |
| 2.9 | AI-assisted міграція JavaScript-коду на TypeScript та аналіз якості результату: any, type assertions, strict mode і runtime-валідація API-відповідей | Лабораторна робота №13 (2 год.) | Самостійне визначення меж автоматизації та перевірка згенерованої типізації (3 год.) | Основна: 2. Допоміжна: 15, 18, 27, 30-34 | Захист лабораторної роботи |
| 2.10 | Інструменти, тестування та AI-агенти у сучасній frontend-розробці | Лекція 8 (2 год.) | Опрацювання npm, Vite, ESLint, Prettier, Git, testing, CI/CD, AI coding assistants та AI-агентів (3 год.) | Основна: 1, 5. Допоміжна: 20, 21, 29-42, 44, 45 | Захист презентації |
| 2.11 | AI-assisted testing та agentic coding workflow: генерація та перевірка тестів, рефакторинг під захистом тестів і code review за допомогою AI-агента | Лабораторна робота №14 (2 год.) | Аналіз тестових сценаріїв і coverage; перевірка AI-згенерованих тестів навмисно внесеними помилками; аналіз повного AI coding workflow (3 год.) | Основна: 1, 5. Допоміжна: 30-34, 42, 44, 45 | Захист лабораторної роботи |
| 2.12 | Проміжний контроль №2. Виконання комплексного завдання з JavaScript, DOM, REST API та TypeScript | Лабораторна робота №15 (2 год.) | Самостійне виконання комплексного завдання з JavaScript/TypeScript та REST API (2 год.) | Основна: 1, 2. Допоміжна: 1, 13, 15 | Проміжний контроль |

## Рекомендована література

**The reading numbers in Part 1 are stale.** Most Допоміжна numbers above 8
point 6 items too early. It looks as if items 9–14 were added to the list
after the table was written. For example, "23-27" was meant for the Cursor
docs (now 29–33) but now lands on the WebStorm pages. Adding 6 doesn't fix
every case, because some ranges (`36-42`) would run past item 42. Part 2 uses
the numbering below.

### Основна

1. MDN Web Docs. Mozilla Developer Network Official Documentation (HTML, CSS, JS). URL: https://developer.mozilla.org/
2. TypeScript Documentation. URL: https://www.typescriptlang.org/docs/
3. W3C Web Content Accessibility Guidelines (WCAG 2.2). URL: https://www.w3.org/TR/WCAG22/
4. Tailwind CSS Documentation. URL: https://tailwindcss.com/docs
5. Vite Guide. Next Generation Frontend Tooling. URL: https://vitejs.dev/guide/

### Допоміжна література та інтернет-ресурси

1. Flanagan D. JavaScript: The Definitive Guide. 7th Edition. O'Reilly Media, 2020.
2. Simpson K. You Don't Know JS Yet. 2nd Edition, 2020.
3. Wathan A., Schoger S. Refactoring UI. Adam Wathan & Steve Schoger, 2018.
4. web.dev by Google — Web development guides & performance best practices. URL: https://web.dev/
5. W3C ARIA Authoring Practices Guide (APG). URL: https://www.w3.org/WAI/ARIA/apg/
6. CSS-Tricks — Complete Guide to Flexbox & Grid. URL: https://css-tricks.com/
7. WHATWG. HTML: The Living Standard — Edition for Web Developers. URL: https://html.spec.whatwg.org/dev/
8. W3C. Cascading Style Sheets home page. URL: https://www.w3.org/Style/CSS/Overview.en.html
9. W3C. CSS Snapshot 2026. URL: https://www.w3.org/TR/css-2026/
10. ECMA International / TC39. ECMAScript 2025 Language Specification. URL: https://tc39.es/ecma262/2025/multipage/
11. MDN Web Docs. Web developer guides. URL: https://developer.mozilla.org/en-US/docs/MDN/Guides
12. MDN Web Docs. Environment Setup. URL: https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Environment_setup
13. MDN Web Docs. JavaScript Guide. URL: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide
14. MDN Web Docs. CSS — Getting started. URL: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Getting_started
15. TypeScript. The TypeScript Handbook. URL: https://www.typescriptlang.org/docs/handbook/intro
16. Visual Studio Code. HTML in Visual Studio Code. URL: https://code.visualstudio.com/docs/languages/html
17. Visual Studio Code. CSS, SCSS and Less. URL: https://code.visualstudio.com/docs/languages/css
18. Visual Studio Code. TypeScript in Visual Studio Code. URL: https://code.visualstudio.com/docs/languages/typescript
19. Visual Studio Code. Extension Marketplace. URL: https://code.visualstudio.com/docs/configure/extensions/extension-marketplace
20. Visual Studio Marketplace. ESLint. URL: https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint
21. Visual Studio Marketplace. Prettier - Code formatter. URL: https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode
22. Microsoft / VS Code. Live Preview. URL: https://marketplace.visualstudio.com/items?itemName=ms-vscode.live-server
23. JetBrains. Configure WebStorm settings. URL: https://www.jetbrains.com/help/webstorm/configuring-project-and-ide-settings.html
24. JetBrains. HTML in WebStorm. URL: https://www.jetbrains.com/help/webstorm/editing-html-files.html
25. JetBrains. CSS in WebStorm. URL: https://www.jetbrains.com/help/webstorm/css.html
26. JetBrains. JavaScript in WebStorm. URL: https://www.jetbrains.com/help/webstorm/javascript-specific-guidelines.html
27. JetBrains. TypeScript in WebStorm. URL: https://www.jetbrains.com/help/webstorm/typescript-support.html
28. JetBrains. Plugins in WebStorm. URL: https://www.jetbrains.com/help/webstorm/managing-plugins.html
29. Cursor. Installation. URL: https://docs.cursor.com/get-started/installation
30. Cursor. Agent overview. URL: https://cursor.com/docs/agent/overview
31. Cursor. Rules. URL: https://prod.cursor.com/docs/rules
32. Cursor. Agent Skills. URL: https://prod.cursor.com/docs/skills
33. Cursor. Working with Context. URL: https://docs.cursor.com/en/guides/working-with-context
34. GitHub. Adding repository custom instructions for GitHub Copilot. URL: https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/add-custom-instructions/add-repository-instructions
35. GitHub. Creating a GitHub Pages site. URL: https://docs.github.com/en/pages/getting-started/start-your-journey/creating-a-github-pages-site
36. GitHub. Configuring a publishing source for GitHub Pages. URL: https://docs.github.com/en/pages/getting-started/for-a-user-or-organization/configuring-a-publishing-source-for-your-github-pages-site
37. GitHub. Creating a repository for your project on GitHub. URL: https://docs.github.com/en/get-started/start-your-journey/creating-a-repository-for-your-project-on-github
38. Vercel. Deploying Git Repositories with Vercel. URL: https://vercel.com/docs/git
39. Vercel. Deploying to Vercel. URL: https://vercel.com/docs/deployments/overview
40. Node.js. Download Node.js. URL: https://nodejs.org/en/download/
41. npm. Downloading and installing Node.js and npm. URL: https://docs.npmjs.com/downloading-and-installing-node-js-and-npm
42. Agent Skills Overview. URL: https://agentskills.io/home
43. Chrome for Developers. Chrome DevTools. URL: https://developer.chrome.com/docs/devtools
44. Vitest. Getting Started. URL: https://vitest.dev/guide/
45. Playwright. Installation. URL: https://playwright.dev/docs/intro

Items 43–45 were added on 2026-10-04 for Part 2.

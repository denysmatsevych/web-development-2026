# ShowFinder на TypeScript — starter-проєкт для ЛР №11-12

Пошук серіалів у [TVmaze](https://www.tvmaze.com) через його публічний
[API](https://www.tvmaze.com/api): користувач вводить назву, бачить список
знайдених серіалів і відкриває сторінку одного з них. Розмітка, стилі й показ
даних готові. Типи, запити, стани й поведінку застосунку пишете ви, а перевірки
типів і тести вже є.

Опис завдання та специфікація:
<https://denysmatsevych.github.io/web-development-2026/labs/lab-11/> і
<https://denysmatsevych.github.io/web-development-2026/labs/lab-11/task/>.

## Склад

```text
package.json         скрипти; залежність одна — typescript
tsconfig.json        налаштування компілятора (strict)
index.html           сторінка; завантажує скомпільований dist/main.js
styles.css           стилі
src/types.ts         T1 · типи відповідей API — ваші
src/api.ts           T2 · запити — ваші
src/state.ts         T3 · стани й тексти — ваші
src/app.ts           T4 · поведінка — пише AI-агент, перевіряєте й виправляєте ви
src/view.ts          показ даних — наданий
src/dom.ts           елементи сторінки — наданий
src/main.ts          точка входу — наданий
check/               самоперевірка: перевірки типів, тести й записані відповіді TVmaze
```

Змінюйте лише `src/types.ts`, `src/api.ts`, `src/state.ts` і `src/app.ts`.
Решта — як у starter-проєкті, а `check/` — це специфікація з ТЗ у вигляді коду.

## Запуск

Потрібен Node.js **22.18** або новіший (`node -v`): тести виконують файли
`.ts` без компіляції, а Node уміє стирати типи сам лише з цієї версії. Старіший
Node пише `Unknown file extension ".ts"`.

```bash
npm install          # один раз: встановлює TypeScript у node_modules/
npm run watch        # компілює src/*.ts у dist/ і стежить за змінами
```

Поки `npm run watch` працює, відкрийте `index.html` через **Live Preview** у
VS Code (або `npx serve .`) у Chrome чи Edge. Браузер виконує JavaScript із
`dist/`, а не `src/*.ts`. Компілятор кладе код у `dist/`, навіть коли в ньому є
помилки типів, тож сторінка працює й посеред роботи. Через `file://` модулі не
завантажаться.

## Самоперевірка

```bash
npm run check        # перевірка типів і тести, наприкінці — підсумок одним рядком
npm run typecheck    # лише типи: tsc -p check
npm test             # лише тести: node --test
node --test check/2-api.test.js   # тести одного завдання
```

На початку майже все падає: це нормально. Назва кожного тесту й коментар у
`check/types.check.ts` біля кожної перевірки типів починаються з номера правила
ТЗ (T2.4 — четверте правило завдання T2). Робота готова, коли `npm run check`
закінчується рядком «Типи: без помилок» і всі тести пройдено.

Тести не ходять у мережу: `fetch` на час тесту підмінено, а відповіді TVmaze
записано в `check/fixtures/`.

## Редактор

VS Code і WebStorm підсвічують помилки типів власною версією TypeScript, а
`npm run typecheck` використовує TypeScript 7 з `node_modules/`. Для цього
проєкту вони показують ті самі помилки. Якщо щось розходиться, зараховується
`npm run check`.

## Публікація

Публікувати застосунок не потрібно: викладач запускає `npm run check` у вашому
репозиторії. Теки `node_modules/` і `dist/` не комітяться (`.gitignore`).

## Дані

Дані серіалів — [TVmaze](https://www.tvmaze.com), ліцензія
[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Записані
відповіді в `check/fixtures/` скорочено до полів, які використовує застосунок;
кожен файл указує джерело, ліцензію, дату й зміни.

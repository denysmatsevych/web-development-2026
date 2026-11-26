# ЛР-12. Глобальний стан за допомогою Context API та вирішення проблеми Prop Drilling

Стартовий проєкт лабораторної роботи № 12 курсу «Розробка вебзастосунків на
React»: сторінка бариста «Черга замовлень» з ЛР-11. Інструкція:
https://denysmatsevych.github.io/web-development-2026/react/labs/lab-12/

Сторінка працює так само, як наприкінці ЛР-11: форма «Нове замовлення»
ліворуч, черга з чотирьох колонок праворуч, «Деталі замовлення», «Скасувати
дію» й «Повторити дію». Стан черги зберігається в `App` і доходить до карток,
«Деталей» і кнопок історії через пропси. У п'яти code challenges ви
приберете зайві пропси: спершу композицією через `children`, потім
контекстом, потім компонентом-провайдером із власними хуками. Потім id
замовлення, відкритого в «Деталях», перейде з `App` у компонент
`QueuePanel`, і в `App` не залишиться стану. Останнім з'явиться «Стоп-лист»
кав'ярні з окремим контекстом. Що має вийти, перевіряють готові тести в теці
`tests/`.

## Що вже є

- `src/App.jsx` — сторінка: стан черги з `useReducer(withUndo(queueReducer))`
  і id замовлення, відкритого в «Деталях»;
- `src/model/queueReducer.js`, `withUndo.js`, `draftReducer.js` — ред'юсери з
  ЛР-11 з описом стану й дій у коментарях і селектори `selectColumn` та
  `selectOrder`;
- `src/components/` — компоненти з ЛР-11: `OrderComposer` і `DraftItem`
  (форма), `OrderBoard`, `OrderColumn` і `OrderCard` (дошка),
  `OrderDetails`, `HistoryButtons`. А також `StopListPanel` — панель
  «Стоп-лист», яка показує стоп-лист з пропсів; на сторінці її поки немає;
- заготовки з описом API в коментарі: `src/model/queueContext.js`,
  `QueueProvider.jsx`, `StopListProvider.jsx` і
  `src/components/QueuePanel.jsx`. Поки що вони кидають помилку
  `Not implemented`;
- `src/model/stopListContext.js` — готові `StopListContext` і хук
  `useStopList`;
- `src/data/menu.js` — меню з цінами, `priceOf`, `defaultMilk`,
  `describeItem`, а також `stopListOptions` (групи панелі «Стоп-лист») і
  `hasStopped(item, stopped)`; `src/data/orders.js` — `loadOrders()`: шість
  замовлень, з якими сторінка відкривається;
- `MEASUREMENTS.md` — дві таблиці, які ви заповните під час роботи;
- тести Vitest і React Testing Library в `tests/`: `App.test.jsx` — тести
  сторінки з ЛР-11, решта — по одному файлу на challenge. `page.jsx`
  рендерить сторінку в `<StrictMode>`, як `src/main.jsx`. Файли в `tests/`
  не змінюйте;
- стилі всієї сторінки в `src/index.css`, зокрема й панелі «Стоп-лист».

## Команди

`npm install` виконуйте в корені репозиторію `react-labs`, решту — у теці
`lab-12/`:

- `npm run dev`: dev-сервер на http://localhost:5173
- `npm test`: тести в режимі спостереження, вони перезапускаються після
  кожного збереження файлу; `q` — вихід
- `npm test -- tests/OrderColumn`: лише тести цього файлу
- `npx vitest run`: усі тести один раз
- `npm run lint`: ESLint
- `npm run format:check`: перевірка форматування Prettier
- `npm run build`: production-збірка в `dist/`

---
number: 7
title: "Патерни проєктування React. Частина 1 (Custom Hooks, Render Props)"
summary: "Сторінка кави в зернах із дубльованим і зламаним кодом: п'ять code challenges з готовими тестами Vitest. Власний хук useLocalStorage замість двох копій коду з ЛР-4, розумний і простий компоненти таймера з умовним рендерингом чотирьох станів, хук useCountdown з ефектом і очищенням, компонент ShowMore з render prop для двох списків і хук useShowMore для тієї самої логіки в іншій розмітці. Деплой на Vercel."
discipline: "«Розробка вебзастосунків на React»"
level: "3 курс, спеціальність «Комп'ютерні науки»"
format: "Індивідуально"
duration: "2 академічні години (практична частина — близько 65 хвилин; самостійна робота — 2 години)"
updated: 2026-11-15
---

> **Примітка щодо актуальності.** Документ підготовлено станом на 15 листопада
> 2026 року: React 19, Vite 8, Vitest 5, React Testing Library 16, jsdom 31,
> ESLint 10 з `eslint-plugin-react-hooks` 7, Prettier 3, React DevTools 8. У
> разі відмінностей орієнтуйтеся на документацію React і Vitest (§2).

## 1. Мета роботи

Навчитися відокремлювати логіку від відображення: виносити логіку зі станом у
власні хуки, ділити компонент на розумний і простий, показувати різні стани
умовним рендерингом і ділитися логікою через хук або через компонент із render
prop, обираючи спосіб під задачу; навчитися працювати за готовими тестами.

**Очікуваний результат:** у теці `lab-7/` репозиторію `react-labs` — сторінка
кави в зернах, у якій ♡ і помел зберігаються через власний хук; кожен таймер
заварювання показує лише ті кнопки, що мають сенс зараз, рахує час правильно і
наприкінці повідомляє «Готово! Час пити каву.»; відгуки й схожі товари
розкриваються кнопкою «Показати ще», яка наприкінці стає «Згорнути» й не
втрачає фокусу; у «Схожих товарах» ця кнопка — остання клітинка сітки. У теці
`npx vitest run` проходить 41 тест з 41, `npm run lint` — без помилок і
попереджень, `format:check` і `build` — без помилок; застосунок відкривається
на Vercel.

![Сторінка «Ефіопія Іргачеф»: ♥ натиснуто, помел «Для фільтра». У розділі «Як заварити» таймер «Пуровер V60» показує 2:54 і кнопки «Пауза» та «Скинути»; таймер «Френч-прес» показує 0:00, під часом зелений напис «Готово! Час пити каву.» і одна кнопка «Спочатку». «Відгуки (10)»: три картки відгуків і кнопка «Показати ще 3». «Схожі товари»: сім карток у сітці, восьма клітинка з пунктирною рамкою — кнопка «Згорнути».](/uk/react/labs/lab-7/result.webp)

## 2. Корисні посилання

Теоретичної частини в цій роботі немає. Перед заняттям прочитайте сторінки за
посиланнями 1–3 і 5. Решту відкривайте, коли до них відсилає challenge.
Сторінка 6 — українською; решта — англійською, зокрема й інші адреси
`uk.react.dev`: їх ще не перекладено.

1. patterns.dev: [Hooks Pattern](https://www.patterns.dev/react/hooks-pattern) —
   власні хуки, правила хуків і як хуки замінили класові компоненти
   (§4.3, §4.5).
2. patterns.dev: [Container/Presentational Pattern](https://www.patterns.dev/react/presentational-container-pattern) —
   розумний і простий компоненти, а потім той самий поділ із хуком
   (§4.4, §4.5).
3. patterns.dev: [Render Props Pattern](https://www.patterns.dev/react/render-props-pattern) —
   функція як `children`, і де хуки замінюють render props (§4.6, §4.7).
4. Dan Abramov: [Presentational and Container Components](https://medium.com/@dan_abramov/7ca2f9a7c7d0) (2015) —
   стаття, що дала патерну назву. Прочитайте примітку 2019 року на її початку
   (§4.4).
5. [Reusing Logic with Custom Hooks](https://uk.react.dev/learn/reusing-logic-with-custom-hooks) —
   як виносити логіку у власний хук і чому хуки ділять логіку, а не стан
   (§4.3, §4.5).
6. [Умовний рендеринг](https://uk.react.dev/learn/conditional-rendering) —
   `if`, `? :`, `&&` і `null` у JSX (§4.4).
7. [Preserving and Resetting State](https://uk.react.dev/learn/preserving-and-resetting-state) —
   коли React зберігає елемент і його стан, а коли створює новий
   (§4.4, §4.6).
8. [Synchronizing with Effects](https://uk.react.dev/learn/synchronizing-with-effects) —
   ефект, очищення і чому в режимі розробки ефект запускається двічі (§4.5).
9. [`useState`](https://uk.react.dev/reference/react/useState) — функція-оновлювач
   (§4.5).
10. [Rules of Hooks](https://uk.react.dev/reference/rules/rules-of-hooks) (§4.3).
11. [`cloneElement`: Alternatives](https://uk.react.dev/reference/react/cloneElement#alternatives) —
    ті самі дані через render prop і через власний хук (§4.6, §4.7).
12. Developer Way: [React component as prop: the right way™](https://www.developerway.com/posts/react-component-as-prop-the-right-way) —
    за бажанням: функція в пропсі, яка отримує стан компонента.
13. Testing Library: [About Queries](https://testing-library.com/docs/queries/about) —
    за бажанням: як тести шукають елементи на сторінці (`getByRole` і `name`).

Основна література програми — книга Nadia Makarevich _Advanced React_. Вона
платна, але її розділи про render props і власні хуки мають безкоштовні
відповідники в блозі авторки [Developer Way](https://www.developerway.com/).

## 3. Завдання лабораторної роботи

1. Додати в репозиторій `react-labs` теку `lab-7/` зі стартового проєкту й
   запустити тести (§4.1).
2. Власний хук `useLocalStorage` замість двох копій коду (§4.3).
3. Розумний і простий компоненти таймера, умовний рендеринг (§4.4).
4. Хук `useCountdown` з ефектом і очищенням (§4.5).
5. Компонент `ShowMore` з render prop (§4.6).
6. Та сама логіка як хук `useShowMore` (§4.7).
7. Перевірки, GitHub і Vercel (§4.8), звіт (§5).

**Усі завдання виконуються на занятті (орієнтовно 65 хвилин) і разом
оцінюються в 1 бал після захисту.** Якщо challenge не вдалося завершити на
занятті, наприкінці заняття відправте на GitHub коміти тих challenges, тести
яких уже проходять. Решту виконайте так само, як відпрацьовують пропущене
заняття (§7). Самостійна робота (§4.9) не оцінюється. Звіт (§5) можна
надіслати після заняття.

**AI.** AI пояснює, але коду не пише: правила — у §4.2.

## 4. Хід виконання роботи

У стартовому проєкті сторінка кав'ярні з кавою в зернах: картка товару,
таймери заварювання, відгуки й схожі товари. Сторінка працює, але частина коду
дубльована, а частина — зламана. Кожен challenge починається з того, що на
сторінці не так, і закінчується, коли проходять його тести.

Назви, параметри й результат кожного хука й компонента, які ви напишете, уже
описано в коментарі заготовки. Як їх реалізувати, вирішуєте ви. Тести в
`tests/` перевіряють поведінку й те, що компонент використовує потрібний хук,
але не перевіряють, як саме написано код.

### 4.1. Стартовий проєкт

1. Відкрийте в редакторі теку `react-labs` і перевірте, що `git status` чистий.
   Якщо працюєте на іншому комп'ютері, спершу клонуйте `react-labs` з GitHub.
2. Завантажте [lab-7.zip](/uk/react/starters/lab-7.zip) і розпакуйте його в
   провіднику (Windows: **Extract All**, macOS: подвійний клік). Вийде тека
   `lab-7`. Перемістіть її в корінь `react-labs`, поруч із теками попередніх
   робіт.

   Не розпаковуйте архів командою в терміналі в корені `react-labs`: файли в
   ньому лежать без теки й замінили б кореневі `package.json` і `.gitignore`.

3. У корені репозиторію виконайте `git status -u`: усі нові файли мають бути
   в `lab-7/`.
4. Встановіть залежності в корені й запустіть dev-сервер:

   ```bash
   npm install
   cd lab-7
   npm run dev
   ```

   `npm install` встановить і інструменти тестування: Vitest, jsdom і React
   Testing Library. Вони в `devDependencies`, тож у збірку застосунку не
   потрапляють. Відкрийте http://localhost:5173: на сторінці «Ефіопія
   Іргачеф». Dev-сервер не зупиняйте до §4.8.

5. **Тести.** Відкрийте другий термінал, перейдіть у `lab-7/` і запустіть:

   ```bash
   npm test
   ```

   Vitest виконає всі тести й лишиться працювати: після кожного збереження
   файлу він запускає тести знову. Зараз 39 з 41 тесту падають, більшість — з
   повідомленням `Not implemented`: заготовки ще порожні. Два тести проходять:
   вони перевіряють те, що вже працює (♡ і помел зберігаються після
   перезавантаження), і стежать, щоб це не зламалося, коли код переїде в
   хук (§4.3).

   Як читати результат: у кожного challenge свій файл тестів
   (`useLocalStorage.test.jsx` — §4.3). Назва тесту — правило, яке він
   перевіряє, а під нею — що тест очікував і що отримав. Повідомлення
   `expected "vi.fn()" to be called at least once` означає, що потрібний хук
   чи компонент поки ніхто не викликає.

   Щоб бачити лише тести одного challenge, зупиніть Vitest клавішею `q` і
   запустіть його з початком шляху до файлу тестів:
   `npm test -- tests/useLocalStorage`. Команда для кожного challenge — у
   його «Перевірці». Команди git виконуйте в третьому терміналі, у корені
   репозиторію.

6. Що вже є в проєкті:

   | Файл                                                                | Що в ньому                                                                                                      |
   | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
   | `src/App.jsx`                                                       | сторінка: `ProductCard`, `BrewGuide`, `ReviewList`, `RelatedProducts`                                           |
   | `src/components/FavoriteButton.jsx`, `GrindPicker.jsx`              | ♡ і помел; кожен зберігає значення в `localStorage` кодом з ЛР-4                                                |
   | `src/components/BrewGuide.jsx`, `BrewTimer.jsx`                     | розділ «Як заварити» і таймер: стан, ефект і розмітка разом                                                     |
   | `src/components/ReviewList.jsx`, `RelatedProducts.jsx`              | відгуки й схожі товари, кожен зі своєю кнопкою «Показати ще»                                                    |
   | `src/components/ProductCard.jsx`                                    | картка товару                                                                                                   |
   | `src/components/TimerView.jsx`, `ShowMore.jsx`                      | заготовки компонентів (§4.4, §4.6)                                                                              |
   | `src/hooks/useLocalStorage.js`, `useCountdown.js`, `useShowMore.js` | заготовки хуків (§4.3, §4.5, §4.7)                                                                              |
   | `src/data.js`, `src/formatTime.js`                                  | товар, помели, способи заварювання, 10 відгуків, 7 схожих товарів; `formatTime(180)` повертає `'3:00'`          |
   | `src/index.css`                                                     | усі стилі сторінки, зокрема для повідомлення «Готово!» (`.timer-done`) і кнопки в сітці (`.related-more`)       |
   | `tests/`                                                            | тести Vitest, по файлу на challenge, і `setup.js`, який очищає сторінку й `localStorage` після кожного тесту    |
   | `package.json`, `vite.config.js`                                    | скрипт `test` і блок `test` у налаштуваннях Vite: тести виконуються в jsdom, браузерному середовищі для Node.js |

7. `npm run lint` у теці `lab-7/` показує одне попередження, у
   `BrewTimer.jsx`. Не виправляйте його зараз: це частина §4.5.
8. Зробіть коміт у корені репозиторію: так до нього потрапить і
   `package-lock.json`.

   ```bash
   git add .
   git commit -m "chore: add lab 7 starter"
   ```

Далі шляхи до файлів (`src/hooks/useLocalStorage.js`) — відносно `lab-7/`.
**Файли в `tests/` не змінюйте в жодному коміті**: тести — це умова задачі.
Після кожного challenge зробіть коміт, щойно його тести пройшли.

### 4.2. Правила роботи з AI

- **AI пояснює, але не пише код.** Можна попросити пояснити поняття,
  повідомлення тесту чи помилку ESLint. Не можна просити написати хук чи
  компонент — ні цілком, ні «підказкою» з готовим кодом. Агент у редакторі
  використовуйте в режимі без редагування (ask / plan).
- **Автодоповнення AI вимкніть** у налаштуваннях редактора, щонайменше для
  файлів у `src/hooks/` і `src/components/`: за назвою `useLocalStorage` воно
  допише весь хук, і рішення прийматимете вже не ви.

Приклад запиту:

> Поясни, чому падає цей тест. Нижче — його назва, повідомлення й мій
> компонент. Не пиши виправлений код: назви правило React, яке я, ймовірно, не
> врахував, і підкажи, що перевірити в браузері чи React DevTools.

### 4.3. Власний хук `useLocalStorage`

`FavoriteButton` і `GrindPicker` зберігають своє значення в `localStorage`
тим самим кодом, що й фільтри в ЛР-4 (§4.4): `useState` з функцією-
ініціалізатором і ефект, який записує значення. Це дві копії однієї логіки, і
кожна ще й записує по-своєму: ♡ — рядком `String(…)`, помел — без
перетворення. **Власний хук** — функція, назва якої починається з `use` і яка
викликає інші хуки. Він дає компонентам одну й ту саму логіку зі станом, а
код живе в одному місці.

**Що має вийти.**

- Сторінка поводиться як раніше: ♡ і помел зберігаються після
  перезавантаження.
- Обидва компоненти отримують стан з `useLocalStorage(key, initialValue)`,
  який повертає `[value, setValue]`, як `useState`. Сеттер приймає і нове
  значення, і функцію-оновлювач.
- Значення зберігаються як JSON (`JSON.stringify`), а читаються через
  `JSON.parse`.
- Якщо в `localStorage` під ключем лежить не JSON (наприклад, `filter`, який
  записав старий код помелу), хук повертає початкове значення, а сторінка не
  падає.
- Без збереженого значення хук повертає початкове.

**Що вже є.** Заготовка `src/hooks/useLocalStorage.js` з описом API в
коментарі; два компоненти з кодом ЛР-4; ключі `favorite:<id>` і `grind`.

**Код:** `src/hooks/useLocalStorage.js`, `src/components/FavoriteButton.jsx`,
`src/components/GrindPicker.jsx`.

**Перевірка.**

- `npm test -- tests/useLocalStorage`: 11 тестів з 11.
- DevTools → **Application** → **Local Storage** → `http://localhost:5173`:
  виберіть «Для фільтра», і значення `grind` стане `"filter"` — з лапками,
  бо це JSON. Якщо до цього ви вже вибирали помел, тепер сторінка покаже
  «Зерно»: старе значення `filter` — не JSON.
- **Components ⚛** → `FavoriteButton`: серед хуків — `LocalStorage`, а в
  ньому хуки, які він викликає: `State`, а якщо значення записує ефект, то
  й `Effect`. React DevTools показує власні хуки без префікса `use`.
- Експеримент, без коміту: перейменуйте функцію в `useLocalStorage.js` на
  `localStorageState` і подивіться на помилку ESLint у редакторі (або
  `npm run lint`). Прочитайте її й поверніть назву.

**Коміт:** `refactor: extract the useLocalStorage hook` (`refactor`, бо
сторінка не змінилася).
**Довідка:** [Extracting your own custom Hook](https://uk.react.dev/learn/reusing-logic-with-custom-hooks#extracting-your-own-custom-hook-from-a-component),
[Hook names always start with use](https://uk.react.dev/learn/reusing-logic-with-custom-hooks#hook-names-always-start-with-use),
[Custom Hooks let you share stateful logic, not state itself](https://uk.react.dev/learn/reusing-logic-with-custom-hooks#custom-hooks-let-you-share-stateful-logic-not-state-itself),
[Rules of Hooks](https://uk.react.dev/reference/rules/rules-of-hooks),
[`JSON.parse`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse).

### 4.4. Розумний і простий компоненти таймера

`BrewTimer` показує «Старт», «Пауза» і «Скинути» завжди, хоч би що робив
таймер. До того ж логіку таймера (стан, ефект) і розмітку змішано в одному
компоненті. Таймер ще й рахує неправильно, але це ви виправите в §4.5:
тести цього завдання від того не залежать.

Класичний спосіб розділити логіку й відображення — **розумний і простий
компоненти** (Container/Presentational, «smart and dumb components»).
Простий (presentational) компонент лише показує те, що отримав у пропсах, і
викликає передані обробники: власного стану й ефектів у нього немає. Розумний
(container) знає, звідки беруться дані й що робити з подіями, і рендерить
простий.

**Що має вийти.** Кожен таймер показує лише ті кнопки, що мають сенс зараз:

| Статус    | Коли                     | Час  | Кнопки (обробник)                          | Повідомлення             |
| --------- | ------------------------ | ---- | ------------------------------------------ | ------------------------ |
| `idle`    | не запущено, повний час  | 3:00 | «Старт» (`onStart`)                        | —                        |
| `running` | іде відлік               | 2:55 | «Пауза» (`onPause`), «Скинути» (`onReset`) | —                        |
| `paused`  | зупинено посеред відліку | 2:41 | «Продовжити» (`onStart`), «Скинути»        | —                        |
| `done`    | час вийшов               | 0:00 | «Спочатку» (`onReset`)                     | «Готово! Час пити каву.» |

- `TimerView` (новий, у `src/components/`) — простий компонент. Він отримує
  пропси `method`, `secondsLeft`, `status`, `onStart`, `onPause` і `onReset`,
  не має ні стану, ні ефектів і лише вирішує, що показати.
- `BrewTimer` стає розумним: він зберігає стан таймера, визначає `status` і
  рендерить `TimerView`.
- Перша кнопка не втрачає фокус клавіатури, коли змінюється статус: людина,
  яка запустила таймер клавішею Enter, тим самим Enter ставить його на паузу.
- «Готово! Час пити каву.» з'являється в елементі з `role="status"`, який є
  на сторінці від початку, а в інших статусах порожній. Текст, що з'являється
  в такому елементі, оголошує програма зчитування з екрана. Стилі для нього —
  клас `timer-done`.

Що саме показати в кожному статусі, вирішує **умовний рендеринг**: `if` зі
змінною, тернарний оператор `? :`, `&&`. Який спосіб де доречний, вирішуєте
ви: почніть з Довідки.

**Що вже є.** Заготовка `src/components/TimerView.jsx` з описом пропсів у
коментарі; `BrewTimer` з логікою й розміткою разом: розмітку картки
(заголовок, рецепт, час із `role="timer"`, кнопки) можна перенести з нього;
`formatTime`; стилі, у яких перша кнопка в `.timer-controls` виглядає як
головна дія.

**Код:** `src/components/TimerView.jsx`, `src/components/BrewTimer.jsx`.

**Перевірка.**

- `npm test -- tests/TimerView`: 9 тестів з 9. Перший тест викликає
  `TimerView` як звичайну функцію, поза рендерингом React. Це вдається лише
  компонентові без хуків.
- У браузері кожен таймер спершу показує лише «Старт»; після «Старт» —
  «Пауза» і «Скинути», після «Пауза» — «Продовжити» і «Скинути». Час поки
  рахується неправильно: це §4.5.
- Клавіатурою: клавішею Tab дійдіть до «Старт» таймера «Пуровер V60» і
  натисніть Enter, потім ще раз Enter. Таймер на паузі, а рамка фокусу весь
  час на першій кнопці.
- **Components ⚛** → `TimerView`: пропси є, а розділу хуків немає.
- Попередження ESLint у `BrewTimer.jsx` лишається до §4.5.

**Коміт:** `feat: split the timer into a container and TimerView`.
**Довідка:** [Container/Presentational Pattern](https://www.patterns.dev/react/presentational-container-pattern),
[Presentational and Container Components](https://medium.com/@dan_abramov/7ca2f9a7c7d0),
[Умовне повернення нічого за допомогою `null`](https://uk.react.dev/learn/conditional-rendering#conditionally-returning-nothing-with-null),
[Умовний (тернарний) оператор (`? :`)](https://uk.react.dev/learn/conditional-rendering#conditional-ternary-operator--),
[Логічний оператор AND (`&&`)](https://uk.react.dev/learn/conditional-rendering#logical-and-operator-),
[Умовне присвоєння JSX змінній](https://uk.react.dev/learn/conditional-rendering#conditionally-assigning-jsx-to-a-variable),
[Same component at the same position preserves state](https://uk.react.dev/learn/preserving-and-resetting-state#same-component-at-the-same-position-preserves-state),
[`role="status"`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/status_role),
[`role="timer"`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/timer_role).

### 4.5. Хук `useCountdown`: ефект, очищення і пошук помилок

Запустіть таймер і подивіться, що відбувається. Логіка відліку, яка після §4.4
живе в `BrewTimer`, має кілька помилок. Знайти їх допоможуть браузер, тести й
попередження ESLint. Виправлена логіка переїде у власний хук: так хук бере на
себе роботу розумного компонента.

**Що має вийти.**

- Після «Старт» таймер щосекунди зменшує час на 1.
- «Пауза» зупиняє відлік; «Продовжити» запускає його далі з нормальною
  швидкістю, скільки б разів ви не ставили паузу.
- «Скинути» повертає повний час і зупиняє відлік.
- На 0:00 таймер зупиняється, а не йде в мінус, і показує «Готово!» і
  «Спочатку».
- Два таймери на сторінці незалежні, а після демонтажу компонента не лишається
  жодного таймера (`setInterval`).
- `BrewTimer` отримує все це з `useCountdown(method.seconds)`, який повертає
  `{ secondsLeft, isRunning, start, pause, reset }`. Логіка відліку — у хуку,
  а не в компоненті.
- Правила `react-hooks` з ЛР-4 діють і тут: `npm run lint` — без помилок і
  попереджень.

**Що вже є.** Заготовка `src/hooks/useCountdown.js` з описом API в
коментарі; `BrewTimer` з §4.4 з відліком усередині; `formatTime`.

**Код:** `src/hooks/useCountdown.js`, `src/components/BrewTimer.jsx`.

**Перевірка.**

- `npm test -- tests/useCountdown`: 10 тестів з 10. Ці тести використовують
  фальшиві таймери Vitest: `vi.useFakeTimers()` підміняє `setInterval`, а
  `vi.advanceTimersByTime(3000)` «перемотує» час на три секунди одразу, тож
  тест трихвилинного таймера триває мілісекунди. Тест «після демонтажу
  компонента не лишає таймерів» рахує незавершені таймери через
  `vi.getTimerCount()`.
- У браузері: «Старт», «Пауза», «Продовжити» кілька разів поспіль, «Скинути»,
  обидва таймери одночасно. Щоб побачити «Готово!», не чекаючи трьох хвилин,
  тимчасово змініть у `src/data.js` `seconds: 180` на `5`, а після перевірки
  поверніть.
- **Components ⚛** → `BrewTimer`: серед хуків — `Countdown`.

**Коміт:** `fix: move the countdown into useCountdown`.
**Довідка:** [Step 3: Add cleanup if needed](https://uk.react.dev/learn/synchronizing-with-effects#step-3-add-cleanup-if-needed),
[How to handle the Effect firing twice in development](https://uk.react.dev/learn/synchronizing-with-effects#how-to-handle-the-effect-firing-twice-in-development),
завдання «Fix an interval that fires twice» у розділі [Challenges](https://uk.react.dev/learn/synchronizing-with-effects#challenges),
[Updating state based on the previous state](https://uk.react.dev/reference/react/useState#updating-state-based-on-the-previous-state),
[When to use custom Hooks](https://uk.react.dev/learn/reusing-logic-with-custom-hooks#when-to-use-custom-hooks),
[Vitest: Timers](https://vitest.dev/guide/mocking/timers).

### 4.6. Компонент `ShowMore` з render prop

`ReviewList` і `RelatedProducts` однаково рахують, скільки елементів
показати, і рендерять однакову кнопку «Показати ще». Розкрийте всі відгуки:
після останнього натискання кнопка зникає, а фокус клавіатури — разом із
нею. `document.activeElement` у консолі покаже `<body>`.

Логіку разом із кнопкою можна винести в один компонент, а список лишити тому,
хто цей компонент використовує. **Render prop** — проп-функція, яку компонент
викликає, щоб дізнатися, що рендерити. Ви вже користувалися ним у ЛР-6:
`Controller render={({ field }) => …}` зберігав значення поля, а розмітку
`GuestsStepper` рендерили ви. Тут функцією буде `children`:

```jsx
<ShowMore items={reviews} step={3}>
  {(visibleItems) => <ul>…</ul>}
</ShowMore>
```

**Що має вийти.**

- `ShowMore` викликає `children` як функцію з першими `step` елементами й
  рендерить під результатом кнопку. Список рендерить той, хто викликає.
- Кнопка показує, скільки елементів додасться: «Показати ще 3», а наприкінці
  «Показати ще 1».
- Коли показано все, кнопка стає «Згорнути», лишається у фокусі й згортає
  список до `step` елементів.
- Якщо елементів не більше за `step`, кнопки немає.
- «Відгуки» використовують `ShowMore` по 3, «Схожі товари» — по 4.

**Що вже є.** Заготовка `src/components/ShowMore.jsx` з описом API в
коментарі; дубльований код у `ReviewList` і `RelatedProducts`.

**Код:** `src/components/ShowMore.jsx`, `src/components/ReviewList.jsx`,
`src/components/RelatedProducts.jsx`.

**Перевірка.**

- `npm test -- tests/ShowMore`: 5 тестів з 5. «Схожі товари» тут тести не
  перевіряють: §4.7 змінить їх ще раз.
- У браузері розкрийте відгуки клавішею Enter до кінця й згорніть: фокус
  увесь час на кнопці. «Схожі товари» поводяться так само, по 4.
- **Components ⚛** → `ReviewList` → `ShowMore`: пропси `items`, `step` і
  `children`, який є функцією.

**Коміт:** `refactor: share the show-more logic through a render prop`.
**Довідка:** [Render Props Pattern](https://www.patterns.dev/react/render-props-pattern),
[Passing data with a render prop](https://uk.react.dev/reference/react/cloneElement#passing-data-with-a-render-prop),
[Same component at the same position preserves state](https://uk.react.dev/learn/preserving-and-resetting-state#same-component-at-the-same-position-preserves-state).

### 4.7. Та сама логіка як хук `useShowMore`

Новий дизайн «Схожих товарів»: кнопка має стати останньою клітинкою сітки
товарів, а не рядком під нею. «Відгуки» не змінюються.

![Розділ «Схожі товари»: чотири картки товарів у ряд, у кожній назва, смакові ноти, ціна й кнопка ♡; п'ята клітинка того самого ряду має пунктирну рамку й напис «Показати ще 3».](/uk/react/labs/lab-7/grid.webp)

**Що має вийти.**

- Сітка «Схожих товарів» показує 4 товари й клітинку «Показати ще 3»; після
  натискання — 7 товарів і «Згорнути» в останній клітинці, з фокусом на ній.
  Кнопка лежить у тому самому списку, що й товари, в останньому `<li>` з
  класом `related-more`.
- Логіка переїжджає в `useShowMore(items, step)`, який повертає
  `{ visibleItems, hiddenCount, showMore, collapse }`. `showMore()` додає ще
  `step` елементів, але не більше, ніж є; `collapse()` повертає до `step`.
- `ShowMore` тепер побудований на `useShowMore`, а `RelatedProducts`
  використовує хук напряму.

**Що вже є.** Заготовка `src/hooks/useShowMore.js`; `ShowMore` з §4.6; стилі
`.related-more`.

**Код:** `src/hooks/useShowMore.js`, `src/components/ShowMore.jsx`,
`src/components/RelatedProducts.jsx`.

**Перевірка.**

- `npm test -- tests/useShowMore`: 6 тестів з 6; `npx vitest run`: 41 тест
  з 41.
- У браузері кнопка — остання клітинка сітки і на всю ширину вікна, і на
  вузькому екрані (DevTools → **Toggle device toolbar**, ширина 390 px).
  «Відгуки» працюють як після §4.6.

**Коміт:** `feat: put the related products button into the grid`.
**Довідка:** [Render Props Pattern](https://www.patterns.dev/react/render-props-pattern),
[Extracting logic into a custom Hook](https://uk.react.dev/reference/react/cloneElement#extracting-logic-into-a-custom-hook),
[Reusing Logic with Custom Hooks](https://uk.react.dev/learn/reusing-logic-with-custom-hooks).

### 4.8. Перевірки, GitHub і Vercel

1. Зупиніть dev-сервер і Vitest (`Ctrl+C` і `q`) і виконайте в `lab-7/`:

   ```bash
   npx vitest run
   npm run lint
   npm run format:check
   npm run build
   ```

   `npx vitest run` виконує тести один раз: 41 з 41. Решта команд має пройти
   без помилок, а `npm run lint` — ще й без попереджень (`warning`). Якщо
   `format:check` назве файл, відкрийте його, збережіть ще раз і закомітьте:
   `style: format lab 7 files`.

2. Перевірте історію: у корені `git log --oneline -- lab-7/tests` має
   показати лише коміт стартового проєкту. Відправте коміти на GitHub:
   `git push`. Історія комітів роботи:

   1. `chore: add lab 7 starter`;
   2. `refactor: extract the useLocalStorage hook`;
   3. `feat: split the timer into a container and TimerView`;
   4. `fix: move the countdown into useCountdown`;
   5. `refactor: share the show-more logic through a render prop`;
   6. `feat: put the related products button into the grid`.

3. На [vercel.com](https://vercel.com) → **Add New → Project** ще раз
   імпортуйте `react-labs`: це буде ще один проєкт з того самого репозиторію.
   Перед **Deploy** налаштуйте:

   | Поле             | Значення                         |
   | ---------------- | -------------------------------- |
   | Project Name     | `react-lab-7`                    |
   | Root Directory   | **Edit** → `lab-7`               |
   | Framework Preset | Vite (Vercel розпізнає його сам) |
   | Output Directory | `dist`                           |

   Vercel виконує лише `npm run build`: тести там не запускаються.

4. Після деплою скопіюйте адресу застосунку з вкладки **Overview** проєкту,
   поле **Domains**, відкрийте її й запустіть таймер.

### 4.9. Самостійна робота (не оцінюється): спільний стан для двох ♡

Тема самостійної роботи за програмою — «Створення власних хуків». Додайте на
сторінку другу ♡ того самого товару, наприклад біля ціни: другий
`FavoriteButton` з тим самим `productId`. Натисніть одну: друга не
зміниться до перезавантаження. Чому — пояснює тест «два компоненти з одним
хуком мають кожен свій стан» у `useLocalStorage.test.jsx`.

Напишіть хук `useSyncedLocalStorage` з тим самим API, щоб усі ♡ одного товару
змінювалися разом — на сторінці й в інших вкладках браузера. Знадобиться
[`useSyncExternalStore`](https://uk.react.dev/reference/react/useSyncExternalStore#subscribing-to-a-browser-api)
і подія [`storage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event).
Підказка: `storage` спрацьовує лише в **інших** вкладках, тож вкладка, яка
записала значення, має сама повідомити своїх підписників.

Працюйте в окремій гілці (`git switch -c lab-7-sync`), щоб `main` лишився
таким, як після §4.8, а `useLocalStorage` і його тести — без змін. Тестів і
балів тут немає; це підготовка до групи питань «Власні хуки» на захисті.

## 5. Вимоги до звіту

**Тема листа:**

```
[React] ЛР-7: власні хуки, розумні й прості компоненти, render props
```

У листі вкажіть теку лабораторної на GitHub і адресу застосунку на Vercel:

```
GitHub repository: https://github.com/<username>/react-labs/tree/main/lab-7
Vercel: https://<project>.vercel.app/
```

Звіт повинен містити:

1. знімок екрана `npx vitest run`: 41 тест з 41;
2. знімок екрана `npm run lint`, `npm run format:check` і `npm run build` без
   помилок;
3. для кожного challenge одне-два речення: що було не так у стартовому
   проєкті й що ви змінили;
4. чи використовували AI і для чого (інструмент, модель, дата);
5. короткий висновок: що було складним.

## 6. Усний захист

Формат здачі передбачає усну співбесіду за результатами роботи. Питання
нижче — типові питання співбесіди frontend-розробника з тем цієї роботи.
Відповідайте на прикладах власного коду. Викладач може попросити показати
відповідь у коді, тестах чи DevTools або змінити код наживо, без AI.

**Питання для підготовки:**

_Власні хуки_

- Що таке власний хук? Чим він відрізняється від звичайної функції?
- Чому назва хука починається з `use`? Що сказав ESLint, коли ви назвали
  його `localStorageState`?
- Два компоненти викликають `useLocalStorage` з тим самим ключем. Чи спільне
  в них значення? Чому? Що треба змінити, щоб дві ♡ одного товару
  змінювалися разом?
- Чому `useLocalStorage` повертає масив, а `useCountdown` — об'єкт? Коли що
  зручніше?
- Навіщо `useState` у `useLocalStorage` функція-ініціалізатор? Що зміниться,
  якщо передати значення напряму?
- Що робить ваш хук, якщо в `localStorage` лежить не JSON? Навіщо зберігати
  значення як JSON?
- Коли функцію не варто робити хуком? Чи має `formatTime` бути хуком?

_Правила хуків_

- Назвіть правила хуків. Чому хук не можна викликати в умові чи після
  `return`?
- Як ESLint знаходить хуки й порушення правил?
- Про що попереджав ESLint у стартовому `BrewTimer`? Що це попередження
  означало для роботи таймера?

_Розумні й прості компоненти_

- Що таке розумний і простий компоненти? Що з `BrewTimer` і `TimerView` чим є
  і чому?
- Чому в `TimerView` немає стану? Чому статус визначає `BrewTimer`, а не
  `TimerView`?
- Як тест перевіряє, що в `TimerView` немає хуків? Чому виклик компонента як
  звичайної функції падає, якщо в ньому є хук?
- Що лишилося в `BrewTimer`, коли відлік переїхав у `useCountdown`? Чи
  потрібен він ще?
- Чому Ден Абрамов 2019 року перестав радити ділити компоненти так? Де цей
  поділ і далі корисний?

_Умовний рендеринг_

- Які способи умовного рендерингу ви знаєте? Коли доречний кожен: `if` зі
  змінною, `? :`, `&&`, `return null`?
- Що покаже `{secondsLeft && <p>{secondsLeft}</p>}`, коли `secondsLeft`
  дорівнює 0? Чому? Як записати правильно?
- Чому перша кнопка таймера не втрачає фокус, коли «Старт» стає «Пауза»? Як
  треба написати `TimerView`, щоб фокус губився?
- Куди переходить фокус, коли натиснути «Скинути» з клавіатури? Чому? Якщо це
  проблема, як її виправити?
- Навіщо елемент з `role="status"` є на сторінці від початку, а не з'являється
  разом із «Готово!»?
- Чим відрізняється «сховати елемент через CSS» від «не рендерити його»? Що
  відбувається зі станом і фокусом у кожному випадку?

_Ефекти в хуках_

- Що робить функція очищення ефекту? Коли React її викликає?
- Які помилки були в стартовому таймері? Як ви знайшли кожну: у браузері, за
  тестом чи за ESLint?
- Чому в режимі розробки React запускає ефекти двічі? Що це показує?
- Навіщо функція-оновлювач `setSecondsLeft((s) => s - 1)`? Що таке застаріле
  замикання (stale closure)?
- Як ваш таймер зупиняється на нулі? Які ще способи ви пробували і чому від
  них відмовилися?
- Чим значення, обчислене під час рендерингу, відрізняється від стану, який
  оновлює ефект? Що з цього у вашому `useCountdown`?
- Що означає «таймер протікає»? Як тест перевіряє, що після демонтажу таймерів
  не лишилося?

_Render props_

- Що таке render prop? Чим `children` як функція відрізняється від пропа
  `render`?
- Що `ShowMore` робить сам, а що віддає тому, хто його використовує?
- Де ви користувалися render prop до цієї роботи? Які бібліотеки досі ними
  користуються?

_Хук чи render prop_

- Чому для нової сітки «Схожих товарів» знадобився хук, а не `ShowMore`?
- Що компонент із render prop дає такого, чого не дає хук?
- Як іще можна було б поставити кнопку в сітку, не відмовляючись від
  `ShowMore`?
- Чому після появи хуків render props трапляються рідше?

_Доступність_

- Чому «Згорнути» не втрачає фокус? Що відбувалося з фокусом у стартовому
  проєкті після останнього «Показати ще»?
- Навіщо ♡ атрибут `aria-pressed`? Чим така кнопка відрізняється від
  чекбокса?
- Навіщо `fieldset` і `legend` для помелу?
- Що означає `role="timer"`? Чому програма зчитування з екрана не оголошує
  кожну секунду?

_Тести_

- Що доводить тест «два компоненти з одним хуком мають кожен свій стан»?
- Чому тести на збереження ♡ і помелу проходили ще до `useLocalStorage`?
  Навіщо вони тоді?
- Що роблять `renderHook`, `vi.useFakeTimers()` і `vi.advanceTimersByTime()`?
- Як тест бачить, що `FavoriteButton` використовує `useLocalStorage`?
- Чому тести шукають кнопки за роллю й назвою
  (`getByRole('button', { name: 'Згорнути' })`), а не за класом?

## 7. Критерії готовності

Лабораторна робота оцінюється в 1 бал після захисту (§6).

| Критерій           | Мінімальна вимога                                                                                                                                                  |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Тести              | у теці `lab-7` `npx vitest run` проходить: 41 з 41; файли в `tests/` не змінено в жодному коміті                                                                   |
| Якість             | `npm run lint` без помилок і попереджень, `format:check` і `build` — без помилок                                                                                   |
| Хуки               | `useLocalStorage`, `useCountdown` і `useShowMore` у `src/hooks/`; компоненти не дублюють їхню логіку                                                               |
| Розумний і простий | `TimerView` без стану й ефектів показує чотири стани таймера; `BrewTimer` визначає статус і рендерить `TimerView`                                                  |
| Render prop        | `ShowMore` викликає `children` як функцію; ним користується `ReviewList`                                                                                           |
| GitHub             | коміт стартового проєкту й по одному коміту на кожен challenge (§4.8)                                                                                              |
| На занятті         | усі коміти відправлено на занятті (час `git push` видно в **Activity** репозиторію); challenges, не завершені на занятті, — на відпрацюванні, як пропущене заняття |
| Vercel             | проєкт з Root Directory `lab-7`; адреса показує сторінку з останнього коміту `main`                                                                                |
| AI                 | §4.2 дотримано; у звіті вказано, чи використовувався AI і як                                                                                                       |
| Звіт               | усі пункти §5                                                                                                                                                      |

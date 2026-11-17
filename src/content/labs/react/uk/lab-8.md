---
number: 8
title: "Патерни проєктування React. Частина 2 (Compound Components, HOC)"
summary: "Сторінка кави з ЛР-7 отримує вкладки й аналітику: чотири code challenges з готовими тестами Vitest. Вкладки, вміст яких приходить як children, а стан — через контекст, складений компонент Tabs з ролями й клавіатурою за ARIA APG, HOC withAnalytics, що надсилає подію під час кліку, і помилка, яку цей HOC проявляє в чужому коді. Деплой на Vercel."
discipline: "«Розробка вебзастосунків на React»"
level: "3 курс, спеціальність «Комп'ютерні науки»"
format: "Індивідуально"
duration: "2 академічні години (практична частина — близько 60 хвилин; самостійна робота — 2 години)"
updated: 2026-11-17
---

> **Примітка щодо актуальності.** Документ підготовлено станом на 17 листопада
> 2026 року: React 19, Vite 8, Vitest 5, React Testing Library 16, jsdom 31,
> ESLint 10 з `eslint-plugin-react-hooks` 7, Prettier 3, React DevTools 8,
> WAI-ARIA Authoring Practices Guide (APG). У разі відмінностей орієнтуйтеся на
> документацію React і APG (§2).

## 1. Мета роботи

Навчитися будувати компоненти-обгортки, які отримують вміст через `children` і
передають свій стан частинам через контекст, робити такі складені компоненти
доступними за ARIA APG, писати компоненти вищого порядку (HOC) і бачити, коли
HOC шкодить.

**Очікуваний результат:** у теці `lab-8/` репозиторію `react-labs` — сторінка
кави в зернах з ЛР-7, у якій розділи «Як заварити», «Відгуки» і «Схожі товари»
лежать у вкладках складеного компонента `Tabs`. Вміст вкладок передає `App`,
запущений таймер не скидається після переходу на іншу вкладку, а вкладками
можна керувати з клавіатури, як радить APG. «Додати в кошик» і перша кнопка
таймера надсилають події аналітики через HOC `withAnalytics`, а кнопка таймера
не втрачає фокусу. У теці `npx vitest run` проходить 28 тестів з 28,
`npm run lint` — без помилок і попереджень, `format:check` і `build` — без
помилок; застосунок відкривається на Vercel.

![Сторінка «Ефіопія Іргачеф»: ♥ натиснуто, помел «Для фільтра», під ціною коричнева кнопка «Додати в кошик» і зелений напис «У кошику: 1». Під карткою товару ряд із трьох вкладок: «Заварювання», «Відгуки (10)» і «Схожі товари». Обрано «Відгуки (10)»: вкладку підкреслено й обведено рамкою фокусу. Під вкладками розділ «Відгуки (10)» з трьома картками відгуків і кнопкою «Показати ще 3».](/uk/react/labs/lab-8/result.webp)

## 2. Корисні посилання

Теоретичної частини в цій роботі немає. Перед заняттям прочитайте сторінки за
посиланнями 2, 6, 7 і 9. Решту відкривайте, коли до них відсилає challenge.
Сторінка 1 — українською; решта — англійською, зокрема й інші адреси
`uk.react.dev`: їх ще не перекладено.

1. [Передача JSX як children](https://uk.react.dev/learn/passing-props-to-a-component#passing-jsx-as-children) —
   «дірка» в компоненті, яку заповнює батьківський компонент: те, що ви робили
   з `Card` у ЛР-2 (§4.3).
2. CraftValue: [The Children Prop Pattern in React](https://www.craftvalue.io/blog/react-children-prop-pattern) (2022) —
   композиція через `children`, коли патерн не підходить і що він дає для
   рендерингу (§4.3).
3. Developer Way: [The mystery of React Element, children, parents and re-renders](https://www.developerway.com/posts/react-elements-children-parents) (2022) —
   за бажанням: той самий механізм через елементи React (§4.3).
4. [Passing Data Deeply with Context](https://uk.react.dev/learn/passing-data-deeply-with-context) —
   контекст за три кроки: створити, прочитати, надати (§4.3).
5. [`use`](https://uk.react.dev/reference/react/use#reading-context-with-use) і
   [`useId`](https://uk.react.dev/reference/react/useId) — читання контексту
   (§4.3) і унікальні `id` для атрибутів доступності (§4.4).
6. patterns.dev: [Compound Pattern](https://www.patterns.dev/react/compound-pattern) —
   складені компоненти. Читайте заради ідеї: перемикач `FlyOut` у прикладах —
   це `div` без ролі, до якого не дістатися з клавіатури. Як зробити доступно,
   показує APG (§4.3).
7. W3C APG: [Tabs Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) і
   [приклад з автоматичною активацією](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/examples/tabs-automatic/) —
   ролі, атрибути й клавіші вкладок (§4.4).
8. [Preserving and Resetting State](https://uk.react.dev/learn/preserving-and-resetting-state) —
   коли React зберігає компонент і його стан, а коли створює новий (§4.3,
   §4.6).
9. patterns.dev: [HOC Pattern](https://www.patterns.dev/react/hoc-pattern) —
   компоненти вищого порядку, `displayName`, `ref` у React 19, HOC і хуки
   (§4.5).
10. Developer Way: [Higher-Order Components in React Hooks era](https://www.developerway.com/posts/higher-order-components-in-react-hooks-era) (2022) —
    де HOC досі доречні: наприклад, щоб доповнити обробник `onClick` (§4.5).
11. [`static-components`](https://react.dev/reference/eslint-plugin-react-hooks/lints/static-components) —
    правило ESLint з `eslint-plugin-react-hooks` (§4.6).
12. [`Children`: Alternatives](https://uk.react.dev/reference/react/Children#alternatives) —
    за бажанням: чому `Children` і `cloneElement` — застарілий спосіб будувати
    складені компоненти.

Основна література програми — книга Nadia Makarevich _Advanced React_. Вона
платна, але її розділи про `children` і про HOC мають безкоштовні відповідники
в блозі авторки (посилання 3 і 10).

## 3. Завдання лабораторної роботи

1. Додати в репозиторій `react-labs` теку `lab-8/` зі стартового проєкту й
   запустити тести (§4.1).
2. Вкладки `Tabs`: вміст через `children`, стан через контекст (§4.3).
3. Доступні вкладки: ролі й клавіатура за ARIA APG (§4.4).
4. Компонент вищого порядку `withAnalytics` (§4.5).
5. Кнопка таймера, яка втрачає фокус (§4.6).
6. Перевірки, GitHub і Vercel (§4.7), звіт (§5).

**Усі завдання виконуються на занятті (орієнтовно 60 хвилин) і разом
оцінюються в 1 бал після захисту.** Якщо challenge не вдалося завершити на
занятті, наприкінці заняття відправте на GitHub коміти тих challenges, тести
яких уже проходять. Решту виконайте так само, як відпрацьовують пропущене
заняття (§7). Звіт (§5) можна надіслати після заняття.

**AI.** AI пояснює, але коду не пише: правила — у §4.2.

## 4. Хід виконання роботи

Стартовий проєкт — сторінка кави в зернах з ЛР-7, у якій код ЛР-7 уже
готовий. Розділи сторінки тепер сховані за вкладками, а в картці товару
з'явилася кнопка «Додати в кошик». Вкладки працюють, але так, що їх не можна
використати ще раз, і з ними губиться стан таймера. Кожен challenge
починається з того, що на сторінці не так, і закінчується, коли проходять його
тести.

Назви, параметри й результат компонента й HOC, які ви напишете, уже описано в
коментарі заготовки. Як їх реалізувати, вирішуєте ви. Тести в `tests/`
перевіряють поведінку, ролі й атрибути, але не перевіряють, як саме написано
код.

### 4.1. Стартовий проєкт

1. Відкрийте в редакторі теку `react-labs` і перевірте, що `git status` чистий.
   Якщо працюєте на іншому комп'ютері, спершу клонуйте `react-labs` з GitHub.
2. Завантажте [lab-8.zip](/uk/react/starters/lab-8.zip) і розпакуйте його в
   провіднику (Windows: **Extract All**, macOS: подвійний клік). Вийде тека
   `lab-8`. Перемістіть її в корінь `react-labs`, поруч із теками попередніх
   робіт.

   Не розпаковуйте архів командою в терміналі в корені `react-labs`: файли в
   ньому лежать без теки й замінили б кореневі `package.json` і `.gitignore`.

3. У корені репозиторію виконайте `git status -u`: усі нові файли мають бути
   в `lab-8/`. Ваша тека `lab-7/` лишається такою, як була.
4. Встановіть залежності в корені й запустіть dev-сервер:

   ```bash
   npm install
   cd lab-8
   npm run dev
   ```

   Відкрийте http://localhost:5173: на сторінці «Ефіопія Іргачеф», під
   карткою товару — три вкладки. Dev-сервер не зупиняйте до §4.7.

5. **Тести.** Відкрийте другий термінал, перейдіть у `lab-8/` і запустіть:

   ```bash
   npm test
   ```

   Тестів ЛР-7 тут немає: у `tests/` чотири нові файли. Зараз 24 з 28 тестів
   падають. Чотири проходять уже зараз:
   - ««Заварювання», «Відгуки (10)» і «Схожі товари» перемикають вміст»
     перевіряє те, що вже працює, і стежить, щоб воно не зламалося, коли
     вкладки переїдуть у `Tabs` (§4.3);
   - «з Tabs.jsx експортується лише Tabs» стежить за правилом, якого
     заготовка поки дотримується;
   - заготовка `withAnalytics` повертає `Button` без змін, тож тест про
     props і `ref` і тест ««Пауза» не втрачає фокус, поки таймер іде» поки
     теж проходять. Що станеться з другим, розповідає §4.6.

   Як читати результат, ви знаєте з ЛР-7: у кожного challenge свій файл
   тестів (`withAnalytics.test.jsx` — §4.5), назва тесту — правило, яке він
   перевіряє, а під нею — що тест очікував і що отримав. Щоб бачити лише тести
   одного challenge, зупиніть Vitest клавішею `q` і запустіть його з початком
   шляху до файлу: `npm test -- tests/withAnalytics`. Команда для кожного
   challenge — у його «Перевірці». Команди git виконуйте в третьому терміналі,
   у корені репозиторію.

6. Що вже є в проєкті:

   | Файл                                                                    | Що в ньому                                                                                                           |
   | ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
   | `src/App.jsx`                                                           | сторінка: `ProductCard` і `ProductTabs`                                                                              |
   | `src/components/ProductTabs.jsx`                                        | перша спроба вкладок (§4.3)                                                                                          |
   | `src/components/Tabs.jsx`                                               | заготовка складеного компонента вкладок (§4.3, §4.4)                                                                 |
   | `src/hoc/withAnalytics.jsx`                                             | заготовка HOC (§4.5): поки повертає компонент без змін                                                               |
   | `src/analytics.js`                                                      | `track(event, data)`: імітація сервісу аналітики, пише в Console рядок `[analytics] …`                               |
   | `src/components/Button.jsx`                                             | `<button type="button">`, який передає всі props далі                                                                |
   | `src/components/ProductCard.jsx`                                        | картка товару, зокрема «Додати в кошик» і рядок «У кошику: N» з `role="status"`                                      |
   | `src/components/BrewTimer.jsx`, `TimerView.jsx`                         | таймер з ЛР-7; перша кнопка `TimerView` проходить через `withAnalytics`                                              |
   | `src/components/BrewGuide.jsx`, `ReviewList.jsx`, `RelatedProducts.jsx` | три розділи сторінки, кожен зі своїм заголовком `<h2>`                                                               |
   | `src/hooks/`, `src/components/ShowMore.jsx` та інші                     | решта коду ЛР-7                                                                                                      |
   | `src/index.css`                                                         | усі стилі, зокрема вкладок: `.tabs`, `.tab-list`, обрана вкладка — клас `.active` або атрибут `aria-selected="true"` |
   | `tests/`                                                                | тести Vitest, по файлу на challenge, і `setup.js`, як у ЛР-7                                                         |

7. `npm run lint` у теці `lab-8/` показує одну **помилку**, у `TimerView.jsx`.
   Не виправляйте її зараз: це частина §4.6.
8. Зробіть коміт у корені репозиторію: так до нього потрапить і
   `package-lock.json`.

   ```bash
   git add .
   git commit -m "chore: add lab 8 starter"
   ```

Далі шляхи до файлів (`src/components/Tabs.jsx`) — відносно `lab-8/`.
**Файли в `tests/` не змінюйте в жодному коміті**: тести — це умова задачі.
Після кожного challenge зробіть коміт, щойно його тести пройшли.

### 4.2. Правила роботи з AI

**AI пояснює, але не пише код.** Можна попросити пояснити поняття,
повідомлення тесту чи помилку ESLint. Не можна просити написати компонент чи
HOC — ні цілком, ні «підказкою» з готовим кодом. Агент у редакторі
використовуйте в режимі без редагування (ask / plan).

### 4.3. Вкладки: вміст через `children`, стан через контекст

Відкрийте `ProductTabs.jsx`. Компонент працює, але має три вади. Подивіться на
кожну, перш ніж починати:

1. Запустіть таймер «Пуровер V60», перейдіть на «Відгуки» й поверніться:
   таймер знову показує 3:00. `{tab === 'brew' && …}` прибирає розділ зі
   сторінки, а разом із ним і стан таймера.
2. `ProductTabs` сам імпортує три розділи. Для інших вкладок, наприклад
   «Опис» і «Доставка», довелося б писати ще один такий компонент.
3. React DevTools → **Profiler** → ⏺ (Start profiling), перемкніть вкладки
   кілька разів, ⏹. Подивіться, які компоненти рендерилися під час кожного
   перемикання.

Ви вже передавали вміст між тегами компонента в ЛР-2: `Card` показував те, що
отримав у пропсі `children`. Тепер обгортка має власний стан: `Tabs` пам'ятає,
яку вкладку обрано, а вміст вкладок створює `App` і передає між тегами.
Частини `Tabs` (вкладка, панель) теж мають знати, яку вкладку обрано, але
`Tabs` не може передати їм це пропсом напряму: їх створює не `Tabs`, а `App`.
Тут допоможе
**контекст**: `Tabs` надає свій стан через `<TabsContext value={…}>`, а
частини читають його через `use(TabsContext)`. Компонент із частинами, які
працюють разом і ділять спільний стан, називають **складеним** (compound
component), як `<select>` і `<option>` в HTML.

**Що має вийти.** `App` описує вкладки так:

```jsx
<Tabs defaultValue="brew">
  <Tabs.List aria-label="Про каву">
    <Tabs.Tab value="brew">Заварювання</Tabs.Tab>
    <Tabs.Tab value="reviews">Відгуки ({reviews.length})</Tabs.Tab>
    <Tabs.Tab value="related">Схожі товари</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel value="brew">
    <BrewGuide methods={brewMethods} />
  </Tabs.Panel>
  <Tabs.Panel value="reviews">
    <ReviewList reviews={reviews} />
  </Tabs.Panel>
  <Tabs.Panel value="related">
    <RelatedProducts products={related} />
  </Tabs.Panel>
</Tabs>
```

- Сторінка перемикається, як раніше, але вкладки побудовані зі складеного
  компонента `Tabs` з частинами `Tabs.List`, `Tabs.Tab` і `Tabs.Panel`.
  Кожна частина отримує свій вміст як `children`: у `Tabs.Panel` може бути
  будь-який JSX. `ProductTabs.jsx` видалено.
- `Tabs` зберігає обрану вкладку (спочатку — `defaultValue`) і передає її
  частинам через контекст. Жодна частина не отримує її пропсом.
- Схована панель лишається на сторінці разом зі своїм станом: таймер,
  запущений на «Заварюванні», іде далі, поки відкрита інша вкладка. Сховати
  елемент, не прибираючи його зі сторінки, можна атрибутом `hidden`.
- Перемикання вкладок не рендерить вміст панелей знову.
- `Tabs.Tab` чи `Tabs.Panel` поза `<Tabs>` кидає помилку, у тексті якої є
  `<Tabs>`: так той, хто використовує компонент неправильно, одразу бачить
  чому.
- З `Tabs.jsx` експортується лише `Tabs`. Контекст і функції, які його
  читають, лишаються всередині файлу.

**Що вже є.** Заготовка `src/components/Tabs.jsx` з прикладом у коментарі;
`ProductTabs` з розміткою, яку можна взяти за основу; стилі `.tabs` для
обгортки, `.tab-list` для ряду вкладок і `.active` для обраної вкладки.

**Код:** `src/components/Tabs.jsx`, `src/App.jsx`; видаліть
`src/components/ProductTabs.jsx`.

**Перевірка.**

- `npm test -- tests/Tabs.children`: 8 тестів з 8. Тести шукають вкладки за
  текстом: ролей і клавіатури вони поки не вимагають, це §4.4.
- У браузері запустіть таймер, перейдіть на «Відгуки», зачекайте кілька секунд
  і поверніться: таймер іде далі.
- **Profiler**, як на початку: перемкніть вкладки й порівняйте з тим, що
  рендерилося в `ProductTabs`. Що саме змінилося й чому, вас запитають на
  захисті.

**Коміт:** `feat: pass the tab content to Tabs as children` (`feat`, а не
`refactor`: таймер більше не скидається).
**Довідка:** [Передача JSX як children](https://uk.react.dev/learn/passing-props-to-a-component#passing-jsx-as-children),
[State is tied to a position in the render tree](https://uk.react.dev/learn/preserving-and-resetting-state#state-is-tied-to-a-position-in-the-tree),
[The Children Prop Pattern in React](https://www.craftvalue.io/blog/react-children-prop-pattern),
[Step 1: Create the context](https://uk.react.dev/learn/passing-data-deeply-with-context#step-1-create-the-context),
[Step 2: Use the context](https://uk.react.dev/learn/passing-data-deeply-with-context#step-2-use-the-context),
[Step 3: Provide the context](https://uk.react.dev/learn/passing-data-deeply-with-context#step-3-provide-the-context),
[Reading context with `use`](https://uk.react.dev/reference/react/use#reading-context-with-use),
[Compound Pattern](https://www.patterns.dev/react/compound-pattern),
[`hidden`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/hidden).

### 4.4. Доступні вкладки за ARIA APG

Після §4.3 вкладки — звичайні кнопки. Мишею ними користуватися зручно, але
програма зчитування з екрана не знає, що це вкладки, яку з них обрано й де її
вміст, а клавішею Tab доводиться проходити всі вкладки по черзі. Як мають
поводитися вкладки, описує W3C ARIA Authoring Practices Guide (APG): ролі,
атрибути й клавіші. Тести цього завдання перевіряють його шаблон Tabs.

**Що має вийти.**

Ролі й атрибути:

- `Tabs.List` має роль `tablist` і назву: на сторінці товару це
  `aria-label="Про каву"`, який `App` передає в `Tabs.List`.
- Кожна `Tabs.Tab` має роль `tab`, атрибут `aria-selected` (`true` лише в
  обраної вкладки) і `aria-controls` з `id` своєї панелі.
- Кожна `Tabs.Panel` має роль `tabpanel`, `aria-labelledby` з `id` своєї
  вкладки й `tabIndex={0}`.
- Усі `id` унікальні, навіть коли на сторінці два `Tabs` з однаковими
  `value`.

Клавіатура (автоматична активація):

- Клавіша Tab заходить у список вкладок на обрану вкладку, оминаючи інші, а
  наступний Tab переходить до панелі. APG називає цей прийом roving
  tabindex.
- → і ← переводять фокус на наступну чи попередню вкладку й одразу обирають
  її. З останньої вкладки → веде на першу, з першої ← — на останню.
- Home і End переводять фокус на першу й останню вкладки й обирають їх.

Автоматична активація (вкладку обрано, щойно на неї перейшов фокус) доречна
тут, бо вміст усіх панелей уже на сторінці: саме в такому разі APG її радить.

**Що вже є.** `Tabs` з §4.3; стилі обраної вкладки для
`[aria-selected='true']` і рамки фокусу для `[role='tabpanel']`. Клас
`.active` після цього завдання не потрібен.

**Код:** `src/components/Tabs.jsx`.

**Перевірка.**

- `npm test -- tests/Tabs.a11y`: 10 тестів з 10; `npm test -- tests/Tabs`
  запустить обидва файли вкладок: 18 з 18.
- Клавіатурою: клацніть по ціні товару й натискайте Tab. Після «Додати в
  кошик» фокус переходить на обрану вкладку, далі — на панель, далі — у її
  вміст. Поверніться на вкладку (Shift+Tab) і спробуйте →, ←, Home і End.
- DevTools → **Elements**, виберіть вкладку, панель **Accessibility**: роль
  `tab`, назва й стан обраної вкладки.
- За бажанням: увімкніть Екранний диктор (Windows: `Ctrl+Win+Enter`) або
  VoiceOver (macOS: `Cmd+F5`) і пройдіть вкладки клавіатурою. Програма має
  назвати список «Про каву», вкладку, її номер і чи її обрано.

**Коміт:** `feat: make the tabs accessible`.
**Довідка:** [Tabs Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/),
[Tabs with Automatic Activation](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/examples/tabs-automatic/),
[Generating unique IDs for accessibility attributes](https://uk.react.dev/reference/react/useId#generating-unique-ids-for-accessibility-attributes),
[Generating IDs for several related elements](https://uk.react.dev/reference/react/useId#generating-ids-for-several-related-elements),
[`tabindex`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/tabindex),
[`KeyboardEvent.key`](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key).

### 4.5. Компонент вищого порядку `withAnalytics`

Маркетологи хочуть знати, як користуються сторінкою. `src/analytics.js` має
функцію `track(event, data)`: справжній сервіс аналітики надіслав би подію на
сервер, а ця пише її в Console. Подію треба надсилати з кількох кнопок, і
кожна вже має свій `onClick`. Дописувати `track` у кожен обробник — це
дублювання, і про нього легко забути в новій кнопці.

**Компонент вищого порядку** (higher-order component, HOC) — функція, яка
отримує компонент і повертає новий, з додатковою поведінкою. Назва HOC за
домовленістю починається з `with`.

**Що має вийти.**

- `withAnalytics(Component, event)` повертає новий компонент, який рендерить
  `Component` з тими самими props. Під час кліку він викликає
  `track(event, analyticsData)`, а потім `onClick`, переданий ззовні, якщо
  такий є.
- `analyticsData` — проп самої обгортки: він потрапляє в `track`, але не в
  DOM.
- Решта props і `ref` доходять до обгорнутого компонента. У React 19 `ref` —
  звичайний проп функціонального компонента, тож `forwardRef` не потрібен.
- Новий компонент має `displayName` з назвою обгорнутого компонента в
  дужках: `withAnalytics(Button)` для `Button`. З такою назвою React згадує
  його в повідомленнях про помилки, а React DevTools показує
  `withAnalytics(Button)` як `Button` з позначкою `withAnalytics`.
- «Додати в кошик» у `ProductCard` проходить через `withAnalytics` і надсилає
  подію `add_to_cart` з даними `{ productId }`, а «У кошику: N» рахує, як
  раніше.

**Що вже є.** Заготовка `src/hoc/withAnalytics.jsx` з прикладом у коментарі:
поки вона повертає `Component` без змін; `Button`; `track`; кнопка «Додати в
кошик» без аналітики.

**Код:** `src/hoc/withAnalytics.jsx`, `src/components/ProductCard.jsx`.

**Перевірка.**

- `npm test -- tests/withAnalytics`: 6 тестів з 6. Ці тести підміняють
  `analytics.js` (`vi.mock`) і перевіряють, з якими аргументами викликано
  `track`.
- У браузері відкрийте DevTools → **Console** і натисніть «Додати в кошик»:
  з'явиться рядок `[analytics] add_to_cart {productId: 'ethiopia-yirgacheffe'}`,
  а в картці — «У кошику: 1».
- **Components ⚛** → `ProductCard`: усередині — `Button` з позначкою
  `withAnalytics`, а в ньому — `Button` без позначки, обгорнутий компонент.
- Тести з `TimerView.test.jsx` після цього завдання падають, зокрема й той,
  що досі проходив. Не виправляйте їх зараз: це §4.6.

**Коміт:** `feat: track clicks with the withAnalytics HOC`.
**Довідка:** [HOC Pattern](https://www.patterns.dev/react/hoc-pattern),
[Higher-Order Components in React Hooks era](https://www.developerway.com/posts/higher-order-components-in-react-hooks-era),
[`ref` as a prop](https://react.dev/blog/2024/12/05/react-19#ref-as-a-prop),
[Vitest: `vi.mock`](https://vitest.dev/api/vi#vi-mock).

### 4.6. Кнопка таймера, яка втрачає фокус

Після §4.5 запустіть таймер з клавіатури: клавішею Tab дійдіть до «Старт»
таймера «Пуровер V60» і натисніть Enter. Наприкінці ЛР-7 фокус лишався на
першій кнопці, і тим самим Enter таймер ставав на паузу. Спробуйте зараз.
Де фокус, покаже `document.activeElement` у Console. Подивіться й на рядки
`[analytics]` від кнопок таймера. Ви не змінювали `TimerView` у цій роботі,
але поводиться він інакше, ніж у стартовому проєкті.

**Що має вийти.**

- Людина, яка запустила таймер клавішею Enter, тим самим Enter ставить його
  на паузу: перша кнопка таймера не втрачає фокус, поки таймер іде.
- Перша кнопка й далі надсилає подію через `withAnalytics`. Подія одна,
  `timer_control`, з даними `{ method, action }`: `method` — `id` способу
  заварювання (`'v60'`), а `action` — `'start'`, `'pause'`, `'resume'` або
  `'restart'`, залежно від того, що робить кнопка. Спосіб і дія — у даних
  події, а не в її назві: звіти аналітики групують події за назвою.
- `npm run lint` — без помилок і попереджень.

**Що вже є.** `TimerView`, у якому перша кнопка проходить через
`withAnalytics`, і помилка ESLint у ньому з §4.1. Тест ««Пауза» не втрачає
фокус, поки таймер іде» проходив у стартовому проєкті, бо заготовка HOC
повертала `Button` без змін. Після §4.5 він падає, а після цього завдання має
пройти знову.

**Код:** `src/components/TimerView.jsx`.

**Перевірка.**

- `npm test -- tests/TimerView`: 4 тести з 4; `npx vitest run`: 28 тестів з
  28; `npm run lint`: без помилок і попереджень.
- Клавіатурою: Tab до «Старт», Enter, зачекайте кілька секунд, Enter. Таймер
  на паузі, а рамка фокусу весь час на першій кнопці.
- **Console**: `[analytics] timer_control {method: 'v60', action: 'start'}`,
  потім те саме з `action: 'pause'`.

**Коміт:** `fix: keep the timer button focused`.
**Довідка:** [Different components at the same position reset state](https://uk.react.dev/learn/preserving-and-resetting-state#different-components-at-the-same-position-reset-state),
[`static-components`](https://react.dev/reference/eslint-plugin-react-hooks/lints/static-components),
[`document.activeElement`](https://developer.mozilla.org/en-US/docs/Web/API/Document/activeElement).

### 4.7. Перевірки, GitHub і Vercel

1. Зупиніть dev-сервер і Vitest (`Ctrl+C` і `q`) і виконайте в `lab-8/`:

   ```bash
   npx vitest run
   npm run lint
   npm run format:check
   npm run build
   ```

   `npx vitest run` виконує тести один раз: 28 з 28. Решта команд має пройти
   без помилок, а `npm run lint` — ще й без попереджень (`warning`). Якщо
   `format:check` назве файл, відкрийте його, збережіть ще раз і закомітьте:
   `style: format lab 8 files`.

2. Перевірте історію: у корені `git log --oneline -- lab-8/tests` має
   показати лише коміт стартового проєкту. Відправте коміти на GitHub:
   `git push`. Історія комітів роботи:

   1. `chore: add lab 8 starter`;
   2. `feat: pass the tab content to Tabs as children`;
   3. `feat: make the tabs accessible`;
   4. `feat: track clicks with the withAnalytics HOC`;
   5. `fix: keep the timer button focused`.

3. На [vercel.com](https://vercel.com) → **Add New → Project** ще раз
   імпортуйте `react-labs`: це буде ще один проєкт з того самого репозиторію.
   Перед **Deploy** налаштуйте:

   | Поле             | Значення                         |
   | ---------------- | -------------------------------- |
   | Project Name     | `react-lab-8`                    |
   | Root Directory   | **Edit** → `lab-8`               |
   | Framework Preset | Vite (Vercel розпізнає його сам) |
   | Output Directory | `dist`                           |

   Vercel виконує лише `npm run build`: тести там не запускаються.

4. Після деплою скопіюйте адресу застосунку з вкладки **Overview** проєкту,
   поле **Domains**, відкрийте її, запустіть таймер і перемкніть вкладки.

## 5. Вимоги до звіту

**Тема листа:**

```
[React] ЛР-8: children, складені компоненти й HOC
```

У листі вкажіть теку лабораторної на GitHub і адресу застосунку на Vercel:

```
GitHub repository: https://github.com/<username>/react-labs/tree/main/lab-8
Vercel: https://<project>.vercel.app/
```

Звіт повинен містити:

1. знімок екрана `npx vitest run`: 28 тестів з 28;
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

_`children` як проп_

- Що таке `children`? Звідки береться цей проп? Де ви передавали JSX між
  тегами до цієї роботи?
- Чому перемикання вкладок не рендерить `BrewGuide` і `ReviewList` знову, хоча
  стан `Tabs` змінився? Що показав Profiler і як це перевіряє тест?
- Що рендерилося під час перемикання в `ProductTabs` і чому?
- Коли вміст не можна просто передати як `children`? Що робити тоді?
- Чим `children` відрізняється від кількох пропсів із JSX (слотів), наприклад
  `<Card header={…} footer={…}>`? Коли що зручніше?
- Чому провайдер контексту отримує решту застосунку як `children`?

_Складені компоненти_

- Що таке складений компонент? Які приклади є в HTML?
- Порівняйте `Tabs` з частинами й API з масивом об'єктів:
  `<Tabs tabs={[{ label, content }]} />`. Як у кожному з них додати лічильник
  у назву вкладки чи розмітку між вкладками й панелями?
- Як частини `Tabs` дізнаються, яку вкладку обрано?
- Навіщо `Tabs.Tab` поза `<Tabs>` кидає помилку? Що сталося б без неї?
- Чим запис `Tabs.Tab` відрізняється від окремих іменованих експортів
  (`TabsTab`)? Які переваги й недоліки кожного?
- Що таке `defaultValue`? Що довелося б змінити, щоб обраною вкладкою керував
  батьківський компонент?

_Контекст_

- Що роблять `createContext`, провайдер і `use`? Чим `use` відрізняється від
  `useContext`?
- Чому контекст не експортується з `Tabs.jsx`? Що скаже ESLint, якщо його
  експортувати?
- Які компоненти рендеряться знову, коли змінюється значення контексту?
- Контекст `Tabs` бачать лише його частини. Чим це відрізняється від
  контексту для всього застосунку, наприклад для теми оформлення?
- Чому складені компоненти рідко будують на `Children` і `cloneElement`? Що
  станеться, якщо загорнути `Tabs.Tab` у `<div>`?

_Доступні вкладки_

- Які ролі й атрибути мають вкладки за APG? Навіщо кожен?
- Навіщо `id` з `useId`, а не лише з `value`? Що перевіряє тест із двома
  `Tabs`?
- Що таке roving tabindex? Чому необраних вкладок немає в порядку Tab?
- Чим автоматична активація відрізняється від ручної? Коли APG радить ручну?
- Навіщо панелі `tabIndex={0}`?
- Чим атрибут `hidden` відрізняється від того, щоб не рендерити панель? Що це
  означало для таймера в `ProductTabs`?
- Навіщо в панелях лишилися заголовки `<h2>`, хоча назва вже є на вкладці?
- Як ви перевіряли вкладки без миші? Що оголошує програма зчитування з екрана?

_HOC_

- Що таке компонент вищого порядку? Чим він відрізняється від звичайного
  компонента?
- Які HOC є в React і бібліотеках? Що роблять `memo`, `connect` з React Redux,
  `observer` з MobX?
- Навіщо `displayName`? Що показав би React DevTools без нього?
- Чому `analyticsData` не має потрапити в DOM? Що зробив би React, якби
  потрапив?
- Що таке колізія props у HOC? Що станеться, якщо обгорнутий компонент сам
  чекає проп `analyticsData`?
- Як `ref` доходить до кнопки через HOC у React 19? Навіщо раніше був
  `forwardRef`?
- Що покаже React DevTools, якщо загорнути компонент у три HOC? Що таке
  «wrapper hell»?

_Коли HOC шкодить_

- Що сталося з кнопкою таймера після §4.5? Чому губився фокус?
- Що означає помилка ESLint `react-hooks/static-components`? Які способи
  виправлення ви пробували, і чи всі вони задовольнили ESLint?
- Чому тест про фокус проходив у стартовому проєкті, хоча код `TimerView` уже
  тоді був таким самим?
- Чому назва події стала (`timer_control`), а дія — у даних?

_HOC чи хук_

- Як виглядала б та сама аналітика як хук? Що він приймав би й повертав?
- Коли HOC досі зручніший за хук?
- Чому після появи хуків HOC трапляються рідше? Що спільного в HOC і render
  props з ЛР-7?
- Які з патернів ЛР-7 і ЛР-8 ви найчастіше бачитимете в сучасному коді й
  чому?

_Тести_

- Як тест перевіряє, що перемикання вкладок не рендерить вміст панелей знову?
- Навіщо тести `withAnalytics` підміняють `analytics.js` через `vi.mock`? Що
  перевіряє `toHaveBeenCalledWith`?
- Як тести знаходять вкладки в §4.3 і в §4.4? Чому тести §4.4 шукають їх за
  роллю (`getByRole('tab', { name: 'Перша' })`)?
- Що робить `user.keyboard('{ArrowRight}')`?

## 7. Критерії готовності

Лабораторна робота оцінюється в 1 бал після захисту (§6).

| Критерій   | Мінімальна вимога                                                                                                                                                                                            |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Тести      | у теці `lab-8` `npx vitest run` проходить: 28 з 28; файли в `tests/` не змінено в жодному коміті                                                                                                             |
| Якість     | `npm run lint` без помилок і попереджень (помилку стартового проєкту виправлено), `format:check` і `build` — без помилок                                                                                     |
| Вкладки    | `Tabs` з частинами `Tabs.List`, `Tabs.Tab`, `Tabs.Panel`; вміст через `children`, спільний стан через контекст; ролі й клавіатура за APG; з `Tabs.jsx` експортується лише `Tabs`; `ProductTabs.jsx` видалено |
| HOC        | `withAnalytics` у `src/hoc/`; «Додати в кошик» і перша кнопка таймера надсилають події через нього                                                                                                           |
| GitHub     | коміт стартового проєкту й по одному коміту на кожен challenge (§4.7)                                                                                                                                        |
| На занятті | усі коміти відправлено на занятті (час `git push` видно в **Activity** репозиторію); challenges, не завершені на занятті, — на відпрацюванні, як пропущене заняття                                           |
| Vercel     | проєкт з Root Directory `lab-8`; адреса показує сторінку з останнього коміту `main`                                                                                                                          |
| AI         | §4.2 дотримано; у звіті вказано, чи використовувався AI і як                                                                                                                                                 |
| Звіт       | усі пункти §5                                                                                                                                                                                                |

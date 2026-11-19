# Plan: React ЛР-11 «Управління станом: useReducer для роботи зі складними структурами даних»

Status: settled on 2026-11-19. That day the instructor settled the shape
(decisions 1–4 under **Decisions**): a new screen in the café world, a
barista's order queue; ЛР-12 reuses the app; besides moving state into a
reducer and making a reducer pure, the lab covers normalization, undo and
redo through a higher-order reducer, and Immer; the format is ЛР-7's code
challenges with an optional +1 task. After the plan's review the same day,
the instructor confirmed the proposed decisions 5–17 and added 18–22 from
the review's changes. A prototype of the reducers and the
kinds of tests the lab needs was built and checked the same day (see
**Verification**). It lives in the gitignored `solution/` folder next to
this file, with the instructor's notes on the seeded defects. The lab is not
built yet. Once it is, what was built, what was verified and where the
build differs from this plan go into this folder's `README.md`, and this
file stays as the plan the lab was built from.

The challenge format, the test tooling and the AI rule come from ЛР-7. Its
plan, [../lab-7/custom-hooks-and-render-props-plan.md](../lab-7/custom-hooks-and-render-props-plan.md),
holds them, and this plan names only what ЛР-11 changes.

## Context

From [../course-plan.md](../course-plan.md), row 2.7:

- **Тема:** «Управління станом: useReducer для роботи зі складними
  структурами даних»
- **Самостійна робота:** «Проєктування ред’юсерів» (2 год.)
- **Читання:** Основна 1 (react.dev) and 4 (Robin Wieruch, *The Road to
  React*)
- **Position:** after ЛР-10 and before ЛР-12 («Глобальний стан за допомогою
  Context API та вирішення проблеми Prop Drilling»). Lecture 4 (row 2.5)
  comes before ЛР-10, so presentation topic П4.2 «`useReducer` разом із
  Context» is defended before this lab, and П3.7 (state reducer and control
  props) at Lecture 3. No lecture names useReducer, as the course plan's
  **Notes for building the course** already say; no deck is built yet, so
  the readings carry the topic, as in every lab so far.

What earlier labs left for this one:

- **ЛР-4–6 used `useState` for everything,** including ЛР-6's booking form.
  ЛР-6's `useActionState` already took a function of the shape
  `(previousState, payload) => nextState`, so the reducer's signature isn't
  new.
- **ЛР-5 and ЛР-6 built an accessible form** (labels, a `fieldset` with a
  `legend` for the guests stepper), and ЛР-7's «Помел» was a radio group in
  a `fieldset`. The new order form follows them, and its markup is given.
- **ЛР-7's given tests and `vi.mock(path, { spy: true })`** check that a
  component uses a function without fixing how. ЛР-7's `useCountdown` was a
  debugging challenge; §4.4 is another one.
- **ЛР-8's higher-order component** (`withAnalytics`) is the model for
  §4.6's higher-order reducer: a function that takes a reducer and returns
  one.
- **ЛР-10's cart is an external store** read through
  `useSyncExternalStore`. This lab keeps state inside React instead, which
  ЛР-12 then shares through context.

### What the lab is for

A reducer earns its place when several pieces of state change together or
when the data is nested. The lab practises the four things that make that
work, each in one challenge on one page:

1. **From `useState` to `useReducer`** (§4.3): a form whose nested state is
   updated by seven handlers becomes one reducer with actions named as
   events, and a value kept in its own state becomes a value computed during
   render.
2. **Purity and immutability** (§4.4): a colleague's reducer that works in
   production and misbehaves in development, where `<StrictMode>` calls
   every reducer twice.
3. **Normalization** (§4.5): the same customer stored inside each of their
   orders becomes one record that orders point to, and the queue becomes
   `byId` plus `ids`.
4. **A higher-order reducer** (§4.6): `withUndo(reducer)` adds undo and redo
   to the queue without changing the queue's reducer.

Immer is the +1 task (§4.8): the same form reducer written with `produce`,
with the same tests passing. A reducer as a state machine (allowed status
transitions) was offered and not chosen (decision 3); it is out of scope.

**ЛР-12 continues this app** (decision 2). In ЛР-11 the queue's reducer
lives in `App`, and its state and `dispatch` reach the cards, the details
and the history buttons as props; the form's draft stays in `OrderComposer`,
the only component that reads it. ЛР-12's plan decides how that changes;
ЛР-11 doesn't use context, even where react.dev's next page would.

### The readings

Checked on 2026-11-19. All are in English except one: `uk.react.dev`
serves react.dev's reducer, state-structure, `useReducer` and `<StrictMode>`
pages in English, but **Updating Arrays in State** in Ukrainian («Оновлення
масивів у стані»). The anchors keep their English ids in both languages.
§2 says so next to that link.

| Page | Date | Use |
| --- | --- | --- |
| react.dev: [Extracting State Logic into a Reducer](https://uk.react.dev/learn/extracting-state-logic-into-a-reducer) | current | before class. `#consolidate-state-logic-with-a-reducer` (the three steps), `#writing-reducers-well` (pure; «Each action describes a single user interaction, even if that leads to multiple changes in the data»), `#comparing-usestate-and-usereducer`, `#writing-concise-reducers-with-immer` (§4.3, §4.8) |
| react.dev: [Choosing the State Structure](https://uk.react.dev/learn/choosing-the-state-structure) | current | before class. The five principles; `#avoid-redundant-state` (§4.3), `#avoid-duplication-in-state` and `#avoid-deeply-nested-state` (§4.5) |
| react.dev: [Updating Arrays in State](https://uk.react.dev/learn/updating-arrays-in-state) | current | `#updating-objects-inside-arrays`: copying the path to a changed object (§4.3, §4.4) |
| react.dev: [`useReducer`](https://uk.react.dev/reference/react/useReducer) | current | `#avoiding-recreating-the-initial-state` (the initializer, with `null` when it needs no argument: the starter's `App`, §4.5, §4.6); the troubleshooting section only as a hint (see **Timing**, cut 3) |
| react.dev: [`<StrictMode>`](https://uk.react.dev/reference/react/StrictMode) | current | `#fixing-bugs-found-by-double-rendering-in-development`: which functions React calls twice in development, reducers included (§4.4) |
| Redux: [Style Guide](https://redux.js.org/style-guide/) | current | the rules with their priority: `#do-not-mutate-state` and `#reducers-must-not-have-side-effects` (Essential; §4.4), `#model-actions-as-events-not-setters` (§4.3), `#normalize-complex-nestedrelational-state` (§4.5). The rules hold for `useReducer` as they do for Redux |
| Redux: [Normalizing State Shape](https://redux.js.org/usage/structuring-reducers/normalizing-state-shape) | current | `byId`, `allIds`, references by id, why nesting hurts (§4.5) |
| Redux: [Implementing Undo History](https://redux.js.org/usage/implementing-undo-history) | current | `past`, `present`, `future`; «A reducer enhancer (or a higher order reducer) is a function that takes a reducer, and returns a new reducer…» (§4.6). Its examples use Redux's store, but the enhancer is a plain function, and §4.6 uses it with `useReducer` |
| Kent C. Dodds: [Should I useState or useReducer?](https://kentcdodds.com/blog/should-i-usestate-or-usereducer) | 2020-03-09 | before class or for the defence: «When one element of your state relies on the value of another element of your state in order to update: `useReducer`»; its `useUndo` example (§4.6) |
| Immer: [React & Immer](https://immerjs.github.io/immer/example-setstate) (`#usereducer--immer`, `#useimmerreducer`), [Curried producers](https://immerjs.github.io/immer/curried-produce), [Update patterns](https://immerjs.github.io/immer/update-patterns) | Immer 11 | §4.8 only |

Programme readings: Основна 1 is react.dev, above. Основна 4, Wieruch's
*The Road to React*, is a paid book; his free article
[How to useReducer in React](https://www.robinwieruch.de/react-usereducer-hook/)
(2019) toggles one boolean in a two-item list, too little for this lab, so
§2 names the book without linking the article.

**Considered, not used:**

- **David Khourshid, «No, disabling a button is not app logic»** (2019). A
  reducer with a `status` field as a state machine; it fits the topic the
  instructor didn't choose.
- **react.dev, Scaling Up with Reducer and Context.** It's ЛР-12's reading.
- **refine.dev's patterns article,** for the reason ЛР-7's plan gives: its
  reducer's `default` returns `undefined`.

## The app: «Черга замовлень»

The café world continues: ЛР-3–4 were the menu, ЛР-5–6 the table booking,
ЛР-7–8 the coffee-bean page and ЛР-10 the shop. ЛР-11 moves behind the
counter: one page where a barista takes orders and works through them.

**Layout** (one page, no router, Ukrainian):

- **«Нове замовлення»** (the form, left on a wide screen, first on a phone):
  «Ім'я гостя»; a button per drink («+ Еспресо», «+ Американо», «+ Капучино»,
  «+ Лате», «+ Флет вайт», «+ Какао»); each added drink as a row with
  «Розмір» (S, M, L as a radio group in a `fieldset`), «Молоко» (a `select`:
  звичайне, вівсяне, без молока), «Сиропи» (checkboxes: ваніль, карамель,
  лісовий горіх) and «Видалити»; «Разом: N грн»; «Надіслати бариста»,
  disabled without a name or a drink.
- **The queue:** four columns, «Нові», «Готуються», «Готові», «Видані», each
  headed with its count («Готові (2)»). A card per order: «№ 41 · Оля», its
  drinks as checkboxes the barista ticks when a drink is made, the button
  for the next step («Почати», «Готово», «Видати»), «Скасувати замовлення»
  in the first two columns, and «Деталі».
- **«Деталі»:** the opened order with its drinks, and the guest's name in a
  field with «Зберегти», for a barista who misheard it. While the opened
  order isn't in the queue (cancelled, or its placement undone), the panel
  is empty, and it comes back if an undo returns the order: the given
  `OrderDetails` renders nothing for `order === undefined`. The field starts
  from the guest's current name whenever that changes (the given component
  keys it on the order and the name), so an undone rename shows there too.
- **«Скасувати дію» and «Повторити дію»** above the queue, from §4.6.

**Data.** `src/data/menu.js`: the drinks, sizes, milks and syrups with their
prices, each drink's default milk («без молока» for Еспресо and Американо,
«звичайне» for the rest), and `priceOf(item)`. `src/data/orders.js`: six orders, № 41–46,
spread over the four columns, **nested** as a server would send them: each
order holds its customer (`{ id, name }`) and its items. One customer, Оля,
has two orders. No server and no network: the queue starts from this data
on every load. No `localStorage` either, so nothing about saved state gets
in the way of the reducers.

`orders.js` exports a function, `loadOrders()`, that builds a new nested
array on every call. `App` calls it inside `useReducer`'s initializer:
`useReducer(queueReducer, null, () => createInitialState(loadOrders()))`,
with `null` as the argument, as react.dev does for an initializer that needs
none. The orders are then built when `App` mounts, not on every render;
`useReducer(queueReducer, loadOrders(), createInitialState)` would build six
orders on every render and throw them away, which is what
`#avoiding-recreating-the-initial-state` warns about. A module-level array
would be shared by every render in a test file, so a reducer that mutates its state would carry one test's changes
into the next and make failures depend on test order. That happened in the
prototype until each test re-imported the modules.

**Two reducers,** which is what makes the lab more than one refactor:

| Reducer | Starter | Challenge |
| --- | --- | --- |
| the form's draft: `{ customerName, items: [{ id, drink, size, milk, syrups }] }` (a name, so it isn't confused with an order's `customer` object) | not there yet: `OrderComposer` keeps the draft in several `useState` | §4.3 writes `draftReducer`; §4.8 (+1) rewrites it with Immer |
| the queue: orders with their customers and items | `App` already calls `useReducer(queueReducer, null, () => createInitialState(loadOrders()))`; the reducer is a colleague's, with seeded defects | §4.4 makes it pure, §4.5 normalizes its state, §4.6 wraps it in `withUndo` |

The queue's actions are part of the starter's API, named as events in the
reducer's JSDoc: `order_placed`, `item_toggled`, `order_advanced` (the
barista pressed the card's next-step button), `order_cancelled`,
`customer_renamed`. The form's are in `draftReducer`'s stub:
`customer_changed`, `drink_added`, `size_chosen`, `milk_chosen`,
`syrup_toggled`, `item_removed`, `draft_cleared`. Ids for new items, orders
and customers come with the action, created in the event handler.

**Selectors are the queue's API to the page.** The starter's
`src/model/queueReducer.js` exports `selectColumn(state, status)` (the
orders of one column, in arrival order, each with its customer and items)
and `selectOrder(state, id)`. Components and tests read the queue only
through them. That's what lets §4.5 change the shape of the state without
touching a component, and without breaking §4.3's and §4.4's tests.

Every challenge starts from something wrong in the page:

| What the starter does | Challenge | Topic |
| --- | --- | --- |
| the form's draft lives in several `useState`; seven handlers copy nested objects by hand, and «Разом» goes wrong after some edits | §4.3 | `useReducer`, actions as events, derived values |
| the queue misbehaves in `npm run dev`; the same build works in `npm run preview` | §4.4 | pure reducers, immutable updates, StrictMode |
| renaming Оля in «Деталі» renames her on one order only; «Деталі» shows stale drinks after a tick on the board | §4.5 | duplication, normalization (`byId` + `ids`), selection by id |
| a barista who pressed «Видати» by mistake can't take it back | §4.6 | a higher-order reducer, history |

**Size:** about 16 files in `src/`, in folders by file type
(`components/`, `model/`, `data/`): a one-page app, which is where ЛР-10
left by-type structures. `model/` is the name FSD gives the segment for
state, so it reads the same to a student who prefers FSD.

## The challenges

Students do §4.3 → §4.6 in order, one commit each, and nothing in `tests/`
changes in any commit, as in ЛР-7. Each challenge in the handout has ЛР-7's
parts: **Що має вийти**, **Що вже є**, **Код**, **Перевірка** and
**Довідка**, plus **Рішення** where the challenge leaves a real choice. The
rules below are the test names; the tests ship in the starter, so listing
them gives nothing away. Test files are named after the unit they test, and
`npm test -- tests/<Name>` runs one file.

### §4.3. `draftReducer`: the form from `useState` to `useReducer`

**Що має вийти.** The form works as before, and «Разом» is always right.
`OrderComposer` gets the draft from `useReducer(draftReducer, emptyDraft)`;
each handler dispatches one action from the stub's list; «Разом» is
computed from the draft during render with `priceOf`, not stored. Sending
the order calls `onPlace` with the order and then clears the form with
`draft_cleared`.

**Що вже є.** The stub `src/model/draftReducer.js` with `emptyDraft`,
deep-frozen, and the seven actions in JSDoc (type and payload);
`OrderComposer` on `useState`; `menu.js` with `priceOf`. `emptyDraft` is
`useReducer`'s initial state and what `draft_cleared` returns, so a reducer
that pushed into its `items` would change the shared object and carry drinks
into the next test, as a module-level array of orders would (see **Data**);
frozen, it throws at the first click instead. Immer accepts frozen input, so
§4.8 isn't affected. The handout's intro shows two handlers from the
starter next to two actions, to contrast "set the items to…" with "the
barista chose size L" (react.dev's step 1).

**Tests** (`tests/draftReducer.test.js` and `tests/OrderComposer.test.jsx`,
about 12):

- `drink_added` додає напій розміру M з типовим для нього молоком з меню і
  без сиропів;
- `size_chosen` і `milk_chosen` змінюють лише свій напій;
- `syrup_toggled` додає сироп, а повторно — прибирає;
- `item_removed` прибирає напій; `customer_changed` змінює ім'я;
- `draft_cleared` повертає порожню чернетку;
- невідома дія кидає помилку з назвою дії;
- не змінює стан, який отримав;
- інші напої лишаються тими самими об'єктами;
- `OrderComposer` бере стан з `useReducer` і `draftReducer`;
- «Разом» правильне після будь-яких змін;
- «Надіслати бариста» додає замовлення в «Нові» й очищає форму.

"Не змінює стан" passes a deep-frozen draft: in an ES module, assigning to
a frozen object throws a `TypeError` that names the property (checked).
"Тими самими об'єктами" checks with `toBe` that an update copies only the
path to the changed drink. The component test spies on the module, as
ЛР-7 did for hooks (checked with `useReducer`).

### §4.4. A pure queue reducer: a bug hunt

**Що має вийти.** In `npm run dev` the queue behaves as it does in
production: a ticked drink stays ticked, new orders get the next numbers in
a row, «Скасувати замовлення» removes that order only, and a cancelled
order's number never goes to a new one. `queueReducer` is pure: it doesn't
change the state it gets and gives the same result for the same state and
action.

**Що вже є.** The colleague's reducer and the page that uses it. The
handout's intro says the queue "works for the colleague": students compare
`npm run dev` with `npm run build && npm run preview` before reading the
code. ESLint reports nothing in this file (checked; see **ESLint in this
lab**), and the handout says so, so students don't wait for a hint from the
linter. The defects, their symptoms and their causes are in
`solution/README.md`; the handout lists only the expected behaviour.

**Tests** (`tests/queueReducer.test.js` and `tests/OrderBoard.test.jsx`,
about 7; the page tests render `<App />` inside `<StrictMode>`, as every
page test does; see **What the tests check**):

- не змінює стан, який отримав, за жодної дії;
- той самий стан і та сама дія дають той самий результат;
- новому замовленню дістається номер, наступний після найбільшого;
- номер скасованого замовлення не дістається новому;
- відмічений напій лишається відміченим;
- нові замовлення отримують номери підряд;
- скасування прибирає лише одне замовлення.

The page tests fail on the seeded reducer only because of `<StrictMode>`:
without it, the same clicks pass (checked on the prototype). That's the
challenge's lesson, and the handout's **Перевірка** asks students to see it
once: take `<StrictMode>` out of the tests' render helper, run the tests,
and put it back with `git restore tests/`, since no commit may change
`tests/`. The first two unit tests call the reducer directly, so they fail
on it with or without StrictMode; the two about numbers guard against a fix
that breaks numbering. Which tests pass on the starter is fixed during the
build. §4.3's page tests render in StrictMode too, but they don't assert
order numbers, so the seeded defects can't make them fail.

### §4.5. Normalized state: one customer, many orders

**Що має вийти.** Renaming Оля in «Деталі» renames her on both orders, and
«Деталі» always shows the order as it is on the board, or nothing once it
is cancelled. The queue's state
gets the shape the handout gives:

```js
{
  orders: {
    byId: { o41: { id, number, status, customerId, items: [...] }, ... },
    ids: ['o41', 'o42', ...],
  },
  customers: {
    byId: { c1: { id: 'c1', name: 'Оля' }, ... },
    ids: ['c1', ...],
  },
  // whatever else §4.4 left in the state
}
```

`createInitialState(orders)` turns the nested data into this shape
(`useReducer`'s initializer calls it, so it runs when `App` mounts, not on
every render);
the reducer's cases and the two
selectors move to it; `App` keeps the opened order's id, not a copy, and
reads the order through `selectOrder`. Items stay inside their order. The
names follow Redux's **Normalizing State Shape** for `byId` and Redux
Toolkit's `createEntityAdapter` for `ids`; Redux's page says `allIds`, and
the handout says so in one line.

**Що вже є.** The pure nested reducer from §4.4; the rename bug and the
stale «Деталі» in the page. The handout's intro names both symptoms and
quotes react.dev's «Avoid duplication in state».

**Рішення** (in the handout, not answered): where a new order's customer
goes in `order_placed`; what `order_cancelled` leaves in `customers`; why
items aren't normalized too.

**Tests** (`tests/queueState.test.js` and `tests/OrderDetails.test.jsx`,
about 10):

- `createInitialState` кладе замовлення в `orders.byId`, а їхній порядок —
  в `orders.ids`;
- кожен гість є в `customers` один раз, а замовлення зберігає лише
  `customerId`;
- напої лишаються всередині замовлення;
- `customer_renamed` змінює одне місце, а `orders` лишаються тим самим
  об'єктом;
- `item_toggled` не створює нових об'єктів для інших замовлень і для гостей;
- `order_cancelled` прибирає замовлення з `byId` і з `ids`;
- `selectColumn` повертає замовлення колонки в порядку надходження, разом із
  гостем;
- перейменування гостя в «Деталях» змінює ім'я на всіх його замовленнях;
- «Деталі» показують зміни, зроблені на дошці;
- «Деталі» порожні, коли відкрите замовлення скасовано.

On the starter, the copy in `App`'s `useState` stays on screen after a
cancel; reading the order through `selectOrder` empties the panel, because
the given `OrderDetails` renders nothing for a missing order.

The shape tests read named paths only (`orders.byId`, `orders.ids`,
`customers.byId`, `customers.ids`, `customerId`), so other keys are the
student's. A "fix" that renames the customer inside every nested order
makes the page right and fails the shape tests; the handout says that the
shape is the requirement, not only the page. All of §4.3's and §4.4's tests
pass after the move unchanged, because they go through the selectors and
the page (checked with the prototype's normalized reducer).

### §4.6. `withUndo`: undo and redo through a higher-order reducer

**Що має вийти.** «Скасувати дію» undoes the last change to the queue and
«Повторити дію» redoes it; each button is disabled when there's nothing to
undo or redo. A new change after an undo drops what could be redone. The
history keeps the last 20 steps. The form isn't part of it: undo doesn't
touch a draft being typed.

`src/model/withUndo.js` exports `withUndo(reducer, limit = 20)`, which
returns a reducer over `{ past, present, future }`, handles `undo` and
`redo`, and passes every other action to `reducer`; and
`createHistory(present)`. `App` uses `withUndo(queueReducer)`, its
initializer wraps the queue's first state in `createHistory`, and it reads
the queue from `present`. An action after which the inner reducer returns the
same state isn't recorded. The reducer `withUndo` returns is pure, like the
queue's: it doesn't change the history it gets, so in `npm run dev` each
step is recorded once.

**Що вже є.** The stub with the API in JSDoc; `HistoryButtons` (given,
props `canUndo`, `canRedo`, `onUndo`, `onRedo`), not yet on the page.

**Рішення:** where `withUndo(queueReducer)` is created; what goes into
history and what stays out (the opened order, the form).

**Tests** (`tests/withUndo.test.js` on a toy counter reducer, and
`tests/HistoryButtons.test.jsx` on the page; about 11):

- `createHistory` починає з порожніх `past` і `future`;
- не змінює історію, яку отримав, ні для дії, ні для `undo` чи `redo`;
- дія потрапляє в історію, `undo` повертає попередній стан;
- `redo` повторює скасовану дію;
- нова дія після `undo` очищає `future`;
- дія, що не змінила стану, не потрапляє в історію;
- `undo` і `redo` без історії повертають той самий стан;
- історія зберігає не більше 20 кроків;
- «Скасувати дію» повертає видане замовлення в «Готові», а «Повторити дію» —
  знову у «Видані»;
- кнопки вимкнені, коли нема чого скасовувати чи повторювати;
- «Скасувати дію» не чіпає форму нового замовлення.

The unit tests use a counter, not the queue, so they show that `withUndo`
works for any reducer, the way ЛР-8's `withAnalytics` worked for any
component. §4.4 is a precondition for §4.6: wrapped around the seeded
reducer, `withUndo` fails where it works around the pure one (checked on
the prototype; what fails is in `solution/README.md`). The defence asks
why.

### §4.8. +1: the form's reducer with Immer

Optional, for 1 point, done in class once §4.1–§4.7 are on GitHub, as
ЛР-10's §4.9.

**Що має вийти.** `immer` in `lab-11`'s dependencies; `draftReducer` written
with Immer's curried `produce`, so its export is still
`(state, action) => nextState`; every test passes unchanged, the deep-frozen
and `toBe` tests included. One commit,
`refactor: write draftReducer with Immer`. The report compares the two
versions in two or three sentences (length, what is easier, what to watch
for).

**Why `produce`, not `use-immer`'s `useImmerReducer`.** The hook takes a
reducer that mutates a draft and returns nothing. §4.3's tests call
`draftReducer(state, action)` directly and expect a new state, so that
contract would break them. The handout says so in one line, and the defence
asks what each choice changes. Immer's React page shows both.

Optionally, the queue reducer's `item_toggled` with Immer too; it isn't
graded.

### §4.9. Самостійна робота (не оцінюється): «Проєктування ред’юсерів»

The programme's item. The café runs out of oat milk: a «Стоп-лист» that the
form and the queue both respect. Students design it before writing any
code: the state, the actions, which reducer owns it, and what changes in
each component. Code is optional. No tests, no grade; the design is a
defence topic, and the question of who needs the stop-list leads to ЛР-12.

### What the tests check, and what they don't

- **Reducers as plain functions:** called directly, with deep-frozen
  inputs (`withUndo`'s history included), and compared by value (`toEqual`)
  or by identity (`toBe`) where structural sharing or a no-op is the rule.
- **The page through roles and names,** as in ЛР-7, always inside
  `<StrictMode>`, as `main.jsx` renders it: one helper in `tests/` wraps
  every render. A reducer that mutates its state, or a `withUndo` that
  mutates its history, then shows its symptom in the tests as it does in
  `npm run dev`. Earlier labs' tests didn't use StrictMode; this lab is the
  first where it changes a result.
- **That a component uses the reducer,** with `vi.mock(path, { spy: true })`
  (§4.3).
- **The shape only where it is the requirement** (§4.5), and only on named
  paths.
- **Not the internals:** `switch` or an object of handlers, helper
  functions, where the next order number lives (only that numbers aren't
  reused), how the selectors are written.
- No timers in the app, so no fake timers; `user-event` works everywhere.

### ESLint in this lab

Checked with `eslint-plugin-react-hooks` 7.1.1 and ЛР-10's config, where
`react-hooks/immutability` and `react-hooks/purity` are on:

- a reducer that mutates its `state`, or calls `Date.now()` or
  `Math.random()`, gets no report, whether it sits in its own module or next
  to the component, and neither does mutating `useReducer`'s state in an
  event handler. The rules analyse components and hooks; a reducer is a
  plain function. So the starter passes lint, and §4.4 relies on the tests
  and on StrictMode;
- the stubs will pass lint by naming their parameters in comments, as
  ЛР-7's did;
- the prototype's reducers and tests have no problems; the reference is
  checked during the build.

## Design principles

ЛР-7's principles apply. In addition:

1. **The reducer is where the skill is.** The markup, the styles and the
   wiring of inputs are given; students write and fix reducers and
   selectors, and change only the lines of components that call them.
2. **The action list is given, named as events.** The tests dispatch it,
   and the handout's §4.3 intro contrasts it with the starter's setters.
3. **The page shows each problem before the code does,** including §4.4's,
   which shows in development only.
4. **Selectors stand between the shape and the page,** so the shape can
   change (§4.5) while the page and the earlier tests stay as they are.
5. **One app for ЛР-11 and ЛР-12.**
6. **React only at runtime,** and `immer` only for those who do §4.8.

## Timing

The slot is 80 minutes.

| Step | Handout | Minutes |
| --- | --- | --- |
| Starter, `npm install`, `npm test`, first commit | §4.1 | 5 |
| The AI rule, as in ЛР-7 | §4.2 | 1 |
| The form: `draftReducer`, «Разом» | §4.3 | 15 |
| The queue's defects | §4.4 | 12 |
| Normalization | §4.5 | 14 |
| `withUndo` and the buttons | §4.6 | 11 |
| Checks, `git push`, the Vercel project | §4.7 | 5 |
| **The lab** | | **63** |
| +1: Immer | §4.8 | 8 |

These are estimates; the timed dry run decides. If the lab takes longer than
65 minutes, the cuts, in order:

1. drop the history limit (one test less);
2. give `createInitialState`'s normalization in §4.5's stub, so students
   rewrite the cases and the selectors only;
3. add the `useReducer` troubleshooting anchor
   (`#my-reducer-or-initializer-function-runs-twice`) to §4.4's **Довідка**.
   It explains one of the defects with an example, so it is a hint, not a
   reading;
4. make §4.6 the +1 task, done after §4.7's checks as §4.8 is now, and
   Immer an ungraded extra next to §4.9's stop-list.

§4.5 is the tightest estimate: the prototype's normalized reducer is 86
lines against the nested one's 66, and students also write
`createInitialState`, two selectors and `App`'s id. The dry run times it on
its own; if §4.5 alone runs past 14 minutes, cut 2 comes first.

## Starter: `starters/react/lab-11/` → `/uk/react/starters/lab-11.zip`

Packed like ЛР-10's: `python docs/web/build-pack.py starters/react/lab-11`
after the starter is committed. Configs are ЛР-10's without
dependency-cruiser and Steiger, and `jsconfig.json` includes `src` only
(ЛР-10's also lists `packages`, which this lab doesn't have).

```text
starters/react/lab-11/
├── .gitignore, .prettierrc.json, eslint.config.js, vite.config.js, jsconfig.json   ЛР-10's
├── index.html             lang="uk", <title>ЛР-11. Черга замовлень</title>
├── package.json           "name": "lab-11"; ЛР-10's scripts without check:deps and check:fsd;
│                          devDependencies: ЛР-10's without dependency-cruiser and Steiger
├── README.md              the app, «Що вже є», the commands
├── public/favicon.svg
├── src/
│   ├── main.jsx           <StrictMode>, as always
│   ├── App.jsx            useReducer(queueReducer, …); the opened order as a copy in useState
│   ├── index.css
│   ├── data/              menu.js (prices, priceOf), orders.js (loadOrders(): six nested orders)
│   ├── model/
│   │   ├── draftReducer.js     stub (§4.3)
│   │   ├── queueReducer.js     the colleague's reducer and the two selectors (§4.4, §4.5)
│   │   └── withUndo.js         stub (§4.6)
│   └── components/        OrderComposer (on useState), DraftItem, OrderBoard, OrderColumn,
│                          OrderCard, OrderDetails, HistoryButtons
└── tests/                 setup.js, the <StrictMode> render helper and the files
                           named under each challenge
```

`tests/setup.js` is ЛР-7's (jest-dom, `cleanup`, mocks restored). Each
mount of `App` starts from a fresh `loadOrders()`, so tests need no reset.

## Handout: `src/content/labs/react/uk/lab-11.md`

About ЛР-7's length, with no solution code: only the target shape in §4.5,
the action lists, and two starter handlers in §4.3. Frontmatter as in
ЛР-10, with `number: 11`, the programme's title, and `duration: "2
академічні години (практична частина — близько 65 хвилин; самостійна
робота — 2 години)"`. `handout:` is added once the PDF is built after the
instructor's review. Ukrainian only; English later. §5's repository line
uses `<user>`, as ЛР-10's does, so it stays whole in the PDF.

Draft `summary`: «Черга замовлень для бариста: чотири code challenges з
готовими тестами Vitest. Форма нового замовлення переходить з useState на
useReducer, ред'юсер черги від колеги стає чистим, стан черги
нормалізується в byId та ids, а ред'юсер вищого порядку withUndo додає
скасування й повтор дій. +1 бал: той самий ред'юсер форми на Immer. Деплой
на Vercel.»

**Top note.** The usual «Примітка щодо актуальності», naming React 19,
Vitest 5 and Immer 11.

### §1. Мета роботи

Draft: «Навчитися тримати складний стан у ред'юсері: описувати зміни діями,
що називають подію, писати чисті ред'юсери без мутацій, нормалізувати
вкладені дані та розширювати ред'юсер функцією вищого порядку.»

**Очікуваний результат:** `lab-11/` passes `npx vitest run` (all tests),
`npm run lint`, `format:check` and `build`; the form, the queue, «Деталі»
and the history buttons work in `npm run dev`; the app is on Vercel.
Screenshot `/uk/react/labs/lab-11/result.webp`: the page with a draft in the
form, orders in all four columns, and «Скасувати дію» enabled.

### §2. Корисні посилання

The readings table, in its order, with ЛР-7's opening paragraph: what to
read before class (react.dev's reducer page and Choosing the State
Structure, Kent C. Dodds) and the rest when a challenge points to it. One
line names Wieruch's book.

### §3. Завдання

A numbered list, one line each: §4.1 starter; §4.3–§4.6 with their topic in
brackets; §4.7 checks and Vercel; §4.8 +1; §4.9 ungraded. Then the notes:
all in class, 1 point after the defence plus 1 for §4.8, ЛР-7's rule for
unfinished work, and the AI note pointing to §4.2.

### §4. Хід виконання

- **4.1. Стартовий проєкт.** ЛР-10 §4.1 with `lab-11`. `npm test`: which
  tests pass from the start and why is fixed during the build. ESLint shows
  no problems. Commit `chore: add lab 11 starter`.
- **4.2. Правила роботи з AI.** ЛР-7's rule.
- **4.3–4.6.** As under **The challenges**, with these commits:
  `refactor: move the order form to useReducer`;
  `fix: make the queue reducer pure`;
  `refactor: normalize the queue state`;
  `feat: undo and redo queue changes`.
- **4.7. Перевірки, GitHub і Vercel.** All checks; `git push`; a new
  Vercel project `react-lab-11` with Root Directory `lab-11`. The history
  is the starter's commit plus four.
- **4.8. +1.** As above.
- **4.9. Самостійна робота (не оцінюється).** As above.

### §5. Вимоги до звіту

Subject `[React] ЛР-11: useReducer і складні структури даних`, with ЛР-10's
two lines for `lab-11`. The report contains:

1. a screenshot of `npx vitest run` with all tests passing;
2. a screenshot of `npm run lint`, `format:check` and `build`;
3. per challenge, one or two sentences on what was wrong and what changed
   (a plain summary);
4. whether §4.8 was done, and if so its two or three sentences;
5. whether AI was used, and for what;
6. a short conclusion.

### §6. Усний захист

ЛР-7's intro, plus: the instructor may ask for a new action or a live fix
without AI. Grouped interview questions, answerable from the lab and its
readings:

- **«useState чи useReducer»:** when each fits; Kent C. Dodds's rule;
  react.dev's five points of comparison; using both in one component; what
  `dispatch` is and why it can be left out of an effect's dependencies.
- **«Дії»:** an action as an event, not a setter; one action per user
  interaction; what goes in the payload; why ids come with the action;
  what a reducer should do with an unknown action.
- **«Чисті ред'юсери»:** what pure means; why React calls a reducer twice in
  development and what it does with the two results; what each defect in §4.4 did and
  why only in development; why ESLint said nothing; where side effects go.
- **«Іммутабельність»:** why React needs a new object (`Object.is`); copying
  the path to a nested change; structural sharing; what the deep-frozen and
  `toBe` tests prove; why `structuredClone` of the whole state isn't the
  fix.
- **«Структура стану»:** react.dev's five principles, with an example of
  each from the lab; «Разом» as derived state; where the next order number
  belongs, and why.
- **«Нормалізація»:** `byId` and `ids`, and why `ids` is an array; what
  stays nested and why; selectors as the boundary between the shape and the
  page; why a selector that builds new objects is fine here and when it
  stops being fine; Redux Toolkit's `{ ids, entities }`; when normalizing is
  more than a state needs.
- **«Ініціалізація»:** `useReducer(reducer, arg, init)`; passing `init`, not
  its result; why `App` passes `null` and a function rather than
  `loadOrders()`; what StrictMode does with `init`.
- **«Ред'юсер вищого порядку»:** `past`, `present`, `future`; why an action
  that changed nothing isn't recorded; why the form and the opened order
  stay out of history; `withUndo` against ЛР-8's `withAnalytics`; why the
  pure reducer from §4.4 is a precondition; why there is no `Ctrl+Z` (the
  text fields' own undo).
- **«Immer»:** drafts, structural sharing and auto-freezing; `produce`
  against `useImmerReducer`; returning a value against changing the draft.
  Asked of everyone at the level of the readings, and in depth of those who
  did §4.8.
- **«Проєктування»:** the stop-list from §4.9; which components receive
  `dispatch` only to pass it on.

The handout's §6 will be the full list; the answers go in
`solution/README.md`.

### §7. Критерії готовності

«Лабораторна робота оцінюється в 1 бал після захисту (§6); §4.8 — ще 1
бал.» The main table:

| Критерій | Мінімальна вимога |
| --- | --- |
| Тести | у теці `lab-11` `npx vitest run` проходить: усі тести; файли в `tests/` не змінено в жодному коміті |
| Якість | `npm run lint` без помилок і попереджень; `format:check` і `build` — без помилок |
| Форма | `OrderComposer` бере стан з `useReducer` і `draftReducer`; «Разом» обчислюється під час рендерингу |
| Черга | `queueReducer` чистий; у `npm run dev` черга поводиться як у `npm run preview` |
| Нормалізація | стан черги має форму з §4.5; «Деталі» тримають id відкритого замовлення |
| Скасування | `withUndo` у `src/model/`; «Скасувати дію» й «Повторити дію» на сторінці |
| GitHub | коміт стартового проєкту й по одному на кожне завдання §4.3–§4.6 |
| На занятті | усі коміти відправлено на занятті; незавершене — на відпрацюванні, як пропущене заняття |
| Vercel | проєкт з Root Directory `lab-11`; адреса показує застосунок з останнього коміту `main` |
| AI | §4.2 дотримано; у звіті вказано, як використовувався AI |
| Звіт | усі пункти §5 |

And for §4.8: `immer` in `lab-11`'s dependencies; `draftReducer` exported
from a `produce` call; all tests pass; the commit pushed in class after
§4.7's; the comparison in the report.

## Files to create or change

- `starters/react/lab-11/` (above);
- `public/uk/react/starters/lab-11.zip`: built by `build-pack.py` after the
  starter's commit, in its own commit;
- `src/content/labs/react/uk/lab-11.md`: the handout;
- `public/uk/react/labs/lab-11/result.webp`, from the reference in headless
  Edge;
- `public/uk/react/labs/lab-11.pdf`: `python docs/web/build-handout.py
  lab-11 react`, after the instructor's review;
- `docs/react/lab-11/solution/` (gitignored; the `.gitignore` line comes
  with this plan): the prototype today; at build time, the reference as one
  stage per challenge, the defect map, the defence answers and a
  `shots.mjs`;
- `docs/react/lab-11/README.md`: the lasting facts and what was verified,
  with no answers;
- `docs/react/course-plan.md`: a ЛР 11 row in **How the site maps to the
  plan**; the «not built» rows become `ЛР 9` and `ЛР 12–27`; the date above
  the table; ЛР 11's §4.8 in the extra-points paragraph (current work can
  then reach 70); the useReducer note in **Notes for building the course**
  says it is practised in ЛР-11;
- `README.md` (root): a `lab-11/` line in the `starters/react/` tree.

Work on `feat/react-lab-11` from `main`. The starter is a new app with no
earlier lab's answers in it, so the branch can be pushed and reviewed at
any time. ЛР-12's starter will contain ЛР-11's reference, so
`feat/react-lab-12` stays local until the last group's ЛР-11 class, as
`feat/react-lab-8` did for ЛР-7.

## Verification

**Checked while writing this plan (2026-11-19)** on a prototype in a
scratch `react-labs` workspace, on Windows 11 with Node.js 24.20.0 and npm
11.19.0: React 19.3.1, Vite 8.3.8, Vitest 5.1.1, jsdom 31.0.1, React
Testing Library 16.3.3, user-event 14.6.10, ESLint 10 with ЛР-10's config
and `eslint-plugin-react-hooks` 7.1.1, Immer 11.2.10. The prototype has a
seeded queue reducer, the pure nested reference, the normalized reference,
`withUndo`, the form reducer in spread and Immer versions, and a minimal
board; 44 probes run without errors. The StrictMode, frozen-input and
same-input probes log what each variant does rather than assert it, so the
findings below come from reading those logs; the lab's tests will assert
them.

- **StrictMode in Vitest:** a component rendered inside `<StrictMode>` in
  jsdom gets React's development behaviour: the reducer runs twice per
  dispatch, once without StrictMode. Each seeded defect shows its symptom in
  a StrictMode render and not in a plain one; both references behave the
  same in both.
- **Deep-frozen inputs:** a mutating case throws a `TypeError` that names
  the property; the references pass for every action.
- **"Same input twice"** tells the seeded reducer from the references.
- **Normalization:** the normalized reference passes the page probes
  unchanged; `customer_renamed` keeps `orders` the same object,
  `item_toggled` keeps `customers` and the other orders, and renaming to
  the same name returns the same state, all checkable with `toBe`.
- **`withUndo`** works on a counter and on the queue; a no-op isn't
  recorded; with the seeded reducer inside, undo fails where it works with
  the pure one.
- **Immer:** a curried `produce` keeps the `(state, action)` contract,
  accepts deep-frozen input, gives the same results as the spread version
  over a sequence of actions, returns the same object for a no-op, and
  freezes its output.
- **`vi.mock(path, { spy: true })`** records the calls `useReducer` makes
  to the exported reducer.
- **ESLint:** as under **ESLint in this lab**. A deliberate
  `no-unused-vars` error in the same folder is reported, so the silence is
  the rules', not a linter that didn't run.
- **Shared data:** with a module-level array of orders, a mutating reducer
  changes the array itself, and later tests in the same file start from the
  changed data (hence `loadOrders()`).
- **Versions:** `use-immer` 0.11.0 accepts React 19 (`^19.0.0` in its peer
  range), though §4.8 uses `immer` itself.
- **Readings:** the anchors in the table were read from the pages on
  2026-11-19 (react.dev's five pages, Redux's three, Immer's React page),
  and the react.dev ones also exist under `uk.react.dev`; which of those
  pages are translated (see **The readings**); Kent C. Dodds's date and
  quote; Wieruch's article's content.

**To check during the build:**

- the full starter and the reference as one stage per challenge, each
  through the tests (with the expected failures), lint, Prettier and the
  build; the exact test counts for §1, §5 and §7;
- the seeded defects in a real browser: `npm run dev` against
  `npm run build && npm run preview`, as §4.4 asks students to compare;
- **React DevTools**: how a `useReducer` hook shows under `OrderComposer`
  and `App` (for **Перевірка**);
- the page in headless Edge at 390 px and 1000 px: the form above the queue
  on a phone, no horizontal scroll, the four columns readable, focus visible
  on the card buttons; the screenshot;
- which handler in the starter's form loses «Разом», so the symptom shows
  within the first few clicks;
- the given `OrderDetails` with an order that is gone (cancelled with the
  panel open; its `order_placed` undone, then redone) and the name field
  after an undone rename;
- §4.3's page tests through the StrictMode helper on the seeded queue
  reducer: they pass, as **§4.4** says;
- the timed dry run as a student, without AI: §4.3–§4.6 in about 52 minutes
  plus setup, and §4.8 in about 8; otherwise the cuts under **Timing**;
- the zip stores LF and passes `format:check` after unpacking; `npm install`
  in an existing `react-labs` adds `lab-11`; §4.8's `npm install immer -w
  lab-11` from the root; Vercel builds `lab-11` and doesn't run the tests;
- `npm run check && npm run build` for the site; the labs index lists
  ЛР-11.

## Decisions

**Settled by the instructor on 2026-11-19:**

1. **The app is a barista's order queue,** «Черга замовлень»: a form for a
   new order with a nested draft, and a four-column queue of orders with
   their customers and drinks.
2. **ЛР-12 reuses this app.** ЛР-11 leaves the queue's state and
   `dispatch` in `App` and passes them as props, and the form's draft in
   `OrderComposer`; ЛР-12 decides how to share them.
3. **Topics:** besides moving state into a reducer and making a reducer
   pure, normalization (`byId` + `ids`), undo and redo through a
   higher-order reducer, and Immer. A reducer as a state machine was offered
   and not chosen.
4. **Format:** ЛР-7's code challenges with given Vitest tests, all in
   class, AI explains only, 1 point; plus one optional task for 1 more
   point, started in class once the main part is pushed, as in ЛР-10.

**Proposed in this plan and confirmed by the instructor on 2026-11-19:**

5. **Two reducers:** students write the form's (§4.3); the queue's is
   given with seeded defects (§4.4), then normalized (§4.5) and wrapped
   (§4.6). A student-written queue reducer couldn't carry seeded defects,
   and a given form reducer would leave §4.3 nothing to write.
6. **Immer is the +1,** on the form's reducer: it is the student's own,
   its tests already check frozen input and shared objects, and no later
   challenge changes it, while the queue's reducer is rewritten in §4.5 and
   wrapped in §4.6. Through `immer`'s curried `produce`, not `use-immer`'s
   `useImmerReducer`, so the reducer keeps the contract the tests call.
   Undo was the other candidate for the +1; it stays in the main part,
   since §4.4's purity pays off there.
7. **The action lists are given,** named as events, in the stubs' JSDoc.
   Naming actions well is then a reading and a defence group rather than a
   graded choice, because the tests have to dispatch them.
8. **§4.5's target shape is given and tested** on named paths:
   `orders.{byId, ids}`, `customers.{byId, ids}`, `customerId` on the order,
   items inside the order. Other keys are the student's.
9. **Selectors as the queue's API,** given in the starter and rewritten in
   §4.5, so earlier tests survive the change of shape.
10. **Every page test renders in `<StrictMode>`,** as `main.jsx` does,
    through one helper in `tests/`; the reducer tests, `withUndo`'s
    included, use deep-frozen inputs. No other tool catches the defects
    (see **ESLint in this lab**), and §4.6's history gets the same checks
    as §4.4's reducer.
11. **The opened order and the form stay out of history;** the history
    keeps 20 steps; `undo` and `redo` are the history actions' names, as in
    Redux's page; no `Ctrl+Z`.
12. **No `localStorage`, no server:** the queue starts from `orders.js` on
    every load.
13. **The starter is grouped by file type,** with `model/` for reducers
    and selectors.
14. **§4.9, ungraded,** is the programme's «Проєктування ред’юсерів»: a
    stop-list designed before it is coded.
15. **ЛР-7's rule for unfinished work** (its decision 10); +1 only if
    pushed in class.
16. **Ukrainian first,** English later.
17. **Out of scope:** context (ЛР-12), state machines and libraries for
    them, Redux Toolkit and Zustand (Lecture 4's presentations), async
    actions and data fetching (Part 3), memoized selectors (ЛР-15), and
    TypeScript's discriminated unions for actions (ЛР-19, П8.2).

**Added after the review and confirmed by the instructor on 2026-11-19:**

18. **The queue's state is built in `useReducer`'s initializer:**
    `useReducer(queueReducer, null, () => createInitialState(loadOrders()))`,
    so the orders are built when `App` mounts, not on every render (see
    **Data**). §6 asks why.
19. **«Деталі» are empty while the opened order is gone** (cancelled, or its
    placement undone) and come back if an undo returns it. The given
    `OrderDetails` renders nothing for a missing order and keys the name
    field on the order and the name; one §4.5 test covers it.
20. **`emptyDraft` is deep-frozen in the stub,** so a form reducer that
    mutates it throws at the first click instead of carrying drinks into
    the next test.
21. **The draft's name is `customerName`,** a string, so it isn't confused
    with an order's `customer` object.
22. **Each drink has a default milk in `menu.js`:** «без молока» for
    Еспресо and Американо, «звичайне» for the rest; `drink_added` uses it.

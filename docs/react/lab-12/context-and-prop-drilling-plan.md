# Plan: React ЛР-12 «Глобальний стан за допомогою Context API та вирішення проблеми Prop Drilling»

Status: proposed on 2026-11-24, awaiting the instructor. ЛР-11's decision 2
already settled the app: ЛР-12 continues ЛР-11's barista order queue and
decides how its state is shared. Everything else under **Decisions** is
proposed. A prototype of every challenge, two wrong variants and the +1 task
was built and checked the same day (see **Verification**). It lives in the
gitignored `solution/` folder next to this file, with the instructor's notes:
the measurements per stage and the defence answers. The lab is not built
yet. Once it is, what was built, what was verified and where the build
differs from this plan go into this folder's `README.md`, and this file stays
as the plan the lab was built from.

The challenge format, the test tooling and the AI rule come from ЛР-7, with
the changes ЛР-11 made. Their plans,
[../lab-7/custom-hooks-and-render-props-plan.md](../lab-7/custom-hooks-and-render-props-plan.md)
and [../lab-11/use-reducer-and-complex-state-plan.md](../lab-11/use-reducer-and-complex-state-plan.md),
hold them, and this plan names only what ЛР-12 changes. The handout follows
ЛР-11's handout as it was built and revised on 2026-11-22 and 2026-11-23
([../lab-11/README.md](../lab-11/README.md)), not ЛР-11's plan.

## Context

From [../course-plan.md](../course-plan.md), row 2.8:

- **Тема:** «Глобальний стан за допомогою Context API та вирішення проблеми
  Prop Drilling»
- **Самостійна робота:** «Імплементація глобальних контекстів» (2 год.)
- **Читання:** Основна 1 (react.dev)
- **Position:** the last lab of Part 2, after ЛР-11 and before ЛР-13
  (routing with protected routes, Part 3). Lecture 4 (row 2.5) covered
  Context API, Zustand and Redux Toolkit before ЛР-10, so presentation topics
  П4.1 «Context API і ціна ре-рендерів», П4.2 «`useReducer` разом із Context»
  and П4.5 (state managers compared) are defended before this lab, and П3.8
  (composition through `children`) and П3.10 (context as dependency
  injection) at Lecture 3. П6.12 (testing hooks and context) and П8.8
  (typing context) come later. No deck is built yet, so the readings carry
  the topic, as in every lab so far.

What earlier labs left for this one:

- **ЛР-8 introduced the API.** Its compound `Tabs` share their state through
  `createContext`, `<TabsContext value={…}>` and `use(TabsContext)`. The
  course plan's note on context
  says ЛР-8 uses context only as the private channel between `Tabs` and its
  parts, and leaves global state, prop drilling and the cost of re-renders to
  ЛР-12. ЛР-8 also linked react.dev's «Passing Data Deeply with Context» and
  its three steps. So this lab doesn't teach `createContext` from zero.
- **ЛР-11 left the queue's state in `App`.** `App` calls
  `useReducer(withUndo(queueReducer), …)`, reads the queue from the history's
  `present`, and passes the queue, `dispatch` and the opened order's id down
  as props: to `OrderBoard`, which passes `dispatch` and `onOpen` through
  `OrderColumn` to every `OrderCard`; to `OrderDetails`, which passes
  `dispatch` to its rename form; and `canUndo`, `canRedo`, `onUndo`, `onRedo`
  to `HistoryButtons`. The form's draft stays in `OrderComposer`, which gets
  `onPlace`. ЛР-11's §6 already asks which components receive `dispatch`
  only to pass it on; this lab answers it in code.
- **ЛР-11's selectors** (`selectColumn`, `selectOrder`) are the queue's API to
  the page, and every page test renders inside `<StrictMode>` through one
  helper. Both stay.
- **ЛР-7's and ЛР-11's `vi.mock(path, { spy: true })`** checked that a
  component uses a function. Here the same spy, on a component's module,
  records the props the component receives and how often it renders (see
  **What the tests check**).
- **ЛР-8's `Tabs` took its content as `children`,** and ЛР-7's `ShowMore`
  took a render prop. §4.3 uses `children` to remove a layer of props.
- **ЛР-10's cart is an external store** read through `useSyncExternalStore`.
  The +1 task moves the queue into Zustand, a library built on the same hook.

### What the lab is for

react.dev's **Before you use context** gives an order: pass props first;
when props pass through components that don't use them, extract components
and pass JSX as `children`; only when neither works, use context. The lab
follows that order on one page, and each challenge ends in a change students
can measure:

1. **Composition** (§4.3): find the props that a component only passes on,
   and remove one layer of them by giving `OrderColumn` its cards as
   `children`. No context yet.
2. **Context from the component that owns the reducer** (§4.4): react.dev's
   steps 1–3 for a reducer. `App` keeps `useReducer` and provides two
   contexts, one for the queue and one for `dispatch`; the board, the cards
   and «Деталі» stop receiving them as props.
3. **A provider component** (§4.5): react.dev's «Moving all wiring into a
   single file». `QueueProvider` owns the reducer and takes `children`;
   `useQueue` and `useQueueDispatch` read the contexts and name the provider
   when it is missing; `App` keeps only the opened order's id. The page looks
   the same, but the order form no longer renders again when a drink is
   ticked on the board.
4. **A second global state** (§4.6): a «Стоп-лист», what the café has run
   out of, in its own context. The form, the cards on the board and the
   stop-list panel read it; it isn't part of the queue's undo history, and
   changing it doesn't render the components that read only the queue.

The +1 task (§4.8) keeps the hooks and changes what is behind them: the
queue's state moves into a Zustand store that `QueueProvider` creates, and
every test passes unchanged.

Two measurements run through the lab, recorded in a `MEASUREMENTS.md` the
starter provides: which props each component only passes on (on the starter,
after §4.3 and after §4.4), and which components render when a drink is
ticked (after §4.4 and after §4.5, from React DevTools' Profiler). They make
the lab's two claims visible: context removes props, and where the state
sits decides what renders.

### The readings

Checked on 2026-11-24. Of the react.dev pages, `uk.react.dev` serves two in
Ukrainian: **Scaling Up with Reducer and Context** («Масштабування з
використанням контексту та редюсера») and the **`useContext`** reference.
The others are English there. `uk.react.dev`'s copy of the **`use`**
reference is an older, shorter version (its heading is `use(resource)`, and
it has a sentence the English page doesn't), so the handout links that page
on `react.dev`. The anchors keep their English ids in both languages. §2
says which links are in Ukrainian.

| Page | Date | Use |
| --- | --- | --- |
| react.dev: [Passing Data Deeply with Context](https://uk.react.dev/learn/passing-data-deeply-with-context) | current | before class. `#the-problem-with-passing-props` (where the term «prop drilling» comes from), `#before-you-use-context` (props first, then «Extract components and pass JSX as children to them», §4.3), `#use-cases-for-context` (§4.6, defence), `#context-passes-through-intermediate-components`. Steps 1–3 were ЛР-8's reading |
| react.dev: [Scaling Up with Reducer and Context](https://uk.react.dev/learn/scaling-up-with-reducer-and-context) | current | before class. `#step-1-create-the-context`, `#step-2-put-state-and-dispatch-into-context`, `#step-3-use-context-anywhere-in-the-tree` (§4.4), `#moving-all-wiring-into-a-single-file` (§4.5). Two differences from the lab, both in the handout: its hooks only return `useContext(…)` and don't check for a provider, and its single file fails this lab's lint (see **ESLint in this lab**). The page creates two contexts without saying why; §6 asks |
| react.dev: [`useContext`](https://uk.react.dev/reference/react/useContext) | current | the caveats: «React automatically re-renders all the children that use a particular context starting from the provider that receives a different value», compared with `Object.is`, and `memo` doesn't stop it (§4.5); `#optimizing-re-renders-when-passing-objects-and-functions` (defence: when it matters and why §4.5 doesn't need it); `#specifying-a-fallback-default-value` and the troubleshooting `#my-component-doesnt-see-the-value-from-my-provider` (§4.5's hooks) |
| react.dev: [`createContext`](https://uk.react.dev/reference/react/createContext) | current | `#provider`: «Starting in React 19, you can render `<SomeContext>` as a provider», with `SomeContext.Provider` as the legacy way; `#importing-and-exporting-context-from-a-file` (§4.5's two files) |
| react.dev: [`use`](https://react.dev/reference/react/use) | current | `#reading-context-with-use`: unlike `useContext`, `use` can be called inside `if` and loops. The English page doesn't say one is preferred, so the handout doesn't either |
| react.dev blog: [React v19](https://react.dev/blog/2024/12/05/react-19#context-as-a-provider) | 2024-12-05 | `<Context>` as a provider; `<Context.Provider>` to be deprecated in future versions (defence) |
| Kent C. Dodds: [Prop Drilling](https://kentcdodds.com/blog/prop-drilling) | 2018-05-21 | the term; «Prop drilling can be a good thing, and it can be a bad thing»; keep state close to where it's used (§4.3, defence) |
| Kent C. Dodds: [How to use React Context effectively](https://kentcdodds.com/blog/how-to-use-react-context-effectively) | 2021-06-05 | a custom hook that throws «useCount must be used within a CountProvider» (§4.5); he doesn't export the context, and he keeps state and `dispatch` in one context, where react.dev uses two (defence: compare) |
| Kent C. Dodds: [Application State Management with React](https://kentcdodds.com/blog/application-state-management-with-react) | 2020-07-21 | separate providers for separate concerns; «Keep state as local as possible and use context only when prop drilling really becomes a problem» (§4.6, defence) |
| Dan Abramov: [Before You memo()](https://overreacted.io/before-you-memo/) | 2021-02-23 | «Solution 2: Lift Content Up»: a component that re-renders still gets the same `children` from its parent, so React doesn't visit them (§4.3, §4.5) |
| Nadia Makarevich (Developer Way): [How to write performant React apps with Context](https://www.developerway.com/posts/how-to-write-performant-react-apps-with-context) | 2022-02-07 | a form moved into context step by step and measured, as this lab does with the queue. «Splitting the state and the API» (separate providers for the data and for the functions that change it, with `useReducer` keeping the API the same object: §4.5, and the reason react.dev's page doesn't give for its two contexts); «Splitting state even further» (§4.6, defence); her point that memoizing the value alone «brushes the problem under the rug» (defence, with react.dev's `useMemo` advice). Written for React 18, so it uses `<Context.Provider>` and `useContext` where this lab uses `<Context>` and `use`; the handout says so in one line. Its «Bonus: external state management» uses Redux's `createStore` and is out of scope. The page shows no anchors, so the handout names the sections |
| Mark Erikson: [Why React Context is Not a "State Management" Tool](https://blog.isquaredsoftware.com/2021/01/context-redux-differences/) | 2021-01-18 | «Context is a form of Dependency Injection. It is a transport mechanism - it doesn't "manage" anything.» The state is managed by `useReducer` (ЛР-11) and `useState` (§4.6), context only carries it (§4.6, §4.8, defence) |
| Zustand: [Initialize state with props](https://zustand.docs.pmnd.rs/learn/guides/initialize-state-with-props.html), [Prevent rerenders with useShallow](https://zustand.docs.pmnd.rs/learn/guides/prevent-rerenders-with-use-shallow.html) | Zustand 5.1 | §4.8 only: a store created per provider and passed through context, read with `useStore(store, selector)` |

Programme reading: Основна 1 is react.dev, above. No other programme title
covers context.

**Considered, not used:**

- **Kent C. Dodds's single context with `{ state, dispatch }`** as the lab's
  pattern. react.dev's two contexts are what §4.5's re-render test needs;
  Kent's version is a defence comparison.
- **`memo`, `useMemo`, `useCallback` and the React Compiler.** They are
  ЛР-15's (row 3.5). This lab observes re-renders and changes only where the
  state sits; §6 asks when react.dev's `useMemo` advice would apply.
- **`use-context-selector` and Redux Toolkit.** Lecture 4's presentations
  (П4.5) compare state managers; one library in the +1 task is enough.

## The app: «Черга замовлень», continued

ЛР-11's page: the form «Нове замовлення» on the left, the four-column queue
(«Нові», «Готуються», «Готові», «Видані»), «Деталі», and «Скасувати дію» and
«Повторити дію» above the board. The starter is ЛР-11's reference solution
(its §4.3–§4.6, without the Immer +1), so students start from a page that
works and from code they wrote themselves a week earlier.

**What is new on the page** is the «Стоп-лист» (§4.6): a panel in the header
with a checkbox for each drink, each milk except «без молока», and each
syrup. While something is on the stop-list:

- the form can't add it: «+ Какао» is disabled; in a drink's «Молоко» the
  stopped milk's option is disabled; a stopped syrup's checkbox is disabled
  unless that drink already has it, so it can still be unticked;
- «Надіслати бариста» is disabled while the draft holds anything stopped, and
  the form says why: «У замовленні є позиції зі стоп-листа»;
- a drink whose default milk is stopped can still be added: four of the six
  drinks default to «звичайне», so with «звичайне» stopped, «+ Лате» adds a
  latte with «звичайне» milk, the form shows its note, and «Надіслати
  бариста» stays disabled until the milk is changed (see **Decisions**, 18);
- a card in «Нові» or «Готуються» that holds anything stopped says «Є позиції
  зі стоп-листа», so the barista knows to talk to the guest. Cards in «Готові»
  and «Видані» don't: those drinks are made.

The seed orders make this visible at once: stopping «вівсяне» marks № 44
(«Нові») and № 46 («Готуються») but not № 41 («Готові»), and stopping
«Какао» marks № 44 only. The stop-list starts empty on every load and isn't
saved (no `localStorage`, as in ЛР-11), and it isn't part of the queue's
history: «Скасувати дію» doesn't undo it.

**Data.** `menu.js` gets two given exports: `stopListOptions` (the panel's
three groups) and `hasStopped(item, stopped)`, which says whether a drink in
an order or a draft uses anything on the stop-list. The array logic is given
so §4.6 is about where the stop-list is kept and who reads it.

**Where the state sits,** before and after:

| State | Starter (ЛР-11's end) | After ЛР-12 |
| --- | --- | --- |
| the queue's history (`past`, `present`, `future`) | `useReducer` in `App`; the queue, `dispatch` and the history flags passed as props | `useReducer` in `QueueProvider`; read through `useQueue` and `useQueueDispatch` |
| the opened order's id | `useState` in `App` | the same: two components need it, one level down, so it stays a prop (react.dev's «Start by passing props») |
| the form's draft | `useReducer` in `OrderComposer` | the same: one component reads it |
| the stop-list | not there | `useState` in `StopListProvider` in the reference (`useReducer` is the student's other choice); read through `useStopList` |

That table is also a defence topic: why the opened order's id and the draft
don't go into context.

**Size:** about 20 files in `src/`, in ЛР-11's folders by file type. The
contexts, hooks and providers go into `model/`, next to the reducers.

## The challenges

Students do §4.3 → §4.6 in order, one commit each, and nothing in `tests/`
changes in any commit, as in ЛР-7 and ЛР-11. Each challenge has ЛР-11's
parts as built: **Що має вийти**, **Що вже є**, **Код**, **Перевірка**,
**Коміт** and **Довідка**. The choices a challenge leaves to the student are
a sentence in its text, not a label (ЛР-11's 2026-11-22 change). §4.4 and
§4.5 are moves of existing code, so each also gets a numbered **Порядок дій**
(as ЛР-11's §4.5 did) and ends with «Крок завершено, коли…». The rules below
are the test names; the tests ship in the starter.

Most of this lab moves code without changing the page, so ЛР-11's page tests
pass at every stage and can't tell the steps apart (checked on the
prototype). Each challenge's own tests therefore check what the move changes:
the props a component receives (§4.4), the provider and its hooks used
without `App` (§4.5), and which components render (§4.5, §4.6). The
prototype's probes measured each of these on every stage: the stage before
a challenge gives the value its tests reject, the stage after gives the one
they accept (see **Verification**). The tests themselves are written during
the build.

### §4.3. Props passed on, and `children` instead

**Що має вийти.** `OrderColumn` takes `title`, `count` and `children`: it
renders the column's heading with the count and puts its children into the
list, or «Порожньо» when the count is 0. `OrderBoard` selects each column's
orders and renders the cards into `OrderColumn` itself. `OrderColumn` keeps
the `<ul>`, and `OrderBoard` wraps each card in its `<li key>`, so the
children are list items and `OrderColumn` needn't wrap them (that would need
the `Children` API). `OrderColumn` no longer receives `dispatch` and
`onOpen`. The page doesn't change.

Before the code, students fill the first table in `MEASUREMENTS.md`,
«Пропи, які компонент лише передає далі», for the starter: for each
component, the props it receives and doesn't use itself. React DevTools'
Components panel shows each component's props, and the handout says where.
After the change they fill the same table again.

`count` is a prop, not `Children.count(children)`: react.dev's `Children`
reference opens with «Using `Children` is uncommon and can lead to fragile
code» and points to `#alternatives`, and the handout says so in one line.

**Що вже є.** ЛР-11's board, column and card; the empty table in
`MEASUREMENTS.md`.

**Tests** (`tests/OrderColumn.test.jsx`, 3):

- показує назву колонки й кількість замовлень у заголовку;
- показує картки, передані як `children`;
- без замовлень показує «Порожньо».

The tests render `OrderColumn` alone with a `<li>` as the child, so they fix
its props and nothing about the cards.

### §4.4. The queue in context: `QueueContext` and `QueueDispatchContext`

**Що має вийти.** `src/model/queueContext.js` exports two contexts created
with `createContext(null)`: `QueueContext`, whose value is
`{ queue, canUndo, canRedo }`, and `QueueDispatchContext`, whose value is
`dispatch`. `App` keeps its `useReducer` and wraps the page in both
providers (`<QueueContext value={…}>`, React 19's form). `OrderBoard` reads
the queue from context and receives only `onOpen`; `OrderCard` and the
rename form in `OrderDetails` read `dispatch` from context. `HistoryButtons`
and `OrderComposer` keep their props for now: `App` still has what they
need, one level up.

**Порядок дій** (react.dev's three steps): create the two contexts; provide
them in `App`; replace the props with `use(…)` in each component that reads
them, from the card up to the board, and remove the props from every
component in between.

**Що вже є.** The stub `queueContext.js`, with the two contexts' values and
the §4.5 hooks described in JSDoc; ЛР-8's experience with `use`.

**Tests** (`tests/queueContext.test.jsx`, 3; each renders `<App />` in
StrictMode and reads the props from a spy on the component's module):

- `OrderBoard` не отримує `queue` і `dispatch` через пропси;
- `OrderCard` не отримує `dispatch` через пропси;
- «Деталі» не отримують `dispatch` через пропси.

The tests don't look at the contexts' values, only at the props, so any way
of getting the queue to the cards passes, the +1's store included (see
**Decisions**, 8). ЛР-11's page tests show that the buttons still work.

**Перевірка.** The props table for the last time: what is left after §4.4.
And the second table in `MEASUREMENTS.md`, «Які компоненти рендеряться,
коли бариста відмічає напій», recorded with React DevTools' Profiler
(record, tick a drink on a card in «Готуються», stop). The handout explains
how to read the Profiler's flame graph: React's 2018 post introducing the
Profiler says «gray components did not render at all during this commit»;
react.dev's DevTools page doesn't describe the panel, so the build checks
that DevTools 8 still draws it that way.

### §4.5. `QueueProvider` and the hooks `useQueue`, `useQueueDispatch`

**Що має вийти.** `src/model/QueueProvider.jsx` exports `QueueProvider`, a
component that takes `children`, calls `useReducer` with ЛР-11's
`withUndo(queueReducer)` and initializer, and provides both contexts.
`queueContext.js` exports `useQueue()` and `useQueueDispatch()`, which read
the contexts with `use` and throw an `Error` that names `QueueProvider` when
there is no provider (Kent C. Dodds's pattern; react.dev's hooks don't
check). `App` renders `<QueueProvider>` around the page and keeps only the
opened order's id. `HistoryButtons` and `OrderComposer` get what they need
from the hooks and receive no queue props; the form dispatches
`order_placed` itself, so creating the order's ids moves from `App` into the
form's submit handler. The form then has two dispatch functions, its draft's
and the queue's, and the handout suggests naming the queue's
`queueDispatch`.

`App` no longer has the queue, so it can't look up the opened order for
«Деталі». How «Деталі» find their order is the student's choice; the handout
names the question in a sentence.

**Порядок дій:** move `useReducer` and the two providers from `App` into
`QueueProvider`; write the two hooks and use them where §4.4 used `use(…)`;
then the components that still take queue props from `App`
(`HistoryButtons`, `OrderComposer`, «Деталі»).

**Why two files.** react.dev puts the provider and the hooks in one file. In
this lab's ESLint config, `react-refresh/only-export-components` reports a
`.jsx` file that exports a component next to hooks or next to a context
(checked, see **ESLint in this lab**). So the starter's stubs are already
two files: contexts and hooks in `queueContext.js`, the provider alone in
`QueueProvider.jsx`. The handout says why in one sentence; §6 asks.

**Що вже є.** The stubs: `queueContext.js` with the hooks throwing
`Not implemented: useQueue` and `Not implemented: useQueueDispatch`, and
`QueueProvider.jsx` throwing `Not implemented: QueueProvider`.

**Tests** (`tests/QueueProvider.test.jsx`, 6):

- `useQueue` поза `QueueProvider` кидає помилку, у якій названо
  `QueueProvider`;
- `useQueueDispatch` поза `QueueProvider` кидає таку саму помилку;
- у `QueueProvider` дошка без пропсів, крім `onOpen`, показує замовлення, а
  «Почати» переносить картку в «Готуються»;
- у `QueueProvider` форма без пропсів додає замовлення в «Нові»;
- у `QueueProvider` кнопки історії без пропсів вимкнені на початку, а після
  зміни «Скасувати дію» її скасовує;
- відмітка напою на дошці не перерендерює форму нового замовлення.

The hook tests use `renderHook` (React Testing Library) and give no wrapper.
The provider tests render `QueueProvider` with the components inside, not
`App`, so they show the components need nothing from `App`. The last test
renders `<App />` and counts the form's renders through a spy on its module;
it is the only one that fails after §4.4 for a reason other than a stub
(the probe counts the form's renders on a tick after §4.4 and after §4.5),
and §6 asks why.

**Перевірка.** The Profiler table again. The props table isn't filled again:
§4.5 removes props, but §6 asks whether that changes the first table.

### §4.6. The stop-list in its own context

**Що має вийти.** The «Стоп-лист» panel in the header and the rules under
**The app**. `src/model/StopListProvider.jsx` keeps the stop-list (the
student chooses `useState` or `useReducer`) and provides `StopListContext`
with `{ stopped, toggle }`; `useStopList()` reads it and names
`StopListProvider` when it is missing. `App` wraps the page in
`StopListProvider`. The given `StopListPanel` takes the stop-list as props
(`stopped`, `onToggle`), and `App` can't read the hook to give them, since
`App` renders the provider. So students write a container,
`src/components/StopList.jsx`, that reads `useStopList()` and renders the
panel with its props, ЛР-7's Container/Presentational (see **Decisions**,
19); `App` puts `<StopList />` in the header. The form, the drink rows and
the cards read the stop-list. Whether `DraftItem`, one level below the form,
reads the hook or gets the stop-list as a prop is the student's choice, and
the handout names it.

**Що вже є.** `StopListContext` itself, created in `stopListContext.js` (see
**Decisions**, 11); the stubs `useStopList` and `StopListProvider`; the given
`StopListPanel` with its markup and styles; `stopListOptions` and
`hasStopped` in `menu.js`. No stub for the container: nothing imports it
before §4.6.

**Tests** (`tests/StopList.test.jsx`, 7, through `<App />` except the
first):

- `useStopList` поза `StopListProvider` кидає помилку, у якій названо
  `StopListProvider`;
- напій зі стоп-листа не можна додати до замовлення;
- молоко й сироп зі стоп-листа не можна обрати для напою у формі;
- «Надіслати бариста» вимкнена, поки в замовленні є позиція зі стоп-листа;
- картки в «Нові» й «Готуються» з позицією зі стоп-листа показують «Є позиції
  зі стоп-листа», а в «Готові» й «Видані» — ні;
- зміна стоп-листа не потрапляє в історію змін;
- зміна стоп-листа не перерендерює кнопки історії.

The last test is the only one of the seven that tells a separate context
from a stop-list kept in `QueueProvider`: that variant passes every
behaviour check (checked with the probes; what it does is in
`solution/README.md`). The one before it is meant to catch a stop-list put
into the queue's reducer, a variant the build adds. The send-button test
includes a drink added with a stopped default milk (decision 18).

### §4.8. +1: the queue in Zustand behind the same hooks

Optional, for 1 point, done in class once §4.1–§4.7 are on GitHub, as
ЛР-11's §4.8.

**Що має вийти.** `zustand` in `lab-12`'s dependencies; `QueueProvider`
creates one store per provider with `createStore`, keeps it for the
provider's lifetime (the prototype uses `useState`'s initializer), and
passes the store, not the state, through context, the pattern of Zustand's
«Initialize state with props» guide; `useQueue` and
`useQueueDispatch` read it with `useStore(store, selector)`. The reducer
stays ЛР-11's: the store's `dispatch` calls `withUndo(queueReducer)`. No
component changes, and every test passes unchanged, the re-render ones
included. One commit, `refactor: keep the queue in a Zustand store`. The
report says in a few sentences what changed in how the page renders and what
the hooks hid.

**Why a store per provider, not Zustand's usual module-level `create`.** A
module-level store would be shared by every test in a file and carry one
test's orders into the next, which is what ЛР-11's `loadOrders()` was made
to avoid; with a provider, each render of `App` starts fresh. **Why
`useShallow`.** `useQueue` returns a new object, and Zustand's guide shows
`useShallow` for selectors that compute one. It isn't optional here: without
it, React reports «The result of getSnapshot should be cached to avoid an
infinite loop» and then «Maximum update depth exceeded», and 12 of ЛР-11's
page tests fail (checked). Both are one line in the handout; §6 asks.

## What the tests check, and what they don't

- **ЛР-11's page tests stay** as `tests/App.test.jsx`: the ten tests from
  ЛР-11 that render `<App />` (the board, «Деталі», the history buttons, and
  placing an order through the form). They pass on the starter and at every
  stage, and show that a move broke nothing. ЛР-11's reducer tests are
  dropped (the reducers don't change), and so are its two tests that render
  `OrderComposer` alone, which can't pass once the form reads `dispatch`
  from a provider (checked).
- **The props a component receives,** through `vi.mock(path, { spy: true })`
  on the component's module: the spy is called with the props on every
  render (checked on React 19.3). §4.4.
- **How many times a component renders,** through the same spy: clear it,
  click, count the calls. In StrictMode one render is two calls, so the
  tests assert "no calls", never a number. §4.5, §4.6.
- **Hooks outside their provider,** with `renderHook`: the error surfaces to
  the test and React prints nothing to the console (checked).
- **Components inside a provider without `App`** (§4.5). These renders also
  give an empty stop-list through the given `StopListContext`, so they keep
  passing once the cards read the stop-list in §4.6 (checked: without it they
  throw).
- **Everything in StrictMode,** through ЛР-11's `renderStrict` helper.
- **Not the internals:** `use` or `useContext`, the shape of the stop-list's
  state, whether `DraftItem` reads a hook or a prop, how «Деталі» find their
  order, `useState` or `useReducer` in `StopListProvider`.

## ESLint in this lab

Checked with ЛР-11's config (`eslint-plugin-react-hooks` 7.1.1,
`eslint-plugin-react-refresh` 0.5.8 through `reactRefresh.configs.vite`):

- **react.dev's single file fails.** A `.jsx` that exports `QueueProvider`
  next to `useQueue` and `useQueueDispatch` gets two
  `react-refresh/only-export-components` errors: «Fast refresh only works
  when a file only exports components. Use a new file to share constants or
  functions between components.»
- **A context next to a component fails too,** with its own message: «Move
  your React context(s) to a separate file.»
- **The split passes:** contexts and hooks in a `.js` module, the provider
  alone in a `.jsx`. That's why the starter's stubs come in that shape, and
  why the provider's file imports contexts that Kent C. Dodds would keep
  unexported. §6 asks about both.
- Every prototype stage, the wrong variants and the Zustand +1 lint clean.

## Design principles

ЛР-7's and ЛР-11's principles apply. In addition:

1. **Props, then `children`, then context,** in react.dev's order, each in
   its own commit.
2. **Measure before and after.** The two tables in `MEASUREMENTS.md` make
   "fewer props" and "fewer renders" things students see, not things they
   are told.
3. **Tests check what the move changes,** because the page doesn't change.
4. **The hooks are the boundary.** After §4.5, components know `useQueue`
   and `useQueueDispatch`, not the contexts, which is what lets §4.8 change
   the transport without touching a component.
5. **One concern per context,** and state stays local when one component or
   one level needs it.
6. **No memoization.** Where the state sits is the only tool; `memo` and the
   hooks around it are ЛР-15's.

## Timing

The slot is 80 minutes.

| Step | Handout | Minutes |
| --- | --- | --- |
| Starter, `npm install`, `npm test`, first commit | §4.1 | 5 |
| The AI rule, as in ЛР-11 | §4.2 | 1 |
| The props table, `OrderColumn` with `children` | §4.3 | 8 |
| Two contexts from `App`, both tables | §4.4 | 10 |
| `QueueProvider`, the hooks, the Profiler table again | §4.5 | 19 |
| The stop-list, its container | §4.6 | 16 |
| Checks, `git push`, the Vercel project | §4.7 | 5 |
| **The lab** | | **64** |
| +1: Zustand | §4.8 | 12 |

These are estimates; the timed dry run decides. A proxy from the prototype,
counting code lines written by hand (not blank, not comments, not
re-indented): §4.3 about 15, §4.4 about 20, §4.5 about 70, §4.6 about 60
(the `StopList` container's 6 included), together about 165, against
ЛР-11's 223, ЛР-7's 212 and ЛР-8's 132. The rows give each challenge its
lines at about 4.4 a minute, plus about 15 minutes for the tables and the
test runs: 5 each in §4.3 and §4.4, where React DevTools' two panels are
new, 3 in §4.5 and 2 in §4.6. That pace is faster than ЛР-7's (4.0 lines a
minute) and ЛР-8's (2.7), as ЛР-11's estimate was. At ЛР-7's pace the
challenges take about 56 minutes and the lab about 67, past the 65-minute
line below; at ЛР-8's, about 76 and 87, past the 80-minute slot. How long
ЛР-11 took in class is the better guide, and the instructor knows it by the
time the lab is built. If the lab takes longer than 65 minutes, the cuts, in
order:

1. drop the milk and syrup rules from §4.6 (one test less): the form still
   disables stopped drinks and the send button;
2. give `useStopList` in the starter, so §4.6 is the provider and the
   components that read it (one test less);
3. record the Profiler table once, after §4.5, instead of twice;
4. make §4.6 the +1 task, done after §4.7's checks, and Zustand an ungraded
   extra.

## Starter: `starters/react/lab-12/` → `/uk/react/starters/lab-12.zip`

Packed like ЛР-11's: `python docs/web/build-pack.py starters/react/lab-12`
after the starter is committed. Configs are ЛР-11's.

```text
starters/react/lab-12/
├── .gitignore, .prettierrc.json, eslint.config.js, vite.config.js, jsconfig.json   ЛР-11's
├── index.html             lang="uk", <title>ЛР-12. Черга замовлень</title>
├── package.json           "name": "lab-12"; ЛР-11's scripts and devDependencies
├── README.md              the app, «Що вже є», the commands
├── MEASUREMENTS.md        two empty tables: «Пропи, які компонент лише передає далі»,
│                          «Які компоненти рендеряться, коли бариста відмічає напій»
├── public/favicon.svg
├── src/
│   ├── main.jsx           <StrictMode>, as always
│   ├── App.jsx            ЛР-11's reference: useReducer(withUndo(queueReducer), …), openedId
│   ├── index.css          ЛР-11's, plus the stop-list panel and the two notes
│   ├── data/              menu.js (+ stopListOptions, hasStopped), orders.js (ЛР-11's)
│   ├── model/
│   │   ├── draftReducer.js, queueReducer.js, withUndo.js   ЛР-11's reference
│   │   ├── queueContext.js       stub (§4.4 contexts, §4.5 hooks)
│   │   ├── QueueProvider.jsx     stub (§4.5)
│   │   ├── stopListContext.js    StopListContext given; useStopList stub (§4.6)
│   │   └── StopListProvider.jsx  stub (§4.6)
│   └── components/        ЛР-11's seven, plus StopListPanel (given, not on the page yet);
│                          StopList.jsx, its container, is written in §4.6
└── tests/                 setup.js, page.jsx (renderStrict, finders, a provider wrapper),
                           App.test.jsx (ЛР-11's ten page tests) and the files named
                           under each challenge
```

ЛР-11's reference includes its focus handling (`flushSync` in the given
components, one line in `OrderComposer`); the starter keeps it, and §4.5's
handout reminds students to keep the line when the form's submit handler
changes, as ЛР-11's §4.3 did.

## Handout: `src/content/labs/react/uk/lab-12.md`

About ЛР-11's length or shorter, with no solution code: the contexts'
values, the hooks' names and errors, and the stop-list's rules. Frontmatter
as in ЛР-11, with `number: 12`, the programme's title, and
`duration: "2 академічні години (самостійна робота — 2 години)"`, as ЛР-11's
after 2026-11-22. `handout:` is added once the PDF is built after the
instructor's review. Ukrainian only; English later. Written in ЛР-11's
revised style: definitions as full sentences, no story frames, literal
names for tables and steps, no «живе».

Draft `summary`: «Черга замовлень з ЛР-11, тепер без зайвих пропсів: чотири
code challenges з готовими тестами Vitest. Колонка дошки отримує картки
через children, стан черги й dispatch передаються через контекст, а потім —
через компонент-провайдер і власні хуки. Стоп-лист кав'ярні стає другим
глобальним станом з окремим контекстом. Що змінилося, видно в таблицях
пропсів і рендерів з React DevTools. +1 бал: та сама черга в сховищі
Zustand. Деплой на Vercel.»

**Top note.** The usual «Примітка щодо актуальності», naming React 19,
Vitest 5, React DevTools 8 and Zustand 5.

### §1. Мета роботи

Draft, in ЛР-11's revised form (a lead sentence and one bullet per
challenge):

«Навчитися передавати дані компонентам, що розташовані глибоко в дереві, без
зайвих пропсів:

- знаходити пропси, які компонент лише передає далі, і прибирати їх
  композицією: компонент отримує готові дочірні елементи через `children`;
- передавати стан ред'юсера і `dispatch` через контекст замість пропсів;
- переносити стан у компонент-провайдер і читати його через власні хуки, які
  повідомляють, якщо провайдера немає;
- тримати окремі дані в окремих контекстах, щоб зміна одних не рендерила
  компоненти, яким потрібні інші.»

The handout's §4 intro then defines the terms as full sentences: prop
drilling «означає, що проп передають через компоненти, яким він не
потрібен, лише щоб він дійшов до компонента нижче»; a context; a provider;
a consumer of a context.

**Очікуваний результат:** `lab-12/` passes `npx vitest run` (all tests),
`npm run lint`, `format:check` and `build`; both tables in
`MEASUREMENTS.md` are filled; the page works as in ЛР-11, with the
stop-list, in `npm run dev`; the app is on Vercel. Screenshot
`/uk/react/labs/lab-12/result.webp` at 1280 px: «вівсяне» on the stop-list,
№ 44 and № 46 marked, a draft in the form.

### §2. Корисні посилання

The readings table, in its order, with ЛР-11's opening paragraph: before
class, react.dev's two context pages and Kent C. Dodds's «Prop Drilling»;
the rest when a challenge points to it. Inline links, as ЛР-11's after
2026-11-22, and a note on which pages are in Ukrainian.

### §3. Завдання

ЛР-11's list: §4.1 starter; §4.3–§4.6 with their topic; §4.7 checks and
Vercel, §5 report; §4.8 +1. Then ЛР-11's notes: all in class, 1 point after
the defence plus 1 for §4.8, unfinished challenges at home, and the AI line
pointing to §4.2.

### §4. Хід виконання

- **4.1. Стартовий проєкт.** ЛР-11 §4.1 with `lab-12`, plus `MEASUREMENTS.md`
  in the file table. `npm test`: ЛР-11's ten page tests pass from the start,
  and the handout says why (they check that the page still works). ESLint
  shows no problems. Commit `chore: add lab 12 starter`.
- **4.2. Правила роботи з AI.** ЛР-11's rule.
- **4.3–4.6.** As under **The challenges**, with these commits:
  `refactor: pass the cards to OrderColumn as children`;
  `refactor: share the queue through context`;
  `refactor: move the queue into QueueProvider`;
  `feat: add the stop-list`.
- **4.7. Перевірки, GitHub і Vercel.** All checks; `git push`; a new Vercel
  project `react-lab-12` with Root Directory `lab-12`. The history is the
  starter's commit plus four.
- **4.8. +1.** As above; `npm install zustand -w lab-12` from the root.

### §5. Вимоги до звіту

Subject `[React] ЛР-12: Context API і prop drilling`, with ЛР-11's two lines
for `lab-12`. The report contains:

1. a screenshot of `npx vitest run` with all tests passing;
2. a screenshot of `npm run lint`, `format:check` and `build`;
3. both tables from `MEASUREMENTS.md`, copied or linked on GitHub;
4. per challenge, one or two sentences on what changed;
5. whether §4.8 was done, and if so its few sentences;
6. whether AI was used, and for what;
7. a short conclusion.

### §6. Усний захист

ЛР-11's intro. Grouped interview questions, answerable from the lab and its
readings, asking to explain or compare rather than to recall:

- **«Prop drilling»:** what it means; when passing props is the right choice
  (react.dev, Kent C. Dodds); which props the starter passed through which
  components, from the first table.
- **«Композиція»:** how `children` removes a layer of props; why `OrderColumn`
  takes a count instead of counting its children; when `children` isn't
  enough and context is.
- **«Контекст»:** what `createContext`'s argument is for; how a component
  finds its provider; `<Context value>` against `<Context.Provider>`; `use`
  against `useContext`; what happens to the components between the provider
  and a consumer.
- **«Ред'юсер і контекст»:** why react.dev puts `dispatch` into a context of
  its own where Kent C. Dodds keeps one context, and how Nadia Makarevich's
  split of state and API answers it; why the form creates an order's ids
  since §4.5.
- **«Провайдер і хуки»:** what `QueueProvider` owns and what `App` still
  owns; whether §4.5's removed props change the first table, and why; why
  the hooks throw instead of returning the default; when a default value is
  the better choice; why the provider and the hooks are in two files here;
  why the provider's file has to import the contexts; why `App` can't read
  `useStopList`, and what the `StopList` container does instead.
- **«Ре-рендери»:** when React renders a context's consumers again; the
  second table after §4.4 and after §4.5, and why it changed in a commit that
  didn't change the page; why `QueueProvider` creates a new value object on
  every render and still needs no `useMemo`; when react.dev's `useMemo`
  advice would apply; why opening «Деталі» renders the form again and what
  would change that.
- **«Глобальний стан»:** what belongs in context (react.dev's use cases);
  why the stop-list has its own context; why it isn't in the undo history;
  why the draft and the opened order's id aren't in context; Mark Erikson's
  claim that context doesn't manage state, on this lab's code.
- **«Тести»:** how a test checks that a component doesn't receive a prop;
  how it counts renders and why it never asserts a number; `renderHook`
  without a provider; why the provider tests give an empty stop-list.
- **«Zustand»:** what the context carries in §4.8 and what renders the
  components; a store per provider against a module-level store; why
  `useShallow`. Asked of everyone at the level of the readings, and in depth
  of those who did §4.8.

The handout's §6 will be the full list; the answers go in
`solution/README.md`.

### §7. Критерії готовності

«Лабораторна робота оцінюється в 1 бал після захисту (§6); §4.8 — ще 1
бал.» The main table:

| Критерій | Мінімальна вимога |
| --- | --- |
| Тести | у теці `lab-12` `npx vitest run` проходить: усі тести; файли в `tests/` не змінено в жодному коміті |
| Якість | `npm run lint` без помилок і попереджень; `format:check` і `build` — без помилок |
| Пропси | `OrderColumn` отримує картки через `children`; жоден компонент не отримує через пропси `queue`, `dispatch`, `canUndo`, `canRedo`, `onUndo`, `onRedo` чи `onPlace` |
| Провайдери | `QueueProvider` і `StopListProvider` у `src/model/`; хуки повідомляють, якщо провайдера немає |
| Стоп-лист | правила з §4.6 на сторінці; зміни стоп-листа не потрапляють в історію |
| Вимірювання | обидві таблиці в `MEASUREMENTS.md` заповнено |
| GitHub | коміт стартового проєкту й по одному на кожне завдання §4.3–§4.6 |
| На занятті | усі коміти відправлено на занятті; незавершене — вдома, як у ЛР-11 |
| Vercel | проєкт з Root Directory `lab-12`; адреса показує застосунок з останнього коміту `main` |
| AI | §4.2 дотримано; у звіті вказано, як використовувався AI |
| Звіт | усі пункти §5 |

And for §4.8: `zustand` in `lab-12`'s dependencies; `QueueProvider` passes a
store through context; no component changed in that commit; all tests pass;
the commit pushed in class after §4.7's; the sentences in the report.

## Files to create or change

- `starters/react/lab-12/` (above);
- `public/uk/react/starters/lab-12.zip`: built by `build-pack.py` after the
  starter's commit, in its own commit;
- `src/content/labs/react/uk/lab-12.md`: the handout;
- `public/uk/react/labs/lab-12/result.webp`, from the reference in headless
  Edge;
- `public/uk/react/labs/lab-12.pdf`: `python docs/web/build-handout.py
  lab-12 react`, after the instructor's review;
- `docs/react/lab-12/solution/` (gitignored; the `.gitignore` line comes
  with this plan): the prototype today; at build time, the reference as one
  stage per challenge, the wrong variants, the measurements, the defence
  answers and a `shots.mjs`;
- `docs/react/lab-12/README.md`: the lasting facts and what was verified,
  with no answers;
- `docs/react/course-plan.md`: a ЛР 12 row in **How the site maps to the
  plan**; the «not built» row becomes `ЛР 13–27`; the date above the table;
  ЛР 12's §4.8 in the extra-points paragraph (current work can then reach
  71); the context note in **Notes for building the course** says ЛР 12
  practises global state, prop drilling and re-renders;
- `README.md` (root): a `lab-12/` line in the `starters/react/` tree.

Work on `feat/react-lab-12` from `main`. The starter contains ЛР-11's
reference solution, so the branch stays local until the last group's ЛР-11
class, as ЛР-11's plan said and as `feat/react-lab-8` did for ЛР-7.

## Verification

**Checked while writing this plan (2026-11-24)** on a prototype in a scratch
`react-labs` workspace, on Windows 11 with Node.js 24.20.0 and npm 11.19.0:
React 19.3.1, Vite 8.3.8, Vitest 5.1.1, jsdom 31.0.1, React Testing Library
16.3.3, user-event 14.6.13, ESLint 10.15.0 with ЛР-11's config,
`eslint-plugin-react-hooks` 7.1.1, `eslint-plugin-react-refresh` 0.5.8,
Zustand 5.1.0. The prototype starts from ЛР-11's reference (40 of 40 tests,
lint clean) and adds §4.3–§4.6, a single-context variant, a stop-list kept in
`QueueProvider`, and the Zustand +1, with four probe files. The results per
stage and per variant are in `solution/README.md`; what follows records what
was checked.

- **ЛР-11's tests at every stage:** all 40 pass after §4.3 and §4.4; after
  §4.5 only the two that render `OrderComposer` alone fail, as expected, so
  the page tests can carry over and those two can't.
- **A module spy records a component's props and renders:** with
  `vi.mock(path, { spy: true })` on a component's module, `App` renders the
  spy, the first argument of each call is the props, and in StrictMode each
  render is two calls. The props each component receives match the starter's
  code and change at §4.4 and §4.5 as the challenges intend.
- **What each challenge's tests will assert, measured on every stage** by
  the probes (they log values rather than assert them): the props of §4.4's
  tests, the form's renders on a tick for §4.5, the history buttons' renders
  on a stop-list change for §4.6, the hooks' errors and the stop-list's
  rules. On each, the stage before the challenge gives the value the test
  will reject and the stage after the one it will accept. The single-context
  variant and the stop-list kept in `QueueProvider` each differ from the
  reference only in renders, so only §4.5's and §4.6's render tests can
  catch them.
- **Hooks outside a provider:** `renderHook` surfaces the hooks' errors to
  the test, and React 19.3 prints nothing to the console.
- **Isolated renders after §4.6:** a board rendered in `QueueProvider` throws
  once the cards read the stop-list, and works when the test gives an empty
  stop-list through `StopListContext`.
- **The stop-list's rules** on the seed orders, as under **The app**,
  including that toggling it leaves «Скасувати дію» disabled.
- **ESLint:** as under **ESLint in this lab**.
- **Zustand 5.1.0** accepts React 19 (`react >=18.0.0` in its peer range);
  the store-per-provider version passes ЛР-11's page tests and every probe,
  and lints clean; without `useShallow` it loops (see §4.8).
- **React's `Children` reference** opens with the pitfall the handout quotes
  in §4.3.
- **Readings:** the anchors in the table were read from the pages on
  2026-11-24, on `react.dev` and `uk.react.dev`; which pages are translated,
  and that `uk.react.dev`'s `use` page differs from the English one; the
  quoted sentences; the articles' dates; the Zustand guides' URLs (the short
  `/guides/…` forms return 404); Nadia Makarevich's article (2022-02-07 in
  the page's metadata, no update date; its section titles, the quoted phrase,
  and its use of `<Context.Provider>` and `useContext`).

**To check during the build:**

- the full starter and the reference as one stage per challenge, each
  through the tests (with the expected failures), lint, Prettier and the
  build; the exact test counts for §1, §4.1, §5 and §7;
- that each stub fails with a readable message, and that no test imports
  `QueueContext` or `QueueDispatchContext`: a test that set their value
  directly would fail on §4.8's store (decision 8);
- the stop-list rules on the reference, including «+ Лате» with «звичайне»
  stopped (decision 18), and `StopList.jsx` linting clean;
- **React DevTools 8**: the Components panel's props for the first table and
  the Profiler's flame graph for the second, on the stages, as ЛР-11 did
  through `react-devtools-inline`; whether «Record why each component
  rendered» is worth a line in the handout;
- the wrong variants as a set (single context, stop-list in `QueueProvider`,
  stop-list in the queue's reducer, `QueueProvider` without `children` that
  renders the page itself, hooks that return `null`), each failing at least
  one test or the lint;
- the page in headless Edge at 390, 1000 and 1280 px with the stop-list panel
  in the header: no horizontal scroll, focus visible on its checkboxes, and
  no control that drops focus to `<body>`; the screenshot;
- the timed dry run as a student, without AI: §4.3–§4.6 in about 53 minutes
  plus setup, §4.8 in about 12; otherwise the cuts under **Timing**;
- the zip stores LF and passes `format:check` after unpacking; `npm install`
  in an existing `react-labs` adds `lab-12`; §4.8's `npm install zustand -w
  lab-12` from the root; Vercel builds `lab-12` and doesn't run the tests;
- `npm run check && npm run build` for the site; the labs index lists
  ЛР-12.

## Decisions

**Settled before this plan:**

1. **The app is ЛР-11's order queue** (ЛР-11's decision 2): the starter is
   ЛР-11's reference, with the queue's state and `dispatch` in `App`.

**Proposed in this plan:**

2. **Format:** ЛР-11's code challenges with given Vitest tests, all in class,
   AI explains only, 1 point; plus one optional task for 1 more point,
   started in class once the main part is pushed.
3. **Props, then `children`, then context.** §4.3 removes a layer with
   composition before any context, as react.dev's «Before you use context»
   advises.
4. **The queue's context in two steps:** first provided from `App` (§4.4),
   then from `QueueProvider` (§4.5), following react.dev's page. The second
   step changes what renders without changing the page, and §4.5's
   render-counting test shows it.
5. **The second global state is a stop-list,** the topic ЛР-11's plan had as
   its ungraded §4.9 before it was dropped, in its own context and provider,
   outside the queue's undo history.
6. **The +1 is Zustand behind the same hooks,** a store per provider, with
   every test unchanged. Moving the opened order's id out of `App` (so
   opening «Деталі» doesn't render the form) was the other candidate; it
   stays a defence question.
7. **Tests:** ЛР-11's ten page tests stay as `tests/App.test.jsx`; ЛР-11's
   reducer tests and its two tests of the form alone are dropped.
8. **§4.4's tests check props, not the contexts' values,** so any way of
   delivering the queue passes them, §4.8's store included.
9. **The hooks throw an error that names the provider,** Kent C. Dodds's
   pattern, where react.dev's hooks return whatever the context holds.
10. **The stubs come as two files per context,** contexts and hooks in a
    `.js` module and the provider alone in a `.jsx`, because of
    `react-refresh/only-export-components`.
11. **`StopListContext` is given in the starter,** with `useStopList` and the
    provider as stubs, so §4.5's tests can give an empty stop-list to the
    components they render without `App`.
12. **Two tests assert re-renders:** the form after a tick (§4.5) and the
    history buttons after a stop-list change (§4.6). Re-renders are otherwise
    measured in `MEASUREMENTS.md`, not tested.
13. **`MEASUREMENTS.md`** in the starter with two empty tables, as ЛР-10's
    `STRUCTURES.md`, copied into the report.
14. **The opened order's id and the draft stay out of context.**
15. **No ungraded self-study section,** as in ЛР-11 after the instructor
    dropped its §4.9 on 2026-11-20. The programme's 2 hours of self-study are
    the readings and unfinished work.
16. **Ukrainian first,** English later.
17. **Out of scope:** `memo`, `useMemo`, `useCallback` and the React Compiler
    (ЛР-15); an authentication context and routing (ЛР-13); Redux Toolkit
    and `use-context-selector` (Lecture 4's presentations); typing contexts
    (ЛР-19, П8.8); saving the stop-list.
18. **A drink whose default milk is stopped can still be added.** It arrives
    with that milk, the form shows its note, and «Надіслати бариста» stays
    disabled until the milk is changed, so `draftReducer` stays ЛР-11's.
    Disabling the drink's button instead would also block a latte with oat
    milk, and adding the drink with the first milk not on the stop-list
    would change ЛР-11's reducer.
19. **The stop-list panel is given as a presentational component,** with
    the stop-list as props, and students write the `StopList` container
    that reads `useStopList`, ЛР-7's Container/Presentational. A panel that
    read the hook itself would leave nothing to connect, and the question of
    why `App` can't read the hook would never come up.

# Plan: React ЛР-8 «Патерни проєктування React. Частина 2 (Compound Components, HOC)»

Status: proposed on 2026-11-14 together with ЛР-7, and revised on
2026-11-15. The format settled on 2026-11-14 applies to both labs: code
challenges checked by given Vitest tests, all done in class, one app shared
with ЛР-7, and AI that explains but doesn't write code. On 2026-11-15 the
instructor added the children-as-prop pattern, which became C1's theme (see
**Decisions**). A prototype of the starter, the tests and a reference
solution was built and checked both days; it lives in the gitignored
`solution/` folder next to this file. Nothing is built in the site yet. Once
the lab is built, the lasting facts move to this folder's `README.md`.

The shared parts are described once, in ЛР-7's plan,
[../lab-7/custom-hooks-and-render-props-plan.md](../lab-7/custom-hooks-and-render-props-plan.md):
the challenge format and its reasons, the app, the test tooling, what the
tests do and don't check, the AI rules, and the settled decisions 1–5. This
plan covers what ЛР-8 adds.

## Context

From [../course-plan.md](../course-plan.md), row 2.3:

- **Тема:** «Патерни проєктування React. Частина 2 (Compound Components,
  HOC)»
- **Самостійна робота:** «Імплементація складових компонентів» (2 год.)
- **Читання:** Основна 5 (Makarevich, *Advanced React*)
- **Position:** after ЛР-7 and before ПМК 1 (ЛР-9). Lecture 3 has introduced
  both patterns; presentation topics П3.4 (HOC), П3.5 (Compound Components
  and accessibility, with `<Tabs>` as its demo) and П3.8 (composition through
  `children` and slots) are defended there.

**Children as prop, beyond ЛР-2.** ЛР-2 §4.5 built react.dev's `Card`, a
wrapper that renders whatever sits between its tags. ЛР-8 takes the next step,
which the instructor asked for on 2026-11-15: a wrapper **with its own
state** whose content still comes from the parent as `children`. Two things
follow. The content doesn't re-render when the wrapper's state changes,
because the parent created those elements. And that is how a context
provider is built: `<TabsContext value={…}>{children}</TabsContext>`. The
compound `Tabs` is exactly such a provider, so the pattern becomes C1's theme
instead of a separate challenge.

What ЛР-7 leaves for this lab:

- **The app,** with `useLocalStorage`, `useCountdown`, `ShowMore`,
  `useShowMore`, and the timer split into `BrewTimer` (container) and
  `TimerView` (presentational). ЛР-8's starter is ЛР-7's reference solution
  plus ЛР-8's additions.
- **Custom hooks.** A compound component's parts read shared state through a
  small hook that throws outside its parent, which is ЛР-7's pattern applied
  to context.
- **Conditional rendering and position in the tree.** ЛР-7's C2 kept focus by
  keeping an element at the same position. ЛР-8's starter hides tabs with
  `&&`, which unmounts them, so the running timers give C1 a real
  requirement.

**Context before ЛР-12.** A compound component shares its state through
context, and ЛР-12 is the lab about Context API («Глобальний стан за
допомогою Context API та вирішення проблеми Prop Drilling»). ЛР-8 uses
`createContext` and `use` only as the private channel between `Tabs` and its
parts. Global state, prop drilling and the cost of re-renders across an app
stay with Lecture 4 and ЛР-12. The course plan should say so when the ЛР-8
row is added.

### The readings

Checked on 2026-11-14 and 2026-11-15. Language: all **English**; the
`uk.react.dev` addresses serve English.

| Page | Use |
| --- | --- |
| react.dev: [Passing Props to a Component](https://uk.react.dev/learn/passing-props-to-a-component) | `#passing-jsx-as-children`, the "hole" a parent fills: a recap of ЛР-2 (C1) |
| CraftValue: [The Children Prop Pattern in React](https://www.craftvalue.io/blog/react-children-prop-pattern) (2022) | before class; composition, when the pattern can't be used (the content needs the wrapper's state), and its performance section: the wrapper's state change doesn't re-render content passed as `children`. It doesn't cover context; C1 does (C1) |
| Developer Way: [The mystery of React Element, children, parents and re-renders](https://www.developerway.com/posts/react-elements-children-parents) (2022) | optional; the same mechanism explained through React elements (C1) |
| react.dev: [Passing Data Deeply with Context](https://uk.react.dev/learn/passing-data-deeply-with-context) | `#step-1-create-the-context`, `#step-2-use-the-context`, `#step-3-provide-the-context` (shows the React 19 `<Context value>` provider) (C1) |
| react.dev: [`use`](https://uk.react.dev/reference/react/use) and [`useId`](https://uk.react.dev/reference/react/useId) | reading context (C1); unique ids for `aria-controls` (C2); anchors to check |
| patterns.dev: [Compound Pattern](https://www.patterns.dev/react/compound-pattern) | before class, **for the idea only**: its `FlyOut` toggle is a `div` with no role or keyboard support, and its `cloneElement` version calls `useContext` with no provider, so it fails as written (C1) |
| W3C WAI-ARIA APG: [Tabs Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) and its [automatic-activation example](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/examples/tabs-automatic/) | before class; roles, `aria-selected`, `aria-controls`, `aria-labelledby`, `tabindex="0"` on the panel, arrows/Home/End (C2) |
| patterns.dev: [HOC Pattern](https://www.patterns.dev/react/hoc-pattern) | before class; current: `displayName`, prop collisions, `ref` as a prop in React 19, composition, HOC versus hooks; its first example is a `withAnalytics` (C3) |
| Developer Way: [Higher-Order Components in React Hooks era](https://www.developerway.com/posts/higher-order-components-in-react-hooks-era) (2022) | where HOCs still earn their place: enhancing callbacks such as `onClick` (C3) |
| react.dev: [Preserving and Resetting State](https://uk.react.dev/learn/preserving-and-resetting-state) | `#different-components-at-the-same-position-reset-state`, which also says not to nest component definitions (C4) |
| react.dev: [`static-components`](https://react.dev/reference/eslint-plugin-react-hooks/lints/static-components) lint | C4. The page shows components defined during render, not HOC calls, so ESLint's message in the starter extends it to the student's case |
| react.dev: [`Children`](https://uk.react.dev/reference/react/Children), Alternatives | optional: why `Children` and `cloneElement` are legacy APIs, the other way to build compound components |

The programme's book has chapters on children and on HOCs; the two Developer
Way articles above are their free counterparts. For refine.dev's article, see
ЛР-7's plan. It isn't linked here either: its HOC section uses a class
component and its compound section never imports `useContext`.

## The app: what ЛР-8 adds

The starter is ЛР-7's reference solution plus:

| Addition | Where | For |
| --- | --- | --- |
| `src/components/ProductTabs.jsx`: a first attempt at tabs that imports the three sections and shows one with `{tab === 'brew' && …}`; `App` renders `ProductCard` and `ProductTabs` | given, the starting problem | C1 |
| `src/components/Tabs.jsx`: a stub with the compound API in JSDoc | C1, C2 | children + context, compound component |
| `src/analytics.js`: `track(event, data)` writes `[analytics] …` to the console, an imitation of an analytics service | given | C3, C4 |
| `src/components/Button.jsx`: a `<button type="button">` that spreads its props | given | C3, C4 |
| «Додати в кошик» and a `role="status"` line «У кошику: N» in `ProductCard` | given | C3 |
| `src/hoc/withAnalytics.jsx`: a stub that returns the component unchanged | C3 | HOC |
| `TimerView`'s first button goes through `withAnalytics` | given, seeded | C4 |
| `tests/c1-…` to `c4-…` (27 tests); ЛР-7's tests are not carried over | given | all |

The page looks as at the end of ЛР-7, with the sections behind the
`ProductTabs` buttons and the cart button added. After the lab, the same
three sections sit in accessible tabs under the product card.

### ЛР-7's answers in ЛР-8's starter

The starter contains ЛР-7's solution, so publishing ЛР-8 publishes ЛР-7's
answers. ЛР-6 avoided the problem because ЛР-5's handout printed all its
code; ЛР-7's handout doesn't. Publishing here means more than the zip:
`starters/react/lab-8/` is source code in a public repository, so pushing
`feat/react-lab-8` or opening its PR, even as a draft, shows ЛР-7's reference
solution file by file. What limits the damage:

- the branch stays local, with no push and no PR, until the last group's
  ЛР-7 class. The instructor reviews it on the local dev server before then,
  and the push, the PR, CI and the merge fit between that class and the first
  ЛР-8 class;
- ЛР-7 is done entirely in class and graded by push times on GitHub
  **Activity**, so ЛР-7's code is in before ЛР-8 is public. The exception is a
  student who finishes ЛР-7 at a make-up afterwards (ЛР-7's decision 10);
- the ЛР-7 defence includes a live change without AI.

The alternative, a ЛР-8 starter without ЛР-7's hooks and views, would need
ЛР-7's duplicated code and broken timer back, and C1's timer requirement
would lose its meaning. See **Decisions**.

## The challenges

Format, commits and the rule that `tests/` never changes are as in ЛР-7.

### C1. `Tabs`: content as `children`, state through context

**Що має вийти.** The page looks as before, but the tabs are built from a
reusable compound component, and `App` hands it the content:

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
  …
</Tabs>
```

Requirements: each part takes its content as `children`; `Tabs` keeps the
selected value and passes it to its parts through context, so no part gets it
as a prop; a timer started on «Заварювання» keeps running while another tab
is open; switching tabs doesn't render the panels' content again;
`Tabs.Tab` outside `<Tabs>` throws an error that names `<Tabs>`; only `Tabs`
is exported from `Tabs.jsx`; `ProductTabs.jsx` is deleted.

**Що вже є.** The stub with the usage above in JSDoc, and `ProductTabs`,
which works but has three problems the handout asks students to see before
they start: the timer resets on every switch; the component can't be reused,
because it imports its content; and each switch renders the sections again
(**Highlight updates** in React DevTools shows it).

**Tests** (`tests/c1-tabs-children.test.jsx`, 8):

- `Tabs.Panel` показує будь-який JSX, переданий між тегами;
- клік по `Tabs.Tab` показує його панель і ховає іншу;
- схована панель зберігає свій стан;
- `Tabs.Tab` поза `<Tabs>` кидає зрозумілу помилку;
- з `Tabs.jsx` експортується лише `Tabs`;
- «Заварювання», «Відгуки (10)» і «Схожі товари» перемикають вміст;
- запущений таймер не скидається після переходу на іншу вкладку;
- перемикання вкладок не рендерить вміст панелей знову.

C1's tests don't ask for ARIA roles or keyboard support (that's C2), so they
find the tabs by their text. The last test counts how many times
`ReviewList` and `BrewGuide` render, with `vi.mock(path, { spy: true })`: it
checks the children pattern's payoff directly. The starter's `ProductTabs`
fails it (checked); which other wrong `Tabs` fail it is recorded in
`solution/README.md`.

### C2. Accessible tabs, as the APG says

**Що має вийти.** The APG's Tabs pattern with automatic activation. Roles and
states: a `tablist` with a name, `tab`s with `aria-selected` and
`aria-controls`, `tabpanel`s with `aria-labelledby`, ids that stay unique with
two `Tabs` on one page. Keyboard: Tab enters the list on the selected tab and
the next Tab goes to the panel, then past the tabs; → and ← move to the next
or previous tab and select it, wrapping at the ends; Home and End go to the
first and last tab. Automatic activation fits here because the panels are
already on the page, which is when the APG recommends it.

**Tests** (`tests/c2-tabs-a11y.test.jsx`, 10):

- має ролі `tablist`, `tab` і `tabpanel`; видно одну панель;
- `aria-selected` позначає лише обрану вкладку;
- вкладка й панель посилаються одна на одну через `id`;
- два `Tabs` на сторінці не мають однакових `id`;
- на сторінці товару список вкладок має назву «Про каву»;
- у порядку Tab лише обрана вкладка, а далі — панель;
- → переводить фокус на наступну вкладку й обирає її;
- → на останній вкладці переходить на першу, ← на першій — на останню;
- Home і End обирають першу й останню вкладки;
- після вибору стрілкою Tab веде до панелі нової вкладки.

The test example puts a badge inside a tab label (`Третя <span>3</span>`).
This is the kind of freedom that `children` gives and a config-object API
(`tabs={[{ label, content }]}`) makes awkward, and it's a defence question.
`user-event` 14 drives Tab and the arrow keys in jsdom (checked), so these
tests don't need fake timers. The real browser is checked during the build.

### C3. `withAnalytics`: a higher-order component

**Що має вийти.** `withAnalytics(Component, event)` returns a new component
that renders `Component` with the same props and, on click, calls
`track(event, analyticsData)` and then the caller's `onClick`.
`analyticsData` is the wrapper's own prop and doesn't reach the DOM. `ref`
and every other prop do. DevTools show the result as
`withAnalytics(Button)`. «Додати в кошик» sends `add_to_cart` with
`{ productId }`.

**Що вже є.** The stub, which returns `Component` unchanged; `Button`;
`track`; the cart button without analytics.

**Tests** (`tests/c3-with-analytics.test.jsx`, 6; `analytics.js` is mocked):

- повертає новий компонент з назвою `withAnalytics(Button)`;
- під час кліку надсилає подію й викликає `onClick`;
- працює й без `onClick`;
- `analyticsData` іде в `track`, а не в DOM (the test also fails on React's
  console error about an unknown DOM prop);
- решту props і `ref` передає обгорнутому компоненту;
- «Додати в кошик» надсилає `add_to_cart` з id товару.

React 19 passes `ref` as an ordinary prop, so the HOC needs no `forwardRef`.
patterns.dev's page mentions this, and the test checks it.

### C4. A timer button that loses focus: a bug that C3 reveals

**Що має вийти.** A keyboard user can start a timer and then pause it with
the same key: the first button keeps focus while the timer runs, as it did at
the end of ЛР-7. That button sends one event, `timer_control`, with
`{ method, action }`, where `action` is `start`, `pause`, `resume` or
`restart`. The action and the method go into the event data, not into the
event name, the usual analytics convention, since reports group events by
name.

**Що вже є.** `TimerView` as given, which wraps its first button with
`withAnalytics`. From the start, ESLint reports one
`react-hooks/static-components` error in it. The bug shows only once C3's HOC
returns a new component, so a student who runs the page after C3 meets a
regression in code they didn't touch. The defect and its cause are in
`solution/README.md`.

**Tests** (`tests/c4-timer-buttons.test.jsx`, 3):

- «Пауза» не втрачає фокус, поки таймер іде;
- «Старт» надсилає `timer_control` з методом і дією `start`;
- «Пауза» надсилає ту саму подію з дією `pause`.

The first test passes in the starter (the stub returns `Button` itself), fails
after C3, and passes again after C4. The handout says so in C4's «Що вже є»,
so a passing test before C3 doesn't confuse anyone.

### ESLint in this lab

Checked with the same versions as ЛР-7:

- the starter fails lint **on purpose** with one
  `react-hooks/static-components` error in `TimerView` («Cannot create
  components during render»). It's the first React starter that does; ЛР-7's
  had one warning. The handout's §4.1 says so, and §7 requires a clean lint at
  the end;
- dot-notation parts (`Tabs.List = TabsList`) with a private context and hook
  in `Tabs.jsx` pass lint, `react-refresh` included;
- exporting the context or its hook from `Tabs.jsx` gives two
  `react-refresh/only-export-components` errors, which is one reason the
  requirement says only `Tabs` is exported; C1's export test checks it;
- `withAnalytics.jsx`, which exports a lowercase function from a `.jsx` file,
  passes `react-refresh`;
- the reference solution has no problems. Which other fixes ESLint accepts or
  rejects for C4 is recorded in `solution/README.md`.

## Design principles

ЛР-7's principles apply. In addition:

1. **The children pattern is shown by what it changes,** not by a second
   `Card`. The starter's `ProductTabs` and the finished `Tabs` render the same
   page; the timer, **Highlight updates** and a test show the difference.
2. **The APG is the accessibility spec.** The tests encode its Tabs pattern,
   so "accessible" means something checkable here.
3. **The HOC is the modern kind.** It enhances a callback, the use Developer
   Way's article defends. A data-injecting HOC (`withUser`, `connect`) is the
   historical kind that hooks replaced, and it's a defence question, not a
   challenge.
4. **The bug comes from real code.** C4's defect is how a developer would
   write it: the event name depends on the status, so the wrapper ends up
   inside the component.

## Timing

| Step | Handout | Minutes |
| --- | --- | --- |
| Starter, `npm install`, `npm test`, lint (one error), `ProductTabs`'s three problems, first commit | §4.1 | 5 |
| The AI rules, as in ЛР-7 | §4.2 | 1 |
| C1: children, context, the panels, the page, `ProductTabs` deleted | §4.3 | 14 |
| C2: roles, ids, the keyboard | §4.4 | 16 |
| C3: the HOC | §4.5 | 12 |
| C4: the timer button | §4.6 | 7 |
| Checks, `git push`, the Vercel project | §4.7 | 5 |
| **The lab** | | **60** |

If the dry run goes over 60 minutes, the cuts in order are: drop Home/End
from C2; give `useTabsContext` (the guard hook) in the stub; make C2's
keyboard part ungraded (§4.8) and keep its roles and ids.

## Starter: `starters/react/lab-8/` → `/uk/react/starters/lab-8.zip`

Built like ЛР-7's: `package.json` with `"name": "lab-8"` and the same
scripts and devDependencies, `index.html` with `<title>ЛР-8. Кава в
зернах</title>`, ЛР-7's configs.

```text
starters/react/lab-8/
├── (ЛР-7's tooling: configs, index.html, package.json, README.md, public/)
├── src/
│   ├── (ЛР-7's reference solution: data, hooks, components, styles)
│   ├── App.jsx                 ProductCard + ProductTabs
│   ├── analytics.js            track() → console
│   ├── hoc/withAnalytics.jsx   stub: returns the component unchanged
│   └── components/
│       ├── ProductTabs.jsx     the first attempt (C1 replaces it)
│       ├── Tabs.jsx            stub (C1, C2)
│       ├── Button.jsx
│       ├── ProductCard.jsx     + «Додати в кошик», «У кошику: N»
│       └── TimerView.jsx       its first button through withAnalytics (seeded)
└── tests/
    ├── setup.js                ЛР-7's
    └── c1-tabs-children, c2-tabs-a11y, c3-with-analytics, c4-timer-buttons (.test.jsx)
```

`index.css` gains the tab list, the selected tab, the focus ring and the cart
line. `README.md` lists what's new since ЛР-7 and the commands.

## Handout: `src/content/labs/react/uk/lab-8.md`

Same size and frontmatter shape as ЛР-7's, with `number: 8` and `title:
"Патерни проєктування React. Частина 2 (Compound Components, HOC)"`.

Draft `summary`: «Сторінка кави з ЛР-7 отримує вкладки й аналітику: чотири
code challenges з готовими тестами Vitest. Вкладки, вміст яких приходить як
children, а стан — через контекст, складений компонент Tabs з ролями й
клавіатурою за ARIA APG, HOC withAnalytics, що надсилає подію під час кліку,
і баг, який цей HOC відкриває в чужому коді. Деплой на Vercel.»

### §1. Мета роботи

Draft: «Навчитися будувати компоненти-обгортки, які отримують вміст через
children і передають свій стан частинам через контекст, робити такі складені
компоненти доступними за ARIA APG, писати компоненти вищого порядку й
бачити, коли HOC шкодить.»

**Очікуваний результат:** `lab-8/` passes `npm test` (27 of 27) and `npm run
lint` with no problems; the three sections in tabs that keep a running timer
and work from the keyboard; «Додати в кошик» and the timer button write
`[analytics]` lines to the console; the app is on Vercel. Screenshot
`/uk/react/labs/lab-8/result.webp`: the page with the «Відгуки» tab
selected and the focus ring on it.

### §2–§5

As in ЛР-7, with this lab's readings in the table's order. §4: 4.1 starter
(also: «ESLint показує одну помилку — це C4», and a look at `ProductTabs`'s
three problems); 4.2 the AI rules; 4.3–4.6 C1–C4; 4.7 checks, GitHub, Vercel
(`react-lab-8`, Root Directory `lab-8`); 4.8 **Самостійна робота (не
оцінюється)**: the programme's «Імплементація складових компонентів», an
`Accordion` for a «Доставка й оплата» FAQ following the APG
[Accordion Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/),
with no tests and no grade.

Commits:

1. `chore: add lab 8 starter`;
2. `refactor(C1): pass the tab content to Tabs as children`;
3. `feat(C2): make the tabs accessible`;
4. `feat(C3): track clicks with the withAnalytics HOC`;
5. `fix(C4): keep the timer button focused`.

Report subject: `[React] ЛР-8: children, складені компоненти й HOC`. The
report has ЛР-7's items, with the test screenshot showing 27 of 27.

### §6. Усний захист

ЛР-7's intro, then grouped interview questions:

- **«children як prop»**: what `children` is and where it comes from (ЛР-2);
  why switching tabs doesn't render the panels' content again; when the
  pattern can't be used, and what to do then (context, a render prop); named
  JSX props (slots) against `children`; why every context provider takes
  `children`.
- **«Складені компоненти»**: what they are; compound against a config-object
  API; how the parts get the shared state; why `Tabs.Tab` outside `<Tabs>`
  should throw; the dot notation against separate named exports.
- **«Контекст»**: `createContext`, the provider, `use` against `useContext`;
  why the context isn't exported; why not `Children` and `cloneElement`.
- **«Доступні вкладки»**: the three roles and their attributes; why ids come
  from `useId`; roving `tabindex`; automatic against manual activation; why
  the panel has `tabindex="0"`; `hidden` against not rendering a panel, and
  what happened to the timer in `ProductTabs`.
- **«HOC»**: what an HOC is; examples in libraries (`React.memo`, `connect`,
  `observer`); `displayName`; why `analyticsData` doesn't reach the DOM;
  prop collisions; `ref` in React 19 against `forwardRef`; composing HOCs and
  "wrapper hell" in DevTools.
- **«Коли HOC шкодить»**: what happened in C4 and why; why the focus was lost;
  what ESLint's message means; why the event name is fixed.
- **«HOC чи хук»**: how the same analytics would look as a hook; when an HOC
  is still the better tool; which patterns from ЛР-7 and ЛР-8 a modern
  codebase uses most.

### §7. Критерії готовності

ЛР-7's table, with these rows changed:

| Критерій | Мінімальна вимога |
| --- | --- |
| Тести | у теці `lab-8` `npx vitest run` проходить: 27 з 27; файли в `tests/` не змінено в жодному коміті |
| Якість | `npm run lint` без помилок і попереджень (помилку стартового проєкту виправлено), `format:check` і `build` — без помилок |
| Вкладки | `Tabs` зі складовими `Tabs.List`, `Tabs.Tab`, `Tabs.Panel`; вміст через `children`, спільний стан через контекст; з `Tabs.jsx` експортується лише `Tabs`; `ProductTabs.jsx` видалено |
| HOC | `withAnalytics` у `src/hoc/`; «Додати в кошик» і перша кнопка таймера надсилають події через нього |

## Files to create or change

As in ЛР-7, for `lab-8`: the starter and its zip, the handout,
`result.webp`, the PDF after review, `docs/react/lab-8/solution/` (gitignored;
the line was added with this plan), `docs/react/lab-8/README.md`, the course
plan row (with the note on context before ЛР-12), and the root README tree.
Branch `feat/react-lab-8`, from `main` after ЛР-7 is merged, since the
starter is built from ЛР-7's final starter and reference solution. The branch
stays local until the last group's ЛР-7 class (see **ЛР-7's answers in ЛР-8's
starter**).

## Verification

**Checked while writing this plan (2026-11-14, C1 on 2026-11-15),** on the
same prototype workspace and versions as ЛР-7, with ЛР-7's reference
solution (including `TimerView`) as the base:

- the starter: lint shows exactly the one `static-components` error;
  `npx vitest run` fails 24 of 27 tests, and the three that pass are
  explained in `solution/README.md`;
- a minimal C1 `Tabs` (context and `children`, no ARIA, no keyboard) passes
  all 8 C1 tests, and C2–C4 fail;
- a wrong `Tabs` fails C1's re-render test along with others (which one and
  why is in `solution/README.md`);
- after C1–C3 with the starter's `TimerView`, exactly C4's three tests fail,
  including the focus test;
- the reference solution passes all 27 tests in about 2 seconds, lint with no
  problems, Prettier and the build;
- with all panels on the page, «Відгуки (10)» and «Схожі товари» appear in a
  tab and in a heading, so C1's tests find a tab through its `<button>`;
- `user-event` drives Tab, the arrow keys, Home and End over the tab list in
  jsdom; `getByRole('tabpanel')` finds only the panel on screen;
- `ref` reaches the inner `<button>` through an HOC with no `forwardRef`;
- the ESLint behaviours listed under **ESLint in this lab**;
- the readings' languages, the problems noted for patterns.dev's Compound
  page, and that CraftValue's article doesn't cover context.

**To check during the build:**

- the keyboard in Edge (and Firefox, if at hand): arrows, Home/End, Tab into
  the panel, the focus ring;
- a screen reader (NVDA or Narrator): the tab list's name, «вкладка 2 з 3»,
  the selected state;
- **React DevTools 8**: **Highlight updates** on a tab switch with
  `ProductTabs` and with `Tabs` (for C1's «Що вже є»); `withAnalytics(Button)`
  in the tree; the remount in C4's starter;
- every stage through lint, Prettier, build and the tests;
- the timed dry run: C1–C4 in about 50 minutes plus setup;
- the zip, Vercel (`lab-8`), and the site's `npm run check && npm run build`.

## Decisions

**Settled by the instructor on 2026-11-14:** ЛР-7's decisions 1–5 (code
challenges, given tests, all in class, one app, AI explains only).

**Settled by the instructor on 2026-11-15:**

6. **ЛР-8 also covers the children-as-prop pattern,** with the link to
   context. It becomes C1's theme: the starter's `ProductTabs` against a
   `Tabs` that takes its content as `children` and its state through context.
   ARIA and the keyboard move together into C2, so the lab keeps four
   challenges.

**Proposed, for the instructor to confirm or change:**

7. **ЛР-8's starter is ЛР-7's reference solution,** published after the last
   group's ЛР-7 class: the zip and the branch alike, so `feat/react-lab-8`
   isn't pushed before then (see **ЛР-7's answers in ЛР-8's starter**).
8. **No `CartProvider`.** A provider for the cart, read by the header and
   `ProductCard`, would show children and context on global state, but that
   is ЛР-12's topic («Глобальний стан за допомогою Context API»). `Tabs`
   already is a provider that takes `children`. If the instructor wants the
   global case here, it fits as a fifth challenge of about 10 minutes, and
   ЛР-12 would then build on it.
9. **Tabs API:** dot notation; uncontrolled only (`defaultValue`); automatic
   activation; horizontal; panels that keep their state when not selected
   (the timer requirement). Controlled tabs
   (`value` and `onValueChange`) are the control-props pattern of П3.7 and
   stay out.
10. **Context through `use` or `useContext`,** both accepted. The plan's
    reference uses `use`, React 19's recommendation.
11. **The HOC's API is `withAnalytics(Component, event)` plus an
    `analyticsData` prop,** with fixed event names.
12. **The starter fails lint on purpose** (one error, C4's clue), and the
    handout says so in §4.1.
13. **The accordion is §4.8, ungraded,** as the programme's self-study item.
14. **HOC against hook is a defence group, not a challenge.** A fifth
    challenge would push the lab past an hour.
15. **No extra points, and ЛР-7's rule for a challenge not finished in
    class,** as in ЛР-7 (its decision 10).
16. **The sections keep their `<h2>` inside the panels,** so heading
    navigation still works for screen-reader users. The tab label repeats the
    heading, which the APG allows.
17. **Out of scope:** manual activation and vertical tabs, deleting tabs,
    render props inside compound parts (Headless UI's style, П3.6),
    `Children`/`cloneElement` (defence only), state reducer and control props
    (П3.7).

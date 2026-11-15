# Plan: React ЛР-7 «Патерни проєктування React. Частина 1 (Custom Hooks, Render Props)»

Status: proposed on 2026-11-14 and revised on 2026-11-15. On 2026-11-14 the
instructor settled the format: code challenges checked by given Vitest tests,
all done in class, one new app shared with ЛР-8, and AI that explains but
doesn't write the code. On 2026-11-15 they added the Container/Presentational
pattern (smart and dumb components) and conditional rendering, which became
C2 (see **Decisions**). A prototype of the starter, the tests and a reference
solution was built and checked both days; it lives in the gitignored
`solution/` folder next to this file. The lab was built on 2026-11-15 on
branch `feat/react-lab-7`, Ukrainian only, with decisions 7–9 and 11–15 as
proposed. The PDF was built after the instructor's review. The lasting
facts, what was verified and where the build differs from this plan are in
this folder's [README.md](README.md); this file stays as the plan the lab was
built from.

The companion plan for ЛР-8 is
[../lab-8/compound-components-and-hoc-plan.md](../lab-8/compound-components-and-hoc-plan.md).
The two labs share the app, the tooling and the challenge format. Facts about
the shared parts live here, and the ЛР-8 plan points back.

## Context

From [../course-plan.md](../course-plan.md), row 2.2:

- **Тема:** «Патерни проєктування React. Частина 1 (Custom Hooks, Render
  Props)»
- **Самостійна робота:** «Створення власних хуків» (2 год.)
- **Читання:** Основна 5 (Makarevich, *Advanced React*)
- **Position:** the first lab of Part 2. It comes after Lecture 3, whose
  topics are Container/Presentational, Custom Hooks, Render Props, HOC and
  Compound Components, and before ЛР-8 (Compound Components, HOC) and ПМК 1
  (ЛР-9). No lecture deck is built yet, so the readings carry the topic, as in
  every lab so far.

**Two topics beyond the row.** Container/Presentational is in Lecture 3's
list (row 2.1) but in no lab's, and conditional rendering is in no row at
all. The instructor added both to this lab on 2026-11-15. Conditional
rendering isn't new to students. ЛР-3 added «— немає» with `&&`, and ЛР-2's
optional task showed a `Badge` with it. ЛР-7 goes further: a component with
four states, `if` with a variable and the ternary next to `&&`, react.dev's
pitfall of a number on the left of `&&`, and an element that keeps its focus
because it stays at the same position in the tree.

What earlier labs left for this one:

- **ЛР-4 §4.4** saves the filters to `localStorage` with a `useState`
  initializer and an effect. ЛР-7's starter repeats that exact pattern in two
  components, so the first custom hook extracts code students wrote three
  weeks earlier.
- **ЛР-4** introduced the `react-hooks` lint rules (`set-state-in-effect`,
  `exhaustive-deps`), and §7 has required zero warnings ever since.
- **ЛР-6 §4.3** wrapped `GuestsStepper` in `Controller render={({ field }) =>
  …}`. Students have already used a render prop without the name.
- Presentation topics П3.1 (Container/Presentational after hooks), П3.2
  (Custom Hooks) and П3.3 (Render Props) are defended at Lecture 3, before
  this lab.

### A new format: code challenges

ЛР-2–6 printed the code in listings that students typed by hand in 20–30
minutes. ЛР-7 and ЛР-8 switch to **code challenges**, the format of the Web
course's ЛР-8 and ЛР-9: each challenge states a problem in the page, the
result and the files, and the given tests decide when it's done. The reasons:

- **A pattern is a decision.** Deciding when to extract a hook, what belongs
  in a container and what in a view, and whether logic should be shared as a
  hook or as a component with a render prop are the lab's actual skills.
  Typing a listing skips those decisions.
- **Students know the format.** The Web course used it with `node --test`
  (ЛР-8) and a `check.html` page (ЛР-9).
- **Tests can check a pattern's shape.** A test that calls
  `renderHook(() => useLocalStorage('k', 1))` or renders `<ShowMore
  items>{fn}</ShowMore>` passes only if the student built that API, yet it
  doesn't force one implementation.

What stays from ЛР-2–6: no «Теоретична частина» (links instead), the
`react-labs` repository with a `lab-7/` folder, a starter zip, one Vercel
project per lab, and a defence made of interview questions. What changes: no
solution code in the handout, and the practical part takes about an hour of
the 80-minute slot instead of 20–30 minutes.

### The readings

Checked on 2026-11-14 and 2026-11-15:

| Page | Language | Use |
| --- | --- | --- |
| patterns.dev: [Hooks Pattern](https://www.patterns.dev/react/hooks-pattern) | English | before class; current (React 19, the Compiler, rules of hooks) |
| patterns.dev: [Container/Presentational Pattern](https://www.patterns.dev/react/presentational-container-pattern) | English | before class; a class container first, then the same split with a custom hook; says hooks replace the pattern in many cases (C2, C3) |
| Dan Abramov: [Presentational and Container Components](https://medium.com/@dan_abramov/7ca2f9a7c7d0) (2015) | English | the article that named the pattern. Its 2019 note at the top says he no longer suggests splitting components this way (C2). Medium refused the automated check, so a browser has to confirm it opens without an account |
| react.dev: [Conditional Rendering](https://uk.react.dev/learn/conditional-rendering) | **English** (the `uk.` address serves English) | `#conditionally-returning-nothing-with-null`, `#conditional-ternary-operator--`, `#logical-and-operator-` (with the pitfall about numbers), `#conditionally-assigning-jsx-to-a-variable` (C2) |
| react.dev: [Preserving and Resetting State](https://uk.react.dev/learn/preserving-and-resetting-state) | English | `#same-component-at-the-same-position-preserves-state` (C2, C4) |
| patterns.dev: [Render Props Pattern](https://www.patterns.dev/react/render-props-pattern) | English | before class; function as `children`, where hooks replace render props and where they don't (C4, C5) |
| react.dev: [Reusing Logic with Custom Hooks](https://uk.react.dev/learn/reusing-logic-with-custom-hooks) | English | `#extracting-your-own-custom-hook-from-a-component`, `#hook-names-always-start-with-use`, `#custom-hooks-let-you-share-stateful-logic-not-state-itself`, `#when-to-use-custom-hooks` (C1, C3) |
| react.dev: [Synchronizing with Effects](https://uk.react.dev/learn/synchronizing-with-effects) | English | `#step-3-add-cleanup-if-needed`, `#how-to-handle-the-effect-firing-twice-in-development` and the challenge `#fix-an-interval-that-fires-twice` (C3) |
| react.dev: [`useState`](https://uk.react.dev/reference/react/useState) | English | the updater function (C3); anchor to check |
| react.dev: [Rules of Hooks](https://uk.react.dev/reference/rules/rules-of-hooks) | English | C1 |
| react.dev: [`cloneElement`](https://uk.react.dev/reference/react/cloneElement), Alternatives | English | `#passing-data-with-a-render-prop`, `#extracting-logic-into-a-custom-hook`: react.dev's own render prop → hook comparison (C4, C5) |
| Developer Way: [React component as prop: the right way™](https://www.developerway.com/posts/react-component-as-prop-the-right-way) (2022) | English | optional: a function prop that receives the component's own state (`renderIcon`), i.e. render props for configuration |
| Testing Library: [About Queries](https://testing-library.com/docs/queries/about) | English | optional: how to read a failing test (`getByRole` and its `name`) |

The programme's reading, Makarevich's *Advanced React*, is a paid book. Its
chapters on render props and on custom hooks have free counterparts on
Developer Way, the author's blog, which the course plan lists as Допоміжна 8.
§2 names the book and points to the blog.

Before class: patterns.dev's three pages and react.dev's custom-hooks page.
The patterns.dev Hooks page has a `useLocalStorage` example. It is close to C1
but has no error handling, and C1's tests ask for it, so the page can be read
before class. The anchors above were listed from the pages; whether each one
resolves is checked during the build.

**Considered, not used:**

- **refine.dev, [React Design Patterns](https://refine.dev/blog/react-design-patterns/)**
  (published 2024-09, updated 2025-07). A broad survey, but the examples have
  bugs: the loading flag is set to `true` in `finally`, a prop is declared
  under one name and destructured under another, an `AbortController` is
  created on every render, and a reducer's `default` returns `undefined`. Its
  container example also uses an undefined variable. It calls `forwardRef` a
  higher-order component, which no longer applies in React 19. Students would
  copy the bugs, so it isn't linked.
- **patterns.dev, [Vanilla](https://www.patterns.dev/vanilla/)**: JavaScript
  design patterns (singleton, observer, mixin, …), not React component
  patterns. The observer pattern sits under §4.8's `useSyncExternalStore`, but
  the lab doesn't need the page. It fits presentation topics better.

## The app: a coffee-bean product page

**Settled: one new app for ЛР-7 and ЛР-8.** ЛР-8's starter is ЛР-7's finished
app plus ЛР-8's additions, the way ЛР-4 continued ЛР-3 and ЛР-6 continued
ЛР-5. The café world continues too: ЛР-3–4 were the menu, ЛР-5–6 the table
booking, and ЛР-7–8 a product page for the café's coffee beans.

The page (Ukrainian), top to bottom:

- **The product card.** «Ефіопія Іргачеф», its origin, roast and flavour
  notes, a ♡ button (`aria-pressed`), a «Помел» radio group (`fieldset` +
  `legend`), and the price for 250 г.
- **«Як заварити».** Two brew timers, «Пуровер V60» (3:00) and «Френч-прес»
  (4:00), each with a recipe line and its controls.
- **«Відгуки (10)».** Ten short reviews, three at a time, with «Показати ще 3».
- **«Схожі товари».** Seven cards in a grid, four at a time, each with its own
  ♡.

No server, no network, no new runtime library: the page is React only. The
only new packages are the test tools, as devDependencies.

Every challenge starts from something visibly wrong in this page:

| What the starter does | Challenge | Pattern |
| --- | --- | --- |
| `FavoriteButton` and `GrindPicker` each keep a value in `localStorage` with ЛР-4's initializer + effect | C1 | a custom hook, `useLocalStorage` |
| `BrewTimer` mixes the timer's logic with its markup, and shows «Старт», «Пауза» and «Скинути» whatever the timer is doing | C2 | Container/Presentational and conditional rendering: `BrewTimer` keeps the logic, a new `TimerView` shows one of four states |
| the timer's logic, now in the container, misbehaves | C3 | a custom hook with an effect and cleanup, `useCountdown` (a debugging challenge); the hook takes over most of the container |
| `ReviewList` and `RelatedProducts` each count the shown items and render the same «Показати ще» button | C4 | a component with a render prop, `ShowMore` |
| «Схожі товари» gets a new design: the button becomes the grid's last cell | C5 | the same logic as a hook, `useShowMore`, with `ShowMore` rebuilt on it |

C2 and C3 tell one story: the classic split first, then a hook doing the
container's job, which is how the pattern changed after hooks (Dan Abramov's
2019 note, П3.1). ЛР-8 then puts the three sections into tabs and adds a cart
button and analytics (see its plan).

## The challenges

Students do C1 → C5 in order and make one commit per challenge, as soon as
that challenge's tests pass. Nothing in `tests/` changes in any commit. Each
challenge in the handout has Web ЛР-9's parts without «Запит для
AI-агента», since AI doesn't write the code here, plus a **Довідка**: **Що
має вийти**, **Що вже є**, **Код** (the files to touch), **Перевірка**
(`npm test -- c1` and what to look at in the browser), and **Довідка** (the
links for that challenge).

The rules below are the test names, which are written as the rules they
check, in Ukrainian, as in Web ЛР-8. The tests ship in the starter, so listing
them here gives nothing away.

### C1. `useLocalStorage`: a custom hook from duplicated code

**Що має вийти.** The page behaves as before: ♡ and «Помел» survive a reload.
Both components now get their state from `useLocalStorage(key, initialValue)`
in `src/hooks/useLocalStorage.js`, which returns `[value, setValue]` like
`useState`. Values are stored as JSON, and a value the old code left behind
(the plain string `filter`) gives way to the initial value instead of
breaking the page.

**Що вже є.** The stub with its API in a JSDoc comment; `FavoriteButton` and
`GrindPicker` with ЛР-4's pattern; the key names (`favorite:<id>`, `grind`).

**Tests** (`tests/c1-use-local-storage.test.jsx`, 11):

- без збереженого значення повертає початкове;
- читає збережене значення як JSON;
- зберігає нове значення як JSON;
- приймає функцію-оновлювач, як сеттер `useState`;
- значення, яке не є JSON, замінює початковим, а не падає;
- два компоненти з одним хуком мають кожен свій стан;
- `FavoriteButton` бере стан з `useLocalStorage`;
- `GrindPicker` бере стан з `useLocalStorage`;
- ♡ лишається натиснутим після перезавантаження;
- помел зберігається після перезавантаження;
- помел, збережений старим кодом без JSON, замінюється на «Зерно», а
  сторінка не падає.

The two reload tests pass in the starter too. They guard the behaviour while
the code moves.

**Перевірка в браузері.** **Application → Local Storage** shows `"filter"`
with quotes after C1. **Components ⚛** lists the hook under the component (how
React DevTools 8 names it is checked during the build). An experiment that
isn't committed: rename the hook to `localStorageState`, read ESLint's error,
rename it back.

### C2. `TimerView`: a smart and a dumb component

**Що має вийти.** Each timer shows only the controls that make sense right
now:

| Status | When | Time | Buttons | Message |
| --- | --- | --- | --- | --- |
| `idle` | not started, full time | 3:00 | «Старт» | — |
| `running` | counting down | 2:55 | «Пауза», «Скинути» | — |
| `paused` | stopped part-way | 2:41 | «Продовжити», «Скинути» | — |
| `done` | reached zero | 0:00 | «Спочатку» | «Готово! Час пити каву.» |

The work is split in two. `TimerView` (new, in `src/components/`) is the
**presentational** («простий», "dumb") component: it gets `method`,
`secondsLeft`, `status` and `onStart`, `onPause`, `onReset` as props, has no
state and no effects, and only decides what to show. `BrewTimer` becomes the
**container** («розумний», "smart"): it keeps the timer's state, works out
`status`, and renders `TimerView`. Two more rules come from accessibility:
the first button keeps keyboard focus when the status changes (a user who
pressed «Старт» with the keyboard can press it again to pause), and
«Готово!» appears in a `role="status"` region that is on the page from the
start, so screen readers announce it.

**Що вже є.** The `TimerView` stub with its props in JSDoc; `BrewTimer` with
its logic inline and three buttons that are always visible. The timer still
misbehaves (that's C3), but C2's tests don't depend on it.

**Tests** (`tests/c2-timer-view.test.jsx`, 9):

- не має власного стану й ефектів: це функція від props;
- idle: повний час і лише «Старт»;
- running: «Пауза» і «Скинути»;
- paused: «Продовжити» запускає відлік далі;
- done: 0:00, повідомлення «Готово!» і «Спочатку»;
- область `role="status"` є від початку, а повідомлення — лише в done;
- перша кнопка не втрачає фокус, коли змінюється статус;
- `BrewTimer` рендерить `TimerView` зі статусом idle і повним часом;
- після «Старт» передає статус running.

The first test calls `TimerView` as a plain function, outside React's
render: that works only for a component without hooks, so it checks
"presentational" directly. The status tests render `TimerView` alone with
props, the way a presentational component is meant to be used. Four
plausible wrong versions of `TimerView` each fail exactly one of these tests.
Which mistake each test catches is recorded in `solution/README.md`.

**Перевірка в браузері.** Tab to «Старт», press Enter, then Enter again: the
timer pauses. **Components ⚛**: `TimerView` lists props and no hooks.

### C3. `useCountdown`: a hook with an effect, and a bug hunt

**Що має вийти.** Each timer counts down once a second, «Пауза» stops it,
«Продовжити» resumes at normal speed, «Скинути» returns to the full time, and
the timer stops at 0:00 with «Готово!». The two timers are independent.
`BrewTimer` gets all of this from `useCountdown(method.seconds)`, which
returns `{ secondsLeft, isRunning, start, pause, reset }`. What's left in the
container afterwards is one of the defence's questions.

**Що вже є.** The stub; `formatTime`; and the container from C2, which keeps
its interval inline and misbehaves. The first symptom shows at once in the
browser, and ESLint shows one warning in that file. The seeded defects, their
symptoms and the order in which they surface are listed in
`solution/README.md`. The handout lists only the expected behaviour.

**Tests** (`tests/c3-use-countdown.test.jsx`, 10; they use Vitest's fake
timers):

- спочатку стоїть на повному часі;
- після `start()` щосекунди зменшує час на 1;
- `pause()` зупиняє відлік;
- повторний `start()` після паузи не прискорює відлік;
- на нулі зупиняється, а не йде в мінус;
- `reset()` повертає повний час і зупиняє відлік;
- після демонтажу компонента не лишає таймерів;
- `BrewTimer` бере відлік з `useCountdown`;
- два таймери на сторінці незалежні;
- коли час вийшов, `BrewTimer` показує «Готово!» і «Спочатку».

The last test needs C2 and C3 together. C3 is the lab's hardest challenge and
the one Web ЛР-10's debugging practice prepared students for. The
`react-hooks` rules from ЛР-4 apply. Which ones come up along the way is
recorded in `solution/README.md`.

### C4. `ShowMore`: a render prop

**Що має вийти.** «Відгуки» shows 3 reviews and «Показати ще 3»; each click
adds up to 3. When everything is shown, the button reads «Згорнути», keeps
focus, and collapses the list back to 3. One component, `ShowMore`, serves
both lists:

```jsx
<ShowMore items={reviews} step={3}>
  {(visibleItems) => <ul>…</ul>}
</ShowMore>
```

The caller renders the list, and `ShowMore` renders the button. The handout's
intro to C4 reminds students of ЛР-6's `Controller render` and says that this
is the same pattern.

**Що вже є.** The stub; the duplicated code in `ReviewList` and
`RelatedProducts`. In the starter, the button disappears after the last click,
and the focus goes with it.

**Tests** (`tests/c4-show-more.test.jsx`, 5):

- викликає `children` як функцію з першими `step` елементами;
- кнопка показує, скільки елементів додасться;
- коли показано все, кнопка стає «Згорнути» і лишається у фокусі;
- без кнопки, якщо елементів не більше за `step`;
- `ReviewList` показує відгуки через `ShowMore` по 3.

`RelatedProducts` moves to `ShowMore` too (4 at a time); no test requires it,
because C5 rewrites it.

### C5. `useShowMore`: the same logic as a hook

**Що має вийти.** A design change for «Схожі товари»: the button becomes the
grid's last cell (a screenshot of the reference shows it). The logic moves
into `useShowMore(items, step)`, which returns `{ visibleItems, hiddenCount,
showMore, collapse }`; `ShowMore` is rebuilt on it, and `RelatedProducts`
uses the hook directly. «Відгуки» doesn't change. The handout states the
requirement, not why the hook suits this layout better than `ShowMore`.

**Tests** (`tests/c5-use-show-more.test.jsx`, 6):

- спочатку видно `step` елементів;
- `showMore()` додає ще `step`, але не більше, ніж є;
- `collapse()` повертає до `step` елементів;
- `ShowMore` тепер побудований на `useShowMore`;
- `RelatedProducts` бере логіку з `useShowMore`;
- кнопка — остання клітинка сітки, а не рядок під нею (it keeps focus here
  too).

C5 is where the lab's main comparison happens: the same logic shared two ways,
with a concrete reason to choose each. The reason itself is a defence
question.

### What the tests check, and what they don't

- **Behaviour through roles and names,** as a user and a screen reader meet
  it (`getByRole('button', { name: 'Згорнути' })`), and **the public API**
  each stub's JSDoc names.
- **That a component uses the hook or renders the view.** `vi.mock(path, {
  spy: true })` keeps the real module but records its calls. Checked in Vitest
  5.1, this is the only automated way to see the pattern itself, since the
  page behaves the same before and after a refactor.
- **That a component has no hooks,** by calling it as a plain function (C2).
- **Not the internals:** how a hook stores its state, or whether `TimerView`
  picks its button with `if` or a ternary. ESLint and the defence cover code
  quality.
- **Fake timers and user-event don't mix here.** With Vitest's fake timers,
  `user-event` clicks wait for a `setTimeout` that never fires, so the test
  times out (checked). The timer tests use `fireEvent` and `act` instead.
- Run time: the reference passes all 41 tests in about 2 seconds, so watch
  mode (`npm test`) can stay open in a second terminal during class.

### ESLint already teaches part of the lesson

Checked with `eslint-plugin-react-hooks` 7.1.1 and ЛР-1's
`eslint.config.js`:

- the starter has exactly **one** problem, the `react-hooks/exhaustive-deps`
  warning in `BrewTimer`. It stays through C2 and goes in C3;
- a hook named without `use` (`localStorageState`) is a
  `react-hooks/rules-of-hooks` **error** whose message states the naming rule;
- a hook called after an early return is a `rules-of-hooks` error;
- the stubs pass lint because their parameters are only named in comments
  (`useLocalStorage(/* key, initialValue */)`): ESLint's `no-unused-vars`
  flags unused parameters;
- the reference solution, the tests included, has no problems.

## Design principles

1. **Each challenge starts from a visible problem** (duplication, controls
   that don't fit the state, a bug, a design change), never from "write
   function X". The handout says what's wrong with the page first.
2. **The API is given, the implementation isn't.** Each stub's JSDoc and the
   tests fix the names and the return shape, so students spend the time on
   the pattern and don't have to guess names.
3. **Behaviour stays the same where the challenge is a refactor** (C1, and the
   reviews in C4–C5), and the tests that already pass guard it.
4. **One page and no theory,** as in ЛР-1–6. §2 is a list of links, and each
   challenge links the section it needs.
5. **Accessibility rides along:** `aria-pressed` on ♡, `fieldset` and
   `legend` for the grind, `role="timer"` and `role="status"`, labelled
   sections, and focus that stays on the timer's first button and on
   «Згорнути».
6. **React only at runtime.** The test tools are devDependencies and never
   reach the Vercel build.
7. **Stable majors:** React 19, Vitest 5, jsdom 31, React Testing Library 16,
   user-event 14, jest-dom 7. Re-check them before the build.

## Timing

The slot is two academic hours (80 minutes).

| Step | Handout | Minutes |
| --- | --- | --- |
| Starter, `npm install`, `npm run dev`, `npm test` (most tests fail), first commit | §4.1 | 5 |
| The AI rules | §4.2 | 1 |
| C1 | §4.3 | 10 |
| C2 | §4.4 | 12 |
| C3 | §4.5 | 13 |
| C4 | §4.6 | 10 |
| C5 | §4.7 | 8 |
| Checks, `git push`, the Vercel project | §4.8 | 5 |
| **The lab** | | **64** |

C2 adds about 12 minutes to the 2026-11-14 estimate; C3–C5 are a little
shorter than their first estimates because C2 has already separated the
timer's markup. These are estimates; the timed dry run decides. If it takes
longer than 65 minutes, the cuts in order are:

1. drop C5's grid design and keep only the hook (`ShowMore` rebuilt on
   `useShowMore`, `RelatedProducts` stays on `ShowMore`);
2. give the status table's `paused` row as optional («Продовжити» folds into
   «Старт»): C2's `paused` test goes and the focus test loses its `paused`
   step, so the lab has 40 tests and the count in §1, §5 and §7 changes;
3. add a hint to C3 that names the three things a timer effect must handle,
   without code;
4. make C5 ungraded (§4.9) and grade C1–C4.

## Starter: `starters/react/lab-7/` → `/uk/react/starters/lab-7.zip`

Packed like ЛР-2–6's: `python docs/web/build-pack.py starters/react/lab-7`
after the starter is committed, files at the zip root, no lockfile. The
configs are ЛР-6's, except where noted.

```text
starters/react/lab-7/
├── .gitignore, .prettierrc.json, eslint.config.js    ЛР-6's files
├── vite.config.js      ЛР-6's, plus a `test` block: environment jsdom, setupFiles
├── index.html          lang="uk", <title>ЛР-7. Кава в зернах</title>
├── package.json        "name": "lab-7"; "test": "vitest"; dependencies react,
│                       react-dom; devDependencies ЛР-6's + vitest, jsdom,
│                       @testing-library/react, @testing-library/user-event,
│                       @testing-library/jest-dom
├── README.md           what the folder is, «Що вже є», the commands
├── public/favicon.svg
├── src/
│   ├── main.jsx            unchanged (StrictMode)
│   ├── index.css           the page's styles, incl. the timer states and the grid's last-cell button (C5)
│   ├── data.js             the product, grind options, brew methods, 10 reviews, 7 related products
│   ├── formatTime.js       seconds → "m:ss"
│   ├── App.jsx
│   ├── hooks/
│   │   ├── useLocalStorage.js   stub: JSDoc API, throws "Not implemented (C1)"
│   │   ├── useCountdown.js      stub (C3)
│   │   └── useShowMore.js       stub (C5)
│   └── components/
│       ├── ProductCard.jsx
│       ├── FavoriteButton.jsx   ЛР-4's initializer + effect
│       ├── GrindPicker.jsx      the same, under another key
│       ├── BrewGuide.jsx
│       ├── BrewTimer.jsx        logic and markup together; seeded defects
│       ├── TimerView.jsx        stub (C2)
│       ├── ReviewList.jsx       duplicated «Показати ще» logic
│       ├── RelatedProducts.jsx  the same, 4 at a time
│       └── ShowMore.jsx         stub (C4)
└── tests/
    ├── setup.js                 jest-dom matchers; cleanup, localStorage.clear(), mocks reset after each test
    └── c1-…, c2-…, c3-…, c4-…, c5-….test.jsx
```

`README.md` (Ukrainian, Prettier-clean): one paragraph on the app, «Що вже
є», and the commands, now with `npm test` (watch mode) and `npm test -- c2`
(one challenge). It doesn't repeat the challenges; the handout has them.

The prototype in `solution/prototype/` is this tree minus the CSS and README.

## Handout: `src/content/labs/react/uk/lab-7.md`

About 4,000–4,500 words: about ЛР-6's length, with no code listings but five
challenges. Frontmatter as in ЛР-6, with `number: 7`, `title: "Патерни
проєктування React. Частина 1 (Custom Hooks, Render Props)"` (the
programme's title), and `duration: "2 академічні години (практична частина —
близько 65 хвилин; самостійна робота — 2 години)"`. `handout:` is added once
the PDF is built after the instructor's review. Ukrainian only; English
later.

Draft `summary`: «Сторінка кави в зернах із дубльованим і зламаним кодом: п'ять
code challenges з готовими тестами Vitest. Власний хук useLocalStorage
замість двох копій коду з ЛР-4, розумний і простий компоненти таймера з
умовним рендерингом чотирьох станів, хук useCountdown з ефектом і очищенням,
компонент ShowMore з render prop для двох списків і хук useShowMore для тієї
самої логіки в іншій розмітці. Деплой на Vercel.»

**Top note.** The usual «Примітка щодо актуальності», naming React 19, Vitest
5, React Testing Library 16 and jsdom 31.

### §1. Мета роботи

Draft: «Навчитися відокремлювати логіку від відображення: виносити логіку зі
станом у власні хуки, ділити компонент на розумний і простий, показувати
різні стани умовним рендерингом і ділитися логікою через хук або через
компонент із render prop, обираючи спосіб під задачу; навчитися працювати за
готовими тестами.»

**Очікуваний результат:** `lab-7/` passes `npm test` (41 of 41), `npm run
lint` with no problems, `format:check` and `build`; the timers show their
four states; «Згорнути» and the new «Схожі товари» grid work; the app is on
Vercel. Screenshot `/uk/react/labs/lab-7/result.webp`: the page with one
timer running and the other finished, and «Схожі товари» expanded.

### §2. Корисні посилання

The readings table above, in this order: patterns.dev Hooks,
Container/Presentational and Render Props; Dan Abramov's article; react.dev
custom hooks; Conditional Rendering; Preserving and Resetting State;
Synchronizing with Effects; `useState`; Rules of Hooks; `cloneElement`
alternatives; Developer Way; Testing Library queries. One line names the
programme's book and Developer Way as its free counterpart. The opening
paragraph is ЛР-6's: no theory, what to read before class, the rest when a
challenge points to it.

### §3. Завдання

A numbered list, one line each: §4.1 starter; C1–C5 (§4.3–4.7) with their
pattern in brackets; §4.8 checks and Vercel. Then the notes: «Усі завдання
виконуються на занятті (орієнтовно 65 хвилин) і разом оцінюються в 1 бал
після захисту.» One line on a challenge not finished in class (decision 10):
push what passes, and finish the rest the way a missed class is made up. The
AI note points to §4.2.

### §4. Хід виконання

**4.1. Стартовий проєкт.** ЛР-6 §4.1 with `lab-7`: a clean `git status`,
unpack the zip in the file manager, `npm install` in the root (it installs
the test tools too), `cd lab-7`, `npm run dev`. Then `npm test`: most tests
fail with `Not implemented`, two pass (and why: they check what already
works). One paragraph on reading a test result: the file is the challenge,
the test name is the rule. Commit `chore: add lab 7 starter`.

**4.2. Правила роботи з AI.** Web ЛР-8 §5.2, adapted: AI may explain a
concept, a failing test's message or an ESLint error, in ask/plan mode, but
doesn't write the hook or the component, neither whole nor as a "hint" with
ready code; AI code completions are turned off for the challenge files (or
entirely). One example prompt in Ukrainian («Поясни, чому падає цей тест… Не
пиши виправлений код…»). At the defence students change their code live,
without AI.

**4.3–4.7. C1–C5.** As described under **The challenges**, each ending with
its commit:

1. `refactor(C1): extract the useLocalStorage hook`;
2. `feat(C2): split the timer into a container and TimerView`;
3. `fix(C3): move the countdown into useCountdown`;
4. `refactor(C4): share the show-more logic through a render prop`;
5. `feat(C5): put the related products button into the grid`.

**4.8. Перевірки, GitHub і Vercel.** `npm test` (all green, run once:
`npx vitest run`), `npm run lint` (no errors or warnings), `format:check`,
`build`, `git push`, a new Vercel project `react-lab-7` with Root Directory
`lab-7`. The commit history is the five commits above after the starter's.

**4.9. Самостійна робота (не оцінюється).** The programme's «Створення
власних хуків»: make two ♡ for the same product stay in sync, on one page and
across browser tabs, with `useSyncExternalStore` and the `storage` event.
The handout adds one hint: `storage` fires only in the other tabs, so the tab
that writes has to notify its own subscribers. This needs a second ♡
somewhere (for example, in the page header). Links:
react.dev `useSyncExternalStore` → `#subscribing-to-a-browser-api`. No tests,
no grade; it prepares an answer for the defence's «logic, not state» group.

### §5. Вимоги до звіту

Subject `[React] ЛР-7: власні хуки, розумні й прості компоненти, render
props`, with ЛР-6's two lines for `lab-7`. The report contains:

1. a screenshot of `npx vitest run` with all 41 tests passing;
2. a screenshot of `npm run lint`, `format:check` and `build` passing;
3. per challenge, one or two sentences on what was wrong in the starter and
   what changed (a plain summary, as in the Web course's later labs);
4. whether AI was used, and for what (tool, model, date);
5. a short conclusion: what was hard.

### §6. Усний захист

ЛР-6's intro sentence, plus Web ЛР-8's: the instructor may ask for a live
change without AI. Then grouped interview questions, each answerable from
the lab and its readings:

- **«Власні хуки»**: what a custom hook is; why the name starts with `use`;
  logic versus state (why two components with the same hook don't share a
  value, and how to make them); what a hook should return (a tuple or an
  object); when a function should *not* be a hook.
- **«Правила хуків»**: the two rules; what breaks if a hook is called
  conditionally; how ESLint finds hooks.
- **«Розумні й прості компоненти»**: what goes in a container and what in a
  presentational component; why `TimerView` has no state; how a test can tell
  that a component has no hooks; what's left of `BrewTimer` after C3, and
  whether it's still needed; why Dan Abramov stopped recommending the split;
  where the split still pays off (Storybook, tests, design systems).
- **«Умовний рендеринг»**: `if` with a variable, the ternary, `&&` and
  `return null`, and when to use each; what `{count && <p>…</p>}` shows when
  `count` is 0; why «Старт» keeps focus when it becomes «Пауза», and how to
  write it so that it doesn't; why the `role="status"` region exists before
  the message; hiding with CSS versus not rendering.
- **«Ефекти в хуках»**: cleanup and when React runs it; why StrictMode runs
  effects twice in development; the updater function and stale values;
  derived state versus state synced by an effect; what "a timer leaks" means.
- **«Render props»**: what a render prop is; `children` as a function versus a
  `render` prop; where students have met one (ЛР-6's `Controller`) and where
  libraries still use them.
- **«Хук чи render prop»**: why C5 needed a hook; what a render-prop component
  shares that a hook can't; how else the button could have been placed in the
  grid.
- **«Доступність»**: why «Згорнути» keeps focus and what happened in the
  starter; `aria-pressed`; `fieldset` and `legend`; `role="timer"`.
- **«Тести»**: what the C1 test «два компоненти з одним хуком…» proves; why a
  refactor's tests pass before and after; what `renderHook` and fake timers
  do (reading the given tests, not writing them).

The handout's §6 will be the full list (ЛР-6 has about 40); the answers go in
`solution/README.md`.

### §7. Критерії готовності

«Лабораторна робота оцінюється в 1 бал після захисту (§6).» One table:

| Критерій | Мінімальна вимога |
| --- | --- |
| Тести | у теці `lab-7` `npx vitest run` проходить: 41 з 41; файли в `tests/` не змінено в жодному коміті |
| Якість | `npm run lint` без помилок і попереджень, `format:check` і `build` — без помилок |
| Хуки | `useLocalStorage`, `useCountdown` і `useShowMore` у `src/hooks/`; компоненти не дублюють їхню логіку |
| Розумний і простий | `TimerView` без стану й ефектів показує чотири стани таймера; `BrewTimer` визначає статус і рендерить `TimerView` |
| Render prop | `ShowMore` викликає `children` як функцію; ним користується `ReviewList` |
| GitHub | коміт стартового проєкту й по одному коміту на кожен challenge |
| На занятті | усі коміти відправлено на занятті (час `git push` видно в **Activity**); challenges, не завершені на занятті, — на відпрацюванні, як пропущене заняття |
| Vercel | проєкт з Root Directory `lab-7`; адреса показує сторінку з останнього коміту `main` |
| AI | §4.2 дотримано; у звіті вказано, як використовувався AI |
| Звіт | усі пункти §5 |

## Files to create or change

- `starters/react/lab-7/` (above);
- `public/uk/react/starters/lab-7.zip`: built by `build-pack.py` after the
  starter's commit, in its own commit;
- `src/content/labs/react/uk/lab-7.md`: the handout;
- `public/uk/react/labs/lab-7/result.webp` (§1) and a C5 screenshot of the
  grid: taken from the reference solution in headless Edge;
- `public/uk/react/labs/lab-7.pdf`: `python docs/web/build-handout.py lab-7
  react`, from PowerShell, after the instructor's review;
- `docs/react/lab-7/solution/` (gitignored; the `.gitignore` line was added
  with this plan): the prototype today; at build time, the final starter's
  overlays after each challenge, the defect map, the defence answers and a
  `shots.mjs`;
- `docs/react/lab-7/README.md`: the lasting facts and what was verified, with
  no answers;
- `docs/react/course-plan.md`: a ЛР 7 row in **How the site maps to the
  plan**, `ЛР 8–27` in the «not built» row, the date above the table, one
  line on the challenge format with a pointer here, and a note in **Notes
  for building the course** that conditional rendering and
  Container/Presentational are practised in ЛР-7, though row 2.2 doesn't name
  them;
- `README.md` (root): a `lab-7/` line in the `starters/react/` tree.

Work on a new branch from `main`, `feat/react-lab-7`.

## Verification

**Checked while writing this plan (2026-11-14, C2 on 2026-11-15),** on a
prototype in a `react-labs` npm-workspaces folder with ЛР-6's tooling, on
Windows 11 with Node.js 24.20.0 and npm 11.19.0: React 19.3.1, Vite 8.3.8,
`@vitejs/plugin-react` 6.3.0, ESLint 10.15.0, `eslint-plugin-react-hooks`
7.1.1, `eslint-plugin-react-refresh` 0.5.7, Prettier 3.9.10, Vitest 5.1.0
(peer range accepts Vite 8), jsdom 31.0.1, `@testing-library/react` 16.3.3,
`@testing-library/user-event` 14.6.10, `@testing-library/jest-dom` 7.0.1
(through `@testing-library/jest-dom/vitest`):

- `npm install` in a fresh root adds the workspace with the test tools (211
  packages, about 130 MB of `node_modules`);
- jsdom's `localStorage` works on Node 24 under Vitest;
- the starter: lint shows only the warning named above; Prettier passes;
  `npx vitest run` fails 39 of 41 tests, each with a readable message
  (`Not implemented: …` or an assertion);
- after C1 and C2, with the container still holding the seeded defects, all
  20 tests of C1–C2 pass and C3–C5 fail;
- calling a component that uses a hook as a plain function throws, so C2's
  first test fails for a `TimerView` with any hook (checked with `useId`);
  three other wrong `TimerView`s each fail exactly one other C2 test;
- the reference solution passes all 41 tests in about 2 seconds, lint with no
  problems, Prettier and the build;
- `vi.mock(path, { spy: true })` records calls and keeps the real
  implementation, for hooks and for components;
- `user-event` with fake timers times out; `fireEvent` + `act` works;
- the ESLint behaviours under **ESLint already teaches part of the lesson**;
- the readings' languages; that refine.dev's examples have the bugs listed;
  that Dan Abramov's article carries its 2019 note (through a search, since
  Medium refused the automated fetch).

**To check during the build:**

- the final starter's CSS and README; every stage (starter, after C1–C5)
  through lint, Prettier, build and the tests, with the expected failures;
- the page in headless Edge: the four timer states, the grid's last cell at
  390 px and at desktop width, focus visible on the timer's first button and
  on «Згорнути», no horizontal scroll;
- a screen reader (NVDA or Narrator): «Готово! Час пити каву.» is announced
  when the timer ends;
- **React DevTools 8**: how a custom hook appears under a component (for C1's
  «Перевірка»), and `TimerView` with props and no hooks (C2);
- the readings' anchors, and that Dan Abramov's Medium article opens without
  an account;
- **timed dry run:** as a student, without AI, C1–C5 in about 55 minutes plus
  setup; otherwise apply the cuts under **Timing**;
- the zip stores LF and passes `format:check` after unpacking; `npm install`
  in an existing `react-labs` (ЛР-1–6 workspaces present) adds `lab-7` and
  its test tools;
- Vercel: a seventh project from the same repository builds with Root
  Directory `lab-7`, and the build doesn't run the tests;
- `npm run check && npm run build` for the site; the labs index lists ЛР-7.

## Decisions

**Settled by the instructor on 2026-11-14:**

1. **Code challenges** instead of typed listings, for ЛР-7 and ЛР-8.
2. **Given Vitest tests are the check,** with ESLint as the second one.
3. **Everything is done in class.** No homework part.
4. **One new app for ЛР-7 and ЛР-8,** the coffee-bean product page; ЛР-8's
   starter is ЛР-7's finished app.
5. **AI explains, doesn't write,** as in Web ЛР-8/9, and the defence includes
   a live change.

**Settled by the instructor on 2026-11-15:**

6. **ЛР-7 also covers Container/Presentational and conditional rendering.**
   Both go into one challenge, C2, on the timer (see **The challenges**).

**Proposed, for the instructor to confirm or change** (except 10, settled on
2026-11-15 during the PR #73 review):

7. **Five challenges in this order:** C2's split before C3's hook, so the
   hook visibly takes over the container. The other order (hook first, then
   the view) works too, but then the container is never seen at its full
   size.
8. **`TimerView`'s API:** the container passes `status`, one of four strings,
   rather than `isRunning` and the total time, so the view only decides what
   to show. The alternative, letting `TimerView` work out the status from
   raw numbers, puts a rule in the "dumb" component.
9. **No extra points.** The programme gives 1 point per lab, the whole lab is
   in class, and the time is now a little over an hour. A stronger student
   can do §4.9, ungraded.
10. **Settled by the instructor on 2026-11-15: the in-class rule stays
    strict, as in ЛР-2–6,** with a make-up for unfinished challenges. Every
    commit is pushed in class, checked on GitHub **Activity**, and a missed
    class is made up under the course rules. The risk is higher than with
    listings, since challenge times vary more; the dry run and the cuts under
    **Timing** are the safeguard for the group, but not for one student who
    runs out of time, and the course has no partial points. That student
    pushes what passes by the end of class and finishes the remaining
    challenges the way a missed class is made up, under the same push-time
    check, then defends as usual. §3 and §7 state the rule. Rejected: grading
    only C1–C4 for that student (cut 4 under **Timing**, for one person),
    which is simpler but rewards stopping early.
11. **Readings:** patterns.dev for the patterns, react.dev for the mechanics,
    Dan Abramov's article for the history of the split; refine.dev isn't
    linked (see **The readings**).
12. **One commit per challenge,** and `tests/` never changes, as in Web
    ЛР-8.
13. **AI completions off** for the challenge files. Completions would write
    a 15-line hook from its name; the Web course's rule covered agents, and
    this lab extends it to completions.
14. **Ukrainian first,** English later, as for ЛР-2–6.
15. **Out of scope:** `useSyncExternalStore` (§4.9 only), data-fetching hooks
    and containers that fetch (Part 3, with TanStack Query), TypeScript
    (ЛР-19), and writing tests (students only run them; testing is Part 3).

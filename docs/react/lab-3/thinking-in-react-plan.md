# Plan: React ЛР-3 «Рефакторинг застосунку за деревом компонентів (Thinking in React)»

Status: written and approved on 2026-11-05; the lab was built the same day
on branch `feat/react-lab-3`, without the PDF, which waits for the
instructor's review. What was verified and what wasn't is in this folder's
[README.md](README.md), which holds the facts that last. Delete this file
once the lab is published.

Deviations from the plan:

- **§4.9 commits `inStockOnly={false}`,** not `true`. `true` would change
  the page, and §7 requires it to look as at the start. `false` matches the
  unchecked checkbox, and students switch the prop to `true` in DevTools.
- **No `handout:` field and no PDF** until the review (the instructor's
  request); the README's **Build** says what to do then.
- **The category headings' CSS.** The price column's `:last-child` rule
  also right-aligned the one-cell category row; the rule now targets the
  price cells and the price header only.
- **The handout gives the tree notation by example** («Перший дочірній
  компонент…») instead of pointing to ЛР-2's trees, so the lab doesn't
  depend on ЛР-2.
- **The legacy page's examples are class components** (checked), and §2
  says so.
- **The hierarchy is a Mermaid diagram,** not a text tree (the instructor's
  request after the build). The starter's README block is `mermaid` with
  `flowchart TD` and `App`, §4.2 teaches the syntax with an example from
  another app, §4.8 checks that GitHub renders it, and §2 links the Mermaid
  flowchart docs. The syntax adds about a minute to §4.2, which makes the
  total 28.

## Context

From [../course-plan.md](../course-plan.md), row 1.4:

- **Тема:** «Рефакторинг додатку відповідно до дерева компонентів (Thinking
  in React)»
- **Самостійна робота:** «Декомпозиція UI на атомарні елементи» (2 год.)
- **Читання:** Основна 1 (react.dev), 6 (Epic React, Kent C. Dodds)
- **Position:** after ЛР-2 (components, props, the two trees) and before
  Лекція 2 (state, hooks) and ЛР-4 (`useState`, `useEffect`). Students have
  not seen `useState` yet.

Constraints from the request, the same as ЛР-1 and ЛР-2:

1. No «Теоретична частина»: the handout gives useful links instead.
2. The tasks are straightforward and take 20–30 minutes.
3. **The lab doesn't depend on ЛР-2** (decision 1): it has its own app and
   starter, and needs only the `react-labs` repository from ЛР-1.

It follows ЛР-2's other rules too: every task is done in class, and the code
is written by hand (decision 3).

### The readings

| Page | Language on 2026-11-05 | Use |
| --- | --- | --- |
| [Thinking in React](https://uk.react.dev/learn/thinking-in-react) (react.dev) | **English only**: uk.react.dev serves the untranslated page | the main page; steps 1–4 apply here |
| [Філософія React](https://uk.legacy.reactjs.org/docs/thinking-in-react.html) (legacy docs) | Ukrainian | the same five steps in Ukrainian; marked outdated, and its code is on CodePen |
| [Розуміння вашого UI як дерева](https://uk.react.dev/learn/understanding-your-ui-as-a-tree) | Ukrainian | the render tree |

Section anchors on the react.dev page, which the «Довідка» links use:
`#start-with-the-mockup`, `#step-1-break-the-ui-into-a-component-hierarchy`,
`#step-2-build-a-static-version-in-react`,
`#step-3-find-the-minimal-but-complete-representation-of-ui-state`,
`#step-4-identify-where-your-state-should-live`,
`#step-5-add-inverse-data-flow`.

## The idea: a working page in one component

The starter is a small app, «Меню кав'ярні», that works and looks finished,
but all of it is one 45-line `App.jsx`. The page has the same shape as
react.dev's example (a search field, a checkbox, a table grouped by
category), so the reading lines up with the task one to one.

The students do what Thinking in React describes:

1. **Крок 1.** Break the page into a component hierarchy, from a mockup
   with numbered frames.
2. **Крок 2.** The static version already exists, but as one component.
   The students split it to match the tree, one extraction at a time. The
   page must look the same after every step: that's what makes it a
   refactoring.
3. **Кроки 3–4,** written in the README. Which data is state, and which
   component it will live in. The code for it waits for ЛР-4.

Step 5 (inverse data flow) needs `useState` and events, so it belongs to
ЛР-4 and ЛР-5.

## Design principles

1. **One page and no theory.** §2 is a list of links; each task links the
   one section it needs.
2. **One recipe, used four times.** §4.3 gives a six-line recipe for
   extracting a component, and works through it on the first component, with
   the code in full. §4.4–4.6 apply the same recipe to the next three.
   Students repeat one move rather than learn a new one each time.
3. **Bottom-up, so the page never breaks.** Each step extracts a leaf from
   `App`: first a row, then the category around the rows, then the table
   around the categories, then the search bar. Each step ends with «Що має
   вийти: сторінка не змінилася», plus a check in DevTools, where the new
   component appears. The commits use the `refactor:` type.
4. **The tree is checked, not given.** §1 shows the page, not the tree.
   Students write the tree from the framed mockup in §4.2, then compare it
   with **Components ⚛** in §4.7.
5. **No state in code.** Steps 3–4 are a table in the README. The search
   field and checkbox render but do nothing, which is what react.dev's
   static version does too; the handout says so in §4.1.
6. **Semantic markup:** `main`, `search`, a `table` with `thead`, one
   `tbody` per category, `th` with `scope` for the column, group and row
   headers, and a label for every input. «Немає» is in the text, not only in
   the grey colour.
7. **Terminology follows uk.react.dev and the legacy page:** «пропс»,
   «стан», «ієрархія компонентів», «статична версія», «односпрямований
   потік даних».

## The app: «Меню кав'ярні»

A heading, a search bar, and one table: three categories, ten items, a
price for each, and three items marked unavailable.

### `src/data.js`

The data is grouped by category, so its shape already matches the component
hierarchy, which the react.dev page points out in Step 1. react.dev keeps a
flat list and finds the category breaks while rendering; grouped data keeps
the starter simpler.

```js
export const menu = [
  {
    id: 'coffee',
    name: 'Кава',
    items: [
      { id: 1, name: 'Еспресо', price: 55, available: true },
      { id: 2, name: 'Американо', price: 60, available: true },
      { id: 3, name: 'Капучино', price: 75, available: true },
      { id: 4, name: 'Лате', price: 80, available: false },
    ],
  },
  // Чай: Чорний 45, Зелений 45, Трав'яний 50 (available: false)
  // Десерти: Круасан 70, Чизкейк 120, Брауні 95 (available: false)
]
```

The items and prices can change during the build.

### The starter's `App.jsx`

```jsx
import { menu } from './data.js'

export default function App() {
  return (
    <main className="app">
      <h1>Меню кав'ярні</h1>

      <search className="search-bar">
        <input type="search" placeholder="Пошук у меню" aria-label="Пошук у меню" />
        <label>
          <input type="checkbox" /> Лише в наявності
        </label>
      </search>

      <table className="menu-table">
        <thead>
          <tr>
            <th scope="col">Позиція</th>
            <th scope="col">Ціна</th>
          </tr>
        </thead>
        {menu.map((category) => (
          <tbody key={category.id}>
            <tr className="category">
              <th colSpan={2} scope="rowgroup">
                {category.name} ({category.items.length})
              </th>
            </tr>
            {category.items.map((item) => (
              <tr key={item.id} className={item.available ? 'item' : 'item unavailable'}>
                <th scope="row">
                  {item.name}
                  {!item.available && ' — немає'}
                </th>
                <td>{item.price} грн</td>
              </tr>
            ))}
          </tbody>
        ))}
      </table>
    </main>
  )
}
```

(Prettier will wrap the long lines.)

### The target

```text
App
├── SearchBar
└── MenuTable              menu
    └── MenuCategory × 3   key = category.id, category
        └── MenuItemRow    key = item.id, item (4, 3 and 3 of them)
```

```text
main.jsx
├── index.css
└── App.jsx
    ├── components/SearchBar.jsx
    ├── components/MenuTable.jsx
    │   └── components/MenuCategory.jsx
    │       └── components/MenuItemRow.jsx
    └── data.js
```

Final `App.jsx`:

```jsx
import SearchBar from './components/SearchBar.jsx'
import MenuTable from './components/MenuTable.jsx'
import { menu } from './data.js'

export default function App() {
  return (
    <main className="app">
      <h1>Меню кав'ярні</h1>
      <SearchBar />
      <MenuTable menu={menu} />
    </main>
  )
}
```

How the parts map onto react.dev's example (the handout shows this table in
§4.2):

| react.dev | ЛР-3 |
| --- | --- |
| `FilterableProductTable` | `App` |
| `SearchBar` | `SearchBar` |
| `ProductTable` | `MenuTable` |
| `ProductCategoryRow` and the rows after it | `MenuCategory` (one `<tbody>`) |
| `ProductRow` | `MenuItemRow` |
| `stocked`, «Only show products in stock» | `available`, «Лише в наявності» |

`App` takes `FilterableProductTable`'s place, rather than wrapping it: it
is the closest common parent of `SearchBar` and `MenuTable`, which is where
step 4 puts the state.

## Timing

| Step | Handout | Minutes |
| --- | --- | --- |
| Starter, `npm install`, `npm run dev`, commit | §4.1 | 3 |
| Крок 1: the framed mockup → the tree in `README.md` | §4.2 | 3 |
| `MenuItemRow`: the recipe, worked through in full | §4.3 | 3 |
| `MenuCategory` by the recipe | §4.4 | 4 |
| `MenuTable` by the recipe | §4.5 | 3 |
| `SearchBar` by the recipe; the final `App.jsx` to compare | §4.6 | 2 |
| The tree in DevTools; кроки 3–4 in `README.md` | §4.7 | 5 |
| Checks, `git push`, the Vercel project | §4.8 | 4 |
| **Total** | | **27** |

The extra task (§4.9) takes about 3 minutes and isn't graded.

All tasks are done in class, so nothing moves to self-study. If the dry run
goes over 25 minutes, first fill in the state table's first row in the
starter as an example. Next, give `MenuCategory`'s code in full, as
`MenuItemRow`'s is.

## Starter: `react-lab-3-starter/` → `/react/labs/lab-3.zip`

Built like ЛР-2's: a top-level folder packed with
`python docs/web/build-pack.py react-lab-3-starter react`, files at the zip
root, no lockfile. The tooling is ЛР-1's, so the configs are the same files
as in `react-lab-2-starter/`. Nothing else comes from ЛР-2.

```text
react-lab-3-starter/
├── .gitignore, .prettierrc.json, eslint.config.js, vite.config.js   ЛР-1's tooling
├── index.html          lang="uk", <title>ЛР-3. Меню кав'ярні</title>
├── package.json        "name": "lab-3"; ЛР-1's scripts and devDependencies
├── README.md           the tree block and the state table (below)
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx        the template's: imports index.css, renders <App /> in <StrictMode>
    ├── index.css       all the page's styles: .app, .search-bar, .menu-table,
    │                   .category, .item, .unavailable
    ├── data.js         menu (above)
    └── App.jsx         the whole app in one component (above)
```

- **No `src/components/`.** Git doesn't track empty folders; students
  create it in §4.3.
- **No images.** The page is text and a table, so the starter has nothing to
  draw beyond ЛР-2's and builds faster.
- **`README.md`** (Ukrainian, Prettier-clean):
  - what the folder is, and the commands, as in ЛР-2;
  - **«Ієрархія компонентів»**: a `text` block containing only `App` (§4.2,
    checked in §4.7);
  - **«Стан»**: the three questions from Step 3, then a table with the
    columns «Дані», «Стан?» and «Чому», with these rows filled in and the
    other two columns left empty:
    1. меню: категорії й позиції (`menu`);
    2. текст у полі пошуку;
    3. значення прапорця «Лише в наявності»;
    4. позиції, що залишаться після фільтрування;
    5. кількість позицій у заголовку категорії, «(4)»;
  - one line to finish: «Стан житиме в компоненті: … , бо …».

  Rows 1–4 match react.dev's own answer. Row 5 is new, so the table can't
  be copied straight from the page, and it's another value that is
  computed.

## Handout: `src/content/labs/react/uk/lab-3.md`

About 1,200–1,500 words, like ЛР-2. Frontmatter as in ЛР-2, with
`number: 3`, `handout: /react/labs/lab-3.pdf`, the same `duration`, and
`title: "Рефакторинг застосунку за деревом компонентів (Thinking in React)"`.
Ukrainian only, like ЛР-1 and ЛР-2: the React course has no English pages
yet.

**Top note.** The usual «Примітка щодо актуальності».

### §1. Мета роботи

Розкласти готовий застосунок на компоненти за методом Thinking in React:
знайти ієрархію компонентів на макеті, перебудувати код за нею, не
змінивши сторінки, і визначити, які дані стануть станом.

**Очікуваний результат:** у теці `lab-3/`, the page looks exactly as at the
start (screenshot `public/react/labs/lab-3/result.webp`); `App.jsx` renders
only the heading, `SearchBar` and `MenuTable`; `lab-3/README.md` holds the
hierarchy and the state table; the app is on Vercel. §1 doesn't show the
tree, which is §4.2's task.

### §2. Корисні посилання

1. [Thinking in React](https://uk.react.dev/learn/thinking-in-react): the
   main page. Before class read steps 1–4; step 5 is for ЛР-4. The page
   isn't translated yet, so a browser translation will do.
2. [Філософія React](https://uk.legacy.reactjs.org/docs/thinking-in-react.html):
   the same method in Ukrainian, in the old documentation. Read it for the
   steps, not the code: the examples are old.
3. [Розуміння вашого UI як дерева](https://uk.react.dev/learn/understanding-your-ui-as-a-tree):
   the render tree (§4.7).
4. [Передача пропсів до компонента](https://uk.react.dev/learn/passing-props-to-a-component):
   passing an object as a prop.
5. [Рендеринг списків](https://uk.react.dev/learn/rendering-lists): where
   `key` goes once the `map` body becomes a component.
6. [Умовний рендеринг](https://uk.react.dev/learn/conditional-rendering):
   `&&` for «— немає».
7. [Інструменти розробника React](https://uk.react.dev/learn/react-developer-tools):
   **Components ⚛**.
8. [When to break up a component into multiple components](https://kentcdodds.com/blog/when-to-break-up-a-component-into-multiple-components)
   (Kent C. Dodds, English, 2019): when *not* to split a component. Optional
   reading for the defence.

### §3. Завдання

A numbered list of §4.1–4.8, one line each, then two notes in ЛР-2's
style: «Усі завдання §4.1–4.8 виконуються на занятті; звіт (§5) можна
надіслати після нього», and the AI note: «Код цієї роботи переносьте
самостійно. AI-автодоповнення можна залишити, але доручати рефакторинг
AI-агентові не рекомендовано: мета — навчитися самому бачити дерево
компонентів і переносити код за ним».

### §4. Хід виконання

As in ЛР-2, each task names its file, says what to do, and ends with «Що має
вийти», the commit and a «Довідка» link.

**4.1. Стартовий проєкт.** ЛР-2 §4.1 almost word for word: a clean
`git status` in `react-labs`, unpack `lab-3.zip` in the file manager, move
`lab-3` into the repository root next to the other `lab-N` folders,
`git status -u`, `npm install` in the root, `cd lab-3`, `npm run dev`, and
a second terminal for git. Then: «Відкрийте `src/App.jsx`: увесь застосунок
— один компонент. Поле пошуку й прапорець поки нічого не роблять: це
статична версія». Commit `chore: add lab 3 starter`.

**4.2. Крок 1: ієрархія компонентів.** The framed mockup
(`public/react/labs/lab-3/frames.webp`): the page with a numbered frame
around each component, as on react.dev, numbers as well as colours. A
legend gives each number its component and what it shows:

| № | Компонент | Що відображає |
| --- | --- | --- |
| 1 | `App` | уся сторінка |
| 2 | `SearchBar` | поле пошуку й прапорець |
| 3 | `MenuTable` | таблиця із заголовком «Позиція / Ціна» |
| 4 | `MenuCategory` | одна категорія: її назва й позиції |
| 5 | `MenuItemRow` | одна позиція: назва й ціна |

Then the react.dev mapping table from **The target**.

Task: «Якщо рамка лежить усередині іншої, компонент — дочірній. Запишіть
ієрархію в `lab-3/README.md`, у блок „Ієрархія компонентів“: від `App` до
`MenuItemRow`, з відступами або символами `├──`, `└──`, `│`». Commit
`docs: add the lab 3 component tree`. Довідка: Step 1.

**4.3. `MenuItemRow`: перший компонент за рецептом.** The recipe:

> **Як винести компонент**
>
> 1. Створіть `src/components/<Назва>.jsx` з
>    `export default function <Назва>() { return (…) }`.
> 2. Виріжте з `App.jsx` JSX, який відображає компонент, і вставте його в
>    `return`.
> 3. Знайдіть у вирізаному JSX змінні, оголошені в `App`: вони стають
>    пропсами. Додайте їх у деструктуризацію параметра й передайте з `App`.
> 4. Перенесіть `key` з вирізаного елемента на компонент у `map`.
> 5. Перенесіть потрібні цьому JSX імпорти й видаліть з `App.jsx` ті, що там
>    більше не використовуються (ESLint їх підкреслить).
> 6. Збережіть файли: сторінка не має змінитися.

Then the recipe worked through on the item row, with the code in full:

```jsx
export default function MenuItemRow({ item }) {
  return (
    <tr className={item.available ? 'item' : 'item unavailable'}>
      <th scope="row">
        {item.name}
        {!item.available && ' — немає'}
      </th>
      <td>{item.price} грн</td>
    </tr>
  )
}
```

and the line that replaces the `<tr>` in `App`'s inner `map`:
`<MenuItemRow key={item.id} item={item} />`. One line per recipe step says
what happened: the cut `<tr>`, `item` as the only prop, `key` moved out,
`import MenuItemRow` added to `App.jsx`. «Що має вийти: сторінка не
змінилася; у Components ⚛ під `App` — десять `MenuItemRow`». Commit
`refactor: extract MenuItemRow`. Довідка: Step 2; «Рендеринг списків», the
section on keys.

**4.4. `MenuCategory`.** By the recipe. Props table: `category`, «об'єкт
категорії з `data.js`: `id`, `name`, `items`». It renders the `<tbody>` with
the category row and `category.items.map` to `MenuItemRow`. The
`MenuItemRow` import moves from `App.jsx` to `MenuCategory.jsx`. «Що має
вийти: сторінка не змінилася; у Components ⚛ — три `MenuCategory`, у
кожній — її позиції». Commit `refactor: extract MenuCategory`.

**4.5. `MenuTable`.** By the recipe. Props table: `menu`, «масив категорій
з `data.js`». It renders the `<table>` with the `<thead>` and `menu.map` to
`MenuCategory`; `App` renders `<MenuTable menu={menu} />` and keeps the
`data.js` import. Commit `refactor: extract MenuTable`.

**4.6. `SearchBar`.** By the recipe. It has no props: the static version
needs none, and §4.7 is where students work out which ones it will get.
Then the final `App.jsx` in full, to compare with. Commit
`refactor: extract SearchBar`.

**4.7. Дерево в DevTools і стан.**

1. In **Components ⚛**, expand the whole tree and compare it with the
   README. Fix the README if they differ. Next to each `MenuCategory` and
   `MenuItemRow`, DevTools shows its `key`.
2. Fill in the «Стан» table with the three questions from Step 3, then
   finish the line «Стан житиме в компоненті …» using Step 4: which
   components use those values, and what is their closest common parent?

Commit `docs: check the tree and describe the state`. Довідка: Step 3, Step 4.

**4.8. Перевірки, GitHub і Vercel.** ЛР-2 §4.7 with `lab-3`: `npm run lint`,
`npm run format:check`, `npm run build`, `git push`, a new Vercel project
`react-lab-3` with Root Directory `lab-3`, and the address from **Overview**
→ **Domains**. The commit history to compare against:

1. `chore: add lab 3 starter`;
2. `docs: add the lab 3 component tree`;
3. `refactor: extract MenuItemRow`;
4. `refactor: extract MenuCategory`;
5. `refactor: extract MenuTable`;
6. `refactor: extract SearchBar`;
7. `docs: check the tree and describe the state`.

**4.9. Додаткове завдання** (not graded). Add an `inStockOnly` prop: `App`
passes `inStockOnly={true}` to `MenuTable`, `MenuTable` passes it on to each
`MenuCategory`, and `MenuCategory` filters before it renders, so the count
uses the filtered array:
`const items = inStockOnly ? category.items.filter((item) => item.available) : category.items`.
The unavailable items disappear and the counts change. In DevTools, switch
`inStockOnly` on `MenuTable`: the whole table changes. The checkbox on the
page still does nothing; connecting it needs state in `App`, which is ЛР-4.
Commit `feat: hide unavailable items with a prop`.

### §5. Вимоги до звіту

Subject `[React] ЛР-3: Thinking in React`, with these lines:

```
GitHub repository: https://github.com/<username>/react-labs/tree/main/lab-3
Vercel: https://<project>.vercel.app/
```

The report contains:

1. a screenshot of the page with **Components ⚛** open and the whole tree
   expanded;
2. a screenshot of `npm run lint`, `npm run format:check` and
   `npm run build` passing;
3. whether an AI agent was used, and for what;
4. a short conclusion: what was done and what was hard.

The hierarchy and the state table are in `lab-3/README.md`; the report may
repeat them.

### §6. Усний захист

The intro sentence from ЛР-2: the questions are typical interview
questions, and the instructor may ask to show an answer in the code or in
DevTools. Draft list:

_Thinking in React_

- З яких п'яти кроків складається підхід Thinking in React? Які з них ви
  виконали в цій роботі, а які — ні і чому?
- Чому починають з макета й ієрархії компонентів, а не з коду?
- Що таке принцип єдиної відповідальності? Як він допомагає провести межу
  компонента?
- Як структура даних (`menu` → `items`) підказує ієрархію компонентів?
- Чому заголовок таблиці «Позиція / Ціна» — частина `MenuTable`, а не
  окремий компонент? Коли його варто винести?
- Що таке статична версія? Чому в ній немає стану?
- Згори вниз чи знизу вгору: у якому порядку будувати компоненти? Що
  радить react.dev для малих і великих застосунків? Чому в цій роботі —
  знизу вгору?

_Рефакторинг_

- Що таке рефакторинг? Як ви перевіряли, що поведінка не змінилася?
- Як ви визначали, які пропси потрібні винесеному компоненту?
- Чому `key` переїхав з `<tr>` на `<MenuItemRow>`? Що буде, якщо залишити
  його всередині компонента?
- Що станеться, якщо забути перенести імпорт або залишити зайвий? Хто це
  помітить: Vite, браузер чи ESLint?
- Коли компонент *не* варто розбивати на менші?
- Чим коміт `refactor:` відрізняється від `feat:`?
- Чи змінився DOM після рефакторингу? Чи додає компонент вузли в DOM?

_Пропси й потік даних_

- Що таке односпрямований потік даних? Як `menu` з `data.js` доходить до
  `MenuItemRow`?
- Чому `MenuTable` отримує `menu` пропсом, а не імпортує `data.js` сам?
- Що таке prop drilling? Чи є він у цьому застосунку? А в додатковому
  завданні?
- Чому `SearchBar` не має пропсів? Які пропси він отримає, коли пошук
  запрацює?

_Стан_

- Що таке стан? Чим він відрізняється від пропсів?
- Які три питання допомагають вирішити, чи є дані станом? Застосуйте їх до
  своєї таблиці.
- Чому відфільтровані позиції й кількість позицій у категорії — не стан?
- Що означає «мінімальне, але повне» представлення стану? Чим погано
  зберігати в стані те, що можна обчислити?
- У якому компоненті житиме стан пошуку і чому саме там?
- Що таке зворотний потік даних (Крок 5)?

_Дерева_

- Як змінилося дерево рендерингу після рефакторингу? А дерево залежностей
  модулів?
- Чому тут дерево залежностей модулів має ту саму форму, що й дерево
  рендерингу? Коли вони розходяться?
- Які компоненти кореневі, а які — листки?

### §7. Критерії готовності

1 point after the defence, per the programme.

| Критерій | Мінімальна вимога |
| --- | --- |
| Проєкт | `lab-3/` у `react-labs`; у теці `npm run lint`, `npm run format:check` і `npm run build` проходять |
| Сторінка | така сама, як на початку (знімок у §1) |
| Компоненти | `SearchBar`, `MenuTable`, `MenuCategory`, `MenuItemRow` — кожен у своєму файлі в `src/components/`, з `export default` |
| `App` | рендерить лише заголовок, `SearchBar` і `MenuTable`; `data.js` імпортує тільки `App` |
| Пропси й `key` | дані йдуть пропсами `menu` → `category` → `item`; `key` стоїть на компонентах у `map` |
| Ієрархія | дерево в `lab-3/README.md` відповідає вкладці Components ⚛ |
| Стан | таблиця в `README.md` заповнена, рядок «Стан житиме в…» дописано |
| GitHub | коміти з §4.8 |
| На занятті | усі коміти §4.1–4.8 відправлено під час заняття (сторінка **Activity**) |
| Vercel | проєкт з Root Directory `lab-3`; адреса показує сторінку з останнього коміту `main` |
| Звіт | усі пункти §5 |

## Files to create or change

- `react-lab-3-starter/` and its line in the README's `src/` tree, next to
  `react-lab-2-starter/`;
- `public/react/labs/lab-3.zip`: built by `build-pack.py`;
- `src/content/labs/react/uk/lab-3.md`: the handout;
- `public/react/labs/lab-3/result.webp` (§1) and `frames.webp` (§4.2). Take
  both from the reference solution in headless Edge. For the framed one, a
  debug script draws numbered boxes over each component's root element from
  `getBoundingClientRect()`. CSS outlines aren't reliable on `<tbody>`, which
  is `MenuCategory`'s root. The script lives with the solution, not in the
  starter;
- `public/react/labs/lab-3.pdf`: `python docs/web/build-handout.py lab-3 react`,
  run from PowerShell (from the Bash tool it has written no PDF before);
- `docs/react/lab-3/solution/`: the reference solution (`src/` overlay,
  `extra/`, and a `README.md` with the tree and the filled state table). It
  goes in `.gitignore`, like `docs/react/lab-2/solution/`;
- `docs/react/lab-3/README.md`: the lasting facts and what was verified;
- `docs/react/course-plan.md`: a ЛР 3 row in **How the site maps to the
  plan**.

## Verification

- The starter and every stage after §4.3–4.6 pass `npm run lint`,
  `npm run format:check` and `npm run build` inside a `react-labs` built by
  ЛР-1. Also check the opposite: leaving the `MenuItemRow` import in
  `App.jsx` after §4.4 fails lint (ESLint 10 counts JSX as a use, so an
  unused component import is reported). The handout promises that ESLint
  underlines it.
- `<search>` renders in Chrome, Edge and Firefox without a React warning
  about an unknown tag. If it warns, use `<div className="search-bar" role="search">`.
- Pressing `Enter` in the search field does nothing. `<search>` isn't a
  form, so there's nothing to submit, unlike react.dev's `<form>`, which
  reloads the page.
- React DevTools 8: the tree matches **The target**, the `key`s show, and a
  boolean prop can be switched in the props panel (§4.9).
- **Timed dry run:** follow the handout as a student, without AI, and time
  each step against **Timing**. The target is 25 minutes or less;
  otherwise apply the cuts listed under **Timing**.
- Readings: whether uk.react.dev has translated Thinking in React by the
  build date (if it has, drop the note in §2), and what the legacy page's
  CodePen examples look like, so §2 describes them correctly. Check the
  anchors used by the «Довідка» links.
- The zip stores LF and passes `format:check` after unpacking; a clone with
  `core.autocrlf=true` passes too; Windows **Extract All** proposes `lab-3`.
- `npm install` in the root adds only the `lab-3` workspace to the lockfile.
- Vercel: a third project from the same repository builds with Root
  Directory `lab-3`.
- `npm run check && npm run build` for the site; the PDF builds with both
  images.

## Decisions

1. **The lab doesn't depend on ЛР-2** (settled 2026-11-05). A starter made
   from ЛР-2's finished «Команда проєкту» with a new mockup was considered
   and dropped. ЛР-3 has its own app, and a student who missed ЛР-2 can do
   it.

Proposed, following ЛР-2 unless the instructor says otherwise:

2. **Theme: «Меню кав'ярні»**, shaped like react.dev's product table, so the
   reading and the task line up.
3. **AI:** code by hand, AI completions may stay on, agents not
   recommended; the report asks whether an agent was used, and the defence
   asks students to explain the refactoring.
4. **Deadline:** none. Every task is done in class, checked by the push
   times on GitHub **Activity**; §4.9 is the one optional task.
5. **Steps 3–4 on paper, step 5 not done.** `useState` arrives in Лекція 2
   and ЛР-4. Whether ЛР-4 continues from `lab-3/` (adding the state the
   table describes) is for ЛР-4's plan to decide; this lab doesn't depend on
   it.

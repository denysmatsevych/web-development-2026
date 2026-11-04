# Plan: React ЛР-2 «Створення компонентів. Дерево компонентів і передача пропсів»

Status: written on 2026-11-04; the decisions were settled and the lab was
built the same day on branch `feat/react-lab-2`, PDF included. What was
verified and what wasn't is in this folder's [README.md](README.md), which
holds the facts that last. Delete this file once the lab is published.

Deviations from the plan:

- **§4.4 keeps the lead's trial avatar** and replaces only the second one.
  Replacing both would leave an unused `Avatar` import, and lint would fail
  until §4.5.
- **§1 shows the tree compactly** (`Profile × 4`), so students still write
  the expanded render tree in §4.6. §4.6 asks why `size` is missing from the
  second `Avatar`'s props and leaves the answer to the defence.
- **`build-pack.py` also normalises `.jsx` and `.tsx` to LF.** They weren't
  in its list of text files, so a CRLF checkout would have packed the
  starter's JSX with CRLF and failed `format:check`.
- **The handout opens a second terminal for git** and makes the starter commit
  in the root, so it includes `package-lock.json`.
- **`build-handout.py` embeds images from `public/`** (the lab's PDF is the
  first with an image), and caps their height so §1's screenshot stays on
  page 1.
- **The tree page's Ukrainian title** is «Розуміння вашого UI як дерева».

## Context

From [../course-plan.md](../course-plan.md), row 1.3:

- **Тема:** «Створення компонентів. Побудова дерева компонентів та передача
  Props»
- **Самостійна робота:** «Проєктування ієрархії компонентів» (2 год.)
- **Читання:** Основна 1 (react.dev), 5 (Advanced React), 7 (Стефанов)
- **Position:** after Лекція 1 (JSX, semantics, a11y, Vite) and ЛР-1 (the
  `react-labs` repository). Before ЛР-3, which refactors an app by its
  component tree (Thinking in React), and Лекція 2 / ЛР-4, which bring state.

Constraints from the request:

1. No «Теоретична частина»: the handout gives useful links instead.
2. The tasks are simple enough to do without AI.
3. The lab takes 20–30 minutes, so each step has to be clear and
   unambiguous.
4. Students do every task during the lab session (decision 5).

Primary readings, both with Ukrainian translations as of 2026-11-04:

- [Передача пропсів до компонента](https://uk.react.dev/learn/passing-props-to-a-component):
  familiar props, passing and reading props, default values, spread,
  `children`, props are read-only;
- [Ваш UI у вигляді дерева](https://uk.react.dev/learn/understanding-your-ui-as-a-tree)
  (the request gave the English page): the render tree, top-level and leaf
  components, the module dependency tree.

## Design principles

1. **One page and no theory.** The handout's §2 replaces the theory section
   with a short list of links. Each task names the one section of the docs it
   needs, so nobody reads the whole page in class.
2. **It fits in 20–30 minutes.** A starter brings the configuration, styles
   and data, so the students write only components and a few lines of `App`.
   Each step ends with something visible in the browser, so a mistake shows up
   at once rather than at the end.
3. **Written by hand.** Four components, each 3–8 lines. The first is a
   worked example; the other three are given as a props table and the markup
   to render. The work is the function, the destructuring and the import,
   which is the part to practise. AI completions in the editor may stay on;
   having an agent write the components is not recommended (decision 2).
4. **The tasks follow react.dev.** `Avatar` with `person` and a default
   `size`, `Profile` and `Card` with `children` are the docs' own examples, so
   the reading and the tasks line up one to one.
5. **It stays within the topic.** The handout gives the component tree;
   finding a tree in a mockup is ЛР-3. There is no state (ЛР-4), TypeScript
   (ЛР-19) or prop-type checking.
6. **Semantic markup from the start.** `header`, `main`, `section`,
   `article`, headings `h1` → `h2` → `h3`, and `alt` on every image, as
   Лекція 1 and the `AGENTS.md` from ЛР-1 ask.
7. **Terminology follows uk.react.dev:** «пропс», «пропси», `children`. ЛР-1
   wrote "props"; the code keeps the English names.

## Timing

| Step | Handout | Minutes |
| --- | --- | --- |
| Starter, `npm install`, `npm run dev` | §4.1 | 3 |
| `Header`: string props (worked example) | §4.2 | 3 |
| `Avatar`: an object prop and a default value | §4.3 | 4 |
| `Profile` and the team list | §4.4 | 5 |
| `Card`: `children` | §4.5 | 4 |
| Trees: React DevTools and `lab-2/README.md` | §4.6 | 5 |
| Checks, `git push`, the Vercel project | §4.7 | 4 |
| **Total** | | **28** |

The extra task (§4.8, `Badge`) takes about 3 minutes. It is the only task
that isn't required, and it isn't graded.

All tasks are done in class (decision 5), so nothing can move to self-study.
If the dry run goes over 30 minutes, shorten the steps instead. First, drop
the trial avatars in §4.3; the page shows `Avatar` from §4.4 on, and §4.5
shows both sizes. Next, give `Profile`'s code in full, as `Header`'s is.

## The app: «Команда проєкту»

One page with a header and two cards: a large avatar of the team lead, and
the whole team as a grid of profiles. The data is four fictional people.

Final component tree, which the handout shows in §1:

```text
App
├── Header
├── Card            title="Тімлід"
│   └── Avatar      size={120}
└── Card            title="Команда"
    ├── Profile
    │   └── Avatar  (size not passed → 64)
    ├── Profile
    │   └── Avatar
    ├── Profile
    │   └── Avatar
    └── Profile
        └── Avatar
```

Module dependency tree:

```text
main.jsx
├── index.css
└── App.jsx
    ├── components/Header.jsx
    ├── components/Card.jsx
    ├── components/Avatar.jsx
    ├── components/Profile.jsx
    │   └── components/Avatar.jsx
    └── data.js
```

This page shows the difference the tree page is about: `Avatar` appears five
times in the render tree but is one module, and `Card` renders different
content each time it's used. It also gives the defence two good questions.
DevTools shows no `size` prop on the `Avatar` inside `Profile`, because a
default value belongs to the function's parameter and is not a prop. And the
lead's `Avatar` has `Card` as its parent but `App` as its owner («rendered
by»).

## Starter: `react-lab-2-starter/` → `/react/labs/lab-2.zip`

A top-level folder, following the repo's starter convention (README → **Per-lab
starter kits**; `tsconfig.json` already excludes `*-starter`). It is packed
with `docs/web/build-pack.py`, so the files sit at the zip root.

```text
react-lab-2-starter/
├── .gitignore          the template's
├── .prettierrc.json    as in ЛР-1: { "semi": false, "singleQuote": true }
├── README.md           what the folder is; two empty blocks for the trees (§4.6)
├── eslint.config.js    ЛР-1's, with eslint-config-prettier last
├── index.html          lang="uk", <title>ЛР-2. Команда проєкту</title>
├── package.json        "name": "lab-2"; ЛР-1's scripts (format, format:check) and devDependencies
├── vite.config.js      the template's
├── public/
│   ├── favicon.svg
│   └── avatars/        four SVG avatars: initials on a colour
└── src/
    ├── main.jsx        the template's: imports index.css, renders <App /> in <StrictMode>
    ├── index.css       all the page's styles; class names are listed in the handout
    ├── data.js         export const team = [...]
    └── App.jsx         a placeholder that passes lint
```

- **No lockfile.** The root `package-lock.json` gains `lab-2` when the
  student runs `npm install` in the root. The versions in `package.json` are
  the ones ЛР-1 verified, so npm reuses the packages that are already
  installed.
- **No `src/components/`.** Git doesn't track empty folders; students create
  it in §4.2.
- **Dropped from the template:** `App.css`, `src/assets/`, `public/icons.svg`
  and the demo in `App.jsx`. The template's English `README.md` is replaced.
- **`data.js`:**

  ```js
  export const team = [
    { id: 1, name: 'Олена Коваль', role: 'Тімлідка, frontend', photo: '/avatars/olena.svg', isLead: true },
    { id: 2, name: 'Андрій Мельник', role: 'Backend', photo: '/avatars/andrii.svg' },
    { id: 3, name: 'Ірина Бондар', role: 'UI/UX-дизайн', photo: '/avatars/iryna.svg' },
    { id: 4, name: 'Максим Ткаченко', role: 'Тестування (QA)', photo: '/avatars/maksym.svg' },
  ]
  ```

  (Prettier will wrap the objects over several lines.) `isLead` is used only
  by the extra task.
- **`App.jsx` placeholder:** a `<main>` with one line of text, so
  `npm run lint` passes before any task.
- **`index.css` classes:** `.header`, `.card`, `.card-content` (a wrapping
  flex row), `.profile`, `.avatar` (round, no CSS size, so the `width` and
  `height` attributes set it), `.badge`.
- **The zip is named `lab-2.zip`,** so Windows' **Extract All** and macOS's
  Archive Utility both unpack it into a folder named `lab-2` by default. The
  student then moves that folder into `react-labs/`. `build-pack.py` writes
  `public/labs/<folder>.zip` today; it gains an optional course argument, as
  `build-handout.py` did, that writes to `public/react/labs/` under the lab's
  name.
- **No terminal unpacking in the handout.** Because the files sit at the zip
  root, `tar -xf lab-2.zip` run in `react-labs/` would overwrite the root
  `.gitignore` and `package.json`. §4.1 checks `git status -u`: every new
  file must be under `lab-2/`.

## Handout: `src/content/labs/react/uk/lab-2.md`

About 1,200–1,500 words, much shorter than ЛР-1. Frontmatter as in ЛР-1, with
`number: 2`, `handout: /react/labs/lab-2.pdf` and
`duration: "2 академічні години (практична частина — 20–30 хвилин; самостійна робота — 2 години)"`.

**Top notes.** The usual «Примітка щодо актуальності», and the pointer the
ЛР-1 README asks for: anyone who still has a separate `react-lab-1`
repository moves it first, following ЛР-1 §4.9.

**AI note** (decision 2), in §3: «Код цієї роботи пишіть самостійно.
AI-автодоповнення в редакторі можна залишити ввімкненим, але кожен
запропонований рядок ви маєте вміти пояснити на захисті. Доручати завдання
AI-агентові не рекомендовано: компоненти короткі, і мета — набити руку на
компонентах і пропсах».

### §1. Мета роботи

Write four components by hand, pass data to them through props and see the
app as two trees: the render tree and the module dependency tree.
**Очікуваний результат:** a screenshot of the finished page
(`public/react/labs/lab-2/result.webp`, taken from the reference solution)
and the component tree from the section above.

### §2. Корисні посилання

This section replaces the theory. Each link has one line on what to take from
it:

1. [Ваш перший компонент](https://uk.react.dev/learn/your-first-component):
   a component is a function that returns markup, and its name starts with a
   capital letter.
2. [Імпорт та експорт компонентів](https://uk.react.dev/learn/importing-and-exporting-components):
   one component per file, `export default` and `import`.
3. [JavaScript у JSX з фігурними дужками](https://uk.react.dev/learn/javascript-in-jsx-with-curly-braces):
   `{…}` in attributes and in text.
4. [Передача пропсів до компонента](https://uk.react.dev/learn/passing-props-to-a-component):
   the main page for this lab.
5. [Рендеринг списків](https://uk.react.dev/learn/rendering-lists): `map`
   and `key`, for §4.4 only.
6. [Ваш UI у вигляді дерева](https://uk.react.dev/learn/understanding-your-ui-as-a-tree):
   for §4.6.
7. [React Developer Tools](https://uk.react.dev/learn/react-developer-tools).

No separate «Список джерел» at the end: §2 is the one list.

### §3. Завдання

A numbered list of §4.1–4.7, one line each, then the AI note above and one
sentence: «Усі завдання §4.1–4.7 виконуються на занятті; звіт (§5) можна
надіслати після нього».

### §4. Хід виконання

Every task has the same parts: the file, a props table (name, what it is,
default), the markup to render, the line to add to `App.jsx`, «Що має
вийти» (what the browser shows), a «Довідка» link to the section of §2 it
needs, and the commit message.

**4.1. Starter.** Check that `git status` is clean in `react-labs`. Download
`lab-2.zip`, unpack it, move the `lab-2` folder into `react-labs/`, then:
`git status -u` (all new files under `lab-2/`), `npm install` in the root,
`cd lab-2`, `npm run dev`. Commit `chore: add lab 2 starter`; the commit
includes the root `package-lock.json`.

**4.2. `Header`: string props. Worked example, full code given.**

```jsx
export default function Header({ title, subtitle }) {
  return (
    <header className="header">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </header>
  )
}
```

Create `src/components/`, put the file there, import it in `App.jsx`, and
render `<Header title="Команда проєкту" subtitle="ЛР-2: компоненти й пропси" />`
above `<main>` inside a fragment `<>…</>`. The handout says in two sentences
what each part does: a function with a capital-letter name, destructuring in
the parameter, `{title}` in the markup, `export default`. Commit
`feat: add Header`. Довідка: «Крок 2: Читайте пропси всередині дочірнього
компонента».

**4.3. `Avatar`: an object prop and a default value.**

| Проп | Що це | За замовчуванням |
| --- | --- | --- |
| `person` | об'єкт учасника з `data.js` | — |
| `size` | ширина й висота в пікселях | `64` |

It renders `<img className="avatar" src=… alt=… width=… height=… />`, with
`src` from `person.photo`, `alt` from `person.name` and `width`/`height`
from `size`. To try it, `App` imports `team` and renders
`<Avatar person={team[0]} size={120} />` and `<Avatar person={team[1]} />`.
«Що має вийти»: one large and one small avatar. Commit `feat: add Avatar`.
Довідка: «Знайомі пропси» and «Вказання значення за замовчуванням для пропа».

**4.4. `Profile` and the team list.** Prop `person`. It renders
`<article className="profile">` containing `<Avatar person={person} />`
(without `size`), `<h3>` with the name and `<p>` with the role. In `App`, the
two trial avatars are replaced by the line the handout gives:

```jsx
{team.map((person) => (
  <Profile key={person.id} person={person} />
))}
```

The handout explains `key` in one sentence and links «Рендеринг списків».
«Що має вийти»: four profiles. Commit `feat: add Profile and the team list`.
Довідка: «Крок 1: Передайте пропси до дочірнього компонента».

**4.5. `Card`: `children`.**

| Проп | Що це |
| --- | --- |
| `title` | заголовок картки |
| `children` | вміст між `<Card>` і `</Card>` |

It renders `<section className="card"><h2>{title}</h2><div className="card-content">{children}</div></section>`.
The handout then gives the final `App` body: `<Card title="Тімлід">` with
`<Avatar person={lead} size={120} />` and `<p>{lead.name}</p>`, where
`const lead = team[0]`, followed by `<Card title="Команда">` around the list.
«Що має вийти»: the page from §1's screenshot. Commit `feat: add Card`.
Довідка: «Передача JSX як children».

**4.6. Дерева.**

1. In **⚛ Components**, expand the tree and compare it with §1.
2. Select the lead's `Avatar`, then an `Avatar` inside a `Profile`, and
   compare their props: `size` appears only in the first.
3. In the lead's `Avatar`, change `size` to `200` in the props panel. The
   page updates; after a reload the value is back to 120.
4. Fill in the two blocks in `lab-2/README.md`: the render tree, taken from
   DevTools, and the module dependency tree, taken from the `import` lines.
   Both start from the root line the starter gives and use the indented style
   of §1. Commit `docs: add the lab 2 trees`.

Довідка: «Дерево рендерингу» and «Дерево залежностей модуля».

**4.7. Перевірки, GitHub і Vercel.** In `lab-2/`, run `npm run lint`,
`npm run format:check` and `npm run build`; then `git push`. Create a new
Vercel project from the same repository, as in ЛР-1 §4.8, step 4: Project Name
`react-lab-2`, Root Directory `lab-2`. Copy the address from **Overview** →
**Domains**.

**4.8. Додаткове завдання** (if time is left; not graded). A `Badge`
component that renders `<span className="badge">{children}</span>`. `Profile`
shows `{person.isLead && <Badge>Тімлід</Badge>}`. In DevTools, `Badge`
appears under one `Profile` only: conditional rendering changes the render
tree, as the tree page says.

### §5. Вимоги до звіту

Subject `[React] ЛР-2: Компоненти та пропси`, with these lines:

```
GitHub repository: https://github.com/<username>/react-labs/tree/main/lab-2
Vercel: https://<project>.vercel.app/
```

The report contains:

1. a screenshot of the page with **⚛ Components** open and the lead's
   `Avatar` selected, so its props are visible;
2. a screenshot of `npm run lint`, `npm run format:check` and
   `npm run build` passing;
3. whether an AI agent was used, and for what;
4. a short conclusion: what was done and what was hard.

The trees are in `lab-2/README.md`; the report may repeat them.

### §6. Усний захист

One intro sentence, as in ЛР-1: the questions are typical interview
questions; the instructor may ask to show an answer in the code or in
DevTools. Draft list:

_Компоненти_

- Що таке компонент у React? Чим він відрізняється від звичайної функції
  JavaScript?
- Чому назва компонента починається з великої літери? Чим для React
  відрізняються `<header>` і `<Header>`?
- Чому компоненти не оголошують усередині інших компонентів?
- Чим `export default` відрізняється від іменованого експорту? Як імпортують
  кожен?
- Навіщо кожен компонент в окремому файлі?
- Навіщо фрагмент `<>…</>` в `App`? Що компонент може повернути?

_Пропси_

- Що таке пропси? Як батьківський компонент передає їх дочірньому?
- Чим `size="120"` відрізняється від `size={120}`?
- Навіщо деструктуризація `{ person, size }` у параметрі? Як прочитати пропси
  без неї?
- Які значення можна передати через пропси?
- Чим пропси `src` і `alt` елемента `<img>` відрізняються від пропсів вашого
  `Avatar`?
- Коли діє значення за замовчуванням `size = 64`? Що буде з `size={null}` і
  `size={0}`?
- Чому в DevTools в `Avatar` усередині `Profile` немає пропа `size`, хоча
  зображення має розмір 64?
- Чи може компонент змінити свої пропси? Що використовують, коли дані мають
  змінюватися?
- Що робить `<Avatar {...props} />`? Коли такий запис доречний, а коли
  заважає?
- Що станеться, якщо не передати `person` в `Avatar`?

_children_

- Що таке `children`? Звідки береться його значення в `Card`?
- Коли краще `children`, а коли окремий проп, як `title`?

_Списки й key_

- Навіщо `key` у `team.map(...)`? Чому `person.id`, а не індекс?
- Чому `key` стоїть на `<Profile>`, а не всередині `Profile`? Чи може
  компонент прочитати власний `key`?

_Дерева_

- Що таке дерево рендерингу і як воно пов'язане з вкладкою ⚛ Components?
- Чим дерево рендерингу відрізняється від дерева залежностей модулів? Чому
  `Avatar` у першому трапляється п'ять разів, а в другому — один?
- Які компоненти у вашому застосунку кореневі, а які — листки? Чому це
  важливо для продуктивності?
- Хто рендерить `Avatar` у картці «Тімлід»: `App` чи `Card`? Що DevTools
  показує в полі **rendered by**?
- Як умовний рендеринг змінює дерево рендерингу?
- Навіщо бандлеру дерево залежностей модулів?

_DevTools і деплой_

- Як знайти компонент у DevTools за елементом сторінки?
- Чому зміна `size` у DevTools зникла після перезавантаження?
- Як Vercel збирає `lab-2` з того самого репозиторію, що й `lab-1`?

### §7. Критерії готовності

1 point after the defence, per the programme.

| Критерій | Мінімальна вимога |
| --- | --- |
| Проєкт | `lab-2/` у `react-labs`; у теці `npm run lint`, `npm run format:check` і `npm run build` проходять |
| Компоненти | `Header`, `Avatar`, `Profile`, `Card`: функційні компоненти, кожен у своєму файлі в `src/components/`, з `export default` |
| Пропси | пропси читаються деструктуризацією; `Avatar` має `size = 64`; `Card` рендерить `children` |
| Список | профілі рендеряться через `team.map` з `key={person.id}` |
| Дерева | у `lab-2/README.md` — дерево рендерингу й дерево залежностей модулів, які відповідають коду |
| GitHub | коміти з §4 |
| На занятті | усі коміти §4.1–4.7 зроблено під час заняття (дати видно в `git log`) |
| Vercel | проєкт з Root Directory `lab-2`; адреса показує сторінку з останнього коміту `main` |
| Звіт | усі пункти §5 |

## Files to create or change

- `react-lab-2-starter/` (the folder above) and its line in the README's
  `src/` tree;
- `docs/web/build-pack.py`: the optional course argument;
- `public/react/labs/lab-2.zip`: built by the script;
- `src/content/labs/react/uk/lab-2.md`: the handout;
- `public/react/labs/lab-2/result.webp`: the screenshot for §1;
- `public/react/labs/lab-2.pdf`: `python docs/web/build-handout.py lab-2 react`;
- `docs/react/lab-2/solution/`: the reference solution, used for the
  screenshot and the dry run. It goes in `.gitignore`, like the Web labs'
  solutions, because it solves every task;
- `docs/react/lab-2/README.md`: the lasting facts and what was verified;
- `docs/react/course-plan.md`: a ЛР 2 row in **How the site maps to the
  plan**.

## Verification

- The reference solution passes `npm run lint`, `npm run format:check` and
  `npm run build` inside a `react-labs` built by the ЛР-1 handout.
- **Timed dry run:** follow the handout as a student, without AI, and time
  each step against the **Timing** table. The target is 25 minutes or less;
  if it takes longer, apply the cut described under **Timing**.
- A starter unpacked from the zip passes `npm run format:check` (the zip
  stores LF), and so does a clone made with `core.autocrlf=true`.
- Windows **Extract All** proposes a folder named `lab-2`. macOS can't be
  tested here; the handout's `git status -u` check covers a wrong folder.
- `npm install` in the root adds only `lab-2` to the lockfile and installs no
  second copy of any package.
- React DevTools: the default `size` is absent from the props panel, editing
  a prop re-renders the component, and **rendered by** shows `App` for the
  lead's `Avatar`.
- Vercel: a second project from the same repository with Root Directory
  `lab-2` builds. Find out whether the root `package-lock.json` change in the
  §4.1 commit also rebuilds `react-lab-1`; ЛР-1 says changes outside `lab-*`
  are global. ЛР-1 never ran its Vercel steps, so this is also their first
  test.
- The uk.react.dev section anchors used by the «Довідка» links resolve. Only
  the two primary pages were checked when this plan was written; confirm the
  Ukrainian titles of links 1–3, 5 and 7 in §2 as well.
- `npm run check && npm run build` for the site; the handout PDF builds, with
  the screenshot in it.

## Decisions

Settled on 2026-11-04:

1. **The starter, not `create-vite`.** It saves 5–7 minutes of the 20–30,
   gives every student the same starting point and brings the styles and
   data. Scaffolding with `create-vite` would repeat ЛР-1 §4.2 and §4.4.
2. **AI: code by hand; AI completions may stay on; agents not
   recommended.** The handout's AI note (§3) says so, the report asks
   whether an agent was used and for what (§5), and the defence asks the
   student to explain their code.
3. **Theme: the team page**, because it matches react.dev's examples.
4. **Trees in `lab-2/README.md`.**
5. **Deadline: not set.** Every task is done during the lab session. §3 says
   so, and §7 checks it by the commit dates. The extra task (§4.8) is the
   one exception: it isn't required.

# Plan: React ЛР-5 «Управління подіями. Контрольовані та неконтрольовані компоненти»

Status: proposed on 2026-11-08 and built the same day on branch
`feat/react-lab-5`, Ukrainian only, without the PDF, after the instructor
asked to implement it, so the decisions at the end were built as proposed.
The lasting facts and what was verified are in this folder's
[README.md](README.md); this file stays as the plan the lab was built from.

Deviations from the plan:

- **The starter's `App` has a lead paragraph** (opening hours, the 15-minute
  hold) under the heading, so the page reads as the café's.
- **`GuestsStepper` wraps its buttons and number in a
  `<div className="stepper-controls">`.** A `<legend>` can't sit above a flex
  row inside the `<fieldset>` itself, so the row is its own element.
- **The confirmation reads «Столик на 2 особи заброньовано на ім'я Олена: 14
  листопада о 18:00.»** rather than «Бронювання прийнято: Олена, …».
- **§4.5's «Що має вийти» adds a keyboard check:** `Tab` to «+» and
  `Enter` or `Space` change the number like a click, and focus stays on the
  button at 8. It shows that `onClick` covers the keyboard too.
- **§4.8 doesn't use `getEventListeners`.** Vite's dev client registers its
  own `beforeunload` listener, so the count starts at 1 in development and
  would confuse students. The handout checks with `F5` instead; the counts
  are in `solution/README.md`.
- **§6 has a «Незбережені зміни» group,** asked only of students who did
  §4.8, as ЛР-4 marks its +1 group.
- **The answers left this file.** The mechanism behind §4.6, step 1 and the
  §4.8 stepper result moved to the gitignored `solution/README.md`, which
  also holds the filled README table and the defence notes.

## Context

From [../course-plan.md](../course-plan.md), row 1.7:

- **Тема:** «Управління подіями. Контрольовані та неконтрольовані
  компоненти»
- **Самостійна робота:** «Обробка подій клавіатури та миші» (2 год.)
- **Читання:** Основна 1 (react.dev), 4 (Wieruch, The Road to React)
- **Position:** after Лекція 2 and ЛР-4, before ЛР-6 («Робота зі складними
  формами та валідація (Actions React 19, React Hook Form, Zod)») and Part 2.
  The course plan's **Notes for building the course** say no lecture names
  controlled and uncontrolled components yet, so the lab can't lean on a
  lecture. Its readings carry the topic, as in every lab so far.

What ЛР-4 left for this lab:

- ЛР-4 §4.3 calls the search field **контрольоване** and says: «Чим воно
  відрізняється від неконтрольованого, ви розберете в ЛР-5». Its §2 says the
  same about the section on controlled and uncontrolled components in
  «Поширення стану між компонентами».
- ЛР-4 §4.2's React warning already suggests `defaultValue` for a field that
  only shows a value. ЛР-5 can point back to it.
- ЛР-4's defence asks for an example of an effect that needs a cleanup.
  ЛР-5's extra task gives one.

The constraints are ЛР-1–4's:

1. No «Теоретична частина»: the handout gives useful links instead.
2. The tasks are straightforward and take 20–30 minutes.
3. Every task is done in class, and the code is written by hand.

### The readings

Languages and anchors checked on 2026-11-08:

| Page | Language | Use |
| --- | --- | --- |
| [Реагування на події](https://uk.react.dev/learn/responding-to-events) | Ukrainian | the main page: adding handlers, passing a function rather than calling it, handler props and their names, propagation, `preventDefault` |
| [Поширення стану між компонентами](https://uk.react.dev/learn/sharing-state-between-components#controlled-and-uncontrolled-components) | Ukrainian | what makes a *component* controlled or uncontrolled (§4.5–4.6) |
| [`<input>`](https://uk.react.dev/reference/react-dom/components/input) (reference) | **English only** | `#reading-the-input-values-when-submitting-a-form` (FormData), `#controlling-an-input-with-a-state-variable`, `#im-getting-an-error-a-component-is-changing-an-uncontrolled-input-to-be-controlled` |
| [Форми](https://uk.legacy.reactjs.org/docs/forms.html) and [Неконтрольовані компоненти](https://uk.legacy.reactjs.org/docs/uncontrolled-components.html) (legacy docs) | Ukrainian | the same two ideas in Ukrainian; the code there uses class components, so these pages are for the idea |
| [Manipulating the DOM with Refs](https://uk.react.dev/learn/manipulating-the-dom-with-refs#example-focusing-a-text-input) | **English only** | `useRef` and `focus()` (§4.6) |
| [Synchronizing with Effects](https://uk.react.dev/learn/synchronizing-with-effects#subscribing-to-events) | **English only** | subscribing to a `window` event and removing the listener in the cleanup (§4.8) |
| MDN: [FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData), [`<button>` `type`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/button), [KeyboardEvent.key](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key), [requestSubmit()](https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/requestSubmit), [Event.currentTarget](https://developer.mozilla.org/en-US/docs/Web/API/Event/currentTarget) | **English only**: each `/uk/` address redirects to `en-US` | the browser side of each step |

Anchors on «Реагування на події» that the «Довідка» links use, all present:
`#adding-event-handlers`, `#passing-event-handlers-as-props`,
`#naming-event-handler-props`, `#event-propagation`,
`#preventing-default-behavior`. On the legacy «Форми» page:
`#controlled-components`.

Before class: «Реагування на події» and the section on controlled and
uncontrolled components in «Поширення стану між компонентами». Both are in
Ukrainian.

## The idea: a table booking form

The lab has a new, small app in the same café brand as ЛР-3–4: **«Бронювання
столика»**. It is one form with a name, a date, a time, the number of guests and
a comment, plus «Забронювати» and «Очистити» buttons. The starter gives it as
static markup, so nothing works yet. Students make it work one event at a
time, and each step leaves one value either with the browser or with React:

1. **Форма без JavaScript** (§4.1). Students submit the starter's form and see
   what the browser does on its own. The page reloads, the data appears in
   the address bar, and pressing «+» does the same, because a `<button>`
   without `type` inside a form submits it.
2. **`onSubmit` і `preventDefault`** (§4.2). The form is submitted without a
   reload. `new FormData(e.currentTarget)` reads the fields and the page shows
   a confirmation. The name, date and time fields have no state: they are
   **неконтрольовані**, because the browser holds their values and React reads
   them once, on submit.
3. **Контрольоване поле** (§4.3). The comment gets a live character counter
   «N / 200». A counter needs the value during render, so the comment moves
   into state with `value` and `onChange`, as ЛР-4's search field did. With
   **Highlight updates when components render**, students note what renders
   while they type in the name and in the comment.
4. **Клавіатура: `Ctrl+Enter`** (§4.4). A single `onKeyDown` on the `<form>`
   submits it with `Ctrl+Enter` (`⌘+Enter` on macOS) from any field. The
   handler sits on the form, but the keys are pressed in a field, so this step
   is about propagation, and about `e.target` against `e.currentTarget`, as
   much as about the keyboard.
5. **Миша: кнопки − і +** (§4.5). `GuestsStepper` gets `type="button"`, click
   handlers and its own state, which starts from a `defaultValue` prop. It is
   an **uncontrolled component**: the parent sets only the starting value, and
   learns the current one from a hidden input when the form is submitted.
6. **«Очистити»** (§4.6). The native reset button clears some fields and leaves
   others. Students note which ones. Then they make the reset complete:
   `onReset` clears the comment's state, and `GuestsStepper` becomes a
   **controlled component** (`value` + `onChange`, named after `<input>`'s
   props), because its parent now has to reset it. A ref moves focus back to
   the name field.
7. **Checks, GitHub and Vercel** (§4.7). This is the 1-point lab.

The README holds a small table that students fill in as they go, one row per
field: is it controlled, where does its value live, and does `BookingForm`
render when the value changes. The filled-in table and the reasons behind it
go only in `solution/README.md`, as ЛР-4's answers do.

### Why a new app and not ЛР-4's menu

The menu has one text field, and it is already controlled. It has no submit,
no reset and no reason to read values only on submit, so an uncontrolled field
would be made up for the occasion. A booking form needs a real submit, a
reset, fields that don't need React, and one that does. It is also a form
students will meet in real projects. Keeping ЛР-3–4's look (the same
`index.css` palette, the café's name) keeps the course's thread without
dragging in the menu's code.

The `/` shortcut that focuses the search (from ЛР-4's plan) would have kept the
menu, but it teaches one `window` listener. The booking form covers form,
keyboard and mouse events, and §4.8 still has a `window` listener with a
cleanup.

### Two meanings of «контрольований»

react.dev uses the word in two places, and the lab uses both on purpose:

- **A field** is controlled when React state sets its `value` and `onChange`
  updates that state (`<input>` reference). It is uncontrolled when the DOM
  keeps the value and React reads it when it needs to (`defaultValue`,
  FormData, a ref).
- **A component** is controlled when its important information comes from
  props, and uncontrolled when it keeps it in its own state («Поширення стану
  між компонентами», the `Panel` example).

`GuestsStepper` moves from the second kind of uncontrolled to controlled in
§4.6, and its props mirror `<input>`'s (`defaultValue` first, then `value`
and `onChange`). That lets one defence question join the two meanings: «чим
`<GuestsStepper value onChange>` схожий на `<input value onChange>`?».

### Why FormData, and where the ref goes

react.dev's current way to read uncontrolled fields is FormData in the submit
handler (the `<input>` reference does exactly this), not one ref per field.
FormData is also what React 19's form Actions receive, so ЛР-6 can start from
it. The lab still needs `useRef`, the other classic tool for uncontrolled
components, so it uses one where a ref is the right tool: moving focus to the
name field after a reset. The defence asks how a ref could read a field's
value too, and why that isn't done during render (ESLint's `react-hooks/refs`
reports it; see below).

`e.currentTarget` rather than react.dev's `e.target`: for `submit` both are the
form, but §4.4 depends on the difference, so the lab uses the property that
always names the element with the handler.

### Why the native reset button

`<button type="reset">` needs no JavaScript, so it shows plainly who owns each
value: the browser resets what it holds, and React state needs `onReset`. The
handout lets students see which fields stay before it tells them what to do.
The *why* is a defence question, so the mechanism (checked in React DOM
19.3.1's source and in Edge) and the measured result are in
`solution/README.md`.

### ESLint already teaches part of the lesson

Checked on 2026-11-08 with `eslint-plugin-react-hooks` 7.1.1 and ЛР-1's
`eslint.config.js`, in the `react-labs` workspace used for ЛР-4:

- `onClick={setGuests(guests + 1)}` and `onClick={handleIncrement()}` are both
  errors: `react-hooks/set-state-in-render`, «Cannot call setState during
  render». The handout's «якщо ESLint підкреслить…» note covers the most
  common event-handler mistake.
- Reading `nameRef.current` in the JSX (for example, to show a counter for an
  uncontrolled field) is an error: `react-hooks/refs`, «Cannot access refs
  during render».
- Using a ref inside an event handler raises nothing.

§7 asks for no errors and no warnings, as in ЛР-4.

## Design principles

1. **One page and no theory.** §2 is a list of links; each task links the
   section it needs.
2. **Watch the browser first, then take over.** §4.1 shows the default
   behaviour (reload, query string, the submitting «+»), and §4.2–4.6 each
   take over one piece of it. Every step changes what the page does, so each
   commit is `feat:`.
3. **One owner per value.** Each step ends with a value either in the DOM or
   in React state, and the README table records which. Computed values stay
   computed: the counter is `comment.length`, not a second state.
4. **react.dev's names.** Handlers are `handleSubmit`, `handleKeyDown`,
   `handleReset`, `handleIncrement`; handler props start with `on`; the
   stepper's props are `defaultValue`, `value` and `onChange`, like an
   `<input>`.
5. **No validation beyond `required`.** The starter keeps HTML's `required` on
   the name, date and time, which students know from the Web course, so the
   confirmation never shows empty values. Validation is ЛР-6's (Zod, React
   Hook Form), and so are Actions, `useActionState` and `useFormStatus`.
6. **Small diffs.** The starter has the form's markup, the CSS and a pure
   function, `describeBooking`, that builds the confirmation text (plural
   forms, the date in words). The lab is about events and ownership, not
   `Intl`.
7. **Accessibility carries over.** Every field has a `<label>`; the stepper is
   a `<fieldset>` with a `<legend>`, its buttons have names («Менше гостей»,
   «Більше гостей»), and the number is in an `<output>`; the counter is tied
   to the comment by `aria-describedby`; the confirmation is a `<p
   role="status">` that is always in the DOM, so screen readers announce its
   text when it changes; after a reset, focus goes to the first field. At 1
   and 8 guests the buttons get `aria-disabled` and the handlers clamp the
   value, instead of `disabled`: a focused button that becomes disabled loses
   focus, the same problem ЛР-4's always-visible reset button avoided
   (**Verification** checks this in Chrome and Edge).

## The app: what changes

### `src/describeBooking.js`, given in the starter

```js
const guestWords = { one: 'особу', few: 'особи', many: 'осіб', other: 'особи' }
const pluralRules = new Intl.PluralRules('uk')
const dateFormat = new Intl.DateTimeFormat('uk', {
  day: 'numeric',
  month: 'long',
})

// Повертає текст підтвердження для даних форми бронювання. FormData
// повертає рядки, тож кількість гостей перетворюється на число, а дата
// читається як місцева, щоб не зсунутися через часовий пояс.
export function describeBooking({ name, date, time, guests, comment }) {
  const count = Number(guests)
  const words = guestWords[pluralRules.select(count)]
  const day = dateFormat.format(new Date(`${date}T00:00`))
  const text = `Бронювання прийнято: ${name}, столик на ${count} ${words}, ${day} о ${time}.`
  return comment ? `${text} Коментар: «${comment}».` : text
}
```

For example: «Бронювання прийнято: Олена, столик на 2 особи, 14 листопада о
18:00.» The wording avoids the vocative, which a function can't build from a
name.

### The starter's `BookingForm.jsx` and `GuestsStepper.jsx`

`BookingForm` is static markup: the three fields with `name`, `required` and
`autoComplete="name"` on the name; `<GuestsStepper />`; the comment
`<textarea name="comment" maxLength={200} aria-describedby="comment-counter">`;
`<p id="comment-counter" className="counter">0 / 200</p>`; «Забронювати»
(`type="submit"`) and «Очистити» (`type="reset"`); and an empty
`<p role="status" className="status">`.

`GuestsStepper` renders the fieldset with «−», `<output>2</output>`, «+» and
`<input type="hidden" name="guests" value="2" />`. Its two buttons have **no
`type` on purpose**: §4.1 has students notice that «+» submits the form, and
§4.5 fixes it. The handout says so in §4.1, so the omission isn't mistaken for
a slip.

### The code after §4.6 (the 1-point lab)

The handout gives this code step by step, so it isn't an answer key. The
README table, the highlight observations and the reasons are.

`src/components/BookingForm.jsx`:

```jsx
import { useRef, useState } from 'react'
import GuestsStepper from './GuestsStepper.jsx'
import { describeBooking } from '../describeBooking.js'

export default function BookingForm() {
  const [booking, setBooking] = useState(null)
  const [comment, setComment] = useState('')
  const [guests, setGuests] = useState(2)
  const nameRef = useRef(null)

  function handleSubmit(e) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setBooking(Object.fromEntries(formData))
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.currentTarget.requestSubmit()
    }
  }

  function handleReset() {
    setBooking(null)
    setComment('')
    setGuests(2)
    nameRef.current.focus()
  }

  return (
    <form
      className="booking-form"
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      onReset={handleReset}
    >
      <label>
        Ім'я
        <input ref={nameRef} name="name" autoComplete="name" required />
      </label>
      <label>
        Дата
        <input type="date" name="date" required />
      </label>
      <label>
        Час
        <input type="time" name="time" required />
      </label>
      <GuestsStepper value={guests} onChange={setGuests} />
      <label>
        Коментар
        <textarea
          name="comment"
          maxLength={200}
          aria-describedby="comment-counter"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </label>
      <p id="comment-counter" className="counter">
        {comment.length} / 200
      </p>
      <div className="actions">
        <button type="submit">Забронювати</button>
        <button type="reset">Очистити</button>
      </div>
      <p role="status" className="status">
        {booking && describeBooking(booking)}
      </p>
    </form>
  )
}
```

`src/components/GuestsStepper.jsx` after §4.5 (uncontrolled):

```jsx
import { useState } from 'react'

const MIN = 1
const MAX = 8

export default function GuestsStepper({ defaultValue }) {
  const [guests, setGuests] = useState(defaultValue)

  function handleDecrement() {
    setGuests((g) => Math.max(MIN, g - 1))
  }

  function handleIncrement() {
    setGuests((g) => Math.min(MAX, g + 1))
  }

  return (
    <fieldset className="stepper">
      <legend>Гості</legend>
      <button
        type="button"
        aria-label="Менше гостей"
        aria-disabled={guests === MIN}
        onClick={handleDecrement}
      >
        −
      </button>
      <output>{guests}</output>
      <button
        type="button"
        aria-label="Більше гостей"
        aria-disabled={guests === MAX}
        onClick={handleIncrement}
      >
        +
      </button>
      <input type="hidden" name="guests" value={guests} />
    </fieldset>
  )
}
```

After §4.6 (controlled): the signature becomes `({ value, onChange })`,
`useState` and its import go, the handlers call
`onChange(Math.max(MIN, value - 1))` and `onChange(Math.min(MAX, value + 1))`,
and `guests` becomes `value` in the JSX. `BookingForm` passes
`value={guests} onChange={setGuests}`.

A `hidden` input may take `value` without `onChange`: React DOM lists
`hidden` among the input types whose value is read-only, so there is no
warning (checked in React DOM 19.3.1).

All this code is to be run through Prettier, ESLint and the build at each
stage during the build; see **Verification**.

## Timing

| Step | Handout | Minutes |
| --- | --- | --- |
| Starter, `npm install`, `npm run dev`, try the form, commit | §4.1 | 3 |
| `onSubmit`, `preventDefault`, FormData, the confirmation | §4.2 | 5 |
| Controlled comment with the counter; highlight; two table rows | §4.3 | 4 |
| `Ctrl+Enter` on the form | §4.4 | 2 |
| `GuestsStepper` with its own state (code given in full); a table row | §4.5 | 4 |
| Native reset, `onReset`, the stepper lifted to `value` + `onChange`, the ref; a table row | §4.6 | 6 |
| Checks, `git push`, the Vercel project | §4.7 | 4 |
| **The 1-point lab** | | **28** |

The extra task (§4.8) takes about 5 minutes and isn't graded.

28 minutes is above ЛР-4's 24 for its main part, but ЛР-5 has no +1 task, so
the class still ends inside 30. If the dry run goes over, the cuts in order
are: give §4.6's `GuestsStepper` change in full; move `Ctrl+Enter` (§4.4) to
the extra task, keeping its defence questions on propagation; drop the
highlight from §4.3 and the table's render column.

## Starter: `starters/react/lab-5/` → `/uk/react/starters/lab-5.zip`

Built like ЛР-4's: packed with `python docs/web/build-pack.py
starters/react/lab-5` after the starter is committed, with files at the zip
root and no lockfile. The configs are ЛР-4's files unchanged.

```text
starters/react/lab-5/
├── .gitignore, .prettierrc.json, eslint.config.js, vite.config.js   ЛР-1's tooling
├── index.html          lang="uk", <title>ЛР-5. Бронювання столика</title>
├── package.json        "name": "lab-5"; ЛР-4's scripts and devDependencies
├── README.md           commands; the «Контрольовані й неконтрольовані» table
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx            unchanged (StrictMode)
    ├── index.css           ЛР-4's palette and fonts; .booking-form, .stepper (incl. [aria-disabled='true']), .counter, .status, .actions
    ├── describeBooking.js  the confirmation text (above)
    ├── App.jsx             <main className="app">: <h1>Бронювання столика</h1> and <BookingForm />
    └── components/
        ├── BookingForm.jsx     static form (above)
        └── GuestsStepper.jsx   static stepper, buttons without type (above)
```

`README.md` (Ukrainian, Prettier-clean): what the folder is, the commands and
the link to the instructions, as in ЛР-4. Then a section **«Контрольовані й
неконтрольовані»** with this table to fill:

| Поле | Контрольоване? | Де зберігається значення | Чи рендериться `BookingForm`, коли значення змінюється |
| --- | --- | --- | --- |
| Ім'я (§4.3) | | | |
| Коментар (§4.3) | | | |
| Гості (§4.5) | | | |
| Гості (§4.6) | | | |

The date and time behave like the name, so they have no rows. Each row is
filled at its step and goes into that step's commit.

## Handout: `src/content/labs/react/uk/lab-5.md`

About 1,600–1,800 words, like ЛР-4 without its +1 section. Frontmatter as in
ЛР-4, with `number: 5`, `title: "Управління подіями. Контрольовані та
неконтрольовані компоненти"` (the programme's title in full), the same
`duration`, and `handout: /uk/react/labs/lab-5.pdf` once the PDF is built
after the instructor's review. Ukrainian only; English later, as for ЛР-1.

Draft `summary`: «Форма бронювання столика в кав'ярні: надсилання без
перезавантаження (onSubmit, preventDefault, FormData), контрольоване поле з
лічильником символів, Ctrl+Enter і спливання подій, лічильник гостей на
кнопках миші, кнопка «Очистити» та перехід від неконтрольованого компонента
до контрольованого. Деплой на Vercel.»

**Top note.** The usual «Примітка щодо актуальності».

### §1. Мета роботи

Draft: «Навчитися обробляти події форми, клавіатури й миші в React і
розрізняти контрольовані та неконтрольовані поля й компоненти: зібрати форму
бронювання столика, у якій частину значень зберігає браузер, а частину —
стан React, і для кожного значення вирішити, кому воно має належати.»

**Очікуваний результат:** у теці `lab-5/` the form is submitted without a
reload and shows the confirmation; the counter follows the comment;
`Ctrl+Enter` submits from any field; − and + change the guests from 1 to 8
without submitting; «Очистити» clears everything and puts the cursor in the
name field; the README table is filled in; the app is on Vercel. Screenshot
`/uk/react/labs/lab-5/result.webp`: the form after a booking, with a comment
typed and the confirmation shown.

### §2. Корисні посилання

The readings table above, in this order: «Реагування на події»; «Поширення
стану між компонентами» (the section on controlled and uncontrolled
components); the `<input>` reference (English); the legacy «Форми» and
«Неконтрольовані компоненти» (Ukrainian, class components); Manipulating the
DOM with Refs (English); the MDN pages; Synchronizing with Effects for §4.8.
Opening paragraph as in ЛР-4: no theory, what to read before class, the rest
when a task points to it.

### §3. Завдання

A numbered list of §4.1–4.7, one line each, then ЛР-4's notes: «Усі завдання
§4.1–4.7 виконуються на занятті (орієнтовно 20–30 хвилин); звіт (§5) можна
надіслати після нього», §4.8 is optional and ungraded, and the AI note with
this lab's aim: «мета — навчитися самому вирішувати, чиє це значення:
браузера чи React, і як подія його змінює».

### §4. Хід виконання

As in ЛР-4: each task names its files, says what to do, and ends with «Що має
вийти», the commit and a «Довідка» link.

**4.1. Стартовий проєкт.** ЛР-4 §4.1 with `lab-5`: a clean `git status`,
unpack `lab-5.zip` in the file manager (not in the repository root from a
terminal), `git status -u`, `npm install` in the root, `cd lab-5`,
`npm run dev`, a second terminal for git, the file table. Then three things to
try before any code:

1. «Забронювати» with empty fields: the browser asks for the name.
2. Fill in the name, date and time, then «Забронювати»: the page reloads, the
   fields are empty, and the address bar shows `?name=…&date=…`. This is how a
   form is submitted without JavaScript.
3. «+»: the same happens. A `<button>` inside a form with no `type` is a
   submit button; §4.5 fixes it.

Commit `chore: add lab 5 starter`.

**4.2. Надсилання форми без перезавантаження.** `handleSubmit` in full (the
listing above), `onSubmit={handleSubmit}` on the form, the `booking` state, and
the confirmation in `<p role="status">`. One line each on: `onSubmit` gets the
function, not its result; `preventDefault` cancels the reload; FormData reads
every field that has a `name`; `Object.fromEntries` makes an object of it. The
link to «якщо ESLint підкреслить `onSubmit={handleSubmit()}`…» is the
`set-state-in-render` note.

«Що має вийти»: no reload and no query string; the confirmation shows the
name, the date in words, the time and «2 особи»; the fields keep what was
typed; in **Components ⚛**, `BookingForm` has one `State`, and typing in the
name changes no hook. One sentence names this: the browser holds the field's
value and React reads it once, on submit, so the field is
**неконтрольоване**. «+» still submits the form; §4.5 fixes it.

Commit `feat: submit the booking without a page reload`. Довідка:
`#adding-event-handlers`, `#preventing-default-behavior`, `<input>` →
Reading the input values when submitting a form.

**4.3. Контрольоване поле: коментар із лічильником.** The counter has to change
as the student types, so React needs the comment during render: `comment`
state, `value` and `onChange` on the textarea, `{comment.length} / 200` in the
counter. A pointer back to ЛР-4's search field, which was controlled in the
same way. Then the highlight, with the steps repeated for students who skipped
ЛР-4 §4.7 (Components ⚛ gear → General → **Highlight updates when components
render**): type in the name, then in the comment, and fill the two rows of the
README table.

«Що має вийти»: the counter follows typing and stops at 200; `BookingForm`'s
second `State` changes with every letter; the confirmation includes the
comment. The handout doesn't say what the highlight shows; the table records
it.

Commit `feat: count the comment characters`. Довідка: `<input>` → Controlling
an input with a state variable; «Поширення стану…» →
`#controlled-and-uncontrolled-components`; legacy «Форми» →
`#controlled-components`.

**4.4. Клавіатура: `Ctrl+Enter` надсилає форму.** In the comment, `Enter`
makes a new line, so the shortcut is `Ctrl+Enter` (`⌘+Enter` on macOS).
`handleKeyDown` in full, on the **form**. Two lines on why that works:
`keydown` bubbles from the field to the form, so one handler serves every
field; `e.target` is the field where the key was pressed, and
`e.currentTarget` is the form, whose `requestSubmit()` submits it the way the
button does, browser checks included.

«Що має вийти»: `Ctrl+Enter` in the comment submits; with an empty name the
browser asks for it, as with the button; `Enter` alone in the comment still
makes a new line.

Commit `feat: submit the form with Ctrl+Enter`. Довідка:
`#event-propagation`; MDN KeyboardEvent.key, requestSubmit(),
Event.currentTarget.

**4.5. Миша: кнопки − і +.** `GuestsStepper` in full (the listing above);
`BookingForm` renders `<GuestsStepper defaultValue={2} />`. Short notes:
`type="button"` stops the button from submitting the form (§4.1, step 3);
`onClick={handleIncrement}` passes the function, and
`onClick={handleIncrement()}` would call it during render, which ESLint
reports; the updater function `(g) => …`. One sentence: the component keeps
its own value and the parent only sets where it starts, like `defaultValue` on
an uncontrolled `<input>`, so this is an **неконтрольований компонент**. Then
the table row, using the highlight while clicking.

«Що має вийти»: − and + change the number from 1 to 8 and never submit the
form; at 1 and 8 the button looks inactive and keeps focus; the confirmation
shows the chosen number with the right word («1 особу», «5 осіб»); in
Components ⚛, `GuestsStepper` has a `State` and the prop `defaultValue: 2`.

Commit `feat: choose the number of guests`. Довідка:
`#passing-event-handlers-as-props` (the pitfall box about passing, not
calling), `#naming-event-handler-props`; MDN `<button>` `type`.

**4.6. «Очистити»: хто володіє значенням.**

1. Fill in everything, set 5 guests, type a comment, press «Очистити», and note
   which fields were cleared and which were not.
2. `onReset={handleReset}` on the form; `handleReset` empties the comment's
   state and the confirmation.
3. The guests can't be reset from `BookingForm`: the value lives inside
   `GuestsStepper`. Lift it: `guests` state in `BookingForm`, the stepper takes
   `value` and `onChange`, loses its `useState`, and calls `onChange` from its
   handlers. One sentence: now the parent decides the value, so it is a
   **контрольований компонент**, with the same props as a controlled
   `<input>`. `handleReset` adds `setGuests(2)`.
4. `useRef` on the name field and `nameRef.current.focus()` in `handleReset`.
5. Fill the last table row.

«Що має вийти»: «Очистити» clears every field, shows «0 / 200» and 2 guests,
hides the confirmation and puts the cursor in the name field; in Components ⚛,
`GuestsStepper` has no hooks and gets `value` and `onChange`, and
`BookingForm` shows three `State` and one `Ref`.

Commit `feat: clear every field with the reset button`. Довідка: «Поширення
стану…» → `#controlled-and-uncontrolled-components`; Manipulating the DOM
with Refs → Example: Focusing a text input; legacy «Неконтрольовані
компоненти».

**4.7. Перевірки, GitHub і Vercel.** ЛР-4 §4.6 with `lab-5`: `npm run lint`
(no errors or warnings), `format:check`, `build`, `git push`, a new Vercel
project `react-lab-5` with Root Directory `lab-5`, the address from
**Overview** → **Domains**. The commit history:

1. `chore: add lab 5 starter`;
2. `feat: submit the booking without a page reload`;
3. `feat: count the comment characters`;
4. `feat: submit the form with Ctrl+Enter`;
5. `feat: choose the number of guests`;
6. `feat: clear every field with the reset button`.

**4.8. Додаткове завдання** (not graded). «Незбережені зміни»:

1. An `isDirty` state, set by one `onInput` on the **form**. `input` events
   bubble from every field, controlled or not, so one handler is enough.
   `handleSubmit` and `handleReset` set it back to `false`. Students check
   whether the stepper's buttons set it, and the defence asks why.
2. An effect that, while `isDirty` is `true`, adds a `beforeunload` listener
   to `window` that calls `e.preventDefault()`, and removes it in the cleanup.
   `F5` with unsent data now asks for confirmation. With the cleanup line
   removed, the warning stays after the form is submitted, and that is the
   cleanup's reason. Chrome's console `getEventListeners(window)` shows the
   listeners piling up.

Commit `feat: warn before leaving with unsaved changes`. Довідка:
Synchronizing with Effects → Subscribing to events; MDN `beforeunload`.

### §5. Вимоги до звіту

Subject `[React] ЛР-5: події, контрольовані й неконтрольовані компоненти`,
with ЛР-4's two lines for `lab-5`. The report contains:

1. a screenshot of the page after a booking, with **Components ⚛** open on
   `BookingForm` and its hooks visible;
2. a screenshot of Components ⚛ on `GuestsStepper` with its props `value` and
   `onChange`;
3. a screenshot of `npm run lint`, `npm run format:check` and `npm run build`
   passing;
4. whether §4.8 was done;
5. whether an AI agent was used, and for what;
6. a short conclusion: what was done and what was hard.

The table is in `lab-5/README.md`; the report may repeat it.

### §6. Усний захист

ЛР-4's intro sentence, then grouped interview questions, each answerable from
the lab and its pre-class reading:

- **«Обробники подій»**: passing against calling, names (`handle…` and
  `on…`), inline arrow against a named function, what ESLint reported.
- **«Об'єкт події та стандартна поведінка»**: `preventDefault`, the default
  `type` of a button, what the browser does with a form without JavaScript,
  `requestSubmit()` against `submit()`.
- **«Спливання подій»**: why a handler on the form catches keys pressed in a
  field, `target` against `currentTarget`, `stopPropagation`, capture.
- **«Клавіатура й миша»**: `e.key`, modifier keys, `⌘` on macOS, why keyboard
  users can still use the stepper.
- **«Контрольовані й неконтрольовані поля»**: the difference, where each value
  lives, the warning about switching from uncontrolled to controlled, why the
  counter needs a controlled field, what the table records and why.
- **«Контрольовані й неконтрольовані компоненти»**: `GuestsStepper` before and
  after §4.6, `defaultValue` against `value` + `onChange`, the link to lifting
  state up (ЛР-4).
- **«Скидання форми й рефи»**: why the native reset left some values, what
  `onReset` adds, what a ref is, why a ref isn't read during render.
- **«Доступність форми»**: labels, `fieldset`/`legend`, `role="status"`,
  `aria-disabled` against `disabled`, where focus goes after a reset.

The handout's §6 will be the full list (ЛР-4 has about 40), and the answers go
in `solution/README.md`.

### §7. Критерії готовності

The lab gives 1 point after the defence. One table:

| Критерій | Мінімальна вимога |
| --- | --- |
| Проєкт | `lab-5/` у `react-labs`; у теці `npm run lint` проходить без помилок і попереджень, `format:check` і `build` — без помилок |
| Надсилання | сторінка не перезавантажується; дані читаються через `FormData`; повідомлення показує ім'я, дату, час, кількість гостей і коментар |
| Неконтрольовані поля | ім'я, дата й час — без `value` і без стану |
| Коментар | контрольоване поле; лічильник обчислюється з довжини коментаря, а не зберігається окремо |
| Клавіатура | `Ctrl+Enter` (`⌘+Enter`) надсилає форму з будь-якого поля; обробник — на `<form>` |
| Гості | кнопки з `type="button"` не надсилають форму; значення від 1 до 8; `GuestsStepper` — контрольований компонент із пропсами `value` і `onChange` |
| Очищення | «Очистити» очищає всі поля, лічильник, кількість гостей і повідомлення; курсор переходить у поле «Ім'я» |
| Таблиця | таблицю в `README.md` заповнено |
| GitHub | коміти з §4.7 |
| На занятті | усі коміти §4.1–4.7 відправлено на занятті (час `git push` видно в **Activity**) |
| Vercel | проєкт з Root Directory `lab-5`; адреса показує сторінку з останнього коміту `main` |
| Звіт | усі пункти §5 |

## Files to create or change

- `starters/react/lab-5/` (above);
- `public/uk/react/starters/lab-5.zip`: built by `build-pack.py` after the
  starter's commit, in its own commit, as for ЛР-2–4;
- `src/content/labs/react/uk/lab-5.md`: the handout;
- `public/uk/react/labs/lab-5/result.webp` (§1): taken from the reference
  solution in headless Edge;
- `public/uk/react/labs/lab-5.pdf`: `python docs/web/build-handout.py lab-5
  react`, run from PowerShell, after the instructor has reviewed the handout;
- `docs/react/lab-5/solution/` (gitignored, next to ЛР-4's): overlays of the
  starter's `src/` after §4.2, §4.3, §4.4, §4.5, §4.6 and §4.8; a `README.md`
  with the filled-in table, what the highlight shows at each step, why the
  native reset leaves the controlled values, and the defence answers; a
  `shots.mjs` that checks every stage and takes the screenshot;
- `docs/react/lab-5/README.md`: the lasting facts and what was verified, with
  no answers;
- `docs/react/course-plan.md`: a ЛР 5 row in **How the site maps to the plan**,
  `ЛР 6–27` in the «not built» row, and the date in the paragraph above the
  table.

Work on a new branch from `main`, `feat/react-lab-5`.

## Verification

**Checked while writing this plan (2026-11-08):**

- the readings' languages and every anchor listed under **The readings**;
- ESLint 7.1.1 on the mistakes under **ESLint already teaches part of the
  lesson**;
- in React DOM 19.3.1's source: how a controlled field behaves on a native
  reset (the finding is in `solution/README.md`), and that `hidden` is a
  read-only-value input type.

**To check during the build:**

- every stage (§4.2–4.6, §4.8) passes `npm run lint` with no problems,
  `format:check` and `build`, in a `react-labs` workspace with ЛР-1's
  tooling; the starter itself passes too, despite the buttons without
  `type`;
- **the browser defaults in §4.1** on the Vite dev server: the empty-name
  prompt, the reload with the query string, and «+» submitting the form;
- **the native reset in §4.6, step 1** behaves the same in Chrome, Edge and
  Firefox (the expected result is in `solution/README.md`); after
  `handleReset`, the textarea, the counter and the hidden input agree;
- **`Ctrl+Enter`**: `requestSubmit()` runs the browser checks and then
  `onSubmit`; `Ctrl+Enter` in a textarea adds no line break in Chrome, Edge or
  Firefox (if one does, add `e.preventDefault()` to the handler); `⌘+Enter`
  on macOS sets `metaKey`;
- **focus at the stepper's limits**: confirm that a focused button that
  becomes `disabled` loses focus in Chrome and Edge, which is the reason for
  `aria-disabled`; if it doesn't, `disabled` with no clamping is simpler and
  the plan changes;
- **`describeBooking`**: «1 особу», «2 особи», «5 осіб», «21 особу»; the date
  in words with no day shift in a UTC+2 browser;
- **React DevTools 8**, using ЛР-2's recipe: the hook labels for
  `BookingForm` and `GuestsStepper` at each stage, and the highlight results
  (recorded in `solution/README.md`, not here);
- **`role="status"`** is announced by NVDA or Narrator when the confirmation
  appears (optional, if a screen reader is at hand);
- **§4.8**: `onInput` on a form fires for a textarea and for text and date
  inputs; the stepper's buttons don't fire it; `beforeunload` asks for
  confirmation after typing (Chrome needs a user gesture first); without the
  cleanup the warning stays after a submit;
- **Timed dry run:** follow the handout as a student, without AI: §4.1–4.7 in
  28 minutes or less, otherwise apply the cuts under **Timing**;
- the zip stores LF and passes `format:check` after unpacking; `npm install` in
  the root adds only the `lab-5` workspace;
- Vercel: a fifth project from the same repository builds with Root Directory
  `lab-5`, and the form works there;
- `npm run check && npm run build` for the site; the handout has no horizontal
  scroll at 390 px; the labs index lists ЛР-5.

## Decisions

Proposed, for the instructor to confirm or change:

1. **A new app, the table booking form, not ЛР-4's menu.** The menu has one
   field and it is already controlled; a form with a submit and a reset is
   where both kinds of field matter. The café's look and name stay. (See
   **Why a new app**.)
2. **Both meanings of «контрольований».** Fields (name, comment) and a
   component (`GuestsStepper`, uncontrolled in §4.5, controlled in §4.6).
3. **FormData reads the uncontrolled fields; `useRef` is used for focus.**
   react.dev's current way, and the shape ЛР-6's Actions will receive.
4. **The native `type="reset"` button with `onReset`,** so students see what
   the browser resets by itself before they write a handler.
5. **Keyboard and propagation in one step,** `Ctrl+Enter` handled on the
   `<form>`. The `window` listener with a cleanup is in the extra task, since
   it's more about effects than events.
6. **No validation beyond HTML's `required`.** Zod, React Hook Form, Actions,
   `useActionState` and `useFormStatus` stay with ЛР-6. ЛР-6 could start from
   ЛР-5's form, but that's ЛР-6's decision.
7. **One point, no +1.** The programme gives each lab 1 point, and ЛР-4's +1
   was a one-off bonus. §4.8 is ungraded. If a +1 is wanted, §4.8 is the
   candidate, done in class after §4.7 is pushed, with a «+1 бал» table in §7.
8. **AI and deadline as in ЛР-4.** Code by hand, AI completions may stay on,
   agents not recommended; no deadline, since every graded task is done in
   class and checked by push times on GitHub **Activity**.
9. **The starter's stepper buttons have no `type` on purpose,** for §4.1's
   observation, and §4.1 says so.

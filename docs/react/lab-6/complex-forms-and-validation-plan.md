# Plan: React ЛР-6 «Робота зі складними формами та валідація (Actions React 19, React Hook Form, Zod)»

Status: proposed on 2026-11-12; the instructor settled the main decisions
the same day (see **Decisions**) and asked to implement it, so it was built
the same day on branch `feat/react-lab-6`, Ukrainian only, with decisions
7–15 as proposed. The PDF follows the instructor's review of the handout.
The lasting facts, what was verified and where the build differs from this
plan are in this folder's [README.md](README.md); this file stays as the plan
the lab was built from.

## Context

From [../course-plan.md](../course-plan.md), row 1.8:

- **Тема:** «Робота зі складними формами та валідація (Actions React 19, React
  Hook Form, Zod)»
- **Самостійна робота:** «Проєктування доступних форм» (2 год.)
- **Читання:** Основна 1 (react.dev); Допоміжна 7 (W3C ARIA APG), 9 (React
  Hook Form), 10 (Zod)
- **Position:** the last lab of Part 1, after ЛР-5 and before Lecture 3 and
  ЛР-7 (custom hooks, render props). The course plan's **Notes for building
  the course** say no lecture names React Hook Form or Zod; Lecture 2 has
  `useActionState`. No lecture deck is built yet, so the readings carry the
  topic, as in every lab so far.

What ЛР-5 left for this lab:

- ЛР-5 reads its fields with `FormData` and its plan left validation, Actions,
  `useActionState` and `useFormStatus` to ЛР-6, adding that «ЛР-6 could start
  from ЛР-5's form».
- `GuestsStepper` ends ЛР-5 as a **controlled component** with `value` and
  `onChange`, named after `<input>`'s props. That is the exact contract React
  Hook Form's `Controller` passes to a custom field.
- ЛР-5's only validation is HTML's `required`. Its lead paragraph already
  states the café's hours, which are a validation rule waiting to be written.
- ЛР-5 chose `aria-disabled` over `disabled` because a focused button that
  becomes disabled loses focus (measured). ЛР-6's submit button, inactive
  while the request is pending, reuses that reason.

The constraints are ЛР-1–5's:

1. No «Теоретична частина»: the handout gives useful links instead.
2. The main part is straightforward and takes 20–30 minutes.
3. Every in-class task is done in class; the code is given in listings and
   typed by hand.

### The readings

Checked on 2026-11-12:

| Page | Language | Use |
| --- | --- | --- |
| [Реагування станом на введення](https://uk.react.dev/learn/reacting-to-input-with-state) | Ukrainian | a form's visual states (typing, submitting, success, error); before class |
| React Hook Form: [Get Started](https://react-hook-form.com/get-started) | **English only** | `#Registerfields`, `#Applyvalidation`, `#IntegratingControlledInputs`, `#SchemaValidation`, `#Handleerrors`; before class |
| React Hook Form API: [useForm](https://react-hook-form.com/docs/useform), [register](https://react-hook-form.com/docs/useform/register), [Controller](https://react-hook-form.com/docs/usecontroller/controller), [useWatch](https://react-hook-form.com/docs/usewatch), [reset](https://react-hook-form.com/docs/useform/reset), [setFocus](https://react-hook-form.com/docs/useform/setfocus) | **English only** | §4.3–4.5 |
| [@hookform/resolvers](https://github.com/react-hook-form/resolvers) (README) | **English only** | `zodResolver` (§4.4) |
| Zod: [Basics](https://zod.dev/basics), [Defining schemas](https://zod.dev/api), [Customizing errors](https://zod.dev/error-customization) | **English only** | §4.2 |
| [`useActionState`](https://uk.react.dev/reference/react/useActionState) | **English only** (the `uk.` address serves English) | `#adding-state-to-an-action`, `#how-useactionstate-queuing-works`, `#reset-state`, `#async-function-outside-transition` (§4.5) |
| [`startTransition`](https://uk.react.dev/reference/react/startTransition) | **English only** | §4.5 |
| [`<form>`](https://uk.react.dev/reference/react-dom/components/form) and [`useFormStatus`](https://uk.react.dev/reference/react-dom/hooks/useFormStatus) | **English only** | `#display-a-pending-state-during-form-submission`, `#handling-form-submission-errors` (§4.7) |
| W3C WAI: [Validating Input](https://www.w3.org/WAI/tutorials/forms/validation/), [User Notifications](https://www.w3.org/WAI/tutorials/forms/notifications/) | **English only** | the self-study topic, «Проєктування доступних форм» |
| MDN: [`aria-invalid`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-invalid), [`aria-describedby`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-describedby), [`noValidate`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/noValidate) | **English only** | §4.4 |

Only one page is in Ukrainian. Before class: «Реагування станом на введення»
and React Hook Form's Get Started.

The React Hook Form and `useActionState` anchors above were checked.
React Hook Form's [setFocus](https://react-hook-form.com/docs/useform/setfocus)
page says «Avoid calling reset() and setFocus() back-to-back», which §4.3
depends on. The Zod, W3C and MDN pages return 200; their anchors and exact
paths still have to be checked. §4.8's readings are the student's: the docs
of whatever libraries they pick.

## ЛР-5's form or a new app

**Settled: continue ЛР-5's booking form.** ЛР-6's starter is ЛР-5's finished
app (after its §4.6) with a few additions, the way ЛР-4's starter was ЛР-3's
solution.

- **`Controller` is the payoff of ЛР-5 §4.6.** Students made `GuestsStepper`
  controlled with `value` and `onChange`; ЛР-6 plugs it into React Hook Form
  without changing it. The ЛР-5 defence question «чим `<GuestsStepper value
  onChange>` схожий на `<input value onChange>`?» gets its practical answer.
- **`register` is ЛР-5's uncontrolled field again.** React Hook Form keeps the
  name, date and time in the DOM and reads them through refs, as ЛР-5 §4.2 did
  with `FormData`. The ownership question ЛР-5 asked for each field carries
  straight over.
- **React Hook Form replaces ЛР-5's hand-written code.** `reset()` replaces the
  three setters in `handleReset`, `setFocus` replaces the ref, `useWatch`
  replaces the comment's state. Students see what a form library takes off
  their hands because they wrote it by hand a week earlier.
- **The rules come from the domain.** The café's hours, «не більше 8 гостей»,
  «не довше за 200 символів» and «дата не в минулому» are already in ЛР-5's
  page or code; only the phone format is new. A cross-field rule (today, but
  the time has passed) comes naturally from a booking.
- **Class time goes to the new tools.** Students know the markup, so the
  20–30 minutes go to Zod, React Hook Form and the Action, not to reading a
  new form.

What a new app would add, and why it isn't worth it here: a registration form
(password and its confirmation) or a form with dynamic rows (`useFieldArray`)
is more "complex" on paper. But the registration rules are generic, the
booking's cross-field rule teaches what password confirmation would, and
dynamic rows don't fit 30 minutes with three new libraries. `useFieldArray`
stays out of scope (see **Decisions**).

Risks, and how the starter handles them:

- **ЛР-5's code becomes public in the ЛР-6 zip.** ЛР-5's handout already
  prints all of it, so no answer leaks. ЛР-5's README table and its filled-in
  answers are **not** carried over: the starter's README is new.
- **Students who didn't finish ЛР-5 aren't blocked:** the starter is complete
  and works on its own.

## The idea: the booking form gets rules, a library and a server

ЛР-5's form accepts anything that passes `required`: a one-letter name,
yesterday's date, 3:00 at night, a phone «123». The browser shows one bubble
at a time, in its own words. The lab fixes that step by step:

1. **Стартовий проєкт** (§4.1). Students submit bad data and see that only
   `required` is checked, one bubble at a time.
2. **Правила в схемі Zod** (§4.2). Every rule goes into `bookingSchema.js`.
   Students check it in the DevTools console with `safeParse`, before any UI
   uses it: a schema is plain JavaScript.
3. **React Hook Form бере значення** (§4.3). `register` for the text, date
   and time fields; `Controller` for `GuestsStepper`; `useWatch` for the
   counter; `handleSubmit`; `reset` and `setFocus` for «Очистити», which
   becomes a plain button. ЛР-5's `useState` for the comment and guests, its
   ref and its `FormData` code go away. The page behaves as before; that is
   the check.
4. **Повідомлення про помилки** (§4.4). `zodResolver`, `mode: 'onTouched'`,
   `noValidate`, a message under each field, `aria-invalid` and
   `aria-describedby`. React Hook Form focuses the first invalid field. One
   `deps` option makes the cross-field rule follow the date.
5. **Надсилання через Action** (§4.5). A given fake server (`api.js`) answers
   after a second, checks the data with **the same schema**, and refuses
   19:00, when the café is full. `useActionState` holds its reply;
   `isPending` shows «Надсилаємо…»; a click while it shows sends nothing.
   After a successful booking the form clears itself; after a refusal the
   values stay. «Очистити» also clears the reply.
6. **Checks, GitHub and Vercel** (§4.6). This is the 1-point lab.
7. **+1 бал на занятті: форма без бібліотек** (§4.7). A one-field «Новини
   кав'ярні» form with `<form action>`, `useFormStatus` and Zod inside the
   action. A form this small needs no form library, and React clears it after
   the action by itself.
8. **+1 бал вдома: ті самі вимоги, інші інструменти** (§4.8). A second copy
   of the booking form, `lab-6-alt/`, with React Hook Form replaced by
   another form library (Formik, TanStack Form, React Final Form…) and,
   optionally, Zod by another schema library (Yup, Valibot…), plus a short
   comparison in its README.

### How React Hook Form and the Action meet

`<form action={fn}>` hands the action a `FormData` and, when the action
finishes, **resets the form's uncontrolled fields**. Checked: React clears
them even when the action returns an error, which would wipe what React Hook
Form keeps in the DOM. So the booking form keeps
`onSubmit={handleSubmit(onValid)}`: React Hook Form validates, and `onValid`
dispatches the Action inside `startTransition`, react.dev's documented way to
call `dispatchAction` outside a form's `action` prop. Without `startTransition`
React logs «An async function with useActionState was called outside of a
transition…» and `isPending` stays `false` (checked). The handout has
students see that message once.

`useFormStatus` reads only a parent `<form action>`, so it can't serve the
booking form. §4.7 uses it where it fits.

### Clearing the form after a successful booking

The Action calls React Hook Form's `reset()` after the server says yes. Two
details shape the code:

- **`reset()` after `await` goes inside `startTransition`.** react.dev's
  `useActionState` caveat: a state update after `await` in the action is not
  part of the Transition unless it's wrapped again. Checked: the fields, the
  guests and the counter go back to their defaults, the confirmation stays,
  and React logs nothing.
- **«Очистити» becomes `type="button"` with `onClick`, not `onReset`.**
  React Hook Form's `reset()` called with no values also calls the browser's
  `form.reset()` (checked in `react-hook-form` 7.92's source), which fires the
  form's `reset` event. With ЛР-5's `onReset={handleReset}` still in place,
  every successful booking ran `handleReset`: the confirmation vanished and
  the cursor jumped to «Ім'я» (checked). The handout makes the change in §4.3,
  where ЛР-5's reset code is rewritten, and says why in one sentence.

### Client and server: one schema

The fake server imports `bookingSchema` and runs `safeParse` itself. Client
validation is for the user; the server's is the guarantee, because anyone can
send a request without the form. The server also has one rule the client
can't know (no free tables at 19:00), and that rule is why the form needs an
error state from the Action at all.

### HTML validation against the libraries

Every field rule here except the cross-field one could be HTML: `required`,
`pattern`, `min`, `max`, `maxLength`. The handout says so in §4.4. The
libraries earn their place with messages in Ukrainian next to each field,
all of them at once, validation timing (`onTouched`), one schema shared with
the server, the cross-field rule, and values from a custom component
(`Controller`). This is presentation topic П2.15, and a defence question.

### ESLint already teaches part of the lesson

Checked on 2026-11-12 with `eslint-plugin-react-hooks` 7.1.1 and ЛР-1's
`eslint.config.js`:

- `const comment = watch('comment')` is a **warning**,
  `react-hooks/incompatible-library`: «React Hook Form's `useForm()` API
  returns a `watch()` function which cannot be memoized safely». §7 asks for
  no warnings, so the handout uses `useWatch` and names the warning.
- The code under **The app: what changes** raises nothing.
- The plugin's list of incompatible libraries names `react-hook-form`,
  `@tanstack/react-table` and `@tanstack/react-virtual`, not Formik or the
  other form libraries §4.8 suggests, so §4.8's "no warnings" requirement is
  reachable.

## Design principles

1. **One page and no theory.** §2 is a list of links; each task links the
   section it needs.
2. **One source of truth for the rules.** `bookingSchema.js` is used by the
   form (through `zodResolver`) and by the server. No rule is repeated in
   JSX.
3. **ЛР-5's code and names stay where they can.** `handleKeyDown`
   (`Ctrl+Enter`) is unchanged and still works, since `requestSubmit()` fires
   the `submit` event `handleSubmit` listens to (checked). `handleReset`
   keeps its name but moves from `onReset` to the button's `onClick`.
   `GuestsStepper` loses only its hidden input.
4. **Accessible errors.** The `<label>` wraps the input and the message sits
   **outside** it: a `<p>` inside a `<label>` is invalid HTML and would become
   part of the field's name. `aria-invalid` and `aria-describedby` tie the
   message to the field. `required` stays next to `noValidate`, so screen
   readers still announce the field as required. On submit, React Hook Form
   focuses the first invalid field, which reads its message. Inline messages
   aren't live regions; the server's reply goes into ЛР-5's `role="status"`.
   WAI's User Notifications tutorial is the reading for these choices.
5. **`aria-disabled` while pending,** with a guard in `onValid`, for ЛР-5's
   reason. `useActionState` queues every dispatch, so without the guard a
   second click books twice. The guard covers clicks once «Надсилаємо…» is
   on screen; a very fast double click is left as it is (see **Decisions**).
6. **Custom messages everywhere, in Ukrainian.** Zod 4 ships a Ukrainian
   locale (`z.locales.uk()`), but its messages read as machine text
   («Неправильний адреса електронної пошти», «очікується, що string матиме
   >=2 символів»), and the defaults are in English.
7. **Small diffs.** The starter gives the markup (the phone field, the error
   placeholders), the CSS, the server, and the date helpers. Students write
   the schema and the React code.
8. **Stable majors only.** React Hook Form 7 (8 is in beta), Zod 4,
   `@hookform/resolvers` 7.

## The app: what changes

### Given in the starter

`src/api.js`, the fake server:

```js
import { bookingSchema } from './bookingSchema.js'
import { describeBooking } from './describeBooking.js'

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Імітує сервер кав'ярні: відповідає за секунду, перевіряє дані тією самою
// схемою, що й форма, і відмовляє, якщо на обраний час столиків немає.
export async function sendBooking(booking) {
  console.info('Сервер отримав бронювання:', booking)
  await wait(1000)
  const result = bookingSchema.safeParse(booking)
  if (!result.success) {
    return { ok: false, message: 'Сервер не прийняв дані: перевірте форму.' }
  }
  if (result.data.time === '19:00') {
    return {
      ok: false,
      message: 'На 19:00 вільних столиків немає. Оберіть інший час.',
    }
  }
  return { ok: true, message: describeBooking(result.data) }
}

// Для §4.7.
export async function subscribe(email) {
  await wait(1000)
  if (email.endsWith('@example.com')) {
    return { ok: false, message: 'Ця адреса вже підписана.', email }
  }
  return { ok: true, message: `Готово: новини надходитимуть на ${email}.` }
}
```

The `console.info` line lets students count requests in §4.5.

`src/bookingSchema.js`, the date helpers and an empty schema:

```js
import { z } from 'zod'

const pad = (n) => String(n).padStart(2, '0')

// Сьогоднішня дата й поточний час у місцевому часовому поясі, у форматах
// <input type="date"> («2026-11-14») і <input type="time"> («18:30»).
// Такі рядки можна порівнювати як рядки.
export function today() {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function nowTime() {
  const d = new Date()
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// §4.2: опишіть тут правила форми бронювання.
export const bookingSchema = z.object({})
```

`src/components/BookingForm.jsx` is ЛР-5's code after §4.6, plus:

- a **«Телефон»** field: `<input type="tel" name="phone"
  autoComplete="tel" placeholder="+380671234567" required />`;
- each of the name, phone, date and time fields wrapped in
  `<div className="field">` with an empty `<p id="name-error"
  className="field-error"></p>` (and `phone-error`, `date-error`,
  `time-error`) after its `<label>`.

ЛР-5's `handleSubmit` reads the phone with the rest of `FormData` and
`describeBooking` ignores it, so the starter works as ЛР-5 ended.

`src/components/GuestsStepper.jsx`, `src/describeBooking.js`: ЛР-5's, unchanged.

`App.jsx`: ЛР-5's, with one more sentence in the lead paragraph: «Столики
бронюємо з 8:00 до 20:00.»

`src/index.css`: ЛР-5's, plus `.field`, `.field-error` (hidden when
`:empty`), `[aria-invalid='true']` (a red border), `.status.error`,
`.actions button[aria-disabled='true']`, and `.subscribe-form` for §4.7.

`package.json`: ЛР-5's, with `react-hook-form`, `zod` and
`@hookform/resolvers` (the adapter `zodResolver` comes from) in
`dependencies`, so one `npm install` in the root installs them.

### The schema after §4.2

```js
export const bookingSchema = z
  .object({
    name: z.string().trim().min(2, "Вкажіть ім'я: щонайменше дві літери"),
    phone: z
      .string()
      .trim()
      .regex(/^\+380\d{9}$/, 'Вкажіть телефон у форматі +380XXXXXXXXX'),
    date: z
      .string()
      .min(1, 'Оберіть дату')
      .refine((date) => date >= today(), 'Ця дата вже минула'),
    time: z
      .string()
      .min(1, 'Оберіть час')
      .refine(
        (time) => time >= '08:00' && time <= '20:00',
        'Столик можна забронювати з 8:00 до 20:00',
      ),
    guests: z.coerce
      .number()
      .int()
      .min(1, 'Щонайменше 1 гість')
      .max(8, 'Не більше 8 гостей'),
    comment: z.string().trim().max(200, 'Коментар — не довше за 200 символів'),
  })
  .refine((booking) => booking.date !== today() || booking.time > nowTime(), {
    error: 'Цей час сьогодні вже минув',
    path: ['time'],
  })
```

What the listing shows, one line each in the handout: `z.object` and field
schemas; `trim`, `min`, `regex`, `max` with messages; `refine` for a rule with
no built-in check; `z.coerce.number()` because a server, or `FormData`, gets
strings; an object-level `refine` with `path` for a rule across two fields.

Checked in Zod 4.6.7: the object-level `refine` runs even when other fields
fail, so all messages appear together; an empty date gives both «Оберіть
дату» and «Ця дата вже минула», and `zodResolver` shows the first;
`z.coerce.number()` turns `'3'` into `3`.

### `BookingForm.jsx` after §4.5 (the 1-point lab)

The handout gives this code step by step (§4.3–4.5), so it isn't an answer
key. What renders when, and the reasons, are.

```jsx
import { startTransition, useActionState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import GuestsStepper from './GuestsStepper.jsx'
import { bookingSchema } from '../bookingSchema.js'
import { sendBooking } from '../api.js'

const defaultValues = {
  name: '',
  phone: '',
  date: '',
  time: '',
  guests: 2,
  comment: '',
}

export default function BookingForm() {
  const {
    register,
    control,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues,
    mode: 'onTouched',
  })
  const comment = useWatch({ control, name: 'comment' })
  const [result, dispatchBooking, isPending] = useActionState(bookTable, null)

  // Дія для useActionState: null — сигнал «Очистити», інакше надсилаємо
  // бронювання на сервер, після успіху очищаємо форму й повертаємо відповідь.
  async function bookTable(previousResult, booking) {
    if (booking === null) return null
    const response = await sendBooking(booking)
    if (response.ok) startTransition(() => reset())
    return response
  }

  function onValid(booking) {
    if (isPending) return
    startTransition(() => dispatchBooking(booking))
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.currentTarget.requestSubmit()
    }
  }

  function handleReset() {
    setFocus('name') // до reset(): він прибирає посилання на поля
    reset()
    startTransition(() => dispatchBooking(null))
  }

  return (
    <form
      className="booking-form"
      noValidate
      onSubmit={handleSubmit(onValid)}
      onKeyDown={handleKeyDown}
    >
      <div className="field">
        <label>
          Ім'я
          <input
            {...register('name')}
            autoComplete="name"
            required
            aria-invalid={errors.name ? 'true' : 'false'}
            aria-describedby="name-error"
          />
        </label>
        <p id="name-error" className="field-error">
          {errors.name?.message}
        </p>
      </div>
      {/* «Телефон» — так само, з register('phone') і phone-error */}
      <div className="row">
        {/* «Дата» — так само, з register('date', { deps: 'time' }) */}
        {/* «Час» — так само, з register('time') */}
      </div>
      <Controller
        name="guests"
        control={control}
        render={({ field }) => (
          <GuestsStepper value={field.value} onChange={field.onChange} />
        )}
      />
      <label>
        Коментар
        <textarea
          {...register('comment')}
          maxLength={200}
          aria-describedby="comment-counter"
        />
      </label>
      <p id="comment-counter" className="counter">
        {comment.length} / 200
      </p>
      <div className="actions">
        <button type="submit" aria-disabled={isPending}>
          {isPending ? 'Надсилаємо…' : 'Забронювати'}
        </button>
        <button type="button" onClick={handleReset}>
          Очистити
        </button>
      </div>
      <p
        role="status"
        className={result?.ok === false ? 'status error' : 'status'}
      >
        {result?.message}
      </p>
    </form>
  )
}
```

The handout prints the phone, date and time fields in full; the comments here
only keep the plan short.

Notes on the choices in this code:

- **`bookTable` lives inside the component** because it needs `reset` from
  `useForm`.
- **`setFocus` before `reset()`.** React Hook Form's `reset()` drops the
  field refs, so `setFocus('name')` right after it does nothing (checked:
  focus stays on «Очистити»), and its docs say not to call them back to back.
  Focusing first works (checked). The handout gives the reason in the code
  comment.
- **`dispatchBooking(null)` clears the reply.** `useActionState` has no
  reset; react.dev's `#reset-state` section shows this exact pattern.
- **`deps: 'time'` on the date.** With a resolver, React Hook Form updates the
  errors of the field that changed. Checked: without `deps`, today with a past
  time, then the date changed to tomorrow, leaves «Цей час сьогодні вже
  минув» on screen; with it, the message goes. §4.4 has students see both.
- **Clearing after success, and the plain «Очистити» button:** see
  **Clearing the form after a successful booking**.

`GuestsStepper.jsx` after §4.3: ЛР-5's controlled version without
`<input type="hidden" name="guests">`, since nothing reads `FormData` any more.

### `SubscribeForm.jsx` (§4.7, +1)

```jsx
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { z } from 'zod'
import { subscribe } from '../api.js'

const emailSchema = z.email('Вкажіть адресу на кшталт olena@gmail.com')

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" aria-disabled={pending}>
      {pending ? 'Підписуємо…' : 'Підписатися'}
    </button>
  )
}

async function subscribeAction(previousState, formData) {
  const email = formData.get('email')
  const result = emailSchema.safeParse(email)
  if (!result.success) {
    return { ok: false, message: result.error.issues[0].message, email }
  }
  return subscribe(result.data)
}

export default function SubscribeForm() {
  const [state, formAction] = useActionState(subscribeAction, null)
  return (
    <form className="subscribe-form" action={formAction} noValidate>
      <label>
        Email для новин
        <input
          type="email"
          name="email"
          defaultValue={state?.email}
          aria-invalid={state?.ok === false ? 'true' : 'false'}
          aria-describedby="subscribe-status"
        />
      </label>
      <SubmitButton />
      <p id="subscribe-status" role="status" className="status">
        {state?.message}
      </p>
    </form>
  )
}
```

`App` renders it in a `<section>` with `<h2>Новини кав'ярні</h2>` under the
booking form. The handout gives it without `defaultValue` first: students see
that a wrong address disappears after the reply (React resets the form after
every action), then add `email` to the returned state and `defaultValue`
(checked: the value stays). The booking form had to call `reset()` itself in
§4.5; here React does it, which is the comparison §4.7 ends on.

## Timing

| Step | Handout | Minutes |
| --- | --- | --- |
| Starter, `npm install`, `npm run dev`, bad data, commit | §4.1 | 3 |
| The schema; `safeParse` in the console | §4.2 | 5 |
| `useForm`, `register`, `Controller`, `useWatch`, `reset` + `setFocus`, the plain «Очистити»; ЛР-5's state goes | §4.3 | 7 |
| `zodResolver`, `noValidate`, messages and ARIA, `deps` | §4.4 | 6 |
| `useActionState`, `startTransition`, pending, the server's reply, clearing after success, the reset signal | §4.5 | 5 |
| Checks, `git push`, the Vercel project | §4.6 | 4 |
| **The 1-point lab** | | **30** |
| `SubscribeForm`, `<form action>`, `useFormStatus`, `defaultValue` | §4.7 | 8 |
| **With the in-class +1** | | **38** |

§4.8 is homework: about 1–2 hours, depending on the libraries chosen.

30 minutes is the top of the range, two more than ЛР-5. If the dry run goes
over, the cuts in order are: drop the console check in §4.2 (the form shows
the same messages in §4.4); give §4.3's `BookingForm` in full rather than as
edits; drop `deps` from §4.4 and keep it as a defence question.

## Starter: `starters/react/lab-6/` → `/uk/react/starters/lab-6.zip`

Built like ЛР-5's: packed with `python docs/web/build-pack.py
starters/react/lab-6` after the starter is committed, files at the zip root,
no lockfile. The configs are ЛР-5's files unchanged.

```text
starters/react/lab-6/
├── .gitignore, .prettierrc.json, eslint.config.js, vite.config.js   ЛР-1's tooling
├── index.html          lang="uk", <title>ЛР-6. Бронювання столика</title>
├── package.json        "name": "lab-6"; ЛР-5's scripts and devDependencies; dependencies
│                       + react-hook-form ^7.92, zod ^4.6, @hookform/resolvers ^7.0
├── README.md           what changed since ЛР-5, the commands
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx            unchanged (StrictMode)
    ├── index.css           ЛР-5's, plus the error, pending, .field and .subscribe-form styles
    ├── api.js              the fake server (above)
    ├── bookingSchema.js    the date helpers and an empty schema (above)
    ├── describeBooking.js  ЛР-5's
    ├── App.jsx             ЛР-5's, one more sentence about booking hours
    └── components/
        ├── BookingForm.jsx     ЛР-5's after §4.6, plus the phone and the error placeholders
        └── GuestsStepper.jsx   ЛР-5's controlled stepper
```

`README.md` (Ukrainian, Prettier-clean): what the folder is, a short «Що вже
є» list (ЛР-5's form, the phone field, `api.js`, the date helpers), the
commands, and the link to the instructions. No table to fill.

## Handout: `src/content/labs/react/uk/lab-6.md`

About 4,500–5,000 words: ЛР-5's size plus the two +1 sections. Frontmatter as
in ЛР-5, with `number: 6`, `title: "Робота зі складними формами та валідація
(Actions React 19, React Hook Form, Zod)"` (the programme's title in full),
the same `duration`, and `handout: /uk/react/labs/lab-6.pdf` once the PDF is
built after the instructor's review. Ukrainian only; English later.

Draft `summary`: «Форма бронювання з ЛР-5 отримує правила, бібліотеку й
сервер: схема Zod з правилами для кожного поля й одним правилом для двох
полів, React Hook Form з register, Controller і useWatch, повідомлення про
помилки під полями з aria-invalid і aria-describedby, надсилання на
імітований сервер через useActionState зі станом очікування й очищенням після
успіху. За додаткові бали — форма підписки на `<form action>` і
`useFormStatus` та версія форми з іншими бібліотеками. Деплой на Vercel.»

**Top note.** The usual «Примітка щодо актуальності», naming React 19, React
Hook Form 7, Zod 4 and `@hookform/resolvers` 7.

### §1. Мета роботи

Draft: «Навчитися будувати складні форми в React: описати правила валідації
однією схемою Zod, яку використовують і форма, і сервер, передати значення
форми React Hook Form, показувати доступні повідомлення про помилки й
надсилати дані через Action React 19 зі станом очікування та відповіддю
сервера.»

**Очікуваний результат:** in `lab-6/` the booking form shows a message under
each wrong field, all at once on submit, with the cursor in the first one;
messages appear when a field is left and disappear as it is fixed; the server
answers after a second, shows «Надсилаємо…» meanwhile, refuses 19:00 and
keeps the values; after a successful booking the form clears and the
confirmation stays; «Очистити» empties everything, including the reply; the
app is on Vercel. One sentence names the two +1 tasks. Screenshot
`/uk/react/labs/lab-6/result.webp`: the form after an empty submit with phone
and time filled wrongly, messages under the fields.

### §2. Корисні посилання

The readings table above, in this order: «Реагування станом на введення»;
React Hook Form Get Started; the React Hook Form API pages; Zod; the resolvers
README; `useActionState` and `startTransition`; WAI's two form tutorials and
the MDN pages; `<form>` and `useFormStatus` for §4.7. Opening paragraph as in
ЛР-5: no theory, what to read before class, the rest when a task points to
it. One line says all but the first are in English, and that §4.8's
libraries bring their own docs.

### §3. Завдання

A numbered list, one line each:

1–6. §4.1–4.6, as in ЛР-5;
7. **+1 бал:** форма підписки без бібліотек форм: `<form action>`,
   `useFormStatus` (§4.7);
8. **+1 бал, домашнє завдання:** та сама форма бронювання з іншими
   бібліотеками (§4.8).

Then the notes, as in ЛР-4: «§4.1–4.6 — основна частина, вона оцінюється в 1
бал; усі її завдання виконуються на занятті (орієнтовно 20–30 хвилин). §4.7
дає ще 1 бал; беріться за неї на занятті, лише коли §4.6 відправлено на
GitHub. §4.8 — домашнє завдання ще на 1 бал; його коміти мають бути на GitHub
до захисту ЛР-6.» The report (§5) can be sent after class. Then the AI note
with this lab's aim: «мета — навчитися самому вирішувати, де живе кожне
правило й кожне значення форми».

### §4. Хід виконання

As in ЛР-5: each task names its files, says what to do, and ends with «Що має
вийти», the commit and a «Довідка» link. The intro says the form is ЛР-5's,
and what's new is listed in the starter's README.

**4.1. Стартовий проєкт.** ЛР-5 §4.1 with `lab-6`: a clean `git status`,
unpack `lab-6.zip` in the file manager, `git status -u`, `npm install` in the
root (it installs the three new packages too), `cd lab-6`, `npm run dev`, the
file table. Then, before any code:

1. «Забронювати» with empty fields: the browser asks for the name, and only
   the name.
2. Name «О», phone «123», yesterday's date, 03:00: the form is accepted and
   the confirmation shows it. The lead paragraph says «з 8:00 до 20:00», but
   nothing checks it.

Commit `chore: add lab 6 starter`.

**4.2. Правила форми в схемі Zod.** The schema listing in full, replacing
`z.object({})`, and one line per idea (see **The schema after §4.2**). Then,
in the DevTools console on the dev server:

```js
const { bookingSchema } = await import('/src/bookingSchema.js')
bookingSchema.safeParse({ name: 'О', phone: '067', date: '2020-01-01', time: '22:00', guests: 9, comment: '' })
```

«Що має вийти»: `success: false` and `error.issues` with a `path` and a
`message` for each wrong field; with valid data, `success: true` and `data`
with the name trimmed. Commit `feat: describe the booking rules with a Zod
schema`. Довідка: Zod Basics, Defining schemas → strings, numbers,
refinements; Customizing errors.

**4.3. React Hook Form бере значення форми.**

1. `useForm({ defaultValues })` (no resolver yet).
2. `{...register('name')}` in place of `name="name"` on the name, phone, date,
   time and comment. One sentence: `register` gives the field `name`,
   `onChange`, `onBlur` and a `ref`; the value stays in the DOM, as with ЛР-5's
   name field, and React Hook Form reads it through the ref.
3. `GuestsStepper` inside `Controller` (listing). One sentence: the stepper is
   a controlled component (ЛР-5 §4.6), so it needs a value and `onChange`,
   which `Controller` passes as `field`. Delete the stepper's hidden input.
4. The counter from `useWatch({ control, name: 'comment' })`. A note: `watch`
   from `useForm` gives an ESLint warning, `react-hooks/incompatible-library`,
   so the lab uses `useWatch`.
5. `onSubmit={handleSubmit(onValid)}` with `onValid(booking)` calling ЛР-5's
   `setBooking(booking)`; delete ЛР-5's `handleSubmit`, the `comment` and
   `guests` state and `nameRef`.
6. `handleReset`: `setFocus('name')`, then `reset()`, then
   `setBooking(null)`, with the reason for the order. «Очистити» becomes
   `<button type="button" onClick={handleReset}>` and `onReset` leaves the
   form. One sentence: `reset()` from React Hook Form also resets the browser
   form itself (`form.reset()`), so an `onReset` handler would run whenever
   the code resets the form, and in §4.5 the code will do that after every
   successful booking.

«Що має вийти»: the page works exactly as at the end of ЛР-5 (confirmation,
counter, stepper, `Ctrl+Enter`, «Очистити» with the cursor in «Ім'я»); the
browser's `required` still blocks an empty name; in **Components ⚛**,
ЛР-5's `comment` and `guests` state are gone from `BookingForm` (the exact
hook list is checked during the build); ESLint reports nothing. Commit
`refactor: keep the form values in React Hook Form` (`refactor`, since the
page doesn't change). Довідка: Get Started → `#Registerfields`,
`#IntegratingControlledInputs`; `useWatch`; `reset`; `setFocus`.

**4.4. Повідомлення про помилки.**

1. `resolver: zodResolver(bookingSchema)` and `mode: 'onTouched'`; one line
   on each of `onSubmit`, `onBlur`, `onTouched`, `onChange`.
2. `noValidate` on the form, so the browser's bubbles give way to the
   schema's messages. `required` stays: screen readers still announce it.
3. For the name, phone, date and time: `aria-invalid`, `aria-describedby`
   pointing to the field's `<p id="…-error">`, and `{errors.name?.message}`
   inside it (the name in full, the rest by analogy).
4. One paragraph: every field rule could be HTML (`pattern`, `min`, `max`);
   what the schema adds (see **HTML validation against the libraries**).
5. Today's date and a time that has passed: the time's message. Change the
   date to tomorrow: the message stays. Add `deps: 'time'` to the date's
   `register` and repeat.

«Що має вийти»: an empty submit shows four messages at once and puts the
cursor in «Ім'я»; a message appears when the field is left and disappears as
it's fixed; 22:00 and «Цей час сьогодні вже минув» behave as the schema says;
with `deps`, the past-time message goes when the date changes; the
confirmation shows the trimmed name. Commit `feat: show validation errors
next to the fields`. Довідка: Get Started → `#SchemaValidation`,
`#Handleerrors`; resolvers README; WAI Validating Input; MDN `aria-invalid`,
`aria-describedby`.

**4.5. Надсилання через Action.**

1. `bookTable` inside the component, `useActionState(bookTable, null)`, and
   `onValid` with the guard and `startTransition`. One line each: an Action is
   a function React runs inside a Transition; `useActionState` returns its
   last result, a function to start it, and `isPending`; it queues every call.
2. In `bookTable`, `startTransition(() => reset())` after a successful
   reply. One sentence: a state update after `await` needs its own
   `startTransition` (react.dev's caveat).
3. The button's text and `aria-disabled`; the status paragraph shows
   `result?.message`, styled as an error when `ok` is `false`.
4. `handleReset` dispatches `null` instead of `setBooking(null)`; delete the
   `booking` state and the `describeBooking` import (the server builds the
   text now).
5. Remove `startTransition(() => …)` around `dispatchBooking(booking)` once,
   submit, read the console error, put it back.

«Що має вийти»: «Надсилаємо…» for about a second; at 19:00 the server's
message, and the values stay; at another time the confirmation, and the
form is empty again (the guests back at 2, the counter at «0 / 200»); a click
on «Забронювати» while «Надсилаємо…» is shown adds no second «Сервер отримав
бронювання» line in the console; «Очистити» removes the reply and puts the
cursor in «Ім'я». Commit `feat: send the booking with an action`. Довідка:
`useActionState` → `#adding-state-to-an-action`,
`#how-useactionstate-queuing-works`, `#reset-state`,
`#async-function-outside-transition`; `startTransition`.

**4.6. Перевірки, GitHub і Vercel.** ЛР-5 §4.7 with `lab-6`: `npm run lint`
(no errors or warnings), `format:check`, `build`, `git push`, a new Vercel
project `react-lab-6` with Root Directory `lab-6`, the address from
**Overview** → **Domains**. The commit history:

1. `chore: add lab 6 starter`;
2. `feat: describe the booking rules with a Zod schema`;
3. `refactor: keep the form values in React Hook Form`;
4. `feat: show validation errors next to the fields`;
5. `feat: send the booking with an action`.

**4.7. +1 бал: форма підписки без бібліотек форм.** In class, after §4.6 is
pushed. «Новини кав'ярні»: `SubscribeForm` (listing without `defaultValue`),
rendered under the booking form in a `<section>`.

1. A wrong address: the message appears and the field is empty. A taken one
   (`…@example.com`): «Підписуємо…», then the server's message. A good one:
   the confirmation, and the field empties by itself.
2. Return `email` from the action's failed result and add
   `defaultValue={state?.email}`; the wrong address now stays.
3. One paragraph to read, not to write: why `SubmitButton` is a separate
   component (`useFormStatus` reads the parent `<form>`), why this form needs
   no form library, and that the booking form had to call `reset()` itself
   in §4.5 while `<form action>` resets by itself.

«Що має вийти»: the three cases from step 1, with the wrong address kept
after step 2; `npm run lint`, `format:check` and `build` still pass; Vercel
shows the new commit. Commit `feat: add the newsletter form with a form
action`, pushed in class. Довідка: `<form>` →
`#display-a-pending-state-during-form-submission`,
`#handling-form-submission-errors`; `useFormStatus`.

**4.8. +1 бал, домашнє завдання: ті самі вимоги, інші інструменти.** After
§4.6 is pushed; the commits must be on GitHub before the ЛР-6 defence. The
handout gives steps and requirements, no code:

1. Copy `lab-6/` to `lab-6-alt/` in the file manager, without
   `node_modules/` and `dist/`. In `lab-6-alt/package.json`, change `"name"`
   to `"lab-6-alt"` **before** `npm install`: npm refuses two workspaces with
   the same name (checked).
2. Replace React Hook Form with another form library: Formik, TanStack Form,
   React Final Form or another one. Zod may stay or be replaced too (Yup,
   Valibot, Joi…). In the root: `npm uninstall react-hook-form
   @hookform/resolvers -w lab-6-alt`, then `npm install <бібліотеки> -w
   lab-6-alt`.
3. Rewrite `BookingForm` (and the schema, if replaced) so the page behaves as
   `lab-6` after §4.6: the same rules and messages, `aria-invalid` and
   `aria-describedby`, focus on the first invalid field, «Надсилаємо…»,
   the server's reply, clearing after success, «Очистити». `api.js` checks
   the data with this version's schema. `SubscribeForm`, if done, stays as
   it is.
4. In `lab-6-alt/README.md`, a section «Порівняння з React Hook Form і Zod»:
   the libraries and their versions; a table of what replaced `register`,
   `Controller`, `useWatch`, `zodResolver` and `reset`; the JS bundle size
   that `npm run build` prints for both versions; what renders while typing
   in «Ім'я» in both (**Highlight updates**); the date of each library's last
   release on npm; and 3–5 sentences on which pair you would choose and why.
5. `npm run lint` (no warnings), `format:check`, `build`; a Vercel project
   `react-lab-6-alt` with Root Directory `lab-6-alt`.

Commits: `chore: copy lab 6 for the alternative version`, then `feat: …`
commits named after the work (for example `feat: rebuild the booking form
with Formik and Yup`), and `docs: compare the form libraries`. The handout
notes that Formik's last release, 2.4.9, is from November 2025: it's
allowed, and the README records it.

### §5. Вимоги до звіту

Subject `[React] ЛР-6: складні форми та валідація`, with ЛР-5's two lines for
`lab-6`. The report contains:

1. a screenshot of the form after an empty submit, with the messages and the
   cursor in «Ім'я»;
2. a screenshot of the server's reply for 19:00, with the values still in the
   fields;
3. a screenshot of `npm run lint`, `npm run format:check` and `npm run build`
   passing;
4. whether §4.7 was done;
5. whether §4.8 was done: the libraries chosen and the `lab-6-alt` address
   on Vercel (the comparison itself is in its README);
6. whether an AI agent was used, and for what;
7. a short conclusion: what was done and what was hard.

The report for the main part may go before §4.8 is finished; then §4.8's
address follows in a reply to the same email before the defence.

### §6. Усний захист

ЛР-5's intro sentence, then grouped interview questions, each answerable from
the lab and its readings:

- **«Валідація на клієнті й на сервері»**: why both, what the client can't
  check, why one schema, what happens if the resolver is removed.
- **«Нативна валідація і бібліотеки»**: which rules HTML could express, what
  `noValidate` changes, why `required` stays, when the browser is enough.
- **«Zod»**: a schema, `parse` against `safeParse`, `refine` against
  `regex`, `coerce`, an object-level rule and `path`, custom messages.
- **«React Hook Form»**: `register` and uncontrolled fields, what renders
  while typing, `Controller` and controlled components (ЛР-5 §4.6),
  `useWatch` against `watch` and the ESLint warning, validation modes,
  `handleSubmit`, `defaultValues`, `reset` and `setFocus`, `deps`, why
  «Очистити» is no longer a `type="reset"` button.
- **«Actions у React 19»**: what an Action is, what `useActionState` returns,
  why `startTransition` (twice), the queue and repeated clicks, what happens
  when «Очистити» is pressed while a booking is being sent, why there's no
  reset and how the lab makes one, `onSubmit` against `<form action>`.
- **«Доступність форми»**: `aria-invalid`, `aria-describedby`, why the message
  isn't inside the `<label>`, focus on the first error, `role="status"`
  against `role="alert"`, `aria-disabled` while pending.
- **«Форма без бібліотек»** (only for students who did §4.7): `useFormStatus`
  and why a child component, the automatic reset after an action, how
  `defaultValue` brings a value back.
- **«Інші інструменти»** (only for students who did §4.8): why these
  libraries, what replaced each React Hook Form API, controlled against
  uncontrolled state in the chosen library and what it means for renders,
  what had to change in the schema, the bundle sizes, a library's
  maintenance status as a selection criterion.

The handout's §6 will be the full list (ЛР-5 has about 40); the answers go in
`solution/README.md`.

### §7. Критерії готовності

As in ЛР-4: «Основна частина (§4.1–4.6) оцінюється в 1 бал після захисту
(§6). §4.7 і §4.8 — ще по 1 балу, теж після захисту. Це додаткові бали понад
65 балів за поточну роботу.» Three tables.

**1 бал: §4.1–4.6**

| Критерій | Мінімальна вимога |
| --- | --- |
| Проєкт | `lab-6/` у `react-labs`; у теці `npm run lint` проходить без помилок і попереджень, `format:check` і `build` — без помилок |
| Схема | усі правила форми — у `bookingSchema.js`, з повідомленнями українською; ту саму схему використовують форма й `api.js` |
| React Hook Form | поля через `register`, без `useState` для їхніх значень; `GuestsStepper` через `Controller`; лічильник через `useWatch` |
| Помилки | `noValidate`; повідомлення під полями з `aria-invalid` і `aria-describedby`; після порожнього надсилання курсор у першому неправильному полі; повідомлення про минулий час зникає після зміни дати |
| Надсилання | `useActionState` і `startTransition`; «Надсилаємо…» під час очікування; натискання під час «Надсилаємо…» не надсилає вдруге; після відмови значення лишаються, після успіху форма очищається, а підтвердження лишається |
| Очищення | «Очистити» очищає поля, повідомлення про помилки й відповідь сервера; курсор у полі «Ім'я» |
| GitHub | коміти з §4.6 |
| На занятті | усі коміти §4.1–4.6 відправлено на занятті (час `git push` видно в **Activity**) |
| Vercel | проєкт з Root Directory `lab-6`; адреса показує сторінку з останнього коміту `main` |
| Звіт | усі пункти §5 |

**+1 бал: §4.7**

| Критерій | Мінімальна вимога |
| --- | --- |
| Форма | `SubscribeForm` з `<form action>`; дія отримує `FormData` і перевіряє адресу через `z.email()` |
| Очікування | `SubmitButton` — окремий компонент із `useFormStatus`; «Підписуємо…» під час очікування |
| Значення | неправильна адреса лишається в полі після відповіді; після успішної підписки поле порожнє |
| На занятті | коміт §4.7 відправлено на занятті; Vercel показує останній коміт |

**+1 бал: §4.8**

| Критерій | Мінімальна вимога |
| --- | --- |
| Версія | `lab-6-alt/` у `react-labs` з власною назвою в `package.json`; React Hook Form замінено іншою бібліотекою форм; `npm run lint` без помилок і попереджень, `format:check` і `build` — без помилок |
| Поведінка | така сама, як у `lab-6` після §4.6: правила й повідомлення, ARIA, фокус на першій помилці, «Надсилаємо…», відповідь сервера, очищення після успіху, «Очистити» |
| Сервер | `api.js` перевіряє дані схемою цієї версії |
| Порівняння | розділ у `lab-6-alt/README.md`: таблиця відповідників, розміри збірки, рендери під час введення, дати останніх релізів, висновок |
| Vercel | проєкт з Root Directory `lab-6-alt` |
| Термін | коміти §4.8 відправлено до захисту ЛР-6 |

## Files to create or change

- `starters/react/lab-6/` (above);
- `public/uk/react/starters/lab-6.zip`: built by `build-pack.py` after the
  starter's commit, in its own commit, as for ЛР-2–5;
- `src/content/labs/react/uk/lab-6.md`: the handout;
- `public/uk/react/labs/lab-6/result.webp` (§1): taken from the reference
  solution in headless Edge;
- `public/uk/react/labs/lab-6.pdf`: `python docs/web/build-handout.py lab-6
  react`, run from PowerShell, after the instructor has reviewed the handout;
- `docs/react/lab-6/solution/` (gitignored; add it to `.gitignore` next to
  ЛР-5's): overlays of the starter's `src/` after §4.2, §4.3, §4.4, §4.5 and
  §4.7; a reference §4.8 version (Formik + Yup) with its filled-in
  comparison; a `README.md` with what renders when at each step, the measured
  behaviour, the pitfalls §4.8 runs into, and the defence answers; a
  `shots.mjs` that checks every stage and takes the screenshot;
- `docs/react/lab-6/README.md`: the lasting facts and what was verified, with
  no answers;
- `docs/react/course-plan.md`: a ЛР 6 row in **How the site maps to the
  plan**, `ЛР 7–27` in the «not built» row, the date in the paragraph above
  the table, and the extra-points note: today it describes ЛР-4's single
  extra point, so it becomes one note for both labs (ЛР-4 +1, ЛР-6 +2; Part 1
  up to 9 points; current work up to 68);
- `README.md` (root): a `lab-6/` line in the `starters/react/` tree.

Work on a new branch from `main`, `feat/react-lab-6`.

## Verification

**Checked while writing this plan (2026-11-12),** on a prototype in a
`react-labs` workspace with ЛР-5's starter tooling, on Windows 11 with
Node.js 24.20 and npm 11.19 (React 19.3.1, Vite 8.3.8, ESLint 10.14,
`eslint-plugin-react-hooks` 7.1.1, Prettier 3.9.10) plus React Hook Form
7.92.0, Zod 4.6.7 and `@hookform/resolvers` 7.0.6:

- current versions on npm: React Hook Form 7.92.0 (8.0.0-beta.5 exists),
  Zod 4.6.7, `@hookform/resolvers` 7.0.6, whose peer ranges accept Zod 4
  and React Hook Form ≥ 7.55;
- the code in **The app: what changes** passes Prettier, ESLint with no
  problems, and the build; `watch('comment')` raises
  `react-hooks/incompatible-library`, `useWatch` doesn't;
- Zod: the object-level `refine` with `path` runs alongside field errors;
  `z.coerce.number()`; `z.locales.uk()` and the wording of its messages;
- in headless Edge on the Vite dev server, with that code:
  - an empty submit shows the four messages, sets `aria-invalid` and focuses
    «Ім'я»; 22:00 gets the hours message on blur;
  - `deps: 'time'`: the past-time message goes when the date changes, and
    stays without `deps`;
  - «Надсилаємо…» with `aria-disabled` while pending; a second click 300 ms
    into the pending state sends no second request; 19:00 gets the server's
    message with the values kept;
  - a successful booking clears the fields, the guests and the counter,
    keeps the confirmation (with the trimmed name) and logs nothing;
  - «Очистити» clears the reply and focuses «Ім'я»; its behaviour while a
    booking is pending is recorded for the defence;
  - `Ctrl+Enter` from ЛР-5 still submits through `handleSubmit`; the
    stepper's value reaches the confirmation through `Controller`;
  - dispatching without `startTransition` logs React's error and shows no
    pending state;
- `setFocus('name'); reset()` puts focus in «Ім'я»; the other order was
  checked too (recorded in `solution/README.md`);
- React Hook Form's `reset()` with no values calls `form.reset()`
  (`react-hook-form` 7.92.0's source); with `onReset={handleReset}` on the
  form, a successful booking ran `handleReset` and lost the confirmation;
- `<form action>`: React clears the uncontrolled email field after the
  action, also when the action returns an error; returning the value and
  `defaultValue={state?.email}` keeps it; `useFormStatus` shows the pending
  label;
- `await import('/src/bookingSchema.js')` in the DevTools console on the Vite
  dev server returns the schema, and `safeParse` lists the issues;
- §4.8's ground: a copied workspace with the same `"name"` makes `npm
  install` fail («package 'lab-6' has conflicts»), and renaming it fixes
  that; Formik 2.4.9 with Yup 1.7.1 runs on React 19.3.1 in StrictMode with
  no console warnings and passes ESLint; Formik + Yup has a behaviour
  difference from the Zod schema that §4.8 students will meet (recorded in
  `solution/README.md`); current versions: Formik 2.4.9 (last published
  2025-11-10), Yup 1.7.1, TanStack Form 1.33.5, React Final Form 7.0.1,
  Valibot 1.5.0;
- the readings' languages, and the anchors named under **The readings**.

**To check during the build:**

- every stage (the starter, §4.2, §4.3, §4.4, §4.5, §4.7) passes `npm run
  lint` with no problems, `format:check` and `build`;
- the cross-field rule near midnight and in a UTC+2 browser (`today()` and
  `nowTime()` are local);
- **React DevTools 8**, using ЛР-2's recipe: what `BookingForm` shows at each
  stage, for §4.3's «Що має вийти» (recorded in `solution/README.md`);
- what renders while typing at §4.3 and §4.4, for the defence (recorded in
  `solution/README.md`, not here);
- a screen reader (NVDA or Narrator, if at hand): the message read with the
  focused field after a submit, and the server's reply in `role="status"`;
- the Zod, W3C and MDN anchors and paths;
- **the reference §4.8 version** (Formik + Yup) meets §7's §4.8 table, and
  its comparison numbers fill `solution/README.md`;
- **timed dry run:** follow the handout as a student, without AI: §4.1–4.6 in
  30 minutes or less, otherwise apply the cuts under **Timing**; §4.7 in
  about 8 more;
- the zip stores LF and passes `format:check` after unpacking; `npm install`
  in the root adds the `lab-6` workspace and the three packages;
- Vercel: a sixth project from the same repository builds with Root Directory
  `lab-6`;
- `npm run check && npm run build` for the site; no horizontal scroll at
  390 px; the labs index lists ЛР-6.

## Decisions

**Settled by the instructor on 2026-11-12:**

1. **Continue ЛР-5's form** rather than a new app (see **ЛР-5's form or a new
   app**). The starter is ЛР-5's finished code plus a phone field, error
   placeholders, a fake server and the date helpers.
2. **A very fast double click is left as it is.** The `isPending` guard and
   `aria-disabled` cover clicks once «Надсилаємо…» is on screen. Two clicks
   close together may still reach the server twice, because the resolver
   validates asynchronously before the pending state renders. No extra ref,
   and no `disabled` with its focus loss.
3. **§4.7 is a +1 task,** done in class after §4.6 is pushed, as ЛР-4's +1
   was: `<form action>`, `useFormStatus` and Zod inside the action.
4. **The form clears after a successful booking,** with `reset()` inside
   `startTransition` after the `await`, and «Очистити» as a plain button (see
   **Clearing the form after a successful booking**).
5. **The libraries are React Hook Form and Zod,** with `@hookform/resolvers`
   for `zodResolver`, listed in the starter's `package.json`, so one `npm
   install` in the root installs them.
6. **§4.8 is a homework +1:** a separate version with other tools, in its own
   folder and Vercel project, with a short comparison.

**Proposed, for the instructor to confirm or change:**

7. **The extra points follow ЛР-4's rule:** bonus points above the 65 for
   current work, each given after the defence. With both, ЛР-6 can give 3
   points.
8. **§4.8 must replace React Hook Form;** replacing Zod is optional. Swapping
   only Zod for Yup is about 20 lines through `yupResolver`, too little for a
   point. The alternative is to accept any one replaced library.
9. **§4.8's deadline is the ЛР-6 defence,** and its AI rule is the lab's: the
   code is the student's, AI completions may stay on, agents are not
   recommended, and the defence group «Інші інструменти» checks it.
10. **`mode: 'onTouched'`:** no messages while the user is still typing for
    the first time, then live feedback once a field has been visited.
11. **React Hook Form 7, not 8 beta; Zod 4; `@hookform/resolvers` 7.**
    Re-check the versions before the build.
12. **No README table this time.** ЛР-5's «who owns each value» table becomes
    defence questions about `register`, `Controller` and `useWatch`, and
    §4.8's comparison covers renders.
13. **The phone format is strict: `+380` and nine digits,** with the format in
    the placeholder and the message. Accepting spaces would need a
    `transform` before the `regex`: more Zod, more time.
14. **AI and deadline for the main part as in ЛР-5:** code by hand, AI
    completions may stay on, agents not recommended; no deadline, since
    every in-class task is checked by push times on GitHub **Activity**.
15. **Out of scope:** dynamic fields (`useFieldArray`), `useOptimistic`,
    multi-step forms, and `z.infer` types (TypeScript is ЛР 19).

# Frontend plan: ЛР-14 «Проміжний контроль №2»

Status: plan, 2026-10-20, revised after a design review. Nothing is built.

- **Read first:** [control-2-plan.md](control-2-plan.md). It holds the
  decisions, the six-step flow, the 24 tasks and the schedule.
- **The API this page calls:** [backend-plan.md → API](backend-plan.md#api).

## Scope

This plan covers everything in this site's `src/`:

- the student page: identity, rules, cards, confirmation, result;
- the lockdown and its event log;
- the instructor's dashboard;
- the demo mode;
- the handout, `lab-14.md`.

**Addresses.** The site is served under the `/web-development-2026` base, so
the full addresses are:

- **the student page:**
  `https://denysmatsevych.github.io/web-development-2026/web-development/labs/lab-14/quiz/`.
  This exact address goes on the slips.
- **the dashboard:** the same address plus `teacher/`.

Links inside the site go through `withBase()`.

The page grades nothing and holds no keys, names or codes. Everything it
shows about tasks and students comes from the API.

## Student page

### Identity screen

This screen comes before fullscreen.

1. **«Група»:** a select with КН-311, КН-312 and КН-313, from `GET /tests/pk-2`.
   When the server refuses a group's list, the page shows «Контроль для групи
   не відкрито». After «Закрити», the list is still served while the group
   has attempts in progress, so its students can resume.
2. **«Студент»:** a select of «Прізвище Ім'я», loaded with
   `GET /tests/pk-2/groups/:group/students` once a group is chosen. The server
   answers only while that group is open.
3. **«Персональний код»:** 6 digits from the slip, with `inputmode="numeric"`
   and `autocomplete="off"`.
4. **Errors** sit next to their field, and focus moves to the first one:
   - «Код не підходить»;
   - «Забагато спроб — зверніться до викладача», when the server has locked the
     code;
   - «Немає зв'язку з сервером», when `start` gets no answer.

   The code is checked by `start`, which runs on «Почати» (see **Rules
   screen**). On an error, the page comes back here, out of fullscreen.

Before «Почати», the page also:

- **detects the device** and fills `device: {label, mode, userAgent, screens}`
  for `start` (see **Lockdown**);
- **refuses Firefox and Safari on a laptop:** «Відкрийте сторінку в Chrome або
  Edge».

### Rules screen

The rules screen lists:

- 24 tasks, 0.5 points each, and 30 minutes;
- one attempt; the code reopens it on any device;
- fullscreen, and «Завершити» in the header as the only way out besides the
  timer;
- **what is logged**, the list of labels from **Lockdown**.

«Почати» then:

1. disables itself until the answer comes, so a double click sends one
   `start`;
2. calls `requestFullscreen()` at once, because it needs the click's user
   gesture;
3. calls `navigator.keyboard.lock()`;
4. calls `POST /tests/pk-2/start` with the browser's `clientId` (see
   **Saving, the timer, reopening**);
5. **on success,** starts the lockdown's event log and renders the first card,
   or the last one seen on a resume;
6. **on any error** (a wrong or locked code, a closed group, no connection):
   unlocks the keyboard, leaves fullscreen and returns to the identity screen,
   with the error beside its field. Nothing is logged, because no attempt
   exists yet.

### Cards

```text
┌───────────────────────────────────────────────────────────────────────┐
│ ПК-2 Іваненко Олена · КН-313  Завдання 19 з 24  ⏱ 11:20   [Завершити] │
├───────────────────────────────────────────────────────────────────────┤
│  Код · Debugging, event loop                                          │
│                                                                       │
│  У якому порядку з'являться повідомлення?                             │
│  ┌──────────────────────────────────────────────┐                     │
│  │ 1  console.log('A');                         │                     │
│  │ 2  setTimeout(() => console.log('B'));       │                     │
│  │ 3  Promise.resolve().then(() => console.log('C'));                 │
│  │ 4  console.log('D');                         │                     │
│  └──────────────────────────────────────────────┘                     │
│  ( ) A B C D     ( ) A D B C     ( ) A D C B     ( ) A C D B          │
├───────────────────────────────────────────────────────────────────────┤
│ ← Назад      Пропустити      ■■■■■■■■□■■■■■■■■■◉□□□□□          Далі → │
└───────────────────────────────────────────────────────────────────────┘
```

Examples in these plans are public, so none of them goes into the pool.

- **Header:**
  - the test;
  - the full name and group from the roster, so the instructor can match the
    face to the name;
  - «Завдання N з 24»;
  - the timer;
  - **«Завершити»**, alone at the right end.
- **Bottom bar:** navigation only.
  - «Назад»;
  - «Пропустити», which moves on and marks the task as skipped;
  - «Далі»;
  - the map. Its states are answered, skipped, not yet seen and current, and
    any task can be reopened from it. On narrow screens, the map opens in a
    `<dialog>`.
- **Body:** the pool and the kind, then the task's HTML as the API sends it
  (already rendered, with Shiki-highlighted code and line numbers).
- **Inputs:** the four kinds need two controls.
  - **Radio:** test, order, bug. Full-width labels wrap real radios, in a
    `fieldset` whose `legend` is the task.
  - **Short text:** output. A single-line field with the task's stated format
    as its hint, and `autocapitalize="off"`, `autocorrect="off"`,
    `spellcheck="false"` and `autocomplete="off"`. A phone keyboard would
    otherwise capitalise the first letter, and output is compared
    case-sensitively. The server also normalises typographic quotes
    ([backend-plan.md → Server rules](backend-plan.md#server-rules)).

### Finishing

- **«Завершити»** opens a confirmation dialog that lists the unanswered and
  skipped tasks as links. Its default button is «Повернутися до завдань»; the
  other is «Завершити контроль».
- **When all 24 are answered,** the header button turns primary, and the last
  card says «Усі відповіді надано — натисніть «Завершити» вгорі».
- **When the timer reaches 0,** the page calls `finish` with
  `reason: timeout`. The server finishes the attempt in any case, once the
  grace period has passed. It refuses a `timeout` that arrives before the
  deadline by its own clock and returns the deadline; the page then corrects
  its countdown and carries on.

### Result screen

The page leaves fullscreen, unlocks the keyboard and shows:

> **Бали: 9,5 з 12 · Оцінка: 10 · Правильно: 19 з 24**
> Результат надіслано викладачу.

It doesn't show which tasks were right, because the pool must stay usable for
the other groups and the credit test.

### Saving, the timer, reopening

- **Answers:** every change goes to `PUT /attempts/:id/answers/:qid` at once.
  While offline, changes queue in `localStorage` under `quiz:<lab>`, with the
  attempt id but **not the token**, and are sent in order on reconnect. A
  replay always uses the current token. That key stays distinct from
  `course-theme` and `deck-theme`.
- **The browser's id:** a random `clientId`, made once and kept in
  `localStorage` under `quiz:client`, goes with every `start`. The server
  gives the same browser the same token back, so a reload or a double click
  never signs the page out, and the queue still replays after a reload.
- **Timer:** it counts down to the server's deadline on `performance.now()`,
  not on the device's clock. `start` and every heartbeat return `deadline`
  and `serverTime`, and the page re-anchors the countdown on
  `deadline − serverTime` each time. A device clock that runs fast, or jumps
  after sleep, can't end the test early.
- **Reopening:** the same group, name and code, on this or any other device,
  calls `start` again. It returns the same tasks and the saved answers, and
  the page resumes on the last card. This also works after «Закрити».
- **A stale token** (401) means the attempt was opened in another browser or
  on another device. The page shows «Контроль відкрито на іншому пристрої»
  and stops.

### States

```text
loading → unsupported | closed → identity ⇄ rules → test ⇄ overlay (out of fullscreen or hidden) → confirm → result
```

## Lockdown on students' own devices

**Device support.** The page detects it, sends it with `start`, and the
dashboard shows it:

| Device and browser | Fullscreen | Keyboard lock | Mode |
| --- | --- | --- | --- |
| Windows, macOS or Linux laptop, Chrome or Edge | yes | yes | **full** (required) |
| Laptop, Firefox or Safari | yes | no | asked to switch to Chrome or Edge |
| Android phone or tablet, Chrome | yes | no | **limited**, flagged |
| iPhone | no (Safari has no element fullscreen) | no | **limited**, flagged |

**The device label** comes from User-Agent Client Hints where the browser has
them (Chrome, Edge), and from the User-Agent string otherwise. Examples:
«Windows · Chrome 141», «Android · Chrome 141». `screen.isExtended`
(Chromium) gives the number of screens.

**Measures in full mode.** Every row is logged, whether the page can block
the action or not.

- **Where the browser takes a key before the page sees it,** the page logs
  what follows instead: the page hidden, fullscreen lost, the close prompt.
- **This table is the event catalog.** Its labels are exactly what the
  dashboard's «Порушення» column shows. In code it lives in
  `src/lib/quiz-contract.ts`, so the page and the Worker share one list.

| Action | Blocked? | Logged as |
| --- | --- | --- |
| A tap of Esc, outside a dialog | yes (keyboard lock) | «Натиснуто Esc» |
| Holding Esc for 2 s, leaving fullscreen | no: the browser guarantees this way out | «Вихід з повноекранного режиму» |
| Alt+Tab or Cmd+Tab, Win, Alt+F4 | yes (keyboard lock), where the OS allows | «Системна комбінація: Alt+Tab» (etc.) |
| PrtScn | yes (keyboard lock) | «Знімок екрана (PrtScn)» |
| Ctrl+Alt+Del, Win+L | no: reserved by the OS | «Сторінку приховано, N с» (from `visibilitychange`) |
| F12, Ctrl+Shift+I/J/C | yes (`preventDefault`) | «Спроба відкрити DevTools (F12)» |
| Ctrl+U | yes | «Перегляд коду сторінки (Ctrl+U)» |
| Right click | yes (the context menu, with «Inspect», is off) | «Права кнопка миші» |
| Selecting text | yes (`user-select: none`, `selectstart`) | «Спроба виділити текст» |
| Ctrl+A / Ctrl+C / Ctrl+X outside the answer field | yes | «Спроба копіювання» |
| Pasting into the answer field | yes | «Спроба вставити текст» |
| Dragging text or an image | yes | «Перетягування» |
| Ctrl+P | yes, with `beforeprint` as a backstop | «Спроба друку» |
| Ctrl+S, Ctrl+F, Ctrl+G | yes | «Заборонена комбінація: Ctrl+F» (etc.) |
| F5, Ctrl+R | yes | «Спроба перезавантажити сторінку» |
| Ctrl+W, Ctrl+T, Ctrl+N | where Chromium passes them to the page (checked in the dry run) | the key if the page sees it; otherwise «Спроба закрити сторінку» (`beforeunload`) or «Сторінку приховано, N с» |
| Alt+←, the mouse's back button | yes (`popstate` guard) | «Спроба повернутися назад» |
| Switching to another window or app | — | «Фокус на іншому вікні, N с» (`blur`/`focus`) and «Сторінку приховано, N с» |
| A second monitor | — | «Підключено кілька моніторів», at start |
| The same code opened on another device | the old tab is signed out | «Продовжено на іншому пристрої» (recorded by the server) |

- **Inside the answer field,** typing keys work normally (Ctrl+A, Backspace,
  the arrows); only pasting is blocked there.
- **The overlay.** When fullscreen is lost or the page is hidden, the card is
  hidden behind «Контроль призупинено — поверніться до повноекранного режиму»
  and the test is `inert`. «Повернутися» re-enters fullscreen and re-locks
  the keyboard. The timer keeps running.
- **Severity:**
  - **Red:** leaving fullscreen; a hidden page or another window for more
    than 2 s; DevTools keys; pasting; another device.
  - **Amber:** everything else.
  - **Grey, not a violation:** a lost connection, which the dashboard derives
    from missed heartbeats.
- **How events travel:**
  - **Content:** each event has a type, a time, a severity and a detail (the
    key, the duration).
  - **Timing:** red events go to `POST /attempts/:id/events` at once. Amber
    ones ride on the next heartbeat, every 15 s.
  - **Merging:** repeats of one event within 2 s merge into one with a count,
    so a held key doesn't flood the log.
  - **When:** the page logs from a successful `start` to the result screen.
- **Limited mode** (phones) has no key capture. It logs leaving fullscreen
  (Android), the page hidden and the window losing focus, under the same
  labels.
- **What leaves no trace:** a second device, a photo of the screen, a
  screen-sharing app started before the test. Those are left to supervision,
  and the logs show the instructor where to look.

**Still to check on real devices** (in **Verification**):

- which of Ctrl+W, Ctrl+T and Ctrl+N Chromium hands to the page under
  keyboard lock;
- Cmd+Tab capture on macOS.

## Instructor dashboard

- **Access:** a static page with nothing secret in it, not linked, marked
  `noindex`. `BaseLayout` has no `noindex` prop, so the page adds
  `<meta name="robots" content="noindex">` through `BaseLayout`'s `head`
  slot. A password goes to `POST /teacher/login`, and the 12-hour token
  that comes back is kept in `sessionStorage` and sent as `Authorization:
  Bearer`.
- **Devices:** shows several groups at once (Thursday has two). On a phone,
  the table scrolls sideways; one card per student is P1.

**Before the class:** the slips come from the roster script's `slips.html`
([backend-plan.md → Roster and codes](backend-plan.md#roster-and-codes)),
printed from the instructor's laptop. The same file serves to read a code out
when a slip is lost. Two pieces wait for P1:

- **the readiness panel:** students per group, pool cells against the
  blueprint;
- **«Картки з кодами»:** the same slips as a print view of
  `GET /teacher/slips?group=`.

**At the start:** «Відкрити» for the group(s). «Закрити» stops new starts
only: attempts already started keep their own deadline, and their students
can still resume, on any device.

**During the class:** the live board, from `GET /teacher/board?groups=`
every 5 s.

```text
ПК-2 · КН-311 + КН-312 · відкрито                                              [Закрити]
Почали 28/30 · працюють 19 · завершили 9 · з порушеннями 3

 №  Студент       Група   Пристрій / браузер       Стан                Залишок  Порушення                                   Бали  Оцінка
 1  Іваненко О.   КН-311  Windows · Chrome 141     ✓ 09:41 «Завершити»   —      —                                           9,5   10
 2  Петренко А.   КН-311  macOS · Edge 141         … 14/24              17:05   ● Вихід з повноекранного режиму ×1           —     —
                                                                                 ● Спроба відкрити DevTools (F12) ×2
                                                                                 ○ Права кнопка миші ×3
 3  Коваль М.     КН-312  Android · Chrome 141 📱   … 6/24               21:40   ● Сторінку приховано ×1 (35 с)               —     —
 4  Шевченко Т.   КН-312  —                        — не почав             —      —                                           —     —
```

- **Rows:** journal order.
- **«Пристрій / браузер»:** the device label from `start`; 📱 marks limited
  mode, and «2 монітори» is appended when detected.
- **«Стан»:**
  - not started;
  - working: the card number, plus «немає зв'язку N с» when heartbeats stop;
  - finished: the time, and whether by «Завершити» or the timer.
- **«Порушення»:** the list of logged violations, one line per type, with its
  count and total hidden time.
  - **Labels:** those from the catalog in **Lockdown**.
  - **Order:** red (●) first, then amber (○).
  - **Highlight:** a row with a red violation gets a red edge, without
    flashing (WCAG 2.3.1). A sound is P1.
- **«Бали» and «Оцінка»** appear the moment the student finishes, and a
  «Результати» panel lists marks as they arrive. Moving a finished row to the
  top for 10 s is P1.
- **The row drawer:**
  - **P0:** the event timeline with times, and «Розблокувати код».
  - **P1:** the 24 tasks right or wrong, and +5 min.
**After the class:** «Копіювати оцінки» copies the marks as one column, in
journal order, to paste straight into the journal (from
`GET /teacher/marks`). CSV export is P1.

## Demo mode

`?demo` runs the whole flow, the lockdown and the event log included, on 4
public sample tasks.

- **No server:** `api.ts` swaps in an in-page backend that grades the samples,
  and nothing is recorded.
- **For students:** the handout links to it as the device check.
- **The connection check:** the demo also calls the real Worker's
  `GET /tests/pk-2` once and says whether it answered. So the device check
  also shows whether the student's network reaches `*.workers.dev`, which
  some antivirus and campus filters block, before the day of the test.
- **For reviewers:** it's how the page is reviewed in local dev without the
  Worker.

## Handout

`src/content/labs/web-development/uk/lab-14.md`: short, no PDF, no ТЗ, and no
`draft:` field.

- **Frontmatter:** `number: 14`; `title` and `summary`, which the content
  schema requires; `format: "Проміжний контроль"`.
- **Body:**
  - the format: 24 × 0.5, the rounding rule, the topics from the pool table;
  - the device requirements: a laptop with Chrome or Edge, charged, with
    mobile data as a backup;
  - the list of logged actions;
  - what to do if the connection drops or the laptop dies;
  - the demo link.

## Files, layout and accessibility

**Create:**

- `src/pages/web-development/labs/lab-14/quiz.astro` and
  `…/lab-14/quiz/teacher.astro`: two static routes, as the Lab 7 checker is.
  A registry with generated routes waits until a second quiz exists, such as
  the credit test.
- `src/scripts/quiz/`:
  - `config.ts`: the test id and the API URL, the local `wrangler dev` one
    when `import.meta.env.DEV`;
  - `engine.ts`: states, navigation, timer, answer queue;
  - `api.ts`: the Worker client and the demo backend;
  - `lockdown.ts`: fullscreen, keyboard lock, blocking, the event catalog,
    merging and sending, device detection;
  - `render.ts`: cards built from `<template>`s;
  - `teacher.ts`: the dashboard.

  No framework, like `deck.ts`.
- `src/content/labs/web-development/uk/lab-14.md`.

**Change:**

- `README.md`: the route table and the `src/` tree.
- `docs/agents/design-system.md`: a row for the quiz surface.

**Uses:** `src/lib/quiz-contract.ts`, owned by
[backend-plan.md](backend-plan.md#files).

**Layout and theme:** `BaseLayout` with `bodyClass="quiz-page"`, `lang="uk"`
and no header or footer; Tailwind on site tokens; the hub's `.dark`
mechanism. A `src/styles/quiz.css` scoped to `.quiz-page` only if utilities
fall short.

**Accessibility:**

- **Focus** moves to the card heading on every change, and a polite live
  region says «Завдання 7 з 24».
- **Timer:** `role="timer"`, announced at 10, 5 and 1 minutes left.
- **Dialogs** are native `<dialog>`s, so the focus stays inside them.
- **Zoom** stays allowed (WCAG 1.4.4), and there's no motion under
  `prefers-reduced-motion`.
- **Sizes:** a 12-line code block fits at 1366×768. Works from 320 px.
- **Keys:** the lockdown never blocks Tab, Space, Enter or the arrows.

## Verification

- **Build:** `npm run check && npm run build`. The quiz routes exist only for
  `lab-14`.
- **Demo flow in local dev,** and the same flow against `wrangler dev`:
  - a skip, a return and a changed answer;
  - the confirmation and the result screen;
  - a reload in the middle, which keeps the token, and one while offline,
    whose queue replays on reconnect; the timeout;
  - a wrong code, which returns to the form out of fullscreen; a double click
    on «Почати»;
  - a resume on a second browser, which signs out the first; a resume after
    «Закрити».
- **Lockdown matrix,** on each device in the dry run. For each action,
  record whether the page or the browser handles it, and the exact label
  that appears in the dashboard's «Порушення» column:
  - **Esc:** a tap; a 2 s hold, which must give the overlay plus a red row;
  - **system keys:** Alt+Tab or Cmd+Tab, Win, Alt+F4, PrtScn;
  - **DevTools:** F12, Ctrl+Shift+I/J/C, Ctrl+U, the right click;
  - **browser keys:** Ctrl+P, Ctrl+S, F5, Ctrl+R, Ctrl+W/T/N, Alt+←, the
    mouse's back button;
  - **text:** selecting, Ctrl+A/C, pasting into an output answer;
  - **zoom:** must still work.

  The results go into `docs/web/lab-14/README.md`.
- **Dashboard:** the device column for each device in the dry run; the
  violation lines and their order; «Копіювати оцінки» pasted into a copy of
  the journal.
- **Accessibility:** keyboard only, and NVDA on the form and on each kind of
  card.
- **UI:** headless Edge screenshots of every state at 1366×768, 1920×1080 and
  375 px, in both themes.

## P0 and P1

- **P0, by Tuesday:**
  - the identity, rules, cards, confirmation and result screens;
  - the answer queue and the timer;
  - the full lockdown and event log;
  - the board with the device and violation columns, open and close,
    «Копіювати оцінки»;
  - the demo with its connection check, and the handout.
- **P1, after Wednesday:**
  - the task list and +5 min in the row drawer;
  - «Анулювати завдання»; CSV export;
  - the readiness panel, the slips' print view, the sound, moving finished
    rows to the top, and one card per student on a phone.

## References

- Keyboard Lock: [explainer](https://github.com/WICG/keyboard-lock/blob/gh-pages/explainer.md)
  (system keys, fullscreen only, the 2 s Esc hold),
  [Chrome guide](https://developer.chrome.com/blog/better-full-screen-mode),
  [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Keyboard/lock)

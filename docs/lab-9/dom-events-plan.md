# Plan: ЛР-9 «Створення інтерактивного DOM та обробка подій»

Status: built on 2026-10-08 on branch `feat/lab-9-dom-events`. Both Lab 8
branches had already merged, so the branch starts from `main` (step 1). Not yet
done, and both gate publishing: the prompt calibration in other agents
(step 4) and the timed dry run. Decision 2 is settled: Lab 9 and Lab 10 are
both due 19.10.2026. Decisions 1 and 3 are still open; the
build follows the recommended option for 1. Delete this file once the lab is
published. The facts that last are in this folder's `README.md`.

Deviations from the plan:

- `docs/build-pack.py` replaces only the Lab 8 and Lab 10 scripts. Lab 7's
  script stages `SPEC.md` and the mockup captures, so it stays. The shared
  script also writes LF line endings and dates each entry by its last commit,
  so a rebuild with no edits gives the same zip.
- C2's focus rule for «Лише мій список» moved to C3.7: the checkbox only
  exists after C3, so a C2 check could not pass at the end of C2.
- `check.html` loads every check through `srcdoc`, not a plain `src` iframe.
  That way it can count listeners, catch `alert()` and errors, and swap the
  data through an import map before the app's modules run.
- The handout is about 4,100 words, not 2,500 or fewer. After review, each
  experiment and challenge spells out its context, what to predict or build,
  what the starter already provides and how it is checked.
- Experiment 15: the browser does return focus to the opener only if it is
  still in the document. Without it, focus can sit on the button inside the
  closed dialog for a frame, then moves to `<body>`, so the handout points to
  the Live Expression instead of an immediate read.
- §4 and §5 asked for the same write-up: most experiments are a minimal repro
  of a rule that `check.html` then tests. After review, the experiments have
  no AI step or column. Their «Де це трапиться» questions are defence prep and
  aren't written up. The report has no per-subsection conclusions and no §4.5
  write-up.
- The audit is two commits per challenge, `Challenge N: AI draft` and
  `Challenge N: fixes`, and the defence walks through one finding in a fixes
  commit. Fix commits named by rule (`fix(C2): C2.4 …`) and a per-challenge
  report table were both tried and dropped: the first was too hard to grade,
  the second only repeated the commit and the defence.
- C4 and C5 are one challenge, C4.1–C4.12, with one prompt. That is the
  fallback the **Timing** paragraph names. The manual checklist keeps only the
  keyboard and visible focus, because the Accessibility and Event Listeners
  panes repeated existing checks.
- Review on 2026-10-09:
  - The checklist's lines are tagged C2–C4. Each challenge walks its own
    lines, and the final version gets one full pass for the report.
  - The draft commit is untouched except for the protected files, which the
    student restores if the agent edited them. A fixes commit waits for the
    earlier blocks too.
  - The probe now records timer callbacks that move focus, timers started in
    an event handler, and `fetch`/XHR URLs. The five focus checks fail on a
    deferred `focus()`, and C1.1 fails on loading `data/shows.json` directly.
    Other failures note a fetch or a deferred reaction as the likely cause.
    There are four new traps: fetch, `requestAnimationFrame` focus, a
    debounced search and `setTimeout` focus after saving.
  - The handout names Chrome or Edge, and splits the work into home
    (§4 before class; checklist, deploy and report after) and class (setup
    and the challenges).

## Context

From [../course-plan.md](../course-plan.md), row 2.3:

- **Тема:** «Створення інтерактивного DOM та обробка подій: Event Delegation,
  форми та доступність динамічного інтерфейсу»
- **Самостійна робота (3 год.):** analysing JavaScript code written by an AI;
  research into the DOM API, event delegation and focus management.
- **Читання:** Основна 1 (MDN), 3 (WCAG 2.2). Допоміжна 1 (Flanagan), 5 (ARIA
  APG), 7 (WHATWG HTML), 13 (MDN JavaScript Guide).
- **Position:** after ЛР-8 (pure functions, no DOM). Before Лекція 6 and
  ЛР-10 (debugging, which has a DOM scenario).

**The students** are the same as in ЛР-8: 3rd-year Computer Science students
who already program in other languages. Their only DOM code so far is ЛР-7's
mobile menu. ЛР-8 covered coercion, closures, references and modules, but only
in Node, with no DOM.

**Timeline as of 2026-10-08:**

- ЛР-8 is due 09.10.2026 and ЛР-10 is due 16.10.2026.
- Neither is on `main` yet. The rename branch and `feat/lab-8-js-basics`,
  which is stacked on it, are both unmerged.

## Design principles

1. **ЛР-8 wrote the logic; ЛР-9 writes the DOM layer.** The starter provides
   a pure state module, so the lab covers only DOM, events, forms and focus.
   It doesn't need the student's ЛР-8 code, so a student who hasn't finished
   ЛР-8 can still do ЛР-9.
2. **The AI writes a draft; the student owns the result.** The programme's
   self-study names "аналіз JavaScript-коду, створеного AI". Each challenge
   works like this:
   - The AI agent writes a draft from a short prompt given in the handout.
   - The student commits the draft unchanged.
   - The student checks it against the brief and fixes it by hand.

   ЛР-6 Challenge 9 is the precedent. The prompts are deliberately short, like
   a ticket written in a hurry. They don't mention the keyboard, focus,
   delegation or escaping. So the draft shows what an AI does by default, and
   the brief is what the draft is measured against. Decision 1 gives the
   alternative.
3. **Checks test behaviour, not structure.** A self-check page runs the app in
   the browser and tests what a user or assistive technology would get. As
   with ЛР-8's tests, each check tests one rule from the brief. The checks
   never read the source, so students can structure the code however they
   like.
4. **A real browser, no tooling.** There's no npm install and no jsdom.
   `<dialog>`, focus and implicit form submission are exactly what jsdom gets
   wrong or leaves out.
5. **Still no Event Loop.** The students' code has no timers, Promises or
   `fetch`. The data comes from a JSON module import, as in ЛР-8. Filtering
   runs on every `input` event; 30 records need no debounce.
6. **Not Courtly, and no fixes for ЛР-10.** ЛР-9 teaches mechanisms that
   ЛР-10's DOM scenario relies on. That order is intended: learn the mechanism
   in your own code first, then find it in unfamiliar code.
   - No brief rule or check may describe a ЛР-10 defect in Courtly's terms.
     Before shipping, check the brief and the check names against the local
     defect map.
   - ЛР-10 §4.3 already teaches the DevTools DOM tools (Elements, `$0`,
     `getEventListeners`, the Event Listeners tab). ЛР-9 teaches DOM and event
     semantics, and uses those tools only to collect evidence.

## Topics and where each is taught

| Topic | Research (§4) | Practice (§5) |
| --- | --- | --- |
| `querySelector*`, live vs static collections, `dataset` values are strings | 4.1 | C1, C2 |
| `textContent` vs `innerHTML`, escaping, `<template>` cloning, `replaceChildren` | 4.1 | C1, C5 |
| Capturing and bubbling, `target` vs `currentTarget`, `closest()`, `this` in handlers | 4.2 | C2 |
| Event delegation; a listener belongs to a node; duplicate registration | 4.2 | C2 |
| A native `<button>` vs a clickable `<div>`; keyboard activation | 4.2, 4.4 | C2 |
| `submit` vs `click`, implicit submission, `preventDefault`, `FormData`, `input` vs `change`, `reset` | 4.3 | C3 |
| `valueAsNumber`, the Constraint Validation API, `setCustomValidity` | 4.3 | C5 |
| `focus()`, `tabindex` `-1` vs `0`, removing the focused element | 4.4 | C2, C5 |
| Live regions, `aria-pressed`, `aria-invalid`, `aria-describedby` | 4.4 | C1, C2, C5 |
| `<dialog>` with `showModal()`, `inert`, Esc, returning focus | 4.4 | C4 |
| What AI drafts of DOM code get wrong by default | 4.5 | every challenge |

## The app: Watchlist («Мій список»)

A one-page catalogue of the same 30 TVmaze shows as in ЛР-8:

- **A filter form:** search by name, a genre `<select>`, a «Лише мій список»
  checkbox and a «Скинути» button.
- **A status line:** «Знайдено: 12 з 30», then messages after actions.
- **Cards:** name, year, genres and rating, plus the student's own rating and
  note once saved. Each card has two buttons: «До списку» (a toggle) and
  «Детальніше».
- **A header counter:** «У списку: N».
- **A details dialog:** the show's summary, a link to its TVmaze page, and a
  form with «Моя оцінка» (an integer 1–10, required), «Нотатка» (up to 140
  characters, optional), «Зберегти» and «Скасувати».

State lives in memory, so reloading the page resets it.

## Starter: `watchlist-starter/`

```text
watchlist-starter/
  README.md          (uk) how to run the app and the check, deployment, data licence
  index.html         all static markup, complete and accessible: form, status region,
                     list, <template id="show-card">, <dialog> with the note form
  styles.css         complete, including :focus-visible, [aria-pressed="true"],
                     [aria-invalid="true"] and a visually-hidden class
  data/shows.json    the dataset (see Dataset)
  src/state.js       provided and pure: shows, watchlist (Set), notes (Map),
                     visibleShows(filters), toggle(id), saveNote(id, note)
  src/main.js        entry point: imports the modules below
  src/render.js      C1 ┐
  src/list.js        C2 │ a suggested split: empty functions with JSDoc that says
  src/filters.js     C3 │ what each one is for, so the page loads without errors
  src/details.js     C4–C5 ┘ and every check fails
  check.html, check/ the self-check (see below)
  experiments.html   fixture markup for the §4 experiments
```

- **The template fixes the DOM contract** that the checks rely on: each card is
  an `<li data-id>`, and its buttons have `data-action="toggle"` and
  `data-action="details"`. The toggle button holds an `<svg aria-hidden="true">`
  icon, so a click on the icon has a different `target`. If a draft ignores
  the template, that's a finding in its own right.
- **The static shell has no accessibility problems of its own**, so every
  finding comes from the JavaScript.
- **Name.** The site's `tsconfig.json` already excludes the `*-starter`
  pattern.

## Challenges: draft specs

The final specs go in the brief, `src/content/tasks/lab-9.md`, with rule
numbers (C2.3 and so on) that match the check labels. The prompts below are
drafts for the handout.

| # | Prompt for the AI draft | Rules the brief adds, each with a check |
| --- | --- | --- |
| C1 | «Покажи серіали з data/shows.json у списку #results: назва, рік, жанри, оцінка, кнопки «До списку» і «Детальніше».» | Cards come from `#show-card`. Data reaches the DOM only through `textContent` and attributes. «Da Vinci's Demons» shows its full name, and its buttons work. A missing rating shows «—». Each button's name includes the show's name. The status region is in the HTML from the start and only its text changes. An empty result shows «Нічого не знайдено». |
| C2 | «Зроби, щоб «До списку» додавав серіал у мій список, а «Детальніше» відкривав опис.» | One `click` listener on the list, none on the cards. A click on the icon works. Buttons still work after a re-render, including on a card added later. One click toggles exactly once, however many re-renders came before. `aria-pressed` and the counter follow the state. With «Лише мій список» on, removing a show moves focus to the next card's toggle, or the previous one, or the list heading. |
| C3 | «Додай фільтрацію за назвою і жанром і перемикач «лише мій список».» | Filters apply on `input` and `change`. Enter doesn't reload the page. Focus stays in the field while typing. The status updates after every change. «Скинути» restores the full list and the status. Toggle state survives filtering. |
| C4 | «Зроби діалог «Детальніше» з описом серіалу.» | `<dialog>` opened with `showModal()`. Its heading is the show's name. The summary appears as text, with none of the API's markup in the DOM. Esc and «Скасувати» close it. Focus returns to the button that opened it. |
| C5 | «Додай у діалог форму «моя оцінка й нотатка» з валідацією.» | Submitting with an error keeps the dialog open, with no `alert()`. The error text sits next to the field, linked with `aria-describedby`, and the field gets `aria-invalid`. Focus moves to the first field with an error, and the error clears once fixed. A valid submit shows the note as text; markup typed into it stays text. The dialog closes and the status announces the save. Focus lands on that card's «Детальніше»: the card was re-rendered, so the original button is gone. |

**Gaps expected in the AI drafts.** Prompt calibration (see **Verification**)
has to confirm these:

- `innerHTML` with template strings;
- per-card listeners, bound once at startup or bound inside the render
  function;
- `event.target` used without `closest()`;
- no `preventDefault()`;
- the status node recreated, or missing;
- the summary inserted with `innerHTML`;
- a `<div>` used as the modal;
- `alert()` used for validation;
- focus lost after a re-render.

**Timing.** Students do §4 at home. In class, budget about 15 minutes per
challenge: 2 for the draft, 5 for the checks and the audit, and 8 for the fix.
That's about 80 minutes for all five. If the dry run takes much longer, fold C4
into C5 or drop the checkbox from C3.

After the merge, C4 has 12 rules against 7 in each of C1–C3, so budget about
15 minutes each for C1–C3 and 30 for C4, plus about 10 for setup: roughly 85 of
the 90 minutes. The checklist, deploy and report are homework. The dry run has
to confirm this before publishing.

## Self-check: `check.html`

- **How it runs.** Open it through Live Preview or on GitHub Pages.
  - It loads `index.html` in a same-origin `<iframe>`, uses the app, and lists
    each rule as ✓ or ✗, with a total «Пройдено: N з M».
  - Each check gets a fresh iframe, so no state leaks between checks.
- **How it uses the app.** It calls `click()` (or dispatches a click on the
  `<svg>`), sets `value` and fires bubbling `input` and `change` events, calls
  `form.requestSubmit()`, and uses `dialog.requestClose()` for Esc. It reads
  `aria-*`, text and `activeElement`. It also replaces `alert` inside the
  iframe so it can catch calls.
- **Delegation, without reading the source.** The check adds a card the app
  never rendered, a clone of the template for a show filtered out of view, and
  clicks it. Only a listener on the list can handle that card.
- **Duplicate listeners.** The check re-renders an odd number of times and
  clicks once, then an even number of times and clicks once. Both clicks must
  toggle exactly once.
- **XSS.** The check types `<img src=x onerror=…>` into the note and checks
  that no `<img>` appears and the handler never ran.
- **Its limits.** Synthetic events aren't trusted, so a page script can't test
  a real Esc press or the real Tab order. A manual checklist in the brief
  covers those. It goes into the report:
  - the whole flow using only the keyboard;
  - focus always visible;
  - in the Accessibility pane: the name, role and state of a toggle, of the
    dialog and of an invalid field;
  - in the Event Listeners pane: no `click` listener on the card buttons.
- **Students don't change `check.html`, `check/` or `data/`.** This is an
  acceptance item, and grading diffs against the first commit. An agent can
  read the check files, but the prompts don't point at them. A draft that
  passes everything is a valid outcome. The report then shows how the student
  checked it.

## Experiments (§4): candidates

Students use ЛР-8's protocol and table: their own prediction, then the AI's
prediction without running the code, then the run, then an explanation of any
wrong prediction. The snippets run on `experiments.html`, so they can stay
short. Each experiment names the real defect it leads to.

- 4.1 DOM API:
  1. `getElementsByClassName` vs `querySelectorAll` after removing an item.
     _Defect:_ a loop over a live collection skips every second item.
  2. `<img src=x onerror=…>` through `innerHTML` vs `textContent`. Then the
     same string through `innerHTML` on a detached `div`: the handler still
     runs. Through `<template>` it doesn't. _Defect:_ "stripping tags" through a
     detached `div` is itself an XSS hole.
  3. `li.dataset.id === 82`. _Defect:_ looking up a record by id never matches,
     because `dataset` values are strings.
  4. `innerHTML +=` on a container whose button has a listener, then click the
     button. _Defect:_ adding one item silently breaks every existing button.
- 4.2 Events:
  5. The order of capturing and bubbling listeners on `ul → li → button`.
  6. A click on the `<svg>` inside the button: `target`, `currentTarget`, `this`
     in a function vs an arrow function, and `closest('button')`.
  7. The same anonymous arrow function added twice vs the same named function
     added twice. _Defect:_ a listener registered inside the render function
     fires once more after every render.
  8. A `<div>` with a click handler vs a `<button>`, tried with Tab and with
     Enter and Space; then `isTrusted` on `el.click()`.
- 4.3 Forms:
  9. Press Enter in the text field of a form whose button has only a `click`
     listener. Which events fire, and what happens to the page? _Defect:_ the
     page reloads, and the state is lost.
  10. `<input type="number">` with the value 7: `value + 1`, `valueAsNumber + 1`,
      and both again with the field empty.
  11. Call `setCustomValidity('…')`, fix the value, then call `checkValidity()`.
      _Defect:_ the form stays invalid forever.
  12. Read the input's value inside a `reset` handler. _Defect:_ «Скинути»
      re-renders with the old filter, because the `reset` event fires before
      the values are reset.
- 4.4 Focus and dialogs (track `document.activeElement` with a Live
  Expression):
  13. Focus a button, then remove it. _Defect:_ after a re-render, keyboard
      users land back at the top of the page.
  14. `focus()` on a `div` with no `tabindex`, then with `tabindex="-1"`.
  15. Call `showModal()`, try to focus a button outside the dialog, then call
      `close()`. Repeat, but remove the opener while the dialog is open.
      Calibration confirms that the browser returns focus to the opener only
      if the opener is still in the document.
- 4.4 research only, no experiment: live regions. Hearing an announcement needs
  a screen reader (Narrator, NVDA or VoiceOver). That stays optional.
- 4.5 AI-generated DOM code: a list of failure modes, as in ЛР-10 §4.5 (the
  gaps listed under **Challenges**), plus too much ARIA: `role="button"` on a
  `div` with no keyboard support, and an `aria-label` that hides the visible
  text (WCAG 2.5.3).

**Sources for §4:**

- MDN: Introduction to the DOM, Event bubbling, Event delegation,
  `EventTarget.addEventListener`, `<template>`, Client-side form validation,
  Constraint Validation API, `<dialog>`, ARIA live regions.
- WCAG 2.2: 2.1.1, 2.4.3, 2.4.7, 3.3.1, 4.1.2, 4.1.3.
- APG: the Button pattern (toggle) and the Dialog (Modal) pattern.
- WHATWG HTML: implicit submission, the `dialog` element.

## Dataset

The same 30 ids as ЛР-8. Each record is in ЛР-8's Show shape (C1's output),
plus two fields:

- `summary`: TVmaze's HTML. Checked on 2026-10-08, all 30 records have one.
  They use `<p>`, `<b>` and `<i>`, and run from 86 to 1,832 characters.
- `url`: the show's TVmaze page, for the link in the dialog and the credit.

Take `summary` and `url` from the live API when building, and every other field
from ЛР-8's snapshot, so the two labs show the same numbers. Record both
retrieval dates in the file. The licence is the same as in ЛР-8: CC BY-SA 4.0,
as an adaptation, with the `source`/`license`/`changes` fields and credits in
the README and the page footer.

Shipping data that is already normalised publishes C1's expected output, but
not its code. That's after ЛР-8's deadline, and ЛР-8's report page already
prints one such record. Shipping raw records with a `normalize` function would
publish the solution itself.

## AI rules (handout §5.2)

- **Research:** the same as ЛР-8. The AI predicts before the code runs, and its
  answer is recorded as given.
- **Challenges:**
  1. The AI writes the draft from the handout's prompt. Students paste only the
     prompt. They don't attach the brief or the checks.
  2. Commit the draft unchanged, as `C2: AI draft`.
  3. Run `check.html` and the manual checklist, and fill in the audit rows.
  4. Fix by hand. The AI may explain a failing check or a rule, but doesn't
     write the fix. Commit the fix as `fix(C2): …`.
- **The report** names the agent and its version, the model and the date.

The draft commits and fix commits put the audit into `git diff`. The defence
asks for changes made live, without AI.

## Report (§6)

- Email subject `[Веб] ЛР-9: <title>`, with the repository URL and the Pages
  URL. With the Pages URL, the instructor can open `check.html` without
  cloning anything.
- The experiment table (15 rows) and short conclusions.
- The agent, model and date.
- An audit table, one or more rows per challenge:

  | Challenge | Правило ТЗ | Що було в AI-чернетці | Доказ (check / DevTools / клавіатура) | Виправлення (коміт) |
  | --- | --- | --- | --- | --- |

- The final `check.html` result, «Пройдено: M з M».
- The manual checklist.
- A summary: what the AI did right without being asked, and what it never did
  until it was asked.

## Defence (§7): sample questions

- Show one finding in an AI draft: the check that caught it, the cause, and the
  commit that fixed it.
- A change made live, without AI. For example:
  - a «Прибрати нотатку» button on the card, handled by the existing
    delegated listener;
  - after saving, focus the note text instead;
  - a sort `<select>` in the filter form.
- Why does a click on the icon have a different `target`? What does `closest()`
  return for a click outside every button?
- Why does a card added after startup work with delegation, but not with
  per-card listeners?
- If nothing handles `submit`, why does Enter in the search field reload the
  page?
- Where does focus go when the focused element is removed? What in your code
  prevents that?
- Why is `textContent` enough for the note? What's wrong with
  `div.innerHTML = summary; div.textContent`?

If you want specific tasks for the live changes, keep them in an ignored file.

## Files to create

| File | Notes |
| --- | --- |
| `watchlist-starter/` | as above |
| `src/content/labs/lab-9.md` | the handout, with `handout: /labs/lab-9.pdf`. Aim for 2,500 words or fewer (ЛР-8 is 2,281). No `draft` flag: the unmerged branch keeps it off the site. |
| `src/content/tasks/lab-9.md` | the brief: the app spec, the numbered rules, the manual checklist and `acceptance` |
| `docs/lab-9/README.md` | routes, why, and how to regenerate, like ЛР-8's |
| `docs/build-pack.py <starter>` | a fourth copy of the per-lab script (labs 7, 8 and 10 differ only in `SRC`/`OUT`) is the point to stop. Generalise it first, in its own small commit, and point the three existing callers at it |
| `docs/lab-9/solution/` | the reference solution and the calibration scripts. **Gitignored:** add the rule before creating the folder |
| `public/labs/watchlist-starter.zip`, `public/labs/lab-9.pdf` | build output |
| `README.md` | a tree line for `watchlist-starter/` |
| `docs/course-plan.md` | the mapping row ЛР 9 → `lab-9` |

## Verification

**Checks**, run by the gitignored calibration in `docs/lab-9/solution/` through
headless Edge over CDP, as in ЛР-10. Turn on focus emulation, or `activeElement`
reads `body`.

- The starter as shipped loads with no Console errors, and every check fails.
- The reference solution passes every check, both through Live Preview and from
  a Pages-style subpath.
- Each typical wrong answer is caught by at least one check:
  - `innerHTML` rendering;
  - listeners bound once at startup;
  - a listener added inside the render function;
  - per-card listeners bound in the render function (they work, but fail the
    added-card check);
  - `event.target` used without `closest()`;
  - a `<div>` with a click handler;
  - no `preventDefault()`;
  - values read inside the `reset` handler;
  - the status node recreated;
  - the summary inserted with `innerHTML`;
  - the summary stripped through a detached `div`;
  - a `<div>` used as the modal;
  - `alert()` validation;
  - `setCustomValidity` never cleared;
  - focus lost after a removal or after saving.
- The calibration also produces the answer key for experiments 5, 6, 9, 12 and
  15.

**Prompt calibration:**

- Run the five prompts in at least two agents (for example, Copilot and
  Cursor), each time on a fresh starter.
- Record which checks each draft fails. Keep that record local.
- If a prompt's draft passes everything in both agents, that challenge has
  nothing to audit. Shorten the prompt, or move the rule somewhere harder.

**Browser:**

- Go through the solution using only the keyboard, and check the
  Accessibility pane.
- Lighthouse Accessibility must score 100 on the solution.

**Timing:** do a dry run of the five challenges, using only the brief and the
prompts. The target is 80 minutes or less.

**Site:**

- `npm run check && npm run build`
- In preview: `/labs/lab-9/` and `/labs/lab-9/task/`
- Build the PDF: `python docs/build-handout.py lab-9`

**ЛР-10:** read the final brief and the check names against the local defect
map.

## Order of work

1. Merge the rename and ЛР-8, then branch `feat/lab-9-dom-events` from `main`.
   Until they merge, stack the branch on `feat/lab-8-js-basics`.
2. Generalise `build-pack.py`.
3. Add the gitignore rule for `docs/lab-9/solution/`. Then build the starter
   shell (HTML, CSS, data, `state.js`), the reference solution and the checks
   together. The checks are calibrated against the solution and the list of
   wrong answers.
4. Run the prompt calibration.
5. Write the handout and the brief.
6. Build the PDF and the zip, then update the README and the course-plan row.

**Commits:** the build-pack change; the starter with its checks; the handout
and brief; the generated files; the docs.

## Decisions

Open:

1. **What role does the AI play?** Recommended: the AI writes a draft, and the
   student audits and fixes it by hand, as above. That follows the programme's
   self-study and ЛР-6 Challenge 9. The alternative is ЛР-8's rule (the student
   writes, the AI explains), with one AI-generated feature audited at the end.
   Choose that alternative if ЛР-8 shows that students need to write more code
   from scratch first.
2. **Deadline.** Settled on 2026-10-09: ЛР-9 and ЛР-10 are both due
   19.10.2026, so ЛР-10, which builds on ЛР-9's delegation, is no longer due
   first. The original options were both on 16.10, or ЛР-10 moved to 23.10.
3. **Лекція 5:** its content isn't in this repo. Before writing §4, confirm
   that it covers the DOM API and events; its self-study lists both.

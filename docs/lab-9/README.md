# Lab 9 — DOM, events and forms (Watchlist starter)

| Route | Source | What it is |
| --- | --- | --- |
| `/labs/lab-9/` | `src/content/labs/lab-9.md` | the handout: 15 experiments (analyse, run, explain a miss), four challenges built as AI draft → audit → fix by hand, report, defence |
| `/labs/lab-9/task/` | `src/content/tasks/lab-9.md` | the brief: the DOM contract, numbered rules and the manual checklist |
| `/labs/watchlist-starter.zip` | `watchlist-starter/` | the static shell, data, state module, stubs, `check.html` and `experiments.html` |

## Why it looks like this

- **Lab 8 wrote the logic; Lab 9 writes the DOM layer.** `src/state.js` comes
  ready and has no DOM, so a student who hasn't finished Lab 8 can still do
  Lab 9. It validates its arguments and throws a readable error. A
  `dataset` id passed as a string, or a rating read from the field's `value`,
  fails loudly instead of silently missing.
- **The AI writes a draft; the student owns the result.** The programme's
  self-study names "аналіз JavaScript-коду, створеного AI". The challenge
  prompts are short on purpose and never mention the keyboard, focus,
  delegation or escaping. So the draft shows what an agent does by default,
  and the brief is what it is measured against. Each challenge is two
  commits, the untouched draft and the student's fixes, so the fixes commit
  on GitHub is the audit's diff, and the defence asks the student to walk
  through one finding in it. There is no audit table in the report: it only
  repeated the commit and the defence. Rule-named fix commits were dropped as
  too hard to grade. The draft commit is untouched except for the protected
  files (`check.html`, `check/`, `data/`, `state.js`): if the agent edits one,
  the student restores it first, so acceptance can stay "no commit touches
  them". A fixes commit waits for the earlier blocks too, because agents
  rewrite earlier files.
- **The research and the practice don't ask for the same write-up.** Most
  experiments are a minimal repro of a rule that `check.html` then tests in
  the app. So the experiments keep only Lab 8's analyse → run → explain-a-miss
  loop, with no AI column. Their «Де це трапиться» questions prepare for the
  defence and aren't written up. The AI is assessed once, in the challenges.
- **The shell is complete and accessible.** Every finding comes from the
  JavaScript. The template fixes the contract the checks rely on
  (`li[data-id]`, `[data-action]`, the `<svg>` inside the toggle). Its button
  names come from visually hidden `[data-field="name"]` slots, so filling only
  the first slot with `querySelector` is a finding in its own right.
- **No timers, Promises or `fetch`.** The data comes from a JSON module
  import, as in Lab 8. The Event Loop belongs to Лекція 6 and Lab 10.
- **Not Courtly.** Lab 9 teaches the mechanisms that Lab 10's DOM scenario
  relies on, in the student's own code first. The brief and the check names
  were read against Lab 10's local defect map: none describes a Lab 10 defect
  in Courtly's terms.

## The self-check

`check.html` tests behaviour, not structure: it never reads the app's source.
Each check opens a fresh copy of `index.html` in a `srcdoc` iframe. A small
script runs first, before the app's modules, and does six things:

- it records `addEventListener` calls, deduplicated the way the browser
  dedups them;
- it replaces `alert`, `confirm` and `prompt`;
- it collects uncaught errors;
- it wraps `setTimeout`, `setInterval`, `requestAnimationFrame` and
  `queueMicrotask` callbacks and records the ones that move focus. The focus
  checks (C2.7, C3.7, C4.5, C4.8, C4.12) fail on those: a deferred `focus()`
  lands in the right place but leaves focus on `<body>` until then. Only a
  callback that changes `activeElement` counts, so a dev server's injected
  reload script can't trip it;
- it records timers started inside an app's `click`, `input`, `change`,
  `submit` or `reset` handler. The checks act from script, so microtasks
  wait until every handler has run, and a capture listener on `window` marks
  that window. A failing check then adds a note: a debounced search otherwise
  fails C3.1 with only «фільтр не застосовано», although it works in the
  browser;
- it records `fetch` and XHR URLs. C1.1 fails if the app loads
  `data/shows.json` itself, past `state.js` and the import-map data swap. Any
  other failing check then adds a note saying so, because the swapped-data
  checks would otherwise fail with messages that don't name the cause.

A classic script at the end of `<body>` captures the live region the HTML
starts with. For three checks an import map swaps `data/shows.json` for a blob:

- a show whose name is markup (C1.3);
- a summary carrying an `onerror` payload (C4.3);
- an empty list (C1.7).

The app drives like a user: `focus()` then `click()` for the keyboard, a
click on whatever `elementFromPoint` returns at the icon's centre for the
mouse, `value` plus a bubbling `input` for typing, `requestSubmit()` for Enter,
and `requestClose()` for Esc. Delegation is tested by replacing a card with a
fresh clone of the template, which only a listener on the list can handle.

Synthetic events are not trusted, so the real keyboard, the Tab order and
visible focus are a manual checklist in the brief (§6). Its lines are tagged
C2–C4, so each challenge walks only what exists by then, and the final version
gets one full pass for the report. It names Chrome or Edge: Safari and Firefox
on macOS don't focus a button on click, and Safari's Tab skips buttons by
default. The Accessibility and Event Listeners panes aren't on it: button
names, states and the delegated listener are already checks.

**Deviations from the plan.** C2's focus rule for «Лише мій список» moved to
C3.7, because the checkbox only exists after C3. The dialog and the note form
are one challenge, C4.1–C4.12, with one prompt. The check runs every rule in
a `srcdoc` frame rather than a plain `src` iframe, so that it can instrument
the page before the app's modules run.

## The dataset

`watchlist-starter/data/shows.json` has Lab 8's 30 ids
(see [../lab-8/README.md](../lab-8/README.md)) in the flat shape of Lab 8's
`normalizeShow` output, plus `summary` (TVmaze's HTML, unchanged) and `url`.
The fields come from Lab 8's 2026-10-04 snapshot, so both labs show the same
numbers. The summaries come from `https://api.tvmaze.com/shows?page=0` on
2026-10-08: all 30 have one, they use `<p>`, `<b>` and `<i>`, and five have two
paragraphs. Licence and credits as in Lab 8: CC BY-SA 4.0, as an adaptation,
stated in the file's own fields, the starter's README and the page footer.

## The solution is local-only

`docs/lab-9/solution/` is **gitignored**, because the repository is public:

- `src/` — the reference DOM layer;
- `traps.mjs` — 45 typical wrong answers and 7 valid alternatives, each a
  patch on the solution;
- `verify.mjs` + `cdp.mjs` — the headless Edge harness;
- `experiments.mjs` + `answer-key.md` — the §4 answer key;
- `build-data.mjs` — writes `shows.json`; its mapping is Lab 8's C1 answer.

`verify.mjs` checks four things:

- the starter loads with no Console problems and fails every check;
- the solution passes every check, from `/` and from a Pages-style subpath;
- every wrong answer fails at least the checks it targets;
- every valid alternative passes.

Back the folder up outside the repo.

## Regenerating

```sh
python docs/build-pack.py watchlist-starter       # public/labs/watchlist-starter.zip
python docs/build-handout.py lab-9                # public/labs/lab-9.pdf
node docs/lab-9/solution/verify.mjs all           # local only
node docs/lab-9/solution/experiments.mjs          # local only: §4 answer key
```

The two `node` scripts drive headless Edge; on the course machine Edge starts
only from PowerShell, outside the agent sandbox. Edit the starter in
`watchlist-starter/`, then rebuild the zip. Re-run `verify.mjs` after any
change to `check/`, the template, the shell's ids or `state.js`. Re-run
`experiments.mjs` after changing `experiments.html` or the handout's snippets:
it also confirms that each snippet appears in the handout word for word.

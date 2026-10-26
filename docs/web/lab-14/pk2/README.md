# ПК2 — the Google Forms generator

ПК2 ran on 21–22.10.2026 as Google Forms quizzes made by this Apps Script:
16 questions at 0.5 points and 4 code tasks at 1 point, 12 points in all.
Each form is a fresh random draw from the task bank. It stays the way to
make a ПК2-style test until the page in [../frontend-plan.md](../frontend-plan.md)
and [../backend-plan.md](../backend-plan.md) is built.

| File | In git | What it is |
| --- | --- | --- |
| `apps-script/Code.gs` | yes | the generator: `createForm()` draws a set, builds the quiz and links the results sheet; `resetUsed()` |
| `build.mjs` | yes | writes `apps-script/Bank.gs` and the readable `pk2-pool.md` from the bank |
| `tasks.mjs`, `code/` | no | the bank: every question, its four options (the first is correct) and an explanation |
| `verify.mjs` | no | checks every key by running the code in Node, headless Edge and `tsc` |
| `apps-script/Bank.gs`, `pk2-pool.md` | no | `build.mjs` output |

The bank is not in git because the repository is public and the pool is
reused for the credit test. `.gitignore` ignores everything in this folder
except the files marked "yes", so a new bank file stays private by default.

## Make a form

1. Run `node build.mjs` with the bank on disk. It prints the question count
   per section.
2. On script.google.com, signed in with the `@oa.edu.ua` account, open the
   project, or create one with two script files, `Code` and `Bank`. Paste
   `apps-script/Code.gs` and `apps-script/Bank.gs` into them.
3. Set `CONFIG.label` to the group. Leave `CONFIG.ids` empty for a random
   draw, or list the IDs from an earlier form's log to rebuild that set.
4. Run `createForm` and grant the permissions on the first run.
5. The execution log has the student link, the edit link, the results tab
   and the drawn IDs. Its last line is a setting the API can't change. Set
   it by hand before you share the link.

Run `resetUsed` to let later forms draw from the whole bank again.

## Why it works like this

- **Doubled points.** Forms accepts whole points only, so a section 1
  question is worth 1 and a section 2 task is worth 2, 24 in all. The results
  sheet adds an «Оцінка» column with points ÷ 2, rounded, and the form's
  description tells students the same.
- **Unused questions first.** Script Properties keep the IDs that every form
  has drawn, and a draw takes a used one only when its topic has no unused
  ones left. They also keep the Drive folder and the one results
  spreadsheet, where each form gets its own tab.
- **A fixed mix.** `take` in each topic sets how many questions that topic
  gives each section. A form takes at most one question from each `family`.
- **Shuffled options.** In the bank the first option is always the correct
  one. The script shuffles the options, and Forms shuffles the questions.
- **Academic accounts only.** The form takes one response per Google
  account. If the script's owner is in `oa.edu.ua`, it also requires sign-in
  in that domain. From any other account the domain lock can't be set, and
  the results sheet's «Пошта» column flags addresses outside the domain.

## The bank format

`tasks.mjs` exports `topics` and `tasks`.

- `topics`: key → `{ title, source, take: [section 1, section 2] }`.
- Each task: `id`, `section` (1 or 2), `topic`, an optional `family`,
  `question`, `options` (four, correct first) and `explain` (for the
  instructor, not shown in the form). Optional: `code` lists file names in
  `code/`, with HTML shown above the JS; `numbered` adds line numbers;
  `after` is Console output shown below the code. `run`, `expect` and
  `errorAt` are read by `verify.mjs` only.

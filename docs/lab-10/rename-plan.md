# Plan: renumber the JavaScript debugging lab from ЛР-8 to ЛР-10

Status: done, 2026-10-04, on branch `fix/renumber-debugging-lab`. Delete this
file once the rename is merged. The facts that last live in this folder's
`README.md`, which moved here from `docs/lab-8/`.

## Context

The revised course plan ([../course-plan.md](../course-plan.md), Part 2) makes
ЛР-8 «Основи JavaScript» and ЛР-9 «Інтерактивний DOM та події». The debugging
lab becomes ЛР-10, after Лекція 6 (async). The lab was built and merged
(PR #20) as `lab-8`, so two things are now wrong:

- it carries the wrong number;
- it holds the `lab-8` id and the `docs/lab-8/` folder that the new lab needs.

**Unchanged:** the starter, its seeded defects, the calibration, and the
handout's content apart from numbers, links, dates and folder names. The
starter zip (`courtly-booking-starter.zip`) has no number in its name.

## Decisions (instructor, 2026-10-04)

1. **New deadline: 16.10.2026.** It appears in three places: the handout's
   «Термін здачі» line, the bonus condition in §8 Оцінювання, and the brief's
   «Бонус до …» highlight.
2. **No redirect.** `/labs/lab-8/` was never sent to students, so the old URL
   can simply go away until the new ЛР-8 takes it over.

## Step 0 — branch

`feat/lab-8` is merged, so don't reuse it.

```bash
git switch main
git pull --ff-only
git switch -c fix/renumber-debugging-lab
```

## Step 1 — move the instructor-only files first

`docs/lab-8/starter-defects.md` (the defect map and answer keys) and
`docs/lab-8/calibration/` (the Edge harness) are gitignored and exist only on
the instructor's machine.

**Order matters.** If `.gitignore` still names `docs/lab-8/` after these files
move to `docs/lab-10/`, git stops ignoring them. The next `git add -A` would
then publish the defect map to the public repo.

1. Back up both outside the repo. Git has no copy, so a bad move loses them for good.
2. In `.gitignore`, change the Lab 8 comment to Lab 10 and both paths to
   `docs/lab-10/starter-defects.md` and `docs/lab-10/calibration/`.
3. Move them:

   ```bash
   mv docs/lab-8/starter-defects.md docs/lab-10/
   mv docs/lab-8/calibration docs/lab-10/
   ```

4. Check that both are still ignored. The first command should print a rule
   for each path, and the second should list neither:

   ```bash
   git check-ignore -v docs/lab-10/starter-defects.md docs/lab-10/calibration/verify.mjs
   git status --short
   ```

## Step 2 — move the tracked files

Use `git mv` one file at a time, so history follows each file. Don't run
`git mv docs/lab-8 docs/lab-10`, for two reasons:

- `docs/lab-10/` already exists (it holds this plan), so git would nest the
  folder as `docs/lab-10/lab-8/`;
- `docs/lab-8/` must keep `js-basics-plan.md` for the new lab.

| From | To |
| --- | --- |
| `src/content/labs/lab-8.md` | `src/content/labs/lab-10.md` |
| `src/content/tasks/lab-8.md` | `src/content/tasks/lab-10.md` |
| `docs/lab-8/README.md` | `docs/lab-10/README.md` |
| `docs/lab-8/build-pack.py` | `docs/lab-10/build-pack.py` |
| `docs/lab-8/copy-assets.mjs` | `docs/lab-10/copy-assets.mjs` |
| `public/labs/lab-8.pdf` | `git rm`, then rebuilt as `lab-10.pdf` in step 4 |

## Step 3 — update the references

The site takes a lab's route from its file name and its order and `ЛР-N`
badge from `number`. Both have to change. Prev/next navigation and the `/labs/`
index follow automatically.

| File | Change |
| --- | --- |
| `src/content/labs/lab-10.md` | `number: 10`; `updated:` to the rename date; `handout: /labs/lab-10.pdf`; every `/labs/lab-8/task/` link (§3, §5 intro, §5.6); the suggested folder `lab-8/` (§5.1); the email subject `[Веб] ЛР-8:` (§6) |
| `src/content/tasks/lab-10.md` | `summary` «у ЛР №8»; the suggested folder `lab-8/` (two places) |
| `courtly-booking-starter/README.md` | the title «ЛР №8»; both site URLs; the suggested folder `lab-8/`, including the Vercel **Root Directory** value |
| `docs/lab-10/README.md` | the title, the route table, the ignored-file paths, the regenerate commands |
| `docs/lab-10/build-pack.py` | the usage line and "a lab-8/ folder" in the docstring |
| `docs/lab-10/copy-assets.mjs` | the header comment and its usage line |
| `docs/lab-10/starter-defects.md` (ignored) | the title, the brief's route, the calibration commands |

Leave the deadline (09.10.2026) as it is here. It changes in a separate commit
(see **Commits and PR**) in three places: the handout's «Термін здачі» line,
the bonus date in §8, and the brief's «Бонус до …» highlight.

**Content check, separate from the number swap.** The handout was written to
come straight after ЛР-7. It now follows ЛР-8, ЛР-9 and Лекція 6:

- The «Важливо!» note in §3 still holds: students' ЛР-7 pages have no
  JavaScript worth debugging.
- Optionally add one sentence saying the lab builds on ЛР-8/ЛР-9 and on the
  Event Loop and Promises from Лекція 6.

Keep any such edit in its own commit.

## Step 4 — rebuild the generated files

```bash
python docs/lab-10/build-pack.py          # the zip contains the starter README
python docs/build-handout.py lab-10       # public/labs/lab-10.pdf
```

Check that the PDF header shows ЛР-10, and 16.10.2026 once the deadline
commit rebuilds it.
`build-handout.py` reads both from the frontmatter and the «Термін здачі»
line.

There's no need to re-run the calibration, because only the README changed
inside the starter. Re-run it if anything under `js/` or `data/` changes.

## Step 5 — search for leftovers

```bash
git grep -n -e "lab-8" -e "ЛР-8" -e "ЛР №8" -e "Lab 8"
grep -rn -e "lab-8" -e "ЛР №8" -e "Lab 8" docs/lab-10/starter-defects.md docs/lab-10/calibration
```

Expected hits:

- `docs/course-plan.md` (the site mapping table)
- `docs/lab-8/js-basics-plan.md`
- this file

Anything else is a missed reference.

## Step 6 — verify

1. `npm run check && npm run build`
2. `dist/labs/lab-10/index.html` and `dist/labs/lab-10/task/index.html`
   exist, and `dist/labs/lab-8/` doesn't.
3. `npm run preview`, then check:
   - `/labs/` lists ЛР-10 right after ЛР-7;
   - prev/next goes ЛР-7 → ЛР-10;
   - the brief's hand-off card works;
   - the PDF and zip download links work;
   - the root-relative links in the handout body resolve under the base path.

## Commits and PR

1. `fix(lab): renumber the JavaScript debugging lab to ЛР-10`: the moves,
   references, `.gitignore`, and the rebuilt PDF and zip.
2. `fix(lab): move the ЛР-10 deadline to 16.10.2026`: deadline line, §8,
   brief highlight, and the PDF rebuilt again.

The PR body must not name any defect, because the repo is public.

## After merge

`/labs/` goes from ЛР-7 straight to ЛР-10 until ЛР-8 and ЛР-9 are published.
That's expected.

# Lab 8 — JavaScript basics (JS Basics starter)

| Route | Source | What it is |
| --- | --- | --- |
| `/labs/lab-8/` | `src/content/labs/lab-8.md` | the handout: experiments under the predict → ask the AI → run protocol, five code challenges, report, defence |
| `/labs/lab-8/task/` | `src/content/tasks/lab-8.md` | the brief: the spec of every function; each test checks one rule from it |
| `/labs/js-basics-starter.zip` | `js-basics-starter/` | the stubs, the tests, the TVmaze snapshot and the report page |

## Why it looks like this

- **What JavaScript does differently, not syntax.** The students already
  program in other languages. The lab covers coercion, scope, closures,
  references and modules: the places where that intuition, or an AI agent's
  confident answer, is wrong.
- **Pure functions, tests provided.** Everyone starts from the same baseline,
  as in Lab 6, and `node --test` needs nothing installed. No DOM, timers or
  Promises: those belong to Lab 9, Лекція 6 and Lab 10.
- **Mutation fails loudly.** The tests deep-freeze their inputs and modules
  run in strict mode, so a function that changes its argument throws a
  `TypeError` instead of passing.
- **One `deepFreeze` per test file.** `node --test` runs every `.js` file
  under `test/`, so a shared helper there would show up as an extra passing
  "test", and the starter would no longer start with every test failing.
- **TVmaze, not Courtly.** Lab 10's starter is Courtly, and data functions over
  the same model could hand out its fixes. The challenges were checked against
  Lab 10's defect map: none is a correct version of a seeded defect.

## The dataset

`js-basics-starter/data/shows.json` is 30 of the 240 shows on
`https://api.tvmaze.com/shows?page=0`, fetched on 2026-10-04: ids 1, 2, 5, 29,
32, 40, 49, 66, 70, 82, 83, 97, 112, 118, 123, 143, 153, 156, 169, 170, 174,
175, 179, 180, 184, 197, 208, 210, 216 and 246. The ids were picked so that
each kind of gap (no rating, no runtime, no network, no genres) appears at
least three times. Fields are cut to `id`, `url`, `name`, `language`,
`genres`, `status`, `runtime`, `premiered`, `rating.average` and
`network.id`/`network.name`.

TVmaze data is CC BY-SA 4.0, and the snapshot is an adaptation under the same
licence. The file says so in its own `source`, `license` and `changes` fields,
and both the starter's README and its report page credit TVmaze with a link.
The tests don't read the file: each one builds a small inline fixture around
a trap.

## The solution is local-only

`docs/lab-8/solution/` is **gitignored**, because the repository is public. It
holds the reference `src/` and `verify.mjs`, which checks the tests three
ways:

- every test fails on the stubs;
- the solution copied over the stubs passes every test;
- each of a list of typical wrong answers is caught by at least one test.

Back the folder up outside the repo.

## Regenerating

```sh
python docs/lab-8/build-pack.py      # public/labs/js-basics-starter.zip
python docs/build-handout.py lab-8   # public/labs/lab-8.pdf
node docs/lab-8/solution/verify.mjs  # local only
```

Edit the starter in `js-basics-starter/`, then rebuild the zip. Re-run
`verify.mjs` after any change to `src/` or `test/`.

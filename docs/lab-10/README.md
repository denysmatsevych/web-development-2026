# Lab 10 — JavaScript debugging (Courtly Booking)

| Route | Source | What it is |
| --- | --- | --- |
| `/labs/lab-10/` | `src/content/labs/lab-10.md` | the handout: research, scenarios A / B / C, report, defence |
| `/labs/lab-10/task/` | `src/content/tasks/lab-10.md` | the brief: how the starter **should** behave; a defect is any deviation from it |
| `/labs/courtly-booking-starter.zip` | `courtly-booking-starter/` | the seeded starter students debug |

## Why a separate starter

- **Lab 7 has nothing to debug.** Its handout allows JavaScript for the
  mobile menu only. Seeding Console, DOM and Event Loop defects needs an app
  with data, async calls and re-rendering.
- **One baseline.** As in Lab 4, a seeded starter fixes the defect set, so
  every report is graded against the same map.
- **It does not publish the Lab 7 answer.** It is a different page of the same
  brand — catalogue and booking, not the landing page — and reuses only the
  public `courtly-assets/` pack.

## The defect map is local-only

`docs/lab-10/starter-defects.md` (the seeded defects, their correct fixes, the
AI traps and the answer keys) and `docs/lab-10/calibration/` (the Edge harness
that checks them) are **gitignored**: the repository is public. Back both up
outside the repo.

## Regenerating

```sh
node docs/lab-10/copy-assets.mjs                   # tokens, logo, favicon, venue images from courtly-assets/
python docs/build-pack.py courtly-booking-starter  # public/labs/courtly-booking-starter.zip
python docs/build-handout.py lab-10                # public/labs/lab-10.pdf
```

Edit the starter in `courtly-booking-starter/`, then rebuild the zip. After
any change to its JavaScript or data, re-run the calibration — a single
changed line can move or remove a seeded defect.

# Lab 2 — plan and decisions

Turning two source handouts into pages on the course site:

| Source PDF | Becomes |
| --- | --- |
| `Лабораторна робота №2_ Основи CSS та AI-assisted верстка.pdf` | `/labs/lab-2/` |
| `ТЗ_ЛР2_Секція_тарифних_планів.pdf` | `/labs/lab-2/task/` |

Branch `feat/lab-2`, cut from `origin/main` at `9189d91` — Astro 7, Tailwind v4,
single merged project, with the `labs` collection and `LabLayout` already
shipped by Lab 1.

**This file** holds the analysis and the one architectural decision.
**[implementation.md](implementation.md)** holds the code, step by step.
**[content-map.md](content-map.md)** maps every PDF section onto a Markdown
section, with the spec's `:root` block transcribed verbatim.

---

## 1. What gets built

| | |
| --- | --- |
| New routes | `/labs/lab-2/` (lab), `/labs/lab-2/task/` (ТЗ) |
| New collection | `tasks` — one practical brief per lab; the entry id **is** the owning lab's id |
| New components | `TaskCard.astro`, `PricingMockup.astro`, `MockupLightbox.astro`, `AcceptanceChecklist.astro`, plus `LabHeader.astro` / `LabMeta.astro` extracted so both routes share one copy |
| Touched | `content.config.ts`, `lib/labs.ts`, `pages/labs/[lab].astro`, `pages/labs/index.astro`, `astro.config.mjs` |
| New content | `src/content/labs/lab-2.md`, `src/content/tasks/lab-2.md` |

Everything reuses what Lab 1 established: the content-collection pattern,
`LabLayout`, `OnThisPage`, `Breadcrumbs`, `PrevNext`, and the `.doc-content`
prose styles. No new layout, no new dependency.

---

## 2. Source analysis

### 2.1. The lab handout — 6 pages, prose

| Field | Value |
| --- | --- |
| Title | Основи CSS: Box Model, Cascade, Specificity та AI-assisted верстка |
| Language | Ukrainian |
| Grading | 2 points for the oral defence, +1 for submitting by **23.09.2026** or finishing in class |

Eight numbered sections:

1. **Мета роботи** — one paragraph.
2. **Цілі та результати навчання** — 6 bullets.
3. **Завдання лабораторної роботи** — 4 numbered items.
4. **Дослідницькі завдання** — 6 subsections (4.1 Box Model … 4.6 Reuse and
   refactoring). Each is *read a web.dev article → run an experiment → record
   the observation*. This is the bulk of the document and the part that is
   genuinely a lab handout.
5. **Практична частина** — the build task. Two paragraphs plus six code-quality
   requirements; it delegates the actual spec to the ТЗ document.
6. **Вимоги до звіту** — email subject, three deploy links, the five questions a
   student must be able to answer, DevTools screenshots.
7. **Усний захист** — 5 sample defence questions.
8. **Оцінювання** — 2 + 1 points.

No tables and no code blocks beyond inline CSS fragments. A straight fit for the
existing `.doc-content` styles, exactly like Lab 1.

### 2.2. The ТЗ — 4 pages, dense

| Field | Value |
| --- | --- |
| Deliverable | An adaptive pricing section: heading, lead, three plan cards |
| JavaScript | Explicitly **not** required |
| Language | Ukrainian |

1. **Загальна ідея** — prose, a **rendered mockup** of the three cards, a plan table.
2. **HTML-структура** — prose (semantic skeleton, `<ul>` for features).
3. **CSS Variables** — 1 code block, ~20 declarations (the whole `:root`) — the
   only code example the page keeps.
4. **Обов'язкові вимоги до CSS** — 5 labelled requirements, prose only.
5. **Розташування та адаптивність** — prose (3 columns → 1 below ~768px).
6. **AI-assisted розробка** — a sample prompt, a 7-item post-generation checklist.
7. **Критерії приймання** — a 10-row acceptance table.
8. **Що показати під час перевірки** — a 5-item demo checklist.

### 2.3. Why the two documents pull apart

The lab is *what you must understand*; the ТЗ is *what you must build*. They are
read at different times, in different postures:

- the lab is read once, top to bottom, before the session;
- the ТЗ stays open beside the editor for two hours, jumped around in, and
  re-checked line by line against the acceptance table.

Inlining the ТЗ would roughly double the lab page and bury sections 6–8 of the
lab under four pages of spec.

---

## 3. Decision: a separate route, not a dialog

**The ТЗ gets its own page at `/labs/lab-2/task/`**, reached from a single rich
link card on the lab page.

### 3.1. Options weighed

| | Separate route | `<dialog>` modal | `<details>` inline |
| --- | --- | --- | --- |
| Lab page stays short | Yes | Visually only — the markup still ships in the same document | Same caveat |
| Deep link / shareable URL | Yes | No — needs hash-open plumbing and JS | Anchors inside a closed block are unreliable |
| Open in a second tab beside the editor | Yes | No | No |
| Survives reload and Back | Yes | No | Partly |
| Its own "On this page" rail | Free, via `LabLayout` | No | No — its headings land in the lab's ToC |
| Print / save as PDF | Yes | No | Partly |
| Reading 4 spec pages on a phone | Normal scroll | Scroll-locked overlay, `100dvh` traps | Long collapsed block |
| Extra JS and a11y surface | None | Focus trap, `Esc`, scroll lock, `inert` | None |
| Effort | 1 collection + 1 route, ~80 lines | Modal component + open/close script | Lowest |

The decisive point is easy to miss: **a dialog does not actually lighten the
page.** The spec markup still sits in the same document, still parsed, still in
the DOM — it is only visually hidden. Moving the content to its own route is the
only option that genuinely takes it off the lab page.

The second decisive point is workflow. Students will keep this spec open on a
second monitor or a second tab while they build. A modal cannot be a second tab.

### 3.2. Where a `<dialog>` does earn its place

Not for the spec, but two smaller things use one, and **both ship in v1** so the
call can be made in use rather than in the abstract
([implementation.md step 11](implementation.md)):

- **Mockup lightbox** — enlarge the pricing mockup past the article column.
- **Критерії приймання** — the acceptance criteria as a self-check you tick off
  before submitting.

Both are native `<dialog>` + `showModal()`: focus trapping, `Esc` and the top
layer come from the platform, and neither reimplements any of it.

The rule they are being judged against: a dialog is for something you *glance at
and dismiss*, never for something you *work from*. The lightbox is a clean fit.
The checklist is the interesting one — it is not a duplicate of the §7 table but
the interaction the table cannot provide, and if it does not feel worth the
weight in review, deleting it costs one file. Expect the review to also settle
where the criteria live: the route or the Markdown body, not both.

### 3.3. The mockup is rendered, not screenshotted

The ТЗ page shows the target design as a live `PricingMockup.astro` component
rather than a PNG exported from the PDF. It stays sharp at any zoom, reads
correctly in both themes, and demonstrates the one-column → three-column reflow
the brief asks for.

The cost is real and worth stating: **a student can read it in DevTools.** Three
things keep that acceptable —

- the ТЗ PDF already hands them the `:root` block, the HTML skeleton and the
  grid CSS, so the mockup leaks little that the spec does not;
- the component uses its own `mockup__*` class names, not the `.pricing-card` /
  `.btn` / `.pricing-card--featured` names the acceptance table grades, so
  copied markup fails the criteria;
- the work is defended **orally** — §7 of the lab is five questions about why
  the code does what it does. Copied CSS does not survive that.

If this still feels wrong, the swap is small: export the PDF's mockup to
`public/labs/lab-2-mockup.png` and replace the component with an `<img>`.
Implementation step 5 is the only step affected.

### 3.4. What this means for the lab page

Section 5 of the lab stays in `lab-2.md` but shrinks to what belongs there — the
framing, the six code-quality requirements, and the note that the work is done
in class. The mockup, the HTML skeleton, the `:root` block, the breakpoint and
the acceptance table all move to the ТЗ page. The reader gets one obvious
hand-off card instead of a wall of spec.

---

## 4. Target file layout

```
src/
  content.config.ts                 ← M  add the `tasks` collection
  content/
    labs/
      lab-1.md
      lab-2.md                      ← A  the lab (sections 1–8)
    tasks/
      lab-2.md                      ← A  the ТЗ (sections 1–8)
  components/
    TaskCard.astro                  ← A  lab page → ТЗ hand-off card
    PricingMockup.astro             ← A  live render of the target design
    LabHeader.astro                 ← A  eyebrow/title/summary, shared by both routes
    LabMeta.astro                   ← A  the header panel Lab 1 planned (see §5)
    MockupLightbox.astro            ← A  <dialog> — enlarge the mockup (§3.2)
    AcceptanceChecklist.astro       ← A  <dialog> — tickable acceptance criteria (§3.2)
  lib/
    labs.ts                         ← M  taskHref / getTasks / getTask
  pages/
    labs/
      index.astro                   ← M  "ТЗ" pill on cards that have a brief
      [lab].astro                   ← M  render TaskCard when a brief exists
      [lab]/
        task.astro                  ← A  the ТЗ route
plugins/
  rehype-base-links.mjs             ← A  base-aware links in Markdown bodies
astro.config.mjs                    ← M  register that plugin
public/
  labs/
    lab-2.pdf                       ← A  lab handout download
    lab-2-task.pdf                  ← A  ТЗ download
```

`src/pages/labs/[lab].astro` and `src/pages/labs/[lab]/task.astro` coexist
without conflict — they are distinct route patterns (`/labs/[lab]` and
`/labs/[lab]/task`) building to `labs/lab-2/index.html` and
`labs/lab-2/task/index.html`.

---

## 5. Two things Lab 1 left behind

Worth fixing while we are in here, both surfaced by reading the existing code:

1. **`handout` is dead metadata.** `lab-1.md` declares
   `handout: /labs/lab-1.pdf`, but `public/labs/` does not exist and no
   component reads the field — the link would 404 if it were rendered. Step 8 of
   [implementation.md](implementation.md) publishes the PDFs and renders the
   download link for real.
2. **`discipline`, `level`, `format`, `duration`, `updated` are also unread.**
   The `LabMeta.astro` panel that the Lab 1 guide planned was never built. Either
   render them in the lab header or drop them from the schema; leaving declared
   fields that nothing consumes invites drift. Recommendation: render them —
   they are genuinely useful on a handout page.

---

## 6. Deferred / follow-ups

- **Add the CSS lecture deck.** The lesson has been delivered in class, but
  `src/data/lectures/` still holds only `lecture-1.ts` and `lecture-2.ts`, so
  Lab 2 has no deck to link back to. One `lecture-3.ts` plus one registry entry
  closes it.
- **Remove the `/tutorial/` section.** Decided separately: the handbook goes
  away, and every reference a lab needs is an inline link in its own text —
  the way the PDFs do it — rather than a chapter of its own. Lab 2 is already
  written that way (see [content-map.md §1.3](content-map.md)), so nothing here
  blocks on it and nothing here needs revisiting after it.

  One coupling to clear **first**: `Breadcrumbs.astro` is used by both lab
  routes but imports `type { Crumb }` from `@/lib/curriculum`. Move that type
  (to `src/lib/labs.ts` or a small shared module) before deleting the handbook,
  or the lab pages break with it. `src/scripts/docs.ts` must also stay —
  `LabLayout` and the labs index both call `initDocs()`.

- Review the two dialogs shipped in v1 (§3.2) and delete whichever does not earn
  its keep.
- A `uk` locale for the site chrome. Breadcrumbs still read "Labs" and `PrevNext`
  still says "← Previous" on pages whose body is Ukrainian. Consistent with
  Lab 1 today, but it is an obvious seam.
- A shared `Callout.astro` for the "Важливо!" / "Примітка" blocks, which are
  currently blockquotes. Only worth it once a third lab needs them.

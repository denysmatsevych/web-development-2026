# Guide: Implementing the Individual Assignment as `00` on `/labs/`

Step-by-step plan for turning the handout
`Індивідуальне_завдання_Сучасна_веброзробка.pdf` into a page at
`/labs/individual/` and pinning it as card **00** at the top of
[src/pages/labs/index.astro](../src/pages/labs/index.astro), above Lab 1.

Written against `524586d` (Lab 2 merged) on branch `feat/individual-assignment`.
It reuses what Labs 1 and 2 shipped: the `labs` collection, `LabLayout`,
`LabHeader`, `Breadcrumbs`, `OnThisPage` and the `.doc-content` prose styles. It
adds no new layout, component or dependency.

**Dry-run status.** Every step below was applied on this branch on 2026-09-19
and then reverted, so the branch carries only this guide. Results:
`astro check` reported 0 errors, 0 warnings, 0 hints. The build emitted
`dist/labs/individual/index.html`. The page and the index were measured in
headless Edge at 390px and 1280px wide. The numbers quoted in §8 and §11 come
from that run.

| | |
| --- | --- |
| New files | `src/content/labs/individual.md` |
| Edited | `src/content.config.ts`, `src/lib/labs.ts`, `src/pages/labs/[lab].astro`, `src/pages/labs/index.astro`, `src/styles/lab.css` |
| Assets | `public/labs/individual.pdf` |

---

## 0. The handout — use the fixed PDF

Publish `Індивідуальне_завдання_Сучасна_веброзробка_виправлено.pdf` (in
Downloads), **not** the original. The original had defects, fixed in place on
2026-09-19. Each fix removed the exact original text and re-set it in the same
Roboto, size, colour and position, so nothing else on any page moved:

1. **Hours.** The nine stages summed to **58** while the header and "Разом"
   said 62. Stage 9 (Комплексне доопрацювання та підготовка до захисту) went
   from 2 to **6**, so the stages now sum to 62.
2. **Email subject typo.** `[Веб] Індивідальне завдання` →
   `[Веб] Індивідуальне завдання`. The page and the PDF now agree.
3. **Page numbers.** The footer read `Сторінка з` with the numbers missing; it
   now reads `Сторінка N з 4`.
4. **Footer attribution.** `НаОА • Кафедра ІТАД` →
   `НУОА • ННІ ІТ та бізнесу • Кафедра ІТАД` on all four pages.
5. **Three rows in the wrong font size.** Topics row 1 (Open Library), stage 8
   (Vite/NPM…) and the «Testing, debugging та code quality | 20» grading row
   were set at 10.5pt among 8.5–9pt neighbours. All three now match. Row 1 also
   gained the description line every other row has: «Відкритий API з даними про
   книги, авторів і видання, з пошуком та обкладинками.» Stage 8 and the
   Testing row stay a little taller than their neighbours, because row heights
   are fixed in the PDF; their text is centred in the row.

All ten table rows were checked for content: numbering, topics, API names and
formats are correct. All ten links point to the right URLs and return HTTP 200.
Two links need a note:

- **Nobel Prize** — `…/organization/developer-zone-2/` now redirects to
  `https://www.nobelprize.org/about/developer-zone-2/`. The page uses the new
  URL.
- **Launch Library 2** — `https://ll.thespacedevs.com/2.0.0/` still works, but
  it is an old version path (`/2.3.0/` also responds, and `/docs/` is the
  documentation root). The page keeps the handout's URL. Consider pointing both
  at `/docs/`.

**A second PDF exists and is deliberately not used.**
`Методичні вказівки до індивідуального завдання.pdf` ("Керівництво з
виконання…", 3 pages, created an hour before the handout) **contradicts the
handout's grading**. It splits "Testing" into 10 points plus 10 points for an
"AI Development Log" with 5 worked cases, while the handout gives Testing,
debugging and code quality all 20 points and never mentions an AI log. This
guide follows the handout. If the methodology document is meant for students
too, reconcile the two first. See §13 for how it would plug in.

---

## 1. Source analysis

### What the document is

| Field | Value |
| --- | --- |
| Title | ІНДИВІДУАЛЬНЕ ЗАВДАННЯ з дисципліни «Сучасна веброзробка: HTML, CSS, JS/TS» |
| Specialty / year | F3 Комп'ютерні науки, 3 курс |
| Workload | 62 години самостійної роботи |
| Pages | 4 (A4) |
| Language | **Ukrainian** |
| Deadline | **none stated** |

### Shape of the content

Ten numbered sections, no appendices:

1. **Тема** — one sentence.
2. **Мета** — one sentence.
3. **Основні вимоги** — 12 bullets, then an unnumbered «Формат вебзастосунку»
   (2 formats, 6 "not required" bullets, 1 closing line).
4. **Приклади предметних областей** — **a 10-row × 4-column table** (topic,
   API + link + description, suggested format), then «Рекомендації щодо вибору
   теми» (7 bullets).
5. **Етапи виконання та розподіл часу** — **a 9-row table** + total.
6. **Результати** — 4 numbered deliverables.
7. **Мінімальні вимоги** — 10 bullets.
8. **Захист** — 8 bullets.
9. **Оцінювання** — **an 8-row table** + total (100), then «Обов'язкова умова
   зарахування» (1 paragraph).
10. **Подання роботи** — email address, subject line, 2 bullets.

**Total: 3 tables, 0 code blocks, ~12 headings, 10 external links, 0 images.**
It is lighter than Lab 1 and needs no ТЗ split like Lab 2. It is Markdown-shaped,
and `.doc-content` already styles every element in it.

### How it differs from a lab

This is the part that drives the code changes:

- **It has no lab number.** It is not a session and does not follow a lecture.
  It runs beside all the labs for the whole semester. It needs a slot that sorts
  first (`00`) but is never called «Лабораторна робота №0» or «ЛР-0».
- **It is not in the lab sequence.** Lab 1's "← Previous" should not point at
  it, and it should have no prev/next of its own.
- **It carries its own 100-point grading.** That is fine as body content and
  needs no special treatment.
- **Its topics table is wide.** Four columns of prose do not fit a phone
  column. See §8.

---

## 2. Decisions

| Decision | Choice | Why |
| --- | --- | --- |
| Content model | An entry in the existing `labs` collection | Same page shell, header, ToC, handout button, index card. A separate collection or a hand-written `individual.astro` route would duplicate all of it |
| Telling it apart | New `kind: 'lab' \| 'individual'` field, default `'lab'` | One field drives three behaviours: header/crumb labels, prev/next exclusion, the index card modifier. Existing labs need no edit |
| Position | `number: 0` (schema relaxed to `nonnegative()`) | Sorts first with the existing sort, and `padStart(2, '0')` already renders `00` |
| File / URL | `src/content/labs/individual.md` → `/labs/individual/` | Readable; the id is the URL segment, as with `lab-1` |
| `<h1>` / card title | «Індивідуальне завдання» | What students and the handout call it. The formal theme stays in §1 |
| Eyebrow | «Самостійна робота · 62 години» (from `duration`) | An eyebrow of «Індивідуальне завдання» would repeat the `<h1>` |
| Breadcrumb | `Labs › ІЗ` | Matches `ЛР-N` for labs |
| Prev/next | Excluded both ways | It runs alongside the sequence, not inside it |
| Index card | First in the same list, with a resting brand border | A marker that it is different, with no second list and no new component |
| Wide tables | Scroll inside their own box **on phones only** | Measured in §8; a site-wide `display: block` shrinks desktop tables |
| Handout | `public/labs/individual.pdf` | Same `handout:` field and download button as the labs |

**Rejected:** `number: 0` without `kind`. The page would read «Лабораторна
робота №0», the breadcrumb «ЛР-0», and Lab 1 would link back to it as
"Previous".

---

## 3. Target file layout

```
src/
├── content.config.ts               # CHANGED — `kind` field, `number` may be 0
├── content/
│   └── labs/
│       └── individual.md           # NEW — the page body (Appendix A)
├── lib/
│   └── labs.ts                     # CHANGED — labLabels(), lab-only prev/next chain
├── pages/
│   └── labs/
│       ├── index.astro             # CHANGED — 00 card modifier + lead copy
│       └── [lab].astro             # CHANGED — eyebrow/crumb from labLabels()
└── styles/
    └── lab.css                     # CHANGED — wide tables scroll on phones
public/
└── labs/
    └── individual.pdf              # NEW — the (fixed) handout
```

Two new files, five changed. `[lab]/task.astro` is untouched because the ІЗ has
no ТЗ (but see §13).

---

## 4. Step 1 — Schema (`src/content.config.ts`)

In the `labs` collection, add `kind` and relax `number`:

```ts
  schema: z.object({
    /**
     * `lab` — a numbered lab (ЛР-N). `individual` — the semester's individual
     * assignment (ІЗ): listed first as `00`, named by its kind rather than a
     * number, and kept out of the lab-to-lab prev/next chain.
     */
    kind: z.enum(['lab', 'individual']).default('lab'),
    /** Ordering, the `ЛР-N` badge, and the index card index — `0` for the ІЗ. */
    number: z.number().int().nonnegative(),
    // …the rest of the schema is unchanged
```

`default('lab')` means `lab-1.md` and `lab-2.md` stay untouched. Leave the dev
server running: Astro regenerates the collection types when the config changes,
and that is what types `entry.data.kind` in the next step.

---

## 5. Step 2 — Helpers (`src/lib/labs.ts`)

Add `labLabels()` above `getAdjacentLab()`, and filter the chain to numbered
labs:

```ts
/**
 * How a lab is named in page chrome — the header eyebrow and its breadcrumb.
 * The ІЗ has no lab number worth showing, so it is named by its kind.
 */
export function labLabels({ data }: LabEntry): { eyebrow: string; crumb: string } {
  if (data.kind === 'individual') {
    return {
      eyebrow: ['Самостійна робота', data.duration].filter(Boolean).join(' · '),
      crumb: 'ІЗ',
    };
  }
  return { eyebrow: `Лабораторна робота №${data.number}`, crumb: `ЛР-${data.number}` };
}

/**
 * Neighbours of one lab, for the footer nav. Either side may be absent.
 *
 * Only numbered labs form the chain: the ІЗ runs alongside every lab rather
 * than between two of them, so it neither gets nor appears in a prev/next link.
 */
export async function getAdjacentLab(
  slug: string,
): Promise<{ prev?: LabMeta; next?: LabMeta }> {
  const labs = (await getLabs()).filter(({ data }) => data.kind === 'lab');
  // …unchanged from here
```

For the ІЗ's own slug, `findIndex` now returns `-1`, so it gets `{}`.
`PrevNext` renders nothing when both sides are absent.

`getLabs()` itself is **not** filtered. The index needs the ІЗ in its list, and
`number: 0` already sorts it first.

---

## 6. Step 3 — The route (`src/pages/labs/[lab].astro`)

Three edits. The hard-coded `ЛР-${data.number}` and `№${data.number}` go
through the helper instead:

```ts
import { getAdjacentLab, getLabs, labHref, labLabels } from '@/lib/labs';

// …
const adjacent = await getAdjacentLab(entry.id);
const { eyebrow, crumb } = labLabels(entry);

const crumbs = [
  { label: 'Labs', href: withBase('/labs/') },
  { label: crumb, href: labHref(entry.id) },
];
```

```astro
  <LabHeader
    eyebrow={eyebrow}
    title={data.title}
    summary={data.summary}
    handout={data.handout}
  />
```

Labs 1 and 2 render byte-for-byte the same labels as before.

---

## 7. Step 4 — The `00` card (`src/pages/labs/index.astro`)

The number already renders as `00`, via
`String(lab.data.number).padStart(2, '0')`. Two small additions make the card
read as different.

**The card modifier.** Swap the static `class` for `class:list`:

```astro
              <a
                href={labHref(lab.id)}
                class:list={[
                  'lab-card glass-panel',
                  { 'lab-card--individual': lab.data.kind === 'individual' },
                ]}
              >
```

```css
  /* The ІЗ card (`00`). `number: 0` already sorts it first; the resting brand
     border marks it as the one assignment that spans the whole semester. */
  .lab-card--individual {
    border-color: var(--color-brand-blue);
  }
```

Hover still works: the card lifts and the arrow nudges. Only the border colour
is already at its hover value.

**The lead copy.** Mention the `00` slot so it doesn't look like a numbering
slip:

```astro
      <p class="hero__lead">
        Hands-on assignments that build on each lecture. Each lab is a full
        walkthrough with a downloadable handout; the individual assignment,
        pinned at 00, runs alongside them all semester.
      </p>
```

---

## 8. Step 5 — Wide tables on phones (`src/styles/lab.css`)

**The problem, measured.** At a 390px window (a 343px article column), the ІЗ
topics table's minimum width is **427px**. The whole page scrolls sideways
(`scrollWidth` 443 against a 375px viewport). `.doc-content table` has no
overflow handling, and every column is prose whose longest words
(«Нобелівських», «фотографій») set a floor.

**This is already live on Lab 1.** At 390px, three of its tables are 470px,
996px and 535px wide, and the page is **1012px** wide. The fix below repairs
that too.

**The rule.** Append to `lab.css`:

```css
/* Phones: a table wider than the column scrolls inside its own box instead of
   widening the page. Desktop keeps `display: table` on purpose — as a block,
   a narrow table shrinks to its content instead of filling the column. */
@media (max-width: 639px) {
  .lab-page .doc-content table {
    display: block;
    overflow-x: auto;
  }
}
```

**Why phones only.** Both variants were measured:

| Rule | ІЗ page @390 | Lab 1 @390 | ІЗ tables @1280 |
| --- | --- | --- | --- |
| none (today) | 443px — scrolls | 1012px — scrolls | 912 / 912 / 912 |
| `display: block` everywhere | 375 ✓ | 388 | 912 / **648** / **423** — narrow tables shrink |
| **phones only (chosen)** | **375 ✓** | **388** | **912 / 912 / 912** — unchanged |

On a phone, the prose tables all have a max-content width above 343px, so they
still fill the column. Only the ones that can't fit scroll.

The 13px Lab 1 keeps is not a table. It is two inline `code` spans holding long
URLs (`https://<username>.github.io/<repository>/`). That is a Lab 1 follow-up
(§13), not part of this change.

**Also:** the topics table uses the API name as link text, never a bare URL.
A bare URL like `https://www.nobelprize.org/about/developer-zone-2/` cannot
wrap, so it would push the table wider still.

---

## 9. Step 6 — Author the content

Create `src/content/labs/individual.md` from
[Appendix A](#appendix-a--srccontentlabsindividualmd). The body starts at `##`;
the `<h1>`, eyebrow, summary and breadcrumb all come from frontmatter.

What the frontmatter does:

| Field | Value | Used by |
| --- | --- | --- |
| `number` | `0` | sort order, `00` on the card |
| `kind` | `individual` | labels, prev/next, card modifier |
| `title` | «Індивідуальне завдання» | `<h1>`, card, `<title>` |
| `summary` | one sentence | card blurb, header summary, meta description |
| `duration` | «62 години» | the eyebrow |
| `handout` | `/labs/individual.pdf` | the download button |
| `discipline`, `level`, `format` | as in the handout | nothing yet, like Labs 1–2 (§13) |

There is no `updated` field: the handout has no «актуально станом на» date.

---

## 10. Step 7 — Publish the handout

Copy the **fixed** PDF (§0) in under a URL-safe name:

```bash
cp "/c/Users/matse/Downloads/Індивідуальне_завдання_Сучасна_веброзробка_виправлено.pdf" public/labs/individual.pdf
```

`LabHeader` turns `handout` into `withBase('/labs/individual.pdf')` with the
`download` attribute. Nothing else to wire.

---

## 11. Step 8 — Verify

```bash
npm run check
npm run build
npm run preview -- --port 4399
```

`preview` detaches as a daemon; stop it with `npx astro preview stop`.

```bash
ls dist/labs/individual
grep -o 'lab-card__index[^>]*>[0-9]*<' dist/labs/index.html   # 00, 01, 02 in that order
```

Checklist (ticked items passed in the dry run):

- [x] `astro check`: 0 errors / 0 warnings / 0 hints
- [x] `/labs/` lists `00` first with the brand border, then `01`, `02`; Lab 2
      keeps its `ТЗ` pill
- [x] `/labs/individual/`: `<html lang="uk">`, eyebrow «Самостійна робота ·
      62 години», breadcrumb `Labs › ІЗ`
- [x] No prev/next nav on the ІЗ page
- [x] Lab 1 has no "Previous" and its "Next" is still Lab 2
- [x] The download button points at `/web-development-2026/labs/individual.pdf`
- [x] The `mailto:` link and all three tables render
- [x] 390px window: no horizontal page scroll on `/labs/` or
      `/labs/individual/`; the topics table scrolls inside its box
- [x] 1280px: all three ІЗ tables fill the 912px column
- [ ] The subject-line code block has a working copy button (`data-copy-code`
      is already on the lab route's `<article>`)
- [ ] On a narrow window, `Tab` reaches the scrolling topics table and the
      arrow keys scroll it. Chromium and Firefox make scroll containers
      focusable on their own; if the browser you test doesn't, that is a
      finding
- [ ] Light theme: the 00 card's border and the table headers read well
- [ ] The downloaded PDF is the **fixed** one (§0)

For phone widths, use a real narrow window over CDP with `mobile: false`.
Device emulation with `mobile: true` misreports layout on these long pages.

---

## 12. Step 9 — Commit

The guide is already committed on `feat/individual-assignment`. Build the rest
in this order so each commit builds:

```bash
git add src/content.config.ts src/lib/labs.ts "src/pages/labs/[lab].astro" src/pages/labs/index.astro
git commit -m "Support a non-lab entry (the individual assignment) in the labs collection"

git add src/styles/lab.css
git commit -m "Scroll wide lab tables inside their box on phones"

git add src/content/labs/individual.md public/labs/individual.pdf
git commit -m "Add the individual assignment as 00 on /labs/"
```

---

## 13. Deferred / follow-ups

- **The methodology companion.** If `Методичні вказівки до індивідуального
  завдання.pdf` is to be published after its grading is reconciled (§0), it
  fits the existing `tasks` collection: `src/content/tasks/individual.md` with
  `label: "Методичка"` gives `/labs/individual/task/` and the index pill for
  free. First switch the three hard-coded `ЛР-${lab.data.number}` /
  `№{lab.data.number}` strings in `src/pages/labs/[lab]/task.astro` to
  `labLabels(lab)`, or that page reads «ЛР-0».
- **Link the stages to the labs.** §5's stages map onto the course (stage 2 ↔
  Lab 2, stage 8 ↔ Lab 1's tooling). A link in the «Етап» cell would turn the
  table into a route map. Add it once more labs exist.
- **Deadline.** The handout sets none. When one is fixed, add it to §10 and,
  if it should show on the card, a frontmatter field.
- **Lab 1 on phones.** Two inline `code` URLs still overflow by 13px at 390px.
  One rule fixes it: `overflow-wrap: anywhere` on
  `.lab-page .doc-content :not(pre) > code`. Separately, at desktop width one
  Lab 1 table is 996px in a 912px column and spills toward the ToC rail.
- **Unread frontmatter.** `discipline`, `level` and `format` are still declared
  and never rendered (carried over from the Lab 2 README §5). The ІЗ fills them
  too, so a `LabMeta` panel would pick it up for free.
- **`uk` chrome.** The breadcrumb still says "Labs" and the index is English
  above Ukrainian cards, as with Labs 1–2.

---

## Appendix A — `src/content/labs/individual.md`

Transcribed from the fixed handout (§0). Deviations are listed in Appendix B.

````markdown
---
number: 0
kind: individual
title: "Індивідуальне завдання"
summary: "Власний адаптивний і доступний вебзастосунок на HTML, CSS, JavaScript/TypeScript та REST API — від вибору теми до публікації й усного захисту."
lang: uk
discipline: "«Сучасна веброзробка: HTML, CSS, JS/TS»"
level: "3 курс, спеціальність F3 «Комп'ютерні науки»"
format: "Індивідуально"
duration: "62 години"
handout: /labs/individual.pdf
---

## 1. Тема індивідуального завдання

Розробка сучасного адаптивного та доступного вебзастосунку з використанням HTML,
CSS, JavaScript/TypeScript та REST API.

## 2. Мета

Розробити, протестувати та опублікувати власний вебзастосунок,
продемонструвавши практичне володіння основними технологіями дисципліни: HTML5,
CSS, JavaScript, TypeScript, REST API та сучасними інструментами
frontend-розробки.

## 3. Основні вимоги

Виконати такі вимоги:

- самостійно обрати та погодити предметну область;
- створити семантичну HTML5-структуру;
- реалізувати сучасне CSS-оформлення та responsive design;
- забезпечити базову Web Accessibility відповідно до WCAG 2.2;
- реалізувати інтерактивність за допомогою JavaScript;
- інтегрувати щонайменше один REST API;
- реалізувати loading та error states;
- використати TypeScript для типізації частини застосунку;
- застосувати модульну структуру проєкту та Vite/NPM;
- виконати debugging, testing та code review;
- опублікувати готовий вебзастосунок online;
- надати Git-репозиторій, README та матеріали до захисту.

### Формат вебзастосунку

Реалізувати вебзастосунок із простою структурою у форматі:

- landing page з інтерактивними елементами та даними з API; або
- простого MPA з 2–3 сторінок, наприклад: головна → каталог → детальна
  інформація.

**Не вимагається реалізація:**

- авторизації та реєстрації користувачів;
- власного backend;
- бази даних;
- складної системи адміністрування;
- повноцінного CRUD;
- складної бізнес-логіки.

Основна увага приділяється frontend-розробці, роботі з API, якості коду,
accessibility та responsive design.

## 4. Приклади предметних областей та тем вебзастосунків

Обрати одну із запропонованих тем або запропонувати власну, погодивши її з
викладачем.

| № | Предметна область / тема | Публічне API | Орієнтовний формат |
| --- | --- | --- | --- |
| 1 | **Каталог книжок** — пошук та перегляд інформації про книги | [Open Library API](https://openlibrary.org/developers/api) — відкритий API з даними про книги, авторів і видання, з пошуком та обкладинками | MPA: каталог → детальна інформація |
| 2 | **Каталог серіалів** — пошук серіалів та перегляд інформації про них | [TVmaze API](https://www.tvmaze.com/api) — REST API для пошуку шоу, епізодів, акторського складу та рейтингової інформації | MPA: пошук → список → details |
| 3 | **Каталог рецептів** — пошук, фільтрація та перегляд рецептів | [DummyJSON Recipes API](https://dummyjson.com/docs/recipes) — готовий набір даних із рецептами, пошуком, фільтрацією, сортуванням і пагінацією | Landing + каталог або MPA |
| 4 | **Сервіс прогнозу погоди для подорожей** — прогноз для обраного міста | [Open-Meteo API](https://open-meteo.com/en/docs) — weather forecast та geocoding API без API key | Landing: пошук міста → прогноз |
| 5 | **Каталог порід собак** — перегляд порід та галерея фотографій | [Dog API](https://dog.ceo/dog-api/documentation/) — відкритий API з переліком порід, пошуком за породою та зображеннями | Landing + галерея / MPA |
| 6 | **Каталог Pokémon** — список персонажів та детальна інформація | [PokéAPI](https://pokeapi.co/docs/v2) — безкоштовний відкритий REST API з даними про персонажів, типи, навички та спрайти | MPA: каталог → details |
| 7 | **Віртуальна галерея мистецтва** — пошук та перегляд творів мистецтва | [Art Institute of Chicago API](https://api.artic.edu/docs/) — публічний REST-style API у JSON з даними про твори мистецтва | Landing + gallery + details |
| 8 | **Каталог Нобелівських лауреатів** — пошук та перегляд інформації про лауреатів і премії | [Nobel Prize API](https://www.nobelprize.org/about/developer-zone-2/) — публічний API з даними про лауреатів, премії та відповідні об'єкти | MPA: список → details |
| 9 | **Конвертер валют** — порівняння та конвертація валют | [Frankfurter API](https://frankfurter.dev/) — API курсів валют з поточними та історичними значеннями | Landing page |
| 10 | **Каталог космічних запусків та подій** — перегляд майбутніх запусків | [Launch Library 2 API](https://ll.thespacedevs.com/2.0.0/) — публічний API з інформацією про запуски, події, місії та космічні апарати | Landing + список запусків + details |

### Рекомендації щодо вибору теми

Обрати тему, що дає можливість продемонструвати:

- отримання даних через REST API;
- пошук, фільтрацію або сортування;
- відображення списку даних;
- перегляд детальної інформації;
- щонайменше 3 інтерактивні сценарії;
- loading та error states;
- responsive та accessible interface.

## 5. Етапи виконання та розподіл часу

| № | Етап | Години |
| --- | --- | --- |
| 1 | Аналіз предметної області, структура проєкту, семантичний HTML5 | 5 |
| 2 | CSS, Box Model, cascade, specificity, CSS Variables | 5 |
| 3 | SEO, Web Accessibility, responsive design | 8 |
| 4 | JavaScript, DOM, Events, модулі, debugging | 9 |
| 5 | REST API, Fetch/async-await, loading/error states | 9 |
| 6 | TypeScript та типізація API/коду | 8 |
| 7 | Типізація існуючого коду, рефакторинг та code review | 6 |
| 8 | Vite/NPM, Git, ESLint, Prettier, testing, deployment | 6 |
| 9 | Комплексне доопрацювання та підготовка до захисту | 6 |
| | **Разом** | **62** |

## 6. Результати, які необхідно подати

Обов'язково:

1. Git-репозиторій із вихідним кодом.
2. Опублікований вебзастосунок із доступним URL.
3. README, що містить призначення проєкту, використані технології, API,
   інструкцію запуску, опис основної функціональності та короткий технічний
   звіт із описом реалізованих рішень.
4. Захист роботи з демонстрацією застосунку та поясненням коду.

## 7. Мінімальні вимоги до вебзастосунку

- містити семантичну HTML5-структуру;
- мати адаптивний інтерфейс;
- використовувати CSS Variables та сучасні CSS Layout;
- містити щонайменше 3 інтерактивні сценарії;
- отримувати та відображати дані з REST API;
- обробляти loading та error states;
- містити TypeScript-код;
- мати базові тести;
- пройти базову перевірку accessibility;
- бути опублікованим online.

## 8. Захист

Під час захисту:

- продемонструвати роботу вебзастосунку;
- показати Git-репозиторій;
- пояснити структуру проєкту;
- пояснити ключові фрагменти HTML, CSS, JavaScript/TypeScript;
- продемонструвати роботу REST API;
- продемонструвати debugging та testing;
- обґрунтувати основні технічні рішення;
- відповісти на запитання щодо власного коду.

## 9. Оцінювання

| Критерій | Бали |
| --- | --- |
| HTML, семантика та структура | 10 |
| CSS, layout та responsive design | 15 |
| SEO та Web Accessibility | 10 |
| JavaScript, DOM та Events | 15 |
| REST API та асинхронний JS | 15 |
| TypeScript | 10 |
| Testing, debugging та code quality | 20 |
| Deployment, README та оформлення проєкту | 5 |
| **Разом** | **100** |

> **Обов'язкова умова зарахування.** Для зарахування роботи надати
> працездатний проєкт, Git-репозиторій, опубліковану версію вебзастосунку та
> продемонструвати здатність пояснити власний код і використані технічні
> рішення.

## 10. Подання роботи

Роботу необхідно надіслати електронним листом на адресу
[denys.matsevych@oa.edu.ua](mailto:denys.matsevych@oa.edu.ua).

**Тема листа:**

```
[Веб] Індивідуальне завдання
```

У листі вказати:

- посилання на Git-репозиторій;
- посилання на опублікований вебзастосунок.
````

---

## Appendix B — Where the page departs from the PDF

Everything not listed is word-for-word.

| PDF | Page | Why |
| --- | --- | --- |
| University / department header, specialty-year-hours strip, «Навчальна дисципліна» line | Frontmatter (`discipline`, `level`, `duration`); the hours show in the eyebrow | Page chrome, not body; same as Labs 1–2 |
| ALL-CAPS section headings | Sentence case, numbers kept | Matches Labs 1–2; numbers stay so «розділ 4» means the same in both |
| «Самостійно обрати…» (the only capitalised bullet) | Lower-cased | List consistency |
| «Формат вебзастосунку», «Рекомендації щодо вибору теми» (bold lines) | `###` headings | Real subsections; they land in the "On this page" rail |
| «Не вимагається реалізація:» | Bold lead-in paragraph | A label for the list, not a section |
| Topics table: title and subtitle on two lines; API name, description and bare URL on three | One line per cell: **title** — subtitle; [API name](url) — description | Markdown cells are single-line; linking the name keeps unbreakable URLs out of the table (§8) |
| Nobel URL `…/organization/developer-zone-2/` | `…/about/developer-zone-2/` | The old URL redirects there |
| «Обов'язкова умова зарахування» (bold heading + paragraph) | Blockquote callout | Same treatment as Lab 2's «Важливо!» |
| Email address as plain text | `mailto:` link | One tap on a phone |
| Subject line as plain text | Code block (copy button) | Students copy it verbatim |
| Footer «НУОА • ННІ ІТ та бізнесу • Кафедра ІТАД / Сторінка N з 4» | Dropped | Print artefact |

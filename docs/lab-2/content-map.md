# Lab 2 — content map

Where every section of the two source PDFs lands in Markdown, plus the spec's
`:root` block transcribed verbatim so nobody has to re-type it out of a PDF.

Read [README.md](README.md) first for the split decision; this file assumes
the ТЗ lives at `/labs/lab-2/task/`.

---

## 0. Authoring conventions

Carried over from `src/content/labs/lab-1.md` — match them or the two labs will
not read as one set.

| Rule | Why |
| --- | --- |
| Body starts at `##`. No `<h1>` in the Markdown. | The route renders the `<h1>` from frontmatter. A second one breaks the document outline. |
| `##` for numbered sections, `###` for subsections (`4.1.`, `4.2.`). | `OnThisPage` filters to `h2`/`h3`; `h4` would silently vanish from the rail. |
| Keep the source's numbering in the heading text (`## 4. Дослідницькі завдання`). | Students read the PDF and the page side by side; matching numbers make that possible. |
| Wrap prose at ~80 columns. | Every other content file in the repo does. |
| Ukrainian body, English chrome. | Existing site behaviour; see README §6. |
| `> **Важливо!** …` blockquote for the source's callouts. | `.doc-content blockquote` already styles a left brand-blue rule. |
| Inline `` `code` `` for CSS identifiers (`box-sizing`, `.btn--primary`). | `.doc-content :not(pre) > code` is styled; bare text is not. |

### Heading anchors: a caveat worth knowing

Astro slugs headings with `github-slugger`, which keeps Cyrillic. So
`## 4. Дослідницькі завдання` becomes `#4-дослідницькі-завдання` — it works, and
the ToC links work, but a copied URL percent-encodes into something unreadable.
Lab 1 already behaves this way, so this is consistency, not a regression.

Related: `src/styles/global.css` styles `.doc-content :is(h2, h3, h4) .anchor`,
but no plugin emits an anchor element — there is currently no click-to-link
affordance on any heading. Adding `rehype-autolink-headings` is listed as a
follow-up in [implementation.md](implementation.md); with two long,
deeply-sectioned pages shipping, it is more valuable now than it was at Lab 1.

---

## 1. `src/content/labs/lab-2.md`

### 1.1. Frontmatter

```yaml
---
number: 2
title: "Основи CSS: Box Model, Cascade, Specificity та AI-assisted верстка"
summary: "Дослідження базових механізмів CSS — Box Model, Cascade, Specificity, Inheritance та CSS Variables — і AI-assisted верстка адаптивної секції тарифних планів."
lang: uk
discipline: "«Сучасна веброзробка: HTML, CSS, JS/TS»"
level: "3 курс, спеціальність «Комп'ютерні науки»"
format: "Індивідуально"
duration: "2 академічні години (практична частина — на занятті)"
updated: 2026-09-18
handout: /labs/lab-2.pdf
---
```

| Field | Source |
| --- | --- |
| `number`, `title` | PDF title page |
| `summary` | Written — condenses §1 "Мета роботи" |
| `discipline`, `level`, `format` | **Inferred** from `lab-1.md`; the Lab 2 PDF carries no header block. Confirm before publishing. |
| `duration` | **Inferred** from §5: «Практична реалізація макету виконується під час лабораторного заняття» |
| `updated` | Today — the Lab 2 PDF has no "актуально станом на" line |
| `handout` | Only valid after step 10 of implementation.md publishes the PDF |

### 1.2. Section map

| PDF § | Markdown heading | Shape | Notes |
| --- | --- | --- | --- |
| 1 | `## 1. Мета роботи` | 1 paragraph | Verbatim |
| 2 | `## 2. Цілі та результати навчання` | lead-in + 6 bullets | Verbatim |
| 3 | `## 3. Завдання лабораторної роботи` | 4 numbered items | Verbatim. Item 2 gains an inline link to the ТЗ page. |
| 4 | `## 4. Дослідницькі завдання` | italic lead + 6 `###` | The bulk of the page — see §1.3 |
| 4.1 | `### 4.1. Box Model` | 3 bullets | Bullet 1 → web.dev link |
| 4.2 | `### 4.2. Cascade` | 3 bullets | |
| 4.3 | `### 4.3. Specificity` | 3 bullets | Keep the `(0,0,0)` notation and the DevTools screenshot requirement |
| 4.4 | `### 4.4. Inheritance` | 3 bullets | |
| 4.5 | `### 4.5. CSS Variables` | 3 bullets | |
| 4.6 | `### 4.6. Повторне використання стилів і рефакторинг` | 2 bullets | Both are bolded labels — `**Дослідження:**`, `**Дослідницьке запитання:**` |
| 5 | `## 5. Практична частина` | **Rewritten — see §1.4** | Shrinks; the spec moves out |
| 6 | `## 6. Вимоги до звіту` | subject line + links + 5 bullets | See §1.5 |
| 7 | `## 7. Усний захист` | 1 paragraph + 5 bullets | Verbatim |
| 8 | `## 8. Оцінювання` | 2 items, one nested | Surface the date — see §1.6 |

### 1.3. Section 4 — the research tasks

Each subsection follows the same three-beat shape, and keeping it identical
across all six is what makes the section skimmable:

1. **Опрацювати** — the reading, as a link.
2. **The experiment** — what to build and change.
3. **The question** — what to explain in the report.

Source links, as hyperlinked in the PDF:

| Subsection | Link text | URL |
| --- | --- | --- |
| 4.1 | CSS Box Model — web.dev | `https://web.dev/learn/css/box-model` |
| 4.2 | The Cascade — web.dev | `https://web.dev/learn/css/the-cascade` |
| 4.3 | Specificity — web.dev | `https://web.dev/learn/css/specificity` |
| 4.4 | Inheritance — web.dev | `https://web.dev/learn/css/inheritance` |
| 4.5 | CSS Custom Properties на web.dev | **Verify** — see below |

> **Check every one of these in a browser before committing.** The PDF renders
> them as styled link text, not as visible URLs, so the four above are the
> canonical `web.dev/learn/css/` module paths rather than extracted hrefs. 4.5 is
> the shaky one: web.dev's Learn CSS covers custom properties inside its
> **Functions** module rather than at a `/variables` path. If no stable web.dev
> page fits, link MDN's
> [Using CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascading_variables/Using_CSS_custom_properties)
> and say so in the text — a working link to a good page beats a dead link to
> the assigned one.

### 1.4. Section 5 — the rewrite

This is the only section whose content genuinely changes. What **stays** on the
lab page:

- the framing paragraph ("Виконати верстку вебсторінки на основі запропонованого
  макету", AI tools allowed, responsibility for quality stays with the student);
- the `> **Важливо!**` callout about the work being done in class;
- the six numbered **Вимоги до фінальної реалізації** (Box Model, Inheritance,
  Specificity, CSS Variables, reuse, DRY) — these are code-quality rules the
  student is graded on verbally, so they belong with the lab, not the spec;
- one sentence handing off to the ТЗ.

What **moves** to `tasks/lab-2.md`: the mockup, the plan data, the HTML
skeleton, the `:root` block, the breakpoint, the AI prompt, the acceptance table
and the demo checklist — none of which appear in the lab PDF's §5 anyway. They
come from the ТЗ PDF, which is exactly why the split is natural rather than
imposed.

The route renders `TaskCard` above the article body, so the hand-off is visible
before the reader reaches §5. Section 5 still ends with an inline link for the
reader who is scrolling rather than scanning:

```markdown
Повний опис макета, структура HTML, набір CSS-змінних, точка адаптивності та
критерії приймання винесені в окремий документ:
[Технічне завдання — секція тарифних планів](/labs/lab-2/task/).
```

That root-relative href only resolves on GitHub Pages after step 4 of
[implementation.md](implementation.md) registers the base-links plugin. Without
it the link 404s under `/web-development-2026/`.

### 1.5. Section 6 — report requirements

The email subject must be transcribed exactly; it is how the instructor filters
submissions. It is shortened from the handout's long title:

```
[Веб] ЛР-2: Основи CSS
```

Then the three links, as a code-fenced block so the placeholders stay literal.
Both blocks get a copy-to-clipboard button (`data-copy-code` on the lab
article, wired in `src/scripts/docs.ts`):

```
GitHub repository: https://github.com/<username>/<repository>
GitHub Pages: https://<username>.github.io/<repository>/
Vercel: https://<project>.vercel.app/
```

Then the `> **Важливо!**` callout — the report *is* the deployed layout — plus
the five things a student must be able to explain (розмір елемента, яке правило
перемогло, чому властивість успадкувалася, навіщо CSS Variable, чому стиль у
спільному класі), and the DevTools screenshot requirement (Elements, Styles,
Computed).

### 1.6. Section 8 — grading

Two items in the PDF; render the date so it cannot be missed:

- Успішний захист — **2 бали**
- Додатковий **1 бал**: здача до **23.09.2026** АБО робота на парі

> Today is 2026-09-18 — the bonus deadline is five days out. Worth putting the
> date in the `facts` chips on the ТЗ page (implementation.md step 7) as well as
> here, rather than leaving it in the last section of a long page.

---

## 2. `src/content/tasks/lab-2.md`

### 2.1. Frontmatter

```yaml
---
title: "Секція тарифних планів"
summary: "Адаптивна секція із заголовком, лідом і трьома картками тарифів. Лише HTML і CSS — JavaScript не потрібен."
goal: "Створити просту адаптивну секцію тарифних планів за наданим макетом і свідомо застосувати Box Model, Cascade, Specificity, Inheritance, CSS Variables та повторне використання стилів."
lang: uk
label: "ТЗ"
highlights:
  - "Без JavaScript"
  - "3 картки"
  - "Брейкпоінт 768px"
  - "Бонус до 23.09.2026"
updated: 2026-09-18
handout: /labs/lab-2-task.pdf
---
```

`goal` is the ТЗ's "Мета практичної частини" box, rendered by the route as a
lead callout rather than as body text — it is the one paragraph that answers
"what am I even building". `highlights` are the constraint chips on the hand-off
card, and `label` is the badge reused by the card, the breadcrumb and the index
pill. The full schema is in [implementation.md step 1](implementation.md).

The file is named `lab-2.md` because **the id is the join key**: `tasks/lab-2`
belongs to `labs/lab-2`. Nothing else links them.

### 2.2. Section map

| ТЗ § | Markdown heading | Shape |
| --- | --- | --- |
| 1 | `## 1. Загальна ідея` | 1 paragraph + `<PricingMockup />` + the plan list |
| 2 | `## 2. HTML-структура` | 1 paragraph, no code |
| 3 | `## 3. CSS Variables` | 1 paragraph + the `:root` block |
| 4 | `## 4. Обов'язкові вимоги до CSS` | 5 labelled requirements, no code |
| 5 | `## 5. Розташування та адаптивність` | 1 paragraph, no code |
| 6 | `## 6. AI-assisted розробка` | prompt callout + 7-item checklist |
| 7 | `## 7. Критерії приймання` | 10-row table |
| 8 | `## 8. Що показати під час перевірки` | 5 bullets + closing callout |

**The mockup is not in this Markdown.** A `.md` body cannot host a component, so
the route renders `PricingMockup` *above* `.doc-content` — before `## 1.`, not
inside it. That is the better placement anyway: the picture is the first thing
on the page, and its plan names stay out of the "On this page" rail and out of
`.doc-content` typography. Promoting this one file to `.mdx` would allow
mid-body placement, but it adds a dependency for no real gain.

Section 1 therefore keeps its prose and the plan list, and simply describes what
the reader can already see above it.

### 2.3. Plan data (ТЗ §1)

| План | Ціна | Можливості | Кнопка | Акцент |
| --- | --- | --- | --- | --- |
| Basic | $10 / month | 1 User; 5GB Storage; Basic Support | `Select` | — |
| Pro | $29 / month | 5 Users; 50GB Storage; Priority Support | `Get Started` | Виділена картка, бейдж `PRO • ACTIVE` |
| Enterprise | $99 / month | Unlimited; 1TB Storage; 24/7 Support | `Contact` | — |

Feature items carry a `✓` prefix in the mockup. This same table drives the
`plans` array in `PricingMockup.astro` — keep the two in sync or the spec and
the picture will disagree.

### 2.4. The one code block — transcribe verbatim

The page keeps only the `:root` block. The PDF's other examples — the HTML
skeleton, the button classes, and the Box Model, Inheritance and grid/breakpoint
snippets — are deliberately left out; their sections stay as prose with inline
`` `code` ``.

**CSS Variables** (ТЗ §3) — the full `:root`, all 20 declarations, blank lines
between the groups preserved:

````markdown
```css
:root {
  --color-primary: #2563eb;
  --color-primary-hover: #1d4ed8;
  --color-surface: #ffffff;
  --color-background: #f8fafc;
  --color-text-main: #0f172a;
  --color-text-muted: #64748b;
  --color-border: #e2e8f0;
  --color-accent: #f59e0b;

  --font-family-base: 'Inter', sans-serif;
  --font-size-base: 16px;
  --font-size-h1: 2.5rem;
  --font-size-h2: 1.5rem;
  --font-size-small: 0.875rem;

  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --border-radius: 12px;
}
```
````

### 2.5. AI prompt (ТЗ §6)

Render as a blockquote callout, not a code block — it is meant to be read and
adapted, not copied byte-for-byte:

> **Приклад запиту.** Створи HTML та CSS для секції тарифних планів із трьома
> картками Basic, Pro та Enterprise. Використай семантичний HTML, CSS Variables,
> спільний клас кнопки та просту адаптивність.

Followed by the 7-item "Після генерації студент повинен" checklist: перевірити
структуру HTML; перевірити Box Model і розміри карток; перевірити каскад і
специфічність селекторів; прибрати дублювання CSS; винести повторювані значення
у CSS Variables; перевірити адаптивність у браузері; переробити код там, де AI
створив зайву або складну конструкцію.

### 2.6. Acceptance table (ТЗ §7)

All ten rows, verbatim:

| Компонент / вимога | Що перевіряється |
| --- | --- |
| Структура | Заголовок, опис, 3 тарифні картки, кнопки. |
| Basic | $10 / month; 1 User; 5GB Storage; Basic Support. |
| Pro | $29 / month; 5 Users; 50GB Storage; Priority Support; візуальний акцент. |
| Enterprise | $99 / month; Unlimited; 1TB Storage; 24/7 Support. |
| CSS Variables | Кольори, шрифти, відступи винесено у `:root`. |
| Box Model | `box-sizing: border-box`; коректні padding/border/розміри. |
| Inheritance | Спільні властивості успадковуються від `body`. |
| Reuse / DRY | Спільні класи для карток і кнопок; мінімум дублювання. |
| Responsive | До 768px картки стають у один стовпчик. |
| AI-assisted | Код перевірений і відрефакторений студентом. |

### 2.7. Demo checklist (ТЗ §8)

Five bullets — відкрити DevTools і показати Box Model однієї картки; показати
правило, яке перемогло у каскаді/специфічності, та пояснити чому; показати
успадковану властивість (`font-family`); змінити одну CSS Variable у `:root` і
показати ефект; показати спільний клас кнопки або картки.

Close with the ТЗ's own summary box:

> **Підсумок.** Результатом має бути проста, акуратно зверстана і адаптивна
> секція тарифів. Головне під час виконання — не кількість стилів, а розуміння
> того, як CSS формує розміри, каскад, успадкування та повторне використання.

---

## 3. Transcription gotchas

The PDFs are Google-Docs exports; a few characters will not survive a naive
copy-paste.

| Watch for | Correct form |
| --- | --- |
| Apostrophe in `Обов'язкові`, `Комп'ютерні` | U+2019 `’`, not `'` — match `lab-1.md`, which uses `’` |
| Quotation marks around Ukrainian titles | `«…»`, not `"…"` |
| Dashes | `—` (em dash) in prose, `–` (en dash) in ranges like `2–4` |
| `✓` in feature lists | U+2713, not the letter `v` |
| `•` in `PRO • ACTIVE` | U+2022 |
| `$10 / month` | Spaces around `/` exactly as printed |
| Non-breaking spaces | The export sprinkles U+00A0; normalise to plain spaces or Prettier diffs will churn |

A quick check after authoring:

```bash
grep -nP "[\x{00A0}\x{200B}]" src/content/labs/lab-2.md src/content/tasks/lab-2.md
```

Empty output means clean.

---

## 4. The gap this content map cannot close

## 4. Where the theory links point

**Inline, in the lab's own text — never a separate chapter.** This is a settled
convention, not a stopgap: the `/tutorial/` handbook is being removed, and every
source a lab needs is a link inside the sentence that needs it, exactly the way
the PDFs do it. Section 4's six subsections each open with their own
**Опрацювати** link (§1.3 above); there is no "further reading" section and
none should be added.

That leaves two things true of Lab 2 that are worth knowing while authoring, and
neither changes the convention:

- The CSS lesson **has been delivered**, but its deck is not in this repo —
  `src/data/lectures/` holds only `lecture-1.ts` (вступ, HTTP, DOM) and
  `lecture-2.ts` (семантичний HTML5, SEO, a11y). There is no `/lectures/` route
  for CSS to link at yet. Adding one is a `lecture-3.ts` plus a registry entry
  (procedure in the header comment of `src/data/lectures/index.ts`); when it
  lands, the natural place for the link is §1 or §3 of the lab body, inline.
- The handbook's CSS articles are placeholders and are going away regardless, so
  do **not** link them from Lab 2 even as a temporary measure.

So every outbound link in this lab goes to web.dev or MDN, which is what the
assignment names anyway. The base-links plugin from
[implementation.md step 4](implementation.md) is still needed — not for theory
links, but for the one internal link in §5 that points at the ТЗ page.

---

## 5. Before committing the content

- [ ] Both files start at `##`, no `<h1>`.
- [ ] Every `###` is numbered to match the PDF.
- [ ] All five web.dev links open (4.5 especially — see §1.3).
- [ ] The `:root` block has all 20 declarations and the group blank lines.
- [ ] Plan data in `tasks/lab-2.md` matches the `PLANS` array in `PricingMockup.astro`.
- [ ] Acceptance table has all 10 rows.
- [ ] `grep` for non-breaking / zero-width characters returns nothing.
- [ ] `npm run check` passes — a frontmatter typo fails the collection schema here, not at runtime.
- [ ] The ТЗ link in lab §5 resolves under the `/web-development-2026/` base.

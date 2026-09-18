# Lab 2 — implementation guide

Step-by-step build of `/labs/lab-2/` (the lab) and `/labs/lab-2/task/` (the ТЗ),
following the decision recorded in [README.md](README.md).

Written against the repo at `9189d91` on branch `feat/lab-2` — Astro 7,
Tailwind v4, the single merged project. Every step reuses a pattern Lab 1
already shipped; nothing here adds a dependency.

| | |
| --- | --- |
| New files | `src/content/labs/lab-2.md`, `src/content/tasks/lab-2.md`, `src/components/{LabHeader,LabMeta,TaskCard,PricingMockup,MockupLightbox,AcceptanceChecklist}.astro`, `src/pages/labs/[lab]/task.astro`, `plugins/base-links.mjs` |
| Edited | `src/content.config.ts`, `src/lib/labs.ts`, `src/pages/labs/[lab].astro`, `src/pages/labs/index.astro`, `astro.config.mjs`, `package.json`, `src/content/labs/lab-1.md` |
| Assets | `public/labs/lab-2.pdf`, `public/labs/lab-2-task.pdf`, `public/labs/lab-1.pdf` |

---

## 0. Before you start

One input is **not** in the repo yet:

**The source PDFs.** `find . -name "*.pdf"` returns nothing and `public/` holds
only `favicon.svg`. Keep
`Лабораторна робота №2_ Основи CSS та AI-assisted верстка.pdf` and
`ТЗ_ЛР2_Секція_тарифних_планів.pdf` wherever they are until
[Step 10](#10-step-10--publish-the-pdfs) copies them in under URL-safe names.
`public/labs/` is not gitignored, so they will be tracked once copied.

Everything else you need is here or in [content-map.md](content-map.md), which
holds the prose and the verbatim `:root` block that
[Step 3](#3-step-3--author-the-two-markdown-files) puts into the two Markdown
bodies. This guide owns the frontmatter and the heading skeletons; the map owns
the content. Where they overlap, **the map wins** — it was written against the
PDFs directly.

Every step below can be built and type-checked today. Start the dev server and
leave it running — Astro regenerates `.astro/types.d.ts` when the content config
changes, which is what makes `CollectionEntry<'tasks'>` resolve:

```bash
npm run dev
```

---

## 1. Step 1 — Register the `tasks` collection

Edit [src/content.config.ts](../../src/content.config.ts). Leave `docs` and
`labs` untouched; add `tasks` above the export, then extend the export object.

```ts
/**
 * The `tasks` collection — one practical brief (ТЗ) per lab, under
 * `src/content/tasks/`. The entry id **is** the owning lab's id (`lab-2`), and
 * that is the whole relation: no `lab:` field to keep in sync, and the route
 * `/labs/<id>/task/` falls straight out of the id.
 *
 * A brief lives outside its lab because the two are read differently — the lab
 * once, top to bottom; the brief kept open beside the editor for two hours.
 * See docs/lab-2/README.md §3.
 */
const tasks = defineCollection({
  // ids look like "lab-2" — the owning lab's id, ".md" stripped.
  loader: glob({ pattern: '**/*.md', base: './src/content/tasks' }),
  schema: z.object({
    /** Brief title (Ukrainian) — `<h1>` / card heading / `<title>` base. */
    title: z.string(),
    /** One-line description — hand-off card blurb + meta description. */
    summary: z.string(),
    /**
     * The brief's "Мета практичної частини" box — the one paragraph that
     * answers "what am I building". Rendered as a lead callout by the route,
     * above the body, so it is never scrolled past.
     */
    goal: z.string().optional(),
    /** BCP-47 language of the body — drives `<html lang>`. */
    lang: z.string().default('uk'),
    /** Short badge: hand-off card, index pill, last breadcrumb. */
    label: z.string().default('ТЗ'),
    /** Constraint chips on the hand-off card — 2–4 short phrases. */
    highlights: z.array(z.string()).default([]),
    /** "Актуально станом на" date from the brief. */
    updated: z.coerce.date().optional(),
    /** Path (no base prefix) to the downloadable brief, if published. */
    handout: z.string().optional(),
    /** Hidden from the lab page and un-routed while true. */
    draft: z.boolean().default(false),
  }),
});

export const collections = { docs, labs, tasks };
```

> **Why a collection rather than a second file in `labs/`.** A brief is not a
> lab: it has no `number`, it must never appear on the labs index as its own
> card, and it must never enter `getAdjacentLab()`'s prev/next chain. A separate
> collection gets all three for free.

---

## 2. Step 2 — Extend `src/lib/labs.ts`

Append to [src/lib/labs.ts](../../src/lib/labs.ts). The lab helpers stay exactly
as they are; this adds the task half of the module. No new imports —
`getCollection`, `CollectionEntry` and `withBase` are already imported at the
top of the file.

```ts
export type TaskEntry = CollectionEntry<'tasks'>;

export interface TaskMeta {
  /** Collection id — the owning lab's id, e.g. `lab-2`. */
  slug: string;
  title: string;
  summary: string;
  label: string;
  highlights: string[];
  /** `withBase('/labs/<slug>/task/')` — drop straight into an `href`. */
  href: string;
}

/** `withBase` applied to a lab's practical brief. */
export function taskHref(slug: string): string {
  return withBase(`/labs/${slug}/task/`);
}

export function toTaskMeta(entry: TaskEntry): TaskMeta {
  return {
    slug: entry.id,
    title: entry.data.title,
    summary: entry.data.summary,
    label: entry.data.label,
    highlights: entry.data.highlights,
    href: taskHref(entry.id),
  };
}

/**
 * Published briefs. Unordered on purpose — a brief is always reached through
 * its lab, never listed on its own.
 */
export async function getTasks(): Promise<TaskEntry[]> {
  return getCollection('tasks', ({ data }) => !data.draft);
}

/**
 * The brief owned by one lab, or `undefined` when the lab has none (Lab 1) or
 * its brief is still a draft. Goes through `getTasks()` rather than
 * `getEntry()` precisely so a draft brief stays unlinked everywhere.
 */
export async function getTask(labSlug: string): Promise<TaskEntry | undefined> {
  const tasks = await getTasks();
  return tasks.find((entry) => entry.id === labSlug);
}
```

---

## 3. Step 3 — Author the two Markdown files

Two new files. **`#` is reserved for the page `<h1>`**, which the routes render
from frontmatter, so both bodies start at `##` — the same convention as
`labs/lab-1.md` and every `docs/**/*.md`.

### 3.1. `src/content/labs/lab-2.md`

```markdown
---
number: 2
title: "Основи CSS: Box Model, Cascade, Specificity та AI-assisted верстка"
summary: "Box model, каскад і специфічність на практиці: шість дослідницьких експериментів у DevTools і адаптивна секція тарифних планів, зверстана з AI-асистентом."
lang: uk
discipline: "«Сучасна веброзробка: HTML, CSS, JS/TS»"
level: "3 курс, спеціальність «Комп'ютерні науки»"
format: "Індивідуально"
duration: "2 академічні години (аудиторно)"   # inferred — see content-map.md §1.1
updated: 2026-09-18                           # inferred — the handout has no "станом на" line
handout: /labs/lab-2.pdf
---

## 1. Мета роботи
## 2. Цілі та результати навчання
## 3. Завдання лабораторної роботи
## 4. Дослідницькі завдання
### 4.1. Box Model
### 4.2. Cascade
### 4.3. Specificity
### 4.4. Inheritance
### 4.5. CSS Variables
### 4.6. Повторне використання стилів і рефакторинг
## 5. Практична частина
## 6. Вимоги до звіту
## 7. Усний захист
## 8. Оцінювання
```

The body itself comes from [content-map.md §1](content-map.md) — the section
map, the five web.dev links (one of which needs verifying) and the authoring
conventions live there so they exist in exactly one place. Two rules are worth
repeating here because they shape the frontmatter above:

- the header block (дисципліна / рівень / формат / тривалість) belongs in
  frontmatter, not the body — it is data, and `LabMeta` renders it;
- document sections `1.`–`8.` → `##`, `4.1`–`4.6` → `###`, because `OnThisPage`
  filters to `h2`/`h3` and an `h4` would vanish from the rail.

**Section 5 shrinks.** Per [README §3.4](README.md) it keeps only the framing,
the six code-quality requirements and the note that the work is done in class,
then hands off:

```markdown
Повна специфікація — в окремому документі:
[технічне завдання «Секція тарифних планів»](/labs/lab-2/task/).
```

That root-relative link is what [Step 4](#4-step-4--base-aware-links-in-markdown)
exists for. Never hardcode `/web-development-2026`.

### 3.2. `src/content/tasks/lab-2.md`

```markdown
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
updated: 2026-09-18                           # inferred — the brief has no "станом на" line
handout: /labs/lab-2-task.pdf
---

## 1. Загальна ідея
## 2. HTML-структура
## 3. CSS Variables
## 4. Обов'язкові вимоги до CSS
## 5. Розташування та адаптивність
## 6. AI-assisted розробка
## 7. Критерії приймання
## 8. Що показати під час перевірки
```

Two notes specific to this body:

- **The mockup is not in the Markdown.** Section 1 keeps its prose and the plan
  table; the rendered mockup is composed in by the route
  ([Step 7](#7-step-7--the-тз-route)) above the first heading, so it never lands
  in the "On this page" rail and never inherits `.doc-content` typography.
- **Only the `:root` block is code**, tagged `css` and transcribed verbatim —
  students copy from it, and a silent typo costs them an hour. The PDF's other
  examples (section skeleton, button classes, requirement snippets,
  grid/breakpoint) are deliberately left out of the page.

### Checkpoint

`/labs/lab-2/` already renders and `/labs/` lists it — the `labs` collection
routes it with no code change. The brief has no route yet.

---

## 4. Step 4 — Base-aware links in Markdown

The site is a GitHub Pages **project** site: every URL carries
`base: '/web-development-2026'`. Components go through `withBase()`, but a
Markdown body cannot — `[…](/labs/lab-2/task/)` ships as-is and 404s in
production while working perfectly in `npm run dev` (where the base is served
too, but a stray root-relative link still resolves during local navigation).
Lab 1 never hit this because its body contains no internal links; Lab 2's does.

> **Not a rehype plugin.** Astro 7.3 compiles Markdown with **Sätteri**, not
> `unified`. `markdown.rehypePlugins` now fails the build outright —
> `@astrojs/markdown-remark` is no longer installed by default — and installing
> it would swap the site's entire Markdown pipeline back to `unified` to run one
> five-line transform, changing heading ids, smart punctuation and highlighting
> along the way. Sätteri takes its own hast plugins, so the rewriter is written
> against that API: a visitor object whose tag filter is applied in Rust, with
> only the handful of link-bearing elements crossing into JS.

Create `plugins/base-links.mjs`:

```js
/**
 * base-links — prefix root-relative URLs in Markdown bodies with the site's
 * `base`, so a body can write `[ТЗ](/labs/lab-2/task/)` and still work under
 * the GitHub Pages project path.
 *
 * A Sätteri hast plugin, not a rehype one: Astro 7 runs Markdown through
 * Sätteri by default, and `markdown.rehypePlugins` would drag the whole site
 * back onto the `unified` pipeline. The filter is applied in Rust, so only the
 * handful of link-bearing elements ever crosses into JS.
 *
 * Left alone: absolute URLs, protocol-relative `//host/…`, `#anchors`,
 * `mailto:`/`tel:`, and anything already prefixed (so the plugin is
 * idempotent). `srcset` is not rewritten — no Markdown body uses it yet.
 */
const URL_ATTRS = {
  a: 'href',
  area: 'href',
  img: 'src',
  source: 'src',
  video: 'src',
  audio: 'src',
  iframe: 'src',
};

export default function baseLinks({ base = '' } = {}) {
  const prefix = base.replace(/\/$/, '');
  if (!prefix) return null;

  return {
    name: 'base-links',
    element: {
      filter: Object.keys(URL_ATTRS),
      visit(node, ctx) {
        const attr = URL_ATTRS[node.tagName];
        const value = node.properties?.[attr];

        if (
          typeof value !== 'string' ||
          !value.startsWith('/') ||
          value.startsWith('//') ||
          value === prefix ||
          value.startsWith(`${prefix}/`)
        ) {
          return;
        }

        ctx.setProperty(node, attr, `${prefix}${value}`);
      },
    },
  };
}
```

Returning `null` when no base is configured is the documented way to opt a
plugin out for a compile — `hastPlugins` accepts it and skips the entry.

Register it in [astro.config.mjs](../../astro.config.mjs). `satteri()` is
already the default processor; it is named explicitly only so the rewriter can
join its pipeline. The base string becomes a single constant so the config and
the plugin cannot drift — the plugin runs in the Markdown pipeline, outside
Vite, so `import.meta.env.BASE_URL` is not available to it and the value must be
passed in:

```js
import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import tailwindcss from '@tailwindcss/vite';

import baseLinks from './plugins/base-links.mjs';

// Single source of truth for the GitHub Pages project path: `base` below and
// the Markdown link rewriter both read it.
const BASE = '/web-development-2026';

export default defineConfig({
  site: 'https://denysmatsevych.github.io',
  base: BASE,
  vite: { plugins: [tailwindcss()] },
  markdown: {
    // `satteri()` is Astro 7's default processor — named here only so the link
    // rewriter can join its pipeline. Root-relative links inside Markdown
    // bodies get the base prefix; components keep using withBase()
    // (src/lib/paths.ts).
    processor: satteri({ hastPlugins: [baseLinks({ base: BASE })] }),
  },
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'uk'],
    routing: { prefixDefaultLocale: false },
  },
});
```

`@astrojs/markdown-satteri` ships as a dependency of Astro, so nothing new is
downloaded — but importing it from the config would otherwise lean on npm
hoisting a transitive dep. Declare it in `package.json` pinned to the exact
version Astro pins, so both resolve to one copy:

```jsonc
"dependencies": {
  "@astrojs/markdown-satteri": "0.4.1",   // matches astro 7.3's own pin
  // …
}
```

Keep the existing comment block above `defineConfig` — it explains the merged
deploy and is still accurate.

---

## 5. Step 5 — `PricingMockup.astro`

New file `src/components/PricingMockup.astro`. It renders the target design so
a student can see what "done" looks like without opening the PDF.

Three constraints shape it:

- **It is a picture, not a starting point.** The plan data is the brief's, but
  the class names are the component's own (`mockup__*`) rather than the
  `.pricing-card` / `.btn` names the assignment grades, and the styles are
  Astro-scoped. A student who copies it out of DevTools gets markup that fails
  the acceptance table. This is a deliberate trade-off — see
  [README §3.3](README.md).
- **No real headings.** The visible title and plan names are `<p>`/`<span>`, so
  the page outline and the "On this page" rail stay clean.
- **It reflows on its own width, not the viewport's.** Inside the article column
  a `@media (min-width: 768px)` query would flip the mockup to three columns
  while the column itself is ~700px wide. A container query at `48rem` gives the
  honest picture of the layout the brief asks for.

```astro
---
/**
 * PricingMockup — a live render of the section the ТЗ asks for: heading, lead
 * and three plan cards, with the one-column → three-column switch the brief
 * specifies.
 *
 * A reference picture that happens to be HTML, not a reference implementation:
 * the markup carries none of the brief's class names, the styles are scoped,
 * and the card titles are not headings. The route renders it above
 * `.doc-content` so it stays out of the article's typography and its ToC.
 */
interface Plan {
  name: string;
  price: string;
  period?: string;
  features: string[];
  cta: string;
  /** The promoted middle plan. */
  featured?: boolean;
  /** Badge above a featured card. */
  badge?: string;
}

interface Props {
  heading?: string;
  lead?: string;
  plans?: Plan[];
}

/**
 * The plan table from the ТЗ, verbatim — see content-map.md §2.3. Keep the two
 * in sync: if the picture and the spec disagree, students build the picture.
 */
const PLANS: Plan[] = [
  {
    name: 'Basic',
    price: '$10',
    period: '/ month',
    features: ['1 User', '5GB Storage', 'Basic Support'],
    cta: 'Select',
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/ month',
    features: ['5 Users', '50GB Storage', 'Priority Support'],
    cta: 'Get Started',
    featured: true,
    badge: 'PRO • ACTIVE',
  },
  {
    name: 'Enterprise',
    price: '$99',
    period: '/ month',
    features: ['Unlimited', '1TB Storage', '24/7 Support'],
    cta: 'Contact',
  },
];

const {
  heading = 'Наші тарифи',
  lead = 'Оберіть план, який найкраще підходить для ваших завдань',
  plans = PLANS,
} = Astro.props;
---

<div class="mockup">
  <p class="mockup__heading">{heading}</p>
  <p class="mockup__lead">{lead}</p>

  <div class="mockup__plans">
    {
      plans.map((plan) => (
        <div class:list={['mockup__card', { 'mockup__card--featured': plan.featured }]}>
          {plan.badge && <span class="mockup__badge">{plan.badge}</span>}
          <span class="mockup__name">{plan.name}</span>
          <span class="mockup__price">
            {plan.price}
            {plan.period && <span class="mockup__period">{plan.period}</span>}
          </span>
          <ul class="mockup__features">
            {plan.features.map((feature) => (
              <li>{feature}</li>
            ))}
          </ul>
          <span class="mockup__cta">{plan.cta}</span>
        </div>
      ))
    }
  </div>
</div>

<style>
  /* `container-type` makes the breakpoint below respond to the mockup's own
     width — it sits in a ~44rem article column, not the viewport. */
  .mockup {
    container-type: inline-size;
    padding: 1.75rem 1.25rem;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background: color-mix(in oklab, var(--muted) 50%, transparent);
    text-align: center;
  }

  .mockup__heading {
    margin: 0 0 0.5rem;
    font-size: 1.35rem;
    font-weight: 700;
    color: var(--foreground);
  }

  .mockup__lead {
    margin: 0 auto 1.75rem;
    max-width: 34rem;
    font-size: 0.9rem;
    line-height: 1.6;
    color: var(--muted-foreground);
  }

  .mockup__plans {
    display: grid;
    gap: 1rem;
    grid-template-columns: minmax(0, 1fr);
    text-align: left;
  }

  @container (min-width: 48rem) {
    .mockup__plans {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      align-items: center;
    }

    .mockup__card--featured {
      transform: scale(1.04);
    }
  }

  .mockup__card {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    padding: 1.4rem 1.2rem;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background: var(--card);
  }

  .mockup__card--featured {
    border-color: var(--color-brand-blue);
    box-shadow: 0 0 0 1px var(--color-brand-blue);
  }

  .mockup__badge {
    position: absolute;
    top: -0.65rem;
    left: 1.2rem;
    padding: 0.15rem 0.55rem;
    border-radius: var(--radius-sm);
    background: var(--color-brand-blue);
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    color: var(--color-pure-white);
  }

  .mockup__name {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--brand-text);
  }

  .mockup__price {
    font-size: 1.75rem;
    font-weight: 700;
    line-height: 1.1;
    color: var(--foreground);
  }

  .mockup__period {
    font-size: 0.85rem;
    font-weight: 400;
    color: var(--muted-foreground);
  }

  .mockup__features {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    margin: 0.4rem 0 0.9rem;
    padding: 0;
    list-style: none;
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--muted-foreground);
  }

  .mockup__features li::before {
    content: '✓';
    margin-right: 0.45rem;
    color: var(--brand-text);
  }

  .mockup__cta {
    margin-top: auto;
    padding: 0.5rem 0.9rem;
    border: 1px solid var(--color-brand-blue);
    border-radius: var(--radius-md);
    font-size: 0.875rem;
    font-weight: 600;
    text-align: center;
    color: var(--brand-text);
  }

  .mockup__card--featured .mockup__cta {
    background: var(--color-brand-blue);
    color: var(--color-pure-white);
  }
</style>
```

> The CTA is a `<span>`, not a `<button>` or `<a>`. Nothing in the mockup is
> operable, so nothing in it should be focusable.

---

## 6. Step 6 — `TaskCard.astro`

New file `src/components/TaskCard.astro`. One rich link from the lab page to its
brief. Markup mirrors `.lab-card` on the labs index — all-`<span>` children,
because the whole card is one `<a>` — so the two read as the same system.

```astro
---
/**
 * TaskCard — the hand-off from a lab page to its practical brief (ТЗ).
 *
 * One card, not a list: a lab has at most one brief. Rendered only when
 * `getTask()` returns an entry, so Lab 1 (no brief) is unaffected and a draft
 * brief stays invisible.
 */
interface Props {
  href: string;
  title: string;
  summary: string;
  /** Short constraint chips — "Без JavaScript", "3 картки". */
  highlights?: string[];
  /** Badge text; `ТЗ` unless the frontmatter says otherwise. */
  label?: string;
}

const { href, title, summary, highlights = [], label = 'ТЗ' } = Astro.props;
---

<a class="task-card glass-panel" href={href}>
  <span class="task-card__label">{label}</span>

  <span class="task-card__body">
    <span class="task-card__title">{title}</span>
    <span class="task-card__summary">{summary}</span>
    {
      highlights.length > 0 && (
        <span class="task-card__tags">
          {highlights.map((item) => (
            <span class="task-card__tag">{item}</span>
          ))}
        </span>
      )
    }
  </span>

  <span class="task-card__arrow" aria-hidden="true">→</span>
</a>

<style>
  .task-card {
    display: flex;
    align-items: center;
    gap: 1.1rem;
    margin-block: 1.75rem;
    padding: 1.25rem 1.4rem;
    border-radius: var(--radius-lg);
    text-decoration: none;
    transition:
      border-color 0.15s ease,
      transform 0.15s ease;
  }

  .task-card:hover {
    border-color: var(--color-brand-blue);
    transform: translateY(-2px);
  }

  .task-card__label {
    flex: none;
    align-self: start;
    padding: 0.2rem 0.55rem;
    border: 1px solid var(--color-brand-blue);
    border-radius: var(--radius-sm);
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    color: var(--brand-text);
  }

  .task-card__body {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    flex: 1;
    min-width: 0;
  }

  .task-card__title {
    font-size: 1.05rem;
    font-weight: 600;
    color: var(--foreground);
  }

  .task-card__summary {
    font-size: 0.9rem;
    line-height: 1.5;
    color: var(--muted-foreground);
  }

  .task-card__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin-top: 0.3rem;
  }

  .task-card__tag {
    padding: 0.15rem 0.5rem;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    font-size: 0.75rem;
    color: var(--muted-foreground);
  }

  .task-card__arrow {
    flex: none;
    color: var(--brand-text);
    transition: transform 0.15s ease;
  }

  .task-card:hover .task-card__arrow {
    transform: translateX(0.2rem);
  }
</style>
```

---

## 7. Step 7 — The ТЗ route

### 7.1. First, extract `LabHeader.astro`

The eyebrow / title / summary block and its ~35 lines of scoped CSS currently
live inline in [src/pages/labs/[lab].astro](../../src/pages/labs/[lab].astro).
The brief page needs the same block. Copying it would mean two copies of the
same CSS drifting apart, so extract it into
`src/components/LabHeader.astro` — a fourth component beyond README §1's list,
and the only structural addition this guide makes:

```astro
---
/**
 * LabHeader — the eyebrow / title / summary block at the top of a lab page and
 * of its ТЗ page. Extracted from `[lab].astro` when the second route appeared,
 * so the two do not carry duplicate copies of the same scoped CSS.
 */
interface Props {
  /** Small uppercase line above the title. */
  eyebrow: string;
  title: string;
  summary?: string;
}

const { eyebrow, title, summary } = Astro.props;
---

<header class="lab-header">
  <p class="lab-header__eyebrow">{eyebrow}</p>
  <h1 class="lab-header__title">{title}</h1>
  {summary && <p class="lab-header__summary">{summary}</p>}
</header>

<style>
  .lab-header {
    margin-block: 1rem 1.75rem;
  }

  .lab-header__eyebrow {
    margin: 0.5rem 0 0.6rem;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--brand-text);
  }

  .lab-header__title {
    margin: 0;
    font-size: clamp(1.9rem, 4vw, 2.4rem);
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: -0.02em;
    color: var(--foreground);
  }

  .lab-header__summary {
    margin: 0.75rem 0 0;
    font-size: 1.0625rem;
    line-height: 1.6;
    color: var(--muted-foreground);
  }
</style>
```

The styles move verbatim — no visual change to the Lab 1 page.

### 7.2. `src/pages/labs/[lab]/task.astro`

This route imports `LabMeta`, which [Step 8](#8-step-8--labmetaastro-and-the-lab-page)
creates. Build Step 8 first if you would rather not leave a broken import on
disk between steps; the two are independent otherwise.

```astro
---
/**
 * ТЗ page — one static route per entry in the `tasks` collection, at
 * `/labs/<id>/task` (`/labs/lab-2/task`). The id is the owning lab's, so the
 * route is generated only when that lab is itself published.
 *
 * `src/pages/labs/[lab].astro` and this file coexist: `/labs/[lab]` and
 * `/labs/[lab]/task` are distinct patterns, building to `labs/lab-2/index.html`
 * and `labs/lab-2/task/index.html`.
 *
 * The page composes the mockup above `.doc-content` — the brief's §1 describes
 * the target design, and a live render beats a screenshot in both themes.
 */
import { render } from 'astro:content';

import Breadcrumbs from '@/components/Breadcrumbs.astro';
import LabHeader from '@/components/LabHeader.astro';
import LabMeta from '@/components/LabMeta.astro';
import PricingMockup from '@/components/PricingMockup.astro';
import LabLayout from '@/layouts/LabLayout.astro';
import { getLabs, getTasks, labHref, taskHref } from '@/lib/labs';
import { withBase } from '@/lib/paths';

export async function getStaticPaths() {
  const [labs, tasks] = await Promise.all([getLabs(), getTasks()]);
  const byId = new Map(labs.map((lab) => [lab.id, lab]));

  // A brief whose lab is a draft (or missing) gets no route — otherwise the
  // spec would be reachable while the lab itself is unpublished.
  return tasks.flatMap((task) => {
    const lab = byId.get(task.id);
    return lab ? [{ params: { lab: task.id }, props: { task, lab } }] : [];
  });
}

const { task, lab } = Astro.props;
const { data } = task;

const { Content, headings } = await render(task);

const crumbs = [
  { label: 'Labs', href: withBase('/labs/') },
  { label: `ЛР-${lab.data.number}`, href: labHref(lab.id) },
  { label: data.label, href: taskHref(task.id) },
];
---

<LabLayout title={data.title} description={data.summary} lang={data.lang} headings={headings}>
  <Breadcrumbs items={crumbs} />

  <LabHeader
    eyebrow={`Технічне завдання · ЛР-${lab.data.number}`}
    title={data.title}
    summary={data.summary}
  />

  {
    data.goal && (
      <p class="task-goal">
        <strong>Мета практичної частини.</strong> {data.goal}
      </p>
    )
  }

  <LabMeta updated={data.updated} handout={data.handout} />

  <figure class="task-preview">
    <PricingMockup />
    <figcaption>Орієнтовний вигляд готової секції</figcaption>
  </figure>

  <article class="doc-content">
    <Content />
  </article>

  <nav class="task-back" aria-label="Lab">
    <a href={labHref(lab.id)} rel="up">← До лабораторної роботи №{lab.data.number}</a>
  </nav>
</LabLayout>

<style>
  /* The brief's "Мета практичної частини" box — a lead, not body copy, so it
     sits outside `.doc-content` and carries its own rule. */
  .task-goal {
    margin: 0 0 1.75rem;
    padding-left: 1rem;
    border-left: 3px solid var(--color-brand-blue);
    font-size: 1rem;
    line-height: 1.65;
    color: var(--muted-foreground);
  }

  .task-goal strong {
    color: var(--foreground);
  }

  .task-preview {
    margin: 0 0 2.5rem;
  }

  .task-preview figcaption {
    margin-top: 0.6rem;
    font-size: 0.8125rem;
    text-align: center;
    color: var(--muted-foreground);
  }

  .task-back {
    margin-top: 3rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border);
    font-size: 0.9rem;
  }

  .task-back a {
    color: var(--brand-text);
    text-decoration: none;
  }

  .task-back a:hover {
    text-decoration: underline;
  }
</style>
```

> **No `PrevNext` here.** The brief has no siblings; a single "back to the lab"
> link is the only navigation that means anything. `LabLayout` still gives it
> breadcrumbs, the ToC rail and the sticky mobile ToC bar for free.

---

## 8. Step 8 — `LabMeta.astro` and the lab page

### 8.1. `LabMeta.astro`

New file `src/components/LabMeta.astro`. This is the panel the Lab 1 guide
planned and never built, which is why `discipline`, `level`, `format`,
`duration`, `updated` and `handout` sit in the schema unread
([README §5](README.md)). Every field is optional, so the same component serves
the lab page (full panel) and the brief page (download + date only).

```astro
---
/**
 * LabMeta — a lab's header data (discipline / level / format / duration) as a
 * glass panel above the article, with the downloadable handout link and the
 * "актуально станом на" date.
 *
 * Every prop is optional and absent rows simply do not render, so the ТЗ page
 * can reuse it for the download link alone.
 */
import { withBase } from '@/lib/paths';

interface Props {
  discipline?: string;
  level?: string;
  format?: string;
  duration?: string;
  updated?: Date;
  /** Path without the base prefix, e.g. `/labs/lab-2.pdf`. */
  handout?: string;
}

const { discipline, level, format, duration, updated, handout } = Astro.props;

const rows = [
  { label: 'Дисципліна', value: discipline },
  { label: 'Рівень', value: level },
  { label: 'Формат', value: format },
  { label: 'Тривалість', value: duration },
].filter((row): row is { label: string; value: string } => Boolean(row.value));

// `uk-UA` long date — "18 вересня 2026 р.".
const updatedLabel = updated
  ? new Intl.DateTimeFormat('uk-UA', { dateStyle: 'long' }).format(updated)
  : undefined;
---

{
  (rows.length > 0 || handout || updatedLabel) && (
    <div class="lab-meta glass-panel">
      {rows.length > 0 && (
        <dl class="lab-meta__list">
          {rows.map((row) => (
            <div class="lab-meta__row">
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <div class="lab-meta__actions">
        {handout && (
          <a class="lab-meta__download" href={withBase(handout)} download>
            Завантажити PDF
          </a>
        )}
        {updatedLabel && <p class="lab-meta__updated">Актуально станом на {updatedLabel}</p>}
      </div>
    </div>
  )
}

<style>
  .lab-meta {
    display: flex;
    flex-wrap: wrap;
    align-items: end;
    justify-content: space-between;
    gap: 1.25rem;
    margin-block: 1.75rem;
    padding: 1.25rem 1.4rem;
    border-radius: var(--radius-lg);
  }

  .lab-meta__list {
    display: grid;
    gap: 0.5rem 1.5rem;
    margin: 0;
    font-size: 0.9rem;
  }

  @media (min-width: 640px) {
    .lab-meta__list {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  .lab-meta__row {
    display: flex;
    gap: 0.5rem;
    min-width: 0;
  }

  .lab-meta__row dt {
    flex: none;
    font-weight: 600;
    color: var(--muted-foreground);
  }

  .lab-meta__row dd {
    margin: 0;
    color: var(--foreground);
  }

  .lab-meta__actions {
    display: flex;
    flex-direction: column;
    align-items: start;
    gap: 0.4rem;
  }

  .lab-meta__download {
    display: inline-flex;
    align-items: center;
    padding: 0.45rem 0.9rem;
    border: 1px solid var(--color-brand-blue);
    border-radius: var(--radius-md);
    font-size: 0.875rem;
    font-weight: 600;
    /* `--brand-text`, not `--color-brand-blue-soft`: the soft blue is only
       2.6:1 on white — see the light-theme contrast fix in 8567b76. */
    color: var(--brand-text);
    text-decoration: none;
    transition: background-color 0.15s ease;
  }

  .lab-meta__download:hover {
    background: color-mix(in oklab, var(--color-brand-blue) 15%, transparent);
  }

  .lab-meta__updated {
    margin: 0;
    font-size: 0.8125rem;
    color: var(--muted-foreground);
  }
</style>
```

### 8.2. Rewire `src/pages/labs/[lab].astro`

Replace the inline `<header>` with `LabHeader`, delete the now-unused
`.lab-header*` rules from the page's `<style>` block (they moved in Step 7.1),
and render the meta panel and the hand-off card.

Frontmatter additions:

```ts
import LabHeader from '@/components/LabHeader.astro';
import LabMeta from '@/components/LabMeta.astro';
import TaskCard from '@/components/TaskCard.astro';
import { getAdjacentLab, getLabs, getTask, labHref, toTaskMeta } from '@/lib/labs';

// …existing entry / render / adjacent / crumbs code…

// The practical brief, when this lab has a published one (Lab 1 does not).
const taskEntry = await getTask(entry.id);
const task = taskEntry && toTaskMeta(taskEntry);
```

Template:

```astro
<LabLayout title={data.title} description={data.summary} lang={data.lang} headings={headings}>
  <Breadcrumbs items={crumbs} />

  <LabHeader
    eyebrow={`Лабораторна робота №${data.number}`}
    title={data.title}
    summary={data.summary}
  />

  <LabMeta
    discipline={data.discipline}
    level={data.level}
    format={data.format}
    duration={data.duration}
    updated={data.updated}
    handout={data.handout}
  />

  {
    task && (
      <TaskCard
        href={task.href}
        title={task.title}
        summary={task.summary}
        highlights={task.highlights}
        label={task.label}
      />
    )
  }

  <article class="doc-content">
    <Content />
  </article>

  <PrevNext prev={adjacent.prev} next={adjacent.next} />
</LabLayout>
```

> **Card placement.** Above the body, not buried after §5, because the brief is
> the thing a student comes back for — it should be reachable without scrolling
> six sections. §5 still links to it inline, so the in-context path exists too.
> The page's `<style>` block ends up holding nothing; delete it along with the
> markup it styled.

---

## 9. Step 9 — The `ТЗ` pill on the labs index

Edit [src/pages/labs/index.astro](../../src/pages/labs/index.astro) so a lab
with a brief says so before you click.

Frontmatter:

```ts
import { getLabs, getTasks, labHref } from '@/lib/labs';

const [labs, tasks] = await Promise.all([getLabs(), getTasks()]);
const withTask = new Set(tasks.map((task) => task.id));
```

Inside the card title:

```astro
<span class="lab-card__title">
  {lab.data.title}
  {withTask.has(lab.id) && <span class="lab-card__pill">ТЗ</span>}
</span>
```

Styles, next to the other `.lab-card__*` rules:

```css
.lab-card__pill {
  margin-left: 0.5rem;
  padding: 0.1rem 0.4rem;
  border: 1px solid var(--color-brand-blue);
  border-radius: var(--radius-sm);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  vertical-align: middle;
  color: var(--brand-text);
}
```

> The pill is a marker, not a second link: the whole card is already one `<a>`,
> and an anchor inside an anchor is invalid HTML. Anyone wanting the brief
> directly gets there in one more click from the lab page.

---

## 10. Step 10 — Publish the PDFs

`public/labs/` does not exist yet, and `lab-1.md` already declares
`handout: /labs/lab-1.pdf` — a link that would 404 the moment Step 8 renders it.
Fix all three at once.

Copy the sources under URL-safe names (the originals are Cyrillic, which
percent-encodes into an unreadable href):

```powershell
New-Item -ItemType Directory -Force public/labs
Copy-Item "<source>/Лабораторна робота №2_ Основи CSS та AI-assisted верстка.pdf" public/labs/lab-2.pdf
Copy-Item "<source>/ТЗ_ЛР2_Секція_тарифних_планів.pdf" public/labs/lab-2-task.pdf
Copy-Item "<source>/<the Lab 1 handout>.pdf" public/labs/lab-1.pdf
```

The Lab 1 source file is not in the repo and its exact name is not recorded
anywhere here — `lab-1.md` only declares the destination path. Use whatever the
handout is actually called.

Frontmatter carries the path **without** the base (`handout: /labs/lab-2.pdf`);
`LabMeta` runs it through `withBase()`.

**If a PDF is genuinely unavailable, delete the `handout:` line** from that
entry's frontmatter rather than shipping a dead download button — the field is
optional and the panel drops the button when it is absent.

Check `.gitignore` does not exclude `public/labs/`, then confirm the files are
tracked:

```bash
git status --short public/labs
```

---

## 11. Step 11 — The two dialogs

Both `<dialog>` ideas from [README §3.2](README.md) ship in v1 so they can be
judged in use rather than in the abstract. Each is independent — keep the one
that earns its keep and delete the other.

Native `<dialog>` + `showModal()` gives focus trapping, `Esc`, `inert`ing the
rest of the page and the top layer for free. Nothing here reimplements any of
that.

### 11.1. `MockupLightbox.astro`

Wraps `PricingMockup` in a trigger. The dialog shows the same component at a
width the article column cannot give it — which is exactly the "glance at and
dismiss" case a dialog is for.

```astro
---
/**
 * MockupLightbox — the pricing mockup at full width, in the top layer.
 *
 * The inline copy stays in the flow; this only adds a way to enlarge it. The
 * trigger is a real `<button>`, so keyboard and screen-reader users reach it
 * the same way; the dialog's own close button is the first focusable element
 * inside, which is where `showModal()` puts initial focus.
 */
import PricingMockup from '@/components/PricingMockup.astro';
---

<div class="lightbox">
  <button type="button" class="lightbox__trigger" data-lightbox-open>
    Збільшити макет
  </button>

  <dialog class="lightbox__dialog" data-lightbox aria-label="Макет секції тарифів">
    <button type="button" class="lightbox__close" data-lightbox-close aria-label="Закрити">
      ✕
    </button>
    <PricingMockup />
  </dialog>
</div>

<script>
  document.querySelectorAll<HTMLElement>('.lightbox').forEach((root) => {
    const dialog = root.querySelector<HTMLDialogElement>('[data-lightbox]');
    if (!dialog) return;

    root
      .querySelector('[data-lightbox-open]')
      ?.addEventListener('click', () => dialog.showModal());
    dialog
      .querySelector('[data-lightbox-close]')
      ?.addEventListener('click', () => dialog.close());

    // Click on the backdrop — the dialog element itself is the only target
    // outside its own children.
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });
  });
</script>

<style>
  .lightbox__trigger {
    display: block;
    margin: 0.75rem auto 0;
    padding: 0.35rem 0.8rem;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: none;
    font: inherit;
    font-size: 0.8125rem;
    color: var(--brand-text);
    cursor: pointer;
  }

  .lightbox__trigger:hover {
    border-color: var(--color-brand-blue);
  }

  .lightbox__dialog {
    width: min(64rem, 92vw);
    max-height: 90dvh;
    padding: 2.5rem 1.5rem 1.5rem;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background: var(--background);
    color: var(--foreground);
    overflow: auto;
  }

  .lightbox__dialog::backdrop {
    background: rgb(0 0 0 / 0.55);
    backdrop-filter: blur(2px);
  }

  .lightbox__close {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    padding: 0.25rem 0.5rem;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: none;
    font: inherit;
    color: var(--muted-foreground);
    cursor: pointer;
  }
</style>
```

In [Step 7.2](#7-step-7--the-тз-route), swap the `<PricingMockup />` inside
`<figure class="task-preview">` for `<MockupLightbox />`.

> **Worth watching during review.** The mockup already reflows to one column
> inside the article, so on a phone the lightbox adds little — it is a
> desktop-only win. If review agrees, the trigger can be hidden below `640px`
> rather than the whole component dropped.

### 11.2. `AcceptanceChecklist.astro`

The brief's §7 table, as something you can tick off. This is not a duplicate of
the table — it is the interaction the table cannot provide, which is the honest
test of whether the dialog earns its place.

```astro
---
/**
 * AcceptanceChecklist — the ТЗ's acceptance criteria as a self-check before
 * submitting. State is per-viewer convenience only: `localStorage`, wrapped,
 * and the list renders correctly when it is unavailable.
 *
 * `items` comes from the route rather than the Markdown so the criteria exist
 * once; see content-map.md §2.6 for the source table.
 */
interface Props {
  items: string[];
}

const { items } = Astro.props;
---

<div class="checklist">
  <button type="button" class="checklist__trigger" data-checklist-open>
    Самоперевірка перед здачею
  </button>

  <dialog class="checklist__dialog" data-checklist aria-label="Критерії приймання">
    <h2 class="checklist__title">Критерії приймання</h2>
    <ul class="checklist__list">
      {
        items.map((item, i) => (
          <li>
            <label>
              <input type="checkbox" data-checklist-item={String(i)} />
              <span>{item}</span>
            </label>
          </li>
        ))
      }
    </ul>
    <button type="button" class="checklist__close" data-checklist-close>Закрити</button>
  </dialog>
</div>

<script>
  const KEY = 'lab-2-acceptance';

  document.querySelectorAll<HTMLElement>('.checklist').forEach((root) => {
    const dialog = root.querySelector<HTMLDialogElement>('[data-checklist]');
    if (!dialog) return;

    const boxes = [...dialog.querySelectorAll<HTMLInputElement>('[data-checklist-item]')];

    // Private windows and blocked site data both throw here; the list still
    // works, it just does not remember.
    const read = (): string[] => {
      try {
        const raw = localStorage.getItem(KEY);
        return raw ? (JSON.parse(raw) as string[]) : [];
      } catch {
        return [];
      }
    };

    const write = (checked: string[]) => {
      try {
        localStorage.setItem(KEY, JSON.stringify(checked));
      } catch {
        /* nothing to do — the checkboxes keep working in-session */
      }
    };

    const saved = new Set(read());
    boxes.forEach((box) => {
      box.checked = saved.has(box.dataset.checklistItem ?? '');
      box.addEventListener('change', () =>
        write(boxes.filter((b) => b.checked).map((b) => b.dataset.checklistItem ?? '')),
      );
    });

    root
      .querySelector('[data-checklist-open]')
      ?.addEventListener('click', () => dialog.showModal());
    dialog
      .querySelector('[data-checklist-close]')
      ?.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });
  });
</script>

<style>
  .checklist__trigger {
    padding: 0.45rem 0.9rem;
    border: 1px solid var(--color-brand-blue);
    border-radius: var(--radius-md);
    background: none;
    font: inherit;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--brand-text);
    cursor: pointer;
  }

  .checklist__dialog {
    width: min(38rem, 92vw);
    max-height: 85dvh;
    padding: 1.5rem;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background: var(--background);
    color: var(--foreground);
    overflow: auto;
  }

  .checklist__dialog::backdrop {
    background: rgb(0 0 0 / 0.55);
  }

  .checklist__title {
    margin: 0 0 1rem;
    font-size: 1.1rem;
    font-weight: 700;
  }

  .checklist__list {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    margin: 0 0 1.25rem;
    padding: 0;
    list-style: none;
  }

  .checklist__list label {
    display: flex;
    gap: 0.6rem;
    align-items: start;
    font-size: 0.9rem;
    line-height: 1.5;
    cursor: pointer;
  }

  .checklist__list input {
    margin-top: 0.2rem;
    accent-color: var(--color-brand-blue);
  }

  .checklist__close {
    padding: 0.4rem 0.9rem;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    background: none;
    font: inherit;
    font-size: 0.875rem;
    color: var(--foreground);
    cursor: pointer;
  }
</style>
```

Render it in the route beside `LabMeta`, passing the ten criteria. Keeping the
list in the route (not the Markdown) means the body table and the dialog cannot
drift — but it does mean the criteria live in two places if the body table is
also hand-written. **Decide during review:** either the dialog is the only
interactive copy and the body keeps the table for reading, or §7 of the brief
drops the table and the dialog becomes canonical.

---

## 12. Step 12 — Verify

```bash
npm run check
npm run build
npm run preview -- --port 4399
```

Astro 7's `preview` detaches as a daemon — it does not block the terminal, and
it keeps running after you are done. Stop it with `npx astro preview stop`.

The build must produce `dist/labs/lab-2/index.html` **and**
`dist/labs/lab-2/task/index.html`:

```bash
ls dist/labs/lab-2 dist/labs/lab-2/task
```

Then walk the list:

- [ ] `/labs/` lists Lab 2 with the `ТЗ` pill; Lab 1 has no pill
- [ ] `/labs/lab-2/` renders; `<html lang="uk">` in view-source
- [ ] The meta panel shows discipline / level / format / duration and the
      download button; the button serves the PDF **under the base path**
- [ ] The hand-off card sits above the body and lands on `/labs/lab-2/task/`
- [ ] The inline §5 link works too — proof the link rewriter ran. Grep the built
      HTML rather than trusting the dev server:
      `grep -o 'href="[^"]*lab-2/task[^"]*"' dist/labs/lab-2/index.html`
      must show `/web-development-2026/labs/lab-2/task/`
- [ ] Lab 1 still renders unchanged (the header extraction is visual-neutral)
- [ ] `/labs/lab-2/task/` renders: breadcrumbs `Labs › ЛР-2 › ТЗ`, mockup,
      all eight sections, back link
- [ ] The mockup's card titles are **not** in the "On this page" rail
- [ ] The `:root` block — the ТЗ's only code block — scrolls horizontally
      rather than widening the page
- [ ] The acceptance table renders as a table, not raw pipes
- [ ] Theme toggle works on both new pages; the mockup is legible in both
      themes (check the featured card's contrast in light theme)
- [ ] At a genuinely narrow window (~400px) there is no horizontal page scroll
      and the mockup is a single column. Resize a real browser window — the
      project note on headless Edge applies: `mobile: true` device emulation
      misreports layout, so measure in a real narrow window over CDP or by hand
- [ ] Build output is clean — no route-collision warning between
      `[lab].astro` and `[lab]/task.astro`, no 404s

Dialogs (Step 11), which is what the review in [README §3.2](README.md) turns
on:

- [ ] Both open on click and close on `Esc`, on the close button and on a
      backdrop click
- [ ] Focus moves into the dialog on open and the page behind is inert —
      `Tab` must not escape to the article
- [ ] The checklist remembers ticks across a reload, and still renders and
      toggles with site data blocked (test in a private window)
- [ ] `::backdrop` is legible in both themes
- [ ] At ~400px both dialogs fit — no clipped close button, no page scroll
      underneath
- [ ] With JavaScript disabled, neither trigger is a dead control that looks
      live. If it is, that is a finding for the review, not a bug to paper over

---

## 13. Step 13 — Commit

The branch `feat/lab-2` already exists. Commit in the order the steps were
built, so a bisect lands somewhere buildable:

```bash
git add src/content.config.ts src/lib/labs.ts src/content/labs/lab-2.md src/content/tasks/lab-2.md
git commit -m "feat(labs): add Lab 2 content and the tasks collection"

git add plugins astro.config.mjs package.json package-lock.json
git commit -m "feat(build): prefix root-relative Markdown links with the site base"

git add src/components src/pages/labs
git commit -m "feat(labs): render the Lab 2 brief at /labs/lab-2/task/"

git add public/labs src/content/labs/lab-1.md
git commit -m "feat(labs): publish the lab handout PDFs"
```

---

## 14. Deferred

Carried over from [README §6](README.md), plus what this guide adds:

- **Add the CSS lecture deck.** The lesson has been delivered, but
  `src/data/lectures/` holds only `lecture-1.ts` and `lecture-2.ts`, so Lab 2
  has no deck to link back to. One `lecture-3.ts` plus one registry entry.
- **Review the two dialogs** from Step 11 and delete whichever does not earn its
  keep. The checklist also forces a call on where the criteria live — route or
  Markdown body, not both.
- **Removing the tutorial section** is planned separately (see
  [README §6](README.md)). Nothing in this guide depends on it, with one
  exception to handle first: `Breadcrumbs.astro` — which both lab routes use —
  imports `type { Crumb }` from `@/lib/curriculum`. Move that type before
  deleting the handbook, or the lab pages go down with it.
- A `uk` locale for the site chrome: breadcrumbs still read "Labs" and
  `PrevNext` still says "← Previous" above Ukrainian bodies.
- `Callout.astro` for "Важливо!" / "Примітка" — worth it at a third lab.
- `rehype-autolink-headings`: `global.css` styles
  `.doc-content :is(h2,h3,h4) .anchor`, but nothing emits an anchor. With two
  long, deeply-sectioned pages now shipping, deep-linking to a section is more
  valuable than it was at Lab 1.

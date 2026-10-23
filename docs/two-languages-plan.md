# Two-Language Site Plan (Ukrainian and English)

## Goal and scope

Today the site's interface mixes Ukrainian and English, and `<html lang>` is always `en`. I'll make the language a real part of the site: every page exists in Ukrainian and English, the interface follows the page language, and a visitor can switch between the two.

**What I'll do**

- Put every route under an optional locale segment: Ukrainian stays at the current addresses, English lives under `/en/`.
- Move every interface string into one Ukrainian/English dictionary, and set `<html lang>`, `hreflang` alternates and `og:locale` from the page language.
- Replace the disabled `EN` placeholder in the header with a working language switcher.
- Make course names, descriptions and lecture labels per-language in the course registry.
- Only if the teacher confirms English versions of the materials (see the question at the end): prepare the place for them, a locale folder per course and a fallback so a lab or lecture without an English version still shows up in Ukrainian, with a notice. These are Steps 5–6.
- Update `README.md`, `AGENTS.md` and `docs/agents/design-system.md`.

**What I won't touch**

- Translating lab, task and lecture bodies (about 22,000 words of lab and task Markdown plus two decks), unless the teacher wants it (see the question at the end). If they do, I translate them with AI and check the result; no manual translation.
- The ЛР-7 check and report pages and the `courtly-*` scripts. They are instructor tools and stay in Ukrainian at their current URLs.
- Visual design, and automatic redirects by browser language (the site is static).

---

## Target structure

Ukrainian is the default language and keeps the current URLs, so no existing link changes and no new redirects are needed. English is added under `/en/`.

| Page                                                   | Ukrainian (default)                                                               | English                |
| ------------------------------------------------------ | --------------------------------------------------------------------------------- | ---------------------- |
| Hub                                                    | `/`                                                                               | `/en/`                 |
| Course page                                            | `/web-development/`                                                               | `/en/web-development/` |
| Lab, task, deck                                        | `/web-development/labs/lab-4/`, `…/task/`, `/web-development/lectures/lecture-1/` | the same under `/en/`  |
| Legacy `/labs/*`, `/lectures/*`, ЛР-7 check and report | unchanged                                                                         | not translated         |

**Files**

```
src/
├─ i18n/
│  ├─ ui.ts             every interface string: { uk: {…}, en: {…} }
│  └─ index.ts          locales, defaultLocale, useTranslations(locale), localeHref(), switchLocaleHref()
├─ data/
│  ├─ courses.ts        title, description, courseName per language
│  └─ lectures/<course>/<locale>/lecture-N.ts
├─ content/
│  ├─ labs/<course>/<locale>/lab-N.md
│  └─ tasks/<course>/<locale>/lab-N.md
└─ pages/
   └─ [...locale]/      one set of pages serves both languages
      ├─ index.astro
      └─ [course]/…     course, lectures, labs, tasks
```

The optional `[...locale]` segment is empty for Ukrainian and `en` for English. I tested this layout in a copy of the project: `/` and `/web-development/…` build as Ukrainian, `/en/…` as English, `Astro.currentLocale` returns the right language, and the static `labs/` and `lectures/` redirect folders do not collide with it.

A collection id gains the language (`web-development/uk/lab-4`), and `splitId` returns course, locale and slug.

---

## Steps

Branch `feat/two-languages`, small Conventional Commits, `npm run check && npm run build` after every step. All steps ship in one PR. The core (Steps 0–4 and 7) takes about 4.5 working days. Steps 5–6 are optional and add about 1.25 days, so 5.5 days with them.

### Step 0 · Baseline (0.25 d)

- [ ] Create the branch from `main`
- [ ] Build the site and save the list of every URL in `dist/` outside the repo. After the work, every URL in this list must be unchanged.

**Done when:** the build is green and the URL list is saved.

### Step 1 · i18n foundation (0.5 d)

- [ ] In `astro.config.mjs` set `defaultLocale: 'uk'`, `locales: ['uk', 'en']`, `prefixDefaultLocale: false`
- [ ] Add `src/i18n/index.ts` (locales, default, `useTranslations`, `localeHref`, `switchLocaleHref`) and an empty `ui.ts`
- [ ] `BaseLayout` takes `lang` from `Astro.currentLocale`, and emits `hreflang` alternates, a canonical URL and `og:locale`

**Done when:** `npm run check && npm run build` passes and every page has the right `<html lang>`.

### Step 2 · Routes under `[...locale]` (1 d)

- [ ] `git mv` `src/pages/[course]` into `src/pages/[...locale]/[course]` and `src/pages/index.astro` into `src/pages/[...locale]/index.astro`
- [ ] Every `getStaticPaths` produces locale × course (× lab or lecture), with `locale: undefined` for Ukrainian
- [ ] Link helpers take the language: `labHref(locale, course, slug)`, `taskHref(…)`, and the lecture links
- [ ] Legacy redirect pages and the ЛР-7 pages stay where they are; only their link helper calls change

**Done when:** the build has every Ukrainian URL from Step 0 plus the English hub and course pages under `/en/`.

### Step 3 · Interface strings (1.5 d)

- [ ] Fill `ui.ts` with Ukrainian and English strings for: `SiteHeader`, `SiteFooter`, hub, course, lecture and lab index pages, `LabHeader`, `OnThisPage`, `PrevNext`, `Breadcrumbs`, `DeckChrome`, `Slide`, `AcceptanceChecklist`, `MockupLightbox`, the `BaseLayout` skip link and the labels in `src/lib/labs.ts`
- [ ] `docs.ts` already switches the copy-button text on `<html lang>`; I'll move those three strings into the dictionary and pass them through `data-*` attributes, so every string lives in one place
- [ ] `site.ts` and `courses.ts` hold per-language text; `courseUk` becomes the localized course name
- [ ] Remove the ad-hoc `lang="uk"` markers where the interface now follows the page language; keep them on Ukrainian content that appears inside an English page

**Done when:** no hard-coded visible text is left in the shared templates, and each page reads in one language, except content that is not translated yet.

### Step 4 · Language switcher (0.5 d)

- [ ] Replace the disabled `EN` placeholder in `SiteHeader` with a `UK | EN` switcher with `aria-current` and `lang` on each option
- [ ] It links to the same page in the other language; when that page does not exist it links to the course page

**Done when:** the switcher moves between the two versions of the hub, a course page, a lab and a deck.

### Step 5 · Content layout and fallback (1 d) — only if English versions are needed

- [ ] `git mv` the Ukrainian labs, tasks and lecture data into `<course>/uk/`
- [ ] `splitId`, `getLabs(course, locale)`, `getTasks(…)` and `getLectures(course, locale)` use the language
- [ ] The English index lists every lab and lecture; one without an English version links to the Ukrainian page with an "Ukrainian only" notice, and no duplicate page is built
- [ ] The Zod schema checks that the `lang` field matches the folder

**Done when:** the Ukrainian URLs are identical to Step 0, and a lab can gain an English version by adding one file.

### Step 6 · Handouts and scripts (0.25 d) — only if English versions are needed

- [ ] `docs/build-handout.py` takes the language and reads `src/content/labs/web-development/<locale>/<lab>.md`; it writes `public/labs/<lab>.pdf` (Ukrainian) or `public/labs/<lab>.en.pdf`
- [ ] `docs/lab-7/build-pack.py` reads the Ukrainian task from its new path

**Done when:** `python docs/build-handout.py lab-11` still produces `public/labs/lab-11.pdf`.

### Step 7 · README, AGENTS.md and final check (0.5 d)

- [ ] Update `README.md`, `AGENTS.md` and the routes table in `docs/agents/design-system.md`; add a short "how to add an interface string / translate a lab" note
- [ ] Update the route tables in `docs/lab-*/README.md`; if Steps 5–6 were done, also update the comments that name the old content paths. Grep for stale paths in `README.md`, `AGENTS.md`, `docs/agents/*.md` and comments (see `docs/agents/pr-review.md` §8)
- [ ] Run `npm run check && npm run build`, and diff the URL list against Step 0
- [ ] In dev and preview, click through the hub, a course, a lab, a task and a deck in both languages; screenshots of both languages at desktop and 390 px

**Done when:** the URL diff shows only added `/en/…` pages, and the click-through finds no broken link.

---

## Timing

Steps 0–4 and 7 are the visible result: the whole interface in two languages with a working switcher. If Steps 5–6 are needed, they restructure the content folders (a `git mv` of every lab, task and lecture, like the previous course PR), so they conflict with any open lab branch. I'll land the PR when no lab branch is open, or after the authors have merged or rebased. If the teacher wants English versions, I translate them with AI (see the question at the end), either in this PR or in follow-up PRs.

## Decisions

- **Default language:** Ukrainian unprefixed, English under `/en/`. All current content is Ukrainian, so students' existing links keep working. The current `astro.config.mjs` declares English as the default instead; with that, every existing URL would become an English page that has Ukrainian content, or would need new redirects.
- **Scope of this work:** the interface, plus the structure for translations only if the teacher confirms them. The translation of lab and lecture bodies happens only if the teacher asks for it, and is done with AI.
- **Untranslated pages (Steps 5–6 only):** the English index shows them with a link to the Ukrainian page and an "Ukrainian only" notice, instead of hiding them.
- **Content layout (Steps 5–6 only):** a locale folder inside each course. The alternative is a language suffix (`lab-4.en.md`), which needs no `git mv` but makes filtering by language less obvious.

**Alternative considered:** prefix both languages (`/uk/…`, `/en/…`). The structure is symmetric, but every existing URL would change and need a redirect, so I chose the unprefixed default.

## Question for the teacher

**Do the lab and lecture materials need an English version? If yes, is an AI translation acceptable?**

I would translate them with AI, which is much faster than by hand. Code blocks, commands, file names and links stay unchanged, and I keep one glossary of terms so the same word is translated the same way everywhere. I would check the result for broken Markdown and links, but I can't guarantee every sentence reads like a native speaker wrote it.

- **Interface only:** labs, tasks and lectures stay in Ukrainian. I skip Steps 5–6 (about 1.25 days less), and the English pages show the Ukrainian materials under the English interface.
- **English versions in this PR, translated with AI:** I keep Steps 5–6 and add the translation. The estimate is about 1–2 extra days for translating and checking (my estimate, to be confirmed on the first labs), so about 7 days in total. The PR becomes large to review, and it conflicts with any lab branch that is open.
- **English versions later, in separate PRs:** I keep Steps 5–6 and translate lab by lab afterwards. Each translation is reviewed on its own, and the interface PR does not wait for them.

Whichever of the last two is chosen, I need to know who reads the English text before it is published, and whether the PDF handouts need an English version too.

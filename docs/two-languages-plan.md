# Plan: Ukrainian and English Versions of the Site

## In brief: what visitors will see

**Ukrainian is the site's primary language.** In production, the site remains Ukrainian at its current URLs. Existing links do not change.

**English will be available only on the local development server and in a non-deploying CI validation build.** There, developers and CI can check English pages. The production build and the regular CI build will not generate `/en/` pages; the extra CI build is only for validation and is never deployed.

This plan covers the language infrastructure only; it does not include translations of labs, assignments, or lectures. Those translations will be added separately after the infrastructure is in place. The structure should let a future translation be added by adding files, without code changes. Decisions about AI translation, who will proofread the English text, and English PDFs will be made before the first content translation.

## How content will work

- Ukrainian pages keep their current URLs, for example `/web-development/labs/lab-4/`.
- In development, English pages use the `/en/` prefix, for example `/en/web-development/labs/lab-4/`.
- If an English translation is not available yet, the English list links directly to the Ukrainian page and marks it as “In Ukrainian”. That destination is a Ukrainian page, with Ukrainian interface and content; there will be no duplicate English page.
- If content exists only in English, its files live in the `en/` folder. It will not appear in the Ukrainian list, and no Ukrainian page will be generated for it.
- Check for a lab translation and its practical-assignment translation independently: they are separate files and either may be missing.
- The existing React and Web Accessibility lab files are English preview placeholders for draft courses, visible only in development. They are not completed translations. Keep them as placeholders and preserve their existing dev-only visibility.
- URLs in this document are shown without the GitHub Pages base path. All links in the code must continue to account for the site's `base`.

## Where translations will live

```text
src/
├─ i18n/
│  ├─ index.ts                 language settings and shared helpers
│  └─ ui.ts                    interface text translations
├─ content/
│  ├─ labs/<course>/uk/        Ukrainian labs
│  ├─ labs/<course>/en/        English labs
│  ├─ tasks/<course>/uk/       Ukrainian practical assignments
│  └─ tasks/<course>/en/       English practical assignments
├─ data/lectures/<course>/<locale>/  lecture data for each language
└─ pages/
   └─ [...locale]/             shared pages for both languages
```

The content's language is determined by its folder (`uk/` or `en/`), not by a `lang` field in frontmatter. The `lang` field should therefore be removed from the lab and assignment schemas. The check that a file is inside a registered course folder and has a language folder should be added to `assertInCourse` in `src/lib/labs.ts`.

## Work plan

### Step 0. Record the current state

- [X] Build the site and save the list of generated URLs outside the repository.
- [X] Take before screenshots of the current interface: the same pages on desktop and at 390 px wide.

**Done when:** the build passes, the URL list is saved, and the screenshots are taken.

### Step 1. Add the language foundations

- [x] In `astro.config.mjs`, make `uk` the default language, add `en`, and keep Ukrainian URLs unprefixed.
- [x] Create `src/i18n/index.ts` for language detection, translations, and link helpers, and `src/i18n/ui.ts` for interface text.
- [x] Define in one place, `src/i18n/index.ts`, whether English is enabled: enable it in development and allow it to be enabled for a local build through an environment variable. Production must remain Ukrainian-only until English is intentionally published later.
- [x] In `BaseLayout`, set `<html lang>` from the page language. A canonical URL is already generated, so do not add a duplicate. Add `hreflang` only for page versions that are actually generated, and set `og:locale` to `uk_UA` or `en_US`.
- [x] Mark content with its actual language when it differs from the page language. This applies to frontmatter text shown in a page too: for example, a Ukrainian lab title and summary in an English lab list must be marked `lang="uk"`.
- [x] Remove explicit content-language overrides from `LabLayout` and `DeckLayout`; they must not override the page language selected by the route.

**Done when:** checks and the production build pass; the document language matches the route, and the content language matches its text. (Step 1 complete.)

### Step 2. Add English URLs without changing Ukrainian ones

- [x] Move the course pages and home page under a shared route with an optional language segment.
- [x] Generate English routes only when the switch from Step 1 is enabled. Production and the regular CI build preserve Ukrainian routes without `/uk/` and do not generate `/en/`; CI runs a separate English-enabled validation build.
- [x] Pass the page language to helpers that create links to labs, assignments, and lectures.
- [x] Keep legacy redirects and the ЛР-7 tools at their current URLs.
- [x] Make the language argument required in content link helpers, and update legacy lab and task redirects to request Ukrainian links explicitly. The current content lookup remains unlocalized until Step 5.
- [x] `localeHref()` and `switchLocaleHref()` account for the base path. Before switching languages, the switcher must remove the base path from the current URL, then build the new URL.

**Done when:** a regular production build contains exactly the URLs from the Step 0 list, with no `/en/` pages. (Step 2 complete.)

### Step 3. Translate the interface text

- [x] Put the Ukrainian and English interface text in `ui.ts`. This includes the header and footer, home and course pages, navigation, and lab, assignment, and slide labels.
- [x] Include labels used by assistive technologies: `aria-label` in `ThemeToggle`, `skipLabel` in `DeckLayout`, and other component labels.
- [x] Move the copy-button text from `docs.ts` into the dictionary and pass it to the script through `data-*` attributes.
- [x] Make course names and descriptions language-specific.
- [x] Move the default `label: 'ТЗ'` and `eyebrow: 'Технічне завдання'` out of the assignment schema and into the dictionary. Explicit frontmatter values for Lab 7 — “Макет” and “Макет і дизайн-система” — continue to override them.
- [x] Do not translate lab, assignment, or lecture content as part of this work. Add content translations separately after the infrastructure is in place.

**Done when:** shared interface elements use the route language, untranslated content keeps its original language markers, and the checks plus production and English-enabled builds pass. (Step 3 complete.)

### Step 4. Add the language switcher

- [X] Add a `UK | EN` switcher to the header.
- [X] Show the switcher only when English is enabled. It is hidden in production.
- [X] Add the required accessibility attributes (`aria-current` and `lang`).
- [X] When switching languages, link to the same page if that language version exists. If it does not, link to the course page (or the hub when there is no course page). The lab list's “In Ukrainian” link is separate: it opens the Ukrainian lab directly.

**Done when:** in development, you can switch languages on the home page, course page, lab, and lecture; there is no switcher in production.

### Step 5. Move the content and add fallbacks

- [X] Move the existing Ukrainian labs, assignments, and lectures into `uk/` folders.
- [X] Move the existing React and Web Accessibility preview placeholders into their courses' `en/` folders. Keep them as English-language placeholders, not translated course materials, and preserve the courses' existing dev-only visibility.
- [X] Remove `lang:` from lab and task frontmatter when moving the files. Update the lab and task schemas so language comes from the folder, and content IDs include the course, language, and slug.
- [X] Find lecture decks from their course/language folders instead of maintaining a hand-written import list in `src/data/lectures/index.ts` (for example, with `import.meta.glob`). Each deck file must export its own `summary` alongside `deckTitle` and `slides`.
- [X] If an English lab file is missing, the English lab list links directly to the Ukrainian lab page and marks it as “In Ukrainian”. Do not generate a duplicate English page. Apply the same check independently to a practical assignment.
- [X] Store English content that has no Ukrainian version in `en/`; do not show it in the Ukrainian list or generate a Ukrainian route for it.
- [X] Update `plugins/base-links.mjs` so every eligible root-relative URL still receives the site's base path, but `/en/` is added only to links under a course path (`/<course>/…`) whose English target exists. Keep `/labs/` URLs—including downloads such as `/labs/watchlist-starter.zip` and legacy lab links—unlocalized. If a linked lab or task has no English file yet, keep its Ukrainian course URL as the fallback.
- [X] Before implementing the Markdown link rule, verify whether Sätteri's plugin context provides the source file through `ctx.fileURL` for collection entries. If it does not, use another explicit, reliable way to provide the source locale and the set of existing English targets; do not infer the locale from the URL being rewritten.
- [X] Validate the course folder and language in `assertInCourse`, not in the Zod schema.
- [X] On an English lab page, show prev/next links only to English lab versions that exist. If an adjacent lab has no English version, omit that link rather than linking to a Ukrainian page.

**Done when:** existing Ukrainian URLs have not changed; the two existing English placeholders remain dev-only; a future English translation of a lab or lecture can be added by adding files only, with no code changes; and Markdown links select an existing localized page or the Ukrainian fallback without localizing downloads.

### Step 6. Update PDF and assignment scripts

- [ ] Update paths in scripts that read Markdown from lab or assignment folders.
- [ ] By default, `python docs/build-handout.py lab-11` reads the Ukrainian file from `uk/` and creates `public/labs/lab-11.pdf`.
- [ ] Do not generate English PDFs as part of this work. Revisit English handouts alongside future content translations.

**Done when:** `python docs/build-handout.py lab-11` still creates `public/labs/lab-11.pdf`.

### Step 7. Update documentation and verify the result

- [ ] Update `README.md`, `AGENTS.md`, the route tables in `docs/agents/design-system.md`, and lab documentation that mentions the changed paths.
- [ ] Remove the obsolete `lang:` field from authoring examples in `docs/lab-2/content-map.md`, `docs/lab-2/implementation.md`, `docs/lab-1-implementation-guide.md`, and `docs/individual-assignment-implementation-guide.md`.
- [ ] Add a short explanation of how to add an interface string and how to add a lab translation later.
- [ ] Check the documentation and code for outdated content paths.
- [ ] Run `npm run check && npm run build`; compare production URLs with the Step 0 list. The production build must not contain new `/en/` pages.
- [ ] Update `.github/workflows/pr-check.yml` to run a second build with the English-pages environment variable enabled. This validation build must not deploy; its purpose is to catch broken English routes and translated content in future translation PRs.
- [ ] Check Ukrainian pages with `npm run preview`. Check English pages with `npm run dev` or a local build with the environment variable enabled.
- [ ] Retake the screenshots from Step 0 for the same pages and viewport sizes so the interface changes can be compared.

**Done when:** checks pass, production URLs are unchanged, and there are no broken links. Before/after screenshots are available for comparison.

## Key decisions

- Ukrainian is the primary language and remains at the current URLs.
- This work establishes language infrastructure only; content translations are separate follow-up work.
- English is available locally and in a non-deploying CI validation build; production remains Ukrainian-only until English is intentionally published.
- New lab translations will be submitted in separate PRs; adding a translation should require new files only.
- The English list may link to the Ukrainian version with a notice. English-only content does not appear in the Ukrainian list.
- Who will proofread the English text and whether English PDFs are needed will be decided before the first translation PR.
- The visual design, automatic browser-language switching, and ЛР-7 checking tools are unchanged.

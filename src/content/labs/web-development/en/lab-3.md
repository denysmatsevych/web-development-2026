---
number: 3
title: "AI-assisted semantic HTML and SEO: optimizing the structure, metadata, and content of a web page"
summary: "Audit and AI-assisted refactoring of the page from Lab 2: semantic elements, heading hierarchy, document metadata, SEO content, links, and alt text."
discipline: "Modern Web Development: HTML, CSS, JS/TS"
level: "Year 3, Computer Science"
format: "Individual"
duration: "2 academic hours (the practical part builds on Lab 2)"
updated: 2026-09-20
handout: /en/web/labs/lab-3.pdf
---

> **Deadline:** 25.09.2026.

## 1. Aim

Explore the principles of building a semantic HTML structure for a web page, and
the role of headings, metadata, links, and text content in accessibility and SEO.
Learn to use AI assistants to audit and refactor HTML while keeping control of
the structure, content, and quality of your own code.

## 2. Objectives and learning outcomes

After completing this lab, you must be able to:

- Understand the purpose of semantic HTML elements and build a logical document
  structure.
- Build a heading hierarchy and explain the role of `h1`–`h6` in the structure of
  the content.
- Know the purpose of the main elements and meta tags in `<head>`, in particular
  `title` and `meta description`.
- Write clear text content, links, and alternative descriptions for images.
- Distinguish semantic decisions from visual styling and use `a` and `button`
  correctly.
- Use AI assistants to audit HTML, verify their recommendations against the
  documentation, and carry out well-founded refactoring.

## 3. Lab tasks

1. **Run a series of experiments** on semantic HTML, heading structure,
   metadata, and SEO content, relying on the official documentation and your own
   experiments in the browser.
2. **Analyze the result of [Lab 2](/web-development/labs/lab-2/)** and identify
   which parts of the existing HTML structure can be improved without changing
   the main visual concept.
3. **Do the AI-assisted optimization** on the web page you already built in Lab 2.
4. **Write a research report** that contains the experiment results, links to
   sources, and the reasoning behind your decisions.
5. **Defend your work orally**, explaining the semantic structure, metadata,
   content, and use of AI in your own project.

## 4. Research tasks

_Before starting the practical part, study the theory and run the experiments.
Add the results (observations and conclusions) to your report. Verify every HTML
and SEO decision against the sources listed below._

### 4.1. Semantic HTML and document structure

**Study:**

1. [MDN — Semantic HTML](https://developer.mozilla.org/en-US/curriculum/core/semantic-html/)
2. [MDN — Structuring documents](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Structuring_documents)
3. [MDN — HTML elements reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements)

**Research:**

- What is semantic HTML, and how does it differ from using the generic `div`?
- What are `header`, `nav`, `main`, `section`, `article`, `aside`, and `footer`
  for?
- When is it appropriate to use `section`, and when `div`?
- Why does semantic structure matter for more than the visual organization of a
  page?
- Analyze the HTML of your Lab 2 work and determine which elements already have
  the right semantics and which can be improved.

**Practical mini-experiment.** Create two small structures for the same content:

```html
<div class="header">...</div>
<div class="main">...</div>
<div class="footer">...</div>
```

```html
<header>...</header>
<main>...</main>
<footer>...</footer>
```

Compare the structures in terms of semantics and accessibility. Explain what
information the second structure conveys explicitly.

### 4.2. Headings and content hierarchy

**Study:**

4. [W3C WAI — Headings](https://www.w3.org/WAI/tutorials/page-structure/headings/)
5. [Google Search Central — SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)

**Research:**

- What role do `h1`–`h6` play?
- How does the visual size of text differ from its semantic heading level?
- How should the heading hierarchy of a page be built?
- Why should you not use headings just to get the font size you want?
- Analyze the headings of your own Lab 2 page and build its logical hierarchy.

**Mini-experiment.** Build this structure:

```text
H1 - main topic of the page
  H2 - first section
    H3 - subsection
    H3 - subsection
  H2 - second section
```

Explain what problems arise if you use, for example, H1 → H4 → H2 instead of a
logical structure.

### 4.3. HTML `<head>` and page metadata

**Study:**

6. [MDN — Web page metadata](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Webpage_metadata)
7. [Google Search Central — Meta tags and attributes](https://developers.google.com/search/docs/crawling-indexing/special-tags)
8. [Google Search Central — Influencing title links in Google Search](https://developers.google.com/search/docs/appearance/title-link)

**Research:**

- What is `<title>` for?
- What is `<meta name="description">` used for?
- How do `charset`, `viewport`, `robots`, and other metadata differ?
- Which metadata can affect how a page is presented in search results?
- Why must `title` and `meta description` match the actual content of the page?
- Find out whether Google uses the `keywords` meta tag, and conclude whether it
  is worth using.

**Practical mini-experiment.** Compare two versions of `<head>`:

```html
<title>Pricing</title>
<meta name="description" content="Pricing page">
```

```html
<title>SaaS Pricing Plans - Basic, Pro and Enterprise</title>
<meta name="description" content="Compare Basic, Pro and Enterprise SaaS pricing plans and choose a plan for your team.">
```

Explain which version gives more information to the user and to the search
engine, and why.

### 4.4. SEO content: text, links, and images

**Study:**

9. [Google Search Central — SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
10. [Google Search Central — Link best practices](https://developers.google.com/search/docs/crawling-indexing/links-crawlable)
11. [Google Search Central — Image SEO best practices](https://developers.google.com/search/docs/appearance/google-images)

**Research:**

- What should the text content of a page be like from the user's point of view?
- What role do the words that describe the main topic of the page play?
- How should you write links so their text is clear without context?
- Why can `<a>Learn more</a>` be less informative than a specific description of
  the page?
- What is `alt` in `<img>` used for?
- Why should you not artificially repeat keywords in text, headings, or `alt`?

**Mini-experiment.** Compare:

```html
<a href="/plans">Click here</a>
<a href="/plans">Compare our pricing plans</a>
```

```html
<img src="pricing.jpg" alt="pricing plans">
<img src="pricing.jpg" alt="Three SaaS pricing plans: Basic, Pro and Enterprise">
```

Explain what information becomes clearer to the user and to the search engine.

### 4.5. AI-assisted HTML and SEO audit

_Use the AI assistant as a tool for analysis and for generating suggestions, not
as a source of truth._

**Task.** Give the AI assistant the HTML of your Lab 2 page and write an audit
request. For example:

```text
Analyze this HTML in terms of semantic HTML, heading hierarchy, metadata,
and basic on-page SEO. For each proposed change, explain which problem it
solves. Do not rewrite the code right away - first produce a list of
recommendations.
```

After you get the response:

- Select the recommendations that have a factual basis.
- Verify them against the official sources [1]–[11].
- Reject recommendations that contradict the documentation or have no practical
  value.
- Implement the justified changes.
- For at least three changes, record what the AI suggested, whether you accepted
  it, and why.

## 5. Practical part: AI-assisted optimization of the web page from Lab 2

> **Important!** For the practical part, use your completed
> [Lab 2 assignment](/web-development/labs/lab-2/task/) as the basis. Do not
> create a new layout. The main visual concept and styling of the Lab 2 page must
> be preserved, and the changes in this lab must concern mainly the HTML
> structure, metadata, content, and semantics.

### 5.1. Semantic page structure

- Add the structural elements `header`, `nav`, `main`, and `footer` to the
  existing page.
- Organize the content in `main` into logical sections.
- Use semantic elements instead of generic containers wherever there is matching
  HTML semantics.

Recommended structure:

```html
<header>
  <nav>...</nav>
</header>

<main>
  <section>...</section>
  <section>...</section>
</main>

<footer>...</footer>
```

### 5.2. Headings and content structure

Build a logical heading hierarchy for the page. An approximate structure:

```text
H1 - main topic of the page
  H2 - pricing plans
    H3 - Basic
    H3 - Pro
    H3 - Enterprise
```

If necessary, rewrite the text from Lab 2 so that it describes the content of the
page, not just the visual layout.

### 5.3. Optimizing `<head>`

Add and correctly configure the minimum required metadata:

```html
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>...</title>
  <meta name="description" content="...">
  <link rel="canonical" href="...">
</head>
```

The `title` and `description` elements must be unique, specific, and match the
actual content of the page.

### 5.4. Optimizing text content

- Review the `h1`, the pricing section heading, the short description, the plan
  names and descriptions, and the button/link texts.
- Make sure the content is clear to the user and matches the main topic of the
  page.
- Avoid artificial keyword repetition and keyword stuffing.
- If needed, rework button or link texts so they describe the action or the
  purpose of the navigation.

### 5.5. Links and interactive elements

Analyze the buttons from Lab 2. Decide which elements should be links by their
function and which should be real buttons.

```html
<a href="...">...</a>
<button>...</button>
```

For example, if an element leads to another page or section, it must be a link,
not a fake button. The link text must be clear without additional context.

### 5.6. AI-assisted optimization

Audit your existing Lab 2 implementation with an AI assistant. Do not limit
yourself to asking for a full rewrite of the HTML. First get an analysis and
recommendations, and then decide on your own how to implement them.

- at least 3 AI recommendations;
- verification of the recommendations against the documentation;
- implementation of the justified changes;
- an explanation of at least 3 accepted or rejected recommendations.

**Requirements for the final implementation**

1. **Semantic HTML.** `header`, `nav`, `main`, `section`, `article`, and `footer`
   are used where they are semantically appropriate.
2. **Heading hierarchy.** A logical `h1` → `h2` → `h3` structure, with no heading
   used purely for styling.
3. **Metadata.** `lang`, `charset`, `viewport`, a meaningful `title`, and a
   `meta description` are set correctly.
4. **Content.** The texts match the content of the page, read naturally, and
   contain no keyword stuffing.
5. **Links and actions.** `a` and `button` are used according to their purpose.
6. **AI-assisted workflow.** AI was used for auditing/refactoring, and you made
   the decisions about the code.

## 6. Report requirements

**Email subject:**

```
[Web] Lab 3: AI-assisted Semantic HTML and SEO: Optimizing the Structure, Metadata, and Content of a Web Page
```

In the email, include links to:

```
GitHub repository: https://github.com/<username>/<repository>
GitHub Pages: https://<username>.github.io/<repository>/
Vercel: https://<project>.vercel.app/
```

> **Important!** The report for this lab is the completed and deployed result
> based on your Lab 2 work. To defend your work, you need to understand and be
> able to explain:
>
> - why you used a particular semantic element for a particular part of the page;
> - why the headings have exactly this hierarchy;
> - why you created the specific `title` and `meta description`;
> - why a particular element is implemented as `a` rather than `button`;
> - which recommendation the AI proposed, and why you accepted or rejected it.

Always include screenshots of the **DevTools** panel (the Elements tab) and of
the HTML/structure check results that support your conclusions.

## 7. Oral defense

Handing in this lab includes an oral interview about your practical
implementation. Even if part of the HTML or text content was suggested by AI, you
must be able to explain your own decisions and the differences between the
original and the updated versions.

**Sample defense questions (with screen sharing):**

- Show the `header` → `nav` → `main` → `footer` structure. Why did you use these
  particular elements on your page?
- Show the `h1`–`h3` hierarchy. Why is one heading an `h2` and another an `h3`?
- Open `<head>`. Why do you need `title` and `meta description` in your case?
- Show one example of `a` and one example of `button`. Why are they used this
  way?
- Show an AI recommendation that you rejected or changed after checking the
  documentation.

## 8. Grading

1. A successful defense — **2 points**.
2. An additional **1 point** if either of the following applies:
   - you submit by **September 25, 2026**, OR
   - you do the work in class.

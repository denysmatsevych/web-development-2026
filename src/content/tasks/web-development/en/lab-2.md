---
title: "Pricing section"
summary: "A responsive section with a heading, a lead, and three pricing cards. HTML and CSS only — no JavaScript."
goal: "Build a simple responsive pricing section from the provided layout and deliberately apply the box model, cascade, specificity, inheritance, CSS variables, and style reuse. The practical part corresponds to section 5 of the lab."
label: "Assignment"
highlights:
  - "No JavaScript"
  - "3 cards"
  - "768px breakpoint"
  - "Bonus until September 23, 2026"
acceptance:
  - "Structure — heading, description, 3 pricing cards, buttons"
  - "Basic — $10 / month; 1 User; 5GB Storage; Basic Support"
  - "Pro — $29 / month; 5 Users; 50GB Storage; Priority Support; visual emphasis"
  - "Enterprise — $99 / month; Unlimited; 1TB Storage; 24/7 Support"
  - "CSS variables — colors, fonts, and spacing moved into :root"
  - "Box model — box-sizing: border-box; correct padding / border / sizes"
  - "Inheritance — shared properties inherited from body"
  - "Reuse / DRY — shared classes for cards and buttons; minimal duplication"
  - "Responsive — below 768px the cards stack in one column"
  - "AI-assisted — code reviewed and refactored by you"
mockup: pricing
updated: 2026-09-18
---

## 1. Overview

Build one page section with a heading, a short description, and three pricing
cards. This assignment does not need JavaScript: the focus is on HTML and CSS.
The approximate appearance of the section is shown above: on a wide screen the
three cards sit in one row, and the Pro card is visually emphasized.

**Plans**

- **Basic** — $10 / month — 1 User, 5GB Storage, Basic Support — `Select`
  button.
- **Pro (Active)** — $29 / month — 5 Users, 50GB Storage, Priority Support —
  `Get Started` button. The card must be visually emphasized.
- **Enterprise** — $99 / month — Unlimited, 1TB Storage, 24/7 Support —
  `Contact` button.

## 2. HTML structure

Use a semantic structure: a page section, a container, a section heading, and
three `article` cards. Use a bulleted list `<ul>` for the plan's feature list.

## 3. CSS variables

Move all the main colors, base font sizes, and spacing into `:root`. In the
rules that follow, use the `var(...)` function instead of duplicating values by
hand.

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

## 4. Required CSS rules

**Box model.** Apply `box-sizing: border-box` to all elements. The cards must
have `padding`, `border`, `border-radius`, and a controlled width.

**Inheritance.** Set the shared font and base color on `body`, instead of
duplicating them on every element.

**Specificity.** For the Pro card, use a modifier such as
`.pricing-card--featured`. Avoid overly long selectors and unjustified
`!important`.

**Reusable classes.** Identical button styles must be moved into a shared
`.btn` class, with the variants in modifiers.

**DRY.** Do not duplicate identical values and rules for the three cards if
they can be described by one shared class.

## 5. Layout and responsiveness

On a wide screen, the three cards must sit in one row. On screens narrower than
about 768px, they must switch to one column.

## 6. AI-assisted development

You can use AI to get a first HTML/CSS version. For example, you can ask the
assistant to create a section with three pricing cards from this layout.

> **Example prompt.** Create HTML and CSS for a pricing section with three
> cards: Basic, Pro, and Enterprise. Use semantic HTML, CSS variables, a shared
> button class, and simple responsiveness.

**After generation, you must:**

- check the HTML structure;
- check the box model and the card sizes;
- check the cascade and the specificity of the selectors;
- remove CSS duplication;
- move repeated values into CSS variables;
- check responsiveness in the browser;
- rework the code wherever the AI produced an unnecessary or overly complex
  construction.

## 7. Acceptance criteria

| Component / requirement | What is checked |
| --- | --- |
| Structure | Heading, description, 3 pricing cards, buttons. |
| Basic | $10 / month; 1 User; 5GB Storage; Basic Support. |
| Pro | $29 / month; 5 Users; 50GB Storage; Priority Support; visual emphasis. |
| Enterprise | $99 / month; Unlimited; 1TB Storage; 24/7 Support. |
| CSS variables | Colors, fonts, and spacing moved into `:root`. |
| Box model | `box-sizing: border-box`; correct padding/border/sizes. |
| Inheritance | Shared properties inherited from `body`. |
| Reuse / DRY | Shared classes for cards and buttons; minimal duplication. |
| Responsive | Below 768px the cards stack in one column. |
| AI-assisted | Code reviewed and refactored by you. |

## 8. What to show during the check

- Open DevTools and show the box model for one card.
- Show the rule that won in the cascade/specificity and explain why.
- Show an inherited property, for example `font-family`.
- Change one CSS variable in `:root` and demonstrate the effect on the page.
- Show a shared button or card class and explain how it reduces duplication.

> **Summary.** The result should be a simple, neatly built, responsive pricing
> section. What matters is not the amount of styling, but your understanding of
> how CSS determines sizes, the cascade, inheritance, and reuse.

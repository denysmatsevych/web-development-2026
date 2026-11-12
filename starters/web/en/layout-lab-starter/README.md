# Layout Lab — starter project for Lab 6

Markup for the code challenges of Lab 6, “Responsive layout, container
queries, fluid typography, and debugging CSS layout”.

The lab: <https://denysmatsevych.github.io/web-development-2026/en/web-development/labs/lab-6/>

## Contents

```text
index.html          list of challenges
base.css            shared styles: font, colors, the look of cards and buttons — no layout
img/product.svg     image for the product card
challenge-01/       Flexbox: responsive header
challenge-02/       Grid: adaptive card layout
challenge-03/       Responsive page layout: Grid + Flexbox
challenge-04/       Subgrid: aligned cards
challenge-05/       Container query: reusable card (and Challenge 6 — container query units)
challenge-07/       Fluid typography — starting CSS with breakpoint-based typography
challenge-08/       Debug the layout — a page with deliberately introduced errors
challenge-09/       AI-generated layout review — the task only; the AI agent writes the code
challenge-10/       Final responsive component
```

In each folder, `index.html` holds the markup and `style.css` is your CSS. You
don't need to change `base.css`: it deliberately has no layout.

Each challenge's task is in the “Task” block at the top of its page (click the
heading to collapse it). The full text is in the lab.

Challenge 9 has no markup: put the AI agent's answer, unchanged, in
`challenge-09/original/` and your fixed version in `challenge-09/final/`, so
you can compare the initial and final CSS.

## Running it locally

There is no build step: these are static files. You can open the pages
directly, but it is easier to start a local server in the project root:

```bash
# Node
npx serve .

# or Python
python -m http.server 8000
```

Then open the address the server prints: `http://localhost:3000/` for `serve`,
`http://localhost:8000/` for Python.

## Checking your layout

- **Device Toolbar** (Ctrl+Shift+M) — change the viewport width and watch how
  the layout behaves.
- **Elements → Layout** — Grid and Flexbox overlays.
- **Elements → Computed** — the actual `width`, `font-size`, and so on.
- For Challenges 5–6, change the width of the **container**, not the viewport:
  in DevTools, edit `width` on `.sidebar`, `main`, or `.modal`.

## Deploying

Put the project in your own GitHub repository and publish it on GitHub Pages
and Vercel — your email needs links to both deployments (§8 of the lab).

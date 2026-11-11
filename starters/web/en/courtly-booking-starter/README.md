# Courtly Booking — starter project for Lab 10

A venue catalogue for the fictional Courtly service: search by city and sport,
date selection, venue cards, booking dialog, and bookings list. This is a
**teaching starter**: the code is written as if it were assembled quickly before
a deadline. At first glance the application appears functional, but it contains
deliberately introduced JavaScript defects — finding, proving, and fixing them
is the objective of this lab.

Task description and expected application behavior:
<https://denysmatsevych.github.io/web-development-2026/en/web-development/labs/lab-10/> and
<https://denysmatsevych.github.io/web-development-2026/en/web-development/labs/lab-10/task/>.

## Contents

```text
index.html          application page
css/tokens.css      Courtly design tokens (the same as in Lab 7)
css/styles.css      styles
data/venues.json    venue data
js/main.js          entry point: attaches event listeners
js/api.js           fetchVenues() — server API simulation
js/render.js        cards and search results
js/booking.js       booking dialog and "My bookings"
js/format.js        price and date formatting
img/                logo, favicon, venue images
.nojekyll           ensures GitHub Pages does not skip underscore files
```

There is no build step: these are static files served as-is. JavaScript is
loaded via ES modules (`<script type="module">`).

## Running locally

Do **not** open `index.html` via `file://`: the browser will block ES modules
and will not execute `fetch()` for `data/venues.json`. Start a local server in
the project root — for example, Live Server in VS Code, or:

```bash
# Node
npx serve .

# or Python
python -m http.server 8000
```

and open the URL printed by the server.

## Deployment

You can place the contents of this folder either in a **separate repository** or
in the `lab-10/` folder of your shared coursework repository. All paths in the
project are relative, so it works both from the origin root and from a
subfolder.

### GitHub Pages

1. Push the files to your repository.
2. Settings → Pages → Source: *Deploy from a branch*, `main` branch, `/` folder.
3. The page will appear at `https://<username>.github.io/<repository>/`
   (or `…/<repository>/lab-10/` if the project is in a subfolder).

If the project is in a subfolder, also copy `.nojekyll` to the repository root:
GitHub Pages checks for this file at the root of the published branch.

### Vercel

1. [vercel.com](https://vercel.com) → Add New → Project → import repository.
2. Framework Preset: **Other**. Leave Build Command and Output Directory blank —
   there is nothing to build.
3. If the project is in a subfolder — **Root Directory → `lab-10`**.

## Constraints

- No bundlers, libraries, or frameworks — only HTML, CSS, and JavaScript.
- Do not rewrite the application from scratch: the module architecture and
  visual appearance must remain intact.
- Courtly is a fictional service. Venue names, pricing, and contact details
  are also fictional.

## Asset licenses

- Montserrat font — SIL Open Font License 1.1, loaded from Google Fonts.
- Images were created for this course (Lab 7 asset pack).

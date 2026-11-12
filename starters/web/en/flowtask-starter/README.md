# FlowTask — starter project for Lab 4-5

The landing page of FlowTask, a fictional SaaS service. This is a **teaching
starter**: the code is written as if it were assembled quickly before a
deadline. The page looks acceptable, but it has accessibility, technical SEO,
and performance problems — finding, confirming, and fixing them is the task of
the lab.

- The lab: <https://denysmatsevych.github.io/web-development-2026/en/web-development/labs/lab-4/>
- The assignment: <https://denysmatsevych.github.io/web-development-2026/en/web-development/labs/lab-4/task/>

## Contents

```text
index.html          main page — the main object of the audit
about.html          second page (needed for sitemap and canonical)
css/styles.css      all styles
js/main.js          navigation, FAQ accordion, form, promo banner
img/                hero, logo, feature icons, avatars
fonts/              local webfont
robots.txt
.nojekyll           so that GitHub Pages doesn't skip files whose names begin with _
```

There is no build step: these are static files, served as they are.

## Running it locally

Do **not** open the pages via `file://`: neither `robots.txt` nor accurate load
measurements work that way. Start a local server in the project root:

```bash
# Node
npx serve .

# or Python
python -m http.server 8000
```

Then open the address the server prints: `http://localhost:3000/` for `serve`,
`http://localhost:8000/` for Python.

## Deploying

Run the audit on the **deployed** version, not locally.

You can put the contents of this folder either in a **separate repository** or
in the `lab-4/` folder of your shared repository for lab assignments. Both
options work — they differ only in the deployment settings below.

### GitHub Pages

1. Upload the files to the repository.
2. Settings → Pages → Source: *Deploy from a branch*, branch `main`, folder `/`.
3. The page will appear at
   `https://<username>.github.io/<repository>/` — or
   `https://<username>.github.io/<repository>/lab-4/` if the project is in a
   nested folder.

If the project is in a nested folder, also copy `.nojekyll` to the root of the
repository: GitHub Pages looks for this file at the root of the published
branch.

Note that the project is served under `/<repository>/`, not from the origin
root. For one of the files in this project, that matters — see §4.6 of the lab.

### Vercel

1. [vercel.com](https://vercel.com) → Add New → Project → import the same
   repository.
2. Framework Preset: **Other**. Leave Build Command and Output Directory
   empty — there is nothing to build.
3. If the project is in a nested folder — **Root Directory → `lab-4`**. Without
   this, `robots.txt` won't end up at the origin root.
4. Deploy. The project is served from the origin root:
   `https://<project>.vercel.app/`.

After both deployments, the page is available at two different URLs. Choosing
which one is canonical is part of the task (§7 of the assignment).

## Constraints

- No bundler, preprocessor, or framework — only HTML, CSS, and JS.
- You don't need to build the layout from scratch: the visual concept of
  FlowTask must remain unchanged.
- FlowTask is a fictional product. So are its texts, testimonials, and contacts.

## Asset licenses

- The Inter font — SIL Open Font License 1.1 (© The Inter Project Authors).
- The images were generated for this assignment.

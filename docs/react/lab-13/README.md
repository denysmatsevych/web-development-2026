# Lab 13 — React Router, protected routes and lazy loading

| Route | Source | What it is |
| --- | --- | --- |
| `/react/labs/lab-13/` | `src/content/labs/react/uk/lab-13.md` | the handout: a walkthrough of React Router's data mode on a given blog (§4.3, with the same blog in the declarative mode and a comparison table), four code challenges on a cinema site with given pages (§4.4 routes and the shared layout, §4.5 the account's nested routes and booking, §4.6 middleware guards with `redirectTo` and `safeRedirect`, §4.7 lazy routes and `HydrateFallback`), two measurement tables, the AI rule, checks, `vercel.json` and Vercel (§4.8); report, defence; no extra task since 2026-11-28 |
| `/uk/react/starters/lab-13.zip` | `starters/react/lab-13/` | the starter: the cinema's pages, data and fake session, stubs, the blog in `example/`, the given tests in `tests/`, unpacked by students into `react-labs/lab-13/` |
| `/uk/react/labs/lab-13/result.webp` | the reference solution | «Мої квитки» with two tickets at 1280 px, in the handout's §1 |

No PDF yet: the instructor reviews the lab on localhost first (2026-11-27).

`solution/` holds the instructor's material (gitignored): `stages/`, one
folder per challenge and per extra task (`4.4-routes` … `4.7-lazy`,
`4.9.1-focus` … `4.9.4-watch`), each holding only the files it changes,
copied over the starter in order (an extra task over `4.4`–`4.7`);
`make-wrong-variants.py` and its `wrong-variants/` (plausible mistakes,
§4.6's partial steps and accepted alternatives, each with a `BASE` file);
`rename-test/`, the blog's code with the cinema's names (the plan's
decision 26); `shots.mjs`, the headless Edge checks and the screenshot; the
2026-11-27 `prototype/`; and a `README.md` with the results the defence
asks for. The plan the lab was built from is
[routing-protected-routes-and-lazy-loading-plan.md](routing-protected-routes-and-lazy-loading-plan.md).

## Changed on 2026-11-28 (the instructor's review on localhost)

- **§4.4–§4.7 are numbered steps,** in words without code, each ending with
  «Крок завершено, коли…» and the tests that pass by then; the challenge
  template («Що має вийти», «Що вже є», «Код», «Перевірка») is gone. The
  steps name the decisions the plan had left to students (the 404 inside
  the root route, `end` on «Профіль», one pathless route with
  `requireUser`, `replace` after sign-in); the defence asks why
  (the instructor's choice: the lab was too hard to follow).
- **§4.9, the extra task, is removed** (the instructor's decision), with
  its tests (`tests/extra/`), the `admin/` and `watch/` pages, the watchlist,
  the admin account and the second Vitest project; `npm test` is plain
  `vitest` again, and ЛР 13 gives no extra point, so current work can reach
  72. Its reference stages stay in `solution/stages/4.9.*` for later. The
  report no longer asks what the cinema needed beyond the blog.
- **The router moved into `App.jsx`** in the cinema and the blog, so
  `main.jsx` only renders `<App />` into `#root`, as in the earlier labs;
  the blog's declarative version is `example/DeclarativeApp.jsx`.
- **`/login` is added in §4.4** with the other public pages, so students can
  sign in while doing §4.5.
- **`HydrateFallback` moved from §4.7 to §4.6:** middleware also makes the
  first render wait, and once the warning test collects warnings from the
  start of its file, the §4.6 stage failed it without a fallback. Stages
  still pass 1, 5, 11, 18 and 20 of 20. `solution/wrong-variants/` was
  generated before these changes and wasn't rerun.

## Where the build differs from the plan

- **The plan's proposals were built as written** (decisions 5–22 and
  26–30), on the instructor's "реалізуй ЛР-13" after the plan was merged.
- **20 main tests in four files** (`routes` 5, `account` 5, `protected` 7,
  `lazy` 3) and **15 extra tests** (`focus` 3, `admin` 4, `pending` 2,
  `watch` 6). The starter passes 1 of 20 («головна сторінка показує
  афішу»); the stages pass 5, 11, 18 and 20. In the extra project the
  finished main part passes 1 of 15 (focus stays on `<body>` on the first
  load), and each extra stage passes its own file.
- **Two render checks in §4.6's tests.** A guard written as a component
  (`<Navigate>` inside `AccountLayout`, `BookingPage` and `LoginPage`)
  passed the plan's seven tests. The first test now also checks that
  `AccountLayout` doesn't render for a guest, and the fifth that
  `LoginPage` doesn't render for a signed-in user (spies on their modules,
  as in ЛР-12). The handout's «Що має вийти» says both.
- **§4.6's return test keeps the query:** the guest opens
  `/booking/s2?from=schedule`, so a `requireUser` that keeps only the path
  fails it; the plan's requirement said "with its path and query".
- **The `HydrateFallback` test collects warnings from the start of its
  file.** React Router prints the warning through `warningOnce`, so the
  booking test, which opens a lazy page first, used it up, and a variant
  without `HydrateFallback` passed 20 of 20.
- **§4.9.2 and §4.9.4: where a middleware error is shown.** React Router
  shows an error thrown before `next()` from the highest matched route that
  has middleware, a loader or `lazy` (the client middleware error handler
  in `lib/router/router.js`; the Middleware page's «`next()` and Error
  Handling» says "the highest route with a loader"). A route placed inside
  a pathless route that carries `requireUser` therefore sends its error to
  the root's default error page. The handout points to that section and
  doesn't give the tree; the variants that fail this way are in
  `solution/README.md`.
- **The extra tests' file names:** `tests/extra/focus`, `admin`, `pending`,
  `watch`, as the plan; §4.9.4's third test also checks that a guest goes to
  «Вхід» before the online check.
- **`eslint.config.js` ignores `**/dist`,** not only `dist`: a build of the
  blog (`vite build example`) writes `example/dist`, which ESLint otherwise
  lints.
- **Films are real Ukrainian classics** with year, director and a
  one-sentence description, no running times.

## Verified on 2026-11-27

In a scratch `react-labs` workspace on Windows 11, Node.js 24.20.0, npm
11.19.0: react-router 8.5.3, React 19.3.1, Vite 8.4.0, Vitest 5.1.2,
qrcode 1.5.4.

- The starter and every stage pass ESLint and Prettier and build; test
  counts as above. The blog lints, formats and builds with
  `vite build example --config vite.config.js`.
- Every wrong variant fails at least one test of its challenge, and the
  accepted alternatives (`requireUser` on each route, the function form of
  `lazy`, an absolute child path that starts with the parent's, the watch
  route nested under `movies/:movieId`) pass.
- §4.6's steps pass 1, 4, 6 and 7 of its tests, as the handout says.
- The rename test matches the plan's expectation (`solution/README.md`).
- The blog, in both modes, through probe tests in the scratch workspace:
  posts, a post, the unknown post under the header, 404 without it, the
  guard and the sign-in to `/`, the lazy «Про блог».
- In headless Edge (`solution/shots.mjs`) on `vite preview`: the Network
  table's three visits, the guest's return with «Назад» and «Вперед»,
  booking two seats, a reload of `/account/tickets`, «Вийти»; no horizontal
  scroll at 390, 1000 or 1280 px on seven pages; Tab reaches the header,
  the seats and the account's menu with a visible focus ring, Space
  toggles a seat; the console clean on the reference (dev and preview) and
  on the blog. The blog's Network tab requests `AboutPage.jsx` only when
  «Про блог» opens.
- The site: `npm run check` and `npm run build` pass.

Not verified: a timed dry run; the zip unpacked into a fresh `react-labs`
(it is packed from the committed starter); the Vercel project and its
rewrite; a screen reader; Firefox and Safari; the declarative blog in a
browser (it ran in tests only).

## Build

```bash
git add starters/react/lab-13                                # the script packs tracked files only
python docs/web/build-pack.py starters/react/lab-13          # public/uk/react/starters/lab-13.zip
```

Rebuild the zip after the starter is committed: each entry is dated by the
file's last commit. The PDF (`python docs/web/build-handout.py lab-13
react`) waits for the instructor's review; then add `handout:` to the
frontmatter. Keep code lines in the handout within 75 characters.

To check the stages again: copy the starter into a `react-labs` workspace,
copy `solution/stages/*` over it in order, and run `npm test -- --run`,
`npm run test:extra`, `npm run lint`, `npm run format:check` and `npm run
build`; for a wrong variant, copy the stages its `BASE` file names, then the
variant folder.

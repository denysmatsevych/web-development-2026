# Lab 13 — React Router, protected routes and lazy loading

| Route | Source | What it is |
| --- | --- | --- |
| `/react/labs/lab-13/` | `src/content/labs/react/uk/lab-13.md` | the handout: a walkthrough of React Router's data mode on a given blog (§4.3, with the same blog in the declarative mode and a comparison table), four tasks in numbered steps on a cinema site with given pages (§4.4 routes and the shared layout, §4.5 the account's nested routes and booking, §4.6 middleware guards with `redirectTo` and `safeRedirect`, §4.7 lazy routes), two measurement tables, the AI rule, checks, `vercel.json` and Vercel (§4.8); report, defence; no extra task since 2026-11-28 |
| `/uk/react/starters/lab-13.zip` | `starters/react/lab-13/` | the starter: the cinema's pages, data and fake session, stubs, the blog in `example/`, the given tests in `tests/`, unpacked by students into `react-labs/lab-13/` |
| `/uk/react/labs/lab-13/result.webp` | the reference solution | «Мої квитки» with two tickets at 1280 px, in the handout's §1 |
| `/uk/react/labs/lab-13.pdf` | built from the handout | the downloadable handout, 19 pages |

The PDF was built on 2026-11-28, after the instructor's review on localhost
and the PR review's fixes.

`solution/` holds the instructor's material (gitignored): `stages/`, one
folder per task (`4.4-routes` … `4.7-lazy`), each holding only the files it
changes, copied over the starter in order, and the removed extra task's
stages (`4.9.1-focus` … `4.9.4-watch`), kept for later. `4.9.1` focuses the
page's `<h1>`, so it needs `tabIndex={-1}` back on the headings; the starter
dropped it on 2026-11-28. Also there: `make-wrong-variants.py` and its
`wrong-variants/` (plausible mistakes, §4.6's partial steps and accepted
alternatives, each with a `BASE` file); `rename-test/`, the blog's code
with the cinema's names (the plan's decision 26); `shots.mjs`, the headless
Edge checks and the screenshot; the 2026-11-27 `prototype/`; and a
`README.md` with the results the defence asks for. The plan the lab was
built from is
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
  72. The report no longer asks what the cinema needed beyond the blog.
- **The router moved into `App.jsx`** in the cinema and the blog, so
  `main.jsx` only renders `<App />` into `#root`, as in the earlier labs;
  the blog's declarative version is `example/DeclarativeApp.jsx`.
- **`/login` is added in §4.4** with the other public pages, so students can
  sign in while doing §4.5.
- **`HydrateFallback` moved from §4.7 to §4.6:** middleware also makes the
  first render wait, and once the warning test collects warnings from the
  start of its file, the §4.6 stage failed it without a fallback.

## Changed after the PR review (2026-11-28)

- **§4.3's declarative part:** `<BrowserRouter>` changes the address inside
  `startTransition`, so after a click on «Про блог» the address is already
  `/about` while the previous page stays on screen; the `<Suspense>`
  fallback shows only when the page is opened by its address. The text and
  the comparison table said the fallback shows while the code loads. The
  table now has a row for a click and a row for opening by address, and
  `handle` (used only by the removed §4.9.1) is gone from it.
- **«Чому `safeRedirect`» (§4.6) names the real risk.** In React Router
  8.5.3, `navigate()` refuses any address on another site («External
  navigation is not allowed»), while a `redirect` from middleware follows
  "explicit" ones, and React Router counts `//host` as explicit. So the
  off-site redirect comes from `guestOnly`; on «Вхід», `safeRedirect` turns
  that error into a move to `/account`. The handout said the sign-in itself
  would send the user away.
- **The given `safeRedirect` compares origins through `new URL`.** The
  string checks let `/<Tab>/host` through; React Router's own guard then
  showed its error page instead of leaving the site.
- **Two tests close gaps.** `lazy`'s first test also checks that both
  routes have a `lazy` property: `React.lazy` in `Component` passed all 20
  tests and flips the guest row of the second measurement table. §4.6's
  return test opens `/booking/s2?from=schedule&row=3`: an unencoded
  `redirectTo` passed it. The handout's reason for encoding (`/` and `?`)
  was wrong and now names `&`.
- **Smaller fixes:** «завдання» instead of «challenge» in the handout and
  the starter's README; the defence no longer attributes `location.state`
  to the Robin Wieruch article (it has none) or asks where students found
  what the steps now give, and its lazy-loading question no longer presumes
  the answer; §4.3 says the blog's files may change only for a moment;
  §4.7 says to open DevTools in the new tab before the address;
  `MEASUREMENTS.md` points to §4.7's steps; stale comments in
  `tests/setup.js` and `HydrateFallback.jsx`; `tabIndex={-1}` and
  `h1:focus` (for §4.9.1's focus) removed from the starter.

## Where the build differs from the plan

- **The plan's proposals were built as written** (decisions 5–22 and
  26–30), on the instructor's "реалізуй ЛР-13" after the plan was merged,
  then changed on 2026-11-28 as above.
- **20 tests in four files** (`routes` 5, `account` 5, `protected` 7,
  `lazy` 3). The starter passes 1 of 20 («головна сторінка показує
  афішу»); the stages pass 5, 11, 18 and 20.
- **Two render checks in §4.6's tests.** A guard written as a component
  (`<Navigate>` inside `AccountLayout`, `BookingPage` and `LoginPage`)
  passed the plan's seven tests. The first test now also checks that
  `AccountLayout` doesn't render for a guest, and the fifth that
  `LoginPage` doesn't render for a signed-in user (spies on their modules,
  as in ЛР-12). §4.6's introduction says the tests check this.
- **§4.6's return test keeps the query:** the guest opens
  `/booking/s2?from=schedule&row=3`, so a `requireUser` that keeps only the
  path, or doesn't encode `redirectTo`, fails it; the plan's requirement
  said "with its path and query".
- **The `HydrateFallback` test collects warnings from the start of its
  file.** React Router prints the warning through `warningOnce`, so the
  booking test, which opens a lazy page first, used it up, and a variant
  without `HydrateFallback` passed 20 of 20.
- **`eslint.config.js` ignores `**/dist`,** not only `dist`: a build of the
  blog (`vite build example`) writes `example/dist`, which ESLint otherwise
  lints.
- **Films are real Ukrainian classics** with year, director and a
  one-sentence description, no running times.

The removed extra task's findings (where React Router shows an error thrown
by middleware) are in `solution/README.md`.

## Verified

In a scratch `react-labs` workspace on Windows 11, Node.js 24.20.0, npm
11.19.0: react-router 8.5.3, React 19.3.1, Vite 8.4.0, Vitest 5.1.2,
qrcode 1.5.4.

On 2026-11-27 and 2026-11-28, before the PR review:

- The blog lints, formats and builds with
  `vite build example --config vite.config.js`.
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

After the PR review's fixes, on 2026-11-28:

- The starter and every stage in `solution/stages/4.4`–`4.7` pass ESLint and
  Prettier and build; they pass 1, 5, 11, 18 and 20 of 20 tests. Following
  the handout's steps one by one gives the counts each step names,
  including §4.6's 1, 4, 6 and 7.
- These mistakes fail a test: no `HydrateFallback`; an unencoded
  `redirectTo`; `React.lazy` in `Component`; sign-in without
  `safeRedirect`. These alternatives pass: `requireUser` on each route,
  `HydrateFallback` on the pathless route, the function form of `lazy`.
  `solution/wrong-variants/` itself wasn't rerun.
- The given `safeRedirect` returns `/account` for `//host`, `/\host`,
  `\\host`, `/<Tab>/host`, `/<LF>/host`, `https://host` and
  `javascript:` addresses, and keeps a path with its query.
- The declarative blog's behaviour after a click and on opening by
  address, in a probe test with a held `React.lazy` import; the data mode's
  (old address, `useNavigation()` «loading») the same way.
- In headless Edge on `vite preview`, with a dead local port as the other
  site: without `safeRedirect`, a sign-in on «Вхід» stays there with
  «External navigation is not allowed», and `guestOnly` sends a signed-in
  user off-site for `//host` and `http://host`.
- The site: `npm run check` and `npm run build` pass.

Not verified: a timed dry run; the zip unpacked into a fresh `react-labs`
(it is packed from the committed starter); the Vercel project and its
rewrite; a screen reader; Firefox and Safari; the declarative blog in a
browser (it ran in tests only).

## Build

```bash
git add starters/react/lab-13                                # the script packs tracked files only
python docs/web/build-pack.py starters/react/lab-13          # public/uk/react/starters/lab-13.zip
python docs/web/build-handout.py lab-13 react                # public/uk/react/labs/lab-13.pdf, from PowerShell
```

Rebuild the zip after the starter is committed: each entry is dated by the
file's last commit. Rebuild the PDF after every handout edit; the
handout's `handout:` field points to it. Keep code lines in the handout
within 75 characters, or they wrap in the PDF.

To check the stages again: copy the starter into a `react-labs` workspace,
copy `solution/stages/4.4-routes` … `4.7-lazy` over it in order, and run
`npm test -- --run`, `npm run lint`, `npm run format:check` and `npm run
build`; for a wrong variant, copy the stages its `BASE` file names, then the
variant folder.

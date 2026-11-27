# Plan: React ЛР-13 «Налаштування React-маршрутизації, захищених роутів та лінивого завантаження»

Status: built on 2026-11-27 (see [README.md](README.md) for what the
build changed); the proposals below were built as written. Proposed on
2026-11-27. Four decisions were settled with the
instructor before the plan was written (see **Decisions**, 1–4): a new app,
React Router's data mode with middleware for the protected routes and the
declarative mode shown as an example, React Router 8 rather than the
programme's v7, and three extra tasks of which a student picks one. The
rest are proposals that need the instructor's confirmation before the lab is
built. A prototype of the challenges, the declarative example and the three
extra tasks was built and checked the same day (see **Verification**). It
lives in the gitignored `solution/` folder next to this file, together with
the results the defence asks for. Once the lab is built, the lasting facts
go into this folder's `README.md`, as for ЛР-12, and this file stays as the
plan.

**Revised on 2026-11-27, after the instructor's review** (decisions 23–30).
A student's feedback on ЛР-12 asked for code that shows how a pattern
works, and the instructor set the rule this revision follows: an example
shows a mechanism, and an example that gives the task's code once its names
are changed is the solution. So §4 now opens with a walkthrough of routing
on a small given app, «Блог» (§4.3, with the declarative mode at its end),
and the cinema is the task (§4.4–§4.7), stated as requirements for the site
rather than as a route tree. A fourth extra task, «Дивитися» і «Мій
список», joins the three. The blog and the fourth task are not prototyped
yet (see **Verification**).

**Revised again on 2026-11-27, after the PR review,** with probes on the
prototype. React Router marks a `NavLink` to `/` only at `/`, with or
without `end`, so «Афіша» needs no `end`. The `end` decision moves to the
account's menu in §4.5, where «Профіль» links to `/account`. §4.6 gets a
seventh test, a signed-in user with a foreign `redirectTo`, because none of
the other six caught a `guestOnly` without `safeRedirect`. The «Назад» test
now checks the page «Назад» lands on. §4.7's first test checks that the
routes reach the lazy pages, so it no longer passes on the starter.
Decision 26 now says what the rename test protects. The reasons the
defence asks for moved to `solution/README.md`.

The challenge format, the test tooling and the AI rule come from ЛР-7, with
the changes ЛР-11 and ЛР-12 made. Their plans,
[../lab-7/custom-hooks-and-render-props-plan.md](../lab-7/custom-hooks-and-render-props-plan.md),
[../lab-11/use-reducer-and-complex-state-plan.md](../lab-11/use-reducer-and-complex-state-plan.md)
and [../lab-12/context-and-prop-drilling-plan.md](../lab-12/context-and-prop-drilling-plan.md),
hold them, and this plan names only what ЛР-13 changes. The handout follows
ЛР-12's handout as it was built and revised on 2026-11-26
([../lab-12/README.md](../lab-12/README.md)).

## Context

From [../course-plan.md](../course-plan.md), row 3.2:

- **Тема:** «Налаштування React-маршрутизації, захищених роутів та лінивого
  завантаження»
- **Самостійна робота:** «Створення структури роутингу» (2 год.)
- **Читання:** Основна 3 (React Router Documentation, v7)
- **Position:** the first lab of Part 3, after ЛР-12 and before ЛР-14 (HTTP
  clients and TanStack Query). Lecture 5 (row 3.1) covers client-side
  routing with React Router and async APIs, so presentation topics П5.1
  (React Router's three modes), П5.3 (protected routes and authentication),
  П5.4 (accessible client-side routing), П5.8 (nested routes and layouts)
  and П5.9 (errors in routes) are defended around this lab. П6.4 (code
  splitting, `React.lazy`, Suspense) belongs to Lecture 6 and ЛР-16. No
  deck is built yet, so the readings carry the topic, as in every lab so
  far.

What earlier labs left for this one:

- **ЛР-10's coffee shop ran on a given hash router:** `useRoute` read
  `location.hash` through `useSyncExternalStore`, a `Link` set the hash,
  and `paths` built the addresses. ЛР-10's plan kept React Router for this
  lab. Its handout's folder examples were a cinema site (about, contacts, a
  movie page with reviews, the schedule, seat booking on two pages), and
  this lab builds that cinema as a real app. The new app was the
  instructor's choice (decision 1); the cinema is this plan's proposal for
  it (decision 5).
- **ЛР-10's hybrid structure** (§4.7 there: `app/`, `routes/<route>/`,
  `shared/`) is the starter's layout. Each route folder is then what a lazy
  route imports, so the folders from ЛР-10 and the code splitting in §4.7
  line up.
- **ЛР-10's cart was an external store** read with `useSyncExternalStore`.
  The fake session in this lab is one too, not a context (decision 8).
  ЛР-12's decision 17 had left "an authentication context" to ЛР-13; this
  plan replaces it, and the defence asks why (the answer is in
  `solution/README.md`).
- **ЛР-5's form with `FormData`** is the given login form; ЛР-6's
  `useActionState` stays where it was, since React Router's `action` is out
  of scope (decision 21).
- **ЛР-7's and ЛР-12's `vi.mock`:** a module factory counts when a page's
  module is loaded, which is what §4.7's tests check (see **What the tests
  check**).

### What the lab is for

The lab introduces React Router's data mode in two parts. First a
walkthrough (§4.3): a small blog, given and running in the starter, shows
each mechanism once in its simplest form, and students run it and try a few
changes; then the same blog in the declarative mode (`<BrowserRouter>`,
`<Routes>`, a `RequireAuth` component with `<Navigate>`, `React.lazy` and
`<Suspense>`), the way most tutorials from before data routers wrote it,
with a table that compares the two modes. Students read the declarative
version; they don't write it (decision 29).

Then the task: routing for the cinema, whose pages are given, in four
challenges students can check. Each states what the site must do; how the
route tree gets there is the student's design (decision 27):

1. **Routes and a shared layout** (§4.4): the films, a film by its address,
   the schedule and a 404 page, all under the site's header, whose links
   mark the current page for screen readers.
2. **Nested routes** (§4.5): the account section with a heading and menu of
   its own around its pages, the menu marking the current page, and the
   booking page.
3. **Protected routes** (§4.6): the account and booking only for a
   signed-in user, checked by middleware; a guest goes to «Вхід» and comes
   back where they were going, only to an address on this site; a signed-in
   user doesn't see «Вхід»; «Вийти» leaves the protected page.
4. **Lazy routes** (§4.7): the booking and tickets pages' code loaded only
   when they open, a page opened at such an address shows without React
   Router's warning, and the effect measured in the build output and the
   browser's Network tab.

What the walkthrough shows and what the cinema adds is in the table under
**The walkthrough**.

The extra task (§4.9) is one of four, the student's choice, each with
tests of its own (decisions 4 and 25): the tab title and focus after
navigation, an administrator's page closed to other users, a loading
indicator while a lazy page's code downloads, or «Дивитися» і «Мій список»:
watching a film online and a list of saved films, both for signed-in users.

Two measurements run through the lab, recorded in a `MEASUREMENTS.md` the
starter provides: the build's files and sizes before and after §4.7, and
which JavaScript files the browser requests when a guest and a signed-in
user open a protected page. The second answers a question the lab wants
students to ask: does a protected route keep its code away from a guest?
(The prototype's answer is in `solution/README.md`.)

### The readings

Checked on 2026-11-27. React Router's docs show the version as "latest
(8.5.3)" and no page dates; the API is the reference, so the table gives
the version. None of these pages is in Ukrainian; `uk.react.dev`'s `lazy`
page is the English text.

| Page | Date | Use |
| --- | --- | --- |
| React Router: [Picking a Mode](https://reactrouter.com/start/modes) | 8.5.3 | §4 intro and §4.3's declarative part: the three modes; «By moving route configuration outside of React rendering, Data Mode adds data loading, actions, pending states and more…»; the page's API table shows which APIs each mode has (`useNavigation` only in data and framework mode; the middleware page is marked for those two modes too) |
| React Router: [Routing (Data)](https://reactrouter.com/start/data/routing) | 8.5.3 | before class. `#nested-routes`, `#layout-routes`, `#index-routes` (§4.3–§4.5), `#dynamic-segments` (§4.3, §4.4), `#splats` (404) |
| React Router: [Route Object](https://reactrouter.com/start/data/route-object) | 8.5.3 | `#middleware` (§4.3, §4.6: its `authMiddleware` throws `redirect("/login")`; §4.9.4: the `params` it gets), `#lazy` (§4.3, §4.7), `#handle` (§4.9.1) |
| React Router: [Middleware](https://reactrouter.com/how-to/middleware) | 8.5.3 | `#quick-start-data-mode`, `#authentication` under «Common Patterns» (§4.3, §4.6); the order parent → child |
| React Router: [`NavLink`](https://reactrouter.com/api/components/NavLink) | 8.5.3 | «Automatically applies `aria-current="page"` to the link when the link is active» (§4.3, §4.4); `end` (§4.5, which the blog doesn't need), with its note that `<NavLink to="/">` «effectively ignores the `end` prop and only matches when you're at the root route» (§4.4) |
| React Router: [`createMemoryRouter`](https://reactrouter.com/api/data-routers/createMemoryRouter) | 8.5.3 | how the tests render the app at any address (defence) |
| React Router: [Upgrading from v7](https://reactrouter.com/upgrading/v7) and the [React Router v8](https://remix.run/blog/react-router-v8) post (Brooks Lybrand) | 2026-06-17 | the version note: «React Router v8 removes the `react-router-dom` re-export package»; imports come from `react-router` and `react-router/dom`; middleware is always on; Node 22.22+, React 19.2.7+ (§2 note, defence) |
| React Router: [Routing (Declarative)](https://reactrouter.com/start/declarative/routing) | 8.5.3 | §4.3's declarative part: the same nesting with `<Routes>` and `<Route>` |
| Robin Wieruch: [React Router 7: Private Routes (alias Protected Routes)](https://www.robinwieruch.de/react-router-private-routes/) | 2025-01-06 | §4.3's declarative part: a `ProtectedRoute` that returns `<Navigate to={redirectPath} replace />`, and its `<Outlet>` layout variant; the defence asks where it keeps a return address |
| react.dev: [`lazy`](https://react.dev/reference/react/lazy) | current | §4.3's declarative part: `React.lazy` with `<Suspense>`; «Do not declare `lazy` components *inside* other components» |
| OWASP: [Unvalidated Redirects and Forwards Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html) | current | §4.6: «Unvalidated redirects and forwards are possible when a web application accepts untrusted input…», which is why `redirectTo` goes through `safeRedirect` |
| Vercel: [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite), «Using Vite to make SPAs» | 2026-11-14 | §4.8: «If your Vite app is configured to deploy as a Single Page Application (SPA), deep linking won't work out of the box», and the `vercel.json` with `rewrites` to `/index.html` |
| React Router: [Accessibility](https://reactrouter.com/how-to/accessibility) | 8.5.3 | §4.9.1: `NavLink` «provides context for assistive technology»; focus management and live regions after a route change are the app's job |
| Marcy Sutton (Gatsby): [What we learned from user testing of accessible client-side routing techniques…](https://www.gatsbyjs.com/blog/2019-07-11-user-testing-accessible-client-routing/) | 2019-07-11 | §4.9.1: the user research React Router's page cites; move focus on a route change. The post's own advice moved to a skip link, and the handout says the lab takes the simpler heading focus |
| react.dev: [`<title>`](https://react.dev/reference/react-dom/components/title) | current | §4.9.1: «React will always place the DOM element corresponding to the `<title>` component within the document's `<head>`» |

To check during the build: the error-boundary page
(`https://reactrouter.com/how-to/error-boundary`) and the `useNavigation`
and `isRouteErrorResponse` API pages for §4.9.2–§4.9.4, and the
`useLocation` page for §4.9.4, which the package's bundled docs have but
the web check didn't cover; the data mode
installation page for `RouterProvider` from `react-router/dom` (in the
bundled docs); and the `NavLink` page's note on `<NavLink to="/">`, quoted
from the package's `lib.d.ts`, from which the API pages are generated.

Programme reading: Основна 3 is React Router's docs, above. The programme
says v7; see **Decisions**, 3.

**Considered, not used:**

- **Framework mode** (React Router's Vite plugin, file routes, typegen):
  it changes the project's build, and П1.6, П5.1 and П7.7 cover it.
- **Loaders and actions.** Data mode's main feature, but data loading is
  ЛР-14's (TanStack Query), and П5.2 compares loaders with `useEffect`. The
  lab uses only middleware, `lazy`, `handle` and an `ErrorBoundary` from the
  route object.
- **TanStack Router.** П8.9 covers type-safe routing.
- **A real sign-in** (JWT, httpOnly cookies, OAuth). The session is a given
  fake; П5.3 and П7.10 cover the real thing, and §6 asks what a server would
  have to check.

## The app: «Кінотеатр»

A small cinema site, written for this lab (decision 5). The pages are
given; the lab is about the routes between them.

| Address | Page | Who sees it | In §4.7 |
| --- | --- | --- | --- |
| `/` | «Афіша»: cards of the films | everyone | eager |
| `/movies/:movieId` | a film: year, length, description, its sessions with links to booking | everyone | eager |
| `/schedule` | «Розклад»: sessions by day | everyone | eager |
| `/login` | «Вхід»: email and password | guests only | eager |
| `/booking/:sessionId` | «Бронювання»: the hall's seat map, «Забронювати» | signed in | lazy |
| `/account` | «Кабінет» with its own menu, «Профіль» inside | signed in | eager |
| `/account/tickets` | «Мої квитки»: each ticket with its QR code | signed in | lazy |
| `/admin` | «Адміністрування»: how full each session is (§4.9.2 only) | role `admin` | lazy |
| `/movies/:movieId/watch` | «Дивитися»: the film's player (§4.9.4 only) | signed in, film online | eager |
| `/account/list` | «Мій список»: the saved films (§4.9.4 only) | signed in | eager |
| anything else | «Сторінку не знайдено» | everyone | eager |

The header has the site's name (a link to «Афіша»), «Афіша», «Розклад»,
and either «Увійти» or «Кабінет» with «Вийти». A booking adds tickets to the
signed-in user's «Мої квитки» and goes there.

**Given data and modules** in `shared/`: `movies.js` and `sessions.js` (six
films, about a dozen sessions across three days); `tickets.js`, the user's
tickets in `localStorage`; `session.js`, a fake sign-in with two accounts
(`glyadach@kino.test` and `admin@kino.test`, one password, in the starter's
README), kept in `sessionStorage`, with `getUser()`, `signIn()` (a promise
with a short delay, rejected with «Невірна пошта або пароль»), `signOut()`
and `useUser()` through `useSyncExternalStore`; and `safeRedirect(to)`,
which returns `to` only if it is a path on this site (starts with one `/`,
not `//` or `/\`) and `/account` otherwise (decision 11). A comment in
`session.js` says that a real site keeps the session in an httpOnly cookie
set by the server, and that this module only imitates one. For §4.9.4,
each film in `movies.js` has `online: true` or `false` (four of six
online), and `watchlist.js` keeps each user's saved films in
`localStorage`, as `tickets.js` keeps the tickets.

**Why the tickets show QR codes:** e-tickets have them, and the `qrcode`
library (1.5.4) makes the tickets page's chunk large enough to see in the
build output (decision 12). Measured on the prototype; the numbers are in
`solution/README.md`.

**Size:** about 35 files in `src/`, in ЛР-10's hybrid folders: `app/`
(`main.jsx`, `routes.js`, `RootLayout.jsx`, the middleware), one folder per
route in `routes/` (`movies/`, `movie/`, `schedule/`, `login/`,
`booking/`, `account/`, `admin/`, `watch/`), and `shared/`.

## The walkthrough: «Блог» (§4.3)

A blog of a few pages, written for this lab, given and running in the
starter's `example/` folder (`npm run example`). The handout prints its code
part by part and explains each part in full sentences; students run the
blog, try the probes and read on. Nothing in it is graded or committed
(decision 28). Its job is to show how each mechanism works, once and in its
simplest form. The cinema then needs the mechanisms combined, and some the
blog doesn't show at all (decision 26).

| Address | Page | Who sees it | What it shows |
| --- | --- | --- | --- |
| `/` | «Публікації»: the posts' titles | everyone | a layout route with `<Outlet>`, an index route |
| `/posts/:postId` | a post; an unknown id shows «Публікацію не знайдено» | everyone | a dynamic segment, `useParams` |
| `/about` | «Про блог» | everyone | the route's `lazy`, `HydrateFallback` on the root route |
| `/login` | «Вхід»: one button, «Увійти як автор» | everyone | `useNavigate`: after sign-in, always to `/` |
| `/new` | «Нова публікація»: a form that saves nothing | signed in | middleware on this one route that throws `redirect('/login')` |
| anything else | «Сторінку не знайдено» | everyone | a splat route at the top level, so without the header |

The header has the blog's name, a `Link` to `/`, and `NavLink`s to «Про
блог» and «Нова публікація». The session is a small module (`getUser`,
`signIn`, `signOut`) in `sessionStorage` with one account and no password.
The blog is about ten files; its code follows the cinema's conventions
(route objects with `Component`, a plain `routes.js`).

**The probes.** Each is a change or a visit with what to look at, so a
student sees the mechanism act before reading why:

- remove `<Outlet />` from the layout: the header stays and the pages
  disappear;
- open `/posts/999` and `/nope`: the post's own message under the header,
  and a 404 page without it; the handout asks why the two differ;
- open `/new` without signing in: the address becomes `/login`; after
  signing in the blog goes to `/`, not to «Нова публікація», and the
  handout says that the cinema has to do better (§4.6);
- with the Network tab open, go to «Про блог»: a new JS file loads when the
  page opens, not before.

**What the blog shows and what the cinema adds** (decision 26):

| Mechanism | The blog (§4.3) | The cinema (§4.4–§4.7) |
| --- | --- | --- |
| Layout | one layout route with `<Outlet>` and an index route | the same, plus the account's layout inside the site's, with its own `<Outlet>` |
| Address with a parameter | `posts/:postId`, `useParams`, a message for an unknown id | the same mechanism, twice (`movies/:movieId`, `booking/:sessionId`) |
| `NavLink` | to `/about` and `/new` only; neither address starts another page's | the account's menu: «Профіль» links to `/account`, and `/account/tickets` starts with it, so it needs `end`, while «Кабінет» in the header is marked on every account page; the failing test and `NavLink`'s page lead there |
| 404 | a top-level splat, without the header | under the header |
| Protection | middleware on one route; after sign-in always `/` | several pages behind the check; back to the requested page (`redirectTo`, «Назад» that skips «Вхід»); `guestOnly`; `safeRedirect`; «Вийти» |
| Lazy loading | one public page; `HydrateFallback` | two protected pages, and what a guest's browser gets (the Network table) |
| Declarative mode | the blog again, read and compared | — |

Much of the cinema's code is the blog's API applied to other pages, which
is what the walkthrough is for (decision 23). §4.4 is the closest to the
blog: the decision in it is where the 404 page goes. §4.5 adds a layout
inside a layout and the menu's `end`, and §4.7 the blog's `lazy` on two
protected pages. The decisions sit in §4.6, the measurements and §4.9;
decision 26 lists them.

**What the blog avoids on purpose:** a page that is both protected and
lazy, a return address after sign-in, and a `NavLink` to an address that
starts another page's. What a guest's browser gets for a protected lazy
page is the question of §4.7's second table (the answer is in
`solution/README.md`), so the blog's lazy page is public and its protected
page is eager, and no probe looks at a guest's downloads.

### The declarative part (the end of §4.3)

No code to write and no commit. The handout prints the blog's routes as the
declarative mode writes them, with three parts that differ:

- `<BrowserRouter>` in `main.jsx`, and `<Routes>` with nested `<Route>`
  elements in `App`;
- a `RequireAuth` layout that reads `useUser()` and returns
  `<Navigate to="/login" replace />` or `<Outlet />`, after Robin
  Wieruch's article; like the data-mode blog, it keeps no return address;
- `React.lazy(() => import(…))` for «Про блог» and a `<Suspense>` around
  `<Routes>`.

Then a table of what changes, for the defence:

| | Data mode | Declarative mode |
| --- | --- | --- |
| Where the routes are described | an array of objects, outside React | JSX inside a component |
| When the check runs | middleware, before the route renders | `RequireAuth`, while the route renders |
| How a page's code is loaded | the route's `lazy`, during navigation | `React.lazy`, when the element first renders, with a `<Suspense>` fallback |
| What shows while it loads | the previous page, `useNavigation()` knows | the `<Suspense>` fallback |
| Middleware, `useNavigation`, `handle` | yes | no (React Router's mode table) |

The plan's first table had a row for the return address; the blog has none,
so the defence asks instead where each mode keeps one: the cinema's
`redirectTo` in the query against `location.state` in Robin Wieruch's
article. The handout also says where students meet this mode: many
tutorials and answers written before data routers (React Router 6.4), often
with `react-router-dom`, which v8 no longer publishes. The same three parts
ran in v8 on the cinema's prototype (see **Verification**); the blog's
version is checked at build time, so the handout's code is checked code.

## The challenges

Students do §4.4 → §4.7 in order, one commit each, and nothing in `tests/`
changes in any commit, as in ЛР-7, ЛР-11 and ЛР-12. Each challenge has
ЛР-12's parts as built: **Що має вийти**, **Що вже є**, **Код**,
**Перевірка**, **Коміт** and **Довідка**. **Що має вийти** says what the
site does, at which address and for whom; how the route tree gets there is
the student's design (decision 27), and the reference's tree is in
`solution/README.md`. Each challenge names the part of §4.3 it builds on.
The rules below are the test names; the tests ship in the starter.

The pages are given, so most of what students write is the route tree in
`src/app/routes.js` and a few router calls in the layouts and the pages:
about 90 hand-written lines in all on the prototype, against ЛР-12's 175,
in an API that §4.3 has just shown (see **Timing**).

### §4.4. Routes and the shared layout

**Що має вийти.** «Афіша» opens at `/`, a film at `/movies/:movieId`,
«Розклад» at `/schedule`. `MoviePage` reads the film's id from the address
instead of the prop it receives in the starter, and an unknown id shows
«Фільм не знайдено». Every page, «Сторінку не знайдено» for an unknown
address included, shows under the site's header. The header's links open
pages without reloading the site and mark the current one with
`aria-current="page"`. «Афіша» needs nothing extra: React Router marks a
`NavLink` to `/` only at `/`, and the handout quotes `NavLink`'s page on
this (checked on the prototype: without `end`, «Афіша» isn't marked on
`/schedule`, a film's page or `/account/tickets`).

The routes are objects with `Component`, not JSX `element`s, so
`routes.js` stays a plain `.js` module (see **ESLint in this lab**).

**From §4.3:** the layout, the index route, the dynamic segment and
`NavLink`. **Not in §4.3:** the 404 page under the header (the blog's is
outside it).

**Що вже є.** `main.jsx` with `createBrowserRouter(routes)` and
`<RouterProvider>` from `react-router/dom`, as in React Router's data mode
installation; a `routes.js` with one route, `/` → `MoviesPage`, so the
starter shows «Афіша» without a header; `RootLayout` with the header made
of plain `<a href>` links and a comment where the page goes; every page;
`NotFoundPage`.

**Tests** (`tests/routes.test.jsx`, 5):

- головна сторінка показує афішу (passes on the starter);
- сторінка фільму відкривається за адресою `/movies/:movieId`;
- для невідомого фільму показує «Фільм не знайдено»;
- невідома адреса показує «Сторінку не знайдено» під шапкою сайту;
- посилання «Розклад» у шапці відкриває розклад і позначене
  `aria-current="page"`, а «Афіша» — ні.

A click on a plain `<a href>` does nothing in jsdom, so the link test also
tells a `NavLink` from the starter's anchor. The handout says what a plain
anchor does in the browser: the whole page reloads.

### §4.5. Nested routes: the account and booking

**Що має вийти.** «Кабінет» at `/account` shows the heading «Кабінет» and a
menu («Профіль», «Мої квитки») around the account's pages: «Профіль» at
`/account` and «Мої квитки» at `/account/tickets`. The menu marks only the
current page, while «Кабінет» in the site's header stays marked on every
page of the account. Booking opens at `/booking/:sessionId`, and
«Забронювати» leads to «Мої квитки» with the new ticket. The handout says in
one sentence what a relative path is: a child route's path continues its
parent's.

**From §4.3:** a layout with `<Outlet>` and an index route. **Not in
§4.3:** a layout inside another layout, and `NavLink`'s `end`: the blog has
no `NavLink` to an address that starts another page's.

**Що вже є.** `AccountLayout` with the menu as `NavLink`s without `end` and
a comment where the child goes; the pages; the given session, which the
tests fill with a signed-in user, since nothing is protected yet.

**Tests** (`tests/account.test.jsx`, 5, each with a signed-in user):

- `/account` показує «Кабінет» і «Профіль»;
- `/account/tickets` показує квитки в макеті кабінету;
- на `/account/tickets` у меню кабінету позначені лише «Мої квитки», а
  «Кабінет» у шапці позначений;
- `/booking/:sessionId` показує бронювання цього сеансу;
- «Забронювати» веде в «Мої квитки», і там є новий квиток.

The third test fails without `end` on «Профіль» (checked on the prototype:
a `NavLink` to `/account` without `end` is marked on `/account/tickets`),
and it also fails if «Кабінет» in the header gets `end` too.

**Перевірка.** In `npm run dev`, open `/account/tickets` and reload the
page: Vite's dev server sends `index.html` for any address, so the page
opens. §4.8 shows that Vercel doesn't, until `vercel.json` says so.

### §4.6. Protected routes

**Що має вийти.** Booking and every page of the account open only for a
signed-in user. A guest who opens one lands on «Вхід», and the address
keeps where they were going as `redirectTo`, with its path and query. After
signing in they go there, but only to an address on this site
(`safeRedirect`), and «Назад» then leads to the page they were on before,
not to «Вхід». A signed-in user who opens «Вхід» goes to `redirectTo`, again
only on this site, or to the account. «Вийти» in the header signs out and
goes to «Афіша».

The checks are middleware, and their contract is given in the starter's
`src/app/authMiddleware.js`:

- `requireUser` throws `redirect('/login?redirectTo=…')` when `getUser()`
  returns `null`, with the requested path and query from `request.url`;
- `guestOnly` sends a signed-in user from `/login` to `redirectTo` (through
  `safeRedirect`) or to `/account`.

Which routes they go on is the student's decision, and the defence asks why
there. The handout's links for the login page's return are `useSearchParams`
and `useNavigate`'s `replace` option.

The handout defines middleware in a full sentence: a function React Router
calls before it shows a route, from the parent route down to the child,
which can stop the navigation by throwing `redirect`. It names why the
check is middleware and not a component: it runs before any part of the
protected page renders. And it says what the check doesn't do: a guard in
the browser decides what a visitor sees, while the data must be checked by
the server on every request (§6 asks what the server would check).

**From §4.3:** middleware on one route that throws `redirect`, and
`useNavigate` after sign-in. **Not in §4.3:** several pages behind the
check, the return to the requested page, `guestOnly`, `safeRedirect`,
«Вийти».

**Порядок дій:** `requireUser` on the routes it has to guard; then the
login page's return; then `guestOnly`; then «Вийти». Each step turns its
own tests green: one after `requireUser`, three after the return (the
return, «Назад», a foreign `redirectTo` at sign-in), two after `guestOnly`
and one after «Вийти». The handout ends each step with «Крок завершено,
коли…».

**Що вже є.** The stubs `requireUser` and `guestOnly`, throwing
`Not implemented: requireUser` and `Not implemented: guestOnly` once a route
uses them; `LoginPage` with the form, the error message and a comment where
the return goes; `safeRedirect` with its rule in a comment; «Вийти» that
only calls `signOut()`.

**Tests** (`tests/protected.test.jsx`, 7):

- гість, який відкриває `/account/tickets`, бачить «Вхід», а адреса
  зберігає `redirectTo=/account/tickets`;
- гість після входу повертається на бронювання, з якого прийшов;
- після входу кнопка «Назад» веде на сторінку фільму, з якої гість
  відкрив бронювання;
- `redirectTo` з адресою іншого сайту після входу веде в кабінет;
- користувач, який відкриває `/login`, потрапляє в кабінет;
- користувач, який відкриває `/login` з `redirectTo` на інший сайт,
  потрапляє в кабінет;
- «Вийти» на захищеній сторінці веде на афішу.

The «Назад» test opens a film's page, follows its link to a booking, signs
in and goes back. It checks the page «Назад» lands on, not only that «Вхід»
isn't shown: once `guestOnly` is done, a return without `replace` doesn't
show «Вхід» either (what it does instead was checked on the prototype and
is in `solution/README.md`). The sixth test is there because none of the
others catches a `guestOnly` without `safeRedirect` (see **Verification**).
**Not
tested:** which routes carry the middleware, whether the return uses
`navigate` or a `redirect`, or where the middleware file's helpers go.

### §4.7. Lazy routes

**Що має вийти.** The code of booking and «Мої квитки» downloads only when
one of these pages opens, and their imports leave the top of `routes.js`.
A site opened at one of these addresses shows «Завантаження…» (the given
`HydrateFallback`) while the page's code loads, and React Router prints no
warning («No `HydrateFallback` element provided to render during initial
hydration»). The handout explains the name in one sentence: React Router
calls the first render "hydration" even in an app with no server
rendering. Either form of `lazy` on React Router's «Route Object» page
passes (see **What the tests check**).

**From §4.3:** the route's `lazy` on one public page, and `HydrateFallback`.
**Not in §4.3:** lazy pages behind a guard, and what that means for a
guest: the question the second table answers.

**Перевірка.** The first table in `MEASUREMENTS.md`, «Файли збірки», is
filled twice: after §4.6 and after this step, from `npm run build`'s
output (each `.js` file in `dist/assets/` and its gzip size). Then the
second table, «Які JS-файли завантажує браузер»: `npm run preview`, the
Network tab with the JS filter, three visits (`/` as a guest,
`/account/tickets` as a guest, `/account/tickets` signed in), and which of
the lazy chunks each one requests. The handout asks the question the table
answers and doesn't give the answer; §6 asks to explain it.

**Що вже є.** `HydrateFallback` in `shared/components/`; the two empty
tables.

**Tests** (`tests/lazy.test.jsx`, 3):

- маршрути ведуть на бронювання й квитки, але їхній код не
  завантажується разом із маршрутами;
- відкриття бронювання завантажує його код і показує сторінку;
- лінива сторінка, відкрита за адресою, показується без попередження про
  `HydrateFallback`.

The first two count module loads through a `vi.mock` factory on each
page's module: after importing `routes` the count is 0, after opening the
page 1. A count alone would pass on the starter, whose `routes.js` doesn't
import these pages yet, so the first test also checks with `matchRoutes`
that `/booking/s1` and `/account/tickets` each match a route of their own,
not the 404's splat. It fails until §4.5 because the routes are missing,
then until §4.7 because they are imported eagerly. The third test passes
from §4.5 on, since nothing is lazy yet; it keeps §4.7 without a
`HydrateFallback` from passing.

## Extra task (§4.9): one of four

For 1 point, started in class once §4.8 is pushed, as ЛР-11's §4.8, and
finished at home before the defence if class time runs out (decision 30).
The student picks one; each has its own tests in `tests/extra/`, run with
`npm run test:extra -- tests/extra/<name>`, and one commit. A second task
doesn't add a point (decision 16).

### §4.9.1. The tab title and focus after navigation

Each route gets `handle: { title: 'Розклад' }` (and the like); `RootLayout`
reads the deepest match's title with `useMatches()` and renders React 19's
`<title>{title} — Кінотеатр</title>`. After every navigation except the
first load, focus moves to the new page's `<h1>` (given with
`tabIndex={-1}`). The handout says why, from React Router's accessibility
page and Marcy Sutton's research: after a client-side navigation the
browser keeps focus where it was, and a screen reader announces nothing.

**Tests** (`tests/extra/focus.test.jsx`, 3): назва вкладки відповідає
сторінці, відкритій за адресою; після переходу назва змінюється, а фокус
переходить на заголовок нової сторінки; при першому відкритті сайту фокус
лишається на початку сторінки. The last one catches a common wrong variant
in `<StrictMode>` (see `solution/README.md`).

### §4.9.2. A page for the administrator

`/admin` (lazy, the given `AdminPage`) with `requireAdmin` middleware: a
guest goes to «Вхід» with `redirectTo=/admin`; a signed-in user whose role
isn't `admin` gets `throw data('Доступ заборонено', { status: 403 })`.
Students write the route's `ErrorBoundary`: it reads the error with
`useRouteError()` and `isRouteErrorResponse()` and shows the given
`ErrorPage` (a heading from its `title` prop and a link to «Афіша») with
«Доступ заборонено», under the site's header. The header shows
«Адміністрування» only to the administrator.

**Tests** (`tests/extra/admin.test.jsx`, 4): гість потрапляє на «Вхід» з
`redirectTo=/admin`; глядач бачить «Доступ заборонено» під шапкою сайту;
адміністратор бачить сторінку адміністрування; посилання
«Адміністрування» в шапці бачить лише адміністратор.

### §4.9.3. A loading indicator for lazy pages

`RootLayout` reads `useNavigation()` and, while its `state` is `'loading'`,
shows «Завантаження сторінки…» in a `role="status"` element above
`<main>`; the previous page stays until the new one is ready. The handout
links React Router's pending UI guide and says why the page doesn't go
blank: data mode loads the route's code before it switches the page.

**Tests** (`tests/extra/pending.test.jsx`, 2): поки код сторінки
завантажується, показано «Завантаження сторінки…», а попередня сторінка
лишається на місці; коли код завантажено, індикатор зникає. The tests hold
the booking page's module back with an async `vi.mock` factory that waits
for a promise the test resolves.

### §4.9.4. «Дивитися» і «Мій список»

One task with two pages, added by the instructor (decision 25). Two more
pages behind the same check as in §4.6 would be a repeat worth a couple of
lines, so each page brings a mechanism the main part doesn't have:

- **«Дивитися»** opens at `/movies/:movieId/watch` from a «Дивитися» link
  on the film's page, shown for films that are online. Only a signed-in
  user watches: a guest goes to «Вхід» first, whatever the film, and after
  signing in comes back to watching that film. For a film that isn't
  online, the address shows «Фільм недоступний онлайн» under the site's
  header, through the route's `ErrorBoundary` and the given `ErrorPage`,
  as in §4.9.2. The check is middleware that reads the film's id from its
  `params`. New against §4.6: a check that depends on a parameter of the
  address and ends in an error, not a redirect, on a page whose address
  continues a public page's.
- **«Мій список»** opens at `/account/list` inside the account's layout,
  with a «Мій список» item in the account's menu. On the film's page, a
  signed-in user gets «До мого списку» or «Прибрати зі списку»; a guest
  gets a link «Увійдіть, щоб додати» to «Вхід» with `redirectTo` set to the
  film's page, so after signing in they come back to the film, not to the
  account. The page builds that address itself, with `useLocation()`. New
  against §4.6: a sign-in that starts from a link on a public page, not
  from a guard.

**Що вже є.** `online` in `movies.js`; `watchlist.js` with `getList()`,
`add()`, `remove()` and `useWatchlist()` through `useSyncExternalStore`;
`WatchPage` in `routes/watch/` (the film's poster and a player
placeholder); `WatchlistPage` in `routes/account/`; `ErrorPage` in
`shared/components/`; on `MoviePage`, inside a comment marked §4.9.4, the
«Дивитися» link for online films and `WatchlistButton`, which adds and
removes for a signed-in user and renders nothing for a guest, with a
comment where the guest's link goes. The task starts by uncommenting
them, so a student who picks another task doesn't deploy a «Дивитися» link
to the 404 page.

**Tests** (`tests/extra/watch.test.jsx`, 6): гість, який відкриває
перегляд фільму, потрапляє на «Вхід», а після входу — на перегляд цього
фільму; глядач бачить сторінку перегляду фільму, доступного онлайн; для
фільму, недоступного онлайн, показано «Фільм недоступний онлайн» під
шапкою сайту; «Мій список» відкривається в макеті кабінету й позначений у
меню як поточна сторінка; гість на сторінці фільму бачить «Увійдіть, щоб
додати», а після входу повертається на сторінку фільму; фільм, доданий
кнопкою «До мого списку», є в «Мій список». **Not tested:** whether the
online check is middleware or sits in the page (the handout asks for
middleware, and the defence asks why), and the shape of the routes.

**Time:** the largest of the four, about 20–25 minutes against 10–12 for
the others, so it is the task most likely to be finished at home.

## What the tests check, and what they don't

- **The app at any address:** a helper in `tests/app.jsx` builds
  `createMemoryRouter(routes, { initialEntries: [url] })`, renders
  `<RouterProvider>` in `<StrictMode>` (ЛР-11's rule) and returns the
  router, so a test reads `router.state.location` for the path, the query
  and the history.
- **A fresh copy of the routes for every router.** React Router writes into
  the object form's `lazy` object when it loads a property, and that object
  is shared with the module's `routes`. A second router built from the same
  objects then fails with «No route matches URL» (checked). In the browser
  there is one router, so only tests meet this; the helper copies the route
  objects, and both forms of `lazy` pass. A comment in the helper says why.
- **Signed-in tests** call a `signInAs()` helper that writes the session
  into `sessionStorage`; `tests/setup.js` clears it before each test, and
  `getUser()` re-reads storage, as ЛР-10's cart store did.
- **Module loads** through a `vi.mock` factory that counts calls and then
  returns the original module (§4.7, §4.9.3).
- **The main and the extra tests are two Vitest projects** in
  `vite.config.js`, `lab` (`tests/*.test.jsx`) and `extra`
  (`tests/extra/*.test.jsx`); `npm test` is `vitest --project lab`, and
  `npm run test:extra` is `vitest --project extra` (checked: a file filter
  works inside a project). A bare `npx vitest run` runs both, so the
  handout uses `npm test -- --run` where ЛР-12 used `npx vitest run`.
- **Not the internals:** the shape of the route tree and which routes carry
  the middleware (decision 27), the form of `lazy`, how the middleware
  builds the `redirectTo` query, `navigate` or `redirect` after sign-in, how
  «Вийти» navigates, where the layouts' helper code goes.
- **Not the blog:** `example/` has no tests; the handout's probes are what
  students check in it.

## ESLint in this lab

Checked with ЛР-12's config (`eslint-plugin-react-hooks` 7.1.1,
`eslint-plugin-react-refresh` 0.5.8 through `reactRefresh.configs.vite`):

- `routes.js` with `Component: X` and no JSX is a plain module, so
  `react-refresh/only-export-components` doesn't apply to it; the
  middleware file is a plain module too.
- The prototype's app code lints clean; the only report was a probe's use
  of `process` in a test helper, which the starter doesn't have.
- To check at build time: each extra task's reference, and `example/`,
  which `npm run lint` covers with the same config.

## Design principles

ЛР-7's, ЛР-11's and ЛР-12's principles apply. In addition:

1. **The route tree is the work.** The pages are given; students design the
   route tree from the site's requirements (§4.4–§4.7) and write the
   layouts' outlets, the guards and the few router calls.
2. **One mode in code, one in reading.** Data mode is written; the
   declarative mode, which students will meet in older code, is read on the
   blog and compared (§4.3).
3. **A guard in the browser is about what a visitor sees.** The lab
   measures what it doesn't do (the Network table) and says where the real
   check belongs.
4. **Every address from outside is checked** before the app goes there
   (`safeRedirect`).
5. **Measure what lazy loading changes:** the build output and the Network
   tab, before and after.
6. **No data loading.** Loaders and actions are left to Lecture 5's topics
   and ЛР-14, so the lab stays about routes.
7. **An example shows a mechanism; the task asks for decisions.** The
   blog shows each mechanism once and in its simplest form. Its code with
   the cinema's names gives the API of §4.4, §4.5 and §4.7, which is what
   the walkthrough is for, and none of the decisions listed in decision 26.
   The same test applies to the probes: none of them answers a measurement
   or a defence question about the cinema.

## Timing

The slot is 80 minutes.

| Step | Handout | Minutes |
| --- | --- | --- |
| Starter, `npm install`, `npm test`, first commit | §4.1 | 5 |
| The AI rule, as in ЛР-12 | §4.2 | 1 |
| The blog: run it, read its code, the probes | §4.3 | 13 |
| The blog in the declarative mode, the table | §4.3 | 5 |
| Routes, the layout, `NavLink`, `useParams` | §4.4 | 9 |
| The account's layout and children, `end`, booking | §4.5 | 8 |
| Middleware, the login page's return, «Вийти» | §4.6 | 15 |
| `lazy`, `HydrateFallback`, two builds, the Network table | §4.7 | 10 |
| Checks, `vercel.json`, `git push`, the Vercel project | §4.8 | 6 |
| **The lab** | | **72** |
| One extra task | §4.9 | 10–12; §4.9.4 20–25 |

These are estimates; the timed dry run decides. A proxy from the prototype,
counting lines written by hand: §4.4 about 35, §4.5 about 15, §4.6 about
30, §4.7 about 10, about 90 in all, against ЛР-12's 175 and ЛР-8's 132.
The lines are fewer, but each is a new API, so the rows give §4.4 and §4.6
more time than their lines would at ЛР-12's pace, and §4.7 adds two builds
and three visits in the Network tab. The walkthrough adds about 18 minutes
and should take a few off §4.4–§4.6, where the API is no longer new
(14 → 9, 8 → 8 with `end` moved there from §4.4, 16 → 15 against the
first version of this plan). The lab
still grows from 65 to about 72 of the 80 minutes, so few students will
start §4.9 in class, which decision 30 allows for. How long ЛР-12 took in
class is the better guide. If the lab takes longer than 72 minutes, the
cuts, in order:

1. fill «Файли збірки» once, after §4.7, with the eager size given in the
   handout;
2. give `guestOnly` in the starter (two tests pass from the start);
3. move §4.3's declarative part to the defence's reading, done at home;
4. keep two of §4.3's four probes;
5. make the Network table a defence question instead of a table.

## Starter: `starters/react/lab-13/` → `/uk/react/starters/lab-13.zip`

Packed like ЛР-12's: `python docs/web/build-pack.py starters/react/lab-13`
after the starter is committed. Configs are ЛР-12's, except
`vite.config.js` (the two test projects) and `package.json`.

```text
starters/react/lab-13/
├── .gitignore, .prettierrc.json, eslint.config.js, jsconfig.json   ЛР-12's
├── vite.config.js         ЛР-12's, plus test.projects: lab, extra
├── index.html             lang="uk", <title>ЛР-13. Кінотеатр</title>
├── package.json           "name": "lab-13"; react-router ^8.5.3, qrcode ^1.5.4;
│                          "test": "vitest --project lab", "test:extra": "vitest --project extra",
│                          "example": "vite example --config vite.config.js" (the blog, §4.3)
├── README.md              the app, the two accounts, the blog, «Що вже є», the commands
├── MEASUREMENTS.md        two empty tables: «Файли збірки», «Які JS-файли завантажує браузер»
├── public/favicon.svg
├── example/               the blog (§4.3), complete and running: index.html, main.jsx,
│                          routes.js, Layout.jsx, session.js, the pages; the declarative
│                          version as main-declarative.jsx + App.jsx, not wired in, to read
├── src/
│   ├── app/
│   │   ├── main.jsx            createBrowserRouter(routes), <RouterProvider> in <StrictMode>
│   │   ├── routes.js           one route: / → MoviesPage
│   │   ├── RootLayout.jsx      the header with plain <a> links; «Вийти» only signs out
│   │   ├── authMiddleware.js   stubs: requireUser, guestOnly (§4.6)
│   │   └── index.css
│   ├── routes/            movies/, movie/ (MoviePage takes movieId as a prop; the
│   │                      «Дивитися» link and WatchlistButton in a comment, §4.9.4),
│   │                      schedule/, login/, booking/ (+ SeatMap), account/
│   │                      (AccountLayout, ProfilePage, TicketsPage, WatchlistPage for
│   │                      §4.9.4), admin/ (§4.9.2), watch/ (§4.9.4)
│   └── shared/            auth/session.js, data/ (movies with `online`, sessions,
│                          tickets, watchlist), utils/safeRedirect.js, components/
│                          (NotFoundPage, HydrateFallback, ErrorPage for §4.9.2, §4.9.4)
└── tests/                 setup.js, app.jsx (renderApp, signInAs, the route copy),
                           routes, account, protected, lazy; extra/focus, extra/admin,
                           extra/pending, extra/watch
```

The blog runs with `npm run example` on its own Vite root, so `npm run
dev`, `build` and the tests don't see it. Vite looks for its config in the
root it is given, so without `--config` the blog would run without the
lab's `vite.config.js` and its React plugin (checked in Vite 8.4: JSX still
builds, but without Fast Refresh; with `--config`, the dev server serves
`@react-refresh`). Whether Vite serves both roots at once
on two ports, and how the blog shares `react-router` from the workspace, is
checked at build time.

The starter's tests: `npm test -- --run` passes one test («головна
сторінка показує афішу») and fails the rest with readable messages. In the
extra project each task's file fails until the task is done, though single
checks that already hold on the starter pass (focus staying on `<body>` on
the first load, the guest not seeing «Адміністрування»).

The starter is a new app with no earlier lab's answers, so the branch can
be pushed as soon as it is ready (unlike ЛР-12's).

## Handout: `src/content/labs/react/uk/lab-13.md`

About ЛР-12's length. The blog's code is printed in §4.3, part by part;
the cinema's is not, and no example in the handout gives one of the
cinema's decisions listed in decision 26. Frontmatter as in ЛР-12, with
`number: 13`, the programme's title
and `duration: "2 академічні години (самостійна робота — 2 години)"`.
`handout:` is added once the PDF is built after the instructor's review.
Ukrainian only; English later. ЛР-12's revised style: definitions as full
sentences, no story frames, literal names for tables and steps, no «живе».

Draft `summary`: «Спершу ви розбираєте маршрутизацію React Router на
прикладі невеликого блогу: макет, сторінку за адресою, захищену сторінку,
ліниве завантаження і той самий блог у декларативному режимі. Потім
налаштовуєте маршрути сайту кінотеатру з готовими сторінками: спільний
макет, сторінка фільму за адресою, вкладені маршрути кабінету й сторінка
404. Кабінет і бронювання доступні лише після входу, а сторінка входу
повертає туди, куди користувач ішов. Код двох сторінок завантажується
лише тоді, коли їх відкривають, і це видно в збірці та у вкладці Network.
Чотири code challenges з готовими тестами Vitest, +1 бал за одне з
чотирьох додаткових завдань. Деплой на Vercel.»

**Top note.** The usual «Примітка щодо актуальності», naming React 19,
React Router 8, Vite 8 and Vitest 5, and one more sentence: the programme
names React Router 7; the lab uses 8, the current version since
2026-06-17, whose data mode API is the same, and old tutorials' imports
from `react-router-dom` now come from `react-router`.

### §1. Мета роботи

Draft, in ЛР-12's form (a lead sentence and one bullet per challenge):

«Навчитися налаштовувати маршрутизацію React-застосунку за допомогою
React Router:

- описувати маршрути об'єктами, показувати сторінки в спільному макеті та
  читати параметри з адреси;
- будувати вкладені маршрути з власним макетом;
- закривати сторінки від гостей за допомогою middleware і повертати
  користувача після входу лише на адреси цього сайту;
- завантажувати код сторінки лише тоді, коли її відкривають, і
  перевіряти це у збірці та у вкладці Network.»

§4.3 defines the terms as full sentences, each where the blog first shows
it: маршрут (a route connects an address pattern to what the app shows),
макет (a layout route shows the parts common to its children and an
`<Outlet>` where a child goes), вкладений маршрут, індексний маршрут,
динамічний сегмент, middleware, ліниве завантаження (lazy loading means
the browser downloads a page's code only when the page is opened).

**Очікуваний результат:** `lab-13/` passes `npm test -- --run` (all main
tests), `npm run lint`, `format:check` and `build`; both tables in
`MEASUREMENTS.md` are filled; the site works in `npm run dev`; the app is on
Vercel, and a page opened by its address there doesn't return 404.
Screenshot `/uk/react/labs/lab-13/result.webp` at 1280 px: «Мої квитки»
with two tickets and their QR codes, the header with «Кабінет» marked.

### §2. Корисні посилання

The readings table, in its order, with ЛР-12's opening paragraph: before
class, React Router's «Routing (Data)» page; the rest when §4.3 or a
challenge points to it. Inline links, as in ЛР-12, and the note that the pages are in
English.

### §3. Завдання

ЛР-12's list: §4.1 starter; §4.3 the blog, in both modes; §4.4–§4.7
with their topic; §4.8 checks and Vercel; §5 report; §4.9 one extra task
of four. Then ЛР-12's notes: all in class, 1 point after the defence plus 1
for one task of §4.9, which may be finished at home before the defence,
unfinished challenges at home, and the AI line pointing to §4.2. §4.3 is
not graded and has no commit.

### §4. Хід виконання

- **4.1. Стартовий проєкт.** ЛР-12 §4.1 with `lab-13`, plus
  `MEASUREMENTS.md` and the two accounts in the file table. `npm test`:
  one test passes from the start, and the handout says why. Commit
  `chore: add lab 13 starter`.
- **4.2. Правила роботи з AI.** ЛР-12's rule.
- **4.3. Розбір: маршрутизація на прикладі блогу.** As under **The
  walkthrough**: `npm run example`, the blog's code part by part with the
  terms defined where they first appear, the probes, then the declarative
  version and the table. No commit.
- **4.4–4.7.** As under **The challenges**, with these commits:
  `feat: add the routes and the shared layout`;
  `feat: add the nested account routes`;
  `feat: protect the account and booking routes`;
  `perf: load the booking and tickets pages lazily`.
- **4.8. Перевірки, GitHub і Vercel.** All checks; `vercel.json` with the
  rewrite from Vercel's Vite page, in `lab-13/` (commit
  `chore: serve index.html for every address on Vercel`); `git push`; a new
  Vercel project `react-lab-13` with Root Directory `lab-13`; open
  `/account/tickets` on the deployed site, sign in, reload. The history is
  the starter's commit plus five.
- **4.9. Додаткове завдання.** The four tasks, one commit for the chosen
  one: `feat: set the title and move focus after navigation`,
  `feat: add the administrator's page`,
  `feat: show a loading indicator for lazy pages`, or
  `feat: add watching and the watchlist`.

### §5. Вимоги до звіту

Subject `[React] ЛР-13: React Router, захищені маршрути й ліниве
завантаження`, with ЛР-12's two lines for `lab-13`. The report contains:

1. a screenshot of `npm test -- --run` with all main tests passing;
2. a screenshot of `npm run lint`, `format:check` and `build`;
3. both tables from `MEASUREMENTS.md`, copied or linked on GitHub;
4. the Vercel address of a page inside the account, opened directly;
5. per challenge (§4.4–§4.7), one or two sentences on what was done and
   what the cinema needed that the blog didn't show;
6. which §4.9 task was done, with its tests' screenshot, or that none was;
7. whether AI was used, and for what;
8. a short conclusion.

### §6. Усний захист

ЛР-12's intro. Grouped interview questions, answerable from the lab and its
readings, asking to explain or compare rather than to recall:

- **«Клієнтська маршрутизація»:** what a client-side router does instead of
  the browser; what `<Link>` does that `<a href>` doesn't; why Vercel needs
  `vercel.json` and Vite's dev server doesn't; a hash router (ЛР-10)
  against the History API.
- **«Маршрути й макети»:** a layout route and `<Outlet>`; an index route
  against a child with a path; why the account's child paths are relative;
  `useParams` and where the param's name comes from; how the splat route
  works and why the unknown film shows its own message; `NavLink`'s
  `aria-current`; why «Профіль» needs `end` while «Кабінет» and «Афіша»
  don't.
- **«Режими React Router»:** the three modes and what data mode adds;
  §4.3's table: when each mode checks the user, how it loads a page's code
  and what shows meanwhile; where each mode keeps a return address (the
  cinema's query against `location.state` in Robin Wieruch's article); why
  v8 has no `react-router-dom`, and what to change in a tutorial written
  for it.
- **«Блог і кінотеатр»:** what the cinema needed that the blog didn't show,
  and where you found how to do it; why the blog's 404 page has no header
  and the cinema's has one; how the cinema's guard differs from the blog's.
- **«Захищені маршрути»:** what middleware is and in which order it runs;
  which routes your guard sits on, why there, and what would change if it
  sat on each protected route; why `redirectTo` is in the query and
  not in `location.state`; why `replace` after sign-in, and what «Назад»
  does without it; why `safeRedirect` in both the login page and
  `guestOnly`, and what an open redirect would let someone do; why the session is a
  store, not a context; why «Вийти» has to navigate; what a server would
  check that the browser can't.
- **«Ліниве завантаження»:** what `lazy` changes in the build, from the
  first table; whether a guest's browser gets the protected pages' code,
  from the second table, and why that doesn't make the site less safe;
  `HydrateFallback` and when it shows; the route's `lazy` against
  `React.lazy`, and what `React.lazy` can load lazily that a route's `lazy`
  can't (react.dev's `lazy` page).
- **«Тести»:** how a test opens the app at an address; why the helper copies
  the routes; how a test sees that a module wasn't loaded; why the extra
  tests are a separate Vitest project.
- **«Додаткові завдання»:** for each task, asked of everyone at the level of
  the readings and in depth of those who did it: focus and the tab title
  after navigation, and why not on the first load; a 403 page against a
  redirect to «Вхід»; why data mode keeps the previous page while the next
  one loads; a sign-in that starts from a link on a public page against one
  that starts from a guard, what middleware gets besides the request, and
  why a film that isn't online is an error and not a redirect.

The handout's §6 will be the full list; the answers go in
`solution/README.md`.

### §7. Критерії готовності

«Лабораторна робота оцінюється в 1 бал після захисту (§6); одне завдання
§4.9 — ще 1 бал.» The main table:

| Критерій | Мінімальна вимога |
| --- | --- |
| Тести | у теці `lab-13` `npm test -- --run` проходить: усі тести; файли в `tests/` не змінено в жодному коміті |
| Якість | `npm run lint` без помилок і попереджень; `format:check` і `build` — без помилок |
| Маршрути | усі адреси з таблиці застосунку, крім сторінок §4.9, відкриваються; сторінки показано в спільному макеті |
| Захист | гість не бачить кабінету й бронювання; після входу повертається на сторінку, з якої прийшов, лише в межах сайту |
| Ліниве завантаження | бронювання й квитки — окремі файли збірки |
| Вимірювання | обидві таблиці в `MEASUREMENTS.md` заповнено |
| GitHub | коміт стартового проєкту й по одному на §4.4–§4.7 і `vercel.json` |
| На занятті | усі коміти відправлено на занятті; незавершене — вдома, як у ЛР-12 |
| Vercel | проєкт з Root Directory `lab-13`; сторінка кабінету, відкрита за адресою, не дає 404 |
| AI | §4.2 дотримано; у звіті вказано, як використовувався AI |
| Звіт | усі пункти §5 |

And for §4.9: the chosen task's tests pass (`npm run test:extra --
tests/extra/<name>`); the main tests still pass; one commit, pushed after
§4.8's and before the defence; the task named in the report.

## Files to create or change

- `starters/react/lab-13/` (above);
- `public/uk/react/starters/lab-13.zip`: built by `build-pack.py` after the
  starter's commit, in its own commit;
- `src/content/labs/react/uk/lab-13.md`: the handout;
- `public/uk/react/labs/lab-13/result.webp`, from the reference in headless
  Edge;
- `public/uk/react/labs/lab-13.pdf`: `python docs/web/build-handout.py
  lab-13 react`, after the instructor's review;
- `docs/react/lab-13/solution/` (gitignored; the `.gitignore` line comes
  with this plan): the prototype and its results today; at build time, the
  reference as one stage per challenge plus one per extra task, the
  reference's route tree (decision 27), the wrong variants, the
  measurements, the defence answers and a `shots.mjs`;
- `docs/react/lab-13/README.md`: the lasting facts and what was verified,
  with no answers;
- `docs/react/course-plan.md`: a ЛР 13 row in **How the site maps to the
  plan**; the «not built» row becomes `ЛР 14–27`; the date above the table;
  ЛР 13's §4.9 in the extra-points paragraph (current work can then reach
  73); a note in **Notes for building the course** that the programme
  names React Router v7 and the labs use v8;
- `README.md` (root): a `lab-13/` line in the `starters/react/` tree.

Work on `feat/react-lab-13` from `main`.

## Verification

**Checked while writing this plan (2026-11-27)** on a prototype in a scratch
folder, on Windows 11 with Node.js 24.20.0 and npm 11.19.0: react-router
8.5.3, React 19.3.1, Vite 8.4.0, Vitest 5.1.2, jsdom 31.0.1, React Testing
Library 16.3.3, ESLint with ЛР-12's config, `eslint-plugin-react-refresh`
0.5.8, `qrcode` 1.5.4. The prototype has the cinema's routes of §4.4–§4.7
on stub pages, the tests named under §4.4, §4.6 and §4.7 in a first form,
and probe files for the declarative example (on the cinema's routes) and
the first three extra tasks. Its results are in `solution/README.md`; what
follows records what was checked. The blog and §4.9.4 came with the
revision and are not prototyped (see **To check during the build**).

- **The versions:** react-router 8.5.3 is `latest` on npm (8.0.0 on
  2026-06-17; the v7 line is at 7.18.7); its peers are React ≥ 19.2.7, its
  engine Node.js ≥ 22.22.0; `react-router-dom`'s last version is 7.18.7.
  `react-router` exports `RouterProvider` too, and the data mode
  installation page imports it from `react-router/dom`, as `main.jsx` and
  the tests do.
- **Data mode in tests:** `createMemoryRouter` with `<RouterProvider>` in
  `<StrictMode>` renders every route of the prototype; the router's state
  gives the path, the query and the history action.
- **Middleware:** `requireUser` runs on the first load and on navigations,
  and its `redirect` carries `redirectTo`; the login page's return,
  `guestOnly` and «Вийти» behave as §4.6 says; a `//evil.example`
  `redirectTo` ends in the account. What a protected page shows when the
  session is cleared without a navigation was checked too (result in
  `solution/README.md`).
- **Lazy routes:** importing `routes` loads neither lazy page; opening one
  loads it once. What a guest's visit loads was measured for both forms of
  `lazy` (result in `solution/README.md`).
- **The route copy:** with the object form of `lazy`, a second router from
  the same route objects fails with «No route matches URL "/booking/s1"»;
  copying the objects per router fixes it; the function form needs no copy.
- **`HydrateFallback`:** without it, a render that starts at a lazy address
  prints «No `HydrateFallback` element provided to render during initial
  hydration»; with one on the root route, nothing.
- **The build:** `vite build` emits a separate chunk per lazy page, and the
  tickets page's chunk carries `qrcode` (both builds' files and sizes are in
  `solution/README.md`).
- **The declarative example** (`<Routes>`, `RequireAuth` with `<Navigate
  replace state>`, `React.lazy` with `<Suspense>`) works in v8 on the
  cinema's routes; the blog's version, without `state`, is checked at build
  time.
- **The extra tasks' mechanisms:** `useNavigation()` reports `'loading'`
  while a lazy page loads and the old page stays; React 19's `<title>` sets
  `document.title` in jsdom and follows `handle.title` through
  `useMatches()`; focus moves to the new `<h1>` after a navigation and stays
  on `<body>` on the first load in `<StrictMode>` with the right check (the
  wrong one is in `solution/README.md`); `throw data(…, { status: 403 })`
  from middleware renders the route's `ErrorBoundary` with
  `isRouteErrorResponse`, and React Router logs nothing.
- **Vitest projects:** `--project lab` and `--project extra` split the
  files, and a file filter works inside a project; a bare `vitest run` runs
  both.
- **The QR code** renders as SVG in jsdom (`QRCode.toString(…, { type:
  'svg' })`), so the tickets page needs no canvas in tests.
- **ESLint:** as under **ESLint in this lab**.
- **Readings:** the pages in the table and the quoted sentences, on
  2026-11-27; the anchors on React Router's pages; Vercel's page dated
  2026-11-14 in its metadata; `uk.react.dev`'s `lazy` page is the English
  text.

**Checked in the PR review (2026-11-27),** with temporary tests on the
prototype:

- **`NavLink` and `end`:** without `end`, a `NavLink` to `/` is marked only
  at `/` (not on `/schedule`, a film's page or `/account/tickets`), as
  React Router's `lib.d.ts` says and its code does; a `NavLink` to
  `/account` without `end` is marked on `/account/tickets`.
- **«Назад» after a return without `replace`:** where it lands, before and
  after `guestOnly` (result in `solution/README.md`).
- **A `guestOnly` without `safeRedirect`:** none of the first plan's six
  §4.6 tests caught it, since the one that reaches `guestOnly` (a signed-in
  user at `/login`) has no `redirectTo` and passes; a signed-in user at
  `/login?redirectTo=//evil.example/x` leaves the site (jsdom: «Not
  implemented: navigation to another Document»), hence the new test.
- **§4.7's first test:** a count of module loads alone passes on the
  starter, whose `routes.js` imports only `MoviesPage`, hence the route
  match.
- **`vite example`:** Vite reads its config from the root it is given;
  with `--config vite.config.js` the blog builds and its dev server serves
  `@react-refresh`.

**To check during the build:**

- the full starter and the reference as one stage per challenge and per
  extra task, each through the tests (with the expected failures), lint,
  Prettier and the build; the exact test counts for §1, §4.1, §5 and §7;
- that each stub fails with a readable message, and that the starter's one
  passing test is the only one (§4.7's first test fails through its route
  match);
- the «Назад» test of §4.6 on the real pages: it passes with `replace` and
  fails without it, both before and after `guestOnly`;
- §4.9.3's held-back module through an async `vi.mock` factory (the probe
  held back a `lazy` function instead);
- **the blog:** `npm run example` serves it on its own Vite root next to
  `npm run dev`; it lints clean with the lab's config; each probe behaves
  as §4.3 says; its declarative version runs in v8; and the rename test of
  decision 26: the blog's code with the cinema's names is expected to pass
  §4.4's tests except the 404 under the header, §4.5's except the menu's
  `end`, and §4.7's, and none of §4.6's that need the return, `guestOnly`
  or «Вийти» (which ones it passes goes in `solution/README.md`);
- **§4.9.4:** middleware reads `params.movieId`; a film that isn't online
  ends in the route's `ErrorBoundary` under the header; a guest's sign-in
  started from the film page's link returns there through `redirectTo`
  built with `useLocation()`; the six tests, and that the guest check comes
  before the online check;
- the wrong variants as a set (an `<a href>` header, absolute child paths,
  «Профіль» without `end`, «Кабінет» with `end`, the guard as a component
  inside each page, no `safeRedirect` in the login page, none in
  `guestOnly`, no `replace`, a `lazy` page still imported at the top of
  `routes.js`, no
  `HydrateFallback`, for §4.9.1 the StrictMode trap, and for §4.9.4 a guest
  link without `redirectTo`), each failing at least one test or the lint;
- both tables on the reference: the build's files, and the Network tab in
  `npm run preview` through headless Edge for the three visits;
- the page in headless Edge at 390, 1000 and 1280 px: no horizontal scroll,
  visible focus on the seat map and the menus, no control that drops focus
  to `<body>`; the screenshot;
- the timed dry run as a student, without AI: §4.3 in about 18 minutes,
  §4.4–§4.7 in about 42, plus setup; §4.9.1–§4.9.3 in about 12 each and
  §4.9.4 in about 25; otherwise the cuts under **Timing**;
- the zip stores LF and passes `format:check` after unpacking; `npm install`
  in an existing `react-labs` adds `lab-13` with `react-router` and
  `qrcode`; Vercel reads `vercel.json` from Root Directory `lab-13`, serves
  a deep link after the rewrite and 404 without it, and doesn't run the
  tests;
- the readings listed as unchecked under **The readings**;
- `npm run check && npm run build` for the site; the labs index lists
  ЛР-13.

## Decisions

**Settled with the instructor before this plan (2026-11-27):**

1. **A new app,** not ЛР-10's coffee shop or ЛР-12's order queue.
2. **Data mode with middleware** for the protected routes:
   `createBrowserRouter`, route objects, the route's `lazy`. The
   declarative mode is shown as an example of the same routes, since it was
   the common way until data routers (since decision 29, of the blog's
   routes).
3. **React Router 8,** with a note that the programme names v7.
4. **Three extra tasks, the student chooses one,** for 1 point (four since
   decision 25).

**Proposed in this plan:**

5. **The app is «Кінотеатр»,** the cinema site ЛР-10's handout used for its
   folder examples, with the pages under **The app** (confirmed, decision
   24).
6. **ЛР-10's hybrid structure** for the starter, so each route folder is
   what a lazy route imports.
7. **Format:** ЛР-12's code challenges with given Vitest tests, all in
   class, AI explains only, 1 point.
8. **The session is a module store** read with `useSyncExternalStore`, not
   a context. Why is a defence question, answered in `solution/README.md`.
   This replaces ЛР-12's decision 17 on "an authentication context".
9. **The guard is client middleware,** `requireUser`, with `guestOnly` for
   the login page. Which routes carry them is the student's design since
   decision 27; the reference's choice is in `solution/README.md`.
10. **`redirectTo` in the query string,** not `location.state`. The
    defence asks why and compares it with `location.state` in Robin
    Wieruch's article (answer in `solution/README.md`); §4.3's declarative
    blog keeps no return address.
11. **`safeRedirect` is given,** with its rule; students use it in the
    login page and in `guestOnly`, and a test catches each place that
    doesn't (the fourth and the sixth of §4.6).
12. **Two lazy pages, booking and tickets,** and the tickets page shows QR
    codes through `qrcode`, so the split shows in the build. `/admin` is
    lazy too, in §4.9.2.
13. **A `HydrateFallback`** is required, through a test; the blog shows one
    on its root route.
14. **`MEASUREMENTS.md`** with two empty tables, the build's files and the
    browser's requests, copied into the report.
15. **The declarative mode is reading:** printed code and a comparison
    table, no commit and no tests; in §4.3 on the blog since decision 29.
16. **The extra tasks are §4.9.1–§4.9.4** (the fourth by decision 25),
    each with its own tests in a separate Vitest project; one counts,
    started in class once §4.8 is pushed, as ЛР-11's +1, and finished at
    home before the defence if needed (decision 30).
17. **The fake session lives in `sessionStorage`,** so it ends with the
    tab, and the module says that a real site uses an httpOnly cookie.
18. **Students write `vercel.json`** in §4.8 and check a deep link on the
    deployed site.
19. **No ungraded self-study section,** as in ЛР-11 and ЛР-12. The
    programme's 2 hours of self-study are the readings and unfinished work.
    §4.3 is ungraded too, but it is class work, not self-study.
20. **Ukrainian first,** English later.
21. **Out of scope:** loaders, actions and `<Form>` (П5.2, ЛР-14); framework
    mode (П5.1, П7.7); search params as state (П2.14); typed routes (П8.9);
    a real sign-in (П5.3, П7.10); `<ScrollRestoration>`; view transitions,
    which React Router 8.5 deprecated in favour of React's
    `<ViewTransition>`; `React.lazy` for components inside a page and the
    bundle audit (ЛР-16, П6.4).
22. **ЛР-14 may continue the cinema** (its films from an API through
    TanStack Query), but that is ЛР-14's plan to decide.

**Settled with the instructor after the plan was written (2026-11-27):**

23. **A walkthrough, then the task:** an example of each mechanism, then
    its transfer. §4.3 shows routing on a small given app, and the cinema
    is the task. The lab's aim is to get to know how routes, protected ones
    included, are built: the walkthrough shows how each mechanism works, and
    the cinema is where students apply them, rather than an example inside
    each challenge.
24. **The cinema stays as planned:** the schedule, seat booking, tickets
    with QR codes.
25. **«Дивитися» і «Мій список» are one extra task, §4.9.4,** added to the
    three; the student still picks one task for 1 point.

**Proposed in the revision, to confirm:**

26. **The rename test, applied to the decisions.** The blog shows each
    mechanism once and in its simplest form, so its code with the cinema's
    names does give API calls of §4.4, §4.5 and §4.7: a layout route, an
    index route, a dynamic segment, a `NavLink`, a middleware that throws
    `redirect`, `lazy` and `HydrateFallback`. That is the walkthrough's job
    (decision 23). What it must not give are the cinema's decisions: where
    the 404 page goes; which account link needs `end`; which routes carry
    the guard; the return to the requested page, with `replace` and with
    `safeRedirect` in both places; `guestOnly`; «Вийти»; and what a guest's
    browser downloads for a protected lazy page. So the blog has no
    `NavLink` to an address that starts another page's, no return address,
    no page that is both protected and lazy, and no probe that answers
    §4.7's Network table (the table under **The walkthrough**).
27. **The cinema's challenges state requirements,** not the route tree:
    addresses, who sees what, what happens after sign-in. The tree is the
    student's design, the tests already check behaviour, and the reference's
    tree is kept in `solution/README.md`, not in this plan or the handout.
28. **The blog is given and running** in `example/` (`npm run example`),
    printed part by part in the handout with probes; no tests, no commit, no
    points. Reading and trying given code is quicker than typing it, and
    the class time goes to the cinema.
29. **The declarative mode on the blog,** at the end of §4.3, instead of the
    first version's §4.7 on the cinema: the cinema's routes printed in
    another mode would be the solution of §4.4–§4.6 with other syntax.
30. **Extra tasks may be finished at home** before the defence: the
    walkthrough takes class time, and §4.9.4 is about twice the size of the
    others.

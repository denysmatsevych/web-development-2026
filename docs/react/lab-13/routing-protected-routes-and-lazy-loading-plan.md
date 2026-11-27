# Plan: React ЛР-13 «Налаштування React-маршрутизації, захищених роутів та лінивого завантаження»

Status: proposed on 2026-11-27. Four decisions were settled with the
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
  route imports, so the folders from ЛР-10 and the code splitting in §4.6
  line up.
- **ЛР-10's cart was an external store** read with `useSyncExternalStore`.
  The fake session in this lab is one too, not a context: middleware runs
  before React renders a route, outside the component tree, so it can't read
  a context (decision 8). ЛР-12's decision 17 had named "an authentication
  context" for ЛР-13; this plan replaces it, and the defence asks why.
- **ЛР-5's form with `FormData`** is the given login form; ЛР-6's
  `useActionState` stays where it was, since React Router's `action` is out
  of scope (decision 21).
- **ЛР-7's and ЛР-12's `vi.mock`:** a module factory counts when a page's
  module is loaded, which is what §4.6's tests check (see **What the tests
  check**).

### What the lab is for

The lab sets up routing for a whole app in React Router's data mode, in
four challenges students can check:

1. **Routes and a shared layout** (§4.3): route objects for
   `createBrowserRouter`, a layout route with `<Outlet>`, an index route, a
   dynamic segment read with `useParams`, a splat route for 404, and
   `NavLink` in the header so the current page is marked for screen
   readers.
2. **Nested routes** (§4.4): the account section with a layout of its own
   and child routes inside it, and the booking page.
3. **Protected routes** (§4.5): middleware on a pathless route that sends a
   guest to «Вхід» and remembers where they were going; the login page
   sends them back there, only to an address on this site; a signed-in user
   doesn't see «Вхід»; «Вийти» leaves the protected page.
4. **Lazy routes** (§4.6): the booking and tickets pages loaded with the
   route's `lazy`, a `HydrateFallback` for the first load, and the effect
   measured in the build output and the browser's Network tab.

§4.7 then shows the same routes in the declarative mode
(`<BrowserRouter>`, `<Routes>`, a `RequireAuth` component with
`<Navigate>`, `React.lazy` and `<Suspense>`), the way most tutorials from
before data routers wrote them. Students read it and compare; they don't
write it (decision 2).

The extra task (§4.9) is one of three, the student's choice, each with
tests of its own (decision 4): the tab title and focus after navigation,
an administrator's page closed to other users, or a loading indicator while
a lazy page's code downloads.

Two measurements run through the lab, recorded in a `MEASUREMENTS.md` the
starter provides: the build's files and sizes before and after §4.6, and
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
| React Router: [Picking a Mode](https://reactrouter.com/start/modes) | 8.5.3 | §4 intro and §4.7: the three modes; «By moving route configuration outside of React rendering, Data Mode adds data loading, actions, pending states and more…»; the page's API table shows which APIs each mode has (`useNavigation` only in data and framework mode; the middleware page is marked for those two modes too) |
| React Router: [Routing (Data)](https://reactrouter.com/start/data/routing) | 8.5.3 | before class. `#nested-routes`, `#layout-routes`, `#index-routes` (§4.3, §4.4), `#dynamic-segments` (§4.3), `#splats` (404) |
| React Router: [Route Object](https://reactrouter.com/start/data/route-object) | 8.5.3 | `#middleware` (§4.5: its `authMiddleware` throws `redirect("/login")`), `#lazy` (§4.6), `#handle` (§4.9.1) |
| React Router: [Middleware](https://reactrouter.com/how-to/middleware) | 8.5.3 | `#quick-start-data-mode`, `#authentication` under «Common Patterns» (§4.5); the order parent → child |
| React Router: [`NavLink`](https://reactrouter.com/api/components/NavLink) | 8.5.3 | «Automatically applies `aria-current="page"` to the link when the link is active» (§4.3); `end` |
| React Router: [`createMemoryRouter`](https://reactrouter.com/api/data-routers/createMemoryRouter) | 8.5.3 | how the tests render the app at any address (defence) |
| React Router: [Upgrading from v7](https://reactrouter.com/upgrading/v7) and the [React Router v8](https://remix.run/blog/react-router-v8) post (Brooks Lybrand) | 2026-06-17 | the version note: «React Router v8 removes the `react-router-dom` re-export package»; imports come from `react-router` and `react-router/dom`; middleware is always on; Node 22.22+, React 19.2.7+ (§2 note, defence) |
| React Router: [Routing (Declarative)](https://reactrouter.com/start/declarative/routing) | 8.5.3 | §4.7: the same nesting with `<Routes>` and `<Route>` |
| Robin Wieruch: [React Router 7: Private Routes (alias Protected Routes)](https://www.robinwieruch.de/react-router-private-routes/) | 2025-01-06 | §4.7: a `ProtectedRoute` that returns `<Navigate to={redirectPath} replace />`, and its `<Outlet>` layout variant |
| react.dev: [`lazy`](https://react.dev/reference/react/lazy) | current | §4.7: `React.lazy` with `<Suspense>`; «Do not declare `lazy` components *inside* other components» |
| OWASP: [Unvalidated Redirects and Forwards Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html) | current | §4.5: «Unvalidated redirects and forwards are possible when a web application accepts untrusted input…», which is why `redirectTo` goes through `safeRedirect` |
| Vercel: [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite), «Using Vite to make SPAs» | 2026-11-14 | §4.8: «If your Vite app is configured to deploy as a Single Page Application (SPA), deep linking won't work out of the box», and the `vercel.json` with `rewrites` to `/index.html` |
| React Router: [Accessibility](https://reactrouter.com/how-to/accessibility) | 8.5.3 | §4.9.1: `NavLink` «provides context for assistive technology»; focus management and live regions after a route change are the app's job |
| Marcy Sutton (Gatsby): [What we learned from user testing of accessible client-side routing techniques…](https://www.gatsbyjs.com/blog/2019-07-11-user-testing-accessible-client-routing/) | 2019-07-11 | §4.9.1: the user research React Router's page cites; move focus on a route change. The post's own advice moved to a skip link, and the handout says the lab takes the simpler heading focus |
| react.dev: [`<title>`](https://react.dev/reference/react-dom/components/title) | current | §4.9.1: «React will always place the DOM element corresponding to the `<title>` component within the document's `<head>`» |

To check during the build: the error-boundary page
(`https://reactrouter.com/how-to/error-boundary`) and the `useNavigation`
and `isRouteErrorResponse` API pages for §4.9.2 and §4.9.3, which the
package's bundled docs have but the web check didn't cover; the data mode
installation page for `RouterProvider` from `react-router/dom` (in the
bundled docs).

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

| Address | Page | Who sees it | In §4.6 |
| --- | --- | --- | --- |
| `/` | «Афіша»: cards of the films | everyone | eager |
| `/movies/:movieId` | a film: year, length, description, its sessions with links to booking | everyone | eager |
| `/schedule` | «Розклад»: sessions by day | everyone | eager |
| `/login` | «Вхід»: email and password | guests only | eager |
| `/booking/:sessionId` | «Бронювання»: the hall's seat map, «Забронювати» | signed in | lazy |
| `/account` | «Кабінет» with its own menu, «Профіль» inside | signed in | eager |
| `/account/tickets` | «Мої квитки»: each ticket with its QR code | signed in | lazy |
| `/admin` | «Адміністрування»: how full each session is (§4.9.2 only) | role `admin` | lazy |
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
set by the server, and that this module only imitates one.

**Why the tickets show QR codes:** e-tickets have them, and the `qrcode`
library (1.5.4) makes the tickets page's chunk large enough to see in the
build output (decision 12). Measured on the prototype; the numbers are in
`solution/README.md`.

**Size:** about 30 files in `src/`, in ЛР-10's hybrid folders: `app/`
(`main.jsx`, `routes.js`, `RootLayout.jsx`, the middleware), one folder per
route in `routes/` (`movies/`, `movie/`, `schedule/`, `login/`,
`booking/`, `account/`, `admin/`), and `shared/`.

## The challenges

Students do §4.3 → §4.6 in order, one commit each, and nothing in `tests/`
changes in any commit, as in ЛР-7, ЛР-11 and ЛР-12. Each challenge has
ЛР-12's parts as built: **Що має вийти**, **Що вже є**, **Код**,
**Перевірка**, **Коміт** and **Довідка**, with the choices it leaves to the
student in a sentence of its text. The rules below are the test names; the
tests ship in the starter.

The pages are given, so most of what students write is the route tree in
`src/app/routes.js` and a few router calls in the layout and the pages:
about 90 hand-written lines in all, against ЛР-12's 175, but in an API
that is new to them (see **Timing**).

### §4.3. Routes and the shared layout

**Що має вийти.** `routes.js` exports `routes`, an array of route objects:
a root route `/` with `Component: RootLayout` and its children, an index
route for «Афіша», `movies/:movieId`, `schedule`, and `*` for «Сторінку не
знайдено». `RootLayout` renders `<Outlet />` in its `<main>`, so every page
appears under the same header. The header's links become `NavLink`s
(«Афіша» with `end`, so it isn't marked on every page). `MoviePage` reads
`movieId` with `useParams()` instead of the prop it receives in the starter,
and for an unknown id shows «Фільм не знайдено».

The routes are objects with `Component`, not JSX `element`s, so
`routes.js` stays a plain `.js` module (see **ESLint in this lab**).

**Що вже є.** `main.jsx` with `createBrowserRouter(routes)` and
`<RouterProvider>` from `react-router/dom`, as in React Router's data mode
installation; a `routes.js` with one route, `/` → `MoviesPage`, so the
starter shows «Афіша» without a header; `RootLayout` with the header made
of plain `<a href>` links and a comment where the page goes; every page;
`NotFoundPage`.

**Tests** (`tests/routes.test.jsx`, 6):

- головна сторінка показує афішу (passes on the starter);
- сторінка фільму відкривається за адресою `/movies/:movieId`;
- для невідомого фільму показує «Фільм не знайдено»;
- невідома адреса показує «Сторінку не знайдено» під шапкою сайту;
- посилання «Розклад» у шапці відкриває розклад і позначене
  `aria-current="page"`;
- «Афіша» не позначена як поточна на інших сторінках.

A click on a plain `<a href>` does nothing in jsdom, so the link test also
tells a `NavLink` from the starter's anchor. The handout says what a plain
anchor does in the browser: the whole page reloads.

### §4.4. Nested routes: the account and booking

**Що має вийти.** `account` is a child of the root route with
`Component: AccountLayout`: its heading «Кабінет», a menu («Профіль»,
«Мої квитки») and its own `<Outlet />`. Inside it, an index route for
`ProfilePage` and `tickets` for `TicketsPage`. `booking/:sessionId` is a
child of the root route. The child paths are relative (`tickets`, not
`/account/tickets`), and the handout says why in one sentence.

**Що вже є.** `AccountLayout` with the menu and a comment where the child
goes; the pages; the given session, which the tests fill with a signed-in
user, since nothing is protected yet.

**Tests** (`tests/account.test.jsx`, 4, each with a signed-in user):

- `/account` показує «Кабінет» і «Профіль»;
- `/account/tickets` показує квитки в макеті кабінету, а «Мої квитки»
  позначені як поточна сторінка;
- `/booking/:sessionId` показує бронювання цього сеансу;
- «Забронювати» веде в «Мої квитки», і там є новий квиток.

**Перевірка.** In `npm run dev`, open `/account/tickets` and reload the
page: Vite's dev server sends `index.html` for any address, so the page
opens. §4.8 shows that Vercel doesn't, until `vercel.json` says so.

### §4.5. Protected routes

**Що має вийти.** `src/app/authMiddleware.js` exports two middleware
functions:

- `requireUser` throws `redirect('/login?redirectTo=…')` when `getUser()`
  returns `null`, with the requested path and query from `request.url`;
- `guestOnly` sends a signed-in user from `/login` to `redirectTo` (through
  `safeRedirect`) or to `/account`.

`routes.js` puts `booking/:sessionId` and `account` inside a pathless route
(no `path`, only `middleware: [requireUser]` and `children`) and adds
`login` with `middleware: [guestOnly]`. `LoginPage`, after `signIn()`
succeeds, reads `redirectTo` with `useSearchParams()` and goes there with
`navigate(safeRedirect(redirectTo), { replace: true })`. «Вийти» in the
header calls `signOut()` and goes to «Афіша».

The handout defines middleware in a full sentence: a function React Router
calls before it shows a route, from the parent route down to the child,
which can stop the navigation by throwing `redirect`. It names why the
check is middleware and not a component: it runs before any part of the
protected page renders. And it says what the check doesn't do: a guard in
the browser decides what a visitor sees, while the data must be checked by
the server on every request (§6 asks what the server would check).

**Порядок дій:** the pathless route with `requireUser`; then the login
page's return; then `guestOnly`; then «Вийти». After each step one more
test passes, and the handout ends the step with «Крок завершено, коли…».

**Що вже є.** The stubs `requireUser` and `guestOnly`, throwing
`Not implemented: requireUser` and `Not implemented: guestOnly` once a route
uses them; `LoginPage` with the form, the error message and a comment where
the return goes; `safeRedirect` with its rule in a comment; «Вийти» that
only calls `signOut()`.

**Tests** (`tests/protected.test.jsx`, 6):

- гість, який відкриває `/account/tickets`, бачить «Вхід», а адреса
  зберігає `redirectTo=/account/tickets`;
- гість після входу повертається на бронювання, з якого прийшов;
- після входу кнопка «Назад» не повертає на «Вхід»;
- користувач, який відкриває `/login`, потрапляє в кабінет;
- «Вийти» на захищеній сторінці веде на афішу;
- `redirectTo` з адресою іншого сайту після входу веде в кабінет.

The "Назад" test starts on «Афіша», follows a link to a booking and goes
back after signing in; without `replace` it lands on `/login`, which
`guestOnly` sends to the account. Its exact history steps are checked at
build time (see **Verification**). **Not tested:** whether the return uses
`navigate` or a `redirect`, or where the middleware file's helpers go.

### §4.6. Lazy routes

**Що має вийти.** `booking/:sessionId` and `account/tickets` lose their
`Component` and get `lazy`, which imports the page's module only when the
route is opened, in the form React Router's «Route Object» page shows (the
function form returns `{ Component }`; the object form `lazy: { Component }`
also passes, see **What the tests check**). Their imports leave the top of
`routes.js`. The root route gets `HydrateFallback`, a given component that
shows «Завантаження…» while the first page's code loads when the site is
opened at a lazy address; without it React Router warns «No
`HydrateFallback` element provided to render during initial hydration». The
handout explains the name in one sentence: React Router calls the first
render "hydration" even in an app with no server rendering.

**Перевірка.** The first table in `MEASUREMENTS.md`, «Файли збірки», is
filled twice: after §4.5 and after this step, from `npm run build`'s
output (each `.js` file in `dist/assets/` and its gzip size). Then the
second table, «Які JS-файли завантажує браузер»: `npm run preview`, the
Network tab with the JS filter, three visits (`/` as a guest,
`/account/tickets` as a guest, `/account/tickets` signed in), and which of
the lazy chunks each one requests. The handout asks the question the table
answers and doesn't give the answer; §6 asks to explain it.

**Що вже є.** `HydrateFallback` in `shared/components/`; the two empty
tables.

**Tests** (`tests/lazy.test.jsx`, 3):

- код бронювання й квитків не завантажується разом із маршрутами;
- відкриття бронювання завантажує його код і показує сторінку;
- лінива сторінка, відкрита за адресою, показується без попередження про
  `HydrateFallback`.

The first two count module loads through a `vi.mock` factory on each
page's module: after importing `routes` the count is 0, after opening the
page 1. The third test passes from §4.4 on, since nothing is lazy yet; it
keeps §4.6 without a `HydrateFallback` from passing.

### §4.7. The same routes in the declarative mode (reading)

No code and no commit. The handout prints the app's routes as
the declarative mode writes them, with three parts that differ:

- `<BrowserRouter>` in `main.jsx`, and `<Routes>` with nested `<Route>`
  elements in `App`;
- a `RequireAuth` layout that reads `useUser()` and returns
  `<Navigate to="/login" replace state={{ from: location }} />` or
  `<Outlet />`, after Robin Wieruch's article;
- `React.lazy(() => import(…))` for the two pages and a `<Suspense>`
  around `<Routes>`.

Then a table of what changes, for the defence:

| | Data mode (this lab) | Declarative mode (§4.7) |
| --- | --- | --- |
| Where the routes are described | an array of objects, outside React | JSX inside a component |
| When the check runs | middleware, before the route renders | `RequireAuth`, while the route renders |
| Where the return address is kept | `redirectTo` in the query | `location.state.from` |
| How a page's code is loaded | the route's `lazy`, during navigation | `React.lazy`, when the element first renders, with a `<Suspense>` fallback |
| What shows while it loads | the previous page, `useNavigation()` knows | the `<Suspense>` fallback |
| Middleware, `useNavigation`, `handle` | yes | no (React Router's mode table) |

The example ran on the prototype in v8 (see **Verification**), so the
handout's code is checked code. §4.7 also says where students meet this
mode: many tutorials and answers written before data routers (React Router
6.4), often with `react-router-dom`, which v8 no longer publishes.

## Extra task (§4.9): one of three

For 1 point, started in class once §4.8 is pushed, as ЛР-11's §4.8. The
student picks one; each has its own tests in `tests/extra/`, run with
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
isn't `admin` gets `throw data('Доступ заборонено', { status: 403 })`,
which the route's `ErrorBoundary` shows as «Доступ заборонено» under the
site's header, through `useRouteError()` and `isRouteErrorResponse()`. The
header shows «Адміністрування» only to the administrator.

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
  returns the original module (§4.6, §4.9.3).
- **The main and the extra tests are two Vitest projects** in
  `vite.config.js`, `lab` (`tests/*.test.jsx`) and `extra`
  (`tests/extra/*.test.jsx`); `npm test` is `vitest --project lab`, and
  `npm run test:extra` is `vitest --project extra` (checked: a file filter
  works inside a project). A bare `npx vitest run` runs both, so the
  handout uses `npm test -- --run` where ЛР-12 used `npx vitest run`.
- **Not the internals:** the form of `lazy`, how the middleware builds the
  `redirectTo` query, `navigate` or `redirect` after sign-in, how «Вийти»
  navigates, where the layouts' helper code goes.

## ESLint in this lab

Checked with ЛР-12's config (`eslint-plugin-react-hooks` 7.1.1,
`eslint-plugin-react-refresh` 0.5.8 through `reactRefresh.configs.vite`):

- `routes.js` with `Component: X` and no JSX is a plain module, so
  `react-refresh/only-export-components` doesn't apply to it; the
  middleware file is a plain module too.
- The prototype's app code lints clean; the only report was a probe's use
  of `process` in a test helper, which the starter doesn't have.
- To check at build time: a `.jsx` that exports `RootLayout` and a
  `HydrateFallback` next to each other (two components pass the rule), and
  each extra task's reference.

## Design principles

ЛР-7's, ЛР-11's and ЛР-12's principles apply. In addition:

1. **The route tree is the work.** The pages are given; students write the
   routes, the layouts' outlets, the guards and the few router calls.
2. **One mode in code, one in reading.** Data mode is written; the
   declarative mode, which students will meet in older code, is read and
   compared (§4.7).
3. **A guard in the browser is about what a visitor sees.** The lab
   measures what it doesn't do (the Network table) and says where the real
   check belongs.
4. **Every address from outside is checked** before the app goes there
   (`safeRedirect`).
5. **Measure what lazy loading changes:** the build output and the Network
   tab, before and after.
6. **No data loading.** Loaders and actions are left to Lecture 5's topics
   and ЛР-14, so the lab stays about routes.

## Timing

The slot is 80 minutes.

| Step | Handout | Minutes |
| --- | --- | --- |
| Starter, `npm install`, `npm test`, first commit | §4.1 | 5 |
| The AI rule, as in ЛР-12 | §4.2 | 1 |
| The route tree, `<Outlet>`, `NavLink`, `useParams` | §4.3 | 14 |
| The account's layout and children, booking | §4.4 | 8 |
| Middleware, the login page's return, «Вийти» | §4.5 | 16 |
| `lazy`, `HydrateFallback`, two builds, the Network table | §4.6 | 10 |
| The declarative example | §4.7 | 5 |
| Checks, `vercel.json`, `git push`, the Vercel project | §4.8 | 6 |
| **The lab** | | **65** |
| One extra task | §4.9 | 10–12 |

These are estimates; the timed dry run decides. A proxy from the prototype,
counting lines written by hand: §4.3 about 35, §4.4 about 15, §4.5 about
30, §4.6 about 10, about 90 in all, against ЛР-12's 175 and ЛР-8's 132.
The lines are fewer, but each is a new API with docs to read, so the rows
give §4.3 and §4.5 more time than their lines would at ЛР-12's pace, and
§4.6 adds two builds and three visits in the Network tab. How long ЛР-12
took in class is the better guide. If the lab takes longer than 65
minutes, the cuts, in order:

1. fill «Файли збірки» once, after §4.6, with the eager size given in the
   handout;
2. give `guestOnly` in the starter (one test passes from the start);
3. move §4.7 to the defence's reading, done at home;
4. make the Network table a defence question instead of a table.

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
│                          "test": "vitest --project lab", "test:extra": "vitest --project extra"
├── README.md              the app, the two accounts, «Що вже є», the commands
├── MEASUREMENTS.md        two empty tables: «Файли збірки», «Які JS-файли завантажує браузер»
├── public/favicon.svg
├── src/
│   ├── app/
│   │   ├── main.jsx            createBrowserRouter(routes), <RouterProvider> in <StrictMode>
│   │   ├── routes.js           one route: / → MoviesPage
│   │   ├── RootLayout.jsx      the header with plain <a> links; «Вийти» only signs out
│   │   ├── authMiddleware.js   stubs: requireUser, guestOnly (§4.5)
│   │   └── index.css
│   ├── routes/            movies/, movie/ (MoviePage takes movieId as a prop),
│   │                      schedule/, login/, booking/ (+ SeatMap), account/
│   │                      (AccountLayout, ProfilePage, TicketsPage), admin/ (§4.9.2)
│   └── shared/            auth/session.js, data/ (movies, sessions, tickets),
│                          utils/safeRedirect.js, components/ (NotFoundPage,
│                          HydrateFallback, ForbiddenPage for §4.9.2)
└── tests/                 setup.js, app.jsx (renderApp, signInAs, the route copy),
                           routes, account, protected, lazy; extra/focus, extra/admin,
                           extra/pending
```

The starter's tests: `npm test -- --run` passes one test («головна
сторінка показує афішу») and fails the rest with readable messages. In the
extra project each task's file fails until the task is done, though single
checks that already hold on the starter pass (focus staying on `<body>` on
the first load, the guest not seeing «Адміністрування»).

The starter is a new app with no earlier lab's answers, so the branch can
be pushed as soon as it is ready (unlike ЛР-12's).

## Handout: `src/content/labs/react/uk/lab-13.md`

About ЛР-12's length, with no solution code beyond what the docs and §4.7
print. Frontmatter as in ЛР-12, with `number: 13`, the programme's title
and `duration: "2 академічні години (самостійна робота — 2 години)"`.
`handout:` is added once the PDF is built after the instructor's review.
Ukrainian only; English later. ЛР-12's revised style: definitions as full
sentences, no story frames, literal names for tables and steps, no «живе».

Draft `summary`: «Сайт кінотеатру з готовими сторінками, між якими ви
налаштовуєте маршрути React Router: спільний макет, сторінка фільму за
адресою, вкладені маршрути кабінету й сторінка 404. Кабінет і бронювання
доступні лише після входу, а сторінка входу повертає туди, куди
користувач ішов. Код двох сторінок завантажується лише тоді, коли їх
відкривають, і це видно в збірці та у вкладці Network. Чотири code
challenges з готовими тестами Vitest, той самий застосунок у
декларативному режимі для порівняння, +1 бал за одне з трьох додаткових
завдань. Деплой на Vercel.»

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

The §4 intro then defines the terms as full sentences: маршрут (a route
connects an address pattern to what the app shows), макет (a layout route
shows the parts common to its children and an `<Outlet>` where a child
goes), вкладений маршрут, індексний маршрут, динамічний сегмент,
middleware, ліниве завантаження (lazy loading means the browser downloads
a page's code only when the page is opened).

**Очікуваний результат:** `lab-13/` passes `npm test -- --run` (all main
tests), `npm run lint`, `format:check` and `build`; both tables in
`MEASUREMENTS.md` are filled; the site works in `npm run dev`; the app is on
Vercel, and a page opened by its address there doesn't return 404.
Screenshot `/uk/react/labs/lab-13/result.webp` at 1280 px: «Мої квитки»
with two tickets and their QR codes, the header with «Кабінет» marked.

### §2. Корисні посилання

The readings table, in its order, with ЛР-12's opening paragraph: before
class, React Router's «Routing (Data)» page; the rest when a challenge
points to it. Inline links, as in ЛР-12, and the note that the pages are in
English.

### §3. Завдання

ЛР-12's list: §4.1 starter; §4.3–§4.6 with their topic; §4.7 the
declarative example; §4.8 checks and Vercel; §5 report; §4.9 one extra task.
Then ЛР-12's notes: all in class, 1 point after the defence plus 1 for one
task of §4.9, unfinished challenges at home, and the AI line pointing to
§4.2.

### §4. Хід виконання

- **4.1. Стартовий проєкт.** ЛР-12 §4.1 with `lab-13`, plus
  `MEASUREMENTS.md` and the two accounts in the file table. `npm test`:
  one test passes from the start, and the handout says why. Commit
  `chore: add lab 13 starter`.
- **4.2. Правила роботи з AI.** ЛР-12's rule.
- **4.3–4.6.** As under **The challenges**, with these commits:
  `feat: add the routes and the shared layout`;
  `feat: add the nested account routes`;
  `feat: protect the account and booking routes`;
  `perf: load the booking and tickets pages lazily`.
- **4.7. Те саме в декларативному режимі.** As above, no commit.
- **4.8. Перевірки, GitHub і Vercel.** All checks; `vercel.json` with the
  rewrite from Vercel's Vite page, in `lab-13/` (commit
  `chore: serve index.html for every address on Vercel`); `git push`; a new
  Vercel project `react-lab-13` with Root Directory `lab-13`; open
  `/account/tickets` on the deployed site, sign in, reload. The history is
  the starter's commit plus five.
- **4.9. Додаткове завдання.** The three tasks, one commit for the chosen
  one: `feat: set the title and move focus after navigation`,
  `feat: add the administrator's page`, or
  `feat: show a loading indicator for lazy pages`.

### §5. Вимоги до звіту

Subject `[React] ЛР-13: React Router, захищені маршрути й ліниве
завантаження`, with ЛР-12's two lines for `lab-13`. The report contains:

1. a screenshot of `npm test -- --run` with all main tests passing;
2. a screenshot of `npm run lint`, `format:check` and `build`;
3. both tables from `MEASUREMENTS.md`, copied or linked on GitHub;
4. the Vercel address of a page inside the account, opened directly;
5. per challenge, one or two sentences on what was done;
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
  `aria-current` and `end`.
- **«Режими React Router»:** the three modes and what data mode adds;
  §4.7's table: when each mode checks the user, where it keeps the return
  address, how it loads a page's code and what shows meanwhile; why v8 has
  no `react-router-dom`, and what to change in a tutorial written for it.
- **«Захищені маршрути»:** what middleware is and in which order it runs;
  why the guard is on a pathless route; why `redirectTo` is in the query and
  not in `location.state`; why `replace` after sign-in; why `safeRedirect`,
  and what an open redirect would let someone do; why the session is a
  store, not a context; why «Вийти» has to navigate; what a server would
  check that the browser can't.
- **«Ліниве завантаження»:** what `lazy` changes in the build, from the
  first table; whether a guest's browser gets the protected pages' code,
  from the second table, and why that doesn't make the site less safe;
  `HydrateFallback` and when it shows; the route's `lazy` against
  `React.lazy`; what ЛР-16 will measure that this lab didn't.
- **«Тести»:** how a test opens the app at an address; why the helper copies
  the routes; how a test sees that a module wasn't loaded; why the extra
  tests are a separate Vitest project.
- **«Додаткові завдання»:** for each task, asked of everyone at the level of
  the readings and in depth of those who did it: focus and the tab title
  after navigation, and why not on the first load; a 403 page against a
  redirect to «Вхід»; why data mode keeps the previous page while the next
  one loads.

The handout's §6 will be the full list; the answers go in
`solution/README.md`.

### §7. Критерії готовності

«Лабораторна робота оцінюється в 1 бал після захисту (§6); одне завдання
§4.9 — ще 1 бал.» The main table:

| Критерій | Мінімальна вимога |
| --- | --- |
| Тести | у теці `lab-13` `npm test -- --run` проходить: усі тести; файли в `tests/` не змінено в жодному коміті |
| Якість | `npm run lint` без помилок і попереджень; `format:check` і `build` — без помилок |
| Маршрути | усі адреси з таблиці застосунку, крім `/admin`, відкриваються; сторінки показано в спільному макеті |
| Захист | гість не бачить кабінету й бронювання; після входу повертається на сторінку, з якої прийшов, лише в межах сайту |
| Ліниве завантаження | бронювання й квитки — окремі файли збірки |
| Вимірювання | обидві таблиці в `MEASUREMENTS.md` заповнено |
| GitHub | коміт стартового проєкту й по одному на §4.3–§4.6 і `vercel.json` |
| На занятті | усі коміти відправлено на занятті; незавершене — вдома, як у ЛР-12 |
| Vercel | проєкт з Root Directory `lab-13`; сторінка кабінету, відкрита за адресою, не дає 404 |
| AI | §4.2 дотримано; у звіті вказано, як використовувався AI |
| Звіт | усі пункти §5 |

And for §4.9: the chosen task's tests pass (`npm run test:extra --
tests/extra/<name>`); the main tests still pass; one commit, pushed in
class after §4.8's; the task named in the report.

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
  reference as one stage per challenge plus one per extra task, the wrong
  variants, the measurements, the defence answers and a `shots.mjs`;
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
0.5.8, `qrcode` 1.5.4. The prototype has the routes of §4.3–§4.6 on stub
pages, the tests named under §4.3, §4.5 and §4.6 in a first form, and probe
files for the declarative example and the three extra tasks. Its results
are in `solution/README.md`; what follows records what was checked.

- **The versions:** react-router 8.5.3 is `latest` on npm (8.0.0 on
  2026-06-17; the v7 line is at 7.18.7); its peers are React ≥ 19.2.7, its
  engine Node.js ≥ 22.22.0; `react-router-dom`'s last version is 7.18.7.
  `react-router` exports `RouterProvider` too, and the data mode
  installation page imports it from `react-router/dom`, as `main.jsx` and
  the tests do.
- **Data mode in tests:** `createMemoryRouter` with `<RouterProvider>` in
  `<StrictMode>` renders every route of the prototype; the router's state
  gives the path, the query and the history action.
- **Middleware:** a parent's `requireUser` runs on the first load and on
  navigations, and its `redirect` carries `redirectTo`; the login page's
  return, `guestOnly` and «Вийти» behave as §4.5 says; a `//evil.example`
  `redirectTo` ends in the account. Middleware runs only on navigations, so
  a page stays after the session is cleared until the next one.
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
  tickets page's chunk carries `qrcode`; the eager build has one chunk (sizes
  in `solution/README.md`).
- **The declarative example** (`<Routes>`, `RequireAuth` with `<Navigate
  replace state>`, `React.lazy` with `<Suspense>`) works in v8.
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

**To check during the build:**

- the full starter and the reference as one stage per challenge and per
  extra task, each through the tests (with the expected failures), lint,
  Prettier and the build; the exact test counts for §1, §4.1, §5 and §7;
- that each stub fails with a readable message, and that the starter's one
  passing test is the only one;
- the «Назад» test of §4.5: the history after a link, a redirect and a
  `replace`, with and without `replace`;
- §4.9.3's held-back module through an async `vi.mock` factory (the probe
  held back a `lazy` function instead);
- the wrong variants as a set (an `<a href>` header, absolute child paths,
  the guard as a component inside each page, no `safeRedirect`, no
  `replace`, a `lazy` page still imported at the top of `routes.js`, no
  `HydrateFallback`, and for §4.9.1 the StrictMode trap), each failing at
  least one test or the lint;
- both tables on the reference: the build's files, and the Network tab in
  `npm run preview` through headless Edge for the three visits;
- the page in headless Edge at 390, 1000 and 1280 px: no horizontal scroll,
  visible focus on the seat map and the menus, no control that drops focus
  to `<body>`; the screenshot;
- the timed dry run as a student, without AI: §4.3–§4.6 in about 48 minutes
  plus setup, one extra task in about 12; otherwise the cuts under
  **Timing**;
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
   the common way until data routers.
3. **React Router 8,** with a note that the programme names v7.
4. **Three extra tasks, the student chooses one,** for 1 point.

**Proposed in this plan:**

5. **The app is «Кінотеатр»,** the cinema site ЛР-10's handout used for its
   folder examples, with the pages under **The app**.
6. **ЛР-10's hybrid structure** for the starter, so each route folder is
   what a lazy route imports.
7. **Format:** ЛР-12's code challenges with given Vitest tests, all in
   class, AI explains only, 1 point.
8. **The session is a module store** read with `useSyncExternalStore`, not
   a context, because middleware runs outside React. This replaces ЛР-12's
   decision 17 on "an authentication context".
9. **The guard is client middleware on a pathless route,** with
   `guestOnly` on the login route.
10. **`redirectTo` in the query string,** not `location.state`: the
    middleware sees only the request, and the query survives a reload.
    §4.7's example keeps `state.from`, so the defence can compare.
11. **`safeRedirect` is given,** with its rule; students use it in the
    login page and in `guestOnly`, and a test catches a page that doesn't.
12. **Two lazy pages, booking and tickets,** and the tickets page shows QR
    codes through `qrcode`, so the split shows in the build. `/admin` is
    lazy too, in §4.9.2.
13. **`HydrateFallback` on the root route** is required, through a test.
14. **`MEASUREMENTS.md`** with two empty tables, the build's files and the
    browser's requests, copied into the report.
15. **The declarative mode is reading** in §4.7: printed code and a
    comparison table, no commit and no tests.
16. **The extra tasks are §4.9.1–§4.9.3,** each with its own tests in a
    separate Vitest project; one counts, started in class once §4.8 is
    pushed and pushed in class, as ЛР-11's +1.
17. **The fake session lives in `sessionStorage`,** so it ends with the
    tab, and the module says that a real site uses an httpOnly cookie.
18. **Students write `vercel.json`** in §4.8 and check a deep link on the
    deployed site.
19. **No ungraded self-study section,** as in ЛР-11 and ЛР-12. The
    programme's 2 hours of self-study are the readings and unfinished work.
20. **Ukrainian first,** English later.
21. **Out of scope:** loaders, actions and `<Form>` (П5.2, ЛР-14); framework
    mode (П5.1, П7.7); search params as state (П2.14); typed routes (П8.9);
    a real sign-in (П5.3, П7.10); `<ScrollRestoration>`; view transitions,
    which React Router 8.5 deprecated in favour of React's
    `<ViewTransition>`; `React.lazy` for components inside a page and the
    bundle audit (ЛР-16, П6.4).
22. **ЛР-14 may continue the cinema** (its films from an API through
    TanStack Query), but that is ЛР-14's plan to decide.

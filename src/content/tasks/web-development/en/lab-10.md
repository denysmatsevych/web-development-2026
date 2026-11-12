---
title: "Courtly Booking — starter project for JavaScript debugging"
summary: "A venue catalogue for the Courtly service featuring search, a booking dialog, and a bookings list — with deliberately seeded JavaScript defects. The basis for debugging in Lab 10."
goal: "Locate, prove, and resolve the JavaScript defects in the provided Courtly Booking starter project. The specification below details expected application behavior: any discrepancy constitutes a defect. The practical part corresponds to section 5 of the lab."
label: "Assignment"
highlights:
  - "Provided starter project"
  - "Vanilla JS, ES modules"
  - "Scenarios A, B, and C"
  - "Bonus until October 21, 2026"
acceptance:
  - "First commit — starter project unchanged"
  - "Scenario A: error reproduced, Stack Trace dissected, root cause resolved at its origin"
  - "Scenario B: discrepancy between code and live DOM demonstrated in Elements and Console"
  - "Scenario C: execution order explained via diagram; order fixed rather than adding arbitrary delays"
  - "Experiment C.2: personal prediction and AI prediction recorded before running"
  - "Each fix is an isolated minimal commit"
  - "No try/catch, ?., or setTimeout applied merely to mask symptoms"
  - "Regression check: all behaviors in §3 verified after applying fixes"
  - "Temporary console.log statements removed from final code"
  - "Module structure and visual design of the starter project preserved"
updated: 2026-10-13
---

## 1. Overview

**Courtly Booking** is the venue catalogue page for the fictional Courtly
service whose landing page you built in Lab 7. Here, users search for sports
venues by city and sport type, select a date, open a booking dialog, and view
their active bookings.

**The page is in Ukrainian.** Courtly is a Ukrainian service, as in Lab 7.
Where this assignment names text on the page, it quotes the Ukrainian, with an
English translation in brackets for you. The language is not a defect: leave
the texts as they are.

The codebase was assembled as if rushed before a deadline: while superficially
functional, it contains **deliberately introduced defects** across three
categories — runtime exceptions, discrepancies between JavaScript code and the
live DOM, and Event Loop timing issues. Your assignment is not to rewrite the
app, but to isolate defects, **prove** the root cause of each, and fix it with a
minimal patch.

> The defect catalogue is intentionally private. The objective is to practice the
> sequence of **reproduction → evidence → hypothesis → fix → verification**,
> rather than ticking items off a predefined checklist.

## 2. Project structure

**Download:** [courtly-booking-starter.zip](/en/web/starters/courtly-booking-starter.zip)
(≈ 230 KB). Extract the archive into a separate repository or a `lab-10/` folder
in your shared coursework repository.

```text
courtly-booking-starter/
├── index.html
├── css/
│   ├── tokens.css      Courtly design tokens (the same as in Lab 7)
│   └── styles.css
├── data/
│   └── venues.json     venue data
├── js/
│   ├── main.js         entry point: binds event listeners
│   ├── api.js          fetchVenues() — server API simulation
│   ├── render.js       cards and search results
│   ├── booking.js      booking dialog and "My bookings"
│   └── format.js       price and date formatting
├── img/                logo, favicon, venue illustrations
├── .nojekyll
└── README.md           how to run and deploy
```

The application is purely static: no build step is required. Run it using a local
web server — loading via `file://` causes the browser to block ES modules and
local `fetch()` requests.

`api.js` simulates backend communication: it loads `data/venues.json` via
`fetch()` and returns filtered data with an artificial latency. The latency
varies per request to emulate a real network environment — this is intended
behavior, not a defect.

## 3. Expected behavior

Verify every requirement at both **≥ 1024 px** and **< 1024 px** viewports.
Subsection numbers correspond directly to rows in the regression verification
table (§5.6 of the lab).

### 3.1. Header and mobile menu

- The header contains the logo, navigation links, a
  <span lang="uk">«Мої бронювання»</span> (My bookings) button with a booking
  counter, and — on screens narrower than 1024 px — a mobile menu toggle.
- The menu button toggles navigation visibility; `aria-expanded` on the button
  always mirrors the live menu state.
- The <span lang="uk">«Мої бронювання»</span> button opens a dialog displaying
  recorded bookings (§3.6).

### 3.2. Initial state

- Upon page load, the catalogue below the search form displays **popular
  venues** — the six venues with the highest rating, sorted descending.
- The status line above the list reads:
  <span lang="uk">«Популярні майданчики: 6»</span> (Popular venues: 6).
- The Console remains clean with zero errors or warnings after initial render.

### 3.3. Search

- Search form. Submitting it does not reload the page.
  - **<span lang="uk">Місто</span>** (City):
    <span lang="uk">«Усі міста»</span> (All cities),
    <span lang="uk">Київ, Львів, Одеса, Харків, Дніпро</span>
    (Kyiv, Lviv, Odesa, Kharkiv, Dnipro).
  - **<span lang="uk">Вид спорту</span>** (Sport):
    <span lang="uk">«Усі види»</span> (All sports),
    <span lang="uk">Футбол, Теніс, Баскетбол, Волейбол</span>
    (Football, Tennis, Basketball, Volleyball).
  - **<span lang="uk">Дата</span>** (Date): today by default.
  - The **<span lang="uk">«Знайти»</span>** (Find) submit button.
- While a search is in progress, the status line reads
  <span lang="uk">«Шукаємо…»</span> (Searching…), and the venue list has
  `aria-busy="true"`.
- Once the response arrives, the view displays only venues matching **both**
  filters (city and sport), ordered from highest to lowest rating.
  <span lang="uk">«Усі міста»</span> and <span lang="uk">«Усі види»</span>
  impose no restriction. The chosen date does not filter venues: it is passed
  forward into the booking dialog (§3.5).
- The status line reads <span lang="uk">«Знайдено: N»</span> (Found: N), where
  N equals the number of rendered cards. If no venues match, it reads
  <span lang="uk">«Нічого не знайдено»</span> (Nothing found), and the list is
  empty.
- The status line is an ARIA live region: screen readers announce updates.
- If a subsequent search is dispatched before an earlier request resolves, the
  screen must always render the result of the **most recent** search.

### 3.4. Venue cards

- Each card is an `<article>`: title (`<h3>`), sport type, city, rating, and
  a price in the format <span lang="uk">«від 1 200 грн/год»</span>
  (from 1 200 UAH per hour), with thousands separated by a space.
- The <span lang="uk">«Забронювати»</span> (Book) button on **any** card on the
  screen opens the booking dialog for that card's venue.

### 3.5. Booking dialog

- Modal `<dialog>`: venue name, date carried over from search, time picker
  (08:00–21:00, hourly intervals), duration (1–3 hours), and total calculated
  price = hourly rate × duration. The total updates immediately when duration
  changes.
- <span lang="uk">«Підтвердити»</span> (Confirm) adds the booking to
  <span lang="uk">«Мої бронювання»</span>, increments the header counter by 1,
  and closes the dialog.
- <span lang="uk">«Скасувати»</span> (Cancel) and pressing `Esc` close the
  dialog without booking. Upon closing, focus returns to the card button that
  opened the dialog.

### 3.6. My bookings

- Modal `<dialog>` displaying an itemized list: venue, date, time, duration, and
  total cost.
- If there are no bookings, it reads
  <span lang="uk">«Бронювань ще немає»</span> (No bookings yet).
- The counter in the header strictly reflects the number of items in this list.
- Bookings persist in-memory only until page reload.

### 3.7. Console

- Across all interactions described in §3.1–3.6, the Console shows no errors or
  warnings from the application code.

## 4. What not to do

- Do not rewrite the application, alter module hierarchy, or add external
  libraries or frameworks.
- Do not "patch" issues with `try/catch`, optional chaining (`?.`), superficial
  `null` checks, fallback defaults, or arbitrary `setTimeout` delays if the
  change merely conceals symptoms. A `null` check is appropriate only when
  missing values represent a legitimate, **expected** application state; be
  prepared to justify this during defense.
- Do not change the delays in `api.js` to make a defect stop reproducing.
- Do not fix code without confirming the defect with concrete evidence. An
  unresolved defect is preferable to speculative changes: every change must be
  substantiated during oral defense.

## 5. Deployment

Deploy the corrected version to **GitHub Pages or Vercel** — following the same
procedure as the Lab 4-5 starter ([Lab 4-5 assignment, §7](/web-development/labs/lab-4/task/)):
either in a standalone repository or in a `lab-10/` folder of your shared
coursework repository. All assets use relative paths, so the app operates from
both origin roots and repository subfolders.

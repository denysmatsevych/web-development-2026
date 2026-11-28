// Сеанси на три дні. `taken` — місця, зайняті заздалегідь, у форматі
// «ряд-місце»; до них додаються місця з квитків (tickets.js).
export const halls = {
  'Зала 1': { rows: 6, seats: 10 },
  'Зала 2': { rows: 5, seats: 8 },
}

export const sessions = [
  {
    id: 's1',
    movieId: 'tini-zabutykh-predkiv',
    startsAt: '2026-12-08T17:00',
    hall: 'Зала 1',
    price: 150,
    taken: ['3-5', '3-6', '4-5', '4-6'],
  },
  {
    id: 's2',
    movieId: 'zemlia',
    startsAt: '2026-12-08T19:30',
    hall: 'Зала 2',
    price: 120,
    taken: ['2-4', '2-5'],
  },
  {
    id: 's3',
    movieId: 'bilyi-ptakh-z-chornoiu-oznakoiu',
    startsAt: '2026-12-08T20:00',
    hall: 'Зала 1',
    price: 150,
    taken: ['5-1', '5-2', '5-3'],
  },
  {
    id: 's4',
    movieId: 'propala-hramota',
    startsAt: '2026-12-09T16:30',
    hall: 'Зала 2',
    price: 120,
    taken: [],
  },
  {
    id: 's5',
    movieId: 'kaminnyi-khrest',
    startsAt: '2026-12-09T18:00',
    hall: 'Зала 1',
    price: 150,
    taken: ['1-1', '1-2', '6-9', '6-10'],
  },
  {
    id: 's6',
    movieId: 'vavylon-xx',
    startsAt: '2026-12-09T20:30',
    hall: 'Зала 2',
    price: 120,
    taken: ['3-3', '3-4', '3-5'],
  },
  {
    id: 's7',
    movieId: 'tini-zabutykh-predkiv',
    startsAt: '2026-12-09T21:00',
    hall: 'Зала 1',
    price: 150,
    taken: ['4-4', '4-5'],
  },
  {
    id: 's8',
    movieId: 'zemlia',
    startsAt: '2026-12-10T17:00',
    hall: 'Зала 1',
    price: 150,
    taken: [],
  },
  {
    id: 's9',
    movieId: 'kaminnyi-khrest',
    startsAt: '2026-12-10T18:30',
    hall: 'Зала 2',
    price: 120,
    taken: ['1-4', '1-5'],
  },
  {
    id: 's10',
    movieId: 'propala-hramota',
    startsAt: '2026-12-10T19:00',
    hall: 'Зала 1',
    price: 150,
    taken: ['2-5', '2-6', '3-5', '3-6'],
  },
  {
    id: 's11',
    movieId: 'bilyi-ptakh-z-chornoiu-oznakoiu',
    startsAt: '2026-12-10T20:30',
    hall: 'Зала 2',
    price: 120,
    taken: ['4-1'],
  },
  {
    id: 's12',
    movieId: 'vavylon-xx',
    startsAt: '2026-12-10T21:00',
    hall: 'Зала 1',
    price: 150,
    taken: [],
  },
]

export function findSession(id) {
  return sessions.find((session) => session.id === id)
}

export function sessionsOfMovie(movieId) {
  return sessions.filter((session) => session.movieId === movieId)
}

// Сеанси, згруповані за днями: [{ day: '2026-12-08', sessions: [...] }, ...].
export function sessionsByDay() {
  const days = new Map()
  for (const session of sessions) {
    const day = session.startsAt.slice(0, 10)
    if (!days.has(day)) days.set(day, [])
    days.get(day).push(session)
  }
  return [...days].map(([day, list]) => ({
    day,
    sessions: list.toSorted((a, b) => a.startsAt.localeCompare(b.startsAt)),
  }))
}

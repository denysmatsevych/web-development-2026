import { useMemo, useSyncExternalStore } from 'react'
import { findSession } from './sessions.js'

// Квитки всіх користувачів у localStorage браузера:
// [{ id, email, sessionId, row, seat }, ...].
const KEY = 'kino-tickets'
const listeners = new Set()
let lastRaw = null
let lastTickets = []

// Читає localStorage щоразу, тож тести можуть очистити його перед кожним
// тестом. Поки рядок у сховищі той самий, повертає той самий масив: так
// хоче useSyncExternalStore.
export function getAllTickets() {
  const raw = localStorage.getItem(KEY)
  if (raw !== lastRaw) {
    lastRaw = raw
    lastTickets = raw ? JSON.parse(raw) : []
  }
  return lastTickets
}

function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useAllTickets() {
  return useSyncExternalStore(subscribe, getAllTickets)
}

// Квитки одного користувача в порядку бронювання.
export function useTickets(email) {
  const all = useAllTickets()
  return useMemo(
    () => all.filter((ticket) => ticket.email === email),
    [all, email],
  )
}

// Зайняті місця сеансу: зайняті заздалегідь і з квитків, у форматі «ряд-місце».
export function useTakenSeats(sessionId) {
  const all = useAllTickets()
  return useMemo(() => {
    const taken = new Set(findSession(sessionId)?.taken)
    for (const ticket of all) {
      if (ticket.sessionId === sessionId)
        taken.add(`${ticket.row}-${ticket.seat}`)
    }
    return taken
  }, [all, sessionId])
}

// Створює по квитку на кожне місце: seats — масив { row, seat }.
export function bookSeats(email, sessionId, seats) {
  const added = seats.map(({ row, seat }) => ({
    id: `${sessionId}-${row}-${seat}`,
    email,
    sessionId,
    row,
    seat,
  }))
  localStorage.setItem(KEY, JSON.stringify([...getAllTickets(), ...added]))
  listeners.forEach((listener) => listener())
  return added
}

import { useSyncExternalStore } from 'react'

// «Мій список» (§4.9.4): збережені фільми кожного користувача в
// localStorage браузера, { [email]: [id фільму, ...] }.
const KEY = 'kino-watchlist'
const NONE = Object.freeze([])
const listeners = new Set()
let lastRaw = null
let lastLists = {}

function readLists() {
  const raw = localStorage.getItem(KEY)
  if (raw !== lastRaw) {
    lastRaw = raw
    lastLists = raw ? JSON.parse(raw) : {}
  }
  return lastLists
}

function write(email, list) {
  localStorage.setItem(KEY, JSON.stringify({ ...readLists(), [email]: list }))
  listeners.forEach((listener) => listener())
}

function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getWatchlist(email) {
  return readLists()[email] ?? NONE
}

export function addToWatchlist(email, movieId) {
  const list = getWatchlist(email)
  if (!list.includes(movieId)) write(email, [...list, movieId])
}

export function removeFromWatchlist(email, movieId) {
  write(
    email,
    getWatchlist(email).filter((id) => id !== movieId),
  )
}

// Список користувача з email; для гостя (email undefined) — порожній.
export function useWatchlist(email) {
  return useSyncExternalStore(subscribe, () => getWatchlist(email))
}

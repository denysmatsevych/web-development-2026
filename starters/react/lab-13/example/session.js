import { useSyncExternalStore } from 'react'

// Несправжній вхід блогу: один автор без пароля. Автор, який увійшов,
// зберігається в sessionStorage, тож щоб вийти, закрийте вкладку.
const KEY = 'blog-user'
const listeners = new Set()
let lastRaw = null
let lastUser = null

export function getUser() {
  const raw = sessionStorage.getItem(KEY)
  if (raw !== lastRaw) {
    lastRaw = raw
    lastUser = raw ? JSON.parse(raw) : null
  }
  return lastUser
}

export function signIn() {
  sessionStorage.setItem(KEY, JSON.stringify({ name: 'Автор' }))
  listeners.forEach((listener) => listener())
}

function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useUser() {
  return useSyncExternalStore(subscribe, getUser)
}

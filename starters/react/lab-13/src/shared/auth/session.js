import { useSyncExternalStore } from 'react'

// Несправжній вхід: один обліковий запис з паролем kino2026 (README.md).
// Користувач, який увійшов, зберігається в sessionStorage, тож сесія
// закінчується, коли закривають вкладку.
//
// Справжній сайт так не робить: сесію тримає сервер, а браузер отримує
// від нього cookie з атрибутом httpOnly, яку JavaScript не може прочитати.
// Цей модуль лише імітує таку сесію, щоб показати маршрути.
const KEY = 'kino-user'
const accounts = [
  {
    email: 'glyadach@kino.test',
    password: 'kino2026',
    name: 'Глядач',
    role: 'viewer',
  },
]
const listeners = new Set()
let lastRaw = null
let lastUser = null

function notify() {
  listeners.forEach((listener) => listener())
}

// Користувач { email, name, role } або null, якщо ніхто не ввійшов.
// Читає sessionStorage щоразу, тож тести можуть очистити його перед кожним
// тестом. Можна викликати будь-де, зокрема в middleware.
export function getUser() {
  const raw = sessionStorage.getItem(KEY)
  if (raw !== lastRaw) {
    lastRaw = raw
    lastUser = raw ? JSON.parse(raw) : null
  }
  return lastUser
}

// Перевіряє пошту й пароль із невеликою затримкою, як запит до сервера.
// Повертає проміс, який завершується користувачем або помилкою
// «Невірна пошта або пароль».
export async function signIn(email, password) {
  await new Promise((resolve) => setTimeout(resolve, 150))
  const found = accounts.find(
    (account) => account.email === email && account.password === password,
  )
  if (!found) throw new Error('Невірна пошта або пароль')
  const user = { email: found.email, name: found.name, role: found.role }
  sessionStorage.setItem(KEY, JSON.stringify(user))
  notify()
  return user
}

export function signOut() {
  sessionStorage.removeItem(KEY)
  notify()
}

function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

// Хук для компонентів: користувач або null; компонент рендериться знову,
// коли користувач входить чи виходить.
export function useUser() {
  return useSyncExternalStore(subscribe, getUser)
}

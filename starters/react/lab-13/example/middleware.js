import { redirect } from 'react-router'
import { getUser } from './session.js'

// Middleware маршруту «Нова публікація»: гостя відправляє на «Вхід».
export function requireAuthor() {
  if (!getUser()) {
    throw redirect('/login')
  }
}

import { screen } from '@testing-library/react'
import { matchRoutes } from 'react-router'
import { expect, test, vi } from 'vitest'
import { routes } from '../src/app/routes.js'
import { renderApp, signInAs } from './app.jsx'

// Скільки разів завантажено модуль сторінки. Фабрика vi.mock виконується,
// коли модуль імпортують уперше, тож лічильник показує, чи завантажив
// його хтось, і повертає справжній модуль.
const loaded = vi.hoisted(() => ({ booking: 0, tickets: 0 }))

vi.mock('../src/routes/booking/BookingPage.jsx', async (importOriginal) => {
  loaded.booking += 1
  return importOriginal()
})
vi.mock('../src/routes/account/TicketsPage.jsx', async (importOriginal) => {
  loaded.tickets += 1
  return importOriginal()
})

// Попередження в консолі від початку файлу. React Router друкує
// попередження про HydrateFallback лише раз, за першої лінивої сторінки,
// тож тест перевіряє всі сторінки, відкриті в цьому файлі.
const warnings = vi.hoisted(() => [])
const consoleWarn = console.warn
vi.spyOn(console, 'warn').mockImplementation((...args) => {
  warnings.push(String(args[0]))
  consoleWarn(...args)
})

// Останній маршрут, що збігається з адресою, якщо це не маршрут «*».
function pageRoute(url) {
  const route = matchRoutes(routes, url)?.at(-1)?.route
  return route && route.path !== '*' ? route : null
}

test('маршрути бронювання й квитків мають lazy, і код цих сторінок не завантажується разом із маршрутами', () => {
  const booking = pageRoute('/booking/s1')
  const tickets = pageRoute('/account/tickets')
  expect(booking, 'маршрут для /booking/s1').not.toBeNull()
  expect(tickets, 'маршрут для /account/tickets').not.toBeNull()
  expect(booking.lazy, 'lazy маршруту /booking/s1').toBeDefined()
  expect(tickets.lazy, 'lazy маршруту /account/tickets').toBeDefined()
  expect(loaded, 'завантажено модулів сторінок').toEqual({
    booking: 0,
    tickets: 0,
  })
})

test('відкриття бронювання завантажує його код і показує сторінку', async () => {
  signInAs()
  renderApp('/booking/s1')
  expect(
    await screen.findByRole('heading', { level: 1, name: /^Бронювання:/ }),
  ).toBeInTheDocument()
  expect(loaded, 'завантажено модулів сторінок').toEqual({
    booking: 1,
    tickets: 0,
  })
})

test('лінива сторінка, відкрита за адресою, показується без попередження про HydrateFallback', async () => {
  signInAs()
  renderApp('/account/tickets')
  await screen.findByRole('heading', { level: 2, name: 'Мої квитки' })

  expect(
    warnings.filter((message) => message.includes('HydrateFallback')),
  ).toEqual([])
})

import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { renderApp, signInAs } from '../app.jsx'

// Тест тримає завантаження коду сторінки, доки сам не відпустить його:
// фабрика vi.mock чекає на проміс, перш ніж повернути справжній модуль.
const hold = vi.hoisted(() => ({ booking: null, tickets: null }))

vi.mock('../../src/routes/booking/BookingPage.jsx', async (importOriginal) => {
  await hold.booking?.promise
  return importOriginal()
})
vi.mock('../../src/routes/account/TicketsPage.jsx', async (importOriginal) => {
  await hold.tickets?.promise
  return importOriginal()
})

function deferred() {
  let resolve
  const promise = new Promise((done) => {
    resolve = done
  })
  return { promise, resolve }
}

test('поки код сторінки завантажується, показано «Завантаження сторінки…», а попередня сторінка лишається на місці', async () => {
  hold.booking = deferred()
  signInAs()
  const user = userEvent.setup()
  renderApp('/movies/zemlia')
  await user.click(await screen.findByRole('link', { name: '8 грудня, 19:30' }))

  expect(await screen.findByRole('status')).toHaveTextContent(
    'Завантаження сторінки…',
  )
  expect(
    screen.getByRole('heading', { level: 1, name: 'Земля' }),
  ).toBeInTheDocument()

  await act(async () => hold.booking.resolve())
  expect(
    await screen.findByRole('heading', { level: 1, name: 'Бронювання: Земля' }),
  ).toBeInTheDocument()
})

test('коли код сторінки завантажено, індикатор зникає', async () => {
  hold.tickets = deferred()
  signInAs()
  const user = userEvent.setup()
  renderApp('/account')
  const menu = await screen.findByRole('navigation', { name: 'Меню кабінету' })
  await user.click(within(menu).getByRole('link', { name: 'Мої квитки' }))
  expect(await screen.findByRole('status')).toBeInTheDocument()

  await act(async () => hold.tickets.resolve())
  expect(
    await screen.findByRole('heading', { level: 2, name: 'Мої квитки' }),
  ).toBeInTheDocument()
  expect(screen.queryByRole('status')).toBeNull()
})

import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, test } from 'vitest'
import { renderApp, signInAs, siteNav } from './app.jsx'

// Маршрути ще не захищено (це §4.6), тож тести одразу входять як глядач.
beforeEach(() => {
  signInAs()
})

test('/account показує «Кабінет» і «Профіль»', async () => {
  renderApp('/account')
  expect(
    await screen.findByRole('heading', { level: 1, name: 'Кабінет' }),
  ).toBeInTheDocument()
  expect(
    screen.getByRole('heading', { level: 2, name: 'Профіль' }),
  ).toBeInTheDocument()
  expect(screen.getByText('glyadach@kino.test')).toBeInTheDocument()
})

test('/account/tickets показує квитки в макеті кабінету', async () => {
  renderApp('/account/tickets')
  expect(
    await screen.findByRole('heading', { level: 2, name: 'Мої квитки' }),
  ).toBeInTheDocument()
  expect(
    screen.getByRole('heading', { level: 1, name: 'Кабінет' }),
  ).toBeInTheDocument()
  expect(
    screen.getByRole('navigation', { name: 'Меню кабінету' }),
  ).toBeInTheDocument()
  expect(siteNav()).toBeInTheDocument()
})

test('на /account/tickets у меню позначені лише «Мої квитки», а «Кабінет» у шапці позначений', async () => {
  renderApp('/account/tickets')
  const menu = await screen.findByRole('navigation', { name: 'Меню кабінету' })

  expect(
    within(menu).getByRole('link', { name: 'Мої квитки' }),
  ).toHaveAttribute('aria-current', 'page')
  expect(
    within(menu).getByRole('link', { name: 'Профіль' }),
  ).not.toHaveAttribute('aria-current')
  expect(
    within(siteNav()).getByRole('link', { name: 'Кабінет' }),
  ).toHaveAttribute('aria-current', 'page')
})

test('/booking/:sessionId показує бронювання цього сеансу', async () => {
  renderApp('/booking/s2')
  expect(
    await screen.findByRole('heading', { level: 1, name: 'Бронювання: Земля' }),
  ).toBeInTheDocument()
  expect(screen.getByText(/8 грудня, 19:30/)).toBeInTheDocument()
})

test('«Забронювати» веде в «Мої квитки», і там є новий квиток', async () => {
  const user = userEvent.setup()
  const { router } = renderApp('/booking/s2')
  await user.click(
    await screen.findByRole('button', { name: 'Ряд 1, місце 1' }),
  )
  await user.click(screen.getByRole('button', { name: 'Забронювати' }))

  expect(
    await screen.findByRole('heading', { level: 2, name: 'Мої квитки' }),
  ).toBeInTheDocument()
  expect(router.state.location.pathname).toBe('/account/tickets')
  expect(
    screen.getByRole('heading', { level: 3, name: 'Земля' }),
  ).toBeInTheDocument()
  expect(screen.getByText('Ряд 1, місце 1')).toBeInTheDocument()
})

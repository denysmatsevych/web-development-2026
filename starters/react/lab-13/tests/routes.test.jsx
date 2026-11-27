import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test } from 'vitest'
import { renderApp, siteNav } from './app.jsx'

test('головна сторінка показує афішу', async () => {
  renderApp('/')
  expect(
    await screen.findByRole('heading', { level: 1, name: 'Афіша' }),
  ).toBeInTheDocument()
})

test('сторінка фільму відкривається за адресою /movies/:movieId', async () => {
  renderApp('/movies/zemlia')
  expect(
    await screen.findByRole('heading', { level: 1, name: 'Земля' }),
  ).toBeInTheDocument()
  expect(screen.getByText(/Олександр Довженко/)).toBeInTheDocument()
})

test('для невідомого фільму показує «Фільм не знайдено»', async () => {
  renderApp('/movies/nemaie-takoho')
  expect(
    await screen.findByRole('heading', { level: 1, name: 'Фільм не знайдено' }),
  ).toBeInTheDocument()
})

test('невідома адреса показує «Сторінку не знайдено» під шапкою сайту', async () => {
  renderApp('/nemaie/takoi/storinky')
  expect(
    await screen.findByRole('heading', {
      level: 1,
      name: 'Сторінку не знайдено',
    }),
  ).toBeInTheDocument()
  expect(siteNav()).toBeInTheDocument()
})

test('посилання «Розклад» у шапці відкриває розклад і позначене aria-current="page", а «Афіша» — ні', async () => {
  const user = userEvent.setup()
  const { router } = renderApp('/')
  const nav = await screen.findByRole('navigation', {
    name: 'Основна навігація',
  })
  await user.click(within(nav).getByRole('link', { name: 'Розклад' }))

  expect(
    await screen.findByRole('heading', { level: 1, name: 'Розклад' }),
  ).toBeInTheDocument()
  expect(router.state.location.pathname).toBe('/schedule')
  expect(within(nav).getByRole('link', { name: 'Розклад' })).toHaveAttribute(
    'aria-current',
    'page',
  )
  expect(within(nav).getByRole('link', { name: 'Афіша' })).not.toHaveAttribute(
    'aria-current',
  )
})

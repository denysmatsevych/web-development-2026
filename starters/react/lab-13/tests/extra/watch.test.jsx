import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test } from 'vitest'
import { renderApp, signInAs, signInWithForm, siteNav } from '../app.jsx'

function query(router, name) {
  return new URLSearchParams(router.state.location.search).get(name)
}

test('гість, який відкриває перегляд фільму, потрапляє на «Вхід», а після входу — на перегляд цього фільму', async () => {
  const user = userEvent.setup()
  const { router } = renderApp('/movies/zemlia/watch')
  await screen.findByRole('heading', { level: 1, name: 'Вхід' })
  await signInWithForm(user)

  expect(
    await screen.findByRole('heading', { level: 1, name: 'Перегляд: Земля' }),
  ).toBeInTheDocument()
  expect(router.state.location.pathname).toBe('/movies/zemlia/watch')
})

test('глядач відкриває перегляд фільму, доступного онлайн, посиланням «Дивитися» на сторінці фільму', async () => {
  signInAs()
  const user = userEvent.setup()
  renderApp('/movies/zemlia')
  await user.click(await screen.findByRole('link', { name: 'Дивитися' }))

  expect(
    await screen.findByRole('heading', { level: 1, name: 'Перегляд: Земля' }),
  ).toBeInTheDocument()
})

test('для фільму, недоступного онлайн, гість спершу потрапляє на «Вхід», а після входу бачить «Фільм недоступний онлайн» під шапкою сайту', async () => {
  const user = userEvent.setup()
  const { router } = renderApp('/movies/kaminnyi-khrest/watch')
  await screen.findByRole('heading', { level: 1, name: 'Вхід' })
  await signInWithForm(user)

  expect(
    await screen.findByRole('heading', {
      level: 1,
      name: 'Фільм недоступний онлайн',
    }),
  ).toBeInTheDocument()
  expect(siteNav()).toBeInTheDocument()
  expect(router.state.location.pathname).toBe('/movies/kaminnyi-khrest/watch')
})

test('«Мій список» відкривається в макеті кабінету й позначений у меню як поточна сторінка', async () => {
  signInAs()
  renderApp('/account/list')
  expect(
    await screen.findByRole('heading', { level: 2, name: 'Мій список' }),
  ).toBeInTheDocument()
  expect(
    screen.getByRole('heading', { level: 1, name: 'Кабінет' }),
  ).toBeInTheDocument()
  const menu = screen.getByRole('navigation', { name: 'Меню кабінету' })
  expect(
    within(menu).getByRole('link', { name: 'Мій список' }),
  ).toHaveAttribute('aria-current', 'page')
  expect(
    within(menu).getByRole('link', { name: 'Профіль' }),
  ).not.toHaveAttribute('aria-current')
})

test('гість на сторінці фільму бачить «Увійдіть, щоб додати», а після входу повертається на сторінку фільму', async () => {
  const user = userEvent.setup()
  const { router } = renderApp('/movies/zemlia')
  await user.click(
    await screen.findByRole('link', { name: 'Увійдіть, щоб додати' }),
  )
  await screen.findByRole('heading', { level: 1, name: 'Вхід' })
  expect(query(router, 'redirectTo')).toBe('/movies/zemlia')
  await signInWithForm(user)

  expect(
    await screen.findByRole('heading', { level: 1, name: 'Земля' }),
  ).toBeInTheDocument()
  expect(router.state.location.pathname).toBe('/movies/zemlia')
  expect(
    screen.getByRole('button', { name: 'До мого списку' }),
  ).toBeInTheDocument()
})

test('фільм, доданий кнопкою «До мого списку», є в «Мій список»', async () => {
  signInAs()
  const user = userEvent.setup()
  const { router } = renderApp('/movies/zemlia')
  await user.click(
    await screen.findByRole('button', { name: 'До мого списку' }),
  )
  expect(
    screen.getByRole('button', { name: 'Прибрати зі списку' }),
  ).toBeInTheDocument()

  await act(() => router.navigate('/account/list'))
  await screen.findByRole('heading', { level: 2, name: 'Мій список' })
  expect(screen.getByRole('link', { name: 'Земля' })).toHaveAttribute(
    'href',
    '/movies/zemlia',
  )
})

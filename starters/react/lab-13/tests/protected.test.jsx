import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import AccountLayout from '../src/routes/account/AccountLayout.jsx'
import LoginPage from '../src/routes/login/LoginPage.jsx'
import { renderApp, signInAs, signInWithForm, siteNav } from './app.jsx'

// Шпигуни на модулях: компоненти працюють як завжди, а тест бачить, чи
// React їх рендерив (як у ЛР-12).
vi.mock('../src/routes/account/AccountLayout.jsx', { spy: true })
vi.mock('../src/routes/login/LoginPage.jsx', { spy: true })

function query(router, name) {
  return new URLSearchParams(router.state.location.search).get(name)
}

test('гість, який відкриває /account/tickets, потрапляє на «Вхід», а адреса зберігає redirectTo=/account/tickets; макет кабінету не рендериться', async () => {
  const { router } = renderApp('/account/tickets')
  expect(
    await screen.findByRole('heading', { level: 1, name: 'Вхід' }),
  ).toBeInTheDocument()
  expect(router.state.location.pathname).toBe('/login')
  expect(query(router, 'redirectTo')).toBe('/account/tickets')
  expect(AccountLayout).not.toHaveBeenCalled()
})

test('гість після входу повертається на бронювання, з якого прийшов, з тим самим query', async () => {
  const user = userEvent.setup()
  const { router } = renderApp('/booking/s2?from=schedule&row=3')
  await screen.findByRole('heading', { level: 1, name: 'Вхід' })
  expect(query(router, 'redirectTo')).toBe('/booking/s2?from=schedule&row=3')
  await signInWithForm(user)

  expect(
    await screen.findByRole('heading', { level: 1, name: 'Бронювання: Земля' }),
  ).toBeInTheDocument()
  expect(router.state.location.pathname).toBe('/booking/s2')
  expect(router.state.location.search).toBe('?from=schedule&row=3')
})

test('після входу кнопка «Назад» веде на сторінку фільму, з якої гість відкрив бронювання', async () => {
  const user = userEvent.setup()
  const { router } = renderApp('/movies/zemlia')
  await user.click(await screen.findByRole('link', { name: '8 грудня, 19:30' }))
  await screen.findByRole('heading', { level: 1, name: 'Вхід' })
  await signInWithForm(user)
  await screen.findByRole('heading', { level: 1, name: 'Бронювання: Земля' })

  await act(() => router.navigate(-1))
  expect(
    await screen.findByRole('heading', { level: 1, name: 'Земля' }),
  ).toBeInTheDocument()
  expect(router.state.location.pathname).toBe('/movies/zemlia')
})

test('redirectTo з адресою іншого сайту після входу веде в кабінет', async () => {
  const user = userEvent.setup()
  const { router } = renderApp('/login?redirectTo=//evil.example/account')
  await screen.findByRole('heading', { level: 1, name: 'Вхід' })
  await signInWithForm(user)

  expect(
    await screen.findByRole('heading', { level: 1, name: 'Кабінет' }),
  ).toBeInTheDocument()
  expect(router.state.location.pathname).toBe('/account')
})

test('користувач, який відкриває /login, потрапляє в кабінет, а сторінка «Вхід» не рендериться', async () => {
  signInAs()
  const { router } = renderApp('/login')
  expect(
    await screen.findByRole('heading', { level: 1, name: 'Кабінет' }),
  ).toBeInTheDocument()
  expect(router.state.location.pathname).toBe('/account')
  expect(LoginPage).not.toHaveBeenCalled()
})

test('користувач, який відкриває /login з redirectTo на інший сайт, потрапляє в кабінет', async () => {
  signInAs()
  const { router } = renderApp('/login?redirectTo=//evil.example/account')
  expect(
    await screen.findByRole('heading', { level: 1, name: 'Кабінет' }),
  ).toBeInTheDocument()
  expect(router.state.location.pathname).toBe('/account')
})

test('«Вийти» на захищеній сторінці веде на афішу', async () => {
  signInAs()
  const user = userEvent.setup()
  const { router } = renderApp('/account/tickets')
  await screen.findByRole('heading', { level: 2, name: 'Мої квитки' })
  await user.click(within(siteNav()).getByRole('button', { name: 'Вийти' }))

  expect(
    await screen.findByRole('heading', { level: 1, name: 'Афіша' }),
  ).toBeInTheDocument()
  expect(router.state.location.pathname).toBe('/')
  expect(
    within(siteNav()).getByRole('link', { name: 'Увійти' }),
  ).toBeInTheDocument()
})

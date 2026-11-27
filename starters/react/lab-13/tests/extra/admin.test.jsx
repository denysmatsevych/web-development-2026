import { screen, within } from '@testing-library/react'
import { expect, test } from 'vitest'
import { admin, renderApp, signInAs, siteNav, viewer } from '../app.jsx'

test('гість, який відкриває /admin, потрапляє на «Вхід» з redirectTo=/admin', async () => {
  const { router } = renderApp('/admin')
  expect(
    await screen.findByRole('heading', { level: 1, name: 'Вхід' }),
  ).toBeInTheDocument()
  expect(router.state.location.pathname).toBe('/login')
  expect(
    new URLSearchParams(router.state.location.search).get('redirectTo'),
  ).toBe('/admin')
})

test('глядач на /admin бачить «Доступ заборонено» під шапкою сайту', async () => {
  signInAs(viewer)
  const { router } = renderApp('/admin')
  expect(
    await screen.findByRole('heading', {
      level: 1,
      name: 'Доступ заборонено',
    }),
  ).toBeInTheDocument()
  expect(siteNav()).toBeInTheDocument()
  expect(router.state.location.pathname).toBe('/admin')
})

test('адміністратор бачить сторінку адміністрування', async () => {
  signInAs(admin)
  renderApp('/admin')
  expect(
    await screen.findByRole('heading', { level: 1, name: 'Адміністрування' }),
  ).toBeInTheDocument()
  expect(
    screen.getByRole('table', { name: 'Заповненість сеансів' }),
  ).toBeInTheDocument()
})

test('посилання «Адміністрування» в шапці бачить лише адміністратор', async () => {
  signInAs(viewer)
  const first = renderApp('/')
  await screen.findByRole('heading', { level: 1, name: 'Афіша' })
  expect(
    within(siteNav()).queryByRole('link', { name: 'Адміністрування' }),
  ).toBeNull()
  first.unmount()

  signInAs(admin)
  renderApp('/')
  await screen.findByRole('heading', { level: 1, name: 'Афіша' })
  expect(
    within(siteNav()).getByRole('link', { name: 'Адміністрування' }),
  ).toBeInTheDocument()
})

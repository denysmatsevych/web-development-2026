import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test } from 'vitest'
import { renderApp, siteNav } from '../app.jsx'

test('назва вкладки відповідає сторінці, відкритій за адресою', async () => {
  renderApp('/schedule')
  await screen.findByRole('heading', { level: 1, name: 'Розклад' })
  await waitFor(() => expect(document.title).toBe('Розклад — Кінотеатр'))
})

test('після переходу назва змінюється, а фокус переходить на заголовок нової сторінки', async () => {
  const user = userEvent.setup()
  renderApp('/')
  await screen.findByRole('heading', { level: 1, name: 'Афіша' })
  await waitFor(() => expect(document.title).toBe('Афіша — Кінотеатр'))

  await user.click(within(siteNav()).getByRole('link', { name: 'Розклад' }))
  const heading = await screen.findByRole('heading', {
    level: 1,
    name: 'Розклад',
  })
  await waitFor(() => expect(document.title).toBe('Розклад — Кінотеатр'))
  expect(heading).toHaveFocus()
})

test('при першому відкритті сайту фокус лишається на початку сторінки', async () => {
  renderApp('/')
  await screen.findByRole('heading', { level: 1, name: 'Афіша' })
  expect(document.body).toHaveFocus()
})

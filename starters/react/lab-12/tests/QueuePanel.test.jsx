import { within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import App from '../src/App.jsx'
import QueuePanel from '../src/components/QueuePanel.jsx'
import QueueProvider from '../src/model/QueueProvider.jsx'
import { card, details, renderInQueueProvider, renderStrict } from './page.jsx'

// Шпигуни на модулях App і QueueProvider: сторінка працює як завжди, а тест
// бачить кожен їхній рендер. У <StrictMode> один рендер — два виклики, тому
// тест перевіряє лише, чи викликів не було зовсім.
vi.mock('../src/App.jsx', { spy: true })
vi.mock('../src/model/QueueProvider.jsx', { spy: true })

async function openDetails(user, title) {
  await user.click(within(card(title)).getByRole('button', { name: 'Деталі' }))
}

async function closeDetails(user) {
  await user.click(within(details()).getByRole('button', { name: 'Закрити' }))
}

describe('Панель черги', () => {
  it('у QueueProvider панель черги без пропсів відкриває й закриває «Деталі»', async () => {
    const user = userEvent.setup()
    renderInQueueProvider(<QueuePanel />)
    expect(details()).toBeNull()

    await openDetails(user, '№ 44 · Оля')
    expect(within(details()).getByRole('heading')).toHaveTextContent(
      '№ 44 · Оля',
    )
    await closeDetails(user)
    expect(details()).toBeNull()
  })
})

describe('Рендери', () => {
  it('відкриття й закриття «Деталей» не перерендерює App і QueueProvider', async () => {
    const user = userEvent.setup()
    renderStrict(<App />)
    App.mockClear()
    QueueProvider.mockClear()

    await openDetails(user, '№ 44 · Оля')
    expect(details()).not.toBeNull()
    await closeDetails(user)
    expect(details()).toBeNull()
    expect(
      App,
      'рендери App після відкриття й закриття «Деталей»',
    ).not.toHaveBeenCalled()
    expect(
      QueueProvider,
      'рендери QueueProvider після відкриття й закриття «Деталей»',
    ).not.toHaveBeenCalled()
  })
})

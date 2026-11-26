import { within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import App from '../src/App.jsx'
import QueuePanel from '../src/components/QueuePanel.jsx'
import { card, details, renderInQueueProvider, renderStrict } from './page.jsx'

// Шпигун на модулі App: сторінка працює як завжди, а тест бачить кожен
// рендер App. У <StrictMode> один рендер — два виклики, тому тест перевіряє
// лише, чи викликів не було зовсім.
vi.mock('../src/App.jsx', { spy: true })

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
  it('відкриття й закриття «Деталей» не перерендерює App', async () => {
    const user = userEvent.setup()
    renderStrict(<App />)
    App.mockClear()

    await openDetails(user, '№ 44 · Оля')
    expect(details()).not.toBeNull()
    await closeDetails(user)
    expect(details()).toBeNull()
    expect(
      App,
      'рендери App після відкриття й закриття «Деталей»',
    ).not.toHaveBeenCalled()
  })
})

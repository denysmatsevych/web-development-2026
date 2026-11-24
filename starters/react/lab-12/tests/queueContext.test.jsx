import { within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import App from '../src/App.jsx'
import OrderBoard from '../src/components/OrderBoard.jsx'
import OrderCard from '../src/components/OrderCard.jsx'
import OrderDetails from '../src/components/OrderDetails.jsx'
import { card, details, renderStrict } from './page.jsx'

// Шпигуни на модулях компонентів: компоненти працюють як завжди, а тест
// бачить кожен їхній виклик. Перший аргумент виклику — пропси.
vi.mock('../src/components/OrderBoard.jsx', { spy: true })
vi.mock('../src/components/OrderCard.jsx', { spy: true })
vi.mock('../src/components/OrderDetails.jsx', { spy: true })

/** Назви пропсів, які компонент отримував у всіх своїх рендерах. */
function propNames(component) {
  const names = component.mock.calls.flatMap(([props]) => Object.keys(props))
  return [...new Set(names)].sort()
}

describe('Черга й dispatch через контекст', () => {
  it('OrderBoard не отримує queue і dispatch через пропси', () => {
    renderStrict(<App />)
    expect(OrderBoard).toHaveBeenCalled()
    const props = propNames(OrderBoard)
    expect(props, 'пропси OrderBoard').not.toContain('queue')
    expect(props, 'пропси OrderBoard').not.toContain('dispatch')
  })

  it('OrderCard не отримує dispatch через пропси', () => {
    renderStrict(<App />)
    expect(OrderCard).toHaveBeenCalled()
    expect(propNames(OrderCard), 'пропси OrderCard').not.toContain('dispatch')
  })

  it('«Деталі» не отримують dispatch через пропси', async () => {
    const user = userEvent.setup()
    renderStrict(<App />)
    await user.click(
      within(card('№ 43 · Марко')).getByRole('button', { name: 'Деталі' }),
    )
    expect(details()).toBeInTheDocument()
    expect(propNames(OrderDetails), 'пропси OrderDetails').not.toContain(
      'dispatch',
    )
  })
})

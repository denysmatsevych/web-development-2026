import { renderHook, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import App from '../src/App.jsx'
import HistoryButtons from '../src/components/HistoryButtons.jsx'
import OrderBoard from '../src/components/OrderBoard.jsx'
import OrderComposer from '../src/components/OrderComposer.jsx'
import { useQueue, useQueueDispatch } from '../src/model/queueContext.js'
import {
  card,
  cardTitles,
  column,
  columnOf,
  placeOrder,
  renderInQueueProvider,
  renderStrict,
  tick,
} from './page.jsx'

// Шпигун на модулі форми: форма працює як завжди, а тест бачить кожен її
// рендер. У <StrictMode> один рендер — два виклики, тому тест перевіряє
// лише, чи викликів не було зовсім.
vi.mock('../src/components/OrderComposer.jsx', { spy: true })

const noop = () => {}
const undoButton = () => screen.getByRole('button', { name: 'Скасувати дію' })
const redoButton = () => screen.getByRole('button', { name: 'Повторити дію' })

describe('Хуки черги', () => {
  it('useQueue поза QueueProvider кидає помилку, у якій названо QueueProvider', () => {
    expect(() => renderHook(() => useQueue())).toThrow(/QueueProvider/)
  })

  it('useQueueDispatch поза QueueProvider кидає таку саму помилку', () => {
    expect(() => renderHook(() => useQueueDispatch())).toThrow(/QueueProvider/)
  })
})

describe('Компоненти в QueueProvider без App', () => {
  it('у QueueProvider дошка без пропсів, крім onOpen, показує замовлення, а «Почати» переносить картку в «Готуються»', async () => {
    const user = userEvent.setup()
    renderInQueueProvider(<OrderBoard onOpen={noop} />)
    expect(cardTitles()).toHaveLength(6)

    await user.click(
      within(card('№ 44 · Оля')).getByRole('button', { name: 'Почати' }),
    )
    expect(columnOf('№ 44 · Оля')).toBe('Готуються')
  })

  it('у QueueProvider форма без пропсів додає замовлення в «Нові»', async () => {
    const user = userEvent.setup()
    renderInQueueProvider(
      <>
        <OrderComposer />
        <OrderBoard onOpen={noop} />
      </>,
    )
    await placeOrder(user, 'Петро', 'Лате')
    expect(
      within(column('Нові')).getByRole('article', { name: /Петро$/ }),
    ).toBeInTheDocument()
  })

  it('у QueueProvider кнопки історії без пропсів вимкнені на початку, а після зміни «Скасувати дію» її скасовує', async () => {
    const user = userEvent.setup()
    renderInQueueProvider(
      <>
        <HistoryButtons />
        <OrderBoard onOpen={noop} />
      </>,
    )
    expect(undoButton()).toBeDisabled()
    expect(redoButton()).toBeDisabled()

    await user.click(
      within(card('№ 44 · Оля')).getByRole('button', { name: 'Почати' }),
    )
    expect(undoButton()).toBeEnabled()
    await user.click(undoButton())
    expect(columnOf('№ 44 · Оля')).toBe('Нові')
  })
})

describe('Рендери', () => {
  it('відмітка напою на дошці не перерендерює форму нового замовлення', async () => {
    const user = userEvent.setup()
    renderStrict(<App />)
    OrderComposer.mockClear()

    const flatWhite = await tick(user, '№ 43 · Марко', 'Флет вайт')
    expect(flatWhite).toBeChecked()
    expect(
      OrderComposer,
      'рендери OrderComposer після відмітки напою',
    ).not.toHaveBeenCalled()
  })
})

import { renderHook, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import App from '../src/App.jsx'
import HistoryButtons from '../src/components/HistoryButtons.jsx'
import { useStopList } from '../src/model/stopListContext.js'
import { card, columnOf, composer, renderStrict } from './page.jsx'

// Шпигун на модулі кнопок історії: кнопки працюють як завжди, а тест
// бачить кожен їхній рендер.
vi.mock('../src/components/HistoryButtons.jsx', { spy: true })

const cardNote = 'Є позиції зі стоп-листа'
const formNote = 'У замовленні є позиції зі стоп-листа'

const stopList = () => screen.getByRole('group', { name: 'Стоп-лист' })
const drinkButton = (drink) =>
  within(composer()).getByRole('button', { name: `+ ${drink}` })
const sendButton = () =>
  within(composer()).getByRole('button', { name: 'Надіслати бариста' })
const undoButton = () => screen.getByRole('button', { name: 'Скасувати дію' })

/** Ставить відмітку в панелі «Стоп-лист» або знімає її. */
async function toggleStop(user, name) {
  await user.click(within(stopList()).getByRole('checkbox', { name }))
}

describe('useStopList', () => {
  it('useStopList поза StopListProvider кидає помилку, у якій названо StopListProvider', () => {
    expect(() => renderHook(() => useStopList())).toThrow(/StopListProvider/)
  })
})

describe('Стоп-лист у формі', () => {
  it('напій зі стоп-листа не можна додати до замовлення', async () => {
    const user = userEvent.setup()
    renderStrict(<App />)
    expect(drinkButton('Какао')).toBeEnabled()

    await toggleStop(user, 'Какао')
    expect(drinkButton('Какао')).toBeDisabled()
    expect(drinkButton('Лате')).toBeEnabled()

    await toggleStop(user, 'Какао')
    expect(drinkButton('Какао')).toBeEnabled()
  })

  it('молоко й сироп зі стоп-листа не можна обрати для напою у формі', async () => {
    const user = userEvent.setup()
    renderStrict(<App />)
    await user.click(drinkButton('Лате'))
    const latte = within(composer()).getByRole('group', { name: 'Лате' })
    await user.click(within(latte).getByRole('checkbox', { name: 'ваніль' }))

    await toggleStop(user, 'вівсяне')
    await toggleStop(user, 'карамель')
    await toggleStop(user, 'ваніль')
    expect(
      within(latte).getByRole('option', { name: 'вівсяне' }),
    ).toBeDisabled()
    expect(
      within(latte).getByRole('option', { name: 'звичайне' }),
    ).toBeEnabled()
    expect(
      within(latte).getByRole('checkbox', { name: 'карамель' }),
    ).toBeDisabled()
    expect(
      within(latte).getByRole('checkbox', { name: 'лісовий горіх' }),
    ).toBeEnabled()

    // Сироп зі стоп-листа, який у напою вже є, можна зняти.
    const vanilla = within(latte).getByRole('checkbox', { name: 'ваніль' })
    expect(vanilla).toBeEnabled()
    await user.click(vanilla)
    expect(vanilla).not.toBeChecked()
    expect(vanilla).toBeDisabled()
  })

  it('«Надіслати бариста» вимкнена, поки в замовленні є позиція зі стоп-листа', async () => {
    const user = userEvent.setup()
    renderStrict(<App />)
    await user.type(within(composer()).getByLabelText("Ім'я гостя"), 'Ян')

    // Лате додається зі «звичайним» молоком, хоч воно й у стоп-листі.
    await toggleStop(user, 'звичайне')
    await user.click(drinkButton('Лате'))
    const milk = within(composer()).getByRole('combobox', { name: 'Молоко' })
    expect(milk).toHaveValue('звичайне')
    expect(within(composer()).getByText(formNote)).toBeInTheDocument()
    expect(sendButton()).toBeDisabled()

    await user.selectOptions(milk, 'вівсяне')
    expect(within(composer()).queryByText(formNote)).toBeNull()
    expect(sendButton()).toBeEnabled()

    await toggleStop(user, 'Лате')
    expect(within(composer()).getByText(formNote)).toBeInTheDocument()
    expect(sendButton()).toBeDisabled()
  })
})

describe('Стоп-лист на дошці', () => {
  it('картки в «Нові» й «Готуються» з позицією зі стоп-листа показують «Є позиції зі стоп-листа», а в «Готові» й «Видані» — ні', async () => {
    const user = userEvent.setup()
    renderStrict(<App />)
    await toggleStop(user, 'вівсяне')
    await toggleStop(user, 'Американо')

    // № 44 — «Нові», № 46 — «Готуються»: у кожному є вівсяне молоко.
    expect(within(card('№ 44 · Оля')).getByText(cardNote)).toBeInTheDocument()
    expect(
      within(card('№ 46 · Данило')).getByText(cardNote),
    ).toBeInTheDocument()
    // № 41 — «Готові», з вівсяним молоком; № 42 — «Видані», з американо.
    expect(within(card('№ 41 · Оля')).queryByText(cardNote)).toBeNull()
    expect(within(card('№ 42 · Тарас')).queryByText(cardNote)).toBeNull()
    // № 45 — «Нові», без позицій зі стоп-листа.
    expect(within(card('№ 45 · Ірина')).queryByText(cardNote)).toBeNull()

    await toggleStop(user, 'вівсяне')
    expect(within(card('№ 44 · Оля')).queryByText(cardNote)).toBeNull()
  })
})

describe('Стоп-лист і черга', () => {
  it('зміна стоп-листа не потрапляє в історію змін', async () => {
    const user = userEvent.setup()
    renderStrict(<App />)
    await toggleStop(user, 'Какао')
    expect(undoButton()).toBeDisabled()

    await user.click(
      within(card('№ 45 · Ірина')).getByRole('button', { name: 'Почати' }),
    )
    await toggleStop(user, 'вівсяне')
    await user.click(undoButton())
    expect(columnOf('№ 45 · Ірина')).toBe('Нові')
    expect(
      within(stopList()).getByRole('checkbox', { name: 'вівсяне' }),
    ).toBeChecked()
    expect(undoButton()).toBeDisabled()
  })

  it('зміна стоп-листа не перерендерює кнопки історії', async () => {
    const user = userEvent.setup()
    renderStrict(<App />)
    HistoryButtons.mockClear()

    await toggleStop(user, 'Какао')
    expect(drinkButton('Какао')).toBeDisabled()
    expect(
      HistoryButtons,
      'рендери HistoryButtons після зміни стоп-листа',
    ).not.toHaveBeenCalled()
  })
})

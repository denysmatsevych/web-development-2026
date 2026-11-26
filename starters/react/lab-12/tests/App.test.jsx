import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from '../src/App.jsx'
import { loadOrders } from '../src/data/orders.js'
import {
  card,
  cardTitles,
  column,
  columnOf,
  composer,
  details,
  placeOrder,
  renderStrict,
  tick,
} from './page.jsx'

// Тести сторінки з ЛР-11. Вони проходять від початку й мають проходити
// після кожного завдання: сторінка працює так само, хоч код і змінюється.

const largest = Math.max(...loadOrders().map((order) => order.number))
const undoButton = () => screen.getByRole('button', { name: 'Скасувати дію' })
const redoButton = () => screen.getByRole('button', { name: 'Повторити дію' })

async function openDetails(user, title) {
  await user.click(within(card(title)).getByRole('button', { name: 'Деталі' }))
  return details()
}

describe('Форма «Нове замовлення»', () => {
  it('«Надіслати бариста» додає замовлення в «Нові» й очищає форму', async () => {
    const user = userEvent.setup()
    renderStrict(<App />)
    const form = composer()
    await user.type(within(form).getByLabelText("Ім'я гостя"), 'Петро')
    await user.click(within(form).getByRole('button', { name: '+ Капучино' }))
    await user.click(
      within(form).getByRole('button', { name: 'Надіслати бариста' }),
    )

    expect(
      within(column('Нові')).getByRole('article', { name: /Петро$/ }),
    ).toBeInTheDocument()
    expect(within(form).getByLabelText("Ім'я гостя")).toHaveValue('')
    expect(within(form).queryByRole('group', { name: 'Капучино' })).toBeNull()
    expect(within(form).getByText(/^Разом:/)).toHaveTextContent('Разом: 0 грн')
    expect(
      within(form).getByRole('button', { name: 'Надіслати бариста' }),
    ).toBeDisabled()
  })
})

describe('Черга на дошці', () => {
  it('відмічений напій лишається відміченим', async () => {
    const user = userEvent.setup()
    renderStrict(<App />)
    const flatWhite = await tick(user, '№ 43 · Марко', 'Флет вайт')
    expect(flatWhite).toBeChecked()
    expect(
      within(card('№ 43 · Марко')).getByRole('button', { name: 'Готово' }),
    ).toBeEnabled()
  })

  it('нові замовлення отримують номери підряд', async () => {
    const user = userEvent.setup()
    renderStrict(<App />)
    await placeOrder(user, 'Петро', 'Лате')
    await placeOrder(user, 'Ганна', 'Какао')
    expect(cardTitles()).toEqual(
      expect.arrayContaining([
        `№ ${largest + 1} · Петро`,
        `№ ${largest + 2} · Ганна`,
      ]),
    )
  })

  it('скасування прибирає лише одне замовлення', async () => {
    const user = userEvent.setup()
    renderStrict(<App />)
    const before = cardTitles()
    await user.click(
      within(card('№ 44 · Оля')).getByRole('button', {
        name: 'Скасувати замовлення',
      }),
    )
    expect(cardTitles()).toEqual(
      before.filter((title) => title !== '№ 44 · Оля'),
    )
  })
})

describe('«Деталі замовлення»', () => {
  it("перейменування гостя в «Деталях» змінює ім'я на всіх його замовленнях", async () => {
    const user = userEvent.setup()
    renderStrict(<App />)
    const panel = await openDetails(user, '№ 44 · Оля')
    const name = within(panel).getByLabelText("Ім'я гостя")
    await user.clear(name)
    await user.type(name, 'Ольга')
    await user.click(within(panel).getByRole('button', { name: 'Зберегти' }))

    expect(cardTitles()).toEqual(
      expect.arrayContaining(['№ 41 · Ольга', '№ 44 · Ольга']),
    )
    expect(cardTitles().filter((title) => title.endsWith('Оля'))).toEqual([])
    expect(within(details()).getByRole('heading')).toHaveTextContent(
      '№ 44 · Ольга',
    )
  })

  it('«Деталі» показують зміни, зроблені на дошці', async () => {
    const user = userEvent.setup()
    renderStrict(<App />)
    const panel = await openDetails(user, '№ 43 · Марко')
    expect(within(panel).getByText(/^Флет вайт/)).toHaveTextContent('ще ні')

    await tick(user, '№ 43 · Марко', 'Флет вайт')
    expect(within(details()).getByText(/^Флет вайт/)).toHaveTextContent(
      'готово',
    )
    await user.click(
      within(card('№ 43 · Марко')).getByRole('button', { name: 'Готово' }),
    )
    expect(within(details()).getByText('Готове')).toBeInTheDocument()
  })

  it('«Деталі» порожні, коли відкрите замовлення скасовано', async () => {
    const user = userEvent.setup()
    renderStrict(<App />)
    await openDetails(user, '№ 44 · Оля')
    await user.click(
      within(card('№ 44 · Оля')).getByRole('button', {
        name: 'Скасувати замовлення',
      }),
    )
    expect(details()).toBeNull()
  })
})

describe('«Скасувати дію» і «Повторити дію»', () => {
  it('«Скасувати дію» повертає видане замовлення в «Готові», а «Повторити дію» — знову у «Видані»', async () => {
    const user = userEvent.setup()
    renderStrict(<App />)
    await user.click(
      within(card('№ 41 · Оля')).getByRole('button', { name: 'Видати' }),
    )
    expect(columnOf('№ 41 · Оля')).toBe('Видані')
    await user.click(undoButton())
    expect(columnOf('№ 41 · Оля')).toBe('Готові')
    await user.click(redoButton())
    expect(columnOf('№ 41 · Оля')).toBe('Видані')
  })

  it('кнопки вимкнені, коли нема чого скасовувати чи повторювати', async () => {
    const user = userEvent.setup()
    renderStrict(<App />)
    expect(undoButton()).toBeDisabled()
    expect(redoButton()).toBeDisabled()

    await user.click(
      within(card('№ 44 · Оля')).getByRole('button', { name: 'Почати' }),
    )
    expect(undoButton()).toBeEnabled()
    expect(redoButton()).toBeDisabled()

    await user.click(undoButton())
    expect(undoButton()).toBeDisabled()
    expect(redoButton()).toBeEnabled()
  })

  it('«Скасувати дію» не чіпає форму нового замовлення', async () => {
    const user = userEvent.setup()
    renderStrict(<App />)
    await user.click(
      within(card('№ 45 · Ірина')).getByRole('button', { name: 'Почати' }),
    )
    const form = composer()
    await user.type(within(form).getByLabelText("Ім'я гостя"), 'Петро')
    await user.click(within(form).getByRole('button', { name: '+ Лате' }))

    await user.click(undoButton())
    expect(columnOf('№ 45 · Ірина')).toBe('Нові')
    expect(within(form).getByLabelText("Ім'я гостя")).toHaveValue('Петро')
    expect(
      within(form).getByRole('group', { name: 'Лате' }),
    ).toBeInTheDocument()
  })
})

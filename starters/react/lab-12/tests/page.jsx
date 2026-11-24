import { render, screen, within } from '@testing-library/react'
import { StrictMode } from 'react'
import QueueProvider from '../src/model/QueueProvider.jsx'
import { StopListContext } from '../src/model/stopListContext.js'

// Тести рендерять сторінку так само, як src/main.jsx: усередині
// <StrictMode>. У режимі розробки React тоді викликає функцію кожного
// компонента й кожен ред'юсер двічі, і тести бачать сторінку такою, як у
// npm run dev.
export function renderStrict(ui) {
  return render(<StrictMode>{ui}</StrictMode>)
}

// Порожній стоп-лист для компонентів, які рендеряться без App.
const emptyStopList = { stopped: [], toggle() {} }

/**
 * Рендерить компоненти без App: усередині <QueueProvider> і з порожнім
 * стоп-листом, у <StrictMode>. Так тест показує, що компонентам досить
 * провайдера, а пропси від App їм не потрібні.
 */
export function renderInQueueProvider(ui) {
  return renderStrict(
    <StopListContext value={emptyStopList}>
      <QueueProvider>{ui}</QueueProvider>
    </StopListContext>,
  )
}

/** Заголовки всіх карток на дошці: ['№ 41 · Оля', …]. */
export function cardTitles() {
  return screen
    .queryAllByRole('article')
    .map((card) => within(card).getByRole('heading').textContent)
}

/** Картка замовлення за заголовком: card('№ 44 · Оля'). */
export function card(title) {
  return screen.getByRole('article', { name: title })
}

/** Колонка дошки за назвою: column('Нові'). */
export function column(title) {
  return screen.getByRole('region', { name: new RegExp(`^${title} \\(`) })
}

/** Колонка, у якій лежить картка: columnOf('№ 41 · Оля') — 'Готові'. */
export function columnOf(title) {
  const section = card(title).closest('section')
  return within(section)
    .getByRole('heading', { level: 2 })
    .textContent.replace(/ \(\d+\)$/, '')
}

/** Форма «Нове замовлення». */
export function composer() {
  return screen.getByRole('form', { name: 'Нове замовлення' })
}

/** Панель «Деталі замовлення» або null, коли її немає на сторінці. */
export function details() {
  return screen.queryByRole('region', { name: 'Деталі замовлення' })
}

/** Приймає замовлення через форму: ім'я гостя, один напій, «Надіслати бариста». */
export async function placeOrder(user, customerName, drink) {
  const form = composer()
  await user.type(within(form).getByLabelText("Ім'я гостя"), customerName)
  await user.click(within(form).getByRole('button', { name: `+ ${drink}` }))
  await user.click(
    within(form).getByRole('button', { name: 'Надіслати бариста' }),
  )
}

/** Відмічає напій на картці: tick(user, '№ 43 · Марко', 'Флет вайт'). */
export async function tick(user, title, drink) {
  const checkbox = within(card(title)).getByRole('checkbox', {
    name: new RegExp(`^${drink}`),
  })
  await user.click(checkbox)
  return checkbox
}

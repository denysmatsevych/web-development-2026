import { useEffect, useRef } from 'react'
import { flushSync } from 'react-dom'
import { describeItem, priceOf } from '../data/menu.js'

const statusTitle = {
  new: 'Нове',
  brewing: 'Готується',
  ready: 'Готове',
  served: 'Видане',
}

/**
 * Панель «Деталі замовлення»: напої замовлення й поле для імені гостя.
 * Без замовлення (order — null чи undefined) не показує нічого.
 */
export default function OrderDetails({ order, dispatch, onClose }) {
  const headingRef = useRef(null)
  const orderId = order?.id

  // Щойно відкрито інше замовлення, фокус переходить на заголовок панелі:
  // так панель видно й на вузькому екрані, а програма зчитування з екрана
  // читає, що відкрилося.
  useEffect(() => {
    if (orderId) headingRef.current.focus()
  }, [orderId])

  if (!order) return null

  const total = order.items.reduce((sum, item) => sum + priceOf(item), 0)

  // «Закрити» прибирає панель разом із кнопкою, на якій був фокус. Тому
  // flushSync одразу оновлює сторінку, а фокус повертається на картку цього
  // замовлення на дошці.
  function handleClose() {
    flushSync(onClose)
    document.querySelector(`[data-order-id="${order.id}"]`)?.focus()
  }

  return (
    <section className="order-details" aria-label="Деталі замовлення">
      <div className="details-head">
        <h2 ref={headingRef} tabIndex={-1}>
          № {order.number} · {order.customer.name}
        </h2>
        <button type="button" onClick={handleClose}>
          Закрити
        </button>
      </div>
      <p className="details-status">{statusTitle[order.status]}</p>
      <ul className="details-items">
        {order.items.map((item) => (
          <li key={item.id}>
            {describeItem(item)} — {item.done ? 'готово' : 'ще ні'}
          </li>
        ))}
      </ul>
      <p className="total">Разом: {total} грн</p>
      <RenameForm
        key={`${order.id}:${order.customer.name}`}
        customer={order.customer}
        dispatch={dispatch}
        onSaved={() => headingRef.current.focus()}
      />
    </section>
  )
}

// key вище створює форму наново, коли змінюється замовлення чи ім'я гостя:
// поле знову починає з поточного імені. Разом із формою зникає й поле чи
// кнопка, на яких був фокус, тому після збереження flushSync одразу оновлює
// сторінку, а onSaved переводить фокус на заголовок панелі з новим ім'ям.
function RenameForm({ customer, dispatch, onSaved }) {
  function handleSubmit(e) {
    e.preventDefault()
    const name = new FormData(e.currentTarget).get('name').trim()
    if (name === '') return
    flushSync(() =>
      dispatch({ type: 'customer_renamed', customerId: customer.id, name }),
    )
    onSaved()
  }

  return (
    <form className="rename" onSubmit={handleSubmit}>
      <label className="field">
        Ім'я гостя
        <input name="name" defaultValue={customer.name} autoComplete="off" />
      </label>
      <button type="submit">Зберегти</button>
    </form>
  )
}

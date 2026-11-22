import { useId } from 'react'
import { flushSync } from 'react-dom'
import { describeItem } from '../data/menu.js'

// Кнопка наступного кроку в кожній колонці, крім «Видані».
const nextStep = { new: 'Почати', brewing: 'Готово', ready: 'Видати' }

export default function OrderCard({ order, dispatch, onOpen }) {
  const titleId = useId()
  const isBrewing = order.status === 'brewing'
  const allDone = order.items.every((item) => item.done)
  const canCancel = order.status === 'new' || isBrewing

  // Кнопка кроку й «Скасувати замовлення» прибирають картку з колонки разом
  // із кнопкою, на якій був фокус, і він падає на початок сторінки. Тому
  // flushSync одразу оновлює сторінку, а фокус переходить на цю саму картку
  // в новій колонці або, коли замовлення скасовано, на заголовок колонки.
  function handleAdvance(e) {
    const board = e.currentTarget.closest('.board')
    flushSync(() => dispatch({ type: 'order_advanced', orderId: order.id }))
    board.querySelector(`[data-order-id="${order.id}"]`)?.focus()
  }

  function handleCancel(e) {
    const column = e.currentTarget.closest('.column')
    flushSync(() => dispatch({ type: 'order_cancelled', orderId: order.id }))
    column.querySelector('h2').focus()
  }

  return (
    <article
      className={`order-card status-${order.status}`}
      aria-labelledby={titleId}
      data-order-id={order.id}
      tabIndex={-1}
    >
      <h3 id={titleId}>
        № {order.number} · {order.customer.name}
      </h3>
      <ul className="order-items">
        {order.items.map((item) => (
          <li key={item.id}>
            <label>
              <input
                type="checkbox"
                checked={item.done}
                disabled={!isBrewing}
                onChange={() =>
                  dispatch({
                    type: 'item_toggled',
                    orderId: order.id,
                    itemId: item.id,
                  })
                }
              />
              {describeItem(item)}
            </label>
          </li>
        ))}
      </ul>
      <div className="card-actions">
        {nextStep[order.status] && (
          <button
            type="button"
            className="primary"
            disabled={isBrewing && !allDone}
            onClick={handleAdvance}
          >
            {nextStep[order.status]}
          </button>
        )}
        {canCancel && (
          <button type="button" onClick={handleCancel}>
            Скасувати замовлення
          </button>
        )}
        <button type="button" onClick={() => onOpen(order)}>
          Деталі
        </button>
      </div>
    </article>
  )
}

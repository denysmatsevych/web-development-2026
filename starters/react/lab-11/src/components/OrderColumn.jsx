import { useId } from 'react'
import OrderCard from './OrderCard.jsx'

export default function OrderColumn({ title, orders, dispatch, onOpen }) {
  const titleId = useId()
  return (
    <section className="column" aria-labelledby={titleId}>
      {/* tabIndex: сюди переходить фокус, коли картку з колонки скасовано */}
      <h2 id={titleId} tabIndex={-1}>
        {title} ({orders.length})
      </h2>
      {orders.length > 0 ? (
        <ul className="cards">
          {orders.map((order) => (
            <li key={order.id}>
              <OrderCard order={order} dispatch={dispatch} onOpen={onOpen} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty">Порожньо</p>
      )}
    </section>
  )
}

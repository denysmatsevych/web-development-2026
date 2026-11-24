import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import OrderColumn from '../src/components/OrderColumn.jsx'
import { renderStrict } from './page.jsx'

// OrderColumn рендериться сам, без дошки: замість карток — прості
// елементи списку. Так тести перевіряють пропси колонки, а не картки.

describe('OrderColumn', () => {
  it('показує назву колонки й кількість замовлень у заголовку', () => {
    renderStrict(
      <OrderColumn title="Готуються" count={2}>
        <li>№ 43 · Марко</li>
        <li>№ 46 · Данило</li>
      </OrderColumn>,
    )
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Готуються (2)',
    )
  })

  it('показує картки, передані як children', () => {
    renderStrict(
      <OrderColumn title="Нові" count={1}>
        <li>№ 44 · Оля</li>
      </OrderColumn>,
    )
    const column = screen.getByRole('region', { name: 'Нові (1)' })
    expect(within(column).getByRole('listitem')).toHaveTextContent('№ 44 · Оля')
    expect(within(column).queryByText('Порожньо')).toBeNull()
  })

  it('без замовлень показує «Порожньо»', () => {
    renderStrict(<OrderColumn title="Видані" count={0} />)
    const column = screen.getByRole('region', { name: 'Видані (0)' })
    expect(within(column).getByText('Порожньо')).toBeInTheDocument()
    expect(within(column).queryByRole('list')).toBeNull()
  })
})

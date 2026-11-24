import { useId, useReducer, useRef } from 'react'
import { drinks, priceOf } from '../data/menu.js'
import { draftReducer, emptyDraft } from '../model/draftReducer.js'
import DraftItem from './DraftItem.jsx'

export default function OrderComposer({ onPlace }) {
  const titleId = useId()
  const nameRef = useRef(null)
  const [draft, dispatch] = useReducer(draftReducer, emptyDraft)
  const total = draft.items.reduce((sum, item) => sum + priceOf(item), 0)

  function handleNameChange(e) {
    dispatch({ type: 'customer_changed', name: e.target.value })
  }

  function handleAddDrink(drink) {
    dispatch({ type: 'drink_added', id: crypto.randomUUID(), drink })
  }

  function handleSubmit(e) {
    e.preventDefault()
    onPlace({ customerName: draft.customerName.trim(), items: draft.items })
    dispatch({ type: 'draft_cleared' })
    // Порожня форма вимикає «Надіслати бариста», і кнопка втратила б фокус.
    // Він переходить на ім'я гостя: можна приймати наступне замовлення.
    nameRef.current.focus()
  }

  const canPlace = draft.customerName.trim() !== '' && draft.items.length > 0

  return (
    <form
      className="composer"
      aria-labelledby={titleId}
      onSubmit={handleSubmit}
    >
      <h2 id={titleId}>Нове замовлення</h2>
      <label className="field">
        Ім'я гостя
        <input
          ref={nameRef}
          value={draft.customerName}
          onChange={handleNameChange}
          autoComplete="off"
        />
      </label>
      <div className="drink-buttons" role="group" aria-label="Додати напій">
        {drinks.map((drink) => (
          <button
            key={drink.name}
            type="button"
            onClick={() => handleAddDrink(drink.name)}
          >
            + {drink.name}
          </button>
        ))}
      </div>
      {draft.items.length > 0 && (
        <ul className="draft-items">
          {draft.items.map((item) => (
            <li key={item.id}>
              <DraftItem
                item={item}
                onSizeChange={(size) =>
                  dispatch({ type: 'size_chosen', itemId: item.id, size })
                }
                onMilkChange={(milk) =>
                  dispatch({ type: 'milk_chosen', itemId: item.id, milk })
                }
                onSyrupToggle={(syrup) =>
                  dispatch({ type: 'syrup_toggled', itemId: item.id, syrup })
                }
                onRemove={() =>
                  dispatch({ type: 'item_removed', itemId: item.id })
                }
              />
            </li>
          ))}
        </ul>
      )}
      <p className="total">Разом: {total} грн</p>
      <button type="submit" className="primary" disabled={!canPlace}>
        Надіслати бариста
      </button>
    </form>
  )
}

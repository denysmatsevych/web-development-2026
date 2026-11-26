import { milks, priceOf, sizes, syrups } from '../data/menu.js'

/**
 * Один напій у формі «Нове замовлення»: розмір, молоко, сиропи й
 * «Видалити». Лише показує напій і викликає обробники з новим значенням.
 */
export default function DraftItem({
  item,
  onSizeChange,
  onMilkChange,
  onSyrupToggle,
  onRemove,
}) {
  // «Видалити» прибирає напій разом із кнопкою, на якій фокус. Тому спершу
  // фокус переходить на сусідній напій, а коли напій був один, — на першу
  // кнопку «+ …» форми.
  function handleRemove(e) {
    const form = e.currentTarget.form
    const all = [...form.querySelectorAll('.draft-item')]
    const i = all.indexOf(e.currentTarget.closest('.draft-item'))
    const next =
      all[i + 1] ?? all[i - 1] ?? form.querySelector('.drink-buttons button')
    next.focus()
    onRemove()
  }

  return (
    <fieldset className="draft-item" tabIndex={-1}>
      <legend>{item.drink}</legend>
      <p className="draft-price">{priceOf(item)} грн</p>
      <fieldset className="choice">
        <legend>Розмір</legend>
        {sizes.map((size) => (
          <label key={size.name}>
            <input
              type="radio"
              name={`size-${item.id}`}
              checked={item.size === size.name}
              onChange={() => onSizeChange(size.name)}
            />
            {size.name}
          </label>
        ))}
      </fieldset>
      <label className="field">
        Молоко
        <select
          value={item.milk}
          onChange={(e) => onMilkChange(e.target.value)}
        >
          {milks.map((milk) => (
            <option key={milk.name}>{milk.name}</option>
          ))}
        </select>
      </label>
      <fieldset className="choice">
        <legend>Сиропи</legend>
        {syrups.map((syrup) => (
          <label key={syrup.name}>
            <input
              type="checkbox"
              checked={item.syrups.includes(syrup.name)}
              onChange={() => onSyrupToggle(syrup.name)}
            />
            {syrup.name}
          </label>
        ))}
      </fieldset>
      <button type="button" className="remove" onClick={handleRemove}>
        Видалити
      </button>
    </fieldset>
  )
}

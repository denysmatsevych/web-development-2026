import { stopListOptions } from '../data/menu.js'

/**
 * Панель «Стоп-лист»: відмітка для кожного напою, молока й сиропу. Відмічене
 * закінчилося, і його не можна додати до нового замовлення.
 *
 * Лише показує стоп-лист і викликає обробник:
 *   stopped   назви зі стоп-листа, масив рядків: ['Какао', 'вівсяне'];
 *   onToggle  onToggle(name), коли відмітку поставили чи зняли.
 */
export default function StopListPanel({ stopped, onToggle }) {
  return (
    <fieldset className="stop-list">
      <legend>Стоп-лист</legend>
      {stopListOptions.map(({ legend, names }) => (
        <fieldset key={legend} className="choice">
          <legend>{legend}</legend>
          {names.map((name) => (
            <label key={name}>
              <input
                type="checkbox"
                checked={stopped.includes(name)}
                onChange={() => onToggle(name)}
              />
              {name}
            </label>
          ))}
        </fieldset>
      ))}
    </fieldset>
  )
}

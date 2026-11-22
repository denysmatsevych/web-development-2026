import { useRef } from 'react'
import { flushSync } from 'react-dom'

/**
 * «Скасувати дію» й «Повторити дію» для черги. Кожна кнопка вимкнена, коли
 * нема чого скасовувати чи повторювати.
 */
export default function HistoryButtons({ canUndo, canRedo, onUndo, onRedo }) {
  const undoRef = useRef(null)
  const redoRef = useRef(null)

  // Кнопка, яку вимкнуло її ж натискання (кроків більше нема), втрачає фокус,
  // і він падає на початок сторінки. Тому flushSync одразу оновлює сторінку,
  // а фокус переходить на другу кнопку.
  function press(action, button, other) {
    flushSync(action)
    if (button.current.disabled) other.current.focus()
  }

  return (
    <div className="history" role="group" aria-label="Історія змін">
      <button
        ref={undoRef}
        type="button"
        onClick={() => press(onUndo, undoRef, redoRef)}
        disabled={!canUndo}
      >
        Скасувати дію
      </button>
      <button
        ref={redoRef}
        type="button"
        onClick={() => press(onRedo, redoRef, undoRef)}
        disabled={!canRedo}
      >
        Повторити дію
      </button>
    </div>
  )
}

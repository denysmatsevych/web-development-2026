/**
 * Контексти черги замовлень і хуки, які їх читають.
 *
 * §4.4. Створіть і експортуйте тут два контексти, кожен через
 * createContext(null):
 *   QueueContext          значення — { queue, canUndo, canRedo }: стан
 *                         черги (present з історії) і чи є що скасувати
 *                         й повторити;
 *   QueueDispatchContext  значення — dispatch ред'юсера черги.
 *
 * §4.5. Хуки для компонентів. Кожен читає свій контекст, а якщо компонент
 * рендериться не всередині <QueueProvider>, кидає помилку, у тексті якої
 * названо QueueProvider.
 *
 * Поки що хуки кидають помилку. Вимоги — у тестах
 * tests/queueContext.test.jsx і tests/QueueProvider.test.jsx.
 */

/** { queue, canUndo, canRedo } з найближчого QueueProvider. */
export function useQueue() {
  throw new Error('Not implemented: useQueue')
}

/** dispatch ред'юсера черги з найближчого QueueProvider. */
export function useQueueDispatch() {
  throw new Error('Not implemented: useQueueDispatch')
}

import { createContext } from 'react'

/**
 * Стоп-лист — те, що в кав'ярні закінчилося. Значення контексту:
 *
 *   { stopped, toggle }
 *
 * stopped — назви напоїв, молока й сиропів зі стоп-листа, масив рядків:
 * ['Какао', 'вівсяне']; toggle(name) додає назву до стоп-листа або
 * прибирає з нього.
 *
 * Контекст уже створено: тести, які рендерять компоненти без App, дають
 * через нього порожній стоп-лист.
 */
export const StopListContext = createContext(null)

/**
 * §4.6. { stopped, toggle } з найближчого StopListProvider. Якщо компонент
 * рендериться не всередині <StopListProvider>, кидає помилку, у тексті якої
 * названо StopListProvider.
 *
 * Поки що кидає помилку. Вимоги — у тестах tests/StopList.test.jsx.
 */
export function useStopList() {
  throw new Error('Not implemented: useStopList')
}

import { createContext, use } from 'react'

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
 * { stopped, toggle } з найближчого StopListProvider. Хук готовий: він
 * написаний так само, як useQueue у §4.5. Якщо компонент рендериться не
 * всередині <StopListProvider>, хук кидає помилку, у тексті якої названо
 * StopListProvider.
 */
export function useStopList() {
  const value = use(StopListContext)
  if (value === null) {
    throw new Error('useStopList must be used within a StopListProvider')
  }
  return value
}

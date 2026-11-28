import ErrorPage from './ErrorPage.jsx'

// «Сторінку не знайдено» — для невідомої адреси; з іншим title — для
// невідомого фільму чи сеансу.
export default function NotFoundPage({ title = 'Сторінку не знайдено' }) {
  return <ErrorPage title={title}>Такої сторінки на сайті немає.</ErrorPage>
}

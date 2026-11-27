import { Link } from 'react-router'

export default function NotFoundPage() {
  return (
    <main className="not-found">
      <h1>Сторінку не знайдено</h1>
      <Link to="/">До публікацій</Link>
    </main>
  )
}

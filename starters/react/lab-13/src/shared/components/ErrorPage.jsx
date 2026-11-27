import { Link } from 'react-router'

// Сторінка помилки: заголовок з пропа title, пояснення й посилання на
// «Афішу». Її показують NotFoundPage і сторінки помилок у §4.9.2, §4.9.4.
export default function ErrorPage({ title, children }) {
  return (
    <section className="error-page">
      <h1 tabIndex={-1}>{title}</h1>
      {children && <p>{children}</p>}
      <p>
        <Link to="/">До афіші</Link>
      </p>
    </section>
  )
}

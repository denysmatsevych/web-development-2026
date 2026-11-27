import { Link } from 'react-router'
import NotFoundPage from '../../shared/components/NotFoundPage.jsx'
import Poster from '../../shared/components/Poster.jsx'
import { findMovie } from '../../shared/data/movies.js'
import { sessionsOfMovie } from '../../shared/data/sessions.js'
import { formatDateTime } from '../../shared/utils/format.js'
// §4.9.4: import WatchlistButton from './WatchlistButton.jsx'

// Сторінка фільму. Зараз id фільму вона отримує через проп movieId; у §4.4
// вона має брати його з адреси сторінки.
export default function MoviePage({ movieId }) {
  const movie = findMovie(movieId)
  if (!movie) return <NotFoundPage title="Фільм не знайдено" />

  return (
    <article className="movie">
      <Poster movie={movie} />
      <div className="movie-info">
        <h1 tabIndex={-1}>{movie.title}</h1>
        <p className="lead">
          {movie.year} · режисер {movie.director}
        </p>
        <p>{movie.description}</p>
        {/* §4.9.4: посилання «Дивитися» і кнопка «До мого списку».
        <div className="movie-actions">
          {movie.online && (
            <Link className="button" to={`/movies/${movie.id}/watch`}>
              Дивитися
            </Link>
          )}
          <WatchlistButton movieId={movie.id} />
        </div>
        */}
        <h2>Сеанси</h2>
        <ul className="session-list">
          {sessionsOfMovie(movie.id).map((session) => (
            <li key={session.id}>
              <Link to={`/booking/${session.id}`}>
                {formatDateTime(session.startsAt)}
              </Link>
              <span>
                {session.hall} · {session.price} грн
              </span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}

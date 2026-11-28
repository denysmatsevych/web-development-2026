import { Link } from 'react-router'
import { findMovie } from '../../shared/data/movies.js'
import { sessionsByDay } from '../../shared/data/sessions.js'
import {
  formatDateTime,
  formatDay,
  formatTime,
} from '../../shared/utils/format.js'

export default function SchedulePage() {
  return (
    <>
      <h1>Розклад</h1>
      {sessionsByDay().map(({ day, sessions }) => (
        <section key={day} className="schedule-day">
          <h2>{formatDay(day)}</h2>
          <ul className="schedule-list">
            {sessions.map((session) => {
              const movie = findMovie(session.movieId)
              return (
                <li key={session.id}>
                  <span className="time">{formatTime(session.startsAt)}</span>
                  <Link to={`/movies/${movie.id}`}>{movie.title}</Link>
                  <span className="hall">{session.hall}</span>
                  <Link
                    className="button small"
                    to={`/booking/${session.id}`}
                    aria-label={`Обрати місця: ${movie.title}, ${formatDateTime(session.startsAt)}`}
                  >
                    Обрати місця
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </>
  )
}

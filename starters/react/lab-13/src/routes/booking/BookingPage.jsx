import { useState } from 'react'
import { useUser } from '../../shared/auth/session.js'
import NotFoundPage from '../../shared/components/NotFoundPage.jsx'
import { findMovie } from '../../shared/data/movies.js'
import { findSession, halls } from '../../shared/data/sessions.js'
import { bookSeats, useTakenSeats } from '../../shared/data/tickets.js'
import { formatDateTime, plural } from '../../shared/utils/format.js'
import SeatMap from './SeatMap.jsx'

// Бронювання місць на сеанс. Зараз id сеансу сторінка отримує через проп
// sessionId; у §4.5 вона має брати його з адреси сторінки.
export default function BookingPage({ sessionId }) {
  const user = useUser()
  const taken = useTakenSeats(sessionId)
  const [chosen, setChosen] = useState([])

  const session = findSession(sessionId)
  if (!session) return <NotFoundPage title="Сеанс не знайдено" />
  const movie = findMovie(session.movieId)

  function handleToggle(row, seat) {
    setChosen((places) =>
      places.some((place) => place.row === row && place.seat === seat)
        ? places.filter((place) => place.row !== row || place.seat !== seat)
        : [...places, { row, seat }],
    )
  }

  function handleBook() {
    bookSeats(user.email, session.id, chosen)
    // §4.5: після бронювання — перехід у «Мої квитки».
  }

  return (
    <section className="booking">
      <h1>Бронювання: {movie.title}</h1>
      <p className="lead">
        {formatDateTime(session.startsAt)} · {session.hall} · {session.price}{' '}
        грн за місце
      </p>
      <SeatMap
        hall={halls[session.hall]}
        taken={taken}
        chosen={chosen}
        onToggle={handleToggle}
      />
      <div className="booking-summary">
        <p aria-live="polite">
          {chosen.length === 0
            ? 'Оберіть місця на схемі зали.'
            : `Обрано ${chosen.length} ${plural(chosen.length, ['місце', 'місця', 'місць'])} · ${chosen.length * session.price} грн`}
        </p>
        <button
          type="button"
          className="button"
          disabled={!user || chosen.length === 0}
          onClick={handleBook}
        >
          Забронювати
        </button>
      </div>
    </section>
  )
}

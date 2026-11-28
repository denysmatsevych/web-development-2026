import { Link } from 'react-router'
import { useUser } from '../../shared/auth/session.js'
import { findMovie } from '../../shared/data/movies.js'
import { findSession } from '../../shared/data/sessions.js'
import { useTickets } from '../../shared/data/tickets.js'
import { formatDateTime } from '../../shared/utils/format.js'
import QrCode from './QrCode.jsx'

// «Мої квитки»: квитки користувача, кожен з QR-кодом для входу в залу.
export default function TicketsPage() {
  const user = useUser()
  const tickets = useTickets(user?.email)

  return (
    <section>
      <h2>Мої квитки</h2>
      {tickets.length === 0 ? (
        <p>
          Квитків поки немає. Оберіть сеанс у{' '}
          <Link to="/schedule">розкладі</Link>.
        </p>
      ) : (
        <ul className="ticket-list">
          {tickets.map((ticket) => {
            const session = findSession(ticket.sessionId)
            const movie = findMovie(session.movieId)
            const place = `Ряд ${ticket.row}, місце ${ticket.seat}`
            return (
              <li key={ticket.id} className="ticket">
                <div>
                  <h3>{movie.title}</h3>
                  <p>{formatDateTime(session.startsAt)}</p>
                  <p>{session.hall}</p>
                  <p className="place">{place}</p>
                </div>
                <QrCode
                  value={`KINO-${ticket.id}`}
                  label={`QR-код квитка: ${movie.title}, ${place.toLowerCase()}`}
                />
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

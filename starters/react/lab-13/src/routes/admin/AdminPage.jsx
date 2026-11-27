import { findMovie } from '../../shared/data/movies.js'
import { halls, sessions } from '../../shared/data/sessions.js'
import { useAllTickets } from '../../shared/data/tickets.js'
import { formatDateTime } from '../../shared/utils/format.js'

// «Адміністрування» (§4.9.2): скільки місць зайнято на кожному сеансі.
export default function AdminPage() {
  const tickets = useAllTickets()

  return (
    <section>
      <h1 tabIndex={-1}>Адміністрування</h1>
      <table className="admin-table">
        <caption>Заповненість сеансів</caption>
        <thead>
          <tr>
            <th scope="col">Сеанс</th>
            <th scope="col">Зала</th>
            <th scope="col">Зайнято</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((session) => {
            const { rows, seats } = halls[session.hall]
            const booked = tickets.filter(
              (ticket) => ticket.sessionId === session.id,
            ).length
            return (
              <tr key={session.id}>
                <td>
                  {findMovie(session.movieId).title},{' '}
                  {formatDateTime(session.startsAt)}
                </td>
                <td>{session.hall}</td>
                <td>
                  {session.taken.length + booked} з {rows * seats}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </section>
  )
}

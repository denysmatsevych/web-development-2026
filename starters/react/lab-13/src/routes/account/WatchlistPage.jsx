import { Link } from 'react-router'
import { useUser } from '../../shared/auth/session.js'
import { findMovie } from '../../shared/data/movies.js'
import { useWatchlist } from '../../shared/data/watchlist.js'

// «Мій список» (§4.9.4): фільми, які користувач зберіг на сторінці фільму.
export default function WatchlistPage() {
  const user = useUser()
  const list = useWatchlist(user?.email)

  return (
    <section>
      <h2>Мій список</h2>
      {list.length === 0 ? (
        <p>У списку поки немає фільмів. Додайте їх на сторінці фільму.</p>
      ) : (
        <ul className="watchlist">
          {list.map((id) => (
            <li key={id}>
              <Link to={`/movies/${id}`}>{findMovie(id)?.title}</Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

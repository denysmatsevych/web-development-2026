import { useUser } from '../../shared/auth/session.js'
import {
  addToWatchlist,
  removeFromWatchlist,
  useWatchlist,
} from '../../shared/data/watchlist.js'

// Кнопка «До мого списку» на сторінці фільму (§4.9.4). Користувач, який
// увійшов, додає фільм у «Мій список» або прибирає з нього.
export default function WatchlistButton({ movieId }) {
  const user = useUser()
  const list = useWatchlist(user?.email)

  if (!user) {
    // §4.9.4: тут посилання для гостя «Увійдіть, щоб додати».
    return null
  }

  const saved = list.includes(movieId)
  return (
    <button
      type="button"
      className="button secondary"
      onClick={() =>
        saved
          ? removeFromWatchlist(user.email, movieId)
          : addToWatchlist(user.email, movieId)
      }
    >
      {saved ? 'Прибрати зі списку' : 'До мого списку'}
    </button>
  )
}

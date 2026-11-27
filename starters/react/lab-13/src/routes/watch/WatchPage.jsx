import { useParams } from 'react-router'
import NotFoundPage from '../../shared/components/NotFoundPage.jsx'
import Poster from '../../shared/components/Poster.jsx'
import { findMovie } from '../../shared/data/movies.js'

// «Дивитися» (§4.9.4): перегляд фільму на сайті. Відео в цій роботі
// немає, тож замість програвача — обкладинка.
export default function WatchPage() {
  const { movieId } = useParams()
  const movie = findMovie(movieId)
  if (!movie) return <NotFoundPage title="Фільм не знайдено" />

  return (
    <section className="watch">
      <h1 tabIndex={-1}>Перегляд: {movie.title}</h1>
      <div className="player">
        <Poster movie={movie} />
        <p>Тут був би відеопрогравач.</p>
      </div>
    </section>
  )
}

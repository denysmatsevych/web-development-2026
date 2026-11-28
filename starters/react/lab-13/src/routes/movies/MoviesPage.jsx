import { Link } from 'react-router'
import Poster from '../../shared/components/Poster.jsx'
import { movies } from '../../shared/data/movies.js'

export default function MoviesPage() {
  return (
    <>
      <h1>Афіша</h1>
      <p className="lead">Фільми цього тижня. Сеанси — на сторінці фільму.</p>
      <ul className="movie-grid">
        {movies.map((movie) => (
          <li key={movie.id} className="movie-card">
            <Poster movie={movie} />
            <h2>
              <Link to={`/movies/${movie.id}`}>{movie.title}</Link>
            </h2>
            <p>
              {movie.year} · {movie.director}
            </p>
          </li>
        ))}
      </ul>
    </>
  )
}

// Обкладинка фільму без зображення: назва на тлі з двох кольорів фільму.
export default function Poster({ movie }) {
  const [dark, light] = movie.colors
  return (
    <div
      className="poster"
      aria-hidden="true"
      style={{ background: `linear-gradient(160deg, ${dark}, ${light})` }}
    >
      <span>{movie.title}</span>
    </div>
  )
}

// Схема зали: кнопка на кожне місце. Обране місце позначене aria-pressed,
// зайняте вимкнене. chosen — масив { row, seat }, onToggle(row, seat)
// додає місце до обраних або прибирає.
export default function SeatMap({ hall, taken, chosen, onToggle }) {
  const rows = Array.from({ length: hall.rows }, (_, i) => i + 1)
  const seats = Array.from({ length: hall.seats }, (_, i) => i + 1)
  const isChosen = (row, seat) =>
    chosen.some((place) => place.row === row && place.seat === seat)

  return (
    <div className="seat-map">
      <p className="screen">Екран</p>
      {rows.map((row) => (
        <div
          key={row}
          className="seat-row"
          role="group"
          aria-label={`Ряд ${row}`}
        >
          <span className="row-number" aria-hidden="true">
            {row}
          </span>
          {seats.map((seat) => {
            const busy = taken.has(`${row}-${seat}`)
            return (
              <button
                key={seat}
                type="button"
                className="seat"
                aria-label={`Ряд ${row}, місце ${seat}${busy ? ' (зайняте)' : ''}`}
                aria-pressed={busy ? undefined : isChosen(row, seat)}
                disabled={busy}
                onClick={() => onToggle(row, seat)}
              >
                {seat}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}

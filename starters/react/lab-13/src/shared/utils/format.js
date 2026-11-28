const dayFormat = new Intl.DateTimeFormat('uk', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})
const dateFormat = new Intl.DateTimeFormat('uk', {
  day: 'numeric',
  month: 'long',
})

// '2026-12-08' → «вівторок, 8 грудня»
export function formatDay(day) {
  return dayFormat.format(new Date(`${day}T00:00`))
}

// '2026-12-08T17:00' → «17:00»
export function formatTime(startsAt) {
  return startsAt.slice(11, 16)
}

// '2026-12-08T17:00' → «8 грудня, 17:00»
export function formatDateTime(startsAt) {
  return `${dateFormat.format(new Date(startsAt))}, ${formatTime(startsAt)}`
}

// Слово після числа: plural(2, ['місце', 'місця', 'місць']) → «місця».
export function plural(count, [one, few, many]) {
  const tens = count % 100
  const units = count % 10
  if (tens >= 11 && tens <= 14) return many
  if (units === 1) return one
  if (units >= 2 && units <= 4) return few
  return many
}

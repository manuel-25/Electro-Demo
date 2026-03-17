export const formatDate = (input, withTime = false) => {
  if (!input) return 'N/A'

  const date = new Date(input)
  if (isNaN(date.getTime())) return 'Fecha inválida'

  const options = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    ...(withTime && {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
  }

  return date.toLocaleString('es-AR', options)
}

export const timeSince = (input) => {
  if (!input) return ''

  const date = new Date(input)
  const now = new Date()

  const seconds = Math.floor((now - date) / 1000)

  const intervals = [
    { label: 'año', seconds: 31536000 },
    { label: 'mes', seconds: 2592000 },
    { label: 'día', seconds: 86400 },
    { label: 'hora', seconds: 3600 },
    { label: 'minuto', seconds: 60 }
  ]

  for (const i of intervals) {
    const count = Math.floor(seconds / i.seconds)
    if (count >= 1) {
      return `hace ${count} ${i.label}${count > 1 ? 's' : ''}`
    }
  }

  return 'hace unos segundos'
}
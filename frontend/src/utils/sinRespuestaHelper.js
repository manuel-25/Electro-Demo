export const getSinRespuestaInfo = (service) => {
  const now = new Date()

  const createdAt = new Date(service.createdAt)
  const lastActivity = new Date(service.lastActivityAt || service.createdAt)

  const diffCreationMs = now - createdAt
  const diffActivityMs = now - lastActivity

  const days = (ms) => Math.floor(ms / (1000 * 60 * 60 * 24))

  const formatTime = (ms) => {
    const d = days(ms)
    if (d >= 1) return `${d} día${d > 1 ? 's' : ''}`

    const h = Math.floor(ms / (1000 * 60 * 60))
    if (h >= 1) return `${h} hora${h > 1 ? 's' : ''}`

    const m = Math.floor(ms / (1000 * 60))
    return `${m} minuto${m > 1 ? 's' : ''}`
  }

  const daysSinceCreation = days(diffCreationMs)

  return {
    level: daysSinceCreation < 7 ? 'fuerte' : 'leve',
    timeSinceCreation: formatTime(diffCreationMs),
    timeSinceLastActivity: formatTime(diffActivityMs),
    daysSinceCreation
  }
}
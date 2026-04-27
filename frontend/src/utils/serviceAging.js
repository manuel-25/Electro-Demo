export const getServiceAging = (service) => {
  const now = new Date()

  const createdAt = new Date(service.createdAt)
  const lastActivity = new Date(service.lastActivityAt || service.createdAt)

  const daysSinceCreation = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24))
  const daysSinceLastActivity = Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24))

  return {
    daysSinceCreation,
    daysSinceLastActivity
  }
}
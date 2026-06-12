export const statusConfig = {
  priority: { label: 'Prioridad', tone: 'danger' },
  waiting: { label: 'Pendiente', tone: 'warning' },
  in_progress: { label: 'En gestion', tone: 'info' },
  resolved: { label: 'Finalizado', tone: 'success' },
  bot: { label: 'Bot', tone: 'neutral' }
}

export const statusOrder = {
  priority: 1,
  waiting: 2,
  in_progress: 3,
  bot: 4,
  resolved: 5
}

export function formatDuration(minutes) {
  if (!minutes || minutes < 0) return '-'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins}m`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}

export function getWaitingMinutes(date) {
  if (!date) return 0
  return Math.floor((Date.now() - new Date(date).getTime()) / 60000)
}

export function getWaitLabel(conversation) {
  if (!conversation?.humanRequestedAt) return '-'

  if (conversation.status === 'waiting' || conversation.status === 'priority') {
    return formatDuration(getWaitingMinutes(conversation.humanRequestedAt))
  }

  if ((conversation.status === 'in_progress' || conversation.status === 'resolved') && conversation.firstResponseAt) {
    const minutes = Math.floor(
      (new Date(conversation.firstResponseAt).getTime() - new Date(conversation.humanRequestedAt).getTime()) / 60000
    )
    return formatDuration(minutes)
  }

  return '-'
}

export function getCleanPhone(phone = '') {
  return String(phone).replace('@c.us', '')
}

export function getWhatsappUrl(phone = '') {
  return `https://wa.me/${getCleanPhone(phone).replace(/\D/g, '')}`
}

export function sortConversations(conversations) {
  return [...conversations].sort((a, b) => {
    const statusDelta = (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99)
    if (statusDelta) return statusDelta

    if (a.status === 'priority' || a.status === 'waiting') {
      return getWaitingMinutes(b.humanRequestedAt) - getWaitingMinutes(a.humanRequestedAt)
    }

    return new Date(b.lastMessageAt || b.updatedAt || 0) - new Date(a.lastMessageAt || a.updatedAt || 0)
  })
}

export function filterConversations(conversations, { status, query }) {
  const cleanQuery = String(query || '').toLowerCase().trim()
  return conversations.filter(conversation => {
    const statusMatch = status === 'all' || conversation.status === status
    if (!cleanQuery) return statusMatch

    const haystack = [
      conversation.phone,
      conversation.contactName,
      conversation.lastCustomerMessage,
      conversation.assignedTo
    ].filter(Boolean).join(' ').toLowerCase()

    return statusMatch && haystack.includes(cleanQuery)
  })
}

export function getDashboardCounts(conversations) {
  return conversations.reduce((acc, conversation) => {
    acc.total += 1
    acc[conversation.status] = (acc[conversation.status] || 0) + 1
    acc.unread += Number(conversation.unreadCount || 0)
    return acc
  }, { total: 0, unread: 0 })
}

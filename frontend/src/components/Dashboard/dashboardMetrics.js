import { normalizeStatus } from '../../utils/serviceStatusUtils.js'

const DAY_MS = 1000 * 60 * 60 * 24

export const FINAL_SERVICE_STATUSES = ['Entregado', 'Entregado S/R', 'Retirado a bodega', 'Garantía']
export const READY_TO_PICKUP_STATUSES = [
  'Listo para retirar',
  'Listo para retirar Garantía',
  'Listo para retiro S/R'
]

export const money = (value) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  }).format(Number(value) || 0)

export const getLastActivity = (service) => {
  return new Date(
    service.updatedAt ||
    service.workOrderAnsweredAt ||
    service.workOrderSentAt ||
    service.createdAt
  )
}

export const getInactivityBadge = (lastActivity) => {
  const diffDays = (new Date() - new Date(lastActivity)) / DAY_MS
  const days = Math.floor(diffDays)

  if (days >= 30) return { days, label: 'Critico' }
  if (days >= 7) return { days, label: 'Atencion' }
  return { days, label: '' }
}

export const isStatusOneOf = (service, statuses) => {
  const normalizedStatus = normalizeStatus(service?.status)
  return statuses.some(status => normalizeStatus(status) === normalizedStatus)
}

export const getDashboardMetrics = ({ services, quotes, clients, now = new Date() }) => {
  const thisMonth = now.getMonth()
  const thisYear = now.getFullYear()

  const pendingQuotes = quotes.filter(quote => quote.status === 'Pendiente')
  const servicesCreatedThisMonth = services.filter(service => {
    const date = new Date(service.createdAt)
    return date.getMonth() === thisMonth && date.getFullYear() === thisYear
  })

  const servicesDeliveredThisMonth = services.filter(service => {
    if (!service.deliveredAt || !isStatusOneOf(service, ['Entregado'])) return false
    const date = new Date(service.deliveredAt)
    return date.getMonth() === thisMonth && date.getFullYear() === thisYear
  })

  const activeRepairServices = services.filter(service =>
    !isStatusOneOf(service, FINAL_SERVICE_STATUSES)
  )

  const readyToPickup = services.filter(service =>
    isStatusOneOf(service, READY_TO_PICKUP_STATUSES)
  )

  const activeServices = services.filter(service => {
    if (isStatusOneOf(service, FINAL_SERVICE_STATUSES)) return false

    const diffDays = (now - getLastActivity(service)) / DAY_MS
    return diffDays >= 1 && diffDays <= 60
  })

  const monthlyRevenue = servicesDeliveredThisMonth.reduce(
    (sum, service) => sum + (Number(service.finalValue) || 0),
    0
  )

  // Conversion demo: cotizaciones que terminaron en servicio. Se limita a 100
  // porque en demo pueden existir servicios creados manualmente sin cotizacion real.
  const convertedQuotes = services.filter(service => service.quoteReference).length
  const conversionRate = quotes.length
    ? Math.min(100, Math.round((convertedQuotes / quotes.length) * 100))
    : 0

  return {
    pendingQuotes,
    servicesCreatedThisMonth,
    servicesDeliveredThisMonth,
    activeRepairServices,
    readyToPickup,
    activeServices,
    sortedAlerts: [...activeServices].sort((a, b) => getLastActivity(a) - getLastActivity(b)),
    monthlyRevenue,
    conversionRate,
    clientCount: clients.length
  }
}

export const getStatusFlow = ({ services, readyToPickup }) => {
  const flowColors = ['#f2b705', '#1976d2', '#8e9aa3', '#12b76a', '#027a48']
  const rows = [
    { label: 'Pendientes', value: services.filter(service => isStatusOneOf(service, ['Pendiente'])).length },
    { label: 'En gestion', value: services.filter(service => isStatusOneOf(service, ['En Gestión'])).length },
    { label: 'Reparacion', value: services.filter(service => isStatusOneOf(service, ['Reparación'])).length },
    { label: 'Listos', value: readyToPickup.length },
    { label: 'Entregados', value: services.filter(service => isStatusOneOf(service, ['Entregado'])).length }
  ]

  return rows.map((item, index) => ({
    ...item,
    color: flowColors[index] || '#027a48'
  }))
}

import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { getApiUrl } from '../../config'
import DashboardLayout from '../DashboardLayout/DashboardLayout'
import { Line, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js'
import 'chartjs-adapter-date-fns'
import './Estadisticas.css'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  TimeScale
)

const DAY_MS = 1000 * 60 * 60 * 24
const TERMINAL_STATUSES = ['Entregado', 'Entregado S/R', 'Sin respuesta', 'Retirado a bodega']
const DELIVERED_STATUSES = ['Entregado', 'Entregado S/R']
const READY_TO_PICKUP_STATUSES = ['listo para retirar', 'listo para retiro s/r', 'listo para retirar garantia']
const REPAIR_STATUSES = ['reparacion', 'reparacion garantia', 'armado s/r']
const PORTFOLIO_STATUSES = ['reparacion', 'reparacion garantia', 'listo para retirar', 'listo para retiro s/r', 'listo para retirar garantia']

const money = (value) => `$${Math.round(Number(value) || 0).toLocaleString('es-AR')}`
const toDateInput = (date) => date.toISOString().split('T')[0]
const toLocalDateKey = (date) => {
  const parsed = new Date(date)
  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`
}
const parseDateInput = (dateInput, endOfDay = false) => {
  const [year, month, day] = String(dateInput).split('-').map(Number)
  const date = new Date(year, month - 1, day)
  if (endOfDay) date.setHours(23, 59, 59, 999)
  return date
}
const getDateRangeKeys = (startInput, endInput) => {
  const keys = []
  const cursor = parseDateInput(startInput)
  const end = parseDateInput(endInput)

  while (cursor <= end) {
    keys.push(toLocalDateKey(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }

  return keys
}
const daysBetween = (from, to) => (new Date(to) - new Date(from)) / DAY_MS
const sumFinalValue = (services) => services.reduce((acc, service) => acc + (Number(service.finalValue) || 0), 0)
const getServiceValue = (service) => Number(service.finalValue || service.repuestos) || Number(String(service.approximateValue || '').replace(/\D/g, '')) || 0
const countBy = (items, predicate) => items.filter(predicate).length
const normalizeText = (value) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .trim()
const isStatus = (service, statuses) => statuses.includes(service.status) || statuses.includes(normalizeText(service.status))

const makeTrend = (current, previous, lowerIsBetter = false) => {
  const delta = (Number(current) || 0) - (Number(previous) || 0)
  if (Math.abs(delta) < 0.01) return { direction: 'flat', label: 'sin cambios' }

  const improved = lowerIsBetter ? delta < 0 : delta > 0
  return { direction: improved ? 'up' : 'down', label: improved ? 'Mejor' : 'Peor' }
}

const countChartOptions = {
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        precision: 0
      }
    }
  }
}

const TrendIcon = ({ direction }) => (
  <svg viewBox="0 0 22 22" aria-hidden="true">
    {direction === 'down' ? (
      <>
        <path d="M6 7l10 10" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M10 17h6v-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ) : direction === 'flat' ? (
      <>
        <path d="M5 11h12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M13 7l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ) : (
      <>
        <path d="M6 15L16 5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M10 5h6v6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </>
    )}
  </svg>
)

const getDefaultStartDate = () => {
  const date = new Date()
  date.setDate(date.getDate() - 30)
  return toDateInput(date)
}

const getMonthWindow = (services, targetDate) => {
  return services.filter(service => {
    if (!service.deliveredAt) return false
    const deliveredAt = new Date(service.deliveredAt)
    return deliveredAt.getMonth() === targetDate.getMonth() &&
      deliveredAt.getFullYear() === targetDate.getFullYear()
  })
}

const getAverageRepairDays = (services) => {
  const times = services
    .filter(service => service.createdAt && service.deliveredAt)
    .map(service => daysBetween(service.createdAt, service.deliveredAt))

  return times.length ? times.reduce((acc, value) => acc + value, 0) / times.length : 0
}

const getTopEntries = (items, getKey, limit = 6) => {
  const counts = items.reduce((acc, item) => {
    const key = getKey(item)
    if (!key) return acc
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, value]) => ({ label, value }))
}

const getAverageStageHours = (services) => {
  const stageMap = new Map()

  services.forEach(service => {
    const history = [...(service.statusHistory || [])]
      .filter(entry => entry.changedAt && entry.status)
      .sort((a, b) => new Date(a.changedAt) - new Date(b.changedAt))

    history.forEach((entry, index) => {
      const next = history[index + 1]
      if (!next) return

      const status = normalizeText(entry.status)
      const hours = (new Date(next.changedAt) - new Date(entry.changedAt)) / (1000 * 60 * 60)
      if (!Number.isFinite(hours) || hours < 0) return

      if (!stageMap.has(status)) stageMap.set(status, [])
      stageMap.get(status).push(hours)
    })
  })

  return Array.from(stageMap.entries()).map(([stage, hours]) => ({
    label: stage,
    value: hours.reduce((acc, value) => acc + value, 0) / hours.length
  }))
}

function buildCharts({ deliveredServices, filteredStartDate, filteredEndDate, statusBuckets }) {
  // Chart 1: entregas dentro del rango seleccionado por el usuario.
  const start = parseDateInput(filteredStartDate)
  const end = parseDateInput(filteredEndDate, true)
  const deliveredFiltered = deliveredServices.filter(service => {
    if (!service.deliveredAt) return false
    const deliveredAt = new Date(service.deliveredAt)
    return deliveredAt >= start && deliveredAt <= end
  })

  const dailyCounts = deliveredFiltered.reduce((acc, service) => {
    const day = toLocalDateKey(service.deliveredAt)
    acc[day] = (acc[day] || 0) + 1
    return acc
  }, {})
  const dateRangeKeys = getDateRangeKeys(filteredStartDate, filteredEndDate)

  // Chart 2: facturacion mensual historica, usando servicios entregados.
  const revenueByMonth = deliveredServices.reduce((acc, service) => {
    if (!service.deliveredAt) return acc
    const deliveredAt = new Date(service.deliveredAt)
    const key = `${deliveredAt.getFullYear()}-${String(deliveredAt.getMonth() + 1).padStart(2, '0')}`
    acc[key] = (acc[key] || 0) + (Number(service.finalValue) || 0)
    return acc
  }, {})
  const sortedMonths = Object.keys(revenueByMonth).sort()

  // Chart 3: ranking de equipos entregados.
  const deviceCounts = deliveredServices.reduce((acc, service) => {
    const device = service.equipmentType || 'Sin equipo'
    acc[device] = (acc[device] || 0) + 1
    return acc
  }, {})
  const sortedDevices = Object.entries(deviceCounts).sort((a, b) => b[1] - a[1]).slice(0, 8)

  return {
    dailyDeliveries: {
      labels: dateRangeKeys,
      datasets: [{
        label: 'Servicios entregados',
        data: dateRangeKeys.map(day => dailyCounts[day] || 0),
        borderColor: '#1976d2',
        backgroundColor: '#1976d240',
        tension: 0.35
      }]
    },
    monthlyRevenue: {
      labels: sortedMonths,
      datasets: [{
        label: 'Facturacion',
        data: sortedMonths.map(month => revenueByMonth[month]),
        backgroundColor: '#43a047'
      }]
    },
    serviceFunnel: {
      labels: statusBuckets.map(item => item.label),
      datasets: [{
        label: 'Servicios',
        data: statusBuckets.map(item => item.value),
        backgroundColor: statusBuckets.map(item => item.color)
      }]
    },
    repairedDevices: {
      labels: sortedDevices.map(device => device[0]),
      datasets: [{
        label: 'Servicios',
        data: sortedDevices.map(device => device[1]),
        backgroundColor: '#ff7b00'
      }]
    }
  }
}

function buildDecisionCards(metrics) {
  return [
    { tone: 'blue', label: 'Servicios activos', value: metrics.activeServices.length, detail: `${metrics.activeWithoutBudget} sin presupuesto` },
    { tone: 'teal', label: 'Pendientes de ingreso', value: metrics.pendingReception, detail: 'equipos aun no recibidos' },
    { tone: 'purple', label: 'OT listas para enviar', value: metrics.readyToSend, detail: 'requieren contacto' },
    { tone: 'green', label: 'Presupuestos aceptados', value: metrics.acceptedBudgets, detail: 'listos para avanzar' },
    { tone: 'orange', label: 'Listos para retirar', value: metrics.readyToPickup, detail: 'coordinar entrega' },
    { tone: 'red', label: 'Sin respuesta', value: metrics.noResponse, detail: `${metrics.warehouse} en bodega` },
    {
      tone: 'green',
      label: 'Facturacion mensual',
      value: money(metrics.totalRevenue),
      detail: `${metrics.currentMonthServices.length} entregados`,
      trend: makeTrend(metrics.totalRevenue, metrics.previousRevenue)
    },
    {
      tone: 'orange',
      label: 'Ticket promedio',
      value: money(metrics.currentAvgTicket || metrics.avgTicket),
      detail: `${metrics.avgRepairDays.toFixed(1)} dias promedio`,
      trend: makeTrend(metrics.currentAvgTicket, metrics.previousAvgTicket)
    },
    {
      tone: 'purple',
      label: 'Conversion entregados',
      value: `${metrics.currentConversion.toFixed(0)}%`,
      detail: 'entregados del mes sobre servicios',
      trend: makeTrend(metrics.currentConversion, metrics.previousConversion)
    },
    {
      tone: 'teal',
      label: 'Tiempo promedio',
      value: `${(metrics.currentAvgRepairDays || metrics.avgRepairDays).toFixed(1)} dias`,
      detail: 'creacion a entrega',
      trend: makeTrend(metrics.currentAvgRepairDays, metrics.previousAvgRepairDays, true)
    },
    {
      tone: 'blue',
      label: 'Valor en cartera',
      value: money(metrics.portfolioValue),
      detail: 'aceptados + reparacion + retiro'
    },
    {
      tone: 'green',
      label: 'Facturacion proyectada',
      value: money(metrics.projectedRevenue),
      detail: 'mes actual + cartera'
    },
    {
      tone: 'orange',
      label: 'Clientes nuevos',
      value: metrics.newClients,
      detail: 'sin historial repetido'
    },
    {
      tone: 'purple',
      label: 'Clientes recurrentes',
      value: metrics.recurrentClients,
      detail: '2 o mas servicios'
    },
    {
      tone: 'teal',
      label: 'Garantias activas',
      value: metrics.warrantyOpen,
      detail: 'casos abiertos'
    }
  ]
}

function useBusinessMetrics({ services, clients, quotes, startDate, endDate }) {
  return useMemo(() => {
    const now = new Date()
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    // Base segments. Si algo se ve raro en pantalla, empezar debugueando estos arrays.
    const deliveredServices = services.filter(service => isStatus(service, DELIVERED_STATUSES))
    const currentMonthServices = getMonthWindow(deliveredServices, now)
    const previousMonthServices = getMonthWindow(deliveredServices, previousMonth)
    const activeServices = services.filter(service => !isStatus(service, TERMINAL_STATUSES))

    // Financial and timing metrics.
    const totalRevenue = sumFinalValue(currentMonthServices)
    const previousRevenue = sumFinalValue(previousMonthServices)
    const avgTicket = deliveredServices.length ? sumFinalValue(deliveredServices) / deliveredServices.length : 0
    const currentAvgTicket = currentMonthServices.length ? totalRevenue / currentMonthServices.length : 0
    const previousAvgTicket = previousMonthServices.length ? previousRevenue / previousMonthServices.length : 0
    const avgRepairDays = getAverageRepairDays(deliveredServices)
    const currentAvgRepairDays = getAverageRepairDays(currentMonthServices)
    const previousAvgRepairDays = getAverageRepairDays(previousMonthServices)

    // Operational counters used by cards, links and the service funnel.
    const pendingQuotes = quotes.filter(quote => quote.status === 'Pendiente')
    const pendingReception = countBy(services, service => normalizeText(service.status) === 'pendiente')
    const readyToSend = countBy(services, service => service.workOrderStatus === 'Lista para enviar')
    const sentBudgets = countBy(services, service => service.workOrderStatus === 'Enviada')
    const acceptedBudgets = countBy(services, service => service.workOrderStatus === 'Aceptada')
    const readyToPickup = countBy(services, service => isStatus(service, READY_TO_PICKUP_STATUSES))
    const noResponse = countBy(services, service => normalizeText(service.status) === 'sin respuesta')
    const warehouse = countBy(services, service => normalizeText(service.status) === 'retirado a bodega')
    const warrantyActive = countBy(services, service => service.activeWarrantyEventId)
    const activeWithoutBudget = countBy(activeServices, service => service.workOrderStatus === 'Sin presupuesto')
    const averageActiveAge = activeServices.length
      ? activeServices.reduce((sum, service) => sum + daysBetween(service.createdAt, now), 0) / activeServices.length
      : 0

    const currentConversion = services.length ? (currentMonthServices.length / services.length) * 100 : 0
    const previousConversion = services.length ? (previousMonthServices.length / services.length) * 100 : 0
    const monthlyRevenueTrend = makeTrend(totalRevenue, previousRevenue)

    const acceptedPortfolio = services.filter(service => service.workOrderStatus === 'Aceptada')
    const repairPortfolio = services.filter(service => isStatus(service, PORTFOLIO_STATUSES))
    const portfolioServices = [...new Map([...acceptedPortfolio, ...repairPortfolio].map(service => [service._id, service])).values()]
    const portfolioValue = portfolioServices.reduce((sum, service) => sum + getServiceValue(service), 0)
    const projectedRevenue = totalRevenue + portfolioValue

    const serviceCountByClient = services.reduce((acc, service) => {
      const customerNumber = service.customerNumber || service.userData?.customerNumber
      if (!customerNumber) return acc
      acc[customerNumber] = (acc[customerNumber] || 0) + 1
      return acc
    }, {})
    const recurrentClients = Object.values(serviceCountByClient).filter(total => total > 1).length
    const newClients = Math.max((clients || 0) - recurrentClients, 0)

    const warrantyServices = services.filter(service => service.activeWarrantyEventId || service.warrantyEvents?.length)
    const warrantyOpen = warrantyServices.filter(service => service.activeWarrantyEventId).length
    const warrantyClosed = warrantyServices.length - warrantyOpen

    const failureRanking = getTopEntries(
      quotes.flatMap(quote => Array.isArray(quote.faults) ? quote.faults : []),
      fault => fault,
      8
    )

    const operationalAlerts = [
      { label: 'Sin respuesta', value: noResponse, tone: noResponse ? 'red' : 'green', to: '/servicios?status=Sin respuesta' },
      { label: 'Presupuestos enviados', value: sentBudgets, tone: sentBudgets ? 'orange' : 'green', to: '/servicios?workOrderStatus=Enviada' },
      { label: 'Listos para retirar', value: readyToPickup, tone: readyToPickup ? 'blue' : 'green', to: '/servicios?status=Listo para retirar' },
      { label: 'En bodega', value: warehouse, tone: warehouse ? 'red' : 'green', to: '/servicios?status=Retirado a bodega' }
    ]

    const stageTimes = getAverageStageHours(services)

    const statusBuckets = [
      { label: 'Pendiente', value: pendingReception, color: '#f2b705' },
      { label: 'Recibido', value: countBy(services, service => normalizeText(service.status) === 'recibido'), color: '#1976d2' },
      { label: 'En gestion', value: countBy(services, service => ['en gestion', 'en gestion garantia'].includes(normalizeText(service.status))), color: '#0e9384' },
      { label: 'Reparacion', value: countBy(services, service => isStatus(service, REPAIR_STATUSES)), color: '#7a5af8' },
      { label: 'Listo retiro', value: readyToPickup, color: '#12b76a' },
      { label: 'Entregado', value: deliveredServices.length, color: '#027a48' }
    ]

    const charts = buildCharts({
      deliveredServices,
      filteredStartDate: startDate,
      filteredEndDate: endDate,
      statusBuckets
    })

    const lastServices = [...deliveredServices]
      .sort((a, b) => new Date(b.deliveredAt || b.updatedAt || b.createdAt) - new Date(a.deliveredAt || a.updatedAt || a.createdAt))
      .slice(0, 10)

    const metrics = {
      activeServices,
      currentMonthServices,
      totalRevenue,
      previousRevenue,
      avgTicket,
      currentAvgTicket,
      previousAvgTicket,
      avgRepairDays,
      currentAvgRepairDays,
      previousAvgRepairDays,
      pendingReception,
      readyToSend,
      sentBudgets,
      acceptedBudgets,
      readyToPickup,
      noResponse,
      warehouse,
      activeWithoutBudget,
      currentConversion,
      previousConversion,
      portfolioValue,
      projectedRevenue,
      newClients,
      recurrentClients,
      warrantyOpen
    }

    return {
      charts,
      lastServices,
      decisionCards: buildDecisionCards(metrics),
      decisionSummary: [
        { label: 'Cotizaciones pendientes', value: pendingQuotes.length, to: '/cotizaciones?status=Pendiente' },
        { label: 'Presupuestos enviados sin respuesta', value: sentBudgets, to: '/servicios?workOrderStatus=Enviada' },
        { label: 'Edad promedio activa', value: `${averageActiveAge.toFixed(1)} dias`, to: '/servicios' },
        { label: 'Garantias activas', value: warrantyActive, to: '/servicios' },
        { label: 'Clientes en base', value: clients, to: '/clientes' }
      ],
      businessInsights: {
        monthlyRevenueTrend,
        portfolioValue,
        projectedRevenue,
        newClients,
        recurrentClients,
        warrantyOpen,
        warrantyClosed,
        failureRanking,
        operationalAlerts,
        stageTimes,
        statusBuckets
      }
    }
  }, [services, clients, quotes, startDate, endDate])
}

const Estadisticas = () => {
  const [services, setServices] = useState([])
  const [clients, setClients] = useState(0)
  const [quotes, setQuotes] = useState([])
  const [startDate, setStartDate] = useState(getDefaultStartDate)
  const [endDate, setEndDate] = useState(() => toDateInput(new Date()))

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, clientsRes, quotesRes] = await Promise.all([
          axios.get(`${getApiUrl()}/api/service`, { withCredentials: true }),
          axios.get(`${getApiUrl()}/api/client`, { withCredentials: true }),
          axios.get(`${getApiUrl()}/api/quotes`, { withCredentials: true })
        ])

        setServices(Array.isArray(servicesRes.data) ? servicesRes.data : [])
        setClients(Array.isArray(clientsRes.data) ? clientsRes.data.length : 0)
        setQuotes(Array.isArray(quotesRes.data) ? quotesRes.data : [])
      } catch (err) {
        console.error('Error cargando estadisticas', err)
      }
    }

    fetchData()
  }, [])

  const {
    charts,
    decisionCards,
    decisionSummary,
    lastServices,
    businessInsights
  } = useBusinessMetrics({ services, clients, quotes, startDate, endDate })

  return (
    <DashboardLayout>
      <div className="estadisticas-page">
        <div className="stats-heading">
          <span>Control del negocio</span>
          <h2>Panel de rendimiento operativo</h2>
        </div>

        <div className="card-container">
          {decisionCards.map(card => (
            <div key={card.label} className={`info-card ${card.tone} ${card.trend ? 'has-trend' : ''}`}>
              <p>{card.label}</p>
              <h3>{card.value}</h3>
              <small>{card.detail}</small>
              {card.trend && (
                <em
                  className={`metric-trend ${card.trend.direction}`}
                  title={card.trend.label}
                  aria-label={card.trend.label}
                >
                  <TrendIcon direction={card.trend.direction} />
                </em>
              )}
            </div>
          ))}
        </div>

        <div className="decision-strip">
          {decisionSummary.map(item => (
            <Link key={item.label} to={item.to}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </Link>
          ))}
        </div>

        <div className="business-insights">
          <div className="insight-panel insight-panel-wide">
            <div className="insight-heading">
              <span>Variacion mensual</span>
              <strong className={`insight-trend ${businessInsights.monthlyRevenueTrend.direction}`}>
                <TrendIcon direction={businessInsights.monthlyRevenueTrend.direction} />
              </strong>
            </div>
            <p>Valor en cartera</p>
            <h3>{money(businessInsights.portfolioValue)}</h3>
            <small>Facturacion proyectada: {money(businessInsights.projectedRevenue)}</small>
          </div>

          <div className="insight-panel">
            <div className="insight-heading">
              <span>Clientes recurrentes</span>
            </div>
            <div className="mini-kpi-row">
              <strong>{businessInsights.newClients}</strong>
              <span>Nuevos</span>
            </div>
            <div className="mini-kpi-row">
              <strong>{businessInsights.recurrentClients}</strong>
              <span>Recurrentes</span>
            </div>
          </div>

          <div className="insight-panel">
            <div className="insight-heading">
              <span>Garantias</span>
            </div>
            <div className="mini-kpi-row">
              <strong>{businessInsights.warrantyOpen}</strong>
              <span>Activas</span>
            </div>
            <div className="mini-kpi-row">
              <strong>{businessInsights.warrantyClosed}</strong>
              <span>Cerradas</span>
            </div>
          </div>
        </div>

        <div className="insight-grid">
          <div className="chart-box insight-table-box">
            <h3>Ranking de fallas</h3>
            <table className="stats-table compact">
              <thead>
                <tr>
                  <th>Falla</th>
                  <th>Casos</th>
                </tr>
              </thead>
              <tbody>
                {businessInsights.failureRanking.map(item => (
                  <tr key={item.label}>
                    <td>{item.label}</td>
                    <td>{item.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="chart-box insight-table-box">
            <h3>Funnel de conversion</h3>
            <table className="stats-table compact">
              <thead>
                <tr>
                  <th>Etapa</th>
                  <th>Servicios</th>
                </tr>
              </thead>
              <tbody>
                {businessInsights.statusBuckets.map(item => (
                  <tr key={item.label}>
                    <td><span className="status-dot" style={{ background: item.color }} />{item.label}</td>
                    <td>{item.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="chart-box insight-table-box">
            <h3>Alertas operativas</h3>
            <div className="alert-list">
              {businessInsights.operationalAlerts.map(alert => (
                <Link key={alert.label} to={alert.to} className={`alert-item ${alert.tone}`}>
                  <span>{alert.label}</span>
                  <strong>{alert.value}</strong>
                </Link>
              ))}
            </div>
          </div>

          <div className="chart-box insight-table-box">
            <h3>Tiempo por etapa</h3>
            <table className="stats-table compact">
              <thead>
                <tr>
                  <th>Etapa</th>
                  <th>Promedio</th>
                </tr>
              </thead>
              <tbody>
                {businessInsights.stageTimes.length > 0 ? businessInsights.stageTimes.map(item => (
                  <tr key={item.label}>
                    <td>{item.label}</td>
                    <td>{item.value < 24 ? `${item.value.toFixed(1)} hs` : `${(item.value / 24).toFixed(1)} dias`}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="2">Sin historial suficiente</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="chart-box">
          <div className="chart-header">
            <p>Servicios entregados</p>
            <div className="date-range">
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <Line data={charts.dailyDeliveries} options={countChartOptions} />
        </div>

        <div className="chart-box">
          <p>Flujo de servicios</p>
          <Bar data={charts.serviceFunnel} options={countChartOptions} />
        </div>

        <div className="chart-box">
          <p>Facturacion por mes</p>
          <Bar data={charts.monthlyRevenue} />
        </div>

        <div className="chart-box">
          <p>Equipos mas reparados</p>
          <Bar data={charts.repairedDevices} />
        </div>

        <div className="chart-box">
          <h3>Ultimos servicios entregados</h3>
          <table className="stats-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Equipo</th>
                <th>Marca</th>
                <th>Valor</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {lastServices.length > 0 ? lastServices.map(service => (
                <tr key={service._id}>
                  <td>{service.userData?.firstName || ''} {service.userData?.lastName || ''}</td>
                  <td>{service.equipmentType || '-'}</td>
                  <td>{service.brand || '-'}</td>
                  <td>{money(service.finalValue)}</td>
                  <td>{new Date(service.deliveredAt || service.updatedAt || service.createdAt).toLocaleDateString()}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5">No hay servicios recientes</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Estadisticas

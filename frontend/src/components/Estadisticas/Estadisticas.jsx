import React, { useEffect, useState } from 'react'
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

const money = (value) => `$${Math.round(Number(value) || 0).toLocaleString('es-AR')}`
const makeTrend = (current, previous, lowerIsBetter = false) => {
  const delta = (Number(current) || 0) - (Number(previous) || 0)
  if (Math.abs(delta) < 0.01) return { direction: 'flat', label: 'sin cambios' }
  const improved = lowerIsBetter ? delta < 0 : delta > 0
  return { direction: improved ? 'up' : 'down', label: `${improved ? 'Mejor' : 'Peor'}` }
}

const TrendIcon = ({ direction }) => {
  return (
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
}

const Estadisticas = () => {
  const [services, setServices] = useState([])
  const [clients, setClients] = useState(0)
  const [quotes, setQuotes] = useState([])
  const [startDate, setStartDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 30)
    return d.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0])

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

  const now = new Date()
  const deliveredServices = services.filter(s => ['Entregado', 'Entregado S/R'].includes(s.status))
  const currentMonthServices = deliveredServices.filter(s => {
    if (!s.deliveredAt) return false
    const d = new Date(s.deliveredAt)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const previousMonthServices = deliveredServices.filter(s => {
    if (!s.deliveredAt) return false
    const d = new Date(s.deliveredAt)
    return d.getMonth() === previousMonth.getMonth() && d.getFullYear() === previousMonth.getFullYear()
  })
  const totalRevenue = currentMonthServices.reduce((acc, s) => acc + (Number(s.finalValue) || 0), 0)
  const previousRevenue = previousMonthServices.reduce((acc, s) => acc + (Number(s.finalValue) || 0), 0)
  const avgTicket = deliveredServices.length
    ? deliveredServices.reduce((acc, s) => acc + (Number(s.finalValue) || 0), 0) / deliveredServices.length
    : 0
  const currentAvgTicket = currentMonthServices.length ? totalRevenue / currentMonthServices.length : 0
  const previousAvgTicket = previousMonthServices.length ? previousRevenue / previousMonthServices.length : 0
  const repairTimes = deliveredServices
    .filter(s => s.createdAt && s.deliveredAt)
    .map(s => (new Date(s.deliveredAt) - new Date(s.createdAt)) / (1000 * 60 * 60 * 24))
  const avgRepairDays = repairTimes.length
    ? repairTimes.reduce((a, b) => a + b, 0) / repairTimes.length
    : 0
  const getAvgRepair = (list) => {
    const times = list
      .filter(s => s.createdAt && s.deliveredAt)
      .map(s => (new Date(s.deliveredAt) - new Date(s.createdAt)) / (1000 * 60 * 60 * 24))
    return times.length ? times.reduce((a, b) => a + b, 0) / times.length : 0
  }
  const currentAvgRepairDays = getAvgRepair(currentMonthServices)
  const previousAvgRepairDays = getAvgRepair(previousMonthServices)

  const activeServices = services.filter(s =>
    !['Entregado', 'Entregado S/R', 'Sin respuesta', 'Retirado a bodega'].includes(s.status)
  )
  const pendingQuotes = quotes.filter(q => q.status === 'Pendiente')
  const pendingReception = services.filter(s => s.status === 'Pendiente').length
  const readyToSend = services.filter(s => s.workOrderStatus === 'Lista para enviar').length
  const sentBudgets = services.filter(s => s.workOrderStatus === 'Enviada').length
  const acceptedBudgets = services.filter(s => s.workOrderStatus === 'Aceptada').length
  const currentConversion = services.length ? (currentMonthServices.length / services.length) * 100 : 0
  const previousConversion = services.length ? (previousMonthServices.length / services.length) * 100 : 0
  const readyToPickup = services.filter(s =>
    ['Listo para retirar', 'Listo para retiro S/R', 'Listo para retirar Garantía'].includes(s.status)
  ).length
  const noResponse = services.filter(s => s.status === 'Sin respuesta').length
  const warehouse = services.filter(s => s.status === 'Retirado a bodega').length
  const warrantyActive = services.filter(s => s.activeWarrantyEventId).length
  const activeWithoutBudget = activeServices.filter(s => s.workOrderStatus === 'Sin presupuesto').length
  const averageActiveAge = activeServices.length
    ? activeServices.reduce((sum, s) => sum + ((now - new Date(s.createdAt)) / (1000 * 60 * 60 * 24)), 0) / activeServices.length
    : 0

  const deliveredFiltered = deliveredServices.filter(s => {
    if (!s.deliveredAt) return false
    const d = new Date(s.deliveredAt)
    return d >= new Date(startDate) && d <= new Date(endDate)
  })
  const dailyCounts = deliveredFiltered.reduce((acc, s) => {
    const day = new Date(s.deliveredAt).toISOString().split('T')[0]
    acc[day] = (acc[day] || 0) + 1
    return acc
  }, {})
  const sortedDays = Object.keys(dailyCounts).sort()
  const chartDaily = {
    labels: sortedDays,
    datasets: [{
      label: 'Servicios entregados',
      data: sortedDays.map(d => dailyCounts[d]),
      borderColor: '#1976d2',
      backgroundColor: '#1976d240',
      tension: 0.35
    }]
  }

  const revenueMonth = deliveredServices.reduce((acc, s) => {
    if (!s.deliveredAt) return acc
    const d = new Date(s.deliveredAt)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    acc[key] = (acc[key] || 0) + (Number(s.finalValue) || 0)
    return acc
  }, {})
  const sortedMonths = Object.keys(revenueMonth).sort()
  const chartRevenueMonth = {
    labels: sortedMonths,
    datasets: [{
      label: 'Facturacion',
      data: sortedMonths.map(m => revenueMonth[m]),
      backgroundColor: '#43a047'
    }]
  }

  const statusBuckets = [
    { label: 'Pendiente', value: pendingReception, color: '#f2b705' },
    { label: 'Recibido', value: services.filter(s => s.status === 'Recibido').length, color: '#1976d2' },
    { label: 'En gestion', value: services.filter(s => s.status === 'En Gestión').length, color: '#0e9384' },
    { label: 'Reparacion', value: services.filter(s => ['Reparación', 'Reparación Garantía', 'Armado S/R'].includes(s.status)).length, color: '#7a5af8' },
    { label: 'Listo retiro', value: readyToPickup, color: '#12b76a' },
    { label: 'Entregado', value: deliveredServices.length, color: '#027a48' }
  ]
  const chartFunnel = {
    labels: statusBuckets.map(item => item.label),
    datasets: [{
      label: 'Servicios',
      data: statusBuckets.map(item => item.value),
      backgroundColor: statusBuckets.map(item => item.color)
    }]
  }

  const deviceCounts = deliveredServices.reduce((acc, s) => {
    const device = s.equipmentType || 'Sin equipo'
    acc[device] = (acc[device] || 0) + 1
    return acc
  }, {})
  const sortedDevices = Object.entries(deviceCounts).sort((a, b) => b[1] - a[1]).slice(0, 8)
  const chartDevices = {
    labels: sortedDevices.map(d => d[0]),
    datasets: [{
      label: 'Servicios',
      data: sortedDevices.map(d => d[1]),
      backgroundColor: '#ff7b00'
    }]
  }

  const lastServices = deliveredServices
    .sort((a, b) => new Date(b.deliveredAt || b.updatedAt || b.createdAt) - new Date(a.deliveredAt || a.updatedAt || a.createdAt))
    .slice(0, 10)

  const decisionCards = [
    { tone: 'blue', label: 'Servicios activos', value: activeServices.length, detail: `${activeWithoutBudget} sin presupuesto` },
    { tone: 'teal', label: 'Pendientes de ingreso', value: pendingReception, detail: 'equipos aun no recibidos' },
    { tone: 'purple', label: 'OT listas para enviar', value: readyToSend, detail: 'requieren contacto' },
    { tone: 'green', label: 'Presupuestos aceptados', value: acceptedBudgets, detail: 'listos para avanzar' },
    { tone: 'orange', label: 'Listos para retirar', value: readyToPickup, detail: 'coordinar entrega' },
    { tone: 'red', label: 'Sin respuesta', value: noResponse, detail: `${warehouse} en bodega` },
    { tone: 'green', label: 'Facturacion mensual', value: money(totalRevenue), detail: `${currentMonthServices.length} entregados`, trend: makeTrend(totalRevenue, previousRevenue) },
    { tone: 'orange', label: 'Ticket promedio', value: money(currentAvgTicket || avgTicket), detail: `${avgRepairDays.toFixed(1)} dias promedio`, trend: makeTrend(currentAvgTicket, previousAvgTicket) },
    { tone: 'purple', label: 'Conversion entregados', value: `${currentConversion.toFixed(0)}%`, detail: 'entregados del mes sobre servicios', trend: makeTrend(currentConversion, previousConversion) },
    { tone: 'teal', label: 'Tiempo promedio', value: `${(currentAvgRepairDays || avgRepairDays).toFixed(1)} dias`, detail: 'creacion a entrega', trend: makeTrend(currentAvgRepairDays, previousAvgRepairDays, true) }
  ]

  const decisionSummary = [
    { label: 'Cotizaciones pendientes', value: pendingQuotes.length, to: '/cotizaciones?status=Pendiente' },
    { label: 'Presupuestos enviados sin respuesta', value: sentBudgets, to: '/servicios?workOrderStatus=Enviada' },
    { label: 'Edad promedio activa', value: `${averageActiveAge.toFixed(1)} dias`, to: '/servicios' },
    { label: 'Garantias activas', value: warrantyActive, to: '/servicios' },
    { label: 'Clientes en base', value: clients, to: '/clientes' }
  ]

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

        <div className="chart-box">
          <div className="chart-header">
            <p>Servicios entregados</p>
            <div className="date-range">
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <Line data={chartDaily} />
        </div>

        <div className="chart-box">
          <p>Flujo de servicios</p>
          <Bar data={chartFunnel} />
        </div>

        <div className="chart-box">
          <p>Facturacion por mes</p>
          <Bar data={chartRevenueMonth} />
        </div>

        <div className="chart-box">
          <p>Equipos mas reparados</p>
          <Bar data={chartDevices} />
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
              {lastServices.length > 0 ? lastServices.map(s => (
                <tr key={s._id}>
                  <td>{s.userData?.firstName || ''} {s.userData?.lastName || ''}</td>
                  <td>{s.equipmentType || '-'}</td>
                  <td>{s.brand || '-'}</td>
                  <td>{money(s.finalValue)}</td>
                  <td>{new Date(s.deliveredAt || s.updatedAt || s.createdAt).toLocaleDateString()}</td>
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

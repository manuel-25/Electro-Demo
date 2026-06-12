import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faPrint, faFileLines } from '@fortawesome/free-solid-svg-icons'
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons'
import { getApiUrl } from '../../config'
import { AuthContext } from '../../Context/AuthContext'
import { timeSince } from '../../utils/formatDate.js'
import { getStatusClass } from '../../utils/serviceStatusUtils.js'
import ServiceStatusControl from '../ServiceStatusControl/ServiceStatusControl.jsx'
import WorkOrderControl from '../WorkOrderControl/WorkOrderControl.jsx'
import {
  getDashboardMetrics,
  getInactivityBadge,
  getLastActivity,
  getStatusFlow,
  money
} from './dashboardMetrics.js'
import './Dashboard.css'

const updateServiceInList = (services, serviceId, updatedService) => {
  return services.map(service =>
    service._id === serviceId ? { ...service, ...updatedService } : service
  )
}

const Dashboard = () => {
  const [quotes, setQuotes] = useState([])
  const [clients, setClients] = useState([])
  const [services, setServices] = useState([])
  const [error, setError] = useState(null)
  const [fullUser, setFullUser] = useState(null)

  const { auth, loading: authLoading } = useContext(AuthContext)
  const token = auth?.token

  useEffect(() => {
    if (authLoading || !auth) return

    const fetchData = async () => {
      try {
        const [quotesRes, clientsRes, servicesRes] = await Promise.all([
          axios.get(`${getApiUrl()}/api/quotes`, { withCredentials: true }),
          axios.get(`${getApiUrl()}/api/client`, { withCredentials: true }),
          axios.get(`${getApiUrl()}/api/service`, { withCredentials: true })
        ])

        setQuotes(Array.isArray(quotesRes.data) ? quotesRes.data : [])
        setClients(Array.isArray(clientsRes.data) ? clientsRes.data : [])
        setServices(Array.isArray(servicesRes.data) ? servicesRes.data : [])
        setError(null)
      } catch (err) {
        setError('Error al obtener datos')
      }
    }

    fetchData()
  }, [authLoading, auth])

  useEffect(() => {
    if (authLoading || !auth) return

    const fetchFullUser = async () => {
      try {
        const res = await axios.get(`${getApiUrl()}/api/manager/me`, { withCredentials: true })
        setFullUser(res.data)
      } catch (err) {
        console.error(err)
      }
    }

    fetchFullUser()
  }, [auth, authLoading])

  const metrics = getDashboardMetrics({ services, quotes, clients })
  const statusFlow = getStatusFlow({ services, readyToPickup: metrics.readyToPickup })
  const maxFlowValue = Math.max(...statusFlow.map(item => item.value), 1)

  const handleServiceUpdate = (serviceId, updatedService) => {
    setServices(prev => updateServiceInList(prev, serviceId, updatedService))
  }

  return (
    <div className="main-content dashboard-wrapper">
      <section className="dashboard-hero">
        <div>
          <span className="dashboard-kicker">Demo operativa</span>
          <h1>Electrosafe Dashboard</h1>
          <p>
            Flujo interno para cotizaciones, recepcion de equipos, ordenes de trabajo,
            reparacion y entrega. Datos cargados desde Mongo en colecciones demo.
          </p>
        </div>

        {fullUser && (
          <div className="user-greeting">
            <span>Sesion demo</span>
            <h2>{fullUser.firstName} {fullUser.lastName}</h2>
            <p>{fullUser.role} - {fullUser.branch || 'Sin sucursal'}</p>
          </div>
        )}
      </section>

      <div className="card-container">
        <div className="info-card blue">
          <p>Cotizaciones</p>
          <h3>{quotes.length}</h3>
          <small>{metrics.pendingQuotes.length} pendientes</small>
        </div>

        <div className="info-card red">
          <p>Clientes</p>
          <h3>{metrics.clientCount}</h3>
          <small>Base demo editable</small>
        </div>

        <div className="info-card teal">
          <p>Servicios mes</p>
          <h3>{metrics.servicesCreatedThisMonth.length}</h3>
          <small>{metrics.activeRepairServices.length} en circuito</small>
        </div>

        <div className="info-card purple">
          <p>Facturado mes</p>
          <h3>{money(metrics.monthlyRevenue)}</h3>
          <small>{metrics.servicesDeliveredThisMonth.length} entregados</small>
        </div>

        <div className="info-card green">
          <p>Conversion</p>
          <h3>{metrics.conversionRate}%</h3>
          <small>cotizacion a servicio</small>
        </div>
      </div>

      <section className="dashboard-grid">
        <div className="dashboard-panel">
          <div className="dashboard-panel-heading">
            <span>Embudo operativo</span>
            <strong>{services.length} servicios</strong>
          </div>

          <div className="flow-list">
            {statusFlow.map(item => (
              <div className="flow-row" key={item.label}>
                <div>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
                <i
                  style={{
                    width: `${Math.max((item.value / maxFlowValue) * 100, 8)}%`,
                    background: item.color
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="dashboard-panel-heading">
            <span>Proximas acciones</span>
            <strong>{metrics.readyToPickup.length + metrics.pendingQuotes.length}</strong>
          </div>

          <div className="action-stack">
            <Link to="/cotizaciones?status=Pendiente">
              Responder {metrics.pendingQuotes.length} cotizaciones pendientes
            </Link>
            <Link to="/servicios?scope=active">
              Gestionar {metrics.activeRepairServices.length} servicios activos
            </Link>
            <Link to="/servicios?scope=ready">
              Coordinar retiro de {metrics.readyToPickup.length} equipos listos
            </Link>
            <Link to="/estadisticas">Ver rendimiento mensual</Link>
          </div>
        </div>
      </section>

      <div className="dashboard-section-title">
        <div>
          <span>Control de seguimiento</span>
          <h2>Servicios con inactividad</h2>
        </div>
        <Link to="/servicios" className="dashboard-text-link">Ver todos</Link>
      </div>

      <div className="table-wrapper">
        <table className="styled-table">
          <thead className="table-head">
            <tr>
              <th className="col-code">Codigo</th>
              <th className="col-client">Cliente</th>
              <th className="col-device">Equipo</th>
              <th className="col-status">Estado</th>
              <th className="col-date">Orden de trabajo</th>
              <th className="col-workorder">Inactividad</th>
              <th className="col-created">Responsable</th>
              <th className="col-actions">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {metrics.sortedAlerts.slice(0, 50).map(service => {
              const lastActivity = getLastActivity(service)
              const { days, label } = getInactivityBadge(lastActivity)

              return (
                <tr key={service._id}>
                  <td className="col-code">
                    <Link to={`/servicios/${service.code}`} className="service-link">
                      {service.code}
                    </Link>
                  </td>

                  <td className="col-client">
                    {service.userData?.firstName} {service.userData?.lastName}
                  </td>

                  <td className="col-device">
                    {service.equipmentType || '-'}
                  </td>

                  <td className="col-status">
                    <ServiceStatusControl
                      service={service}
                      token={token}
                      userEmail={auth?.user?.email}
                      userBranch={auth?.user?.branch}
                      className={getStatusClass(service.status)}
                      onUpdated={(updated) => handleServiceUpdate(service._id, updated)}
                    />
                  </td>

                  <td className="col-workorder">
                    <WorkOrderControl
                      service={service}
                      onUpdate={(updated) => handleServiceUpdate(service._id, updated)}
                    />
                  </td>

                  <td className="col-date">
                    <span className={`inactivity-cell ${days >= 7 ? 'is-warn' : ''}`}>
                      {timeSince(lastActivity)} ({days}d) {label}
                    </span>
                  </td>

                  <td className="col-client">
                    {service.updatedByEmail || service.createdByEmail || '-'}
                  </td>

                  <td className="acciones-cell">
                    <Link to={`/servicios/${service.code}/editar`} className="action-btn edit" title="Editar">
                      <FontAwesomeIcon icon={faPen} />
                    </Link>

                    <a
                      href={`/ticket/${service.publicId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="action-btn print"
                      title="Imprimir"
                    >
                      <FontAwesomeIcon icon={faPrint} />
                    </a>

                    <a
                      href={`/orden/${service.publicId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="action-btn orden"
                      title="Ver orden de trabajo"
                    >
                      <FontAwesomeIcon icon={faFileLines} />
                    </a>

                    {service.userData?.phone && (
                      <a
                        href={`https://wa.me/54${String(service.userData.phone).replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="action-btn wa"
                        title="WhatsApp"
                      >
                        <FontAwesomeIcon icon={faWhatsapp} />
                      </a>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {metrics.sortedAlerts.length === 0 && (
        <div className="empty-dashboard-state">
          No hay servicios inactivos para revisar.
        </div>
      )}

      {error && <p className="error-message">{error}</p>}
    </div>
  )
}

export default Dashboard

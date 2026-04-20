import React, { useEffect, useState, useContext } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { getApiUrl } from '../../config'
import { AuthContext } from '../../Context/AuthContext'
import DashboardLayout from '../DashboardLayout/DashboardLayout'
import ServiceStatusControl from '../ServiceStatusControl/ServiceStatusControl.jsx'
import WorkOrderControl from '../WorkOrderControl/WorkOrderControl.jsx'
import { timeSince } from '../../utils/formatDate.js'
import { getStatusClass } from '../../utils/productsData.jsx'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faPrint } from '@fortawesome/free-solid-svg-icons'
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons'
import { faFileLines } from '@fortawesome/free-solid-svg-icons'
import './Dashboard.css'

const getInactivityBadge = (lastActivity) => {
  const now = new Date()
  const diffDays = (now - new Date(lastActivity)) / (1000 * 60 * 60 * 24)

  const days = Math.floor(diffDays)

  let fire = ''

  if (days >= 30) fire = '🔥🔥'
  else if (days >= 7) fire = '🔥'

  return { days, fire }
}

const Dashboard = () => {
  const [quotes, setQuotes] = useState([])
  const [clients, setClients] = useState([])
  const [services, setServices] = useState([])
  const [error, setError] = useState(null)
  const [fullUser, setFullUser] = useState(null)

  const { auth, loading: authLoading } = useContext(AuthContext)
  const token = auth?.token
  const now = new Date()

  useEffect(() => {
    if (authLoading || !auth) return

    const fetchData = async () => {
      try {
        const [quotesRes, clientsRes, servicesRes] = await Promise.all([
          axios.get(`${getApiUrl()}/api/quotes`, { withCredentials: true }),
          axios.get(`${getApiUrl()}/api/client`, { withCredentials: true }),
          axios.get(`${getApiUrl()}/api/service`, { withCredentials: true })
        ])
        setQuotes(quotesRes.data)
        setClients(clientsRes.data)
        setServices(servicesRes.data)
      } catch (err) {
        setError('Error al obtener datos')
      }
    }

    fetchData()
  }, [authLoading, auth])

  useEffect(() => {
    if (!token || authLoading) return

    const fetchFullUser = async () => {
      try {
        const res = await axios.get(`${getApiUrl()}/api/manager/me`, { withCredentials: true })
        setFullUser(res.data)
      } catch (err) {
        console.error(err)
      }
    }

    fetchFullUser()
  }, [token, authLoading])

  // ================= ALERTAS =================

  const getLastActivity = (s) => {
    return new Date(
      s.updatedAt ||
      s.workOrderAnsweredAt ||
      s.workOrderSentAt ||
      s.createdAt
    )
  }

const activeServices = services.filter(s => {
  if (['Entregado', 'Entregado S/R', 'Retirado a bodega', 'Garantía'].includes(s.status)) return false

  const last = getLastActivity(s)
  const diffDays = (now - last) / (1000 * 60 * 60 * 24)

  return diffDays >= 1 && diffDays <= 60
})

  const sortedAlerts = [...activeServices].sort((a, b) =>
    getLastActivity(a) - getLastActivity(b)
  )
  // ================= CARDS =================

  const thisMonth = now.getMonth()
  const thisYear = now.getFullYear()

  const servicesCreatedThisMonth = services.filter(s => {
    const d = new Date(s.createdAt)
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear
  })

  const servicesDeliveredThisMonth = services.filter(s => {
    const d = new Date(s.deliveredAt)
    return s.status === 'Entregado' && d.getMonth() === thisMonth && d.getFullYear() === thisYear
  })

  return (
    <DashboardLayout>
      <div className="dashboard-wrapper">
        {/* ================= CARDS ================= */}
        <h2 className="dashboard-title">Electrosafe Dashboard</h2>

        <div className="card-container">
          <div className="info-card blue">
            <p>SOLICITUDES</p>
            <h3>{quotes.length}</h3>
          </div>

          <div className="info-card red">
            <p>CLIENTES</p>
            <h3>{clients.length}</h3>
          </div>

          <div className="info-card teal">
            <p>SERVICIOS MES</p>
            <h3>{servicesCreatedThisMonth.length}</h3>
          </div>

          <div className="info-card purple">
            <p>ENTREGADOS MES</p>
            <h3>{servicesDeliveredThisMonth.length}</h3>
          </div>
        </div>

        {/* ================= USER ================= */}
        {fullUser && (
          <div className="user-greeting">
            <h2>👋 Hola, {fullUser.firstName} {fullUser.lastName}</h2>
            <p>Rol: <strong>{fullUser.role}</strong></p>
            {fullUser.branch && <p>Sucursal: <strong>{fullUser.branch}</strong></p>}
          </div>
        )}

        {/* ================= ALERTAS ================= */}
        <h2 className="dashboard-title">🚨 Alertas - Servicios Inactivos</h2>

        <div className="table-wrapper">
          <table className="styled-table">
            <thead className="table-head">
              <tr>
                <th className="col-code">Código</th>
                <th className="col-client">Cliente</th>
                <th className="col-device">Equipo</th>
                <th className="col-status">Estado</th>
                <th className="col-date">Orden de Trabajo</th>
                <th className="col-workorder">Inactividad</th>
                <th className="col-created">Ultimo en Actualizar</th>
                <th className="col-actions">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {sortedAlerts.slice(0, 50).map(s => {
                const lastActivity = getLastActivity(s)
                const { days, fire } = getInactivityBadge(lastActivity)

                return (
                  <tr key={s._id}>
                    
                    {/* CODIGO */}
                    <td className="col-code">
                      <Link to={`/servicios/${s.code}`} className="service-link">
                        {s.code}
                      </Link>
                    </td>

                    {/* CLIENTE */}
                    <td className="col-client">
                      {s.userData?.firstName} {s.userData?.lastName}
                    </td>

                    {/* EQUIPO */}
                    <td className="col-device">
                      {s.equipmentType || '—'}
                    </td>

                    {/* STATUS (MISMO COMPONENTE) */}
                    <td className="col-status">
                      <ServiceStatusControl
                        service={s}
                        token={token}
                        userEmail={auth?.user?.email}
                        userBranch={auth?.user?.branch}
                        className={getStatusClass(s.status)}
                        onUpdated={(updated) => {
                          setServices(prev =>
                            prev.map(item =>
                              item._id === s._id ? { ...item, ...updated } : item
                            )
                          )
                        }}
                      />
                    </td>

                    {/* WORK ORDER CONTROL */}
                    <td className="col-workorder">
                      <WorkOrderControl
                        service={s}
                        onUpdate={(updated) => {
                          setServices(prev =>
                            prev.map(item =>
                              item._id === s._id ? { ...item, ...updated } : item
                            )
                          )
                        }}
                      />
                    </td>

                    {/* TIEMPO */}
                    <td className="col-date">
                      <span className="inactivity-cell">
                        {timeSince(lastActivity)} ({days}d) {fire}
                      </span>
                    </td>

                    {/* RESPONSABLE */}
                    <td className="col-client">
                      {s.updatedByEmail || s.createdByEmail || '—'}
                    </td>
                    {/* ACCIONES (MISMO ESTILO) */}
                    <td className="acciones-cell">
                      <Link to={`/servicios/${s.code}/editar`} className="action-btn edit" title="Editar">
                        <FontAwesomeIcon icon={faPen} />
                      </Link>
                    
                      <a
                        href={`/ticket/${s.publicId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="action-btn print"
                        title="Imprimir"
                      >
                        <FontAwesomeIcon icon={faPrint} />
                      </a>
                      <a
                        href={`/orden/${s.publicId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="action-btn orden"
                        title="Ver Orden de Trabajo"
                      >
                        <FontAwesomeIcon icon={faFileLines} />
                      </a>
                    
                      {s.userData?.phone && (
                        <a
                          href={`https://wa.me/54${String(s.userData.phone).replace(/\D/g, '')}`}
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

        {error && <p className="error-message">{error}</p>}
      </div>
    </DashboardLayout>
  )
}

export default Dashboard
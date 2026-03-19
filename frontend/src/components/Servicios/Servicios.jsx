import React, { useEffect, useState, useContext } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import DashboardLayout from '../DashboardLayout/DashboardLayout'
import { AuthContext } from '../../Context/AuthContext'
import { getApiUrl } from '../../config'
import Loading from '../Loading/Loading'
import ServiceStatusControl from '../ServiceStatusControl/ServiceStatusControl.jsx'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faPrint } from '@fortawesome/free-solid-svg-icons'
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons'
import { faFileLines } from '@fortawesome/free-solid-svg-icons'
import ServiceFilters from '../ServiceFilters/ServiceFilters'
import { formatDate } from '../../utils/formatDate.js'
import { timeSince } from '../../utils/formatDate.js'
import isDev from '../../utils/isDev.js'
import { getStatusClass } from '../../utils/productsData.jsx'
import './Servicios.css'

const Servicios = () => {
  const { auth } = useContext(AuthContext)

  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [itemsPerPage, setItemsPerPage] = useState(25)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' })
  const [isStateLoaded, setIsStateLoaded] = useState(false)

  /*=== Filtros === */
  const [filters, setFilters] = useState({
    code: '',
    branch: '',
    createdBy: '',
    equipment: '',
    month: '',
    status: ''
  })

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      code: '',
      branch: '',
      createdBy: '',
      equipment: '',
      month: '',
      status: ''
    })
  }

  useEffect(() => {
    if (!isStateLoaded) return // espera a que se carguen los filtros guardados antes de pedir datos
    const fetchAll = async () => {
      try {
        const res = await axios.get(`${getApiUrl()}/api/service`, {
          withCredentials: true
        })
        setServices(res.data || [])
      } catch (e) {
        if (isDev()) console.error('Error al actualizar servicios', e)
        setError('No se pudieron cargar los servicios.')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [auth, isStateLoaded])

  //Recarga si actualizan el estado
  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await axios.get(`${getApiUrl()}/api/service`, {
          // headers: { Authorization: `Bearer ${auth?.token}` },
          withCredentials: true
        })
        setServices(res.data || [])
      } catch (e) {
          if (isDev()) {
            console.error('Error al actualizar servicios', e)
          }
          setError('No se pudieron cargar los servicios.')
      }
    }

    const intervalId = setInterval(() => {
      fetchLatest()
    }, 30000) // cada 30 segundos

    return () => clearInterval(intervalId)
  }, [auth])

  const handleSort = key => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc'
    setSortConfig({ key, direction })
  }

  const renderSortIcon = key => {
    if (sortConfig.key !== key) return '⇅'
    return sortConfig.direction === 'asc' ? '↑' : '↓'
  }

  const handleNoteKeyDown = async (svc, e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      try {
        const updated = await axios.put(
          `${getApiUrl()}/api/service/${svc._id}/status`,
          {
            status: svc.status,
            note: e.target.value
          },
          {
            headers: { Authorization: `Bearer ${auth?.token}` },
            withCredentials: true
          }
        )
        setServices(prev => prev.map(s => (s._id === svc._id ? { ...s, ...updated.data } : s)))
      } catch (e2) {
        alert('Error al actualizar nota')
      }
    }
  }

  const filtered = services.filter(s => {
    const term = search.trim().toLowerCase()

    const matchesSearch = (
      s.code?.toLowerCase().includes(term) ||
      s.customerNumber?.toString().includes(term) ||
      `${s.userData?.firstName || ''} ${s.userData?.lastName || ''}`.toLowerCase().includes(term) ||
      s.equipmentType?.toLowerCase().includes(term)
    )

    const matchesCode = !filters.code || s.code?.startsWith(filters.code)
    const matchesBranch =
      filters.branch === '' ||
      (filters.branch === 'null' && s.receivedAtBranch === null) ||
      s.receivedAtBranch === filters.branch
    const matchesCreatedBy = !filters.createdBy || s.createdByEmail === filters.createdBy
    const matchesEquipment = !filters.equipment || s.equipmentType === filters.equipment
    const matchesMonth = !filters.month || new Date(s.createdAt).toISOString().slice(0, 7) === filters.month
    const matchesStatus = !filters.status || s.status === filters.status

    return matchesSearch && matchesCode && matchesBranch && matchesCreatedBy && matchesEquipment && matchesMonth && matchesStatus
  })

  const sorted = [...filtered].sort((a, b) => {
    const A = (a[sortConfig.key] || '').toString().toLowerCase()
    const B = (b[sortConfig.key] || '').toString().toLowerCase()
    if (A < B) return sortConfig.direction === 'asc' ? -1 : 1
    if (A > B) return sortConfig.direction === 'asc' ? 1 : -1
    return 0
  })

  const totalPages = Math.ceil(sorted.length / itemsPerPage)
  const pageData = sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  function resizeToCellHeight(textarea) {
    if (!textarea) return
    const td = textarea.closest('td')
    if (!td) return

    const cellHeight = td.offsetHeight
    textarea.style.height = `${cellHeight}px`
  }

// ========================== HANDLERS ==========================
const handleWorkOrderChange = async (id, newStatus) => {
  const service = services.find(s => s._id === id)

  if (!service || service.workOrderStatus === undefined) {
    alert('Este servicio no tiene orden de trabajo.')
    return
  }

  try {
    const res = await axios.patch(
      `${getApiUrl()}/api/service/${id}/workorder`,
      { newStatus },
      { withCredentials: true }
    )

    setServices(prev =>
      prev.map(s => (s._id === id ? { ...s, ...res.data } : s))
    )

  } catch (err) {
    const msg = err.response?.data?.error || 'Error actualizando la orden de trabajo'
    alert(msg)
  }
}

  // === Persistencia de filtros, búsqueda y paginación ===
  useEffect(() => {
    // Cargar estado guardado antes de todo
    const savedState = localStorage.getItem('serviciosState')
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState)
        if (parsed.filters) setFilters(parsed.filters)
        if (parsed.search) setSearch(parsed.search)
        if (parsed.itemsPerPage) setItemsPerPage(parsed.itemsPerPage)
        if (parsed.currentPage) setCurrentPage(parsed.currentPage)
      } catch (err) {
        console.error('Error cargando estado guardado', err)
      }
    }
    setIsStateLoaded(true) // marcamos que ya cargamos el estado
  }, [])

  useEffect(() => {
    if (!isStateLoaded) return // evitamos guardar antes de cargar
    const stateToSave = {
      filters,
      search,
      itemsPerPage,
      currentPage,
    }
    localStorage.setItem('serviciosState', JSON.stringify(stateToSave))
  }, [filters, search, itemsPerPage, currentPage, isStateLoaded])

  return (
    <DashboardLayout>
      <div className="dashboard-wrapper servicios-page">
        <h2 className="dashboard-title">🧰 Servicios</h2>

        {loading ? (
          <div className="loading-container"><Loading /></div>
        ) : (
          <>
            {error && <p className="error-message">{error}</p>}

            <div className="search-wrapper" style={{ position: 'relative', display: 'inline-block' }}>
              <input
                type="text"
                placeholder="Buscar por Código, Cliente, Equipo..."
                className="search-input"
                id="searchInputServices"
                value={search}
                onChange={e => { setSearch(e.target.value); setCurrentPage(1) }}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="clear-search-btn"
                  title="Borrar búsqueda"
                >
                  ✖
                </button>
              )}
            </div>

            <ServiceFilters
              services={services}
              filters={filters}
              onChange={handleFilterChange}
              onClear={clearFilters}
            />

            <div className="items-per-page">
              <label>Mostrar </label>
              <select value={itemsPerPage} onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1) }}>
                {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              <label> registros</label>
              <div className="right-controls">
                <Link to="/servicios/nuevo" className="btn-new-service">➕ Nuevo Servicio</Link>
              </div>
            </div>

            <div className="table-wrapper">
              <table className="styled-table">
                <thead className="table-head">
                  <tr>
                    <th className="col-code" onClick={() => handleSort('code')}>Código {renderSortIcon('code')}</th>
                    <th className="col-client" onClick={() => handleSort('customerNumber')}>Cliente {renderSortIcon('customerNumber')}</th>
                    <th className="col-date" onClick={() => handleSort('createdAt')}>Fecha {renderSortIcon('createdAt')}</th>
                    <th className="col-device" onClick={() => handleSort('equipmentType')}>Equipo {renderSortIcon('equipmentType')}</th>
                    <th className="col-description">Descripción</th>
                    <th className="col-client2">Cliente</th>
                    <th className="col-status">Estado</th>
                    <th className="col-workorder">Orden de Trabajo</th>
                    <th className="col-notes">Notas</th>
                    <th className="col-received">Recibido</th>
                    <th className="col-created" onClick={() => handleSort('createdBy')}>Creado por {renderSortIcon('createdBy')}</th>
                    <th className="col-actions">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pageData.map(s => {
                    const hasWorkOrder = s.workOrderStatus !== undefined

                    return (
                      <tr key={s._id}>
                      <td><Link to={`/servicios/${s.code}`} className="service-link">{s.code}</Link></td>
                      <td>
                        <Link to={`/clientes/${s.customerNumber}`} className="service-link">
                          {s.customerNumber}
                        </Link>
                      </td>
                      <td>{formatDate(s.createdAt)}</td>
                      <td className="col-device">{s.equipmentType || '—'}</td>
                      <td>{s.description || '—'}</td>
                      <td>{s.userData.firstName + ' ' + s.userData.lastName || '—'}</td>
                      <td>
                        <ServiceStatusControl
                          service={s}
                          token={auth?.token}
                          userEmail={auth?.user?.email}
                          userBranch={auth?.user?.branch}
                          note={s.notes}
                          className={getStatusClass(s.status)}
                          onUpdated={(updated) => {
                            setServices(prev =>
                              prev.map(item => item._id === s._id ? { ...item, ...updated } : item)
                            )
                          }}
                          onError={() => alert('Error al actualizar estado')}
                        />
                      </td>
                      <td className="workorder-cell">
                        {/* estados editables */}
                        {["Sin presupuesto","Lista para enviar", "Sin reparación"].includes(s.workOrderStatus) && (
                          <select
                            className="wo-select"
                            value={s.workOrderStatus}
                            onChange={e => handleWorkOrderChange(s._id, e.target.value)}
                          >
                            <option>Sin presupuesto</option>
                            <option>Lista para enviar</option>
                            <option>Sin reparación</option>
                          </select>
                        )}

                        {/* boton enviar */}
                        {s.workOrderStatus === "Lista para enviar" && (
                          <button
                            className="wo-btn send"
                            onClick={() => handleWorkOrderChange(s._id,"Enviada")}
                          >
                            Enviar
                          </button>
                        )}

                        {/* enviada */}
                          {s.workOrderStatus === "Enviada" && (
                            <div className="wo-sent-container">

                              <div className="wo-sent-label">
                                📤 Enviado {formatDate(s.workOrderSentAt, true)}
                              </div>

                              {s.workOrderSentAt && (
                                <div className="wo-waiting">
                                  ⏱ Esperando respuesta {timeSince(s.workOrderSentAt)}
                                </div>
                              )}

                              <div className="wo-action-buttons">
                                <button
                                  className="wo-btn accept"
                                  onClick={() => handleWorkOrderChange(s._id,"Aceptada")}
                                >
                                  Autoriza ✔
                                </button>

                                <button
                                  className="wo-btn reject"
                                  onClick={() => handleWorkOrderChange(s._id,"Rechazada")}
                                >
                                  Rechaza ✖
                                </button>
                              </div>

                            </div>
                          )}
                        {/* aceptada */}
                        {s.workOrderStatus === "Aceptada" && (
                          <div className="wo-status-box aceptada">

                            <div className="wo-status-info">
                              <div>Autorizado</div>

                              {s.workOrderAnsweredAt && (
                                <div className="wo-date">
                                  {formatDate(s.workOrderAnsweredAt, true)}
                                </div>
                              )}
                            </div>

                            <button
                              className="wo-btn reject"
                              onClick={() => handleWorkOrderChange(s._id,"Rechazada")}
                            >
                              Cambiar
                            </button>

                          </div>
                        )}
                        {/* rechazada */}
                        {s.workOrderStatus === "Rechazada" && (
                        <div className="wo-status-box rechazada">

                          <div className="wo-status-info">
                            <div>Rechazada</div>

                            {s.workOrderAnsweredAt && (
                              <div className="wo-date">
                                {formatDate(s.workOrderAnsweredAt, true)}
                              </div>
                            )}
                          </div>

                          <button
                            className="wo-btn accept"
                            onClick={() => handleWorkOrderChange(s._id,"Aceptada")}
                          >
                            Autorizar
                          </button>

                        </div>
                      )}
                      </td>
                      <td>
                        <textarea
                          className="notes-textarea auto-resize"
                          defaultValue={s.notes || ''}
                          ref={el => el && resizeToCellHeight(el)}
                          onKeyDown={(e) => handleNoteKeyDown(s, e)}
                        />
                      </td>
                      <td className="col-received">{s.receivedAtBranch || 'No recibido'}</td>
                      <td className="col-created">{s.createdByEmail || '—'}</td>
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

            <div className="pagination">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

export default Servicios

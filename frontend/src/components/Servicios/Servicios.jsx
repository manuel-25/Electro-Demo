import React, { useCallback, useEffect, useState, useContext } from 'react'
import axios from 'axios'
import { Link, useLocation } from 'react-router-dom'
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
import { getStatusClass, canStartWarranty, hasActiveWarranty, isWarrantyStatus } from '../../utils/serviceStatusUtils.js'
import WorkOrderControl from '../WorkOrderControl/WorkOrderControl.jsx'
import Modal from '../Modal/Modal.jsx'
import './Servicios.css'

const INITIAL_FILTERS = {
  code: '',
  branch: '',
  createdBy: '',
  equipment: '',
  month: '',
  status: '',
  scope: '',
  workOrderStatus: ''
}

const READY_STATUSES = ['Listo para retirar', 'Listo para retiro S/R', 'Listo para retirar Garantía']
const CLOSED_STATUSES = ['Entregado', 'Entregado S/R', 'Retirado a bodega', 'Sin respuesta']

const ServicePreviewPanel = ({ service }) => {
  if (!service) {
    return (
      <section className="service-preview-panel service-preview-empty">
        <div>
          <span>Vista rápida</span>
          <strong>Seleccioná un servicio</strong>
        </div>
        <p>Al elegir una fila vas a ver el resumen operativo sin entrar al detalle.</p>
      </section>
    )
  }

  const clientName = service.userData
    ? `${service.userData.firstName || ''} ${service.userData.lastName || ''}`.trim()
    : ''
  const deviceName = [service.equipmentType, service.brand, service.model].filter(Boolean).join(' ')
  const accessories = service.receptionChecklist?.accessories || []

  return (
    <section className="service-preview-panel">
      <div className="service-preview-main">
        <div>
          <span>Vista rápida</span>
          <strong>{service.code}</strong>
          <p>{deviceName || 'Equipo sin especificar'}</p>
        </div>
        <div className="service-preview-actions">
          <Link to={`/servicios/${service.code}`}>Ver detalle</Link>
          <Link to={`/servicios/${service.code}/editar`}>Editar</Link>
        </div>
      </div>

      <div className="service-preview-grid">
        <div>
          <span>Cliente</span>
          <strong>{clientName || 'Sin cliente'}</strong>
          <small>#{service.customerNumber || '—'}</small>
        </div>
        <div>
          <span>Estado</span>
          <strong>{service.status || 'Sin estado'}</strong>
          <small>{service.workOrderStatus || 'Sin presupuesto'}</small>
        </div>
        <div>
          <span>Sucursal</span>
          <strong>{service.receivedAtBranch || 'No recibido'}</strong>
          <small>{service.deliveryMethod || 'Presencial'}</small>
        </div>
        <div>
          <span>Valor</span>
          <strong>${Number(service.finalValue || 0).toLocaleString('es-AR')}</strong>
          <small>{service.approximateValue || 'Sin aproximado'}</small>
        </div>
      </div>

      <div className="service-preview-notes">
        <div>
          <span>Descripción</span>
          <p>{service.description || service.userDescription || 'Sin descripción cargada.'}</p>
        </div>
        <div>
          <span>Notas</span>
          <p>{service.notes || 'Sin notas internas.'}</p>
        </div>
      </div>

      {accessories.length > 0 && (
        <div className="preview-accessories">
          {accessories.slice(0, 6).map((acc, index) => (
            <small key={acc._id || `${acc.name}-${index}`}>{acc.label || acc.name}</small>
          ))}
        </div>
      )}
    </section>
  )
}

const Servicios = () => {
  const { auth } = useContext(AuthContext)
  const location = useLocation()

  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [itemsPerPage, setItemsPerPage] = useState(25)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' })
  const [isStateLoaded, setIsStateLoaded] = useState(false)
  const [warrantyModal, setWarrantyModal] = useState(null)
  const [loadingWarranty, setLoadingWarranty] = useState(false)
  const [warrantyReason, setWarrantyReason] = useState('')
  const [warrantyDiagnosis, setWarrantyDiagnosis] = useState('')
  const [warrantyCovered, setWarrantyCovered] = useState(true)
  const [requiresBudget, setRequiresBudget] = useState(false)
  const [showWarrantyForm, setShowWarrantyForm] = useState(false)
  const [selectedServiceId, setSelectedServiceId] = useState(null)

  const [filters, setFilters] = useState(INITIAL_FILTERS)

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters(INITIAL_FILTERS)
  }

  const fetchServices = useCallback(async ({ finishLoading = false } = {}) => {
    try {
      const res = await axios.get(`${getApiUrl()}/api/service`, {
        withCredentials: true
      })
      setServices(res.data || [])
    } catch (e) {
      if (isDev()) console.error('Error al actualizar servicios', e)
      setError('No se pudieron cargar los servicios.')
    } finally {
      if (finishLoading) setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isStateLoaded) return
    fetchServices({ finishLoading: true })
  }, [fetchServices, isStateLoaded])

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchServices()
    }, 30000)

    return () => clearInterval(intervalId)
  }, [fetchServices])

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
    const matchesWorkOrderStatus = !filters.workOrderStatus || s.workOrderStatus === filters.workOrderStatus
    const matchesScope =
      !filters.scope ||
      (filters.scope === 'active' && !CLOSED_STATUSES.includes(s.status)) ||
      (filters.scope === 'ready' && READY_STATUSES.includes(s.status))

    return matchesSearch && matchesCode && matchesBranch && matchesCreatedBy && matchesEquipment && matchesMonth && matchesStatus && matchesWorkOrderStatus && matchesScope
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
  const selectedService = services.find(service => service._id === selectedServiceId) || null

  function resizeToCellHeight(textarea) {
    if (!textarea) return
    const td = textarea.closest('td')
    if (!td) return

    const cellHeight = td.offsetHeight
    textarea.style.height = `${cellHeight}px`
  }

  const resetWarrantyForm = () => {
    setWarrantyReason('')
    setWarrantyDiagnosis('')
    setWarrantyCovered(true)
    setRequiresBudget(false)
    setShowWarrantyForm(false)
  }

  const handleStartWarranty = async () => {

    if (!warrantyModal?._id) return

    try {

      setLoadingWarranty(true)

      const res = await axios.post(
        `${getApiUrl()}/api/service/${warrantyModal._id}/warranty`,
        {
          reason: warrantyReason,
          diagnosis: warrantyDiagnosis,
          isCovered: warrantyCovered,
          requiresNewBudget: requiresBudget
        },
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`
          },
          withCredentials: true
        }
      )

      setServices(prev =>
        prev.map(s =>
          s._id === warrantyModal._id
            ? { ...s, ...res.data }
            : s
        )
      )

      // LIMPIAR FORM
      resetWarrantyForm()
      // CERRAR MODAL
      setWarrantyModal(null)

    } catch (err) {

      alert(
        err.response?.data?.error ||
        'Error iniciando garantía'
      )

    } finally {
      setLoadingWarranty(false)
    }
  }

// ========================== HANDLERS ==========================

  // === Persistencia de filtros, búsqueda y paginación ===
  useEffect(() => {
    // Cargar estado guardado antes de todo
    const savedState = localStorage.getItem('serviciosState')
    const params = new URLSearchParams(location.search)
    const urlStatus = params.get('status')
    const urlScope = params.get('scope')
    const urlWorkOrderStatus = params.get('workOrderStatus')

    if (savedState && !urlStatus && !urlScope && !urlWorkOrderStatus) {
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
    if (urlStatus || ['active', 'ready'].includes(urlScope) || urlWorkOrderStatus) {
      setFilters(prev => ({
        ...prev,
        status: urlStatus || '',
        scope: urlScope || '',
        workOrderStatus: urlWorkOrderStatus || ''
      }))
    }
    setIsStateLoaded(true) // marcamos que ya cargamos el estado
  }, [location.search])

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
        <div className="services-page-heading">
          <span>Gestion operativa</span>
          <h2 className="dashboard-title">Panel de servicios tecnicos</h2>
        </div>

        {loading ? (
          <div className="loading-container"><Loading /></div>
        ) : (
          <>
            {error && <p className="error-message">{error}</p>}

            <ServiceFilters
              services={services}
              filters={filters}
              search={search}
              onSearchChange={(value) => {
                setSearch(value)
                setCurrentPage(1)
              }}
              onSearchClear={() => {
                setSearch('')
                setCurrentPage(1)
              }}
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

            <ServicePreviewPanel service={selectedService} />

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
                    return (
                      <tr
                        key={s._id}
                        className={selectedServiceId === s._id ? 'selected-service-row' : ''}
                        onClick={() => setSelectedServiceId(s._id)}
                      >
                      <td><Link to={`/servicios/${s.code}`} className="service-link" onClick={(event) => event.stopPropagation()}>{s.code}</Link></td>
                      <td>
                        <Link to={`/clientes/${s.customerNumber}`} className="service-link" onClick={(event) => event.stopPropagation()}>
                          {s.customerNumber}
                        </Link>
                      </td>
                      <td>{formatDate(s.createdAt)}</td>
                      <td className="col-device">{s.equipmentType || '—'}</td>
                      <td>{s.description || '—'}</td>
                      <td>{s.userData ? `${s.userData.firstName} ${s.userData.lastName}` : '—'}</td>
                      <td>
                        <div onClick={(event) => event.stopPropagation()}>
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
                        </div>
                      </td>
                      <td className="workorder-cell">
                        <div onClick={(event) => event.stopPropagation()}>
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
                        </div>
                      </td>
                      <td>
                        <textarea
                          className="notes-textarea auto-resize"
                          defaultValue={s.notes || ''}
                          ref={el => el && resizeToCellHeight(el)}
                          onKeyDown={(e) => handleNoteKeyDown(s, e)}
                          onClick={(event) => event.stopPropagation()}
                        />
                      </td>
                      <td className="col-received">
                        {s.receivedAt ? (s.receivedAtBranch || 'Quilmes') : 'No recibido'}
                      </td>
                      <td className="col-created">{s.createdByEmail || '—'}</td>
                      <td className="acciones-cell">
                        <div className="actions-group">
                        <Link to={`/servicios/${s.code}/editar`} className="action-btn edit" title="Editar" onClick={(event) => event.stopPropagation()}>
                          <FontAwesomeIcon icon={faPen} />
                        </Link>

                        <a
                          href={`/ticket/${s.publicId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="action-btn print"
                          title="Imprimir"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <FontAwesomeIcon icon={faPrint} />
                        </a>
                        <a
                          href={`/orden/${s.publicId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="action-btn orden"
                          title="Ver Orden de Trabajo"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <FontAwesomeIcon icon={faFileLines} />
                        </a>

                        {/* INICIAR GARANTÍA */}
                          {canStartWarranty(s) && (
                            <button
                              className="action-btn warranty"
                              title="Iniciar garantía"
                              onClick={(event) => {
                                event.stopPropagation()
                                setWarrantyModal(s)
                                setShowWarrantyForm(false)
                              }}
                            >
                              🛡
                            </button>
                          )}

                          {/* GARANTÍA EN CURSO */}
                          {hasActiveWarranty(s) && isWarrantyStatus(s.status) && (
                            <button
                              className="action-btn warranty active"
                              title="Garantía en curso"
                              onClick={(event) => event.stopPropagation()}
                            >
                              🛡️
                            </button>
                          )}

                        {s.userData?.phone && (
                          <a
                            href={`https://wa.me/54${String(s.userData.phone).replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="action-btn wa"
                            title="WhatsApp"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <FontAwesomeIcon icon={faWhatsapp} />
                          </a>
                        )}
                        </div>
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
      {warrantyModal && (
        <Modal
          title={
            !showWarrantyForm
              ? 'Revisión de garantía'
              : 'Ingreso de garantía'
          }
          onClose={() => {
            setWarrantyModal(null)
            resetWarrantyForm()
          }}
        >

          <div className="warranty-modal">

            {!showWarrantyForm ? (

              <>
                {/* HEADER */}
                <div className="warranty-header">

                  <div>

                    <h2 className="warranty-code">
                      {warrantyModal.code}
                    </h2>

                    <p className="warranty-device">
                      {warrantyModal.equipmentType} • {warrantyModal.brand} {warrantyModal.model}
                    </p>

                  </div>

                  <div className="warranty-status">
                    {warrantyModal.status}
                  </div>

                </div>

                {/* ALERTAS */}
                <div className="warranty-alerts">

                  <div className="warranty-alert-card">

                    <span>Entregado hace</span>

                    <strong>
                      {warrantyModal.deliveredAt
                        ? timeSince(warrantyModal.deliveredAt)
                        : 'Sin entregar'}
                    </strong>

                  </div>

                  <div className="warranty-alert-card">

                    <span>Total abonado</span>

                    <strong>
                      ${warrantyModal.finalValue || 0}
                    </strong>

                  </div>

                  <div className="warranty-alert-card">

                    <span>Garantía hasta</span>

                    <strong>
                      {warrantyModal.warrantyUntil
                        ? formatDate(warrantyModal.warrantyUntil)
                        : 'No definida'}
                    </strong>

                  </div>

                </div>

                {/* CLIENTE */}
                <div className="warranty-section">

                  <h4>Cliente</h4>

                  <p className="warranty-client-name">
                    {warrantyModal.userData?.firstName} {warrantyModal.userData?.lastName}
                  </p>

                  <p>
                    {warrantyModal.userData?.phone || 'Sin teléfono'}
                  </p>

                </div>

                {/* INGRESO ORIGINAL */}
                <div className="warranty-section">

                  <h4>Problema informado originalmente</h4>

                  <p>
                    {warrantyModal.userDescription || '—'}
                  </p>

                </div>

                {/* DIAGNOSTICO */}
                <div className="warranty-section">

                  <h4>Diagnóstico técnico previo</h4>

                  <p>
                    {warrantyModal.diagnosticoTecnico || '—'}
                  </p>

                </div>

                {/* NOTAS */}
                {!!warrantyModal.notes && (
                  <div className="warranty-section">

                    <h4>Notas internas</h4>

                    <p>
                      {warrantyModal.notes}
                    </p>

                  </div>
                )}

                {/* FOOTER */}
                <div className="checklist-actions">

                  <button
                    className="btn-cancelar"
                    onClick={() => {
                      setWarrantyModal(null)
                      setShowWarrantyForm(false)
                    }}
                  >
                    Cancelar
                  </button>

                  <button
                    className="btn-submit"
                    onClick={() => setShowWarrantyForm(true)}
                  >
                    Continuar
                  </button>

                </div>
              </>

            ) : (

              <>
                {/* FORM */}
                <div className="warranty-section">
                  <h4>Ingreso de garantía</h4>
                  <div className="form-group">
                    <label>
                      Motivo de la garantía *
                    </label>
                    <textarea
                      value={warrantyReason}
                      onChange={(e) => setWarrantyReason(e.target.value)}
                      placeholder="Ej: vuelve sin calentar, pierde agua, no enciende..."
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      Diagnóstico inicial
                    </label>
                    <textarea
                      value={warrantyDiagnosis}
                      onChange={(e) => setWarrantyDiagnosis(e.target.value)}
                      placeholder="Observaciones técnicas iniciales..."
                    />
                  </div>
                  <div className="warranty-options">
                    <button
                      type="button"
                      className={`warranty-option ${warrantyCovered ? 'active' : ''}`}
                      onClick={() => setWarrantyCovered(prev => !prev)}
                    >

                      <div className="warranty-option-check">
                        {warrantyCovered && '✓'}
                      </div>

                      <div className="warranty-option-content">

                        <strong>
                          Cubierto por garantía
                        </strong>

                        <span>
                          La reparación entra dentro de la cobertura original.
                        </span>

                      </div>

                    </button>

                    <button
                      type="button"
                      className={`warranty-option ${requiresBudget ? 'active' : ''}`}
                      onClick={() => setRequiresBudget(prev => !prev)}
                    >

                      <div className="warranty-option-check">
                        {requiresBudget && '✓'}
                      </div>

                      <div className="warranty-option-content">

                        <strong>
                          Requiere nuevo presupuesto
                        </strong>

                        <span>
                          Se debe aprobar un nuevo costo antes de continuar.
                        </span>

                      </div>

                    </button>

                  </div>
                </div>
                {/* ACTIONS */}
                <div className="checklist-actions">
                  <button
                    className="btn-cancelar"
                    onClick={() => setShowWarrantyForm(false)}
                  >
                    Volver
                  </button>

                  <button
                    className="btn-submit"
                    onClick={handleStartWarranty}
                    disabled={
                      loadingWarranty ||
                      !warrantyReason.trim()
                    }
                  >
                    {loadingWarranty
                      ? 'Ingresando...'
                      : 'Ingresar garantía'}
                  </button>

                </div>
              </>
            )}

          </div>

        </Modal>
      )}
    </DashboardLayout>
  )
}

export default Servicios

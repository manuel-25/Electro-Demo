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
import { getStatusClass, canStartWarranty, hasActiveWarranty, isWarrantyStatus } from '../../utils/serviceStatusUtils.js'
import WorkOrderControl from '../WorkOrderControl/WorkOrderControl.jsx'
import Modal from '../Modal/Modal.jsx'
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
  const [warrantyModal, setWarrantyModal] = useState(null)
  const [loadingWarranty, setLoadingWarranty] = useState(false)
  const [warrantyReason, setWarrantyReason] = useState('')
  const [warrantyDiagnosis, setWarrantyDiagnosis] = useState('')
  const [warrantyCovered, setWarrantyCovered] = useState(true)
  const [requiresBudget, setRequiresBudget] = useState(false)
  const [showWarrantyForm, setShowWarrantyForm] = useState(false)

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
                      <td>{s.userData ? `${s.userData.firstName} ${s.userData.lastName}` : '—'}</td>
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
                      <td>
                        <textarea
                          className="notes-textarea auto-resize"
                          defaultValue={s.notes || ''}
                          ref={el => el && resizeToCellHeight(el)}
                          onKeyDown={(e) => handleNoteKeyDown(s, e)}
                        />
                      </td>
                      <td className="col-received">
                        {s.receivedAt ? (s.receivedAtBranch || 'Quilmes') : 'No recibido'}
                      </td>
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

                        {/* INICIAR GARANTÍA */}
                          {canStartWarranty(s) && (
                            <button
                              className="action-btn warranty"
                              title="Iniciar garantía"
                              onClick={() => {
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

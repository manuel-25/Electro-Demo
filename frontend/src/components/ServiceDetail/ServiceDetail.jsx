import React, { useEffect, useState, useContext, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import DashboardLayout from '../DashboardLayout/DashboardLayout'
import { AuthContext } from '../../Context/AuthContext'
import { getApiUrl } from '../../config'
import { getStatusClass, normalizeStatus, getStatusLabel } from '../../utils/serviceStatusUtils.js'
import ServiceStatusControl from '../ServiceStatusControl/ServiceStatusControl.jsx'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faPrint } from '@fortawesome/free-solid-svg-icons'
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons'
import { formatCurrency } from '../../utils/currency.js'
import { formatDate } from '../../utils/formatDate.js'
import { ESTADOS_SERVICIO } from '../../utils/productsData.jsx'
import WorkOrderControl from '../WorkOrderControl/WorkOrderControl.jsx'
import './ServiceDetail.css'

const Item = ({ label, value }) => (
  <div className="item">
    <span className="item-label">{label}</span>
    <span className="item-value">{value ?? '—'}</span>
  </div>
)

const Toast = ({ type = 'error', message, onClose }) => {
  if (!message) return null
  return (
    <div className={`toast toast-${type}`}>
      <span>{message}</span>
      <button className="toast-close" onClick={onClose}>×</button>
    </div>
  )
}

const getApiError = (err) => {
  if (err?.response) {
    const msg = err.response.data?.error || err.response.data?.message
    if (err.response.status === 401) return msg || 'Tu sesión expiró. Iniciá sesión nuevamente.'
    if (err.response.status === 403) return msg || 'No tenés permisos para realizar esta acción.'
    return msg || `Error ${err.response.status} al procesar la solicitud.`
  }
  if (err?.request) return 'No pudimos contactar el servidor. Verificá tu conexión.'
  return 'Ocurrió un error inesperado.'
}

const StatusPill = ({ status }) => {
  const cls = getStatusClass(status)
  const label = getStatusLabel(status)
  return <span className={`status-pill ${cls}`}>{label}</span>
}


const addDays = (date, days) => {
  if (!date || days == null) return null
  const d = new Date(date)
  d.setDate(d.getDate() + Number(days))
  return d
}

const ServiceDetail = () => {
  const { auth } = useContext(AuthContext)
  const { code } = useParams()
  const [service, setService] = useState(null)
  const [error, setError] = useState(null)
  const [notesText, setNotesText] = useState('')
  const [toast, setToast] = useState({ type: 'error', message: '' })

  const navigate = useNavigate()

  const showToast = (message, type = 'error') => setToast({ message, type })
  const clearToast = () => setToast({ type: 'error', message: '' })

  const fetchService = async () => {
    try {
      const { data } = await axios.get(
        `${getApiUrl()}/api/service/code/${code}`,
        { headers: { Authorization: `Bearer ${auth?.token}` }, withCredentials: true }
      )
      setService(data)
      setNotesText(data?.notes || '')
    } catch (err) {
      setError('Error al obtener el servicio')
      showToast(getApiError(err))
    }
  }

  useEffect(() => {
    if (code) fetchService()
  }, [code])

  const history = useMemo(() => {
    if (!service) return []
    const isFilled = (v) => v != null && String(v).trim().toLowerCase() && String(v).trim().toLowerCase() !== 'no recibido'
    let list = [...(service.statusHistory ?? [])]
    const isReceived = isFilled(service.receivedBy) || isFilled(service.receivedAt)
    if (!isReceived) {
      list = list.filter(ev => normalizeStatus(ev.status) !== 'recibido')
    }
    list.sort((a, b) => new Date(a.changedAt) - new Date(b.changedAt))
    const dedup = []
    for (const ev of list) {
      const last = dedup[dedup.length - 1]
      if (!last || normalizeStatus(last.status) !== normalizeStatus(ev.status) || ev.note) {
        dedup.push(ev)
      }
    }
    const createdAt = service.createdAt
    const createdBy = service.createdByEmail || service.createdBy
    const hasPending = list.some(x => normalizeStatus(x.status) === 'pendiente')
    if (createdAt && createdBy && !hasPending) {
      dedup.unshift({
        changedAt: createdAt,
        status: 'Pendiente',
        changedBy: createdBy,
        _createdEntry: true
      })
    }
    return dedup
  }, [service])

  const handleNoteKeyDown = async (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      try {
        const res = await axios.put(
          `${getApiUrl()}/api/service/${service._id}/status`,
          {
            status: service.status,
            note: notesText
          },
          {
            headers: { Authorization: `Bearer ${auth?.token}` },
            withCredentials: true
          }
        )
        setService(res.data)
        showToast('Nota guardada y registrada en historial.', 'success')
      } catch (err) {
        showToast(getApiError(err), 'error')
      }
    }
  }

  if (error) return <DashboardLayout><p className="error-message">{error}</p></DashboardLayout>
  if (!service) return <DashboardLayout><p className="loading-message">Cargando...</p></DashboardLayout>

  const warrantyBase = service.deliveredAt || service.receivedAt || service.createdAt
  const warrantyEnds = addDays(warrantyBase, service.warrantyExpiration)

  return (
    <DashboardLayout>
      <Toast type={toast.type} message={toast.message} onClose={clearToast} />
      <div className="detail-container">
        <button className="back-button-pro" onClick={() => navigate(-1)}>← Volver</button>
        <h2 className="title">🔍 Detalle del Servicio: {service.code}</h2>

        {/* acciones */}
        <div className="actions">
          <Link to={`/servicios/${service.code}/editar`} className="action-btn big-btn edit" title="Editar">
            <FontAwesomeIcon icon={faPen} />
          </Link>
          <a href={`/ticket/${service.publicId}`} target="_blank" rel="noopener noreferrer" className="action-btn big-btn print" title="Imprimir">
            <FontAwesomeIcon icon={faPrint} />
          </a>
          <a href={`https://wa.me/54${String(service.userData.phone).replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="action-btn big-btn wa" title="WhatsApp">
            <FontAwesomeIcon icon={faWhatsapp} />
          </a>
        </div>

        {/* bloques de info */}
        <div className="info-group">
          {/* Cliente */}
          <div className="info-column">
            <h3>Cliente</h3>
            <Item label="Cliente #" value={<Link to={`/clientes/${service.customerNumber}`} className="service-link">{service.customerNumber}</Link>} />
            <Item label="Nombre" value={`${service.userData?.firstName ?? ''} ${service.userData?.lastName ?? ''}`.trim() || '—'} />
            <Item label="Email" value={service.userData?.email} />
            <Item label="Teléfono" value={service.userData?.phone} />
            <Item label="Dirección" value={service.userData?.domicilio} />
            <Item label="Provincia / Municipio" value={[service.userData?.province, service.userData?.municipio].filter(Boolean).join(' / ') || '—'} />
          </div>

          {/* Equipo */}
          <div className="info-column">
            <h3>Equipo</h3>
            <Item label="Tipo" value={service.equipmentType} />
            <Item label="Marca" value={service.brand} />
            <Item label="Modelo" value={service.model} />
            <Item label="Servicio" value={service.serviceType} />
            <Item label="Descripción" value={service.description} />
          </div>

          {/* Costos */}
          <div className="info-column">
            <h3>Costos</h3>

            <Item
              label="Ref. Cotización"
              value={
                service.quoteReference ? (
                  <Link
                    to={`/cotizaciones/${service.quoteReference}`}
                    className="service-link strong-link"
                  >
                    #{service.quoteReference}
                  </Link>
                ) : (
                  '—'
                )
              }
            />

            <Item
              label="Valor Aproximado"
              value={service.approximateValue || '—'}
            />

            <Item
              label="Valor Final"
              value={<span className="strong">{formatCurrency(service.finalValue)}</span>}
            />

            {service.budgetItems?.length > 0 && (
              <div className="budget-items">
                <h4>Presupuesto Desglosado</h4>
                <table className="budget-table">
                  <thead>
                    <tr>
                      <th>Cant.</th>
                      <th>Descripción</th>
                      <th>Precio Unitario</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {service.budgetItems.map((item, index) => (
                      <tr key={index}>
                        <td>{item.cantidad}</td>
                        <td>{item.descripcion}</td>
                        <td>{formatCurrency(item.precioUnitario)}</td>
                        <td>{formatCurrency(item.cantidad * item.precioUnitario)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          {/* Estado */}
          <div className="info-column">
            <h3>Estado</h3>
            <Item label="Estado Actual" value={<StatusPill status={service.status} />} />
            <Item label="Actualizar estado" value={
              <ServiceStatusControl
                service={service}
                token={auth?.token}
                userEmail={auth?.user?.email}
                userBranch={auth?.user?.branch}
                note={notesText}
                estados={ESTADOS_SERVICIO}
                onUpdated={(updatedService) => {
                  setService(updatedService)
                  showToast('Estado actualizado correctamente.', 'success')
                }}
                onError={(err) => showToast(getApiError(err), 'error')}
              />
            } />
            <Item label="Recibido por" value={service.receivedBy || '—'} />
            <Item label="Modificado por" value={service.lastModifiedBy || '—'} />
            <Item label="Última modificación" value={formatDate(service.lastModifiedAt, true)} />
          </div>

          {/*  Orden de Trabajo */}
          <div className="info-column">
            <h3>Orden de Trabajo</h3>

            <Item
              label="Estado OT"
              value={
                <WorkOrderControl
                  service={service}
                  onUpdate={(updatedService) => {
                    setService(updatedService)
                    showToast('Orden de trabajo actualizada.', 'success')
                  }}
                />
              }
            />

            <Item
              label="Enviado el"
              value={formatDate(service.workOrderSentAt, true)}
            />

            <Item
              label="Enviado por"
              value={service.workOrderSentBy || '—'}
            />

            <Item
              label="Respondido el"
              value={formatDate(service.workOrderAnsweredAt, true)}
            />

            <Item
              label="Respondido por"
              value={service.workOrderAnsweredBy || '—'}
            />
          </div>
        </div>

        {/* Recepción, Entrega, Garantía, Metadatos */}
        <div className="info-group">
          <div className="info-column">
  <h3>Checklist de Recepción</h3>

  <Item
    label="¿Reparado previamente?"
    value={
      service.receptionChecklist?.wasRepairedBefore === true ? '✅ Sí'
        : service.receptionChecklist?.wasRepairedBefore === false ? '❌ No'
          : '—'
    }
  />

  <Item
    label="¿Equipo limpio?"
    value={
      service.receptionChecklist?.isClean === true ? '✅ Sí'
        : service.receptionChecklist?.isClean === false ? '❌ No'
          : '—'
    }
  />

  <Item
    label="¿Tiene accesorios?"
    value={
      service.receptionChecklist?.hasAccessories === true ? '✅ Sí'
        : service.receptionChecklist?.hasAccessories === false ? '❌ No'
          : '—'
    }
  />

  {service.receptionChecklist?.accessories?.length > 0 && (
    <Item
      label="Accesorios"
      value={
        service.receptionChecklist.accessories
          .map(a => a.label)
          .join(', ')
      }
    />
  )}

  <Item
    label="Completado por"
    value={service.receptionChecklist?.completedBy || '—'}
  />

  <Item
    label="Fecha"
    value={formatDate(service.receptionChecklist?.completedAt, true)}
  />
</div>
          <div className="info-column">
            <h3>Recepción</h3>
            <Item label="Fecha de recepción" value={formatDate(service.receivedAt, true)} />
            <Item label="Codigo" value={service.code || '—'} />
            <Item label="Sucursal" value={service.receivedAtBranch || '—'} />
            <Item label="Método de entrega" value={service.deliveryMethod || '—'} />
            {service.receivedNotes ? <Item label="Notas de recepción" value={service.receivedNotes} /> : null}
          </div>

          <div className="info-column">
            <h3>Entrega</h3>
            <Item label="Entregado el" value={formatDate(service.deliveredAt, true)} />
            <Item label="Solicitar Calificación en Google" value={
              service.isSatisfied === true ? '✅ Si'
                : service.isSatisfied === false ? '❌ No recomendado'
                  : '—'
            } />
          </div>

          <div className="info-column">
            <h3>Garantía</h3>
            <Item label="Días de garantía" value={service.warrantyExpiration ?? '—'} />
            <Item label="Desde" value={formatDate(warrantyBase)} />
            <Item label="Hasta" value={formatDate(warrantyEnds)} />
          </div>

          <div className="info-column">
            <h3>Metadatos</h3>
            <Item label="Creado por" value={service.createdByEmail || service.createdBy || '—'} />
            <Item label="Fecha de creación" value={formatDate(service.createdAt, true)} />
            <Item label="Última actualización" value={formatDate(service.updatedAt, true)} />
            <Item
              label="ID público"
              value={
                service.publicId ? (
                  <strong
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigator.clipboard.writeText(service.publicId)}
                    title="Click para copiar"
                  >
                    {service.publicId}
                  </strong>
                ) : '—'
              }
            />
          </div>
        </div>

        {/* Notas */}
        <div className="section">
          <h3>Notas del Técnico (Uso Interno)</h3>
          <textarea
            className="notes-textarea"
            value={notesText}
            onChange={(e) => setNotesText(e.target.value)}
            onKeyDown={handleNoteKeyDown}
            placeholder="Escribí y presioná Enter para guardar (Shift+Enter para salto de línea)"
          />
        </div>

        {/* Historial */}
        <div className="section">
          <h3>Historial de Estado</h3>
          <div className="historial-container">
            <ul className="history-list">
              {history.map((h, i) => {
                const prev = history[i - 1]
                const showNote = h.note && (!prev || h.note !== prev.note)

                return (
                  <li key={i} className="history-item">
                    <div className="history-main">
                      <span className="history-date">{formatDate(h.changedAt, true)}</span>
                      <span className={`status-pill ${getStatusClass(h.status)}`}>
                        {getStatusLabel(h.status)}
                      </span>
                      <span className="history-by">({h.changedBy})</span>
                    </div>

                    {showNote && (
                      <p className="history-note">
                        📝 <em>{h.note}</em>
                      </p>
                    )}

                    {h.receivedBy && <p className="history-note">👤 Recibido por: {h.receivedBy}</p>}
                    {h.receivedAtBranch && <p className="history-note">🏢 Sucursal: {h.receivedAtBranch}</p>}
                    {h.deliveredAt && <p className="history-note">📦 Entregado: {formatDate(h.deliveredAt, true)}</p>}
                    {typeof h.isSatisfied === 'boolean' && (
                      <p className="history-note">⭐ Cliente satisfecho: {h.isSatisfied ? 'Sí ✅' : 'No ❌'}</p>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default ServiceDetail

import React, { useState } from 'react'
import { normalizeStatus } from '../../utils/serviceStatusUtils.js'
import { equipmentAccessories, ESTADOS_SERVICIO } from '../../utils/productsData.jsx'
import { updateServiceStatus } from '../../utils/updateServiceStatus.js'
import StatusModal from '../StatusModal/StatusModal.jsx'
import Modal from '../Modal/Modal.jsx'
import './ServiceStatusControl.css'
import { logError } from '../../utils/logger.js'
import { getSinRespuestaInfo } from '../../utils/sinRespuestaHelper.js'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons'

// Define los estados que salen en el select 
const getAvailableStatuses = (service) => {
  if (!service) return []

  if (service.flowVersion !== 2) {
    return ESTADOS_SERVICIO.map(e => e.value)
  }

  const status = service.status || 'Pendiente'
  let baseStatuses = []

  switch (status) {
    case 'En Gestión':
      baseStatuses = ['En Gestión']
      break
    case 'Reparación':
      baseStatuses = ['Reparación', 'Listo para retirar']
      break
    case 'Armado S/R':
      baseStatuses = ['Armado S/R', 'Listo para retiro S/R']
      break
    case 'Listo para retirar':
      baseStatuses = ['Listo para retirar', 'Entregado']
      break
    case 'Listo para retiro S/R':
      baseStatuses = ['Listo para retiro S/R', 'Entregado S/R']
      break
    case 'Pendiente':
      baseStatuses = ['Pendiente', 'Recibido']
      break
    case 'Recibido':
      baseStatuses = ['Recibido', 'En Gestión']
      break
    case 'Sin respuesta':
      baseStatuses = ['Sin respuesta', 'Retirado a bodega']
      break
      case 'En Gestión Garantía':
      baseStatuses = ['En Gestión Garantía', 'Reparación Garantía']
      break

    case 'Reparación Garantía':
      baseStatuses = ['Reparación Garantía', 'Listo para retirar Garantía']
      break

    case 'Listo para retirar Garantía':
      baseStatuses = ['Listo para retirar Garantía', 'Entregado']
      break
    default:
      baseStatuses = [status]
      break
  }

  if (
    !['Entregado', 'Entregado S/R', 'Sin respuesta', 'Retirado a bodega', 'Pendiente'].includes(status)
  ) {
    baseStatuses.push('Sin respuesta')
  }

  return [...new Set(baseStatuses)]
}

export const getNextActions = (service) => {
  if (!service) return []

  const actions = []

  switch (service.status) {
    case 'Pendiente':
      actions.push({ label: 'Recibir', action: 'Recibido' })
      break
    case 'Recibido':
      actions.push({ label: 'En Gestión', action: 'En Gestión' })
      break
    case 'Reparación':
      actions.push({ label: 'Listo para retirar', action: 'Listo para retirar' })
      break
    case 'Armado S/R':
      actions.push({ label: 'Listo para retiro S/R', action: 'Listo para retiro S/R' })
      break
    case 'Listo para retirar':
      actions.push({ label: 'Entregar', action: 'Entregado' })
      break
    case 'Listo para retiro S/R':
      actions.push({ label: 'Entregar S/R', action: 'Entregado S/R' })
      break
    default:
      break
  }

  if (!['Entregado', 'Entregado S/R'].includes(service.status)) {
    actions.push({ label: 'A bodega', action: 'Retirado a bodega' })
    actions.push({ label: 'Sin respuesta', action: 'Sin respuesta' })
  }

  return actions
}

export default function ServiceStatusControl({
  service,
  token,
  userEmail,
  userBranch,
  note = '',
  disabled = false,
  onUpdated = () => {},
  onError = () => {},
  onChecklistComplete = () => {},
  className = '',
  branches = ['Quilmes'],
  onClose,
}) {

  const [saving, setSaving] = useState(false)
  const [modalType, setModalType] = useState(null)
  const [nextStatus, setNextStatus] = useState(null)
  const [formData, setFormData] = useState({
    reparacion: '',
    higienizado: '',
    poseeAccesorios: '',
    accessories: [],
    otroAccesorio: ''
  })
  const isCreateMode = !service?._id
  const [modalVisible, setModalVisible] = useState(isCreateMode)
  const [deliveryModalVisible, setDeliveryModalVisible] = useState(false)
  const [deliveryData, setDeliveryData] = useState(null)
  const [sinRespuestaModal, setSinRespuestaModal] = useState(null)
  const [bodegaModal, setBodegaModal] = useState(false)

  const validateChecklist = () => {
    const { reparacion, higienizado, poseeAccesorios, accessories, otroAccesorio } = formData

    if (!reparacion || !higienizado || !poseeAccesorios) {
      return 'Debes completar todas las preguntas obligatorias.'
    }

    if (poseeAccesorios === 'Sí' && accessories.length === 0 && !otroAccesorio) {
      return 'Debes seleccionar al menos un accesorio o completar "Otro".'
    }

    return null
  }

  const buildChecklistPayload = () => {
    return {
      wasRepairedBefore: formData.reparacion === 'Sí',
      isClean: formData.higienizado === 'Sí',
      hasAccessories: formData.poseeAccesorios === 'Sí',

      accessories: [
        // accesorios seleccionados del checklist
        ...formData.accessories.map(acc => ({
          name: acc,
          label: acc
        })),

        // "Otro accesorio" como item real del array
        ...(formData.otroAccesorio
          ? [{
              name: formData.otroAccesorio,
              label: formData.otroAccesorio
            }]
          : [])
      ],

      accessoriesNotes: formData.otroAccesorio || '',

      completedAt: new Date(),
      completedBy: userEmail
    }
  }

  const resetForm = () => {
    setFormData({
      reparacion: '',
      higienizado: '',
      poseeAccesorios: '',
      accessories: [],
      otroAccesorio: ''
    })
  }

  const persist = async (params) => {
    setSaving(true)

    try {
      const updated = await updateServiceStatus(params)
      onUpdated(updated)

    } catch (e) {
      const errorMsg = e.response?.data?.error || e.message

      // 🟡 ERROR ESPERADO → NO MAIL
      if (errorMsg === 'Debe completar el checklist') {

        setNextStatus('En Gestión')
        setModalVisible(true)
        return
      }

      // 🔴 ERROR REAL → MAIL
      logError('Error persistiendo estado de servicio', 'error', {
        serviceId: service?._id,
        from: service?.status,
        to: params?.newStatus,
        error: errorMsg,
        user: userEmail
      })

      onError(e)

    } finally {
      setSaving(false)
    }
  }

  const onChange = (value) => {
    if (!service?._id || saving) return

    // 🔴 SIN RESPUESTA
    if (value === 'Sin respuesta') {
      const info = getSinRespuestaInfo(service)

      setSinRespuestaModal({
        ...info,
        nextStatus: value
      })

      return
    }

    // 🟡 BODEGA
    if (value === 'Retirado a bodega') {
      setBodegaModal(true)
      return
    }

    // Mostrar modal de recepción al pasar Pendiente → Recibido
    if (service.status === 'Pendiente' && value === 'Recibido') {
      setNextStatus(value)
      setModalVisible(true)
      return
    }

    // Modal de satisfacción para entrega
    const isDeliveryStatus =
    value === 'Listo para retirar' ||
    value === 'Listo para retiro S/R' ||
    value === 'Listo para retirar Garantía'

    if (isDeliveryStatus) {
      setDeliveryData({
        newStatus: value,
        checklist: service.receptionChecklist // o donde lo guardes
      })
      setDeliveryModalVisible(true)
      return
    }

    // Cambios simples, sin modal
    // SOLO persistir si NO es Recibido
    if (!(service.status === 'Pendiente' && value === 'Recibido')) {
      persist({
        service,
        newStatus: value,
        token,
        note,
        userEmail
      })
    }
  }

  const handleAccessoryChange = (name, checked) => {
    setFormData(prev => {
      let updatedAccessories = [...prev.accessories]
      if (checked) {
        if (!updatedAccessories.includes(name)) updatedAccessories.push(name)
      } else {
        updatedAccessories = updatedAccessories.filter(a => a !== name)
      }
      return { ...prev, accessories: updatedAccessories }
    })
  }

  const handleModalSubmit = async () => {
    const error = validateChecklist()
    if (error) {
      alert(error)
      return
    }

    const checklist = buildChecklistPayload()

    // 🟢 CREATE MODE
    if (isCreateMode) {
      onChecklistComplete(checklist)
      setModalVisible(false)
      resetForm()
      return
    }

    // 🔵 UPDATE MODE (tu lógica original)
    if (!nextStatus) {
      console.error('No hay nextStatus definido')
      return
    }

    try {
      await persist({
        service,
        newStatus: nextStatus,
        token,
        note,
        userEmail,
        receivedAtBranch: userBranch || null,
        receptionChecklist: checklist
      })

      setModalVisible(false)
      setNextStatus(null)
      resetForm()

    } catch (err) {
      console.error('Error guardando checklist:', err)
    }
  }

  const key = normalizeStatus(service?.status || '')
  const currentEquipment = equipmentAccessories.find(
    eq => eq.name === service?.equipmentType
  )
  const availableAccessories = currentEquipment?.accessories || []

  return (
    <>
      {!isCreateMode && (
        <select
          className={`status-select cell-${key} ${className}`}
          value={service?.status || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || saving}
        >
          {getAvailableStatuses(service).map(value => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      )}

      {saving && <small style={{ marginLeft: 8 }}>Guardando…</small>}

      {/* Modal de recepción con checklist */}
      {modalVisible && (
        <Modal
          title="Recepción del electrodoméstico"
          onClose={() => {
            setModalVisible(false)
            onClose?.()
          }}
        >
          <div className="checklist-modal">

            {/* PREGUNTA 1 */}
            <div className="checklist-group">
              <p>¿El electrodoméstico fue sometido alguna vez a reparación?</p>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name="reparacion"
                    value="Sí"
                    checked={formData.reparacion === 'Sí'}
                    onChange={(e) =>
                      setFormData(prev => ({ ...prev, reparacion: e.target.value }))
                    }
                  />
                  <span>Sí</span>
                </label>

                <label>
                  <input
                    type="radio"
                    name="reparacion"
                    value="No"
                    checked={formData.reparacion === 'No'}
                    onChange={(e) =>
                      setFormData(prev => ({ ...prev, reparacion: e.target.value }))
                    }
                  />
                  <span>No</span>
                </label>
              </div>
            </div>

            {/* PREGUNTA 2 */}
            <div className="checklist-group">
              <p>¿Al momento de recepción se encuentra higienizado?</p>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name="higienizado"
                    value="Sí"
                    checked={formData.higienizado === 'Sí'}
                    onChange={(e) =>
                      setFormData(prev => ({ ...prev, higienizado: e.target.value }))
                    }
                  />
                  <span>Sí</span>
                </label>

                <label>
                  <input
                    type="radio"
                    name="higienizado"
                    value="No"
                    checked={formData.higienizado === 'No'}
                    onChange={(e) =>
                      setFormData(prev => ({ ...prev, higienizado: e.target.value }))
                    }
                  />
                  <span>No</span>
                </label>
              </div>
            </div>

            {/* PREGUNTA 3 */}
            <div className="checklist-group">
              <p>¿Al momento de ingreso posee accesorios?</p>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name="poseeAccesorios"
                    value="Sí"
                    checked={formData.poseeAccesorios === 'Sí'}
                    onChange={(e) => {
                      const value = e.target.value
                      setFormData(prev => ({
                        ...prev,
                        poseeAccesorios: value,
                        accessories: value === 'No' ? [] : prev.accessories,
                        otroAccesorio: value === 'No' ? '' : prev.otroAccesorio
                      }))
                    }}
                  />
                  <span>Sí</span>
                </label>

                <label>
                  <input
                    type="radio"
                    name="poseeAccesorios"
                    value="No"
                    checked={formData.poseeAccesorios === 'No'}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        poseeAccesorios: 'No',
                        accessories: [],
                        otroAccesorio: ''
                      }))
                    }}
                  />
                  <span>No</span>
                </label>
              </div>
            </div>

            {/* ACCESORIOS */}
            {formData.poseeAccesorios === 'Sí' && (
              <div className="checklist-group">
                <div className="accessories-box">

                  <div className="accessories-title">
                    Accesorios presentes
                  </div>

                  <div className="accessories-subtitle">
                    Equipo: {service?.equipmentType || 'No especificado'}
                  </div>

                  {availableAccessories.length > 0 && (
                    <div className="checkbox-grid">
                      {availableAccessories.map(acc => (
                        <label key={acc} className="checkbox-item">
                          <input
                            type="checkbox"
                            checked={formData.accessories.includes(acc)}
                            onChange={(e) =>
                              handleAccessoryChange(acc, e.target.checked)
                            }
                          />
                          <span>{acc}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  <div className="otro-input">
                    <label>Otro accesorio</label>
                    <input
                      type="text"
                      placeholder="Especificar..."
                      value={formData.otroAccesorio}
                      onChange={(e) =>
                        setFormData(prev => ({
                          ...prev,
                          otroAccesorio: e.target.value
                        }))
                      }
                    />
                  </div>

                </div>
              </div>
            )}

            {/* BOTONES */}
            <div className="checklist-actions">
              <button
                className="btn-cancelar"
                onClick={() => {
                  setModalVisible(false)
                  onClose?.()
                }}
              >
                Cancelar
              </button>

              <button
                className="btn-submit"
                onClick={handleModalSubmit}
              >
                Continuar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal de satisfacción */}
      <StatusModal
        visible={!!modalType}
        type={modalType}
        onClose={() => setModalType(null)}
        branches={branches}
        selectedBranch={userBranch}
        setSelectedBranch={() => {}}
        onConfirmSatisfaction={async (yes) => {
          setModalType(null)
          await persist({
            service,
            newStatus: 'Entregado',
            token,
            note,
            isSatisfied: !!yes
          })
        }}
      />

      {/* Modal de accesorios entrega */}
      {deliveryModalVisible && (
        <Modal
          title="Preparar Equipo para Entrega"
          onClose={() => setDeliveryModalVisible(false)}
        >
          <div className="checklist-modal">

            <h4>Resumen del ingreso</h4>

            <div className="checklist-summary">

              <p>
                <strong>Ingresó higienizado:</strong>{' '}
                {service?.receptionChecklist?.isClean ? 'Sí' : 'No'}
              </p>

              <p>
                <strong>Reparado previamente:</strong>{' '}
                {service?.receptionChecklist?.wasRepairedBefore ? 'Sí' : 'No'}
              </p>

              <div className="checklist-summary-section">
                <p><strong>Accesorios:</strong></p>

                {service?.receptionChecklist?.accessories?.length > 0 ? (
                  <div className="accessories-grid">
                    {service.receptionChecklist.accessories.map((acc, i) => (
                      <div key={acc._id || i} className="accessory-badge">
                        {acc.label || acc.name}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="empty-state">Sin accesorios declarados</p>
                )}
              </div>

            </div>

            <div className="checklist-actions">
              <button
                className="btn-cancelar"
                onClick={() => setDeliveryModalVisible(false)}
              >
                Cancelar
              </button>

              <button
                className="btn-submit"
                onClick={async () => {
                  await persist({
                    service,
                    newStatus: deliveryData.newStatus,
                    token,
                    note,
                    userEmail
                  })

                  setDeliveryModalVisible(false)
                  setDeliveryData(null)
                }}
              >
                Equipo listo para entregar
              </button>
            </div>

          </div>
        </Modal>
      )}

      {/* Modal de sin respuesta */}
      {sinRespuestaModal && (
        <Modal
          title="Servicio sin respuesta"
          onClose={() => setSinRespuestaModal(null)}
        >
          <div className="checklist-modal">

            {/* INFO */}
            <p>
              <strong>Servicio:</strong> {service.code}
            </p>

            <p>
              <strong>Cliente:</strong>{' '}
              {service.userData?.firstName} {service.userData?.lastName}
            </p>

            <p>
              <strong>Equipo:</strong>{' '}
              {service.equipmentType} {service.brand}
            </p>

            <p>
              ⏱ Creado hace <strong>{sinRespuestaModal.timeSinceCreation}</strong>
            </p>

            <p>
              🕓 Última actividad{' '}
              <strong>{sinRespuestaModal.timeSinceLastActivity}</strong>
            </p>

            {/* ALERTA */}
            {sinRespuestaModal.level === 'fuerte' ? (
              <p style={{
                color: '#b00020',
                background: '#ffe5e5',
                padding: '8px',
                borderRadius: '6px'
              }}>
                ⚠️ Este servicio es reciente. Evitá marcarlo como sin respuesta.
              </p>
            ) : (
              <p style={{
                color: '#8a6d3b',
                background: '#fff7e0',
                padding: '8px',
                borderRadius: '6px'
              }}>
                Sugerencia: contactá al cliente antes de continuar.
              </p>
            )}

            {/* WHATSAPP */}
            {service?.userData?.phone && (
              <a
                href={`https://wa.me/54${String(service.userData.phone).replace(/\D/g, '')}?text=${encodeURIComponent(
                  `Hola ${service.userData?.firstName || ''}, te contactamos por tu equipo (${service.code}) esta a la espera de coordinación, quedamos a disposición.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  marginTop: 10,
                  marginBottom: 10,
                  padding: 10,
                  background: '#25D366',
                  color: '#fff',
                  textAlign: 'center',
                  borderRadius: 6,
                  textDecoration: 'none'
                }}
              >
                📲 Enviar WhatsApp
              </a>
            )}

            {/* BOTONES */}
            <div className="checklist-actions">

              <button
                className="btn-cancelar"
                onClick={() => setSinRespuestaModal(null)}
              >
                Cancelar
              </button>

              <button
                className="btn-submit"
                style={{
                  background: sinRespuestaModal.level === 'fuerte'
                    ? '#d32f2f'
                    : undefined,
                  color: sinRespuestaModal.level === 'fuerte'
                    ? '#fff'
                    : undefined
                }}
                onClick={async () => {
                  if (sinRespuestaModal.level === 'fuerte') {
                    logError(
                      `Servicio marcado como sin respuesta antes de tiempo | Equipo: ${service.equipmentType} | Código: ${service.code} | Días: ${sinRespuestaModal.daysSinceCreation} | Estado: ${service.status} | Usuario: ${userEmail}`,
                      'error',
                      { serviceId: service._id }
                    )
                  }

                  await persist({
                    service,
                    newStatus: 'Sin respuesta',
                    token,
                    note,
                    userEmail
                  })

                  setSinRespuestaModal(null)
                }}
              >
                Marcar como sin respuesta
              </button>

            </div>
          </div>
        </Modal>
      )}

      {/* Modal de retirado a bodega */}
      {bodegaModal && (
        <Modal
          title="Enviar a bodega"
          onClose={() => setBodegaModal(false)}
        >
          <div className="checklist-modal">

            {/* INFO */}
            <div className="modal-section">
              <p><strong>Servicio:</strong> {service.code}</p>
              <p><strong>Cliente:</strong> {service.userData?.firstName}</p>
              <p><strong>Equipo:</strong> {service.equipmentType}</p>
              <p><strong>Marca:</strong> {service.brand}</p>
            </div>

            {/* WARNING */}
            <div className="modal-warning">
              📦 El equipo será almacenado en bodega. No se puede revertir esta acción.
            </div>

            {/* WHATSAPP 1 - AVISO SIMPLE */}
            {service?.userData?.phone && (
              <a
                href={`https://wa.me/54${String(service.userData.phone).replace(/\D/g, '')}?text=${encodeURIComponent(
                  `Hola ${service.userData?.firstName || ''}, te informamos que tu ${service.equipmentType} (${service.code}) será derivado a bodega en breve, ante cualquier consulta estamos a disposición.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  marginTop: 10,
                  marginBottom: 10,
                  padding: 10,
                  background: '#25D366',
                  color: '#fff',
                  textAlign: 'center',
                  borderRadius: 6,
                  textDecoration: 'none'
                }}
              >
                <FontAwesomeIcon icon={faWhatsapp} /> Aviso de derivación
              </a>
            )}

            {/* WHATSAPP 2 - FINAL PROFESIONAL */}
            {service?.userData?.phone && (
              <a
                href={`https://wa.me/54${String(service.userData.phone).replace(/\D/g, '')}?text=${encodeURIComponent(
                  `Hola ${service.userData?.firstName || ''}, tu ${service.equipmentType} (${service.code}) fue trasladado a bodega conforme a las condiciones del servicio, debido a requerimientos de almacenamiento. Cualquier duda estamos a disposición.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  marginBottom: 12,
                  padding: 10,
                  background: '#128C7E',
                  color: '#fff',
                  textAlign: 'center',
                  borderRadius: 6,
                  textDecoration: 'none',
                  fontWeight: 500
                }}
              >
                📦 Aviso final de bodega
              </a>
            )}

            {/* CONFIRMACION */}
            <p className="modal-question">
              ¿Confirmás esta acción?
            </p>

            {/* BOTONES */}
            <div className="checklist-actions">

              <button
                className="btn-cancelar"
                onClick={() => setBodegaModal(false)}
              >
                Cancelar
              </button>

              <button
                className="btn-submit btn-danger"
                onClick={async () => {
                  await persist({
                    service,
                    newStatus: 'Retirado a bodega',
                    token,
                    note,
                    userEmail
                  })

                  setBodegaModal(false)
                }}
              >
                Confirmar
              </button>

            </div>

          </div>
        </Modal>
      )}
    </>
  )
}
import React, { useState } from 'react'
import { ESTADOS_SERVICIO, normalizeStatus, equipmentAccessories } from '../../utils/productsData.jsx'
import { updateServiceStatus } from '../../utils/updateServiceStatus.js'
import StatusModal from '../StatusModal/StatusModal.jsx'
import Modal from '../Modal/Modal.jsx'
import './ServiceStatusControl.css'
import { logError } from '../../utils/logger.js'

const getAvailableStatuses = (service) => {
  if (!service) return []

  if (service.flowVersion !== 2) {
    return ESTADOS_SERVICIO.map(e => e.value)
  }

  const status = service.status || 'Pendiente'

  switch (status) {
    case 'En Gestión':
      return ['En Gestión']
    case 'Reparación':
      return ['Reparación', 'Listo para retirar']
    case 'Armado S/R':
      return ['Armado S/R', 'Listo para retiro S/R']
    case 'Listo para retirar':
      return ['Listo para retirar', 'Entregado']
    case 'Listo para retiro S/R':
      return ['Listo para retiro S/R', 'Entregado S/R']
    case 'Pendiente':
      return ['Pendiente', 'Recibido']
    case 'Recibido':
      return ['Recibido', 'En Gestión']
    default:
      return [status]
  }
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
    const acc = formData.accessories

    return {
      wasRepairedBefore: formData.reparacion === 'Sí',
      isClean: formData.higienizado === 'Sí',
      hasAccessories: formData.poseeAccesorios === 'Sí',

      accessories: {
        cable: acc.includes('cable'),
        controlRemoto: acc.includes('control remoto'),
        bandejas: acc.includes('bandeja'),
        jarra: acc.includes('jarra'),
        plato: acc.includes('plato'),
        tapa: acc.includes('tapa'),
        manguera: acc.includes('manguera'),
        bateria: acc.includes('batería'),
        base: acc.includes('base de carga'),
      },

      accessoriesOther: formData.otroAccesorio || '',
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

      console.error('[ServiceStatusControl] ERROR:', errorMsg)

      // 🟡 ERROR ESPERADO → NO MAIL
      if (errorMsg === 'Debe completar el checklist') {
        logError('Intento avanzar sin checklist', 'warn', {
          serviceId: service?._id,
          from: service?.status,
          to: params?.newStatus,
          user: userEmail
        })

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

    // Mostrar modal de recepción al pasar Pendiente → Recibido
    if (service.status === 'Pendiente' && value === 'Recibido') {
      setNextStatus(value)
      setModalVisible(true)
      return
    }

    // Modal de satisfacción para entrega
    if (value === 'Entregado') {
      setModalType('satisfaction')
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
          onClose={() => setModalVisible(false)}
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
                onClick={() => setModalVisible(false)}
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
    </>
  )
}
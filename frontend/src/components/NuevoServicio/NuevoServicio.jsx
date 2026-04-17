import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import DashboardLayout from '../DashboardLayout/DashboardLayout'
import NuevoClienteModal from '../NuevoClienteModal/NuevoClienteModal.jsx'
import ServiceStatusControl from '../ServiceStatusControl/ServiceStatusControl.jsx'
import { AuthContext } from '../../Context/AuthContext'
import Select from 'react-select'
import { equipoOptions } from '../../utils/productsData'
import { getApiUrl } from '../../config'
import { logError } from '../../utils/logger.js'
import './NuevoServicio.css'

const NuevoServicio = () => {
  const { auth } = useContext(AuthContext)
  const navigate = useNavigate()

  const [clientes, setClientes] = useState([])
  const [cotizaciones, setCotizaciones] = useState([])
  const [showClienteModal, setShowClienteModal] = useState(false)

  const [showChecklistModal, setShowChecklistModal] = useState(false)
  const [pendingFinalData, setPendingFinalData] = useState(null)

  const [formData, setFormData] = useState({
    customerNumber: '',
    quoteReference: '',
    codePrefix: 'Q',
    code: '',
    equipmentType: '',
    brand: '',
    model: '',
    serviceType: 'Reparación',
    approximateValue: '',
    finalValue: 0,
    repuestos: 0,
    warrantyExpiration: 30,
    notes: '',
    userDescription: '',
    description: '',
    receivedAtBranch: 'Quilmes',
    deliveryMethod: 'Presencial'
  })

  const [previewDescription, setPreviewDescription] = useState('')
  const [error, setError] = useState(null)

  useEffect(() => {
    axios.get(`${getApiUrl()}/api/client`, { withCredentials: true})
      .then(res => setClientes(res.data || []))
      .catch(err => console.error('Error al obtener clientes', err))

    axios.get(`${getApiUrl()}/api/quotes`, { withCredentials: true })
      .then(res => setCotizaciones(res.data || []))
      .catch(err => console.error('Error al obtener cotizaciones', err))
  }, [auth])

  const clienteOptions = [...clientes]
    .sort((a, b) => b.customerNumber - a.customerNumber)
    .map(c => ({
      value: c.customerNumber,
      label: `#${c.customerNumber} - ${c.firstName} ${c.lastName}`
    }))

  const validCot = cotizaciones.filter(q => q.serviceRequestNumber)
  const invalidCot = cotizaciones.filter(q => !q.serviceRequestNumber)
  const cotOptions = [
    ...validCot.sort((a, b) => b.serviceRequestNumber - a.serviceRequestNumber).map(q => ({
      value: q.serviceRequestNumber,
      label: `#${q.serviceRequestNumber} - ${q.userData?.firstName || ''} ${q.userData?.lastName || ''}`.trim()
    })),
    ...invalidCot.map(q => ({
      value: null,
      label: `${q.userData?.firstName || ''} ${q.userData?.lastName || ''} (sin número)`
    }))
  ]

  const updatePreview = () => {
    const { code, equipmentType, brand, model, approximateValue, quoteReference, userDescription } = formData
    const base = [code, equipmentType, brand, model].filter(Boolean).join(' ')
    const texto = (userDescription || '').trim()
    const approx = approximateValue ? `Aprox.: ${approximateValue}` : ''
    const cotRef = quoteReference ? ` #${quoteReference}` : ''
    setPreviewDescription([base, texto, approx].filter(Boolean).join('. ').trim().concat(cotRef))
  }

  useEffect(() => {
    updatePreview()
  }, [
    formData.code,
    formData.equipmentType,
    formData.brand,
    formData.model,
    formData.approximateValue,
    formData.quoteReference,
    formData.userDescription,
    formData.deliveryMethod
  ])

  const handleChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Pide un "siguiente" SOLO para preview (el definitivo lo asigna el backend)
  const handleCodePrefixChange = async (prefix) => {
    setFormData(prev => ({ ...prev, codePrefix: prefix, code: '' }))
    if (!prefix) return
    try {
      const res = await axios.get(`${getApiUrl()}/api/service/last-code/${prefix}`, { withCredentials: true })
      const nextCode = res.data?.nextCode || `${prefix}1000`
      setFormData(prev => ({ ...prev, code: nextCode }))
    } catch {
      setFormData(prev => ({ ...prev, code: `${prefix}1000` }))
    }
  }

  const handleSubmit = async e => {
  e.preventDefault()
  setError(null)

  // VALIDACIONES
    if (!formData.customerNumber) return setError('Debe seleccionar un cliente.')
    if (!formData.equipmentType) return setError('Debe seleccionar el tipo de equipo.')
    if (!formData.brand.trim()) return setError('Debe ingresar la marca del equipo.')
    if (!formData.userDescription.trim()) return setError('Debe ingresar la descripción del problema.')
    if (!formData.codePrefix) return setError('Debe seleccionar un prefijo.')
    if (!formData.deliveryMethod) return setError('Debe seleccionar el método de envío.')

    const selectedClient = clientes.find(c => c.customerNumber === Number(formData.customerNumber))
    if (!selectedClient) return setError('Cliente no encontrado.')

    const receivedAtBranch = formData.receivedAtBranch || null

    const finalData = {
      customerNumber: selectedClient.customerNumber,
      userData: {
        firstName: selectedClient.firstName,
        lastName: selectedClient.lastName,
        email: selectedClient.email,
        phone: selectedClient.phone,
        dniOrCuit: selectedClient.dniOrCuit,
        domicilio: selectedClient.domicilio
      },
      quoteReference: formData.quoteReference ? Number(formData.quoteReference) : undefined,
      equipmentType: formData.equipmentType,
      brand: formData.brand,
      model: formData.model,
      serviceType: formData.serviceType,
      approximateValue: formData.approximateValue,
      finalValue: Number(formData.finalValue) || 0,
      repuestos: Number(formData.repuestos) || 0,
      warrantyExpiration: Number(formData.warrantyExpiration),
      notes: formData.notes,
      description: previewDescription,
      userDescription: formData.userDescription,
      code: formData.code,
      receivedAtBranch,
      deliveryMethod: formData.deliveryMethod
    }

    console.log("SUBMIT", finalData)

    // SI YA TIENE SUCURSAL, abrimos modal en vez de enviar directo
    if (receivedAtBranch) {
      setPendingFinalData(finalData) // guardamos los datos pendientes
      setShowChecklistModal(true)    // abrimos modal
      return
    }

    // si no, enviamos directo
    try {
      await axios.post(`${getApiUrl()}/api/service`, finalData, { withCredentials: true })
      navigate(`/servicios`)
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear el servicio.')
      logError(`Error creando servicio: ${err} | user: ${auth.user.email}`)
      console.error(err)
    }
  }

  useEffect(() => {
    if (formData.codePrefix) {
      handleCodePrefixChange(formData.codePrefix)
    }
  }, [])

  return (
    <DashboardLayout>
      <div className="dashboard-wrapper">
        <button className="back-button-pro" onClick={() => navigate(-1)}>← Volver</button>
        <h2 className="dashboard-title">➕ Nuevo Servicio</h2>

        <form className="form-elegante" onSubmit={handleSubmit}>
          {/* Prefijo + Código generado (preview) */}
          <div className="form-section">
            <label>Prefijo*</label>
            <select
              name="codePrefix"
              value={formData.codePrefix}
              onChange={e => handleCodePrefixChange(e.target.value)}
              required
            >
              <option value="Q">Q (Quilmes)</option>
              <option value="B">B (Barracas)</option>
              <option value="W">W (Web)</option>
            </select>
          </div>

          <div className="form-section">
            <label>Código generado</label>
            <input name="code" value={formData.code} readOnly />
          </div>

          {/* Cliente */}
          <div className="form-section">
            <label>Cliente*</label>
            <div className="select-wrapper">
              <div style={{ flex: 1 }}>
                <Select
                  classNamePrefix="react-select"
                  placeholder="Buscar cliente..."
                  options={clienteOptions}
                  onChange={sel =>
                    setFormData(prev => ({ ...prev, customerNumber: sel?.value || '' }))
                  }
                  isSearchable
                />
              </div>
              <button
                type="button"
                className="btn-nuevo"
                onClick={() => setShowClienteModal(true)}
              >
                Nuevo
              </button>
            </div>
          </div>

          {/* Equipo */}
          <div className="form-section">
            <label>Tipo de Equipo*</label>
            <Select
              classNamePrefix="react-select"
              placeholder="Buscar equipo..."
              options={equipoOptions}
              value={equipoOptions.find(opt => opt.value === formData.equipmentType) || null}
              onChange={sel =>
                setFormData(prev => ({ ...prev, equipmentType: sel?.value || '' }))
              }
              isSearchable
            />
          </div>

          <div className="form-section">
            <label>Marca*</label>
            <input name="brand" value={formData.brand} onChange={handleChange} required/>
          </div>

          <div className="form-section">
            <label>Modelo</label>
            <input name="model" value={formData.model} onChange={handleChange} />
          </div>

          <div className="form-section full-width">
            <label>Descripción*</label>
            <textarea
              name="userDescription"
              value={formData.userDescription}
              onChange={handleChange}
              placeholder="Describí el problema, síntomas u observaciones..."
              required
            />
          </div>

          <div className="form-section full-width">
            <label>Vista previa</label>
            <textarea readOnly value={previewDescription} />
          </div>

          <div className="form-section">
            <label>Tipo de Servicio</label>
            <select name="serviceType" value={formData.serviceType} onChange={handleChange}>
              <option value="Reparación">Reparación</option>
              <option value="Garantía">Garantía</option>
              <option value="Mantenimiento">Mantenimiento</option>
            </select>
          </div>

          <div className="form-section">
            <label>Valor Aproximado ($)</label>
            <input
              name="approximateValue"
              value={formData.approximateValue}
              onChange={handleChange}
              placeholder="$25.000 a $40.000"
            />
          </div>

          <div className="form-section">
            <label>Referencia Cotización</label>
            <Select
              classNamePrefix="react-select"
              placeholder="Buscar cotización..."
              options={cotOptions}
              onChange={sel =>
                setFormData(prev => ({ ...prev, quoteReference: sel?.value || '' }))
              }
              isSearchable
            />
          </div>

          <div className="form-section">
            <label>Garantía (días)</label>
            <input
              type="number"
              name="warrantyExpiration"
              value={formData.warrantyExpiration}
              onChange={handleChange}
            />
          </div>

          <div className="form-section">
            <label>Recibido En</label>
            <select name="receivedAtBranch" value={formData.receivedAtBranch} onChange={handleChange}>
              <option value="Quilmes">Quilmes</option>
              <option value="Barracas">Barracas</option>
              <option value="">No recibido</option>
            </select>
          </div>

          <div className="form-section">
            <label>Metodo de Envio</label>
            <select name="deliveryMethod" value={formData.deliveryMethod} onChange={handleChange}>
              <option value="Presencial">Presencial</option>
              <option value="UberFlash">UberFlash</option>
              <option value="Retiro y Entrega">Retiro y Entrega</option>
              <option value="Envío Correo">Envío Correo</option>
            </select>
          </div>

          <div className="form-section full-width">
            <label>Notas del Técnico (Uso Interno)</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-footer">
            <button type="submit" className="btn-submit">Guardar Servicio</button>
          </div>
        </form>
      </div>

      {showClienteModal && (
        <NuevoClienteModal
          onClose={() => setShowClienteModal(false)}
          onClienteCreado={nuevoCliente => {
            setClientes(prev => [...prev, nuevoCliente])
            setFormData(prev => ({ ...prev, customerNumber: nuevoCliente.customerNumber }))
            setShowClienteModal(false)
          }}
        />
      )}
      {showChecklistModal && (
        <ServiceStatusControl
          service={{ equipmentType: formData.equipmentType }} // SIN _id = CREATE MODE
          userEmail={auth.user.email}
          userBranch={formData.receivedAtBranch}

          onChecklistComplete={async (checklist) => {
            try {
              await axios.post(`${getApiUrl()}/api/service`, {
                ...pendingFinalData,
                receptionChecklist: checklist
              }, { withCredentials: true })

              setPendingFinalData(null)
              navigate('/servicios')
            } catch (err) {
              const msg = err.response?.data?.error || err.message

              logError(`Error creando servicio con checklist: ${msg} | user: ${auth.user.email}`)

              setError(msg)
              console.error(err)
            } finally {
              setShowChecklistModal(false)
              setPendingFinalData(null)
            }
          }}
        />
      )}
    </DashboardLayout>
  )
}

export default NuevoServicio
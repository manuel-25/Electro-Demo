import axios from 'axios'
import { getApiUrl } from '../config'

//Crea la solicitud al backend y la envia por axios a update service

/**
 * Construye el payload según el estado
 */
const buildPayload = ({
  newStatus,
  note,
  userEmail,
  receivedAtBranch,
  isSatisfied,
  receptionChecklist
}) => {
  const payload = {
    status: newStatus,
    note
  }

  if (newStatus === 'Recibido') {
    payload.receivedBy = userEmail || null
    payload.receivedAtBranch = receivedAtBranch || null
  }

  // 🔥 ESTO VA AFUERA
  if (receptionChecklist) {
    payload.receptionChecklist = receptionChecklist
  }

  // 🚚 ENTREGA
  if (newStatus === 'Entregado') {
    if (typeof isSatisfied === 'boolean') {
      payload.isSatisfied = isSatisfied
    }
  }

  return payload
}

/**
 * Actualiza el estado de un servicio
 */
export const updateServiceStatus = async ({
  service,
  newStatus,
  note = '',
  userEmail = '',
  receivedAtBranch = null,
  isSatisfied = null,
  receptionChecklist = null
}) => {
  if (!service?._id) {
    throw new Error('Service inválido: falta _id')
  }

  if (!newStatus) {
    throw new Error('Falta newStatus')
  }

  const payload = buildPayload({
    newStatus,
    note,
    userEmail,
    receivedAtBranch,
    isSatisfied,
    receptionChecklist
  })

  // 🧪 DEBUG (podés comentarlo en prod)
  console.log('🚀 updateServiceStatus payload:', payload)

  try {
    const response = await axios.put(
      `${getApiUrl()}/api/service/${service._id}/status`,
      payload,
      { withCredentials: true }
    )

    return response.data

  } catch (error) {
    console.error('❌ updateServiceStatus error:', error.response?.data || error.message)
    throw error
  }
}
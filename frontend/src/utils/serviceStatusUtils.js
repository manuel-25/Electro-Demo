import { ESTADOS_SERVICIO } from "./productsData.jsx"

// =========================
// NORMALIZACIÓN
// =========================
export const normalizeStatus = (raw = '') =>
  raw
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\//g, '')
    .replace(/\s+/g, '-')

// =========================
// HELPERS GARANTÍA
// =========================
export const hasActiveWarranty = (service) => {
  return !!service?.activeWarrantyEventId
}

export const isWarrantyStatus = (status) => {
  return [
    'En Gestión Garantía',
    'Reparación Garantía',
    'Listo para retirar Garantía'
  ].includes(status)
}

export const canStartWarranty = (service) => {
  if (!service) return false

  return (
    service.status === 'Entregado' &&
    service.workOrderStatus === 'Aceptada' &&
    !!service.warrantyUntil &&
    new Date(service.warrantyUntil) > new Date() &&
    !service.activeWarrantyEventId
  )
}

// =========================
// CLASE CSS
// =========================
export const getStatusClass = (status) => {
  const found = ESTADOS_SERVICIO.find(
    (s) => normalizeStatus(s.label) === normalizeStatus(status)
  )

  return found?.class || 'status-default'
}

// =========================
// LABEL OFICIAL
// =========================
export const getStatusLabel = (status) => {
  const found = ESTADOS_SERVICIO.find(
    (s) => normalizeStatus(s.label) === normalizeStatus(status)
  )

  return found?.label || status
}

// =========================
// VALIDACIÓN TRANSICIONES
// =========================
export const esTransicionValida = (
  estadoActual,
  nuevoEstado
) => {

  const idxActual = ESTADOS_SERVICIO.findIndex(
    (e) =>
      normalizeStatus(e.label) === normalizeStatus(estadoActual)
  )

  const idxNuevo = ESTADOS_SERVICIO.findIndex(
    (e) =>
      normalizeStatus(e.label) === normalizeStatus(nuevoEstado)
  )

  // no permitir saltos grandes
  return idxNuevo <= idxActual + 1
}
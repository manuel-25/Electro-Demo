// Normaliza nombres y apellidos
export const normalizeName = (name = '') => {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ') // quita espacios múltiples
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Normaliza email
export const normalizeEmail = (email = '') => {
  return email.trim().toLowerCase()
}

// Normaliza teléfono → ej: +54 9 11 2184-2265 → 1121842265
export const normalizePhone = (phone = '') => {
  return phone
    .replace(/\D/g, '')          // deja solo números
}

// Normaliza provincia/municipio (mismo criterio que nombre)
export const normalizeLocation = (location = '') => {
  return normalizeName(location)
}

// Normaliza domicilio (primera letra en mayúscula, resto minúscula)
export const normalizeAddress = (address = '') => {
  return address
    .trim()
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function normalizeText(value) {
  if (typeof value !== 'string') return value
  return value.trim().toLowerCase()
}
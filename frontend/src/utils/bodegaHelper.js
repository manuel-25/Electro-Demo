import { getServiceAging } from './serviceAging'

export const getBodegaInfo = (service) => {
  const { daysSinceCreation, daysSinceLastActivity } = getServiceAging(service)

  // 🔴 MUY PRONTO
  if (daysSinceCreation < 7) {
    return {
      level: 'fuerte',
      message: `El servicio tiene solo ${daysSinceCreation} días. No debería enviarse a bodega.`,
      allowDirect: false
    }
  }

  // 🟠 INTERMEDIO
  if (daysSinceCreation < 30) {
    return {
      level: 'warning',
      message: `El servicio tiene ${daysSinceCreation} días. Se recomienda intentar contacto antes de enviarlo a bodega.`,
      allowDirect: true
    }
  }

  // 🟢 OK TOTAL
  return {
    level: 'ok',
    message: `El servicio supera los 30 días. Puede enviarse a bodega.`,
    allowDirect: true
  }
}
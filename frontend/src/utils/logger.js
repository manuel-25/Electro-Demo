import { getApiUrl } from '../config'

export const logError = async (message, level = 'error', extra = {}) => {
  try {
    await fetch(`${getApiUrl()}/api/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        level,
        message,
        extra,
        url: window.location.href,
        userAgent: navigator.userAgent
      })
    })
  } catch (err) {
    console.error('Error al enviar log:', err)
  }
}

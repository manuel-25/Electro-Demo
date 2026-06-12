import config from '../utils/config.js'

const PROVIDERS = {
  DEMO: 'demo',
  WEB: 'whatsapp-web',
  CLOUD: 'cloud-api'
}

function getConfiguredProvider() {
  if (config.DEMO_MODE) return PROVIDERS.DEMO
  return process.env.WHATSAPP_PROVIDER || PROVIDERS.WEB
}

function normalizeChatId(phone) {
  const value = String(phone || '').trim()
  if (value.includes('@c.us')) return value
  const digits = value.replace(/\D/g, '')
  return `${digits}@c.us`
}

function canUseFreeFormReply(conversation) {
  if (!conversation?.lastCustomerMessageAt) return false
  const elapsedMs = Date.now() - new Date(conversation.lastCustomerMessageAt).getTime()
  return elapsedMs <= 24 * 60 * 60 * 1000
}

async function sendWithWhatsappWeb(phone, text) {
  if (!global.client?.sendMessage) {
    return {
      ok: false,
      provider: PROVIDERS.WEB,
      status: 'failed',
      error: 'Cliente whatsapp-web no inicializado'
    }
  }

  const sent = await global.client.sendMessage(normalizeChatId(phone), text)
  return {
    ok: true,
    provider: PROVIDERS.WEB,
    status: 'sent',
    externalId: sent?.id?._serialized
  }
}

async function sendWithCloudApi(phone, text) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
  const token = process.env.WHATSAPP_ACCESS_TOKEN
  if (!phoneNumberId || !token) {
    return {
      ok: false,
      provider: PROVIDERS.CLOUD,
      status: 'failed',
      error: 'Faltan WHATSAPP_PHONE_NUMBER_ID o WHATSAPP_ACCESS_TOKEN'
    }
  }

  const response = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: String(phone).replace(/\D/g, ''),
      type: 'text',
      text: { preview_url: false, body: text }
    })
  })
  const data = await response.json()

  if (!response.ok) {
    return {
      ok: false,
      provider: PROVIDERS.CLOUD,
      status: 'failed',
      error: data?.error?.message || 'Error enviando por Cloud API'
    }
  }

  return {
    ok: true,
    provider: PROVIDERS.CLOUD,
    status: 'sent',
    externalId: data?.messages?.[0]?.id
  }
}

export async function sendWhatsappMessage({ phone, text, conversation }) {
  const provider = getConfiguredProvider()

  if (!text?.trim()) {
    return { ok: false, provider, status: 'failed', error: 'Mensaje vacio' }
  }

  if (provider === PROVIDERS.DEMO) {
    return { ok: true, provider, status: 'sent', externalId: `demo-${Date.now()}` }
  }

  if (provider === PROVIDERS.CLOUD && !canUseFreeFormReply(conversation)) {
    return {
      ok: false,
      provider,
      status: 'failed',
      error: 'Fuera de ventana de 24h: requiere plantilla aprobada'
    }
  }

  if (provider === PROVIDERS.CLOUD) return sendWithCloudApi(phone, text)
  return sendWithWhatsappWeb(phone, text)
}

export function getWhatsappCapabilities(conversation) {
  const provider = getConfiguredProvider()
  const freeFormAvailable = provider !== PROVIDERS.CLOUD || canUseFreeFormReply(conversation)
  return {
    provider,
    freeFormAvailable,
    requiresTemplate: provider === PROVIDERS.CLOUD && !freeFormAvailable,
    limitation: provider === PROVIDERS.CLOUD
      ? 'Cloud API permite respuestas libres dentro de la ventana de atencion. Fuera de esa ventana se debe usar plantilla aprobada.'
      : 'Integracion local con whatsapp-web.js. Para produccion conviene migrar a Cloud API.'
  }
}

import axios from 'axios'
import { getApiUrl } from '../config.js'

const SESSION_KEY = 'electrosafeDemoSession'

export function getDemoSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null')
  } catch {
    return null
  }
}

export function saveDemoSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  applyDemoHeaders(session)
}

export function clearDemoSession() {
  localStorage.removeItem(SESSION_KEY)
  applyDemoHeaders(null)
}

export function applyDemoHeaders(session = getDemoSession()) {
  const headers = session
    ? {
        'X-Demo-Session-Id': session.sessionId,
        'X-Demo-User-Email': session.user?.email || session.email
      }
    : {}

  if (session) {
    Object.assign(axios.defaults.headers.common, headers)
  } else {
    delete axios.defaults.headers.common['X-Demo-Session-Id']
    delete axios.defaults.headers.common['X-Demo-User-Email']
  }
}

export async function createDemoSession(email) {
  const response = await axios.post(`${getApiUrl()}/api/demo/session`, { email })
  const session = {
    sessionId: response.data.sessionId,
    user: response.data.user,
    visitor: response.data.visitor
  }
  saveDemoSession(session)
  return session
}

export function trackDemoEvent(name, payload = {}, type = 'ui_action') {
  const session = getDemoSession()
  if (!session) return

  axios.post(`${getApiUrl()}/api/demo/events`, {
    type,
    name,
    path: window.location.pathname + window.location.search,
    payload
  }).catch(() => {})
}

export function trackDemoPageView(path) {
  trackDemoEvent('page_view', { title: document.title }, 'page_view')
}

export function installDemoFetchHeaders() {
  if (window.__electrosafeDemoFetchInstalled) return
  window.__electrosafeDemoFetchInstalled = true

  const originalFetch = window.fetch
  window.fetch = (input, init = {}) => {
    const session = getDemoSession()
    if (!session) return originalFetch(input, init)

    const url = typeof input === 'string' ? input : input?.url
    const shouldDecorate = url?.startsWith(getApiUrl()) || url?.startsWith('/api/')
    if (!shouldDecorate) return originalFetch(input, init)

    const headers = new Headers(init.headers || (typeof input !== 'string' ? input.headers : undefined))
    headers.set('X-Demo-Session-Id', session.sessionId)
    headers.set('X-Demo-User-Email', session.user?.email || session.email)

    return originalFetch(input, { ...init, headers })
  }
}

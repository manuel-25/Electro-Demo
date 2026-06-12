import React, { createContext, useEffect, useState } from 'react'
import axios from 'axios'
import { getApiUrl } from '../config.js'
import {
  applyDemoHeaders,
  clearDemoSession,
  createDemoSession,
  getDemoSession,
  installDemoFetchHeaders
} from '../utils/demoAnalytics.js'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const isDemoMode = process.env.REACT_APP_DEMO_MODE === 'true'
  const [auth, setAuth] = useState(() => {
    const session = isDemoMode ? getDemoSession() : null
    return session ? { user: session.user } : null
  })
  const [loading, setLoading] = useState(!isDemoMode)
  const [error, setError] = useState(null)
  const [authenticated, setAuthenticated] = useState(() => !!(isDemoMode && getDemoSession()))

  useEffect(() => {
    if (isDemoMode) {
      const session = getDemoSession()
      installDemoFetchHeaders()
      applyDemoHeaders(session)
      setAuth(session ? { user: session.user } : null)
      setAuthenticated(!!session)
      setLoading(false)
      return
    }

    const verifyToken = async () => {
      try {
        const response = await axios.get(`${getApiUrl()}/api/manager/verifytoken`, { withCredentials: true })
        if (response.status === 200) {
          setAuth({ user: response.data.user })
          setAuthenticated(true)
        } else {
          setAuth(null)
          setAuthenticated(false)
        }
      } catch (err) {
        setAuth(null)
        setAuthenticated(false)
      } finally {
        setLoading(false)
      }
    }

    verifyToken()
  }, [isDemoMode])

  useEffect(() => {
    if (isDemoMode) return

    const interval = setInterval(() => {
      axios.get(`${getApiUrl()}/api/manager/verifytoken`, { withCredentials: true })
        .then(() => setAuthenticated(true))
        .catch(() => {
          setAuthenticated(false)
          setAuth(null)
        })
    }, 60 * 1000)

    return () => clearInterval(interval)
  }, [isDemoMode])

  const login = async (email, password, remember = true) => {
    setLoading(true)
    setError(null)

    if (isDemoMode) {
      try {
        const session = await createDemoSession(email)
        setAuth({ user: session.user })
        setAuthenticated(true)
        return { success: true }
      } catch (err) {
        setError('No pudimos iniciar la demo')
        return { success: false }
      } finally {
        setLoading(false)
      }
    }

    try {
      const response = await fetch(`${getApiUrl()}/api/manager/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, remember }),
        credentials: 'include'
      })
      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Error al iniciar sesion')
        return { success: false, lockUntil: data.lockUntil || null }
      }

      setAuth({ user: data.user })
      setAuthenticated(true)
      return { success: true }
    } catch (err) {
      setError('Error de conexion')
      return { success: false }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    if (isDemoMode) {
      clearDemoSession()
      setAuth(null)
      setAuthenticated(false)
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      await axios.post(`${getApiUrl()}/api/manager/logout`, {}, { withCredentials: true })
    } catch (err) {
      console.warn('Error en logout:', err)
    }

    try {
      localStorage.removeItem('serviciosState')
      localStorage.removeItem('clientsState')
      localStorage.removeItem('cotizacionesState')
      localStorage.removeItem('serviciosSortState')
    } catch (e) {
      console.warn('Error limpiando estados guardados', e)
    }

    setAuth(null)
    setAuthenticated(false)
    setLoading(false)
  }

  return (
    <AuthContext.Provider value={{ auth, login, logout, loading, error, authenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

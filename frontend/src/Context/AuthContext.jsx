import React, { createContext, useState, useEffect } from 'react'
import axios from 'axios'
import { getApiUrl } from '../config.js'

export const AuthContext = createContext()

const DEMO_AUTH = {
  user: {
    email: 'demo@electrosafe.app',
    role: 'admin',
    branch: 'Quilmes'
  }
}

export const AuthProvider = ({ children }) => {
  const isDemoMode = process.env.REACT_APP_DEMO_MODE === 'true'
  const [auth, setAuth] = useState(isDemoMode ? DEMO_AUTH : null)
  const [loading, setLoading] = useState(!isDemoMode)
  const [error, setError] = useState(null)
  const [authenticated, setAuthenticated] = useState(isDemoMode)

  // Verificación inicial del token desde backend (cookie)
  useEffect(() => {
    if (isDemoMode) {
      setAuth(DEMO_AUTH)
      setAuthenticated(true)
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
        .then(res => setAuthenticated(true))
        .catch(() => {
          setAuthenticated(false)
          setAuth(null)
        })
    }, 60 * 1000) // cada 60 segundos

    return () => clearInterval(interval)
  }, [isDemoMode])

  // Login: no maneja token desde JS, confías en cookie
  const login = async (email, password, remember = true) => {
    if (isDemoMode) {
      setAuth(DEMO_AUTH)
      setAuthenticated(true)
      setLoading(false)
      return { success: true }
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${getApiUrl()}/api/manager/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, remember }),
        credentials: 'include'
      })

      const data = await response.json()

      // ❌ ERROR (401, 403, etc)
      if (!response.ok) {
        setError(data.message || 'Error al iniciar sesión')

        return {
          success: false,
          lockUntil: data.lockUntil || null
        }
      }

      // ✅ LOGIN OK
      setAuth({ user: data.user })
      setAuthenticated(true)

      return {
        success: true
      }

    } catch (err) {
      console.error('Error en login:', err)

      setError('Error de conexión')

      return {
        success: false
      }
    } finally {
      setLoading(false)
    }
  }

// Logout: pedir al backend borrar cookie
const logout = async () => {
  if (isDemoMode) {
    setAuth(DEMO_AUTH)
    setAuthenticated(true)
    setLoading(false)
    return
  }

  setLoading(true)
  try {
    await axios.post(`${getApiUrl()}/api/manager/logout`, {}, {
      withCredentials: true
    })
  } catch (err) {
    console.warn('Error en logout:', err)
  }

  // 🧹 Limpieza de estados persistidos
  try {
    localStorage.removeItem('serviciosState')
    localStorage.removeItem('clientsState')
    localStorage.removeItem('cotizacionesState')
    localStorage.removeItem('serviciosSortState')
    // si más adelante agregás otros, podés incluirlos acá
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

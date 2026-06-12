import { useContext } from 'react'
import { AuthContext } from '../../Context/AuthContext'
import { Navigate, useLocation } from 'react-router-dom'
import Loading from '../Loading/Loading.jsx'

const ProtectedRoute = ({ children }) => {
  const { auth, loading, authenticated } = useContext(AuthContext)
  const location = useLocation()

  if (loading) {
    return <Loading />
  }

  if (!auth || !authenticated) {
    console.warn('[ProtectedRoute] Usuario no autenticado, redirigiendo a /manager')
    return <Navigate to="/manager" replace state={{ from: location }} />
  }

  return children
}

export default ProtectedRoute

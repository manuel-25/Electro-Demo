import React from 'react'
import './DashboardLayout.css'
import Sidebar from '../SideBar/SideBar.jsx'
import { Link, useLocation } from 'react-router-dom'

const DashboardLayout = ({ children }) => {
  const location = useLocation()
  const titleByPath = {
    '/dashboard': 'Dashboard',
    '/servicios': 'Servicios',
    '/cotizaciones': 'Cotizaciones',
    '/clientes': 'Clientes',
    '/estadisticas': 'Estadisticas',
    '/whatsapp': 'WhatsApp'
  }
  const currentTitle = Object.entries(titleByPath)
    .find(([path]) => location.pathname.startsWith(path))?.[1] || 'Panel'

  return (
    <div className="layout-container">
      <Sidebar />
      <header className="dashboard-topbar">
        <Link to="/dashboard" className="dashboard-topbar-brand">
          <img src="/images/electrosafeLogo1300x600.jpg" alt="Electrosafe" />
        </Link>
        <div className="dashboard-topbar-title">
          <span>Electrosafe Demo</span>
          <strong>{currentTitle}</strong>
        </div>
        <nav className="dashboard-topbar-nav">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/servicios">Servicios</Link>
          <Link to="/cotizaciones">Cotizaciones</Link>
          <Link to="/clientes">Clientes</Link>
        </nav>
      </header>
      {children}
    </div>
  )
}

export default DashboardLayout

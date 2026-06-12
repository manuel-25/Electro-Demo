import React, { useEffect, useState } from 'react'
import './SideBar.css'
import { Link, useLocation } from 'react-router-dom'
import { FaClipboardList, FaPlusCircle, FaUsers, FaChartBar, FaWhatsapp, FaTachometerAlt, FaMousePointer } from 'react-icons/fa'
import { useNotifications } from '../../Context/NotificationContext'

const Sidebar = () => {
  const { pendingQuotes, pendingChats, priorityChats } = useNotifications()
  const location = useLocation()
  const [isExpanded, setIsExpanded] = useState(false)

  const totalChats = pendingChats + priorityChats
  const displayChats = totalChats > 9 ? '9+' : totalChats

  useEffect(() => {
    setIsExpanded(false)
  }, [location.pathname, location.search])

  const collapseSidebar = () => setIsExpanded(false)

  return (
    <aside
      className={`sidebar ${isExpanded ? 'is-expanded' : ''}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="sidebar-logo">
        <Link to="/dashboard" onClick={collapseSidebar}>
          <img src="/images/ElectrosafeIsotipo.png" alt="Electrosafe Logo" />
        </Link>
      </div>

      <ul className="sidebar-nav">
        <li title="Dashboard">
          <Link to="/dashboard" className="sidebar-link" onClick={collapseSidebar}>
            <FaTachometerAlt />
            <span>Dashboard</span>
          </Link>
        </li>

        <li title="Cotizaciones">
          <Link to="/cotizaciones" className="sidebar-link" onClick={collapseSidebar}>
            <FaClipboardList />
            <span>Cotizaciones</span>

            {pendingQuotes > 0 && (
              <span className="notification-badge red">
                {pendingQuotes}
              </span>
            )}
          </Link>
        </li>

        <li title="Servicios">
          <Link to="/servicios" className="sidebar-link" onClick={collapseSidebar}>
            <FaPlusCircle />
            <span>Servicios</span>
          </Link>
        </li>

        <li title="Clientes">
          <Link to="/clientes" className="sidebar-link" onClick={collapseSidebar}>
            <FaUsers />
            <span>Clientes</span>
          </Link>
        </li>

        <li title="Estadisticas">
          <Link to="/estadisticas" className="sidebar-link" onClick={collapseSidebar}>
            <FaChartBar />
            <span>Estadisticas</span>
          </Link>
        </li>

        <li title="Analitica Demo">
          <Link to="/demo-analytics" className="sidebar-link" onClick={collapseSidebar}>
            <FaMousePointer />
            <span>Analitica</span>
          </Link>
        </li>

        <li title="WhatsApp">
          <Link to="/whatsapp" className="sidebar-link" onClick={collapseSidebar}>
            <FaWhatsapp />
            <span>WhatsApp</span>

            {totalChats > 0 && (
              <span
                className={`notification-badge ${
                  priorityChats > 0 ? 'priority' : 'pending'
                }`}
              >
                {displayChats}
              </span>
            )}
          </Link>
        </li>
      </ul>
    </aside>
  )
}

export default Sidebar

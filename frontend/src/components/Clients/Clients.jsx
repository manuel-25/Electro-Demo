import React, { useEffect, useState, useContext } from 'react'
import axios from 'axios'
import { getApiUrl } from '../../config'
import { AuthContext } from '../../Context/AuthContext'
import DashboardLayout from '../DashboardLayout/DashboardLayout'
import Loading from '../Loading/Loading'
import { Link } from 'react-router-dom'
import './Clients.css'

const Clients = () => {
  const { auth } = useContext(AuthContext)
  const [clients, setClients] = useState([])
  const [search, setSearch] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: 'customerNumber', direction: 'desc' })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(25)
  const [loading, setLoading] = useState(true)
  const [selectedClientId, setSelectedClientId] = useState(null)

  const isAdmin = auth?.user?.role === 'admin'

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await axios.get(`${getApiUrl()}/api/client`, { withCredentials: true })
        const data = Array.isArray(res.data) ? res.data : []
        setClients(data)
        setSelectedClientId(prev => prev || data[0]?._id || null)
      } catch (err) {
        console.error('Error al obtener los clientes')
      } finally {
        setLoading(false)
      }
    }
    fetchClients()
  }, [auth])

  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc'
    setSortConfig({ key, direction })
  }

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return '↕'
    return sortConfig.direction === 'asc' ? '↑' : '↓'
  }

  const sortedClients = [...clients].sort((a, b) => {
    const aVal = a[sortConfig.key]
    const bVal = b[sortConfig.key]

    if (typeof aVal === 'string') return sortConfig.direction === 'asc'
      ? aVal.localeCompare(bVal)
      : bVal.localeCompare(aVal)

    return sortConfig.direction === 'asc' ? (aVal || 0) - (bVal || 0) : (bVal || 0) - (aVal || 0)
  })

  const filteredClients = sortedClients.filter(c => {
    const term = search.trim().toLowerCase()
    return (
      c.customerNumber?.toString().includes(term) ||
      c.firstName?.toLowerCase().includes(term) ||
      c.lastName?.toLowerCase().includes(term) ||
      c.email?.toLowerCase().includes(term) ||
      c.phone?.toString().includes(term)
    )
  })

  const visibleClients = isAdmin
    ? filteredClients
    : filteredClients.slice(0, 5)

  const totalPages = Math.ceil(visibleClients.length / itemsPerPage)
  const paginatedClients = visibleClients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )
  const selectedClient =
    clients.find(client => client._id === selectedClientId) ||
    paginatedClients[0] ||
    null

  return (
    <DashboardLayout>
      <div className="dashboard-wrapper clients-page">
        <div className="page-heading">
          <span>Historial y seguimiento</span>
          <h2 className="dashboard-title">Clientes</h2>
        </div>

        {loading ? (
          <div className="loading-container">
            <Loading />
          </div>
        ) : (
          <>
            <div className="search-wrapper">
              <input
                type="text"
                className="search-input"
                placeholder="Buscar nombre, telefono, email o numero"
                value={search}
                onChange={e => {
                  setSearch(e.target.value)
                  setCurrentPage(1)
                }}
              />
            </div>

            {!isAdmin && filteredClients.length > 5 && (
              <p className="clients-note">
                Mostrando solo los primeros 5 resultados.
              </p>
            )}

            <div className="quotes-items">
              <label>Mostrar </label>
              <select value={itemsPerPage} onChange={e => setItemsPerPage(Number(e.target.value))}>
                {[10, 25, 50, 100].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <label> registros</label>
            </div>

            <div className="clients-workspace">
              <div className="table-wrapper clients-list-panel">
                <table className="styled-table">
                  <thead className="table-head">
                    <tr>
                      <th className="client-code-col" onClick={() => handleSort('customerNumber')}>Cliente {renderSortIcon('customerNumber')}</th>
                      <th onClick={() => handleSort('firstName')}>Nombre {renderSortIcon('firstName')}</th>
                      <th className="client-phone-col" onClick={() => handleSort('phone')}>Telefono {renderSortIcon('phone')}</th>
                      <th className="client-location-col" onClick={() => handleSort('municipio')}>Ubicacion {renderSortIcon('municipio')}</th>
                      <th className="client-requests-col" onClick={() => handleSort('serviceRequestNumbers')}>Solicitudes {renderSortIcon('serviceRequestNumbers')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedClients.map(client => (
                      <tr
                        key={client._id}
                        className={selectedClient?._id === client._id ? 'selected-client-row' : ''}
                        onClick={() => setSelectedClientId(client._id)}
                      >
                        <td className="client-code-col">
                          <Link to={`/clientes/${client.customerNumber}`} className="service-link" onClick={(event) => event.stopPropagation()}>
                            {client.customerNumber}
                          </Link>
                        </td>
                        <td className="client-name-cell">
                          <strong>{client.firstName || 'N/A'} {client.lastName || ''}</strong>
                          <span>{client.email || 'Sin email'}</span>
                        </td>
                        <td className="client-phone-col">{client.phone || 'N/A'}</td>
                        <td className="client-location-col">{[client.municipio, client.province].filter(Boolean).join(', ') || 'N/A'}</td>
                        <td className="client-requests-col">
                          {Array.isArray(client.serviceRequestNumbers) && client.serviceRequestNumbers.length > 0
                            ? client.serviceRequestNumbers.join(', ')
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <aside className="client-preview-panel">
                {selectedClient ? (
                  <>
                    <span>Detalle del cliente</span>
                    <h3>#{selectedClient.customerNumber}</h3>
                    <strong>{selectedClient.firstName} {selectedClient.lastName}</strong>
                    <div className="client-preview-actions">
                      <Link to={`/clientes/${selectedClient.customerNumber}`}>Editar cliente</Link>
                      <Link to="/servicios/nuevo">Nuevo servicio</Link>
                    </div>
                    <dl>
                      <div><dt>Telefono</dt><dd>{selectedClient.phone || 'N/A'}</dd></div>
                      <div><dt>Email</dt><dd>{selectedClient.email || 'N/A'}</dd></div>
                      <div><dt>Ubicacion</dt><dd>{[selectedClient.municipio, selectedClient.province].filter(Boolean).join(', ') || 'N/A'}</dd></div>
                      <div><dt>Domicilio</dt><dd>{selectedClient.domicilio || 'N/A'}</dd></div>
                      <div><dt>Solicitudes</dt><dd>{selectedClient.serviceRequestNumbers?.length || 0}</dd></div>
                    </dl>
                  </>
                ) : (
                  <p>Selecciona un cliente para ver su detalle.</p>
                )}
              </aside>
            </div>

            {isAdmin && totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="page-btn"
                >
                  ◀
                </button>

                {(() => {
                  const visiblePages = 5
                  const pages = []
                  let startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2))
                  let endPage = Math.min(totalPages, startPage + visiblePages - 1)

                  if (endPage - startPage < visiblePages - 1) {
                    startPage = Math.max(1, endPage - visiblePages + 1)
                  }

                  if (startPage > 1) {
                    pages.push(
                      <button key={1} className="page-btn" onClick={() => setCurrentPage(1)}>1</button>,
                      <span key="start-dots" className="page-dots">...</span>
                    )
                  }

                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(
                      <button
                        key={i}
                        className={`page-btn ${currentPage === i ? 'active' : ''}`}
                        onClick={() => setCurrentPage(i)}
                      >
                        {i}
                      </button>
                    )
                  }

                  if (endPage < totalPages) {
                    pages.push(
                      <span key="end-dots" className="page-dots">...</span>,
                      <button key={totalPages} className="page-btn" onClick={() => setCurrentPage(totalPages)}>{totalPages}</button>
                    )
                  }

                  return pages
                })()}

                <button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="page-btn"
                >
                  ▶
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

export default Clients

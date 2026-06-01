import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { getApiUrl } from '../../config'
import { Link, useLocation } from 'react-router-dom'
import DashboardLayout from '../DashboardLayout/DashboardLayout'
import Loading from '../Loading/Loading'
import './Cotizaciones.css'

const Cotizaciones = () => {
  const [quotes, setQuotes] = useState([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortConfig, setSortConfig] = useState({ key: 'serviceRequestNumber', direction: 'desc' })
  const [itemsPerPage, setItemsPerPage] = useState(25)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')

  const location = useLocation()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    setStatusFilter(params.get('status') || '')
    setCurrentPage(1)
  }, [location.search])

  useEffect(() => {
  const fetchQuotes = async () => {
    try {
      const res = await axios.get(`${getApiUrl()}/api/quotes`) //axios.get(`http://localhost:5000/api/quotes`)
      setQuotes(res.data)
    } catch (err) {
      setError('Error al obtener las cotizaciones')
    } finally {
      setLoading(false)
    }
  }
  fetchQuotes()
}, [])


  const handleStatusChange = async (srn, status) => {
    try {
      await axios.put(`${getApiUrl()}/api/quotes/${srn}`, { status })
      setQuotes(prev =>
        prev.map(q =>
          q.serviceRequestNumber === srn ? { ...q, status } : q
        )
      )
    } catch {
      setError('Error al cambiar el estado')
    }
  }

  const handleReviewUpdate = async (srn, newReview) => {
    try {
      await axios.put(`${getApiUrl()}/api/quotes/${srn}`, { review: newReview })
      setQuotes(prev =>
        prev.map(q =>
          q.serviceRequestNumber === srn ? { ...q, review: newReview } : q
        )
      )
    } catch {
      setError('Error al actualizar la revisión')
    }
  }

  const filteredQuotes = quotes.filter(q => {
    const term = search.trim().toLowerCase()
    const fullDevice = [q.category?.name, q.brand, q.model].filter(Boolean).join(' ').toLowerCase()
    const matchesSearch =
      !term ||
      q.serviceRequestNumber?.toString().includes(term) ||
      q.customerNumber?.toString().includes(term) ||
      `${q.userData?.firstName || ''} ${q.userData?.lastName || ''}`.toLowerCase().includes(term) ||
      fullDevice.includes(term)
    const matchesStatus = !statusFilter || q.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const sortedQuotes = [...filteredQuotes].sort((a, b) => {
    const { key, direction } = sortConfig
    let aVal = key === 'category' ? a.category?.name : a[key]
    let bVal = key === 'category' ? b.category?.name : b[key]

    if (typeof aVal === 'string') aVal = aVal.toLowerCase()
    if (typeof bVal === 'string') bVal = bVal.toLowerCase()

    if (aVal < bVal) return direction === 'asc' ? -1 : 1
    if (aVal > bVal) return direction === 'asc' ? 1 : -1
    return 0
  })

  const totalPages = Math.ceil(sortedQuotes.length / itemsPerPage)
  const paginatedQuotes = sortedQuotes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return '⇅'
    return sortConfig.direction === 'asc' ? '↑' : '↓'
  }

  const generateWhatsAppLink = (q) => {
  const phone = (q.userData?.phone || '').toString().replace(/\D/g, '')
  const name = q.userData?.firstName || 'cliente'
  const equipo = q.category?.name || 'equipo'
  const solicitud = q.serviceRequestNumber || ''
  const message = `Hola, ${name}! Nos comunicamos del equipo de logística Electrosafe. Recibimos tu solicitud de cotización (Nº ${solicitud}) por tu ${equipo} y quería comentarte las opciones y promociones que tenemos disponibles para la reparación.`;
    return `https://wa.me/54${phone}?text=${encodeURIComponent(message)}`;
  }


  return (
    <DashboardLayout>
      <div className="dashboard-wrapper cotizaciones-page">
        <h2 className="dashboard-title">Solicitud de Cotizaciones</h2>

        {loading ? (
          <div className="loading-container">
            <Loading />
          </div>
        ) : (
          <>
          <div className="quotes-filter-panel">
            <label>
              <span>Busqueda</span>
              <input
                type="text"
                placeholder="Solicitud, cliente o equipo..."
                className="search-input"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setCurrentPage(1)
                }}
              />
            </label>
            <label>
              <span>Estado</span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setCurrentPage(1)
                }}
              >
                <option value="">Todos</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Respondido">Respondido</option>
                <option value="No Respondido">No Respondido</option>
                <option value="Datos incorrectos">Datos incorrectos</option>
                <option value="Rechazada">Rechazada</option>
              </select>
            </label>
            <button
              type="button"
              onClick={() => {
                setSearch('')
                setStatusFilter('')
                setCurrentPage(1)
              }}
              disabled={!search && !statusFilter}
            >
              Limpiar
            </button>
          </div>

          {error && <p className="error-message">{error}</p>}

          <div className="quotes-items">
            <label>Mostrar </label>
            <select
              value={itemsPerPage}
              onChange={e => {
                setItemsPerPage(Number(e.target.value))
                setCurrentPage(1)
              }}
            >
              {[10, 25, 50, 100].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <label> registros</label>
          </div>

          <div className="table-wrapper">
            <table className="quotes-table">
              <thead className="table-head">
                <tr>
                  <th style={{ width: '6%' }} onClick={() => handleSort('serviceRequestNumber')}>
                    N° Solicitud {renderSortIcon('serviceRequestNumber')}
                  </th>
                  <th style={{ width: '6%' }} onClick={() => handleSort('customerNumber')}>
                    N° Cliente {renderSortIcon('customerNumber')}
                  </th>
                  <th style={{ width: '8%' }} onClick={() => handleSort('date')}>
                    Fecha {renderSortIcon('date')}
                  </th>
                  <th style={{ width: '18%' }} onClick={() => handleSort('category')}>
                    Equipo {renderSortIcon('category')}
                  </th>
                  <th style={{ width: '18%' }} onClick={() => handleSort('userData.additionalDetails')}>
                    Descripción {renderSortIcon('userData.additionalDetails')}
                  </th>
                  <th style={{ width: '8%' }} onClick={() => handleSort('faults')}>
                    Fallas {renderSortIcon('faults')}
                  </th>
                  <th style={{ width: '6%' }} onClick={() => handleSort('branch')}>
                    Sucursal {renderSortIcon('branch')}
                  </th>
                  <th style={{ width: '8%' }} onClick={() => handleSort('userData.municipio')}>
                    Ubicación {renderSortIcon('userData.municipio')}
                  </th>
                  <th style={{ width: '7%' }}>Estado</th>
                  <th style={{ width: '10%' }}>Revisión</th>
                  <th style={{ width: '5%' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedQuotes.map((q) => {
                  const getStatusClass = (status) => {
                    switch (status) {
                      case 'Pendiente': return 'cell-pendiente'
                      case 'Respondido': return 'cell-respondido'
                      case 'No Respondido': return 'cell-norespondido'
                      case 'Datos incorrectos': return 'cell-rechazada'
                      case 'Rechazada': return 'cell-rechazada'
                      default: return ''
                    }
                  }
                  return (
                    <tr key={`${q.serviceRequestNumber}-${q.customerNumber}`}>
                      <td>
                        <Link to={`/cotizaciones/${q.serviceRequestNumber}`} className="service-link">
                          {q.serviceRequestNumber}
                        </Link>
                      </td>
                      <td>
                        <Link to={`/clientes/${q.customerNumber}`} className="service-link">
                          {q.customerNumber}
                        </Link>
                      </td>
                      <td>{new Date(q.date).toLocaleDateString()}</td>
                      <td className="quotes-equipo">
                        {[q.category?.name, q.brand, q.model].filter(Boolean).join(' ') || 'N/A'}
                      </td>
                      <td className="quotes-details">{q.userData?.additionalDetails || 'N/A'}</td>
                      <td>{q.faults?.join(', ') || 'N/A'}</td>
                      <td>{q.branch || 'N/A'}</td>
                      <td>{q.userData?.municipio ? `${q.userData.municipio}, ${q.userData.province}` : 'N/A'}</td>
                      <td className={`quotes-status ${getStatusClass(q.status)}`}>
                        <select
                          className="status-select"
                          value={q.status}
                          onChange={(e) => handleStatusChange(q.serviceRequestNumber, e.target.value)}
                        >
                          {[
                            'Pendiente',
                            'Respondido',
                            'No Respondido',
                            'Datos incorrectos',
                            'Rechazada',
                          ].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td className="quotes-review">
                        <textarea
                          className="review-textarea"
                          defaultValue={q.review || ''}
                          onBlur={(e) => handleReviewUpdate(q.serviceRequestNumber, e.target.value)}
                        />
                      </td>
                      <td>
                        {q.userData?.phone && (
                          <a
                            href={generateWhatsAppLink(q)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="whatsapp-btn"
                          >
                            <img src="/images/whatsappLogo.svg" alt="Logotipo de WhatsApp" id='contact-whatsapp-cotizaciones' />
                          </a>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="page-btn">◀</button>
              {(() => {
                const pages = []
                const visiblePages = 5
                const startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2))
                const endPage = Math.min(totalPages - 1, startPage + visiblePages - 1)

                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <button key={i} className={`page-btn ${currentPage === i ? 'active' : ''}`} onClick={() => setCurrentPage(i)}>
                      {i}
                    </button>
                  )
                }

                if (startPage > 1) {
                  pages.unshift(<span key="start-dots" className="page-dots">...</span>)
                  pages.unshift(<button key={1} className={`page-btn ${currentPage === 1 ? 'active' : ''}`} onClick={() => setCurrentPage(1)}>1</button>)
                }

                if (endPage < totalPages - 1) {
                  pages.push(<span key="end-dots" className="page-dots">...</span>)
                }

                if (endPage < totalPages) {
                  pages.push(<button key={totalPages} className={`page-btn ${currentPage === totalPages ? 'active' : ''}`} onClick={() => setCurrentPage(totalPages)}>{totalPages}</button>)
                }

                return pages
              })()}
              <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="page-btn">▶</button>
            </div>
          )}
        </>
      )}
      </div>
    </DashboardLayout>
  )
}

export default Cotizaciones


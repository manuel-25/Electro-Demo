import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import './DemoAnalytics.css'
import { getApiUrl } from '../../config.js'

const formatDateTime = (value) => {
  if (!value) return '-'
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value))
}

const eventLabel = {
  session_start: 'Ingreso',
  page_view: 'Vista',
  ui_action: 'Accion',
  api_mutation: 'Cambio',
  api_error: 'Error'
}

const RECENT_EVENTS_PAGE_SIZES = [10, 25, 50]

const maskEmail = (email = '') => {
  const [local, domain] = String(email).split('@')
  if (!local || !domain) return '-'
  const visible = local.slice(-4)
  const hidden = '*'.repeat(Math.max(local.length - visible.length, 6))
  return `${hidden}${visible}@${domain}`
}

export default function DemoAnalytics() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [recentEventsPage, setRecentEventsPage] = useState(1)
  const [recentEventsPageSize, setRecentEventsPageSize] = useState(10)

  useEffect(() => {
    const loadSummary = async () => {
      const response = await axios.get(`${getApiUrl()}/api/demo/summary`)
      setSummary(response.data)
      setLoading(false)
    }

    loadSummary().catch(() => setLoading(false))
  }, [])

  const activeVisitors = useMemo(() => {
    if (!summary?.recentVisitors) return 0
    const lastHour = Date.now() - 60 * 60 * 1000
    return summary.recentVisitors.filter(visitor => new Date(visitor.lastSeenAt).getTime() >= lastHour).length
  }, [summary])

  const conversionToAction = useMemo(() => {
    const pageViews = summary?.eventTypeBreakdown?.find(item => item._id === 'page_view')?.total || 0
    const mutations = summary?.eventTypeBreakdown?.find(item => item._id === 'api_mutation')?.total || 0
    if (!pageViews) return 0
    return Math.round((mutations / pageViews) * 100)
  }, [summary])

  const recentEvents = summary?.recentEvents || []
  const recentEventsTotalPages = Math.max(
    1,
    Math.ceil(recentEvents.length / recentEventsPageSize)
  )
  const paginatedRecentEvents = recentEvents.slice(
    (recentEventsPage - 1) * recentEventsPageSize,
    recentEventsPage * recentEventsPageSize
  )

  useEffect(() => {
    setRecentEventsPage(1)
  }, [recentEventsPageSize, summary])

  useEffect(() => {
    if (recentEventsPage > recentEventsTotalPages) {
      setRecentEventsPage(recentEventsTotalPages)
    }
  }, [recentEventsPage, recentEventsTotalPages])

  if (loading) {
    return <main className="demo-analytics-page">Cargando actividad demo...</main>
  }

  return (
    <main className="demo-analytics-page">
      <section className="demo-analytics-hero">
        <div>
          <span>Observabilidad de portfolio</span>
          <h1>Actividad de la demo</h1>
        </div>
        <div className="demo-analytics-kpis">
          <article>
            <span>Visitantes</span>
            <strong>{summary?.visitorCount || 0}</strong>
          </article>
          <article>
            <span>Eventos</span>
            <strong>{summary?.eventCount || 0}</strong>
          </article>
          <article>
            <span>Activos 1h</span>
            <strong>{activeVisitors}</strong>
          </article>
          <article>
            <span>Conversion accion</span>
            <strong>{conversionToAction}%</strong>
          </article>
        </div>
      </section>

      <section className="demo-analytics-card demo-performance-card">
        <header>
          <h2>Actividad agrupada por usuario</h2>
          <span>Lectura agregada, sin exponer emails completos</span>
        </header>
        <div className="demo-events-table-wrap">
          <table className="demo-events-table demo-performance-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Eventos</th>
                <th>Vistas</th>
                <th>Cambios</th>
                <th>Errores</th>
                <th>Visitas</th>
                <th>Origen</th>
                <th>Ultima actividad</th>
                <th>Ultima ruta</th>
              </tr>
            </thead>
            <tbody>
              {summary?.activityByEmail?.map(row => (
                <tr key={row._id}>
                  <td className="demo-email-cell">{maskEmail(row._id)}</td>
                  <td><strong>{row.events}</strong></td>
                  <td>{row.pageViews}</td>
                  <td>{row.mutations}</td>
                  <td className={row.errors ? 'demo-error-cell' : ''}>{row.errors}</td>
                  <td>{row.visitCount}</td>
                  <td>{row.city || row.country || 'Local/no detectado'}</td>
                  <td>{formatDateTime(row.lastSeenAt)}</td>
                  <td className="demo-path-cell">{row.lastPath || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="demo-analytics-grid demo-analytics-grid-three">
        <article className="demo-analytics-card">
          <header>
            <h2>Visitantes recientes</h2>
            <span>Origen y ultima actividad</span>
          </header>
          <div className="demo-analytics-list">
            {summary?.recentVisitors?.map(visitor => (
              <div className="demo-visitor-row" key={visitor.sessionId}>
                <strong>{maskEmail(visitor.email)}</strong>
                <span>{visitor.meta?.city || visitor.meta?.country || 'Origen local/no detectado'}</span>
                <small>{formatDateTime(visitor.lastSeenAt)} - {visitor.visitCount} visitas</small>
              </div>
            ))}
          </div>
        </article>

        <article className="demo-analytics-card">
          <header>
            <h2>Paginas mas vistas</h2>
            <span>Interes real dentro del flujo</span>
          </header>
          <div className="demo-page-list">
            {summary?.topPages?.map(page => (
              <div className="demo-page-row" key={page._id || 'home'}>
                <span>{page._id || '/'}</span>
                <strong>{page.views}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="demo-analytics-card">
          <header>
            <h2>Tipos de evento</h2>
            <span>Distribucion de comportamiento</span>
          </header>
          <div className="demo-page-list">
            {summary?.eventTypeBreakdown?.map(item => (
              <div className="demo-page-row" key={item._id}>
                <span>{eventLabel[item._id] || item._id}</span>
                <strong>{item.total}</strong>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="demo-analytics-card demo-actions-card">
        <header>
          <h2>Acciones principales</h2>
          <span>Interacciones mas repetidas, agrupadas para evitar ruido</span>
        </header>
        <div className="demo-events-table-wrap">
          <table className="demo-events-table">
            <thead>
              <tr>
                <th>Accion</th>
                <th>Eventos</th>
                <th>Ultima vez</th>
              </tr>
            </thead>
            <tbody>
              {summary?.topActions?.map(action => (
                <tr key={action._id}>
                  <td>{action._id}</td>
                  <td><strong>{action.total}</strong></td>
                  <td>{formatDateTime(action.lastSeenAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="demo-analytics-card">
        <header>
          <div>
            <h2>Ultimas acciones</h2>
            <span>Detalle acotado para debugging rapido</span>
          </div>
          <div className="demo-table-controls">
            <label>
              Mostrar
              <select
                value={recentEventsPageSize}
                onChange={(event) => setRecentEventsPageSize(Number(event.target.value))}
              >
                {RECENT_EVENTS_PAGE_SIZES.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </label>
            <span>
              {recentEvents.length
                ? `${(recentEventsPage - 1) * recentEventsPageSize + 1}-${Math.min(recentEventsPage * recentEventsPageSize, recentEvents.length)} de ${recentEvents.length}`
                : '0 eventos'}
            </span>
          </div>
        </header>
        <div className="demo-events-table-wrap">
          <table className="demo-events-table">
            <thead>
              <tr>
                <th>Hora</th>
                <th>Usuario</th>
                <th>Tipo</th>
                <th>Accion</th>
                <th>Ruta</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRecentEvents.map(event => (
                <tr key={event._id}>
                  <td>{formatDateTime(event.createdAt)}</td>
                  <td className="demo-email-cell">{maskEmail(event.email)}</td>
                  <td><span className={`demo-event-pill demo-event-${event.type}`}>{eventLabel[event.type] || event.type}</span></td>
                  <td>{event.name}</td>
                  <td className="demo-path-cell">{event.path || '-'}</td>
                  <td>{event.statusCode || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="demo-pagination">
          <button
            type="button"
            disabled={recentEventsPage === 1}
            onClick={() => setRecentEventsPage(page => Math.max(1, page - 1))}
          >
            Anterior
          </button>
          <strong>Pagina {recentEventsPage} de {recentEventsTotalPages}</strong>
          <button
            type="button"
            disabled={recentEventsPage === recentEventsTotalPages}
            onClick={() => setRecentEventsPage(page => Math.min(recentEventsTotalPages, page + 1))}
          >
            Siguiente
          </button>
        </div>
      </section>
    </main>
  )
}

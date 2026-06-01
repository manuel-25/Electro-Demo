import React from 'react'
import './ServiceFilters.css'

const SERVICE_STATUSES = [
  'Pendiente',
  'Recibido',
  'En Gestión',
  'Reparación',
  'Listo para retirar',
  'Entregado',
  'En Gestión Garantía',
  'Reparación Garantía',
  'Listo para retirar Garantía',
  'Armado S/R',
  'Listo para retiro S/R',
  'Entregado S/R',
  'Sin respuesta',
  'Retirado a bodega'
]

const uniqueValues = (items, key) =>
  [...new Set(items.map(item => item[key]).filter(Boolean))]

const getServiceMonths = services =>
  [...new Set(
    services
      .map(service => service.createdAt && new Date(service.createdAt).toISOString().slice(0, 7))
      .filter(Boolean)
  )].sort().reverse()

const ServiceFilters = ({
  services,
  filters,
  search = '',
  onSearchChange,
  onSearchClear,
  onChange,
  onClear
}) => {
  const months = getServiceMonths(services)
  const activeCount = Object.values(filters).filter(Boolean).length

  return (
    <div className="filters-wrapper">
      <div className="filters-header">
        <div>
          <span>Filtros</span>
          <strong>{activeCount ? `${activeCount} activos` : 'Vista completa'}</strong>
        </div>
        <button type="button" onClick={onClear} disabled={!activeCount}>
          Limpiar
        </button>
      </div>

      <div className="filters-grid">
        {onSearchChange && (
          <label className="filter-field filter-search-field">
            <span>Búsqueda</span>
            <div className="filter-search-box">
              <input
                type="text"
                placeholder="Código, cliente o equipo..."
                value={search}
                onChange={e => onSearchChange(e.target.value)}
              />
              {search && (
                <button type="button" onClick={onSearchClear} title="Borrar búsqueda">
                  x
                </button>
              )}
            </div>
          </label>
        )}

        <label className="filter-field">
          <span>Código</span>
          <select
            value={filters.code}
            onChange={e => onChange('code', e.target.value)}
            className={`filter-select ${filters.code ? 'active' : ''}`}
          >
            <option value="">Todos</option>
            {['Q', 'B', 'W'].map(code => (
              <option key={code} value={code}>{code}</option>
            ))}
          </select>
        </label>

        <label className="filter-field">
          <span>Sucursal</span>
          <select
            value={filters.branch}
            onChange={e => onChange('branch', e.target.value)}
            className={`filter-select ${filters.branch ? 'active' : ''}`}
          >
            <option value="">Todas</option>
            <option value="null">No recibido</option>
            {['Quilmes', 'Barracas'].map(branch => (
              <option key={branch} value={branch}>{branch}</option>
            ))}
          </select>
        </label>

        <label className="filter-field">
          <span>Responsable</span>
          <select
            value={filters.createdBy}
            onChange={e => onChange('createdBy', e.target.value)}
            className={`filter-select ${filters.createdBy ? 'active' : ''}`}
          >
            <option value="">Todos</option>
            {uniqueValues(services, 'createdByEmail').map(email => (
              <option key={email} value={email}>{email}</option>
            ))}
          </select>
        </label>

        <label className="filter-field">
          <span>Equipo</span>
          <select
            value={filters.equipment}
            onChange={e => onChange('equipment', e.target.value)}
            className={`filter-select ${filters.equipment ? 'active' : ''}`}
          >
            <option value="">Todos</option>
            {uniqueValues(services, 'equipmentType').map(eq => (
              <option key={eq} value={eq}>{eq}</option>
            ))}
          </select>
        </label>

        <label className="filter-field">
          <span>Mes</span>
          <select
            value={filters.month}
            onChange={e => onChange('month', e.target.value)}
            className={`filter-select ${filters.month ? 'active' : ''}`}
          >
            <option value="">Todos</option>
            {months.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
        </label>

        <label className="filter-field">
          <span>Estado</span>
          <select
            value={filters.status}
            onChange={e => onChange('status', e.target.value)}
            className={`filter-select ${filters.status ? 'active' : ''}`}
          >
            <option value="">Todos</option>
            {SERVICE_STATUSES.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </label>
      </div>
    </div>
  )
}

export default ServiceFilters

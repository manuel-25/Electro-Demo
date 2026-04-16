import React from 'react'
import './DataTable.css'

const DataTable = ({
  columns = [],
  data = [],
  sortConfig,
  onSort,
  renderRow,
  currentPage,
  totalPages,
  onPageChange
}) => {

  const renderSortIcon = (key) => {
    if (!sortConfig || sortConfig.key !== key) return '⇅'
    return sortConfig.direction === 'asc' ? '↑' : '↓'
  }

  return (
    <div className="table-wrapper">
      <table className="styled-table">
        <thead className="table-head">
          <tr>
            {columns.map(col => (
              <th
                key={col.key}
                style={{ width: col.width }}
                onClick={() => col.sortable && onSort(col.key)}
              >
                {col.label} {col.sortable && renderSortIcon(col.key)}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map(item => renderRow(item))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
              onClick={() => onPageChange(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default DataTable
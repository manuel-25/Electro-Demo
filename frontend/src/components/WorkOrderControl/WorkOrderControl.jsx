import React from 'react'
import axios from 'axios'
import { getApiUrl } from '../../config'
import { formatDate, timeSince } from '../../utils/formatDate'
import './WorkOrderControl.css'

export const normalizeClass = (text = '') =>
  text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

const WorkOrderControl = ({ service, onUpdate }) => {

  const handleChange = async (newStatus) => {
    try {
        const res = await axios.patch(
        `${getApiUrl()}/api/service/${service._id}/workorder`,
        { newStatus },
        { withCredentials: true }
        )

        const updated = res.data

        // 🔥 REGLAS AUTOMÁTICAS DE FLUJO
        if (service.status === "Recibido") {
        if (newStatus === "Enviada") {
            updated.status = "En Gestión"
        }

        if (newStatus === "Aceptada") {
            updated.status = "Reparación"
        }

        if (newStatus === "Rechazada") {
            updated.status = "Armado S/R"
        }
        }

        if (onUpdate) onUpdate(updated)

    } catch (err) {
        const msg = err.response?.data?.error || 'Error actualizando orden de trabajo'
        alert(msg)
    }
}

  if (!service || service.workOrderStatus === undefined) {
    return <span>—</span>
  }

  const status = service.workOrderStatus

  // SOLO estados editables como select
    if (["Sin presupuesto", "Sin reparación"].includes(status)) {
    return (
        <select
        className={`wo-select ${normalizeClass(status)}`}
        value={status}
        onChange={e => handleChange(e.target.value)}
        >
        <option>Sin presupuesto</option>
        <option>Lista para enviar</option>
        <option>Sin reparación</option>
        </select>
    )
    }

  // ================= LISTA PARA ENVIAR → BOTON =================
  if (status === "Lista para enviar") {
    return (
      <button
        className="wo-btn send"
        onClick={() => handleChange("Enviada")}
      >
        Enviar
      </button>
    )
  }

  // ================= ENVIADA =================
  if (status === "Enviada") {
    return (
      <div className="wo-sent-container">

        <div className="wo-sent-label">
          📤 Enviado {formatDate(service.workOrderSentAt, true)}
        </div>

        {service.workOrderSentAt && (
          <div className="wo-waiting">
            ⏱ Esperando respuesta {timeSince(service.workOrderSentAt)}
          </div>
        )}

        <div className="wo-action-buttons">
          <button
            className="wo-btn accept"
            onClick={() => handleChange("Aceptada")}
          >
            Autoriza ✔
          </button>

          <button
            className="wo-btn reject"
            onClick={() => handleChange("Rechazada")}
          >
            Rechaza ✖
          </button>
        </div>

      </div>
    )
  }

  // ================= ACEPTADA =================
  if (status === "Aceptada") {
    return (
      <div className="wo-status-box aceptada">

        <div className="wo-status-info">
          <div>Autorizado</div>

          {service.workOrderAnsweredAt && (
            <div className="wo-date">
              {formatDate(service.workOrderAnsweredAt, true)}
            </div>
          )}
        </div>

        <button
          className="wo-btn reject"
          onClick={() => handleChange("Rechazada")}
        >
          Cambiar
        </button>

      </div>
    )
  }

  // ================= RECHAZADA =================
  if (status === "Rechazada") {
    return (
      <div className="wo-status-box rechazada">

        <div className="wo-status-info">
          <div>Rechazada</div>

          {service.workOrderAnsweredAt && (
            <div className="wo-date">
              {formatDate(service.workOrderAnsweredAt, true)}
            </div>
          )}
        </div>

        <button
          className="wo-btn accept"
          onClick={() => handleChange("Aceptada")}
        >
          Autorizar
        </button>

      </div>
    )
  }

  return <span>{status}</span>
}

export default WorkOrderControl
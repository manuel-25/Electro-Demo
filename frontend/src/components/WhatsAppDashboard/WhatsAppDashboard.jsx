import { useEffect, useState, useContext, useMemo } from 'react';
import axios from 'axios';
import DashboardLayout from '../DashboardLayout/DashboardLayout';
import { getApiUrl } from '../../config';
import { AuthContext } from '../../Context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faHandPaper, faCheck } from '@fortawesome/free-solid-svg-icons';
import './WhatsAppDashboard.css';

function WhatsAppDashboard() {
  const { auth } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);

  // =========================
  // FORMAT TIEMPO
  // =========================
  const formatDuration = (minutes) => {
    if (!minutes || minutes < 0) return '-';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h${m}m`;
  };

  const getWaitingMinutes = (date) => {
    if (!date) return 0;
    const diff = Date.now() - new Date(date).getTime();
    return Math.floor(diff / 60000);
  };

  const getWaitOrWaitedTime = (conv) => {
    if (!conv.humanRequestedAt) return '-';

    // 🔴 PRIORITY o 🟡 WAITING → sigue esperando
    if (conv.status === 'waiting' || conv.status === 'priority') {
      const minutes = getWaitingMinutes(conv.humanRequestedAt);
      return formatDuration(minutes);
    }

    // ⚪ EN GESTIÓN o ✅ FINALIZADO → cuánto esperó
    if (
      (conv.status === 'in_progress' || conv.status === 'resolved') &&
      conv.firstResponseAt
    ) {
      const minutes = Math.floor(
        (new Date(conv.firstResponseAt).getTime() - new Date(conv.humanRequestedAt).getTime()) /
          60000
      );
      return formatDuration(minutes);
    }

    return '-';
  };

  // =========================
  // CLASE DE FILA
  // =========================
  const getPriorityClass = (conv) => {
    if (conv.status === 'in_progress') return 'in-progress-row';
    if (conv.status === 'priority') return 'critical-row';
    if (conv.status === 'waiting') return 'pending-row';
    if (conv.status === 'resolved') return 'resolved-row';
    return '';
  };

  // =========================
  // FETCH
  // =========================
  const fetchConversations = async () => {
    if (!auth) return;
    try {
      const res = await axios.get(`${getApiUrl()}/api/conversations`, { withCredentials: true });
      setConversations(res.data || []);
    } catch (err) {
      console.error('❌ Error cargando conversaciones', err);
    }
  };

  useEffect(() => {
    if (!auth) return;
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, [auth]);

  // =========================
  // ORDENAMIENTO INTELIGENTE
  // =========================
  const sortedConversations = useMemo(() => {
    return [...conversations].sort((a, b) => {
      const order = {
        priority: 1,
        waiting: 2,
        in_progress: 3,
        resolved: 4
      };

      if (order[a.status] !== order[b.status]) {
        return order[a.status] - order[b.status];
      }

      // PRIORITY y WAITING → mayor tiempo esperando primero
      if (a.status === 'priority' || a.status === 'waiting') {
        return getWaitingMinutes(b.humanRequestedAt) - getWaitingMinutes(a.humanRequestedAt);
      }

      // EN GESTIÓN → más reciente arriba
      if (a.status === 'in_progress') {
        return new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0);
      }

      // RESUELTOS → más recientes arriba
      return new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0);
    });
  }, [conversations]);

  // =========================
  // ACCIONES
  // =========================
  const resolveConversation = async (phone) => {
    try {
      await axios.post(`${getApiUrl()}/api/conversations/${phone}/resolve`, {}, { withCredentials: true });
      fetchConversations();
    } catch (err) {
      console.error('❌ Error resolviendo conversación', err);
    }
  };

  const takeConversation = async (phone) => {
    try {
      await axios.post(`${getApiUrl()}/api/conversations/${phone}/take`, {}, { withCredentials: true });
      fetchConversations();
    } catch (err) {
      console.error('❌ Error tomando conversación', err);
    }
  };

  // =========================
  // TABLA
  // =========================
  const renderTable = (data, type) => (
    <div className="whatsapp-card">
      <div className="table-responsive">
        <table className="whatsapp-table">
          <thead>
            <tr>
              <th>Teléfono</th>
              <th>Último mensaje</th>
              <th>{type === 'waiting' || type === 'priority' ? 'Espera' : 'Esperó'}</th>
              <th>No leídos</th>
              <th>Estado</th>
              <th>Asignado a</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr>
                <td colSpan="7" className="empty-row">No hay conversaciones</td>
              </tr>
            )}

            {data.map(conv => {
              const cleanPhone = conv.phone?.replace('@c.us', '') || '';
              const waPhone = cleanPhone.replace(/\D/g, '');

              let assignedDisplay = '-';
              if (conv.status === 'in_progress' && conv.assignedTo) {
                assignedDisplay = conv.assignedTo.split('@')[0];
              } else if (conv.lastAssignedTo) {
                assignedDisplay = `Última vez: ${conv.lastAssignedTo.split('@')[0]}`;
              }

              const rowClass = getPriorityClass(conv);

              return (
                <tr key={cleanPhone} className={rowClass}>
                  <td>
                    {cleanPhone}
                    {conv.contactName && <div className="contact-name">{conv.contactName}</div>}
                  </td>

                  <td className="last-message">{conv.lastCustomerMessage || '-'}</td>

                  <td>{getWaitOrWaitedTime(conv)}</td>

                  <td>{conv.unreadCount > 0
                      ? <span className="unread-badge">{conv.unreadCount}</span>
                      : '0'}</td>

                  <td>
                    {conv.status === 'priority' && <span className="status critical">Prioridad</span>}
                    {conv.status === 'waiting' && <span className="status waiting">Esperando asesor</span>}
                    {conv.status === 'in_progress' && <span className="status in-progress">En gestión</span>}
                    {conv.status === 'resolved' && <span className="status resolved">Finalizado</span>}
                  </td>

                  <td>{assignedDisplay}</td>

                  <td className="wa-actions">
                    {(conv.status === 'waiting' || conv.status === 'priority') && (
                      <button className="icon-btn assign-btn" title="Tomar conversación" onClick={() => takeConversation(conv.phone)}>
                        <FontAwesomeIcon icon={faHandPaper} />
                      </button>
                    )}

                    {(conv.status === 'waiting' || conv.status === 'priority' || conv.status === 'in_progress') && (
                      <button className="icon-btn resolve-btn" title="Marcar como resuelto" onClick={() => resolveConversation(conv.phone)}>
                        <FontAwesomeIcon icon={faCheck} />
                      </button>
                    )}

                    <a href={`https://wa.me/${waPhone}`} target="_blank" rel="noopener noreferrer" className="icon-btn btn-whatsapp" title="Abrir en WhatsApp">
                      <FontAwesomeIcon icon={faWhatsapp} />
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  // =========================
  // RENDER
  // =========================
  return (
    <DashboardLayout>
      <div className="whatsapp-dashboard-wrapper">
        <div className="whatsapp-dashboard-container">
          <h2 className="dashboard-title">📱 WhatsApp Dashboard</h2>

          <h3>🔴 Prioridad</h3>
          {renderTable(sortedConversations.filter(c => c.status === 'priority'), 'priority')}

          <h3>🟡 Pendientes</h3>
          {renderTable(sortedConversations.filter(c => c.status === 'waiting'), 'waiting')}

          <h3>⚪ En gestión</h3>
          {renderTable(sortedConversations.filter(c => c.status === 'in_progress'), 'in_progress')}

          <h3>✅ Finalizados</h3>
          {renderTable(sortedConversations.filter(c => c.status === 'resolved'), 'resolved')}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default WhatsAppDashboard;
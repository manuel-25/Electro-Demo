import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import DashboardLayout from '../DashboardLayout/DashboardLayout'
import { getApiUrl } from '../../config'
import { AuthContext } from '../../Context/AuthContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons'
import { faCheck, faHandPaper, faPaperPlane, faRotateRight } from '@fortawesome/free-solid-svg-icons'
import {
  filterConversations,
  formatDuration,
  getCleanPhone,
  getDashboardCounts,
  getWaitLabel,
  getWaitingMinutes,
  getWhatsappUrl,
  sortConversations,
  statusConfig
} from './whatsappDashboardUtils'
import './WhatsAppDashboard.css'

const quickReplies = [
  'Hola, te escribe Electrosafe. Ya estoy revisando tu consulta.',
  'Gracias por escribirnos. Me pasas el codigo de servicio o el modelo del equipo?',
  'Te confirmo y te aviso por este medio apenas tenga novedades.'
]

function StatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.bot
  return <span className={`wa-status ${config.tone}`}>{config.label}</span>
}

function MessageBubble({ message }) {
  const side = message.sender === 'user' ? 'inbound' : 'outbound'
  return (
    <div className={`wa-message ${side}`}>
      <div>
        <p>{message.text || '-'}</p>
        <small>
          {message.sender} · {new Date(message.createdAt).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
          {message.status === 'failed' && ' · no enviado'}
        </small>
      </div>
    </div>
  )
}

function ConversationList({ conversations, selectedPhone, onSelect }) {
  if (!conversations.length) {
    return <div className="wa-empty-list">No hay conversaciones para este filtro.</div>
  }

  return (
    <div className="wa-conversation-list">
      {conversations.map(conversation => {
        const selected = selectedPhone === conversation.phone
        const wait = getWaitLabel(conversation)

        return (
          <button
            key={conversation.phone}
            className={`wa-conversation-item ${selected ? 'selected' : ''}`}
            onClick={() => onSelect(conversation.phone)}
          >
            <div className="wa-avatar">{(conversation.contactName || getCleanPhone(conversation.phone)).slice(0, 1).toUpperCase()}</div>
            <div className="wa-conversation-main">
              <div className="wa-row">
                <strong>{conversation.contactName || getCleanPhone(conversation.phone)}</strong>
                <StatusBadge status={conversation.status} />
              </div>
              <p>{conversation.lastCustomerMessage || conversation.lastMessage || 'Sin mensajes recientes'}</p>
              <small>Espera: {wait} · {conversation.assignedTo ? conversation.assignedTo.split('@')[0] : 'sin asignar'}</small>
            </div>
            {conversation.unreadCount > 0 && <span className="wa-unread">{conversation.unreadCount}</span>}
          </button>
        )
      })}
    </div>
  )
}

function ConversationPanel({
  selectedConversation,
  messages,
  capabilities,
  draft,
  sending,
  error,
  onDraftChange,
  onSend,
  onTake,
  onResolve
}) {
  if (!selectedConversation) {
    return (
      <section className="wa-chat-panel wa-empty-panel">
        <strong>Selecciona una conversacion</strong>
        <p>Desde aca vas a poder leer mensajes, tomar casos y responder cuando la integracion lo permita.</p>
      </section>
    )
  }

  const canTake = ['waiting', 'priority'].includes(selectedConversation.status)
  const canResolve = ['waiting', 'priority', 'in_progress'].includes(selectedConversation.status)

  return (
    <section className="wa-chat-panel">
      <header className="wa-chat-header">
        <div>
          <span>{getCleanPhone(selectedConversation.phone)}</span>
          <h2>{selectedConversation.contactName || 'Cliente WhatsApp'}</h2>
          <StatusBadge status={selectedConversation.status} />
        </div>
        <div className="wa-header-actions">
          {canTake && (
            <button onClick={() => onTake(selectedConversation.phone)} title="Tomar conversacion">
              <FontAwesomeIcon icon={faHandPaper} />
              Tomar
            </button>
          )}
          {canResolve && (
            <button onClick={() => onResolve(selectedConversation.phone)} title="Finalizar conversacion">
              <FontAwesomeIcon icon={faCheck} />
              Finalizar
            </button>
          )}
          <a href={getWhatsappUrl(selectedConversation.phone)} target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={faWhatsapp} />
            Abrir
          </a>
        </div>
      </header>

      <div className="wa-capability-strip">
        <strong>{capabilities?.freeFormAvailable ? 'Respuesta libre disponible' : 'Requiere plantilla'}</strong>
        <span>{capabilities?.limitation || 'Sin informacion de proveedor.'}</span>
      </div>

      <div className="wa-messages">
        {messages.length ? messages.map((message, index) => (
          <MessageBubble key={`${message.createdAt}-${index}`} message={message} />
        )) : (
          <p className="wa-no-messages">Todavia no hay mensajes guardados para esta conversacion.</p>
        )}
      </div>

      <footer className="wa-composer">
        <div className="wa-quick-replies">
          {quickReplies.map(reply => (
            <button key={reply} onClick={() => onDraftChange(reply)}>{reply}</button>
          ))}
        </div>
        {error && <div className="wa-send-error">{error}</div>}
        <form onSubmit={onSend}>
          <textarea
            value={draft}
            onChange={event => onDraftChange(event.target.value)}
            placeholder="Escribir respuesta..."
            rows={3}
          />
          <button type="submit" disabled={sending || !draft.trim()}>
            <FontAwesomeIcon icon={faPaperPlane} />
            {sending ? 'Enviando' : 'Enviar'}
          </button>
        </form>
      </footer>
    </section>
  )
}

function WhatsAppDashboard() {
  const { auth } = useContext(AuthContext)
  const [conversations, setConversations] = useState([])
  const [selectedPhone, setSelectedPhone] = useState('')
  const [messages, setMessages] = useState([])
  const [capabilities, setCapabilities] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const selectedConversation = conversations.find(conversation => conversation.phone === selectedPhone)
  const counts = useMemo(() => getDashboardCounts(conversations), [conversations])
  const visibleConversations = useMemo(() => {
    return filterConversations(sortConversations(conversations), { status: statusFilter, query })
  }, [conversations, statusFilter, query])

  const loadConversations = useCallback(async () => {
    if (!auth) return
    const response = await axios.get(`${getApiUrl()}/api/conversations`, { withCredentials: true })
    const list = response.data || []
    setConversations(list)
    setSelectedPhone(current => current || sortConversations(list)[0]?.phone || '')
  }, [auth])

  const loadMessages = useCallback(async (phone) => {
    if (!phone) return
    const response = await axios.get(`${getApiUrl()}/api/conversations/${encodeURIComponent(phone)}/messages`, { withCredentials: true })
    setMessages(response.data?.messages || [])
    setCapabilities(response.data?.capabilities || null)
  }, [])

  useEffect(() => {
    if (!auth) return
    setLoading(true)
    loadConversations()
      .catch(err => console.error('Error cargando conversaciones', err))
      .finally(() => setLoading(false))

    const interval = setInterval(() => {
      loadConversations().catch(() => {})
    }, 8000)
    return () => clearInterval(interval)
  }, [auth, loadConversations])

  useEffect(() => {
    loadMessages(selectedPhone).catch(err => console.error('Error cargando mensajes', err))
  }, [selectedPhone, loadMessages])

  const refreshAll = async () => {
    setLoading(true)
    await loadConversations()
    if (selectedPhone) await loadMessages(selectedPhone)
    setLoading(false)
  }

  const takeConversation = async (phone) => {
    await axios.post(`${getApiUrl()}/api/conversations/${encodeURIComponent(phone)}/take`, {}, { withCredentials: true })
    await refreshAll()
  }

  const resolveConversation = async (phone) => {
    await axios.post(`${getApiUrl()}/api/conversations/${encodeURIComponent(phone)}/resolve`, {}, { withCredentials: true })
    await refreshAll()
  }

  const sendMessage = async (event) => {
    event.preventDefault()
    if (!selectedPhone || !draft.trim()) return

    setSending(true)
    setError('')
    try {
      await axios.post(
        `${getApiUrl()}/api/conversations/${encodeURIComponent(selectedPhone)}/messages`,
        { text: draft },
        { withCredentials: true }
      )
      setDraft('')
      await refreshAll()
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo enviar el mensaje')
      if (err.response?.data?.conversation) {
        setMessages(err.response.data.conversation.messages || [])
        setCapabilities(err.response.data.capabilities || null)
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <DashboardLayout>
      <main className="whatsapp-workspace">
        <section className="wa-hero">
          <div>
            <span>Centro de conversaciones</span>
            <h1>WhatsApp Operativo</h1>
            <p>Gestiona conversaciones del bot, derivaciones a humano y respuestas desde una sola bandeja.</p>
          </div>
          <button onClick={refreshAll} disabled={loading}>
            <FontAwesomeIcon icon={faRotateRight} />
            Actualizar
          </button>
        </section>

        <section className="wa-kpis">
          <article><span>Total</span><strong>{counts.total}</strong></article>
          <article><span>Prioridad</span><strong>{counts.priority || 0}</strong></article>
          <article><span>Pendientes</span><strong>{counts.waiting || 0}</strong></article>
          <article><span>En gestion</span><strong>{counts.in_progress || 0}</strong></article>
          <article><span>No leidos</span><strong>{counts.unread}</strong></article>
        </section>

        <section className="wa-board">
          <aside className="wa-sidebar-panel">
            <div className="wa-filters">
              <input
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="Buscar telefono, cliente o mensaje..."
              />
              <select value={statusFilter} onChange={event => setStatusFilter(event.target.value)}>
                <option value="all">Todos los estados</option>
                <option value="priority">Prioridad</option>
                <option value="waiting">Pendientes</option>
                <option value="in_progress">En gestion</option>
                <option value="bot">Bot</option>
                <option value="resolved">Finalizados</option>
              </select>
            </div>
            <ConversationList
              conversations={visibleConversations}
              selectedPhone={selectedPhone}
              onSelect={setSelectedPhone}
            />
          </aside>

          <ConversationPanel
            selectedConversation={selectedConversation}
            messages={messages}
            capabilities={capabilities}
            draft={draft}
            sending={sending}
            error={error}
            onDraftChange={setDraft}
            onSend={sendMessage}
            onTake={takeConversation}
            onResolve={resolveConversation}
          />

          <aside className="wa-context-panel">
            <h3>Contexto API</h3>
            <div className="wa-context-item">
              <span>Proveedor</span>
              <strong>{capabilities?.provider || 'sin seleccionar'}</strong>
            </div>
            <div className="wa-context-item">
              <span>Ventana libre</span>
              <strong>{capabilities?.freeFormAvailable ? 'Disponible' : 'Limitada'}</strong>
            </div>
            <div className="wa-context-item">
              <span>Espera actual</span>
              <strong>{selectedConversation ? getWaitLabel(selectedConversation) : '-'}</strong>
            </div>
            <div className="wa-context-item">
              <span>Tiempo desde ultimo cliente</span>
              <strong>{selectedConversation?.lastCustomerMessageAt ? formatDuration(getWaitingMinutes(selectedConversation.lastCustomerMessageAt)) : '-'}</strong>
            </div>
            <p className="wa-context-note">
              En Cloud API, fuera de la ventana de atencion se debe iniciar con una plantilla aprobada. Esta UI ya deja visible esa restriccion para evitar errores operativos.
            </p>
          </aside>
        </section>
      </main>
    </DashboardLayout>
  )
}

export default WhatsAppDashboard

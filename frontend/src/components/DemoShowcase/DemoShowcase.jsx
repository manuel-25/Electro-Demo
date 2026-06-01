import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowRight,
  faBell,
  faBoxArchive,
  faChartLine,
  faCheck,
  faChevronRight,
  faClock,
  faFileInvoiceDollar,
  faFilter,
  faGaugeHigh,
  faMagnifyingGlass,
  faMobileScreen,
  faPenToSquare,
  faPlus,
  faPrint,
  faReceipt,
  faScrewdriverWrench,
  faUserGroup
} from '@fortawesome/free-solid-svg-icons'
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons'
import './DemoShowcase.css'

const services = [
  {
    id: 'svc-1048',
    code: 'Q-1048',
    client: 'Marina Duarte',
    customerNumber: 'CL-238',
    phone: '11 4028-7712',
    device: 'Samsung Galaxy A54',
    category: 'Celular',
    issue: 'Modulo roto, no responde tactil',
    status: 'En revision',
    branch: 'Quilmes',
    createdBy: 'recepcion@electrosafe.demo',
    createdAt: '2026-05-21',
    quote: '$84.500',
    paid: '$0',
    nextAction: 'Enviar diagnostico',
    inactivity: '3 h',
    workOrder: 'Pendiente firma',
    warranty: '90 dias',
    notes: 'Cliente necesita retiro antes del viernes.'
  },
  {
    id: 'svc-1047',
    code: 'Q-1047',
    client: 'Carlos Medina',
    customerNumber: 'CL-237',
    phone: '11 3849-2291',
    device: 'Notebook Lenovo IdeaPad 3',
    category: 'Notebook',
    issue: 'No carga bateria',
    status: 'Presupuestado',
    branch: 'Bernal',
    createdBy: 'soporte@electrosafe.demo',
    createdAt: '2026-05-20',
    quote: '$132.000',
    paid: '$20.000',
    nextAction: 'Esperar aprobacion',
    inactivity: '1 d',
    workOrder: 'Firmada',
    warranty: '60 dias',
    notes: 'Se detecto pin de carga danado.'
  },
  {
    id: 'svc-1046',
    code: 'Q-1046',
    client: 'Paula Rivas',
    customerNumber: 'CL-236',
    phone: '11 5904-6631',
    device: 'PlayStation 5',
    category: 'Consola',
    issue: 'Apagados por temperatura',
    status: 'En reparacion',
    branch: 'Quilmes',
    createdBy: 'tecnico@electrosafe.demo',
    createdAt: '2026-05-19',
    quote: '$96.900',
    paid: '$50.000',
    nextAction: 'Prueba de stress',
    inactivity: '7 h',
    workOrder: 'Firmada',
    warranty: '90 dias',
    notes: 'Limpieza profunda y cambio de pasta termica.'
  },
  {
    id: 'svc-1045',
    code: 'Q-1045',
    client: 'Agustin Vega',
    customerNumber: 'CL-235',
    phone: '11 2670-1193',
    device: 'Smart TV Philips 50"',
    category: 'TV',
    issue: 'Sin imagen, con sonido',
    status: 'Listo para retirar',
    branch: 'Wilde',
    createdBy: 'recepcion@electrosafe.demo',
    createdAt: '2026-05-18',
    quote: '$58.300',
    paid: '$58.300',
    nextAction: 'Coordinar entrega',
    inactivity: '2 d',
    workOrder: 'Cerrada',
    warranty: '30 dias',
    notes: 'Equipo probado 24 h.'
  },
  {
    id: 'svc-1044',
    code: 'Q-1044',
    client: 'Lucia Ferreyra',
    customerNumber: 'CL-234',
    phone: '11 4120-3345',
    device: 'iPhone 12',
    category: 'Celular',
    issue: 'Bateria degradada',
    status: 'Entregado',
    branch: 'Quilmes',
    createdBy: 'recepcion@electrosafe.demo',
    createdAt: '2026-05-17',
    quote: '$71.000',
    paid: '$71.000',
    nextAction: 'Seguimiento postventa',
    inactivity: '0 d',
    workOrder: 'Cerrada',
    warranty: '90 dias',
    notes: 'Entregado con garantia activa.'
  }
]

const quotes = [
  { id: 'cot-913', client: 'Nicolas Franco', device: 'Heladera Whirlpool', source: 'Web', status: 'Nueva', budget: '$0', age: '12 min' },
  { id: 'cot-912', client: 'Sofia Blanco', device: 'Motorola G84', source: 'WhatsApp', status: 'Contactada', budget: '$42.000', age: '1 h' },
  { id: 'cot-911', client: 'Diego Lemos', device: 'MacBook Air M1', source: 'Web', status: 'Convertida', budget: '$210.000', age: '4 h' }
]

const clients = [
  { id: 'CL-238', name: 'Marina Duarte', services: 3, last: 'Hoy', value: '$184.500', tag: 'Recurrente' },
  { id: 'CL-237', name: 'Carlos Medina', services: 1, last: 'Ayer', value: '$132.000', tag: 'Nuevo' },
  { id: 'CL-236', name: 'Paula Rivas', services: 2, last: '19/05', value: '$166.900', tag: 'Consolas' },
  { id: 'CL-235', name: 'Agustin Vega', services: 4, last: '18/05', value: '$298.300', tag: 'Hogar' }
]

const conversations = [
  { client: 'Marina Duarte', message: 'Perfecto, autorizo el cambio de modulo.', time: '14:28', status: 'Aprobacion recibida' },
  { client: 'Carlos Medina', message: 'Me pasas medios de pago?', time: '13:54', status: 'Responder' },
  { client: 'Paula Rivas', message: 'Avisame cuando termine la prueba.', time: '12:10', status: 'Seguimiento' }
]

const statusOptions = ['Todos', 'En revision', 'Presupuestado', 'En reparacion', 'Listo para retirar', 'Entregado']

const modules = [
  { id: 'dashboard', label: 'Dashboard', icon: faGaugeHigh },
  { id: 'stats', label: 'Estadisticas', icon: faChartLine },
  { id: 'services', label: 'Servicios', icon: faScrewdriverWrench },
  { id: 'quotes', label: 'Cotizaciones', icon: faFileInvoiceDollar },
  { id: 'clients', label: 'Clientes', icon: faUserGroup },
  { id: 'whatsapp', label: 'WhatsApp', icon: faWhatsapp },
  { id: 'order', label: 'Orden', icon: faReceipt }
]

const statusClass = (status) => status.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-')

const DemoShowcase = () => {
  const [module, setModule] = useState('dashboard')
  const [status, setStatus] = useState('Todos')
  const [search, setSearch] = useState('')
  const [selectedServiceId, setSelectedServiceId] = useState(services[0].id)
  const [showWorkOrder, setShowWorkOrder] = useState(false)

  const selectedService = services.find((service) => service.id === selectedServiceId) || services[0]

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesStatus = status === 'Todos' || service.status === status
      const term = search.trim().toLowerCase()
      const matchesSearch = !term || [
        service.code,
        service.client,
        service.customerNumber,
        service.device,
        service.category,
        service.branch
      ].some((value) => value.toLowerCase().includes(term))

      return matchesStatus && matchesSearch
    })
  }, [search, status])

  const monthlyRevenue = services.reduce((sum, service) => sum + Number(service.paid.replace(/\D/g, '')), 0)
  const activeCount = services.filter((service) => !['Entregado'].includes(service.status)).length
  const approvedQuotes = quotes.filter((quote) => quote.status === 'Convertida').length
  const deliveredCount = services.filter((service) => service.status === 'Entregado' || service.status === 'Listo para retirar').length
  const conversionRate = Math.round((deliveredCount / services.length) * 100)

  const selectModule = (id) => {
    setModule(id)
    if (id === 'order') setShowWorkOrder(true)
  }

  const selectService = (service) => {
    setSelectedServiceId(service.id)
    setModule('services')
  }

  const selectStatus = (nextStatus) => {
    setStatus(nextStatus)
    const nextService = nextStatus === 'Todos'
      ? services[0]
      : services.find((service) => service.status === nextStatus)

    if (nextService) {
      setSelectedServiceId(nextService.id)
    }
  }

  return (
    <div className="demo-shell demo-system-page">
      <section className="demo-app" aria-label="Aplicacion ElectroFix demo">
        <aside className="demo-app-sidebar">
          <img src="/images/ELECTROSAFELOGOBLACK.png" alt="ElectroFix" />
          {modules.map((item) => (
            <button
              key={item.id}
              type="button"
              className={module === item.id ? 'is-current' : ''}
              onClick={() => selectModule(item.id)}
            >
              <FontAwesomeIcon icon={item.icon} />
              {item.label}
            </button>
          ))}
        </aside>

        <div className="demo-app-main">
          <div className="demo-app-topbar">
            <div>
              <span>Demo publica del sistema</span>
              <h2>{modules.find((item) => item.id === module)?.label}</h2>
            </div>
            <div className="demo-topbar-actions">
              <button type="button" title="Notificaciones">
                <FontAwesomeIcon icon={faBell} />
              </button>
              <button type="button" onClick={() => setModule('services')}>
                <FontAwesomeIcon icon={faPlus} />
                Nuevo servicio
              </button>
              <Link to="/reparacion-electrodomesticos" className="demo-client-flow-link">
                Flujo cliente
                <FontAwesomeIcon icon={faArrowRight} />
              </Link>
            </div>
          </div>

          {module === 'dashboard' && (
            <div className="demo-overview">
              <SystemSummary
                activeCount={activeCount}
                quotesCount={quotes.length}
                clientsCount={clients.length}
                monthlyRevenue={monthlyRevenue}
                conversionRate={conversionRate}
              />

              <div className="demo-two-columns">
                <section className="demo-panel">
                  <div className="demo-panel-heading">
                    <h3>Alertas operativas</h3>
                    <span>Priorizadas por actividad</span>
                  </div>
                  {services.slice(0, 4).map((service) => (
                    <button key={service.id} className="demo-alert-row" onClick={() => selectService(service)} type="button">
                      <span className={`demo-dot demo-dot--${statusClass(service.status)}`}></span>
                      <span>
                        <strong>{service.code}</strong>
                        {service.client} - {service.nextAction}
                      </span>
                      <small>{service.inactivity}</small>
                    </button>
                  ))}
                </section>

                <section className="demo-panel">
                  <div className="demo-panel-heading">
                    <h3>Pipeline de reparacion</h3>
                    <span>Estado global</span>
                  </div>
                  {statusOptions.slice(1).map((item) => {
                    const count = services.filter((service) => service.status === item).length
                    return (
                      <div key={item} className="demo-progress-row">
                        <span>{item}</span>
                        <div><i style={{ width: `${Math.max(count * 28, 12)}%` }} /></div>
                        <strong>{count}</strong>
                      </div>
                    )
                  })}
                </section>
              </div>
            </div>
          )}

          {module === 'stats' && (
            <StatsDemo
              services={services}
              clientsCount={clients.length}
              monthlyRevenue={monthlyRevenue}
              conversionRate={conversionRate}
            />
          )}

          {module === 'services' && (
            <div className="demo-services-module">
              <div className="demo-controls">
                <label>
                  <FontAwesomeIcon icon={faMagnifyingGlass} />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Buscar por codigo, cliente, equipo o sucursal"
                  />
                </label>
                <div className="demo-filter-pills" aria-label="Filtros de estado">
                  <FontAwesomeIcon icon={faFilter} />
                  {statusOptions.map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={status === item ? 'is-selected' : ''}
                      onClick={() => selectStatus(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="demo-data-layout">
                <div className="demo-table-wrap">
                  <table className="demo-table">
                    <thead>
                      <tr>
                        <th>Codigo</th>
                        <th>Cliente</th>
                        <th>Equipo</th>
                        <th>Estado</th>
                        <th>Orden</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredServices.map((service) => (
                        <tr key={service.id} className={selectedService.id === service.id ? 'is-active-row' : ''}>
                          <td><button type="button" onClick={() => setSelectedServiceId(service.id)}>{service.code}</button></td>
                          <td>{service.client}<small>{service.customerNumber}</small></td>
                          <td>{service.device}<small>{service.issue}</small></td>
                          <td><span className={`demo-status demo-status--${statusClass(service.status)}`}>{service.status}</span></td>
                          <td>{service.workOrder}</td>
                          <td>
                            <div className="demo-icon-actions">
                              <button type="button" title="Editar"><FontAwesomeIcon icon={faPenToSquare} /></button>
                              <button type="button" title="Imprimir ticket"><FontAwesomeIcon icon={faPrint} /></button>
                              <button type="button" title="WhatsApp"><FontAwesomeIcon icon={faWhatsapp} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <ServiceInspector
                  service={selectedService}
                  onWorkOrder={() => {
                    setShowWorkOrder(true)
                    setModule('order')
                  }}
                />
              </div>
            </div>
          )}

          {module === 'quotes' && (
            <DemoListModule
              title="Solicitudes y cotizaciones"
              description="Entrada comercial desde web y WhatsApp antes de convertirse en servicio."
              rows={quotes.map((quote) => [quote.id, quote.client, quote.device, quote.source, quote.status, quote.budget, quote.age])}
              headers={['ID', 'Cliente', 'Equipo', 'Origen', 'Estado', 'Monto', 'Antiguedad']}
            />
          )}

          {module === 'clients' && (
            <DemoListModule
              title="Clientes"
              description="Historial unificado por numero de cliente, servicios e ingresos acumulados."
              rows={clients.map((client) => [client.id, client.name, `${client.services} servicios`, client.last, client.value, client.tag])}
              headers={['Codigo', 'Nombre', 'Actividad', 'Ultimo contacto', 'Valor', 'Segmento']}
            />
          )}

          {module === 'whatsapp' && (
            <div className="demo-chat-module">
              <section className="demo-panel">
                <div className="demo-panel-heading">
                  <h3>Bandeja WhatsApp</h3>
                  <span>Mensajes vinculados al estado del servicio</span>
                </div>
                {conversations.map((conversation) => (
                  <article key={conversation.client} className="demo-chat-row">
                    <span><FontAwesomeIcon icon={faWhatsapp} /></span>
                    <div>
                      <strong>{conversation.client}</strong>
                      <p>{conversation.message}</p>
                    </div>
                    <small>{conversation.time}</small>
                    <em>{conversation.status}</em>
                  </article>
                ))}
              </section>
              <section className="demo-panel demo-template-panel">
                <h3>Mensaje generado</h3>
                <p>Hola {selectedService.client}, tu equipo {selectedService.device} esta en estado: {selectedService.status}. Proxima accion: {selectedService.nextAction}.</p>
                <button type="button">Simular envio</button>
              </section>
            </div>
          )}

          {module === 'order' && (
            <WorkOrderPreview service={selectedService} expanded={showWorkOrder} onClose={() => setShowWorkOrder(false)} />
          )}
        </div>
      </section>
    </div>
  )
}

const ServiceInspector = ({ service, onWorkOrder }) => (
  <aside className="demo-inspector">
    <div className="demo-inspector-heading">
      <span><FontAwesomeIcon icon={faMobileScreen} /></span>
      <div>
        <small>{service.code}</small>
        <h3>{service.device}</h3>
      </div>
    </div>

    <dl>
      <div><dt>Cliente</dt><dd>{service.client}</dd></div>
      <div><dt>Telefono</dt><dd>{service.phone}</dd></div>
      <div><dt>Sucursal</dt><dd>{service.branch}</dd></div>
      <div><dt>Presupuesto</dt><dd>{service.quote}</dd></div>
      <div><dt>Abonado</dt><dd>{service.paid}</dd></div>
      <div><dt>Garantia</dt><dd>{service.warranty}</dd></div>
    </dl>

    <div className="demo-timeline">
      <div className="is-done"><FontAwesomeIcon icon={faCheck} /> Ingreso recibido</div>
      <div className="is-done"><FontAwesomeIcon icon={faCheck} /> Orden de trabajo {service.workOrder.toLowerCase()}</div>
      <div><FontAwesomeIcon icon={faClock} /> {service.nextAction}</div>
    </div>

    <div className="demo-note">
      <strong>Notas internas</strong>
      <p>{service.notes}</p>
    </div>

    <button className="demo-workorder-button" type="button" onClick={onWorkOrder}>
      Ver orden de trabajo
      <FontAwesomeIcon icon={faChevronRight} />
    </button>
  </aside>
)

const SystemSummary = ({ activeCount, quotesCount, clientsCount, monthlyRevenue, conversionRate }) => (
  <div className="card-container demo-system-cards">
    <div className="info-card blue">
      <p>SOLICITUDES</p>
      <h3>{quotesCount}</h3>
    </div>
    <div className="info-card red">
      <p>CLIENTES</p>
      <h3>{clientsCount}</h3>
    </div>
    <div className="info-card teal">
      <p>SERVICIOS ACTIVOS</p>
      <h3>{activeCount}</h3>
    </div>
    <div className="info-card purple">
      <p>FACTURACION DEMO</p>
      <h3>${monthlyRevenue.toLocaleString('es-AR')}</h3>
    </div>
    <div className="info-card green">
      <p>CONVERSION</p>
      <h3>{conversionRate}%</h3>
    </div>
  </div>
)

const StatsDemo = ({ services, clientsCount, monthlyRevenue, conversionRate }) => {
  const delivered = services.filter((service) => ['Entregado', 'Listo para retirar'].includes(service.status))
  const avgTicket = Math.round(monthlyRevenue / Math.max(delivered.length, 1))

  return (
    <div className="demo-stats-page">
      <SystemSummary
        activeCount={services.filter((service) => service.status !== 'Entregado').length}
        quotesCount={3}
        clientsCount={clientsCount}
        monthlyRevenue={monthlyRevenue}
        conversionRate={conversionRate}
      />

      <div className="demo-stats-grid">
        <section className="chart-box demo-chart-box">
          <div className="chart-header">
            <p>Servicios entregados</p>
            <span>Ultimos 30 dias</span>
          </div>
          <div className="demo-line-chart" aria-label="Grafico simulado de servicios entregados">
            <i style={{ height: '34%' }}></i>
            <i style={{ height: '58%' }}></i>
            <i style={{ height: '42%' }}></i>
            <i style={{ height: '76%' }}></i>
            <i style={{ height: '64%' }}></i>
            <i style={{ height: '88%' }}></i>
            <i style={{ height: '72%' }}></i>
          </div>
        </section>

        <section className="chart-box demo-chart-box">
          <div className="chart-header">
            <p>Flujo de servicios</p>
            <span>Embudo operativo</span>
          </div>
          <div className="demo-funnel">
            {['Recibidos', 'En gestion', 'Listos'].map((label, index) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{[12, 7, 4][index]}</strong>
                <i style={{ width: `${[92, 62, 38][index]}%` }}></i>
              </div>
            ))}
          </div>
        </section>

        <section className="chart-box demo-chart-box">
          <div className="chart-header">
            <p>Equipos mas reparados</p>
            <span>Ranking demo</span>
          </div>
          <div className="demo-ranking">
            {[
              ['Celulares', 38],
              ['Notebooks', 24],
              ['Consolas', 18],
              ['TV', 13]
            ].map(([label, value]) => (
              <div key={label}>
                <span>{label}</span>
                <i style={{ width: `${value * 2}%` }}></i>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="chart-box demo-chart-box">
          <div className="chart-header">
            <p>Indicadores clave</p>
            <span>Gestion mensual</span>
          </div>
          <div className="demo-indicators">
            <div><span>Ticket promedio</span><strong>${avgTicket.toLocaleString('es-AR')}</strong></div>
            <div><span>Tiempo promedio</span><strong>3.8 dias</strong></div>
            <div><span>Garantias activas</span><strong>16</strong></div>
            <div><span>Sin respuesta</span><strong>5</strong></div>
          </div>
        </section>
      </div>

      <section className="chart-box demo-chart-box">
        <h3>Ultimos servicios entregados</h3>
        <table className="stats-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Equipo</th>
              <th>Estado</th>
              <th>Valor</th>
              <th>Sucursal</th>
            </tr>
          </thead>
          <tbody>
            {services.slice(0, 5).map((service) => (
              <tr key={service.id}>
                <td>{service.client}</td>
                <td>{service.device}</td>
                <td>{service.status}</td>
                <td>{service.quote}</td>
                <td>{service.branch}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}

const DemoListModule = ({ title, description, headers, rows }) => (
  <section className="demo-panel demo-list-module">
    <div className="demo-panel-heading">
      <div>
        <h3>{title}</h3>
        <span>{description}</span>
      </div>
    </div>
    <div className="demo-table-wrap">
      <table className="demo-table">
        <thead>
          <tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.join('-')}>
              {row.map((cell) => <td key={cell}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
)

const WorkOrderPreview = ({ service }) => (
  <div className="demo-order-module">
    <section className="demo-order-paper">
      <header>
        <div>
          <span>Orden de trabajo</span>
          <h3>{service.code}</h3>
        </div>
        <strong>ElectroFix</strong>
      </header>

      <div className="demo-order-grid">
        <div><span>Cliente</span><strong>{service.client}</strong></div>
        <div><span>Equipo</span><strong>{service.device}</strong></div>
        <div><span>Telefono</span><strong>{service.phone}</strong></div>
        <div><span>Sucursal</span><strong>{service.branch}</strong></div>
      </div>

      <section>
        <h4>Problema informado</h4>
        <p>{service.issue}</p>
      </section>

      <section>
        <h4>Diagnostico tecnico</h4>
        <p>Se registra inspeccion inicial, presupuesto, autorizacion del cliente y trazabilidad de cambios de estado.</p>
      </section>

      <footer>
        <span>Firma cliente</span>
        <span>Firma recepcion</span>
      </footer>
    </section>

    <aside className="demo-panel demo-order-side">
      <h3>Que se muestra aca</h3>
      <p>El sistema permite compartir ticket publico, imprimir orden de trabajo, registrar firma, controlar garantia y mantener el historial operativo asociado al servicio.</p>
      <button type="button"><FontAwesomeIcon icon={faBoxArchive} /> Simular envio a bodega</button>
    </aside>
  </div>
)

export default DemoShowcase

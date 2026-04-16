import React, { useEffect, useState } from "react"
import axios from "axios"
import { getApiUrl } from "../../config"
import DashboardLayout from "../DashboardLayout/DashboardLayout"
import { Line, Bar } from "react-chartjs-2"

import {
Chart as ChartJS,
CategoryScale,
LinearScale,
PointElement,
LineElement,
BarElement,
Tooltip,
Legend,
TimeScale
} from "chart.js"

import "chartjs-adapter-date-fns"

import "./Estadisticas.css"

ChartJS.register(
CategoryScale,
LinearScale,
PointElement,
LineElement,
BarElement,
Tooltip,
Legend,
TimeScale
)

const Estadisticas = () => {

const [services,setServices] = useState([])
const [clients,setClients] = useState(0)

const [startDate,setStartDate] = useState(()=>{
const d = new Date()
d.setDate(d.getDate()-30)
return d.toISOString().split("T")[0]
})

const [endDate,setEndDate] = useState(()=>{
return new Date().toISOString().split("T")[0]
})


/* =========================
FETCH DATA
========================= */

useEffect(()=>{

const fetchData = async ()=>{

try{

const servicesRes = await axios.get(
`${getApiUrl()}/api/service`,
{withCredentials:true}
)

const clientsRes = await axios.get(
`${getApiUrl()}/api/client`,
{withCredentials:true}
)

setServices(servicesRes.data || [])
setClients(clientsRes.data?.length || 0)

}catch(err){
console.error("Error cargando estadisticas",err)
}

}

fetchData()

},[])


/* =========================
SERVICIOS ENTREGADOS
========================= */

const deliveredServices = services.filter(s =>
  s.status === "Entregado" &&
  s.deliveredAt
)

/* =========================
FACTURACION POR MES
========================= */
const now = new Date()

const currentMonthServices = deliveredServices.filter(s => {
  const d = new Date(s.deliveredAt)
  return (
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  )
})


const totalRevenue = currentMonthServices.reduce(
(acc,s)=> acc + (s.finalValue || 0),
0
)


/* =========================
TICKET PROMEDIO
========================= */

const avgTicket =
deliveredServices.length > 0
? totalRevenue / deliveredServices.length
: 0


/* =========================
TIEMPO PROMEDIO REPARACION
========================= */

const repairTimes = deliveredServices
.filter(s => s.createdAt && s.deliveredAt)
.map(s => {

  const start = new Date(s.createdAt)
  const end = new Date(s.deliveredAt)

  return (end - start) / (1000 * 60 * 60 * 24)

})

const avgRepairDays = repairTimes.length
  ? repairTimes.reduce((a, b) => a + b, 0) / repairTimes.length
  : 0


/* =========================
FILTRO POR FECHA
========================= */

const deliveredFiltered = deliveredServices.filter(s=>{

const d = new Date(s.deliveredAt)

return d >= new Date(startDate) && d <= new Date(endDate)

})

/* =========================
SERVICIOS SIN FACTURAR
========================= */

const zeroValueServices = deliveredServices.filter(s => !s.finalValue)


/* =========================
GRAFICO DIARIO
========================= */

const dailyCounts = deliveredFiltered.reduce((acc,s)=>{

const day = new Date(s.deliveredAt)
.toISOString()
.split("T")[0]

acc[day] = (acc[day] || 0) + 1

return acc

},{})

const sortedDays = Object.keys(dailyCounts).sort()

const chartDaily = {

labels: sortedDays,

datasets:[{

label:"Servicios entregados",

data: sortedDays.map(d=>dailyCounts[d]),

borderColor:"#1976d2",
backgroundColor:"#1976d240",
tension:0.4

}]

}


/* =========================
FACTURACION POR MES
========================= */

const revenueMonth = deliveredServices.reduce((acc,s)=>{

const d = new Date(s.deliveredAt)

const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`

acc[key] = (acc[key] || 0) + (s.finalValue || 0)

return acc

},{})

const sortedMonths = Object.keys(revenueMonth).sort()

const chartRevenueMonth = {

labels: sortedMonths,

datasets:[{

label:"Facturación",

data: sortedMonths.map(m=>revenueMonth[m]),

backgroundColor:"#43a047"

}]

}


/* =========================
MARCAS MAS REPARADAS
========================= */

const brandCounts = deliveredServices.reduce((acc,s)=>{

const brand = (s.brand || "Sin marca").toUpperCase()

acc[brand] = (acc[brand] || 0) + 1

return acc

},{})

const sortedBrands = Object.entries(brandCounts)
.sort((a,b)=>b[1]-a[1])
.slice(0,10)

const chartBrands = {

labels: sortedBrands.map(b=>b[0]),

datasets:[{

label:"Servicios",

data: sortedBrands.map(b=>b[1]),

backgroundColor:"#fb8c00"

}]

}


/* =========================
EQUIPOS MAS REPARADOS
========================= */

const deviceCounts = deliveredServices.reduce((acc,s)=>{

const device = (s.equipmentType || "Sin equipo")

acc[device] = (acc[device] || 0) + 1

return acc

},{})

const sortedDevices = Object.entries(deviceCounts)
.sort((a,b)=>b[1]-a[1])
.slice(0,10)

const chartDevices = {

labels: sortedDevices.map(d=>d[0]),

datasets:[{

label:"Servicios",

data: sortedDevices.map(d=>d[1]),

backgroundColor:"#8e24aa"

}]

}

/* =========================
TOP CLIENTES
========================= */

const clientCounts = deliveredServices.reduce((acc, s) => {

  const name = `${s.userData?.firstName || ""} ${s.userData?.lastName || ""}`.trim() || "Cliente"

  acc[name] = (acc[name] || 0) + 1

  return acc

}, {})

const sortedClients = Object.entries(clientCounts)
.sort((a, b) => b[1] - a[1])
.slice(0, 10)

const chartClients = {

  labels: sortedClients.map(c => c[0]),

  datasets: [
    {
      label: "Servicios",
      data: sortedClients.map(c => c[1]),
      backgroundColor: "#8e24aa"
    }
  ]

}

/* =========================
SERVICIOS POR ESTADO
========================= */

const statusCounts = services.reduce((acc, s) => {

  const status = s.status || "Sin estado"

  acc[status] = (acc[status] || 0) + 1

  return acc

}, {})

const sortedStatus = Object.entries(statusCounts)

const chartStatus = {

  labels: sortedStatus.map(s => s[0]),

  datasets: [
    {
      label: "Servicios",
      data: sortedStatus.map(s => s[1]),
      backgroundColor: "#1976d2"
    }
  ]

}


/* =========================
ULTIMOS SERVICIOS
========================= */

const lastServices = deliveredServices
.sort((a,b)=> new Date(b.deliveredAt) - new Date(a.deliveredAt))
.slice(0,10)

/* =========================
% DE CONVERSION
========================= */

const receivedServices = services.filter(s =>
  s.statusHistory?.some(h => h.status === "Recibido")
)

const deliveredCount = services.filter(s =>
  s.status === "Entregado"
).length

const conversionRate = receivedServices.length
  ? (deliveredCount / receivedServices.length) * 100
  : 0

/* =========================
SERVICIOS PERDIDOS
========================= */

const lostStatuses = ['Sin respuesta', 'Rechazado', 'Retirado a bodega']

const lostServices = services.filter(s =>
  lostStatuses.includes(s.status)
)

const lostCount = lostServices.length

/* =========================
EMBUDO
========================= */

const activos = services.filter(s =>
  !['Entregado', 'Entregado S/R', 'Sin respuesta', 'Retirado a bodega']
    .includes(s.status)
)

const funnelActual = {
  recibidos: activos.filter(s => s.status === "Recibido").length,

  enGestion: activos.filter(s =>
    ['En Gestión', 'Reparación', 'Armado S/R'].includes(s.status)
  ).length,

  listos: activos.filter(s =>
    ['Listo para retirar', 'Listo para retiro S/R'].includes(s.status)
  ).length
}

const chartFunnel = {
  labels: ["Recibidos", "En gestión", "Listos"],
  datasets: [{
    label: "Flujo real",
    data: [
      funnelActual.recibidos,
      funnelActual.enGestion,
      funnelActual.listos,
    ],
    backgroundColor: "#42a5f5"
  }]
}

return(

<DashboardLayout>

<div className="estadisticas-page">

<h2>📊 Estadísticas</h2>


{/* CARDS */}

<div className="card-container">

<div className="info-card blue">
<p>SERVICIOS</p>
<h3>{services.length}</h3>
</div>

<div className="info-card green">
<p>ENTREGADOS</p>
<h3>{deliveredServices.length}</h3>
</div>

<div className="info-card red">
<p>CLIENTES</p>
<h3>{clients}</h3>
</div>

<div className="info-card teal">
<p>FACTURACIÓN MENSUAL (SIN GASTOS)</p>
<h3>${totalRevenue.toLocaleString()}</h3>
</div>

<div className="info-card orange">
<p>TICKET PROMEDIO</p>
<h3>${Math.round(avgTicket).toLocaleString()}</h3>
</div>

<div className="info-card purple">
<p>TIEMPO PROMEDIO DE ARREGLO</p>
<h3>{avgRepairDays.toFixed(1)} días</h3>
</div>

<div className="info-card orange">
<p>SERVICIOS SIN FACTURAR</p>
<h3>{zeroValueServices.length}</h3>
</div>

<div className="info-card green">
  <p>CONVERSIÓN % DE ENTREGADOS</p>
  <h3>{conversionRate.toFixed(0)}%</h3>
</div>

<div className="info-card red">
  <p>SERVICIOS SIN REPARACION</p>
  <h3>{lostCount}</h3>
</div>

</div>


{/* SERVICIOS POR DIA */}

<div className="chart-box">

<div className="chart-header">

<p>📈 Servicios entregados</p>

<div className="date-range">

<input
type="date"
value={startDate}
onChange={(e)=>setStartDate(e.target.value)}
/>

<input
type="date"
value={endDate}
onChange={(e)=>setEndDate(e.target.value)}
/>

</div>

</div>

<Line data={chartDaily} />

</div>

{/* EMBUDO SERVICIOS */}

<div className="chart-box">
  <p>📊 Flujo de servicios</p>
  <Bar data={chartFunnel} />
</div>

{/* FACTURACION POR MES */}

<div className="chart-box">

<p>💰 Facturación por mes (Web)</p>

<Bar data={chartRevenueMonth} />

</div>


{/* MARCAS */}

<div className="chart-box">

<p>🏷️ Marcas más reparadas</p>

<Bar data={chartBrands} />

</div>


{/* EQUIPOS */}

<div className="chart-box">

<p>🔧 Equipos más reparados</p>

<Bar data={chartDevices} />

</div>

<div className="chart-box">

<p>📊 Estado de servicios</p>

<Bar data={chartStatus} />

</div>

<div className="chart-box">

<p>👥 Clientes con más servicios</p>

<Bar data={chartClients} />

</div>


{/* TABLA */}

<div className="chart-box">

<h3>Últimos servicios entregados</h3>

<table className="stats-table">

<thead>

<tr>
<th>Cliente</th>
<th>Equipo</th>
<th>Marca</th>
<th>Valor</th>
<th>Fecha</th>
</tr>

</thead>

<tbody>

{lastServices.length > 0 ?

lastServices.map(s=>(

<tr key={s._id}>

<td>
{s.userData?.firstName || ""} {s.userData?.lastName || ""}
</td>

<td>
{s.equipmentType || "-"}
</td>

<td>
{s.brand || "-"}
</td>

<td>
${(s.finalValue || 0).toLocaleString()}
</td>

<td>
{new Date(s.deliveredAt).toLocaleDateString()}
</td>

</tr>

))

:

<tr>
<td colSpan="5">No hay servicios recientes</td>
</tr>

}

</tbody>

</table>

</div>

</div>

</DashboardLayout>

)

}

export default Estadisticas
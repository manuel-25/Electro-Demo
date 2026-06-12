# Electro-Demo | Electrosafe

**Electro-Demo** es una demo full stack de gestion operativa para un servicio tecnico de electronica y electrodomesticos. La aplicacion muestra como una empresa puede centralizar cotizaciones, clientes, servicios, tickets, ordenes de trabajo, garantias, estadisticas y conversaciones de WhatsApp en un solo panel.

La marca visible dentro de la demo es **Electrosafe**. El objetivo del proyecto es presentar un flujo de negocio completo, usable y entendible para portfolio, entrevistas, clientes potenciales o demostraciones comerciales, preservando la seguridad del codigo real.

---

## Que problema resuelve

Un servicio tecnico suele trabajar con informacion repartida entre WhatsApp, planillas, notas, tickets impresos, presupuestos y conversaciones sueltas. Eso hace dificil saber:

- que equipos ingresaron,
- que cliente esta esperando respuesta,
- que presupuesto fue aceptado,
- que servicios estan listos para retirar,
- cuanto se esta facturando,
- que fallas se repiten,
- donde se traban las operaciones.

Esta demo propone una solucion: un sistema interno donde el equipo puede seguir todo el ciclo de vida del servicio desde una unica interfaz.

---

## Flujo principal del negocio

1. **Solicitud o cotizacion**
   El cliente consulta por una reparacion. La solicitud queda registrada como cotizacion.

2. **Cliente**
   El operador puede crear o seleccionar un cliente existente, revisar sus datos y ver su historial.

3. **Ingreso del equipo**
   Se crea un servicio tecnico con codigo automatico, equipo, marca, modelo, descripcion, sucursal y metodo de recepcion.

4. **Recepcion y checklist**
   Si el equipo queda recibido, el sistema solicita informacion de ingreso: estado del equipo, limpieza, accesorios y observaciones.

5. **Orden de trabajo**
   El equipo puede pasar por presupuesto, envio al cliente, aceptacion, rechazo o reparacion sin aprobacion.

6. **Seguimiento por estados**
   El servicio avanza por etapas: pendiente, recibido, en gestion, reparacion, listo para retirar, entregado, garantia, sin respuesta o bodega.

7. **Ticket**
   Al ingresar un equipo se genera un comprobante para el cliente.

8. **Entrega y garantia**
   El sistema registra entrega, conformidad, garantia y eventos posteriores.

9. **Analisis**
   El dashboard y las estadisticas muestran informacion clave para tomar decisiones operativas.

---

## Modulos incluidos

### Dashboard

Vista general del estado del negocio:

- cotizaciones pendientes,
- servicios activos,
- facturacion,
- conversion,
- proximas acciones,
- servicios con inactividad,
- alertas operativas.

### Servicios

Panel central para gestionar reparaciones:

- tabla responsive,
- filtros por estado, sucursal, creador, equipo y mes,
- seleccion de fila con preview,
- detalle completo del servicio,
- edicion,
- cambio de estado,
- orden de trabajo,
- ticket,
- WhatsApp rapido,
- recepcion con checklist.

### Clientes

Gestion de clientes y su historial:

- alta de clientes,
- detalle editable,
- servicios vinculados,
- valor acumulado,
- identificacion de clientes recurrentes.

### Cotizaciones

Seguimiento de solicitudes:

- pendientes,
- respondidas,
- no respondidas,
- contacto por WhatsApp,
- filtros funcionales desde dashboard.

### Estadisticas

Panel de decision para entender el negocio:

- facturacion mensual,
- variacion mensual,
- valor en cartera,
- facturacion proyectada,
- funnel de conversion,
- ranking de fallas,
- tiempo por etapa,
- ticket promedio,
- clientes nuevos y recurrentes,
- garantias activas,
- alertas operativas.

### WhatsApp Operativo

Rework de la seccion original del bot para convertirla en una bandeja de soporte:

- conversaciones por estado,
- mensajes guardados,
- lectura de historial,
- tomar conversacion,
- finalizar conversacion,
- responder desde el panel cuando la integracion lo permita,
- respuestas rapidas,
- contexto de API,
- aviso de limitaciones de la ventana de atencion de WhatsApp.

La demo soporta modo simulado. La arquitectura queda preparada para integrarse con WhatsApp Cloud API o con la integracion local existente.

### Analitica de Demo

Modulo pensado para portfolio publicado:

- ingreso simple por email,
- tracking de visitas,
- eventos de uso,
- paginas mas vistas,
- acciones principales,
- actividad agrupada por usuario,
- emails enmascarados por privacidad.

---

## Como usar la demo

1. Entrar a la aplicacion.
2. Escribir un email para iniciar la demo.
3. Ir al **Dashboard** para ver el estado general.
4. Entrar a **Servicios** para crear o editar reparaciones.
5. Crear un servicio nuevo:
   - elegir cliente,
   - equipo,
   - marca/modelo,
   - descripcion,
   - sucursal,
   - guardar.
6. Si el equipo fue recibido, completar el checklist.
7. Revisar el ticket generado.
8. Volver a servicios para continuar el flujo.
9. Usar **Estadisticas** para analizar el negocio.
10. Usar **WhatsApp** para revisar conversaciones demo.
11. Usar **Analitica** para ver como interactuan los visitantes con la demo.

---

## Datos demo

La aplicacion trabaja con datos de prueba en MongoDB, separados de cualquier base real.

Incluye:

- 100 clientes,
- 100 cotizaciones,
- mas de 100 servicios,
- conversaciones demo de WhatsApp,
- usuario demo,
- eventos de analitica.

Esto permite mostrar la aplicacion con volumen realista, sin exponer informacion sensible.

---

## Publicacion y seguridad

Este proyecto esta pensado para ser publicado como demo. Antes de desplegar:

- usar una base de datos exclusiva para demo,
- no subir archivos `.env`,
- no incluir credenciales reales,
- no usar datos reales de clientes,
- mantener las colecciones demo separadas,
- revisar CORS y variables de entorno,
- rotar cualquier credencial que haya sido expuesta accidentalmente.

---

## Instalacion local

Instalar dependencias:

```bash
npm run install:all
```

Crear variables de entorno desde los ejemplos:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Variables importantes:

```env
DEMO_MODE=true
PORT=5000
```

Frontend:

```env
PORT=3001
REACT_APP_DEV_API_URL=http://localhost:5000
REACT_APP_DEMO_MODE=true
```

---

## Correr en local

Backend:

```bash
npm run dev:backend
```

Frontend:

```bash
npm run dev:frontend
```

Abrir:

```txt
http://localhost:3001
```

---

## Cargar datos demo

Insertar datos si las colecciones estan vacias:

```bash
npm run seed:demo
```

Resetear y volver a poblar:

```bash
npm run seed:demo:reset
```

---

## Stack utilizado

- React
- React Router
- CSS modular por componente
- Chart.js
- Node.js
- Express
- MongoDB / Mongoose
- PDFKit
- WhatsApp integration layer

La demo prioriza experiencia de usuario, flujo de negocio y claridad operativa por encima de mostrar complejidad tecnica innecesaria.

---

## Valor del proyecto

Electro-Demo demuestra la capacidad de construir un sistema interno realista para una operacion de servicio tecnico:

- digitaliza procesos manuales,
- mejora el seguimiento,
- reduce perdida de informacion,
- ordena la comunicacion con clientes,
- muestra metricas accionables,
- permite escalar hacia integraciones reales como WhatsApp Cloud API,
- deja una base preparada para producto o SaaS interno.

Es una demo, pero representa un producto funcional con una logica de negocio completa.

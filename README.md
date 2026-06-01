# Electro-Demo

Demo full stack de gestión operativa para un servicio técnico de electrónica/electrodomésticos. El proyecto está preparado para portfolio: muestra el flujo de negocio completo con datos demo, sin depender de usuarios reales ni credenciales productivas.

La marca visible de la demo es **Electrosafe**. El repositorio original de trabajo se llamaba ElectroSafe, pero esta versión queda orientada exclusivamente a demostración para preservar la seguridad del codigo.

## Qué muestra la demo

- Dashboard operativo con indicadores de cotizaciones, clientes, servicios activos, entregas y facturación demo.
- Gestión de cotizaciones con filtros por estado y acciones rápidas.
- Gestión de clientes con vista de detalle y relación con servicios.
- Gestión de servicios técnicos con estados, órdenes de trabajo, tickets, notas, recepción, accesorios y garantía.
- Vista previa de servicio al seleccionar una fila, sin entrar al detalle.
- Estadísticas de flujo del negocio: estados del servicio, conversión, ticket promedio, tiempos de arreglo y comparación mensual.
- Modo demo con colecciones separadas en MongoDB y seed controlado.
- Login omitido para que la demo entre directo al dashboard.

## Stack

- Frontend: React 18, React Router, CSS por componente, Chart.js/Recharts, React PDF.
- Backend: Node.js, Express, MongoDB/Mongoose.
- Seguridad: cookie httpOnly, CORS allowlist, rate limit de login, sanitización Mongo y variables de entorno.
- Datos demo: seed propio para clientes, cotizaciones, servicios y usuario demo.

## Estructura

```txt
frontend/   App React pública y dashboard demo
backend/    API Express, modelos Mongo, rutas, controladores y seed demo
```

## Instalación local

```bash
npm run install:all
```

Crear los archivos de entorno desde los ejemplos:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Valores importantes para correr la demo:

```env
DEMO_MODE=true
PORT=5000
```

Frontend:

```env
PORT=3001
REACT_APP_DEV_API_URL=http://localhost:5000
```

## Correr la demo

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

## Datos demo

El backend puede poblar colecciones separadas para demo:

```bash
npm run seed:demo
```

Para resetear y volver a cargar los datos:

```bash
npm run seed:demo:reset
```

Las colecciones demo se configuran desde `backend/src/utils/config.js` cuando `DEMO_MODE=true`.

## Scripts útiles

```bash
npm run build:frontend
npm run test:frontend
npm run start:backend
```

## Seguridad antes de publicar

Este repositorio está pensado para portfolio. Antes de subir o desplegar:

- No commitear `.env`, logs, dumps de base, sesiones de WhatsApp, caches ni datos reales.
- Usar siempre una base demo o datos mock.
- Mantener fuera de este repo cualquier credencial real.
- Rotar credenciales si alguna vez estuvieron en un repo público.
- Revisar que las rutas administrativas sigan protegidas en backend.

## Estado del proyecto

Esta demo prioriza mostrar el flujo del negocio y la experiencia operativa. Algunas pantallas grandes todavía son candidatas a refactor por módulos y tests más finos, pero el circuito principal de clientes, cotizaciones, servicios, tickets, órdenes y estadísticas está preparado para una presentación de portfolio.

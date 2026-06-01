# Notas de seguridad

Este proyecto puede publicarse como showcase de portfolio únicamente después de retirar datos productivos y credenciales reales.

## Reglas para una demo pública

- No commitear archivos `.env`, logs, sesiones de WhatsApp, caches, dumps de base de datos, datos privados de clientes ni credenciales de producción.
- Usar `DEMO_MODE=true` con una base de datos demo separada o datos mock.
- Mantener privado el repositorio y deploy productivos.
- Rotar cualquier credencial que haya estado expuesta fuera de un entorno privado.
- Usar un usuario demo precreado para mostrar el panel; no abrir registro público de usuarios.

## Rutas públicas intencionales

- `POST /api/quotes`: formulario público de solicitud de servicio.
- `GET /api/service/public/:publicId`: consulta pública de orden por ID compartible.
- `GET /api/service/public/:publicId/print-ticket`: PDF público del ticket por ID compartible.

Las operaciones de manager, clientes, servicios, estadísticas y conversaciones deben requerir autenticación salvo que se documenten explícitamente como públicas.

import express from 'express'
import ServiceController from '../controllers/serviceController.js'
import authenticateJWT from '../middlewares/authenticateJWT.js'
import authenticateAdmin from '../middlewares/authenticateAdmin.js'
import TicketController from '../controllers/ticketController.js'
import WorkOrderController from '../controllers/workOrderController.js'

const router = express.Router()

// ================== Rutas de Servicio ==================

// Obtener todos los servicios
router.get('/', authenticateJWT, ServiceController.getAllServices)

// Obtener servicio por ID o código
router.get('/id/:id', authenticateJWT, ServiceController.getServiceById)
router.get('/code/:code', authenticateJWT, ServiceController.getServiceByCode)

// Obtener servicios por cliente o presupuesto
router.get('/by-customer/:customerNumber', authenticateJWT, ServiceController.getServicesByCustomerNumber)
router.get('/by-quote/:quoteReference', authenticateJWT, ServiceController.getServicesByQuoteReference)

// Obtener último código generado por prefijo
router.get('/last-code/:prefix', authenticateJWT, ServiceController.getLastCode)

// Crear o actualizar servicios
router.post('/', authenticateJWT, ServiceController.createService)
router.put('/:id', authenticateJWT, ServiceController.updateServiceById)
router.put('/code/:code', authenticateJWT, ServiceController.updateServiceByCode)

// Actualizar estado e historial
router.put('/:id/status', authenticateJWT, ServiceController.updateServiceStatus)

// Eliminar servicio (soft delete)
router.patch('/soft-delete/:code', authenticateJWT, authenticateAdmin, ServiceController.softDeleteByCode)

// ================== Ruta para imprimir comprobante ==================
router.get('/:publicId/print-ticket', /*authenticateJWT,*/ TicketController.printServiceTicket) // por _id
router.get('/code/:code/print-ticket', /*authenticateJWT,*/ TicketController.printByCode) // por code
router.get('/public/:publicId/print-ticket', TicketController.printByPublicId)

// ================== Orden de trabajo ==================
router.get('/public/:publicId', WorkOrderController.getPublicService)
router.patch('/:id/workorder', authenticateJWT, ServiceController.updateWorkOrderStatus)

export default router

import express from 'express'
import QuoteController from '../controllers/quoteController.js'
import ServiceRequestController from '../controllers/serviceRequestController.js'
import authenticateJWT from '../middlewares/authenticateJWT.js'

const router = express.Router()

// Pública: formulario de solicitud de servicio.
router.post('/', ServiceRequestController.createServiceRequest)

// Privadas: gestión interna de cotizaciones.
router.get('/count/pending', authenticateJWT, QuoteController.getPendingCount)
router.get('/', authenticateJWT, QuoteController.getQuotes)
router.get('/:serviceRequestNumber', authenticateJWT, QuoteController.getQuoteByServiceRequestNumber)
router.put('/:serviceRequestNumber', authenticateJWT, QuoteController.update)
router.delete('/:serviceRequestNumber', authenticateJWT, QuoteController.deleteQuote)

export default router

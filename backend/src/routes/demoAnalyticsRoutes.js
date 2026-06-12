import express from 'express'
import DemoAnalyticsController from '../controllers/demoAnalyticsController.js'
import authenticateJWT from '../middlewares/authenticateJWT.js'
import authenticateAdmin from '../middlewares/authenticateAdmin.js'

const router = express.Router()

const asyncRoute = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next)
}

router.post('/session', asyncRoute(DemoAnalyticsController.createSession))
router.post('/events', asyncRoute(DemoAnalyticsController.trackEvent))
router.get('/summary', authenticateJWT, authenticateAdmin, asyncRoute(DemoAnalyticsController.getSummary))

export default router

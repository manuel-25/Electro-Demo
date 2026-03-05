import express from 'express'
import StatsController from '../controllers/statsController.js'
import authenticateJWT from '../middlewares/authenticateJWT.js'

const router = express.Router()

router.get('/', authenticateJWT, StatsController.getGeneralStats)

export default router
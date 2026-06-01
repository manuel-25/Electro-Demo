import dns from 'dns'
dns.setDefaultResultOrder('ipv4first')

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './db/mongoose-config.js'
import quoteRoutes from './routes/quoteRoutes.js'
import userRoutes from './routes/userRoutes.js'
import clientRoutes from './routes/clientRoutes.js'
import serviceRoutes from './routes/serviceRoutes.js'
import conversationRoutes from './routes/conversationRoutes.js'
import logRoutes from './routes/logRoutes.js'
import cookieParser from 'cookie-parser'
import config from './utils/config.js'
import { logger } from './utils/logger.js'
import statsRoutes from './routes/statsRoutes.js'
import helmet from 'helmet'
import mongoSanitize from 'express-mongo-sanitize'
import { seedDemoData } from './demo/seedDemoData.js'

/*
//Whatsapp
import qrcode from 'qrcode-terminal'
import client from './whatsapp/whatsappClient.js'
import botHandlers from './whatsapp/botHandlers.js'
import ConversationManager from './Mongo/ConversationManager.js'
*/

dotenv.config()

const app = express()
const port = config.PORT || 5000

app.set('trust proxy', 1)

// Middleware
const allowedOrigins = config.FRONTEND_ORIGINS.length
  ? config.FRONTEND_ORIGINS
  : [
      'https://electrosafeweb.com',
      'http://localhost:3000'
    ]

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true)
    }
    return callback(new Error('No permitido por CORS'))
  },
  credentials: true
}))

app.use(cookieParser())
app.use(express.json({ limit: '100kb' }))
app.use(helmet())
app.use(mongoSanitize())

// Routes
app.use('/api/quotes', quoteRoutes)
app.use('/api/manager', userRoutes)
app.use('/api/client', clientRoutes)
app.use('/api/service', serviceRoutes)
app.use('/api/logs', logRoutes)
app.use('/api/conversations', conversationRoutes)
app.use('/api/stats', statsRoutes)

// MongoDB Connection
await connectDB()
if (config.DEMO_MODE) {
  const demoSeed = await seedDemoData()
  logger.info(`Demo mode enabled. Collections: ${JSON.stringify(config.COLLECTIONS)}. Seed: ${JSON.stringify(demoSeed.results)}`)
}

// Middleware general de manejo de errores
app.use((err, req, res, next) => {
  res.status(500).json({
    message: 'Ocurrio un error en el servidor',
    error: config.NODE_ENV === 'production' ? undefined : err.message
  })
})

/*
// ================================
// ⏱ CHECK PRIORITY WHATSAPP
// ================================
setInterval(async () => {
  try {
    await ConversationManager.checkWaitingPriority(60)
  } catch (error) {
    logger.debug('Error revisando prioridades:', error)
  }
}, 60 * 1000)
*/

/* ==========================================
   🛑 GLOBAL ERROR HANDLERS
========================================== */

process.on('uncaughtException', (err) => {
  logger.fatal(`Uncaught Exception: ${err.stack}`)
})

process.on('unhandledRejection', (reason) => {
  logger.fatal(`Unhandled Rejection: ${reason}`)
})

/*
process.on('SIGTERM', async () => {
  logger.warn('Proceso detenido (SIGTERM)')

  try {
    await client.destroy()
  } catch (err) {
    logger.error(`Error cerrando WhatsApp: ${err.message}`)
  }

  process.exit(0)
})
*/

// START SERVER
app.listen(port, async () => {
  logger.info(`Server is running on port: ${port}`)

  /*
  if (!global.clientInitialized) {
    client.initialize()
    global.clientInitialized = true
  }
  */
})

/*
// 🔥 HANDLERS DE MENSAJES
botHandlers(client)
*/

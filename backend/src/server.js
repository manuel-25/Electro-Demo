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

//Whatsapp
import qrcode from 'qrcode-terminal'
import client from './whatsapp/whatsappClient.js'
import botHandlers from './whatsapp/botHandlers.js'
import ConversationManager from './Mongo/ConversationManager.js'

dotenv.config()

const app = express()
const port = config.PORT || 5000 // config.PORT || 5000

app.set('trust proxy', 1)

// Middleware
const allowedOrigins = [
  'https://electrosafeweb.com',  // Dominio de producción
  'http://localhost:3000'         // Origen de desarrollo
]

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true)
    }
    return callback(new Error('No permitido por CORS'))
  },
  credentials: true // Habilita el uso de credenciales (cookies, autorizaciones)
}))
app.use(cookieParser())
app.use(express.json())

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

// Middleware general de manejo de errores (opcional)
app.use((err, req, res, next) => {
  res.status(500).json({ message: 'Ocurrió un error en el servidor', error: err.message })
})

// ================================
// ⏱ CHECK PRIORITY WHATSAPP
// ================================
setInterval(async () => {
  try {
    await ConversationManager.checkWaitingPriority(60); // 1 para pruebas 60 produccion.
  } catch (error) {
    logger.debug('Error revisando prioridades:', error);
  }
}, 60 * 1000); // cada 1 minuto

/* ==========================================
   🛑 GLOBAL ERROR HANDLERS (PRODUCCIÓN)
========================================== */
process.on('uncaughtException', (err) => {
  logger.fatal(`Uncaught Exception: ${err.stack}`)
})

process.on('unhandledRejection', (reason) => {
  logger.fatal(`Unhandled Rejection: ${reason}`)
})

process.on('SIGTERM', async () => {
  logger.warn('Proceso detenido (SIGTERM)')
  try {
    await client.destroy()
  } catch (err) {
    logger.error(`Error cerrando WhatsApp: ${err.message}`)
  }
  process.exit(0)
})



// START THE SERVER
app.listen(port, async () => {
  logger.info(`Server is running on port: ${port}`);

  if (!global.clientInitialized) {
    client.initialize();
    global.clientInitialized = true;
  }
})

// 🔥 HANDLERS DE MENSAJES
botHandlers(client);


// ====== WHATSAPP BOT ======
/*client.on('qr', (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  logger.info('WhatsApp Bot conectado ✅');
});

client.on('change_state', (state) => {
  logger.info(`Estado cambió a: ${state}`)
});

client.on('disconnected', async (reason) => {
  logger.error(`WhatsApp desconectado ❌ Motivo: ${reason}`)

  try {
    await client.destroy().catch(() => {})
    await client.initialize()
  } catch (err) {
    logger.fatal(`Reinicio fallido: ${err.message}`)
  }
})

// 🛡 WATCHDOG PRODUCCIÓN
let lastConnectedState = 'CONNECTED'

setInterval(async () => {
  try {
    const state = await client.getState()
    logger.info(`Estado actual: ${state}`)

    if (state !== 'CONNECTED') {
      logger.info(`Estado inválido detectado: ${state}`)

      if (lastConnectedState === 'CONNECTED') {
        logger.info(`⚠️ WhatsApp perdió conexión. Estado: ${state}`)
      }

      await client.destroy()
      await client.initialize()
    }

    lastConnectedState = state

  } catch (err) {
    logger.fatal(`💥 Error obteniendo estado WhatsApp: ${err.message}`)

    await client.destroy()
    await client.initialize()
  }
}, 600000)  */
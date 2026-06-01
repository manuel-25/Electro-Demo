import winston from 'winston'
import { Mail } from 'winston-mail'
import config from './config.js'

const hasMailCredentials = Boolean(config.GMAIL_USER && config.BREVO_USER && config.BREVO_PASS)

winston.addColors({
  fatal: 'red',
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'blue',
})

const transports = [
  new winston.transports.Console(),
  new winston.transports.File({ filename: 'error.log', level: 'error' }),
  new winston.transports.File({ filename: 'info.log', level: 'info' }),
]

if (!config.DEMO_MODE && hasMailCredentials) {
  transports.push(
    new Mail({
      to: config.GMAIL_USER,
      from: config.GMAIL_USER,
      subject: '[ALERTA ELECTROSAFE] Revisar error en produccion',
      level: 'error',
      host: 'smtp-relay.brevo.com',
      username: config.BREVO_USER,
      password: config.BREVO_PASS,
      port: 587,
      secure: false,
    })
  )
}

const logger = winston.createLogger({
  levels: {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
  },
  format: winston.format.combine(
    winston.format.timestamp({
      format: () =>
        new Date().toLocaleString('es-AR', {
          timeZone: 'America/Argentina/Buenos_Aires',
          hour12: false,
        }),
    }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} ${level}: ${message}`
    })
  ),
  transports,
})

logger.on('logging', (transport, log) => {
  if ((log.level === 'error' || log.level === 'fatal') && transport instanceof Mail) {
    transport.content = `
      <p><strong>Error en la aplicacion</strong></p>
      <p>${log.message}</p>
      <p><strong>Hora del error:</strong> ${new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', hour12: false })}</p>
    `
  }
})

export { logger }

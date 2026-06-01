import nodemailer from 'nodemailer'
import config from '../utils/config.js'
import { logger } from '../utils/logger.js'

const hasMailCredentials = Boolean(config.BREVO_USER && config.BREVO_PASS && config.GMAIL_USER)

const transporter = hasMailCredentials
  ? nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: config.BREVO_USER,
        pass: config.BREVO_PASS
      }
    })
  : null

const verifyConnection = async () => {
  if (config.DEMO_MODE || !transporter) {
    logger.info('Email provider disabled for demo/local environment')
    return
  }

  try {
    await transporter.verify()
    logger.info('Servidor listo para enviar correos')
  } catch (error) {
    logger.error(`Error verificando la conexion SMTP: ${error.message}`)
  }
}

verifyConnection()

export const sendEmail = async (to, subject, htmlContent) => {
  if (config.DEMO_MODE || !transporter) {
    logger.info(`[DEMO] Email omitido: ${subject} -> ${to}`)
    return { skipped: true, demoMode: config.DEMO_MODE }
  }

  try {
    const info = await transporter.sendMail({
      from: config.GMAIL_USER,
      to,
      subject,
      html: htmlContent,
    })

    logger.info(`Correo enviado: ${info.response}`)
    return info
  } catch (error) {
    logger.fatal(`Error enviando correo: ${error.message}`)
    throw new Error('Fallo al enviar el correo')
  }
}

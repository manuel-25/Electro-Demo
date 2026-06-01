import dotenv from 'dotenv'

dotenv.config({ path: './.env' })

const nodeEnv = process.env.NODE_ENV || 'development'

const config = {
  NODE_ENV: nodeEnv,
  DEMO_MODE: process.env.DEMO_MODE === 'true',
  MONGO_URI: process.env.MONGO_URI,
  PORT: process.env.PORT,
  GMAIL_USER: process.env.GMAIL_USER,
  GMAIL_PASS: process.env.GMAIL_PASS,
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET,
  REFRESH_TOKEN: process.env.REFRESH_TOKEN,
  BREVO_USER: process.env.BREVO_USER,
  BREVO_PASS: process.env.BREVO_PASS,
  MAILER_USER: process.env.MAILER_USER,
  MAILER_PASS: process.env.MAILER_PASS,
  JWT_SECRET: process.env.JWT_SECRET,

  COLLECTIONS: {
    CLIENTS: process.env.DEMO_MODE === 'true' ? 'demo_clients' : 'clients',
    QUOTES: process.env.DEMO_MODE === 'true' ? 'demo_cotizaciones' : 'cotizaciones',
    SERVICES: process.env.DEMO_MODE === 'true'
      ? 'demo_services'
      : nodeEnv === 'development'
        ? 'services_backup'
        : 'services',
    USERS: process.env.DEMO_MODE === 'true' ? 'demo_users' : 'users'
  },

  APP_URL:
    nodeEnv === 'production'
      ? process.env.APP_URL_PROD
      : process.env.APP_URL_DEV || 'http://localhost:3000',

  FRONTEND_ORIGINS: (process.env.FRONTEND_ORIGINS || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean),

  AUTH: {
    MAX_LOGIN_ATTEMPTS: Number(process.env.MAX_LOGIN_ATTEMPTS) || 5,
    LOCK_TIME:
      nodeEnv === 'production'
        ? Number(process.env.LOGIN_LOCK_TIME) || 15 * 60 * 1000
        : 60 * 1000
  }
}

export default config

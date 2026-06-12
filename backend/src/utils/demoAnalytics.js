import crypto from 'crypto'
import geoip from 'geoip-lite'
import config from './config.js'
import { DemoEventModel, DemoVisitorModel } from '../Mongo/models/demoAnalytics.model.js'
import { logger } from './logger.js'

const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

export function getRequestMeta(req) {
  const forwardedFor = req.headers['x-forwarded-for']
  const ip = String(forwardedFor || req.ip || req.socket?.remoteAddress || '')
    .split(',')[0]
    .replace('::ffff:', '')
    .trim()
  const geo = geoip.lookup(ip)

  return {
    ip,
    userAgent: req.headers['user-agent'] || '',
    referrer: req.headers.referer || req.headers.referrer || '',
    origin: req.headers.origin || '',
    country: geo?.country || '',
    region: geo?.region || '',
    city: geo?.city || ''
  }
}

export function normalizeDemoEmail(email) {
  return String(email || '').trim().toLowerCase()
}

export async function createDemoSession(email, req) {
  const normalizedEmail = normalizeDemoEmail(email)
  const sessionId = crypto.randomUUID()
  const meta = getRequestMeta(req)

  const visitor = await DemoVisitorModel.findOneAndUpdate(
    { email: normalizedEmail },
    {
      $set: { email: normalizedEmail, sessionId, lastSeenAt: new Date(), meta },
      $setOnInsert: { firstSeenAt: new Date() },
      $inc: { visitCount: 1 }
    },
    { upsert: true, new: true }
  ).lean()

  await recordDemoEvent({
    type: 'session_start',
    name: 'demo_login',
    email: normalizedEmail,
    sessionId,
    path: req.originalUrl,
    meta
  })

  return { visitor, sessionId }
}

export async function touchDemoVisitor({ sessionId, email, req }) {
  if (!sessionId && !email) return
  const filter = sessionId ? { sessionId } : { email: normalizeDemoEmail(email) }
  await DemoVisitorModel.updateOne(filter, {
    $set: {
      lastSeenAt: new Date(),
      ...(req ? { meta: getRequestMeta(req) } : {})
    }
  })
}

export async function recordDemoEvent(event) {
  if (!config.DEMO_MODE) return null
  try {
    return await DemoEventModel.create(event)
  } catch (error) {
    logger.warn(`No se pudo registrar evento demo: ${error.message}`)
    return null
  }
}

export function demoAnalyticsMiddleware(req, res, next) {
  if (!config.DEMO_MODE || req.path.startsWith('/api/demo')) return next()

  const startedAt = Date.now()
  res.on('finish', () => {
    if (!WRITE_METHODS.has(req.method)) return

    const sessionId = req.headers['x-demo-session-id']
    const email = normalizeDemoEmail(req.headers['x-demo-user-email'] || req.user?.email)
    const failed = res.statusCode >= 400

    recordDemoEvent({
      type: failed ? 'api_error' : 'api_mutation',
      name: `${req.method} ${req.path}`,
      sessionId,
      email,
      path: req.originalUrl,
      method: req.method,
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt,
      entityType: getEntityType(req.path),
      entityId: req.params?.id || req.params?.code || '',
      payload: sanitizeBody(req.body),
      meta: getRequestMeta(req)
    })
  })

  next()
}

function getEntityType(path) {
  if (path.includes('/service')) return 'service'
  if (path.includes('/client')) return 'client'
  if (path.includes('/quotes')) return 'quote'
  if (path.includes('/stats')) return 'stats'
  return 'api'
}

function sanitizeBody(body = {}) {
  const { password, token, authToken, ...safeBody } = body || {}
  return safeBody
}

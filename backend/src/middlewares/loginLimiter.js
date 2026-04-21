import rateLimit, { ipKeyGenerator } from 'express-rate-limit'

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Demasiados intentos, intentá más tarde' },
  standardHeaders: true,
  legacyHeaders: false,

  keyGenerator: (req) => {
    const ip = ipKeyGenerator(req)
    const email = req.body?.email || 'unknown'
    return `${email}-${ip}`
  }
})

export default loginLimiter
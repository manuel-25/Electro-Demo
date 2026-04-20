import rateLimit from 'express-rate-limit'

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10,
  message: { message: 'Demasiados intentos, intentá más tarde' },
  standardHeaders: true,
  legacyHeaders: false
})

export default loginLimiter
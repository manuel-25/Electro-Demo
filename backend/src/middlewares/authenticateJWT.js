import jwt from 'jsonwebtoken'
import config from '../utils/config.js'
import { DEMO_USER_ID } from '../demo/demoData.js'

const authenticateJWT = (req, res, next) => {
  const token = req.cookies?.authToken
  if (!token) {
    if (config.DEMO_MODE) {
      req.user = {
        _id: DEMO_USER_ID,
        email: 'demo@electrofix.app',
        role: 'admin'
      }
      return next()
    }
    return res.sendStatus(401)
  }

  jwt.verify(token, config.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.sendStatus(403)
    }
    req.user = {
      _id: decoded.id,
      email: decoded.email,
      role: decoded.role
    }
    next()
  })
}


export default authenticateJWT

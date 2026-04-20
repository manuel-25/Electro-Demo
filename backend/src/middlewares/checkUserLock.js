import UserManager from '../Mongo/UserManager.js'

const checkUserLock = async (req, res, next) => {
  try {
    const { email } = req.body

    if (!email) return next()

    const user = await UserManager.getByEmail(email)

    if (!user) return next()

    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(403).json({
        message: 'Cuenta bloqueada temporalmente. Intente más tarde.',
        lockUntil: user.lockUntil
      })
    }

    // IMPORTANTE: adjuntar usuario
    req.userDB = user

    next()
  } catch (error) {
    next(error)
  }
}

export default checkUserLock
import express from 'express'
import UserController from '../controllers/userController.js'
import authenticateJWT from '../middlewares/authenticateJWT.js'
import authenticateAdmin from '../middlewares/authenticateAdmin.js'
import checkUserLock from '../middlewares/checkUserLock.js'
import loginLimiter from '../middlewares/loginLimiter.js'

const router = express.Router()

router.get('/verifytoken', authenticateJWT, UserController.verifyToken)
router.post('/login', loginLimiter, checkUserLock, UserController.login)
router.post('/logout', authenticateJWT, UserController.logout)
router.get('/me', authenticateJWT, UserController.getProfile)

// 🔐 Solo admins
router.post('/', /*authenticateJWT, authenticateAdmin,*/ UserController.createUser)
router.get('/', authenticateJWT, authenticateAdmin, UserController.getUsers)
router.get('/:email', authenticateJWT, authenticateAdmin, UserController.getUserByEmail)
router.put('/:email', authenticateJWT, authenticateAdmin, UserController.updateUserByEmail)
router.delete('/:email', authenticateJWT, authenticateAdmin, UserController.deleteUserByEmail)


export default router

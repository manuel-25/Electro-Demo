import express from 'express'
import authenticateJWT from '../middlewares/authenticateJWT.js'
import ConversationController from '../controllers/conversationController.js'

const router = express.Router()

router.get('/', authenticateJWT, ConversationController.getAll)

router.get('/count/sidebar', authenticateJWT, ConversationController.getSidebarCounts)

router.get('/:phone/messages', authenticateJWT, ConversationController.getMessages)

router.post('/:phone/messages', authenticateJWT, ConversationController.sendMessage)

router.post('/:phone/resolve', authenticateJWT, ConversationController.resolve)

router.post('/:phone/take', authenticateJWT, ConversationController.takeConversation)

export default router

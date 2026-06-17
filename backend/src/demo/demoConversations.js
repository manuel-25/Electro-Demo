import { buildDemoData } from './demoData.js'
import { getWhatsappCapabilities } from '../services/whatsappMessagingService.js'

const DEMO_PROVIDER = 'demo'

let conversations = buildDemoData().conversations.map(conversation => ({
  ...conversation,
  channelProvider: DEMO_PROVIDER,
  messages: (conversation.messages || []).map(message => ({
    ...message,
    provider: DEMO_PROVIDER
  }))
}))

const clone = (value) => JSON.parse(JSON.stringify(value))
const normalizePhone = (phone = '') => decodeURIComponent(phone)

function findConversation(phone) {
  return conversations.find(conversation => conversation.phone === normalizePhone(phone))
}

export function getDemoConversations() {
  return clone(conversations)
}

export function getDemoSidebarCounts() {
  return conversations.reduce((acc, conversation) => {
    if (conversation.status === 'waiting') acc.pending += 1
    if (conversation.status === 'priority') acc.priority += 1
    return acc
  }, { pending: 0, priority: 0 })
}

export function getDemoConversationMessages(phone) {
  const conversation = findConversation(phone)
  if (!conversation) return null

  conversation.unreadCount = 0
  return {
    conversation: clone(conversation),
    messages: clone(conversation.messages || []),
    capabilities: getWhatsappCapabilities(conversation)
  }
}

export function takeDemoConversation(phone, email = 'demo@electrosafe.app') {
  const conversation = findConversation(phone)
  if (!conversation) return null

  if (['waiting', 'priority'].includes(conversation.status)) {
    conversation.status = 'in_progress'
    conversation.assignedTo = email
    conversation.lastAssignedTo = email
    conversation.inProgressAt = new Date()
    conversation.firstResponseAt = conversation.firstResponseAt || new Date()
    conversation.unreadCount = 0
  }

  return clone(conversation)
}

export function resolveDemoConversation(phone) {
  const conversation = findConversation(phone)
  if (!conversation) return null

  conversation.status = 'resolved'
  conversation.unreadCount = 0
  conversation.assignedTo = null
  conversation.inProgressAt = null

  return clone(conversation)
}

export function sendDemoConversationMessage(phone, text) {
  const conversation = findConversation(phone)
  if (!conversation) return null

  const message = {
    sender: 'human',
    text,
    provider: DEMO_PROVIDER,
    status: 'sent',
    createdAt: new Date()
  }

  conversation.messages = [...(conversation.messages || []), message]
  conversation.lastMessage = text
  conversation.lastMessageAt = new Date()
  conversation.lastOutboundAt = new Date()
  conversation.channelProvider = DEMO_PROVIDER
  conversation.unreadCount = 0

  if (conversation.status === 'waiting' || conversation.status === 'priority') {
    conversation.status = 'in_progress'
    conversation.firstResponseAt = conversation.firstResponseAt || new Date()
    conversation.inProgressAt = conversation.inProgressAt || new Date()
  }

  return {
    conversation: clone(conversation),
    capabilities: getWhatsappCapabilities(conversation)
  }
}

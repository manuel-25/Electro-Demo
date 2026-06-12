import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ['user', 'bot', 'human'],
    required: true
  },
  text: {
    type: String,
    trim: true
  },
  provider: {
    type: String,
    enum: ['whatsapp-web', 'cloud-api', 'demo', 'manual'],
    default: 'manual'
  },
  externalId: String,
  status: {
    type: String,
    enum: ['queued', 'sent', 'delivered', 'read', 'failed'],
    default: 'sent'
  },
  error: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const ConversationSchema = new mongoose.Schema({

  phone: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  /* 👤 Datos del contacto */
  contactName: {
    type: String,
    trim: true
  },
  /* 📝 Últimos mensajes */
  lastMessage: String,
  lastMessageAt: Date,
  lastCustomerMessage: String,
  lastCustomerMessageAt: Date,
  unreadCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['bot', 'waiting', 'priority', 'in_progress', 'resolved'],
    default: 'bot'
  },
  humanRequestedAt: Date,
  assignedTo: {
    type: String,
    default: null
  },

  inProgressAt: Date,
  lastAssignedTo: String,
  firstResponseAt: Date,
  lastOutboundAt: Date,
  channelProvider: {
    type: String,
    enum: ['whatsapp-web', 'cloud-api', 'demo', 'manual'],
    default: 'manual'
  },

  messages: [MessageSchema]

}, { timestamps: true });

export default mongoose.model('Conversation', ConversationSchema);

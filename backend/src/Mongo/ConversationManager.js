import Conversation from './models/conversation.model.js';

class ConversationManager {

  async createOrUpdate(phone, updateData = {}) {
    return await Conversation.findOneAndUpdate(
      { phone },
      { phone, ...updateData },
      { upsert: true, new: true }
    );
  }

  async getAll() {
    return await Conversation.find().sort({ humanRequestedAt: 1 }).lean();
  }

  async getMessages(phone) {
    const conversation = await Conversation.findOne({ phone }).lean();
    return conversation?.messages || [];
  }

  async getByPhone(phone) {
    return await Conversation.findOne({ phone });
  }

  async updateByPhone(phone, updateData) {
    return await Conversation.findOneAndUpdate(
      { phone },
      updateData,
      { new: true }
    );
  }

  async setHumanRequestedAt(phone, date) {
    return await Conversation.findOneAndUpdate(
      { phone },
      { humanRequestedAt: date },
      { new: true }
    );
  }

  async checkWaitingPriority(limitMinutes = 60) {
    const limitDate = new Date(Date.now() - limitMinutes * 60 * 1000);

    return await Conversation.updateMany(
      {
        status: 'waiting',
        humanRequestedAt: { $lte: limitDate }
      },
      {
        status: 'priority'
      }
    );
  }

  async resetUnread(phone) {
    return await Conversation.findOneAndUpdate(
      { phone },
      { unreadCount: 0 },
      { new: true }
    );
  }

  async resolveConversation(phone) {
    return await Conversation.findOneAndUpdate(
      { phone },
      {
        status: 'resolved',
        unreadCount: 0,
        assignedTo: null,
        inProgressAt: null
      },
      { new: true }
    );
  }

  async addMessage(phone, message) {
    let conversation = await Conversation.findOne({ phone });

    if (!conversation) {
      return Conversation.create({
        phone,
        messages: [message],
        lastMessage: message.text,
        lastMessageAt: new Date(),
        lastCustomerMessage: message.sender === 'user' ? message.text : undefined,
        lastCustomerMessageAt: message.sender === 'user' ? new Date() : undefined,
        unreadCount: message.sender === 'user' ? 1 : 0,
        status: 'bot'
      });
    }

    conversation.messages.push(message);
    conversation.lastMessage = message.text;
    conversation.lastMessageAt = new Date();

    if (message.sender === 'user') {
      conversation.unreadCount += 1;
      conversation.lastCustomerMessage = message.text;
      conversation.lastCustomerMessageAt = new Date();
    } else if (message.sender === 'human') {
      conversation.unreadCount = 0;
      conversation.lastOutboundAt = new Date();
      conversation.channelProvider = message.provider || conversation.channelProvider;
    }

    await conversation.save();
    return conversation;
  }

  // ConversationManager.js
  async assignToUser(phone, email, firstResponseDate = new Date()) {
    return await Conversation.findOneAndUpdate(
      { phone, status: { $in: ['waiting', 'priority'] } },
      {
        status: 'in_progress',
        assignedTo: email,
        lastAssignedTo: email,
        inProgressAt: new Date(),
        firstResponseAt: firstResponseDate,
        unreadCount: 0
      },
      { new: true }
    );
  }

  async addHumanMessage(phone, text, meta = {}) {
    return this.addMessage(phone, {
      sender: 'human',
      text,
      provider: meta.provider || 'manual',
      externalId: meta.externalId,
      status: meta.status || 'sent',
      error: meta.error
    });
  }

  async getSidebarCount() {
    const pending = await Conversation.countDocuments({
      status: 'waiting'
    });

    const priority = await Conversation.countDocuments({
      status: 'priority'
    });

    return { pending, priority };
  }
}

export default new ConversationManager();

import ConversationManager from '../Mongo/ConversationManager.js';
import { getWhatsappCapabilities, sendWhatsappMessage } from '../services/whatsappMessagingService.js';
import config from '../utils/config.js';
import {
  getDemoConversationMessages,
  getDemoConversations,
  getDemoSidebarCounts,
  resolveDemoConversation,
  sendDemoConversationMessage,
  takeDemoConversation
} from '../demo/demoConversations.js';

class ConversationController {
  // 📋 Obtener todas (para dashboard)
  static async getAll(req, res) {
    try {
      if (config.DEMO_MODE) {
        return res.json(getDemoConversations());
      }

      const conversations = await ConversationManager.getAll();
      res.json(conversations);
    } catch (error) {
      console.error('Error al obtener conversaciones', error);
      res.status(500).json({ error: 'Error al obtener conversaciones' });
    }
  }

  static async getMessages(req, res) {
    try {
      const { phone } = req.params;
      if (config.DEMO_MODE) {
        const demoConversation = getDemoConversationMessages(phone);
        if (!demoConversation) return res.status(404).json({ error: 'Conversacion demo no encontrada' });
        return res.json(demoConversation);
      }

      const conversation = await ConversationManager.getByPhone(phone);
      if (!conversation) return res.status(404).json({ error: 'Conversacion no encontrada' });

      await ConversationManager.resetUnread(phone);
      res.json({
        conversation,
        messages: conversation.messages || [],
        capabilities: getWhatsappCapabilities(conversation)
      });
    } catch (error) {
      console.error('Error obteniendo mensajes', error);
      res.status(500).json({ error: 'Error al obtener mensajes' });
    }
  }

  static async sendMessage(req, res) {
    try {
      const { phone } = req.params;
      const { text } = req.body;

      if (config.DEMO_MODE) {
        const updated = sendDemoConversationMessage(phone, text);
        if (!updated) return res.status(404).json({ error: 'Conversacion demo no encontrada' });
        return res.status(201).json(updated);
      }

      const conversation = await ConversationManager.getByPhone(phone);
      if (!conversation) return res.status(404).json({ error: 'Conversacion no encontrada' });

      const result = await sendWhatsappMessage({ phone, text, conversation });
      const updated = await ConversationManager.addHumanMessage(phone, text, {
        provider: result.provider,
        externalId: result.externalId,
        status: result.status,
        error: result.error
      });

      if (!result.ok) {
        return res.status(409).json({
          error: result.error,
          conversation: updated,
          capabilities: getWhatsappCapabilities(updated)
        });
      }

      res.status(201).json({
        conversation: updated,
        capabilities: getWhatsappCapabilities(updated)
      });
    } catch (error) {
      console.error('Error enviando mensaje', error);
      res.status(500).json({ error: 'Error al enviar mensaje' });
    }
  }

  // ✅ Resolver conversación
  static async resolve(req, res) {
    try {
      const { phone } = req.params;
      if (config.DEMO_MODE) {
        const updated = resolveDemoConversation(phone);
        if (!updated) return res.status(404).json({ error: 'Conversacion demo no encontrada' });
        return res.json(updated);
      }

      const updated = await ConversationManager.resolveConversation(phone);
      res.json(updated);
    } catch (error) {
      console.error('Error resolviendo conversación', error);
      res.status(500).json({ error: 'Error al resolver conversación' });
    }
  }

  // 🟢 Tomar conversación (poner en gestión)
  static async takeConversation(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Usuario no autenticado' });
        }

        const email = req.user.email;
        const { phone } = req.params;

        if (config.DEMO_MODE) {
            const updated = takeDemoConversation(phone, email);
            if (!updated) return res.status(404).json({ error: 'Conversacion demo no encontrada' });
            return res.json(updated);
        }

        // Asignar al usuario y setear firstResponseAt
        const updated = await ConversationManager.assignToUser(phone, email, new Date());

        if (!updated) {
            return res.status(404).json({ error: 'Conversación no encontrada' });
        }

        res.json(updated);

    } catch (error) {
        console.error('❌ Error tomando conversación', error);
        res.status(500).json({ error: 'Error al tomar conversación' });
    }
  }

  // 🔔 Conteo para Sidebar
  static async getSidebarCounts(req, res) {
    try {
      if (config.DEMO_MODE) {
        return res.json(getDemoSidebarCounts());
      }

      const counts = await ConversationManager.getSidebarCount();
      res.json(counts);
    } catch (error) {
      console.error('Error obteniendo conteo sidebar', error);
      res.status(500).json({ error: 'Error al obtener conteos' });
    }
  }

}

export default ConversationController;

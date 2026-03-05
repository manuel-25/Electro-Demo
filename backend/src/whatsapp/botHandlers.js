// botHandlers.js
import ConversationManager from '../Mongo/ConversationManager.js';
import ServiceManager from '../Mongo/ServiceManager.js';
import { getSession, updateSession } from './sessionManager.js';
import { logger } from '../utils/logger.js';
import {
  greeting,
  mainMenu,
  askRepairCode,
  invalidRepairCodeMessage,
  repairNotFoundMessage,
  repairStatusMessage,
  locationMessage,
  humanMessage,
  cancelMessage,
  thanksMessage,
  frustrationMessage,
  fallbackMessage,
  technicalReportMessage,
} from './botMenus.js';

const DEV_PHONES = [
  '5491121842237@c.us',
  '5491136106124@c.us'
];

function isConversationExpired(lastMessageAt) {
  const hours24 = 24 * 60 * 60 * 1000;
  return !lastMessageAt || (Date.now() - lastMessageAt > hours24);
}

// ================================
// 🔤 NORMALIZADORES
// ================================
function normalize(text) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function normalizeNumbers(text) {
  const map = { 'uno':'1','dos':'2','tres':'3','cuatro':'4' };
  text = text.toLowerCase();
  for (const [word,num] of Object.entries(map)) {
    text = text.replace(new RegExp(`\\b${word}\\b`, 'g'), num);
  }
  return text;
}

// ================================
// 👋 SALUDO
// ================================
function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Buen día";
  if (hour >= 12 && hour < 19) return "Buenas tardes";
  return "Buenas noches";
}

function detectUserGreeting(text) {
  const greetings = ["hola","holaa","holi","buen dia","buenos dias","buenas tardes","buenas noches","buenas"];
  const clean = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return greetings.some(g => clean.includes(g));
}

// ================================
// 🎯 INTENCIONES
// ================================
function wantsHuman(text) {
  return ['asesor','humano','persona','operador','alguien'].some(t => text.includes(t));
}

function wantsRepair(text) {
  return ['reparar','arreglar','cotizar','presupuesto','no anda','no funciona','no enciende','no prende','se rompio','se apago'].some(t => text.includes(t));
}

function wantsRepairStatus(text) {
  return ['estado','arreglo','reparación','reparacion','servicio'].some(t => text.includes(t));
}

function wantsLocation(text) {
  return ['horario','direccion','donde','ubicacion','abren','cierran','sucursal'].some(t => text.includes(t));
}

function wantsTechnicalReport(text) {
  return ['informe','seguro','informe tecnico'].some(t => text.includes(t));
}

function wantsToClose(text) {
  const closing = ['no gracias','ninguna','nada','esta bien','listo','chau','adios'];
  return closing.includes(text.trim());
}

function detectFrustration(text) {
  return ['no entiendo','no me entendiste','esto no funciona','que pasa', '?'].some(t => text.includes(t));
}

function isThanks(text) {
  return ['gracias','muchas gracias','mil gracias', 'gracias!', 'gracias!!', 'gracias!!!', 'mil gracias!', 'mil graciaqs!!', 'muchisimas gracias'].includes(text.trim());
}

// ================================
// 🤖 ENVÍO MENSAJE
// ================================
async function botSend(client, chatId, text) {
  try {
    const sent = await client.sendMessage(chatId, text);

    await ConversationManager.addMessage(chatId, {
      sender: 'bot',
      text
    });

    return sent;
  } catch (err) {
    logger.error(`Error enviando mensaje a ${chatId}: ${err.message}`);
  }
}

// ================================
// 👤 ESCALAR HUMANO
// ================================
async function escalateToHuman(client, chatId, sendMessage = true) {
  try {
    const conv = await ConversationManager.getByPhone(chatId);

    if (!conv || conv.status !== 'in_progress') {
      await ConversationManager.createOrUpdate(chatId, {
        status: 'waiting',
        humanRequestedAt: new Date()
      });
    }

    // Enviar mensaje solo si sendMessage es true
    if (sendMessage) {
      await botSend(client, chatId, humanMessage);
    }

    updateSession(chatId, { step: 'waiting_human', fallbackCount: 0 });

  } catch (err) {
    logger.error(`Error escalando a humano para ${chatId}: ${err.message}`);
  }
}

// ================================
// 📦 CONSULTA ESTADO SERVICIO
// ================================
async function checkRepairStatus(client, chatId, text, originalText) {
  // Cancelar
  if (text === 'cancelar') {
    updateSession(chatId, { step: 'menu', fallbackCount: 0 });
    await botSend(client, chatId, cancelMessage);
    await botSend(client, chatId, mainMenu);
    return true;
  }

  // Escalar a humano
  if (wantsHuman(text)) {
    await escalateToHuman(client, chatId);
    return true;
  }

  // Validación de código
  const publicId = originalText.trim();   // evitamos normalizar
  if (!/^[a-zA-Z0-9]{6,10}$/.test(publicId)) {
    await botSend(client, chatId, invalidRepairCodeMessage);
    return true;
  }

  const service = await ServiceManager.getByPublicId(publicId);

  if (!service) {
    await botSend(client, chatId, repairNotFoundMessage);
    return true;
  }

  // Mostrar estado del servicio
  await botSend(client, chatId, repairStatusMessage(service));

  updateSession(chatId, { step: 'menu', fallbackCount: 0 });
  return true;
}

// ================================
// 🚀 HANDLER PRINCIPAL
// ================================
export default function botHandlers(client) {
  global.client = client;

  client.on('message', async (message) => {
    try {
      if (!DEV_PHONES.includes(message.from)) return;
      if (message.fromMe) return;
      if (!message.body) return;

      const userId = message.from;
      const contact = await message.getContact();
      const name = contact.pushname || '';

      const originalText = message.body.trim();
      let text = normalize(originalText);
      text = normalizeNumbers(text);

      // OBTENGO LA SESSION DEL USUARIO
      const session = getSession(userId) || {};
      const now = Date.now();
      const isNewConversation = isConversationExpired(session.lastMessageAt);
      if (isNewConversation) {
        updateSession(userId, { fallbackCount: 0 });
      }

      // Guardar mensaje en DB
      await ConversationManager.addMessage(userId, {
        sender: 'user',
        text: originalText
      });

      // Actualizar última interacción
      updateSession(userId, { lastMessageAt: now });

      // 🔹 OBTENGO CONVERSACIÓN
      const conversation = await ConversationManager.getByPhone(userId);

      // ================================  
      // 🔄 PRIMERO REINICIO SI ESTABA RESUELTA
      // ================================

      if (conversation?.status === 'resolved') {

        await ConversationManager.updateByPhone(userId, {
          status: 'bot',
          assignedTo: null,
          humanRequestedAt: null,
          firstResponseAt: null,
        });

        updateSession(userId, { step: 'menu', fallbackCount: 0 });

        await botSend(client, userId, greeting(getTimeGreeting(), name));
        await botSend(client, userId, mainMenu);

        return;
      }

      // ================================  
      // MODO HUMANO
      // ================================

      // 🟡 Esperando que alguien lo tome
      if (conversation?.status === 'waiting' || conversation?.status === 'priority') {

        if (text === 'cancelar') {
          await ConversationManager.resolveConversation(userId);

          updateSession(userId, { step: 'menu', fallbackCount: 0 });

          await botSend(client, userId, cancelMessage);
          await botSend(client, userId, mainMenu);
        }

        return;
      }

      // 🔴 Ya está siendo atendido por humano
      if (conversation?.status === 'in_progress') {
        return;
      }

      // ================================  
      // 📦 CONSULTA ESTADO / CHECK_REPAIR
      // ================================
      if (session.step === 'check_repair') {
        const handled = await checkRepairStatus(client, userId, text, originalText);
        if (handled) return;
      }

      // ================================  
      // 👋 SALUDO
      // ================================
      // Si es conversación nueva → SIEMPRE saludo
      if (isNewConversation) {
        updateSession(userId, { step: 'menu', fallbackCount: 0 });
        await botSend(client, userId, greeting(getTimeGreeting(), name));
        await botSend(client, userId, mainMenu);
        return;
      }

      // Si solo es saludo y ya está en menu → no repetir
      if (detectUserGreeting(text)) {
        if (session.step === 'menu') return;

        updateSession(userId, { step: 'menu', fallbackCount: 0 });
        await botSend(client, userId, greeting(getTimeGreeting(), name));
        await botSend(client, userId, mainMenu);
        return;
      }

      // ================================  
      // 🔧 OPCIÓN 1: REPARACIÓN
      // ================================
      if (wantsRepair(text) || text === '1') {
        await botSend(client, userId,
`🔧 Podés cotizar tu reparación acá:
https://electrosafeweb.com/reparacion-electrodomesticos`);
        return;
      }

      // ================================  
      // 📦 OPCIÓN 2: CONSULTA ESTADO
      // ================================
      if (wantsRepairStatus(text) || text === '2') {
        updateSession(userId, { step: 'check_repair', fallbackCount: 0 });
        await botSend(client, userId, askRepairCode);
        return;
      }

      // ================================  
      // 🕒 OPCIÓN 3: UBICACIÓN
      // ================================
      if (wantsLocation(text) || text === '3') {
        await botSend(client, userId, locationMessage);
        return;
      }

      // ================================  
      // 👤 OPCIÓN 4: HUMANO
      // ================================
      if (wantsHuman(text) || text === '4') {
        await escalateToHuman(client, userId);
        return;
      }

      // ================================  
      // 📝 OPCIÓN 5: INFORME TÉCNICO
      // ================================
      if (wantsTechnicalReport(text) || text === '5') {
        await botSend(client, userId, technicalReportMessage);
        await escalateToHuman(client, userId, false);
        return;
      }

      // ================================  
      // 🔚 CIERRE
      // ================================
      if (wantsToClose(text)) {
        await botSend(client, userId, `Perfecto 😊\nSi necesitás algo más escribinos cuando quieras.`);
        updateSession(userId, { step: 'menu', fallbackCount: 0 });
        return;
      }

      // ================================  
      // 😕 FRUSTRACIÓN
      // ================================
      if (detectFrustration(text)) {
        await botSend(client, userId, frustrationMessage);
        await botSend(client, userId, mainMenu);
        return;
      }

      // ================================  
      // 🙏 GRACIAS
      // ================================
      if (isThanks(text)) {
        await botSend(client, userId, thanksMessage);
        return;
      }

      // ================================  
      // 🧠 FALLBACK
      // ================================
      if (fallbackCount >= 2) {
        await escalateToHuman(client, userId);
        updateSession(userId, { fallbackCount: 0 });
        return;
      }

      updateSession(userId, { fallbackCount: fallbackCount + 1 });
      await botSend(client, userId, fallbackMessage);
      await botSend(client, userId, mainMenu);

    } catch (err) {
      logger.error(`❌ Error en message: ${err.message}`);
    }
  });
}
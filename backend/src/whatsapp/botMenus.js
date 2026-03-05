// ================================
// 🟢 MENÚ PRINCIPAL
// ================================

export function greeting(name, greeting) {
  return `👋 ${greeting} ${name}, somos *Electrosafe Quilmes*.`;
}

export const mainMenu = `Elegí una opción:

1️⃣ Reparar un electrodoméstico  
2️⃣ Consultar estado de reparación  
3️⃣ Ver horarios y dirección  
4️⃣ Hablar con un asesor
5️⃣ Solicitar informe técnico para seguro

Respondé con el número.`;

// ================================
// 📦 CONSULTA ESTADO
// ================================

export const askRepairCode = `📦 Para consultar el estado de tu reparación necesitamos el código público que figura en tu ticket.

Ingresalo acá por favor 🙌
(Ejemplo: Ab3K9xYz)

Podés escribir *cancelar* para salir o *asesor* para hablar con un humano.`;

export const invalidRepairCodeMessage = `❌ Código inválido.

Ingresalo nuevamente o escribí *cancelar* para volver al menú.`;

export const repairNotFoundMessage = `❌ No encontramos un servicio con ese código.

Verificá que esté bien escrito.

Si querés salir escribí *cancelar*.  
Si necesitás ayuda, escribí *asesor* y te ayudamos personalmente 🙌`;

// ================================
// 📍 UBICACIÓN
// ================================

export const locationMessage = `📍 Av. Vicente López 770 - Quilmes

🕒 Horarios:
Lunes a Viernes 10 a 18 hs  
Sábados 10 a 13 hs`;

// ================================
// 👤 HUMANO
// ================================

export const humanMessage = `👤 Un asesor te responderá a la brevedad.

Mientras tanto, podés dejar detallada tu consulta 🙌

Escribí *cancelar* si querés volver al menú.`;

// ================================
// ❌ CANCELACIÓN
// ================================

export const cancelMessage = `❌ Operación cancelada.

Volvemos al menú principal 👇`;

// ================================
// 🙏 AGRADECIMIENTO
// ================================

export const thanksMessage = `😊 ¡Gracias a vos!`;

// ================================
// 😕 FRUSTRACIÓN
// ================================

export const frustrationMessage = `Perdón si no fui claro 🙏`;

// ================================
// 🤔 FALLBACK
// ================================

export const fallbackMessage = `No estoy seguro de haber entendido 🤔
¿En qué podemos ayudarte? Escribí asesor si necesitas ayuda.`;

// Informes Técnicos
export const technicalReportMessage = `📝 Realizamos *informes técnicos y presupuestos membretados* cuando se requiere una evaluación profesional del equipo.

El artefacto es previamente revisado por nuestro servicio técnico y, una vez realizado el diagnóstico, se emite la documentación formal con el detalle correspondiente.

Este tipo de informe puede utilizarse en trámites administrativos o gestiones con aseguradoras u otras entidades.

La emisión del informe queda sujeta a la verificación técnica previa.

Un asesor se comunicará con vos para explicarte los pasos a seguir 📄

Escribí *cancelar* para volver al menú.`;

export function repairStatusMessage(service) {
  let extraMessage = '';

  if (service.status === 'Listo para retirar') {
    extraMessage = `✅ Tu equipo ya se encuentra disponible para retirar.

📍 Podés acercarte a nuestra sucursal en:
Av. Vicente Lopez 770, Quilmes  
🕒 Horario: Lunes a Viernes de 10 a 18 hs.

Te recomendamos traer el comprobante de ingreso.`;
  }

  if (service.status === 'En Pruebas') {
    extraMessage = `🧪 Tu equipo se encuentra en etapa final de pruebas para garantizar su correcto funcionamiento.

En breve quedará listo para retirar. Te avisaremos apenas finalice el proceso 🙌`;
  }

  return `📦 *Estado de tu equipo:*

🔧 *Equipo:* ${service.equipmentType || '-'}
🏷 *Marca:* ${service.brand || '-'}
📊 *Estado:* ${service.status}

${extraMessage}

Si tenés dudas podés escribir *asesor* para hablar con un asesor.`;
}
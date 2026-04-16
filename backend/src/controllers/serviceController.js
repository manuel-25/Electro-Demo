import ServiceModel from '../Mongo/models/service.model.js'
import ClientManager from '../Mongo/ClientManager.js'
import NumberGenerator from '../services/numberGenerator.js'
import { logger } from '../utils/logger.js'

const VALID_PREFIX = ['Q','B','W']

const WORKORDER_TRANSITIONS = {
  'Sin presupuesto': ['Lista para enviar', 'Sin reparación'],

  'Lista para enviar': [
    'Sin presupuesto',
    'Sin reparación',
    'Enviada'
  ],

  'Enviada': [
    'Aceptada',
    'Rechazada'
  ],

  'Aceptada': [
    'Rechazada'
  ],

  'Rechazada': [
    'Aceptada'
  ],

  'Sin reparación': [
    'Sin presupuesto'
  ]
}

const WORKORDER_RULES = {
  requireBudget: ['Lista para enviar'],
  requireSent: ['Aceptada', 'Rechazada']
}

function isValidWorkOrderTransition(current, next) {
  if (!current) return true
  const allowed = WORKORDER_TRANSITIONS[current] || []
  return allowed.includes(next)
}

function validateStatusTransition(service, nextStatus, incomingChecklist) {

  const isNewFlow = service.flowVersion === 2
  if (!isNewFlow) return null

  // 🔥 EN GESTIÓN requiere checklist
  if (nextStatus === 'En Gestión') {
    if (
      !service.receptionChecklist?.completedAt &&
      !incomingChecklist?.completedAt
    ) {
      return 'Debe completar el checklist'
    }
  }

  // REPARACIÓN requiere aceptación
  if (nextStatus === 'Reparación') {
    if (service.workOrderStatus !== 'Aceptada') {
      return 'Debe aceptar la orden de trabajo'
    }
  }

  // ARMADO S/R requiere rechazo
  if (nextStatus === 'Armado S/R') {
    if (!['Rechazada', 'Sin reparación'].includes(service.workOrderStatus)) {
      return 'La orden debe estar rechazada'
    }
  }

  // LISTO requiere foto
  if (nextStatus === 'Listo para retirar') {
    /*if (!service.photos?.length) {
      return 'Debe subir una foto'
    } comentado por ahora  */
  }

  return null
}

class ServiceController {
  // ✅ getAllServices
  static async getAllServices(req, res) {
    try {
      const services = await ServiceModel.find()
      res.status(200).json(services)
    } catch (err) {
      logger.error('Error al obtener servicios', err)
      res.status(500).json({ error: 'Error al obtener los servicios' })
    }
  }

  // ✅ getServiceById
  static async getServiceById(req, res) {
    try {
      const service = await ServiceModel.findById(req.params.id)
      if (!service) return res.status(404).json({ error: 'Servicio no encontrado' })
      res.status(200).json(service)
    } catch (err) {
      logger.error('Error al obtener el servicio', err)
      res.status(500).json({ error: 'Error al obtener el servicio' })
    }
  }

  // ✅ getServiceByCode
  static async getServiceByCode(req, res) {
    try {
      const service = await ServiceModel.findOne({ code: req.params.code })
      if (!service) return res.status(404).json({ error: 'Servicio no encontrado por código' })
      res.status(200).json(service)
    } catch (err) {
      logger.error('Error al buscar servicio por código', err)
      res.status(500).json({ error: 'Error al buscar servicio por código' })
    }
  }

  // ✅ getServicesByCustomerNumber
  static async getServicesByCustomerNumber(req, res) {
    try {
      const services = await ServiceModel.find({ customerNumber: req.params.customerNumber })
      res.status(200).json(services)
    } catch (err) {
      logger.error('Error al buscar servicios por número de cliente', err)
      res.status(500).json({ error: 'Error al buscar servicios por número de cliente' })
    }
  }

  // ✅ getServicesByQuoteReference
  static async getServicesByQuoteReference(req, res) {
    try {
      const services = await ServiceModel.find({ quoteReference: req.params.quoteReference })
      res.status(200).json(services)
    } catch (err) {
      logger.error('Error al buscar servicios por referencia de cotización', err)
      res.status(500).json({ error: 'Error al buscar servicios por referencia de cotización' })
    }
  }

  // ✅ createService
  static async createService(req, res) {
    try {
      const {
        userData, equipmentType, description, userDescription, brand, model,
        serviceType, approximateValue, finalValue, repuestos,
        quoteReference, photos, receivedAtBranch,
        deliveryMethod, receivedNotes, receivedPhoto,
        notes, code, receptionChecklist
      } = req.body

      // 📌 Validación mínima: el teléfono sí es obligatorio
      if (!userData?.phone) {
        return res.status(400).json({ error: 'Número de teléfono obligatorio' })
      }

      // 📌 Buscar cliente según lo disponible
      let existingClient = null

      if (userData.email) {
        existingClient = await ClientManager.findByEmail(userData.email)
      }
      if (!existingClient && userData.customerNumber) {
        existingClient = await ClientManager.getByCustomerNumber(userData.customerNumber)
      }
      if (!existingClient && userData.phone) {
        existingClient = await ClientManager.getByPhone(userData.phone)
      }

      if (!existingClient) {
        return res.status(404).json({ error: 'Cliente no encontrado' })
      }

      // 📌 Verificar que el código no exista
      const exists = await ServiceModel.findOne({ code })
      if (exists) {
        return res.status(400).json({ error: 'Ya existe un servicio con este código' })
      }

      const isReceived = !!receivedAtBranch
      const initialStatus = isReceived ? 'Recibido' : 'Pendiente'

      const newServiceData = {
        customerNumber: existingClient.customerNumber,
        quoteReference,
        code,

        flowVersion: 2,

        userData: {
          ...userData,
          province: existingClient.province,
          municipio: existingClient.municipio
        },

        equipmentType,
        description,
        userDescription,
        brand,
        model,
        serviceType,
        approximateValue,
        finalValue: Number(finalValue) || 0,
        repuestos: Number(repuestos) || 0,

        status: initialStatus,
        statusHistory: [{
          status: initialStatus,
          changedBy: req.user.email,
          changedAt: new Date()
        }],

        createdBy: req.user._id,
        createdByEmail: req.user.email,

        receivedBy: isReceived ? req.user.email : null,
        receivedAtBranch: isReceived ? receivedAtBranch : null,
        receivedAt: isReceived ? new Date() : null,
        deliveryMethod: deliveryMethod || 'Presencial',
        receivedNotes: isReceived ? receivedNotes : null,
        receivedPhoto: isReceived ? receivedPhoto : null,

        lastModifiedBy: req.user.email || 'No definido',
        warrantyExpiration: Number(req.body.warrantyExpiration ?? 30),
        photos,
        notes: notes || '',
        receptionChecklist: receptionChecklist
          ? {
              wasRepairedBefore: receptionChecklist.wasRepairedBefore ?? null,
              isClean: receptionChecklist.isClean ?? null,
              hasAccessories: receptionChecklist.hasAccessories ?? null,

              accessories: Array.isArray(receptionChecklist.accessories)
                ? [
                    ...receptionChecklist.accessories,
                    ...(receptionChecklist.otroAccesorio
                      ? [receptionChecklist.otroAccesorio]
                      : [])
                  ]
                : receptionChecklist.otroAccesorio
                  ? [receptionChecklist.otroAccesorio]
                  : [],

              accessoriesNotes: receptionChecklist.accessoriesNotes || '',
              completedAt: receptionChecklist.completedAt || null,
              completedBy: receptionChecklist.completedBy || null
            }
          : {
              wasRepairedBefore: null,
              isClean: null,
              hasAccessories: null,
              accessories: [],
              accessoriesNotes: '',
              completedAt: null,
              completedBy: null
            }
      }

      const newService = await ServiceModel.create(newServiceData)
      res.status(201).json(newService)

    } catch (err) {
      console.error('❌ Error al crear servicio:', err)
      res.status(500).json({ error: 'Error al crear servicio', details: err.message })
    }
  }

  // ✅ getLastCode
  static async getLastCode(req, res) {
    try {
      const { prefix } = req.params
      if (!VALID_PREFIX.includes(prefix)) {
        return res.status(400).json({ error: 'Prefijo inválido' })
      }

      // Busca códigos que empiecen por el prefijo y extrae el sufijo numérico
      const [{ num } = {}] = await ServiceModel.aggregate([
        { $match: { code: { $regex: `^${prefix}\\d+$` } } },
        {
          $project: {
            num: {
              $toInt: {
                $substrCP: ['$code', 1, { $subtract: [{ $strLenCP: '$code' }, 1] }]
              }
            }
          }
        },
        { $sort: { num: -1 } },
        { $limit: 1 }
      ])

      const next = (num || 1000) + 1
      return res.json({ nextCode: `${prefix}${next}` })
    } catch (err) {
      console.error('getLastCode error:', err)
      return res.status(500).json({ error: 'Error al obtener el siguiente código' })
    }
  }

  // ✅ updateServiceById
  static async updateServiceById(req, res) {
    const { id } = req.params
    const updates = req.body

    // 🔒 Limpieza ANTES de usar updates
    if (updates.receivedAtBranch === '') delete updates.receivedAtBranch
    if (updates.deliveryMethod === '') delete updates.deliveryMethod
    if ('statusHistory' in updates) delete updates.statusHistory

    try {
      const service = await ServiceModel.findById(id)
      if (!service) return res.status(404).json({ error: 'Servicio no encontrado' })

      const now = new Date()
      const changes = {
        ...updates,
        lastModifiedBy: req.body.lastModifiedBy || req.user?.email || 'Desconocido',
        lastModifiedAt: now
      }

      const statusHistory = []

      const asignandoSucursal =
        updates.receivedAtBranch &&
        updates.receivedAtBranch !== 'No recibido' &&
        !['Recibido', 'Entregado'].includes(service.status)

      if (asignandoSucursal) {
        changes.status = 'Recibido'
        changes.receivedAt = now
        changes.receivedBy = req.user?.email || 'Desconocido'

        statusHistory.push({
          status: 'Recibido',
          changedBy: req.user?.email || 'Desconocido',
          changedAt: now,
          receivedBy: req.user?.email || 'Desconocido',
          receivedAtBranch: updates.receivedAtBranch
        })
      }

      const updateObj = {
        $set: changes,
        ...(statusHistory.length ? { $push: { statusHistory: { $each: statusHistory } } } : {})
      }

      const updated = await ServiceModel.findByIdAndUpdate(id, updateObj, {
        new: true,
        runValidators: true
      })

      res.status(200).json(updated)
    } catch (err) {
      logger.error('Error al actualizar el servicio', err)
      res.status(500).json({ error: 'Error al actualizar el servicio' })
    }
  }

  // ✅ updateServiceByCode
  static async updateServiceByCode(req, res) {
    try {
      if (req.body.code) {
        const existing = await ServiceModel.findOne({ code: req.body.code })
        if (existing && existing.code !== req.params.code) {
          return res.status(400).json({ error: 'El código ya está en uso por otro servicio' })
        }
      }
      const updated = await ServiceModel.findOneAndUpdate(
        { code: req.params.code },
        {
          ...req.body,
          lastModifiedBy: req.body.lastModifiedBy || '-',
          lastModifiedAt: new Date()
        },
        { new: true }
      )
      res.status(200).json(updated)
    } catch (err) {
      logger.error('Error al actualizar el servicio por código', err)
      res.status(500).json({ error: 'Error al actualizar el servicio por código' })
    }
  }

  // ✅ updateServiceStatus (reemplazar)
  static async updateServiceStatus(req, res) {
    const { id } = req.params
    const {
      status,
      receivedBy,
      note,
      receivedAtBranch,
      deliveredAt,
      isSatisfied,
      receptionChecklist
    } = req.body

    try {
      console.log('BODY:', req.body)
      const now = new Date()

      const service = await ServiceModel.findById(id)
      if (!service) {
        return res.status(404).json({ error: 'Servicio no encontrado' })
      }

      // 2. VALIDACIÓN DE FLUJO
      const error = validateStatusTransition(service, status, receptionChecklist)
      if (error) {
        return res.status(400).json({ error })
      }

      //Payload antes de actualizar
      const updatePayload = {
        status,
        lastModifiedBy: req.user.email,
        lastModifiedAt: now,

        ...(receivedBy && { receivedBy }),
        ...(note && { notes: note }),

        ...(status === 'Recibido' && receivedAtBranch && { receivedAtBranch }),
        ...(status === 'Recibido' && { receivedAt: now }),

        ...(status === 'Entregado' && { deliveredAt: deliveredAt || now }),
        ...(status === 'Entregado' && typeof isSatisfied === 'boolean' && { isSatisfied }),

        // 🔥 FIX CLAVE: guardar checklist tal cual viene del frontend
        ...(receptionChecklist && {
          receptionChecklist: {
            wasRepairedBefore: receptionChecklist.wasRepairedBefore ?? null,
            isClean: receptionChecklist.isClean ?? null,
            hasAccessories: receptionChecklist.hasAccessories ?? null,

            // 🔥 ESTO ES LO IMPORTANTE
            accessories: Array.isArray(receptionChecklist.accessories)
              ? [
                  ...receptionChecklist.accessories,
                  ...(receptionChecklist.otroAccesorio
                    ? [receptionChecklist.otroAccesorio]
                    : [])
                ]
              : receptionChecklist.otroAccesorio
                ? [receptionChecklist.otroAccesorio]
                : [],

            accessoriesNotes: receptionChecklist.accessoriesNotes || '',
            completedAt: receptionChecklist.completedAt || now,
            completedBy: receptionChecklist.completedBy || req.user.email
          }
        })
      }

      const historyEntry = {
        status,
        changedBy: req.user.email,
        changedAt: now,
        ...(note && { note }),
        ...(receivedBy && { receivedBy }),
        ...(receivedAtBranch && { receivedAtBranch }),
        ...(status === 'Entregado' && { deliveredAt: deliveredAt || now }),
        ...(typeof isSatisfied === 'boolean' && { isSatisfied })
      }
      console.log('updatedPayload: ', updatePayload)

      const updated = await ServiceModel.findByIdAndUpdate(
        id,
        {
          $set: updatePayload,
          $push: { statusHistory: historyEntry }
        },
        { new: true, runValidators: true }
      )

      res.json(updated)

    } catch (err) {
      res.status(500).json({ error: 'Error al actualizar servicio', details: err.message })
    }
  }

  // ✅ updateWorkOrderStatus
  static async updateWorkOrderStatus(req, res) {
    try {
      const { id } = req.params
      const { newStatus } = req.body
      const now = new Date()

      const service = await ServiceModel.findById(id)

      if (!service) {
        return res.status(404).json({ error: 'Servicio no encontrado' })
      }

      const currentStatus = service.workOrderStatus || 'Sin presupuesto'

      // =============================
      // VALIDACIONES
      // =============================

      if (WORKORDER_RULES.requireBudget.includes(newStatus)) {
        if (!service.budgetItems || service.budgetItems.length === 0) {
          return res.status(400).json({
            error: 'Debe agregar al menos un item al presupuesto.'
          })
        }
      }

      if (newStatus === 'Lista para enviar') {
        if (['Pendiente', 'Recibido'].includes(service.status)) {
          return res.status(400).json({
            error: 'El equipo aún no fue revisado.'
          })
        }
      }

      if (
        WORKORDER_RULES.requireSent.includes(newStatus) &&
        !['Enviada', 'Aceptada', 'Rechazada'].includes(service.workOrderStatus)
      ) {
        return res.status(400).json({
          error: 'Debe haber sido enviada antes.'
        })
      }

      if (!isValidWorkOrderTransition(currentStatus, newStatus)) {
        return res.status(400).json({
          error: `No se puede cambiar de "${currentStatus}" a "${newStatus}".`
        })
      }

      // =============================
      // UPDATE
      // =============================

      const updateFields = {
        workOrderStatus: newStatus,
        lastModifiedBy: req.user?.email || 'Sistema',
        lastModifiedAt: now
      }

      // 🔥 SINCRONIZACIÓN DE ESTADOS
      if (newStatus === 'Aceptada') {
        updateFields.status = 'Reparación'
      }

      if (['Rechazada', 'Sin reparación'].includes(newStatus)) {
        updateFields.status = 'Armado S/R'
      }

      // timestamps
      if (newStatus === 'Enviada') {
        updateFields.workOrderSentAt = now
        updateFields.workOrderSentBy = req.user?.email || 'Sistema'
      }

      if (['Aceptada', 'Rechazada'].includes(newStatus)) {
        updateFields.workOrderAnsweredAt = now
        updateFields.workOrderAnsweredBy = req.user?.email || 'Sistema'
      }

      const newServiceStatus = updateFields.status || service.status

      //  HISTORIAL
      const historyEntry = {
        status: newServiceStatus,
        note: updateFields.status
          ? `Orden de trabajo → ${newStatus} | Estado → ${newServiceStatus}`
          : `Orden de trabajo → ${newStatus}`,
        changedBy: req.user?.email || 'Sistema',
        changedAt: now
      }

      const updated = await ServiceModel.findByIdAndUpdate(
        id,
        {
          $set: updateFields,
          $push: { statusHistory: historyEntry }
        },
        { new: true }
      )

      res.json(updated)

    } catch (err) {
      console.error('❌ updateWorkOrderStatus error:', err)
      res.status(500).json({
        error: 'Error actualizando orden de trabajo',
        details: err.message
      })
    }
  }

  // ✅ deleteService
  static async deleteService(req, res) {
    try {
      const deleted = await ServiceModel.findByIdAndDelete(req.params.id)
      res.status(200).json(deleted)
    } catch (err) {
      logger.error('Error al eliminar servicio', err)
      res.status(500).json({ error: 'Error al eliminar el servicio' })
    }
  }

  // ✅ softDeleteByCode (opcional)
  static async softDeleteByCode(req, res) {
    try {
      const updated = await ServiceModel.findOneAndUpdate(
        { code: req.params.code },
        { status: 'Eliminado' },
        { new: true }
      )
      res.status(200).json(updated)
    } catch (err) {
      logger.error('Error al hacer soft delete', err)
      res.status(500).json({ error: 'Error al eliminar lógicamente el servicio' })
    }
  }
}

export default ServiceController

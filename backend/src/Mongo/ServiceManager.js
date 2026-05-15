import serviceModel from "./models/service.model.js"

class ServiceManagerDao {
  constructor() {
    this.serviceModel = serviceModel
  }

  async getAll() {
    return await this.serviceModel.find({ deleted: { $ne: true } }).populate('createdBy', 'email')
  }

  async getById(id) {
    return await this.serviceModel.findById(id)
  }

  async getByCode(code) {
    return await this.serviceModel.findOne({ code })
  }

  async getByCustomerNumber(customerNumber) {
    return await this.serviceModel.find({ customerNumber })
  }

  async getByQuoteReference(quoteReference) {
    return await this.serviceModel.find({ quoteReference })
  }

  async getByPublicId(publicId) {
    return await this.serviceModel.findOne({ publicId })
  }

  async create(data) {
    return await this.serviceModel.create(data)
  }

  async update(id, data, config = { new: true }) {
    return await this.serviceModel.findByIdAndUpdate(id, data, config)
  }

  async updateByCode(code, data, config = { new: true }) {
    return await this.serviceModel.findOneAndUpdate({ code }, data, config)
  }

  async delete(id) {
    return await this.serviceModel.findByIdAndDelete(id)
  }

  async softDeleteByCode(code) {
    return await this.serviceModel.findOneAndUpdate(
      { code },
      { deleted: true },
      { new: true }
    )
  }

  async findLastByBranch(branch) {
    return await this.serviceModel
      .findOne({ branch })
      .sort({ createdAt: -1 })
      .exec()
  }

  async getPaginated({ page = 1, limit = 10 }) {
    return await this.serviceModel
      .find()
      .skip((page - 1) * limit)
      .limit(limit)
  }

  async pushStatusHistory(id, entry) {
    return await this.serviceModel.findByIdAndUpdate(
      id,
      { $push: { statusHistory: entry } },
      { new: true }
    )
  }

  async updateWithInactivity(id, updateOps, config = { new: true }) {
    const service = await this.serviceModel.findById(id)
    if (!service) return null

    const now = new Date()

    const lastActivity = service.lastActivityAt || service.createdAt
    const inactivityMs = now - new Date(lastActivity)

    const total = (service.inactivityAccumulatedMs || 0) + inactivityMs
    const max = Math.max(service.maxInactivityMs || 0, inactivityMs)

    return await this.serviceModel.findByIdAndUpdate(
      id,
      {
        $set: {
          ...(updateOps.$set || {}),
          lastActivityAt: now,
          inactivityAccumulatedMs: total,
          maxInactivityMs: max
        },
        ...(updateOps.$push && { $push: updateOps.$push }),
        ...(updateOps.$inc && { $inc: updateOps.$inc })
      },
      config
    )
  }

  async getInactiveServices(days = 7) {
    const limitDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    return await this.serviceModel
      .find({
        lastActivityAt: { $lte: limitDate },
        status: { $nin: ['Entregado', 'Eliminado'] }
      })
      .sort({ lastActivityAt: 1 })
  }

  async registerClientInteraction(id) {
    return await this.serviceModel.findByIdAndUpdate(
      id,
      {
        lastClientMessageAt: new Date()
      },
      { new: true }
    )
  }

  async registerOutboundContact(id) {
    return await this.serviceModel.findByIdAndUpdate(
      id,
      {
        lastOutboundContactAt: new Date()
      },
      { new: true }
    )
  }

  async startWarranty({
    serviceId,
    reason,
    diagnosis = '',
    enteredBy
  }) {

    const service = await this.serviceModel.findById(serviceId)

    if (!service) {
      throw new Error('Servicio no encontrado')
    }

    // Debe haber sido entregado
    if (!['Entregado'].includes(service.status)) {
      throw new Error('El servicio no fue entregado')
    }

    // No puede ser S/R
    if (service.workOrderStatus === 'Sin reparación') {
      throw new Error('El servicio fue entregado sin reparación y no tiene garantía.')
    }

    // Garantía vencida
    if (!service.warrantyUntil || new Date(service.warrantyUntil) < new Date()) {
      throw new Error('La garantía expiró el', service.warrantyUntil)
    }

    // Ya tiene una garantía activa
    if (service.activeWarrantyEventId) {
      throw new Error('Ya existe una garantía activa')
    }

    // Crear evento
    const warrantyEvent = {
      enteredAt: new Date(),
      enteredBy,
      reason,
      diagnosis,
      status: 'En revisión'
    }

    service.warrantyEvents.push(warrantyEvent)

    // Obtener el último agregado
    const createdEvent =
      service.warrantyEvents[service.warrantyEvents.length - 1]

    // Activar garantía visual
    service.activeWarrantyEventId = createdEvent._id

    // Volver flujo operativo
    service.previousStatus = service.status
    service.status = 'Reparación'

    // Historial
    service.statusHistory.push({
      status: 'Reparación',
      note: `Ingreso por garantía: ${reason}`,
      changedAt: new Date(),
      changedBy: enteredBy
    })

    await service.save()

    return service
  }

  async closeWarranty({
    serviceId,
    resolution,
    deliveredBy
  }) {

    const service = await this.serviceModel.findById(serviceId)

    if (!service) {
      throw new Error('Servicio no encontrado')
    }

    if (!service.activeWarrantyEventId) {
      throw new Error('No hay garantía activa')
    }

    const warranty = service.warrantyEvents.id(
      service.activeWarrantyEventId
    )

    if (!warranty) {
      throw new Error('Garantía no encontrada')
    }

    warranty.status = 'Reparado'
    warranty.resolution = resolution
    warranty.deliveredAt = new Date()
    warranty.deliveredBy = deliveredBy

    // Desactivar modo garantía
    service.activeWarrantyEventId = null

    // Flujo operativo normal
    service.status = 'Entregado'

    service.statusHistory.push({
      status: 'Entregado',
      note: 'Garantía finalizada',
      changedAt: new Date(),
      changedBy: deliveredBy
    })

    await service.save()

    return service
  }
}

const ServiceManager = new ServiceManagerDao()
export default ServiceManager

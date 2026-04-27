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
}

const ServiceManager = new ServiceManagerDao()
export default ServiceManager

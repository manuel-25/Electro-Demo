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
}

const ServiceManager = new ServiceManagerDao()
export default ServiceManager

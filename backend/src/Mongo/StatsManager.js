import serviceModel from './models/service.model.js'
import clientModel from './models/client.model.js'
import quoteModel from './models/quote.model.js'

class StatsManager {

  async getGeneralStats() {

    const services = await serviceModel.find({ deleted: { $ne: true } })

    const clients = await clientModel.countDocuments()

    const quotes = await quoteModel.countDocuments({
      deleted: { $ne: true }
    })

    const delivered = services.filter(s => s.status === 'Entregado')

    const revenue = delivered.reduce((acc, s) => {
      return acc + (Number(s.finalValue) || 0)
    }, 0)

    const avgTicket =
      delivered.length > 0
        ? revenue / delivered.length
        : 0

    // =============================
    // FACTURACIÓN POR MES
    // =============================

    const revenueByMonth = await serviceModel.aggregate([
      {
        $match: {
          status: 'Entregado',
          deleted: { $ne: true }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$updatedAt" },
            month: { $month: "$updatedAt" }
          },
          total: { $sum: "$finalValue" }
        }
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1
        }
      }
    ])

    const formattedRevenue = revenueByMonth.map(r => ({
      month: `${r._id.year}-${String(r._id.month).padStart(2, '0')}`,
      total: r.total
    }))

    // =============================
    // SERVICIOS POR MES
    // =============================

    const servicesByMonth = await serviceModel.aggregate([
      {
        $match: {
          deleted: { $ne: true }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          total: { $sum: 1 }
        }
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1
        }
      }
    ])

    const formattedServices = servicesByMonth.map(s => ({
      month: `${s._id.year}-${String(s._id.month).padStart(2, '0')}`,
      total: s.total
    }))

    // =============================
    // MARCAS MÁS REPARADAS
    // =============================

    const topBrands = await serviceModel.aggregate([
      {
        $match: {
          deleted: { $ne: true }
        }
      },
      {
        $group: {
          _id: "$brand",
          total: { $sum: 1 }
        }
      },
      {
        $sort: { total: -1 }
      },
      {
        $limit: 5
      }
    ])

    const formattedBrands = topBrands.map(b => ({
      brand: b._id || 'Sin marca',
      total: b.total
    }))

    // =============================
    // EQUIPOS MÁS REPARADOS
    // =============================

    const topDevices = await serviceModel.aggregate([
      {
        $match: {
          deleted: { $ne: true }
        }
      },
      {
        $group: {
          _id: "$type",
          total: { $sum: 1 }
        }
      },
      {
        $sort: { total: -1 }
      },
      {
        $limit: 5
      }
    ])

    const formattedDevices = topDevices.map(d => ({
      type: d._id || 'Sin tipo',
      total: d.total
    }))

    // =============================
    // ESTADOS
    // =============================

    const statusStats = await serviceModel.aggregate([
      {
        $match: {
          deleted: { $ne: true }
        }
      },
      {
        $group: {
          _id: "$status",
          total: { $sum: 1 }
        }
      }
    ])

    const formattedStatus = statusStats.map(s => ({
      status: s._id,
      total: s.total
    }))

    return {

      services: services.length,
      delivered: delivered.length,
      clients,
      quotes,

      revenue,
      avgTicket,

      revenueByMonth: formattedRevenue,
      servicesByMonth: formattedServices,
      topBrands: formattedBrands,
      topDevices: formattedDevices,
      statusStats: formattedStatus
    }
  }
}

export default new StatsManager()
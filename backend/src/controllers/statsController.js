import ServiceModel from "../Mongo/models/service.model.js"

class StatsController {

  static async getStats(req, res) {
    try {

      const deliveredStatus = "Entregado"

      // servicios entregados
      const deliveredServices = await ServiceModel.find({
        status: deliveredStatus,
        finalPrice: { $gt: 0 }
      }).populate("client")

      // TOTAL FACTURACIÓN
      const totalRevenue = deliveredServices.reduce(
        (acc, s) => acc + (s.finalPrice || 0),
        0
      )

      // TOTAL SERVICIOS
      const totalDelivered = deliveredServices.length

      // PROMEDIO
      const avgTicket =
        totalDelivered > 0
          ? Math.round(totalRevenue / totalDelivered)
          : 0

      // SERVICIOS ESTE MES
      const now = new Date()
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)

      const servicesThisMonth = deliveredServices.filter(
        s => new Date(s.deliveryDate || s.updatedAt) >= firstDay
      ).length

      // FACTURACIÓN POR MES
      const monthlyMap = {}

      deliveredServices.forEach(service => {

        const date = new Date(service.deliveryDate || service.updatedAt)

        const month = date.toLocaleString("es-AR", { month: "short" })

        if (!monthlyMap[month]) {
          monthlyMap[month] = 0
        }

        monthlyMap[month] += service.finalPrice || 0
      })

      const monthlyRevenue = Object.keys(monthlyMap).map(month => ({
        month,
        revenue: monthlyMap[month]
      }))

      // MARCAS MÁS REPARADAS
      const brandMap = {}

      deliveredServices.forEach(service => {

        const brand = service.brand || "Sin marca"

        if (!brandMap[brand]) {
          brandMap[brand] = 0
        }

        brandMap[brand]++
      })

      const topBrands = Object.keys(brandMap)
        .map(brand => ({
          brand,
          count: brandMap[brand]
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      // ÚLTIMOS SERVICIOS
      const lastDelivered = deliveredServices
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 10)
        .map(service => ({
          client: service.client?.name || "Sin cliente",
          equipment: service.equipment || "-",
          brand: service.brand || "-",
          finalPrice: service.finalPrice || 0,
          deliveryDate: service.deliveryDate || service.updatedAt
        }))

      res.json({
        totalRevenue,
        totalDelivered,
        servicesThisMonth,
        avgTicket,
        monthlyRevenue,
        topBrands,
        lastDelivered
      })

    } catch (error) {

      console.error("Error stats:", error)

      res.status(500).json({
        message: "Error obteniendo estadísticas"
      })
    }
  }
}

export default StatsController
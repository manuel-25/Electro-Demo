import { DemoEventModel, DemoVisitorModel } from '../Mongo/models/demoAnalytics.model.js'
import {
  createDemoSession,
  getRequestMeta,
  normalizeDemoEmail,
  recordDemoEvent,
  touchDemoVisitor
} from '../utils/demoAnalytics.js'

class DemoAnalyticsController {
  static async createSession(req, res) {
    const email = normalizeDemoEmail(req.body?.email)
    if (!email) return res.status(400).json({ error: 'Email requerido' })

    const { visitor, sessionId } = await createDemoSession(email, req)
    res.status(201).json({
      sessionId,
      user: {
        email,
        role: 'admin',
        branch: 'Quilmes'
      },
      visitor: {
        firstSeenAt: visitor.firstSeenAt,
        lastSeenAt: visitor.lastSeenAt,
        visitCount: visitor.visitCount
      }
    })
  }

  static async trackEvent(req, res) {
    const sessionId = req.headers['x-demo-session-id'] || req.body?.sessionId
    const email = normalizeDemoEmail(req.headers['x-demo-user-email'] || req.body?.email)

    await touchDemoVisitor({ sessionId, email, req })
    await recordDemoEvent({
      type: req.body?.type || 'ui_action',
      name: req.body?.name || 'interaction',
      sessionId,
      email,
      path: req.body?.path,
      payload: req.body?.payload || {},
      meta: getRequestMeta(req)
    })

    res.status(204).send()
  }

  static async getSummary(req, res) {
    const [
      visitorCount,
      eventCount,
      recentVisitors,
      recentEvents,
      topPages,
      activityByEmail,
      eventTypeBreakdown,
      topActions
    ] = await Promise.all([
      DemoVisitorModel.countDocuments(),
      DemoEventModel.countDocuments(),
      DemoVisitorModel.find().sort({ lastSeenAt: -1 }).limit(25).lean(),
      DemoEventModel.find().sort({ createdAt: -1 }).limit(50).lean(),
      DemoEventModel.aggregate([
        { $match: { type: 'page_view' } },
        { $group: { _id: '$path', views: { $sum: 1 } } },
        { $sort: { views: -1 } },
        { $limit: 10 }
      ]),
      DemoEventModel.aggregate([
        { $match: { email: { $nin: [null, ''] } } },
        {
          $group: {
            _id: '$email',
            events: { $sum: 1 },
            pageViews: { $sum: { $cond: [{ $eq: ['$type', 'page_view'] }, 1, 0] } },
            mutations: { $sum: { $cond: [{ $eq: ['$type', 'api_mutation'] }, 1, 0] } },
            errors: { $sum: { $cond: [{ $eq: ['$type', 'api_error'] }, 1, 0] } },
            firstSeenAt: { $min: '$createdAt' },
            lastSeenAt: { $max: '$createdAt' },
            lastPath: { $last: '$path' }
          }
        },
        {
          $lookup: {
            from: 'demo_visitors',
            localField: '_id',
            foreignField: 'email',
            as: 'visitor'
          }
        },
        {
          $addFields: {
            visitCount: { $ifNull: [{ $first: '$visitor.visitCount' }, 0] },
            city: { $ifNull: [{ $first: '$visitor.meta.city' }, ''] },
            country: { $ifNull: [{ $first: '$visitor.meta.country' }, ''] }
          }
        },
        { $project: { visitor: 0 } },
        { $sort: { lastSeenAt: -1 } },
        { $limit: 50 }
      ]),
      DemoEventModel.aggregate([
        { $group: { _id: '$type', total: { $sum: 1 } } },
        { $sort: { total: -1 } }
      ]),
      DemoEventModel.aggregate([
        { $group: { _id: '$name', total: { $sum: 1 }, lastSeenAt: { $max: '$createdAt' } } },
        { $sort: { total: -1 } },
        { $limit: 10 }
      ])
    ])

    res.json({
      visitorCount,
      eventCount,
      recentVisitors,
      recentEvents,
      topPages,
      activityByEmail,
      eventTypeBreakdown,
      topActions
    })
  }
}

export default DemoAnalyticsController

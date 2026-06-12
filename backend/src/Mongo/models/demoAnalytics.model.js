import mongoose from 'mongoose'
import config from '../../utils/config.js'

const { Schema, model } = mongoose

const RequestMetaSchema = new Schema(
  {
    ip: String,
    userAgent: String,
    referrer: String,
    origin: String,
    country: String,
    region: String,
    city: String
  },
  { _id: false }
)

const DemoVisitorSchema = new Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    sessionId: { type: String, required: true, unique: true, index: true },
    firstSeenAt: { type: Date, default: Date.now },
    lastSeenAt: { type: Date, default: Date.now },
    visitCount: { type: Number, default: 1 },
    meta: RequestMetaSchema
  },
  { timestamps: true }
)

const DemoEventSchema = new Schema(
  {
    sessionId: { type: String, index: true },
    email: { type: String, lowercase: true, trim: true, index: true },
    type: {
      type: String,
      enum: ['session_start', 'page_view', 'ui_action', 'api_mutation', 'api_error'],
      required: true,
      index: true
    },
    name: { type: String, required: true, index: true },
    path: String,
    method: String,
    statusCode: Number,
    durationMs: Number,
    entityType: String,
    entityId: String,
    payload: { type: Schema.Types.Mixed, default: {} },
    meta: RequestMetaSchema
  },
  { timestamps: true }
)

DemoEventSchema.index({ createdAt: -1 })
DemoEventSchema.index({ email: 1, createdAt: -1 })
DemoVisitorSchema.index({ lastSeenAt: -1 })

export const DemoVisitorModel = model('DemoVisitor', DemoVisitorSchema, config.COLLECTIONS.DEMO_VISITORS)
export const DemoEventModel = model('DemoEvent', DemoEventSchema, config.COLLECTIONS.DEMO_EVENTS)

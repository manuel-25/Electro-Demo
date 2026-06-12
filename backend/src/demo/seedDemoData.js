import { pathToFileURL } from 'url'
import bcrypt from 'bcrypt'
import mongoose from 'mongoose'
import connectDB from '../db/mongoose-config.js'
import config from '../utils/config.js'
import clientModel from '../Mongo/models/client.model.js'
import quoteModel from '../Mongo/models/quote.model.js'
import ServiceModel from '../Mongo/models/service.model.js'
import userModel from '../Mongo/models/user.model.js'
import ConversationModel from '../Mongo/models/conversation.model.js'
import { buildDemoData } from './demoData.js'

const DEMO_PASSWORD = process.env.DEMO_PASSWORD || 'demo1234'

async function insertIfEmpty(model, docs, label) {
  const existing = await model.countDocuments()
  if (existing > 0) {
    return { label, inserted: 0, skipped: existing }
  }

  await model.insertMany(docs, { ordered: true })
  return { label, inserted: docs.length, skipped: 0 }
}

export async function seedDemoData({ reset = false } = {}) {
  if (!config.DEMO_MODE) {
    return { enabled: false, message: 'DEMO_MODE is disabled' }
  }

  const data = buildDemoData()
  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10)
  const users = data.users.map(user => ({ ...user, password: hashedPassword }))

  if (reset) {
    await Promise.all([
      clientModel.deleteMany({}),
      quoteModel.deleteMany({}),
      ServiceModel.deleteMany({}),
      userModel.deleteMany({}),
      ConversationModel.deleteMany({})
    ])
  }

  const results = await Promise.all([
    insertIfEmpty(userModel, users, config.COLLECTIONS.USERS),
    insertIfEmpty(clientModel, data.clients, config.COLLECTIONS.CLIENTS),
    insertIfEmpty(quoteModel, data.quotes, config.COLLECTIONS.QUOTES),
    insertIfEmpty(ServiceModel, data.services, config.COLLECTIONS.SERVICES),
    insertIfEmpty(ConversationModel, data.conversations || [], 'demo_conversations')
  ])

  await mongoose.connection.collection('demo_metadata').updateOne(
    { key: 'portfolio-demo' },
    {
      $set: {
        key: 'portfolio-demo',
        updatedAt: new Date(),
        collections: config.COLLECTIONS,
        demoUser: data.users[0].email
      },
      $setOnInsert: { createdAt: new Date() }
    },
    { upsert: true }
  )

  return {
    enabled: true,
    reset,
    demoUser: data.users[0].email,
    demoPassword: DEMO_PASSWORD,
    results
  }
}

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href

if (isDirectRun) {
  await connectDB()
  const result = await seedDemoData({ reset: process.argv.includes('--reset') })
  console.info(JSON.stringify(result, null, 2))
  await mongoose.disconnect()
}

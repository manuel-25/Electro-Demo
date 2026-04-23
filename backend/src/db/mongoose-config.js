import mongoose from 'mongoose'
import config from '../utils/config.js'

const MONGO_URI = config.MONGO_URI

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4 // 🔥 FORZAR IPv4 (clave en tu caso)
    })

    console.info('✅ Connected to MongoDB')
  } catch (error) {
    console.error('❌ Error REAL MongoDB:')
    console.error(error.message)
    console.error(error)
    process.exit(1)
  }
}

export default connectDB
import mongoose from 'mongoose'
import config from '../../utils/config.js'
const { Schema, model } = mongoose
export const USER_BRANCHES = ['Quilmes', 'Barracas', 'Ninguna']

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },

    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String },

    branch: { type: String, enum: USER_BRANCHES, default: null },
    role: { type: String, enum: ['admin', 'empleado', 'tecnico', 'supervisor'], default: 'empleado' },

    lastLoginAt: { type: Date, default: Date.now },
    loginCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },

    failedLoginAttempts: Number,
    lockUntil: Date,
    lockLevel: Number,

    notes: { type: String }
  },
  {
    timestamps: true
  }
)

const UserModel = model('User', UserSchema, config.COLLECTIONS.USERS)
export default UserModel

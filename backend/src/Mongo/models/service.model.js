// models/service.model.js
import mongoose from 'mongoose'
import config from '../../utils/config.js'

const { Schema, model } = mongoose

// ─── Enums ────────────────────────────────────────────────────────────────────
export const SERVICE_TYPES = ['Reparación', 'Garantía', 'Mantenimiento']
export const SERVICE_STATUS = [
  // 🔴 VIEJOS (se mantienen temporalmente)
  'Pendiente',
  'Recibido',
  'En Revisión',
  'En Reparación',
  'En Pruebas',
  'Listo para retirar',
  'Entregado',
  'Garantía',
  'Rechazado',
  'Repuestos',

  // 🟢 NUEVOS
  'En Gestión',
  'Reparación',            // reemplaza "En Reparación"
  'Armado S/R',
  'Listo para retiro S/R',
  'Entregado S/R',
  'Retirado a bodega',
  'Sin respuesta'
]

export const WORKORDER_STATUS = [
  'Sin presupuesto',
  'Lista para enviar',
  'Enviada',
  'Aceptada',
  'Rechazada',
  'Sin reparación'
]

export const SERVICE_BRANCHES = ['Quilmes', 'Barracas', 'No recibido']
export const DELIVERY_METHODS = ['Presencial', 'Envío Correo', 'Retiro y Entrega', 'UberFlash']

// ─── Subschemas ───────────────────────────────────────────────────────────────
const StatusHistorySchema = new Schema(
{
  status: { type: String, enum: SERVICE_STATUS, required: true },

  note: { type: String, default: '' },

  changedAt: { type: Date, default: Date.now },
  changedBy: { type: String },

  receivedBy: { type: String },
  receivedAtBranch: { type: String, enum: SERVICE_BRANCHES, default: null },

  deliveredAt: { type: Date, default: null },
  isSatisfied: { type: Boolean, default: null }
},
{ _id: false }
)

// ─── Schema principal ─────────────────────────────────────────────────────────
const ServiceSchema = new Schema(
  {
    // Relación con cliente
    customerNumber: { type: Number, required: true, index: true },
    quoteReference: { type: Number },

    // Código de ingreso (único del servicio)
    code: { type: String, required: true, unique: true, index: true },

    // Datos del cliente (snapshot)
    userData: {
      firstName: String,
      lastName: String,
      dniOrCuit: String,
      email: String,
      phone: String,
      domicilio: String,
      province: String,
      municipio: String
    },

    // Equipo
    equipmentType: String,
    description: String,
    userDescription: String,
    brand: String,
    model: String,

    // Servicio
    serviceType: { type: String, enum: SERVICE_TYPES, default: 'Reparación' },
    approximateValue: { type: String, default: '0' }, // rango/nota libre
    finalValue: { type: Number, default: 0 },
    // Estado de la orden de trabajo
    workOrderStatus: {
      type: String,
      enum: WORKORDER_STATUS,
      default: 'Sin presupuesto',
      index: true
    },

    // Fecha en que se envió la OT
    workOrderSentAt: {
      type: Date,
      default: null
    },

    // Quién envió el presupuesto
    workOrderSentBy: {
      type: String,
      default: null
    },

    // Fecha en que el cliente respondió
    workOrderAnsweredAt: {
      type: Date,
      default: null
    },

    workOrderAnsweredBy: {
      type: String,
      default: null
    },

    repuestos: { type: Number, default: 0 },

    // Estado actual + historial
    status: { type: String, enum: SERVICE_STATUS, default: 'Pendiente', index: true },
    statusHistory: [StatusHistorySchema],

    // Datos de recepción (solo si fue recibido)
    receivedBy: { type: String, default: null },           // nombre/email del receptor
    receivedAt: { type: Date, default: null },
    receivedAtBranch: { type: String, enum: SERVICE_BRANCHES, default: null },
    receivedNotes: { type: String },
    deliveryMethod: { type: String, enum: DELIVERY_METHODS, default: 'Presencial' },
    receivedPhoto: { type: String },

    // Modificaciones
    lastModifiedBy: String,
    lastModifiedAt: { type: Date, default: Date.now },

    // Otros
    warrantyExpiration: { type: Number, default: 30 },     // días
    photos: [String],
    notes: { type: String },

    // Relación con usuarios
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdByEmail: { type: String },

    // Supervisor (futuro)
    supervisedBy: { type: Schema.Types.ObjectId, ref: 'User' },

    // Fecha delivery y si esta conforme => evaluar en google
    isSatisfied: { type: Boolean, default: null },
    deliveredAt: { type: Date, default: null },

    // Presupuesto desglosado
    budgetItems: [{
      cantidad: { type: Number, default: 1 },
      descripcion: { type: String, required: true },
      precioUnitario: { type: Number, required: true }
    }],

    // Diagnóstico técnico (puede ser distinto a la descripción del cliente)
    diagnosticoTecnico: { type: String, default: '' },

    // Texto adicional para incluir notas importantes en la orden
    workOrderNotes: { type: String, default: '' },

    // EN GESTION CHECKLIST 
    receptionChecklist: {
    wasRepairedBefore: { type: Boolean, default: null },
    isClean: { type: Boolean, default: null },
    hasAccessories: { type: Boolean, default: null },

    accessories: {
      type: [
        {
          name: String,
          label: String
        }
      ],
      default: []
    },

    accessoriesNotes: {
      type: String,
      default: '',
    },

    completedAt: { type: Date, default: null },
    completedBy: {
      type: String,
      default: null
    }
  },

  //Permite diferenciar estados viejos de los nuevos STATUS
  flowVersion: { type: Number, default: 2 },

    // ID pública para compartir externamente
    publicId: { type: String, unique: true }
  },
  {
    timestamps: true
  },
)

// ─── Hooks ────────────────────────────────────────────────────────────────────
ServiceSchema.pre('save', function (next) {
  if (!this.publicId) this.publicId = generatePublicId()
  next()
})

// ─── Helpers ──────────────────────────────────────────────────────────────────
function generatePublicId(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let out = ''
  for (let i = 0; i < length; i++) out += chars.charAt(Math.floor(Math.random() * chars.length))
  return out
}

// ─── Índices útiles ───────────────────────────────────────────────────────────
ServiceSchema.index({ customerNumber: 1, createdAt: -1 })
ServiceSchema.index({ workOrderStatus: 1 })

const ServiceModel = mongoose.model(
  'Service',
  ServiceSchema
)

export default ServiceModel

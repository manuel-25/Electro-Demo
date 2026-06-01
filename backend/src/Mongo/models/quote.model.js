import { Schema, model } from "mongoose"
import config from '../../utils/config.js'

const collection = config.COLLECTIONS.QUOTES

// Función para obtener la fecha actual menos tres horas
function getArgentinaTime() {
    const now = new Date()
    now.setHours(now.getHours() - 3)
    return now
}

const quoteSchema = new Schema({
    serviceRequestNumber: { type: Number, required: true, unique: true },
    customerNumber: { type: Number, required: true },
    date: { type: Date, default: getArgentinaTime, index: true },
    category: { id: { type: Number, required: true }, name: { type: String, required: true }},
    brand: { type: String, required: true },
    model: { type: String },
    faults: { type: [String] },
    details: { type: String, default: "N/A"} ,
    userData: {
        additionalDetails: { type: String, default: 'N/A' },
        discountCode: String,
        email: { type: String, required: true },
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        municipio: String,
        phone: { type: Number },
        province: String
    },
    review: { type: String },
    branch: {type: String},
    status: { 
        type: String, 
        enum: [
            // nuevos estados
            'Pendiente',
            'Respondido',
            'No Respondido',
            'Datos incorrectos',
            'Rechazada', 
        ], 
        default: 'Pendiente'
    }
}, { timestamps: true })

// Hook para ajustar las fechas en los timestamps y restar 3 horas
quoteSchema.pre('save', function (next) {
    this.createdAt = getArgentinaTime()
    this.updatedAt = getArgentinaTime()
    next()
})

quoteSchema.pre('findOneAndUpdate', function (next) {
    this._update.updatedAt = getArgentinaTime()
    next()
})

const quoteModel = model(collection, quoteSchema)
export default quoteModel

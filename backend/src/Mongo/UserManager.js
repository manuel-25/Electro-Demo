import userModel from "./models/user.model.js"
import config from "../utils/config.js"

class UserManager {
    constructor() {
        this.userModel = userModel
    }

    async getAll() {
        return await this.userModel.find()
    }

    async getByEmail(email) {
        return await this.userModel.findOne({ email })
    }

    async create(data) {
        return await this.userModel.create(data)
    }

    async getById(id) {
        return await this.userModel.findById(id)
    }

    async updateByEmail(email, data, config) {
        return await this.userModel.findOneAndUpdate(
            { email },
            data,
            { new: true, ...config }
        )
    }

    async deleteByEmail(email) {
        return await this.userModel.findOneAndDelete({ email })
    }

    async registerFailedLogin(user) {
        const now = Date.now()

        // Si ya pasó el bloqueo, reseteamos todo
        if (user.lockUntil && user.lockUntil < now) {
            user.failedLoginAttempts = 0
            user.lockLevel = 0
            user.lockUntil = null
        }

        user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1

        let locked = false
        let lockTime = 0

        const MAX = config.AUTH.MAX_LOGIN_ATTEMPTS

        if (user.failedLoginAttempts >= MAX) {
            locked = true

            // 🔥 escalado progresivo
            if (!user.lockLevel || user.lockLevel === 0) {
                user.lockLevel = 1
                lockTime = 15 * 60 * 1000 // 15 min
            } else if (user.lockLevel === 1) {
                user.lockLevel = 2
                lockTime = 60 * 60 * 1000 // 1 hora
            } else {
                user.lockLevel = 3
                lockTime = 24 * 60 * 60 * 1000 // 1 día
            }

            user.lockUntil = Date.now() + lockTime
            user.failedLoginAttempts = 0 // 🔥 reset después de bloquear
        }

        await user.save()

        return {
            locked,
            attempts: user.failedLoginAttempts,
            lockUntil: user.lockUntil,
            lockLevel: user.lockLevel
        }
    }

    async resetLoginAttempts(user) {
        user.failedLoginAttempts = 0
        user.lockUntil = null
        user.lockLevel = 0
        await user.save()
    }
}

const userManager = new UserManager()
export default userManager

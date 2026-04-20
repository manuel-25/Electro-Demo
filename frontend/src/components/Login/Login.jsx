import './Login.css'
import React, { useContext, useState, useEffect } from 'react'
import { AuthContext } from '../../Context/AuthContext.jsx'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [remember, setRemember] = useState(true)
    const [lockUntil, setLockUntil] = useState(null)

    const { login, loading, error } = useContext(AuthContext)
    const navigate = useNavigate()

    // ⏱ Timer bloqueo (solo UI)
    useEffect(() => {
        if (!lockUntil) return

        const interval = setInterval(() => {
            if (Date.now() > lockUntil) {
                setLockUntil(null)
            }
        }, 1000)

        return () => clearInterval(interval)
    }, [lockUntil])

    const handleLogin = async (e) => {
        e.preventDefault()

        if (lockUntil && Date.now() < lockUntil) return

        const result = await login(email, password, remember)

        // ✅ LOGIN OK
        if (result.success) {
            setLockUntil(null)
            navigate('/dashboard')
            return
        }

        // 🔒 bloqueo del backend
        if (result.lockUntil) {
            setLockUntil(new Date(result.lockUntil).getTime())
        }
    }

    const secondsLeft = lockUntil
        ? Math.max(0, Math.ceil((lockUntil - Date.now()) / 1000))
        : 0

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleLogin} autoComplete="on">
                <h2>Iniciar Sesión</h2>

                <div className="input-group">
                    <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="Email"
                        autoComplete="username"
                        required
                        disabled={loading || secondsLeft > 0}
                    />
                </div>

                <div className="input-group password-group">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Contraseña"
                        autoComplete="current-password"
                        required
                        disabled={loading || secondsLeft > 0}
                    />
                    <span
                        className="toggle-password"
                        onClick={() => setShowPassword(v => !v)}
                    >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                </div>

                <div className="login-options">
                    <label className="remember-label">
                        <input
                            type="checkbox"
                            checked={remember}
                            onChange={() => setRemember(v => !v)}
                            disabled={loading || secondsLeft > 0}
                        />
                        Mantener sesión iniciada (4 horas)
                    </label>
                </div>

                {error && <div className="error-message">{error}</div>}

                {/* 🔒 bloqueo real */}
                {secondsLeft > 0 && (
                    <div className="login-locked">
                        <span>
                            Demasiados intentos fallidos. Esperá {secondsLeft}s para volver a intentar.
                        </span>
                    </div>
                )}

                <button type="submit" disabled={loading || secondsLeft > 0}>
                    {loading
                        ? 'Ingresando...'
                        : secondsLeft > 0
                        ? 'Bloqueado'
                        : 'Iniciar Sesión'}
                </button>
            </form>
        </div>
    )
}

export default Login
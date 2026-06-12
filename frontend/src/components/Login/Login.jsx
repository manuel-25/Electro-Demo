import './Login.css'
import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../Context/AuthContext.jsx'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

const Login = () => {
    const isDemoMode = process.env.REACT_APP_DEMO_MODE === 'true'
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [remember, setRemember] = useState(true)
    const [lockUntil, setLockUntil] = useState(null)

    const { login, loading, error } = useContext(AuthContext)
    const navigate = useNavigate()

    useEffect(() => {
        if (!lockUntil) return

        const interval = setInterval(() => {
            if (Date.now() > lockUntil) setLockUntil(null)
        }, 1000)

        return () => clearInterval(interval)
    }, [lockUntil])

    const handleLogin = async (e) => {
        e.preventDefault()
        if (lockUntil && Date.now() < lockUntil) return

        const result = await login(email, password, remember)

        if (result.success) {
            setLockUntil(null)
            navigate('/dashboard')
            return
        }

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
                <span className="login-kicker">Electrosafe Demo</span>
                <h2>{isDemoMode ? 'Ingresar a la demo' : 'Iniciar sesion'}</h2>
                {isDemoMode && (
                    <p className="login-copy">
                        Escribi tu email para probar el flujo operativo. No requiere validacion.
                    </p>
                )}

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

                {!isDemoMode && (
                    <div className="input-group password-group">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Contrasena"
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
                )}

                {!isDemoMode && (
                    <div className="login-options">
                        <label className="remember-label">
                            <input
                                type="checkbox"
                                checked={remember}
                                onChange={() => setRemember(v => !v)}
                                disabled={loading || secondsLeft > 0}
                            />
                            Mantener sesion iniciada (4 horas)
                        </label>
                    </div>
                )}

                {error && <div className="error-message">{error}</div>}

                {secondsLeft > 0 && (
                    <div className="login-locked">
                        <span>Demasiados intentos fallidos. Espera {secondsLeft}s para volver a intentar.</span>
                    </div>
                )}

                <button type="submit" disabled={loading || secondsLeft > 0}>
                    {loading
                        ? 'Ingresando...'
                        : secondsLeft > 0
                            ? 'Bloqueado'
                            : isDemoMode ? 'Entrar a la demo' : 'Iniciar sesion'}
                </button>
            </form>
        </div>
    )
}

export default Login

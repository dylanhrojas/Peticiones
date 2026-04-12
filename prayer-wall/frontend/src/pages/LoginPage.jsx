import { useState, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import GoogleSignInButton from '../components/GoogleSignInButton'
import styles from './AuthPage.module.css'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || 'Error al iniciar sesión')
      }
      const data = await res.json()
      login(data)
      navigate('/')
    } catch (err) {
      setError(err.message)
    }
  }

  const handleGoogleSuccess = useCallback((data) => {
    login(data)
    navigate('/')
  }, [login, navigate])

  const handleGoogleError = useCallback((msg) => {
    setError(msg)
  }, [])

  return (
    <div className={styles.page}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h1 className={styles.title}>Iniciar sesión</h1>
        {error && <p className={styles.error}>{error}</p>}

        <GoogleSignInButton onSuccess={handleGoogleSuccess} onError={handleGoogleError} />

        <div className={styles.divider}>
          <span>o</span>
        </div>

        <input className={styles.input} type="email" placeholder="Correo" value={email} onChange={e => setEmail(e.target.value)} required />
        <input className={styles.input} type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} required />
        <button className={styles.btn} type="submit">Entrar</button>
        <p className={styles.link}>¿No tienes cuenta? <Link to="/registro">Regístrate</Link></p>
      </form>
    </div>
  )
}

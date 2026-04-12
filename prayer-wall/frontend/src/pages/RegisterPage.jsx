import { useState, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import GoogleSignInButton from '../components/GoogleSignInButton'
import styles from './AuthPage.module.css'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [country, setCountry] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, country }),
      })
      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || 'Error al registrarse')
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
        <h1 className={styles.title}>Crear cuenta</h1>
        {error && <p className={styles.error}>{error}</p>}

        <GoogleSignInButton onSuccess={handleGoogleSuccess} onError={handleGoogleError} />

        <div className={styles.divider}>
          <span>o</span>
        </div>

        <input className={styles.input} type="text" placeholder="Nombre" value={name} onChange={e => setName(e.target.value)} required />
        <input className={styles.input} type="email" placeholder="Correo" value={email} onChange={e => setEmail(e.target.value)} required />
        <input className={styles.input} type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} required />
        <input className={styles.input} type="text" placeholder="País" value={country} onChange={e => setCountry(e.target.value)} required />
        <button className={styles.btn} type="submit">Registrarse</button>
        <p className={styles.link}>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
      </form>
    </div>
  )
}

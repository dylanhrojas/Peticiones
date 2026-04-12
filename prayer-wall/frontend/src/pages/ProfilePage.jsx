import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth, authHeaders } from '../hooks/useAuth'
import { searchCountries, flagForName } from '../data/countries'
import styles from './ProfilePage.module.css'

export default function ProfilePage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState(user?.name || '')
  const [country, setCountry] = useState(user?.country || '')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Country autocomplete
  const [countryOpen, setCountryOpen] = useState(false)
  const [countryIdx, setCountryIdx] = useState(0)
  const countryMatches = searchCountries(country)

  if (!user) {
    navigate('/login', { replace: true })
    return null
  }

  function getInitials(n) {
    if (!n) return '?'
    return n.trim().split(/\s+/).map(p => p[0]).slice(0, 2).join('').toUpperCase()
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setError('')
    setSuccess(false)
    try {
      const res = await fetch('/api/user/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ name: name.trim(), country: country.trim() }),
      })
      if (!res.ok) throw new Error('Error al guardar')
      const data = await res.json()
      login(data)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  function handleCountryKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setCountryOpen(true)
      setCountryIdx(i => Math.min(i + 1, countryMatches.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setCountryIdx(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && countryOpen && countryMatches.length > 0) {
      e.preventDefault()
      setCountry(countryMatches[countryIdx]?.name || '')
      setCountryOpen(false)
    } else if (e.key === 'Escape') {
      setCountryOpen(false)
    }
  }

  const flag = flagForName(country)

  return (
    <div className={styles.page}>
      <motion.form
        className={styles.form}
        onSubmit={handleSave}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className={styles.avatarWrap}>
          {user.photoUrl ? (
            <img src={user.photoUrl} alt="" className={styles.avatar} />
          ) : (
            <div className={styles.avatarFallback}>
              <span>{getInitials(name)}</span>
            </div>
          )}
        </div>

        <h1 className={styles.title}>Editar perfil</h1>

        <p className={styles.email}>{user.email}</p>

        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>Perfil actualizado</p>}

        <label className={styles.label}>Nombre</label>
        <input
          className={styles.input}
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />

        <label className={styles.label}>País</label>
        <div className={styles.countryWrap}>
          {flag && <span className={styles.countryFlag}>{flag}</span>}
          <input
            className={styles.input}
            type="text"
            value={country}
            onChange={e => {
              setCountry(e.target.value)
              setCountryOpen(true)
              setCountryIdx(0)
            }}
            onFocus={() => { if (country.trim()) setCountryOpen(true) }}
            onKeyDown={handleCountryKeyDown}
            onBlur={() => setTimeout(() => setCountryOpen(false), 150)}
            autoComplete="off"
          />
          {countryOpen && countryMatches.length > 0 && (
            <ul className={styles.countryList}>
              {countryMatches.map((c, i) => (
                <li
                  key={c.code}
                  className={`${styles.countryItem} ${i === countryIdx ? styles.countryItemActive : ''}`}
                  onMouseDown={(e) => { e.preventDefault(); setCountry(c.name); setCountryOpen(false) }}
                  onMouseEnter={() => setCountryIdx(i)}
                >
                  {c.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <button className={styles.btn} type="submit" disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </motion.form>
    </div>
  )
}

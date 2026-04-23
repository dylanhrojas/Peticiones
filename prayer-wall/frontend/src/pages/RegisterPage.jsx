import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import GoogleSignInButton from '../components/GoogleSignInButton'
import { searchCountries, flagEmoji, flagForName } from '../data/countries'
import styles from './AuthPage.module.css'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [country, setCountry] = useState('')
  const [isMissionary, setIsMissionary] = useState(false)
  const [missionaryCountry, setMissionaryCountry] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  // Country combobox state
  const countryWrapRef = useRef(null)
  const [countryOpen, setCountryOpen] = useState(false)
  const [countryIdx, setCountryIdx] = useState(0)
  const countryMatches = useMemo(() => searchCountries(country), [country])

  // Missionary country combobox state
  const missionaryCountryWrapRef = useRef(null)
  const [missionaryCountryOpen, setMissionaryCountryOpen] = useState(false)
  const [missionaryCountryIdx, setMissionaryCountryIdx] = useState(0)
  const missionaryCountryMatches = useMemo(() => searchCountries(missionaryCountry), [missionaryCountry])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          country,
          isMissionary,
          missionaryCountry: isMissionary ? missionaryCountry : null
        }),
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

  // Close country dropdown on click outside
  useEffect(() => {
    function onDocClick(e) {
      if (countryWrapRef.current && !countryWrapRef.current.contains(e.target)) {
        setCountryOpen(false)
      }
      if (missionaryCountryWrapRef.current && !missionaryCountryWrapRef.current.contains(e.target)) {
        setMissionaryCountryOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  // Clamp highlight if matches list shrinks
  useEffect(() => {
    if (countryIdx >= countryMatches.length) setCountryIdx(0)
  }, [countryMatches, countryIdx])

  useEffect(() => {
    if (missionaryCountryIdx >= missionaryCountryMatches.length) setMissionaryCountryIdx(0)
  }, [missionaryCountryMatches, missionaryCountryIdx])

  function handleCountryKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setCountryOpen(true)
      setCountryIdx(i => Math.min(i + 1, countryMatches.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setCountryIdx(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      if (countryOpen && countryMatches.length > 0) {
        e.preventDefault()
        const pick = countryMatches[countryIdx] || countryMatches[0]
        selectCountry(pick.name)
      }
    } else if (e.key === 'Escape') {
      setCountryOpen(false)
    }
  }

  function selectCountry(value) {
    setCountry(value)
    setCountryOpen(false)
    setCountryIdx(0)
  }

  function handleMissionaryCountryKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setMissionaryCountryOpen(true)
      setMissionaryCountryIdx(i => Math.min(i + 1, missionaryCountryMatches.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setMissionaryCountryIdx(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      if (missionaryCountryOpen && missionaryCountryMatches.length > 0) {
        e.preventDefault()
        const pick = missionaryCountryMatches[missionaryCountryIdx] || missionaryCountryMatches[0]
        selectMissionaryCountry(pick.name)
      }
    } else if (e.key === 'Escape') {
      setMissionaryCountryOpen(false)
    }
  }

  function selectMissionaryCountry(value) {
    setMissionaryCountry(value)
    setMissionaryCountryOpen(false)
    setMissionaryCountryIdx(0)
  }

  const currentFlag = flagForName(country)
  const currentMissionaryFlag = flagForName(missionaryCountry)

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

        <div className={styles.countryWrapper} ref={countryWrapRef}>
          <div className={styles.countryInputWrap}>
            {currentFlag && <span className={styles.countryFlag}>{currentFlag}</span>}
            <input
              className={styles.input}
              type="text"
              placeholder="País"
              value={country}
              onChange={e => {
                setCountry(e.target.value)
                setCountryOpen(true)
                setCountryIdx(0)
              }}
              onFocus={() => { if (country.trim()) setCountryOpen(true) }}
              onKeyDown={handleCountryKeyDown}
              autoComplete="off"
              role="combobox"
              aria-expanded={countryOpen && countryMatches.length > 0}
              aria-autocomplete="list"
              required
            />
          </div>
          <AnimatePresence>
            {countryOpen && countryMatches.length > 0 && (
              <motion.ul
                className={styles.countryList}
                role="listbox"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
              >
                {countryMatches.map((c, i) => (
                  <li
                    key={c.code}
                    role="option"
                    aria-selected={i === countryIdx}
                    className={`${styles.countryItem} ${i === countryIdx ? styles.countryItemActive : ''}`}
                    onMouseDown={(e) => { e.preventDefault(); selectCountry(c.name) }}
                    onMouseEnter={() => setCountryIdx(i)}
                  >
                    <span className={styles.countryItemFlag}>{flagEmoji(c.code)}</span>
                    <span>{c.name}</span>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={isMissionary}
            onChange={(e) => setIsMissionary(e.target.checked)}
            className={styles.checkbox}
          />
          <span>Soy misionero</span>
        </label>

        {isMissionary && (
          <div className={styles.countryWrapper} ref={missionaryCountryWrapRef}>
            <div className={styles.countryInputWrap}>
              {currentMissionaryFlag && <span className={styles.countryFlag}>{currentMissionaryFlag}</span>}
              <input
                className={styles.input}
                type="text"
                placeholder="País donde sirves como misionero"
                value={missionaryCountry}
                onChange={e => {
                  setMissionaryCountry(e.target.value)
                  setMissionaryCountryOpen(true)
                  setMissionaryCountryIdx(0)
                }}
                onFocus={() => { if (missionaryCountry.trim()) setMissionaryCountryOpen(true) }}
                onKeyDown={handleMissionaryCountryKeyDown}
                autoComplete="off"
                role="combobox"
                aria-expanded={missionaryCountryOpen && missionaryCountryMatches.length > 0}
                aria-autocomplete="list"
                required={isMissionary}
              />
            </div>
            <AnimatePresence>
              {missionaryCountryOpen && missionaryCountryMatches.length > 0 && (
                <motion.ul
                  className={styles.countryList}
                  role="listbox"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                >
                  {missionaryCountryMatches.map((c, i) => (
                    <li
                      key={c.code}
                      role="option"
                      aria-selected={i === missionaryCountryIdx}
                      className={`${styles.countryItem} ${i === missionaryCountryIdx ? styles.countryItemActive : ''}`}
                      onMouseDown={(e) => { e.preventDefault(); selectMissionaryCountry(c.name) }}
                      onMouseEnter={() => setMissionaryCountryIdx(i)}
                    >
                      <span className={styles.countryItemFlag}>{flagEmoji(c.code)}</span>
                      <span>{c.name}</span>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        )}

        <button className={styles.btn} type="submit">Registrarse</button>
        <p className={styles.link}>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
      </form>
    </div>
  )
}

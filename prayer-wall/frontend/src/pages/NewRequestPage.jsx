import { useState, useRef, useEffect, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth, authHeaders } from '../hooks/useAuth'
import { searchCountries, flagEmoji, flagForName, coordsForName } from '../data/countries'
import styles from './NewRequestPage.module.css'

const MAX_CHARS = 1000

const CATEGORIES = [
  { value: 'SALUD',      label: 'Salud',              color: '#E63946' },
  { value: 'FAMILIA',    label: 'Familia',            color: '#F4A261' },
  { value: 'ESPIRITUAL', label: 'Espiritual',         color: '#F5C26B' },
  { value: 'TRABAJO',    label: 'Trabajo / Provisión', color: '#2A9D8F' },
  { value: 'OTROS',      label: 'Otros',              color: '#A8A8B3' },
]

function getInitials(name) {
  if (!name) return '?'
  return name.trim().split(/\s+/).map(p => p[0]).slice(0, 2).join('').toUpperCase()
}

function timeAgo(date) {
  const diff = Math.max(0, Date.now() - date.getTime())
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'ahora'
  if (mins < 60) return `hace ${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `hace ${hrs}h`
  return `hace ${Math.floor(hrs / 24)}d`
}

export default function NewRequestPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const textareaRef = useRef(null)
  const countryWrapRef = useRef(null)

  const [text, setText] = useState('')
  const [category, setCategory] = useState('ESPIRITUAL')
  const [country, setCountry] = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Country combobox state
  const [countryOpen, setCountryOpen] = useState(false)
  const [countryIdx, setCountryIdx] = useState(0)
  const countryMatches = useMemo(() => searchCountries(country), [country])

  // auto-resize textarea as content grows
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 520) + 'px'
  }, [text])

  // close country dropdown on click outside
  useEffect(() => {
    function onDocClick(e) {
      if (countryWrapRef.current && !countryWrapRef.current.contains(e.target)) {
        setCountryOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  // Clamp highlight if matches list shrinks
  useEffect(() => {
    if (countryIdx >= countryMatches.length) setCountryIdx(0)
  }, [countryMatches, countryIdx])

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

  const currentFlag = flagForName(country)

  const activeCat = CATEGORIES.find(c => c.value === category)
  const displayName = anonymous ? 'Anónimo' : (user?.name || 'Tú')
  const charsLeft = MAX_CHARS - text.length
  const overLimit = charsLeft < 0
  const canSubmit = text.trim().length > 0 && !overLimit && country.trim().length > 0 && !loading

  async function handleSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return
    setError('')
    setLoading(true)

    const coords = coordsForName(country.trim())
    const latitude = coords?.lat ?? null
    const longitude = coords?.lng ?? null

    try {
      const res = await fetch('/api/prayer-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ text: text.trim(), category, country: country.trim(), anonymous, latitude, longitude }),
      })
      if (!res.ok) throw new Error('Error al publicar la petición')
      navigate('/globo')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <span className={styles.kicker}>Nueva petición</span>
          <h1 className={styles.title}>Comparte lo que llevas en el corazón</h1>
        </div>

        <div className={styles.layout}>
          {/* ─────────── Composer ─────────── */}
          <form className={styles.composer} onSubmit={handleSubmit}>
            <div className={styles.composerTop}>
              <div className={styles.avatar} aria-hidden="true">
                {user?.photoUrl
                  ? <img src={user.photoUrl} alt="" />
                  : <span>{getInitials(anonymous ? '?' : user?.name)}</span>}
              </div>
              <div className={styles.composerMeta}>
                <span className={styles.postingAs}>
                  Publicando como <strong>{displayName}</strong>
                </span>
                <label className={styles.anonToggle}>
                  <input
                    type="checkbox"
                    checked={anonymous}
                    onChange={e => setAnonymous(e.target.checked)}
                  />
                  <span className={styles.anonTrack}>
                    <span className={styles.anonThumb} />
                  </span>
                  <span className={styles.anonLabel}>Anónimo</span>
                </label>
              </div>
            </div>

            <textarea
              ref={textareaRef}
              className={styles.textarea}
              placeholder="¿Qué quieres pedirle a Dios hoy? Cuenta con tus propias palabras…"
              value={text}
              onChange={e => setText(e.target.value)}
              rows={5}
            />

            <div className={styles.categories}>
              {CATEGORIES.map(c => {
                const active = category === c.value
                return (
                  <button
                    key={c.value}
                    type="button"
                    className={`${styles.catBtn} ${active ? styles.catActive : ''}`}
                    onClick={() => setCategory(c.value)}
                    style={active ? { '--cat-color': c.color } : { '--cat-color': c.color }}
                  >
                    <span className={styles.catDot} style={{ background: c.color }} />
                    {c.label}
                  </button>
                )
              })}
            </div>

            <div className={styles.fieldRow} ref={countryWrapRef}>
              {currentFlag ? (
                <span className={styles.fieldFlag} aria-hidden="true">{currentFlag}</span>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={styles.fieldIcon}>
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              )}
              <input
                className={styles.input}
                type="text"
                placeholder="¿Desde dónde pides oración? (país)"
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
                        <span className={styles.countryFlag} aria-hidden="true">{flagEmoji(c.code)}</span>
                        <span>{c.name}</span>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.composerFooter}>
              <div className={styles.charCounter} data-over={overLimit ? 'true' : 'false'}>
                <svg width="22" height="22" viewBox="0 0 22 22" className={styles.charRing}>
                  <circle cx="11" cy="11" r="9" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
                  <circle
                    cx="11" cy="11" r="9"
                    fill="none"
                    stroke={overLimit ? '#f87171' : 'var(--gold)'}
                    strokeWidth="2"
                    strokeDasharray={`${Math.min(1, text.length / MAX_CHARS) * 56.55} 56.55`}
                    strokeLinecap="round"
                    transform="rotate(-90 11 11)"
                    style={{ transition: 'stroke-dasharray 0.2s ease' }}
                  />
                </svg>
                <span>{charsLeft}</span>
              </div>

              <div className={styles.composerActions}>
                <Link to="/globo" className={styles.cancelBtn}>Cancelar</Link>
                <button type="submit" className={styles.submitBtn} disabled={!canSubmit}>
                  {loading ? 'Publicando…' : 'Publicar petición'}
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </form>

          {/* ─────────── Live preview ─────────── */}
          <aside className={styles.previewSide}>
            <motion.article
              className={styles.previewCard}
              style={{ '--cat-color': activeCat?.color }}
              animate={{ y: 0 }}
            >
              <div className={styles.previewGlow} />
              <header className={styles.previewHeader}>
                <div className={styles.previewAvatar}>
                  {user?.photoUrl && !anonymous
                    ? <img src={user.photoUrl} alt="" />
                    : <span>{getInitials(anonymous ? '?' : user?.name)}</span>}
                </div>
                <div className={styles.previewIdentity}>
                  <span className={styles.previewName}>
                    {displayName}
                  </span>
                  <span className={styles.previewSub}>
                    {currentFlag && <span className={styles.previewFlag}>{currentFlag}</span>}
                    {country.trim() || 'Tu país'} · {timeAgo(new Date())}
                  </span>
                </div>
                <span className={styles.previewBadge}>
                  <span className={styles.previewBadgeDot} style={{ background: activeCat?.color }} />
                  {activeCat?.label}
                </span>
              </header>

              <p className={styles.previewText}>
                {text.trim() || (
                  <span className={styles.previewPlaceholder}>
                    Tu petición aparecerá aquí mientras escribes…
                  </span>
                )}
              </p>

              <footer className={styles.previewFooter}>
                <span className={styles.previewAction}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 5a5.5 5.5 0 0 1 9.5 7c-2.5 4.5-9.5 9-9.5 9Z"/>
                  </svg>
                  Oré por ti · 0
                </span>
                <span className={styles.previewAction}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  Acompañar
                </span>
              </footer>
            </motion.article>

            <p className={styles.previewHint}>
              Así verán tu petición quienes entren al muro.
            </p>
          </aside>
        </div>
      </div>
    </div>
  )
}

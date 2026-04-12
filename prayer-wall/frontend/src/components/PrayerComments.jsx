import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuth, authHeaders } from '../hooks/useAuth'
import styles from './PrayerComments.module.css'

const QUICK_CHIPS = [
  'Amén',
  'Orando contigo',
  'Gloria a Dios',
  'Dios te bendiga',
]

const MAX_LEN = 500

function getInitials(name) {
  if (!name) return '?'
  return name.trim().split(/\s+/).map(p => p[0]).slice(0, 2).join('').toUpperCase()
}

function timeAgo(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const diff = Math.max(0, Date.now() - d.getTime())
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'ahora'
  if (mins < 60) return `hace ${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `hace ${hrs}h`
  return `hace ${Math.floor(hrs / 24)}d`
}

/**
 * PrayerComments
 * Self-contained comments section for a single prayer request.
 * Fetches lazily on mount, shows the list + composer (or login prompt).
 *
 * Props:
 *   requestId   — the prayer request id
 *   onCountChange(n) — called with the new count after a successful post
 */
export default function PrayerComments({ requestId, onCountChange }) {
  const { user } = useAuth()
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch(`/api/prayer-requests/${requestId}/comments`)
      .then(r => r.json())
      .then(data => { if (!cancelled) { setComments(data); setLoading(false) } })
      .catch(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [requestId])

  async function handleSubmit(e) {
    e?.preventDefault()
    const body = text.trim()
    if (!body || posting) return
    setPosting(true)
    setError(null)
    try {
      const res = await fetch(`/api/prayer-requests/${requestId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ text: body }),
      })
      if (!res.ok) throw new Error('post failed')
      const created = await res.json()
      setComments(prev => {
        const next = [...prev, created]
        onCountChange?.(next.length)
        return next
      })
      setText('')
    } catch {
      setError('No pudimos enviar tu mensaje. Intenta de nuevo.')
    } finally {
      setPosting(false)
    }
  }

  function handleChipClick(chipText) {
    // If textarea is empty, send directly. Otherwise append to current draft.
    if (!text.trim()) {
      setText(chipText)
      // Defer submit so state updates first
      setTimeout(() => {
        textareaRef.current?.form?.requestSubmit?.()
      }, 0)
    } else {
      setText(prev => (prev.trim() ? `${prev.trim()} ${chipText}` : chipText))
      textareaRef.current?.focus()
    }
  }

  const remaining = MAX_LEN - text.length
  const nearLimit = remaining <= 50
  const overLimit = remaining < 0

  return (
    <div className={styles.wrap}>
      {/* Existing comments */}
      <div className={styles.list}>
        {loading ? (
          <div className={styles.loading}>Cargando palabras…</div>
        ) : comments.length === 0 ? (
          <div className={styles.empty}>
            Aún no hay palabras de aliento. Sé el primero en escribir una.
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {comments.map(c => (
              <motion.div
                key={c.id}
                className={styles.item}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className={styles.avatar}>
                  <span>{getInitials(c.authorName)}</span>
                </div>
                <div className={styles.body}>
                  <div className={styles.meta}>
                    <span className={styles.author}>{c.authorName}</span>
                    <span className={styles.dot}>·</span>
                    <span className={styles.time}>{timeAgo(c.createdAt)}</span>
                  </div>
                  <p className={styles.text}>{c.text}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Composer or login prompt */}
      {user ? (
        <form className={styles.composer} onSubmit={handleSubmit}>
          <div className={styles.chips}>
            {QUICK_CHIPS.map(chip => (
              <button
                key={chip}
                type="button"
                className={styles.chip}
                onClick={() => handleChipClick(chip)}
                disabled={posting}
              >
                {chip}
              </button>
            ))}
          </div>

          <div className={styles.inputRow}>
            <div className={styles.composerAvatar}>
              <span>{getInitials(user.name)}</span>
            </div>
            <div className={styles.textareaWrap}>
              <textarea
                ref={textareaRef}
                className={styles.textarea}
                placeholder="Deja una palabra de aliento…"
                value={text}
                onChange={e => setText(e.target.value)}
                maxLength={MAX_LEN + 20}
                rows={2}
                disabled={posting}
                onKeyDown={e => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    handleSubmit(e)
                  }
                }}
              />
              <div className={styles.composerFooter}>
                <span
                  className={`${styles.counter} ${nearLimit ? styles.counterNear : ''} ${overLimit ? styles.counterOver : ''}`}
                >
                  {remaining}
                </span>
                <button
                  type="submit"
                  className={styles.sendBtn}
                  disabled={!text.trim() || posting || overLimit}
                >
                  {posting ? 'Enviando…' : 'Enviar'}
                </button>
              </div>
            </div>
          </div>

          {error && <div className={styles.error}>{error}</div>}
        </form>
      ) : (
        <div className={styles.loginPrompt}>
          <span>
            <Link to="/login" className={styles.loginLink}>Inicia sesión</Link>
            {' '}para dejar una palabra de aliento.
          </span>
        </div>
      )}
    </div>
  )
}

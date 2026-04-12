import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth, authHeaders } from '../hooks/useAuth'
import Loader from '../components/Loader'
import { flagForName } from '../data/countries'
import styles from './MyRequestsPage.module.css'

const CATEGORY_COLORS = {
  SALUD: '#E63946', FAMILIA: '#F4A261', ESPIRITUAL: '#F5C26B',
  TRABAJO: '#2A9D8F', OTROS: '#A8A8B3',
}
const CATEGORY_LABELS = {
  SALUD: 'Salud', FAMILIA: 'Familia', ESPIRITUAL: 'Espiritual',
  TRABAJO: 'Trabajo', OTROS: 'Otros',
}

function timeAgo(iso) {
  if (!iso) return ''
  const diff = Math.max(0, Date.now() - new Date(iso).getTime())
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'ahora'
  if (mins < 60) return `hace ${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `hace ${hrs}h`
  return `hace ${Math.floor(hrs / 24)}d`
}

export default function MyRequestsPage() {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [testimonyId, setTestimonyId] = useState(null)
  const [testimonyText, setTestimonyText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    fetch('/api/prayer-requests', { headers: authHeaders() })
      .then(r => r.json())
      .then(all => {
        setRequests(all.filter(r => r.authorId === user.userId))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [user])

  async function handleMarkAnswered(id) {
    if (!testimonyText.trim()) return
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch(`/api/prayer-requests/${id}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ testimony: testimonyText.trim() }),
      })
      if (!res.ok) throw new Error('No se pudo marcar como respondida')
      const updated = await res.json()
      setRequests(prev => prev.map(r => r.id === id ? updated : r))
      setTestimonyId(null)
      setTestimonyText('')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const active = requests.filter(r => r.status === 'ACTIVE')
  const answered = requests.filter(r => r.status === 'ANSWERED')

  if (!user) {
    return (
      <div className={styles.page}>
        <div className={styles.empty}>
          <p><Link to="/login" className={styles.link}>Inicia sesion</Link> para ver tus peticiones.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <motion.span
          className={styles.kicker}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Tu espacio
        </motion.span>
        <motion.h1
          className={styles.title}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
        >
          Mis peticiones
        </motion.h1>
        <motion.p
          className={styles.subtitle}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Administra tus peticiones y comparte tu testimonio cuando Dios responda.
        </motion.p>
      </header>

      {loading ? (
        <Loader text="Cargando peticiones" />
      ) : requests.length === 0 ? (
        <div className={styles.empty}>
          <p>Aun no tienes peticiones.</p>
          <Link to="/nueva" className={styles.newBtn}>Crear tu primera peticion</Link>
        </div>
      ) : (
        <>
          {/* Active requests */}
          {active.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.statusDot} style={{ background: '#F5C26B' }} />
                Activas ({active.length})
              </h2>
              <div className={styles.list}>
                {active.map((r, i) => {
                  const color = CATEGORY_COLORS[r.category] || CATEGORY_COLORS.OTROS
                  const flag = flagForName(r.country)
                  const isTestimonyOpen = testimonyId === r.id

                  return (
                    <motion.article
                      key={r.id}
                      className={styles.card}
                      style={{ '--cat-color': color }}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.06 }}
                    >
                      <div className={styles.cardGlow} />

                      <div className={styles.cardTop}>
                        <span className={styles.badge} style={{ color }}>
                          <span className={styles.badgeDot} style={{ background: color }} />
                          {CATEGORY_LABELS[r.category] || r.category}
                        </span>
                        <span className={styles.time}>{timeAgo(r.createdAt)}</span>
                      </div>

                      <p className={styles.text}>{r.text}</p>

                      <div className={styles.stats}>
                        {flag && <span className={styles.flag}>{flag}</span>}
                        <span>{r.country}</span>
                        <span className={styles.statDivider} />
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 5a5.5 5.5 0 0 1 9.5 7c-2.5 4.5-9.5 9-9.5 9Z"/>
                        </svg>
                        <span>{r.prayerCount} {r.prayerCount === 1 ? 'oracion' : 'oraciones'}</span>
                        <span className={styles.statDivider} />
                        <span>{r.commentCount || 0} comentarios</span>
                      </div>

                      <div className={styles.cardActions}>
                        <button
                          type="button"
                          className={styles.answerBtn}
                          onClick={() => {
                            setTestimonyId(isTestimonyOpen ? null : r.id)
                            setTestimonyText('')
                            setError('')
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                            <polyline points="22 4 12 14.01 9 11.01"/>
                          </svg>
                          {isTestimonyOpen ? 'Cancelar' : 'Dios respondio'}
                        </button>
                      </div>

                      <AnimatePresence initial={false}>
                        {isTestimonyOpen && (
                          <motion.div
                            className={styles.testimonyForm}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            style={{ overflow: 'hidden' }}
                          >
                            <p className={styles.testimonyLabel}>
                              Cuenta como Dios respondio tu peticion
                            </p>
                            <textarea
                              className={styles.testimonyInput}
                              placeholder="Escribe tu testimonio..."
                              value={testimonyText}
                              onChange={e => setTestimonyText(e.target.value)}
                              rows={3}
                            />
                            {error && <p className={styles.testimonyError}>{error}</p>}
                            <div className={styles.testimonyActions}>
                              <button
                                type="button"
                                className={styles.submitBtn}
                                disabled={!testimonyText.trim() || submitting}
                                onClick={() => handleMarkAnswered(r.id)}
                              >
                                {submitting ? 'Guardando...' : 'Publicar testimonio'}
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.article>
                  )
                })}
              </div>
            </section>
          )}

          {/* Answered requests */}
          {answered.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.statusDot} style={{ background: 'var(--success)' }} />
                Respondidas ({answered.length})
              </h2>
              <div className={styles.list}>
                {answered.map((r, i) => {
                  const color = CATEGORY_COLORS[r.category] || CATEGORY_COLORS.OTROS
                  return (
                    <motion.article
                      key={r.id}
                      className={`${styles.card} ${styles.cardAnswered}`}
                      style={{ '--cat-color': color }}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.06 }}
                    >
                      <div className={styles.cardTop}>
                        <span className={styles.badge} style={{ color }}>
                          <span className={styles.badgeDot} style={{ background: color }} />
                          {CATEGORY_LABELS[r.category] || r.category}
                        </span>
                        <span className={styles.answeredTag}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                            <polyline points="22 4 12 14.01 9 11.01"/>
                          </svg>
                          Respondida
                        </span>
                      </div>
                      <p className={styles.text}>{r.text}</p>
                      {r.testimony && (
                        <blockquote className={styles.testimony}>
                          <p>{r.testimony}</p>
                        </blockquote>
                      )}
                      <div className={styles.stats}>
                        <span>{r.prayerCount} {r.prayerCount === 1 ? 'oracion' : 'oraciones'} recibidas</span>
                      </div>
                    </motion.article>
                  )
                })}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}

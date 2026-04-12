import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Loader from '../components/Loader'
import styles from './TestimoniesPage.module.css'

const CATEGORY_COLORS = {
  SALUD:      '#E63946',
  FAMILIA:    '#F4A261',
  ESPIRITUAL: '#F5C26B',
  TRABAJO:    '#2A9D8F',
  OTROS:      '#A8A8B3',
}

const CATEGORY_LABELS = {
  SALUD: 'Salud',
  FAMILIA: 'Familia',
  ESPIRITUAL: 'Espiritual',
  TRABAJO: 'Trabajo',
  OTROS: 'Otros',
}

function getInitials(name) {
  if (!name) return '?'
  return name.trim().split(/\s+/).map(p => p[0]).slice(0, 2).join('').toUpperCase()
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
}

export default function TestimoniesPage() {
  const [testimonies, setTestimonies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/testimonies')
      .then(r => r.json())
      .then(d => { setTestimonies(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <motion.span
          className={styles.kicker}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          Dios responde
        </motion.span>
        <motion.h1
          className={styles.title}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
        >
          Testimonios
        </motion.h1>
        <motion.p
          className={styles.subtitle}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          Peticiones que fueron escuchadas. Cada testimonio es una prueba de que la oración tiene poder.
        </motion.p>
      </header>

      {loading ? (
        <Loader text="Cargando testimonios" />
      ) : testimonies.length === 0 ? (
        <motion.div
          className={styles.empty}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className={styles.emptyIcon}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 5a5.5 5.5 0 0 1 9.5 7c-2.5 4.5-9.5 9-9.5 9Z"/>
            </svg>
          </div>
          <p className={styles.emptyTitle}>Aun no hay testimonios</p>
          <p className={styles.emptyHint}>Cuando alguien marque su peticion como respondida, aparecera aqui.</p>
        </motion.div>
      ) : (
        <>
          <div className={styles.counter}>
            <span className={styles.counterNum}>{testimonies.length}</span>
            <span className={styles.counterLabel}>
              {testimonies.length === 1 ? 'oracion respondida' : 'oraciones respondidas'}
            </span>
          </div>

          <div className={styles.grid}>
            {testimonies.map((t, i) => {
              const color = CATEGORY_COLORS[t.category] || CATEGORY_COLORS.OTROS

              return (
                <motion.article
                  key={t.id}
                  className={styles.card}
                  style={{ '--cat-color': color }}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.15 }}
                  variants={cardVariants}
                >
                  <div className={styles.cardGlow} />

                  <div className={styles.cardTop}>
                    <span className={styles.badge} style={{ color }}>
                      <span className={styles.badgeDot} style={{ background: color }} />
                      {CATEGORY_LABELS[t.category] || t.category}
                    </span>
                    <span className={styles.date}>{formatDate(t.answeredAt)}</span>
                  </div>

                  <p className={styles.request}>{t.text}</p>

                  {t.testimony && (
                    <blockquote className={styles.testimony}>
                      <svg className={styles.quoteIcon} width="20" height="20" viewBox="0 0 24 24" fill="currentColor" opacity="0.15">
                        <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 0 1-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 0 1-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z"/>
                      </svg>
                      <p>{t.testimony}</p>
                    </blockquote>
                  )}

                  <footer className={styles.cardFooter}>
                    <div className={styles.author}>
                      <div className={styles.avatar}>
                        <span>{getInitials(t.anonymous ? '?' : t.authorName)}</span>
                      </div>
                      <div className={styles.authorInfo}>
                        <span className={styles.authorName}>
                          {t.anonymous ? 'Anonimo' : t.authorName}
                        </span>
                        {t.country && (
                          <span className={styles.authorCountry}>{t.country}</span>
                        )}
                      </div>
                    </div>
                    <div className={styles.prayers}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s-2-2.5-2-5c0-1.5.5-2.5 2-4 1.5 1.5 2 2.5 2 4 0 2.5-2 5-2 5Z"/>
                        <path d="M8 14.5c-2 0-3.5-1.5-3.5-3.5 0-1.5 1-3 2.5-3.5.5-1.5 2-2.5 3.5-2.5"/>
                        <path d="M16 14.5c2 0 3.5-1.5 3.5-3.5 0-1.5-1-3-2.5-3.5-.5-1.5-2-2.5-3.5-2.5"/>
                        <path d="M12 2v3"/>
                      </svg>
                      <span>{t.prayerCount} {t.prayerCount === 1 ? 'oración' : 'oraciones'}</span>
                    </div>
                  </footer>
                </motion.article>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

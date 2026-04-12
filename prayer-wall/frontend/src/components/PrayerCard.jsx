import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { flagForName } from '../data/countries'
import PrayerComments from './PrayerComments'
import styles from './PrayerCard.module.css'

const CATEGORY_COLORS = {
  SALUD:      '#E63946',
  FAMILIA:    '#F4A261',
  ESPIRITUAL: '#F5C26B',
  TRABAJO:    '#2A9D8F',
  OTROS:      '#A8A8B3',
}

const CATEGORY_LABELS = {
  SALUD:      'Salud',
  FAMILIA:    'Familia',
  ESPIRITUAL: 'Espiritual',
  TRABAJO:    'Trabajo / Provisión',
  OTROS:      'Otros',
}

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

export default function PrayerCard({ request, onPray, index = 0, highlight = false, isOwner = false }) {
  const color = CATEGORY_COLORS[request.category] ?? CATEGORY_COLORS.OTROS
  const label = CATEGORY_LABELS[request.category] ?? CATEGORY_LABELS.OTROS
  const displayName = request.anonymous ? 'Anónimo' : (request.authorName || 'Usuario')
  const flag = flagForName(request.country)

  const [commentsOpen, setCommentsOpen] = useState(false)
  const [localCount, setLocalCount] = useState(null)
  const commentCount = localCount ?? request.commentCount ?? 0

  return (
    <motion.article
      id={`prayer-card-${request.id}`}
      className={`${styles.card} ${highlight ? styles.cardHighlight : ''}`}
      style={{ '--cat-color': color }}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index, 6) * 0.05, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className={styles.glow} />

      <header className={styles.header}>
        <div className={styles.avatar}>
          {!request.anonymous && request.authorPhotoUrl
            ? <img src={request.authorPhotoUrl} alt="" />
            : <span>{getInitials(request.anonymous ? '?' : request.authorName)}</span>}
        </div>
        <div className={styles.identity}>
          <span className={styles.name}>{displayName}</span>
          <span className={styles.sub}>
            {flag && <span className={styles.flag}>{flag}</span>}
            {request.country} · {timeAgo(request.createdAt)}
          </span>
        </div>
        <span className={styles.badge}>
          <span className={styles.badgeDot} style={{ background: color }} />
          {label}
        </span>
      </header>

      <p className={styles.text}>{request.text}</p>

      <footer className={styles.footer}>
        {!isOwner && (
          <button
            type="button"
            className={styles.prayBtn}
            onClick={() => onPray?.(request.id)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 5a5.5 5.5 0 0 1 9.5 7c-2.5 4.5-9.5 9-9.5 9Z"/>
            </svg>
            Oré por ti · {request.prayerCount}
          </button>
        )}

        {isOwner && (
          <span className={styles.prayCount}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 5a5.5 5.5 0 0 1 9.5 7c-2.5 4.5-9.5 9-9.5 9Z"/>
            </svg>
            {request.prayerCount} {request.prayerCount === 1 ? 'oración' : 'oraciones'}
          </span>
        )}

        <button
          type="button"
          className={`${styles.commentsBtn} ${commentsOpen ? styles.commentsBtnActive : ''}`}
          onClick={() => setCommentsOpen(o => !o)}
          aria-expanded={commentsOpen}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          Palabras · {commentCount}
        </button>
      </footer>

      <AnimatePresence initial={false}>
        {commentsOpen && (
          <motion.div
            className={styles.commentsPanel}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <PrayerComments
              requestId={request.id}
              onCountChange={setLocalCount}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  )
}

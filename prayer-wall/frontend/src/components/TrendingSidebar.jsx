import { useMemo } from 'react'
import { flagForName } from '../data/countries'
import styles from './TrendingSidebar.module.css'

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
  TRABAJO:    'Trabajo',
  OTROS:      'Otros',
}

const VERSES = [
  { text: 'No se inquieten por nada; más bien, en toda ocasión, con oración y ruego, presenten sus peticiones a Dios.', ref: 'Filipenses 4:6' },
  { text: 'Porque donde dos o tres se reúnen en mi nombre, allí estoy yo en medio de ellos.', ref: 'Mateo 18:20' },
  { text: 'Oren sin cesar.', ref: '1 Tesalonicenses 5:17' },
  { text: 'El Señor está cerca de quienes lo invocan, de quienes lo invocan en verdad.', ref: 'Salmos 145:18' },
  { text: 'La oración del justo es poderosa y eficaz.', ref: 'Santiago 5:16' },
  { text: 'Vayan y hagan discípulos de todas las naciones.', ref: 'Mateo 28:19' },
  { text: 'Recibirán poder y serán mis testigos hasta los confines de la tierra.', ref: 'Hechos 1:8' },
]

function getTodayVerse() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000)
  return VERSES[dayOfYear % VERSES.length]
}

/**
 * TrendingSidebar
 * Sticky sidebar shown in the Muro/feed view (desktop only).
 *
 * Props:
 *   requests        — full array of prayer requests
 *   onSelectCountry — called with country name to set the feed filter
 *   onSelectRequest — called with request id to scroll + highlight in the feed
 */
export default function TrendingSidebar({ requests, onSelectCountry, onSelectRequest }) {
  // Top 5 most-prayed requests this week
  const topPrayed = useMemo(() => {
    const weekAgo = Date.now() - 7 * 86400000
    return [...requests]
      .filter(r => r.createdAt && new Date(r.createdAt).getTime() > weekAgo)
      .sort((a, b) => b.prayerCount - a.prayerCount)
      .slice(0, 5)
  }, [requests])

  // Top 5 countries by active request count
  const topCountries = useMemo(() => {
    const counts = {}
    for (const r of requests) {
      if (!r.country) continue
      counts[r.country] = (counts[r.country] || 0) + 1
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([country, count]) => ({ country, count, flag: flagForName(country) }))
  }, [requests])

  const verse = useMemo(getTodayVerse, [])

  return (
    <aside className={styles.sidebar}>
      {/* ── Top prayed this week ── */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 5a5.5 5.5 0 0 1 9.5 7c-2.5 4.5-9.5 9-9.5 9Z"/>
          </svg>
          Más oradas
        </h3>
        {topPrayed.length === 0 ? (
          <div className={styles.emptyHint}>Sin peticiones esta semana aún</div>
        ) : (
          <ul className={styles.list}>
            {topPrayed.map((r, i) => (
              <li key={r.id} className={styles.item} onClick={() => onSelectRequest?.(r.id)}>
                <span className={styles.rank}>{i + 1}</span>
                <div className={styles.itemBody}>
                  <span className={styles.itemText}>{r.text}</span>
                  <span className={styles.itemMeta}>
                    <span className={styles.itemDot} style={{ background: CATEGORY_COLORS[r.category] ?? CATEGORY_COLORS.OTROS }} />
                    {CATEGORY_LABELS[r.category] ?? 'Otros'}
                    <span className={styles.metaSep}>·</span>
                    {r.country}
                    <span className={styles.metaSep}>·</span>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 2 }}>
                      <path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 5a5.5 5.5 0 0 1 9.5 7c-2.5 4.5-9.5 9-9.5 9Z"/>
                    </svg>
                    {r.prayerCount}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Top countries praying ── */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
          Países orando
        </h3>
        {topCountries.length === 0 ? (
          <div className={styles.emptyHint}>Sin datos de países</div>
        ) : (
          <ul className={styles.list}>
            {topCountries.map(c => (
              <li key={c.country} className={styles.countryRow} onClick={() => onSelectCountry?.(c.country)}>
                {c.flag && <span className={styles.countryFlag}>{c.flag}</span>}
                <span className={styles.countryName}>{c.country}</span>
                <span className={styles.countryCount}>{c.count} {c.count === 1 ? 'petición' : 'peticiones'}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Verse of the day ── */}
      <section className={styles.verseSection}>
        <div className={styles.verseQuote}>
          <span className={styles.verseOpenQuote}>"</span>
          {verse.text}
        </div>
        <div className={styles.verseRef}>— {verse.ref}</div>
      </section>
    </aside>
  )
}

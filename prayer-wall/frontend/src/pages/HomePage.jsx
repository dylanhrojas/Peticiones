import { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PrayerGlobe from '../components/PrayerGlobe'
import PrayerCard from '../components/PrayerCard'
import TrendingSidebar from '../components/TrendingSidebar'
import Loader from '../components/Loader'
import { useAuth, authHeaders } from '../hooks/useAuth'
import { searchCountries, normalizeCountry, flagEmoji, flagForName, coordsForName } from '../data/countries'
import styles from './HomePage.module.css'

const CATEGORIES = [
  { value: 'ALL',        label: 'Todas',       color: '#F5C26B' },
  { value: 'SALUD',      label: 'Salud',       color: '#E63946' },
  { value: 'FAMILIA',    label: 'Familia',     color: '#F4A261' },
  { value: 'ESPIRITUAL', label: 'Espiritual',  color: '#F5C26B' },
  { value: 'TRABAJO',    label: 'Trabajo',     color: '#2A9D8F' },
  { value: 'OTROS',      label: 'Otros',       color: '#A8A8B3' },
]

const DATE_OPTIONS = [
  { value: 'ALL',   label: 'Cualquier fecha' },
  { value: 'TODAY', label: 'Hoy' },
  { value: 'WEEK',  label: 'Esta semana' },
  { value: 'MONTH', label: 'Este mes' },
]

const SORT_OPTIONS = [
  { value: 'RECENT', label: 'Recientes' },
  { value: 'PRAYED', label: 'Más oradas' },
]

const DAY = 86_400_000

export default function HomePage() {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [missionaries, setMissionaries] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [stats, setStats] = useState({ prayersToday: 0, totalAnswered: 0 })
  // Always an array of prayer requests (1 for single click, N for a cell group) or missionaries.
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [view, setView] = useState('globe')
  const [globeMode, setGlobeMode] = useState('prayers') // 'prayers' or 'missionaries'
  const PAGE_SIZE = 20

  // ─── Filter state ───────────────────────────────────────────────
  const [filterCategory, setFilterCategory] = useState('ALL')
  const [filterCountry, setFilterCountry] = useState('')
  const [filterDate, setFilterDate] = useState('ALL')
  const [sortBy, setSortBy] = useState('RECENT')

  // Country autocomplete combobox state
  const countryWrapRef = useRef(null)
  const [countryOpen, setCountryOpen] = useState(false)
  const [countryIdx, setCountryIdx] = useState(0)
  const countryMatches = useMemo(() => searchCountries(filterCountry), [filterCountry])

  // Globe legend popover state
  const legendRef = useRef(null)
  const [legendOpen, setLegendOpen] = useState(false)

  // Highlighted card id (briefly flashes when clicked from trending sidebar)
  const [highlightId, setHighlightId] = useState(null)

  useEffect(() => {
    fetch(`/api/prayer-requests?page=0&size=${PAGE_SIZE}`)
      .then(r => r.json())
      .then(d => {
        setRequests(d)
        setHasMore(d.length === PAGE_SIZE)
        setLoading(false)
      })
      .catch(() => setLoading(false))
    fetch('/api/stats').then(r => r.json()).then(setStats)
    fetch('/api/user/missionaries')
      .then(r => r.json())
      .then(data => {
        const withCoords = data.map(stat => ({
          ...stat,
          ...(coordsForName(stat.country) || { lat: 0, lng: 0 })
        }))
        setMissionaries(withCoords)
      })
      .catch(err => console.error('Error loading missionaries:', err))
  }, [])

  // Close country dropdown / legend popover on outside click
  useEffect(() => {
    function onDocClick(e) {
      if (countryWrapRef.current && !countryWrapRef.current.contains(e.target)) {
        setCountryOpen(false)
      }
      if (legendRef.current && !legendRef.current.contains(e.target)) {
        setLegendOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  useEffect(() => {
    if (countryIdx >= countryMatches.length) setCountryIdx(0)
  }, [countryMatches, countryIdx])

  // ─── Derived feed ───────────────────────────────────────────────
  const filteredRequests = useMemo(() => {
    const now = Date.now()
    const windowMs =
      filterDate === 'TODAY' ? DAY :
      filterDate === 'WEEK'  ? 7 * DAY :
      filterDate === 'MONTH' ? 30 * DAY :
      Infinity

    const q = normalizeCountry(filterCountry.trim())

    let res = requests.filter(r => {
      if (filterCategory !== 'ALL' && r.category !== filterCategory) return false
      if (q && !normalizeCountry(r.country || '').includes(q)) return false
      if (windowMs !== Infinity && r.createdAt) {
        if (now - new Date(r.createdAt).getTime() > windowMs) return false
      }
      return true
    })

    res = [...res].sort((a, b) => {
      if (sortBy === 'PRAYED') return b.prayerCount - a.prayerCount
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    })

    return res
  }, [requests, filterCategory, filterCountry, filterDate, sortBy])

  const hasActiveFilters =
    filterCategory !== 'ALL' ||
    filterCountry.trim().length > 0 ||
    filterDate !== 'ALL' ||
    sortBy !== 'RECENT'

  function clearFilters() {
    setFilterCategory('ALL')
    setFilterCountry('')
    setFilterDate('ALL')
    setSortBy('RECENT')
  }

  async function loadMore() {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    const nextPage = page + 1
    try {
      const res = await fetch(`/api/prayer-requests?page=${nextPage}&size=${PAGE_SIZE}`)
      const data = await res.json()
      setRequests(prev => {
        const existingIds = new Set(prev.map(r => r.id))
        const newOnes = data.filter(r => !existingIds.has(r.id))
        return [...prev, ...newOnes]
      })
      setPage(nextPage)
      setHasMore(data.length === PAGE_SIZE)
    } catch { /* ignore */ }
    setLoadingMore(false)
  }

  async function handlePray(id) {
    const res = await fetch(`/api/prayer-requests/${id}/pray`, { method: 'POST', headers: authHeaders() })
    const updated = await res.json()
    setRequests(prev => prev.map(r => r.id === id ? updated : r))
    setSelectedGroup(prev => prev ? prev.map(r => r.id === id ? updated : r) : prev)
    setStats(prev => ({ ...prev, prayersToday: prev.prayersToday + 1 }))
  }

  function handleGlobeSelect(group) {
    setSelectedGroup(Array.isArray(group) ? group : [group])
  }

  function handleFeedCardPray(id) {
    handlePray(id)
  }

  function handleTrendingSelect(id) {
    // Switch to feed view if on globe, scroll to the card, flash highlight
    if (view !== 'feed') setView('feed')
    setHighlightId(id)
    setTimeout(() => {
      const el = document.getElementById(`prayer-card-${id}`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 100)
    setTimeout(() => setHighlightId(null), 2000)
  }

  function handleTrendingCountry(country) {
    if (view !== 'feed') setView('feed')
    setFilterCountry(country)
  }

  // Country combobox keyboard handling
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
        setFilterCountry(pick.name)
        setCountryOpen(false)
      }
    } else if (e.key === 'Escape') {
      setCountryOpen(false)
    }
  }

  const filterCountryFlag = flagForName(filterCountry)
  const isMissionaryModal = selectedGroup && selectedGroup[0] && 'missionaryCountry' in selectedGroup[0]
  const location = isMissionaryModal ? selectedGroup[0]?.missionaryCountry : selectedGroup?.[0]?.country
  const multi = selectedGroup && selectedGroup.length > 1

  return (
    <div className={styles.page}>
      {loading && <Loader text="Cargando peticiones" />}
      {!loading && view === 'globe' && <PrayerGlobe requests={requests} missionaries={missionaries} mode={globeMode} onSelect={handleGlobeSelect} />}

      {/* Globe mode toggle - prayers vs missionaries */}
      {!loading && view === 'globe' && (
        <div className={styles.globeModeToggle}>
          <button
            type="button"
            className={globeMode === 'prayers' ? styles.globeModeActive : styles.globeModeBtn}
            onClick={() => setGlobeMode('prayers')}
          >
            Peticiones
          </button>
          <button
            type="button"
            className={globeMode === 'missionaries' ? styles.globeModeActive : styles.globeModeBtn}
            onClick={() => setGlobeMode('missionaries')}
          >
            Misioneros
          </button>
        </div>
      )}

      {/* Globe legend — floating (i) button + popover with category colors */}
      {!loading && view === 'globe' && globeMode === 'prayers' && (
        <div className={styles.legendWrap} ref={legendRef}>
          <button
            type="button"
            className={styles.legendBtn}
            onClick={() => setLegendOpen(o => !o)}
            aria-label="Leyenda de colores"
            aria-expanded={legendOpen}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4M12 8h.01"/>
            </svg>
          </button>
          <AnimatePresence>
            {legendOpen && (
              <motion.div
                className={styles.legendPanel}
                initial={{ opacity: 0, y: 6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.96 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className={styles.legendTitle}>Categorías</div>
                <ul className={styles.legendList}>
                  {CATEGORIES.filter(c => c.value !== 'ALL').map(c => (
                    <li key={c.value} className={styles.legendItem}>
                      <span className={styles.legendDot} style={{ background: c.color, boxShadow: `0 0 10px ${c.color}` }} />
                      <span>{c.label}</span>
                    </li>
                  ))}
                </ul>
                <div className={styles.legendFoot}>
                  La altura de cada barra refleja cuántas oraciones se han ofrecido por esa petición.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* View toggle — top center segmented control */}
      {!loading && <div className={styles.viewToggle} role="tablist" aria-label="Vista">
        <button
          role="tab"
          aria-selected={view === 'globe'}
          className={view === 'globe' ? styles.toggleActive : styles.toggleBtn}
          onClick={() => setView('globe')}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
          Globo
        </button>
        <button
          role="tab"
          aria-selected={view === 'feed'}
          className={view === 'feed' ? styles.toggleActive : styles.toggleBtn}
          onClick={() => setView('feed')}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16v16H4z"/>
            <path d="M4 9h16M9 9v11"/>
          </svg>
          Muro
        </button>
      </div>}

      {/* Stats — only over the globe */}
      {!loading && view === 'globe' && (
        <div className={styles.counters}>
          <div className={styles.stat}>
            <span className={styles.statNum}>{stats.prayersToday}</span>
            <span className={styles.statLabel}>oraciones hoy</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statNum}>{stats.totalAnswered}</span>
            <span className={styles.statLabel}>respondidas</span>
          </div>
        </div>
      )}

      {/* ─────────── Feed view ─────────── */}
      {!loading && view === 'feed' && (
        <div className={styles.feedLayout}>
        <div className={styles.feed}>
          <header className={styles.feedHeader}>
            <span className={styles.feedKicker}>Muro global</span>
            <h1 className={styles.feedTitle}>Peticiones del mundo</h1>
            <p className={styles.feedSub}>
              Lee, ora y acompaña a quienes claman desde cualquier rincón.
            </p>
          </header>

          {/* ── Filter toolbar ── */}
          <div className={styles.toolbar}>
            <div className={styles.toolbarRow}>
              {/* Country combobox */}
              <div className={styles.toolField} ref={countryWrapRef}>
                {filterCountryFlag ? (
                  <span className={styles.toolFlag} aria-hidden="true">{filterCountryFlag}</span>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={styles.toolIcon}>
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                )}
                <input
                  type="text"
                  className={styles.toolInput}
                  placeholder="Filtrar por país…"
                  value={filterCountry}
                  onChange={e => {
                    setFilterCountry(e.target.value)
                    setCountryOpen(true)
                    setCountryIdx(0)
                  }}
                  onFocus={() => { if (filterCountry.trim()) setCountryOpen(true) }}
                  onKeyDown={handleCountryKeyDown}
                  autoComplete="off"
                  role="combobox"
                  aria-expanded={countryOpen && countryMatches.length > 0}
                  aria-autocomplete="list"
                />
                {filterCountry && (
                  <button
                    type="button"
                    className={styles.toolClear}
                    onClick={() => { setFilterCountry(''); setCountryOpen(false) }}
                    aria-label="Limpiar país"
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                )}
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
                          onMouseDown={(e) => { e.preventDefault(); setFilterCountry(c.name); setCountryOpen(false) }}
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

              {/* Date range select */}
              <div className={styles.toolSelect}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={styles.toolIcon}>
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <path d="M16 2v4M8 2v4M3 10h18"/>
                </svg>
                <select
                  className={styles.toolSelectNative}
                  value={filterDate}
                  onChange={e => setFilterDate(e.target.value)}
                >
                  {DATE_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className={styles.chevron}>
                  <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              {/* Sort select */}
              <div className={styles.toolSelect}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={styles.toolIcon}>
                  <path d="M3 6h18M6 12h12M10 18h4"/>
                </svg>
                <select
                  className={styles.toolSelectNative}
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                >
                  {SORT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className={styles.chevron}>
                  <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              {hasActiveFilters && (
                <button type="button" className={styles.clearAll} onClick={clearFilters}>
                  Limpiar
                </button>
              )}
            </div>

            {/* Category chips */}
            <div className={styles.catRow}>
              {CATEGORIES.map(c => {
                const active = filterCategory === c.value
                return (
                  <button
                    key={c.value}
                    type="button"
                    className={`${styles.catChip} ${active ? styles.catChipActive : ''}`}
                    style={{ '--cat-color': c.color }}
                    onClick={() => setFilterCategory(c.value)}
                  >
                    {c.value !== 'ALL' && (
                      <span className={styles.catChipDot} style={{ background: c.color }} />
                    )}
                    {c.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Result count */}
          <div className={styles.resultCount}>
            {filteredRequests.length === 0
              ? 'Sin peticiones que coincidan'
              : `${filteredRequests.length} ${filteredRequests.length === 1 ? 'petición' : 'peticiones'}`}
          </div>

          {/* Feed */}
          {filteredRequests.length === 0 ? (
            <div className={styles.empty}>
              <p>No encontramos peticiones con estos filtros.</p>
              {hasActiveFilters && (
                <button type="button" className={styles.emptyBtn} onClick={clearFilters}>
                  Limpiar filtros
                </button>
              )}
            </div>
          ) : (
            <>
              <div className={styles.feedList}>
                {filteredRequests.map((r, i) => (
                  <PrayerCard
                    key={r.id}
                    request={r}
                    onPray={handleFeedCardPray}
                    index={i}
                    highlight={highlightId === r.id}
                    isOwner={!!user && r.authorId === user.userId}
                  />
                ))}
              </div>

              {hasMore && (
                <div className={styles.loadMore}>
                  <button
                    type="button"
                    className={styles.loadMoreBtn}
                    onClick={loadMore}
                    disabled={loadingMore}
                  >
                    {loadingMore ? 'Cargando...' : 'Cargar más peticiones'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <TrendingSidebar
          requests={requests}
          onSelectRequest={handleTrendingSelect}
          onSelectCountry={handleTrendingCountry}
        />
        </div>
      )}

      {/* ─────────── Modal — scrollable feed of prayer cards ─────────── */}
      <AnimatePresence>
        {selectedGroup && (
          <motion.div
            className={styles.overlay}
            onClick={() => setSelectedGroup(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className={styles.modal}
              onClick={e => e.stopPropagation()}
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <button className={styles.close} onClick={() => setSelectedGroup(null)} aria-label="Cerrar">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>

              <header className={styles.modalHeader}>
                <span className={styles.modalKicker}>
                  {isMissionaryModal
                    ? (multi ? 'Misioneros en' : 'Misionero en')
                    : (multi ? 'Peticiones desde' : 'Petición desde')
                  }
                </span>
                <h2 className={styles.modalLocation}>{location || 'Este lugar'}</h2>
                {multi && !isMissionaryModal && (
                  <span className={styles.modalCount}>
                    {selectedGroup.length} voces orando juntas
                  </span>
                )}
                {multi && isMissionaryModal && (
                  <span className={styles.modalCount}>
                    {selectedGroup.length} misioneros sirviendo
                  </span>
                )}
              </header>

              <div className={styles.modalFeed}>
                {isMissionaryModal ? (
                  selectedGroup.map((m, i) => (
                    <div key={m.id} className={styles.missionaryCard}>
                      {m.photoUrl ? (
                        <img src={m.photoUrl} alt={m.name} className={styles.missionaryPhoto} />
                      ) : (
                        <div className={styles.missionaryPhotoFallback}>
                          <span>{m.name.slice(0, 2).toUpperCase()}</span>
                        </div>
                      )}
                      <div className={styles.missionaryInfo}>
                        <h3 className={styles.missionaryName}>{m.name}</h3>
                        <p className={styles.missionaryCountry}>
                          Sirviendo en {m.missionaryCountry}
                          {m.country && ` • De ${m.country}`}
                        </p>
                        {m.bio && <p className={styles.missionaryBio}>{m.bio}</p>}
                        <a href={`mailto:${m.email}`} className={styles.missionaryContact}>
                          Contactar
                        </a>
                      </div>
                    </div>
                  ))
                ) : (
                  selectedGroup.map((r, i) => (
                    <PrayerCard key={r.id} request={r} onPray={handlePray} index={i} isOwner={!!user && r.authorId === user.userId} />
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

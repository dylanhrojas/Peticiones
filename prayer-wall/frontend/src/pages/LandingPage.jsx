import { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import styles from './LandingPage.module.css'
import bgPlanet from '../assets/bg-planet.webp'
import planet from '../assets/planet1.webp'
import logo from '../assets/logo.webp'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

export default function LandingPage() {
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })

  // ── Phase 1: planet rises to center ──
  const earthY = useTransform(scrollYProgress, [0, 0.22], ['55vh', '0vh'])
  const earthScale = useTransform(scrollYProgress, [0, 0.22], [0.62, 1])
  const earthOpacity = useTransform(scrollYProgress, [0, 0.04, 0.22], [0, 1, 1])

  // Text overlay fades out very early so the planet takes the stage
  const textOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0])
  const textY = useTransform(scrollYProgress, [0, 0.08], [0, -40])

  // Subtle parallax on the bg during phase 1
  const bgY = useTransform(scrollYProgress, [0, 0.22], ['0vh', '-6vh'])

  // ── Phase 2: bg fades, page darkens ──
  const bgOpacity = useTransform(scrollYProgress, [0.25, 0.40], [1, 0])

  // ── Phase 3: annotations radiating from the planet ──
  const lineA = useTransform(scrollYProgress, [0.43, 0.48], [0, 1])
  const labelA = useTransform(scrollYProgress, [0.47, 0.51], [0, 1])
  const lineB = useTransform(scrollYProgress, [0.51, 0.56], [0, 1])
  const labelB = useTransform(scrollYProgress, [0.55, 0.59], [0, 1])
  const lineC = useTransform(scrollYProgress, [0.59, 0.64], [0, 1])
  const labelC = useTransform(scrollYProgress, [0.63, 0.67], [0, 1])

  // Scroll hint
  const hintOpacity = useTransform(scrollYProgress, [0, 0.04], [1, 0])

  const [openFaq, setOpenFaq] = useState(0)
  const [stats, setStats] = useState({ prayersToday: 0, totalAnswered: 0, totalPrayers: 0, totalRequests: 0 })
  const year = new Date().getFullYear()

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats).catch(() => {})
  }, [])

  const faqs = [
    {
      q: '¿Tengo que registrarme para orar por una petición?',
      a: 'No. Cualquier visitante puede leer las peticiones del globo y orar por ellas. Solo necesitas una cuenta para publicar las tuyas o dejar testimonio.',
    },
    {
      q: '¿Puedo compartir mi petición de forma anónima?',
      a: 'Sí. Al publicar eliges si quieres aparecer con tu nombre o permanecer anónimo. En ambos casos la petición entra al muro y recibe oración.',
    },
    {
      q: '¿Cuánto tiempo permanece mi petición en el globo?',
      a: 'Treinta días. El contador se reinicia cada vez que alguien ora por ti, así que mientras el muro siga intercediendo tu petición sigue visible.',
    },
    {
      q: '¿Cómo marco una petición como respondida?',
      a: 'Desde tu perfil puedes marcarla y escribir un breve testimonio. La petición sale del globo con una animación y pasa a la galería de testimonios.',
    },
    {
      q: '¿Es gratuito?',
      a: 'Completamente. El muro es parte de un proyecto de la clase de Misión Mundial, sin fines de lucro.',
    },
  ]

  return (
    <main className={styles.page}>
      {/* HERO — parallax: atmosphere bg + rotating earth rising into center */}
      <section ref={heroRef} className={styles.hero}>
        <div className={styles.heroSticky}>
          <motion.div
            className={styles.heroImageWrap}
            style={{ y: bgY, opacity: bgOpacity }}
          >
            <img src={bgPlanet} alt="" className={styles.heroImage} />
            <div className={styles.heroVignette} />
          </motion.div>

          <div className={styles.earthPosition}>
            <motion.div
              className={styles.earthMover}
              style={{ y: earthY, scale: earthScale, opacity: earthOpacity }}
            >
              <img src={planet} alt="" className={styles.earth} />
            </motion.div>
          </div>

          <motion.div
            className={styles.heroContent}
            style={{ opacity: textOpacity, y: textY }}
          >
            <h1 className={styles.title}>
              Ningún clamor<br />
              <span className={styles.titleAccent}>queda sin escuchar</span>
            </h1>

            <p className={styles.subtitle}>
              Comparte tu petición. Recibe oraciones de personas alrededor del mundo.
              Cada cirio en el globo es un corazón intercediendo por otro.
            </p>

            <div className={styles.ctas}>
              <Link to="/globo" className={styles.primaryBtn}>
                Entrar al Muro
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <Link to="/testimonios" className={styles.secondaryBtn}>
                Ver testimonios
              </Link>
            </div>

            <div className={styles.heroStats}>
              <div className={styles.heroStat}>
                <span className={styles.heroStatNum}>{stats.totalRequests || 0}</span>
                <span className={styles.heroStatLabel}>peticiones</span>
              </div>
              <div className={styles.heroStatDivider} />
              <div className={styles.heroStat}>
                <span className={styles.heroStatNum}>{stats.prayersToday || 0}</span>
                <span className={styles.heroStatLabel}>oraciones hoy</span>
              </div>
              <div className={styles.heroStatDivider} />
              <div className={styles.heroStat}>
                <span className={styles.heroStatNum}>{stats.totalAnswered || 0}</span>
                <span className={styles.heroStatLabel}>respondidas</span>
              </div>
            </div>
          </motion.div>

          {/* Phase 3 — annotations radiating from the planet */}
          <div className={styles.annotations} aria-hidden="true">
            {/* A — top-right: diagonal up from planet, then horizontal to text */}
            <div className={`${styles.annotation} ${styles.annotationA}`}>
              <svg className={styles.annotationSvg} width="110" height="60" viewBox="0 0 110 60">
                <motion.polyline
                  points="0,60 55,30 110,30"
                  fill="none"
                  stroke="rgba(212, 164, 84, 0.9)"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  style={{ pathLength: lineA }}
                />
              </svg>
              <motion.div className={styles.annotationText} style={{ opacity: labelA }}>
                <h4>Comparte tu petición</h4>
                <p>Publica en pocas palabras lo que llevas en el corazón</p>
              </motion.div>
            </div>

            {/* B — left: straight horizontal line */}
            <div className={`${styles.annotation} ${styles.annotationB}`}>
              <motion.div className={styles.annotationText} style={{ opacity: labelB }}>
                <h4>Crece al interceder</h4>
                <p>Cada oración hace que la luz brille más alto</p>
              </motion.div>
              <svg className={styles.annotationSvg} width="110" height="2" viewBox="0 0 110 2">
                <motion.line
                  x1="110" y1="1" x2="0" y2="1"
                  stroke="rgba(212, 164, 84, 0.9)"
                  strokeWidth="1"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  style={{ pathLength: lineB }}
                />
              </svg>
            </div>

            {/* C — bottom-right: diagonal down from planet, then horizontal to text */}
            <div className={`${styles.annotation} ${styles.annotationC}`}>
              <svg className={styles.annotationSvg} width="110" height="60" viewBox="0 0 110 60">
                <motion.polyline
                  points="0,0 55,30 110,30"
                  fill="none"
                  stroke="rgba(212, 164, 84, 0.9)"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  style={{ pathLength: lineC }}
                />
              </svg>
              <motion.div className={styles.annotationText} style={{ opacity: labelC }}>
                <h4>Se vuelve testimonio</h4>
                <p>Cuando Dios responde, ilumina a otros</p>
              </motion.div>
            </div>
          </div>

          <div className={styles.scrollHint}>
            <motion.div className={styles.scrollHintInner} style={{ opacity: hintOpacity }}>
              <span>Desliza</span>
              <svg width="12" height="18" viewBox="0 0 12 18" fill="none">
                <path d="M6 1v16M1 12l5 5 5-5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className={styles.faqSection}>
        <div className={styles.faqInner}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className={styles.faqHeader}
          >
            <span className={styles.sectionLabel}>¿Tienes dudas?</span>
            <h2 className={styles.sectionTitle}>Preguntas frecuentes</h2>
          </motion.div>

          <div className={styles.faqList}>
            {faqs.map((faq, i) => {
              const open = openFaq === i
              return (
                <motion.div
                  key={i}
                  className={`${styles.faqItem} ${open ? styles.faqItemOpen : ''}`}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                  variants={fadeUp}
                  transition={{ duration: 0.6, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                >
                  <button
                    type="button"
                    className={styles.faqBtn}
                    onClick={() => setOpenFaq(open ? -1 : i)}
                    aria-expanded={open}
                  >
                    <span className={styles.faqQ}>{faq.q}</span>
                    <span className={`${styles.faqIcon} ${open ? styles.faqIconOpen : ''}`} aria-hidden="true">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M1 7h12M7 1v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        key="answer"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                        style={{ overflow: 'hidden' }}
                      >
                        <p className={styles.faqA}>{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CLOSING */}
      <section className={styles.closing}>
        <motion.div
          className={styles.closingInner}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className={styles.verse}>
            «Confesaos vuestras ofensas unos a otros, y orad unos por otros, para que seáis sanados.»
          </p>
          <p className={styles.verseRef}>Santiago 5:16</p>
        </motion.div>

        <footer className={styles.footer}>
          <div className={styles.footerInner}>
            <div className={styles.footerRow}>
              <Link to="/" className={styles.footerLogoLink} aria-label="Inicio">
                <img src={logo} alt="Muro de Oración" className={styles.footerLogoImg} />
              </Link>

              <nav className={styles.footerNav}>
                <Link to="/globo">Globo</Link>
                <Link to="/testimonios">Testimonios</Link>
                <Link to="/nueva">Nueva petición</Link>
              </nav>

              <div className={styles.footerSocials}>
                <a href="#" className={styles.footerSocial} aria-label="GitHub" target="_blank" rel="noreferrer">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                  </svg>
                </a>
                <a href="mailto:#" className={styles.footerSocial} aria-label="Correo">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                </a>
              </div>
            </div>

            <div className={styles.footerDivider} />

            <p className={styles.footerBottom}>
              © {year} <span className={styles.footerBrandText}>Muro de Oración</span> · Hecho para la clase de Misión Mundial
            </p>
          </div>
        </footer>
      </section>
    </main>
  )
}

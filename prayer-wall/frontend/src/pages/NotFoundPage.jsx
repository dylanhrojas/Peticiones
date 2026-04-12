import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function NotFoundPage() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem',
      textAlign: 'center',
      gap: '1rem',
    }}>
      <motion.span
        style={{
          fontFamily: "'Fraunces', 'Cormorant Garamond', serif",
          fontSize: 'clamp(5rem, 15vw, 9rem)',
          fontWeight: 900,
          fontStyle: 'italic',
          color: 'var(--gold)',
          lineHeight: 1,
          textShadow: '0 0 60px rgba(245, 194, 107, 0.25)',
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        404
      </motion.span>

      <motion.p
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '1.4rem',
          color: 'var(--text-muted)',
          fontWeight: 400,
          maxWidth: 400,
        }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        Esta pagina no existe, pero tu oracion si importa.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}
      >
        <Link
          to="/"
          style={{
            padding: '0.7rem 1.5rem',
            background: 'linear-gradient(135deg, var(--gold), var(--gold-light))',
            color: '#0a0e1a',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.82rem',
            fontWeight: 600,
            letterSpacing: '0.03em',
            textDecoration: 'none',
            transition: 'box-shadow 0.3s ease',
          }}
        >
          Ir al inicio
        </Link>
        <Link
          to="/globo"
          style={{
            padding: '0.7rem 1.5rem',
            border: '1px solid var(--glass-border)',
            color: 'var(--text-muted)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.82rem',
            fontWeight: 500,
            textDecoration: 'none',
            transition: 'border-color 0.3s ease',
          }}
        >
          Ver el muro
        </Link>
      </motion.div>
    </div>
  )
}

import { motion } from 'framer-motion'

const dotStyle = {
  width: 8,
  height: 8,
  borderRadius: '50%',
  background: 'var(--gold)',
}

export default function Loader({ text }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1.25rem',
      padding: '6rem 2rem',
      minHeight: '50vh',
    }}>
      <div style={{ display: 'flex', gap: 6 }}>
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            style={dotStyle}
            animate={{ opacity: [0.25, 1, 0.25], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
          />
        ))}
      </div>
      {text && (
        <span style={{
          fontSize: '0.78rem',
          color: 'var(--text-dim)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          fontWeight: 500,
        }}>
          {text}
        </span>
      )}
    </div>
  )
}

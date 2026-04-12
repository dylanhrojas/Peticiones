import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import styles from './Navbar.module.css'
import logo from '../assets/logo.webp'

function NavLink({ to, active, children }) {
  return (
    <Link to={to} className={`${styles.navLink} ${active ? styles.navLinkActive : ''}`}>
      {children}
    </Link>
  )
}

function getInitials(name) {
  if (!name) return '?'
  return name.trim().split(/\s+/).map(p => p[0]).slice(0, 2).join('').toUpperCase()
}

function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)

  useEffect(() => {
    function onDocClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  return (
    <div className={styles.userMenu} ref={wrapRef}>
      <button
        className={styles.avatarBtn}
        onClick={() => setOpen(o => !o)}
        aria-label="Menú de usuario"
      >
        {user.photoUrl ? (
          <img src={user.photoUrl} alt={user.name} className={styles.avatarImg} />
        ) : (
          <span className={styles.avatarInitials}>{getInitials(user.name)}</span>
        )}
      </button>

      {open && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <span className={styles.dropdownName}>{user.name}</span>
            {user.email && <span className={styles.dropdownEmail}>{user.email}</span>}
          </div>
          <div className={styles.dropdownDivider} />
          <Link to="/perfil" className={styles.dropdownItem} onClick={() => setOpen(false)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            Editar perfil
          </Link>
          <Link to="/nueva" className={styles.dropdownItem} onClick={() => setOpen(false)}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Nueva petición
          </Link>
          <Link to="/mis-peticiones" className={styles.dropdownItem} onClick={() => setOpen(false)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 5a5.5 5.5 0 0 1 9.5 7c-2.5 4.5-9.5 9-9.5 9Z"/>
            </svg>
            Mis peticiones
          </Link>
          <div className={styles.dropdownDivider} />
          <button className={styles.dropdownItem} onClick={() => { setOpen(false); onLogout() }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5.5 1H2.5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3M9 4l3 3-3 3M12 7H5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}

export default function Navbar() {
  const { pathname } = useLocation()
  const { user, logout } = useAuth()

  return (
    <header className={styles.nav}>
      <Link to="/" className={styles.brand} aria-label="Muro de Oración — Inicio">
        <img src={logo} alt="Muro de Oración" className={styles.brandLogo} />
      </Link>

      <div className={styles.right}>
        <nav className={styles.links}>
          <NavLink to="/globo" active={pathname === '/globo'}>Globo</NavLink>
          <NavLink to="/testimonios" active={pathname === '/testimonios'}>Testimonios</NavLink>
        </nav>

        <div className={styles.actions}>
          {user ? (
            <UserMenu user={user} onLogout={logout} />
          ) : (
            <Link to="/login" className={styles.ghostBtn}>Entrar</Link>
          )}
        </div>
      </div>
    </header>
  )
}

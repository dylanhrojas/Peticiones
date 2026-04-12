import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

// Decode the JWT payload to extract userId (subject) without a library.
function parseUserId(token) {
  if (!token) return null
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return Number(payload.sub)
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    if (!saved) return null
    const parsed = JSON.parse(saved)
    // Ensure userId is always present by extracting from the JWT
    if (!parsed.userId && parsed.token) {
      parsed.userId = parseUserId(parsed.token)
    }
    return parsed
  })

  function login(data) {
    // Ensure userId even if backend response doesn't include it
    if (!data.userId && data.token) {
      data.userId = parseUserId(data.token)
    }
    localStorage.setItem('user', JSON.stringify(data))
    setUser(data)
  }

  function logout() {
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

// Helper to get auth headers for fetch calls
export function authHeaders() {
  const saved = localStorage.getItem('user')
  if (!saved) return {}
  const { token } = JSON.parse(saved)
  return { Authorization: `Bearer ${token}` }
}

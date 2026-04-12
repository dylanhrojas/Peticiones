import { useEffect, useRef } from 'react'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

export default function GoogleSignInButton({ onSuccess, onError }) {
  const btnRef = useRef(null)

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !window.google) return

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (response) => {
        try {
          const res = await fetch('/api/auth/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential: response.credential }),
          })
          if (!res.ok) {
            const msg = await res.text()
            throw new Error(msg || 'Error al iniciar con Google')
          }
          const data = await res.json()
          onSuccess(data)
        } catch (err) {
          onError?.(err.message)
        }
      },
    })

    window.google.accounts.id.renderButton(btnRef.current, {
      type: 'standard',
      theme: 'filled_black',
      size: 'large',
      text: 'continue_with',
      shape: 'pill',
      width: 320,
      locale: 'es',
    })
  }, [onSuccess, onError])

  if (!GOOGLE_CLIENT_ID) return null

  return <div ref={btnRef} style={{ display: 'flex', justifyContent: 'center' }} />
}

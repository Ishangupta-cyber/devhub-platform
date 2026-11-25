import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { googleLogin } from '../api/auth'
import { useAuth } from '../../../hooks/useAuth'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
let scriptPromise = null

// Google Identity Services, loaded once and only on pages that show the button.
function loadGoogleScript() {
  if (window.google?.accounts?.id) return Promise.resolve()
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script')
      s.src = 'https://accounts.google.com/gsi/client'
      s.async = true
      s.onload = resolve
      s.onerror = () => { scriptPromise = null; reject(new Error('Could not load Google sign-in.')) }
      document.head.appendChild(s)
    })
  }
  return scriptPromise
}

// Renders nothing until VITE_GOOGLE_CLIENT_ID is configured.
export default function GoogleSignInButton({ text = 'signin_with', onError }) {
  const ref = useRef(null)
  const { login } = useAuth()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!CLIENT_ID) return
    let cancelled = false

    loadGoogleScript()
      .then(() => {
        if (cancelled || !ref.current) return
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: async ({ credential }) => {
            setBusy(true)
            try {
              const { data } = await googleLogin(credential)
              login({ access: data.access, refresh: data.refresh })
              navigate('/')
            } catch (err) {
              onError?.(err.response?.data?.detail || 'Google sign-in failed. Try again.')
            } finally {
              setBusy(false)
            }
          },
        })
        window.google.accounts.id.renderButton(ref.current, {
          theme: 'outline',
          size: 'large',
          shape: 'rectangular',
          text,
          width: ref.current.offsetWidth || 320,
        })
      })
      .catch((e) => onError?.(e.message))

    return () => { cancelled = true }
  }, [login, navigate, onError, text])

  if (!CLIENT_ID) return null

  return (
    <div>
      <div className="flex items-center gap-3 my-5">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs font-mono text-muted">or</span>
        <span className="h-px flex-1 bg-border" />
      </div>
      <div ref={ref} className={`w-full flex justify-center min-h-[44px] ${busy ? 'opacity-50 pointer-events-none' : ''}`} />
      {busy && <p className="text-xs text-muted text-center mt-2">Signing you in…</p>}
    </div>
  )
}

import { useEffect, useState } from 'react'

// Shown while a lazily-loaded page chunk downloads, or while the first
// /auth/me call waits on the API. The backend runs on a free instance that
// sleeps when idle, so the first request after a quiet spell can take up to
// a minute; after a few seconds we say so instead of leaving a blank screen.
export default function PageLoader({ fullScreen = false }) {
  const [slow, setSlow] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setSlow(true), 4000)
    return () => clearTimeout(t)
  }, [])

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 text-center px-4 ${
        fullScreen ? 'min-h-screen bg-canvas' : 'pt-24'
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="h-8 w-8 rounded-full border-2 border-border border-t-accent animate-spin" />
      {slow && (
        <p className="text-sm text-muted max-w-xs">
          Waking up the server — the first load after a while can take up to a minute.
        </p>
      )}
    </div>
  )
}

// Single source for the backend URL.
//
// VITE_API_URL (from .env / .env.production / the hosting provider) wins,
// except that a deployed page must never talk to "localhost": that would be
// the visitor's own machine. A stale or empty hosting-provider variable has
// broken the live site that way before, so on a non-local host we fall back
// to the production API instead.
const PRODUCTION_API = 'https://devhub-platform-4.onrender.com/api'
const LOCAL_API = 'http://localhost:8000/api'

const isLocalUrl = (url) => /^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(url)
const runningLocally = ['localhost', '127.0.0.1'].includes(window.location.hostname)

function resolveApiUrl() {
  const fromEnv = (import.meta.env.VITE_API_URL || '').trim()
  if (fromEnv && (runningLocally || !isLocalUrl(fromEnv))) return fromEnv
  return runningLocally ? LOCAL_API : PRODUCTION_API
}

export const API_URL = resolveApiUrl().replace(/\/$/, '')

// ws(s)://host, derived from the API url so it follows http → ws / https → wss
export const WS_URL = API_URL.replace(/^http/, 'ws').replace(/\/api$/, '')

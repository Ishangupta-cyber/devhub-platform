// Single source for the backend URL. Set VITE_API_URL in the hosting
// provider (e.g. Vercel → Project → Settings → Environment Variables) to the
// deployed API, e.g. https://<your-service>.onrender.com/api — it is baked in
// at build time, so redeploy after changing it.
export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/$/, '')

// ws(s)://host, derived from the API url so it follows http → ws / https → wss
export const WS_URL = API_URL.replace(/^http/, 'ws').replace(/\/api$/, '')

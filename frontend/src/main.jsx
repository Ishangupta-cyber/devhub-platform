import { createRoot } from 'react-dom/client'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import NotificationProvider from './context/NotificationContext'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { API_URL } from './api/config'

// Fire-and-forget ping so a sleeping backend starts booting while the
// user is still looking at the login page, not when they press "Sign in".
fetch(`${API_URL}/health/`).catch(() => {})

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <NotificationProvider>
         <App />
      
      </NotificationProvider>
    </AuthProvider>
  </BrowserRouter>
)
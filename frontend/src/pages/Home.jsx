import { useAuth } from '../hooks/useAuth'

function Home() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center text-center">
      {/* Navbar hata diya yahां se, ProtectedRoute khud lagा dega */}
      ...
    </div>
  )
}

export default Home
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import NotificationBell from '../features/notifications/components/NotificationBell'
import SearchBox from '../features/search/components/SearchBox'

function Navbar() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <nav className="bg-[#0F1424] border-b border-[#242B45] px-6 py-3 flex items-center justify-between">
      <Link to="/" className="font-display text-lg font-semibold text-[#E4E7F2]">
        Devhub
      </Link>

      <div className="flex items-center gap-4">
        <Link to="/repositories" className="text-sm text-[#8B90A8] hover:text-[#E4E7F2]">Repositories</Link>
        <Link to="/activity" className="text-sm text-[#8B90A8] hover:text-[#E4E7F2]">Activity</Link>
        <Link to="/organizations" className="text-sm text-[#8B90A8] hover:text-[#E4E7F2]">Organizations</Link>
        <Link to="/edit-profile" className="text-sm text-[#8B90A8] hover:text-[#E4E7F2]">Edit Profile</Link>
        <Link to="/change-password" className="text-sm text-[#8B90A8] hover:text-[#E4E7F2]">Password</Link>

        {user && <NotificationBell />}
       
        {user && <SearchBox />}

        {user && (
          <>
            <span className="text-sm text-[#8B90A8]">@{user.username}</span>
            <button onClick={handleLogout} className="text-sm text-[#8B90A8] hover:text-[#E4E7F2] transition-colors">
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar

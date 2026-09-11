import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import NotificationBell from '../features/notifications/components/NotificationBell'
import SearchBox from '../features/search/components/SearchBox'

const NAV_LINKS = [
  { to: '/repositories', label: 'Repositories' },
  { to: '/activity', label: 'Activity' },
  { to: '/organizations', label: 'Organizations' },
]

function Navbar() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  const initial = (user?.full_name || user?.username || '?').charAt(0).toUpperCase()

  return (
    <nav className="sticky top-0 z-40 bg-surface border-b border-border">
      <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between gap-4">

        <div className="flex items-center gap-6">
          <Link to="/" className="font-display text-lg font-semibold text-fg">
            Dev<span className="text-accent">hub</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `text-sm rounded-md px-3 py-1.5 transition-colors ${
                    isActive
                      ? 'bg-accent-soft text-accent font-medium'
                      : 'text-muted hover:text-fg hover:bg-subtle'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user && <SearchBox />}
          {user && <NotificationBell />}

          {user && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((open) => !open)}
                className="flex items-center gap-2 rounded-md py-1 pl-1 pr-2 hover:bg-subtle transition-colors"
              >
                {user.avatar ? (
                  <img src={user.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  <span className="w-7 h-7 rounded-full bg-accent-soft text-accent text-xs font-semibold flex items-center justify-center">
                    {initial}
                  </span>
                )}
                <span className="hidden sm:block text-sm text-muted">@{user.username}</span>
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-52 z-50 bg-surface border border-border rounded-lg shadow-lg py-1">
                    <div className="px-3 py-2 border-b border-border">
                      <p className="text-sm font-medium text-fg truncate">{user.full_name || user.username}</p>
                      <p className="text-xs text-muted truncate">@{user.username}</p>
                    </div>

                    <MenuLink to={`/profile/${user.username}`} onClick={() => setMenuOpen(false)}>
                      Your profile
                    </MenuLink>
                    <MenuLink to="/notifications" onClick={() => setMenuOpen(false)}>
                      Notifications
                    </MenuLink>
                    <MenuLink to="/edit-profile" onClick={() => setMenuOpen(false)}>
                      Edit profile
                    </MenuLink>
                    <MenuLink to="/change-password" onClick={() => setMenuOpen(false)}>
                      Change password
                    </MenuLink>

                    <div className="border-t border-border mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-3 py-2 text-sm text-danger hover:bg-subtle transition-colors"
                      >
                        Log out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

function MenuLink({ to, onClick, children }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="block px-3 py-2 text-sm text-fg hover:bg-subtle transition-colors"
    >
      {children}
    </Link>
  )
}

export default Navbar

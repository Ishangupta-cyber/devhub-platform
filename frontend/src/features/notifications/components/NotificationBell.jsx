import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useNotifications } from '../../../hooks/useNotifications'

const VERB_TEXT = {
  followed_you: 'started following you',
  opened_issue_on_your_repo: 'opened an issue on your repository',
  commented_on_your_issue: 'commented on your issue',
}

// WS payload `str(created_at)` bhejta hai (space separator), REST proper ISO bhejta hai.
// Space wala format har browser parse nahi karta, isliye normalize kar rahe hain.
const parseDate = (value) => {
  if (!value) return null
  const parsed = new Date(typeof value === 'string' ? value.replace(' ', 'T') : value)
  return isNaN(parsed.getTime()) ? null : parsed
}

const timeAgo = (dateString) => {
  const date = parseDate(dateString)
  if (!date) return ''
  const seconds = Math.floor((Date.now() - date) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

function NotificationBell() {
  const { notifications, unreadCount, connected, markAsRead } = useNotifications()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        aria-expanded={open}
        className="relative text-sm text-muted hover:text-fg transition-colors"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-2 bg-accent text-white text-[10px] font-medium rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-surface border border-border rounded-md shadow-2xl z-50 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <p className="font-mono text-xs text-muted">notifications</p>
            <span
              className={`w-2 h-2 rounded-full ${connected ? 'bg-[#27C93F]' : 'bg-muted'}`}
              title={connected ? 'Live' : 'Offline'}
            />
          </div>

          {notifications.length === 0 ? (
            <p className="text-sm text-muted px-4 py-6 text-center">Nothing yet.</p>
          ) : (
            notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => !n.is_read && markAsRead(n.id)}
                className={`w-full text-left px-4 py-3 border-b border-border last:border-b-0 hover:bg-subtle transition-colors ${
                  !n.is_read ? 'bg-subtle' : ''
                }`}
              >
                <p className="text-sm text-fg">
                  <span className="text-accent font-medium">@{n.actor}</span>
                  {' '}
                  {VERB_TEXT[n.verb] || n.verb}
                </p>
                <p className="text-xs text-muted mt-1">{timeAgo(n.created_at)}</p>
              </button>
            ))
          )}

          <Link
            to="/notifications"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-center text-xs text-muted hover:text-fg border-t border-border transition-colors"
          >
            View all
          </Link>
        </div>
      )}
    </div>
  )
}

export default NotificationBell

import React from 'react'
import { Link } from 'react-router-dom'
import { useNotifications } from '../../../hooks/useNotifications'

const VERB_LABELS = {
  followed_you: 'started following you',
  opened_issue_on_your_repo: 'opened an issue on your repository',
  commented_on_your_issue: 'commented on your issue',
}

export default function Notifications() {

  const {notifications,unreadCount,loading,markAsRead}=useNotifications()

  if (loading) return <div className="p-6" />

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">

        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl text-fg">Notifications</h1>
          {unreadCount > 0 && (
            <span className="text-sm text-muted">{unreadCount} unread</span>
          )}
        </div>

        {notifications.length === 0 && (
          <p className="text-sm text-muted">
            Nothing here yet. You'll see updates about your repositories and issues.
          </p>
        )}

        <div className="space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`border rounded-md px-4 py-3 flex items-start justify-between gap-4 ${
                notification.is_read
                  ? 'bg-surface border-border'
                  : 'bg-subtle border-border'
              }`}
            >
              <div>
                <p className="text-sm text-fg">
                  <Link
                    to={`/profile/${notification.actor}`}
                    className="text-accent hover:underline font-medium"
                  >
                    @{notification.actor}
                  </Link>
                  {' '}
                  {VERB_LABELS[notification.verb] || notification.verb}
                </p>
                {notification.created_at && (
                  <p className="text-xs text-muted mt-1">
                    {new Date(notification.created_at).toLocaleString()}
                  </p>
                )}
              </div>

              {!notification.is_read && (
                <button
                  onClick={() => markAsRead(notification.id)}
                  className="text-xs text-muted hover:text-fg transition-colors shrink-0"
                >
                  Mark as read
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

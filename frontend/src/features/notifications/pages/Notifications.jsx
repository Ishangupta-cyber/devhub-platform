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

  if (loading) return <div className="min-h-screen bg-[#0B0F1A]" />

  return (
    <div className="min-h-screen bg-[#0B0F1A] p-6">
      <div className="max-w-2xl mx-auto">

        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl text-[#E4E7F2]">Notifications</h1>
          {unreadCount > 0 && (
            <span className="text-sm text-[#8B90A8]">{unreadCount} unread</span>
          )}
        </div>

        {notifications.length === 0 && (
          <p className="text-sm text-[#8B90A8]">
            Nothing here yet. You'll see updates about your repositories and issues.
          </p>
        )}

        <div className="space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`border rounded-md px-4 py-3 flex items-start justify-between gap-4 ${
                notification.is_read
                  ? 'bg-[#12162A] border-[#242B45]'
                  : 'bg-[#161B33] border-[#3A3F63]'
              }`}
            >
              <div>
                <p className="text-sm text-[#E4E7F2]">
                  <Link
                    to={`/profile/${notification.actor}`}
                    className="text-[#7C6FF5] hover:underline font-medium"
                  >
                    @{notification.actor}
                  </Link>
                  {' '}
                  {VERB_LABELS[notification.verb] || notification.verb}
                </p>
                {notification.created_at && (
                  <p className="text-xs text-[#8B90A8] mt-1">
                    {new Date(notification.created_at).toLocaleString()}
                  </p>
                )}
              </div>

              {!notification.is_read && (
                <button
                  onClick={() => markAsRead(notification.id)}
                  className="text-xs text-[#8B90A8] hover:text-[#E4E7F2] transition-colors shrink-0"
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

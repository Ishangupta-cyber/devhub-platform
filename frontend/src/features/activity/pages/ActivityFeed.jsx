import React, { useEffect, useState } from 'react'
import { getFeed } from '../api/activity'
import { Link } from 'react-router-dom'

const VERB_LABELS = {
  followed: 'followed',
  created_repository: 'created repository',
  created_issue: 'opened issue',
}

export default function ActivityFeed() {

  const [activities,setActivities]=useState([])
  const [error,setError]=useState("")
  const [loading,setLoading]=useState(true)

    useEffect(() => {
    const fetchFeed = async () => {
      setLoading(true)
      try {
        const res = await getFeed()
        const data = Array.isArray(res.data) ? res.data : res.data.results
        setActivities(data)
      } catch (err) {
        setError('Failed to load feed.')
      } finally {
        setLoading(false)
      }
    }
    fetchFeed()
  }, [])



 if (loading) return <div className="p-6" />
  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-2xl text-fg mb-6">Activity</h1>

        {error && (
          <div className="mb-4 px-3 py-2 rounded-md bg-danger-bg border border-danger-border text-danger text-sm">
            {error}
          </div>
        )}

        {activities.length === 0 && !error && (
          <p className="text-sm text-muted">
            Nothing here yet. Follow some people to see their activity.
          </p>
        )}

        <div className="space-y-2">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="bg-surface border border-border rounded-md px-4 py-3"
            >
              <p className="text-sm text-fg">
                <Link
                  to={`/profile/${activity.actor}`}
                  className="text-accent hover:underline font-medium"
                >
                  @{activity.actor}
                </Link>
                {' '}
                {VERB_LABELS[activity.verb] || activity.verb}
                {' '}
                <span className="font-mono text-muted">{activity.target_display}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

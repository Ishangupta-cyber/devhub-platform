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



 if (loading) return <div className="min-h-screen bg-[#0B0F1A]" />
  return (
    <div className="min-h-screen bg-[#0B0F1A] p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-2xl text-[#E4E7F2] mb-6">Activity</h1>

        {error && (
          <div className="mb-4 px-3 py-2 rounded-md bg-[#3A1B23] border border-[#5C2430] text-[#F4A9B5] text-sm">
            {error}
          </div>
        )}

        {activities.length === 0 && !error && (
          <p className="text-sm text-[#8B90A8]">
            Nothing here yet. Follow some people to see their activity.
          </p>
        )}

        <div className="space-y-2">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="bg-[#12162A] border border-[#242B45] rounded-md px-4 py-3"
            >
              <p className="text-sm text-[#E4E7F2]">
                <Link
                  to={`/profile/${activity.actor}`}
                  className="text-[#7C6FF5] hover:underline font-medium"
                >
                  @{activity.actor}
                </Link>
                {' '}
                {VERB_LABELS[activity.verb] || activity.verb}
                {' '}
                <span className="font-mono text-[#8B90A8]">{activity.target_display}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

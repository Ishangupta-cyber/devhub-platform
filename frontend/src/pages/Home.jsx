import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useNotifications } from '../hooks/useNotifications'
import { listRepositories } from '../features/repositories/api/repositories'
import { listOrganizations } from '../features/organizations/api/organisations'
import { getFeed } from '../features/activity/api/activity'

const VERB_LABELS = {
  followed: 'followed',
  created_repository: 'created repository',
  created_issue: 'opened issue',
}

/** These endpoints return either a plain array or a paginated {results: []}. */
function toList(res) {
  const data = res?.data
  if (Array.isArray(data)) return data
  return data?.results ?? []
}

function timeAgo(iso) {
  if (!iso) return ''
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  const units = [['y', 31536000], ['mo', 2592000], ['d', 86400], ['h', 3600], ['m', 60]]
  for (const [label, secs] of units) {
    const value = Math.floor(seconds / secs)
    if (value >= 1) return `${value}${label} ago`
  }
  return 'just now'
}

function Home() {
  const { user } = useAuth()
  const { unreadCount } = useNotifications()

  const [repos, setRepos] = useState([])
  const [orgs, setOrgs] = useState([])
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.username) return

    const load = async () => {
      setLoading(true)
      // allSettled so one failing endpoint doesn't blank the whole dashboard
      const [reposRes, orgsRes, feedRes] = await Promise.allSettled([
        listRepositories(),
        listOrganizations(),
        getFeed(),
      ])

      if (reposRes.status === 'fulfilled') setRepos(toList(reposRes.value))
      if (orgsRes.status === 'fulfilled') setOrgs(toList(orgsRes.value))
      if (feedRes.status === 'fulfilled') setActivities(toList(feedRes.value))
      setLoading(false)
    }

    load()
  }, [user?.username])

  if (loading) return <DashboardSkeleton />

  const stats = [
    { label: 'Repositories', value: repos.length, to: '/repositories' },
    { label: 'Organizations', value: orgs.length, to: '/organizations' },
    { label: 'Unread notifications', value: unreadCount, to: '/notifications' },
  ]

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto">

        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-2xl font-semibold text-fg">
              Welcome back, {user?.full_name || user?.username}
            </h1>
            <p className="text-sm text-muted mt-1">
              Here is what is happening across your work.
            </p>
          </div>
          <Link
            to="/repositories/new"
            className="bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-md px-4 py-2 transition-colors"
          >
            New repository
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          {stats.map((stat) => (
            <Link
              key={stat.label}
              to={stat.to}
              className="bg-surface border border-border rounded-lg px-4 py-3 hover:border-accent transition-colors"
            >
              <p className="font-display text-2xl font-semibold text-fg">{stat.value}</p>
              <p className="text-xs text-muted mt-0.5">{stat.label}</p>
            </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-4">

          <Panel title="Your repositories" action={{ to: '/repositories', label: 'View all' }}>
            {repos.length === 0 ? (
              <Empty text="No repositories yet." linkTo="/repositories/new" linkLabel="Create your first one" />
            ) : (
              <ul className="divide-y divide-border">
                {repos.slice(0, 5).map((repo) => (
                  <li key={repo.id}>
                    <Link to={`/repositories/${repo.id}`} className="block px-4 py-3 hover:bg-subtle transition-colors">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-fg font-mono truncate">{repo.name}</p>
                        {repo.organization && (
                          <span className="shrink-0 text-[11px] bg-accent-soft text-accent rounded px-1.5 py-0.5">
                            {repo.organization.name}
                          </span>
                        )}
                      </div>
                      {repo.description && (
                        <p className="text-xs text-muted mt-1 truncate">{repo.description}</p>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Recent activity" action={{ to: '/activity', label: 'View all' }}>
            {activities.length === 0 ? (
              <Empty text="Nothing yet. Follow people to see their activity." />
            ) : (
              <ul className="divide-y divide-border">
                {activities.slice(0, 5).map((activity) => (
                  <li key={activity.id} className="px-4 py-3">
                    <p className="text-sm text-fg">
                      <Link to={`/profile/${activity.actor}`} className="text-accent hover:underline font-medium">
                        @{activity.actor}
                      </Link>
                      {' '}
                      {VERB_LABELS[activity.verb] || activity.verb}
                      {' '}
                      <span className="font-mono text-muted">{activity.target_display}</span>
                    </p>
                    <p className="text-xs text-muted mt-0.5">{timeAgo(activity.created_at)}</p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <div className="mt-4">
          <Panel title="Your organizations" action={{ to: '/organizations', label: 'View all' }}>
            {orgs.length === 0 ? (
              <Empty text="You are not part of any organization yet." />
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
                {orgs.slice(0, 6).map((org) => (
                  <Link
                    key={org.id}
                    to={`/organizations/${org.id}`}
                    className="border border-border rounded-md px-3 py-2.5 hover:border-accent transition-colors"
                  >
                    <p className="text-sm font-medium text-fg truncate">{org.name}</p>
                    <p className="text-xs text-muted truncate">{org.description || 'No description'}</p>
                  </Link>
                ))}
              </div>
            )}
          </Panel>
        </div>

      </div>
    </div>
  )
}

function Panel({ title, action, children }) {
  return (
    <section className="bg-surface border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold text-fg">{title}</h2>
        {action && (
          <Link to={action.to} className="text-xs text-accent hover:underline">
            {action.label}
          </Link>
        )}
      </div>
      {children}
    </section>
  )
}

function Empty({ text, linkTo, linkLabel }) {
  return (
    <div className="px-4 py-8 text-center">
      <p className="text-sm text-muted">{text}</p>
      {linkTo && (
        <Link to={linkTo} className="inline-block mt-2 text-sm text-accent hover:underline">
          {linkLabel}
        </Link>
      )}
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto animate-pulse">
        <div className="h-8 w-64 bg-subtle rounded mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-surface border border-border rounded-lg" />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="h-64 bg-surface border border-border rounded-lg" />
          <div className="h-64 bg-surface border border-border rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export default Home

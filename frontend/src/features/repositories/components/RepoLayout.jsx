import { useCallback, useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useParams } from 'react-router-dom'
import { getRepository } from '../api/repositories'
import useCanManageRepo from '../../../hooks/useCanManageRepo'

const TABS = [
  { to: '', label: 'Overview', end: true },
  { to: 'issues', label: 'Issues' },
  { to: 'pull-requests', label: 'Pull requests' },
  { to: 'projects', label: 'Projects' },
  { to: 'wiki', label: 'Wiki' },
]

/**
 * Shared chrome for everything under /repositories/:repoId.
 * Fetches the repo once and hands it to child routes via outlet context,
 * so the sub-pages don't each refetch it.
 */
export default function RepoLayout() {
  const { repoId } = useParams()
  const [repo, setRepo] = useState(null)
  const [loading, setLoading] = useState(true)

  const { canManage, checking } = useCanManageRepo(repo)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await getRepository(repoId)
        setRepo(res.data)
      } catch {
        setRepo(null)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [repoId])

  // let a child (the overview tab) push an edit back up without a refetch
  const onRepoChange = useCallback((updated) => setRepo(updated), [])

  if (loading) return <RepoSkeleton />

  if (!repo) {
    return (
      <div className="p-6 text-center pt-20">
        <h1 className="font-display text-2xl text-fg">Repository not found</h1>
        <Link to="/repositories" className="inline-block mt-4 text-sm text-accent hover:underline">
          Back to repositories
        </Link>
      </div>
    )
  }

  return (
    <div>
      <header className="bg-surface border-b border-border">
        <div className="max-w-5xl mx-auto px-6 pt-6">
          <div className="flex flex-wrap items-center gap-2">
            <Link to={`/profile/${repo.owner}`} className="text-sm text-muted hover:text-accent">
              @{repo.owner}
            </Link>
            <span className="text-muted">/</span>
            <h1 className="font-display text-xl font-semibold text-fg font-mono">{repo.name}</h1>
            {repo.organization && (
              <Link
                to={`/organizations/${repo.organization.id}`}
                className="text-[11px] bg-accent-soft text-accent rounded px-1.5 py-0.5 hover:underline"
              >
                {repo.organization.name}
              </Link>
            )}
          </div>

          {repo.description && (
            <p className="text-sm text-muted mt-1.5">{repo.description}</p>
          )}

          <nav className="flex gap-1 mt-4 -mb-px overflow-x-auto">
            {TABS.map((tab) => (
              <NavLink
                key={tab.label}
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  `whitespace-nowrap text-sm px-4 py-2.5 border-b-2 transition-colors ${
                    isActive
                      ? 'border-accent text-fg font-medium'
                      : 'border-transparent text-muted hover:text-fg'
                  }`
                }
              >
                {tab.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <Outlet context={{ repo, canManage: canManage && !checking, onRepoChange }} />
    </div>
  )
}

function RepoSkeleton() {
  return (
    <div>
      <div className="bg-surface border-b border-border">
        <div className="max-w-5xl mx-auto px-6 pt-6 animate-pulse">
          <div className="h-6 w-64 bg-subtle rounded" />
          <div className="h-4 w-96 bg-subtle rounded mt-2" />
          <div className="h-10 w-full bg-subtle rounded mt-4" />
        </div>
      </div>
      <div className="p-6">
        <div className="max-w-5xl mx-auto animate-pulse space-y-2">
          <div className="h-16 bg-surface border border-border rounded-lg" />
          <div className="h-16 bg-surface border border-border rounded-lg" />
        </div>
      </div>
    </div>
  )
}

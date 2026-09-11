import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function Home() {
  const { user } = useAuth()

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-2xl text-fg">
          Welcome back, {user?.full_name || user?.username}
        </h1>
        <p className="text-sm text-muted mt-1">Your dashboard is coming up next.</p>

        <div className="mt-6 flex gap-3">
          <Link to="/repositories" className="bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-md px-4 py-2">
            Your repositories
          </Link>
          <Link to="/activity" className="border border-border bg-surface hover:bg-subtle text-fg text-sm font-medium rounded-md px-4 py-2">
            Activity feed
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Home

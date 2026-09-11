import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getProfile, followUser, unfollowUser } from '../api/profile'
import { listRepositories } from '../../repositories/api/repositories'
import { listOrganizations } from '../../organizations/api/organisations'
import { useAuth } from '../../../hooks/useAuth'

function toList(res) {
  const data = res?.data
  if (Array.isArray(data)) return data
  return data?.results ?? []
}

function Profile() {
  const { username } = useParams()
  const { user: currentUser } = useAuth()

  const [profileData, setProfileData] = useState(null)
  const [repos, setRepos] = useState([])
  const [orgs, setOrgs] = useState([])
  const [loading, setLoading] = useState(true)
  const [followLoading, setFollowLoading] = useState(false)
  const [tab, setTab] = useState('repositories')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const [profileRes, reposRes, orgsRes] = await Promise.allSettled([
        getProfile(username),
        listRepositories({ owner: username }),
        listOrganizations({ user: username }),
      ])

      setProfileData(profileRes.status === 'fulfilled' ? profileRes.value.data : null)
      if (reposRes.status === 'fulfilled') setRepos(toList(reposRes.value))
      if (orgsRes.status === 'fulfilled') setOrgs(toList(orgsRes.value))
      setLoading(false)
    }

    load()
  }, [username])

  const handleFollowToggle = async () => {
    setFollowLoading(true)
    const wasFollowing = profileData.is_following

    // optimistic: flip straight away, roll back if the request fails
    setProfileData((prev) => ({
      ...prev,
      is_following: !wasFollowing,
      followers_count: prev.followers_count + (wasFollowing ? -1 : 1),
    }))

    try {
      if (wasFollowing) await unfollowUser(username)
      else await followUser(username)
    } catch {
      setProfileData((prev) => ({
        ...prev,
        is_following: wasFollowing,
        followers_count: prev.followers_count + (wasFollowing ? 1 : -1),
      }))
    } finally {
      setFollowLoading(false)
    }
  }

  if (loading) return <ProfileSkeleton />

  if (!profileData) {
    return (
      <div className="p-6 text-center pt-20">
        <h1 className="font-display text-2xl text-fg">User not found</h1>
        <p className="text-sm text-muted mt-2">No account exists for @{username}.</p>
      </div>
    )
  }

  const isOwnProfile = currentUser?.username === username
  const initial = (profileData.full_name || profileData.username || '?').charAt(0).toUpperCase()

  const tabs = [
    { key: 'repositories', label: 'Repositories', count: repos.length },
    { key: 'organizations', label: 'Organizations', count: orgs.length },
  ]

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto grid lg:grid-cols-3 gap-6">

        {/* left: identity */}
        <aside className="lg:col-span-1">
          <div className="bg-surface border border-border rounded-xl p-6">
            {profileData.avatar ? (
              <img
                src={profileData.avatar}
                alt=""
                className="w-20 h-20 rounded-full object-cover mb-4"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-accent-soft text-accent font-display text-2xl font-semibold flex items-center justify-center mb-4">
                {initial}
              </div>
            )}

            <h1 className="font-display text-xl font-semibold text-fg">
              {profileData.full_name || profileData.username}
            </h1>
            <p className="text-sm text-muted">@{profileData.username}</p>

            {profileData.bio && (
              <p className="text-sm text-fg mt-3 leading-relaxed">{profileData.bio}</p>
            )}

            <div className="flex gap-4 text-sm text-muted mt-4 pt-4 border-t border-border">
              <Link to={`/profile/${username}/followers`} className="hover:text-fg transition-colors">
                <span className="text-fg font-semibold">{profileData.followers_count ?? 0}</span> followers
              </Link>
              <Link to={`/profile/${username}/following`} className="hover:text-fg transition-colors">
                <span className="text-fg font-semibold">{profileData.following_count ?? 0}</span> following
              </Link>
            </div>

            <div className="mt-4">
              {isOwnProfile ? (
                <div className="space-y-2">
                  <Link
                    to="/edit-profile"
                    className="block text-center border border-border bg-surface hover:bg-subtle text-fg text-sm font-medium rounded-md py-2 transition-colors"
                  >
                    Edit profile
                  </Link>
                  <Link
                    to="/change-password"
                    className="block text-center text-xs text-muted hover:text-fg transition-colors"
                  >
                    Change password
                  </Link>
                </div>
              ) : (
                <button
                  onClick={handleFollowToggle}
                  disabled={followLoading}
                  className={`w-full text-sm font-medium rounded-md py-2.5 transition-colors disabled:opacity-50 ${
                    profileData.is_following
                      ? 'border border-border bg-surface hover:bg-subtle text-fg'
                      : 'bg-accent hover:bg-accent-hover text-white'
                  }`}
                >
                  {profileData.is_following ? 'Unfollow' : 'Follow'}
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* right: their work */}
        <div className="lg:col-span-2">
          <div className="flex gap-1 border-b border-border mb-4">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`text-sm px-4 py-2.5 -mb-px border-b-2 transition-colors ${
                  tab === t.key
                    ? 'border-accent text-fg font-medium'
                    : 'border-transparent text-muted hover:text-fg'
                }`}
              >
                {t.label}
                <span className="ml-2 text-xs bg-subtle text-muted rounded-full px-2 py-0.5">
                  {t.count}
                </span>
              </button>
            ))}
          </div>

          {tab === 'repositories' && (
            repos.length === 0 ? (
              <Empty
                text={isOwnProfile ? 'You have no repositories yet.' : `@${username} has no repositories yet.`}
                linkTo={isOwnProfile ? '/repositories/new' : null}
                linkLabel="Create one"
              />
            ) : (
              <div className="space-y-2">
                {repos.map((repo) => (
                  <Link
                    key={repo.id}
                    to={`/repositories/${repo.id}`}
                    className="block bg-surface border border-border rounded-lg px-4 py-3 hover:border-accent transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-fg font-mono truncate">{repo.name}</p>
                      {repo.organization && (
                        <span className="shrink-0 text-[11px] bg-accent-soft text-accent rounded px-1.5 py-0.5">
                          {repo.organization.name}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted mt-1">
                      {repo.description || 'No description'}
                    </p>
                  </Link>
                ))}
              </div>
            )
          )}

          {tab === 'organizations' && (
            orgs.length === 0 ? (
              <Empty
                text={
                  isOwnProfile
                    ? 'You are not part of any organization yet.'
                    : `@${username} is not part of any organization.`
                }
              />
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {orgs.map((org) => (
                  <Link
                    key={org.id}
                    to={`/organizations/${org.id}`}
                    className="bg-surface border border-border rounded-lg px-4 py-3 hover:border-accent transition-colors"
                  >
                    <p className="text-sm font-medium text-fg truncate">{org.name}</p>
                    <p className="text-xs text-muted mt-1 truncate">
                      {org.description || 'No description'}
                    </p>
                  </Link>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}

function Empty({ text, linkTo, linkLabel }) {
  return (
    <div className="bg-surface border border-border rounded-lg px-4 py-12 text-center">
      <p className="text-sm text-muted">{text}</p>
      {linkTo && (
        <Link to={linkTo} className="inline-block mt-2 text-sm text-accent hover:underline">
          {linkLabel}
        </Link>
      )}
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto grid lg:grid-cols-3 gap-6 animate-pulse">
        <div className="lg:col-span-1 h-80 bg-surface border border-border rounded-xl" />
        <div className="lg:col-span-2 space-y-2">
          <div className="h-10 bg-subtle rounded mb-4" />
          <div className="h-20 bg-surface border border-border rounded-lg" />
          <div className="h-20 bg-surface border border-border rounded-lg" />
          <div className="h-20 bg-surface border border-border rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export default Profile

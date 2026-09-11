import React, { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useDebounce } from '../../../hooks/useDebounce'

const TABS = [
  { value: '', label: 'All' },
  { value: 'repository', label: 'Repositories' },
  { value: 'issue', label: 'Issues' },
  { value: 'user', label: 'Users' },
  { value: 'wiki', label: 'Wiki' },
]


export default function SearchPage() {

  const [searchParams,setSearchParams]=useSearchParams()
  const q=searchParams.get('q') || ''
  const activeType = searchParams.get('type') || ''

  const [ inputValue,setInputValue]=useState(q)
  const [results,setResults]=useState(null)
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState('')

  const debouncedInput = useDebounce(inputValue,300)
  
  useEffect(() => {
    if (debouncedInput === q) return
    const params = debouncedInput.trim() ? { q: debouncedInput } : {}
    if (debouncedInput.trim() && activeType) params.type = activeType
    setSearchParams(params, { replace: true })
  }, [debouncedInput])

  useEffect(() => {
    if (!q.trim()) {
      setResults(null)
      return
    }

    let cancelled = false
    const runSearch = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await search(q, activeType || undefined)
        if (!cancelled) setResults(res.data)
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.error || 'Search failed.')
          setResults(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    runSearch()

    return () => { cancelled = true }
  }, [q, activeType])

  const handleTabClick = (type) => {
    const params = { q }
    if (type) params.type = type
    setSearchParams(params)
  }

  const nonEmptyCategories = results
    ? Object.entries(results).filter(([, items]) => items.length > 0)
    : []


 
  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-2xl text-fg mb-4">Search</h1>

        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Search repositories, issues, users, wiki…"
          className="w-full bg-subtle border border-border rounded-md px-3 py-2.5 text-fg text-sm outline-none focus:border-accent mb-4"
        />

        <div className="flex gap-2 mb-6 border-b border-border">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTabClick(tab.value)}
              className={`text-sm px-3 py-2 border-b-2 transition-colors ${
                activeType === tab.value
                  ? 'border-accent text-fg'
                  : 'border-transparent text-muted hover:text-fg'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 px-3 py-2 rounded-md bg-danger-bg border border-danger-border text-danger text-sm">
            {error}
          </div>
        )}

        {loading && <p className="text-sm text-muted">Searching…</p>}

        {!loading && !q.trim() && (
          <p className="text-sm text-muted">Type something to search.</p>
        )}

        {!loading && q.trim() && nonEmptyCategories.length === 0 && !error && (
          <p className="text-sm text-muted">No results for "{q}".</p>
        )}

        {!loading && nonEmptyCategories.map(([categoryKey, items]) => (
          <div key={categoryKey} className="mb-6">
            <p className="font-mono text-xs text-muted mb-2 uppercase tracking-wide">
              {CATEGORY_LABELS[categoryKey]} ({items.length})
            </p>
            <div className="space-y-2">
              {items.map((item, index) => (
                <Link
                  key={`${categoryKey}-${index}`}
                  to={getResultLink(categoryKey, item)}
                  className="block bg-surface border border-border rounded-md px-4 py-3 hover:border-accent transition-colors"
                >
                  <p className="text-sm text-fg font-medium">{getResultTitle(categoryKey, item)}</p>
                  <p className="text-xs text-muted mt-1">{getResultSubtitle(categoryKey, item)}</p>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

}

import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
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
    <div className="min-h-screen bg-[#0B0F1A] p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-2xl text-[#E4E7F2] mb-4">Search</h1>

        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Search repositories, issues, users, wiki…"
          className="w-full bg-[#0F1424] border border-[#242B45] rounded-md px-3 py-2.5 text-[#E4E7F2] text-sm outline-none focus:border-[#7C6FF5] mb-4"
        />

        <div className="flex gap-2 mb-6 border-b border-[#242B45]">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTabClick(tab.value)}
              className={`text-sm px-3 py-2 border-b-2 transition-colors ${
                activeType === tab.value
                  ? 'border-[#7C6FF5] text-[#E4E7F2]'
                  : 'border-transparent text-[#8B90A8] hover:text-[#E4E7F2]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 px-3 py-2 rounded-md bg-[#3A1B23] border border-[#5C2430] text-[#F4A9B5] text-sm">
            {error}
          </div>
        )}

        {loading && <p className="text-sm text-[#8B90A8]">Searching…</p>}

        {!loading && !q.trim() && (
          <p className="text-sm text-[#8B90A8]">Type something to search.</p>
        )}

        {!loading && q.trim() && nonEmptyCategories.length === 0 && !error && (
          <p className="text-sm text-[#8B90A8]">No results for "{q}".</p>
        )}

        {!loading && nonEmptyCategories.map(([categoryKey, items]) => (
          <div key={categoryKey} className="mb-6">
            <p className="font-mono text-xs text-[#8B90A8] mb-2 uppercase tracking-wide">
              {CATEGORY_LABELS[categoryKey]} ({items.length})
            </p>
            <div className="space-y-2">
              {items.map((item, index) => (
                <Link
                  key={`${categoryKey}-${index}`}
                  to={getResultLink(categoryKey, item)}
                  className="block bg-[#12162A] border border-[#242B45] rounded-md px-4 py-3 hover:border-[#7C6FF5] transition-colors"
                >
                  <p className="text-sm text-[#E4E7F2] font-medium">{getResultTitle(categoryKey, item)}</p>
                  <p className="text-xs text-[#8B90A8] mt-1">{getResultSubtitle(categoryKey, item)}</p>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

}

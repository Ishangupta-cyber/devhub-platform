import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDebounce } from '../../../hooks/useDebounce'
import { search } from '../api/search'
import {
  CATEGORY_LABELS,
  getResultLink,
  getResultTitle,
  getResultSubtitle,
} from '../utils/searchHelpers'

export default function SearchBox() {

  const [open ,setOpen]=useState(false)
  const [query,setQuery]=useState('')
  const [loading,setLoading]=useState(false)
  const containerRef=useRef(null)
  const navigate=useNavigate()
  const [results,setResults]=useState(null)

  const debouncedQuery=useDebounce(query,300)

  useEffect(()=>{

    if (!debouncedQuery.trim())
    {
      setResults(null)
      return
    }

  let cancelled = false

  const runSearch=async()=>{
      setLoading(true)
      try {
         const res = await search(debouncedQuery)
        if (!cancelled) setResults(res.data)
      } catch (err) {
        if (!cancelled) {
          console.error('Search failed:', err)
          setResults(null)
        }
      }
      finally{
        if (!cancelled) setLoading(false)
      }
    }
    runSearch()

    return ()=>{cancelled=true}

  },[debouncedQuery])


  useEffect(()=>{
    if (!open ) return 
    const handleClickOutside=(e)=>{
    if (containerRef.current && !containerRef.current.contains(e.target)) {setOpen(false)}}
    document.addEventListener("mousedown",handleClickOutside)
    return ()=> document.removeEventListener("mousedown",handleClickOutside)
  },[open])

  const handleSelect = () => {
    setOpen(false)
    setQuery('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!query.trim()) return
    navigate(`/search?q=${encodeURIComponent(query)}`)
    handleSelect()
  }

  const nonEmptyCategories = results ? Object.entries(results).filter(([, items]) => items.length > 0) : []

  return (
    <div className="relative" ref={containerRef}>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder="Search…"
          className="w-56 bg-subtle border border-border rounded-md px-3 py-1.5 text-fg text-sm outline-none focus:border-accent transition-colors"
        />
      </form>

      {open && query.trim() && (
        <div className="absolute right-0 mt-2 w-96 bg-surface border border-border rounded-md shadow-2xl z-50 max-h-96 overflow-y-auto">
          {loading && <p className="text-xs text-muted px-4 py-3">Searching…</p>}

          {!loading && nonEmptyCategories.length === 0 && results && (
            <p className="text-sm text-muted px-4 py-4 text-center">No results found.</p>
          )}

          {!loading && nonEmptyCategories.map(([categoryKey, items]) => (
            <div key={categoryKey} className="border-b border-border last:border-b-0">
              <p className="font-mono text-[10px] text-muted px-4 pt-3 pb-1 uppercase tracking-wide">
                {CATEGORY_LABELS[categoryKey]}
              </p>
              {items.slice(0, 3).map((item, index) => (
                <Link
                  key={`${categoryKey}-${index}`}
                  to={getResultLink(categoryKey, item)}
                  onClick={handleSelect}
                  className="block px-4 py-2 hover:bg-subtle transition-colors"
                >
                  <p className="text-sm text-fg">{getResultTitle(categoryKey, item)}</p>
                  <p className="text-xs text-muted truncate">{getResultSubtitle(categoryKey, item)}</p>
                </Link>
              ))}
            </div>
          ))}

          {!loading && nonEmptyCategories.length > 0 && (
            <button
              onClick={handleSubmit}
              className="w-full text-center text-xs text-accent hover:underline px-4 py-3 border-t border-border"
            >
              See all results
            </button>
          )}
        </div>
      )}
    </div>
  )
}

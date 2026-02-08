import { useState, useRef } from 'react'
import type { SearchProvider, SearchResult, SearchResultHandler } from './types'

type UseSpotlightSearchOptions = {
  providers: SearchProvider[]
  onSelect: SearchResultHandler
  onClose: () => void
}

export function useSpotlightSearch({ providers, onSelect, onClose }: UseSpotlightSearchOptions) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  // Whether the last selection change came from keyboard (controls auto-scroll)
  const selectionSource = useRef<'keyboard' | 'mouse'>('keyboard')

  const results = query.trim()
    ? mergeResults(providers, query)
    : []

  const handleQueryChange = (value: string) => {
    setQuery(value)
    setSelectedIndex(0)
    selectionSource.current = 'keyboard'
  }

  /**
   * Must be called directly from the <input> onKeyDown.
   * Receives the native React KeyboardEvent so preventDefault works synchronously.
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const len = results.length

    switch (e.key) {
      case 'Tab':
      case 'ArrowDown':
        e.preventDefault()
        e.stopPropagation()
        if (len === 0) break
        selectionSource.current = 'keyboard'
        if (e.key === 'Tab' && e.shiftKey) {
          setSelectedIndex((prev) => (prev - 1 + len) % len)
        } else {
          setSelectedIndex((prev) => (prev + 1) % len)
        }
        break
      case 'ArrowUp':
        e.preventDefault()
        e.stopPropagation()
        if (len === 0) break
        selectionSource.current = 'keyboard'
        setSelectedIndex((prev) => (prev - 1 + len) % len)
        break
      case 'Enter':
        e.preventDefault()
        if (len > 0) {
          onSelect(results[selectedIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        onClose()
        break
    }
  }

  const setSelectedFromMouse = (index: number) => {
    selectionSource.current = 'mouse'
    setSelectedIndex(index)
  }

  return {
    query,
    setQuery: handleQueryChange,
    results,
    selectedIndex,
    setSelectedFromMouse,
    selectionSource,
    handleKeyDown,
  }
}

function mergeResults(providers: SearchProvider[], query: string): SearchResult[] {
  const all: SearchResult[] = []
  for (const provider of providers) {
    all.push(...provider.search(query))
  }
  all.sort((a, b) => b.score - a.score)
  return all.slice(0, 50)
}

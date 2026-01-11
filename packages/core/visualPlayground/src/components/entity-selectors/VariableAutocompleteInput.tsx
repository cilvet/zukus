import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import type { VariableAutocompleteInputProps } from './types'

function formatVariableValue(value: unknown): string {
  if (Array.isArray(value)) {
    if (value.length > 2) {
      return `[${value.slice(0, 2).join(', ')}, ...]`
    }
    return `[${value.join(', ')}]`
  }
  if (typeof value === 'string') {
    if (value.length > 15) {
      return `"${value.slice(0, 12)}..."`
    }
    return `"${value}"`
  }
  return String(value)
}

export function VariableAutocompleteInput({ 
  value, 
  onChange, 
  variables, 
  entityVariables = {},
  placeholder, 
  className,
  showHelperText = true,
}: VariableAutocompleteInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [cursorPosition, setCursorPosition] = useState(0)
  const [atPosition, setAtPosition] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const allVariables: Record<string, unknown> = {
    ...entityVariables,
    ...variables,
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (newValue: string) => {
    onChange(newValue)
    
    const input = inputRef.current
    if (!input) return
    
    const cursor = input.selectionStart || 0
    setCursorPosition(cursor)

    const textBeforeCursor = newValue.slice(0, cursor)
    const lastAtIndex = textBeforeCursor.lastIndexOf('@')
    
    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1)
      const hasSpaceAfterAt = textAfterAt.includes(' ')
      
      if (!hasSpaceAfterAt) {
        setAtPosition(lastAtIndex)
        setShowSuggestions(true)
        return
      }
    }
    
    setShowSuggestions(false)
    setAtPosition(null)
  }

  const insertVariable = (variableName: string) => {
    if (atPosition === null) return
    
    const beforeAt = value.slice(0, atPosition)
    const afterCursor = value.slice(cursorPosition)
    const newValue = `${beforeAt}@${variableName}${afterCursor}`
    
    onChange(newValue)
    setShowSuggestions(false)
    setAtPosition(null)
    
    setTimeout(() => {
      if (inputRef.current) {
        const newCursorPos = atPosition + variableName.length + 1
        inputRef.current.setSelectionRange(newCursorPos, newCursorPos)
        inputRef.current.focus()
      }
    }, 0)
  }

  const getFilteredVariables = (): Array<{ name: string; value: unknown; isEntity: boolean }> => {
    if (atPosition === null) return []
    
    const searchTerm = value.slice(atPosition + 1, cursorPosition).toLowerCase()
    
    const results: Array<{ name: string; value: unknown; isEntity: boolean }> = []
    
    Object.entries(entityVariables).forEach(([name, val]) => {
      if (name.toLowerCase().includes(searchTerm)) {
        results.push({ name, value: val, isEntity: true })
      }
    })
    
    Object.entries(variables).forEach(([name, val]) => {
      if (name.toLowerCase().includes(searchTerm)) {
        results.push({ name, value: val, isEntity: false })
      }
    })
    
    return results
  }

  const filteredVariables = getFilteredVariables()
  const hasAnyVariables = Object.keys(allVariables).length > 0

  return (
    <div ref={containerRef} className="relative">
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setShowSuggestions(false)
          }
        }}
        placeholder={placeholder}
        className={className}
      />
      
      {showSuggestions && filteredVariables.length > 0 && (
        <div className="absolute z-50 w-full mt-1 border rounded-md bg-popover shadow-lg">
          <div className="p-1 max-h-48 overflow-auto">
            {filteredVariables.map(({ name, value: varValue, isEntity }) => (
              <button
                key={name}
                onClick={() => insertVariable(name)}
                className="w-full flex items-center justify-between gap-2 p-2 rounded hover:bg-muted text-left transition-colors"
              >
                <span className="text-sm font-mono flex items-center gap-1">
                  {isEntity && <span className="text-primary/60">⬡</span>}
                  @{name}
                </span>
                <Badge 
                  variant="outline" 
                  className={`text-xs truncate max-w-[100px] ${isEntity ? 'border-primary/30' : ''}`}
                >
                  {formatVariableValue(varValue)}
                </Badge>
              </button>
            ))}
          </div>
        </div>
      )}

      {showHelperText && hasAnyVariables && (
        <p className="text-xs text-muted-foreground mt-1 min-h-[20px]">
          {!showSuggestions && (
            <>
              Escribe <code className="bg-muted px-1 rounded">@</code> para usar variables
            </>
          )}
        </p>
      )}
    </div>
  )
}


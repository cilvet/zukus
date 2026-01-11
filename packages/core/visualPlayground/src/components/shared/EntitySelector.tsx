import { useState, useRef, useEffect } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, Check } from 'lucide-react'
import type { EntityOption } from '@/data/testEntities'

// Re-export for convenience
export type { EntityOption } from '@/data/testEntities'

export type EntitySelectorProps = {
  /** Currently selected entity IDs */
  selectedIds: string[]
  /** Callback when selection changes */
  onChange: (ids: string[]) => void
  /** All available entities to select from */
  entities: EntityOption[]
  /** Filter by entity type (optional) */
  entityType?: string
  /** Allow multiple selections (default: true) */
  multiple?: boolean
  /** Placeholder text */
  placeholder?: string
  /** Max height of the dropdown list */
  maxHeight?: number
}

// =============================================================================
// EntitySelector Component
// =============================================================================

export function EntitySelector({
  selectedIds,
  onChange,
  entities,
  entityType,
  multiple = true,
  placeholder = 'Buscar entidades...',
  maxHeight = 320,
}: EntitySelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const filteredEntities = entities.filter(entity => {
    const matchesType = !entityType || entity.entityType === entityType
    const matchesSearch = !searchQuery || entity.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesType && matchesSearch
  })

  const selectedEntities = entities.filter(e => selectedIds.includes(e.id))

  const virtualizer = useVirtualizer({
    count: filteredEntities.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 56,
    overscan: 5,
  })

  const toggleEntity = (entityId: string) => {
    if (multiple) {
      if (selectedIds.includes(entityId)) {
        onChange(selectedIds.filter(id => id !== entityId))
      } else {
        onChange([...selectedIds, entityId])
      }
    } else {
      onChange([entityId])
      setIsOpen(false)
    }
  }

  const removeEntity = (entityId: string) => {
    onChange(selectedIds.filter(id => id !== entityId))
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Selected Entities Display */}
      <div
        className="min-h-[42px] flex flex-wrap gap-1 p-2 border rounded-md bg-background cursor-pointer hover:border-primary/50 transition-colors"
        onClick={() => setIsOpen(true)}
      >
        {selectedEntities.length === 0 && (
          <span className="text-sm text-muted-foreground py-1">
            {placeholder}
          </span>
        )}
        {selectedEntities.map(entity => (
          <Badge key={entity.id} variant="secondary" className="gap-1">
            {entity.name}
            <button
              onClick={(e) => {
                e.stopPropagation()
                removeEntity(entity.id)
              }}
              className="ml-1 hover:text-destructive transition-colors"
            >
              ×
            </button>
          </Badge>
        ))}
        <div className="ml-auto flex items-center">
          <Search className="h-3 w-3 text-muted-foreground" />
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 border rounded-md bg-popover shadow-lg">
          <div className="p-2 border-b">
            <Input
              autoFocus
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8"
            />
          </div>

          {filteredEntities.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground text-center">
              No se encontraron entidades
            </div>
          ) : (
            <>
              <div className="px-2 py-1 text-xs text-muted-foreground border-b bg-muted/30">
                {filteredEntities.length.toLocaleString()} resultado{filteredEntities.length !== 1 ? 's' : ''}
              </div>
              <div
                ref={scrollRef}
                className="overflow-auto"
                style={{ maxHeight }}
              >
                <div
                  style={{
                    height: `${virtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                  }}
                >
                  {virtualizer.getVirtualItems().map((virtualItem) => {
                    const entity = filteredEntities[virtualItem.index]
                    const isSelected = selectedIds.includes(entity.id)

                    return (
                      <div
                        key={virtualItem.key}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: `${virtualItem.size}px`,
                          transform: `translateY(${virtualItem.start}px)`,
                        }}
                      >
                        <button
                          onClick={() => toggleEntity(entity.id)}
                          className="w-full h-full flex items-center gap-2 px-3 py-2 hover:bg-muted text-left transition-colors cursor-pointer"
                        >
                          <div className={`
                            flex-shrink-0 w-4 h-4 border rounded flex items-center justify-center
                            ${isSelected ? 'bg-primary border-primary' : 'border-input'}
                          `}>
                            {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm truncate">{entity.name}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {entity.entityType} · {entity.id}
                            </p>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            {entity.category && (
                              <Badge variant="outline" className="text-xs">{entity.category}</Badge>
                            )}
                            {entity.level !== undefined && (
                              <Badge variant="outline" className="text-xs">Lvl {entity.level}</Badge>
                            )}
                            {entity.school && (
                              <Badge variant="outline" className="text-xs">{entity.school}</Badge>
                            )}
                          </div>
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default EntitySelector


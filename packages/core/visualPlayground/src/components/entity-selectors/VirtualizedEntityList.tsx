import { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import type { VirtualizedEntityListProps } from './types'

export function VirtualizedEntityList({
  entities,
  selectedIds,
  maxSelections,
  onSelect,
  searchQuery,
  onSearchChange,
  maxHeight = 320,
}: VirtualizedEntityListProps) {
  const parentRef = useRef<HTMLDivElement>(null)

  const getFilteredEntities = () => {
    if (!searchQuery.trim()) return entities
    const query = searchQuery.toLowerCase()
    return entities.filter(e => e.entity.name.toLowerCase().includes(query))
  }
  
  const filteredEntities = getFilteredEntities()

  const virtualizer = useVirtualizer({
    count: filteredEntities.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56,
    overscan: 10,
  })

  const showSearch = entities.length > 20

  return (
    <div className="space-y-2">
      {showSearch && (
        <Input
          placeholder="Buscar por nombre..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-8"
        />
      )}
      
      <div className="text-xs text-muted-foreground">
        {filteredEntities.length} resultados
        {searchQuery && ` (de ${entities.length} total)`}
      </div>

      <div
        ref={parentRef}
        className="overflow-auto border rounded-md"
        style={{ height: `${maxHeight}px` }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const filterResult = filteredEntities[virtualItem.index]
            const entity = filterResult.entity
            const isEligible = filterResult.matches
            const isSelected = selectedIds.includes(entity.id)
            const canSelect = isEligible && (isSelected || selectedIds.length < maxSelections)
            const isMaxReached = selectedIds.length >= maxSelections && !isSelected

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
                <div
                  onClick={() => {
                    if (canSelect) {
                      onSelect(entity.id, !isSelected)
                    }
                  }}
                  className={`
                    flex items-center gap-3 p-2 h-full border-b transition-colors
                    ${isSelected ? 'bg-primary/10 cursor-pointer' : ''}
                    ${!isEligible ? 'opacity-50 cursor-not-allowed' : ''}
                    ${isMaxReached ? 'opacity-40 cursor-not-allowed' : ''}
                    ${canSelect && !isSelected ? 'hover:bg-muted/50 cursor-pointer' : ''}
                  `}
                >
                  <div onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={isSelected}
                      disabled={!canSelect}
                      onCheckedChange={(checked: boolean) => onSelect(entity.id, checked === true)}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate ${!isEligible ? 'line-through' : ''}`}>
                      {entity.name}
                    </p>
                    {entity.description && (
                      <p className="text-xs text-muted-foreground truncate">
                        {entity.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {!isEligible && (
                      <Badge variant="outline" className="text-xs">No elegible</Badge>
                    )}
                    {'level' in entity && entity.level !== undefined && (
                      <Badge variant="outline" className="text-xs">Lvl {entity.level}</Badge>
                    )}
                    {'school' in entity && entity.school && (
                      <Badge variant="outline" className="text-xs">{entity.school}</Badge>
                    )}
                    {'category' in entity && entity.category && (
                      <Badge variant="outline" className="text-xs">{entity.category}</Badge>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}


import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { resolveProvider } from '@root/core/domain/levels/providers/resolveProvider'
import { applySelection, removeSelection, validateSelector } from '@root/core/domain/levels/selection'
import type { SelectorValidationResult } from '@root/core/domain/levels/selection'
import { testEntities, getEntityById } from '@/data/testEntities'
import { VirtualizedEntityList } from './VirtualizedEntityList'
import type { SelectorPreviewProps } from './types'
import type { EntityProvider } from '@root/core/domain/levels/providers/types'
import type { SubstitutionIndex } from '@root/core/domain/character/calculation/sources/calculateSources'

// =============================================================================
// Types
// =============================================================================

type NestedEntity = {
  id: string
  name: string
  entityType?: string
  providers?: EntityProvider[]
  [key: string]: unknown
}

type NestedProviderProps = {
  provider: EntityProvider
  variables: SubstitutionIndex
  depth: number
  onProviderChange: (updated: EntityProvider) => void
}

// =============================================================================
// Recursive Nested Provider Component
// =============================================================================

function NestedProviderRenderer({ provider, variables, depth, onProviderChange }: NestedProviderProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [nestedSearchQueries, setNestedSearchQueries] = useState<Record<string, string>>({})
  const [selectionWarnings, setSelectionWarnings] = useState<string[]>([])

  const result = resolveProvider(provider, testEntities, getEntityById, variables)

  // Use saved granted entities if they exist, otherwise use resolved from compendium
  const grantedEntities: NestedEntity[] = (
    provider.entities?.granted || result.granted?.entities || []
  ) as NestedEntity[]

  const currentSelector = provider.selector
  const selectedEntities: NestedEntity[] = (provider.entities?.selected || []) as NestedEntity[]
  const selectedIds = selectedEntities.map(e => e.id)

  const validationResult: SelectorValidationResult | null = currentSelector
    ? validateSelector(provider, testEntities, variables)
    : null

  // Handle selection at this level
  const handleSelect = (entityId: string, checked: boolean) => {
    if (!currentSelector) return

    const entity = getEntityById(entityId)
    if (!entity) return

    if (checked) {
      const applyResult = applySelection(provider, entity, testEntities, variables)

      if (applyResult.errors.length > 0) {
        setSelectionWarnings(applyResult.errors)
        return
      }

      onProviderChange(applyResult.provider)
      setSelectionWarnings(applyResult.warnings)
    } else {
      const updatedProvider = removeSelection(provider, entityId)
      onProviderChange(updatedProvider)
      setSelectionWarnings([])
    }
  }

  // Handle selection changes in nested providers (within granted or selected entities)
  const handleNestedProviderChange = (
    entitySource: 'granted' | 'selected',
    entityId: string,
    providerIndex: number,
    updatedNestedProvider: EntityProvider
  ) => {
    const sourceEntities = entitySource === 'granted' ? grantedEntities : selectedEntities

    // Update the entity with the new provider
    const updatedEntities = sourceEntities.map(entity => {
      if (entity.id !== entityId) return entity

      const updatedProviders = (entity.providers || []).map((p, idx) =>
        idx === providerIndex ? updatedNestedProvider : p
      )

      return { ...entity, providers: updatedProviders }
    })

    // Build updated provider
    const updatedProvider: EntityProvider = {
      ...provider,
      entities: {
        granted: entitySource === 'granted'
          ? updatedEntities
          : (provider.entities?.granted || []),
        selected: entitySource === 'selected'
          ? updatedEntities
          : (provider.entities?.selected || []),
      },
    }

    onProviderChange(updatedProvider)
  }

  // Depth-based styling
  const depthColors = [
    'bg-primary/10',
    'bg-blue-500/10',
    'bg-purple-500/10',
    'bg-green-500/10',
    'bg-orange-500/10',
  ]
  const bgColor = depthColors[depth % depthColors.length]

  const depthBorderColors = [
    'border-primary/30',
    'border-blue-500/30',
    'border-purple-500/30',
    'border-green-500/30',
    'border-orange-500/30',
  ]
  const borderColor = depthBorderColors[depth % depthBorderColors.length]

  // Render entities (granted or selected) with their nested providers
  const renderEntityWithProviders = (
    entity: NestedEntity,
    source: 'granted' | 'selected'
  ) => {
    const hasProviders = entity.providers && entity.providers.length > 0
    const sourceLabel = source === 'granted' ? '✓' : '◉'
    const sourceBadgeVariant = source === 'granted' ? 'secondary' : 'default'

    return (
      <div key={entity.id} className="space-y-2">
        <div className={`flex items-center gap-3 p-2 ${bgColor} rounded-md`}>
          <Badge variant={sourceBadgeVariant}>{sourceLabel}</Badge>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-sm truncate">{entity.name}</p>
            {hasProviders && (
              <p className="text-xs text-muted-foreground">
                ↳ {entity.providers!.length} provider(s) interno(s) [Nivel {depth + 1}]
              </p>
            )}
          </div>
        </div>

        {hasProviders && (
          <div className={`ml-4 pl-3 border-l-2 ${borderColor} space-y-3`}>
            {entity.providers!.map((nestedProvider, providerIdx) => (
              <NestedProviderRenderer
                key={`${entity.id}-provider-${providerIdx}`}
                provider={nestedProvider}
                variables={variables}
                depth={depth + 1}
                onProviderChange={(updated) => {
                  handleNestedProviderChange(source, entity.id, providerIdx, updated)
                }}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`rounded-lg p-3 space-y-3 ${depth > 0 ? 'bg-muted/20' : ''}`}>
      {depth > 0 && (
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="text-xs">
            Nivel {depth}
          </Badge>
        </div>
      )}

      {/* Granted entities */}
      {grantedEntities.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2 text-muted-foreground">
            Otorgados ({grantedEntities.length}):
          </p>
          <div className="space-y-3">
            {grantedEntities.map((entity) => renderEntityWithProviders(entity, 'granted'))}
          </div>
        </div>
      )}

      {/* Selector section */}
      {result.selector && currentSelector && (
        <div>
          {grantedEntities.length > 0 && <Separator className="my-3" />}

          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">
              {currentSelector.name}
            </p>
            <span className="text-xs text-muted-foreground">
              {selectedIds.length} / {currentSelector.max}
              {currentSelector.min > 0 && ` (mín: ${currentSelector.min})`}
            </span>
          </div>

          <VirtualizedEntityList
            entities={result.selector.eligibleEntities}
            selectedIds={selectedIds}
            maxSelections={currentSelector.max}
            onSelect={handleSelect}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            maxHeight={depth > 0 ? 150 : 250}
          />

          {selectionWarnings.length > 0 && (
            <div className="mt-2 p-2 bg-amber-500/10 border border-amber-500/30 rounded text-sm">
              {selectionWarnings.map((w, i) => (
                <p key={i} className="text-amber-600">⚠ {w}</p>
              ))}
            </div>
          )}

          <div className="mt-2 pt-2 border-t space-y-1">
            {validationResult?.valid ? (
              <p className="text-xs text-green-600">✓ Selección válida</p>
            ) : (
              <>
                {validationResult?.errors.map((err, i) => (
                  <p key={i} className="text-xs text-red-600">❌ {err}</p>
                ))}
              </>
            )}
            {validationResult?.warnings.map((w, i) => (
              <p key={`warn-${i}`} className="text-xs text-amber-600">⚠ {w}</p>
            ))}
          </div>
        </div>
      )}

      {/* Selected entities with their nested providers */}
      {selectedEntities.length > 0 && (
        <div>
          <Separator className="my-3" />
          <p className="text-sm font-medium mb-2 text-muted-foreground">
            Seleccionados ({selectedEntities.length}):
          </p>
          <div className="space-y-3">
            {selectedEntities.map((entity) => renderEntityWithProviders(entity, 'selected'))}
          </div>
        </div>
      )}

      {result.warnings.length > 0 && (
        <div className="text-xs text-red-600">
          {result.warnings.map((w, i) => (
            <p key={i}>❌ {w.message}</p>
          ))}
        </div>
      )}
    </div>
  )
}

// =============================================================================
// Main Component (Entry Point)
// =============================================================================

export function SelectorPreview({ provider, variables, onProviderChange }: SelectorPreviewProps) {
  const [internalProvider, setInternalProvider] = useState<EntityProvider>(provider)

  // Sync with external provider changes
  useEffect(() => {
    setInternalProvider(provider)
  }, [provider])

  const handleProviderChange = (updated: EntityProvider) => {
    setInternalProvider(updated)
    if (onProviderChange) {
      onProviderChange(updated)
    }
  }

  return (
    <NestedProviderRenderer
      provider={internalProvider}
      variables={variables}
      depth={0}
      onProviderChange={handleProviderChange}
    />
  )
}

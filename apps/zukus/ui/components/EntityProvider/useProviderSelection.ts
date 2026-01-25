/**
 * Hook for managing entity selection in an EntityProvider.
 *
 * Bridges UI components with the core selection functions.
 */

import { useMemo, useCallback } from 'react'
import {
  resolveProvider,
  selectEntityInProvider,
  deselectEntityFromProvider,
  getSelectedEntityInstances,
  getProvider,
} from '@zukus/core'
import type {
  EntityProvider,
  Selector,
  StandardEntity,
  FilterResult,
  EntityInstance,
  ProviderLocation,
  CharacterBaseData,
  FilterSubstitutionIndex,
} from '@zukus/core'
import { useCompendiumContext } from './CompendiumContext'
import type { ValidationResult } from './types'

export type UseProviderSelectionProps = {
  provider: EntityProvider
  providerLocation: ProviderLocation
  character: CharacterBaseData
  onCharacterChange: (character: CharacterBaseData) => void
  variables?: FilterSubstitutionIndex
}

export type UseProviderSelectionReturn = {
  // Resolved entities
  grantedEntities: StandardEntity[]
  selectedEntities: EntityInstance[]
  eligibleEntities: FilterResult<StandardEntity>[]

  // Actions
  selectEntity: (entityId: string) => void
  deselectEntity: (instanceId: string) => void

  // Selector state
  selector: Selector | undefined
  selectionCount: number
  minSelections: number
  maxSelections: number
  canSelectMore: boolean

  // Validation
  validation: ValidationResult
}

export function useProviderSelection({
  provider,
  providerLocation,
  character,
  onCharacterChange,
  variables = {},
}: UseProviderSelectionProps): UseProviderSelectionReturn {
  const compendiumContext = useCompendiumContext()

  // Extract entity type from selector
  const entityType = provider.selector?.entityType

  // Fetch all entities outside of useMemo
  const allEntities = entityType
    ? compendiumContext.getAllEntities(entityType)
    : []

  // Create a stable reference to the getEntity function for use in useMemo
  // We create a lookup map to avoid calling getEntity inside useMemo
  const entityMap = useMemo(() => {
    const map = new Map<string, StandardEntity>()
    for (const entity of allEntities) {
      map.set(entity.id, entity)
    }
    return map
  }, [allEntities])

  // Resolve provider to get granted and eligible entities
  const resolution = useMemo(() => {
    const getEntityById = (id: string): StandardEntity | undefined => {
      return entityMap.get(id)
    }

    return resolveProvider(provider, allEntities, getEntityById, variables)
  }, [provider, allEntities, entityMap, variables])

  // Get granted entities
  const grantedEntities = useMemo(() => {
    return resolution.granted?.entities || []
  }, [resolution.granted])

  // Get eligible entities (for selector)
  const eligibleEntities = useMemo(() => {
    return resolution.selector?.eligibleEntities || []
  }, [resolution.selector])

  // Get selected entity instances from character pool
  const selectedEntities = useMemo(() => {
    return getSelectedEntityInstances(character, providerLocation)
  }, [character, providerLocation])

  // Selector info
  const selector = provider.selector
  const selectionCount = selectedEntities.length
  const minSelections = selector?.min || 0
  const maxSelections = selector?.max || 0
  const canSelectMore = selectionCount < maxSelections

  // Validation
  const validation = useMemo((): ValidationResult => {
    const errors: string[] = []
    const warnings: string[] = []

    if (selector) {
      if (selectionCount < minSelections) {
        errors.push(`Debes seleccionar al menos ${minSelections} opcion(es)`)
      }
    }

    // Add resolution warnings
    if (resolution.warnings.length > 0) {
      warnings.push(...resolution.warnings.map((w) => w.message))
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }, [selector, selectionCount, minSelections, resolution.warnings])

  // Select entity action
  const selectEntity = useCallback(
    (entityId: string) => {
      if (!selector) return

      // Get entity from the pre-built map
      const entity = entityMap.get(entityId)
      if (!entity) {
        console.warn(`Entity not found: ${entityId}`)
        return
      }

      const result = selectEntityInProvider(
        character,
        providerLocation,
        entity,
        selector.id
      )

      if (result.errors.length > 0) {
        console.error('Selection errors:', result.errors)
        return
      }

      onCharacterChange(result.character)
    },
    [selector, character, providerLocation, entityMap, onCharacterChange]
  )

  // Deselect entity action
  const deselectEntity = useCallback(
    (instanceId: string) => {
      const result = deselectEntityFromProvider(
        character,
        providerLocation,
        instanceId
      )

      if (result.errors.length > 0) {
        console.error('Deselection errors:', result.errors)
        return
      }

      onCharacterChange(result.character)
    },
    [character, providerLocation, onCharacterChange]
  )

  return {
    grantedEntities,
    selectedEntities,
    eligibleEntities,
    selectEntity,
    deselectEntity,
    selector,
    selectionCount,
    minSelections,
    maxSelections,
    canSelectMore,
    validation,
  }
}

/**
 * CompendiumContext - Provides access to compendium entities
 *
 * This context allows components to access entities from the active compendium
 * without needing to import the compendium directly.
 */

import { createContext, useContext } from 'react'
import { dnd35ExampleCompendium } from '@zukus/core'
import type { StandardEntity } from '@zukus/core'
import type { CompendiumContextValue } from './types'

const defaultCompendiumContext: CompendiumContextValue = {
  compendium: dnd35ExampleCompendium,
  getEntity: (entityType: string, entityId: string): StandardEntity | undefined => {
    const entities = dnd35ExampleCompendium.entities[entityType] || []
    return entities.find((e) => e.id === entityId)
  },
  getEntityById: (entityId: string): StandardEntity | undefined => {
    for (const entityType of Object.keys(dnd35ExampleCompendium.entities)) {
      const entities = dnd35ExampleCompendium.entities[entityType] || []
      const found = entities.find((e) => e.id === entityId)
      if (found) {
        return found
      }
    }
    return undefined
  },
  getAllEntities: (entityType: string): StandardEntity[] => {
    return dnd35ExampleCompendium.entities[entityType] || []
  },
  getAllEntitiesFromAllTypes: (): StandardEntity[] => {
    const all: StandardEntity[] = []
    for (const entityType of Object.keys(dnd35ExampleCompendium.entities)) {
      const entities = dnd35ExampleCompendium.entities[entityType] || []
      all.push(...entities)
    }
    return all
  },
}

const CompendiumContext = createContext<CompendiumContextValue>(defaultCompendiumContext)

export function useCompendiumContext(): CompendiumContextValue {
  return useContext(CompendiumContext)
}

export { CompendiumContext, defaultCompendiumContext }

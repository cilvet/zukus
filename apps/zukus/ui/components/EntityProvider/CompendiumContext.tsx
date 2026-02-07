/**
 * CompendiumContext - Provides access to compendium entities
 *
 * This context allows components to access entities from the active compendium
 * without needing to import the compendium directly.
 */

import { createContext, useContext, useEffect, useMemo } from 'react'
import {
  dnd35ExampleCompendium,
  embedTranslations,
  embedTranslationsInEntities,
} from '@zukus/core'
import type { StandardEntity } from '@zukus/core'
import type { CompendiumContextValue } from './types'
import { useTranslationStore } from '../../stores/translationStore'
import { useDevModeStore } from '../../stores/devModeStore'
import { getDeviceLocale } from '../../hooks/useLocale'

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

/**
 * Provider that wraps CompendiumContext with automatic localization.
 * All entities returned through this context are automatically localized
 * based on the active locale and translation packs.
 *
 * On mount, initializes the translation store with the saved locale
 * (or device locale as fallback).
 */
export function LocalizedCompendiumProvider({ children }: { children: React.ReactNode }) {
  const initialize = useTranslationStore((s) => s.initialize)
  const activePack = useTranslationStore(
    (state) => state.getActivePackForCompendium(dnd35ExampleCompendium.id)
  )

  const initDevMode = useDevModeStore((s) => s.initialize)

  useEffect(() => {
    initialize(getDeviceLocale())
    initDevMode()
  }, [initialize, initDevMode])

  const embeddedContext = useMemo<CompendiumContextValue>(() => {
    const embed = (entity: StandardEntity): StandardEntity =>
      activePack ? embedTranslations(entity, activePack) : entity

    return {
      compendium: dnd35ExampleCompendium,
      getEntity: (entityType: string, entityId: string): StandardEntity | undefined => {
        const entities = dnd35ExampleCompendium.entities[entityType] || []
        const entity = entities.find((e) => e.id === entityId)
        if (!entity) return undefined
        return embed(entity)
      },
      getEntityById: (entityId: string): StandardEntity | undefined => {
        for (const entityType of Object.keys(dnd35ExampleCompendium.entities)) {
          const entities = dnd35ExampleCompendium.entities[entityType] || []
          const found = entities.find((e) => e.id === entityId)
          if (found) return embed(found)
        }
        return undefined
      },
      getAllEntities: (entityType: string): StandardEntity[] => {
        const entities = dnd35ExampleCompendium.entities[entityType] || []
        return activePack ? embedTranslationsInEntities(entities, activePack) : entities
      },
      getAllEntitiesFromAllTypes: (): StandardEntity[] => {
        const all: StandardEntity[] = []
        for (const entityType of Object.keys(dnd35ExampleCompendium.entities)) {
          const entities = dnd35ExampleCompendium.entities[entityType] || []
          if (activePack) {
            all.push(...embedTranslationsInEntities(entities, activePack))
          } else {
            all.push(...entities)
          }
        }
        return all
      },
    }
  }, [activePack])

  return (
    <CompendiumContext.Provider value={embeddedContext}>
      {children}
    </CompendiumContext.Provider>
  )
}

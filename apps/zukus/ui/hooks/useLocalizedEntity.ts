import {
  getLocalizedEntity,
  getLocalizedEntityWithResult,
  getLocalizedEntities,
  type StandardEntity,
  type LocalizationContext,
  type LocalizationResult,
} from '@zukus/core'
import { useActiveLocale, useTranslationStore } from '../stores/translationStore'

/**
 * Returns a localized entity for display.
 *
 * - With compendiumId: uses pack + embedded translations (compendium entities)
 * - Without compendiumId: uses only embedded translations (character entities)
 */
export function useLocalizedEntity<T extends StandardEntity>(
  entity: T,
  compendiumId?: string,
  compendiumLocale: string = 'en',
): T {
  const locale = useActiveLocale()
  const activePack = useTranslationStore(
    (state) => compendiumId ? state.getActivePackForCompendium(compendiumId) : undefined
  )

  const context: LocalizationContext = {
    locale,
    activePack,
    compendiumLocale,
  }
  return getLocalizedEntity(entity, context)
}

/**
 * Localizes an array of entities. Useful for FlashList/map patterns
 * where you can't call hooks per-item.
 */
export function useLocalizedEntities<T extends StandardEntity>(
  entities: T[],
  compendiumId?: string,
  compendiumLocale: string = 'en',
): T[] {
  const locale = useActiveLocale()
  const activePack = useTranslationStore(
    (state) => compendiumId ? state.getActivePackForCompendium(compendiumId) : undefined
  )

  const context: LocalizationContext = {
    locale,
    activePack,
    compendiumLocale,
  }
  return getLocalizedEntities(entities, context)
}

export function useLocalizedEntityWithResult<T extends StandardEntity>(
  entity: T,
  compendiumId?: string,
  compendiumLocale: string = 'en',
  translatableFields?: string[],
): LocalizationResult<T> {
  const locale = useActiveLocale()
  const activePack = useTranslationStore(
    (state) => compendiumId ? state.getActivePackForCompendium(compendiumId) : undefined
  )

  const context: LocalizationContext = {
    locale,
    activePack,
    compendiumLocale,
  }
  return getLocalizedEntityWithResult(entity, context, translatableFields)
}

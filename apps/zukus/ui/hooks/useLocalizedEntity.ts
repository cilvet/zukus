import {
  getLocalizedEntity,
  getLocalizedEntityWithResult,
  getLocalizedEntities,
  type StandardEntity,
  type LocalizationContext,
  type LocalizationResult,
} from '@zukus/core'
import { useActiveLocale, useTranslationStore } from '../stores/translationStore'
import { useCompendiumContext } from '../components/EntityProvider/CompendiumContext'

/**
 * Returns a localized entity for display.
 *
 * Automatically uses the active compendium's translation pack.
 * If compendiumId is not provided, it's resolved from CompendiumContext.
 */
export function useLocalizedEntity<T extends StandardEntity>(
  entity: T,
  compendiumId?: string,
  compendiumLocale: string = 'en',
): T {
  const { compendium } = useCompendiumContext()
  const effectiveCompendiumId = compendiumId ?? compendium.id
  const locale = useActiveLocale()
  const activePack = useTranslationStore(
    (state) => state.getActivePackForCompendium(effectiveCompendiumId)
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
  const { compendium } = useCompendiumContext()
  const effectiveCompendiumId = compendiumId ?? compendium.id
  const locale = useActiveLocale()
  const activePack = useTranslationStore(
    (state) => state.getActivePackForCompendium(effectiveCompendiumId)
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
  const { compendium } = useCompendiumContext()
  const effectiveCompendiumId = compendiumId ?? compendium.id
  const locale = useActiveLocale()
  const activePack = useTranslationStore(
    (state) => state.getActivePackForCompendium(effectiveCompendiumId)
  )

  const context: LocalizationContext = {
    locale,
    activePack,
    compendiumLocale,
  }
  return getLocalizedEntityWithResult(entity, context, translatableFields)
}

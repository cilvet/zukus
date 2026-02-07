/**
 * Pure functions for localizing entities using translation packs.
 */

import type { StandardEntity } from '../entities/types/base';
import type {
  TranslatedFields,
  LocalizationContext,
  LocalizationResult,
} from './types';

/**
 * Merges translated fields onto an entity (shallow copy).
 * Only overwrites fields that exist on the entity and whose translation is non-empty.
 */
export function mergeTranslation<T extends StandardEntity>(
  entity: T,
  translation: TranslatedFields,
): T {
  const merged: Record<string, unknown> = { ...entity };
  for (const [key, value] of Object.entries(translation)) {
    if (value === undefined || value === '') continue;
    if (!(key in entity)) continue;
    merged[key] = value;
  }
  return merged as T;
}

/**
 * Returns a localized entity using the following fallback chain:
 * 1. If locale === compendiumLocale -> return entity as-is (short-circuit)
 * 2. Active TranslationPack -> merge
 * 3. Embedded translations (entity.translations?.[locale]) -> merge
 * 4. Return original
 */
export function getLocalizedEntity<T extends StandardEntity>(
  entity: T,
  context: LocalizationContext,
): T {
  // Short-circuit: requested locale matches compendium base locale
  if (context.locale === context.compendiumLocale) {
    return entity;
  }

  // Try active pack
  if (context.activePack) {
    const translation = context.activePack.translations[entity.id];
    if (translation) {
      return mergeTranslation(entity, translation);
    }
  }

  // Try embedded translations
  const entityWithTranslations = entity as T & { translations?: Record<string, TranslatedFields> };
  if (entityWithTranslations.translations?.[context.locale]) {
    return mergeTranslation(entity, entityWithTranslations.translations[context.locale]);
  }

  // No translation available — return original
  return entity;
}

/**
 * Like getLocalizedEntity but returns a LocalizationResult with metadata
 * about which fields were translated and which are missing.
 */
export function getLocalizedEntityWithResult<T extends StandardEntity>(
  entity: T,
  context: LocalizationContext,
  translatableFields?: string[],
): LocalizationResult<T> {
  // Short-circuit
  if (context.locale === context.compendiumLocale) {
    return {
      entity,
      appliedLocale: context.compendiumLocale,
      source: 'original',
      translatedFields: [],
      missingFields: [],
    };
  }

  // Default translatable fields: name + description
  const fieldsToCheck = translatableFields ?? ['name', 'description'];

  // Try active pack
  if (context.activePack) {
    const translation = context.activePack.translations[entity.id];
    if (translation) {
      const localized = mergeTranslation(entity, translation);
      const translated = fieldsToCheck.filter(
        (f) => translation[f] !== undefined && translation[f] !== '',
      );
      const missing = fieldsToCheck.filter(
        (f) => translation[f] === undefined || translation[f] === '',
      );
      return {
        entity: localized,
        appliedLocale: context.locale,
        source: 'pack',
        translatedFields: translated,
        missingFields: missing,
      };
    }
  }

  // Try embedded
  const entityWithTranslations = entity as T & { translations?: Record<string, TranslatedFields> };
  if (entityWithTranslations.translations?.[context.locale]) {
    const embedded = entityWithTranslations.translations[context.locale];
    const localized = mergeTranslation(entity, embedded);
    const translated = fieldsToCheck.filter(
      (f) => embedded[f] !== undefined && embedded[f] !== '',
    );
    const missing = fieldsToCheck.filter(
      (f) => embedded[f] === undefined || embedded[f] === '',
    );
    return {
      entity: localized,
      appliedLocale: context.locale,
      source: 'embedded',
      translatedFields: translated,
      missingFields: missing,
    };
  }

  // No translation
  return {
    entity,
    appliedLocale: context.compendiumLocale,
    source: 'original',
    translatedFields: [],
    missingFields: fieldsToCheck,
  };
}

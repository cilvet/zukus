/**
 * Batch localization for entity arrays.
 */

import type { StandardEntity } from '../entities/types/base';
import type { LocalizationContext } from './types';
import { getLocalizedEntity } from './getLocalizedEntity';

/**
 * Localizes an array of entities.
 * Returns the original reference when no translation is needed (zero allocation).
 */
export function getLocalizedEntities<T extends StandardEntity>(
  entities: T[],
  context: LocalizationContext,
): T[] {
  // Short-circuit: if locale matches compendium, return original array reference
  if (context.locale === context.compendiumLocale) {
    return entities;
  }

  return entities.map((entity) => getLocalizedEntity(entity, context));
}

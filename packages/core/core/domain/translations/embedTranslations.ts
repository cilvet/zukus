/**
 * Functions for embedding translations directly into entities.
 *
 * This allows entities to carry their translations with them,
 * making them self-contained and independent of external context.
 */

import type { StandardEntity } from '../entities/types/base';
import type { TranslatedFields, TranslationPack } from './types';

/**
 * Embeds translations from a pack into a single entity.
 * The entity keeps its original fields (e.g. English name) and gains
 * a `translations` map with the pack's locale data.
 *
 * If the entity already has translations for other locales, they are preserved.
 * If translations already exist for this locale, the pack's values are merged in.
 */
export function embedTranslations<T extends StandardEntity>(
  entity: T,
  pack: TranslationPack,
): T {
  const translation = pack.translations[entity.id];
  if (!translation) return entity;

  const existing = (entity as T & { translations?: Record<string, TranslatedFields> }).translations;

  return {
    ...entity,
    translations: {
      ...existing,
      [pack.locale]: {
        ...(existing?.[pack.locale]),
        ...translation,
      },
    },
  };
}

/**
 * Embeds translations from a pack into an array of entities.
 * Returns original array reference when pack has no translations (zero allocation).
 */
export function embedTranslationsInEntities<T extends StandardEntity>(
  entities: T[],
  pack: TranslationPack,
): T[] {
  return entities.map((entity) => embedTranslations(entity, pack));
}

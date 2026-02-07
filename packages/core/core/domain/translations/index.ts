/**
 * Translation system - types and pure functions for entity localization.
 */

export type {
  TranslatedFields,
  TranslationPack,
  TranslationPackReference,
  LocalizationContext,
  LocalizationResult,
} from './types';

export {
  mergeTranslation,
  getLocalizedEntity,
  getLocalizedEntityWithResult,
} from './getLocalizedEntity';

export { getLocalizedEntities } from './getLocalizedEntities';

export {
  embedTranslations,
  embedTranslationsInEntities,
} from './embedTranslations';

export {
  isVersionCompatible,
  validateTranslationPack,
  type ValidationResult as TranslationValidationResult,
} from './validation';

export { dnd35FeatsSpanishPack } from './packs/dnd35-feats-es';

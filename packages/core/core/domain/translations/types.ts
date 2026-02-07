/**
 * Translation system types.
 *
 * Supports Translation Packs that localize compendium entities
 * without modifying the base compendium data.
 */

/** Translated field values for a single entity */
export type TranslatedFields = Record<string, string | undefined>;

/**
 * A translation pack localizes entities from a target compendium.
 */
export type TranslationPack = {
  /** Unique pack identifier */
  id: string;

  /** Display name */
  name?: string;

  /** Compendium this pack translates */
  targetCompendiumId: string;

  /** Semver range of compatible compendium versions (e.g. '^1.0.0') */
  targetVersionRange: string;

  /** Target locale (e.g. 'es', 'fr') */
  locale: string;

  /** Origin of the pack */
  source: 'official' | 'community';

  /** Pack version (semver) */
  version: string;

  /** Author info */
  author?: string;

  /** Entity translations keyed by entity ID */
  translations: Record<string, TranslatedFields>;
};

/**
 * Lightweight reference to a translation pack (for listings).
 */
export type TranslationPackReference = {
  id: string;
  name?: string;
  targetCompendiumId: string;
  locale: string;
  source: 'official' | 'community';
  version: string;
  author?: string;
};

/**
 * Context needed by localization pure functions.
 */
export type LocalizationContext = {
  /** Desired locale */
  locale: string;

  /** Active translation pack for this compendium (if any) */
  activePack?: TranslationPack;

  /** Base locale of the compendium (default 'en') */
  compendiumLocale: string;
};

/**
 * Result of localizing an entity, with metadata about what was translated.
 */
export type LocalizationResult<T> = {
  /** The localized entity */
  entity: T;

  /** Locale that was actually applied */
  appliedLocale: string;

  /** Where the translation came from */
  source: 'pack' | 'embedded' | 'original';

  /** Fields that were successfully translated */
  translatedFields: string[];

  /** Translatable fields that are missing from the translation */
  missingFields: string[];
};

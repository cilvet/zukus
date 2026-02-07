import { describe, it, expect } from 'bun:test';
import {
  mergeTranslation,
  getLocalizedEntity,
  getLocalizedEntityWithResult,
} from '../getLocalizedEntity';
import { getLocalizedEntities } from '../getLocalizedEntities';
import type { LocalizationContext, TranslationPack } from '../types';
import type { StandardEntity } from '../../entities/types/base';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockEntity: StandardEntity = {
  id: 'feat-1',
  entityType: 'feat',
  name: 'Power Attack',
  description: 'Trade accuracy for power.',
  category: 'Combat',
  benefit: 'Subtract from attack, add to damage.',
} as StandardEntity;

const spanishPack: TranslationPack = {
  id: 'srd-es',
  name: 'SRD Spanish',
  targetCompendiumId: 'srd-3.5',
  targetVersionRange: '^1.0.0',
  locale: 'es',
  source: 'official',
  version: '1.0.0',
  translations: {
    'feat-1': {
      name: 'Ataque Poderoso',
      description: 'Sacrifica precisión por poder.',
      category: 'Combate',
      benefit: 'Resta al ataque, suma al daño.',
    },
  },
};

const baseContext: LocalizationContext = {
  locale: 'es',
  compendiumLocale: 'en',
  activePack: spanishPack,
};

// ---------------------------------------------------------------------------
// mergeTranslation
// ---------------------------------------------------------------------------

describe('mergeTranslation', () => {
  it('applies translated fields onto the entity', () => {
    const result = mergeTranslation(mockEntity, {
      name: 'Ataque Poderoso',
      description: 'Sacrifica precisión por poder.',
    });
    expect(result.name).toBe('Ataque Poderoso');
    expect(result.description).toBe('Sacrifica precisión por poder.');
    // untranslated field stays the same
    expect((result as Record<string, unknown>).benefit).toBe(
      'Subtract from attack, add to damage.',
    );
  });
});

// ---------------------------------------------------------------------------
// getLocalizedEntity
// ---------------------------------------------------------------------------

describe('getLocalizedEntity', () => {
  it('returns original when locale === compendiumLocale', () => {
    const ctx: LocalizationContext = {
      locale: 'en',
      compendiumLocale: 'en',
      activePack: spanishPack,
    };
    const result = getLocalizedEntity(mockEntity, ctx);
    // Exact same reference — no allocation
    expect(result).toBe(mockEntity);
  });

  it('applies full translation from pack', () => {
    const result = getLocalizedEntity(mockEntity, baseContext);
    expect(result.name).toBe('Ataque Poderoso');
    expect(result.description).toBe('Sacrifica precisión por poder.');
    expect((result as Record<string, unknown>).category).toBe('Combate');
    expect((result as Record<string, unknown>).benefit).toBe(
      'Resta al ataque, suma al daño.',
    );
  });

  it('applies partial translation (missing fields keep original)', () => {
    const partialPack: TranslationPack = {
      ...spanishPack,
      translations: {
        'feat-1': { name: 'Ataque Poderoso' },
      },
    };
    const ctx: LocalizationContext = {
      locale: 'es',
      compendiumLocale: 'en',
      activePack: partialPack,
    };
    const result = getLocalizedEntity(mockEntity, ctx);
    expect(result.name).toBe('Ataque Poderoso');
    // Untranslated fields keep original values
    expect(result.description).toBe('Trade accuracy for power.');
    expect((result as Record<string, unknown>).benefit).toBe(
      'Subtract from attack, add to damage.',
    );
  });

  it('falls back to embedded translations when no pack', () => {
    const entityWithEmbedded = {
      ...mockEntity,
      translations: {
        es: { name: 'Poder Embebido', description: 'Desc embebida.' },
      },
    } as StandardEntity;

    const ctx: LocalizationContext = {
      locale: 'es',
      compendiumLocale: 'en',
    };
    const result = getLocalizedEntity(entityWithEmbedded, ctx);
    expect(result.name).toBe('Poder Embebido');
    expect(result.description).toBe('Desc embebida.');
  });

  it('pack takes priority over embedded translations', () => {
    const entityWithEmbedded = {
      ...mockEntity,
      translations: {
        es: { name: 'Embebido', description: 'Desc embebida.' },
      },
    } as StandardEntity;

    const result = getLocalizedEntity(entityWithEmbedded, baseContext);
    // Pack translation wins
    expect(result.name).toBe('Ataque Poderoso');
  });

  it('returns original when no translation available', () => {
    const ctx: LocalizationContext = {
      locale: 'fr',
      compendiumLocale: 'en',
      // no pack, entity has no French embedded translations
    };
    const result = getLocalizedEntity(mockEntity, ctx);
    expect(result).toBe(mockEntity);
  });

  it('does not apply fields that do not exist on the entity', () => {
    const packWithExtra: TranslationPack = {
      ...spanishPack,
      translations: {
        'feat-1': {
          name: 'Ataque Poderoso',
          nonExistentField: 'valor fantasma',
        },
      },
    };
    const ctx: LocalizationContext = {
      locale: 'es',
      compendiumLocale: 'en',
      activePack: packWithExtra,
    };
    const result = getLocalizedEntity(mockEntity, ctx);
    expect(result.name).toBe('Ataque Poderoso');
    expect((result as Record<string, unknown>).nonExistentField).toBeUndefined();
  });

  it('empty strings do not overwrite original values', () => {
    const packWithEmpty: TranslationPack = {
      ...spanishPack,
      translations: {
        'feat-1': { name: '', description: 'Traducido.' },
      },
    };
    const ctx: LocalizationContext = {
      locale: 'es',
      compendiumLocale: 'en',
      activePack: packWithEmpty,
    };
    const result = getLocalizedEntity(mockEntity, ctx);
    // Empty string is skipped — original preserved
    expect(result.name).toBe('Power Attack');
    expect(result.description).toBe('Traducido.');
  });
});

// ---------------------------------------------------------------------------
// getLocalizedEntityWithResult
// ---------------------------------------------------------------------------

describe('getLocalizedEntityWithResult', () => {
  it('reports missingFields correctly', () => {
    const partialPack: TranslationPack = {
      ...spanishPack,
      translations: {
        'feat-1': { name: 'Ataque Poderoso' },
      },
    };
    const ctx: LocalizationContext = {
      locale: 'es',
      compendiumLocale: 'en',
      activePack: partialPack,
    };
    const result = getLocalizedEntityWithResult(mockEntity, ctx, [
      'name',
      'description',
      'benefit',
    ]);
    expect(result.source).toBe('pack');
    expect(result.translatedFields).toEqual(['name']);
    expect(result.missingFields).toEqual(['description', 'benefit']);
    expect(result.entity.name).toBe('Ataque Poderoso');
  });
});

// ---------------------------------------------------------------------------
// getLocalizedEntities (batch)
// ---------------------------------------------------------------------------

describe('getLocalizedEntities', () => {
  it('returns original array reference when no translation needed', () => {
    const entities = [mockEntity];
    const ctx: LocalizationContext = {
      locale: 'en',
      compendiumLocale: 'en',
    };
    const result = getLocalizedEntities(entities, ctx);
    // Exact same array reference — zero allocation
    expect(result).toBe(entities);
  });
});

import { describe, it, expect } from 'bun:test';
import { embedTranslations, embedTranslationsInEntities } from '../embedTranslations';
import type { TranslationPack } from '../types';
import type { StandardEntity } from '../../entities/types/base';

const mockEntity: StandardEntity = {
  id: 'feat-1',
  entityType: 'feat',
  name: 'Power Attack',
  description: 'Trade accuracy for power.',
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
    },
  },
};

describe('embedTranslations', () => {
  it('embeds pack translations into entity.translations', () => {
    const result = embedTranslations(mockEntity, spanishPack);
    expect(result.name).toBe('Power Attack');
    expect(result.description).toBe('Trade accuracy for power.');
    const translations = (result as Record<string, unknown>).translations as Record<string, Record<string, string>>;
    expect(translations.es.name).toBe('Ataque Poderoso');
    expect(translations.es.description).toBe('Sacrifica precisión por poder.');
  });

  it('returns original entity when no translation exists in pack', () => {
    const other: StandardEntity = { id: 'feat-99', entityType: 'feat', name: 'Unknown' } as StandardEntity;
    const result = embedTranslations(other, spanishPack);
    expect(result).toBe(other);
  });

  it('preserves existing translations for other locales', () => {
    const entityWithFrench = {
      ...mockEntity,
      translations: { fr: { name: 'Attaque Puissante' } },
    } as StandardEntity;
    const result = embedTranslations(entityWithFrench, spanishPack);
    const translations = (result as Record<string, unknown>).translations as Record<string, Record<string, string>>;
    expect(translations.fr.name).toBe('Attaque Puissante');
    expect(translations.es.name).toBe('Ataque Poderoso');
  });

  it('merges into existing locale translations', () => {
    const entityWithPartialEs = {
      ...mockEntity,
      translations: { es: { benefit: 'Beneficio existente' } },
    } as StandardEntity;
    const result = embedTranslations(entityWithPartialEs, spanishPack);
    const translations = (result as Record<string, unknown>).translations as Record<string, Record<string, string | undefined>>;
    expect(translations.es.name).toBe('Ataque Poderoso');
    expect(translations.es.benefit).toBe('Beneficio existente');
  });
});

describe('embedTranslationsInEntities', () => {
  it('embeds translations into all entities in array', () => {
    const entity2: StandardEntity = { id: 'feat-2', entityType: 'feat', name: 'Cleave' } as StandardEntity;
    const pack: TranslationPack = {
      ...spanishPack,
      translations: {
        'feat-1': { name: 'Ataque Poderoso' },
        'feat-2': { name: 'Hendir' },
      },
    };
    const results = embedTranslationsInEntities([mockEntity, entity2], pack);
    expect(results).toHaveLength(2);
    const t0 = (results[0] as Record<string, unknown>).translations as Record<string, Record<string, string>>;
    const t1 = (results[1] as Record<string, unknown>).translations as Record<string, Record<string, string>>;
    expect(t0.es.name).toBe('Ataque Poderoso');
    expect(t1.es.name).toBe('Hendir');
  });
});

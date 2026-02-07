/**
 * Integration tests for feat translations.
 *
 * Verifies that the English feats + Spanish pack work together correctly.
 */

import { describe, it, expect } from 'bun:test';
import { allFeats } from '../../compendiums/examples/entities/feats';
import { dnd35FeatsSpanishPack } from '../packs/dnd35-feats-es';
import { getLocalizedEntity, getLocalizedEntityWithResult } from '../getLocalizedEntity';
import { validateTranslationPack } from '../validation';
import { isVersionCompatible } from '../validation';
import type { LocalizationContext } from '../types';

const COMPENDIUM_VERSION = '1.0.0';

const esContext: LocalizationContext = {
  locale: 'es',
  activePack: dnd35FeatsSpanishPack,
  compendiumLocale: 'en',
};

const enContext: LocalizationContext = {
  locale: 'en',
  compendiumLocale: 'en',
};

describe('feats translation integration', () => {
  it('feats are in English by default', () => {
    const powerAttack = allFeats.find((f) => f.id === 'feat-power-attack');
    expect(powerAttack).toBeDefined();
    expect(powerAttack!.name).toBe('Power Attack');
    expect((powerAttack as Record<string, unknown>).category).toBe('Combat');
  });

  it('Spanish pack localizes feats to Spanish', () => {
    const powerAttack = allFeats.find((f) => f.id === 'feat-power-attack')!;
    const localized = getLocalizedEntity(powerAttack, esContext);

    expect(localized.name).toBe('Ataque Poderoso');
    expect(localized.description).toBe(
      'Puedes sacrificar precisión por potencia en el combate cuerpo a cuerpo.',
    );
    expect((localized as Record<string, unknown>).category).toBe('Combate');
  });

  it('all feat IDs have translations in the pack', () => {
    const packIds = Object.keys(dnd35FeatsSpanishPack.translations);
    const featIds = allFeats.map((f) => f.id);

    for (const featId of featIds) {
      expect(packIds).toContain(featId);
    }
  });

  it('pack is compatible with compendium version', () => {
    expect(
      isVersionCompatible(dnd35FeatsSpanishPack.targetVersionRange, COMPENDIUM_VERSION),
    ).toBe(true);
  });

  it('pack passes validation', () => {
    const result = validateTranslationPack(dnd35FeatsSpanishPack);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('round-trip: requesting English returns original', () => {
    const powerAttack = allFeats.find((f) => f.id === 'feat-power-attack')!;
    const localized = getLocalizedEntity(powerAttack, enContext);

    // Should be the exact same reference (short-circuit)
    expect(localized).toBe(powerAttack);
    expect(localized.name).toBe('Power Attack');
  });

  it('partial translation degrades gracefully', () => {
    const dodge = allFeats.find((f) => f.id === 'feat-dodge')!;
    const partialPack = {
      ...dnd35FeatsSpanishPack,
      translations: {
        'feat-dodge': {
          name: 'Esquivar',
          // description, category, benefit missing
        },
      },
    };

    const partialContext: LocalizationContext = {
      locale: 'es',
      activePack: partialPack,
      compendiumLocale: 'en',
    };

    const result = getLocalizedEntityWithResult(dodge, partialContext, [
      'name',
      'description',
      'category',
      'benefit',
    ]);

    expect(result.entity.name).toBe('Esquivar');
    expect(result.entity.description).toBe(dodge.description); // kept original
    expect(result.source).toBe('pack');
    expect(result.translatedFields).toContain('name');
    expect(result.missingFields).toContain('description');
    expect(result.missingFields).toContain('category');
    expect(result.missingFields).toContain('benefit');
  });
});

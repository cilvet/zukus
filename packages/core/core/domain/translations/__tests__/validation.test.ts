import { describe, it, expect } from 'bun:test';
import { validateTranslationPack, isVersionCompatible } from '../validation';
import type { TranslationPack } from '../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const validPack: TranslationPack = {
  id: 'srd-es',
  name: 'SRD Spanish',
  targetCompendiumId: 'srd-3.5',
  targetVersionRange: '^1.0.0',
  locale: 'es',
  source: 'official',
  version: '1.0.0',
  translations: {
    'feat-1': { name: 'Ataque Poderoso' },
  },
};

// ---------------------------------------------------------------------------
// validateTranslationPack
// ---------------------------------------------------------------------------

describe('validateTranslationPack', () => {
  it('valid pack passes validation', () => {
    const result = validateTranslationPack(validPack);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it('pack without id fails', () => {
    const pack = { ...validPack, id: '' } as TranslationPack;
    const result = validateTranslationPack(pack);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Pack must have an id');
  });

  it('pack without locale fails', () => {
    const pack = { ...validPack, locale: '' } as TranslationPack;
    const result = validateTranslationPack(pack);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Pack must have a locale');
  });

  it('pack without version fails', () => {
    const pack = { ...validPack, version: '' } as TranslationPack;
    const result = validateTranslationPack(pack);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Pack must have a version');
  });

  it('pack with no translations generates warning but isValid=true', () => {
    const pack = { ...validPack, translations: {} } as TranslationPack;
    const result = validateTranslationPack(pack);
    expect(result.isValid).toBe(true);
    expect(result.warnings).toContain('Pack has no translations');
  });
});

// ---------------------------------------------------------------------------
// isVersionCompatible
// ---------------------------------------------------------------------------

describe('isVersionCompatible', () => {
  it('caret range compatible (^1.0.0 with 1.2.3)', () => {
    expect(isVersionCompatible('^1.0.0', '1.2.3')).toBe(true);
  });

  it('caret range incompatible (^1.0.0 with 2.0.0)', () => {
    expect(isVersionCompatible('^1.0.0', '2.0.0')).toBe(false);
  });

  it('caret range: minor below range is incompatible (^1.2.0 with 1.1.0)', () => {
    expect(isVersionCompatible('^1.2.0', '1.1.0')).toBe(false);
  });

  it('exact version match', () => {
    expect(isVersionCompatible('1.0.0', '1.0.0')).toBe(true);
  });

  it('exact version mismatch', () => {
    expect(isVersionCompatible('1.0.0', '1.0.1')).toBe(false);
  });
});

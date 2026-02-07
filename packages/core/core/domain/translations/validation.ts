/**
 * Translation pack validation utilities.
 */

import type { TranslationPack } from './types';

export type ValidationResult = {
  isValid: boolean;
  warnings: string[];
  errors: string[];
};

/**
 * Checks if a pack's version range is compatible with a compendium version.
 * Supports caret ranges (^1.0.0) and exact matches.
 */
export function isVersionCompatible(
  packVersionRange: string,
  compendiumVersion: string,
): boolean {
  const compParts = parseVersion(compendiumVersion);
  if (!compParts) return false;

  // Caret range: ^1.2.3 means >=1.2.3 <2.0.0
  if (packVersionRange.startsWith('^')) {
    const rangeParts = parseVersion(packVersionRange.slice(1));
    if (!rangeParts) return false;

    const [cMajor, cMinor, cPatch] = compParts;
    const [rMajor, rMinor, rPatch] = rangeParts;

    // Major must match
    if (cMajor !== rMajor) return false;

    // Must be >= the range's minor.patch
    if (cMinor > rMinor) return true;
    if (cMinor === rMinor && cPatch >= rPatch) return true;

    return false;
  }

  // Exact match
  return compendiumVersion === packVersionRange;
}

/**
 * Validates a translation pack structure.
 */
export function validateTranslationPack(pack: TranslationPack): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!pack.id) errors.push('Pack must have an id');
  if (!pack.locale) errors.push('Pack must have a locale');
  if (!pack.version) errors.push('Pack must have a version');
  if (!pack.targetCompendiumId) errors.push('Pack must have a targetCompendiumId');
  if (!pack.targetVersionRange) errors.push('Pack must have a targetVersionRange');

  if (!pack.translations || Object.keys(pack.translations).length === 0) {
    warnings.push('Pack has no translations');
  }

  return {
    isValid: errors.length === 0,
    warnings,
    errors,
  };
}

function parseVersion(version: string): [number, number, number] | null {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!match) return null;
  return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
}

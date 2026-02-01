/**
 * Pool Operations for CGE
 *
 * Utilities for working with POOL-type resources in CGE.
 */

import { substituteExpression } from '../formulae/formula';
import type { SubstitutionIndex } from '../character/calculation/sources/calculateSources';
import { DiceRollerImpl } from '../rolls/DiceRoller/diceRoller';

/**
 * Calculates the pool cost for using an entity based on the costPath formula.
 *
 * @param costPath - Formula like "@entity.level" or "@entity.powerPoints"
 * @param entity - The entity object with properties to substitute
 * @returns The calculated cost (minimum 1)
 *
 * @example
 * // With costPath = "@entity.level" and entity = { level: 3 }
 * calculatePoolCost("@entity.level", { level: 3 }) // Returns 3
 *
 * @example
 * // With costPath = "@entity.powerPoints" and entity = { powerPoints: 5, level: 2 }
 * calculatePoolCost("@entity.powerPoints", { powerPoints: 5, level: 2 }) // Returns 5
 */
export function calculatePoolCost(
  costPath: string | undefined,
  entity: Record<string, unknown>
): number {
  // Default to @entity.level if no costPath specified
  const path = costPath ?? '@entity.level';

  // Build substitution index from entity properties
  const substitutionIndex: SubstitutionIndex = {};

  for (const [key, value] of Object.entries(entity)) {
    if (typeof value === 'number') {
      substitutionIndex[`entity.${key}`] = value;
    } else if (typeof value === 'string') {
      const parsed = parseFloat(value);
      if (!isNaN(parsed)) {
        substitutionIndex[`entity.${key}`] = parsed;
      }
    }
  }

  // Substitute and evaluate
  const substituted = substituteExpression(path, substitutionIndex);

  // Evaluate the expression (handles simple math)
  const diceRoller = new DiceRollerImpl();
  try {
    const result = diceRoller.roll(substituted);
    return Math.max(1, Math.floor(result.result));
  } catch {
    // If evaluation fails, try parsing as a number directly
    const parsed = parseFloat(substituted);
    return isNaN(parsed) ? 1 : Math.max(1, Math.floor(parsed));
  }
}

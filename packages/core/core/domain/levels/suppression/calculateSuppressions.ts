/**
 * Calculate entity suppressions
 * 
 * Determines which entities are suppressed based on:
 * - Explicit ID lists (suppression.ids)
 * - Dynamic filters (suppression.filter)
 * 
 * Suppression is NOT transitive: if A suppresses B, and B would suppress C,
 * C is not suppressed because B is already suppressed.
 */

import { filterEntitiesWithVariables } from '../filtering/filterWithVariables';
import type { SubstitutionIndex } from '../filtering/types';
import type { Entity, SuppressingFields, SuppressionScope, SuppressionConfig } from '../../entities/types/base';
import type { SuppressionInfo, SuppressionResult } from './types';

/**
 * Options for calculating suppressions.
 */
export type CalculateSuppressionsOptions = {
  /** 
   * Which scope to calculate suppressions for.
   * - 'applied': Calculate suppressions affecting entities the character has
   * - 'selectable': Calculate suppressions affecting available entities
   */
  targetScope: 'applied' | 'selectable';
};

/**
 * Checks if a suppression config applies to the target scope.
 */
function configAppliesToScope(config: SuppressionConfig, targetScope: 'applied' | 'selectable'): boolean {
  if (config.scope === 'all') {
    return true;
  }
  return config.scope === targetScope;
}

/**
 * Calculates which entities are suppressed.
 * 
 * @param entities - All entities to check for suppression
 * @param variables - Variables for filter evaluation (e.g., { "character.level": 10 })
 * @param options - Options including which scope to calculate for
 * @returns Map of suppressed entity ID to suppression info
 * 
 * @example
 * ```typescript
 * const entities = [
 *   { id: 'trapfinding', entityType: 'rogueAbility' },
 *   { 
 *     id: 'archetype-acrobat', 
 *     entityType: 'archetype', 
 *     suppression: [{ 
 *       scope: 'applied', 
 *       ids: ['trapfinding'],
 *       reason: 'Replaced by Acrobat abilities'
 *     }] 
 *   },
 * ];
 * 
 * const result = calculateSuppressions(entities, {}, { targetScope: 'applied' });
 * // Map { 'trapfinding' => { suppressedById: 'archetype-acrobat', method: 'id', reason: 'Replaced by Acrobat abilities' } }
 * ```
 */
export function calculateSuppressions<T extends Entity & SuppressingFields>(
  entities: T[],
  variables: SubstitutionIndex,
  options: CalculateSuppressionsOptions
): SuppressionResult {
  const result: SuppressionResult = new Map();
  const { targetScope } = options;
  
  // Build a set of entity IDs for quick lookup
  const entityIds = new Set(entities.map(e => e.id));
  
  // Process each entity in order
  for (const entity of entities) {
    // Skip if this entity is already suppressed (non-transitive)
    if (result.has(entity.id)) {
      continue;
    }
    
    // Skip if entity has no suppression configs
    if (!entity.suppression || entity.suppression.length === 0) {
      continue;
    }
    
    // Process each suppression config
    for (const config of entity.suppression) {
      // Skip if this config doesn't apply to the target scope
      if (!configAppliesToScope(config, targetScope)) {
        continue;
      }
      
      // Apply ID-based suppression
      if (config.ids) {
        for (const targetId of config.ids) {
          // Skip self-suppression
          if (targetId === entity.id) {
            continue;
          }
          
          // Only suppress entities that exist and aren't already suppressed
          if (entityIds.has(targetId) && !result.has(targetId)) {
            result.set(targetId, {
              suppressedById: entity.id,
              method: 'id',
              reason: config.reason,
            });
          }
        }
      }
      
      // Apply filter-based suppression
      if (config.filter) {
        // Get entities that match the filter (always use strict behavior)
        const filterResults = filterEntitiesWithVariables(
          entities,
          [{ ...config.filter, filterPolicy: 'strict' }],
          variables
        );
        
        for (const filterResult of filterResults) {
          const targetId = filterResult.entity.id;
          
          // Skip self-suppression
          if (targetId === entity.id) {
            continue;
          }
          
          // Only suppress if not already suppressed (ID takes precedence, first config wins)
          if (!result.has(targetId)) {
            result.set(targetId, {
              suppressedById: entity.id,
              method: 'filter',
              reason: config.reason,
            });
          }
        }
      }
    }
  }
  
  return result;
}

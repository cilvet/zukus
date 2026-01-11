/**
 * Resolution of EntityProviders
 * 
 * Resolves an EntityProvider to:
 * - Granted entities (by specific IDs and/or filter)
 * - Eligible entities for selection (with FilterResults)
 * 
 * Both granted and selector can coexist and are resolved independently.
 */

import type {
  EntityProvider,
  GrantedConfig,
  ProviderResolutionResult,
  GrantedResolutionResult,
  SelectorResolutionResult,
  ResolutionWarning,
} from './types';
import type { EntityFilter, FilterResult, SubstitutionIndex } from '../filtering/types';
import { filterEntitiesWithVariables } from '../filtering/filterWithVariables';

// =============================================================================
// Type Guards
// =============================================================================

function isEntityFilter(value: unknown): value is EntityFilter {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const obj = value as Record<string, unknown>;
  return 'type' in obj && 'conditions' in obj && 'filterPolicy' in obj;
}

// =============================================================================
// Resolve Granted
// =============================================================================

function resolveGrantedByIds<T>(
  ids: string[],
  getEntityById: (id: string) => T | undefined
): { entities: T[]; warnings: ResolutionWarning[] } {
  const entities: T[] = [];
  const warnings: ResolutionWarning[] = [];

  for (const id of ids) {
    const entity = getEntityById(id);
    if (entity) {
      entities.push(entity);
    } else {
      warnings.push({
        type: 'entity_not_found',
        message: `Entity with ID '${id}' not found`,
        entityId: id,
      });
    }
  }

  return { entities, warnings };
}

function resolveGrantedByFilter<T>(
  filter: EntityFilter,
  allEntities: T[],
  variables: SubstitutionIndex
): T[] {
  // For granted, we always use strict filtering (ignore filterPolicy)
  const strictFilter: EntityFilter = {
    ...filter,
    filterPolicy: 'strict',
  };

  const filterResults = filterEntitiesWithVariables(allEntities, [strictFilter], variables);
  return filterResults.map(result => result.entity);
}

function resolveGranted<T>(
  grantedConfig: GrantedConfig,
  allEntities: T[],
  getEntityById: (id: string) => T | undefined,
  variables: SubstitutionIndex
): GrantedResolutionResult<T> {
  const allEntitiesSet = new Set<T>();
  const warnings: ResolutionWarning[] = [];

  // Resolve specific IDs
  if (grantedConfig.specificIds && grantedConfig.specificIds.length > 0) {
    const result = resolveGrantedByIds(grantedConfig.specificIds, getEntityById);
    for (const entity of result.entities) {
      allEntitiesSet.add(entity);
    }
    warnings.push(...result.warnings);
  }

  // Resolve filter (additive with IDs)
  if (grantedConfig.filter && isEntityFilter(grantedConfig.filter)) {
    const filterEntities = resolveGrantedByFilter(grantedConfig.filter, allEntities, variables);
    for (const entity of filterEntities) {
      allEntitiesSet.add(entity);
    }
  }

  return {
    entities: Array.from(allEntitiesSet),
    warnings,
  };
}

// =============================================================================
// Resolve Selector
// =============================================================================

function resolveSelectorByIds<T>(
  entityIds: string[],
  getEntityById: (id: string) => T | undefined
): { results: FilterResult<T>[]; warnings: ResolutionWarning[] } {
  const results: FilterResult<T>[] = [];
  const warnings: ResolutionWarning[] = [];

  for (const id of entityIds) {
    const entity = getEntityById(id);
    if (entity) {
      results.push({
        entity,
        matches: true,
        evaluatedConditions: [],
      });
    } else {
      warnings.push({
        type: 'entity_not_found',
        message: `Entity with ID '${id}' not found`,
        entityId: id,
      });
    }
  }

  return { results, warnings };
}

function resolveSelectorByFilter<T extends { entityType?: string }>(
  filter: EntityFilter,
  allEntities: T[],
  entityType: string | undefined,
  variables: SubstitutionIndex
): { results: FilterResult<T>[]; warnings: ResolutionWarning[] } {
  // First filter by entityType if specified
  let candidates = allEntities;
  if (entityType) {
    candidates = allEntities.filter(e => e.entityType === entityType);
  }

  const results = filterEntitiesWithVariables(candidates, [filter], variables);

  return { results, warnings: [] };
}

function resolveSelectorByEntityType<T extends { entityType?: string }>(
  entityType: string,
  allEntities: T[]
): { results: FilterResult<T>[]; warnings: ResolutionWarning[] } {
  const filtered = allEntities.filter(e => e.entityType === entityType);
  
  const results: FilterResult<T>[] = filtered.map(entity => ({
    entity,
    matches: true,
    evaluatedConditions: [],
  }));

  return { results, warnings: [] };
}

function resolveSelector<T extends { entityType?: string }>(
  selector: import('./types').Selector,
  allEntities: T[],
  getEntityById: (id: string) => T | undefined,
  variables: SubstitutionIndex
): SelectorResolutionResult<T> {
  let results: FilterResult<T>[] = [];
  let warnings: ResolutionWarning[] = [];

  // Case 1: Explicit entity IDs
  if (selector.entityIds && selector.entityIds.length > 0) {
    const resolved = resolveSelectorByIds<T>(selector.entityIds, getEntityById);
    results = resolved.results;
    warnings = resolved.warnings;

    // Apply additional filter if present
    if (selector.filter && results.length > 0) {
      const entities = results.map(r => r.entity);
      const filtered = filterEntitiesWithVariables(entities, [selector.filter], variables);
      results = filtered;
    }
  }
  // Case 2: Filter without explicit IDs
  else if (selector.filter) {
    const resolved = resolveSelectorByFilter<T>(
      selector.filter,
      allEntities,
      selector.entityType,
      variables
    );
    results = resolved.results;
    warnings = resolved.warnings;
  }
  // Case 3: Only entityType
  else if (selector.entityType) {
    const resolved = resolveSelectorByEntityType<T>(selector.entityType, allEntities);
    results = resolved.results;
    warnings = resolved.warnings;
  }

  return {
    selector,
    eligibleEntities: results,
    warnings,
  };
}

// =============================================================================
// Main Resolution Function
// =============================================================================

/**
 * Resolves an EntityProvider to its result.
 * 
 * - `granted`: Resolves specific IDs and/or filter (combined additively)
 * - `selector`: Resolves eligible entities with FilterResults
 * 
 * Both can coexist and are resolved independently.
 * 
 * @param provider - The EntityProvider to resolve
 * @param allEntities - All available entities to search/filter
 * @param getEntityById - Function to look up entity by ID
 * @param variables - Variable values for filter substitution
 * @returns ProviderResolutionResult with granted entities, selector options, and warnings
 */
export function resolveProvider<T extends { entityType?: string }>(
  provider: EntityProvider,
  allEntities: T[],
  getEntityById: (id: string) => T | undefined,
  variables: SubstitutionIndex
): ProviderResolutionResult<T> {
  const result: ProviderResolutionResult<T> = {
    warnings: [],
  };

  // Check for empty provider
  if (!provider.granted && !provider.selector) {
    result.warnings.push({
      type: 'empty_provider',
      message: 'EntityProvider has neither granted nor selector configuration',
    });
    return result;
  }

  // Resolve granted if present
  if (provider.granted) {
    result.granted = resolveGranted(provider.granted, allEntities, getEntityById, variables);
  }

  // Resolve selector if present
  if (provider.selector) {
    result.selector = resolveSelector(provider.selector, allEntities, getEntityById, variables);
  }

  return result;
}

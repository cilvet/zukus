/**
 * Filter Configuration Registry
 *
 * Provides a central registry for entity filter configurations.
 * Allows looking up filter configs by entity type at runtime.
 *
 * @example
 * ```typescript
 * // Register a custom configuration
 * registerFilterConfig(myFeatFilterConfig)
 *
 * // Look up configuration
 * const config = getFilterConfig('spell')
 * if (config) {
 *   // Use config to render filters
 * }
 * ```
 */

import type { EntityFilterConfig } from './filterConfig'
import { spellFilterConfig } from './configs/spellFilterConfig'

// ============================================================================
// Registry
// ============================================================================

/**
 * Internal registry mapping entity types to their filter configurations.
 */
const registry = new Map<string, EntityFilterConfig>()

/**
 * Register a filter configuration for an entity type.
 *
 * @param config - The filter configuration to register
 * @throws If a configuration is already registered for this entity type
 */
export function registerFilterConfig(config: EntityFilterConfig): void {
  if (registry.has(config.entityType)) {
    throw new Error(
      `Filter configuration already registered for entity type: ${config.entityType}`
    )
  }
  registry.set(config.entityType, config)
}

/**
 * Get the filter configuration for an entity type.
 *
 * @param entityType - The entity type to look up
 * @returns The filter configuration, or undefined if not registered
 */
export function getFilterConfig(entityType: string): EntityFilterConfig | undefined {
  return registry.get(entityType)
}

/**
 * Check if a filter configuration exists for an entity type.
 *
 * @param entityType - The entity type to check
 */
export function hasFilterConfig(entityType: string): boolean {
  return registry.has(entityType)
}

/**
 * Get all registered entity types.
 */
export function getRegisteredEntityTypes(): string[] {
  return Array.from(registry.keys())
}

/**
 * Clear the registry (mainly for testing).
 */
export function clearFilterConfigRegistry(): void {
  registry.clear()
}

// ============================================================================
// Default Registrations
// ============================================================================

// Register built-in configurations
registerFilterConfig(spellFilterConfig)

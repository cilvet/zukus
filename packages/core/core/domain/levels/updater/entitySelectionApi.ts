/**
 * Helper functions for managing entity selections at the character level.
 * 
 * These functions bridge the UI with the core selection operations,
 * providing a complete API for selecting and deselecting entities in providers.
 * 
 * Key responsibilities:
 * - Generate instanceIds that encode the selection path
 * - Add/remove entities from the character's entity pool
 * - Update provider selections (selectedInstanceIds)
 * - Handle cascade deletion for nested entity selections
 */

import type { CharacterBaseData } from '../../character/baseData/character';
import type { StandardEntity } from '../../entities/types/base';
import type { EntityInstance, EntityOrigin } from '../storage/types';
import type { ProviderLocation } from './types';
import { updateProviderSelection, getProvider } from './selectionOperations';
import { deleteEntity } from './entityOperations';

// =============================================================================
// Types
// =============================================================================

export type SelectionResult = {
  character: CharacterBaseData;
  instanceId: string;
  warnings: string[];
  errors: string[];
};

export type DeselectionResult = {
  character: CharacterBaseData;
  warnings: string[];
  errors: string[];
};

// =============================================================================
// Instance ID Generation
// =============================================================================

/**
 * Generates the instanceId for an entity based on where it's being selected.
 * 
 * Format: "{entityId}@{origin-path}"
 * 
 * Examples:
 * - ClassLevel: "power-attack@fighter-1-bonus-feat"
 * - SystemLevel: "toughness@level-4-feat-selector"
 * - Entity: "power-attack@combat-trick@rogue-2-rogue-talent-combat-feat"
 */
export function generateInstanceId(
  entityId: string,
  location: ProviderLocation,
  selectorId: string
): string {
  if (location.type === 'classLevel') {
    return `${entityId}@${location.classId}-${location.classLevel}-${selectorId}`;
  }
  
  if (location.type === 'systemLevel') {
    return `${entityId}@level-${location.characterLevel}-${selectorId}`;
  }
  
  // Entity provider - chain the parent instanceId
  return `${entityId}@${location.parentInstanceId}-${selectorId}`;
}

/**
 * Generates the origin string for an EntityInstance.
 * 
 * The origin tracks where this entity came from for:
 * - Cleanup when removing classes or parent entities
 * - Traceability in the UI
 * 
 * Formats:
 * - "classLevel:fighter-1" — from a class level provider
 * - "characterLevel:4" — from a system level provider
 * - "entityInstance.classFeature:combat-trick@rogue-2-rogue-talent" — from another entity's provider
 * 
 * @param location - Where the provider is located
 * @param parentEntityType - For entity locations, the entityType of the parent entity
 */
export function generateOrigin(
  location: ProviderLocation,
  parentEntityType: string
): EntityOrigin {
  if (location.type === 'classLevel') {
    return `classLevel:${location.classId}-${location.classLevel}`;
  }
  
  if (location.type === 'systemLevel') {
    return `characterLevel:${location.characterLevel}`;
  }
  
  return `entityInstance.${parentEntityType}:${location.parentInstanceId}`;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Gets the entityType of the parent entity for entity locations.
 * For classLevel/systemLevel locations, returns an empty string (not used in origin).
 */
function getParentEntityType(
  character: CharacterBaseData,
  location: ProviderLocation
): string {
  if (location.type !== 'entity') {
    return '';
  }
  
  if (!character.entities) {
    return 'unknown';
  }
  
  for (const instances of Object.values(character.entities)) {
    const found = instances.find(i => i.instanceId === location.parentInstanceId);
    if (found) {
      return found.entity.entityType;
    }
  }
  
  return 'unknown';
}

// =============================================================================
// Select Entity
// =============================================================================

/**
 * Selects an entity in a provider and adds it to the character's entity pool.
 * 
 * This function:
 * 1. Validates the provider exists and has a selector
 * 2. Checks max selections hasn't been reached
 * 3. Generates instanceId and origin
 * 4. Creates the EntityInstance and adds it to the pool
 * 5. Updates the provider's selectedInstanceIds
 * 
 * @param character - The character data to update
 * @param providerLocation - Where the provider is located
 * @param entity - The entity to select (from compendium)
 * @param selectorId - The selector's ID (used for instanceId generation)
 * @returns Updated character with the new selection, plus instanceId, warnings, and errors
 */
export function selectEntityInProvider(
  character: CharacterBaseData,
  providerLocation: ProviderLocation,
  entity: StandardEntity,
  selectorId: string
): SelectionResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  
  // Get current provider to check existing selections
  const provider = getProvider(character, providerLocation);
  if (!provider) {
    errors.push(`Provider not found at location`);
    return { character, instanceId: '', warnings, errors };
  }
  
  if (!provider.selector) {
    errors.push(`Provider has no selector`);
    return { character, instanceId: '', warnings, errors };
  }
  
  // Check max selections
  const currentSelections = provider.selectedInstanceIds || [];
  if (currentSelections.length >= provider.selector.max) {
    errors.push(`Maximum selections reached (${provider.selector.max})`);
    return { character, instanceId: '', warnings, errors };
  }
  
  // Generate instanceId and origin
  const instanceId = generateInstanceId(entity.id, providerLocation, selectorId);
  
  // For entity locations, we need the parent's entityType, not the selected entity's type
  const parentEntityType = getParentEntityType(character, providerLocation);
  const origin = generateOrigin(providerLocation, parentEntityType);
  
  // Check for duplicate selection
  if (currentSelections.includes(instanceId)) {
    warnings.push(`Entity already selected: ${instanceId}`);
    return { character, instanceId, warnings, errors };
  }
  
  // Create EntityInstance
  const entityInstance: EntityInstance = {
    instanceId,
    entity,
    applicable: false,
    origin,
  };
  
  // Add to character.entities
  const entityType = entity.entityType;
  const existingEntities = character.entities?.[entityType] || [];
  
  const updatedEntities = {
    ...character.entities,
    [entityType]: [...existingEntities, entityInstance],
  };
  
  let updatedCharacter: CharacterBaseData = {
    ...character,
    entities: updatedEntities,
  };
  
  // Update provider's selectedInstanceIds
  const newSelectedIds = [...currentSelections, instanceId];
  const updateResult = updateProviderSelection(
    updatedCharacter,
    providerLocation,
    newSelectedIds
  );
  
  updatedCharacter = updateResult.character;
  
  if (updateResult.warnings.length > 0) {
    warnings.push(...updateResult.warnings.map(w => w.message));
  }
  
  return {
    character: updatedCharacter,
    instanceId,
    warnings,
    errors,
  };
}

// =============================================================================
// Deselect Entity
// =============================================================================

/**
 * Deselects an entity from a provider and removes it from the character's entity pool.
 * 
 * This function:
 * 1. Updates the provider's selectedInstanceIds (removes the instanceId)
 * 2. Deletes the entity from the pool (with cascade for child entities)
 * 
 * @param character - The character data to update
 * @param providerLocation - Where the provider is located
 * @param instanceId - The instanceId of the entity to deselect
 * @returns Updated character without the deselected entity, plus warnings and errors
 */
export function deselectEntityFromProvider(
  character: CharacterBaseData,
  providerLocation: ProviderLocation,
  instanceId: string
): DeselectionResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  
  // Get current provider
  const provider = getProvider(character, providerLocation);
  if (!provider) {
    errors.push(`Provider not found at location`);
    return { character, warnings, errors };
  }
  
  // Check if selection exists
  const currentSelections = provider.selectedInstanceIds || [];
  if (!currentSelections.includes(instanceId)) {
    warnings.push(`Instance not found in selections: ${instanceId}`);
  }
  
  // Update provider's selectedInstanceIds
  const newSelectedIds = currentSelections.filter(id => id !== instanceId);
  const updateResult = updateProviderSelection(
    character,
    providerLocation,
    newSelectedIds
  );
  
  let updatedCharacter = updateResult.character;
  
  if (updateResult.warnings.length > 0) {
    warnings.push(...updateResult.warnings.map(w => w.message));
  }
  
  // Delete entity from pool (with cascade for child entities)
  const deleteResult = deleteEntity(updatedCharacter, instanceId);
  updatedCharacter = deleteResult.character;
  
  if (deleteResult.warnings.length > 0) {
    warnings.push(...deleteResult.warnings.map(w => w.message));
  }
  
  return {
    character: updatedCharacter,
    warnings,
    errors,
  };
}

// =============================================================================
// Get Selected Entities
// =============================================================================

/**
 * Gets the selected entity instances for a provider from the character's pool.
 * 
 * This is useful for displaying current selections in the UI.
 * 
 * @param character - The character data
 * @param providerLocation - Where the provider is located
 * @returns Array of EntityInstances that are currently selected
 */
export function getSelectedEntityInstances(
  character: CharacterBaseData,
  providerLocation: ProviderLocation
): EntityInstance[] {
  const provider = getProvider(character, providerLocation);
  if (!provider || !provider.selectedInstanceIds) {
    return [];
  }
  
  const selectedInstances: EntityInstance[] = [];
  
  if (!character.entities) {
    return selectedInstances;
  }
  
  for (const instanceId of provider.selectedInstanceIds) {
    for (const instances of Object.values(character.entities)) {
      const found = instances.find(i => i.instanceId === instanceId);
      if (found) {
        selectedInstances.push(found);
        break;
      }
    }
  }
  
  return selectedInstances;
}


import type { CharacterBaseData } from '../../baseData/character';
import type { ComputedEntity, StandardEntity } from '../../../entities/types/base';
import type { CharacterWarning } from '../../calculatedSheet/sheet';
import type { Change, ChangeOriginType, ContextualizedChange } from '../../baseData/changes';
import type { ContextualChange } from '../../baseData/contextualChange';
import type { SpecialChange } from '../../baseData/specialChanges';
import type { ResolvedCompendiumContext } from '../../../compendiums/types';

/**
 * Result of compiling character entities.
 */
export type EntitiesCompilationResult = {
  /** Entities with computation metadata */
  computedEntities: ComputedEntity[];
  /** Contextualized changes from entities */
  changes: ContextualizedChange<Change>[];
  /** Contextual changes from entities */
  contextualChanges: ContextualChange[];
  /** Special changes from entities */
  specialChanges: SpecialChange[];
  /** Warnings generated during compilation */
  warnings: CharacterWarning[];
};

/**
 * Known ChangeOriginTypes that can be derived from entityType.
 */
const KNOWN_ORIGIN_TYPES: ChangeOriginType[] = [
  'feat',
  'item',
  'buff',
  'classFeature',
  'race',
  'spell',
];

/**
 * Derives ChangeOriginType from an entity's entityType.
 * If the entityType matches a known origin type, uses it.
 * Otherwise, uses 'entity' as generic fallback.
 */
export function getOriginTypeFromEntityType(entityType: string): ChangeOriginType {
  if (KNOWN_ORIGIN_TYPES.includes(entityType as ChangeOriginType)) {
    return entityType as ChangeOriginType;
  }
  return 'entity';
}

/**
 * Gets available entity types from the compendium context.
 * If no context provided, returns empty array.
 */
function getAvailableEntityTypes(compendiumContext?: ResolvedCompendiumContext): string[] {
  if (!compendiumContext) {
    return [];
  }
  return compendiumContext.availableTypeNames;
}

/**
 * Creates a ComputedEntity from a StandardEntity with metadata.
 */
function createComputedEntity(entity: StandardEntity): ComputedEntity {
  return {
    ...entity,
    _meta: {
      source: {
        originType: getOriginTypeFromEntityType(entity.entityType),
        originId: entity.id,
        name: entity.name || entity.id,
      },
      suppressed: false,
    },
  };
}

/**
 * Contextualizes a Change from an entity.
 */
function contextualizeEntityChange<T extends Change>(
  change: T,
  entity: StandardEntity
): ContextualizedChange<T> {
  return {
    ...change,
    originType: getOriginTypeFromEntityType(entity.entityType),
    originId: entity.id,
    name: entity.name || entity.id,
  };
}

/**
 * Gets changes from an entity, checking both legacy and new field names.
 * Prioritizes legacy_changes over changes for new entities.
 */
function getEntityChanges(entity: StandardEntity): Change[] {
  // Check legacy_changes first (new format)
  if (entity.legacy_changes && entity.legacy_changes.length > 0) {
    return entity.legacy_changes;
  }
  // Fall back to changes (old format)
  if (entity.changes && entity.changes.length > 0) {
    return entity.changes;
  }
  return [];
}

/**
 * Gets contextual changes from an entity.
 */
function getEntityContextualChanges(entity: StandardEntity): ContextualChange[] {
  if (entity.legacy_contextualChanges && entity.legacy_contextualChanges.length > 0) {
    return entity.legacy_contextualChanges;
  }
  return [];
}

/**
 * Gets special changes from an entity, checking both field names.
 */
function getEntitySpecialChanges(entity: StandardEntity): SpecialChange[] {
  // Check legacy_specialChanges first (new format)
  if (entity.legacy_specialChanges && entity.legacy_specialChanges.length > 0) {
    return entity.legacy_specialChanges;
  }
  // Fall back to specialChanges (old format)
  if (entity.specialChanges && entity.specialChanges.length > 0) {
    return entity.specialChanges;
  }
  return [];
}

/**
 * Compiles a single entity and adds its data to the result.
 * Used by both customEntities and level system entities.
 */
function compileEntity(entity: StandardEntity, result: EntitiesCompilationResult): void {
  // Create computed entity with metadata
  const computedEntity = createComputedEntity(entity);
  result.computedEntities.push(computedEntity);

  // Extract and contextualize changes
  const entityChanges = getEntityChanges(entity);
  for (const change of entityChanges) {
    const contextualizedChange = contextualizeEntityChange(change, entity);
    result.changes.push(contextualizedChange);
  }

  // Extract contextual changes (already have name, just copy)
  const entityContextualChanges = getEntityContextualChanges(entity);
  result.contextualChanges.push(...entityContextualChanges);

  // Extract and contextualize special changes
  const entitySpecialChanges = getEntitySpecialChanges(entity);
  for (const specialChange of entitySpecialChanges) {
    result.specialChanges.push(specialChange);
  }
}

/**
 * Compiles all entities from the character.
 * 
 * This function processes entities from two sources:
 * 1. customEntities - Legacy system, all entities are compiled
 * 2. entities - New level system, only entities with applicable: true are compiled
 * 
 * For each entity:
 * - Creates ComputedEntity with metadata
 * - Extracts and contextualizes changes
 * - Generates warnings for unknown entity types (if compendium context provided)
 * 
 * @param baseData - Character base data containing customEntities and/or entities
 * @param compendiumContext - Resolved compendium context with available entity types
 * @returns Compiled entities, changes, and warnings
 */
export function compileCharacterEntities(
  baseData: CharacterBaseData,
  compendiumContext?: ResolvedCompendiumContext
): EntitiesCompilationResult {
  const result: EntitiesCompilationResult = {
    computedEntities: [],
    changes: [],
    contextualChanges: [],
    specialChanges: [],
    warnings: [],
  };

  const availableTypes = getAvailableEntityTypes(compendiumContext);
  const hasContext = compendiumContext !== undefined;

  // ==========================================================================
  // 1. Process customEntities (legacy system)
  // ==========================================================================
  if (baseData.customEntities) {
    for (const [entityType, entities] of Object.entries(baseData.customEntities)) {
      // Validate entityType exists in context (if context is provided)
      if (hasContext && !availableTypes.includes(entityType)) {
        result.warnings.push({
          type: 'unknown_entity_type',
          message: `Unknown entity type '${entityType}'. Entities of this type will be skipped.`,
          context: {
            entityType,
            entityCount: entities.length,
            availableTypes,
          },
        });
        continue;
      }

      // Process each entity
      for (const entity of entities) {
        compileEntity(entity, result);
      }
    }
  }

  // ==========================================================================
  // 2. Process entities from new level system (only applicable ones)
  // ==========================================================================
  if (baseData.entities) {
    for (const [_entityType, instances] of Object.entries(baseData.entities)) {
      for (const instance of instances) {
        // Only compile entities that are applicable based on character level
        if (!instance.applicable) {
          continue;
        }
        
        compileEntity(instance.entity, result);
      }
    }
  }

  return result;
}


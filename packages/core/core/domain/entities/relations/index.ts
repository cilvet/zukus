/**
 * Sistema de Relaciones entre Entidades
 *
 * Permite definir campos de tipo 'relation' que se populan automáticamente
 * con datos de entidades de relación, compilados en estructuras filtrables.
 */

// Types from base (re-export for convenience)
export type {
  RelationMetadataField,
  RelationCompileConfig,
  RelationFieldConfig,
  RelationValue,
  CompiledRelationValue
} from '../types/base'

// Compiler
export type { RelationEntity, RelationIndex, RelationFieldDef } from './compiler'

export {
  buildRelationIndex,
  getRelationsFrom,
  getRelationsTo,
  generateFilterableKey,
  parseFilterableKey,
  compileRelationField,
  enrichEntityWithRelations,
  enrichEntitiesWithRelations,
  compileAndEnrichEntities
} from './compiler'

// Filter Helpers
export {
  createRelationKeyCondition,
  createRelationCondition,
  formatRelationKey,
  extractUniqueTargets,
  extractUniqueMetadataValues,
  extractMetadataValuesForTarget,
  countByRelationKey
} from './filterHelpers'

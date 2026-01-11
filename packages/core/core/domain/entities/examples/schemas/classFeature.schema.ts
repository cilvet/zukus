import { EntitySchemaDefinition } from '../../types/schema';
import type { Entity, SearchableFields, TaggableFields, EffectfulFields, SourceableFields } from '../../types/base';

/**
 * Schema de Aptitudes de Clase para D&D 3.5
 * 
 * Define la estructura de una aptitud de clase (Sneak Attack, Evasion, etc.).
 * Las aptitudes no tienen campos específicos adicionales; su comportamiento
 * proviene de los addons (effectful para changes, suppressing para reemplazos, etc.)
 */

// ============================================================================
// Schema Definition
// ============================================================================

export const classFeatureSchema: EntitySchemaDefinition = {
  typeName: "classFeature",
  description: "Aptitudes de clase (Sneak Attack, Evasion, etc.)",
  addons: ["searchable", "taggable", "effectful", "source"],
  fields: []
};

// ============================================================================
// Tipo TypeScript inferido del schema
// ============================================================================

/**
 * Tipo completo de una aptitud de clase
 * Solo incluye campos base de los addons, sin campos específicos adicionales
 */
export type ClassFeature = Entity 
  & SearchableFields 
  & Partial<TaggableFields>
  & Partial<EffectfulFields>
  & Partial<SourceableFields>
  & {
    // entityType es más específico
    entityType: "classFeature";
  };


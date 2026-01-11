import { EntitySchemaDefinition } from '../../types/schema';
import type { Entity, SearchableFields, TaggableFields, EffectfulFields, SourceableFields } from '../../types/base';

/**
 * Schema de Dotes/Talentos para D&D 3.5
 * 
 * Define la estructura de una dote (feat) según las reglas de D&D 3.5.
 */

// ============================================================================
// Schema Definition
// ============================================================================

export const featSchema: EntitySchemaDefinition = {
  typeName: "feat",
  description: "Dotes/talentos del personaje",
  addons: ["searchable", "taggable", "effectful", "source"],
  fields: [
    {
      name: "canBeTakenMultipleTimes",
      type: "boolean",
      description: "Si la dote se puede tomar más de una vez",
      optional: false
    },
    {
      name: "repeatLimit",
      type: "string",
      isFormula: true,
      description: "Límite de veces que se puede tomar (expresión/fórmula, ej: '@character.level' o '3')",
      optional: true
    },
    {
      name: "prerequisites",
      type: "string",
      description: "Requisitos para tomar la dote (texto descriptivo por ahora)",
      optional: true
    }
  ]
};

// ============================================================================
// Tipo TypeScript inferido del schema
// ============================================================================

/**
 * Tipo completo de una dote
 * Incluye campos base + campos específicos del schema
 */
export type Feat = Entity 
  & SearchableFields 
  & Partial<TaggableFields>
  & Partial<EffectfulFields>
  & Partial<SourceableFields>
  & {
    // entityType es más específico
    entityType: "feat";
    
    // Campos específicos de la dote
    canBeTakenMultipleTimes: boolean;
    repeatLimit?: string;
    prerequisites?: string;
  };


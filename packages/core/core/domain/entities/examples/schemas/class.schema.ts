import { EntitySchemaDefinition } from '../../types/schema';
import type { Entity, SearchableFields, TaggableFields, SourceableFields, EnumOption } from '../../types/base';
import type { EntityProvider } from '../../../levels/providers/types';

/**
 * Schema de Clases para D&D 3.5
 * 
 * Define la estructura de una clase de personaje según las reglas de D&D 3.5.
 */

// ============================================================================
// Valores de Enum
// ============================================================================

export const HIT_DIE_VALUES = [4, 6, 8, 10, 12] as const;

export const BAB_PROGRESSIONS = ["full", "medium", "poor"] as const;

export const SAVE_PROGRESSIONS = ["good", "poor"] as const;

export const CLASS_TYPES = ["base", "prestige"] as const;

// ============================================================================
// Enum Options (con metadatos para UI)
// ============================================================================

export const HIT_DIE_OPTIONS: EnumOption[] = [
  { value: 4, name: "d4", description: "Dado de golpe d4" },
  { value: 6, name: "d6", description: "Dado de golpe d6" },
  { value: 8, name: "d8", description: "Dado de golpe d8" },
  { value: 10, name: "d10", description: "Dado de golpe d10" },
  { value: 12, name: "d12", description: "Dado de golpe d12" }
];

export const BAB_PROGRESSION_OPTIONS: EnumOption[] = [
  { value: "full", name: "Completa", description: "+1 por nivel" },
  { value: "medium", name: "Media", description: "+3/4 por nivel" },
  { value: "poor", name: "Pobre", description: "+1/2 por nivel" }
];

export const SAVE_PROGRESSION_OPTIONS: EnumOption[] = [
  { value: "good", name: "Buena", description: "+1/2 nivel + 2" },
  { value: "poor", name: "Mala", description: "+1/3 nivel" }
];

export const CLASS_TYPE_OPTIONS: EnumOption[] = [
  { value: "base", name: "Base", description: "Clase base" },
  { value: "prestige", name: "Prestigio", description: "Clase de prestigio" }
];

// ============================================================================
// Schema Definition
// ============================================================================

export const classSchema: EntitySchemaDefinition = {
  typeName: "class",
  description: "Clases de personaje de D&D 3.5",
  addons: ["searchable", "taggable", "source"],
  fields: [
    {
      name: "hitDie",
      type: "enum",
      description: "Dado de golpe de la clase",
      optional: false,
      options: HIT_DIE_OPTIONS
    },
    {
      name: "babProgression",
      type: "enum",
      description: "Progresión del Bonus de Ataque Base",
      optional: false,
      options: BAB_PROGRESSION_OPTIONS
    },
    {
      name: "saves",
      type: "object",
      description: "Progresión de tiradas de salvación",
      optional: false,
      objectFields: [
        {
          name: "fortitude",
          type: "enum",
          description: "Progresión de salvación de Fortaleza",
          optional: false,
          options: SAVE_PROGRESSION_OPTIONS
        },
        {
          name: "reflex",
          type: "enum",
          description: "Progresión de salvación de Reflejos",
          optional: false,
          options: SAVE_PROGRESSION_OPTIONS
        },
        {
          name: "will",
          type: "enum",
          description: "Progresión de salvación de Voluntad",
          optional: false,
          options: SAVE_PROGRESSION_OPTIONS
        }
      ]
    },
    {
      name: "skillPointsPerLevel",
      type: "string",
      isFormula: true,
      description: "Puntos de habilidad por nivel (fórmula, ej: '2 + @ability.intelligence.modifier')",
      optional: false
    },
    {
      name: "classSkillIds",
      type: "string_array",
      description: "IDs de las habilidades de clase (skills)",
      optional: false,
      nonEmpty: true
    },
    {
      name: "classType",
      type: "enum",
      description: "Tipo de clase",
      optional: false,
      options: CLASS_TYPE_OPTIONS
    },
    {
      name: "levels",
      type: "dataTable",
      description: "Aptitudes obtenidas por nivel",
      optional: false,
      rowKey: {
        name: "Nivel",
        startingNumber: 1,
        incremental: true
      },
      columns: [
        {
          id: "providers",
          name: "Aptitudes",
          type: "entityProvider",
          allowMultiple: true,
          optional: true
        }
      ]
    },
    {
      name: "prerequisites",
      type: "string",
      description: "Requisitos para tomar la clase (para clases de prestigio, texto descriptivo por ahora)",
      optional: true
    }
  ]
};

// ============================================================================
// Tipos TypeScript inferidos del schema
// ============================================================================

export type HitDie = typeof HIT_DIE_VALUES[number];
export type BabProgression = typeof BAB_PROGRESSIONS[number];
export type SaveProgression = typeof SAVE_PROGRESSIONS[number];
export type ClassType = typeof CLASS_TYPES[number];

/**
 * Progresión de salvaciones
 */
export type SaveProgressions = {
  fortitude: SaveProgression;
  reflex: SaveProgression;
  will: SaveProgression;
};

/**
 * Estructura de una fila de la tabla de niveles
 */
export type ClassLevelRow = {
  providers?: EntityProvider[];
};

/**
 * Tipo completo de una clase
 * Incluye campos base + campos específicos del schema
 */
export type Class = Entity 
  & SearchableFields 
  & Partial<TaggableFields>
  & Partial<SourceableFields>
  & {
    // entityType es más específico
    entityType: "class";
    
    // Campos específicos de la clase
    hitDie: HitDie;
    babProgression: BabProgression;
    saves: SaveProgressions;
    skillPointsPerLevel: string;
    classSkillIds: string[];
    classType: ClassType;
    levels: Record<string, ClassLevelRow>;
    prerequisites?: string;
  };


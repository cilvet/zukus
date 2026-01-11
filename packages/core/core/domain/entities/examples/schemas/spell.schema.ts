import { EntitySchemaDefinition } from '../../types/schema';

/**
 * Schema de Conjuros para D&D 3.5
 * 
 * Este schema define la estructura de un conjuro según las reglas de D&D 3.5.
 * Incluye todos los campos necesarios para representar conjuros del SRD.
 */

// ============================================================================
// Valores permitidos (Enums)
// ============================================================================

export const SPELL_SCHOOLS = [
  "abjuration",
  "conjuration", 
  "divination",
  "enchantment",
  "evocation",
  "illusion",
  "necromancy",
  "transmutation",
  "universal"
] as const;

export const SPELL_SUBSCHOOLS = [
  // Conjuration
  "calling",
  "creation", 
  "healing",
  "summoning",
  "teleportation",
  // Divination
  "scrying",
  // Enchantment
  "charm",
  "compulsion",
  // Illusion
  "figment",
  "glamer",
  "pattern",
  "phantasm",
  "shadow"
] as const;

export const SPELL_DESCRIPTORS = [
  "acid",
  "air",
  "chaotic",
  "cold",
  "darkness",
  "death",
  "earth",
  "electricity",
  "evil",
  "fear",
  "fire",
  "force",
  "good",
  "language-dependent",
  "lawful",
  "light",
  "mind-affecting",
  "sonic",
  "water"
] as const;

export const SPELL_COMPONENTS = [
  "V",   // Verbal
  "S",   // Somatic
  "M",   // Material
  "F",   // Focus
  "DF",  // Divine Focus
  "XP"   // Experience Points
] as const;

export const SPELL_RESISTANCE_VALUES = [
  "Yes",
  "No", 
  "Yes (harmless)",
  "Yes (object)",
  "See text"
] as const;

export const SPELL_LEVELS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

// ============================================================================
// Clases lanzadoras base de D&D 3.5
// ============================================================================

export const SPELLCASTING_CLASSES = [
  // Arcanos
  "Wizard",
  "Sorcerer",
  "Bard",
  "Warmage",
  "Wu Jen",
  
  // Divinos
  "Cleric",
  "Druid",
  "Paladin",
  "Ranger",
  "Favored Soul",
  
  // Especiales
  "Adept",       // NPC class
  "Assassin",    // Prestige
  "Blackguard",  // Prestige
] as const;

// ============================================================================
// Schema Definition
// ============================================================================

export const spellSchema: EntitySchemaDefinition = {
  typeName: "spell",
  description: "Un conjuro de D&D 3.5",
  fields: [
    // ========================================
    // Clasificación
    // ========================================
    {
      name: "schools",
      type: "string_array",
      description: "Escuelas de magia (la mayoría tiene una, pero algunas tienen varias)",
      nonEmpty: true,
      allowedValues: [...SPELL_SCHOOLS]
    },
    {
      name: "subschools",
      type: "string_array", 
      description: "Subescuelas específicas (opcional)",
      optional: true,
      allowedValues: [...SPELL_SUBSCHOOLS]
    },
    {
      name: "descriptors",
      type: "string_array",
      description: "Descriptores del conjuro (fire, cold, mind-affecting, etc.)",
      optional: true,
      allowedValues: [...SPELL_DESCRIPTORS]
    },

    // ========================================
    // Componentes
    // ========================================
    {
      name: "components",
      type: "string_array",
      description: "Componentes requeridos para lanzar",
      nonEmpty: true,
      allowedValues: [...SPELL_COMPONENTS]
    },
    {
      name: "materialComponent",
      type: "string",
      description: "Descripción del componente material (si tiene M)",
      optional: true
    },
    {
      name: "focus",
      type: "string",
      description: "Descripción del foco (si tiene F)",
      optional: true
    },
    {
      name: "xpCost",
      type: "string",
      description: "Coste en XP (si tiene XP component)",
      optional: true
    },

    // ========================================
    // Parámetros de lanzamiento
    // ========================================
    {
      name: "castingTime",
      type: "string",
      description: "Tiempo de lanzamiento (1 standard action, 1 round, etc.)",
      optional: false
    },
    {
      name: "range",
      type: "string",
      description: "Rango del conjuro (Personal, Touch, Close, Medium, Long, etc.)",
      optional: false
    },

    // ========================================
    // Objetivo/Área/Efecto (uno de estos suele estar presente)
    // ========================================
    {
      name: "target",
      type: "string",
      description: "Objetivo del conjuro (You, One creature, etc.)",
      optional: true
    },
    {
      name: "area",
      type: "string",
      description: "Área de efecto (20-ft radius, Cone, etc.)",
      optional: true
    },
    {
      name: "effect",
      type: "string",
      description: "Efecto creado (Ray, Wall, etc.)",
      optional: true
    },

    // ========================================
    // Duración y Resistencia
    // ========================================
    {
      name: "duration",
      type: "string",
      description: "Duración del efecto (Instantaneous, 1 round/level, etc.)",
      optional: false
    },
    {
      name: "savingThrow",
      type: "string",
      description: "Tipo de salvación y efecto (None, Reflex half, Will negates, etc.)",
      optional: false
    },
    {
      name: "spellResistance",
      type: "string",
      description: "Si aplica resistencia a conjuros",
      optional: false,
      allowedValues: [...SPELL_RESISTANCE_VALUES]
    },

    // ========================================
    // Descripciones
    // ========================================
    {
      name: "shortDescription",
      type: "string",
      description: "Descripción corta para listas y referencias rápidas",
      optional: true
    },

    // ========================================
    // Niveles por Clase
    // ========================================
    {
      name: "classLevels",
      type: "object_array",
      description: "Nivel del conjuro para cada clase lanzadora",
      nonEmpty: true,
      objectFields: [
        {
          name: "className",
          type: "string",
          description: "Nombre de la clase lanzadora",
          optional: false
        },
        {
          name: "level",
          type: "integer",
          description: "Nivel del conjuro para esta clase (0-9)",
          optional: false,
          allowedValues: [...SPELL_LEVELS]
        }
      ]
    }
  ]
};

// ============================================================================
// Tipo TypeScript inferido del schema
// ============================================================================

export type SpellSchool = typeof SPELL_SCHOOLS[number];
export type SpellSubschool = typeof SPELL_SUBSCHOOLS[number];
export type SpellDescriptor = typeof SPELL_DESCRIPTORS[number];
export type SpellComponent = typeof SPELL_COMPONENTS[number];
export type SpellResistance = typeof SPELL_RESISTANCE_VALUES[number];
export type SpellLevel = typeof SPELL_LEVELS[number];
export type SpellcastingClass = typeof SPELLCASTING_CLASSES[number];

export type SpellClassLevel = {
  className: string;
  level: SpellLevel;
};

/**
 * Tipo completo de un conjuro
 * Incluye campos base de SearchableEntity + campos específicos del schema
 */
export type Spell = {
  // Campos base de SearchableEntity
  id: string;
  name: string;
  type: "spell";
  description?: string;
  
  // Campos específicos del conjuro
  schools: SpellSchool[];
  subschools?: SpellSubschool[];
  descriptors?: SpellDescriptor[];
  components: SpellComponent[];
  materialComponent?: string;
  focus?: string;
  xpCost?: string;
  castingTime: string;
  range: string;
  target?: string;
  area?: string;
  effect?: string;
  duration: string;
  savingThrow: string;
  spellResistance: SpellResistance;
  shortDescription?: string;
  classLevels: SpellClassLevel[];
};




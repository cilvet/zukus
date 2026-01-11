import { EntitySchemaDefinition, Entity, SearchableFields, TaggableFields } from '../../index';

// Type alias for test entities
type TestEntity = Entity & SearchableFields & Partial<TaggableFields> & Record<string, unknown>;

// Common test entity definitions that are reused across test files

export const spellDefinition: EntitySchemaDefinition = {
  typeName: "spell",
  description: "A magical spell",
  fields: [
    {
      name: "level",
      type: "integer",
      description: "Spell level",
      optional: false
    },
    {
      name: "school",
      type: "string",
      description: "School of magic",
      optional: false
    },
    {
      name: "components",
      type: "string_array",
      description: "Spell components",
      optional: false,
      nonEmpty: true
    },
    {
      name: "metamagic",
      type: "boolean",
      description: "Can be enhanced with metamagic",
      optional: true
    },
    {
      name: "damageDice",
      type: "integer_array",
      description: "Damage dice values",
      optional: true
    }
  ]
};

export const discoveryDefinition: EntitySchemaDefinition = {
  typeName: "discovery",
  description: "Alchemist discovery",
  fields: [
    {
      name: "prerequisiteLevel",
      type: "integer",
      description: "Required alchemist level",
      optional: false
    },
    {
      name: "category",
      type: "string",
      description: "Discovery category",
      optional: true
    },
    {
      name: "keywords",
      type: "string_array",
      description: "Discovery keywords",
      optional: true
    }
  ]
};

export const featDefinition: EntitySchemaDefinition = {
  typeName: "feat",
  description: "Character feat",
  fields: [
    {
      name: "prerequisites",
      type: "reference",
      description: "Required feats or features",
      optional: true,
      referenceType: "feat"
    },
    {
      name: "requiredFeats",
      type: "reference",
      description: "Required feats",
      optional: false,
      nonEmpty: true,
      referenceType: "feat"
    },
    {
      name: "benefitType",
      type: "string",
      description: "Type of benefit provided",
      optional: false
    }
  ]
};

// Definitions with enum-like predefined values
export const classDefinition: EntitySchemaDefinition = {
  typeName: "class",
  description: "Character class",
  fields: [
    {
      name: "hitDie",
      type: "integer",
      description: "Hit die type",
      optional: false,
      allowedValues: [4, 6, 8, 10, 12]
    },
    {
      name: "savingThrows",
      type: "string_array",
      description: "Good saving throws",
      optional: false,
      nonEmpty: true,
      allowedValues: ["fort", "ref", "will"]
    },
    {
      name: "alignment",
      type: "string",
      description: "Allowed alignment",
      optional: false,
      allowedValues: ["lawful", "neutral", "chaotic"]
    },
    {
      name: "spellLevels",
      type: "integer_array",
      description: "Available spell levels",
      optional: true,
      allowedValues: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    }
  ]
};

export const spellWithEnumsDefinition: EntitySchemaDefinition = {
  typeName: "spell",
  description: "A magical spell",
  fields: [
    {
      name: "level",
      type: "integer",
      description: "Spell level",
      optional: false,
      allowedValues: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    },
    {
      name: "school",
      type: "string",
      description: "School of magic",
      optional: false,
      allowedValues: ["abjuration", "conjuration", "divination", "enchantment", "evocation", "illusion", "necromancy", "transmutation"]
    },
    {
      name: "components",
      type: "string_array",
      description: "Spell components",
      optional: false,
      nonEmpty: true,
      allowedValues: ["V", "S", "M", "F", "DF", "XP"]
    },
    {
      name: "description",
      type: "string",
      description: "Spell description",
      optional: true
    }
  ]
};

// Sample entities for testing
export const sampleSpells: TestEntity[] = [
  {
    id: "1",
    name: "Fireball",
    entityType: "spell",
    tags: ["damage", "area"],
    level: 3,
    school: "Evocation",
    components: ["V", "S", "M"]
  },
  {
    id: "2",
    name: "Cure Light Wounds",
    entityType: "spell",
    tags: ["healing"],
    level: 1,
    school: "Conjuration",
    components: ["V", "S"]
  }
];

export const sampleEntitiesForFiltering: TestEntity[] = [
  {
    id: "1",
    name: "Fireball",
    entityType: "spell",
    tags: ["damage", "area"],
    level: 3,
    school: "Evocation"
  },
  {
    id: "2",
    name: "Cure Light Wounds",
    entityType: "spell",
    tags: ["healing"],
    level: 1,
    school: "Conjuration"
  },
  {
    id: "3",
    name: "Lightning Bolt",
    entityType: "spell",
    tags: ["damage"],
    level: 3,
    school: "Evocation"
  }
];

export const sampleFeats: TestEntity[] = [
  {
    id: "1",
    name: "Power Attack",
    entityType: "feat",
    prerequisites: ["bab-1"],
    requiredFeats: ["combat-expertise"],
    benefitType: "combat"
  },
  {
    id: "2",
    name: "Cleave",
    entityType: "feat",
    prerequisites: ["power-attack", "strength-13"],
    requiredFeats: ["combat-expertise"],
    benefitType: "combat"
  }
];

export const featsWithReferences: TestEntity[] = [
  {
    id: "1",
    name: "Power Attack",
    entityType: "feat",
    prerequisites: ["bab-1"],
    requiredFeats: ["combat-expertise"]
  },
  {
    id: "2",
    name: "Cleave",
    entityType: "feat",
    prerequisites: ["power-attack", "strength-13"],
    requiredFeats: ["power-attack"]
  },
  {
    id: "3",
    name: "Great Cleave",
    entityType: "feat",
    prerequisites: ["cleave", "bab-4"],
    requiredFeats: ["cleave"]
  }
];

export const sampleClasses: TestEntity[] = [
  {
    id: "1",
    name: "Fighter",
    entityType: "class",
    hitDie: 10,
    alignment: "lawful",
    savingThrows: ["fort"]
  }
];

export const entitiesWithIntArrays: TestEntity[] = [
  {
    id: "1",
    name: "Spell A",
    entityType: "spell",
    damageDice: [1, 4, 6]
  },
  {
    id: "2",
    name: "Spell B",
    entityType: "spell",
    damageDice: [2, 6, 8]
  }
];

export const entitiesForSorting: TestEntity[] = [
  { id: "1", name: "Zebra", entityType: "test", level: 1 },
  { id: "2", name: "Alpha", entityType: "test", level: 3 },
  { id: "3", name: "Beta", entityType: "test", level: 2 }
];
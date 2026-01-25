import { BabType } from "../../../../class/baseAttackBonus";
import { CharacterClass } from "../../../../class/class";
import { SaveType } from "../../../../class/saves";
import { CGEDefinitionChange } from "../../../baseData/specialChanges";
import { buildCharacter } from "../../../../../tests/character/buildCharacter";
import { CGEConfig, LevelTable } from "../../../../cge/types";
import { featureTypes } from "../../../baseData/features/feature";

// ============================================================================
// TABLAS DE WIZARD (Vancian)
// ============================================================================

export const WIZARD_SLOTS_TABLE: LevelTable = {
  1: [3, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  2: [4, 2, 0, 0, 0, 0, 0, 0, 0, 0],
  3: [4, 2, 1, 0, 0, 0, 0, 0, 0, 0],
  4: [4, 3, 2, 0, 0, 0, 0, 0, 0, 0],
  5: [4, 3, 2, 1, 0, 0, 0, 0, 0, 0],
};

// ============================================================================
// CGE CONFIG DE WIZARD (Vancian)
// ============================================================================

export const wizardCGEConfig: CGEConfig = {
  id: 'wizard-spells',
  classId: 'wizard',
  entityType: 'spell',
  levelPath: '@entity.levels.wizard',

  accessFilter: {
    field: 'lists',
    operator: 'contains',
    value: 'wizard',
  },

  // Wizard tiene libro de conjuros sin limite
  known: {
    type: 'UNLIMITED',
  },

  tracks: [
    {
      id: 'base',
      resource: {
        type: 'SLOTS',
        table: WIZARD_SLOTS_TABLE,
        bonusVariable: '@bonusSpells',
        refresh: 'daily',
      },
      // BOUND: prepara conjuros especificos en cada slot
      preparation: { type: 'BOUND' },
    },
  ],

  variables: {
    classPrefix: 'wizard.spell',
    genericPrefix: 'spell',
    casterLevelVar: 'castingClassLevel.wizard',
  },

  labels: {
    known: 'spellbook',
    prepared: 'prepared_spells',
    action: 'cast',
  },
};

// ============================================================================
// SPECIAL CHANGE CGE_DEFINITION (Wizard)
// ============================================================================

export const wizardCGEDefinition: CGEDefinitionChange = {
  type: 'CGE_DEFINITION',
  config: wizardCGEConfig,
};

// ============================================================================
// CLASE WIZARD SIMPLIFICADA PARA TESTS
// ============================================================================

export const wizard: CharacterClass = {
  name: "Wizard",
  uniqueId: "wizard",
  hitDie: 4,
  baseAttackBonusProgression: BabType.POOR,
  baseSavesProgression: {
    fortitude: SaveType.POOR,
    reflex: SaveType.POOR,
    will: SaveType.GOOD,
  },
  classFeatures: [],
  levels: [
    {
      level: 1,
      classFeatures: [
        {
          name: 'Wizard Spellcasting',
          description: 'Vancian arcane spellcasting with spellbook',
          featureType: featureTypes.CLASS_FEATURE,
          uniqueId: 'wizard-spellcasting',
          changes: [],
          specialChanges: [wizardCGEDefinition],
        },
      ],
    },
  ],
  spellCasting: true,
  spellCastingAbilityUniqueId: "intelligence",
  allSpellsKnown: false,
};

// ============================================================================
// TABLAS DE SORCERER
// ============================================================================

export const SORCERER_SLOTS_TABLE: LevelTable = {
  1: [5, 3, 0, 0, 0, 0, 0, 0, 0, 0],
  2: [6, 4, 0, 0, 0, 0, 0, 0, 0, 0],
  3: [6, 5, 0, 0, 0, 0, 0, 0, 0, 0],
  4: [6, 6, 3, 0, 0, 0, 0, 0, 0, 0],
  5: [6, 6, 4, 0, 0, 0, 0, 0, 0, 0],
};

export const SORCERER_KNOWN_TABLE: LevelTable = {
  1: [4, 2, 0, 0, 0, 0, 0, 0, 0, 0],
  2: [5, 2, 0, 0, 0, 0, 0, 0, 0, 0],
  3: [5, 3, 0, 0, 0, 0, 0, 0, 0, 0],
  4: [6, 3, 1, 0, 0, 0, 0, 0, 0, 0],
  5: [6, 4, 2, 0, 0, 0, 0, 0, 0, 0],
};

// ============================================================================
// CGE CONFIG DE SORCERER
// ============================================================================

export const sorcererCGEConfig: CGEConfig = {
  id: 'sorcerer-spells',
  classId: 'sorcerer',
  entityType: 'spell',
  levelPath: '@entity.levels.sorcerer',

  accessFilter: {
    field: 'lists',
    operator: 'contains',
    value: 'sorcerer',
  },

  known: {
    type: 'LIMITED_PER_ENTITY_LEVEL',
    table: SORCERER_KNOWN_TABLE,
  },

  tracks: [
    {
      id: 'base',
      resource: {
        type: 'SLOTS',
        table: SORCERER_SLOTS_TABLE,
        bonusVariable: '@bonusSpells',
        refresh: 'daily',
      },
      preparation: { type: 'NONE' },
    },
  ],

  variables: {
    classPrefix: 'sorcerer.spell',
    genericPrefix: 'spell',
    casterLevelVar: 'castingClassLevel.sorcerer',
  },

  labels: {
    known: 'known_spells',
    action: 'cast',
  },
};

// ============================================================================
// SPECIAL CHANGE CGE_DEFINITION
// ============================================================================

export const sorcererCGEDefinition: CGEDefinitionChange = {
  type: 'CGE_DEFINITION',
  config: sorcererCGEConfig,
};

// ============================================================================
// CLASE SORCERER SIMPLIFICADA PARA TESTS
// ============================================================================

export const sorcerer: CharacterClass = {
  name: "Sorcerer",
  uniqueId: "sorcerer",
  hitDie: 4,
  baseAttackBonusProgression: BabType.POOR,
  baseSavesProgression: {
    fortitude: SaveType.POOR,
    reflex: SaveType.POOR,
    will: SaveType.GOOD,
  },
  classFeatures: [],
  levels: [
    {
      level: 1,
      classFeatures: [
        {
          name: 'Sorcerer Spellcasting',
          description: 'Spontaneous arcane spellcasting',
          featureType: featureTypes.CLASS_FEATURE,
          uniqueId: 'sorcerer-spellcasting',
          changes: [],
          specialChanges: [sorcererCGEDefinition],
        },
      ],
    },
  ],
  spellCasting: true,
  spellCastingAbilityUniqueId: "charisma",
  allSpellsKnown: false,
};

// ============================================================================
// ABILITY SCORES PARA TESTS
// ============================================================================

export const standardAbilityScores = {
  strength: 10,
  dexterity: 14,
  constitution: 12,
  intelligence: 10,
  wisdom: 10,
  charisma: 16, // +3 modifier para bonus spells
};

// ============================================================================
// BUILDER HELPERS
// ============================================================================

export function createBaseSorcerer(level: number = 1) {
  return buildCharacter()
    .withName("Test Sorcerer")
    .withBaseAbilityScores(standardAbilityScores)
    .withClassLevels(sorcerer, level);
}

export function createBaseWizard(level: number = 1) {
  return buildCharacter()
    .withName("Test Wizard")
    .withBaseAbilityScores({
      ...standardAbilityScores,
      intelligence: 16, // +3 modifier para bonus spells
      charisma: 10,
    })
    .withClassLevels(wizard, level);
}

import { BabType } from "../../../../class/baseAttackBonus";
import { CharacterClass } from "../../../../class/class";
import { SaveType } from "../../../../class/saves";
import { CGEDefinitionChange } from "../../../baseData/specialChanges";
import { buildCharacter } from "../../../../../tests/character/buildCharacter";
import { CGEConfig, LevelTable } from "../../../../cge/types";
import { featureTypes } from "../../../baseData/features/feature";

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

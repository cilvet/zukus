import { describe, it, expect } from 'bun:test';
import { buildCharacter } from '../../../../../tests/character/buildCharacter';
import { BabType } from '../../../../class/baseAttackBonus';
import { SaveType } from '../../../../class/saves';
import { CharacterClass } from '../../../../class/class';
import { featureTypes } from '../../../baseData/features/feature';
import { CGEConfig, LevelTable } from '../../../../cge/types';
import { CGEDefinitionChange, CustomVariableDefinitionChange } from '../../../baseData/specialChanges';

// ============================================================================
// PSION CON RESOURCE POOL
// ============================================================================

const PSION_KNOWN_TABLE: LevelTable = {
  1: [3, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  2: [5, 2, 0, 0, 0, 0, 0, 0, 0, 0],
  3: [5, 2, 1, 0, 0, 0, 0, 0, 0, 0],
  4: [6, 3, 2, 0, 0, 0, 0, 0, 0, 0],
  5: [6, 3, 2, 1, 0, 0, 0, 0, 0, 0],
};

const psionCGEConfigWithResources: CGEConfig = {
  id: 'psion-powers',
  classId: 'psion',
  entityType: 'power',
  levelPath: '@entity.level',

  // El CGE DEFINE el recurso de Power Points
  resources: [
    {
      resourceId: 'psion-power-points',
      name: 'Power Points',
      // PP base (escala con nivel) + INT modifier * nivel
      maxValueFormula: { expression: '@customVariable.psion.powerPoints.base + @ability.intelligence.modifier * @class.psion.level' },
      rechargeFormula: { expression: '@resources.psion-power-points.max' },
    },
  ],

  known: {
    type: 'LIMITED_PER_ENTITY_LEVEL',
    table: PSION_KNOWN_TABLE,
  },

  tracks: [
    {
      id: 'base',
      resource: {
        type: 'POOL',
        resourceId: 'psion-power-points',
        costPath: '@entity.level',
        refresh: 'daily',
      },
      preparation: { type: 'NONE' },
    },
  ],

  variables: {
    classPrefix: 'psion.power',
    genericPrefix: 'power',
    casterLevelVar: 'manifesterLevel.psion',
  },

  labels: {
    known: 'known_powers',
    pool: 'power_points',
    action: 'manifest',
  },
};

const psionCGEDefinition: CGEDefinitionChange = {
  type: 'CGE_DEFINITION',
  config: psionCGEConfigWithResources,
};

const ppBaseDefinition: CustomVariableDefinitionChange = {
  type: 'CUSTOM_VARIABLE_DEFINITION',
  variableId: 'psion.powerPoints.base',
  name: 'Base Power Points',
  baseSources: [],
};

// Clase Psion simplificada - PP base escala con nivel de clase
const psion: CharacterClass = {
  name: 'Psion',
  uniqueId: 'psion',
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
          name: 'Psionics',
          description: 'Psionic power manifestation using power points',
          featureType: featureTypes.CLASS_FEATURE,
          uniqueId: 'psion-psionics',
          changes: [
            // PP base = nivel * 2 (simplificado para tests)
            {
              type: 'CUSTOM_VARIABLE',
              uniqueId: 'psion.powerPoints.base',
              formula: { expression: '@class.psion.level * 2' },
              bonusTypeId: 'BASE',
              name: 'Psion Base PP',
            },
          ],
          specialChanges: [
            ppBaseDefinition,
            psionCGEDefinition,
          ],
        },
      ],
    },
  ],
  spellCasting: false,
  spellCastingAbilityUniqueId: 'intelligence',
  allSpellsKnown: false,
};

function createPsionSheet(level: number = 1) {
  return buildCharacter()
    .withName('Test Psion')
    .withBaseAbilityScores({
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 16, // +3 modifier
      wisdom: 10,
      charisma: 10,
    })
    .withClassLevels(psion, level)
    .buildCharacterSheet();
}

// ============================================================================
// TESTS
// ============================================================================

describe('CGE Pool Resource', () => {
  describe('basic pool calculation', () => {
    it('should calculate pool max from defined resource', () => {
      const sheet = createPsionSheet(1);

      const cge = sheet.cge?.['psion-powers'];
      expect(cge).toBeDefined();

      const track = cge?.tracks[0];
      expect(track?.resourceType).toBe('POOL');
      expect(track?.pool).toBeDefined();

      // PP nivel 1 = (1*2) base + (3 INT mod * 1 nivel) = 5
      expect(track?.pool?.max).toBe(5);
      expect(track?.pool?.current).toBe(5);
    });

    it('should scale pool with level', () => {
      const sheet = createPsionSheet(3);

      const cge = sheet.cge?.['psion-powers'];
      const track = cge?.tracks[0];

      // PP nivel 3 = (3*2) base + (3 INT mod * 3 nivel) = 6 + 9 = 15
      expect(track?.pool?.max).toBe(15);
      expect(track?.pool?.current).toBe(15);
    });
  });

  describe('resource definition in CGE', () => {
    it('should register the resource in the character sheet', () => {
      const sheet = createPsionSheet(1);

      const resource = sheet.resources?.['psion-power-points'];
      expect(resource).toBeDefined();
      expect(resource?.maxValue).toBe(5);
    });

    it('should sync pool values with resource', () => {
      const sheet = createPsionSheet(1);

      const cge = sheet.cge?.['psion-powers'];
      const track = cge?.tracks[0];
      const resource = sheet.resources?.['psion-power-points'];

      // El pool del CGE lee desde el recurso
      expect(track?.pool?.max).toBe(resource?.maxValue);
    });
  });
});

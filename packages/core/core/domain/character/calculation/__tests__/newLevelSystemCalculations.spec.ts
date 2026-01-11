import { describe, it, expect } from 'bun:test';
import { calculateCharacterSheet } from '../calculateCharacterSheet';
import { buildCharacter } from '../../../../tests';
import type { CharacterBaseData } from '../../baseData/character';
import type { ClassEntity, LevelSlot } from '../../../levels/storage/types';

// =============================================================================
// Test Helpers
// =============================================================================

/**
 * Creates a character with the new level system.
 * IMPORTANT: Sets level.level based on the number of assigned levelSlots.
 */
function createNewSystemCharacter(
  classEntities: Record<string, ClassEntity>,
  levelSlots: LevelSlot[]
): CharacterBaseData {
  const baseCharacter = buildCharacter().build();
  const currentLevel = levelSlots.filter(slot => slot.classId !== null).length;
  
  return {
    ...baseCharacter,
    level: {
      ...baseCharacter.level,
      level: currentLevel,
    },
    classEntities,
    levelSlots,
    entities: {},
  };
}

/**
 * Creates a character with the new level system and custom ability scores.
 */
function createNewSystemCharacterWithAbilities(
  classEntities: Record<string, ClassEntity>,
  levelSlots: LevelSlot[],
  abilities: Partial<Record<'strength' | 'dexterity' | 'constitution' | 'intelligence' | 'wisdom' | 'charisma', number>>
): CharacterBaseData {
  let builder = buildCharacter();
  
  for (const [ability, score] of Object.entries(abilities)) {
    builder = builder.withBaseAbilityScore(ability as any, score);
  }
  
  const baseCharacter = builder.build();
  const currentLevel = levelSlots.filter(slot => slot.classId !== null).length;
  
  return {
    ...baseCharacter,
    level: {
      ...baseCharacter.level,
      level: currentLevel,
    },
    classEntities,
    levelSlots,
    entities: {},
  };
}

function createFighterClass(): ClassEntity {
  return {
    id: 'fighter',
    entityType: 'class',
    name: 'Fighter',
    description: 'A martial warrior',
    hitDie: 10,
    babProgression: 'full',
    saves: {
      fortitude: 'good',
      reflex: 'poor',
      will: 'poor',
    },
    skillPointsPerLevel: '2',
    classSkillIds: ['climb', 'jump'],
    classType: 'base',
    levels: {},
  };
}

function createRogueClass(): ClassEntity {
  return {
    id: 'rogue',
    entityType: 'class',
    name: 'Rogue',
    description: 'A sneaky character',
    hitDie: 6,
    babProgression: 'medium',
    saves: {
      fortitude: 'poor',
      reflex: 'good',
      will: 'poor',
    },
    skillPointsPerLevel: '8',
    classSkillIds: ['hide', 'move_silently'],
    classType: 'base',
    levels: {},
  };
}

function createWizardClass(): ClassEntity {
  return {
    id: 'wizard',
    entityType: 'class',
    name: 'Wizard',
    description: 'An arcane spellcaster',
    hitDie: 4,
    babProgression: 'poor',
    saves: {
      fortitude: 'poor',
      reflex: 'poor',
      will: 'good',
    },
    skillPointsPerLevel: '2',
    classSkillIds: ['spellcraft', 'knowledge_arcana'],
    classType: 'base',
    levels: {},
  };
}

// =============================================================================
// Tests for New Level System Calculations
// =============================================================================

describe('New Level System Calculations', () => {
  describe('Hit Points calculation', () => {
    it('should calculate HP from levelSlots for single class', () => {
      const character = createNewSystemCharacter(
        { fighter: createFighterClass() },
        [
          { classId: 'fighter', hpRoll: 10 }, // Level 1: max roll
          { classId: 'fighter', hpRoll: 6 },  // Level 2
          { classId: 'fighter', hpRoll: 8 },  // Level 3
        ]
      );

      const sheet = calculateCharacterSheet(character);

      // Total HP = rolled dice (10+6+8) + CON modifier * levels (0 * 3)
      expect(sheet.hitPoints.maxHp).toBe(24);
    });

    it('should calculate HP from levelSlots for multiclass', () => {
      const character = createNewSystemCharacter(
        {
          fighter: createFighterClass(),
          rogue: createRogueClass(),
        },
        [
          { classId: 'fighter', hpRoll: 10 }, // Fighter 1
          { classId: 'fighter', hpRoll: 6 },  // Fighter 2
          { classId: 'rogue', hpRoll: 4 },    // Rogue 1
        ]
      );

      const sheet = calculateCharacterSheet(character);

      // Total HP = rolled dice (10+6+4) + CON modifier * levels (0 * 3)
      expect(sheet.hitPoints.maxHp).toBe(20);
    });

    it('should calculate HP with CON modifier', () => {
      const character = createNewSystemCharacterWithAbilities(
        { fighter: createFighterClass() },
        [
          { classId: 'fighter', hpRoll: 10 },
          { classId: 'fighter', hpRoll: 6 },
        ],
        { constitution: 14 } // +2 modifier
      );

      const sheet = calculateCharacterSheet(character);

      // Total HP = rolled dice (10+6) + CON modifier * levels (2 * 2)
      expect(sheet.hitPoints.maxHp).toBe(20);
    });
  });

  describe('Base Attack Bonus calculation', () => {
    it('should calculate BAB for fighter (full progression)', () => {
      const character = createNewSystemCharacter(
        { fighter: createFighterClass() },
        [
          { classId: 'fighter', hpRoll: 10 },
          { classId: 'fighter', hpRoll: 6 },
          { classId: 'fighter', hpRoll: 8 },
          { classId: 'fighter', hpRoll: 7 },
          { classId: 'fighter', hpRoll: 9 },
        ]
      );

      const sheet = calculateCharacterSheet(character);

      // Fighter 5: full BAB = +5
      expect(sheet.baseAttackBonus.totalValue).toBe(5);
    });

    it('should calculate BAB for rogue (medium progression)', () => {
      const character = createNewSystemCharacter(
        { rogue: createRogueClass() },
        [
          { classId: 'rogue', hpRoll: 6 },
          { classId: 'rogue', hpRoll: 4 },
          { classId: 'rogue', hpRoll: 5 },
          { classId: 'rogue', hpRoll: 3 },
        ]
      );

      const sheet = calculateCharacterSheet(character);

      // Rogue 4: 3/4 BAB = floor(4 * 3/4) = 3
      expect(sheet.baseAttackBonus.totalValue).toBe(3);
    });

    it('should calculate BAB for wizard (poor progression)', () => {
      const character = createNewSystemCharacter(
        { wizard: createWizardClass() },
        [
          { classId: 'wizard', hpRoll: 4 },
          { classId: 'wizard', hpRoll: 2 },
          { classId: 'wizard', hpRoll: 3 },
          { classId: 'wizard', hpRoll: 2 },
        ]
      );

      const sheet = calculateCharacterSheet(character);

      // Wizard 4: 1/2 BAB = floor(4/2) = 2
      expect(sheet.baseAttackBonus.totalValue).toBe(2);
    });

    it('should calculate BAB for multiclass', () => {
      const character = createNewSystemCharacter(
        {
          fighter: createFighterClass(),
          rogue: createRogueClass(),
        },
        [
          { classId: 'fighter', hpRoll: 10 }, // Fighter 1: +1
          { classId: 'fighter', hpRoll: 6 },  // Fighter 2: +2
          { classId: 'rogue', hpRoll: 4 },    // Rogue 1: +0
          { classId: 'rogue', hpRoll: 3 },    // Rogue 2: +1
        ]
      );

      const sheet = calculateCharacterSheet(character);

      // Fighter 2 (+2) + Rogue 2 (floor(2*3/4)=1) = +3
      expect(sheet.baseAttackBonus.totalValue).toBe(3);
    });
  });

  describe('Saving Throws calculation', () => {
    it('should calculate good/poor saves for fighter', () => {
      const character = createNewSystemCharacter(
        { fighter: createFighterClass() },
        [
          { classId: 'fighter', hpRoll: 10 },
          { classId: 'fighter', hpRoll: 6 },
          { classId: 'fighter', hpRoll: 8 },
        ]
      );

      const sheet = calculateCharacterSheet(character);

      // Fighter 3: Fort (good) = +3, Ref (poor) = +1, Will (poor) = +1
      expect(sheet.savingThrows.fortitude.totalValue).toBe(3);
      expect(sheet.savingThrows.reflex.totalValue).toBe(1);
      expect(sheet.savingThrows.will.totalValue).toBe(1);
    });

    it('should calculate good/poor saves for rogue', () => {
      const character = createNewSystemCharacter(
        { rogue: createRogueClass() },
        [
          { classId: 'rogue', hpRoll: 6 },
          { classId: 'rogue', hpRoll: 4 },
          { classId: 'rogue', hpRoll: 5 },
        ]
      );

      const sheet = calculateCharacterSheet(character);

      // Rogue 3: Fort (poor) = +1, Ref (good) = +3, Will (poor) = +1
      expect(sheet.savingThrows.fortitude.totalValue).toBe(1);
      expect(sheet.savingThrows.reflex.totalValue).toBe(3);
      expect(sheet.savingThrows.will.totalValue).toBe(1);
    });

    it('should calculate saves for multiclass', () => {
      const character = createNewSystemCharacter(
        {
          fighter: createFighterClass(),
          wizard: createWizardClass(),
        },
        [
          { classId: 'fighter', hpRoll: 10 }, // Fighter 1
          { classId: 'wizard', hpRoll: 4 },   // Wizard 1
        ]
      );

      const sheet = calculateCharacterSheet(character);

      // Fighter 1: Fort +2 (good), Ref +0 (poor), Will +0 (poor)
      // Wizard 1: Fort +0 (poor), Ref +0 (poor), Will +2 (good)
      // Total: Fort +2, Ref +0, Will +2
      expect(sheet.savingThrows.fortitude.totalValue).toBe(2);
      expect(sheet.savingThrows.reflex.totalValue).toBe(0);
      expect(sheet.savingThrows.will.totalValue).toBe(2);
    });

    it('should include ability modifiers in saves', () => {
      const character = createNewSystemCharacterWithAbilities(
        { fighter: createFighterClass() },
        [
          { classId: 'fighter', hpRoll: 10 },
        ],
        {
          constitution: 14, // +2
          dexterity: 16,    // +3
          wisdom: 12,       // +1
        }
      );

      const sheet = calculateCharacterSheet(character);

      // Fighter 1: Fort +2 (good) + 2 (CON) = +4
      // Ref +0 (poor) + 3 (DEX) = +3
      // Will +0 (poor) + 1 (WIS) = +1
      expect(sheet.savingThrows.fortitude.totalValue).toBe(4);
      expect(sheet.savingThrows.reflex.totalValue).toBe(3);
      expect(sheet.savingThrows.will.totalValue).toBe(1);
    });
  });

  describe('Character Level calculation', () => {
    it('should use level.level as source of truth', () => {
      const character = createNewSystemCharacter(
        { fighter: createFighterClass() },
        [
          { classId: 'fighter', hpRoll: 10 },
          { classId: 'fighter', hpRoll: 6 },
          { classId: 'fighter', hpRoll: 8 },
        ]
      );

      const sheet = calculateCharacterSheet(character);

      expect(sheet.level.level).toBe(3);
    });

    it('should only calculate up to currentLevel even with more slots', () => {
      // Character has 3 level slots but level.level is set to 2
      const baseCharacter = buildCharacter().build();
      const character: CharacterBaseData = {
        ...baseCharacter,
        level: {
          ...baseCharacter.level,
          level: 2, // Only process first 2 slots
        },
        classEntities: {
          fighter: createFighterClass(),
        },
        levelSlots: [
          { classId: 'fighter', hpRoll: 10 }, // Will be counted
          { classId: 'fighter', hpRoll: 6 },  // Will be counted
          { classId: 'fighter', hpRoll: 8 },  // Will NOT be counted
        ],
        entities: {},
      };

      const sheet = calculateCharacterSheet(character);

      // Only 2 levels counted
      expect(sheet.level.level).toBe(2);
      // HP = 10 + 6 (not +8 from third level)
      expect(sheet.hitPoints.maxHp).toBe(16);
      // BAB = 2 (fighter 2, not 3)
      expect(sheet.baseAttackBonus.totalValue).toBe(2);
    });
  });

  describe('Legacy system compatibility', () => {
    it('should use legacy system when useLegacyLevelSystem is true', () => {
      // This test uses the legacy system via buildCharacter
      const character = buildCharacter()
        .withClassLevels(require('../../../../../srd/classes').fighter, 3)
        .build();
      
      // Force legacy mode even if levelSlots exist
      character.useLegacyLevelSystem = true;
      character.levelSlots = [
        { classId: 'fighter', hpRoll: 1 }, // These should be ignored
      ];

      const sheet = calculateCharacterSheet(character);

      // Should use legacy levelsData, not levelSlots
      // Fighter 3 with average rolls from buildCharacter
      expect(sheet.level.level).toBe(3);
    });

    it('should use legacy system when no new system data exists', () => {
      const character = buildCharacter()
        .withClassLevels(require('../../../../../srd/classes').fighter, 2)
        .build();

      const sheet = calculateCharacterSheet(character);

      // Fighter 2: full BAB = +2
      expect(sheet.baseAttackBonus.totalValue).toBe(2);
      // Fighter 2: Fort (good) = +3
      expect(sheet.savingThrows.fortitude.totalValue).toBe(3);
    });
  });
});


import { describe, expect, it } from 'bun:test';
import { z } from 'zod';
import { createEntitySchemaWithAddons } from '../../entities/createEntitySchemaWithAddons';
import { defaultAddonRegistry } from '../../entities/defaultAddons';
import {
  classSchemaDefinition,
  classLevelSchemaDefinition,
  classFeatureSchemaDefinition,
} from '../../classSchemas/classSchemas';

describe('Class Schema', () => {
  const classSchema = createEntitySchemaWithAddons(classSchemaDefinition, defaultAddonRegistry);

  describe('valid class entities', () => {
    it('validates a complete base class', () => {
      const fighter = {
        id: 'fighter',
        entityType: 'class',
        name: 'Fighter',
        description: 'A master of martial combat.',
        hitDie: 10,
        babProgression: 'full',
        saves: {
          fortitude: 'good',
          reflex: 'poor',
          will: 'poor',
        },
        classType: 'base',
        skillPointsPerLevel: 2,
        classSkillIds: ['climb', 'jump', 'swim'],
        levelIds: ['fighter-1', 'fighter-2'],
      };

      const result = classSchema.safeParse(fighter);

      expect(result.success).toBe(true);
    });

    it('validates a prestige class', () => {
      const assassin = {
        id: 'assassin',
        entityType: 'class',
        name: 'Assassin',
        description: 'A killer for hire.',
        hitDie: 6,
        babProgression: 'medium',
        saves: {
          fortitude: 'poor',
          reflex: 'good',
          will: 'poor',
        },
        classType: 'prestige',
        skillPointsPerLevel: 4,
        classSkillIds: ['hide', 'move-silently'],
        levelIds: ['assassin-1'],
      };

      const result = classSchema.safeParse(assassin);

      expect(result.success).toBe(true);
    });

    it('allows optional classSkillIds and levelIds', () => {
      const minimalClass = {
        id: 'custom-class',
        entityType: 'class',
        name: 'Custom Class',
        hitDie: 8,
        babProgression: 'medium',
        saves: {
          fortitude: 'good',
          reflex: 'poor',
          will: 'good',
        },
        classType: 'base',
        skillPointsPerLevel: 4,
      };

      const result = classSchema.safeParse(minimalClass);

      expect(result.success).toBe(true);
    });
  });

  describe('invalid class entities', () => {
    it('rejects invalid hitDie value', () => {
      const invalidClass = {
        id: 'bad-class',
        entityType: 'class',
        name: 'Bad Class',
        hitDie: 7, // Not a valid hit die
        babProgression: 'full',
        saves: { fortitude: 'good', reflex: 'poor', will: 'poor' },
        classType: 'base',
        skillPointsPerLevel: 2,
      };

      const result = classSchema.safeParse(invalidClass);

      expect(result.success).toBe(false);
    });

    it('rejects invalid babProgression', () => {
      const invalidClass = {
        id: 'bad-class',
        entityType: 'class',
        name: 'Bad Class',
        hitDie: 10,
        babProgression: 'excellent', // Not valid
        saves: { fortitude: 'good', reflex: 'poor', will: 'poor' },
        classType: 'base',
        skillPointsPerLevel: 2,
      };

      const result = classSchema.safeParse(invalidClass);

      expect(result.success).toBe(false);
    });

    it('rejects invalid save progression', () => {
      const invalidClass = {
        id: 'bad-class',
        entityType: 'class',
        name: 'Bad Class',
        hitDie: 10,
        babProgression: 'full',
        saves: { fortitude: 'excellent', reflex: 'poor', will: 'poor' }, // Not valid
        classType: 'base',
        skillPointsPerLevel: 2,
      };

      const result = classSchema.safeParse(invalidClass);

      expect(result.success).toBe(false);
    });

    it('rejects missing required fields', () => {
      const incompleteClass = {
        id: 'incomplete',
        entityType: 'class',
        name: 'Incomplete',
        // Missing hitDie, babProgression, saves, classType, skillPointsPerLevel
      };

      const result = classSchema.safeParse(incompleteClass);

      expect(result.success).toBe(false);
    });
  });
});

describe('ClassLevel Schema', () => {
  const classLevelSchema = createEntitySchemaWithAddons(
    classLevelSchemaDefinition,
    defaultAddonRegistry
  );

  describe('valid classLevel entities', () => {
    it('validates a level with granted provider', () => {
      const rogueLevel1 = {
        id: 'rogue-1',
        entityType: 'classLevel',
        name: 'Rogue Level 1',
        classId: 'rogue',
        level: 1,
        providers: [
          {
            granted: {
              specificIds: ['sneak-attack-1d6', 'trapfinding'],
            },
          },
        ],
      };

      const result = classLevelSchema.safeParse(rogueLevel1);

      expect(result.success).toBe(true);
    });

    it('validates a level with selector provider', () => {
      const rogueLevel2 = {
        id: 'rogue-2',
        entityType: 'classLevel',
        name: 'Rogue Level 2',
        classId: 'rogue',
        level: 2,
        providers: [
          {
            selector: {
              id: 'rogue-talent-2',
              name: 'Rogue Talent',
              entityType: 'rogueTalent',
              min: 1,
              max: 1,
            },
          },
        ],
      };

      const result = classLevelSchema.safeParse(rogueLevel2);

      expect(result.success).toBe(true);
    });

    it('validates a level with multiple providers', () => {
      const fighterLevel1 = {
        id: 'fighter-1',
        entityType: 'classLevel',
        name: 'Fighter Level 1',
        classId: 'fighter',
        level: 1,
        providers: [
          {
            granted: {
              specificIds: ['martial-weapon-proficiency'],
            },
          },
          {
            selector: {
              id: 'fighter-bonus-feat-1',
              name: 'Bonus Fighter Feat',
              entityType: 'feat',
              min: 1,
              max: 1,
            },
          },
        ],
      };

      const result = classLevelSchema.safeParse(fighterLevel1);

      expect(result.success).toBe(true);
    });

    it('validates a level with empty providers', () => {
      const rogueLevel4 = {
        id: 'rogue-4',
        entityType: 'classLevel',
        name: 'Rogue Level 4',
        classId: 'rogue',
        level: 4,
        providers: [],
      };

      const result = classLevelSchema.safeParse(rogueLevel4);

      expect(result.success).toBe(true);
    });
  });

  describe('invalid classLevel entities', () => {
    it('rejects missing classId', () => {
      const invalidLevel = {
        id: 'bad-level',
        entityType: 'classLevel',
        name: 'Bad Level',
        level: 1,
        providers: [],
      };

      const result = classLevelSchema.safeParse(invalidLevel);

      expect(result.success).toBe(false);
    });

    it('rejects missing level number', () => {
      const invalidLevel = {
        id: 'bad-level',
        entityType: 'classLevel',
        name: 'Bad Level',
        classId: 'rogue',
        providers: [],
      };

      const result = classLevelSchema.safeParse(invalidLevel);

      expect(result.success).toBe(false);
    });
  });
});

describe('ClassFeature Schema', () => {
  const classFeatureSchema = createEntitySchemaWithAddons(
    classFeatureSchemaDefinition,
    defaultAddonRegistry
  );

  describe('valid classFeature entities', () => {
    it('validates a simple feature', () => {
      const trapfinding = {
        id: 'trapfinding',
        entityType: 'classFeature',
        name: 'Trapfinding',
        description: 'Rogues can use the Search skill to locate traps.',
      };

      const result = classFeatureSchema.safeParse(trapfinding);

      expect(result.success).toBe(true);
    });

    it('validates a feature with definesVariables', () => {
      const sneakAttack = {
        id: 'sneak-attack-base',
        entityType: 'classFeature',
        name: 'Sneak Attack',
        description: 'The rogue deals extra damage when flanking.',
        definesVariables: [
          { name: 'sneakAttackDice', value: 1 },
        ],
      };

      const result = classFeatureSchema.safeParse(sneakAttack);

      expect(result.success).toBe(true);
    });

    it('validates a feature with effects (effectful addon)', () => {
      // Note: effects content validation is done separately by the character system
      // Schema only validates that the field exists and is an array
      const evasion = {
        id: 'evasion',
        entityType: 'classFeature',
        name: 'Evasion',
        description: 'Take no damage on successful Reflex save.',
        effects: [], // Empty array is valid
      };

      const result = classFeatureSchema.safeParse(evasion);

      expect(result.success).toBe(true);
    });

    it('validates a feature with suppression', () => {
      // Note: suppression content validation is done separately
      // Schema only validates that the field exists and is an array
      const improvedEvasion = {
        id: 'improved-evasion',
        entityType: 'classFeature',
        name: 'Improved Evasion',
        description: 'Take half damage even on failed Reflex save.',
        suppression: [], // Empty array is valid
      };

      const result = classFeatureSchema.safeParse(improvedEvasion);

      expect(result.success).toBe(true);
    });

    it('validates a feature with providers (providable addon)', () => {
      // Note: providers content validation is done separately by the levels system
      // Schema only validates that the field exists and is an array
      const fighterBonusFeat = {
        id: 'fighter-bonus-feat',
        entityType: 'classFeature',
        name: 'Bonus Feat',
        description: 'Gain an extra fighter feat',
        providers: [], // Empty array is valid
      };

      const result = classFeatureSchema.safeParse(fighterBonusFeat);

      expect(result.success).toBe(true);
    });

    it('validates a feature with variables using formula', () => {
      const sneakAttackScaling = {
        id: 'sneak-attack-scaling',
        entityType: 'classFeature',
        name: 'Sneak Attack',
        description: 'Scales with rogue level.',
        definesVariables: [
          { 
            name: 'sneakAttackDice', 
            formula: { expression: 'ceil(@classLevel.rogue / 2)' },
          },
        ],
      };

      const result = classFeatureSchema.safeParse(sneakAttackScaling);

      expect(result.success).toBe(true);
    });
  });

  describe('invalid classFeature entities', () => {
    it('rejects missing name (required by searchable)', () => {
      const invalidFeature = {
        id: 'no-name',
        entityType: 'classFeature',
        // Missing name
      };

      const result = classFeatureSchema.safeParse(invalidFeature);

      expect(result.success).toBe(false);
    });
  });
});


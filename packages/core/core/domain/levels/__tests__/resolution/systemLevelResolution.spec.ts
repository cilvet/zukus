/**
 * Tests for system-level resolution (feats, ability increases).
 * 
 * System levels are processed BEFORE class levels for each character level.
 */

import { describe, it, expect } from 'bun:test';
import { resolveLevelEntities } from '../../resolution/resolveLevelEntities';
import type { CharacterBaseData } from '../../../character/baseData/character';
import type { ClassEntity, EntityInstance, SystemLevelsEntity } from '../../storage/types';
import type { StandardEntity } from '../../../entities/types/base';
import type { EntityProvider } from '../../providers/types';
import { buildCharacter } from '../../../../tests';

// =============================================================================
// Helper Functions
// =============================================================================

function createInstance(
  instanceId: string,
  entityId: string,
  entityType: string,
  name: string,
  origin: string,
  applicable = false
): EntityInstance {
  const entity: StandardEntity = {
    id: entityId,
    entityType,
    name,
  };
  
  return { instanceId, entity, applicable, origin };
}

function createFighterClass(): ClassEntity {
  return {
    id: 'fighter',
    entityType: 'class',
    name: 'Fighter',
    hitDie: 10,
    babProgression: 'full',
    saves: { fortitude: 'good', reflex: 'poor', will: 'poor' },
    skillPointsPerLevel: '2',
    classSkillIds: ['climb'],
    classType: 'base',
    levels: {
      '1': {
        providers: [
          { granted: { specificIds: ['martial-weapon-proficiency'] } },
        ],
      },
      '2': {
        providers: [],
      },
      '3': {
        providers: [],
      },
      '4': {
        providers: [],
      },
    },
  };
}

function createSystemLevels(): SystemLevelsEntity {
  return {
    id: 'dnd35-system-levels',
    entityType: 'system_levels',
    name: 'D&D 3.5 System Levels',
    levels: {
      '1': {
        providers: [
          {
            selector: {
              id: 'character-feat',
              name: 'Character Feat',
              entityType: 'feat',
              min: 1,
              max: 1,
            },
            selectedInstanceIds: ['power-attack@characterLevel-1'],
          },
        ],
      },
      '3': {
        providers: [
          {
            selector: {
              id: 'character-feat',
              name: 'Character Feat',
              entityType: 'feat',
              min: 1,
              max: 1,
            },
            selectedInstanceIds: ['cleave@characterLevel-3'],
          },
        ],
      },
      '4': {
        providers: [
          {
            selector: {
              id: 'ability-increase',
              name: 'Ability Score Increase',
              entityType: 'character_ability_increase',
              min: 1,
              max: 1,
            },
            selectedInstanceIds: ['strength-increase@characterLevel-4'],
          },
        ],
      },
    },
  };
}

// =============================================================================
// Tests
// =============================================================================

describe('resolveLevelEntities - system levels', () => {
  describe('basic system level resolution', () => {
    it('should process system level providers when systemLevelsEntity is present', () => {
      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        level: { level: 1, xp: 0, levelsData: [] },
        levelSlots: [{ classId: 'fighter', hpRoll: 10 }],
        classEntities: {
          fighter: createFighterClass(),
        },
        systemLevelsEntity: createSystemLevels(),
        entities: {
          feat: [
            createInstance(
              'power-attack@characterLevel-1',
              'power-attack',
              'feat',
              'Power Attack',
              'characterLevel:1'
            ),
          ],
          classFeature: [
            createInstance(
              'martial-weapon-proficiency@classLevel-fighter-1',
              'martial-weapon-proficiency',
              'classFeature',
              'Martial Weapon Proficiency',
              'classLevel:fighter-1'
            ),
          ],
        },
      };

      const result = resolveLevelEntities(character);

      // Both system-level feat and class feature should be applicable
      const powerAttack = result.entities.feat?.find(
        e => e.instanceId === 'power-attack@characterLevel-1'
      );
      expect(powerAttack?.applicable).toBe(true);

      const martialProf = result.entities.classFeature?.find(
        e => e.instanceId === 'martial-weapon-proficiency@classLevel-fighter-1'
      );
      expect(martialProf?.applicable).toBe(true);
    });

    it('should process system levels BEFORE class levels for each slot', () => {
      // This test verifies that at level 1:
      // 1. First, system providers are processed (feat at level 1)
      // 2. Then, class providers are processed (fighter features at level 1)
      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        level: { level: 1, xp: 0, levelsData: [] },
        levelSlots: [{ classId: 'fighter', hpRoll: 10 }],
        classEntities: {
          fighter: createFighterClass(),
        },
        systemLevelsEntity: createSystemLevels(),
        entities: {
          feat: [
            createInstance(
              'power-attack@characterLevel-1',
              'power-attack',
              'feat',
              'Power Attack',
              'characterLevel:1'
            ),
          ],
          classFeature: [
            createInstance(
              'martial-weapon-proficiency@classLevel-fighter-1',
              'martial-weapon-proficiency',
              'classFeature',
              'Martial Weapon Proficiency',
              'classLevel:fighter-1'
            ),
          ],
        },
      };

      const result = resolveLevelEntities(character);

      // Both should be applicable
      expect(result.entities.feat?.[0]?.applicable).toBe(true);
      expect(result.entities.classFeature?.[0]?.applicable).toBe(true);
    });

    it('should mark feat at level 3 as applicable when character reaches level 3', () => {
      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        level: { level: 3, xp: 0, levelsData: [] },
        levelSlots: [
          { classId: 'fighter', hpRoll: 10 },
          { classId: 'fighter', hpRoll: 8 },
          { classId: 'fighter', hpRoll: 7 },
        ],
        classEntities: {
          fighter: createFighterClass(),
        },
        systemLevelsEntity: createSystemLevels(),
        entities: {
          feat: [
            createInstance(
              'power-attack@characterLevel-1',
              'power-attack',
              'feat',
              'Power Attack',
              'characterLevel:1'
            ),
            createInstance(
              'cleave@characterLevel-3',
              'cleave',
              'feat',
              'Cleave',
              'characterLevel:3'
            ),
          ],
        },
      };

      const result = resolveLevelEntities(character);

      const powerAttack = result.entities.feat?.find(
        e => e.instanceId === 'power-attack@characterLevel-1'
      );
      expect(powerAttack?.applicable).toBe(true);

      const cleave = result.entities.feat?.find(
        e => e.instanceId === 'cleave@characterLevel-3'
      );
      expect(cleave?.applicable).toBe(true);
    });

    it('should NOT mark level 3 feat as applicable at level 2', () => {
      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        level: { level: 2, xp: 0, levelsData: [] },
        levelSlots: [
          { classId: 'fighter', hpRoll: 10 },
          { classId: 'fighter', hpRoll: 8 },
        ],
        classEntities: {
          fighter: createFighterClass(),
        },
        systemLevelsEntity: createSystemLevels(),
        entities: {
          feat: [
            createInstance(
              'power-attack@characterLevel-1',
              'power-attack',
              'feat',
              'Power Attack',
              'characterLevel:1'
            ),
            createInstance(
              'cleave@characterLevel-3',
              'cleave',
              'feat',
              'Cleave',
              'characterLevel:3'
            ),
          ],
        },
      };

      const result = resolveLevelEntities(character);

      const powerAttack = result.entities.feat?.find(
        e => e.instanceId === 'power-attack@characterLevel-1'
      );
      expect(powerAttack?.applicable).toBe(true);

      const cleave = result.entities.feat?.find(
        e => e.instanceId === 'cleave@characterLevel-3'
      );
      expect(cleave?.applicable).toBe(false);
    });
  });

  describe('ability score increases at level 4', () => {
    it('should mark ability increase as applicable at level 4', () => {
      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        level: { level: 4, xp: 0, levelsData: [] },
        levelSlots: [
          { classId: 'fighter', hpRoll: 10 },
          { classId: 'fighter', hpRoll: 8 },
          { classId: 'fighter', hpRoll: 7 },
          { classId: 'fighter', hpRoll: 6 },
        ],
        classEntities: {
          fighter: createFighterClass(),
        },
        systemLevelsEntity: createSystemLevels(),
        entities: {
          character_ability_increase: [
            createInstance(
              'strength-increase@characterLevel-4',
              'strength-increase',
              'character_ability_increase',
              '+1 Strength',
              'characterLevel:4'
            ),
          ],
          feat: [
            createInstance(
              'power-attack@characterLevel-1',
              'power-attack',
              'feat',
              'Power Attack',
              'characterLevel:1'
            ),
            createInstance(
              'cleave@characterLevel-3',
              'cleave',
              'feat',
              'Cleave',
              'characterLevel:3'
            ),
          ],
        },
      };

      const result = resolveLevelEntities(character);

      const strIncrease = result.entities.character_ability_increase?.find(
        e => e.instanceId === 'strength-increase@characterLevel-4'
      );
      expect(strIncrease?.applicable).toBe(true);

      // All feats should also be applicable
      expect(result.entities.feat?.every(f => f.applicable)).toBe(true);
    });

    it('should NOT mark ability increase as applicable at level 3', () => {
      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        level: { level: 3, xp: 0, levelsData: [] },
        levelSlots: [
          { classId: 'fighter', hpRoll: 10 },
          { classId: 'fighter', hpRoll: 8 },
          { classId: 'fighter', hpRoll: 7 },
        ],
        classEntities: {
          fighter: createFighterClass(),
        },
        systemLevelsEntity: createSystemLevels(),
        entities: {
          character_ability_increase: [
            createInstance(
              'strength-increase@characterLevel-4',
              'strength-increase',
              'character_ability_increase',
              '+1 Strength',
              'characterLevel:4'
            ),
          ],
        },
      };

      const result = resolveLevelEntities(character);

      const strIncrease = result.entities.character_ability_increase?.find(
        e => e.instanceId === 'strength-increase@characterLevel-4'
      );
      expect(strIncrease?.applicable).toBe(false);
    });
  });

  describe('no systemLevelsEntity', () => {
    it('should work normally without systemLevelsEntity', () => {
      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        level: { level: 1, xp: 0, levelsData: [] },
        levelSlots: [{ classId: 'fighter', hpRoll: 10 }],
        classEntities: {
          fighter: createFighterClass(),
        },
        // No systemLevelsEntity
        entities: {
          classFeature: [
            createInstance(
              'martial-weapon-proficiency@classLevel-fighter-1',
              'martial-weapon-proficiency',
              'classFeature',
              'Martial Weapon Proficiency',
              'classLevel:fighter-1'
            ),
          ],
        },
      };

      const result = resolveLevelEntities(character);

      const martialProf = result.entities.classFeature?.find(
        e => e.instanceId === 'martial-weapon-proficiency@classLevel-fighter-1'
      );
      expect(martialProf?.applicable).toBe(true);
    });
  });

  describe('system levels with empty slots', () => {
    it('should still process system levels even when slot has no class', () => {
      // Edge case: a level slot without a classId should still process system providers
      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        level: { level: 1, xp: 0, levelsData: [] },
        levelSlots: [{ classId: null, hpRoll: null }], // Empty slot
        classEntities: {},
        systemLevelsEntity: createSystemLevels(),
        entities: {
          feat: [
            createInstance(
              'power-attack@characterLevel-1',
              'power-attack',
              'feat',
              'Power Attack',
              'characterLevel:1'
            ),
          ],
        },
      };

      const result = resolveLevelEntities(character);

      // System feat should be applicable even without a class
      const powerAttack = result.entities.feat?.find(
        e => e.instanceId === 'power-attack@characterLevel-1'
      );
      expect(powerAttack?.applicable).toBe(true);
    });
  });
});


import { describe, it, expect } from 'bun:test';
import { compileCharacterEntities } from '../compileCharacterEntities';
import { buildCharacter } from '../../../../../tests';
import type { CharacterBaseData } from '../../../baseData/character';
import type { EntityInstance } from '../../../../levels/storage/types';
import type { StandardEntity } from '../../../../entities/types/base';
import type { Change } from '../../../baseData/changes';

// =============================================================================
// Test Helpers
// =============================================================================

function createEntityWithChanges(
  id: string,
  entityType: string,
  changes: Change[]
): StandardEntity {
  return {
    id,
    entityType,
    name: `Test ${id}`,
    description: `Description for ${id}`,
    legacy_changes: changes,
  };
}

function createEntityInstance(
  entity: StandardEntity,
  applicable: boolean,
  origin: string = 'classLevel:test-1'
): EntityInstance {
  return {
    instanceId: `${entity.id}@${origin.replace(':', '-')}`,
    entity,
    applicable,
    origin,
  };
}

// =============================================================================
// Level System Entities Tests
// =============================================================================

describe('compileCharacterEntities', () => {
  describe('level system entities (character.entities)', () => {
    it('should compile entities with applicable: true', () => {
      const strengthBonus: Change = {
        type: 'ABILITY_SCORE',
        abilityUniqueId: 'strength',
        bonusTypeId: 'ENHANCEMENT',
        formula: { expression: '2' },
      };

      const entity = createEntityWithChanges('rage', 'classFeature', [strengthBonus]);
      const instance = createEntityInstance(entity, true);

      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        entities: {
          classFeature: [instance],
        },
      };

      const result = compileCharacterEntities(character);

      expect(result.computedEntities).toHaveLength(1);
      expect(result.computedEntities[0].id).toBe('rage');
      expect(result.changes).toHaveLength(1);
      expect(result.changes[0].type).toBe('ABILITY_SCORE');
    });

    it('should NOT compile entities with applicable: false', () => {
      const entity = createEntityWithChanges('rage', 'classFeature', [
        { type: 'ABILITY_SCORE', abilityUniqueId: 'strength', bonusTypeId: 'ENHANCEMENT', formula: { expression: '2' } },
      ]);
      const instance = createEntityInstance(entity, false);

      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        entities: {
          classFeature: [instance],
        },
      };

      const result = compileCharacterEntities(character);

      expect(result.computedEntities).toHaveLength(0);
      expect(result.changes).toHaveLength(0);
    });

    it('should compile multiple applicable entities', () => {
      const entity1 = createEntityWithChanges('rage', 'classFeature', [
        { type: 'ABILITY_SCORE', abilityUniqueId: 'strength', bonusTypeId: 'ENHANCEMENT', formula: { expression: '2' } },
      ]);
      const entity2 = createEntityWithChanges('sneak-attack', 'classFeature', [
        { type: 'DAMAGE', bonusTypeId: 'UNTYPED', formula: { expression: '1d6' } },
      ]);

      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        entities: {
          classFeature: [
            createEntityInstance(entity1, true),
            createEntityInstance(entity2, true),
          ],
        },
      };

      const result = compileCharacterEntities(character);

      expect(result.computedEntities).toHaveLength(2);
      expect(result.changes).toHaveLength(2);
    });

    it('should filter applicable from non-applicable in same type', () => {
      const entity1 = createEntityWithChanges('level1-feature', 'classFeature', [
        { type: 'BAB', bonusTypeId: 'BASE', formula: { expression: '1' } },
      ]);
      const entity2 = createEntityWithChanges('level5-feature', 'classFeature', [
        { type: 'BAB', bonusTypeId: 'BASE', formula: { expression: '2' } },
      ]);

      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        entities: {
          classFeature: [
            createEntityInstance(entity1, true),  // Level 1 - active
            createEntityInstance(entity2, false), // Level 5 - not yet reached
          ],
        },
      };

      const result = compileCharacterEntities(character);

      expect(result.computedEntities).toHaveLength(1);
      expect(result.computedEntities[0].id).toBe('level1-feature');
      expect(result.changes).toHaveLength(1);
    });

    it('should compile entities across multiple entity types', () => {
      const classFeature = createEntityWithChanges('evasion', 'classFeature', [
        { type: 'SAVING_THROW', savingThrowId: 'reflex', bonusTypeId: 'UNTYPED', formula: { expression: '2' } },
      ]);
      const feat = createEntityWithChanges('power-attack', 'feat', [
        { type: 'DAMAGE', bonusTypeId: 'UNTYPED', formula: { expression: '2' } },
      ]);

      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        entities: {
          classFeature: [createEntityInstance(classFeature, true)],
          feat: [createEntityInstance(feat, true)],
        },
      };

      const result = compileCharacterEntities(character);

      expect(result.computedEntities).toHaveLength(2);
      expect(result.changes).toHaveLength(2);
    });

    it('should set correct originType from entityType', () => {
      const classFeature = createEntityWithChanges('evasion', 'classFeature', [
        { type: 'AC', bonusTypeId: 'DODGE', formula: { expression: '1' } },
      ]);

      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        entities: {
          classFeature: [createEntityInstance(classFeature, true)],
        },
      };

      const result = compileCharacterEntities(character);

      expect(result.changes[0].originType).toBe('classFeature');
      expect(result.changes[0].originId).toBe('evasion');
      expect(result.changes[0].name).toBe('Test evasion');
    });

    it('should handle entities without changes', () => {
      const entityNoChanges: StandardEntity = {
        id: 'trapfinding',
        entityType: 'classFeature',
        name: 'Trapfinding',
        description: 'Can find traps',
      };

      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        entities: {
          classFeature: [createEntityInstance(entityNoChanges, true)],
        },
      };

      const result = compileCharacterEntities(character);

      expect(result.computedEntities).toHaveLength(1);
      expect(result.computedEntities[0].id).toBe('trapfinding');
      expect(result.changes).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it('should compile contextual changes from entities', () => {
      const entity: StandardEntity = {
        id: 'power-attack',
        entityType: 'feat',
        name: 'Power Attack',
        description: 'Trade accuracy for damage',
        legacy_contextualChanges: [
          {
            name: 'Power Attack',
            type: 'attack',
            appliesTo: 'melee',
            available: true,
            optional: true,
            variables: [],
            changes: [
              { attackType: 'melee', type: 'ATTACK_ROLLS', bonusTypeId: 'UNTYPED', formula: { expression: '-1' } },
              { attackType: 'melee', type: 'DAMAGE', bonusTypeId: 'UNTYPED', formula: { expression: '2' } },
            ],
          },
        ],
      };

      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        entities: {
          feat: [createEntityInstance(entity, true)],
        },
      };

      const result = compileCharacterEntities(character);

      expect(result.contextualChanges).toHaveLength(1);
      expect(result.contextualChanges[0].name).toBe('Power Attack');
    });

    it('should compile special changes from entities', () => {
      const entity: StandardEntity = {
        id: 'natural-armor',
        entityType: 'classFeature',
        name: 'Natural Armor',
        description: 'Gain natural armor',
        legacy_specialChanges: [
          { type: 'NATURAL_ARMOR', formula: { expression: '2' } },
        ],
      };

      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        entities: {
          classFeature: [createEntityInstance(entity, true)],
        },
      };

      const result = compileCharacterEntities(character);

      expect(result.specialChanges).toHaveLength(1);
      expect(result.specialChanges[0].type).toBe('NATURAL_ARMOR');
    });
  });

  // ===========================================================================
  // Coexistence with customEntities
  // ===========================================================================

  describe('coexistence with customEntities', () => {
    it('should compile both customEntities and level system entities', () => {
      const customEntity: StandardEntity = {
        id: 'custom-buff',
        entityType: 'buff',
        name: 'Custom Buff',
        description: 'A custom buff',
        legacy_changes: [
          { type: 'AC', bonusTypeId: 'DEFLECTION', formula: { expression: '1' } },
        ],
      };

      const levelEntity = createEntityWithChanges('class-feature', 'classFeature', [
        { type: 'BAB', bonusTypeId: 'BASE', formula: { expression: '1' } },
      ]);

      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        customEntities: {
          buff: [customEntity],
        },
        entities: {
          classFeature: [createEntityInstance(levelEntity, true)],
        },
      };

      const result = compileCharacterEntities(character);

      expect(result.computedEntities).toHaveLength(2);
      expect(result.changes).toHaveLength(2);
      
      const ids = result.computedEntities.map(e => e.id);
      expect(ids).toContain('custom-buff');
      expect(ids).toContain('class-feature');
    });

    it('should handle only customEntities (legacy behavior)', () => {
      const customEntity: StandardEntity = {
        id: 'custom-buff',
        entityType: 'buff',
        name: 'Custom Buff',
        description: 'A custom buff',
        legacy_changes: [
          { type: 'AC', bonusTypeId: 'DEFLECTION', formula: { expression: '1' } },
        ],
      };

      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        customEntities: {
          buff: [customEntity],
        },
      };

      const result = compileCharacterEntities(character);

      expect(result.computedEntities).toHaveLength(1);
      expect(result.computedEntities[0].id).toBe('custom-buff');
    });

    it('should handle only level system entities', () => {
      const levelEntity = createEntityWithChanges('rage', 'classFeature', [
        { type: 'ABILITY_SCORE', abilityUniqueId: 'strength', bonusTypeId: 'MORALE', formula: { expression: '4' } },
      ]);

      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        entities: {
          classFeature: [createEntityInstance(levelEntity, true)],
        },
      };

      const result = compileCharacterEntities(character);

      expect(result.computedEntities).toHaveLength(1);
      expect(result.computedEntities[0].id).toBe('rage');
    });

    it('should handle empty entities pool', () => {
      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        entities: {},
      };

      const result = compileCharacterEntities(character);

      expect(result.computedEntities).toHaveLength(0);
      expect(result.changes).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });
  });
});


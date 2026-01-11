import { describe, it, expect } from 'bun:test';
import {
  updateProviderSelection,
  getProvider,
} from '../../updater/selectionOperations';
import type { CharacterBaseData } from '../../../character/baseData/character';
import type { ClassEntity, EntityInstance } from '../../storage/types';
import type { EntityProvider } from '../../providers/types';
import { buildCharacter } from '../../../../tests';

// =============================================================================
// Test Helpers
// =============================================================================

function createFighterClass(): ClassEntity {
  return {
    id: 'fighter',
    entityType: 'class',
    name: 'Fighter',
    description: 'A warrior class',
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
    levels: {
      '1': {
        providers: [
          {
            granted: {
              specificIds: ['weapon-proficiency'],
            },
          },
          {
            selector: {
              id: 'bonus-feat',
              entityType: 'feat',
              min: 1,
              max: 1,
            },
            selectedInstanceIds: [],
          },
        ],
      },
      '2': {
        providers: [
          {
            selector: {
              id: 'bonus-feat-2',
              entityType: 'feat',
              min: 1,
              max: 1,
            },
            selectedInstanceIds: [],
          },
        ],
      },
    },
  };
}

function createCombatTrickFeature(): EntityInstance {
  return {
    instanceId: 'combat-trick@rogue-2',
    entity: {
      id: 'combat-trick',
      entityType: 'classFeature',
      name: 'Combat Trick',
      description: 'Gain a bonus combat feat',
      providers: [
        {
          selector: {
            id: 'combat-feat',
            entityType: 'feat',
            min: 1,
            max: 1,
          },
          selectedInstanceIds: [],
        },
      ],
    },
    applicable: true,
    origin: 'classLevel:rogue-2',
  };
}

// =============================================================================
// updateProviderSelection Tests - Class Level
// =============================================================================

describe('updateProviderSelection', () => {
  describe('classLevel location', () => {
    it('should update selectedInstanceIds in class level provider', () => {
      const fighter = createFighterClass();
      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        classEntities: {
          fighter,
        },
      };

      const result = updateProviderSelection(
        character,
        {
          type: 'classLevel',
          classId: 'fighter',
          classLevel: 1,
          providerIndex: 1,
        },
        ['power-attack@fighter-1-bonus-feat']
      );

      expect(result.warnings).toHaveLength(0);
      const updatedProvider = result.character.classEntities?.fighter.levels['1'].providers?.[1];
      expect(updatedProvider?.selectedInstanceIds).toEqual(['power-attack@fighter-1-bonus-feat']);
    });

    it('should replace entire selection (declarative)', () => {
      const fighter = createFighterClass();
      fighter.levels['1'].providers![1].selectedInstanceIds = ['feat-1', 'feat-2'];
      
      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        classEntities: {
          fighter,
        },
      };

      const result = updateProviderSelection(
        character,
        {
          type: 'classLevel',
          classId: 'fighter',
          classLevel: 1,
          providerIndex: 1,
        },
        ['feat-3']
      );

      expect(result.warnings).toHaveLength(0);
      const updatedProvider = result.character.classEntities?.fighter.levels['1'].providers?.[1];
      expect(updatedProvider?.selectedInstanceIds).toEqual(['feat-3']);
    });

    it('should preserve other providers in same level', () => {
      const fighter = createFighterClass();
      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        classEntities: {
          fighter,
        },
      };

      const result = updateProviderSelection(
        character,
        {
          type: 'classLevel',
          classId: 'fighter',
          classLevel: 1,
          providerIndex: 1,
        },
        ['power-attack@fighter-1-bonus-feat']
      );

      expect(result.warnings).toHaveLength(0);
      const level1Providers = result.character.classEntities?.fighter.levels['1'].providers;
      expect(level1Providers).toHaveLength(2);
      expect(level1Providers?.[0]).toEqual({
        granted: {
          specificIds: ['weapon-proficiency'],
        },
      });
    });

    it('should preserve other levels in same class', () => {
      const fighter = createFighterClass();
      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        classEntities: {
          fighter,
        },
      };

      const result = updateProviderSelection(
        character,
        {
          type: 'classLevel',
          classId: 'fighter',
          classLevel: 1,
          providerIndex: 1,
        },
        ['power-attack@fighter-1-bonus-feat']
      );

      expect(result.warnings).toHaveLength(0);
      expect(result.character.classEntities?.fighter.levels['2']).toEqual(fighter.levels['2']);
    });

    it('should allow empty selection', () => {
      const fighter = createFighterClass();
      fighter.levels['1'].providers![1].selectedInstanceIds = ['feat-1'];
      
      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        classEntities: {
          fighter,
        },
      };

      const result = updateProviderSelection(
        character,
        {
          type: 'classLevel',
          classId: 'fighter',
          classLevel: 1,
          providerIndex: 1,
        },
        []
      );

      expect(result.warnings).toHaveLength(0);
      const updatedProvider = result.character.classEntities?.fighter.levels['1'].providers?.[1];
      expect(updatedProvider?.selectedInstanceIds).toEqual([]);
    });

    it('should warn if class not found', () => {
      const character = buildCharacter().build();

      const result = updateProviderSelection(
        character,
        {
          type: 'classLevel',
          classId: 'nonexistent',
          classLevel: 1,
          providerIndex: 0,
        },
        ['some-feat']
      );

      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].type).toBe('class_not_found');
      expect(result.warnings[0].entityId).toBe('nonexistent');
      expect(result.character).toEqual(character);
    });

    it('should warn if level not found in class', () => {
      const fighter = createFighterClass();
      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        classEntities: {
          fighter,
        },
      };

      const result = updateProviderSelection(
        character,
        {
          type: 'classLevel',
          classId: 'fighter',
          classLevel: 99,
          providerIndex: 0,
        },
        ['some-feat']
      );

      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].type).toBe('provider_not_found');
      expect(result.warnings[0].message).toContain('Level 99 not found');
    });

    it('should warn if provider index out of bounds', () => {
      const fighter = createFighterClass();
      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        classEntities: {
          fighter,
        },
      };

      const result = updateProviderSelection(
        character,
        {
          type: 'classLevel',
          classId: 'fighter',
          classLevel: 1,
          providerIndex: 99,
        },
        ['some-feat']
      );

      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].type).toBe('provider_not_found');
      expect(result.warnings[0].message).toContain('Provider index 99 not found');
    });

    it('should warn if level has no providers', () => {
      const fighter = createFighterClass();
      fighter.levels['1'].providers = undefined;
      
      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        classEntities: {
          fighter,
        },
      };

      const result = updateProviderSelection(
        character,
        {
          type: 'classLevel',
          classId: 'fighter',
          classLevel: 1,
          providerIndex: 0,
        },
        ['some-feat']
      );

      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].type).toBe('provider_not_found');
    });
  });

  // ===========================================================================
  // updateProviderSelection Tests - Entity
  // ===========================================================================

  describe('entity location', () => {
    it('should update selectedInstanceIds in entity provider', () => {
      const combatTrick = createCombatTrickFeature();
      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        entities: {
          classFeature: [combatTrick],
        },
      };

      const result = updateProviderSelection(
        character,
        {
          type: 'entity',
          parentInstanceId: 'combat-trick@rogue-2',
          providerIndex: 0,
        },
        ['power-attack@combat-trick@rogue-2-combat-feat']
      );

      expect(result.warnings).toHaveLength(0);
      const updatedEntity = result.character.entities?.classFeature[0].entity as { providers?: EntityProvider[] };
      expect(updatedEntity.providers?.[0].selectedInstanceIds).toEqual([
        'power-attack@combat-trick@rogue-2-combat-feat'
      ]);
    });

    it('should replace entire selection (declarative)', () => {
      const combatTrick = createCombatTrickFeature();
      (combatTrick.entity as any).providers[0].selectedInstanceIds = ['feat-1', 'feat-2'];
      
      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        entities: {
          classFeature: [combatTrick],
        },
      };

      const result = updateProviderSelection(
        character,
        {
          type: 'entity',
          parentInstanceId: 'combat-trick@rogue-2',
          providerIndex: 0,
        },
        ['feat-3']
      );

      expect(result.warnings).toHaveLength(0);
      const updatedEntity = result.character.entities?.classFeature[0].entity as { providers?: EntityProvider[] };
      expect(updatedEntity.providers?.[0].selectedInstanceIds).toEqual(['feat-3']);
    });

    it('should preserve other fields in entity', () => {
      const combatTrick = createCombatTrickFeature();
      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        entities: {
          classFeature: [combatTrick],
        },
      };

      const result = updateProviderSelection(
        character,
        {
          type: 'entity',
          parentInstanceId: 'combat-trick@rogue-2',
          providerIndex: 0,
        },
        ['power-attack@combat-trick@rogue-2-combat-feat']
      );

      expect(result.warnings).toHaveLength(0);
      const updatedInstance = result.character.entities?.classFeature[0];
      expect(updatedInstance?.instanceId).toBe('combat-trick@rogue-2');
      expect(updatedInstance?.applicable).toBe(true);
      expect(updatedInstance?.origin).toBe('classLevel:rogue-2');
      expect(updatedInstance?.entity.name).toBe('Combat Trick');
    });

    it('should preserve other entity instances', () => {
      const combatTrick = createCombatTrickFeature();
      const otherFeature: EntityInstance = {
        instanceId: 'evasion@rogue-2',
        entity: {
          id: 'evasion',
          entityType: 'classFeature',
          name: 'Evasion',
          description: 'Avoid damage',
        },
        applicable: true,
        origin: 'classLevel:rogue-2',
      };
      
      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        entities: {
          classFeature: [combatTrick, otherFeature],
        },
      };

      const result = updateProviderSelection(
        character,
        {
          type: 'entity',
          parentInstanceId: 'combat-trick@rogue-2',
          providerIndex: 0,
        },
        ['power-attack@combat-trick@rogue-2-combat-feat']
      );

      expect(result.warnings).toHaveLength(0);
      expect(result.character.entities?.classFeature).toHaveLength(2);
      expect(result.character.entities?.classFeature[1]).toEqual(otherFeature);
    });

    it('should search across entity types', () => {
      const combatTrick = createCombatTrickFeature();
      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        entities: {
          feat: [],
          classFeature: [combatTrick],
        },
      };

      const result = updateProviderSelection(
        character,
        {
          type: 'entity',
          parentInstanceId: 'combat-trick@rogue-2',
          providerIndex: 0,
        },
        ['power-attack@combat-trick@rogue-2-combat-feat']
      );

      expect(result.warnings).toHaveLength(0);
      const updatedEntity = result.character.entities?.classFeature[0].entity as { providers?: EntityProvider[] };
      expect(updatedEntity.providers?.[0].selectedInstanceIds).toEqual([
        'power-attack@combat-trick@rogue-2-combat-feat'
      ]);
    });

    it('should warn if entity not found', () => {
      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        entities: {
          classFeature: [],
        },
      };

      const result = updateProviderSelection(
        character,
        {
          type: 'entity',
          parentInstanceId: 'nonexistent@origin',
          providerIndex: 0,
        },
        ['some-feat']
      );

      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].type).toBe('entity_not_found');
      expect(result.warnings[0].entityId).toBe('nonexistent@origin');
    });

    it('should warn if character has no entities', () => {
      const character = buildCharacter().build();

      const result = updateProviderSelection(
        character,
        {
          type: 'entity',
          parentInstanceId: 'some-entity@origin',
          providerIndex: 0,
        },
        ['some-feat']
      );

      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].type).toBe('entity_not_found');
      expect(result.warnings[0].message).toContain('no entities in character');
    });

    it('should warn if provider index out of bounds', () => {
      const combatTrick = createCombatTrickFeature();
      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        entities: {
          classFeature: [combatTrick],
        },
      };

      const result = updateProviderSelection(
        character,
        {
          type: 'entity',
          parentInstanceId: 'combat-trick@rogue-2',
          providerIndex: 99,
        },
        ['some-feat']
      );

      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].type).toBe('provider_not_found');
      expect(result.warnings[0].message).toContain('Provider index 99 not found');
    });

    it('should warn if entity has no providers', () => {
      const simpleFeature: EntityInstance = {
        instanceId: 'evasion@rogue-2',
        entity: {
          id: 'evasion',
          entityType: 'classFeature',
          name: 'Evasion',
          description: 'Avoid damage',
        },
        applicable: true,
        origin: 'classLevel:rogue-2',
      };
      
      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        entities: {
          classFeature: [simpleFeature],
        },
      };

      const result = updateProviderSelection(
        character,
        {
          type: 'entity',
          parentInstanceId: 'evasion@rogue-2',
          providerIndex: 0,
        },
        ['some-feat']
      );

      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].type).toBe('provider_not_found');
    });
  });
});

// =============================================================================
// getProvider Tests
// =============================================================================

describe('getProvider', () => {
  describe('classLevel location', () => {
    it('should return provider from class level', () => {
      const fighter = createFighterClass();
      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        classEntities: {
          fighter,
        },
      };

      const provider = getProvider(character, {
        type: 'classLevel',
        classId: 'fighter',
        classLevel: 1,
        providerIndex: 1,
      });

      expect(provider).toBeDefined();
      expect(provider?.selector?.id).toBe('bonus-feat');
    });

    it('should return undefined if class not found', () => {
      const character = buildCharacter().build();

      const provider = getProvider(character, {
        type: 'classLevel',
        classId: 'nonexistent',
        classLevel: 1,
        providerIndex: 0,
      });

      expect(provider).toBeUndefined();
    });

    it('should return undefined if level not found', () => {
      const fighter = createFighterClass();
      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        classEntities: {
          fighter,
        },
      };

      const provider = getProvider(character, {
        type: 'classLevel',
        classId: 'fighter',
        classLevel: 99,
        providerIndex: 0,
      });

      expect(provider).toBeUndefined();
    });

    it('should return undefined if provider index out of bounds', () => {
      const fighter = createFighterClass();
      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        classEntities: {
          fighter,
        },
      };

      const provider = getProvider(character, {
        type: 'classLevel',
        classId: 'fighter',
        classLevel: 1,
        providerIndex: 99,
      });

      expect(provider).toBeUndefined();
    });

    it('should return undefined if character has no classEntities', () => {
      const character = buildCharacter().build();

      const provider = getProvider(character, {
        type: 'classLevel',
        classId: 'fighter',
        classLevel: 1,
        providerIndex: 0,
      });

      expect(provider).toBeUndefined();
    });
  });

  describe('entity location', () => {
    it('should return provider from entity', () => {
      const combatTrick = createCombatTrickFeature();
      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        entities: {
          classFeature: [combatTrick],
        },
      };

      const provider = getProvider(character, {
        type: 'entity',
        parentInstanceId: 'combat-trick@rogue-2',
        providerIndex: 0,
      });

      expect(provider).toBeDefined();
      expect(provider?.selector?.id).toBe('combat-feat');
    });

    it('should return undefined if entity not found', () => {
      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        entities: {
          classFeature: [],
        },
      };

      const provider = getProvider(character, {
        type: 'entity',
        parentInstanceId: 'nonexistent@origin',
        providerIndex: 0,
      });

      expect(provider).toBeUndefined();
    });

    it('should return undefined if provider index out of bounds', () => {
      const combatTrick = createCombatTrickFeature();
      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        entities: {
          classFeature: [combatTrick],
        },
      };

      const provider = getProvider(character, {
        type: 'entity',
        parentInstanceId: 'combat-trick@rogue-2',
        providerIndex: 99,
      });

      expect(provider).toBeUndefined();
    });

    it('should return undefined if character has no entities', () => {
      const character = buildCharacter().build();

      const provider = getProvider(character, {
        type: 'entity',
        parentInstanceId: 'combat-trick@rogue-2',
        providerIndex: 0,
      });

      expect(provider).toBeUndefined();
    });

    it('should search across entity types', () => {
      const combatTrick = createCombatTrickFeature();
      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        entities: {
          feat: [],
          classFeature: [combatTrick],
        },
      };

      const provider = getProvider(character, {
        type: 'entity',
        parentInstanceId: 'combat-trick@rogue-2',
        providerIndex: 0,
      });

      expect(provider).toBeDefined();
      expect(provider?.selector?.id).toBe('combat-feat');
    });
  });
});


import { describe, it, expect } from 'bun:test';
import { calculateCharacterSheet } from '../calculateCharacterSheet';
import { buildCharacter } from '../../../../tests';
import type { CharacterBaseData } from '../../baseData/character';
import type { ClassEntity, EntityInstance, LevelSlot } from '../../../levels/storage/types';
import type { StandardEntity } from '../../../entities/types/base';
import type { CustomVariableDefinitionChange, ResourceDefinitionChange } from '../../baseData/specialChanges';
import type { Effect } from '../../baseData/effects';

// =============================================================================
// Test Helpers
// =============================================================================

function createSimpleClass(): ClassEntity {
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
          { granted: { specificIds: ['weapon-proficiency'] } },
        ],
      },
      '2': {
        providers: [
          { granted: { specificIds: ['bonus-feat-feature'] } },
        ],
      },
    },
  };
}

function createEntityInstance(
  entity: StandardEntity,
  applicable: boolean,
  origin: string
): EntityInstance {
  return {
    instanceId: `${entity.id}@${origin.replace(':', '-')}`,
    entity,
    applicable,
    origin,
  };
}

// =============================================================================
// Integration Tests
// =============================================================================

describe('Level System Integration', () => {
  describe('entity resolution affects character calculation', () => {
    it('should apply changes from applicable entities', () => {
      const strengthBonus: StandardEntity = {
        id: 'rage',
        entityType: 'classFeature',
        name: 'Rage',
        description: 'Gain strength bonus',
        legacy_changes: [
          {
            type: 'ABILITY_SCORE',
            abilityUniqueId: 'strength',
            bonusTypeId: 'MORALE',
            formula: { expression: '4' },
          },
        ],
      };

      // Create class with provider for the entity
      const fighterClass = createSimpleClass();
      fighterClass.levels['1'].providers = [
        { granted: { specificIds: ['rage'] } },
      ];

      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        classEntities: {
          fighter: fighterClass,
        },
        levelSlots: [
          { classId: 'fighter', hpRoll: 10 },
        ],
        entities: {
          classFeature: [
            createEntityInstance(strengthBonus, false, 'classLevel:fighter-1'),
          ],
        },
      };

      const sheet = calculateCharacterSheet(character);

      // The strength bonus should be applied
      const strengthSources = sheet.abilityScores.strength.sourceValues;
      const moraleBonus = strengthSources.find(s => s.bonusTypeId === 'MORALE');
      expect(moraleBonus).toBeDefined();
      expect(moraleBonus?.value).toBe(4);
    });

    it('should NOT apply changes from non-applicable entities', () => {
      const strengthBonus: StandardEntity = {
        id: 'greater-rage',
        entityType: 'classFeature',
        name: 'Greater Rage',
        description: 'Gain more strength',
        legacy_changes: [
          {
            type: 'ABILITY_SCORE',
            abilityUniqueId: 'strength',
            bonusTypeId: 'MORALE',
            formula: { expression: '8' },
          },
        ],
      };

      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        classEntities: {
          fighter: createSimpleClass(),
        },
        levelSlots: [
          { classId: 'fighter', hpRoll: 10 },
        ],
        entities: {
          classFeature: [
            createEntityInstance(strengthBonus, false, 'classLevel:fighter-5'), // Not applicable
          ],
        },
      };

      const sheet = calculateCharacterSheet(character);

      // The strength bonus should NOT be applied
      const strengthSources = sheet.abilityScores.strength.sourceValues;
      const moraleBonus = strengthSources.find(s => s.bonusTypeId === 'MORALE');
      expect(moraleBonus).toBeUndefined();
    });

    it('should resolve entities based on level slots before calculation', () => {
      // Level 1 feature - should become applicable
      const level1Feature: StandardEntity = {
        id: 'combat-reflexes',
        entityType: 'classFeature',
        name: 'Combat Reflexes',
        description: 'Extra AoO',
        legacy_changes: [
          {
            type: 'AC',
            bonusTypeId: 'DODGE',
            formula: { expression: '1' },
          },
        ],
      };

      // Level 5 feature - should stay non-applicable  
      const level5Feature: StandardEntity = {
        id: 'improved-reflexes',
        entityType: 'classFeature',
        name: 'Improved Reflexes',
        description: 'Even more AoO',
        legacy_changes: [
          {
            type: 'AC',
            bonusTypeId: 'DODGE',
            formula: { expression: '2' },
          },
        ],
      };

      const fighterClass = createSimpleClass();
      fighterClass.levels['1'].providers = [
        { granted: { specificIds: ['combat-reflexes'] } },
      ];
      fighterClass.levels['5'] = {
        providers: [
          { granted: { specificIds: ['improved-reflexes'] } },
        ],
      };

      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        classEntities: {
          fighter: fighterClass,
        },
        levelSlots: [
          { classId: 'fighter', hpRoll: 10 }, // Only level 1
        ],
        entities: {
          classFeature: [
            createEntityInstance(level1Feature, false, 'classLevel:fighter-1'), // Will be resolved to true
            createEntityInstance(level5Feature, false, 'classLevel:fighter-5'), // Will stay false
          ],
        },
      };

      const sheet = calculateCharacterSheet(character);

      // Check that level 1 feature was applied
      const acSources = sheet.armorClass.totalAc.sourceValues;
      const dodgeBonuses = acSources.filter(s => s.bonusTypeId === 'DODGE');
      
      // Should have exactly one dodge bonus (+1 from level 1 feature)
      expect(dodgeBonuses.length).toBe(1);
      expect(dodgeBonuses[0].value).toBe(1);
    });

    it('should include applicable entities in computedEntities', () => {
      const entity: StandardEntity = {
        id: 'evasion',
        entityType: 'classFeature',
        name: 'Evasion',
        description: 'Avoid damage',
      };

      // Custom entities are always applicable
      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        entities: {
          classFeature: [
            createEntityInstance(entity, false, 'custom'), // Custom origin = always applicable
          ],
        },
      };

      const sheet = calculateCharacterSheet(character);

      expect(sheet.computedEntities).toBeDefined();
      expect(sheet.computedEntities.length).toBe(1);
      expect(sheet.computedEntities[0].id).toBe('evasion');
    });

    it('should NOT include non-applicable entities in computedEntities', () => {
      const entity: StandardEntity = {
        id: 'improved-evasion',
        entityType: 'classFeature',
        name: 'Improved Evasion',
        description: 'Better evasion',
      };

      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        entities: {
          classFeature: [
            createEntityInstance(entity, false, 'classLevel:rogue-9'),
          ],
        },
      };

      const sheet = calculateCharacterSheet(character);

      expect(sheet.computedEntities).toBeDefined();
      expect(sheet.computedEntities.length).toBe(0);
    });
  });

  describe('coexistence with legacy system', () => {
    it('should apply changes from both customEntities and level system entities', () => {
      // Custom entity (legacy)
      const customBuff: StandardEntity = {
        id: 'magic-vestment',
        entityType: 'buff',
        name: 'Magic Vestment',
        description: 'AC bonus',
        legacy_changes: [
          {
            type: 'AC',
            bonusTypeId: 'ENHANCEMENT',
            formula: { expression: '2' },
          },
        ],
      };

      // Level system entity (custom origin = always applicable)
      const classFeature: StandardEntity = {
        id: 'armor-training',
        entityType: 'classFeature',
        name: 'Armor Training',
        description: 'AC bonus',
        legacy_changes: [
          {
            type: 'AC',
            bonusTypeId: 'DODGE',
            formula: { expression: '1' },
          },
        ],
      };

      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        customEntities: {
          buff: [customBuff],
        },
        entities: {
          classFeature: [
            createEntityInstance(classFeature, false, 'custom'), // Custom = always applicable
          ],
        },
      };

      const sheet = calculateCharacterSheet(character);

      const acSources = sheet.armorClass.totalAc.sourceValues;
      const enhancementBonus = acSources.find(s => s.bonusTypeId === 'ENHANCEMENT');
      const dodgeBonus = acSources.find(s => s.bonusTypeId === 'DODGE');

      expect(enhancementBonus).toBeDefined();
      expect(enhancementBonus?.value).toBe(2);
      expect(dodgeBonus).toBeDefined();
      expect(dodgeBonus?.value).toBe(1);
    });
  });

  describe('special changes from entities', () => {
    it('should create custom variables and resources from entity special changes', () => {
      const variableDefinition: CustomVariableDefinitionChange = {
        type: 'CUSTOM_VARIABLE_DEFINITION',
        variableId: 'sneak_attack_dice',
        name: 'Sneak Attack Dice',
        baseSources: [{
          bonusTypeId: 'BASE',
          type: 'CUSTOM_VARIABLE',
          uniqueId: 'sneak_attack_dice',
          formula: { expression: '3' },
          name: 'Rogue Sneak Attack',
          createVariableForSource: false,
        }],
      };

      const resourceDefinition: ResourceDefinitionChange = {
        type: 'RESOURCE_DEFINITION',
        resourceId: 'ki_points',
        name: 'Ki Points',
        maxValueFormula: { expression: '10' },
        rechargeFormula: { expression: '10' },
      };

      const classFeature: StandardEntity = {
        id: 'sneak-attack',
        entityType: 'classFeature',
        name: 'Sneak Attack',
        description: 'Deal extra damage',
        legacy_specialChanges: [variableDefinition, resourceDefinition],
      };

      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        entities: {
          classFeature: [
            createEntityInstance(classFeature, false, 'custom'),
          ],
        },
      };

      const sheet = calculateCharacterSheet(character);

      // Check custom variable was created
      const sneakAttackVar = sheet.customVariables.find(v => v.uniqueId === 'sneak_attack_dice');
      expect(sneakAttackVar).toBeDefined();
      expect(sneakAttackVar?.totalValue).toBe(3);

      // Check resource was created  
      const kiResource = sheet.resources['ki_points'];
      expect(kiResource).toBeDefined();
      expect(kiResource?.name).toBe('Ki Points');
      expect(kiResource?.maxValue).toBe(10);
    });
  });

  describe('effects from entities', () => {
    it('should apply effects from applicable entities', () => {
      const sizeEffect: Effect = {
        target: 'size.total',
        formula: '1',
        bonusType: 'SIZE',
      };

      const classFeature: StandardEntity = {
        id: 'powerful-build',
        entityType: 'classFeature',
        name: 'Powerful Build',
        description: 'Count as one size larger',
        effects: [sizeEffect],
      };

      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        entities: {
          classFeature: [
            createEntityInstance(classFeature, false, 'custom'),
          ],
        },
      };

      const sheet = calculateCharacterSheet(character);

      // Effect should have been applied - size should be LARGE (1 step up from MEDIUM)
      expect(sheet.size.currentSize).toBe('LARGE');
    });
  });
});


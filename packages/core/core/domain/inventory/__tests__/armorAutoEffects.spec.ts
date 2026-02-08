/**
 * Tests for armor auto effects via the inventory effect system.
 *
 * Verifies that:
 * 1. Armor entities with @entity.armorBonus effects resolve correctly
 * 2. Effects only compile for equipped items
 * 3. The full pipeline applies armor bonus to AC
 */

import { describe, expect, it } from 'bun:test';
import { compileCharacterEffects } from '../../character/calculation/effects/compileEffects';
import { calculateEffect, effectsToSourceValues } from '../../character/calculation/effects/applyEffects';
import { buildCharacter } from '../../../tests/character/buildCharacter';
import { calculateCharacterSheet } from '../../character/calculation/calculateCharacterSheet';
import type { InventoryState, ResolvedInventoryEntity } from '../types';
import type { StandardEntity } from '../../entities/types/base';
import type { CharacterBaseData } from '../../character/baseData/character';
import type { Effect } from '../../character/baseData/effects';
import type { SimpleCondition } from '../../character/baseData/conditions';

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Creates an armor entity with auto effects (as the CMS would produce
 * by copying schema autoEffects to the entity's effects field).
 */
function createArmorWithAutoEffects(overrides: {
  id: string;
  name: string;
  armorBonus: number;
  armorType?: string;
}): StandardEntity & Record<string, unknown> {
  return {
    id: overrides.id,
    entityType: 'armor',
    name: overrides.name,
    armorBonus: overrides.armorBonus,
    armorType: overrides.armorType ?? 'medium',
    maxDexBonus: 4,
    armorCheckPenalty: -2,
    arcaneSpellFailure: 20,
    weight: 25,
    effects: [
      {
        target: 'ac.total',
        formula: '@entity.armorBonus',
        bonusType: 'ARMOR',
      },
    ],
  };
}

function createInventoryState(items: Array<{
  entity: StandardEntity & Record<string, unknown>;
  equipped?: boolean;
}>): InventoryState {
  return {
    items: items.map((item, index) => ({
      instanceId: `instance-${index}`,
      itemId: item.entity.id,
      entityType: item.entity.entityType,
      quantity: 1,
      entity: {
        ...item.entity,
        equipped: item.equipped ?? false,
      } as ResolvedInventoryEntity,
    })),
    currencies: {},
  };
}

function createMinimalCharacterBaseData(): CharacterBaseData {
  return {
    name: 'Test Character',
    buffs: [],
    equipment: { items: [] },
  } as unknown as CharacterBaseData;
}

// =============================================================================
// TESTS
// =============================================================================

describe('Armor Auto Effects', () => {
  describe('compileCharacterEffects resolves @entity.X for inventory items', () => {
    it('should resolve @entity.armorBonus in effect formula for equipped armor', () => {
      const chainShirt = createArmorWithAutoEffects({
        id: 'chain-shirt',
        name: 'Chain Shirt',
        armorBonus: 4,
        armorType: 'light',
      });

      const characterData = createMinimalCharacterBaseData();
      characterData.inventoryState = createInventoryState([
        { entity: chainShirt, equipped: true },
      ]);

      const compiled = compileCharacterEffects(characterData);

      expect(compiled.all).toHaveLength(1);
      // @entity.armorBonus should be resolved to "4"
      expect(compiled.all[0].formula).toBe('4');
      expect(compiled.all[0].target).toBe('ac.total');
      expect(compiled.all[0].bonusType).toBe('ARMOR');
      expect(compiled.all[0].sourceName).toBe('Chain Shirt');
    });

    it('should NOT compile effects for unequipped armor', () => {
      const chainShirt = createArmorWithAutoEffects({
        id: 'chain-shirt',
        name: 'Chain Shirt',
        armorBonus: 4,
      });

      const characterData = createMinimalCharacterBaseData();
      characterData.inventoryState = createInventoryState([
        { entity: chainShirt, equipped: false },
      ]);

      const compiled = compileCharacterEffects(characterData);

      expect(compiled.all).toHaveLength(0);
    });

    it('should resolve different armorBonus values for different armors', () => {
      const fullPlate = createArmorWithAutoEffects({
        id: 'full-plate',
        name: 'Full Plate',
        armorBonus: 8,
        armorType: 'heavy',
      });

      const paddedArmor = createArmorWithAutoEffects({
        id: 'padded',
        name: 'Padded Armor',
        armorBonus: 1,
        armorType: 'light',
      });

      // Only full plate equipped
      const characterData = createMinimalCharacterBaseData();
      characterData.inventoryState = createInventoryState([
        { entity: fullPlate, equipped: true },
        { entity: paddedArmor, equipped: false },
      ]);

      const compiled = compileCharacterEffects(characterData);

      expect(compiled.all).toHaveLength(1);
      expect(compiled.all[0].formula).toBe('8');
      expect(compiled.all[0].sourceName).toBe('Full Plate');
    });
  });

  describe('Effect calculation produces correct armor bonus value', () => {
    it('should calculate armor bonus value from resolved formula', () => {
      const breastplate = createArmorWithAutoEffects({
        id: 'breastplate',
        name: 'Breastplate',
        armorBonus: 5,
      });

      const characterData = createMinimalCharacterBaseData();
      characterData.inventoryState = createInventoryState([
        { entity: breastplate, equipped: true },
      ]);

      const compiled = compileCharacterEffects(characterData);
      const calculatedEffects = compiled.all.map((effect) =>
        calculateEffect(effect, {})
      );

      expect(calculatedEffects).toHaveLength(1);
      expect(calculatedEffects[0].totalValue).toBe(5);
      expect(calculatedEffects[0].bonusType).toBe('ARMOR');
      expect(calculatedEffects[0].conditionsMet).toBe(true);
    });

    it('should produce correct source values with ARMOR bonus type (non-stacking)', () => {
      const breastplate = createArmorWithAutoEffects({
        id: 'breastplate',
        name: 'Breastplate',
        armorBonus: 5,
      });

      const characterData = createMinimalCharacterBaseData();
      characterData.inventoryState = createInventoryState([
        { entity: breastplate, equipped: true },
      ]);

      const compiled = compileCharacterEffects(characterData);
      const calculatedEffects = compiled.all.map((effect) =>
        calculateEffect(effect, {})
      );
      const sourceValues = effectsToSourceValues(calculatedEffects);

      expect(sourceValues.total).toBe(5);
      expect(sourceValues.sourceValues).toHaveLength(1);
      expect(sourceValues.sourceValues[0].value).toBe(5);
      expect(sourceValues.sourceValues[0].relevant).toBe(true);
    });
  });

  describe('Conditional equipped effects with @instance.equipped', () => {
    it('should evaluate @instance.equipped condition correctly for equipped item', () => {
      const armor: StandardEntity & Record<string, unknown> = {
        id: 'chain-shirt',
        entityType: 'armor',
        name: 'Chain Shirt',
        armorBonus: 4,
        effects: [
          {
            target: 'ac.total',
            formula: '@entity.armorBonus',
            bonusType: 'ARMOR',
            conditions: [
              {
                type: 'simple',
                firstFormula: '@instance.equipped',
                operator: '==',
                secondFormula: '1',
              } as SimpleCondition,
            ],
          } as Effect,
        ],
      };

      const characterData = createMinimalCharacterBaseData();
      characterData.inventoryState = createInventoryState([
        { entity: armor, equipped: true },
      ]);

      const compiled = compileCharacterEffects(characterData);

      expect(compiled.all).toHaveLength(1);
      // Formula should be resolved
      expect(compiled.all[0].formula).toBe('4');
      // Condition should be resolved: @instance.equipped -> 1
      const condition = compiled.all[0].conditions![0] as SimpleCondition;
      expect(condition.firstFormula).toBe('1');
      expect(condition.secondFormula).toBe('1');

      // When calculated, condition should be met
      const calculated = calculateEffect(compiled.all[0], {});
      expect(calculated.conditionsMet).toBe(true);
      expect(calculated.totalValue).toBe(4);
    });
  });

  describe('Integration: armor bonus affects AC calculation', () => {
    it('should add armor bonus to AC when armor is equipped in inventory', () => {
      const chainShirt = createArmorWithAutoEffects({
        id: 'chain-shirt',
        name: 'Chain Shirt',
        armorBonus: 4,
        armorType: 'light',
      });

      const character = buildCharacter().build();
      character.inventoryState = createInventoryState([
        { entity: chainShirt, equipped: true },
      ]);

      const sheetWithArmor = calculateCharacterSheet(character, {});

      // Without any armor in the legacy system, base AC = 10 + DEX
      // The effect system should add +4 ARMOR bonus
      const acSourceValues = sheetWithArmor.armorClass.totalAc.sourceValues;
      const armorEffectSource = acSourceValues.find(
        (sv) => sv.sourceName === 'Chain Shirt'
      );

      expect(armorEffectSource).toBeDefined();
      expect(armorEffectSource!.value).toBe(4);
      expect(armorEffectSource!.bonusTypeId).toBe('ARMOR');
    });

    it('should NOT add armor bonus to AC when armor is not equipped', () => {
      const chainShirt = createArmorWithAutoEffects({
        id: 'chain-shirt',
        name: 'Chain Shirt',
        armorBonus: 4,
        armorType: 'light',
      });

      const character = buildCharacter().build();
      character.inventoryState = createInventoryState([
        { entity: chainShirt, equipped: false },
      ]);

      const sheet = calculateCharacterSheet(character, {});

      const acSourceValues = sheet.armorClass.totalAc.sourceValues;
      const armorEffectSource = acSourceValues.find(
        (sv) => sv.sourceName === 'Chain Shirt'
      );

      expect(armorEffectSource).toBeUndefined();
    });

    it('should reflect the correct armorBonus value in total AC', () => {
      const fullPlate = createArmorWithAutoEffects({
        id: 'full-plate',
        name: 'Full Plate',
        armorBonus: 8,
        armorType: 'heavy',
      });

      // Character with no armor in legacy system
      const characterWithout = buildCharacter().build();
      const sheetWithout = calculateCharacterSheet(characterWithout, {});
      const baseAC = sheetWithout.armorClass.totalAc.totalValue;

      // Same character with full plate equipped via inventory
      const characterWith = buildCharacter().build();
      characterWith.inventoryState = createInventoryState([
        { entity: fullPlate, equipped: true },
      ]);
      const sheetWith = calculateCharacterSheet(characterWith, {});

      // AC should increase by 8 (Full Plate's armorBonus)
      expect(sheetWith.armorClass.totalAc.totalValue).toBe(baseAC + 8);
    });
  });
});

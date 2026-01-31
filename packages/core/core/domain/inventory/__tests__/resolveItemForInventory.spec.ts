/**
 * Tests for resolveItemForInventory - resolving items with properties
 * from the compendium for self-contained storage.
 */

import { describe, expect, it } from 'bun:test';
import {
  resolveItemForInventory,
  resolveItemById,
  type EntityResolver,
} from '../properties/resolveItemForInventory';
import type { StandardEntity } from '../../entities/types/base';
import type { Effect } from '../../character/baseData/effects';

// =============================================================================
// MOCK ENTITIES
// =============================================================================

const baseLongsword: StandardEntity & Record<string, unknown> = {
  id: 'longsword',
  entityType: 'weapon',
  name: 'Longsword',
  damageDice: '1d8',
  damageType: 'slashing',
  critRange: 19,
  critMultiplier: 2,
};

const keenLongsword: StandardEntity & Record<string, unknown> = {
  id: 'longsword-keen',
  entityType: 'weapon',
  name: 'Keen Longsword',
  damageDice: '1d8',
  damageType: 'slashing',
  critRange: 19,
  critMultiplier: 2,
  properties: ['keen'],
};

const flamingKeenLongsword: StandardEntity & Record<string, unknown> = {
  id: 'longsword-flaming-keen',
  entityType: 'weapon',
  name: 'Flaming Keen Longsword',
  damageDice: '1d8',
  damageType: 'slashing',
  critRange: 19,
  critMultiplier: 2,
  properties: ['flaming', 'keen'],
};

const keenProperty: StandardEntity = {
  id: 'keen',
  entityType: 'weaponProperty',
  name: 'Keen',
  description: 'Doubles threat range',
  effects: [
    {
      target: '@item.critRange',
      formula: '21 - 2 * (21 - @item.critRange)',
      bonusType: 'untyped',
    } as Effect,
  ],
};

const flamingProperty: StandardEntity = {
  id: 'flaming',
  entityType: 'weaponProperty',
  name: 'Flaming',
  description: 'Deals +1d6 fire damage',
  effects: [
    {
      target: '@item.bonusDamage',
      formula: '1d6 fire',
      bonusType: 'untyped',
    } as Effect,
  ],
};

// =============================================================================
// HELPERS
// =============================================================================

function createMockResolver(
  entities: Record<string, StandardEntity>
): EntityResolver {
  return (entityType: string, entityId: string) => {
    return entities[entityId];
  };
}

function createKeenEvaluator() {
  return (formula: string, context: Record<string, unknown>) => {
    if (formula.includes('@item.critRange')) {
      const critRange = context['@item.critRange'] as number;
      return 21 - 2 * (21 - critRange);
    }
    return formula;
  };
}

// =============================================================================
// TESTS
// =============================================================================

describe('resolveItemForInventory', () => {
  describe('items without properties', () => {
    it('should return entity as-is when no properties field', () => {
      const result = resolveItemForInventory(baseLongsword, {
        resolver: createMockResolver({}),
      });

      expect(result.entity).toEqual(baseLongsword);
      expect(result.resolvedProperties).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it('should return entity as-is when properties array is empty', () => {
      const entityWithEmptyProperties = { ...baseLongsword, properties: [] };

      const result = resolveItemForInventory(entityWithEmptyProperties, {
        resolver: createMockResolver({}),
      });

      expect(result.entity.properties).toEqual([]);
      expect(result.resolvedProperties).toHaveLength(0);
    });
  });

  describe('items with properties', () => {
    it('should resolve single property and apply effects', () => {
      const mockEntities = {
        'longsword-keen': keenLongsword,
        keen: keenProperty,
      };

      const result = resolveItemForInventory(keenLongsword, {
        resolver: createMockResolver(mockEntities),
        evaluateFormula: createKeenEvaluator(),
      });

      // Keen should double the threat range: 19-20 (critRange 19) -> 17-20 (critRange 17)
      expect(result.entity.critRange).toBe(17);
      expect(result.resolvedProperties).toHaveLength(1);
      expect(result.resolvedProperties[0].id).toBe('keen');
      expect(result.warnings).toHaveLength(0);
    });

    it('should resolve multiple properties', () => {
      const mockEntities = {
        keen: keenProperty,
        flaming: flamingProperty,
      };

      const result = resolveItemForInventory(flamingKeenLongsword, {
        resolver: createMockResolver(mockEntities),
        evaluateFormula: createKeenEvaluator(),
      });

      expect(result.entity.critRange).toBe(17);
      expect(result.entity.bonusDamage).toBe('1d6 fire');
      expect(result.resolvedProperties).toHaveLength(2);
    });

    it('should warn when property is not found', () => {
      const result = resolveItemForInventory(keenLongsword, {
        resolver: createMockResolver({}), // Empty - keen not found
      });

      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].type).toBe('property_not_found');
      expect(result.warnings[0].propertyId).toBe('keen');
      // Entity should still be returned, just without the property applied
      expect(result.entity.critRange).toBe(19); // Unchanged
    });

    it('should preserve _appliedEffects metadata', () => {
      const mockEntities = {
        keen: keenProperty,
      };

      const result = resolveItemForInventory(keenLongsword, {
        resolver: createMockResolver(mockEntities),
        evaluateFormula: createKeenEvaluator(),
      });

      expect(result.entity._appliedEffects).toBeDefined();
      expect(result.entity._appliedEffects).toHaveLength(1);
      expect(result.entity._appliedEffects![0].propertyId).toBe('keen');
      expect(result.entity._appliedEffects![0].originalValue).toBe(19);
      expect(result.entity._appliedEffects![0].modifiedValue).toBe(17);
    });
  });

  describe('formula evaluation', () => {
    it('should use formula string as value when no evaluator provided', () => {
      const mockEntities = {
        flaming: flamingProperty,
      };

      // Without evaluator, formula string is used directly
      const entityWithFlaming = { ...baseLongsword, properties: ['flaming'] };
      const result = resolveItemForInventory(entityWithFlaming, {
        resolver: createMockResolver(mockEntities),
        // No evaluateFormula provided
      });

      // String formula should be preserved as-is
      expect(result.entity.bonusDamage).toBe('1d6 fire');
    });
  });
});

describe('resolveItemById', () => {
  it('should resolve item and properties in one call', () => {
    const mockEntities: Record<string, StandardEntity> = {
      'longsword-keen': keenLongsword,
      keen: keenProperty,
    };

    const result = resolveItemById('longsword-keen', 'weapon', {
      resolver: createMockResolver(mockEntities),
      evaluateFormula: createKeenEvaluator(),
    });

    expect(result).not.toBeNull();
    expect(result!.entity.name).toBe('Keen Longsword');
    expect(result!.entity.critRange).toBe(17);
  });

  it('should return null when item not found', () => {
    const result = resolveItemById('nonexistent', 'weapon', {
      resolver: createMockResolver({}),
    });

    expect(result).toBeNull();
  });
});

describe('Self-Contained Character Principle', () => {
  it('demonstrates the full workflow: resolve -> store -> use without compendium', () => {
    // STEP 1: Resolve item with properties from compendium (at acquisition time)
    const mockEntities: Record<string, StandardEntity> = {
      'longsword-keen': keenLongsword,
      keen: keenProperty,
    };

    const resolveResult = resolveItemById('longsword-keen', 'weapon', {
      resolver: createMockResolver(mockEntities),
      evaluateFormula: createKeenEvaluator(),
    });

    expect(resolveResult).not.toBeNull();
    const resolvedEntity = resolveResult!.entity;

    // STEP 2: Store on inventory item (self-contained)
    const inventoryItem = {
      instanceId: 'item-123',
      itemId: 'longsword-keen',
      entityType: 'weapon',
      quantity: 1,
      instanceValues: { equipped: true, wielded: true },
      entity: resolvedEntity, // <-- Stored with properties already applied
    };

    // STEP 3: Use at calculation time WITHOUT needing compendium
    // The entity has all the resolved values
    expect(inventoryItem.entity.critRange).toBe(17); // Keen already applied
    expect(inventoryItem.entity.name).toBe('Keen Longsword');
    expect(inventoryItem.entity._appliedEffects).toHaveLength(1);

    // No compendium needed to get the correct critRange!
  });
});

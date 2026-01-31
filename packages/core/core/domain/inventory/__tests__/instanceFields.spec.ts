/**
 * Tests for Instance Fields System
 */

import { describe, expect, it } from 'bun:test';
import {
  getInstanceFieldValue,
  setInstanceFieldValue,
  mergeInstanceFieldDefinitions,
  type InstanceFieldDefinition,
  type InstanceValues,
} from '../../entities/types/instanceFields';
import {
  getInstanceFieldsForSchema,
  getInstanceFieldsFromAddons,
  getItemInstanceValue,
  setItemInstanceValue,
  updateItemInstanceValue,
  isItemActive,
  setItemActive,
  toggleItemActive,
  isItemEquipped,
  setItemEquipped,
  toggleItemEquipped,
  isItemWielded,
  setItemWielded,
  toggleItemWielded,
  ACTIVE_FIELD,
  EQUIPPED_FIELD,
  WIELDED_FIELD,
} from '../instanceFields';
import { activableAddon, equippableAddon, wieldableAddon } from '../../levels/entities/defaultAddons';
import type { InventoryItemInstance } from '../types';
import type { EntitySchemaDefinition } from '../../entities/types/schema';
import type { AddonRegistry } from '../../levels/entities/types';

// =============================================================================
// Test Data
// =============================================================================

const testBooleanField: InstanceFieldDefinition = {
  name: 'enabled',
  type: 'boolean',
  default: false,
  label: 'Enabled',
};

const testNumberField: InstanceFieldDefinition = {
  name: 'charges',
  type: 'number',
  default: 3,
  label: 'Charges',
};

const testStringField: InstanceFieldDefinition = {
  name: 'mode',
  type: 'string',
  default: 'normal',
  label: 'Mode',
};

function createTestItem(
  instanceValues?: InstanceValues
): InventoryItemInstance {
  return {
    instanceId: 'test-instance-1',
    itemId: 'test-item',
    entityType: 'item',
    quantity: 1,
    equipped: false,
    instanceValues,
  };
}

// =============================================================================
// Tests: Core Instance Field Functions
// =============================================================================

describe('Instance Field Value Operations', () => {
  describe('getInstanceFieldValue', () => {
    it('should return default when instanceValues is undefined', () => {
      const result = getInstanceFieldValue(undefined, testBooleanField);
      expect(result).toBe(false);
    });

    it('should return default when field is not set', () => {
      const result = getInstanceFieldValue({}, testBooleanField);
      expect(result).toBe(false);
    });

    it('should return stored value when set', () => {
      const result = getInstanceFieldValue(
        { enabled: true },
        testBooleanField
      );
      expect(result).toBe(true);
    });

    it('should work with number fields', () => {
      const result = getInstanceFieldValue({ charges: 5 }, testNumberField);
      expect(result).toBe(5);
    });

    it('should work with string fields', () => {
      const result = getInstanceFieldValue({ mode: 'turbo' }, testStringField);
      expect(result).toBe('turbo');
    });
  });

  describe('setInstanceFieldValue', () => {
    it('should create new instanceValues when setting non-default value', () => {
      const result = setInstanceFieldValue(undefined, testBooleanField, true);
      expect(result).toEqual({ enabled: true });
    });

    it('should return undefined when setting default value on empty', () => {
      const result = setInstanceFieldValue(undefined, testBooleanField, false);
      expect(result).toBeUndefined();
    });

    it('should remove field when setting to default value', () => {
      const initial = { enabled: true, charges: 5 };
      const result = setInstanceFieldValue(initial, testBooleanField, false);
      expect(result).toEqual({ charges: 5 });
    });

    it('should return undefined when all fields are defaults', () => {
      const initial = { enabled: true };
      const result = setInstanceFieldValue(initial, testBooleanField, false);
      expect(result).toBeUndefined();
    });

    it('should preserve other fields when updating one', () => {
      const initial = { enabled: true, charges: 5 };
      const result = setInstanceFieldValue(initial, testNumberField, 10);
      expect(result).toEqual({ enabled: true, charges: 10 });
    });
  });

  describe('mergeInstanceFieldDefinitions', () => {
    it('should merge fields from multiple sources', () => {
      const source1 = [testBooleanField];
      const source2 = [testNumberField];
      const result = mergeInstanceFieldDefinitions(source1, source2);
      expect(result).toHaveLength(2);
      expect(result.map((f) => f.name)).toContain('enabled');
      expect(result.map((f) => f.name)).toContain('charges');
    });

    it('should handle undefined sources', () => {
      const result = mergeInstanceFieldDefinitions(
        undefined,
        [testBooleanField],
        undefined
      );
      expect(result).toHaveLength(1);
    });

    it('should override fields with same name (last wins)', () => {
      const field1: InstanceFieldDefinition = {
        name: 'test',
        type: 'boolean',
        default: false,
      };
      const field2: InstanceFieldDefinition = {
        name: 'test',
        type: 'boolean',
        default: true,
      };
      const result = mergeInstanceFieldDefinitions([field1], [field2]);
      expect(result).toHaveLength(1);
      expect(result[0].default).toBe(true);
    });
  });
});

// =============================================================================
// Tests: Inventory Item Instance Field Helpers
// =============================================================================

describe('Item Instance Value Helpers', () => {
  describe('getItemInstanceValue', () => {
    it('should get value from item', () => {
      const item = createTestItem({ enabled: true });
      expect(getItemInstanceValue(item, testBooleanField)).toBe(true);
    });

    it('should return default for item without instanceValues', () => {
      const item = createTestItem();
      expect(getItemInstanceValue(item, testBooleanField)).toBe(false);
    });
  });

  describe('setItemInstanceValue', () => {
    it('should create new item with updated value', () => {
      const item = createTestItem();
      const newItem = setItemInstanceValue(item, testBooleanField, true);

      expect(newItem).not.toBe(item); // New object
      expect(newItem.instanceValues).toEqual({ enabled: true });
      expect(item.instanceValues).toBeUndefined(); // Original unchanged
    });

    it('should remove instanceValues when all defaults', () => {
      const item = createTestItem({ enabled: true });
      const newItem = setItemInstanceValue(item, testBooleanField, false);

      expect(newItem.instanceValues).toBeUndefined();
    });
  });

  describe('updateItemInstanceValue', () => {
    it('should update item in array by instanceId', () => {
      const items = [
        createTestItem(),
        { ...createTestItem(), instanceId: 'test-2' },
      ];

      const updated = updateItemInstanceValue(
        items,
        'test-instance-1',
        testBooleanField,
        true
      );

      expect(updated[0].instanceValues).toEqual({ enabled: true });
      expect(updated[1].instanceValues).toBeUndefined(); // Other item unchanged
    });

    it('should not modify array if instanceId not found', () => {
      const items = [createTestItem()];
      const updated = updateItemInstanceValue(
        items,
        'nonexistent',
        testBooleanField,
        true
      );

      expect(updated[0].instanceValues).toBeUndefined();
    });
  });
});

// =============================================================================
// Tests: Active State Helpers (activable addon)
// =============================================================================

describe('Active State Helpers', () => {
  describe('ACTIVE_FIELD', () => {
    it('should have correct default configuration', () => {
      expect(ACTIVE_FIELD.name).toBe('active');
      expect(ACTIVE_FIELD.type).toBe('boolean');
      expect(ACTIVE_FIELD.default).toBe(false);
    });
  });

  describe('isItemActive', () => {
    it('should return false for item without instanceValues', () => {
      const item = createTestItem();
      expect(isItemActive(item)).toBe(false);
    });

    it('should return false when active is not set', () => {
      const item = createTestItem({ charges: 5 });
      expect(isItemActive(item)).toBe(false);
    });

    it('should return true when active is true', () => {
      const item = createTestItem({ active: true });
      expect(isItemActive(item)).toBe(true);
    });

    it('should return false when active is explicitly false', () => {
      const item = createTestItem({ active: false });
      expect(isItemActive(item)).toBe(false);
    });
  });

  describe('setItemActive', () => {
    it('should set item to active', () => {
      const item = createTestItem();
      const activeItem = setItemActive(item, true);

      expect(isItemActive(activeItem)).toBe(true);
    });

    it('should set item to inactive', () => {
      const item = createTestItem({ active: true });
      const inactiveItem = setItemActive(item, false);

      expect(isItemActive(inactiveItem)).toBe(false);
      expect(inactiveItem.instanceValues).toBeUndefined(); // Cleaned up
    });
  });

  describe('toggleItemActive', () => {
    it('should toggle inactive to active', () => {
      const item = createTestItem();
      const toggled = toggleItemActive(item);

      expect(isItemActive(toggled)).toBe(true);
    });

    it('should toggle active to inactive', () => {
      const item = createTestItem({ active: true });
      const toggled = toggleItemActive(item);

      expect(isItemActive(toggled)).toBe(false);
    });
  });
});

// =============================================================================
// Tests: Schema/Addon Instance Field Resolution
// =============================================================================

describe('Schema Instance Field Resolution', () => {
  describe('getInstanceFieldsFromAddons', () => {
    it('should extract instanceFields from addons', () => {
      const fields = getInstanceFieldsFromAddons([activableAddon]);
      expect(fields).toHaveLength(1);
      expect(fields[0].name).toBe('active');
    });

    it('should handle addons without instanceFields', () => {
      const addonWithoutInstanceFields = {
        id: 'test',
        name: 'Test',
        fields: [],
      };
      const fields = getInstanceFieldsFromAddons([addonWithoutInstanceFields]);
      expect(fields).toHaveLength(0);
    });

    it('should merge instanceFields from multiple addons', () => {
      const customAddon = {
        id: 'custom',
        name: 'Custom',
        fields: [],
        instanceFields: [testNumberField],
      };
      const fields = getInstanceFieldsFromAddons([activableAddon, customAddon]);
      expect(fields).toHaveLength(2);
    });
  });

  describe('getInstanceFieldsForSchema', () => {
    it('should resolve instanceFields from schema addons', () => {
      const schema: EntitySchemaDefinition = {
        typeName: 'testItem',
        addons: ['activable'],
        fields: [],
      };

      const registry: AddonRegistry = {
        activable: activableAddon,
      };

      const fields = getInstanceFieldsForSchema(schema, registry);
      expect(fields).toHaveLength(1);
      expect(fields[0].name).toBe('active');
    });

    it('should return empty array for schema without addons', () => {
      const schema: EntitySchemaDefinition = {
        typeName: 'basic',
        fields: [],
      };

      const fields = getInstanceFieldsForSchema(schema, {});
      expect(fields).toHaveLength(0);
    });

    it('should skip unknown addons', () => {
      const schema: EntitySchemaDefinition = {
        typeName: 'testItem',
        addons: ['activable', 'unknownAddon'],
        fields: [],
      };

      const registry: AddonRegistry = {
        activable: activableAddon,
      };

      const fields = getInstanceFieldsForSchema(schema, registry);
      expect(fields).toHaveLength(1);
    });
  });
});

// =============================================================================
// Tests: Equipped State Helpers
// =============================================================================

describe('Equipped State Helpers', () => {
  describe('EQUIPPED_FIELD', () => {
    it('should have correct default configuration', () => {
      expect(EQUIPPED_FIELD.name).toBe('equipped');
      expect(EQUIPPED_FIELD.type).toBe('boolean');
      expect(EQUIPPED_FIELD.default).toBe(false);
    });
  });

  describe('isItemEquipped', () => {
    it('should return false for item without instanceValues', () => {
      const item = createTestItem();
      expect(isItemEquipped(item)).toBe(false);
    });

    it('should return true when equipped is true', () => {
      const item = createTestItem({ equipped: true });
      expect(isItemEquipped(item)).toBe(true);
    });
  });

  describe('setItemEquipped', () => {
    it('should set item to equipped', () => {
      const item = createTestItem();
      const equippedItem = setItemEquipped(item, true);
      expect(isItemEquipped(equippedItem)).toBe(true);
    });

    it('should set item to unequipped', () => {
      const item = createTestItem({ equipped: true });
      const unequippedItem = setItemEquipped(item, false);
      expect(isItemEquipped(unequippedItem)).toBe(false);
    });
  });

  describe('toggleItemEquipped', () => {
    it('should toggle unequipped to equipped', () => {
      const item = createTestItem();
      const toggled = toggleItemEquipped(item);
      expect(isItemEquipped(toggled)).toBe(true);
    });

    it('should toggle equipped to unequipped', () => {
      const item = createTestItem({ equipped: true });
      const toggled = toggleItemEquipped(item);
      expect(isItemEquipped(toggled)).toBe(false);
    });
  });
});

// =============================================================================
// Tests: Wielded State Helpers
// =============================================================================

describe('Wielded State Helpers', () => {
  describe('WIELDED_FIELD', () => {
    it('should have correct default configuration', () => {
      expect(WIELDED_FIELD.name).toBe('wielded');
      expect(WIELDED_FIELD.type).toBe('boolean');
      expect(WIELDED_FIELD.default).toBe(false);
    });
  });

  describe('isItemWielded', () => {
    it('should return false for item without instanceValues', () => {
      const item = createTestItem();
      expect(isItemWielded(item)).toBe(false);
    });

    it('should return true when wielded is true', () => {
      const item = createTestItem({ wielded: true });
      expect(isItemWielded(item)).toBe(true);
    });
  });

  describe('setItemWielded', () => {
    it('should set item to wielded', () => {
      const item = createTestItem();
      const wieldedItem = setItemWielded(item, true);
      expect(isItemWielded(wieldedItem)).toBe(true);
    });
  });

  describe('toggleItemWielded', () => {
    it('should toggle unwielded to wielded', () => {
      const item = createTestItem();
      const toggled = toggleItemWielded(item);
      expect(isItemWielded(toggled)).toBe(true);
    });
  });
});

// =============================================================================
// Tests: Integration with activable addon
// =============================================================================

describe('Activable Addon Integration', () => {
  it('should have instanceFields defined', () => {
    expect(activableAddon.instanceFields).toBeDefined();
    expect(activableAddon.instanceFields).toHaveLength(1);
  });

  it('active field should match ACTIVE_FIELD constant', () => {
    const activeField = activableAddon.instanceFields![0];
    expect(activeField.name).toBe(ACTIVE_FIELD.name);
    expect(activeField.type).toBe(ACTIVE_FIELD.type);
    expect(activeField.default).toBe(ACTIVE_FIELD.default);
  });
});

// =============================================================================
// Tests: Integration with equippable/wieldable addons
// =============================================================================

describe('Equippable Addon Integration', () => {
  it('should have instanceFields defined', () => {
    expect(equippableAddon.instanceFields).toBeDefined();
    expect(equippableAddon.instanceFields).toHaveLength(1);
  });

  it('equipped field should match EQUIPPED_FIELD constant', () => {
    const equippedField = equippableAddon.instanceFields![0];
    expect(equippedField.name).toBe(EQUIPPED_FIELD.name);
    expect(equippedField.type).toBe(EQUIPPED_FIELD.type);
    expect(equippedField.default).toBe(EQUIPPED_FIELD.default);
  });
});

describe('Wieldable Addon Integration', () => {
  it('should have instanceFields defined', () => {
    expect(wieldableAddon.instanceFields).toBeDefined();
    expect(wieldableAddon.instanceFields).toHaveLength(1);
  });

  it('wielded field should match WIELDED_FIELD constant', () => {
    const wieldedField = wieldableAddon.instanceFields![0];
    expect(wieldedField.name).toBe(WIELDED_FIELD.name);
    expect(wieldedField.type).toBe(WIELDED_FIELD.type);
    expect(wieldedField.default).toBe(WIELDED_FIELD.default);
  });
});

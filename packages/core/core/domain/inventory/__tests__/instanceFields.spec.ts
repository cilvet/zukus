/**
 * Tests for Instance Fields in Inventory
 *
 * Los valores de instancia (equipped, wielded, active) son campos NORMALES
 * de la entidad. Los helpers simplemente leen/escriben entity.fieldName.
 */

import { describe, expect, it } from 'bun:test';
import {
  isItemActive,
  setItemActive,
  toggleItemActive,
  isItemEquipped,
  setItemEquipped,
  toggleItemEquipped,
  isItemWielded,
  setItemWielded,
  toggleItemWielded,
} from '../instanceFields';
import type { InventoryItemInstance, ResolvedInventoryEntity } from '../types';

// =============================================================================
// Test Data
// =============================================================================

function createTestItem(
  entityOverrides: Partial<ResolvedInventoryEntity> = {}
): InventoryItemInstance {
  return {
    instanceId: 'test-instance-1',
    itemId: 'test-item',
    entityType: 'item',
    quantity: 1,
    entity: {
      id: 'test-item',
      entityType: 'item',
      name: 'Test Item',
      equipped: false,
      wielded: false,
      active: false,
      ...entityOverrides,
    },
  };
}

function createItemWithoutEntity(): InventoryItemInstance {
  return {
    instanceId: 'test-instance-1',
    itemId: 'test-item',
    entityType: 'item',
    quantity: 1,
  };
}

// =============================================================================
// Tests: Equipped State Helpers
// =============================================================================

describe('Equipped State Helpers', () => {
  describe('isItemEquipped', () => {
    it('should return false for item without entity', () => {
      const item = createItemWithoutEntity();
      expect(isItemEquipped(item)).toBe(false);
    });

    it('should return false when equipped is false', () => {
      const item = createTestItem({ equipped: false });
      expect(isItemEquipped(item)).toBe(false);
    });

    it('should return true when equipped is true', () => {
      const item = createTestItem({ equipped: true });
      expect(isItemEquipped(item)).toBe(true);
    });
  });

  describe('setItemEquipped', () => {
    it('should set item to equipped', () => {
      const item = createTestItem({ equipped: false });
      const equippedItem = setItemEquipped(item, true);

      expect(isItemEquipped(equippedItem)).toBe(true);
      expect(equippedItem.entity?.equipped).toBe(true);
    });

    it('should set item to unequipped', () => {
      const item = createTestItem({ equipped: true });
      const unequippedItem = setItemEquipped(item, false);

      expect(isItemEquipped(unequippedItem)).toBe(false);
      expect(unequippedItem.entity?.equipped).toBe(false);
    });

    it('should return same item when entity is missing', () => {
      const item = createItemWithoutEntity();
      const result = setItemEquipped(item, true);

      expect(result).toBe(item);
    });

    it('should preserve other entity fields', () => {
      const item = createTestItem({ name: 'Longsword', wielded: true });
      const equippedItem = setItemEquipped(item, true);

      expect(equippedItem.entity?.name).toBe('Longsword');
      expect(equippedItem.entity?.wielded).toBe(true);
    });
  });

  describe('toggleItemEquipped', () => {
    it('should toggle unequipped to equipped', () => {
      const item = createTestItem({ equipped: false });
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
  describe('isItemWielded', () => {
    it('should return false for item without entity', () => {
      const item = createItemWithoutEntity();
      expect(isItemWielded(item)).toBe(false);
    });

    it('should return false when wielded is false', () => {
      const item = createTestItem({ wielded: false });
      expect(isItemWielded(item)).toBe(false);
    });

    it('should return true when wielded is true', () => {
      const item = createTestItem({ wielded: true });
      expect(isItemWielded(item)).toBe(true);
    });
  });

  describe('setItemWielded', () => {
    it('should set item to wielded', () => {
      const item = createTestItem({ wielded: false });
      const wieldedItem = setItemWielded(item, true);

      expect(isItemWielded(wieldedItem)).toBe(true);
      expect(wieldedItem.entity?.wielded).toBe(true);
    });

    it('should set item to unwielded', () => {
      const item = createTestItem({ wielded: true });
      const unwieldedItem = setItemWielded(item, false);

      expect(isItemWielded(unwieldedItem)).toBe(false);
    });

    it('should return same item when entity is missing', () => {
      const item = createItemWithoutEntity();
      const result = setItemWielded(item, true);

      expect(result).toBe(item);
    });
  });

  describe('toggleItemWielded', () => {
    it('should toggle unwielded to wielded', () => {
      const item = createTestItem({ wielded: false });
      const toggled = toggleItemWielded(item);
      expect(isItemWielded(toggled)).toBe(true);
    });

    it('should toggle wielded to unwielded', () => {
      const item = createTestItem({ wielded: true });
      const toggled = toggleItemWielded(item);
      expect(isItemWielded(toggled)).toBe(false);
    });
  });
});

// =============================================================================
// Tests: Active State Helpers
// =============================================================================

describe('Active State Helpers', () => {
  describe('isItemActive', () => {
    it('should return false for item without entity', () => {
      const item = createItemWithoutEntity();
      expect(isItemActive(item)).toBe(false);
    });

    it('should return false when active is false', () => {
      const item = createTestItem({ active: false });
      expect(isItemActive(item)).toBe(false);
    });

    it('should return true when active is true', () => {
      const item = createTestItem({ active: true });
      expect(isItemActive(item)).toBe(true);
    });
  });

  describe('setItemActive', () => {
    it('should set item to active', () => {
      const item = createTestItem({ active: false });
      const activeItem = setItemActive(item, true);

      expect(isItemActive(activeItem)).toBe(true);
      expect(activeItem.entity?.active).toBe(true);
    });

    it('should set item to inactive', () => {
      const item = createTestItem({ active: true });
      const inactiveItem = setItemActive(item, false);

      expect(isItemActive(inactiveItem)).toBe(false);
    });

    it('should return same item when entity is missing', () => {
      const item = createItemWithoutEntity();
      const result = setItemActive(item, true);

      expect(result).toBe(item);
    });
  });

  describe('toggleItemActive', () => {
    it('should toggle inactive to active', () => {
      const item = createTestItem({ active: false });
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
// Tests: Immutability
// =============================================================================

describe('Immutability', () => {
  it('should not modify original item when setting equipped', () => {
    const item = createTestItem({ equipped: false });
    const equippedItem = setItemEquipped(item, true);

    expect(item.entity?.equipped).toBe(false);
    expect(equippedItem.entity?.equipped).toBe(true);
    expect(item).not.toBe(equippedItem);
  });

  it('should not modify original entity object', () => {
    const item = createTestItem({ equipped: false });
    const originalEntity = item.entity;
    setItemEquipped(item, true);

    expect(originalEntity?.equipped).toBe(false);
  });
});

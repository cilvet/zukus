import { describe, it, expect } from 'bun:test';
import { buildCharacter } from '../../../../tests/character/buildCharacter';
import {
  addItem,
  removeItem,
  updateItem,
  toggleItemEquipped,
  updateEquipment,
} from '../operations/itemOperations';
import type { Item } from '../../baseData/equipment';

describe('addItem', () => {
  it('should add an item to inventory', () => {
    const newItem: Item = {
      uniqueId: 'item-1',
      name: 'Test Item',
      description: 'A test item',
      equipped: false,
      weight: 1,
    };

    const character = buildCharacter().build();
    const result = addItem(character, newItem);

    expect(result.warnings).toHaveLength(0);
    expect(result.character.equipment.items).toHaveLength(1);
    expect(result.character.equipment.items[0].uniqueId).toBe('item-1');
  });

  it('should add item to existing inventory', () => {
    const existingItem: Item = {
      uniqueId: 'item-1',
      name: 'Existing Item',
      description: 'An existing item',
      equipped: false,
      weight: 1,
    };

    const newItem: Item = {
      uniqueId: 'item-2',
      name: 'New Item',
      description: 'A new item',
      equipped: false,
      weight: 2,
    };

    const character = buildCharacter()
      .withItemEquipped(existingItem)
      .build();
    const result = addItem(character, newItem);

    expect(result.warnings).toHaveLength(0);
    expect(result.character.equipment.items).toHaveLength(2);
  });
});

describe('removeItem', () => {
  it('should remove an existing item', () => {
    const item: Item = {
      uniqueId: 'item-1',
      name: 'Test Item',
      description: 'A test item',
      equipped: false,
      weight: 1,
    };

    const character = buildCharacter().withItemEquipped(item).build();
    const result = removeItem(character, 'item-1');

    expect(result.warnings).toHaveLength(0);
    expect(result.character.equipment.items).toHaveLength(0);
  });

  it('should return warning if item not found', () => {
    const character = buildCharacter().build();
    const result = removeItem(character, 'nonexistent');

    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].type).toBe('not_found');
  });
});

describe('updateItem', () => {
  it('should update an existing item', () => {
    const originalItem: Item = {
      uniqueId: 'item-1',
      name: 'Original Name',
      description: 'Original description',
      equipped: false,
      weight: 1,
    };

    const updatedItem: Item = {
      ...originalItem,
      name: 'Updated Name',
      weight: 2,
    };

    const character = buildCharacter().withItemEquipped(originalItem).build();
    const result = updateItem(character, updatedItem);

    expect(result.warnings).toHaveLength(0);
    expect(result.character.equipment.items[0].name).toBe('Updated Name');
    expect(result.character.equipment.items[0].weight).toBe(2);
  });

  it('should return warning if item not found', () => {
    const nonexistentItem: Item = {
      uniqueId: 'nonexistent',
      name: 'Test',
      description: 'Test',
      equipped: false,
      weight: 1,
    };

    const character = buildCharacter().build();
    const result = updateItem(character, nonexistentItem);

    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].type).toBe('not_found');
  });
});

describe('toggleItemEquipped', () => {
  it('should toggle item from not equipped to equipped', () => {
    const item: Item = {
      uniqueId: 'item-1',
      name: 'Test Item',
      description: 'A test item',
      equipped: false,
      weight: 1,
    };

    const character = buildCharacter().withItemEquipped(item).build();
    character.equipment.items[0].equipped = false;

    const result = toggleItemEquipped(character, 'item-1');

    expect(result.warnings).toHaveLength(0);
    expect(result.character.equipment.items[0].equipped).toBe(true);
  });

  it('should toggle item from equipped to not equipped', () => {
    const item: Item = {
      uniqueId: 'item-1',
      name: 'Test Item',
      description: 'A test item',
      equipped: true,
      weight: 1,
    };

    const character = buildCharacter().withItemEquipped(item).build();
    const result = toggleItemEquipped(character, 'item-1');

    expect(result.warnings).toHaveLength(0);
    expect(result.character.equipment.items[0].equipped).toBe(false);
  });

  it('should return warning if item not found', () => {
    const character = buildCharacter().build();
    const result = toggleItemEquipped(character, 'nonexistent');

    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].type).toBe('not_found');
  });
});

describe('updateEquipment', () => {
  it('should replace entire equipment', () => {
    const newEquipment = {
      items: [
        {
          uniqueId: 'new-item',
          name: 'New Item',
          description: 'A new item',
          equipped: true,
          weight: 1,
        },
      ],
    };

    const character = buildCharacter().build();
    const result = updateEquipment(character, newEquipment);

    expect(result.warnings).toHaveLength(0);
    expect(result.character.equipment.items).toHaveLength(1);
    expect(result.character.equipment.items[0].uniqueId).toBe('new-item');
  });
});


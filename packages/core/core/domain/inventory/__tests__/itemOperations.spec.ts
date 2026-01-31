import { describe, expect, it } from 'bun:test';
import {
  addItem,
  removeItem,
  updateItem,
  setItemEquipped,
  toggleItemEquipped,
  setWeaponWielded,
  getItem,
  getItemsByType,
  getEquippedItems,
  getRootItems,
  addOrStackItem,
} from '../itemOperations';
import { createEmptyInventoryState, type InventoryState, type ResolvedInventoryEntity } from '../types';
import { isItemEquipped, isItemWielded } from '../instanceFields';

// Helper para crear entidades de test con valores de instancia
function createTestEntity(overrides: Partial<ResolvedInventoryEntity> = {}): ResolvedInventoryEntity {
  return {
    id: 'test',
    entityType: 'item',
    name: 'Test Item',
    equipped: false,
    wielded: false,
    active: false,
    ...overrides,
  };
}

function createStateWithItems(): InventoryState {
  return {
    items: [
      {
        instanceId: 'inst-1',
        itemId: 'longsword',
        entityType: 'weapon',
        quantity: 1,
        entity: createTestEntity({ id: 'longsword', entityType: 'weapon', name: 'Longsword', equipped: false }),
      },
      {
        instanceId: 'inst-2',
        itemId: 'chainmail',
        entityType: 'armor',
        quantity: 1,
        entity: createTestEntity({ id: 'chainmail', entityType: 'armor', name: 'Chainmail', equipped: true }),
      },
      {
        instanceId: 'inst-3',
        itemId: 'health-potion',
        entityType: 'item',
        quantity: 5,
        entity: createTestEntity({ id: 'health-potion', entityType: 'item', name: 'Health Potion', equipped: false }),
      },
    ],
    currencies: {},
  };
}

describe('addItem', () => {
  it('adds a new item to empty inventory', () => {
    const state = createEmptyInventoryState();
    const result = addItem(state, {
      itemId: 'longsword',
      entityType: 'weapon',
      entity: createTestEntity({ id: 'longsword', entityType: 'weapon', name: 'Longsword' }),
    });

    expect(result.warnings).toHaveLength(0);
    expect(result.state.items).toHaveLength(1);
    expect(result.instance.itemId).toBe('longsword');
    expect(result.instance.entityType).toBe('weapon');
    expect(result.instance.quantity).toBe(1);
    expect(isItemEquipped(result.instance)).toBe(false);
    expect(result.instance.instanceId).toBeDefined();
  });

  it('adds item with custom quantity and name', () => {
    const state = createEmptyInventoryState();
    const result = addItem(state, {
      itemId: 'arrow',
      entityType: 'item',
      quantity: 20,
      customName: 'Silver Arrows',
      entity: createTestEntity({ id: 'arrow', entityType: 'item', name: 'Arrow' }),
    });

    expect(result.instance.quantity).toBe(20);
    expect(result.instance.customName).toBe('Silver Arrows');
  });

  it('adds item as equipped', () => {
    const state = createEmptyInventoryState();
    const result = addItem(state, {
      itemId: 'shield',
      entityType: 'shield',
      equipped: true,
      entity: createTestEntity({ id: 'shield', entityType: 'shield', name: 'Shield', equipped: false }),
    });

    expect(isItemEquipped(result.instance)).toBe(true);
    expect(result.instance.entity?.equipped).toBe(true);
  });

  it('preserves existing items when adding new one', () => {
    const state = createStateWithItems();
    const result = addItem(state, {
      itemId: 'dagger',
      entityType: 'weapon',
      entity: createTestEntity({ id: 'dagger', entityType: 'weapon', name: 'Dagger' }),
    });

    expect(result.state.items).toHaveLength(4);
  });
});

describe('removeItem', () => {
  it('removes item completely when no quantity specified', () => {
    const state = createStateWithItems();
    const result = removeItem(state, 'inst-1');

    expect(result.warnings).toHaveLength(0);
    expect(result.state.items).toHaveLength(2);
    expect(result.state.items.find((i) => i.instanceId === 'inst-1')).toBeUndefined();
  });

  it('reduces quantity when quantity specified', () => {
    const state = createStateWithItems();
    const result = removeItem(state, 'inst-3', 2); // health-potion has 5

    expect(result.warnings).toHaveLength(0);
    const item = result.state.items.find((i) => i.instanceId === 'inst-3');
    expect(item?.quantity).toBe(3);
  });

  it('removes item when quantity equals current quantity', () => {
    const state = createStateWithItems();
    const result = removeItem(state, 'inst-3', 5);

    expect(result.warnings).toHaveLength(0);
    expect(result.state.items.find((i) => i.instanceId === 'inst-3')).toBeUndefined();
  });

  it('removes item when quantity exceeds current quantity', () => {
    const state = createStateWithItems();
    const result = removeItem(state, 'inst-3', 100);

    expect(result.warnings).toHaveLength(0);
    expect(result.state.items.find((i) => i.instanceId === 'inst-3')).toBeUndefined();
  });

  it('returns warning for non-existent item', () => {
    const state = createStateWithItems();
    const result = removeItem(state, 'non-existent');

    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].type).toBe('item_not_found');
  });

  it('returns warning for invalid quantity', () => {
    const state = createStateWithItems();
    const result = removeItem(state, 'inst-1', 0);

    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].type).toBe('invalid_amount');
  });
});

describe('updateItem', () => {
  it('updates item quantity', () => {
    const state = createStateWithItems();
    const result = updateItem(state, 'inst-3', { quantity: 10 });

    expect(result.warnings).toHaveLength(0);
    const item = result.state.items.find((i) => i.instanceId === 'inst-3');
    expect(item?.quantity).toBe(10);
  });

  it('updates item notes', () => {
    const state = createStateWithItems();
    const result = updateItem(state, 'inst-1', { notes: 'Family heirloom' });

    expect(result.warnings).toHaveLength(0);
    const item = result.state.items.find((i) => i.instanceId === 'inst-1');
    expect(item?.notes).toBe('Family heirloom');
  });

  it('returns warning for non-existent item', () => {
    const state = createStateWithItems();
    const result = updateItem(state, 'non-existent', { quantity: 5 });

    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].type).toBe('item_not_found');
  });
});

describe('setItemEquipped', () => {
  it('equips an unequipped item', () => {
    const state = createStateWithItems();
    const result = setItemEquipped(state, 'inst-1', true);

    expect(result.warnings).toHaveLength(0);
    const item = result.state.items.find((i) => i.instanceId === 'inst-1');
    expect(item).toBeDefined();
    expect(isItemEquipped(item!)).toBe(true);
  });

  it('unequips an equipped item', () => {
    const state = createStateWithItems();
    const result = setItemEquipped(state, 'inst-2', false); // chainmail is equipped

    expect(result.warnings).toHaveLength(0);
    const item = result.state.items.find((i) => i.instanceId === 'inst-2');
    expect(item).toBeDefined();
    expect(isItemEquipped(item!)).toBe(false);
  });
});

describe('toggleItemEquipped', () => {
  it('toggles unequipped to equipped', () => {
    const state = createStateWithItems();
    const result = toggleItemEquipped(state, 'inst-1');

    expect(result.warnings).toHaveLength(0);
    const item = result.state.items.find((i) => i.instanceId === 'inst-1');
    expect(item).toBeDefined();
    expect(isItemEquipped(item!)).toBe(true);
  });

  it('toggles equipped to unequipped', () => {
    const state = createStateWithItems();
    const result = toggleItemEquipped(state, 'inst-2');

    expect(result.warnings).toHaveLength(0);
    const item = result.state.items.find((i) => i.instanceId === 'inst-2');
    expect(item).toBeDefined();
    expect(isItemEquipped(item!)).toBe(false);
  });

  it('returns warning for non-existent item', () => {
    const state = createStateWithItems();
    const result = toggleItemEquipped(state, 'non-existent');

    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].type).toBe('item_not_found');
  });
});

describe('setWeaponWielded', () => {
  it('sets weapon as wielded', () => {
    const state = createStateWithItems();
    const result = setWeaponWielded(state, 'inst-1', true);

    expect(result.warnings).toHaveLength(0);
    const item = result.state.items.find((i) => i.instanceId === 'inst-1');
    expect(item).toBeDefined();
    expect(isItemWielded(item!)).toBe(true);
  });

  it('sets weapon as not wielded', () => {
    const state: InventoryState = {
      items: [
        {
          instanceId: 'inst-1',
          itemId: 'longsword',
          entityType: 'weapon',
          quantity: 1,
          entity: createTestEntity({ id: 'longsword', entityType: 'weapon', name: 'Longsword', equipped: true, wielded: true }),
        },
      ],
      currencies: {},
    };
    const result = setWeaponWielded(state, 'inst-1', false);

    expect(result.warnings).toHaveLength(0);
    const item = result.state.items.find((i) => i.instanceId === 'inst-1');
    expect(item).toBeDefined();
    expect(isItemWielded(item!)).toBe(false);
  });
});

describe('getItem', () => {
  it('returns item by instanceId', () => {
    const state = createStateWithItems();
    const item = getItem(state, 'inst-2');

    expect(item).toBeDefined();
    expect(item?.itemId).toBe('chainmail');
  });

  it('returns undefined for non-existent item', () => {
    const state = createStateWithItems();
    const item = getItem(state, 'non-existent');

    expect(item).toBeUndefined();
  });
});

describe('getItemsByType', () => {
  it('returns all items of a type', () => {
    const state: InventoryState = {
      items: [
        { instanceId: '1', itemId: 'sword', entityType: 'weapon', quantity: 1, entity: createTestEntity({ id: 'sword', entityType: 'weapon' }) },
        { instanceId: '2', itemId: 'armor', entityType: 'armor', quantity: 1, entity: createTestEntity({ id: 'armor', entityType: 'armor' }) },
        { instanceId: '3', itemId: 'dagger', entityType: 'weapon', quantity: 1, entity: createTestEntity({ id: 'dagger', entityType: 'weapon' }) },
      ],
      currencies: {},
    };
    const weapons = getItemsByType(state, 'weapon');

    expect(weapons).toHaveLength(2);
    expect(weapons.every((i) => i.entityType === 'weapon')).toBe(true);
  });

  it('returns empty array for non-existent type', () => {
    const state = createStateWithItems();
    const items = getItemsByType(state, 'wand');

    expect(items).toHaveLength(0);
  });
});

describe('getEquippedItems', () => {
  it('returns only equipped items', () => {
    const state = createStateWithItems();
    const equipped = getEquippedItems(state);

    expect(equipped).toHaveLength(1);
    expect(equipped[0].instanceId).toBe('inst-2');
  });

  it('returns empty array when nothing equipped', () => {
    const state = createEmptyInventoryState();
    const equipped = getEquippedItems(state);

    expect(equipped).toHaveLength(0);
  });
});

describe('getRootItems', () => {
  it('returns items without containerId', () => {
    const state: InventoryState = {
      items: [
        { instanceId: '1', itemId: 'sword', entityType: 'weapon', quantity: 1, entity: createTestEntity() },
        {
          instanceId: '2',
          itemId: 'potion',
          entityType: 'item',
          quantity: 1,
          containerId: 'backpack-1',
          entity: createTestEntity(),
        },
        { instanceId: '3', itemId: 'shield', entityType: 'shield', quantity: 1, entity: createTestEntity() },
      ],
      currencies: {},
    };
    const rootItems = getRootItems(state);

    expect(rootItems).toHaveLength(2);
    expect(rootItems.every((i) => !i.containerId)).toBe(true);
  });
});

describe('addOrStackItem', () => {
  it('stacks item with existing same item', () => {
    const state: InventoryState = {
      items: [
        {
          instanceId: 'inst-1',
          itemId: 'arrow',
          entityType: 'item',
          quantity: 10,
          entity: createTestEntity({ id: 'arrow', entityType: 'item', name: 'Arrow', equipped: false }),
        },
      ],
      currencies: {},
    };
    const result = addOrStackItem(state, 'arrow', 'item', 5);

    expect(result.warnings).toHaveLength(0);
    expect(result.state.items).toHaveLength(1);
    const item = result.state.items.find((i) => i.instanceId === 'inst-1');
    expect(item?.quantity).toBe(15);
    expect(result.instanceId).toBe('inst-1');
  });

  it('creates new item when no stackable item exists', () => {
    const state = createEmptyInventoryState();
    const result = addOrStackItem(state, 'arrow', 'item', 20);

    expect(result.warnings).toHaveLength(0);
    expect(result.state.items).toHaveLength(1);
    expect(result.state.items[0].quantity).toBe(20);
  });

  it('does not stack with equipped items', () => {
    const state: InventoryState = {
      items: [
        {
          instanceId: 'inst-1',
          itemId: 'ring',
          entityType: 'item',
          quantity: 1,
          entity: createTestEntity({ id: 'ring', entityType: 'item', name: 'Ring', equipped: true }),
        },
      ],
      currencies: {},
    };
    const result = addOrStackItem(state, 'ring', 'item', 1);

    expect(result.state.items).toHaveLength(2);
  });

  it('does not stack with items in containers', () => {
    const state: InventoryState = {
      items: [
        {
          instanceId: 'inst-1',
          itemId: 'potion',
          entityType: 'item',
          quantity: 5,
          containerId: 'backpack',
          entity: createTestEntity({ id: 'potion', entityType: 'item', name: 'Potion', equipped: false }),
        },
      ],
      currencies: {},
    };
    const result = addOrStackItem(state, 'potion', 'item', 3);

    expect(result.state.items).toHaveLength(2);
  });

  it('does not stack with items with custom name', () => {
    const state: InventoryState = {
      items: [
        {
          instanceId: 'inst-1',
          itemId: 'potion',
          entityType: 'item',
          quantity: 5,
          customName: 'Special Potion',
          entity: createTestEntity({ id: 'potion', entityType: 'item', name: 'Potion', equipped: false }),
        },
      ],
      currencies: {},
    };
    const result = addOrStackItem(state, 'potion', 'item', 3);

    expect(result.state.items).toHaveLength(2);
  });
});

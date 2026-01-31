import { describe, expect, it } from 'bun:test';
import {
  moveToContainer,
  removeFromContainer,
  getContainerContents,
  isItemInContainer,
  getContainerChain,
} from '../containerOperations';
import type { InventoryState } from '../types';

function createTestState(): InventoryState {
  return {
    items: [
      {
        instanceId: 'backpack-1',
        itemId: 'backpack',
        entityType: 'item',
        quantity: 1,
        equipped: false,
      },
      {
        instanceId: 'pouch-1',
        itemId: 'belt-pouch',
        entityType: 'item',
        quantity: 1,
        equipped: false,
      },
      {
        instanceId: 'sword-1',
        itemId: 'longsword',
        entityType: 'weapon',
        quantity: 1,
        equipped: true,
      },
      {
        instanceId: 'potion-1',
        itemId: 'healing-potion',
        entityType: 'item',
        quantity: 3,
        equipped: false,
      },
      {
        instanceId: 'gold-coin',
        itemId: 'gold-coin',
        entityType: 'item',
        quantity: 50,
        equipped: false,
        containerId: 'pouch-1',
      },
    ],
    currencies: {},
  };
}

describe('moveToContainer', () => {
  it('moves item into container', () => {
    const state = createTestState();
    const result = moveToContainer(state, 'potion-1', 'backpack-1');

    expect(result.warnings).toHaveLength(0);
    const item = result.state.items.find((i) => i.instanceId === 'potion-1');
    expect(item?.containerId).toBe('backpack-1');
  });

  it('returns warning for non-existent item', () => {
    const state = createTestState();
    const result = moveToContainer(state, 'non-existent', 'backpack-1');

    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].type).toBe('item_not_found');
  });

  it('returns warning for non-existent container', () => {
    const state = createTestState();
    const result = moveToContainer(state, 'potion-1', 'non-existent');

    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].type).toBe('container_not_found');
  });

  it('returns warning when moving item to itself', () => {
    const state = createTestState();
    const result = moveToContainer(state, 'backpack-1', 'backpack-1');

    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].type).toBe('invalid_container');
  });

  it('returns warning for circular reference', () => {
    // Put pouch inside backpack first
    const state = createTestState();
    const result1 = moveToContainer(state, 'pouch-1', 'backpack-1');

    // Now try to put backpack inside pouch (circular)
    const result2 = moveToContainer(result1.state, 'backpack-1', 'pouch-1');

    expect(result2.warnings).toHaveLength(1);
    expect(result2.warnings[0].type).toBe('invalid_container');
  });

  it('moves item that was already in another container', () => {
    const state = createTestState();
    // gold-coin is already in pouch-1
    const result = moveToContainer(state, 'gold-coin', 'backpack-1');

    expect(result.warnings).toHaveLength(0);
    const item = result.state.items.find((i) => i.instanceId === 'gold-coin');
    expect(item?.containerId).toBe('backpack-1');
  });
});

describe('removeFromContainer', () => {
  it('removes item from container', () => {
    const state = createTestState();
    // gold-coin is in pouch-1
    const result = removeFromContainer(state, 'gold-coin');

    expect(result.warnings).toHaveLength(0);
    const item = result.state.items.find((i) => i.instanceId === 'gold-coin');
    expect(item?.containerId).toBeUndefined();
  });

  it('returns warning for non-existent item', () => {
    const state = createTestState();
    const result = removeFromContainer(state, 'non-existent');

    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].type).toBe('item_not_found');
  });

  it('does nothing for item not in container', () => {
    const state = createTestState();
    const result = removeFromContainer(state, 'sword-1');

    expect(result.warnings).toHaveLength(0);
    // State should be unchanged
    expect(result.state).toEqual(state);
  });
});

describe('getContainerContents', () => {
  it('returns items in container', () => {
    const state = createTestState();
    const contents = getContainerContents(state, 'pouch-1');

    expect(contents).toHaveLength(1);
    expect(contents[0].instanceId).toBe('gold-coin');
  });

  it('returns empty array for empty container', () => {
    const state = createTestState();
    const contents = getContainerContents(state, 'backpack-1');

    expect(contents).toHaveLength(0);
  });

  it('returns empty array for non-existent container', () => {
    const state = createTestState();
    const contents = getContainerContents(state, 'non-existent');

    expect(contents).toHaveLength(0);
  });
});

describe('isItemInContainer', () => {
  it('returns true for direct containment', () => {
    const state = createTestState();
    const result = isItemInContainer(state, 'gold-coin', 'pouch-1');

    expect(result).toBe(true);
  });

  it('returns false for item not in container', () => {
    const state = createTestState();
    const result = isItemInContainer(state, 'sword-1', 'backpack-1');

    expect(result).toBe(false);
  });

  it('returns true for nested containment', () => {
    const state = createTestState();
    // Put pouch-1 inside backpack-1
    const result1 = moveToContainer(state, 'pouch-1', 'backpack-1');

    // gold-coin is in pouch-1, which is in backpack-1
    const result = isItemInContainer(result1.state, 'gold-coin', 'backpack-1');

    expect(result).toBe(true);
  });

  it('returns false for non-existent item', () => {
    const state = createTestState();
    const result = isItemInContainer(state, 'non-existent', 'backpack-1');

    expect(result).toBe(false);
  });
});

describe('getContainerChain', () => {
  it('returns chain of containers', () => {
    const state = createTestState();
    // Put pouch-1 inside backpack-1
    const result1 = moveToContainer(state, 'pouch-1', 'backpack-1');

    // gold-coin is in pouch-1, which is in backpack-1
    const chain = getContainerChain(result1.state, 'gold-coin');

    expect(chain).toEqual(['pouch-1', 'backpack-1']);
  });

  it('returns single container for direct containment', () => {
    const state = createTestState();
    const chain = getContainerChain(state, 'gold-coin');

    expect(chain).toEqual(['pouch-1']);
  });

  it('returns empty array for root item', () => {
    const state = createTestState();
    const chain = getContainerChain(state, 'sword-1');

    expect(chain).toHaveLength(0);
  });

  it('returns empty array for non-existent item', () => {
    const state = createTestState();
    const chain = getContainerChain(state, 'non-existent');

    expect(chain).toHaveLength(0);
  });
});

import { describe, expect, it } from 'bun:test';
import {
  calculateItemWeight,
  calculateContainerContentWeight,
  calculateWeightBreakdown,
  calculateTotalWeight,
  wouldExceedCapacity,
  type ItemEntityResolver,
  type ItemEntityInfo,
} from '../weightCalculations';
import type { InventoryState } from '../types';
import type { CurrencyDefinition } from '../currencies/types';

// Mock entity data
const mockEntities: Record<string, ItemEntityInfo> = {
  longsword: { id: 'longsword', weight: 4 },
  dagger: { id: 'dagger', weight: 1 },
  chainmail: { id: 'chainmail', weight: 40 },
  backpack: { id: 'backpack', weight: 2, capacity: 60 },
  'bag-of-holding': { id: 'bag-of-holding', weight: 15, capacity: 500, ignoresContentWeight: true },
  potion: { id: 'potion', weight: 0.5 },
  'belt-pouch': { id: 'belt-pouch', weight: 0.5, capacity: 10 },
};

const mockResolver: ItemEntityResolver = (itemId) => mockEntities[itemId];

const mockCurrencies: CurrencyDefinition[] = [
  {
    id: 'gold',
    entityType: 'currency',
    name: 'Gold',
    abbreviation: 'gp',
    conversionToBase: 1,
    weightPerUnit: 0.02,
  },
];

describe('calculateItemWeight', () => {
  it('calculates weight for single item', () => {
    const item = {
      instanceId: '1',
      itemId: 'longsword',
      entityType: 'weapon',
      quantity: 1,
      equipped: false,
    };
    const weight = calculateItemWeight(item, mockResolver);

    expect(weight).toBe(4);
  });

  it('calculates weight with quantity', () => {
    const item = {
      instanceId: '1',
      itemId: 'potion',
      entityType: 'item',
      quantity: 5,
      equipped: false,
    };
    const weight = calculateItemWeight(item, mockResolver);

    expect(weight).toBe(2.5); // 0.5 * 5
  });

  it('returns 0 for unknown item', () => {
    const item = {
      instanceId: '1',
      itemId: 'unknown',
      entityType: 'item',
      quantity: 1,
      equipped: false,
    };
    const weight = calculateItemWeight(item, mockResolver);

    expect(weight).toBe(0);
  });
});

describe('calculateContainerContentWeight', () => {
  it('calculates weight of items in container', () => {
    const state: InventoryState = {
      items: [
        {
          instanceId: 'backpack-1',
          itemId: 'backpack',
          entityType: 'item',
          quantity: 1,
          equipped: false,
        },
        {
          instanceId: 'potion-1',
          itemId: 'potion',
          entityType: 'item',
          quantity: 4,
          equipped: false,
          containerId: 'backpack-1',
        },
      ],
      currencies: {},
    };

    const weight = calculateContainerContentWeight(state, 'backpack-1', mockResolver);
    expect(weight).toBe(2); // 0.5 * 4
  });

  it('returns 0 for bag of holding content', () => {
    const state: InventoryState = {
      items: [
        {
          instanceId: 'bag-1',
          itemId: 'bag-of-holding',
          entityType: 'item',
          quantity: 1,
          equipped: false,
        },
        {
          instanceId: 'chainmail-1',
          itemId: 'chainmail',
          entityType: 'armor',
          quantity: 1,
          equipped: false,
          containerId: 'bag-1',
        },
      ],
      currencies: {},
    };

    const weight = calculateContainerContentWeight(state, 'bag-1', mockResolver);
    expect(weight).toBe(0); // ignoresContentWeight = true
  });

  it('includes nested container contents', () => {
    const state: InventoryState = {
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
          containerId: 'backpack-1',
        },
        {
          instanceId: 'dagger-1',
          itemId: 'dagger',
          entityType: 'weapon',
          quantity: 1,
          equipped: false,
          containerId: 'pouch-1',
        },
      ],
      currencies: {},
    };

    const weight = calculateContainerContentWeight(state, 'backpack-1', mockResolver);
    // pouch weight (0.5) + dagger weight (1) = 1.5
    expect(weight).toBe(1.5);
  });
});

describe('calculateWeightBreakdown', () => {
  it('separates equipped and carried weight', () => {
    const state: InventoryState = {
      items: [
        {
          instanceId: 'sword-1',
          itemId: 'longsword',
          entityType: 'weapon',
          quantity: 1,
          equipped: true,
        },
        {
          instanceId: 'armor-1',
          itemId: 'chainmail',
          entityType: 'armor',
          quantity: 1,
          equipped: true,
        },
        {
          instanceId: 'potion-1',
          itemId: 'potion',
          entityType: 'item',
          quantity: 10,
          equipped: false,
        },
      ],
      currencies: {},
    };

    const breakdown = calculateWeightBreakdown(state, mockResolver);

    expect(breakdown.equippedWeight).toBe(44); // sword (4) + chainmail (40)
    expect(breakdown.carriedWeight).toBe(5); // potions (0.5 * 10)
    expect(breakdown.currencyWeight).toBe(0);
    expect(breakdown.totalWeight).toBe(49);
  });

  it('includes currency weight', () => {
    const state: InventoryState = {
      items: [],
      currencies: { gold: 50 }, // 50 * 0.02 = 1 lb
    };

    const breakdown = calculateWeightBreakdown(state, mockResolver, mockCurrencies);

    expect(breakdown.currencyWeight).toBe(1);
    expect(breakdown.totalWeight).toBe(1);
  });

  it('includes container content weight', () => {
    const state: InventoryState = {
      items: [
        {
          instanceId: 'backpack-1',
          itemId: 'backpack',
          entityType: 'item',
          quantity: 1,
          equipped: false,
        },
        {
          instanceId: 'sword-1',
          itemId: 'longsword',
          entityType: 'weapon',
          quantity: 1,
          equipped: false,
          containerId: 'backpack-1',
        },
      ],
      currencies: {},
    };

    const breakdown = calculateWeightBreakdown(state, mockResolver);

    // backpack (2) + sword inside (4) = 6, all carried
    expect(breakdown.carriedWeight).toBe(6);
    expect(breakdown.totalWeight).toBe(6);
  });

  it('ignores bag of holding content weight', () => {
    const state: InventoryState = {
      items: [
        {
          instanceId: 'bag-1',
          itemId: 'bag-of-holding',
          entityType: 'item',
          quantity: 1,
          equipped: false,
        },
        {
          instanceId: 'armor-1',
          itemId: 'chainmail',
          entityType: 'armor',
          quantity: 1,
          equipped: false,
          containerId: 'bag-1',
        },
      ],
      currencies: {},
    };

    const breakdown = calculateWeightBreakdown(state, mockResolver);

    // Only bag weight (15), chainmail (40) inside is ignored
    expect(breakdown.carriedWeight).toBe(15);
    expect(breakdown.totalWeight).toBe(15);
  });

  it('does not count items in containers separately', () => {
    const state: InventoryState = {
      items: [
        {
          instanceId: 'backpack-1',
          itemId: 'backpack',
          entityType: 'item',
          quantity: 1,
          equipped: false,
        },
        {
          instanceId: 'potion-1',
          itemId: 'potion',
          entityType: 'item',
          quantity: 2,
          equipped: false,
          containerId: 'backpack-1',
        },
      ],
      currencies: {},
    };

    const breakdown = calculateWeightBreakdown(state, mockResolver);

    // backpack (2) + potions inside (1) = 3
    // NOT backpack (2) + potions counted separately (1) = wrong
    expect(breakdown.carriedWeight).toBe(3);
  });
});

describe('calculateTotalWeight', () => {
  it('returns total weight', () => {
    const state: InventoryState = {
      items: [
        {
          instanceId: 'sword-1',
          itemId: 'longsword',
          entityType: 'weapon',
          quantity: 1,
          equipped: true,
        },
      ],
      currencies: { gold: 100 }, // 2 lbs
    };

    const total = calculateTotalWeight(state, mockResolver, mockCurrencies);

    expect(total).toBe(6); // sword (4) + gold (2)
  });
});

describe('wouldExceedCapacity', () => {
  it('returns true when would exceed capacity', () => {
    const state: InventoryState = {
      items: [
        {
          instanceId: 'pouch-1',
          itemId: 'belt-pouch', // capacity 10
          entityType: 'item',
          quantity: 1,
          equipped: false,
        },
        {
          instanceId: 'dagger-1',
          itemId: 'dagger', // weight 1
          entityType: 'weapon',
          quantity: 1,
          equipped: false,
          containerId: 'pouch-1',
        },
      ],
      currencies: {},
    };

    // Current content: 1 lb, adding 10 would exceed capacity of 10
    const result = wouldExceedCapacity(state, 'pouch-1', 10, mockResolver);
    expect(result).toBe(true);
  });

  it('returns false when within capacity', () => {
    const state: InventoryState = {
      items: [
        {
          instanceId: 'backpack-1',
          itemId: 'backpack', // capacity 60
          entityType: 'item',
          quantity: 1,
          equipped: false,
        },
      ],
      currencies: {},
    };

    const result = wouldExceedCapacity(state, 'backpack-1', 50, mockResolver);
    expect(result).toBe(false);
  });

  it('returns false for bag of holding', () => {
    const state: InventoryState = {
      items: [
        {
          instanceId: 'bag-1',
          itemId: 'bag-of-holding',
          entityType: 'item',
          quantity: 1,
          equipped: false,
        },
      ],
      currencies: {},
    };

    // Bag of holding ignores content weight, so never "exceeds"
    const result = wouldExceedCapacity(state, 'bag-1', 1000, mockResolver);
    expect(result).toBe(false);
  });

  it('returns false for non-container', () => {
    const state: InventoryState = {
      items: [
        {
          instanceId: 'sword-1',
          itemId: 'longsword',
          entityType: 'weapon',
          quantity: 1,
          equipped: false,
        },
      ],
      currencies: {},
    };

    const result = wouldExceedCapacity(state, 'sword-1', 10, mockResolver);
    expect(result).toBe(false);
  });
});

import { describe, expect, it } from 'bun:test';
import {
  addCurrency,
  removeCurrency,
  setCurrency,
  convertCurrency,
  getTotalWealth,
  getCurrencyWeight,
  getCurrencyAmount,
} from '../currencies/currencyOperations';
import type { CurrencyDefinition } from '../currencies/types';
import type { CurrencyState } from '../types';

// D&D 3.5 standard currencies for testing
const dnd35Currencies: CurrencyDefinition[] = [
  {
    id: 'platinum',
    entityType: 'currency',
    name: 'Platinum Piece',
    abbreviation: 'pp',
    conversionToBase: 10, // 1 pp = 10 gp
    weightPerUnit: 0.02, // 50 coins per pound
  },
  {
    id: 'gold',
    entityType: 'currency',
    name: 'Gold Piece',
    abbreviation: 'gp',
    conversionToBase: 1, // base currency
    weightPerUnit: 0.02,
  },
  {
    id: 'silver',
    entityType: 'currency',
    name: 'Silver Piece',
    abbreviation: 'sp',
    conversionToBase: 0.1, // 10 sp = 1 gp
    weightPerUnit: 0.02,
  },
  {
    id: 'copper',
    entityType: 'currency',
    name: 'Copper Piece',
    abbreviation: 'cp',
    conversionToBase: 0.01, // 100 cp = 1 gp
    weightPerUnit: 0.02,
  },
];

describe('addCurrency', () => {
  it('adds currency to empty state', () => {
    const state: CurrencyState = {};
    const result = addCurrency(state, 'gold', 100);

    expect(result.warnings).toHaveLength(0);
    expect(result.currencies.gold).toBe(100);
  });

  it('adds to existing currency amount', () => {
    const state: CurrencyState = { gold: 50 };
    const result = addCurrency(state, 'gold', 100);

    expect(result.warnings).toHaveLength(0);
    expect(result.currencies.gold).toBe(150);
  });

  it('adds different currency types', () => {
    const state: CurrencyState = { gold: 50 };
    const result = addCurrency(state, 'silver', 20);

    expect(result.warnings).toHaveLength(0);
    expect(result.currencies.gold).toBe(50);
    expect(result.currencies.silver).toBe(20);
  });

  it('returns warning for negative amount', () => {
    const state: CurrencyState = {};
    const result = addCurrency(state, 'gold', -10);

    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].type).toBe('invalid_amount');
  });

  it('handles zero amount', () => {
    const state: CurrencyState = { gold: 50 };
    const result = addCurrency(state, 'gold', 0);

    expect(result.warnings).toHaveLength(0);
    expect(result.currencies.gold).toBe(50);
  });
});

describe('removeCurrency', () => {
  it('removes currency from existing amount', () => {
    const state: CurrencyState = { gold: 100 };
    const result = removeCurrency(state, 'gold', 30);

    expect(result.warnings).toHaveLength(0);
    expect(result.currencies.gold).toBe(70);
  });

  it('removes entire amount', () => {
    const state: CurrencyState = { gold: 100 };
    const result = removeCurrency(state, 'gold', 100);

    expect(result.warnings).toHaveLength(0);
    expect(result.currencies.gold).toBe(0);
  });

  it('returns warning for insufficient funds', () => {
    const state: CurrencyState = { gold: 50 };
    const result = removeCurrency(state, 'gold', 100);

    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].type).toBe('insufficient_funds');
    expect(result.currencies.gold).toBe(50); // unchanged
  });

  it('returns warning for non-existent currency', () => {
    const state: CurrencyState = {};
    const result = removeCurrency(state, 'gold', 10);

    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].type).toBe('insufficient_funds');
  });

  it('returns warning for negative amount', () => {
    const state: CurrencyState = { gold: 100 };
    const result = removeCurrency(state, 'gold', -10);

    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].type).toBe('invalid_amount');
  });
});

describe('setCurrency', () => {
  it('sets currency value', () => {
    const state: CurrencyState = { gold: 100 };
    const result = setCurrency(state, 'gold', 50);

    expect(result.warnings).toHaveLength(0);
    expect(result.currencies.gold).toBe(50);
  });

  it('creates new currency entry', () => {
    const state: CurrencyState = {};
    const result = setCurrency(state, 'silver', 200);

    expect(result.warnings).toHaveLength(0);
    expect(result.currencies.silver).toBe(200);
  });

  it('returns warning for negative amount', () => {
    const state: CurrencyState = {};
    const result = setCurrency(state, 'gold', -50);

    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].type).toBe('invalid_amount');
  });
});

describe('convertCurrency', () => {
  it('converts gold to silver', () => {
    const state: CurrencyState = { gold: 10 };
    const result = convertCurrency(state, 'gold', 'silver', 1, dnd35Currencies);

    expect(result.warnings).toHaveLength(0);
    expect(result.currencies.gold).toBe(9);
    expect(result.currencies.silver).toBe(10);
  });

  it('converts silver to gold', () => {
    const state: CurrencyState = { silver: 100 };
    const result = convertCurrency(state, 'silver', 'gold', 50, dnd35Currencies);

    expect(result.warnings).toHaveLength(0);
    expect(result.currencies.silver).toBe(50);
    expect(result.currencies.gold).toBe(5);
  });

  it('converts platinum to copper', () => {
    const state: CurrencyState = { platinum: 1 };
    const result = convertCurrency(state, 'platinum', 'copper', 1, dnd35Currencies);

    expect(result.warnings).toHaveLength(0);
    expect(result.currencies.platinum).toBe(0);
    expect(result.currencies.copper).toBe(1000); // 1 pp = 10 gp = 1000 cp
  });

  it('returns warning for insufficient funds', () => {
    const state: CurrencyState = { gold: 5 };
    const result = convertCurrency(state, 'gold', 'silver', 10, dnd35Currencies);

    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].type).toBe('insufficient_funds');
  });

  it('returns warning for unknown source currency', () => {
    const state: CurrencyState = { gold: 100 };
    const result = convertCurrency(state, 'gems', 'gold', 10, dnd35Currencies);

    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].type).toBe('currency_not_found');
  });

  it('returns warning for unknown target currency', () => {
    const state: CurrencyState = { gold: 100 };
    const result = convertCurrency(state, 'gold', 'gems', 10, dnd35Currencies);

    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].type).toBe('currency_not_found');
  });

  it('returns warning when conversion would result in 0', () => {
    const state: CurrencyState = { copper: 5 };
    const result = convertCurrency(state, 'copper', 'gold', 5, dnd35Currencies);

    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].type).toBe('conversion_error');
  });

  it('handles partial conversions (keeps remainder)', () => {
    const state: CurrencyState = { silver: 15 };
    const result = convertCurrency(state, 'silver', 'gold', 15, dnd35Currencies);

    // 15 sp = 1.5 gp, floor to 1 gp, use only 10 sp
    expect(result.warnings).toHaveLength(0);
    expect(result.currencies.gold).toBe(1);
    expect(result.currencies.silver).toBe(5); // 15 - 10 = 5 remainder
  });
});

describe('getTotalWealth', () => {
  it('calculates total wealth in gold', () => {
    const state: CurrencyState = {
      gold: 10,
      silver: 50,
      copper: 100,
    };
    const total = getTotalWealth(state, dnd35Currencies);

    // 10 gp + 5 gp (50 sp) + 1 gp (100 cp) = 16 gp
    expect(total).toBe(16);
  });

  it('includes platinum', () => {
    const state: CurrencyState = {
      platinum: 1,
      gold: 5,
    };
    const total = getTotalWealth(state, dnd35Currencies);

    // 10 gp (1 pp) + 5 gp = 15 gp
    expect(total).toBe(15);
  });

  it('returns 0 for empty state', () => {
    const state: CurrencyState = {};
    const total = getTotalWealth(state, dnd35Currencies);

    expect(total).toBe(0);
  });

  it('ignores unknown currencies', () => {
    const state: CurrencyState = {
      gold: 10,
      gems: 100, // not in definitions
    };
    const total = getTotalWealth(state, dnd35Currencies);

    expect(total).toBe(10);
  });
});

describe('getCurrencyWeight', () => {
  it('calculates weight of coins', () => {
    const state: CurrencyState = {
      gold: 50, // 50 * 0.02 = 1 lb
    };
    const weight = getCurrencyWeight(state, dnd35Currencies);

    expect(weight).toBe(1);
  });

  it('sums weight of multiple currencies', () => {
    const state: CurrencyState = {
      gold: 50,   // 1 lb
      silver: 50, // 1 lb
      copper: 50, // 1 lb
    };
    const weight = getCurrencyWeight(state, dnd35Currencies);

    expect(weight).toBe(3);
  });

  it('returns 0 for empty state', () => {
    const state: CurrencyState = {};
    const weight = getCurrencyWeight(state, dnd35Currencies);

    expect(weight).toBe(0);
  });
});

describe('getCurrencyAmount', () => {
  it('returns amount for existing currency', () => {
    const state: CurrencyState = { gold: 100 };
    const amount = getCurrencyAmount(state, 'gold');

    expect(amount).toBe(100);
  });

  it('returns 0 for non-existent currency', () => {
    const state: CurrencyState = {};
    const amount = getCurrencyAmount(state, 'gold');

    expect(amount).toBe(0);
  });
});

import { describe, expect, it } from "bun:test";
import {
  roll4d6DropLowest,
  generateAbilityScoreSet,
  STANDARD_ARRAY,
  getPointBuyIncrementCost,
  getPointBuyDecrementRefund,
  calculatePointBuyTotal,
  canIncrementPointBuy,
  canDecrementPointBuy,
  POINT_BUY_MIN,
  POINT_BUY_MAX,
} from "./abilityScoreGeneration";

describe("roll4d6DropLowest", () => {
  it("rolls exactly 4 dice", () => {
    const result = roll4d6DropLowest();
    expect(result.allRolls).toHaveLength(4);
  });

  it("keeps 3 dice and drops the lowest", () => {
    const result = roll4d6DropLowest();
    expect(result.kept).toHaveLength(3);
    expect(result.dropped).toBeLessThanOrEqual(Math.min(...result.kept));
  });

  it("total equals sum of kept dice", () => {
    const result = roll4d6DropLowest();
    expect(result.total).toBe(result.kept[0] + result.kept[1] + result.kept[2]);
  });

  it("produces totals in range 3-18", () => {
    for (let i = 0; i < 100; i++) {
      const result = roll4d6DropLowest();
      expect(result.total).toBeGreaterThanOrEqual(3);
      expect(result.total).toBeLessThanOrEqual(18);
    }
  });

  it("all individual dice are 1-6", () => {
    for (let i = 0; i < 50; i++) {
      const result = roll4d6DropLowest();
      for (const die of result.allRolls) {
        expect(die).toBeGreaterThanOrEqual(1);
        expect(die).toBeLessThanOrEqual(6);
      }
    }
  });
});

describe("generateAbilityScoreSet", () => {
  it("generates exactly 6 results", () => {
    const set = generateAbilityScoreSet();
    expect(set).toHaveLength(6);
  });

  it("each result has valid structure", () => {
    const set = generateAbilityScoreSet();
    for (const result of set) {
      expect(result.allRolls).toHaveLength(4);
      expect(result.kept).toHaveLength(3);
      expect(result.total).toBeGreaterThanOrEqual(3);
      expect(result.total).toBeLessThanOrEqual(18);
    }
  });
});

describe("STANDARD_ARRAY", () => {
  it("has exactly 6 values", () => {
    expect(STANDARD_ARRAY).toHaveLength(6);
  });

  it("contains the correct values", () => {
    expect([...STANDARD_ARRAY]).toEqual([15, 14, 13, 12, 10, 8]);
  });
});

describe("point buy costs", () => {
  it("increment cost from 8 is 1", () => {
    expect(getPointBuyIncrementCost(8)).toBe(1);
  });

  it("increment cost from 14 is 2", () => {
    expect(getPointBuyIncrementCost(14)).toBe(2);
  });

  it("increment cost from 15 is 2", () => {
    expect(getPointBuyIncrementCost(15)).toBe(2);
  });

  it("increment cost from 17 is 3", () => {
    expect(getPointBuyIncrementCost(17)).toBe(3);
  });

  it("increment cost at max returns 0", () => {
    expect(getPointBuyIncrementCost(18)).toBe(0);
  });

  it("decrement refund from 9 is 1", () => {
    expect(getPointBuyDecrementRefund(9)).toBe(1);
  });

  it("decrement refund from 18 is 3", () => {
    expect(getPointBuyDecrementRefund(18)).toBe(3);
  });

  it("decrement refund at min returns 0", () => {
    expect(getPointBuyDecrementRefund(8)).toBe(0);
  });
});

describe("calculatePointBuyTotal", () => {
  it("all 8s costs 0 points", () => {
    expect(calculatePointBuyTotal([8, 8, 8, 8, 8, 8])).toBe(0);
  });

  it("standard array costs 25 points", () => {
    expect(calculatePointBuyTotal([15, 14, 13, 12, 10, 8])).toBe(25);
  });

  it("all 18s costs 96 points", () => {
    expect(calculatePointBuyTotal([18, 18, 18, 18, 18, 18])).toBe(96);
  });

  it("all 10s costs 12 points", () => {
    expect(calculatePointBuyTotal([10, 10, 10, 10, 10, 10])).toBe(12);
  });
});

describe("canIncrementPointBuy", () => {
  it("allows increment when under budget", () => {
    expect(canIncrementPointBuy(10, 5, 25)).toBe(true);
  });

  it("prevents increment at max score", () => {
    expect(canIncrementPointBuy(POINT_BUY_MAX, 0, 25)).toBe(false);
  });

  it("prevents increment when exceeding budget", () => {
    expect(canIncrementPointBuy(17, 24, 25)).toBe(false);
  });

  it("allows increment when exactly enough budget", () => {
    // cost from 14 to 15 is 2, total 23 + 2 = 25
    expect(canIncrementPointBuy(14, 23, 25)).toBe(true);
  });
});

describe("canDecrementPointBuy", () => {
  it("allows decrement above min", () => {
    expect(canDecrementPointBuy(10)).toBe(true);
  });

  it("prevents decrement at min", () => {
    expect(canDecrementPointBuy(POINT_BUY_MIN)).toBe(false);
  });
});

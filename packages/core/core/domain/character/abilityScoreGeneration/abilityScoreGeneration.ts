import { randomInteger } from "../../../utils/random";

// ---------- Types ----------

export type AbilityScoreMethod = 'manual' | 'roll4d6' | 'pointBuy' | 'standardArray';

export type Roll4d6Result = {
  allRolls: number[];
  dropped: number;
  kept: number[];
  total: number;
};

// ---------- Standard Array ----------

export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8] as const;

// ---------- Roll 4d6 Drop Lowest ----------

export function roll4d6DropLowest(): Roll4d6Result {
  const allRolls: number[] = [];
  for (let i = 0; i < 4; i++) {
    allRolls.push(randomInteger(1, 6));
  }
  const sorted = [...allRolls].sort((a, b) => a - b);
  const dropped = sorted[0];
  const kept = sorted.slice(1);
  const total = kept[0] + kept[1] + kept[2];
  return { allRolls, dropped, kept, total };
}

export function generateAbilityScoreSet(): Roll4d6Result[] {
  const results: Roll4d6Result[] = [];
  for (let i = 0; i < 6; i++) {
    results.push(roll4d6DropLowest());
  }
  return results;
}

// ---------- Point Buy ----------

export const POINT_BUY_PRESETS = [15, 22, 25, 28, 32] as const;
export const DEFAULT_POINT_BUY_BUDGET = 25;
export const POINT_BUY_MIN = 8;
export const POINT_BUY_MAX = 18;

/** Cost to reach a given score from 8 */
const POINT_BUY_COST_TABLE: Record<number, number> = {
  8: 0,
  9: 1,
  10: 2,
  11: 3,
  12: 4,
  13: 5,
  14: 6,
  15: 8,
  16: 10,
  17: 13,
  18: 16,
};

/** Cost to go from score to score+1 */
export function getPointBuyIncrementCost(currentScore: number): number {
  if (currentScore < POINT_BUY_MIN || currentScore >= POINT_BUY_MAX) return 0;
  return POINT_BUY_COST_TABLE[currentScore + 1] - POINT_BUY_COST_TABLE[currentScore];
}

/** Points refunded by going from score to score-1 */
export function getPointBuyDecrementRefund(currentScore: number): number {
  if (currentScore <= POINT_BUY_MIN || currentScore > POINT_BUY_MAX) return 0;
  return POINT_BUY_COST_TABLE[currentScore] - POINT_BUY_COST_TABLE[currentScore - 1];
}

/** Total points spent for a set of 6 ability scores */
export function calculatePointBuyTotal(scores: number[]): number {
  let total = 0;
  for (const score of scores) {
    const clamped = Math.max(POINT_BUY_MIN, Math.min(POINT_BUY_MAX, score));
    total += POINT_BUY_COST_TABLE[clamped] ?? 0;
  }
  return total;
}

export function canIncrementPointBuy(currentScore: number, currentTotal: number, budget: number): boolean {
  if (currentScore >= POINT_BUY_MAX) return false;
  const cost = getPointBuyIncrementCost(currentScore);
  return currentTotal + cost <= budget;
}

export function canDecrementPointBuy(currentScore: number): boolean {
  return currentScore > POINT_BUY_MIN;
}

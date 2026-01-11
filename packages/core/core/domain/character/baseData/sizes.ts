export interface SizeCategory {
  name: string;
  numericValue: number;
  attackAndACModifier: number;
  specialAttacksModifier: number;
  hideModifier: number;
  heightOrLength: string;
  defaultWeight: string;
  space: number;
  naturalReachTall: number;
  naturalReachLong: number;
  reach: number;
  carryingCapacityMultiplierBiped: number;
  carryingCapacityMultiplierQuadruped: number;
}

export type SizeCategories = {
  FINE: SizeCategory;
  DIMINUTIVE: SizeCategory;
  TINY: SizeCategory;
  SMALL: SizeCategory;
  MEDIUM: SizeCategory;
  LARGE: SizeCategory;
  HUGE: SizeCategory;
  GARGANTUAN: SizeCategory;
  COLOSSAL: SizeCategory;
};

export type Size = keyof SizeCategories;

export const sizeCategoriesNumbers: { [key: number]: Size } = {
  [-4]: "FINE",
  [-3]: "DIMINUTIVE",
  [-2]: "TINY",
  [-1]: "SMALL",
  [0]: "MEDIUM",
  [1]: "LARGE",
  [2]: "HUGE",
  [3]: "GARGANTUAN",
  [4]: "COLOSSAL",
} as const;

export const getSizeCategory = (sizeNumber: number): Size => {
  if (sizeNumber < -4) {
    return "FINE";
  }
  if (sizeNumber > 4) {
    return "COLOSSAL";
  }
  return sizeCategoriesNumbers[sizeNumber];
};

export const sizeCategories: SizeCategories = {
  FINE: {
    numericValue: -4,
    name: "Fine",
    attackAndACModifier: 8,
    specialAttacksModifier: -16,
    hideModifier: 16,
    heightOrLength: "6 in. or less",
    defaultWeight: "1/8 lb. or less",
    space: 1 / 2,
    naturalReachTall: 0,
    naturalReachLong: 0,
    reach: 0,
    carryingCapacityMultiplierBiped: 1 / 8,
    carryingCapacityMultiplierQuadruped: 1 / 4,
  },
  DIMINUTIVE: {
    name: "Diminutive",
    numericValue: -3,
    attackAndACModifier: 4,
    specialAttacksModifier: -12,
    hideModifier: 12,
    heightOrLength: "6 in.-1 ft.",
    defaultWeight: "1/8 lb.-1 lb.",
    space: 1,
    naturalReachTall: 0,
    naturalReachLong: 0,
    reach: 0,
    carryingCapacityMultiplierBiped: 1 / 4,
    carryingCapacityMultiplierQuadruped: 1 / 2,
  },
  TINY: {
    name: "Tiny",
    numericValue: -2,
    attackAndACModifier: 2,
    specialAttacksModifier: -8,
    hideModifier: 8,
    heightOrLength: "1 ft.-2 ft.",
    defaultWeight: "1 lb.-8 lb.",
    space: 2.5,
    naturalReachTall: 0,
    naturalReachLong: 0,
    reach: 0,
    carryingCapacityMultiplierBiped: 1 / 2,
    carryingCapacityMultiplierQuadruped: 3 / 4,
  },
  SMALL: {
    name: "Small",
    numericValue: -1,
    attackAndACModifier: 1,
    specialAttacksModifier: -4,
    hideModifier: 4,
    heightOrLength: "2 ft.-4 ft.",
    defaultWeight: "8 lb.-60 lb.",
    space: 5,
    naturalReachTall: 5,
    naturalReachLong: 5,
    reach: 5,
    carryingCapacityMultiplierBiped: 3 / 4,
    carryingCapacityMultiplierQuadruped: 1,
  },
  MEDIUM: {
    name: "Medium",
    numericValue: 0,
    attackAndACModifier: 0,
    specialAttacksModifier: 0,
    hideModifier: 0,
    heightOrLength: "4 ft.-8 ft.",
    defaultWeight: "60 lb.-500 lb.",
    space: 5,
    naturalReachTall: 5,
    naturalReachLong: 5,
    reach: 5,
    carryingCapacityMultiplierBiped: 1,
    carryingCapacityMultiplierQuadruped: 1.5,
  },
  LARGE: {
    name: "Large",
    numericValue: 1,
    attackAndACModifier: -1,
    specialAttacksModifier: 4,
    hideModifier: -4,
    heightOrLength: "8 ft.-16 ft.",
    defaultWeight: "500 lb.-2 tons",
    space: 10,
    naturalReachTall: 10,
    naturalReachLong: 5,
    reach: 5,
    carryingCapacityMultiplierBiped: 2,
    carryingCapacityMultiplierQuadruped: 3,
  },
  HUGE: {
    name: "Huge",
    numericValue: 2,
    attackAndACModifier: -2,
    specialAttacksModifier: 8,
    hideModifier: -8,
    heightOrLength: "16 ft.-32 ft.",
    defaultWeight: "2 tons-16 tons",
    space: 15,
    naturalReachTall: 15,
    naturalReachLong: 10,
    reach: 10,
    carryingCapacityMultiplierBiped: 4,
    carryingCapacityMultiplierQuadruped: 6,
  },
  GARGANTUAN: {
    name: "Gargantuan",
    numericValue: 3,
    attackAndACModifier: -4,
    specialAttacksModifier: 12,
    hideModifier: -12,
    heightOrLength: "32 ft.-64 ft.",
    defaultWeight: "16 tons-125 tons",
    space: 20,
    naturalReachTall: 20,
    naturalReachLong: 15,
    reach: 15,
    carryingCapacityMultiplierBiped: 8,
    carryingCapacityMultiplierQuadruped: 12,
  },
  COLOSSAL: {
    name: "Colossal",
    numericValue: 4,
    attackAndACModifier: -8,
    specialAttacksModifier: 16,
    hideModifier: -16,
    heightOrLength: "64 ft. or more",
    defaultWeight: "125 tons or more",
    space: 30,
    naturalReachTall: 30,
    naturalReachLong: 20,
    reach: 20,
    carryingCapacityMultiplierBiped: 16,
    carryingCapacityMultiplierQuadruped: 24,
  },
};

export const getSizeCategoryDifference = (
  attackerSize: Size,
  defenderSize: Size
): number => {
  return Math.abs(
    sizeCategories[attackerSize].numericValue -
      sizeCategories[defenderSize].numericValue
  );
};

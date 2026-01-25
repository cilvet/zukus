/**
 * Adapter: @zukus/core -> Foundry VTT
 *
 * Converts CharacterSheet (calculated data) back to Foundry format
 * for display and storage.
 */

import type { CharacterSheet } from '@zukus/core';

// SourceValue type (matches core but simpler for our needs)
type SourceValue = {
  value: number;
  sourceName?: string;
  bonusTypeId?: string;
  relevant?: boolean;
};

type FoundryUpdateData = {
  'system.hp.max': number;
  'system.hp.value': number;
  'system.ac.total': number;
  'system.ac.touch': number;
  'system.ac.flatFooted': number;
  'system.bab': number;
  'system.initiative': number;
  'system.saves.fortitude': number;
  'system.saves.reflex': number;
  'system.saves.will': number;
  'system.calculated': CalculatedDisplayData;
  'system.sourceBreakdowns': SourceBreakdowns;
};

type CalculatedDisplayData = {
  abilities: Record<string, {
    score: number;
    modifier: number;
    baseScore: number;
  }>;
  hp: {
    current: number;
    max: number;
    temp: number;
  };
  ac: {
    total: number;
    touch: number;
    flatFooted: number;
    natural: number;
  };
  bab: {
    total: number;
    attacks: number[];
  };
  saves: {
    fortitude: number;
    reflex: number;
    will: number;
  };
  initiative: number;
  grapple: number;
  size: string;
};

type SourceBreakdowns = {
  abilities: Record<string, SourceValue[]>;
  ac: SourceValue[];
  acTouch: SourceValue[];
  acFlatFooted: SourceValue[];
  bab: SourceValue[];
  saves: {
    fortitude: SourceValue[];
    reflex: SourceValue[];
    will: SourceValue[];
  };
  initiative: SourceValue[];
};

/**
 * Converts a CharacterSheet from @zukus/core to Foundry update format
 */
export function zukusSheetToFoundryUpdate(sheet: CharacterSheet): FoundryUpdateData {
  const calculated: CalculatedDisplayData = {
    abilities: {
      strength: {
        score: sheet.abilityScores.strength.totalScore,
        modifier: sheet.abilityScores.strength.totalModifier,
        baseScore: sheet.abilityScores.strength.baseScore,
      },
      dexterity: {
        score: sheet.abilityScores.dexterity.totalScore,
        modifier: sheet.abilityScores.dexterity.totalModifier,
        baseScore: sheet.abilityScores.dexterity.baseScore,
      },
      constitution: {
        score: sheet.abilityScores.constitution.totalScore,
        modifier: sheet.abilityScores.constitution.totalModifier,
        baseScore: sheet.abilityScores.constitution.baseScore,
      },
      intelligence: {
        score: sheet.abilityScores.intelligence.totalScore,
        modifier: sheet.abilityScores.intelligence.totalModifier,
        baseScore: sheet.abilityScores.intelligence.baseScore,
      },
      wisdom: {
        score: sheet.abilityScores.wisdom.totalScore,
        modifier: sheet.abilityScores.wisdom.totalModifier,
        baseScore: sheet.abilityScores.wisdom.baseScore,
      },
      charisma: {
        score: sheet.abilityScores.charisma.totalScore,
        modifier: sheet.abilityScores.charisma.totalModifier,
        baseScore: sheet.abilityScores.charisma.baseScore,
      },
    },
    hp: {
      current: sheet.hitPoints.currentHp,
      max: sheet.hitPoints.maxHp,
      temp: sheet.hitPoints.temporaryHp,
    },
    ac: {
      total: sheet.armorClass.totalAc.totalValue,
      touch: sheet.armorClass.touchAc.totalValue,
      flatFooted: sheet.armorClass.flatFootedAc.totalValue,
      natural: sheet.armorClass.naturalAc.totalValue,
    },
    bab: {
      total: sheet.baseAttackBonus.totalValue,
      attacks: sheet.baseAttackBonus.multipleBaseAttackBonuses,
    },
    saves: {
      fortitude: sheet.savingThrows.fortitude.totalValue,
      reflex: sheet.savingThrows.reflex.totalValue,
      will: sheet.savingThrows.will.totalValue,
    },
    initiative: sheet.initiative.totalValue,
    grapple: sheet.grapple.totalValue,
    size: sheet.size.currentSize,
  };

  const sourceBreakdowns: SourceBreakdowns = {
    abilities: {
      strength: sheet.abilityScores.strength.sourceValues,
      dexterity: sheet.abilityScores.dexterity.sourceValues,
      constitution: sheet.abilityScores.constitution.sourceValues,
      intelligence: sheet.abilityScores.intelligence.sourceValues,
      wisdom: sheet.abilityScores.wisdom.sourceValues,
      charisma: sheet.abilityScores.charisma.sourceValues,
    },
    ac: sheet.armorClass.totalAc.sourceValues,
    acTouch: sheet.armorClass.touchAc.sourceValues,
    acFlatFooted: sheet.armorClass.flatFootedAc.sourceValues,
    bab: sheet.baseAttackBonus.sourceValues,
    saves: {
      fortitude: sheet.savingThrows.fortitude.sourceValues,
      reflex: sheet.savingThrows.reflex.sourceValues,
      will: sheet.savingThrows.will.sourceValues,
    },
    initiative: sheet.initiative.sourceValues,
  };

  return {
    'system.hp.max': sheet.hitPoints.maxHp,
    'system.hp.value': sheet.hitPoints.currentHp,
    'system.ac.total': sheet.armorClass.totalAc.totalValue,
    'system.ac.touch': sheet.armorClass.touchAc.totalValue,
    'system.ac.flatFooted': sheet.armorClass.flatFootedAc.totalValue,
    'system.bab': sheet.baseAttackBonus.totalValue,
    'system.initiative': sheet.initiative.totalValue,
    'system.saves.fortitude': sheet.savingThrows.fortitude.totalValue,
    'system.saves.reflex': sheet.savingThrows.reflex.totalValue,
    'system.saves.will': sheet.savingThrows.will.totalValue,
    'system.calculated': calculated,
    'system.sourceBreakdowns': sourceBreakdowns,
  };
}

/**
 * Format a modifier for display (+X or -X)
 */
export function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

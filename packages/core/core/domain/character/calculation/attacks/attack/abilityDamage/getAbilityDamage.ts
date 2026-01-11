import { ResolvedAttackContext } from "../../../../calculatedSheet/attacks/calculatedAttack";
import {
  DamageModification,
  DamageSection,
  SimpleDamageSection,
} from "../../../../calculatedSheet/attacks/damage/damageFormula";

export const getStrengthDamage = (
  context: ResolvedAttackContext
): SimpleDamageSection | undefined => {
  const { character, wieldType, weapon, attackType } = context;
  if (attackType !== "melee") {
    return undefined;
  }
  const baseAbilityDamage = character.abilityScores.strength.totalModifier ?? 0;

  const damageModifications: DamageModification[] = [];
  if (attackType === "melee" && wieldType === "twoHanded") {
    damageModifications.push({
      type: "multiplyAllDamage",
      multiplier: 1.5,
    });
  }

  return {
    name: "Strength",
    type: "simple",
    formula: {
      expression: baseAbilityDamage.toString(),
    },
    damageModifications,
  };
};

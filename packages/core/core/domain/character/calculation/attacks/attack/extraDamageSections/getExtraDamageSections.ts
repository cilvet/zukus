import { ResolvedAttackContext } from "../../../../calculatedSheet/attacks/calculatedAttack";
import { DamageSection } from "../../../../calculatedSheet/attacks/damage/damageFormula";
import { filterDamageChanges } from "../utils/filterDamageChanges";
import { getDamageSectionFromChange } from "../utils/getDamageSectionFromChange";

export const getExtraDamageSections = (
  context: ResolvedAttackContext
): DamageSection[] => {
  const allDamageChanges = [
    ...context.character.attackData.attackChanges,
    ...context.appliedContextualChanges.flatMap((change) => change.changes),
  ];
  return allDamageChanges
    .filter(filterDamageChanges)
    .map(getDamageSectionFromChange);
};

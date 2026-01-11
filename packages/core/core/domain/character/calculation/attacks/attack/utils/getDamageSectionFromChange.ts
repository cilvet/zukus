import { DamageChange } from "../../../../baseData/attacks";
import { ContextualizedChange } from "../../../../baseData/changes";
import { DamageSection } from "../../../../calculatedSheet/attacks/damage/damageFormula";

export const getDamageSectionFromChange = (
  change: ContextualizedChange<DamageChange>,
): DamageSection => {
  const extraDamageSection: DamageSection = {
    name: change.name,
    type: "simple",
    formula: change.formula,
    ...(change.damageType && { damageType: change.damageType }),
  };
  return extraDamageSection;
};

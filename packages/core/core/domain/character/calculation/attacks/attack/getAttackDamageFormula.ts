import { ResolvedAttackContext } from "../../../calculatedSheet/attacks/calculatedAttack";
import {
  ComplexDamageModification,
  DamageFormula,
  DamageSection,
} from "../../../calculatedSheet/attacks/damage/damageFormula";
import { getStrengthDamage } from "./abilityDamage/getAbilityDamage";
import { getExtraDamageSections } from "./extraDamageSections/getExtraDamageSections";
import { getWeaponDamageSection } from "./weaponDamage/getWeaponDamageSection";

export const getAttackDamageFormula = (
  context: ResolvedAttackContext,
  isCriticalHit: boolean = false,
): DamageFormula => {
  const weaponDamageSection = getWeaponDamageSection(context);
  const abilityDamageSection = getStrengthDamage(context);
  const extraDamageSections = getExtraDamageSections(context);

  const allAdditionalDamageSections: DamageSection[] = [
    ...(abilityDamageSection ? [abilityDamageSection] : []),
    ...extraDamageSections,
  ]

  const damageModifications: ComplexDamageModification[] = [];
  if (isCriticalHit) {
    damageModifications.push({
      type: "multiplyAllDamage",
      multiplier: context.weapon.baseCritMultiplier,
      applyTo: "allSections",
    });
  }

  return {
    name: "Melee attack",
    type: "complex",
    baseDamage: weaponDamageSection,
    additionalDamageSections: allAdditionalDamageSections,
    damageModifications: [],
  };
};
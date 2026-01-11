import { Weapon } from "../../../../weapons/weapon";
import { AttackChange } from "../../../baseData/attacks";
import { Change, ContextualizedChange } from "../../../baseData/changes";
import { AttackContextualChange } from "../../../baseData/contextualChange";
import { filterAttackChanges } from "../../../calculation/attacks/attack/calculateAttackBonus/calculateAttackBonus";
import { CalculatedBaseAttackBonus } from "../../calculatedBaseAttackBonus";
import { CharacterSheet } from "../../sheet";
import { WeaponCalculatedAttackContext } from "../calculatedAttack";

export const contextualizeAttackChangeWithWeapon = (
  weapon: Weapon,
  change: Change
): ContextualizedChange<Change> => {
  return {
    ...change,
    originId: weapon.uniqueId,
    originType: "item",
    name: weapon.name,
  };
};

export const getAttackChangesFromWeapon = (
  weapon: Weapon
): ContextualizedChange<AttackChange>[] => {
  const weaponChanges = weapon.weaponOnlyChanges
    ?.map((change) => contextualizeAttackChangeWithWeapon(weapon, change))
    .filter(filterAttackChanges) ?? [];

  const enhancementChanges = weapon.enhancements
    ?.flatMap((enhancement) => enhancement.weaponOnlyChanges)
    ?.filter(Boolean)
    .map((change) => contextualizeAttackChangeWithWeapon(weapon, change as Change))
    .filter(filterAttackChanges) ?? [];

  return [...weaponChanges, ...enhancementChanges];
};

export const getWeaponAttackContext = (
  weapon: Weapon,
  attackContextChanges: AttackContextualChange[],
  attackChanges: ContextualizedChange<AttackChange>[],
  character: CharacterSheet
): WeaponCalculatedAttackContext => {
  const allChanges = [...attackChanges, ...getAttackChangesFromWeapon(weapon)];

  const allAttackContextChanges = [
    ...attackContextChanges,
    ...(weapon.weaponOnlyContextualChanges ?? []),
    ...(weapon.enhancements?.flatMap((enhancement) => [
      ...(enhancement.weaponOnlyContextualChanges ?? []),
    ]) ?? []),
  ].filter((change) => change.appliesTo === "all" || change.appliesTo === weapon.weaponAttackType);

  if (weapon.weaponAttackType === "melee") {
    return {
      type: "melee",
      weapon,
      contextualChanges: allAttackContextChanges,
      changes: allChanges,
      character
    };
  }

  return {
    type: "ranged",
    weapon,
    contextualChanges: allAttackContextChanges,
    changes: allChanges,
    character
  };
};

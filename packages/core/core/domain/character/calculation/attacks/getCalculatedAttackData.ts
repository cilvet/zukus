import { Weapon } from "../../../weapons/weapon";
import { AttackChange } from "../../baseData/attacks";
import { ChangeTypes, ContextualizedChange } from "../../baseData/changes";
import {
  AttackContextualChange,
  ContextualChange,
  ResolvedAttackContextualChange,
} from "../../baseData/contextualChange";
import { getWeaponAttackContext } from "../../calculatedSheet/attacks/attackContext/availableAttackContext";
import {
  CalculatedAttack,
  ResolvedAttackContext,
} from "../../calculatedSheet/attacks/calculatedAttack";
import { CharacterSheet } from "../../calculatedSheet/sheet";
import { calculateAttackBonus } from "./attack/calculateAttackBonus/calculateAttackBonus";
import { getAttackDamageFormula } from "./attack/getAttackDamageFormula";

const flanking: AttackContextualChange = {
  appliesTo: "melee",
  type: "attack",
  name: "Flanking",
  available: true,
  optional: true,
  variables: [],
  changes: [
    {
      attackType: "melee",
      bonusTypeId: "UNTYPED",
      formula: {
        expression: "2",
      },
      name: "Flanking",
      originId: "flanking",
      originType: "other",
      type: 'ATTACK_ROLLS',
    }
  ]
};

const charging: AttackContextualChange = {
  appliesTo: "melee",
  type: "attack",
  name: "Charging",
  available: true,
  optional: true,
  variables: [],
  changes: [
    {
      attackType: "melee",
      bonusTypeId: "UNTYPED",
      formula: {
        expression: "2",
      },
      name: "Charging",
      originId: "charging",
      originType: "other",
      type: 'ATTACK_ROLLS',
    }
  ]
};

const highGround: AttackContextualChange = {
  appliesTo: "all",
  type: "attack",
  name: "High Ground",
  available: true,
  optional: true,
  variables: [],
  changes: [
    {
      attackType: "ranged",
      bonusTypeId: "UNTYPED",
      formula: {
        expression: "1",
      },
      name: "High Ground",
      originId: "high_ground",
      originType: "other",
      type: 'ATTACK_ROLLS',
    }
  ]
};

const defensiveFighting: AttackContextualChange = {
  appliesTo: "melee",
  type: "attack",
  name: "Defensive Fighting",
  available: true,
  optional: true,
  variables: [],
  changes: [
    {
      attackType: "melee",
      bonusTypeId: "UNTYPED",
      formula: {
        expression: "-4",
      },
      name: "Defensive Fighting",
      originId: "defensive_fighting",
      originType: "other",
      type: 'ATTACK_ROLLS',
    }
  ]
};

const prone: AttackContextualChange = {
  appliesTo: "melee",
  type: "attack",
  name: "Prone",
  available: true,
  optional: true,
  variables: [],
  changes: [
    {
      attackType: "melee",
      bonusTypeId: "UNTYPED",
      formula: {
        expression: "-4",
      },
      name: "Prone",
      originId: "prone",
      originType: "other",
      type: 'ATTACK_ROLLS',
    }
  ]
};

const allDefaultAttackContextChanges: AttackContextualChange[] = [
  flanking,
  charging,
  highGround,
  defensiveFighting,
  prone
];

export const getCalculatedAttackData = function (
  character: CharacterSheet,
  attackChanges: ContextualizedChange<AttackChange>[],
  attackContextChanges: ContextualChange[],
  substitutionValues: Record<string, number>
) {
  const characterWeapons = character.equipment.items.filter(
    (item): item is Weapon => item.itemType === "WEAPON"
  );

  const attacks = characterWeapons.filter(weapon => weapon.equipped).map((weapon) =>
    getAttackFromWeapon(weapon, character, attackChanges, attackContextChanges, substitutionValues)
  );

  return {
    attacks,
    attackContextChanges: [...allDefaultAttackContextChanges, ...attackContextChanges],
    attackChanges,
  };
};

export function getAttackFromWeapon(
  weapon: Weapon,
  character: CharacterSheet,
  attackChanges: ContextualizedChange<AttackChange>[],
  attackContextChanges: AttackContextualChange[],
  substitutionValues: Record<string, number>
): CalculatedAttack {
  const attackContext = getWeaponAttackContext(
    weapon,
    attackContextChanges,
    attackChanges,
    character
  );

  const mandatoryContextualChangesToApply = attackContext.contextualChanges
    .filter((change) => change.available && !change.optional && change.variables.length === 0)
    .map(
      (change): ResolvedAttackContextualChange => ({
        ...change,
        variables: []
      })
    );

  const resolvedAttackContext: ResolvedAttackContext = {
    attackType: attackContext.type,
    weapon: attackContext.weapon,
    wieldType: attackContext.weapon.defaultWieldType,
    appliedContextualChanges: mandatoryContextualChangesToApply,
    appliedChanges: attackContext.changes,
    character
  };

  const attack: CalculatedAttack = {
    name: weapon.name,
    damage: getAttackDamageFormula(resolvedAttackContext),
    criticalDamage: getAttackDamageFormula(resolvedAttackContext, true),
    attackBonus: calculateAttackBonus(resolvedAttackContext, substitutionValues),
    type: attackContext.type,
    attackOriginType: "weapon",
    weaponUniqueId: weapon.uniqueId,
  };

  return attack;
}

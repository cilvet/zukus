import { DamageType, SimpleDamageType } from "../../damage/damageTypes";
import { Formula } from "../../formulae/formula";
import { MeleeWeapon } from "../../weapons/weapon";
import { DamageFormula } from "../calculatedSheet/attacks/damage/damageFormula";
import { Source } from "../calculatedSheet/sources";
import { AbilityKey } from "./abilities";
import { BaseChange, ChangeTypes} from "./changes";

export type WeaponAttackType = "melee" | "ranged";

export type AttackType =
  | WeaponAttackType
  | "meleeTouch"
  | "rangedTouch"
  | "spell"
  | "spellLike";

export type BaseAttack = {
  name: string;
  type: AttackType;
  baseAttackFormula: Formula;
  baseDamage: DamageFormula;
  criticalDamage: DamageFormula;
};

export type WeaponAttack = BaseAttack & {
  weaponId: string;
  wieldType: WieldTypes;
};

export type WieldTypes =
  | "primary"
  | "twoHanded"
  | "primary_offHandNormal"
  | "primary_offHandLight"
  | "offHandNormal"
  | "offHandLight";

export type CalculatedAttackConfig = {
  type: AttackType;
  baseAttackBonus: number;
  defaultAbilityAttackModifier: AbilityKey;
  defaultAbilityDamageModifier: AbilityKey;
  defaultWield: WieldTypes;
  weapon: MeleeWeapon;
  attackSources: Source<AttackRollChange>[];
};

export type AttackRollChange = BaseChange & {
  type: 'ATTACK_ROLLS';
  attackType: AttackType | "all";
};

export type BaseAttackBonusChange = BaseChange & {
  type: 'BAB';
};

export type DamageChange = BaseChange & {
  type: 'DAMAGE';
  damageType?: DamageType;
};

export type CriticalRangeChange = BaseChange & {
  type: 'CRITICAL_RANGE';
};

export type CriticalMultiplierChange = BaseChange & {
  type: 'CRITICAL_MULTIPLIER';
};

export type CriticalConfirmationChange = BaseChange & {
  type: 'CRITICAL_CONFIRMATION';
};

export type DamageTypeChange = BaseChange & {
  type: 'DAMAGE_TYPE';
  damageType: DamageType;
};

export type WeaponSizeChange = BaseChange & {
  type: 'WEAPON_SIZE';
};

export type AttackChange =
  | AttackRollChange
  | BaseAttackBonusChange
  | DamageChange
  | CriticalRangeChange
  | CriticalMultiplierChange
  | CriticalConfirmationChange
  | DamageTypeChange;

/**
    Arma:
    - formula de daño base (ej: 1d6)
    - atributo de ataque (ej: fuerza)
    - rango base de critico (ej: 20)
    - atributo de daño (ej: fuerza)
    - bonificador por mejora de ataque (ej: +1)
    - bonificador por mejora de daño (ej: +1)
    - bonificador por mejora de daño crítico (ej: +1)
    - categoría (ej: marcial, exótica, etc)
    - tipo de arma (ej: simple, dos manos, etc)
    - tamaño de arma (ej: pequeña, mediana, grande, etc) (afecta al ataque si es de un tamaño diferente al del personaje)
    - alineamiento (ej: [caótico, bueno])
    - propiedades mágicas (ej: [flaming, vorpal, etc])
    Booleanos:
    - es de dos manos 
    - arrojadiza (alcance)
    - es de proyectil (cual usa)
    - es de alcance (y cuanto)
    - es de monje
    - es no letal
    - sutileza
    - es doble

    ---
    tendremos por un lado las armas y por otro los ataques. Los ataques son una mezcla del arma y el personaje.
    Además, puede haber ataques que no utilicen armas (como los que generan los conjuros)
    Los ataques que sí dependen de armas, tendrán que ser actualizados cuando se modifique el arma.
    De primeras calcularemos los ataques a la vez que se calcula el personaje.
 */

/*
concepts:
1. an attack: it has an attack bonus and a damage formula. It has a critical hit range, and it has to take into account that critical hits are not only multiplying damage, but sometimes imply even more damage (for example, if I have a bursting sword, it will do 1d10 fire damage on a critical hit). 
2. the context for an attack (or set of attacks): This is the context that the player has to take into account in order to calculate the total damage and attack bonus of his attack or attacks, as well as other things like miss chance. This includes: 
- a set of situational conditions that are boolean in nature, like "flanking", "high ground", "charging", that apply changes to the attack. These will come in an array and are not static, since some feats might modify them.
- a list of possible combat changes that the user might select. These are things like "power attack", which are not merely boolean changes, but require the user to select a range.
- wield type. Can be one of @WieldTypes 
- immediate and swift actions that can be used to modify the attack (eg: blade of blood)
- the choice to make a single attack or a full attack
    */

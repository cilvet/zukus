import { DamageType } from "../../../../damage/damageTypes";
import { DiceRolledData } from "../../../../rolls/DiceRoller/rollExpression";
import { DamageModification } from "./damageFormula";


export type DamageResult = {
    totalDamage: number;
    damageSections: DamageSectionResult[];
    damageTypeResults: DamageTypeResult[];
};

export type DamageSectionResult = {
    name: string;
    originalExpression: string;
    totalDamage: number;
    damageTypeResults: DamageTypeResult[];
    appliedDamageModifications?: DamageModification[];
    inheritedTypeDamage?: number;
    diceResults?: DiceRolledData[];
    damageSectionResults?: DamageSectionResult[];
};

export type DamageTypeResult = {
    damageTypeId: string;
    damageType: DamageType;
    totalDamage: number;
};


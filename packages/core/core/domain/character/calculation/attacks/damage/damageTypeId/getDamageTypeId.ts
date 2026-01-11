import { DamageType } from "../../../../../damage/damageTypes";

export function getDamageTypeId(damageType: DamageType): string {
    switch (damageType.type) {
        case 'basic':
            return damageType.damageType;
        case 'multiple':
            return damageType.damageTypes.join('-');
        case 'halfAndHalf':
            return `half-${damageType.firstDamageType}-half-${damageType.secondDamageType}`;
    }
}

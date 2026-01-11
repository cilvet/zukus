

import { getDamageTypeId } from "./getDamageTypeId";
import { BasicDamageType, SimpleDamageType, MultipleDamageType, HalfAndHalfDamageType } from "../../../../../damage/damageTypes";

describe('getDamageTypeId', () => {
  it('should return correct id for basic damage type', () => {
    const damageType: SimpleDamageType = {
      type: 'basic',
      damageType: 'piercing'
    };
    expect(getDamageTypeId(damageType)).toBe('piercing');
  });

  it('should return correct id for multiple damage type', () => {
    const damageType: MultipleDamageType = {
      type: 'multiple',
      damageTypes: ['piercing', 'slashing']
    };
    expect(getDamageTypeId(damageType)).toBe('piercing-slashing');
  });

  it('should return correct id for half and half damage type', () => {
    const damageType: HalfAndHalfDamageType = {
      type: 'halfAndHalf',
      firstDamageType: 'piercing',
      secondDamageType: 'slashing'
    };
    expect(getDamageTypeId(damageType)).toBe('half-piercing-half-slashing');
  });
});

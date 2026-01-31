/**
 * Converts inventory weapon entities to legacy Weapon format.
 *
 * This allows reusing the existing attack calculation system with
 * weapons from the new inventory system.
 */

import type { StandardEntity } from '../../entities/types/base';
import type { InventoryItemInstance } from '../types';
import type { Weapon, MeleeWeapon, RangedWeapon, WeightType } from '../../weapons/weapon';
import type { WeaponAttackType } from '../../character/baseData/attacks';
import type { Size } from '../../character/baseData/sizes';
import type { DamageType } from '../../damage/damageTypes';
import type { SimpleDiceExpression } from '../../rolls/dice';
import type { WeaponProficiencyType } from '../../weapons/weaponTypes';
import type { Effect } from '../../character/baseData/effects';
import type { Change } from '../../character/baseData/changes';

/**
 * Weapon entity from compendium (matches weaponSchema).
 */
export type WeaponEntity = StandardEntity & {
  damageDice: string;
  damageType: string;
  critRange: number;
  critMultiplier: number;
  weaponCategory: string;
  weaponType: string;
  weightClass?: string;
  finesse?: boolean;
  reach?: number;
  rangeIncrement?: number;
  enhancementBonus?: number;
  isMasterwork?: boolean;
  properties?: string[];
  effects?: Effect[];
  // After property resolution
  _appliedEffects?: unknown[];
  _modifiedFields?: Record<string, unknown>;
};

/**
 * Result of converting an inventory weapon to legacy format.
 */
export type ConvertedWeapon = {
  weapon: Weapon;
  /** Effects that should be applied to the character (not the weapon) */
  characterEffects: Effect[];
};

/**
 * Maps weaponCategory to proficiency type.
 */
function mapProficiencyType(category: string): WeaponProficiencyType {
  switch (category.toLowerCase()) {
    case 'simple':
      return 'simple';
    case 'martial':
      return 'martial';
    case 'exotic':
      return 'exotic';
    default:
      return 'martial';
  }
}

/**
 * Maps weightClass to WeightType.
 */
function mapWeightType(weightClass?: string): WeightType {
  switch (weightClass?.toLowerCase()) {
    case 'light':
      return 'LIGHT';
    case 'one-handed':
      return 'MEDIUM';
    case 'two-handed':
      return 'HEAVY';
    default:
      return 'MEDIUM';
  }
}

/**
 * Determines if a weapon is two-handed based on weightClass.
 */
function isTwoHanded(weightClass?: string): boolean {
  return weightClass?.toLowerCase() === 'two-handed';
}

/**
 * Converts an inventory weapon entity to the legacy Weapon format.
 *
 * @param entity - The resolved weapon entity from compendium
 * @param instance - The inventory item instance
 * @param characterSize - The character's size (default 'Medium')
 * @returns Converted weapon in legacy format
 */
export function convertToLegacyWeapon(
  entity: WeaponEntity,
  instance: InventoryItemInstance,
  characterSize: Size = 'Medium'
): ConvertedWeapon {
  const isMelee = entity.weaponType?.toLowerCase() !== 'ranged';
  const characterEffects: Effect[] = [];

  // Collect effects that target the character (not @item)
  if (entity.effects) {
    for (const effect of entity.effects) {
      if (!effect.target.startsWith('@item.')) {
        characterEffects.push(effect);
      }
    }
  }

  const baseWeapon = {
    itemType: 'WEAPON' as const,
    uniqueId: instance.instanceId,
    name: instance.customName || entity.name,
    equipped: instance.equipped,
    wielded: instance.wielded ?? false,
    damageDice: entity.damageDice as SimpleDiceExpression,
    size: characterSize, // Weapons use character size by default
    isMasterwork: entity.isMasterwork ?? false,
    enhancementBonus: entity.enhancementBonus as 1 | 2 | 3 | 4 | 5 | undefined,
    proficiencyType: mapProficiencyType(entity.weaponCategory),
    defaultWieldType: isTwoHanded(entity.weightClass) ? 'twoHanded' : 'primary',
    damageType: entity.damageType as DamageType,
    baseCritMultiplier: entity.critMultiplier,
    baseCritRange: entity.critRange,
    twoHanded: isTwoHanded(entity.weightClass),
    // Properties' effects that modify the weapon are already applied
    // via applyPropertyEffectsToItem, so we don't need wieldedChanges here
  };

  if (isMelee) {
    const meleeWeapon: MeleeWeapon = {
      ...baseWeapon,
      weaponAttackType: 'melee' as const,
      finesse: entity.finesse ?? false,
      reachRange: entity.reach,
      weightType: mapWeightType(entity.weightClass),
      thrown: false, // TODO: Add thrown support
    };
    return { weapon: meleeWeapon, characterEffects };
  } else {
    const rangedWeapon: RangedWeapon = {
      ...baseWeapon,
      weaponAttackType: 'ranged' as const,
      rangeIncrement: entity.rangeIncrement ?? 10,
      ammunitionType: 'ARROW', // Default, should be specified in entity
      requiresLoading: false,
    };
    return { weapon: rangedWeapon, characterEffects };
  }
}

/**
 * Checks if an entity is a weapon entity with required fields.
 */
export function isWeaponEntity(entity: StandardEntity): entity is WeaponEntity {
  const e = entity as WeaponEntity;
  return (
    typeof e.damageDice === 'string' &&
    typeof e.critRange === 'number' &&
    typeof e.critMultiplier === 'number'
  );
}

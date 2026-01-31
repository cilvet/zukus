/**
 * Resolves inventory weapons for attack calculation.
 *
 * This module handles the conversion of inventory weapon items to the
 * legacy Weapon format used by the attack calculation system.
 */

import type { CharacterBaseData } from '../../character/baseData/character';
import type { CharacterSheet } from '../../character/calculatedSheet/sheet';
import type { InventoryEntityResolver } from '../../compendiums/types';
import type { StandardEntity } from '../../entities/types/base';
import type { Weapon } from '../../weapons/weapon';
import {
  convertToLegacyWeapon,
  isWeaponEntity,
  type WeaponEntity,
} from './convertToLegacyWeapon';
import { applyPropertyEffectsToItem } from '../properties/resolveItemEffects';

/**
 * Converts inventory weapons to legacy Weapon format for attack calculation.
 *
 * For each weapon in inventoryState with entityType 'weapon' and equipped=true:
 * 1. Resolve the weapon entity from compendium
 * 2. Apply property effects to the weapon (e.g., Keen modifying critRange)
 * 3. Convert to legacy Weapon format
 *
 * @param characterData - The character's base data
 * @param characterSheet - The calculated character sheet (for size info)
 * @param resolver - Function to resolve entity references to full entities
 * @returns Array of weapons in legacy format
 */
export function resolveInventoryWeapons(
  characterData: CharacterBaseData,
  characterSheet: CharacterSheet,
  resolver?: InventoryEntityResolver
): Weapon[] {
  if (!resolver || !characterData.inventoryState) {
    return [];
  }

  const weapons: Weapon[] = [];
  const items = characterData.inventoryState.items;
  const characterSize = characterSheet.size.currentSize;

  for (const item of items) {
    // Only process equipped weapons
    if (item.entityType !== 'weapon' || !item.equipped) {
      continue;
    }

    // Resolve the weapon entity
    const entity = resolver(item.entityType, item.itemId);
    if (!entity || !isWeaponEntity(entity)) {
      continue;
    }

    // Apply property effects to the weapon
    const resolvedWeapon = resolveWeaponProperties(entity, resolver);

    // Convert to legacy format
    const { weapon } = convertToLegacyWeapon(resolvedWeapon, item, characterSize);

    weapons.push(weapon);
  }

  return weapons;
}

/**
 * Resolves and applies property effects to a weapon entity.
 *
 * @param weapon - The weapon entity
 * @param resolver - Function to resolve property references
 * @returns Weapon with property effects applied
 */
function resolveWeaponProperties(
  weapon: WeaponEntity,
  resolver: InventoryEntityResolver
): WeaponEntity {
  const propertyIds = weapon.properties ?? [];

  if (propertyIds.length === 0) {
    return weapon;
  }

  // Resolve property entities
  const propertyEntities: StandardEntity[] = [];
  for (const propId of propertyIds) {
    const propEntity = resolver('weaponProperty', propId);
    if (propEntity) {
      propertyEntities.push(propEntity);
    }
  }

  if (propertyEntities.length === 0) {
    return weapon;
  }

  // Apply property effects to weapon
  return applyPropertyEffectsToItem(weapon, propertyEntities) as WeaponEntity;
}

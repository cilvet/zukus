/**
 * Resolves inventory weapons for attack calculation.
 *
 * This module handles the conversion of inventory weapon items to the
 * legacy Weapon format used by the attack calculation system.
 *
 * Items must have their entity stored (self-contained character principle).
 * Properties should already be applied to the entity at acquisition time.
 */

import type { CharacterBaseData } from '../../character/baseData/character';
import type { CharacterSheet } from '../../character/calculatedSheet/sheet';
import type { Weapon } from '../../weapons/weapon';
import {
  convertToLegacyWeapon,
  isWeaponEntity,
  type WeaponEntity,
} from './convertToLegacyWeapon';
import { isItemEquipped } from '../instanceFields';

/**
 * Converts inventory weapons to legacy Weapon format for attack calculation.
 *
 * For each weapon in inventoryState with entityType 'weapon' and equipped=true:
 * 1. Use stored entity (entity field must be set)
 * 2. Convert to legacy Weapon format
 *
 * @param characterData - The character's base data
 * @param characterSheet - The calculated character sheet (for size info)
 * @returns Array of weapons in legacy format
 */
export function resolveInventoryWeapons(
  characterData: CharacterBaseData,
  characterSheet: CharacterSheet
): Weapon[] {
  if (!characterData.inventoryState) {
    return [];
  }

  const weapons: Weapon[] = [];
  const items = characterData.inventoryState.items;
  const characterSize = characterSheet.size.currentSize;

  for (const item of items) {
    // Only process equipped weapons with stored entity
    if (item.entityType !== 'weapon' || !isItemEquipped(item) || !item.entity) {
      continue;
    }

    if (!isWeaponEntity(item.entity)) {
      continue;
    }

    // Entity already has properties applied (keen, etc.)
    const { weapon } = convertToLegacyWeapon(
      item.entity as WeaponEntity,
      item,
      characterSize
    );

    weapons.push(weapon);
  }

  return weapons;
}

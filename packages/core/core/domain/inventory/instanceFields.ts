/**
 * Instance Fields for Inventory
 *
 * Helper functions for reading/writing instance state fields (equipped, wielded, active).
 *
 * ARQUITECTURA: Estos valores son campos NORMALES de la entidad, definidos en el
 * schema/addon con sus valores por defecto. Las fórmulas acceden directamente
 * a @item.equipped, @item.wielded, etc.
 *
 * Los helpers de este módulo simplifican la lectura/escritura de estos campos.
 */

import type { InventoryItemInstance } from './types';

// =============================================================================
// Equipped State Helpers
// =============================================================================

/**
 * Checks if an item is equipped.
 * Lee directamente entity.equipped.
 */
export function isItemEquipped(item: InventoryItemInstance): boolean {
  return item.entity?.equipped === true;
}

/**
 * Sets the equipped state of an item.
 * Escribe directamente en entity.equipped.
 */
export function setItemEquipped(
  item: InventoryItemInstance,
  equipped: boolean
): InventoryItemInstance {
  if (!item.entity) {
    return item;
  }

  return {
    ...item,
    entity: {
      ...item.entity,
      equipped,
    },
  };
}

/**
 * Toggles the equipped state of an item.
 */
export function toggleItemEquipped(
  item: InventoryItemInstance
): InventoryItemInstance {
  return setItemEquipped(item, !isItemEquipped(item));
}

// =============================================================================
// Wielded State Helpers
// =============================================================================

/**
 * Checks if a weapon is wielded.
 * Lee directamente entity.wielded.
 */
export function isItemWielded(item: InventoryItemInstance): boolean {
  return item.entity?.wielded === true;
}

/**
 * Sets the wielded state of a weapon.
 * Escribe directamente en entity.wielded.
 */
export function setItemWielded(
  item: InventoryItemInstance,
  wielded: boolean
): InventoryItemInstance {
  if (!item.entity) {
    return item;
  }

  return {
    ...item,
    entity: {
      ...item.entity,
      wielded,
    },
  };
}

/**
 * Toggles the wielded state of a weapon.
 */
export function toggleItemWielded(
  item: InventoryItemInstance
): InventoryItemInstance {
  return setItemWielded(item, !isItemWielded(item));
}

// =============================================================================
// Active State Helpers
// =============================================================================

/**
 * Checks if an item is active.
 * Lee directamente entity.active.
 */
export function isItemActive(item: InventoryItemInstance): boolean {
  return item.entity?.active === true;
}

/**
 * Sets the active state of an item.
 * Escribe directamente en entity.active.
 */
export function setItemActive(
  item: InventoryItemInstance,
  active: boolean
): InventoryItemInstance {
  if (!item.entity) {
    return item;
  }

  return {
    ...item,
    entity: {
      ...item.entity,
      active,
    },
  };
}

/**
 * Toggles the active state of an item.
 */
export function toggleItemActive(
  item: InventoryItemInstance
): InventoryItemInstance {
  return setItemActive(item, !isItemActive(item));
}

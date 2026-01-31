/**
 * Operaciones de containers.
 *
 * Los containers son items que pueden contener otros items.
 * Usan el addon 'container' que provee capacity e ignoresContentWeight.
 */

import type { InventoryState, InventoryItemInstance, InventoryUpdateResult } from './types';
import { inventorySuccess, inventoryWithWarning } from './types';

/**
 * Mueve un item a un container.
 *
 * @param state - Estado actual del inventario
 * @param instanceId - ID del item a mover
 * @param containerId - ID del container destino
 * @returns Resultado con el nuevo estado
 */
export function moveToContainer(
  state: InventoryState,
  instanceId: string,
  containerId: string
): InventoryUpdateResult<InventoryState> {
  const item = state.items.find((i) => i.instanceId === instanceId);

  if (!item) {
    return inventoryWithWarning(state, {
      type: 'item_not_found',
      message: `Item with instanceId "${instanceId}" not found`,
      instanceId,
    });
  }

  const container = state.items.find((i) => i.instanceId === containerId);

  if (!container) {
    return inventoryWithWarning(state, {
      type: 'container_not_found',
      message: `Container with instanceId "${containerId}" not found`,
      instanceId: containerId,
    });
  }

  // No permitir mover un item a sí mismo
  if (instanceId === containerId) {
    return inventoryWithWarning(state, {
      type: 'invalid_container',
      message: 'Cannot move item into itself',
      instanceId,
    });
  }

  // No permitir crear ciclos (un container dentro de algo que está dentro de él)
  if (isItemInContainer(state, containerId, instanceId)) {
    return inventoryWithWarning(state, {
      type: 'invalid_container',
      message: 'Cannot create circular container references',
      instanceId,
    });
  }

  return inventorySuccess({
    ...state,
    items: state.items.map((i) => {
      if (i.instanceId === instanceId) {
        return { ...i, containerId };
      }
      return i;
    }),
  });
}

/**
 * Saca un item de su container.
 *
 * @param state - Estado actual del inventario
 * @param instanceId - ID del item a sacar
 * @returns Resultado con el nuevo estado
 */
export function removeFromContainer(
  state: InventoryState,
  instanceId: string
): InventoryUpdateResult<InventoryState> {
  const item = state.items.find((i) => i.instanceId === instanceId);

  if (!item) {
    return inventoryWithWarning(state, {
      type: 'item_not_found',
      message: `Item with instanceId "${instanceId}" not found`,
      instanceId,
    });
  }

  if (!item.containerId) {
    // Ya está fuera de un container, no hacer nada
    return inventorySuccess(state);
  }

  return inventorySuccess({
    ...state,
    items: state.items.map((i) => {
      if (i.instanceId === instanceId) {
        const { containerId: _, ...rest } = i;
        return rest;
      }
      return i;
    }),
  });
}

/**
 * Obtiene todos los items dentro de un container.
 *
 * @param state - Estado actual del inventario
 * @param containerId - ID del container
 * @returns Array de items en el container
 */
export function getContainerContents(
  state: InventoryState,
  containerId: string
): InventoryItemInstance[] {
  return state.items.filter((i) => i.containerId === containerId);
}

/**
 * Verifica si un item está dentro de un container (directa o indirectamente).
 *
 * @param state - Estado actual del inventario
 * @param itemId - ID del item a buscar
 * @param containerId - ID del container donde buscar
 * @returns true si el item está en el container o en algún sub-container
 */
export function isItemInContainer(
  state: InventoryState,
  itemId: string,
  containerId: string
): boolean {
  const item = state.items.find((i) => i.instanceId === itemId);

  if (!item || !item.containerId) {
    return false;
  }

  if (item.containerId === containerId) {
    return true;
  }

  // Buscar recursivamente
  return isItemInContainer(state, item.containerId, containerId);
}

/**
 * Obtiene la cadena de containers que contienen un item.
 *
 * @param state - Estado actual del inventario
 * @param instanceId - ID del item
 * @returns Array de IDs de containers (del más cercano al más lejano)
 */
export function getContainerChain(
  state: InventoryState,
  instanceId: string
): string[] {
  const chain: string[] = [];
  let currentItem = state.items.find((i) => i.instanceId === instanceId);

  while (currentItem?.containerId) {
    chain.push(currentItem.containerId);
    currentItem = state.items.find((i) => i.instanceId === currentItem!.containerId);
  }

  return chain;
}

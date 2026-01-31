/**
 * Operaciones puras sobre el estado del inventario.
 *
 * Todas las funciones son puras y retornan un nuevo estado.
 * No modifican el estado original.
 */

import type {
  InventoryState,
  InventoryItemInstance,
  InventoryUpdateResult,
  ResolvedInventoryEntity,
} from './types';
import {
  inventorySuccess,
  inventoryWithWarning,
  createItemInstance,
} from './types';
import {
  isItemEquipped,
  setItemEquipped as setItemEquippedHelper,
  toggleItemEquipped as toggleItemEquippedHelper,
  isItemWielded,
  setItemWielded as setItemWieldedHelper,
} from './instanceFields';

/**
 * Añade un item al inventario.
 *
 * IMPORTANTE: La entidad debe pasarse ya resuelta (con propiedades aplicadas).
 * El personaje almacena la entidad completa para funcionar sin el compendium.
 *
 * @param state - Estado actual del inventario
 * @param params - Parámetros del item a añadir
 * @param params.entity - Entidad resuelta del compendium (recomendado)
 * @returns Resultado con el nuevo estado y la instancia creada
 */
export function addItem(
  state: InventoryState,
  params: {
    itemId: string;
    entityType: string;
    quantity?: number;
    equipped?: boolean;
    customName?: string;
    /** Entidad resuelta del compendium (con propiedades aplicadas) */
    entity?: ResolvedInventoryEntity;
  }
): InventoryUpdateResult<InventoryState> & { instance: InventoryItemInstance } {
  // Build instanceValues if equipped is specified
  const instanceValues: Record<string, boolean> | undefined = params.equipped
    ? { equipped: true }
    : undefined;

  const instance = createItemInstance({
    ...params,
    instanceValues,
    entity: params.entity,
  });

  return {
    state: {
      ...state,
      items: [...state.items, instance],
    },
    warnings: [],
    instance,
  };
}

/**
 * Elimina un item del inventario (o reduce su cantidad).
 *
 * @param state - Estado actual del inventario
 * @param instanceId - ID de la instancia a eliminar
 * @param quantity - Cantidad a eliminar (undefined = todo)
 * @returns Resultado con el nuevo estado
 */
export function removeItem(
  state: InventoryState,
  instanceId: string,
  quantity?: number
): InventoryUpdateResult<InventoryState> {
  const itemIndex = state.items.findIndex((i) => i.instanceId === instanceId);

  if (itemIndex === -1) {
    return inventoryWithWarning(state, {
      type: 'item_not_found',
      message: `Item with instanceId "${instanceId}" not found`,
      instanceId,
    });
  }

  const item = state.items[itemIndex];

  // Si no se especifica cantidad o la cantidad es >= que la actual, eliminar completamente
  if (quantity === undefined || quantity >= item.quantity) {
    return inventorySuccess({
      ...state,
      items: state.items.filter((i) => i.instanceId !== instanceId),
    });
  }

  // Reducir cantidad
  if (quantity <= 0) {
    return inventoryWithWarning(state, {
      type: 'invalid_amount',
      message: 'Quantity to remove must be positive',
      instanceId,
    });
  }

  return inventorySuccess({
    ...state,
    items: state.items.map((i) => {
      if (i.instanceId === instanceId) {
        return { ...i, quantity: i.quantity - quantity };
      }
      return i;
    }),
  });
}

/**
 * Actualiza una instancia de item.
 *
 * @param state - Estado actual del inventario
 * @param instanceId - ID de la instancia a actualizar
 * @param updates - Campos a actualizar
 * @returns Resultado con el nuevo estado
 */
export function updateItem(
  state: InventoryState,
  instanceId: string,
  updates: Partial<Pick<InventoryItemInstance, 'quantity' | 'customName' | 'notes' | 'containerId' | 'instanceValues'>>
): InventoryUpdateResult<InventoryState> {
  const itemExists = state.items.some((i) => i.instanceId === instanceId);

  if (!itemExists) {
    return inventoryWithWarning(state, {
      type: 'item_not_found',
      message: `Item with instanceId "${instanceId}" not found`,
      instanceId,
    });
  }

  return inventorySuccess({
    ...state,
    items: state.items.map((i) => {
      if (i.instanceId === instanceId) {
        return { ...i, ...updates };
      }
      return i;
    }),
  });
}

/**
 * Equipa o desequipa un item.
 *
 * @param state - Estado actual del inventario
 * @param instanceId - ID de la instancia
 * @param equipped - Nuevo estado de equipado
 * @returns Resultado con el nuevo estado
 */
export function setItemEquipped(
  state: InventoryState,
  instanceId: string,
  equipped: boolean
): InventoryUpdateResult<InventoryState> {
  const item = state.items.find((i) => i.instanceId === instanceId);

  if (!item) {
    return inventoryWithWarning(state, {
      type: 'item_not_found',
      message: `Item with instanceId "${instanceId}" not found`,
      instanceId,
    });
  }

  const updatedItem = setItemEquippedHelper(item, equipped);

  return inventorySuccess({
    ...state,
    items: state.items.map((i) =>
      i.instanceId === instanceId ? updatedItem : i
    ),
  });
}

/**
 * Toggle del estado equipado de un item.
 *
 * @param state - Estado actual del inventario
 * @param instanceId - ID de la instancia
 * @returns Resultado con el nuevo estado
 */
export function toggleItemEquipped(
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

  const updatedItem = toggleItemEquippedHelper(item);

  return inventorySuccess({
    ...state,
    items: state.items.map((i) =>
      i.instanceId === instanceId ? updatedItem : i
    ),
  });
}

/**
 * Empuña o desempuña un arma.
 *
 * @param state - Estado actual del inventario
 * @param instanceId - ID de la instancia
 * @param wielded - Nuevo estado de empuñado
 * @returns Resultado con el nuevo estado
 */
export function setWeaponWielded(
  state: InventoryState,
  instanceId: string,
  wielded: boolean
): InventoryUpdateResult<InventoryState> {
  const item = state.items.find((i) => i.instanceId === instanceId);

  if (!item) {
    return inventoryWithWarning(state, {
      type: 'item_not_found',
      message: `Item with instanceId "${instanceId}" not found`,
      instanceId,
    });
  }

  const updatedItem = setItemWieldedHelper(item, wielded);

  return inventorySuccess({
    ...state,
    items: state.items.map((i) =>
      i.instanceId === instanceId ? updatedItem : i
    ),
  });
}

/**
 * Obtiene un item por su instanceId.
 *
 * @param state - Estado actual del inventario
 * @param instanceId - ID de la instancia
 * @returns El item o undefined si no existe
 */
export function getItem(
  state: InventoryState,
  instanceId: string
): InventoryItemInstance | undefined {
  return state.items.find((i) => i.instanceId === instanceId);
}

/**
 * Obtiene todos los items de un tipo específico.
 *
 * @param state - Estado actual del inventario
 * @param entityType - Tipo de entidad a filtrar
 * @returns Array de items del tipo especificado
 */
export function getItemsByType(
  state: InventoryState,
  entityType: string
): InventoryItemInstance[] {
  return state.items.filter((i) => i.entityType === entityType);
}

/**
 * Obtiene todos los items equipados.
 *
 * @param state - Estado actual del inventario
 * @returns Array de items equipados
 */
export function getEquippedItems(
  state: InventoryState
): InventoryItemInstance[] {
  return state.items.filter((i) => isItemEquipped(i));
}

/**
 * Obtiene todos los items que no están en un container.
 *
 * @param state - Estado actual del inventario
 * @returns Array de items sin container
 */
export function getRootItems(state: InventoryState): InventoryItemInstance[] {
  return state.items.filter((i) => !i.containerId);
}

/**
 * Incrementa la cantidad de un item existente o crea uno nuevo.
 *
 * @param state - Estado actual del inventario
 * @param itemId - ID de la entidad
 * @param entityType - Tipo de entidad
 * @param quantity - Cantidad a añadir (default 1)
 * @returns Resultado con el nuevo estado
 */
export function addOrStackItem(
  state: InventoryState,
  itemId: string,
  entityType: string,
  quantity: number = 1
): InventoryUpdateResult<InventoryState> & { instanceId: string } {
  // Buscar item existente del mismo tipo que no esté equipado ni en container
  const existingItem = state.items.find(
    (i) =>
      i.itemId === itemId &&
      i.entityType === entityType &&
      !isItemEquipped(i) &&
      !i.containerId &&
      !i.customName // No stackear items con nombre personalizado
  );

  if (existingItem) {
    const result = updateItem(state, existingItem.instanceId, {
      quantity: existingItem.quantity + quantity,
    });
    return { ...result, instanceId: existingItem.instanceId };
  }

  // Crear nuevo item
  const { state: newState, instance } = addItem(state, {
    itemId,
    entityType,
    quantity,
  });

  return { state: newState, warnings: [], instanceId: instance.instanceId };
}

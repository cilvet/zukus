/**
 * Operaciones de inventario sobre CharacterBaseData.
 *
 * Estas operaciones trabajan con el nuevo sistema de inventario (inventoryState).
 * Delegan a las funciones puras del módulo inventory/.
 */

import type { CharacterBaseData } from '../../baseData/character';
import type { OperationResult, OperationWarning } from '../types';
import { success, withWarning } from '../types';
import {
  createEmptyInventoryState,
  type InventoryItemInstance,
  type InventoryState,
  type InventoryWarning,
  type CurrencyState,
} from '../../../inventory/types';
import * as itemOps from '../../../inventory/itemOperations';
import * as containerOps from '../../../inventory/containerOperations';
import * as currencyOps from '../../../inventory/currencies/currencyOperations';
import type { CurrencyDefinition } from '../../../inventory/currencies/types';

/**
 * Helper para asegurar que inventoryState existe.
 */
function ensureInventoryState(character: CharacterBaseData): InventoryState {
  return character.inventoryState ?? createEmptyInventoryState();
}

/**
 * Convierte warnings de inventario a warnings de operación.
 */
function convertWarnings(warnings: InventoryWarning[]): OperationWarning[] {
  return warnings.map((w) => ({
    type: 'validation_error' as const,
    message: w.message,
    entityId: w.instanceId ?? w.itemId ?? w.currencyId,
  }));
}

// =============================================================================
// Item Operations
// =============================================================================

/**
 * Añade un item al inventario nuevo.
 */
export function addInventoryItem(
  character: CharacterBaseData,
  params: {
    itemId: string;
    entityType: string;
    quantity?: number;
    equipped?: boolean;
    customName?: string;
    entity?: any; // StandardEntity - the resolved entity from compendium
  }
): OperationResult & { instance?: InventoryItemInstance } {
  const state = ensureInventoryState(character);
  const result = itemOps.addItem(state, params);

  return {
    character: {
      ...character,
      inventoryState: result.state,
    },
    warnings: convertWarnings(result.warnings),
    instance: result.instance,
  };
}

/**
 * Elimina un item del inventario (o reduce cantidad).
 */
export function removeInventoryItem(
  character: CharacterBaseData,
  instanceId: string,
  quantity?: number
): OperationResult {
  const state = ensureInventoryState(character);
  const result = itemOps.removeItem(state, instanceId, quantity);

  if (result.warnings.length > 0) {
    return withWarning(character, {
      type: 'not_found',
      message: result.warnings[0].message,
      entityId: instanceId,
    });
  }

  return success({
    ...character,
    inventoryState: result.state,
  });
}

/**
 * Actualiza un item del inventario.
 */
export function updateInventoryItem(
  character: CharacterBaseData,
  instanceId: string,
  updates: Partial<
    Pick<
      InventoryItemInstance,
      'quantity' | 'equipped' | 'wielded' | 'customName' | 'notes' | 'containerId'
    >
  >
): OperationResult {
  const state = ensureInventoryState(character);
  const result = itemOps.updateItem(state, instanceId, updates);

  if (result.warnings.length > 0) {
    return withWarning(character, {
      type: 'not_found',
      message: result.warnings[0].message,
      entityId: instanceId,
    });
  }

  return success({
    ...character,
    inventoryState: result.state,
  });
}

/**
 * Equipa o desequipa un item.
 */
export function setInventoryItemEquipped(
  character: CharacterBaseData,
  instanceId: string,
  equipped: boolean
): OperationResult {
  return updateInventoryItem(character, instanceId, { equipped });
}

/**
 * Toggle del estado equipado de un item.
 */
export function toggleInventoryItemEquipped(
  character: CharacterBaseData,
  instanceId: string
): OperationResult {
  const state = ensureInventoryState(character);
  const result = itemOps.toggleItemEquipped(state, instanceId);

  if (result.warnings.length > 0) {
    return withWarning(character, {
      type: 'not_found',
      message: result.warnings[0].message,
      entityId: instanceId,
    });
  }

  return success({
    ...character,
    inventoryState: result.state,
  });
}

/**
 * Empuña o desempuña un arma.
 */
export function setInventoryWeaponWielded(
  character: CharacterBaseData,
  instanceId: string,
  wielded: boolean
): OperationResult {
  return updateInventoryItem(character, instanceId, { wielded });
}

/**
 * Añade o apila un item (si ya existe uno igual sin equipar).
 */
export function addOrStackInventoryItem(
  character: CharacterBaseData,
  itemId: string,
  entityType: string,
  quantity: number = 1
): OperationResult & { instanceId?: string } {
  const state = ensureInventoryState(character);
  const result = itemOps.addOrStackItem(state, itemId, entityType, quantity);

  return {
    character: {
      ...character,
      inventoryState: result.state,
    },
    warnings: convertWarnings(result.warnings),
    instanceId: result.instanceId,
  };
}

// =============================================================================
// Container Operations
// =============================================================================

/**
 * Mueve un item a un container.
 */
export function moveInventoryItemToContainer(
  character: CharacterBaseData,
  instanceId: string,
  containerId: string
): OperationResult {
  const state = ensureInventoryState(character);
  const result = containerOps.moveToContainer(state, instanceId, containerId);

  if (result.warnings.length > 0) {
    const warning = result.warnings[0];
    return withWarning(character, {
      type: warning.type === 'item_not_found' ? 'not_found' : 'validation_error',
      message: warning.message,
      entityId: warning.instanceId,
    });
  }

  return success({
    ...character,
    inventoryState: result.state,
  });
}

/**
 * Saca un item de su container.
 */
export function removeInventoryItemFromContainer(
  character: CharacterBaseData,
  instanceId: string
): OperationResult {
  const state = ensureInventoryState(character);
  const result = containerOps.removeFromContainer(state, instanceId);

  if (result.warnings.length > 0) {
    return withWarning(character, {
      type: 'not_found',
      message: result.warnings[0].message,
      entityId: instanceId,
    });
  }

  return success({
    ...character,
    inventoryState: result.state,
  });
}

// =============================================================================
// Currency Operations
// =============================================================================

/**
 * Añade currency al personaje.
 */
export function addCurrency(
  character: CharacterBaseData,
  currencyId: string,
  amount: number
): OperationResult {
  const state = ensureInventoryState(character);
  const result = currencyOps.addCurrency(state.currencies, currencyId, amount);

  if (result.warnings.length > 0) {
    return withWarning(character, {
      type: 'validation_error',
      message: result.warnings[0].message,
    });
  }

  return success({
    ...character,
    inventoryState: {
      ...state,
      currencies: result.currencies,
    },
  });
}

/**
 * Gasta currency del personaje.
 */
export function spendCurrency(
  character: CharacterBaseData,
  currencyId: string,
  amount: number
): OperationResult {
  const state = ensureInventoryState(character);
  const result = currencyOps.removeCurrency(state.currencies, currencyId, amount);

  if (result.warnings.length > 0) {
    return withWarning(character, {
      type: 'validation_error',
      message: result.warnings[0].message,
    });
  }

  return success({
    ...character,
    inventoryState: {
      ...state,
      currencies: result.currencies,
    },
  });
}

/**
 * Convierte de una currency a otra.
 */
export function convertCurrency(
  character: CharacterBaseData,
  fromId: string,
  toId: string,
  amount: number,
  currencyDefs: CurrencyDefinition[]
): OperationResult {
  const state = ensureInventoryState(character);
  const result = currencyOps.convertCurrency(
    state.currencies,
    fromId,
    toId,
    amount,
    currencyDefs
  );

  if (result.warnings.length > 0) {
    return withWarning(character, {
      type: 'validation_error',
      message: result.warnings[0].message,
    });
  }

  return success({
    ...character,
    inventoryState: {
      ...state,
      currencies: result.currencies,
    },
  });
}

/**
 * Establece directamente el valor de una currency.
 */
export function setCurrency(
  character: CharacterBaseData,
  currencyId: string,
  amount: number
): OperationResult {
  const state = ensureInventoryState(character);
  const result = currencyOps.setCurrency(state.currencies, currencyId, amount);

  if (result.warnings.length > 0) {
    return withWarning(character, {
      type: 'validation_error',
      message: result.warnings[0].message,
    });
  }

  return success({
    ...character,
    inventoryState: {
      ...state,
      currencies: result.currencies,
    },
  });
}

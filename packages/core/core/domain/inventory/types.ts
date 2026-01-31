import type { InstanceValues } from '../entities/types/instanceFields';
import type { StandardEntity } from '../entities/types/base';

/**
 * Sistema de Inventario
 *
 * Sistema paralelo al equipment actual que usa entidades del compendium.
 * Permite gestionar items como referencias a entidades con instancias únicas.
 *
 * PRINCIPIO ARQUITECTONICO: Las entidades se resuelven al adquirir el item,
 * no al calcular. Esto permite que el personaje funcione sin el compendium.
 * Ver: .cursor/rules/core/architectural-principles.mdc
 */

/**
 * Entidad resuelta de un item de inventario.
 * Contiene la entidad del compendium con propiedades ya aplicadas.
 */
export type ResolvedInventoryEntity = StandardEntity & {
  /** Campos adicionales especificos del tipo de item */
  [key: string]: unknown;
};

/**
 * Instancia de un item en el inventario.
 * Contiene la entidad resuelta (no solo una referencia).
 *
 * Note: equipped/wielded state is stored in instanceValues, not as direct fields.
 * Use the helpers isItemEquipped() and isItemWielded() to check these states.
 */
export type InventoryItemInstance = {
  /** UUID único de esta instancia */
  instanceId: string;
  /** ID de la entidad original (para referencia) */
  itemId: string;
  /** Tipo de entidad ('weapon', 'armor', 'item', etc.) */
  entityType: string;
  /** Cantidad de este item (default 1) */
  quantity: number;
  /** ID del container que contiene este item */
  containerId?: string;
  /** Nombre personalizado para este item */
  customName?: string;
  /** Notas del usuario sobre este item */
  notes?: string;
  /**
   * User-editable instance field values.
   * Keys are field names defined in the entity's schema/addons.
   * Values are the user-set values (boolean, number, or string).
   * If undefined or missing a key, the default value from the field definition is used.
   *
   * Common fields (depending on addons):
   * - equipped: boolean (from equippable addon)
   * - wielded: boolean (from wieldable addon)
   * - active: boolean (from activable addon)
   */
  instanceValues?: InstanceValues;
  /**
   * Entidad resuelta del compendium.
   * Incluye propiedades (keen, flaming, etc.) ya aplicadas.
   * Se almacena al adquirir el item, no se resuelve al calcular.
   */
  entity?: ResolvedInventoryEntity;
};

/**
 * Estado de currencies del personaje.
 * Keyed por currencyId (e.g., 'gold', 'silver', 'copper').
 */
export type CurrencyState = {
  [currencyId: string]: number;
};

/**
 * Estado completo del inventario.
 * Se almacena en CharacterBaseData.inventoryState.
 */
export type InventoryState = {
  /** Items en el inventario */
  items: InventoryItemInstance[];
  /** Estado de currencies */
  currencies: CurrencyState;
};

/**
 * Tipos de warning específicos del inventario.
 */
export type InventoryWarningType =
  | 'item_not_found'
  | 'insufficient_quantity'
  | 'container_not_found'
  | 'container_full'
  | 'invalid_container'
  | 'currency_not_found'
  | 'insufficient_currency'
  | 'invalid_amount';

/**
 * Warning generado por operaciones de inventario.
 */
export type InventoryWarning = {
  type: InventoryWarningType;
  message: string;
  instanceId?: string;
  itemId?: string;
  currencyId?: string;
};

/**
 * Resultado de una operación de inventario.
 */
export type InventoryUpdateResult<T = InventoryState> = {
  state: T;
  warnings: InventoryWarning[];
};

/**
 * Helper para crear resultado exitoso.
 */
export function inventorySuccess<T>(state: T): InventoryUpdateResult<T> {
  return { state, warnings: [] };
}

/**
 * Helper para crear resultado con warning.
 */
export function inventoryWithWarning<T>(
  state: T,
  warning: InventoryWarning
): InventoryUpdateResult<T> {
  return { state, warnings: [warning] };
}

/**
 * Crea un estado de inventario vacío.
 */
export function createEmptyInventoryState(): InventoryState {
  return {
    items: [],
    currencies: {},
  };
}

/**
 * Crea una nueva instancia de item.
 *
 * Note: To set equipped/wielded state, use the setItemEquipped/setItemWielded
 * helpers after creation, or pass them in instanceValues.
 *
 * @param params.entity - La entidad resuelta del compendium (con propiedades aplicadas)
 */
export function createItemInstance(params: {
  itemId: string;
  entityType: string;
  quantity?: number;
  customName?: string;
  instanceValues?: InstanceValues;
  entity?: ResolvedInventoryEntity;
}): InventoryItemInstance {
  return {
    instanceId: crypto.randomUUID(),
    itemId: params.itemId,
    entityType: params.entityType,
    quantity: params.quantity ?? 1,
    customName: params.customName,
    instanceValues: params.instanceValues,
    entity: params.entity,
  };
}

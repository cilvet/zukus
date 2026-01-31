/**
 * Sistema de Inventario
 *
 * Sistema paralelo al equipment actual que usa entidades del compendium.
 * Permite gestionar items como referencias a entidades con instancias únicas.
 */

/**
 * Instancia de un item en el inventario.
 * Referencia una entidad del compendium con datos de instancia específicos.
 */
export type InventoryItemInstance = {
  /** UUID único de esta instancia */
  instanceId: string;
  /** ID de la entidad en el compendium */
  itemId: string;
  /** Tipo de entidad ('weapon', 'armor', 'item', etc.) */
  entityType: string;
  /** Cantidad de este item (default 1) */
  quantity: number;
  /** Si el item está equipado */
  equipped: boolean;
  /** Si el arma está empuñada (solo para weapons) */
  wielded?: boolean;
  /** ID del container que contiene este item */
  containerId?: string;
  /** Nombre personalizado para este item */
  customName?: string;
  /** Notas del usuario sobre este item */
  notes?: string;
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
 */
export function createItemInstance(params: {
  itemId: string;
  entityType: string;
  quantity?: number;
  equipped?: boolean;
  customName?: string;
}): InventoryItemInstance {
  return {
    instanceId: crypto.randomUUID(),
    itemId: params.itemId,
    entityType: params.entityType,
    quantity: params.quantity ?? 1,
    equipped: params.equipped ?? false,
    customName: params.customName,
  };
}

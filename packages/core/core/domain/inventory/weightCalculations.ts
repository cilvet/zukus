/**
 * Cálculos de peso del inventario.
 *
 * El peso depende de:
 * - Items equipados vs carried
 * - Items en containers con ignoresContentWeight
 * - Currencies
 */

import type { InventoryState, InventoryItemInstance, CurrencyState } from './types';
import type { CurrencyDefinition } from './currencies/types';
import { getCurrencyWeight } from './currencies/currencyOperations';
import { getContainerContents } from './containerOperations';

/**
 * Desglose del peso del inventario.
 */
export type WeightBreakdown = {
  /** Peso de items equipados */
  equippedWeight: number;
  /** Peso de items no equipados (carried) */
  carriedWeight: number;
  /** Peso de currencies */
  currencyWeight: number;
  /** Peso total */
  totalWeight: number;
};

/**
 * Información de una entidad item necesaria para cálculos de peso.
 * Se espera que incluya el campo weight del addon dnd35item.
 */
export type ItemEntityInfo = {
  id: string;
  weight?: number;
  /** Si es un container, tiene estos campos del addon container */
  capacity?: number;
  ignoresContentWeight?: boolean;
};

/**
 * Resolver para obtener información de entidades de items.
 * Recibe itemId y entityType, devuelve la info de la entidad.
 */
export type ItemEntityResolver = (
  itemId: string,
  entityType: string
) => ItemEntityInfo | undefined;

/**
 * Calcula el peso de un item individual.
 *
 * @param item - Instancia del item en el inventario
 * @param resolver - Función para obtener datos de la entidad
 * @returns Peso del item (weight * quantity)
 */
export function calculateItemWeight(
  item: InventoryItemInstance,
  resolver: ItemEntityResolver
): number {
  const entity = resolver(item.itemId, item.entityType);

  if (!entity || entity.weight === undefined) {
    return 0;
  }

  return entity.weight * item.quantity;
}

/**
 * Calcula el peso del contenido de un container.
 * No incluye el peso del container mismo.
 *
 * @param state - Estado del inventario
 * @param containerId - ID del container
 * @param resolver - Resolver de entidades
 * @returns Peso del contenido (0 si ignoresContentWeight es true)
 */
export function calculateContainerContentWeight(
  state: InventoryState,
  containerId: string,
  resolver: ItemEntityResolver
): number {
  const container = state.items.find((i) => i.instanceId === containerId);
  if (!container) return 0;

  const containerEntity = resolver(container.itemId, container.entityType);

  // Si el container ignora el peso del contenido (e.g., bag of holding)
  if (containerEntity?.ignoresContentWeight) {
    return 0;
  }

  const contents = getContainerContents(state, containerId);
  let totalWeight = 0;

  for (const item of contents) {
    // Peso del item
    totalWeight += calculateItemWeight(item, resolver);

    // Si el item es a su vez un container, añadir peso de su contenido
    const itemEntity = resolver(item.itemId, item.entityType);
    if (itemEntity?.capacity !== undefined) {
      totalWeight += calculateContainerContentWeight(state, item.instanceId, resolver);
    }
  }

  return totalWeight;
}

/**
 * Calcula el desglose de peso del inventario.
 *
 * @param state - Estado del inventario
 * @param resolver - Resolver de entidades
 * @param currencyDefs - Definiciones de currencies
 * @returns Desglose de peso
 */
export function calculateWeightBreakdown(
  state: InventoryState,
  resolver: ItemEntityResolver,
  currencyDefs: CurrencyDefinition[] = []
): WeightBreakdown {
  let equippedWeight = 0;
  let carriedWeight = 0;

  // Solo considerar items en el nivel raíz (sin containerId)
  // Los items dentro de containers se cuentan a través de sus containers
  const rootItems = state.items.filter((i) => !i.containerId);

  for (const item of rootItems) {
    const itemWeight = calculateItemWeight(item, resolver);

    // Si es un container, añadir el peso de su contenido
    const entity = resolver(item.itemId, item.entityType);
    const contentWeight =
      entity?.capacity !== undefined
        ? calculateContainerContentWeight(state, item.instanceId, resolver)
        : 0;

    const totalItemWeight = itemWeight + contentWeight;

    if (item.equipped) {
      equippedWeight += totalItemWeight;
    } else {
      carriedWeight += totalItemWeight;
    }
  }

  const currencyWeight = getCurrencyWeight(state.currencies, currencyDefs);

  return {
    equippedWeight,
    carriedWeight,
    currencyWeight,
    totalWeight: equippedWeight + carriedWeight + currencyWeight,
  };
}

/**
 * Calcula solo el peso total (sin desglose).
 *
 * @param state - Estado del inventario
 * @param resolver - Resolver de entidades
 * @param currencyDefs - Definiciones de currencies
 * @returns Peso total
 */
export function calculateTotalWeight(
  state: InventoryState,
  resolver: ItemEntityResolver,
  currencyDefs: CurrencyDefinition[] = []
): number {
  return calculateWeightBreakdown(state, resolver, currencyDefs).totalWeight;
}

/**
 * Verifica si añadir peso a un container excedería su capacidad.
 *
 * @param state - Estado del inventario
 * @param containerId - ID del container
 * @param additionalWeight - Peso a añadir
 * @param resolver - Resolver de entidades
 * @returns true si excedería la capacidad
 */
export function wouldExceedCapacity(
  state: InventoryState,
  containerId: string,
  additionalWeight: number,
  resolver: ItemEntityResolver
): boolean {
  const container = state.items.find((i) => i.instanceId === containerId);
  if (!container) return false;

  const containerEntity = resolver(container.itemId, container.entityType);
  if (!containerEntity?.capacity) return false;

  // Containers que ignoran peso no tienen límite práctico
  if (containerEntity.ignoresContentWeight) return false;

  const currentContentWeight = calculateContainerContentWeight(state, containerId, resolver);

  return currentContentWeight + additionalWeight > containerEntity.capacity;
}

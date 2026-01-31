/**
 * Resolución completa de items para el inventario.
 *
 * Cuando se añade un item al inventario, este módulo se encarga de:
 * 1. Resolver la entidad base del item desde el compendium
 * 2. Resolver todas las propiedades referenciadas (keen, flaming, etc.)
 * 3. Aplicar los effects de las propiedades a la entidad
 * 4. Retornar la entidad completamente resuelta
 *
 * El resultado es una entidad auto-contenida que no necesita el compendium
 * para funcionar en tiempo de cálculo.
 *
 * NOTA: Los valores de instancia (equipped, wielded, etc.) son campos normales
 * de la entidad, definidos en el schema/addon con sus valores por defecto.
 * Las fórmulas pueden acceder a @item.equipped directamente.
 */

import type { StandardEntity } from '../../entities/types/base';
import type { ResolvedInventoryEntity } from '../types';
import { applyPropertyEffectsToItem, type ResolvedItem } from './resolveItemEffects';

/**
 * Función para resolver una entidad desde el compendium.
 */
export type EntityResolver = (
  entityType: string,
  entityId: string
) => StandardEntity | undefined;

/**
 * Opciones para la resolución de items.
 */
export type ResolveItemOptions = {
  /** Resolver de entidades del compendium */
  resolver: EntityResolver;
  /** Evaluador de fórmulas opcional (para aplicar effects como keen) */
  evaluateFormula?: (formula: string, context: Record<string, unknown>) => unknown;
  /** Nombre del campo que contiene las referencias a propiedades */
  propertiesFieldName?: string;
};

/**
 * Resultado de la resolución de un item.
 */
export type ResolveItemResult = {
  /** Entidad completamente resuelta, lista para almacenar */
  entity: ResolvedInventoryEntity;
  /** Propiedades resueltas (para referencia) */
  resolvedProperties: StandardEntity[];
  /** Warnings durante la resolución */
  warnings: ResolveItemWarning[];
};

/**
 * Warning durante la resolución de items.
 */
export type ResolveItemWarning = {
  type: 'property_not_found' | 'entity_not_found';
  message: string;
  entityId?: string;
  propertyId?: string;
};

/**
 * Resuelve un item con todas sus propiedades para almacenarlo en el inventario.
 *
 * Esta función:
 * 1. Toma la entidad base del item
 * 2. Busca referencias a propiedades en el campo especificado (default: "properties")
 * 3. Resuelve cada propiedad desde el compendium
 * 4. Aplica los effects de las propiedades a la entidad base
 * 5. Retorna la entidad completamente resuelta
 *
 * El resultado puede almacenarse directamente en el campo `entity` del
 * InventoryItemInstance, haciendo al personaje auto-contenido.
 *
 * @example
 * ```ts
 * // Resolver una espada con la propiedad Keen
 * const result = resolveItemForInventory(longswordEntity, {
 *   resolver: (type, id) => compendium.getEntity(type, id),
 *   evaluateFormula: (formula, ctx) => evaluate(formula, ctx),
 * });
 *
 * // Añadir al inventario con la entidad resuelta
 * addItem(inventoryState, {
 *   itemId: 'longsword-keen',
 *   entityType: 'weapon',
 *   entity: result.entity, // Entidad con keen ya aplicado
 * });
 * ```
 */
export function resolveItemForInventory(
  baseEntity: StandardEntity & Record<string, unknown>,
  options: ResolveItemOptions
): ResolveItemResult {
  const { resolver, evaluateFormula, propertiesFieldName = 'properties' } = options;
  const warnings: ResolveItemWarning[] = [];

  // Obtener IDs de propiedades del item
  const propertyIds = baseEntity[propertiesFieldName];

  // Si no hay propiedades, retornar la entidad como está
  if (!Array.isArray(propertyIds) || propertyIds.length === 0) {
    return {
      entity: baseEntity as ResolvedInventoryEntity,
      resolvedProperties: [],
      warnings,
    };
  }

  // Resolver cada propiedad desde el compendium
  const resolvedProperties: StandardEntity[] = [];
  const propertyEntityType = getPropertyEntityType(baseEntity.entityType);

  for (const propertyId of propertyIds) {
    if (typeof propertyId !== 'string') continue;

    const property = resolver(propertyEntityType, propertyId);

    if (!property) {
      warnings.push({
        type: 'property_not_found',
        message: `Property "${propertyId}" not found in compendium`,
        propertyId,
      });
      continue;
    }

    resolvedProperties.push(property);
  }

  // Aplicar los effects de las propiedades a la entidad base
  const resolvedEntity = applyPropertyEffectsToItem(
    baseEntity,
    resolvedProperties,
    evaluateFormula
  );

  return {
    entity: resolvedEntity as ResolvedInventoryEntity,
    resolvedProperties,
    warnings,
  };
}

/**
 * Resuelve un item por ID desde el compendium con todas sus propiedades.
 *
 * Conveniencia que combina la resolución del item base y sus propiedades
 * en una sola llamada.
 *
 * @example
 * ```ts
 * const result = resolveItemById('longsword-keen', 'weapon', {
 *   resolver: (type, id) => compendium.getEntity(type, id),
 * });
 *
 * if (result) {
 *   addItem(inventoryState, {
 *     itemId: 'longsword-keen',
 *     entityType: 'weapon',
 *     entity: result.entity,
 *   });
 * }
 * ```
 */
export function resolveItemById(
  itemId: string,
  entityType: string,
  options: ResolveItemOptions
): ResolveItemResult | null {
  const { resolver } = options;

  // Resolver la entidad base
  const baseEntity = resolver(entityType, itemId);

  if (!baseEntity) {
    return null;
  }

  // Resolver con propiedades
  return resolveItemForInventory(
    baseEntity as StandardEntity & Record<string, unknown>,
    options
  );
}

/**
 * Obtiene el tipo de entidad para las propiedades de un item.
 *
 * Convencion:
 * - weapon -> weaponProperty
 * - armor -> armorProperty
 * - shield -> shieldProperty
 * - etc.
 */
function getPropertyEntityType(itemEntityType: string): string {
  return `${itemEntityType}Property`;
}

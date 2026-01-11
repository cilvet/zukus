import type { CharacterBaseData } from '../../baseData/character';
import type { Equipment, Item } from '../../baseData/equipment';
import { success, withWarning, type OperationResult } from '../types';

/**
 * Añade un item al inventario del personaje.
 * 
 * @param character - Datos base del personaje
 * @param item - Item a añadir
 * @returns Resultado con el personaje actualizado
 */
export function addItem(
  character: CharacterBaseData,
  item: Item
): OperationResult {
  return success({
    ...character,
    equipment: {
      ...character.equipment,
      items: [...character.equipment.items, item],
    },
  });
}

/**
 * Elimina un item del inventario del personaje.
 * 
 * @param character - Datos base del personaje
 * @param itemId - ID único del item a eliminar
 * @returns Resultado con el personaje actualizado o warning si no se encuentra
 */
export function removeItem(
  character: CharacterBaseData,
  itemId: string
): OperationResult {
  const itemExists = character.equipment.items.some(
    (item) => item.uniqueId === itemId
  );

  if (!itemExists) {
    return withWarning(character, {
      type: 'not_found',
      message: 'Item not found',
      entityId: itemId,
    });
  }

  return success({
    ...character,
    equipment: {
      ...character.equipment,
      items: character.equipment.items.filter(
        (item) => item.uniqueId !== itemId
      ),
    },
  });
}

/**
 * Actualiza un item en el inventario del personaje.
 * 
 * @param character - Datos base del personaje
 * @param item - Item actualizado
 * @returns Resultado con el personaje actualizado o warning si no se encuentra
 */
export function updateItem(
  character: CharacterBaseData,
  item: Item
): OperationResult {
  const itemExists = character.equipment.items.some(
    (i) => i.uniqueId === item.uniqueId
  );

  if (!itemExists) {
    return withWarning(character, {
      type: 'not_found',
      message: 'Item not found',
      entityId: item.uniqueId,
    });
  }

  return success({
    ...character,
    equipment: {
      ...character.equipment,
      items: character.equipment.items.map((i) => {
        if (i.uniqueId === item.uniqueId) {
          return item;
        }
        return i;
      }),
    },
  });
}

/**
 * Toggle del estado equipado de un item.
 * 
 * @param character - Datos base del personaje
 * @param itemId - ID único del item
 * @returns Resultado con el personaje actualizado o warning si no se encuentra
 */
export function toggleItemEquipped(
  character: CharacterBaseData,
  itemId: string
): OperationResult {
  const itemExists = character.equipment.items.some(
    (item) => item.uniqueId === itemId
  );

  if (!itemExists) {
    return withWarning(character, {
      type: 'not_found',
      message: 'Item not found',
      entityId: itemId,
    });
  }

  return success({
    ...character,
    equipment: {
      ...character.equipment,
      items: character.equipment.items.map((item) => {
        if (item.uniqueId === itemId) {
          return { ...item, equipped: !item.equipped };
        }
        return item;
      }),
    },
  });
}

/**
 * Actualiza el equipo completo del personaje.
 * 
 * @param character - Datos base del personaje
 * @param equipment - Nuevo equipo
 * @returns Resultado con el personaje actualizado
 */
export function updateEquipment(
  character: CharacterBaseData,
  equipment: Equipment
): OperationResult {
  return success({
    ...character,
    equipment,
  });
}


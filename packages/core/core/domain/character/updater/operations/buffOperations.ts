import { Buff } from '../../baseData/buffs';
import type { CharacterBaseData } from '../../baseData/character';
import { success, withWarning, type OperationResult } from '../types';

/**
 * Valida si un buff tiene los campos requeridos.
 */
function isValidBuff(buff: Buff): boolean {
  return buff.name !== "" && buff.description !== "";
}

/**
 * Toggle del estado activo de un buff del personaje.
 * 
 * @param character - Datos base del personaje
 * @param buffId - ID del buff a togglear
 * @returns Resultado con el personaje actualizado o warning si no se encuentra
 */
export function toggleBuff(
  character: CharacterBaseData,
  buffId: string
): OperationResult {
  const buff = character.buffs.find((b) => b.uniqueId === buffId);
  
  if (!buff) {
    return withWarning(character, {
      type: 'not_found',
      message: 'Buff not found',
      entityId: buffId,
    });
  }

  const newBuffs = character.buffs.map((b) => {
    if (b.uniqueId === buffId) {
      return {
        ...b,
        active: !b.active,
      };
    }
    return b;
  });

  return success({
    ...character,
    buffs: newBuffs,
  });
}

/**
 * Añade un buff al personaje.
 * 
 * @param character - Datos base del personaje
 * @param buff - Buff a añadir
 * @returns Resultado con el personaje actualizado o warning si es inválido/duplicado
 */
export function addBuff(
  character: CharacterBaseData,
  buff: Buff
): OperationResult {
  if (!isValidBuff(buff)) {
    return withWarning(character, {
      type: 'invalid_data',
      message: 'Invalid buff',
      entityId: buff.uniqueId,
    });
  }

  const buffExists = character.buffs.some((b) => b.uniqueId === buff.uniqueId);
  if (buffExists) {
    return withWarning(character, {
      type: 'already_exists',
      message: 'Buff already exists',
      entityId: buff.uniqueId,
    });
  }

  return success({
    ...character,
    buffs: [...character.buffs, buff],
  });
}

/**
 * Edita un buff existente del personaje.
 * 
 * @param character - Datos base del personaje
 * @param buff - Buff actualizado
 * @returns Resultado con el personaje actualizado o warning si es inválido
 */
export function editBuff(
  character: CharacterBaseData,
  buff: Buff
): OperationResult {
  if (!isValidBuff(buff)) {
    return withWarning(character, {
      type: 'invalid_data',
      message: 'Invalid buff',
      entityId: buff.uniqueId,
    });
  }

  const newBuffs = character.buffs.map((b) => {
    if (b.uniqueId === buff.uniqueId) {
      return buff;
    }
    return b;
  });

  return success({
    ...character,
    buffs: newBuffs,
  });
}

/**
 * Elimina un buff del personaje.
 * 
 * @param character - Datos base del personaje
 * @param buffId - ID del buff a eliminar
 * @returns Resultado con el personaje actualizado o warning si no se encuentra
 */
export function deleteBuff(
  character: CharacterBaseData,
  buffId: string
): OperationResult {
  const buffExists = character.buffs.some((b) => b.uniqueId === buffId);
  
  if (!buffExists) {
    return withWarning(character, {
      type: 'not_found',
      message: 'Buff not found',
      entityId: buffId,
    });
  }

  return success({
    ...character,
    buffs: character.buffs.filter((b) => b.uniqueId !== buffId),
  });
}

/**
 * Toggle de un buff compartido (shared buff).
 * 
 * Si el buff está activo, lo desactiva.
 * Si no está activo, lo añade desde el pool de buffs compartidos.
 * 
 * @param character - Datos base del personaje
 * @param buffId - ID del buff compartido a togglear
 * @param sharedBuffs - Pool de buffs compartidos disponibles
 * @returns Resultado con el personaje actualizado o warning si no se encuentra
 */
export function toggleSharedBuff(
  character: CharacterBaseData,
  buffId: string,
  sharedBuffs: Buff[]
): OperationResult {
  const buff = sharedBuffs.find((b) => b.uniqueId === buffId);
  
  if (!buff) {
    return withWarning(character, {
      type: 'not_found',
      message: 'Shared buff not found',
      entityId: buffId,
    });
  }

  const activeSharedBuffIds = character.sharedBuffs.map((b) => b.uniqueId);
  const isBuffActive = activeSharedBuffIds.includes(buffId);

  const newSharedBuffIds = isBuffActive
    ? activeSharedBuffIds.filter((id) => id !== buffId)
    : [...activeSharedBuffIds, buffId];

  const newCharacterSharedBuffs = sharedBuffs
    .filter((b) => newSharedBuffIds.includes(b.uniqueId))
    .map((b) => ({ ...b, active: true }));

  return success({
    ...character,
    sharedBuffs: newCharacterSharedBuffs,
  });
}


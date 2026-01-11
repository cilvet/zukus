import type { CharacterBaseData } from '../../baseData/character';
import { success, type OperationResult } from '../types';

/**
 * Modifica los puntos de vida del personaje.
 * 
 * El personaje puede tener dos sistemas de tracking:
 * - customCurrentHp: HP actual directo (más simple)
 * - currentDamage: Daño recibido (restado del max HP)
 * 
 * @param character - Datos base del personaje
 * @param hpChange - Cantidad de HP a añadir (positivo) o quitar (negativo)
 * @param maxHp - HP máximo del personaje (desde el sheet calculado)
 * @returns Resultado con el personaje actualizado
 */
export function modifyHp(
  character: CharacterBaseData,
  hpChange: number,
  maxHp: number
): OperationResult {
  if (character.customCurrentHp !== undefined) {
    let newHp = character.customCurrentHp + hpChange;

    if (newHp > maxHp) {
      newHp = maxHp;
    }

    if (newHp < 0) {
      newHp = 0;
    }

    return success({
      ...character,
      customCurrentHp: newHp,
    });
  }

  const currentDamage = character.currentDamage;
  let newDamage = currentDamage - hpChange;

  if (newDamage > maxHp) {
    newDamage = maxHp;
  }

  if (newDamage < 0) {
    newDamage = 0;
  }

  return success({
    ...character,
    currentDamage: newDamage,
  });
}


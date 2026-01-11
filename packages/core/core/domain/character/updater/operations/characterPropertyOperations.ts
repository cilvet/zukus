import type { CharacterBaseData } from '../../baseData/character';
import { success, type OperationResult } from '../types';

/**
 * Establece el nombre del personaje.
 * 
 * @param character - Datos base del personaje
 * @param name - Nuevo nombre
 * @returns Resultado con el personaje actualizado
 */
export function setName(
  character: CharacterBaseData,
  name: string
): OperationResult {
  return success({
    ...character,
    name,
  });
}

/**
 * Establece el tema visual del personaje.
 * 
 * @param character - Datos base del personaje
 * @param theme - Nuevo tema
 * @returns Resultado con el personaje actualizado
 */
export function setTheme(
  character: CharacterBaseData,
  theme: string
): OperationResult {
  return success({
    ...character,
    theme,
  });
}


import type { CharacterBaseData, Alignment } from '../../baseData/character';
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

// =============================================================================
// Character Description Operations
// =============================================================================

/**
 * Establece la descripcion del personaje.
 */
export function setDescription(
  character: CharacterBaseData,
  description: string
): OperationResult {
  return success({
    ...character,
    description,
  });
}

/**
 * Establece el alineamiento del personaje.
 * Puede ser null para personajes sin alineamiento.
 */
export function setAlignment(
  character: CharacterBaseData,
  alignment: Alignment | null
): OperationResult {
  return success({
    ...character,
    alignment,
  });
}

// =============================================================================
// Physical Characteristics Operations
// =============================================================================

/**
 * Establece la edad del personaje.
 */
export function setAge(
  character: CharacterBaseData,
  age: string
): OperationResult {
  return success({
    ...character,
    age,
  });
}

/**
 * Establece el genero del personaje.
 */
export function setGender(
  character: CharacterBaseData,
  gender: string
): OperationResult {
  return success({
    ...character,
    gender,
  });
}

/**
 * Establece la altura del personaje.
 */
export function setHeight(
  character: CharacterBaseData,
  height: string
): OperationResult {
  return success({
    ...character,
    height,
  });
}

/**
 * Establece el peso del personaje.
 */
export function setWeight(
  character: CharacterBaseData,
  weight: string
): OperationResult {
  return success({
    ...character,
    weight,
  });
}

/**
 * Establece el color de ojos del personaje.
 */
export function setEyes(
  character: CharacterBaseData,
  eyes: string
): OperationResult {
  return success({
    ...character,
    eyes,
  });
}

/**
 * Establece el color de pelo del personaje.
 */
export function setHair(
  character: CharacterBaseData,
  hair: string
): OperationResult {
  return success({
    ...character,
    hair,
  });
}

/**
 * Establece el color de piel del personaje.
 */
export function setSkin(
  character: CharacterBaseData,
  skin: string
): OperationResult {
  return success({
    ...character,
    skin,
  });
}

// =============================================================================
// Background Operations
// =============================================================================

/**
 * Establece la deidad del personaje.
 */
export function setDeity(
  character: CharacterBaseData,
  deity: string
): OperationResult {
  return success({
    ...character,
    deity,
  });
}

/**
 * Establece el trasfondo/historia del personaje.
 */
export function setBackground(
  character: CharacterBaseData,
  background: string
): OperationResult {
  return success({
    ...character,
    background,
  });
}


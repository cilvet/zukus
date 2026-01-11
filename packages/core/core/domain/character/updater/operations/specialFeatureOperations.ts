import type { CharacterBaseData, SpecialFeature } from '../../baseData/character';
import { success, withWarning, type OperationResult } from '../types';

/**
 * Añade un rasgo especial al personaje.
 * 
 * @param character - Datos base del personaje
 * @param feature - Rasgo especial a añadir
 * @returns Resultado con el personaje actualizado o warning si ya existe
 */
export function addSpecialFeature(
  character: CharacterBaseData,
  feature: SpecialFeature
): OperationResult {
  const specialFeatures = character.specialFeatures || [];
  const featureExists = specialFeatures.some(
    (f) => f.uniqueId === feature.uniqueId
  );

  if (featureExists) {
    return withWarning(character, {
      type: 'already_exists',
      message: 'Special feature already exists',
      entityId: feature.uniqueId,
    });
  }

  return success({
    ...character,
    specialFeatures: [...specialFeatures, feature],
  });
}

/**
 * Actualiza un rasgo especial existente del personaje.
 * 
 * @param character - Datos base del personaje
 * @param featureId - ID del rasgo especial a actualizar
 * @param feature - Rasgo especial actualizado
 * @returns Resultado con el personaje actualizado o warning si no se encuentra
 */
export function updateSpecialFeature(
  character: CharacterBaseData,
  featureId: string,
  feature: SpecialFeature
): OperationResult {
  if (!character.specialFeatures) {
    return withWarning(character, {
      type: 'not_found',
      message: 'Character has no special features',
      entityId: featureId,
    });
  }

  const featureIndex = character.specialFeatures.findIndex(
    (f) => f.uniqueId === featureId
  );

  if (featureIndex === -1) {
    return withWarning(character, {
      type: 'not_found',
      message: 'Special feature not found',
      entityId: featureId,
    });
  }

  return success({
    ...character,
    specialFeatures: character.specialFeatures.map((f, idx) => {
      if (idx === featureIndex) {
        return feature;
      }
      return f;
    }),
  });
}

/**
 * Elimina un rasgo especial del personaje.
 * 
 * @param character - Datos base del personaje
 * @param featureId - ID del rasgo especial a eliminar
 * @returns Resultado con el personaje actualizado o warning si no se encuentra
 */
export function removeSpecialFeature(
  character: CharacterBaseData,
  featureId: string
): OperationResult {
  if (!character.specialFeatures) {
    return withWarning(character, {
      type: 'not_found',
      message: 'Character has no special features',
      entityId: featureId,
    });
  }

  const featureExists = character.specialFeatures.some(
    (f) => f.uniqueId === featureId
  );

  if (!featureExists) {
    return withWarning(character, {
      type: 'not_found',
      message: 'Special feature not found',
      entityId: featureId,
    });
  }

  return success({
    ...character,
    specialFeatures: character.specialFeatures.filter(
      (f) => f.uniqueId !== featureId
    ),
  });
}

/**
 * Establece los rasgos especiales del personaje (reemplazo completo).
 * 
 * @param character - Datos base del personaje
 * @param features - Nueva lista de rasgos especiales
 * @returns Resultado con el personaje actualizado
 */
export function setSpecialFeatures(
  character: CharacterBaseData,
  features: SpecialFeature[]
): OperationResult {
  return success({
    ...character,
    specialFeatures: features,
  });
}


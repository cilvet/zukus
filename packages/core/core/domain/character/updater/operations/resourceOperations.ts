import type { CharacterBaseData } from '../../baseData/character';
import type { CalculatedResource } from '../../baseData/resources';
import { success, withWarning, type OperationResult } from '../types';

/**
 * Consume una cantidad de un recurso del personaje.
 * 
 * @param character - Datos base del personaje
 * @param resourceId - ID del recurso a consumir
 * @param amount - Cantidad a consumir (por defecto: defaultChargesPerUse del recurso)
 * @param resourceData - Datos calculados del recurso (desde el sheet)
 * @returns Resultado con el personaje actualizado o warning si no se encuentra
 */
export function consumeResource(
  character: CharacterBaseData,
  resourceId: string,
  amount: number | undefined,
  resourceData: CalculatedResource
): OperationResult {
  if (!resourceData) {
    return withWarning(character, {
      type: 'not_found',
      message: 'Resource not found',
      entityId: resourceId,
    });
  }

  const consumeAmount = amount ?? resourceData.defaultChargesPerUse;
  const newValue = Math.max(
    resourceData.currentValue - consumeAmount,
    resourceData.minValue
  );

  return success({
    ...character,
    resourceCurrentValues: {
      ...character.resourceCurrentValues,
      [resourceId]: { currentValue: newValue },
    },
  });
}

/**
 * Recarga una cantidad de un recurso del personaje.
 * 
 * @param character - Datos base del personaje
 * @param resourceId - ID del recurso a recargar
 * @param amount - Cantidad a recargar (por defecto: rechargeAmount del recurso)
 * @param resourceData - Datos calculados del recurso (desde el sheet)
 * @returns Resultado con el personaje actualizado o warning si no se encuentra
 */
export function rechargeResource(
  character: CharacterBaseData,
  resourceId: string,
  amount: number | undefined,
  resourceData: CalculatedResource
): OperationResult {
  if (!resourceData) {
    return withWarning(character, {
      type: 'not_found',
      message: 'Resource not found',
      entityId: resourceId,
    });
  }

  const rechargeAmount = amount ?? resourceData.rechargeAmount;
  const newValue = Math.min(
    resourceData.currentValue + rechargeAmount,
    resourceData.maxValue
  );

  return success({
    ...character,
    resourceCurrentValues: {
      ...character.resourceCurrentValues,
      [resourceId]: { currentValue: newValue },
    },
  });
}

/**
 * Recarga todos los recursos del personaje al máximo.
 * 
 * @param character - Datos base del personaje
 * @param resourcesData - Datos calculados de todos los recursos (desde el sheet)
 * @returns Resultado con el personaje actualizado
 */
export function rechargeAllResources(
  character: CharacterBaseData,
  resourcesData: Record<string, CalculatedResource>
): OperationResult {
  const newResourceCurrentValues: {
    [resourceId: string]: { currentValue: number };
  } = {};

  Object.keys(resourcesData).forEach((resourceId) => {
    const calculatedResource = resourcesData[resourceId];
    newResourceCurrentValues[resourceId] = {
      currentValue: calculatedResource.maxValue,
    };
  });

  return success({
    ...character,
    resourceCurrentValues: {
      ...character.resourceCurrentValues,
      ...newResourceCurrentValues,
    },
  });
}


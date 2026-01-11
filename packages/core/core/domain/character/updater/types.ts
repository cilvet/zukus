import type { CharacterBaseData } from '../baseData/character';

/**
 * Resultado de una operación de actualización.
 * Patrón consistente con el levelsUpdater.
 */
export type OperationResult = {
  character: CharacterBaseData;
  warnings: OperationWarning[];
};

export type OperationWarning = {
  type: 'not_found' | 'already_exists' | 'invalid_data' | 'validation_error';
  message: string;
  entityId?: string;
};

/**
 * Helper para crear resultado exitoso.
 */
export function success(character: CharacterBaseData): OperationResult {
  return { character, warnings: [] };
}

/**
 * Helper para crear resultado con warning.
 */
export function withWarning(
  character: CharacterBaseData,
  warning: OperationWarning
): OperationResult {
  return { character, warnings: [warning] };
}


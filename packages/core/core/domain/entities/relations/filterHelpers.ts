/**
 * Helpers para Filtrado de Relaciones
 *
 * Genera condiciones de filtro usando el sistema existente (EntityPropertyCondition).
 * No crea nuevos tipos de filtro, solo facilita la generación de condiciones.
 */

import type { EntityPropertyCondition, FilterOperator } from '../../levels/filtering/types'
import type { RelationCompileConfig, CompiledRelationValue } from '../types/base'

// ============================================================================
// Generación de Condiciones de Filtro
// ============================================================================

/**
 * Genera una condición de filtro para buscar por clave exacta en un campo de relación.
 *
 * Usa el operador 'contains' del sistema existente.
 *
 * @param keysFieldPath - Ruta al campo de claves (ej: "classLevels.classLevelKeys")
 * @param key - Clave a buscar (ej: "wizard:1")
 * @returns Condición de filtro para el sistema existente
 *
 * @example
 * ```typescript
 * // Filtrar por "Wizard nivel 1"
 * const condition = createRelationKeyCondition(
 *   'classLevels.classLevelKeys',
 *   'wizard:1'
 * )
 * // Resultado: { field: 'classLevels.classLevelKeys', operator: 'contains', value: 'wizard:1' }
 * ```
 */
export function createRelationKeyCondition(
  keysFieldPath: string,
  key: string
): EntityPropertyCondition {
  return {
    field: keysFieldPath,
    operator: 'contains',
    value: key
  }
}

/**
 * Genera una clave de búsqueda para relaciones con formato {targetId}:{metadata.value}.
 *
 * @param targetId - ID de la entidad destino (ej: "wizard")
 * @param metadataValue - Valor de metadata (ej: 1 para nivel)
 * @returns Clave formateada (ej: "wizard:1")
 */
export function formatRelationKey(targetId: string, metadataValue: unknown): string {
  return `${targetId.toLowerCase()}:${metadataValue}`
}

/**
 * Genera una condición para filtrar por relación con un target específico
 * y opcionalmente un valor de metadata.
 *
 * @param keysFieldPath - Ruta al campo de claves
 * @param targetId - ID del target (ej: "wizard")
 * @param metadataValue - Valor de metadata opcional (ej: 1)
 * @returns Condición de filtro
 *
 * @example
 * ```typescript
 * // Filtrar por conjuros de Wizard nivel 1
 * const condition = createRelationCondition(
 *   'classLevels.classLevelKeys',
 *   'wizard',
 *   1
 * )
 * ```
 */
export function createRelationCondition(
  keysFieldPath: string,
  targetId: string,
  metadataValue?: unknown
): EntityPropertyCondition {
  const key = metadataValue !== undefined
    ? formatRelationKey(targetId, metadataValue)
    : targetId.toLowerCase()

  return createRelationKeyCondition(keysFieldPath, key)
}

// ============================================================================
// Helpers para UI
// ============================================================================

/**
 * Extrae todas las clases únicas de un array de entidades con campo de relación compilado.
 *
 * @param entities - Entidades con campo de relación
 * @param fieldPath - Ruta al campo compilado (ej: "classLevels")
 * @returns Array de IDs de clase únicos, ordenados alfabéticamente
 */
export function extractUniqueTargets<T>(
  entities: T[],
  fieldPath: string
): string[] {
  const targets = new Set<string>()

  for (const entity of entities) {
    const fieldValue = getNestedValue(entity, fieldPath) as CompiledRelationValue | undefined
    if (!fieldValue?.relations) continue

    for (const rel of fieldValue.relations) {
      targets.add(rel.targetId.toLowerCase())
    }
  }

  return Array.from(targets).sort()
}

/**
 * Extrae todos los valores únicos de un metadata field en las relaciones.
 *
 * @param entities - Entidades con campo de relación
 * @param fieldPath - Ruta al campo compilado
 * @param metadataField - Nombre del campo de metadata (ej: "level")
 * @returns Array de valores únicos, ordenados
 */
export function extractUniqueMetadataValues<T>(
  entities: T[],
  fieldPath: string,
  metadataField: string
): unknown[] {
  const values = new Set<unknown>()

  for (const entity of entities) {
    const fieldValue = getNestedValue(entity, fieldPath) as CompiledRelationValue | undefined
    if (!fieldValue?.relations) continue

    for (const rel of fieldValue.relations) {
      const value = rel.metadata[metadataField]
      if (value !== undefined) {
        values.add(value)
      }
    }
  }

  return Array.from(values).sort((a, b) => {
    if (typeof a === 'number' && typeof b === 'number') return a - b
    return String(a).localeCompare(String(b))
  })
}

/**
 * Extrae los valores de metadata disponibles para un target específico.
 *
 * @param entities - Entidades con campo de relación
 * @param fieldPath - Ruta al campo compilado
 * @param targetId - ID del target a filtrar
 * @param metadataField - Nombre del campo de metadata
 * @returns Array de valores únicos para ese target
 *
 * @example
 * ```typescript
 * // Obtener niveles disponibles para Wizard
 * const levels = extractMetadataValuesForTarget(spells, 'classLevels', 'wizard', 'level')
 * // → [1, 2, 3, 4, 5, 6, 7, 8, 9]
 * ```
 */
export function extractMetadataValuesForTarget<T>(
  entities: T[],
  fieldPath: string,
  targetId: string,
  metadataField: string
): unknown[] {
  const normalizedTargetId = targetId.toLowerCase()
  const values = new Set<unknown>()

  for (const entity of entities) {
    const fieldValue = getNestedValue(entity, fieldPath) as CompiledRelationValue | undefined
    if (!fieldValue?.relations) continue

    for (const rel of fieldValue.relations) {
      if (rel.targetId.toLowerCase() === normalizedTargetId) {
        const value = rel.metadata[metadataField]
        if (value !== undefined) {
          values.add(value)
        }
      }
    }
  }

  return Array.from(values).sort((a, b) => {
    if (typeof a === 'number' && typeof b === 'number') return a - b
    return String(a).localeCompare(String(b))
  })
}

/**
 * Cuenta entidades por combinación target + metadata.
 *
 * @param entities - Entidades con campo de relación
 * @param keysFieldPath - Ruta al campo de claves (ej: "classLevels.classLevelKeys")
 * @returns Map de clave → cantidad
 *
 * @example
 * ```typescript
 * const counts = countByRelationKey(spells, 'classLevels.classLevelKeys')
 * // → Map { "wizard:1" => 15, "wizard:2" => 12, "sorcerer:1" => 15, ... }
 * ```
 */
export function countByRelationKey<T>(
  entities: T[],
  keysFieldPath: string
): Map<string, number> {
  const counts = new Map<string, number>()

  for (const entity of entities) {
    const keys = getNestedValue(entity, keysFieldPath) as string[] | undefined
    if (!keys) continue

    for (const key of keys) {
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
  }

  return counts
}

// ============================================================================
// Utilidades Internas
// ============================================================================

/**
 * Obtiene un valor anidado usando dot notation.
 */
function getNestedValue(obj: unknown, path: string): unknown {
  const parts = path.split('.')
  let current: unknown = obj

  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined
    }
    current = (current as Record<string, unknown>)[part]
  }

  return current
}

/**
 * Compilador de Relaciones
 *
 * Convierte relaciones en estructuras directamente filtrables
 * usando el sistema de filtrado existente (operador 'contains').
 */

import type {
  RelationFieldConfig,
  RelationCompileConfig,
  RelationValue,
  CompiledRelationValue
} from '../types/base'
import type { Entity } from '../types/base'

// ============================================================================
// Tipos Internos
// ============================================================================

/**
 * Entidad de relación como viene del compendium.
 * Conecta dos entidades con metadatos.
 */
export type RelationEntity = {
  id: string
  entityType: string // El tipo de relación (ej: "spell-class-relation")
  fromEntityId: string
  toEntityId: string
  metadata: Record<string, unknown>
}

/**
 * Índice de relaciones para búsqueda O(1).
 */
export type RelationIndex = {
  /** relationType -> fromEntityId -> RelationEntity[] */
  byFrom: Map<string, Map<string, RelationEntity[]>>
  /** relationType -> toEntityId -> RelationEntity[] */
  byTo: Map<string, Map<string, RelationEntity[]>>
}

// ============================================================================
// Construcción de Índices
// ============================================================================

/**
 * Construye índices para búsqueda eficiente de relaciones.
 * Complejidad: O(n) donde n = número de relaciones
 */
export function buildRelationIndex(relations: RelationEntity[]): RelationIndex {
  const byFrom = new Map<string, Map<string, RelationEntity[]>>()
  const byTo = new Map<string, Map<string, RelationEntity[]>>()

  for (const relation of relations) {
    const relationType = relation.entityType

    // Índice por origen
    if (!byFrom.has(relationType)) {
      byFrom.set(relationType, new Map())
    }
    const fromMap = byFrom.get(relationType)!
    if (!fromMap.has(relation.fromEntityId)) {
      fromMap.set(relation.fromEntityId, [])
    }
    fromMap.get(relation.fromEntityId)!.push(relation)

    // Índice por destino
    if (!byTo.has(relationType)) {
      byTo.set(relationType, new Map())
    }
    const toMap = byTo.get(relationType)!
    if (!toMap.has(relation.toEntityId)) {
      toMap.set(relation.toEntityId, [])
    }
    toMap.get(relation.toEntityId)!.push(relation)
  }

  return { byFrom, byTo }
}

/**
 * Obtiene relaciones de una entidad origen.
 * Complejidad: O(1) lookup
 */
export function getRelationsFrom(
  index: RelationIndex,
  relationType: string,
  fromEntityId: string
): RelationEntity[] {
  return index.byFrom.get(relationType)?.get(fromEntityId) ?? []
}

/**
 * Obtiene relaciones hacia una entidad destino.
 */
export function getRelationsTo(
  index: RelationIndex,
  relationType: string,
  toEntityId: string
): RelationEntity[] {
  return index.byTo.get(relationType)?.get(toEntityId) ?? []
}

// ============================================================================
// Compilación de Claves Filtrables
// ============================================================================

/**
 * Genera una clave filtrable usando el formato configurado.
 *
 * @param relation - La relación a procesar
 * @param keyFormat - Formato con placeholders: {targetId}, {metadata.fieldName}
 * @returns La clave generada (ej: "wizard:1")
 */
export function generateFilterableKey(
  relation: RelationEntity,
  keyFormat: string
): string {
  let key = keyFormat

  // Reemplazar {targetId}
  key = key.replace('{targetId}', relation.toEntityId.toLowerCase())

  // Reemplazar {metadata.fieldName}
  const metadataMatches = key.matchAll(/\{metadata\.(\w+)\}/g)
  for (const match of metadataMatches) {
    const fieldName = match[1]
    const value = relation.metadata[fieldName]
    key = key.replace(match[0], String(value ?? ''))
  }

  return key
}

/**
 * Parsea una clave filtrable a sus componentes.
 * Asume formato "id:value" (el más común para spell-class).
 */
export function parseFilterableKey(key: string): { id: string; value: string } | null {
  const colonIndex = key.indexOf(':')
  if (colonIndex === -1) return null

  const id = key.substring(0, colonIndex)
  if (!id) return null

  return {
    id,
    value: key.substring(colonIndex + 1)
  }
}

// ============================================================================
// Compilación de Campo de Relación
// ============================================================================

/**
 * Compila las relaciones de una entidad según la configuración del campo.
 *
 * @param entityId - ID de la entidad que tiene el campo de relación
 * @param fieldConfig - Configuración del campo de relación
 * @param index - Índice de relaciones
 * @returns Valor compilado con datos filtrables
 */
export function compileRelationField(
  entityId: string,
  fieldConfig: RelationFieldConfig,
  index: RelationIndex
): CompiledRelationValue {
  // Obtener las relaciones para esta entidad
  // El relationType en el índice es el entityType de la relación
  const relationEntityType = fieldConfig.relationType
  const relations = getRelationsFrom(index, relationEntityType, entityId)

  // Convertir a RelationValue[]
  const relationValues: RelationValue[] = relations.map((rel) => ({
    targetId: rel.toEntityId,
    metadata: rel.metadata
  }))

  const result: CompiledRelationValue = {
    relations: relationValues
  }

  // Si hay configuración de compilación, generar campos filtrables
  const compile = fieldConfig.compile
  if (compile) {
    // Generar array de claves filtrables
    const keys: string[] = relations.map((rel) =>
      generateFilterableKey(rel, compile.keyFormat)
    )
    result[compile.keysFieldName] = keys

    // Generar mapa de acceso directo si está configurado
    if (compile.mapFieldName && compile.mapValueField) {
      const map: Record<string, unknown> = {}
      for (const rel of relations) {
        const targetId = rel.toEntityId.toLowerCase()
        map[targetId] = rel.metadata[compile.mapValueField]
      }
      result[compile.mapFieldName] = map
    }
  }

  return result
}

// ============================================================================
// Enriquecimiento de Entidades
// ============================================================================

/**
 * Tipo para definición de campo de relación en un schema.
 */
export type RelationFieldDef = {
  fieldName: string
  config: RelationFieldConfig
}

/**
 * Enriquece una entidad con sus campos de relación compilados.
 *
 * @param entity - Entidad a enriquecer
 * @param relationFields - Campos de relación a compilar
 * @param index - Índice de relaciones
 * @returns Entidad con campos de relación poblados
 */
export function enrichEntityWithRelations<T extends Entity>(
  entity: T,
  relationFields: RelationFieldDef[],
  index: RelationIndex
): T {
  const enriched = { ...entity }

  for (const { fieldName, config } of relationFields) {
    const compiled = compileRelationField(entity.id, config, index)
    ;(enriched as Record<string, unknown>)[fieldName] = compiled
  }

  return enriched
}

/**
 * Enriquece múltiples entidades con sus campos de relación.
 */
export function enrichEntitiesWithRelations<T extends Entity>(
  entities: T[],
  relationFields: RelationFieldDef[],
  index: RelationIndex
): T[] {
  return entities.map((entity) => enrichEntityWithRelations(entity, relationFields, index))
}

// ============================================================================
// Pipeline Completo
// ============================================================================

/**
 * Pipeline completo: construye índice y enriquece entidades.
 */
export function compileAndEnrichEntities<T extends Entity>(
  entities: T[],
  relations: RelationEntity[],
  relationFields: RelationFieldDef[]
): T[] {
  const index = buildRelationIndex(relations)
  return enrichEntitiesWithRelations(entities, relationFields, index)
}

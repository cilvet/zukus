import { useState, useEffect, useMemo } from 'react'
import { entityTypesApi, entitiesApi, type EntityInstance } from '@/lib/api'
import type { EntitySchemaDefinition } from '@root/core/domain/entities/types/schema'
import type { EntityOption } from '@/components/shared'

const PAGE_SIZE = 50

export function useEntityManagement() {
  const [schemas, setSchemas] = useState<EntitySchemaDefinition[]>([])
  const [instances, setInstances] = useState<Record<string, EntityInstance[]>>({})
  const [selectedSchemaType, setSelectedSchemaType] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const loadData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const loadedSchemas = await entityTypesApi.getAll()
      setSchemas(loadedSchemas)
      
      const instancesMap: Record<string, EntityInstance[]> = {}
      for (const schema of loadedSchemas) {
        try {
          instancesMap[schema.typeName] = await entitiesApi.getAll(schema.typeName)
        } catch {
          instancesMap[schema.typeName] = []
        }
      }
      setInstances(instancesMap)
      
      if (!selectedSchemaType && loadedSchemas.length > 0) {
        setSelectedSchemaType(loadedSchemas[0].typeName)
      }
    } catch (e) {
      console.error('Error en loadData:', e)
      const errorMessage = e instanceof Error ? e.message : 'Error desconocido'
      setError(`No se pudo conectar al servidor. Asegúrate de que el servidor está corriendo (bun run server).\n\nDetalle: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const selectedSchema = useMemo(() => {
    return schemas.find((s) => s.typeName === selectedSchemaType) ?? null
  }, [schemas, selectedSchemaType])

  const selectedInstances = useMemo(() => {
    if (!selectedSchemaType) {
      return []
    }
    return instances[selectedSchemaType] ?? []
  }, [instances, selectedSchemaType])

  const filteredInstances = useMemo(() => {
    const query = searchQuery.toLowerCase()
    return selectedInstances.filter((inst) =>
      inst.name.toLowerCase().includes(query) ||
      inst.id.toLowerCase().includes(query)
    )
  }, [selectedInstances, searchQuery])

  const availableEntities: EntityOption[] = useMemo(() => {
    const entities: EntityOption[] = []
    for (const [type, insts] of Object.entries(instances)) {
      for (const inst of insts) {
        entities.push({
          id: inst.id,
          name: inst.name,
          entityType: type,
          description: inst.description as string | undefined,
        })
      }
    }
    return entities
  }, [instances])

  return {
    schemas,
    instances,
    selectedSchemaType,
    selectedSchema,
    selectedInstances,
    filteredInstances,
    availableEntities,
    searchQuery,
    loading,
    error,
    saving,
    PAGE_SIZE,
    setSelectedSchemaType,
    setSearchQuery,
    setSchemas,
    setInstances,
    setSaving,
    loadData,
  }
}


import { useState, useEffect } from 'react'
import { entityTypesApi, entitiesApi, type EntityInstance } from '@/lib/api'
import type { EntitySchemaDefinition } from '@root/core/domain/entities/types/schema'
import type { Entity } from '@root/core/domain/entities/types/base'
import {
  LoadingScreen,
  ErrorScreen,
  EntitySidebar,
  SchemaEditorView,
  InstancesView,
  EmptyState,
  InstanceEditorModal,
} from '@/components/entity-management'
import { useEntityManagement } from '@/hooks/useEntityManagement'
import { usePagination } from '@/hooks/usePagination'

type View = 'instances' | 'edit-schema' | 'new-schema'

export function EntityManagementPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [view, setView] = useState<View>('instances')
  const [schemaToEdit, setSchemaToEdit] = useState<EntitySchemaDefinition | undefined>()
  const [instanceModalOpen, setInstanceModalOpen] = useState(false)
  const [instanceToEdit, setInstanceToEdit] = useState<EntityInstance | undefined>()

  const {
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
  } = useEntityManagement()

  const {
    currentPage,
    totalPages,
    setCurrentPage,
    paginatedItems,
  } = usePagination({
    totalItems: filteredInstances.length,
    pageSize: PAGE_SIZE,
    resetDependencies: [searchQuery, selectedSchemaType],
  })

  const paginatedInstances = filteredInstances.slice(
    paginatedItems.startIndex,
    paginatedItems.endIndex
  )

  // =============================================================================
  // Handlers - Schemas
  // =============================================================================

  const handleNewSchema = () => {
    setSchemaToEdit(undefined)
    setView('new-schema')
  }

  const handleEditSchema = (schema: EntitySchemaDefinition) => {
    setSchemaToEdit(schema)
    setView('edit-schema')
  }

  const handleSaveSchema = async (schema: EntitySchemaDefinition) => {
    setSaving(true)
    try {
      if (schemaToEdit) {
        await handleUpdateSchema(schema)
      } else {
        await handleCreateSchema(schema)
      }
      setView('instances')
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Error desconocido'
      alert(`Error al guardar: ${errorMessage}`)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateSchema = async (schema: EntitySchemaDefinition) => {
    if (!schemaToEdit) return

    await entityTypesApi.update(schemaToEdit.typeName, schema)
    setSchemas((prev) =>
      prev.map((s) => (s.typeName === schemaToEdit.typeName ? schema : s))
    )

    if (schemaToEdit.typeName !== schema.typeName) {
      setInstances((prev) => {
        const updated = { ...prev }
        updated[schema.typeName] = (updated[schemaToEdit.typeName] ?? []).map((i) => ({
          ...i,
          entityType: schema.typeName,
        }))
        delete updated[schemaToEdit.typeName]
        return updated
      })

      if (selectedSchemaType === schemaToEdit.typeName) {
        setSelectedSchemaType(schema.typeName)
      }
    }
  }

  const handleCreateSchema = async (schema: EntitySchemaDefinition) => {
    await entityTypesApi.create(schema)
    setSchemas((prev) => [...prev, schema])
    setInstances((prev) => ({ ...prev, [schema.typeName]: [] }))
    setSelectedSchemaType(schema.typeName)
  }

  const handleCancelSchemaEdit = () => {
    setSchemaToEdit(undefined)
    setView('instances')
  }

  const handleDeleteSchema = async (typeName: string) => {
    if (!confirm(`¿Estás seguro de eliminar el tipo "${typeName}" y todas sus instancias?`)) {
      return
    }
    
    try {
      await entityTypesApi.delete(typeName)
      setSchemas((prev) => prev.filter((s) => s.typeName !== typeName))
      setInstances((prev) => {
        const updated = { ...prev }
        delete updated[typeName]
        return updated
      })

      if (selectedSchemaType === typeName) {
        const remaining = schemas.filter((s) => s.typeName !== typeName)
        setSelectedSchemaType(remaining.length > 0 ? remaining[0].typeName : null)
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Error desconocido'
      alert(`Error al eliminar: ${errorMessage}`)
    }
  }

  const handleSelectSchema = (typeName: string) => {
    setSelectedSchemaType(typeName)
    setView('instances')
  }

  // =============================================================================
  // Handlers - Instances
  // =============================================================================

  const handleNewInstance = () => {
    setInstanceToEdit(undefined)
    setInstanceModalOpen(true)
  }

  const handleEditInstance = (instance: EntityInstance) => {
    setInstanceToEdit(instance)
    setInstanceModalOpen(true)
  }

  const handleSaveInstance = async (instance: Entity & Record<string, unknown>) => {
    if (!selectedSchemaType) return

    const entityInstance = instance as EntityInstance
    setSaving(true)

    try {
      if (instanceToEdit) {
        await handleUpdateInstance(entityInstance)
      } else {
        await handleCreateInstance(entityInstance)
      }
      setInstanceModalOpen(false)
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Error desconocido'
      alert(`Error al guardar: ${errorMessage}`)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateInstance = async (instance: EntityInstance) => {
    if (!selectedSchemaType || !instanceToEdit) return

    await entitiesApi.update(selectedSchemaType, instanceToEdit.id, instance)
    setInstances((prev) => ({
      ...prev,
      [selectedSchemaType]: (prev[selectedSchemaType] ?? []).map((i) =>
        i.id === instanceToEdit.id ? instance : i
      ),
    }))
  }

  const handleCreateInstance = async (instance: EntityInstance) => {
    if (!selectedSchemaType) return

    await entitiesApi.create(selectedSchemaType, instance)
    setInstances((prev) => ({
      ...prev,
      [selectedSchemaType]: [...(prev[selectedSchemaType] ?? []), instance],
    }))
  }

  const handleDeleteInstance = async (instanceId: string) => {
    if (!selectedSchemaType) return
    
    if (!confirm(`¿Estás seguro de eliminar la instancia "${instanceId}"?`)) {
      return
    }
    
    try {
      await entitiesApi.delete(selectedSchemaType, instanceId)
      setInstances((prev) => ({
        ...prev,
        [selectedSchemaType]: (prev[selectedSchemaType] ?? []).filter((i) => i.id !== instanceId),
      }))
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Error desconocido'
      alert(`Error al eliminar: ${errorMessage}`)
    }
  }

  const handleDuplicateInstance = async (instance: EntityInstance) => {
    if (!selectedSchemaType) return
    
    const duplicate: EntityInstance = {
      ...instance,
      id: `${instance.id}-copy-${Date.now()}`,
      name: `${instance.name} (copia)`,
    }
    
    try {
      await entitiesApi.create(selectedSchemaType, duplicate)
      setInstances((prev) => ({
        ...prev,
        [selectedSchemaType]: [...(prev[selectedSchemaType] ?? []), duplicate],
      }))
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Error desconocido'
      alert(`Error al duplicar: ${errorMessage}`)
    }
  }

  // =============================================================================
  // Render
  // =============================================================================

  if (loading) {
    return <LoadingScreen message="Conectando con el servidor..." />
  }

  if (error) {
    return <ErrorScreen error={error} onRetry={loadData} />
  }

  const isSchemaEditorView = view === 'new-schema' || view === 'edit-schema'
  const isInstancesView = view === 'instances' && selectedSchema !== null
  const isEmptyState = view === 'instances' && selectedSchema === null

  return (
    <div className="min-h-screen bg-background flex">
      <EntitySidebar
        schemas={schemas}
        instances={instances}
        selectedSchemaType={selectedSchemaType}
        view={view}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onSelectSchema={handleSelectSchema}
        onNewSchema={handleNewSchema}
        onEditSchema={handleEditSchema}
        onDeleteSchema={handleDeleteSchema}
      />

      <main className="flex-1 overflow-hidden">
        {isSchemaEditorView && (
          <SchemaEditorView
            schemaToEdit={schemaToEdit}
            view={view}
            allSchemas={schemas}
            onSave={handleSaveSchema}
            onCancel={handleCancelSchemaEdit}
          />
        )}

        {isInstancesView && selectedSchema && (
          <InstancesView
            schema={selectedSchema}
            instances={selectedInstances}
            filteredInstances={filteredInstances}
            paginatedInstances={paginatedInstances}
            searchQuery={searchQuery}
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={PAGE_SIZE}
            onSearchChange={setSearchQuery}
            onNewInstance={handleNewInstance}
            onEditInstance={handleEditInstance}
            onDeleteInstance={handleDeleteInstance}
            onDuplicateInstance={handleDuplicateInstance}
            onPageChange={setCurrentPage}
          />
        )}

        {isEmptyState && (
          <EmptyState onNewSchema={handleNewSchema} />
        )}
      </main>

      <InstanceEditorModal
        isOpen={instanceModalOpen}
        onOpenChange={setInstanceModalOpen}
        schema={selectedSchema}
        instanceToEdit={instanceToEdit}
        selectedSchemaType={selectedSchemaType}
        availableEntities={availableEntities}
        onSave={handleSaveInstance}
      />
    </div>
  )
}

export default EntityManagementPage

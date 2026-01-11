import { ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { EntityTypeEditor } from '@/components/entity-editor'
import type { EntitySchemaDefinition } from '@root/core/domain/entities/types/schema'

type SchemaEditorViewProps = {
  schemaToEdit?: EntitySchemaDefinition
  view: 'edit-schema' | 'new-schema'
  allSchemas: EntitySchemaDefinition[]
  onSave: (schema: EntitySchemaDefinition) => Promise<void>
  onCancel: () => void
}

export function SchemaEditorView({
  schemaToEdit,
  view,
  allSchemas,
  onSave,
  onCancel,
}: SchemaEditorViewProps) {
  const isEditing = view === 'edit-schema'
  const typeName = schemaToEdit?.typeName ?? 'nuevo'
  const title = isEditing ? schemaToEdit?.typeName ?? '' : 'Nuevo tipo de entidad'
  const subtitle = isEditing ? 'Editar tipo' : 'Nuevo tipo'
  const availableEntityTypes = allSchemas
    .filter(s => s.typeName !== schemaToEdit?.typeName)
    .map(s => s.typeName)

  return (
    <div className="h-full flex flex-col">
      <header className="p-4 md:p-6 border-b border-border">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="font-mono">
                {typeName}
              </Badge>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{subtitle}</span>
            </div>
            <h2 className="text-2xl font-bold">{title}</h2>
            {schemaToEdit?.description && (
              <p className="text-muted-foreground mt-1">{schemaToEdit.description}</p>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <EntityTypeEditor
          initialSchema={schemaToEdit}
          onSave={onSave}
          onCancel={onCancel}
          isModal={false}
          availableEntityTypes={availableEntityTypes}
        />
      </div>
    </div>
  )
}


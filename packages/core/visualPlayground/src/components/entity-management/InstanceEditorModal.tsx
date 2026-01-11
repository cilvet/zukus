import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { EntityInstanceEditor } from '@/components/entity-editor'
import type { EntitySchemaDefinition } from '@root/core/domain/entities/types/schema'
import type { Entity } from '@root/core/domain/entities/types/base'
import type { EntityInstance } from '@/lib/api'
import type { EntityOption } from '@/components/shared'

type InstanceEditorModalProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  schema: EntitySchemaDefinition | null
  instanceToEdit?: EntityInstance
  selectedSchemaType: string | null
  availableEntities: EntityOption[]
  onSave: (instance: Entity & Record<string, unknown>) => Promise<void>
}

export function InstanceEditorModal({
  isOpen,
  onOpenChange,
  schema,
  instanceToEdit,
  selectedSchemaType,
  availableEntities,
  onSave,
}: InstanceEditorModalProps) {
  if (!schema) {
    return null
  }

  let title: string
  if (instanceToEdit) {
    title = `Editar ${instanceToEdit.name}`
  } else {
    const schemaType = selectedSchemaType ?? 'instancia'
    title = `Nueva ${schemaType}`
  }
  
  let description: string
  if (schema.description) {
    description = schema.description
  } else {
    const schemaType = selectedSchemaType ?? 'entidad'
    description = `Crea o edita una instancia de ${schemaType}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <EntityInstanceEditor
          schema={schema}
          initialEntity={instanceToEdit}
          onSave={onSave}
          onCancel={() => onOpenChange(false)}
          isModal
          availableEntities={availableEntities}
        />
      </DialogContent>
    </Dialog>
  )
}


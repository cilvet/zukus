import { FileJson, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { EntitySchemaDefinition } from '@root/core/domain/entities/types/schema'

type SchemaCardProps = {
  schema: EntitySchemaDefinition
  instanceCount: number
  isSelected: boolean
  onSelect: () => void
  onEdit: () => void
  onDelete: () => void
}

export function SchemaCard({ 
  schema, 
  instanceCount, 
  isSelected, 
  onSelect, 
  onEdit, 
  onDelete 
}: SchemaCardProps) {
  const baseClasses = 'p-3 rounded-lg border cursor-pointer transition-all'
  const selectedClasses = 'border-primary bg-primary/10'
  const unselectedClasses = 'border-border hover:border-primary/50'
  const cardClasses = `${baseClasses} ${isSelected ? selectedClasses : unselectedClasses}`

  return (
    <div className={cardClasses} onClick={onSelect}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <FileJson className="h-4 w-4 text-primary shrink-0" />
            <span className="font-medium truncate">{schema.typeName}</span>
          </div>
          {schema.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {schema.description}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="text-xs">
              {schema.fields.length} campos
            </Badge>
            <Badge variant="outline" className="text-xs">
              {instanceCount} instancias
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-1 ml-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}


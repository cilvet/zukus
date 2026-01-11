import { Edit, Trash2, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { EntityInstance } from '@/lib/api'

type InstanceRowProps = {
  instance: EntityInstance
  onEdit: () => void
  onDelete: () => void
  onDuplicate: () => void
}

export function InstanceRow({ instance, onEdit, onDelete, onDuplicate }: InstanceRowProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/30 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium">{instance.name}</span>
          <Badge variant="outline" className="text-xs font-mono">
            {instance.id}
          </Badge>
        </div>
        {instance.description && (
          <p className="text-sm text-muted-foreground truncate mt-0.5">
            {instance.description as string}
          </p>
        )}
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDuplicate}>
          <Copy className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}


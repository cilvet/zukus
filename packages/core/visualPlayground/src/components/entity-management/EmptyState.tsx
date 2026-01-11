import { Plus, FileJson } from 'lucide-react'
import { Button } from '@/components/ui/button'

type EmptyStateProps = {
  onNewSchema: () => void
}

export function EmptyState({ onNewSchema }: EmptyStateProps) {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <FileJson className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
        <h2 className="text-xl font-semibold text-muted-foreground mb-2">
          Selecciona un tipo de entidad
        </h2>
        <p className="text-muted-foreground mb-4">
          O crea uno nuevo para empezar
        </p>
        <Button onClick={onNewSchema}>
          <Plus className="h-4 w-4 mr-1" />
          Nuevo tipo de entidad
        </Button>
      </div>
    </div>
  )
}


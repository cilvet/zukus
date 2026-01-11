import { Link } from 'react-router-dom'
import { ArrowLeft, Plus, X, Database, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SchemaCard } from './SchemaCard'
import type { EntitySchemaDefinition } from '@root/core/domain/entities/types/schema'
import type { EntityInstance } from '@/lib/api'

type EntitySidebarProps = {
  schemas: EntitySchemaDefinition[]
  instances: Record<string, EntityInstance[]>
  selectedSchemaType: string | null
  view: 'instances' | 'edit-schema' | 'new-schema'
  isOpen: boolean
  onToggle: () => void
  onSelectSchema: (typeName: string) => void
  onNewSchema: () => void
  onEditSchema: (schema: EntitySchemaDefinition) => void
  onDeleteSchema: (typeName: string) => void
}

export function EntitySidebar({
  schemas,
  instances,
  selectedSchemaType,
  view,
  isOpen,
  onToggle,
  onSelectSchema,
  onNewSchema,
  onEditSchema,
  onDeleteSchema,
}: EntitySidebarProps) {
  const baseClasses = 'fixed inset-y-0 left-0 z-40 w-80 bg-card border-r border-border transform transition-transform duration-200 md:relative md:translate-x-0'
  const openClasses = 'translate-x-0'
  const closedClasses = '-translate-x-full'
  const sidebarClasses = isOpen 
    ? `${baseClasses} ${openClasses}`
    : `${baseClasses} ${closedClasses}`

  const handleSchemaSelect = (typeName: string) => {
    onSelectSchema(typeName)
    onToggle()
  }

  return (
    <>
      <aside className={sidebarClasses}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <Link 
                to="/" 
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm">Volver</span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={onToggle}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <h1 className="text-xl font-bold text-primary flex items-center gap-2">
              <Database className="h-5 w-5" />
              Entity Manager
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gestiona tipos de entidades y sus instancias
            </p>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Tipos de Entidad
                </h2>
                <Button variant="outline" size="sm" onClick={onNewSchema}>
                  <Plus className="h-3 w-3 mr-1" />
                  Nuevo
                </Button>
              </div>
            </div>
            <ScrollArea className="flex-1 p-4">
              {schemas.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No hay tipos de entidad definidos.
                  <br />
                  <Button variant="link" className="p-0 h-auto" onClick={onNewSchema}>
                    Crea uno nuevo
                  </Button>
                </p>
              )}
              {schemas.length > 0 && (
                <div className="space-y-2">
                  {schemas.map((schema) => {
                    const isSelected = selectedSchemaType === schema.typeName && view === 'instances'
                    return (
                      <SchemaCard
                        key={schema.typeName}
                        schema={schema}
                        instanceCount={instances[schema.typeName]?.length ?? 0}
                        isSelected={isSelected}
                        onSelect={() => handleSchemaSelect(schema.typeName)}
                        onEdit={() => onEditSchema(schema)}
                        onDelete={() => onDeleteSchema(schema.typeName)}
                      />
                    )
                  })}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </aside>

      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 left-4 z-50 md:hidden shadow-lg"
        onClick={onToggle}
      >
        {isOpen && <X className="h-5 w-5" />}
        {!isOpen && <Menu className="h-5 w-5" />}
      </Button>
    </>
  )
}


import { Plus, Search, Database } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChevronRight } from 'lucide-react'
import { InstanceRow } from './InstanceRow'
import { PaginationControls } from './PaginationControls'
import type { EntitySchemaDefinition } from '@root/core/domain/entities/types/schema'
import type { EntityInstance } from '@/lib/api'

type InstancesViewProps = {
  schema: EntitySchemaDefinition
  instances: EntityInstance[]
  filteredInstances: EntityInstance[]
  paginatedInstances: EntityInstance[]
  searchQuery: string
  currentPage: number
  totalPages: number
  pageSize: number
  onSearchChange: (query: string) => void
  onNewInstance: () => void
  onEditInstance: (instance: EntityInstance) => void
  onDeleteInstance: (instanceId: string) => void
  onDuplicateInstance: (instance: EntityInstance) => void
  onPageChange: (page: number) => void
}

function EmptyInstancesState({ 
  schemaTypeName, 
  onNewInstance 
}: { 
  schemaTypeName: string
  onNewInstance: () => void 
}) {
  return (
    <div className="text-center py-12">
      <Database className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
      <p className="text-muted-foreground mb-4">
        No hay instancias de <code className="font-mono">{schemaTypeName}</code>
      </p>
      <Button onClick={onNewInstance}>
        <Plus className="h-4 w-4 mr-1" />
        Crear primera instancia
      </Button>
    </div>
  )
}

function NoSearchResults({ searchQuery }: { searchQuery: string }) {
  return (
    <div className="text-center py-12">
      <p className="text-muted-foreground">
        No se encontraron resultados para "{searchQuery}"
      </p>
    </div>
  )
}

export function InstancesView({
  schema,
  instances,
  filteredInstances,
  paginatedInstances,
  searchQuery,
  currentPage,
  totalPages,
  pageSize,
  onSearchChange,
  onNewInstance,
  onEditInstance,
  onDeleteInstance,
  onDuplicateInstance,
  onPageChange,
}: InstancesViewProps) {
  const hasInstances = instances.length > 0
  const hasSearchResults = filteredInstances.length > 0
  const startIndex = (currentPage - 1) * pageSize + 1
  const endIndex = Math.min(currentPage * pageSize, filteredInstances.length)

  return (
    <div className="h-full flex flex-col">
      <header className="p-4 md:p-6 border-b border-border">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="font-mono">
                {schema.typeName}
              </Badge>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Instancias</span>
            </div>
            <h2 className="text-2xl font-bold">{schema.typeName}</h2>
            {schema.description && (
              <p className="text-muted-foreground mt-1">{schema.description}</p>
            )}
          </div>
          <Button onClick={onNewInstance}>
            <Plus className="h-4 w-4 mr-1" />
            Nueva instancia
          </Button>
        </div>

        {hasInstances && (
          <div className="mt-4 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o ID..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        )}
      </header>

      <ScrollArea className="flex-1 p-4 md:p-6">
        {!hasSearchResults && (
          <div className="text-center py-12">
            {!hasInstances && (
              <EmptyInstancesState 
                schemaTypeName={schema.typeName} 
                onNewInstance={onNewInstance} 
              />
            )}
            {hasInstances && <NoSearchResults searchQuery={searchQuery} />}
          </div>
        )}

        {hasSearchResults && (
          <div className="space-y-4 max-w-4xl">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Mostrando {startIndex}-{endIndex} de {filteredInstances.length} resultados
              </span>
              {totalPages > 1 && (
                <span>Página {currentPage} de {totalPages}</span>
              )}
            </div>

            <div className="space-y-2">
              {paginatedInstances.map((instance) => (
                <InstanceRow
                  key={instance.id}
                  instance={instance}
                  onEdit={() => onEditInstance(instance)}
                  onDelete={() => onDeleteInstance(instance.id)}
                  onDuplicate={() => onDuplicateInstance(instance)}
                />
              ))}
            </div>

            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          </div>
        )}
      </ScrollArea>
    </div>
  )
}


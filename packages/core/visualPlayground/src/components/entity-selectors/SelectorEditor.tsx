import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EntitySelector } from './EntitySelector'
import { FilterEditor } from './FilterEditor'
import { VariablesEditor } from './VariablesEditor'
import type { SelectorEditorProps } from './types'
import type { Selector } from '@root/core/domain/levels/providers/types'
import type { EntityFilter } from '@root/core/domain/levels/filtering/types'

export function SelectorEditor({ provider, variables, onChange, onVariablesChange }: SelectorEditorProps) {
  const selector = provider.selector
  const granted = provider.granted

  const updateSelector = (updates: Partial<Selector>) => {
    onChange({
      ...provider,
      selector: selector ? { ...selector, ...updates } : undefined,
    })
  }

  const updateGranted = (specificIds: string[]) => {
    onChange({
      ...provider,
      granted: specificIds.length > 0 ? { ...granted, specificIds } : undefined,
    })
  }

  const handleFilterChange = (filter: EntityFilter | undefined) => {
    if (!selector) return
    onChange({
      ...provider,
      selector: { ...selector, filter },
    })
  }

  const addSelector = () => {
    onChange({
      ...provider,
      selector: {
        id: 'new-selector',
        name: 'Nuevo selector',
        min: 1,
        max: 1,
      },
    })
  }

  const removeSelector = () => {
    onChange({
      ...provider,
      selector: undefined,
    })
  }

  const currentEntityType = selector?.entityType

  return (
    <div className="space-y-6">
      <div className="p-4 bg-primary/5 rounded-lg border-2 border-primary/20">
        <label className="text-sm font-medium mb-2 block">Entity Type (Global)</label>
        <Select
          value={currentEntityType || '__none__'}
          onValueChange={(v: string) => {
            const newType = v === '__none__' ? undefined : v
            if (selector) {
              updateSelector({ entityType: newType })
            } else {
              onChange({
                ...provider,
                selector: {
                  id: 'new-selector',
                  name: 'Nuevo selector',
                  min: 1,
                  max: 1,
                  entityType: newType,
                },
              })
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sin filtro de tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">Todas las entidades</SelectItem>
            <SelectItem value="feat">feat</SelectItem>
            <SelectItem value="rogueTalent">rogueTalent</SelectItem>
            <SelectItem value="spell">spell</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-2">
          Este filtro se aplica a todas las secciones: Granted, Entity IDs y condiciones del filtro
        </p>
      </div>

      <Separator />

      <div>
        <h4 className="font-medium mb-3">Granted (automático)</h4>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">IDs específicos</label>
            <EntitySelector
              selectedIds={granted?.specificIds || []}
              onChange={(ids) => updateGranted(ids)}
              entityType={currentEntityType}
              placeholder="Selecciona entidades para otorgar automáticamente..."
            />
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium">Selector (selección del usuario)</h4>
          {selector ? (
            <Button variant="ghost" size="sm" onClick={removeSelector}>
              Eliminar selector
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={addSelector}>
              + Añadir selector
            </Button>
          )}
        </div>
        
        {selector && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-muted-foreground">ID</label>
                <Input
                  value={selector.id}
                  onChange={(e) => updateSelector({ id: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Nombre</label>
                <Input
                  value={selector.name}
                  onChange={(e) => updateSelector({ name: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-muted-foreground">Min</label>
                <Input
                  type="number"
                  value={selector.min}
                  onChange={(e) => updateSelector({ min: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Max</label>
                <Input
                  type="number"
                  value={selector.max}
                  onChange={(e) => updateSelector({ max: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Entity IDs (lista cerrada)
                {(!selector.entityIds || selector.entityIds.length === 0) && (
                  <span className="ml-2 text-xs opacity-70">· Vacío = todas las entidades</span>
                )}
              </label>
              <EntitySelector
                selectedIds={selector.entityIds || []}
                onChange={(ids) => updateSelector({ entityIds: ids.length > 0 ? ids : undefined })}
                entityType={currentEntityType}
                placeholder="Selecciona entidades específicas o deja vacío para todas..."
              />
            </div>

            <FilterEditor
              filter={selector.filter}
              onChange={handleFilterChange}
              variables={variables}
              entityType={currentEntityType}
            />

            <Separator />
            <VariablesEditor
              variables={variables}
              onChange={onVariablesChange}
            />
          </div>
        )}
      </div>
    </div>
  )
}


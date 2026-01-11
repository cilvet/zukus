import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { VariableAutocompleteInput } from './VariableAutocompleteInput'
import { ConditionValueInput } from './ConditionValueInput'
import { getEntityVariablesForAutocomplete } from '@/utils/entity-selectors/entityVariableUtils'
import type { FilterEditorProps } from './types'
import type { EntityFilter } from '@root/core/domain/levels/filtering/types'

const OPERATORS = ['==', '!=', '>', '<', '>=', '<=', 'contains', 'in'] as const

export function FilterEditor({ filter, onChange, variables, entityType }: FilterEditorProps) {
  const entityVariables = getEntityVariablesForAutocomplete(entityType)
  
  const addFilter = () => {
    onChange({
      type: 'AND',
      filterPolicy: 'strict',
      conditions: [{ field: '', operator: '==', value: '' }],
    })
  }

  const removeFilter = () => {
    onChange(undefined)
  }

  const updateFilterBase = (updates: Partial<EntityFilter>) => {
    if (!filter) return
    onChange({ ...filter, ...updates })
  }

  const addCondition = () => {
    if (!filter) return
    onChange({
      ...filter,
      conditions: [...filter.conditions, { field: '', operator: '==', value: '' }],
    })
  }

  const removeCondition = (index: number) => {
    if (!filter) return
    const newConditions = filter.conditions.filter((_, i) => i !== index)
    if (newConditions.length === 0) {
      onChange(undefined)
    } else {
      onChange({ ...filter, conditions: newConditions })
    }
  }

  const updateCondition = (index: number, updates: Partial<EntityFilter['conditions'][0]>) => {
    if (!filter) return
    const newConditions = filter.conditions.map((c, i) => 
      i === index ? { ...c, ...updates } : c
    )
    onChange({ ...filter, conditions: newConditions })
  }

  if (!filter) {
    return (
      <Button variant="outline" size="sm" onClick={addFilter}>
        + Añadir filtro
      </Button>
    )
  }

  return (
    <div className="p-4 bg-muted/50 rounded-md space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Filtro</p>
        <Button variant="ghost" size="sm" onClick={removeFilter}>
          Eliminar filtro
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-muted-foreground">Tipo lógico</label>
          <Select
            value={filter.type}
            onValueChange={(v: 'AND' | 'OR' | 'NOT') => updateFilterBase({ type: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AND">AND</SelectItem>
              <SelectItem value="OR">OR</SelectItem>
              <SelectItem value="NOT">NOT</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Policy</label>
          <Select
            value={filter.filterPolicy}
            onValueChange={(v: 'strict' | 'permissive') => updateFilterBase({ filterPolicy: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="strict">strict</SelectItem>
              <SelectItem value="permissive">permissive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Condiciones:</p>
        
        {filter.conditions.map((condition, index) => (
          <div key={index} className="flex items-center gap-2 p-2 bg-background rounded border">
            <div className="flex-1">
              <VariableAutocompleteInput
                value={condition.field || ''}
                onChange={(newValue) => updateCondition(index, { field: newValue })}
                variables={variables}
                entityVariables={entityVariables}
                placeholder="field (o @entity.xxx)"
                className="h-8 text-sm"
                showHelperText={false}
              />
            </div>
            
            <Select
              value={condition.operator}
              onValueChange={(v: string) => updateCondition(index, { operator: v as typeof OPERATORS[number] })}
            >
              <SelectTrigger className="w-24 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OPERATORS.map(op => (
                  <SelectItem key={op} value={op}>{op}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex-1">
              <ConditionValueInput
                value={String(condition.value || '')}
                onChange={(newValue) => {
                  let value: unknown = newValue
                  if (value === 'true') value = true
                  else if (value === 'false') value = false
                  else if (!isNaN(Number(value)) && value !== '') value = Number(value)
                  updateCondition(index, { value })
                }}
                fieldValue={condition.field || ''}
                variables={variables}
                entityVariables={entityVariables}
                entityType={entityType}
                className="h-8 text-sm"
              />
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeCondition(index)}
              className="h-8 w-8 p-0"
            >
              ×
            </Button>
          </div>
        ))}

        <p className="text-xs text-muted-foreground">
          Escribe <code className="bg-muted px-1 rounded">@</code> para usar variables. 
          <span className="text-primary/70"> @entity.xxx</span> para propiedades de la entidad.
        </p>
        
        <Button variant="outline" size="sm" onClick={addCondition}>
          + Añadir condición
        </Button>
      </div>
    </div>
  )
}


import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import type { VariablesEditorProps } from './types'

export function VariablesEditor({ variables, onChange }: VariablesEditorProps) {
  const [newVarName, setNewVarName] = useState('')
  const [newVarValue, setNewVarValue] = useState(0)

  const addVariable = () => {
    if (!newVarName.trim()) return
    const sanitizedName = newVarName.trim().replace(/\s+/g, '')
    if (variables[sanitizedName] !== undefined) return
    
    onChange({
      ...variables,
      [sanitizedName]: newVarValue,
    })
    setNewVarName('')
    setNewVarValue(0)
  }

  const removeVariable = (key: string) => {
    const newVariables = { ...variables }
    delete newVariables[key]
    onChange(newVariables)
  }

  const updateVariableValue = (key: string, value: number) => {
    onChange({
      ...variables,
      [key]: value,
    })
  }

  const updateVariableName = (oldKey: string, newKey: string) => {
    if (!newKey.trim() || newKey === oldKey) return
    const sanitizedKey = newKey.trim().replace(/\s+/g, '')
    if (variables[sanitizedKey] !== undefined) return
    
    const newVariables: Record<string, number> = {}
    Object.entries(variables).forEach(([k, v]) => {
      if (k === oldKey) {
        newVariables[sanitizedKey] = v
      } else {
        newVariables[k] = v
      }
    })
    onChange(newVariables)
  }

  const variableEntries = Object.entries(variables)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">
          Variables para filtros dinámicos
        </p>
        <Badge variant="outline" className="text-xs">
          {variableEntries.length} variable{variableEntries.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <p className="text-xs text-muted-foreground">
        Usa <code className="bg-muted px-1 rounded">@nombreVariable</code> en los valores de las condiciones del filtro.
      </p>

      {variableEntries.length > 0 && (
        <div className="space-y-2">
          {variableEntries.map(([key, value]) => (
            <div key={key} className="flex items-center gap-2 p-2 bg-muted/50 rounded border">
              <div className="flex-1">
                <Input
                  value={key}
                  onChange={(e) => updateVariableName(key, e.target.value)}
                  placeholder="nombre"
                  className="h-8 text-sm font-mono"
                />
              </div>
              <span className="text-muted-foreground">=</span>
              <div className="w-24">
                <Input
                  type="number"
                  value={value}
                  onChange={(e) => updateVariableValue(key, parseInt(e.target.value) || 0)}
                  className="h-8 text-sm"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeVariable(key)}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                ×
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 p-2 border border-dashed rounded">
        <div className="flex-1">
          <Input
            value={newVarName}
            onChange={(e) => setNewVarName(e.target.value)}
            placeholder="Nueva variable..."
            className="h-8 text-sm font-mono"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addVariable()
              }
            }}
          />
        </div>
        <span className="text-muted-foreground">=</span>
        <div className="w-24">
          <Input
            type="number"
            value={newVarValue}
            onChange={(e) => setNewVarValue(parseInt(e.target.value) || 0)}
            className="h-8 text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addVariable()
              }
            }}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={addVariable}
          disabled={!newVarName.trim()}
          className="h-8"
        >
          +
        </Button>
      </div>
    </div>
  )
}


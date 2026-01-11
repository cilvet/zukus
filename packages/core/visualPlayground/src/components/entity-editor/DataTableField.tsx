import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, AlertCircle } from 'lucide-react'
import { EntitySelector, type EntityOption } from '@/components/shared'
import type { DataTableRowKeyConfig, DataTableColumn, DataTableValue } from '@root/core/domain/entities/types/base'

// =============================================================================
// Types
// =============================================================================

export type DataTableFieldProps = {
  /** Row key configuration */
  rowKey: DataTableRowKeyConfig
  /** Column definitions */
  columns: DataTableColumn[]
  /** Current table data */
  value: DataTableValue
  /** Callback when data changes */
  onChange: (value: DataTableValue) => void
  /** Available entities for reference columns */
  availableEntities?: EntityOption[]
}

// =============================================================================
// Helpers
// =============================================================================

function getRowKeys(value: DataTableValue): number[] {
  return Object.keys(value)
    .map(k => parseInt(k, 10))
    .filter(n => !isNaN(n))
    .sort((a, b) => a - b)
}

function getNextRowKey(value: DataTableValue, rowKey: DataTableRowKeyConfig): number {
  const existingKeys = getRowKeys(value)
  if (existingKeys.length === 0) {
    return rowKey.startingNumber ?? 1
  }
  const maxKey = Math.max(...existingKeys)
  return maxKey + 1
}

function validateIncrementalRows(value: DataTableValue, rowKey: DataTableRowKeyConfig): string | null {
  if (!rowKey.incremental) {
    return null
  }
  
  const keys = getRowKeys(value)
  if (keys.length === 0) {
    return null
  }
  
  const startingNumber = rowKey.startingNumber ?? 1
  
  for (let i = 0; i < keys.length; i++) {
    const expectedKey = startingNumber + i
    if (keys[i] !== expectedKey) {
      return `Las filas deben ser consecutivas. Se esperaba ${expectedKey} pero se encontró ${keys[i]}.`
    }
  }
  
  return null
}

function createEmptyRow(columns: DataTableColumn[]): Record<string, unknown> {
  const row: Record<string, unknown> = {}
  for (const column of columns) {
    if (column.type === 'reference' && column.allowMultiple) {
      row[column.id] = []
    } else if (column.type === 'reference') {
      row[column.id] = ''
    } else if (column.type === 'integer') {
      row[column.id] = column.optional ? null : 0
    } else if (column.type === 'boolean') {
      row[column.id] = false
    } else if (column.type === 'string') {
      row[column.id] = ''
    }
  }
  return row
}

// =============================================================================
// Cell Renderer Components
// =============================================================================

type CellRendererProps = {
  column: DataTableColumn
  value: unknown
  onChange: (value: unknown) => void
  availableEntities?: EntityOption[]
}

function IntegerCell({ column, value, onChange }: CellRendererProps) {
  const numValue = value as number | null
  
  if (column.optional && numValue === null) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="h-7 text-xs text-muted-foreground px-2"
        onClick={() => onChange(0)}
      >
        +
      </Button>
    )
  }
  
  return (
    <Input
      type="number"
      value={numValue ?? 0}
      onChange={(e) => {
        const parsed = parseInt(e.target.value, 10)
        if (!isNaN(parsed)) {
          onChange(parsed)
        } else if (column.optional) {
          onChange(null)
        }
      }}
      className="h-7 w-full max-w-[70px] text-center text-sm border-0 bg-transparent focus-visible:ring-1 px-1"
    />
  )
}

function StringCell({ column, value, onChange }: CellRendererProps) {
  const strValue = value as string | null
  
  if (column.optional && (strValue === null || strValue === '')) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="h-7 text-xs text-muted-foreground px-2"
        onClick={() => onChange('')}
      >
        +
      </Button>
    )
  }
  
  return (
    <Input
      value={strValue ?? ''}
      onChange={(e) => onChange(e.target.value)}
      className="h-7 text-sm border-0 bg-transparent focus-visible:ring-1 px-1 w-full"
    />
  )
}

function BooleanCell({ value, onChange }: CellRendererProps) {
  return (
    <div className="flex items-center justify-center">
      <Switch
        checked={Boolean(value)}
        onCheckedChange={onChange}
      />
    </div>
  )
}

function ReferenceCell({ column, value, onChange, availableEntities }: CellRendererProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  const filteredEntities = availableEntities
    ? (column.referenceType
        ? availableEntities.filter(e => e.entityType === column.referenceType)
        : availableEntities)
    : []
  
  if (column.allowMultiple) {
    const refs = Array.isArray(value) ? (value as string[]) : []
    const selectedEntities = refs
      .map(id => filteredEntities.find(e => e.id === id))
      .filter(Boolean)
    
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs w-full justify-start px-2"
          onClick={() => setIsOpen(true)}
        >
          {refs.length === 0 && '+ Seleccionar'}
          {refs.length === 1 && (
            <span className="truncate">{selectedEntities[0]?.name || refs[0]}</span>
          )}
          {refs.length > 1 && `${refs.length} seleccionados`}
        </Button>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Seleccionar {column.name}</DialogTitle>
              <DialogDescription>
                {column.referenceType && `Tipo: ${column.referenceType}`}
              </DialogDescription>
            </DialogHeader>
            <div className="min-h-[400px] max-h-[50vh]">
              {filteredEntities.length > 0 ? (
                <EntitySelector
                  selectedIds={refs}
                  onChange={(ids) => onChange(ids)}
                  entities={filteredEntities}
                  entityType={column.referenceType}
                  multiple={true}
                  placeholder="Hacer clic para seleccionar"
                />
              ) : (
                <div className="text-sm text-muted-foreground p-4">
                  No hay entidades disponibles del tipo {column.referenceType}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={() => setIsOpen(false)}>Cerrar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    )
  }
  
  // Single reference
  const refValue = value as string | null
  const selectedEntity = refValue ? filteredEntities.find(e => e.id === refValue) : null
  
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="h-7 text-xs w-full justify-start px-2"
        onClick={() => setIsOpen(true)}
      >
        {selectedEntity ? (
          <span className="truncate">{selectedEntity.name}</span>
        ) : (
          '+ Seleccionar'
        )}
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Seleccionar {column.name}</DialogTitle>
            <DialogDescription>
              {column.referenceType && `Tipo: ${column.referenceType}`}
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-[400px] max-h-[50vh]">
            {filteredEntities.length > 0 ? (
              <EntitySelector
                selectedIds={refValue ? [refValue] : []}
                onChange={(ids) => {
                  onChange(ids[0] ?? '')
                  setIsOpen(false)
                }}
                entities={filteredEntities}
                entityType={column.referenceType}
                multiple={false}
                placeholder="Hacer clic para seleccionar"
              />
            ) : (
              <div className="text-sm text-muted-foreground p-4">
                No hay entidades disponibles del tipo {column.referenceType}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function CellRenderer({ column, value, onChange, availableEntities }: CellRendererProps) {
  switch (column.type) {
    case 'integer':
      return <IntegerCell column={column} value={value} onChange={onChange} />
    case 'string':
      return <StringCell column={column} value={value} onChange={onChange} />
    case 'boolean':
      return <BooleanCell column={column} value={value} onChange={onChange} />
    case 'reference':
      return (
        <ReferenceCell
          column={column}
          value={value}
          onChange={onChange}
          availableEntities={availableEntities}
        />
      )
    default:
      return <span className="text-muted-foreground">-</span>
  }
}

// =============================================================================
// Main DataTableField Component
// =============================================================================

export function DataTableField({
  rowKey,
  columns,
  value,
  onChange,
  availableEntities,
}: DataTableFieldProps) {
  const [showAddRowDialog, setShowAddRowDialog] = useState(false)
  const [customRowKey, setCustomRowKey] = useState('')
  
  const rowKeys = getRowKeys(value)
  const validationError = validateIncrementalRows(value, rowKey)
  const isIncremental = rowKey.incremental ?? false
  const startingNumber = rowKey.startingNumber ?? 1
  
  const handleAddRow = () => {
    if (isIncremental) {
      // Auto-add next consecutive row
      const nextKey = getNextRowKey(value, rowKey)
      const newRow = createEmptyRow(columns)
      onChange({
        ...value,
        [nextKey.toString()]: newRow,
      })
    } else {
      // Show dialog to input custom row key
      setCustomRowKey(getNextRowKey(value, rowKey).toString())
      setShowAddRowDialog(true)
    }
  }
  
  const handleConfirmAddRow = () => {
    const keyNum = parseInt(customRowKey, 10)
    if (isNaN(keyNum)) {
      return
    }
    if (value[keyNum.toString()]) {
      // Row already exists
      return
    }
    const newRow = createEmptyRow(columns)
    onChange({
      ...value,
      [keyNum.toString()]: newRow,
    })
    setShowAddRowDialog(false)
  }
  
  const handleDeleteRow = (rowKeyToDelete: number) => {
    // For incremental, only allow deleting the last row
    if (isIncremental) {
      const maxKey = Math.max(...rowKeys)
      if (rowKeyToDelete !== maxKey) {
        return
      }
    }
    
    const newValue = { ...value }
    delete newValue[rowKeyToDelete.toString()]
    onChange(newValue)
  }
  
  const handleCellChange = (rowKeyStr: string, columnId: string, cellValue: unknown) => {
    const rowData = value[rowKeyStr] ?? {}
    onChange({
      ...value,
      [rowKeyStr]: {
        ...rowData,
        [columnId]: cellValue,
      },
    })
  }
  
  const canDeleteRow = (key: number) => {
    if (!isIncremental) {
      return true
    }
    // Only can delete the last row in incremental mode
    const maxKey = Math.max(...rowKeys)
    return key === maxKey
  }
  
  return (
    <div className="space-y-2">
      {/* Validation Error */}
      {validationError && (
        <div className="flex items-center gap-2 p-2 bg-destructive/10 border border-destructive/30 rounded-md text-destructive text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{validationError}</span>
        </div>
      )}
      
      {/* Table */}
      <div className="border rounded-md overflow-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="h-9 px-2 text-center font-semibold text-sm border-r">
                {rowKey.name}
              </th>
              {columns.map((column) => (
                <th key={column.id} className="h-9 px-2 text-left font-medium text-sm border-r">
                  <div className="flex items-center gap-1.5">
                    <span>{column.name}</span>
                    {column.optional && (
                      <Badge variant="outline" className="text-xs py-0 h-4">opt</Badge>
                    )}
                    {column.type === 'reference' && column.referenceType && (
                      <Badge variant="secondary" className="text-xs font-mono py-0 h-4">
                        {column.referenceType}
                      </Badge>
                    )}
                  </div>
                </th>
              ))}
              <th className="h-9 w-10 border-r" />
            </tr>
          </thead>
          <tbody>
            {rowKeys.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 2}
                  className="text-center text-muted-foreground py-8 text-sm"
                >
                  No hay filas. Haz clic en "Añadir fila" para comenzar.
                </td>
              </tr>
            ) : (
              rowKeys.map((key) => {
                const rowData = value[key.toString()] ?? {}
                return (
                  <tr key={key} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="h-9 px-2 text-center font-mono font-semibold text-sm bg-muted/10 border-r">
                      {key}
                    </td>
                    {columns.map((column) => (
                      <td key={column.id} className="h-9 px-2 py-1 align-middle border-r">
                        <CellRenderer
                          column={column}
                          value={rowData[column.id]}
                          onChange={(cellValue) => handleCellChange(key.toString(), column.id, cellValue)}
                          availableEntities={availableEntities}
                        />
                      </td>
                    ))}
                    <td className="h-9 px-1 py-1 border-r">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteRow(key)}
                        disabled={!canDeleteRow(key)}
                        title={
                          !canDeleteRow(key)
                            ? 'Solo se puede eliminar la última fila en modo incremental'
                            : 'Eliminar fila'
                        }
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
      
      {/* Add Row Button */}
      <Button variant="outline" size="sm" onClick={handleAddRow}>
        <Plus className="h-4 w-4 mr-1" />
        Añadir fila
        {isIncremental && rowKeys.length > 0 && (
          <span className="ml-1 text-muted-foreground">
            ({getNextRowKey(value, rowKey)})
          </span>
        )}
      </Button>
      
      {/* Info about incremental mode */}
      {isIncremental && (
        <p className="text-xs text-muted-foreground">
          Las filas son consecutivas comenzando en {startingNumber}.
        </p>
      )}
      
      {/* Add Row Dialog (for non-incremental) */}
      <Dialog open={showAddRowDialog} onOpenChange={setShowAddRowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Añadir fila</DialogTitle>
            <DialogDescription>
              Especifica el número de fila ({rowKey.name}).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="row-key-input">{rowKey.name}</Label>
            <Input
              id="row-key-input"
              type="number"
              value={customRowKey}
              onChange={(e) => setCustomRowKey(e.target.value)}
              placeholder={`Número de ${rowKey.name.toLowerCase()}...`}
            />
            {value[customRowKey] && (
              <p className="text-sm text-destructive">
                Ya existe una fila con este número.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddRowDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmAddRow}
              disabled={!customRowKey || value[customRowKey] !== undefined}
            >
              Añadir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default DataTableField


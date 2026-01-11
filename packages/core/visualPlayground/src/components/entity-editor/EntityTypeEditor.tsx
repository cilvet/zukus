import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Plus, Trash2, ChevronDown, ChevronUp, Save, X, Copy, Eye } from 'lucide-react'
import type { EntitySchemaDefinition } from '@root/core/domain/entities/types/schema'
import type { EntityFieldDefinition } from '@root/core/domain/entities/types/fields'
import type { EntityFieldType, DataTableColumn, DataTableColumnType, DataTableRowKeyConfig, EnumOption } from '@root/core/domain/entities/types/base'

// =============================================================================
// Types
// =============================================================================

export type EntityTypeEditorProps = {
  /** Initial schema to edit, or undefined for new schema */
  initialSchema?: EntitySchemaDefinition
  /** Callback when save is clicked */
  onSave?: (schema: EntitySchemaDefinition) => void
  /** Callback when cancel is clicked */
  onCancel?: () => void
  /** Whether the editor is embedded in a modal */
  isModal?: boolean
  /** Available entity types for reference fields */
  availableEntityTypes?: string[]
}

type FieldEditorProps = {
  field: EntityFieldDefinition
  index: number
  onChange: (index: number, field: EntityFieldDefinition) => void
  onDelete: (index: number) => void
  onMoveUp: (index: number) => void
  onMoveDown: (index: number) => void
  isFirst: boolean
  isLast: boolean
  availableEntityTypes?: string[]
  depth?: number  // Profundidad de anidamiento para controlar padding
}

// =============================================================================
// Constants
// =============================================================================

const FIELD_TYPES: { value: EntityFieldType; label: string; description: string }[] = [
  { value: 'string', label: 'Texto', description: 'Campo de texto simple' },
  { value: 'integer', label: 'Número entero', description: 'Número sin decimales' },
  { value: 'boolean', label: 'Booleano', description: 'Verdadero o falso' },
  { value: 'enum', label: 'Enum', description: 'Valor seleccionable de una lista con metadatos' },
  { value: 'string_array', label: 'Lista de textos', description: 'Múltiples valores de texto' },
  { value: 'integer_array', label: 'Lista de números', description: 'Múltiples números enteros' },
  { value: 'reference', label: 'Referencia', description: 'Referencias a otras entidades' },
  { value: 'object', label: 'Objeto', description: 'Objeto con campos anidados' },
  { value: 'object_array', label: 'Lista de objetos', description: 'Lista de objetos con estructura' },
  { value: 'image', label: 'Imagen', description: 'URL o imagen de la librería' },
  { value: 'dataTable', label: 'Tabla de datos', description: 'Tabla con filas numeradas y columnas tipadas' },
]

const FIELD_TYPE_LABELS: Record<EntityFieldType, string> = {
  string: 'str',
  integer: 'int',
  boolean: 'bool',
  string_array: 'str[]',
  integer_array: 'int[]',
  reference: 'ref',
  object: 'obj',
  object_array: 'obj[]',
  image: 'img',
  dataTable: 'table',
  enum: 'enum',
}

const DATATABLE_COLUMN_TYPES: { value: DataTableColumnType; label: string }[] = [
  { value: 'integer', label: 'Número entero' },
  { value: 'string', label: 'Texto' },
  { value: 'boolean', label: 'Booleano' },
  { value: 'reference', label: 'Referencia' },
  { value: 'entityProvider', label: 'Entity Provider' },
]

const AVAILABLE_ADDONS = [
  {
    id: 'searchable',
    name: 'Searchable',
    description: 'Añade campos name y description para búsqueda y visualización',
    fields: ['name: string', 'description?: string'],
  },
  {
    id: 'taggable',
    name: 'Taggable',
    description: 'Permite categorizar con etiquetas',
    fields: ['tags?: string[]'],
  },
  {
    id: 'imageable',
    name: 'Imageable',
    description: 'Permite asociar una imagen',
    fields: ['image?: string'],
  },
  {
    id: 'source',
    name: 'Source',
    description: 'Información sobre el origen (compendio, libro, página)',
    fields: ['source?: { compendiumId, page?, edition? }'],
  },
  {
    id: 'effectful',
    name: 'Effectful',
    description: 'Puede aplicar efectos al personaje (cambios, efectos especiales)',
    fields: ['changes?: Change[]', 'specialChanges?: SpecialChange[]', 'effects?: Effect[]'],
  },
  {
    id: 'suppressing',
    name: 'Suppressing',
    description: 'Puede suprimir otras entidades',
    fields: ['suppression?: SuppressionConfig[]'],
  },
] as const

// =============================================================================
// Helpers
// =============================================================================

function createEmptySchema(): EntitySchemaDefinition {
  return {
    typeName: '',
    description: '',
    fields: [],
    addons: [],
  }
}


function ensureTempIds(fields: EntityFieldDefinition[]): (EntityFieldDefinition & { _tempId: string })[] {
  return fields.map(field => {
    const fieldWithId = field as EntityFieldDefinition & { _tempId?: string }
    const result = {
      ...field,
      _tempId: fieldWithId._tempId || `field_${Date.now()}_${Math.random().toString(36).slice(2)}`
    }
    if (result.objectFields) {
      result.objectFields = ensureTempIds(result.objectFields)
    }
    return result as EntityFieldDefinition & { _tempId: string }
  })
}

// =============================================================================
// EnumOptionEditor Component
// =============================================================================

type EnumOptionEditorProps = {
  option: EnumOption
  index: number
  onChange: (option: EnumOption) => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  isFirst: boolean
  isLast: boolean
  valueType: 'string' | 'number'
}

function EnumOptionEditor({
  option,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  valueType,
}: EnumOptionEditorProps) {
  const handleChange = (key: keyof EnumOption, value: string | number) => {
    onChange({ ...option, [key]: value })
  }

  return (
    <Card className="relative">
      <CardContent className="pt-4 pb-3 px-3">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Valor *</Label>
              {valueType === 'number' ? (
                <Input
                  type="number"
                  value={Number(option.value)}
                  onChange={(e) => handleChange('value', Number(e.target.value))}
                  className="h-8 font-mono text-sm"
                  placeholder="0"
                />
              ) : (
                <Input
                  value={String(option.value)}
                  onChange={(e) => handleChange('value', e.target.value)}
                  className="h-8 font-mono text-sm"
                  placeholder="value"
                />
              )}
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Nombre *</Label>
              <Input
                value={option.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="h-8 text-sm"
                placeholder="Display name"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Descripción</Label>
            <Textarea
              value={option.description ?? ''}
              onChange={(e) => handleChange('description', e.target.value)}
              className="h-16 resize-none text-sm"
              placeholder="Descripción opcional..."
            />
          </div>

          <div className="flex items-center gap-1 justify-between pt-1">
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onMoveUp}
                disabled={isFirst}
                title="Mover arriba"
              >
                <ChevronUp className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onMoveDown}
                disabled={isLast}
                title="Mover abajo"
              >
                <ChevronDown className="h-3 w-3" />
              </Button>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={onDelete}
              title="Eliminar opción"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// =============================================================================
// EnumOptionsEditor Component
// =============================================================================

type EnumOptionsEditorProps = {
  field: EntityFieldDefinition
  onChange: (field: EntityFieldDefinition) => void
}

function EnumOptionsEditor({ field, onChange }: EnumOptionsEditorProps) {
  const currentOptions = field.options ?? []
  const valueType = currentOptions.length > 0 && typeof currentOptions[0].value === 'number' ? 'number' : 'string'

  const handleAddOption = () => {
    const newOption: EnumOption = {
      value: valueType === 'number' ? 0 : '',
      name: '',
      description: '',
    }
    onChange({ ...field, options: [...currentOptions, newOption] })
  }

  const handleOptionChange = (index: number, updatedOption: EnumOption) => {
    const newOptions = [...currentOptions]
    newOptions[index] = updatedOption
    onChange({ ...field, options: newOptions })
  }

  const handleDeleteOption = (index: number) => {
    const newOptions = [...currentOptions]
    newOptions.splice(index, 1)
    onChange({ ...field, options: newOptions })
  }

  const handleMoveOption = (index: number, direction: 'up' | 'down') => {
    const newOptions = [...currentOptions]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    const temp = newOptions[index]
    newOptions[index] = newOptions[targetIndex]
    newOptions[targetIndex] = temp
    onChange({ ...field, options: newOptions })
  }

  const handleChangeValueType = (newType: 'string' | 'number') => {
    const convertedOptions = currentOptions.map(opt => ({
      ...opt,
      value: newType === 'number' ? Number(opt.value) || 0 : String(opt.value),
    }))
    onChange({ ...field, options: convertedOptions })
  }

  return (
    <div className="space-y-3 border rounded-lg p-3 bg-muted/20">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Opciones del Enum</Label>
        <div className="flex items-center gap-2">
          <Select value={valueType} onValueChange={(v) => handleChangeValueType(v as 'string' | 'number')}>
            <SelectTrigger className="h-8 w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="string">String</SelectItem>
              <SelectItem value="number">Number</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={handleAddOption}
          >
            <Plus className="h-3 w-3 mr-1" />
            Añadir opción
          </Button>
        </div>
      </div>

      {currentOptions.length === 0 ? (
        <p className="text-xs text-muted-foreground italic p-2">
          No hay opciones definidas. Añade al menos una opción para que el enum sea válido.
        </p>
      ) : (
        <div className="space-y-2">
          {currentOptions.map((option, index) => (
            <EnumOptionEditor
              key={index}
              option={option}
              index={index}
              onChange={(updated) => handleOptionChange(index, updated)}
              onDelete={() => handleDeleteOption(index)}
              onMoveUp={() => handleMoveOption(index, 'up')}
              onMoveDown={() => handleMoveOption(index, 'down')}
              isFirst={index === 0}
              isLast={index === currentOptions.length - 1}
              valueType={valueType}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// =============================================================================
// DataTableConfigEditor Component
// =============================================================================

type DataTableConfigEditorProps = {
  rowKey?: DataTableRowKeyConfig
  columns?: DataTableColumn[]
  onRowKeyChange: (rowKey: DataTableRowKeyConfig) => void
  onColumnsChange: (columns: DataTableColumn[]) => void
  availableEntityTypes?: string[]
}

function DataTableConfigEditor({
  rowKey,
  columns,
  onRowKeyChange,
  onColumnsChange,
  availableEntityTypes = [],
}: DataTableConfigEditorProps) {
  const currentRowKey: DataTableRowKeyConfig = rowKey ?? {
    name: 'Level',
    startingNumber: 1,
    incremental: true,
  }
  const currentColumns: DataTableColumn[] = columns ?? []

  const handleRowKeyFieldChange = (key: keyof DataTableRowKeyConfig, value: unknown) => {
    onRowKeyChange({ ...currentRowKey, [key]: value })
  }

  const handleAddColumn = () => {
    const newColumn: DataTableColumn = {
      id: `column_${Date.now()}`,
      name: '',
      type: 'integer',
    }
    onColumnsChange([...currentColumns, newColumn])
  }

  const handleColumnChange = (index: number, column: DataTableColumn) => {
    const newColumns = [...currentColumns]
    newColumns[index] = column
    onColumnsChange(newColumns)
  }

  const handleDeleteColumn = (index: number) => {
    const newColumns = [...currentColumns]
    newColumns.splice(index, 1)
    onColumnsChange(newColumns)
  }

  const handleMoveColumn = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === currentColumns.length - 1) return
    
    const newColumns = [...currentColumns]
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    const temp = newColumns[index]
    newColumns[index] = newColumns[swapIndex]
    newColumns[swapIndex] = temp
    onColumnsChange(newColumns)
  }

  return (
    <div className="space-y-4 border-l-2 border-amber-500/50 pl-3">
      <div className="flex items-center gap-2">
        <Badge className="bg-amber-600 text-xs">dataTable</Badge>
        <span className="text-xs text-muted-foreground">Configuración de la tabla</span>
      </div>

      {/* Row Key Configuration */}
      <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
        <Label className="text-xs font-semibold">Primera columna (Row Key)</Label>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1">
            <Label htmlFor="rowkey-name" className="text-xs">Nombre</Label>
            <Input
              id="rowkey-name"
              value={currentRowKey.name}
              onChange={(e) => handleRowKeyFieldChange('name', e.target.value)}
              placeholder="Level, Tier, Caster Level..."
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="rowkey-start" className="text-xs">Número inicial</Label>
            <Input
              id="rowkey-start"
              type="number"
              value={currentRowKey.startingNumber ?? 1}
              onChange={(e) => handleRowKeyFieldChange('startingNumber', parseInt(e.target.value, 10) || 1)}
              className="h-8 text-sm"
            />
          </div>
          <div className="flex items-center gap-2 pt-5">
            <Switch
              id="rowkey-incremental"
              checked={currentRowKey.incremental ?? false}
              onCheckedChange={(checked) => handleRowKeyFieldChange('incremental', checked)}
            />
            <Label htmlFor="rowkey-incremental" className="text-xs">Consecutivo</Label>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {currentRowKey.incremental 
            ? 'Las filas serán consecutivas: 1, 2, 3...'
            : 'Las filas pueden tener saltos: 1, 3, 5...'}
        </p>
      </div>

      {/* Columns Configuration */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold">Columnas de datos</Label>
          <Button variant="outline" size="sm" className="h-7" onClick={handleAddColumn}>
            <Plus className="h-3 w-3 mr-1" />
            Añadir columna
          </Button>
        </div>

        {currentColumns.length === 0 ? (
          <p className="text-xs text-muted-foreground italic p-2">
            No hay columnas definidas. Añade al menos una columna.
          </p>
        ) : (
          <div className="space-y-2">
            {currentColumns.map((column, index) => (
              <DataTableColumnEditor
                key={column.id}
                column={column}
                index={index}
                onChange={(updated) => handleColumnChange(index, updated)}
                onDelete={() => handleDeleteColumn(index)}
                onMoveUp={() => handleMoveColumn(index, 'up')}
                onMoveDown={() => handleMoveColumn(index, 'down')}
                isFirst={index === 0}
                isLast={index === currentColumns.length - 1}
                availableEntityTypes={availableEntityTypes}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// =============================================================================
// DataTableColumnEditor Component
// =============================================================================

type DataTableColumnEditorProps = {
  column: DataTableColumn
  index: number
  onChange: (column: DataTableColumn) => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  isFirst: boolean
  isLast: boolean
  availableEntityTypes?: string[]
}

function DataTableColumnEditor({
  column,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  availableEntityTypes = [],
}: DataTableColumnEditorProps) {
  const handleChange = (key: keyof DataTableColumn, value: unknown) => {
    onChange({ ...column, [key]: value })
  }

  const isReference = column.type === 'reference'

  return (
    <Card className="border-border/40 bg-card/30">
      <CardContent className="p-2">
        <div className="flex items-start gap-2">
          {/* Order controls */}
          <div className="flex flex-col gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              onClick={onMoveUp}
              disabled={isFirst}
            >
              <ChevronUp className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              onClick={onMoveDown}
              disabled={isLast}
            >
              <ChevronDown className="h-3 w-3" />
            </Button>
          </div>

          {/* Column configuration */}
          <div className="flex-1 grid gap-2 sm:grid-cols-4">
            {/* ID */}
            <div className="space-y-1">
              <Label className="text-xs">ID</Label>
              <Input
                value={column.id}
                onChange={(e) => {
                  const slugified = e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '_')
                    .replace(/^_|_$/g, '')
                  handleChange('id', slugified)
                }}
                placeholder="column_id"
                className="h-7 text-xs font-mono"
              />
            </div>

            {/* Name */}
            <div className="space-y-1">
              <Label className="text-xs">Nombre</Label>
              <Input
                value={column.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Nombre columna"
                className="h-7 text-xs"
              />
            </div>

            {/* Type */}
            <div className="space-y-1">
              <Label className="text-xs">Tipo</Label>
              <Select
                value={column.type}
                onValueChange={(value: DataTableColumnType) => handleChange('type', value)}
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DATATABLE_COLUMN_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value} className="text-xs">
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Optional */}
            <div className="flex items-end gap-2 pb-1">
              <Switch
                id={`col-optional-${column.id}`}
                checked={column.optional ?? false}
                onCheckedChange={(checked) => handleChange('optional', checked)}
              />
              <Label htmlFor={`col-optional-${column.id}`} className="text-xs">Opcional</Label>
            </div>

            {/* Reference type (when type is reference) */}
            {isReference && (
              <>
                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-xs">Tipo de entidad</Label>
                  {availableEntityTypes.length > 0 ? (
                    <Select
                      value={column.referenceType ?? ''}
                      onValueChange={(value) => handleChange('referenceType', value)}
                    >
                      <SelectTrigger className="h-7 text-xs font-mono">
                        <SelectValue placeholder="Selecciona tipo..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableEntityTypes.map((type) => (
                          <SelectItem key={type} value={type} className="font-mono text-xs">
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      value={column.referenceType ?? ''}
                      onChange={(e) => handleChange('referenceType', e.target.value)}
                      placeholder="spell, feat..."
                      className="h-7 text-xs font-mono"
                    />
                  )}
                </div>
                <div className="flex items-end gap-2 pb-1 sm:col-span-2">
                  <Switch
                    id={`col-multiple-${column.id}`}
                    checked={column.allowMultiple ?? false}
                    onCheckedChange={(checked) => handleChange('allowMultiple', checked)}
                  />
                  <Label htmlFor={`col-multiple-${column.id}`} className="text-xs">Múltiples referencias</Label>
                </div>
              </>
            )}
          </div>

          {/* Delete button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// =============================================================================
// FieldEditor Component
// =============================================================================

function FieldEditor({
  field,
  index,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  availableEntityTypes = [],
  depth = 0,
}: FieldEditorProps) {
  const [allowedValuesInput, setAllowedValuesInput] = useState(
    field.allowedValues?.join(', ') ?? ''
  )

  const handleFieldChange = (key: keyof EntityFieldDefinition, value: unknown) => {
    const updatedField = { ...field, [key]: value }
    
    // If changing type to dataTable, initialize rowKey and columns if not present
    if (key === 'type' && value === 'dataTable') {
      if (!updatedField.rowKey) {
        updatedField.rowKey = {
          name: 'Level',
          startingNumber: 1,
          incremental: true,
        }
      }
      if (!updatedField.columns) {
        updatedField.columns = []
      }
    }
    
    // If changing type to enum, initialize options if not present
    if (key === 'type' && value === 'enum') {
      if (!updatedField.options || updatedField.options.length === 0) {
        updatedField.options = []
      }
    }
    
    onChange(index, updatedField)
  }

  const handleAllowedValuesChange = (input: string) => {
    setAllowedValuesInput(input)
    if (!input.trim()) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { allowedValues: _unusedAllowedValues, ...rest } = field
      onChange(index, rest)
      return
    }

    const values = input.split(',').map(v => v.trim()).filter(Boolean)
    if (field.type === 'integer' || field.type === 'integer_array') {
      const numValues = values.map(Number).filter(n => !isNaN(n))
      if (numValues.length > 0) {
        onChange(index, { ...field, allowedValues: numValues })
      }
    } else {
      onChange(index, { ...field, allowedValues: values })
    }
  }

  const supportsAllowedValues = ['string', 'integer', 'string_array', 'integer_array'].includes(field.type)
  const supportsNonEmpty = ['string_array', 'integer_array', 'reference', 'object_array'].includes(field.type)
  const supportsReferenceType = field.type === 'reference'
  const supportsObjectFields = field.type === 'object' || field.type === 'object_array'
  const supportsDataTable = field.type === 'dataTable'
  const supportsEnum = field.type === 'enum'

  // Padding uniforme para todos los niveles
  const cardClass = depth > 0 ? 'border-border/40 bg-muted/30' : 'border-border/50 bg-card/50'
  
  return (
    <Card className={cardClass}>
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          {/* Main field content */}
          <div className="flex-1 space-y-3">
            {/* Header row con controles de orden */}
            <div className="flex items-center gap-2">
              {/* Botones de mover */}
              <div className="flex items-center gap-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={() => onMoveUp(index)}
                  disabled={isFirst}
                >
                  <ChevronUp className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={() => onMoveDown(index)}
                  disabled={isLast}
                >
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </div>
              
              <Badge variant="outline" className="font-mono text-xs">
                {FIELD_TYPE_LABELS[field.type]}
              </Badge>
              <span className="font-medium text-sm">{field.name || 'Nuevo campo'}</span>
              {field.optional && (
                <Badge variant="secondary" className="text-xs">Opcional</Badge>
              )}
              {field.nonEmpty && (
                <Badge className="text-xs bg-amber-600">No vacío</Badge>
              )}
              {depth > 0 && (
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  Nivel {depth}
                </Badge>
              )}
            </div>

            {/* Field configuration */}
            <div className="grid gap-3 sm:grid-cols-2">
              {/* Name */}
              <div className="space-y-1.5">
                <Label htmlFor={`field-name-${index}-depth-${depth}`} className="text-xs">Nombre del campo</Label>
                <Input
                  id={`field-name-${index}-depth-${depth}`}
                  value={field.name}
                  onChange={(e) => {
                    const slugified = e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, '_')
                      .replace(/^_|_$/g, '')
                    handleFieldChange('name', slugified)
                  }}
                  placeholder="nombre_campo"
                  className="font-mono h-8 text-sm"
                />
              </div>

              {/* Type */}
              <div className="space-y-1.5">
                <Label htmlFor={`field-type-${index}-depth-${depth}`} className="text-xs">Tipo</Label>
                <Select
                  value={field.type}
                  onValueChange={(value: string) => handleFieldChange('type', value as EntityFieldType)}
                >
                  <SelectTrigger id={`field-type-${index}-depth-${depth}`} className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FIELD_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs">{FIELD_TYPE_LABELS[type.value]}</span>
                          <span className="text-sm">{type.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor={`field-desc-${index}-depth-${depth}`} className="text-xs">Descripción</Label>
                <Input
                  id={`field-desc-${index}-depth-${depth}`}
                  value={field.description ?? ''}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  placeholder="Descripción del campo..."
                  className="h-8 text-sm"
                />
              </div>

              {/* Optional toggle */}
              <div className="flex items-center gap-2">
                <Switch
                  id={`field-optional-${index}-depth-${depth}`}
                  checked={field.optional ?? false}
                  onCheckedChange={(checked) => handleFieldChange('optional', checked)}
                />
                <Label htmlFor={`field-optional-${index}-depth-${depth}`} className="text-xs">Campo opcional</Label>
              </div>

              {/* Non-empty toggle (for arrays) */}
              {supportsNonEmpty && (
                <div className="flex items-center gap-2">
                  <Switch
                    id={`field-nonempty-${index}-depth-${depth}`}
                    checked={field.nonEmpty ?? false}
                    onCheckedChange={(checked) => handleFieldChange('nonEmpty', checked)}
                  />
                  <Label htmlFor={`field-nonempty-${index}-depth-${depth}`} className="text-xs">Requiere al menos un elemento</Label>
                </div>
              )}
            </div>

            {/* Allowed values (for string/integer fields) */}
            {supportsAllowedValues && (
              <div className="space-y-1.5">
                <Label htmlFor={`field-allowed-${index}-depth-${depth}`} className="text-xs">
                  Valores permitidos
                  <span className="text-xs text-muted-foreground ml-2">(separados por coma)</span>
                </Label>
                <Input
                  id={`field-allowed-${index}-depth-${depth}`}
                  value={allowedValuesInput}
                  onChange={(e) => handleAllowedValuesChange(e.target.value)}
                  placeholder="valor1, valor2, valor3..."
                  className="h-8 text-sm"
                />
                {field.allowedValues && field.allowedValues.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {field.allowedValues.map((v, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {String(v)}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Reference type */}
            {supportsReferenceType && (
              <div className="space-y-1.5">
                <Label htmlFor={`field-reftype-${index}-depth-${depth}`} className="text-xs">Tipo de entidad referenciada</Label>
                {availableEntityTypes.length > 0 ? (
                  <Select
                    value={field.referenceType ?? ''}
                    onValueChange={(value: string) => handleFieldChange('referenceType', value)}
                  >
                    <SelectTrigger id={`field-reftype-${index}-depth-${depth}`} className="font-mono h-8">
                      <SelectValue placeholder="Selecciona un tipo..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableEntityTypes.map((type) => (
                        <SelectItem key={type} value={type} className="font-mono">
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={`field-reftype-${index}-depth-${depth}`}
                    value={field.referenceType ?? ''}
                    onChange={(e) => handleFieldChange('referenceType', e.target.value)}
                    placeholder="spell, feat, item..."
                    className="font-mono h-8 text-sm"
                  />
                )}
                {availableEntityTypes.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No hay tipos de entidades disponibles. Crea primero otros tipos de entidad.
                  </p>
                )}
              </div>
            )}

            {/* Nested object fields - RECURSIVO */}
            {supportsObjectFields && (
              <div className="space-y-2 border-l-2 border-primary/30 pl-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Campos del objeto</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7"
                    onClick={() => {
                      const currentFields = field.objectFields ?? []
                      const tempId = `nested_${Date.now()}_${Math.random().toString(36).slice(2)}`
                      const newField: EntityFieldDefinition & { _tempId?: string } = {
                        name: '',
                        type: 'string',
                        description: '',
                        optional: true,
                        _tempId: tempId,
                      }
                      handleFieldChange('objectFields', [...currentFields, newField])
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Añadir campo
                  </Button>
                </div>
                {field.objectFields && field.objectFields.length > 0 ? (
                  <div className="space-y-2">
                    {field.objectFields.map((nestedField, nestedIndex) => {
                      const nestedFieldWithId = nestedField as EntityFieldDefinition & { _tempId?: string }
                      const nestedKey = nestedFieldWithId._tempId || nestedField.name || `nested-${nestedIndex}`
                      return (
                        <FieldEditor
                          key={nestedKey}
                          field={nestedField}
                          index={nestedIndex}
                          onChange={(idx, updated) => {
                            const newFields = [...(field.objectFields ?? [])]
                            newFields[idx] = updated
                            handleFieldChange('objectFields', newFields)
                          }}
                          onDelete={(idx) => {
                            const newFields = [...(field.objectFields ?? [])]
                            newFields.splice(idx, 1)
                            handleFieldChange('objectFields', newFields)
                          }}
                          onMoveUp={(idx) => {
                            if (idx === 0) return
                            const newFields = [...(field.objectFields ?? [])]
                            const temp = newFields[idx]
                            newFields[idx] = newFields[idx - 1]
                            newFields[idx - 1] = temp
                            handleFieldChange('objectFields', newFields)
                          }}
                          onMoveDown={(idx) => {
                            if (idx === (field.objectFields ?? []).length - 1) return
                            const newFields = [...(field.objectFields ?? [])]
                            const temp = newFields[idx]
                            newFields[idx] = newFields[idx + 1]
                            newFields[idx + 1] = temp
                            handleFieldChange('objectFields', newFields)
                          }}
                          isFirst={nestedIndex === 0}
                          isLast={nestedIndex === (field.objectFields ?? []).length - 1}
                          availableEntityTypes={availableEntityTypes}
                          depth={depth + 1}
                        />
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    No hay campos definidos. Añade campos para definir la estructura del objeto.
                  </p>
                )}
              </div>
            )}

            {/* Enum options configuration */}
            {supportsEnum && (
              <EnumOptionsEditor
                field={field}
                onChange={(updatedField) => onChange(index, updatedField)}
              />
            )}

            {/* DataTable configuration */}
            {supportsDataTable && (
              <DataTableConfigEditor
                rowKey={field.rowKey}
                columns={field.columns}
                onRowKeyChange={(rowKey) => handleFieldChange('rowKey', rowKey)}
                onColumnsChange={(columns) => handleFieldChange('columns', columns)}
                availableEntityTypes={availableEntityTypes}
              />
            )}
          </div>

          {/* Delete button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(index)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// =============================================================================
// Main EntityTypeEditor Component
// =============================================================================

export function EntityTypeEditor({
  initialSchema,
  onSave,
  onCancel,
  isModal = false,
  availableEntityTypes = [],
}: EntityTypeEditorProps) {
  const [schema, setSchema] = useState<EntitySchemaDefinition>(() => {
    const baseSchema = initialSchema ?? createEmptySchema()
    return {
      ...baseSchema,
      fields: ensureTempIds(baseSchema.fields)
    }
  })

  const isEditing = !!initialSchema

  const handleSchemaChange = (key: keyof EntitySchemaDefinition, value: unknown) => {
    setSchema({ ...schema, [key]: value })
  }

  const handleAddField = () => {
    const tempId = `field_${Date.now()}_${Math.random().toString(36).slice(2)}`
    const newField: EntityFieldDefinition & { _tempId?: string } = {
      name: '',
      type: 'string',
      description: '',
      optional: true,
      _tempId: tempId,
    }
    setSchema({
      ...schema,
      fields: [...schema.fields, newField],
    })
  }

  const handleFieldChange = (index: number, field: EntityFieldDefinition) => {
    const newFields = [...schema.fields]
    newFields[index] = field
    setSchema({ ...schema, fields: newFields })
  }

  const handleFieldDelete = (index: number) => {
    const newFields = [...schema.fields]
    newFields.splice(index, 1)
    setSchema({ ...schema, fields: newFields })
  }

  const handleFieldMoveUp = (index: number) => {
    if (index === 0) return
    const newFields = [...schema.fields]
    const temp = newFields[index]
    newFields[index] = newFields[index - 1]
    newFields[index - 1] = temp
    setSchema({ ...schema, fields: newFields })
  }

  const handleFieldMoveDown = (index: number) => {
    if (index === schema.fields.length - 1) return
    const newFields = [...schema.fields]
    const temp = newFields[index]
    newFields[index] = newFields[index + 1]
    newFields[index + 1] = temp
    setSchema({ ...schema, fields: newFields })
  }

  const handleToggleAddon = (addonId: string) => {
    const currentAddons = schema.addons ?? []
    const hasAddon = currentAddons.includes(addonId)
    
    if (hasAddon) {
      setSchema({
        ...schema,
        addons: currentAddons.filter(id => id !== addonId)
      })
    } else {
      setSchema({
        ...schema,
        addons: [...currentAddons, addonId]
      })
    }
  }

  const handleSave = () => {
    if (onSave) {
      const cleanFields = (fields: EntityFieldDefinition[]): EntityFieldDefinition[] => {
        return fields.map(field => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { _tempId, ...cleanField } = field as EntityFieldDefinition & { _tempId?: string }
          if (cleanField.objectFields) {
            cleanField.objectFields = cleanFields(cleanField.objectFields)
          }
          return cleanField
        })
      }
      
      const cleanSchema = {
        ...schema,
        fields: cleanFields(schema.fields)
      }
      onSave(cleanSchema)
    }
  }

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(schema, null, 2))
  }

  const isValid = schema.typeName.trim().length > 0

  const containerClass = isModal ? '' : 'p-4 md:p-6'

  return (
    <div className={containerClass}>
      <div className="space-y-6 max-w-5xl">
        {/* Basic Info Card */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Información básica</CardTitle>
            <CardDescription>
              Define el nombre y descripción del tipo de entidad
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="typeName">Nombre del tipo *</Label>
                <Input
                  id="typeName"
                  value={schema.typeName}
                  onChange={(e) => {
                    const slugified = e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, '_')
                      .replace(/^_|_$/g, '')
                    handleSchemaChange('typeName', slugified)
                  }}
                  placeholder="spell, feat, item..."
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Identificador único en formato snake_case
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={schema.description ?? ''}
                  onChange={(e) => handleSchemaChange('description', e.target.value)}
                  placeholder="Describe qué representa este tipo de entidad..."
                  className="h-20 resize-none"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Addons Card */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Addons</CardTitle>
            <CardDescription>
              Los addons añaden campos y comportamientos predefinidos a tus entidades
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              {AVAILABLE_ADDONS.map((addon) => {
                const isSelected = (schema.addons ?? []).includes(addon.id)
                return (
                  <Card 
                    key={addon.id}
                    className={`cursor-pointer transition-colors ${
                      isSelected 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border/40 hover:border-border'
                    }`}
                    onClick={() => handleToggleAddon(addon.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <Switch
                          checked={isSelected}
                          onCheckedChange={() => handleToggleAddon(addon.id)}
                          className="mt-0.5"
                        />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{addon.name}</span>
                            <Badge variant="outline" className="font-mono text-xs">
                              {addon.id}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {addon.description}
                          </p>
                          <div className="flex flex-wrap gap-1 pt-1">
                            {addon.fields.map((field, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs font-mono">
                                {field}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
            
            {/* Selected addons summary */}
            {(schema.addons ?? []).length > 0 && (
              <div className="pt-2">
                <Separator className="mb-3" />
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground">
                    Addons seleccionados:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {(schema.addons ?? []).map((addonId) => (
                      <Badge key={addonId} className="text-xs">
                        {addonId}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fields Card */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Campos personalizados</CardTitle>
                <CardDescription>
                  Los campos de los addons se añaden automáticamente
                </CardDescription>
              </div>
              <Button onClick={handleAddField} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Añadir campo
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Base fields info */}
            <div className="mb-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Campos incluidos automáticamente:</p>
              <div className="space-y-2">
                {/* Always present */}
                <div>
                  <p className="text-xs font-semibold mb-1">Siempre presentes:</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">id (str, requerido)</Badge>
                    <Badge variant="outline">entityType (str, requerido)</Badge>
                  </div>
                </div>
                
                {/* From addons */}
                {(schema.addons ?? []).length > 0 && (
                  <div>
                    <p className="text-xs font-semibold mb-1">Desde addons:</p>
                    <div className="flex flex-wrap gap-2">
                      {(schema.addons ?? []).map(addonId => {
                        const addon = AVAILABLE_ADDONS.find(a => a.id === addonId)
                        if (!addon) return null
                        return addon.fields.map((field, idx) => (
                          <Badge 
                            key={`${addonId}-${idx}`} 
                            variant="outline"
                            className="bg-primary/5"
                          >
                            {field}
                          </Badge>
                        ))
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator className="mb-4" />

            {/* Custom fields */}
            {schema.fields.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="mb-2">No hay campos personalizados definidos</p>
                <Button variant="outline" onClick={handleAddField}>
                  <Plus className="h-4 w-4 mr-1" />
                  Añadir primer campo
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {schema.fields.map((field, index) => {
                  const fieldWithId = field as EntityFieldDefinition & { _tempId?: string }
                  const key = fieldWithId._tempId || field.name || `field-${index}`
                  return (
                    <FieldEditor
                      key={key}
                      field={field}
                      index={index}
                      onChange={handleFieldChange}
                      onDelete={handleFieldDelete}
                      onMoveUp={handleFieldMoveUp}
                      onMoveDown={handleFieldMoveDown}
                      isFirst={index === 0}
                      isLast={index === schema.fields.length - 1}
                      availableEntityTypes={availableEntityTypes}
                      depth={0}
                    />
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* JSON Preview */}
        <Accordion type="single" collapsible>
          <AccordionItem value="json" className="border rounded-lg">
            <AccordionTrigger className="px-4 hover:no-underline">
              <span className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span>Vista previa JSON</span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={handleCopyJson}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <pre className="bg-muted/50 p-4 rounded-lg overflow-auto text-xs font-mono max-h-[300px]">
                  {JSON.stringify(schema, null, 2)}
                </pre>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-1" />
              Cancelar
            </Button>
          )}
          <Button onClick={handleSave} disabled={!isValid}>
            <Save className="h-4 w-4 mr-1" />
            {isEditing ? 'Guardar cambios' : 'Crear tipo de entidad'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default EntityTypeEditor


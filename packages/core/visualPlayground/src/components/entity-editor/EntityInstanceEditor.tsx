import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Plus, Trash2, Save, X, Copy, Eye, ImageIcon } from 'lucide-react'
import { ImagePickerModal } from './ImagePickerModal'
import { DataTableField } from './DataTableField'
import { imagesApi } from '@/lib/api'
import { EntitySelector, type EntityOption } from '@/components/shared'
import type { EntitySchemaDefinition } from '@root/core/domain/entities/types/schema'
import type { EntityFieldDefinition } from '@root/core/domain/entities/types/fields'
import type { Entity, DataTableValue, EnumOption } from '@root/core/domain/entities/types/base'

// =============================================================================
// Types
// =============================================================================

export type EntityInstanceEditorProps = {
  /** Schema definition for the entity type */
  schema: EntitySchemaDefinition
  /** Initial entity data to edit, or undefined for new entity */
  initialEntity?: Entity & Record<string, unknown>
  /** Callback when save is clicked */
  onSave?: (entity: Entity & Record<string, unknown>) => void
  /** Callback when cancel is clicked */
  onCancel?: () => void
  /** Whether the editor is embedded in a modal */
  isModal?: boolean
  /** Available entities for reference fields */
  availableEntities?: EntityOption[]
}

type FieldValue = string | number | boolean | string[] | number[] | Record<string, unknown> | Record<string, unknown>[] | DataTableValue

// =============================================================================
// Helpers
// =============================================================================

function getDefaultValue(field: EntityFieldDefinition): FieldValue {
  if (field.allowedValues && field.allowedValues.length > 0) {
    if (field.type === 'string' || field.type === 'integer') {
      return field.allowedValues[0]
    }
    if (field.type === 'string_array' || field.type === 'integer_array') {
      return field.nonEmpty ? [field.allowedValues[0]] : []
    }
  }

  switch (field.type) {
    case 'string':
    case 'image':
      return ''
    case 'integer':
      return 0
    case 'boolean':
      return false
    case 'enum':
      if (field.options && field.options.length > 0) {
        return field.options[0].value
      }
      return ''
    case 'string_array':
    case 'integer_array':
      return field.nonEmpty ? [''] : []
    case 'reference':
      return field.nonEmpty ? [''] : []
    case 'object':
      return createEmptyObject(field.objectFields ?? [])
    case 'object_array':
      return field.nonEmpty ? [createEmptyObject(field.objectFields ?? [])] : []
    case 'dataTable':
      return {}
    default:
      return ''
  }
}

function createEmptyObject(fields: EntityFieldDefinition[]): Record<string, unknown> {
  const obj: Record<string, unknown> = {}
  for (const field of fields) {
    if (!field.optional) {
      obj[field.name] = getDefaultValue(field)
    }
  }
  return obj
}

function createEmptyEntity(schema: EntitySchemaDefinition): Entity & Record<string, unknown> {
  const entity: Entity & Record<string, unknown> = {
    id: '',
    entityType: schema.typeName,
  }

  const addons = schema.addons ?? []
  
  if (addons.includes('searchable')) {
    entity.name = ''
    entity.description = ''
  }
  
  if (addons.includes('taggable')) {
    entity.tags = []
  }
  
  if (addons.includes('imageable')) {
    entity.image = ''
  }
  
  if (addons.includes('source')) {
    entity.source = undefined
  }
  
  if (addons.includes('effectful')) {
    entity.changes = []
    entity.specialChanges = []
    entity.effects = []
  }
  
  if (addons.includes('suppressing')) {
    entity.suppression = []
  }

  for (const field of schema.fields) {
    if (!field.optional) {
      entity[field.name] = getDefaultValue(field)
    }
  }

  return entity
}


// =============================================================================
// Field Renderers
// =============================================================================

type FieldRendererProps = {
  field: EntityFieldDefinition
  value: FieldValue
  onChange: (value: FieldValue) => void
  availableEntities?: EntityOption[]
}

function StringField({ field, value, onChange }: FieldRendererProps) {
  if (field.allowedValues && field.allowedValues.length > 0) {
    return (
      <Select value={String(value)} onValueChange={onChange}>
        <SelectTrigger className="cursor-pointer">
          <SelectValue placeholder="Selecciona un valor..." />
        </SelectTrigger>
        <SelectContent>
          {(field.allowedValues as string[]).map((v) => (
            <SelectItem key={v} value={v} className="cursor-pointer">
              {v}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  return (
    <Input
      value={String(value)}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.description ?? ''}
    />
  )
}

function IntegerField({ field, value, onChange }: FieldRendererProps) {
  if (field.allowedValues && field.allowedValues.length > 0) {
    return (
      <Select value={String(value)} onValueChange={(v) => onChange(Number(v))}>
        <SelectTrigger className="cursor-pointer">
          <SelectValue placeholder="Selecciona un valor..." />
        </SelectTrigger>
        <SelectContent>
          {(field.allowedValues as number[]).map((v) => (
            <SelectItem key={v} value={String(v)} className="cursor-pointer">
              {v}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  return (
    <Input
      type="number"
      value={Number(value)}
      onChange={(e) => onChange(Number(e.target.value))}
      placeholder={field.description ?? ''}
    />
  )
}

function BooleanField({ value, onChange }: FieldRendererProps) {
  return (
    <Switch
      checked={Boolean(value)}
      onCheckedChange={onChange}
    />
  )
}

function EnumField({ field, value, onChange }: FieldRendererProps) {
  const options = field.options ?? []
  const currentValue = value !== undefined && value !== null ? String(value) : ''

  const handleChange = (newValue: string) => {
    const option = options.find(opt => String(opt.value) === newValue)
    if (option) {
      onChange(option.value)
    }
  }

  if (options.length === 0) {
    return (
      <div className="text-sm text-destructive">
        Error: El campo enum no tiene opciones definidas.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Select value={currentValue} onValueChange={handleChange}>
        <SelectTrigger className="cursor-pointer">
          <SelectValue placeholder="Selecciona una opción..." />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem 
              key={String(option.value)} 
              value={String(option.value)} 
              className="cursor-pointer"
            >
              <div className="flex flex-col">
                <span className="font-medium">{option.name}</span>
                {option.description && (
                  <span className="text-xs text-muted-foreground">{option.description}</span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {currentValue && options.find(opt => String(opt.value) === currentValue) && (
        <div className="text-xs text-muted-foreground">
          Valor: <code className="bg-muted px-1 rounded font-mono">{currentValue}</code>
        </div>
      )}
    </div>
  )
}

function ImageField({ field, value, onChange }: FieldRendererProps) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const imageValue = String(value || '')
  const isLibraryImage = imageValue && !imageValue.startsWith('http')
  const imageUrl = isLibraryImage 
    ? imagesApi.getImageUrl(imageValue)
    : imageValue

  const handleSelectImage = (imagePath: string) => {
    onChange(imagePath)
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={imageValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.description ?? 'URL de imagen o ID de librería...'}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setPickerOpen(true)}
          title="Seleccionar de librería"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
      </div>
      {imageUrl && (
        <div className="border rounded-md p-2 bg-muted/20">
          <img 
            src={imageUrl} 
            alt="Preview" 
            className="max-h-24 object-contain mx-auto"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        </div>
      )}
      <ImagePickerModal
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={handleSelectImage}
        currentValue={imageValue}
      />
    </div>
  )
}

type ArrayFieldProps = FieldRendererProps & {
  itemType: 'string' | 'integer'
}

function ArrayField({ field, value, onChange, itemType }: ArrayFieldProps) {
  const arr = Array.isArray(value) ? value : []

  const handleItemChange = (index: number, newValue: string | number) => {
    const newArr = [...arr]
    newArr[index] = newValue
    onChange(newArr)
  }

  const handleAddItem = () => {
    if (field.allowedValues && field.allowedValues.length > 0) {
      onChange([...arr, field.allowedValues[0]])
    } else {
      onChange([...arr, itemType === 'integer' ? 0 : ''])
    }
  }

  const handleRemoveItem = (index: number) => {
    const newArr = [...arr]
    newArr.splice(index, 1)
    onChange(newArr)
  }

  // If allowed values, show as multiselect checkboxes
  if (field.allowedValues && field.allowedValues.length > 0) {
    const selectedSet = new Set(arr.map(String))

    return (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {field.allowedValues.map((option) => {
            const isSelected = selectedSet.has(String(option))
            return (
              <label
                key={String(option)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md border cursor-pointer transition-colors hover:bg-muted/50 hover:border-primary/50"
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onChange([...arr, option])
                    } else {
                      onChange(arr.filter((v) => v !== option))
                    }
                  }}
                />
                <span className="text-sm select-none">{String(option)}</span>
              </label>
            )
          })}
        </div>
        {arr.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {arr.map((item, i) => (
              <Badge key={i} variant="secondary">
                {String(item)}
              </Badge>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {arr.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {itemType === 'integer' ? (
            <Input
              type="number"
              value={Number(item)}
              onChange={(e) => handleItemChange(index, Number(e.target.value))}
              className="flex-1"
            />
          ) : (
            <Input
              value={String(item)}
              onChange={(e) => handleItemChange(index, e.target.value)}
              className="flex-1"
            />
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => handleRemoveItem(index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={handleAddItem}>
        <Plus className="h-3 w-3 mr-1" />
        Añadir
      </Button>
    </div>
  )
}

type ReferenceFieldProps = {
  field: EntityFieldDefinition
  value: FieldValue
  onChange: (value: FieldValue) => void
  availableEntities?: EntityOption[]
}

function ReferenceField({ field, value, onChange, availableEntities }: ReferenceFieldProps) {
  const refs = Array.isArray(value) ? (value as string[]) : []

  // Filter entities by referenceType if specified
  const filteredEntities = availableEntities
    ? (field.referenceType
        ? availableEntities.filter(e => e.entityType === field.referenceType)
        : availableEntities)
    : []

  // If we have available entities, use EntitySelector
  if (filteredEntities.length > 0) {
    return (
      <div className="space-y-2">
        <EntitySelector
          selectedIds={refs}
          onChange={(ids) => onChange(ids)}
          entities={filteredEntities}
          entityType={field.referenceType}
          multiple={true}
          placeholder={`Buscar ${field.referenceType ?? 'entidades'}...`}
        />
        {field.referenceType && (
          <p className="text-xs text-muted-foreground">
            Tipo: <code className="font-mono bg-muted px-1 rounded">{field.referenceType}</code>
          </p>
        )}
      </div>
    )
  }

  // Fallback to manual ID input
  const handleAdd = () => {
    onChange([...refs, ''])
  }

  const handleChange = (index: number, newId: string) => {
    const newRefs = [...refs]
    newRefs[index] = newId
    onChange(newRefs)
  }

  const handleRemove = (index: number) => {
    const newRefs = [...refs]
    newRefs.splice(index, 1)
    onChange(newRefs)
  }

  return (
    <div className="space-y-2">
      {refs.map((refId, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            value={refId}
            onChange={(e) => handleChange(index, e.target.value)}
            placeholder="ID de la entidad..."
            className="flex-1 font-mono"
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => handleRemove(index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={handleAdd}>
        <Plus className="h-3 w-3 mr-1" />
        Añadir referencia
      </Button>
      {field.referenceType && (
        <p className="text-xs text-muted-foreground">
          Tipo: <code className="font-mono bg-muted px-1 rounded">{field.referenceType}</code>
        </p>
      )}
    </div>
  )
}

type ObjectFieldProps = {
  field: EntityFieldDefinition
  value: Record<string, unknown>
  onChange: (value: Record<string, unknown>) => void
  availableEntities?: EntityOption[]
}

function ObjectField({ field, value, onChange, availableEntities }: ObjectFieldProps) {
  const objectFields = field.objectFields ?? []

  const handleFieldChange = (fieldName: string, fieldValue: FieldValue) => {
    onChange({ ...value, [fieldName]: fieldValue })
  }

  return (
    <div className="border rounded-lg p-3 bg-muted/20 space-y-3">
      {objectFields.map((nestedField) => (
        <div key={nestedField.name} className="space-y-1">
          <Label className="text-xs">
            {nestedField.name}
            {!nestedField.optional && <span className="text-destructive ml-0.5">*</span>}
          </Label>
          <FieldRenderer
            field={nestedField}
            value={value[nestedField.name] ?? getDefaultValue(nestedField)}
            onChange={(v) => handleFieldChange(nestedField.name, v)}
            availableEntities={availableEntities}
          />
        </div>
      ))}
    </div>
  )
}

type ObjectArrayFieldProps = {
  field: EntityFieldDefinition
  value: Record<string, unknown>[]
  onChange: (value: Record<string, unknown>[]) => void
  availableEntities?: EntityOption[]
}

function ObjectArrayField({ field, value, onChange, availableEntities }: ObjectArrayFieldProps) {
  const objectFields = field.objectFields ?? []
  const arr = Array.isArray(value) ? value : []

  const handleItemChange = (index: number, newItem: Record<string, unknown>) => {
    const newArr = [...arr]
    newArr[index] = newItem
    onChange(newArr)
  }

  const handleAdd = () => {
    onChange([...arr, createEmptyObject(objectFields)])
  }

  const handleRemove = (index: number) => {
    const newArr = [...arr]
    newArr.splice(index, 1)
    onChange(newArr)
  }

  return (
    <div className="space-y-2">
      {arr.map((item, index) => (
        <div key={index} className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1 right-1 h-6 w-6 text-destructive hover:text-destructive z-10"
            onClick={() => handleRemove(index)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
          <ObjectField
            field={field}
            value={item}
            onChange={(v) => handleItemChange(index, v)}
            availableEntities={availableEntities}
          />
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={handleAdd}>
        <Plus className="h-3 w-3 mr-1" />
        Añadir elemento
      </Button>
    </div>
  )
}

type FieldRendererWrapperProps = {
  field: EntityFieldDefinition
  value: FieldValue
  onChange: (value: FieldValue) => void
  availableEntities?: EntityOption[]
}

function FieldRenderer({ field, value, onChange, availableEntities }: FieldRendererWrapperProps) {
  switch (field.type) {
    case 'string':
      return <StringField field={field} value={value} onChange={onChange} />
    case 'integer':
      return <IntegerField field={field} value={value} onChange={onChange} />
    case 'boolean':
      return <BooleanField field={field} value={value} onChange={onChange} />
    case 'enum':
      return <EnumField field={field} value={value} onChange={onChange} />
    case 'string_array':
      return <ArrayField field={field} value={value} onChange={onChange} itemType="string" />
    case 'integer_array':
      return <ArrayField field={field} value={value} onChange={onChange} itemType="integer" />
    case 'reference':
      return (
        <ReferenceField
          field={field}
          value={value}
          onChange={onChange}
          availableEntities={availableEntities}
        />
      )
    case 'object':
      return (
        <ObjectField
          field={field}
          value={(value as Record<string, unknown>) ?? createEmptyObject(field.objectFields ?? [])}
          onChange={onChange as (v: Record<string, unknown>) => void}
          availableEntities={availableEntities}
        />
      )
    case 'object_array':
      return (
        <ObjectArrayField
          field={field}
          value={(value as Record<string, unknown>[]) ?? []}
          onChange={onChange as (v: Record<string, unknown>[]) => void}
          availableEntities={availableEntities}
        />
      )
    case 'image':
      return <ImageField field={field} value={value} onChange={onChange} />
    case 'dataTable':
      if (!field.rowKey || !field.columns) {
        return (
          <div className="text-sm text-destructive">
            Error: El campo dataTable no tiene configuración válida (falta rowKey o columns).
          </div>
        )
      }
      return (
        <DataTableField
          rowKey={field.rowKey}
          columns={field.columns}
          value={(value as DataTableValue) ?? {}}
          onChange={onChange as (v: DataTableValue) => void}
          availableEntities={availableEntities}
        />
      )
    default:
      return <Input value={String(value)} onChange={(e) => onChange(e.target.value)} />
  }
}

// =============================================================================
// Main EntityInstanceEditor Component
// =============================================================================

export function EntityInstanceEditor({
  schema,
  initialEntity,
  onSave,
  onCancel,
  isModal = false,
  availableEntities,
}: EntityInstanceEditorProps) {
  const [entity, setEntity] = useState<Entity & Record<string, unknown>>(
    initialEntity ?? createEmptyEntity(schema)
  )
  const [autoGenerateId, setAutoGenerateId] = useState(!initialEntity)

  const isEditing = !!initialEntity

  const handleChange = (key: string, value: FieldValue) => {
    const newEntity = { ...entity, [key]: value }

    // Auto-generate ID from name
    if (key === 'name' && autoGenerateId && typeof value === 'string') {
      newEntity.id = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
    }

    setEntity(newEntity)
  }

  const handleSave = () => {
    if (onSave) {
      onSave(entity)
    }
  }

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(entity, null, 2))
  }

  const isValid = entity.id.trim().length > 0 && (entity.name as string)?.trim().length > 0

  const containerClass = isModal ? '' : 'max-w-4xl mx-auto p-4 md:p-8'

  return (
    <div className={containerClass}>
      {/* Header */}
      {!isModal && (
        <header className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="font-mono">{schema.typeName}</Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary">
            {isEditing ? `Editar ${entity.name || 'Entidad'}` : `Nueva ${schema.typeName}`}
          </h1>
          {schema.description && (
            <p className="text-muted-foreground mt-1">{schema.description}</p>
          )}
        </header>
      )}

      <div className="space-y-6">
        {/* Base Fields Card */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Campos base</CardTitle>
            <CardDescription>
              Identificación y metadatos básicos de la entidad
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* ID - always present */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="entity-id">ID *</Label>
                  {!isEditing && (
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <Checkbox
                        id="auto-id"
                        checked={autoGenerateId}
                        onCheckedChange={(checked) => setAutoGenerateId(Boolean(checked))}
                      />
                      <span className="text-xs font-normal">Auto</span>
                    </label>
                  )}
                </div>
                <Input
                  id="entity-id"
                  value={entity.id}
                  onChange={(e) => {
                    setAutoGenerateId(false)
                    handleChange('id', e.target.value)
                  }}
                  placeholder="identificador-unico"
                  className="font-mono"
                  disabled={isEditing}
                />
              </div>

              {/* Name - from searchable addon */}
              {(schema.addons ?? []).includes('searchable') && (
                <div className="space-y-2">
                  <Label htmlFor="entity-name">
                    Nombre *
                    <Badge variant="secondary" className="ml-2 text-xs">searchable</Badge>
                  </Label>
                  <Input
                    id="entity-name"
                    value={String(entity.name ?? '')}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Nombre de la entidad"
                  />
                </div>
              )}

              {/* Description - from searchable addon */}
              {(schema.addons ?? []).includes('searchable') && (
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="entity-desc">
                    Descripción
                    <Badge variant="secondary" className="ml-2 text-xs">searchable</Badge>
                  </Label>
                  <Textarea
                    id="entity-desc"
                    value={String(entity.description ?? '')}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Descripción de la entidad..."
                    className="h-20 resize-none"
                  />
                </div>
              )}

              {/* Tags - from taggable addon */}
              {(schema.addons ?? []).includes('taggable') && (
                <div className="space-y-2 sm:col-span-2">
                  <Label>
                    Tags
                    <Badge variant="secondary" className="ml-2 text-xs">taggable</Badge>
                  </Label>
                  <ArrayField
                    field={{ name: 'tags', type: 'string_array', optional: true }}
                    value={(entity.tags as string[]) ?? []}
                    onChange={(v) => handleChange('tags', v)}
                    itemType="string"
                  />
                </div>
              )}

              {/* Image - from imageable addon */}
              {(schema.addons ?? []).includes('imageable') && (
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="entity-image">
                    Imagen
                    <Badge variant="secondary" className="ml-2 text-xs">imageable</Badge>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="entity-image"
                      value={String(entity.image ?? '')}
                      onChange={(e) => handleChange('image', e.target.value)}
                      placeholder="URL o ruta de la imagen"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setImagePickerOpen(true)}
                    >
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  {entity.image && (
                    <div className="mt-2">
                      <img
                        src={String(entity.image)}
                        alt="Preview"
                        className="h-20 w-20 object-contain rounded border"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24"%3E%3Ctext y="20"%3E❌%3C/text%3E%3C/svg%3E'
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Custom Fields Card */}
        {schema.fields.length > 0 && (
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Campos personalizados</CardTitle>
              <CardDescription>
                Campos específicos de este tipo de entidad
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {schema.fields.map((field) => (
                  <div key={field.name} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`field-${field.name}`}>
                        {field.description || field.name}
                        {!field.optional && <span className="text-destructive ml-0.5">*</span>}
                      </Label>
                      <Badge variant="outline" className="text-xs font-mono">
                        {field.type}
                      </Badge>
                    </div>
                    <FieldRenderer
                      field={field}
                      value={entity[field.name] ?? getDefaultValue(field)}
                      onChange={(v) => handleChange(field.name, v)}
                      availableEntities={availableEntities}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

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
                  {JSON.stringify(entity, null, 2)}
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
            {isEditing ? 'Guardar cambios' : 'Crear entidad'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default EntityInstanceEditor

import type { EntityProvider, Selector } from '@root/core/domain/levels/providers/types'
import type { EntityFilter } from '@root/core/domain/levels/filtering/types'
import type { TestEntity } from '@/data/testEntities'

export type EntitySelectorProps = {
  selectedIds: string[]
  onChange: (ids: string[]) => void
  entityType?: string
  multiple?: boolean
  placeholder?: string
}

export type VariableAutocompleteInputProps = {
  value: string
  onChange: (value: string) => void
  variables: Record<string, number>
  entityVariables?: Record<string, unknown>
  placeholder?: string
  className?: string
  showHelperText?: boolean
}

export type ConditionValueInputProps = {
  value: string
  onChange: (value: string) => void
  fieldValue: string
  variables: Record<string, number>
  entityVariables: Record<string, unknown>
  entityType?: string
  className?: string
}

export type VirtualizedEntityListProps = {
  entities: Array<{ entity: TestEntity; matches: boolean }>
  selectedIds: string[]
  maxSelections: number
  onSelect: (entityId: string, checked: boolean) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  maxHeight?: number
}

export type SelectorPreviewProps = {
  provider: EntityProvider
  variables: Record<string, number>
  onProviderChange?: (provider: EntityProvider) => void
}

export type FilterEditorProps = {
  filter: EntityFilter | undefined
  onChange: (filter: EntityFilter | undefined) => void
  variables: Record<string, number>
  entityType?: string
}

export type VariablesEditorProps = {
  variables: Record<string, number>
  onChange: (variables: Record<string, number>) => void
}

export type SelectorEditorProps = {
  provider: EntityProvider
  variables: Record<string, number>
  onChange: (provider: EntityProvider) => void
  onVariablesChange: (variables: Record<string, number>) => void
}

export type ExampleConfig = {
  id: string
  title: string
  description: string
  provider: EntityProvider
  defaultVariables?: Record<string, number>
}

export type DetailPanelProps = {
  example: ExampleConfig
  provider: EntityProvider
  variables: Record<string, number>
  isEditing: boolean
  onProviderChange: (provider: EntityProvider) => void
  onVariableChange: (key: string, value: number) => void
  onVariablesChange: (variables: Record<string, number>) => void
  onToggleEdit: () => void
}


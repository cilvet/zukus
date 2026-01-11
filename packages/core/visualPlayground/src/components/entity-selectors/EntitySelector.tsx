import { EntitySelector as SharedEntitySelector } from '@/components/shared'
import { testEntitiesAsOptions } from '@/data/testEntities'
import type { EntitySelectorProps } from './types'

export function EntitySelector({ selectedIds, onChange, entityType, multiple = true, placeholder = 'Buscar entidades...' }: EntitySelectorProps) {
  return (
    <SharedEntitySelector
      selectedIds={selectedIds}
      onChange={onChange}
      entities={testEntitiesAsOptions}
      entityType={entityType}
      multiple={multiple}
      placeholder={placeholder}
    />
  )
}


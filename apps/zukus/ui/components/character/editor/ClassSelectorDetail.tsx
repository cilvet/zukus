'use no memo'

import { YStack } from 'tamagui'
import { EntitySelectionView } from '../../../../components/entitySelection'
import type { StandardEntity, EntityInstance, FilterResult } from '@zukus/core'

export type ClassOption = {
  id: string
  name: string
  hitDie: number
}

export type ClassSelectorDetailProps = {
  levelIndex: number
  currentClassId: string | null
  availableClasses: ClassOption[]
  onSelectClass: (classId: string) => void
  onClose: () => void
}

export function ClassSelectorDetail({
  levelIndex,
  currentClassId,
  availableClasses,
  onSelectClass,
  onClose,
}: ClassSelectorDetailProps) {
  const classEntities: StandardEntity[] = availableClasses.map((cls) => ({
    id: cls.id,
    entityType: 'class',
    name: cls.name,
    description: `Dado de Vida: d${cls.hitDie}`,
    tags: [],
  }))

  const selectedEntities: EntityInstance[] = currentClassId
    ? [{
        instanceId: `${currentClassId}@level-${levelIndex}`,
        entity: classEntities.find((e) => e.id === currentClassId) ?? {
          id: currentClassId,
          entityType: 'class',
          name: currentClassId,
          tags: [],
        },
        applicable: true,
        origin: 'custom',
      }]
    : []

  const eligibleEntities: FilterResult<StandardEntity>[] = classEntities.map((entity) => ({
    entity,
    matches: true,
    evaluatedConditions: [],
  }))

  function handleSelect(entityId: string) {
    onSelectClass(entityId)
    onClose()
  }

  return (
    <YStack flex={1}>
      <EntitySelectionView
        entities={classEntities}
        modeConfig={{
          mode: 'selection',
          selectedEntities,
          eligibleEntities,
          onSelect: handleSelect,
          onDeselect: () => {},
          min: 1,
          max: 1,
          selectionLabel: 'Clase',
          instantSelect: true,
        }}
        onEntityPress={() => {}}
        emptyText="No hay clases disponibles"
        resultLabelSingular="clase"
        resultLabelPlural="clases"
      />
    </YStack>
  )
}
